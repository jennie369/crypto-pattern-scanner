/**
 * GEM Mobile - Scan Results Section (Upgraded)
 * Issue #16 & #17: Merge Scan Results + Detected Patterns
 * Uses CoinAccordion for grouped display by coin
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Filter,
  CheckCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { formatConfidence } from '../../../utils/formatters';
import CoinAccordion from '../../../components/Trading/CoinAccordion';

const ScanResultsSection = ({
  results = [],
  isScanning = false,
  onSelectCoin,
  onSelectPattern,
  onPaperTrade,
  selectedCoin,
  selectedPatternId,
  userTier = 'FREE',
}) => {
  const [showOnlyWithPatterns, setShowOnlyWithPatterns] = useState(true);
  // Changed: Only ONE coin can be expanded at a time (string instead of Set)
  const [expandedCoin, setExpandedCoin] = useState(null);
  // Section toggle - collapsed/expanded
  const [sectionCollapsed, setSectionCollapsed] = useState(false);

  // Filter results - only coins with patterns by default
  const filteredResults = useMemo(() => {
    let filtered = results;
    if (showOnlyWithPatterns) {
      filtered = results.filter(r => r.patterns && r.patterns.length > 0);
    }
    // Sort by pattern count (most patterns first)
    return [...filtered].sort((a, b) =>
      (b.patterns?.length || 0) - (a.patterns?.length || 0)
    );
  }, [results, showOnlyWithPatterns]);

  // Group patterns by coin
  const groupedByCoin = useMemo(() => {
    const groups = {};
    filteredResults.forEach(result => {
      if (result.patterns && result.patterns.length > 0) {
        groups[result.symbol] = {
          coin: {
            symbol: result.symbol,
            baseAsset: result.symbol?.replace('USDT', ''),
          },
          patterns: result.patterns.map((p, idx) => ({
            ...p,
            id: `${result.symbol}-${p.name || p.type}-${idx}`,
            symbol: result.symbol,
          })),
        };
      }
    });
    return groups;
  }, [filteredResults]);

  // Stats
  const stats = useMemo(() => {
    const withPatterns = results.filter(r => r.patterns && r.patterns.length > 0).length;
    const totalPatterns = results.reduce((sum, r) => sum + (r.patterns?.length || 0), 0);
    const longPatterns = results.reduce((sum, r) =>
      sum + (r.patterns?.filter(p => p.direction === 'LONG')?.length || 0), 0
    );
    const shortPatterns = totalPatterns - longPatterns;

    return {
      total: results.length,
      withPatterns,
      totalPatterns,
      longPatterns,
      shortPatterns,
    };
  }, [results]);

  // Toggle accordion - ONLY ONE coin open at a time
  // Also selects the coin on chart when expanding
  // Note: Removed LayoutAnimation to prevent Android crashes
  const toggleCoin = useCallback((symbol) => {
    if (expandedCoin === symbol) {
      // Close if already open
      setExpandedCoin(null);
    } else {
      // Open this coin, close others
      setExpandedCoin(symbol);
      // Also select this coin on chart
      onSelectCoin?.(symbol);
    }
  }, [expandedCoin, onSelectCoin]);

  // Expand first coin with patterns
  const expandFirst = () => {
    const firstSymbol = Object.keys(groupedByCoin)[0];
    if (firstSymbol) {
      setExpandedCoin(firstSymbol);
      onSelectCoin?.(firstSymbol);
    }
  };

  // Collapse all
  const collapseAll = () => {
    setExpandedCoin(null);
  };

  // Handle pattern selection
  const handleSelectPattern = useCallback((pattern) => {
    onSelectCoin?.(pattern.symbol);
    onSelectPattern?.(pattern);
  }, [onSelectCoin, onSelectPattern]);

  if (isScanning) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang quét pattern...</Text>
          <Text style={styles.loadingSubtext}>Vui lòng đợi trong giây lát</Text>
        </View>
      </View>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header with stats - Tappable for collapse/expand */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setSectionCollapsed(!sectionCollapsed)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <BarChart2 size={20} color={COLORS.textPrimary} />
          <Text style={styles.headerTitle}>Kết Quả Scan</Text>
          {/* Collapse/Expand indicator */}
          {sectionCollapsed ? (
            <ChevronDown size={18} color={COLORS.textMuted} />
          ) : (
            <ChevronUp size={18} color={COLORS.textMuted} />
          )}
        </View>
        <View style={styles.statsContainer}>
          {/* Show scanned coins / total with patterns */}
          <View style={styles.statBadge}>
            <CheckCircle size={14} color="#22C55E" />
            <Text style={styles.statValue}>{stats.withPatterns}</Text>
            <Text style={styles.statLabel}>coins</Text>
          </View>
          {/* Show total scanned if more than with patterns */}
          {stats.total > stats.withPatterns && (
            <View style={[styles.statBadge, styles.statBadgeMuted]}>
              <Text style={styles.statValueMuted}>/{stats.total}</Text>
              <Text style={styles.statLabelMuted}>đã quét</Text>
            </View>
          )}
          <View style={styles.statBadge}>
            <TrendingUp size={14} color="#22C55E" />
            <Text style={[styles.statValue, styles.greenText]}>{stats.longPatterns}</Text>
          </View>
          <View style={styles.statBadge}>
            <TrendingDown size={14} color="#EF4444" />
            <Text style={[styles.statValue, styles.redText]}>{stats.shortPatterns}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Collapsible Content */}
      {!sectionCollapsed && (
        <>
      {/* Controls Row */}
      <View style={styles.controlsRow}>
        {/* Filter Toggle */}
        <TouchableOpacity
          style={[styles.filterButton, showOnlyWithPatterns && styles.filterButtonActive]}
          onPress={() => setShowOnlyWithPatterns(!showOnlyWithPatterns)}
        >
          <Filter size={14} color={showOnlyWithPatterns ? COLORS.gold : COLORS.textMuted} />
          <Text style={[styles.filterText, showOnlyWithPatterns && styles.filterTextActive]}>
            {showOnlyWithPatterns ? 'Có patterns' : 'Tất cả'}
          </Text>
        </TouchableOpacity>

        {/* Expand First / Collapse All */}
        <View style={styles.expandControls}>
          <TouchableOpacity style={styles.expandBtn} onPress={expandFirst}>
            <ChevronDown size={14} color={COLORS.textMuted} />
            <Text style={styles.expandText}>Mở Đầu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.expandBtn} onPress={collapseAll}>
            <ChevronUp size={14} color={COLORS.textMuted} />
            <Text style={styles.expandText}>Đóng</Text>
          </TouchableOpacity>
        </View>

        {/* Pattern Count */}
        <Text style={styles.patternTotal}>
          {stats.totalPatterns} patterns
        </Text>
      </View>

      {/* Coin Accordions - Inline ScrollView for independent scrolling */}
      <ScrollView
        style={styles.accordionScrollView}
        contentContainerStyle={styles.accordionContainer}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
        overScrollMode="always"
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        {Object.entries(groupedByCoin).map(([symbol, data]) => (
          <CoinAccordion
            key={symbol}
            coin={data.coin}
            patterns={data.patterns}
            isExpanded={expandedCoin === symbol}
            onToggle={() => toggleCoin(symbol)}
            onSelectPattern={handleSelectPattern}
            onPaperTrade={onPaperTrade}
            selectedPatternId={selectedPatternId}
            userTier={userTier}
          />
        ))}

        {Object.keys(groupedByCoin).length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {showOnlyWithPatterns
                ? 'Không tìm thấy pattern nào'
                : 'Chưa có kết quả scan'}
            </Text>
          </View>
        )}
      </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    marginTop: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.25)',
    overflow: 'hidden',
  },

  loadingContainer: {
    paddingVertical: SPACING.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },

  loadingSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.15)',
    backgroundColor: 'rgba(106, 91, 255, 0.08)',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Muted badge for total scanned count
  statBadgeMuted: {
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
  },
  statValueMuted: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  statLabelMuted: {
    fontSize: 9,
    color: COLORS.textMuted,
    opacity: 0.7,
  },

  greenText: {
    color: COLORS.success,
  },

  redText: {
    color: COLORS.error,
  },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  filterButtonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: 'rgba(106, 91, 255, 0.5)',
  },

  filterText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  filterTextActive: {
    color: COLORS.purple,
  },

  expandControls: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },

  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 4,
  },

  expandText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  patternTotal: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },

  accordionScrollView: {
    minHeight: 200,
    maxHeight: 450,
  },

  accordionContainer: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },

  emptyContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default ScanResultsSection;
