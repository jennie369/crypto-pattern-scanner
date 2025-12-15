/**
 * Gemral - Broadcast Notification Edge Function
 * Send push notifications to all users via Expo Push API
 * ADMIN ONLY - Called from AdminNotificationsScreen
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header to verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'ADMIN' && !profile.is_admin)) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { notification_id, title, body, target_audience = 'all' } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[BroadcastNotification] Sending to audience: ${target_audience}`);

    // Get push tokens based on target audience
    let tokensQuery = supabase
      .from('user_push_tokens')
      .select('push_token, user_id')
      .eq('is_active', true);

    if (target_audience === 'premium') {
      // Join with profiles to filter premium users
      const { data: premiumUsers } = await supabase
        .from('profiles')
        .select('id')
        .or('scanner_tier.in.(PRO,PREMIUM,VIP),chatbot_tier.in.(PRO,PREMIUM,VIP)');

      const premiumIds = premiumUsers?.map(u => u.id) || [];

      tokensQuery = tokensQuery.in('user_id', premiumIds);
    } else if (target_audience === 'free') {
      const { data: freeUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('scanner_tier', 'FREE')
        .eq('chatbot_tier', 'FREE');

      const freeIds = freeUsers?.map(u => u.id) || [];
      tokensQuery = tokensQuery.in('user_id', freeIds);
    }

    const { data: tokens, error: tokensError } = await tokensQuery;

    if (tokensError) {
      console.error('[BroadcastNotification] Tokens query error:', tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to get push tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log('[BroadcastNotification] No tokens found');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No push tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[BroadcastNotification] Found ${tokens.length} tokens`);

    // Prepare push messages
    const messages: PushMessage[] = tokens.map(t => ({
      to: t.push_token,
      title: `🔔 ${title}`,
      body: body,
      data: {
        type: 'system_broadcast',
        notification_id: notification_id,
      },
      sound: 'default',
      channelId: 'alerts',
    }));

    // Send in batches of 100 (Expo limit)
    const BATCH_SIZE = 100;
    let successCount = 0;
    let failCount = 0;
    const invalidTokens: string[] = [];

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);

      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });

        const result = await response.json();

        if (result.data) {
          result.data.forEach((ticket: any, index: number) => {
            if (ticket.status === 'ok') {
              successCount++;
            } else {
              failCount++;
              if (ticket.details?.error === 'DeviceNotRegistered') {
                invalidTokens.push(batch[index].to);
              }
            }
          });
        }
      } catch (batchError) {
        console.error('[BroadcastNotification] Batch send error:', batchError);
        failCount += batch.length;
      }
    }

    // Deactivate invalid tokens
    if (invalidTokens.length > 0) {
      await supabase
        .from('user_push_tokens')
        .update({ is_active: false })
        .in('push_token', invalidTokens);

      console.log(`[BroadcastNotification] Deactivated ${invalidTokens.length} invalid tokens`);
    }

    // Update notification record with sent count
    if (notification_id) {
      await supabase
        .from('system_notifications')
        .update({
          sent_count: successCount,
          status: failCount > 0 && successCount === 0 ? 'failed' : 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', notification_id);
    }

    console.log(`[BroadcastNotification] Sent: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        invalidTokensRemoved: invalidTokens.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[BroadcastNotification] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
