import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './PartnershipRegistration.css';

const PARTNERSHIP_TYPES = [
  {
    key: 'ctv',
    name: 'CTV',
    icon: '🤝',
    desc: 'Cộng tác viên giới thiệu sản phẩm',
  },
  {
    key: 'kol',
    name: 'KOL',
    icon: '🌟',
    desc: 'Người ảnh hưởng trên mạng xã hội',
  },
];

function validateForm(form, partnerType) {
  const errors = {};

  if (!form.full_name?.trim()) {
    errors.full_name = 'Vui lòng nhập họ tên';
  }

  if (!form.phone?.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại';
  } else if (!/^(0|\+84)[0-9]{9,10}$/.test(form.phone.replace(/\s/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }

  if (!form.email?.trim()) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (partnerType === 'kol') {
    const hasSocial = form.facebook || form.tiktok || form.youtube || form.instagram;
    if (!hasSocial) {
      errors.social = 'Vui lòng nhập ít nhất 1 link mạng xã hội';
    }

    if (!form.followers_count?.trim()) {
      errors.followers_count = 'Vui lòng nhập số lượng followers';
    }
  }

  if (!form.terms_accepted) {
    errors.terms = 'Bạn cần đồng ý điều khoản để tiếp tục';
  }

  return errors;
}

export function PartnershipRegistration() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partnerType, setPartnerType] = useState('ctv');
  const [alreadyRegistered, setAlreadyRegistered] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    instagram: '',
    referral_code: '',
    followers_count: '',
    bio: '',
    terms_accepted: false,
  });

  const checkExistingPartnership = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Check if already an affiliate
      const { data: affiliate, error: affErr } = await supabase
        .from('affiliate_profiles')
        .select('id, status, partnership_type')
        .eq('user_id', user.id)
        .maybeSingle();

      if (affErr) throw affErr;

      if (affiliate) {
        setAlreadyRegistered(affiliate);
        setLoading(false);
        return;
      }

      // Check for pending application
      const { data: application, error: appErr } = await supabase
        .from('partnership_applications')
        .select('id, status, partnership_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (appErr) throw appErr;

      if (application && application.status !== 'rejected') {
        setAlreadyRegistered({
          ...application,
          isPending: application.status === 'pending',
        });
      }

      // Pre-fill form from profile
      if (profile) {
        setForm(prev => ({
          ...prev,
          full_name: profile.display_name || profile.full_name || '',
          email: user.email || '',
        }));
      }
    } catch (err) {
      setError(err.message || 'Không thể kiểm tra trạng thái đối tác');
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user) {
      checkExistingPartnership();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, checkExistingPartnership]);

  const handleFieldChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear field error on change
    if (formErrors[key]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Validate
    const errors = validateForm(form, partnerType);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setError(null);

    try {
      // Validate referral code if provided
      if (form.referral_code?.trim()) {
        const { data: referrer, error: refErr } = await supabase
          .from('affiliate_profiles')
          .select('id')
          .eq('referral_code', form.referral_code.trim())
          .maybeSingle();

        if (refErr) throw refErr;
        if (!referrer) {
          setFormErrors({ referral_code: 'Mã giới thiệu không hợp lệ' });
          setSubmitting(false);
          return;
        }
      }

      // Submit application
      const socialLinks = {};
      if (form.facebook) socialLinks.facebook = form.facebook;
      if (form.tiktok) socialLinks.tiktok = form.tiktok;
      if (form.youtube) socialLinks.youtube = form.youtube;
      if (form.instagram) socialLinks.instagram = form.instagram;

      const { error: insertErr } = await supabase
        .from('partnership_applications')
        .insert({
          user_id: user.id,
          partnership_type: partnerType,
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          social_links: socialLinks,
          referral_code: form.referral_code?.trim() || null,
          followers_count: form.followers_count?.trim() || null,
          bio: form.bio?.trim() || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (insertErr) {
        // Check for duplicate
        if (insertErr.code === '23505') {
          setError('Bạn đã gửi đơn đăng ký rồi. Vui lòng chờ phê duyệt.');
          setSubmitting(false);
          return;
        }
        throw insertErr;
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Gửi đơn thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auth wall
  if (!authLoading && !user) {
    return (
      <div className="partnership-page">
        <div className="partnership-page__auth">
          <div className="partnership-page__auth-icon">🔒</div>
          <p className="partnership-page__auth-text">Đăng nhập để đăng ký đối tác</p>
          <button className="partnership-page__auth-btn" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="partnership-page">
        <div className="partnership-page__loading">
          <div className="partnership-page__loading-spinner" />
          <span className="partnership-page__loading-text">Đang kiểm tra...</span>
        </div>
      </div>
    );
  }

  // Error (initial load error)
  if (error && !form.full_name) {
    return (
      <div className="partnership-page">
        <div className="partnership-page__error">
          <div className="partnership-page__error-icon">⚠️</div>
          <p className="partnership-page__error-text">{error}</p>
          <button className="partnership-page__retry-btn" onClick={checkExistingPartnership}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Already registered
  if (alreadyRegistered) {
    return (
      <div className="partnership-page">
        <header className="partnership-page__header">
          <h1 className="partnership-page__title">Đối tác</h1>
        </header>
        <div className="partnership-already">
          <div className="partnership-already__icon">
            {alreadyRegistered.isPending ? '⏳' : '✅'}
          </div>
          <h2 className="partnership-already__title">
            {alreadyRegistered.isPending ? 'Đơn đang chờ duyệt' : 'Bạn đã là đối tác'}
          </h2>
          <p className="partnership-already__desc">
            Loại: {alreadyRegistered.partnership_type === 'kol' ? 'KOL' : 'CTV'}
          </p>
          <p className="partnership-already__status">
            Trạng thái: {alreadyRegistered.status === 'pending' ? 'Chờ phê duyệt' :
              alreadyRegistered.status === 'approved' ? 'Đã duyệt' :
              alreadyRegistered.status === 'active' ? 'Đang hoạt động' :
              alreadyRegistered.status}
          </p>
        </div>
      </div>
    );
  }

  // Success
  if (submitted) {
    return (
      <div className="partnership-page">
        <header className="partnership-page__header">
          <h1 className="partnership-page__title">Đối tác</h1>
        </header>
        <div className="partnership-success">
          <div className="partnership-success__icon">🎉</div>
          <h2 className="partnership-success__title">Đăng ký thành công!</h2>
          <p className="partnership-success__desc">
            Đơn đăng ký của bạn đã được gửi. Chúng tôi sẽ xem xét và phản hồi trong 1-3 ngày làm việc.
          </p>
          <button className="partnership-success__btn" onClick={() => navigate('/')}>
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const canSubmit = form.full_name && form.phone && form.email && form.terms_accepted && !submitting;

  return (
    <div className="partnership-page">
      <header className="partnership-page__header">
        <h1 className="partnership-page__title">Đăng ký Đối tác</h1>
        <p className="partnership-page__subtitle">Trở thành CTV hoặc KOL của GEM</p>
      </header>

      {/* Type Selector */}
      <div className="partnership-types">
        {PARTNERSHIP_TYPES.map(t => (
          <div
            key={t.key}
            className={`partnership-type-card ${partnerType === t.key ? 'partnership-type-card--selected' : ''}`}
            onClick={() => setPartnerType(t.key)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setPartnerType(t.key)}
          >
            <div className="partnership-type-card__icon">{t.icon}</div>
            <p className="partnership-type-card__name">{t.name}</p>
            <p className="partnership-type-card__desc">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form className="partnership-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="partnership-form__error">{error}</div>}

        {/* Personal Info */}
        <div className="partnership-field">
          <label className="partnership-field__label partnership-field__label--required">
            Họ và tên
          </label>
          <input
            className="partnership-field__input"
            type="text"
            placeholder="Nguyễn Văn A"
            value={form.full_name}
            onChange={e => handleFieldChange('full_name', e.target.value)}
          />
          {formErrors.full_name && (
            <p className="partnership-field__error">{formErrors.full_name}</p>
          )}
        </div>

        <div className="partnership-field">
          <label className="partnership-field__label partnership-field__label--required">
            Số điện thoại
          </label>
          <input
            className="partnership-field__input"
            type="tel"
            placeholder="0912 345 678"
            value={form.phone}
            onChange={e => handleFieldChange('phone', e.target.value)}
          />
          {formErrors.phone && (
            <p className="partnership-field__error">{formErrors.phone}</p>
          )}
        </div>

        <div className="partnership-field">
          <label className="partnership-field__label partnership-field__label--required">
            Email
          </label>
          <input
            className="partnership-field__input"
            type="email"
            placeholder="email@example.com"
            value={form.email}
            onChange={e => handleFieldChange('email', e.target.value)}
          />
          {formErrors.email && (
            <p className="partnership-field__error">{formErrors.email}</p>
          )}
        </div>

        {/* Social Links */}
        <div className="partnership-field">
          <label className="partnership-field__label">
            Mạng xã hội {partnerType === 'kol' && <span style={{ color: '#FF6B6B' }}>*</span>}
          </label>
          <div className="partnership-social-links">
            <div className="partnership-social-row">
              <span className="partnership-social-row__icon">📘</span>
              <input
                className="partnership-social-row__input"
                type="url"
                placeholder="Facebook URL"
                value={form.facebook}
                onChange={e => handleFieldChange('facebook', e.target.value)}
              />
            </div>
            <div className="partnership-social-row">
              <span className="partnership-social-row__icon">🎵</span>
              <input
                className="partnership-social-row__input"
                type="url"
                placeholder="TikTok URL"
                value={form.tiktok}
                onChange={e => handleFieldChange('tiktok', e.target.value)}
              />
            </div>
            <div className="partnership-social-row">
              <span className="partnership-social-row__icon">▶️</span>
              <input
                className="partnership-social-row__input"
                type="url"
                placeholder="YouTube URL"
                value={form.youtube}
                onChange={e => handleFieldChange('youtube', e.target.value)}
              />
            </div>
            <div className="partnership-social-row">
              <span className="partnership-social-row__icon">📸</span>
              <input
                className="partnership-social-row__input"
                type="url"
                placeholder="Instagram URL"
                value={form.instagram}
                onChange={e => handleFieldChange('instagram', e.target.value)}
              />
            </div>
          </div>
          {formErrors.social && (
            <p className="partnership-field__error">{formErrors.social}</p>
          )}
        </div>

        {/* KOL-specific: followers count */}
        {partnerType === 'kol' && (
          <div className="partnership-field">
            <label className="partnership-field__label partnership-field__label--required">
              Tổng số followers
            </label>
            <input
              className="partnership-field__input"
              type="text"
              placeholder="VD: 50,000"
              value={form.followers_count}
              onChange={e => handleFieldChange('followers_count', e.target.value)}
            />
            {formErrors.followers_count && (
              <p className="partnership-field__error">{formErrors.followers_count}</p>
            )}
          </div>
        )}

        {/* Bio */}
        <div className="partnership-field">
          <label className="partnership-field__label">
            Giới thiệu bản thân
          </label>
          <textarea
            className="partnership-field__textarea"
            placeholder="Mô tả ngắn về bạn và lý do muốn trở thành đối tác..."
            value={form.bio}
            onChange={e => handleFieldChange('bio', e.target.value)}
            rows={3}
          />
        </div>

        {/* Referral Code */}
        <div className="partnership-field">
          <label className="partnership-field__label">
            Mã giới thiệu (nếu có)
          </label>
          <input
            className="partnership-field__input"
            type="text"
            placeholder="Nhập mã giới thiệu"
            value={form.referral_code}
            onChange={e => handleFieldChange('referral_code', e.target.value)}
          />
          {formErrors.referral_code && (
            <p className="partnership-field__error">{formErrors.referral_code}</p>
          )}
        </div>

        {/* Terms */}
        <div className="partnership-terms">
          <input
            className="partnership-terms__checkbox"
            type="checkbox"
            checked={form.terms_accepted}
            onChange={e => handleFieldChange('terms_accepted', e.target.checked)}
            id="terms-checkbox"
          />
          <label className="partnership-terms__text" htmlFor="terms-checkbox">
            Tôi đã đọc và đồng ý với{' '}
            <span className="partnership-terms__link">Điều khoản đối tác</span>{' '}
            và{' '}
            <span className="partnership-terms__link">Chính sách hoa hồng</span>{' '}
            của GEM.
          </label>
        </div>
        {formErrors.terms && (
          <p className="partnership-field__error" style={{ marginTop: -8 }}>{formErrors.terms}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className={`partnership-submit ${
            submitting ? 'partnership-submit--loading' :
            canSubmit ? 'partnership-submit--active' :
            'partnership-submit--disabled'
          }`}
          disabled={!canSubmit}
        >
          {submitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
        </button>
      </form>
    </div>
  );
}

export default PartnershipRegistration;
