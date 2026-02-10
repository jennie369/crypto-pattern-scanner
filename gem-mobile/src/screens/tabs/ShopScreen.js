/**
 * Gemral - Shop Screen
 * Dark theme by default (matches other pages)
 * Theme-aware with i18n support
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

export default function ShopScreen() {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // i18n labels
  const titleLabel = t('shop.title', 'Shop');
  const subtitleLabel = t('shop.subtitle', 'Crystals & Subscriptions');
  const placeholderTitle = t('shop.placeholder.title', 'Shop Screen');
  const placeholderDesc = t('shop.placeholder.description', 'Crystal shop & tier upgrades coming in Week 3+');

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    gradient: {
      flex: 1,
    },
    lightContainer: {
      flex: 1,
      backgroundColor: colors.bgDarkest,
    },
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: SPACING.lg,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'light' ? colors.border : 'rgba(106, 91, 255, 0.2)',
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textSecondary,
    },
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.huge,
      marginTop: SPACING.huge,
    },
    placeholderText: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    placeholderDesc: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textMuted,
      textAlign: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const renderContent = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{titleLabel}</Text>
          <Text style={styles.subtitle}>{subtitleLabel}</Text>
        </View>

        <View style={styles.placeholder}>
          <ShoppingBag size={64} color={colors.textMuted} strokeWidth={1.5} />
          <Text style={styles.placeholderText}>{placeholderTitle}</Text>
          <Text style={styles.placeholderDesc}>{placeholderDesc}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // Light theme uses solid background, Dark theme uses gradient
  if (settings.theme === 'light') {
    return (
      <View style={styles.lightContainer}>
        {renderContent()}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradients.background}
      locations={gradients.backgroundLocations}
      style={styles.gradient}
    >
      {renderContent()}
    </LinearGradient>
  );
}
