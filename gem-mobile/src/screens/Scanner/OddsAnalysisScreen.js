/**
 * GEM Mobile - Odds Analysis Screen
 * Phase 1C: Full breakdown of 8 Odds Enhancers scoring
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowLeft,
  Zap,
  Clock,
  Star,
  Target,
  TrendingUp,
  Layers,
  Timer,
  Scale,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import { GradeBadge } from '../../components/Scanner';

/**
 * Odds Enhancer Criteria Configuration
 */
const ODDS_CRITERIA = [
  {
    id: 'departureStrength',
    name: 'Departure Strength',
    nameVi: 'Sức Mạnh Thoát Ly',
    icon: Zap,
    maxScore: 2,
    description: 'Độ mạnh của nến rời khỏi zone',
    scoring: [
      { score: 2, label: 'Strong', desc: 'Body >= 70%, ít wick' },
      { score: 1, label: 'Moderate', desc: 'Body 50-70%' },
      { score: 0, label: 'Weak', desc: 'Body < 50%, nhiều wick' },
    ],
  },
  {
    id: 'timeAtLevel',
    name: 'Time at Level',
    nameVi: 'Thời Gian Tại Vùng',
    icon: Clock,
    maxScore: 2,
    description: 'Số nến trong vùng pause/base',
    scoring: [
      { score: 2, label: 'Optimal', desc: '1-2 nến (fresh orders)' },
      { score: 1, label: 'Acceptable', desc: '3-5 nến' },
      { score: 0, label: 'Poor', desc: '>6 nến (orders filled)' },
    ],
  },
  {
    id: 'freshness',
    name: 'Freshness',
    nameVi: 'Độ Tươi Mới',
    icon: Star,
    maxScore: 2,
    description: 'Số lần zone đã được test',
    scoring: [
      { score: 2, label: 'FTB', desc: 'Chưa test (First Time Back)' },
      { score: 1, label: 'Tested', desc: '1-2 lần test' },
      { score: 0, label: 'Stale', desc: '3+ lần test' },
    ],
  },
  {
    id: 'profitMargin',
    name: 'Profit Margin',
    nameVi: 'Biên Lợi Nhuận',
    icon: Target,
    maxScore: 2,
    description: 'Khoảng cách đến opposing zone',
    scoring: [
      { score: 2, label: 'Excellent', desc: '>4x zone width' },
      { score: 1, label: 'Good', desc: '2-4x zone width' },
      { score: 0, label: 'Poor', desc: '<2x zone width' },
    ],
  },
  {
    id: 'bigPicture',
    name: 'Big Picture',
    nameVi: 'Xu Hướng Lớn',
    icon: TrendingUp,
    maxScore: 2,
    description: 'Zone alignment với HTF trend',
    scoring: [
      { score: 2, label: 'Aligned', desc: 'Cùng hướng HTF trend' },
      { score: 1, label: 'Neutral', desc: 'HTF sideways' },
      { score: 0, label: 'Counter', desc: 'Ngược HTF trend' },
    ],
  },
  {
    id: 'zoneOrigin',
    name: 'Zone Origin',
    nameVi: 'Nguồn Gốc Zone',
    icon: Layers,
    maxScore: 2,
    description: 'Loại pattern tạo zone',
    scoring: [
      { score: 2, label: 'Premium', desc: 'Decision Point / QM' },
      { score: 1, label: 'Good', desc: 'FTR / Flag Limit' },
      { score: 0, label: 'Regular', desc: 'Zone thông thường' },
    ],
  },
  {
    id: 'arrivalSpeed',
    name: 'Arrival Speed',
    nameVi: 'Tốc Độ Tiếp Cận',
    icon: Timer,
    maxScore: 2,
    description: 'Cách giá tiếp cận zone',
    scoring: [
      { score: 2, label: 'Slow', desc: 'Compression/yếu dần' },
      { score: 1, label: 'Moderate', desc: 'Bình thường' },
      { score: 0, label: 'Fast', desc: 'Nhanh, mạnh (có thể break)' },
    ],
  },
  {
    id: 'riskReward',
    name: 'Risk:Reward',
    nameVi: 'Tỷ Lệ R:R',
    icon: Scale,
    maxScore: 2,
    description: 'Tỷ lệ lợi nhuận/rủi ro',
    scoring: [
      { score: 2, label: 'Excellent', desc: '>3:1' },
      { score: 1, label: 'Good', desc: '2-3:1' },
      { score: 0, label: 'Poor', desc: '<2:1' },
    ],
  },
];

/**
 * Grade thresholds
 */
const GRADE_THRESHOLDS = {
  'A+': { min: 14, max: 16, color: COLORS.gold, positionSize: '100%' },
  'A': { min: 12, max: 13, color: COLORS.success, positionSize: '75%' },
  'B': { min: 10, max: 11, color: COLORS.primary, positionSize: '50%' },
  'C': { min: 8, max: 9, color: COLORS.warning, positionSize: '25%' },
  'D': { min: 6, max: 7, color: COLORS.textMuted, positionSize: 'Skip' },
  'F': { min: 0, max: 5, color: COLORS.error, positionSize: 'Skip' },
};

const OddsAnalysisScreen = ({ navigation, route }) => {
  const { zone, symbol, timeframe } = route.params || {};
  const [expandedCriteria, setExpandedCriteria] = useState(null);

  const oddsResult = zone?.oddsResult || {};
  const totalScore = zone?.oddsScore || 0;
  const grade = zone?.oddsGrade || 'F';
  const gradeConfig = GRADE_THRESHOLDS[grade] || GRADE_THRESHOLDS['F'];

  const toggleCriteria = useCallback((id) => {
    setExpandedCriteria(prev => prev === id ? null : id);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Odds Enhancers</Text>
          <Text style={styles.headerSubtitle}>{symbol} - {timeframe}</Text>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Info size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <GradeBadge grade={grade} size="xl" />
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryScore}>
              {totalScore} / 16
            </Text>
            <Text style={styles.summaryLabel}>Total Score</Text>
            <View style={[styles.positionSizeBadge, { backgroundColor: gradeConfig.color + '20' }]}>
              <Text style={[styles.positionSizeText, { color: gradeConfig.color }]}>
                Position: {gradeConfig.positionSize}
              </Text>
            </View>
          </View>
        </View>

        {/* Score Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(totalScore / 16) * 100}%`,
                  backgroundColor: gradeConfig.color,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0</Text>
            <Text style={styles.progressLabel}>8 (C)</Text>
            <Text style={styles.progressLabel}>12 (A)</Text>
            <Text style={styles.progressLabel}>16</Text>
          </View>
        </View>

        {/* Criteria List */}
        <Text style={styles.sectionTitle}>8 Tiêu Chí Chấm Điểm</Text>
        {ODDS_CRITERIA.map((criteria) => {
          const score = oddsResult?.breakdown?.[criteria.id]?.score || 0;
          const IconComponent = criteria.icon;
          const isExpanded = expandedCriteria === criteria.id;

          return (
            <TouchableOpacity
              key={criteria.id}
              style={styles.criteriaCard}
              onPress={() => toggleCriteria(criteria.id)}
              activeOpacity={0.7}
            >
              {/* Criteria Header */}
              <View style={styles.criteriaHeader}>
                <View style={styles.criteriaLeft}>
                  <View style={[
                    styles.criteriaIcon,
                    { backgroundColor: score === 2 ? COLORS.success + '20' : score === 1 ? COLORS.warning + '20' : COLORS.bgDarkest }
                  ]}>
                    <IconComponent
                      size={18}
                      color={score === 2 ? COLORS.success : score === 1 ? COLORS.warning : COLORS.textMuted}
                    />
                  </View>
                  <View>
                    <Text style={styles.criteriaName}>{criteria.name}</Text>
                    <Text style={styles.criteriaNameVi}>{criteria.nameVi}</Text>
                  </View>
                </View>
                <View style={styles.criteriaRight}>
                  <View style={styles.scoreContainer}>
                    {[0, 1, 2].map((s) => (
                      <View
                        key={s}
                        style={[
                          styles.scoreDot,
                          s <= score && { backgroundColor: score === 2 ? COLORS.success : COLORS.warning }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[
                    styles.scoreText,
                    { color: score === 2 ? COLORS.success : score === 1 ? COLORS.warning : COLORS.textMuted }
                  ]}>
                    {score}/{criteria.maxScore}
                  </Text>
                </View>
              </View>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={styles.criteriaExpanded}>
                  <Text style={styles.criteriaDescription}>{criteria.description}</Text>
                  <View style={styles.scoringList}>
                    {criteria.scoring.map((s) => {
                      const isActive = score === s.score;
                      return (
                        <View
                          key={s.score}
                          style={[
                            styles.scoringItem,
                            isActive && styles.scoringItemActive,
                          ]}
                        >
                          {isActive ? (
                            <CheckCircle size={14} color={COLORS.success} />
                          ) : (
                            <XCircle size={14} color={COLORS.textMuted} />
                          )}
                          <Text style={[
                            styles.scoringLabel,
                            isActive && { color: COLORS.textPrimary, fontWeight: '600' }
                          ]}>
                            {s.score} - {s.label}
                          </Text>
                          <Text style={styles.scoringDesc}>{s.desc}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Grade Legend */}
        <View style={styles.legendSection}>
          <Text style={styles.sectionTitle}>Grade Legend</Text>
          <View style={styles.legendGrid}>
            {Object.entries(GRADE_THRESHOLDS).map(([g, config]) => (
              <View key={g} style={styles.legendItem}>
                <GradeBadge grade={g} size="sm" />
                <Text style={styles.legendRange}>{config.min}-{config.max}</Text>
                <Text style={[styles.legendPosition, { color: config.color }]}>
                  {config.positionSize}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Trading Recommendation */}
        <View style={[styles.recommendationCard, { borderColor: gradeConfig.color }]}>
          <View style={styles.recommendationHeader}>
            <AlertCircle size={18} color={gradeConfig.color} />
            <Text style={[styles.recommendationTitle, { color: gradeConfig.color }]}>
              Trading Recommendation
            </Text>
          </View>
          <Text style={styles.recommendationText}>
            {grade === 'A+' || grade === 'A'
              ? 'Zone chất lượng cao. Entry với confidence cao. Full hoặc 75% position size.'
              : grade === 'B'
              ? 'Zone OK. Entry với 50% position size. Đợi thêm confirmation nếu có thể.'
              : grade === 'C'
              ? 'Zone yếu. Chỉ entry nếu có confirmation mạnh. 25% position size hoặc skip.'
              : 'Zone không đủ chất lượng. Khuyến nghị SKIP trade này.'
            }
          </Text>
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
  infoButton: {
    padding: SPACING.sm,
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.md,
  },

  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLeft: {
    marginRight: SPACING.lg,
  },
  summaryRight: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryScore: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  positionSizeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  positionSizeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Progress Section
  progressSection: {
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },

  // Criteria Card
  criteriaCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  criteriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  criteriaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  criteriaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  criteriaName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  criteriaNameVi: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  criteriaRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.bgDarkest,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Expanded Content
  criteriaExpanded: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  criteriaDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  scoringList: {
    gap: SPACING.xs,
  },
  scoringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  scoringItemActive: {
    backgroundColor: COLORS.success + '10',
  },
  scoringLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    minWidth: 80,
  },
  scoringDesc: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Legend
  legendSection: {
    marginTop: SPACING.lg,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.glassBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  legendRange: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  legendPosition: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Recommendation
  recommendationCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default OddsAnalysisScreen;
