/**
 * Gemral - Paper Trade Push Notification
 * Send push notifications via FCM (Android) and APNs (iOS)
 * For paper trading events: order filled, TP/SL hit, liquidation
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Notification types
type NotificationType =
  | 'order_placed'
  | 'order_filled'
  | 'order_cancelled'
  | 'tp_hit'
  | 'sl_hit'
  | 'position_closed'
  | 'liquidation_warning'
  | 'liquidation';

interface PushPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════
// JWT HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Create JWT for FCM v1 API authentication
 */
async function createFCMJwt(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key and sign
  const privateKey = await importPrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    privateKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

/**
 * Create JWT for APNs authentication
 */
async function createAPNsJwt(keyId: string, teamId: string, privateKeyP8: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'ES256',
    kid: keyId,
  };

  const payload = {
    iss: teamId,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import ECDSA key and sign
  const privateKey = await importECPrivateKey(privateKeyP8);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    encoder.encode(unsignedToken)
  );

  // Convert signature from DER to raw format for APNs
  const rawSignature = derToRaw(new Uint8Array(signature));
  const signatureB64 = base64UrlEncode(rawSignature);
  return `${unsignedToken}.${signatureB64}`;
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(data: Uint8Array): string {
  const base64 = base64Encode(data);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Import RSA private key (for FCM)
 */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/**
 * Import ECDSA private key (for APNs)
 */
async function importECPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

/**
 * Convert DER signature to raw format (for APNs ES256)
 */
function derToRaw(signature: Uint8Array): Uint8Array {
  // DER format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  const raw = new Uint8Array(64);

  let offset = 2; // Skip 0x30 and total length

  // Read R
  if (signature[offset] !== 0x02) {
    throw new Error('Invalid DER signature');
  }
  offset++;
  const rLen = signature[offset++];
  let rStart = offset;
  if (signature[rStart] === 0x00) {
    rStart++;
  }
  const rBytes = signature.slice(rStart, offset + rLen);
  raw.set(rBytes, 32 - rBytes.length);
  offset += rLen;

  // Read S
  if (signature[offset] !== 0x02) {
    throw new Error('Invalid DER signature');
  }
  offset++;
  const sLen = signature[offset++];
  let sStart = offset;
  if (signature[sStart] === 0x00) {
    sStart++;
  }
  const sBytes = signature.slice(sStart, offset + sLen);
  raw.set(sBytes, 64 - sBytes.length);

  return raw;
}

// ═══════════════════════════════════════════════════════════
// FCM (ANDROID)
// ═══════════════════════════════════════════════════════════

/**
 * Get FCM access token
 */
async function getFCMAccessToken(serviceAccount: any): Promise<string> {
  const jwt = await createFCMJwt(serviceAccount);

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

/**
 * Send FCM notification (Android)
 */
async function sendFCM(
  token: string,
  title: string,
  body: string,
  data: Record<string, unknown>,
  serviceAccount: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getFCMAccessToken(serviceAccount);
    const projectId = serviceAccount.project_id;

    const message = {
      message: {
        token: token,
        notification: {
          title: title,
          body: body,
        },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        android: {
          priority: 'high',
          notification: {
            channel_id: 'paper_trade',
            sound: 'default',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
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
        body: JSON.stringify(message),
      }
    );

    if (response.ok) {
      return { success: true };
    }

    const error = await response.json();
    console.error('[FCM] Error:', error);
    return { success: false, error: error.error?.message || 'FCM send failed' };
  } catch (error: any) {
    console.error('[FCM] Exception:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// APNs (iOS)
// ═══════════════════════════════════════════════════════════

/**
 * Send APNs notification (iOS)
 */
async function sendAPNs(
  deviceToken: string,
  title: string,
  body: string,
  data: Record<string, unknown>,
  keyId: string,
  teamId: string,
  privateKeyP8: string,
  bundleId: string,
  isProduction: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const jwt = await createAPNsJwt(keyId, teamId, privateKeyP8);

    const host = isProduction
      ? 'api.push.apple.com'
      : 'api.sandbox.push.apple.com';

    const payload = {
      aps: {
        alert: {
          title: title,
          body: body,
        },
        sound: 'default',
        badge: 1,
        'mutable-content': 1,
      },
      ...data,
    };

    const response = await fetch(
      `https://${host}/3/device/${deviceToken}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${jwt}`,
          'apns-topic': bundleId,
          'apns-push-type': 'alert',
          'apns-priority': '10',
          'apns-expiration': '0',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok || response.status === 200) {
      return { success: true };
    }

    const errorBody = await response.text();
    console.error('[APNs] Error:', response.status, errorBody);
    return { success: false, error: `APNs ${response.status}: ${errorBody}` };
  } catch (error: any) {
    console.error('[APNs] Exception:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// EXPO FALLBACK
// ═══════════════════════════════════════════════════════════

/**
 * Send via Expo Push API (fallback for ExponentPushToken)
 */
async function sendExpo(
  token: string,
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
        channelId: 'paper_trade',
      }),
    });

    const result = await response.json();
    if (result.data?.status === 'ok') {
      return { success: true };
    }

    return { success: false, error: result.data?.message || 'Expo send failed' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get secrets
    const fcmServiceAccountB64 = Deno.env.get('FCM_SERVICE_ACCOUNT');
    const apnsKeyId = Deno.env.get('APNS_KEY_ID');
    const apnsTeamId = Deno.env.get('APNS_TEAM_ID');
    const apnsKeyP8B64 = Deno.env.get('APNS_KEY_P8');
    const iosBundleId = Deno.env.get('IOS_BUNDLE_ID') || 'com.gemral.mobile';

    // Decode FCM service account
    let fcmServiceAccount: any = null;
    if (fcmServiceAccountB64) {
      try {
        const decoded = atob(fcmServiceAccountB64);
        fcmServiceAccount = JSON.parse(decoded);
      } catch (e) {
        console.error('[PaperTradePush] Failed to decode FCM service account');
      }
    }

    // Decode APNs key
    let apnsKeyP8: string | null = null;
    if (apnsKeyP8B64) {
      try {
        apnsKeyP8 = atob(apnsKeyP8B64);
      } catch (e) {
        console.error('[PaperTradePush] Failed to decode APNs key');
      }
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const payload: PushPayload = await req.json();
    const { userId, type, title, body, data = {} } = payload;

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PaperTradePush] Sending ${type} to user ${userId}`);

    // Get user's push tokens
    const { data: tokens } = await supabase
      .from('user_push_tokens')
      .select('push_token, device_type, platform')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Also check profiles.expo_push_token as fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('id', userId)
      .single();

    const allTokens: Array<{ token: string; platform: string }> = [];

    // Add tokens from user_push_tokens table
    if (tokens) {
      tokens.forEach((t) => {
        if (t.push_token) {
          allTokens.push({
            token: t.push_token,
            platform: t.platform || (t.push_token.startsWith('ExponentPushToken') ? 'expo' : 'unknown'),
          });
        }
      });
    }

    // Add expo token from profile if not already included
    if (profile?.expo_push_token) {
      const exists = allTokens.some((t) => t.token === profile.expo_push_token);
      if (!exists) {
        allTokens.push({ token: profile.expo_push_token, platform: 'expo' });
      }
    }

    if (allTokens.length === 0) {
      console.log(`[PaperTradePush] No push tokens for user ${userId}`);
      return new Response(
        JSON.stringify({ success: false, error: 'No push tokens found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PaperTradePush] Found ${allTokens.length} tokens`);

    // Send to all tokens
    let successCount = 0;
    let failCount = 0;
    const results: any[] = [];

    for (const { token, platform } of allTokens) {
      let result: { success: boolean; error?: string };

      // Determine how to send based on token format
      if (token.startsWith('ExponentPushToken')) {
        // Expo token
        result = await sendExpo(token, title, body, { ...data, type });
      } else if (platform === 'ios' || token.length === 64) {
        // APNs token (64 hex characters)
        if (apnsKeyId && apnsTeamId && apnsKeyP8) {
          result = await sendAPNs(
            token, title, body, { ...data, type },
            apnsKeyId, apnsTeamId, apnsKeyP8, iosBundleId
          );
        } else {
          result = { success: false, error: 'APNs not configured' };
        }
      } else {
        // FCM token
        if (fcmServiceAccount) {
          result = await sendFCM(token, title, body, { ...data, type }, fcmServiceAccount);
        } else {
          result = { success: false, error: 'FCM not configured' };
        }
      }

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      results.push({ token: token.substring(0, 20) + '...', ...result });
    }

    // Log notification history
    await supabase.from('paper_trade_notification_history').insert({
      user_id: userId,
      type,
      title,
      body,
      data,
      push_status: successCount > 0 ? 'sent' : 'failed',
    });

    console.log(`[PaperTradePush] Complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        sent: successCount,
        failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[PaperTradePush] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
