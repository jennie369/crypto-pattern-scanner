import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

/**
 * Signup Page
 * New user registration
 */
function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log('🔄 Submitting signup form...');

      const result = await signUp(email, password, fullName);

      if (result.success) {
        console.log('✅ Signup successful, redirecting...');

        // Show success message
        alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');

        // Redirect to home or dashboard
        navigate('/');
      }

    } catch (error) {
      console.error('❌ Signup failed:', error);

      // Show user-friendly error
      if (error.message.includes('already registered')) {
        setError('Email này đã được đăng ký. Vui lòng đăng nhập.');
      } else if (error.message.includes('Invalid email')) {
        setError('Email không hợp lệ.');
      } else if (error.message.includes('Password')) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo and Title */}
        <div className="auth-header">
          <div className="auth-logo">💎</div>
          <h1>GEM Pattern Scanner</h1>
          <p className="auth-subtitle">Tạo tài khoản mới</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Họ Tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              disabled={loading}
              className="auth-input"
            />
          </div>

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
            <small className="form-hint">Tối thiểu 6 ký tự</small>
          </div>

          <div className="form-group">
            <label>Xác Nhận Mật Khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="auth-input"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? '⏳ Đang đăng ký...' : '✨ Tạo Tài Khoản'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="auth-footer">
          <p>
            Đã có tài khoản?{' '}
            <Link to="/login" className="auth-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
