import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function UpdateProgressModal({ widget, goal, onClose, onSuccess }) {
  const [newAmount, setNewAmount] = useState(goal?.current_amount || 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update goal
      const { error: goalError } = await supabase
        .from('manifestation_goals')
        .update({
          current_amount: newAmount,
          progress_percentage: (newAmount / goal.target_amount) * 100
        })
        .eq('id', goal.id);

      if (goalError) throw goalError;

      // Update widget data
      const { error: widgetError } = await supabase
        .from('dashboard_widgets')
        .update({
          widget_data: {
            ...widget.widget_data,
            currentAmount: newAmount,
            progress: (newAmount / goal.target_amount) * 100
          }
        })
        .eq('id', widget.id);

      if (widgetError) throw widgetError;

      alert('✅ Progress updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('❌ Có lỗi khi cập nhật. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content update-progress-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📈 Update Progress</h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Current Amount (VND):</label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
              placeholder="Enter current amount"
              step="100000"
              autoFocus
            />
          </div>

          <div className="progress-preview">
            <p><strong>Target:</strong> {goal?.target_amount?.toLocaleString('vi-VN')} VND</p>
            <p><strong>Progress:</strong> {((newAmount / goal?.target_amount) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
