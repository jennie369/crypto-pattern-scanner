/**
 * Hybrid Chat Service for GEM Master
 * Orchestrates WebSocket, Offline Queue, and HTTP Fallback
 *
 * Priority:
 * 1. WebSocket (when online + connected) - Real-time with typing indicator
 * 2. Edge Function HTTP (when online + WS disconnected) - Standard response
 * 3. Offline Queue (when offline) - Queue for later sync
 */

import { websocketService, ConnectionState } from './websocketService';
import { offlineQueueService } from './offlineQueueService';
import gemMasterService from './gemMasterService';
import { supabase } from './supabase';

// Configuration
const CONFIG = {
  // WebSocket settings
  WS_CONNECT_TIMEOUT: 5000, // 5 seconds to establish connection
  WS_RESPONSE_TIMEOUT: 30000, // 30 seconds for AI response

  // Retry settings
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,

  // Fallback behavior
  USE_HTTP_FALLBACK: true, // Use Edge Function when WS fails
  AUTO_CONNECT_ON_ONLINE: true, // Auto-connect WS when coming online

  // DEV mode: Skip WebSocket if backend not available (use HTTP fallback only)
  SKIP_WS_IN_DEV: __DEV__, // Set to false if you have backend running locally
};

class HybridChatService {
  constructor() {
    this.initialized = false;
    this.listeners = {
      onMessage: [],
      onTyping: [],
      onError: [],
      onConnectionChange: [],
      onQueueSync: [],
      onQuotaWarning: [],
    };
    this.pendingResponses = new Map(); // Track pending WS responses
    this.messageIdCounter = 0;
    this.currentConversationId = null;
    this.messageHistory = [];
    this.staleCleanupInterval = null;
  }

  /**
   * Initialize the hybrid chat service
   */
  async initialize() {
    if (this.initialized) return;

    console.log('[HybridChat] Initializing...');

    // Initialize offline queue
    await offlineQueueService.initialize();

    // Setup WebSocket listeners
    this.setupWebSocketListeners();

    // Setup offline queue listeners
    this.setupOfflineQueueListeners();

    // Attempt WebSocket connection if online (skip in DEV mode if configured)
    if (offlineQueueService.checkOnline() && !CONFIG.SKIP_WS_IN_DEV) {
      this.connectWebSocket();
    } else if (CONFIG.SKIP_WS_IN_DEV) {
      console.log('[HybridChat] Skipping WebSocket in DEV mode (using HTTP fallback)');
    }

    // Periodic cleanup of stale pending responses (older than 2 minutes)
    this.staleCleanupInterval = setInterval(() => {
      const now = Date.now();
      const STALE_THRESHOLD = 2 * 60 * 1000; // 2 minutes
      this.pendingResponses.forEach((pending, id) => {
        // Extract timestamp from message ID format: ws_<timestamp>
        const parts = id.split('_');
        const timestamp = parseInt(parts[1], 10);
        if (timestamp && now - timestamp > STALE_THRESHOLD) {
          console.warn('[HybridChat] Cleaning stale pending response:', id);
          if (!pending.resolved) {
            pending.resolved = true;
            pending.reject(new Error('Stale response cleaned up'));
          }
          this.pendingResponses.delete(id);
        }
      });
    }, 60 * 1000); // Check every 60 seconds

    this.initialized = true;
    console.log('[HybridChat] Initialized');
  }

  /**
   * Setup WebSocket event listeners
   */
  setupWebSocketListeners() {
    // Connection state changes
    websocketService.on('onStateChange', ({ oldState, newState }) => {
      console.log('[HybridChat] WS state:', newState);
      this.emit('onConnectionChange', {
        wsState: newState,
        isOnline: offlineQueueService.checkOnline(),
        canSend: this.canSendMessage(),
      });

      // Process offline queue when connected
      if (newState === ConnectionState.CONNECTED && oldState !== ConnectionState.CONNECTED) {
        this.syncOfflineQueue();
      }
    });

    // Incoming messages (AI responses)
    websocketService.on('onMessage', (data) => {
      console.log('[HybridChat] WS message received');

      // Resolve pending response promise
      const pending = Array.from(this.pendingResponses.values()).find(
        p => !p.resolved
      );
      if (pending) {
        pending.resolved = true;
        pending.resolve({
          text: data.content,
          tokensUsed: data.tokensUsed,
          conversationId: data.conversationId,
          intent: data.intent,
          source: 'websocket',
        });
      }

      // Also emit to listeners
      this.emit('onMessage', {
        text: data.content,
        tokensUsed: data.tokensUsed,
        conversationId: data.conversationId,
        intent: data.intent,
        source: 'websocket',
      });
    });

    // Typing indicator
    websocketService.on('onTyping', (data) => {
      this.emit('onTyping', data);
    });

    // Quota warnings
    websocketService.on('onQuotaWarning', (data) => {
      this.emit('onQuotaWarning', data);
    });

    // Errors
    websocketService.on('onError', (error) => {
      console.log('[HybridChat] WS error:', error.code);

      // If we have a pending response, reject it so we can fallback
      const pending = Array.from(this.pendingResponses.values()).find(
        p => !p.resolved
      );
      if (pending) {
        pending.resolved = true;
        pending.reject(error);
      }

      // Handle specific errors
      if (error.code === 'TOKEN_EXPIRED') {
        this.emit('onError', {
          code: 'AUTH_REQUIRED',
          message: error.message,
        });
      } else if (error.code === 'QUOTA_EXCEEDED') {
        this.emit('onError', error);
      } else {
        // For other errors, try HTTP fallback
        console.log('[HybridChat] Will use HTTP fallback for next message');
      }
    });
  }

  /**
   * Setup offline queue event listeners
   */
  setupOfflineQueueListeners() {
    offlineQueueService.addListener((event, data) => {
      console.log('[HybridChat] Queue event:', event);

      if (event === 'online') {
        // Coming back online - try to connect WebSocket
        if (CONFIG.AUTO_CONNECT_ON_ONLINE) {
          this.connectWebSocket();
        }

        this.emit('onConnectionChange', {
          wsState: websocketService.getState(),
          isOnline: true,
          canSend: this.canSendMessage(),
        });
      } else if (event === 'offline') {
        this.emit('onConnectionChange', {
          wsState: websocketService.getState(),
          isOnline: false,
          canSend: false,
        });
      } else if (event === 'queued') {
        console.log('[HybridChat] Message queued for later');
      } else if (event === 'sent') {
        console.log('[HybridChat] Queued message sent');
      }
    });
  }

  /**
   * Connect to WebSocket
   */
  async connectWebSocket() {
    try {
      await websocketService.connect();
    } catch (error) {
      console.error('[HybridChat] WS connect failed:', error);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket() {
    websocketService.disconnect();
  }

  /**
   * Check if we can send a message
   */
  canSendMessage() {
    const isOnline = offlineQueueService.checkOnline();
    const wsConnected = websocketService.isConnected();

    // Can send if online (via WS or HTTP fallback)
    return isOnline;
  }

  /**
   * Send a message - handles routing to WS, HTTP, or offline queue
   */
  async sendMessage(content, options = {}) {
    const messageId = `msg_${Date.now()}_${++this.messageIdCounter}`;
    console.log('[HybridChat] Sending message:', messageId);

    const isOnline = offlineQueueService.checkOnline();
    const wsConnected = websocketService.isConnected();

    // CASE 1: Offline - queue the message
    if (!isOnline) {
      console.log('[HybridChat] Offline - queuing message');
      const queued = await offlineQueueService.enqueue({
        content,
        context: options.context,
        conversationId: this.currentConversationId,
      });

      return {
        queued: true,
        queueId: queued.id,
        message: 'Tin nhắn sẽ được gửi khi có kết nối.',
      };
    }

    // CASE 2: Online + WebSocket connected - use WebSocket
    if (wsConnected) {
      console.log('[HybridChat] Using WebSocket');
      try {
        const response = await this.sendViaWebSocket(content, options);
        return response;
      } catch (wsError) {
        console.log('[HybridChat] WebSocket failed, trying HTTP fallback');
        if (CONFIG.USE_HTTP_FALLBACK) {
          return await this.sendViaHTTP(content, options);
        }
        throw wsError;
      }
    }

    // CASE 3: Online but WebSocket not connected - use HTTP fallback
    console.log('[HybridChat] Using HTTP fallback');
    return await this.sendViaHTTP(content, options);
  }

  /**
   * Send message via WebSocket
   */
  async sendViaWebSocket(content, options = {}) {
    return new Promise((resolve, reject) => {
      const messageId = `ws_${Date.now()}`;

      const timeout = setTimeout(() => {
        this.pendingResponses.delete(messageId);
        reject(new Error('Response timeout'));
      }, CONFIG.WS_RESPONSE_TIMEOUT);

      // Store pending response
      this.pendingResponses.set(messageId, {
        resolve: (data) => {
          clearTimeout(timeout);
          this.pendingResponses.delete(messageId);
          resolve(data);
        },
        reject: (error) => {
          clearTimeout(timeout);
          this.pendingResponses.delete(messageId);
          reject(error);
        },
        resolved: false,
      });

      // Send via WebSocket
      const sent = websocketService.sendMessage(content, {
        context: options.context,
        conversationId: this.currentConversationId,
      });

      if (!sent) {
        clearTimeout(timeout);
        this.pendingResponses.delete(messageId);
        reject(new Error('Failed to send message'));
      }
    });
  }

  /**
   * Send message via HTTP (Edge Function fallback)
   */
  async sendViaHTTP(content, options = {}) {
    console.log('[HybridChat] Sending via HTTP (Edge Function)');

    try {
      // Use existing gemMasterService for HTTP processing
      const response = await gemMasterService.processMessage(content, this.messageHistory);

      // Update message history for context
      this.messageHistory.push({ text: content, isUser: true });
      this.messageHistory.push({ text: response.text, isUser: false });

      // Keep history manageable
      if (this.messageHistory.length > 20) {
        this.messageHistory = this.messageHistory.slice(-20);
      }

      return {
        ...response,
        source: 'http_fallback',
      };
    } catch (error) {
      console.error('[HybridChat] HTTP fallback failed:', error);
      throw error;
    }
  }

  /**
   * Sync offline queue when coming back online
   */
  async syncOfflineQueue() {
    const queueSize = offlineQueueService.getQueueSize();
    if (queueSize === 0) return;

    console.log('[HybridChat] Syncing offline queue:', queueSize, 'messages');
    this.emit('onQueueSync', { status: 'started', count: queueSize });

    const result = await offlineQueueService.processQueue(async (message) => {
      try {
        // Try to send via WebSocket first
        if (websocketService.isConnected()) {
          const sent = websocketService.sendMessage(message.content, {
            context: message.context,
            conversationId: message.conversationId,
          });
          return sent;
        }
        // Fallback to HTTP
        await this.sendViaHTTP(message.content, {
          context: message.context,
        });
        return true;
      } catch (error) {
        console.error('[HybridChat] Failed to sync message:', error);
        return false;
      }
    });

    console.log('[HybridChat] Queue sync complete:', result);
    this.emit('onQueueSync', { status: 'completed', ...result });
  }

  /**
   * Clear message history
   */
  clearHistory() {
    this.messageHistory = [];
    this.currentConversationId = null;
    gemMasterService.resetConversation();
  }

  /**
   * Get current connection status
   */
  getConnectionStatus() {
    return {
      wsState: websocketService.getState(),
      isOnline: offlineQueueService.checkOnline(),
      canSend: this.canSendMessage(),
      queueSize: offlineQueueService.getQueueSize(),
      wsConnected: websocketService.isConnected(),
    };
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
          console.error(`[HybridChat] Listener error [${event}]:`, error);
        }
      });
    }
  }

  /**
   * Cleanup on app close
   */
  cleanup() {
    this.disconnectWebSocket();
    offlineQueueService.cleanup();
    this.listeners = {
      onMessage: [],
      onTyping: [],
      onError: [],
      onConnectionChange: [],
      onQueueSync: [],
      onQuotaWarning: [],
    };
    this.pendingResponses.clear();
    if (this.staleCleanupInterval) {
      clearInterval(this.staleCleanupInterval);
      this.staleCleanupInterval = null;
    }
    this.initialized = false;
  }
}

// Export singleton instance
export const hybridChatService = new HybridChatService();
export default hybridChatService;
