/**
 * GEM Mobile - Multi Zone Overlay Component
 * Displays list of zones with filtering and sorting options
 *
 * Props:
 * - zones: Array of zone objects
 * - userTier: User's tier level
 * - onZonePress: Callback when zone is pressed
 * - showLabels: Whether to show zone labels
 * - sortBy: Sort criteria ('strength', 'created', 'type')
 * - loading: Whether zones are being loaded
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Filter,
  SortDesc,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

import ZoneRectangle from './ZoneRectangle';
import ZoneFeatureGuard from './ZoneFeatureGuard';
import { ZONE_TYPE, ZONE_STATUS } from '../../services/zoneManager';
import tierAccessService from '../../services/tierAccessService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme/darkTheme';

const SORT_OPTIONS = {
  STRENGTH: 'strength',
  CREATED: 'created',
  TYPE: 'type',
  GRADE: 'grade',
};

const MultiZoneOverlay = ({
  zones = [],
  userTier = 'FREE',
  onZonePress,
  showLabels = true,
  sortBy = SORT_OPTIONS.STRENGTH,
  loading = false,
  onRefresh,
  compact = false,
  maxHeight,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [showHFZ, setShowHFZ] = useState(true);
  const [showLFZ, setShowLFZ] = useState(true);
  const [currentSort, setCurrentSort] = useState(sortBy);
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter and sort zones
  const filteredZones = useMemo(() => {
    let result = [...zones];

    // Filter by zone type
    result = result.filter(zone => {
      if (zone.zone_type === ZONE_TYPE.HFZ && !showHFZ) return false;
      if (zone.zone_type === ZONE_TYPE.LFZ && !showLFZ) return false;
      return true;
    });

    // Sort zones
    result.sort((a, b) => {
      switch (currentSort) {
        case SORT_OPTIONS.STRENGTH:
          return (b.strength || 0) - (a.strength || 0);
        case SORT_OPTIONS.CREATED:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case SORT_OPTIONS.TYPE:
          return a.zone_type.localeCompare(b.zone_type);
        case SORT_OPTIONS.GRADE:
          const gradeOrder = { 'A+': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
          return (gradeOrder[a.pattern_grade] || 5) - (gradeOrder[b.pattern_grade] || 5);
        default:
          return 0;
      }
    });

    // Apply tier limit
    return tierAccessService.filterZonesByTier(result);
  }, [zones, showHFZ, showLFZ, currentSort]);

  // Stats
  const stats = useMemo(() => {
    const hfzCount = zones.filter(z => z.zone_type === ZONE_TYPE.HFZ).length;
    const lfzCount = zones.filter(z => z.zone_type === ZONE_TYPE.LFZ).length;
    const freshCount = zones.filter(z => z.status === ZONE_STATUS.FRESH).length;

    return { hfzCount, lfzCount, freshCount, total: zones.length };
  }, [zones]);

  const handleZonePress = (zone) => {
    setSelectedZoneId(zone.id);
    onZonePress?.(zone);
  };

  const toggleSort = () => {
    const sortOptions = Object.values(SORT_OPTIONS);
    const currentIndex = sortOptions.indexOf(currentSort);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setCurrentSort(sortOptions[nextIndex]);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title with collapse toggle */}
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.title}>
          Zones ({filteredZones.length})
        </Text>
        {isExpanded ? (
          <ChevronUp size={18} color={COLORS.textSecondary} />
        ) : (
          <ChevronDown size={18} color={COLORS.textSecondary} />
        )}
      </TouchableOpacity>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Filter toggles */}
        <TouchableOpacity
          style={[styles.filterButton, showHFZ && styles.filterActive]}
          onPress={() => setShowHFZ(!showHFZ)}
        >
          <TrendingDown size={14} color={showHFZ ? '#FF6B6B' : COLORS.textSecondary} />
          <Text style={[styles.filterText, showHFZ && { color: '#FF6B6B' }]}>
            {stats.hfzCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, showLFZ && styles.filterActive]}
          onPress={() => setShowLFZ(!showLFZ)}
        >
          <TrendingUp size={14} color={showLFZ ? '#4ECDC4' : COLORS.textSecondary} />
          <Text style={[styles.filterText, showLFZ && { color: '#4ECDC4' }]}>
            {stats.lfzCount}
          </Text>
        </TouchableOpacity>

        {/* Sort button */}
        <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
          <SortDesc size={14} color={COLORS.textSecondary} />
          <Text style={styles.sortText}>
            {currentSort.charAt(0).toUpperCase() + currentSort.slice(1)}
          </Text>
        </TouchableOpacity>

        {/* Refresh button */}
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <RefreshCw size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Filter size={32} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No zones found</Text>
      <Text style={styles.emptySubtitle}>
        Scan for patterns to detect zones
      </Text>
    </View>
  );

  const renderUpgradePrompt = () => {
    const maxZones = tierAccessService.getMaxZonesDisplayed();
    const totalZones = zones.length;

    if (totalZones <= maxZones) return null;

    return (
      <ZoneFeatureGuard feature="multipleZones" userTier={userTier}>
        <TouchableOpacity style={styles.upgradePrompt}>
          <Lock size={14} color={COLORS.warning} />
          <Text style={styles.upgradeText}>
            +{totalZones - maxZones} more zones available. Upgrade to view all.
          </Text>
        </TouchableOpacity>
      </ZoneFeatureGuard>
    );
  };

  const renderZone = ({ item }) => (
    <ZoneRectangle
      zone={item}
      onPress={handleZonePress}
      isSelected={selectedZoneId === item.id}
      showLabel={showLabels}
      compact={compact}
    />
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading zones...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, maxHeight && { maxHeight }]}>
      {renderHeader()}

      {isExpanded && (
        <>
          {filteredZones.length === 0 ? (
            renderEmpty()
          ) : (
            <FlatList
              data={filteredZones}
              renderItem={renderZone}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}

          {renderUpgradePrompt()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
  },
  filterActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
  },
  sortText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  refreshButton: {
    padding: 4,
  },
  listContent: {
    paddingVertical: SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  upgradeText: {
    fontSize: 12,
    color: COLORS.warning,
  },
});

export default MultiZoneOverlay;
