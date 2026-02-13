/**
 * Course Detail Page - Redesigned 2-Column Layout
 * Desktop: Left (info/curriculum) + Right (sticky enrollment card)
 * Mobile: Single column matching mobile app
 * Uses Framer Motion for animations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle2,
  Lock,
  Award,
  Gem,
  Loader2,
  AlertCircle,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import CompactSidebar from '../components/CompactSidebar/CompactSidebar';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { getTierBadge, hasAccess } from './Courses/utils/tierHelpers';
import { ModuleAccordion } from './Courses/components';
import { ANIMATION, TIER_STYLES } from '../shared/design-tokens';
import './CourseDetail.css';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, hasCourseAdminAccess, isAdmin } = useAuth();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum');

  // Check if admin preview mode or admin user
  const isAdminPreview = searchParams.get('preview') === 'admin';
  const canAdminPreview = isAdminPreview && profile && hasCourseAdminAccess();
  // Check if user is admin (either via isAdmin or hasCourseAdminAccess)
  const userIsAdmin = typeof isAdmin === 'function' ? isAdmin() : (isAdmin || hasCourseAdminAccess?.());

  const userTier = user?.course_tier || 'FREE';

  // Fetch course detail
  const fetchCourseDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await courseService.getCourseDetail(courseId, user?.id);
      if (!data) {
        setError('Không tìm thấy khóa học');
        return;
      }
      setCourse(data);
    } catch (err) {
      console.error('[CourseDetail] Error:', err);
      setError('Không thể tải thông tin khóa học');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  // Check access - Admin bypasses all restrictions
  const canAccess = userIsAdmin || canAdminPreview || (course && hasAccess(userTier, course.tier_required || 'FREE'));
  const isEnrolled = userIsAdmin || canAdminPreview || !!course?.enrollment;

  // Handle enrollment
  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }

    if (!canAccess) {
      navigate('/pricing');
      return;
    }

    setEnrolling(true);
    try {
      const result = await enrollmentService.enroll(user.id, courseId);
      if (result.success) {
        await fetchCourseDetail();
      } else {
        alert(result.error || 'Không thể đăng ký khóa học');
      }
    } catch (err) {
      console.error('[CourseDetail] Enroll error:', err);
      alert('Đã xảy ra lỗi khi đăng ký');
    } finally {
      setEnrolling(false);
    }
  };

  // Start/Continue learning
  const handleStartLearning = () => {
    if (!isEnrolled) {
      handleEnroll();
      return;
    }
    const firstLesson = getFirstLesson();
    if (firstLesson) {
      navigate(`/courses/${courseId}/learn/${firstLesson.id}`);
    } else {
      navigate(`/courses/${courseId}/learn`);
    }
  };

  // Get first lesson
  const getFirstLesson = () => {
    if (!course?.modules) return null;
    for (const module of course.modules) {
      if (module.lessons?.length > 0) {
        return module.lessons[0];
      }
    }
    return null;
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId) => {
    if (!course?.progress) return false;
    return course.progress.some(p => p.lesson_id === lessonId && p.status === 'completed');
  };

  // Get lesson progress status
  const getLessonStatus = (lessonId) => {
    if (!course?.progress) return 'locked';
    const progress = course.progress.find(p => p.lesson_id === lessonId);
    if (!progress) return canAccess && isEnrolled ? 'available' : 'locked';
    return progress.status;
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '0 phút';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
  };

  // Get tier info
  const getTierNumber = (tierString) => {
    const mapping = { 'FREE': 0, 'TIER1': 1, 'TIER2': 2, 'TIER3': 3 };
    return mapping[tierString] || 0;
  };

  const tierNum = course ? getTierNumber(course.tier_required) : 0;
  const tierBadge = course ? getTierBadge(tierNum) : null;
  // TIER_STYLES uses lowercase keys: free, tier1, tier2, tier3
  const tierKey = (course?.tier_required || 'FREE').toLowerCase();
  const tierStyle = TIER_STYLES[tierKey] || TIER_STYLES.free;

  // Calculate module progress
  const getModuleProgress = (module) => {
    if (!module.lessons || !course?.progress) return 0;
    const completed = module.lessons.filter(l => isLessonCompleted(l.id)).length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <CompactSidebar />
        <div className="page-container">
          <div className="course-detail-loading">
            <Loader2 size={48} className="loading-spinner-icon" />
            <p>Đang tải khóa học...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <CompactSidebar />
        <div className="page-container">
          <div className="course-detail-error">
            <AlertCircle size={48} />
            <h2>{error}</h2>
            <button onClick={() => navigate('/courses')} className="btn-back-courses">
              <ArrowLeft size={18} />
              Quay lại danh sách khóa học
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!course) return null;

  // Tabs configuration
  const tabs = [
    { id: 'curriculum', label: 'Nội dung' },
    { id: 'outcomes', label: 'Kết quả' },
  ];

  return (
    <>
      <CompactSidebar />
      <div className="page-container">
        <motion.div
          className="course-detail-page"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Admin Preview Banner */}
          {canAdminPreview && (
            <motion.div
              className="admin-preview-banner"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                padding: '12px 20px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} />
                <span style={{ fontWeight: 600 }}>
                  Chế độ Admin Preview - Bạn đang xem khóa học với quyền {profile?.role?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => navigate(`/courses/admin/edit/${courseId}`)}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  color: '#000',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                ← Quay lại chỉnh sửa
              </button>
            </motion.div>
          )}

          {/* Back Button */}
          <motion.button
            className="btn-back"
            onClick={() => canAdminPreview ? navigate(`/courses/admin/edit/${courseId}`) : navigate('/courses')}
            variants={itemVariants}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} />
            <span>{canAdminPreview ? 'Quay lại chỉnh sửa' : 'Quay lại'}</span>
          </motion.button>

          {/* 2-Column Layout */}
          <div className="course-detail-layout">
            {/* LEFT COLUMN - Main Content */}
            <div className="course-detail-main">
              {/* Hero Banner - Course Feature Image */}
              <motion.div
                className="course-hero-banner"
                variants={itemVariants}
              >
                <div className="hero-thumbnail">
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  {/* Placeholder - always visible behind image */}
                  <div className="hero-placeholder">
                    <GraduationCap size={64} />
                    <span>Ảnh bìa khóa học</span>
                  </div>
                </div>
              </motion.div>

              {/* Course Title & Meta */}
              <motion.div className="course-info-section" variants={itemVariants}>
                {/* Tier Badge */}
                {tierBadge && (
                  <motion.div
                    className="course-tier-badge"
                    style={{
                      background: tierStyle.bg,
                      color: tierStyle.color,
                      borderColor: tierStyle.border,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Gem size={14} />
                    <span>{tierBadge.label}</span>
                  </motion.div>
                )}

                <h1 className="course-detail-title">{course.title}</h1>
                <p className="course-detail-description">{course.description}</p>

                {/* Quick Stats */}
                <div className="course-quick-stats">
                  <div className="quick-stat">
                    <Star size={18} fill="var(--brand-gold)" color="var(--brand-gold)" />
                    <span className="stat-value">{(course.avg_rating || 4.8).toFixed(1)}</span>
                    <span className="stat-label">đánh giá</span>
                  </div>
                  <div className="quick-stat">
                    <Users size={18} />
                    <span className="stat-value">{(course.studentCount || 0).toLocaleString()}</span>
                    <span className="stat-label">học viên</span>
                  </div>
                  <div className="quick-stat">
                    <BookOpen size={18} />
                    <span className="stat-value">{course.totalLessons || 0}</span>
                    <span className="stat-label">bài học</span>
                  </div>
                  <div className="quick-stat">
                    <Clock size={18} />
                    <span className="stat-value">{formatDuration(course.totalDuration)}</span>
                  </div>
                </div>

                {/* Instructor */}
                {course.instructor && (
                  <div className="course-instructor-card">
                    <img
                      src={course.instructor.avatar || '/default-avatar.png'}
                      alt={course.instructor.name}
                      className="instructor-avatar"
                    />
                    <div className="instructor-info">
                      <span className="instructor-label">Giảng viên</span>
                      <span className="instructor-name">{course.instructor.name}</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Tabs Navigation */}
              <motion.div className="course-tabs" variants={itemVariants}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </motion.div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="tab-content"
                >
                  {/* Curriculum Tab */}
                  {activeTab === 'curriculum' && (
                    <div className="curriculum-content">
                      <div className="curriculum-header">
                        <span className="curriculum-summary">
                          {course.modules?.length || 0} chương • {course.totalLessons || 0} bài học
                        </span>
                      </div>

                      <div className="modules-list">
                        {course.modules?.map((module, index) => (
                          <ModuleAccordion
                            key={module.id}
                            module={{
                              ...module,
                              order_index: index + 1,
                            }}
                            index={index}
                            courseId={courseId}
                            isEnrolled={isEnrolled}
                            userProgress={course.progress || []}
                            onLessonClick={(lesson) => {
                              // Admin can access all lessons
                              if (userIsAdmin || lesson.is_preview || (canAccess && isEnrolled)) {
                                navigate(`/courses/${courseId}/learn/${lesson.id}`);
                              } else if (!user) {
                                // Not logged in, redirect to login
                                navigate('/login', { state: { from: `/courses/${courseId}` } });
                              } else if (!canAccess) {
                                // Doesn't have tier access
                                navigate('/pricing');
                              } else {
                                // Logged in, has access, but not enrolled - enroll first
                                handleEnroll();
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outcomes Tab */}
                  {activeTab === 'outcomes' && (
                    <div className="outcomes-content">
                      {course.learning_outcomes && course.learning_outcomes.length > 0 ? (
                        <div className="outcomes-grid">
                          {course.learning_outcomes.map((outcome, index) => (
                            <motion.div
                              key={index}
                              className="outcome-card"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="outcome-icon">
                                <TrendingUp size={20} />
                              </div>
                              <span>{outcome}</span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-outcomes">Chưa có thông tin kết quả học tập</p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT COLUMN - Sticky Enrollment Card */}
            <div className="course-detail-sidebar">
              <motion.div
                className="enrollment-card"
                variants={itemVariants}
                style={{
                  borderColor: tierStyle.border,
                }}
              >
                {/* Progress (if enrolled) */}
                {isEnrolled && (
                  <div className="enrollment-progress">
                    <div className="progress-circle">
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
                          strokeDasharray={`${(course.completionPercentage || 0) * 2.83} 283`}
                          strokeLinecap="round"
                          style={{ stroke: tierStyle.color }}
                        />
                      </svg>
                      <span className="progress-text">{course.completionPercentage || 0}%</span>
                    </div>
                    <div className="progress-info">
                      <span className="progress-label">Tiến độ học tập</span>
                      <span className="progress-detail">
                        {course.completedLessons || 0}/{course.totalLessons || 0} bài học
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <motion.button
                  className={`btn-enroll ${!canAccess ? 'locked' : ''}`}
                  onClick={canAccess ? handleStartLearning : () => navigate('/pricing')}
                  disabled={enrolling}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: canAccess
                      ? `linear-gradient(135deg, ${tierStyle.color} 0%, ${tierStyle.colorDark || tierStyle.color} 100%)`
                      : undefined,
                  }}
                >
                  {enrolling ? (
                    <>
                      <Loader2 size={20} className="spinner" />
                      Đang xử lý...
                    </>
                  ) : canAccess ? (
                    isEnrolled ? (
                      <>
                        <Play size={20} />
                        {course.completionPercentage > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                      </>
                    ) : (
                      <>
                        <BookOpen size={20} />
                        Đăng ký miễn phí
                      </>
                    )
                  ) : (
                    <>
                      <Lock size={20} />
                      Nâng cấp để mở khóa
                    </>
                  )}
                </motion.button>

                {/* Course Features */}
                <div className="enrollment-features">
                  <div className="feature-item">
                    <CheckCircle2 size={18} />
                    <span>Truy cập trọn đời</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle2 size={18} />
                    <span>Cập nhật miễn phí</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle2 size={18} />
                    <span>Chứng chỉ hoàn thành</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle2 size={18} />
                    <span>Hỗ trợ từ giảng viên</span>
                  </div>
                </div>

                {/* Tier Info */}
                {!canAccess && tierBadge && (
                  <div
                    className="tier-required-info"
                    style={{
                      background: tierStyle.bg,
                      borderColor: tierStyle.border,
                    }}
                  >
                    <Gem size={18} style={{ color: tierStyle.color }} />
                    <span>Yêu cầu gói <strong style={{ color: tierStyle.color }}>{tierBadge.label}</strong></span>
                  </div>
                )}
              </motion.div>

              {/* Certificate Card (if completed) */}
              {canAccess && isEnrolled && course.completionPercentage >= 100 && (
                <motion.div
                  className="certificate-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Award size={32} className="certificate-icon" />
                  <h4>Chúc mừng!</h4>
                  <p>Bạn đã hoàn thành khóa học</p>
                  <motion.button
                    className="btn-certificate"
                    onClick={() => navigate(`/courses/${courseId}/certificate`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Award size={18} />
                    Xem chứng chỉ
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
