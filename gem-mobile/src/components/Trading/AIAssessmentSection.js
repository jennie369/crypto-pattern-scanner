/**
 * AIAssessmentSection - AI Sư Phụ assessment for Custom Mode trades
 * Shows AI score, warnings, and recommendations
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  XCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

/**
 * @param {Object} props
 * @param {number} props.customEntry - Custom entry price
 * @param {number} props.customSL - Custom stop loss
 * @param {number} props.customTP - Custom take profit
 * @param {number} props.patternEntry - Original pattern entry
 * @param {number} props.patternSL - Original pattern SL
 * @param {number} props.patternTP - Original pattern TP
 * @param {'LONG' | 'SHORT'} props.direction - Trade direction
 * @param {number} props.leverage - Leverage multiplier
 * @param {Function} props.onAssessmentChange - Callback when assessment changes
 */
const AIAssessmentSection = ({
  customEntry = 0,
  customSL = 0,
  customTP = 0,
  patternEntry = 0,
  patternSL = 0,
  patternTP = 0,
  direction = 'LONG',
  leverage = 10,
  onAssessmentChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const debounceRef = useRef(null);

  // Calculate assessment when values change
  useEffect(() => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce calculation
    debounceRef.current = setTimeout(() => {
      setLoading(true);

      // Small delay for UX
      setTimeout(() => {
        const result = calculateAIScore({
          customEntry,
          customSL,
          customTP,
          patternEntry,
          patternSL,
          patternTP,
          direction,
          leverage,
        });

        setAssessment(result);
        onAssessmentChange?.(result);
        setLoading(false);
      }, 300);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [customEntry, customSL, customTP, patternEntry, patternSL, patternTP, direction, leverage]);

  // AI Score calculation logic
  const calculateAIScore = (trade) => {
    let score = 100;
    const warnings = [];
    const successes = [];
    const recommendations = [];

    // Calculate deviations
    const entryDev = trade.patternEntry > 0
      ? ((trade.customEntry - trade.patternEntry) / trade.patternEntry) * 100
      : 0;
    const slDev = trade.patternSL > 0
      ? ((trade.customSL - trade.patternSL) / trade.patternSL) * 100
      : 0;
    const tpDev = trade.patternTP > 0
      ? ((trade.customTP - trade.patternTP) / trade.patternTP) * 100
      : 0;

    // 1. Check Stop Loss exists - HARD BLOCK
    if (!trade.customSL || trade.customSL <= 0) {
      return {
        score: 0,
        blocked: true,
        blockReason: 'Không có Stop Loss - KHÔNG ĐƯỢC PHÉP trade',
        warnings: [],
        successes: [],
        recommendations: [],
        rrRatio: 0,
        deviations: { entry: entryDev, sl: slDev, tp: tpDev },
      };
    } else {
      successes.push('Có Stop Loss đầy đủ');
    }

    // 2. Calculate RR Ratio
    const risk = Math.abs(trade.customEntry - trade.customSL);
    const reward = Math.abs(trade.customTP - trade.customEntry);
    const rrRatio = risk > 0 ? reward / risk : 0;

    if (rrRatio < 1) {
      score -= 20;
      warnings.push(`Tỷ lệ R:R ${rrRatio.toFixed(2)} < 1:1 - Rủi ro cao`);
      recommendations.push('Đặt TP xa hơn hoặc SL gần hơn');
    } else if (rrRatio >= 1.5) {
      successes.push(`Tỷ lệ R:R ${rrRatio.toFixed(2)} - Tốt`);
    } else {
      successes.push(`Tỷ lệ R:R ${rrRatio.toFixed(2)} - Chấp nhận được`);
    }

    // 3. Check Entry Deviation
    if (Math.abs(entryDev) > 2) {
      score -= 15;
      warnings.push(`Entry lệch ${Math.abs(entryDev).toFixed(2)}% so với pattern`);
      recommendations.push('Cân nhắc entry gần pattern hơn');
    } else if (Math.abs(entryDev) < 0.5) {
      successes.push('Entry sát với pattern');
    }

    // 4. Check SL Deviation - wider SL = more risk
    const isSlWider = (trade.direction === 'LONG' && slDev < -2) ||
                      (trade.direction === 'SHORT' && slDev > 2);
    if (isSlWider) {
      score -= 15;
      warnings.push('Stop Loss rộng hơn pattern - Rủi ro cao hơn');
    }

    // 5. Check TP Deviation - further TP = harder to achieve
    const isTpFurther = (trade.direction === 'LONG' && tpDev > 3) ||
                        (trade.direction === 'SHORT' && tpDev < -3);
    if (isTpFurther) {
      score -= 10;
      warnings.push('Take Profit xa hơn pattern - Khó đạt hơn');
      recommendations.push('Cân nhắc TP gần pattern để tăng xác suất thắng');
    }

    // 6. Check Leverage
    if (trade.leverage > 50) {
      score -= 20;
      warnings.push(`Đòn bẩy ${trade.leverage}x rất cao - Rủi ro thanh lý`);
      recommendations.push('Khuyến nghị leverage ≤ 20x');
    } else if (trade.leverage > 20) {
      score -= 10;
      warnings.push(`Đòn bẩy ${trade.leverage}x cao`);
    }

    // Ensure score in range 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      blocked: false,
      warnings,
      successes,
      recommendations,
      rrRatio,
      deviations: {
        entry: entryDev,
        sl: slDev,
        tp: tpDev,
      },
    };
  };

  // Get score color
  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 80) return COLORS.success;
    if (scoreValue >= 60) return COLORS.gold;
    if (scoreValue >= 40) return COLORS.warning;
    return COLORS.error;
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain size={18} color={COLORS.gold} />
          <Text style={styles.headerText}>AI SƯ PHỤ ĐANG ĐÁNH GIÁ...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
        </View>
      </View>
    );
  }

  // No assessment yet
  if (!assessment) return null;

  // Blocked state (No SL)
  if (assessment.blocked) {
    return (
      <View style={[styles.container, styles.containerBlocked]}>
        <View style={styles.header}>
          <XCircle size={18} color={COLORS.error} />
          <Text style={[styles.headerText, { color: COLORS.error }]}>
            AI SƯ PHỤ - KHÔNG CHO PHÉP
          </Text>
        </View>
        <View style={styles.blockedContent}>
          <AlertTriangle size={24} color={COLORS.error} />
          <Text style={styles.blockedText}>{assessment.blockReason}</Text>
        </View>
      </View>
    );
  }

  const scoreColor = getScoreColor(assessment.score);

  return (
    <View style={styles.container}>
      {/* Header with Score */}
      <View style={styles.header}>
        <Brain size={18} color={COLORS.gold} />
        <Text style={styles.headerText}>AI SƯ PHỤ ĐÁNH GIÁ</Text>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '20' }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {assessment.score}/100
          </Text>
        </View>
      </View>

      {/* Successes */}
      {assessment.successes?.map((item, index) => (
        <View key={`success-${index}`} style={styles.feedbackRow}>
          <CheckCircle size={14} color={COLORS.success} />
          <Text style={styles.feedbackText}>{item}</Text>
        </View>
      ))}

      {/* Warnings */}
      {assessment.warnings?.map((item, index) => (
        <View key={`warning-${index}`} style={styles.feedbackRow}>
          <AlertTriangle size={14} color={COLORS.warning} />
          <Text style={styles.feedbackText}>{item}</Text>
        </View>
      ))}

      {/* Recommendations */}
      {assessment.recommendations?.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <View style={styles.recommendationsHeader}>
            <Lightbulb size={14} color={COLORS.info} />
            <Text style={styles.recommendationsTitle}>Khuyến nghị:</Text>
          </View>
          {assessment.recommendations.map((item, index) => (
            <Text key={`rec-${index}`} style={styles.recommendationText}>
              • {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  containerBlocked: {
    borderColor: COLORS.error + '50',
    backgroundColor: COLORS.error + '10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 8,
  },
  headerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  loadingContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  blockedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: SPACING.sm,
  },
  blockedText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  feedbackText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  recommendationsContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  recommendationsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.info,
  },
  recommendationText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginLeft: 20,
    lineHeight: 18,
  },
});

export default AIAssessmentSection;
