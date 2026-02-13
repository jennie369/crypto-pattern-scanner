/**
 * TOOLTIP MANAGER SERVICE
 * Manages tooltip visibility and state persistence
 * Ensures new feature tooltips are shown once per user
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key
const STORAGE_KEY = '@gem_tooltips_seen';

// Tooltip configurations
const TOOLTIP_CONFIGS = {
  // Emotion detection tooltips
  'emotion-tip-1': {
    id: 'emotion-tip-1',
    title: 'Phát hiện cảm xúc',
    content: 'GEM Master giờ đây có thể nhận biết cảm xúc của bạn và điều chỉnh phản hồi cho phù hợp.',
    feature: 'emotion_detection',
    position: 'bottom',
    showOnce: true,
    priority: 1,
  },
  'emotion-frequency-tip': {
    id: 'emotion-frequency-tip',
    title: 'Tần số cảm xúc',
    content: 'Tần số Hz hiển thị mức năng lượng cảm xúc của bạn theo phương pháp GEM.',
    feature: 'emotion_detection',
    position: 'top',
    showOnce: true,
    priority: 2,
  },

  // Streak tooltips
  'streak-tip-1': {
    id: 'streak-tip-1',
    title: 'Streak đã bắt đầu!',
    content: 'Mỗi ngày bạn quay lại, streak sẽ tăng. Duy trì để mở khóa huy hiệu!',
    feature: 'gamification',
    position: 'bottom',
    showOnce: true,
    priority: 1,
  },
  'streak-tip-2': {
    id: 'streak-tip-2',
    title: 'Streak sắp mất!',
    content: 'Đừng để streak biến mất! Hoàn thành hoạt động hôm nay để duy trì.',
    feature: 'gamification',
    position: 'top',
    showOnce: false, // Can show multiple times
    cooldownHours: 24,
    priority: 3,
  },

  // Ritual tooltips
  'ritual-tip-1': {
    id: 'ritual-tip-1',
    title: 'Ritual của bạn',
    content: 'Tạo và theo dõi các nghi thức hàng ngày để nâng cao tần số năng lượng.',
    feature: 'rituals',
    position: 'bottom',
    showOnce: true,
    priority: 1,
  },
  'ritual-complete-tip': {
    id: 'ritual-complete-tip',
    title: 'Hoàn thành ritual',
    content: 'Nhấn vào ritual để đánh dấu hoàn thành và ghi nhận tâm trạng.',
    feature: 'rituals',
    position: 'right',
    showOnce: true,
    priority: 2,
  },

  // Greeting tooltips
  'greeting-tip-1': {
    id: 'greeting-tip-1',
    title: 'Lời chào cá nhân hóa',
    content: 'GEM Master sẽ nhớ bạn và theo dõi hành trình chuyển hóa của bạn.',
    feature: 'personalization',
    position: 'bottom',
    showOnce: true,
    priority: 1,
  },

  // Proactive message tooltips
  'proactive-tip-1': {
    id: 'proactive-tip-1',
    title: 'Tin nhắn từ GEM',
    content: 'GEM Master sẽ chủ động gửi insights và nhắc nhở để hỗ trợ hành trình của bạn.',
    feature: 'proactive_messages',
    position: 'top',
    showOnce: true,
    priority: 1,
  },

  // Gamification tooltips
  'gamification-tip-1': {
    id: 'gamification-tip-1',
    title: 'Level & Huy hiệu',
    content: 'Hoàn thành ritual và duy trì streak để tăng XP và mở khóa huy hiệu!',
    feature: 'gamification',
    position: 'bottom',
    showOnce: true,
    priority: 1,
  },
  'level-up-tip': {
    id: 'level-up-tip',
    title: 'Lên level!',
    content: 'Chúc mừng! Bạn đã đạt level mới. Tiếp tục phát triển nhé!',
    feature: 'gamification',
    position: 'center',
    showOnce: false,
    cooldownHours: 168, // 1 week
    priority: 1,
  },

  // Memory tooltips
  'memory-tip-1': {
    id: 'memory-tip-1',
    title: 'GEM nhớ bạn',
    content: 'GEM Master lưu giữ những điều quan trọng từ cuộc trò chuyện để hiểu bạn hơn.',
    feature: 'memory',
    position: 'top',
    showOnce: true,
    priority: 1,
  },

  // New feature announcement
  'new-features-v2': {
    id: 'new-features-v2',
    title: 'Tính năng mới!',
    content: 'GEM Master đã được nâng cấp với Memory, Emotion Detection, và Gamification!',
    feature: 'general',
    position: 'center',
    showOnce: true,
    priority: 0, // Highest priority
    isAnnouncement: true,
  },
};

// State
let _tooltipsSeen = {};
let _initialized = false;
let _lastShownTimestamps = {};

class TooltipManager {
  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Initialize tooltip manager
   * Loads seen tooltips from storage
   */
  async init() {
    if (_initialized) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        _tooltipsSeen = parsed.seen || {};
        _lastShownTimestamps = parsed.timestamps || {};
      }
      _initialized = true;
    } catch (error) {
      console.error('[TooltipManager] init error:', error);
      _tooltipsSeen = {};
      _lastShownTimestamps = {};
      _initialized = true;
    }
  }

  /**
   * Ensure manager is initialized
   * @private
   */
  async _ensureInit() {
    if (!_initialized) {
      await this.init();
    }
  }

  // ============================================================
  // TOOLTIP VISIBILITY
  // ============================================================

  /**
   * Check if tooltip should be shown
   * @param {string} tooltipId - Tooltip ID
   * @returns {Promise<boolean>} Should show
   */
  async shouldShow(tooltipId) {
    await this._ensureInit();

    const config = TOOLTIP_CONFIGS[tooltipId];
    if (!config) return false;

    // Check if seen
    if (config.showOnce && _tooltipsSeen[tooltipId]) {
      return false;
    }

    // Check cooldown
    if (config.cooldownHours && _lastShownTimestamps[tooltipId]) {
      const lastShown = new Date(_lastShownTimestamps[tooltipId]);
      const cooldownMs = config.cooldownHours * 60 * 60 * 1000;
      if (Date.now() - lastShown.getTime() < cooldownMs) {
        return false;
      }
    }

    return true;
  }

  /**
   * Mark tooltip as seen
   * @param {string} tooltipId - Tooltip ID
   */
  async markSeen(tooltipId) {
    await this._ensureInit();

    _tooltipsSeen[tooltipId] = true;
    _lastShownTimestamps[tooltipId] = new Date().toISOString();

    await this._persist();
  }

  /**
   * Get tooltip configuration
   * @param {string} tooltipId - Tooltip ID
   * @returns {Object|null} Tooltip config
   */
  getTooltipConfig(tooltipId) {
    return TOOLTIP_CONFIGS[tooltipId] || null;
  }

  /**
   * Get all tooltips for a feature
   * @param {string} feature - Feature name
   * @returns {Promise<Array>} Tooltips to show
   */
  async getTooltipsForFeature(feature) {
    await this._ensureInit();

    const tooltips = Object.values(TOOLTIP_CONFIGS)
      .filter(t => t.feature === feature)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));

    const toShow = [];
    for (const tooltip of tooltips) {
      if (await this.shouldShow(tooltip.id)) {
        toShow.push(tooltip);
      }
    }

    return toShow;
  }

  /**
   * Get next tooltip to show (highest priority unseen)
   * @returns {Promise<Object|null>} Next tooltip or null
   */
  async getNextTooltip() {
    await this._ensureInit();

    const allTooltips = Object.values(TOOLTIP_CONFIGS)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));

    for (const tooltip of allTooltips) {
      if (await this.shouldShow(tooltip.id)) {
        return tooltip;
      }
    }

    return null;
  }

  /**
   * Get announcement tooltips (new feature announcements)
   * @returns {Promise<Array>} Announcement tooltips
   */
  async getAnnouncements() {
    await this._ensureInit();

    const announcements = Object.values(TOOLTIP_CONFIGS)
      .filter(t => t.isAnnouncement)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));

    const toShow = [];
    for (const announcement of announcements) {
      if (await this.shouldShow(announcement.id)) {
        toShow.push(announcement);
      }
    }

    return toShow;
  }

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  /**
   * Persist state to storage
   * @private
   */
  async _persist() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        seen: _tooltipsSeen,
        timestamps: _lastShownTimestamps,
      }));
    } catch (error) {
      console.error('[TooltipManager] _persist error:', error);
    }
  }

  /**
   * Reset all tooltips (show all again)
   */
  async resetAll() {
    _tooltipsSeen = {};
    _lastShownTimestamps = {};
    await this._persist();
  }

  /**
   * Reset a specific tooltip
   * @param {string} tooltipId - Tooltip ID
   */
  async resetTooltip(tooltipId) {
    delete _tooltipsSeen[tooltipId];
    delete _lastShownTimestamps[tooltipId];
    await this._persist();
  }

  /**
   * Reset tooltips for a feature
   * @param {string} feature - Feature name
   */
  async resetFeature(feature) {
    const tooltips = Object.values(TOOLTIP_CONFIGS).filter(t => t.feature === feature);
    for (const tooltip of tooltips) {
      delete _tooltipsSeen[tooltip.id];
      delete _lastShownTimestamps[tooltip.id];
    }
    await this._persist();
  }

  /**
   * Get seen status for all tooltips
   * @returns {Promise<Object>} Seen status
   */
  async getSeenStatus() {
    await this._ensureInit();
    return { ..._tooltipsSeen };
  }

  /**
   * Check if any tooltips are unseen
   * @returns {Promise<boolean>} Has unseen
   */
  async hasUnseenTooltips() {
    await this._ensureInit();

    for (const tooltipId of Object.keys(TOOLTIP_CONFIGS)) {
      if (await this.shouldShow(tooltipId)) {
        return true;
      }
    }

    return false;
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Get all tooltip configs
   * @returns {Object} All configs
   */
  getAllConfigs() {
    return { ...TOOLTIP_CONFIGS };
  }

  /**
   * Get tooltip IDs by feature
   * @param {string} feature - Feature name
   * @returns {Array} Tooltip IDs
   */
  getTooltipIdsByFeature(feature) {
    return Object.entries(TOOLTIP_CONFIGS)
      .filter(([_, config]) => config.feature === feature)
      .map(([id]) => id);
  }

  /**
   * Manually trigger a tooltip (for testing)
   * @param {string} tooltipId - Tooltip ID
   * @returns {Object|null} Tooltip config
   */
  async triggerTooltip(tooltipId) {
    const config = TOOLTIP_CONFIGS[tooltipId];
    if (config) {
      await this.resetTooltip(tooltipId);
      return config;
    }
    return null;
  }

  /**
   * Check if feature onboarding is complete
   * @param {string} feature - Feature name
   * @returns {Promise<boolean>} Is complete
   */
  async isFeatureOnboardingComplete(feature) {
    await this._ensureInit();

    const featureTooltips = this.getTooltipIdsByFeature(feature)
      .filter(id => TOOLTIP_CONFIGS[id]?.showOnce);

    for (const tooltipId of featureTooltips) {
      if (!_tooltipsSeen[tooltipId]) {
        return false;
      }
    }

    return true;
  }
}

// Export singleton instance
export const tooltipManager = new TooltipManager();
export default tooltipManager;

// Export configs
export { TOOLTIP_CONFIGS };
