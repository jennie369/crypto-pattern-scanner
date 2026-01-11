/**
 * RecalledMessagePlaceholder Component
 * Placeholder hiển thị khi tin nhắn đã được thu hồi
 *
 * Features:
 * - Different text for sender vs receiver
 * - Subtle dashed border design
 * - Ban icon indicator
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * RecalledMessagePlaceholder - Placeholder cho tin nhắn đã thu hồi
 *
 * @param {boolean} isOwnMessage - Có phải tin nhắn của mình
 * @param {string} senderName - Tên người gửi (nếu không phải mình)
 */
const RecalledMessagePlaceholder = memo(({
  isOwnMessage,
  senderName,
}) => {
  const message = isOwnMessage
    ? 'Bạn đã thu hồi tin nhắn này'
    : `${senderName || 'Người dùng'} đã thu hồi tin nhắn này`;

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.containerOwn : styles.containerOther,
    ]}>
      <Ionicons name="ban-outline" size={14} color={COLORS.textMuted} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
});

RecalledMessagePlaceholder.displayName = 'RecalledMessagePlaceholder';

export default RecalledMessagePlaceholder;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  containerOwn: {
    alignSelf: 'flex-end',
  },
  containerOther: {
    alignSelf: 'flex-start',
    marginLeft: 48, // Avatar space
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
