/**
 * GEM Mobile - Timeframe Buttons
 * Design tokens v3.0 compliant
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BUTTON } from '../../../utils/tokens';

const TIMEFRAMES = [
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
];

const TimeframeButtons = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      {TIMEFRAMES.map((tf) => (
        <TouchableOpacity
          key={tf.value}
          style={[
            styles.button,
            selected === tf.value && styles.buttonActive,
          ]}
          onPress={() => onSelect(tf.value)}
        >
          <Text
            style={[
              styles.buttonText,
              selected === tf.value && styles.buttonTextActive,
            ]}
          >
            {tf.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    paddingVertical: BUTTON.timeframe.paddingVertical,
    paddingHorizontal: BUTTON.timeframe.paddingHorizontal,
    borderRadius: BUTTON.timeframe.borderRadius,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  buttonText: {
    fontSize: BUTTON.timeframe.fontSize,
    fontWeight: BUTTON.timeframe.fontWeight,
    color: COLORS.textMuted,
  },
  buttonTextActive: {
    color: COLORS.purple,
  },
});

export default TimeframeButtons;
