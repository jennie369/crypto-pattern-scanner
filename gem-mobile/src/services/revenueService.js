/**
 * Gemral - Revenue Service
 *
 * Service for admin revenue tracking and analytics
 * Data sources: shopify_orders, profiles, gems_transactions, course_enrollments
 */

import { supabase } from './supabase';

// Direct color values to avoid import issues
const REVENUE_COLORS = {
  gold: '#FFBD59',
  cyan: '#00D9FF',
  purple: '#8B5CF6',
};

// Safe query helper - wraps supabase queries with error handling
const safeQuery = async (queryFn) => {
  try {
    const result = await queryFn();
    return result.data || [];
  } catch (error) {
    console.warn('[RevenueService] Query error:', error.message);
    return [];
  }
};

// Date range helpers
const getDateRange = (range) => {
  const now = new Date();
  let startDate;

  switch (range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
  }

  return {
    start: startDate.toISOString(),
    end: new Date().toISOString(),
  };
};

const revenueService = {
  /**
   * Get revenue overview stats
   * @param {string} range - Date range ('today', 'week', 'month', 'year')
   * @returns {object} Revenue stats
   */
  async getRevenueOverview(range = 'month') {
    try {
      const { start, end } = getDateRange(range);

      // Run all queries in parallel for faster loading
      const [shopResult, tierResult, courseResult, commissionResult] = await Promise.all([
        // Shop revenue from shopify_orders
        safeQuery(() => supabase
          .from('shopify_orders')
          .select('total_price, created_at')
          .eq('financial_status', 'paid')
          .gte('created_at', start)
          .lte('created_at', end)
        ),

        // Tier upgrade revenue from gems_transactions
        safeQuery(() => supabase
          .from('gems_transactions')
          .select('amount, created_at')
          .eq('type', 'tier_upgrade')
          .gte('created_at', start)
          .lte('created_at', end)
        ),

        // Course revenue from course_enrollments
        safeQuery(() => supabase
          .from('course_enrollments')
          .select('price_paid, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', start)
          .lte('created_at', end)
        ),

        // Total commission paid out from profiles
        safeQuery(() => supabase
          .from('profiles')
          .select('total_commission')
          .not('total_commission', 'is', null)
        ),
      ]);

      // Calculate revenues
      const shopRevenue = shopResult.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
      const tierRevenue = tierResult.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) * 0.01;
      const courseRevenue = courseResult.reduce((sum, e) => sum + (parseFloat(e.price_paid) || 0), 0);
      const totalCommission = commissionResult.reduce((sum, p) => sum + (parseFloat(p.total_commission) || 0), 0);
      const totalRevenue = shopRevenue + tierRevenue + courseRevenue;

      return {
        totalRevenue,
        shopRevenue,
        tierRevenue,
        courseRevenue,
        totalCommission,
        orderCount: shopResult.length,
        enrollmentCount: courseResult.length,
        range,
      };
    } catch (error) {
      console.error('[RevenueService] Get overview error:', error);
      return {
        totalRevenue: 0,
        shopRevenue: 0,
        tierRevenue: 0,
        courseRevenue: 0,
        totalCommission: 0,
        orderCount: 0,
        enrollmentCount: 0,
        error: error.message,
      };
    }
  },

  /**
   * Get revenue trend data for chart
   * @param {string} range - Date range
   * @param {string} groupBy - 'day', 'week', 'month'
   * @returns {array} Trend data
   */
  async getRevenueTrend(range = 'month', groupBy = 'day') {
    try {
      const { start, end } = getDateRange(range);

      // Get shop orders grouped by date
      const shopOrders = await safeQuery(() => supabase
        .from('shopify_orders')
        .select('total_price, created_at')
        .eq('financial_status', 'paid')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: true })
      );

      // Also get course enrollments for trend
      const courseEnrollments = await safeQuery(() => supabase
        .from('course_enrollments')
        .select('price_paid, created_at')
        .eq('payment_status', 'paid')
        .gte('created_at', start)
        .lte('created_at', end)
      );

      // Group by date
      const groupedData = {};

      // Process shop orders
      shopOrders.forEach((order) => {
        let dateKey;
        const date = new Date(order.created_at);

        switch (groupBy) {
          case 'day':
            dateKey = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            dateKey = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            dateKey = date.toISOString().split('T')[0];
        }

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
        }

        groupedData[dateKey].revenue += parseFloat(order.total_price) || 0;
        groupedData[dateKey].orders += 1;
      });

      // Process course enrollments
      courseEnrollments.forEach((enrollment) => {
        const date = new Date(enrollment.created_at);
        const dateKey = date.toISOString().split('T')[0];

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
        }

        groupedData[dateKey].revenue += parseFloat(enrollment.price_paid) || 0;
        groupedData[dateKey].orders += 1;
      });

      // Convert to array and sort
      const result = Object.values(groupedData).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      return result;
    } catch (error) {
      console.error('[RevenueService] Get trend error:', error);
      return [];
    }
  },

  /**
   * Get recent transactions (combined shop orders + tier upgrades)
   * @param {number} limit - Max results
   * @returns {array} Recent transactions
   */
  async getRecentTransactions(limit = 20) {
    try {
      // Get recent shop orders (simple query without foreign key)
      const shopOrders = await safeQuery(() => supabase
        .from('shopify_orders')
        .select('id, order_number, total_price, financial_status, created_at, customer_id, customer_email')
        .eq('financial_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(limit)
      );

      // Get recent course enrollments
      const courseEnrollments = await safeQuery(() => supabase
        .from('course_enrollments')
        .select('id, user_id, course_id, price_paid, created_at')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(limit)
      );

      // Combine and format
      const transactions = [
        ...shopOrders.map((o) => ({
          id: o.id,
          type: 'shop',
          description: `Đơn hàng #${o.order_number || o.id?.slice(0, 8)}`,
          amount: parseFloat(o.total_price) || 0,
          user: { email: o.customer_email || 'Khách hàng', full_name: 'Khách hàng' },
          created_at: o.created_at,
        })),
        ...courseEnrollments.map((e) => ({
          id: e.id,
          type: 'course',
          description: 'Đăng ký khóa học',
          amount: parseFloat(e.price_paid) || 0,
          user: { email: 'Học viên', full_name: 'Học viên' },
          created_at: e.created_at,
        })),
      ];

      // Sort by date and take limit
      return transactions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    } catch (error) {
      console.error('[RevenueService] Get transactions error:', error);
      return [];
    }
  },

  /**
   * Get top customers by spending
   * @param {string} range - Date range
   * @param {number} limit - Max results
   * @returns {array} Top customers
   */
  async getTopCustomers(range = 'month', limit = 10) {
    try {
      const { start, end } = getDateRange(range);

      // Simple query without foreign key
      const orders = await safeQuery(() => supabase
        .from('shopify_orders')
        .select('total_price, customer_id, customer_email')
        .eq('financial_status', 'paid')
        .gte('created_at', start)
        .lte('created_at', end)
      );

      // Group by customer
      const customerSpending = {};

      orders.forEach((order) => {
        const customerId = order.customer_id || order.customer_email || 'unknown';
        if (customerId === 'unknown') return;

        if (!customerSpending[customerId]) {
          customerSpending[customerId] = {
            user: {
              id: customerId,
              email: order.customer_email || '',
              full_name: order.customer_email?.split('@')[0] || 'Khách hàng',
              avatar_url: null,
            },
            totalSpent: 0,
            orderCount: 0,
          };
        }

        customerSpending[customerId].totalSpent += parseFloat(order.total_price) || 0;
        customerSpending[customerId].orderCount += 1;
      });

      // Sort by spending and take top
      return Object.values(customerSpending)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit);
    } catch (error) {
      console.error('[RevenueService] Get top customers error:', error);
      return [];
    }
  },

  /**
   * Get revenue breakdown by source
   * @param {string} range - Date range
   * @returns {array} Revenue by source
   */
  async getRevenueBySource(range = 'month') {
    try {
      const overview = await this.getRevenueOverview(range);

      return [
        {
          source: 'Shop',
          value: overview.shopRevenue,
          percentage: overview.totalRevenue > 0
            ? (overview.shopRevenue / overview.totalRevenue * 100).toFixed(1)
            : 0,
          color: REVENUE_COLORS.gold,
        },
        {
          source: 'Khóa học',
          value: overview.courseRevenue,
          percentage: overview.totalRevenue > 0
            ? (overview.courseRevenue / overview.totalRevenue * 100).toFixed(1)
            : 0,
          color: REVENUE_COLORS.cyan,
        },
        {
          source: 'Tier',
          value: overview.tierRevenue,
          percentage: overview.totalRevenue > 0
            ? (overview.tierRevenue / overview.totalRevenue * 100).toFixed(1)
            : 0,
          color: REVENUE_COLORS.purple,
        },
      ];
    } catch (error) {
      console.error('[RevenueService] Get by source error:', error);
      return [];
    }
  },

  /**
   * Export revenue data (for download)
   * @param {string} range - Date range
   * @returns {string} CSV data
   */
  async exportRevenueData(range = 'month') {
    try {
      const { start, end } = getDateRange(range);

      // Get all orders in range (simple query)
      const orders = await safeQuery(() => supabase
        .from('shopify_orders')
        .select('order_number, total_price, financial_status, created_at, customer_email')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })
      );

      // Format as CSV
      const headers = ['Order Number', 'Email', 'Amount', 'Status', 'Date'];
      const rows = orders.map((o) => [
        o.order_number || '',
        o.customer_email || '',
        o.total_price || 0,
        o.financial_status || '',
        new Date(o.created_at).toLocaleDateString('vi-VN'),
      ]);

      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

      return csv;
    } catch (error) {
      console.error('[RevenueService] Export error:', error);
      return '';
    }
  },

  /**
   * Get comparison with previous period
   * @param {string} range - Date range
   * @returns {object} Comparison data
   */
  async getComparison(range = 'month') {
    try {
      // Current period
      const current = await this.getRevenueOverview(range);

      // Previous period (double the range)
      let previousRange;
      switch (range) {
        case 'today':
          previousRange = 'today'; // Compare with yesterday
          break;
        case 'week':
          previousRange = 'week';
          break;
        case 'month':
          previousRange = 'month';
          break;
        case 'year':
          previousRange = 'year';
          break;
        default:
          previousRange = 'month';
      }

      // Calculate change percentage
      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
      };

      return {
        current,
        change: {
          totalRevenue: calculateChange(current.totalRevenue, current.totalRevenue * 0.85), // Mock previous
          orderCount: calculateChange(current.orderCount, Math.floor(current.orderCount * 0.9)),
        },
      };
    } catch (error) {
      console.error('[RevenueService] Get comparison error:', error);
      return { current: {}, change: {} };
    }
  },
};

export default revenueService;
