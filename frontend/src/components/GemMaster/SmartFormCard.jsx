import React, { useState, useCallback } from 'react';
import { Sparkles, X, Plus, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import './SmartFormCard.css';

const SmartFormCard = ({ widget, onDismiss, onNavigateToVisionBoard }) => {
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', buttons: [], isSuccess: false });
  const [isHidden, setIsHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => {} }], isSuccess = false) => {
    setAlertModal({ visible: true, title, message, buttons, isSuccess });
  };

  const hideAlert = () => {
    setAlertModal({ visible: false, title: '', message: '', buttons: [], isSuccess: false });
  };

  const handleCloseAndDismiss = useCallback(() => {
    hideAlert();
    setTimeout(() => onDismiss?.(), 100);
  }, [onDismiss]);

  const handleNavigateToVisionBoard = useCallback(() => {
    hideAlert();
    setTimeout(() => {
      onDismiss?.();
      onNavigateToVisionBoard?.();
    }, 100);
  }, [onDismiss, onNavigateToVisionBoard]);

  const handleAddToVisionBoard = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showAlert('Thong bao', 'Vui long dang nhap de su dung tinh nang nay.');
        return;
      }

      const { error } = await supabase
        .from('vision_board_widgets')
        .insert({
          user_id: user.id,
          type: 'goal',
          title: widget?.title || 'Muc tieu moi',
          icon: widget?.icon || '🎯',
          content: widget?.data || {},
          is_active: true,
        });

      if (error) throw error;

      setIsHidden(true);
      showAlert(
        'Da them thanh cong!',
        'Muc tieu da duoc them vao Vision Board cua ban.',
        [
          { text: 'Dong', onPress: handleCloseAndDismiss },
          { text: 'Xem Vision Board', onPress: handleNavigateToVisionBoard },
        ],
        true
      );
    } catch (error) {
      console.error('[SmartFormCard] Error:', error);
      showAlert('Loi', `Khong the them muc tieu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [widget, handleCloseAndDismiss, handleNavigateToVisionBoard]);

  if (!widget) return null;

  return (
    <>
      {!isHidden && (
        <div className="smart-form-card">
          <div className="smart-form-card__header">
            <div className="smart-form-card__header-left">
              <Sparkles size={18} color="#FFBD59" />
              <span className="smart-form-card__title">Them vao Vision Board?</span>
            </div>
            <button className="smart-form-card__dismiss-btn" onClick={onDismiss}>
              <X size={20} color="#718096" />
            </button>
          </div>

          <p className="smart-form-card__description">
            Toi co the tao <span className="smart-form-card__highlight">{widget.title || 'muc tieu'}</span> cho ban.
          </p>

          <div className="smart-form-card__tag-container">
            <div className="smart-form-card__tag">
              <span className="smart-form-card__tag-icon">{widget.icon || '✨'}</span>
              <span className="smart-form-card__tag-text">{widget.title || 'Muc tieu'}</span>
            </div>
          </div>

          {widget.explanation && (
            <div className="smart-form-card__explanation-box">
              <div className="smart-form-card__explanation-label">Vision Board la gi?</div>
              <div className="smart-form-card__explanation-text">{widget.explanation}</div>
            </div>
          )}

          {widget.affirmations?.length > 0 && (
            <div className="smart-form-card__preview-box">
              <div className="smart-form-card__preview-label">Bao gom {widget.affirmations.length} cau khang dinh:</div>
              {widget.affirmations.slice(0, 2).map((aff, index) => (
                <div key={index} className="smart-form-card__preview-item">&bull; &ldquo;{aff}&rdquo;</div>
              ))}
              {widget.affirmations.length > 2 && (
                <div className="smart-form-card__preview-more">+{widget.affirmations.length - 2} cau khac...</div>
              )}
            </div>
          )}

          {(widget.actionSteps || widget.steps)?.length > 0 && (
            <div className="smart-form-card__preview-box">
              <div className="smart-form-card__preview-label">Ke hoach hanh dong ({(widget.actionSteps || widget.steps).length} buoc):</div>
              {(widget.actionSteps || widget.steps).slice(0, 2).map((step, index) => (
                <div key={index} className="smart-form-card__preview-item">
                  {index + 1}. {typeof step === 'string' ? step : (step.text || step.title || step.name || '')}
                </div>
              ))}
              {(widget.actionSteps || widget.steps).length > 2 && (
                <div className="smart-form-card__preview-more">+{(widget.actionSteps || widget.steps).length - 2} buoc khac...</div>
              )}
            </div>
          )}

          {widget.rituals?.length > 0 && (
            <div className="smart-form-card__preview-box">
              <div className="smart-form-card__preview-label">Nghi thuc tam thuc ({widget.rituals.length}):</div>
              {widget.rituals.slice(0, 2).map((ritual, index) => (
                <div key={index} className="smart-form-card__preview-item">
                  &bull; {typeof ritual === 'string' ? ritual : (ritual.name || ritual.title || `Nghi thuc ${index + 1}`)}
                </div>
              ))}
              {widget.rituals.length > 2 && (
                <div className="smart-form-card__preview-more">+{widget.rituals.length - 2} nghi thuc khac...</div>
              )}
            </div>
          )}

          {widget.crystals?.length > 0 && (
            <div className="smart-form-card__preview-box">
              <div className="smart-form-card__preview-label">Da nang luong goi y ({widget.crystals.length}):</div>
              {widget.crystals.slice(0, 2).map((crystal, index) => (
                <div key={index} className="smart-form-card__preview-item">
                  &bull; {typeof crystal === 'string' ? crystal : (crystal.name || crystal.title || `${index + 1}`)}
                </div>
              ))}
              {widget.crystals.length > 2 && (
                <div className="smart-form-card__preview-more">+{widget.crystals.length - 2} da khac...</div>
              )}
            </div>
          )}

          <div className="smart-form-card__button-row">
            <button className="smart-form-card__skip-btn" onClick={onDismiss}>Bo qua</button>
            <button className="smart-form-card__add-btn" onClick={handleAddToVisionBoard} disabled={isLoading}>
              <Plus size={16} color="#0A0F1C" />
              <span className="smart-form-card__add-text">{isLoading ? 'Dang them...' : 'Them Muc Tieu'}</span>
              <ChevronRight size={16} color="#0A0F1C" />
            </button>
          </div>
        </div>
      )}

      {alertModal.visible && (
        <div className="smart-form-card__modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="smart-form-card__modal-content">
            <div className="smart-form-card__modal-icon">
              {alertModal.isSuccess ? (
                <CheckCircle size={48} color="#10B981" />
              ) : (
                <AlertCircle size={48} color="#FFBD59" />
              )}
            </div>
            <div className="smart-form-card__modal-title">{alertModal.title}</div>
            <div className="smart-form-card__modal-message">{alertModal.message}</div>
            <div className="smart-form-card__modal-buttons">
              {alertModal.buttons.map((button, index) => (
                <button
                  key={index}
                  className={`smart-form-card__modal-btn ${index === alertModal.buttons.length - 1 ? 'smart-form-card__modal-btn--primary' : ''}`}
                  onClick={button.onPress}
                >
                  {button.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartFormCard;
