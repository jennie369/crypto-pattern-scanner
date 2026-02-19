import React, { useState, useCallback } from 'react';
import { TrendingUp, Edit3, MoreVertical, Calendar, Bell, Check, X } from 'lucide-react';
import './WidgetCards.css';

const GoalTrackingCard = ({ goal, onUpdate, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const data = goal?.data || goal || {};
  const { targetAmount = 0, currentAmount = 0, timeline, targetDate } = data;
  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

  const daysLeft = targetDate
    ? Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount?.toLocaleString('vi-VN') || '0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const handleSave = useCallback(() => {
    if (!editAmount || isNaN(editAmount)) return;
    onUpdate?.({ ...data, currentAmount: parseFloat(editAmount) });
    setIsEditing(false);
    setEditAmount('');
  }, [editAmount, data, onUpdate]);

  return (
    <div className="widget-card widget-card--goal">
      {/* Header */}
      <div className="widget-card__header">
        <div className="widget-card__title-row">
          <TrendingUp size={18} color="#FFBD59" />
          <span className="widget-card__title">{goal?.title || 'Muc tieu'}</span>
        </div>
        <button className="widget-card__menu-btn" onClick={onNavigate}>
          <MoreVertical size={18} color="#718096" />
        </button>
      </div>

      {/* Timeline */}
      {targetDate && (
        <div className="widget-card__timeline-row">
          <Calendar size={14} color="#718096" />
          <span className="widget-card__timeline">
            Target: {formatDate(targetDate)} {daysLeft !== null && `(${daysLeft > 0 ? `${daysLeft} ngay con lai` : 'Het han'})`}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="widget-card__progress-container">
        <div className="widget-card__progress-bar">
          <div className="widget-card__progress-fill" style={{ width: `${percentage}%` }}>
            {percentage > 15 && <span className="widget-card__progress-text">{percentage.toFixed(0)}%</span>}
          </div>
        </div>
        {targetAmount > 0 && (
          <div className="widget-card__progress-amount">
            {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)} VND
          </div>
        )}
      </div>

      {/* Edit / Actions */}
      {isEditing ? (
        <div className="widget-card__edit-container">
          <input
            className="widget-card__edit-input"
            type="number"
            placeholder="Nhap so tien hien tai..."
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <div className="widget-card__edit-actions">
            <button className="widget-card__save-btn" onClick={handleSave}>Luu</button>
            <button className="widget-card__cancel-btn" onClick={() => { setIsEditing(false); setEditAmount(''); }}>Huy</button>
          </div>
        </div>
      ) : (
        <div className="widget-card__actions-row">
          <button className="widget-card__update-btn" onClick={() => setIsEditing(true)}>
            <Edit3 size={14} color="#0A0F1C" />
            Cap nhat
          </button>
          <button className="widget-card__details-btn" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'An' : 'Chi tiet'}
          </button>
        </div>
      )}

      {/* Details */}
      {showDetails && (
        <div className="widget-card__details-section">
          <div className="widget-card__detail-row">
            <span className="widget-card__detail-label">Muc tieu:</span>
            <span className="widget-card__detail-value">{formatCurrency(targetAmount)} VND</span>
          </div>
          <div className="widget-card__detail-row">
            <span className="widget-card__detail-label">Hien tai:</span>
            <span className="widget-card__detail-value">{formatCurrency(currentAmount)} VND</span>
          </div>
          <div className="widget-card__detail-row">
            <span className="widget-card__detail-label">Con lai:</span>
            <span className="widget-card__detail-value">{formatCurrency(targetAmount - currentAmount)} VND</span>
          </div>
          {timeline && (
            <div className="widget-card__detail-row">
              <span className="widget-card__detail-label">Timeline:</span>
              <span className="widget-card__detail-value">{timeline}</span>
            </div>
          )}
          {data.affirmations?.length > 0 && (
            <div className="widget-card__affirmations-preview">
              <span className="widget-card__detail-label">Affirmations:</span>
              {data.affirmations.slice(0, 2).map((aff, idx) => (
                <div key={idx} className="widget-card__affirmation-item">&bull; {aff}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reminder */}
      <div className="widget-card__reminder-info">
        <div className="widget-card__reminder-row">
          <Bell size={14} color="#718096" />
          <span className="widget-card__reminder-text">
            Nhac nho hang ngay: <span className="widget-card__reminder-status">ON</span>
          </span>
        </div>
        <span className="widget-card__reminder-next">8:00 AM</span>
      </div>
    </div>
  );
};

export default GoalTrackingCard;
