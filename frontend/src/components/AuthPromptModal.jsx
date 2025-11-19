import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, BarChart3, Gem } from 'lucide-react';
import './AuthPromptModal.css';

/**
 * AuthPromptModal Component
 * Shows when non-authenticated users try to scan
 * Prompts them to sign up or log in
 */
function AuthPromptModal({ onClose }) {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="auth-prompt-overlay" onClick={onClose}>
      <div className="auth-prompt-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Icon */}
        <div className="modal-icon"><Lock size={48} /></div>

        {/* Title */}
        <h2 className="modal-title">Đăng Ký Để Quét Pattern</h2>

        {/* Description */}
        <p className="modal-description">
          Bạn cần đăng nhập để sử dụng tính năng quét pattern.
          <br />
          Tạo tài khoản miễn phí và nhận <strong>5 lượt quét</strong> mỗi ngày!
        </p>

        {/* Benefits */}
        <div className="modal-benefits">
          <div className="benefit-item">
            <span className="benefit-icon"><Sparkles size={20} /></span>
            <span className="benefit-text">5 lượt quét miễn phí mỗi ngày</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon"><BarChart3 size={20} /></span>
            <span className="benefit-text">Lưu lịch sử quét</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon"><Gem size={20} /></span>
            <span className="benefit-text">Nâng cấp để quét không giới hạn</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button className="btn-signup" onClick={handleSignup}>
            <Sparkles size={20} /> Tạo Tài Khoản Miễn Phí
          </button>
          <button className="btn-login" onClick={handleLogin}>
            Đã có tài khoản? Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPromptModal;
