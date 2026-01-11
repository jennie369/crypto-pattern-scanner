/**
 * ViewCount Component
 * Display view count with eye icon
 * Phase 4: View Count & Algorithm (30/12/2024)
 */

import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Eye } from 'lucide-react-native';
import { formatNumber } from '../../utils/formatNumber';
import { COLORS, SPACING } from '../../utils/tokens';

/**
 * ViewCount - Display view count
 *
 * @param {Object} props
 * @param {number} props.count - View count
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} props.showLabel - Show "luot xem" label
 * @param {Object} props.style - Additional container style
 */
const ViewCount = ({
  count = 0,
  size = 'md',
  showLabel = false,
  style,
}) => {
  const sizes = {
    sm: { icon: 12, text: 11, spacing: 2 },
    md: { icon: 14, text: 12, spacing: 4 },
    lg: { icon: 16, text: 14, spacing: 4 },
  };

  const s = sizes[size] || sizes.md;
  const formattedCount = formatNumber(count);

  // Don't render if count is 0 and not showing label
  if (count === 0 && !showLabel) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Eye
        size={s.icon}
        color={COLORS.textMuted}
        strokeWidth={2}
      />
      <Text style={[styles.text, { fontSize: s.text, marginLeft: s.spacing }]}>
        {formattedCount}
        {showLabel && ' luot xem'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});

export default memo(ViewCount);
