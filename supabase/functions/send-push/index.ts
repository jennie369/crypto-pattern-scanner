/**
 * Send Push Notification Edge Function
 * GEM Partnership System v3.0 - Phase 5
 * Uses Expo Push API
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Vietnamese tier names
const TIER_NAMES: Record<string, string> = {
  bronze: '🥉 Đồng',
  silver: '🥈 Bạc',
  gold: '🥇 Vàng',
  platinum: '💎 Bạch Kim',
  diamond: '👑 Kim Cương',
};

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const {
      user_id,
      user_ids,
      notification_type,
      title,
      body,
      data,
      channel_id,
    } = await req.json();

    // Get push tokens - try user_push_tokens first, then fallback to profiles
    let tokens: string[] = [];
    const targetUserIds = user_id ? [user_id] : (user_ids || []);

    if (targetUserIds.length > 0) {
      // First try user_push_tokens table
      const { data: tokensData } = await supabase
        .from('user_push_tokens')
        .select('push_token, user_id')
        .in('user_id', targetUserIds)
        .eq('is_active', true);

      tokens = (tokensData || []).map(t => t.push_token).filter(Boolean);

      // If no tokens found, fallback to profiles.expo_push_token
      if (tokens.length === 0) {
        console.log('[SendPush] No tokens in user_push_tokens, checking profiles...');
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('expo_push_token')
          .in('id', targetUserIds)
          .not('expo_push_token', 'is', null);

        tokens = (profilesData || []).map(p => p.expo_push_token).filter(Boolean);
      }
    }

    if (tokens.length === 0) {
      console.log('[SendPush] No push tokens found for users:', targetUserIds);
      return new Response(
        JSON.stringify({ success: false, error: 'No valid push tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`[SendPush] Found ${tokens.length} tokens for ${targetUserIds.length} users`);

    // Prepare push messages
    const messages: PushMessage[] = tokens.map(token => ({
      to: token,
      title: title || getDefaultTitle(notification_type),
      body: body || getDefaultBody(notification_type, data),
      data: {
        notification_type,
        ...data,
      },
      sound: 'default',
      channelId: channel_id || getChannelId(notification_type),
      priority: 'high',
    }));

    // Send to Expo Push API
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    // Log notification in database
    if (user_id) {
      await supabase.from('partner_notifications').insert({
        user_id,
        notification_type,
        title: messages[0].title,
        message: messages[0].body,
        metadata: data || {},
      });
    } else if (user_ids) {
      // Bulk insert for multiple users
      const notificationInserts = user_ids.map((uid: string) => ({
        user_id: uid,
        notification_type,
        title: messages[0].title,
        message: messages[0].body,
        metadata: data || {},
      }));
      await supabase.from('partner_notifications').insert(notificationInserts);
    }

    console.log(`[SendPush] Sent ${messages.length} notifications, type: ${notification_type}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: messages.length,
        result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SendPush] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function getDefaultTitle(type: string): string {
  const titles: Record<string, string> = {
    // Call notifications
    incoming_call: '📞 Cuộc gọi đến',
    missed_call: '📞 Cuộc gọi nhỡ',
    // Message notifications
    new_message: '💬 Tin nhắn mới',
    // Partnership notifications
    application_submitted: '📝 Đơn đăng ký đã gửi',
    application_approved: '🎉 Chúc mừng! Đơn đã được duyệt',
    application_rejected: '❌ Đơn đăng ký không được duyệt',
    tier_upgrade: '🎉 Chúc mừng thăng cấp!',
    tier_downgrade: '📉 Thông báo giảm cấp',
    commission_earned: '💰 Hoa hồng mới',
    sub_affiliate_commission: '👥 Hoa hồng từ sub-affiliate',
    withdrawal_approved: '✅ Yêu cầu rút tiền đã duyệt',
    withdrawal_rejected: '❌ Yêu cầu rút tiền bị từ chối',
    new_resource: '📚 Tài nguyên mới',
    payment_processed: '💳 Thanh toán đã xử lý',
  };
  return titles[type] || '🔔 Thông báo mới';
}

function getDefaultBody(type: string, data?: Record<string, unknown>): string {
  switch (type) {
    // Call notifications
    case 'incoming_call':
      const callType = data?.callType === 'video' ? 'video' : 'thoại';
      const callerName = data?.callerName || 'Ai đó';
      return `${callerName} đang gọi ${callType} cho bạn`;

    case 'missed_call':
      return `Bạn có cuộc gọi nhỡ từ ${data?.callerName || 'ai đó'}`;

    // Message notifications
    case 'new_message':
      return data?.preview
        ? `${data?.senderName || 'Ai đó'}: ${data.preview}`
        : `Bạn có tin nhắn mới từ ${data?.senderName || 'ai đó'}`;

    // Partnership notifications
    case 'application_approved':
      return data?.role === 'kol'
        ? 'Bạn đã trở thành KOL Affiliate! Hoa hồng 20% đang chờ bạn.'
        : `Bạn đã trở thành Đối Tác Phát Triển ${TIER_NAMES.bronze}!`;

    case 'tier_upgrade':
      return `Bạn đã lên ${TIER_NAMES[data?.newTier as string] || data?.newTier} từ ${TIER_NAMES[data?.oldTier as string] || data?.oldTier}. Hoa hồng mới đang chờ!`;

    case 'tier_downgrade':
      return `Tier đã giảm xuống ${TIER_NAMES[data?.newTier as string] || data?.newTier}. Tăng doanh số để lên lại nhé!`;

    case 'commission_earned':
      return `Bạn nhận được ${formatCurrency(data?.amount as number)} hoa hồng từ đơn hàng mới!`;

    case 'sub_affiliate_commission':
      return `Nhận ${formatCurrency(data?.amount as number)} từ đội ngũ sub-affiliate của bạn!`;

    case 'withdrawal_approved':
      return `Yêu cầu rút ${formatCurrency(data?.amount as number)} đã được duyệt. Tiền sẽ về trong 1-3 ngày.`;

    case 'withdrawal_rejected':
      return `Yêu cầu rút tiền bị từ chối. Lý do: ${data?.reason || 'Vui lòng liên hệ hỗ trợ'}`;

    default:
      return 'Bạn có thông báo mới từ GEMRAL.';
  }
}

function getChannelId(type: string): string {
  // Call notifications - high priority
  if (type === 'incoming_call' || type === 'missed_call') return 'incoming_call';
  // Message notifications
  if (type === 'new_message') return 'messages';
  // Partnership notifications
  if (type.includes('tier')) return 'tier';
  if (type.includes('commission') || type.includes('withdrawal') || type.includes('payment')) return 'commission';
  return 'default';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0);
}
