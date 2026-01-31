/**
 * FunnelChart Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * User journey funnel visualization
 *
 * Created: January 30, 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { COLORS, SPACING, GLASS } from '../../../utils/tokens';

const FunnelChart = ({
  title,
  data = [],
  showPercentage = true,
  showDropoff = true,
  colors = [
    COLORS.purple,
    '#6A5BFF',
    '#8B7BFF',
    '#AB9BFF',
    '#CBBFFF',
  ],
  style,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.emptyText}>Không có dữ liệu</Text>
      </View>
    );
  }

  const maxValue = data[0]?.value || 1;

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}

      {data.map((item, index) => {
        const percentage = ((item.value / maxValue) * 100).toFixed(1);
        const width = Math.max(30, (item.value / maxValue) * 100);
        const prevValue = index > 0 ? data[index - 1].value : item.value;
        const dropoff = prevValue > 0 ? (((prevValue - item.value) / prevValue) * 100).toFixed(1) : 0;
        const color = colors[index % colors.length];

        return (
          <View key={index} style={styles.stepContainer}>
            {/* Funnel step */}
            <View style={styles.step}>
              <View style={styles.labelRow}>
                <Text style={styles.stepLabel}>{item.label}</Text>
              )}
                <Text style={styles.stepValue}>
                  {item.value?.toLocaleString()}
                  {showPercentage && (
                    <Text style={styles.percentageText}> ({percentage}%)</Text>
                  )}
                </Text>
              </View>

              {/* Bar */}
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${width}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Dropoff indicator */}
            {showDropoff && index < data.length - 1 && (
              <View style={styles.dropoffContainer}>
                <ChevronDown size={14} color={COLORS.textMuted} />
                <Text style={styles.dropoffText}>
                  -{dropoff}% rời bỏ
                </Text>
              )}
              </View>
            )}
          </View>
        );
      })}

      {/* Conversion rate */}
      {data.length >= 2 && (
        <View style={styles.conversionContainer}>
          <Text style={styles.conversionLabel}>Tỷ lệ chuyển đổi tổng:</Text>
        )}
          <Text style={styles.conversionValue}>
            {((data[data.length - 1].value / maxValue) * 100).toFixed(1)}%
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

  stepContainer: {
    marginBottom: SPACING.xs,
  },
  step: {
    paddingVertical: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  stepValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
  },

  barContainer: {
    height: 24,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 6,
    minWidth: 4,
  },

  dropoffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dropoffText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },

  conversionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },
  conversionLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  conversionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.success,
  },
});

export default FunnelChart;
