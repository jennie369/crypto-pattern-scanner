/**
 * Facebook Live Verify Edge Function
 * Verifies Facebook access token and gets live video info
 * For GEMRAL AI Livestream
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_URL = 'https://graph.facebook.com';

interface LiveVideoInfo {
  id: string;
  title?: string;
  status: string;
  live_views?: number;
  broadcast_start_time?: string;
  description?: string;
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

    // Build Graph API URL to get live video info
    const url = `${GRAPH_API_URL}/${GRAPH_API_VERSION}/${liveVideoId}`;
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'id,title,status,live_views,broadcast_start_time,description',
    });

    console.log(`Verifying live video: ${liveVideoId}`);

    // Fetch from Facebook Graph API
    const response = await fetch(`${url}?${params}`);
    const data: LiveVideoInfo = await response.json();

    // Check for errors
    if ((data as any).error) {
      console.error('Facebook API error:', (data as any).error);
      throw new Error((data as any).error.message || 'Facebook API error');
    }

    console.log(`Live video status: ${data.status}`);

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        title: data.title,
        status: data.status,
        live_views: data.live_views || 0,
        broadcast_start_time: data.broadcast_start_time,
        description: data.description,
        is_live: data.status === 'LIVE',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error verifying Facebook live:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        is_live: false,
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
