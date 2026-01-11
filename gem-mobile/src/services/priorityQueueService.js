/**
 * Priority Queue Service
 * Manages comment priority for AI Livestream responses
 *
 * Priority Factors:
 * - Intent (buy intent = highest)
 * - Emotion (negative = higher attention)
 * - User tier (VIP > Pro > Free)
 * - Platform (external > internal)
 * - Gifts (gifters get priority)
 * - Time (older comments slightly lower)
 *
 * Queue Features:
 * - Max heap for O(1) peek, O(log n) push/pop
 * - Deduplication (same user, same message)
 * - Rate limiting per user
 * - Auto-expire old comments
 */

import { classifyIntent, calculatePriorityScore } from './intentClassifierService';
import { detectEmotion, isNegativeEmotion } from './emotionDetectorService';

// ===========================================
// PRIORITY WEIGHTS
// ===========================================

const PRIORITY_WEIGHTS = {
  // Intent-based weights
  intent: {
    BUY_INTENT: 1.0,
    COMPLAINT: 0.95,
    GIFT_SENDING: 0.9,
    PRICE_QUERY: 0.85,
    CUSTOM_ORDER: 0.85,
    CRYSTAL_RECOMMENDATION: 0.8,
    ZODIAC_QUERY: 0.75,
    ELEMENT_QUERY: 0.75,
    PRODUCT_INFO: 0.7,
    HEALTH_QUERY: 0.7,
    LOVE_QUERY: 0.7,
    WEALTH_QUERY: 0.7,
    CRYSTAL_CARE: 0.6,
    CRYSTAL_AUTHENTICITY: 0.65,
    QUESTION: 0.5,
    GREETING: 0.4,
    COMPLIMENT: 0.35,
    LIKE_FOLLOW: 0.3,
    THANKS: 0.3,
    GOODBYE: 0.2,
    SPAM: 0.0,
    UNKNOWN: 0.3,
  },

  // User tier weights
  tier: {
    vip: 0.3,
    pro: 0.2,
    premium: 0.15,
    free: 0,
  },

  // Platform weights (external platforms = more important)
  platform: {
    tiktok: 0.2,
    facebook: 0.2,
    youtube: 0.15,
    shopee: 0.15,
    gemral: 0.1,
  },

  // Gift value weights
  gift: {
    large: 0.4,    // > 100k
    medium: 0.3,   // 50-100k
    small: 0.2,    // 10-50k
    minimal: 0.1,  // < 10k
    none: 0,
  },

  // Emotion adjustments
  emotion: {
    ANGRY: 0.3,      // Highest - need to address
    FRUSTRATED: 0.25,
    SAD: 0.2,
    EXCITED: 0.15,   // Eager buyer
    CURIOUS: 0.1,
    HAPPY: 0.05,
    SURPRISED: 0.05,
    NEUTRAL: 0,
  },
};

// ===========================================
// PRIORITY QUEUE CLASS
// ===========================================

class PriorityQueue {
  constructor(options = {}) {
    this.heap = [];
    this.userCounts = new Map(); // Rate limiting
    this.messageHashes = new Set(); // Deduplication
    this.maxSize = options.maxSize || 500;
    this.maxPerUser = options.maxPerUser || 5;
    this.expireMs = options.expireMs || 30000; // 30 seconds
    this.lastCleanup = Date.now();
  }

  /**
   * Add comment to queue
   * @param {Object} comment
   * @returns {boolean} Success
   */
  enqueue(comment) {
    // Rate limiting
    const userId = comment.userId;
    const userCount = this.userCounts.get(userId) || 0;
    if (userCount >= this.maxPerUser) {
      return false;
    }

    // Deduplication
    const hash = this._hash(comment);
    if (this.messageHashes.has(hash)) {
      return false;
    }

    // Spam check
    if (comment.intentId === 'SPAM') {
      return false;
    }

    // Max size check
    if (this.heap.length >= this.maxSize) {
      this._cleanup();
      if (this.heap.length >= this.maxSize) {
        // Remove lowest priority
        const lowest = this.heap[this.heap.length - 1];
        if (comment.priority <= lowest.priority) {
          return false;
        }
        this.heap.pop();
      }
    }

    // Add to queue
    this.heap.push(comment);
    this._bubbleUp(this.heap.length - 1);

    // Update tracking
    this.userCounts.set(userId, userCount + 1);
    this.messageHashes.add(hash);

    return true;
  }

  /**
   * Get highest priority comment
   * @returns {Object|null}
   */
  dequeue() {
    if (this.heap.length === 0) return null;

    const top = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }

    // Update tracking
    const userId = top.userId;
    const count = this.userCounts.get(userId) || 0;
    if (count > 0) {
      this.userCounts.set(userId, count - 1);
    }

    return top;
  }

  /**
   * Peek at highest priority without removing
   * @returns {Object|null}
   */
  peek() {
    return this.heap[0] || null;
  }

  /**
   * Get queue size
   * @returns {number}
   */
  size() {
    return this.heap.length;
  }

  /**
   * Check if queue is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Get top N items without removing
   * @param {number} n
   * @returns {Array}
   */
  peekTop(n = 5) {
    // Simple approach: sort copy of heap
    return [...this.heap]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, n);
  }

  /**
   * Clear queue
   */
  clear() {
    this.heap = [];
    this.userCounts.clear();
    this.messageHashes.clear();
  }

  // Private methods

  _hash(comment) {
    return `${comment.userId}:${comment.message.substring(0, 50)}`;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority >= this.heap[index].priority) break;

      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  _bubbleDown(index) {
    const length = this.heap.length;

    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let largest = index;

      if (leftChild < length && this.heap[leftChild].priority > this.heap[largest].priority) {
        largest = leftChild;
      }

      if (rightChild < length && this.heap[rightChild].priority > this.heap[largest].priority) {
        largest = rightChild;
      }

      if (largest === index) break;

      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }

  _cleanup() {
    const now = Date.now();
    if (now - this.lastCleanup < 5000) return; // Max once per 5 seconds

    this.lastCleanup = now;
    const expireBefore = now - this.expireMs;

    // Remove expired comments
    this.heap = this.heap.filter(comment => comment.timestamp > expireBefore);

    // Rebuild heap
    this._rebuildHeap();

    // Clear old hashes (approximate - just clear if too many)
    if (this.messageHashes.size > this.maxSize * 2) {
      this.messageHashes.clear();
    }
  }

  _rebuildHeap() {
    const items = [...this.heap];
    this.heap = [];
    items.forEach(item => {
      this.heap.push(item);
      this._bubbleUp(this.heap.length - 1);
    });
  }
}

// ===========================================
// PRIORITY CALCULATION
// ===========================================

/**
 * Calculate priority score for a comment
 * @param {Object} comment
 * @returns {number} 0-1 priority score
 */
export function calculateCommentPriority(comment) {
  let priority = 0;

  // 1. Intent (40% weight)
  const intentWeight = PRIORITY_WEIGHTS.intent[comment.intentId] || 0.3;
  priority += intentWeight * 0.4;

  // 2. Emotion (15% weight)
  const emotionWeight = PRIORITY_WEIGHTS.emotion[comment.emotionId] || 0;
  priority += emotionWeight * 0.15;

  // 3. User tier (15% weight)
  const tierWeight = PRIORITY_WEIGHTS.tier[comment.userTier] || 0;
  priority += tierWeight * 0.15;

  // 4. Platform (10% weight)
  const platformWeight = PRIORITY_WEIGHTS.platform[comment.platform] || 0.1;
  priority += platformWeight * 0.1;

  // 5. Gift (15% weight)
  const giftWeight = getGiftWeight(comment.giftValue);
  priority += giftWeight * 0.15;

  // 6. Time decay (5% weight)
  const ageMs = Date.now() - (comment.timestamp || Date.now());
  const ageDecay = Math.max(0, 1 - ageMs / 60000); // Decay over 1 minute
  priority += ageDecay * 0.05;

  return Math.min(priority, 1.0);
}

function getGiftWeight(giftValue) {
  if (!giftValue || giftValue <= 0) return PRIORITY_WEIGHTS.gift.none;
  if (giftValue >= 100000) return PRIORITY_WEIGHTS.gift.large;
  if (giftValue >= 50000) return PRIORITY_WEIGHTS.gift.medium;
  if (giftValue >= 10000) return PRIORITY_WEIGHTS.gift.small;
  return PRIORITY_WEIGHTS.gift.minimal;
}

// ===========================================
// COMMENT PROCESSOR
// ===========================================

/**
 * Process raw comment into prioritized queue item
 * @param {Object} rawComment
 * @returns {Object} Processed comment with priority
 */
export function processComment(rawComment) {
  const {
    id,
    userId,
    userName,
    userAvatar,
    userTier = 'free',
    platform = 'gemral',
    message,
    giftValue = 0,
    timestamp = Date.now(),
    metadata = {},
  } = rawComment;

  // Classify intent
  const intentResult = classifyIntent(message);

  // Detect emotion
  const emotionResult = detectEmotion(message);

  // Build processed comment
  const processed = {
    id: id || `${userId}-${timestamp}`,
    userId,
    userName,
    userAvatar,
    userTier,
    platform,
    message,
    giftValue,
    timestamp,
    metadata,

    // Analysis results
    intentId: intentResult.intent.id,
    intentConfidence: intentResult.confidence,
    emotionId: emotionResult.emotion.id,
    emotionConfidence: emotionResult.confidence,

    // Response config
    tier: intentResult.tier,
    expression: emotionResult.expression,
    ttsParams: emotionResult.ttsParams,
  };

  // Calculate priority
  processed.priority = calculateCommentPriority(processed);

  return processed;
}

// ===========================================
// QUEUE MANAGER
// ===========================================

class QueueManager {
  constructor() {
    this.queues = new Map(); // session_id -> PriorityQueue
    this.stats = {
      totalProcessed: 0,
      totalEnqueued: 0,
      totalDequeued: 0,
      totalRejected: 0,
    };
  }

  /**
   * Get or create queue for session
   * @param {string} sessionId
   * @returns {PriorityQueue}
   */
  getQueue(sessionId) {
    if (!this.queues.has(sessionId)) {
      this.queues.set(sessionId, new PriorityQueue());
    }
    return this.queues.get(sessionId);
  }

  /**
   * Add comment to session queue
   * @param {string} sessionId
   * @param {Object} rawComment
   * @returns {Object} { success, comment }
   */
  addComment(sessionId, rawComment) {
    this.stats.totalProcessed++;

    const processed = processComment(rawComment);
    const queue = this.getQueue(sessionId);

    const success = queue.enqueue(processed);

    if (success) {
      this.stats.totalEnqueued++;
    } else {
      this.stats.totalRejected++;
    }

    return { success, comment: processed };
  }

  /**
   * Get next comment to respond to
   * @param {string} sessionId
   * @returns {Object|null}
   */
  getNextComment(sessionId) {
    const queue = this.getQueue(sessionId);
    const comment = queue.dequeue();

    if (comment) {
      this.stats.totalDequeued++;
    }

    return comment;
  }

  /**
   * Peek at next comment without removing
   * @param {string} sessionId
   * @returns {Object|null}
   */
  peekNextComment(sessionId) {
    const queue = this.getQueue(sessionId);
    return queue.peek();
  }

  /**
   * Get top N comments
   * @param {string} sessionId
   * @param {number} n
   * @returns {Array}
   */
  getTopComments(sessionId, n = 5) {
    const queue = this.getQueue(sessionId);
    return queue.peekTop(n);
  }

  /**
   * Get queue size for session
   * @param {string} sessionId
   * @returns {number}
   */
  getQueueSize(sessionId) {
    const queue = this.getQueue(sessionId);
    return queue.size();
  }

  /**
   * Clear session queue
   * @param {string} sessionId
   */
  clearQueue(sessionId) {
    const queue = this.getQueue(sessionId);
    queue.clear();
  }

  /**
   * Remove session queue
   * @param {string} sessionId
   */
  removeQueue(sessionId) {
    this.queues.delete(sessionId);
  }

  /**
   * Get stats
   * @returns {Object}
   */
  getStats() {
    return {
      ...this.stats,
      activeQueues: this.queues.size,
      totalQueuedComments: Array.from(this.queues.values())
        .reduce((sum, q) => sum + q.size(), 0),
    };
  }
}

// Singleton instance
const queueManager = new QueueManager();

// ===========================================
// EXPORT
// ===========================================

export {
  PriorityQueue,
  queueManager,
  PRIORITY_WEIGHTS,
};

export default {
  // Queue operations
  addComment: (sessionId, comment) => queueManager.addComment(sessionId, comment),
  getNextComment: (sessionId) => queueManager.getNextComment(sessionId),
  peekNextComment: (sessionId) => queueManager.peekNextComment(sessionId),
  getTopComments: (sessionId, n) => queueManager.getTopComments(sessionId, n),
  getQueueSize: (sessionId) => queueManager.getQueueSize(sessionId),
  clearQueue: (sessionId) => queueManager.clearQueue(sessionId),
  removeQueue: (sessionId) => queueManager.removeQueue(sessionId),
  getStats: () => queueManager.getStats(),

  // Processing
  processComment,
  calculateCommentPriority,

  // Weights config
  PRIORITY_WEIGHTS,
};
