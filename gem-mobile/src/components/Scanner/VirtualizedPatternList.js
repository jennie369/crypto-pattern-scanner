/**
 * VirtualizedPatternList - Efficient list for 100+ patterns
 *
 * FEATURES:
 * - Virtualization (only render visible items)
 * - Optimized item layout for O(1) scroll
 * - Pull to refresh
 * - Empty state
 * - Skeleton loading
 * - Haptic feedback on selection
 *
 * USAGE:
 * import VirtualizedPatternList from '../components/Scanner/VirtualizedPatternList';
 *
 * <VirtualizedPatternList
 *   patterns={patterns}
 *   onPatternPress={(pattern) => selectPattern(pattern)}
 *   onRefresh={handleRefresh}
 *   refreshing={isRefreshing}
 *   loading={isLoading}
 * />
 */

import React, { useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Star,
} from 'lucide-react-native';
import { PatternListSkeleton } from './SkeletonLoader';
import { haptic } from '../../services/hapticService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

// Fixed height for getItemLayout optimization
const ITEM_HEIGHT = 110;
const ITEM_MARGIN = 10;
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN;

// =====================================================
// PATTERN CARD ITEM
// =====================================================

const PatternCardItem = React.memo(({
  pattern,
  onPress,
  isSelected,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    haptic.lightTap();
    onPress?.(pattern);
  };

  // Determine direction
  const isBullish = pattern.direction?.toLowerCase().includes('bull') ||
                    pattern.isBullish ||
                    pattern.direction === 'long';

  // Colors based on direction
  const dirColor = isBullish ? COLORS.success : COLORS.error;
  const dirBgColor = isBullish ? 'rgba(14, 203, 129, 0.15)' : 'rgba(246, 70, 93, 0.15)';
  const DirIcon = isBullish ? TrendingUp : TrendingDown;

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    const num = parseFloat(price);
    if (isNaN(num)) return '-';
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    if (num < 100) return num.toFixed(2);
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  // Get confidence grade color
  const getGradeColor = (grade) => {
    if (!grade) return COLORS.textSecondary;
    if (grade.startsWith('A')) return '#00d4aa';
    if (grade.startsWith('B')) return '#4ecdc4';
    if (grade.startsWith('C')) return '#ffc107';
    return COLORS.error;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.patternCard,
          isSelected && styles.patternCardSelected,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.symbolText}>{pattern.symbol || 'UNKNOWN'}</Text>
            <View style={[styles.dirBadge, { backgroundColor: dirBgColor }]}>
              <DirIcon size={12} color={dirColor} />
              <Text style={[styles.dirText, { color: dirColor }]}>
                {isBullish ? 'LONG' : 'SHORT'}
              </Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <Text style={[styles.gradeText, { color: getGradeColor(pattern.grade) }]}>
              {pattern.grade || 'C'}
            </Text>
            <Text style={styles.tfText}>{pattern.timeframe || pattern.tf || '1h'}</Text>
          </View>
        </View>

        {/* Pattern Name */}
        <Text style={styles.patternName} numberOfLines={1}>
          {pattern.pattern_name || pattern.type || pattern.pattern_type || 'Zone'}
        </Text>

        {/* Price Info */}
        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Entry</Text>
            <Text style={styles.priceValue}>{formatPrice(pattern.entry || pattern.entry_price)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: COLORS.error }]}>SL</Text>
            <Text style={[styles.priceValue, { color: COLORS.error }]}>
              {formatPrice(pattern.stopLoss || pattern.stop_loss)}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: COLORS.success }]}>TP</Text>
            <Text style={[styles.priceValue, { color: COLORS.success }]}>
              {formatPrice(pattern.takeProfit || pattern.take_profit || pattern.target)}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>R:R</Text>
            <Text style={styles.rrValue}>
              1:{(pattern.riskRewardRatio || pattern.rrRatio || 0).toFixed(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// =====================================================
// EMPTY COMPONENT
// =====================================================

const EmptyComponent = ({ message, subMessage }) => (
  <View style={styles.emptyContainer}>
    <Target size={48} color={COLORS.textSecondary} style={{ marginBottom: 16 }} />
    <Text style={styles.emptyText}>{message || 'No patterns found'}</Text>
    <Text style={styles.emptySubtext}>
      {subMessage || 'Try scanning with different filters or timeframes'}
    </Text>
  </View>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

const VirtualizedPatternList = ({
  patterns = [],
  onPatternPress,
  onRefresh,
  refreshing = false,
  loading = false,
  selectedPatternId = null,
  ListHeaderComponent,
  ListFooterComponent,
  emptyMessage,
  emptySubMessage,
  contentContainerStyle,
}) => {
  const flatListRef = useRef(null);

  // Memoize key extractor
  const keyExtractor = useCallback((item, index) => {
    return item.id || item.pattern_id || `pattern_${index}_${item.symbol}`;
  }, []);

  // Fixed item layout for O(1) scroll performance
  const getItemLayout = useCallback((data, index) => ({
    length: TOTAL_ITEM_HEIGHT,
    offset: TOTAL_ITEM_HEIGHT * index,
    index,
  }), []);

  // Memoized render item
  const renderItem = useCallback(({ item, index }) => (
    <PatternCardItem
      pattern={item}
      onPress={onPatternPress}
      isSelected={selectedPatternId === (item.id || item.pattern_id)}
    />
  ), [onPatternPress, selectedPatternId]);

  // Empty component
  const ListEmptyComponent = useMemo(() => {
    if (loading) {
      return <PatternListSkeleton count={5} />;
    }
    return (
      <EmptyComponent
        message={emptyMessage}
        subMessage={emptySubMessage}
      />
    );
  }, [loading, emptyMessage, emptySubMessage]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // Scroll to pattern
  const scrollToPattern = useCallback((patternId) => {
    const index = patterns.findIndex(p => (p.id || p.pattern_id) === patternId);
    if (index >= 0) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  }, [patterns]);

  return (
    <FlatList
      ref={flatListRef}
      data={patterns}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}

      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      initialNumToRender={10}

      // Refresh control
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        ) : undefined
      }

      // Layout
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}

      // Maintain scroll position
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}

      // Scroll indicators
      showsVerticalScrollIndicator={false}
    />
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },

  // Pattern card
  patternCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: ITEM_MARGIN,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  patternCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  dirBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  dirText: {
    fontSize: 10,
    fontWeight: '700',
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tfText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },

  // Pattern name
  patternName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.9,
  },

  // Price row
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 2,
  },
  priceValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  rrValue: {
    color: '#00d4aa',
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default React.memo(VirtualizedPatternList);
