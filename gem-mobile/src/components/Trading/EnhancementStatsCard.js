/**
 * EnhancementStatsCard - Display Enhancement Statistics (ADMIN ONLY)
 * Shows Volume, Trend, S/R, Candle, RSI, Dynamic R:R results
 * Only visible for ADMIN users for internal analysis
 * Optimized UI with subtitles and conclusion section
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

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
 * Enhancement Item Row with Subtitle
 */
const EnhancementItem = ({
  icon,
  label,
  subtitle,
  value,
  subValue,
  color = '#FFFFFF',
  isPositive = null,
}) => {
  return (
    <View style={styles.enhancementItem}>
      <View style={styles.enhancementLeft}>
        <Ionicons name={icon} size={18} color={color} />
        <View style={styles.labelContainer}>
          <Text style={styles.enhancementLabel}>{label}</Text>
          <Text style={styles.enhancementSubtitle}>{subtitle}</Text>
        </View>
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
 * Conclusion Section based on analysis
 */
const ConclusionSection = ({ pattern, enhancements }) => {
  const conclusion = useMemo(() => {
    const volumeData = enhancements.volume || {};
    const trendData = enhancements.trend || {};
    const confluenceData = enhancements.confluence || {};
    const candleData = enhancements.candle || {};
    const rsiData = enhancements.rsi || {};
    const score = pattern?.enhancementScore || 0;
    const direction = pattern?.direction || 'LONG';

    // Count positive signals
    let bullishSignals = 0;
    let bearishSignals = 0;
    let warnings = [];
    let strengths = [];

    // Volume analysis
    if (volumeData.isConfirmed) {
      strengths.push('Khối lượng xác nhận xu hướng');
      if (direction === 'LONG') bullishSignals++;
      else bearishSignals++;
    } else if (volumeData.score < 30) {
      warnings.push('Khối lượng yếu, tín hiệu có thể không đáng tin cậy');
    }

    // Trend analysis
    if (trendData.direction === 'BULLISH' && direction === 'LONG') {
      strengths.push('Xu hướng tăng phù hợp với lệnh LONG');
      bullishSignals++;
    } else if (trendData.direction === 'BEARISH' && direction === 'SHORT') {
      strengths.push('Xu hướng giảm phù hợp với lệnh SHORT');
      bearishSignals++;
    } else if (trendData.direction && trendData.direction !== 'NEUTRAL') {
      warnings.push(`Xu hướng ${trendData.direction} ngược với hướng lệnh`);
    }

    // S/R Confluence
    if (confluenceData.hasConfluence) {
      strengths.push('Entry gần vùng hợp lưu S/R mạnh');
    }

    // Candle confirmation
    if (candleData.hasConfirmation) {
      strengths.push(`Nến xác nhận: ${candleData.signals?.[0] || 'có tín hiệu'}`);
      if (direction === 'LONG') bullishSignals++;
      else bearishSignals++;
    }

    // RSI Divergence
    if (rsiData.hasDivergence) {
      if (rsiData.divergenceType === 'Bullish' && direction === 'LONG') {
        strengths.push('RSI phân kỳ tăng hỗ trợ lệnh LONG');
        bullishSignals++;
      } else if (rsiData.divergenceType === 'Bearish' && direction === 'SHORT') {
        strengths.push('RSI phân kỳ giảm hỗ trợ lệnh SHORT');
        bearishSignals++;
      }
    }

    // RSI overbought/oversold warning
    if (rsiData.currentRSI) {
      if (rsiData.currentRSI > 70 && direction === 'LONG') {
        warnings.push('RSI quá mua, cẩn thận khi vào LONG');
      } else if (rsiData.currentRSI < 30 && direction === 'SHORT') {
        warnings.push('RSI quá bán, cẩn thận khi vào SHORT');
      }
    }

    // Generate recommendation
    let recommendation = '';
    let recommendationColor = COLORS.textMuted;

    if (score >= 80) {
      recommendation = '✅ KHUYÊN VÀO LỆNH - Nhiều tín hiệu xác nhận mạnh';
      recommendationColor = '#00FF88';
    } else if (score >= 60) {
      recommendation = '⚠️ CÂN NHẮC - Tín hiệu trung bình, cần quản lý rủi ro chặt';
      recommendationColor = COLORS.gold;
    } else if (score >= 40) {
      recommendation = '⚡ RỦI RO CAO - Ít tín hiệu xác nhận, trade cẩn thận';
      recommendationColor = COLORS.warning;
    } else {
      recommendation = '❌ KHÔNG KHUYÊN - Thiếu xác nhận, nên chờ setup tốt hơn';
      recommendationColor = COLORS.error;
    }

    return {
      strengths: strengths.slice(0, 3),
      warnings: warnings.slice(0, 2),
      recommendation,
      recommendationColor,
      totalBullish: bullishSignals,
      totalBearish: bearishSignals,
    };
  }, [pattern, enhancements]);

  return (
    <View style={styles.conclusionSection}>
      <Text style={styles.conclusionTitle}>Kết Luận Phân Tích</Text>

      {/* Strengths */}
      {conclusion.strengths.length > 0 && (
        <View style={styles.conclusionGroup}>
          <Text style={styles.conclusionGroupTitle}>Điểm mạnh:</Text>
          {conclusion.strengths.map((item, idx) => (
            <View key={idx} style={styles.conclusionItem}>
              <Ionicons name="checkmark-circle" size={14} color="#00FF88" />
              <Text style={styles.conclusionItemText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Warnings */}
      {conclusion.warnings.length > 0 && (
        <View style={styles.conclusionGroup}>
          <Text style={[styles.conclusionGroupTitle, { color: COLORS.warning }]}>Cảnh báo:</Text>
          {conclusion.warnings.map((item, idx) => (
            <View key={idx} style={styles.conclusionItem}>
              <Ionicons name="warning" size={14} color={COLORS.warning} />
              <Text style={[styles.conclusionItemText, { color: COLORS.warning }]}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendation */}
      <View style={[styles.recommendationBox, { borderColor: conclusion.recommendationColor + '50' }]}>
        <Text style={[styles.recommendationText, { color: conclusion.recommendationColor }]}>
          {conclusion.recommendation}
        </Text>
      </View>
    </View>
  );
};

/**
 * Main Enhancement Stats Card
 * NOTE: This is an ADMIN-ONLY feature for internal analysis
 */
const EnhancementStatsCard = ({
  pattern,
  userTier = 'FREE',
  onUpgradePress,
  expanded = true
}) => {
  // ADMIN-ONLY: Only show this card for admin users
  const isAdmin = userTier === 'ADMIN';

  // If not admin, don't render the card at all
  if (!isAdmin) {
    return null;
  }

  const enhancements = pattern?.enhancements || {};

  // Check if we have actual enhancement data
  const hasEnhancementData = Object.keys(enhancements).length > 0 &&
    (enhancements.volume?.score > 0 ||
     enhancements.trend?.direction ||
     enhancements.confluence?.score > 0 ||
     enhancements.candle?.score > 0 ||
     enhancements.rsi?.currentRSI);

  // Extract enhancement data
  const volumeData = enhancements.volume || {};
  const trendData = enhancements.trend || {};
  const confluenceData = enhancements.confluence || {};
  const candleData = enhancements.candle || {};
  const rsiData = enhancements.rsi || {};
  const rrData = enhancements.riskReward || {};

  // Calculate overall enhancement score
  const enhancementScore = pattern?.enhancementScore || 0;

  // Calculate quality grade from enhancement score (NOT from pattern data)
  // This ensures consistency between score and grade
  const calculateGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  };
  const qualityGrade = calculateGrade(enhancementScore);

  return (
    <View style={styles.container}>
      {/* Header with Admin Badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Phân Tích Nâng Cao</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN ONLY</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {qualityGrade && <QualityGradeBadge grade={qualityGrade} />}
        </View>
      </View>

      {/* Enhancement Score Bar */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreLabel}>Điểm Tổng Hợp</Text>
          <Text style={[
            styles.scoreValue,
            { color: enhancementScore >= 60 ? '#00FF88' : enhancementScore >= 40 ? COLORS.gold : COLORS.error }
          ]}>
            {enhancementScore}/100
          </Text>
        </View>
        <View style={styles.scoreBar}>
          <LinearGradient
            colors={enhancementScore >= 60 ? ['#6A5BFF', '#00FF88'] : enhancementScore >= 40 ? ['#6A5BFF', '#FFBD59'] : ['#6A5BFF', '#FF4757']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.scoreFill, { width: `${Math.max(Math.min(enhancementScore, 100), 5)}%` }]}
          />
        </View>
      </View>

      {/* Missing Data Warning */}
      {!hasEnhancementData && (
        <View style={styles.missingDataWarning}>
          <Ionicons name="information-circle" size={16} color={COLORS.warning} />
          <Text style={styles.missingDataText}>
            Dữ liệu phân tích nâng cao chưa được tính toán cho pattern này. Các chỉ số bên dưới có thể không chính xác.
          </Text>
        </View>
      )}

      {/* Enhancement Items with Subtitles */}
      <View style={styles.enhancementList}>
        {/* Volume Confirmation */}
        <EnhancementItem
          icon="bar-chart"
          label="Volume"
          subtitle="Khối lượng xác nhận xu hướng"
          value={volumeData.score ? `${volumeData.score}%` : 'Chưa có'}
          subValue={volumeData.direction || (volumeData.score ? null : 'Đang tính...')}
          color="#3B82F6"
          isPositive={volumeData.isConfirmed}
        />
        {volumeData.signals && (
          <SignalTags signals={volumeData.signals} color="#3B82F6" />
        )}

        {/* Trend Analysis */}
        <EnhancementItem
          icon="trending-up"
          label="Trend"
          subtitle="Hướng xu hướng tổng thể"
          value={trendData.direction || 'Chưa có'}
          subValue={trendData.strength ? `Strength: ${trendData.strength}%` : 'Đang phân tích...'}
          color={trendData.direction === 'BULLISH' ? '#00FF88' : trendData.direction === 'BEARISH' ? '#FF4757' : '#718096'}
        />

        {/* S/R Confluence */}
        <EnhancementItem
          icon="git-merge"
          label="S/R Confluence"
          subtitle="Vùng hỗ trợ/kháng cự hợp lưu"
          value={confluenceData.score ? `${confluenceData.score}%` : 'Chưa có'}
          subValue={confluenceData.nearestLevel ? `Near ${confluenceData.nearestLevel}` : 'Đang tính...'}
          color="#8B5CF6"
          isPositive={confluenceData.hasConfluence}
        />

        {/* Candle Confirmation */}
        <EnhancementItem
          icon="flash"
          label="Candle Signal"
          subtitle="Mẫu nến xác nhận điểm vào"
          value={candleData.score ? `${candleData.score}%` : 'Chưa có'}
          subValue={candleData.hasConfirmation ? 'Xác nhận' : candleData.score ? 'Chờ' : 'Đang quét...'}
          color="#FFBD59"
          isPositive={candleData.hasConfirmation}
        />
        {candleData.signals && (
          <SignalTags signals={candleData.signals} color="#FFBD59" />
        )}

        {/* RSI Divergence */}
        <EnhancementItem
          icon="pulse"
          label="RSI Divergence"
          subtitle="Phân kỳ tăng = mua, giảm = bán"
          value={rsiData.divergenceType || 'Không có'}
          subValue={rsiData.currentRSI ? `RSI: ${rsiData.currentRSI}` : 'Chưa tính RSI'}
          color="#EC4899"
          isPositive={rsiData.hasDivergence}
        />

        {/* Dynamic R:R */}
        <EnhancementItem
          icon="swap-horizontal"
          label="R:R Tối Ưu"
          subtitle="Tỷ lệ rủi ro/lợi nhuận tối ưu"
          value={`1:${rrData.optimizedRR || pattern?.riskReward || 2}`}
          subValue={rrData.originalRR ? `Gốc: 1:${rrData.originalRR}` : null}
          color="#06B6D4"
          isPositive={rrData.optimizedRR > rrData.originalRR}
        />
      </View>

      {/* Conclusion Section */}
      <ConclusionSection pattern={pattern} enhancements={enhancements} />
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
    flex: 1,
  },
  labelContainer: {
    flex: 1,
  },
  enhancementLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  enhancementSubtitle: {
    fontSize: 10,
    color: '#718096',
    marginTop: 1,
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
  // Admin Badge
  adminBadge: {
    backgroundColor: COLORS.error + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.error,
    letterSpacing: 0.5,
  },
  // Missing Data Warning
  missingDataWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  missingDataText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.warning,
    lineHeight: 16,
  },
  // Conclusion Section
  conclusionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  conclusionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 12,
  },
  conclusionGroup: {
    marginBottom: 10,
  },
  conclusionGroupTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00FF88',
    marginBottom: 6,
  },
  conclusionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  conclusionItemText: {
    fontSize: 12,
    color: '#A0AEC0',
    flex: 1,
    lineHeight: 16,
  },
  recommendationBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    borderWidth: 1,
  },
  recommendationText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default memo(EnhancementStatsCard);
