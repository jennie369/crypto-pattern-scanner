/**
 * Gemral - Response Detector (Smart Router)
 *
 * STRATEGY:
 * 1. Check LocalDataFilter first (~5ms)
 * 2. If confidence >= 0.85 → Return local answer
 * 3. If confidence < 0.85 → Call Gemini API
 *
 * PRODUCT SEARCH:
 * - Uses searchTags from LocalDataFilter to query Shopify
 * - Returns max 3 real products per response
 * - Falls back to tag search if no direct match
 *
 * EXPECTED DISTRIBUTION:
 * - 90% queries → Local (fast, free)
 * - 10% queries → Gemini API (complex questions)
 *
 * METRICS TRACKING:
 * - localHits / geminiHits
 * - avgResponseTime
 * - tokensUsed
 */

import LocalDataFilter from './localDataFilter';
import geminiService from './geminiService';
import { shopifyService } from './shopifyService';

// Analytics storage
const analytics = {
  localHits: 0,
  geminiHits: 0,
  totalQueries: 0,
  totalTokens: 0,
  avgLocalTime: 0,
  avgGeminiTime: 0,
};

class ResponseDetector {
  constructor() {
    this.confidenceThreshold = 0.85;
    this.conversationHistory = [];
    this.maxHistoryLength = 20;
    this.maxProductsPerResponse = 3; // Limit products to avoid overwhelming
  }

  /**
   * Get response - Main entry point
   * @param {string} message - User message
   * @returns {Promise<Object>} - Response object
   */
  async getResponse(message) {
    const startTime = Date.now();
    analytics.totalQueries++;

    console.log(`\n🔍 [ResponseDetector] Processing: "${message.substring(0, 50)}..."`);

    // Step 1: Try local filter first
    const localResult = LocalDataFilter.detectIntent(message);

    if (localResult) {
      // Local match found with high confidence
      const duration = Date.now() - startTime;
      analytics.localHits++;
      this.updateAvgTime('local', duration);

      console.log(`⚡ [ResponseDetector] LOCAL HIT (${duration}ms)`);
      this.logStats();

      // Add to conversation history
      this.addToHistory('user', message);
      this.addToHistory('assistant', localResult.answer);

      // Fetch real products from Shopify using searchTags
      let recommendedProducts = [];
      if (localResult.searchTags && localResult.searchTags.length > 0) {
        try {
          recommendedProducts = await this.fetchProductsByTags(localResult.searchTags);
          console.log(`🛍️ [ResponseDetector] Found ${recommendedProducts.length} products for tags:`, localResult.searchTags);
        } catch (err) {
          console.warn('[ResponseDetector] Product fetch error:', err);
        }
      }

      return {
        text: localResult.answer,
        source: 'local',
        confidence: localResult.confidence,
        topic: localResult.topic,
        matchedKeywords: localResult.matchedKeywords,
        recommendedProducts: recommendedProducts,
        quickActions: localResult.quickActions,
        duration,
      };
    }

    // Step 2: No local match → Call Gemini API
    console.log(`🌐 [ResponseDetector] Calling Gemini API...`);

    const geminiResult = await geminiService.generateResponse(
      message,
      this.conversationHistory
    );

    const duration = Date.now() - startTime;
    analytics.geminiHits++;
    analytics.totalTokens += geminiResult.tokensUsed || 0;
    this.updateAvgTime('gemini', duration);

    console.log(`🤖 [ResponseDetector] GEMINI RESPONSE (${duration}ms)`);
    this.logStats();

    // Add to conversation history
    this.addToHistory('user', message);
    this.addToHistory('assistant', geminiResult.text);

    // Extract tags from Gemini response and fetch real products
    const extractedTags = this.extractProductTags(geminiResult.text);
    let recommendedProducts = [];
    if (extractedTags.length > 0) {
      try {
        recommendedProducts = await this.fetchProductsByTags(extractedTags);
      } catch (err) {
        console.warn('[ResponseDetector] Gemini product fetch error:', err);
      }
    }

    return {
      ...geminiResult,
      duration,
      recommendedProducts: recommendedProducts,
      quickActions: this.suggestQuickActions(message),
    };
  }

  /**
   * Extract product tags from Gemini response text
   * @param {string} text
   * @returns {Array<string>}
   */
  extractProductTags(text) {
    const tags = [];
    const lowerText = text.toLowerCase();

    // Crystal types
    if (lowerText.includes('thạch anh tím') || lowerText.includes('amethyst')) {
      tags.push('amethyst', 'thạch anh tím');
    }
    if (lowerText.includes('thạch anh hồng') || lowerText.includes('rose quartz')) {
      tags.push('rose quartz', 'thạch anh hồng');
    }
    if (lowerText.includes('thạch anh vàng') || lowerText.includes('citrine')) {
      tags.push('citrine', 'thạch anh vàng');
    }
    if (lowerText.includes('crystal') || lowerText.includes('thạch anh')) {
      tags.push('crystal', 'thạch anh');
    }

    // Bundles & Tiers
    if (lowerText.includes('tier') || lowerText.includes('bundle')) {
      tags.push('tier', 'bundle');
    }

    // Courses
    if (lowerText.includes('khóa học') || lowerText.includes('course')) {
      tags.push('course', 'khóa học');
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Add message to conversation history
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addToHistory(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // Keep history size manageable
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('🧹 [ResponseDetector] History cleared');
  }

  /**
   * Get conversation history
   * @returns {Array}
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Update average response time
   * @param {string} type - 'local' or 'gemini'
   * @param {number} duration - Response time in ms
   */
  updateAvgTime(type, duration) {
    if (type === 'local') {
      const count = analytics.localHits;
      analytics.avgLocalTime =
        (analytics.avgLocalTime * (count - 1) + duration) / count;
    } else {
      const count = analytics.geminiHits;
      analytics.avgGeminiTime =
        (analytics.avgGeminiTime * (count - 1) + duration) / count;
    }
  }

  /**
   * Fetch products from Shopify by tags
   * Uses shopifyService.getProductsByTags() or searchProducts()
   * @param {Array<string>} tags - Search tags from gemKnowledge
   * @returns {Promise<Array>} - Array of products (max 3)
   */
  async fetchProductsByTags(tags) {
    if (!tags || tags.length === 0) {
      return [];
    }

    try {
      console.log('[ResponseDetector] 🔍 Searching products with tags:', tags);

      // Method 1: Try tag-based filtering first (faster, uses cache)
      let products = await shopifyService.getProductsByTags(
        tags,
        this.maxProductsPerResponse, // Limit to 3
        false // Don't fallback to random - we want relevant products
      );

      // Method 2: If no tag matches, try search API
      if (!products || products.length === 0) {
        console.log('[ResponseDetector] No tag matches, trying search...');
        // Search with first tag (most relevant)
        const searchResults = await shopifyService.searchProducts(tags[0]);
        if (searchResults && searchResults.length > 0) {
          products = searchResults.slice(0, this.maxProductsPerResponse);
        }
      }

      // Format products for ProductCard component
      const formattedProducts = products.map(product => ({
        id: product.id,
        type: this.detectProductType(product),
        name: product.title,
        title: product.title,
        description: product.description?.substring(0, 100) || '',
        price: this.formatPrice(product.variants?.[0]?.price),
        priceDisplay: this.formatPrice(product.variants?.[0]?.price),
        rawPrice: parseFloat(product.variants?.[0]?.price || 0),
        imageUrl: product.images?.[0]?.src || product.image || null,
        handle: product.handle,
        shopifyHandle: product.handle,
        tags: product.tags || [],
        variants: product.variants,
        isLocalFallback: false,
      }));

      console.log(`[ResponseDetector] ✅ Returning ${formattedProducts.length} products`);
      return formattedProducts;

    } catch (error) {
      console.error('[ResponseDetector] ❌ fetchProductsByTags error:', error);
      return [];
    }
  }

  /**
   * Detect product type from Shopify product
   * @param {Object} product
   * @returns {string}
   */
  detectProductType(product) {
    const title = (product.title || '').toLowerCase();
    const tags = (product.tags || []).map(t => t.toLowerCase());

    if (title.includes('tier') || title.includes('bundle') || tags.includes('bundle')) {
      return 'bundle';
    }
    if (title.includes('khóa') || title.includes('course') || tags.includes('course')) {
      return 'course';
    }
    if (title.includes('thạch anh') || title.includes('crystal') || tags.some(t => t.includes('crystal'))) {
      return 'crystal';
    }
    return 'product';
  }

  /**
   * Format price for display
   * @param {number|string} value
   * @returns {string}
   */
  formatPrice(value) {
    if (!value) return 'Liên hệ';
    const num = parseFloat(value);
    if (isNaN(num)) return 'Liên hệ';

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${Math.round(num / 1000)}K`;
    }
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  }

  // NOTE: extractProducts() removed - replaced by extractProductTags() + fetchProductsByTags()

  /**
   * Suggest quick actions based on query
   * @param {string} message
   * @returns {Array}
   */
  suggestQuickActions(message) {
    const lowerMessage = message.toLowerCase();
    const actions = [];

    // Default quick actions based on context
    if (lowerMessage.includes('trade') || lowerMessage.includes('trading')) {
      actions.push('Xem TIER 2', 'Scanner patterns', 'Win rate');
    } else if (
      lowerMessage.includes('manifest') ||
      lowerMessage.includes('giàu')
    ) {
      actions.push('Mua Citrine', 'Khóa học mindset', 'Visualization');
    } else if (
      lowerMessage.includes('crystal') ||
      lowerMessage.includes('đá')
    ) {
      actions.push('Shop crystals', 'Chọn crystal', 'Set Tài Lộc');
    } else {
      // Default actions
      actions.push('Xem TIER bundles', 'Tư vấn crystal', 'Affiliate program');
    }

    return actions.slice(0, 3);
  }

  /**
   * Get analytics data
   * @returns {Object}
   */
  getAnalytics() {
    const total = analytics.totalQueries || 1;
    return {
      ...analytics,
      localPercentage: ((analytics.localHits / total) * 100).toFixed(1),
      geminiPercentage: ((analytics.geminiHits / total) * 100).toFixed(1),
      avgLocalTime: Math.round(analytics.avgLocalTime),
      avgGeminiTime: Math.round(analytics.avgGeminiTime),
    };
  }

  /**
   * Reset analytics
   */
  resetAnalytics() {
    analytics.localHits = 0;
    analytics.geminiHits = 0;
    analytics.totalQueries = 0;
    analytics.totalTokens = 0;
    analytics.avgLocalTime = 0;
    analytics.avgGeminiTime = 0;
    console.log('📊 [ResponseDetector] Analytics reset');
  }

  /**
   * Log current stats
   */
  logStats() {
    const stats = this.getAnalytics();
    console.log(
      `📊 Stats: Local ${stats.localPercentage}% (${stats.avgLocalTime}ms avg) | ` +
        `Gemini ${stats.geminiPercentage}% (${stats.avgGeminiTime}ms avg) | ` +
        `Tokens: ${stats.totalTokens}`
    );
  }

  /**
   * Get response for greeting (special case)
   * @returns {Object}
   */
  getGreetingResponse() {
    const greeting = LocalDataFilter.getTopic('greeting');
    if (greeting) {
      return {
        text: greeting.answer,
        source: 'local',
        confidence: 0.99,
        topic: 'greeting',
        quickActions: greeting.quickActions || [],
        recommendedProducts: [],
        duration: 0,
      };
    }
    return null;
  }

  /**
   * Check if message is a greeting
   * @param {string} message
   * @returns {boolean}
   */
  isGreeting(message) {
    const greetings = ['hi', 'hello', 'xin chào', 'chào', 'hey', 'good morning', 'good evening'];
    const lower = message.toLowerCase().trim();
    return greetings.some((g) => lower === g || lower.startsWith(g + ' '));
  }
}

// Export singleton instance
export default new ResponseDetector();
