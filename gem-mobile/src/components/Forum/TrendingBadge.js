/**
 * TrendingBadge Component
 * Visual indicator for trending/hot posts
 * Phase 4: View Count & Algorithm (30/12/2024)
 */

import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TrendingUp, Flame } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

/**
 * TrendingBadge - Badge for trending/hot posts
 *
 * @param {Object} props
 * @param {string} props.type - 'trending' or 'hot'
 * @param {number} props.rank - Position in ranking (1, 2, 3...)
 * @param {Object} props.style - Additional container style
 */
const TrendingBadge = ({
  type = 'trending',
  rank,
  style,
}) => {
  const isHot = type === 'hot';
  const IconComponent = isHot ? Flame : TrendingUp;
  const label = isHot ? 'Noi bat' : 'Xu huong';
  const color = isHot ? '#FF6B6B' : COLORS.gold;

  return (
    <View style={[styles.container, { borderColor: color }, style]}>
      <IconComponent size={12} color={color} strokeWidth={2.5} />
      <Text style={[styles.text, { color }]}>
        {rank ? `#${rank} ` : ''}{label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
    textTransform: 'uppercase',
  },
});

export default memo(TrendingBadge);
