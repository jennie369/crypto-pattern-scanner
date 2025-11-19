/**
 * Notification Settings Component
 * - Granular notification controls
 * - Telegram, Email, Browser notifications
 * - Specific alert types (Price, Pattern, Signals, etc.)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Save, Loader, Bell, Smartphone, Mail, Globe, DollarSign, BarChart3, Target } from 'lucide-react';

const NotificationSettings = ({ settings, onUpdate, saving, showToast }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState({
    telegram: false,
    email: false,
    browser: true,
    priceAlerts: true,
    patternDetected: true,
    tradeSignals: false,
    systemUpdates: true,
  });

  // Load notifications from settings
  useEffect(() => {
    if (settings?.notifications) {
      setNotifications(settings.notifications);
    }
  }, [settings]);

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    const result = await onUpdate({
      notifications,
    });

    if (result.success) {
      showToast('Notification settings saved!', 'success');
    }
  };

  return (
    <div className="notification-settings-page">
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} /> Notification Channels
        </h2>
        <p className="section-desc">Choose how you want to receive notifications</p>

        <div className="notification-settings" style={{ marginTop: '24px' }}>
          {/* Telegram */}
          <div className="notification-item">
            <div className="notification-info">
              <div className="notification-icon"><Smartphone size={20} /></div>
              <div className="notification-text">
                <div className="notification-title">Telegram Notifications</div>
                <div className="notification-desc">Receive alerts via Telegram bot</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.telegram}
                onChange={() => handleToggle('telegram')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Email */}
          <div className="notification-item">
            <div className="notification-info">
              <div className="notification-icon"><Mail size={20} /></div>
              <div className="notification-text">
                <div className="notification-title">Email Notifications</div>
                <div className="notification-desc">Receive alerts via email</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleToggle('email')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Browser */}
          <div className="notification-item">
            <div className="notification-info">
              <div className="notification-icon"><Globe size={20} /></div>
              <div className="notification-text">
                <div className="notification-title">Browser Notifications</div>
                <div className="notification-desc">Show desktop push notifications</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.browser}
                onChange={() => handleToggle('browser')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} /> Alert Types
        </h2>
        <p className="section-desc">Choose which types of alerts you want to receive</p>

        <div className="notification-settings" style={{ marginTop: '24px' }}>
          {/* Price Alerts */}
          <div className="notification-item">
            <div className="notification-info">
              <div className="notification-icon"><DollarSign size={20} /></div>
              <div className="notification-text">
                <div className="notification-title">Price Alerts</div>
                <div className="notification-desc">Get notified when price targets are hit</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.priceAlerts}
                onChange={() => handleToggle('priceAlerts')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Pattern Detected */}
          <div className="notification-item">
            <div className="notification-info">
              <div className="notification-icon"><BarChart3 size={20} /></div>
              <div className="notification-text">
                <div className="notification-title">Pattern Detected</div>
                <div className="notification-desc">Alerts when chart patterns are found</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.patternDetected}
                onChange={() => handleToggle('patternDetected')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Trade Signals */}
          <div className="notification-item">
            <div className="notification-info">
              <div className="notification-icon"><Target size={20} /></div>
              <div className="notification-text">
                <div className="notification-title">Trade Signals</div>
                <div className="notification-desc">Buy/sell signal recommendations</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.tradeSignals}
                onChange={() => handleToggle('tradeSignals')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* System Updates */}
          <div className="notification-item">
            <div className="notification-info">
              <div className="notification-icon"><Bell size={20} /></div>
              <div className="notification-text">
                <div className="notification-title">System Updates</div>
                <div className="notification-desc">News about features and improvements</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.systemUpdates}
                onChange={() => handleToggle('systemUpdates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {saving ? (
            <>
              <Loader size={16} className="spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={16} /> Save Notification Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
