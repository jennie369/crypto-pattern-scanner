/**
 * Gemral - Send Push Notification Edge Function
 * Send push notifications via Expo Push API with logging
 * Used by notification-scheduler and admin PushEditorScreen
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  notificationId: string;
  notification: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };
  tokens: string[];
  userIds: string[];
  abVariant?: string;
}

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

interface NotificationLog {
  notification_id: string;
  user_id: string;
  expo_ticket_id?: string;
  status: 'sent' | 'failed' | 'error';
  error_message?: string;
  error_code?: string;
  ab_variant?: string;
  device_type?: string;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const payload: NotificationPayload = await req.json();
    const { notificationId, notification, tokens, userIds, abVariant } = payload;

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No tokens provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SendPushNotification] Sending ${tokens.length} notifications for ${notificationId}`);

    // Update notification status to 'sending'
    if (notificationId) {
      await supabase
        .from('notification_schedule')
        .update({ status: 'sending' })
        .eq('id', notificationId);
    }

    // Build push messages
    const messages: PushMessage[] = tokens.map((token) => ({
      to: token,
      title: notification.title,
      body: notification.body,
      data: {
        ...notification.data,
        notification_id: notificationId,
        ab_variant: abVariant,
      },
      sound: 'default',
      badge: 1,
      channelId: 'default',
    }));

    // Send in batches of 100 (Expo limit)
    const BATCH_SIZE = 100;
    let totalSent = 0;
    let totalFailed = 0;
    const logs: NotificationLog[] = [];
    const invalidTokens: string[] = [];

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      const batchUserIds = userIds.slice(i, i + BATCH_SIZE);

      try {
        // Build headers - add Expo Access Token if available (for production)
        const expoHeaders: Record<string, string> = {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        };

        // Add authentication if EXPO_ACCESS_TOKEN is set
        const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
        if (expoAccessToken) {
          expoHeaders['Authorization'] = `Bearer ${expoAccessToken}`;
        }

        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: expoHeaders,
          body: JSON.stringify(batch),
        });

        const result = await response.json();

        if (result.data) {
          result.data.forEach((ticket: any, index: number) => {
            const userId = batchUserIds[index];
            const now = new Date().toISOString();

            if (ticket.status === 'ok') {
              totalSent++;
              logs.push({
                notification_id: notificationId,
                user_id: userId,
                expo_ticket_id: ticket.id,
                status: 'sent',
                ab_variant: abVariant,
                created_at: now,
              });
            } else {
              totalFailed++;
              logs.push({
                notification_id: notificationId,
                user_id: userId,
                status: 'failed',
                error_message: ticket.message,
                error_code: ticket.details?.error,
                ab_variant: abVariant,
                created_at: now,
              });

              // Track invalid tokens for cleanup
              if (ticket.details?.error === 'DeviceNotRegistered') {
                invalidTokens.push(batch[index].to);
              }
            }
          });
        }
      } catch (batchError: any) {
        console.error('[SendPushNotification] Batch error:', batchError);
        // Log all batch items as failed
        batchUserIds.forEach((userId) => {
          totalFailed++;
          logs.push({
            notification_id: notificationId,
            user_id: userId,
            status: 'error',
            error_message: batchError.message || 'Batch send failed',
            ab_variant: abVariant,
            created_at: new Date().toISOString(),
          });
        });
      }
    }

    // Bulk insert logs
    if (logs.length > 0) {
      const { error: logsError } = await supabase
        .from('notification_logs')
        .insert(logs);

      if (logsError) {
        console.error('[SendPushNotification] Logs insert error:', logsError);
      }
    }

    // Deactivate invalid tokens
    if (invalidTokens.length > 0) {
      // Update user_push_tokens
      await supabase
        .from('user_push_tokens')
        .update({ is_active: false })
        .in('push_token', invalidTokens);

      // Clear from profiles
      await supabase
        .from('profiles')
        .update({ expo_push_token: null })
        .in('expo_push_token', invalidTokens);

      console.log(`[SendPushNotification] Deactivated ${invalidTokens.length} invalid tokens`);
    }

    // Update notification schedule with results
    if (notificationId) {
      await supabase
        .from('notification_schedule')
        .update({
          status: totalFailed > 0 && totalSent === 0 ? 'failed' : 'sent',
          sent_at: new Date().toISOString(),
          total_sent: totalSent,
          total_failed: totalFailed,
          total_delivered: totalSent, // Will be updated by receipt checker
        })
        .eq('id', notificationId);

      // Update template usage if template was used
      const { data: notification } = await supabase
        .from('notification_schedule')
        .select('template_id')
        .eq('id', notificationId)
        .single();

      if (notification?.template_id) {
        await supabase.rpc('increment_template_usage', {
          p_template_id: notification.template_id,
        });
      }
    }

    console.log(`[SendPushNotification] Complete: ${totalSent} sent, ${totalFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        totalSent,
        totalFailed,
        invalidTokensRemoved: invalidTokens.length,
        message: `Đã gửi ${totalSent} thông báo`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[SendPushNotification] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
