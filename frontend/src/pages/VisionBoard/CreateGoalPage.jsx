/**
 * CreateGoalPage
 * Form for creating a new goal
 *
 * @fileoverview Goal creation with milestones and actions
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Target, Calendar, Plus, X, Save, AlertCircle
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createGoal, LIFE_AREAS } from '../../services/visionBoard/goalService';
import { getEffectiveTier, checkGoalQuota } from '../../services/visionBoard/tierService';
import { COLORS } from '../../../../web design-tokens';
import './CreateGoalPage.css';

const CreateGoalPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const tier = getEffectiveTier(profile);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lifeArea: 'personal',
    targetDate: '',
    milestones: [],
    actions: [],
  });

  const [newMilestone, setNewMilestone] = useState('');
  const [newAction, setNewAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setFormData((prev) => ({
        ...prev,
        milestones: [...prev.milestones, { title: newMilestone.trim() }],
      }));
      setNewMilestone('');
    }
  };

  const handleRemoveMilestone = (index) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const handleAddAction = () => {
    if (newAction.trim()) {
      setFormData((prev) => ({
        ...prev,
        actions: [...prev.actions, { title: newAction.trim() }],
      }));
      setNewAction('');
    }
  };

  const handleRemoveAction = (index) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Please enter a goal title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createGoal(user.id, formData, tier);

      if (result.error) {
        if (result.quotaExceeded) {
          setError('You have reached your goal limit. Upgrade to create more goals.');
        } else {
          setError(result.error.message);
        }
        return;
      }

      navigate('/vision-board');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedLifeArea = LIFE_AREAS.find((la) => la.key === formData.lifeArea);

  return (
    <div className="create-goal-page">
      {/* Header */}
      <header className="create-goal-header">
        <button
          className="create-goal-back"
          onClick={() => navigate('/vision-board')}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1>Create Goal</h1>
      </header>

      {/* Form */}
      <form className="create-goal-form" onSubmit={handleSubmit}>
        {/* Error Message */}
        {error && (
          <motion.div
            className="create-goal-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Title */}
        <div className="create-goal-field">
          <label htmlFor="title">Goal Title *</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="What do you want to achieve?"
            maxLength={100}
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="create-goal-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Why is this goal important to you?"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Life Area */}
        <div className="create-goal-field">
          <label>Life Area</label>
          <div className="create-goal-life-areas">
            {LIFE_AREAS.map((area) => {
              const Icon = Icons[area.icon] || Icons.Circle;
              const isSelected = formData.lifeArea === area.key;

              return (
                <button
                  key={area.key}
                  type="button"
                  className={`create-goal-life-area ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleChange('lifeArea', area.key)}
                  style={{
                    '--area-color': area.color,
                    borderColor: isSelected ? area.color : 'transparent',
                    backgroundColor: isSelected ? `${area.color}15` : 'transparent',
                  }}
                >
                  <Icon size={16} style={{ color: area.color }} />
                  <span>{area.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Date */}
        <div className="create-goal-field">
          <label htmlFor="targetDate">
            <Calendar size={16} />
            Target Date (Optional)
          </label>
          <input
            id="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={(e) => handleChange('targetDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Milestones */}
        <div className="create-goal-field">
          <label>Milestones (Optional)</label>
          <p className="create-goal-hint">Break down your goal into smaller milestones</p>

          <div className="create-goal-list">
            {formData.milestones.map((milestone, index) => (
              <div key={index} className="create-goal-list-item">
                <span>{milestone.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(index)}
                  aria-label="Remove milestone"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="create-goal-add-row">
            <input
              type="text"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="Add a milestone..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
            />
            <button
              type="button"
              onClick={handleAddMilestone}
              disabled={!newMilestone.trim()}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="create-goal-field">
          <label>Actions (Optional)</label>
          <p className="create-goal-hint">Specific tasks to help you reach this goal</p>

          <div className="create-goal-list">
            {formData.actions.map((action, index) => (
              <div key={index} className="create-goal-list-item">
                <span>{action.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAction(index)}
                  aria-label="Remove action"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="create-goal-add-row">
            <input
              type="text"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="Add an action..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAction())}
            />
            <button
              type="button"
              onClick={handleAddAction}
              disabled={!newAction.trim()}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="create-goal-actions">
          <button
            type="button"
            className="create-goal-cancel"
            onClick={() => navigate('/vision-board')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-goal-submit"
            disabled={loading || !formData.title.trim()}
          >
            {loading ? (
              <span>Creating...</span>
            ) : (
              <>
                <Save size={18} />
                <span>Create Goal</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGoalPage;
