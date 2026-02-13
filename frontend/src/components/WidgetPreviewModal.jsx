import { useState } from 'react';
import { X } from 'lucide-react';
import GoalCard from './widgets/GoalCard';
import AffirmationCard from './widgets/AffirmationCard';
import ActionPlanWidget from './widgets/ActionPlanWidget';
import CrystalGridWidget from './widgets/CrystalGridWidget';
import { ResponseTypes } from '../services/responseDetector';
import './WidgetPreviewModal.css';
import '../styles/widgets.css';

export default function WidgetPreviewModal({ detection, onConfirm, onCancel, extractedData }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [widgetData, setWidgetData] = useState(extractedData);
  const [widgetName, setWidgetName] = useState(extractedData.goalTitle || 'My Widget');

  const renderPreview = () => {
    switch(detection.type) {
      case ResponseTypes.MANIFESTATION_GOAL:
        return (
          <div className="widget-preview-grid">
            <GoalCard
              data={{
                title: widgetData.goalTitle,
                targetAmount: widgetData.targetAmount,
                currentAmount: 0,
                progress: 0,
                targetDate: calculateTargetDate(widgetData.timeline)
              }}
              preview={true}
            />

            {widgetData.affirmations && widgetData.affirmations.length > 0 && (
              <AffirmationCard
                data={{
                  affirmations: widgetData.affirmations,
                  currentIndex: 0
                }}
                preview={true}
              />
            )}

            {widgetData.actionSteps && widgetData.actionSteps.length > 0 && (
              <ActionPlanWidget
                data={{
                  steps: widgetData.actionSteps,
                  completedTasks: [],
                  totalTasks: countTasks(widgetData.actionSteps)
                }}
                preview={true}
              />
            )}

            {widgetData.crystalRecommendations && widgetData.crystalRecommendations.length > 0 && (
              <CrystalGridWidget
                data={{
                  crystals: widgetData.crystalRecommendations
                }}
                preview={true}
              />
            )}
          </div>
        );

      case ResponseTypes.CRYSTAL_RECOMMENDATION:
        return (
          <CrystalGridWidget
            data={{ crystals: widgetData.crystals }}
            preview={true}
          />
        );

      case ResponseTypes.AFFIRMATIONS_ONLY:
        return (
          <AffirmationCard
            data={{ affirmations: widgetData.affirmations, currentIndex: 0 }}
            preview={true}
          />
        );

      default:
        return <p>Preview not available for this widget type.</p>;
    }
  };

  const calculateTargetDate = (timeline) => {
    const now = new Date();
    if (timeline.months) now.setMonth(now.getMonth() + timeline.months);
    else if (timeline.weeks) now.setDate(now.getDate() + timeline.weeks * 7);
    else if (timeline.days) now.setDate(now.getDate() + timeline.days);
    return now.toISOString().split('T')[0];
  };

  const countTasks = (steps) => {
    return steps.reduce((total, week) => total + (week.tasks?.length || 0), 0);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content widget-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎨 Preview Dashboard Widgets</h3>
          <button onClick={onCancel} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={activeTab === 'preview' ? 'active' : ''}
            onClick={() => setActiveTab('preview')}
          >
            👁️ Preview
          </button>
          <button
            className={activeTab === 'customize' ? 'active' : ''}
            onClick={() => setActiveTab('customize')}
          >
            ✏️ Customize
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'preview' && (
            <div className="preview-section">
              <p className="preview-description">
                Đây là preview của widgets sẽ xuất hiện trên dashboard:
              </p>
              {renderPreview()}
            </div>
          )}

          {activeTab === 'customize' && (
            <div className="customize-section">
              <div className="form-group">
                <label>Tên Widget/Mục Tiêu:</label>
                <input
                  type="text"
                  value={widgetName}
                  onChange={(e) => {
                    setWidgetName(e.target.value);
                    setWidgetData({ ...widgetData, goalTitle: e.target.value });
                  }}
                  placeholder="Nhập tên mục tiêu..."
                />
              </div>

              {widgetData.targetAmount !== null && (
                <div className="form-group">
                  <label>Target Amount (VND):</label>
                  <input
                    type="number"
                    value={widgetData.targetAmount || ''}
                    onChange={(e) => setWidgetData({
                      ...widgetData,
                      targetAmount: parseInt(e.target.value)
                    })}
                    placeholder="100000000"
                  />
                </div>
              )}

              {widgetData.timeline && (
                <div className="form-group">
                  <label>Timeline (tháng):</label>
                  <input
                    type="number"
                    value={widgetData.timeline.months || 6}
                    onChange={(e) => setWidgetData({
                      ...widgetData,
                      timeline: { months: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="24"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button className="btn-primary" onClick={() => onConfirm(widgetData)}>
            ✨ Thêm vào Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
