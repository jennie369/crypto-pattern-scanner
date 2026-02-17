/**
 * Restream Service
 * Phase 3: Multi-Platform Integration
 *
 * Restream.io integration for multi-platform streaming:
 * - Get RTMP config for OBS/streaming software
 * - Manage connected channels
 * - Monitor stream health
 * - Update stream metadata
 *
 * Note: Actual streaming is done via nginx-rtmp or OBS
 * This service manages Restream configuration and monitoring
 */

// Environment variables - use process.env for Expo
const EXPO_PUBLIC_RESTREAM_ACCESS_TOKEN = process.env.EXPO_PUBLIC_RESTREAM_ACCESS_TOKEN || '';
const EXPO_PUBLIC_RESTREAM_STREAM_KEY = process.env.EXPO_PUBLIC_RESTREAM_STREAM_KEY || '';

const RESTREAM_API_BASE = 'https://api.restream.io/v2';

class RestreamService {
  constructor() {
    this.accessToken = EXPO_PUBLIC_RESTREAM_ACCESS_TOKEN || '';
    this.streamKey = EXPO_PUBLIC_RESTREAM_STREAM_KEY || '';
    this.isStreaming = false;
    this.activeChannels = [];
    this.streamHealth = null;
    this.listeners = new Map();
  }

  /**
   * Get RTMP config for streaming to Restream
   * Use this URL in OBS or nginx-rtmp
   */
  getRtmpConfig() {
    return {
      server: 'rtmp://live.restream.io/live/',
      streamKey: this.streamKey,
      fullUrl: `rtmp://live.restream.io/live/${this.streamKey}`,
      // Recommended settings for Restream
      settings: {
        videoBitrate: 4500, // 4.5 Mbps
        audioBitrate: 128,  // 128 kbps
        fps: 30,
        resolution: '1280x720',
        keyframeInterval: 2,
        encoder: 'x264',
        preset: 'veryfast',
        profile: 'main',
        tune: 'zerolatency',
      },
    };
  }

  /**
   * Get all connected channels
   */
  async getChannels() {
    if (!this.accessToken) {
      console.warn('[Restream] No access token configured');
      return [];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${RESTREAM_API_BASE}/user/channel/all`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.activeChannels = data || [];

      return this.activeChannels.map((ch) => ({
        id: ch.id,
        name: ch.displayName,
        platform: ch.streamingService?.name,
        platformId: ch.streamingService?.id,
        enabled: ch.enabled,
        url: ch.url,
        isLive: ch.isLive || false,
        viewers: ch.viewers || 0,
      }));
    } catch (error) {
      console.error('[Restream] Get channels error:', error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Toggle channel enabled/disabled
   * @param {string} channelId - Channel ID
   * @param {boolean} enabled - Enable or disable
   */
  async toggleChannel(channelId, enabled) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(
        `${RESTREAM_API_BASE}/user/channel/${channelId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Update local cache
      const channel = this.activeChannels.find((c) => c.id === channelId);
      if (channel) {
        channel.enabled = enabled;
      }

      return data;
    } catch (error) {
      console.error('[Restream] Toggle channel error:', error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Get current stream status
   */
  async getStreamStatus() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${RESTREAM_API_BASE}/user/stream`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No active stream
          this.isStreaming = false;
          return { active: false };
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.isStreaming = data.active || false;
      this.streamHealth = data.health || null;

      return {
        active: data.active,
        startedAt: data.startedAt,
        duration: data.duration,
        bitrate: data.bitrate,
        fps: data.fps,
        resolution: data.resolution,
        health: data.health,
        channels: data.channels || [],
      };
    } catch (error) {
      console.error('[Restream] Get stream status error:', error);
      return { active: false, error: error.message };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Update stream title and description
   * @param {string} title - Stream title
   * @param {string} description - Stream description
   */
  async updateStreamInfo(title, description = '') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${RESTREAM_API_BASE}/user/stream/meta`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Restream] Update stream info error:', error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Get stream events/alerts
   */
  async getStreamEvents() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${RESTREAM_API_BASE}/user/stream/events`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Restream] Get stream events error:', error);
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Get chat from all platforms (Restream Chat)
   */
  async getChatMessages(limit = 50) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(
        `${RESTREAM_API_BASE}/user/chat/messages?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Restream] Get chat messages error:', error);
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Send chat message to all platforms
   * @param {string} message - Message to send
   */
  async sendChatMessage(message) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${RESTREAM_API_BASE}/user/chat/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Restream] Send chat message error:', error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isStreaming: this.isStreaming,
      activeChannels: this.activeChannels.filter((ch) => ch.enabled).length,
      totalChannels: this.activeChannels.length,
      health: this.streamHealth,
      hasAccessToken: !!this.accessToken,
      hasStreamKey: !!this.streamKey,
    };
  }

  /**
   * Get enabled channels
   */
  getEnabledChannels() {
    return this.activeChannels
      .filter((ch) => ch.enabled)
      .map((ch) => ({
        id: ch.id,
        name: ch.displayName,
        platform: ch.streamingService?.name,
      }));
  }

  /**
   * Set access token (for dynamic configuration)
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Set stream key
   */
  setStreamKey(key) {
    this.streamKey = key;
  }

  /**
   * Start health monitoring
   * @param {number} intervalMs - Polling interval
   */
  startHealthMonitoring(intervalMs = 10000) {
    if (this._healthInterval) {
      clearInterval(this._healthInterval);
    }

    this._healthInterval = setInterval(async () => {
      const status = await this.getStreamStatus();
      this._emit('healthUpdate', status);
    }, intervalMs);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this._healthInterval) {
      clearInterval(this._healthInterval);
      this._healthInterval = null;
    }
  }

  /**
   * Subscribe to events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event
   */
  _emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[Restream] Event handler error for ${event}:`, error);
        }
      });
    }
  }
}

// Singleton instance
export const restreamService = new RestreamService();
export default restreamService;
