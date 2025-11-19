# Phase 11: Dashboard Page

## Thông Tin Phase
- **Thời lượng ước tính:** 4-5 ngày
- **Trạng thái:** ⏳ Pending
- **Tiến độ:** 0%
- **Phụ thuộc:** Phase 10 (Widget Preview System)

## Mục Tiêu
Tạo trang Dashboard với grid layout, drag & drop widget reordering, và responsive design.

## Deliverables
- [ ] Dashboard page component
- [ ] Widget grid với drag & drop
- [ ] Empty state UI
- [ ] Widget rendering system
- [ ] Mobile responsive layout

---

## Bước 1: Install Dependencies

### Mục đích
Cài react-beautiful-dnd cho drag & drop functionality.

### Công việc cần làm

```bash
cd frontend
npm install react-beautiful-dnd
```

### Verification Checklist
- [ ] Package installed successfully
- [ ] No version conflicts
- [ ] package.json updated

---

## Bước 2: Tạo Dashboard Page Component

### Mục đích
Main dashboard page với widget grid layout.

### Công việc cần làm

1. **Tạo file Dashboard.jsx**

```javascript
// File: frontend/src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import GoalCard from '../components/widgets/GoalCard';
import AffirmationCard from '../components/widgets/AffirmationCard';
import ActionPlanWidget from '../components/widgets/ActionPlanWidget';
import CrystalGridWidget from '../components/widgets/CrystalGridWidget';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadWidgets();
    }
  }, [user]);

  const loadWidgets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('dashboard_widgets')
        .select(`
          *,
          manifestation_goals (*)
        `)
        .eq('user_id', user.id)
        .eq('is_visible', true)
        .order('position_order');

      if (fetchError) throw fetchError;

      setWidgets(data || []);
    } catch (err) {
      console.error('Error loading widgets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update state immediately (optimistic UI)
    setWidgets(items);

    // Update order in database
    try {
      const updates = items.map((widget, index) => ({
        id: widget.id,
        position_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('dashboard_widgets')
          .update({ position_order: update.position_order })
          .eq('id', update.id);
      }
    } catch (err) {
      console.error('Error updating widget order:', err);
      // Revert on error
      loadWidgets();
    }
  };

  const renderWidget = (widget) => {
    const widgetProps = {
      data: widget.widget_data,
      id: widget.id,
      preview: false
    };

    switch(widget.widget_type) {
      case 'GOAL_CARD':
        return <GoalCard {...widgetProps} />;

      case 'AFFIRMATION_CARD':
        return <AffirmationCard {...widgetProps} />;

      case 'ACTION_PLAN':
        return <ActionPlanWidget {...widgetProps} />;

      case 'CRYSTAL_GRID':
        return <CrystalGridWidget {...widgetProps} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>⚠️ Error loading dashboard</h3>
        <p>{error}</p>
        <button onClick={loadWidgets} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Your Dashboard</h1>
          <p className="dashboard-subtitle">
            Track your manifestation goals & progress
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/community/chatbot')}
        >
          ➕ Create New Widget
        </button>
      </div>

      {widgets.length === 0 ? (
        <div className="empty-dashboard">
          <div className="empty-icon">✨</div>
          <h3>Chưa có widgets nào</h3>
          <p>Chat với GEM Assistant để tạo dashboard widgets!</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/community/chatbot')}
          >
            💬 Mở Chatbot
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard-widgets">
            {(provided, snapshot) => (
              <div
                className={`widgets-grid ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {widgets.map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`widget-container ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        {renderWidget(widget)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
```

### Files cần tạo
- `frontend/src/pages/Dashboard.jsx`

### Verification Checklist
- [ ] Dashboard page renders
- [ ] Widgets load from database
- [ ] Loading state works
- [ ] Error state works
- [ ] Empty state works
- [ ] "Create New Widget" button navigates to chatbot

---

## Bước 3: Tạo Dashboard Styles

### Công việc cần làm

```css
/* File: frontend/src/styles/dashboard.css */

.dashboard-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content h1 {
  font-size: 2.5em;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #00D9FF, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1em;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 24px;
  transition: all 0.3s ease;
}

.widgets-grid.dragging-over {
  background: rgba(139, 92, 246, 0.05);
  border-radius: 16px;
  padding: 8px;
}

.widget-container {
  transition: all 0.3s ease;
}

.widget-container.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

/* Empty State */
.empty-dashboard {
  text-align: center;
  padding: 80px 24px;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(0, 217, 255, 0.1) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  margin-top: 40px;
}

.empty-icon {
  font-size: 6em;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.empty-dashboard h3 {
  font-size: 2em;
  margin-bottom: 16px;
  color: #fff;
}

.empty-dashboard p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
  font-size: 1.2em;
}

/* Loading State */
.dashboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 24px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dashboard-loading p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1em;
}

/* Error State */
.dashboard-error {
  text-align: center;
  padding: 80px 24px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 24px;
  border: 2px solid rgba(255, 0, 0, 0.3);
  margin-top: 40px;
}

.dashboard-error h3 {
  color: #FF6B6B;
  font-size: 1.8em;
  margin-bottom: 16px;
}

.dashboard-error p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content h1 {
    font-size: 2em;
  }

  .widgets-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .empty-dashboard {
    padding: 40px 16px;
  }

  .empty-icon {
    font-size: 4em;
  }
}
```

### Files cần tạo
- `frontend/src/styles/dashboard.css`

---

## Bước 4: Add Dashboard Route

### Công việc cần làm

```javascript
// File: frontend/src/App.jsx
// Add this route

import Dashboard from './pages/Dashboard';

// Inside <Routes>
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Verification Checklist
- [ ] Route added successfully
- [ ] Dashboard accessible at /dashboard
- [ ] Protected route works (login required)

---

## Bước 5: Test Drag & Drop

### Manual Testing Checklist
- [ ] Create 3+ widgets via chatbot
- [ ] Navigate to /dashboard
- [ ] Widgets display correctly
- [ ] Drag widget to new position
- [ ] Drop widget
- [ ] Order persists after page refresh
- [ ] Test on mobile (touch drag)
- [ ] Test empty state (delete all widgets)
- [ ] Test loading state
- [ ] Test error state (disconnect internet)

---

## Edge Cases & Error Handling

### Edge Cases

1. **User drags widget outside droppable area**
   - Hiện tượng: Widget snaps back
   - Giải pháp: react-beautiful-dnd handles this automatically

2. **Database update fails during reorder**
   - Hiện tượng: Order not saved
   - Giải pháp: Revert UI to previous state, show error

3. **Very large number of widgets (100+)**
   - Hiện tượng: Slow performance
   - Giải pháp: Implement pagination or virtual scrolling (future enhancement)

### Error Handling

```javascript
// Already implemented in onDragEnd
try {
  // ... update database ...
} catch (err) {
  console.error('Error updating widget order:', err);
  toast.error('Failed to save widget order');
  loadWidgets(); // Reload from server
}
```

---

## Completion Criteria

Phase 11 hoàn thành khi:
- [ ] Dashboard page hoạt động
- [ ] Widgets load và render correctly
- [ ] Drag & drop works
- [ ] Order persists in database
- [ ] Empty/loading/error states work
- [ ] Mobile responsive
- [ ] Route protected

---

## Next Steps

1. Update `plan.md`: Phase 11 = ✅
2. Commit: `feat: complete phase-11 - dashboard page`
3. Review
4. Sang phase-12
