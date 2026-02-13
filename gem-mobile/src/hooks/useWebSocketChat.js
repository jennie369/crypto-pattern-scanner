/**
 * useWebSocketChat Hook
 * React hook for using the hybrid WebSocket chat service
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { hybridChatService } from '../services/hybridChatService';
import { ConnectionState } from '../services/websocketService';

/**
 * Hook for WebSocket-based chat with GEM Master
 * @param {Object} options - Hook options
 * @param {boolean} options.autoConnect - Auto-connect on mount (default: true)
 * @returns {Object} Chat state and functions
 */
export const useWebSocketChat = (options = {}) => {
  const { autoConnect = true } = options;

  // State
  const [connectionState, setConnectionState] = useState({
    wsState: ConnectionState.DISCONNECTED,
    isOnline: true,
    canSend: false,
    queueSize: 0,
    wsConnected: false,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [quotaWarning, setQuotaWarning] = useState(null);
  const [queueSyncStatus, setQueueSyncStatus] = useState(null);

  // Refs
  const messageCallbackRef = useRef(null);
  const initialized = useRef(false);

  /**
   * Initialize the chat service
   */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      console.log('[useWebSocketChat] Initializing...');
      await hybridChatService.initialize();

      // Update initial connection status
      setConnectionState(hybridChatService.getConnectionStatus());
    };

    if (autoConnect) {
      init();
    }

    return () => {
      // Cleanup on unmount (only if needed)
      // Note: We don't cleanup the service here as it should persist across screens
    };
  }, [autoConnect]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    // Connection change listener
    const unsubConnection = hybridChatService.on('onConnectionChange', (status) => {
      setConnectionState(status);
    });

    // Typing indicator listener
    const unsubTyping = hybridChatService.on('onTyping', (data) => {
      setIsTyping(data.isTyping);
    });

    // C12 FIX: Track timeout IDs for cleanup
    let errorClearTimeout = null;
    let syncClearTimeout = null;

    // Error listener
    const unsubError = hybridChatService.on('onError', (error) => {
      setLastError(error);
      setIsSending(false);

      // Clear error after 5 seconds (C12 FIX: track timeout for cleanup)
      if (errorClearTimeout) clearTimeout(errorClearTimeout);
      errorClearTimeout = setTimeout(() => setLastError(null), 5000);
    });

    // Quota warning listener
    const unsubQuota = hybridChatService.on('onQuotaWarning', (data) => {
      setQuotaWarning(data);
    });

    // Queue sync listener
    const unsubQueueSync = hybridChatService.on('onQueueSync', (data) => {
      setQueueSyncStatus(data);
      if (data.status === 'completed') {
        // Clear sync status after 3 seconds (C12 FIX: track timeout for cleanup)
        if (syncClearTimeout) clearTimeout(syncClearTimeout);
        syncClearTimeout = setTimeout(() => setQueueSyncStatus(null), 3000);
      }
    });

    // Message listener (for async message handling)
    const unsubMessage = hybridChatService.on('onMessage', (data) => {
      setIsTyping(false);
      setIsSending(false);

      // Call registered callback if exists
      if (messageCallbackRef.current) {
        messageCallbackRef.current(data);
      }
    });

    return () => {
      unsubConnection();
      unsubTyping();
      unsubError();
      unsubQuota();
      unsubQueueSync();
      unsubMessage();
      // C12 FIX: Clear pending timeouts on unmount
      if (errorClearTimeout) clearTimeout(errorClearTimeout);
      if (syncClearTimeout) clearTimeout(syncClearTimeout);
    };
  }, []);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (content, options = {}) => {
    if (!content?.trim()) {
      return { error: 'Empty message' };
    }

    setIsSending(true);
    setLastError(null);
    setIsTyping(true); // Optimistically show typing

    try {
      const response = await hybridChatService.sendMessage(content, options);

      setIsSending(false);
      setIsTyping(false);

      // Handle queued response
      if (response.queued) {
        return {
          queued: true,
          queueId: response.queueId,
          message: response.message,
        };
      }

      return response;
    } catch (error) {
      setIsSending(false);
      setIsTyping(false);
      setLastError({
        code: 'SEND_FAILED',
        message: error.message || 'Gửi tin nhắn thất bại',
      });
      throw error;
    }
  }, []);

  /**
   * Register a callback for incoming messages
   * Useful for updating UI when responses arrive
   */
  const onMessage = useCallback((callback) => {
    messageCallbackRef.current = callback;
  }, []);

  /**
   * Connect to WebSocket manually
   */
  const connect = useCallback(async () => {
    await hybridChatService.connectWebSocket();
  }, []);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    hybridChatService.disconnectWebSocket();
  }, []);

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(() => {
    hybridChatService.clearHistory();
  }, []);

  /**
   * Clear quota warning
   */
  const dismissQuotaWarning = useCallback(() => {
    setQuotaWarning(null);
  }, []);

  /**
   * Clear error
   */
  const dismissError = useCallback(() => {
    setLastError(null);
  }, []);

  /**
   * Get connection status text for UI
   * NOTE: We show "Kết nối" when online because HTTP fallback works
   * even when WebSocket is not connected
   */
  const getConnectionStatusText = useCallback(() => {
    const { wsState, isOnline, queueSize } = connectionState;

    if (!isOnline) {
      return queueSize > 0
        ? `Ngoại tuyến (${queueSize} tin nhắn chờ)`
        : 'Ngoại tuyến';
    }

    // When online, show "Kết nối" since HTTP fallback always works
    // WebSocket is optional enhancement, not required
    switch (wsState) {
      case ConnectionState.CONNECTED:
        return 'Kết nối';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        // Don't show connecting states - just show connected since HTTP works
        return 'Kết nối';
      case ConnectionState.ERROR:
        // Even on WS error, HTTP fallback works
        return 'Kết nối';
      default:
        // DISCONNECTED state - HTTP still works
        return 'Kết nối';
    }
  }, [connectionState]);

  /**
   * Get connection status color for UI
   * NOTE: Show green when online since HTTP fallback works
   */
  const getConnectionStatusColor = useCallback(() => {
    const { isOnline } = connectionState;

    if (!isOnline) return '#FF6B6B'; // Red for offline

    // When online, always show green since HTTP fallback works
    return '#4ECDC4'; // Teal for connected
  }, [connectionState]);

  return {
    // Connection state
    connectionState,
    isOnline: connectionState.isOnline,
    // Report as connected when online (HTTP fallback works regardless of WS)
    isConnected: connectionState.isOnline,
    canSend: connectionState.canSend,
    queueSize: connectionState.queueSize,

    // UI state
    isTyping,
    isSending,
    lastError,
    quotaWarning,
    queueSyncStatus,

    // Actions
    sendMessage,
    connect,
    disconnect,
    clearHistory,
    onMessage,
    dismissQuotaWarning,
    dismissError,

    // UI helpers
    getConnectionStatusText,
    getConnectionStatusColor,
  };
};

export default useWebSocketChat;
