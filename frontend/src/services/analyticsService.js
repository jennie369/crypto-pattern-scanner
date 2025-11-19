/**
 * Analytics Service for Chatbot
 * Tracks usage statistics and patterns
 */

class AnalyticsService {
  constructor() {
    this.storageKey = 'gem-chatbot-analytics';
  }

  /**
   * Get all analytics data
   */
  getAnalytics() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : this.initializeAnalytics();
    } catch (error) {
      console.error('Failed to load analytics:', error);
      return this.initializeAnalytics();
    }
  }

  /**
   * Initialize analytics structure
   */
  initializeAnalytics() {
    return {
      totalMessages: 0,
      totalSessions: 0,
      messagesByType: {
        user: 0,
        bot: 0,
        system: 0
      },
      messagesByMode: {
        chat: 0,
        iching: 0,
        tarot: 0
      },
      dailyUsage: {},
      weeklyUsage: {},
      popularQuestions: [],
      averageSessionLength: 0,
      totalTimeSpent: 0,
      lastUpdated: new Date().toISOString(),
      firstSession: new Date().toISOString()
    };
  }

  /**
   * Track a new message
   */
  trackMessage(message, mode = 'chat') {
    const analytics = this.getAnalytics();

    // Increment total messages
    analytics.totalMessages++;

    // Track by type
    analytics.messagesByType[message.type] = (analytics.messagesByType[message.type] || 0) + 1;

    // Track by mode
    analytics.messagesByMode[mode] = (analytics.messagesByMode[mode] || 0) + 1;

    // Track daily usage
    const today = new Date().toISOString().split('T')[0];
    analytics.dailyUsage[today] = (analytics.dailyUsage[today] || 0) + 1;

    // Track weekly usage
    const week = this.getWeekNumber(new Date());
    analytics.weeklyUsage[week] = (analytics.weeklyUsage[week] || 0) + 1;

    // Track popular questions (user messages only)
    if (message.type === 'user') {
      this.trackPopularQuestion(analytics, message.content);
    }

    analytics.lastUpdated = new Date().toISOString();
    this.saveAnalytics(analytics);
  }

  /**
   * Track popular questions
   */
  trackPopularQuestion(analytics, question) {
    // Find existing question or create new
    const existing = analytics.popularQuestions.find(q =>
      q.text.toLowerCase() === question.toLowerCase()
    );

    if (existing) {
      existing.count++;
    } else {
      analytics.popularQuestions.push({
        text: question.substring(0, 100), // Limit length
        count: 1,
        lastAsked: new Date().toISOString()
      });
    }

    // Sort by count and keep top 20
    analytics.popularQuestions.sort((a, b) => b.count - a.count);
    analytics.popularQuestions = analytics.popularQuestions.slice(0, 20);
  }

  /**
   * Track session start
   */
  startSession() {
    const analytics = this.getAnalytics();
    analytics.totalSessions++;

    const sessionStart = Date.now();
    sessionStorage.setItem('gem-session-start', sessionStart.toString());

    this.saveAnalytics(analytics);
    return sessionStart;
  }

  /**
   * Track session end
   */
  endSession() {
    const sessionStart = sessionStorage.getItem('gem-session-start');
    if (!sessionStart) return;

    const sessionEnd = Date.now();
    const duration = sessionEnd - parseInt(sessionStart);

    const analytics = this.getAnalytics();
    analytics.totalTimeSpent += duration;
    analytics.averageSessionLength = analytics.totalTimeSpent / analytics.totalSessions;

    sessionStorage.removeItem('gem-session-start');
    this.saveAnalytics(analytics);
  }

  /**
   * Get usage stats for last N days
   */
  getUsageByDays(days = 7) {
    const analytics = this.getAnalytics();
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      result.push({
        date: dateStr,
        count: analytics.dailyUsage[dateStr] || 0,
        label: this.formatDateLabel(date, i === 0)
      });
    }

    return result;
  }

  /**
   * Get usage stats by mode
   */
  getUsageByMode() {
    const analytics = this.getAnalytics();
    return [
      { mode: 'Chat', count: analytics.messagesByMode.chat || 0, color: '#00D9FF' },
      { mode: 'I Ching', count: analytics.messagesByMode.iching || 0, color: '#FFBD59' },
      { mode: 'Tarot', count: analytics.messagesByMode.tarot || 0, color: '#8B5CF6' }
    ];
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const analytics = this.getAnalytics();
    const usageLast7Days = this.getUsageByDays(7);
    const totalLast7Days = usageLast7Days.reduce((sum, day) => sum + day.count, 0);
    const avgPerDay = (totalLast7Days / 7).toFixed(1);

    return {
      totalMessages: analytics.totalMessages,
      totalSessions: analytics.totalSessions,
      averageSessionLength: this.formatDuration(analytics.averageSessionLength),
      totalTimeSpent: this.formatDuration(analytics.totalTimeSpent),
      messagesLast7Days: totalLast7Days,
      averagePerDay: avgPerDay,
      mostUsedMode: this.getMostUsedMode(analytics),
      topQuestion: analytics.popularQuestions[0]?.text || 'N/A',
      firstSession: analytics.firstSession,
      lastUpdated: analytics.lastUpdated
    };
  }

  /**
   * Get most used mode
   */
  getMostUsedMode(analytics) {
    const modes = analytics.messagesByMode;
    const entries = Object.entries(modes);

    if (entries.length === 0) return 'N/A';

    const max = entries.reduce((prev, curr) =>
      curr[1] > prev[1] ? curr : prev
    );

    return max[0].charAt(0).toUpperCase() + max[0].slice(1);
  }

  /**
   * Format duration in ms to readable string
   */
  formatDuration(ms) {
    if (!ms || ms === 0) return '0s';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format date label for charts
   */
  formatDateLabel(date, isToday) {
    if (isToday) return 'Today';

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Get week number
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Save analytics to localStorage
   */
  saveAnalytics(analytics) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  /**
   * Reset all analytics
   */
  resetAnalytics() {
    const confirm = window.confirm('Bạn có chắc muốn xóa toàn bộ analytics data?');
    if (confirm) {
      localStorage.removeItem(this.storageKey);
      return this.initializeAnalytics();
    }
    return this.getAnalytics();
  }

  /**
   * Export analytics data
   */
  exportAnalytics() {
    const analytics = this.getAnalytics();
    const summary = this.getSummary();

    const exportData = {
      ...analytics,
      summary
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gem-analytics-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
