/**
 * StreakHistoryModal Component
 * Vision Board Gamification - Streak History & Stats
 *
 * Features:
 * - Current and longest streak display
 * - All streak types list
 * - Streak freeze status
 * - Use freeze button
 *
 * Design: Liquid Glass theme, dark mode
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Flame,
  Award,
  Snowflake,
  Sparkles,
  ListChecks,
  Target,
  X,
  Calendar,
  TrendingUp,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Streak type configurations
const STREAK_TYPES = {
  combo: {
    label: 'Full Combo',
    icon: Flame,
    color: COLORS.gold,
    description: 'Hoàn thành cả 3 mục mỗi ngày',
  },
  affirmation: {
    label: 'Khẳng định',
    icon: Sparkles,
    color: COLORS.purple,
    description: 'Đọc affirmation hàng ngày',
  },
  habit: {
    label: 'Thói quen',
    icon: ListChecks,
    color: COLORS.cyan,
    description: 'Hoàn thành checklist',
  },
  goal: {
    label: 'Mục tiêu',
    icon: Target,
    color: COLORS.success,
    description: 'Check-in mục tiêu',
  },
};

// Streak item component
const StreakItem = memo(({ type, data }) => {
  const config = STREAK_TYPES[type] || STREAK_TYPES.combo;
  const IconComponent = config.icon;

  return (
    <View style={styles.streakItem}>
      <View style={[styles.streakIcon, { borderColor: config.color }]}>
        <IconComponent size={20} color={config.color} />
      </View>
      <View style={styles.streakInfo}>
        <Text style={styles.streakLabel}>{config.label}</Text>
        <Text style={styles.streakDescription}>{config.description}</Text>
      </View>
      <View style={styles.streakStats}>
        <Text style={[styles.streakValue, { color: config.color }]}>
          {data?.currentStreak || 0}
        </Text>
        <Text style={styles.streakSubtext}>ngày</Text>
      </View>
    </View>
  );
});

// Stat card component
const StatCard = memo(({ icon: Icon, label, value, color, subtext }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
  </View>
));

const StreakHistoryModal = memo(({
  visible,
  onClose,
  streakData = {},
  freezeCount = 0,
  onUseFreeze,
}) => {
  const comboStreak = streakData.combo || {};

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['rgba(15, 16, 48, 0.98)', 'rgba(15, 16, 48, 0.95)']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Lịch sử Streak</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Main stats cards */}
              <View style={styles.statsRow}>
                <StatCard
                  icon={Flame}
                  label="Hiện tại"
                  value={comboStreak.currentStreak || 0}
                  color={COLORS.gold}
                />
                <StatCard
                  icon={Award}
                  label="Kỷ lục"
                  value={comboStreak.longestStreak || 0}
                  color={COLORS.purple}
                />
                <StatCard
                  icon={Calendar}
                  label="Tổng ngày"
                  value={comboStreak.totalCompletions || 0}
                  color={COLORS.cyan}
                />
              </View>

              {/* Freeze section */}
              <View style={styles.freezeSection}>
                <View style={styles.freezeInfo}>
                  <Snowflake size={24} color={COLORS.cyan} />
                  <View style={styles.freezeText}>
                    <Text style={styles.freezeTitle}>
                      Streak Freeze: {freezeCount}
                    </Text>
                    <Text style={styles.freezeDescription}>
                      Bảo vệ streak khi bạn nghỉ 1 ngày
                    </Text>
                  </View>
                </View>
                {freezeCount > 0 && (
                  <TouchableOpacity
                    style={styles.freezeButton}
                    onPress={onUseFreeze}
                  >
                    <Text style={styles.freezeButtonText}>Sử dụng</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Streak types list */}
              <View style={styles.streaksList}>
                <Text style={styles.sectionTitle}>Chi tiết từng loại</Text>
                {Object.entries(STREAK_TYPES).map(([type, _]) => (
                  <StreakItem
                    key={type}
                    type={type}
                    data={streakData[type]}
                  />
                ))}
              </View>

              {/* Tips section */}
              <View style={styles.tipsSection}>
                <View style={styles.tipItem}>
                  <TrendingUp size={16} color={COLORS.success} />
                  <Text style={styles.tipText}>
                    Full combo (3/3) tăng streak nhanh hơn
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Snowflake size={16} color={COLORS.cyan} />
                  <Text style={styles.tipText}>
                    Đạt 7 ngày streak để nhận Freeze miễn phí
                  </Text>
                </View>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.huge + 20, // Extra for safe area
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  // Content
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  contentContainer: {
    paddingBottom: 300, // Extra space for bottom tab bar + safe area
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  statSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Freeze section
  freezeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.cyan + '15',
    borderRadius: 12,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cyan + '30',
  },
  freezeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  freezeText: {
    flex: 1,
  },
  freezeTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  freezeDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  freezeButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.cyan,
    borderRadius: 8,
  },
  freezeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#000',
  },

  // Streaks list
  streaksList: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  streakIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  streakInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  streakDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  streakStats: {
    alignItems: 'flex-end',
  },
  streakValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  streakSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Tips section
  tipsSection: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    gap: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
});

export default StreakHistoryModal;
