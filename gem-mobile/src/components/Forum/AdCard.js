/**
 * AdCard Component
 * Displays native ads in the feed (tier upgrades, affiliate products, courses)
 * Seamless design that blends with regular posts - Threads-style
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { trackAdClick } from '../../services/engagementService';
import { sponsorBannerService } from '../../services/sponsorBannerService';
import deepLinkHandler from '../../services/deepLinkHandler';
import { useAuth } from '../../contexts/AuthContext';

export default function AdCard({ ad, sessionId, onPress }) {
  const { user } = useAuth();

  // Handle ad click
  const handlePress = useCallback(async () => {
    if (!ad || !user) return;

    // Track the click
    await trackAdClick(user.id, ad.type, sessionId);

    // For sponsor banners from database, also record click in sponsor_banners table
    if (ad.type === 'sponsor_banner' && ad.id) {
      sponsorBannerService.recordClick(ad.id);
    }

    // Handle sponsor banner navigation with action_type
    if (ad.type === 'sponsor_banner' && ad.action_type) {
      if (ad.action_type === 'url' && ad.link) {
        Linking.openURL(ad.link);
        return;
      } else if (ad.action_type === 'screen' && ad.link) {
        onPress && onPress(ad);
        return;
      } else if (ad.action_type === 'deeplink' && ad.link) {
        try {
          let deepLink;
          if (ad.link.startsWith('{')) {
            deepLink = JSON.parse(ad.link);
          } else if (ad.link.startsWith('gem://')) {
            const url = ad.link.replace('gem://', '');
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
            deepLink = { screen: ad.link };
          }
          deepLinkHandler.processDeepLink(deepLink);
        } catch (error) {
          console.error('[AdCard] Deep link parse error:', error);
        }
        return;
      }
    }

    // Handle regular ad navigation
    if (ad.link) {
      if (ad.link.startsWith('http')) {
        // External link
        Linking.openURL(ad.link);
      } else if (onPress) {
        // Internal navigation
        onPress(ad);
      }
    }
  }, [ad, user, sessionId, onPress]);

  if (!ad) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Sponsored Label - subtle */}
        <Text style={styles.sponsoredLabel}>Tài trợ</Text>

        {/* Content Row */}
        <View style={styles.content}>
          {/* Image on left (if available) */}
          {ad.image && (
            <Image
              source={{ uri: ad.image }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={2}>
              {ad.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {ad.description}
            </Text>
          </View>
        </View>

        {/* CTA Row */}
        {ad.cta && (
          <View style={styles.ctaRow}>
            <Text style={styles.ctaText}>{ad.cta}</Text>
            <ChevronRight size={14} color={COLORS.textMuted} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
  },
  sponsoredLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
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
  description: {
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
