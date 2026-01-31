/**
 * GoalCard Component
 * Displays a goal with progress, life area badge, and actions
 *
 * @fileoverview Responsive goal card using design tokens
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Target, Calendar, CheckCircle, MoreHorizontal,
  AlertTriangle, ArrowRight, Trash2, Edit, Flag
} from 'lucide-react';
import { COLORS, SPACING, RADIUS, SHADOWS, ANIMATION } from '../../../../web design-tokens';
import { LIFE_AREAS, GOAL_STATUS } from '../../services/visionBoard/goalService';
import ProgressBar from './ProgressBar';
import './GoalCard.css';

/**
 * GoalCard - Displays a single goal
 *
 * @param {Object} goal - Goal data
 * @param {Function} onComplete - Complete goal callback
 * @param {Function} onDelete - Delete goal callback
 * @param {Function} onEdit - Edit goal callback
 * @param {boolean} compact - Compact mode for lists
 */
const GoalCard = ({
  goal,
  onComplete,
  onDelete,
  onEdit,
  compact = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);

  const lifeArea = LIFE_AREAS.find((la) => la.key === goal.life_area) || LIFE_AREAS[0];
  const isCompleted = goal.status === GOAL_STATUS.COMPLETED;
  const isOverdue = goal.isOverdue && !isCompleted;

  const handleClick = () => {
    if (!showMenu) {
      navigate(`/vision-board/goals/${goal.id}`);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleComplete = (e) => {
    e.stopPropagation();
    onComplete?.(goal.id);
    setShowMenu(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this goal?')) {
      onDelete?.(goal.id);
    }
    setShowMenu(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(goal);
    setShowMenu(false);
  };

  // Format target date
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <motion.div
      className={`goal-card ${compact ? 'goal-card-compact' : ''} ${isCompleted ? 'goal-card-completed' : ''} ${isOverdue ? 'goal-card-overdue' : ''} ${className}`}
      onClick={handleClick}
      whileHover={ANIMATION.cardHover}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      {/* Life Area Badge */}
      <div
        className="goal-card-badge"
        style={{
          backgroundColor: `${lifeArea.color}20`,
          color: lifeArea.color,
        }}
      >
        <Target size={12} />
        <span>{lifeArea.label}</span>
      </div>

      {/* Menu Button */}
      <button
        className="goal-card-menu-btn"
        onClick={handleMenuClick}
        aria-label="Goal options"
      >
        <MoreHorizontal size={20} />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <motion.div
          className="goal-card-menu"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          {!isCompleted && (
            <button onClick={handleComplete} className="goal-card-menu-item">
              <CheckCircle size={16} />
              <span>Mark Complete</span>
            </button>
          )}
          <button onClick={handleEdit} className="goal-card-menu-item">
            <Edit size={16} />
            <span>Edit</span>
          </button>
          <button onClick={handleDelete} className="goal-card-menu-item goal-card-menu-item-danger">
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </motion.div>
      )}

      {/* Title */}
      <h3 className="goal-card-title">
        {isCompleted && <CheckCircle size={18} className="goal-card-complete-icon" />}
        {goal.title}
      </h3>

      {/* Description */}
      {goal.description && !compact && (
        <p className="goal-card-description">{goal.description}</p>
      )}

      {/* Progress */}
      <div className="goal-card-progress-section">
        <div className="goal-card-progress-header">
          <span className="goal-card-progress-label">Progress</span>
          <span className="goal-card-progress-value">{goal.progress || 0}%</span>
        </div>
        <ProgressBar
          progress={goal.progress || 0}
          color={isCompleted ? COLORS.success : lifeArea.color}
          size="sm"
        />
      </div>

      {/* Footer */}
      <div className="goal-card-footer">
        {/* Target Date */}
        {goal.target_date && (
          <div className={`goal-card-date ${isOverdue ? 'goal-card-date-overdue' : ''}`}>
            {isOverdue ? (
              <AlertTriangle size={14} />
            ) : (
              <Calendar size={14} />
            )}
            <span>{formatDate(goal.target_date)}</span>
          </div>
        )}

        {/* Milestones Count */}
        {goal.milestones?.length > 0 && (
          <div className="goal-card-milestones">
            <Flag size={14} />
            <span>
              {goal.milestones.filter((m) => m.is_completed).length}/{goal.milestones.length}
            </span>
          </div>
        )}

        {/* View Arrow */}
        <ArrowRight size={16} className="goal-card-arrow" />
      </div>

      {/* Click overlay to close menu */}
      {showMenu && (
        <div
          className="goal-card-menu-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default GoalCard;
