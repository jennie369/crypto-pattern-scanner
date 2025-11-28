/**
 * Gemral - Button Component
 * Reusable button with primary/secondary variants
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, BUTTON } from '../../utils/tokens';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[disabled && styles.disabled, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={GRADIENTS.primaryButton}
          style={styles.primaryButton}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <Text style={styles.primaryText}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Secondary variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.secondaryButton, disabled && styles.disabled, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.gold} />
      ) : (
        <Text style={styles.secondaryText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    height: 48,
    paddingHorizontal: SPACING.xl,
    borderRadius: BUTTON.primary.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  secondaryButton: {
    height: 48,
    paddingHorizontal: SPACING.xl,
    borderRadius: BUTTON.primary.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.5)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  disabled: {
    opacity: 0.5,
  },
});
