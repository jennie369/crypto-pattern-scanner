/**
 * Radar Chart Component
 * 6-axis life area radar chart (Solo Leveling inspired)
 *
 * Created: December 9, 2025
 * Updated: December 10, 2025 - Life Balance 2.0 UI
 * Part of Vision Board 2.0 Redesign
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Polygon, Line, Circle, G, Text as SvgText } from 'react-native-svg';
import * as Icons from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, GLASS } from '../../utils/tokens';
import { LinearGradient } from 'expo-linear-gradient';

// Life area configuration
const LIFE_AREAS = [
  { key: 'finance', label: 'Tài chính', icon: 'Wallet', color: COLORS.gold },
  { key: 'career', label: 'Sự nghiệp', icon: 'Briefcase', color: COLORS.purple },
  { key: 'health', label: 'Sức khỏe', icon: 'Heart', color: COLORS.success },
  { key: 'relationships', label: 'Mối quan hệ', icon: 'Users', color: '#FF6B9D' },
  { key: 'personal', label: 'Cá nhân', icon: 'User', color: COLORS.cyan || '#00D9FF' },
  { key: 'spiritual', label: 'Tâm linh', icon: 'Sparkles', color: COLORS.burgundy || '#8B1C3A' },
];

const RadarChart = ({
  data = {}, // { finance: 75, career: 60, health: 80, ... }
  size = 220,
  levels = 5,
  showLabels = true,
  showValues = false,
  fillColor = 'rgba(106, 91, 255, 0.3)',
  strokeColor = COLORS.purple,
  strokeWidth = 2,
  gridColor = 'rgba(255, 255, 255, 0.1)',
  labelColor = COLORS.textMuted,
  style,
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 30; // Leave space for labels
  const angleSlice = (Math.PI * 2) / LIFE_AREAS.length;

  // Calculate point position on radar
  const getPointPosition = (value, index) => {
    const angle = angleSlice * index - Math.PI / 2; // Start from top
    const normalizedValue = Math.min(100, Math.max(0, value)) / 100;
    const x = centerX + radius * normalizedValue * Math.cos(angle);
    const y = centerY + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };

  // Generate grid circles
  const renderGridCircles = () => {
    return Array.from({ length: levels }, (_, i) => {
      const levelRadius = (radius / levels) * (i + 1);
      return (
        <Circle
          key={`grid-${i}`}
          cx={centerX}
          cy={centerY}
          r={levelRadius}
          fill="transparent"
          stroke={gridColor}
          strokeWidth={1}
        />
      );
    });
  };

  // Generate axis lines
  const renderAxisLines = () => {
    return LIFE_AREAS.map((_, index) => {
      const angle = angleSlice * index - Math.PI / 2;
      const endX = centerX + radius * Math.cos(angle);
      const endY = centerY + radius * Math.sin(angle);

      return (
        <Line
          key={`axis-${index}`}
          x1={centerX}
          y1={centerY}
          x2={endX}
          y2={endY}
          stroke={gridColor}
          strokeWidth={1}
        />
      );
    });
  };

  // Generate data polygon
  const renderDataPolygon = () => {
    const points = LIFE_AREAS.map((area, index) => {
      const value = data[area.key] || 0;
      const pos = getPointPosition(value, index);
      return `${pos.x},${pos.y}`;
    }).join(' ');

    return (
      <Polygon
        points={points}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    );
  };

  // Render data points
  const renderDataPoints = () => {
    return LIFE_AREAS.map((area, index) => {
      const value = data[area.key] || 0;
      const pos = getPointPosition(value, index);

      return (
        <Circle
          key={`point-${index}`}
          cx={pos.x}
          cy={pos.y}
          r={4}
          fill={area.color}
          stroke={COLORS.bgDarkest}
          strokeWidth={2}
        />
      );
    });
  };

  // Render labels
  const renderLabels = () => {
    return LIFE_AREAS.map((area, index) => {
      const angle = angleSlice * index - Math.PI / 2;
      const labelRadius = radius + 20;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      // Adjust text anchor based on position
      let textAnchor = 'middle';
      if (x < centerX - 10) textAnchor = 'end';
      if (x > centerX + 10) textAnchor = 'start';

      const value = data[area.key] || 0;

      return (
        <G key={`label-${index}`}>
          <SvgText
            x={x}
            y={y}
            fill={labelColor}
            fontSize={TYPOGRAPHY.fontSize.sm}
            fontWeight={TYPOGRAPHY.fontWeight.medium}
            textAnchor={textAnchor}
            alignmentBaseline="middle"
          >
            {area.label}
          </SvgText>
          {showValues && (
            <SvgText
              x={x}
              y={y + 12}
              fill={area.color}
              fontSize={TYPOGRAPHY.fontSize.xs}
              fontWeight={TYPOGRAPHY.fontWeight.bold}
              textAnchor={textAnchor}
              alignmentBaseline="middle"
            >
              {value}%
            </SvgText>
          )}
        </G>
      );
    });
  };

  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size}>
        <G>
          {renderGridCircles()}
          {renderAxisLines()}
          {renderDataPolygon()}
          {renderDataPoints()}
          {showLabels && renderLabels()}
        </G>
      </Svg>
    </View>
  );
};

// Life Area Legend component
export const RadarChartLegend = ({ data = {} }) => {
  return (
    <View style={styles.legendContainer}>
      {LIFE_AREAS.map(area => (
        <View key={area.key} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: area.color }]} />
          <Text style={styles.legendLabel}>{area.label}</Text>
          <Text style={[styles.legendValue, { color: area.color }]}>
            {data[area.key] || 0}%
          </Text>
        </View>
      ))}
    </View>
  );
};

// Compact version for dashboard
export const RadarChartCompact = ({ data = {}, size = 160 }) => {
  const avgScore = Object.values(data).length > 0
    ? Math.round(Object.values(data).reduce((a, b) => a + b, 0) / Object.values(data).length)
    : 0;

  return (
    <View style={styles.compactContainer}>
      <RadarChart
        data={data}
        size={size}
        showLabels={false}
        showValues={false}
      />
      <View style={styles.compactOverlay}>
        <Text style={styles.compactScore}>{avgScore}</Text>
        <Text style={styles.compactLabel}>Cân bằng</Text>
      </View>
    </View>
  );
};

// Full Life Balance Card component (Solo Leveling inspired)
export const LifeBalanceCard = ({
  data = {},
  onAreaPress,
  onViewDetails,
  style,
}) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const values = LIFE_AREAS.map(area => data[area.key] || 0);
    const avgScore = values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;

    // Find lowest area for recommendation
    let lowestArea = null;
    let lowestScore = 100;
    LIFE_AREAS.forEach(area => {
      const score = data[area.key] || 0;
      if (score < lowestScore) {
        lowestScore = score;
        lowestArea = area;
      }
    });

    return { avgScore, lowestArea, lowestScore };
  }, [data]);

  // Get icon component
  const getIcon = (iconName) => {
    const iconMap = {
      Wallet: Icons.Wallet,
      Briefcase: Icons.Briefcase,
      Heart: Icons.Heart,
      Users: Icons.Users,
      User: Icons.User,
      Sparkles: Icons.Sparkles,
    };
    return iconMap[iconName] || Icons.Target;
  };

  return (
    <View style={[styles.lifeBalanceCard, style]}>
      {/* Header */}
      <View style={styles.lifeBalanceHeader}>
        <View style={styles.lifeBalanceTitleRow}>
          <Icons.Radar size={20} color={COLORS.purple} />
          <Text style={styles.lifeBalanceTitle}>CÂN BẰNG CUỘC SỐNG</Text>
        </View>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails} style={styles.lifeBalanceViewBtn}>
            <Text style={styles.lifeBalanceViewBtnText}>Chi tiết</Text>
            <Icons.ChevronRight size={16} color={COLORS.purple} />
          </TouchableOpacity>
        )}
      </View>

      {/* Radar Chart */}
      <View style={styles.lifeBalanceChartContainer}>
        <RadarChart
          data={data}
          size={220}
          showLabels={true}
          showValues={true}
          fillColor="rgba(106, 91, 255, 0.25)"
          strokeColor={COLORS.purple}
          strokeWidth={2}
        />
      </View>

      {/* Stats Footer */}
      <View style={styles.lifeBalanceFooter}>
        <View style={styles.lifeBalanceStatItem}>
          <Text style={styles.lifeBalanceStatLabel}>Điểm cân bằng</Text>
          <View style={styles.lifeBalanceStatValue}>
            <Text style={[
              styles.lifeBalanceStatNumber,
              { color: stats.avgScore >= 70 ? COLORS.success : stats.avgScore >= 40 ? COLORS.gold : COLORS.error }
            ]}>
              {stats.avgScore}%
            </Text>
          </View>
        </View>

        {stats.lowestArea && stats.lowestScore < 70 && (
          <View style={styles.lifeBalanceRecommendation}>
            <Icons.TrendingUp size={14} color={stats.lowestArea.color} />
            <Text style={styles.lifeBalanceRecommendationText}>
              Khuyến nghị: Tập trung{' '}
              <Text style={{ color: stats.lowestArea.color, fontWeight: 'bold' }}>
                {stats.lowestArea.label}
              </Text>
            </Text>
          </View>
        )}
      </View>

      {/* Life Area Quick Stats */}
      <View style={styles.lifeAreaQuickStats}>
        {LIFE_AREAS.map(area => {
          const score = data[area.key] || 0;
          const IconComponent = getIcon(area.icon);

          return (
            <TouchableOpacity
              key={area.key}
              style={styles.lifeAreaQuickItem}
              onPress={() => onAreaPress?.(area.key)}
            >
              <View style={[styles.lifeAreaQuickIcon, { backgroundColor: `${area.color}20` }]}>
                <IconComponent size={14} color={area.color} />
              </View>
              <Text style={styles.lifeAreaQuickLabel}>{area.label}</Text>
              <Text style={[styles.lifeAreaQuickValue, { color: area.color }]}>
                {score}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Export LIFE_AREAS for external use
export { LIFE_AREAS };

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  legendLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginRight: SPACING.xs,
  },
  legendValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  compactContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  compactScore: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  compactLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },

  // Life Balance Card styles
  lifeBalanceCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  lifeBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  lifeBalanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lifeBalanceTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  lifeBalanceViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  lifeBalanceViewBtnText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  lifeBalanceChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  lifeBalanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  lifeBalanceStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lifeBalanceStatLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  lifeBalanceStatValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lifeBalanceStatNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  lifeBalanceRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
  },
  lifeBalanceRecommendationText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  lifeAreaQuickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  lifeAreaQuickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    minWidth: '48%',
    gap: SPACING.xs,
  },
  lifeAreaQuickIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifeAreaQuickLabel: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  lifeAreaQuickValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default RadarChart;
