/**
 * AboutScreen - App information and legal links
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Shield,
  Mail,
  ExternalLink,
} from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';
import { settingsService } from '../../services/settingsService';

export default function AboutScreen({ navigation }) {
  const {
    settings,
    colors,
    gradients,
    SPACING,
    getFontSize,
    t,
    triggerHaptic,
  } = useSettings();

  const appVersion = settingsService.getAppVersion();

  const handleOpenLink = (url) => {
    triggerHaptic('light');
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
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
      flex: 1,
      paddingHorizontal: SPACING.md,
    },
    logoSection: {
      alignItems: 'center',
      paddingVertical: SPACING.xxl,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: settings.theme === 'light'
        ? 'rgba(156, 6, 18, 0.1)'
        : 'rgba(106, 91, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    logoText: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.burgundy || colors.gold,
    },
    appName: {
      fontSize: getFontSize(24),
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
    },
    versionText: {
      fontSize: getFontSize(14),
      color: colors.textMuted,
    },
    linksCard: {
      backgroundColor: settings.theme === 'light' ? '#FFFFFF' : colors.glassBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? '#CCCCCC' : colors.inputBorder,
      overflow: 'hidden',
      marginTop: SPACING.lg,
      ...(settings.theme === 'light' && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }),
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'light'
        ? 'rgba(0,0,0,0.05)'
        : 'rgba(255,255,255,0.05)',
    },
    linkItemLast: {
      borderBottomWidth: 0,
    },
    linkIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    linkContent: {
      flex: 1,
    },
    linkTitle: {
      fontSize: getFontSize(15),
      fontWeight: '500',
      color: colors.textPrimary,
    },
    linkSubtitle: {
      fontSize: getFontSize(12),
      color: colors.textMuted,
      marginTop: 2,
    },
    copyright: {
      alignItems: 'center',
      paddingVertical: SPACING.xxl,
    },
    copyrightText: {
      fontSize: getFontSize(12),
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
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

  const links = [
    {
      icon: FileText,
      iconBg: settings.theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)',
      iconColor: '#3B82F6',
      title: t('settings.about.terms'),
      subtitle: 'gemral.com/terms',
      onPress: () => handleOpenLink('https://gemral.com/terms'),
    },
    {
      icon: Shield,
      iconBg: settings.theme === 'light' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
      iconColor: '#10B981',
      title: t('settings.about.privacy'),
      subtitle: 'gemral.com/privacy',
      onPress: () => handleOpenLink('https://gemral.com/privacy'),
    },
    {
      icon: Mail,
      iconBg: settings.theme === 'light' ? 'rgba(156, 6, 18, 0.1)' : 'rgba(156, 6, 18, 0.2)',
      iconColor: colors.burgundy || '#9C0612',
      title: t('settings.about.contact'),
      subtitle: 'support@gemral.com',
      onPress: () => handleOpenLink('mailto:support@gemral.com'),
    },
  ];

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
            <Text style={styles.headerTitle}>{t('settings.about.title')}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>G</Text>
              </View>
              <Text style={styles.appName}>Gemral</Text>
              <Text style={styles.versionText}>
                {t('settings.about.version')} {appVersion.version}
                {appVersion.build && ` (${t('settings.about.build')} ${appVersion.build})`}
              </Text>
            </View>

            {/* Links */}
            <View style={styles.linksCard}>
              {links.map((link, index) => {
                const Icon = link.icon;
                const isLast = index === links.length - 1;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.linkItem, isLast && styles.linkItemLast]}
                    onPress={link.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.linkIconContainer, { backgroundColor: link.iconBg }]}>
                      <Icon size={18} color={link.iconColor} />
                    </View>
                    <View style={styles.linkContent}>
                      <Text style={styles.linkTitle}>{link.title}</Text>
                      <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
                    </View>
                    <ExternalLink size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Copyright */}
            <View style={styles.copyright}>
              <Text style={styles.copyrightText}>
                {t('settings.about.copyright')}
              </Text>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
