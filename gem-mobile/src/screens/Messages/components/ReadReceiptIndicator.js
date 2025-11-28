/**
 * Gemral - Read Receipt Indicator Component
 * Shows message delivery and read status
 *
 * Features:
 * - Single checkmark: Sent
 * - Double checkmark: Delivered
 * - Blue double checkmark: Read
 * - Clock icon: Sending/Pending
 * - Error icon: Failed
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

// Message status constants
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

const ReadReceiptIndicator = memo(({
  status,
  readAt,
  size = 'sm', // sm, md
  showTime = false,
}) => {
  // Get icon based on status
  const getIcon = () => {
    switch (status) {
      case MESSAGE_STATUS.SENDING:
        return {
          name: 'time-outline',
          color: COLORS.textMuted,
        };
      case MESSAGE_STATUS.SENT:
        return {
          name: 'checkmark',
          color: COLORS.textMuted,
        };
      case MESSAGE_STATUS.DELIVERED:
        return {
          name: 'checkmark-done',
          color: COLORS.textMuted,
        };
      case MESSAGE_STATUS.READ:
        return {
          name: 'checkmark-done',
          color: COLORS.cyan,
        };
      case MESSAGE_STATUS.FAILED:
        return {
          name: 'alert-circle',
          color: COLORS.error,
        };
      default:
        return {
          name: 'checkmark',
          color: COLORS.textMuted,
        };
    }
  };

  // Format read time
  const formatReadTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const icon = getIcon();
  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <View style={styles.container}>
      <Ionicons
        name={icon.name}
        size={iconSize}
        color={icon.color}
      />
      {showTime && readAt && status === MESSAGE_STATUS.READ && (
        <Text style={styles.readTime}>
          Read {formatReadTime(readAt)}
        </Text>
      )}
    </View>
  );
});

ReadReceiptIndicator.displayName = 'ReadReceiptIndicator';

export default ReadReceiptIndicator;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  readTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.cyan,
  },
});
