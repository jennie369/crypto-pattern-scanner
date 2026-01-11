/**
 * ConnectionStatus Component
 * Shows WebSocket connection status in the chat header
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react-native';
import { COLORS } from '../../../utils/tokens';

const ConnectionStatus = ({
  isOnline,
  isConnected,
  statusText,
  statusColor,
  queueSize = 0,
  isSyncing = false,
  onReconnect,
  style,
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showDetails, setShowDetails] = useState(false);

  // Pulse animation for connecting state
  useEffect(() => {
    if (!isConnected && isOnline) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnected, isOnline, pulseAnim]);

  // Get appropriate icon
  const getIcon = () => {
    if (!isOnline) {
      return <WifiOff size={14} color={statusColor} />;
    }
    if (isConnected) {
      return <Cloud size={14} color={statusColor} />;
    }
    return <CloudOff size={14} color={statusColor} />;
  };

  return (
    <TouchableOpacity
      onPress={() => setShowDetails(!showDetails)}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      <View style={styles.statusRow}>
        <Animated.View style={{ opacity: pulseAnim }}>
          {getIcon()}
        </Animated.View>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
        {queueSize > 0 && (
          <View style={styles.queueBadge}>
            <Text style={styles.queueText}>{queueSize}</Text>
          </View>
        )}
        {isSyncing && (
          <Animated.View
            style={{
              transform: [{
                rotate: pulseAnim.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              }],
            }}
          >
            <RefreshCw size={12} color={COLORS.gold} />
          </Animated.View>
        )}
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mang:</Text>
            <Text style={[styles.detailValue, { color: isOnline ? '#4ECDC4' : '#FF6B6B' }]}>
              {isOnline ? 'Truc tuyen' : 'Ngoai tuyen'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>WebSocket:</Text>
            <Text style={[styles.detailValue, { color: isConnected ? '#4ECDC4' : '#FFE66D' }]}>
              {isConnected ? 'Da ket noi' : 'Chua ket noi'}
            </Text>
          </View>
          {queueSize > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tin nhan cho:</Text>
              <Text style={styles.detailValue}>{queueSize}</Text>
            </View>
          )}
          {!isConnected && isOnline && onReconnect && (
            <TouchableOpacity onPress={onReconnect} style={styles.reconnectButton}>
              <RefreshCw size={14} color={COLORS.gold} />
              <Text style={styles.reconnectText}>Ket noi lai</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  queueBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  queueText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: COLORS.textPrimarySecondary,
    fontSize: 11,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '500',
  },
  reconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderRadius: 8,
  },
  reconnectText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ConnectionStatus;
