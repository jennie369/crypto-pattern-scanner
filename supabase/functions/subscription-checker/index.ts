/**
 * Gemral - Subscription Expiration Checker Edge Function
 *
 * This function runs on a schedule (via pg_cron or external scheduler) to:
 * 1. Auto-revoke expired subscriptions
 * 2. Send expiration notifications (7, 3, 1 day before)
 * 3. Log all actions for admin dashboard
 *
 * Schedule: Run every hour or daily at midnight
 * Trigger: POST /subscription-checker with optional action parameter
 *
 * Actions:
 * - "check_expired" - Revoke expired subscriptions (default)
 * - "send_notifications" - Send expiration reminders
 * - "both" - Do both actions
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpiringUser {
  user_id: string;
  email: string;
  full_name: string;
  push_token: string | null;
  tier_type: string;
  current_tier: string;
  expires_at: string;
  days_remaining: number;
  notification_type: string;
}

interface RevokedSubscription {
  user_id: string;
  tier_type: string;
  old_tier: string;
  expired_at: string;
}

// Notification messages in Vietnamese
const NOTIFICATION_MESSAGES = {
  '7_days': {
    title: 'Gói {tier} sắp hết hạn',
    body: 'Gói {tier} của bạn sẽ hết hạn sau 7 ngày. Gia hạn ngay để không bị gián đoạn!',
  },
  '3_days': {
    title: 'Gói {tier} sắp hết hạn!',
    body: 'Chỉ còn 3 ngày nữa là gói {tier} của bạn hết hạn. Gia hạn ngay!',
  },
  '1_day': {
    title: 'Gói {tier} hết hạn ngày mai!',
    body: 'Gói {tier} của bạn sẽ hết hạn vào ngày mai. Gia hạn ngay để tiếp tục sử dụng!',
  },
  'expired': {
    title: 'Gói {tier} đã hết hạn',
    body: 'Gói {tier} của bạn đã hết hạn. Gia hạn ngay để tiếp tục trải nghiệm đầy đủ tính năng!',
  },
};

const TIER_DISPLAY_NAMES: Record<string, string> = {
  'chatbot_tier': 'GEM Master AI',
  'scanner_tier': 'Pattern Scanner',
  'course_tier': 'Khóa học',
};

const TIER_VALUE_NAMES: Record<string, string> = {
  'TIER1': 'Tier 1',
  'TIER2': 'Tier 2',
  'TIER3': 'Tier 3 VIP',
  'PRO': 'Pro',
  'PREMIUM': 'Premium',
  'VIP': 'VIP',
};

function formatNotificationMessage(
  template: { title: string; body: string },
  tierType: string,
  tierValue: string
): { title: string; body: string } {
  const tierTypeName = TIER_DISPLAY_NAMES[tierType] || tierType;
  const tierValueName = TIER_VALUE_NAMES[tierValue] || tierValue;
  const fullTierName = `${tierTypeName} ${tierValueName}`;

  return {
    title: template.title.replace('{tier}', fullTierName),
    body: template.body.replace('{tier}', fullTierName),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    let action = 'both';
    try {
      const body = await req.json();
      action = body.action || 'both';
    } catch {
      // Default to 'both' if no body
    }

    console.log(`[SubscriptionChecker] Starting with action: ${action}`);

    const results = {
      revoked: [] as RevokedSubscription[],
      notifications_sent: 0,
      errors: [] as string[],
    };

    // =====================================================
    // 1. CHECK AND REVOKE EXPIRED SUBSCRIPTIONS
    // =====================================================
    if (action === 'check_expired' || action === 'both') {
      console.log('[SubscriptionChecker] Checking for expired subscriptions...');

      try {
        const { data: revokedData, error: revokeError } = await supabase
          .rpc('check_and_revoke_expired_subscriptions');

        if (revokeError) {
          console.error('[SubscriptionChecker] Revoke error:', revokeError);
          results.errors.push(`Revoke error: ${revokeError.message}`);
        } else if (revokedData && revokedData.length > 0) {
          results.revoked = revokedData;
          console.log(`[SubscriptionChecker] Revoked ${revokedData.length} expired subscriptions`);

          // Send "expired" notifications to revoked users
          for (const revoked of revokedData) {
            try {
              // Get user's push token
              const { data: profile } = await supabase
                .from('profiles')
                .select('push_token, email, full_name')
                .eq('id', revoked.user_id)
                .single();

              if (profile?.push_token) {
                const message = formatNotificationMessage(
                  NOTIFICATION_MESSAGES['expired'],
                  revoked.tier_type,
                  revoked.old_tier
                );

                // Send push notification
                await sendPushNotification(profile.push_token, message.title, message.body, {
                  type: 'subscription_expired',
                  tier_type: revoked.tier_type,
                  old_tier: revoked.old_tier,
                });

                results.notifications_sent++;
              }

              // Create in-app notification
              await supabase.from('notifications').insert({
                user_id: revoked.user_id,
                type: 'subscription_expired',
                title: formatNotificationMessage(
                  NOTIFICATION_MESSAGES['expired'],
                  revoked.tier_type,
                  revoked.old_tier
                ).title,
                body: formatNotificationMessage(
                  NOTIFICATION_MESSAGES['expired'],
                  revoked.tier_type,
                  revoked.old_tier
                ).body,
                data: {
                  tier_type: revoked.tier_type,
                  old_tier: revoked.old_tier,
                  action: 'renew',
                },
                is_read: false,
              });

              // Record notification sent
              await supabase.rpc('record_expiration_notification', {
                p_user_id: revoked.user_id,
                p_tier_type: revoked.tier_type,
                p_current_tier: revoked.old_tier,
                p_expires_at: revoked.expired_at,
                p_notification_type: 'expired',
                p_days_remaining: 0,
                p_push_sent: !!profile?.push_token,
                p_in_app_sent: true,
                p_email_sent: false,
              });

            } catch (notifError: any) {
              console.error('[SubscriptionChecker] Notification error:', notifError);
              results.errors.push(`Notification error for ${revoked.user_id}: ${notifError.message}`);
            }
          }
        } else {
          console.log('[SubscriptionChecker] No expired subscriptions found');
        }
      } catch (err: any) {
        console.error('[SubscriptionChecker] Revoke check error:', err);
        results.errors.push(`Revoke check error: ${err.message}`);
      }
    }

    // =====================================================
    // 2. SEND EXPIRATION NOTIFICATIONS (7, 3, 1 day)
    // =====================================================
    if (action === 'send_notifications' || action === 'both') {
      console.log('[SubscriptionChecker] Checking for expiring subscriptions to notify...');

      try {
        const { data: usersToNotify, error: notifyError } = await supabase
          .rpc('get_users_needing_expiration_notifications');

        if (notifyError) {
          console.error('[SubscriptionChecker] Get users error:', notifyError);
          results.errors.push(`Get users error: ${notifyError.message}`);
        } else if (usersToNotify && usersToNotify.length > 0) {
          console.log(`[SubscriptionChecker] Found ${usersToNotify.length} users needing notifications`);

          for (const user of usersToNotify as ExpiringUser[]) {
            try {
              const messageTemplate = NOTIFICATION_MESSAGES[user.notification_type as keyof typeof NOTIFICATION_MESSAGES];
              if (!messageTemplate) continue;

              const message = formatNotificationMessage(
                messageTemplate,
                user.tier_type,
                user.current_tier
              );

              // Send push notification if token exists
              let pushSent = false;
              if (user.push_token) {
                try {
                  await sendPushNotification(user.push_token, message.title, message.body, {
                    type: 'subscription_expiring',
                    tier_type: user.tier_type,
                    current_tier: user.current_tier,
                    days_remaining: user.days_remaining,
                    expires_at: user.expires_at,
                    action: 'renew',
                  });
                  pushSent = true;
                  results.notifications_sent++;
                } catch (pushErr) {
                  console.error('[SubscriptionChecker] Push error:', pushErr);
                }
              }

              // Create in-app notification
              await supabase.from('notifications').insert({
                user_id: user.user_id,
                type: 'subscription_expiring',
                title: message.title,
                body: message.body,
                data: {
                  tier_type: user.tier_type,
                  current_tier: user.current_tier,
                  days_remaining: user.days_remaining,
                  expires_at: user.expires_at,
                  action: 'renew',
                },
                is_read: false,
              });

              // Record notification
              await supabase.rpc('record_expiration_notification', {
                p_user_id: user.user_id,
                p_tier_type: user.tier_type,
                p_current_tier: user.current_tier,
                p_expires_at: user.expires_at,
                p_notification_type: user.notification_type,
                p_days_remaining: user.days_remaining,
                p_push_sent: pushSent,
                p_in_app_sent: true,
                p_email_sent: false,
              });

              console.log(`[SubscriptionChecker] Sent ${user.notification_type} notification to ${user.user_id}`);

            } catch (userNotifError: any) {
              console.error('[SubscriptionChecker] User notification error:', userNotifError);
              results.errors.push(`Notification error for ${user.user_id}: ${userNotifError.message}`);
            }
          }
        } else {
          console.log('[SubscriptionChecker] No users need notifications');
        }
      } catch (err: any) {
        console.error('[SubscriptionChecker] Notification check error:', err);
        results.errors.push(`Notification check error: ${err.message}`);
      }
    }

    // =====================================================
    // RETURN RESULTS
    // =====================================================
    console.log('[SubscriptionChecker] Complete:', JSON.stringify(results, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        action,
        timestamp: new Date().toISOString(),
        revoked_count: results.revoked.length,
        notifications_sent: results.notifications_sent,
        errors: results.errors,
        revoked: results.revoked,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[SubscriptionChecker] Error:', error);

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
 * Send push notification via Expo Push API
 */
async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const message = {
    to: token,
    title,
    body,
    data: data || {},
    sound: 'default',
    badge: 1,
    channelId: 'default',
  };

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([message]),
  });

  const result = await response.json();

  if (result.data && result.data[0]?.status !== 'ok') {
    throw new Error(result.data[0]?.message || 'Push notification failed');
  }
}
