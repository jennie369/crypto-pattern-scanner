/**
 * LiveKit Token Edge Function
 * Generates JWT tokens for LiveKit WebRTC connections
 * For GEMRAL AI Livestream
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// LiveKit configuration from environment variables
const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY') || '';
const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET') || '';

interface TokenRequest {
  roomName: string;
  participantName: string;
  isHost?: boolean;
  ttl?: number; // Time to live in seconds
}

interface VideoGrant {
  room?: string;
  roomJoin?: boolean;
  roomCreate?: boolean;
  roomList?: boolean;
  roomRecord?: boolean;
  roomAdmin?: boolean;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  hidden?: boolean;
  recorder?: boolean;
}

interface ClaimGrant {
  video?: VideoGrant;
  metadata?: string;
}

async function generateToken(
  roomName: string,
  participantName: string,
  isHost: boolean,
  ttlSeconds: number
): Promise<string> {
  // Create video grants based on role
  const videoGrant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canSubscribe: true,
  };

  if (isHost) {
    // Host permissions
    videoGrant.canPublish = true;
    videoGrant.canPublishData = true;
    videoGrant.roomCreate = true;
    videoGrant.roomAdmin = true;
  } else {
    // Viewer permissions
    videoGrant.canPublish = false;
    videoGrant.canPublishData = true; // Allow chat
  }

  // Create claims
  const claims = {
    exp: getNumericDate(ttlSeconds),
    iss: LIVEKIT_API_KEY,
    nbf: getNumericDate(0),
    sub: participantName,
    video: videoGrant,
    metadata: JSON.stringify({
      isHost,
      joinedAt: new Date().toISOString(),
    }),
  };

  // Generate JWT
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(LIVEKIT_API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  );

  const token = await create({ alg: 'HS256', typ: 'JWT' }, claims, key);

  return token;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check if LiveKit is configured
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      console.warn('LiveKit not configured, returning mock token');
      return new Response(
        JSON.stringify({
          success: true,
          token: 'mock-token-' + Date.now(),
          warning: 'LiveKit not configured',
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { roomName, participantName, isHost = false, ttl = 3600 }: TokenRequest = await req.json();

    // Validate required fields
    if (!roomName) {
      throw new Error('roomName is required');
    }

    if (!participantName) {
      throw new Error('participantName is required');
    }

    console.log(`Generating token for ${participantName} in room ${roomName} (isHost: ${isHost})`);

    // Generate token
    const token = await generateToken(roomName, participantName, isHost, ttl);

    return new Response(
      JSON.stringify({
        success: true,
        token,
        roomName,
        participantName,
        isHost,
        expiresIn: ttl,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating LiveKit token:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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
