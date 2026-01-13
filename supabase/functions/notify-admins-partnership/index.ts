/**
 * Notify Admins Partnership Edge Function
 * Send push notifications to all admins for partnership events
 *
 * Events:
 * - new_application: New CTV/KOL application submitted
 * - ctv_auto_approved: CTV auto-approved after 3 days
 * - tier_upgraded: CTV tier upgraded
 * - tier_downgraded: CTV tier downgraded
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
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

interface NotificationPayload {
  event_type: 'new_application' | 'ctv_auto_approved' | 'tier_upgraded' | 'tier_downgraded';
  data: {
    application_id?: string;
    application_type?: 'ctv' | 'kol';
    user_id?: string;
    full_name?: string;
    email?: string;
    referral_code?: string;
    from_tier?: string;
    to_tier?: string;
    total_sales?: number;
    monthly_sales?: number;
    required_sales?: number;
    [key: string]: unknown;
  };
}

/**
 * Get all admin push tokens
 */
async function getAdminPushTokens(supabase: any): Promise<{ user_id: string; push_token: string }[]> {
  try {
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('id, push_token, expo_push_token')
      .or('role.eq.admin,is_admin.eq.true');

    if (error) {
      console.error('[NotifyAdmins] Error fetching admin tokens:', error);
      return [];
    }

    return (admins || [])
      .filter((a: any) => a.push_token || a.expo_push_token)
      .map((a: any) => ({
        user_id: a.id,
        push_token: a.push_token || a.expo_push_token,
      }));
  } catch (err) {
    console.error('[NotifyAdmins] Error:', err);
    return [];
  }
}

/**
 * Send push notifications to all admins
 */
async function sendPushToAdmins(
  adminTokens: { user_id: string; push_token: string }[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<number> {
  if (adminTokens.length === 0) {
    console.log('[NotifyAdmins] No admin tokens available');
    return 0;
  }

  const messages: PushMessage[] = adminTokens.map((admin) => ({
    to: admin.push_token,
    title,
    body,
    data: {
      ...data,
      target_admin: admin.user_id,
    },
    sound: 'default',
    badge: 1,
    channelId: 'admin',
  }));

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    const sentCount = result.data?.filter((r: any) => r.status === 'ok').length || 0;

    console.log(`[NotifyAdmins] Sent ${sentCount}/${adminTokens.length} push notifications`);
    return sentCount;
  } catch (err) {
    console.error('[NotifyAdmins] Push error:', err);
    return 0;
  }
}

/**
 * Build notification content based on event type
 */
function buildNotificationContent(payload: NotificationPayload): { title: string; body: string; screen: string } | null {
  const { event_type, data } = payload;

  const tierNames: Record<string, string> = {
    bronze: '🥉 Đồng',
    silver: '🥈 Bạc',
    gold: '🥇 Vàng',
    platinum: '💎 Bạch Kim',
    diamond: '👑 Kim Cương',
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

  switch (event_type) {
    case 'new_application': {
      const isKOL = data.application_type === 'kol';
      return {
        title: isKOL ? '🌟 Đơn đăng ký KOL mới!' : '📋 Đơn đăng ký CTV mới!',
        body: `${data.full_name || 'Người dùng'} vừa đăng ký làm ${isKOL ? 'KOL Affiliate' : 'CTV'}. Vui lòng kiểm tra.`,
        screen: 'AdminApplications',
      };
    }

    case 'ctv_auto_approved': {
      return {
        title: '✅ CTV được tự động duyệt',
        body: `${data.full_name || 'Người dùng'} đã được auto-approve thành CTV sau 3 ngày. Mã: ${data.referral_code}`,
        screen: 'AdminPartners',
      };
    }

    case 'tier_upgraded': {
      const fromTier = tierNames[data.from_tier || ''] || data.from_tier;
      const toTier = tierNames[data.to_tier || ''] || data.to_tier;
      return {
        title: '🚀 CTV thăng cấp tự động',
        body: `${data.full_name || 'CTV'} thăng từ ${fromTier} lên ${toTier}. Doanh số: ${formatCurrency(data.total_sales || 0)}`,
        screen: 'AdminPartners',
      };
    }

    case 'tier_downgraded': {
      const fromTier = tierNames[data.from_tier || ''] || data.from_tier;
      const toTier = tierNames[data.to_tier || ''] || data.to_tier;
      return {
        title: '📉 CTV hạ cấp tự động',
        body: `${data.full_name || 'CTV'} hạ từ ${fromTier} xuống ${toTier}. Doanh số: ${formatCurrency(data.monthly_sales || 0)}/${formatCurrency(data.required_sales || 0)}`,
        screen: 'AdminPartners',
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    console.log('[NotifyAdmins] Received:', JSON.stringify(payload));

    if (!payload.event_type) {
      return new Response(
        JSON.stringify({ error: 'Missing event_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build notification content
    const content = buildNotificationContent(payload);
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Unknown event type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin tokens
    const adminTokens = await getAdminPushTokens(supabase);

    // Send push notifications
    const pushSentCount = await sendPushToAdmins(
      adminTokens,
      content.title,
      content.body,
      {
        type: payload.event_type,
        screen: content.screen,
        ...payload.data,
      }
    );

    // Also create in-app notifications for admins
    const { data: adminIds } = await supabase.rpc('get_admin_user_ids');
    let inAppCount = 0;

    if (adminIds && adminIds.length > 0) {
      for (const { user_id } of adminIds) {
        const { error } = await supabase.from('notifications').insert({
          user_id,
          type: payload.event_type,
          title: content.title,
          body: content.body,
          data: {
            screen: content.screen,
            ...payload.data,
          },
          is_read: false,
          created_at: new Date().toISOString(),
        });

        if (!error) inAppCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        push_sent: pushSentCount,
        in_app_created: inAppCount,
        admin_count: adminTokens.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[NotifyAdmins] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
