/**
 * Gemral - Quick Actions Component
 * Shortcut buttons for I Ching and Tarot readings
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Hexagon, Layers } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, TOUCH, INPUT } from '../../../utils/tokens';

const QuickActions = ({ onIChing, onTarot }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khám phá</Text>

      <View style={styles.buttonsRow}>
        {/* I Ching Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onIChing}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrapper, styles.iconIChing]}>
            <Hexagon size={24} color={COLORS.gold} />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.actionTitle}>Kinh Dịch</Text>
            <Text style={styles.actionSubtitle}>I Ching Reading</Text>
          </View>
        </TouchableOpacity>

        {/* Tarot Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onTarot}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrapper, styles.iconTarot]}>
            <Layers size={24} color={COLORS.cyan} />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.actionTitle}>Tarot</Text>
            <Text style={styles.actionSubtitle}>Card Reading</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    marginBottom: SPACING.md,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.inputBorder,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconWrapper: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: INPUT.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconIChing: {
    backgroundColor: COLORS.glassBgLight,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  iconTarot: {
    backgroundColor: COLORS.glassBgLight,
    borderWidth: 1,
    borderColor: COLORS.cyan,
  },
  textWrapper: {
    flex: 1,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  actionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
});

export default QuickActions;
