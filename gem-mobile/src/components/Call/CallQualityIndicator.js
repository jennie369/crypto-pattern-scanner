/**
 * CallQualityIndicator Component
 * Shows network quality bars
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import {
  CONNECTION_QUALITY,
  CONNECTION_QUALITY_BARS,
} from '../../constants/callConstants';

/**
 * CallQualityIndicator - Network quality visualization
 * @param {Object} props
 * @param {string} props.quality - Connection quality level
 * @param {number} props.size - Size multiplier
 */
const CallQualityIndicator = ({
  quality = CONNECTION_QUALITY.GOOD,
  size = 1,
}) => {
  const bars = CONNECTION_QUALITY_BARS[quality] || 4;
  const totalBars = 5;

  const getBarColor = (index) => {
    if (index >= bars) {
      return COLORS.textDisabled;
    }

    switch (quality) {
      case CONNECTION_QUALITY.EXCELLENT:
        return COLORS.success;
      case CONNECTION_QUALITY.GOOD:
        return COLORS.success;
      case CONNECTION_QUALITY.FAIR:
        return COLORS.warning;
      case CONNECTION_QUALITY.POOR:
        return COLORS.error;
      case CONNECTION_QUALITY.BAD:
        return COLORS.error;
      default:
        return COLORS.success;
    }
  };

  const barHeights = [4, 7, 10, 13, 16].map(h => h * size);
  const barWidth = 3 * size;
  const barGap = 2 * size;

  return (
    <View style={styles.container}>
      {Array.from({ length: totalBars }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              width: barWidth,
              height: barHeights[index],
              backgroundColor: getBarColor(index),
              marginLeft: index > 0 ? barGap : 0,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
  },
  bar: {
    borderRadius: 1,
  },
});

export default CallQualityIndicator;
