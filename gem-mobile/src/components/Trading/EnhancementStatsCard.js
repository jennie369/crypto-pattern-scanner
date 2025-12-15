/**
 * EnhancementStatsCard - Display TIER2/3 Enhancement Statistics
 * Shows Volume, Trend, S/R, Candle, RSI, Dynamic R:R results
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FeatureLockBadge, TierBadge } from '../TierUpgradePrompt';
import { isPremiumTier } from '../../constants/tierFeatures';
import { PATTERN_STATES } from '../../constants/patternSignals';

/**
 * Quality Grade Badge
 */
const QualityGradeBadge = ({ grade }) => {
  const gradeConfig = {
    'A+': { color: '#00FF88', bg: 'rgba(0, 255, 136, 0.15)' },
    'A': { color: '#00FF88', bg: 'rgba(0, 255, 136, 0.12)' },
    'B+': { color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.15)' },
    'B': { color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.12)' },
    'C': { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' },
    'D': { color: '#FF4757', bg: 'rgba(255, 71, 87, 0.15)' },
  };

  const config = gradeConfig[grade] || gradeConfig['C'];

  return (
    <View style={[styles.gradeBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.gradeText, { color: config.color }]}>{grade}</Text>
    </View>
  );
};

/**
 * Pattern State Badge
 */
const PatternStateBadge = ({ state }) => {
  const stateInfo = PATTERN_STATES[state] || PATTERN_STATES.FRESH;

  return (
    <View style={[styles.stateBadge, { backgroundColor: stateInfo.bgColor }]}>
      <Text style={styles.stateEmoji}>{stateInfo.emoji}</Text>
      <Text style={[styles.stateText, { color: stateInfo.color }]}>
        {stateInfo.label}
      </Text>
    </View>
  );
};

/**
 * Enhancement Item Row
 */
const EnhancementItem = ({
  icon,
  label,
  value,
  subValue,
  color = '#FFFFFF',
  isPositive = null,
  locked = false,
  requiredTier = 'TIER2'
}) => {
  if (locked) {
    return (
      <View style={styles.enhancementItem}>
        <View style={styles.enhancementLeft}>
          <Ionicons name={icon} size={18} color="#4A5568" />
          <Text style={[styles.enhancementLabel, { color: '#4A5568' }]}>{label}</Text>
        </View>
        <FeatureLockBadge requiredTier={requiredTier} />
      </View>
    );
  }

  return (
    <View style={styles.enhancementItem}>
      <View style={styles.enhancementLeft}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={styles.enhancementLabel}>{label}</Text>
      </View>
      <View style={styles.enhancementRight}>
        <Text style={[
          styles.enhancementValue,
          isPositive === true && { color: '#00FF88' },
          isPositive === false && { color: '#FF4757' },
        ]}>
          {value}
        </Text>
        {subValue && (
          <Text style={styles.enhancementSubValue}>{subValue}</Text>
        )}
      </View>
    </View>
  );
};

/**
 * Signal Tags (e.g., Bullish Engulfing, Volume Surge)
 */
const SignalTags = ({ signals, color = '#00FF88' }) => {
  if (!signals || signals.length === 0) return null;

  return (
    <View style={styles.signalTags}>
      {signals.slice(0, 3).map((signal, index) => (
        <View key={index} style={[styles.signalTag, { borderColor: color }]}>
          <Text style={[styles.signalTagText, { color }]}>{signal}</Text>
        </View>
      ))}
      {signals.length > 3 && (
        <Text style={styles.moreSignals}>+{signals.length - 3}</Text>
      )}
    </View>
  );
};

/**
 * Main Enhancement Stats Card
 */
const EnhancementStatsCard = ({
  pattern,
  userTier = 'FREE',
  onUpgradePress,
  expanded = true
}) => {
  const hasPremium = isPremiumTier(userTier);
  const enhancements = pattern?.enhancements || {};

  // Extract enhancement data
  const volumeData = enhancements.volume || {};
  const trendData = enhancements.trend || {};
  const confluenceData = enhancements.confluence || {};
  const candleData = enhancements.candle || {};
  const rsiData = enhancements.rsi || {};
  const rrData = enhancements.riskReward || {};

  // Calculate overall enhancement score
  const enhancementScore = pattern?.enhancementScore || 0;
  const qualityGrade = pattern?.qualityGrade || 'C';

  return (
    <View style={styles.container}>
      {/* Header with Grade & State */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Enhancement Analysis</Text>
          {hasPremium && (
            <TierBadge tier={userTier} size="small" />
          )}
        </View>
        <View style={styles.headerRight}>
          {pattern?.state && <PatternStateBadge state={pattern.state} />}
          {hasPremium && qualityGrade && <QualityGradeBadge grade={qualityGrade} />}
        </View>
      </View>

      {/* Enhancement Score Bar */}
      {hasPremium && enhancementScore > 0 && (
        <View style={styles.scoreSection}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Enhancement Score</Text>
            <Text style={styles.scoreValue}>{enhancementScore}/100</Text>
          </View>
          <View style={styles.scoreBar}>
            <LinearGradient
              colors={['#6A5BFF', '#00FF88']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.scoreFill, { width: `${Math.min(enhancementScore, 100)}%` }]}
            />
          </View>
        </View>
      )}

      {/* Enhancement Items */}
      <View style={styles.enhancementList}>
        {/* Volume Confirmation */}
        <EnhancementItem
          icon="bar-chart"
          label="Volume"
          value={hasPremium ? `${volumeData.score || 0}%` : '--'}
          subValue={volumeData.direction}
          color="#3B82F6"
          isPositive={volumeData.isConfirmed}
          locked={!hasPremium}
        />
        {hasPremium && volumeData.signals && (
          <SignalTags signals={volumeData.signals} color="#3B82F6" />
        )}

        {/* Trend Analysis */}
        <EnhancementItem
          icon="trending-up"
          label="Trend"
          value={hasPremium ? (trendData.direction || '--') : '--'}
          subValue={hasPremium ? `Strength: ${trendData.strength || 0}%` : null}
          color={trendData.direction === 'BULLISH' ? '#00FF88' : trendData.direction === 'BEARISH' ? '#FF4757' : '#FFBD59'}
          locked={!hasPremium}
        />

        {/* S/R Confluence */}
        <EnhancementItem
          icon="git-merge"
          label="S/R Confluence"
          value={hasPremium ? `${confluenceData.score || 0}%` : '--'}
          subValue={hasPremium && confluenceData.nearestLevel ? `Near ${confluenceData.nearestLevel}` : null}
          color="#8B5CF6"
          isPositive={confluenceData.hasConfluence}
          locked={!hasPremium}
        />

        {/* Candle Confirmation */}
        <EnhancementItem
          icon="flash"
          label="Candle Signal"
          value={hasPremium ? `${candleData.score || 0}%` : '--'}
          subValue={candleData.hasConfirmation ? 'Confirmed' : 'Waiting'}
          color="#FFBD59"
          isPositive={candleData.hasConfirmation}
          locked={!hasPremium}
        />
        {hasPremium && candleData.signals && (
          <SignalTags signals={candleData.signals} color="#FFBD59" />
        )}

        {/* RSI Divergence */}
        <EnhancementItem
          icon="pulse"
          label="RSI Divergence"
          value={hasPremium ? (rsiData.divergenceType || 'None') : '--'}
          subValue={hasPremium && rsiData.currentRSI ? `RSI: ${rsiData.currentRSI}` : null}
          color="#EC4899"
          isPositive={rsiData.hasDivergence}
          locked={!hasPremium}
        />

        {/* Dynamic R:R */}
        <EnhancementItem
          icon="swap-horizontal"
          label="Optimized R:R"
          value={hasPremium ? `1:${rrData.optimizedRR || pattern?.riskReward || 2}` : '--'}
          subValue={hasPremium && rrData.originalRR ? `Original: 1:${rrData.originalRR}` : null}
          color="#06B6D4"
          isPositive={rrData.optimizedRR > rrData.originalRR}
          locked={!hasPremium}
        />
      </View>

      {/* Upgrade Prompt for Free/Tier1 */}
      {!hasPremium && (
        <TouchableOpacity
          style={styles.upgradePrompt}
          onPress={onUpgradePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2D1B4E', '#1A0F2E']}
            style={styles.upgradeGradient}
          >
            <Ionicons name="lock-open" size={20} color="#FFC107" />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Unlock Premium Analysis</Text>
              <Text style={styles.upgradeSubtitle}>
                +30-45% higher win rate with all enhancements
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFC107" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Enhancement Summary for Premium */}
      {hasPremium && pattern?.enhancementSummary && (
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Analysis Summary</Text>
          <View style={styles.checkList}>
            {pattern.enhancementSummary.checks?.map((check, index) => (
              <View key={index} style={styles.checkItem}>
                <Ionicons
                  name={check.passed ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={check.passed ? '#00FF88' : '#FF4757'}
                />
                <Text style={styles.checkText}>{check.name}</Text>
                {check.score > 0 && (
                  <Text style={styles.checkScore}>+{check.score}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Grade Badge
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // State Badge
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  stateEmoji: {
    fontSize: 12,
  },
  stateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Score Section
  scoreSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00FF88',
  },
  scoreBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Enhancement List
  enhancementList: {
    gap: 4,
  },
  enhancementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  enhancementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  enhancementLabel: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  enhancementRight: {
    alignItems: 'flex-end',
  },
  enhancementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  enhancementSubValue: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  // Signal Tags
  signalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 28,
    paddingBottom: 8,
  },
  signalTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  signalTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreSignals: {
    fontSize: 10,
    color: '#718096',
    alignSelf: 'center',
  },
  // Upgrade Prompt
  upgradePrompt: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC107',
  },
  upgradeSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  // Summary Section
  summarySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 10,
  },
  checkList: {
    gap: 6,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
  checkScore: {
    fontSize: 11,
    color: '#00FF88',
    fontWeight: '600',
  },
});

export default memo(EnhancementStatsCard);
