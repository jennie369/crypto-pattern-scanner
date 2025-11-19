import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import SortableWidget from '../components/SortableWidget';
import UpdateProgressModal from '../components/UpdateProgressModal';
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
  const [showUpdateModal, setShowUpdateModal] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = widgets.findIndex((w) => w.id === active.id);
    const newIndex = widgets.findIndex((w) => w.id === over.id);

    const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);

    // Update state immediately (optimistic UI)
    setWidgets(reorderedWidgets);

    // Update order in database
    try {
      const updates = reorderedWidgets.map((widget, index) => ({
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

  const handleDeleteWidget = async (widgetId) => {
    if (!confirm('Bạn có chắc muốn xóa widget này?')) return;

    try {
      const { error } = await supabase
        .from('dashboard_widgets')
        .update({ is_visible: false })
        .eq('id', widgetId);

      if (error) throw error;

      // Remove from UI
      setWidgets(widgets.filter(w => w.id !== widgetId));
      alert('✅ Widget đã được xóa!');
    } catch (error) {
      console.error('Error deleting widget:', error);
      alert('❌ Có lỗi khi xóa widget!');
    }
  };

  const handlePinWidget = async (widgetId) => {
    try {
      const widget = widgets.find(w => w.id === widgetId);

      const { error } = await supabase
        .from('dashboard_widgets')
        .update({ is_pinned: !widget.is_pinned })
        .eq('id', widgetId);

      if (error) throw error;

      // Update UI
      loadWidgets();
      alert(widget.is_pinned ? '📍 Unpinned!' : '📌 Pinned!');
    } catch (error) {
      console.error('Error pinning widget:', error);
      alert('❌ Có lỗi!');
    }
  };

  const renderWidget = (widget) => {
    const widgetProps = {
      data: widget.widget_data,
      id: widget.id,
      preview: false,
      onUpdate: widget.widget_type === 'GOAL_CARD' ? () => setShowUpdateModal(widget) : undefined,
      onDelete: () => handleDeleteWidget(widget.id),
      onPin: () => handlePinWidget(widget.id),
      isPinned: widget.is_pinned || false
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={widgets.map(w => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="widgets-grid">
              {widgets.map((widget) => (
                <SortableWidget key={widget.id} id={widget.id}>
                  {renderWidget(widget)}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && (
        <UpdateProgressModal
          widget={showUpdateModal}
          goal={showUpdateModal.manifestation_goals}
          onClose={() => setShowUpdateModal(null)}
          onSuccess={() => {
            loadWidgets();
            setShowUpdateModal(null);
          }}
        />
      )}
    </div>
  );
}
