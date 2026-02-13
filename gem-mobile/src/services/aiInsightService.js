/**
 * AI Insight Service - Analytics Intelligence Engine
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Trend detection (growth/decline ±20%)
 * - Anomaly detection (spikes/drops ±50% vs 7-day avg)
 * - Recommendations (UX, marketing, pricing)
 * - Predictions (churn risk, conversion opportunity)
 * - Action tracking (pending → in_progress → completed)
 *
 * Created: January 30, 2026
 */

import { supabase } from './supabase';
import {
  PRIORITY_LEVELS,
  INSIGHT_TYPES,
  ACTION_STATUS,
  EVENT_CATEGORIES,
} from './analyticsConstants';

const SERVICE_NAME = '[AIInsightService]';

// =====================================================
// CONFIGURATION
// =====================================================

const CONFIG = {
  // Trend detection thresholds
  TREND_GROWTH_THRESHOLD: 0.20, // +20% = growth
  TREND_DECLINE_THRESHOLD: -0.20, // -20% = decline

  // Anomaly detection thresholds
  ANOMALY_SPIKE_THRESHOLD: 0.50, // +50% vs avg = spike
  ANOMALY_DROP_THRESHOLD: -0.50, // -50% vs avg = drop

  // Minimum data points for analysis
  MIN_DATA_POINTS: 3,

  // Lookback periods
  TREND_LOOKBACK_DAYS: 7,
  ANOMALY_LOOKBACK_DAYS: 7,

  // Churn prediction
  CHURN_INACTIVITY_DAYS: 14,
  CHURN_DECLINE_THRESHOLD: -0.30, // 30% activity decline

  // Conversion prediction
  HIGH_ENGAGEMENT_THRESHOLD: 10, // actions per day
  FREE_USER_CONVERSION_DAYS: 7, // lookback for engagement
};

// =====================================================
// INSIGHT TEMPLATES
// =====================================================

const INSIGHT_TEMPLATES = {
  // Trend insights
  trend_growth: {
    type: INSIGHT_TYPES.TREND,
    titleTemplate: '{feature} đang tăng trưởng',
    descriptionTemplate: '{feature} tăng {percentage}% trong {period}. Đây là xu hướng tích cực.',
    recommendationTemplate: 'Cân nhắc tăng cường quảng bá {feature} để tận dụng đà tăng trưởng.',
  },
  trend_decline: {
    type: INSIGHT_TYPES.TREND,
    titleTemplate: '{feature} đang giảm',
    descriptionTemplate: '{feature} giảm {percentage}% trong {period}. Cần xem xét nguyên nhân.',
    recommendationTemplate: 'Khảo sát người dùng về {feature} và cải thiện UX nếu cần.',
  },

  // Anomaly insights
  anomaly_spike: {
    type: INSIGHT_TYPES.ANOMALY,
    titleTemplate: 'Đột biến {feature}',
    descriptionTemplate: '{feature} tăng {percentage}% so với trung bình 7 ngày. Có thể do sự kiện đặc biệt.',
    recommendationTemplate: 'Xác định nguyên nhân đột biến và cân nhắc nhân rộng nếu tích cực.',
  },
  anomaly_drop: {
    type: INSIGHT_TYPES.ANOMALY,
    titleTemplate: 'Sụt giảm đột ngột {feature}',
    descriptionTemplate: '{feature} giảm {percentage}% so với trung bình. Cần kiểm tra ngay.',
    recommendationTemplate: 'Kiểm tra lỗi kỹ thuật hoặc vấn đề UX với {feature}.',
  },

  // Recommendation insights
  rec_underused_feature: {
    type: INSIGHT_TYPES.RECOMMENDATION,
    titleTemplate: 'Tính năng chưa được khai thác',
    descriptionTemplate: '{feature} có tiềm năng nhưng chỉ {percentage}% người dùng sử dụng.',
    recommendationTemplate: 'Thêm onboarding hoặc tooltip hướng dẫn {feature} cho người dùng mới.',
  },
  rec_high_bounce: {
    type: INSIGHT_TYPES.RECOMMENDATION,
    titleTemplate: 'Tỷ lệ thoát cao tại {page}',
    descriptionTemplate: '{percentage}% người dùng rời đi từ {page} mà không tương tác.',
    recommendationTemplate: 'Cải thiện UX tại {page}: thêm CTA rõ ràng, giảm thời gian tải.',
  },
  rec_conversion_opportunity: {
    type: INSIGHT_TYPES.RECOMMENDATION,
    titleTemplate: 'Cơ hội tăng chuyển đổi',
    descriptionTemplate: '{count} người dùng free rất tích cực ({avg_actions} hành động/ngày).',
    recommendationTemplate: 'Gửi offer đặc biệt cho nhóm này để chuyển đổi sang premium.',
  },

  // Prediction insights
  pred_churn_risk: {
    type: INSIGHT_TYPES.PREDICTION,
    titleTemplate: 'Nguy cơ mất {count} người dùng',
    descriptionTemplate: '{count} người dùng có dấu hiệu sắp rời bỏ (không hoạt động {days} ngày).',
    recommendationTemplate: 'Gửi email re-engagement hoặc push notification với nội dung cá nhân hóa.',
  },
  pred_upgrade_likely: {
    type: INSIGHT_TYPES.PREDICTION,
    titleTemplate: '{count} người dùng sẵn sàng nâng cấp',
    descriptionTemplate: 'Dựa trên hành vi, {count} người dùng free có khả năng cao sẽ nâng cấp.',
    recommendationTemplate: 'Hiển thị upgrade prompt và offer giảm giá cho nhóm này.',
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const log = (...args) => {
  if (__DEV__) {
    console.log(SERVICE_NAME, ...args);
  }
};

const logError = (...args) => {
  console.error(SERVICE_NAME, ...args);
};

/**
 * Calculate percentage change
 */
const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return (current - previous) / previous;
};

/**
 * Get priority based on impact
 */
const getPriority = (change, type) => {
  const absChange = Math.abs(change);

  if (type === INSIGHT_TYPES.ANOMALY) {
    if (absChange >= 1.0) return PRIORITY_LEVELS.CRITICAL;
    if (absChange >= 0.7) return PRIORITY_LEVELS.HIGH;
    return PRIORITY_LEVELS.MEDIUM;
  }

  if (type === INSIGHT_TYPES.PREDICTION) {
    return PRIORITY_LEVELS.HIGH;
  }

  if (absChange >= 0.5) return PRIORITY_LEVELS.HIGH;
  if (absChange >= 0.3) return PRIORITY_LEVELS.MEDIUM;
  return PRIORITY_LEVELS.LOW;
};

/**
 * Fill template with values
 */
const fillTemplate = (template, values) => {
  let result = template;
  Object.entries(values).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  return result;
};

/**
 * Generate insight from template
 */
const generateInsight = (templateKey, values, additionalData = {}) => {
  const template = INSIGHT_TEMPLATES[templateKey];
  if (!template) {
    logError('Unknown template:', templateKey);
    return null;
  }

  const change = values.change || values.percentage / 100 || 0;

  return {
    type: template.type,
    title: fillTemplate(template.titleTemplate, values),
    description: fillTemplate(template.descriptionTemplate, values),
    recommendation: fillTemplate(template.recommendationTemplate, values),
    priority: getPriority(change, template.type),
    confidence: values.confidence || 0.8,
    impact_score: Math.min(100, Math.abs(change) * 100),
    data: {
      ...values,
      ...additionalData,
    },
    created_at: new Date().toISOString(),
    action_status: ACTION_STATUS.PENDING,
  };
};

// =====================================================
// TREND ANALYSIS
// =====================================================

/**
 * Analyze trends for all features
 */
const analyzeTrends = async () => {
  log('Analyzing trends...');
  const insights = [];

  try {
    // Get feature usage comparison (this week vs last week)
    const { data: featureTrends, error } = await supabase
      .from('v_analytics_feature_trends')
      .select('*');

    if (error) throw error;

    if (!featureTrends || featureTrends.length === 0) {
      log('No feature trend data available');
      return insights;
    }

    featureTrends.forEach(feature => {
      const change = calculateChange(feature.current_count, feature.previous_count);

      // Growth trend
      if (change >= CONFIG.TREND_GROWTH_THRESHOLD) {
        const insight = generateInsight('trend_growth', {
          feature: feature.feature_name || feature.event_category,
          percentage: Math.round(change * 100),
          period: '7 ngày qua',
          change,
          confidence: 0.85,
        }, {
          current_count: feature.current_count,
          previous_count: feature.previous_count,
          category: feature.event_category,
        });
        if (insight) insights.push(insight);
      }

      // Decline trend
      if (change <= CONFIG.TREND_DECLINE_THRESHOLD) {
        const insight = generateInsight('trend_decline', {
          feature: feature.feature_name || feature.event_category,
          percentage: Math.abs(Math.round(change * 100)),
          period: '7 ngày qua',
          change,
          confidence: 0.85,
        }, {
          current_count: feature.current_count,
          previous_count: feature.previous_count,
          category: feature.event_category,
        });
        if (insight) insights.push(insight);
      }
    });

    log('Trend insights generated:', insights.length);
    return insights;

  } catch (error) {
    logError('analyzeTrends error:', error);
    return insights;
  }
};

// =====================================================
// ANOMALY DETECTION
// =====================================================

/**
 * Detect anomalies (spikes/drops vs 7-day average)
 */
const detectAnomalies = async () => {
  log('Detecting anomalies...');
  const insights = [];

  try {
    // Get today's stats vs 7-day average
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get today's data
    const { data: todayData, error: todayError } = await supabase
      .from('analytics_daily_stats')
      .select('*')
      .eq('date', today.toISOString().split('T')[0])
      .single();

    if (todayError && todayError.code !== 'PGRST116') throw todayError;

    // Get 7-day average
    const { data: avgData, error: avgError } = await supabase
      .from('analytics_daily_stats')
      .select('*')
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .lt('date', today.toISOString().split('T')[0]);

    if (avgError) throw avgError;

    if (!todayData || !avgData || avgData.length === 0) {
      log('Insufficient data for anomaly detection');
      return insights;
    }

    // Calculate averages
    const calculateAvg = (data, field) => {
      const values = data.map(d => d[field] || 0);
      return values.reduce((a, b) => a + b, 0) / values.length;
    };

    const metrics = [
      { field: 'total_events', name: 'Tổng sự kiện' },
      { field: 'total_page_views', name: 'Lượt xem trang' },
      { field: 'unique_users', name: 'Người dùng' },
      { field: 'new_users', name: 'Người dùng mới' },
    ];

    metrics.forEach(metric => {
      const todayValue = todayData[metric.field] || 0;
      const avgValue = calculateAvg(avgData, metric.field);
      const change = calculateChange(todayValue, avgValue);

      // Spike
      if (change >= CONFIG.ANOMALY_SPIKE_THRESHOLD) {
        const insight = generateInsight('anomaly_spike', {
          feature: metric.name,
          percentage: Math.round(change * 100),
          change,
          confidence: 0.9,
        }, {
          today_value: todayValue,
          avg_value: avgValue,
          metric: metric.field,
        });
        if (insight) insights.push(insight);
      }

      // Drop
      if (change <= CONFIG.ANOMALY_DROP_THRESHOLD) {
        const insight = generateInsight('anomaly_drop', {
          feature: metric.name,
          percentage: Math.abs(Math.round(change * 100)),
          change,
          confidence: 0.9,
        }, {
          today_value: todayValue,
          avg_value: avgValue,
          metric: metric.field,
        });
        if (insight) insights.push(insight);
      }
    });

    log('Anomaly insights generated:', insights.length);
    return insights;

  } catch (error) {
    logError('detectAnomalies error:', error);
    return insights;
  }
};

// =====================================================
// RECOMMENDATIONS
// =====================================================

/**
 * Generate recommendations based on usage patterns
 */
const generateRecommendations = async () => {
  log('Generating recommendations...');
  const insights = [];

  try {
    // 1. Find underused features
    const { data: featureUsage, error: featureError } = await supabase
      .from('analytics_feature_usage')
      .select('*')
      .order('usage_count', { ascending: true })
      .limit(10);

    if (!featureError && featureUsage) {
      // Get total users for percentage calculation
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      featureUsage.forEach(feature => {
        const usagePercentage = totalUsers > 0
          ? (feature.unique_users / totalUsers) * 100
          : 0;

        if (usagePercentage < 20 && feature.usage_count > 0) {
          const insight = generateInsight('rec_underused_feature', {
            feature: feature.feature_name,
            percentage: Math.round(usagePercentage),
            change: 0,
            confidence: 0.75,
          }, {
            usage_count: feature.usage_count,
            unique_users: feature.unique_users,
            total_users: totalUsers,
          });
          if (insight) insights.push(insight);
        }
      });
    }

    // 2. Find conversion opportunities (engaged free users)
    const { data: engagedFreeUsers, error: engagedError } = await supabase
      .rpc('get_analytics_engaged_free_users');

    if (!engagedError && engagedFreeUsers && engagedFreeUsers.length > 0) {
      const avgActions = engagedFreeUsers.reduce((sum, u) => sum + (u.action_count || 0), 0) / engagedFreeUsers.length;

      const insight = generateInsight('rec_conversion_opportunity', {
        count: engagedFreeUsers.length,
        avg_actions: Math.round(avgActions),
        change: 0,
        confidence: 0.8,
      }, {
        user_ids: engagedFreeUsers.map(u => u.user_id),
        avg_actions: avgActions,
      });
      if (insight) insights.push(insight);
    }

    log('Recommendation insights generated:', insights.length);
    return insights;

  } catch (error) {
    logError('generateRecommendations error:', error);
    return insights;
  }
};

// =====================================================
// PREDICTIONS
// =====================================================

/**
 * Generate predictions (churn risk, upgrade likelihood)
 */
const generatePredictions = async () => {
  log('Generating predictions...');
  const insights = [];

  try {
    // 1. Churn risk - users with declining activity
    const { data: decliningUsers, error: decliningError } = await supabase
      .rpc('get_analytics_declining_users');

    if (!decliningError && decliningUsers && decliningUsers.length > 0) {
      const insight = generateInsight('pred_churn_risk', {
        count: decliningUsers.length,
        days: CONFIG.CHURN_INACTIVITY_DAYS,
        change: -0.5,
        confidence: 0.7,
      }, {
        user_ids: decliningUsers.map(u => u.user_id),
        avg_decline: decliningUsers.reduce((sum, u) => sum + Math.abs(u.activity_decline || 0), 0) / decliningUsers.length,
      });
      if (insight) insights.push(insight);
    }

    // 2. Upgrade likelihood - engaged free users
    const { data: upgradeUsers, error: upgradeError } = await supabase
      .rpc('get_analytics_engaged_free_users');

    if (!upgradeError && upgradeUsers && upgradeUsers.length >= 5) {
      const insight = generateInsight('pred_upgrade_likely', {
        count: upgradeUsers.length,
        change: 0.3,
        confidence: 0.75,
      }, {
        user_ids: upgradeUsers.map(u => u.user_id),
      });
      if (insight) insights.push(insight);
    }

    log('Prediction insights generated:', insights.length);
    return insights;

  } catch (error) {
    logError('generatePredictions error:', error);
    return insights;
  }
};

// =====================================================
// MAIN API
// =====================================================

/**
 * Generate all insights and save to database
 */
const generateAllInsights = async () => {
  log('Generating all insights...');

  try {
    // Generate insights from all sources in parallel
    const [trends, anomalies, recommendations, predictions] = await Promise.all([
      analyzeTrends(),
      detectAnomalies(),
      generateRecommendations(),
      generatePredictions(),
    ]);

    const allInsights = [
      ...trends,
      ...anomalies,
      ...recommendations,
      ...predictions,
    ];

    log('Total insights generated:', allInsights.length);

    if (allInsights.length === 0) {
      return { success: true, count: 0, insights: [] };
    }

    // Save to database
    const insightsToSave = allInsights.map(insight => ({
      type: insight.type,
      title: insight.title,
      description: insight.description,
      recommendation: insight.recommendation,
      priority: insight.priority,
      confidence: insight.confidence,
      impact_score: insight.impact_score,
      data: insight.data,
      action_status: insight.action_status,
      created_at: insight.created_at,
    }));

    const { data, error } = await supabase
      .from('analytics_ai_insights')
      .insert(insightsToSave)
      .select();

    if (error) throw error;

    log('Insights saved to database:', data?.length);

    return {
      success: true,
      count: data?.length || 0,
      insights: data,
    };

  } catch (error) {
    logError('generateAllInsights error:', error);
    return { success: false, error: error.message, count: 0, insights: [] };
  }
};

/**
 * Get insights with filters
 */
const getInsights = async (filters = {}) => {
  try {
    let query = supabase
      .from('analytics_ai_insights')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.action_status) {
      query = query.eq('action_status', filters.action_status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };

  } catch (error) {
    logError('getInsights error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Update insight action status
 */
const updateInsightAction = async (insightId, status, notes = null) => {
  try {
    const updates = {
      action_status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === ACTION_STATUS.COMPLETED) {
      updates.action_completed_at = new Date().toISOString();
    }

    if (notes) {
      updates.action_notes = notes;
    }

    const { data, error } = await supabase
      .from('analytics_ai_insights')
      .update(updates)
      .eq('id', insightId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };

  } catch (error) {
    logError('updateInsightAction error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Dismiss insight
 */
const dismissInsight = async (insightId, reason = null) => {
  return updateInsightAction(insightId, ACTION_STATUS.DISMISSED, reason);
};

/**
 * Get insight summary (counts by type and priority)
 */
const getInsightSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('analytics_ai_insights')
      .select('type, priority, action_status')
      .neq('action_status', ACTION_STATUS.DISMISSED);

    if (error) throw error;

    // Calculate summary
    const summary = {
      total: data?.length || 0,
      by_type: {},
      by_priority: {},
      by_status: {},
      pending_count: 0,
    };

    (data || []).forEach(insight => {
      // By type
      summary.by_type[insight.type] = (summary.by_type[insight.type] || 0) + 1;

      // By priority
      summary.by_priority[insight.priority] = (summary.by_priority[insight.priority] || 0) + 1;

      // By status
      summary.by_status[insight.action_status] = (summary.by_status[insight.action_status] || 0) + 1;

      // Pending count
      if (insight.action_status === ACTION_STATUS.PENDING) {
        summary.pending_count++;
      }
    });

    return { success: true, data: summary };

  } catch (error) {
    logError('getInsightSummary error:', error);
    return { success: false, error: error.message, data: null };
  }
};

// =====================================================
// EXPORTS
// =====================================================

export const aiInsightService = {
  // Analysis methods
  analyzeTrends,
  detectAnomalies,
  generateRecommendations,
  generatePredictions,

  // Main API
  generateAllInsights,
  getInsights,
  getInsightSummary,

  // Action management
  updateInsightAction,
  dismissInsight,

  // Constants
  CONFIG,
  INSIGHT_TEMPLATES,
};

export default aiInsightService;
