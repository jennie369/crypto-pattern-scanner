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
import { useSettings } from '../../contexts/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';

// Life area configuration - 6 linh vuc cuoc song theo kich ban demo
// Note: colors will be set dynamically in the component
const LIFE_AREAS_BASE = [
  { key: 'finance', label: 'Tai chinh', icon: 'Wallet', colorKey: 'gold' },
  { key: 'career', label: 'Su nghiep', icon: 'Briefcase', colorKey: 'purple' },
  { key: 'health', label: 'Suc khoe', icon: 'Heart', colorKey: 'success' },
  { key: 'relationships', label: 'Tinh yeu', icon: 'Heart', colorKey: null, staticColor: '#FF6B9D' },
  { key: 'personal', label: 'Ca nhan', icon: 'User', colorKey: 'cyan' },
  { key: 'spiritual', label: 'Tam thuc', icon: 'Sparkles', colorKey: 'burgundy' },
];

const RadarChart = ({
  data = {}, // { finance: 75, career: 60, health: 80, ... }
  size = 220,
  levels = 5,
  showLabels = true,
  showValues = false,
  fillColor = 'rgba(106, 91, 255, 0.3)',
  strokeColor,
  strokeWidth = 2,
  gridColor = 'rgba(255, 255, 255, 0.1)',
  labelColor,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Build LIFE_AREAS with theme colors
  const LIFE_AREAS = useMemo(() => {
    return LIFE_AREAS_BASE.map(area => ({
      ...area,
      color: area.staticColor || colors[area.colorKey] || colors.purple,
    }));
  }, [colors]);

  const effectiveStrokeColor = strokeColor || colors.purple;
  const effectiveLabelColor = labelColor || colors.textMuted;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Add padding for labels - labels need extra space outside the chart
  const labelPadding = showLabels ? 55 : 0;
  const svgSize = size + labelPadding * 2;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const radius = (size / 2) - 10; // Chart radius
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
        stroke={effectiveStrokeColor}
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
          stroke={colors.bgDarkest}
          strokeWidth={2}
        />
      );
    });
  };

  // Render labels
  const renderLabels = () => {
    return LIFE_AREAS.map((area, index) => {
      const angle = angleSlice * index - Math.PI / 2;
      const labelRadius = radius + 25; // Distance from chart edge to label
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
            fill={effectiveLabelColor}
            fontSize={12}
            fontWeight="500"
            textAnchor={textAnchor}
            alignmentBaseline="middle"
          >
            {area.label}
          </SvgText>
          {showValues && (
            <SvgText
              x={x}
              y={y + 14}
              fill={area.color}
              fontSize={11}
              fontWeight="700"
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
      <Svg width={svgSize} height={svgSize}>
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
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Build LIFE_AREAS with theme colors
  const LIFE_AREAS = useMemo(() => {
    return LIFE_AREAS_BASE.map(area => ({
      ...area,
      color: area.staticColor || colors[area.colorKey] || colors.purple,
    }));
  }, [colors]);

  const styles = useMemo(() => StyleSheet.create({
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
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: SPACING.sm,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: SPACING.xs,
    },
    legendLabel: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.xs,
      marginRight: SPACING.xs,
    },
    legendValue: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
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
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.display,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    compactLabel: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.xs,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
        <Text style={styles.compactLabel}>Can bang</Text>
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
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Build LIFE_AREAS with theme colors
  const LIFE_AREAS = useMemo(() => {
    return LIFE_AREAS_BASE.map(area => ({
      ...area,
      color: area.staticColor || colors[area.colorKey] || colors.purple,
    }));
  }, [colors]);

  const styles = useMemo(() => StyleSheet.create({
    lifeBalanceCard: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: glass.borderRadius,
      padding: SPACING.lg,
      borderWidth: glass.borderWidth,
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
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    lifeBalanceViewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xxs,
    },
    lifeBalanceViewBtnText: {
      color: colors.purple,
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
      color: colors.textMuted,
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
      color: colors.textMuted,
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
      paddingVertical: SPACING.sm,
      borderRadius: SPACING.sm,
      minWidth: '48%',
      gap: SPACING.xs,
    },
    lifeAreaQuickIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lifeAreaQuickLabel: {
      flex: 1,
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    lifeAreaQuickValue: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
  }, [data, LIFE_AREAS]);

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
          <Icons.Radar size={20} color={colors.purple} />
          <Text style={styles.lifeBalanceTitle}>CAN BANG CUOC SONG</Text>
        </View>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails} style={styles.lifeBalanceViewBtn}>
            <Text style={styles.lifeBalanceViewBtnText}>Chi tiet</Text>
            <Icons.ChevronRight size={16} color={colors.purple} />
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
          strokeColor={colors.purple}
          strokeWidth={2}
        />
      </View>

      {/* Stats Footer */}
      <View style={styles.lifeBalanceFooter}>
        <View style={styles.lifeBalanceStatItem}>
          <Text style={styles.lifeBalanceStatLabel}>Diem can bang</Text>
          <View style={styles.lifeBalanceStatValue}>
            <Text style={[
              styles.lifeBalanceStatNumber,
              { color: stats.avgScore >= 70 ? colors.success : stats.avgScore >= 40 ? colors.gold : colors.error }
            ]}>
              {stats.avgScore}%
            </Text>
          </View>
        </View>

        {stats.lowestArea && stats.lowestScore < 70 && (
          <View style={styles.lifeBalanceRecommendation}>
            <Icons.TrendingUp size={14} color={stats.lowestArea.color} />
            <Text style={styles.lifeBalanceRecommendationText}>
              Khuyen nghi: Tap trung{' '}
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
                <IconComponent size={16} color={area.color} />
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

// Export LIFE_AREAS for external use - note: these won't have dynamic colors
// For dynamic colors, use the hook inside your component
export { LIFE_AREAS_BASE as LIFE_AREAS };

export default RadarChart;
