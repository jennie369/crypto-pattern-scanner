/**
 * ClearChatButton - Confirm dialog before clearing chat
 * Web port of mobile ClearChatButton
 */

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import './ClearChatButton.css';

export default function ClearChatButton({ onClear, disabled = false, messageCount = 0 }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const isDisabled = disabled || messageCount === 0;

  const handleConfirm = () => {
    setShowConfirm(false);
    onClear?.();
  };

  return (
    <>
      <button
        className="clear-chat-trigger"
        onClick={() => setShowConfirm(true)}
        disabled={isDisabled}
        title="Xoa lich su chat"
      >
        <Trash2 size={18} />
      </button>

      {showConfirm && (
        <div className="clear-chat-overlay" onClick={() => setShowConfirm(false)}>
          <div className="clear-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="clear-chat-modal__header">
              <div className="clear-chat-modal__warning-icon">
                <AlertTriangle size={24} color="#FFB800" />
              </div>
              <button className="clear-chat-modal__close" onClick={() => setShowConfirm(false)}>
                <X size={18} />
              </button>
            </div>
            <h3 className="clear-chat-modal__title">Xoa lich su chat?</h3>
            <p className="clear-chat-modal__desc">
              Toan bo cuoc tro chuyen se bi xoa va khong the khoi phuc.
              Ban co chac chan muon tiep tuc?
            </p>
            <div className="clear-chat-modal__actions">
              <button className="clear-chat-modal__cancel" onClick={() => setShowConfirm(false)}>
                Huy
              </button>
              <button className="clear-chat-modal__confirm" onClick={handleConfirm}>
                <Trash2 size={14} />
                Xoa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
