/**
 * Gemral - Quoted Post Component
 * Feature #10: Repost to Feed
 * Displays the original post within a repost
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image as ImageIcon, Play, Music } from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';

const QuotedPost = ({
  post,
  onPress,
  showFullContent = false,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
      padding: SPACING.md,
      marginTop: SPACING.sm,
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: SPACING.sm,
    },
    avatarPlaceholder: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.purple,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    avatarText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    authorName: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: colors.textSecondary,
    },
    content: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textPrimary,
      lineHeight: 18,
    },
    mediaPreview: {
      marginTop: SPACING.sm,
      borderRadius: 8,
      overflow: 'hidden',
      aspectRatio: 16 / 9,
      maxHeight: 120,
      position: 'relative',
    },
    previewImage: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.glassBg,
    },
    mediaCount: {
      position: 'absolute',
      bottom: SPACING.xs,
      right: SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: 10,
      gap: 4,
    },
    mediaCountText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    soundIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.sm,
      gap: SPACING.xs,
    },
    soundText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.purple,
    },
    deletedContainer: {
      padding: SPACING.md,
      alignItems: 'center',
    },
    deletedText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!post) return null;

  const author = post.author;
  const hasImages = post.images && post.images.length > 0;
  const hasSound = !!post.sound_id;

  // Truncate content unless showing full
  const displayContent = showFullContent
    ? post.content
    : post.content?.substring(0, 150);
  const isTruncated = !showFullContent && post.content?.length > 150;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Author Row */}
      <View style={styles.authorRow}>
        {author?.avatar_url ? (
          <Image
            source={{ uri: author.avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {author?.full_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <Text style={styles.authorName} numberOfLines={1}>
          {author?.full_name || 'Anonymous'}
        </Text>
      </View>

      {/* Content */}
      {post.content && (
        <Text style={styles.content} numberOfLines={showFullContent ? undefined : 3}>
          {displayContent}
          {isTruncated && '...'}
        </Text>
      )}

      {/* Media Preview */}
      {hasImages && (
        <View style={styles.mediaPreview}>
          <Image
            source={{ uri: post.images[0] }}
            style={styles.previewImage}
          />
          {post.images.length > 1 && (
            <View style={styles.mediaCount}>
              <ImageIcon size={12} color={colors.textPrimary} />
              <Text style={styles.mediaCountText}>{post.images.length}</Text>
            </View>
          )}
        </View>
      )}

      {/* Sound Indicator */}
      {hasSound && (
        <View style={styles.soundIndicator}>
          <Music size={14} color={colors.purple} />
          <Text style={styles.soundText}>Bai dang co am thanh</Text>
        </View>
      )}

      {/* Deleted Indicator */}
      {post.is_deleted && (
        <View style={styles.deletedContainer}>
          <Text style={styles.deletedText}>Bai viet da bi xoa</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default QuotedPost;
