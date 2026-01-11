/**
 * Offline Queue Service for GEM Master Chat
 * Manages message queue in AsyncStorage when offline
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// NetInfo - use try-catch for Expo Go compatibility
let NetInfo = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  // Fallback for Expo Go - create mock NetInfo
  NetInfo = {
    fetch: async () => ({ isConnected: true, isInternetReachable: true, type: 'wifi' }),
    addEventListener: () => () => {},
  };
  console.log('[OfflineQueue] Using mock NetInfo for Expo Go');
}

const QUEUE_STORAGE_KEY = '@gem_master_offline_queue';
const MAX_QUEUE_SIZE = 50;
const MESSAGE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

class OfflineQueueService {
  constructor() {
    this.queue = [];
    this.isOnline = true;
    this.listeners = [];
    this.networkUnsubscribe = null;
    this.initialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load queue from storage
      await this.loadQueue();

      // Start network monitoring
      this.networkUnsubscribe = NetInfo.addEventListener(state => {
        const wasOffline = !this.isOnline;
        this.isOnline = state.isConnected && state.isInternetReachable !== false;

        console.log('[OfflineQueue] Network state:', this.isOnline ? 'online' : 'offline');

        // Notify listeners when coming back online
        if (wasOffline && this.isOnline) {
          this.notifyListeners('online');
        } else if (!this.isOnline && !wasOffline) {
          this.notifyListeners('offline');
        }
      });

      // Check initial network state
      const netState = await NetInfo.fetch();
      this.isOnline = netState.isConnected && netState.isInternetReachable !== false;

      this.initialized = true;
      console.log('[OfflineQueue] Initialized with', this.queue.length, 'queued messages');
    } catch (error) {
      console.error('[OfflineQueue] Initialize error:', error);
    }
  }

  /**
   * Load queue from AsyncStorage
   */
  async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out expired messages
        const now = Date.now();
        this.queue = parsed.filter(msg => now - msg.timestamp < MESSAGE_EXPIRY_MS);

        if (this.queue.length !== parsed.length) {
          // Some messages expired, save updated queue
          await this.saveQueue();
        }
      }
    } catch (error) {
      console.error('[OfflineQueue] Load error:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to AsyncStorage
   */
  async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Save error:', error);
    }
  }

  /**
   * Add message to queue
   */
  async enqueue(message) {
    // Check queue size limit
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest message
      this.queue.shift();
    }

    const queuedMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: message.content,
      context: message.context || null,
      conversationId: message.conversationId || null,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending', // pending, sending, failed
    };

    this.queue.push(queuedMessage);
    await this.saveQueue();

    console.log('[OfflineQueue] Message queued:', queuedMessage.id);
    this.notifyListeners('queued', queuedMessage);

    return queuedMessage;
  }

  /**
   * Get all pending messages
   */
  getPendingMessages() {
    return this.queue.filter(msg => msg.status === 'pending');
  }

  /**
   * Get queue size
   */
  getQueueSize() {
    return this.queue.length;
  }

  /**
   * Mark message as sending
   */
  async markSending(messageId) {
    const message = this.queue.find(m => m.id === messageId);
    if (message) {
      message.status = 'sending';
      await this.saveQueue();
    }
  }

  /**
   * Mark message as sent (remove from queue)
   */
  async markSent(messageId) {
    this.queue = this.queue.filter(m => m.id !== messageId);
    await this.saveQueue();
    this.notifyListeners('sent', { messageId });
    console.log('[OfflineQueue] Message sent:', messageId);
  }

  /**
   * Mark message as failed
   */
  async markFailed(messageId, error) {
    const message = this.queue.find(m => m.id === messageId);
    if (message) {
      message.status = 'failed';
      message.retryCount++;
      message.lastError = error;
      await this.saveQueue();
      this.notifyListeners('failed', { messageId, error });
    }
  }

  /**
   * Reset message to pending for retry
   */
  async resetForRetry(messageId) {
    const message = this.queue.find(m => m.id === messageId);
    if (message) {
      message.status = 'pending';
      await this.saveQueue();
    }
  }

  /**
   * Remove message from queue
   */
  async remove(messageId) {
    this.queue = this.queue.filter(m => m.id !== messageId);
    await this.saveQueue();
  }

  /**
   * Clear all queued messages
   */
  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
    this.notifyListeners('cleared');
  }

  /**
   * Process queue - send all pending messages
   * @param {Function} sendFunction - Function to send message
   */
  async processQueue(sendFunction) {
    if (!this.isOnline) {
      console.log('[OfflineQueue] Cannot process - offline');
      return { processed: 0, failed: 0 };
    }

    const pending = this.getPendingMessages();
    let processed = 0;
    let failed = 0;

    console.log('[OfflineQueue] Processing', pending.length, 'messages');

    for (const message of pending) {
      try {
        await this.markSending(message.id);

        const success = await sendFunction({
          content: message.content,
          context: message.context,
          conversationId: message.conversationId,
          offlineMessageId: message.id,
        });

        if (success) {
          await this.markSent(message.id);
          processed++;
        } else {
          await this.markFailed(message.id, 'Send returned false');
          failed++;
        }
      } catch (error) {
        console.error('[OfflineQueue] Send error:', error);
        await this.markFailed(message.id, error.message);
        failed++;
      }

      // Small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { processed, failed };
  }

  /**
   * Check if device is online
   */
  checkOnline() {
    return this.isOnline;
  }

  /**
   * Add listener for queue events
   */
  addListener(callback) {
    this.listeners.push(callback);
    return () => this.removeListener(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * Notify listeners of events
   */
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('[OfflineQueue] Listener error:', error);
      }
    });
  }

  /**
   * Cleanup on app close
   */
  cleanup() {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = null;
    }
    this.listeners = [];
    this.initialized = false;
  }

  /**
   * Get queue status for UI
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      queueSize: this.queue.length,
      pendingCount: this.getPendingMessages().length,
      oldestMessage: this.queue.length > 0 ? this.queue[0].timestamp : null,
    };
  }
}

// Export singleton instance
export const offlineQueueService = new OfflineQueueService();
export default offlineQueueService;
