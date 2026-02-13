/**
 * CourseCard - Match Mobile App Design
 * With Framer Motion animations
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Clock,
  Lock,
  BookOpen,
  Star,
  Users,
  ArrowRight,
} from 'lucide-react';
import { COLORS, TIER_STYLES, ANIMATION } from '../../../shared/design-tokens';
import { getTierBadge, hasAccess, formatPrice, getTierLevel } from '../utils/tierHelpers';
import './CourseCard.css';

export const CourseCard = ({
  course,
  userTier,
  onEnroll,
  onContinue,
  onClick,
}) => {
  const hasUserAccess = hasAccess(userTier, course.tier);
  const isEnrolled = course.progress !== undefined && course.progress !== null;

  // Get tier style from shared tokens (with fallback to helper)
  // Normalize tier to lowercase for TIER_STYLES lookup
  const normalizedTier = course.tier ? String(course.tier).toLowerCase().replace('_', '') : 'free';
  const tierStyle = TIER_STYLES[normalizedTier] || TIER_STYLES.free;
  // getTierBadge expects a number (tier level), not a string
  const tierLevel = getTierLevel(course.tier);
  const tierBadge = getTierBadge(tierLevel);

  // Calculate stats
  const totalLessons = course.lessonCount || course.lessons?.[0]?.count || 0;
  const totalStudents = course.studentCount || course.enrollments?.[0]?.count || 0;
  const rating = course.rating || 0;

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    onClick && onClick();
  };

  return (
    <motion.div
      className={`course-card ${!hasUserAccess ? 'locked' : ''}`}
      onClick={handleCardClick}
      whileHover={hasUserAccess ? ANIMATION.cardHover : {}}
      whileTap={hasUserAccess ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Thumbnail Container */}
      <div className="course-thumbnail">
        {/* Background Gradient (fallback) */}
        <div
          className="thumbnail-gradient"
          style={{
            background: `linear-gradient(135deg, ${COLORS.accent}33 0%, ${COLORS.primary}33 100%)`,
          }}
        />

        {/* Actual Thumbnail */}
        {course.thumbnail && (
          <motion.img
            src={course.thumbnail}
            alt={course.title}
            className="thumbnail-image"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Hover Overlay with Play Button */}
        <motion.div
          className="hover-overlay"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {hasUserAccess && (
            <motion.div
              className="play-button"
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              style={{ backgroundColor: COLORS.primary }}
            >
              <Play size={28} fill="#000" color="#000" />
            </motion.div>
          )}
        </motion.div>

        {/* Duration Badge */}
        {course.duration && (
          <div className="duration-badge">
            <Clock size={12} />
            <span>{course.duration}</span>
          </div>
        )}

        {/* Tier Badge */}
        <div
          className="tier-badge"
          style={{
            backgroundColor: tierStyle.bg,
            color: tierStyle.color,
            borderColor: tierStyle.border,
          }}
        >
          {tierStyle.label || tierBadge.label}
        </div>

        {/* Lock Overlay */}
        <AnimatePresence>
          {!hasUserAccess && (
            <motion.div
              className="lock-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="lock-icon">
                <Lock size={32} />
              </div>
              <p className="lock-message">
                Nâng cấp lên {tierStyle.label} để mở khóa
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Course Content */}
      <div className="course-info">
        {/* Title */}
        <h3 className="course-title">{course.title}</h3>

        {/* Description */}
        {course.description && (
          <p className="course-description">{course.description}</p>
        )}

        {/* Instructor */}
        {course.instructor && (
          <div className="instructor-row">
            <img
              src={course.instructor.avatar || '/default-avatar.png'}
              alt={course.instructor.name}
              className="instructor-avatar"
            />
            <span className="instructor-name">{course.instructor.name}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="course-meta">
          <div className="meta-left">
            <span className="meta-item">
              <BookOpen size={14} />
              {totalLessons} bài
            </span>
            <span className="meta-item">
              <Users size={14} />
              {totalStudents.toLocaleString()}
            </span>
          </div>
          {rating > 0 && (
            <div className="rating-wrapper">
              <Star size={14} fill={COLORS.primary} color={COLORS.primary} />
              <span className="rating-value">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar (if enrolled) */}
        {isEnrolled && (
          <div className="progress-wrapper">
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(90deg, ${COLORS.success} 0%, ${COLORS.info} 100%)`,
                }}
              />
            </div>
            <span className="progress-text" style={{ color: COLORS.success }}>
              {course.progress}% hoàn thành
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="course-footer">
          <div className="price-wrapper">
            {hasUserAccess ? (
              <span className="price-included" style={{ color: COLORS.success }}>
                Đã mở khóa
              </span>
            ) : (
              <span className="course-price" style={{ color: COLORS.primary }}>
                {formatPrice(course.price)}
              </span>
            )}
          </div>

          {hasUserAccess ? (
            isEnrolled ? (
              <motion.button
                className="btn-continue"
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue(course.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.success} 0%, ${COLORS.info} 100%)`,
                }}
              >
                Tiếp tục <ArrowRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                className="btn-start"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnroll(course.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
                }}
              >
                Bắt đầu học
              </motion.button>
            )
          ) : (
            <motion.button
              className="btn-upgrade"
              onClick={(e) => {
                e.stopPropagation();
                onEnroll(course.id);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Lock size={14} /> Mở khóa
            </motion.button>
          )}
        </div>
      </div>

      {/* Bottom Glow Effect on Hover */}
      <motion.div
        className="bottom-glow"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
        }}
      />
    </motion.div>
  );
};

export default CourseCard;
