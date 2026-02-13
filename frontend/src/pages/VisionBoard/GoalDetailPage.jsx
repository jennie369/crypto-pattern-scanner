/**
 * GoalDetailPage
 * View and edit goal details with milestones/actions
 *
 * @fileoverview Goal detail view with progress tracking
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Target, Calendar, CheckCircle, Circle,
  Plus, X, Trash2, Edit2, Save, Flag, MoreVertical
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getGoalById,
  updateGoal,
  deleteGoal,
  completeGoal,
  toggleAction,
  toggleMilestone,
  addAction,
  deleteAction,
  LIFE_AREAS,
  GOAL_STATUS,
} from '../../services/visionBoard/goalService';
import { ProgressBar, ProgressRing } from '../../components/VisionBoard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { COLORS } from '../../../../web design-tokens';
import './GoalDetailPage.css';

const GoalDetailPage = () => {
  const { id: goalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newActionText, setNewActionText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch goal
  useEffect(() => {
    const fetchGoal = async () => {
      if (!user?.id || !goalId) return;

      setLoading(true);
      try {
        const { data, error: fetchError } = await getGoalById(goalId, user.id);
        if (fetchError) throw fetchError;
        if (!data) throw new Error('Goal not found');

        setGoal(data);
        setEditData({
          title: data.title,
          description: data.description || '',
          lifeArea: data.life_area,
          targetDate: data.target_date ? data.target_date.split('T')[0] : '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [user?.id, goalId]);

  const refreshGoal = async () => {
    const { data } = await getGoalById(goalId, user.id);
    if (data) setGoal(data);
  };

  const handleToggleAction = async (actionId) => {
    await toggleAction(actionId, user.id);
    await refreshGoal();
  };

  const handleToggleMilestone = async (milestoneId) => {
    await toggleMilestone(milestoneId, user.id);
    await refreshGoal();
  };

  const handleAddAction = async () => {
    if (!newActionText.trim()) return;

    await addAction(goalId, { title: newActionText.trim() }, user.id);
    setNewActionText('');
    await refreshGoal();
  };

  const handleDeleteAction = async (actionId) => {
    await deleteAction(actionId, user.id);
    await refreshGoal();
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updateGoal(goalId, {
        title: editData.title,
        description: editData.description,
        life_area: editData.lifeArea,
        target_date: editData.targetDate || null,
      }, user.id);
      await refreshGoal();
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteGoal = async () => {
    if (window.confirm('Mark this goal as complete?')) {
      await completeGoal(goalId, user.id);
      await refreshGoal();
    }
    setShowMenu(false);
  };

  const handleDeleteGoal = async () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId, user.id);
      navigate('/vision-board');
    }
    setShowMenu(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading goal..." fullScreen />;
  }

  if (error || !goal) {
    return (
      <div className="goal-detail-error">
        <p>{error || 'Goal not found'}</p>
        <button onClick={() => navigate('/vision-board')}>Back to Vision Board</button>
      </div>
    );
  }

  const lifeArea = LIFE_AREAS.find((la) => la.key === goal.life_area) || LIFE_AREAS[0];
  const LifeAreaIcon = Icons[lifeArea.icon] || Target;
  const isCompleted = goal.status === GOAL_STATUS.COMPLETED;

  return (
    <div className="goal-detail-page">
      {/* Header */}
      <header className="goal-detail-header">
        <button className="goal-detail-back" onClick={() => navigate('/vision-board')}>
          <ArrowLeft size={20} />
        </button>

        <div className="goal-detail-header-actions">
          {!isCompleted && (
            <button
              className="goal-detail-edit-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X size={18} /> : <Edit2 size={18} />}
            </button>
          )}
          <button
            className="goal-detail-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <>
              <div className="goal-detail-menu-overlay" onClick={() => setShowMenu(false)} />
              <div className="goal-detail-menu">
                {!isCompleted && (
                  <button onClick={handleCompleteGoal}>
                    <CheckCircle size={16} />
                    <span>Mark Complete</span>
                  </button>
                )}
                <button className="danger" onClick={handleDeleteGoal}>
                  <Trash2 size={16} />
                  <span>Delete Goal</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="goal-detail-content">
        {/* Progress Ring */}
        <div className="goal-detail-progress-section">
          <ProgressRing
            progress={goal.progress || 0}
            size="xl"
            color={isCompleted ? COLORS.success : lifeArea.color}
            strokeWidth={8}
          />
          <div className="goal-detail-progress-info">
            {isCompleted ? (
              <span className="goal-detail-completed-badge">
                <CheckCircle size={16} />
                Completed!
              </span>
            ) : (
              <span>{goal.progress || 0}% Complete</span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        {isEditing ? (
          <div className="goal-detail-edit-form">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Goal title"
              className="goal-detail-edit-title"
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="goal-detail-edit-desc"
              rows={3}
            />
            <div className="goal-detail-edit-row">
              <select
                value={editData.lifeArea}
                onChange={(e) => setEditData((prev) => ({ ...prev, lifeArea: e.target.value }))}
              >
                {LIFE_AREAS.map((la) => (
                  <option key={la.key} value={la.key}>{la.label}</option>
                ))}
              </select>
              <input
                type="date"
                value={editData.targetDate}
                onChange={(e) => setEditData((prev) => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>
            <div className="goal-detail-edit-actions">
              <button onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="primary" onClick={handleSaveEdit} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className="goal-detail-badge"
              style={{ backgroundColor: `${lifeArea.color}20`, color: lifeArea.color }}
            >
              <LifeAreaIcon size={14} />
              <span>{lifeArea.label}</span>
            </div>

            <h1 className="goal-detail-title">{goal.title}</h1>

            {goal.description && (
              <p className="goal-detail-description">{goal.description}</p>
            )}

            {goal.target_date && (
              <div className={`goal-detail-date ${goal.isOverdue ? 'overdue' : ''}`}>
                <Calendar size={16} />
                <span>
                  {goal.isOverdue ? 'Overdue: ' : 'Target: '}
                  {new Date(goal.target_date).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </>
        )}

        {/* Milestones */}
        {goal.milestones?.length > 0 && (
          <section className="goal-detail-section">
            <h2>
              <Flag size={18} style={{ color: COLORS.primary }} />
              Milestones
              <span className="goal-detail-section-count">
                {goal.milestones.filter((m) => m.is_completed).length}/{goal.milestones.length}
              </span>
            </h2>
            <div className="goal-detail-list">
              {goal.milestones.map((milestone) => (
                <motion.div
                  key={milestone.id}
                  className={`goal-detail-item ${milestone.is_completed ? 'completed' : ''}`}
                  onClick={() => !isCompleted && handleToggleMilestone(milestone.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  {milestone.is_completed ? (
                    <CheckCircle size={20} style={{ color: COLORS.success }} />
                  ) : (
                    <Circle size={20} style={{ color: COLORS.textMuted }} />
                  )}
                  <span>{milestone.title}</span>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="goal-detail-section">
          <h2>
            <CheckCircle size={18} style={{ color: COLORS.success }} />
            Actions
            <span className="goal-detail-section-count">
              {(goal.actions || []).filter((a) => a.is_completed).length}/{(goal.actions || []).length}
            </span>
          </h2>

          <div className="goal-detail-list">
            <AnimatePresence>
              {(goal.actions || []).map((action) => (
                <motion.div
                  key={action.id}
                  className={`goal-detail-item ${action.is_completed ? 'completed' : ''}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button
                    className="goal-detail-item-check"
                    onClick={() => !isCompleted && handleToggleAction(action.id)}
                    disabled={isCompleted}
                  >
                    {action.is_completed ? (
                      <CheckCircle size={20} style={{ color: COLORS.success }} />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>
                  <span>{action.title}</span>
                  {!isCompleted && (
                    <button
                      className="goal-detail-item-delete"
                      onClick={() => handleDeleteAction(action.id)}
                    >
                      <X size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {!isCompleted && (
            <div className="goal-detail-add-action">
              <input
                type="text"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                placeholder="Add a new action..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddAction()}
              />
              <button onClick={handleAddAction} disabled={!newActionText.trim()}>
                <Plus size={18} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GoalDetailPage;
