/**
 * TradingEntryCard.js
 * Trading journal entry card display component
 *
 * Created: January 28, 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  ChevronRight,
  Shield,
  Target,
  Award,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, GLASS } from '../../theme';
import {
  TRADE_DIRECTIONS,
  TRADE_RESULTS,
  PATTERN_GRADES,
  calculateDisciplineScore,
} from '../../services/tradingJournalService';

/**
 * Get trade result color
 */
const getResultColor = (result) => {
  switch (result) {
    case TRADE_RESULTS.WIN:
      return COLORS.success;
    case TRADE_RESULTS.LOSS:
      return COLORS.error;
    case TRADE_RESULTS.BREAKEVEN:
      return COLORS.textMuted;
    default:
      return COLORS.cyan; // Open trade
  }
};

/**
 * Get pattern grade color
 */
const getGradeColor = (grade) => {
  switch (grade) {
    case PATTERN_GRADES.A_PLUS:
    case PATTERN_GRADES.A:
      return COLORS.success;
    case PATTERN_GRADES.B:
      return COLORS.gold;
    case PATTERN_GRADES.C:
      return COLORS.warning;
    case PATTERN_GRADES.D:
    case PATTERN_GRADES.F:
      return COLORS.error;
    default:
      return COLORS.textMuted;
  }
};

/**
 * Get discipline color
 */
const getDisciplineColor = (score) => {
  if (score >= 90) return COLORS.success;
  if (score >= 70) return COLORS.gold;
  if (score >= 50) return COLORS.warning;
  return COLORS.error;
};

/**
 * Format date
 */
const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
};

/**
 * Format time
 */
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * TradingEntryCard Component
 */
const TradingEntryCard = ({
  entry,
  onPress,
  compact = false,
  showDate = false,
}) => {
  if (!entry) return null;

  const isLong = entry.direction === TRADE_DIRECTIONS.LONG;
  const directionColor = isLong ? COLORS.success : COLORS.error;
  const resultColor = getResultColor(entry.trade_result);
  const gradeColor = getGradeColor(entry.pattern_grade);
  const disciplineScore = entry.discipline_score || calculateDisciplineScore(entry.discipline_checklist || {});
  const disciplineColor = getDisciplineColor(disciplineScore);

  const isOpen = entry.trade_result === TRADE_RESULTS.OPEN;
  const hasScreenshots = entry.screenshots?.length > 0;

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { borderLeftColor: resultColor },
        ]}
        onPress={() => onPress?.(entry)}
        activeOpacity={0.7}
      >
        <View style={styles.compactMain}>
          {/* Symbol and direction */}
          <View style={styles.compactHeader}>
            <Text style={styles.compactSymbol}>{entry.symbol}</Text>
            <View style={[styles.directionBadge, { backgroundColor: directionColor + '20' }]}>
              <Text style={[styles.directionText, { color: directionColor }]}>
                {isLong ? 'LONG' : 'SHORT'}
              </Text>
            </View>
          </View>

          {/* P/L */}
          {entry.pnl_percent !== null && entry.pnl_percent !== undefined && (
            <Text style={[styles.compactPnL, { color: resultColor }]}>
              {entry.pnl_percent >= 0 ? '+' : ''}{entry.pnl_percent.toFixed(2)}%
            </Text>
          )}

          {isOpen && (
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>OPEN</Text>
            )}
            </View>
          )}
        </View>

        {/* Grade and discipline */}
        <View style={styles.compactMeta}>
          {entry.pattern_grade && (
            <View style={[styles.gradeBadgeSmall, { backgroundColor: gradeColor + '20' }]}>
              <Text style={[styles.gradeBadgeTextSmall, { color: gradeColor }]}>
                {entry.pattern_grade}
              </Text>
            )}
            </View>
          )}
          <Text style={[styles.compactDiscipline, { color: disciplineColor }]}>
            {disciplineScore}%
          </Text>
        </View>

        <ChevronRight size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: resultColor }]}
      onPress={() => onPress?.(entry)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Symbol */}
          <Text style={styles.symbol}>{entry.symbol}</Text>

          {/* Direction badge */}
          <View style={[styles.directionBadgeLarge, { backgroundColor: directionColor + '20' }]}>
            {isLong ? (
              <TrendingUp size={14} color={directionColor} />
            ) : (
              <TrendingDown size={14} color={directionColor} />
            )}
            <Text style={[styles.directionTextLarge, { color: directionColor }]}>
              {isLong ? 'LONG' : 'SHORT'}
            </Text>
          </View>

          {/* Pattern grade */}
          {entry.pattern_grade && (
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '20' }]}>
              <Award size={12} color={gradeColor} />
              <Text style={[styles.gradeBadgeText, { color: gradeColor }]}>
                {entry.pattern_grade}
              </Text>
            </View>
          )}
        </View>

        {/* Result/Status */}
        {isOpen ? (
          <View style={styles.openBadgeLarge}>
            <Text style={styles.openBadgeLargeText}>OPEN</Text>
          )}
          </View>
        ) : (
          entry.trade_result && (
            <View style={[styles.resultBadge, { backgroundColor: resultColor + '20' }]}>
              <Text style={[styles.resultBadgeText, { color: resultColor }]}>
                {entry.trade_result === TRADE_RESULTS.WIN ? 'WIN' :
                 entry.trade_result === TRADE_RESULTS.LOSS ? 'LOSS' : 'BE'}
              </Text>
            )}
            </View>
          )
        )}
      </View>

      {/* P/L Display */}
      {entry.pnl_percent !== null && entry.pnl_percent !== undefined && (
        <View style={styles.pnlContainer}>
          <Text style={[styles.pnlValue, { color: resultColor }]}>
            {entry.pnl_percent >= 0 ? '+' : ''}{entry.pnl_percent.toFixed(2)}%
          </Text>
          {entry.pnl_amount !== null && (
            <Text style={[styles.pnlAmount, { color: resultColor }]}>
              {entry.pnl_amount >= 0 ? '+' : ''}{entry.pnl_amount.toFixed(2)} USDT
            </Text>
          )}
        </View>
      )}

      {/* Pattern info */}
      {entry.pattern_type && (
        <View style={styles.patternRow}>
          <Target size={14} color={COLORS.purple} />
          <Text style={styles.patternText}>{entry.pattern_type}</Text>
          {entry.timeframe && (
            <Text style={styles.timeframeText}>{entry.timeframe}</Text>
          )}
        </View>
      )}

      {/* Prices */}
      <View style={styles.pricesRow}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Entry</Text>
          <Text style={styles.priceValue}>{entry.entry_price?.toFixed(4) || '-'}</Text>
        </View>
        {entry.exit_price && (
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Exit</Text>
          )}
            <Text style={styles.priceValue}>{entry.exit_price.toFixed(4)}</Text>
          </View>
        )}
        {entry.stop_loss && (
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>SL</Text>
          )}
            <Text style={[styles.priceValue, { color: COLORS.error }]}>
              {entry.stop_loss.toFixed(4)}
            </Text>
          </View>
        )}
        {entry.risk_reward_ratio && (
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>R:R</Text>
          )}
            <Text style={[styles.priceValue, { color: COLORS.gold }]}>
              1:{entry.risk_reward_ratio.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Discipline score */}
      <View style={styles.disciplineRow}>
        <View style={styles.disciplineLeft}>
          <Shield size={14} color={disciplineColor} />
          <Text style={styles.disciplineLabel}>Ky luat</Text>
        </View>
        <View style={styles.disciplineBar}>
          <View
            style={[
              styles.disciplineFill,
              { width: `${disciplineScore}%`, backgroundColor: disciplineColor },
            ]}
          />
        </View>
        <Text style={[styles.disciplineScore, { color: disciplineColor }]}>
          {disciplineScore}%
        </Text>
      </View>

      {/* Screenshots preview */}
      {hasScreenshots && (
        <View style={styles.screenshotsRow}>
          <ImageIcon size={14} color={COLORS.textMuted} />
          <Text style={styles.screenshotsText}>
            {entry.screenshots.length} anh chup
          </Text>
        )}
        </View>
      )}

      {/* Notes preview */}
      {entry.entry_reason && (
        <Text style={styles.notesPreview} numberOfLines={2}>
          {entry.entry_reason}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {showDate && (
            <View style={styles.footerItem}>
              <Calendar size={12} color={COLORS.textMuted} />
              <Text style={styles.footerText}>{formatDate(entry.trade_date)}</Text>
            </View>
          )}
          <View style={styles.footerItem}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.footerText}>{formatTime(entry.created_at)}</Text>
          </View>
        </View>

        {/* Ratings */}
        {entry.setup_rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>Setup: {entry.setup_rating}/5</Text>
          </View>
        )}
      </View>

      {/* Warning for low discipline */}
      {disciplineScore < 50 && !isOpen && (
        <View style={styles.warningBanner}>
          <AlertTriangle size={12} color={COLORS.warning} />
          <Text style={styles.warningText}>Diem ky luat thap</Text>
        )}
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * TradingStatCard - Summary stats card
 */
export const TradingStatCard = ({
  stats = {},
  onPress,
  title = 'Thong ke giao dich',
}) => {
  const {
    totalTrades = 0,
    wins = 0,
    losses = 0,
    breakeven = 0,
    winRate = 0,
    totalPnL = 0,
    avgPnL = 0,
    avgDiscipline = 0,
    bestTrade = null,
    worstTrade = null,
  } = stats;

  return (
    <TouchableOpacity
      style={styles.statsContainer}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <Text style={styles.statsTitle}>{title}</Text>

      <View style={styles.statsGrid}>
        {/* Total trades */}
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalTrades}</Text>
          <Text style={styles.statLabel}>Tong lenh</Text>
        </View>

        {/* Win rate */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: winRate >= 50 ? COLORS.success : COLORS.error }]}>
            {winRate.toFixed(0)}%
          </Text>
          <Text style={styles.statLabel}>Win rate</Text>
        </View>

        {/* P/L */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: totalPnL >= 0 ? COLORS.success : COLORS.error }]}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Tong P/L</Text>
        </View>

        {/* Discipline */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getDisciplineColor(avgDiscipline) }]}>
            {avgDiscipline.toFixed(0)}%
          </Text>
          <Text style={styles.statLabel}>Ky luat</Text>
        </View>
      </View>

      {/* W/L breakdown */}
      <View style={styles.wlRow}>
        <View style={[styles.wlItem, { backgroundColor: COLORS.success + '15' }]}>
          <Text style={[styles.wlValue, { color: COLORS.success }]}>{wins}</Text>
          <Text style={styles.wlLabel}>Win</Text>
        </View>
        <View style={[styles.wlItem, { backgroundColor: COLORS.error + '15' }]}>
          <Text style={[styles.wlValue, { color: COLORS.error }]}>{losses}</Text>
          <Text style={styles.wlLabel}>Loss</Text>
        </View>
        <View style={[styles.wlItem, { backgroundColor: COLORS.textMuted + '15' }]}>
          <Text style={[styles.wlValue, { color: COLORS.textMuted }]}>{breakeven}</Text>
          <Text style={styles.wlLabel}>BE</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * EmptyTradingState - Empty state for trading section
 */
export const EmptyTradingState = ({ onAddTrade }) => (
  <View style={styles.emptyContainer}>
    <TrendingUp size={40} color={COLORS.textMuted} />
    <Text style={styles.emptyTitle}>Chua co giao dich</Text>
    <Text style={styles.emptyText}>Ghi lai giao dich dau tien cua ban</Text>
    {onAddTrade && (
      <TouchableOpacity style={styles.emptyButton} onPress={onAddTrade}>
        <Text style={styles.emptyButtonText}>Them giao dich</Text>
      )}
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  symbol: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  directionBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  directionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  directionBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xxs,
  },
  directionTextLarge: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xxs,
  },
  gradeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  openBadgeLarge: {
    backgroundColor: COLORS.cyan + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  openBadgeLargeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  resultBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  resultBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  pnlContainer: {
    marginBottom: SPACING.md,
  },
  pnlValue: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  pnlAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: 2,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  patternText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  timeframeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
  pricesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BORDER_RADIUS.md,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  disciplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  disciplineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    width: 70,
  },
  disciplineLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  disciplineBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  disciplineFill: {
    height: '100%',
    borderRadius: 3,
  },
  disciplineScore: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    width: 40,
    textAlign: 'right',
  },
  screenshotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  screenshotsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  notesPreview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.warning + '15',
    borderRadius: BORDER_RADIUS.sm,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    gap: SPACING.sm,
  },
  compactMain: {
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  compactSymbol: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  compactPnL: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: 2,
  },
  openBadge: {
    backgroundColor: COLORS.cyan + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  openBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gradeBadgeSmall: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  gradeBadgeTextSmall: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  compactDiscipline: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Stats styles
  statsContainer: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  wlRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  wlItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  wlValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  wlLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Empty styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  emptyButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
});

export default TradingEntryCard;
