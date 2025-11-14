import { useState, useEffect } from 'react';
import { TRANSLATIONS, getTranslation } from '../utils/translations';

/**
 * useTranslation Hook
 * Provides translation function and current language
 * Automatically syncs with localStorage and settings updates
 */
export function useTranslation() {
  const [language, setLanguage] = useState('en');

  // Load language from settings on mount
  useEffect(() => {
    console.log('🌐 useTranslation: Loading language from localStorage...');

    const loadLanguage = () => {
      try {
        const settings = localStorage.getItem('userSettings');
        if (settings) {
          const parsed = JSON.parse(settings);
          if (parsed.language) {
            console.log('✅ Language found in settings:', parsed.language);
            setLanguage(parsed.language);
          } else {
            console.log('⚠️ No language in settings, using default: en');
          }
        } else {
          console.log('⚠️ No settings found, using default language: en');
        }
      } catch (error) {
        console.error('❌ Failed to parse settings:', error);
      }
    };

    loadLanguage();
  }, []);

  // Listen for language changes from Settings page
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      if (event.detail?.language) {
        console.log('🌐 Language updated via event:', event.detail.language);
        setLanguage(event.detail.language);
      }
    };

    console.log('👂 useTranslation: Listening for settingsUpdated events...');
    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      console.log('🧹 useTranslation: Removing settingsUpdated listener');
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  /**
   * Translation function
   * @param {string} key - Translation key
   * @returns {string} Translated text
   */
  const t = (key) => {
    const translation = getTranslation(key, language);
    // console.log(`🔤 t('${key}') -> '${translation}' [${language}]`);
    return translation;
  };

  return { t, language };
}

export default useTranslation;
