/**
 * Course Learning Page - Redesigned
 * Full-screen lesson player with collapsible sidebar
 * Desktop: Sidebar + Main content
 * Mobile: Full-screen with bottom sheet sidebar
 * Matches Mobile App UI/UX
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Video,
  CheckCircle,
  CheckCircle2,
  Play,
  Lock,
  FileText,
  StickyNote,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Loader2,
  X,
  Menu,
  Clock,
  Award,
  ListOrdered,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/courseService';
import { lessonService } from '../services/lessonService';
import { progressService } from '../services/progressService';
import { enrollmentService } from '../services/enrollmentService';
import { hasAccess } from './Courses/utils/tierHelpers';
import { ArticleRenderer, QuizQuestion, QuizTimer, QuizResult } from './Courses/components';
import { TIER_STYLES } from '../shared/design-tokens';
import './CourseLearning.css';

export default function CourseLearning() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeTab, setActiveTab] = useState('content');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Quiz state
  const [quizState, setQuizState] = useState('idle'); // idle, active, completed
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);

  const userTier = user?.course_tier || 'FREE';

  // Check if accessing a preview lesson
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Fetch course data
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch course data (works without user for preview)
      const courseData = await courseService.getCourseDetail(courseId, user?.id);
      if (!courseData) {
        setError('Không tìm thấy khóa học');
        return;
      }

      // FIRST: Check if accessing a preview lesson (before enrollment check)
      let accessingPreview = false;
      if (lessonId) {
        // Find the lesson to check if it's a preview
        let foundLesson = null;
        for (const module of courseData.modules || []) {
          foundLesson = module.lessons?.find(l => l.id === lessonId);
          if (foundLesson) break;
        }

        if (foundLesson?.is_preview) {
          accessingPreview = true;
          setIsPreviewMode(true);
        }
      }

      // Check enrollment (only if user is logged in AND not accessing preview)
      let isEnrolled = false;
      if (user?.id && !accessingPreview) {
        try {
          isEnrolled = await enrollmentService.isEnrolled(user.id, courseId);
        } catch (enrollError) {
          // Table might not exist yet, continue without enrollment check
          console.warn('[CourseLearning] Enrollment check failed:', enrollError);
        }
      }

      // If not preview and not enrolled, redirect
      if (!accessingPreview && !isEnrolled) {
        navigate(`/courses/${courseId}`);
        return;
      }

      setCourse(courseData);

      // Auto-expand first module
      if (courseData.modules?.length > 0) {
        setExpandedModules({ [courseData.modules[0].id]: true });
      }

      // Only fetch progress if user is logged in and enrolled
      if (user?.id && isEnrolled && !accessingPreview) {
        try {
          const progress = await progressService.getProgress(user.id, courseId);
          setCompletedLessons(progress.completedLessons || []);
        } catch (progressError) {
          console.warn('[CourseLearning] Progress fetch failed:', progressError);
        }
      }

      let targetLessonId = lessonId;
      if (!targetLessonId) {
        const firstLesson = findFirstLesson(courseData);
        if (firstLesson) {
          targetLessonId = firstLesson.id;
        }
      }

      if (targetLessonId) {
        await loadLesson(targetLessonId, courseData);
      }
    } catch (err) {
      console.error('[CourseLearning] Error:', err);
      setError('Không thể tải khóa học');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, user?.id, navigate]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Find first lesson in course
  const findFirstLesson = (courseData) => {
    if (!courseData?.modules) return null;
    for (const module of courseData.modules) {
      if (module.lessons?.length > 0) {
        return module.lessons[0];
      }
    }
    return null;
  };

  // Load specific lesson
  const loadLesson = async (targetLessonId, courseData = course) => {
    if (!targetLessonId || !courseData) return;

    setLessonLoading(true);
    setQuizState('idle');
    setQuizAnswers({});
    setQuizResults(null);

    try {
      const lessonData = await courseService.getLessonContent(targetLessonId, user?.id);
      if (!lessonData) {
        setError('Không tìm thấy bài học');
        return;
      }

      let moduleInfo = null;
      let lessonIndex = 0;
      let moduleIndex = 0;
      for (let i = 0; i < (courseData.modules || []).length; i++) {
        const module = courseData.modules[i];
        const idx = module.lessons?.findIndex(l => l.id === targetLessonId);
        if (idx !== -1) {
          moduleInfo = module;
          moduleIndex = i;
          lessonIndex = idx;
          // Auto-expand current module
          setExpandedModules(prev => ({ ...prev, [module.id]: true }));
          break;
        }
      }

      setCurrentLesson({
        ...lessonData,
        moduleTitle: moduleInfo?.title || 'Module',
        moduleIndex,
        lessonIndex,
      });

      // Mark lesson started (skip in preview mode or if user not logged in)
      if (user?.id && !isPreviewMode) {
        try {
          await progressService.markLessonStarted(user.id, courseId, targetLessonId);
        } catch (progressErr) {
          console.warn('[CourseLearning] Could not mark lesson started:', progressErr);
        }
      }
      window.history.replaceState(null, '', `/courses/${courseId}/learn/${targetLessonId}`);
    } catch (err) {
      console.error('[CourseLearning] Load lesson error:', err);
    } finally {
      setLessonLoading(false);
    }
  };

  // Check if lesson is accessible
  const canAccessLesson = (lesson) => {
    const tierNum = getTierNumber(course?.tier_required);
    return hasAccess(userTier, tierNum) || lesson.is_preview;
  };

  // Get tier number
  const getTierNumber = (tierString) => {
    const mapping = { 'FREE': 0, 'TIER1': 1, 'TIER2': 2, 'TIER3': 3 };
    return mapping[tierString] || 0;
  };

  // Handle lesson selection
  const handleLessonSelect = async (lesson) => {
    // In preview mode, only allow access to other preview lessons
    if (isPreviewMode && !lesson.is_preview) {
      // Show message or redirect to course detail
      alert('Đăng ký khóa học để xem toàn bộ nội dung');
      return;
    }

    if (!canAccessLesson(lesson)) {
      navigate('/pricing');
      return;
    }
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    await loadLesson(lesson.id);
  };

  // Mark lesson as complete
  const handleMarkComplete = async () => {
    if (!currentLesson || !user?.id) return;

    setMarkingComplete(true);
    try {
      const result = await progressService.markLessonComplete(user.id, courseId, currentLesson.id);
      if (result.success) {
        setCompletedLessons(prev => [...prev, currentLesson.id]);
        const next = getNextLesson();
        if (next) {
          setTimeout(() => handleLessonSelect(next), 500);
        }
      }
    } catch (err) {
      console.error('[CourseLearning] Mark complete error:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  // Navigation helpers
  const getPreviousLesson = () => {
    if (!course?.modules || !currentLesson) return null;
    const allLessons = [];
    course.modules.forEach(module => {
      module.lessons?.forEach(lesson => allLessons.push(lesson));
    });
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const getNextLesson = () => {
    if (!course?.modules || !currentLesson) return null;
    const allLessons = [];
    course.modules.forEach(module => {
      module.lessons?.forEach(lesson => allLessons.push(lesson));
    });
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!course?.totalLessons) return 0;
    return Math.round((completedLessons.length / course.totalLessons) * 100);
  };

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Get lesson icon
  const getLessonIcon = (lessonType, isCompleted, isActive) => {
    if (isCompleted) return <CheckCircle size={18} className="icon-completed" />;
    if (isActive) return <Play size={18} className="icon-active" />;

    switch (lessonType) {
      case 'video':
        return <Video size={18} />;
      case 'article':
        return <FileText size={18} />;
      case 'quiz':
        return <HelpCircle size={18} />;
      default:
        return <BookOpen size={18} />;
    }
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '0 phút';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
  };

  // Tier style - TIER_STYLES uses string keys: FREE, TIER1, TIER2, TIER3
  const tierKey = course?.tier_required || 'FREE';
  const tierStyle = TIER_STYLES[tierKey] || TIER_STYLES['FREE'];

  // Render lesson content based on type
  // DB uses 'type' and 'content', but some code uses 'lesson_type' and 'content_html'
  const renderLessonContent = () => {
    if (!currentLesson) return null;

    // Map DB field names - check ALL possible content columns
    const lessonType = currentLesson.type || currentLesson.lesson_type || currentLesson.content_type;
    const lessonContent =
      currentLesson.content ||
      currentLesson.content_html ||
      currentLesson.html_content ||
      currentLesson.article_content ||
      currentLesson.parsed_content;

    switch (lessonType) {
      case 'video':
        return (
          <div className="video-player-wrapper">
            {currentLesson.video_url ? (
              <video
                controls
                className="lesson-video"
                src={currentLesson.video_url}
                poster={currentLesson.thumbnail_url}
              >
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            ) : (
              <div className="video-placeholder">
                <Video size={64} />
                <p>Video chưa được cập nhật</p>
              </div>
            )}
          </div>
        );

      case 'article':
        // Extract body content if full HTML document
        let displayContent = lessonContent;
        let inlineStyles = '';

        if (lessonContent && lessonContent.includes('<!DOCTYPE html>')) {
          // Extract ALL style tags from the document (both head and body)
          const styleMatches = lessonContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
          if (styleMatches) {
            // Combine all style content and scope to .article-html-content
            let rawStyles = styleMatches.map(style => {
              const contentMatch = style.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
              return contentMatch ? contentMatch[1] : '';
            }).join('\n');

            // Scope CSS rules to .article-html-content
            // Replace body { with .article-html-content {
            // Replace html { or html, body { similarly
            inlineStyles = rawStyles
              .replace(/\bbody\s*\{/gi, '.article-html-content {')
              .replace(/\bhtml\s*\{/gi, '.article-html-content {')
              .replace(/\bhtml\s*,\s*body\s*\{/gi, '.article-html-content {');
          }

          // Extract body content using GREEDY quantifier
          const bodyMatch = lessonContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          if (bodyMatch && bodyMatch[1]) {
            displayContent = bodyMatch[1].trim();
          }
        }

        // Check if we have content_blocks array with data
        const hasContentBlocks = Array.isArray(currentLesson.content_blocks) && currentLesson.content_blocks.length > 0;

        return (
          <div className="article-wrapper article-full-html">
            {hasContentBlocks ? (
              <ArticleRenderer blocks={currentLesson.content_blocks} />
            ) : displayContent ? (
              <>
                {/* Inject extracted CSS styles (scoped) */}
                {inlineStyles && (
                  <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
                )}
                <div
                  className="article-html-content"
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
              </>
            ) : currentLesson.content_text ? (
              <ArticleRenderer
                blocks={[{ type: 'paragraph', content: currentLesson.content_text }]}
              />
            ) : (
              <div className="content-empty">
                <FileText size={64} />
                <p>Nội dung chưa được cập nhật</p>
              </div>
            )}
          </div>
        );

      case 'quiz':
        return renderQuizContent();

      default:
        return (
          <div className="content-empty">
            <BookOpen size={64} />
            <p>Đang tải nội dung...</p>
          </div>
        );
    }
  };

  // Render quiz content
  const renderQuizContent = () => {
    if (!currentLesson?.quiz_questions) {
      return (
        <div className="quiz-empty">
          <HelpCircle size={64} />
          <h3>Quiz: {currentLesson?.title}</h3>
          <p>Quiz chưa được thiết lập</p>
        </div>
      );
    }

    if (quizState === 'completed' && quizResults) {
      return (
        <QuizResult
          score={quizResults.score}
          total={quizResults.total}
          passed={quizResults.passed}
          correctAnswers={quizResults.correctCount}
          wrongAnswers={quizResults.wrongCount}
          timeTaken={quizResults.timeTaken}
          onRetry={() => {
            setQuizState('idle');
            setQuizAnswers({});
            setQuizResults(null);
          }}
          onContinue={() => {
            const next = getNextLesson();
            if (next) handleLessonSelect(next);
          }}
        />
      );
    }

    if (quizState === 'idle') {
      return (
        <div className="quiz-start">
          <div className="quiz-start-icon">
            <HelpCircle size={64} />
          </div>
          <h3>Quiz: {currentLesson?.title}</h3>
          <p>{currentLesson.quiz_questions.length} câu hỏi</p>
          <motion.button
            className="btn-start-quiz"
            onClick={() => setQuizState('active')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play size={20} />
            Bắt đầu Quiz
          </motion.button>
        </div>
      );
    }

    // Active quiz
    const currentQuestionIndex = Object.keys(quizAnswers).length;
    const currentQuestion = currentLesson.quiz_questions[currentQuestionIndex];

    if (!currentQuestion) {
      // All questions answered, calculate results
      const results = calculateQuizResults();
      setQuizResults(results);
      setQuizState('completed');
      if (results.passed) {
        handleMarkComplete();
      }
      return null;
    }

    return (
      <div className="quiz-active">
        <div className="quiz-progress">
          <span>Câu {currentQuestionIndex + 1} / {currentLesson.quiz_questions.length}</span>
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{
                width: `${((currentQuestionIndex + 1) / currentLesson.quiz_questions.length) * 100}%`,
                background: tierStyle.color,
              }}
            />
          </div>
        </div>

        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          selectedAnswer={quizAnswers[currentQuestion.id]}
          onSelectAnswer={(answerId) => {
            setQuizAnswers(prev => ({
              ...prev,
              [currentQuestion.id]: answerId,
            }));
          }}
          showResult={false}
        />
      </div>
    );
  };

  // Calculate quiz results
  const calculateQuizResults = () => {
    if (!currentLesson?.quiz_questions) return null;

    let correctCount = 0;
    currentLesson.quiz_questions.forEach(q => {
      if (quizAnswers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const total = currentLesson.quiz_questions.length;
    const score = Math.round((correctCount / total) * 100);
    const passingScore = currentLesson.passing_score || 70;

    return {
      score,
      total,
      correctCount,
      wrongCount: total - correctCount,
      passed: score >= passingScore,
      timeTaken: '5:00', // TODO: Track actual time
    };
  };

  // Animation variants
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -320, opacity: 0 },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="learning-loading">
        <Loader2 size={48} className="loading-spinner" />
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="learning-error">
        <X size={48} />
        <h2>{error}</h2>
        <button onClick={() => navigate('/courses')} className="btn-back-to-courses">
          <ArrowLeft size={18} />
          Quay lại danh sách khóa học
        </button>
      </div>
    );
  }

  if (!course) return null;

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();
  const courseProgress = calculateProgress();
  const isCurrentLessonCompleted = completedLessons.includes(currentLesson?.id);

  return (
    <div className="learning-page">
      {/* Mobile Menu Toggle */}
      <motion.button
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        whileTap={{ scale: 0.95 }}
      >
        <Menu size={24} />
      </motion.button>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className="learning-sidebar"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <motion.button
                className="btn-back-course"
                onClick={() => navigate(`/courses/${courseId}`)}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft size={18} />
                <span>Quay lại</span>
              </motion.button>
              <button
                className="btn-close-sidebar"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Mode Banner */}
            {isPreviewMode && (
              <motion.div
                className="preview-mode-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Play size={16} />
                <span>Chế độ xem trước</span>
                <button onClick={() => navigate(`/courses/${courseId}`)}>
                  Đăng ký ngay
                </button>
              </motion.div>
            )}

            {/* Course Info */}
            <div className="sidebar-course-info">
              <h2 className="sidebar-course-title">{course.title}</h2>
              <div className="sidebar-instructor">
                <GraduationCap size={16} />
                <span>{course.instructor?.name || 'Gemral'}</span>
              </div>

              {/* Progress Card */}
              <div className="sidebar-progress-card" style={{ borderColor: tierStyle.border }}>
                <div className="progress-circle-small">
                  <svg viewBox="0 0 100 100">
                    <circle
                      className="progress-bg"
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      strokeWidth="8"
                    />
                    <circle
                      className="progress-fill"
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      strokeWidth="8"
                      strokeDasharray={`${courseProgress * 2.83} 283`}
                      strokeLinecap="round"
                      style={{ stroke: tierStyle.color }}
                    />
                  </svg>
                  <span className="progress-text-small">{courseProgress}%</span>
                </div>
                <div className="progress-info-small">
                  <span className="progress-label">Tiến độ học tập</span>
                  <span className="progress-detail">
                    {completedLessons.length}/{course.totalLessons || 0} bài học
                  </span>
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="sidebar-modules">
              {course.modules?.map((module, moduleIdx) => {
                const isExpanded = expandedModules[module.id];
                const moduleCompletedCount = module.lessons?.filter(l =>
                  completedLessons.includes(l.id)
                ).length || 0;

                return (
                  <div key={module.id} className="sidebar-module">
                    {/* Module Header */}
                    <button
                      className={`module-header-btn ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="module-header-left">
                        <span className="module-number">Chương {moduleIdx + 1}</span>
                        <span className="module-title">{module.title}</span>
                      </div>
                      <div className="module-header-right">
                        <span className="module-progress">
                          {moduleCompletedCount}/{module.lessons?.length || 0}
                        </span>
                        <ChevronRight
                          size={18}
                          className={`module-chevron ${isExpanded ? 'rotated' : ''}`}
                        />
                      </div>
                    </button>

                    {/* Module Lessons */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="module-lessons"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {module.lessons?.map((lesson, lessonIdx) => {
                            const isActive = currentLesson?.id === lesson.id;
                            const isCompleted = completedLessons.includes(lesson.id);
                            const isLocked = !canAccessLesson(lesson);

                            return (
                              <motion.button
                                key={lesson.id}
                                className={`lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                                onClick={() => !isLocked && handleLessonSelect(lesson)}
                                disabled={isLocked}
                                whileHover={!isLocked ? { x: 4 } : {}}
                                whileTap={!isLocked ? { scale: 0.98 } : {}}
                              >
                                <div className="lesson-icon">
                                  {isLocked ? (
                                    <Lock size={16} />
                                  ) : (
                                    getLessonIcon(lesson.lesson_type, isCompleted, isActive)
                                  )}
                                </div>
                                <div className="lesson-details">
                                  <span className="lesson-num">{moduleIdx + 1}.{lessonIdx + 1}</span>
                                  <span className="lesson-title">{lesson.title}</span>
                                </div>
                                <span className="lesson-duration">
                                  {formatDuration(lesson.duration_minutes)}
                                </span>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`learning-main ${!sidebarOpen ? 'full-width' : ''}`}>
        {lessonLoading ? (
          <div className="lesson-loading">
            <Loader2 size={40} className="loading-spinner" />
            <p>Đang tải bài học...</p>
          </div>
        ) : (
          <motion.div
            className="lesson-wrapper"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
            transition={{ duration: 0.3 }}
          >
            {/* Lesson Content */}
            <div className="lesson-content-area">
              {renderLessonContent()}
            </div>

            {/* Lesson Info Bar */}
            <div className="lesson-info-bar">
              <div className="lesson-meta">
                <span
                  className="module-badge"
                  style={{
                    background: tierStyle.bgLight,
                    color: tierStyle.color,
                    borderColor: tierStyle.border,
                  }}
                >
                  Chương {(currentLesson?.moduleIndex || 0) + 1}
                </span>
                <h1 className="lesson-title-main">{currentLesson?.title}</h1>
              </div>

              <div className="lesson-actions">
                {!isCurrentLessonCompleted && currentLesson?.lesson_type !== 'quiz' && (
                  <motion.button
                    className="btn-mark-complete"
                    onClick={handleMarkComplete}
                    disabled={markingComplete}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: `linear-gradient(135deg, ${tierStyle.color} 0%, ${tierStyle.colorDark || tierStyle.color} 100%)`,
                    }}
                  >
                    {markingComplete ? (
                      <>
                        <Loader2 size={18} className="loading-spinner" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Hoàn thành
                      </>
                    )}
                  </motion.button>
                )}
                {isCurrentLessonCompleted && (
                  <span className="completed-badge" style={{ color: tierStyle.color }}>
                    <CheckCircle size={18} />
                    Đã hoàn thành
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="lesson-navigation">
              <motion.button
                className="btn-nav btn-prev"
                onClick={() => previousLesson && handleLessonSelect(previousLesson)}
                disabled={!previousLesson}
                whileHover={previousLesson ? { x: -4 } : {}}
                whileTap={previousLesson ? { scale: 0.98 } : {}}
              >
                <ChevronLeft size={20} />
                <span>Bài trước</span>
              </motion.button>

              <motion.button
                className="btn-nav btn-next"
                onClick={() => nextLesson && handleLessonSelect(nextLesson)}
                disabled={!nextLesson}
                whileHover={nextLesson ? { x: 4 } : {}}
                whileTap={nextLesson ? { scale: 0.98 } : {}}
                style={{
                  background: nextLesson ? tierStyle.bgLight : undefined,
                  borderColor: nextLesson ? tierStyle.border : undefined,
                  color: nextLesson ? tierStyle.color : undefined,
                }}
              >
                <span>Bài tiếp theo</span>
                <ChevronRight size={20} />
              </motion.button>
            </div>

            {/* Content Tabs */}
            {currentLesson?.lesson_type !== 'quiz' && (
              <div className="content-tabs">
                <div className="tabs-nav">
                  <button
                    className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
                    onClick={() => setActiveTab('content')}
                  >
                    <FileText size={18} />
                    Nội dung
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                  >
                    <StickyNote size={18} />
                    Ghi chú
                  </button>
                  {currentLesson?.attachments?.length > 0 && (
                    <button
                      className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
                      onClick={() => setActiveTab('files')}
                    >
                      <Bookmark size={18} />
                      Tài liệu
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    className="tab-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'content' && currentLesson?.content_text && (
                      <div className="content-panel">
                        <ArticleRenderer
                          blocks={[{ type: 'paragraph', content: currentLesson.content_text }]}
                        />
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="notes-panel">
                        <div className="empty-state">
                          <StickyNote size={48} />
                          <p>Tính năng ghi chú đang được phát triển</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'files' && (
                      <div className="files-panel">
                        {currentLesson?.attachments?.map(file => (
                          <a
                            key={file.id}
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-item"
                          >
                            <FileText size={20} />
                            <span>{file.file_name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
