/**
 * KarmaHistoryItem - Single item in karma history list
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Book,
  Brain,
  Users,
  AlertTriangle,
  Clock,
  Flame,
  Target,
  Medal,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';

const KarmaHistoryItem = ({
  item = {},
  style,
}) => {
  const {
    change_amount = 0,
    action_type = '',
    action_detail = '',
    created_at = '',
    level_changed = false,
    old_level = '',
    new_level = '',
  } = item;

  const isPositive = change_amount > 0;

  // Get icon based on action type
  const getIcon = () => {
    const iconProps = {
      size: 18,
      strokeWidth: 2,
      color: isPositive ? COLORS.success : COLORS.error,
    };

    const category = action_type?.split('_')[0] || '';

    // Trading actions
    if (action_type?.includes('discipline') || action_type?.includes('trade')) {
      return <Target {...iconProps} />;
    }
    if (action_type?.includes('fomo') || action_type?.includes('revenge')) {
      return <AlertTriangle {...iconProps} />;
    }
    if (action_type?.includes('streak')) {
      return <Flame {...iconProps} />;
    }

    // Learning actions
    if (category === 'lesson' || category === 'module' || category === 'quiz' || category === 'course') {
      return <Book {...iconProps} />;
    }

    // Wellness actions
    if (category === 'meditation' || category === 'journal' || category === 'tarot' || category === 'iching') {
      return <Brain {...iconProps} />;
    }

    // Social actions
    if (category === 'refer' || category === 'helpful' || category === 'quality') {
      return <Users {...iconProps} />;
    }

    // Inactivity
    if (action_type?.includes('inactive')) {
      return <Clock {...iconProps} />;
    }

    // Level change
    if (level_changed) {
      return <Medal {...iconProps} />;
    }

    // Default based on positive/negative
    return isPositive ? <TrendingUp {...iconProps} /> : <TrendingDown {...iconProps} />;
  };

  // Get action label
  const getActionLabel = () => {
    // Use action_detail if available
    if (action_detail) return action_detail;

    // Map action types to labels
    const labels = {
      trade_discipline_win: 'Win trade đúng kỷ luật',
      trade_discipline_loss: 'Thua đúng kỷ luật',
      fomo_trade: 'FOMO trade',
      revenge_trade: 'Revenge trade',
      no_stoploss: 'Trade không Stoploss',
      sl_moved_wider: 'Dời Stoploss ra xa',
      lesson_complete: 'Hoàn thành lesson',
      module_complete: 'Hoàn thành module',
      course_complete: 'Hoàn thành khóa học',
      quiz_perfect: 'Quiz đạt 100%',
      quiz_pass: 'Quiz đạt >= 80%',
      meditation: 'Nghe bài thiền',
      journal_entry: 'Viết trading journal',
      weekly_review: 'Review tuần',
      tarot_reading: 'Đọc bài Tarot',
      iching_reading: 'Bói quẻ Kinh Dịch',
      refer_signup: 'Giới thiệu bạn đăng ký',
      refer_subscribe: 'Bạn giới thiệu mua gói',
      inactive_3_days: 'Không hoạt động 3 ngày',
      inactive_7_days: 'Không hoạt động 7 ngày',
      streak_break: 'Mất chuỗi kỷ luật',
      win_streak_3: 'Chuỗi kỷ luật 3 ngày',
      win_streak_7: 'Chuỗi kỷ luật 7 ngày',
    };

    return labels[action_type] || action_type?.replace(/_/g, ' ') || 'Thay đổi Karma';
  };

  // Get relative time
  const getRelativeTime = () => {
    if (!created_at) return '';

    const date = new Date(created_at);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: isPositive ? COLORS.success : COLORS.error },
        style,
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isPositive ? 'rgba(58, 247, 166, 0.15)' : 'rgba(255, 107, 107, 0.15)' },
        ]}
      >
        {getIcon()}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.label} numberOfLines={1}>
          {getActionLabel()}
        </Text>
        <Text style={styles.time}>{getRelativeTime()}</Text>

        {/* Level change indicator */}
        {level_changed && (
          <View style={styles.levelChange}>
            <Text style={styles.levelChangeText}>
              {old_level} → {new_level}
            </Text>
          </View>
        )}
      </View>

      {/* Karma change */}
      <View style={styles.changeContainer}>
        <Text
          style={[
            styles.changeValue,
            { color: isPositive ? COLORS.success : COLORS.error },
          ]}
        >
          {isPositive ? '+' : ''}{change_amount}
        </Text>
        <Text style={styles.changeLabel}>Karma</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
  levelChange: {
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  levelChangeText: {
    color: '#8B5CF6',
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  changeValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  changeLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
});

export default KarmaHistoryItem;
