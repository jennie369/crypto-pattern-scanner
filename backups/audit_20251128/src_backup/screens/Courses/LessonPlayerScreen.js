/**
 * Gemral - Lesson Player Screen
 * Video/content player for lessons with progress tracking
 * Supports: video, article (JSONB content_blocks), quiz
 * Updated to use CourseContext for state management
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Volume2,
  VolumeX,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react-native';
import { useCourse } from '../../contexts/CourseContext';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import LessonRenderer from './components/LessonRenderer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

const LessonPlayerScreen = ({ navigation, route }) => {
  const { courseId, lessonId, lesson, courseTitle } = route.params;
  const videoRef = useRef(null);

  // Use CourseContext
  const {
    getCourseById,
    isLessonCompleted,
    completeLesson,
    getCompletedLessons,
  } = useCourse();

  // Get course and lessons from context
  const course = getCourseById(courseId);
  const allLessons = useMemo(() => {
    return course?.modules?.flatMap(m => m.lessons || []) || [];
  }, [course]);

  // Local state
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const controlsTimeout = useRef(null);

  // Check completion status from context
  const isCompleted = isLessonCompleted(courseId, lessonId);

  // Find adjacent lessons
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  useEffect(() => {
    // Just set loading to false since we get data from context
    setLoading(false);

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [lessonId]);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);

      // Auto-mark complete when 90% watched
      if (status.positionMillis >= status.durationMillis * 0.9 && !isCompleted) {
        handleMarkComplete();
      }
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
    resetControlsTimeout();
  };

  const toggleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
    resetControlsTimeout();
  };

  const seekBackward = async () => {
    if (videoRef.current) {
      const newPosition = Math.max(0, position - 10000);
      await videoRef.current.setPositionAsync(newPosition);
    }
    resetControlsTimeout();
  };

  const seekForward = async () => {
    if (videoRef.current) {
      const newPosition = Math.min(duration, position + 10000);
      await videoRef.current.setPositionAsync(newPosition);
    }
    resetControlsTimeout();
  };

  const handleProgressPress = async (event) => {
    const { locationX } = event.nativeEvent;
    const progress = locationX / (SCREEN_WIDTH - SPACING.lg * 2);
    const newPosition = progress * duration;
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(newPosition);
    }
    resetControlsTimeout();
  };

  const toggleFullscreen = async () => {
    if (videoRef.current) {
      if (isFullscreen) {
        await videoRef.current.dismissFullscreenPlayer();
      } else {
        await videoRef.current.presentFullscreenPlayer();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setShowControls(true);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMarkComplete = async () => {
    if (isCompleted || markingComplete) return;

    setMarkingComplete(true);
    try {
      const result = await completeLesson(courseId, lessonId);
      if (result.success) {
        // Success feedback is implicit - UI will update
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  const navigateToLesson = (targetLesson) => {
    if (!targetLesson) return;

    navigation.replace('LessonPlayer', {
      courseId,
      lessonId: targetLesson.id,
      lesson: targetLesson,
      courseTitle,
    });
  };

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderVideoPlayer = () => {
    // Using placeholder for MVP - real video would come from Tevello
    const videoSource = lesson.video_url || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

    return (
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoSource }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onFullscreenUpdate={({ fullscreenUpdate }) => {
            setIsFullscreen(fullscreenUpdate === 1);
          }}
          onLoad={() => setLoading(false)}
        />

        {/* Video Controls Overlay */}
        {showControls && (
          <TouchableOpacity
            style={styles.controlsOverlay}
            activeOpacity={1}
            onPress={resetControlsTimeout}
          >
            {/* Top Bar */}
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent']}
              style={styles.topGradient}
            >
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => navigation.goBack()}
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.lessonTitle} numberOfLines={1}>
                {lesson.title}
              </Text>
              <TouchableOpacity style={styles.fullscreenBtn} onPress={toggleFullscreen}>
                <Maximize size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity style={styles.seekBtn} onPress={seekBackward}>
                <SkipBack size={28} color={COLORS.textPrimary} />
                <Text style={styles.seekText}>10s</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayPause}>
                {loading ? (
                  <ActivityIndicator size="large" color={COLORS.gold} />
                ) : isPlaying ? (
                  <Pause size={40} color={COLORS.textPrimary} />
                ) : (
                  <Play size={40} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.seekBtn} onPress={seekForward}>
                <SkipForward size={28} color={COLORS.textPrimary} />
                <Text style={styles.seekText}>10s</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.bottomGradient}
            >
              {/* Progress Bar */}
              <TouchableOpacity
                style={styles.progressContainer}
                onPress={handleProgressPress}
                activeOpacity={1}
              >
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${duration ? (position / duration) * 100 : 0}%` },
                    ]}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.bottomControls}>
                <View style={styles.timeInfo}>
                  <Text style={styles.timeText}>
                    {formatTime(position)} / {formatTime(duration)}
                  </Text>
                </View>

                <TouchableOpacity style={styles.muteBtn} onPress={toggleMute}>
                  {isMuted ? (
                    <VolumeX size={20} color={COLORS.textPrimary} />
                  ) : (
                    <Volume2 size={20} color={COLORS.textPrimary} />
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {!showControls && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={resetControlsTimeout}
            activeOpacity={1}
          />
        )}
      </View>
    );
  };

  const renderLessonContent = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      {/* Lesson Info */}
      <View style={styles.lessonInfo}>
        <Text style={styles.courseTitle}>{courseTitle}</Text>
        <Text style={styles.lessonFullTitle}>{lesson.title}</Text>

        <View style={styles.lessonMeta}>
          <Text style={styles.lessonDuration}>
            {lesson.duration_minutes} phút
          </Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <CheckCircle size={14} color={COLORS.success} />
              <Text style={styles.completedText}>Đã hoàn thành</Text>
            </View>
          )}
        </View>
      </View>

      {/* Lesson Description */}
      {lesson.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.descriptionText}>{lesson.description}</Text>
        </View>
      )}

      {/* Mark Complete Button */}
      {!isCompleted && (
        <TouchableOpacity
          style={styles.markCompleteBtn}
          onPress={handleMarkComplete}
          disabled={markingComplete}
        >
          {markingComplete ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <>
              <CheckCircle size={20} color={COLORS.gold} />
              <Text style={styles.markCompleteText}>Đánh dấu hoàn thành</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navBtn, !prevLesson && styles.navBtnDisabled]}
          onPress={() => navigateToLesson(prevLesson)}
          disabled={!prevLesson}
        >
          <ChevronLeft size={20} color={prevLesson ? COLORS.textPrimary : COLORS.textMuted} />
          <Text style={[styles.navBtnText, !prevLesson && styles.navBtnTextDisabled]}>
            Bài trước
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnNext, !nextLesson && styles.navBtnDisabled]}
          onPress={() => navigateToLesson(nextLesson)}
          disabled={!nextLesson}
        >
          <Text style={[styles.navBtnText, !nextLesson && styles.navBtnTextDisabled]}>
            Bài tiếp
          </Text>
          <ChevronRight size={20} color={nextLesson ? COLORS.textPrimary : COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Bottom padding */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );

  // Render article content using LessonRenderer
  const renderArticleContent = () => (
    <ScrollView
      style={styles.articleScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.articleContainer}
    >
      {/* Header */}
      <View style={styles.articleHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.articleHeaderContent}>
          <Text style={styles.courseTitle}>{courseTitle}</Text>
          <Text style={styles.articleTitle}>{lesson.title}</Text>
        </View>
      </View>

      {/* Article Type Badge */}
      <View style={styles.typeBadge}>
        <FileText size={14} color={COLORS.cyan} />
        <Text style={styles.typeBadgeText}>Bài đọc</Text>
        {lesson.duration_minutes && (
          <Text style={styles.typeDuration}>• {lesson.duration_minutes} phút</Text>
        )}
      </View>

      {/* JSONB Content Blocks */}
      {lesson.content_blocks && lesson.content_blocks.length > 0 ? (
        <LessonRenderer blocks={lesson.content_blocks} />
      ) : (
        // Fallback if no content_blocks, show description
        <View style={styles.fallbackContent}>
          <Text style={styles.descriptionText}>{lesson.description}</Text>
        </View>
      )}

      {/* Mark Complete Button */}
      {!isCompleted && (
        <TouchableOpacity
          style={styles.markCompleteBtn}
          onPress={handleMarkComplete}
          disabled={markingComplete}
        >
          {markingComplete ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <>
              <CheckCircle size={20} color={COLORS.gold} />
              <Text style={styles.markCompleteText}>Đánh dấu hoàn thành</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {isCompleted && (
        <View style={styles.completedBanner}>
          <CheckCircle size={20} color={COLORS.success} />
          <Text style={styles.completedBannerText}>Bài học đã hoàn thành</Text>
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navBtn, !prevLesson && styles.navBtnDisabled]}
          onPress={() => navigateToLesson(prevLesson)}
          disabled={!prevLesson}
        >
          <ChevronLeft size={20} color={prevLesson ? COLORS.textPrimary : COLORS.textMuted} />
          <Text style={[styles.navBtnText, !prevLesson && styles.navBtnTextDisabled]}>
            Bài trước
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnNext, !nextLesson && styles.navBtnDisabled]}
          onPress={() => navigateToLesson(nextLesson)}
          disabled={!nextLesson}
        >
          <Text style={[styles.navBtnText, !nextLesson && styles.navBtnTextDisabled]}>
            Bài tiếp
          </Text>
          <ChevronRight size={20} color={nextLesson ? COLORS.textPrimary : COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Bottom padding */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );

  // Handle quiz type - navigate to QuizScreen
  const handleQuizLesson = () => {
    navigation.navigate('QuizScreen', {
      courseId,
      lessonId,
      lesson,
      courseTitle,
    });
  };

  // Render based on lesson type
  const renderContent = () => {
    const lessonType = lesson.type || 'video';

    switch (lessonType) {
      case 'article':
      case 'text':
        return renderArticleContent();

      case 'quiz':
        // Quiz lessons navigate to QuizScreen
        return (
          <View style={styles.quizRedirect}>
            <LinearGradient
              colors={GRADIENTS.background}
              locations={GRADIENTS.backgroundLocations}
              style={styles.gradient}
            >
              <SafeAreaView style={styles.quizRedirectContent}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => navigation.goBack()}
                >
                  <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <View style={styles.quizIconContainer}>
                  <HelpCircle size={64} color={COLORS.gold} />
                </View>
                <Text style={styles.quizTitle}>{lesson.title}</Text>
                <Text style={styles.quizDescription}>
                  Bài kiểm tra để củng cố kiến thức
                </Text>

                <TouchableOpacity
                  style={styles.startQuizBtn}
                  onPress={handleQuizLesson}
                >
                  <Play size={20} color="#000" fill="#000" />
                  <Text style={styles.startQuizText}>Bắt đầu Quiz</Text>
                </TouchableOpacity>
              </SafeAreaView>
            </LinearGradient>
          </View>
        );

      case 'video':
      default:
        return (
          <>
            {renderVideoPlayer()}
            {renderLessonContent()}
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {lesson.type === 'article' || lesson.type === 'text' ? (
        <LinearGradient
          colors={GRADIENTS.background}
          locations={GRADIENTS.backgroundLocations}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      ) : lesson.type === 'quiz' ? (
        renderContent()
      ) : (
        <LinearGradient
          colors={GRADIENTS.background}
          locations={GRADIENTS.backgroundLocations}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },

  // Video Player
  videoContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.sm,
  },
  fullscreenBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl * 2,
  },
  seekBtn: {
    alignItems: 'center',
    opacity: 0.8,
  },
  seekText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  playPauseBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  progressContainer: {
    paddingVertical: SPACING.sm,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  muteBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Section
  contentScroll: {
    flex: 1,
  },
  lessonInfo: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  courseTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  lessonFullTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  lessonDuration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 255, 100, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
  },

  // Description
  descriptionSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },

  // Mark Complete
  markCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  markCompleteText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
  },

  // Navigation Buttons
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  navBtnNext: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  navBtnTextDisabled: {
    color: COLORS.textMuted,
  },

  // Article Layout
  articleScroll: {
    flex: 1,
  },
  articleContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: SPACING.xl + 40, // Account for status bar
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  articleHeaderContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  typeDuration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  fallbackContent: {
    paddingVertical: SPACING.lg,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 100, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 100, 0.3)',
  },
  completedBannerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.success,
  },

  // Quiz Redirect Screen
  quizRedirect: {
    flex: 1,
  },
  quizRedirectContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  quizIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  quizTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  quizDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  startQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  startQuizText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#000',
  },
});

export default LessonPlayerScreen;
