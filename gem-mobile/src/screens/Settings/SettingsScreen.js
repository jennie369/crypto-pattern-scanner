/**
 * SettingsScreen - Main settings screen
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Globe,
  DollarSign,
  Palette,
  Type,
  Volume2,
  Vibrate,
  Trash2,
  Info,
} from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';
import { SettingsSection, SettingsItem, SettingsToggle } from '../../components/Settings';
import { settingsService } from '../../services/settingsService';
import { getLanguageLabel } from '../../i18n';

export default function SettingsScreen({ navigation }) {
  const {
    settings,
    updateSetting,
    colors,
    gradients,
    SPACING,
    getFontSize,
    t,
    triggerHaptic,
  } = useSettings();

  const [cacheSize, setCacheSize] = useState('Đang tính...');

  // Load cache size on mount
  React.useEffect(() => {
    loadCacheSize();
  }, []);

  const loadCacheSize = async () => {
    const size = await settingsService.getCacheSize();
    setCacheSize(size);
  };

  // Get display values
  const getLanguageDisplay = () => getLanguageLabel(settings.language);

  const getCurrencyDisplay = () => {
    return settings.currency === 'USD' ? 'USD ($)' : 'VND (₫)';
  };

  const getThemeDisplay = () => {
    return settings.theme === 'light'
      ? t('settings.theme.options.light')
      : t('settings.theme.options.dark');
  };

  const getFontSizeDisplay = () => {
    const labels = {
      small: t('settings.fontSize.options.small'),
      medium: t('settings.fontSize.options.medium'),
      large: t('settings.fontSize.options.large'),
    };
    return labels[settings.fontSize] || labels.medium;
  };

  // Handle clear cache
  const handleClearCache = useCallback(() => {
    Alert.alert(
      t('settings.cache.title'),
      t('settings.cache.confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('success');
            await settingsService.clearCache();
            await loadCacheSize();
            Alert.alert(t('common.success'), t('settings.cache.success'));
          },
        },
      ]
    );
  }, [t, triggerHaptic]);

  // Get app version
  const appVersion = settingsService.getAppVersion();

  // Determine status bar style
  const statusBarStyle = settings.theme === 'light' ? 'dark-content' : 'light-content';
  const backgroundColor = settings.theme === 'light' ? '#FFFFFF' : colors.bgDarkest;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    gradientBg: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.lg,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: settings.theme === 'light'
        ? 'rgba(0,0,0,0.05)'
        : 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: getFontSize(20),
      fontWeight: '700',
      color: colors.textPrimary,
      marginLeft: SPACING.md,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.huge,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
    },
    version: {
      fontSize: getFontSize(12),
      color: colors.textMuted,
    },
  });

  // Background based on theme
  const renderBackground = (children) => {
    if (settings.theme === 'light') {
      return <View style={styles.container}>{children}</View>;
    }

    return (
      <LinearGradient
        colors={gradients.background}
        locations={gradients.backgroundLocations}
        style={styles.gradientBg}
      >
        {children}
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />

      {renderBackground(
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Language & Region Section */}
            <SettingsSection title={t('settings.sections.languageRegion')}>
              <SettingsItem
                icon={Globe}
                iconColor={colors.purple || '#6A5BFF'}
                title={t('settings.language.title')}
                value={getLanguageDisplay()}
                onPress={() => navigation.navigate('LanguageSettings')}
              />
              <SettingsItem
                icon={DollarSign}
                iconColor={colors.gold}
                title={t('settings.currency.title')}
                value={getCurrencyDisplay()}
                onPress={() => navigation.navigate('CurrencySettings')}
              />
            </SettingsSection>

            {/* Appearance Section */}
            <SettingsSection title={t('settings.sections.appearance')}>
              <SettingsItem
                icon={Palette}
                iconColor={colors.purple || '#6A5BFF'}
                title={t('settings.theme.title')}
                value={getThemeDisplay()}
                onPress={() => navigation.navigate('ThemeSettings')}
              />
              <SettingsItem
                icon={Type}
                iconColor={colors.cyan || '#00F0FF'}
                title={t('settings.fontSize.title')}
                value={getFontSizeDisplay()}
                onPress={() => navigation.navigate('FontSizeSettings')}
              />
            </SettingsSection>

            {/* Feedback Section */}
            <SettingsSection title={t('settings.sections.feedback')}>
              <SettingsToggle
                icon={Volume2}
                iconColor={colors.success || '#3AF7A6'}
                title={t('settings.sound.title')}
                subtitle={t('settings.sound.description')}
                value={settings.soundEnabled}
                onValueChange={(val) => updateSetting('soundEnabled', val)}
              />
              <SettingsToggle
                icon={Vibrate}
                iconColor={colors.warning || '#FFB800'}
                title={t('settings.haptic.title')}
                subtitle={t('settings.haptic.description')}
                value={settings.hapticEnabled}
                onValueChange={(val) => updateSetting('hapticEnabled', val)}
              />
            </SettingsSection>

            {/* System Section */}
            <SettingsSection title={t('settings.sections.system')}>
              <SettingsItem
                icon={Trash2}
                iconColor={colors.error || '#FF6B6B'}
                title={t('settings.cache.title')}
                subtitle={cacheSize}
                onPress={handleClearCache}
              />
              <SettingsItem
                icon={Info}
                iconColor={colors.info || '#3B82F6'}
                title={t('settings.about.title')}
                onPress={() => navigation.navigate('AboutSettings')}
              />
            </SettingsSection>

            {/* Footer - Version */}
            <View style={styles.footer}>
              <Text style={styles.version}>
                {t('settings.about.version')} {appVersion.version}
                {appVersion.build && ` (Build ${appVersion.build})`}
              </Text>
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}
