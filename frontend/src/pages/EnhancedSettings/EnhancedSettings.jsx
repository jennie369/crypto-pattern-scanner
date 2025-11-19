/**
 * Enhanced Settings Page
 * Comprehensive user settings with tabbed navigation
 * - Account Settings
 * - Subscription Management
 * - Notification Preferences
 * - Privacy & Security
 * - Trading Preferences
 * - Display Preferences
 * - Connected Accounts
 * - API & Integrations
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Gem,
  Bell,
  Lock,
  TrendingUp,
  Palette,
  Link,
  Settings as SettingsIcon,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUserSettings,
  updateSettings,
  getActiveSessions,
  getApiKeys,
  getSubscriptionInfo,
} from '../../services/settingsService';

// Import sub-components
import AccountSettings from './AccountSettings';
import SubscriptionSettings from './SubscriptionSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import TradingSettings from './TradingSettings';
import DisplaySettings from './DisplaySettings';
import ConnectedAccounts from './ConnectedAccounts';
import AdvancedSettings from './AdvancedSettings';

import './enhanced-settings.css';

const EnhancedSettings = () => {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState('account');

  // Settings state
  const [settings, setSettings] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Tab definitions
  const tabs = [
    { id: 'account', label: t('account') || 'Account', Icon: User },
    { id: 'subscription', label: t('subscription') || 'Subscription', Icon: Gem },
    { id: 'notifications', label: t('notifications') || 'Notifications', Icon: Bell },
    { id: 'privacy', label: t('privacy') || 'Privacy', Icon: Lock },
    { id: 'trading', label: t('trading') || 'Trading', Icon: TrendingUp },
    { id: 'display', label: t('display') || 'Display', Icon: Palette },
    { id: 'connected', label: t('connected') || 'Connected', Icon: Link },
    { id: 'api', label: 'API & Integrations', Icon: SettingsIcon },
  ];

  // Load initial data
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [settingsRes, subscriptionRes, sessionsRes, keysRes] = await Promise.all([
        getUserSettings(user.id),
        getSubscriptionInfo(user.id),
        getActiveSessions(user.id),
        getApiKeys(user.id),
      ]);

      if (settingsRes.data) {
        setSettings(settingsRes.data);
      }

      if (subscriptionRes.data) {
        setSubscriptionInfo(subscriptionRes.data);
      }

      if (sessionsRes.data) {
        setSessions(sessionsRes.data);
      }

      if (keysRes.data) {
        setApiKeys(keysRes.data);
      }
    } catch (error) {
      console.error('Error loading settings data:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const handleUpdateSettings = async (updates) => {
    setSaving(true);
    try {
      const result = await updateSettings(user.id, updates);

      if (result.success) {
        setSettings(result.data);
        showToast('Settings saved successfully!', 'success');

        // Dispatch event for other components
        window.dispatchEvent(
          new CustomEvent('settingsUpdated', {
            detail: result.data,
          })
        );

        return { success: true };
      } else {
        showToast(result.error?.message || 'Failed to save settings', 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast('Failed to save settings', 'error');
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  // Refresh data
  const handleRefreshData = async () => {
    await loadAllData();
    await refreshProfile();
  };

  // Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Render active tab content
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'account':
        return (
          <AccountSettings
            user={user}
            profile={profile}
            onRefresh={handleRefreshData}
            showToast={showToast}
          />
        );

      case 'subscription':
        return (
          <SubscriptionSettings
            subscriptionInfo={subscriptionInfo}
            profile={profile}
            showToast={showToast}
          />
        );

      case 'notifications':
        return (
          <NotificationSettings
            settings={settings}
            onUpdate={handleUpdateSettings}
            saving={saving}
            showToast={showToast}
          />
        );

      case 'privacy':
        return (
          <PrivacySettings
            settings={settings}
            sessions={sessions}
            onUpdate={handleUpdateSettings}
            onRefreshSessions={loadAllData}
            saving={saving}
            showToast={showToast}
          />
        );

      case 'trading':
        return (
          <TradingSettings
            settings={settings}
            onUpdate={handleUpdateSettings}
            saving={saving}
            showToast={showToast}
          />
        );

      case 'display':
        return (
          <DisplaySettings
            settings={settings}
            onUpdate={handleUpdateSettings}
            saving={saving}
            showToast={showToast}
          />
        );

      case 'connected':
        return (
          <ConnectedAccounts
            user={user}
            profile={profile}
            showToast={showToast}
          />
        );

      case 'api':
        return (
          <AdvancedSettings
            user={user}
            profile={profile}
            settings={settings}
            apiKeys={apiKeys}
            onUpdate={handleUpdateSettings}
            onRefreshApiKeys={loadAllData}
            saving={saving}
            showToast={showToast}
          />
        );

      default:
        return <div>Tab not found</div>;
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <div className="page-container">
        <div className="page-content narrow">
          <div className="enhanced-settings-container">
            <div className="card-glass" style={{ padding: '48px', textAlign: 'center' }}>
              <h2>🔒 Sign in Required</h2>
              <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Please sign in to access your settings.
              </p>
              <button
                className="btn-primary"
                style={{ marginTop: '24px' }}
                onClick={() => (window.location.href = '/settings')}
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content wide">
        <div className="enhanced-settings-container">
          {/* Header */}
          <div className="settings-header">
            <h1 className="heading-gold" style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <SettingsIcon size={32} />
              {t('settingsTitle') || 'Settings'}
            </h1>
            <p className="text-muted">
              {t('manageYourAccountAndPreferences') || 'Manage your account and preferences'}
            </p>
          </div>

          {/* Main Content */}
          <div className="settings-layout">
            {/* Sidebar Navigation */}
            <div className="settings-sidebar">
              <div className="settings-tabs">
                {tabs.map((tab) => {
                  const TabIcon = tab.Icon;
                  return (
                    <button
                      key={tab.id}
                      className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="tab-icon">
                        <TabIcon size={20} />
                      </span>
                      <span className="tab-label">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="settings-content">{renderTabContent()}</div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className={`toast-notification ${toast.type === 'error' ? 'error' : ''}`}>
              <span className="toast-icon">
                {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              </span>
              <span>{toast.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSettings;
