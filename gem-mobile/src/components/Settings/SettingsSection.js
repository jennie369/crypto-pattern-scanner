/**
 * SettingsSection - Group settings items with a header
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

export default function SettingsSection({ title, children }) {
  const { colors, theme, SPACING, getFontSize } = useSettings();

  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING.lg,
    },
    header: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    title: {
      fontSize: getFontSize(11),
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    content: {
      backgroundColor: theme.card.backgroundColor,
      borderRadius: theme.card.borderRadius,
      borderWidth: theme.card.borderWidth,
      borderColor: theme.card.borderColor,
      overflow: 'hidden',
      // Light theme shadow
      ...(colors.shadowColor && {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }),
    },
  });

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}
