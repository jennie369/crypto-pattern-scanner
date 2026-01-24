/**
 * SpreadCard Component
 * Card preview in spread selection grid with thumbnail images
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Lock,
  Clock,
  Layers,
  Sparkles,
  Heart,
  Briefcase,
  TrendingUp,
  Crown,
  Info,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { getTierColor, getTierDisplayName } from '../../data/tarotSpreads';

const CATEGORY_ICONS = {
  general: Sparkles,
  love: Heart,
  career: Briefcase,
  trading: TrendingUp,
  advanced: Crown,
};

// Thumbnail image mapping - must use require() for static imports
const SPREAD_THUMBNAILS = {
  'spread-single-card': require('../../../assets/images/tarot-spreads/spread-single-card.webp'),
  'spread-past-present-future': require('../../../assets/images/tarot-spreads/spread-past-present-future.webp'),
  'spread-mind-body-spirit': require('../../../assets/images/tarot-spreads/spread-mind-body-spirit.webp'),
  'spread-decision-making': require('../../../assets/images/tarot-spreads/spread-decision-making.webp'),
  'spread-celtic-cross': require('../../../assets/images/tarot-spreads/spread-celtic-cross.webp'),
  'spread-love-relationship': require('../../../assets/images/tarot-spreads/spread-love-relationship.webp'),
  'spread-broken-heart': require('../../../assets/images/tarot-spreads/spread-broken-heart.webp'),
  'spread-career-path': require('../../../assets/images/tarot-spreads/spread-career-path.webp'),
  'spread-should-i-buy': require('../../../assets/images/tarot-spreads/spread-should-i-buy.webp'),
  'spread-market-outlook': require('../../../assets/images/tarot-spreads/spread-market-outlook.webp'),
  'spread-portfolio-balance': require('../../../assets/images/tarot-spreads/spread-portfolio-balance.webp'),
  'spread-trading-strategy': require('../../../assets/images/tarot-spreads/spread-trading-strategy.webp'),
};

// Get thumbnail by key or spread_id
const getThumbnail = (spread) => {
  // Try thumbnail_key first
  if (spread?.thumbnail_key && SPREAD_THUMBNAILS[spread.thumbnail_key]) {
    return SPREAD_THUMBNAILS[spread.thumbnail_key];
  }
  // Fallback: try spread_id with 'spread-' prefix
  const key = `spread-${spread?.spread_id}`;
  if (SPREAD_THUMBNAILS[key]) {
    return SPREAD_THUMBNAILS[key];
  }
  return null;
};

const SpreadCard = ({
  spread,
  isLocked = false,
  onPress,
  onInfoPress,
  style,
}) => {
  const CategoryIcon = CATEGORY_ICONS[spread?.category] || Sparkles;
  const tierColor = getTierColor(spread?.tier_required);
  const tierName = getTierDisplayName(spread?.tier_required);
  const thumbnail = getThumbnail(spread);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(spread);
    }
  };

  const handleInfoPress = (e) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onInfoPress) {
      onInfoPress(spread);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Background - Image or Gradient */}
        {thumbnail ? (
          <ImageBackground
            source={thumbnail}
            style={styles.thumbnailBackground}
            imageStyle={styles.thumbnailImage}
            resizeMode="cover"
          >
            {/* Dark overlay for text readability */}
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              style={styles.thumbnailOverlay}
            />
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[COLORS.glassBg, COLORS.bgDarkest]}
            style={styles.background}
          />
        )}

        {/* Border gradient effect */}
        <View style={styles.borderGradient} />

        {/* Lock overlay */}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Lock size={24} color={COLORS.textMuted} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.categoryBadge, { backgroundColor: `${tierColor}20` }]}>
              <CategoryIcon size={14} color={tierColor} />
            </View>

            {/* Tier badge - moved to header right */}
            {spread?.tier_required && spread.tier_required !== 'FREE' && (
              <View style={[styles.tierBadge, { backgroundColor: `${tierColor}30`, borderColor: tierColor }]}>
                <Text style={[styles.tierText, { color: tierColor }]}>
                  {tierName}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.infoButton}
              onPress={handleInfoPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Info size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Spacer to push content to bottom */}
          <View style={styles.spacer} />

          {/* Name */}
          <Text style={styles.name} numberOfLines={2}>
            {spread?.name_vi || spread?.name_en || 'Unnamed Spread'}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Card count */}
            <View style={styles.metaItem}>
              <Layers size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{spread?.cards || 0} lá</Text>
            </View>

            {/* Estimated time */}
            {spread?.estimated_time && (
              <View style={styles.metaItem}>
                <Clock size={12} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{spread.estimated_time}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: SPACING.xs,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 180,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbnailBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbnailImage: {
    borderRadius: 16,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  borderGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.purple,
    opacity: 0.5,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  categoryBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  infoButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  spacer: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  freeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  freeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.success,
  },
});

export default SpreadCard;
