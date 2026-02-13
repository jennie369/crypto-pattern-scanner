/**
 * GEM Mobile - Single Sponsor Banner Card Component
 * Renders a single banner - used for distributed banner display
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { X, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING } from '../utils/tokens';
import { sponsorBannerService } from '../services/sponsorBannerService';
import deepLinkHandler from '../services/deepLinkHandler';
import { navigateToScreen } from '../utils/navigationHelper';

/**
 * SponsorBannerCard - Renders a single sponsor banner
 * @param {object} banner - Banner data object
 * @param {object} navigation - React Navigation object
 * @param {string} userId - Current user ID (for dismiss tracking)
 * @param {function} onDismiss - Callback when banner is dismissed
 */
export default function SponsorBannerCard({
  banner,
  navigation,
  userId,
  onDismiss,
}) {
  if (!banner) return null;

  const handleBannerClick = async () => {
    console.log('[SponsorBannerCard] handleBannerClick called!', {
      bannerId: banner.id,
      title: banner.title,
      action_type: banner.action_type,
      action_value: banner.action_value,
    });

    await sponsorBannerService.recordClick(banner.id);

    const actionType = banner.action_type;
    const actionValue = banner.action_value;

    if (!actionValue) {
      console.warn('[SponsorBannerCard] No action_value provided');
      return;
    }

    // Handle 'navigate' type - parse path like '/upgrade/tier1' or '/shop/product/123'
    if (actionType === 'navigate') {
      const route = parseNavigateRoute(actionValue);
      console.log('[SponsorBannerCard] Parsed navigate route:', route);
      if (route.screen) {
        navigateToScreen(navigation, route.screen, route.params);
      }
      return;
    }

    if (actionType === 'screen') {
      console.log('[SponsorBannerCard] Navigating to screen:', actionValue);
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
        console.error('[SponsorBannerCard] Deep link parse error:', error);
        navigateToScreen(navigation, actionValue);
      }
    }
  };

  /**
   * Parse navigate route from URL-like path
   * Examples:
   *   '/upgrade/tier1' -> { screen: 'TierUpgrade', params: { tier: 'tier1' } }
   *   '/shop' -> { screen: 'Shop' }
   *   '/course/123' -> { screen: 'CourseDetail', params: { courseId: '123' } }
   */
  const parseNavigateRoute = (path) => {
    // Remove leading slash
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const segments = cleanPath.split('/').filter(Boolean);

    if (segments.length === 0) {
      return { screen: 'Home' };
    }

    const routeMap = {
      // Tier upgrades
      'upgrade': (params) => ({
        screen: 'TierUpgrade',
        params: { tier: params[0] || 'tier1' },
      }),
      // Shop routes
      'shop': (params) => {
        if (params[0] === 'product' && params[1]) {
          return { screen: 'ProductDetail', params: { productId: params[1] } };
        }
        if (params[0] === 'category' && params[1]) {
          return { screen: 'Shop', params: { category: params[1] } };
        }
        return { screen: 'Shop' };
      },
      // Course routes
      'course': (params) => {
        if (params[0]) {
          return { screen: 'CourseDetail', params: { courseId: params[0] } };
        }
        return { screen: 'Courses' };
      },
      'courses': () => ({ screen: 'Courses' }),
      // Forum routes
      'forum': (params) => {
        if (params[0] === 'post' && params[1]) {
          return { screen: 'PostDetail', params: { postId: params[1] } };
        }
        return { screen: 'Forum' };
      },
      // Account routes
      'account': () => ({ screen: 'Account' }),
      'wallet': () => ({ screen: 'Wallet' }),
      'portfolio': () => ({ screen: 'Portfolio' }),
      'profile': () => ({ screen: 'ProfileSettings' }),
      // Scanner routes
      'scanner': () => ({ screen: 'Scanner' }),
      // GemMaster routes
      'gemmaster': () => ({ screen: 'GemMaster' }),
      'tarot': () => ({ screen: 'Tarot' }),
      'iching': () => ({ screen: 'IChing' }),
      // Home
      'home': () => ({ screen: 'Home' }),
    };

    const baseRoute = segments[0].toLowerCase();
    const routeParams = segments.slice(1);

    if (routeMap[baseRoute]) {
      return routeMap[baseRoute](routeParams);
    }

    // Fallback: use first segment as screen name (capitalize first letter)
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.banner}
        onPress={handleBannerClick}
        activeOpacity={0.7}
      >
        {/* Sponsored Badge - subtle top left */}
        <View style={styles.header}>
          <Text style={styles.sponsoredLabel}>Tài trợ</Text>
          {banner.is_dismissible && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          {/* Image on left (if available) */}
          {banner.image_url && (
            <Image
              source={{ uri: banner.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {/* Text content */}
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={2}>
              {banner.title}
            </Text>
            {banner.subtitle && (
              <Text style={styles.subtitle} numberOfLines={2}>
                {banner.subtitle}
              </Text>
            )}
            {banner.action_label && (
              <View style={styles.ctaRow}>
                <Text style={styles.ctaText}>{banner.action_label}</Text>
                <ChevronRight size={14} color={COLORS.textMuted} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  banner: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sponsoredLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  dismissButton: {
    padding: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
});
