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
   * Uses affiliate_sales and affiliate_commissions tables per DATABASE_SCHEMA.md
   * @param {string} partnerId - Partner UUID
   * @returns {Promise<Array>}
   */
  async getCommissionSales(partnerId) {
    try {
      // First get the affiliate_profile id for this user
      const { data: affiliateProfile, error: profileError } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('user_id', partnerId)
        .single();

      if (profileError || !affiliateProfile) {
        console.log('[OrderTracking] No affiliate profile found for user');
        return [];
      }

      // Get sales with commission data from affiliate_sales
      const { data: sales, error: salesError } = await supabase
        .from('affiliate_sales')
        .select(`
          id,
          order_id,
          shopify_order_id,
          product_type,
          product_name,
          sale_amount,
          commission_rate,
          commission_amount,
          status,
          created_at,
          approved_at,
          paid_at
        `)
        .eq('affiliate_id', affiliateProfile.id)
        .order('created_at', { ascending: false });

      if (salesError) {
        console.log('[OrderTracking] affiliate_sales error:', salesError);
        return [];
      }

      // Map to expected format
      return (sales || []).map(sale => ({
        id: sale.id,
        shopify_order_id: sale.shopify_order_id || sale.order_id,
        order_total: sale.sale_amount,
        product_type: sale.product_type === 'course' || sale.product_type === 'subscription' ? 'digital' : 'physical',
        product_category: sale.product_type,
        commission_rate: sale.commission_rate,
        commission_amount: sale.commission_amount,
        status: sale.status,
        created_at: sale.created_at,
        approved_at: sale.approved_at,
        paid_at: sale.paid_at
      }));
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
   * Uses affiliate_sales table per DATABASE_SCHEMA.md
   * @param {string} partnerId - Partner UUID
   * @param {number} months - Number of months to look back (default: 6)
   * @returns {Promise<Array>}
   */
  async getMonthlyCommissions(partnerId, months = 6) {
    try {
      // First get the affiliate_profile id
      const { data: affiliateProfile } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('user_id', partnerId)
        .single();

      if (!affiliateProfile) {
        return [];
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data, error } = await supabase
        .from('affiliate_sales')
        .select('sale_amount, commission_amount, created_at')
        .eq('affiliate_id', affiliateProfile.id)
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

        monthlyData[monthKey].totalSales += parseFloat(sale.sale_amount) || 0;
        monthlyData[monthKey].totalCommission += parseFloat(sale.commission_amount) || 0;
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
   * Uses affiliate_sales table per DATABASE_SCHEMA.md
   * @param {string} partnerId - Partner UUID
   * @param {number} limit - Number of orders to return
   * @returns {Promise<Array>}
   */
  async getRecentOrdersWithCommission(partnerId, limit = 10) {
    try {
      // First get the affiliate_profile id
      const { data: affiliateProfile } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('user_id', partnerId)
        .single();

      if (!affiliateProfile) {
        return [];
      }

      // Get recent sales
      const { data: sales, error: salesError } = await supabase
        .from('affiliate_sales')
        .select(`
          id,
          order_id,
          shopify_order_id,
          product_type,
          product_name,
          sale_amount,
          commission_rate,
          commission_amount,
          status,
          created_at
        `)
        .eq('affiliate_id', affiliateProfile.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (salesError) {
        console.log('[OrderTracking] affiliate_sales error:', salesError);
        return [];
      }

      // Map to expected format
      return (sales || []).map(sale => ({
        id: sale.id,
        shopify_order_id: sale.shopify_order_id || sale.order_id,
        order_total: sale.sale_amount,
        product_type: sale.product_type === 'course' || sale.product_type === 'subscription' ? 'digital' : 'physical',
        product_category: sale.product_type,
        commission_rate: sale.commission_rate,
        commission_amount: sale.commission_amount,
        status: sale.status,
        created_at: sale.created_at
      }));
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
   * Uses affiliate_sales table per DATABASE_SCHEMA.md
   * Note: Requires affiliate_profile.id, not user_id directly
   * @param {string} affiliateProfileId - Affiliate Profile UUID (from affiliate_profiles table)
   * @param {function} callback - Callback function for updates
   * @returns {object} Subscription object
   */
  subscribeToCommissions(affiliateProfileId, callback) {
    return supabase
      .channel(`commissions:affiliate:${affiliateProfileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'affiliate_sales',
          filter: `affiliate_id=eq.${affiliateProfileId}`,
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
