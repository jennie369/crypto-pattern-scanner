/**
 * wishlistService.js - Wishlist Service
 * Manages user's wishlist functionality with Supabase
 * Supports add, remove, check, and fetch operations
 * V2: Added notification integration for price drop alerts
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService, { sendLocalNotification } from './notificationService';

const WISHLIST_STORAGE_KEY = '@gem_wishlist_local';
const WISHLIST_PRICES_KEY = '@gem_wishlist_prices';

/**
 * Get current user's wishlist from Supabase
 * @returns {Promise<Array>} Array of wishlist items
 */
export const getWishlist = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Return local wishlist for guest users
      return getLocalWishlist();
    }

    const { data, error } = await supabase
      .from('user_wishlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[wishlistService] getWishlist error:', err);
    return [];
  }
};

/**
 * Check if a product is in the user's wishlist
 * @param {string} productId - The Shopify product ID
 * @returns {Promise<boolean>} True if in wishlist
 */
export const isInWishlist = async (productId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Check local wishlist for guest users
      const localWishlist = await getLocalWishlist();
      return localWishlist.some(item => item.product_id === productId);
    }

    const { data, error } = await supabase
      .from('user_wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (err) {
    console.error('[wishlistService] isInWishlist error:', err);
    return false;
  }
};

/**
 * Add a product to the user's wishlist
 * @param {Object} productData - Product data to add
 * @returns {Promise<Object>} Result with success status
 */
export const addToWishlist = async (productData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Add to local wishlist for guest users
      return addToLocalWishlist(productData);
    }

    // Extract product_id from various possible fields
    const productId =
      productData.id?.toString() ||
      productData.product_id?.toString() ||
      productData.shopify_product_id?.toString() ||
      productData.variants?.[0]?.product_id?.toString() ||
      null;

    // Validate product_id is not null
    if (!productId) {
      console.error('[wishlistService] Cannot add to wishlist: product_id is null', productData);
      return { success: false, error: 'Không thể thêm vào yêu thích: thiếu ID sản phẩm' };
    }

    const wishlistItem = {
      user_id: user.id,
      product_id: productId,
      product_handle: productData.handle || productData.product_handle || null,
      product_title: productData.title || productData.product_title || 'Sản phẩm',
      product_image: productData.images?.[0]?.src || productData.image?.src || productData.featuredImage?.src || productData.product_image || null,
      product_price: parseFloat(productData.variants?.[0]?.price || productData.price || productData.product_price || 0),
      product_compare_price: parseFloat(productData.variants?.[0]?.compareAtPrice || productData.compareAtPrice || productData.product_compare_price || 0),
      variant_id: productData.variants?.[0]?.id?.toString() || productData.variant_id || null,
    };

    const { data, error } = await supabase
      .from('user_wishlist')
      .insert(wishlistItem)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Already exists
        return { success: true, message: 'Sản phẩm đã có trong yêu thích' };
      }
      throw error;
    }

    // V2: Store price for price drop tracking
    const productPrice = wishlistItem.product_price;
    if (productPrice > 0) {
      await storeWishlistPrice(productId, productPrice);
    }

    return { success: true, data, message: 'Đã thêm vào yêu thích' };
  } catch (err) {
    console.error('[wishlistService] addToWishlist error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Remove a product from the user's wishlist
 * @param {string} productId - The Shopify product ID
 * @returns {Promise<Object>} Result with success status
 */
export const removeFromWishlist = async (productId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Remove from local wishlist for guest users
      return removeFromLocalWishlist(productId);
    }

    const { error } = await supabase
      .from('user_wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;

    // V2: Remove stored price
    await removeStoredPrice(productId);

    return { success: true, message: 'Đã xóa khỏi yêu thích' };
  } catch (err) {
    console.error('[wishlistService] removeFromWishlist error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Toggle wishlist status for a product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Result with new status
 */
export const toggleWishlist = async (productData) => {
  const productId = productData.id?.toString() || productData.product_id;
  const inWishlist = await isInWishlist(productId);

  if (inWishlist) {
    const result = await removeFromWishlist(productId);
    return { ...result, isInWishlist: false };
  } else {
    const result = await addToWishlist(productData);
    return { ...result, isInWishlist: true };
  }
};

/**
 * Get wishlist count
 * @returns {Promise<number>} Number of items in wishlist
 */
export const getWishlistCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const localWishlist = await getLocalWishlist();
      return localWishlist.length;
    }

    const { count, error } = await supabase
      .from('user_wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('[wishlistService] getWishlistCount error:', err);
    return 0;
  }
};

// ============================================================
// LOCAL STORAGE FUNCTIONS (for guest users)
// ============================================================

/**
 * Get local wishlist from AsyncStorage
 */
const getLocalWishlist = async () => {
  try {
    const stored = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('[wishlistService] getLocalWishlist error:', err);
    return [];
  }
};

/**
 * Add to local wishlist
 */
const addToLocalWishlist = async (productData) => {
  try {
    const wishlist = await getLocalWishlist();

    // Extract product_id from various possible fields
    const productId =
      productData.id?.toString() ||
      productData.product_id?.toString() ||
      productData.shopify_product_id?.toString() ||
      productData.variants?.[0]?.product_id?.toString() ||
      null;

    // Validate product_id is not null
    if (!productId) {
      console.error('[wishlistService] Cannot add to local wishlist: product_id is null', productData);
      return { success: false, error: 'Không thể thêm vào yêu thích: thiếu ID sản phẩm' };
    }

    // Check if already exists
    if (wishlist.some(item => item.product_id === productId)) {
      return { success: true, message: 'Sản phẩm đã có trong yêu thích' };
    }

    const newItem = {
      id: `local_${Date.now()}`,
      product_id: productId,
      product_handle: productData.handle || productData.product_handle || null,
      product_title: productData.title || productData.product_title || 'Sản phẩm',
      product_image: productData.images?.[0]?.src || productData.image?.src || productData.featuredImage?.src || productData.product_image || null,
      product_price: parseFloat(productData.variants?.[0]?.price || productData.price || productData.product_price || 0),
      product_compare_price: parseFloat(productData.variants?.[0]?.compareAtPrice || productData.compareAtPrice || productData.product_compare_price || 0),
      created_at: new Date().toISOString(),
    };

    wishlist.unshift(newItem);
    await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));

    // V2: Store price for price drop tracking
    if (newItem.product_price > 0) {
      await storeWishlistPrice(productId, newItem.product_price);
    }

    return { success: true, data: newItem, message: 'Đã thêm vào yêu thích' };
  } catch (err) {
    console.error('[wishlistService] addToLocalWishlist error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Remove from local wishlist
 */
const removeFromLocalWishlist = async (productId) => {
  try {
    const wishlist = await getLocalWishlist();
    const filtered = wishlist.filter(item => item.product_id !== productId);
    await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(filtered));

    // V2: Remove stored price
    await removeStoredPrice(productId);

    return { success: true, message: 'Đã xóa khỏi yêu thích' };
  } catch (err) {
    console.error('[wishlistService] removeFromLocalWishlist error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Sync local wishlist to Supabase after user logs in
 */
export const syncLocalWishlistToSupabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const localWishlist = await getLocalWishlist();
    if (localWishlist.length === 0) return;

    // Add each local item to Supabase
    for (const item of localWishlist) {
      await supabase
        .from('user_wishlist')
        .upsert({
          user_id: user.id,
          product_id: item.product_id,
          product_handle: item.product_handle,
          product_title: item.product_title,
          product_image: item.product_image,
          product_price: item.product_price,
          product_compare_price: item.product_compare_price,
        }, {
          onConflict: 'user_id,product_id',
        });
    }

    // Clear local storage after sync
    await AsyncStorage.removeItem(WISHLIST_STORAGE_KEY);
    console.log('[wishlistService] Local wishlist synced to Supabase');
  } catch (err) {
    console.error('[wishlistService] syncLocalWishlistToSupabase error:', err);
  }
};

// ============================================================
// V2: NOTIFICATION INTEGRATION
// ============================================================

/**
 * Store product price when added to wishlist (for price drop comparison)
 * @param {string} productId - Product ID
 * @param {number} price - Current price
 */
const storeWishlistPrice = async (productId, price) => {
  try {
    const stored = await AsyncStorage.getItem(WISHLIST_PRICES_KEY);
    const prices = stored ? JSON.parse(stored) : {};
    prices[productId] = {
      originalPrice: price,
      storedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(WISHLIST_PRICES_KEY, JSON.stringify(prices));
  } catch (err) {
    console.error('[wishlistService] storeWishlistPrice error:', err);
  }
};

/**
 * Get stored price for a wishlist product
 * @param {string} productId - Product ID
 * @returns {Promise<Object|null>} Price data or null
 */
export const getStoredWishlistPrice = async (productId) => {
  try {
    const stored = await AsyncStorage.getItem(WISHLIST_PRICES_KEY);
    if (!stored) return null;
    const prices = JSON.parse(stored);
    return prices[productId] || null;
  } catch (err) {
    console.error('[wishlistService] getStoredWishlistPrice error:', err);
    return null;
  }
};

/**
 * Remove stored price when product is removed from wishlist
 * @param {string} productId - Product ID
 */
const removeStoredPrice = async (productId) => {
  try {
    const stored = await AsyncStorage.getItem(WISHLIST_PRICES_KEY);
    if (!stored) return;
    const prices = JSON.parse(stored);
    delete prices[productId];
    await AsyncStorage.setItem(WISHLIST_PRICES_KEY, JSON.stringify(prices));
  } catch (err) {
    console.error('[wishlistService] removeStoredPrice error:', err);
  }
};

/**
 * Check wishlist items for price drops and send notifications
 * @returns {Promise<Array>} Array of products with price drops
 */
export const checkWishlistPriceDrops = async () => {
  try {
    const wishlist = await getWishlist();
    const priceDrops = [];

    for (const item of wishlist) {
      const storedData = await getStoredWishlistPrice(item.product_id);
      if (!storedData) continue;

      const originalPrice = storedData.originalPrice;
      const currentPrice = item.product_price;

      // Check if price dropped by at least 5%
      if (currentPrice < originalPrice) {
        const dropPercent = ((originalPrice - currentPrice) / originalPrice) * 100;

        if (dropPercent >= 5) {
          priceDrops.push({
            ...item,
            originalPrice,
            currentPrice,
            dropPercent: dropPercent.toFixed(0),
          });
        }
      }
    }

    return priceDrops;
  } catch (err) {
    console.error('[wishlistService] checkWishlistPriceDrops error:', err);
    return [];
  }
};

/**
 * Send price drop notification for a wishlist item
 * @param {Object} item - Wishlist item with price drop info
 */
export const sendPriceDropNotification = async (item) => {
  try {
    const formatPrice = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(value || 0);
    };

    await sendLocalNotification({
      title: '💰 Giảm giá sản phẩm yêu thích!',
      body: `${item.product_title} giảm ${item.dropPercent}%! Giá mới: ${formatPrice(item.currentPrice)}`,
      data: {
        type: 'wishlist_price_drop',
        productId: item.product_id,
        productHandle: item.product_handle,
      },
    });

    console.log('[wishlistService] Price drop notification sent:', item.product_title);
  } catch (err) {
    console.error('[wishlistService] sendPriceDropNotification error:', err);
  }
};

/**
 * Send back in stock notification
 * @param {Object} product - Product that is back in stock
 */
export const sendBackInStockNotification = async (product) => {
  try {
    await sendLocalNotification({
      title: '🛍️ Sản phẩm có hàng trở lại!',
      body: `${product.title || product.product_title} đã có hàng. Mua ngay trước khi hết!`,
      data: {
        type: 'back_in_stock',
        productId: product.id || product.product_id,
        productHandle: product.handle || product.product_handle,
      },
    });

    console.log('[wishlistService] Back in stock notification sent:', product.title);
  } catch (err) {
    console.error('[wishlistService] sendBackInStockNotification error:', err);
  }
};

/**
 * Send flash sale notification
 * @param {Object} saleData - Flash sale data
 */
export const sendFlashSaleNotification = async (saleData) => {
  try {
    const { title, discountPercent, endTime } = saleData;

    // Calculate time remaining
    const end = new Date(endTime);
    const now = new Date();
    const hoursLeft = Math.ceil((end - now) / (1000 * 60 * 60));

    await sendLocalNotification({
      title: '⚡ Flash Sale bắt đầu!',
      body: `${title || 'Giảm giá sốc'} - Giảm đến ${discountPercent}%! Còn ${hoursLeft} giờ!`,
      data: {
        type: 'flash_sale',
        saleId: saleData.id,
        endTime,
      },
    });

    console.log('[wishlistService] Flash sale notification sent');
  } catch (err) {
    console.error('[wishlistService] sendFlashSaleNotification error:', err);
  }
};

// Note: Price storage is integrated in the addToWishlist and addToLocalWishlist flows above

export default {
  getWishlist,
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
  syncLocalWishlistToSupabase,
  // V2 exports
  getStoredWishlistPrice,
  checkWishlistPriceDrops,
  sendPriceDropNotification,
  sendBackInStockNotification,
  sendFlashSaleNotification,
};
