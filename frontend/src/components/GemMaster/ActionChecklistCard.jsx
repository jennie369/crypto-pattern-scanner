import React, { useState, useCallback } from 'react';
import { Square, CheckSquare, Plus, MoreVertical, ListChecks } from 'lucide-react';
import './WidgetCards.css';

const ActionChecklistCard = ({ items = [], onToggle, onComplete }) => {
  const [tasks, setTasks] = useState(
    Array.isArray(items) ? items.map((item, i) => ({
      id: item.id || `task_${i}`,
      title: typeof item === 'string' ? item : (item.title || item.text || ''),
      completed: item.completed || false,
    })) : []
  );
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/\*{1,3}/g, '').trim();
  };

  const handleToggle = useCallback((taskId) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const task = updated.find(t => t.id === taskId);
      onToggle?.(taskId, task?.completed);

      if (updated.every(t => t.completed)) {
        onComplete?.();
      }
      return updated;
    });
  }, [onToggle, onComplete]);

  const handleAddTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setShowAddTask(false);
  }, [newTaskTitle]);

  return (
    <div className="widget-card widget-card--checklist">
      {/* Header */}
      <div className="widget-card__header">
        <div className="widget-card__title-row">
          <ListChecks size={18} color="#FFBD59" />
          <span className="widget-card__title">Action Checklist</span>
        </div>
      </div>

      {/* Tasks */}
      <div className="checklist-card__tasks">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="checklist-card__task-item"
            onClick={() => handleToggle(task.id)}
          >
            {task.completed ? (
              <CheckSquare size={20} color="#10B981" />
            ) : (
              <Square size={20} color="#4A5568" />
            )}
            <span className={`checklist-card__task-text ${task.completed ? 'checklist-card__task-text--completed' : ''}`}>
              {cleanText(task.title)}
            </span>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="checklist-card__progress">
        <span className="checklist-card__progress-text">
          Tien do: <span className="checklist-card__progress-count">{completedCount}/{totalCount}</span> hoan thanh
        </span>
        <div className="checklist-card__progress-bar">
          <div className="checklist-card__progress-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* Add Task */}
      {showAddTask ? (
        <div className="checklist-card__add-container">
          <input
            className="checklist-card__add-input"
            placeholder="Nhap noi dung task moi..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            autoFocus
          />
          <div className="checklist-card__add-actions">
            <button className="checklist-card__save-btn" onClick={handleAddTask}>Them</button>
            <button className="checklist-card__cancel-btn" onClick={() => { setShowAddTask(false); setNewTaskTitle(''); }}>Huy</button>
          </div>
        </div>
      ) : (
        <button className="checklist-card__add-btn" onClick={() => setShowAddTask(true)}>
          <Plus size={16} color="#FFBD59" />
          Them Task
        </button>
      )}
    </div>
  );
};

export default ActionChecklistCard;
