/**
 * Gemral - Input Component
 * Reusable text input with label
 */

import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { INPUT } from '../../utils/tokens';

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  style,
}) {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      gap: SPACING.sm,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textSecondary,
    },
    input: {
      height: 48,
      paddingHorizontal: SPACING.lg,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderWidth: 1,
      borderColor: INPUT.borderColor,
      borderRadius: INPUT.borderRadius,
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.xl,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.error,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[styles.input, error && styles.inputError]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
