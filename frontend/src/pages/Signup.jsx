import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Gem, Sparkles, Clock, AlertTriangle, Gift, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import affiliateService from '../services/affiliate';
import './Auth.css';

/**
 * Signup Page
 * New user registration with referral tracking
 */
function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState(null);
  const [referralValid, setReferralValid] = useState(false);
  const [referralValidating, setReferralValidating] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Capture referral code from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode) {
      console.log('[Signup] 📎 Referral code detected in URL:', refCode);
      setReferralCode(refCode);
      localStorage.setItem('gemReferralCode', refCode);
      validateReferralCode(refCode);
    } else {
      // Check localStorage for previously stored code
      const storedCode = localStorage.getItem('gemReferralCode');
      if (storedCode) {
        console.log('[Signup] 📎 Using stored referral code:', storedCode);
        setReferralCode(storedCode);
        validateReferralCode(storedCode);
      }
    }
  }, []);

  // Validate referral code against database
  const validateReferralCode = async (code) => {
    setReferralValidating(true);
    try {
      console.log('[Signup] 🔍 Validating referral code:', code);

      const { data, error } = await supabase
        .from('affiliate_codes')
        .select('id, user_id, code, is_active')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.warn('[Signup] ⚠️ Invalid or inactive referral code:', code);
        setReferralValid(false);
        setReferralCode(null);
        localStorage.removeItem('gemReferralCode');
        setError('Mã giới thiệu không hợp lệ hoặc đã hết hạn');
      } else {
        console.log('[Signup] ✅ Valid referral code:', data);
        setReferralValid(true);
        // Track click
        await affiliateService.trackReferralClick(code);
      }
    } catch (err) {
      console.error('[Signup] ❌ Error validating referral code:', err);
      setReferralValid(false);
    } finally {
      setReferralValidating(false);
    }
  };

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
      console.log('[Signup] Submitting signup form...');

      const result = await signUp(email, password, fullName);

      if (result.success && result.user) {
        console.log('[Signup] ✅ Signup successful, user ID:', result.user.id);

        // Track referral if code exists and is valid
        if (referralCode && referralValid) {
          try {
            console.log('[Signup] 🎯 Recording referral for code:', referralCode);

            // Get affiliate code details
            const { data: codeData } = await supabase
              .from('affiliate_codes')
              .select('user_id')
              .eq('code', referralCode)
              .eq('is_active', true)
              .single();

            if (codeData && codeData.user_id) {
              // Create referral relationship
              const referralResult = await affiliateService.createReferral(
                codeData.user_id,
                result.user.id,
                referralCode
              );

              if (referralResult) {
                console.log('[Signup] ✅ Referral tracked successfully:', referralResult);
              } else {
                console.warn('[Signup] ⚠️ Referral tracking returned null');
              }
            }

            // Clear stored referral code
            localStorage.removeItem('gemReferralCode');
          } catch (refError) {
            console.error('[Signup] ❌ Referral tracking failed:', refError);
            // Don't block signup on referral tracking failure
          }
        }

        // Show success message
        alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');

        // Redirect to home or dashboard
        navigate('/');
      }

    } catch (error) {
      console.error('[Signup] Signup failed:', error);

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
          <div className="auth-logo"><Gem size={48} /></div>
          <h1>GEM Pattern Scanner</h1>
          <p className="auth-subtitle">Tạo tài khoản mới</p>
        </div>

        {/* Referral Badge */}
        {referralCode && referralValid && (
          <div className="referral-badge">
            <div className="referral-icon">
              <Gift size={24} />
            </div>
            <div className="referral-text">
              <span className="referral-label">Được giới thiệu bởi</span>
              <span className="referral-code">{referralCode}</span>
            </div>
            <div className="referral-check">
              <CheckCircle size={20} />
            </div>
          </div>
        )}

        {/* Loading Badge (validating) */}
        {referralCode && referralValidating && (
          <div className="referral-badge validating">
            <div className="referral-icon">
              <Clock size={24} />
            </div>
            <div className="referral-text">
              <span className="referral-label">Đang kiểm tra mã giới thiệu...</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert-error">
            <span className="alert-icon"><AlertTriangle size={20} /></span>
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

          <button type="submit" disabled={loading} className="auth-submit-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <><Clock size={16} /> Đang đăng ký...</> : <><Sparkles size={16} /> Tạo Tài Khoản</>}
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
