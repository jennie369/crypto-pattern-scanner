// =====================================================
// COMPOSITOR SERVICE
// Video Overlay & Composition for AI Livestream
// Merges avatar + products + comments into stream
// =====================================================

import { COLORS, TYPOGRAPHY, SPACING } from '../utils/tokens';

// =====================================================
// CONFIGURATION
// =====================================================

const COMPOSITOR_CONFIG = {
  // Canvas dimensions (16:9 aspect ratio)
  width: 1280,
  height: 720,

  // Layout zones
  zones: {
    avatar: {
      x: 0,
      y: 0,
      width: 720,
      height: 720,
      anchor: 'center',
    },
    productOverlay: {
      x: 740,
      y: 20,
      width: 520,
      height: 300,
      anchor: 'top-right',
    },
    commentFeed: {
      x: 740,
      y: 340,
      width: 520,
      height: 280,
      anchor: 'bottom-right',
    },
    statusBar: {
      x: 20,
      y: 20,
      width: 200,
      height: 40,
      anchor: 'top-left',
    },
    viewerCount: {
      x: 20,
      y: 680,
      width: 150,
      height: 30,
      anchor: 'bottom-left',
    },
  },

  // Animation settings
  animations: {
    productSlideIn: 300, // ms
    commentFadeIn: 200,
    expressionTransition: 150,
  },

  // Overlay styles
  styles: {
    backgroundColor: COLORS.bgDarkest,
    overlayOpacity: 0.85,
    borderRadius: 12,
    shadowBlur: 20,
    fontFamily: TYPOGRAPHY.fontFamily.primary,
  },
};

// =====================================================
// OVERLAY TEMPLATES
// =====================================================

const OVERLAY_TEMPLATES = {
  // Product card overlay
  productCard: {
    padding: 16,
    imageSize: 120,
    titleFontSize: 16,
    priceFontSize: 20,
    descFontSize: 12,
    backgroundColor: 'rgba(17, 34, 80, 0.9)', // navy with opacity
    borderColor: COLORS.gold,
    borderWidth: 2,
  },

  // Comment bubble
  commentBubble: {
    padding: 12,
    avatarSize: 32,
    usernameFontSize: 12,
    messageFontSize: 14,
    maxLines: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    platformColors: {
      gemral: COLORS.gold,
      tiktok: '#00F2EA',
      facebook: '#1877F2',
    },
  },

  // Status badge
  statusBadge: {
    padding: 8,
    fontSize: 12,
    liveColor: '#FF0000',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  // Viewer count
  viewerCount: {
    padding: 8,
    fontSize: 14,
    iconSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
};

// =====================================================
// COMPOSITOR STATE
// =====================================================

let compositorState = {
  isActive: false,
  currentProduct: null,
  recentComments: [],
  maxComments: 5,
  viewerCount: 0,
  isLive: false,
  avatarExpression: 'neutral',
  overlayElements: [],
  animationQueue: [],
};

// =====================================================
// COMPOSITOR SERVICE
// =====================================================

export const compositorService = {
  // ===================================================
  // INITIALIZATION
  // ===================================================

  /**
   * Initialize compositor
   * @returns {Promise<boolean>}
   */
  async initialize() {
    try {
      console.log('[CompositorService] Initializing...');

      compositorState = {
        isActive: false,
        currentProduct: null,
        recentComments: [],
        maxComments: 5,
        viewerCount: 0,
        isLive: false,
        avatarExpression: 'neutral',
        overlayElements: [],
        animationQueue: [],
      };

      console.log('[CompositorService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[CompositorService] Initialization failed:', error);
      return false;
    }
  },

  /**
   * Start compositor
   */
  start() {
    compositorState.isActive = true;
    compositorState.isLive = true;
    console.log('[CompositorService] Started');
  },

  /**
   * Stop compositor
   */
  stop() {
    compositorState.isActive = false;
    compositorState.isLive = false;
    compositorState.overlayElements = [];
    console.log('[CompositorService] Stopped');
  },

  // ===================================================
  // PRODUCT OVERLAY
  // ===================================================

  /**
   * Show product overlay in stream
   * @param {Object} product - Product to display
   * @param {Object} options - Display options
   */
  showProduct(product, options = {}) {
    const {
      duration = 10000, // 10 seconds default
      animation = 'slideIn',
      position = 'default',
    } = options;

    if (!product) {
      console.warn('[CompositorService] No product provided');
      return;
    }

    compositorState.currentProduct = {
      ...product,
      displayedAt: Date.now(),
      duration,
      animation,
      position,
    };

    // Add to overlay elements
    this._addOverlayElement({
      type: 'product',
      data: product,
      zone: 'productOverlay',
      animation,
      duration,
      startTime: Date.now(),
    });

    console.log('[CompositorService] Showing product:', product.title);

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        this.hideProduct();
      }, duration);
    }
  },

  /**
   * Hide current product overlay
   */
  hideProduct() {
    compositorState.currentProduct = null;
    this._removeOverlayElement('product');
    console.log('[CompositorService] Product hidden');
  },

  /**
   * Update product display (e.g., for flash sale countdown)
   * @param {Object} updates - Updates to apply
   */
  updateProduct(updates) {
    if (compositorState.currentProduct) {
      compositorState.currentProduct = {
        ...compositorState.currentProduct,
        ...updates,
      };
    }
  },

  // ===================================================
  // COMMENT OVERLAY
  // ===================================================

  /**
   * Add comment to overlay
   * @param {Object} comment - Comment to add
   */
  addComment(comment) {
    if (!comment || !comment.message) return;

    const formattedComment = {
      id: comment.id || Date.now().toString(),
      username: comment.platform_username || comment.username || 'User',
      message: comment.message,
      platform: comment.platform || 'gemral',
      avatar: comment.platform_avatar || comment.avatar,
      emotion: comment.emotion,
      hasGift: !!comment.gift_id,
      giftValue: comment.gift_value || 0,
      addedAt: Date.now(),
    };

    // Add to recent comments (max 5)
    compositorState.recentComments.unshift(formattedComment);
    if (compositorState.recentComments.length > compositorState.maxComments) {
      compositorState.recentComments.pop();
    }

    // Add animation to queue
    this._queueAnimation({
      type: 'commentFadeIn',
      targetId: formattedComment.id,
      duration: COMPOSITOR_CONFIG.animations.commentFadeIn,
    });

    console.log('[CompositorService] Comment added:', formattedComment.username);
  },

  /**
   * Clear all comments from overlay
   */
  clearComments() {
    compositorState.recentComments = [];
    console.log('[CompositorService] Comments cleared');
  },

  /**
   * Highlight a specific comment
   * @param {string} commentId - Comment ID to highlight
   */
  highlightComment(commentId) {
    const comment = compositorState.recentComments.find((c) => c.id === commentId);
    if (comment) {
      comment.highlighted = true;
      this._queueAnimation({
        type: 'commentHighlight',
        targetId: commentId,
        duration: 500,
      });
    }
  },

  // ===================================================
  // AVATAR OVERLAY
  // ===================================================

  /**
   * Update avatar expression
   * @param {string} expression - Expression to show
   */
  setAvatarExpression(expression) {
    const validExpressions = [
      'neutral',
      'happy',
      'sad',
      'excited',
      'thinking',
      'surprised',
      'apologetic',
    ];

    if (!validExpressions.includes(expression)) {
      console.warn('[CompositorService] Invalid expression:', expression);
      return;
    }

    const previousExpression = compositorState.avatarExpression;
    compositorState.avatarExpression = expression;

    // Queue transition animation
    this._queueAnimation({
      type: 'expressionTransition',
      from: previousExpression,
      to: expression,
      duration: COMPOSITOR_CONFIG.animations.expressionTransition,
    });

    console.log('[CompositorService] Avatar expression changed to:', expression);
  },

  // ===================================================
  // STATUS OVERLAYS
  // ===================================================

  /**
   * Update viewer count
   * @param {number} count - Viewer count
   */
  updateViewerCount(count) {
    compositorState.viewerCount = count;
  },

  /**
   * Show notification toast
   * @param {Object} notification - Notification to show
   */
  showNotification(notification) {
    const { type, title, message, duration = 5000 } = notification;

    this._addOverlayElement({
      type: 'notification',
      data: { type, title, message },
      zone: 'statusBar',
      animation: 'slideDown',
      duration,
      startTime: Date.now(),
    });

    // Auto-hide
    setTimeout(() => {
      this._removeOverlayElement('notification');
    }, duration);
  },

  /**
   * Show gift animation
   * @param {Object} gift - Gift data
   */
  showGiftAnimation(gift) {
    const { username, giftType, giftValue, giftEmoji = '🎁' } = gift;

    this._addOverlayElement({
      type: 'giftAnimation',
      data: { username, giftType, giftValue, giftEmoji },
      zone: 'center',
      animation: 'pop',
      duration: 3000,
      startTime: Date.now(),
    });

    // Auto-hide
    setTimeout(() => {
      this._removeOverlayElement('giftAnimation');
    }, 3000);
  },

  // ===================================================
  // RENDER DATA GENERATION
  // ===================================================

  /**
   * Get current composition data for rendering
   * @returns {Object}
   */
  getCompositionData() {
    return {
      config: COMPOSITOR_CONFIG,
      templates: OVERLAY_TEMPLATES,
      state: {
        isActive: compositorState.isActive,
        isLive: compositorState.isLive,
        viewerCount: compositorState.viewerCount,
        avatarExpression: compositorState.avatarExpression,
      },
      layers: {
        avatar: {
          zone: COMPOSITOR_CONFIG.zones.avatar,
          expression: compositorState.avatarExpression,
        },
        product: compositorState.currentProduct
          ? {
              zone: COMPOSITOR_CONFIG.zones.productOverlay,
              template: OVERLAY_TEMPLATES.productCard,
              data: compositorState.currentProduct,
            }
          : null,
        comments: {
          zone: COMPOSITOR_CONFIG.zones.commentFeed,
          template: OVERLAY_TEMPLATES.commentBubble,
          items: compositorState.recentComments,
        },
        status: {
          zone: COMPOSITOR_CONFIG.zones.statusBar,
          template: OVERLAY_TEMPLATES.statusBadge,
          isLive: compositorState.isLive,
        },
        viewers: {
          zone: COMPOSITOR_CONFIG.zones.viewerCount,
          template: OVERLAY_TEMPLATES.viewerCount,
          count: compositorState.viewerCount,
        },
      },
      overlayElements: compositorState.overlayElements,
      animations: compositorState.animationQueue,
    };
  },

  /**
   * Generate CSS styles for web rendering
   * @returns {Object}
   */
  generateStyles() {
    const { zones, styles } = COMPOSITOR_CONFIG;

    return {
      container: {
        width: COMPOSITOR_CONFIG.width,
        height: COMPOSITOR_CONFIG.height,
        backgroundColor: styles.backgroundColor,
        position: 'relative',
        overflow: 'hidden',
      },
      avatarZone: {
        position: 'absolute',
        left: zones.avatar.x,
        top: zones.avatar.y,
        width: zones.avatar.width,
        height: zones.avatar.height,
      },
      productZone: {
        position: 'absolute',
        left: zones.productOverlay.x,
        top: zones.productOverlay.y,
        width: zones.productOverlay.width,
        height: zones.productOverlay.height,
        backgroundColor: OVERLAY_TEMPLATES.productCard.backgroundColor,
        borderRadius: styles.borderRadius,
        border: `${OVERLAY_TEMPLATES.productCard.borderWidth}px solid ${OVERLAY_TEMPLATES.productCard.borderColor}`,
        padding: OVERLAY_TEMPLATES.productCard.padding,
      },
      commentZone: {
        position: 'absolute',
        left: zones.commentFeed.x,
        top: zones.commentFeed.y,
        width: zones.commentFeed.width,
        height: zones.commentFeed.height,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      },
      statusZone: {
        position: 'absolute',
        left: zones.statusBar.x,
        top: zones.statusBar.y,
        backgroundColor: OVERLAY_TEMPLATES.statusBadge.backgroundColor,
        borderRadius: 8,
        padding: OVERLAY_TEMPLATES.statusBadge.padding,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      viewerZone: {
        position: 'absolute',
        left: zones.viewerCount.x,
        top: zones.viewerCount.y,
        backgroundColor: OVERLAY_TEMPLATES.viewerCount.backgroundColor,
        borderRadius: 8,
        padding: OVERLAY_TEMPLATES.viewerCount.padding,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
    };
  },

  /**
   * Generate React Native styles
   * @returns {Object}
   */
  generateRNStyles() {
    const { zones, styles } = COMPOSITOR_CONFIG;
    const scale = 1; // Adjust based on screen size

    return {
      container: {
        width: COMPOSITOR_CONFIG.width * scale,
        height: COMPOSITOR_CONFIG.height * scale,
        backgroundColor: styles.backgroundColor,
        position: 'relative',
      },
      avatarZone: {
        position: 'absolute',
        left: zones.avatar.x * scale,
        top: zones.avatar.y * scale,
        width: zones.avatar.width * scale,
        height: zones.avatar.height * scale,
      },
      productZone: {
        position: 'absolute',
        left: zones.productOverlay.x * scale,
        top: zones.productOverlay.y * scale,
        width: zones.productOverlay.width * scale,
        backgroundColor: OVERLAY_TEMPLATES.productCard.backgroundColor,
        borderRadius: styles.borderRadius,
        borderWidth: OVERLAY_TEMPLATES.productCard.borderWidth,
        borderColor: OVERLAY_TEMPLATES.productCard.borderColor,
        padding: OVERLAY_TEMPLATES.productCard.padding * scale,
      },
      commentZone: {
        position: 'absolute',
        left: zones.commentFeed.x * scale,
        top: zones.commentFeed.y * scale,
        width: zones.commentFeed.width * scale,
        height: zones.commentFeed.height * scale,
      },
    };
  },

  // ===================================================
  // INTERNAL HELPERS
  // ===================================================

  /**
   * Add overlay element
   * @private
   */
  _addOverlayElement(element) {
    // Remove existing element of same type
    this._removeOverlayElement(element.type);

    compositorState.overlayElements.push(element);
  },

  /**
   * Remove overlay element
   * @private
   */
  _removeOverlayElement(type) {
    compositorState.overlayElements = compositorState.overlayElements.filter(
      (el) => el.type !== type
    );
  },

  /**
   * Queue animation
   * @private
   */
  _queueAnimation(animation) {
    compositorState.animationQueue.push({
      ...animation,
      queuedAt: Date.now(),
    });

    // Clean up old animations
    const now = Date.now();
    compositorState.animationQueue = compositorState.animationQueue.filter(
      (a) => now - a.queuedAt < 5000 // Keep for 5 seconds
    );
  },

  // ===================================================
  // GETTERS
  // ===================================================

  /**
   * Get current state
   */
  getState() {
    return { ...compositorState };
  },

  /**
   * Get current product
   */
  getCurrentProduct() {
    return compositorState.currentProduct;
  },

  /**
   * Get recent comments
   */
  getRecentComments() {
    return [...compositorState.recentComments];
  },

  /**
   * Get overlay elements
   */
  getOverlayElements() {
    return [...compositorState.overlayElements];
  },

  /**
   * Check if compositor is active
   */
  isActive() {
    return compositorState.isActive;
  },
};

// =====================================================
// LAYOUT CALCULATOR
// =====================================================

export const layoutCalculator = {
  /**
   * Calculate responsive layout based on screen size
   * @param {number} screenWidth
   * @param {number} screenHeight
   * @returns {Object}
   */
  calculateLayout(screenWidth, screenHeight) {
    const aspectRatio = 16 / 9;
    let width, height;

    if (screenWidth / screenHeight > aspectRatio) {
      // Screen is wider than 16:9
      height = screenHeight;
      width = height * aspectRatio;
    } else {
      // Screen is taller than 16:9
      width = screenWidth;
      height = width / aspectRatio;
    }

    const scale = width / COMPOSITOR_CONFIG.width;

    return {
      width,
      height,
      scale,
      offsetX: (screenWidth - width) / 2,
      offsetY: (screenHeight - height) / 2,
    };
  },

  /**
   * Scale zone dimensions
   * @param {Object} zone
   * @param {number} scale
   */
  scaleZone(zone, scale) {
    return {
      x: zone.x * scale,
      y: zone.y * scale,
      width: zone.width * scale,
      height: zone.height * scale,
    };
  },
};

// =====================================================
// EXPORTS
// =====================================================

export default compositorService;
