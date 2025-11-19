/**
 * Preferences Service
 * Manages all user preferences and settings
 */

import { themeService } from './themeService';
import { soundService } from './soundService';

class PreferencesService {
  constructor() {
    this.storageKey = 'gem-preferences';
    this.preferences = this.loadPreferences();
  }

  /**
   * Load all preferences
   */
  loadPreferences() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this.getDefaultPreferences();
    } catch {
      return this.getDefaultPreferences();
    }
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences() {
    return {
      // Appearance
      theme: 'dark',
      language: 'vi',
      fontSize: 'medium',

      // Sound
      soundEnabled: true,
      soundVolume: 0.5,

      // Chat
      autoSend: true,
      enterToSend: true,
      showTimestamps: true,
      compactMode: false,

      // Notifications
      notifications: true,

      // Quick Responses
      customTemplates: [],

      // Privacy
      saveHistory: true,
      analytics: true,

      // Advanced
      debugMode: false,
      apiTimeout: 30000
    };
  }

  /**
   * Get all preferences
   */
  getAll() {
    return { ...this.preferences };
  }

  /**
   * Get specific preference
   */
  get(key) {
    return this.preferences[key];
  }

  /**
   * Set specific preference
   */
  set(key, value) {
    this.preferences[key] = value;
    this.savePreferences();
    this.applyPreference(key, value);
  }

  /**
   * Set multiple preferences
   */
  setMultiple(updates) {
    Object.keys(updates).forEach(key => {
      this.preferences[key] = updates[key];
      this.applyPreference(key, updates[key]);
    });
    this.savePreferences();
  }

  /**
   * Apply preference change
   */
  applyPreference(key, value) {
    switch (key) {
      case 'theme':
        themeService.setTheme(value);
        break;
      case 'soundEnabled':
        if (soundService.isEnabled() !== value) {
          soundService.toggle();
        }
        break;
      case 'fontSize':
        document.documentElement.style.setProperty('--base-font-size',
          value === 'small' ? '14px' : value === 'large' ? '18px' : '16px'
        );
        break;
      case 'language':
        // Language change handled by i18n service
        window.dispatchEvent(new CustomEvent('languageChange', { detail: value }));
        break;
    }
  }

  /**
   * Save preferences to localStorage
   */
  savePreferences() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Reset all preferences to default
   */
  reset() {
    const confirm = window.confirm('Bạn có chắc muốn reset tất cả settings về mặc định?');
    if (confirm) {
      this.preferences = this.getDefaultPreferences();
      this.savePreferences();

      // Apply all default preferences
      Object.keys(this.preferences).forEach(key => {
        this.applyPreference(key, this.preferences[key]);
      });

      return true;
    }
    return false;
  }

  /**
   * Export preferences
   */
  export() {
    const data = {
      preferences: this.preferences,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gem-preferences-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import preferences
   */
  async import(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.preferences) {
        this.preferences = { ...this.getDefaultPreferences(), ...data.preferences };
        this.savePreferences();

        // Apply all imported preferences
        Object.keys(this.preferences).forEach(key => {
          this.applyPreference(key, this.preferences[key]);
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  /**
   * Add custom template
   */
  addTemplate(name, content) {
    const template = {
      id: Date.now(),
      name,
      content,
      createdAt: new Date().toISOString()
    };

    this.preferences.customTemplates.push(template);
    this.savePreferences();
    return template;
  }

  /**
   * Remove custom template
   */
  removeTemplate(id) {
    this.preferences.customTemplates = this.preferences.customTemplates.filter(
      t => t.id !== id
    );
    this.savePreferences();
  }

  /**
   * Get all custom templates
   */
  getTemplates() {
    return this.preferences.customTemplates || [];
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
