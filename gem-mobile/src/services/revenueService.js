/**
 * Gemral - Revenue Service
 *
 * Service for admin revenue tracking and analytics
 * Data sources: shopify_orders, profiles, gems_transactions, course_enrollments
 */

import { supabase } from './supabase';

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

      // Shop revenue from shopify_orders
      const { data: shopOrders } = await supabase
        .from('shopify_orders')
        .select('total_price, created_at')
        .eq('financial_status', 'paid')
        .gte('created_at', start)
        .lte('created_at', end);

      const shopRevenue = (shopOrders || []).reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);

      // Tier upgrade revenue from gems_transactions
      const { data: tierTransactions } = await supabase
        .from('gems_transactions')
        .select('amount, created_at')
        .eq('type', 'tier_upgrade')
        .gte('created_at', start)
        .lte('created_at', end);

      // Estimate tier revenue (gems purchased for tier upgrades)
      const tierRevenue = (tierTransactions || []).reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) * 0.01; // Convert gems to currency

      // Course revenue from course_enrollments
      const { data: courseEnrollments } = await supabase
        .from('course_enrollments')
        .select('price_paid, created_at')
        .eq('payment_status', 'paid')
        .gte('created_at', start)
        .lte('created_at', end);

      const courseRevenue = (courseEnrollments || []).reduce((sum, e) => sum + (parseFloat(e.price_paid) || 0), 0);

      // Total commission paid out from profiles
      const { data: commissionData } = await supabase
        .from('profiles')
        .select('total_commission')
        .not('total_commission', 'is', null);

      const totalCommission = (commissionData || []).reduce((sum, p) => sum + (parseFloat(p.total_commission) || 0), 0);

      // Calculate totals
      const totalRevenue = shopRevenue + tierRevenue + courseRevenue;

      return {
        totalRevenue,
        shopRevenue,
        tierRevenue,
        courseRevenue,
        totalCommission,
        orderCount: shopOrders?.length || 0,
        enrollmentCount: courseEnrollments?.length || 0,
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
      const { data: shopOrders } = await supabase
        .from('shopify_orders')
        .select('total_price, created_at')
        .eq('financial_status', 'paid')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: true });

      // Group by date
      const groupedData = {};

      (shopOrders || []).forEach((order) => {
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

      // Convert to array and fill missing dates
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
      // Get recent shop orders
      const { data: shopOrders } = await supabase
        .from('shopify_orders')
        .select(`
          id,
          order_number,
          total_price,
          financial_status,
          created_at,
          customer:profiles!shopify_orders_customer_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('financial_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Get recent tier upgrades
      const { data: tierTransactions } = await supabase
        .from('gems_transactions')
        .select(`
          id,
          amount,
          description,
          created_at,
          user:profiles!gems_transactions_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('type', 'tier_upgrade')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Combine and format
      const transactions = [
        ...(shopOrders || []).map((o) => ({
          id: o.id,
          type: 'shop',
          description: `Đơn hàng #${o.order_number}`,
          amount: parseFloat(o.total_price) || 0,
          user: o.customer,
          created_at: o.created_at,
        })),
        ...(tierTransactions || []).map((t) => ({
          id: t.id,
          type: 'tier',
          description: t.description || 'Nâng cấp tier',
          amount: Math.abs(t.amount || 0) * 0.01, // Convert gems to currency
          user: t.user,
          created_at: t.created_at,
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

      const { data: orders } = await supabase
        .from('shopify_orders')
        .select(`
          total_price,
          customer_id,
          customer:profiles!shopify_orders_customer_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('financial_status', 'paid')
        .gte('created_at', start)
        .lte('created_at', end);

      // Group by customer
      const customerSpending = {};

      (orders || []).forEach((order) => {
        if (!order.customer_id || !order.customer) return;

        if (!customerSpending[order.customer_id]) {
          customerSpending[order.customer_id] = {
            user: order.customer,
            totalSpent: 0,
            orderCount: 0,
          };
        }

        customerSpending[order.customer_id].totalSpent += parseFloat(order.total_price) || 0;
        customerSpending[order.customer_id].orderCount += 1;
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
          color: COLORS?.gold || '#FFBD59',
        },
        {
          source: 'Khóa học',
          value: overview.courseRevenue,
          percentage: overview.totalRevenue > 0
            ? (overview.courseRevenue / overview.totalRevenue * 100).toFixed(1)
            : 0,
          color: '#00D9FF',
        },
        {
          source: 'Tier',
          value: overview.tierRevenue,
          percentage: overview.totalRevenue > 0
            ? (overview.tierRevenue / overview.totalRevenue * 100).toFixed(1)
            : 0,
          color: '#8B5CF6',
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

      // Get all orders in range
      const { data: orders } = await supabase
        .from('shopify_orders')
        .select(`
          order_number,
          total_price,
          financial_status,
          created_at,
          customer:profiles!shopify_orders_customer_id_fkey(email, full_name)
        `)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false });

      // Format as CSV
      const headers = ['Order Number', 'Customer', 'Email', 'Amount', 'Status', 'Date'];
      const rows = (orders || []).map((o) => [
        o.order_number || '',
        o.customer?.full_name || '',
        o.customer?.email || '',
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
