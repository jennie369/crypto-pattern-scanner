/**
 * GEM AI Trading Brain - Quick Actions Component
 * Horizontal scrollable quick action buttons
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Search,
  Layers,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Zap,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

const AdminAIQuickActions = ({ onActionPress, disabled = false }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // ═══════════════════════════════════════════════════════════
  // QUICK ACTIONS CONFIG
  // ═══════════════════════════════════════════════════════════
  const QUICK_ACTIONS = useMemo(() => [
    {
      id: 'analyze_pattern',
      label: 'Phân tích Pattern',
      icon: Search,
      color: colors.purple,
    },
    {
      id: 'check_zone',
      label: 'Zone Analysis',
      icon: Layers,
      color: colors.cyan,
    },
    {
      id: 'entry_suggestion',
      label: 'Gợi ý Entry',
      icon: TrendingUp,
      color: colors.success,
    },
    {
      id: 'position_review',
      label: 'Review Positions',
      icon: Briefcase,
      color: colors.gold,
    },
    {
      id: 'risk_check',
      label: 'Kiểm tra Risk',
      icon: AlertTriangle,
      color: colors.error,
    },
    {
      id: 'predict_candle',
      label: 'Dự đoán Nến',
      icon: Zap,
      color: colors.purpleGlow,
    },
  ], [colors]);

  // ═══════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginVertical: SPACING.sm,
    },
    scrollContent: {
      paddingHorizontal: SPACING.md,
      gap: SPACING.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 20,
      borderWidth: 1,
    },
    actionButtonDisabled: {
      opacity: 0.5,
      borderColor: colors.textMuted,
    },
    actionLabel: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    actionLabelDisabled: {
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_ACTIONS.map((action) => {
          const IconComponent = action.icon;
          return (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionButton,
                { borderColor: action.color },
                disabled && styles.actionButtonDisabled,
              ]}
              onPress={() => onActionPress?.(action.id)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <IconComponent
                size={16}
                color={disabled ? colors.textMuted : action.color}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.actionLabel,
                  disabled && styles.actionLabelDisabled,
                ]}
                numberOfLines={1}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default AdminAIQuickActions;
