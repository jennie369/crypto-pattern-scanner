/**
 * Gemral - Settings Context
 * Unified settings state management for:
 * - Language (vi, en, zh)
 * - Currency (VND, USD)
 * - Theme (dark, light)
 * - Font size (small, medium, large)
 * - Sound & Haptic feedback
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

// i18n
import i18n, { changeLanguage } from '../i18n';

// Theme helpers
import { getColors, getTheme, getGlass, getGradients, SPACING, TYPOGRAPHY } from '../theme';

// Supabase
import { supabase } from '../services/supabase';

// Storage key
const SETTINGS_STORAGE_KEY = '@gemral_settings';

// Default settings
const DEFAULT_SETTINGS = {
  language: 'vi',
  currency: 'VND',
  theme: 'dark',
  fontSize: 'medium',
  soundEnabled: true,
  hapticEnabled: true,
};

// Currency conversion rate (can be fetched from API)
const USD_TO_VND_RATE = 24500;

// Create context
const SettingsContext = createContext(null);

/**
 * Settings Provider Component
 */
export function SettingsProvider({ children }) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Get theme-aware values
  const colors = getColors(settings.theme);
  const theme = getTheme(settings.theme);
  const glass = getGlass(settings.theme);
  const gradients = getGradients(settings.theme);

  // Font size multiplier
  const fontSizeMultiplier = {
    small: 0.9,
    medium: 1,
    large: 1.15,
  }[settings.fontSize] || 1;

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadUser();
  }, []);

  // Load current user
  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Load user preferences from Supabase
        await loadUserPreferences(user.id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsedSettings }));

        // Apply language
        if (parsedSettings.language) {
          await changeLanguage(parsedSettings.language);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user preferences from Supabase
  const loadUserPreferences = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (data && !error) {
        const remoteSettings = {
          language: data.language || DEFAULT_SETTINGS.language,
          currency: data.currency || DEFAULT_SETTINGS.currency,
          theme: data.theme || DEFAULT_SETTINGS.theme,
          fontSize: data.font_size || DEFAULT_SETTINGS.fontSize,
          soundEnabled: data.sound_enabled ?? DEFAULT_SETTINGS.soundEnabled,
          hapticEnabled: data.haptic_enabled ?? DEFAULT_SETTINGS.hapticEnabled,
        };

        setSettings(remoteSettings);
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(remoteSettings));

        // Apply language
        await changeLanguage(remoteSettings.language);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  // Save settings
  const saveSettings = async (newSettings) => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));

      // Save to Supabase if logged in
      if (userId) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            language: newSettings.language,
            currency: newSettings.currency,
            theme: newSettings.theme,
            font_size: newSettings.fontSize,
            sound_enabled: newSettings.soundEnabled,
            haptic_enabled: newSettings.hapticEnabled,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Update a single setting
  const updateSetting = useCallback(async (key, value) => {
    // Haptic feedback if enabled
    if (settings.hapticEnabled && key !== 'hapticEnabled') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);

    // Handle language change
    if (key === 'language') {
      await changeLanguage(value);
    }
  }, [settings, userId]);

  // Reset all settings to default
  const resetSettings = useCallback(async () => {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setSettings(DEFAULT_SETTINGS);
    await saveSettings(DEFAULT_SETTINGS);
    await changeLanguage(DEFAULT_SETTINGS.language);
  }, [settings.hapticEnabled, userId]);

  // Format price based on currency setting
  const formatPrice = useCallback((amount, forceVND = false) => {
    if (!amount && amount !== 0) return '';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (forceVND || settings.currency === 'VND') {
      return `${numAmount.toLocaleString('vi-VN')}₫`;
    }

    // Convert VND to USD
    const usdAmount = numAmount / USD_TO_VND_RATE;
    return `$${usdAmount.toFixed(2)}`;
  }, [settings.currency]);

  // Convert price (for calculations)
  const convertPrice = useCallback((amount, fromCurrency = 'VND') => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (fromCurrency === 'VND' && settings.currency === 'USD') {
      return numAmount / USD_TO_VND_RATE;
    }

    if (fromCurrency === 'USD' && settings.currency === 'VND') {
      return numAmount * USD_TO_VND_RATE;
    }

    return numAmount;
  }, [settings.currency]);

  // Trigger haptic if enabled
  const triggerHaptic = useCallback((style = 'light') => {
    if (!settings.hapticEnabled) return;

    const hapticStyle = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error: Haptics.NotificationFeedbackType.Error,
    }[style];

    if (style === 'success' || style === 'warning' || style === 'error') {
      Haptics.notificationAsync(hapticStyle);
    } else {
      Haptics.impactAsync(hapticStyle);
    }
  }, [settings.hapticEnabled]);

  // Calculate font size with multiplier
  const getFontSize = useCallback((baseSize) => {
    return Math.round(baseSize * fontSizeMultiplier);
  }, [fontSizeMultiplier]);

  // Context value
  const value = {
    // Settings state
    settings,
    isLoading,

    // Update functions
    updateSetting,
    resetSettings,

    // Theme values (reactive to theme changes)
    colors,
    theme,
    glass,
    gradients,
    SPACING,
    TYPOGRAPHY,

    // Currency helpers
    formatPrice,
    convertPrice,
    currencySymbol: settings.currency === 'USD' ? '$' : '₫',

    // Font size helpers
    fontSizeMultiplier,
    getFontSize,

    // Haptic helper
    triggerHaptic,

    // i18n
    t,
    currentLanguage: settings.language,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * useSettings hook
 * Access settings and theme-aware values
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

/**
 * useThemeColors hook
 * Shorthand for accessing theme colors
 */
export function useThemeColors() {
  const { colors } = useSettings();
  return colors;
}

/**
 * useCurrency hook
 * Shorthand for currency formatting
 */
export function useCurrency() {
  const { formatPrice, convertPrice, currencySymbol, settings } = useSettings();
  return {
    formatPrice,
    convertPrice,
    currencySymbol,
    currency: settings.currency,
  };
}

export default SettingsContext;
