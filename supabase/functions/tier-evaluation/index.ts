/**
 * Tier Evaluation Edge Function
 * GEM Partnership System v3.0
 *
 * Handles:
 * - Weekly tier upgrades (Monday 00:00 UTC+7)
 * - Monthly tier downgrades (last day of month)
 * - CTV auto-approve (every hour)
 * - Monthly sales reset (1st of month)
 *
 * Reference: GEM_PARTNERSHIP_MASTER_PLAN_V3.md
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Expo Push API
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// ============================================================
// TIER CONFIGURATION (from GEM_PARTNERSHIP_OFFICIAL_POLICY_V3)
// ============================================================

// CTV Tier thresholds (VND)
const TIER_THRESHOLDS: Record<string, number> = {
  bronze: 0,
  silver: 50_000_000,      // 50M
  gold: 150_000_000,       // 150M
  platinum: 400_000_000,   // 400M
  diamond: 800_000_000,    // 800M
};

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

// Commission rates by tier
const COMMISSION_RATES: Record<string, { digital: number; physical: number }> = {
  bronze: { digital: 0.10, physical: 0.06 },
  silver: { digital: 0.15, physical: 0.08 },
  gold: { digital: 0.20, physical: 0.10 },
  platinum: { digital: 0.25, physical: 0.12 },
  diamond: { digital: 0.30, physical: 0.15 },
  kol: { digital: 0.20, physical: 0.20 },
};

// Sub-affiliate rates
const SUB_AFFILIATE_RATES: Record<string, number> = {
  bronze: 0.02,
  silver: 0.025,
  gold: 0.03,
  platinum: 0.035,
  diamond: 0.04,
  kol: 0.035,
};

// Payment schedules
const PAYMENT_SCHEDULES: Record<string, string> = {
  bronze: 'monthly',
  silver: 'monthly',
  gold: 'biweekly',
  platinum: 'weekly',
  diamond: 'weekly',
  kol: 'biweekly',
};

// Tier Vietnamese names
const TIER_NAMES: Record<string, string> = {
  bronze: '🥉 Đồng',
  silver: '🥈 Bạc',
  gold: '🥇 Vàng',
  platinum: '💎 Bạch Kim',
  diamond: '👑 Kim Cương',
};

// Resource access levels
const RESOURCE_ACCESS_LEVELS: Record<string, string> = {
  bronze: 'basic',
  silver: 'basic',
  gold: 'gold_plus',
  platinum: 'platinum_plus',
  diamond: 'diamond_only',
};

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    let action = '';
    try {
      const body = await req.json();
      action = body.action || '';
    } catch {
      // No body provided
    }

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required. Valid actions: weekly_upgrade, monthly_downgrade, ctv_auto_approve, reset_monthly_sales' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[TierEvaluation] Starting action: ${action}`);

    let result;

    switch (action) {
      case 'weekly_upgrade':
        result = await handleWeeklyUpgrade(supabase);
        break;
      case 'monthly_downgrade':
        result = await handleMonthlyDowngrade(supabase);
        break;
      case 'ctv_auto_approve':
        result = await handleCTVAutoApprove(supabase);
        break;
      case 'reset_monthly_sales':
        result = await handleResetMonthlySales(supabase);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Valid actions: weekly_upgrade, monthly_downgrade, ctv_auto_approve, reset_monthly_sales` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`[TierEvaluation] Action ${action} complete:`, JSON.stringify(result));

    return new Response(
      JSON.stringify({
        success: true,
        action,
        timestamp: new Date().toISOString(),
        ...result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[TierEvaluation] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================
// WEEKLY TIER UPGRADE
// Runs every Monday at 00:00 UTC+7 (17:00 UTC Sunday)
// ============================================================

interface UpgradeResult {
  user_id: string;
  from_tier: string;
  to_tier: string;
  total_sales: number;
}

async function handleWeeklyUpgrade(supabase: any) {
  console.log('[TierEvaluation] Starting weekly tier upgrade check...');

  const upgrades: UpgradeResult[] = [];
  const errors: string[] = [];

  try {
    // Get all active CTVs (not KOLs - KOLs don't have tier upgrades)
    const { data: profiles, error } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('role', 'ctv')
      .eq('is_active', true);

    if (error) throw error;

    console.log(`[TierEvaluation] Found ${profiles?.length || 0} active CTVs to check`);

    for (const profile of profiles || []) {
      try {
        const currentTier = profile.ctv_tier;
        const currentIndex = TIER_ORDER.indexOf(currentTier);

        // Skip if already at max tier (diamond)
        if (currentIndex === TIER_ORDER.length - 1) {
          continue;
        }

        const totalSales = profile.total_sales || 0;

        // Find the highest tier they qualify for
        let newTier = currentTier;
        for (let i = TIER_ORDER.length - 1; i > currentIndex; i--) {
          const tier = TIER_ORDER[i];
          if (totalSales >= TIER_THRESHOLDS[tier]) {
            newTier = tier;
            break;
          }
        }

        // Upgrade if tier changed (only upgrades, not downgrades)
        if (newTier !== currentTier) {
          console.log(`[TierEvaluation] Upgrading ${profile.user_id}: ${currentTier} -> ${newTier} (sales: ${totalSales})`);

          // Update affiliate profile
          const { error: updateError } = await supabase
            .from('affiliate_profiles')
            .update({
              ctv_tier: newTier,
              last_upgrade_at: new Date().toISOString(),
              last_tier_check_at: new Date().toISOString(),
              payment_schedule: PAYMENT_SCHEDULES[newTier],
              resource_access_level: RESOURCE_ACCESS_LEVELS[newTier],
            })
            .eq('id', profile.id);

          if (updateError) {
            errors.push(`Update error for ${profile.user_id}: ${updateError.message}`);
            continue;
          }

          // Send notification to USER
          await sendTierChangeNotification(supabase, profile.user_id, 'upgrade', currentTier, newTier, totalSales);

          // ========== NOTIFY ADMINS ==========
          // Get user's name for notification
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', profile.user_id)
            .single();

          const userName = userProfile?.full_name || 'CTV';

          // Create in-app notification for admins
          await createAdminInAppNotification(supabase, 'notify_admins_ctv_tier_upgraded', {
            p_user_id: profile.user_id,
            p_full_name: userName,
            p_from_tier: currentTier,
            p_to_tier: newTier,
            p_total_sales: totalSales,
          });

          // Send push notification to admins
          await notifyAllAdmins(
            supabase,
            '🚀 CTV thăng cấp tự động',
            `${userName} thăng từ ${TIER_NAMES[currentTier]} lên ${TIER_NAMES[newTier]}. Doanh số: ${formatCurrency(totalSales)}`,
            {
              type: 'ctv_tier_upgraded',
              user_id: profile.user_id,
              from_tier: currentTier,
              to_tier: newTier,
              total_sales: totalSales,
              screen: 'AdminPartners',
            }
          );
          // ====================================

          upgrades.push({
            user_id: profile.user_id,
            from_tier: currentTier,
            to_tier: newTier,
            total_sales: totalSales,
          });
        }
      } catch (profileError: any) {
        errors.push(`Error processing ${profile.user_id}: ${profileError.message}`);
      }
    }

    console.log(`[TierEvaluation] Weekly upgrade complete. ${upgrades.length} partners upgraded.`);

    return {
      upgrades_count: upgrades.length,
      upgrades,
      errors,
    };

  } catch (err: any) {
    console.error('[TierEvaluation] Weekly upgrade error:', err);
    return {
      upgrades_count: 0,
      upgrades: [],
      errors: [err.message],
    };
  }
}

// ============================================================
// MONTHLY TIER DOWNGRADE
// Runs on last day of month at 23:59 UTC+7 (16:59 UTC)
// Downgrade if monthly_sales < 10% of tier threshold
// ============================================================

interface DowngradeResult {
  user_id: string;
  from_tier: string;
  to_tier: string;
  monthly_sales: number;
  required_sales: number;
}

async function handleMonthlyDowngrade(supabase: any) {
  console.log('[TierEvaluation] Starting monthly tier downgrade check...');

  const downgrades: DowngradeResult[] = [];
  const errors: string[] = [];

  try {
    // Get active CTVs above bronze (bronze can't be downgraded)
    const { data: profiles, error } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('role', 'ctv')
      .eq('is_active', true)
      .neq('ctv_tier', 'bronze');

    if (error) throw error;

    console.log(`[TierEvaluation] Found ${profiles?.length || 0} CTVs above bronze to check`);

    for (const profile of profiles || []) {
      try {
        const currentTier = profile.ctv_tier;
        const currentThreshold = TIER_THRESHOLDS[currentTier];

        // 10% of threshold is the minimum monthly sales to maintain tier
        const minMonthlySales = currentThreshold * 0.10;
        const monthlySales = profile.monthly_sales || 0;

        // Check if should downgrade
        if (monthlySales < minMonthlySales) {
          const currentIndex = TIER_ORDER.indexOf(currentTier);
          const newTier = TIER_ORDER[Math.max(0, currentIndex - 1)];

          console.log(`[TierEvaluation] Downgrading ${profile.user_id}: ${currentTier} -> ${newTier} (sales: ${monthlySales}, required: ${minMonthlySales})`);

          // Update affiliate profile
          const { error: updateError } = await supabase
            .from('affiliate_profiles')
            .update({
              ctv_tier: newTier,
              last_downgrade_at: new Date().toISOString(),
              last_tier_check_at: new Date().toISOString(),
              payment_schedule: PAYMENT_SCHEDULES[newTier],
              resource_access_level: RESOURCE_ACCESS_LEVELS[newTier],
            })
            .eq('id', profile.id);

          if (updateError) {
            errors.push(`Update error for ${profile.user_id}: ${updateError.message}`);
            continue;
          }

          // Send notification to USER
          await sendTierChangeNotification(supabase, profile.user_id, 'downgrade', currentTier, newTier, monthlySales, minMonthlySales);

          // ========== NOTIFY ADMINS ==========
          // Get user's name for notification
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', profile.user_id)
            .single();

          const userName = userProfile?.full_name || 'CTV';

          // Create in-app notification for admins
          await createAdminInAppNotification(supabase, 'notify_admins_ctv_tier_downgraded', {
            p_user_id: profile.user_id,
            p_full_name: userName,
            p_from_tier: currentTier,
            p_to_tier: newTier,
            p_monthly_sales: monthlySales,
            p_required_sales: minMonthlySales,
          });

          // Send push notification to admins
          await notifyAllAdmins(
            supabase,
            '📉 CTV hạ cấp tự động',
            `${userName} hạ từ ${TIER_NAMES[currentTier]} xuống ${TIER_NAMES[newTier]}. Doanh số: ${formatCurrency(monthlySales)}/${formatCurrency(minMonthlySales)}`,
            {
              type: 'ctv_tier_downgraded',
              user_id: profile.user_id,
              from_tier: currentTier,
              to_tier: newTier,
              monthly_sales: monthlySales,
              required_sales: minMonthlySales,
              screen: 'AdminPartners',
            }
          );
          // ====================================

          downgrades.push({
            user_id: profile.user_id,
            from_tier: currentTier,
            to_tier: newTier,
            monthly_sales: monthlySales,
            required_sales: minMonthlySales,
          });
        }
      } catch (profileError: any) {
        errors.push(`Error processing ${profile.user_id}: ${profileError.message}`);
      }
    }

    console.log(`[TierEvaluation] Monthly downgrade complete. ${downgrades.length} partners downgraded.`);

    return {
      downgrades_count: downgrades.length,
      downgrades,
      errors,
    };

  } catch (err: any) {
    console.error('[TierEvaluation] Monthly downgrade error:', err);
    return {
      downgrades_count: 0,
      downgrades: [],
      errors: [err.message],
    };
  }
}

// ============================================================
// CTV AUTO-APPROVE
// Runs every hour to approve pending CTVs after 3 days
// ============================================================

interface ApprovalResult {
  user_id: string;
  referral_code: string;
  referrer_id: string | null;
}

async function handleCTVAutoApprove(supabase: any) {
  console.log('[TierEvaluation] Starting CTV auto-approve check...');

  const approved: ApprovalResult[] = [];
  const errors: string[] = [];
  const now = new Date().toISOString();

  try {
    // Get pending CTV applications where auto_approve_at has passed
    const { data: applications, error } = await supabase
      .from('partnership_applications')
      .select('*')
      .eq('application_type', 'ctv')
      .eq('status', 'pending')
      .lte('auto_approve_at', now);

    if (error) throw error;

    console.log(`[TierEvaluation] Found ${applications?.length || 0} CTV applications ready for auto-approve`);

    for (const app of applications || []) {
      try {
        // Update application status
        const { error: updateAppError } = await supabase
          .from('partnership_applications')
          .update({
            status: 'approved',
            reviewed_at: now,
            admin_notes: 'Tu dong duyet sau 3 ngay',
          })
          .eq('id', app.id);

        if (updateAppError) {
          errors.push(`Update application error for ${app.id}: ${updateAppError.message}`);
          continue;
        }

        // Generate unique referral code
        const referralCode = await generateUniqueReferralCode(supabase, 'CTV');

        // Find referrer if referred_by_code exists
        let referrerId: string | null = null;
        if (app.referred_by_code) {
          const { data: referrer } = await supabase
            .from('affiliate_profiles')
            .select('user_id')
            .eq('referral_code', app.referred_by_code)
            .single();
          referrerId = referrer?.user_id || null;
        }

        // Create or update affiliate profile
        const { error: upsertError } = await supabase
          .from('affiliate_profiles')
          .upsert({
            user_id: app.user_id,
            referral_code: referralCode,
            role: 'ctv',
            ctv_tier: 'bronze',
            referred_by: referrerId,
            payment_schedule: 'monthly',
            resource_access_level: 'basic',
            is_active: true,
            total_sales: 0,
            monthly_sales: 0,
            available_balance: 0,
            pending_balance: 0,
            lifetime_earnings: 0,
            sub_affiliate_earnings: 0,
          }, { onConflict: 'user_id' });

        if (upsertError) {
          errors.push(`Upsert profile error for ${app.user_id}: ${upsertError.message}`);
          continue;
        }

        // Send approval notification to new CTV
        await supabase.from('partner_notifications').insert({
          user_id: app.user_id,
          notification_type: 'application_approved',
          title: '🎉 Chuc mung! Don dang ky CTV da duoc duyet',
          message: `Ban da chinh thuc tro thanh Doi Tac Phat Trien ${TIER_NAMES.bronze}. Ma gioi thieu cua ban: ${referralCode}`,
          metadata: {
            referral_code: referralCode,
            tier: 'bronze',
            auto_approved: true,
          },
        });

        // Send push notification
        await sendPushNotificationToUser(supabase, app.user_id,
          '🎉 Don CTV duoc duyet!',
          `Chuc mung! Ban da tro thanh CTV ${TIER_NAMES.bronze}. Ma: ${referralCode}`,
          {
            type: 'ctv_approved',
            referral_code: referralCode,
            screen: 'AffiliateDetail',
          }
        );

        // Notify referrer if exists
        if (referrerId) {
          await supabase.from('partner_notifications').insert({
            user_id: referrerId,
            notification_type: 'sub_affiliate_joined',
            title: '👥 Co doi tac moi tu gioi thieu cua ban!',
            message: `${app.full_name} da tro thanh CTV tu link gioi thieu cua ban. Ban se nhan hoa hong sub-affiliate tu doanh so cua ho!`,
            metadata: {
              partner_name: app.full_name,
              partner_id: app.user_id,
            },
          });

          // Send push to referrer
          await sendPushNotificationToUser(supabase, referrerId,
            '👥 Doi tac moi!',
            `${app.full_name} da tro thanh CTV tu link cua ban!`,
            {
              type: 'sub_affiliate_joined',
              screen: 'AffiliateDetail',
            }
          );
        }

        console.log(`[TierEvaluation] Auto-approved CTV: ${app.user_id}, code: ${referralCode}`);

        // ========== NOTIFY ADMINS ==========
        // Create in-app notification for admins
        await createAdminInAppNotification(supabase, 'notify_admins_ctv_auto_approved', {
          p_user_id: app.user_id,
          p_full_name: app.full_name || 'Người dùng',
          p_referral_code: referralCode,
          p_application_id: app.id,
        });

        // Send push notification to admins
        await notifyAllAdmins(
          supabase,
          '✅ CTV được tự động duyệt',
          `${app.full_name || 'Người dùng'} đã được auto-approve thành CTV. Mã: ${referralCode}`,
          {
            type: 'ctv_auto_approved',
            user_id: app.user_id,
            referral_code: referralCode,
            screen: 'AdminPartners',
          }
        );
        // ====================================

        approved.push({
          user_id: app.user_id,
          referral_code: referralCode,
          referrer_id: referrerId,
        });

      } catch (appError: any) {
        errors.push(`Error processing application ${app.id}: ${appError.message}`);
      }
    }

    console.log(`[TierEvaluation] CTV auto-approve complete. ${approved.length} applications approved.`);

    return {
      approved_count: approved.length,
      approved,
      errors,
    };

  } catch (err: any) {
    console.error('[TierEvaluation] CTV auto-approve error:', err);
    return {
      approved_count: 0,
      approved: [],
      errors: [err.message],
    };
  }
}

// ============================================================
// MONTHLY SALES RESET
// Runs on 1st of month at 00:00 UTC+7 (17:00 UTC last day)
// ============================================================

async function handleResetMonthlySales(supabase: any) {
  console.log('[TierEvaluation] Starting monthly sales reset...');

  try {
    // Reset monthly_sales to 0 for all affiliate profiles
    const { count, error } = await supabase
      .from('affiliate_profiles')
      .update({
        monthly_sales: 0,
        last_tier_check_at: new Date().toISOString(),
      })
      .gt('monthly_sales', 0)
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    console.log(`[TierEvaluation] Monthly sales reset complete. ${count || 0} profiles reset.`);

    return {
      reset_count: count || 0,
    };

  } catch (err: any) {
    console.error('[TierEvaluation] Monthly sales reset error:', err);
    return {
      reset_count: 0,
      errors: [err.message],
    };
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get all admin push tokens for sending notifications
 */
async function getAdminPushTokens(supabase: any): Promise<{ user_id: string; push_token: string; full_name: string }[]> {
  try {
    // Get admin users from profiles
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('id, push_token, full_name, expo_push_token')
      .or('role.eq.admin,is_admin.eq.true');

    if (error) {
      console.error('[TierEvaluation] Error fetching admin tokens:', error);
      return [];
    }

    // Filter admins with valid push tokens
    return (admins || [])
      .filter((a: any) => a.push_token || a.expo_push_token)
      .map((a: any) => ({
        user_id: a.id,
        push_token: a.push_token || a.expo_push_token,
        full_name: a.full_name || 'Admin',
      }));
  } catch (err) {
    console.error('[TierEvaluation] Error in getAdminPushTokens:', err);
    return [];
  }
}

/**
 * Send push notification to all admins
 */
async function notifyAllAdmins(
  supabase: any,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<number> {
  try {
    const adminTokens = await getAdminPushTokens(supabase);

    if (adminTokens.length === 0) {
      console.log('[TierEvaluation] No admin push tokens found');
      return 0;
    }

    console.log(`[TierEvaluation] Sending push to ${adminTokens.length} admins`);

    // Build messages for all admins
    const messages = adminTokens.map((admin) => ({
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

    // Send in batches (Expo allows up to 100 per request)
    const batchSize = 100;
    let sentCount = 0;

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      const result = await response.json();

      if (result.data) {
        sentCount += result.data.filter((r: any) => r.status === 'ok').length;
      }
    }

    console.log(`[TierEvaluation] Sent ${sentCount}/${adminTokens.length} admin notifications`);
    return sentCount;

  } catch (err) {
    console.error('[TierEvaluation] Error notifying admins:', err);
    return 0;
  }
}

/**
 * Call SQL function to create in-app notifications for admins
 */
async function createAdminInAppNotification(
  supabase: any,
  functionName: string,
  params: Record<string, unknown>
): Promise<void> {
  try {
    const { error } = await supabase.rpc(functionName, params);

    if (error) {
      console.error(`[TierEvaluation] Error calling ${functionName}:`, error);
    } else {
      console.log(`[TierEvaluation] In-app notification created via ${functionName}`);
    }
  } catch (err) {
    console.error(`[TierEvaluation] Error in createAdminInAppNotification:`, err);
  }
}

/**
 * Generate unique referral code
 */
async function generateUniqueReferralCode(supabase: any, prefix: string): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let code = prefix;
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code already exists
    const { data: existing } = await supabase
      .from('affiliate_profiles')
      .select('id')
      .eq('referral_code', code)
      .single();

    if (!existing) {
      return code;
    }

    attempts++;
  }

  // Fallback: append timestamp
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Send tier change notification (upgrade or downgrade)
 */
async function sendTierChangeNotification(
  supabase: any,
  userId: string,
  type: 'upgrade' | 'downgrade',
  fromTier: string,
  toTier: string,
  salesAmount: number,
  requiredAmount?: number
) {
  const isUpgrade = type === 'upgrade';
  const rates = COMMISSION_RATES[toTier];

  let title: string;
  let message: string;

  if (isUpgrade) {
    title = `🎉 Chuc mung thang cap ${TIER_NAMES[toTier]}!`;
    message = `Ban da thang cap tu ${TIER_NAMES[fromTier]} len ${TIER_NAMES[toTier]}. ` +
      `Hoa hong moi: Digital ${rates.digital * 100}%, Physical ${rates.physical * 100}%. ` +
      `Sub-affiliate: ${SUB_AFFILIATE_RATES[toTier] * 100}%`;
  } else {
    title = `📉 Tier da thay doi`;
    message = `Doanh so thang cua ban (${formatCurrency(salesAmount)}) chua dat 10% nguong tier ${TIER_NAMES[fromTier]} (${formatCurrency(requiredAmount || 0)}). ` +
      `Tier moi: ${TIER_NAMES[toTier]}. Hay co gang thang cap lai!`;
  }

  // Create in-app notification
  await supabase.from('partner_notifications').insert({
    user_id: userId,
    notification_type: isUpgrade ? 'tier_upgrade' : 'tier_downgrade',
    title,
    message,
    metadata: {
      from_tier: fromTier,
      to_tier: toTier,
      sales_amount: salesAmount,
      required_amount: requiredAmount,
      new_commission_digital: rates.digital,
      new_commission_physical: rates.physical,
      new_sub_affiliate_rate: SUB_AFFILIATE_RATES[toTier],
    },
  });

  // Send push notification
  await sendPushNotificationToUser(supabase, userId, title, message, {
    type: isUpgrade ? 'tier_upgrade' : 'tier_downgrade',
    from_tier: fromTier,
    to_tier: toTier,
    screen: 'AffiliateDetail',
  });
}

/**
 * Send push notification to a specific user
 */
async function sendPushNotificationToUser(
  supabase: any,
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  try {
    // Get user's push token
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .single();

    if (!profile?.push_token) {
      console.log(`[TierEvaluation] No push token for user ${userId}`);
      return;
    }

    const message = {
      to: profile.push_token,
      title,
      body,
      data: data || {},
      sound: 'default',
      badge: 1,
      channelId: 'partnership',
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
      console.error(`[TierEvaluation] Push notification failed for ${userId}:`, result.data[0]?.message);
    } else {
      console.log(`[TierEvaluation] Push notification sent to ${userId}`);
    }

  } catch (err) {
    console.error(`[TierEvaluation] Push notification error for ${userId}:`, err);
  }
}

/**
 * Format currency in VND
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
