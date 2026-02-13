/**
 * VisionBoardPage
 * Main dashboard for Vision Board feature
 *
 * @fileoverview Goals, habits, affirmations dashboard
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Target, CheckSquare, Heart, Settings,
  ChevronRight, Zap, TrendingUp
} from 'lucide-react';
import { VisionBoardProvider, useVisionBoard } from '../../contexts/VisionBoardContext';
import {
  GoalCard,
  HabitCard,
  AffirmationCard,
  ProgressRing,
  StreakBadge,
  QuotaBar,
  DailyScoreCard,
  LifeAreaSelector,
} from '../../components/VisionBoard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { COLORS, ANIMATION } from '../../../../web design-tokens';
import './VisionBoardPage.css';

/**
 * VisionBoardContent - Main content (inside provider)
 */
const VisionBoardContent = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    tier,
    // Goals
    filteredGoals,
    deleteGoal,
    completeGoal,
    // Habits
    todaysHabits,
    completedHabitsToday,
    checkHabit,
    uncheckHabit,
    // Affirmations
    todaysAffirmation,
    toggleFavorite,
    logReading,
    // Stats
    userStats,
    dailyScore,
    quotas,
    // Filters
    selectedLifeArea,
    setSelectedLifeArea,
    // Actions
    refresh,
  } = useVisionBoard();

  const [showFABMenu, setShowFABMenu] = useState(false);

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading Vision Board..." fullScreen />;
  }

  // Error state
  if (error) {
    return (
      <div className="vision-board-error">
        <p>Error loading Vision Board</p>
        <button onClick={refresh}>Try Again</button>
      </div>
    );
  }

  const handleHabitCheck = async (habitId, shouldCheck) => {
    if (shouldCheck) {
      await checkHabit(habitId);
    } else {
      await uncheckHabit(habitId);
    }
  };

  const handleGoalComplete = async (goalId) => {
    await completeGoal(goalId);
  };

  const handleGoalDelete = async (goalId) => {
    await deleteGoal(goalId);
  };

  const handleGoalEdit = (goal) => {
    navigate(`/vision-board/goals/${goal.id}`);
  };

  const handleUpgrade = () => {
    navigate('/account/subscription');
  };

  // FAB menu actions
  const fabActions = [
    { icon: Target, label: 'New Goal', path: '/vision-board/goals/new', color: COLORS.primary },
    { icon: CheckSquare, label: 'New Habit', path: '/vision-board/habits?new=true', color: COLORS.success },
    { icon: Heart, label: 'New Affirmation', path: '/vision-board/affirmations?new=true', color: '#FF69B4' },
  ];

  return (
    <div className="vision-board-page">
      {/* Header */}
      <header className="vision-board-header">
        <div className="vision-board-header-left">
          <h1>Vision Board</h1>
          <p className="vision-board-subtitle">Track your goals, habits & affirmations</p>
        </div>

        <div className="vision-board-header-right">
          {/* XP Badge */}
          <div className="vision-board-xp-badge" title="Your total XP earned">
            <Zap size={16} style={{ color: COLORS.primary }} />
            <span>{userStats?.total_xp || 0}</span>
            <span className="vision-board-xp-label">XP</span>
          </div>

          {/* Streak Badge */}
          <StreakBadge
            streak={userStats?.current_streak || 0}
            size="md"
            tooltip="Consecutive days of activity"
          />

          {/* Settings */}
          <button
            className="vision-board-settings-btn"
            onClick={() => navigate('/vision-board/settings')}
            aria-label="Vision Board Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="vision-board-stats-row">
        <DailyScoreCard dailyScore={dailyScore} />
      </div>

      {/* Life Area Filter */}
      <section className="vision-board-section">
        <LifeAreaSelector
          selected={selectedLifeArea}
          onSelect={setSelectedLifeArea}
        />
      </section>

      {/* Today's Affirmation */}
      <section className="vision-board-section">
        <div className="vision-board-section-header">
          <div className="vision-board-section-title">
            <Heart size={18} style={{ color: '#FF69B4' }} />
            <h2>Today's Affirmation</h2>
          </div>
          <button
            className="vision-board-section-link"
            onClick={() => navigate('/vision-board/affirmations')}
          >
            View All <ChevronRight size={16} />
          </button>
        </div>
        <AffirmationCard
          affirmation={todaysAffirmation}
          onFavorite={toggleFavorite}
          onRead={logReading}
          onNext={() => refresh()}
        />
      </section>

      {/* Today's Habits */}
      <section className="vision-board-section">
        <div className="vision-board-section-header">
          <div className="vision-board-section-title">
            <CheckSquare size={18} style={{ color: COLORS.success }} />
            <h2>Today's Habits</h2>
            <span className="vision-board-section-count">
              {completedHabitsToday}/{todaysHabits.length}
            </span>
          </div>
          <button
            className="vision-board-section-link"
            onClick={() => navigate('/vision-board/habits')}
          >
            Manage <ChevronRight size={16} />
          </button>
        </div>

        {todaysHabits.length === 0 ? (
          <div className="vision-board-empty">
            <CheckSquare size={32} />
            <p>No habits for today</p>
            <button
              className="vision-board-empty-btn"
              onClick={() => navigate('/vision-board/habits?new=true')}
            >
              Create Habit
            </button>
          </div>
        ) : (
          <div className="vision-board-habits-grid">
            <AnimatePresence>
              {todaysHabits.slice(0, 5).map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onCheck={handleHabitCheck}
                  onEdit={(h) => navigate(`/vision-board/habits?edit=${h.id}`)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {todaysHabits.length > 5 && (
          <button
            className="vision-board-show-more"
            onClick={() => navigate('/vision-board/habits')}
          >
            Show {todaysHabits.length - 5} more habits
          </button>
        )}
      </section>

      {/* Goals */}
      <section className="vision-board-section">
        <div className="vision-board-section-header">
          <div className="vision-board-section-title">
            <Target size={18} style={{ color: COLORS.primary }} />
            <h2>Goals</h2>
            <span className="vision-board-section-count">
              {filteredGoals.length}
            </span>
          </div>
          <button
            className="vision-board-section-link"
            onClick={() => navigate('/vision-board/goals/new')}
          >
            <Plus size={16} /> New
          </button>
        </div>

        {filteredGoals.length === 0 ? (
          <div className="vision-board-empty">
            <Target size={32} />
            <p>
              {selectedLifeArea
                ? 'No goals in this category'
                : 'No goals yet'}
            </p>
            <button
              className="vision-board-empty-btn"
              onClick={() => navigate('/vision-board/goals/new')}
            >
              Create Goal
            </button>
          </div>
        ) : (
          <div className="vision-board-goals-grid">
            <AnimatePresence>
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onComplete={handleGoalComplete}
                  onDelete={handleGoalDelete}
                  onEdit={handleGoalEdit}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Quotas */}
      <section className="vision-board-section vision-board-quotas">
        <h3 className="vision-board-quotas-title">Your Limits</h3>
        <div className="vision-board-quotas-grid">
          <QuotaBar
            label="Goals"
            current={quotas?.goals?.current || 0}
            limit={quotas?.goals?.limit || 3}
            tier={tier}
            onUpgrade={handleUpgrade}
          />
          <QuotaBar
            label="Habits"
            current={quotas?.habits?.current || 0}
            limit={quotas?.habits?.limit || 3}
            tier={tier}
            onUpgrade={handleUpgrade}
          />
          <QuotaBar
            label="Affirmations"
            current={quotas?.affirmations?.current || 0}
            limit={quotas?.affirmations?.limit || 5}
            tier={tier}
            onUpgrade={handleUpgrade}
          />
        </div>
      </section>

      {/* FAB */}
      <div className="vision-board-fab-container">
        <AnimatePresence>
          {showFABMenu && (
            <motion.div
              className="vision-board-fab-menu"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
            >
              {fabActions.map((action, index) => (
                <motion.button
                  key={action.path}
                  className="vision-board-fab-action"
                  onClick={() => {
                    setShowFABMenu(false);
                    navigate(action.path);
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ '--fab-color': action.color }}
                >
                  <span>{action.label}</span>
                  <div className="vision-board-fab-action-icon" style={{ backgroundColor: action.color }}>
                    <action.icon size={18} color="#fff" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="vision-board-fab"
          onClick={() => setShowFABMenu(!showFABMenu)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: showFABMenu ? 45 : 0 }}
        >
          <Plus size={24} />
        </motion.button>

        {showFABMenu && (
          <div
            className="vision-board-fab-overlay"
            onClick={() => setShowFABMenu(false)}
          />
        )}
      </div>
    </div>
  );
};

/**
 * VisionBoardPage - Wrapped with provider
 */
const VisionBoardPage = () => {
  return (
    <VisionBoardProvider>
      <VisionBoardContent />
    </VisionBoardProvider>
  );
};

export default VisionBoardPage;
