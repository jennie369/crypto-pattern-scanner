// =====================================================
// DAILY CHECK-IN SCREEN
// Điểm danh hàng ngày nhận 5 Gems + Streak Bonus
// =====================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Gem,
  Flame,
  Gift,
  CheckCircle,
  Star,
  Clock,
  Trophy,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import gemEconomyService from '../../services/gemEconomyService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const DailyCheckinScreen = () => {
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // ========== STATE ==========
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);

  // Animation
  const scaleValue = useRef(new Animated.Value(1)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;

  // ========== EFFECTS ==========
  useEffect(() => {
    loadCheckinStatus();
  }, []);

  // Pulse animation cho nút check-in
  useEffect(() => {
    if (!status?.checked_today && !loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status?.checked_today, loading]);

  // ========== DATA LOADING ==========
  const loadCheckinStatus = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await gemEconomyService.getCheckinStatus(user.id);
      setStatus(data);
    } catch (err) {
      console.error('[DailyCheckin] Load error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ========== HANDLERS ==========
  const handleCheckin = useCallback(async () => {
    if (!user?.id || status?.checked_today || checking) return;

    setChecking(true);

    try {
      const result = await gemEconomyService.performDailyCheckin(user.id);

      if (result?.success) {
        setCheckinResult(result);
        setShowSuccess(true);

        // Bounce animation
        Animated.sequence([
          Animated.timing(bounceValue, {
            toValue: -30,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bounceValue, {
            toValue: 0,
            duration: 400,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]).start();

        // Reload status
        await loadCheckinStatus();
      } else {
        alert({ type: 'warning', title: 'Thông báo', message: result?.message || 'Không thể điểm danh' });
      }
    } catch (err) {
      console.error('[DailyCheckin] Checkin error:', err);
      alert({ type: 'error', title: 'Lỗi', message: err.message || 'Không thể điểm danh. Vui lòng thử lại.' });
    } finally {
      setChecking(false);
    }
  }, [user?.id, status?.checked_today, checking, loadCheckinStatus, alert]);

  // ========== RENDER HELPERS ==========
  const getDayName = (dateStr) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    try {
      return days[new Date(dateStr).getDay()];
    } catch {
      return '';
    }
  };

  // ========== RENDER: Streak Card ==========
  const renderStreakCard = () => (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <View style={styles.streakIconContainer}>
          <Flame size={28} color={COLORS.gold} />
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakLabel}>Streak hiện tại</Text>
          <Text style={styles.streakValue}>
            {status?.current_streak || 0} ngày
          </Text>
        </View>
      </View>

      <View style={styles.streakStats}>
        <View style={styles.statItem}>
          <Trophy size={16} color={COLORS.gold} />
          <Text style={styles.statLabel}>Kỷ lục</Text>
          <Text style={styles.statValue}>{status?.longest_streak || 0}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Calendar size={16} color={COLORS.gold} />
          <Text style={styles.statLabel}>Tổng</Text>
          <Text style={styles.statValue}>{status?.total_checkins || 0}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Gem size={16} color={COLORS.gold} />
          <Text style={styles.statLabel}>Gems</Text>
          <Text style={styles.statValue}>{status?.total_gems || 0}</Text>
        </View>
      </View>
    </View>
  );

  // ========== RENDER: Check-in Button ==========
  const renderCheckinButton = () => {
    const checked = status?.checked_today;

    return (
      <Animated.View
        style={[
          styles.checkinButtonContainer,
          !checked && { transform: [{ scale: scaleValue }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.checkinButton,
            checked && styles.checkinButtonChecked,
          ]}
          onPress={handleCheckin}
          disabled={checked || checking}
          activeOpacity={0.8}
        >
          <View style={styles.checkinButtonInner}>
            {checking ? (
              <ActivityIndicator size="large" color={COLORS.gold} />
            ) : checked ? (
              <>
                <CheckCircle size={40} color={COLORS.gold} />
                <Text style={styles.checkinButtonTextDone}>
                  Đã điểm danh hôm nay
                </Text>
              </>
            ) : (
              <>
                <Calendar size={40} color={COLORS.gold} />
                <Text style={styles.checkinButtonText}>
                  Điểm danh nhận 5 Gems
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ========== RENDER: Next Bonus ==========
  const renderNextBonus = () => {
    const nextBonus = status?.next_bonus;
    if (!nextBonus || status?.checked_today === false) return null;

    return (
      <View style={styles.nextBonusCard}>
        <Clock size={16} color={COLORS.gold} />
        <Text style={styles.nextBonusText}>
          Còn {nextBonus.days_until || 0} ngày để nhận +{nextBonus.bonus || 20} Gems bonus!
        </Text>
      </View>
    );
  };

  // ========== RENDER: Recent Checkins ==========
  const renderRecentCheckins = () => {
    const recentCheckins = status?.recent_checkins || [];
    if (recentCheckins.length === 0) return null;

    return (
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>7 ngày gần nhất</Text>
        <View style={styles.weekGrid}>
          {recentCheckins.slice(0, 7).map((checkin, index) => (
            <View
              key={checkin?.date || index}
              style={[
                styles.dayCell,
                index === 0 && styles.dayCellToday,
              ]}
            >
              <Text style={styles.dayLabel}>
                {getDayName(checkin?.date)}
              </Text>
              <View style={styles.dayIconSuccess}>
                <CheckCircle size={16} color={COLORS.gold} />
              </View>
              <Text style={styles.dayGems}>+{checkin?.gems || 5}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ========== RENDER: Bonus Info ==========
  const renderBonusInfo = () => (
    <View style={styles.bonusSection}>
      <Text style={styles.sectionTitle}>Thưởng Streak</Text>

      <View style={styles.bonusList}>
        <View style={styles.bonusItem}>
          <View style={styles.bonusIcon}>
            <Gift size={20} color={COLORS.gold} />
          </View>
          <View style={styles.bonusInfo}>
            <Text style={styles.bonusTitle}>7 ngày liên tục</Text>
            <Text style={styles.bonusDesc}>+20 Gems bonus</Text>
          </View>
          {(status?.current_streak || 0) >= 7 ? (
            <CheckCircle size={20} color={COLORS.gold} />
          ) : (
            <Text style={styles.bonusProgress}>
              {status?.current_streak || 0}/7
            </Text>
          )}
        </View>

        <View style={styles.bonusItem}>
          <View style={styles.bonusIcon}>
            <Star size={20} color={COLORS.gold} />
          </View>
          <View style={styles.bonusInfo}>
            <Text style={styles.bonusTitle}>30 ngày liên tục</Text>
            <Text style={styles.bonusDesc}>+100 Gems bonus</Text>
          </View>
          {(status?.current_streak || 0) >= 30 ? (
            <CheckCircle size={20} color={COLORS.gold} />
          ) : (
            <Text style={styles.bonusProgress}>
              {status?.current_streak || 0}/30
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  // ========== RENDER: Success Modal ==========
  const renderSuccessModal = () => (
    <Modal
      visible={showSuccess}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSuccess(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: bounceValue }] },
          ]}
        >
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setShowSuccess(false)}
          >
            <X size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.successIcon}>
            <CheckCircle size={48} color={COLORS.gold} />
          </View>

          <Text style={styles.successTitle}>Điểm danh thành công!</Text>

          <View style={styles.gemsEarned}>
            <Gem size={28} color={COLORS.gold} />
            <Text style={styles.gemsEarnedText}>
              +{checkinResult?.gems_earned || 5}
            </Text>
          </View>

          {(checkinResult?.bonus_gems || 0) > 0 && (
            <View style={styles.bonusEarned}>
              <Gift size={18} color={COLORS.gold} />
              <Text style={styles.bonusEarnedText}>
                +{checkinResult.bonus_gems} Bonus Streak!
              </Text>
            </View>
          )}

          <Text style={styles.newBalance}>
            Số dư: {(checkinResult?.new_balance || 0).toLocaleString()} Gems
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSuccess(false)}
          >
            <Text style={styles.closeButtonText}>Tuyệt vời!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadCheckinStatus}
          >
            <RefreshCw size={18} color={COLORS.gold} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStreakCard()}
        {renderCheckinButton()}
        {renderNextBonus()}
        {renderRecentCheckins()}
        {renderBonusInfo()}
      </ScrollView>

      {renderSuccessModal()}
      {AlertComponent}
    </SafeAreaView>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Streak Card - Subtle dark theme
  streakCard: {
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxs,
  },
  streakValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xxs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // Check-in Button - Subtle dark theme
  checkinButtonContainer: {
    marginBottom: SPACING.lg,
  },
  checkinButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  checkinButtonChecked: {
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  checkinButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    minHeight: 120,
    gap: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  checkinButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  checkinButtonTextDone: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Next Bonus
  nextBonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  nextBonusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Section
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },

  // Recent Section
  recentSection: {
    marginBottom: SPACING.lg,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dayCell: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.1)',
  },
  dayCellToday: {
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  dayLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  dayIconSuccess: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dayGems: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Bonus Section
  bonusSection: {
    marginBottom: SPACING.lg,
  },
  bonusList: {
    gap: SPACING.sm,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  bonusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  bonusInfo: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  bonusDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
  bonusProgress: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },

  // Modal - Subtle dark theme
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  modalClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: SPACING.lg,
  },
  gemsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  gemsEarnedText: {
    fontSize: TYPOGRAPHY.fontSize.giant,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    color: COLORS.gold,
  },
  bonusEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  bonusEarnedText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  newBalance: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },
  closeButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Loading & Error
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default DailyCheckinScreen;
