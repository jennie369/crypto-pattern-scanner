import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Gem, Lock, Clock, AlertTriangle } from 'lucide-react';
import './Auth.css';

/**
 * Login Page
 * User authentication with email and password
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const result = await signIn(email, password);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo and Title */}
        <div className="auth-header">
          <div className="auth-logo"><Gem size={48} /></div>
          <h1>GEM Pattern Scanner</h1>
          <p className="auth-subtitle">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert-error">
            <span className="alert-icon"><AlertTriangle size={20} /></span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label>Mật Khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="auth-input"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <><Clock size={16} /> Đang đăng nhập...</> : <><Lock size={16} /> Đăng Nhập</>}
          </button>
        </form>

        {/* Footer Links */}
        <div className="auth-footer">
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="auth-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
