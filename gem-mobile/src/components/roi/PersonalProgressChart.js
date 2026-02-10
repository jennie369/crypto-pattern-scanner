/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PERSONAL PROGRESS CHART
 * ROI Proof System - Phase D
 * Line chart showing monthly progress evolution
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { useSettings } from '../../contexts/SettingsContext';
import { BORDER_RADIUS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 180;
const CHART_PADDING = { top: 20, right: 20, bottom: 40, left: 50 };

/**
 * PersonalProgressChart Component
 *
 * @param {Object} props
 * @param {Array} props.data - Evolution data array from service
 * @param {string} props.metric - Which metric to display: 'winRate', 'pnl', 'discipline'
 * @param {string} props.title - Chart title
 * @param {Object} props.style - Additional container styles
 */
const PersonalProgressChart = ({
  data = [],
  metric = 'winRate',
  title = 'Tiến bộ theo tháng',
  style,
}) => {
  const { colors, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Chart dimensions
  const chartWidth = SCREEN_WIDTH - SPACING.lg * 2;
  const plotWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  // Process data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d[metric] ?? 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Add 10% padding to range
    const paddedMin = minValue - valueRange * 0.1;
    const paddedMax = maxValue + valueRange * 0.1;
    const paddedRange = paddedMax - paddedMin;

    // Calculate points
    const points = data.map((d, i) => {
      const x = CHART_PADDING.left + (i / (data.length - 1 || 1)) * plotWidth;
      const y = CHART_PADDING.top + plotHeight - ((d[metric] - paddedMin) / paddedRange) * plotHeight;
      return { x, y, value: d[metric], label: d.monthLabel };
    });

    // Create SVG path
    let pathD = '';
    points.forEach((point, i) => {
      if (i === 0) {
        pathD += `M ${point.x} ${point.y}`;
      } else {
        pathD += ` L ${point.x} ${point.y}`;
      }
    });

    // Create area fill path
    let areaD = pathD;
    if (points.length > 0) {
      areaD += ` L ${points[points.length - 1].x} ${CHART_PADDING.top + plotHeight}`;
      areaD += ` L ${points[0].x} ${CHART_PADDING.top + plotHeight} Z`;
    }

    return {
      points,
      linePath: pathD,
      areaPath: areaD,
      minValue: paddedMin,
      maxValue: paddedMax,
    };
  }, [data, metric, plotWidth, plotHeight]);

  // Get metric config
  const metricConfig = useMemo(() => {
    switch (metric) {
      case 'winRate':
        return {
          color: '#3AF7A6',
          label: 'Win Rate',
          suffix: '%',
          format: v => `${(v ?? 0).toFixed(1)}%`,
        };
      case 'pnl':
        return {
          color: '#FFB800',
          label: 'P&L',
          prefix: '$',
          format: v => `$${(v ?? 0).toFixed(0)}`,
        };
      case 'discipline':
        return {
          color: '#6A5BFF',
          label: 'Kỷ luật',
          suffix: '',
          format: v => (v ?? 0).toFixed(0),
        };
      default:
        return {
          color: '#3AF7A6',
          label: '',
          format: v => (v ?? 0).toFixed(0),
        };
    }
  }, [metric]);

  // Generate Y-axis labels
  const yLabels = useMemo(() => {
    if (!chartData) return [];
    const range = chartData.maxValue - chartData.minValue;
    const step = range / 4;
    return [0, 1, 2, 3, 4].map(i => ({
      value: chartData.minValue + step * i,
      y: CHART_PADDING.top + plotHeight - (i / 4) * plotHeight,
    }));
  }, [chartData, plotHeight]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.md,
    },
    emptyState: {
      height: CHART_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textMuted,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textDisabled,
      textAlign: 'center',
      marginTop: SPACING.xs,
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SPACING.sm,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: SPACING.xs,
    },
    legendText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Empty state
  if (!chartData || chartData.points.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Chưa có đủ dữ liệu để hiển thị biểu đồ</Text>
          <Text style={styles.emptySubtext}>Tiếp tục hoạt động để xem tiến bộ của bạn</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>

      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <Line
            key={`grid-${i}`}
            x1={CHART_PADDING.left}
            y1={label.y}
            x2={chartWidth - CHART_PADDING.right}
            y2={label.y}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeDasharray="4 4"
          />
        ))}

        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <SvgText
            key={`ylabel-${i}`}
            x={CHART_PADDING.left - 8}
            y={label.y + 4}
            fill={colors.textMuted}
            fontSize={10}
            textAnchor="end"
          >
            {metricConfig.format(label.value)}
          </SvgText>
        ))}

        {/* Area fill */}
        <Path
          d={chartData.areaPath}
          fill={`${metricConfig.color}15`}
        />

        {/* Line */}
        <Path
          d={chartData.linePath}
          fill="none"
          stroke={metricConfig.color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        <G>
          {chartData.points.map((point, i) => (
            <G key={`point-${i}`}>
              {/* Outer glow */}
              <Circle
                cx={point.x}
                cy={point.y}
                r={8}
                fill={`${metricConfig.color}30`}
              />
              {/* Inner point */}
              <Circle
                cx={point.x}
                cy={point.y}
                r={4}
                fill={metricConfig.color}
              />
            </G>
          ))}
        </G>

        {/* X-axis labels */}
        {chartData.points.map((point, i) => (
          <SvgText
            key={`xlabel-${i}`}
            x={point.x}
            y={CHART_HEIGHT - 10}
            fill={colors.textMuted}
            fontSize={10}
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
        ))}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: metricConfig.color }]} />
        <Text style={styles.legendText}>{metricConfig.label}</Text>
      </View>
    </View>
  );
};

export default React.memo(PersonalProgressChart);
