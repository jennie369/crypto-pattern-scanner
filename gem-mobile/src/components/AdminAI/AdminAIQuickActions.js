/**
 * GEM AI Trading Brain - Quick Actions Component
 * Horizontal scrollable quick action buttons
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Search,
  Layers,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Zap,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

// ═══════════════════════════════════════════════════════════
// QUICK ACTIONS CONFIG
// ═══════════════════════════════════════════════════════════
const QUICK_ACTIONS = [
  {
    id: 'analyze_pattern',
    label: 'Phân tích Pattern',
    icon: Search,
    color: COLORS.purple,
  },
  {
    id: 'check_zone',
    label: 'Zone Analysis',
    icon: Layers,
    color: COLORS.cyan,
  },
  {
    id: 'entry_suggestion',
    label: 'Gợi ý Entry',
    icon: TrendingUp,
    color: COLORS.success,
  },
  {
    id: 'position_review',
    label: 'Review Positions',
    icon: Briefcase,
    color: COLORS.gold,
  },
  {
    id: 'risk_check',
    label: 'Kiểm tra Risk',
    icon: AlertTriangle,
    color: COLORS.error,
  },
  {
    id: 'predict_candle',
    label: 'Dự đoán Nến',
    icon: Zap,
    color: COLORS.purpleGlow,
  },
];

const AdminAIQuickActions = ({ onActionPress, disabled = false }) => {
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
                color={disabled ? COLORS.textMuted : action.color}
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

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionButtonDisabled: {
    opacity: 0.5,
    borderColor: COLORS.textMuted,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionLabelDisabled: {
    color: COLORS.textMuted,
  },
});

export default AdminAIQuickActions;
