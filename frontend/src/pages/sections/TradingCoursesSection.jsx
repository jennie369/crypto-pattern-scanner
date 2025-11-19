import React, { useEffect, useState } from 'react';
import { useCourseStore } from '../../stores/courseStore';
import { coursesData } from '../../services/courses';
import {
  Play,
  Clock,
  Users,
  Star,
  CheckCircle,
  Lock,
  BookOpen,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import './TradingCoursesSection.css';

export default function TradingCoursesSection() {
  const {
    userTier,
    getCourseProgress,
    getChapterProgress,
    hasChapterAccess,
    getNextLesson,
    setCurrentCourse
  } = useCourseStore();

  const [selectedTier, setSelectedTier] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);

  const course = coursesData.frequencyTrading;

  useEffect(() => {
    setCurrentCourse('frequencyTrading');
  }, [setCurrentCourse]);

  const progress = getCourseProgress('frequencyTrading');
  const nextLesson = getNextLesson('frequencyTrading');

  const toggleChapter = (chapterNumber) => {
    setExpandedChapter(expandedChapter === chapterNumber ? null : chapterNumber);
  };

  return (
    <div className="trading-courses-section">
      {/* Hero Section */}
      <section className="course-hero">
        <div className="course-hero-content">
          <div className="course-hero-badge">
            <Sparkles size={16} />
            <span>Khóa Học Độc Quyền</span>
          </div>

          <h1 className="course-hero-title">{course.title}</h1>
          <p className="course-hero-subtitle">{course.subtitle}</p>
          <p className="course-hero-description">{course.description}</p>

          {/* Course Stats */}
          <div className="course-stats">
            <div className="course-stat">
              <Users size={20} />
              <span>{course.stats.students.toLocaleString('vi-VN')} học viên</span>
            </div>
            <div className="course-stat">
              <Star size={20} />
              <span>{course.stats.rating} ({course.stats.reviews} đánh giá)</span>
            </div>
            <div className="course-stat">
              <Clock size={20} />
              <span>{course.stats.duration}</span>
            </div>
            <div className="course-stat">
              <TrendingUp size={20} />
              <span>{course.stats.updates}</span>
            </div>
          </div>

          {/* Instructor Info */}
          <div className="course-instructor">
            <div className="instructor-avatar">{course.instructor.avatar}</div>
            <div className="instructor-info">
              <div className="instructor-name">{course.instructor.name}</div>
              <div className="instructor-title">{course.instructor.title}</div>
              <div className="instructor-experience">{course.instructor.experience}</div>
            </div>
          </div>

          {/* Progress Bar (if user has started) */}
          {progress.completedLessons > 0 && (
            <div className="course-progress-section">
              <div className="progress-header">
                <span className="progress-label">Tiến Độ Của Bạn</span>
                <span className="progress-percentage">{progress.percentage}%</span>
              </div>
              <div className="progress-bar-wrapper">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="progress-stats">
                <span>{progress.completedLessons}/{progress.totalLessons} bài học</span>
                <span>{progress.completedChapters}/{progress.totalChapters} chương</span>
              </div>

              {/* Next Lesson Recommendation */}
              {nextLesson && (
                <div className="next-lesson">
                  <BookOpen size={18} />
                  <div className="next-lesson-info">
                    <span className="next-lesson-label">Tiếp theo:</span>
                    <span className="next-lesson-title">
                      Chương {nextLesson.chapter}: {nextLesson.lesson}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pricing-section">
        <h2 className="section-title">Chọn Gói Học Phù Hợp</h2>
        <p className="section-subtitle">
          Mở khóa nội dung cao cấp và công cụ trading chuyên nghiệp
        </p>

        <div className="pricing-grid">
          {course.tiers.map((tier) => (
            <div
              key={tier.id}
              className={`pricing-card ${tier.id === userTier ? 'current-tier' : ''} ${
                tier.popularLabel ? 'popular' : ''
              }`}
              onClick={() => setSelectedTier(tier.id)}
            >
              {tier.popularLabel && (
                <div className="popular-badge">{tier.popularLabel}</div>
              )}

              {tier.id === userTier && (
                <div className="current-tier-badge">
                  <CheckCircle size={16} />
                  <span>Gói Hiện Tại</span>
                </div>
              )}

              <div className="tier-badge" style={{ background: tier.badge.color }}>
                {tier.badge.text}
              </div>

              <h3 className="tier-name">{tier.name}</h3>

              <div className="tier-price">
                {tier.price === 0 ? (
                  <span className="price-free">MIỄN PHÍ</span>
                ) : (
                  <>
                    <span className="price-amount">
                      {tier.price.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="price-duration">/ {tier.duration}</span>
                  </>
                )}
              </div>

              <ul className="tier-features">
                {tier.features.map((feature, index) => (
                  <li key={index} className="tier-feature">
                    <CheckCircle size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.locked && tier.locked.length > 0 && (
                <div className="tier-locked">
                  <Lock size={14} />
                  <span>{tier.locked.length} chương bị khóa</span>
                </div>
              )}

              {tier.id !== userTier && (
                <button className="btn-primary tier-select-btn">
                  {tier.price === 0 ? 'Bắt Đầu Ngay' : 'Nâng Cấp'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum */}
      <section className="curriculum-section">
        <h2 className="section-title">Nội Dung Khóa Học</h2>
        <p className="section-subtitle">
          {course.chapters.length} chương • {progress.totalLessons} bài học • {course.stats.duration}
        </p>

        <div className="curriculum-list">
          {course.chapters.map((chapter) => {
            const hasAccess = hasChapterAccess(chapter.tier);
            const chapterProgress = getChapterProgress('frequencyTrading', chapter.number);
            const isExpanded = expandedChapter === chapter.number;

            return (
              <div
                key={chapter.number}
                className={`curriculum-chapter ${!hasAccess ? 'locked' : ''} ${
                  isExpanded ? 'expanded' : ''
                }`}
              >
                <div
                  className="chapter-header"
                  onClick={() => hasAccess && toggleChapter(chapter.number)}
                >
                  <div className="chapter-info">
                    <div className="chapter-number">Chương {chapter.number}</div>
                    <div className="chapter-title">{chapter.title}</div>
                    <div className="chapter-meta">
                      <span className="chapter-duration">
                        <Clock size={14} />
                        {chapter.duration}
                      </span>
                      <span className="chapter-lessons">
                        {chapter.lessons.length} bài học
                      </span>
                      {hasAccess && chapterProgress.completed > 0 && (
                        <span className="chapter-progress-badge">
                          {chapterProgress.completed}/{chapterProgress.total} hoàn thành
                        </span>
                      )}
                    </div>
                  </div>

                  {!hasAccess && (
                    <div className="chapter-lock">
                      <Lock size={20} />
                      <span className="lock-tier">{getTierLabel(chapter.tier)}</span>
                    </div>
                  )}

                  {hasAccess && (
                    <div className="chapter-progress-circle">
                      <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="#00FF88"
                          strokeWidth="4"
                          strokeDasharray={`${(chapterProgress.percentage * 125.6) / 100} 125.6`}
                          strokeLinecap="round"
                          transform="rotate(-90 24 24)"
                        />
                      </svg>
                      <span className="progress-text">{chapterProgress.percentage}%</span>
                    </div>
                  )}
                </div>

                {/* Lessons List */}
                {isExpanded && hasAccess && (
                  <div className="lessons-list">
                    {chapter.lessons.map((lesson, index) => (
                      <div key={index} className="lesson-item">
                        <div className="lesson-type-icon">
                          {lesson.type === 'video' && <Play size={16} />}
                          {lesson.type === 'document' && <BookOpen size={16} />}
                          {lesson.type === 'exercise' && <Award size={16} />}
                        </div>
                        <div className="lesson-info">
                          <div className="lesson-title">{lesson.title}</div>
                          <div className="lesson-meta">
                            <span className="lesson-duration">
                              <Clock size={12} />
                              {lesson.duration}
                            </span>
                            <span className="lesson-type">{getLessonTypeLabel(lesson.type)}</span>
                          </div>
                        </div>
                        <button className="btn-secondary lesson-start-btn">
                          <Play size={14} />
                          <span>Học Ngay</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Sẵn Sàng Trở Thành Trader Chuyên Nghiệp?</h2>
          <p className="cta-description">
            Tham gia cùng {course.stats.students.toLocaleString('vi-VN')}+ học viên đang học tập và kiếm tiền từ trading
          </p>
          <div className="cta-buttons">
            <button className="btn-primary btn-large">
              Bắt Đầu Học Miễn Phí
            </button>
            <button className="btn-secondary btn-large">
              Xem Demo Khóa Học
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper functions
function getTierLabel(tier) {
  const labels = {
    free: 'FREE',
    tier1: 'GÓI 1',
    tier2: 'GÓI 2',
    tier3: 'GÓI 3'
  };
  return labels[tier] || tier.toUpperCase();
}

function getLessonTypeLabel(type) {
  const labels = {
    video: 'Video',
    document: 'Tài Liệu',
    exercise: 'Bài Tập'
  };
  return labels[type] || type;
}
