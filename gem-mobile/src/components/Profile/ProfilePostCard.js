/**
 * Gemral - Profile Post Card
 * Displays post in profile with 1:1 aspect ratio image
 * Instagram/TikTok style post card for profile grid
 *
 * Uses DESIGN_TOKENS v3.0
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Clock, ImageIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatDistanceToNow } from '../../utils/dateFormatter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = SPACING.lg;
const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2;

/**
 * ProfilePostCard - Post card with 1:1 image ratio
 *
 * @param {Object} props
 * @param {Object} props.post - Post object
 * @param {Function} props.onPress - Override default navigation
 * @param {Object} props.style - Custom container style
 */
const ProfilePostCard = ({
  post,
  onPress,
  style,
}) => {
  const navigation = useNavigation();

  if (!post) return null;

  const {
    id,
    title,
    content,
    image_url,
    likes_count = 0,
    comments_count = 0,
    created_at,
  } = post;

  // Extract excerpt from content
  const excerpt = content
    ? content.replace(/<[^>]*>/g, '').substring(0, 100) + (content.length > 100 ? '...' : '')
    : '';

  // Format date
  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at))
    : '';

  const handlePress = () => {
    if (onPress) {
      onPress(post);
    } else {
      navigation.navigate('PostDetail', { postId: id });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Image Container - 1:1 Aspect Ratio */}
      <View style={styles.imageContainer}>
        {image_url ? (
          <Image
            source={{ uri: image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['rgba(106, 91, 255, 0.3)', 'rgba(0, 240, 255, 0.2)']}
            style={styles.imagePlaceholder}
          >
            <ImageIcon size={32} color={COLORS.textMuted} />
          </LinearGradient>
        )}

        {/* Overlay gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
          style={styles.imageOverlay}
        />

        {/* Stats overlay on image */}
        <View style={styles.imageStats}>
          <View style={styles.statItem}>
            <Heart size={14} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            <Text style={styles.statText}>{likes_count}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={14} color={COLORS.textPrimary} />
            <Text style={styles.statText}>{comments_count}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title || 'Bài viết'}
        </Text>

        {/* Excerpt */}
        {excerpt ? (
          <Text style={styles.excerpt} numberOfLines={2}>
            {excerpt}
          </Text>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerStats}>
            <Heart size={12} color={COLORS.error} fill={COLORS.error} />
            <Text style={styles.footerStatText}>{likes_count} lượt thích</Text>
            <Text style={styles.footerDot}>•</Text>
            <MessageCircle size={12} color={COLORS.textMuted} />
            <Text style={styles.footerStatText}>{comments_count}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Clock size={10} color={COLORS.textMuted} />
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * ProfilePostCardCompact - Compact version for lists
 */
export const ProfilePostCardCompact = ({
  post,
  onPress,
  style,
}) => {
  const navigation = useNavigation();

  if (!post) return null;

  const handlePress = () => {
    if (onPress) {
      onPress(post);
    } else {
      navigation.navigate('PostDetail', { postId: post.id });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.compactContainer, style]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Thumbnail - 1:1 */}
      <View style={styles.compactImageContainer}>
        {post.image_url ? (
          <Image
            source={{ uri: post.image_url }}
            style={styles.compactImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['rgba(106, 91, 255, 0.3)', 'rgba(0, 240, 255, 0.2)']}
            style={styles.compactImagePlaceholder}
          >
            <ImageIcon size={20} color={COLORS.textMuted} />
          </LinearGradient>
        )}
      </View>

      {/* Info */}
      <View style={styles.compactContent}>
        <Text style={styles.compactTitle} numberOfLines={2}>
          {post.title || 'Bài viết'}
        </Text>
        <View style={styles.compactStats}>
          <Heart size={12} color={COLORS.error} fill={COLORS.error} />
          <Text style={styles.compactStatText}>{post.likes_count || 0}</Text>
          <MessageCircle size={12} color={COLORS.textMuted} />
          <Text style={styles.compactStatText}>{post.comments_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Main Card
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: SPACING.md,
  },

  // Image - 1:1 Aspect Ratio
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: COLORS.bgMid,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  imageStats: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Content
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  excerpt: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  footerStatText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  footerDot: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.xxs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Compact Card
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: SPACING.sm,
  },
  compactImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.bgMid,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  compactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  compactStatText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.sm,
  },
});

export default ProfilePostCard;
