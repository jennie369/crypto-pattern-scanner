/**
 * ModuleAccordion - Match Mobile Design
 * Expandable module with lessons list
 * Uses Framer Motion for animations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Video,
  FileText,
  HelpCircle,
  Check,
  Lock,
  Play,
  Clock,
} from 'lucide-react';
import { COLORS, ANIMATION } from '../../../shared/design-tokens';
import './ModuleAccordion.css';

const LESSON_ICONS = {
  video: Video,
  article: FileText,
  quiz: HelpCircle,
};

export function ModuleAccordion({
  module,
  index,
  courseId,
  isEnrolled,
  userProgress = [],
  onLessonClick,
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen || index === 0);

  // Debug log for module data
  if (process.env.NODE_ENV === 'development' && !module.title) {
    console.warn(`[ModuleAccordion] Module ${index + 1} missing title:`, module);
  }

  // Get lesson completion status
  const getLessonStatus = (lessonId) => {
    const progress = userProgress.find((p) => p.lesson_id === lessonId);
    return progress?.status || 'not_started';
  };

  // Calculate module progress
  const completedCount =
    module.lessons?.filter((l) => getLessonStatus(l.id) === 'completed').length || 0;
  const totalCount = module.lessons?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Calculate total duration
  const totalDuration = module.lessons?.reduce(
    (sum, l) => sum + (l.duration_minutes || 0),
    0
  ) || 0;

  return (
    <div
      className={`module-accordion ${isOpen ? 'is-open' : ''}`}
      style={{
        borderColor: isOpen ? COLORS.borderAccent : COLORS.borderLight,
      }}
    >
      {/* Header */}
      <button className="module-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="module-header-left">
          {/* Module Number */}
          <div
            className="module-number"
            style={{
              backgroundColor: `${COLORS.accent}20`,
              color: COLORS.accent,
            }}
          >
            {index + 1}
          </div>

          {/* Module Info */}
          <div className="module-info">
            <h4
              className="module-title"
              style={{
                color: COLORS.textPrimary,
                whiteSpace: 'normal',
                overflow: 'visible',
                textOverflow: 'unset',
              }}
            >
              {module.title || `Chương ${index + 1}`}
            </h4>
            <div className="module-meta">
              <span className="meta-lessons">
                {completedCount}/{totalCount} bài học
              </span>
              {totalDuration > 0 && (
                <span className="meta-duration">
                  <Clock size={12} />
                  {totalDuration} phút
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="module-header-right">
          {/* Progress Circle */}
          {isEnrolled && totalCount > 0 && (
            <div className="progress-circle">
              <svg className="progress-svg" viewBox="0 0 40 40">
                {/* Background circle */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke={COLORS.borderLight}
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke={COLORS.success}
                  strokeWidth="3"
                  strokeDasharray={`${progressPercent} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span
                className="progress-percent"
                style={{ color: COLORS.success }}
              >
                {Math.round(progressPercent)}%
              </span>
            </div>
          )}

          {/* Chevron */}
          <motion.div
            className="chevron-icon"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} color={COLORS.textMuted} />
          </motion.div>
        </div>
      </button>

      {/* Lessons List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lessons-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="lessons-list">
              {module.lessons?.map((lesson, lessonIndex) => {
                const status = getLessonStatus(lesson.id);
                const Icon = LESSON_ICONS[lesson.type] || FileText;
                const isLocked = !isEnrolled && !lesson.is_preview;
                const isCompleted = status === 'completed';
                const isInProgress = status === 'in_progress';

                return (
                  <motion.button
                    key={lesson.id}
                    className={`lesson-item ${isLocked ? 'is-locked' : ''} ${
                      isCompleted ? 'is-completed' : ''
                    } ${isInProgress ? 'is-in-progress' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: lessonIndex * 0.05 }}
                    onClick={() => !isLocked && onLessonClick?.(lesson)}
                    disabled={isLocked}
                  >
                    {/* Status Icon */}
                    <div
                      className="lesson-icon"
                      style={{
                        backgroundColor: isCompleted
                          ? `${COLORS.success}20`
                          : isLocked
                          ? `${COLORS.textMuted}10`
                          : isInProgress
                          ? `${COLORS.primary}20`
                          : `${COLORS.accent}20`,
                      }}
                    >
                      {isLocked ? (
                        <Lock size={14} color={COLORS.textMuted} />
                      ) : isCompleted ? (
                        <Check size={14} color={COLORS.success} />
                      ) : (
                        <Icon
                          size={14}
                          color={isInProgress ? COLORS.primary : COLORS.accent}
                        />
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="lesson-info">
                      <p
                        className="lesson-title"
                        style={{
                          color: isLocked ? COLORS.textMuted : COLORS.textPrimary,
                        }}
                      >
                        {lesson.title}
                      </p>
                      <div className="lesson-meta">
                        <span>{lesson.duration_minutes || 0} phút</span>
                        {lesson.is_preview && !isEnrolled && (
                          <span
                            className="preview-badge"
                            style={{ color: COLORS.primary }}
                          >
                            Xem trước
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Play Icon */}
                    {!isLocked && (
                      <div className="lesson-play">
                        <Play size={16} color={COLORS.primary} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ModuleAccordion;
