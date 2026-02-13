/**
 * CoursePreviewModal - Preview course content before publishing
 * Shows course structure with all modules and lessons
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Users,
  Gem,
  Play,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import './CoursePreviewModal.css';

const TIER_LABELS = {
  FREE: 'Miễn phí',
  TIER1: 'Tier 1',
  TIER2: 'Tier 2',
  TIER3: 'Tier 3',
};

const DIFFICULTY_LABELS = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export default function CoursePreviewModal({ courseId, isOpen, onClose }) {
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Fetch course data
  const fetchCourse = useCallback(async () => {
    if (!courseId || !isOpen) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await courseService.getCourseDetail(courseId);
      if (!data) {
        setError('Không tìm thấy khóa học');
        return;
      }
      setCourse(data);

      // Auto-expand first module
      if (data.modules?.length > 0) {
        setExpandedModules({ [data.modules[0].id]: true });
      }
    } catch (err) {
      console.error('[CoursePreviewModal] Error:', err);
      setError('Không thể tải thông tin khóa học');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, isOpen]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Get lesson icon - uses 'type' column from DB
  const getLessonIcon = (lessonType) => {
    switch (lessonType) {
      case 'video':
        return <Video size={16} />;
      case 'article':
        return <FileText size={16} />;
      case 'quiz':
        return <HelpCircle size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  // Calculate total duration
  const getTotalDuration = () => {
    if (!course?.modules) return 0;
    let total = 0;
    course.modules.forEach(module => {
      module.lessons?.forEach(lesson => {
        total += lesson.duration_minutes || 0;
      });
    });
    return total;
  };

  // Calculate total lessons
  const getTotalLessons = () => {
    if (!course?.modules) return 0;
    return course.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
  };

  if (!isOpen) return null;

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="preview-header">
          <h2 className="preview-title">
            <Eye size={24} />
            Xem trước khóa học
          </h2>
          <button className="btn-close-preview" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="preview-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : error ? (
          <div className="preview-error">
            <p>{error}</p>
          </div>
        ) : course ? (
          <div className="preview-content">
            {/* Course Header - Thumbnail + Basic Info */}
            <div className="preview-course-header">
              <div className="preview-thumbnail">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <BookOpen size={40} />
                  </div>
                )}
              </div>
              <div className="preview-basic-info">
                <h3 className="preview-course-title">{course.title}</h3>
                <div className="preview-meta">
                  <span className={`tier-badge tier-${course.tier_required?.toLowerCase()}`}>
                    <Gem size={14} />
                    {TIER_LABELS[course.tier_required] || 'Miễn phí'}
                  </span>
                  <span className="difficulty-badge">
                    {DIFFICULTY_LABELS[course.difficulty_level] || 'Cơ bản'}
                  </span>
                  <span className="meta-item">
                    <BookOpen size={14} />
                    {getTotalLessons()} bài học
                  </span>
                  <span className="meta-item">
                    <Clock size={14} />
                    {formatDuration(getTotalDuration()) || '0 phút'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {course.description && (
              <div className="preview-description-section">
                <h4>Mô tả khóa học</h4>
                <p className="preview-course-description">{course.description}</p>
              </div>
            )}

            {/* Learning Outcomes */}
            {course.learning_outcomes?.length > 0 && Array.isArray(course.learning_outcomes) && (
              <div className="preview-outcomes">
                <h4>Sau khóa học này, bạn sẽ:</h4>
                <ul>
                  {course.learning_outcomes.slice(0, 5).map((outcome, index) => (
                    <li key={index}>
                      {typeof outcome === 'string'
                        ? (outcome.length > 100 ? outcome.substring(0, 100) + '...' : outcome)
                        : String(outcome)
                      }
                    </li>
                  ))}
                  {course.learning_outcomes.length > 5 && (
                    <li className="more-outcomes">
                      +{course.learning_outcomes.length - 5} mục tiêu khác...
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Course Structure */}
            <div className="preview-structure">
              <h3 className="structure-title">Nội dung khóa học</h3>

              {course.modules?.length === 0 ? (
                <div className="no-modules">
                  <BookOpen size={32} />
                  <p>Chưa có nội dung nào</p>
                </div>
              ) : (
                <div className="modules-list">
                  {course.modules?.map((module, moduleIndex) => (
                    <div key={module.id} className="preview-module">
                      <div
                        className="module-header"
                        onClick={() => toggleModule(module.id)}
                      >
                        <div className="module-toggle">
                          {expandedModules[module.id] ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </div>
                        <div className="module-info">
                          <span className="module-number">Chương {moduleIndex + 1}</span>
                          <span className="module-title">{module.title}</span>
                        </div>
                        <span className="module-lessons-count">
                          {module.lessons?.length || 0} bài học
                        </span>
                      </div>

                      {expandedModules[module.id] && (
                        <div className="module-lessons">
                          {module.lessons?.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className={`preview-lesson ${selectedLesson?.id === lesson.id ? 'selected' : ''}`}
                              onClick={() => setSelectedLesson(lesson)}
                            >
                              <div className="lesson-icon">
                                {getLessonIcon(lesson.type)}
                              </div>
                              <div className="lesson-info">
                                <span className="lesson-title">{lesson.title}</span>
                                <div className="lesson-meta">
                                  {lesson.duration_minutes > 0 && (
                                    <span className="lesson-duration">
                                      <Clock size={12} />
                                      {lesson.duration_minutes} phút
                                    </span>
                                  )}
                                  {lesson.is_preview && (
                                    <span className="preview-tag">Xem trước</span>
                                  )}
                                </div>
                              </div>
                              {lesson.is_preview && (
                                <button className="btn-preview-lesson" title="Xem trước">
                                  <Play size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lesson Preview Panel */}
            {selectedLesson && (
              <div className="lesson-preview-panel">
                <div className="lesson-preview-header">
                  <h4>{selectedLesson.title}</h4>
                  <button className="btn-close-lesson" onClick={() => setSelectedLesson(null)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="lesson-preview-content">
                  {selectedLesson.lesson_type === 'video' && selectedLesson.video_url && (
                    <div className="video-preview">
                      <iframe
                        src={selectedLesson.video_url.includes('youtube')
                          ? `https://www.youtube.com/embed/${selectedLesson.video_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]}`
                          : selectedLesson.video_url
                        }
                        title={selectedLesson.title}
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {selectedLesson.lesson_type === 'article' && selectedLesson.content_html && (
                    <div
                      className="article-preview"
                      dangerouslySetInnerHTML={{ __html: selectedLesson.content_html }}
                    />
                  )}
                  {selectedLesson.lesson_type === 'quiz' && (
                    <div className="quiz-preview">
                      <HelpCircle size={48} />
                      <p>Bài kiểm tra sẽ hiển thị khi học viên bắt đầu</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="preview-footer">
          <button className="btn-open-public" onClick={() => window.open(`/courses/${courseId}`, '_blank')}>
            <ExternalLink size={18} />
            Mở trang công khai
          </button>
          <button className="btn-close-modal" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
