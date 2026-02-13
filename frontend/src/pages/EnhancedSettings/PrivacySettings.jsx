/**
 * Privacy Settings Component
 * - Profile visibility controls
 * - Active sessions management
 * - 2FA toggle (placeholder)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { revokeSession } from '../../services/settingsService';
import { Save, Loader, Lock, Globe, BarChart3, Shield, Monitor, Smartphone, LogOut } from 'lucide-react';

const PrivacySettings = ({ settings, sessions, onUpdate, onRefreshSessions, saving, showToast }) => {
  const { t } = useTranslation();
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    showTrades: false,
    twoFactorEnabled: false,
  });
  const [revoking, setRevoking] = useState(null);

  // Load privacy settings
  useEffect(() => {
    if (settings?.privacy) {
      setPrivacy(settings.privacy);
    }
  }, [settings]);

  const handleToggle = (key) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleVisibilityChange = (value) => {
    setPrivacy((prev) => ({
      ...prev,
      profileVisibility: value,
    }));
  };

  const handleSave = async () => {
    const result = await onUpdate({
      privacy,
    });

    if (result.success) {
      showToast('Privacy settings saved!', 'success');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    setRevoking(sessionId);
    try {
      const result = await revokeSession(sessionId);

      if (result.success) {
        showToast('Session revoked successfully!', 'success');
        await onRefreshSessions();
      } else {
        showToast('Failed to revoke session', 'error');
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      showToast('Failed to revoke session', 'error');
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="privacy-settings-page">
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={20} /> Privacy Controls
        </h2>
        <p className="section-desc">Manage who can see your information</p>

        <div style={{ marginTop: '24px' }}>
          {/* Profile Visibility */}
          <div className="form-group">
            <label style={{ marginBottom: '12px', display: 'block' }}>Profile Visibility</label>
            <div className="setting-options">
              <label className={`option-card ${privacy.profileVisibility === 'public' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={privacy.profileVisibility === 'public'}
                  onChange={(e) => handleVisibilityChange(e.target.value)}
                />
                <span className="option-icon"><Globe size={20} /></span>
                <span className="option-label">Public</span>
              </label>

              <label className={`option-card ${privacy.profileVisibility === 'private' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={privacy.profileVisibility === 'private'}
                  onChange={(e) => handleVisibilityChange(e.target.value)}
                />
                <span className="option-icon"><Lock size={20} /></span>
                <span className="option-label">Private</span>
              </label>
            </div>
          </div>

          {/* Show Trades */}
          <div className="notification-item" style={{ marginTop: '24px' }}>
            <div className="notification-info">
              <div className="notification-icon"><BarChart3 size={20} /></div>
              <div className="notification-text">
                <div className="notification-title">Show Trading History</div>
                <div className="notification-desc">Allow others to see your trades</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacy.showTrades}
                onChange={() => handleToggle('showTrades')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* 2FA (Placeholder) */}
          <div className="notification-item" style={{ marginTop: '16px' }}>
            <div className="notification-info">
              <div className="notification-icon"><Shield size={20} /></div>
              <div className="notification-text">
                <div className="notification-title">Two-Factor Authentication</div>
                <div className="notification-desc">Add extra security to your account (Coming soon)</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacy.twoFactorEnabled}
                onChange={() => handleToggle('twoFactorEnabled')}
                disabled
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {saving ? (
              <>
                <Loader size={16} className="spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Privacy Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Monitor size={20} /> Active Sessions
        </h2>
        <p className="section-desc">Manage devices that are currently signed in</p>

        <div style={{ marginTop: '24px' }}>
          {sessions && sessions.length > 0 ? (
            <div className="sessions-list">
              {sessions.map((session) => (
                <div key={session.id} className="session-card">
                  <div className="session-icon">
                    {session.device_type === 'mobile' ? <Smartphone size={20} /> : session.device_type === 'tablet' ? <Smartphone size={20} /> : <Monitor size={20} />}
                  </div>
                  <div className="session-info">
                    <div className="session-name">{session.device_name || 'Unknown Device'}</div>
                    <div className="session-details">
                      {session.browser} on {session.os}
                    </div>
                    <div className="session-meta">
                      IP: {session.ip_address || 'N/A'} • Last active:{' '}
                      {new Date(session.last_activity).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="btn-danger-small"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={revoking === session.id}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid #EF4444',
                      borderRadius: '8px',
                      color: '#EF4444',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {revoking === session.id ? (
                      <>
                        <Loader size={14} className="spin" />
                      </>
                    ) : (
                      <>
                        <LogOut size={14} /> Revoke
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No active sessions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
