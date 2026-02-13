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
import { WebView } from 'react-native-webview';
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
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react-native';
import { Linking } from 'react-native';
import { useCourse } from '../../contexts/CourseContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import LessonRenderer from './components/LessonRenderer';
import { addXP, updateStreak, incrementLessonStats } from '../../services/learningGamificationService';
import { supabase } from '../../services/supabase';
import DarkAlert from '../../components/UI/DarkAlert';

// URL patterns for internal navigation
const INTERNAL_URL_PATTERNS = {
  // Match gemral.com URLs
  gemralCourse: /^https?:\/\/(?:www\.)?gemral\.com\/courses\/([^\/?\s]+)(?:\/lessons?\/([^\/?\s]+))?/i,
  gemralForum: /^https?:\/\/(?:www\.)?gemral\.com\/forum\/thread\/([^\/?\s]+)/i,
  gemralShop: /^https?:\/\/(?:www\.)?gemral\.com\/shop\/product\/([^\/?\s]+)/i,
  // Match relative lesson links like "lesson-1-4.html" or "/courses/123/lessons/456"
  relativeLesson: /^(?:\.\/)?lesson[_-]?(\d+)[_-]?(\d+)?\.html?$/i,
  relativeCourse: /^\/courses\/([^\/?\s]+)(?:\/lessons?\/([^\/?\s]+))?/i,
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

const LessonPlayerScreen = ({ navigation, route }) => {
  // Validate route params
  const courseId = route.params?.courseId;
  const lessonId = route.params?.lessonId;
  const lesson = route.params?.lesson;
  const courseTitle = route.params?.courseTitle;
  const videoRef = useRef(null);

  // Use CourseContext
  const {
    getCourseById,
    isLessonCompleted,
    completeLesson,
    uncompleteLesson,
    getCompletedLessons,
  } = useCourse();

  // Use TabBarContext to hide tab bar on this screen
  let hideTabBar, showTabBar;
  try {
    const tabBarContext = useTabBar();
    hideTabBar = tabBarContext.hideTabBar;
    showTabBar = tabBarContext.showTabBar;
  } catch (e) {
    // TabBarContext might not be available in some navigation structures
    hideTabBar = () => {};
    showTabBar = () => {};
  }

  // Hide tab bar when entering lesson player, show when leaving
  useEffect(() => {
    hideTabBar(false); // Hide immediately without animation

    return () => {
      showTabBar(true); // Show with animation when leaving
    };
  }, []);

  // Get course and lessons from context
  const course = getCourseById(courseId);
  const allLessons = useMemo(() => {
    return course?.modules?.flatMap(m => m.lessons || []) || [];
  }, [course]);

  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [webViewHeight, setWebViewHeight] = useState(400);
  const [freshLesson, setFreshLesson] = useState(null);
  const [webViewAlert, setWebViewAlert] = useState({ visible: false, title: '', message: '' });
  const [webViewKey, setWebViewKey] = useState(0); // Key to force WebView reload
  const controlsTimeout = useRef(null);

  // Check completion status from context
  const isCompleted = isLessonCompleted(courseId, lessonId);

  // Find adjacent lessons
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  useEffect(() => {
    // Validate required data exists
    if (!courseId || !lessonId) {
      setError('Thiếu thông tin bài học');
      setLoading(false);
      return;
    }

    if (!lesson && !course) {
      setError('Không tìm thấy bài học');
      setLoading(false);
      return;
    }

    // Data is valid, ready to render
    setError(null);
    setLoading(false);

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [lessonId, courseId, lesson, course]);

  // Fetch fresh lesson data directly from Supabase to get content columns
  useEffect(() => {
    const fetchFreshLesson = async () => {
      if (!lessonId) return;

      try {
        console.log('[LessonPlayer] Fetching fresh lesson data for:', lessonId);
        const { data, error } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (error) {
          console.error('[LessonPlayer] Supabase fetch error:', error);
          return;
        }

        if (data) {
          console.log('[LessonPlayer] Fresh lesson data:', {
            id: data.id,
            title: data.title,
            hasContent: !!data.content,
            contentLength: data.content?.length || 0,
            hasHtmlContent: !!data.html_content,
            htmlContentLength: data.html_content?.length || 0,
          });
          setFreshLesson(data);
        }
      } catch (err) {
        console.error('[LessonPlayer] Fetch error:', err);
      }
    };

    fetchFreshLesson();
  }, [lessonId]);

  // Use freshLesson if available, otherwise fall back to navigation params
  const activeLesson = freshLesson || lesson;

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
        // Award XP for lesson completion
        try {
          await addXP(10, 'lesson_complete', `Hoàn thành bài: ${lesson?.title || 'Lesson'}`);
          await incrementLessonStats();
          await updateStreak();
        } catch (xpError) {
          // Don't block UI if XP fails
          console.log('[LessonPlayer] XP award failed:', xpError);
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleToggleComplete = async () => {
    if (markingComplete) return;

    setMarkingComplete(true);
    try {
      if (isCompleted) {
        // Uncomplete the lesson
        await uncompleteLesson(courseId, lessonId);
      } else {
        // Complete the lesson
        const result = await completeLesson(courseId, lessonId);
        if (result.success) {
          try {
            await addXP(10, 'lesson_complete', `Hoàn thành bài: ${lesson?.title || 'Lesson'}`);
            await incrementLessonStats();
            await updateStreak();
          } catch (xpError) {
            console.log('[LessonPlayer] XP award failed:', xpError);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling lesson complete:', error);
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

  /**
   * Handle link clicks from WebView content
   * Intercepts internal links and navigates within app
   * External links open in browser
   */
  const handleWebViewLinkPress = (url) => {
    console.log('[LessonPlayer] Link clicked:', url);

    // Check gemral.com course URLs
    let match = url.match(INTERNAL_URL_PATTERNS.gemralCourse);
    if (match) {
      const [, targetCourseId, targetLessonId] = match;
      console.log('[LessonPlayer] Internal course link:', { targetCourseId, targetLessonId });

      if (targetLessonId) {
        // Navigate to specific lesson
        navigation.push('LessonPlayer', {
          courseId: targetCourseId,
          lessonId: targetLessonId,
          courseTitle: courseTitle,
        });
      } else {
        // Navigate to course detail
        navigation.navigate('CourseDetail', { courseId: targetCourseId });
      }
      return false; // Prevent WebView from loading URL
    }

    // Check gemral.com forum URLs
    match = url.match(INTERNAL_URL_PATTERNS.gemralForum);
    if (match) {
      const [, postId] = match;
      console.log('[LessonPlayer] Internal forum link:', { postId });
      navigation.navigate('PostDetail', { postId });
      return false;
    }

    // Check gemral.com shop URLs
    match = url.match(INTERNAL_URL_PATTERNS.gemralShop);
    if (match) {
      const [, productId] = match;
      console.log('[LessonPlayer] Internal shop link:', { productId });
      navigation.navigate('ProductDetail', { productId });
      return false;
    }

    // Check relative course/lesson URLs (e.g., /courses/123/lessons/456)
    match = url.match(INTERNAL_URL_PATTERNS.relativeCourse);
    if (match) {
      const [, targetCourseId, targetLessonId] = match;
      console.log('[LessonPlayer] Relative course link:', { targetCourseId, targetLessonId });

      if (targetLessonId) {
        navigation.push('LessonPlayer', {
          courseId: targetCourseId,
          lessonId: targetLessonId,
          courseTitle: courseTitle,
        });
      } else {
        navigation.navigate('CourseDetail', { courseId: targetCourseId });
      }
      return false;
    }

    // Check relative lesson links (e.g., lesson-1-4.html)
    // These are tricky - we need to find the lesson in current course
    match = url.match(INTERNAL_URL_PATTERNS.relativeLesson);
    if (match) {
      const [, chapterNum, lessonNum] = match;
      console.log('[LessonPlayer] Relative lesson link:', { chapterNum, lessonNum });

      // Try to find lesson by order in current course
      if (course?.modules && chapterNum && lessonNum) {
        const moduleIndex = parseInt(chapterNum, 10) - 1;
        const lessonIndex = parseInt(lessonNum, 10) - 1;

        if (course.modules[moduleIndex]?.lessons?.[lessonIndex]) {
          const targetLesson = course.modules[moduleIndex].lessons[lessonIndex];
          navigation.push('LessonPlayer', {
            courseId,
            lessonId: targetLesson.id,
            lesson: targetLesson,
            courseTitle,
          });
          return false;
        }
      }

      // If we can't find the lesson, show alert
      Alert.alert(
        'Không tìm thấy bài học',
        `Không thể tìm bài học "${url}" trong khóa học này.`,
        [{ text: 'OK' }]
      );
      return false;
    }

    // External URL - open in browser
    console.log('[LessonPlayer] External link, opening browser:', url);
    Linking.openURL(url).catch(err => {
      console.error('[LessonPlayer] Failed to open URL:', err);
      Alert.alert('Lỗi', 'Không thể mở link này.');
    });
    return false; // Prevent WebView from navigating
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

  // Check if lesson has HTML content (not JSONB blocks)
  const hasHtmlContent = !(activeLesson?.content_blocks && activeLesson.content_blocks.length > 0) &&
                         (activeLesson?.content || activeLesson?.html_content || activeLesson?.article_content);

  // Render article content using LessonRenderer
  const renderArticleContent = () => {
    // Guard: return loading if lesson data not ready
    if (!lesson) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải bài học...</Text>
        </View>
      );
    }

    // For HTML content, use a flex layout without nested ScrollView
    if (hasHtmlContent) {
      return (
        <SafeAreaView style={styles.htmlArticleContainer} edges={['bottom']}>
          {/* Compact Header */}
          <View style={styles.htmlArticleHeaderCompact}>
            <TouchableOpacity
              style={styles.backBtnSmall}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerContentCompact}>
              <Text style={styles.courseTitleSmall} numberOfLines={1}>{courseTitle}</Text>
              <Text style={styles.articleTitleSmall} numberOfLines={1}>{lesson.title}</Text>
            </View>
          </View>

          {/* Scrollable WebView Content */}
          <WebView
            key={`webview-${webViewKey}`}
            originWhitelist={['*']}
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                  <script>
                    window.alert = function(message) {
                      if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'alert', message: message }));
                      }
                    };
                    window.confirm = function(message) {
                      if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'confirm', message: message }));
                      }
                      return true;
                    };
                  </script>
                  <style>
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; }
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      font-size: 16px;
                      line-height: 1.7;
                      color: rgba(255, 255, 255, 0.9);
                      background: transparent;
                      padding: 16px;
                      padding-bottom: 100px;
                    }
                    h1, h2, h3, h4, h5, h6 { color: #fff; margin: 20px 0 12px 0; font-weight: 600; }
                    h1 { font-size: 24px; }
                    h2 { font-size: 20px; color: #FFBD59; }
                    h3 { font-size: 18px; }
                    p { margin-bottom: 14px; color: rgba(255,255,255,0.85); }
                    ul, ol { margin: 14px 0; padding-left: 24px; color: rgba(255,255,255,0.85); }
                    li { margin-bottom: 8px; }
                    img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; display: block; }
                    a { color: #00D9FF; text-decoration: none; }
                    strong, b { color: #fff; font-weight: 600; }
                    em, i { font-style: italic; }
                    code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; }
                    pre { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; overflow-x: auto; margin: 14px 0; }
                    blockquote { border-left: 3px solid #FFBD59; padding-left: 12px; margin: 14px 0; color: rgba(255,255,255,0.7); font-style: italic; }
                    table { width: 100%; border-collapse: collapse; margin: 14px 0; }
                    th, td { border: 1px solid rgba(255,255,255,0.2); padding: 10px; text-align: left; }
                    th { background: rgba(255,255,255,0.1); color: #fff; }
                    hr { border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 20px 0; }
                  </style>
                </head>
                <body>
                  ${activeLesson?.content || activeLesson?.html_content || activeLesson?.article_content || ''}
                </body>
                </html>
              `,
            }}
            style={styles.htmlWebViewFullScreen}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            androidLayerType="hardware"
            cacheEnabled={true}
            injectedJavaScriptBeforeContentLoaded={`
              window.alert = function(message) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'alert', message: message }));
              };
              window.confirm = function(message) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'confirm', message: message }));
                return true;
              };
              true;
            `}
            onShouldStartLoadWithRequest={(request) => {
              if (request.url === 'about:blank' || request.url.startsWith('data:')) {
                return true;
              }
              handleWebViewLinkPress(request.url);
              return false;
            }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'alert' && data.message) {
                  setWebViewAlert({
                    visible: true,
                    title: 'Kết quả Quiz',
                    message: data.message,
                  });
                }
              } catch (e) {
                console.log('[LessonPlayer] WebView message parse error:', e);
              }
            }}
          />

          {/* Fixed Bottom Navigation */}
          <View style={styles.htmlBottomNav}>
            <TouchableOpacity
              style={[styles.navBtnBottom, !prevLesson && styles.navBtnDisabled]}
              onPress={() => navigateToLesson(prevLesson)}
              disabled={!prevLesson}
            >
              <ChevronLeft size={20} color={prevLesson ? COLORS.textPrimary : COLORS.textMuted} />
              <Text style={[styles.navBtnTextBottom, !prevLesson && styles.navBtnTextDisabled]}>Bài trước</Text>
            </TouchableOpacity>

            {/* Toggle Complete Button */}
            <TouchableOpacity
              style={[styles.completeToggle, isCompleted && styles.completeToggleActive]}
              onPress={handleToggleComplete}
              disabled={markingComplete}
            >
              {markingComplete ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : isCompleted ? (
                <Check size={26} color="#fff" strokeWidth={3} />
              ) : (
                <View style={styles.uncheckedIcon} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtnBottom, styles.navBtnNext, !nextLesson && styles.navBtnDisabled]}
              onPress={() => navigateToLesson(nextLesson)}
              disabled={!nextLesson}
            >
              <Text style={[styles.navBtnTextBottom, !nextLesson && styles.navBtnTextDisabled]}>Bài tiếp</Text>
              <ChevronRight size={20} color={nextLesson ? COLORS.textPrimary : COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // For JSONB blocks content, use ScrollView
    return (
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

      {/* Content: JSONB blocks */}
      {activeLesson?.content_blocks && activeLesson.content_blocks.length > 0 && (
        <LessonRenderer blocks={activeLesson.content_blocks} />
      )}
      {!(activeLesson?.content_blocks && activeLesson.content_blocks.length > 0) && (
        <View style={styles.fallbackContent}>
          <Text style={styles.descriptionText}>{activeLesson?.description || 'Chưa có nội dung bài học'}</Text>
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
  };

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
    const lessonType = activeLesson?.type || lesson?.type || 'video';

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
                <Text style={styles.quizTitle}>{lesson?.title || 'Quiz'}</Text>
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

  // Error state
  if (error) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <SafeAreaView style={styles.errorContainer}>
          <TouchableOpacity
            style={styles.errorBackBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.errorContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Không thể tải bài học</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.errorButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải bài học...</Text>
        </View>
      </LinearGradient>
    );
  }

  // No lesson data
  if (!lesson) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải bài học...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {lesson?.type === 'article' || lesson?.type === 'text' ? (
        <LinearGradient
          colors={GRADIENTS.background}
          locations={GRADIENTS.backgroundLocations}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      ) : (activeLesson?.type || lesson?.type) === 'quiz' ? (
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

      {/* Dark Alert for WebView Quiz Results */}
      <DarkAlert
        visible={webViewAlert.visible}
        title={webViewAlert.title}
        message={webViewAlert.message}
        type="info"
        buttons={[
          {
            text: 'Làm lại',
            style: 'cancel',
            onPress: () => {
              setWebViewKey(prev => prev + 1); // Reload WebView to reset quiz
            },
          },
          { text: 'OK', style: 'default' },
        ]}
        onClose={() => setWebViewAlert({ visible: false, title: '', message: '' })}
      />
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

  // Error State
  errorContainer: {
    flex: 1,
  },
  errorBackBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    marginTop: SPACING.sm,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  errorButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 25,
  },
  errorButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
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
  htmlContentContainer: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.6,
    marginVertical: SPACING.md,
  },
  htmlWebView: {
    minHeight: 300,
    backgroundColor: 'transparent',
  },
  htmlWebViewFlex: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.5,
    backgroundColor: 'transparent',
  },
  // HTML Article Full Screen Layout
  htmlArticleContainer: {
    flex: 1,
  },
  htmlArticleHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44, // Status bar height
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(17, 34, 80, 0.95)',
  },
  backBtnSmall: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  headerContentCompact: {
    flex: 1,
  },
  courseTitleSmall: {
    fontSize: 11,
    color: COLORS.gold,
    marginBottom: 2,
  },
  articleTitleSmall: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  htmlWebViewFullScreen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  htmlBottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(17, 34, 80, 0.98)',
  },
  navBtnBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
  },
  navBtnTextBottom: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  completeToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  completeToggleActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  uncheckedIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'transparent',
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
