/**
 * TopItemsList Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Ranked list showing top items with progress bars
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
import { ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, GLASS } from '../../../utils/tokens';

const TopItemsList = ({
  title,
  items = [],
  maxItems = 5,
  showRank = true,
  showProgress = true,
  showValue = true,
  valueFormatter = (v) => v?.toLocaleString() || '0',
  onItemPress,
  onViewAll,
  emptyText = 'Không có dữ liệu',
  style,
}) => {
  const displayItems = items.slice(0, maxItems);
  const maxValue = Math.max(...items.map(item => item.value || 0), 1);

  const getRankColor = (rank) => {
    if (rank === 1) return COLORS.gold;
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return COLORS.textMuted;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {onViewAll && items.length > maxItems && (
            <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <ChevronRight size={14} color={COLORS.purple} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* List */}
      {displayItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        displayItems.map((item, index) => {
          const rank = index + 1;
          const progress = (item.value / maxValue) * 100;

          return (
            <TouchableOpacity
              key={item.id || index}
              style={styles.item}
              onPress={() => onItemPress?.(item)}
              disabled={!onItemPress}
              activeOpacity={0.7}
            >
              {/* Rank */}
              {showRank && (
                <View style={[styles.rankContainer, { backgroundColor: `${getRankColor(rank)}20` }]}>
                  <Text style={[styles.rankText, { color: getRankColor(rank) }]}>
                    {rank}
                  </Text>
                </View>
              )}

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.topRow}>
                  <View style={styles.labelContainer}>
                    {item.icon && (
                      <View style={[styles.iconContainer, { backgroundColor: item.iconBg || `${COLORS.purple}20` }]}>
                        {typeof item.icon === 'function' ? (
                          <item.icon size={14} color={item.iconColor || COLORS.purple} />
                        ) : (
                          <Text style={styles.iconText}>{item.icon}</Text>
                        )}
                      </View>
                    )}
                    <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
                  </View>
                  {showValue && (
                    <Text style={styles.value}>{valueFormatter(item.value)}</Text>
                  )}
                </View>

                {/* Progress Bar */}
                {showProgress && (
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${progress}%`,
                          backgroundColor: item.color || COLORS.purple,
                        },
                      ]}
                    />
                  </View>
                )}

                {/* Subtitle */}
                {item.subtitle && (
                  <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
                )}
              </View>

              {/* Arrow */}
              {onItemPress && (
                <ChevronRight size={16} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
          );
        })
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.purple,
    marginRight: 2,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  rankContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
  },

  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconText: {
    fontSize: 12,
  },
  label: {
    fontSize: 13,
    color: COLORS.textPrimary,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },

  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },

  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  emptyState: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});

export default TopItemsList;
