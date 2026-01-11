/**
 * TikTok Live Service
 * Phase 3: Multi-Platform Integration
 *
 * Features:
 * - Connect to TikTok Live via WebSocket
 * - Receive real-time comments, gifts, likes
 * - Transform to unified comment format
 * - RTMP config for streaming
 *
 * Note: Uses tiktok-live-connector for comment receiving
 * Streaming is done via Restream/nginx-rtmp
 */

// Environment variables - use process.env for Expo
const EXPO_PUBLIC_TIKTOK_STREAM_KEY = process.env.EXPO_PUBLIC_TIKTOK_STREAM_KEY || '';
const EXPO_PUBLIC_RESTREAM_KEY = process.env.EXPO_PUBLIC_RESTREAM_KEY || '';

// Gift value conversion (1 diamond ≈ 100 VND approximate)
const DIAMOND_TO_VND = 100;

// Event types
export const TIKTOK_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  COMMENT: 'comment',
  GIFT: 'gift',
  LIKE: 'like',
  FOLLOW: 'follow',
  SHARE: 'share',
  VIEWER_COUNT: 'viewerCount',
  ERROR: 'error',
};

class TikTokService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.username = null;
    this.roomId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.stats = {
      comments: 0,
      gifts: 0,
      likes: 0,
      followers: 0,
      shares: 0,
    };
  }

  /**
   * Get RTMP config for streaming
   */
  getRtmpConfig() {
    return {
      server: 'rtmp://push.tiktokcdn.com/live/',
      streamKey: EXPO_PUBLIC_TIKTOK_STREAM_KEY || '',
      // Use Restream for multi-platform
      restreamUrl: `rtmp://live.restream.io/live/${EXPO_PUBLIC_RESTREAM_KEY || ''}`,
      settings: {
        videoBitrate: 4500,
        audioBitrate: 128,
        fps: 30,
        resolution: '1280x720',
        keyframeInterval: 2,
      },
    };
  }

  /**
   * Connect to TikTok Live to receive comments
   * @param {string} uniqueId - TikTok username
   * @param {Object} options - Connection options
   */
  async connect(uniqueId, options = {}) {
    try {
      this.username = uniqueId;

      // In React Native, we use WebSocket to connect to our backend
      // which handles tiktok-live-connector
      const wsUrl = options.wsUrl || process.env.EXPO_PUBLIC_TIKTOK_WS_URL;

      if (!wsUrl) {
        // Simulate connection for development
        console.log('[TikTok] Development mode - simulating connection');
        return this._simulateConnection(uniqueId);
      }

      this.connection = new WebSocket(`${wsUrl}?username=${uniqueId}`);

      this.connection.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this._emit(TIKTOK_EVENTS.CONNECTED, {
          platform: 'tiktok',
          username: uniqueId,
          roomId: this.roomId,
        });
      };

      this.connection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._handleMessage(data);
        } catch (error) {
          console.error('[TikTok] Parse message error:', error);
        }
      };

      this.connection.onerror = (error) => {
        console.error('[TikTok] WebSocket error:', error);
        this._emit(TIKTOK_EVENTS.ERROR, { error });
      };

      this.connection.onclose = () => {
        this.isConnected = false;
        this._emit(TIKTOK_EVENTS.DISCONNECTED, { platform: 'tiktok' });
        this._attemptReconnect();
      };

      return { success: true, username: uniqueId };
    } catch (error) {
      console.error('[TikTok] Connection failed:', error);
      this._emit(TIKTOK_EVENTS.ERROR, { error });
      throw error;
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  _handleMessage(data) {
    switch (data.type) {
      case 'roomInfo':
        this.roomId = data.roomId;
        break;

      case 'chat':
        const comment = this._transformComment(data.data);
        this.stats.comments++;
        this._emit(TIKTOK_EVENTS.COMMENT, comment);
        break;

      case 'gift':
        const gift = this._transformGift(data.data);
        this.stats.gifts++;
        this._emit(TIKTOK_EVENTS.GIFT, gift);
        break;

      case 'like':
        this.stats.likes += data.data.likeCount || 1;
        this._emit(TIKTOK_EVENTS.LIKE, {
          platform: 'tiktok',
          userId: data.data.uniqueId,
          username: data.data.nickname,
          likeCount: data.data.likeCount,
          totalLikes: data.data.totalLikeCount,
          timestamp: Date.now(),
        });
        break;

      case 'follow':
        this.stats.followers++;
        this._emit(TIKTOK_EVENTS.FOLLOW, {
          platform: 'tiktok',
          userId: data.data.uniqueId,
          username: data.data.nickname,
          avatar: data.data.profilePictureUrl,
          timestamp: Date.now(),
        });
        break;

      case 'share':
        this.stats.shares++;
        this._emit(TIKTOK_EVENTS.SHARE, {
          platform: 'tiktok',
          userId: data.data.uniqueId,
          username: data.data.nickname,
          timestamp: Date.now(),
        });
        break;

      case 'roomUser':
        this._emit(TIKTOK_EVENTS.VIEWER_COUNT, {
          platform: 'tiktok',
          count: data.data.viewerCount,
          timestamp: Date.now(),
        });
        break;
    }
  }

  /**
   * Transform TikTok comment to unified format
   */
  _transformComment(data) {
    return {
      id: `tiktok_${data.msgId || Date.now()}`,
      platform: 'tiktok',
      userId: data.uniqueId,
      username: data.uniqueId,
      displayName: data.nickname || data.uniqueId,
      avatar: data.profilePictureUrl || null,
      message: data.comment,
      timestamp: Date.now(),
      isFollower: data.followRole >= 1,
      isSubscriber: data.followRole >= 2,
      isModerator: data.isModerator || false,
      badges: this._extractBadges(data),
      metadata: {
        followRole: data.followRole,
        userBadges: data.userBadges,
      },
      raw: data,
    };
  }

  /**
   * Transform TikTok gift to unified format
   */
  _transformGift(data) {
    const diamondValue = (data.diamondCount || 0) * (data.repeatCount || 1);
    const valueVND = diamondValue * DIAMOND_TO_VND;

    return {
      id: `tiktok_gift_${data.giftId}_${Date.now()}`,
      platform: 'tiktok',
      userId: data.uniqueId,
      username: data.uniqueId,
      displayName: data.nickname || data.uniqueId,
      avatar: data.profilePictureUrl || null,
      gift: {
        id: data.giftId,
        name: data.giftName || 'Gift',
        diamondCount: data.diamondCount || 0,
        repeatCount: data.repeatCount || 1,
        image: data.giftPictureUrl,
        type: data.giftType,
      },
      diamondValue,
      valueVND,
      timestamp: Date.now(),
      raw: data,
    };
  }

  /**
   * Extract badges from user data
   */
  _extractBadges(data) {
    const badges = [];

    if (data.followRole >= 2) {
      badges.push({ type: 'subscriber', name: 'Subscriber', icon: 'star' });
    }
    if (data.followRole >= 1) {
      badges.push({ type: 'follower', name: 'Follower', icon: 'heart' });
    }
    if (data.isModerator) {
      badges.push({ type: 'moderator', name: 'Mod', icon: 'shield' });
    }
    if (data.isNewGifter) {
      badges.push({ type: 'newGifter', name: 'New Gifter', icon: 'gift' });
    }
    if (data.topGifterRank && data.topGifterRank <= 3) {
      badges.push({
        type: 'topGifter',
        name: `Top ${data.topGifterRank}`,
        icon: 'trophy',
        rank: data.topGifterRank,
      });
    }

    return badges;
  }

  /**
   * Attempt to reconnect
   */
  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[TikTok] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[TikTok] Reconnecting... attempt ${this.reconnectAttempts}`);

    setTimeout(() => {
      if (this.username && !this.isConnected) {
        this.connect(this.username);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Simulate connection for development
   */
  _simulateConnection(uniqueId) {
    this.isConnected = true;
    this.roomId = 'dev_room_' + Date.now();

    setTimeout(() => {
      this._emit(TIKTOK_EVENTS.CONNECTED, {
        platform: 'tiktok',
        username: uniqueId,
        roomId: this.roomId,
      });
    }, 500);

    // Simulate periodic viewer count
    this._simulationInterval = setInterval(() => {
      if (this.isConnected) {
        this._emit(TIKTOK_EVENTS.VIEWER_COUNT, {
          platform: 'tiktok',
          count: Math.floor(Math.random() * 100) + 10,
          timestamp: Date.now(),
        });
      }
    }, 5000);

    return { success: true, username: uniqueId, simulated: true };
  }

  /**
   * Disconnect from TikTok Live
   */
  disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    if (this._simulationInterval) {
      clearInterval(this._simulationInterval);
      this._simulationInterval = null;
    }

    this.isConnected = false;
    this.username = null;
    this.roomId = null;
    this.reconnectAttempts = 0;

    this._emit(TIKTOK_EVENTS.DISCONNECTED, { platform: 'tiktok' });
  }

  /**
   * Subscribe to events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event to listeners
   */
  _emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[TikTok] Event handler error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      platform: 'tiktok',
      connected: this.isConnected,
      username: this.username,
      roomId: this.roomId,
      stats: { ...this.stats },
    };
  }

  /**
   * Reset stats
   */
  resetStats() {
    this.stats = {
      comments: 0,
      gifts: 0,
      likes: 0,
      followers: 0,
      shares: 0,
    };
  }
}

// Singleton instance
export const tiktokService = new TikTokService();
export default tiktokService;
