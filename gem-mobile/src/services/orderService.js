/**
 * Gemral - Order Service
 * Manages orders from Shopify + local storage + Supabase sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { shopifyService } from './shopifyService';
import { notificationService } from './notificationService';

const ORDERS_STORAGE_KEY = '@gem_orders';
const ORDER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class OrderService {
  constructor() {
    this._ordersCache = null;
    this._cacheTime = 0;
  }

  /**
   * Save order locally after checkout
   */
  async saveLocalOrder(orderData) {
    try {
      console.log('[OrderService] Saving local order:', orderData);

      const orders = await this.getLocalOrders();

      const now = new Date().toISOString();
      const newOrder = {
        id: orderData.orderId || `local_${Date.now()}`,
        shopifyOrderId: orderData.orderId,
        orderNumber: orderData.orderNumber || orderData.orderId,
        status: 'processing',
        totalPrice: orderData.totalPrice || 0,
        currency: 'VND',
        items: orderData.items || [],
        createdAt: now,
        updatedAt: now,
        checkoutUrl: orderData.checkoutUrl,
        synced: false,
        // Status timestamps for timeline
        confirmedAt: now,
        processingAt: now,
        shippedAt: null,
        deliveredAt: null,
        cancelledAt: null,
        // Status history
        statusHistory: [
          { status: 'pending', timestamp: now, note: 'Đơn hàng đã được tạo' },
          { status: 'confirmed', timestamp: now, note: 'Thanh toán thành công' },
          { status: 'processing', timestamp: now, note: 'Đang chuẩn bị đơn hàng' },
        ],
      };

      // Add to beginning of list
      orders.unshift(newOrder);

      // Keep only last 50 orders locally
      const trimmedOrders = orders.slice(0, 50);

      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(trimmedOrders));
      this._ordersCache = trimmedOrders;
      this._cacheTime = Date.now();

      console.log('[OrderService] Order saved locally');
      return newOrder;
    } catch (error) {
      console.error('[OrderService] saveLocalOrder error:', error);
      throw error;
    }
  }

  /**
   * Get orders from local storage
   */
  async getLocalOrders() {
    try {
      const stored = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[OrderService] getLocalOrders error:', error);
      return [];
    }
  }

  /**
   * Get user orders (combines local + Supabase)
   */
  async getUserOrders(userId, options = {}) {
    const { status = null, limit = 50, forceRefresh = false } = options;

    try {
      // Check cache
      if (!forceRefresh && this._ordersCache && Date.now() - this._cacheTime < ORDER_CACHE_DURATION) {
        console.log('[OrderService] Using cached orders');
        let orders = this._ordersCache;
        if (status) {
          orders = orders.filter((o) => o.status === status);
        }
        return orders.slice(0, limit);
      }

      console.log('[OrderService] Fetching orders for user:', userId);

      // Try to get from Supabase first
      let supabaseOrders = [];
      if (userId) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (!error && data) {
            supabaseOrders = data.map(this.transformSupabaseOrder);
          }
        } catch (err) {
          console.warn('[OrderService] Supabase fetch failed:', err);
        }
      }

      // Get local orders
      const localOrders = await this.getLocalOrders();

      // Merge orders (prefer Supabase data, add local-only orders)
      const mergedOrders = this.mergeOrders(supabaseOrders, localOrders);

      // Filter by status if needed
      let filteredOrders = mergedOrders;
      if (status) {
        filteredOrders = mergedOrders.filter((o) => o.status === status);
      }

      // Update cache
      this._ordersCache = mergedOrders;
      this._cacheTime = Date.now();

      return filteredOrders.slice(0, limit);
    } catch (error) {
      console.error('[OrderService] getUserOrders error:', error);

      // Fallback to local orders
      const localOrders = await this.getLocalOrders();
      if (status) {
        return localOrders.filter((o) => o.status === status);
      }
      return localOrders;
    }
  }

  /**
   * Get single order detail
   */
  async getOrderDetail(orderId, userId) {
    try {
      console.log('[OrderService] Getting order detail:', orderId);

      // Try Supabase first
      if (userId) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', userId)
            .single();

          if (!error && data) {
            return this.transformSupabaseOrder(data);
          }
        } catch (err) {
          console.warn('[OrderService] Supabase order fetch failed:', err);
        }
      }

      // Fallback to local
      const localOrders = await this.getLocalOrders();
      const localOrder = localOrders.find(
        (o) => o.id === orderId || o.shopifyOrderId === orderId || o.orderNumber === orderId
      );

      return localOrder || null;
    } catch (error) {
      console.error('[OrderService] getOrderDetail error:', error);
      return null;
    }
  }

  /**
   * Sync local order to Supabase
   */
  async syncOrderToSupabase(order, userId) {
    if (!userId) {
      console.warn('[OrderService] Cannot sync - no user ID');
      return null;
    }

    try {
      console.log('[OrderService] Syncing order to Supabase:', order.id);

      const orderData = {
        user_id: userId,
        shopify_order_id: order.shopifyOrderId || order.id,
        shopify_order_number: order.orderNumber,
        status: order.status || 'processing',
        total_price: order.totalPrice || 0,
        currency: order.currency || 'VND',
        items: order.items || [],
        shipping_address: order.shippingAddress || null,
        payment_status: order.paymentStatus || 'paid',
        created_at: order.createdAt,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('orders').upsert(orderData, {
        onConflict: 'shopify_order_id',
      });

      if (error) {
        console.error('[OrderService] Sync error:', error);
        return null;
      }

      // Mark local order as synced
      await this.markOrderSynced(order.id);

      return data;
    } catch (error) {
      console.error('[OrderService] syncOrderToSupabase error:', error);
      return null;
    }
  }

  /**
   * Mark local order as synced
   */
  async markOrderSynced(orderId) {
    try {
      const orders = await this.getLocalOrders();
      const updated = orders.map((o) => (o.id === orderId ? { ...o, synced: true } : o));
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[OrderService] markOrderSynced error:', error);
    }
  }

  /**
   * Update order status locally with history tracking
   */
  async updateOrderStatus(orderId, newStatus, note = null) {
    try {
      const now = new Date().toISOString();
      const orders = await this.getLocalOrders();

      const statusNotes = {
        pending: 'Đơn hàng đang chờ xử lý',
        confirmed: 'Đơn hàng đã được xác nhận',
        processing: 'Đang chuẩn bị đơn hàng',
        shipped: 'Đơn hàng đang được giao',
        delivered: 'Đơn hàng đã giao thành công',
        cancelled: 'Đơn hàng đã bị hủy',
      };

      const updated = orders.map((o) => {
        if (o.id === orderId || o.shopifyOrderId === orderId) {
          // Update status timestamp
          const timestampKey = `${newStatus}At`;
          const statusUpdate = {
            ...o,
            status: newStatus,
            updatedAt: now,
            [timestampKey]: now,
          };

          // Add to status history
          const historyEntry = {
            status: newStatus,
            timestamp: now,
            note: note || statusNotes[newStatus] || `Trạng thái: ${newStatus}`,
          };

          statusUpdate.statusHistory = [
            ...(o.statusHistory || []),
            historyEntry,
          ];

          // Send notification for status change
          notificationService.sendOrderNotification(statusUpdate, newStatus);

          return statusUpdate;
        }
        return o;
      });

      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      this._ordersCache = updated;
      return true;
    } catch (error) {
      console.error('[OrderService] updateOrderStatus error:', error);
      return false;
    }
  }

  /**
   * Transform Supabase order to app format
   */
  transformSupabaseOrder(dbOrder) {
    return {
      id: dbOrder.id,
      shopifyOrderId: dbOrder.shopify_order_id,
      orderNumber: dbOrder.shopify_order_number,
      status: dbOrder.status,
      totalPrice: dbOrder.total_price,
      currency: dbOrder.currency,
      items: dbOrder.items || [],
      shippingAddress: dbOrder.shipping_address,
      trackingNumber: dbOrder.tracking_number,
      trackingUrl: dbOrder.tracking_url,
      paymentStatus: dbOrder.payment_status,
      createdAt: dbOrder.created_at,
      updatedAt: dbOrder.updated_at,
      // Status timestamps
      confirmedAt: dbOrder.confirmed_at || dbOrder.created_at,
      processingAt: dbOrder.processing_at,
      shippedAt: dbOrder.shipped_at,
      deliveredAt: dbOrder.delivered_at,
      cancelledAt: dbOrder.cancelled_at,
      cancelReason: dbOrder.cancel_reason,
      // Status history
      statusHistory: dbOrder.status_history || [],
      synced: true,
    };
  }

  /**
   * Merge Supabase and local orders
   */
  mergeOrders(supabaseOrders, localOrders) {
    const orderMap = new Map();

    // Add Supabase orders first (they take priority)
    supabaseOrders.forEach((order) => {
      orderMap.set(order.shopifyOrderId || order.id, order);
    });

    // Add local orders that aren't in Supabase
    localOrders.forEach((order) => {
      const key = order.shopifyOrderId || order.id;
      if (!orderMap.has(key)) {
        orderMap.set(key, order);
      }
    });

    // Convert to array and sort by date
    return Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Get order status display info
   */
  getStatusInfo(status) {
    const statusMap = {
      pending: {
        label: 'Cho xu ly',
        color: '#FFBD59',
        icon: 'clock',
      },
      processing: {
        label: 'Dang xu ly',
        color: '#6A5BFF',
        icon: 'package',
      },
      shipped: {
        label: 'Dang giao',
        color: '#00F0FF',
        icon: 'truck',
      },
      delivered: {
        label: 'Da giao',
        color: '#3AF7A6',
        icon: 'check-circle',
      },
      cancelled: {
        label: 'Da huy',
        color: '#FF6B6B',
        icon: 'x-circle',
      },
    };

    return statusMap[status] || statusMap.pending;
  }

  /**
   * Clear orders cache
   */
  clearCache() {
    this._ordersCache = null;
    this._cacheTime = 0;
  }

  /**
   * Clear all local orders (for testing)
   */
  async clearLocalOrders() {
    await AsyncStorage.removeItem(ORDERS_STORAGE_KEY);
    this.clearCache();
  }
}

export const orderService = new OrderService();

// ============================================================
// STANDALONE FUNCTIONS FOR SHOPIFY ORDERS (V3)
// ============================================================

/**
 * Fetch orders from shopify_orders table (with linked_emails support)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of orders
 */
export const fetchUserOrdersFromShopify = async (userId) => {
  try {
    // 1. Get user profile with email and linked_emails
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, linked_emails')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('[OrderService] Profile not found:', profileError);
      throw new Error('Không tìm thấy thông tin tài khoản');
    }

    // 2. Build list of all emails to search
    const emails = [profile.email, ...(profile.linked_emails || [])].filter(Boolean);

    if (emails.length === 0) {
      return [];
    }

    // 3. Query shopify_orders where email IN (all_emails)
    const { data: orders, error: ordersError } = await supabase
      .from('shopify_orders')
      .select('*')
      .in('email', emails)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('[OrderService] Fetch orders error:', ordersError);
      throw ordersError;
    }

    return orders || [];
  } catch (error) {
    console.error('[OrderService] fetchUserOrdersFromShopify error:', error);
    throw error;
  }
};

/**
 * Fetch single order detail from shopify_orders
 * @param {string} orderId - Order UUID
 * @returns {Promise<Object|null>} Order detail
 */
export const fetchShopifyOrderDetail = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('[OrderService] Fetch order detail error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[OrderService] fetchShopifyOrderDetail error:', error);
    throw error;
  }
};

/**
 * Link email to user's profile
 * @param {string} userId - User ID
 * @param {string} email - Email to link
 * @returns {Promise<Object>} { success, message }
 */
export const linkEmailToAccount = async (userId, email) => {
  try {
    // 1. Get current linked_emails
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('linked_emails')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error('Không tìm thấy tài khoản');
    }

    const currentEmails = profile?.linked_emails || [];

    // 2. Check if already linked
    if (currentEmails.includes(email)) {
      return { success: true, message: 'Email đã được liên kết trước đó' };
    }

    // 3. Add new email
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ linked_emails: [...currentEmails, email] })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // 4. Apply any pending course access for that email
    const { data: pendingAccess } = await supabase
      .from('pending_course_access')
      .select('*')
      .eq('email', email)
      .eq('applied', false);

    if (pendingAccess && pendingAccess.length > 0) {
      for (const pending of pendingAccess) {
        // Grant course enrollment
        await supabase.from('course_enrollments').upsert({
          user_id: userId,
          course_id: pending.course_id,
          access_type: 'shopify_purchase',
          metadata: { shopify_order_id: pending.shopify_order_id },
          enrolled_at: new Date().toISOString(),
        }, { onConflict: 'user_id,course_id' });

        // Mark as applied
        await supabase
          .from('pending_course_access')
          .update({
            applied: true,
            applied_user_id: userId,
            applied_at: new Date().toISOString(),
          })
          .eq('id', pending.id);
      }
    }

    return { success: true, message: 'Đã liên kết email thành công' };
  } catch (error) {
    console.error('[OrderService] linkEmailToAccount error:', error);
    throw error;
  }
};

/**
 * Link order to user by order number + email
 * @param {string} userId - User ID
 * @param {string} orderNumber - Shopify order number
 * @param {string} email - Email used when ordering
 * @returns {Promise<Object>} { success, message }
 */
export const linkOrderByNumber = async (userId, orderNumber, email) => {
  try {
    // 1. Find order in shopify_orders
    const { data: order, error: findError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('email', email.toLowerCase())
      .single();

    if (findError || !order) {
      return {
        success: false,
        message: 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại số đơn hàng và email.',
      };
    }

    // 2. Check if already linked to this user
    if (order.user_id === userId) {
      return { success: true, message: 'Đơn hàng đã được liên kết với tài khoản của bạn' };
    }

    // 3. Update order's user_id
    const { error: updateError } = await supabase
      .from('shopify_orders')
      .update({ user_id: userId })
      .eq('id', order.id);

    if (updateError) {
      throw updateError;
    }

    // 4. Link email to account as well
    await linkEmailToAccount(userId, email.toLowerCase());

    return { success: true, message: 'Đã liên kết đơn hàng thành công' };
  } catch (error) {
    console.error('[OrderService] linkOrderByNumber error:', error);
    throw error;
  }
};

/**
 * Get Vietnamese status text for order
 * @param {Object} order - Order object
 * @returns {string} Vietnamese status text
 */
export const getOrderStatusText = (order) => {
  if (!order) return 'Không xác định';

  const { financial_status, fulfillment_status } = order;

  if (financial_status === 'refunded') return 'Đã hoàn tiền';
  if (financial_status === 'pending') return 'Chờ thanh toán';
  if (fulfillment_status === 'fulfilled') return 'Đã giao hàng';
  if (financial_status === 'paid') return 'Đã thanh toán';

  return 'Đang xử lý';
};

/**
 * Get status color for order
 * @param {Object} order - Order object
 * @returns {string} Hex color code
 */
export const getOrderStatusColor = (order) => {
  if (!order) return '#888888';

  const { financial_status, fulfillment_status } = order;

  if (financial_status === 'refunded') return '#EF4444'; // Red
  if (financial_status === 'pending') return '#F59E0B'; // Amber
  if (fulfillment_status === 'fulfilled') return '#10B981'; // Green
  if (financial_status === 'paid') return '#3B82F6'; // Blue

  return '#888888'; // Gray
};

export default orderService;
