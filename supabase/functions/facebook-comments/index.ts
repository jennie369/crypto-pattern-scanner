/**
 * Facebook Comments Edge Function
 * Fetches comments from Facebook Live videos
 * For GEMRAL AI Livestream
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_URL = 'https://graph.facebook.com';

interface FacebookComment {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
    picture?: {
      data: {
        url: string;
      };
    };
  };
  created_time: string;
  like_count?: number;
  attachment?: object;
}

interface FacebookCommentsResponse {
  data: FacebookComment[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { liveVideoId, accessToken, after, limit = 50 } = await req.json();

    // Validate required fields
    if (!liveVideoId) {
      throw new Error('liveVideoId is required');
    }

    if (!accessToken) {
      throw new Error('accessToken is required');
    }

    // Build Graph API URL
    let url = `${GRAPH_API_URL}/${GRAPH_API_VERSION}/${liveVideoId}/comments`;
    url += `?access_token=${accessToken}`;
    url += `&fields=id,message,from{id,name,picture},created_time,like_count,attachment`;
    url += `&limit=${limit}`;

    // Add cursor for pagination
    if (after) {
      url += `&after=${after}`;
    }

    console.log(`Fetching comments for video: ${liveVideoId}`);

    // Fetch from Facebook Graph API
    const response = await fetch(url);
    const data: FacebookCommentsResponse = await response.json();

    // Check for errors
    if ((data as any).error) {
      console.error('Facebook API error:', (data as any).error);
      throw new Error((data as any).error.message || 'Facebook API error');
    }

    // Transform comments to standard format
    const comments = (data.data || []).map((comment) => ({
      id: comment.id,
      platform: 'facebook',
      platform_user_id: comment.from?.id,
      platform_username: comment.from?.name || 'Facebook User',
      platform_avatar: comment.from?.picture?.data?.url || null,
      message: comment.message,
      created_time: comment.created_time,
      like_count: comment.like_count || 0,
      has_attachment: !!comment.attachment,
    }));

    console.log(`Fetched ${comments.length} comments`);

    return new Response(
      JSON.stringify({
        success: true,
        comments,
        paging: data.paging,
        count: comments.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Facebook comments:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        comments: [],
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
