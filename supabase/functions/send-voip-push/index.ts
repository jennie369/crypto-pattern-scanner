/**
 * Send VoIP Push Notification
 *
 * This Edge Function sends VoIP push notifications for incoming calls:
 * - iOS: Uses Apple Push Notification service (APNs) with PushKit (VoIP push)
 * - Android: Uses FCM with high priority data message
 *
 * VoIP pushes are special because they:
 * - Wake the app even when killed (iOS)
 * - Trigger the native call UI immediately
 * - Have higher delivery priority than regular push
 *
 * Required Environment Variables:
 * - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-provided)
 * - APNS_KEY_ID: Key ID from Apple Developer Portal
 * - APNS_TEAM_ID: Your Apple Team ID
 * - APNS_KEY_P8: Base64 encoded .p8 key content
 * - IOS_BUNDLE_ID: Your app bundle identifier
 * - FCM_SERVER_KEY: Firebase Cloud Messaging server key
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoIPPushRequest {
  callId: string;
  calleeId: string;
  callerName: string;
  callerId: string;
  callType: 'audio' | 'video';
  conversationId?: string;
  callerAvatar?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      callId,
      calleeId,
      callerName,
      callerId,
      callType,
      conversationId,
      callerAvatar,
    }: VoIPPushRequest = await req.json();

    // Validate required fields
    if (!callId || !calleeId || !callerName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: callId, calleeId, callerName' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('[VoIPPush] Sending push for call:', {
      callId,
      calleeId,
      callerName,
      callType,
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get callee's push tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_push_tokens')
      .select('token, voip_token, platform')
      .eq('user_id', calleeId)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      console.log('[VoIPPush] No token found for user:', calleeId, tokenError?.message);
      return new Response(
        JSON.stringify({ error: 'No push token found for user', details: tokenError?.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('[VoIPPush] Found token for platform:', tokenData.platform);

    let pushResult: { success: boolean; response?: any; error?: string };

    // ========== iOS: VoIP Push via APNs ==========
    if (tokenData.platform === 'ios') {
      const voipToken = tokenData.voip_token;

      if (!voipToken) {
        console.log('[VoIPPush] No VoIP token for iOS user, falling back to regular push');
        // Fallback to regular push notification
        pushResult = await sendExpoPush(tokenData.token, {
          callId,
          callerName,
          callerId,
          callType,
          conversationId,
          callerAvatar,
        });
      } else {
        // Send VoIP push via APNs
        pushResult = await sendAPNsVoIPPush(voipToken, {
          callId,
          callerName,
          callerId,
          callType,
          conversationId,
          callerAvatar,
        });
      }
    }
    // ========== Android: High-priority FCM ==========
    else if (tokenData.platform === 'android') {
      // Android uses FCM data messages with high priority
      pushResult = await sendFCMHighPriority(tokenData.token, {
        callId,
        callerName,
        callerId,
        callType,
        conversationId,
        callerAvatar,
      });
    }
    // ========== Unknown platform ==========
    else {
      // Try Expo push as fallback
      pushResult = await sendExpoPush(tokenData.token, {
        callId,
        callerName,
        callerId,
        callType,
        conversationId,
        callerAvatar,
      });
    }

    console.log('[VoIPPush] Push result:', pushResult);

    return new Response(
      JSON.stringify({
        success: pushResult.success,
        platform: tokenData.platform,
        response: pushResult.response,
        error: pushResult.error,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: pushResult.success ? 200 : 500,
      }
    );
  } catch (error) {
    console.error('[VoIPPush] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// ========== APNs VoIP Push ==========

interface APNsPayload {
  callId: string;
  callerName: string;
  callerId: string;
  callType: string;
  conversationId?: string;
  callerAvatar?: string;
}

async function sendAPNsVoIPPush(
  voipToken: string,
  payload: APNsPayload
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    const teamId = Deno.env.get('APNS_TEAM_ID');
    const keyId = Deno.env.get('APNS_KEY_ID');
    const keyP8 = Deno.env.get('APNS_KEY_P8'); // Base64 encoded .p8 key
    const bundleId = Deno.env.get('IOS_BUNDLE_ID') || 'com.gemral.mobile';

    if (!teamId || !keyId || !keyP8) {
      console.log('[APNs] Missing credentials, falling back');
      return { success: false, error: 'APNs credentials not configured' };
    }

    // Decode the P8 key
    const keyPem = atob(keyP8);

    // Generate JWT for APNs
    const jwt = await generateAPNsJWT(teamId, keyId, keyPem);

    // VoIP push payload
    // Note: VoIP pushes on iOS 13+ MUST report to CallKit within the push handler
    const apnsPayload = {
      aps: {
        alert: {
          title: 'Cuộc gọi đến',
          body: `${payload.callerName} đang gọi cho bạn`,
        },
        sound: 'default',
        'content-available': 1,
      },
      // Custom data for our app
      callId: payload.callId,
      callerName: payload.callerName,
      callerId: payload.callerId,
      callType: payload.callType,
      conversationId: payload.conversationId,
      callerAvatar: payload.callerAvatar,
      type: 'incoming_call',
    };

    // Use production APNs for released apps
    const apnsHost = Deno.env.get('APNS_USE_SANDBOX') === 'true'
      ? 'api.sandbox.push.apple.com'
      : 'api.push.apple.com';

    // Send to APNs
    const response = await fetch(`https://${apnsHost}/3/device/${voipToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${jwt}`,
        'apns-topic': `${bundleId}.voip`, // VoIP topic has .voip suffix
        'apns-push-type': 'voip',
        'apns-priority': '10', // High priority
        'apns-expiration': '0', // Immediate delivery only
      },
      body: JSON.stringify(apnsPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[APNs] Error:', response.status, errorText);
      return {
        success: false,
        error: `APNs error: ${response.status} ${errorText}`,
      };
    }

    const apnsId = response.headers.get('apns-id');
    console.log('[APNs] VoIP push sent successfully, apns-id:', apnsId);

    return {
      success: true,
      response: { apnsId },
    };
  } catch (error) {
    console.error('[APNs] Exception:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Generate JWT for APNs authentication
async function generateAPNsJWT(
  teamId: string,
  keyId: string,
  keyPem: string
): Promise<string> {
  const header = {
    alg: 'ES256',
    kid: keyId,
  };

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: teamId,
    iat: now,
  };

  // Encode header and claims
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaims = base64UrlEncode(JSON.stringify(claims));
  const signingInput = `${encodedHeader}.${encodedClaims}`;

  // Import the P8 key and sign
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(keyPem),
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256',
    },
    key,
    new TextEncoder().encode(signingInput)
  );

  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${signingInput}.${encodedSignature}`;
}

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Remove PEM header/footer and newlines
  const b64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ========== FCM High Priority ==========

async function sendFCMHighPriority(
  token: string,
  payload: APNsPayload
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');

    if (!fcmServerKey) {
      console.log('[FCM] No server key configured, trying Expo push');
      return sendExpoPush(token, payload);
    }

    // FCM data-only message with high priority for call
    // Data-only messages can wake the app and trigger background processing
    const fcmPayload = {
      to: token,
      priority: 'high',
      // Time to live: 60 seconds (call should be immediate)
      time_to_live: 60,
      // Data message - will trigger onMessage even in background
      data: {
        type: 'incoming_call',
        callId: payload.callId,
        callerName: payload.callerName,
        callerId: payload.callerId,
        callType: payload.callType,
        conversationId: payload.conversationId || '',
        callerAvatar: payload.callerAvatar || '',
        // Timestamp to help with deduplication
        timestamp: Date.now().toString(),
      },
      // Android-specific options
      android: {
        priority: 'high',
        // Direct boot aware - can be delivered before first unlock
        direct_boot_ok: true,
      },
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${fcmServerKey}`,
      },
      body: JSON.stringify(fcmPayload),
    });

    const result = await response.json();

    if (result.success === 1) {
      console.log('[FCM] High priority push sent successfully');
      return {
        success: true,
        response: result,
      };
    } else {
      console.error('[FCM] Push failed:', result);
      return {
        success: false,
        error: `FCM error: ${JSON.stringify(result.results)}`,
      };
    }
  } catch (error) {
    console.error('[FCM] Exception:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ========== Expo Push Fallback ==========

async function sendExpoPush(
  token: string,
  payload: APNsPayload
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    // Check if it's an Expo push token
    if (!token.startsWith('ExponentPushToken[')) {
      return {
        success: false,
        error: 'Not an Expo push token',
      };
    }

    const message = {
      to: token,
      title: 'Cuộc gọi đến',
      body: `${payload.callerName} đang gọi cho bạn`,
      sound: 'default',
      priority: 'high',
      channelId: 'incoming_call',
      data: {
        type: 'incoming_call',
        callId: payload.callId,
        callerName: payload.callerName,
        callerId: payload.callerId,
        callType: payload.callType,
        conversationId: payload.conversationId,
        callerAvatar: payload.callerAvatar,
      },
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (result.data?.status === 'ok') {
      console.log('[Expo Push] Sent successfully');
      return {
        success: true,
        response: result,
      };
    } else {
      console.error('[Expo Push] Failed:', result);
      return {
        success: false,
        error: `Expo push error: ${JSON.stringify(result)}`,
      };
    }
  } catch (error) {
    console.error('[Expo Push] Exception:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
