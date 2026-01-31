/**
 * FeatureBarChart Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Horizontal bar chart showing feature usage:
 * - Feature name and icon
 * - Bar with percentage fill
 * - Value and optional trend
 *
 * Created: January 30, 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Heart,
  MessageCircle,
  ShoppingCart,
  BookOpen,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react-native';
import { COLORS, SPACING, GLASS } from '../../../utils/tokens';

// Icon mapping for feature categories
const FEATURE_ICONS = {
  scanner: Search,
  ritual: Heart,
  chatbot: MessageCircle,
  shop: ShoppingCart,
  courses: BookOpen,
  tarot: Star,
  iching: Sparkles,
  forum: MessageCircle,
  vision_board: Zap,
  default: Zap,
};

// Color mapping for feature categories
const FEATURE_COLORS = {
  scanner: '#FFD700',
  ritual: '#FF6B9D',
  chatbot: '#6A5BFF',
  shop: '#4CAF50',
  courses: '#2196F3',
  tarot: '#9C27B0',
  iching: '#E91E63',
  forum: '#00BCD4',
  vision_board: '#FF9800',
  default: '#6A5BFF',
};

const FeatureBar = ({
  name,
  category,
  value,
  maxValue,
  trend,
  trendValue,
  onPress,
}) => {
  const Icon = FEATURE_ICONS[category] || FEATURE_ICONS.default;
  const color = FEATURE_COLORS[category] || FEATURE_COLORS.default;
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const trendColor = trend === 'up' ? COLORS.success : trend === 'down' ? COLORS.error : COLORS.textMuted;

  return (
    <TouchableOpacity
      style={styles.barContainer}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Left: Icon and Name */}
      <View style={styles.barLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon size={14} color={color} />
        </View>
      )}
        <Text style={styles.barName} numberOfLines={1}>{name}</Text>
      )}
      </View>

      {/* Center: Bar */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.max(percentage, 2)}%`, backgroundColor: color },
          ]}
        />
      </View>

      {/* Right: Value and Trend */}
      <View style={styles.barRight}>
        <Text style={styles.barValue}>{value.toLocaleString('vi-VN')}</Text>
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            {trend === 'up' ? (
              <TrendingUp size={10} color={trendColor} />
            ) : trend === 'down' ? (
              <TrendingDown size={10} color={trendColor} />
            ) : null}
            <Text style={[styles.trendValue, { color: trendColor }]}>
              {trendValue}
            </Text>
          )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const FeatureBarChart = ({
  title = 'Sử dụng tính năng',
  data = [], // Array of { name, category, value, trend?, trendValue? }
  onFeaturePress,
  showAll = false,
  maxItems = 10,
  style,
}) => {
  // Sort by value and limit items
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, showAll ? data.length : maxItems);

  const maxValue = sortedData.length > 0 ? sortedData[0].value : 0;

  if (sortedData.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>

      {sortedData.map((item, index) => (
        <FeatureBar
          key={`${item.category}-${item.name}-${index}`}
          name={item.name}
          category={item.category}
          value={item.value}
          maxValue={maxValue}
          trend={item.trend}
          trendValue={item.trendValue}
          onPress={onFeaturePress ? () => onFeaturePress(item) : undefined}
        />
      ))}

      {!showAll && data.length > maxItems && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => onFeaturePress?.({ action: 'showAll' })}
        >
          <Text style={styles.showMoreText}>
            Xem thêm {data.length - maxItems} tính năng
          </Text>
        )}
        </TouchableOpacity>
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

  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  barLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    gap: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },

  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },

  barRight: {
    width: 70,
    alignItems: 'flex-end',
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  trendValue: {
    fontSize: 10,
  },

  emptyContainer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  showMoreButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },
  showMoreText: {
    fontSize: 13,
    color: COLORS.purple,
    fontWeight: '500',
  },
});

export default FeatureBarChart;
