// src/components/Trading/ScanResultsAccordion.js
import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  BarChart3,
  FileText,
  Bell,
  Zap,
} from 'lucide-react-native';
import { formatPercent, formatPrice } from '../../utils/formatters';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ScanResultsAccordion = ({
  patterns = [],
  onSelectCoin,
  onPaperTrade,
  onSetAlert,
  selectedCoin,
}) => {
  const [expandedCoin, setExpandedCoin] = useState(null);

  // Group patterns by coin
  const groupedPatterns = useMemo(() => {
    const groups = {};

    patterns.forEach(pattern => {
      const symbol = pattern?.symbol || 'UNKNOWN';
      if (!groups[symbol]) {
        groups[symbol] = {
          symbol,
          patterns: [],
          direction: pattern?.direction,
        };
      }
      groups[symbol].patterns.push(pattern);
    });

    // Sort by number of patterns (most first)
    return Object.values(groups).sort((a, b) => b.patterns.length - a.patterns.length);
  }, [patterns]);

  // Handle coin tap - expand/collapse + select chart
  const handleCoinPress = useCallback((symbol) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedCoin === symbol) {
      setExpandedCoin(null);
    } else {
      setExpandedCoin(symbol);
      // Load chart for this coin
      onSelectCoin?.(symbol);
    }
  }, [expandedCoin, onSelectCoin]);

  // Handle Paper Trade tap
  const handlePaperTrade = useCallback((pattern) => {
    onPaperTrade?.(pattern);
  }, [onPaperTrade]);

  // Handle Alert tap
  const handleSetAlert = useCallback((pattern) => {
    onSetAlert?.(pattern);
  }, [onSetAlert]);

  if (groupedPatterns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BarChart3 size={48} color="#4A5568" />
        <Text style={styles.emptyTitle}>Chưa có kết quả</Text>
        <Text style={styles.emptyText}>
          Bấm "Scan Now" để tìm patterns
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kết Quả Scan</Text>
        <Text style={styles.headerCount}>
          {patterns.length} patterns • {groupedPatterns.length} coins
        </Text>
      </View>

      {/* Coin Accordions */}
      {groupedPatterns.map((group) => {
        const isExpanded = expandedCoin === group.symbol;
        const isSelected = selectedCoin === group.symbol;

        return (
          <View
            key={group.symbol}
            style={[
              styles.coinGroup,
              isSelected && styles.coinGroupSelected,
            ]}
          >
            {/* Coin Header - Tap to expand */}
            <TouchableOpacity
              style={styles.coinHeader}
              onPress={() => handleCoinPress(group.symbol)}
              activeOpacity={0.7}
            >
              <View style={styles.coinInfo}>
                {/* Direction indicator */}
                {group.direction === 'bullish' ? (
                  <TrendingUp size={18} color="#10B981" />
                ) : (
                  <TrendingDown size={18} color="#EF4444" />
                )}

                <Text style={styles.coinSymbol}>{group.symbol}</Text>

                <View style={styles.patternBadge}>
                  <Text style={styles.patternCount}>
                    {group.patterns.length} pattern{group.patterns.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {isExpanded ? (
                <ChevronUp size={20} color="#FFBD59" />
              ) : (
                <ChevronDown size={20} color="#718096" />
              )}
            </TouchableOpacity>

            {/* Expanded Content - Pattern Cards */}
            {isExpanded && (
              <View style={styles.patternsContainer}>
                {group.patterns.map((pattern, index) => (
                  <PatternCard
                    key={pattern?.id || `${group.symbol}-${index}`}
                    pattern={pattern}
                    onPaperTrade={() => handlePaperTrade(pattern)}
                    onSetAlert={() => handleSetAlert(pattern)}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Bottom spacing */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// Pattern Card Component (Inline - no separate detail page)
const PatternCard = memo(({ pattern, onPaperTrade, onSetAlert }) => {
  // Safe pattern access
  const safePattern = pattern || {};
  const isBullish = safePattern.direction === 'bullish';

  return (
    <View style={styles.patternCard}>
      {/* Pattern Header */}
      <View style={styles.patternHeader}>
        <View style={styles.patternTitleRow}>
          <Text style={styles.patternType}>
            {safePattern.patternType || safePattern.type || 'Pattern'}
          </Text>
          <View style={[
            styles.directionBadge,
            isBullish ? styles.bullishBadge : styles.bearishBadge,
          ]}>
            {isBullish ? (
              <TrendingUp size={12} color="#10B981" />
            ) : (
              <TrendingDown size={12} color="#EF4444" />
            )}
            <Text style={[
              styles.directionText,
              isBullish ? styles.bullishText : styles.bearishText,
            ]}>
              {isBullish ? 'Bullish' : 'Bearish'}
            </Text>
          </View>
        </View>

        {/* Confidence */}
        <View style={styles.confidenceRow}>
          <Zap size={14} color="#FFBD59" />
          <Text style={styles.confidenceText}>
            {formatPercent(safePattern.confidence, 1)} confidence
          </Text>
        </View>
      </View>

      {/* Price Levels */}
      <View style={styles.priceLevels}>
        <View style={styles.priceItem}>
          <Target size={14} color="#FFBD59" />
          <Text style={styles.priceLabel}>Entry</Text>
          <Text style={styles.priceValue}>
            {formatPrice(safePattern.entry)}
          </Text>
        </View>

        <View style={styles.priceItem}>
          <ShieldAlert size={14} color="#EF4444" />
          <Text style={styles.priceLabel}>SL</Text>
          <Text style={[styles.priceValue, styles.slValue]}>
            {formatPrice(safePattern.stopLoss)}
          </Text>
        </View>

        <View style={styles.priceItem}>
          <Target size={14} color="#10B981" />
          <Text style={styles.priceLabel}>TP</Text>
          <Text style={[styles.priceValue, styles.tpValue]}>
            {formatPrice(safePattern.takeProfit1 || safePattern.takeProfit)}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={styles.statValue}>
            {formatPercent(safePattern.winRate, 1)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>R:R</Text>
          <Text style={styles.statValue}>
            {safePattern.riskReward?.toFixed(1) || '0'}:1
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Timeframe</Text>
          <Text style={styles.statValue}>
            {safePattern.timeframe || '4H'}
          </Text>
        </View>
      </View>

      {/* Action Buttons - INLINE */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.paperTradeButton]}
          onPress={onPaperTrade}
        >
          <FileText size={14} color="#0A0F1C" />
          <Text style={styles.actionButtonText}>Paper Trade</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.alertButton]}
          onPress={onSetAlert}
        >
          <Bell size={14} color="#FFBD59" />
          <Text style={styles.alertButtonText}>Đặt Alert</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerCount: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  // Coin Group
  coinGroup: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    overflow: 'hidden',
  },
  coinGroupSelected: {
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  coinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinSymbol: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  patternBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  patternCount: {
    fontSize: 11,
    color: '#FFBD59',
    fontWeight: '600',
  },
  // Patterns Container
  patternsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  // Pattern Card
  patternCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  patternHeader: {
    marginBottom: 10,
  },
  patternTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patternType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  bullishBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  bearishBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  directionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bullishText: {
    color: '#10B981',
  },
  bearishText: {
    color: '#EF4444',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  confidenceText: {
    fontSize: 12,
    color: '#FFBD59',
    fontWeight: '500',
  },
  // Price Levels
  priceLevels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  priceItem: {
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 10,
    color: '#718096',
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  slValue: {
    color: '#EF4444',
  },
  tpValue: {
    color: '#10B981',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#718096',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  paperTradeButton: {
    backgroundColor: '#FFBD59',
  },
  alertButton: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0F1C',
  },
  alertButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFBD59',
  },
});

export default memo(ScanResultsAccordion);
