/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROI DAILY CRON - Edge Function
 * ROI Proof System - Phase E
 * Runs at 00:05 UTC daily to generate health snapshots, composite data, and AI reports
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const targetDate = new Date().toISOString().split('T')[0];
    console.log(`[ROI Daily Cron] Starting for date: ${targetDate}`);

    const results: Record<string, any> = {
      date: targetDate,
      steps: [],
    };

    // ═══════════════════════════════════════════════════
    // STEP 1: Generate Health Snapshots
    // ═══════════════════════════════════════════════════
    console.log('[ROI Daily Cron] Step 1: Generating health snapshots...');
    const { data: healthResult, error: healthError } = await supabase.rpc(
      'generate_daily_health_snapshots',
      { p_target_date: targetDate }
    );

    if (healthError) {
      console.error('[ROI Daily Cron] Health snapshots error:', healthError);
      results.steps.push({ step: 'health_snapshots', success: false, error: healthError.message });
    } else {
      console.log('[ROI Daily Cron] Health snapshots result:', healthResult);
      results.steps.push({ step: 'health_snapshots', success: true, data: healthResult });
    }

    // ═══════════════════════════════════════════════════
    // STEP 2: Detect Burn Events
    // ═══════════════════════════════════════════════════
    console.log('[ROI Daily Cron] Step 2: Detecting burn events...');
    const { data: burnResult, error: burnError } = await supabase.rpc(
      'detect_burn_events',
      { p_target_date: targetDate }
    );

    if (burnError) {
      console.error('[ROI Daily Cron] Burn events error:', burnError);
      results.steps.push({ step: 'burn_events', success: false, error: burnError.message });
    } else {
      console.log('[ROI Daily Cron] Burn events result:', burnResult);
      results.steps.push({ step: 'burn_events', success: true, data: burnResult });
    }

    // ═══════════════════════════════════════════════════
    // STEP 3: Generate Daily Composite
    // ═══════════════════════════════════════════════════
    console.log('[ROI Daily Cron] Step 3: Generating daily composite...');
    const { data: compositeResult, error: compositeError } = await supabase.rpc(
      'generate_daily_composite',
      { p_date: targetDate }
    );

    if (compositeError) {
      console.error('[ROI Daily Cron] Composite error:', compositeError);
      results.steps.push({ step: 'composite', success: false, error: compositeError.message });
    } else {
      console.log('[ROI Daily Cron] Composite result:', compositeResult);
      results.steps.push({ step: 'composite', success: true, data: compositeResult });
    }

    // ═══════════════════════════════════════════════════
    // STEP 4: Send Burn Notifications
    // ═══════════════════════════════════════════════════
    console.log('[ROI Daily Cron] Step 4: Sending burn notifications...');
    const { data: pendingNotifications, error: notifError } = await supabase.rpc(
      'get_pending_burn_notifications'
    );

    if (notifError) {
      console.error('[ROI Daily Cron] Get notifications error:', notifError);
      results.steps.push({ step: 'notifications', success: false, error: notifError.message });
    } else if (pendingNotifications && pendingNotifications.length > 0) {
      console.log(`[ROI Daily Cron] Sending ${pendingNotifications.length} burn notifications...`);

      let sentCount = 0;
      for (const notif of pendingNotifications) {
        try {
          // Get notification content based on status
          const { title, body, priority } = getBurnNotificationContent(notif.new_status);

          // Send push notification if user has token
          if (notif.push_token) {
            await sendExpoPushNotification(notif.push_token, title, body, {
              type: 'burn_warning',
              status: notif.new_status,
              event_id: notif.event_id,
            });

            // Mark as sent
            await supabase
              .from('account_burn_events')
              .update({
                notification_sent: true,
                notification_sent_at: new Date().toISOString(),
                notification_type: 'push',
              })
              .eq('id', notif.event_id);

            sentCount++;
          }
        } catch (notifSendError) {
          console.error('[ROI Daily Cron] Send notification error:', notifSendError);
        }
      }

      results.steps.push({
        step: 'notifications',
        success: true,
        data: { total: pendingNotifications.length, sent: sentCount },
      });
    } else {
      results.steps.push({ step: 'notifications', success: true, data: { total: 0, sent: 0 } });
    }

    // ═══════════════════════════════════════════════════
    // STEP 5: Trigger AI Report Generation
    // ═══════════════════════════════════════════════════
    console.log('[ROI Daily Cron] Step 5: Triggering AI report...');
    try {
      // Create pending report entry
      const { error: reportInsertError } = await supabase
        .from('admin_ai_daily_reports')
        .upsert({
          report_date: targetDate,
          status: 'pending',
          raw_data: {},
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'report_date',
        });

      if (reportInsertError) {
        console.error('[ROI Daily Cron] Report insert error:', reportInsertError);
        results.steps.push({ step: 'ai_report_trigger', success: false, error: reportInsertError.message });
      } else {
        // Call the AI report function asynchronously
        const aiReportUrl = `${supabaseUrl}/functions/v1/roi-ai-report`;
        fetch(aiReportUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ date: targetDate }),
        }).catch((err) => console.error('[ROI Daily Cron] AI report trigger failed:', err));

        results.steps.push({ step: 'ai_report_trigger', success: true, data: { triggered: true } });
      }
    } catch (aiTriggerError) {
      console.error('[ROI Daily Cron] AI trigger error:', aiTriggerError);
      results.steps.push({ step: 'ai_report_trigger', success: false, error: String(aiTriggerError) });
    }

    console.log('[ROI Daily Cron] Completed successfully');
    results.success = true;
    results.completed_at = new Date().toISOString();

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[ROI Daily Cron] Fatal error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/**
 * Get notification content based on burn status
 */
function getBurnNotificationContent(status: string) {
  switch (status) {
    case 'danger':
      return {
        title: 'Cảnh báo tài khoản',
        body: 'Tài khoản của bạn đang ở mức nguy hiểm. Hãy xem xét lại chiến lược trading.',
        priority: 'medium',
      };
    case 'burned':
      return {
        title: 'Cảnh báo nghiêm trọng',
        body: 'Tài khoản bị cháy nghiêm trọng! Hãy dừng trading và liên hệ hỗ trợ.',
        priority: 'high',
      };
    case 'wiped':
      return {
        title: 'Tài khoản cần can thiệp',
        body: 'Tài khoản gần như mất trắng. Vui lòng liên hệ với chúng tôi để được hỗ trợ.',
        priority: 'critical',
      };
    default:
      return {
        title: 'Thông báo tài khoản',
        body: 'Có thay đổi về trạng thái tài khoản của bạn.',
        priority: 'low',
      };
  }
}

/**
 * Send Expo push notification
 */
async function sendExpoPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data: Record<string, any>
) {
  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Expo push failed: ${response.status}`);
  }

  return response.json();
}
