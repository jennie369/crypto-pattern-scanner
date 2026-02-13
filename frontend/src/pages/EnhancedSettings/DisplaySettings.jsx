/**
 * Display Settings Component
 * - Language selection (EN, VI, ZH)
 * - Currency preference (USD, EUR, VND)
 * - Timezone
 * - Date format
 * - Theme (placeholder)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Save, Loader, Globe, DollarSign, Clock, Calendar, Palette, Moon, Sun } from 'lucide-react';

const DisplaySettings = ({ settings, onUpdate, saving, showToast }) => {
  const { t } = useTranslation();
  const [display, setDisplay] = useState({
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    theme: 'dark',
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC (GMT+0)' },
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (ICT)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2025' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2025' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2025-12-31' },
  ];

  // Load display settings
  useEffect(() => {
    if (settings?.display) {
      setDisplay(settings.display);
    }
  }, [settings]);

  const handleLanguageChange = (code) => {
    setDisplay((prev) => ({
      ...prev,
      language: code,
    }));
  };

  const handleCurrencyChange = (code) => {
    setDisplay((prev) => ({
      ...prev,
      currency: code,
    }));
  };

  const handleTimezoneChange = (value) => {
    setDisplay((prev) => ({
      ...prev,
      timezone: value,
    }));
  };

  const handleDateFormatChange = (value) => {
    setDisplay((prev) => ({
      ...prev,
      dateFormat: value,
    }));
  };

  const handleSave = async () => {
    const result = await onUpdate({
      display,
    });

    if (result.success) {
      showToast('Display settings saved!', 'success');

      // Update localStorage for backward compatibility
      const legacySettings = {
        language: display.language,
        currency: display.currency,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('userSettings', JSON.stringify(legacySettings));

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent('settingsUpdated', {
          detail: legacySettings,
        })
      );
    }
  };

  return (
    <div className="display-settings-page">
      {/* Language */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={20} /> Language
        </h2>
        <p className="section-desc">Choose your preferred language</p>

        <div className="setting-options" style={{ marginTop: '24px' }}>
          {languages.map((lang) => (
            <label
              key={lang.code}
              className={`option-card ${display.language === lang.code ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="language"
                value={lang.code}
                checked={display.language === lang.code}
                onChange={(e) => handleLanguageChange(e.target.value)}
              />
              <span className="option-icon">{lang.flag}</span>
              <span className="option-label">{lang.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={20} /> Currency
        </h2>
        <p className="section-desc">Select your preferred currency for display</p>

        <div className="setting-options" style={{ marginTop: '24px' }}>
          {currencies.map((curr) => (
            <label
              key={curr.code}
              className={`option-card ${display.currency === curr.code ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="currency"
                value={curr.code}
                checked={display.currency === curr.code}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              />
              <span className="option-icon">{curr.symbol}</span>
              <span className="option-label">{curr.code}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={20} /> Timezone
        </h2>
        <p className="section-desc">Set your local timezone</p>

        <div style={{ marginTop: '24px' }}>
          <select
            className="auth-input"
            value={display.timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Format */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} /> Date Format
        </h2>
        <p className="section-desc">Choose how dates are displayed</p>

        <div className="setting-options" style={{ marginTop: '24px' }}>
          {dateFormats.map((format) => (
            <label
              key={format.value}
              className={`option-card ${display.dateFormat === format.value ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="dateFormat"
                value={format.value}
                checked={display.dateFormat === format.value}
                onChange={(e) => handleDateFormatChange(e.target.value)}
              />
              <span className="option-icon"><Calendar size={20} /></span>
              <div style={{ textAlign: 'center' }}>
                <span className="option-label" style={{ display: 'block' }}>
                  {format.label}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  {format.example}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Theme (Placeholder) */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px', opacity: 0.6 }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={20} /> Theme
        </h2>
        <p className="section-desc">Choose your interface theme (Coming soon)</p>

        <div className="setting-options" style={{ marginTop: '24px' }}>
          <label className="option-card active">
            <input type="radio" name="theme" value="dark" checked disabled />
            <span className="option-icon"><Moon size={20} /></span>
            <span className="option-label">Dark</span>
          </label>

          <label className="option-card">
            <input type="radio" name="theme" value="light" disabled />
            <span className="option-icon"><Sun size={20} /></span>
            <span className="option-label">Light</span>
          </label>
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
              <Save size={16} /> Save Display Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DisplaySettings;
