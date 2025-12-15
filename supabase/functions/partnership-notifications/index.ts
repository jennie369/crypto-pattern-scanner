/**
 * Partnership Notifications Edge Function
 * Sends push notifications for partnership events via Expo Push API
 *
 * Events handled:
 * - partnership_approved: When admin approves application
 * - partnership_rejected: When admin rejects application
 * - withdrawal_approved: When admin approves withdrawal
 * - withdrawal_completed: When withdrawal is completed
 * - withdrawal_rejected: When admin rejects withdrawal
 * - commission_earned: When new commission is recorded
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Expo Push API endpoint
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

interface NotificationPayload {
  event_type: 'partnership_approved' | 'partnership_rejected' | 'withdrawal_approved' |
              'withdrawal_completed' | 'withdrawal_rejected' | 'commission_earned' | 'tier_upgrade';
  user_id: string;
  data: Record<string, any>;
}

/**
 * Send push notification via Expo
 */
async function sendExpoPush(message: PushMessage): Promise<boolean> {
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log('[Expo Push] Response:', JSON.stringify(result));

    return result.data?.status === 'ok';
  } catch (error) {
    console.error('[Expo Push] Error:', error);
    return false;
  }
}

/**
 * Format currency in VND
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Build notification message based on event type
 */
function buildNotificationMessage(payload: NotificationPayload): { title: string; body: string; screen?: string; params?: Record<string, any> } | null {
  const { event_type, data } = payload;

  switch (event_type) {
    case 'partnership_approved': {
      const roleText = data.partner_type === 'ctv' ? 'CTV' : 'Affiliate';
      const tierText = data.partner_type === 'ctv' ? `cấp ${data.ctv_tier || 'Beginner'}` : '';
      const commissionText = data.partner_type === 'affiliate' ? '3%' : '10-30%';
      return {
        title: `🎉 Chúc mừng! Bạn đã trở thành ${roleText}`,
        body: `Bắt đầu kiếm ${commissionText} hoa hồng từ mỗi đơn hàng giới thiệu ngay!`,
        screen: 'AffiliateWelcome',
        params: {
          partner_type: data.partner_type,
          ctv_tier: data.ctv_tier,
          isNewlyApproved: true,
        },
      };
    }

    case 'partnership_rejected': {
      return {
        title: '📋 Đơn đăng ký của bạn cần bổ sung',
        body: data.reason || 'Vui lòng kiểm tra và cập nhật thông tin để tiếp tục.',
        screen: 'PartnershipRegistration',
      };
    }

    case 'withdrawal_approved': {
      return {
        title: '✅ Yêu cầu rút tiền đã được duyệt',
        body: `Số tiền ${formatCurrency(data.amount)} sẽ được chuyển trong 24h.`,
        screen: 'Earnings',
      };
    }

    case 'withdrawal_completed': {
      return {
        title: '💰 Đã chuyển tiền thành công!',
        body: `${formatCurrency(data.amount)} đã được chuyển vào tài khoản của bạn.`,
        screen: 'Earnings',
      };
    }

    case 'withdrawal_rejected': {
      return {
        title: '❌ Yêu cầu rút tiền bị từ chối',
        body: 'Vui lòng kiểm tra thông tin ngân hàng và thử lại.',
        screen: 'WithdrawRequest',
      };
    }

    case 'commission_earned': {
      return {
        title: '🎊 Bạn vừa nhận hoa hồng!',
        body: `+${formatCurrency(data.amount)} từ đơn hàng #${data.order_id}`,
        screen: 'Earnings',
      };
    }

    case 'tier_upgrade': {
      const tierNames: Record<string, string> = {
        beginner: 'Beginner',
        growing: 'Growing',
        master: 'Master',
        expert: 'Expert',
      };
      return {
        title: '🚀 Chúc mừng thăng cấp!',
        body: `Bạn đã lên cấp ${tierNames[data.new_tier] || data.new_tier}! Hoa hồng tăng lên rồi!`,
        screen: 'AffiliateWelcome',
        params: { new_tier: data.new_tier },
      };
    }

    default:
      return null;
  }
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
    console.log('[Partnership Notifications] Received:', JSON.stringify(payload));

    if (!payload.event_type || !payload.user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing event_type or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's push token from database (from profiles table)
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('expo_push_token, email, full_name, display_name')
      .eq('id', payload.user_id)
      .single();

    if (userError || !userData) {
      console.error('[Partnership Notifications] User not found:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found', details: userError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build notification message
    const message = buildNotificationMessage(payload);
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Unknown event type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build deep link data
    const deepLinkData = {
      type: payload.event_type,
      screen: message.screen || null,
      ...(message.params || {}),
      ...payload.data,
    };

    // Send push notification if user has a push token
    let pushSent = false;
    if (userData.expo_push_token) {
      const pushMessage: PushMessage = {
        to: userData.expo_push_token,
        title: message.title,
        body: message.body,
        data: deepLinkData,
        sound: 'default',
        channelId: 'default',
        badge: 1,
      };

      pushSent = await sendExpoPush(pushMessage);
    }

    // Also store notification in database for in-app display
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        type: payload.event_type,
        title: message.title,
        body: message.body,
        data: deepLinkData,
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('[Partnership Notifications] Failed to store notification:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        push_sent: pushSent,
        has_push_token: !!userData.expo_push_token,
        notification_stored: !insertError,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Partnership Notifications] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
