/**
 * GEM Mobile - Home Screen (News Feed)
 * Theme-aware (supports Light/Dark mode)
 * Now with Sponsor Banner support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBanner from '../../components/SponsorBanner';
import { UpgradeBanner } from '../../components/upgrade';
import useScrollToTop from '../../hooks/useScrollToTop';
import useTradingLeadsBenefit from '../../hooks/useTradingLeadsBenefit';
import { ProScannerBenefitModal } from '../../components/Scanner';

export default function HomeScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { colors, gradients, glass, SPACING, TYPOGRAPHY, settings, t } = useSettings();

  const [refreshing, setRefreshing] = useState(false);

  // Get tab bar context for ensuring visibility
  let forceShowTabBar = null;
  try {
    const tabBarContext = useTabBar();
    forceShowTabBar = tabBarContext.forceShowTabBar;
  } catch (e) {
    // TabBar context not available
  }

  // Ensure tab bar is visible when Home screen is focused
  // This acts as a recovery mechanism for stuck tab bar states
  useFocusEffect(
    React.useCallback(() => {
      if (forceShowTabBar) {
        forceShowTabBar();
      }
    }, [forceShowTabBar])
  );

  // Trading Leads Pro Scanner benefit check
  const {
    benefitInfo,
    showBenefitModal,
    closeBenefitModal,
    onBenefitActivated,
    userEmail,
    userId: tradingLeadsUserId,
  } = useTradingLeadsBenefit();

  // Sponsor banners - use hook to fetch ALL banners for distribution
  const { banners: sponsorBanners, dismissBanner, userId: sponsorUserId, refresh: refreshBanners } = useSponsorBanners('home', refreshing);

  // Double-tap to scroll to top and refresh
  const { scrollViewRef } = useScrollToTop('Home', async () => {
    setRefreshing(true);
    await refreshBanners();
    setRefreshing(false);
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBanners();
    setRefreshing(false);
  };

  // Theme-aware styles - defined inside component to react to theme changes
  const styles = StyleSheet.create({
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
    scrollViewContent: {
      paddingBottom: CONTENT_BOTTOM_PADDING,
    },
    header: {
      padding: SPACING.lg,
      backgroundColor: settings.theme === 'light' ? colors.glassBg : glass.backgroundColor,
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
      marginTop: SPACING.lg,
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
  });

  // Render different background based on theme
  const renderContent = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('home.title', 'News Feed')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle', 'Community discussions')}</Text>
        </View>

        {/* Upgrade Banner for free users */}
        <UpgradeBanner
          banner={{
            title: t('upgrade.unlockAll', 'Nâng cấp để mở khóa tất cả'),
            subtitle: t('upgrade.accessFeatures', 'Truy cập Scanner, Courses và AI Chatbot'),
            cta_text: t('upgrade.viewPlans', 'Xem các gói'),
            icon_name: 'sparkles',
            trigger_screen: 'home_screen',
          }}
          tierType="scanner"
          variant="prominent"
          style={{ marginHorizontal: SPACING.md, marginTop: SPACING.md }}
        />

        {/* Sponsor Banners - distributed */}
        {sponsorBanners.map((banner) => (
          <SponsorBanner
            key={banner.id}
            banner={banner}
            navigation={navigation}
            userId={sponsorUserId}
            onDismiss={dismissBanner}
          />
        ))}

        {/* Placeholder Content */}
        <View style={styles.placeholder}>
          <Home size={64} color={colors.textMuted} strokeWidth={1.5} />
          <Text style={styles.placeholderText}>{t('home.placeholder', 'Home Screen')}</Text>
          <Text style={styles.placeholderDesc}>{t('home.comingSoon', 'Forum & Community features coming soon')}</Text>
        </View>
      </ScrollView>

      {/* Pro Scanner Benefit Modal - Trading Leads */}
      <ProScannerBenefitModal
        visible={showBenefitModal}
        onClose={closeBenefitModal}
        onActivated={onBenefitActivated}
        benefitInfo={benefitInfo}
        userEmail={userEmail}
        userId={tradingLeadsUserId}
      />
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
