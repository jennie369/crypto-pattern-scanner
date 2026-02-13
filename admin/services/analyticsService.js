/**
 * Analytics Service for Admin Dashboard
 * Comprehensive analytics data across all platform features
 */

import { supabase } from './supabase';

// ============================================
// SCANNER ANALYTICS
// ============================================

/**
 * Get scanner usage statistics
 */
export async function getScannerStats(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total scans
    const { count: totalScans } = await supabase
      .from('scanner_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get unique users who scanned
    const { data: uniqueUsers } = await supabase
      .from('scanner_logs')
      .select('user_id')
      .gte('created_at', startDate.toISOString());

    const uniqueUserIds = [...new Set(uniqueUsers?.map(u => u.user_id) || [])];

    // Get pattern detection stats
    const { data: patternStats } = await supabase
      .from('scanner_logs')
      .select('patterns_found, timeframe')
      .gte('created_at', startDate.toISOString());

    const totalPatterns = patternStats?.reduce((sum, log) => sum + (log.patterns_found || 0), 0) || 0;

    return {
      success: true,
      data: {
        totalScans: totalScans || 0,
        uniqueUsers: uniqueUserIds.length,
        totalPatterns,
        avgPatternsPerScan: totalScans ? (totalPatterns / totalScans).toFixed(1) : 0,
      },
    };
  } catch (error) {
    console.error('[analyticsService] getScannerStats error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get scanner usage over time
 */
export async function getScannerTrend(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('scanner_logs')
      .select('created_at, patterns_found, timeframe')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const dailyData = {};
    (data || []).forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString('vi-VN');
      if (!dailyData[date]) {
        dailyData[date] = { date, scans: 0, patterns: 0 };
      }
      dailyData[date].scans += 1;
      dailyData[date].patterns += log.patterns_found || 0;
    });

    return {
      success: true,
      data: Object.values(dailyData),
    };
  } catch (error) {
    console.error('[analyticsService] getScannerTrend error:', error);
    return { success: false, data: [] };
  }
}

/**
 * Get pattern type distribution
 */
export async function getPatternDistribution(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('pattern_detections')
      .select('pattern_type, count')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Aggregate by pattern type
    const distribution = {};
    (data || []).forEach((item) => {
      const type = item.pattern_type || 'Unknown';
      distribution[type] = (distribution[type] || 0) + (item.count || 1);
    });

    return {
      success: true,
      data: Object.entries(distribution).map(([name, value]) => ({ name, value })),
    };
  } catch (error) {
    console.error('[analyticsService] getPatternDistribution error:', error);
    return { success: false, data: [] };
  }
}

// ============================================
// SHOP ANALYTICS
// ============================================

/**
 * Get shop sales statistics
 */
export async function getShopStats(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get orders
    const { data: orders, count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .gte('created_at', startDate.toISOString());

    // Calculate revenue
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;

    // Get unique customers
    const uniqueCustomers = [...new Set(orders?.map(o => o.user_id) || [])].length;

    return {
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        totalRevenue,
        completedOrders,
        uniqueCustomers,
        avgOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
        completionRate: totalOrders ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0,
      },
    };
  } catch (error) {
    console.error('[analyticsService] getShopStats error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get sales trend over time
 */
export async function getSalesTrend(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_amount, status')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const dailyData = {};
    (data || []).forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString('vi-VN');
      if (!dailyData[date]) {
        dailyData[date] = { date, orders: 0, revenue: 0 };
      }
      dailyData[date].orders += 1;
      dailyData[date].revenue += order.total_amount || 0;
    });

    return {
      success: true,
      data: Object.values(dailyData),
    };
  } catch (error) {
    console.error('[analyticsService] getSalesTrend error:', error);
    return { success: false, data: [] };
  }
}

/**
 * Get top selling products
 */
export async function getTopProducts(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('product_id, product_name, quantity, price')
      .order('quantity', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Aggregate by product
    const products = {};
    (data || []).forEach((item) => {
      const id = item.product_id;
      if (!products[id]) {
        products[id] = {
          id,
          name: item.product_name || 'Unknown Product',
          quantity: 0,
          revenue: 0,
        };
      }
      products[id].quantity += item.quantity || 1;
      products[id].revenue += (item.price || 0) * (item.quantity || 1);
    });

    return {
      success: true,
      data: Object.values(products).sort((a, b) => b.quantity - a.quantity).slice(0, limit),
    };
  } catch (error) {
    console.error('[analyticsService] getTopProducts error:', error);
    return { success: false, data: [] };
  }
}

// ============================================
// USER BEHAVIOR ANALYTICS
// ============================================

/**
 * Get user engagement statistics
 */
export async function getUserEngagementStats(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (users with activity in period)
    const { data: activeData } = await supabase
      .from('user_activity')
      .select('user_id')
      .gte('created_at', startDate.toISOString());

    const activeUsers = [...new Set(activeData?.map(a => a.user_id) || [])].length;

    // Get new users
    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get user sessions
    const { count: totalSessions } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    return {
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activeUsers,
        newUsers: newUsers || 0,
        totalSessions: totalSessions || 0,
        avgSessionsPerUser: activeUsers ? (totalSessions / activeUsers).toFixed(1) : 0,
        activeRate: totalUsers ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
      },
    };
  } catch (error) {
    console.error('[analyticsService] getUserEngagementStats error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user growth trend
 */
export async function getUserGrowthTrend(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const dailyData = {};
    let cumulative = 0;
    (data || []).forEach((user) => {
      const date = new Date(user.created_at).toLocaleDateString('vi-VN');
      if (!dailyData[date]) {
        dailyData[date] = { date, newUsers: 0, cumulative: 0 };
      }
      dailyData[date].newUsers += 1;
      cumulative += 1;
      dailyData[date].cumulative = cumulative;
    });

    return {
      success: true,
      data: Object.values(dailyData),
    };
  } catch (error) {
    console.error('[analyticsService] getUserGrowthTrend error:', error);
    return { success: false, data: [] };
  }
}

/**
 * Get user tier distribution
 */
export async function getUserTierDistribution() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier');

    if (error) throw error;

    const distribution = {
      free: 0,
      tier_1: 0,
      tier_2: 0,
      tier_3: 0,
    };

    (data || []).forEach((user) => {
      const tier = user.subscription_tier || 'free';
      distribution[tier] = (distribution[tier] || 0) + 1;
    });

    return {
      success: true,
      data: Object.entries(distribution).map(([name, value]) => ({
        name: name === 'free' ? 'Free' : name.replace('tier_', 'Tier '),
        value,
      })),
    };
  } catch (error) {
    console.error('[analyticsService] getUserTierDistribution error:', error);
    return { success: false, data: [] };
  }
}

// ============================================
// CHATBOT ANALYTICS
// ============================================

/**
 * Get chatbot statistics
 */
export async function getChatbotStats(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get conversations
    const { count: totalConversations } = await supabase
      .from('chatbot_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get messages
    const { count: totalMessages } = await supabase
      .from('chatbot_messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get resolved conversations
    const { count: resolvedCount } = await supabase
      .from('chatbot_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .eq('status', 'resolved');

    // Get handoffs
    const { count: handoffCount } = await supabase
      .from('chatbot_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .eq('status', 'handoff');

    return {
      success: true,
      data: {
        totalConversations: totalConversations || 0,
        totalMessages: totalMessages || 0,
        resolvedCount: resolvedCount || 0,
        handoffCount: handoffCount || 0,
        resolutionRate: totalConversations ? ((resolvedCount / totalConversations) * 100).toFixed(1) : 0,
        avgMessagesPerConvo: totalConversations ? (totalMessages / totalConversations).toFixed(1) : 0,
      },
    };
  } catch (error) {
    console.error('[analyticsService] getChatbotStats error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get FAQ match statistics
 */
export async function getFaqStats(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('faq_matches')
      .select('faq_id, confidence, was_helpful')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const totalMatches = data?.length || 0;
    const helpfulMatches = data?.filter(m => m.was_helpful).length || 0;
    const avgConfidence = data?.reduce((sum, m) => sum + (m.confidence || 0), 0) / totalMatches || 0;

    return {
      success: true,
      data: {
        totalMatches,
        helpfulMatches,
        helpfulRate: totalMatches ? ((helpfulMatches / totalMatches) * 100).toFixed(1) : 0,
        avgConfidence: (avgConfidence * 100).toFixed(1),
      },
    };
  } catch (error) {
    console.error('[analyticsService] getFaqStats error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// AI INSIGHTS
// ============================================

/**
 * Get AI-generated insights
 */
export async function getAIInsights() {
  try {
    // In production, this would call an AI service
    // For now, return structured insights based on data analysis
    const [scannerStats, shopStats, userStats, chatbotStats] = await Promise.all([
      getScannerStats(7),
      getShopStats(7),
      getUserEngagementStats(7),
      getChatbotStats(7),
    ]);

    const insights = [];

    // Scanner insights
    if (scannerStats.success && scannerStats.data.totalScans > 0) {
      insights.push({
        category: 'scanner',
        type: 'trend',
        title: 'Scanner Usage',
        description: `${scannerStats.data.totalScans} scans performed by ${scannerStats.data.uniqueUsers} users this week`,
        metric: scannerStats.data.avgPatternsPerScan,
        metricLabel: 'avg patterns/scan',
        priority: 'medium',
      });
    }

    // Shop insights
    if (shopStats.success && shopStats.data.totalOrders > 0) {
      insights.push({
        category: 'shop',
        type: 'revenue',
        title: 'Shop Performance',
        description: `${shopStats.data.totalOrders} orders with ${shopStats.data.completionRate}% completion rate`,
        metric: shopStats.data.totalRevenue,
        metricLabel: 'total revenue',
        priority: 'high',
      });
    }

    // User insights
    if (userStats.success) {
      insights.push({
        category: 'users',
        type: 'growth',
        title: 'User Engagement',
        description: `${userStats.data.activeUsers} active users (${userStats.data.activeRate}% of total)`,
        metric: userStats.data.newUsers,
        metricLabel: 'new users',
        priority: userStats.data.newUsers > 50 ? 'high' : 'medium',
      });
    }

    // Chatbot insights
    if (chatbotStats.success) {
      insights.push({
        category: 'chatbot',
        type: 'performance',
        title: 'Chatbot Resolution',
        description: `${chatbotStats.data.resolutionRate}% resolution rate with ${chatbotStats.data.handoffCount} handoffs`,
        metric: chatbotStats.data.totalConversations,
        metricLabel: 'conversations',
        priority: chatbotStats.data.resolutionRate < 70 ? 'high' : 'low',
      });
    }

    return {
      success: true,
      data: insights,
    };
  } catch (error) {
    console.error('[analyticsService] getAIInsights error:', error);
    return { success: false, data: [] };
  }
}

/**
 * Get anomaly alerts
 */
export async function getAnomalyAlerts() {
  try {
    // In production, this would use ML-based anomaly detection
    // For now, return sample alerts based on threshold checks
    const alerts = [];

    const [scannerStats, shopStats] = await Promise.all([
      getScannerStats(1),
      getShopStats(1),
    ]);

    // Check for unusual scanner activity
    if (scannerStats.success && scannerStats.data.totalScans > 1000) {
      alerts.push({
        id: 1,
        type: 'warning',
        category: 'scanner',
        message: 'Unusual high scanner activity detected today',
        value: scannerStats.data.totalScans,
        threshold: 1000,
        created_at: new Date().toISOString(),
      });
    }

    // Check for low completion rate
    if (shopStats.success && parseFloat(shopStats.data.completionRate) < 50) {
      alerts.push({
        id: 2,
        type: 'critical',
        category: 'shop',
        message: 'Low order completion rate',
        value: shopStats.data.completionRate + '%',
        threshold: '50%',
        created_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      data: alerts,
    };
  } catch (error) {
    console.error('[analyticsService] getAnomalyAlerts error:', error);
    return { success: false, data: [] };
  }
}

export default {
  // Scanner
  getScannerStats,
  getScannerTrend,
  getPatternDistribution,
  // Shop
  getShopStats,
  getSalesTrend,
  getTopProducts,
  // Users
  getUserEngagementStats,
  getUserGrowthTrend,
  getUserTierDistribution,
  // Chatbot
  getChatbotStats,
  getFaqStats,
  // AI Insights
  getAIInsights,
  getAnomalyAlerts,
};
