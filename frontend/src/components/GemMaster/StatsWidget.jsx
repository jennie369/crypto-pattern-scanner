import React from 'react';
import { TrendingUp, Flame, Sparkles, Heart, BarChart2, ChevronRight } from 'lucide-react';
import './WidgetCards.css';

const StatsWidget = ({ stats = {} }) => {
  const {
    activeGoals = 0,
    streak = 0,
    affirmationsCompleted = 0,
    totalWidgets = 0,
  } = stats;

  const statItems = [
    { Icon: TrendingUp, value: activeGoals, label: 'Active Goals', color: '#FFBD59' },
    { Icon: Flame, value: streak, label: 'Day Streak', color: '#EF4444' },
    { Icon: Sparkles, value: affirmationsCompleted, label: 'Affirmations', color: '#8B5CF6' },
    { Icon: Heart, value: totalWidgets, label: 'Total Widgets', color: '#E91E63' },
  ];

  return (
    <div className="widget-card widget-card--stats">
      {/* Header */}
      <div className="widget-card__header">
        <div className="widget-card__title-row">
          <BarChart2 size={18} color="#FFBD59" />
          <span className="widget-card__title">Your Stats</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-widget__grid">
        {statItems.map((item, index) => (
          <div key={index} className="stats-widget__card">
            <item.Icon size={24} color={item.color} />
            <span className="stats-widget__number">{item.value}</span>
            <span className="stats-widget__label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* View Details */}
      <button className="stats-widget__details-btn">
        <span>View Details</span>
        <ChevronRight size={16} color="#FFBD59" />
      </button>
    </div>
  );
};

export default StatsWidget;
