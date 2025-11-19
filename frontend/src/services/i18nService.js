/**
 * i18n Service
 * Internationalization for English/Vietnamese
 */

const translations = {
  en: {
    // Header
    'chatbot.title': 'Gem Master Chatbot',
    'chatbot.subtitle.chat': 'Trading & Energy Consulting',
    'chatbot.subtitle.iching': 'I Ching Wisdom',
    'chatbot.subtitle.tarot': 'Tarot Reading',

    // Quick Select
    'quick.iching': 'I Ching',
    'quick.tarot': 'Tarot',
    'quick.crystal': 'Crystal',
    'quick.trading': 'Trading',
    'quick.manifest': 'Manifest',
    'quick.tier': 'TIER',

    // Actions
    'action.send': 'Send',
    'action.clear': 'Clear Chat',
    'action.export': 'Export',
    'action.share': 'Share',
    'action.print': 'Print',
    'action.analytics': 'Analytics',
    'action.history': 'History',
    'action.settings': 'Settings',

    // Export
    'export.text': 'Export as Text',
    'export.markdown': 'Export as Markdown',
    'export.json': 'Export as JSON',

    // Analytics
    'analytics.title': 'Analytics Dashboard',
    'analytics.totalMessages': 'Total Messages',
    'analytics.totalSessions': 'Total Sessions',
    'analytics.avgSession': 'Avg Session',
    'analytics.last7days': 'Last 7 Days',
    'analytics.dailyUsage': 'Daily Usage (Last 7 Days)',
    'analytics.modeUsage': 'Usage by Mode',
    'analytics.topQuestions': 'Top Questions',
    'analytics.exportData': 'Export Data',
    'analytics.refresh': 'Refresh',
    'analytics.reset': 'Reset Analytics',

    // Settings
    'settings.title': 'Settings & Preferences',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.fontSize': 'Font Size',
    'settings.sound': 'Sound',
    'settings.notifications': 'Notifications',
    'settings.chat': 'Chat Preferences',
    'settings.autoSend': 'Auto-send Quick Select',
    'settings.enterToSend': 'Enter to Send',
    'settings.timestamps': 'Show Timestamps',
    'settings.compactMode': 'Compact Mode',
    'settings.templates': 'Custom Templates',
    'settings.reset': 'Reset to Defaults',

    // Theme
    'theme.dark': 'Dark',
    'theme.light': 'Light',

    // Font Size
    'fontSize.small': 'Small',
    'fontSize.medium': 'Medium',
    'fontSize.large': 'Large',

    // Messages
    'message.loading': 'Gem Master is thinking...',
    'message.error': 'An error occurred. Please try again.',
    'message.welcome': 'Welcome to Gem Master Chatbot! I can help you with:\n\n**I Ching** - Ancient wisdom guidance\n**Tarot** - Card readings for trading and life\n**Chat** - Trading, energy, and methodology advice\n\nWhat would you like to start with?',

    // Support
    'support.title': 'Need Help?',
    'support.chat': 'Chat via',

    // Common
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.noResults': 'No results found',
    'common.error': 'Error'
  },

  vi: {
    // Header
    'chatbot.title': 'Gem Master Chatbot',
    'chatbot.subtitle.chat': 'Tư vấn trading và năng lượng',
    'chatbot.subtitle.iching': 'Nhận lời khuyên từ Kinh Dịch',
    'chatbot.subtitle.tarot': 'Đọc bài Tarot',

    // Quick Select
    'quick.iching': 'I Ching',
    'quick.tarot': 'Tarot',
    'quick.crystal': 'Crystal',
    'quick.trading': 'Trading',
    'quick.manifest': 'Manifest',
    'quick.tier': 'TIER',

    // Actions
    'action.send': 'Gửi',
    'action.clear': 'Xóa Chat',
    'action.export': 'Export',
    'action.share': 'Chia sẻ',
    'action.print': 'In',
    'action.analytics': 'Analytics',
    'action.history': 'Lịch Sử',
    'action.settings': 'Cài Đặt',

    // Export
    'export.text': 'Export as Text',
    'export.markdown': 'Export as Markdown',
    'export.json': 'Export as JSON',

    // Analytics
    'analytics.title': 'Analytics Dashboard',
    'analytics.totalMessages': 'Tổng Tin Nhắn',
    'analytics.totalSessions': 'Tổng Phiên',
    'analytics.avgSession': 'Phiên TB',
    'analytics.last7days': '7 Ngày Qua',
    'analytics.dailyUsage': 'Sử Dụng Theo Ngày (7 Ngày)',
    'analytics.modeUsage': 'Sử Dụng Theo Chế Độ',
    'analytics.topQuestions': 'Câu Hỏi Phổ Biến',
    'analytics.exportData': 'Export Dữ Liệu',
    'analytics.refresh': 'Làm Mới',
    'analytics.reset': 'Reset Analytics',

    // Settings
    'settings.title': 'Cài Đặt & Tùy Chọn',
    'settings.appearance': 'Giao Diện',
    'settings.theme': 'Theme',
    'settings.language': 'Ngôn Ngữ',
    'settings.fontSize': 'Cỡ Chữ',
    'settings.sound': 'Âm Thanh',
    'settings.notifications': 'Thông Báo',
    'settings.chat': 'Tùy Chọn Chat',
    'settings.autoSend': 'Tự động gửi Quick Select',
    'settings.enterToSend': 'Enter để gửi',
    'settings.timestamps': 'Hiển thị giờ',
    'settings.compactMode': 'Chế độ thu gọn',
    'settings.templates': 'Mẫu Tùy Chỉnh',
    'settings.reset': 'Reset về Mặc Định',

    // Theme
    'theme.dark': 'Tối',
    'theme.light': 'Sáng',

    // Font Size
    'fontSize.small': 'Nhỏ',
    'fontSize.medium': 'Trung Bình',
    'fontSize.large': 'Lớn',

    // Messages
    'message.loading': 'Gem Master đang suy nghĩ...',
    'message.error': 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    'message.welcome': 'Chào mừng đến với Gem Master Chatbot! Tôi có thể giúp bạn với:\n\n**I Ching** - Nhận lời khuyên từ Kinh Dịch\n**Tarot** - Đọc bài Tarot về trading và cuộc sống\n**Chat** - Tư vấn về trading, năng lượng, và phương pháp\n\nBạn muốn bắt đầu với điều gì?',

    // Support
    'support.title': 'Cần hỗ trợ?',
    'support.chat': 'Chat qua',

    // Common
    'common.close': 'Đóng',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.add': 'Thêm',
    'common.search': 'Tìm kiếm',
    'common.filter': 'Lọc',
    'common.loading': 'Đang tải...',
    'common.noResults': 'Không có kết quả',
    'common.error': 'Lỗi'
  }
};

class I18nService {
  constructor() {
    this.storageKey = 'gem-language';
    this.currentLang = this.loadLanguage();
  }

  /**
   * Load language from localStorage
   */
  loadLanguage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved || 'vi'; // Default: Vietnamese
    } catch {
      return 'vi';
    }
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLang;
  }

  /**
   * Set language
   */
  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'vi') return;
    this.currentLang = lang;
    this.saveLanguage();
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  }

  /**
   * Toggle language
   */
  toggle() {
    this.currentLang = this.currentLang === 'en' ? 'vi' : 'en';
    this.saveLanguage();
    window.dispatchEvent(new CustomEvent('languageChange', { detail: this.currentLang }));
    return this.currentLang;
  }

  /**
   * Translate key
   */
  t(key, defaultText) {
    return translations[this.currentLang]?.[key] || defaultText || key;
  }

  /**
   * Save language to localStorage
   */
  saveLanguage() {
    try {
      localStorage.setItem(this.storageKey, this.currentLang);
    } catch (error) {
      console.warn('Failed to save language:', error);
    }
  }
}

// Export singleton instance
export const i18nService = new I18nService();
