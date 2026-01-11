/**
 * OnlineStatusIndicator Component
 * Shows online/offline status with optional last seen text
 *
 * Features:
 * - Green dot for online
 * - Gray dot for offline
 * - Last seen time calculation
 * - Size variants (small, medium, large)
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * OnlineStatusIndicator - Hiển thị trạng thái online
 *
 * @param {boolean} isOnline - Is user online
 * @param {string} lastSeen - ISO date string of last seen
 * @param {boolean} showText - Show text or just dot
 * @param {string} size - 'small' | 'medium' | 'large'
 */
const OnlineStatusIndicator = memo(({
  isOnline,
  lastSeen,
  showText = true,
  size = 'medium',
}) => {
  const statusText = useMemo(() => {
    if (isOnline) {
      return 'Đang hoạt động';
    }

    if (!lastSeen) {
      return null;
    }

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - lastSeenDate;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) {
      return 'Vừa mới hoạt động';
    } else if (diffMinutes < 60) {
      return `Hoạt động ${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `Hoạt động ${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `Hoạt động ${diffDays} ngày trước`;
    } else {
      return 'Không hoạt động gần đây';
    }
  }, [isOnline, lastSeen]);

  const dotSize = useMemo(() => {
    switch (size) {
      case 'small': return 8;
      case 'large': return 14;
      default: return 10;
    }
  }, [size]);

  if (!statusText && !isOnline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[
        styles.dot,
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: isOnline ? COLORS.green : COLORS.textMuted,
        },
      ]} />

      {showText && statusText && (
        <Text style={[
          styles.text,
          isOnline && styles.textOnline,
        ]}>
          {statusText}
        </Text>
      )}
    </View>
  );
});

OnlineStatusIndicator.displayName = 'OnlineStatusIndicator';

export default OnlineStatusIndicator;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    // Dynamic styles applied inline
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  textOnline: {
    color: COLORS.green,
  },
});
