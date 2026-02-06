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
  ShoppingCart,
  ExternalLink,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { COURSE_BUNDLES, MINDSET_COURSES } from '../../constants/productConfig';

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
  const navigation = useNavigation();

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

  // Check if this is a paid course (has Shopify product or price > 0)
  const isPaidCourse = course.shopify_product_id || (course.price && course.price > 0);
  const isFreeCoure = !isPaidCourse && course.tier_required === 'FREE';

  // ============================================
  // Get product info from productConfig.js
  // ============================================
  const getProductInfo = () => {
    const requiredTier = course.tier_required?.toUpperCase();

    // Check if it's a Trading course (by tier requirement or course type)
    if (requiredTier && COURSE_BUNDLES[requiredTier]) {
      return COURSE_BUNDLES[requiredTier];
    }

    // Check if it's a Mindset course (by name matching)
    const courseTitle = course.title?.toLowerCase() || '';
    if (courseTitle.includes('tần số gốc') || courseTitle.includes('tan so goc')) {
      return MINDSET_COURSES.TAN_SO_GOC;
    }
    if (courseTitle.includes('tình yêu') || courseTitle.includes('tinh yeu')) {
      return MINDSET_COURSES.TINH_YEU;
    }
    if (courseTitle.includes('triệu phú') || courseTitle.includes('trieu phu')) {
      return MINDSET_COURSES.TRIEU_PHU;
    }

    // Default to TIER1 for generic locked courses
    return COURSE_BUNDLES.TIER1;
  };

  const productInfo = getProductInfo();

  // ============================================
  // Handle "Tìm hiểu thêm" - Navigate to landing page
  // ============================================
  const handleLearnMore = () => {
    onClose();
    const landingUrl = productInfo?.landingPage || 'https://yinyangmasters.com/pages/khoatradingtansodocquyen';

    // Navigate to WebView with landing page
    navigation.navigate('Shop', {
      screen: 'CheckoutWebView',
      params: {
        checkoutUrl: landingUrl,
        title: 'Tìm hiểu thêm',
        productName: course.title,
        returnScreen: 'CourseDetail',
        isLandingPage: true, // Skip cancel confirmation for landing pages
      },
    });
  };

  // ============================================
  // Handle "Nâng cấp ngay" - Navigate to checkout
  // ============================================
  const handleUpgradeNow = () => {
    onClose();
    const cartUrl = productInfo?.cartUrl;

    if (cartUrl) {
      // Navigate directly to Shopify checkout with variant ID
      navigation.navigate('Shop', {
        screen: 'CheckoutWebView',
        params: {
          checkoutUrl: cartUrl,
          title: productInfo?.name || 'Nâng cấp',
          productName: productInfo?.name,
          variantId: productInfo?.variantId,
          returnScreen: 'CourseDetail',
        },
      });
    } else {
      // Fallback to upgrade screen
      onUpgrade?.();
    }
  };

  const handleEnroll = () => {
    if (isLocked) {
      handleUpgradeNow();
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

            {/* Paid Course Info */}
            {isPaidCourse && !isLocked && (
              <View style={styles.paidCourseInfo}>
                <ShoppingCart size={18} color={COLORS.gold} />
                <Text style={styles.paidCourseText}>
                  Bạn sẽ được chuyển đến trang thanh toán an toàn qua Shopify
                </Text>
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
              style={styles.learnMoreBtn}
              onPress={handleLearnMore}
              disabled={enrolling}
            >
              <ExternalLink size={16} color={COLORS.gold} />
              <Text style={styles.learnMoreBtnText}>Tìm hiểu thêm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.enrollBtn,
                isLocked && styles.upgradeBtn,
                isPaidCourse && !isLocked && styles.purchaseBtn,
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
              ) : isPaidCourse ? (
                <>
                  <ShoppingCart size={18} color="#112250" />
                  <Text style={styles.enrollBtnText}>
                    Mua khóa học - {(course.price || 0).toLocaleString()}đ
                  </Text>
                </>
              ) : (
                <Text style={styles.enrollBtnText}>Đăng ký miễn phí</Text>
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
  // Paid Course Info
  paidCourseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  paidCourseText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
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
  learnMoreBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.4)',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  learnMoreBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
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
  purchaseBtn: {
    backgroundColor: COLORS.gold,
  },
});

export default EnrollmentModal;
