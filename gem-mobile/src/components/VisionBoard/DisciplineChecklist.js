/**
 * DisciplineChecklist.js
 * Trading discipline checklist component for Trading Journal
 * Tracks pre-trade discipline items and calculates score
 *
 * Created: January 28, 2026
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  CheckCircle2,
  Circle,
  Shield,
  TrendingUp,
  AlertTriangle,
  Award,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';
import { DISCIPLINE_CHECKLIST_ITEMS } from '../../services/tradingJournalService';

/**
 * Get discipline score color
 */
const getDisciplineColor = (score) => {
  if (score >= 90) return COLORS.success;
  if (score >= 70) return COLORS.gold;
  if (score >= 50) return COLORS.warning;
  return COLORS.error;
};

/**
 * Get discipline label
 */
const getDisciplineLabel = (score) => {
  if (score >= 90) return 'Tuyet voi';
  if (score >= 70) return 'Tot';
  if (score >= 50) return 'Trung binh';
  return 'Can cai thien';
};

/**
 * DisciplineChecklist Component
 */
const DisciplineChecklist = ({
  checklist = {},
  onChange,
  disabled = false,
  showScore = true,
  compact = false,
}) => {
  // Calculate score
  const score = useMemo(() => {
    const totalItems = DISCIPLINE_CHECKLIST_ITEMS.length;
    if (totalItems === 0) return 0;

    const checkedCount = DISCIPLINE_CHECKLIST_ITEMS.filter(
      (item) => checklist[item.id] === true
    ).length;

    return Math.round((checkedCount / totalItems) * 100);
  }, [checklist]);

  const scoreColor = getDisciplineColor(score);
  const scoreLabel = getDisciplineLabel(score);

  // Handle toggle
  const handleToggle = (itemId) => {
    if (disabled) return;

    const newChecklist = {
      ...checklist,
      [itemId]: !checklist[itemId],
    };

    onChange?.(newChecklist);
  };

  // Render checklist item
  const renderItem = (item) => {
    const isChecked = checklist[item.id] === true;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.item,
          isChecked && styles.itemChecked,
          compact && styles.itemCompact,
          disabled && styles.itemDisabled,
        ]}
        onPress={() => handleToggle(item.id)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          {isChecked ? (
            <CheckCircle2 size={compact ? 18 : 22} color={COLORS.success} />
          ) : (
            <Circle size={compact ? 18 : 22} color={COLORS.textMuted} />
          )}

          <View style={styles.itemTextContainer}>
            <Text
              style={[
                styles.itemText,
                isChecked && styles.itemTextChecked,
                compact && styles.itemTextCompact,
              ]}
            >
              {item.label}
            </Text>
            {!compact && item.description && (
              <Text style={styles.itemDescription}>{item.description}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Shield size={16} color={scoreColor} />
          <Text style={styles.compactTitle}>Discipline</Text>
          <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '20' }]}>
            <Text style={[styles.scoreBadgeText, { color: scoreColor }]}>
              {score}%
            </Text>
          </View>
        </View>

        <View style={styles.compactProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${score}%`, backgroundColor: scoreColor },
              ]}
            />
          </View>
          <Text style={[styles.compactScore, { color: scoreColor }]}>
            {DISCIPLINE_CHECKLIST_ITEMS.filter((item) => checklist[item.id]).length}/
            {DISCIPLINE_CHECKLIST_ITEMS.length}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with score */}
      {showScore && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Shield size={20} color={scoreColor} />
            <Text style={styles.headerTitle}>Ky luat giao dich</Text>
          </View>

          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreText, { color: scoreColor }]}>{score}</Text>
            </View>
            <View>
              <Text style={styles.scoreLabel}>{scoreLabel}</Text>
              <Text style={styles.scoreSub}>Diem ky luat</Text>
            </View>
          </View>
        </View>
      )}

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${score}%`, backgroundColor: scoreColor },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {DISCIPLINE_CHECKLIST_ITEMS.filter((item) => checklist[item.id]).length}/
          {DISCIPLINE_CHECKLIST_ITEMS.length} hoan thanh
        </Text>
      </View>

      {/* Checklist items */}
      <View style={styles.itemsContainer}>
        {DISCIPLINE_CHECKLIST_ITEMS.map(renderItem)}
      </View>

      {/* Warning for low score */}
      {score < 50 && !disabled && (
        <View style={styles.warningContainer}>
          <AlertTriangle size={16} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Diem ky luat thap co the dan den quyet dinh sai lam
          </Text>
        </View>
      )}

      {/* Achievement for high score */}
      {score >= 90 && (
        <View style={styles.achievementContainer}>
          <Award size={16} color={COLORS.success} />
          <Text style={styles.achievementText}>
            Tuyet voi! Ban da tuan thu day du ky luat giao dich
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * DisciplineScoreDisplay - Read-only score display
 */
export const DisciplineScoreDisplay = ({ score, size = 'medium' }) => {
  const scoreColor = getDisciplineColor(score);
  const scoreLabel = getDisciplineLabel(score);

  const sizes = {
    small: { circle: 32, text: 11, icon: 14 },
    medium: { circle: 44, text: 14, icon: 18 },
    large: { circle: 56, text: 18, icon: 22 },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <View style={styles.scoreDisplayContainer}>
      <View
        style={[
          styles.scoreDisplayCircle,
          {
            width: sizeConfig.circle,
            height: sizeConfig.circle,
            borderRadius: sizeConfig.circle / 2,
            borderColor: scoreColor,
          },
        ]}
      >
        <Shield size={sizeConfig.icon} color={scoreColor} />
      </View>
      <View style={styles.scoreDisplayText}>
        <Text style={[styles.scoreDisplayValue, { fontSize: sizeConfig.text, color: scoreColor }]}>
          {score}%
        </Text>
        {size !== 'small' && (
          <Text style={styles.scoreDisplayLabel}>{scoreLabel}</Text>
        )}
      </View>
    </View>
  );
};

/**
 * QuickDisciplineCheck - Simplified checklist for quick entry
 */
export const QuickDisciplineCheck = ({
  checklist = {},
  onChange,
  disabled = false,
}) => {
  const essentialItems = DISCIPLINE_CHECKLIST_ITEMS.filter((item) => item.essential);

  const handleToggle = (itemId) => {
    if (disabled) return;

    const newChecklist = {
      ...checklist,
      [itemId]: !checklist[itemId],
    };

    onChange?.(newChecklist);
  };

  return (
    <View style={styles.quickContainer}>
      <Text style={styles.quickTitle}>Kiem tra nhanh</Text>
      <View style={styles.quickItems}>
        {essentialItems.map((item) => {
          const isChecked = checklist[item.id] === true;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.quickItem,
                isChecked && styles.quickItemChecked,
              ]}
              onPress={() => handleToggle(item.id)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              {isChecked ? (
                <CheckCircle2 size={16} color={COLORS.success} />
              ) : (
                <Circle size={16} color={COLORS.textMuted} />
              )}
              <Text
                style={[
                  styles.quickItemText,
                  isChecked && styles.quickItemTextChecked,
                ]}
                numberOfLines={1}
              >
                {item.shortLabel || item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scoreCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scoreText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  scoreSub: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  itemsContainer: {
    gap: SPACING.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemChecked: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success + '30',
  },
  itemCompact: {
    padding: SPACING.sm,
  },
  itemDisabled: {
    opacity: 0.6,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    flex: 1,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.4,
  },
  itemTextChecked: {
    color: COLORS.textPrimary,
  },
  itemTextCompact: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  itemDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.warning + '15',
    borderRadius: BORDER_RADIUS.sm,
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.success + '15',
    borderRadius: BORDER_RADIUS.sm,
  },
  achievementText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
  },

  // Compact styles
  compactContainer: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  compactTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  scoreBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  scoreBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  compactProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  compactScore: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Score display styles
  scoreDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scoreDisplayCircle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scoreDisplayText: {
    gap: 2,
  },
  scoreDisplayValue: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scoreDisplayLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Quick discipline styles
  quickContainer: {
    marginTop: SPACING.sm,
  },
  quickTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  quickItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickItemChecked: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success + '30',
  },
  quickItemText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  quickItemTextChecked: {
    color: COLORS.success,
  },
});

export default DisciplineChecklist;
