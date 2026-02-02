// =====================================================
// GEM ECONOMY SERVICE
// Complete service for Gem Economy
// Version: 3.0 - Production
// =====================================================

import { supabase } from './supabase';
import * as Linking from 'expo-linking';

// =====================================================
// CONFIGURATION
// =====================================================
export const GEM_CONFIG = {
  // Rate
  GEM_TO_VND_RATE: 100, // 1 gem = 100 VND

  // Shopify
  SHOPIFY_STORE_DOMAIN: 'yinyangmasters.com',

  // Daily Check-in
  DAILY_CHECKIN_GEMS: 5,
  STREAK_BONUS_7_DAYS: 20,
  STREAK_BONUS_30_DAYS: 100,

  // Welcome Bonus
  WELCOME_BONUS_GEMS: 50,

  // Pending Credits
  PENDING_CREDIT_EXPIRY_DAYS: 90,

  // Polling
  POLL_INTERVAL_MS: 5000,
  MAX_POLL_COUNT: 60, // 5 minutes
};

// =====================================================
// GEM BALANCE
// =====================================================

/**
 * Get current gem balance for user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Gem balance
 */
export const getGemBalance = async (userId) => {
  if (!userId) return 0;

  try {
    const { data, error } = await supabase
      .rpc('get_gem_balance', { p_user_id: userId });

    if (error) {
      console.error('[GemEconomy] getGemBalance error:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('[GemEconomy] getGemBalance exception:', error);
    return 0;
  }
};

// =====================================================
// GEM PACKS
// =====================================================

/**
 * Fetch all active gem packs
 * @returns {Promise<Array>} - List of gem packs
 */
export const getGemPacks = async () => {
  try {
    const { data, error } = await supabase
      .from('gem_packs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[GemEconomy] getGemPacks error:', error);
      return [];
    }

    // Add calculated fields
    return (data || []).map(pack => ({
      ...pack,
      // VND per gem (rounded)
      vnd_per_gem: pack.total_gems > 0
        ? Math.round(pack.price / pack.total_gems)
        : 0,
      // Savings percent
      savings_percent: pack.bonus_gems > 0 && pack.gems_quantity > 0
        ? Math.round((pack.bonus_gems / pack.gems_quantity) * 100)
        : 0,
    }));
  } catch (error) {
    console.error('[GemEconomy] getGemPacks exception:', error);
    return [];
  }
};

/**
 * Get gem pack by Shopify variant ID
 * @param {string} variantId - Shopify variant ID
 * @returns {Promise<Object|null>} - Gem pack or null
 */
export const getGemPackByVariantId = async (variantId) => {
  if (!variantId) return null;

  try {
    const { data, error } = await supabase
      .from('gem_packs')
      .select('*')
      .eq('shopify_variant_id', variantId)
      .single();

    if (error) {
      console.error('[GemEconomy] getGemPackByVariantId error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[GemEconomy] getGemPackByVariantId exception:', error);
    return null;
  }
};

/**
 * Get gem pack by slug
 * @param {string} slug - Pack slug
 * @returns {Promise<Object|null>} - Gem pack or null
 */
export const getGemPackBySlug = async (slug) => {
  if (!slug) return null;

  try {
    const { data, error } = await supabase
      .from('gem_packs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('[GemEconomy] getGemPackBySlug error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[GemEconomy] getGemPackBySlug exception:', error);
    return null;
  }
};

// =====================================================
// PURCHASE FLOW
// =====================================================

/**
 * Create purchase order record
 * @param {string} userId - User ID
 * @param {Object} pack - Gem pack object
 * @returns {Promise<Object>} - Created order
 */
export const createPurchaseOrder = async (userId, pack) => {
  if (!userId || !pack?.id) {
    throw new Error('Invalid userId or pack');
  }

  try {
    // Get current balance first
    const currentBalance = await getGemBalance(userId);

    const { data, error } = await supabase
      .from('gem_purchase_orders')
      .insert({
        user_id: userId,
        pack_id: pack.id,
        pack_slug: pack.slug || '',
        gems_expected: pack.total_gems || 0,
        status: 'initiated',
        balance_before: currentBalance,
      })
      .select()
      .single();

    if (error) {
      console.error('[GemEconomy] createPurchaseOrder error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[GemEconomy] createPurchaseOrder exception:', error);
    throw error;
  }
};

/**
 * Build Shopify checkout URL with user tracking
 * @param {Object} pack - Gem pack object
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @returns {string} - Checkout URL
 */
export const buildCheckoutUrl = (pack, userId, userEmail) => {
  if (!pack?.shopify_variant_id) {
    throw new Error('Invalid pack: missing shopify_variant_id');
  }

  const baseUrl = `https://${GEM_CONFIG.SHOPIFY_STORE_DOMAIN}/cart`;
  const variantId = pack.shopify_variant_id;

  // Build URL with attributes for tracking
  const url = new URL(`${baseUrl}/${variantId}:1`);

  if (userEmail) {
    url.searchParams.set('checkout[email]', userEmail);
  }
  if (userId) {
    url.searchParams.set('attributes[user_id]', userId);
  }
  if (pack.slug) {
    url.searchParams.set('attributes[pack_slug]', pack.slug);
  }

  return url.toString();
};

/**
 * Update purchase order with checkout URL
 * @param {string} orderId - Order ID
 * @param {string} checkoutUrl - Shopify checkout URL
 */
export const updatePurchaseOrderCheckout = async (orderId, checkoutUrl) => {
  if (!orderId) return;

  try {
    const { error } = await supabase
      .from('gem_purchase_orders')
      .update({
        shopify_checkout_url: checkoutUrl,
        status: 'checkout',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      console.error('[GemEconomy] updatePurchaseOrderCheckout error:', error);
    }
  } catch (error) {
    console.error('[GemEconomy] updatePurchaseOrderCheckout exception:', error);
  }
};

/**
 * Open checkout URL in browser
 * @param {string} checkoutUrl - URL to open
 * @returns {Promise<boolean>} - Success status
 */
export const openCheckout = async (checkoutUrl) => {
  if (!checkoutUrl) return false;

  try {
    const canOpen = await Linking.canOpenURL(checkoutUrl);
    if (canOpen) {
      await Linking.openURL(checkoutUrl);
      return true;
    }
    console.warn('[GemEconomy] Cannot open URL:', checkoutUrl);
    return false;
  } catch (error) {
    console.error('[GemEconomy] openCheckout exception:', error);
    return false;
  }
};

/**
 * Poll for purchase completion (balance increase)
 * @param {string} userId - User ID
 * @param {number} initialBalance - Balance before purchase
 * @returns {Promise<Object>} - Poll result
 */
export const pollPurchaseStatus = async (userId, initialBalance) => {
  if (!userId) {
    return { status: 'error', error: 'Invalid userId' };
  }

  return new Promise((resolve) => {
    let pollCount = 0;

    const poll = async () => {
      pollCount++;

      try {
        const currentBalance = await getGemBalance(userId);

        // Check if balance increased
        if (currentBalance > initialBalance) {
          resolve({
            status: 'completed',
            previousBalance: initialBalance,
            newBalance: currentBalance,
            gemsReceived: currentBalance - initialBalance,
            pollCount,
          });
          return;
        }

        // Check if max polls reached
        if (pollCount >= GEM_CONFIG.MAX_POLL_COUNT) {
          resolve({
            status: 'timeout',
            previousBalance: initialBalance,
            currentBalance,
            pollCount,
          });
          return;
        }

        // Continue polling
        setTimeout(poll, GEM_CONFIG.POLL_INTERVAL_MS);

      } catch (error) {
        console.error('[GemEconomy] poll error:', error);
        resolve({
          status: 'error',
          error: error.message || 'Unknown error',
          pollCount,
        });
      }
    };

    // Start polling
    poll();
  });
};

// =====================================================
// DAILY CHECK-IN
// =====================================================

/**
 * Get check-in status for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Check-in status
 */
export const getCheckinStatus = async (userId) => {
  const defaultStatus = {
    checked_today: false,
    current_streak: 0,
    longest_streak: 0,
    total_checkins: 0,
    total_gems: 0,
    recent_checkins: [],
    next_bonus: null,
  };

  if (!userId) {
    return defaultStatus;
  }

  try {
    const { data, error } = await supabase
      .rpc('get_checkin_status', { p_user_id: userId });

    if (error) {
      console.error('[GemEconomy] getCheckinStatus error:', error);
      return defaultStatus;
    }

    return data || defaultStatus;
  } catch (error) {
    console.error('[GemEconomy] getCheckinStatus exception:', error);
    return defaultStatus;
  }
};

/**
 * Perform daily check-in
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Check-in result
 */
export const performDailyCheckin = async (userId) => {
  if (!userId) {
    throw new Error('Invalid userId');
  }

  try {
    const { data, error } = await supabase
      .rpc('perform_daily_checkin', { p_user_id: userId });

    if (error) {
      console.error('[GemEconomy] performDailyCheckin error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[GemEconomy] performDailyCheckin exception:', error);
    throw error;
  }
};

// =====================================================
// PENDING CREDITS
// =====================================================

/**
 * Get pending gem credits for user
 * @param {string} userEmail - User email
 * @param {Array<string>} linkedEmails - Linked emails
 * @returns {Promise<Array>} - Pending credits
 */
export const getPendingCredits = async (userEmail, linkedEmails = []) => {
  const allEmails = [userEmail, ...(linkedEmails || [])].filter(Boolean);

  if (allEmails.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('pending_gem_credits')
      .select('*')
      .in('email', allEmails)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('[GemEconomy] getPendingCredits error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[GemEconomy] getPendingCredits exception:', error);
    return [];
  }
};

/**
 * Claim all pending gem credits for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Claim result
 */
export const claimPendingCredits = async (userId) => {
  if (!userId) {
    throw new Error('Invalid userId');
  }

  try {
    const { data, error } = await supabase
      .rpc('claim_pending_gem_credits', { p_user_id: userId });

    if (error) {
      console.error('[GemEconomy] claimPendingCredits error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[GemEconomy] claimPendingCredits exception:', error);
    throw error;
  }
};

// =====================================================
// WELCOME BONUS
// =====================================================

/**
 * Claim welcome bonus (50 gems)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Claim result
 */
export const claimWelcomeBonus = async (userId) => {
  if (!userId) {
    throw new Error('Invalid userId');
  }

  try {
    const { data, error } = await supabase
      .rpc('claim_welcome_bonus', { p_user_id: userId });

    if (error) {
      console.error('[GemEconomy] claimWelcomeBonus error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[GemEconomy] claimWelcomeBonus exception:', error);
    throw error;
  }
};

/**
 * Check if user is eligible for welcome bonus
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Eligibility status
 */
export const checkWelcomeBonusEligibility = async (userId) => {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('welcome_bonus_claimed')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[GemEconomy] checkWelcomeBonusEligibility error:', error);
      return false;
    }

    return !(data?.welcome_bonus_claimed);
  } catch (error) {
    console.error('[GemEconomy] checkWelcomeBonusEligibility exception:', error);
    return false;
  }
};

// =====================================================
// TRANSACTION HISTORY
// =====================================================

/**
 * Fix Vietnamese text without diacritics
 * Maps common transaction descriptions to proper Vietnamese
 */
const VIETNAMESE_TEXT_FIXES = {
  // Boost packages
  'Boost bai viet - Goi Tieu chuan': 'Boost bài viết - Gói Tiêu chuẩn',
  'Boost bai viet - Goi Nang cao': 'Boost bài viết - Gói Nâng cao',
  'Boost bai viet - Goi VIP': 'Boost bài viết - Gói VIP',
  'Boost bai viet': 'Boost bài viết',
  // Gift transactions
  'Gui qua cho': 'Gửi quà cho',
  'Nhan qua tu': 'Nhận quà từ',
  'Tang qua': 'Tặng quà',
  'Nhan qua': 'Nhận quà',
  // Purchase
  'Mua gems': 'Mua Gems',
  'Nap tien': 'Nạp tiền',
  // Check-in
  'Diem danh hang ngay': 'Điểm danh hàng ngày',
  'Thuong streak': 'Thưởng streak',
  // Courses
  'Mua khoa hoc': 'Mua khóa học',
  'Hoan tien khoa hoc': 'Hoàn tiền khóa học',
  // Withdrawal
  'Rut tien': 'Rút tiền',
  'Yeu cau rut tien': 'Yêu cầu rút tiền',
  // General
  'Goi': 'Gói',
  'Tieu chuan': 'Tiêu chuẩn',
  'Nang cao': 'Nâng cao',
};

/**
 * Fix Vietnamese text in transaction description
 * @param {string} text - Original text (may have no diacritics)
 * @returns {string} - Fixed text with proper Vietnamese diacritics
 */
export const fixVietnameseText = (text) => {
  if (!text) return text;

  let fixed = text;
  // Apply all fixes
  Object.entries(VIETNAMESE_TEXT_FIXES).forEach(([from, to]) => {
    // Case-insensitive replace
    const regex = new RegExp(from, 'gi');
    fixed = fixed.replace(regex, to);
  });

  return fixed;
};

/**
 * Get gem transaction history with related profiles
 * @param {string} userId - User ID
 * @param {number} limit - Max transactions to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} - Transaction list with profile info
 */
export const getGemTransactions = async (userId, limit = 50, offset = 0) => {
  if (!userId) return [];

  try {
    // Query from gems_transactions table (simple query - no join)
    const { data, error } = await supabase
      .from('gems_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[GemEconomy] getGemTransactions error:', error);

      // Fallback to wallet_transactions if gems_transactions doesn't exist
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', wallet.id)
          .eq('currency', 'gem')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (!fallbackError) {
          return (fallbackData || []).map(t => ({
            ...t,
            description: fixVietnameseText(t.description),
          }));
        }
      }
      return [];
    }

    // For gift transactions, fetch related user info from sent_gifts table
    const giftTransactions = (data || []).filter(t =>
      t.reference_type === 'gift' ||
      t.reference_type === 'gift_received' ||
      t.description?.includes('quà')
    );

    // Get reference IDs for gift transactions
    const giftReferenceIds = giftTransactions
      .map(t => t.reference_id)
      .filter(Boolean);

    // Fetch sent_gifts to get sender/recipient info
    let giftInfoMap = {};
    if (giftReferenceIds.length > 0) {
      const { data: giftData } = await supabase
        .from('sent_gifts')
        .select(`
          id,
          sender_id,
          recipient_id,
          sender:sender_id(id, full_name, display_name, avatar_url),
          recipient:recipient_id(id, full_name, display_name, avatar_url)
        `)
        .in('id', giftReferenceIds);

      if (giftData) {
        giftInfoMap = giftData.reduce((acc, g) => {
          acc[g.id] = g;
          return acc;
        }, {});
      }
    }

    // Process transactions: fix Vietnamese text and extract profile info
    return (data || []).map(t => {
      const giftInfo = giftInfoMap[t.reference_id];
      let relatedUserName = null;
      let relatedUserAvatar = null;

      // If it's a gift transaction, determine if user is sender or receiver
      if (giftInfo) {
        if (giftInfo.sender_id === userId) {
          // User is sender - show recipient info
          relatedUserName = giftInfo.recipient?.display_name || giftInfo.recipient?.full_name;
          relatedUserAvatar = giftInfo.recipient?.avatar_url;
        } else {
          // User is recipient - show sender info
          relatedUserName = giftInfo.sender?.display_name || giftInfo.sender?.full_name;
          relatedUserAvatar = giftInfo.sender?.avatar_url;
        }
      }

      return {
        ...t,
        description: fixVietnameseText(t.description),
        related_user_name: relatedUserName,
        related_user_avatar: relatedUserAvatar,
      };
    });
  } catch (error) {
    console.error('[GemEconomy] getGemTransactions exception:', error);
    return [];
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format gem amount with K suffix
 * @param {number} amount - Gem amount
 * @returns {string} - Formatted string
 */
export const formatGemAmount = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return num.toLocaleString();
};

/**
 * Format VND currency
 * @param {number} amount - Amount in VND
 * @returns {string} - Formatted currency string
 */
export const formatVND = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Calculate VND value from gems
 * @param {number} gems - Gem amount
 * @returns {number} - VND value
 */
export const calculateVndValue = (gems) => {
  return (Number(gems) || 0) * GEM_CONFIG.GEM_TO_VND_RATE;
};

/**
 * Get transaction type label in Vietnamese
 * @param {string} type - Transaction type
 * @returns {string} - Vietnamese label
 */
export const getTransactionTypeLabel = (type) => {
  const labels = {
    gem_purchase: 'Mua Gems',
    daily_checkin: 'Điểm danh',
    welcome_bonus: 'Welcome Bonus',
    streak_bonus: 'Thưởng Streak',
    pending_credit_claim: 'Claim Gems',
    gift_sent: 'Gửi tặng',
    gift_received: 'Nhận tặng',
    tip_sent: 'Tip',
    tip_received: 'Nhận Tip',
    course_purchase: 'Mua khóa học',
    course_refund: 'Hoàn tiền khóa học',
    admin_grant: 'Admin cộng',
    admin_deduct: 'Admin trừ',
    purchase: 'Mua',
    bonus: 'Bonus',
    withdrawal: 'Rút tiền',
    refund: 'Hoàn tiền',
  };
  return labels[type] || type;
};

// =====================================================
// DEFAULT EXPORT
// =====================================================
const gemEconomyService = {
  // Config
  GEM_CONFIG,

  // Balance
  getGemBalance,

  // Packs
  getGemPacks,
  getGemPackByVariantId,
  getGemPackBySlug,

  // Purchase
  createPurchaseOrder,
  buildCheckoutUrl,
  updatePurchaseOrderCheckout,
  openCheckout,
  pollPurchaseStatus,

  // Daily Check-in
  getCheckinStatus,
  performDailyCheckin,

  // Pending Credits
  getPendingCredits,
  claimPendingCredits,

  // Welcome Bonus
  claimWelcomeBonus,
  checkWelcomeBonusEligibility,

  // History
  getGemTransactions,

  // Utils
  formatGemAmount,
  formatVND,
  calculateVndValue,
  getTransactionTypeLabel,
  fixVietnameseText,
};

export default gemEconomyService;
