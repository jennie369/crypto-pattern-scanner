/**
 * SponsorBannerFeatured - Premium Hero-style Sponsor Banner
 * A prominent, visually striking banner that stands out in the feed
 * Features gradient overlay, large typography, and premium feel
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';
import { sponsorBannerService } from '../services/sponsorBannerService';
import deepLinkHandler from '../services/deepLinkHandler';
import { navigateToScreen } from '../utils/navigationHelper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * SponsorBannerFeatured - Premium hero-style banner for high-impact ads
 */
export default function SponsorBannerFeatured({
  banner,
  navigation,
  userId,
  onDismiss,
}) {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginHorizontal: SPACING.md,
      marginVertical: SPACING.sm,
    },
    touchable: {
      borderRadius: 16,
      overflow: 'hidden',
    },

    // With Image Background
    imageBackground: {
      width: '100%',
      minHeight: 220,
    },
    backgroundImage: {
      borderRadius: 16,
    },
    gradientOverlay: {
      flex: 1,
      minHeight: 220,
      borderRadius: 16,
      padding: SPACING.md,
      justifyContent: 'space-between',
    },

    // Top Row
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    sponsoredBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    sponsoredText: {
      fontSize: 11,
      fontWeight: '600',
    },
    dismissButton: {
      padding: SPACING.xs,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 20,
    },

    // Content
    contentContainer: {
      paddingTop: SPACING.lg,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: 28,
      marginBottom: SPACING.xs,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    subtitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      lineHeight: 20,
      marginBottom: SPACING.md,
    },

    // CTA Button (with image)
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 25,
      borderWidth: 1.5,
      backgroundColor: 'rgba(0,0,0,0.4)',
      gap: SPACING.xs,
    },
    ctaText: {
      fontSize: 14,
      fontWeight: '600',
    },

    // Without Image Background
    gradientCard: {
      borderRadius: 16,
      padding: SPACING.lg,
      minHeight: 180,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
    },
    accentLine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    topRowNoImage: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    contentContainerNoImage: {
      flex: 1,
      justifyContent: 'center',
    },
    titleNoImage: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: 26,
      marginBottom: SPACING.xs,
    },
    subtitleNoImage: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: SPACING.md,
    },

    // CTA Button Solid (without image)
    ctaButtonSolid: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: 25,
      gap: SPACING.xs,
    },
    ctaTextSolid: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.bgDarkest,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!banner) return null;

  // Handle banner click - same logic as SponsorBannerCard
  const handleBannerClick = async () => {
    await sponsorBannerService.recordClick(banner.id);

    const actionType = banner.action_type;
    const actionValue = banner.action_value;

    if (!actionValue) return;

    if (actionType === 'navigate') {
      const route = parseNavigateRoute(actionValue);
      if (route.screen) {
        navigateToScreen(navigation, route.screen, route.params);
      }
      return;
    }

    if (actionType === 'screen') {
      navigateToScreen(navigation, actionValue);
    } else if (actionType === 'url') {
      Linking.openURL(actionValue);
    } else if (actionType === 'deeplink') {
      try {
        let deepLink;
        if (actionValue.startsWith('{')) {
          deepLink = JSON.parse(actionValue);
        } else if (actionValue.startsWith('gem://')) {
          const url = actionValue.replace('gem://', '');
          const [screen, queryString] = url.split('?');
          const params = {};
          if (queryString) {
            queryString.split('&').forEach(param => {
              const [key, value] = param.split('=');
              params[key] = decodeURIComponent(value);
            });
          }
          deepLink = { screen, params };
        } else {
          deepLink = { screen: actionValue };
        }
        deepLinkHandler.processDeepLink(deepLink);
      } catch (error) {
        navigateToScreen(navigation, actionValue);
      }
    }
  };

  // Parse navigate route
  const parseNavigateRoute = (path) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const segments = cleanPath.split('/').filter(Boolean);

    if (segments.length === 0) return { screen: 'Home' };

    const routeMap = {
      'upgrade': (params) => ({ screen: 'TierUpgrade', params: { tier: params[0] || 'tier1' } }),
      'shop': (params) => {
        if (params[0] === 'product' && params[1]) return { screen: 'ProductDetail', params: { productId: params[1] } };
        if (params[0] === 'category' && params[1]) return { screen: 'Shop', params: { category: params[1] } };
        return { screen: 'Shop' };
      },
      'course': (params) => params[0] ? { screen: 'CourseDetail', params: { courseId: params[0] } } : { screen: 'Courses' },
      'courses': () => ({ screen: 'Courses' }),
      'forum': (params) => params[0] === 'post' && params[1] ? { screen: 'PostDetail', params: { postId: params[1] } } : { screen: 'Forum' },
      'account': () => ({ screen: 'Account' }),
      'wallet': () => ({ screen: 'Wallet' }),
      'scanner': () => ({ screen: 'Scanner' }),
      'gemmaster': () => ({ screen: 'GemMaster' }),
      'home': () => ({ screen: 'Home' }),
    };

    const baseRoute = segments[0].toLowerCase();
    const routeParams = segments.slice(1);

    if (routeMap[baseRoute]) return routeMap[baseRoute](routeParams);

    const screenName = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    return { screen: screenName, params: segments[1] ? { id: segments[1] } : {} };
  };

  const handleDismiss = async () => {
    // Always call onDismiss to remove from UI
    // Only persist to DB if userId exists
    if (userId) {
      await sponsorBannerService.dismissBanner(userId, banner.id);
    }
    // Always trigger parent callback to remove banner from list
    onDismiss?.(banner.id);
  };

  // Get accent color or use default gold
  const accentColor = banner.accent_color || colors.gold;

  // Render with background image
  if (banner.image_url) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleBannerClick}
          style={styles.touchable}
        >
          <ImageBackground
            source={{ uri: banner.image_url }}
            style={styles.imageBackground}
            imageStyle={styles.backgroundImage}
            resizeMode="cover"
          >
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(5,4,11,0.95)']}
              locations={[0, 0.4, 1]}
              style={styles.gradientOverlay}
            >
              {/* Sponsored Badge - Top Left */}
              <View style={styles.topRow}>
                <View style={styles.sponsoredBadge}>
                  <Sparkles size={12} color={accentColor} />
                  <Text style={[styles.sponsoredText, { color: accentColor }]}>Tài trợ</Text>
                </View>

                {/* Dismiss Button - Top Right */}
                {banner.is_dismissible && (
                  <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={handleDismiss}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={18} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Content - Bottom */}
              <View style={styles.contentContainer}>
                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                  {banner.title}
                </Text>

                {/* Subtitle */}
                {banner.subtitle && (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {banner.subtitle}
                  </Text>
                )}

                {/* CTA Button */}
                {banner.action_label && (
                  <View style={[styles.ctaButton, { borderColor: accentColor }]}>
                    <Text style={[styles.ctaText, { color: accentColor }]}>
                      {banner.action_label}
                    </Text>
                    <ArrowRight size={16} color={accentColor} />
                  </View>
                )}
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  }

  // Render without background image (gradient only)
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleBannerClick}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[colors.bgMid, colors.bgDarkest]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {/* Decorative accent line */}
          <View style={[styles.accentLine, { backgroundColor: accentColor }]} />

          {/* Top Row */}
          <View style={styles.topRowNoImage}>
            <View style={styles.sponsoredBadge}>
              <Sparkles size={12} color={accentColor} />
              <Text style={[styles.sponsoredText, { color: accentColor }]}>Tài trợ</Text>
            </View>

            {banner.is_dismissible && (
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View style={styles.contentContainerNoImage}>
            <Text style={styles.titleNoImage} numberOfLines={2}>
              {banner.title}
            </Text>

            {banner.subtitle && (
              <Text style={styles.subtitleNoImage} numberOfLines={3}>
                {banner.subtitle}
              </Text>
            )}

            {banner.action_label && (
              <TouchableOpacity
                style={[styles.ctaButtonSolid, { backgroundColor: accentColor }]}
                onPress={handleBannerClick}
              >
                <Text style={styles.ctaTextSolid}>{banner.action_label}</Text>
                <ChevronRight size={18} color={colors.bgDarkest} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
