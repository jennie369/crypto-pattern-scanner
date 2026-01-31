/**
 * HabitCard Component
 * Displays a habit with checkbox and streak info
 *
 * @fileoverview Responsive habit card for daily tracking
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { COLORS, ANIMATION } from '../../../../web design-tokens';
import { HABIT_CATEGORIES } from '../../services/visionBoard/habitService';
import './HabitCard.css';

/**
 * HabitCard - Single habit with checkbox
 *
 * @param {Object} habit - Habit data
 * @param {Function} onCheck - Check/uncheck callback
 * @param {Function} onEdit - Edit callback
 * @param {Function} onDelete - Delete callback
 */
const HabitCard = ({
  habit,
  onCheck,
  onEdit,
  onDelete,
  className = '',
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const category = HABIT_CATEGORIES.find((c) => c.key === habit.category) || HABIT_CATEGORIES[0];
  const isCompleted = habit.completedToday;

  const handleCheckClick = (e) => {
    e.stopPropagation();
    onCheck?.(habit.id, !isCompleted);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(habit);
    setShowMenu(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this habit?')) {
      onDelete?.(habit.id);
    }
    setShowMenu(false);
  };

  return (
    <motion.div
      className={`habit-card ${isCompleted ? 'habit-card-completed' : ''} ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      {/* Checkbox */}
      <button
        className={`habit-card-checkbox ${isCompleted ? 'habit-card-checkbox-checked' : ''}`}
        onClick={handleCheckClick}
        style={{
          borderColor: isCompleted ? COLORS.success : category.color,
          backgroundColor: isCompleted ? COLORS.success : 'transparent',
        }}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check size={16} color="#fff" strokeWidth={3} />
          </motion.div>
        )}
      </button>

      {/* Content */}
      <div className="habit-card-content">
        <h4 className={`habit-card-title ${isCompleted ? 'habit-card-title-completed' : ''}`}>
          {habit.title}
        </h4>
        <div className="habit-card-meta">
          {/* Category */}
          <span
            className="habit-card-category"
            style={{ color: category.color }}
          >
            {category.label}
          </span>

          {/* Streak */}
          {habit.current_streak > 0 && (
            <span className="habit-card-streak">
              <Flame size={12} style={{ color: COLORS.primary }} />
              <span>{habit.current_streak}</span>
            </span>
          )}
        </div>
      </div>

      {/* Menu */}
      <button
        className="habit-card-menu-btn"
        onClick={handleMenuClick}
        aria-label="Habit options"
      >
        <MoreVertical size={18} />
      </button>

      {/* Dropdown */}
      {showMenu && (
        <>
          <div
            className="habit-card-menu-overlay"
            onClick={() => setShowMenu(false)}
          />
          <motion.div
            className="habit-card-menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button onClick={handleEdit} className="habit-card-menu-item">
              <Edit size={14} />
              <span>Edit</span>
            </button>
            <button onClick={handleDelete} className="habit-card-menu-item habit-card-menu-item-danger">
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default HabitCard;
