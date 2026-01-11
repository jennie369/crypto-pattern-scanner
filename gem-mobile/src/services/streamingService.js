// =====================================================
// STREAMING SERVICE
// LiveKit WebRTC + RTMP Broadcasting
// Multi-platform streaming for GEMRAL AI Livestream
// =====================================================

import { supabase } from './supabase';
import { COLORS } from '../utils/tokens';

// =====================================================
// CONFIGURATION
// =====================================================

const LIVEKIT_CONFIG = {
  url: process.env.EXPO_PUBLIC_LIVEKIT_URL || 'wss://your-livekit-server.livekit.cloud',
  apiKey: process.env.EXPO_PUBLIC_LIVEKIT_API_KEY || '',
  apiSecret: process.env.EXPO_PUBLIC_LIVEKIT_API_SECRET || '',
};

const RTMP_CONFIG = {
  tiktok: {
    server: 'rtmp://push.tiktok.com/live/',
    enabled: false,
  },
  facebook: {
    server: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    enabled: false,
  },
  restream: {
    server: 'rtmp://live.restream.io/live/',
    enabled: true, // Use Restream.io for multi-destination
  },
};

const STREAM_QUALITY = {
  low: { width: 640, height: 360, bitrate: 800000, fps: 24 },
  medium: { width: 1280, height: 720, bitrate: 2500000, fps: 30 },
  high: { width: 1920, height: 1080, bitrate: 4500000, fps: 30 },
};

// =====================================================
// STREAM STATE
// =====================================================

let streamState = {
  isStreaming: false,
  sessionId: null,
  roomName: null,
  platforms: [],
  startTime: null,
  quality: 'medium',
  stats: {
    bitrate: 0,
    fps: 0,
    viewers: 0,
    duration: 0,
  },
  health: {
    status: 'idle', // idle, connecting, live, error, reconnecting
    lastError: null,
    reconnectAttempts: 0,
  },
};

// Event listeners
const eventListeners = {
  onStateChange: [],
  onStatsUpdate: [],
  onError: [],
  onViewerJoin: [],
  onViewerLeave: [],
};

// =====================================================
// STREAMING SERVICE
// =====================================================

export const streamingService = {
  // ===================================================
  // INITIALIZATION
  // ===================================================

  /**
   * Initialize streaming service
   * @returns {Promise<boolean>}
   */
  async initialize() {
    try {
      console.log('[StreamingService] Initializing...');

      // Check LiveKit availability
      const livekitAvailable = await this.checkLiveKitHealth();
      if (!livekitAvailable) {
        console.warn('[StreamingService] LiveKit not available, using fallback mode');
      }

      // Reset state
      streamState = {
        ...streamState,
        health: { status: 'idle', lastError: null, reconnectAttempts: 0 },
      };

      console.log('[StreamingService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[StreamingService] Initialization failed:', error);
      return false;
    }
  },

  /**
   * Check LiveKit server health
   * @returns {Promise<boolean>}
   */
  async checkLiveKitHealth() {
    try {
      // In production, this would ping the LiveKit server
      // For now, return true if URL is configured
      return !!LIVEKIT_CONFIG.url && LIVEKIT_CONFIG.url !== 'wss://your-livekit-server.livekit.cloud';
    } catch (error) {
      console.error('[StreamingService] LiveKit health check failed:', error);
      return false;
    }
  },

  // ===================================================
  // STREAM LIFECYCLE
  // ===================================================

  /**
   * Start a livestream session
   * @param {Object} options - Stream options
   * @returns {Promise<Object>}
   */
  async startStream(options = {}) {
    const {
      sessionId,
      title = 'GEMRAL Livestream',
      persona = 'SuPhu',
      quality = 'medium',
      platforms = ['gemral'],
      streamKeys = {},
    } = options;

    try {
      console.log('[StreamingService] Starting stream...', { sessionId, platforms });

      // Update state
      streamState.health.status = 'connecting';
      this._notifyStateChange();

      // 1. Create or get session from database
      const session = await this._createOrGetSession(sessionId, title, persona, platforms);

      // 2. Generate room token for LiveKit
      const roomToken = await this._generateRoomToken(session.id);

      // 3. Initialize WebRTC connection (for Gemral)
      if (platforms.includes('gemral')) {
        await this._initializeWebRTC(roomToken, quality);
      }

      // 4. Initialize RTMP streams (for TikTok/Facebook)
      if (platforms.includes('tiktok') || platforms.includes('facebook')) {
        await this._initializeRTMP(platforms, streamKeys);
      }

      // 5. Update state
      streamState = {
        ...streamState,
        isStreaming: true,
        sessionId: session.id,
        roomName: `gemral-${session.id}`,
        platforms,
        startTime: new Date(),
        quality,
        health: { status: 'live', lastError: null, reconnectAttempts: 0 },
      };

      // 6. Start stats monitoring
      this._startStatsMonitoring();

      // 7. Notify listeners
      this._notifyStateChange();

      console.log('[StreamingService] Stream started successfully');

      return {
        success: true,
        sessionId: session.id,
        roomName: streamState.roomName,
        platforms,
        webrtcUrl: platforms.includes('gemral') ? this._getWebRTCViewerUrl(session.id) : null,
      };
    } catch (error) {
      console.error('[StreamingService] Failed to start stream:', error);

      streamState.health = {
        status: 'error',
        lastError: error.message,
        reconnectAttempts: 0,
      };
      this._notifyStateChange();
      this._notifyError(error);

      throw error;
    }
  },

  /**
   * Stop the current livestream
   * @returns {Promise<Object>}
   */
  async stopStream() {
    try {
      console.log('[StreamingService] Stopping stream...');

      if (!streamState.isStreaming) {
        console.warn('[StreamingService] No active stream to stop');
        return { success: true, message: 'No active stream' };
      }

      // 1. Stop stats monitoring
      this._stopStatsMonitoring();

      // 2. Close WebRTC connections
      await this._closeWebRTC();

      // 3. Close RTMP streams
      await this._closeRTMP();

      // 4. Update session in database
      await this._updateSessionEnded(streamState.sessionId);

      // 5. Calculate final stats
      const duration = streamState.startTime
        ? Math.floor((Date.now() - streamState.startTime.getTime()) / 1000)
        : 0;

      const finalStats = {
        duration,
        ...streamState.stats,
      };

      // 6. Reset state
      const sessionId = streamState.sessionId;
      streamState = {
        isStreaming: false,
        sessionId: null,
        roomName: null,
        platforms: [],
        startTime: null,
        quality: 'medium',
        stats: { bitrate: 0, fps: 0, viewers: 0, duration: 0 },
        health: { status: 'idle', lastError: null, reconnectAttempts: 0 },
      };

      // 7. Notify listeners
      this._notifyStateChange();

      console.log('[StreamingService] Stream stopped successfully');

      return {
        success: true,
        sessionId,
        finalStats,
      };
    } catch (error) {
      console.error('[StreamingService] Failed to stop stream:', error);
      throw error;
    }
  },

  /**
   * Pause the current stream
   * @returns {Promise<boolean>}
   */
  async pauseStream() {
    if (!streamState.isStreaming) return false;

    try {
      // Mute audio/video tracks
      // Implementation depends on LiveKit SDK
      console.log('[StreamingService] Stream paused');
      return true;
    } catch (error) {
      console.error('[StreamingService] Failed to pause stream:', error);
      return false;
    }
  },

  /**
   * Resume the current stream
   * @returns {Promise<boolean>}
   */
  async resumeStream() {
    if (!streamState.isStreaming) return false;

    try {
      // Unmute audio/video tracks
      console.log('[StreamingService] Stream resumed');
      return true;
    } catch (error) {
      console.error('[StreamingService] Failed to resume stream:', error);
      return false;
    }
  },

  // ===================================================
  // WEBRTC (LIVEKIT)
  // ===================================================

  /**
   * Initialize WebRTC connection via LiveKit
   * @private
   */
  async _initializeWebRTC(token, quality) {
    try {
      console.log('[StreamingService] Initializing WebRTC with quality:', quality);

      // In a real implementation, this would use @livekit/react-native
      // import { Room, RoomEvent } from 'livekit-client';
      //
      // const room = new Room();
      // await room.connect(LIVEKIT_CONFIG.url, token);
      //
      // room.on(RoomEvent.ParticipantConnected, (participant) => {
      //   streamState.stats.viewers++;
      //   this._notifyViewerJoin(participant);
      // });

      // For now, simulate connection
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('[StreamingService] WebRTC initialized');
      return true;
    } catch (error) {
      console.error('[StreamingService] WebRTC initialization failed:', error);
      throw error;
    }
  },

  /**
   * Close WebRTC connections
   * @private
   */
  async _closeWebRTC() {
    try {
      // In a real implementation:
      // if (this.room) {
      //   await this.room.disconnect();
      //   this.room = null;
      // }

      console.log('[StreamingService] WebRTC closed');
      return true;
    } catch (error) {
      console.error('[StreamingService] Failed to close WebRTC:', error);
      return false;
    }
  },

  /**
   * Generate room token for LiveKit
   * @private
   */
  async _generateRoomToken(sessionId) {
    try {
      // Call Supabase Edge Function to generate token
      const { data, error } = await supabase.functions.invoke('livekit-token', {
        body: {
          roomName: `gemral-${sessionId}`,
          participantName: 'ai-streamer',
          isHost: true,
        },
      });

      if (error) throw error;

      return data.token;
    } catch (error) {
      console.error('[StreamingService] Failed to generate room token:', error);
      // Return mock token for development
      return `mock-token-${sessionId}`;
    }
  },

  /**
   * Get WebRTC viewer URL
   * @private
   */
  _getWebRTCViewerUrl(sessionId) {
    return `${LIVEKIT_CONFIG.url}/room/gemral-${sessionId}`;
  },

  // ===================================================
  // RTMP STREAMING
  // ===================================================

  /**
   * Initialize RTMP streams for TikTok/Facebook
   * @private
   */
  async _initializeRTMP(platforms, streamKeys) {
    try {
      console.log('[StreamingService] Initializing RTMP for platforms:', platforms);

      const rtmpTargets = [];

      // Use Restream.io for multi-destination streaming
      if (RTMP_CONFIG.restream.enabled && streamKeys.restream) {
        rtmpTargets.push({
          platform: 'restream',
          url: `${RTMP_CONFIG.restream.server}${streamKeys.restream}`,
        });
      } else {
        // Direct streaming to each platform
        if (platforms.includes('tiktok') && streamKeys.tiktok) {
          rtmpTargets.push({
            platform: 'tiktok',
            url: `${RTMP_CONFIG.tiktok.server}${streamKeys.tiktok}`,
          });
        }

        if (platforms.includes('facebook') && streamKeys.facebook) {
          rtmpTargets.push({
            platform: 'facebook',
            url: `${RTMP_CONFIG.facebook.server}${streamKeys.facebook}`,
          });
        }
      }

      // In a real implementation, this would use FFmpeg or similar
      // to push the video stream to RTMP endpoints

      console.log('[StreamingService] RTMP targets configured:', rtmpTargets.length);
      return true;
    } catch (error) {
      console.error('[StreamingService] RTMP initialization failed:', error);
      throw error;
    }
  },

  /**
   * Close RTMP streams
   * @private
   */
  async _closeRTMP() {
    try {
      // Close all RTMP connections
      console.log('[StreamingService] RTMP streams closed');
      return true;
    } catch (error) {
      console.error('[StreamingService] Failed to close RTMP:', error);
      return false;
    }
  },

  // ===================================================
  // SESSION MANAGEMENT
  // ===================================================

  /**
   * Create or get session from database
   * @private
   */
  async _createOrGetSession(sessionId, title, persona, platforms) {
    try {
      if (sessionId) {
        // Get existing session
        const { data, error } = await supabase
          .from('livestream_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) throw error;
        return data;
      }

      // Create new session
      const { data, error } = await supabase
        .from('livestream_sessions')
        .insert({
          title,
          persona,
          status: 'live',
          platforms: platforms.reduce((acc, p) => ({ ...acc, [p]: true }), {}),
          actual_start: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[StreamingService] Failed to create/get session:', error);
      throw error;
    }
  },

  /**
   * Update session as ended
   * @private
   */
  async _updateSessionEnded(sessionId) {
    try {
      const { error } = await supabase
        .from('livestream_sessions')
        .update({
          status: 'ended',
          actual_end: new Date().toISOString(),
          duration_minutes: streamState.startTime
            ? Math.floor((Date.now() - streamState.startTime.getTime()) / 60000)
            : 0,
          stats: streamState.stats,
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('[StreamingService] Failed to update session:', error);
    }
  },

  // ===================================================
  // STATS MONITORING
  // ===================================================

  _statsInterval: null,

  /**
   * Start monitoring stream stats
   * @private
   */
  _startStatsMonitoring() {
    this._statsInterval = setInterval(() => {
      // Update stats
      streamState.stats = {
        ...streamState.stats,
        duration: streamState.startTime
          ? Math.floor((Date.now() - streamState.startTime.getTime()) / 1000)
          : 0,
        // In real implementation, get from LiveKit:
        // bitrate: room.localParticipant.getTrackPublicationByName('camera')?.trackInfo?.bitrate
        // fps: room.localParticipant.getTrackPublicationByName('camera')?.trackInfo?.fps
      };

      this._notifyStatsUpdate();
    }, 2000);
  },

  /**
   * Stop stats monitoring
   * @private
   */
  _stopStatsMonitoring() {
    if (this._statsInterval) {
      clearInterval(this._statsInterval);
      this._statsInterval = null;
    }
  },

  // ===================================================
  // STREAM CONTROLS
  // ===================================================

  /**
   * Update stream quality
   * @param {string} quality - low, medium, high
   */
  async updateQuality(quality) {
    if (!STREAM_QUALITY[quality]) {
      console.warn('[StreamingService] Invalid quality:', quality);
      return false;
    }

    streamState.quality = quality;
    // In real implementation, update video encoder settings
    console.log('[StreamingService] Quality updated to:', quality);
    return true;
  },

  /**
   * Add platform to stream
   * @param {string} platform - Platform to add
   * @param {string} streamKey - Stream key for platform
   */
  async addPlatform(platform, streamKey) {
    if (streamState.platforms.includes(platform)) {
      return { success: false, message: 'Platform already added' };
    }

    try {
      await this._initializeRTMP([platform], { [platform]: streamKey });
      streamState.platforms.push(platform);
      this._notifyStateChange();

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  /**
   * Remove platform from stream
   * @param {string} platform - Platform to remove
   */
  async removePlatform(platform) {
    const index = streamState.platforms.indexOf(platform);
    if (index === -1) {
      return { success: false, message: 'Platform not found' };
    }

    // Close RTMP connection for this platform
    streamState.platforms.splice(index, 1);
    this._notifyStateChange();

    return { success: true };
  },

  // ===================================================
  // EVENT SYSTEM
  // ===================================================

  /**
   * Subscribe to stream events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (eventListeners[event]) {
      eventListeners[event].push(callback);
    }
  },

  /**
   * Unsubscribe from stream events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (eventListeners[event]) {
      const index = eventListeners[event].indexOf(callback);
      if (index > -1) {
        eventListeners[event].splice(index, 1);
      }
    }
  },

  /**
   * Notify state change listeners
   * @private
   */
  _notifyStateChange() {
    eventListeners.onStateChange.forEach((cb) => cb(this.getState()));
  },

  /**
   * Notify stats update listeners
   * @private
   */
  _notifyStatsUpdate() {
    eventListeners.onStatsUpdate.forEach((cb) => cb(streamState.stats));
  },

  /**
   * Notify error listeners
   * @private
   */
  _notifyError(error) {
    eventListeners.onError.forEach((cb) => cb(error));
  },

  /**
   * Notify viewer join listeners
   * @private
   */
  _notifyViewerJoin(participant) {
    eventListeners.onViewerJoin.forEach((cb) => cb(participant));
  },

  /**
   * Notify viewer leave listeners
   * @private
   */
  _notifyViewerLeave(participant) {
    eventListeners.onViewerLeave.forEach((cb) => cb(participant));
  },

  // ===================================================
  // GETTERS
  // ===================================================

  /**
   * Get current stream state
   * @returns {Object}
   */
  getState() {
    return { ...streamState };
  },

  /**
   * Check if currently streaming
   * @returns {boolean}
   */
  isStreaming() {
    return streamState.isStreaming;
  },

  /**
   * Get stream health status
   * @returns {Object}
   */
  getHealth() {
    return { ...streamState.health };
  },

  /**
   * Get current stats
   * @returns {Object}
   */
  getStats() {
    return { ...streamState.stats };
  },

  /**
   * Get active platforms
   * @returns {Array}
   */
  getPlatforms() {
    return [...streamState.platforms];
  },
};

// =====================================================
// STREAM HEALTH MONITOR
// =====================================================

export const streamHealthMonitor = {
  /**
   * Get overall health score (0-100)
   */
  getHealthScore() {
    if (!streamState.isStreaming) return 0;

    let score = 100;

    // Check bitrate
    const targetBitrate = STREAM_QUALITY[streamState.quality].bitrate;
    const bitrateRatio = streamState.stats.bitrate / targetBitrate;
    if (bitrateRatio < 0.5) score -= 30;
    else if (bitrateRatio < 0.8) score -= 15;

    // Check FPS
    const targetFps = STREAM_QUALITY[streamState.quality].fps;
    const fpsRatio = streamState.stats.fps / targetFps;
    if (fpsRatio < 0.5) score -= 30;
    else if (fpsRatio < 0.8) score -= 15;

    // Check reconnect attempts
    if (streamState.health.reconnectAttempts > 0) {
      score -= streamState.health.reconnectAttempts * 10;
    }

    return Math.max(0, score);
  },

  /**
   * Get health status text
   */
  getHealthStatus() {
    const score = this.getHealthScore();
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'poor';
    return 'critical';
  },

  /**
   * Get health color
   */
  getHealthColor() {
    const status = this.getHealthStatus();
    switch (status) {
      case 'excellent':
        return COLORS.success;
      case 'good':
        return COLORS.success;
      case 'fair':
        return COLORS.warning;
      case 'poor':
        return COLORS.error;
      case 'critical':
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  },
};

// =====================================================
// EXPORTS
// =====================================================

export default streamingService;
