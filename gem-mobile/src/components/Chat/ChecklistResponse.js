// src/components/Chat/ChecklistResponse.js
// ============================================================
// CHECKLIST RESPONSE COMPONENT
// Interactive checklist for exercises/tasks
// ============================================================

import React, { memo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Circle, Award } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const ChecklistResponse = memo(({
  title,
  summary,
  rootCause,
  items = [],
  duration,
  crystal,
  onItemToggle,
  onComplete,
}) => {
  const [checkedItems, setCheckedItems] = useState(
    items.map(item => item?.done || false)
  );

  const handleToggle = useCallback((index) => {
    setCheckedItems(prev => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
    onItemToggle?.(index);
  }, [onItemToggle]);

  const completedCount = checkedItems.filter(Boolean).length;
  const allCompleted = completedCount === items.length && items.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title || 'Bài tập'}</Text>
        {duration && (
          <Text style={styles.duration}>{duration}</Text>
        )}
      </View>

      {/* Summary - Wisdom explanation */}
      {summary && (
        <Text style={styles.summary}>{summary}</Text>
      )}

      {/* Root Cause */}
      {rootCause && (
        <View style={styles.rootCauseContainer}>
          <Text style={styles.rootCauseLabel}>📍 Nguyên nhân gốc:</Text>
          <Text style={styles.rootCauseText}>{rootCause}</Text>
        </View>
      )}

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedCount / Math.max(items.length, 1)) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount}/{items.length}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.itemsContainer}>
        {(items || []).map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.itemRow}
            onPress={() => handleToggle(index)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              checkedItems[index] && styles.checkboxChecked
            ]}>
              {checkedItems[index] ? (
                <Check size={14} color={COLORS.bgDark} />
              ) : (
                <Circle size={14} color={COLORS.textMuted} />
              )}
            </View>
            <Text style={[
              styles.itemText,
              checkedItems[index] && styles.itemTextChecked
            ]}>
              {item?.step ? `${item.step}. ` : ''}{item?.text || item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Crystal Recommendation */}
      {crystal && (
        <View style={styles.crystalContainer}>
          <Text style={styles.crystalLabel}>💎 Đá phù hợp:</Text>
          <Text style={styles.crystalText}>{crystal}</Text>
        </View>
      )}

      {/* Complete Button */}
      {allCompleted && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={onComplete}
        >
          <Award size={18} color={COLORS.bgDark} />
          <Text style={styles.completeButtonText}>Hoàn thành!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  duration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
  summary: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  rootCauseContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  rootCauseLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  rootCauseText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  crystalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  crystalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.xs,
  },
  crystalText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.purple,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    minWidth: 40,
    textAlign: 'right',
  },
  itemsContainer: {
    gap: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  itemText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    flex: 1,
  },
  itemTextChecked: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  completeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  completeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDark,
  },
});

ChecklistResponse.displayName = 'ChecklistResponse';

export default ChecklistResponse;
