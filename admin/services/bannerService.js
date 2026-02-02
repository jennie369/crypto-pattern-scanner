/**
 * Banner Service for Admin Dashboard
 * CRUD operations for shop banners, promo bars, featured products, and section banners
 */

import { supabase } from './supabase';

// ============================================
// SHOP BANNERS (Carousel)
// ============================================

/**
 * Get all shop banners
 */
export async function getAllShopBanners() {
  try {
    const { data, error } = await supabase
      .from('shop_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[bannerService] getAllShopBanners error:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Create a new shop banner
 */
export async function createShopBanner(bannerData) {
  try {
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
    await logBannerAction(data.id, 'shop_banner', 'create', cleanedData);

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] createShopBanner error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a shop banner
 */
export async function updateShopBanner(bannerId, updates) {
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
      .from('shop_banners')
      .update(cleanedUpdates)
      .eq('id', bannerId)
      .select()
      .single();

    if (error) throw error;

    await logBannerAction(bannerId, 'shop_banner', 'update', cleanedUpdates);

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] updateShopBanner error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a shop banner
 */
export async function deleteShopBanner(bannerId) {
  try {
    await logBannerAction(bannerId, 'shop_banner', 'delete', null);

    const { error } = await supabase
      .from('shop_banners')
      .delete()
      .eq('id', bannerId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[bannerService] deleteShopBanner error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle banner active status
 */
export async function toggleBannerActive(bannerId, isActive) {
  try {
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

    await logBannerAction(bannerId, 'shop_banner', 'toggle_active', { is_active: isActive });

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] toggleBannerActive error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reorder banners
 */
export async function reorderBanners(orderedBanners) {
  try {
    const updates = orderedBanners.map((banner, index) =>
      supabase
        .from('shop_banners')
        .update({ display_order: index, updated_at: new Date().toISOString() })
        .eq('id', banner.id)
    );

    await Promise.all(updates);

    return { success: true };
  } catch (error) {
    console.error('[bannerService] reorderBanners error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get banner statistics
 */
export async function getBannerStats() {
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
        ctr: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00',
      }
    };
  } catch (error) {
    console.error('[bannerService] getBannerStats error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// PROMO BARS
// ============================================

/**
 * Get all promo bars
 */
export async function getAllPromoBars() {
  try {
    const { data, error } = await supabase
      .from('promo_bar_config')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[bannerService] getAllPromoBars error:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Create a new promo bar
 */
export async function createPromoBar(promoData) {
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

    await logBannerAction(data.id, 'promo_bar', 'create', cleanedData);

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] createPromoBar error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a promo bar
 */
export async function updatePromoBar(promoId, updates) {
  try {
    const cleanedUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

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

    await logBannerAction(promoId, 'promo_bar', 'update', cleanedUpdates);

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] updatePromoBar error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a promo bar
 */
export async function deletePromoBar(promoId) {
  try {
    await logBannerAction(promoId, 'promo_bar', 'delete', null);

    const { error } = await supabase
      .from('promo_bar_config')
      .delete()
      .eq('id', promoId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[bannerService] deletePromoBar error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle promo bar active status
 */
export async function togglePromoBarActive(promoId, isActive) {
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
    console.error('[bannerService] togglePromoBarActive error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get promo bar statistics
 */
export async function getPromoBarStats() {
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
    console.error('[bannerService] getPromoBarStats error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// FEATURED PRODUCTS
// ============================================

/**
 * Get all featured products
 */
export async function getAllFeaturedProducts() {
  try {
    const { data, error } = await supabase
      .from('featured_product_config')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[bannerService] getAllFeaturedProducts error:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Create a new featured product
 */
export async function createFeaturedProduct(productData) {
  try {
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('featured_product_config')
      .insert(cleanedData)
      .select()
      .single();

    if (error) throw error;

    await logBannerAction(data.id, 'featured_product', 'create', cleanedData);

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] createFeaturedProduct error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a featured product
 */
export async function updateFeaturedProduct(productId, updates) {
  try {
    const cleanedUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    Object.keys(cleanedUpdates).forEach(key => {
      if (cleanedUpdates[key] === undefined) {
        delete cleanedUpdates[key];
      }
    });

    const { data, error } = await supabase
      .from('featured_product_config')
      .update(cleanedUpdates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    await logBannerAction(productId, 'featured_product', 'update', cleanedUpdates);

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] updateFeaturedProduct error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a featured product
 */
export async function deleteFeaturedProduct(productId) {
  try {
    await logBannerAction(productId, 'featured_product', 'delete', null);

    const { error } = await supabase
      .from('featured_product_config')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[bannerService] deleteFeaturedProduct error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle featured product active status
 */
export async function toggleFeaturedProductActive(productId, isActive) {
  try {
    const { data, error } = await supabase
      .from('featured_product_config')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] toggleFeaturedProductActive error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get featured product statistics
 */
export async function getFeaturedProductStats() {
  try {
    const { data: products, error } = await supabase
      .from('featured_product_config')
      .select('id, is_active');

    if (error) throw error;

    const total = products?.length || 0;
    const active = products?.filter(p => p.is_active).length || 0;

    return {
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
      }
    };
  } catch (error) {
    console.error('[bannerService] getFeaturedProductStats error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// SECTION BANNERS
// ============================================

/**
 * Get all section banners
 */
export async function getAllSectionBanners() {
  try {
    const { data, error } = await supabase
      .from('section_banners')
      .select('*')
      .order('section_id', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[bannerService] getAllSectionBanners error:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Upsert a section banner
 */
export async function upsertSectionBanner(sectionId, bannerData) {
  try {
    const cleanedData = {
      section_id: sectionId,
      title: bannerData.title?.trim() || null,
      subtitle: bannerData.subtitle?.trim() || null,
      image_url: bannerData.image_url,
      background_color: bannerData.background_color || '#1a0b2e',
      text_color: bannerData.text_color || '#FFFFFF',
      is_active: bannerData.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('section_banners')
      .upsert(cleanedData, { onConflict: 'section_id' })
      .select()
      .single();

    if (error) throw error;

    await logBannerAction(sectionId, 'section_banner', 'upsert', cleanedData);

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] upsertSectionBanner error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle section banner active status
 */
export async function toggleSectionBannerActive(sectionId, isActive) {
  try {
    const { data, error } = await supabase
      .from('section_banners')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('section_id', sectionId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[bannerService] toggleSectionBannerActive error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ADMIN LOGS
// ============================================

/**
 * Log an admin action on a banner
 */
async function logBannerAction(entityId, entityType, action, changes) {
  try {
    await supabase
      .from('admin_banner_logs')
      .insert({
        banner_id: entityId,
        banner_type: entityType,
        action,
        changes,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('[bannerService] logBannerAction error:', error);
  }
}

/**
 * Get logs for a specific banner
 */
export async function getBannerLogs(bannerId) {
  try {
    const { data, error } = await supabase
      .from('admin_banner_logs')
      .select('*')
      .eq('banner_id', bannerId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[bannerService] getBannerLogs error:', error);
    return { success: false, data: [], error: error.message };
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to shop banners changes
 */
export function subscribeToShopBanners(callback) {
  return supabase
    .channel('shop_banners_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'shop_banners' },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to promo bars changes
 */
export function subscribeToPromoBars(callback) {
  return supabase
    .channel('promo_bar_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'promo_bar_config' },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to featured products changes
 */
export function subscribeToFeaturedProducts(callback) {
  return supabase
    .channel('featured_product_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'featured_product_config' },
      callback
    )
    .subscribe();
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}

// ============================================
// COMBINED STATISTICS
// ============================================

/**
 * Get all banner statistics combined
 */
export async function getAllBannerStats() {
  try {
    const [bannerStats, promoStats, productStats] = await Promise.all([
      getBannerStats(),
      getPromoBarStats(),
      getFeaturedProductStats(),
    ]);

    return {
      success: true,
      data: {
        carousel: bannerStats.data || {},
        promoBars: promoStats.data || {},
        featuredProducts: productStats.data || {},
        total: {
          banners: (bannerStats.data?.total || 0) + (promoStats.data?.total || 0) + (productStats.data?.total || 0),
          active: (bannerStats.data?.active || 0) + (promoStats.data?.active || 0) + (productStats.data?.active || 0),
        }
      }
    };
  } catch (error) {
    console.error('[bannerService] getAllBannerStats error:', error);
    return { success: false, error: error.message };
  }
}

export default {
  // Shop Banners
  getAllShopBanners,
  createShopBanner,
  updateShopBanner,
  deleteShopBanner,
  toggleBannerActive,
  reorderBanners,
  getBannerStats,
  // Promo Bars
  getAllPromoBars,
  createPromoBar,
  updatePromoBar,
  deletePromoBar,
  togglePromoBarActive,
  getPromoBarStats,
  // Featured Products
  getAllFeaturedProducts,
  createFeaturedProduct,
  updateFeaturedProduct,
  deleteFeaturedProduct,
  toggleFeaturedProductActive,
  getFeaturedProductStats,
  // Section Banners
  getAllSectionBanners,
  upsertSectionBanner,
  toggleSectionBannerActive,
  // Logs
  getBannerLogs,
  // Subscriptions
  subscribeToShopBanners,
  subscribeToPromoBars,
  subscribeToFeaturedProducts,
  unsubscribe,
  // Combined
  getAllBannerStats,
};
