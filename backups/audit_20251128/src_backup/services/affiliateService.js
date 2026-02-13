/**
 * Gemral - Affiliate Service
 * Complete Partnership Program for Mobile
 * Based on frontend/src/services/affiliate.js
 */

import { supabase } from './supabase';
import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// ========================================
// CONSTANTS & CONFIGURATION
// ========================================

// Base URL for referral links
const REFERRAL_BASE_URL = 'https://gemral.com';

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

// Commission Rates
export const COMMISSION_RATES = {
  affiliate: 0.03, // 3%
  ctv: {
    beginner: 0.10, // 10%
    growing: 0.15,  // 15%
    master: 0.20,   // 20%
    grand: 0.30,    // 30%
  },
  instructor: null,
};

// Tier Upgrade Thresholds (VND)
export const TIER_THRESHOLDS = {
  beginner: 0,
  growing: 100000000,  // 100M
  master: 300000000,   // 300M
  grand: 600000000,    // 600M
};

// KPI Targets per product type
export const KPI_TARGETS = {
  'course-love': [30, 45, 60, 80],
  'course-money': [25, 35, 50, 70],
  'course-7days': [10, 15, 20, 30],
  'course-trading-t1': [5, 6, 9, 25],
  'course-trading-t2': [5, 6, 9, 25],
  'course-trading-t3': [5, 6, 9, 25],
  'scanner-pro': [5, 6, 9, 25],
  'scanner-premium': [5, 6, 9, 25],
  'scanner-vip': [5, 6, 9, 25],
};

// Bonus Amounts per tier
export const BONUS_AMOUNTS = {
  'course-love': [200000, 300000, 500000, 1000000],
  'course-money': [250000, 400000, 700000, 1500000],
  'course-7days': [500000, 1000000, 2000000, 3000000],
  'course-trading-t1': [5000000, 7000000, 10000000, 20000000],
  'course-trading-t2': [5000000, 7000000, 10000000, 20000000],
  'course-trading-t3': [5000000, 7000000, 10000000, 20000000],
  'scanner-pro': [5000000, 7000000, 10000000, 20000000],
  'scanner-premium': [5000000, 7000000, 10000000, 20000000],
  'scanner-vip': [5000000, 7000000, 10000000, 20000000],
};

// ========================================
// CALCULATION HELPERS
// ========================================

/**
 * Calculate commission based on role and tier
 */
export function calculateCommission(saleAmount, role, ctvTier = null) {
  if (role === 'affiliate') {
    return saleAmount * COMMISSION_RATES.affiliate;
  }
  if (role === 'ctv' && ctvTier) {
    const rate = COMMISSION_RATES.ctv[ctvTier];
    return rate ? saleAmount * rate : 0;
  }
  return 0;
}

/**
 * Get commission rate as decimal
 */
export function getCommissionRate(role, ctvTier = null) {
  if (role === 'affiliate') return COMMISSION_RATES.affiliate;
  if (role === 'ctv' && ctvTier) return COMMISSION_RATES.ctv[ctvTier] || 0;
  return 0;
}

/**
 * Get KPI target for product and tier
 */
export function getKPITarget(productType, ctvTier) {
  const targets = KPI_TARGETS[productType];
  if (!targets) return null;
  const tierIndex = ['beginner', 'growing', 'master', 'grand'].indexOf(ctvTier);
  return targets[tierIndex] || targets[0];
}

/**
 * Get bonus amount for product and tier
 */
export function getBonusAmount(productType, ctvTier) {
  const bonuses = BONUS_AMOUNTS[productType];
  if (!bonuses) return null;
  const tierIndex = ['beginner', 'growing', 'master', 'grand'].indexOf(ctvTier);
  return bonuses[tierIndex] || bonuses[0];
}

/**
 * Get next tier upgrade info
 */
export function getNextTierInfo(currentTier, totalSales) {
  const tiers = ['beginner', 'growing', 'master', 'grand'];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex === tiers.length - 1) {
    return { nextTier: null, threshold: null, remaining: 0, progress: 100 };
  }

  const nextTier = tiers[currentIndex + 1];
  const threshold = TIER_THRESHOLDS[nextTier];
  const remaining = Math.max(0, threshold - totalSales);
  const progress = Math.min(100, (totalSales / threshold) * 100);

  return { nextTier, threshold, remaining, progress };
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
            role: 'affiliate',
            ctv_tier: 'beginner',
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
   */
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Affiliate] getProfile error:', error);
      return null;
    }
  }

  /**
   * Get referral code for current user
   */
  async getReferralCode() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('affiliate_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Affiliate] getReferralCode error:', error);
      return null;
    }
  }

  /**
   * Generate referral link
   */
  async generateReferralLink(productType = null) {
    try {
      const code = await this.getReferralCode();
      if (!code) return null;

      let link = `${REFERRAL_BASE_URL}/?ref=${code.code}`;
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

      // Fallback if RPC doesn't exist
      if (error) {
        const { error: updateError } = await supabase
          .from('affiliate_codes')
          .update({ clicks: supabase.sql`clicks + 1` })
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
   * Get tier display info
   */
  getTierInfo(tier) {
    const tiers = {
      beginner: { label: 'Beginner', color: '#9CA3AF', rate: '10%' },
      growing: { label: 'Growing', color: '#3B82F6', rate: '15%' },
      master: { label: 'Master', color: '#FFBD59', rate: '20%' },
      grand: { label: 'Grand Master', color: '#DC2626', rate: '30%' },
    };
    return tiers[tier] || tiers.beginner;
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
   */
  generateProductUrl(shortCode, affiliateCode) {
    return `${REFERRAL_BASE_URL}/p/${shortCode}?aff=${affiliateCode}`;
  }

  /**
   * Calculate commission rate for product based on tier
   */
  getProductCommissionRate(productType, profile) {
    const role = profile?.role || 'affiliate';
    const ctvTier = profile?.ctv_tier || 'beginner';

    // Base rate by role/tier
    let baseRate;
    if (role === 'ctv' && ctvTier) {
      baseRate = COMMISSION_RATES.ctv[ctvTier] || 0.10;
    } else {
      baseRate = COMMISSION_RATES.affiliate;
    }

    // Product type multipliers
    const multipliers = {
      crystal: 1.0,
      course: 1.2,
      subscription: 1.5,
      bundle: 1.3,
      book: 0.8,
    };

    const multiplier = multipliers[productType] || 1.0;
    return baseRate * multiplier;
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

      // Get affiliate profile - user must be an approved affiliate/CTV
      const profile = await this.getProfile();
      if (!profile) {
        return { success: false, error: 'Bạn chưa là đối tác affiliate. Vui lòng đăng ký tại mục Partnership.' };
      }

      // Check if product link already exists for this user
      const { data: existingLink } = await supabase
        .from('affiliate_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('is_active', true)
        .single();

      if (existingLink) {
        const url = this.generateProductUrl(existingLink.short_code, existingLink.code);
        const commissionRate = this.getProductCommissionRate(productType, profile);
        const estimatedCommission = (existingLink.product_price || 0) * commissionRate;

        return {
          success: true,
          link: existingLink,
          url,
          commissionRate: (commissionRate * 100).toFixed(1),
          estimatedCommission,
          isExisting: true,
        };
      }

      // Get product details if not provided
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
        };
      }

      // Get or create user's main referral code
      let { data: userCode } = await supabase
        .from('affiliate_codes')
        .select('code')
        .eq('user_id', user.id)
        .is('product_id', null)
        .eq('is_active', true)
        .single();

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
      }

      // Generate short code for product
      const shortCode = this.generateShortCode(product.name);

      // Create product affiliate link
      const { data: productLink, error: linkError } = await supabase
        .from('affiliate_codes')
        .insert({
          user_id: user.id,
          code: userCode.code,
          product_id: productId,
          product_type: productType,
          product_name: product.name,
          product_price: product.price,
          image_url: product.image_url,
          short_code: shortCode,
          is_active: true,
          clicks: 0,
          sales_count: 0,
          sales_amount: 0,
          commission_earned: 0,
        })
        .select()
        .single();

      if (linkError) throw linkError;

      const url = this.generateProductUrl(shortCode, userCode.code);
      const commissionRate = this.getProductCommissionRate(productType, profile);
      const estimatedCommission = (product.price || 0) * commissionRate;

      console.log('[Affiliate] Created product link:', { productId, shortCode, url });

      return {
        success: true,
        link: productLink,
        url,
        commissionRate: (commissionRate * 100).toFixed(1),
        estimatedCommission,
        isExisting: false,
      };
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

      // Fallback to direct update
      if (rpcError) {
        await supabase
          .from('affiliate_codes')
          .update({ clicks: supabase.sql`COALESCE(clicks, 0) + 1` })
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
