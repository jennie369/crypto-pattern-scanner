import React, { useState, useEffect } from 'react';
import { Settings, X, Moon, Sun, Globe, Type, Volume2, Bell, MessageSquare, Save, RotateCcw } from 'lucide-react';
import { preferencesService } from '../services/preferencesService';
import { themeService } from '../services/themeService';
import { i18nService } from '../services/i18nService';
import './PreferencesPanel.css';

export default function PreferencesPanel({ onClose }) {
  const [prefs, setPrefs] = useState(preferencesService.getAll());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Listen for language changes
    const handleLangChange = () => {
      setPrefs(preferencesService.getAll());
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const handleChange = (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    setHasChanges(true);
  };

  const handleSave = () => {
    preferencesService.setMultiple(prefs);
    setHasChanges(false);
    alert('✅ Settings saved successfully!');
  };

  const handleReset = () => {
    if (preferencesService.reset()) {
      setPrefs(preferencesService.getAll());
      setHasChanges(false);
    }
  };

  const t = (key, def) => i18nService.t(key, def);

  return (
    <div className="preferences-overlay">
      <div className="preferences-modal">
        {/* Header */}
        <div className="preferences-header">
          <div>
            <h2 className="preferences-title">
              <Settings size={24} />
              {t('settings.title', 'Settings & Preferences')}
            </h2>
          </div>
          <button onClick={onClose} className="preferences-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="preferences-content">
          {/* Appearance Section */}
          <div className="pref-section">
            <h3 className="pref-section-title">
              {prefs.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              {t('settings.appearance', 'Appearance')}
            </h3>

            <div className="pref-group">
              <label className="pref-label">{t('settings.theme', 'Theme')}</label>
              <div className="pref-toggle-group">
                <button
                  className={`pref-toggle-btn ${prefs.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleChange('theme', 'dark')}
                >
                  <Moon size={16} />
                  {t('theme.dark', 'Dark')}
                </button>
                <button
                  className={`pref-toggle-btn ${prefs.theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleChange('theme', 'light')}
                >
                  <Sun size={16} />
                  {t('theme.light', 'Light')}
                </button>
              </div>
            </div>

            <div className="pref-group">
              <label className="pref-label">
                <Globe size={16} />
                {t('settings.language', 'Language')}
              </label>
              <div className="pref-toggle-group">
                <button
                  className={`pref-toggle-btn ${prefs.language === 'vi' ? 'active' : ''}`}
                  onClick={() => handleChange('language', 'vi')}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  className={`pref-toggle-btn ${prefs.language === 'en' ? 'active' : ''}`}
                  onClick={() => handleChange('language', 'en')}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            <div className="pref-group">
              <label className="pref-label">
                <Type size={16} />
                {t('settings.fontSize', 'Font Size')}
              </label>
              <div className="pref-toggle-group">
                <button
                  className={`pref-toggle-btn ${prefs.fontSize === 'small' ? 'active' : ''}`}
                  onClick={() => handleChange('fontSize', 'small')}
                >
                  {t('fontSize.small', 'Small')}
                </button>
                <button
                  className={`pref-toggle-btn ${prefs.fontSize === 'medium' ? 'active' : ''}`}
                  onClick={() => handleChange('fontSize', 'medium')}
                >
                  {t('fontSize.medium', 'Medium')}
                </button>
                <button
                  className={`pref-toggle-btn ${prefs.fontSize === 'large' ? 'active' : ''}`}
                  onClick={() => handleChange('fontSize', 'large')}
                >
                  {t('fontSize.large', 'Large')}
                </button>
              </div>
            </div>
          </div>

          {/* Sound & Notifications */}
          <div className="pref-section">
            <h3 className="pref-section-title">
              <Volume2 size={18} />
              {t('settings.sound', 'Sound')} & {t('settings.notifications', 'Notifications')}
            </h3>

            <div className="pref-checkbox-group">
              <label className="pref-checkbox">
                <input
                  type="checkbox"
                  checked={prefs.soundEnabled}
                  onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                />
                <span>{t('settings.sound', 'Sound Effects')}</span>
              </label>

              <label className="pref-checkbox">
                <input
                  type="checkbox"
                  checked={prefs.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                />
                <span>{t('settings.notifications', 'Notifications')}</span>
              </label>
            </div>
          </div>

          {/* Chat Preferences */}
          <div className="pref-section">
            <h3 className="pref-section-title">
              <MessageSquare size={18} />
              {t('settings.chat', 'Chat Preferences')}
            </h3>

            <div className="pref-checkbox-group">
              <label className="pref-checkbox">
                <input
                  type="checkbox"
                  checked={prefs.autoSend}
                  onChange={(e) => handleChange('autoSend', e.target.checked)}
                />
                <span>{t('settings.autoSend', 'Auto-send Quick Select')}</span>
              </label>

              <label className="pref-checkbox">
                <input
                  type="checkbox"
                  checked={prefs.enterToSend}
                  onChange={(e) => handleChange('enterToSend', e.target.checked)}
                />
                <span>{t('settings.enterToSend', 'Enter to Send')}</span>
              </label>

              <label className="pref-checkbox">
                <input
                  type="checkbox"
                  checked={prefs.showTimestamps}
                  onChange={(e) => handleChange('showTimestamps', e.target.checked)}
                />
                <span>{t('settings.timestamps', 'Show Timestamps')}</span>
              </label>

              <label className="pref-checkbox">
                <input
                  type="checkbox"
                  checked={prefs.compactMode}
                  onChange={(e) => handleChange('compactMode', e.target.checked)}
                />
                <span>{t('settings.compactMode', 'Compact Mode')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="preferences-actions">
          <div className="pref-actions-right">
            <button onClick={handleReset} className="pref-btn-danger">
              <RotateCcw size={16} />
              {t('settings.reset', 'Reset')}
            </button>
            <button
              onClick={handleSave}
              className="pref-btn-primary"
              disabled={!hasChanges}
            >
              <Save size={16} />
              {t('common.save', 'Save')}
            </button>
          </div>
        </div>

        {hasChanges && (
          <div className="pref-warning">
            ⚠️ You have unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}
