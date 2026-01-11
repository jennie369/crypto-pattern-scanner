/**
 * Gemral - Review Service
 * Handles fetching real Judge.me reviews with EXACT product matching
 * + In-app reviews from verified purchasers (Supabase)
 * NO random reviews - only show reviews for the specific product
 */

import reviewsData from '../data/reviews.json';
import { supabase } from './supabase';

class ReviewService {
  constructor() {
    this.reviewsData = reviewsData;
  }

  /**
   * Normalize product ID (remove gid:// prefix)
   */
  normalizeProductId(id) {
    if (!id) return null;

    const idStr = String(id);

    // Remove gid://shopify/Product/ prefix if exists
    if (idStr.startsWith('gid://shopify/Product/')) {
      return idStr.replace('gid://shopify/Product/', '');
    }

    // Remove gid://shopify/ProductVariant/ prefix if exists
    if (idStr.startsWith('gid://shopify/ProductVariant/')) {
      return idStr.replace('gid://shopify/ProductVariant/', '');
    }

    return idStr;
  }

  /**
   * Get reviews for a specific product - EXACT MATCH ONLY
   * NO random fallback - returns empty array if no reviews
   * @param {string|object} product - Product ID string or product object
   * @returns {Array} - Array of reviews for this exact product only
   */
  getProductReviews(product) {
    try {
      let productId = null;
      let productHandle = null;

      // Extract product ID and handle
      if (typeof product === 'string') {
        // If string, assume it's product ID
        productId = this.normalizeProductId(product);
      } else if (typeof product === 'object' && product !== null) {
        // If object, extract both ID and handle
        productId = this.normalizeProductId(product.id);
        productHandle = product.handle;
      }

      console.log('[ReviewService] EXACT MATCH lookup:', { productId, productHandle });

      // Try to get reviews by product ID first (most accurate)
      if (productId && this.reviewsData.byProductId && this.reviewsData.byProductId[productId]) {
        const reviews = this.reviewsData.byProductId[productId];
        console.log(`[ReviewService] ✅ MATCH by ID: ${reviews.length} reviews`);
        return reviews;
      }

      // Fallback: Try by product handle
      if (productHandle && this.reviewsData.byHandle && this.reviewsData.byHandle[productHandle]) {
        const reviews = this.reviewsData.byHandle[productHandle];
        console.log(`[ReviewService] ✅ MATCH by handle: ${reviews.length} reviews`);
        return reviews;
      }

      // No reviews found for this product - return EMPTY array (no random!)
      console.log('[ReviewService] ❌ NO MATCH - This product has no reviews');
      return [];

    } catch (error) {
      console.error('[ReviewService] getProductReviews error:', error);
      return [];
    }
  }

  /**
   * Get review statistics for a specific product
   * @param {string|object} product - Product ID or product object
   * @returns {Object} - Review statistics
   */
  getReviewStats(product) {
    try {
      const reviews = this.getProductReviews(product);

      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
      }

      // Calculate stats
      const totalReviews = reviews.length;
      const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = sumRating / totalReviews;

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      };

    } catch (error) {
      console.error('[ReviewService] getReviewStats error:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
  }

  /**
   * Get all reviews sorted by date (for general display)
   * @param {number} limit - Max reviews to return
   * @returns {Array} - All reviews
   */
  getAllReviews(limit = 50) {
    try {
      if (!this.reviewsData.byProductId) return [];

      const allReviews = Object.values(this.reviewsData.byProductId).flat();

      // Sort by date (newest first) - parse Vietnamese date format
      const sorted = allReviews.sort((a, b) => {
        const parseDate = (dateStr) => {
          if (!dateStr) return new Date(0);
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
          }
          return new Date(dateStr);
        };
        return parseDate(b.date) - parseDate(a.date);
      });

      return sorted.slice(0, limit);

    } catch (error) {
      console.error('[ReviewService] getAllReviews error:', error);
      return [];
    }
  }

  /**
   * Get featured reviews (reviews with images)
   * @param {number} limit - Number of reviews to return
   * @returns {Array} - Featured reviews with images
   */
  getFeaturedReviews(limit = 6) {
    try {
      if (!this.reviewsData.byProductId) return [];

      const allReviews = Object.values(this.reviewsData.byProductId).flat();
      const withImages = allReviews.filter(r => r.images && r.images.length > 0);

      // Shuffle for variety
      const shuffled = [...withImages].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);

    } catch (error) {
      console.error('[ReviewService] getFeaturedReviews error:', error);
      return [];
    }
  }

  /**
   * Get global stats
   * @returns {Object} - Global review statistics
   */
  getGlobalStats() {
    return this.reviewsData.stats || {
      totalReviews: 0,
      totalProductsById: 0,
      totalProductsByHandle: 0,
      averageRating: 0,
    };
  }

  /**
   * Get total review count
   * @returns {number}
   */
  getTotalReviewCount() {
    return this.reviewsData.stats?.totalReviews || 0;
  }

  /**
   * Get products with reviews count
   * @returns {number}
   */
  getProductsWithReviewsCount() {
    return this.reviewsData.stats?.totalProductsById || 0;
  }

  /**
   * Check if a product has reviews
   * @param {string|object} product - Product ID or product object
   * @returns {boolean}
   */
  hasReviews(product) {
    const reviews = this.getProductReviews(product);
    return reviews.length > 0;
  }

  // ==========================================
  // IN-APP REVIEWS (Supabase - Verified Purchasers)
  // ==========================================

  /**
   * Check if user has purchased a product
   * @param {string} userId - User ID
   * @param {string} productHandle - Product handle
   * @returns {Promise<boolean>}
   */
  async checkUserPurchasedProduct(userId, productHandle) {
    try {
      if (!userId || !productHandle) return false;

      // Get user profile with email and linked_emails
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, linked_emails')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.log('[ReviewService] Profile not found for purchase check');
        return false;
      }

      // Build list of all emails to search
      const emails = [profile.email, ...(profile.linked_emails || [])].filter(Boolean);

      if (emails.length === 0) return false;

      // Query shopify_orders for any order containing this product
      const { data: orders, error: ordersError } = await supabase
        .from('shopify_orders')
        .select('id, line_items')
        .in('email', emails);

      if (ordersError || !orders) {
        console.log('[ReviewService] No orders found for user');
        return false;
      }

      // Check if any order contains this product
      const normalizedHandle = productHandle.toLowerCase();
      const hasPurchased = orders.some(order => {
        if (!order.line_items) return false;
        const items = Array.isArray(order.line_items) ? order.line_items : [];
        return items.some(item => {
          // Match by handle or title containing the product name
          const itemHandle = (item.product_handle || '').toLowerCase();
          const itemTitle = (item.title || '').toLowerCase();
          return itemHandle === normalizedHandle || itemHandle.includes(normalizedHandle);
        });
      });

      console.log(`[ReviewService] User ${hasPurchased ? 'HAS' : 'has NOT'} purchased ${productHandle}`);
      return hasPurchased;
    } catch (error) {
      console.error('[ReviewService] checkUserPurchasedProduct error:', error);
      return false;
    }
  }

  /**
   * Get in-app reviews from Supabase for a product
   * @param {string} productHandle - Product handle
   * @returns {Promise<Array>}
   */
  async getInAppReviews(productHandle) {
    try {
      if (!productHandle) return [];

      // Fetch reviews without join (no FK relationship to profiles)
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('id, user_id, product_handle, rating, title, body, images, verified_purchase, created_at')
        .eq('product_handle', productHandle)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ReviewService] getInAppReviews error:', error);
        return [];
      }

      if (!reviews || reviews.length === 0) {
        return [];
      }

      // Fetch author profiles separately
      const userIds = [...new Set(reviews.map(r => r.user_id).filter(Boolean))];
      let profilesMap = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      // Transform to review format
      return reviews.map(review => {
        const author = profilesMap[review.user_id];
        return {
          id: `inapp_${review.id}`,
          author: author?.full_name || 'Người dùng Gemral',
          avatarUrl: author?.avatar_url,
          rating: review.rating,
          title: review.title,
          body: review.body,
          comment: review.body,
          images: review.images || [],
          date: this.formatDate(review.created_at),
          verified: review.verified_purchase,
          source: 'gemral',
        };
      });
    } catch (error) {
      console.error('[ReviewService] getInAppReviews error:', error);
      return [];
    }
  }

  /**
   * Submit a new product review (verified purchasers only)
   * @param {Object} reviewData - { userId, productHandle, rating, title, body, images }
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async submitReview(reviewData) {
    try {
      const { userId, productHandle, rating, title, body, images } = reviewData;

      if (!userId || !productHandle) {
        return { success: false, error: 'Thiếu thông tin cần thiết' };
      }

      if (!rating || rating < 1 || rating > 5) {
        return { success: false, error: 'Vui lòng chọn số sao đánh giá (1-5)' };
      }

      if (!body || body.trim().length < 10) {
        return { success: false, error: 'Nội dung đánh giá phải có ít nhất 10 ký tự' };
      }

      // Verify purchase
      const hasPurchased = await this.checkUserPurchasedProduct(userId, productHandle);
      if (!hasPurchased) {
        return { success: false, error: 'Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá' };
      }

      // Check if user already reviewed this product
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('product_handle', productHandle)
        .single();

      if (existingReview) {
        return { success: false, error: 'Bạn đã đánh giá sản phẩm này rồi' };
      }

      // Insert review
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: userId,
          product_handle: productHandle,
          rating,
          title: title?.trim() || null,
          body: body.trim(),
          images: images || [],
          verified_purchase: true,
          status: 'approved', // Auto-approve verified purchase reviews
        })
        .select()
        .single();

      if (error) {
        console.error('[ReviewService] submitReview error:', error);
        return { success: false, error: 'Không thể gửi đánh giá. Vui lòng thử lại.' };
      }

      console.log('[ReviewService] ✅ Review submitted:', data?.id);
      return { success: true, review: data };
    } catch (error) {
      console.error('[ReviewService] submitReview error:', error);
      return { success: false, error: 'Đã xảy ra lỗi khi gửi đánh giá' };
    }
  }

  /**
   * Get combined reviews (Shopify + In-app)
   * @param {Object} product - Product object
   * @returns {Promise<Array>}
   */
  async getCombinedReviews(product) {
    try {
      const productHandle = product?.handle;

      // Get Shopify/Judge.me reviews
      const shopifyReviews = this.getProductReviews(product);

      // Get in-app reviews
      const inAppReviews = productHandle ? await this.getInAppReviews(productHandle) : [];

      // Combine and sort by date (newest first)
      const combined = [...inAppReviews, ...shopifyReviews];
      return combined;
    } catch (error) {
      console.error('[ReviewService] getCombinedReviews error:', error);
      return this.getProductReviews(product);
    }
  }

  /**
   * Format date to Vietnamese format
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  }
}

// Export singleton instance
export const reviewService = new ReviewService();
export default reviewService;
