/**
 * recentlyViewedService.js - Recently Viewed Service
 * Tracks user's recently viewed products
 * Supports both logged-in users (Supabase) and guests (AsyncStorage)
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENTLY_VIEWED_STORAGE_KEY = '@gem_recently_viewed_local';
const MAX_RECENTLY_VIEWED = 20; // Maximum items to keep

/**
 * Get recently viewed products for current user
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise<Array>} Array of recently viewed products
 */
export const getRecentlyViewed = async (limit = 10) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Return local recently viewed for guest users
      return getLocalRecentlyViewed(limit);
    }

    const { data, error } = await supabase
      .from('user_recently_viewed')
      .select('*')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[recentlyViewedService] getRecentlyViewed error:', err);
    return [];
  }
};

/**
 * Get local recently viewed products (for guest users)
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise<Array>} Array of recently viewed products
 */
export const getLocalRecentlyViewed = async (limit = 10) => {
  try {
    const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const items = stored ? JSON.parse(stored) : [];
    return items.slice(0, limit);
  } catch (err) {
    console.error('[recentlyViewedService] getLocalRecentlyViewed error:', err);
    return [];
  }
};

/**
 * Add a product to recently viewed
 * Uses upsert to update viewed_at if product already exists
 * @param {Object} productData - Product data to add
 * @returns {Promise<Object>} Result with success status
 */
export const addToRecentlyViewed = async (productData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Add to local recently viewed for guest users
      return addToLocalRecentlyViewed(productData);
    }

    const productId = productData.id?.toString() || productData.product_id;

    // Use the upsert function we created in the migration
    const { error } = await supabase.rpc('upsert_recently_viewed', {
      p_user_id: user.id,
      p_product_id: productId,
      p_product_handle: productData.handle || productData.product_handle || null,
      p_product_title: productData.title || productData.product_title || null,
      p_product_image: productData.images?.[0]?.src || productData.image?.src || productData.product_image || null,
      p_product_price: parseFloat(productData.variants?.[0]?.price || productData.price || productData.product_price || 0),
    });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[recentlyViewedService] addToRecentlyViewed error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Add to local recently viewed (for guest users)
 */
const addToLocalRecentlyViewed = async (productData) => {
  try {
    const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    let items = stored ? JSON.parse(stored) : [];

    const productId = productData.id?.toString() || productData.product_id;

    // Remove if already exists (will be added to front)
    items = items.filter(item => item.product_id !== productId);

    const newItem = {
      id: `local_${Date.now()}`,
      product_id: productId,
      product_handle: productData.handle || productData.product_handle,
      product_title: productData.title || productData.product_title,
      product_image: productData.images?.[0]?.src || productData.image?.src || productData.product_image,
      product_price: parseFloat(productData.variants?.[0]?.price || productData.price || productData.product_price || 0),
      viewed_at: new Date().toISOString(),
    };

    // Add to front
    items.unshift(newItem);

    // Keep only MAX_RECENTLY_VIEWED items
    items = items.slice(0, MAX_RECENTLY_VIEWED);

    await AsyncStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(items));
    return { success: true };
  } catch (err) {
    console.error('[recentlyViewedService] addToLocalRecentlyViewed error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Clear recently viewed history
 * @returns {Promise<Object>} Result with success status
 */
export const clearRecentlyViewed = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      await AsyncStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
      return { success: true };
    }

    const { error } = await supabase
      .from('user_recently_viewed')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[recentlyViewedService] clearRecentlyViewed error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Sync local recently viewed to Supabase after user logs in
 */
export const syncLocalRecentlyViewedToSupabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const localItems = await getLocalRecentlyViewed(MAX_RECENTLY_VIEWED);
    if (localItems.length === 0) return;

    // Add each local item to Supabase using upsert
    for (const item of localItems) {
      await supabase.rpc('upsert_recently_viewed', {
        p_user_id: user.id,
        p_product_id: item.product_id,
        p_product_handle: item.product_handle,
        p_product_title: item.product_title,
        p_product_image: item.product_image,
        p_product_price: item.product_price,
      });
    }

    // Clear local storage after sync
    await AsyncStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    console.log('[recentlyViewedService] Local recently viewed synced to Supabase');
  } catch (err) {
    console.error('[recentlyViewedService] syncLocalRecentlyViewedToSupabase error:', err);
  }
};

/**
 * Remove a specific product from recently viewed
 * @param {string} productId - Product ID to remove
 */
export const removeFromRecentlyViewed = async (productId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Remove from local
      const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      let items = stored ? JSON.parse(stored) : [];
      items = items.filter(item => item.product_id !== productId);
      await AsyncStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(items));
      return { success: true };
    }

    const { error } = await supabase
      .from('user_recently_viewed')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[recentlyViewedService] removeFromRecentlyViewed error:', err);
    return { success: false, error: err.message };
  }
};
