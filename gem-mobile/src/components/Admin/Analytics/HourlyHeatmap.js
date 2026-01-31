/**
 * HourlyHeatmap Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Displays a 24x7 grid showing usage patterns by hour and day
 * - Color intensity based on activity level
 * - Interactive cells showing details
 * - Legend for intensity scale
 *
 * Created: January 30, 2026
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, GLASS } from '../../../utils/tokens';

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const HourlyHeatmap = ({
  data = [], // Array of { day: 0-6, hour: 0-23, value: number }
  title = 'Hoạt động theo giờ',
  valueLabel = 'hoạt động',
  onCellPress,
  style,
}) => {
  const [selectedCell, setSelectedCell] = useState(null);

  // Process data into a 7x24 grid
  const { grid, maxValue } = useMemo(() => {
    // Initialize grid with zeros
    const gridData = Array(7).fill(null).map(() => Array(24).fill(0));
    let max = 0;

    // Fill grid with data
    data.forEach(item => {
      const day = item.day_of_week ?? item.day;
      const hour = item.hour_of_day ?? item.hour;
      const value = item.value ?? item.count ?? 0;

      if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
        gridData[day][hour] = value;
        if (value > max) max = value;
      }
    });

    return { grid: gridData, maxValue: max || 1 };
  }, [data]);

  // Get color intensity based on value
  const getCellColor = (value) => {
    if (value === 0) return 'rgba(106, 91, 255, 0.05)';

    const intensity = value / maxValue;

    if (intensity >= 0.8) return 'rgba(106, 91, 255, 0.9)';
    if (intensity >= 0.6) return 'rgba(106, 91, 255, 0.7)';
    if (intensity >= 0.4) return 'rgba(106, 91, 255, 0.5)';
    if (intensity >= 0.2) return 'rgba(106, 91, 255, 0.3)';
    return 'rgba(106, 91, 255, 0.15)';
  };

  const handleCellPress = (day, hour, value) => {
    setSelectedCell({ day, hour, value });
    onCellPress?.({ day, hour, value, dayName: DAYS[day] });
  };

  return (
    <View style={[styles.container, style]}>
      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Heatmap Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Hour Labels (Top) */}
          <View style={styles.hourLabelsRow}>
            <View style={styles.cornerCell} />
            {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
              <View key={hour} style={styles.hourLabelCell}>
                <Text style={styles.hourLabel}>{`${hour}h`}</Text>
              </View>
            ))}
          </View>

          {/* Grid Rows */}
          {DAYS.map((day, dayIndex) => (
            <View key={day} style={styles.gridRow}>
              {/* Day Label */}
              <View style={styles.dayLabelCell}>
                <Text style={styles.dayLabel}>{day}</Text>
              </View>

              {/* Hour Cells */}
              {HOURS.map(hour => {
                const value = grid[dayIndex][hour];
                const isSelected = selectedCell?.day === dayIndex && selectedCell?.hour === hour;

                return (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.cell,
                      { backgroundColor: getCellColor(value) },
                      isSelected && styles.cellSelected,
                    ]}
                    onPress={() => handleCellPress(dayIndex, hour, value)}
                    activeOpacity={0.7}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Ít</Text>
        <View style={styles.legendScale}>
          {[0.05, 0.15, 0.3, 0.5, 0.7, 0.9].map((opacity, index) => (
            <View
              key={index}
              style={[
                styles.legendCell,
                { backgroundColor: `rgba(106, 91, 255, ${opacity})` },
              ]}
            />
          ))}
        </View>
        <Text style={styles.legendText}>Nhiều</Text>
      </View>

      {/* Selected Cell Info */}
      {selectedCell && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedInfoText}>
            {DAYS[selectedCell.day]} {selectedCell.hour}:00 - {selectedCell.hour + 1}:00
          </Text>
        )}
          <Text style={styles.selectedInfoValue}>
            {selectedCell.value.toLocaleString('vi-VN')} {valueLabel}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  gridContainer: {
    marginBottom: SPACING.sm,
  },

  hourLabelsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cornerCell: {
    width: 28,
    height: 16,
  },
  hourLabelCell: {
    width: 36, // 3 cells * 12px each
    alignItems: 'flex-start',
  },
  hourLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },

  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayLabelCell: {
    width: 28,
    paddingRight: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'right',
  },

  cell: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 1,
    marginBottom: 1,
  },
  cellSelected: {
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  legendScale: {
    flexDirection: 'row',
    gap: 2,
  },
  legendCell: {
    width: 14,
    height: 10,
    borderRadius: 2,
  },

  selectedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },
  selectedInfoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.purple,
  },
});

export default HourlyHeatmap;
