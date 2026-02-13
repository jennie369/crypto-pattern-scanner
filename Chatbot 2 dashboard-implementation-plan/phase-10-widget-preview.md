# Phase 10: Widget Preview System

## Thông Tin Phase
- **Thời lượng ước tính:** 4-5 ngày
- **Trạng thái:** ⏳ Pending
- **Tiến độ:** 0%
- **Phụ thuộc:** Phase 09 (Chat Integration)

## Mục Tiêu
Tạo modal preview cho widgets trước khi add vào dashboard, cùng với các widget components để display data.

## Deliverables
- [ ] WidgetPreviewModal component
- [ ] 5 widget components (GoalCard, AffirmationCard, ActionPlan, CrystalGrid, TradingAnalysis)
- [ ] Widget customization UI
- [ ] Preview/Customize tabs

---

## Bước 1: Tạo WidgetPreviewModal Component

### Mục đích
Modal cho phép user preview và customize widget trước khi lưu vào dashboard.

### Công việc cần làm

1. **Tạo file WidgetPreviewModal.jsx**

```javascript
// File: frontend/src/components/WidgetPreviewModal.jsx

import { useState } from 'react';
import { X } from 'lucide-react';
import GoalCard from './widgets/GoalCard';
import AffirmationCard from './widgets/AffirmationCard';
import ActionPlanWidget from './widgets/ActionPlanWidget';
import CrystalGridWidget from './widgets/CrystalGridWidget';
import { ResponseTypes } from '../services/responseDetector';
import './WidgetPreviewModal.css';

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
```

### Files cần tạo
- `frontend/src/components/WidgetPreviewModal.jsx`
- `frontend/src/components/WidgetPreviewModal.css`

### Verification Checklist
- [ ] Modal renders correctly
- [ ] Preview tab shows widget previews
- [ ] Customize tab allows editing
- [ ] Close button works
- [ ] Confirm button passes updated data

---

## Bước 2: Tạo GoalCard Widget Component

### Mục đích
Display manifestation goal với progress bar.

### Công việc cần làm

1. **Tạo file GoalCard.jsx**

```javascript
// File: frontend/src/components/widgets/GoalCard.jsx

export default function GoalCard({ data, preview = false }) {
  const progressPercentage = data.targetAmount > 0
    ? (data.currentAmount / data.targetAmount) * 100
    : 0;

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className={`widget goal-card ${preview ? 'preview-mode' : ''}`}>
      <div className="widget-header">
        <h3>{data.title}</h3>
        {!preview && <button className="widget-menu">⋯</button>}
      </div>

      <div className="widget-body">
        <div className="goal-stats">
          <div className="stat">
            <span className="stat-label">Target:</span>
            <span className="stat-value">
              {formatCurrency(data.targetAmount)} VND
            </span>
          </div>

          <div className="stat">
            <span className="stat-label">Current:</span>
            <span className="stat-value">
              {formatCurrency(data.currentAmount)} VND
            </span>
          </div>

          <div className="stat">
            <span className="stat-label">Deadline:</span>
            <span className="stat-value">
              {formatDate(data.targetDate)}
            </span>
          </div>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            <span className="progress-text">{progressPercentage.toFixed(0)}%</span>
          </div>
        </div>

        {!preview && (
          <div className="widget-actions">
            <button className="btn-sm btn-primary">
              📈 Update Progress
            </button>
            <button className="btn-sm btn-secondary">
              📊 View Details
            </button>
          </div>
        )}
      </div>

      {!preview && (
        <div className="widget-footer">
          <span className="widget-meta">
            🔔 Daily reminders: <strong>ON</strong>
          </span>
        </div>
      )}
    </div>
  );
}
```

### Files cần tạo
- `frontend/src/components/widgets/GoalCard.jsx`

### Verification Checklist
- [ ] Component renders với correct data
- [ ] Progress bar shows correct percentage
- [ ] Currency formatting works (Vietnamese format)
- [ ] Date formatting works
- [ ] Preview mode hides actions/footer

---

## Bước 3: Tạo AffirmationCard Widget

### Mục đích
Display affirmations với rotation system.

### Công việc cần làm

1. **Tạo file AffirmationCard.jsx**

```javascript
// File: frontend/src/components/widgets/AffirmationCard.jsx

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AffirmationCard({ data, preview = false }) {
  const [currentIndex, setCurrentIndex] = useState(data.currentIndex || 0);

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % data.affirmations.length);
  };

  const prevAffirmation = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? data.affirmations.length - 1 : prev - 1
    );
  };

  return (
    <div className={`widget affirmation-card ${preview ? 'preview-mode' : ''}`}>
      <div className="widget-header">
        <h3>✨ Daily Affirmation</h3>
        {!preview && (
          <span className="affirmation-counter">
            {currentIndex + 1} / {data.affirmations.length}
          </span>
        )}
      </div>

      <div className="widget-body">
        <div className="affirmation-content">
          <p className="affirmation-text">
            "{data.affirmations[currentIndex]}"
          </p>
        </div>

        <div className="affirmation-navigation">
          <button onClick={prevAffirmation} className="nav-btn">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextAffirmation} className="nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>

        {!preview && (
          <div className="widget-actions">
            <button className="btn-sm btn-primary">
              ✅ Mark as Completed
            </button>
          </div>
        )}
      </div>

      {!preview && data.streak > 0 && (
        <div className="widget-footer">
          <span className="widget-meta">
            🔥 Streak: <strong>{data.streak} days</strong>
          </span>
        </div>
      )}
    </div>
  );
}
```

### Files cần tạo
- `frontend/src/components/widgets/AffirmationCard.jsx`

---

## Bước 4: Tạo ActionPlanWidget, CrystalGridWidget

### Công việc cần làm

1. **Tạo ActionPlanWidget.jsx**

```javascript
// File: frontend/src/components/widgets/ActionPlanWidget.jsx

export default function ActionPlanWidget({ data, preview = false }) {
  const [completedTasks, setCompletedTasks] = useState(data.completedTasks || []);

  const toggleTask = (weekIndex, taskIndex) => {
    const taskId = `${weekIndex}-${taskIndex}`;
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
    }
  };

  return (
    <div className={`widget action-plan ${preview ? 'preview-mode' : ''}`}>
      <div className="widget-header">
        <h3>📋 Action Plan</h3>
        <span className="progress-indicator">
          {completedTasks.length} / {data.totalTasks} completed
        </span>
      </div>

      <div className="widget-body">
        {data.steps.map((week, weekIndex) => (
          <div key={weekIndex} className="week-section">
            <h4>Week {week.week}</h4>
            <ul className="task-list">
              {week.tasks.map((task, taskIndex) => {
                const taskId = `${weekIndex}-${taskIndex}`;
                const isCompleted = completedTasks.includes(taskId);

                return (
                  <li key={taskIndex} className={isCompleted ? 'completed' : ''}>
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => !preview && toggleTask(weekIndex, taskIndex)}
                      disabled={preview}
                    />
                    <span>{task}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

2. **Tạo CrystalGridWidget.jsx**

```javascript
// File: frontend/src/components/widgets/CrystalGridWidget.jsx

export default function CrystalGridWidget({ data, preview = false }) {
  return (
    <div className={`widget crystal-grid ${preview ? 'preview-mode' : ''}`}>
      <div className="widget-header">
        <h3>💎 Crystal Recommendations</h3>
      </div>

      <div className="widget-body">
        <div className="crystal-list">
          {data.crystals.map((crystal, index) => (
            <div key={index} className="crystal-item">
              <span className="crystal-icon">💎</span>
              <span className="crystal-name">{crystal}</span>
            </div>
          ))}
        </div>

        {!preview && (
          <div className="widget-actions">
            <button className="btn-sm btn-secondary">
              🌙 Mark as Cleansed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Files cần tạo
- `frontend/src/components/widgets/ActionPlanWidget.jsx`
- `frontend/src/components/widgets/CrystalGridWidget.jsx`

---

## Bước 5: Tạo Widget Styles

### Công việc cần làm

1. **Tạo file widgets.css**

```css
/* File: frontend/src/styles/widgets.css */

.widget {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(0, 217, 255, 0.1) 100%
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.widget:hover:not(.preview-mode) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.widget-header h3 {
  font-size: 1.2em;
  color: #fff;
  margin: 0;
}

.widget-body {
  color: rgba(255, 255, 255, 0.9);
}

.progress-bar-container {
  width: 100%;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  margin: 16px 0;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #00D9FF);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.5s ease;
  min-width: 50px;
}

.progress-text {
  color: white;
  font-weight: bold;
  font-size: 0.9em;
}

.widget-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.btn-sm {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #8B5CF6, #00D9FF);
  color: white;
  border: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Affirmation Card */
.affirmation-content {
  text-align: center;
  padding: 24px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.affirmation-text {
  font-size: 1.2em;
  font-style: italic;
  color: #FFD700;
  line-height: 1.6;
}

.affirmation-navigation {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}
```

### Files cần tạo
- `frontend/src/styles/widgets.css`

---

## Completion Criteria

Phase 10 hoàn thành khi:
- [ ] WidgetPreviewModal hoạt động
- [ ] 5 widget components render correctly
- [ ] Preview tab shows all widgets
- [ ] Customize tab allows editing
- [ ] Styles applied với glassmorphism
- [ ] Mobile responsive

---

## Next Steps

1. Update `plan.md`: Phase 10 = ✅
2. Commit: `feat: complete phase-10 - widget preview`
3. Review
4. Sang phase-11
