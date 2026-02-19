/**
 * RitualsPage
 * Main listing page for all trader rituals
 *
 * @fileoverview Grid of ritual cards with tier access
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Lock, Clock, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEffectiveTier } from '../../services/visionBoard/tierService';
import {
  getRituals,
  getTodaysCompletedRituals,
  getRitualStreak,
} from '../../services/ritualService';
import { CosmicBackground, GlassCard } from '../../components/Rituals/cosmic';
import { StreakBadge } from '../../components/VisionBoard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { COLORS, TIER_STYLES } from '../../../../web design-tokens';
import './RitualsPage.css';

const RitualsPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const tier = getEffectiveTier(profile);

  const [rituals, setRituals] = useState([]);
  const [todaysCompleted, setTodaysCompleted] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Get rituals with access info
      const ritualsList = getRituals(tier);
      setRituals(ritualsList);

      // Get today's completed
      const { data: completed, error: completedError } = await getTodaysCompletedRituals(user.id);
      if (completedError) throw completedError;
      setTodaysCompleted((completed || []).map((c) => c.ritual_slug));

      // Get streak
      const { currentStreak } = await getRitualStreak(user.id);
      setStreak(currentStreak);
    } catch (err) {
      console.error('Error loading rituals:', err);
      setError('Failed to load rituals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, tier]);

  const handleRitualClick = (ritual) => {
    if (ritual.locked) {
      // Show upgrade prompt
      navigate('/account/subscription');
      return;
    }
    navigate(`/rituals/${ritual.id}`);
  };

  const completedToday = todaysCompleted.length;

  // Loading state
  if (loading) {
    return (
      <div className="rituals-page">
        <CosmicBackground color="#6A5BFF" starCount={80} />
        <LoadingSpinner message="Loading rituals..." fullScreen />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rituals-page">
        <CosmicBackground color="#6A5BFF" starCount={80} />
        <div className="rituals-page-error">
          <p>{error}</p>
          <button onClick={loadData}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rituals-page">
      <CosmicBackground color="#6A5BFF" starCount={80} />

      <div className="rituals-page-content">
        {/* Header */}
        <header className="rituals-page-header">
          <div className="rituals-page-header-left">
            <h1>Trader Rituals</h1>
            <p>Mindful practices for trading success</p>
          </div>

          <div className="rituals-page-header-right">
            <StreakBadge streak={streak} size="lg" showLabel />
          </div>
        </header>

        {/* Today's Progress */}
        <GlassCard className="rituals-page-progress">
          <div className="rituals-page-progress-content">
            <div className="rituals-page-progress-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={COLORS.accent}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={283}
                  strokeDashoffset={283 - (completedToday / rituals.length) * 283}
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (completedToday / rituals.length) * 283 }}
                  style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                />
              </svg>
              <span className="rituals-page-progress-text">
                {completedToday}/{rituals.length}
              </span>
            </div>

            <div className="rituals-page-progress-info">
              <h3>Today's Rituals</h3>
              <p>
                {completedToday === 0
                  ? 'Start your daily practice'
                  : completedToday === rituals.length
                    ? 'All rituals completed! 🌟'
                    : `${rituals.length - completedToday} more to go`}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Rituals Grid */}
        <div className="rituals-page-grid">
          <AnimatePresence>
            {rituals.map((ritual, index) => {
              const Icon = Icons[ritual.icon] || Icons.Sparkles;
              const isCompleted = todaysCompleted.includes(ritual.id);
              const tierStyle = TIER_STYLES[ritual.tier] || TIER_STYLES.FREE;

              return (
                <motion.div
                  key={ritual.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    hoverable
                    glowColor={`${ritual.color}40`}
                    onClick={() => handleRitualClick(ritual)}
                    className={`rituals-page-card ${ritual.locked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    {/* Locked badge */}
                    {ritual.locked && (
                      <div className="rituals-page-card-locked">
                        <Lock size={14} />
                        <span>{tierStyle.label}</span>
                      </div>
                    )}

                    {/* Completed badge */}
                    {isCompleted && (
                      <div className="rituals-page-card-completed">
                        <CheckCircle size={14} />
                        <span>Done</span>
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className="rituals-page-card-icon"
                      style={{
                        backgroundColor: `${ritual.color}20`,
                        color: ritual.color,
                        boxShadow: `0 0 30px ${ritual.color}30`,
                      }}
                    >
                      <Icon size={32} />
                    </div>

                    {/* Info */}
                    <h3 className="rituals-page-card-title">{ritual.name}</h3>
                    <p className="rituals-page-card-desc">{ritual.description}</p>

                    {/* Meta */}
                    <div className="rituals-page-card-meta">
                      <span className="rituals-page-card-duration">
                        <Clock size={14} />
                        {Math.floor(ritual.duration / 60)} min
                      </span>
                      <span
                        className="rituals-page-card-xp"
                        style={{ color: COLORS.primary }}
                      >
                        <Zap size={14} />
                        {ritual.xp} XP
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RitualsPage;
