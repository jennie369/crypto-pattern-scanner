/**
 * GamificationPage - Gamification dashboard
 * Sections: Level Card, Streak, Badges Grid, Daily Quests, Leaderboard Preview.
 * Uses useGamification and useStreak hooks.
 * Framer Motion stagger animations on badges.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Loader2, Flame, Trophy, Star, Target,
  Zap, Award, Crown, ChevronRight, Lock, Calendar, TrendingUp,
  Check, Gift,
} from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, TIER_STYLES, BREAKPOINTS } from '../../../../web design-tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useGamification } from '../../hooks/useGamification';
import { useStreak } from '../../hooks/useStreak';
import TierBadge from '../../components/GemMaster/TierBadge';

// ─────────────────────────────────────────────
// Level data (fallback)
// ─────────────────────────────────────────────

const LEVELS = [
  { level: 1, name: 'Apprentice', minXP: 0, icon: '🌱', color: '#3AF7A6' },
  { level: 2, name: 'Seeker', minXP: 100, icon: '🔮', color: '#00F0FF' },
  { level: 3, name: 'Adept', minXP: 300, icon: '⭐', color: '#6A5BFF' },
  { level: 4, name: 'Mystic', minXP: 600, icon: '🌙', color: '#8B7FFF' },
  { level: 5, name: 'Oracle', minXP: 1000, icon: '🔥', color: '#FF8A00' },
  { level: 6, name: 'Sage', minXP: 1500, icon: '👑', color: '#FFBD59' },
  { level: 7, name: 'Master', minXP: 2500, icon: '💎', color: '#E0C3FC' },
  { level: 8, name: 'Grand Master', minXP: 5000, icon: '🏆', color: '#FFD700' },
];

const getLevelInfo = (level) => LEVELS.find(l => l.level === level) || LEVELS[0];
const getNextLevel = (level) => LEVELS.find(l => l.level === level + 1) || null;

// ─────────────────────────────────────────────
// Day names for weekly calendar
// ─────────────────────────────────────────────

const DAY_NAMES_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = {
  container: {
    minHeight: '100vh',
    background: COLORS.bgPrimary,
    color: COLORS.textPrimary,
    paddingBottom: SPACING['4xl'],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.md,
    padding: `${SPACING.lg}px ${SPACING.base}px`,
    borderBottom: `1px solid ${COLORS.borderLight}`,
    position: 'sticky',
    top: 0,
    background: COLORS.bgPrimary,
    zIndex: 10,
    backdropFilter: 'blur(12px)',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: RADIUS.md,
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    cursor: 'pointer',
    color: COLORS.textPrimary,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    cursor: 'pointer',
    color: COLORS.textMuted,
  },
  contentWrapper: {
    padding: `${SPACING.lg}px ${SPACING.base}px`,
    maxWidth: 1200,
    margin: '0 auto',
  },
  twoColGrid: {
    display: 'grid',
    gap: SPACING.lg,
  },
  // ─── Level Card ───
  levelCard: (color) => ({
    background: `linear-gradient(135deg, ${color}15 0%, ${COLORS.bgCard} 100%)`,
    border: `1px solid ${color}33`,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.md,
    textAlign: 'center',
  }),
  levelIcon: {
    fontSize: 48,
    lineHeight: 1,
  },
  levelNumber: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  levelName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  progressBarOuter: {
    width: '100%',
    height: 10,
    borderRadius: RADIUS.full,
    background: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressBarInner: (pct, color) => ({
    height: '100%',
    width: `${Math.min(pct * 100, 100)}%`,
    borderRadius: RADIUS.full,
    background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`,
    transition: 'width 0.6s ease',
  }),
  xpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  // ─── Streak Section ───
  streakSection: {
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.base,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  streakRow: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  streakStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  streakNum: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  weekRow: {
    display: 'flex',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  dayCell: (completed) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  }),
  dayDot: (completed) => ({
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: completed ? 'rgba(58, 247, 166, 0.2)' : 'rgba(255,255,255,0.05)',
    border: `2px solid ${completed ? COLORS.success : 'rgba(255,255,255,0.1)'}`,
    color: completed ? COLORS.success : COLORS.textDisabled,
    fontSize: TYPOGRAPHY.fontSize.xs,
  }),
  dayName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  // ─── Badges Grid ───
  badgesSection: {
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  badgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: SPACING.md,
  },
  badgeItem: (earned) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    background: earned ? 'rgba(255, 189, 89, 0.08)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${earned ? 'rgba(255, 189, 89, 0.2)' : 'rgba(255,255,255,0.05)'}`,
    opacity: earned ? 1 : 0.5,
    textAlign: 'center',
    transition: 'all 0.2s',
  }),
  badgeIcon: {
    fontSize: 28,
    lineHeight: 1,
  },
  badgeName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  badgeReq: {
    fontSize: 9,
    color: COLORS.textMuted,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  // ─── Daily Quests ───
  questsSection: {
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  questItem: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.md,
    padding: `${SPACING.md}px 0`,
    borderBottom: `1px solid ${COLORS.borderLight}`,
  },
  questCheck: (done) => ({
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: RADIUS.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: done ? 'rgba(58, 247, 166, 0.2)' : 'rgba(255,255,255,0.05)',
    border: `2px solid ${done ? COLORS.success : 'rgba(255,255,255,0.15)'}`,
    color: done ? COLORS.success : COLORS.textDisabled,
  }),
  questContent: {
    flex: 1,
  },
  questName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: 2,
  },
  questXP: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
  questProgressOuter: {
    height: 6,
    borderRadius: RADIUS.full,
    background: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  questProgressInner: (pct, done) => ({
    height: '100%',
    width: `${pct}%`,
    borderRadius: RADIUS.full,
    background: done ? COLORS.success : COLORS.accent,
    transition: 'width 0.4s ease',
  }),
  // ─── Leaderboard ───
  leaderSection: {
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  leaderItem: (rank) => ({
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.md,
    padding: `${SPACING.md}px 0`,
    borderBottom: `1px solid ${COLORS.borderLight}`,
  }),
  rankBadge: (rank) => ({
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: RADIUS.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: rank <= 3
      ? rank === 1 ? 'rgba(255, 215, 0, 0.2)'
        : rank === 2 ? 'rgba(192, 192, 192, 0.2)'
          : 'rgba(205, 127, 50, 0.2)'
      : 'rgba(255,255,255,0.05)',
    color: rank === 1 ? '#FFD700'
      : rank === 2 ? '#C0C0C0'
        : rank === 3 ? '#CD7F32'
          : COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  }),
  leaderName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  leaderXP: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // ─── Loading skeleton ───
  skeletonCard: {
    height: 180,
    background: `linear-gradient(90deg, ${COLORS.bgCard} 25%, ${COLORS.bgCardHover} 50%, ${COLORS.bgCard} 75%)`,
    backgroundSize: '200% 100%',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  // ─── Error ───
  errorBox: {
    textAlign: 'center',
    padding: SPACING['2xl'],
    color: COLORS.error,
  },
  retryBtn: {
    marginTop: SPACING.md,
    height: 44,
    padding: `0 ${SPACING.xl}px`,
    borderRadius: RADIUS.md,
    background: COLORS.accent,
    border: 'none',
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
  },
};

// ─────────────────────────────────────────────
// Fallback daily quests
// ─────────────────────────────────────────────

const DEFAULT_QUESTS = [
  { id: 'affirmation', name: 'Doc Affirmation', xp: 10, key: 'affirmationDone' },
  { id: 'habit', name: 'Ghi nhan Habit', xp: 10, key: 'habitDone' },
  { id: 'goal', name: 'Cap nhat Goal', xp: 15, key: 'goalDone' },
  { id: 'action', name: 'Hoan thanh Action', xp: 20, key: 'actionDone' },
];

// ─────────────────────────────────────────────
// Placeholder leaderboard
// ─────────────────────────────────────────────

const PLACEHOLDER_LEADERS = [
  { rank: 1, name: 'Minh T.', xp: 2450 },
  { rank: 2, name: 'Linh N.', xp: 2100 },
  { rank: 3, name: 'Huy P.', xp: 1880 },
  { rank: 4, name: 'Anh K.', xp: 1650 },
  { rank: 5, name: 'Trang L.', xp: 1520 },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function GamificationPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const {
    level: gamLevel,
    levelName: gamLevelName,
    xp: gamXP,
    xpToNext: gamXPToNext,
    xpProgress: gamXPProgress,
    achievements: gamAchievements,
    dailyQuests: gamDailyQuests,
    loading: gamLoading,
    error: gamError,
    refreshGamification,
  } = useGamification();

  const {
    streakCount,
    longestStreak,
    weeklyProgress,
    badges,
    earnedBadgesCount,
    totalBadges,
    loading: streakLoading,
    error: streakError,
    refreshStreak,
  } = useStreak('general');

  const loading = gamLoading || streakLoading;
  const error = gamError || streakError;

  const [refreshing, setRefreshing] = useState(false);

  // ─────────────────── Responsive ───────────────────

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= BREAKPOINTS.lg);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= BREAKPOINTS.lg);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ─────────────────── Refresh ───────────────────

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshGamification?.(),
        refreshStreak?.(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // ─────────────────── Level info ───────────────────

  const currentLevel = getLevelInfo(gamLevel || 1);
  const nextLevel = getNextLevel(gamLevel || 1);

  // ─────────────────── Render helpers ───────────────────

  const renderSkeleton = () => (
    <div style={styles.contentWrapper}>
      {[180, 200, 240, 160].map((h, i) => (
        <div key={i} style={{ ...styles.skeletonCard, height: h }} />
      ))}
    </div>
  );

  const renderLevelCard = () => (
    <motion.div
      style={styles.levelCard(currentLevel.color)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={styles.levelIcon}>{currentLevel.icon}</div>
      <div>
        <div style={{ ...styles.levelNumber, color: currentLevel.color }}>
          Level {gamLevel || 1}
        </div>
        <div style={styles.levelName}>
          {gamLevelName || currentLevel.name}
        </div>
      </div>

      {/* XP Progress */}
      <div style={{ width: '100%' }}>
        <div style={styles.progressBarOuter}>
          <motion.div
            style={styles.progressBarInner(gamXPProgress || 0, currentLevel.color)}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((gamXPProgress || 0) * 100, 100)}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div style={styles.xpText}>
          {gamXP || 0} XP
          {nextLevel && ` / ${nextLevel.minXP} XP (con ${gamXPToNext || 0} XP nua)`}
        </div>
      </div>
    </motion.div>
  );

  const renderStreakSection = () => (
    <motion.div
      style={styles.streakSection}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <div style={styles.sectionTitle}>
        <Flame size={20} color="#FF6347" />
        Streak
      </div>

      <div style={styles.streakRow}>
        <div style={styles.streakStat}>
          <div style={{ ...styles.streakNum, color: '#FF6347' }}>
            {streakCount || 0}
          </div>
          <div style={styles.streakLabel}>Hien tai</div>
        </div>
        <div style={styles.streakStat}>
          <div style={{ ...styles.streakNum, color: COLORS.primary }}>
            {longestStreak || 0}
          </div>
          <div style={styles.streakLabel}>Ky luc</div>
        </div>
      </div>

      {/* Weekly calendar */}
      <div style={styles.weekRow}>
        {DAY_NAMES_SHORT.map((day, i) => {
          const dayData = weeklyProgress?.[i];
          const completed = dayData?.completed || false;
          return (
            <div key={day} style={styles.dayCell(completed)}>
              <motion.div
                style={styles.dayDot(completed)}
                initial={false}
                animate={completed ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {completed ? <Check size={14} /> : ''}
              </motion.div>
              <span style={styles.dayName}>{day}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderBadgesGrid = () => {
    const badgeList = badges && badges.length > 0 ? badges : [];
    return (
      <motion.div
        style={styles.badgesSection}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div style={styles.sectionTitle}>
          <Award size={20} color={COLORS.primary} />
          Badges ({earnedBadgesCount || 0}/{totalBadges || 0})
        </div>

        <motion.div
          style={styles.badgesGrid}
          variants={{
            show: { transition: { staggerChildren: 0.05 } },
          }}
          initial="hidden"
          animate="show"
        >
          {badgeList.map((badge, idx) => (
            <motion.div
              key={badge.id || idx}
              style={styles.badgeItem(badge.earned)}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                show: { opacity: badge.earned ? 1 : 0.5, scale: 1 },
              }}
              whileHover={badge.earned ? { scale: 1.08, borderColor: 'rgba(255, 189, 89, 0.4)' } : {}}
            >
              <span style={styles.badgeIcon}>{badge.icon || '🏅'}</span>
              <span style={styles.badgeName}>{badge.name || badge.label}</span>
              {!badge.earned && badge.requirement && (
                <span style={styles.badgeReq}>{badge.requirement}</span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {badgeList.length === 0 && (
          <div style={{ textAlign: 'center', padding: SPACING.xl, color: COLORS.textMuted }}>
            Bat dau su dung GEM de mo khoa badges!
          </div>
        )}
      </motion.div>
    );
  };

  const renderDailyQuests = () => {
    const quests = DEFAULT_QUESTS.map(q => ({
      ...q,
      done: gamDailyQuests?.[q.key] || false,
    }));
    const completed = quests.filter(q => q.done).length;
    const totalPct = quests.length > 0 ? (completed / quests.length) * 100 : 0;

    return (
      <motion.div
        style={styles.questsSection}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div style={styles.sectionTitle}>
          <Target size={20} color={COLORS.accent} />
          Daily Quests ({completed}/{quests.length})
        </div>

        {/* Overall progress */}
        <div style={{ marginBottom: SPACING.base }}>
          <div style={styles.questProgressOuter}>
            <motion.div
              style={styles.questProgressInner(totalPct, completed === quests.length)}
              initial={{ width: 0 }}
              animate={{ width: `${totalPct}%` }}
              transition={{ delay: 0.4, duration: 0.6 }}
            />
          </div>
        </div>

        {quests.map((quest, idx) => (
          <div
            key={quest.id}
            style={{
              ...styles.questItem,
              ...(idx === quests.length - 1 ? { borderBottom: 'none' } : {}),
            }}
          >
            <div style={styles.questCheck(quest.done)}>
              {quest.done && <Check size={16} />}
            </div>
            <div style={styles.questContent}>
              <div style={{
                ...styles.questName,
                textDecoration: quest.done ? 'line-through' : 'none',
                color: quest.done ? COLORS.textMuted : COLORS.textPrimary,
              }}>
                {quest.name}
              </div>
              <div style={styles.questXP}>+{quest.xp} XP</div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  };

  const renderLeaderboard = () => (
    <motion.div
      style={styles.leaderSection}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <div style={styles.sectionTitle}>
        <Trophy size={20} color="#FFD700" />
        Leaderboard (Tuan nay)
      </div>

      {PLACEHOLDER_LEADERS.map((leader, idx) => (
        <div
          key={idx}
          style={{
            ...styles.leaderItem(leader.rank),
            ...(idx === PLACEHOLDER_LEADERS.length - 1 ? { borderBottom: 'none' } : {}),
          }}
        >
          <div style={styles.rankBadge(leader.rank)}>
            {leader.rank <= 3 ? (
              leader.rank === 1 ? <Crown size={16} /> : <Star size={14} />
            ) : (
              leader.rank
            )}
          </div>
          <div style={styles.leaderName}>{leader.name}</div>
          <div style={styles.leaderXP}>{leader.xp.toLocaleString()} XP</div>
        </div>
      ))}
    </motion.div>
  );

  // ─────────────────── Main render ───────────────────

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <motion.button
          style={styles.iconBtn}
          whileHover={{ background: COLORS.bgCardHover }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 style={styles.headerTitle}>Gamification</h1>
        {profile && <TierBadge tier={profile.scanner_tier || 'FREE'} size="small" />}
        <motion.button
          style={styles.refreshBtn}
          whileHover={{ color: COLORS.textPrimary }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh"
        >
          <motion.div
            animate={refreshing ? { rotate: 360 } : {}}
            transition={refreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
          >
            <RefreshCw size={18} />
          </motion.div>
        </motion.button>
      </div>

      {/* Content */}
      {loading && !refreshing ? (
        renderSkeleton()
      ) : error ? (
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={handleRefresh}>
            Thu lai
          </button>
        </div>
      ) : (
        <div style={styles.contentWrapper}>
          <div style={{
            ...styles.twoColGrid,
            gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
          }}>
            {/* Left column / full width on mobile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.lg }}>
              {renderLevelCard()}
              {renderStreakSection()}
              {renderDailyQuests()}
            </div>

            {/* Right column / below on mobile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.lg }}>
              {renderBadgesGrid()}
              {renderLeaderboard()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
