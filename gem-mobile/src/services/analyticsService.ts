// src/services/analyticsService.ts
// Analytics Service for User Behavior Intelligence
// GEMRAL AI BRAIN - Phase 3

import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UserBehaviorProfile {
  userId: string;
  engagementScore: number;
  userSegment: 'new' | 'active' | 'power_user' | 'at_risk' | 'churned';
  persona: 'trader' | 'spiritual_seeker' | 'learner' | 'shopper' | null;
  churnRisk: 'low' | 'medium' | 'high';
  tradingStyle: string | null;
  preferredPatterns: string[];
  spiritualInterests: string[];
  featureUsage: {
    scanner: number;
    chatbot: number;
    forum: number;
    shop: number;
    courses: number;
  };
  lastActiveAt: string | null;
}

export interface FeatureUsageStats {
  featureName: string;
  totalUses: number;
  uniqueUsers: number;
  avgDurationSeconds: number;
  byTier: {
    free: number;
    tier1: number;
    tier2: number;
    tier3: number;
  };
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  avgEventsPerSession: number;
  retentionRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get user behavior profile
 */
export const getUserBehaviorProfile = async (userId: string): Promise<UserBehaviorProfile | null> => {
  try {
    const { data, error } = await supabase.rpc('get_user_behavior_profile', {
      p_user_id: userId,
    });

    if (error) {
      console.error('[Analytics] Get profile error:', error);
      return null;
    }

    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return {
      userId: data.user_id,
      engagementScore: data.engagement_score || 0,
      userSegment: data.user_segment || 'new',
      persona: data.persona,
      churnRisk: data.churn_risk || 'low',
      tradingStyle: data.trading_style,
      preferredPatterns: data.preferred_patterns || [],
      spiritualInterests: data.spiritual_interests || [],
      featureUsage: data.feature_usage || {
        scanner: 0,
        chatbot: 0,
        forum: 0,
        shop: 0,
        courses: 0,
      },
      lastActiveAt: data.last_active_at,
    };
  } catch (error) {
    console.error('[Analytics] Get profile failed:', error);
    return null;
  }
};

/**
 * Calculate and update engagement score
 */
export const calculateEngagementScore = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('calculate_engagement_score', {
      p_user_id: userId,
    });

    if (error) {
      console.error('[Analytics] Calculate score error:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('[Analytics] Calculate score failed:', error);
    return 0;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get feature usage statistics
 */
export const getFeatureUsageStats = async (
  days: number = 30
): Promise<FeatureUsageStats[]> => {
  try {
    const { data, error } = await supabase
      .from('ai_feature_usage_stats')
      .select('*')
      .gte('stat_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('stat_date', { ascending: false });

    if (error) {
      console.error('[Analytics] Get feature stats error:', error);
      return [];
    }

    // Aggregate by feature
    const aggregated: Record<string, FeatureUsageStats> = {};

    (data || []).forEach((row) => {
      if (!aggregated[row.feature_name]) {
        aggregated[row.feature_name] = {
          featureName: row.feature_name,
          totalUses: 0,
          uniqueUsers: 0,
          avgDurationSeconds: 0,
          byTier: { free: 0, tier1: 0, tier2: 0, tier3: 0 },
        };
      }

      aggregated[row.feature_name].totalUses += row.total_uses || 0;
      aggregated[row.feature_name].uniqueUsers += row.unique_users || 0;
      aggregated[row.feature_name].byTier.free += row.free_users || 0;
      aggregated[row.feature_name].byTier.tier1 += row.tier1_users || 0;
      aggregated[row.feature_name].byTier.tier2 += row.tier2_users || 0;
      aggregated[row.feature_name].byTier.tier3 += row.tier3_users || 0;
    });

    return Object.values(aggregated);
  } catch (error) {
    console.error('[Analytics] Get feature stats failed:', error);
    return [];
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ENGAGEMENT METRICS (Admin only)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get overall engagement metrics
 */
export const getEngagementMetrics = async (): Promise<EngagementMetrics | null> => {
  try {
    // DAU (Daily Active Users)
    const { data: dauData } = await supabase
      .from('ai_user_events')
      .select('user_id')
      .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const dau = new Set((dauData || []).map(r => r.user_id)).size;

    // WAU (Weekly Active Users)
    const { data: wauData } = await supabase
      .from('ai_user_events')
      .select('user_id')
      .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const wau = new Set((wauData || []).map(r => r.user_id)).size;

    // MAU (Monthly Active Users)
    const { data: mauData } = await supabase
      .from('ai_user_events')
      .select('user_id')
      .gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const mau = new Set((mauData || []).map(r => r.user_id)).size;

    // Average session metrics
    const { data: sessionData } = await supabase
      .from('ai_user_sessions')
      .select('duration_seconds, events_count')
      .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .not('duration_seconds', 'is', null);

    const sessions = sessionData || [];
    const avgSessionDuration = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length
      : 0;
    const avgEventsPerSession = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.events_count || 0), 0) / sessions.length
      : 0;

    // Retention (users active both this week and last week)
    const { data: lastWeekData } = await supabase
      .from('ai_user_events')
      .select('user_id')
      .gte('occurred_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .lt('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const lastWeekUsers = new Set((lastWeekData || []).map(r => r.user_id));
    const thisWeekUsers = new Set((wauData || []).map(r => r.user_id));
    const retainedUsers = [...lastWeekUsers].filter(u => thisWeekUsers.has(u)).length;
    const retentionRate = lastWeekUsers.size > 0
      ? (retainedUsers / lastWeekUsers.size) * 100
      : 0;

    return {
      dailyActiveUsers: dau,
      weeklyActiveUsers: wau,
      monthlyActiveUsers: mau,
      avgSessionDuration,
      avgEventsPerSession,
      retentionRate,
    };
  } catch (error) {
    console.error('[Analytics] Get engagement metrics failed:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// USER SEGMENTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get users by segment
 */
export const getUsersBySegment = async (
  segment: 'new' | 'active' | 'power_user' | 'at_risk' | 'churned'
): Promise<Array<{ userId: string; engagementScore: number; lastActiveAt: string }>> => {
  try {
    const { data, error } = await supabase
      .from('ai_user_profiles')
      .select('user_id, engagement_score, last_active_at')
      .eq('user_segment', segment)
      .order('engagement_score', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[Analytics] Get users by segment error:', error);
      return [];
    }

    return (data || []).map(row => ({
      userId: row.user_id,
      engagementScore: row.engagement_score,
      lastActiveAt: row.last_active_at,
    }));
  } catch (error) {
    console.error('[Analytics] Get users by segment failed:', error);
    return [];
  }
};

/**
 * Get at-risk users for re-engagement campaigns
 */
export const getAtRiskUsers = async (): Promise<Array<{
  userId: string;
  engagementScore: number;
  lastActiveAt: string;
  preferredFeatures: string[];
}>> => {
  try {
    const { data, error } = await supabase
      .from('ai_user_profiles')
      .select('user_id, engagement_score, last_active_at, scanner_usage_pct, chatbot_usage_pct, forum_usage_pct, shop_usage_pct, courses_usage_pct')
      .in('user_segment', ['at_risk', 'churned'])
      .order('last_active_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[Analytics] Get at-risk users error:', error);
      return [];
    }

    return (data || []).map(row => {
      // Determine preferred features
      const features: Array<{ name: string; pct: number }> = [
        { name: 'scanner', pct: row.scanner_usage_pct || 0 },
        { name: 'chatbot', pct: row.chatbot_usage_pct || 0 },
        { name: 'forum', pct: row.forum_usage_pct || 0 },
        { name: 'shop', pct: row.shop_usage_pct || 0 },
        { name: 'courses', pct: row.courses_usage_pct || 0 },
      ];

      const preferredFeatures = features
        .filter(f => f.pct > 10)
        .sort((a, b) => b.pct - a.pct)
        .map(f => f.name);

      return {
        userId: row.user_id,
        engagementScore: row.engagement_score,
        lastActiveAt: row.last_active_at,
        preferredFeatures,
      };
    });
  } catch (error) {
    console.error('[Analytics] Get at-risk users failed:', error);
    return [];
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PERSONALIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get personalized recommendations based on user behavior
 */
export const getPersonalizedRecommendations = async (userId: string): Promise<{
  suggestedFeatures: string[];
  suggestedPatterns: string[];
  suggestedProducts: string[];
  suggestedCourses: string[];
}> => {
  try {
    const profile = await getUserBehaviorProfile(userId);

    if (!profile) {
      // Default recommendations for new users
      return {
        suggestedFeatures: ['chatbot', 'scanner'],
        suggestedPatterns: ['DPD', 'UPU'],
        suggestedProducts: [],
        suggestedCourses: ['frequency_basics'],
      };
    }

    const recommendations = {
      suggestedFeatures: [] as string[],
      suggestedPatterns: [] as string[],
      suggestedProducts: [] as string[],
      suggestedCourses: [] as string[],
    };

    // Suggest features based on persona
    switch (profile.persona) {
      case 'trader':
        recommendations.suggestedFeatures = ['scanner', 'chatbot'];
        recommendations.suggestedPatterns = profile.preferredPatterns.length > 0
          ? profile.preferredPatterns
          : ['DPD', 'UPU', 'HFZ'];
        break;
      case 'spiritual_seeker':
        recommendations.suggestedFeatures = ['chatbot', 'shop'];
        recommendations.suggestedProducts = ['crystals', 'tarot'];
        break;
      case 'learner':
        recommendations.suggestedFeatures = ['courses', 'chatbot'];
        recommendations.suggestedCourses = ['frequency_basics', 'trading_psychology'];
        break;
      case 'shopper':
        recommendations.suggestedFeatures = ['shop', 'chatbot'];
        break;
      default:
        recommendations.suggestedFeatures = ['chatbot', 'forum'];
    }

    // Add spiritual interests
    if (profile.spiritualInterests.length > 0) {
      if (profile.spiritualInterests.includes('crystals')) {
        recommendations.suggestedProducts.push('crystals');
      }
      if (profile.spiritualInterests.includes('tarot')) {
        recommendations.suggestedProducts.push('tarot');
      }
    }

    return recommendations;
  } catch (error) {
    console.error('[Analytics] Get recommendations failed:', error);
    return {
      suggestedFeatures: ['chatbot'],
      suggestedPatterns: [],
      suggestedProducts: [],
      suggestedCourses: [],
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  getUserBehaviorProfile,
  calculateEngagementScore,
  getFeatureUsageStats,
  getEngagementMetrics,
  getUsersBySegment,
  getAtRiskUsers,
  getPersonalizedRecommendations,
};
