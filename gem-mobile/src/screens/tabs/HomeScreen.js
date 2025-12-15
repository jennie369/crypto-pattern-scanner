/**
 * GEM Mobile - Home Screen (News Feed)
 * Dark theme by default (matches other pages)
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
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBannerCard from '../../components/SponsorBannerCard';
import useScrollToTop from '../../hooks/useScrollToTop';

export default function HomeScreen({ navigation }) {
  const { user, profile } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  // Sponsor banners - use hook to fetch ALL banners for distribution
  const { banners: sponsorBanners, dismissBanner, userId, refresh: refreshBanners } = useSponsorBanners('home', refreshing);

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

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>News Feed</Text>
            <Text style={styles.subtitle}>Community discussions</Text>
          </View>

          {/* Sponsor Banners - distributed */}
          {sponsorBanners.map((banner) => (
            <SponsorBannerCard
              key={banner.id}
              banner={banner}
              navigation={navigation}
              userId={userId}
              onDismiss={dismissBanner}
            />
          ))}

          {/* Placeholder Content */}
          <View style={styles.placeholder}>
            <Home size={64} color={COLORS.textMuted} strokeWidth={1.5} />
            <Text style={styles.placeholderText}>Home Screen</Text>
            <Text style={styles.placeholderDesc}>Forum & Community features coming soon</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
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

  // Placeholder
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
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  placeholderDesc: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
