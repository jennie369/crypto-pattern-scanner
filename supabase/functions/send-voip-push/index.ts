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
    // ========== Android: High-priority FCM or Expo ==========
    else if (tokenData.platform === 'android') {
      // Check if token is Expo push token or native FCM token
      // Expo tokens start with 'ExponentPushToken[' and should use Expo API
      // Native FCM tokens are different and should use FCM API
      if (tokenData.token.startsWith('ExponentPushToken[')) {
        console.log('[VoIPPush] Android with Expo token, using Expo push');
        pushResult = await sendExpoPush(tokenData.token, {
          callId,
          callerName,
          callerId,
          callType,
          conversationId,
          callerAvatar,
        });
      } else {
        // Native FCM token - use FCM data messages with high priority
        pushResult = await sendFCMHighPriority(tokenData.token, {
          callId,
          callerName,
          callerId,
          callType,
          conversationId,
          callerAvatar,
        });
      }
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

// ========== FCM High Priority (v1 API with Service Account) ==========

/**
 * Get FCM access token using service account
 */
async function getFCMAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const pemContents = serviceAccount.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    privateKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${signatureB64}`;

  // Exchange JWT for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error(`FCM auth failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function sendFCMHighPriority(
  token: string,
  payload: APNsPayload
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    // Try FCM v1 API with service account first
    const fcmServiceAccountB64 = Deno.env.get('FCM_SERVICE_ACCOUNT');

    if (fcmServiceAccountB64) {
      try {
        const decoded = atob(fcmServiceAccountB64);
        const serviceAccount = JSON.parse(decoded);
        const accessToken = await getFCMAccessToken(serviceAccount);
        const projectId = serviceAccount.project_id;

        // FCM v1 API with fullscreen intent for calls
        const fcmMessage = {
          message: {
            token: token,
            // Data-only message for calls (no notification block)
            // This ensures the app handles it and shows fullscreen call UI
            data: {
              type: 'incoming_call',
              callId: payload.callId,
              callerName: payload.callerName,
              callerId: payload.callerId,
              callType: payload.callType,
              conversationId: payload.conversationId || '',
              callerAvatar: payload.callerAvatar || '',
              timestamp: Date.now().toString(),
              // Flag to show fullscreen UI
              fullscreen: 'true',
            },
            android: {
              priority: 'HIGH',
              ttl: '60s',
              // Direct boot aware - delivered before first unlock
              direct_boot_ok: true,
              // IMPORTANT: For fullscreen call UI on Android
              notification: {
                channel_id: 'incoming_call',
                sound: 'ringtone',
                // Default visibility shows on lock screen
                visibility: 'PUBLIC',
                // Use call category for special handling
                notification_priority: 'PRIORITY_MAX',
              },
            },
          },
        };

        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fcmMessage),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log('[FCM v1] High priority call push sent successfully');
          return { success: true, response: result };
        }

        const error = await response.json();
        console.error('[FCM v1] Error:', error);
        // Fall through to legacy API or Expo
      } catch (e) {
        console.error('[FCM v1] Exception:', e);
      }
    }

    // Fallback to legacy FCM API
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');

    if (!fcmServerKey) {
      console.log('[FCM] No credentials configured, trying Expo push');
      return sendExpoPush(token, payload);
    }

    // Legacy FCM API
    const fcmPayload = {
      to: token,
      priority: 'high',
      time_to_live: 60,
      data: {
        type: 'incoming_call',
        callId: payload.callId,
        callerName: payload.callerName,
        callerId: payload.callerId,
        callType: payload.callType,
        conversationId: payload.conversationId || '',
        callerAvatar: payload.callerAvatar || '',
        timestamp: Date.now().toString(),
        fullscreen: 'true',
      },
      android: {
        priority: 'high',
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
      console.log('[FCM Legacy] High priority push sent successfully');
      return { success: true, response: result };
    } else {
      console.error('[FCM Legacy] Push failed:', result);
      return {
        success: false,
        error: `FCM error: ${JSON.stringify(result.results)}`,
      };
    }
  } catch (error) {
    console.error('[FCM] Exception:', error);
    return { success: false, error: error.message };
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
