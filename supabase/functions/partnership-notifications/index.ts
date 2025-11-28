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
function buildNotificationMessage(payload: NotificationPayload): { title: string; body: string } | null {
  const { event_type, data } = payload;

  switch (event_type) {
    case 'partnership_approved': {
      const roleText = data.partner_role === 'ctv' ? 'CTV' : 'Affiliate';
      const tierInfo = data.partner_role === 'ctv' ? ' - Tier 1' : '';
      return {
        title: `🎉 Chúc mừng! Bạn đã trở thành ${roleText}${tierInfo}`,
        body: `Mã giới thiệu của bạn: ${data.affiliate_code}. Bắt đầu chia sẻ và nhận hoa hồng ngay!`,
      };
    }

    case 'partnership_rejected': {
      return {
        title: '❌ Đơn đăng ký không được duyệt',
        body: data.reason || 'Đơn đăng ký của bạn không được chấp thuận. Vui lòng liên hệ hỗ trợ.',
      };
    }

    case 'withdrawal_approved': {
      return {
        title: '✅ Yêu cầu rút tiền đã được duyệt',
        body: `Yêu cầu rút ${formatCurrency(data.amount)} của bạn đã được duyệt và đang chờ xử lý.`,
      };
    }

    case 'withdrawal_completed': {
      return {
        title: '💰 Chuyển khoản thành công!',
        body: `${formatCurrency(data.amount)} đã được chuyển vào tài khoản ngân hàng của bạn. Mã GD: ${data.transaction_id}`,
      };
    }

    case 'withdrawal_rejected': {
      return {
        title: '❌ Yêu cầu rút tiền bị từ chối',
        body: `Yêu cầu rút ${formatCurrency(data.amount)} không được chấp thuận. Lý do: ${data.reason || 'Không xác định'}`,
      };
    }

    case 'commission_earned': {
      return {
        title: '🎊 Bạn vừa nhận hoa hồng!',
        body: `+${formatCurrency(data.amount)} từ đơn hàng #${data.order_number}${data.product_name ? ` (${data.product_name})` : ''}`,
      };
    }

    case 'tier_upgrade': {
      const tierNames: Record<number, string> = {
        1: 'Tier 1 (Cơ bản)',
        2: 'Tier 2 (Nâng cao)',
        3: 'Tier 3 (Chuyên nghiệp)',
        4: 'Tier 4 (VIP)',
      };
      return {
        title: '🚀 Chúc mừng! Bạn đã lên cấp!',
        body: `Bạn đã đạt ${tierNames[data.new_tier] || `Tier ${data.new_tier}`}. Hoa hồng mới: ${data.commission_rate}%`,
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

    // Get user's push token from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('expo_push_token, email, full_name')
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

    // Send push notification if user has a push token
    let pushSent = false;
    if (userData.expo_push_token) {
      const pushMessage: PushMessage = {
        to: userData.expo_push_token,
        title: message.title,
        body: message.body,
        data: {
          type: payload.event_type,
          ...payload.data,
        },
        sound: 'default',
        channelId: 'alerts',
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
        data: payload.data,
        read: false,
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
