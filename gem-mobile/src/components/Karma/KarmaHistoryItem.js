/**
 * KarmaHistoryItem - Single item in karma history list
 */

import React, { useMemo } from 'react';
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
import { useSettings } from '../../contexts/SettingsContext';

const KarmaHistoryItem = ({
  item = {},
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

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
      color: isPositive ? colors.success : colors.error,
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

    // Map action types to labels - AI Su Phu tone
    const labels = {
      trade_discipline_win: 'Thang co ky luat',
      trade_discipline_loss: 'Thua co ky luat - dung duong',
      fomo_trade: 'FOMO - thieu kien nhan',
      revenge_trade: 'Revenge trade - tam loan',
      no_stoploss: 'Trade khong SL - lieu linh',
      sl_moved_wider: 'Doi SL ra xa - pha luat',
      lesson_complete: 'Hoan thanh bai hoc',
      module_complete: 'Hoan thanh module',
      course_complete: 'Hoan thanh khoa hoc',
      quiz_perfect: 'Quiz 100% - xuat sac',
      quiz_pass: 'Quiz dat >= 80%',
      meditation: 'Thien dinh',
      journal_entry: 'Nhat ky giao dich',
      weekly_review: 'Review tuan',
      tarot_reading: 'Boi Tarot',
      iching_reading: 'Boi Kinh Dich',
      refer_signup: 'Gioi thieu thanh vien moi',
      refer_subscribe: 'Gioi thieu mua goi',
      inactive_3_days: 'Bo be luyen tap 3 ngay',
      inactive_7_days: 'Bo be luyen tap 7 ngay',
      streak_break: 'Pha vo chuoi ky luat',
      win_streak_3: 'Ky luat 3 ngay lien tiep',
      win_streak_7: 'Ky luat 7 ngay lien tiep',
    };

    return labels[action_type] || action_type?.replace(/_/g, ' ') || 'Thay doi Karma';
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

    if (diffMins < 1) return 'Vua xong';
    if (diffMins < 60) return `${diffMins} phut truoc`;
    if (diffHours < 24) return `${diffHours} gio truoc`;
    if (diffDays < 7) return `${diffDays} ngay truoc`;

    return date.toLocaleDateString('vi-VN');
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.5)'),
      borderRadius: SPACING.md,
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
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: '500',
      marginBottom: 2,
    },
    time: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.sizes.xs,
    },
    levelChange: {
      marginTop: SPACING.xs,
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: SPACING.sm,
      alignSelf: 'flex-start',
    },
    levelChangeText: {
      color: '#8B5CF6',
      fontSize: TYPOGRAPHY.sizes.xs,
      fontWeight: '600',
    },
    changeContainer: {
      alignItems: 'flex-end',
    },
    changeValue: {
      fontSize: TYPOGRAPHY.sizes.lg,
      fontWeight: '700',
    },
    changeLabel: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.sizes.xs,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: isPositive ? colors.success : colors.error },
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
            { color: isPositive ? colors.success : colors.error },
          ]}
        >
          {isPositive ? '+' : ''}{change_amount}
        </Text>
        <Text style={styles.changeLabel}>Karma</Text>
      </View>
    </View>
  );
};

export default KarmaHistoryItem;
