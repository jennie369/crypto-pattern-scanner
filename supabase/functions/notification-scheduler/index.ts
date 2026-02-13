/**
 * Gemral - Notification Scheduler Edge Function
 * Runs every 15 minutes via pg_cron to process scheduled push notifications
 *
 * Setup pg_cron (run in SQL Editor):
 * SELECT cron.schedule('notification-scheduler', '0,15,30,45 * * * *',
 *   $$SELECT net.http_post(
 *     url := 'https://YOUR_PROJECT.supabase.co/functions/v1/notification-scheduler',
 *     headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
 *   )$$
 * );
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  deep_link: string | null;
  segment: string;
  segment_filters: Record<string, unknown>;
  ab_test_enabled: boolean;
  ab_variants: Record<string, { title: string; body: string }> | null;
  is_recurring: boolean;
  recurrence_rule: Record<string, unknown> | null;
  retry_count: number;
}

interface UserToken {
  id: string;
  expo_push_token: string;
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

    // Get current time in Vietnam timezone
    const now = new Date();
    console.log(`[NotificationScheduler] Running at ${now.toISOString()}`);

    // Query pending scheduled notifications
    const { data: notifications, error: queryError } = await supabase
      .from('notification_schedule')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true });

    if (queryError) {
      throw new Error(`Query error: ${queryError.message}`);
    }

    if (!notifications || notifications.length === 0) {
      console.log('[NotificationScheduler] No pending notifications');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No scheduled notifications',
          processed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[NotificationScheduler] Found ${notifications.length} notifications to process`);

    const results: Array<{
      id: string;
      success: boolean;
      userCount?: number;
      error?: string;
    }> = [];

    // Process each notification
    for (const notification of notifications as ScheduledNotification[]) {
      try {
        console.log(`[NotificationScheduler] Processing ${notification.id}: ${notification.title}`);

        // Get users by segment
        const users = await getUsersBySegment(supabase, notification.segment, notification.segment_filters);

        if (users.length === 0) {
          console.log(`[NotificationScheduler] No users for segment: ${notification.segment}`);
          await supabase
            .from('notification_schedule')
            .update({
              status: 'failed',
              error_message: 'No users in segment',
            })
            .eq('id', notification.id);

          results.push({ id: notification.id, success: false, error: 'No users in segment' });
          continue;
        }

        // Handle A/B testing
        let notificationsToSend: Array<{
          tokens: string[];
          userIds: string[];
          notification: { title: string; body: string; data: Record<string, unknown> };
          abVariant?: string;
        }> = [];

        if (notification.ab_test_enabled && notification.ab_variants) {
          // Split users for A/B test (50/50)
          const midPoint = Math.floor(users.length / 2);
          const groupA = users.slice(0, midPoint);
          const groupB = users.slice(midPoint);

          notificationsToSend = [
            {
              tokens: groupA.map(u => u.expo_push_token),
              userIds: groupA.map(u => u.id),
              notification: {
                title: notification.ab_variants.A?.title || notification.title,
                body: notification.ab_variants.A?.body || notification.body,
                data: { deep_link: notification.deep_link },
              },
              abVariant: 'A',
            },
            {
              tokens: groupB.map(u => u.expo_push_token),
              userIds: groupB.map(u => u.id),
              notification: {
                title: notification.ab_variants.B?.title || notification.title,
                body: notification.ab_variants.B?.body || notification.body,
                data: { deep_link: notification.deep_link },
              },
              abVariant: 'B',
            },
          ];
        } else {
          // Single notification to all users
          notificationsToSend = [{
            tokens: users.map(u => u.expo_push_token),
            userIds: users.map(u => u.id),
            notification: {
              title: notification.title,
              body: notification.body,
              data: { deep_link: notification.deep_link },
            },
          }];
        }

        // Send notifications via send-push-notification function
        for (const batch of notificationsToSend) {
          const { data: sendResult, error: sendError } = await supabase.functions.invoke('send-push-notification', {
            body: {
              notificationId: notification.id,
              notification: batch.notification,
              tokens: batch.tokens,
              userIds: batch.userIds,
              abVariant: batch.abVariant,
            },
          });

          if (sendError) {
            console.error(`[NotificationScheduler] Send error:`, sendError);
          } else {
            console.log(`[NotificationScheduler] Sent batch: ${sendResult?.totalSent || 0} success`);
          }
        }

        // Handle recurring notifications - schedule next occurrence
        if (notification.is_recurring && notification.recurrence_rule) {
          await scheduleNextRecurrence(supabase, notification);
        }

        results.push({
          id: notification.id,
          success: true,
          userCount: users.length,
        });

      } catch (notificationError: any) {
        console.error(`[NotificationScheduler] Error processing ${notification.id}:`, notificationError);

        // Update status to failed with retry count
        await supabase
          .from('notification_schedule')
          .update({
            status: notification.retry_count < 3 ? 'scheduled' : 'failed',
            error_message: notificationError.message,
            retry_count: notification.retry_count + 1,
            last_retry_at: new Date().toISOString(),
            // Push back scheduled_at by 15 minutes for retry
            scheduled_at: notification.retry_count < 3
              ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
              : undefined,
          })
          .eq('id', notification.id);

        results.push({
          id: notification.id,
          success: false,
          error: notificationError.message,
        });
      }
    }

    console.log(`[NotificationScheduler] Complete. Processed ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: notifications.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[NotificationScheduler] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Get users by segment with push tokens
 */
async function getUsersBySegment(
  supabase: any,
  segment: string,
  filters: Record<string, unknown>
): Promise<UserToken[]> {
  let query = supabase
    .from('profiles')
    .select('id, expo_push_token')
    .not('expo_push_token', 'is', null);

  // Apply segment filters
  switch (segment) {
    case 'traders':
      query = query.contains('notification_segments', ['trading']);
      break;
    case 'spiritual':
      query = query.contains('notification_segments', ['spiritual']);
      break;
    case 'tier1_plus':
      query = query.in('scanner_tier', ['tier1', 'tier2', 'tier3', 'PRO', 'PREMIUM', 'VIP']);
      break;
    case 'inactive_3d':
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      query = query.lt('last_active_at', threeDaysAgo.toISOString());
      break;
    case 'custom':
      // Apply custom filters from segment_filters
      if (filters.tier) {
        query = query.in('scanner_tier', filters.tier as string[]);
      }
      if (filters.segments) {
        query = query.overlaps('notification_segments', filters.segments as string[]);
      }
      break;
    case 'all':
    default:
      // No additional filters - send to all users with tokens
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getUsersBySegment] Error:', error);
    return [];
  }

  return data || [];
}

/**
 * Schedule next occurrence for recurring notifications
 */
async function scheduleNextRecurrence(
  supabase: any,
  notification: ScheduledNotification
): Promise<void> {
  const rule = notification.recurrence_rule;
  if (!rule) return;

  const pattern = (rule as any).pattern; // 'daily', 'weekly'
  const days = (rule as any).days as number[]; // [1,2,3,4,5] for weekdays
  const endDate = (rule as any).end_date;

  // Calculate next scheduled time
  let nextDate = new Date(notification.id); // Use current scheduled time as base
  nextDate = new Date(); // Reset to now

  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      // Find next day in the days array
      do {
        nextDate.setDate(nextDate.getDate() + 1);
      } while (days && !days.includes(nextDate.getDay()));
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 1);
  }

  // Check if end date reached
  if (endDate && new Date(endDate) < nextDate) {
    console.log(`[scheduleNextRecurrence] End date reached for ${notification.id}`);
    return;
  }

  // Create new scheduled notification for next occurrence
  const { error } = await supabase
    .from('notification_schedule')
    .insert({
      title: notification.title,
      body: notification.body,
      deep_link: notification.deep_link,
      segment: notification.segment,
      segment_filters: notification.segment_filters,
      ab_test_enabled: notification.ab_test_enabled,
      ab_variants: notification.ab_variants,
      scheduled_at: nextDate.toISOString(),
      is_recurring: true,
      recurrence_rule: notification.recurrence_rule,
      status: 'scheduled',
    });

  if (error) {
    console.error(`[scheduleNextRecurrence] Error:`, error);
  } else {
    console.log(`[scheduleNextRecurrence] Scheduled next occurrence for ${nextDate.toISOString()}`);
  }
}
