/**
 * CallStatusBadge Component
 * Shows call connection status
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Wifi, WifiOff, Loader } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { CALL_STATUS, CALL_STATUS_TEXT } from '../../constants/callConstants';

/**
 * CallStatusBadge - Status indicator component
 * @param {Object} props
 * @param {string} props.status - Current call status
 * @param {boolean} props.showIcon - Whether to show status icon
 */
const CallStatusBadge = ({ status, showIcon = true }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Rotate animation for loading
  useEffect(() => {
    if (status === CALL_STATUS.CONNECTING || status === CALL_STATUS.RECONNECTING) {
      const rotation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      rotation.start();
      return () => rotation.stop();
    }
  }, [status, rotateAnim]);

  const getStatusConfig = () => {
    switch (status) {
      case CALL_STATUS.CONNECTED:
        return {
          icon: Wifi,
          color: COLORS.success,
          text: 'Đã kết nối',
        };
      case CALL_STATUS.CONNECTING:
        return {
          icon: Loader,
          color: COLORS.gold,
          text: 'Đang kết nối...',
          isLoading: true,
        };
      case CALL_STATUS.RECONNECTING:
        return {
          icon: Loader,
          color: COLORS.warning,
          text: 'Đang kết nối lại...',
          isLoading: true,
        };
      case CALL_STATUS.FAILED:
        return {
          icon: WifiOff,
          color: COLORS.error,
          text: 'Kết nối thất bại',
        };
      case CALL_STATUS.RINGING:
        return {
          icon: null,
          color: COLORS.gold,
          text: 'Đang gọi...',
        };
      default:
        return {
          icon: null,
          color: COLORS.textSecondary,
          text: CALL_STATUS_TEXT[status] || status,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {showIcon && Icon && (
        <Animated.View
          style={config.isLoading ? { transform: [{ rotate: spin }] } : undefined}
        >
          <Icon size={14} color={config.color} />
        </Animated.View>
      )}
      <Text style={[styles.text, { color: config.color }]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.glassBg,
    borderRadius: 20,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },
});

export default CallStatusBadge;
