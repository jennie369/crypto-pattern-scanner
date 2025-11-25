/**
 * GEM Platform - Review Service
 * Handles fetching real Judge.me reviews with EXACT product matching
 * NO random reviews - only show reviews for the specific product
 */

import reviewsData from '../data/reviews.json';

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
}

// Export singleton instance
export const reviewService = new ReviewService();
export default reviewService;
