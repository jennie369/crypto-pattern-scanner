/**
 * GEM Mobile - FTR Zone Card
 * Visual display of FTR (Fail To Return) zones
 *
 * Phase 1B: FTR Zone Visualization
 *
 * FTR = Zone formed after S/R break where price doesn't return to broken level
 * FTB = First Time Back (first retest = best entry)
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Clock,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, BORDER_RADIUS } from '../../utils/tokens';
import ZoneBoundaryDisplay from './ZoneBoundaryDisplay';
import { getAdvancedPatternConfig } from '../../constants/advancedPatternConfig';

const FTRZoneCard = memo(({
  ftrZone,
  currentPrice,
  onPress,
  onInfoPress,
  compact = false,
  showZoneBoundary = true,
  showFreshness = true,
}) => {
  if (!ftrZone) {
    return null;
  }

  const {
    pattern,
    patternType,
    tradingBias,
    zoneType,
    resistanceLevel,
    supportLevel,
    breakHigh,
    breakLow,
    breakPercent,
    returnPercent,
    confirmationHigh,
    confirmationLow,
    strength,
    stars,
    winRate,
    testCount = 0,
  } = ftrZone;

  const config = getAdvancedPatternConfig(patternType || pattern) || {};
  const isBullish = tradingBias === 'BUY';
  const color = isBullish ? COLORS.success : COLORS.error;
  const DirectionIcon = isBullish ? ArrowUpRight : ArrowDownRight;

  // FTR display info
  const srLevel = isBullish ? resistanceLevel : supportLevel;
  const breakPrice = isBullish ? breakHigh : breakLow;
  const confirmPrice = isBullish ? confirmationHigh : confirmationLow;

  // Format price
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '—';
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.0001) return price.toFixed(6);
    return price.toFixed(8);
  };

  // Freshness calculation
  const getFreshnessInfo = () => {
    if (testCount === 0) {
      return { label: 'FTB (Fresh)', color: COLORS.success, quality: 'excellent' };
    } else if (testCount === 1) {
      return { label: '2nd Test', color: COLORS.gold, quality: 'good' };
    } else if (testCount === 2) {
      return { label: '3rd Test', color: COLORS.warning, quality: 'fair' };
    }
    return { label: `${testCount + 1}th Test`, color: COLORS.error, quality: 'stale' };
  };

  const freshness = getFreshnessInfo();

  // Compact mode for list items
  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.compactContainer, { borderLeftColor: color }]}
        activeOpacity={0.7}
      >
        <View style={styles.compactHeader}>
          <DirectionIcon size={16} color={color} />
          <Text style={[styles.compactTitle, { color }]}>
            {config.name || 'FTR'}
          </Text>
          {showFreshness && (
            <View style={[styles.compactFreshBadge, { backgroundColor: freshness.color + '20' }]}>
              <Text style={[styles.compactFreshText, { color: freshness.color }]}>
                {freshness.label}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactLabel}>
            {isBullish ? 'Resistance' : 'Support'}: {formatPrice(srLevel)}
          </Text>
          <Text style={styles.compactBreak}>
            Break: {breakPercent}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { borderColor: color + '40' }]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <DirectionIcon size={20} color={color} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.patternName, { color }]}>
                {config.fullName || 'Fail To Return'}
              </Text>
              <Text style={styles.starsDisplay}>{config.starsDisplay || '⭐⭐⭐⭐'}</Text>
            </View>
            <Text style={styles.patternContext}>
              {config.context === 'continuation' ? 'Continuation Pattern' : 'Pattern'} • {config.type || zoneType}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {showFreshness && (
            <View style={[styles.freshBadge, { backgroundColor: freshness.color + '20', borderColor: freshness.color + '40' }]}>
              <RefreshCw size={12} color={freshness.color} />
              <Text style={[styles.freshBadgeText, { color: freshness.color }]}>
                {freshness.label}
              </Text>
            </View>
          )}
          {onInfoPress && (
            <TouchableOpacity
              onPress={onInfoPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Info size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FTR Structure Visualization */}
      <View style={styles.structureContainer}>
        <Text style={styles.sectionTitle}>FTR Structure</Text>

        {/* S/R Level Broken */}
        <View style={styles.structureRow}>
          <View style={styles.structureLabel}>
            <View style={[styles.structureDot, { backgroundColor: COLORS.purple }]} />
            <Text style={styles.structureLabelText}>
              {isBullish ? 'Resistance Broken' : 'Support Broken'}
            </Text>
          </View>
          <Text style={styles.structurePrice}>{formatPrice(srLevel)}</Text>
        </View>

        {/* Break Point */}
        <View style={styles.structureRow}>
          <View style={styles.structureLabel}>
            <View style={[styles.structureDot, { backgroundColor: color }]} />
            <Text style={styles.structureLabelText}>
              {isBullish ? 'Break High' : 'Break Low'}
            </Text>
          </View>
          <View style={styles.structureValue}>
            <Text style={styles.structurePrice}>{formatPrice(breakPrice)}</Text>
            <View style={[styles.percentBadge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.percentText, { color }]}>+{breakPercent}%</Text>
            </View>
          </View>
        </View>

        {/* Confirmation */}
        {confirmPrice && (
          <View style={styles.structureRow}>
            <View style={styles.structureLabel}>
              <View style={[styles.structureDot, { backgroundColor: COLORS.gold }]} />
              <Text style={styles.structureLabelText}>Confirmation</Text>
            </View>
            <View style={styles.structureValue}>
              <CheckCircle size={14} color={COLORS.gold} />
              <Text style={styles.structurePrice}>{formatPrice(confirmPrice)}</Text>
            </View>
          </View>
        )}

        {/* Return Percent */}
        <View style={styles.structureRow}>
          <View style={styles.structureLabel}>
            <View style={[styles.structureDot, { backgroundColor: COLORS.cyan }]} />
            <Text style={styles.structureLabelText}>Return Ratio</Text>
          </View>
          <View style={styles.structureValue}>
            <Text style={[styles.returnPercent, { color: returnPercent <= 30 ? COLORS.success : COLORS.warning }]}>
              {returnPercent}%
            </Text>
            <Text style={styles.returnHint}>
              {returnPercent <= 30 ? '(Clean FTR)' : '(Deep Return)'}
            </Text>
          </View>
        </View>
      </View>

      {/* FTR Explanation */}
      <View style={styles.explainContainer}>
        <Zap size={14} color={COLORS.gold} />
        <Text style={styles.explainText}>
          {isBullish
            ? 'Price broke above resistance, pulled back but failed to return below it. Zone acts as new demand.'
            : 'Price broke below support, pulled back but failed to return above it. Zone acts as new supply.'}
        </Text>
      </View>

      {/* Zone Boundary Display */}
      {showZoneBoundary && (
        <View style={styles.zoneContainer}>
          <ZoneBoundaryDisplay
            zone={ftrZone}
            currentPrice={currentPrice}
            showRiskReward={true}
            showDistance={true}
            compact={false}
          />
        </View>
      )}

      {/* Freshness Warning */}
      {testCount > 2 && (
        <View style={styles.warningContainer}>
          <AlertTriangle size={14} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Zone has been tested {testCount + 1} times. Freshness is low.
          </Text>
        </View>
      )}

      {/* Win Rate & Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {((winRate || config.winRate || 0.67) * 100).toFixed(0)}%
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Strength</Text>
          <Text style={[styles.statValue, { color: COLORS.gold }]}>
            {strength || 4}/5
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Trade</Text>
          <Text style={[styles.statValue, { color }]}>
            {tradingBias}
          </Text>
        </View>
      </View>

      {/* Trading Rule */}
      <View style={styles.ruleContainer}>
        <Target size={14} color={COLORS.purple} />
        <Text style={styles.ruleText}>
          {config.entryRule || (isBullish
            ? 'Entry at HIGH of base zone (near price)'
            : 'Entry at LOW of base zone (near price)')}
        </Text>
      </View>
      <View style={styles.ruleContainer}>
        <Shield size={14} color={COLORS.textMuted} />
        <Text style={styles.ruleText}>
          {config.stopRule || (isBullish
            ? 'Stop below LOW of base zone (far price)'
            : 'Stop above HIGH of base zone (far price)')}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.background,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  compactContainer: {
    backgroundColor: GLASS.background,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  compactTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
  },
  compactFreshBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
  },
  compactFreshText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  compactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  compactBreak: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  patternName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  starsDisplay: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  patternContext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  freshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  freshBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Structure
  structureContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  structureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  structureLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  structureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  structureLabelText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  structureValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  structurePrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  percentBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.xs,
  },
  percentText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  returnPercent: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontFamily: 'monospace',
  },
  returnHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Explanation
  explainContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.gold + '10',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  explainText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Zone
  zoneContainer: {
    marginBottom: SPACING.md,
  },

  // Warning
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.warning + '15',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.textMuted + '30',
  },

  // Rules
  ruleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  ruleText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

FTRZoneCard.displayName = 'FTRZoneCard';

export default FTRZoneCard;
