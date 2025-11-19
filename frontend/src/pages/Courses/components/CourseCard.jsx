import React, { useState } from 'react';
import { getTierBadge, hasAccess, formatPrice } from '../utils/tierHelpers';
import './CourseCard.css';

export const CourseCard = ({
  course,
  userTier,
  onEnroll,
  onContinue
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const hasUserAccess = hasAccess(userTier, course.tier);
  const isEnrolled = course.progress !== undefined && course.progress !== null;

  const tierBadge = getTierBadge(course.tier);

  return (
    <div
      className={`course-card ${!hasUserAccess ? 'locked' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Border Effect */}
      <div className="card-glow-border-blue"></div>

      {/* Thumbnail */}
      <div className="course-thumbnail">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="thumbnail-image"
        />

        {/* Video Preview Overlay */}
        {isHovered && hasUserAccess && (
          <div className="video-preview-overlay">
            <div className="play-button">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="preview-hint">Preview</span>
          </div>
        )}

        {/* Duration Badge */}
        <div className="duration-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{course.duration}</span>
        </div>

        {/* Tier Badge */}
        <div
          className={`tier-badge tier-${course.tier}`}
          style={{
            background: tierBadge.bg,
            color: tierBadge.color,
            borderColor: tierBadge.border
          }}
        >
          <span className="tier-icon">{tierBadge.icon}</span>
          <span>{tierBadge.label}</span>
        </div>

        {/* Lock Overlay */}
        {!hasUserAccess && (
          <div className="lock-overlay">
            <div className="lock-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm-1 13.723V18h2v-2.277c.595-.347 1-.984 1-1.723 0-1.103-.897-2-2-2s-2 .897-2 2c0 .738.404 1.376 1 1.723zM9 10V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z"/>
              </svg>
            </div>
            <p className="lock-message">
              Upgrade to {tierBadge.label} to unlock
            </p>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="course-info">
        {/* Instructor */}
        <div className="instructor-row">
          <img
            src={course.instructor.avatar}
            alt={course.instructor.name}
            className="instructor-avatar"
          />
          <span className="instructor-name">{course.instructor.name}</span>
        </div>

        {/* Title */}
        <h3 className="course-title">{course.title}</h3>

        {/* Meta */}
        <div className="course-meta">
          <div className="rating-wrapper">
            <span className="rating-stars">⭐</span>
            <span className="rating-value">{course.rating.toFixed(1)}</span>
            <span className="rating-count">({course.studentCount.toLocaleString()})</span>
          </div>
          <div className="lesson-count">
            📖 {course.lessonCount} lessons
          </div>
        </div>

        {/* Description */}
        <p className="course-description">{course.description}</p>

        {/* Progress Bar (nếu đã enroll) */}
        {isEnrolled && (
          <div className="progress-wrapper">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{course.progress}% Complete</span>
          </div>
        )}

        {/* Footer */}
        <div className="course-footer">
          <div className="price-wrapper">
            {hasUserAccess ? (
              <span className="price-included">Included in your plan</span>
            ) : (
              <span className="course-price">
                {formatPrice(course.price)}
              </span>
            )}
          </div>

          {hasUserAccess ? (
            isEnrolled ? (
              <button
                className="btn-continue"
                onClick={() => onContinue(course.id)}
              >
                Continue Learning →
              </button>
            ) : (
              <button
                className="btn-start"
                onClick={() => onEnroll(course.id)}
              >
                Start Course
              </button>
            )
          ) : (
            <button
              className="btn-upgrade"
              onClick={() => onEnroll(course.id)}
            >
              🔒 Unlock with {tierBadge.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
