/**
 * GEM Academy - Promo Banner Service
 * Fetches promotional banners for the courses home screen
 */

import { supabase } from './supabase';

export const getPromoBanners = async (userTier = null) => {
  try {
    const { data, error } = await supabase
      .from('promo_banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      // Graceful degradation if table doesn't exist
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('[promoBannerService] promo_banners table not ready yet');
        return { success: true, data: [] };
      }
      throw error;
    }

    // Filter by tier if provided
    const filtered = userTier
      ? data?.filter(b => !b.target_tier || b.target_tier === userTier)
      : data;

    return { success: true, data: filtered || [] };
  } catch (error) {
    console.error('[promoBannerService] getPromoBanners error:', error);
    return { success: false, data: [] };
  }
};

export const getBannerById = async (bannerId) => {
  try {
    const { data, error } = await supabase
      .from('promo_banners')
      .select('*')
      .eq('id', bannerId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[promoBannerService] getBannerById error:', error);
    return { success: false, data: null };
  }
};

export default { getPromoBanners, getBannerById };
