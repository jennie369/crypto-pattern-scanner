/**
 * Gemral - Auto-Post Scheduler Edge Function
 * Main scheduler chạy mỗi giờ để check và post content theo lịch
 * Triggered by pg_cron or manual invoke
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== TYPES ==========
interface ContentPost {
  id: string;
  title: string;
  content: string;
  content_type: string;
  media_urls: string[];
  thumbnail_url: string | null;
  video_url: string | null;
  hashtags: string[];
  mentions: string[];
  link_url: string | null;
  platform: string;
  scheduled_date: string;
  scheduled_time: string;
  pillar: string | null;
  created_by: string;
}

interface PostResult {
  success: boolean;
  external_post_id?: string;
  external_url?: string;
  error?: string;
  error_code?: string;
}

// ========== CONSTANTS ==========
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Initialize Supabase client with service role
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // ========== GET CURRENT TIME ==========
    const now = new Date();
    // Convert to Vietnam timezone
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const currentHour = vietnamTime.getHours().toString().padStart(2, '0') + ':00:00';
    const today = vietnamTime.toISOString().split('T')[0];

    console.log(`[AutoPostScheduler] Running at ${today} ${currentHour} (Vietnam time)`);

    // ========== QUERY SCHEDULED POSTS ==========
    const { data: posts, error: queryError } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('scheduled_date', today)
      .eq('scheduled_time', currentHour)
      .eq('status', 'scheduled');

    if (queryError) {
      throw new Error(`Query error: ${queryError.message}`);
    }

    if (!posts || posts.length === 0) {
      console.log('[AutoPostScheduler] No posts scheduled for this hour');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Không có bài viết nào được lên lịch',
          processed: 0,
          timestamp: now.toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[AutoPostScheduler] Found ${posts.length} posts to process`);

    // ========== PROCESS EACH POST ==========
    const results: { postId: string; platform: string; success: boolean; error?: string }[] = [];

    for (const post of posts as ContentPost[]) {
      console.log(`[AutoPostScheduler] Processing: ${post.title} -> ${post.platform}`);

      // Update status to 'posting'
      await supabase
        .from('content_calendar')
        .update({ status: 'posting' })
        .eq('id', post.id);

      try {
        // Route to appropriate platform function
        const result = await postToPlatform(post, SUPABASE_SERVICE_KEY);

        if (result.success) {
          // ========== SUCCESS ==========
          await supabase
            .from('content_calendar')
            .update({
              status: 'posted',
              posted_at: new Date().toISOString(),
              external_post_id: result.external_post_id || null,
              error_message: null,
            })
            .eq('id', post.id);

          // Log success
          await supabase.from('auto_post_logs').insert({
            content_id: post.id,
            platform: post.platform,
            action: 'post_created',
            status: 'success',
            external_post_id: result.external_post_id,
            external_url: result.external_url,
            duration_ms: Date.now() - startTime,
            response_data: result,
          });

          results.push({ postId: post.id, platform: post.platform, success: true });
          console.log(`[AutoPostScheduler] Đã đăng thành công: ${post.title}`);
        } else {
          throw new Error(result.error || 'Lỗi không xác định');
        }
      } catch (postError: unknown) {
        // ========== FAILED ==========
        const errorMessage = postError instanceof Error ? postError.message : 'Lỗi không xác định';

        await supabase
          .from('content_calendar')
          .update({
            status: 'failed',
            error_message: errorMessage,
          })
          .eq('id', post.id);

        // Log failure
        await supabase.from('auto_post_logs').insert({
          content_id: post.id,
          platform: post.platform,
          action: 'post_failed',
          status: 'failed',
          error_message: errorMessage,
          duration_ms: Date.now() - startTime,
          retry_count: 0,
          next_retry_at: new Date(Date.now() + 3600000).toISOString(), // Retry in 1 hour
        });

        results.push({ postId: post.id, platform: post.platform, success: false, error: errorMessage });
        console.log(`[AutoPostScheduler] Đăng thất bại: ${post.title} - ${errorMessage}`);
      }
    }

    // ========== RETURN SUMMARY ==========
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Đã xử lý ${posts.length} bài viết`,
        processed: posts.length,
        succeeded: successCount,
        failed: failCount,
        results,
        duration_ms: Date.now() - startTime,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[AutoPostScheduler] Fatal error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ========== HELPER: Route to platform ==========
async function postToPlatform(post: ContentPost, serviceKey: string): Promise<PostResult> {
  const platformFunctions: Record<string, string> = {
    gemral: 'post-to-gemral',
    facebook: 'post-to-facebook',
    youtube: 'post-to-youtube',
    tiktok: 'post-to-tiktok',
    threads: 'post-to-threads',
    instagram: 'post-to-instagram',
  };

  const functionName = platformFunctions[post.platform];

  if (!functionName) {
    return {
      success: false,
      error: `Platform không được hỗ trợ: ${post.platform}`,
      error_code: 'UNKNOWN_PLATFORM',
    };
  }

  // For Gemral, we post directly to the database
  if (post.platform === 'gemral') {
    return await postToGemralDirect(post, serviceKey);
  }

  try {
    const functionUrl = `${SUPABASE_URL}/functions/v1/${functionName}`;
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ post }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}`,
        error_code: result.error_code || 'HTTP_ERROR',
      };
    }

    return result;
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi kết nối',
      error_code: 'NETWORK_ERROR',
    };
  }
}

// ========== HELPER: Post directly to Gemral Feed ==========
async function postToGemralDirect(post: ContentPost, serviceKey: string): Promise<PostResult> {
  try {
    const supabase = createClient(SUPABASE_URL, serviceKey);

    // Map content_type to post_type
    const postTypeMap: Record<string, string> = {
      post: 'text',
      video: 'video',
      short: 'video',
      reel: 'video',
      story: 'story',
      image: 'image',
    };

    // Build feed post data
    const feedPost = {
      user_id: post.created_by,
      content: post.content,
      media_urls: post.media_urls || [],
      hashtags: post.hashtags || [],
      post_type: postTypeMap[post.content_type] || 'text',
      visibility: 'public',
      metadata: {
        source: 'auto_post',
        content_calendar_id: post.id,
        pillar: post.pillar,
        title: post.title,
      },
    };

    // Insert to forum_posts (Gemral Feed)
    const { data, error } = await supabase
      .from('forum_posts')
      .insert(feedPost)
      .select('id')
      .single();

    if (error) {
      console.error('[AutoPostScheduler] Gemral insert error:', error);
      return {
        success: false,
        error: error.message,
        error_code: error.code,
      };
    }

    console.log(`[AutoPostScheduler] Đã đăng lên Gemral Feed với ID: ${data?.id}`);

    return {
      success: true,
      external_post_id: data?.id,
      external_url: `gemral://feed/${data?.id}`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
      error_code: 'INTERNAL_ERROR',
    };
  }
}
