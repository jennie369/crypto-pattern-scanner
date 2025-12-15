/**
 * HabitGrid Component
 * Vision Board Gamification - GitHub-style Activity Grid
 *
 * Features:
 * - 5x7 grid (35 days) of activity squares
 * - Color intensity based on combo count
 * - Week/Month labels
 * - Legend for color meanings
 *
 * Design: Liquid Glass theme, dark mode
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Grid3x3, Calendar } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

// Grid configuration
const GRID_COLS = 7; // Days in a week
const GRID_ROWS = 5; // Weeks to show
const CELL_SIZE = 32;
const CELL_GAP = 4;

// Day labels (Vietnamese)
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Get cell color based on combo count
const getCellColor = (comboCount) => {
  if (comboCount === 0) return 'rgba(255, 255, 255, 0.05)';
  if (comboCount === 1) return COLORS.purple + '40';
  if (comboCount === 2) return COLORS.purple + '70';
  if (comboCount === 3) return COLORS.gold;
  return 'rgba(255, 255, 255, 0.05)';
};

// Grid cell component
const GridCell = memo(({ date, comboCount, isToday }) => {
  const cellColor = getCellColor(comboCount);
  const day = new Date(date).getDate();

  return (
    <View
      style={[
        styles.gridCell,
        {
          backgroundColor: cellColor,
          borderWidth: isToday ? 2 : 0,
          borderColor: isToday ? COLORS.cyan : 'transparent',
        },
      ]}
    >
      <Text
        style={[
          styles.cellText,
          { color: comboCount === 3 ? '#000' : COLORS.textMuted },
        ]}
      >
        {day}
      </Text>
    </View>
  );
});

// Legend item component
const LegendItem = memo(({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendColor, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
));

const HabitGrid = memo(({
  gridData = [],
  title = 'Hoạt động 5 tuần gần nhất',
}) => {
  // Process grid data into rows
  const gridRows = useMemo(() => {
    const rows = [];
    const today = new Date().toISOString().split('T')[0];

    // Fill with last 35 days if data is sparse
    const dataMap = new Map(
      gridData.map(item => [item.date, item])
    );

    // Create 5 weeks of data
    for (let week = 0; week < GRID_ROWS; week++) {
      const row = [];
      for (let day = 0; day < GRID_COLS; day++) {
        const daysAgo = (GRID_ROWS - 1 - week) * 7 + (GRID_COLS - 1 - day);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];

        const dayData = dataMap.get(dateStr) || {
          date: dateStr,
          comboCount: 0,
        };

        row.push({
          ...dayData,
          isToday: dateStr === today,
        });
      }
      rows.push(row);
    }

    return rows;
  }, [gridData]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalDays = 0;
    let fullComboDays = 0;

    gridData.forEach(day => {
      if (day.comboCount > 0) totalDays++;
      if (day.comboCount === 3) fullComboDays++;
    });

    return { totalDays, fullComboDays };
  }, [gridData]);

  return (
    <View style={styles.container}>
      <BlurView intensity={GLASS.blur} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(15, 16, 48, 0.55)', 'rgba(15, 16, 48, 0.4)']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Grid3x3 size={18} color={COLORS.purple} />
              <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statValue}>{stats.totalDays}</Text>
              <Text style={styles.statLabel}>ngày</Text>
            </View>
          </View>

          {/* Day labels */}
          <View style={styles.dayLabels}>
            {DAY_LABELS.map((label, index) => (
              <Text key={index} style={styles.dayLabel}>
                {label}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {gridRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {row.map((cell, cellIndex) => (
                  <GridCell
                    key={cellIndex}
                    date={cell.date}
                    comboCount={cell.comboCount}
                    isToday={cell.isToday}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <LegendItem color="rgba(255, 255, 255, 0.05)" label="0" />
            <LegendItem color={COLORS.purple + '40'} label="1" />
            <LegendItem color={COLORS.purple + '70'} label="2" />
            <LegendItem color={COLORS.gold} label="3" />
            <Text style={styles.legendNote}>= combo</Text>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: GLASS.borderRadius - GLASS.borderWidth,
  },
  gradient: {
    padding: SPACING.lg,
  },

  // Header
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
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Day labels
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  dayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Grid
  grid: {
    gap: CELL_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gridCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  legendNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
});

export default HabitGrid;
