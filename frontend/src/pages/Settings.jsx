import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import TelegramConnect from '../components/TelegramConnect/TelegramConnect';
// import './Settings.css'; // Commented out to use global styles from components.css

/**
 * Settings Page
 * User preferences and configuration
 */
function Settings() {
  const { t } = useTranslation();
  const { user, profile, signIn, signUp, signOut, refreshProfile } = useAuth();
  const [localProfile, setLocalProfile] = useState(profile);

  // Settings state
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [notifications, setNotifications] = useState({
    telegram: false,
    email: false,
    browser: true,
  });
  const [telegramUsername, setTelegramUsername] = useState('');
  const [toast, setToast] = useState(null);

  // Auth form state
  const [showSignUp, setShowSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  // Default settings for reset
  const defaultSettings = {
    language: 'en',
    currency: 'USD',
    notifications: {
      telegram: false,
      email: false,
      browser: true,
    },
    telegramUsername: '',
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    console.log('=== SETTINGS PAGE: Loading from localStorage ===');
    try {
      const savedSettings = localStorage.getItem('userSettings');
      console.log('Raw localStorage:', savedSettings);

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        console.log('✅ Parsed settings:', parsed);

        setLanguage(parsed.language || 'en');
        setCurrency(parsed.currency || 'USD');
        setNotifications(parsed.notifications || defaultSettings.notifications);
        setTelegramUsername(parsed.telegramUsername || '');

        console.log('💱 Currency loaded:', parsed.currency);
      } else {
        console.log('⚠️ No saved settings found, using defaults');
      }
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
    }
    console.log('=== Settings Load Complete ===');
  }, []);

  // ⚡ FIX: Refresh profile khi vào Settings
  useEffect(() => {
    if (user && !profile) {
      console.log('⚡ Settings: Refreshing profile...');
      refreshProfile().then((result) => {
        if (result.success) {
          setLocalProfile(result.profile);
        }
      });
    } else if (profile) {
      setLocalProfile(profile);
    }
  }, [user, profile, refreshProfile]);

  // Use localProfile thay vì profile
  const displayProfile = localProfile || profile;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleSave = () => {
    console.log('=== SAVE BUTTON CLICKED ===');

    // Validate Telegram username if enabled
    if (notifications.telegram && !telegramUsername.trim()) {
      console.log('❌ Validation failed: Telegram username required');
      showToast(t('enterTelegramUsername'), 'error');
      return;
    }

    // Save settings (in real app, would call API)
    const settings = {
      language,
      currency,
      notifications,
      telegramUsername,
      savedAt: new Date().toISOString(),
    };

    console.log('💾 Saving settings to localStorage:', settings);
    localStorage.setItem('userSettings', JSON.stringify(settings));
    console.log('✅ localStorage updated!');

    // Verify save
    const verification = localStorage.getItem('userSettings');
    console.log('🔍 Verification - localStorage now contains:', verification);

    // Dispatch event to notify App and other components
    console.log('📢 Dispatching settingsUpdated event...');
    window.dispatchEvent(new CustomEvent('settingsUpdated', {
      detail: settings
    }));
    console.log('✅ Event dispatched successfully!');

    // Use language-specific success message
    const messages = {
      en: 'Settings saved successfully!',
      vi: 'Đã lưu cài đặt thành công!',
      zh: '设置保存成功！'
    };
    showToast(messages[language] || messages.en, 'success');
    console.log('=== SAVE COMPLETE ===');
  };

  const handleReset = () => {
    if (confirm(t('confirmReset'))) {
      setLanguage(defaultSettings.language);
      setCurrency(defaultSettings.currency);
      setNotifications(defaultSettings.notifications);
      setTelegramUsername(defaultSettings.telegramUsername);

      localStorage.removeItem('userSettings');
      showToast(t('settingsReset'), 'success');
    }
  };

  // Auth handlers
  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!authForm.email.trim()) {
      showToast(t('emailRequired'), 'error');
      return;
    }
    if (!authForm.password.trim()) {
      showToast(t('passwordRequired'), 'error');
      return;
    }

    setAuthLoading(true);
    try {
      const result = await signIn(authForm.email, authForm.password);
      if (result.success) {
        showToast(t('signInSuccess'), 'success');
        setAuthForm({ email: '', password: '', confirmPassword: '', fullName: '' });
      } else {
        showToast(result.error || t('invalidCredentials'), 'error');
      }
    } catch (error) {
      showToast(t('invalidCredentials'), 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!authForm.fullName.trim()) {
      showToast(t('nameRequired'), 'error');
      return;
    }
    if (!authForm.email.trim()) {
      showToast(t('emailRequired'), 'error');
      return;
    }
    if (!authForm.password.trim()) {
      showToast(t('passwordRequired'), 'error');
      return;
    }
    if (authForm.password.length < 6) {
      showToast(t('weakPassword'), 'error');
      return;
    }
    if (authForm.password !== authForm.confirmPassword) {
      showToast(t('passwordMismatch'), 'error');
      return;
    }

    setAuthLoading(true);
    try {
      const result = await signUp(authForm.email, authForm.password, authForm.fullName);
      if (result.success) {
        showToast(t('signUpSuccess'), 'success');
        setAuthForm({ email: '', password: '', confirmPassword: '', fullName: '' });
        setShowSignUp(false);
      } else {
        showToast(result.error || 'Sign up failed', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Sign up failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast(t('signOutSuccess'), 'success');
    } catch (error) {
      showToast('Sign out failed', 'error');
    }
  };

  const handleRefreshProfile = async () => {
    try {
      const result = await refreshProfile();
      if (result.success) {
        showToast('✅ Profile refreshed successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to refresh profile', 'error');
      }
    } catch (error) {
      showToast('Failed to refresh profile', 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-content narrow">
        <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
          <div className="settings-header">
            <h1 className="heading-gold" style={{ marginBottom: '32px' }}>
              ⚙️ {t('settingsTitle')}
            </h1>
            <p className="text-muted" style={{ fontSize: '18px', marginBottom: '32px' }}>{t('configurePreferences')}</p>
          </div>

          <div className="settings-content">
            {/* Account Section */}
            <div className="card-glass" style={{
              borderColor: 'rgba(255, 189, 89, 0.22)',
              padding: '32px',
              marginBottom: '24px'
            }}>
          <div className="section-header">
            <h2>👤 {t('account')}</h2>
            <p>{user ? t('profile') : t('signInToAccount')}</p>
          </div>

          {!user ? (
            // Sign In / Sign Up Forms
            <div className="auth-forms">
              {!showSignUp ? (
                // Sign In Form
                <form onSubmit={handleSignIn} className="auth-form">
                  <div className="form-group">
                    <label>{t('email')}</label>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="your@email.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      disabled={authLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('password')}</label>
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      disabled={authLoading}
                    />
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                    {authLoading ? '⏳ Loading...' : `🔐 ${t('signIn')}`}
                  </button>

                  <div className="auth-switch">
                    <span>{t('dontHaveAccount')} </span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setShowSignUp(true)}
                    >
                      {t('signUp')}
                    </button>
                  </div>
                </form>
              ) : (
                // Sign Up Form
                <form onSubmit={handleSignUp} className="auth-form">
                  <div className="form-group">
                    <label>{t('fullName')}</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="John Doe"
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      disabled={authLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('email')}</label>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="your@email.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      disabled={authLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('password')}</label>
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      disabled={authLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('confirmPassword')}</label>
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="••••••••"
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                      disabled={authLoading}
                    />
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                    {authLoading ? '⏳ Loading...' : `✨ ${t('createAccount')}`}
                  </button>

                  <div className="auth-switch">
                    <span>{t('alreadyHaveAccount')} </span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setShowSignUp(false)}
                    >
                      {t('signIn')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            // User Profile Display
            <div className="user-profile">
              <div className="profile-info">
                <div className="profile-item">
                  <span className="profile-label">{t('email')}:</span>
                  <span className="profile-value">{user.email}</span>
                </div>

                <div className="profile-item">
                  <span className="profile-label">{t('fullName')}:</span>
                  <span className="profile-value">{profile?.full_name || 'N/A'}</span>
                </div>

                <div className="profile-item">
                  <span className="profile-label">{t('accountTier')}:</span>
                  <span className={`profile-tier ${profile?.tier || 'free'}`}>
                    {profile?.tier === 'free' ? '🆓' : '💎'} {profile?.tier?.toUpperCase() || 'FREE'}
                  </span>
                </div>

                <div className="profile-item">
                  <span className="profile-label">{t('role') || 'Role'}:</span>
                  <span className={`profile-role ${profile?.role || 'user'}`}>
                    {profile?.role === 'admin' ? '👑' : '👤'} {profile?.role?.toUpperCase() || 'USER'}
                  </span>
                </div>

                {displayProfile?.tier !== 'free' && displayProfile?.tier_expires_at && (
                  <div className="profile-item">
                    <span className="profile-label">{t('tierExpires')}:</span>
                    <span className="profile-value">
                      {new Date(displayProfile.tier_expires_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                marginTop: '24px'
              }}>
                <button
                  onClick={handleRefreshProfile}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0A0E27',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(255, 189, 89, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = '0 6px 30px rgba(255, 189, 89, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 189, 89, 0.3)';
                  }}
                >
                  🔄 Refresh Profile
                </button>

                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #EF4444',
                    borderRadius: '8px',
                    color: '#EF4444',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  🚪 {t('signOut')}
                </button>
              </div>
            </div>
          )}
        </div>

            {/* Telegram Alerts Section - Only for Tier 1+ */}
            {user && profile?.tier !== 'free' && (
              <div className="card-glass" style={{
                borderColor: 'rgba(0, 217, 255, 0.22)',
                padding: '32px',
                marginBottom: '24px'
              }}>
            <TelegramConnect />
          </div>
        )}

            {/* Language Section */}
            <div className="card-glass" style={{
              borderColor: 'rgba(139, 92, 246, 0.22)',
              padding: '32px',
              marginBottom: '24px'
            }}>
          <div className="section-header">
            <h2>🌐 {t('language')}</h2>
            <p>{t('chooseLanguage')}</p>
          </div>

          <div className="setting-options">
            <label className={`option-card ${language === 'en' ? 'active' : ''}`}>
              <input
                type="radio"
                name="language"
                value="en"
                checked={language === 'en'}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <span className="option-icon">🇺🇸</span>
              <span className="option-label">English</span>
            </label>

            <label className={`option-card ${language === 'vi' ? 'active' : ''}`}>
              <input
                type="radio"
                name="language"
                value="vi"
                checked={language === 'vi'}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <span className="option-icon">🇻🇳</span>
              <span className="option-label">Tiếng Việt</span>
            </label>

            <label className={`option-card ${language === 'zh' ? 'active' : ''}`}>
              <input
                type="radio"
                name="language"
                value="zh"
                checked={language === 'zh'}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <span className="option-icon">🇨🇳</span>
              <span className="option-label">中文</span>
            </label>
          </div>
        </div>

            {/* Currency Section */}
            <div className="card-glass" style={{
              borderColor: 'rgba(255, 189, 89, 0.22)',
              padding: '32px',
              marginBottom: '24px'
            }}>
          <div className="section-header">
            <h2>💰 {t('currency')}</h2>
            <p>{t('displayCurrency')}</p>
          </div>

          <div className="setting-options">
            <label className={`option-card ${currency === 'USD' ? 'active' : ''}`}>
              <input
                type="radio"
                name="currency"
                value="USD"
                checked={currency === 'USD'}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <span className="option-icon">$</span>
              <span className="option-label">USD</span>
            </label>

            <label className={`option-card ${currency === 'EUR' ? 'active' : ''}`}>
              <input
                type="radio"
                name="currency"
                value="EUR"
                checked={currency === 'EUR'}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <span className="option-icon">€</span>
              <span className="option-label">EUR</span>
            </label>

            <label className={`option-card ${currency === 'VND' ? 'active' : ''}`}>
              <input
                type="radio"
                name="currency"
                value="VND"
                checked={currency === 'VND'}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <span className="option-icon">₫</span>
              <span className="option-label">VND</span>
            </label>
          </div>
        </div>

            {/* Notifications Section */}
            <div className="card-glass" style={{
              borderColor: 'rgba(0, 217, 255, 0.22)',
              padding: '32px',
              marginBottom: '24px'
            }}>
          <div className="section-header">
            <h2>🔔 {t('notifications')}</h2>
            <p>{t('getAlerts')}</p>
          </div>

          <div className="notification-settings">
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-icon">📱</div>
                <div className="notification-text">
                  <div className="notification-title">{t('telegramNotifications')}</div>
                  <div className="notification-desc">{t('receiveOnTelegram')}</div>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.telegram}
                  onChange={(e) =>
                    setNotifications({ ...notifications, telegram: e.target.checked })
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {notifications.telegram && (
              <div className="telegram-setup">
                <label className="input-label">{t('telegramUsername')}</label>
                <input
                  type="text"
                  className="telegram-input"
                  placeholder="@your_username"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                />
                <p className="input-hint">
                  {t('startChatFirst')}
                </p>
              </div>
            )}

            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-icon">📧</div>
                <div className="notification-text">
                  <div className="notification-title">{t('emailNotifications')}</div>
                  <div className="notification-desc">{t('receiveViaEmail')}</div>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) =>
                    setNotifications({ ...notifications, email: e.target.checked })
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-icon">🌐</div>
                <div className="notification-text">
                  <div className="notification-title">{t('browserNotifications')}</div>
                  <div className="notification-desc">{t('showDesktopNotifications')}</div>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.browser}
                  onChange={(e) =>
                    setNotifications({ ...notifications, browser: e.target.checked })
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

            {/* Save Button */}
            <div className="settings-actions">
              <button className="btn-primary" onClick={handleSave}>
                💾 {t('saveSettings')}
              </button>
              <button className="btn-secondary" onClick={handleReset}>
                ↺ {t('resetDefault')}
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className={`toast-notification ${toast.type === 'error' ? 'error' : ''}`}>
              <span className="toast-icon">
                {toast.type === 'success' ? '✅' : '❌'}
              </span>
              <span>{toast.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
