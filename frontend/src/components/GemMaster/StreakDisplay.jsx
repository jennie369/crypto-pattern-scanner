/**
 * StreakDisplay - Web version (Framer Motion)
 * Shows current streak count with fire animation, weekly calendar view,
 * level progress bar, and mini celebration animation on streak increase.
 * Based on App's StreakDisplay.js with Framer Motion animations.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Star, TrendingUp, Award, ChevronRight, Crown, Target, Zap } from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, GRADIENTS, BREAKPOINTS } from '../../../../web design-tokens';

/**
 * Streak color thresholds (matching mobile)
 */
const getStreakColor = (streak) => {
  if (streak >= 30) return '#FFD700'; // Gold
  if (streak >= 7) return '#FF8C00';  // Dark orange
  if (streak >= 1) return '#FF6347';  // Tomato
  return COLORS.textDisabled;
};

/**
 * Day names for weekly calendar
 */
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Celebration particle for streak increase
 */
const CelebrationParticle = ({ index, color }) => {
  const angle = (index / 8) * Math.PI * 2;
  const distance = 40 + Math.random() * 30;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x,
        y,
        scale: 0,
        opacity: 0,
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        background: color,
        pointerEvents: 'none',
      }}
    />
  );
};

/**
 * Weekly calendar view showing completed days
 */
const WeeklyCalendar = ({ weeklyProgress = [] }) => {
  // Normalize to 7 entries (fill missing with false)
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(weeklyProgress[i] ?? false);
  }

  const today = new Date().getDay();
  // Convert JS Sunday=0 to Monday=0 format
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div
      role="group"
      aria-label="Weekly streak progress"
      style={styles.weeklyContainer}
    >
      {days.map((completed, i) => {
        const isToday = i === todayIndex;

        return (
          <div
            key={i}
            style={styles.dayColumn}
            aria-label={`${DAY_NAMES[i]}: ${completed ? 'completed' : 'not completed'}${isToday ? ' (today)' : ''}`}
          >
            <span
              style={{
                ...styles.dayName,
                color: isToday ? COLORS.primary : COLORS.textMuted,
                fontWeight: isToday ? TYPOGRAPHY.fontWeight.bold : TYPOGRAPHY.fontWeight.normal,
              }}
            >
              {DAY_NAMES[i]}
            </span>
            <motion.div
              initial={completed ? { scale: 0 } : false}
              animate={completed ? { scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: i * 0.05 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: completed
                  ? `linear-gradient(135deg, ${COLORS.primary}, #FF8A00)`
                  : isToday
                    ? 'rgba(255, 189, 89, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                border: completed
                  ? 'none'
                  : isToday
                    ? `2px dashed ${COLORS.primary}`
                    : `1px solid ${COLORS.borderLight}`,
                boxShadow: completed ? '0 2px 8px rgba(255, 189, 89, 0.3)' : 'none',
              }}
            >
              {completed ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.bgPrimary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : isToday ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: COLORS.primary,
                  }}
                />
              ) : null}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Level progress bar with XP
 */
const LevelProgressBar = ({ level = 1, levelName = 'Beginner', currentXP = 0, nextLevelXP = 100, levelColor = COLORS.primary }) => {
  const progress = nextLevelXP > 0 ? Math.min(currentXP / nextLevelXP, 1) : 0;
  const remaining = Math.max(nextLevelXP - currentXP, 0);

  return (
    <div style={styles.levelContainer}>
      {/* Level header */}
      <div style={styles.levelHeader}>
        <div style={styles.levelBadge}>
          <Star size={14} color={levelColor} />
          <span style={{ ...styles.levelText, color: levelColor }}>
            Lv.{level}
          </span>
          <span style={styles.levelName}>{levelName}</span>
        </div>
        <span style={styles.xpText}>
          {currentXP} / {nextLevelXP} XP
        </span>
      </div>

      {/* Progress bar */}
      <div style={styles.progressBarContainer}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(90deg, ${levelColor}, ${COLORS.primaryDark})`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shine effect */}
          <motion.div
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: '-50%',
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            }}
          />
        </motion.div>
      </div>

      {/* Remaining XP */}
      <span style={styles.remainingText}>
        {remaining > 0 ? `${remaining} XP to next level` : 'Max level reached!'}
      </span>
    </div>
  );
};

const StreakDisplay = ({
  streakData = {},
  compact = false,
  onPress,
  style: customStyle,
}) => {
  const {
    count = 0,
    level = 1,
    levelName = 'Beginner',
    levelColor,
    longestStreak = 0,
    weeklyProgress = [],
    xpProgress = {},
  } = streakData;

  const {
    currentXP = 0,
    nextLevelXP = 100,
  } = xpProgress;

  const [showCelebration, setShowCelebration] = useState(false);
  const prevCountRef = useRef(count);
  const streakColor = getStreakColor(count);
  const derivedLevelColor = levelColor || streakColor;

  // Detect streak increase for celebration
  useEffect(() => {
    if (count > prevCountRef.current && prevCountRef.current > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 1200);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  const isActive = count > 0;

  // Compact mode (for header/inline use)
  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPress}
        aria-label={`${count} day streak`}
        style={{
          ...styles.compactContainer,
          cursor: onPress ? 'pointer' : 'default',
          ...customStyle,
        }}
      >
        <motion.div
          animate={isActive ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame size={16} color={streakColor} fill={isActive ? streakColor : 'none'} />
        </motion.div>
        <span style={{ ...styles.compactCount, color: streakColor }}>
          {count}
        </span>
      </motion.button>
    );
  }

  // Full display mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION.spring}
      role="region"
      aria-label={`Streak: ${count} days. Level ${level}: ${levelName}.`}
      onClick={onPress}
      style={{
        ...styles.container,
        cursor: onPress ? 'pointer' : 'default',
        border: `1px solid ${isActive ? 'rgba(255, 189, 89, 0.2)' : COLORS.borderLight}`,
        ...customStyle,
      }}
    >
      {/* Top row: Fire + count + stats */}
      <div style={styles.topRow}>
        {/* Streak circle with fire */}
        <div style={styles.streakSection}>
          <div
            style={{
              ...styles.streakCircle,
              borderColor: streakColor,
              position: 'relative',
            }}
          >
            {/* Fire animation */}
            <motion.div
              animate={isActive ? {
                scale: [1, 1.15, 1],
                filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1)'],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flame
                size={28}
                color={streakColor}
                fill={isActive ? streakColor : 'none'}
              />
            </motion.div>

            <span style={{ ...styles.streakNumber, color: streakColor }}>
              {count}
            </span>

            {/* Celebration particles */}
            <AnimatePresence>
              {showCelebration && (
                <>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <CelebrationParticle
                      key={`particle-${i}`}
                      index={i}
                      color={i % 2 === 0 ? COLORS.primary : '#FF8A00'}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Celebration flash */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    position: 'absolute',
                    inset: -10,
                    borderRadius: '50%',
                    border: `2px solid ${COLORS.primary}`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </AnimatePresence>
          </div>
          <span style={styles.streakLabel}>day streak</span>
        </div>

        {/* Stats section */}
        <div style={styles.statsSection}>
          {/* Level */}
          <div style={styles.statRow}>
            <Star size={14} color={derivedLevelColor} />
            <span style={styles.statLabel}>Level {level}</span>
            <span style={styles.statValue}>{levelName}</span>
          </div>

          {/* XP */}
          <div style={styles.statRow}>
            <TrendingUp size={14} color={COLORS.success} />
            <span style={styles.statLabel}>XP</span>
            <span style={styles.statValue}>{currentXP}</span>
          </div>

          {/* Longest streak */}
          <div style={styles.statRow}>
            <Trophy size={14} color="#CD7F32" />
            <span style={styles.statLabel}>Best</span>
            <span style={styles.statValue}>{longestStreak} days</span>
          </div>
        </div>

        {/* Arrow for clickable */}
        {onPress && (
          <div style={styles.arrowContainer}>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </div>
        )}
      </div>

      {/* Weekly calendar */}
      {weeklyProgress.length > 0 && (
        <div style={styles.weeklySection}>
          <span style={styles.sectionLabel}>This Week</span>
          <WeeklyCalendar weeklyProgress={weeklyProgress} />
        </div>
      )}

      {/* Level progress */}
      <LevelProgressBar
        level={level}
        levelName={levelName}
        currentXP={currentXP}
        nextLevelXP={nextLevelXP}
        levelColor={derivedLevelColor}
      />

      {/* Streak celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: RADIUS.lg,
              background: 'radial-gradient(circle at center, rgba(255, 189, 89, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.base,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    background: COLORS.bgGlass,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  streakSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.xs,
    flexShrink: 0,
  },
  streakCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
    position: 'relative',
  },
  streakNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: -4,
    lineHeight: 1,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  statsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    width: 50,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },

  // Weekly calendar
  weeklySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTop: `1px solid ${COLORS.borderLight}`,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  weeklyContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  dayColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
    minWidth: 0,
  },
  dayName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
  },

  // Level progress
  levelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTop: `1px solid ${COLORS.borderLight}`,
  },
  levelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  levelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  levelName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  xpText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    background: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  remainingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Compact mode
  compactContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: SPACING.xs,
    background: 'rgba(255, 189, 89, 0.12)',
    border: 'none',
    padding: `6px ${SPACING.sm}px`,
    borderRadius: RADIUS.full,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  compactCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: 1,
  },
};

export default StreakDisplay;
