/**
 * Gemral - Scanner Screen (Giao Dich)
 * Dark glass theme - Main feature screen
 * Theme-aware with i18n support
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart2, TrendingUp } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

export default function ScannerScreen() {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // i18n labels
  const titleLabel = t('scanner.title', 'Giao Dịch');
  const subtitleLabel = t('scanner.subtitle', 'Pattern Scanner');
  const placeholderTitle = t('scanner.placeholder.title', 'Scanner Screen');
  const placeholderDesc = t('scanner.placeholder.description', 'Pattern scanning with Liquid Glass UI coming in Week 3+');

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    gradient: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    header: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      padding: SPACING.lg,
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
    scrollView: {
      flex: 1,
      padding: SPACING.lg,
    },
    glassCard: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: glass.borderRadius || 16,
      padding: glass.padding || SPACING.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.xxl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: settings.theme === 'light' ? 0.1 : 0.7,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: settings.theme === 'light' ? 1 : 0,
      borderColor: colors.border,
    },
    cardIcon: {
      fontSize: 64,
      marginBottom: SPACING.lg,
    },
    cardTitle: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    cardDesc: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textMuted,
      textAlign: 'center',
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.md,
    },
    featureItem: {
      width: '47%',
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: SPACING.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? colors.border : 'rgba(255, 255, 255, 0.1)',
    },
    featureIcon: {
      fontSize: 32,
      marginBottom: SPACING.sm,
    },
    featureName: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <LinearGradient
      colors={gradients.background}
      locations={gradients.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with theme-aware background */}
        <View style={styles.header}>
          <Text style={styles.title}>{titleLabel}</Text>
          <Text style={styles.subtitle}>{subtitleLabel}</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Glass Card Placeholder */}
          <View style={styles.glassCard}>
            <BarChart2 size={48} color={colors.gold} strokeWidth={1.5} />
            <Text style={styles.cardTitle}>{placeholderTitle}</Text>
            <Text style={styles.cardDesc}>{placeholderDesc}</Text>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresGrid}>
            {['DPD', 'UPU', 'HPD', 'LPU'].map((pattern) => (
              <View key={pattern} style={styles.featureItem}>
                <TrendingUp size={24} color={colors.purple || colors.burgundy} strokeWidth={2} />
                <Text style={styles.featureName}>{pattern}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
