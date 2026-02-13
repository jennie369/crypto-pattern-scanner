/**
 * Gemral - Course Preview Screen
 * Bug #28 Fix: Preview course before publishing
 * Allows admin to see how the course appears to students
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  HelpCircle,
  Clock,
  BookOpen,
  Award,
  Paperclip,
  Eye,
  Lock,
  X,
  Download,
  ExternalLink,
} from 'lucide-react-native';

import { supabase } from '../../../services/supabase';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import * as attachmentService from '../../../services/attachmentService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CoursePreviewScreen = ({ navigation, route }) => {
  const { courseId } = route.params || {};

  // Course data
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);

  // Stats
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Load course data
  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!courseId) {
        throw new Error('Course ID không hợp lệ');
      }

      console.log('[CoursePreviewScreen] Loading course:', courseId);

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('[CoursePreviewScreen] Course fetch error:', courseError);
        throw new Error('Không thể tải khóa học: ' + courseError.message);
      }
      setCourse(courseData);

      // Fetch modules first
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesError) {
        console.error('[CoursePreviewScreen] Modules fetch error:', modulesError);
        throw new Error('Không thể tải modules: ' + modulesError.message);
      }

      // Fetch lessons separately for each module (more reliable than nested select)
      const modulesWithLessons = await Promise.all(
        (modulesData || []).map(async (module) => {
          try {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from('course_lessons')
              .select('*')
              .eq('module_id', module.id)
              .order('order_index', { ascending: true });

            if (lessonsError) {
              console.warn('[CoursePreviewScreen] Lessons fetch error for module', module.id, lessonsError);
              return { ...module, lessons: [] };
            }

            // Fetch attachments for each lesson
            const lessonsWithAttachments = await Promise.all(
              (lessonsData || []).map(async (lesson) => {
                try {
                  const { data: attachmentsData } = await supabase
                    .from('lesson_attachments')
                    .select('*')
                    .eq('lesson_id', lesson.id);

                  return { ...lesson, attachments: attachmentsData || [] };
                } catch (attError) {
                  console.warn('[CoursePreviewScreen] Attachments fetch error:', attError);
                  return { ...lesson, attachments: [] };
                }
              })
            );

            return { ...module, lessons: lessonsWithAttachments };
          } catch (err) {
            console.warn('[CoursePreviewScreen] Error loading lessons for module:', module.id, err);
            return { ...module, lessons: [] };
          }
        })
      );

      setModules(modulesWithLessons);

      // Calculate stats
      let lessonsCount = 0;
      let duration = 0;
      modulesWithLessons.forEach(module => {
        lessonsCount += module.lessons?.length || 0;
        module.lessons?.forEach(lesson => {
          duration += lesson.duration_minutes || 0;
        });
      });
      setTotalLessons(lessonsCount);
      setTotalDuration(duration);

      // Expand first module by default
      if (modulesWithLessons.length > 0) {
        setExpandedModules({ [modulesWithLessons[0].id]: true });
      }

      console.log('[CoursePreviewScreen] Loaded successfully:', {
        modules: modulesWithLessons.length,
        lessons: lessonsCount,
      });

    } catch (err) {
      console.error('[CoursePreviewScreen] loadCourseData error:', err);
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Open lesson preview
  const openLessonPreview = (lesson) => {
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  // Close lesson preview
  const closeLessonPreview = () => {
    setShowLessonModal(false);
    setSelectedLesson(null);
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '0 phút';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
  };

  // Get tier badge color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'TIER1': return COLORS.gold;
      case 'TIER2': return COLORS.info;
      case 'TIER3': return COLORS.burgundy;
      default: return COLORS.textMuted;
    }
  };

  // Get lesson type icon
  const getLessonTypeIcon = (type, size = 16) => {
    switch (type) {
      case 'video':
        return <Play size={size} color={COLORS.success} />;
      case 'article':
        return <FileText size={size} color={COLORS.gold} />;
      case 'quiz':
        return <HelpCircle size={size} color={COLORS.purple} />;
      default:
        return <BookOpen size={size} color={COLORS.textMuted} />;
    }
  };

  // Render loading
  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải preview...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Render error
  if (error || !course) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <ChevronLeft size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Xem trước</Text>
              <View style={{ width: 44 }} />
            </View>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error || 'Không tìm thấy khóa học'}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={loadCourseData}
              >
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Xem trước</Text>
              <View style={styles.previewBadge}>
                <Eye size={12} color={COLORS.gold} />
                <Text style={styles.previewBadgeText}>Preview Mode</Text>
              </View>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Course Banner */}
            <View style={styles.bannerSection}>
              {course.thumbnail_url ? (
                <Image
                  source={{ uri: course.thumbnail_url }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['#2D1F4B', '#1A0B2E']}
                  style={styles.bannerPlaceholder}
                >
                  <BookOpen size={48} color={COLORS.textMuted} />
                </LinearGradient>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.bannerOverlay}
              >
                <View style={styles.bannerContent}>
                  {/* Tier Badge */}
                  <View style={[styles.tierBadge, { backgroundColor: getTierColor(course.tier_required) + '30' }]}>
                    <Text style={[styles.tierBadgeText, { color: getTierColor(course.tier_required) }]}>
                      {course.tier_required || 'FREE'}
                    </Text>
                  </View>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  {course.description && (
                    <Text style={styles.courseDescription} numberOfLines={2}>
                      {course.description}
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Course Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <BookOpen size={18} color={COLORS.gold} />
                <Text style={styles.statValue}>{modules.length}</Text>
                <Text style={styles.statLabel}>modules</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Play size={18} color={COLORS.success} />
                <Text style={styles.statValue}>{totalLessons}</Text>
                <Text style={styles.statLabel}>bài học</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Clock size={18} color={COLORS.info} />
                <Text style={styles.statValue}>{formatDuration(totalDuration)}</Text>
                <Text style={styles.statLabel}>tổng</Text>
              </View>
            </View>

            {/* Price Info */}
            {course.price > 0 && (
              <View style={styles.priceCard}>
                <Text style={styles.priceLabel}>Giá khóa học</Text>
                <Text style={styles.priceValue}>
                  {course.price.toLocaleString('vi-VN')}đ
                </Text>
                {course.membership_duration_days > 0 && (
                  <Text style={styles.priceDuration}>
                    Thời hạn: {course.membership_duration_days} ngày
                  </Text>
                )}
              </View>
            )}

            {/* Publish Status */}
            <View style={styles.statusCard}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: course.is_published ? COLORS.success : COLORS.warning }
              ]} />
              <Text style={styles.statusText}>
                {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
              </Text>
            </View>

            {/* Modules List */}
            <View style={styles.modulesSection}>
              <Text style={styles.sectionTitle}>Nội dung khóa học</Text>

              {modules.length === 0 ? (
                <View style={styles.emptyModules}>
                  <BookOpen size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>Chưa có module nào</Text>
                </View>
              ) : (
                modules.map((module, moduleIndex) => (
                  <View key={module.id} style={styles.moduleCard}>
                    {/* Module Header */}
                    <TouchableOpacity
                      style={styles.moduleHeader}
                      onPress={() => toggleModule(module.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.moduleHeaderLeft}>
                        <View style={styles.moduleNumber}>
                          <Text style={styles.moduleNumberText}>{moduleIndex + 1}</Text>
                        </View>
                        <View style={styles.moduleInfo}>
                          <Text style={styles.moduleTitle}>{module.title}</Text>
                          <Text style={styles.moduleMeta}>
                            {module.lessons?.length || 0} bài học
                            {module.is_free_preview && (
                              <Text style={styles.freePreviewTag}> · Miễn phí</Text>
                            )}
                          </Text>
                        </View>
                      </View>
                      {expandedModules[module.id] ? (
                        <ChevronUp size={20} color={COLORS.textMuted} />
                      ) : (
                        <ChevronDown size={20} color={COLORS.textMuted} />
                      )}
                    </TouchableOpacity>

                    {/* Lessons List */}
                    {expandedModules[module.id] && module.lessons && module.lessons.length > 0 && (
                      <View style={styles.lessonsList}>
                        {module.lessons.map((lesson, lessonIndex) => (
                          <TouchableOpacity
                            key={lesson.id}
                            style={styles.lessonItem}
                            onPress={() => openLessonPreview(lesson)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.lessonLeft}>
                              <View style={styles.lessonIcon}>
                                {getLessonTypeIcon(lesson.type || lesson.content_type)}
                              </View>
                              <View style={styles.lessonInfo}>
                                <Text style={styles.lessonTitle} numberOfLines={1}>
                                  {lesson.title}
                                </Text>
                                <View style={styles.lessonMeta}>
                                  {lesson.duration_minutes > 0 && (
                                    <Text style={styles.lessonDuration}>
                                      {lesson.duration_minutes} phút
                                    </Text>
                                  )}
                                  {lesson.is_free_preview && (
                                    <View style={styles.freeTag}>
                                      <Text style={styles.freeTagText}>Miễn phí</Text>
                                    </View>
                                  )}
                                  {lesson.attachments && lesson.attachments.length > 0 && (
                                    <View style={styles.attachmentBadge}>
                                      <Paperclip size={10} color={COLORS.textMuted} />
                                      <Text style={styles.attachmentBadgeText}>
                                        {lesson.attachments.length}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                            <ExternalLink size={16} color={COLORS.textMuted} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>

            {/* Bottom Spacer */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>

        {/* Lesson Preview Modal */}
        <Modal
          visible={showLessonModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeLessonPreview}
        >
          <LessonPreviewModal
            lesson={selectedLesson}
            onClose={closeLessonPreview}
          />
        </Modal>
      </LinearGradient>
    </View>
  );
};

/**
 * Lesson Preview Modal Component
 */
const LessonPreviewModal = ({ lesson, onClose }) => {
  if (!lesson) return null;

  const renderContent = () => {
    const type = lesson.type || lesson.content_type;

    switch (type) {
      case 'video':
        return (
          <View style={modalStyles.videoContainer}>
            {lesson.video_url ? (
              <WebView
                source={{ uri: lesson.video_url }}
                style={modalStyles.webView}
                allowsFullscreenVideo
              />
            ) : (
              <View style={modalStyles.noContent}>
                <Play size={48} color={COLORS.textMuted} />
                <Text style={modalStyles.noContentText}>Chưa có video</Text>
              </View>
            )}
          </View>
        );

      case 'article':
      case 'html':
        if (lesson.html_content || lesson.article_content) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background-color: #0F1030;
                  color: #FFFFFF;
                  padding: 16px;
                  margin: 0;
                  line-height: 1.6;
                }
                h1, h2, h3 { color: #FFBD59; margin-top: 24px; }
                a { color: #6A5BFF; }
                pre { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; overflow-x: auto; }
                code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; }
                img { max-width: 100%; height: auto; border-radius: 8px; }
                blockquote { border-left: 4px solid #FFBD59; padding-left: 16px; margin-left: 0; }
              </style>
            </head>
            <body>
              ${lesson.html_content || lesson.article_content}
            </body>
            </html>
          `;
          return (
            <WebView
              source={{ html: htmlContent }}
              style={modalStyles.webView}
              scalesPageToFit={false}
            />
          );
        }
        return (
          <View style={modalStyles.noContent}>
            <FileText size={48} color={COLORS.textMuted} />
            <Text style={modalStyles.noContentText}>Chưa có nội dung</Text>
          </View>
        );

      case 'quiz':
        return (
          <View style={modalStyles.noContent}>
            <HelpCircle size={48} color={COLORS.purple} />
            <Text style={modalStyles.noContentText}>Quiz</Text>
            <Text style={modalStyles.noContentHint}>
              Quiz sẽ hiển thị khi học viên làm bài
            </Text>
          </View>
        );

      default:
        return (
          <View style={modalStyles.noContent}>
            <BookOpen size={48} color={COLORS.textMuted} />
            <Text style={modalStyles.noContentText}>Không có preview</Text>
          </View>
        );
    }
  };

  return (
    <View style={modalStyles.container}>
      <LinearGradient colors={GRADIENTS.background} style={modalStyles.gradient}>
        <SafeAreaView style={modalStyles.safeArea}>
          {/* Modal Header */}
          <View style={modalStyles.header}>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={modalStyles.headerInfo}>
              <Text style={modalStyles.headerTitle} numberOfLines={1}>
                {lesson.title}
              </Text>
              <View style={modalStyles.headerMeta}>
                {lesson.type === 'video' && <Play size={14} color={COLORS.success} />}
                {lesson.type === 'article' && <FileText size={14} color={COLORS.gold} />}
                {lesson.type === 'quiz' && <HelpCircle size={14} color={COLORS.purple} />}
                <Text style={modalStyles.headerType}>
                  {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Bài viết' : 'Quiz'}
                </Text>
                {lesson.duration_minutes > 0 && (
                  <Text style={modalStyles.headerDuration}>
                    · {lesson.duration_minutes} phút
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Content */}
          <View style={modalStyles.content}>
            {renderContent()}
          </View>

          {/* Attachments */}
          {lesson.attachments && lesson.attachments.length > 0 && (
            <View style={modalStyles.attachmentsSection}>
              <Text style={modalStyles.attachmentsTitle}>
                Tài liệu đính kèm ({lesson.attachments.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {lesson.attachments.map(att => (
                  <View key={att.id} style={modalStyles.attachmentChip}>
                    <Paperclip size={14} color={COLORS.textMuted} />
                    <Text style={modalStyles.attachmentName} numberOfLines={1}>
                      {att.file_name}
                    </Text>
                    <Text style={modalStyles.attachmentSize}>
                      {attachmentService.formatFileSize(att.file_size)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
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
    color: COLORS.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gold,
    borderRadius: 10,
  },
  retryBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#000',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  previewBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.xxl,
  },

  // Banner
  bannerSection: {
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  bannerContent: {},
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  tierBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  courseTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  courseDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.md,
    marginTop: -20,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Price
  priceCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  priceDuration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Status
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 10,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },

  // Modules
  modulesSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptyModules: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  moduleCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GLASS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  moduleNumberText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  moduleMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  freePreviewTag: {
    color: COLORS.success,
  },

  // Lessons
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingLeft: SPACING.md + 32 + SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  lessonDuration: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  freeTag: {
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeTagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  attachmentBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
});

// Modal Styles
const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  headerType: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  headerDuration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0F1030',
  },
  noContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noContentText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  noContentHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  attachmentsSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  attachmentsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: GLASS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  attachmentName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    maxWidth: 120,
  },
  attachmentSize: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
});

export default CoursePreviewScreen;
