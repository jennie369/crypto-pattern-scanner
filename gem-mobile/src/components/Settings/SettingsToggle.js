/**
 * SettingsToggle - Toggle switch settings item
 */

import React from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

export default function SettingsToggle({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
}) {
  const { colors, theme, SPACING, getFontSize, triggerHaptic, settings } = useSettings();

  const handleChange = (newValue) => {
    triggerHaptic('light');
    onValueChange?.(newValue);
  };

  // Get toggle colors based on theme
  const toggleOnColor = theme.toggle?.on || colors.toggleOn || '#059669';
  const toggleOffColor = settings.theme === 'light' ? '#CCCCCC' : 'rgba(255,255,255,0.3)';

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      backgroundColor: 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight || 'rgba(255,255,255,0.05)',
      opacity: disabled ? 0.5 : 1,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: iconColor ? `${iconColor}20` : 'rgba(106, 91, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: getFontSize(15),
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: subtitle ? 2 : 0,
    },
    subtitle: {
      fontSize: getFontSize(12),
      color: colors.textMuted,
    },
  });

  return (
    <View style={styles.container}>
      {Icon && (
        <View style={styles.iconContainer}>
          <Icon
            size={18}
            color={iconColor || colors.purple || colors.primary}
          />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <Switch
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
        trackColor={{
          false: toggleOffColor,
          true: toggleOnColor,
        }}
        thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
        ios_backgroundColor={toggleOffColor}
      />
    </View>
  );
}
