/**
 * TimelineItem.js
 * Timeline entry item component for Calendar Smart Journal
 * Renders different types: journal, trade, ritual, divination, goal_progress
 *
 * Created: January 28, 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Star,
  Target,
  Heart,
  Sun,
  Moon,
  Coffee,
  Pin,
  ChevronRight,
  Layers,
  Hexagon,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';
import { ENTRY_TYPES as JOURNAL_ENTRY_TYPES, MOODS as JOURNAL_MOODS } from '../../services/calendarJournalService';
import { TRADE_RESULTS, PATTERN_GRADES } from '../../services/tradingJournalService';

// Type configurations
const TYPE_CONFIG = {
  journal: {
    icon: BookOpen,
    color: COLORS.purple,
    label: 'Nhật ký',
  },
  journal_gratitude: {
    icon: Heart,
    color: COLORS.error,
    label: 'Biết ơn',
  },
  journal_goal_note: {
    icon: Target,
    color: COLORS.info,
    label: 'Ghi chú mục tiêu',
  },
  journal_quick_note: {
    icon: BookOpen,
    color: COLORS.textSecondary,
    label: 'Ghi nhanh',
  },
  trade: {
    icon: TrendingUp,
    color: COLORS.success,
    label: 'Giao dịch',
  },
  ritual: {
    icon: Sparkles,
    color: COLORS.gold,
    label: 'Ritual',
  },
  divination_tarot: {
    icon: Layers,
    color: COLORS.purple,
    label: 'Tarot',
  },
  divination_iching: {
    icon: Hexagon,
    color: COLORS.cyan,
    label: 'I Ching',
  },
  goal_progress: {
    icon: Target,
    color: COLORS.info,
    label: 'Tiến độ',
  },
  mood_morning: {
    icon: Sun,
    color: COLORS.gold,
    label: 'Sáng',
  },
  mood_midday: {
    icon: Coffee,
    color: COLORS.cyan,
    label: 'Trưa',
  },
  mood_evening: {
    icon: Moon,
    color: COLORS.purple,
    label: 'Tối',
  },
};

/**
 * Get trade result color
 */
const getTradeResultColor = (result) => {
  switch (result) {
    case TRADE_RESULTS.WIN:
      return COLORS.success;
    case TRADE_RESULTS.LOSS:
      return COLORS.error;
    case TRADE_RESULTS.BREAKEVEN:
      return COLORS.textMuted;
    default:
      return COLORS.textSecondary;
  }
};

/**
 * Get pattern grade color
 */
const getPatternGradeColor = (grade) => {
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
 * Format time from ISO string
 */
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

/**
 * TimelineItem Component
 */
const TimelineItem = ({
  item,
  onPress,
  showTime = true,
  compact = false,
}) => {
  if (!item) return null;

  // Determine item type
  const getItemType = () => {
    if (item.type === 'journal') {
      if (item.entry_type === JOURNAL_ENTRY_TYPES.GRATITUDE) return 'journal_gratitude';
      if (item.entry_type === JOURNAL_ENTRY_TYPES.GOAL_NOTE) return 'journal_goal_note';
      if (item.entry_type === JOURNAL_ENTRY_TYPES.QUICK_NOTE) return 'journal_quick_note';
      return 'journal';
    }
    if (item.type === 'trade') return 'trade';
    if (item.type === 'ritual') return 'ritual';
    if (item.type === 'divination') {
      return item.divination_type === 'tarot' ? 'divination_tarot' : 'divination_iching';
    }
    if (item.type === 'goal_progress') return 'goal_progress';
    if (item.type === 'mood') {
      if (item.check_in_type === 'morning') return 'mood_morning';
      if (item.check_in_type === 'midday') return 'mood_midday';
      return 'mood_evening';
    }
    return 'journal';
  };

  const itemType = getItemType();
  const config = TYPE_CONFIG[itemType] || TYPE_CONFIG.journal;
  const IconComponent = config.icon;

  // Get time
  const time = formatTime(item.created_at || item.completed_at || item.timestamp);

  // Render based on type
  const renderContent = () => {
    switch (item.type) {
      case 'journal':
        return renderJournalContent();
      case 'trade':
        return renderTradeContent();
      case 'ritual':
        return renderRitualContent();
      case 'divination':
        return renderDivinationContent();
      case 'goal_progress':
        return renderGoalProgressContent();
      case 'mood':
        return renderMoodContent();
      default:
        return renderJournalContent();
    }
  };

  // Journal content
  const renderJournalContent = () => (
    <View style={styles.textContent}>
      {item.title && (
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
      )}
      {item.content && (
        <Text style={styles.preview} numberOfLines={compact ? 1 : 2}>
          {item.content}
        </Text>
      )}
      {item.is_pinned && (
        <View style={styles.pinnedBadge}>
          <Pin size={10} color={COLORS.gold} />
        </View>
      )}
    </View>
  );

  // Trade content
  const renderTradeContent = () => {
    const pnlColor = getTradeResultColor(item.trade_result);
    const gradeColor = getPatternGradeColor(item.pattern_grade);

    return (
      <View style={styles.textContent}>
        <View style={styles.tradeHeader}>
          <Text style={styles.tradeSymbol}>{item.symbol}</Text>
          <View
            style={[
              styles.tradeBadge,
              { backgroundColor: item.direction === 'long' ? COLORS.success + '20' : COLORS.error + '20' },
            ]}
          >
            <Text
              style={[
                styles.tradeBadgeText,
                { color: item.direction === 'long' ? COLORS.success : COLORS.error },
              ]}
            >
              {item.direction === 'long' ? 'LONG' : 'SHORT'}
            </Text>
          </View>
          {item.pattern_grade && (
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '20' }]}>
              <Text style={[styles.gradeBadgeText, { color: gradeColor }]}>
                {item.pattern_grade}
              </Text>
            </View>
          )}
        </View>

        {item.pnl_percent !== null && item.pnl_percent !== undefined && (
          <Text style={[styles.tradePnL, { color: pnlColor }]}>
            {item.pnl_percent >= 0 ? '+' : ''}{item.pnl_percent.toFixed(2)}%
          </Text>
        )}

        {item.pattern_type && !compact && (
          <Text style={styles.tradePattern}>{item.pattern_type}</Text>
        )}
      </View>
    );
  };

  // Ritual content
  const renderRitualContent = () => (
    <View style={styles.textContent}>
      <Text style={styles.title} numberOfLines={1}>
        {item.ritual_name || item.name}
      </Text>
      {item.xp_earned > 0 && (
        <Text style={styles.xpEarned}>+{item.xp_earned} XP</Text>
      )}
    </View>
  );

  // Divination content
  const renderDivinationContent = () => (
    <View style={styles.textContent}>
      <Text style={styles.title} numberOfLines={1}>
        {item.result_summary || (item.divination_type === 'tarot' ? 'Trải bài Tarot' : 'Gieo quẻ I Ching')}
      </Text>
      {item.question && (
        <Text style={styles.preview} numberOfLines={1}>
          Q: {item.question}
        </Text>
      )}
    </View>
  );

  // Goal progress content
  const renderGoalProgressContent = () => (
    <View style={styles.textContent}>
      <Text style={styles.title} numberOfLines={1}>
        {item.goal_name}
      </Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBarSmall}>
          <View
            style={[
              styles.progressFillSmall,
              { width: `${item.progress_percent || 0}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{item.progress_percent || 0}%</Text>
      </View>
      {item.note && !compact && (
        <Text style={styles.preview} numberOfLines={1}>
          {item.note}
        </Text>
      )}
    </View>
  );

  // Mood content
  const renderMoodContent = () => {
    const moodData = JOURNAL_MOODS[item.mood?.toUpperCase?.()] || null;

    return (
      <View style={styles.textContent}>
        <View style={styles.moodRow}>
          {moodData && (
            <View style={[styles.moodBadge, { backgroundColor: moodData.color + '20' }]}>
              <Text style={[styles.moodBadgeText, { color: moodData.color }]}>
                {moodData.label}
              </Text>
            </View>
          )}
          {item.energy && (
            <Text style={styles.moodDetail}>Năng lượng: {item.energy}/5</Text>
          )}
        </View>
        {item.note && (
          <Text style={styles.preview} numberOfLines={1}>
            {item.note}
          </Text>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.containerCompact]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Time column */}
      {showTime && (
        <View style={styles.timeColumn}>
          <Text style={styles.time}>{time}</Text>
        </View>
      )}

      {/* Timeline indicator */}
      <View style={styles.indicatorColumn}>
        <View style={[styles.dot, { backgroundColor: config.color }]}>
          <IconComponent size={12} color={COLORS.bgDarkest} />
        </View>
        <View style={styles.line} />
      </View>

      {/* Content */}
      <View style={styles.contentColumn}>
        <View style={styles.typeRow}>
          <Text style={[styles.typeLabel, { color: config.color }]}>
            {config.label}
          </Text>
        </View>

        {renderContent()}

        {onPress && (
          <ChevronRight
            size={16}
            color={COLORS.textMuted}
            style={styles.chevron}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * TimelineHeader - Section header for timeline
 */
export const TimelineHeader = ({ title, count, icon: IconComponent, color }) => (
  <View style={styles.headerContainer}>
    {IconComponent && (
      <View style={[styles.headerIcon, { backgroundColor: color + '20' }]}>
        <IconComponent size={14} color={color} />
      </View>
    )}
    <Text style={styles.headerTitle}>{title}</Text>
    {count !== undefined && (
      <View style={styles.headerCount}>
        <Text style={styles.headerCountText}>{count}</Text>
      </View>
    )}
  </View>
);

/**
 * EmptyTimeline - Empty state for timeline
 */
export const EmptyTimeline = ({ message = 'Chưa có hoạt động nào' }) => (
  <View style={styles.emptyContainer}>
    <BookOpen size={32} color={COLORS.textMuted} />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  containerCompact: {
    paddingVertical: SPACING.xs,
  },
  timeColumn: {
    width: 45,
    alignItems: 'flex-end',
    paddingRight: SPACING.sm,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  indicatorColumn: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 4,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  typeRow: {
    marginBottom: SPACING.xxs,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  preview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.4,
  },
  pinnedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  chevron: {
    position: 'absolute',
    right: SPACING.xs,
    top: '50%',
    marginTop: -8,
  },

  // Trade styles
  tradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 2,
  },
  tradeSymbol: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  tradeBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  tradeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  gradeBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  gradeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  tradePnL: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  tradePattern: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Ritual styles
  xpEarned: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Goal progress styles
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginVertical: 4,
  },
  progressBarSmall: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: COLORS.info,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.info,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Mood styles
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  moodBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  moodBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  moodDetail: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Header styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  headerCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  headerCountText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Empty styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
});

export default TimelineItem;
