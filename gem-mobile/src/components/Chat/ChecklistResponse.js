// src/components/Chat/ChecklistResponse.js
// ============================================================
// CHECKLIST RESPONSE COMPONENT
// Interactive checklist for exercises/tasks
// ============================================================

import React, { memo, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Circle, Award } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

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
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
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
      color: colors.textPrimary,
    },
    duration: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.gold,
    },
    summary: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
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
      borderLeftColor: colors.gold,
    },
    rootCauseLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.gold,
      marginBottom: SPACING.xs,
    },
    rootCauseText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
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
      color: colors.textMuted,
      marginRight: SPACING.xs,
    },
    crystalText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.purple,
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
      backgroundColor: colors.gold,
      borderRadius: 2,
    },
    progressText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
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
      borderColor: colors.textMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    checkboxChecked: {
      backgroundColor: colors.gold,
      borderColor: colors.gold,
    },
    itemText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textPrimary,
      flex: 1,
    },
    itemTextChecked: {
      color: colors.textMuted,
      textDecorationLine: 'line-through',
    },
    completeButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.gold,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 12,
      marginTop: SPACING.md,
      gap: SPACING.xs,
    },
    completeButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.bgDark,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
                <Check size={14} color={colors.bgDark} />
              ) : (
                <Circle size={14} color={colors.textMuted} />
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
          <Award size={18} color={colors.bgDark} />
          <Text style={styles.completeButtonText}>Hoàn thành!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

ChecklistResponse.displayName = 'ChecklistResponse';

export default ChecklistResponse;
