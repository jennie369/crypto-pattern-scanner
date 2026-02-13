/**
 * GEM Mobile - Scan Results Section
 * Displays scan results with patterns found
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Filter,
  CheckCircle,
  XCircle,
  ChevronRight,
  BarChart2,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const ScanResultsSection = ({
  results = [],
  isScanning = false,
  onSelectCoin,
  selectedCoin,
}) => {
  const [showOnlyWithPatterns, setShowOnlyWithPatterns] = useState(false);

  // Filter results
  const filteredResults = useMemo(() => {
    if (showOnlyWithPatterns) {
      return results.filter(r => r.patterns && r.patterns.length > 0);
    }
    return results;
  }, [results, showOnlyWithPatterns]);

  // Stats
  const stats = useMemo(() => {
    const withPatterns = results.filter(r => r.patterns && r.patterns.length > 0).length;
    const totalPatterns = results.reduce((sum, r) => sum + (r.patterns?.length || 0), 0);
    return {
      total: results.length,
      withPatterns,
      totalPatterns,
    };
  }, [results]);

  if (isScanning) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Scanning for patterns...</Text>
          <Text style={styles.loadingSubtext}>This may take a moment</Text>
        </View>
      </View>
    );
  }

  if (results.length === 0) {
    return null; // Don't show section if no results yet
  }

  const renderResultItem = ({ item }) => {
    const hasPatterns = item.patterns && item.patterns.length > 0;
    const bestPattern = hasPatterns ? item.patterns[0] : null;
    const isSelected = selectedCoin === item.symbol;

    return (
      <TouchableOpacity
        style={[styles.resultItem, isSelected && styles.resultItemSelected]}
        onPress={() => onSelectCoin?.(item.symbol)}
        activeOpacity={0.7}
      >
        <View style={styles.resultLeft}>
          {/* Status Icon */}
          <View style={[styles.statusIcon, hasPatterns ? styles.statusSuccess : styles.statusNone]}>
            {hasPatterns ? (
              <CheckCircle size={18} color={COLORS.success} />
            ) : (
              <XCircle size={18} color={COLORS.textMuted} />
            )}
          </View>

          {/* Coin Info */}
          <View style={styles.coinInfo}>
            <Text style={styles.coinSymbol}>
              {item.symbol?.replace('USDT', '')}/USDT
            </Text>
            {hasPatterns ? (
              <View style={styles.patternBadge}>
                <Text style={styles.patternCount}>
                  {item.patterns.length} pattern{item.patterns.length > 1 ? 's' : ''}
                </Text>
              </View>
            ) : (
              <Text style={styles.noPattern}>No patterns</Text>
            )}
          </View>
        </View>

        {/* Best Pattern Info */}
        {bestPattern && (
          <View style={styles.resultRight}>
            <View style={[
              styles.directionBadge,
              bestPattern.direction === 'LONG' ? styles.longBadge : styles.shortBadge
            ]}>
              {bestPattern.direction === 'LONG' ? (
                <TrendingUp size={14} color={COLORS.success} />
              ) : (
                <TrendingDown size={14} color={COLORS.error} />
              )}
              <Text style={[
                styles.directionText,
                bestPattern.direction === 'LONG' ? styles.longText : styles.shortText
              ]}>
                {bestPattern.direction}
              </Text>
            </View>
            <Text style={styles.confidenceText}>
              {Math.round(bestPattern.confidence)}%
            </Text>
          </View>
        )}

        <ChevronRight size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with stats */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BarChart2 size={20} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Scan Results</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>
            <Text style={styles.statHighlight}>{stats.withPatterns}</Text>/{stats.total} coins
          </Text>
          <Text style={styles.statText}>
            <Text style={styles.statHighlight}>{stats.totalPatterns}</Text> patterns
          </Text>
        </View>
      </View>

      {/* Filter Toggle */}
      <TouchableOpacity
        style={[styles.filterButton, showOnlyWithPatterns && styles.filterButtonActive]}
        onPress={() => setShowOnlyWithPatterns(!showOnlyWithPatterns)}
      >
        <Filter size={16} color={showOnlyWithPatterns ? COLORS.gold : COLORS.textMuted} />
        <Text style={[styles.filterText, showOnlyWithPatterns && styles.filterTextActive]}>
          {showOnlyWithPatterns ? 'Showing patterns only' : 'Show all coins'}
        </Text>
      </TouchableOpacity>

      {/* Results List */}
      <FlatList
        data={filteredResults}
        renderItem={renderResultItem}
        keyExtractor={(item) => item.symbol}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {showOnlyWithPatterns
                ? 'No patterns found in selected coins'
                : 'No scan results yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    marginTop: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
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
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
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
    gap: SPACING.md,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  statHighlight: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    backgroundColor: GLASS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderColor: COLORS.gold,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: COLORS.gold,
  },
  list: {
    flex: 1,
    maxHeight: 300,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  resultItemSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  resultLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSuccess: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  statusNone: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
  },
  coinInfo: {
    flex: 1,
  },
  coinSymbol: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  patternBadge: {
    marginTop: 2,
  },
  patternCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  noPattern: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  resultRight: {
    alignItems: 'flex-end',
    marginRight: SPACING.sm,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  longBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  shortBadge: {
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
  },
  directionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  longText: {
    color: COLORS.success,
  },
  shortText: {
    color: COLORS.error,
  },
  confidenceText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
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
