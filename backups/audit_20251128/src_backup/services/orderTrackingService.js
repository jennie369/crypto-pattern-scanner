/**
 * Order Tracking Service
 * Track Shopify orders and commission status for affiliates
 */

import { supabase } from './supabase';

class OrderTrackingService {
  /**
   * Get all orders for a partner/affiliate
   * @param {string} partnerId - Partner UUID
   * @returns {Promise<Array>} List of orders
   */
  async getPartnerOrders(partnerId) {
    try {
      const { data, error } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[OrderTracking] getPartnerOrders error:', error);
      return [];
    }
  }

  /**
   * Get orders by status (pending, paid, etc.)
   * @param {string} partnerId - Partner UUID
   * @param {string} status - Financial status
   * @returns {Promise<Array>}
   */
  async getOrdersByStatus(partnerId, status) {
    try {
      const { data, error } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('financial_status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[OrderTracking] getOrdersByStatus error:', error);
      return [];
    }
  }

  /**
   * Get commission sales for a partner
   * @param {string} partnerId - Partner UUID
   * @returns {Promise<Array>}
   */
  async getCommissionSales(partnerId) {
    try {
      // Try new commission_sales table first
      const { data, error } = await supabase
        .from('commission_sales')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('[OrderTracking] commission_sales not available, trying affiliate_commissions...');

        // Fallback to affiliate_commissions
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('affiliate_commissions')
          .select('*')
          .eq('affiliate_id', partnerId)
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }

      return data || [];
    } catch (error) {
      console.error('[OrderTracking] getCommissionSales error:', error);
      return [];
    }
  }

  /**
   * Get commission summary stats
   * @param {string} partnerId - Partner UUID
   * @returns {Promise<Object>}
   */
  async getCommissionStats(partnerId) {
    try {
      const commissions = await this.getCommissionSales(partnerId);

      const stats = {
        totalCommission: 0,
        pendingCommission: 0,
        paidCommission: 0,
        totalOrders: commissions.length,
        pendingOrders: 0,
        paidOrders: 0,
      };

      commissions.forEach((c) => {
        const amount = c.commission_amount || 0;
        stats.totalCommission += amount;

        if (c.status === 'pending') {
          stats.pendingCommission += amount;
          stats.pendingOrders++;
        } else if (c.status === 'paid' || c.status === 'completed') {
          stats.paidCommission += amount;
          stats.paidOrders++;
        }
      });

      return stats;
    } catch (error) {
      console.error('[OrderTracking] getCommissionStats error:', error);
      return {
        totalCommission: 0,
        pendingCommission: 0,
        paidCommission: 0,
        totalOrders: 0,
        pendingOrders: 0,
        paidOrders: 0,
      };
    }
  }

  /**
   * Get monthly commission breakdown
   * @param {string} partnerId - Partner UUID
   * @param {number} months - Number of months to look back (default: 6)
   * @returns {Promise<Array>}
   */
  async getMonthlyCommissions(partnerId, months = 6) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data, error } = await supabase
        .from('commission_sales')
        .select('*')
        .eq('partner_id', partnerId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData = {};
      (data || []).forEach((sale) => {
        const date = new Date(sale.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            totalSales: 0,
            totalCommission: 0,
            orderCount: 0,
          };
        }

        monthlyData[monthKey].totalSales += sale.order_total || 0;
        monthlyData[monthKey].totalCommission += sale.commission_amount || 0;
        monthlyData[monthKey].orderCount++;
      });

      return Object.values(monthlyData);
    } catch (error) {
      console.error('[OrderTracking] getMonthlyCommissions error:', error);
      return [];
    }
  }

  /**
   * Get recent orders with commission info
   * @param {string} partnerId - Partner UUID
   * @param {number} limit - Number of orders to return
   * @returns {Promise<Array>}
   */
  async getRecentOrdersWithCommission(partnerId, limit = 10) {
    try {
      // Get recent commission sales
      const { data: commissions, error: commError } = await supabase
        .from('commission_sales')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (commError) {
        // Fallback: Get orders and calculate commission
        const orders = await this.getPartnerOrders(partnerId);
        return orders.slice(0, limit).map((order) => ({
          ...order,
          commission_amount: this.calculateCommission(order.total_price, order.product_type),
          commission_status: order.financial_status === 'paid' ? 'pending' : 'waiting',
        }));
      }

      return commissions || [];
    } catch (error) {
      console.error('[OrderTracking] getRecentOrdersWithCommission error:', error);
      return [];
    }
  }

  /**
   * Calculate commission based on product type
   * @param {number} amount - Order amount
   * @param {string} productType - 'digital' or 'physical'
   * @param {number} rate - Commission rate (optional, will use default)
   * @returns {number}
   */
  calculateCommission(amount, productType, rate = null) {
    if (!amount) return 0;

    // Default rates if not provided
    let commissionRate = rate;
    if (commissionRate === null) {
      // Digital products: higher commission
      // Physical products: lower commission
      commissionRate = productType === 'digital' ? 0.10 : 0.05;
    }

    return Math.floor(amount * commissionRate);
  }

  /**
   * Get KPI performance data
   * @param {string} partnerId - Partner UUID
   * @returns {Promise<Object>}
   */
  async getKPIPerformance(partnerId) {
    try {
      // Try to get from monthly_kpi_performance table
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const { data, error } = await supabase
        .from('monthly_kpi_performance')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('month', currentMonth)
        .single();

      if (error) {
        console.log('[OrderTracking] KPI table not available');
        return null;
      }

      return data;
    } catch (error) {
      console.error('[OrderTracking] getKPIPerformance error:', error);
      return null;
    }
  }

  /**
   * Get course enrollments for KPI tracking
   * @param {string} partnerId - Partner UUID
   * @returns {Promise<Array>}
   */
  async getCourseEnrollments(partnerId) {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('partner_id', partnerId)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.log('[OrderTracking] course_enrollments table not available');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[OrderTracking] getCourseEnrollments error:', error);
      return [];
    }
  }

  /**
   * Get order details by Shopify order ID
   * @param {string} shopifyOrderId - Shopify order ID
   * @returns {Promise<Object|null>}
   */
  async getOrderDetails(shopifyOrderId) {
    try {
      const { data, error } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('shopify_order_id', shopifyOrderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[OrderTracking] getOrderDetails error:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time order updates
   * @param {string} partnerId - Partner UUID
   * @param {function} callback - Callback function for updates
   * @returns {object} Subscription object
   */
  subscribeToOrders(partnerId, callback) {
    return supabase
      .channel(`orders:partner:${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopify_orders',
          filter: `partner_id=eq.${partnerId}`,
        },
        (payload) => {
          console.log('[OrderTracking] Order update:', payload);
          callback(payload);
        }
      )
      .subscribe();
  }

  /**
   * Subscribe to commission updates
   * @param {string} partnerId - Partner UUID
   * @param {function} callback - Callback function for updates
   * @returns {object} Subscription object
   */
  subscribeToCommissions(partnerId, callback) {
    return supabase
      .channel(`commissions:partner:${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commission_sales',
          filter: `partner_id=eq.${partnerId}`,
        },
        (payload) => {
          console.log('[OrderTracking] Commission update:', payload);
          callback(payload);
        }
      )
      .subscribe();
  }
}

export const orderTrackingService = new OrderTrackingService();
export default orderTrackingService;
