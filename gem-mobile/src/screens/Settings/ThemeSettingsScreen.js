/**
 * ThemeSettingsScreen - Theme selection with visual preview
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
import { ArrowLeft, Check, Moon, Sun } from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';

const THEME_OPTIONS = [
  {
    value: 'dark',
    icon: Moon,
    previewBg: '#05040B',
    previewCard: 'rgba(15, 16, 48, 0.55)',
    previewText: '#FFFFFF',
  },
  {
    value: 'light',
    icon: Sun,
    previewBg: '#FFFFFF',
    previewCard: '#FFFFFF',
    previewText: '#000000',
    previewBorder: '#CCCCCC',
  },
];

export default function ThemeSettingsScreen({ navigation }) {
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

  const handleSelectTheme = async (themeValue) => {
    if (themeValue === settings.theme) return;

    triggerHaptic('success');
    await updateSetting('theme', themeValue);
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
    optionsRow: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    optionCard: {
      flex: 1,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 2,
    },
    optionCardSelected: {
      borderColor: colors.burgundy || colors.primary || '#9C0612',
    },
    optionCardUnselected: {
      borderColor: settings.theme === 'light' ? '#CCCCCC' : 'rgba(255,255,255,0.2)',
    },
    preview: {
      aspectRatio: 0.75,
      padding: SPACING.sm,
      justifyContent: 'space-between',
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    previewDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    previewCard: {
      borderRadius: 8,
      padding: SPACING.sm,
    },
    previewCardWithBorder: {
      borderWidth: 1,
    },
    previewLine: {
      height: 4,
      borderRadius: 2,
      marginBottom: SPACING.xs,
    },
    previewLineShort: {
      width: '60%',
    },
    previewLineLong: {
      width: '80%',
    },
    optionFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      gap: SPACING.sm,
    },
    optionLabel: {
      fontSize: getFontSize(14),
      fontWeight: '600',
      color: colors.textPrimary,
    },
    checkBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.burgundy || colors.primary || '#9C0612',
      justifyContent: 'center',
      alignItems: 'center',
    },
    description: {
      fontSize: getFontSize(13),
      color: colors.textMuted,
      marginTop: SPACING.xl,
      textAlign: 'center',
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

  const renderThemePreview = (option) => {
    const isSelected = settings.theme === option.value;
    const Icon = option.icon;

    return (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.optionCard,
          isSelected ? styles.optionCardSelected : styles.optionCardUnselected,
        ]}
        onPress={() => handleSelectTheme(option.value)}
        activeOpacity={0.8}
      >
        {/* Preview Area */}
        <View style={[styles.preview, { backgroundColor: option.previewBg }]}>
          {/* Preview Header */}
          <View style={styles.previewHeader}>
            <View style={[styles.previewDot, { backgroundColor: '#FF5F57' }]} />
            <View style={[styles.previewDot, { backgroundColor: '#FFBD2E' }]} />
            <View style={[styles.previewDot, { backgroundColor: '#28CA41' }]} />
          </View>

          {/* Preview Card */}
          <View
            style={[
              styles.previewCard,
              { backgroundColor: option.previewCard },
              option.previewBorder && [
                styles.previewCardWithBorder,
                { borderColor: option.previewBorder },
              ],
            ]}
          >
            <View
              style={[
                styles.previewLine,
                styles.previewLineLong,
                { backgroundColor: option.previewText, opacity: 0.8 },
              ]}
            />
            <View
              style={[
                styles.previewLine,
                styles.previewLineShort,
                { backgroundColor: option.previewText, opacity: 0.4 },
              ]}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.optionFooter, { backgroundColor: option.previewBg }]}>
          <Icon size={16} color={option.previewText} />
          <Text style={[styles.optionLabel, { color: option.previewText }]}>
            {t(`settings.theme.options.${option.value}`)}
          </Text>
          {isSelected && (
            <View style={styles.checkBadge}>
              <Check size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
      </TouchableOpacity>
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
            <Text style={styles.headerTitle}>{t('settings.theme.title')}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.optionsRow}>
              {THEME_OPTIONS.map(renderThemePreview)}
            </View>

            <Text style={styles.description}>
              {t('settings.theme.preview')}
            </Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
