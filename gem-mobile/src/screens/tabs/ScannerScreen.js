/**
 * GEM Platform - Scanner Screen (Giao Dich)
 * Dark glass theme - Main feature screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

export default function ScannerScreen() {
  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* ✅ Header with dark blue background like Thong Bao */}
        <View style={styles.header}>
          <Text style={styles.title}>Giao Dich</Text>
          <Text style={styles.subtitle}>Pattern Scanner</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Glass Card Placeholder */}
          <View style={styles.glassCard}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>Scanner Screen</Text>
            <Text style={styles.cardDesc}>
              Pattern scanning with Liquid Glass UI coming in Week 3+
            </Text>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresGrid}>
            {['DPD', 'UPU', 'HPD', 'LPU'].map((pattern) => (
              <View key={pattern} style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔮</Text>
                <Text style={styles.featureName}>{pattern}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  // ✅ Header style matching Thong Bao - dark blue background
  header: {
    backgroundColor: GLASS.background,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.lg,
  },
  glassCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: GLASS.padding,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
  },
  cardIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  cardDesc: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  featureItem: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  featureName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});
