/**
 * WebSocket Service for GEM Master Real-time Chat
 * Handles connection, reconnection, and message handling
 */

import { Platform } from 'react-native';
import { getSession } from './supabase';

// Backend WebSocket URL - Update this after Railway deployment
const BACKEND_WS_URL = __DEV__
  ? 'ws://localhost:8000/ws/chat'
  : 'wss://gem-backend.railway.app/ws/chat';

// In DEV mode, suppress WebSocket errors if backend not running
const SUPPRESS_DEV_ERRORS = __DEV__;

// Connection states
export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
};

// Message types from server
export const MessageType = {
  CONNECTED: 'connected',
  TYPING: 'typing',
  RESPONSE: 'response',
  ERROR: 'error',
  PONG: 'pong',
  QUOTA_WARNING: 'quota_warning',
  QUOTA_EXCEEDED: 'quota_exceeded',
  RATE_LIMITED: 'rate_limited',
  TOKEN_EXPIRED: 'token_expired',
};

class WebSocketService {
  constructor() {
    this.ws = null;
    this.state = ConnectionState.DISCONNECTED;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelays = [1000, 2000, 4000, 8000, 16000, 30000]; // Exponential backoff
    this.heartbeatInterval = null;
    this.heartbeatTimeout = 30000; // 30 seconds
    this.listeners = {
      onStateChange: [],
      onMessage: [],
      onTyping: [],
      onError: [],
      onQuotaWarning: [],
    };
    this.messageQueue = [];
    this.userId = null;
    this.lastPingTime = null;
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => this.off(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`WebSocket listener error [${event}]:`, error);
        }
      });
    }
  }

  /**
   * Update connection state
   */
  setState(newState) {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.emit('onStateChange', { oldState, newState });
      console.log(`[WebSocket] State changed: ${oldState} -> ${newState}`);
    }
  }

  /**
   * Connect to WebSocket server
   */
  async connect() {
    if (this.state === ConnectionState.CONNECTING || this.state === ConnectionState.CONNECTED) {
      console.log('[WebSocket] Already connecting or connected');
      return;
    }

    this.setState(ConnectionState.CONNECTING);

    try {
      // Get JWT token from Supabase session
      const { session, error } = await getSession();
      if (error || !session?.access_token) {
        console.error('[WebSocket] No valid session:', error);
        this.setState(ConnectionState.ERROR);
        this.emit('onError', { code: 'NO_SESSION', message: 'Vui lòng đăng nhập lại' });
        return;
      }

      this.userId = session.user?.id;
      const wsUrl = `${BACKEND_WS_URL}?token=${session.access_token}`;

      console.log('[WebSocket] Connecting to:', BACKEND_WS_URL);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);

    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.setState(ConnectionState.ERROR);
      this.emit('onError', { code: 'CONNECTION_FAILED', message: error.message });
    }
  }

  /**
   * Handle WebSocket open
   */
  handleOpen() {
    console.log('[WebSocket] Connection opened');
    // Don't set CONNECTED yet - wait for server confirmation
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('[WebSocket] Received:', data.type);

      switch (data.type) {
        case MessageType.CONNECTED:
          this.setState(ConnectionState.CONNECTED);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          // Process queued messages
          this.flushMessageQueue();
          break;

        case MessageType.TYPING:
          this.emit('onTyping', { isTyping: data.is_typing });
          break;

        case MessageType.RESPONSE:
          this.emit('onMessage', {
            content: data.content,
            tokensUsed: data.tokens_used,
            conversationId: data.conversation_id,
            messageId: data.message_id,
            intent: data.intent,
          });
          break;

        case MessageType.PONG:
          // Heartbeat response received
          this.lastPingTime = Date.now();
          break;

        case MessageType.QUOTA_WARNING:
          this.emit('onQuotaWarning', {
            used: data.used,
            limit: data.limit,
            remaining: data.remaining,
          });
          break;

        case MessageType.QUOTA_EXCEEDED:
          this.emit('onError', {
            code: 'QUOTA_EXCEEDED',
            message: data.message || 'Đã hết lượt hỏi. Vui lòng nâng cấp tier!',
            upgradeTier: data.upgrade_tier,
          });
          break;

        case MessageType.RATE_LIMITED:
          this.emit('onError', {
            code: 'RATE_LIMITED',
            message: data.message || 'Gửi quá nhanh. Vui lòng chờ một chút.',
            retryAfter: data.retry_after,
          });
          break;

        case MessageType.TOKEN_EXPIRED:
          this.emit('onError', {
            code: 'TOKEN_EXPIRED',
            message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
          });
          this.disconnect();
          break;

        case MessageType.ERROR:
          this.emit('onError', {
            code: data.code || 'SERVER_ERROR',
            message: data.message || 'Có lỗi xảy ra',
          });
          break;

        default:
          console.log('[WebSocket] Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
    }
  }

  /**
   * Handle WebSocket error
   */
  handleError(error) {
    // In DEV mode, use console.warn instead of console.error to avoid red box
    if (SUPPRESS_DEV_ERRORS) {
      console.warn('[WebSocket] Connection failed (backend not running?)');
    } else {
      console.error('[WebSocket] Error:', error);
    }
    this.setState(ConnectionState.ERROR);
    this.emit('onError', { code: 'WS_ERROR', message: 'Lỗi kết nối' });
  }

  /**
   * Handle WebSocket close
   */
  handleClose(event) {
    console.log('[WebSocket] Connection closed:', event.code, event.reason);
    this.stopHeartbeat();

    const wasConnected = this.state === ConnectionState.CONNECTED;
    this.setState(ConnectionState.DISCONNECTED);

    // Don't reconnect if intentionally closed or token expired
    if (event.code === 1000 || event.code === 4001) {
      return;
    }

    // Attempt reconnection if was connected or connecting
    if (wasConnected || this.state === ConnectionState.CONNECTING) {
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached');
      this.emit('onError', {
        code: 'MAX_RECONNECT',
        message: 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.',
      });
      return;
    }

    this.setState(ConnectionState.RECONNECTING);
    this.reconnectAttempts++;

    const delayIndex = Math.min(this.reconnectAttempts - 1, this.reconnectDelays.length - 1);
    const delay = this.reconnectDelays[delayIndex];

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.state === ConnectionState.RECONNECTING) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.state === ConnectionState.CONNECTED) {
        this.sendPing();
      }
    }, this.heartbeatTimeout);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send ping message
   */
  sendPing() {
    this.send({ type: 'ping' });
  }

  /**
   * Send message through WebSocket
   */
  send(data) {
    if (this.state === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('[WebSocket] Send error:', error);
        return false;
      }
    } else {
      // Queue message for later
      if (data.type === 'chat') {
        this.messageQueue.push(data);
        console.log('[WebSocket] Message queued, queue size:', this.messageQueue.length);
      }
      return false;
    }
  }

  /**
   * Send chat message
   */
  sendMessage(content, options = {}) {
    const message = {
      type: 'chat',
      content,
      context: options.context || null,
      conversation_id: options.conversationId || null,
    };
    return this.send(message);
  }

  /**
   * Flush queued messages
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.state === ConnectionState.CONNECTED) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  /**
   * Get queued message count
   */
  getQueuedMessageCount() {
    return this.messageQueue.length;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.state === ConnectionState.CONNECTED;
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log('[WebSocket] Disconnecting...');
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnect on intentional close
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.setState(ConnectionState.DISCONNECTED);
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  /**
   * Get current connection state
   */
  getState() {
    return this.state;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
