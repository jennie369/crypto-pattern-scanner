/**
 * Gemral - Post to Gemral Feed Edge Function
 * Post content to Gemral internal feed (forum_posts)
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
  hashtags: string[];
  mentions: string[];
  pillar: string | null;
  created_by: string;
  link_url: string | null;
}

// ========== CONSTANTS ==========
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { post } = await req.json() as { post: ContentPost };

    if (!post) {
      return new Response(
        JSON.stringify({ success: false, error: 'Thiếu dữ liệu bài viết' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PostToGemral] Đang đăng: ${post.title}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ========== MAP CONTENT TYPE TO POST TYPE ==========
    const postTypeMap: Record<string, string> = {
      post: 'text',
      video: 'video',
      short: 'video',
      reel: 'video',
      story: 'story',
      image: 'image',
    };

    // ========== PREPARE GEMRAL FEED POST ==========
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
        mentions: post.mentions || [],
        link_url: post.link_url,
      },
    };

    // ========== INSERT TO FORUM_POSTS (GEMRAL FEED) ==========
    const { data, error } = await supabase
      .from('forum_posts')
      .insert(feedPost)
      .select('id')
      .single();

    if (error) {
      console.error('[PostToGemral] Insert error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          error_code: error.code,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PostToGemral] Đã đăng thành công với ID: ${data?.id}`);

    // ========== SUCCESS RESPONSE ==========
    return new Response(
      JSON.stringify({
        success: true,
        external_post_id: data?.id,
        external_url: `gemral://feed/${data?.id}`,
        message: 'Đã đăng lên Gemral Feed thành công',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[PostToGemral] Fatal error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định',
        error_code: 'INTERNAL_ERROR',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
