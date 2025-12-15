/**
 * Gemral - Local Data Filter
 *
 * STRATEGY:
 * - Match keywords từ user message
 * - Calculate confidence score
 * - Return local answer if confidence >= 0.85
 * - Return null → call Gemini API
 *
 * Performance: ~5ms response time (vs 2-5s for Gemini API)
 * Cost: $0 (vs token cost for API calls)
 *
 * PRODUCT SEARCH:
 * - Uses searchTags to query Shopify API
 * - Returns real products with images
 * - Limit 3 products per response
 *
 * SMART ANSWER SELECTION:
 * - No-repeat: Không trùng câu vừa dùng
 * - Context-aware: Chọn theo context conversation
 * - Time-based: Sáng/chiều/tối trả lời khác nhau
 */

import gemKnowledge from '../data/gemKnowledge.json';

// Track last used answers per topic (no-repeat logic)
const lastUsedAnswers = {};

// Conversation context for context-aware selection
let conversationContext = {
  topics: [],        // Recent topics discussed
  sentiment: 'neutral', // 'positive', 'negative', 'neutral'
  userIntent: null,  // 'buying', 'learning', 'support', 'browsing'
};

class LocalDataFilter {
  /**
   * Detect intent from user message
   * @param {string} message - User input
   * @returns {Object|null} - { answer, products, quickActions, confidence } or null
   */
  static detectIntent(message) {
    if (!message || typeof message !== 'string') {
      return null;
    }

    const lowerMessage = message.toLowerCase().trim();

    // Skip very short messages (likely noise)
    if (lowerMessage.length < 2) {
      return null;
    }

    let bestMatch = null;
    let highestConfidence = 0;

    // Check each FAQ topic
    for (const [topicKey, topic] of Object.entries(gemKnowledge.faq)) {
      const matchedKeywords = topic.keywords.filter((keyword) =>
        lowerMessage.includes(keyword.toLowerCase())
      );

      if (matchedKeywords.length === 0) continue;

      // NEW ALGORITHM: Base confidence on number of matches, not ratio
      // 1 match = 0.5, 2 matches = 0.75, 3+ matches = 0.85+
      let baseConfidence;
      if (matchedKeywords.length >= 3) {
        baseConfidence = 0.90;
      } else if (matchedKeywords.length === 2) {
        baseConfidence = 0.85;
      } else {
        baseConfidence = 0.70;
      }

      // Bonus for exact phrase matches
      const exactMatchBonus = topic.keywords.some(
        (kw) => lowerMessage === kw.toLowerCase()
      )
        ? 0.08
        : 0;

      // Bonus for multiple keywords matched
      const multiMatchBonus = matchedKeywords.length > 3 ? 0.02 * (matchedKeywords.length - 3) : 0;

      // Apply topic's base confidence as weight
      const confidence = Math.min(
        baseConfidence * (topic.confidence / 0.95) + exactMatchBonus + multiMatchBonus,
        0.99 // Cap at 0.99
      );

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        // Transform product names to proper product objects
        const productObjects = this.transformProductNames(topic.recommendProducts || []);

        // SMART ANSWER SELECTION: No-repeat + Context-aware + Time-based
        let selectedAnswer;
        if (Array.isArray(topic.answers) && topic.answers.length > 0) {
          selectedAnswer = this.selectSmartAnswer(topicKey, topic.answers, lowerMessage);
        } else {
          // Fallback to single answer
          selectedAnswer = topic.answer || '';
        }

        bestMatch = {
          answer: selectedAnswer,
          // OLD: recommendedProducts: productObjects (hardcoded from JSON)
          // NEW: Use searchTags to fetch real products from Shopify
          searchTags: topic.searchTags || [],
          recommendedProducts: [], // Will be populated by caller using searchTags
          quickActions: topic.quickActions || [],
          confidence: confidence,
          source: 'local',
          topic: topicKey,
          matchedKeywords: matchedKeywords,
        };
      }
    }

    // Return if high confidence (>= 0.85)
    if (bestMatch && bestMatch.confidence >= 0.85) {
      console.log(
        `✅ [LocalFilter] Match found: "${bestMatch.topic}" (confidence: ${bestMatch.confidence.toFixed(2)})`
      );
      return bestMatch;
    }

    // Log for debugging
    if (bestMatch) {
      console.log(
        `⚠️ [LocalFilter] Low confidence match: "${bestMatch.topic}" (${bestMatch.confidence.toFixed(2)})`
      );
    } else {
      console.log(`❌ [LocalFilter] No keyword match found`);
    }

    // No high-confidence match
    return null;
  }

  // ============================================================
  // SMART ANSWER SELECTION SYSTEM
  // ============================================================

  /**
   * Select answer intelligently using multiple strategies
   * Priority: Time-based → Context-aware → No-repeat → Random
   * @param {string} topicKey - Topic identifier
   * @param {Array<string>} answers - Available answers
   * @param {string} userMessage - Original user message
   * @returns {string} - Selected answer
   */
  static selectSmartAnswer(topicKey, answers, userMessage) {
    if (!answers || answers.length === 0) return '';
    if (answers.length === 1) return answers[0];

    // Update conversation context
    this.updateContext(topicKey, userMessage);

    // Strategy 1: Time-based selection (morning/afternoon/evening)
    const timeBasedIndex = this.getTimeBasedIndex(answers.length);

    // Strategy 2: Context-aware selection
    const contextScore = this.scoreAnswersByContext(answers, userMessage);

    // Strategy 3: No-repeat filter
    const availableIndices = this.getNoRepeatIndices(topicKey, answers);

    // Combine strategies
    let selectedIndex;

    // If context strongly suggests an answer, use it
    if (contextScore.maxScore > 0.5 && availableIndices.includes(contextScore.bestIndex)) {
      selectedIndex = contextScore.bestIndex;
      console.log(`🧠 [SmartAnswer] Context-aware selection for "${topicKey}"`);
    }
    // If time-based answer is available (not recently used), prefer it
    else if (availableIndices.includes(timeBasedIndex)) {
      selectedIndex = timeBasedIndex;
      console.log(`🕐 [SmartAnswer] Time-based selection for "${topicKey}" (index: ${timeBasedIndex})`);
    }
    // Otherwise, random from available (no-repeat)
    else if (availableIndices.length > 0) {
      selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      console.log(`🔀 [SmartAnswer] No-repeat random for "${topicKey}"`);
    }
    // Fallback: pure random (all answers used recently)
    else {
      selectedIndex = Math.floor(Math.random() * answers.length);
      console.log(`🎲 [SmartAnswer] Fallback random for "${topicKey}"`);
    }

    // Track this answer as used
    lastUsedAnswers[topicKey] = selectedIndex;

    return answers[selectedIndex];
  }

  /**
   * Get time-based answer index
   * Morning (5-11): index 0
   * Afternoon (11-17): index 1
   * Evening (17-5): index 2
   * @param {number} totalAnswers
   * @returns {number}
   */
  static getTimeBasedIndex(totalAnswers) {
    const hour = new Date().getHours();

    let timeSlot;
    if (hour >= 5 && hour < 11) {
      timeSlot = 0; // Morning
    } else if (hour >= 11 && hour < 17) {
      timeSlot = 1; // Afternoon
    } else {
      timeSlot = 2; // Evening/Night
    }

    // Map to available answers
    return timeSlot % totalAnswers;
  }

  /**
   * Score answers based on conversation context
   * @param {Array<string>} answers
   * @param {string} userMessage
   * @returns {Object} - { bestIndex, maxScore }
   */
  static scoreAnswersByContext(answers, userMessage) {
    const scores = answers.map((answer, index) => {
      let score = 0;
      const lowerAnswer = answer.toLowerCase();
      const lowerMessage = userMessage.toLowerCase();

      // Score based on user intent keywords
      if (lowerMessage.includes('mua') || lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu')) {
        // User wants to buy → prefer answers with pricing info
        if (lowerAnswer.includes('giá') || lowerAnswer.includes('₫') || lowerAnswer.includes('k') || lowerAnswer.includes('m')) {
          score += 0.3;
        }
      }

      if (lowerMessage.includes('học') || lowerMessage.includes('hiểu') || lowerMessage.includes('là gì')) {
        // User wants to learn → prefer educational answers
        if (lowerAnswer.includes('là') || lowerAnswer.includes('giúp') || lowerAnswer.includes('cách')) {
          score += 0.3;
        }
      }

      if (lowerMessage.includes('giúp') || lowerMessage.includes('hỗ trợ') || lowerMessage.includes('vấn đề')) {
        // User needs support → prefer supportive answers
        if (lowerAnswer.includes('giúp') || lowerAnswer.includes('hỗ trợ') || lowerAnswer.includes('liên hệ')) {
          score += 0.3;
        }
      }

      // Score based on sentiment
      if (conversationContext.sentiment === 'negative') {
        // User seems frustrated → prefer empathetic answers
        if (lowerAnswer.includes('đừng lo') || lowerAnswer.includes('giúp bạn') || lowerAnswer.includes('😊')) {
          score += 0.2;
        }
      }

      // Score based on recent topics (cross-selling opportunity)
      if (conversationContext.topics.includes('trading') && lowerAnswer.includes('tier')) {
        score += 0.1;
      }
      if (conversationContext.topics.includes('crystals') && lowerAnswer.includes('thạch anh')) {
        score += 0.1;
      }

      return { index, score };
    });

    // Find best scoring answer
    const best = scores.reduce((max, curr) => curr.score > max.score ? curr : max, { index: 0, score: 0 });

    return { bestIndex: best.index, maxScore: best.score };
  }

  /**
   * Get indices of answers not recently used (no-repeat)
   * @param {string} topicKey
   * @param {Array<string>} answers
   * @returns {Array<number>}
   */
  static getNoRepeatIndices(topicKey, answers) {
    const lastUsedIndex = lastUsedAnswers[topicKey];

    // If no answer used yet, all are available
    if (lastUsedIndex === undefined) {
      return answers.map((_, i) => i);
    }

    // Filter out last used answer
    return answers.map((_, i) => i).filter(i => i !== lastUsedIndex);
  }

  /**
   * Update conversation context based on current interaction
   * @param {string} topicKey
   * @param {string} userMessage
   */
  static updateContext(topicKey, userMessage) {
    // Track recent topics (keep last 5)
    conversationContext.topics.unshift(topicKey);
    if (conversationContext.topics.length > 5) {
      conversationContext.topics = conversationContext.topics.slice(0, 5);
    }

    // Detect sentiment
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('không') || lowerMessage.includes('tệ') || lowerMessage.includes('lỗi') ||
        lowerMessage.includes('sai') || lowerMessage.includes('chán') || lowerMessage.includes('buồn')) {
      conversationContext.sentiment = 'negative';
    } else if (lowerMessage.includes('tuyệt') || lowerMessage.includes('hay') || lowerMessage.includes('tốt') ||
               lowerMessage.includes('cảm ơn') || lowerMessage.includes('thích')) {
      conversationContext.sentiment = 'positive';
    } else {
      conversationContext.sentiment = 'neutral';
    }

    // Detect user intent
    if (lowerMessage.includes('mua') || lowerMessage.includes('đặt') || lowerMessage.includes('order')) {
      conversationContext.userIntent = 'buying';
    } else if (lowerMessage.includes('học') || lowerMessage.includes('hiểu') || lowerMessage.includes('là gì')) {
      conversationContext.userIntent = 'learning';
    } else if (lowerMessage.includes('giúp') || lowerMessage.includes('hỗ trợ') || lowerMessage.includes('lỗi')) {
      conversationContext.userIntent = 'support';
    } else {
      conversationContext.userIntent = 'browsing';
    }

    console.log(`📊 [Context] Topics: [${conversationContext.topics.slice(0, 3).join(', ')}], Sentiment: ${conversationContext.sentiment}, Intent: ${conversationContext.userIntent}`);
  }

  /**
   * Reset conversation context (call when chat is cleared)
   */
  static resetContext() {
    conversationContext = {
      topics: [],
      sentiment: 'neutral',
      userIntent: null,
    };
    // Don't reset lastUsedAnswers - keep no-repeat across sessions
    console.log('🔄 [LocalFilter] Context reset');
  }

  /**
   * Get current context (for debugging)
   */
  static getContext() {
    return { ...conversationContext, lastUsedAnswers: { ...lastUsedAnswers } };
  }

  // ============================================================
  // PRODUCT TRANSFORMATION
  // ============================================================

  /**
   * Transform product names from FAQ to proper product objects
   * Uses gemKnowledge.products for full product data
   * @param {Array<string>} productNames - e.g., ["thạch anh tím", "thạch anh vàng"]
   * @returns {Array<Object>} - Formatted products for ProductCard
   */
  static transformProductNames(productNames) {
    if (!productNames || productNames.length === 0) {
      return [];
    }

    const products = gemKnowledge.products || {};
    const formattedProducts = [];

    for (const name of productNames) {
      // Try exact match first
      let product = products[name];

      // Try case-insensitive match
      if (!product) {
        const lowerName = name.toLowerCase();
        for (const [key, value] of Object.entries(products)) {
          if (key.toLowerCase() === lowerName) {
            product = value;
            break;
          }
        }
      }

      if (product) {
        // Parse price from string (e.g., "350.000đ - 2.500.000đ")
        const priceMatch = product.price?.match(/[\d.,]+/);
        const rawPrice = priceMatch
          ? parseFloat(priceMatch[0].replace(/\./g, '').replace(',', '.')) * 1000
          : 350000;

        formattedProducts.push({
          id: `local_${name.replace(/\s+/g, '_')}`,
          type: name.includes('set') ? 'bundle' : 'crystal',
          name: product.name,
          description: product.description?.substring(0, 80) || '',
          price: product.price || this.formatPrice(rawPrice),
          priceDisplay: product.price,
          imageUrl: null, // Will be fetched by ProductCard from Shopify
          shopifyHandle: product.shopifyHandle,
          handle: product.shopifyHandle,
          rawPrice: rawPrice,
          tags: product.tags || [],
          benefits: product.benefits || [],
          isLocalFallback: false, // Allow ProductCard to try Shopify fetch
        });
      }
    }

    console.log(
      `[LocalFilter] Transformed ${formattedProducts.length} products:`,
      formattedProducts.map((p) => p.name)
    );

    return formattedProducts;
  }

  /**
   * Format price for display
   * @param {number} value
   * @returns {string}
   */
  static formatPrice(value) {
    if (!value) return 'Liên hệ';
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`;
    }
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  }

  /**
   * Format answer for display (handle newlines properly)
   * @param {string} answer
   * @returns {string}
   */
  static formatAnswer(answer) {
    if (!answer) return '';
    // Answer in JSON already has proper newlines
    return answer;
  }

  /**
   * Get all available topics
   * @returns {Array<string>}
   */
  static getTopics() {
    return Object.keys(gemKnowledge.faq);
  }

  /**
   * Get chatbot config
   * @returns {Object}
   */
  static getConfig() {
    return gemKnowledge.config;
  }

  /**
   * Get specific topic data
   * @param {string} topicKey
   * @returns {Object|null}
   */
  static getTopic(topicKey) {
    return gemKnowledge.faq[topicKey] || null;
  }

  /**
   * Search topics by partial keyword
   * @param {string} partial
   * @returns {Array<Object>}
   */
  static searchTopics(partial) {
    const lowerPartial = partial.toLowerCase();
    const results = [];

    for (const [topicKey, topic] of Object.entries(gemKnowledge.faq)) {
      const hasMatch = topic.keywords.some((kw) =>
        kw.toLowerCase().includes(lowerPartial)
      );
      if (hasMatch) {
        results.push({
          topic: topicKey,
          keywords: topic.keywords,
          confidence: topic.confidence,
        });
      }
    }

    return results;
  }
}

export default LocalDataFilter;
