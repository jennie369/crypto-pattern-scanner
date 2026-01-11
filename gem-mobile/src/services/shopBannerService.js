/**
 * GEM Shop - Shop Banner Service
 * Admin CRUD operations for carousel banners in Shop tab
 */

import { supabase } from './supabase';

// ========================================
// ADMIN CRUD OPERATIONS
// ========================================

/**
 * Get all shop banners (admin view)
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export const getAllShopBanners = async () => {
  try {
    const { data, error } = await supabase
      .from('shop_banners')
      .select(`
        *,
        created_by_profile:profiles!shop_banners_created_by_fkey(display_name, avatar_url)
      `)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[shopBannerService] getAllShopBanners error:', error);
    return { success: false, data: [], error: error.message };
  }
};

/**
 * Get active shop banners (user view)
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export const getActiveShopBanners = async () => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('shop_banners')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[shopBannerService] getActiveShopBanners error:', error);
    return { success: false, data: [], error: error.message };
  }
};

/**
 * Create a new shop banner
 * @param {Object} bannerData - Banner data
 * @param {string} createdBy - Admin user ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const createShopBanner = async (bannerData, createdBy) => {
  try {
    // Clean data
    const cleanedData = {
      title: bannerData.title?.trim() || null,
      subtitle: bannerData.subtitle?.trim() || null,
      description: bannerData.description?.trim() || null,
      image_url: bannerData.image_url,
      link_type: bannerData.link_type || 'none',
      link_value: bannerData.link_value?.trim() || null,
      display_order: bannerData.display_order || 0,
      is_active: bannerData.is_active ?? true,
      start_date: bannerData.start_date || null,
      end_date: bannerData.end_date || null,
      background_color: bannerData.background_color || '#1a0b2e',
      text_color: bannerData.text_color || '#FFFFFF',
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('shop_banners')
      .insert(cleanedData)
      .select()
      .single();

    if (error) throw error;

    // Log action
    await logBannerAction(data.id, 'create', cleanedData, createdBy);

    return { success: true, data };
  } catch (error) {
    console.error('[shopBannerService] createShopBanner error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing shop banner
 * @param {string} bannerId - Banner UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const updateShopBanner = async (bannerId, updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Clean data
    const cleanedUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(cleanedUpdates).forEach(key => {
      if (cleanedUpdates[key] === undefined) {
        delete cleanedUpdates[key];
      }
    });

    const { data, error } = await supabase
      .from('shop_banners')
      .update(cleanedUpdates)
      .eq('id', bannerId)
      .select()
      .single();

    if (error) throw error;

    // Log action
    await logBannerAction(bannerId, 'update', cleanedUpdates, user?.id);

    return { success: true, data };
  } catch (error) {
    console.error('[shopBannerService] updateShopBanner error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a shop banner
 * @param {string} bannerId - Banner UUID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteShopBanner = async (bannerId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Log before delete
    await logBannerAction(bannerId, 'delete', null, user?.id);

    const { error } = await supabase
      .from('shop_banners')
      .delete()
      .eq('id', bannerId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[shopBannerService] deleteShopBanner error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle banner active status
 * @param {string} bannerId - Banner UUID
 * @param {boolean} isActive - New active status
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const toggleBannerActive = async (bannerId, isActive) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('shop_banners')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', bannerId)
      .select()
      .single();

    if (error) throw error;

    // Log action
    await logBannerAction(bannerId, 'toggle_active', { is_active: isActive }, user?.id);

    return { success: true, data };
  } catch (error) {
    console.error('[shopBannerService] toggleBannerActive error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Reorder banners
 * @param {Array<{id: string, display_order: number}>} orderedBanners - Banners with new order
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const reorderBanners = async (orderedBanners) => {
  try {
    // Update each banner's display_order
    const updates = orderedBanners.map((banner, index) =>
      supabase
        .from('shop_banners')
        .update({ display_order: index, updated_at: new Date().toISOString() })
        .eq('id', banner.id)
    );

    await Promise.all(updates);

    return { success: true };
  } catch (error) {
    console.error('[shopBannerService] reorderBanners error:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// ANALYTICS
// ========================================

/**
 * Get banner statistics
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getBannerStats = async () => {
  try {
    const { data: banners, error } = await supabase
      .from('shop_banners')
      .select('id, is_active, view_count, click_count');

    if (error) throw error;

    const total = banners?.length || 0;
    const active = banners?.filter(b => b.is_active).length || 0;
    const totalViews = banners?.reduce((sum, b) => sum + (b.view_count || 0), 0) || 0;
    const totalClicks = banners?.reduce((sum, b) => sum + (b.click_count || 0), 0) || 0;

    return {
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        totalViews,
        totalClicks,
        ctr: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0,
      }
    };
  } catch (error) {
    console.error('[shopBannerService] getBannerStats error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Record a banner view
 * @param {string} bannerId - Banner UUID
 * @returns {Promise<{success: boolean}>}
 */
export const recordBannerView = async (bannerId) => {
  try {
    await supabase.rpc('increment_shop_banner_view', { banner_id: bannerId });
    return { success: true };
  } catch (error) {
    console.error('[shopBannerService] recordBannerView error:', error);
    return { success: false };
  }
};

/**
 * Record a banner click
 * @param {string} bannerId - Banner UUID
 * @returns {Promise<{success: boolean}>}
 */
export const recordBannerClick = async (bannerId) => {
  try {
    await supabase.rpc('increment_shop_banner_click', { banner_id: bannerId });
    return { success: true };
  } catch (error) {
    console.error('[shopBannerService] recordBannerClick error:', error);
    return { success: false };
  }
};

// ========================================
// ADMIN LOGS
// ========================================

/**
 * Log an admin action on a banner
 * @param {string} bannerId - Banner UUID
 * @param {string} action - Action type
 * @param {Object} changes - Changes made
 * @param {string} adminId - Admin user ID
 */
export const logBannerAction = async (bannerId, action, changes, adminId) => {
  try {
    await supabase
      .from('admin_banner_logs')
      .insert({
        banner_id: bannerId,
        action,
        changes,
        admin_id: adminId,
      });
  } catch (error) {
    console.error('[shopBannerService] logBannerAction error:', error);
  }
};

/**
 * Get logs for a specific banner
 * @param {string} bannerId - Banner UUID
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export const getBannerLogs = async (bannerId) => {
  try {
    const { data, error } = await supabase
      .from('admin_banner_logs')
      .select(`
        *,
        admin:profiles!admin_banner_logs_admin_id_fkey(display_name, avatar_url)
      `)
      .eq('banner_id', bannerId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[shopBannerService] getBannerLogs error:', error);
    return { success: false, data: [], error: error.message };
  }
};

// ========================================
// ADMIN TOOLTIPS
// ========================================

/**
 * Check if user has seen a tooltip
 * @param {string} userId - User UUID
 * @param {string} tooltipKey - Tooltip key
 * @returns {Promise<boolean>}
 */
export const hasSeenTooltip = async (userId, tooltipKey) => {
  try {
    const { data, error } = await supabase
      .from('admin_tooltips_seen')
      .select('id')
      .eq('user_id', userId)
      .eq('tooltip_key', tooltipKey)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  } catch (error) {
    console.error('[shopBannerService] hasSeenTooltip error:', error);
    return false;
  }
};

/**
 * Mark a tooltip as seen
 * @param {string} userId - User UUID
 * @param {string} tooltipKey - Tooltip key
 * @returns {Promise<{success: boolean}>}
 */
export const markTooltipSeen = async (userId, tooltipKey) => {
  try {
    await supabase
      .from('admin_tooltips_seen')
      .upsert({
        user_id: userId,
        tooltip_key: tooltipKey,
        seen_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,tooltip_key'
      });

    return { success: true };
  } catch (error) {
    console.error('[shopBannerService] markTooltipSeen error:', error);
    return { success: false };
  }
};

/**
 * Get all seen tooltips for a user
 * @param {string} userId - User UUID
 * @returns {Promise<{success: boolean, data: Array<string>}>}
 */
export const getSeenTooltips = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('admin_tooltips_seen')
      .select('tooltip_key')
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true, data: (data || []).map(t => t.tooltip_key) };
  } catch (error) {
    console.error('[shopBannerService] getSeenTooltips error:', error);
    return { success: false, data: [] };
  }
};

// ========================================
// PROMO BAR CRUD OPERATIONS
// ========================================

/**
 * Get all promo bars (admin view)
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export const getAllPromoBars = async () => {
  try {
    const { data, error } = await supabase
      .from('promo_bar_config')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[shopBannerService] getAllPromoBars error:', error);
    return { success: false, data: [], error: error.message };
  }
};

/**
 * Get active promo bar (user view)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getActivePromoBar = async () => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('promo_bar_config')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('display_order', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, data: data || null };
  } catch (error) {
    console.error('[shopBannerService] getActivePromoBar error:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Create a new promo bar
 * @param {Object} promoData - Promo bar data
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const createPromoBar = async (promoData) => {
  try {
    const cleanedData = {
      message: promoData.message?.trim() || '',
      voucher_code: promoData.voucher_code?.trim() || null,
      link_text: promoData.link_text?.trim() || null,
      link_url: promoData.link_url?.trim() || null,
      background_color: promoData.background_color || '#FF4757',
      text_color: promoData.text_color || '#FFFFFF',
      is_active: promoData.is_active ?? true,
      start_date: promoData.start_date || null,
      end_date: promoData.end_date || null,
      display_order: promoData.display_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('promo_bar_config')
      .insert(cleanedData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[shopBannerService] createPromoBar error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing promo bar
 * @param {string} promoId - Promo bar UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const updatePromoBar = async (promoId, updates) => {
  try {
    const cleanedUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(cleanedUpdates).forEach(key => {
      if (cleanedUpdates[key] === undefined) {
        delete cleanedUpdates[key];
      }
    });

    const { data, error } = await supabase
      .from('promo_bar_config')
      .update(cleanedUpdates)
      .eq('id', promoId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[shopBannerService] updatePromoBar error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a promo bar
 * @param {string} promoId - Promo bar UUID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deletePromoBar = async (promoId) => {
  try {
    const { error } = await supabase
      .from('promo_bar_config')
      .delete()
      .eq('id', promoId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[shopBannerService] deletePromoBar error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle promo bar active status
 * @param {string} promoId - Promo bar UUID
 * @param {boolean} isActive - New active status
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const togglePromoBarActive = async (promoId, isActive) => {
  try {
    const { data, error } = await supabase
      .from('promo_bar_config')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', promoId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[shopBannerService] togglePromoBarActive error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get promo bar statistics
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getPromoBarStats = async () => {
  try {
    const { data: promoBars, error } = await supabase
      .from('promo_bar_config')
      .select('id, is_active');

    if (error) throw error;

    const total = promoBars?.length || 0;
    const active = promoBars?.filter(p => p.is_active).length || 0;

    return {
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
      }
    };
  } catch (error) {
    console.error('[shopBannerService] getPromoBarStats error:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// FEATURED PRODUCT CRUD OPERATIONS
// ========================================

/**
 * Get active featured product (user view)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getActiveFeaturedProduct = async () => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('featured_product_config')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('display_order', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, data: data || null };
  } catch (error) {
    console.error('[shopBannerService] getActiveFeaturedProduct error:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Get all featured products (admin view)
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export const getAllFeaturedProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('featured_product_config')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[shopBannerService] getAllFeaturedProducts error:', error);
    return { success: false, data: [], error: error.message };
  }
};

/**
 * Create a new featured product config
 * @param {Object} productData - Featured product data
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const createFeaturedProduct = async (productData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const cleanedData = {
      title: productData.title?.trim() || '',
      subtitle: productData.subtitle?.trim() || null,
      description: productData.description?.trim() || null,
      price: productData.price || null,
      original_price: productData.original_price || null,
      currency: productData.currency || 'VND',
      image_url: productData.image_url,
      background_image_url: productData.background_image_url || null,
      badge_text: productData.badge_text?.trim() || null,
      badge_color: productData.badge_color || '#FF4757',
      background_gradient_start: productData.background_gradient_start || '#1a0b2e',
      background_gradient_end: productData.background_gradient_end || '#2d1b4e',
      accent_color: productData.accent_color || '#FFD700',
      text_color: productData.text_color || '#FFFFFF',
      link_type: productData.link_type || 'product',
      link_value: productData.link_value?.trim() || null,
      cta_text: productData.cta_text?.trim() || 'Xem ngay',
      layout_style: productData.layout_style || 'card',
      show_price: productData.show_price ?? true,
      show_badge: productData.show_badge ?? true,
      show_description: productData.show_description ?? true,
      is_active: productData.is_active ?? true,
      start_date: productData.start_date || null,
      end_date: productData.end_date || null,
      display_order: productData.display_order || 0,
      created_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('featured_product_config')
      .insert(cleanedData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[shopBannerService] createFeaturedProduct error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a featured product config
 * @param {string} configId - Config UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const updateFeaturedProduct = async (configId, updates) => {
  try {
    const cleanedUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(cleanedUpdates).forEach(key => {
      if (cleanedUpdates[key] === undefined) {
        delete cleanedUpdates[key];
      }
    });

    const { data, error } = await supabase
      .from('featured_product_config')
      .update(cleanedUpdates)
      .eq('id', configId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[shopBannerService] updateFeaturedProduct error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a featured product config
 * @param {string} configId - Config UUID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFeaturedProduct = async (configId) => {
  try {
    const { error } = await supabase
      .from('featured_product_config')
      .delete()
      .eq('id', configId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[shopBannerService] deleteFeaturedProduct error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle featured product active status
 * @param {string} configId - Config UUID
 * @param {boolean} isActive - New active status
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const toggleFeaturedProductActive = async (configId, isActive) => {
  try {
    const { data, error } = await supabase
      .from('featured_product_config')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', configId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[shopBannerService] toggleFeaturedProductActive error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Record a featured product view
 * @param {string} configId - Config UUID
 * @returns {Promise<{success: boolean}>}
 */
export const recordFeaturedProductView = async (configId) => {
  try {
    await supabase.rpc('increment_featured_product_view', { product_config_id: configId });
    return { success: true };
  } catch (error) {
    console.error('[shopBannerService] recordFeaturedProductView error:', error);
    return { success: false };
  }
};

/**
 * Record a featured product click
 * @param {string} configId - Config UUID
 * @returns {Promise<{success: boolean}>}
 */
export const recordFeaturedProductClick = async (configId) => {
  try {
    await supabase.rpc('increment_featured_product_click', { product_config_id: configId });
    return { success: true };
  } catch (error) {
    console.error('[shopBannerService] recordFeaturedProductClick error:', error);
    return { success: false };
  }
};

/**
 * Get featured product stats
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getFeaturedProductStats = async () => {
  try {
    const { data: products, error } = await supabase
      .from('featured_product_config')
      .select('id, is_active, view_count, click_count');

    if (error) throw error;

    const total = products?.length || 0;
    const active = products?.filter(p => p.is_active).length || 0;
    const totalViews = products?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
    const totalClicks = products?.reduce((sum, p) => sum + (p.click_count || 0), 0) || 0;

    return {
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        totalViews,
        totalClicks,
        ctr: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0,
      }
    };
  } catch (error) {
    console.error('[shopBannerService] getFeaturedProductStats error:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// DEFAULT EXPORT
// ========================================

export default {
  // Admin CRUD - Banners
  getAllShopBanners,
  getActiveShopBanners,
  createShopBanner,
  updateShopBanner,
  deleteShopBanner,
  toggleBannerActive,
  reorderBanners,
  // Analytics - Banners
  getBannerStats,
  recordBannerView,
  recordBannerClick,
  // Logs
  logBannerAction,
  getBannerLogs,
  // Tooltips
  hasSeenTooltip,
  markTooltipSeen,
  getSeenTooltips,
  // Promo Bar CRUD
  getAllPromoBars,
  getActivePromoBar,
  createPromoBar,
  updatePromoBar,
  deletePromoBar,
  togglePromoBarActive,
  getPromoBarStats,
  // Featured Product CRUD
  getActiveFeaturedProduct,
  getAllFeaturedProducts,
  createFeaturedProduct,
  updateFeaturedProduct,
  deleteFeaturedProduct,
  toggleFeaturedProductActive,
  recordFeaturedProductView,
  recordFeaturedProductClick,
  getFeaturedProductStats,
};
