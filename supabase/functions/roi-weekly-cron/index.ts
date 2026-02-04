/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROI WEEKLY CRON - Edge Function
 * ROI Proof System - Phase E
 * Runs on Sunday 01:00 UTC to calculate practice profiles for cohort comparison
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

    const profileDate = new Date().toISOString().split('T')[0];
    console.log(`[ROI Weekly Cron] Starting practice profile calculation for: ${profileDate}`);

    const startTime = Date.now();

    // ═══════════════════════════════════════════════════
    // Calculate Practice Profiles
    // ═══════════════════════════════════════════════════
    const { data: result, error } = await supabase.rpc(
      'calculate_practice_profiles',
      { p_profile_date: profileDate }
    );

    if (error) {
      console.error('[ROI Weekly Cron] Error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          date: profileDate,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[ROI Weekly Cron] Completed in ${duration}ms:`, result);

    // ═══════════════════════════════════════════════════
    // Send Admin Notification
    // ═══════════════════════════════════════════════════
    try {
      // Get admin push tokens
      const { data: admins } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .in('role', ['admin', 'super_admin'])
        .not('expo_push_token', 'is', null);

      if (admins && admins.length > 0) {
        const pushTokens = admins
          .map((a) => a.expo_push_token)
          .filter((t) => t && t.startsWith('ExponentPushToken'));

        if (pushTokens.length > 0) {
          await sendAdminNotification(
            pushTokens,
            'Cập nhật hồ sơ thực hành',
            `Đã cập nhật ${result?.users_processed || 0} hồ sơ người dùng.`
          );
        }
      }
    } catch (notifError) {
      console.error('[ROI Weekly Cron] Notification error:', notifError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: profileDate,
        result,
        duration_ms: duration,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[ROI Weekly Cron] Fatal error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Send notification to admins
 */
async function sendAdminNotification(
  pushTokens: string[],
  title: string,
  body: string
) {
  const messages = pushTokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: { type: 'admin_weekly_report' },
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    throw new Error(`Expo push failed: ${response.status}`);
  }

  return response.json();
}
