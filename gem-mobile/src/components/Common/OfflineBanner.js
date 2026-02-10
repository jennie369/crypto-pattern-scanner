/**
 * Gemral - Offline Banner Component
 *
 * Displays a banner when the device is offline
 * Animates in/out smoothly
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { useOnlineStatus } from '../../hooks/useCache';

const OfflineBanner = ({
  onRetry = null,
  message = 'Bạn đang offline',
  showRetry = true,
  style = {},
}) => {
  const { isOnline } = useOnlineStatus();
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOnline) {
      // Show banner
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide banner
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <WifiOff size={18} color={COLORS.warning} />
        <Text style={styles.message}>{message}</Text>
      </View>

      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={16} color={COLORS.textPrimary} />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/**
 * Compact version for inline display
 */
export const OfflineIndicator = ({ style = {} }) => {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <View style={[styles.indicator, style]}>
      <WifiOff size={14} color={COLORS.warning} />
      <Text style={styles.indicatorText}>Offline</Text>
    </View>
  );
};

/**
 * Hook wrapper for conditional rendering
 */
export const useOfflineBanner = () => {
  const { isOnline } = useOnlineStatus();

  return {
    isOnline,
    OfflineBanner: isOnline ? null : OfflineBanner,
    OfflineIndicator: isOnline ? null : OfflineIndicator,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.3)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 4,
  },
  indicatorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
  },
});

export default OfflineBanner;
