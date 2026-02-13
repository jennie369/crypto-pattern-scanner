/**
 * SettingsItem - Tappable settings row with icon and arrow
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

export default function SettingsItem({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  value,
  onPress,
  showArrow = true,
  rightComponent,
  disabled = false,
  destructive = false,
}) {
  const { colors, SPACING, getFontSize, triggerHaptic } = useSettings();

  const handlePress = () => {
    if (disabled) return;
    triggerHaptic('light');
    onPress?.();
  };

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
      color: destructive ? colors.errorText || colors.error : colors.textPrimary,
      marginBottom: subtitle ? 2 : 0,
    },
    subtitle: {
      fontSize: getFontSize(12),
      color: colors.textMuted,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    value: {
      fontSize: getFontSize(14),
      color: colors.textSecondary,
    },
    arrow: {
      marginLeft: SPACING.xs,
    },
  });

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? {
    onPress: handlePress,
    activeOpacity: 0.7,
    disabled,
  } : {};

  return (
    <Wrapper style={styles.container} {...wrapperProps}>
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

      <View style={styles.rightContainer}>
        {rightComponent}
        {value && !rightComponent && (
          <Text style={styles.value}>{value}</Text>
        )}
        {showArrow && onPress && (
          <ChevronRight
            size={20}
            color={colors.textMuted}
            style={styles.arrow}
          />
        )}
      </View>
    </Wrapper>
  );
}
