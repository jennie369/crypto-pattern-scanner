// ============================================================
// UPGRADE SERVICE
// Purpose: Quản lý tiers, banners, và upgrade flow
// ============================================================

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// CONSTANTS
// ============================================================

export const TIER_TYPES = {
  SCANNER: 'scanner',
  CHATBOT: 'chatbot',
  COURSE: 'course',
};

export const BANNER_TYPES = {
  POPUP: 'popup',
  BANNER: 'banner',
  FULLSCREEN: 'fullscreen',
  OVERLAY: 'overlay',
  BOTTOM_SHEET: 'bottom_sheet',
};

export const TRIGGER_TYPES = {
  QUOTA_REACHED: 'quota_reached',
  QUOTA_LOW: 'quota_low',
  FEATURE_LOCKED: 'feature_locked',
  FIRST_USE: 'first_use',
  PROMOTION: 'promotion',
  ACCOUNT_STATUS: 'account_status',
};

const CACHE_KEY = 'upgrade_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================================
// TIER FUNCTIONS
// ============================================================

/**
 * Lấy tất cả tiers theo type
 */
export const getTiersByType = async (tierType) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_tiers')
      .select('*')
      .eq('tier_type', tierType)
      .eq('is_active', true)
      .order('tier_level', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[upgradeService] getTiersByType error:', error);
    return [];
  }
};

/**
 * Lấy tier cụ thể
 */
export const getTier = async (tierType, tierLevel) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_tiers')
      .select('*')
      .eq('tier_type', tierType)
      .eq('tier_level', tierLevel)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[upgradeService] getTier error:', error);
    return null;
  }
};

/**
 * Lấy tier tiếp theo để upgrade
 */
export const getNextTier = async (tierType, currentLevel = 0) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_tiers')
      .select('*')
      .eq('tier_type', tierType)
      .eq('is_active', true)
      .gt('tier_level', currentLevel)
      .order('tier_level', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('[upgradeService] getNextTier error:', error);
    return null;
  }
};

/**
 * Lấy tier được đề xuất (featured/popular)
 */
export const getFeaturedTier = async (tierType) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_tiers')
      .select('*')
      .eq('tier_type', tierType)
      .eq('is_active', true)
      .or('is_featured.eq.true,is_popular.eq.true')
      .order('is_popular', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('[upgradeService] getFeaturedTier error:', error);
    return null;
  }
};

// ============================================================
// BANNER FUNCTIONS
// ============================================================

/**
 * Lấy banner theo trigger
 */
export const getBannerByTrigger = async (triggerType, screenName = null) => {
  try {
    let query = supabase
      .from('upgrade_banners')
      .select('*')
      .eq('trigger_type', triggerType)
      .eq('is_active', true);

    if (screenName) {
      query = query.eq('trigger_screen', screenName);
    }

    const { data, error } = await query
      .order('priority', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('[upgradeService] getBannerByTrigger error:', error);
    return null;
  }
};

/**
 * Lấy banner theo key
 */
export const getBannerByKey = async (bannerKey) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_banners')
      .select('*')
      .eq('banner_key', bannerKey)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('[upgradeService] getBannerByKey error:', error);
    return null;
  }
};

/**
 * Lấy tất cả banners cho một screen
 */
export const getBannersForScreen = async (screenName) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_banners')
      .select('*')
      .eq('trigger_screen', screenName)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[upgradeService] getBannersForScreen error:', error);
    return [];
  }
};

/**
 * Kiểm tra xem banner có nên hiển thị không
 */
export const shouldShowBanner = async (bannerKey) => {
  try {
    // Check frequency rules
    const lastShown = await AsyncStorage.getItem(`banner_${bannerKey}_last`);
    const showCount = await AsyncStorage.getItem(`banner_${bannerKey}_count`);

    const { data: banner, error } = await supabase
      .from('upgrade_banners')
      .select('show_frequency, max_impressions')
      .eq('banner_key', bannerKey)
      .single();

    if (error) return true;

    const { show_frequency, max_impressions } = banner;

    // Check max impressions
    if (max_impressions && parseInt(showCount || '0') >= max_impressions) {
      return false;
    }

    // Check frequency
    if (lastShown) {
      const lastTime = new Date(lastShown).getTime();
      const now = Date.now();

      switch (show_frequency) {
        case 'once':
          return false;
        case 'daily':
          return now - lastTime > 24 * 60 * 60 * 1000;
        case 'weekly':
          return now - lastTime > 7 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    }

    return true;
  } catch (error) {
    console.error('[upgradeService] shouldShowBanner error:', error);
    return true;
  }
};

// ============================================================
// ANALYTICS FUNCTIONS
// ============================================================

/**
 * Track banner impression
 */
export const trackImpression = async (bannerId, screenName) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Insert event
    await supabase.from('upgrade_events').insert({
      user_id: user?.id,
      event_type: 'impression',
      banner_id: bannerId,
      screen_name: screenName,
    });

    // Update banner count
    await supabase.rpc('increment_banner_impressions', {
      banner_uuid: bannerId
    });

    // Update local storage
    const { data: banner } = await supabase
      .from('upgrade_banners')
      .select('banner_key')
      .eq('id', bannerId)
      .single();

    if (banner) {
      const key = `banner_${banner.banner_key}`;
      await AsyncStorage.setItem(`${key}_last`, new Date().toISOString());
      const count = await AsyncStorage.getItem(`${key}_count`);
      await AsyncStorage.setItem(`${key}_count`, String((parseInt(count || '0')) + 1));
    }
  } catch (error) {
    console.error('[upgradeService] trackImpression error:', error);
  }
};

/**
 * Track banner click
 */
export const trackClick = async (bannerId, screenName, tierType, tierLevel) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('upgrade_events').insert({
      user_id: user?.id,
      event_type: 'click',
      banner_id: bannerId,
      screen_name: screenName,
      tier_type: tierType,
      tier_level: tierLevel,
    });

    await supabase.rpc('increment_banner_clicks', {
      banner_uuid: bannerId
    });
  } catch (error) {
    console.error('[upgradeService] trackClick error:', error);
  }
};

/**
 * Track banner dismiss
 */
export const trackDismiss = async (bannerId, screenName) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('upgrade_events').insert({
      user_id: user?.id,
      event_type: 'dismiss',
      banner_id: bannerId,
      screen_name: screenName,
    });
  } catch (error) {
    console.error('[upgradeService] trackDismiss error:', error);
  }
};

/**
 * Track checkout start
 */
export const trackCheckoutStart = async (tierType, tierLevel, screenName) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('upgrade_events').insert({
      user_id: user?.id,
      event_type: 'checkout_start',
      tier_type: tierType,
      tier_level: tierLevel,
      screen_name: screenName,
    });
  } catch (error) {
    console.error('[upgradeService] trackCheckoutStart error:', error);
  }
};

// ============================================================
// CHECKOUT FUNCTIONS
// ============================================================

/**
 * Lấy checkout URL cho tier
 */
export const getCheckoutUrl = async (tierType, tierLevel) => {
  try {
    const tier = await getTier(tierType, tierLevel);
    if (!tier) return null;

    // Nếu có checkout_url trực tiếp
    if (tier.checkout_url) {
      return tier.checkout_url;
    }

    // Build Shopify checkout URL
    if (tier.shopify_variant_id) {
      const baseUrl = 'https://yinyangmasters.myshopify.com/cart';
      return `${baseUrl}/${tier.shopify_variant_id}:1?checkout[email]=`;
    }

    return null;
  } catch (error) {
    console.error('[upgradeService] getCheckoutUrl error:', error);
    return null;
  }
};

/**
 * Mở checkout flow
 */
export const openCheckout = async (tierType, tierLevel, navigation) => {
  try {
    const tier = await getTier(tierType, tierLevel);
    if (!tier) {
      throw new Error('Tier not found');
    }

    // Track checkout start
    await trackCheckoutStart(tierType, tierLevel, 'UpgradeScreen');

    // Navigate to checkout screen
    navigation.navigate('ShopStack', {
      screen: 'Checkout',
      params: {
        tier: tier,
        tierType: tierType,
        tierLevel: tierLevel,
      },
    });

    return true;
  } catch (error) {
    console.error('[upgradeService] openCheckout error:', error);
    return false;
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Format price VND
 */
export const formatPrice = (price) => {
  if (!price || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format price compact
 */
export const formatPriceCompact = (price) => {
  if (!price || price === 0) return 'Miễn phí';
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(0)}M`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K`;
  }
  return price.toString();
};

/**
 * Parse features from JSON
 */
export const parseFeatures = (featuresJson) => {
  if (!featuresJson) return [];
  try {
    return typeof featuresJson === 'string'
      ? JSON.parse(featuresJson)
      : featuresJson;
  } catch {
    return [];
  }
};

/**
 * Kiểm tra user có quyền truy cập feature không
 */
export const checkFeatureAccess = async (featureKey, userTierType, userTierLevel) => {
  try {
    const tier = await getTier(userTierType, userTierLevel);
    if (!tier) return false;

    const features = parseFeatures(tier.features_json);
    const feature = features.find(f => f.key === featureKey);

    return feature?.included === true;
  } catch (error) {
    console.error('[upgradeService] checkFeatureAccess error:', error);
    return false;
  }
};

/**
 * Lấy limit của feature
 */
export const getFeatureLimit = async (featureKey, userTierType, userTierLevel) => {
  try {
    const tier = await getTier(userTierType, userTierLevel);
    if (!tier) return 0;

    const features = parseFeatures(tier.features_json);
    const feature = features.find(f => f.key === featureKey);

    return feature?.limit || null; // null = unlimited
  } catch (error) {
    console.error('[upgradeService] getFeatureLimit error:', error);
    return 0;
  }
};

/**
 * Get tier level from string
 */
export const getTierLevelFromString = (tierString) => {
  if (!tierString) return 0;
  const normalized = tierString.toUpperCase();

  const levels = {
    'FREE': 0,
    'TIER1': 1,
    'TIER_1': 1,
    'PRO': 1,
    'TIER2': 2,
    'TIER_2': 2,
    'PREMIUM': 2,
    'TIER3': 3,
    'TIER_3': 3,
    'VIP': 3,
    'ELITE': 3,
    'ADMIN': 99,
  };

  return levels[normalized] || 0;
};

/**
 * Check if user needs upgrade for a tier level
 */
export const needsUpgrade = (userTierLevel, requiredLevel) => {
  return (userTierLevel || 0) < requiredLevel;
};

// ============================================================
// ADMIN FUNCTIONS
// ============================================================

/**
 * Get all banners for admin
 */
export const getAllBanners = async () => {
  try {
    const { data, error } = await supabase
      .from('upgrade_banners')
      .select('*')
      .order('trigger_type', { ascending: true })
      .order('tier_type', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[upgradeService] getAllBanners error:', error);
    return [];
  }
};

/**
 * Create a new tier (admin)
 */
export const createTier = async (tierData) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_tiers')
      .insert({
        tier_type: tierData.tier_type,
        tier_level: tierData.tier_level || 1,
        tier_name: tierData.tier_name,
        tier_name_vn: tierData.tier_name_vn || tierData.tier_name,
        short_description: tierData.short_description || '',
        price_vnd: tierData.price_vnd || 0,
        original_price_vnd: tierData.original_price_vnd || tierData.price_vnd || 0,
        features_json: tierData.features_json || [],
        not_included_features: tierData.not_included_features || [],
        icon_name: tierData.icon_name || 'Sparkles',
        color_primary: tierData.color_primary || '#FFD700',
        color_secondary: tierData.color_secondary || '#1a1a2e',
        is_active: tierData.is_active ?? true,
        is_featured: tierData.is_featured ?? false,
        is_popular: tierData.is_popular ?? false,
        checkout_url: tierData.checkout_url || null,
        shopify_variant_id: tierData.shopify_variant_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[upgradeService] createTier error:', error);
    throw error;
  }
};

/**
 * Update a tier (admin)
 */
export const updateTier = async (tierId, updates) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_tiers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tierId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[upgradeService] updateTier error:', error);
    throw error;
  }
};

/**
 * Delete a tier (admin)
 */
export const deleteTier = async (tierId) => {
  try {
    const { error } = await supabase
      .from('upgrade_tiers')
      .delete()
      .eq('id', tierId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[upgradeService] deleteTier error:', error);
    throw error;
  }
};

/**
 * Create a new banner (admin)
 */
export const createBanner = async (bannerData) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_banners')
      .insert({
        banner_key: bannerData.banner_key,
        banner_type: bannerData.banner_type || 'banner',
        trigger_type: bannerData.trigger_type || 'promotion',
        trigger_screen: bannerData.trigger_screen || null,
        tier_type: bannerData.tier_type || 'scanner',
        tier_level: bannerData.tier_level || 1,
        title: bannerData.title,
        subtitle: bannerData.subtitle || '',
        cta_text: bannerData.cta_text || 'Nâng cấp ngay',
        icon_name: bannerData.icon_name || 'Sparkles',
        background_gradient: bannerData.background_gradient || ['#1a1a2e', '#2d2d44'],
        priority: bannerData.priority || 0,
        show_frequency: bannerData.show_frequency || 'always',
        max_impressions: bannerData.max_impressions || null,
        is_active: bannerData.is_active ?? true,
        is_dismissible: bannerData.is_dismissible ?? true,
        impressions: 0,
        clicks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[upgradeService] createBanner error:', error);
    throw error;
  }
};

/**
 * Update a banner (admin)
 */
export const updateBanner = async (bannerId, updates) => {
  try {
    const { data, error } = await supabase
      .from('upgrade_banners')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bannerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[upgradeService] updateBanner error:', error);
    throw error;
  }
};

/**
 * Delete a banner (admin)
 */
export const deleteBanner = async (bannerId) => {
  try {
    const { error } = await supabase
      .from('upgrade_banners')
      .delete()
      .eq('id', bannerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[upgradeService] deleteBanner error:', error);
    throw error;
  }
};

/**
 * Get upgrade analytics for admin dashboard
 */
export const getUpgradeAnalytics = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get banner stats
    const { data: banners, error: bannersError } = await supabase
      .from('upgrade_banners')
      .select('id, banner_key, impressions, clicks, is_active');

    if (bannersError) throw bannersError;

    // Calculate totals
    const totalImpressions = banners.reduce((sum, b) => sum + (b.impressions || 0), 0);
    const totalClicks = banners.reduce((sum, b) => sum + (b.clicks || 0), 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Get events count
    const { count: eventCount, error: eventError } = await supabase
      .from('upgrade_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get conversions (checkout_start events)
    const { count: conversionCount } = await supabase
      .from('upgrade_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'checkout_start')
      .gte('created_at', startDate.toISOString());

    // Top performing banners
    const topBanners = banners
      .filter(b => b.is_active)
      .map(b => ({
        ...b,
        ctr: b.impressions > 0 ? (b.clicks / b.impressions) * 100 : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      totalImpressions,
      totalClicks,
      averageCTR,
      totalConversions: conversionCount || 0,
      totalEvents: eventCount || 0,
      topBanners,
      period: days,
    };
  } catch (error) {
    console.error('[upgradeService] getUpgradeAnalytics error:', error);
    return null;
  }
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  // Tiers
  getTiersByType,
  getTier,
  getNextTier,
  getFeaturedTier,

  // Banners
  getBannerByTrigger,
  getBannerByKey,
  getBannersForScreen,
  shouldShowBanner,
  getAllBanners,

  // Admin
  createTier,
  updateTier,
  deleteTier,
  createBanner,
  updateBanner,
  deleteBanner,
  getUpgradeAnalytics,

  // Analytics
  trackImpression,
  trackClick,
  trackDismiss,
  trackCheckoutStart,

  // Checkout
  getCheckoutUrl,
  openCheckout,

  // Helpers
  formatPrice,
  formatPriceCompact,
  parseFeatures,
  checkFeatureAccess,
  getFeatureLimit,
  getTierLevelFromString,
  needsUpgrade,

  // Constants
  TIER_TYPES,
  BANNER_TYPES,
  TRIGGER_TYPES,
};
