/**
 * QuizTimer - Match Mobile Design
 * Countdown timer for timed quizzes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { COLORS } from '../../../shared/design-tokens';
import './QuizTimer.css';

export function QuizTimer({
  totalSeconds,
  onTimeUp,
  isPaused = false,
  showWarningAt = 60, // Show warning when less than 60 seconds
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isWarning, setIsWarning] = useState(false);

  // Format time as mm:ss
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progressPercent = (remainingSeconds / totalSeconds) * 100;

  // Countdown effect
  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, remainingSeconds, onTimeUp]);

  // Warning effect
  useEffect(() => {
    if (remainingSeconds <= showWarningAt && remainingSeconds > 0) {
      setIsWarning(true);
    }
  }, [remainingSeconds, showWarningAt]);

  // Determine color based on time remaining
  const getColor = () => {
    if (remainingSeconds <= 30) return COLORS.error;
    if (remainingSeconds <= showWarningAt) return COLORS.warning;
    return COLORS.info;
  };

  const timerColor = getColor();

  return (
    <motion.div
      className={`quiz-timer ${isWarning ? 'is-warning' : ''}`}
      animate={
        isWarning && remainingSeconds <= 30
          ? { scale: [1, 1.05, 1] }
          : {}
      }
      transition={{ repeat: Infinity, duration: 1 }}
    >
      {/* Timer Icon */}
      <div className="timer-icon" style={{ color: timerColor }}>
        {remainingSeconds <= 30 ? (
          <AlertTriangle size={20} />
        ) : (
          <Clock size={20} />
        )}
      </div>

      {/* Timer Display */}
      <div className="timer-display">
        <span
          className="timer-value"
          style={{ color: timerColor }}
        >
          {formatTime(remainingSeconds)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="timer-progress">
        <motion.div
          className="timer-progress-fill"
          initial={{ width: '100%' }}
          animate={{ width: `${progressPercent}%` }}
          style={{ backgroundColor: timerColor }}
        />
      </div>
    </motion.div>
  );
}

export default QuizTimer;
