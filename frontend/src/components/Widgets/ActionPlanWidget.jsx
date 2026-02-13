import React, { useState } from 'react';

const ActionPlanWidget = ({ data, preview = false }) => {
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
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(ActionPlanWidget);
