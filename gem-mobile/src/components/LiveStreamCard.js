/**
 * Gemral - Live Stream Card Component
 * Feature #22: Display live stream preview
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Radio, Eye, Clock } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import { liveService } from '../services/liveService';

const LiveStreamCard = ({
  stream,
  onPress,
  variant = 'default', // 'default' | 'compact' | 'featured'
}) => {
  const getAvatarUrl = (userData) => {
    if (userData?.avatar_url) return userData.avatar_url;
    const name = userData?.full_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6A5BFF&color=fff`;
  };

  const getThumbnailUrl = () => {
    return stream.thumbnail_url || 'https://via.placeholder.com/400x225/1a1a2e/6A5BFF?text=LIVE';
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.compactThumbnail}>
          <Image
            source={{ uri: getThumbnailUrl() }}
            style={styles.compactThumbnailImage}
          />
          <LiveBadge size="small" />
        </View>

        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {stream.title}
          </Text>
          <View style={styles.compactMeta}>
            <Image
              source={{ uri: getAvatarUrl(stream.user) }}
              style={styles.compactAvatar}
            />
            <Text style={styles.compactUsername} numberOfLines={1}>
              {stream.user?.full_name}
            </Text>
          </View>
          <View style={styles.compactStats}>
            <Eye size={12} color={COLORS.textMuted} />
            <Text style={styles.compactStatText}>
              {liveService.formatViewerCount(stream.viewers_count)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: getThumbnailUrl() }}
          style={styles.featuredThumbnail}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredBadges}>
            <LiveBadge />
            <View style={styles.viewerBadge}>
              <Eye size={14} color={COLORS.textPrimary} />
              <Text style={styles.viewerText}>
                {liveService.formatViewerCount(stream.viewers_count)}
              </Text>
            </View>
          </View>

          <View style={styles.featuredInfo}>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {stream.title}
            </Text>
            <View style={styles.featuredUser}>
              <Image
                source={{ uri: getAvatarUrl(stream.user) }}
                style={styles.featuredAvatar}
              />
              <Text style={styles.featuredUsername}>
                {stream.user?.full_name}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: getThumbnailUrl() }}
          style={styles.thumbnail}
        />
        <View style={styles.thumbnailOverlay}>
          <LiveBadge />
          <View style={styles.viewerBadge}>
            <Eye size={14} color={COLORS.textPrimary} />
            <Text style={styles.viewerText}>
              {liveService.formatViewerCount(stream.viewers_count)}
            </Text>
          </View>
        </View>
        <View style={styles.durationBadge}>
          <Clock size={12} color={COLORS.textPrimary} />
          <Text style={styles.durationText}>
            {liveService.getStreamDuration(stream.started_at)}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Image
          source={{ uri: getAvatarUrl(stream.user) }}
          style={styles.avatar}
        />
        <View style={styles.textInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {stream.title}
          </Text>
          <Text style={styles.username}>{stream.user?.full_name}</Text>
          {stream.topic && (
            <View style={styles.topicBadge}>
              <Text style={styles.topicText}>{stream.topic}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Live Badge Component
 */
export const LiveBadge = ({ size = 'medium' }) => {
  const isSmall = size === 'small';

  return (
    <View style={[badgeStyles.container, isSmall && badgeStyles.containerSmall]}>
      <Radio
        size={isSmall ? 10 : 12}
        color={COLORS.textPrimary}
        style={badgeStyles.icon}
      />
      <Text style={[badgeStyles.text, isSmall && badgeStyles.textSmall]}>
        LIVE
      </Text>
    </View>
  );
};

/**
 * Live Streams Section Header
 */
export const LiveStreamsSectionHeader = ({
  title = 'Dang phat truc tiep',
  count = 0,
  onSeeAll,
}) => {
  return (
    <View style={sectionStyles.header}>
      <View style={sectionStyles.titleRow}>
        <Radio size={18} color={COLORS.error} />
        <Text style={sectionStyles.title}>{title}</Text>
        {count > 0 && (
          <View style={sectionStyles.countBadge}>
            <Text style={sectionStyles.countText}>{count}</Text>
          </View>
        )}
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={sectionStyles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Default Card
  card: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  thumbnailContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.glassBg,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
  },
  viewerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
  },
  info: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
  },
  textInfo: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  username: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  topicBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.xs,
  },
  topicText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
  },

  // Compact Card
  compactCard: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  compactThumbnail: {
    width: 120,
    height: 80,
    position: 'relative',
  },
  compactThumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.glassBg,
  },
  compactInfo: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  compactAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.glassBg,
  },
  compactUsername: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    flex: 1,
  },
  compactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactStatText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Featured Card
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  featuredThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.glassBg,
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  featuredBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  featuredInfo: {
    gap: SPACING.sm,
  },
  featuredTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  featuredUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featuredAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.glassBg,
  },
  featuredUsername: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
});

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.error,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  containerSmall: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  icon: {
    // Pulsing animation would go here
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  textSmall: {
    fontSize: 10,
  },
});

const sectionStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.cyan,
  },
});

export default LiveStreamCard;
