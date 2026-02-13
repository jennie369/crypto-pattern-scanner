/**
 * GEM Mobile - Zone Detail Screen
 * Phase 1B: Enhanced zone details with all pattern information
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Target,
  Shield,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  CheckCircle,
  Zap,
  Layers,
  Clock,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import { analyzeZoneDetail } from '../../services/scannerIntegration';

// Import Scanner Components
import {
  ZoneBoundaryDisplay,
  OddsEnhancerScorecard,
  FreshnessIndicator,
  GradeBadge,
  ZoneHierarchyBadge,
  ConfirmationBadge,
  CompressionAlert,
  InducementWarning,
  ZoneValidityBadge,
  MPLIndicator,
  ExtendedZoneBadge,
  FTBBadge,
} from '../../components/Scanner';

const ZoneDetailScreen = ({ navigation, route }) => {
  const { zone: initialZone, symbol, timeframe, candles } = route.params || {};

  const [zone, setZone] = useState(initialZone);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load detailed zone analysis
  const loadZoneDetails = useCallback(async (isRefresh = false) => {
    if (!initialZone || !candles?.length) {
      setError('Missing zone or candle data');
      setIsLoading(false);
      return;
    }

    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const result = await analyzeZoneDetail(initialZone, candles);

      if (result.success) {
        setZone(result.zone);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('[ZoneDetailScreen] Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [initialZone, candles]);

  useEffect(() => {
    loadZoneDetails();
  }, [loadZoneDetails]);

  // Navigate to odds analysis
  const handleOddsPress = useCallback(() => {
    navigation.navigate('OddsAnalysis', { zone, symbol, timeframe });
  }, [navigation, zone, symbol, timeframe]);

  // Navigate to alerts
  const handleAlertPress = useCallback(() => {
    navigation.navigate('PriceAlert', { zone, symbol });
  }, [navigation, zone, symbol]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Analyzing zone...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !zone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Lỗi</Text>
          <Text style={styles.errorText}>{error || 'Zone không hợp lệ'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadZoneDetails()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isLFZ = zone.zoneType === 'LFZ';
  const zoneColor = isLFZ ? COLORS.success : COLORS.error;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{symbol}</Text>
          <Text style={styles.headerSubtitle}>{timeframe} Zone</Text>
        </View>
        <TouchableOpacity onPress={handleAlertPress} style={styles.alertButton}>
          <Bell size={20} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadZoneDetails(true)}
            tintColor={COLORS.gold}
          />
        }
      >
        {/* Zone Type & Badges */}
        <View style={styles.badgesRow}>
          <View style={[styles.zoneTypeBadge, { backgroundColor: zoneColor + '20' }]}>
            {isLFZ ? (
              <TrendingUp size={16} color={zoneColor} />
            ) : (
              <TrendingDown size={16} color={zoneColor} />
            )}
            <Text style={[styles.zoneTypeText, { color: zoneColor }]}>
              {zone.zoneType} - {isLFZ ? 'Demand' : 'Supply'}
            </Text>
          </View>
          <ZoneHierarchyBadge level={zone.zoneHierarchyLevel} />
          {zone.isFTB && <FTBBadge />}
          {zone.isExtended && <ExtendedZoneBadge />}
        </View>

        {/* Zone Boundary Display */}
        <View style={styles.section}>
          <ZoneBoundaryDisplay
            zone={zone}
            showChart
            interactive
          />
        </View>

        {/* Grade & Score */}
        <View style={styles.gradeSection}>
          <TouchableOpacity style={styles.gradeCard} onPress={handleOddsPress}>
            <View style={styles.gradeLeft}>
              <GradeBadge grade={zone.oddsGrade} size="lg" />
              <View style={styles.gradeInfo}>
                <Text style={styles.gradeLabel}>Odds Score</Text>
                <Text style={styles.gradeValue}>{zone.oddsScore}/16</Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Odds Enhancers Scorecard */}
        {zone.oddsResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Odds Enhancers</Text>
            <OddsEnhancerScorecard
              oddsResult={zone.oddsResult}
              compact
            />
          </View>
        )}

        {/* Freshness & FTB Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone Freshness</Text>
          <FreshnessIndicator
            testCount={zone.testCount || 0}
            ftbStatus={zone.ftbStatus}
            showDetails
          />
        </View>

        {/* Confirmation Patterns */}
        {zone.confirmations?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirmation Patterns</Text>
            <View style={styles.confirmationsContainer}>
              {zone.confirmations.map((conf, index) => (
                <ConfirmationBadge key={index} confirmation={conf} size="md" />
              ))}
            </View>
            {zone.pinEngulfCombo?.hasPinEngulfCombo && (
              <View style={styles.comboAlert}>
                <Zap size={16} color={COLORS.gold} />
                <Text style={styles.comboText}>
                  Pin + Engulf Combo - {zone.pinEngulfCombo.reliability}% reliability
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Compression Detection */}
        {zone.compression?.hasCompression && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compression</Text>
            <CompressionAlert compression={zone.compression} />
          </View>
        )}

        {/* Inducement Detection */}
        {zone.inducement?.hasInducement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inducement / Stop Hunt</Text>
            <InducementWarning inducement={zone.inducement} />
          </View>
        )}

        {/* Zone Validity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone Validity</Text>
          <ZoneValidityBadge
            isValid={zone.isValid}
            confidence={zone.validationConfidence}
            showDetails
          />
        </View>

        {/* MPL Indicator */}
        {zone.mpl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MPL - Most Penetrated Level</Text>
            <MPLIndicator mpl={zone.mpl} zone={zone} />
          </View>
        )}

        {/* Trading Plan Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trading Plan</Text>
          <View style={styles.tradingPlanCard}>
            <View style={styles.planRow}>
              <View style={styles.planItem}>
                <Target size={16} color={COLORS.primary} />
                <Text style={styles.planLabel}>Entry</Text>
                <Text style={styles.planValue}>${zone.entryPrice?.toFixed(4)}</Text>
              </View>
              <View style={styles.planItem}>
                <Shield size={16} color={COLORS.error} />
                <Text style={styles.planLabel}>Stop</Text>
                <Text style={styles.planValue}>${zone.stopPrice?.toFixed(4)}</Text>
              </View>
            </View>
            {zone.targetPrice && (
              <View style={styles.planRow}>
                <View style={styles.planItem}>
                  <Star size={16} color={COLORS.success} />
                  <Text style={styles.planLabel}>Target</Text>
                  <Text style={styles.planValue}>${zone.targetPrice?.toFixed(4)}</Text>
                </View>
                <View style={styles.planItem}>
                  <TrendingUp size={16} color={COLORS.gold} />
                  <Text style={styles.planLabel}>R:R</Text>
                  <Text style={styles.planValue}>{zone.riskReward?.toFixed(2) || 'N/A'}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: zoneColor }]}
            onPress={handleAlertPress}
          >
            <Bell size={18} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Set Alert</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleOddsPress}
          >
            <Layers size={18} color={COLORS.textPrimary} />
            <Text style={[styles.actionButtonText, { color: COLORS.textPrimary }]}>
              Full Analysis
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.error,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  alertButton: {
    padding: SPACING.sm,
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.md,
  },

  // Badges Row
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  zoneTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  zoneTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },

  // Grade Section
  gradeSection: {
    marginBottom: SPACING.lg,
  },
  gradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  gradeInfo: {},
  gradeLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  gradeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Confirmations
  confirmationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  comboAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold + '20',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  comboText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Trading Plan
  tradingPlanCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  planRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  planItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  planLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  planValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },

  // Actions
  actionsSection: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  secondaryButton: {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },

  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default ZoneDetailScreen;
