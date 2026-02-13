/**
 * SliderInput.js
 * Compact energy/level slider with horizontal numbered dots
 *
 * Created: 2026-02-02
 * Updated: 2026-02-03 - Redesigned to compact horizontal style
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';

/**
 * SliderInput Component - Compact horizontal style
 */
const SliderInput = ({
  value = 5,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  labels = {},
  label,
  disabled = false,
  error,
}) => {
  const [selectedValue, setSelectedValue] = useState(value);

  // Generate steps array
  const steps = [];
  for (let i = min; i <= max; i += step) {
    steps.push(i);
  }

  // Handle value selection
  const handleSelect = useCallback((newValue) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedValue(newValue);
    onChange?.(newValue);
  }, [disabled, onChange]);

  // Get color based on value position
  const getColor = (val) => {
    const ratio = (val - min) / (max - min);
    if (ratio <= 0.3) return COSMIC_COLORS.glow.orange;
    if (ratio <= 0.6) return COSMIC_COLORS.glow.gold;
    return COSMIC_COLORS.glow.green;
  };

  // Get label for current value
  const getCurrentLabel = () => {
    if (labels[selectedValue]) return labels[selectedValue];
    // Default labels based on range
    const ratio = (selectedValue - min) / (max - min);
    if (ratio <= 0.2) return 'Rất thấp';
    if (ratio <= 0.4) return 'Thấp';
    if (ratio <= 0.6) return 'Trung bình';
    if (ratio <= 0.8) return 'Cao';
    return 'Rất cao';
  };

  const selectedColor = getColor(selectedValue);

  return (
    <View style={styles.container}>
      {/* Label Row */}
      {label && (
        <View style={styles.labelRow}>
          <Zap size={14} color={COSMIC_COLORS.glow.gold} />
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.valueBadge, { backgroundColor: selectedColor + '20', borderColor: selectedColor }]}>
            <Text style={[styles.valueBadgeText, { color: selectedColor }]}>
              {selectedValue}/{max}
            </Text>
          </View>
        </View>
      )}

      {/* Compact Horizontal Slider */}
      <View style={styles.sliderContainer}>
        {/* Track Background */}
        <View style={styles.track}>
          {/* Progress Fill */}
          <View
            style={[
              styles.trackFill,
              {
                width: `${((selectedValue - min) / (max - min)) * 100}%`,
                backgroundColor: selectedColor,
              }
            ]}
          />
        </View>

        {/* Dots Row */}
        <View style={styles.dotsContainer}>
          {steps.map((stepValue) => {
            const isSelected = stepValue === selectedValue;
            const isPast = stepValue <= selectedValue;

            return (
              <TouchableOpacity
                key={stepValue}
                onPress={() => handleSelect(stepValue)}
                disabled={disabled}
                activeOpacity={0.7}
                style={styles.dotTouchable}
                hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
              >
                <View
                  style={[
                    styles.dot,
                    isPast && { backgroundColor: selectedColor },
                    isSelected && styles.dotSelected,
                    isSelected && { borderColor: selectedColor, shadowColor: selectedColor },
                    disabled && styles.dotDisabled,
                  ]}
                >
                  {isSelected && (
                    <Text style={[styles.dotNumber, { color: COSMIC_COLORS.bgDeepSpace }]}>
                      {stepValue}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Min/Max Labels */}
        <View style={styles.minMaxLabels}>
          <Text style={styles.minMaxText}>{labels[min] || min}</Text>
          <Text style={[styles.currentLabel, { color: selectedColor }]}>
            {getCurrentLabel()}
          </Text>
          <Text style={styles.minMaxText}>{labels[max] || max}</Text>
        </View>
      </View>

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: COSMIC_SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xs,
    marginBottom: COSMIC_SPACING.sm,
  },
  label: {
    flex: 1,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.text.secondary,
  },
  valueBadge: {
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: 2,
    borderRadius: COSMIC_RADIUS.round,
    borderWidth: 1,
  },
  valueBadgeText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
  },

  // Slider
  sliderContainer: {
    position: 'relative',
    paddingVertical: COSMIC_SPACING.xs,
  },
  track: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 4,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    borderRadius: 2,
    marginTop: -2,
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dotTouchable: {
    padding: 2,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    borderWidth: 2,
    borderColor: COSMIC_COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  dotDisabled: {
    opacity: 0.5,
  },
  dotNumber: {
    fontSize: 11,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.bold,
  },

  // Labels
  minMaxLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: COSMIC_SPACING.xs,
    paddingHorizontal: 2,
  },
  minMaxText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs, // Increased (was 10)
    color: COSMIC_COLORS.text.hint,
  },
  currentLabel: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },

  // Error
  error: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.functional.error,
    marginTop: COSMIC_SPACING.xs,
  },
});

export default SliderInput;
