/**
 * CoursePreviewModal - Fullscreen course preview
 * Shows all chapters and lessons in a reader-style view
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Play,
  Check,
  Clock,
  Loader2,
  List,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import DOMPurify from 'dompurify';

// Design tokens
const COLORS = {
  bgDark: '#0a0a0f',
  bgCard: 'rgba(255, 255, 255, 0.03)',
  bgElevated: '#12121a',
  bgOverlay: 'rgba(0, 0, 0, 0.95)',
  burgundy: '#9C0612',
  gold: '#FFBD59',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  border: 'rgba(255, 255, 255, 0.1)',
  success: '#22c55e',
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bgOverlay,
    display: 'flex',
    zIndex: 9999,
  },
  sidebar: {
    width: '320px',
    backgroundColor: COLORS.bgDark,
    borderRight: `1px solid ${COLORS.border}`,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.textPrimary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  closeButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarContent: {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
  },
  moduleItem: {
    marginBottom: '8px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
  },
  moduleHeader: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    color: COLORS.textPrimary,
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.15s ease',
  },
  lessonItem: {
    padding: '10px 16px 10px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    color: COLORS.textSecondary,
    fontSize: '13px',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  lessonItemActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    color: COLORS.gold,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  contentHeader: {
    padding: '16px 24px',
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgElevated,
  },
  lessonTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: COLORS.textPrimary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navButton: {
    padding: '10px 16px',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    transition: 'all 0.15s ease',
  },
  navButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  contentBody: {
    flex: 1,
    overflow: 'auto',
    padding: '32px 48px',
    backgroundColor: COLORS.bgDark,
  },
  lessonContent: {
    maxWidth: '900px',
    margin: '0 auto',
    color: COLORS.textSecondary,
    fontSize: '16px',
    lineHeight: '1.8',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    paddingBottom: '56.25%',
    backgroundColor: '#000',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  videoIframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: '48px',
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: COLORS.textMuted,
  },
  lessonMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.textMuted,
    fontSize: '13px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  toggleSidebarBtn: {
    position: 'fixed',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '12px 8px',
    backgroundColor: COLORS.bgElevated,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '0 8px 8px 0',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    zIndex: 10,
  },
};

// Helper to get video embed URL
function getVideoEmbedUrl(url) {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
}

// Lesson type icon
function LessonIcon({ type, size = 16 }) {
  switch (type) {
    case 'video':
      return <Video size={size} />;
    case 'quiz':
      return <HelpCircle size={size} />;
    default:
      return <FileText size={size} />;
  }
}

export default function CoursePreviewModal({ isOpen, onClose, course, modules = [] }) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [expandedModules, setExpandedModules] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Flatten all lessons from modules
  const allLessons = modules.flatMap((module, moduleIndex) =>
    (module.lessons || []).map((lesson, lessonIndex) => ({
      ...lesson,
      moduleTitle: module.title,
      moduleIndex,
      lessonIndex,
    }))
  );

  const currentLesson = allLessons[currentLessonIndex];

  // Initialize expanded modules
  useEffect(() => {
    if (isOpen && modules.length > 0) {
      const expanded = {};
      modules.forEach((_, index) => {
        expanded[index] = true;
      });
      setExpandedModules(expanded);
      setCurrentLessonIndex(0);
    }
  }, [isOpen, modules]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentLessonIndex, allLessons.length]);

  const toggleModule = (index) => {
    setExpandedModules(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const goToLesson = (index) => {
    if (index >= 0 && index < allLessons.length) {
      setCurrentLessonIndex(index);
    }
  };

  const goToPrev = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      {/* Sidebar */}
      {sidebarVisible && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.courseTitle}>
              <BookOpen size={20} color={COLORS.gold} />
              {course?.title || 'Khóa học'}
            </h2>
            <button style={styles.closeButton} onClick={onClose} title="Đóng (Esc)">
              <X size={20} />
            </button>
          </div>

          <div style={styles.sidebarContent}>
            {modules.map((module, moduleIndex) => {
              const moduleLessons = module.lessons || [];
              const isExpanded = expandedModules[moduleIndex];

              return (
                <div key={module.id || moduleIndex} style={styles.moduleItem}>
                  <button
                    style={styles.moduleHeader}
                    onClick={() => toggleModule(moduleIndex)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: COLORS.burgundy,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        {moduleIndex + 1}
                      </span>
                      {module.title}
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isExpanded && moduleLessons.map((lesson, lessonIndex) => {
                    const flatIndex = allLessons.findIndex(
                      l => l.id === lesson.id
                    );
                    const isActive = flatIndex === currentLessonIndex;

                    return (
                      <button
                        key={lesson.id || lessonIndex}
                        style={{
                          ...styles.lessonItem,
                          ...(isActive ? styles.lessonItemActive : {}),
                        }}
                        onClick={() => goToLesson(flatIndex)}
                      >
                        <LessonIcon type={lesson.lesson_type} size={14} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lesson.title}
                        </span>
                        {lesson.duration_minutes > 0 && (
                          <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>
                            {lesson.duration_minutes}p
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle sidebar button when hidden */}
      {!sidebarVisible && (
        <button
          style={styles.toggleSidebarBtn}
          onClick={() => setSidebarVisible(true)}
          title="Hiện mục lục"
        >
          <List size={20} />
        </button>
      )}

      {/* Main Content */}
      <div style={styles.mainContent}>
        {currentLesson ? (
          <>
            {/* Header */}
            <div style={styles.contentHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  style={styles.closeButton}
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                  title={sidebarVisible ? 'Ẩn mục lục' : 'Hiện mục lục'}
                >
                  <List size={20} />
                </button>
                <h1 style={styles.lessonTitle}>
                  <LessonIcon type={currentLesson.lesson_type} size={24} />
                  {currentLesson.title}
                </h1>
              </div>

              <div style={styles.navButtons}>
                <span style={{ color: COLORS.textMuted, fontSize: '13px', marginRight: '8px' }}>
                  {currentLessonIndex + 1} / {allLessons.length}
                </span>
                <button
                  style={{
                    ...styles.navButton,
                    ...(currentLessonIndex === 0 ? styles.navButtonDisabled : {}),
                  }}
                  onClick={goToPrev}
                  disabled={currentLessonIndex === 0}
                  title="Bài trước (←)"
                >
                  <ChevronLeft size={16} />
                  Trước
                </button>
                <button
                  style={{
                    ...styles.navButton,
                    ...(currentLessonIndex === allLessons.length - 1 ? styles.navButtonDisabled : {}),
                  }}
                  onClick={goToNext}
                  disabled={currentLessonIndex === allLessons.length - 1}
                  title="Bài tiếp (→)"
                >
                  Tiếp
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={styles.contentBody}>
              <div style={styles.lessonContent}>
                {/* Lesson meta */}
                <div style={styles.lessonMeta}>
                  <span style={styles.metaItem}>
                    <BookOpen size={14} />
                    {currentLesson.moduleTitle}
                  </span>
                  {currentLesson.duration_minutes > 0 && (
                    <span style={styles.metaItem}>
                      <Clock size={14} />
                      {currentLesson.duration_minutes} phút
                    </span>
                  )}
                  <span style={styles.metaItem}>
                    <LessonIcon type={currentLesson.lesson_type} size={14} />
                    {currentLesson.lesson_type === 'video' ? 'Video' :
                     currentLesson.lesson_type === 'quiz' ? 'Quiz' : 'Bài viết'}
                  </span>
                </div>

                {/* Video */}
                {currentLesson.lesson_type === 'video' && currentLesson.video_url && (
                  <div style={styles.videoContainer}>
                    <iframe
                      style={styles.videoIframe}
                      src={getVideoEmbedUrl(currentLesson.video_url)}
                      title={currentLesson.title}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}

                {/* Article content */}
                {currentLesson.content_html && (
                  <div
                    className="lesson-preview-content"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(currentLesson.content_html)
                    }}
                  />
                )}

                {/* Quiz notice */}
                {currentLesson.lesson_type === 'quiz' && (
                  <div style={{
                    padding: '24px',
                    backgroundColor: COLORS.bgCard,
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: `1px solid ${COLORS.border}`,
                  }}>
                    <HelpCircle size={48} color={COLORS.gold} style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: COLORS.textPrimary, margin: '0 0 8px' }}>
                      Bài kiểm tra
                    </h3>
                    <p style={{ color: COLORS.textMuted, margin: 0 }}>
                      Đây là bài kiểm tra. Học viên sẽ làm quiz tại đây.
                    </p>
                  </div>
                )}

                {/* Empty content */}
                {!currentLesson.content_html && currentLesson.lesson_type !== 'video' && currentLesson.lesson_type !== 'quiz' && (
                  <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: COLORS.textMuted,
                  }}>
                    <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>Chưa có nội dung cho bài học này.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <BookOpen size={64} style={{ marginBottom: '24px', opacity: 0.5 }} />
            <h3 style={{ color: COLORS.textPrimary, margin: '0 0 8px' }}>
              Không có bài học
            </h3>
            <p style={{ margin: 0 }}>
              Khóa học chưa có bài học nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
