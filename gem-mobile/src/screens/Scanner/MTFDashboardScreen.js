/**
 * GEM Mobile - MTF Dashboard Screen
 * Displays expanded multi-timeframe zone alignment analysis
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Layers,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Minus,
  Clock,
  BarChart3,
  Shield,
} from 'lucide-react-native';

import { COLORS, SPACING, GRADIENTS } from '../../theme/darkTheme';
import mtfAlignmentService, {
  ALIGNMENT_STATUS,
  ALIGNMENT_LEVELS,
  RECOMMENDATION,
} from '../../services/mtfAlignmentService';

export default function MTFDashboardScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { symbol, alignment: initialAlignment } = route.params || {};

  const [alignment, setAlignment] = useState(initialAlignment);
  const [loading, setLoading] = useState(!initialAlignment);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlignment = useCallback(async () => {
    if (!symbol) return;
    try {
      const data = await mtfAlignmentService.analyzeAlignment(symbol);
      setAlignment(data);
    } catch (error) {
      console.error('[MTFDashboard] Error fetching alignment:', error);
    }
  }, [symbol]);

  useEffect(() => {
    if (!initialAlignment && symbol) {
      setLoading(true);
      fetchAlignment().finally(() => setLoading(false));
    }
  }, [symbol, initialAlignment, fetchAlignment]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlignment();
    setRefreshing(false);
  };

  const getScoreColor = (score) => {
    if (score >= ALIGNMENT_LEVELS.HIGH_PROBABILITY) return '#4ECDC4';
    if (score >= ALIGNMENT_LEVELS.NORMAL) return '#FFC107';
    if (score >= ALIGNMENT_LEVELS.LOW) return '#FF9800';
    return '#6C757D';
  };

  const getRecommendationDisplay = (rec) => {
    switch (rec) {
      case RECOMMENDATION.HIGH_PROBABILITY:
        return { text: 'HIGH PROBABILITY', color: '#4ECDC4', icon: Target, desc: 'Strong alignment across all timeframes. Consider entering.' };
      case RECOMMENDATION.NORMAL:
        return { text: 'NORMAL', color: '#FFC107', icon: CheckCircle, desc: 'Moderate alignment. Use caution with position sizing.' };
      case RECOMMENDATION.WAIT:
        return { text: 'WAIT', color: '#FF9800', icon: AlertTriangle, desc: 'Weak alignment. Wait for better confluence.' };
      default:
        return { text: 'SKIP', color: '#6C757D', icon: Minus, desc: 'No clear direction. Skip this setup.' };
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case ALIGNMENT_STATUS.ALIGNED:
        return { text: 'Fully Aligned', color: '#4ECDC4' };
      case ALIGNMENT_STATUS.PARTIAL:
        return { text: 'Partially Aligned', color: '#FFC107' };
      case ALIGNMENT_STATUS.CONFLICTING:
        return { text: 'Conflicting Signals', color: '#FF6B6B' };
      default:
        return { text: 'Unknown', color: '#6C757D' };
    }
  };

  const renderTimeframeCard = (label, fullLabel, data) => {
    const isLong = data?.direction === 'LONG';
    const hasData = data?.zones?.length > 0;
    const strength = data?.strength || 0;
    const zoneCount = data?.zones?.length || 0;

    return (
      <View style={styles.tfCard}>
        <View style={styles.tfCardHeader}>
          <Text style={styles.tfLabel}>{label}</Text>
          <Text style={styles.tfFullLabel}>{fullLabel}</Text>
        </View>

        <View style={[
          styles.tfIconLarge,
          hasData && {
            backgroundColor: isLong ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 107, 107, 0.2)',
          },
        ]}>
          {hasData ? (
            isLong ? (
              <TrendingUp size={32} color="#4ECDC4" />
            ) : (
              <TrendingDown size={32} color="#FF6B6B" />
            )
          ) : (
            <Minus size={32} color={COLORS.textSecondary} />
          )}
        </View>

        <View style={styles.tfStats}>
          <View style={styles.tfStatRow}>
            <Text style={styles.tfStatLabel}>Direction</Text>
            <Text style={[
              styles.tfStatValue,
              hasData && { color: isLong ? '#4ECDC4' : '#FF6B6B' },
            ]}>
              {hasData ? (isLong ? 'LONG' : 'SHORT') : '—'}
            </Text>
          </View>
          <View style={styles.tfStatRow}>
            <Text style={styles.tfStatLabel}>Strength</Text>
            <Text style={[
              styles.tfStatValue,
              hasData && { color: isLong ? '#4ECDC4' : '#FF6B6B' },
            ]}>
              {hasData ? `${strength}%` : '—'}
            </Text>
          </View>
          <View style={styles.tfStatRow}>
            <Text style={styles.tfStatLabel}>Zones</Text>
            <Text style={styles.tfStatValue}>
              {zoneCount}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const { htf, itf, ltf, alignment: alignmentData, recommendation } = alignment || {};
  const score = alignmentData?.score || 0;
  const recDisplay = getRecommendationDisplay(recommendation);
  const statusDisplay = getStatusDisplay(alignmentData?.status);
  const RecIcon = recDisplay.icon;

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Layers size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>MTF Analysis</Text>
          {symbol && <Text style={styles.headerSymbol}>{symbol}</Text>}
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <RefreshCw size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing Multi-Timeframe Alignment...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Score Section */}
          <View style={styles.scoreSection}>
            <Text style={styles.sectionTitle}>Confluence Score</Text>
            <View style={styles.scoreCard}>
              <View style={styles.scoreCircle}>
                <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>
                  {score}%
                </Text>
              </View>
              <View style={styles.scoreGaugeContainer}>
                <View style={styles.scoreGauge}>
                  <View
                    style={[
                      styles.scoreGaugeBar,
                      { width: `${score}%`, backgroundColor: getScoreColor(score) },
                    ]}
                  />
                </View>
                <View style={styles.gaugeLegend}>
                  <Text style={styles.gaugeLegendText}>0%</Text>
                  <Text style={styles.gaugeLegendText}>50%</Text>
                  <Text style={styles.gaugeLegendText}>100%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recommendation Section */}
          <View style={styles.recommendationSection}>
            <Text style={styles.sectionTitle}>Recommendation</Text>
            <View style={[styles.recCard, { backgroundColor: `${recDisplay.color}15` }]}>
              <View style={styles.recHeader}>
                <RecIcon size={28} color={recDisplay.color} />
                <Text style={[styles.recText, { color: recDisplay.color }]}>
                  {recDisplay.text}
                </Text>
              </View>
              <Text style={styles.recDesc}>{recDisplay.desc}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusDisplay.color}25` }]}>
                <Text style={[styles.statusText, { color: statusDisplay.color }]}>
                  {statusDisplay.text}
                </Text>
              </View>
            </View>
          </View>

          {/* Direction Section */}
          {alignmentData?.direction && (
            <View style={styles.directionSection}>
              <Text style={styles.sectionTitle}>Overall Bias</Text>
              <View style={[
                styles.directionCard,
                {
                  backgroundColor: alignmentData.direction === 'LONG'
                    ? 'rgba(78, 205, 196, 0.15)'
                    : 'rgba(255, 107, 107, 0.15)',
                },
              ]}>
                <View style={styles.directionIconContainer}>
                  {alignmentData.direction === 'LONG' ? (
                    <TrendingUp size={40} color="#4ECDC4" />
                  ) : (
                    <TrendingDown size={40} color="#FF6B6B" />
                  )}
                </View>
                <Text style={[
                  styles.directionText,
                  { color: alignmentData.direction === 'LONG' ? '#4ECDC4' : '#FF6B6B' },
                ]}>
                  {alignmentData.direction}
                </Text>
                <Text style={styles.directionSubtext}>
                  {alignmentData.direction === 'LONG' ? 'Bullish Bias' : 'Bearish Bias'}
                </Text>
              </View>
            </View>
          )}

          {/* Timeframe Cards */}
          <View style={styles.timeframeSection}>
            <Text style={styles.sectionTitle}>Timeframe Breakdown</Text>
            <View style={styles.tfCardsContainer}>
              {renderTimeframeCard('HTF', 'Higher TF', htf)}
              {renderTimeframeCard('ITF', 'Intermediate', itf)}
              {renderTimeframeCard('LTF', 'Lower TF', ltf)}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Shield size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>
                MTF analysis helps confirm trade direction by checking alignment across multiple timeframes.
                Higher scores indicate stronger confluence.
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSymbol: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Score Section
  scoreSection: {
    marginTop: SPACING.lg,
  },
  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  scoreGaugeContainer: {
    flex: 1,
  },
  scoreGauge: {
    height: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  scoreGaugeBar: {
    height: '100%',
    borderRadius: 6,
  },
  gaugeLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  gaugeLegendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  // Recommendation Section
  recommendationSection: {
    marginTop: SPACING.lg,
  },
  recCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recText: {
    fontSize: 22,
    fontWeight: '700',
  },
  recDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginTop: SPACING.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Direction Section
  directionSection: {
    marginTop: SPACING.lg,
  },
  directionCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  directionIconContainer: {
    marginBottom: SPACING.xs,
  },
  directionText: {
    fontSize: 28,
    fontWeight: '700',
  },
  directionSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Timeframe Section
  timeframeSection: {
    marginTop: SPACING.lg,
  },
  tfCardsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tfCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  tfCardHeader: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tfLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  tfFullLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  tfIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  tfStats: {
    width: '100%',
    gap: SPACING.xs,
  },
  tfStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tfStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  tfStatValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  // Info Section
  infoSection: {
    marginTop: SPACING.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
