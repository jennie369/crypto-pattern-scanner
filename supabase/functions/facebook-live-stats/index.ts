/**
 * Facebook Live Stats Edge Function
 * Fetches live video statistics (viewers, reactions, shares)
 * For GEMRAL AI Livestream
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_URL = 'https://graph.facebook.com';

interface LiveVideoStats {
  id: string;
  live_views?: number;
  reactions?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { liveVideoId, accessToken } = await req.json();

    // Validate required fields
    if (!liveVideoId) {
      throw new Error('liveVideoId is required');
    }

    if (!accessToken) {
      throw new Error('accessToken is required');
    }

    // Build Graph API URL to get live video stats
    const url = `${GRAPH_API_URL}/${GRAPH_API_VERSION}/${liveVideoId}`;
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'id,live_views,reactions.summary(total_count),shares,comments.summary(total_count)',
    });

    console.log(`Fetching stats for live video: ${liveVideoId}`);

    // Fetch from Facebook Graph API
    const response = await fetch(`${url}?${params}`);
    const data: LiveVideoStats = await response.json();

    // Check for errors
    if ((data as any).error) {
      console.error('Facebook API error:', (data as any).error);
      throw new Error((data as any).error.message || 'Facebook API error');
    }

    const stats = {
      live_views: data.live_views || 0,
      reactions_count: data.reactions?.summary?.total_count || 0,
      shares_count: data.shares?.count || 0,
      comments_count: data.comments?.summary?.total_count || 0,
    };

    console.log(`Stats: ${JSON.stringify(stats)}`);

    return new Response(
      JSON.stringify({
        success: true,
        ...stats,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Facebook live stats:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        live_views: 0,
        reactions_count: 0,
        shares_count: 0,
        comments_count: 0,
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
