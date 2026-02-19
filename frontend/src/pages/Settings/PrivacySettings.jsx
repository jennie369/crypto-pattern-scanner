import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './PrivacySettings.css';

const DEFAULT_SETTINGS = {
  public_profile: true,
  show_stats: true,
  post_visibility: 'public',
  comment_permission: 'everyone',
  activity_status: true,
  read_receipts: true,
};

const POST_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Công khai' },
  { value: 'followers', label: 'Người theo dõi' },
  { value: 'friends', label: 'Bạn bè' },
];

const COMMENT_PERMISSION_OPTIONS = [
  { value: 'everyone', label: 'Tất cả' },
  { value: 'followers', label: 'Người theo dõi' },
  { value: 'off', label: 'Tắt' },
];

export function PrivacySettings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const saveTimerRef = useRef(null);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch profile-level settings
      const { data: profileData, error: profErr } = await supabase
        .from('profiles')
        .select('public_profile, show_stats')
        .eq('id', user.id)
        .single();

      if (profErr && profErr.code !== 'PGRST116') throw profErr;

      // Fetch user_settings JSONB
      const { data: settingsData, error: setErr } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      if (setErr && setErr.code !== 'PGRST116') throw setErr;

      const privacy = settingsData?.settings?.privacy || {};

      setSettings({
        public_profile: profileData?.public_profile ?? DEFAULT_SETTINGS.public_profile,
        show_stats: profileData?.show_stats ?? DEFAULT_SETTINGS.show_stats,
        post_visibility: privacy.post_visibility ?? DEFAULT_SETTINGS.post_visibility,
        comment_permission: privacy.comment_permission ?? DEFAULT_SETTINGS.comment_permission,
        activity_status: privacy.activity_status ?? DEFAULT_SETTINGS.activity_status,
        read_receipts: privacy.read_receipts ?? DEFAULT_SETTINGS.read_receipts,
      });
    } catch (err) {
      setError(err.message || 'Không thể tải cài đặt quyền riêng tư');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchSettings]);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 2500);
  };

  const saveSettings = useCallback(async (newSettings) => {
    if (!user) return;
    setSaving(true);

    try {
      // Update profile-level fields
      const { error: profErr } = await supabase
        .from('profiles')
        .update({
          public_profile: newSettings.public_profile,
          show_stats: newSettings.show_stats,
        })
        .eq('id', user.id);

      if (profErr) throw profErr;

      // Update user_settings JSONB (upsert)
      const privacyPayload = {
        post_visibility: newSettings.post_visibility,
        comment_permission: newSettings.comment_permission,
        activity_status: newSettings.activity_status,
        read_receipts: newSettings.read_receipts,
      };

      // First try to get existing settings
      const { data: existing } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      const mergedSettings = {
        ...(existing?.settings || {}),
        privacy: privacyPayload,
      };

      const { error: setErr } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: mergedSettings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (setErr) throw setErr;

      showToast('Đã lưu cài đặt');
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu cài đặt', true);
    } finally {
      setSaving(false);
    }
  }, [user]);

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Debounce save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveSettings(newSettings);
    }, 600);
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Auth wall
  if (!authLoading && !user) {
    return (
      <div className="privacy-page">
        <div className="privacy-page__auth">
          <div className="privacy-page__auth-icon">🔒</div>
          <p className="privacy-page__auth-text">Đăng nhập để quản lý quyền riêng tư</p>
          <button className="privacy-page__auth-btn" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="privacy-page">
        <div className="privacy-page__loading">
          <div className="privacy-page__loading-spinner" />
          <span className="privacy-page__loading-text">Đang tải cài đặt...</span>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="privacy-page">
        <div className="privacy-page__error">
          <div className="privacy-page__error-icon">⚠️</div>
          <p className="privacy-page__error-text">{error}</p>
          <button className="privacy-page__retry-btn" onClick={fetchSettings}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="privacy-page">
      <header className="privacy-page__header">
        <h1 className="privacy-page__title">Quyền riêng tư</h1>
        <p className="privacy-page__subtitle">Quản lý ai có thể xem thông tin của bạn</p>
      </header>

      {/* Profile Visibility */}
      <div className="privacy-group">
        <h3 className="privacy-group__title">Hồ sơ</h3>

        <div className="privacy-toggle">
          <div className="privacy-toggle__info">
            <p className="privacy-toggle__label">Hồ sơ công khai</p>
            <p className="privacy-toggle__desc">Cho phép mọi người xem hồ sơ của bạn</p>
          </div>
          <label className="privacy-switch">
            <input
              type="checkbox"
              checked={settings.public_profile}
              onChange={e => handleChange('public_profile', e.target.checked)}
            />
            <span className="privacy-switch__track" />
            <span className="privacy-switch__thumb" />
          </label>
        </div>

        <div className="privacy-toggle">
          <div className="privacy-toggle__info">
            <p className="privacy-toggle__label">Hiện thống kê</p>
            <p className="privacy-toggle__desc">Hiển thị thống kê giao dịch trên hồ sơ</p>
          </div>
          <label className="privacy-switch">
            <input
              type="checkbox"
              checked={settings.show_stats}
              onChange={e => handleChange('show_stats', e.target.checked)}
            />
            <span className="privacy-switch__track" />
            <span className="privacy-switch__thumb" />
          </label>
        </div>
      </div>

      {/* Content Visibility */}
      <div className="privacy-group">
        <h3 className="privacy-group__title">Nội dung</h3>

        <div className="privacy-select">
          <div className="privacy-select__info">
            <p className="privacy-select__label">Bài viết</p>
            <p className="privacy-select__desc">Ai có thể xem bài viết của bạn</p>
          </div>
          <select
            className="privacy-select__dropdown"
            value={settings.post_visibility}
            onChange={e => handleChange('post_visibility', e.target.value)}
          >
            {POST_VISIBILITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="privacy-select">
          <div className="privacy-select__info">
            <p className="privacy-select__label">Bình luận</p>
            <p className="privacy-select__desc">Ai có thể bình luận bài viết của bạn</p>
          </div>
          <select
            className="privacy-select__dropdown"
            value={settings.comment_permission}
            onChange={e => handleChange('comment_permission', e.target.value)}
          >
            {COMMENT_PERMISSION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity */}
      <div className="privacy-group">
        <h3 className="privacy-group__title">Hoạt động</h3>

        <div className="privacy-toggle">
          <div className="privacy-toggle__info">
            <p className="privacy-toggle__label">Trạng thái hoạt động</p>
            <p className="privacy-toggle__desc">Hiển thị khi bạn đang online</p>
          </div>
          <label className="privacy-switch">
            <input
              type="checkbox"
              checked={settings.activity_status}
              onChange={e => handleChange('activity_status', e.target.checked)}
            />
            <span className="privacy-switch__track" />
            <span className="privacy-switch__thumb" />
          </label>
        </div>

        <div className="privacy-toggle">
          <div className="privacy-toggle__info">
            <p className="privacy-toggle__label">Xác nhận đã đọc</p>
            <p className="privacy-toggle__desc">Cho người khác biết bạn đã đọc tin nhắn</p>
          </div>
          <label className="privacy-switch">
            <input
              type="checkbox"
              checked={settings.read_receipts}
              onChange={e => handleChange('read_receipts', e.target.checked)}
            />
            <span className="privacy-switch__track" />
            <span className="privacy-switch__thumb" />
          </label>
        </div>
      </div>

      {saving && <p className="privacy-saving">Đang lưu...</p>}

      {/* Toast */}
      {toast && (
        <div className={`privacy-toast ${toast.isError ? 'privacy-toast--error' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default PrivacySettings;
