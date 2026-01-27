/**
 * Privacy Toggle Component
 * Toggle switch with icon, description, and tooltip
 *
 * Features:
 * - Icon + Title + Description
 * - Animated switch
 * - Tooltip on info press
 * - Disabled state
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

export default function PrivacyToggle({
  icon,
  title,
  description,
  value,
  onToggle,
  disabled = false,
  tooltip = null,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  // Animate tooltip
  useEffect(() => {
    Animated.timing(tooltipOpacity, {
      toValue: showTooltip ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showTooltip]);

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleTooltipPress = () => {
    if (tooltip) {
      setShowTooltip(!showTooltip);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={COLORS.textSecondary} />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, disabled && styles.titleDisabled]}>
              {title}
            </Text>
            {tooltip && (
              <TouchableOpacity
                onPress={handleTooltipPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.infoButton}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={showTooltip ? COLORS.purple : COLORS.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.description, disabled && styles.descriptionDisabled]}>
            {description}
          </Text>
        </View>

        {/* Switch */}
        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{
            false: 'rgba(255, 255, 255, 0.1)',
            true: 'rgba(106, 91, 255, 0.4)',
          }}
          thumbColor={value ? COLORS.purple : COLORS.textMuted}
          ios_backgroundColor="rgba(255, 255, 255, 0.1)"
          style={styles.switch}
        />
      </View>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <Animated.View style={[styles.tooltip, { opacity: tooltipOpacity }]}>
          <View style={styles.tooltipArrow} />
          <Text style={styles.tooltipText}>{tooltip}</Text>
          <TouchableOpacity
            style={styles.tooltipClose}
            onPress={() => setShowTooltip(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Separator */}
      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },

  // Icon
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  // Text
  textContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  titleDisabled: {
    color: COLORS.textMuted,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  descriptionDisabled: {
    opacity: 0.5,
  },

  // Info Button
  infoButton: {
    marginLeft: SPACING.xs,
    padding: 2,
  },

  // Switch
  switch: {
    transform: Platform.OS === 'ios' ? [{ scale: 0.85 }] : [],
  },

  // Tooltip
  tooltip: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    top: '100%',
    marginTop: -SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -8,
    left: 50,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(106, 91, 255, 0.3)',
  },
  tooltipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    paddingRight: SPACING.lg,
  },
  tooltipClose: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    marginLeft: SPACING.md + 36 + SPACING.md, // icon width + margins
  },
});
