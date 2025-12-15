/**
 * Weekly Progress Chart Component
 * 7-day bar chart for progress tracking (Solo Leveling inspired)
 *
 * Created: December 9, 2025
 * Updated: December 10, 2025 - Weekly Progress 2.0 UI
 * Part of Vision Board 2.0 Redesign
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Icons from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, GLASS } from '../../utils/tokens';

// Vietnamese day names
const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const WeeklyProgressChart = ({
  data = [], // Array of { day_date, day_name, total_score, xp_earned, ... }
  width = 320,
  height = 160,
  barColor = COLORS.purple,
  useGradient = true,
  gradientColors = [COLORS.purple, COLORS.cyan],
  showXP = false,
  showLabels = true,
  onBarPress = null,
  style,
}) => {
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Ensure we have 7 days of data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const existingData = data[i] || {};
    return {
      dayIndex: i,
      dayName: existingData.day_name || DAY_NAMES[(new Date().getDay() - 6 + i + 7) % 7],
      score: existingData.total_score || 0,
      xp: existingData.xp_earned || 0,
      isToday: i === 6, // Last day is today
    };
  });

  // Calculate max value for scaling
  const maxScore = Math.max(...weekData.map(d => d.score), 100);
  const barWidth = (chartWidth - (7 - 1) * 8) / 7; // 8px gap between bars

  // Get bar height
  const getBarHeight = (score) => {
    return (score / maxScore) * chartHeight;
  };

  // Render horizontal grid lines
  const renderGridLines = () => {
    const lines = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = paddingTop + (chartHeight / steps) * i;
      const value = Math.round(maxScore - (maxScore / steps) * i);
      lines.push(
        <React.Fragment key={`grid-${i}`}>
          <Line
            x1={paddingLeft}
            y1={y}
            x2={width - paddingRight}
            y2={y}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <Text
            style={[
              styles.gridLabel,
              { position: 'absolute', left: 0, top: y - 6 },
            ]}
          >
            {value}
          </Text>
        </React.Fragment>
      );
    }
    return lines;
  };

  const gradientId = 'weeklyBarGradient';

  return (
    <View style={[styles.container, { width, height }, style]}>
      {/* Y-axis labels */}
      <View style={styles.yAxisLabels}>
        {[100, 75, 50, 25, 0].map((value, i) => (
          <Text key={`y-${i}`} style={styles.yAxisLabel}>
            {value}
          </Text>
        ))}
      </View>

      <Svg width={width} height={height}>
        <Defs>
          {useGradient && (
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          )}
        </Defs>

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => {
          const y = paddingTop + (chartHeight / 4) * i;
          return (
            <Line
              key={`grid-${i}`}
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Bars */}
        {weekData.map((day, index) => {
          const barHeight = getBarHeight(day.score);
          const x = paddingLeft + index * (barWidth + 8);
          const y = paddingTop + chartHeight - barHeight;

          return (
            <Rect
              key={`bar-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 4)} // Minimum height for visibility
              fill={useGradient ? `url(#${gradientId})` : barColor}
              rx={4}
              ry={4}
              opacity={day.isToday ? 1 : 0.7}
            />
          );
        })}
      </Svg>

      {/* X-axis labels (day names) */}
      {showLabels && (
        <View style={[styles.xAxisLabels, { paddingLeft }]}>
          {weekData.map((day, index) => (
            <View
              key={`label-${index}`}
              style={[styles.xAxisLabelContainer, { width: barWidth + 8 }]}
            >
              <Text
                style={[
                  styles.xAxisLabel,
                  day.isToday && styles.xAxisLabelToday,
                ]}
              >
                {day.dayName}
              </Text>
              {showXP && day.xp > 0 && (
                <Text style={styles.xpLabel}>+{day.xp}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Summary stats row
export const WeeklyProgressSummary = ({ data = [] }) => {
  const totalXP = data.reduce((sum, d) => sum + (d.xp_earned || 0), 0);
  const avgScore = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + (d.total_score || 0), 0) / data.length)
    : 0;
  const perfectDays = data.filter(
    d => d.actions_completed > 0 && d.affirmations_completed > 0 && d.habits_completed > 0
  ).length;

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{avgScore}</Text>
        <Text style={styles.summaryLabel}>Điểm TB</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{totalXP}</Text>
        <Text style={styles.summaryLabel}>XP tuần</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{perfectDays}</Text>
        <Text style={styles.summaryLabel}>Ngày hoàn hảo</Text>
      </View>
    </View>
  );
};

// Compact version
export const WeeklyProgressCompact = ({ data = [], width = 200 }) => {
  const chartWidth = width;
  const chartHeight = 40;
  const barWidth = (chartWidth - 6 * 4) / 7;

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const existingData = data[i] || {};
    return {
      score: existingData.total_score || 0,
    };
  });

  const maxScore = Math.max(...weekData.map(d => d.score), 100);

  return (
    <View style={[styles.compactContainer, { width }]}>
      <Svg width={chartWidth} height={chartHeight}>
        {weekData.map((day, index) => {
          const barHeight = (day.score / maxScore) * (chartHeight - 4);
          const x = index * (barWidth + 4);
          const y = chartHeight - barHeight;

          return (
            <Rect
              key={`bar-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              fill={day.score > 60 ? COLORS.success : day.score > 30 ? COLORS.gold : COLORS.purple}
              rx={2}
              ry={2}
              opacity={index === 6 ? 1 : 0.6}
            />
          );
        })}
      </Svg>
    </View>
  );
};

// Full Weekly Progress Card component
export const WeeklyProgressCard = ({
  data = [],
  previousWeekAvg = 0,
  onViewDetails,
  style,
}) => {
  // Calculate stats
  const stats = useMemo(() => {
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const existingData = data[i] || {};
      return {
        dayIndex: i,
        dayName: existingData.day_name || DAY_NAMES[(new Date().getDay() - 6 + i + 7) % 7],
        score: existingData.total_score || 0,
        tasksCompleted: existingData.actions_completed || 0,
        tasksTotal: existingData.actions_total || 0,
        isToday: i === 6,
      };
    });

    const scores = weekData.map(d => d.score).filter(s => s > 0);
    const average = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Find best day
    let bestDay = weekData[0];
    weekData.forEach(day => {
      if (day.score > bestDay.score) {
        bestDay = day;
      }
    });

    // Calculate trend
    const trend = previousWeekAvg > 0 ? average - previousWeekAvg : 0;

    return { weekData, average, bestDay, trend };
  }, [data, previousWeekAvg]);

  return (
    <View style={[styles.weeklyCard, style]}>
      {/* Header */}
      <View style={styles.weeklyCardHeader}>
        <View style={styles.weeklyCardTitleRow}>
          <Icons.BarChart3 size={20} color={COLORS.purple} />
          <Text style={styles.weeklyCardTitle}>TIẾN ĐỘ 7 NGÀY QUA</Text>
        </View>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails} style={styles.weeklyCardViewBtn}>
            <Text style={styles.weeklyCardViewBtnText}>Chi tiết</Text>
            <Icons.ChevronRight size={16} color={COLORS.purple} />
          </TouchableOpacity>
        )}
      </View>

      {/* Chart */}
      <View style={styles.weeklyCardChartContainer}>
        <WeeklyProgressChart
          data={data}
          width={300}
          height={160}
          useGradient={true}
          gradientColors={[COLORS.purple, COLORS.gold]}
          showLabels={true}
          showXP={false}
        />

        {/* Percentage labels under bars */}
        <View style={styles.weeklyCardPercentages}>
          {stats.weekData.map((day, index) => (
            <Text
              key={`perc-${index}`}
              style={[
                styles.weeklyCardPercentText,
                day.score >= 70 && { color: COLORS.success },
                day.score < 40 && { color: COLORS.error },
              ]}
            >
              {day.score}%
            </Text>
          ))}
        </View>
      </View>

      {/* Stats Footer */}
      <View style={styles.weeklyCardFooter}>
        <View style={styles.weeklyCardStatItem}>
          <Text style={styles.weeklyCardStatLabel}>Trung bình</Text>
          <Text style={[
            styles.weeklyCardStatValue,
            { color: stats.average >= 70 ? COLORS.success : stats.average >= 40 ? COLORS.gold : COLORS.error }
          ]}>
            {stats.average}%
          </Text>
        </View>

        <View style={styles.weeklyCardStatDivider} />

        <View style={styles.weeklyCardStatItem}>
          <Text style={styles.weeklyCardStatLabel}>Tốt nhất</Text>
          <Text style={styles.weeklyCardStatValue}>
            {stats.bestDay.dayName} ({stats.bestDay.score}%)
          </Text>
        </View>

        <View style={styles.weeklyCardStatDivider} />

        <View style={styles.weeklyCardStatItem}>
          <Text style={styles.weeklyCardStatLabel}>vs tuần trước</Text>
          <View style={styles.weeklyCardTrendRow}>
            {stats.trend >= 0 ? (
              <Icons.TrendingUp size={14} color={COLORS.success} />
            ) : (
              <Icons.TrendingDown size={14} color={COLORS.error} />
            )}
            <Text style={[
              styles.weeklyCardStatValue,
              { color: stats.trend >= 0 ? COLORS.success : COLORS.error }
            ]}>
              {stats.trend >= 0 ? '+' : ''}{stats.trend}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 16,
    height: 100,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  yAxisLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    width: 24,
    textAlign: 'right',
  },
  xAxisLabels: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  xAxisLabelContainer: {
    alignItems: 'center',
  },
  xAxisLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  xAxisLabelToday: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  xpLabel: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: 2,
  },
  gridLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
  },
  summaryItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xxs,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactContainer: {
    paddingVertical: SPACING.xs,
  },

  // Weekly Progress Card styles
  weeklyCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  weeklyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  weeklyCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  weeklyCardTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  weeklyCardViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  weeklyCardViewBtnText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  weeklyCardChartContainer: {
    alignItems: 'center',
  },
  weeklyCardPercentages: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 300,
    paddingLeft: 30,
    marginTop: -35,
    marginBottom: SPACING.sm,
  },
  weeklyCardPercentText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    width: 38,
    textAlign: 'center',
  },
  weeklyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  weeklyCardStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyCardStatLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginBottom: SPACING.xxs,
  },
  weeklyCardStatValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  weeklyCardStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  weeklyCardTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
});

export default WeeklyProgressChart;
