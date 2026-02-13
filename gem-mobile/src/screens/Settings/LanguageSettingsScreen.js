/**
 * LanguageSettingsScreen - Language selection screen
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check } from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';
import { LANGUAGE_OPTIONS } from '../../i18n';

export default function LanguageSettingsScreen({ navigation }) {
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

  const handleSelectLanguage = async (langCode) => {
    if (langCode === settings.language) return;

    triggerHaptic('success');
    await updateSetting('language', langCode);
  };

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
    content: {
      paddingHorizontal: SPACING.md,
    },
    optionCard: {
      backgroundColor: settings.theme === 'light' ? '#FFFFFF' : colors.glassBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? '#CCCCCC' : colors.inputBorder,
      overflow: 'hidden',
      ...(settings.theme === 'light' && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }),
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'light'
        ? 'rgba(0,0,0,0.05)'
        : 'rgba(255,255,255,0.05)',
    },
    optionLast: {
      borderBottomWidth: 0,
    },
    optionSelected: {
      backgroundColor: settings.theme === 'light'
        ? 'rgba(156, 6, 18, 0.05)'
        : 'rgba(106, 91, 255, 0.1)',
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: getFontSize(16),
      fontWeight: '500',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    optionNative: {
      fontSize: getFontSize(14),
      color: colors.textSecondary,
    },
    checkIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.burgundy || colors.primary || '#9C0612',
      justifyContent: 'center',
      alignItems: 'center',
    },
    description: {
      fontSize: getFontSize(13),
      color: colors.textMuted,
      marginTop: SPACING.lg,
      paddingHorizontal: SPACING.sm,
      lineHeight: 20,
    },
  });

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
            <Text style={styles.headerTitle}>{t('settings.language.title')}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.optionCard}>
              {LANGUAGE_OPTIONS.map((lang, index) => {
                const isSelected = settings.language === lang.value;
                const isLast = index === LANGUAGE_OPTIONS.length - 1;

                return (
                  <TouchableOpacity
                    key={lang.value}
                    style={[
                      styles.option,
                      isLast && styles.optionLast,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => handleSelectLanguage(lang.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{lang.nativeLabel}</Text>
                      {lang.label !== lang.nativeLabel && (
                        <Text style={styles.optionNative}>{lang.label}</Text>
                      )}
                    </View>

                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Check size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.description}>
              {t('settings.language.description')}
            </Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
