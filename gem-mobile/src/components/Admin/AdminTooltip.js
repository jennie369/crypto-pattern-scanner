/**
 * GEM Mobile - Admin Tooltip Component
 * Shows contextual tooltips for admin onboarding
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { X, ChevronRight, Lightbulb } from 'lucide-react-native';
import { COLORS, SPACING, GLASS } from '../../utils/tokens';
import shopBannerService from '../../services/shopBannerService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * AdminTooltip - Shows onboarding tooltips for admin features
 * @param {string} tooltipKey - Unique key for this tooltip
 * @param {string} userId - Current user's ID
 * @param {string} title - Tooltip title
 * @param {string} message - Tooltip message
 * @param {string} position - Position: 'top', 'bottom', 'left', 'right'
 * @param {boolean} visible - Whether tooltip should be checked for visibility
 * @param {function} onDismiss - Callback when tooltip is dismissed
 * @param {React.ReactNode} children - Element to attach tooltip to
 * @param {boolean} showOnce - Only show once per user (default: true)
 */
export default function AdminTooltip({
  tooltipKey,
  userId,
  title,
  message,
  position = 'bottom',
  visible = true,
  onDismiss,
  children,
  showOnce = true,
}) {
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!visible || !userId || !tooltipKey) {
      setChecking(false);
      return;
    }

    checkTooltipSeen();
  }, [visible, userId, tooltipKey]);

  useEffect(() => {
    if (show) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [show]);

  const checkTooltipSeen = async () => {
    try {
      if (showOnce) {
        const hasSeen = await shopBannerService.hasSeenTooltip(userId, tooltipKey);
        if (!hasSeen) {
          setShow(true);
        }
      } else {
        setShow(true);
      }
    } catch (error) {
      console.error('[AdminTooltip] Check error:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleDismiss = async () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      setShow(false);

      if (showOnce && userId) {
        await shopBannerService.markTooltipSeen(userId, tooltipKey);
      }

      onDismiss?.();
    });
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { bottom: '100%', marginBottom: 8 };
      case 'left':
        return { right: '100%', marginRight: 8 };
      case 'right':
        return { left: '100%', marginLeft: 8 };
      case 'bottom':
      default:
        return { top: '100%', marginTop: 8 };
    }
  };

  const getArrowStyle = () => {
    switch (position) {
      case 'top':
        return styles.arrowBottom;
      case 'left':
        return styles.arrowRight;
      case 'right':
        return styles.arrowLeft;
      case 'bottom':
      default:
        return styles.arrowTop;
    }
  };

  if (!show) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}
      <Animated.View
        style={[
          styles.tooltipContainer,
          getPositionStyle(),
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.arrow, getArrowStyle()]} />
        <View style={styles.tooltip}>
          <View style={styles.tooltipHeader}>
            <Lightbulb size={16} color={COLORS.gold} />
            <Text style={styles.tooltipTitle}>{title}</Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.tooltipMessage}>{message}</Text>
          <TouchableOpacity onPress={handleDismiss} style={styles.gotItBtn}>
            <Text style={styles.gotItText}>Đã hiểu</Text>
            <ChevronRight size={14} color={COLORS.gold} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * TooltipSequence - Shows tooltips in sequence
 * @param {Array} tooltips - Array of tooltip configs
 * @param {string} userId - Current user's ID
 * @param {function} onComplete - Callback when all tooltips are shown
 */
export function TooltipSequence({ tooltips, userId, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seenTooltips, setSeenTooltips] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSeenTooltips();
  }, [userId]);

  const loadSeenTooltips = async () => {
    if (!userId) {
      setLoaded(true);
      return;
    }

    try {
      const result = await shopBannerService.getSeenTooltips(userId);
      if (result.success) {
        setSeenTooltips(result.data);

        // Find first unseen tooltip
        const firstUnseen = tooltips.findIndex(
          (t) => !result.data.includes(t.key)
        );
        if (firstUnseen >= 0) {
          setCurrentIndex(firstUnseen);
        } else {
          // All seen
          onComplete?.();
        }
      }
    } catch (error) {
      console.error('[TooltipSequence] Load error:', error);
    } finally {
      setLoaded(true);
    }
  };

  const handleDismiss = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < tooltips.length) {
      // Find next unseen tooltip
      const nextUnseen = tooltips.findIndex(
        (t, i) => i >= nextIndex && !seenTooltips.includes(t.key)
      );
      if (nextUnseen >= 0) {
        setCurrentIndex(nextUnseen);
      } else {
        onComplete?.();
      }
    } else {
      onComplete?.();
    }
  };

  if (!loaded || currentIndex >= tooltips.length) {
    return null;
  }

  const currentTooltip = tooltips[currentIndex];

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.sequenceOverlay}>
        <View style={styles.sequenceContent}>
          <View style={styles.sequenceCard}>
            <View style={styles.sequenceHeader}>
              <Lightbulb size={20} color={COLORS.gold} />
              <Text style={styles.sequenceTitle}>{currentTooltip.title}</Text>
            </View>
            <Text style={styles.sequenceMessage}>{currentTooltip.message}</Text>
            <View style={styles.sequenceFooter}>
              <Text style={styles.sequenceProgress}>
                {currentIndex + 1} / {tooltips.length}
              </Text>
              <TouchableOpacity
                onPress={handleDismiss}
                style={styles.sequenceBtn}
              >
                <Text style={styles.sequenceBtnText}>
                  {currentIndex === tooltips.length - 1 ? 'Hoàn tất' : 'Tiếp theo'}
                </Text>
                <ChevronRight size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Predefined tooltip messages for Shop Banner Admin
 */
export const SHOP_BANNER_TOOLTIPS = [
  {
    key: 'shop_banner_intro',
    title: 'Quản lý Banner Shop',
    message:
      'Đây là nơi quản lý carousel banner trong Tab Shop. Bạn có thể tạo, sửa, xóa và sắp xếp thứ tự hiển thị của các banner.',
  },
  {
    key: 'shop_banner_add',
    title: 'Thêm banner mới',
    message:
      'Nhấn nút + ở góc trên để thêm banner mới. Bạn cần chọn hình ảnh, nhập tiêu đề và cấu hình liên kết.',
  },
  {
    key: 'shop_banner_deeplink',
    title: 'Cấu hình liên kết',
    message:
      'Chọn loại liên kết "Màn hình trong app" để dẫn user đến các trang trong app khi click vào banner.',
  },
  {
    key: 'shop_banner_order',
    title: 'Thứ tự hiển thị',
    message:
      'Số nhỏ hơn sẽ hiển thị trước. Bạn có thể thay đổi thứ tự bằng cách sửa "Thứ tự hiển thị" của từng banner.',
  },
  {
    key: 'shop_banner_schedule',
    title: 'Lên lịch hiển thị',
    message:
      'Đặt thời gian bắt đầu và kết thúc để banner tự động hiển thị/ẩn theo lịch trình.',
  },
];

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tooltipContainer: {
    position: 'absolute',
    zIndex: 1000,
    width: SCREEN_WIDTH - 40,
    left: -20,
  },
  tooltip: {
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tooltipTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
  },
  closeBtn: {
    padding: 4,
  },
  tooltipMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  gotItBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  gotItText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gold,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  arrowTop: {
    top: -8,
    left: 30,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.gold,
  },
  arrowBottom: {
    bottom: -8,
    left: 30,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.gold,
  },
  arrowLeft: {
    left: -8,
    top: 20,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: COLORS.gold,
  },
  arrowRight: {
    right: -8,
    top: 20,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: COLORS.gold,
  },
  // Sequence Modal
  sequenceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  sequenceContent: {
    width: '100%',
    maxWidth: 340,
  },
  sequenceCard: {
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  sequenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sequenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
  },
  sequenceMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  sequenceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sequenceProgress: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  sequenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  sequenceBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
