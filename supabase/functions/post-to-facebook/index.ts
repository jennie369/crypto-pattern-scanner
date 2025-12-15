/**
 * Gemral - Post to Facebook Page Edge Function
 * Post content to Facebook Page via Graph API
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
  video_url: string | null;
  hashtags: string[];
}

// ========== CONSTANTS ==========
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FB_GRAPH_API = 'https://graph.facebook.com/v18.0';

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

    console.log(`[PostToFacebook] Đang đăng: ${post.title}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ========== GET FACEBOOK CREDENTIALS ==========
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('access_token, page_id, is_connected')
      .eq('platform', 'facebook')
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Facebook chưa được kết nối',
          error_code: 'NOT_CONNECTED',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!connection.is_connected || !connection.access_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Kết nối Facebook không hợp lệ',
          error_code: 'INVALID_CONNECTION',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token, page_id } = connection;

    // ========== PREPARE MESSAGE ==========
    const hashtagString = post.hashtags.length > 0
      ? '\n\n' + post.hashtags.map((h) => `#${h.replace(/^#/, '')}`).join(' ')
      : '';
    const message = post.content + hashtagString;

    let result: { success: boolean; external_post_id?: string; external_url?: string; error?: string; error_code?: string };

    // ========== POST BASED ON CONTENT TYPE ==========
    if (post.content_type === 'video' && post.video_url) {
      // Video post
      result = await postFacebookVideo(page_id, access_token, message, post.video_url);
    } else if (post.media_urls && post.media_urls.length > 0) {
      // Photo post
      result = await postFacebookPhoto(page_id, access_token, message, post.media_urls[0]);
    } else {
      // Text post
      result = await postFacebookText(page_id, access_token, message);
    }

    if (!result.success) {
      return new Response(
        JSON.stringify(result),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last_used_at
    await supabase
      .from('platform_connections')
      .update({ last_used_at: new Date().toISOString() })
      .eq('platform', 'facebook');

    console.log(`[PostToFacebook] Đã đăng thành công với ID: ${result.external_post_id}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[PostToFacebook] Fatal error:', error);

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

// ========== HELPER: Post text ==========
async function postFacebookText(pageId: string, accessToken: string, message: string) {
  const url = `${FB_GRAPH_API}/${pageId}/feed`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      access_token: accessToken,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    return {
      success: false,
      error: data.error?.message || 'Đăng bài thất bại',
      error_code: data.error?.code?.toString() || 'FB_ERROR',
    };
  }

  return {
    success: true,
    external_post_id: data.id,
    external_url: `https://facebook.com/${data.id}`,
  };
}

// ========== HELPER: Post photo ==========
async function postFacebookPhoto(pageId: string, accessToken: string, message: string, photoUrl: string) {
  const url = `${FB_GRAPH_API}/${pageId}/photos`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      url: photoUrl,
      access_token: accessToken,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    return {
      success: false,
      error: data.error?.message || 'Đăng ảnh thất bại',
      error_code: data.error?.code?.toString() || 'FB_ERROR',
    };
  }

  return {
    success: true,
    external_post_id: data.post_id || data.id,
    external_url: `https://facebook.com/${data.post_id || data.id}`,
  };
}

// ========== HELPER: Post video ==========
async function postFacebookVideo(pageId: string, accessToken: string, description: string, videoUrl: string) {
  const url = `${FB_GRAPH_API}/${pageId}/videos`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description,
      file_url: videoUrl,
      access_token: accessToken,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    return {
      success: false,
      error: data.error?.message || 'Đăng video thất bại',
      error_code: data.error?.code?.toString() || 'FB_ERROR',
    };
  }

  return {
    success: true,
    external_post_id: data.id,
    external_url: `https://facebook.com/${data.id}`,
  };
}
