/**
 * Gemral - Affiliate Service v3.0
 * Complete Partnership Program for Mobile
 * Reference: GEM_PARTNERSHIP_MASTER_PLAN_V3.md
 *
 * COMMISSION RATES v3.0:
 * - CTV Bronze: Digital 10%, Physical 6%, Sub-Aff 2%
 * - CTV Silver: Digital 15%, Physical 8%, Sub-Aff 2.5%
 * - CTV Gold: Digital 20%, Physical 10%, Sub-Aff 3%
 * - CTV Platinum: Digital 25%, Physical 12%, Sub-Aff 3.5%
 * - CTV Diamond: Digital 30%, Physical 15%, Sub-Aff 4%
 * - KOL: Digital/Physical 20%, Sub-Aff 3.5%
 */

import { supabase } from './supabase';
import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// Import v3.0 constants
import {
  CTV_TIER_CONFIG,
  CTV_TIER_ORDER,
  KOL_CONFIG,
  PARTNERSHIP_ROLES,
  getCommissionRate as getCommissionRateV3,
  getSubAffiliateRate as getSubAffiliateRateV3,
  getTierConfig,
  determineTierByTotalSales,
  calculateTierProgress,
  formatTierDisplay,
  isDigitalProduct,
} from '../constants/partnershipConstants';

// ========================================
// CONSTANTS & CONFIGURATION
// ========================================

// Base URL for referral links (Shopify domain)
const REFERRAL_BASE_URL = 'https://gemral.com';

// App scheme for deep links
const APP_SCHEME = 'gem';

// App Store links
const APP_STORE_IOS = 'https://apps.apple.com/app/gemral/id6738421498';
const APP_STORE_ANDROID = 'https://play.google.com/store/apps/details?id=com.gemral.mobile';

// Product Types
export const PRODUCT_TYPES = {
  // Spiritual Courses
  'course-love': { name: 'Khóa Học Tình Yêu', price: 399000, category: 'spiritual' },
  'course-money': { name: 'Khóa Học Tư Duy Triệu Phú', price: 499000, category: 'spiritual' },
  'course-7days': { name: '7 Ngày Khai Mở Tần Số', price: 1990000, category: 'spiritual' },
  // Trading Courses
  'course-trading-t1': { name: 'Frequency Trading TIER 1', price: 11000000, category: 'trading' },
  'course-trading-t2': { name: 'Frequency Trading TIER 2', price: 21000000, category: 'trading' },
  'course-trading-t3': { name: 'Frequency Trading TIER 3', price: 68000000, category: 'trading' },
  // Scanner Subscriptions
  'scanner-pro': { name: 'Scanner PRO', price: 11964000, category: 'scanner' },
  'scanner-premium': { name: 'Scanner PREMIUM', price: 23964000, category: 'scanner' },
  'scanner-vip': { name: 'Scanner VIP', price: 57000000, category: 'scanner' },
  // Physical Products
  'physical-product': { name: 'Sản Phẩm Vật Lý', price: null, category: 'physical' },
};

// Commission Rates v3.0
// Note: Use getCommissionRateV3() from partnershipConstants for actual calculations
export const COMMISSION_RATES = {
  kol: { digital: 0.20, physical: 0.20 },  // KOL: 20% all products
  ctv: {
    bronze: { digital: 0.10, physical: 0.06 },   // 10% digital, 6% physical
    silver: { digital: 0.15, physical: 0.08 },   // 15% digital, 8% physical
    gold: { digital: 0.20, physical: 0.10 },     // 20% digital, 10% physical
    platinum: { digital: 0.25, physical: 0.12 }, // 25% digital, 12% physical
    diamond: { digital: 0.30, physical: 0.15 },  // 30% digital, 15% physical
  },
};

// Sub-Affiliate Rates v3.0
export const SUB_AFFILIATE_RATES = {
  kol: 0.035,      // KOL: 3.5%
  bronze: 0.02,    // 2%
  silver: 0.025,   // 2.5%
  gold: 0.03,      // 3%
  platinum: 0.035, // 3.5%
  diamond: 0.04,   // 4%
};

// Tier Upgrade Thresholds v3.0 (VND)
export const TIER_THRESHOLDS = {
  bronze: 0,           // 0
  silver: 50000000,    // 50M
  gold: 150000000,     // 150M
  platinum: 400000000, // 400M
  diamond: 800000000,  // 800M
};

// KPI Targets per product type (5 tiers: bronze, silver, gold, platinum, diamond)
export const KPI_TARGETS = {
  'course-love': [30, 40, 50, 65, 80],
  'course-money': [25, 32, 42, 55, 70],
  'course-7days': [10, 13, 17, 23, 30],
  'course-trading-t1': [5, 6, 8, 15, 25],
  'course-trading-t2': [5, 6, 8, 15, 25],
  'course-trading-t3': [5, 6, 8, 15, 25],
  'scanner-pro': [5, 6, 8, 15, 25],
  'scanner-premium': [5, 6, 8, 15, 25],
  'scanner-vip': [5, 6, 8, 15, 25],
};

// Bonus Amounts per tier (5 tiers: bronze, silver, gold, platinum, diamond)
export const BONUS_AMOUNTS = {
  'course-love': [200000, 250000, 400000, 700000, 1000000],
  'course-money': [250000, 350000, 550000, 1000000, 1500000],
  'course-7days': [500000, 750000, 1500000, 2500000, 3000000],
  'course-trading-t1': [5000000, 6000000, 8000000, 15000000, 20000000],
  'course-trading-t2': [5000000, 6000000, 8000000, 15000000, 20000000],
  'course-trading-t3': [5000000, 6000000, 8000000, 15000000, 20000000],
  'scanner-pro': [5000000, 6000000, 8000000, 15000000, 20000000],
  'scanner-premium': [5000000, 6000000, 8000000, 15000000, 20000000],
  'scanner-vip': [5000000, 6000000, 8000000, 15000000, 20000000],
};

// ========================================
// CALCULATION HELPERS v3.0
// ========================================

/**
 * Calculate commission based on role, tier, and product type
 * v3.0: Separate rates for digital and physical products
 */
export function calculateCommission(saleAmount, role, ctvTier = null, productType = 'digital') {
  // Use v3.0 constants from partnershipConstants.js
  const rate = getCommissionRateV3(role, ctvTier, productType);
  return Math.round(saleAmount * rate);
}

/**
 * Calculate sub-affiliate commission
 * v3.0: New feature - commission from sub-affiliates
 */
export function calculateSubAffiliateCommission(saleAmount, role, ctvTier = null) {
  const rate = getSubAffiliateRateV3(role, ctvTier);
  return {
    amount: Math.round(saleAmount * rate),
    rate,
    ratePercent: `${(rate * 100).toFixed(1)}%`,
  };
}

/**
 * Get commission rate as decimal
 * v3.0: Supports digital/physical product types
 */
export function getCommissionRate(role, ctvTier = null, productType = 'digital') {
  return getCommissionRateV3(role, ctvTier, productType);
}

/**
 * Get KPI target for product and tier
 * v3.0: 5 tiers (bronze, silver, gold, platinum, diamond)
 */
export function getKPITarget(productType, ctvTier) {
  const targets = KPI_TARGETS[productType];
  if (!targets) return null;
  const tierIndex = CTV_TIER_ORDER.indexOf(ctvTier);
  return targets[tierIndex >= 0 ? tierIndex : 0] || targets[0];
}

/**
 * Get bonus amount for product and tier
 * v3.0: 5 tiers (bronze, silver, gold, platinum, diamond)
 */
export function getBonusAmount(productType, ctvTier) {
  const bonuses = BONUS_AMOUNTS[productType];
  if (!bonuses) return null;
  const tierIndex = CTV_TIER_ORDER.indexOf(ctvTier);
  return bonuses[tierIndex >= 0 ? tierIndex : 0] || bonuses[0];
}

/**
 * Get next tier upgrade info
 * v3.0: Uses imported calculateTierProgress from partnershipConstants
 */
export function getNextTierInfo(currentTier, totalSales) {
  // Use v3.0 helper from partnershipConstants.js
  return calculateTierProgress(currentTier, totalSales);
}

// ========================================
// API FUNCTIONS
// ========================================

class AffiliateService {
  /**
   * Get or create affiliate profile for current user
   */
  async getOrCreateProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chưa đăng nhập' };

      // Try to get existing profile
      let { data: profile, error } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Create if doesn't exist
      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('affiliate_profiles')
          .insert({
            user_id: user.id,
            role: 'ctv',           // v3.0: 'ctv' instead of 'affiliate'
            ctv_tier: 'bronze',    // v3.0: 'bronze' instead of 'beginner'
            total_sales: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      } else if (error) {
        throw error;
      }

      return { success: true, data: profile };
    } catch (error) {
      console.error('[Affiliate] getOrCreateProfile error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get affiliate profile
   * Checks multiple sources: affiliate_profiles, profiles, and partnership_applications
   */
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 1. Try affiliate_profiles first
      const { data: affiliateProfile, error } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (affiliateProfile) {
        console.log('[Affiliate] Found affiliate_profiles entry');
        return { ...affiliateProfile, is_active: true };
      }

      // 2. Check profiles table for partnership_role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, affiliate_code, partnership_role, ctv_tier, pending_commission, paid_commission')
        .eq('id', user.id)
        .single();

      if (profileData?.partnership_role) {
        console.log('[Affiliate] Found partnership_role in profiles:', profileData.partnership_role);
        return {
          user_id: profileData.id,
          affiliate_code: profileData.affiliate_code,
          role: profileData.partnership_role,
          ctv_tier: profileData.ctv_tier || 'bronze',  // v3.0: 'bronze' default
          is_active: true,
        };
      }

      // 3. Check partnership_applications for approved status
      const { data: application } = await supabase
        .from('partnership_applications')
        .select('status, application_type, approved_at')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (application?.status === 'approved') {
        console.log('[Affiliate] Found approved partnership_applications');
        return {
          user_id: user.id,
          affiliate_code: profileData?.affiliate_code || `GEM${user.id.slice(0, 6).toUpperCase()}`,
          role: application.application_type || 'ctv',  // v3.0: 'ctv' default
          ctv_tier: 'bronze',  // v3.0: 'bronze' default
          is_active: true,
        };
      }

      console.log('[Affiliate] No affiliate profile found');
      return null;
    } catch (error) {
      console.log('[Affiliate] getProfile error:', error.message);
      return null;
    }
  }

  /**
   * Get referral code for a user (centralized single source of truth)
   * Priority: 1. affiliate_codes (product_id IS NULL, active)
   *           2. profiles.affiliate_code
   *           3. Generate fallback + persist
   * @param {string} userId - User ID (optional, uses current user if not provided)
   * @returns {Promise<string|null>} The referral code string
   */
  async getReferralCode(userId = null) {
    try {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        uid = user.id;
      }

      // 1. Try affiliate_codes table (main referral code, no product)
      const { data: codeRow } = await supabase
        .from('affiliate_codes')
        .select('code')
        .eq('user_id', uid)
        .is('product_id', null)
        .eq('is_active', true)
        .maybeSingle();

      if (codeRow?.code) return codeRow.code;

      // 2. Fallback: profiles.affiliate_code
      const { data: profile } = await supabase
        .from('profiles')
        .select('affiliate_code')
        .eq('id', uid)
        .single();

      if (profile?.affiliate_code) return profile.affiliate_code;

      // 3. Final fallback: generate, persist, and return
      const generatedCode = 'GEM' + uid.slice(0, 6).toUpperCase();

      // Insert into affiliate_codes
      await supabase
        .from('affiliate_codes')
        .insert({ user_id: uid, code: generatedCode, is_active: true })
        .select()
        .maybeSingle();

      // Also update profiles.affiliate_code
      await supabase
        .from('profiles')
        .update({ affiliate_code: generatedCode })
        .eq('id', uid);

      return generatedCode;
    } catch (error) {
      console.error('[Affiliate] getReferralCode error:', error);
      // Ultra-fallback: return generated code without persisting
      if (userId) return 'GEM' + userId.slice(0, 6).toUpperCase();
      return null;
    }
  }

  /**
   * Generate referral link
   * Format: https://gemral.com/?ref={code}&product={type}
   */
  async generateReferralLink(productType = null) {
    try {
      const code = await this.getReferralCode();
      if (!code) return null;

      let link = `${REFERRAL_BASE_URL}?ref=${code.code}`;
      if (productType) {
        link += `&product=${productType}`;
      }
      return link;
    } catch (error) {
      console.error('[Affiliate] generateReferralLink error:', error);
      return null;
    }
  }

  /**
   * Track referral link click
   */
  async trackClick(referralCode) {
    try {
      const { data, error } = await supabase.rpc('increment_affiliate_clicks', {
        code_param: referralCode,
      });

      // Fallback if RPC doesn't exist: read current value, increment, update
      if (error) {
        const { data: current } = await supabase
          .from('affiliate_codes')
          .select('clicks')
          .eq('code', referralCode)
          .single();

        const { error: updateError } = await supabase
          .from('affiliate_codes')
          .update({ clicks: (current?.clicks || 0) + 1 })
          .eq('code', referralCode);

        if (updateError) throw updateError;
      }

      return { success: true };
    } catch (error) {
      console.error('[Affiliate] trackClick error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Share referral link using native share
   */
  async shareReferralLink(productType = null) {
    try {
      const link = await this.generateReferralLink(productType);
      if (!link) {
        return { success: false, error: 'Không thể tạo link giới thiệu' };
      }

      const productName = productType ? PRODUCT_TYPES[productType]?.name : 'Gemral';
      const message = `Tham gia ${productName} cùng tôi! Đăng ký qua link này để nhận ưu đãi đặc biệt:\n\n${link}`;

      const result = await Share.share({
        title: 'Chia sẻ link giới thiệu',
        message: Platform.OS === 'ios' ? message : `${message}`,
        url: Platform.OS === 'ios' ? link : undefined,
      });

      if (result.action === Share.sharedAction) {
        return { success: true, platform: result.activityType };
      }
      return { success: false, dismissed: true };
    } catch (error) {
      console.error('[Affiliate] shareReferralLink error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Copy referral link to clipboard
   */
  async copyReferralLink(productType = null) {
    try {
      const link = await this.generateReferralLink(productType);
      if (!link) return { success: false, error: 'Không thể tạo link' };

      await Clipboard.setStringAsync(link);
      return { success: true, link };
    } catch (error) {
      console.error('[Affiliate] copyReferralLink error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all referrals for current user
   */
  async getReferrals(limit = 50, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('affiliate_referrals')
        .select(`
          *,
          referred_user:profiles!referred_user_id(email, full_name, avatar_url)
        `)
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Affiliate] getReferrals error:', error);
      return [];
    }
  }

  /**
   * Get sales for current user
   */
  async getSales(limit = 50, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('affiliate_sales')
        .select('*')
        .eq('affiliate_id', user.id)
        .order('purchase_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Affiliate] getSales error:', error);
      return [];
    }
  }

  /**
   * Get commissions for current user
   */
  async getCommissions(status = null, limit = 50, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('affiliate_commissions')
        .select(`
          *,
          sale:affiliate_sales(product_type, product_name, sale_amount, purchase_date)
        `)
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Affiliate] getCommissions error:', error);
      return [];
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const profile = await this.getProfile();
      if (!profile) return null;

      // Get referral counts
      const { count: totalReferrals } = await supabase
        .from('affiliate_referrals')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', user.id);

      const { count: convertedReferrals } = await supabase
        .from('affiliate_referrals')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', user.id)
        .eq('status', 'converted');

      // Get commission totals
      const { data: commissionStats } = await supabase
        .from('affiliate_commissions')
        .select('status, commission_amount')
        .eq('affiliate_id', user.id);

      const pending = (commissionStats || [])
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

      const approved = (commissionStats || [])
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

      const paid = (commissionStats || [])
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

      // Get this month's stats
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      firstOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlySales } = await supabase
        .from('affiliate_sales')
        .select('sale_amount')
        .eq('affiliate_id', user.id)
        .gte('purchase_date', firstOfMonth.toISOString());

      const monthlyRevenue = (monthlySales || [])
        .reduce((sum, s) => sum + parseFloat(s.sale_amount || 0), 0);

      // Tier upgrade info
      const tierInfo = getNextTierInfo(profile.ctv_tier, profile.total_sales || 0);

      return {
        profile,
        referrals: {
          total: totalReferrals || 0,
          converted: convertedReferrals || 0,
          conversionRate: totalReferrals > 0
            ? ((convertedReferrals || 0) / totalReferrals * 100).toFixed(1)
            : 0,
        },
        commissions: {
          pending,
          approved,
          paid,
          total: pending + approved + paid,
        },
        monthly: {
          sales: monthlySales?.length || 0,
          revenue: monthlyRevenue,
        },
        tierUpgrade: tierInfo,
      };
    } catch (error) {
      console.error('[Affiliate] getDashboardStats error:', error);
      return null;
    }
  }

  /**
   * Get KPI bonuses
   */
  async getKPIBonuses(limit = 12) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('affiliate_bonus_kpi')
        .select('*')
        .eq('affiliate_id', user.id)
        .order('month', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Affiliate] getKPIBonuses error:', error);
      return [];
    }
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(amount, method, accountDetails) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Validate minimum amount
      const MIN_WITHDRAWAL = 500000; // 500K VND
      if (amount < MIN_WITHDRAWAL) {
        return { success: false, error: `Rút tối thiểu ${MIN_WITHDRAWAL.toLocaleString('vi-VN')} VND` };
      }

      const { data, error } = await supabase
        .from('affiliate_withdrawals')
        .insert({
          affiliate_id: user.id,
          amount,
          method,
          account_details: accountDetails,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[Affiliate] requestWithdrawal error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawals(limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('affiliate_withdrawals')
        .select('*')
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Affiliate] getWithdrawals error:', error);
      return [];
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
  }

  /**
   * Format VND with currency symbol
   */
  formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  }

  /**
   * Get tier display info v3.0
   * Uses Vietnamese tier names from partnershipConstants
   */
  getTierInfo(tier) {
    // Use v3.0 config from partnershipConstants
    const config = getTierConfig(tier);
    return {
      label: config.name, // Vietnamese name
      labelEn: tier.charAt(0).toUpperCase() + tier.slice(1), // English name
      icon: config.icon,
      color: config.color,
      rateDigital: `${(config.commission.digital * 100).toFixed(0)}%`,
      ratePhysical: `${(config.commission.physical * 100).toFixed(0)}%`,
      subAffiliateRate: `${(config.subAffiliate * 100).toFixed(1)}%`,
      // Legacy: single rate for backward compatibility
      rate: `${(config.commission.digital * 100).toFixed(0)}%`,
    };
  }

  /**
   * Get withdrawal status display info
   */
  getWithdrawalStatusInfo(status) {
    const statuses = {
      pending: { label: 'Đang chờ', color: '#FFB800' },
      processing: { label: 'Đang xử lý', color: '#3B82F6' },
      completed: { label: 'Hoàn thành', color: '#3AF7A6' },
      rejected: { label: 'Từ chối', color: '#FF6B6B' },
    };
    return statuses[status] || { label: status, color: '#9CA3AF' };
  }

  // ========================================
  // PRODUCT AFFILIATE LINKS (NEW)
  // ========================================

  /**
   * Generate short code from product name (e.g., "RQC456")
   */
  generateShortCode(productName) {
    const words = (productName || 'PRD').split(' ').filter(w => w.length > 0);
    let code = '';

    // Extract up to 3 initials
    for (let i = 0; i < Math.min(3, words.length); i++) {
      code += words[i].charAt(0).toUpperCase();
    }

    // Ensure at least 2 characters
    if (code.length < 2) {
      code = 'PR';
    }

    // Add random 3-digit number
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return code + randomNum;
  }

  /**
   * Generate product URL from short code and affiliate code
   * New format: https://gemral.com/products/{productHandle}?ref={affiliateCode}&pid={productId}
   * Fallback: https://gemral.com/?ref={affiliateCode}&pid={productId} if no handle
   */
  generateProductUrl(shortCode, affiliateCode, productId = null, productHandle = null) {
    // Use Shopify's product URL structure when handle is available
    let url;
    if (productHandle) {
      url = `${REFERRAL_BASE_URL}/products/${encodeURIComponent(productHandle)}?ref=${affiliateCode}`;
    } else {
      // Fallback to short code path if no handle
      url = `${REFERRAL_BASE_URL}/p/${shortCode}?ref=${affiliateCode}`;
    }

    if (productId) {
      url += `&pid=${encodeURIComponent(productId)}`;
    }
    return url;
  }

  /**
   * Generate deep link URL for direct app opening
   * Format: gem://product/{shortCode}?ref={affiliateCode}&pid={productId}
   */
  generateAppDeepLink(shortCode, affiliateCode, productId = null) {
    let url = `${APP_SCHEME}://product/${shortCode}?ref=${affiliateCode}`;
    if (productId) {
      url += `&pid=${encodeURIComponent(productId)}`;
    }
    return url;
  }

  /**
   * Get app store link based on platform
   */
  getAppStoreLink() {
    return Platform.OS === 'ios' ? APP_STORE_IOS : APP_STORE_ANDROID;
  }

  /**
   * Calculate commission rate for product based on tier v3.0
   * Uses digital/physical product distinction
   */
  getProductCommissionRate(productType, profile) {
    const role = profile?.role || 'ctv';
    const ctvTier = profile?.ctv_tier || 'bronze';

    // Determine if product is digital or physical
    const digitalTypes = ['course', 'subscription', 'ebook', 'digital_product', 'bundle'];
    const isDigital = digitalTypes.includes(productType?.toLowerCase());
    const productCategory = isDigital ? 'digital' : 'physical';

    // Get rate from v3.0 constants
    const rate = getCommissionRateV3(role, ctvTier, productCategory);

    console.log('[Affiliate] getProductCommissionRate:', {
      productType,
      isDigital,
      productCategory,
      role,
      ctvTier,
      rate: rate * 100 + '%',
    });

    return rate;
  }

  /**
   * Get sub-affiliate commission rate based on role and tier v3.0
   */
  getSubAffiliateRate(profile) {
    const role = profile?.role || 'ctv';
    const ctvTier = profile?.ctv_tier || 'bronze';
    return getSubAffiliateRateV3(role, ctvTier);
  }

  /**
   * Check if user has an approved partnership
   * Returns: { isApproved: boolean, affiliateCode: string|null, role: string|null, ctvTier: string|null }
   */
  // ═══════════════════════════════════════════════════════════════
  // CACHING for faster link generation
  // ═══════════════════════════════════════════════════════════════
  _partnershipCache = new Map(); // userId -> { data, timestamp }
  _userCodeCache = new Map();    // userId -> { code, timestamp }
  _CACHE_TTL = 5 * 60 * 1000;    // 5 minutes cache

  _isCacheValid(cache, userId) {
    const cached = cache.get(userId);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this._CACHE_TTL;
  }

  async checkPartnershipApproval(userId) {
    // Check cache first for instant response
    if (this._isCacheValid(this._partnershipCache, userId)) {
      console.log('[Affiliate] Partnership check from cache');
      return this._partnershipCache.get(userId).data;
    }

    try {
      // OPTIMIZED: Run both queries in PARALLEL instead of sequential
      const [applicationResult, profileResult] = await Promise.all([
        supabase
          .from('partnership_applications')
          .select('status, application_type, approved_at')
          .eq('user_id', userId)
          .eq('status', 'approved')
          .order('approved_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('affiliate_code, partnership_role, ctv_tier')
          .eq('id', userId)
          .single(),
      ]);

      const application = applicationResult.data;
      const profile = profileResult.data;

      let result;

      // Check if has approved application
      if (application?.status === 'approved') {
        result = {
          isApproved: true,
          affiliateCode: profile?.affiliate_code || null,
          role: profile?.partnership_role || application.application_type || 'ctv',
          ctvTier: profile?.ctv_tier || 'bronze',
        };
      }
      // Check if user has affiliate_code in profiles (legacy or direct assignment)
      else if (profile?.affiliate_code && profile?.partnership_role) {
        result = {
          isApproved: true,
          affiliateCode: profile.affiliate_code,
          role: profile.partnership_role,
          ctvTier: profile.ctv_tier || 'bronze',
        };
      } else {
        result = { isApproved: false, affiliateCode: null, role: null, ctvTier: null };
      }

      // Cache the result
      this._partnershipCache.set(userId, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('[Affiliate] checkPartnershipApproval error:', error);
      return { isApproved: false, affiliateCode: null, role: null, ctvTier: null };
    }
  }

  /**
   * Generate product-specific affiliate link
   * @param {string} productId - Product ID from shopify_crystals or shopify_courses
   * @param {string} productType - 'crystal', 'course', 'subscription', 'bundle'
   * @param {object} productData - Optional product data { name, price, image_url }
   */
  async generateProductAffiliateLink(productId, productType, productData = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Validate productId - must be provided
      if (!productId) {
        return { success: false, error: 'Product ID is required' };
      }

      // Convert productId to string for consistent handling
      // Note: Shopify IDs are numeric strings, not UUIDs
      const productIdStr = String(productId);

      console.log('[Affiliate] generateProductAffiliateLink called with:', {
        productId: productIdStr,
        productType,
        productData,
        userId: user.id,
      });

      // ═══════════════════════════════════════════════════════════════
      // IMPORTANT: Check if user has APPROVED partnership before generating link
      // ═══════════════════════════════════════════════════════════════
      const partnershipCheck = await this.checkPartnershipApproval(user.id);

      if (!partnershipCheck.isApproved) {
        console.log('[Affiliate] User does not have approved partnership');
        return {
          success: false,
          error: 'Bạn chưa là đối tác affiliate. Vui lòng đăng ký tại mục Partnership trong Tài Sản.',
          requiresPartnership: true,
        };
      }

      console.log('[Affiliate] Partnership approved:', partnershipCheck);

      // Build profile from partnership check result
      const profile = {
        role: partnershipCheck.role || 'ctv',           // v3.0 default
        ctv_tier: partnershipCheck.ctvTier || 'bronze', // v3.0 default
        is_active: true,
        affiliate_code: partnershipCheck.affiliateCode,
      };

      console.log('[Affiliate] Using profile:', profile);

      // ═══════════════════════════════════════════════════════════════
      // OPTIMIZED: Run multiple queries in PARALLEL for faster link generation
      // ═══════════════════════════════════════════════════════════════

      // Check userCode cache first
      let userCode = null;
      if (this._isCacheValid(this._userCodeCache, user.id)) {
        userCode = this._userCodeCache.get(user.id).data;
        console.log('[Affiliate] UserCode from cache:', userCode?.code);
      }

      // Build parallel queries
      const parallelQueries = [
        // Query 1: Check existing product link
        supabase
          .from('affiliate_codes')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', productIdStr)
          .eq('is_active', true)
          .maybeSingle(),
      ];

      // Query 2: Get user's main referral code (only if not cached)
      if (!userCode) {
        parallelQueries.push(
          supabase
            .from('affiliate_codes')
            .select('code')
            .eq('user_id', user.id)
            .is('product_id', null)
            .eq('is_active', true)
            .maybeSingle()
        );
      }

      // Execute parallel queries
      const results = await Promise.all(parallelQueries);
      const existingLink = results[0]?.data;
      if (!userCode && results[1]) {
        userCode = results[1].data;
        // Cache it for next time
        if (userCode) {
          this._userCodeCache.set(user.id, { data: userCode, timestamp: Date.now() });
        }
      }

      // If existing link found, return immediately (FAST PATH)
      if (existingLink) {
        const baseCode = userCode?.code || existingLink.code?.split('_')[0] || partnershipCheck.affiliateCode;
        const url = this.generateProductUrl(
          existingLink.short_code,
          baseCode,
          productIdStr,
          existingLink.product_handle
        );
        const commissionRate = this.getProductCommissionRate(productType, profile);
        const estimatedCommission = (existingLink.product_price || 0) * commissionRate;

        console.log('[Affiliate] Returning existing link (fast path)');
        return {
          success: true,
          link: existingLink,
          url,
          deepLink: this.generateAppDeepLink(existingLink.short_code, baseCode, productIdStr),
          commissionRate: (commissionRate * 100).toFixed(1),
          estimatedCommission,
          isExisting: true,
        };
      }

      // ═══════════════════════════════════════════════════════════════
      // No existing link - need to create new one
      // ═══════════════════════════════════════════════════════════════

      // Get product details if not provided (use provided data to skip query)
      let product = productData;
      if (!product) {
        const table = productType === 'crystal' ? 'shopify_crystals' :
                      productType === 'course' ? 'shopify_courses' :
                      productType === 'bundle' ? 'bundle_offers' : 'shopify_crystals';

        const nameField = productType === 'crystal' ? 'name_vi' :
                         productType === 'course' ? 'title_vi' : 'name';

        const { data: productResult, error: productError } = await supabase
          .from(table)
          .select('*')
          .eq('id', productId)
          .single();

        if (productError || !productResult) {
          return { success: false, error: 'Sản phẩm không tồn tại' };
        }

        product = {
          name: productResult[nameField] || productResult.name || productResult.title_vi,
          price: productResult.price || 0,
          image_url: productResult.image_url || productResult.thumbnail_url,
          handle: productResult.handle || productResult.slug || null,
        };
      }

      // Create user's main referral code if doesn't exist
      if (!userCode) {
        // Create main referral code
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();

        const username = userProfile?.username || userProfile?.full_name?.split(' ')[0] || 'user';
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const newCode = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}_${randomSuffix}`;

        const { data: createdCode, error: createError } = await supabase
          .from('affiliate_codes')
          .insert({
            user_id: user.id,
            code: newCode,
            is_active: true,
          })
          .select()
          .single();

        if (createError) throw createError;
        userCode = createdCode;
        // Cache the new code
        this._userCodeCache.set(user.id, { data: userCode, timestamp: Date.now() });
      }

      // Generate short code for product
      const shortCode = this.generateShortCode(product.name);

      // Generate unique code for this product affiliate link
      // Combine user code + product short code to ensure uniqueness
      const productCode = `${userCode.code}_${shortCode}`;

      // Create product affiliate link
      // Note: Some columns may not exist if migration hasn't run yet
      const insertData = {
        user_id: user.id,
        code: productCode, // Unique code per product
        is_active: true,
      };

      // Add optional product columns if they exist in the database
      // These columns are added by migration 20251127_extend_affiliate_codes_for_products.sql
      try {
        // First, check if a link already exists for this user + product
        const { data: existingProductLink } = await supabase
          .from('affiliate_codes')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', productIdStr)
          .maybeSingle();

        if (existingProductLink) {
          // Return existing link
          const url = this.generateProductUrl(
            existingProductLink.short_code || shortCode,
            userCode.code,
            productIdStr,
            existingProductLink.product_handle || product?.handle
          );
          const commissionRate = this.getProductCommissionRate(productType, profile);
          const estimatedCommission = (existingProductLink.product_price || product.price || 0) * commissionRate;

          console.log('[Affiliate] Found existing product link:', existingProductLink.id);

          return {
            success: true,
            link: existingProductLink,
            url,
            deepLink: this.generateAppDeepLink(existingProductLink.short_code || shortCode, userCode.code, productIdStr),
            commissionRate: (commissionRate * 100).toFixed(1),
            estimatedCommission,
            isExisting: true,
          };
        }

        // Insert new product link
        const { data: productLink, error: linkError } = await supabase
          .from('affiliate_codes')
          .insert({
            ...insertData,
            product_id: productIdStr,
            product_type: productType,
            product_name: product.name,
            product_price: product.price,
            product_handle: product.handle,
            image_url: product.image_url,
            short_code: shortCode,
            clicks: 0,
            sales_count: 0,
            sales_amount: 0,
            commission_earned: 0,
          })
          .select()
          .single();

        if (linkError) {
          console.error('[Affiliate] Insert product link failed:', linkError.message);

          // If error mentions column doesn't exist, try without product columns
          if (linkError.message?.includes('column') || linkError.code === '42703') {
            console.log('[Affiliate] Product columns not found, using basic insert...');
            throw new Error('COLUMNS_NOT_FOUND');
          }
          throw linkError;
        }

        const url = this.generateProductUrl(shortCode, userCode.code, productIdStr, product.handle);
        const commissionRate = this.getProductCommissionRate(productType, profile);
        const estimatedCommission = (product.price || 0) * commissionRate;

        console.log('[Affiliate] Created product link:', { productId, shortCode, url });

        return {
          success: true,
          link: productLink,
          url,
          deepLink: this.generateAppDeepLink(shortCode, userCode.code, productIdStr),
          commissionRate: (commissionRate * 100).toFixed(1),
          estimatedCommission,
          isExisting: false,
        };
      } catch (insertError) {
        // Fallback: Generate link without database storage
        // This allows the feature to work even if database is not migrated
        if (insertError.message === 'COLUMNS_NOT_FOUND' || insertError.message?.includes('column')) {
          console.log('[Affiliate] Generating fallback link without database storage...');

          const url = this.generateProductUrl(shortCode, userCode.code, productIdStr, product.handle);
          const commissionRate = this.getProductCommissionRate(productType, profile);
          const estimatedCommission = (product.price || 0) * commissionRate;

          return {
            success: true,
            link: {
              id: null,
              code: productCode, // Use unique product code
              short_code: shortCode,
              product_id: productIdStr,
              product_name: product.name,
              product_price: product.price,
              product_handle: product.handle,
              image_url: product.image_url,
            },
            url,
            deepLink: this.generateAppDeepLink(shortCode, userCode.code, productIdStr),
            commissionRate: (commissionRate * 100).toFixed(1),
            estimatedCommission,
            isExisting: false,
            isFallback: true, // Indicates link is not persisted
          };
        }
        throw insertError;
      }
    } catch (error) {
      console.error('[Affiliate] generateProductAffiliateLink error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all product affiliate links for current user
   */
  async getProductLinks(limit = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('affiliate_codes')
        .select('*')
        .eq('user_id', user.id)
        .not('product_id', 'is', null)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Affiliate] getProductLinks error:', error);
      return [];
    }
  }

  /**
   * Share product affiliate link
   */
  async shareProductLink(productLink) {
    try {
      if (!productLink) {
        return { success: false, error: 'Link không hợp lệ' };
      }

      const url = this.generateProductUrl(productLink.short_code, productLink.code);
      const message = `Xem sản phẩm này đi bạn!\n\n${productLink.product_name}\nGiá: ${this.formatVND(productLink.product_price)}\n\n${url}`;

      const result = await Share.share({
        title: productLink.product_name,
        message: Platform.OS === 'ios' ? message : message,
        url: Platform.OS === 'ios' ? url : undefined,
      });

      if (result.action === Share.sharedAction) {
        return { success: true, platform: result.activityType };
      }
      return { success: false, dismissed: true };
    } catch (error) {
      console.error('[Affiliate] shareProductLink error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Copy product affiliate link to clipboard
   */
  async copyProductLink(productLink) {
    try {
      if (!productLink) {
        return { success: false, error: 'Link không hợp lệ' };
      }

      const url = this.generateProductUrl(productLink.short_code, productLink.code);
      await Clipboard.setStringAsync(url);
      return { success: true, url };
    } catch (error) {
      console.error('[Affiliate] copyProductLink error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track click on product affiliate link
   */
  async trackProductClick(shortCode, affiliateCode) {
    try {
      // Find the product link
      const { data: link, error: findError } = await supabase
        .from('affiliate_codes')
        .select('id')
        .eq('short_code', shortCode)
        .eq('code', affiliateCode)
        .eq('is_active', true)
        .single();

      if (findError || !link) {
        return { success: false, error: 'Link không hợp lệ' };
      }

      // Increment clicks using RPC
      const { error: rpcError } = await supabase.rpc('increment_affiliate_clicks', {
        code_id: link.id,
      });

      // Fallback to direct update: read + increment
      if (rpcError) {
        const { data: currentLink } = await supabase
          .from('affiliate_codes')
          .select('clicks')
          .eq('id', link.id)
          .single();

        await supabase
          .from('affiliate_codes')
          .update({ clicks: (currentLink?.clicks || 0) + 1 })
          .eq('id', link.id);
      }

      return { success: true };
    } catch (error) {
      console.error('[Affiliate] trackProductClick error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get product link stats summary
   */
  async getProductLinkStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('affiliate_codes')
        .select('clicks, sales_count, sales_amount, commission_earned')
        .eq('user_id', user.id)
        .not('product_id', 'is', null)
        .eq('is_active', true);

      if (error) throw error;

      const stats = (data || []).reduce((acc, link) => ({
        totalLinks: acc.totalLinks + 1,
        totalClicks: acc.totalClicks + (link.clicks || 0),
        totalSales: acc.totalSales + (link.sales_count || 0),
        totalRevenue: acc.totalRevenue + parseFloat(link.sales_amount || 0),
        totalEarnings: acc.totalEarnings + parseFloat(link.commission_earned || 0),
      }), {
        totalLinks: 0,
        totalClicks: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalEarnings: 0,
      });

      return stats;
    } catch (error) {
      console.error('[Affiliate] getProductLinkStats error:', error);
      return null;
    }
  }
}

export const affiliateService = new AffiliateService();
export default affiliateService;
