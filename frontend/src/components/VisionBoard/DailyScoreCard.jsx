/**
 * DailyScoreCard Component
 * Displays today's score with breakdown
 *
 * @fileoverview Daily progress summary card
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckSquare, Heart, Sparkles, Info } from 'lucide-react';
import { COLORS } from '../../../../web design-tokens';
import ProgressRing from './ProgressRing';
import './DailyScoreCard.css';

/**
 * DailyScoreCard - Today's progress summary
 *
 * @param {Object} dailyScore - Daily score data with breakdown
 */
const DailyScoreCard = ({
  dailyScore,
  className = '',
}) => {
  if (!dailyScore) {
    return (
      <div className={`daily-score-card daily-score-card-empty ${className}`}>
        <p>No data for today</p>
      </div>
    );
  }

  const { dailyScore: score, breakdown } = dailyScore;

  const categories = [
    {
      key: 'habits',
      label: 'Habits',
      icon: CheckSquare,
      color: COLORS.success,
      score: breakdown?.habits?.score || 0,
      detail: `${breakdown?.habits?.completed || 0}/${breakdown?.habits?.total || 0}`,
      weight: '40%',
    },
    {
      key: 'goals',
      label: 'Goals',
      icon: Target,
      color: COLORS.primary,
      score: breakdown?.goals?.score || 0,
      detail: `${breakdown?.goals?.active || 0} active`,
      weight: '30%',
    },
    {
      key: 'affirmations',
      label: 'Affirmations',
      icon: Heart,
      color: '#FF69B4',
      score: breakdown?.affirmations?.score || 0,
      detail: `${breakdown?.affirmations?.readToday || 0} read`,
      weight: '20%',
    },
    {
      key: 'rituals',
      label: 'Rituals',
      icon: Sparkles,
      color: COLORS.accent,
      score: breakdown?.rituals?.score || 0,
      detail: `${breakdown?.rituals?.completedToday || 0} done`,
      weight: '10%',
    },
  ];

  // Determine score message
  const getScoreMessage = () => {
    if (score >= 90) return "Outstanding! You're crushing it! 🌟";
    if (score >= 70) return "Great progress today! 💪";
    if (score >= 50) return "Good effort! Keep going! 👍";
    if (score >= 25) return "You've made a start! 🌱";
    return "Start your journey today! 🚀";
  };

  return (
    <motion.div
      className={`daily-score-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Main Score */}
      <div className="daily-score-main">
        <ProgressRing
          progress={score}
          size="lg"
          color={score >= 70 ? COLORS.success : score >= 40 ? COLORS.primary : COLORS.warning}
          strokeWidth={6}
        >
          <span className="daily-score-value">{score}</span>
          <span className="daily-score-label">Score</span>
        </ProgressRing>

        <div className="daily-score-info">
          <h3 className="daily-score-title">Today's Progress</h3>
          <p className="daily-score-message">{getScoreMessage()}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="daily-score-breakdown">
        {categories.map((cat) => (
          <div key={cat.key} className="daily-score-category">
            <div className="daily-score-category-header">
              <div className="daily-score-category-icon" style={{ color: cat.color }}>
                <cat.icon size={16} />
              </div>
              <span className="daily-score-category-label">{cat.label}</span>
              <span
                className="daily-score-category-weight"
                title={`This contributes ${cat.weight} to your daily score`}
              >
                ({cat.weight})
              </span>
            </div>
            <div className="daily-score-category-bar">
              <motion.div
                className="daily-score-category-fill"
                style={{ backgroundColor: cat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${cat.score}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </div>
            <div className="daily-score-category-detail">
              <span style={{ color: cat.color }}>{cat.score}%</span>
              <span>{cat.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      <div className="daily-score-tooltip">
        <Info size={12} />
        <span>
          Score = Habits (40%) + Goals (30%) + Affirmations (20%) + Rituals (10%)
        </span>
      </div>
    </motion.div>
  );
};

export default DailyScoreCard;
