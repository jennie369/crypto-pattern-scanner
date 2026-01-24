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
  Layers,
  EyeOff,
  Eye,
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
  // ⚠️ ZONE TOGGLE PROPS
  zoneDisplayMode = 'all', // 'all' | 'selected' | 'hidden'
  onZoneDisplayModeChange,
  onClearZoneSelection,
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
      {/* =====================================================
          COMPACT HEADER - All controls in ONE row
          ===================================================== */}
      <View style={styles.headerCompact}>
        {/* Left: Title + Collapse toggle */}
        <TouchableOpacity
          style={styles.headerTitleSection}
          onPress={() => setSectionCollapsed(!sectionCollapsed)}
          activeOpacity={0.7}
        >
          <BarChart2 size={16} color={COLORS.textPrimary} />
          <Text style={styles.headerTitleCompact}>Scan</Text>
          {sectionCollapsed ? (
            <ChevronDown size={14} color={COLORS.textMuted} />
          ) : (
            <ChevronUp size={14} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>

        {/* Middle: Filter + Expand controls + Pattern count */}
        {!sectionCollapsed && (
          <View style={styles.headerControlsInline}>
            {/* Filter Toggle */}
            <TouchableOpacity
              style={[styles.filterBtnCompact, showOnlyWithPatterns && styles.filterBtnCompactActive]}
              onPress={() => setShowOnlyWithPatterns(!showOnlyWithPatterns)}
            >
              <Filter size={12} color={showOnlyWithPatterns ? COLORS.gold : COLORS.textMuted} />
              <Text style={[styles.filterTextCompact, showOnlyWithPatterns && styles.filterTextCompactActive]}>
                {showOnlyWithPatterns ? 'Có' : 'All'}
              </Text>
            </TouchableOpacity>

            {/* Expand/Collapse */}
            <TouchableOpacity style={styles.expandBtnCompact} onPress={expandFirst}>
              <ChevronDown size={12} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.expandBtnCompact} onPress={collapseAll}>
              <ChevronUp size={12} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Pattern Count */}
            <Text style={styles.patternCountCompact}>{stats.totalPatterns}p</Text>
          </View>
        )}

        {/* Right: Stats badges */}
        <View style={styles.statsCompact}>
          <View style={styles.statBadgeCompact}>
            <CheckCircle size={12} color="#22C55E" />
            <Text style={styles.statValueCompact}>{stats.withPatterns}</Text>
          </View>
          <View style={styles.statBadgeCompact}>
            <TrendingUp size={12} color="#22C55E" />
            <Text style={[styles.statValueCompact, styles.greenText]}>{stats.longPatterns}</Text>
          </View>
          <View style={styles.statBadgeCompact}>
            <TrendingDown size={12} color="#EF4444" />
            <Text style={[styles.statValueCompact, styles.redText]}>{stats.shortPatterns}</Text>
          </View>
        </View>
      </View>

      {/* Collapsible Content - NO zone toggle here (moved to Toolbox) */}
      {!sectionCollapsed && (
        <>
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
    marginTop: SPACING.sm,
    borderRadius: 12,
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

  // =====================================================
  // COMPACT HEADER STYLES - All in ONE row
  // =====================================================
  headerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(106, 91, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.15)',
    minHeight: 36,
  },

  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  headerTitleCompact: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  headerControlsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginLeft: SPACING.sm,
  },

  filterBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  filterBtnCompactActive: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    borderColor: 'rgba(255, 193, 7, 0.4)',
  },

  filterTextCompact: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  filterTextCompactActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  expandBtnCompact: {
    padding: 4,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 4,
  },

  patternCountCompact: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginLeft: 2,
  },

  statsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statBadgeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  statValueCompact: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  greenText: {
    color: COLORS.success,
  },

  redText: {
    color: COLORS.error,
  },

  accordionScrollView: {
    minHeight: 200,
    maxHeight: 500,
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
