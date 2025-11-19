// ========================================
// AFFILIATE SERVICE
// Days 39-40: Complete Partnership Program
// ========================================

import { supabase } from '../lib/supabaseClient';

// ========================================
// PRODUCT TYPE DEFINITIONS
// ========================================

export const PRODUCT_TYPES = {
  // Spiritual Courses
  'course-love': {
    name: 'Khóa Học Tình Yêu',
    price: 399000,
    category: 'spiritual',
  },
  'course-money': {
    name: 'Khóa Học Tư Duy Triệu Phú',
    price: 499000,
    category: 'spiritual',
  },
  'course-7days': {
    name: '7 Ngày Khai Mở Tần Số',
    price: 1990000,
    category: 'spiritual',
  },

  // Trading Courses
  'course-trading-t1': {
    name: 'Frequency Trading TIER 1',
    price: 11000000,
    category: 'trading',
  },
  'course-trading-t2': {
    name: 'Frequency Trading TIER 2',
    price: 21000000,
    category: 'trading',
  },
  'course-trading-t3': {
    name: 'Frequency Trading TIER 3',
    price: 68000000,
    category: 'trading',
  },

  // Scanner Subscriptions
  'scanner-pro': {
    name: 'Scanner PRO',
    price: 11964000,
    category: 'scanner',
  },
  'scanner-premium': {
    name: 'Scanner PREMIUM',
    price: 23964000,
    category: 'scanner',
  },
  'scanner-vip': {
    name: 'Scanner VIP',
    price: 57000000,
    category: 'scanner',
  },

  // Physical Products
  'physical-product': {
    name: 'Sản Phẩm Vật Lý',
    price: null, // Variable pricing
    category: 'physical',
  },
};

// ========================================
// COMMISSION RATE MANAGEMENT
// ========================================

export const COMMISSION_RATES = {
  // AFFILIATE role: Fixed 3%
  affiliate: 0.03,

  // CTV role: 4 tiers
  ctv: {
    beginner: 0.10,   // Beginner: 10%
    growing: 0.15,    // Growing: 15%
    master: 0.20,     // Master: 20%
    grand: 0.30,      // Grand: 30%
  },

  // INSTRUCTOR role: Fixed salary (not commission-based)
  instructor: null, // Salary handled separately
};

// ========================================
// CTV TIER UPGRADE THRESHOLDS
// ========================================

export const TIER_THRESHOLDS = {
  beginner: 0,           // Start tier
  growing: 100000000,    // 100M VND
  master: 300000000,     // 300M VND
  grand: 600000000,      // 600M VND
};

// ========================================
// BONUS KPI SYSTEM (Product-Specific)
// ========================================

// KPI Targets (students sold per month)
export const KPI_TARGETS = {
  'course-love': [30, 45, 60, 80],      // Tình Yêu 399K
  'course-money': [25, 35, 50, 70],     // Tư Duy 499K
  'course-7days': [10, 15, 20, 30],     // 7 Ngày 1.99M
  'course-trading-t1': [5, 6, 9, 25],   // Trading T1 11M
  'course-trading-t2': [5, 6, 9, 25],   // Trading T2 21M
  'course-trading-t3': [5, 6, 9, 25],   // Trading T3 68M
  'scanner-pro': [5, 6, 9, 25],         // Scanner PRO
  'scanner-premium': [5, 6, 9, 25],     // Scanner PREMIUM
  'scanner-vip': [5, 6, 9, 25],         // Scanner VIP
};

// Bonus Amounts (per tier)
export const BONUS_AMOUNTS = {
  'course-love': [200000, 300000, 500000, 1000000],           // 200K - 1M
  'course-money': [250000, 400000, 700000, 1500000],          // 250K - 1.5M
  'course-7days': [500000, 1000000, 2000000, 3000000],        // 500K - 3M
  'course-trading-t1': [5000000, 7000000, 10000000, 20000000], // 5M - 20M
  'course-trading-t2': [5000000, 7000000, 10000000, 20000000], // 5M - 20M
  'course-trading-t3': [5000000, 7000000, 10000000, 20000000], // 5M - 20M
  'scanner-pro': [5000000, 7000000, 10000000, 20000000],      // 5M - 20M
  'scanner-premium': [5000000, 7000000, 10000000, 20000000],  // 5M - 20M
  'scanner-vip': [5000000, 7000000, 10000000, 20000000],      // 5M - 20M
};

// ========================================
// COMMISSION CALCULATION
// ========================================

/**
 * Calculate commission amount based on role and tier
 * @param {number} saleAmount - Sale amount in VND
 * @param {string} role - 'affiliate', 'ctv', or 'instructor'
 * @param {string} ctvTier - 'beginner', 'growing', 'master', or 'grand' (only for CTV)
 * @returns {number} Commission amount
 */
export function calculateCommission(saleAmount, role, ctvTier = null) {
  if (role === 'affiliate') {
    return saleAmount * COMMISSION_RATES.affiliate;
  }

  if (role === 'ctv' && ctvTier) {
    const rate = COMMISSION_RATES.ctv[ctvTier];
    if (!rate) {
      throw new Error(`Invalid CTV tier: ${ctvTier}`);
    }
    return saleAmount * rate;
  }

  if (role === 'instructor') {
    // Instructors get fixed salary, not commission
    return 0;
  }

  throw new Error(`Invalid role: ${role}`);
}

/**
 * Get commission rate as percentage
 */
export function getCommissionRate(role, ctvTier = null) {
  if (role === 'affiliate') {
    return COMMISSION_RATES.affiliate;
  }

  if (role === 'ctv' && ctvTier) {
    return COMMISSION_RATES.ctv[ctvTier];
  }

  return 0;
}

// ========================================
// BONUS KPI HELPERS
// ========================================

/**
 * Get KPI target for product type and tier
 * @param {string} productType - Product type key
 * @param {string} ctvTier - CTV tier
 * @returns {number} Target number of students
 */
export function getKPITarget(productType, ctvTier) {
  const targets = KPI_TARGETS[productType];
  if (!targets) return null;

  const tierIndex = ['beginner', 'growing', 'master', 'grand'].indexOf(ctvTier);
  return targets[tierIndex] || targets[0];
}

/**
 * Get bonus amount for product type and tier
 * @param {string} productType - Product type key
 * @param {string} ctvTier - CTV tier
 * @returns {number} Bonus amount in VND
 */
export function getBonusAmount(productType, ctvTier) {
  const bonuses = BONUS_AMOUNTS[productType];
  if (!bonuses) return null;

  const tierIndex = ['beginner', 'growing', 'master', 'grand'].indexOf(ctvTier);
  return bonuses[tierIndex] || bonuses[0];
}

/**
 * Check if user qualifies for bonus this month
 */
export function checkBonusQualification(studentsCount, productType, ctvTier) {
  const target = getKPITarget(productType, ctvTier);
  const bonus = getBonusAmount(productType, ctvTier);

  if (!target || !bonus) {
    return { qualifies: false, target: null, bonus: null };
  }

  return {
    qualifies: studentsCount >= target,
    target,
    bonus,
    remaining: Math.max(0, target - studentsCount),
  };
}

// ========================================
// TIER UPGRADE HELPERS
// ========================================

/**
 * Calculate next tier upgrade info
 */
export function getNextTierInfo(currentTier, totalSales) {
  const tiers = ['beginner', 'growing', 'master', 'grand'];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex === tiers.length - 1) {
    // Already at max tier
    return { nextTier: null, threshold: null, remaining: 0 };
  }

  const nextTier = tiers[currentIndex + 1];
  const threshold = TIER_THRESHOLDS[nextTier];
  const remaining = Math.max(0, threshold - totalSales);

  return { nextTier, threshold, remaining };
}

// ========================================
// SUPABASE API FUNCTIONS
// ========================================

/**
 * Get affiliate profile for user
 */
export async function getAffiliateProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching affiliate profile:', error);
    return null;
  }
}

/**
 * Get or create affiliate profile
 */
export async function getOrCreateAffiliateProfile(userId) {
  // Try to get existing profile
  let profile = await getAffiliateProfile(userId);

  if (profile) return profile;

  // Create new profile
  try {
    const { data, error } = await supabase
      .from('affiliate_profiles')
      .insert({
        user_id: userId,
        role: 'affiliate',
        ctv_tier: 'beginner',
        total_sales: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating affiliate profile:', error);
    return null;
  }
}

/**
 * Get referral code for user
 */
export async function getReferralCode(userId) {
  try {
    const { data, error } = await supabase
      .from('affiliate_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching referral code:', error);
    return null;
  }
}

/**
 * Track referral click
 */
export async function trackReferralClick(referralCode) {
  try {
    const { data, error } = await supabase
      .from('affiliate_codes')
      .update({ clicks: supabase.raw('clicks + 1') })
      .eq('code', referralCode)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error tracking click:', error);
    return null;
  }
}

/**
 * Create referral relationship
 */
export async function createReferral(affiliateId, referredUserId, referralCode) {
  try {
    const { data, error } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_id: affiliateId,
        referred_user_id: referredUserId,
        referral_code: referralCode,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating referral:', error);
    return null;
  }
}

/**
 * Get all referrals for affiliate
 */
export async function getReferrals(affiliateId, limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('affiliate_referrals')
      .select(`
        *,
        referred_user:users!referred_user_id(email, full_name)
      `)
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
}

/**
 * Track a sale
 */
export async function trackSale(affiliateId, productType, saleAmount, buyerId = null, referralId = null) {
  try {
    // Insert sale record
    const { data: sale, error: saleError } = await supabase
      .from('affiliate_sales')
      .insert({
        affiliate_id: affiliateId,
        referral_id: referralId,
        product_type: productType,
        product_name: PRODUCT_TYPES[productType]?.name,
        sale_amount: saleAmount,
        buyer_id: buyerId,
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // Get affiliate profile to calculate commission
    const profile = await getAffiliateProfile(affiliateId);
    if (!profile) throw new Error('Affiliate profile not found');

    // Calculate commission
    const commissionRate = getCommissionRate(profile.role, profile.ctv_tier);
    const commissionAmount = calculateCommission(saleAmount, profile.role, profile.ctv_tier);

    // Insert commission record
    const { data: commission, error: commError } = await supabase
      .from('affiliate_commissions')
      .insert({
        affiliate_id: affiliateId,
        sale_id: sale.id,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (commError) throw commError;

    // Update total_sales (triggers tier upgrade check automatically)
    const { error: updateError } = await supabase
      .from('affiliate_profiles')
      .update({
        total_sales: supabase.raw(`total_sales + ${saleAmount}`),
      })
      .eq('user_id', affiliateId);

    if (updateError) throw updateError;

    return { sale, commission };
  } catch (error) {
    console.error('Error tracking sale:', error);
    return null;
  }
}

/**
 * Get sales for affiliate
 */
export async function getSales(affiliateId, limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('affiliate_sales')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('purchase_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
}

/**
 * Get commissions for affiliate
 */
export async function getCommissions(affiliateId, status = null, limit = 50, offset = 0) {
  try {
    let query = supabase
      .from('affiliate_commissions')
      .select(`
        *,
        sale:affiliate_sales(product_type, product_name, sale_amount, purchase_date)
      `)
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return [];
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(affiliateId) {
  try {
    const profile = await getAffiliateProfile(affiliateId);
    if (!profile) throw new Error('Profile not found');

    // Get total referrals
    const { count: totalReferrals } = await supabase
      .from('affiliate_referrals')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliateId);

    // Get converted referrals
    const { count: convertedReferrals } = await supabase
      .from('affiliate_referrals')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliateId)
      .eq('status', 'converted');

    // Get total commissions by status
    const { data: commissionStats } = await supabase
      .from('affiliate_commissions')
      .select('status, commission_amount')
      .eq('affiliate_id', affiliateId);

    const totalPending = commissionStats
      ?.filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0) || 0;

    const totalApproved = commissionStats
      ?.filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0) || 0;

    const totalPaid = commissionStats
      ?.filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0) || 0;

    // Get this month's sales
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlySales } = await supabase
      .from('affiliate_sales')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .gte('purchase_date', firstDayOfMonth.toISOString());

    const monthlyRevenue = monthlySales?.reduce((sum, sale) => sum + parseFloat(sale.sale_amount), 0) || 0;

    // Tier upgrade info
    const tierInfo = getNextTierInfo(profile.ctv_tier, profile.total_sales);

    return {
      profile,
      referrals: {
        total: totalReferrals || 0,
        converted: convertedReferrals || 0,
        conversionRate: totalReferrals > 0 ? (convertedReferrals / totalReferrals * 100).toFixed(1) : 0,
      },
      commissions: {
        pending: totalPending,
        approved: totalApproved,
        paid: totalPaid,
        total: totalPending + totalApproved + totalPaid,
      },
      monthly: {
        sales: monthlySales?.length || 0,
        revenue: monthlyRevenue,
      },
      tierUpgrade: tierInfo,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

/**
 * Request withdrawal
 */
export async function requestWithdrawal(affiliateId, amount, method, accountDetails) {
  try {
    const { data, error } = await supabase
      .from('affiliate_withdrawals')
      .insert({
        affiliate_id: affiliateId,
        amount,
        method,
        account_details: accountDetails,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    return null;
  }
}

/**
 * Get withdrawal history
 */
export async function getWithdrawals(affiliateId, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('affiliate_withdrawals')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return [];
  }
}

/**
 * Get monthly KPI bonuses
 */
export async function getKPIBonuses(affiliateId, limit = 12, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('affiliate_bonus_kpi')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('month', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching KPI bonuses:', error);
    return [];
  }
}

// ========================================
// EXPORTS
// ========================================

export default {
  // Constants
  PRODUCT_TYPES,
  COMMISSION_RATES,
  TIER_THRESHOLDS,
  KPI_TARGETS,
  BONUS_AMOUNTS,

  // Calculation helpers
  calculateCommission,
  getCommissionRate,
  getKPITarget,
  getBonusAmount,
  checkBonusQualification,
  getNextTierInfo,

  // API functions
  getAffiliateProfile,
  getOrCreateAffiliateProfile,
  getReferralCode,
  trackReferralClick,
  createReferral,
  getReferrals,
  trackSale,
  getSales,
  getCommissions,
  getDashboardStats,
  requestWithdrawal,
  getWithdrawals,
  getKPIBonuses,
};
