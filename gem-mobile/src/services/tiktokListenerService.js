// =====================================================
// TIKTOK LISTENER SERVICE
// Capture comments from TikTok Live streams
// Uses TikTok Live Connector or unofficial API
// =====================================================

import { supabase } from './supabase';
import { commentAggregatorService } from './commentAggregatorService';

// =====================================================
// CONFIGURATION
// =====================================================

const TIKTOK_CONFIG = {
  // TikTok Live Connector WebSocket (unofficial)
  // In production, you'd use tiktoklive-connector library
  wsEndpoint: process.env.EXPO_PUBLIC_TIKTOK_WS_URL || 'wss://tiktok-live-proxy.your-server.com',

  // Reconnection settings
  reconnect: {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },

  // Rate limiting
  rateLimit: {
    maxCommentsPerSecond: 50,
    cooldownMs: 100,
  },

  // Comment processing
  processing: {
    maxMessageLength: 500,
    filterSpam: true,
    detectEmoji: true,
  },
};

// =====================================================
// TIKTOK EVENT TYPES
// =====================================================

const TIKTOK_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  COMMENT: 'comment',
  GIFT: 'gift',
  LIKE: 'like',
  SHARE: 'share',
  FOLLOW: 'follow',
  JOIN: 'join',
  VIEWER_COUNT: 'viewerCount',
  LIVE_END: 'liveEnd',
  ERROR: 'error',
};

// =====================================================
// LISTENER STATE
// =====================================================

let listenerState = {
  isConnected: false,
  isConnecting: false,
  sessionId: null,
  tiktokUsername: null,
  roomId: null,
  viewerCount: 0,
  likeCount: 0,
  shareCount: 0,
  reconnectAttempts: 0,
  lastEventTime: null,
  ws: null,
};

// Event callbacks
const eventCallbacks = {
  onComment: [],
  onGift: [],
  onLike: [],
  onShare: [],
  onFollow: [],
  onJoin: [],
  onViewerCount: [],
  onConnect: [],
  onDisconnect: [],
  onError: [],
};

// =====================================================
// TIKTOK LISTENER SERVICE
// =====================================================

export const tiktokListenerService = {
  // ===================================================
  // CONNECTION MANAGEMENT
  // ===================================================

  /**
   * Connect to TikTok live stream
   * @param {Object} options - Connection options
   * @returns {Promise<boolean>}
   */
  async connect(options = {}) {
    const { sessionId, tiktokUsername, roomId } = options;

    if (listenerState.isConnected || listenerState.isConnecting) {
      console.warn('[TikTokListener] Already connected or connecting');
      return false;
    }

    if (!tiktokUsername && !roomId) {
      console.error('[TikTokListener] tiktokUsername or roomId is required');
      return false;
    }

    try {
      listenerState.isConnecting = true;
      listenerState.sessionId = sessionId;
      listenerState.tiktokUsername = tiktokUsername;
      listenerState.roomId = roomId;

      console.log('[TikTokListener] Connecting to TikTok live:', tiktokUsername || roomId);

      // Create WebSocket connection
      await this._createWebSocketConnection();

      listenerState.isConnected = true;
      listenerState.isConnecting = false;
      listenerState.reconnectAttempts = 0;

      this._notifyCallbacks('onConnect', {
        platform: 'tiktok',
        username: tiktokUsername,
        roomId,
      });

      console.log('[TikTokListener] Connected successfully');
      return true;
    } catch (error) {
      listenerState.isConnecting = false;
      console.error('[TikTokListener] Connection failed:', error);
      this._notifyCallbacks('onError', error);
      return false;
    }
  },

  /**
   * Disconnect from TikTok live stream
   */
  async disconnect() {
    if (!listenerState.isConnected && !listenerState.isConnecting) {
      return;
    }

    try {
      console.log('[TikTokListener] Disconnecting...');

      if (listenerState.ws) {
        listenerState.ws.close();
        listenerState.ws = null;
      }

      const sessionId = listenerState.sessionId;

      // Reset state
      listenerState = {
        isConnected: false,
        isConnecting: false,
        sessionId: null,
        tiktokUsername: null,
        roomId: null,
        viewerCount: 0,
        likeCount: 0,
        shareCount: 0,
        reconnectAttempts: 0,
        lastEventTime: null,
        ws: null,
      };

      this._notifyCallbacks('onDisconnect', { platform: 'tiktok', sessionId });

      console.log('[TikTokListener] Disconnected');
    } catch (error) {
      console.error('[TikTokListener] Disconnect error:', error);
    }
  },

  /**
   * Create WebSocket connection
   * @private
   */
  async _createWebSocketConnection() {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${TIKTOK_CONFIG.wsEndpoint}?username=${listenerState.tiktokUsername}&roomId=${listenerState.roomId || ''}`;

        // In React Native, use react-native-websocket or similar
        // For now, using standard WebSocket (works in Expo with polyfill)
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[TikTokListener] WebSocket connected');
          listenerState.ws = ws;
          resolve(true);
        };

        ws.onmessage = (event) => {
          this._handleMessage(event.data);
        };

        ws.onerror = (error) => {
          console.error('[TikTokListener] WebSocket error:', error);
          this._notifyCallbacks('onError', error);
          reject(error);
        };

        ws.onclose = (event) => {
          console.log('[TikTokListener] WebSocket closed:', event.code, event.reason);
          listenerState.isConnected = false;

          if (!event.wasClean) {
            this._handleReconnect();
          }
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!listenerState.isConnected) {
            ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Handle reconnection
   * @private
   */
  async _handleReconnect() {
    if (listenerState.reconnectAttempts >= TIKTOK_CONFIG.reconnect.maxAttempts) {
      console.error('[TikTokListener] Max reconnect attempts reached');
      this._notifyCallbacks('onError', new Error('Max reconnect attempts reached'));
      return;
    }

    listenerState.reconnectAttempts++;

    const delay = Math.min(
      TIKTOK_CONFIG.reconnect.initialDelay *
        Math.pow(TIKTOK_CONFIG.reconnect.backoffMultiplier, listenerState.reconnectAttempts - 1),
      TIKTOK_CONFIG.reconnect.maxDelay
    );

    console.log(
      `[TikTokListener] Reconnecting in ${delay}ms (attempt ${listenerState.reconnectAttempts})`
    );

    setTimeout(async () => {
      try {
        await this._createWebSocketConnection();
        listenerState.isConnected = true;
        listenerState.reconnectAttempts = 0;
        this._notifyCallbacks('onConnect', { platform: 'tiktok', reconnected: true });
      } catch (error) {
        this._handleReconnect();
      }
    }, delay);
  },

  // ===================================================
  // MESSAGE HANDLING
  // ===================================================

  /**
   * Handle incoming WebSocket message
   * @private
   */
  _handleMessage(data) {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      listenerState.lastEventTime = Date.now();

      switch (message.type) {
        case TIKTOK_EVENTS.COMMENT:
          this._handleComment(message.data);
          break;

        case TIKTOK_EVENTS.GIFT:
          this._handleGift(message.data);
          break;

        case TIKTOK_EVENTS.LIKE:
          this._handleLike(message.data);
          break;

        case TIKTOK_EVENTS.SHARE:
          this._handleShare(message.data);
          break;

        case TIKTOK_EVENTS.FOLLOW:
          this._handleFollow(message.data);
          break;

        case TIKTOK_EVENTS.JOIN:
          this._handleJoin(message.data);
          break;

        case TIKTOK_EVENTS.VIEWER_COUNT:
          this._handleViewerCount(message.data);
          break;

        case TIKTOK_EVENTS.LIVE_END:
          this._handleLiveEnd(message.data);
          break;

        default:
          console.log('[TikTokListener] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[TikTokListener] Message parsing error:', error);
    }
  },

  /**
   * Handle comment event
   * @private
   */
  async _handleComment(data) {
    const comment = this._formatComment(data);

    // Notify local callbacks
    this._notifyCallbacks('onComment', comment);

    // Send to comment aggregator
    if (listenerState.sessionId) {
      try {
        await commentAggregatorService.addComment({
          ...comment,
          session_id: listenerState.sessionId,
        });
      } catch (error) {
        console.error('[TikTokListener] Failed to add comment to aggregator:', error);
      }
    }

    // Save to database
    await this._saveCommentToDatabase(comment);
  },

  /**
   * Handle gift event
   * @private
   */
  _handleGift(data) {
    const gift = {
      id: data.giftId || Date.now().toString(),
      userId: data.userId,
      username: data.nickname || data.uniqueId,
      avatar: data.profilePictureUrl,
      giftId: data.giftId,
      giftName: data.giftName,
      giftType: data.giftType || 'standard',
      giftValue: data.diamondCount || 0,
      repeatCount: data.repeatCount || 1,
      totalValue: (data.diamondCount || 0) * (data.repeatCount || 1),
      platform: 'tiktok',
      timestamp: Date.now(),
    };

    this._notifyCallbacks('onGift', gift);

    // Also treat as a comment for the aggregator
    if (listenerState.sessionId) {
      const giftComment = {
        session_id: listenerState.sessionId,
        platform: 'tiktok',
        platform_user_id: gift.userId,
        platform_username: gift.username,
        platform_avatar: gift.avatar,
        message: `Sent ${gift.giftName} x${gift.repeatCount}`,
        gift_id: gift.id,
        gift_value: gift.totalValue,
        intent: 'GIFT_SENT',
      };

      commentAggregatorService.addComment(giftComment);
    }
  },

  /**
   * Handle like event
   * @private
   */
  _handleLike(data) {
    listenerState.likeCount += data.likeCount || 1;
    this._notifyCallbacks('onLike', {
      userId: data.userId,
      username: data.nickname || data.uniqueId,
      likeCount: data.likeCount || 1,
      totalLikes: listenerState.likeCount,
    });
  },

  /**
   * Handle share event
   * @private
   */
  _handleShare(data) {
    listenerState.shareCount++;
    this._notifyCallbacks('onShare', {
      userId: data.userId,
      username: data.nickname || data.uniqueId,
      totalShares: listenerState.shareCount,
    });
  },

  /**
   * Handle follow event
   * @private
   */
  _handleFollow(data) {
    this._notifyCallbacks('onFollow', {
      userId: data.userId,
      username: data.nickname || data.uniqueId,
      avatar: data.profilePictureUrl,
    });
  },

  /**
   * Handle join event
   * @private
   */
  _handleJoin(data) {
    this._notifyCallbacks('onJoin', {
      userId: data.userId,
      username: data.nickname || data.uniqueId,
      avatar: data.profilePictureUrl,
    });
  },

  /**
   * Handle viewer count update
   * @private
   */
  _handleViewerCount(data) {
    listenerState.viewerCount = data.viewerCount || 0;
    this._notifyCallbacks('onViewerCount', {
      count: listenerState.viewerCount,
      platform: 'tiktok',
    });
  },

  /**
   * Handle live end event
   * @private
   */
  _handleLiveEnd(data) {
    console.log('[TikTokListener] Live stream ended');
    this.disconnect();
  },

  // ===================================================
  // DATA FORMATTING
  // ===================================================

  /**
   * Format TikTok comment to standard format
   * @private
   */
  _formatComment(data) {
    let message = data.comment || data.text || '';

    // Truncate if too long
    if (message.length > TIKTOK_CONFIG.processing.maxMessageLength) {
      message = message.substring(0, TIKTOK_CONFIG.processing.maxMessageLength) + '...';
    }

    return {
      id: data.msgId || Date.now().toString(),
      platform: 'tiktok',
      platform_user_id: data.userId || data.secUid,
      platform_username: data.nickname || data.uniqueId || 'TikTok User',
      platform_avatar: data.profilePictureUrl || null,
      message,
      timestamp: Date.now(),
      raw_data: data,
      // TikTok-specific metadata
      metadata: {
        followRole: data.followRole || 0, // 0: none, 1: follower, 2: following each other
        isSubscriber: data.isSubscriber || false,
        isModerator: data.isModerator || false,
        badges: data.badges || [],
        userLevel: data.userLevel || 0,
      },
    };
  },

  /**
   * Save comment to database
   * @private
   */
  async _saveCommentToDatabase(comment) {
    if (!listenerState.sessionId) return;

    try {
      await supabase.from('livestream_comments').insert({
        session_id: listenerState.sessionId,
        platform: 'tiktok',
        platform_user_id: comment.platform_user_id,
        platform_username: comment.platform_username,
        platform_avatar: comment.platform_avatar,
        message: comment.message,
        created_at: new Date(comment.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('[TikTokListener] Failed to save comment:', error);
    }
  },

  // ===================================================
  // EVENT CALLBACKS
  // ===================================================

  /**
   * Subscribe to event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    const callbackKey = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
    if (eventCallbacks[callbackKey]) {
      eventCallbacks[callbackKey].push(callback);
    }
  },

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    const callbackKey = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
    if (eventCallbacks[callbackKey]) {
      const index = eventCallbacks[callbackKey].indexOf(callback);
      if (index > -1) {
        eventCallbacks[callbackKey].splice(index, 1);
      }
    }
  },

  /**
   * Notify all callbacks for an event
   * @private
   */
  _notifyCallbacks(event, data) {
    if (eventCallbacks[event]) {
      eventCallbacks[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[TikTokListener] Callback error for ${event}:`, error);
        }
      });
    }
  },

  // ===================================================
  // GETTERS
  // ===================================================

  /**
   * Get connection status
   */
  isConnected() {
    return listenerState.isConnected;
  },

  /**
   * Get current state
   */
  getState() {
    return { ...listenerState };
  },

  /**
   * Get viewer count
   */
  getViewerCount() {
    return listenerState.viewerCount;
  },

  /**
   * Get like count
   */
  getLikeCount() {
    return listenerState.likeCount;
  },

  /**
   * Get share count
   */
  getShareCount() {
    return listenerState.shareCount;
  },
};

// =====================================================
// MOCK TIKTOK LISTENER (For Development)
// =====================================================

export const mockTiktokListener = {
  /**
   * Start mock listener for development
   * @param {Object} options
   */
  start(options = {}) {
    const { sessionId, interval = 5000 } = options;

    console.log('[MockTikTokListener] Starting mock listener...');

    // Simulate random comments
    const mockUsers = [
      { username: 'tiktok_user1', avatar: null },
      { username: 'crystal_lover', avatar: null },
      { username: 'gem_fan_88', avatar: null },
      { username: 'spiritual_soul', avatar: null },
      { username: 'healing_vibes', avatar: null },
    ];

    const mockMessages = [
      'đẹp quá chị ơi 😍',
      'giá bao nhiêu vậy',
      'có ship Sài Gòn không',
      'mua cái vòng tay đó được không',
      'rose quartz là gì vậy',
      'tuổi Tý nên đeo đá gì',
      'wow amazing 🔥',
      'tặng chị 🎁',
      'hello từ TikTok!',
      'có giảm giá không ạ',
    ];

    const mockInterval = setInterval(() => {
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const message = mockMessages[Math.floor(Math.random() * mockMessages.length)];

      const mockComment = {
        platform: 'tiktok',
        platform_user_id: `mock_${Date.now()}`,
        platform_username: user.username,
        platform_avatar: user.avatar,
        message,
        session_id: sessionId,
      };

      // Add to aggregator
      commentAggregatorService.addComment(mockComment);

      console.log(`[MockTikTokListener] Generated comment: ${user.username}: ${message}`);
    }, interval);

    return () => {
      clearInterval(mockInterval);
      console.log('[MockTikTokListener] Stopped');
    };
  },
};

// =====================================================
// EXPORTS
// =====================================================

export default tiktokListenerService;
