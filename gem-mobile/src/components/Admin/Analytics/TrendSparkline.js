/**
 * TrendSparkline Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Mini trend line chart for showing data trends
 *
 * Created: January 30, 2026
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../../utils/tokens';

const TrendSparkline = ({
  data = [],
  width = 80,
  height = 30,
  color = COLORS.purple,
  showDots = false,
  showGradient = true,
  strokeWidth = 2,
  style,
}) => {
  if (!data || data.length < 2) {
    return <View style={[{ width, height }, style]} />;
  }

  // Normalize data to fit within height
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Create points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
    return { x, y };
  });

  // Create path
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Create gradient area path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  // Determine trend color
  const isUpward = data[data.length - 1] > data[0];
  const trendColor = color || (isUpward ? COLORS.success : COLORS.error);

  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={trendColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Gradient fill */}
        {showGradient && (
          <Path
            d={areaPath}
            fill="url(#sparklineGradient)"
          />
        )}

        {/* Line */}
        <Path
          d={linePath}
          stroke={trendColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots && points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={2}
            fill={trendColor}
          />
        ))}

        {/* End dot */}
        <Circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill={trendColor}
        />
      </Svg>
    </View>
  );
};

export default TrendSparkline;
