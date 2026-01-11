/**
 * AI Brain Service - Main Integration Layer
 *
 * Orchestrates all AI components for Livestream Commerce:
 * - Intent Classification (25 categories)
 * - Emotion Detection (8 emotions)
 * - 3-Tier Response Generation
 * - Knowledge Base Search
 * - Priority Queue Management
 * - TTS & Avatar Integration
 *
 * Performance Targets:
 * - Tier 1: < 50ms (templates)
 * - Tier 2: < 500ms (quick LLM)
 * - Tier 3: < 2000ms (full LLM)
 */

import { classifyIntent, getResponseTier } from './intentClassifierService';
import { detectEmotion, combineEmotionIntent, getAvatarExpression, getTTSParams } from './emotionDetectorService';
import { generateResponse, AI_PERSONAS } from './responseGeneratorService';
import { searchKnowledge, extractBirthYear, extractMenh, extractZodiac } from './knowledgeBaseService';
import priorityQueue from './priorityQueueService';

// ===========================================
// AI BRAIN CONFIG
// ===========================================

const AI_BRAIN_CONFIG = {
  // Default persona
  defaultPersona: 'banthan',

  // Response timeouts
  timeouts: {
    tier1: 50,
    tier2: 500,
    tier3: 2000,
  },

  // Auto-switch to faster tier if approaching timeout
  tierFallbackEnabled: true,

  // Minimum confidence for auto-response
  minConfidence: 0.3,

  // Enable logging
  debug: __DEV__,
};

// ===========================================
// MAIN BRAIN CLASS
// ===========================================

class AIBrain {
  constructor(config = {}) {
    this.config = { ...AI_BRAIN_CONFIG, ...config };
    this.sessions = new Map(); // Session state
    this.stats = {
      totalRequests: 0,
      tier1Responses: 0,
      tier2Responses: 0,
      tier3Responses: 0,
      errors: 0,
      avgLatency: 0,
    };
  }

  /**
   * Process incoming comment and generate response
   * Main entry point for AI Brain
   *
   * @param {Object} params
   * @returns {Promise<Object>} Response with all needed data
   */
  async processComment({
    sessionId,
    message,
    userId,
    userName,
    userAvatar,
    userTier = 'free',
    platform = 'gemral',
    giftValue = 0,
    userContext = {},
    forceTier = null,
  }) {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      // Step 1: Classify intent
      const intentResult = classifyIntent(message);

      // Step 2: Detect emotion
      const emotionResult = detectEmotion(message);

      // Step 3: Combine analysis
      const analysis = combineEmotionIntent(emotionResult, intentResult);

      // Step 4: Extract context from message
      const extractedContext = this._extractContext(message);
      const context = { ...userContext, ...extractedContext };

      // Step 5: Search knowledge base if needed
      let knowledgeResults = null;
      if (this._needsKnowledgeSearch(intentResult.intent.id)) {
        knowledgeResults = await searchKnowledge({
          query: message,
          birthYear: context.birthYear,
          menhId: context.menhId,
          zodiacId: context.zodiacId,
          crystalId: context.crystalId,
        });
      }

      // Step 6: Determine response tier
      const tier = forceTier || this._selectTier(intentResult, emotionResult, message);

      // Step 7: Get session state
      const session = this._getSession(sessionId);
      const persona = session.persona || this.config.defaultPersona;

      // Step 8: Generate response
      const response = await generateResponse({
        message,
        intentId: intentResult.intent.id,
        emotionId: emotionResult.emotion.id,
        tier,
        persona,
        context: {
          ...context,
          userName,
          userId,
          userTier,
          platform,
          giftValue,
          knowledge: knowledgeResults,
          history: session.history.slice(-5),
        },
      });

      // Step 9: Get avatar and TTS settings
      const avatarExpression = getAvatarExpression(emotionResult.emotion.id);
      const ttsParams = getTTSParams(emotionResult.emotion.id);

      // Step 10: Update session history
      this._updateSession(sessionId, {
        role: 'user',
        content: message,
        intent: intentResult.intent.id,
        emotion: emotionResult.emotion.id,
      });

      this._updateSession(sessionId, {
        role: 'assistant',
        content: response.text,
        tier: response.tier,
      });

      // Step 11: Calculate latency and update stats
      const latency = Date.now() - startTime;
      this._updateStats(response.tier, latency);

      // Step 12: Build final response object
      const result = {
        // Response text
        text: response.text,
        followUp: response.followUp,

        // Analysis
        intent: {
          id: intentResult.intent.id,
          name: intentResult.intent.name,
          confidence: intentResult.confidence,
        },
        emotion: {
          id: emotionResult.emotion.id,
          name: emotionResult.emotion.name,
          confidence: emotionResult.confidence,
        },
        priority: analysis.priority,

        // Response metadata
        tier: response.tier,
        persona: persona,
        latency,

        // Avatar & TTS
        avatarExpression,
        ttsParams: {
          ...ttsParams,
          voice: AI_PERSONAS[persona]?.voice || 'banmai',
        },

        // Knowledge (if fetched)
        knowledge: knowledgeResults ? {
          crystals: knowledgeResults.crystals?.slice(0, 3),
          menh: knowledgeResults.menh,
          zodiac: knowledgeResults.zodiac,
          faq: knowledgeResults.faq,
        } : null,

        // Selling points (for commerce)
        sellingPoints: response.sellingPoints,

        // Error handling
        error: response.error || null,
      };

      if (this.config.debug) {
        console.log('[AIBrain] Response:', {
          intent: result.intent.id,
          emotion: result.emotion.id,
          tier: result.tier,
          latency: result.latency,
        });
      }

      return result;

    } catch (error) {
      this.stats.errors++;
      console.error('[AIBrain] Error processing comment:', error);

      return {
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại nhé!',
        error: error.message,
        tier: 0,
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Process comment through priority queue
   * For livestream with multiple concurrent comments
   */
  async processFromQueue(sessionId) {
    const comment = priorityQueue.getNextComment(sessionId);
    if (!comment) return null;

    return this.processComment({
      sessionId,
      message: comment.message,
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      userTier: comment.userTier,
      platform: comment.platform,
      giftValue: comment.giftValue,
    });
  }

  /**
   * Add comment to priority queue
   */
  addToQueue(sessionId, comment) {
    return priorityQueue.addComment(sessionId, comment);
  }

  /**
   * Get next queued comment without processing
   */
  peekQueue(sessionId) {
    return priorityQueue.peekNextComment(sessionId);
  }

  /**
   * Get queue stats
   */
  getQueueStats(sessionId) {
    return {
      size: priorityQueue.getQueueSize(sessionId),
      top: priorityQueue.getTopComments(sessionId, 3),
    };
  }

  // ===========================================
  // SESSION MANAGEMENT
  // ===========================================

  /**
   * Initialize session
   */
  initSession(sessionId, options = {}) {
    this.sessions.set(sessionId, {
      id: sessionId,
      persona: options.persona || this.config.defaultPersona,
      history: [],
      userProfiles: new Map(),
      startTime: Date.now(),
    });
  }

  /**
   * Get or create session
   */
  _getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.initSession(sessionId);
    }
    return this.sessions.get(sessionId);
  }

  /**
   * Update session with new message
   */
  _updateSession(sessionId, message) {
    const session = this._getSession(sessionId);
    session.history.push({
      ...message,
      timestamp: Date.now(),
    });

    // Keep only last 20 messages
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }
  }

  /**
   * Set session persona
   */
  setPersona(sessionId, persona) {
    const session = this._getSession(sessionId);
    if (AI_PERSONAS[persona]) {
      session.persona = persona;
    }
  }

  /**
   * End session
   */
  endSession(sessionId) {
    priorityQueue.removeQueue(sessionId);
    this.sessions.delete(sessionId);
  }

  // ===========================================
  // HELPER METHODS
  // ===========================================

  /**
   * Extract context from message
   */
  _extractContext(message) {
    return {
      birthYear: extractBirthYear(message),
      menhId: extractMenh(message),
      zodiacId: extractZodiac(message),
    };
  }

  /**
   * Check if intent needs knowledge search
   */
  _needsKnowledgeSearch(intentId) {
    const searchIntents = [
      'ZODIAC_QUERY',
      'ELEMENT_QUERY',
      'CRYSTAL_RECOMMENDATION',
      'PRODUCT_INFO',
      'BUY_INTENT',
      'PRICE_QUERY',
      'HEALTH_QUERY',
      'LOVE_QUERY',
      'WEALTH_QUERY',
      'CRYSTAL_CARE',
      'CRYSTAL_AUTHENTICITY',
    ];
    return searchIntents.includes(intentId);
  }

  /**
   * Select response tier
   */
  _selectTier(intentResult, emotionResult, message) {
    // Use intent's default tier
    let tier = intentResult.tier;

    // Upgrade tier for complex messages
    if (message.length > 100) {
      tier = Math.max(tier, 2);
    }

    // Upgrade for negative emotions
    if (['ANGRY', 'FRUSTRATED', 'SAD'].includes(emotionResult.emotion.id)) {
      tier = Math.max(tier, 2);
    }

    // Cap at tier 3
    return Math.min(tier, 3);
  }

  /**
   * Update stats
   */
  _updateStats(tier, latency) {
    switch (tier) {
      case 1:
        this.stats.tier1Responses++;
        break;
      case 2:
        this.stats.tier2Responses++;
        break;
      case 3:
        this.stats.tier3Responses++;
        break;
    }

    // Rolling average latency
    const totalResponses = this.stats.tier1Responses + this.stats.tier2Responses + this.stats.tier3Responses;
    this.stats.avgLatency = (this.stats.avgLatency * (totalResponses - 1) + latency) / totalResponses;
  }

  /**
   * Get brain stats
   */
  getStats() {
    return {
      ...this.stats,
      activeSessions: this.sessions.size,
      queueStats: priorityQueue.getStats(),
    };
  }

  /**
   * Reset stats
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      tier1Responses: 0,
      tier2Responses: 0,
      tier3Responses: 0,
      errors: 0,
      avgLatency: 0,
    };
  }
}

// ===========================================
// SINGLETON INSTANCE
// ===========================================

const aiBrain = new AIBrain();

// ===========================================
// CONVENIENCE FUNCTIONS
// ===========================================

/**
 * Quick response for simple messages
 * Uses fastest available method
 */
export async function quickResponse(message, persona = 'banthan') {
  const intentResult = classifyIntent(message);
  const emotionResult = detectEmotion(message);

  // Try Tier 1 first
  const tier1 = await generateResponse({
    message,
    intentId: intentResult.intent.id,
    emotionId: emotionResult.emotion.id,
    tier: 1,
    persona,
    context: {},
  });

  if (tier1 && tier1.text) {
    return tier1;
  }

  // Fall back to Tier 2
  return generateResponse({
    message,
    intentId: intentResult.intent.id,
    emotionId: emotionResult.emotion.id,
    tier: 2,
    persona,
    context: {},
  });
}

/**
 * Analyze message without generating response
 */
export function analyzeMessage(message) {
  const intentResult = classifyIntent(message);
  const emotionResult = detectEmotion(message);
  const analysis = combineEmotionIntent(emotionResult, intentResult);

  return {
    intent: intentResult.intent,
    intentConfidence: intentResult.confidence,
    emotion: emotionResult.emotion,
    emotionConfidence: emotionResult.confidence,
    priority: analysis.priority,
    tier: analysis.tier,
    expression: analysis.expression,
    ttsParams: analysis.ttsParams,
  };
}

/**
 * Get recommended crystals for user
 */
export async function getRecommendations({ birthYear, menhId, zodiacId, query }) {
  return searchKnowledge({
    query,
    birthYear,
    menhId,
    zodiacId,
  });
}

// ===========================================
// EXPORT
// ===========================================

export {
  aiBrain,
  AIBrain,
  AI_BRAIN_CONFIG,
};

export default {
  // Main instance
  brain: aiBrain,

  // Process comment
  processComment: (params) => aiBrain.processComment(params),

  // Queue operations
  processFromQueue: (sessionId) => aiBrain.processFromQueue(sessionId),
  addToQueue: (sessionId, comment) => aiBrain.addToQueue(sessionId, comment),
  peekQueue: (sessionId) => aiBrain.peekQueue(sessionId),
  getQueueStats: (sessionId) => aiBrain.getQueueStats(sessionId),

  // Session management
  initSession: (sessionId, options) => aiBrain.initSession(sessionId, options),
  setPersona: (sessionId, persona) => aiBrain.setPersona(sessionId, persona),
  endSession: (sessionId) => aiBrain.endSession(sessionId),

  // Convenience
  quickResponse,
  analyzeMessage,
  getRecommendations,

  // Stats
  getStats: () => aiBrain.getStats(),
  resetStats: () => aiBrain.resetStats(),

  // Config
  AI_PERSONAS,
  AI_BRAIN_CONFIG,
};
