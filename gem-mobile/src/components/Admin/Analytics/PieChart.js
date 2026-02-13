/**
 * PieChart Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Distribution pie/donut chart
 *
 * Created: January 30, 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { COLORS, SPACING, GLASS } from '../../../utils/tokens';

const DEFAULT_COLORS = [
  COLORS.purple,
  COLORS.cyan,
  COLORS.gold,
  COLORS.success,
  COLORS.error,
  '#FF6B9D',
  '#00BCD4',
  '#9C27B0',
];

const PieChart = ({
  title,
  data = [],
  size = 140,
  innerRadius = 0.6, // 0 for pie, >0 for donut
  showLegend = true,
  showLabels = false,
  showTotal = true,
  totalLabel = 'Tổng',
  colors = DEFAULT_COLORS,
  style,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.emptyText}>Không có dữ liệu</Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const radius = size / 2;
  const innerR = radius * innerRadius;
  const center = radius;

  // Calculate segments
  let currentAngle = -90; // Start from top
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      color: item.color || colors[index % colors.length],
    };
  });

  // Create arc path
  const createArc = (startAngle, endAngle, outerR, innerR) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + outerR * Math.cos(startRad);
    const y1 = center + outerR * Math.sin(startRad);
    const x2 = center + outerR * Math.cos(endRad);
    const y2 = center + outerR * Math.sin(endRad);
    const x3 = center + innerR * Math.cos(endRad);
    const y3 = center + innerR * Math.sin(endRad);
    const x4 = center + innerR * Math.cos(startRad);
    const y4 = center + innerR * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    if (innerR === 0) {
      return `M ${center} ${center} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.chartContainer}>
        {/* Chart */}
        <View style={styles.chartWrapper}>
          <Svg width={size} height={size}>
            <G>
              {segments.map((segment, index) => {
                // Handle full circle (single item with 100%)
                if (segment.percentage >= 99.9) {
                  return (
                    <G key={index}>
                      <Circle
                        cx={center}
                        cy={center}
                        r={radius - 2}
                        fill={segment.color}
                      />
                      {innerR > 0 && (
                        <Circle
                          cx={center}
                          cy={center}
                          r={innerR}
                          fill="#1A1B3D"
                        />
                      )}
                    </G>
                  );
                }

                // Skip tiny segments
                if (segment.percentage < 0.5) return null;

                return (
                  <Path
                    key={index}
                    d={createArc(segment.startAngle, segment.endAngle, radius - 2, innerR)}
                    fill={segment.color}
                    stroke="#1A1B3D"
                    strokeWidth={1}
                  />
                );
              })}
            </G>
          </Svg>

          {/* Center label for donut */}
          {innerRadius > 0 && showTotal && (
            <View style={[styles.centerLabel, { width: innerR * 1.4, height: innerR * 1.4 }]}>
              <Text style={styles.totalValue}>{total.toLocaleString()}</Text>
            )}
              <Text style={styles.totalLabel}>{totalLabel}</Text>
            </View>
          )}
        </View>

        {/* Legend */}
        {showLegend && (
          <View style={styles.legend}>
            {segments.map((segment, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                <View style={styles.legendContent}>
                  <Text style={styles.legendLabel} numberOfLines={1}>
                    {segment.label}
                  </Text>
                )}
                  <Text style={styles.legendValue}>
                    {segment.value.toLocaleString()}
                    <Text style={styles.legendPercent}> ({segment.percentage.toFixed(1)}%)</Text>
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },

  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  legend: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  legendPercent: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
});

export default PieChart;
