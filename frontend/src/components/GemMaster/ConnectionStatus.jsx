/**
 * ConnectionStatus - Web version (Framer Motion)
 * Shows network connection status (online/offline/reconnecting).
 * Small banner at top that slides down when offline.
 * Auto-detects using navigator.onLine + online/offline events.
 * Based on App's ConnectionStatus.js with web-specific enhancements.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, BREAKPOINTS } from '../../../../web design-tokens';

/**
 * Connection states
 */
const STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  RECONNECTING: 'reconnecting',
};

const STATUS_CONFIG = {
  [STATUS.ONLINE]: {
    color: COLORS.success,
    bgColor: 'rgba(58, 247, 166, 0.1)',
    borderColor: 'rgba(58, 247, 166, 0.3)',
    text: 'Connected',
    Icon: Cloud,
  },
  [STATUS.OFFLINE]: {
    color: COLORS.error,
    bgColor: 'rgba(255, 107, 107, 0.12)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
    text: 'Offline',
    Icon: WifiOff,
  },
  [STATUS.RECONNECTING]: {
    color: COLORS.warning,
    bgColor: 'rgba(255, 184, 0, 0.1)',
    borderColor: 'rgba(255, 184, 0, 0.3)',
    text: 'Reconnecting...',
    Icon: RefreshCw,
  },
};

const ConnectionStatus = ({
  onStatusChange,
  isConnected: externalConnected,
  queueSize = 0,
  onReconnect,
  bannerMode = true,
  style: customStyle,
}) => {
  const [networkOnline, setNetworkOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionStatus, setConnectionStatus] = useState(STATUS.ONLINE);
  const [showDetails, setShowDetails] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimerRef = useRef(null);
  const previousOnlineRef = useRef(networkOnline);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setNetworkOnline(true);
    };

    const handleOffline = () => {
      setNetworkOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Determine connection status from network state + external connected prop
  useEffect(() => {
    const wasOffline = !previousOnlineRef.current;
    previousOnlineRef.current = networkOnline;

    if (!networkOnline) {
      setConnectionStatus(STATUS.OFFLINE);
      setReconnectAttempts(0);
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    } else if (wasOffline && networkOnline) {
      // Just came back online - show reconnecting state briefly
      setConnectionStatus(STATUS.RECONNECTING);
      setReconnectAttempts((prev) => prev + 1);

      reconnectTimerRef.current = setTimeout(() => {
        setConnectionStatus(STATUS.ONLINE);
        reconnectTimerRef.current = null;
      }, 2000);
    } else if (externalConnected === false && networkOnline) {
      // Network is up but external connection (e.g., WebSocket) is down
      setConnectionStatus(STATUS.RECONNECTING);
    } else {
      setConnectionStatus(STATUS.ONLINE);
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [networkOnline, externalConnected]);

  // Notify parent of status changes
  useEffect(() => {
    const isOnline = connectionStatus === STATUS.ONLINE;
    onStatusChange?.(isOnline);
  }, [connectionStatus, onStatusChange]);

  const handleReconnect = useCallback(() => {
    setConnectionStatus(STATUS.RECONNECTING);
    setReconnectAttempts((prev) => prev + 1);
    onReconnect?.();

    // Auto-resolve after timeout if no external state update
    reconnectTimerRef.current = setTimeout(() => {
      if (networkOnline) {
        setConnectionStatus(STATUS.ONLINE);
      }
    }, 5000);
  }, [networkOnline, onReconnect]);

  const config = STATUS_CONFIG[connectionStatus];
  const isVisible = connectionStatus !== STATUS.ONLINE || queueSize > 0;

  // Banner mode: slides down from top when offline/reconnecting
  if (bannerMode) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            role="alert"
            aria-live="assertive"
            aria-label={`Connection status: ${config.text}`}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            style={{
              position: 'relative',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              background: config.bgColor,
              borderBottom: `1px solid ${config.borderColor}`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              ...customStyle,
            }}
          >
            {/* Main banner row */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
              aria-label={`${config.text}. Click for details.`}
              style={styles.bannerButton}
            >
              <div style={styles.bannerContent}>
                {/* Status icon */}
                {connectionStatus === STATUS.RECONNECTING ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <config.Icon size={16} color={config.color} />
                  </motion.div>
                ) : connectionStatus === STATUS.OFFLINE ? (
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <config.Icon size={16} color={config.color} />
                  </motion.div>
                ) : (
                  <config.Icon size={16} color={config.color} />
                )}

                {/* Status text */}
                <span style={{ ...styles.bannerText, color: config.color }}>
                  {config.text}
                </span>

                {/* Queue badge */}
                {queueSize > 0 && (
                  <span
                    style={styles.queueBadge}
                    title={`${queueSize} messages queued`}
                  >
                    {queueSize} queued
                  </span>
                )}

                {/* Expand chevron */}
                <motion.div
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronDown size={14} color={config.color} />
                </motion.div>
              </div>
            </button>

            {/* Expandable details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={styles.detailsContainer}>
                    {/* Network status */}
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabelGroup}>
                        <Wifi size={12} color={COLORS.textMuted} />
                        <span style={styles.detailLabel}>Network</span>
                      </div>
                      <span
                        style={{
                          ...styles.detailValue,
                          color: networkOnline ? COLORS.success : COLORS.error,
                        }}
                      >
                        {networkOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    {/* WebSocket / external connection */}
                    {externalConnected !== undefined && (
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabelGroup}>
                          <Cloud size={12} color={COLORS.textMuted} />
                          <span style={styles.detailLabel}>WebSocket</span>
                        </div>
                        <span
                          style={{
                            ...styles.detailValue,
                            color: externalConnected ? COLORS.success : COLORS.warning,
                          }}
                        >
                          {externalConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    )}

                    {/* Queue count */}
                    {queueSize > 0 && (
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabelGroup}>
                          <AlertTriangle size={12} color={COLORS.textMuted} />
                          <span style={styles.detailLabel}>Queued</span>
                        </div>
                        <span style={styles.detailValue}>
                          {queueSize} message{queueSize !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Reconnect attempts */}
                    {reconnectAttempts > 0 && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Attempts</span>
                        <span style={styles.detailValue}>{reconnectAttempts}</span>
                      </div>
                    )}

                    {/* Reconnect button */}
                    {connectionStatus !== STATUS.ONLINE && networkOnline && onReconnect && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReconnect();
                        }}
                        disabled={connectionStatus === STATUS.RECONNECTING}
                        aria-label="Reconnect"
                        style={{
                          ...styles.reconnectButton,
                          opacity: connectionStatus === STATUS.RECONNECTING ? 0.6 : 1,
                          cursor: connectionStatus === STATUS.RECONNECTING ? 'wait' : 'pointer',
                        }}
                      >
                        <RefreshCw size={14} color={COLORS.primary} />
                        <span style={styles.reconnectText}>Reconnect</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reconnecting progress bar */}
            {connectionStatus === STATUS.RECONNECTING && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3, ease: 'linear' }}
                style={{
                  height: 2,
                  background: `linear-gradient(90deg, ${COLORS.warning}, ${COLORS.primary})`,
                  transformOrigin: 'left',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Compact/inline mode (non-banner)
  return (
    <div
      role="status"
      aria-label={`Connection: ${config.text}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        borderRadius: RADIUS.lg,
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        ...customStyle,
      }}
    >
      <button
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
        style={styles.compactButton}
      >
        <div style={styles.statusRow}>
          {connectionStatus === STATUS.RECONNECTING ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'flex' }}
            >
              <config.Icon size={14} color={config.color} />
            </motion.div>
          ) : connectionStatus === STATUS.OFFLINE ? (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'flex' }}
            >
              <config.Icon size={14} color={config.color} />
            </motion.div>
          ) : (
            <config.Icon size={14} color={config.color} />
          )}
          <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.medium, color: config.color }}>
            {config.text}
          </span>
          {queueSize > 0 && (
            <span style={styles.queueBadge}>{queueSize}</span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={styles.detailsContainer}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Network:</span>
                <span style={{ ...styles.detailValue, color: networkOnline ? COLORS.success : COLORS.error }}>
                  {networkOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              {connectionStatus !== STATUS.ONLINE && networkOnline && onReconnect && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => { e.stopPropagation(); handleReconnect(); }}
                  style={styles.reconnectButton}
                  aria-label="Reconnect"
                >
                  <RefreshCw size={14} color={COLORS.primary} />
                  <span style={styles.reconnectText}>Reconnect</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  bannerButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: `${SPACING.sm}px ${SPACING.base}px`,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  bannerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  queueBadge: {
    background: COLORS.primary,
    borderRadius: RADIUS.full,
    padding: `2px ${SPACING.sm}px`,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgPrimary,
    lineHeight: 1.2,
  },
  compactButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: `6px ${SPACING.md}px`,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  detailsContainer: {
    padding: `0 ${SPACING.base}px ${SPACING.sm}px`,
    borderTop: `1px solid ${COLORS.borderLight}`,
    marginTop: 2,
    paddingTop: SPACING.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  reconnectButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    background: 'rgba(255, 189, 89, 0.15)',
    border: `1px solid rgba(255, 189, 89, 0.3)`,
    borderRadius: RADIUS.sm,
    cursor: 'pointer',
    minHeight: 44,
  },
  reconnectText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
};

export default ConnectionStatus;
