/**
 * Gemral - Enrollment Modal
 * Confirmation modal for course enrollment
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Clock,
  BookOpen,
  Users,
  Lock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TIER_COLORS = {
  FREE: COLORS.success,
  TIER1: COLORS.gold,
  TIER2: COLORS.purple,
  TIER3: COLORS.cyan,
};

const TIER_LABELS = {
  FREE: 'Miễn phí',
  TIER1: 'Pro',
  TIER2: 'Premium',
  TIER3: 'VIP',
};

const EnrollmentModal = ({
  visible,
  onClose,
  course,
  onEnroll,
  onUpgrade,
  isLocked = false,
  userTier = 'FREE',
  enrolling = false,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Animate on visibility change
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  if (!course) return null;

  const tierColor = TIER_COLORS[course.tier_required] || COLORS.textMuted;
  const tierLabel = TIER_LABELS[course.tier_required] || course.tier_required;
  const userTierLabel = TIER_LABELS[userTier] || userTier;

  const handleEnroll = () => {
    if (isLocked) {
      onUpgrade?.();
    } else {
      onEnroll?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Course Thumbnail */}
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: course.thumbnail_url }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.thumbnailGradient}
            />

            {/* Tier Badge */}
            <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
              <Text style={styles.tierText}>{tierLabel}</Text>
            </View>

            {/* Lock Overlay */}
            {isLocked && (
              <View style={styles.lockOverlay}>
                <Lock size={40} color={COLORS.textPrimary} />
              </View>
            )}
          </View>

          {/* Course Info */}
          <View style={styles.content}>
            <Text style={styles.title}>{course.title}</Text>
            <Text style={styles.instructor}>
              {course.instructor?.name || course.instructor}
            </Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Clock size={16} color={COLORS.textMuted} />
                <Text style={styles.statText}>{course.duration_hours} giờ</Text>
              </View>
              <View style={styles.stat}>
                <BookOpen size={16} color={COLORS.textMuted} />
                <Text style={styles.statText}>
                  {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} bài
                </Text>
              </View>
              <View style={styles.stat}>
                <Users size={16} color={COLORS.textMuted} />
                <Text style={styles.statText}>
                  {course.students_count?.toLocaleString() || 0}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={3}>
              {course.description}
            </Text>

            {/* Tier Requirement Warning */}
            {isLocked && (
              <View style={styles.warningBox}>
                <AlertTriangle size={20} color={COLORS.gold} />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Yêu cầu nâng cấp</Text>
                  <Text style={styles.warningText}>
                    Khóa học này yêu cầu gói {tierLabel}. Gói hiện tại của bạn: {userTierLabel}
                  </Text>
                </View>
              </View>
            )}

            {/* What You'll Learn (placeholder) */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Bạn sẽ học được:</Text>
              <View style={styles.benefitItem}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.benefitText}>Kiến thức từ cơ bản đến nâng cao</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.benefitText}>Video bài giảng chất lượng cao</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.benefitText}>Chứng chỉ hoàn thành khóa học</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={enrolling}
            >
              <Text style={styles.cancelBtnText}>Để sau</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.enrollBtn,
                isLocked && styles.upgradeBtn,
              ]}
              onPress={handleEnroll}
              disabled={enrolling}
              activeOpacity={0.8}
            >
              {enrolling ? (
                <ActivityIndicator size="small" color={isLocked ? COLORS.textPrimary : '#112250'} />
              ) : isLocked ? (
                <>
                  <Lock size={18} color={COLORS.textPrimary} />
                  <Text style={styles.upgradeBtnText}>Nâng cấp ngay</Text>
                </>
              ) : (
                <Text style={styles.enrollBtnText}>
                  {course.price > 0
                    ? `Đăng ký - ${course.price.toLocaleString()} VND`
                    : 'Đăng ký miễn phí'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    width: SCREEN_WIDTH - SPACING.lg * 2,
    maxHeight: '90%',
    backgroundColor: GLASS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Thumbnail
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  thumbnailGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  tierBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
    textTransform: 'uppercase',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  instructor: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: 4,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Benefits
  benefitsSection: {
    marginTop: SPACING.sm,
  },
  benefitsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    paddingTop: 0,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  enrollBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  enrollBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
  upgradeBtn: {
    backgroundColor: COLORS.purple,
  },
  upgradeBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default EnrollmentModal;
