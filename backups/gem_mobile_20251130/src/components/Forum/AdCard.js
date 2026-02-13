/**
 * AdCard Component
 * Displays native ads in the feed (tier upgrades, affiliate products, courses)
 * Blends with PostCard design but clearly marked as sponsored
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
import { LinearGradient } from 'expo-linear-gradient';
import { Star, ExternalLink, ChevronRight, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { trackAdClick } from '../../services/engagementService';
import { useAuth } from '../../contexts/AuthContext';

export default function AdCard({ ad, sessionId, onPress }) {
  const { user } = useAuth();

  // Handle ad click
  const handlePress = useCallback(async () => {
    if (!ad || !user) return;

    // Track the click
    await trackAdClick(user.id, ad.type, sessionId);

    // Handle navigation based on ad type
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

  // Get ad styling based on type
  const getAdStyle = () => {
    switch (ad.type) {
      case 'tier_upgrade_1':
      case 'tier_upgrade_2':
        return {
          gradient: ['rgba(106, 91, 255, 0.15)', 'rgba(255, 189, 89, 0.1)'],
          borderColor: 'rgba(106, 91, 255, 0.3)',
          icon: Sparkles,
          iconColor: COLORS.gold,
          badge: 'Nâng cấp',
          badgeColor: COLORS.purple,
        };
      case 'affiliate_product':
        return {
          gradient: ['rgba(0, 240, 255, 0.1)', 'rgba(58, 247, 166, 0.1)'],
          borderColor: 'rgba(0, 240, 255, 0.3)',
          icon: ExternalLink,
          iconColor: COLORS.cyan,
          badge: 'Đề xuất',
          badgeColor: COLORS.cyan,
        };
      case 'course_promo':
        return {
          gradient: ['rgba(255, 189, 89, 0.15)', 'rgba(255, 107, 107, 0.1)'],
          borderColor: 'rgba(255, 189, 89, 0.3)',
          icon: Star,
          iconColor: COLORS.gold,
          badge: 'Khóa học',
          badgeColor: COLORS.gold,
        };
      default:
        return {
          gradient: [GLASS.background, GLASS.background],
          borderColor: 'rgba(106, 91, 255, 0.2)',
          icon: Star,
          iconColor: COLORS.textMuted,
          badge: 'Tài trợ',
          badgeColor: COLORS.textMuted,
        };
    }
  };

  const adStyle = getAdStyle();
  const IconComponent = adStyle.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.container}
    >
      <LinearGradient
        colors={adStyle.gradient}
        style={[styles.card, { borderColor: adStyle.borderColor }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Sponsored Badge */}
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: `${adStyle.badgeColor}20` }]}>
            <Text style={[styles.badgeText, { color: adStyle.badgeColor }]}>
              {adStyle.badge}
            </Text>
          </View>
          <Text style={styles.sponsoredText}>Được tài trợ</Text>
        </View>

        {/* Ad Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${adStyle.iconColor}15` }]}>
            <IconComponent size={28} color={adStyle.iconColor} />
          </View>

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

        {/* Ad Image (if available) */}
        {ad.image && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: ad.image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: adStyle.badgeColor }]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{ad.cta}</Text>
          <ChevronRight size={16} color={COLORS.background} />
        </TouchableOpacity>

        {/* Decorative Elements */}
        <View style={styles.decorativeLine} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sponsoredText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 24,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    gap: 6,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
  },
  decorativeLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
