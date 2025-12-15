/**
 * Gemral - Gemini API Service
 *
 * Integration với Gemini 2.5 Flash API
 * - Rate limiting protection
 * - Error handling
 * - Conversation history management
 *
 * Performance: 2-5 seconds response time
 * Cost: Token-based (~$0.001 per query)
 */

import { GEMINI_CONFIG, SYSTEM_PROMPT } from '../config/gemini.config';

class GeminiService {
  constructor() {
    this.endpoint = GEMINI_CONFIG.endpoint;
    this.apiKey = GEMINI_CONFIG.apiKey;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Generate response from Gemini API
   * @param {string} message - User message
   * @param {Array} history - Conversation history
   * @returns {Promise<Object>} - { text, source: 'gemini', confidence: 1.0 }
   */
  async generateResponse(message, history = []) {
    const startTime = Date.now();

    try {
      // Build conversation context
      const contents = this.buildContents(message, history);

      // Make API request
      const response = await this.makeRequest(contents);

      // Extract text from response
      const text = this.extractText(response);

      const duration = Date.now() - startTime;
      console.log(`✅ [Gemini] Response generated in ${duration}ms`);

      return {
        text,
        source: 'gemini',
        confidence: 1.0,
        duration,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      };
    } catch (error) {
      console.error('❌ [Gemini] Error:', error.message);

      // Return fallback response
      return this.getFallbackResponse(error);
    }
  }

  /**
   * Build contents array for Gemini API
   * @param {string} message - Current user message
   * @param {Array} history - Previous messages
   * @returns {Array}
   */
  buildContents(message, history = []) {
    const contents = [];

    // Add system prompt as first user message (Gemini workaround)
    contents.push({
      role: 'user',
      parts: [{ text: `[SYSTEM INSTRUCTION]\n${SYSTEM_PROMPT}\n[END SYSTEM INSTRUCTION]\n\nHãy nhớ instruction trên và trả lời câu hỏi sau.` }],
    });

    contents.push({
      role: 'model',
      parts: [{ text: 'Tôi đã hiểu. Tôi là Gemral AI, trợ lý trading và manifestation của Gemral. Tôi sẽ tuân theo tất cả hướng dẫn và bảo vệ 6 công thức Frequency độc quyền. Hãy hỏi tôi bất cứ điều gì!' }],
    });

    // Add conversation history (last 10 messages)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    return contents;
  }

  /**
   * Make request to Gemini API with retry logic
   * @param {Array} contents - Conversation contents
   * @returns {Promise<Object>}
   */
  async makeRequest(contents, attempt = 1) {
    const url = `${this.endpoint}?key=${this.apiKey}`;

    const body = {
      contents,
      generationConfig: {
        temperature: GEMINI_CONFIG.temperature,
        maxOutputTokens: GEMINI_CONFIG.maxTokens,
        topP: GEMINI_CONFIG.topP,
        topK: GEMINI_CONFIG.topK,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    try {
      console.log('[Gemini] Making request to:', url.split('?')[0]);
      console.log('[Gemini] Request body contents length:', contents.length);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('[Gemini] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Gemini] Error response:', errorText);
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // ignore parse error
        }
        throw new Error(
          errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const jsonResponse = await response.json();
      console.log('[Gemini] Full response:', JSON.stringify(jsonResponse, null, 2).slice(0, 1000));
      return jsonResponse;
    } catch (error) {
      // Retry logic
      if (attempt < this.maxRetries && this.shouldRetry(error)) {
        console.log(`⚠️ [Gemini] Retry attempt ${attempt + 1}/${this.maxRetries}`);
        await this.delay(this.retryDelay * attempt);
        return this.makeRequest(contents, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Extract text from Gemini response
   * @param {Object} response - API response
   * @returns {string}
   */
  extractText(response) {
    try {
      console.log('[Gemini] Raw response:', JSON.stringify(response, null, 2).slice(0, 500));

      // Check if response was blocked by safety filters
      if (response.promptFeedback?.blockReason) {
        console.warn('[Gemini] Response blocked:', response.promptFeedback.blockReason);
        return '⚠️ Câu hỏi của bạn không thể xử lý được. Vui lòng thử hỏi cách khác nhé!';
      }

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        // Check if there's a finish reason
        console.warn('[Gemini] No candidates, checking promptFeedback');
        return '🤔 Gemral đang suy nghĩ... Vui lòng thử lại!';
      }

      const candidate = candidates[0];

      // Check finish reason
      if (candidate.finishReason === 'SAFETY') {
        return '⚠️ Câu trả lời bị giới hạn bởi bộ lọc an toàn. Vui lòng hỏi cách khác!';
      }

      const content = candidate.content;
      if (!content || !content.parts || content.parts.length === 0) {
        console.warn('[Gemini] No content parts, finishReason:', candidate.finishReason);
        return '🤔 Gemral đang xử lý... Vui lòng thử lại!';
      }

      // Collect text from all parts
      let text = '';
      for (const part of content.parts) {
        if (part.text) {
          text += part.text;
        }
      }

      return text || '🤔 Không có phản hồi. Vui lòng thử lại!';
    } catch (error) {
      console.error('❌ [Gemini] Extract text error:', error);
      return '😔 Có lỗi xảy ra khi xử lý câu trả lời. Vui lòng thử lại!';
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
      'network',
      '429', // Rate limit
      '500', // Server error
      '502', // Bad gateway
      '503', // Service unavailable
      '504', // Gateway timeout
    ];

    const errorString = error.message.toLowerCase();
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
    const isRateLimit = error.message.includes('429');
    const isNetworkError =
      error.message.includes('network') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('fetch');

    let text;
    if (isRateLimit) {
      text = '⚠️ Hệ thống đang bận. Vui lòng thử lại sau vài giây.\n\nTrong lúc chờ, bạn có thể:\n• Xem TIER bundles trong Shop\n• Khám phá Crystals\n• Đọc FAQ trong Settings\n\nCảm ơn bạn đã kiên nhẫn! 😊';
    } else if (isNetworkError) {
      text = '📶 Không thể kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.\n\nMẹo: Bật WiFi hoặc 4G để có trải nghiệm tốt nhất.';
    } else {
      text = '😔 Xin lỗi, tôi gặp sự cố kỹ thuật.\n\nBạn có thể:\n• Thử lại sau vài giây\n• Gọi Hotline: 0909 123 456\n• Email: support@gemmaster.com\n\nCảm ơn bạn đã thông cảm! 🙏';
    }

    return {
      text,
      source: 'fallback',
      confidence: 0,
      error: error.message,
    };
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const response = await this.generateResponse('test');
      return response.source === 'gemini';
    } catch (error) {
      console.error('❌ [Gemini] Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new GeminiService();
