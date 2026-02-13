/**
 * QuickActionBar.js
 * Quick action buttons for Calendar Smart Journal
 * Shows mood check-in, write journal, log trade, etc.
 *
 * Created: January 28, 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  BookOpen,
  TrendingUp,
  Heart,
  Sparkles,
  Lock,
  Smile,
  Star,
  Plus,
  Calendar,
  Target,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';
import { checkCalendarAccess } from '../../config/calendarAccessControl';
import { CHECK_IN_TYPES } from '../../services/moodTrackingService';

/**
 * QuickActionBar Component
 */
const QuickActionBar = ({
  onWriteJournal,
  onLogTrade,
  onGratitude,
  onQuickRitual,
  onMoodCheckIn,
  onGoalProgress,
  pendingMoodCheckIn = null, // { type: 'morning'/'evening', isOptional: false }
  userTier = 'FREE',
  userRole = null,
  compact = false,
}) => {
  // Check access for each feature
  const journalAccess = checkCalendarAccess('basic_journal', userTier, userRole);
  const tradingAccess = checkCalendarAccess('trading_journal', userTier, userRole);
  const moodAccess = checkCalendarAccess('mood_tracking', userTier, userRole);

  // Get pending mood label
  const getMoodCheckInLabel = () => {
    if (!pendingMoodCheckIn) return 'Cảm xúc';

    switch (pendingMoodCheckIn.type) {
      case CHECK_IN_TYPES.MORNING:
        return 'Sáng';
      case CHECK_IN_TYPES.MIDDAY:
        return 'Trưa';
      case CHECK_IN_TYPES.EVENING:
        return 'Tối';
      default:
        return 'Cảm xúc';
    }
  };

  // Define actions
  const actions = [
    // Mood check-in (highlighted if pending)
    {
      id: 'mood',
      label: getMoodCheckInLabel(),
      icon: Smile,
      color: pendingMoodCheckIn && !pendingMoodCheckIn.isOptional ? COLORS.gold : COLORS.cyan,
      onPress: onMoodCheckIn,
      access: moodAccess,
      highlight: pendingMoodCheckIn && !pendingMoodCheckIn.isOptional,
      badge: pendingMoodCheckIn && !pendingMoodCheckIn.isOptional ? '!' : null,
    },
    // Write journal
    {
      id: 'journal',
      label: 'Nhật ký',
      icon: BookOpen,
      color: COLORS.purple,
      onPress: onWriteJournal,
      access: journalAccess,
    },
    // Log trade
    {
      id: 'trade',
      label: 'Trade',
      icon: TrendingUp,
      color: COLORS.success,
      onPress: onLogTrade,
      access: tradingAccess,
    },
    // Gratitude
    {
      id: 'gratitude',
      label: 'Biết ơn',
      icon: Heart,
      color: COLORS.error,
      onPress: onGratitude,
      access: journalAccess,
    },
    // Quick ritual
    {
      id: 'ritual',
      label: 'Ritual',
      icon: Sparkles,
      color: COLORS.gold,
      onPress: onQuickRitual,
      access: { allowed: true }, // Rituals always accessible
    },
    // Goal progress
    {
      id: 'goal',
      label: 'Mục tiêu',
      icon: Target,
      color: COLORS.info,
      onPress: onGoalProgress,
      access: { allowed: true },
    },
  ];

  // Render action button
  const renderAction = (action) => {
    const IconComponent = action.icon;
    const isLocked = !action.access.allowed;

    return (
      <TouchableOpacity
        key={action.id}
        style={[
          styles.actionButton,
          compact && styles.actionButtonCompact,
          action.highlight && styles.actionButtonHighlight,
          isLocked && styles.actionButtonLocked,
        ]}
        onPress={isLocked ? undefined : action.onPress}
        activeOpacity={isLocked ? 1 : 0.7}
        disabled={isLocked}
      >
        <View
          style={[
            styles.actionIconContainer,
            compact && styles.actionIconContainerCompact,
            { backgroundColor: isLocked ? COLORS.textMuted + '20' : action.color + '20' },
            action.highlight && { backgroundColor: action.color + '30' },
          ]}
        >
          {isLocked ? (
            <Lock size={compact ? 16 : 20} color={COLORS.textMuted} />
          ) : (
            <IconComponent size={compact ? 16 : 20} color={action.color} />
          )}

          {/* Badge */}
          {action.badge && !isLocked && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{action.badge}</Text>
            )}
            </View>
          )}
        </View>

        <Text
          style={[
            styles.actionLabel,
            compact && styles.actionLabelCompact,
            isLocked && styles.actionLabelLocked,
            action.highlight && { color: action.color },
          ]}
          numberOfLines={1}
        >
          {action.label}
        </Text>

        {/* Tier lock indicator */}
        {isLocked && !compact && (
          <Text style={styles.tierLabel}>{action.access.requiredTier}</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.compactContainer}
      >
        {actions.map(renderAction)}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        {actions.slice(0, 3).map(renderAction)}
      </View>
      <View style={styles.actionsRow}>
        {actions.slice(3).map(renderAction)}
      </View>
    </View>
  );
};

/**
 * QuickActionButton - Single quick action button
 */
export const QuickActionButton = ({
  label,
  icon: IconComponent,
  color = COLORS.gold,
  onPress,
  disabled = false,
  badge,
  size = 'medium',
}) => {
  const sizes = {
    small: { icon: 16, padding: SPACING.sm },
    medium: { icon: 20, padding: SPACING.md },
    large: { icon: 24, padding: SPACING.lg },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <TouchableOpacity
      style={[
        styles.singleButton,
        { padding: sizeConfig.padding },
        disabled && styles.singleButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.singleIconContainer,
          { backgroundColor: disabled ? COLORS.textMuted + '20' : color + '20' },
        ]}
      >
        <IconComponent
          size={sizeConfig.icon}
          color={disabled ? COLORS.textMuted : color}
        />
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          )}
          </View>
        )}
      </View>
      <Text
        style={[
          styles.singleLabel,
          disabled && styles.singleLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * FloatingActionButton - Floating add button
 */
export const FloatingActionButton = ({
  onPress,
  icon: IconComponent = Plus,
  color = COLORS.gold,
  size = 56,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <IconComponent size={24} color={COLORS.bgDarkest} />
    </TouchableOpacity>
  );
};

/**
 * MiniActionBar - Compact row of actions
 */
export const MiniActionBar = ({
  actions = [],
  onActionPress,
}) => {
  return (
    <View style={styles.miniBar}>
      {actions.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <TouchableOpacity
            key={action.id || index}
            style={styles.miniAction}
            onPress={() => onActionPress?.(action)}
            activeOpacity={0.7}
          >
            <IconComponent size={18} color={action.color || COLORS.textMuted} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.sm,
  },
  compactContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButtonCompact: {
    flex: 0,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  actionButtonHighlight: {
    borderColor: COLORS.gold + '50',
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
  },
  actionButtonLocked: {
    opacity: 0.6,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  actionIconContainerCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: SPACING.xxs,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionLabelCompact: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  actionLabelLocked: {
    color: COLORS.textMuted,
  },
  tierLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Single button styles
  singleButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  singleButtonDisabled: {
    opacity: 0.5,
  },
  singleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  singleLabelDisabled: {
    color: COLORS.textMuted,
  },

  // FAB styles
  fab: {
    position: 'absolute',
    bottom: 100,
    right: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Mini bar styles
  miniBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  miniAction: {
    padding: SPACING.xs,
  },
});

export default QuickActionBar;
