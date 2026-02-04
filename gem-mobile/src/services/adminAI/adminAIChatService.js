/**
 * GEM AI Trading Brain - Chat Service
 * Main AI chat service for admin trading assistant
 *
 * Features:
 * - Send messages to Gemini via Edge Function
 * - Build conversation with context
 * - Extract action buttons from responses
 * - Save/load conversation history
 * - Generate proactive alerts
 */

import { supabase, getSession, SUPABASE_URL } from '../supabase';
import { ADMIN_AI_SYSTEM_PROMPT, QUICK_ACTION_PROMPTS } from './adminAIKnowledge';
import { adminAIContextService } from './adminAIContextService';

// Edge Function endpoint
const GEMINI_PROXY_URL = `${SUPABASE_URL}/functions/v1/gemini-proxy`;

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const MAX_HISTORY_MESSAGES = 20;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

class AdminAIChatService {
  constructor() {
    this.conversationId = null;
    this.messageHistory = [];
    this.rateLimitInfo = null;
    this.lastError = null;
  }

  // ═══════════════════════════════════════════════════════════
  // SEND MESSAGE
  // ═══════════════════════════════════════════════════════════

  /**
   * Send a message to the AI
   * @param {string} message - User message
   * @param {Object} context - Trading context from buildContext
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} AI response
   */
  async sendMessage(message, context = {}, options = {}) {
    const startTime = Date.now();

    try {
      // Get auth session
      const { session, error: sessionError } = await getSession();

      if (sessionError || !session?.access_token) {
        throw new Error('Not authenticated. Please sign in.');
      }

      // Build system prompt with context
      const contextString = adminAIContextService.formatContextForPrompt(context);
      const systemPrompt = `${ADMIN_AI_SYSTEM_PROMPT}\n\n${contextString}`;

      // Build messages array
      const messages = this.buildMessages(message, this.messageHistory);

      console.log('[AdminAIChat] Sending message:', message.substring(0, 50) + '...');

      // Call Edge Function
      const response = await this._callEdgeFunction({
        feature: 'admin_ai_trading',
        messages,
        systemPrompt,
        metadata: {
          requestType: 'admin_ai',
          symbol: context.symbol,
          timeframe: context.timeframe,
        },
      });

      const duration = Date.now() - startTime;
      console.log(`[AdminAIChat] Response received in ${duration}ms`);

      // Parse response for actions
      const actions = this.extractActions(response.text);

      // Add to history
      this._addToHistory('user', message);
      this._addToHistory('assistant', response.text);

      // Save to database if we have a conversation
      if (this.conversationId && session.user?.id) {
        this._saveMessagesToDb(session.user.id, [
          { role: 'user', content: message },
          { role: 'assistant', content: response.text },
        ]).catch((e) => console.error('[AdminAIChat] Save error:', e));
      }

      return {
        text: response.text,
        actions,
        source: 'gemini',
        confidence: 1.0,
        duration,
        tokensUsed: response.usage?.totalTokens || 0,
        rateLimit: this.rateLimitInfo,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[AdminAIChat] Error:', error.message);
      this.lastError = error;
      return this._getFallbackResponse(error);
    }
  }

  /**
   * Send a quick action prompt
   * @param {string} actionId - Quick action ID
   * @param {Object} context - Trading context
   * @returns {Promise<Object>} AI response
   */
  async sendQuickAction(actionId, context) {
    const promptGenerator = QUICK_ACTION_PROMPTS[actionId];

    if (!promptGenerator) {
      return {
        text: 'Action không hợp lệ.',
        source: 'fallback',
        error: `Unknown action: ${actionId}`,
      };
    }

    const prompt = promptGenerator(context);
    return this.sendMessage(prompt, context);
  }

  // ═══════════════════════════════════════════════════════════
  // MESSAGE BUILDING
  // ═══════════════════════════════════════════════════════════

  /**
   * Build messages array for Gemini API
   * @param {string} message - Current user message
   * @param {Array} history - Previous messages
   * @returns {Array} Formatted messages
   */
  buildMessages(message, history = []) {
    const messages = [];

    // Add system instruction acknowledgment (Gemini workaround)
    messages.push({
      role: 'user',
      parts: [{ text: '[SYSTEM INSTRUCTION RECEIVED]\nTa đã nhận instruction. Hãy trả lời câu hỏi sau.' }],
    });

    messages.push({
      role: 'model',
      parts: [{ text: 'Tôi là GEM AI Trading Brain. Tôi sẽ tuân theo instruction và hỗ trợ Admin. Bạn cần gì?' }],
    });

    // Add conversation history (limited)
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
    for (const msg of recentHistory) {
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

  // ═══════════════════════════════════════════════════════════
  // API CALL
  // ═══════════════════════════════════════════════════════════

  /**
   * Call Gemini API via Edge Function with retry
   * @private
   */
  async _callEdgeFunction(params, attempt = 1) {
    try {
      const { session } = await getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(GEMINI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'x-request-feature': params.feature,
        },
        body: JSON.stringify(params),
      });

      // Store rate limit info
      this.rateLimitInfo = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0', 10),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10),
        resetAt: response.headers.get('X-RateLimit-Reset') || null,
      };

      const data = await response.json();

      // Handle errors
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      if (response.status === 401) {
        throw new Error('AUTH_EXPIRED');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return {
        text: data.data?.text || '',
        usage: data.data?.usage || {},
        rateLimit: data.rateLimit,
      };
    } catch (error) {
      // Retry logic
      if (attempt < MAX_RETRIES && this._shouldRetry(error)) {
        console.log(`[AdminAIChat] Retry attempt ${attempt + 1}/${MAX_RETRIES}`);
        await this._delay(RETRY_DELAY * attempt);
        return this._callEdgeFunction(params, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Check if error should trigger retry
   * @private
   */
  _shouldRetry(error) {
    const retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'network', 'fetch', '500', '502', '503', '504'];
    const errorString = error.message.toLowerCase();

    // Don't retry rate limit or auth errors
    if (errorString.includes('rate_limit') || errorString.includes('auth')) {
      return false;
    }

    return retryableErrors.some((e) => errorString.includes(e.toLowerCase()));
  }

  /**
   * Delay helper
   * @private
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════════
  // ACTION EXTRACTION
  // ═══════════════════════════════════════════════════════════

  /**
   * Extract action buttons from AI response
   * @param {string} response - AI response text
   * @returns {Array} Array of action objects
   */
  extractActions(response) {
    const actions = [];

    if (!response) return actions;

    // Look for entry suggestions
    if (response.includes('Entry:') || response.includes('Entry khuyến nghị')) {
      // Try to extract entry price
      const entryMatch = response.match(/Entry:\s*\$?([\d,\.]+)/i);
      const slMatch = response.match(/SL:\s*\$?([\d,\.]+)/i);
      const tpMatch = response.match(/TP[1]?:\s*\$?([\d,\.]+)/i);

      if (entryMatch) {
        actions.push({
          id: 'open_trade',
          label: 'Mở Trade',
          type: 'primary',
          data: {
            entry: parseFloat(entryMatch[1].replace(',', '')),
            stopLoss: slMatch ? parseFloat(slMatch[1].replace(',', '')) : null,
            takeProfit: tpMatch ? parseFloat(tpMatch[1].replace(',', '')) : null,
          },
        });
      }
    }

    // Look for close recommendations
    if (response.includes('CLOSE') || response.includes('đóng position') || response.includes('take profit')) {
      actions.push({
        id: 'close_position',
        label: 'Đóng Position',
        type: 'warning',
      });
    }

    // Look for partial close
    if (response.includes('PARTIAL') || response.includes('50%') || response.includes('một phần')) {
      actions.push({
        id: 'partial_close',
        label: 'Đóng 50%',
        type: 'secondary',
      });
    }

    // Look for trail stop recommendation
    if (response.includes('TRAIL') || response.includes('trailing') || response.includes('dịch SL')) {
      actions.push({
        id: 'move_sl',
        label: 'Dịch SL',
        type: 'secondary',
      });
    }

    return actions;
  }

  // ═══════════════════════════════════════════════════════════
  // HISTORY MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Add message to local history
   * @private
   */
  _addToHistory(role, content) {
    this.messageHistory.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // Trim history if too long
    if (this.messageHistory.length > MAX_HISTORY_MESSAGES * 2) {
      this.messageHistory = this.messageHistory.slice(-MAX_HISTORY_MESSAGES);
    }
  }

  /**
   * Clear message history
   */
  clearHistory() {
    this.messageHistory = [];
    this.conversationId = null;
  }

  /**
   * Get current message history
   * @returns {Array} Message history
   */
  getHistory() {
    return [...this.messageHistory];
  }

  // ═══════════════════════════════════════════════════════════
  // DATABASE PERSISTENCE
  // ═══════════════════════════════════════════════════════════

  /**
   * Create new conversation in database
   * @param {string} userId - User ID
   * @param {Object} metadata - Conversation metadata
   * @returns {Promise<string>} Conversation ID
   */
  async createConversation(userId, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('admin_ai_conversations')
        .insert({
          user_id: userId,
          title: metadata.title || 'New Conversation',
          symbol: metadata.symbol,
          timeframe: metadata.timeframe,
        })
        .select('id')
        .single();

      if (error) throw error;

      this.conversationId = data.id;
      return data.id;
    } catch (error) {
      console.error('[AdminAIChat] createConversation error:', error);
      return null;
    }
  }

  /**
   * Load conversation from database
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} Messages
   */
  async loadConversation(conversationId) {
    try {
      const { data, error } = await supabase
        .from('admin_ai_messages')
        .select('role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      this.conversationId = conversationId;
      this.messageHistory = data.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at).getTime(),
      }));

      return this.messageHistory;
    } catch (error) {
      console.error('[AdminAIChat] loadConversation error:', error);
      return [];
    }
  }

  /**
   * Save messages to database
   * @private
   */
  async _saveMessagesToDb(userId, messages) {
    if (!this.conversationId) {
      // Create conversation first
      await this.createConversation(userId, {});
    }

    if (!this.conversationId) return;

    try {
      const records = messages.map((m) => ({
        conversation_id: this.conversationId,
        role: m.role,
        content: m.content,
      }));

      await supabase.from('admin_ai_messages').insert(records);

      // Update conversation stats
      await supabase
        .from('admin_ai_conversations')
        .update({
          message_count: this.messageHistory.length,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.conversationId);
    } catch (error) {
      console.error('[AdminAIChat] _saveMessagesToDb error:', error);
    }
  }

  /**
   * Get recent conversations for user
   * @param {string} userId - User ID
   * @param {number} limit - Number of conversations
   * @returns {Promise<Array>} Conversations
   */
  async getRecentConversations(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('admin_ai_conversations')
        .select('id, title, symbol, timeframe, message_count, last_message_at, created_at')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[AdminAIChat] getRecentConversations error:', error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PROACTIVE ALERTS
  // ═══════════════════════════════════════════════════════════

  /**
   * Generate proactive alert message
   * @param {string} alertType - Type of alert
   * @param {Object} data - Alert data
   * @returns {Object} Generated alert message
   */
  generateProactiveAlert(alertType, data) {
    const alertTemplates = {
      approaching_sl: (d) => ({
        priority: 'urgent',
        title: `⚠️ ${d.symbol} approaching SL`,
        message: `Position ${d.symbol} đang gần SL (${d.distance}% away). P&L: ${d.pnlPercent}%`,
        actions: [
          { id: 'close_position', label: 'Đóng ngay', type: 'warning' },
          { id: 'view_position', label: 'Xem chi tiết', type: 'secondary' },
        ],
      }),

      hit_tp: (d) => ({
        priority: 'high',
        title: `✅ ${d.symbol} HIT TP`,
        message: `Position ${d.symbol} đã chạm TP! P&L: +${d.pnlPercent}%`,
        actions: [
          { id: 'view_history', label: 'Xem lịch sử', type: 'primary' },
        ],
      }),

      pattern_detected: (d) => ({
        priority: 'normal',
        title: `📊 Pattern detected: ${d.pattern}`,
        message: `${d.symbol} (${d.timeframe}): ${d.pattern} ${d.direction} - Confidence: ${d.confidence}%`,
        actions: [
          { id: 'analyze', label: 'Phân tích', type: 'primary' },
          { id: 'open_trade', label: 'Mở Trade', type: 'secondary' },
        ],
      }),

      zone_approach: (d) => ({
        priority: 'normal',
        title: `🎯 ${d.symbol} approaching ${d.zoneType}`,
        message: `Price ${d.distance}% from ${d.zoneType} zone ($${d.zonePrice})`,
        actions: [
          { id: 'analyze', label: 'Phân tích zone', type: 'primary' },
        ],
      }),

      risk_warning: (d) => ({
        priority: 'high',
        title: '⚠️ Portfolio Risk Warning',
        message: `Risk level: ${d.riskLevel}. Total exposure: ${d.exposure}%. Consider reducing positions.`,
        actions: [
          { id: 'review_positions', label: 'Review all', type: 'warning' },
        ],
      }),
    };

    const template = alertTemplates[alertType];
    if (!template) {
      return {
        priority: 'low',
        title: 'Alert',
        message: JSON.stringify(data),
        actions: [],
      };
    }

    return {
      ...template(data),
      type: alertType,
      timestamp: Date.now(),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // FALLBACK RESPONSE
  // ═══════════════════════════════════════════════════════════

  /**
   * Get fallback response when API fails
   * @private
   */
  _getFallbackResponse(error) {
    const errorMsg = error.message || '';
    let text;

    if (errorMsg.includes('RATE_LIMIT_EXCEEDED')) {
      const resetTime = this.rateLimitInfo?.resetAt
        ? new Date(this.rateLimitInfo.resetAt).toLocaleTimeString('vi-VN')
        : 'vài giây nữa';

      text = `Đã đạt giới hạn request.\n\n**Reset lúc:** ${resetTime}\n\nVui lòng thử lại sau.`;
    } else if (errorMsg.includes('AUTH_EXPIRED') || errorMsg.includes('Not authenticated')) {
      text = `Phiên đăng nhập đã hết hạn.\n\nVui lòng đăng xuất và đăng nhập lại.`;
    } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      text = `Không thể kết nối server.\n\nVui lòng kiểm tra kết nối mạng và thử lại.`;
    } else {
      text = `Có sự cố kỹ thuật.\n\nError: ${errorMsg}\n\nVui lòng thử lại sau.`;
    }

    return {
      text,
      source: 'fallback',
      confidence: 0,
      error: errorMsg,
      rateLimit: this.rateLimitInfo,
      timestamp: Date.now(),
    };
  }

  /**
   * Get rate limit info
   * @returns {Object|null} Rate limit info
   */
  getRateLimitInfo() {
    return this.rateLimitInfo;
  }

  /**
   * Get last error
   * @returns {Error|null} Last error
   */
  getLastError() {
    return this.lastError;
  }
}

// Export singleton
export const adminAIChatService = new AdminAIChatService();
export default adminAIChatService;
