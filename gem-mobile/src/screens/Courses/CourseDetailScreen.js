/**
 * Gemral - Course Detail Screen
 * Shows course info, curriculum, and enrollment options
 * Updated to use CourseContext for state management
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  BookOpen,
  Play,
  Lock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { LessonItem, ProgressBar } from './components';
import EnrollmentModal from './EnrollmentModal';
import { useCourse } from '../../contexts/CourseContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import shopifyService from '../../services/shopifyService';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { StateView } from '../../components/Common';

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

const CourseDetailScreen = ({ navigation, route }) => {
  const { courseId } = route.params;
  const { profile, isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // Use CourseContext
  const {
    getCourseById,
    isEnrolled,
    isCourseLocked,
    getCourseLockReason,
    getProgress,
    getCompletedLessons,
    getNextLesson,
    enrollInCourse,
    refresh,
    refreshing,
    fetchCourseWithModules,
  } = useCourse();

  // Local state
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [loadError, setLoadError] = useState(null); // C9 FIX: Error state

  // Animation values
  const thumbnailScaleAnim = useRef(new Animated.Value(1.1)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(40)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;

  // Get course data from context
  const course = getCourseById(courseId);
  const enrolledInDb = isEnrolled(courseId);
  const locked = course ? isCourseLocked(course) : false;
  const lockReason = course ? getCourseLockReason(course) : null;
  const progress = getProgress(courseId);
  const completedLessonIds = getCompletedLessons(courseId);
  const nextLesson = getNextLesson(courseId);

  // Admin bypass - admins can access all courses without enrollment
  const enrolled = isAdmin || enrolledInDb;

  // Get all lessons flattened
  const lessons = course?.modules?.flatMap(m => m.lessons || []) || [];

  useEffect(() => {
    const loadCourseData = async () => {
      setLoadError(null); // C9 FIX: Clear error on load
      try {
      if (course) {
        // Check if course has modules loaded - if not, fetch them
        if (!course.modules || course.modules.length === 0) {
          console.log('[CourseDetail] Course has no modules, fetching fresh data...');
          const freshCourse = await fetchCourseWithModules(courseId);
          if (freshCourse?.modules?.length > 0) {
            console.log('[CourseDetail] Fetched', freshCourse.modules.length, 'modules');
          }
        }

        setLoading(false);
        // Auto-expand first module
        if (course.modules?.length > 0) {
          setExpandedModules({ 0: true });
        }

        // Run entrance animations
        Animated.parallel([
          // Hero image zoom out
          Animated.spring(thumbnailScaleAnim, {
            toValue: 1,
            tension: 20,
            friction: 7,
            useNativeDriver: true,
          }),
          // Content fade and slide
          Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
              Animated.timing(contentFadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(contentSlideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
              }),
            ]),
          ]),
          // Button slide up
          Animated.sequence([
            Animated.delay(400),
            Animated.spring(buttonSlideAnim, {
              toValue: 0,
              tension: 50,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      } else {
        // Course not found, might need to refresh
        console.log('[CourseDetail] Course not found, refreshing...');
        await refresh();
        setLoading(false);
      }
      } catch (err) {
        console.error('[CourseDetail] Load error:', err);
        setLoadError(err?.message || 'Không thể tải khóa học');
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, course?.id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const result = await enrollInCourse(courseId);
      setShowEnrollModal(false);

      if (result.success) {
        // FREE course - enrollment successful
        alert({ type: 'success', title: 'Thành công!', message: 'Bạn đã đăng ký khóa học thành công' });
      } else if (result.requiresPayment) {
        // PAID course - need to redirect to Shopify checkout
        console.log('[CourseDetail] Redirecting to Shopify checkout for paid course');
        await handlePurchaseCourse(result);
      } else if (result.error === 'Upgrade required') {
        alert({
          type: 'warning',
          title: 'Nâng cấp tài khoản',
          message: `Khóa học này yêu cầu gói ${TIER_LABELS[result.requiredTier]}`,
          buttons: [
            { text: 'Để sau', style: 'cancel' },
            {
              text: 'Nâng cấp',
              onPress: () => navigation.navigate('Shop', { screen: 'ShopMain', params: { category: 'subscriptions' } }),
            },
          ],
        });
      } else {
        alert({ type: 'error', title: 'Lỗi', message: result.error || 'Không thể đăng ký khóa học' });
      }
    } catch (error) {
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể đăng ký khóa học. Vui lòng thử lại.' });
    } finally {
      setEnrolling(false);
    }
  };

  // Handle purchase flow for paid courses
  const handlePurchaseCourse = async (paymentInfo) => {
    try {
      const { shopifyProductId, price, courseTitle } = paymentInfo;

      if (!shopifyProductId) {
        // Course has price but no Shopify product linked
        alert({
          type: 'warning',
          title: 'Khóa học chưa sẵn sàng',
          message: 'Khóa học này đang được chuẩn bị. Vui lòng quay lại sau.',
          buttons: [{ text: 'Đồng ý' }],
        });
        return;
      }

      setEnrolling(true);

      // Fetch Shopify product to get variant ID
      console.log('[CourseDetail] Fetching Shopify product:', shopifyProductId);
      const product = await shopifyService.getProductById(shopifyProductId);

      if (!product) {
        alert({ type: 'error', title: 'Lỗi', message: 'Không tìm thấy sản phẩm. Vui lòng thử lại.' });
        setEnrolling(false);
        return;
      }

      // Get first variant (or specific course variant)
      const variant = product.variants?.[0];
      if (!variant?.id) {
        alert({ type: 'error', title: 'Lỗi', message: 'Sản phẩm không có biến thể. Vui lòng liên hệ hỗ trợ.' });
        setEnrolling(false);
        return;
      }

      console.log('[CourseDetail] Creating cart with variant:', variant.id);

      // Create cart with the course product
      const cart = await shopifyService.createCart([
        {
          merchandiseId: variant.id,
          quantity: 1,
        },
      ]);

      if (!cart?.checkoutUrl) {
        alert({ type: 'error', title: 'Lỗi', message: 'Không thể tạo giỏ hàng. Vui lòng thử lại.' });
        setEnrolling(false);
        return;
      }

      console.log('[CourseDetail] Checkout URL:', cart.checkoutUrl);

      // Navigate to checkout WebView with course info
      navigation.navigate('CourseCheckout', {
        checkoutUrl: cart.checkoutUrl,
        courseId: courseId,
        courseTitle: course?.title || courseTitle,
        productType: 'course',
        returnScreen: 'CourseDetail',
      });

    } catch (error) {
      console.error('[CourseDetail] Purchase error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể tiến hành thanh toán. Vui lòng thử lại.' });
    } finally {
      setEnrolling(false);
    }
  };

  const handleUpgrade = () => {
    setShowEnrollModal(false);
    navigation.navigate('Shop', { screen: 'ShopMain', params: { category: 'subscriptions' } });
  };

  const handleLessonPress = (lesson) => {
    if (!enrolled) {
      setShowEnrollModal(true);
      return;
    }

    navigation.navigate('LessonPlayer', {
      courseId,
      lessonId: lesson.id,
      lesson,
      courseTitle: course.title,
    });
  };

  const toggleModule = (index) => {
    setExpandedModules(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Animated Thumbnail with zoom effect */}
      <View style={styles.thumbnailContainer}>
        <Animated.Image
          source={{ uri: course.thumbnail_url }}
          style={[
            styles.thumbnail,
            {
              transform: [{ scale: thumbnailScaleAnim }],
            },
          ]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.thumbnailGradient}
        />

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* Tier Badge */}
        <View style={[
          styles.tierBadge,
          { backgroundColor: TIER_COLORS[course.tier_required] }
        ]}>
          <Text style={styles.tierText}>
            {TIER_LABELS[course.tier_required]}
          </Text>
        </View>

        {/* Play Button for trailer/continue (if enrolled) */}
        {enrolled && (
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => {
              // Navigate to next lesson or first lesson
              const targetLesson = nextLesson || lessons[0];
              if (targetLesson) {
                navigation.navigate('LessonPlayer', {
                  courseId,
                  lessonId: targetLesson.id,
                  lesson: targetLesson,
                  courseTitle: course?.title,
                });
              }
            }}
          >
            <Play size={32} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Animated Course Info */}
      <Animated.View
        style={[
          styles.infoSection,
          {
            opacity: contentFadeAnim,
            transform: [{ translateY: contentSlideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.instructor}>
          {course.instructor?.name || course.instructor}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.statText}>{course.duration_hours} giờ</Text>
          </View>
          <View style={styles.stat}>
            <BookOpen size={16} color={COLORS.textMuted} />
            <Text style={styles.statText}>{lessons.length} bài học</Text>
          </View>
          <View style={styles.stat}>
            <Users size={16} color={COLORS.textMuted} />
            <Text style={styles.statText}>
              {course.students_count?.toLocaleString() || 0}
            </Text>
          </View>
          {course.rating && (
            <View style={styles.stat}>
              <Star size={16} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={[styles.statText, { color: COLORS.gold }]}>
                {course.rating}
              </Text>
            </View>
          )}
        </View>

        {/* Progress (if enrolled) */}
        {enrolled && (
          <View style={styles.progressSection}>
            <ProgressBar
              progress={progress}
              label="Tiến độ học"
              color={progress >= 100 ? COLORS.success : COLORS.gold}
            />
          </View>
        )}

        {/* Description */}
        <Text style={styles.description}>{course.description}</Text>
      </Animated.View>
    </View>
  );

  const renderCurriculum = () => (
    <Animated.View
      style={[
        styles.curriculumSection,
        {
          opacity: contentFadeAnim,
          transform: [{ translateY: contentSlideAnim }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>Nội dung khóa học</Text>

      {course.modules?.map((module, moduleIndex) => {
        const moduleCompleted = module.lessons?.every(l =>
          completedLessonIds.includes(l.id)
        );
        const isExpanded = expandedModules[moduleIndex];

        return (
          <View key={module.id} style={styles.moduleContainer}>
            {/* Module Header */}
            <TouchableOpacity
              style={styles.moduleHeader}
              onPress={() => toggleModule(moduleIndex)}
              activeOpacity={0.7}
            >
              <View style={styles.moduleInfo}>
                {moduleCompleted ? (
                  <CheckCircle size={20} color={COLORS.success} />
                ) : (
                  <View style={styles.moduleIndex}>
                    <Text style={styles.moduleIndexText}>{moduleIndex + 1}</Text>
                  </View>
                )}
                <View style={styles.moduleTitleContainer}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleMeta}>
                    {module.lessons?.length || 0} bài học
                  </Text>
                </View>
              </View>
              {isExpanded ? (
                <ChevronUp size={20} color={COLORS.textMuted} />
              ) : (
                <ChevronDown size={20} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>

            {/* Lessons */}
            {isExpanded && module.lessons?.map((lesson, lessonIndex) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isCurrent = nextLesson?.id === lesson.id;
              const isLocked = !enrolled && course.tier_required !== 'FREE';

              // Calculate global lesson index
              let globalIndex = lessonIndex + 1;
              for (let i = 0; i < moduleIndex; i++) {
                globalIndex += course.modules[i].lessons?.length || 0;
              }

              return (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={globalIndex}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  isCurrent={isCurrent}
                  onPress={() => handleLessonPress(lesson)}
                />
              );
            })}
          </View>
        );
      })}
    </Animated.View>
  );

  const renderEnrollButton = () => {
    if (enrolled) {
      // Get the first lesson if nextLesson is not available
      const targetLesson = nextLesson || lessons[0];

      return (
        <TouchableOpacity
          style={[styles.continueBtn, !targetLesson && styles.continueBtnDisabled]}
          onPress={() => {
            if (targetLesson) {
              handleLessonPress(targetLesson);
            } else {
              alert({
                type: 'info',
                title: 'Chưa có bài học',
                message: 'Khóa học này chưa có nội dung. Vui lòng quay lại sau.',
              });
            }
          }}
          activeOpacity={0.8}
        >
          <Play size={20} color="#112250" />
          <Text style={styles.continueBtnText}>
            {!targetLesson ? 'Chưa có bài học' : progress >= 100 ? 'Xem lại' : 'Tiếp tục học'}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.enrollBtn, locked && styles.enrollBtnLocked]}
        onPress={() => setShowEnrollModal(true)}
        disabled={enrolling}
        activeOpacity={0.8}
      >
        {enrolling ? (
          <ActivityIndicator size="small" color="#112250" />
        ) : locked ? (
          <>
            <Lock size={20} color={COLORS.textPrimary} />
            <Text style={styles.enrollBtnTextLocked}>
              {lockReason?.type === 'tier'
                ? `Yêu cầu ${TIER_LABELS[lockReason.requiredTier] || lockReason.requiredTier}`
                : lockReason?.type === 'payment'
                  ? 'Yêu cầu mua khóa học'
                  : `Yêu cầu ${TIER_LABELS[course.tier_required] || 'Upgrade'}`}
            </Text>
          </>
        ) : (
          <Text style={styles.enrollBtnText}>
            {course.price > 0
              ? `Đăng ký - ${course.price.toLocaleString()} ${course.currency || 'VND'}`
              : 'Đăng ký miễn phí'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Đang tải khóa học...</Text>
      </LinearGradient>
    );
  }

  // C9 FIX: Show error state when course loading fails
  if (loadError) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.loadingContainer}
      >
        <StateView
          type="error"
          message={loadError}
          onRetry={() => {
            setLoading(true);
            setLoadError(null);
            refresh();
          }}
        />
      </LinearGradient>
    );
  }

  if (!course) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.loadingContainer}
      >
        <Text style={styles.errorText}>Không tìm thấy khóa học</Text>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>Quay lại</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
      >
        {renderHeader()}
        {renderCurriculum()}

        {/* Bottom spacing for button */}
        <View style={{ height: CONTENT_BOTTOM_PADDING }} />
      </ScrollView>

      {/* Fixed Enroll/Continue Button with slide animation */}
      <Animated.View
        style={[
          styles.bottomBar,
          {
            transform: [{ translateY: buttonSlideAnim }],
          },
        ]}
      >
        <SafeAreaView edges={['bottom']}>
          {renderEnrollButton()}
        </SafeAreaView>
      </Animated.View>

      {/* Enrollment Modal */}
      <EnrollmentModal
        visible={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        course={course}
        onEnroll={handleEnroll}
        onUpgrade={handleUpgrade}
        isLocked={locked}
        userTier={profile?.scanner_tier || 'FREE'}
        enrolling={enrolling}
      />

      {AlertComponent}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  backLink: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  backLinkText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },

  // Header Section
  headerSection: {
    marginBottom: SPACING.lg,
  },
  thumbnailContainer: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: 220,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  thumbnailGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: SPACING.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierBadge: {
    position: 'absolute',
    top: 50,
    right: SPACING.md,
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
  playBtn: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 189, 89, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Info Section
  infoSection: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 32,
  },
  instructor: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
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
  progressSection: {
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },

  // Curriculum Section
  curriculumSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  moduleContainer: {
    marginBottom: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  moduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  moduleIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleIndexText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  moduleTitleContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  moduleMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 34, 80, 0.95)',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  enrollBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  enrollBtnLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  enrollBtnText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
  enrollBtnTextLocked: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  continueBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  continueBtnDisabled: {
    backgroundColor: 'rgba(255, 189, 89, 0.5)',
  },
  continueBtnText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
});

export default CourseDetailScreen;
