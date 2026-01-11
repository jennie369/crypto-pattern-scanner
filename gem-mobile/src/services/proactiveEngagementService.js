/**
 * Proactive Engagement Service
 * Phase 4: Intelligence Layer
 *
 * 6 Proactive Triggers for Livestream:
 * 1. idle_viewer - Viewer has not interacted for > 2 minutes
 * 2. cart_abandonment - Items in cart > 3 minutes without checkout
 * 3. new_viewer - Welcome new viewer joining stream
 * 4. price_drop - Product viewer watched has price reduced
 * 5. low_stock - Product viewer is interested in is low stock
 * 6. product_highlight - Periodic product recommendation
 */

import { supabase } from './supabase';
import { livestreamRecommendationService } from './livestreamRecommendationService';
import { livestreamAnalyticsService } from './livestreamAnalyticsService';

class ProactiveEngagementService {
  constructor() {
    this.activeViewers = new Map(); // viewerId -> viewerState
    this.triggers = new Map(); // triggerId -> triggerConfig
    this.cooldowns = new Map(); // `${viewerId}_${triggerType}` -> lastTriggered
    this.checkInterval = null;

    this.initializeTriggers();
  }

  // ============================================================================
  // TRIGGER DEFINITIONS
  // ============================================================================

  initializeTriggers() {
    // 1. IDLE VIEWER - Viewer has not interacted for > 2 minutes
    this.triggers.set('idle_viewer', {
      type: 'idle_viewer',
      name: 'Idle Viewer Engagement',
      description: 'Trigger when viewer has not interacted for > 2 minutes',
      cooldownMs: 5 * 60 * 1000, // 5 minutes
      priority: 3,
      check: (viewerState) => {
        const idleThreshold = 2 * 60 * 1000; // 2 minutes
        const idleTime = Date.now() - viewerState.lastActivity;
        return idleTime > idleThreshold;
      },
      getMessage: async (viewerState, context) => {
        const recs = await livestreamRecommendationService.getProactiveRecommendation(
          viewerState.userId,
          'idle_viewer'
        );
        return {
          type: 'engagement',
          subtype: 'idle_viewer',
          message: 'Ban co muon xem them san pham hot khong?',
          products: recs.products,
          cta: 'Xem ngay',
        };
      },
    });

    // 2. CART ABANDONMENT - Items in cart > 3 minutes without checkout
    this.triggers.set('cart_abandonment', {
      type: 'cart_abandonment',
      name: 'Cart Abandonment Reminder',
      description: 'Trigger when viewer has items in cart > 3 minutes without checkout',
      cooldownMs: 10 * 60 * 1000, // 10 minutes
      priority: 5,
      check: (viewerState) => {
        if (!viewerState.cartItems || viewerState.cartItems.length === 0) {
          return false;
        }
        const cartAddedTime = viewerState.lastCartUpdate || Date.now();
        const timeSinceCartUpdate = Date.now() - cartAddedTime;
        return timeSinceCartUpdate > 3 * 60 * 1000; // 3 minutes
      },
      getMessage: async (viewerState, context) => {
        const cartCount = viewerState.cartItems.length;
        const discount = context.hasDiscount ? context.discountCode : null;

        return {
          type: 'reminder',
          subtype: 'cart_abandonment',
          message: `Ban co ${cartCount} san pham trong gio hang dang cho! ${
            discount ? `Dung ma ${discount} de giam gia nha` : 'Checkout ngay keo het hang!'
          }`,
          cartItems: viewerState.cartItems,
          discount,
          cta: 'Thanh toan ngay',
        };
      },
    });

    // 3. NEW VIEWER WELCOME - Welcome new viewer joining stream
    this.triggers.set('new_viewer', {
      type: 'new_viewer',
      name: 'New Viewer Welcome',
      description: 'Trigger when new viewer joins stream',
      cooldownMs: 60 * 60 * 1000, // 1 hour (per session)
      priority: 4,
      check: (viewerState) => {
        return viewerState.isNewViewer && !viewerState.wasWelcomed;
      },
      getMessage: async (viewerState, context) => {
        const viewerName = viewerState.displayName || 'ban';
        const currentProduct = context.currentProduct;

        return {
          type: 'welcome',
          subtype: 'new_viewer',
          message: `Chao mung ${viewerName} den voi livestream! ${
            currentProduct
              ? `Minh dang gioi thieu ${currentProduct.title} day!`
              : 'Hay thoai mai dat cau hoi nha!'
          }`,
          currentProduct,
          cta: currentProduct ? 'Xem san pham' : null,
        };
      },
    });

    // 4. PRICE DROP NOTIFICATION - Product viewer watched has price reduced
    this.triggers.set('price_drop', {
      type: 'price_drop',
      name: 'Price Drop Alert',
      description: 'Trigger when product viewer watched has price reduced',
      cooldownMs: 30 * 60 * 1000, // 30 minutes
      priority: 6,
      check: (viewerState, context) => {
        return context.priceDrops && context.priceDrops.length > 0;
      },
      getMessage: async (viewerState, context) => {
        const priceDropProduct = context.priceDrops[0];
        const discountPercent = Math.round(
          (1 - priceDropProduct.newPrice / priceDropProduct.oldPrice) * 100
        );

        return {
          type: 'alert',
          subtype: 'price_drop',
          message: `${priceDropProduct.title} vua GIAM ${discountPercent}%! Tu ${priceDropProduct.oldPrice.toLocaleString(
            'vi-VN'
          )}d con ${priceDropProduct.newPrice.toLocaleString('vi-VN')}d`,
          product: priceDropProduct,
          discount: discountPercent,
          cta: 'Mua ngay',
        };
      },
    });

    // 5. LOW STOCK ALERT - Product viewer is interested in is low stock
    this.triggers.set('low_stock', {
      type: 'low_stock',
      name: 'Low Stock Alert',
      description: 'Trigger when product viewer is interested in is low stock',
      cooldownMs: 15 * 60 * 1000, // 15 minutes
      priority: 7,
      check: (viewerState, context) => {
        return context.lowStockProducts && context.lowStockProducts.length > 0;
      },
      getMessage: async (viewerState, context) => {
        const lowStockProduct = context.lowStockProducts[0];

        return {
          type: 'urgency',
          subtype: 'low_stock',
          message: `Chi con ${lowStockProduct.inventory} ${lowStockProduct.title}! Dat ngay keo het nha!`,
          product: lowStockProduct,
          inventory: lowStockProduct.inventory,
          cta: 'Dat ngay',
        };
      },
    });

    // 6. PERIODIC PRODUCT HIGHLIGHT - Periodic product recommendation
    this.triggers.set('product_highlight', {
      type: 'product_highlight',
      name: 'Periodic Product Highlight',
      description: 'Trigger every 5 minutes to highlight new product',
      cooldownMs: 5 * 60 * 1000, // 5 minutes
      priority: 2,
      check: (viewerState, context) => {
        // Always trigger if cooldown passed
        return true;
      },
      getMessage: async (viewerState, context) => {
        // Get personalized product for viewer
        const recs = await livestreamRecommendationService.getProactiveRecommendation(
          viewerState.userId,
          'returning_viewer'
        );

        const highlightProduct = recs.products?.[0];
        if (!highlightProduct) return null;

        return {
          type: 'highlight',
          subtype: 'product_highlight',
          message: `San pham dac biet: ${highlightProduct.title} - Chi ${(
            highlightProduct.variants?.[0]?.price || highlightProduct.price
          )?.toLocaleString('vi-VN')}d`,
          product: highlightProduct,
          cta: 'Xem chi tiet',
        };
      },
    });
  }

  // ============================================================================
  // VIEWER STATE MANAGEMENT
  // ============================================================================

  registerViewer(viewerId, initialState = {}) {
    const state = {
      userId: viewerId,
      displayName: initialState.displayName || null,
      isNewViewer: initialState.isNewViewer ?? true,
      wasWelcomed: false,
      lastActivity: Date.now(),
      lastComment: null,
      cartItems: [],
      lastCartUpdate: null,
      viewedProducts: [],
      joinTime: Date.now(),
      platform: initialState.platform || 'gemral',
    };

    this.activeViewers.set(viewerId, state);
    return state;
  }

  updateViewerActivity(viewerId, activityType, data = {}) {
    const state = this.activeViewers.get(viewerId);
    if (!state) return;

    state.lastActivity = Date.now();

    switch (activityType) {
      case 'comment':
        state.lastComment = { message: data.message, timestamp: Date.now() };
        break;
      case 'product_view':
        if (!state.viewedProducts.includes(data.productId)) {
          state.viewedProducts.push(data.productId);
        }
        break;
      case 'add_to_cart':
        state.cartItems.push(data.item);
        state.lastCartUpdate = Date.now();
        break;
      case 'remove_from_cart':
        state.cartItems = state.cartItems.filter((item) => item.id !== data.itemId);
        break;
      case 'checkout':
        state.cartItems = [];
        state.lastCartUpdate = null;
        break;
      case 'welcomed':
        state.wasWelcomed = true;
        break;
      case 'engagement_clicked':
        // Track that viewer clicked on engagement
        break;
    }

    this.activeViewers.set(viewerId, state);
  }

  removeViewer(viewerId) {
    this.activeViewers.delete(viewerId);
    // Clean up cooldowns for this viewer
    for (const key of this.cooldowns.keys()) {
      if (key.startsWith(`${viewerId}_`)) {
        this.cooldowns.delete(key);
      }
    }
  }

  getViewerState(viewerId) {
    return this.activeViewers.get(viewerId);
  }

  // ============================================================================
  // TRIGGER CHECKING & EXECUTION
  // ============================================================================

  async checkTriggers(viewerId, context = {}) {
    const viewerState = this.activeViewers.get(viewerId);
    if (!viewerState) return null;

    const triggeredEngagements = [];

    // Check each trigger
    for (const [triggerId, trigger] of this.triggers) {
      // Check cooldown
      const cooldownKey = `${viewerId}_${triggerId}`;
      const lastTriggered = this.cooldowns.get(cooldownKey);

      if (lastTriggered && Date.now() - lastTriggered < trigger.cooldownMs) {
        continue;
      }

      // Check trigger condition
      const shouldTrigger = trigger.check(viewerState, context);

      if (shouldTrigger) {
        try {
          const message = await trigger.getMessage(viewerState, context);

          if (message) {
            triggeredEngagements.push({
              triggerId,
              priority: trigger.priority,
              message,
            });
          }
        } catch (error) {
          console.warn(`[ProactiveEngagement] Trigger ${triggerId} error:`, error);
        }
      }
    }

    // Sort by priority (higher first)
    triggeredEngagements.sort((a, b) => b.priority - a.priority);

    // Return highest priority engagement
    if (triggeredEngagements.length > 0) {
      const topEngagement = triggeredEngagements[0];

      // Set cooldown
      const cooldownKey = `${viewerId}_${topEngagement.triggerId}`;
      this.cooldowns.set(cooldownKey, Date.now());

      // Track analytics
      await livestreamAnalyticsService.trackProactiveEngagement(
        context.sessionId,
        topEngagement.triggerId,
        'shown'
      );

      // Mark as welcomed if new_viewer trigger
      if (topEngagement.triggerId === 'new_viewer') {
        this.updateViewerActivity(viewerId, 'welcomed');
      }

      return topEngagement.message;
    }

    return null;
  }

  // ============================================================================
  // AUTO-CHECK LOOP
  // ============================================================================

  startAutoCheck(sessionId, intervalMs = 30000, onEngagement) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      for (const [viewerId] of this.activeViewers) {
        try {
          const engagement = await this.checkTriggers(viewerId, { sessionId });
          if (engagement && onEngagement) {
            onEngagement(viewerId, engagement);
          }
        } catch (error) {
          console.warn('[ProactiveEngagement] Auto-check error:', error);
        }
      }
    }, intervalMs);
  }

  stopAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // ============================================================================
  // BROADCAST TRIGGERS (for all viewers)
  // ============================================================================

  async broadcastTrigger(sessionId, triggerType, data = {}) {
    const results = [];

    for (const [viewerId, viewerState] of this.activeViewers) {
      const context = {
        sessionId,
        ...data,
      };

      const trigger = this.triggers.get(triggerType);
      if (!trigger) continue;

      try {
        const message = await trigger.getMessage(viewerState, context);
        if (message) {
          results.push({
            viewerId,
            message,
          });
        }
      } catch (error) {
        console.warn('[ProactiveEngagement] Broadcast error:', error);
      }
    }

    return results;
  }

  // ============================================================================
  // ENGAGEMENT RESPONSE TRACKING
  // ============================================================================

  async trackEngagementResponse(viewerId, triggerId, action, data = {}) {
    // action: 'clicked', 'dismissed', 'converted'
    await livestreamAnalyticsService.trackProactiveEngagement(
      data.sessionId,
      triggerId,
      action
    );

    if (action === 'clicked') {
      this.updateViewerActivity(viewerId, 'engagement_clicked', { triggerId });
    }
  }

  // ============================================================================
  // MANUAL TRIGGERS
  // ============================================================================

  async triggerWelcome(viewerId, context = {}) {
    const viewerState = this.activeViewers.get(viewerId);
    if (!viewerState || viewerState.wasWelcomed) return null;

    const trigger = this.triggers.get('new_viewer');
    const message = await trigger.getMessage(viewerState, context);

    this.updateViewerActivity(viewerId, 'welcomed');

    return message;
  }

  async triggerProductHighlight(viewerId, product) {
    return {
      type: 'highlight',
      subtype: 'product_highlight',
      message: `San pham hot: ${product.title}`,
      product,
      cta: 'Xem chi tiet',
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  cleanup() {
    this.stopAutoCheck();
    this.activeViewers.clear();
    this.cooldowns.clear();
  }

  getStats() {
    return {
      activeViewers: this.activeViewers.size,
      cooldownsActive: this.cooldowns.size,
      triggers: Array.from(this.triggers.keys()),
    };
  }
}

export const proactiveEngagementService = new ProactiveEngagementService();
export default proactiveEngagementService;
