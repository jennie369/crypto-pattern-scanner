import React, { useState, useCallback } from 'react';
import {
  LayoutDashboard, Target, Sparkles, CheckSquare, Gem, TrendingUp,
  ChevronRight, X, Plus, Heart, Bell, Quote, ListChecks, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import './WidgetSuggestionCard.css';

const WIDGET_ICONS = {
  goal: Target,
  affirmation: Heart,
  steps: ListChecks,
  crystal: Gem,
  iching: LayoutDashboard,
  tarot: Sparkles,
  reminder: Bell,
  quote: Quote,
  GOAL_CARD: Target,
  AFFIRMATION_CARD: Sparkles,
  ACTION_CHECKLIST: CheckSquare,
  CRYSTAL_GRID: Gem,
  CROSS_DOMAIN_CARD: TrendingUp,
};

const WIDGET_LABELS = {
  goal: 'Muc tieu',
  affirmation: 'Affirmation',
  steps: 'Buoc hanh dong',
  crystal: 'Crystal',
  iching: 'Que Dich',
  tarot: 'Tarot',
  reminder: 'Nhac nho',
  quote: 'Cau noi',
  GOAL_CARD: 'Goal Tracker',
  AFFIRMATION_CARD: 'Affirmations',
  ACTION_CHECKLIST: 'Action Plan',
  CRYSTAL_GRID: 'Crystal Grid',
  CROSS_DOMAIN_CARD: 'Trading Analysis',
};

const WIDGET_COLORS = {
  goal: '#FFBD59',
  affirmation: '#EC4899',
  steps: '#10B981',
  crystal: '#8B5CF6',
  iching: '#00D9FF',
  tarot: '#F59E0B',
};

const WidgetSuggestionCard = ({
  widgets = [],
  suggestionMessage,
  widgetType,
  widgetData,
  userId,
  onAdd,
  onDismiss,
  canAdd = true,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const getIcon = (type) => WIDGET_ICONS[type] || LayoutDashboard;
  const getLabel = (type) => WIDGET_LABELS[type] || 'Widget';
  const getColor = (type) => WIDGET_COLORS[type] || '#FFBD59';

  const handleAdd = useCallback(async () => {
    if (!canAdd) return;

    try {
      setIsCreating(true);

      if (onAdd) {
        await onAdd(widgets.length > 0 ? widgets : [{ type: widgetType, data: widgetData }]);
      } else if (userId && widgets.length > 0) {
        const widgetsToInsert = widgets.map(w => ({
          user_id: userId,
          type: w.type || 'goal',
          title: w.title || getLabel(w.type),
          icon: w.icon || '🎯',
          content: w.data || {},
          is_active: true,
        }));

        const { error } = await supabase.from('vision_board_widgets').insert(widgetsToInsert);
        if (error) throw error;
      }

      setIsDismissed(true);
    } catch (error) {
      console.error('[WidgetSuggestionCard] Error:', error);
    } finally {
      setIsCreating(false);
    }
  }, [widgets, widgetType, widgetData, userId, canAdd, onAdd]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (isDismissed) return null;

  const displayWidgets = widgets.length > 0 ? widgets : (widgetType ? [{ type: widgetType, data: widgetData }] : []);
  if (displayWidgets.length === 0) return null;

  return (
    <div className="widget-suggestion-card">
      {/* Header */}
      <div className="widget-suggestion-card__header">
        <div className="widget-suggestion-card__header-left">
          <LayoutDashboard size={20} color="#FFBD59" />
          <span className="widget-suggestion-card__header-text">Them vao Vision Board?</span>
        </div>
        <button className="widget-suggestion-card__dismiss-btn" onClick={handleDismiss}>
          <X size={20} />
        </button>
      </div>

      {/* Message */}
      <div className="widget-suggestion-card__message">
        {suggestionMessage || 'Toi co the tao muc tieu theo doi cho ban.'}
      </div>

      {/* Widget Previews */}
      <div className="widget-suggestion-card__previews">
        {displayWidgets.slice(0, 3).map((widget, index) => {
          const IconComponent = getIcon(widget.type);
          const color = getColor(widget.type);
          return (
            <div key={index} className="widget-suggestion-card__preview-item">
              <IconComponent size={16} color={color} />
              <span className="widget-suggestion-card__preview-label">{getLabel(widget.type)}</span>
            </div>
          );
        })}
        {displayWidgets.length > 3 && (
          <div className="widget-suggestion-card__preview-item">
            <Plus size={16} color="#718096" />
            <span className="widget-suggestion-card__preview-label">+{displayWidgets.length - 3} khac</span>
          </div>
        )}
      </div>

      {/* Tier Warning */}
      {!canAdd && (
        <div className="widget-suggestion-card__tier-warning">
          <AlertTriangle size={16} color="#FCA5A5" />
          <span className="widget-suggestion-card__tier-warning-text">
            Ban da dat gioi han muc tieu. Nang cap de tao them!
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="widget-suggestion-card__actions">
        <button className="widget-suggestion-card__dismiss-text-btn" onClick={handleDismiss} disabled={isCreating}>
          Bo qua
        </button>
        <button className="widget-suggestion-card__add-btn" onClick={handleAdd} disabled={isCreating || !canAdd}>
          {isCreating ? (
            <div className="widget-suggestion-card__spinner" />
          ) : (
            <>
              <Plus size={16} color="#0A0F1C" />
              Them Muc Tieu
              <ChevronRight size={16} color="#0A0F1C" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WidgetSuggestionCard;
