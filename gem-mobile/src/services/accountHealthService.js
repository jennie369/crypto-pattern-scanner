/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACCOUNT HEALTH SERVICE
 * ROI Proof System - Phase A
 * Manages account health snapshots, burn events, and health status tracking
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEALTH_CACHE_KEY = '@gem_account_health_cache';
const HEALTH_CACHE_TTL = 60000; // 1 minute

/**
 * Health level thresholds and configuration
 */
export const HEALTH_LEVELS = {
  healthy: { min: 80, max: Infinity },
  warning: { min: 50, max: 79.99 },
  danger: { min: 10, max: 49.99 },
  burned: { min: 3, max: 9.99 },
  wiped: { min: 0, max: 2.99 },
};

/**
 * Health configuration with display properties
 */
export const HEALTH_CONFIG = {
  healthy: {
    label: 'Khỏe mạnh',
    labelShort: 'Khỏe',
    description: 'Tài khoản trong tình trạng tốt',
    icon: 'ShieldCheck',
    color: '#3AF7A6', // success
    bgColor: 'rgba(58, 247, 166, 0.15)',
    borderColor: 'rgba(58, 247, 166, 0.3)',
    priority: 'low',
  },
  warning: {
    label: 'Cảnh báo',
    labelShort: 'Cảnh báo',
    description: 'Cần chú ý quản lý vốn',
    icon: 'AlertTriangle',
    color: '#FFB800', // warning
    bgColor: 'rgba(255, 184, 0, 0.15)',
    borderColor: 'rgba(255, 184, 0, 0.3)',
    priority: 'medium',
  },
  danger: {
    label: 'Nguy hiểm',
    labelShort: 'Nguy hiểm',
    description: 'Tài khoản đang trong tình trạng nguy hiểm',
    icon: 'AlertOctagon',
    color: '#FF6B6B', // error
    bgColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
    priority: 'high',
  },
  burned: {
    label: 'Cháy TK',
    labelShort: 'Cháy',
    description: 'Tài khoản bị cháy nghiêm trọng',
    icon: 'Flame',
    color: '#FF4444',
    bgColor: 'rgba(255, 68, 68, 0.2)',
    borderColor: 'rgba(255, 68, 68, 0.4)',
    priority: 'critical',
  },
  wiped: {
    label: 'Xóa sổ',
    labelShort: 'Xóa sổ',
    description: 'Tài khoản đã mất gần như toàn bộ vốn',
    icon: 'Skull',
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.2)',
    borderColor: 'rgba(220, 38, 38, 0.4)',
    priority: 'critical',
  },
};

/**
 * Status order for comparison
 */
const STATUS_ORDER = ['wiped', 'burned', 'danger', 'warning', 'healthy'];

class AccountHealthService {
  // Cache
  cachedHealth = null;
  lastFetch = null;

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Initialize service - load cached data
   */
  async initialize() {
    try {
      const cached = await AsyncStorage.getItem(HEALTH_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < HEALTH_CACHE_TTL) {
          this.cachedHealth = parsed.data;
          this.lastFetch = parsed.timestamp;
        }
      }
      console.log('[AccountHealthService] Initialized');
    } catch (error) {
      console.error('[AccountHealthService] Initialize error:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GET HEALTH DATA
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get latest health snapshot for a user
   * @param {string} userId - User ID
   * @param {boolean} forceRefresh - Force refresh from server
   */
  async getLatestSnapshot(userId, forceRefresh = false) {
    try {
      if (!userId) {
        console.warn('[AccountHealthService] getLatestSnapshot: No userId provided');
        return { success: false, error: 'No user ID' };
      }

      // Return cache if fresh
      if (!forceRefresh && this.cachedHealth && this.lastFetch) {
        if (Date.now() - this.lastFetch < HEALTH_CACHE_TTL) {
          return { success: true, data: this.cachedHealth, fromCache: true };
        }
      }

      const { data, error } = await supabase
        .from('account_health_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      const snapshot = data || this.getDefaultSnapshot(userId);
      const enriched = this.enrichSnapshot(snapshot);

      // Cache
      this.cachedHealth = enriched;
      this.lastFetch = Date.now();
      await AsyncStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({
        data: enriched,
        timestamp: Date.now(),
      }));

      return { success: true, data: enriched };
    } catch (error) {
      console.error('[AccountHealthService] getLatestSnapshot error:', error);

      if (this.cachedHealth) {
        return { success: true, data: this.cachedHealth, fromCache: true };
      }

      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Get health history for a user
   * @param {string} userId - User ID
   * @param {number} days - Number of days to fetch
   */
  async getHealthHistory(userId, days = 30) {
    try {
      if (!userId) {
        return { success: false, error: 'No user ID', data: [] };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('account_health_snapshots')
        .select('snapshot_date, balance, balance_pct, health_status, daily_change_pct')
        .eq('user_id', userId)
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      const history = (data || []).map(item => ({
        ...item,
        display: this.getHealthDisplay(item.health_status),
      }));

      return { success: true, data: history };
    } catch (error) {
      console.error('[AccountHealthService] getHealthHistory error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: [] };
    }
  }

  /**
   * Get health summary using RPC function
   * @param {string} userId - User ID
   * @param {number} days - Number of days
   */
  async getHealthSummary(userId, days = 30) {
    try {
      if (!userId) {
        return { success: false, error: 'No user ID' };
      }

      const { data, error } = await supabase.rpc('get_user_health_summary', {
        p_user_id: userId,
        p_days: days,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[AccountHealthService] getHealthSummary error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Get burn events for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum events to return
   */
  async getBurnEvents(userId, limit = 50) {
    try {
      if (!userId) {
        return { success: false, error: 'No user ID', data: [] };
      }

      const { data, error } = await supabase.rpc('get_user_burn_events', {
        p_user_id: userId,
        p_limit: limit,
      });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('[AccountHealthService] getBurnEvents error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HEALTH STATUS HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calculate health status from balance percentage
   * @param {number} balancePct - Balance as percentage of initial
   */
  calculateHealthStatus(balancePct) {
    const pct = balancePct ?? 0;

    if (pct >= 80) return 'healthy';
    if (pct >= 50) return 'warning';
    if (pct >= 10) return 'danger';
    if (pct >= 3) return 'burned';
    return 'wiped';
  }

  /**
   * Get display configuration for a health status
   * @param {string} status - Health status
   */
  getHealthDisplay(status) {
    const config = HEALTH_CONFIG[status];
    if (!config) {
      return HEALTH_CONFIG.healthy; // Default
    }
    return {
      ...config,
      status,
    };
  }

  /**
   * Get status order for comparison (higher = healthier)
   * @param {string} status - Health status
   */
  getStatusOrder(status) {
    const index = STATUS_ORDER.indexOf(status);
    return index >= 0 ? index : 4; // Default to healthy
  }

  /**
   * Compare two health statuses
   * @param {string} status1 - First status
   * @param {string} status2 - Second status
   * @returns {number} -1 if status1 worse, 0 if equal, 1 if status1 better
   */
  compareStatus(status1, status2) {
    const order1 = this.getStatusOrder(status1);
    const order2 = this.getStatusOrder(status2);

    if (order1 < order2) return -1;
    if (order1 > order2) return 1;
    return 0;
  }

  /**
   * Check if status is critical (burned or wiped)
   * @param {string} status - Health status
   */
  isCritical(status) {
    return status === 'burned' || status === 'wiped';
  }

  /**
   * Check if status requires attention (danger, burned, or wiped)
   * @param {string} status - Health status
   */
  needsAttention(status) {
    return status === 'danger' || status === 'burned' || status === 'wiped';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DATA ENRICHMENT
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Enrich snapshot with display data
   * @param {Object} snapshot - Raw snapshot data
   */
  enrichSnapshot(snapshot) {
    if (!snapshot) return null;

    const status = snapshot.health_status || this.calculateHealthStatus(snapshot.balance_pct);
    const display = this.getHealthDisplay(status);

    return {
      ...snapshot,
      health_status: status,
      display,
      balancePctFormatted: this.formatPercentage(snapshot.balance_pct),
      dailyChangePctFormatted: this.formatPercentage(snapshot.daily_change_pct, true),
      isImproving: (snapshot.daily_change_pct ?? 0) > 0,
      isDeclining: (snapshot.daily_change_pct ?? 0) < 0,
      isCritical: this.isCritical(status),
      needsAttention: this.needsAttention(status),
    };
  }

  /**
   * Get default snapshot for new users
   * @param {string} userId - User ID
   */
  getDefaultSnapshot(userId) {
    return {
      user_id: userId,
      snapshot_date: new Date().toISOString().split('T')[0],
      balance: 10000,
      initial_balance: 10000,
      balance_pct: 100,
      health_status: 'healthy',
      daily_change: 0,
      daily_change_pct: 0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FORMATTING HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Format percentage for display
   * @param {number} value - Percentage value
   * @param {boolean} showSign - Show + for positive values
   */
  formatPercentage(value, showSign = false) {
    if (value == null) return '0%';

    const formatted = Math.abs(value).toFixed(2);
    if (showSign && value > 0) return `+${formatted}%`;
    if (value < 0) return `-${formatted}%`;
    return `${formatted}%`;
  }

  /**
   * Format balance for display
   * @param {number} value - Balance value
   */
  formatBalance(value) {
    if (value == null) return '$0';

    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (absValue >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  }

  /**
   * Get health message based on status
   * @param {string} status - Health status
   * @param {number} balancePct - Balance percentage
   */
  getHealthMessage(status, balancePct) {
    const pct = Math.round(balancePct ?? 100);

    switch (status) {
      case 'healthy':
        return `Tài khoản khỏe mạnh với ${pct}% vốn.`;
      case 'warning':
        return `Cần chú ý! Còn ${pct}% vốn ban đầu.`;
      case 'danger':
        return `Cảnh báo! Chỉ còn ${pct}% vốn. Hãy xem xét chiến lược.`;
      case 'burned':
        return `Tài khoản bị cháy nghiêm trọng! Chỉ còn ${pct}% vốn.`;
      case 'wiped':
        return `Tài khoản gần như mất trắng! Chỉ còn ${pct}% vốn.`;
      default:
        return `Còn ${pct}% vốn ban đầu.`;
    }
  }

  /**
   * Get recovery suggestion based on status
   * @param {string} status - Health status
   */
  getRecoverySuggestion(status) {
    switch (status) {
      case 'warning':
        return 'Giảm kích thước lệnh và tập trung vào các setup chất lượng cao.';
      case 'danger':
        return 'Dừng trading ngay. Xem lại nhật ký và tham khảo ý kiến từ Sư phụ AI.';
      case 'burned':
        return 'Cần nghỉ ngơi và học lại từ đầu. Liên hệ hỗ trợ nếu cần.';
      case 'wiped':
        return 'Tài khoản cần được khởi động lại. Hãy liên hệ với chúng tôi để được hỗ trợ.';
      default:
        return 'Tiếp tục duy trì kỷ luật trading và quản lý rủi ro tốt.';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Clear cache (for logout or manual refresh)
   */
  async clearCache() {
    this.cachedHealth = null;
    this.lastFetch = null;
    await AsyncStorage.removeItem(HEALTH_CACHE_KEY);
    console.log('[AccountHealthService] Cache cleared');
  }

  /**
   * Invalidate cache to force refresh on next fetch
   */
  invalidateCache() {
    this.lastFetch = null;
  }
}

export const accountHealthService = new AccountHealthService();
export default accountHealthService;
