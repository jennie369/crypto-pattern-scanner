/**
 * QuizResult - Match Mobile Design
 * Score display with breakdown
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  Clock,
  RefreshCcw,
  ArrowRight,
  Check,
  X,
  Award,
} from 'lucide-react';
import { COLORS } from '../../../shared/design-tokens';
import './QuizResult.css';

export function QuizResult({
  score,
  totalQuestions,
  passingScore = 70,
  timeSpent, // in seconds
  answers = [], // Array of { question, selectedAnswer, isCorrect }
  onRetry,
  onContinue,
  canRetry = true,
}) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassed = percentage >= passingScore;

  // Format time
  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get grade
  const getGrade = () => {
    if (percentage >= 90) return { label: 'Xuất sắc', color: COLORS.success };
    if (percentage >= 80) return { label: 'Giỏi', color: COLORS.info };
    if (percentage >= 70) return { label: 'Khá', color: COLORS.primary };
    if (percentage >= 50) return { label: 'Trung bình', color: COLORS.warning };
    return { label: 'Cần cải thiện', color: COLORS.error };
  };

  const grade = getGrade();

  return (
    <motion.div
      className="quiz-result"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="result-header">
        <motion.div
          className="result-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{
            backgroundColor: isPassed ? `${COLORS.success}20` : `${COLORS.error}20`,
          }}
        >
          {isPassed ? (
            <Trophy size={48} color={COLORS.success} />
          ) : (
            <Target size={48} color={COLORS.error} />
          )}
        </motion.div>

        <h2
          className="result-title"
          style={{ color: isPassed ? COLORS.success : COLORS.error }}
        >
          {isPassed ? 'Chúc mừng!' : 'Chưa đạt'}
        </h2>

        <p className="result-subtitle">
          {isPassed
            ? 'Bạn đã hoàn thành bài kiểm tra thành công'
            : `Cần đạt tối thiểu ${passingScore}% để vượt qua`}
        </p>
      </div>

      {/* Score Circle */}
      <motion.div
        className="score-circle"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <svg className="score-svg" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={COLORS.borderLight}
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={grade.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 339.292} 339.292`}
            transform="rotate(-90 60 60)"
            initial={{ strokeDasharray: '0 339.292' }}
            animate={{ strokeDasharray: `${(percentage / 100) * 339.292} 339.292` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="score-content">
          <span className="score-value" style={{ color: grade.color }}>
            {percentage}%
          </span>
          <span className="score-label">{grade.label}</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="result-stats">
        <div className="stat-item">
          <div className="stat-icon" style={{ backgroundColor: `${COLORS.success}20` }}>
            <Check size={18} color={COLORS.success} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{score}</span>
            <span className="stat-label">Câu đúng</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon" style={{ backgroundColor: `${COLORS.error}20` }}>
            <X size={18} color={COLORS.error} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalQuestions - score}</span>
            <span className="stat-label">Câu sai</span>
          </div>
        </div>

        {timeSpent && (
          <div className="stat-item">
            <div className="stat-icon" style={{ backgroundColor: `${COLORS.info}20` }}>
              <Clock size={18} color={COLORS.info} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{formatTime(timeSpent)}</span>
              <span className="stat-label">Thời gian</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="result-actions">
        {!isPassed && canRetry && (
          <motion.button
            className="btn-retry"
            onClick={onRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCcw size={18} />
            Làm lại
          </motion.button>
        )}

        <motion.button
          className="btn-continue"
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
          }}
        >
          {isPassed ? (
            <>
              Tiếp tục học <ArrowRight size={18} />
            </>
          ) : (
            'Xem lại bài học'
          )}
        </motion.button>
      </div>

      {/* Breakdown (optional) */}
      {answers.length > 0 && (
        <div className="result-breakdown">
          <h4 className="breakdown-title">Chi tiết câu trả lời</h4>
          <div className="breakdown-list">
            {answers.map((answer, index) => (
              <div
                key={index}
                className={`breakdown-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <span className="breakdown-number">Câu {index + 1}</span>
                <div
                  className="breakdown-status"
                  style={{
                    backgroundColor: answer.isCorrect
                      ? `${COLORS.success}20`
                      : `${COLORS.error}20`,
                  }}
                >
                  {answer.isCorrect ? (
                    <Check size={14} color={COLORS.success} />
                  ) : (
                    <X size={14} color={COLORS.error} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default QuizResult;
