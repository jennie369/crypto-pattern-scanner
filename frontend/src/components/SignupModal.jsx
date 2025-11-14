import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SignupModal.css';

export default function SignupModal({ onClose, quotaRemaining }) {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const result = await signUp(email, password, fullName);

      if (result.success) {
        // Success - redirect to scanner
        navigate('/scanner');
        onClose();
      } else {
        setError(result.error || 'Đăng ký thất bại. Email có thể đã được sử dụng.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Đăng ký thất bại. Email có thể đã được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <span className="modal-icon">💎</span>
          <h2>Đăng Ký FREE</h2>
          <p>Nhận 5 lượt scan miễn phí mỗi ngày!</p>
        </div>

        {quotaRemaining !== undefined && quotaRemaining === 0 && (
          <div className="modal-alert">
            ⚠️ Bạn đã hết lượt scan BTC miễn phí hôm nay. Đăng ký để có thêm 5 lượt scan toàn bộ 20+ coins!
          </div>
        )}

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="modal-form">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
            <small>Tối thiểu 6 ký tự</small>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-modal-submit"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Miễn Phí'}
          </button>
        </form>

        <div className="modal-benefits">
          <h4>Bạn sẽ nhận được:</h4>
          <ul>
            <li>✅ 5 lượt scan/ngày (20+ coins)</li>
            <li>✅ 6 basic patterns</li>
            <li>✅ Trading journal (50 trades)</li>
            <li>✅ Real-time price alerts</li>
          </ul>
        </div>

        <div className="modal-footer">
          <p>
            Đã có tài khoản?{' '}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); onClose(); }}>
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
