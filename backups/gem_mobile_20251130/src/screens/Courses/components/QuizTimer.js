/**
 * Gemral - Quiz Timer Component
 * Countdown timer for timed quizzes
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Clock, AlertTriangle } from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

const QuizTimer = ({
  totalMinutes,
  onTimeUp,
  isPaused = false,
  warningThreshold = 60, // seconds remaining to show warning
}) => {
  const [timeRemaining, setTimeRemaining] = useState(totalMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown effect
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, onTimeUp]);

  // Warning state
  useEffect(() => {
    if (timeRemaining <= warningThreshold && timeRemaining > 0) {
      setIsWarning(true);
    }
  }, [timeRemaining, warningThreshold]);

  // Pulse animation for warning
  useEffect(() => {
    if (isWarning && timeRemaining > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isWarning, timeRemaining, pulseAnim]);

  // Calculate progress percentage
  const progress = (timeRemaining / (totalMinutes * 60)) * 100;

  // Determine color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 30) return COLORS.error;
    if (timeRemaining <= warningThreshold) return COLORS.gold;
    return COLORS.textPrimary;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.timerBox,
          isWarning && styles.timerBoxWarning,
          timeRemaining <= 30 && styles.timerBoxCritical,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        {isWarning ? (
          <AlertTriangle size={18} color={getTimerColor()} />
        ) : (
          <Clock size={18} color={getTimerColor()} />
        )}
        <Text style={[styles.timerText, { color: getTimerColor() }]}>
          {formatTime(timeRemaining)}
        </Text>
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: getTimerColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* Warning Text */}
      {isWarning && timeRemaining > 0 && (
        <Text style={styles.warningText}>
          {timeRemaining <= 30 ? 'Sắp hết giờ!' : 'Còn ít thời gian!'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  timerBoxWarning: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: COLORS.gold,
  },
  timerBoxCritical: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: COLORS.error,
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  progressContainer: {
    width: 100,
    marginTop: SPACING.xs,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: 2,
  },
});

export default QuizTimer;
