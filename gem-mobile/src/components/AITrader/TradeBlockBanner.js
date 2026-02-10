/**
 * TradeBlockBanner - Warning banner when user is blocked from trading
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, AlertTriangle, Clock, X } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';

const TradeBlockBanner = ({
  blockInfo = {},
  onUnlock,
  onDismiss,
  showCountdown = true,
  style,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const {
    blocked = false,
    reason = '',
    blocked_at = null,
    blocked_until = null,
    require_unlock = false,
  } = blockInfo;

  // Calculate remaining time
  useEffect(() => {
    if (!blocked_until) {
      setRemainingSeconds(0);
      return;
    }

    const calculateRemaining = () => {
      const now = Date.now();
      const until = new Date(blocked_until).getTime();
      const remaining = Math.max(0, Math.floor((until - now) / 1000));
      setRemainingSeconds(remaining);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [blocked_until]);

  // Pulse animation for warning
  useEffect(() => {
    if (!blocked) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [blocked]);

  // Format remaining time
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hours}:${remainMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get reason text - AI Sư Phụ tone
  const getReasonText = () => {
    const reasonMap = {
      'fomo_buy_overbought': 'FOMO - Thị trường quá nóng. Đừng đuổi theo nến.',
      'fomo_retry_penalty': 'Bỏ qua cảnh báo. Cần thời gian suy ngẫm.',
      'revenge_trade_block': 'Tâm trí hỗn loạn. Nghỉ ngơi trước khi chiến đấu.',
      'no_stoploss': 'Không có Stoploss = Không có kỷ luật.',
      'overtrade_warning': 'Quá nhiều lệnh. Số lượng không bằng chất lượng.',
      'account_frozen': 'Karma cạn kiệt. Cần phục hồi.',
    };
    return reasonMap[reason] || reason || 'Vi phạm kỷ luật giao dịch';
  };

  if (!blocked) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: pulseAnim }] },
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(220, 38, 38, 0.2)', 'rgba(127, 29, 29, 0.3)']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Lock size={20} color={COLORS.error} strokeWidth={2} />
            <Text style={styles.title}>Đã khóa giao dịch</Text>
          </View>
          {onDismiss && (
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <X size={18} color={COLORS.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Reason */}
        <View style={styles.reasonContainer}>
          <AlertTriangle size={16} color={COLORS.warning} strokeWidth={2} />
          <Text style={styles.reasonText}>{getReasonText()}</Text>
        </View>

        {/* Countdown */}
        {showCountdown && blocked_until && remainingSeconds > 0 && (
          <View style={styles.countdownContainer}>
            <Clock size={16} color={COLORS.textMuted} strokeWidth={2} />
            <Text style={styles.countdownLabel}>Mở khóa sau:</Text>
            <Text style={styles.countdownTime}>{formatTime(remainingSeconds)}</Text>
          </View>
        )}

        {/* Unlock button */}
        {require_unlock && onUnlock && (
          <TouchableOpacity
            onPress={onUnlock}
            activeOpacity={0.8}
            style={styles.unlockButton}
          >
            <LinearGradient
              colors={[COLORS.purple, COLORS.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.unlockButtonGradient}
            >
              <Text style={styles.unlockButtonText}>Hoàn thành bài tập</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* No unlock required - just wait */}
        {!require_unlock && remainingSeconds > 0 && (
          <Text style={styles.waitText}>
            Chờ đợi hoặc thiền định. Kiên nhẫn là kỷ luật.
          </Text>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.5)',
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.error,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  reasonText: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    flex: 1,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  countdownLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  countdownTime: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unlockButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  unlockButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  waitText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TradeBlockBanner;
