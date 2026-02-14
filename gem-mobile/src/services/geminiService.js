/**
 * Gemral - Gemini API Service
 *
 * Integration via Supabase Edge Function (gemini-proxy)
 * - Tier-based rate limiting
 * - JWT authentication
 * - Usage logging
 *
 * Model: gemini-2.5-flash (with thinking tokens)
 */

import { supabase, getSession, SUPABASE_URL } from './supabase';
import { SYSTEM_PROMPT } from '../config/gemini.config';

// Edge Function endpoint
const GEMINI_PROXY_URL = `${SUPABASE_URL}/functions/v1/gemini-proxy`;

class GeminiService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.rateLimitInfo = null; // Store rate limit info from last request
    this.requestTimeout = 60000; // 60 seconds — AI responses can be long
  }

  /**
   * Generate response from Gemini API via Edge Function
   * @param {string} message - User message
   * @param {Array} history - Conversation history
   * @param {string} feature - Feature name ('gem_master', 'chat', etc.)
   * @returns {Promise<Object>} - { text, source: 'gemini', confidence: 1.0 }
   */
  async generateResponse(message, history = [], feature = 'gem_master') {
    const startTime = Date.now();

    try {
      // Build conversation context
      const messages = this.buildMessages(message, history);

      // Make API request via Edge Function
      const response = await this.callEdgeFunction({
        feature,
        messages,
        systemPrompt: SYSTEM_PROMPT,
        metadata: { requestType: 'chat' },
      });

      const duration = Date.now() - startTime;
      console.log(`[Gemini] Response generated in ${duration}ms`);

      return {
        text: response.text,
        source: 'gemini',
        confidence: 1.0,
        duration,
        tokensUsed: response.usage?.totalTokens || 0,
        rateLimit: this.rateLimitInfo,
      };
    } catch (error) {
      console.error('[Gemini] Error:', error.message);

      // Return fallback response
      return this.getFallbackResponse(error);
    }
  }

  /**
   * Build messages array for Gemini API
   * @param {string} message - Current user message
   * @param {Array} history - Previous messages
   * @returns {Array}
   */
  buildMessages(message, history = []) {
    const messages = [];

    // Add system instruction acknowledgment (Gemini workaround)
    messages.push({
      role: 'user',
      parts: [{ text: '[SYSTEM INSTRUCTION RECEIVED]\nHãy nhớ instruction và trả lời câu hỏi sau.' }],
    });

    messages.push({
      role: 'model',
      parts: [{ text: 'Ta đã hiểu. Ta là GEM Master. Ta sẽ tuân theo hướng dẫn. Bạn cần điều gì?' }],
    });

    // Add conversation history with token-aware truncation
    // Rough token estimate: 1 token ≈ 4 characters (conservative for Vietnamese)
    const MAX_HISTORY_TOKENS = 4000;
    const MAX_HISTORY_MESSAGES = 20;

    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
    let totalTokens = 0;
    const truncatedHistory = [];

    // Walk backwards to prioritize most recent messages
    for (let i = recentHistory.length - 1; i >= 0; i--) {
      const msg = recentHistory[i];
      const contentLength = (msg.content || '').length;
      const estimatedTokens = Math.ceil(contentLength / 4);

      if (totalTokens + estimatedTokens > MAX_HISTORY_TOKENS) {
        break; // Stop adding older messages to stay within token budget
      }

      totalTokens += estimatedTokens;
      truncatedHistory.unshift(msg); // Prepend to maintain chronological order
    }

    for (const msg of truncatedHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      parts: [{ text: message }],
    });

    return messages;
  }

  /**
   * Call Gemini API via Edge Function with auth
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>}
   */
  async callEdgeFunction(params, attempt = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      // Get current session for JWT token
      const { session, error: sessionError } = await getSession();

      if (sessionError || !session?.access_token) {
        throw new Error('Not authenticated. Please sign in to use AI features.');
      }

      console.log('[Gemini] Calling Edge Function:', params.feature);

      const response = await fetch(GEMINI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'x-request-feature': params.feature,
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      // Store rate limit info from headers
      this.rateLimitInfo = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0', 10),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10),
        resetAt: response.headers.get('X-RateLimit-Reset') || null,
      };

      const data = await response.json();

      // Handle rate limit exceeded
      if (response.status === 429) {
        console.warn('[Gemini] Rate limit exceeded');
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // Handle auth errors
      if (response.status === 401) {
        throw new Error('AUTH_EXPIRED');
      }

      // Handle other errors
      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return {
        text: data.data?.text || '',
        usage: data.data?.usage || {},
        rateLimit: data.rateLimit,
      };
    } catch (error) {
      // Convert AbortError to a more descriptive timeout error
      if (error.name === 'AbortError') {
        const timeoutError = new Error('REQUEST_TIMEOUT');
        // Retry logic for timeout errors
        if (attempt < this.maxRetries) {
          console.log(`[Gemini] Timeout, retry attempt ${attempt + 1}/${this.maxRetries}`);
          await this.delay(this.retryDelay * attempt);
          return this.callEdgeFunction(params, attempt + 1);
        }
        throw timeoutError;
      }

      // Retry logic for transient errors
      if (attempt < this.maxRetries && this.shouldRetry(error)) {
        console.log(`[Gemini] Retry attempt ${attempt + 1}/${this.maxRetries}`);
        await this.delay(this.retryDelay * attempt);
        return this.callEdgeFunction(params, attempt + 1);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Check if error should trigger retry
   * @param {Error} error
   * @returns {boolean}
   */
  shouldRetry(error) {
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'REQUEST_TIMEOUT',
      'network',
      'fetch',
      '500',
      '502',
      '503',
      '504',
    ];

    const errorString = error.message.toLowerCase();

    // Don't retry rate limit or auth errors
    if (errorString.includes('rate_limit') || errorString.includes('auth')) {
      return false;
    }

    return retryableErrors.some((e) => errorString.includes(e.toLowerCase()));
  }

  /**
   * Delay helper
   * @param {number} ms
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get fallback response when API fails
   * @param {Error} error
   * @returns {Object}
   */
  getFallbackResponse(error) {
    const errorMsg = error.message || '';

    let text;

    if (errorMsg.includes('RATE_LIMIT_EXCEEDED')) {
      const resetTime = this.rateLimitInfo?.resetAt
        ? new Date(this.rateLimitInfo.resetAt).toLocaleTimeString('vi-VN')
        : 'vài giây nữa';

      text = `Bạn đã đạt giới hạn request trong phút này.

**Reset lúc:** ${resetTime}

**Mẹo:**
- Upgrade TIER để có nhiều request hơn
- TIER 1: 30 req/min
- TIER 2: 60 req/min
- TIER 3: 120 req/min

Vui lòng thử lại sau.`;
    } else if (errorMsg.includes('AUTH_EXPIRED') || errorMsg.includes('Not authenticated')) {
      text = `Phiên đăng nhập đã hết hạn.

Vui lòng đăng xuất và đăng nhập lại để tiếp tục sử dụng.`;
    } else if (errorMsg.includes('REQUEST_TIMEOUT') || errorMsg.includes('timeout')) {
      text = `Yêu cầu đã hết thời gian chờ (60 giây).

Câu hỏi của bạn có thể quá phức tạp. Vui lòng thử:
- Đặt câu hỏi ngắn gọn hơn
- Chia thành nhiều câu hỏi nhỏ
- Thử lại sau vài giây`;
    } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('ECONNRESET')) {
      text = `Không thể kết nối server.

Vui lòng kiểm tra kết nối mạng và thử lại.`;
    } else {
      text = `Xin lỗi, có sự cố kỹ thuật.

Vui lòng thử lại sau vài giây hoặc liên hệ support nếu lỗi tiếp tục.`;
    }

    return {
      text,
      source: 'fallback',
      confidence: 0,
      error: errorMsg,
      rateLimit: this.rateLimitInfo,
    };
  }

  /**
   * Get current rate limit info
   * @returns {Object|null}
   */
  getRateLimitInfo() {
    return this.rateLimitInfo;
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const response = await this.generateResponse('test', [], 'chat');
      return response.source === 'gemini';
    } catch (error) {
      console.error('[Gemini] Connection test failed:', error);
      return false;
    }
  }

  // ===========================================
  // FEATURE-SPECIFIC METHODS
  // ===========================================

  /**
   * Call GEM Master for trading advice
   * @param {string} message - User question
   * @param {Array} history - Conversation history
   * @returns {Promise<Object>}
   */
  async callGemMaster(message, history = []) {
    return this.generateResponse(message, history, 'gem_master');
  }

  /**
   * Call for Tarot reading
   * @param {string} question - User's question
   * @param {Object} cards - Selected tarot cards
   * @returns {Promise<Object>}
   */
  async callTarotReading(question, cards) {
    const prompt = `[TAROT READING REQUEST]
Câu hỏi: ${question}
Lá bài: ${JSON.stringify(cards)}

Hãy giải nghĩa lá bài này cho câu hỏi trên.`;

    return this.generateResponse(prompt, [], 'tarot');
  }

  /**
   * Call for I-Ching reading
   * @param {string} question - User's question
   * @param {Object} hexagram - Hexagram data
   * @returns {Promise<Object>}
   */
  async callIChingReading(question, hexagram) {
    const prompt = `[I-CHING READING REQUEST]
Câu hỏi: ${question}
Quẻ: ${hexagram.name} (${hexagram.image})
Số: ${hexagram.number}

Hãy giải nghĩa quẻ Kinh Dịch này cho câu hỏi trên.`;

    return this.generateResponse(prompt, [], 'i_ching');
  }

  /**
   * Call for Tử Vi reading
   * @param {Object} birthInfo - Birth date/time info
   * @param {string} question - User's question
   * @returns {Promise<Object>}
   */
  async callTuViReading(birthInfo, question) {
    const prompt = `[TỬ VI READING REQUEST]
Thông tin ngày sinh: ${JSON.stringify(birthInfo)}
Câu hỏi: ${question}

Hãy phân tích Tử Vi dựa trên thông tin trên.`;

    return this.generateResponse(prompt, [], 'tu_vi');
  }
}

// Export singleton instance
export default new GeminiService();
