/**
 * GEM Mobile - GIPHY/Tenor Service
 * Provides GIF search and trending functionality
 *
 * Uses GIPHY API - Free tier: 42 requests/hour, 1000 requests/day
 * Alternative: Tenor API for higher limits
 */

// GIPHY API Configuration
// Get your API key at: https://developers.giphy.com/
const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65'; // Demo key - replace in production
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';

// Tenor API Configuration (alternative)
// Get your API key at: https://developers.google.com/tenor
const TENOR_API_KEY = ''; // Optional: Add Tenor key for fallback
const TENOR_BASE_URL = 'https://tenor.googleapis.com/v2';

class GiphyService {
  constructor() {
    this.trendingCache = null;
    this.trendingCacheTime = null;
    this.categoriesCache = null;
    this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  }

  // =====================================================
  // GIPHY API
  // =====================================================

  /**
   * Search GIFs from GIPHY
   * @param {string} query - Search query
   * @param {number} limit - Max results (default 25, max 50)
   * @param {number} offset - Pagination offset
   * @returns {Promise<Array>} GIF results
   */
  async search(query, limit = 25, offset = 0) {
    try {
      if (!query || query.length < 2) return [];

      const url = `${GIPHY_BASE_URL}/search?` +
        `api_key=${GIPHY_API_KEY}&` +
        `q=${encodeURIComponent(query)}&` +
        `limit=${Math.min(limit, 50)}&` +
        `offset=${offset}&` +
        `rating=pg-13&` +
        `lang=vi`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`GIPHY API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatGiphyResults(data.data || []);
    } catch (error) {
      console.error('[GiphyService] search error:', error);

      // Fallback to Tenor if available
      if (TENOR_API_KEY) {
        return this.searchTenor(query, limit);
      }

      return [];
    }
  }

  /**
   * Get trending GIFs
   * @param {number} limit - Max results
   * @param {boolean} forceRefresh - Skip cache
   * @returns {Promise<Array>} Trending GIFs
   */
  async getTrending(limit = 25, forceRefresh = false) {
    try {
      // Check cache
      if (!forceRefresh && this.trendingCache && this.trendingCacheTime) {
        const elapsed = Date.now() - this.trendingCacheTime;
        if (elapsed < this.CACHE_DURATION) {
          return this.trendingCache.slice(0, limit);
        }
      }

      const url = `${GIPHY_BASE_URL}/trending?` +
        `api_key=${GIPHY_API_KEY}&` +
        `limit=${Math.min(limit, 50)}&` +
        `rating=pg-13`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`GIPHY API error: ${response.status}`);
      }

      const data = await response.json();
      const results = this.formatGiphyResults(data.data || []);

      // Update cache
      this.trendingCache = results;
      this.trendingCacheTime = Date.now();

      return results;
    } catch (error) {
      console.error('[GiphyService] getTrending error:', error);

      // Return cached data if available
      if (this.trendingCache) {
        return this.trendingCache.slice(0, limit);
      }

      return [];
    }
  }

  /**
   * Get GIF categories/channels
   * @returns {Promise<Array>} Categories
   */
  async getCategories() {
    try {
      // Check cache
      if (this.categoriesCache) {
        return this.categoriesCache;
      }

      const url = `https://api.giphy.com/v1/gifs/categories?api_key=${GIPHY_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`GIPHY API error: ${response.status}`);
      }

      const data = await response.json();

      const categories = (data.data || []).map(cat => ({
        name: cat.name,
        nameEncoded: cat.name_encoded,
        gif: cat.gif?.images?.fixed_height_small?.url || null,
        subcategories: cat.subcategories?.map(sub => ({
          name: sub.name,
          nameEncoded: sub.name_encoded,
        })) || [],
      }));

      // Update cache
      this.categoriesCache = categories;

      return categories;
    } catch (error) {
      console.error('[GiphyService] getCategories error:', error);
      return [];
    }
  }

  /**
   * Get GIF by ID
   * @param {string} giphyId - GIPHY ID
   * @returns {Promise<Object|null>}
   */
  async getById(giphyId) {
    try {
      if (!giphyId) return null;

      const url = `${GIPHY_BASE_URL}/${giphyId}?api_key=${GIPHY_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`GIPHY API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.data) {
        const results = this.formatGiphyResults([data.data]);
        return results[0] || null;
      }

      return null;
    } catch (error) {
      console.error('[GiphyService] getById error:', error);
      return null;
    }
  }

  /**
   * Format GIPHY API results for app usage
   * @private
   * @param {Array} results - Raw GIPHY results
   * @returns {Array} Formatted results
   */
  formatGiphyResults(results) {
    if (!results || !Array.isArray(results)) return [];

    return results.map(gif => {
      const images = gif.images || {};

      return {
        id: gif.id,
        title: gif.title || '',
        slug: gif.slug || '',

        // Preview (for grid display - small, optimized)
        preview: {
          url: images.fixed_height_small?.url || images.preview_gif?.url || '',
          width: parseInt(images.fixed_height_small?.width || 100, 10),
          height: parseInt(images.fixed_height_small?.height || 100, 10),
          size: parseInt(images.fixed_height_small?.size || 0, 10),
        },

        // Full size (for sending)
        full: {
          url: images.original?.url || '',
          width: parseInt(images.original?.width || 480, 10),
          height: parseInt(images.original?.height || 480, 10),
          mp4: images.original?.mp4 || null, // Video version for better performance
          size: parseInt(images.original?.size || 0, 10),
        },

        // Chat display (medium, optimized for messages)
        chat: {
          url: images.fixed_height?.url || images.original?.url || '',
          width: parseInt(images.fixed_height?.width || 200, 10),
          height: parseInt(images.fixed_height?.height || 200, 10),
          webp: images.fixed_height?.webp || null, // WebP for smaller size
        },

        // Static preview (for low bandwidth / initial load)
        still: {
          url: images.fixed_height_still?.url || images.original_still?.url || '',
          width: parseInt(images.fixed_height_still?.width || 200, 10),
          height: parseInt(images.fixed_height_still?.height || 200, 10),
        },

        // Downsized (for memory efficiency)
        downsized: {
          url: images.downsized?.url || images.fixed_height?.url || '',
          width: parseInt(images.downsized?.width || 200, 10),
          height: parseInt(images.downsized?.height || 200, 10),
          size: parseInt(images.downsized?.size || 0, 10),
        },

        // Metadata
        source: 'giphy',
        rating: gif.rating || 'pg',
        importDate: gif.import_datetime || null,
        trendingDate: gif.trending_datetime || null,
      };
    });
  }

  // =====================================================
  // TENOR API (Alternative/Fallback)
  // =====================================================

  /**
   * Search GIFs from Tenor
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} GIF results
   */
  async searchTenor(query, limit = 25) {
    try {
      if (!TENOR_API_KEY || !query) return [];

      const url = `${TENOR_BASE_URL}/search?` +
        `key=${TENOR_API_KEY}&` +
        `q=${encodeURIComponent(query)}&` +
        `limit=${limit}&` +
        `contentfilter=medium&` +
        `media_filter=gif,tinygif,nanogif`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Tenor API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatTenorResults(data.results || []);
    } catch (error) {
      console.error('[GiphyService] searchTenor error:', error);
      return [];
    }
  }

  /**
   * Get trending GIFs from Tenor
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async getTrendingTenor(limit = 25) {
    try {
      if (!TENOR_API_KEY) return [];

      const url = `${TENOR_BASE_URL}/featured?` +
        `key=${TENOR_API_KEY}&` +
        `limit=${limit}&` +
        `contentfilter=medium&` +
        `media_filter=gif,tinygif`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Tenor API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatTenorResults(data.results || []);
    } catch (error) {
      console.error('[GiphyService] getTrendingTenor error:', error);
      return [];
    }
  }

  /**
   * Format Tenor API results
   * @private
   * @param {Array} results - Raw Tenor results
   * @returns {Array} Formatted results
   */
  formatTenorResults(results) {
    if (!results || !Array.isArray(results)) return [];

    return results.map(gif => {
      const media = gif.media_formats || {};

      return {
        id: gif.id,
        title: gif.content_description || '',

        preview: {
          url: media.tinygif?.url || media.nanogif?.url || '',
          width: media.tinygif?.dims?.[0] || 100,
          height: media.tinygif?.dims?.[1] || 100,
        },

        full: {
          url: media.gif?.url || '',
          width: media.gif?.dims?.[0] || 480,
          height: media.gif?.dims?.[1] || 480,
          mp4: media.mp4?.url || null,
        },

        chat: {
          url: media.gif?.url || media.tinygif?.url || '',
          width: media.gif?.dims?.[0] || 200,
          height: media.gif?.dims?.[1] || 200,
        },

        still: {
          url: '', // Tenor doesn't provide still images by default
          width: 200,
          height: 200,
        },

        downsized: {
          url: media.tinygif?.url || '',
          width: media.tinygif?.dims?.[0] || 200,
          height: media.tinygif?.dims?.[1] || 200,
        },

        source: 'tenor',
        rating: 'pg', // Tenor uses contentfilter instead of rating
      };
    });
  }

  // =====================================================
  // UTILITY
  // =====================================================

  /**
   * Get optimal GIF URL based on context
   * @param {Object} gif - Formatted GIF object
   * @param {string} context - 'grid' | 'chat' | 'full'
   * @returns {string} URL
   */
  getOptimalUrl(gif, context = 'chat') {
    if (!gif) return '';

    switch (context) {
      case 'grid':
        return gif.preview?.url || gif.still?.url || '';
      case 'chat':
        return gif.chat?.url || gif.downsized?.url || gif.full?.url || '';
      case 'full':
        return gif.full?.url || gif.chat?.url || '';
      default:
        return gif.chat?.url || gif.preview?.url || '';
    }
  }

  /**
   * Calculate aspect ratio
   * @param {Object} gif - Formatted GIF object
   * @returns {number} Aspect ratio (width/height)
   */
  getAspectRatio(gif) {
    if (!gif?.chat?.width || !gif?.chat?.height) return 1;
    return gif.chat.width / gif.chat.height;
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.trendingCache = null;
    this.trendingCacheTime = null;
    this.categoriesCache = null;
  }
}

export default new GiphyService();
