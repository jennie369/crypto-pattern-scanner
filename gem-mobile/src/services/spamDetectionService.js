/**
 * Spam Detection Service
 * Detect and filter spam messages
 *
 * Features:
 * - Auto-detect spam patterns
 * - Report messages as spam
 * - Get spam messages
 * - Dismiss false positives
 *
 * Spam Detection Patterns:
 * - Multiple links in a single message
 * - Repeated identical messages
 * - Known spam keywords
 * - Crypto/financial scam patterns
 * - Suspicious shortened URLs
 *
 * @module spamDetectionService
 */

import { supabase } from './supabase';

// Spam detection patterns
const SPAM_PATTERNS = {
  // URLs and links
  multipleLinks: /https?:\/\/[^\s]+/gi,
  shortenedUrls: /(bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|adf\.ly|j\.mp|short\.to)/i,

  // Crypto scam patterns
  cryptoScam: /(free\s*(bitcoin|btc|eth|crypto)|airdrop|giveaway|send\s*\d+.*get\s*\d+|double\s*(your|ur)\s*(money|crypto|btc))/i,

  // Financial scam
  financialScam: /(make\s*\$?\d+.*day|earn\s*\$?\d+.*fast|guaranteed\s*profit|investment\s*opportunity|risk\s*free)/i,

  // Phishing indicators
  phishing: /(verify\s*(your|ur)\s*account|suspended.*click|urgent.*action|password.*expire|confirm.*identity)/i,

  // Adult/Dating spam
  adultSpam: /(click\s*(here|now).*chat|hot\s*singles|meet\s*(girls|women|men).*area|dating\s*site)/i,

  // Generic spam
  genericSpam: /(congratulations.*won|you\'?ve\s*been\s*selected|limited\s*time\s*offer|act\s*now|click\s*below)/i,

  // Vietnamese spam patterns
  vietnameseSpam: /(kiếm\s*tiền\s*online|đầu\s*tư\s*sinh\s*lời|thu\s*nhập\s*thụ\s*động|làm\s*giàu\s*nhanh|mời\s*anh.*chị.*em|cơ\s*hội\s*vàng)/i,
};

// Spam keywords with weights
const SPAM_KEYWORDS = {
  high: ['bitcoin giveaway', 'double your money', 'free crypto', 'wire transfer', 'lottery winner'],
  medium: ['limited offer', 'act now', 'click here', 'earn money', 'work from home'],
  low: ['free', 'winner', 'prize', 'urgent', 'congratulations'],
};

class SpamDetectionService {
  constructor() {
    this.recentMessages = new Map(); // Track recent messages for repetition detection
  }

  // =====================================================
  // SPAM DETECTION
  // =====================================================

  /**
   * Detect if a message is spam
   * @param {string} content - Message content
   * @param {string} senderId - Sender ID for repetition check
   * @returns {Object} { isSpam: boolean, confidence: number, reasons: string[] }
   */
  detectSpam(content, senderId = null) {
    if (!content || content.trim().length === 0) {
      return { isSpam: false, confidence: 0, reasons: [] };
    }

    const reasons = [];
    let score = 0;
    const maxScore = 100;

    // Check for multiple links
    const links = content.match(SPAM_PATTERNS.multipleLinks) || [];
    if (links.length > 3) {
      score += 30;
      reasons.push('Chứa nhiều liên kết đáng ngờ');
    } else if (links.length > 1) {
      score += 15;
      reasons.push('Chứa nhiều liên kết');
    }

    // Check for shortened URLs
    if (SPAM_PATTERNS.shortenedUrls.test(content)) {
      score += 20;
      reasons.push('Chứa liên kết rút gọn đáng ngờ');
    }

    // Check crypto scam patterns
    if (SPAM_PATTERNS.cryptoScam.test(content)) {
      score += 40;
      reasons.push('Có dấu hiệu lừa đảo crypto');
    }

    // Check financial scam patterns
    if (SPAM_PATTERNS.financialScam.test(content)) {
      score += 35;
      reasons.push('Có dấu hiệu lừa đảo tài chính');
    }

    // Check phishing patterns
    if (SPAM_PATTERNS.phishing.test(content)) {
      score += 45;
      reasons.push('Có dấu hiệu lừa đảo (phishing)');
    }

    // Check adult spam
    if (SPAM_PATTERNS.adultSpam.test(content)) {
      score += 30;
      reasons.push('Nội dung spam người lớn');
    }

    // Check generic spam
    if (SPAM_PATTERNS.genericSpam.test(content)) {
      score += 25;
      reasons.push('Có dấu hiệu spam');
    }

    // Check Vietnamese spam
    if (SPAM_PATTERNS.vietnameseSpam.test(content)) {
      score += 30;
      reasons.push('Có dấu hiệu spam tiếng Việt');
    }

    // Check spam keywords
    const lowerContent = content.toLowerCase();

    for (const keyword of SPAM_KEYWORDS.high) {
      if (lowerContent.includes(keyword)) {
        score += 25;
        reasons.push(`Chứa từ khóa đáng ngờ: "${keyword}"`);
        break;
      }
    }

    for (const keyword of SPAM_KEYWORDS.medium) {
      if (lowerContent.includes(keyword)) {
        score += 15;
        break;
      }
    }

    // Check for repetition (if senderId provided)
    if (senderId) {
      const repetitionScore = this._checkRepetition(content, senderId);
      if (repetitionScore > 0) {
        score += repetitionScore;
        reasons.push('Tin nhắn lặp lại nhiều lần');
      }
    }

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.7 && content.length > 20) {
      score += 10;
      reasons.push('Sử dụng quá nhiều chữ in hoa');
    }

    // Normalize score
    const confidence = Math.min(score / maxScore, 1);
    const isSpam = confidence >= 0.5; // 50% threshold

    return {
      isSpam,
      confidence,
      reasons,
      score,
    };
  }

  /**
   * Check message repetition
   * @private
   */
  _checkRepetition(content, senderId) {
    const key = `${senderId}-${content.substring(0, 50)}`;
    const now = Date.now();

    // Get recent messages from this sender
    const recent = this.recentMessages.get(key);

    if (recent) {
      const timeDiff = now - recent.timestamp;
      recent.count++;
      recent.timestamp = now;

      // If same message sent more than 3 times in 5 minutes
      if (recent.count >= 3 && timeDiff < 300000) {
        return 30; // High spam score
      } else if (recent.count >= 2 && timeDiff < 60000) {
        return 20; // Medium spam score
      }
    } else {
      this.recentMessages.set(key, { count: 1, timestamp: now });
    }

    // Clean old entries
    this._cleanupRecentMessages();

    return 0;
  }

  /**
   * Cleanup old entries from recent messages map
   * @private
   */
  _cleanupRecentMessages() {
    const now = Date.now();
    const maxAge = 600000; // 10 minutes

    for (const [key, value] of this.recentMessages.entries()) {
      if (now - value.timestamp > maxAge) {
        this.recentMessages.delete(key);
      }
    }
  }

  // =====================================================
  // REPORT SPAM
  // =====================================================

  /**
   * Report a message as spam
   * @param {string} messageId - Message ID
   * @param {string} conversationId - Conversation ID
   * @param {string} reason - Reason for reporting
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async reportSpam(messageId, conversationId, reason = 'user_reported') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { data, error } = await supabase
        .from('message_spam')
        .insert({
          message_id: messageId,
          conversation_id: conversationId,
          reporter_id: user.id,
          spam_type: 'user_reported',
          spam_reason: reason,
          confidence_score: 1.0, // User reported = 100% confidence
          status: 'flagged',
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate
        if (error.code === '23505') {
          return { success: true, message: 'Tin nhắn đã được báo cáo' };
        }
        throw error;
      }

      // Mark message as spam
      await supabase
        .from('messages')
        .update({ is_spam: true })
        .eq('id', messageId);

      console.log('[SpamDetectionService] Message reported as spam:', messageId);
      return { success: true, data };

    } catch (error) {
      console.error('[SpamDetectionService] reportSpam error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Auto-flag a message as spam
   * Called during message processing if detection confidence is high
   * @param {string} messageId - Message ID
   * @param {string} conversationId - Conversation ID
   * @param {number} confidence - Detection confidence
   * @param {string[]} reasons - Detection reasons
   * @returns {Promise<{success: boolean}>}
   */
  async autoFlagSpam(messageId, conversationId, confidence, reasons) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      await supabase
        .from('message_spam')
        .insert({
          message_id: messageId,
          conversation_id: conversationId,
          reporter_id: user.id,
          spam_type: 'auto_detected',
          spam_reason: reasons.join(', '),
          confidence_score: confidence,
          status: 'flagged',
        });

      // Mark message
      await supabase
        .from('messages')
        .update({ is_spam: true })
        .eq('id', messageId);

      console.log('[SpamDetectionService] Message auto-flagged:', messageId, 'confidence:', confidence);
      return { success: true };

    } catch (error) {
      console.error('[SpamDetectionService] autoFlagSpam error:', error);
      return { success: false };
    }
  }

  // =====================================================
  // GET SPAM MESSAGES
  // =====================================================

  /**
   * Get spam messages for current user
   * @param {number} limit - Number of messages to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} List of spam messages
   */
  async getSpamMessages(limit = 50, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_spam_messages', {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('[SpamDetectionService] getSpamMessages error:', error);
      return [];
    }
  }

  /**
   * Get count of spam messages
   * @returns {Promise<number>}
   */
  async getSpamMessagesCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('message_spam')
        .select('*', { count: 'exact', head: true })
        .eq('reporter_id', user.id)
        .eq('status', 'flagged');

      if (error) throw error;
      return count || 0;

    } catch (error) {
      console.error('[SpamDetectionService] getSpamMessagesCount error:', error);
      return 0;
    }
  }

  // =====================================================
  // DISMISS / DELETE
  // =====================================================

  /**
   * Dismiss a spam report (not spam) - alias for markNotSpam
   * @param {string} spamId - Spam record ID or message ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async markNotSpam(spamId) {
    return this.dismissSpam(spamId);
  }

  /**
   * Dismiss a spam report (not spam)
   * @param {string} messageId - Message ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async dismissSpam(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Update spam report status
      const { error: spamError } = await supabase
        .from('message_spam')
        .update({ status: 'dismissed' })
        .eq('message_id', messageId)
        .eq('reporter_id', user.id);

      if (spamError) throw spamError;

      // Remove spam flag from message
      await supabase
        .from('messages')
        .update({ is_spam: false })
        .eq('id', messageId);

      console.log('[SpamDetectionService] Spam dismissed:', messageId);
      return { success: true };

    } catch (error) {
      console.error('[SpamDetectionService] dismissSpam error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a spam message permanently
   * @param {string} messageId - Message ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteSpamMessage(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Soft delete the message
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) throw error;

      // Update spam report status
      await supabase
        .from('message_spam')
        .update({ status: 'confirmed' })
        .eq('message_id', messageId)
        .eq('reporter_id', user.id);

      console.log('[SpamDetectionService] Spam deleted:', messageId);
      return { success: true };

    } catch (error) {
      console.error('[SpamDetectionService] deleteSpamMessage error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete all spam messages
   * @returns {Promise<{success: boolean, count?: number, error?: string}>}
   */
  async deleteAllSpam() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Get all spam message IDs
      const { data: spamReports, error: fetchError } = await supabase
        .from('message_spam')
        .select('message_id')
        .eq('reporter_id', user.id)
        .eq('status', 'flagged');

      if (fetchError) throw fetchError;

      if (!spamReports || spamReports.length === 0) {
        return { success: true, count: 0 };
      }

      const messageIds = spamReports.map(r => r.message_id);

      // Soft delete all spam messages
      await supabase
        .from('messages')
        .update({ is_deleted: true })
        .in('id', messageIds);

      // Update spam reports
      await supabase
        .from('message_spam')
        .update({ status: 'confirmed' })
        .eq('reporter_id', user.id)
        .eq('status', 'flagged');

      console.log('[SpamDetectionService] All spam deleted, count:', messageIds.length);
      return { success: true, count: messageIds.length };

    } catch (error) {
      console.error('[SpamDetectionService] deleteAllSpam error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // BLOCK SPAM SENDER
  // =====================================================

  /**
   * Block the sender of a spam message
   * @param {string} messageId - Message ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async blockSpamSender(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Get message to find sender
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('id', messageId)
        .single();

      if (msgError) throw msgError;
      if (!message) throw new Error('Tin nhắn không tồn tại');

      // Block the sender
      const { error: blockError } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: message.sender_id,
          reason: 'Blocked for spam',
        });

      if (blockError && blockError.code !== '23505') {
        throw blockError;
      }

      // Delete the spam message
      await this.deleteSpamMessage(messageId);

      console.log('[SpamDetectionService] Spam sender blocked:', message.sender_id);
      return { success: true };

    } catch (error) {
      console.error('[SpamDetectionService] blockSpamSender error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  /**
   * Cleanup
   */
  cleanup() {
    this.recentMessages.clear();
  }
}

// Export singleton instance
export const spamDetectionService = new SpamDetectionService();
export default spamDetectionService;
