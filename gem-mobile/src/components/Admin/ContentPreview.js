/**
 * Gemral - Content Preview Component
 * Preview nội dung giống forum post
 * @description Hiển thị preview bài viết trước khi đăng
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Home,
  Facebook,
  Youtube,
  Instagram,
  Film,
  FileText,
  Clock,
  Hash,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS, SHADOWS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Platform icons
const PLATFORM_ICONS = {
  gemral: Home,
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Film,
  threads: FileText,
};

// Platform colors
const PLATFORM_COLORS = {
  gemral: COLORS.gold,
  facebook: '#1877F2',
  youtube: '#FF0000',
  instagram: '#E4405F',
  tiktok: '#000000',
  threads: '#000000',
};

// Platform labels
const PLATFORM_LABELS = {
  gemral: 'Gemral Feed',
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  threads: 'Threads',
};

// ========== COMPONENT ==========
const ContentPreview = ({
  title = '',
  content = '',
  platform = 'gemral',
  contentType = 'post',
  pillar = null,
  hashtags = [],
  mediaUrls = [],
  videoUrl = null,
  scheduledDate = null,
  scheduledTime = null,
  author = {
    name: 'GEM Official',
    avatar: 'https://i.pravatar.cc/100?u=gem-official',
    isVerified: true,
  },
  style,
}) => {
  const PlatformIcon = PLATFORM_ICONS[platform] || Home;
  const platformColor = PLATFORM_COLORS[platform] || COLORS.gold;
  const platformLabel = PLATFORM_LABELS[platform] || platform;

  // Format date/time
  const formattedDate = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  const formattedTime = scheduledTime
    ? scheduledTime.substring(0, 5) // HH:MM
    : null;

  // HTML preview for content
  const contentHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #1F2937;
          padding: 0;
          background: transparent;
        }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
        h2 { font-size: 18px; font-weight: 600; margin: 0 0 6px; }
        p { margin: 0 0 12px; }
        a { color: #3B82F6; text-decoration: none; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
        ul, ol { margin: 8px 0; padding-left: 20px; }
        li { margin: 4px 0; }
        strong { font-weight: 600; }
      </style>
    </head>
    <body>${content || ''}</body>
    </html>
  `;

  // Calculate content height (basic estimate)
  const contentLines = (content?.length || 0) / 50;
  const estimatedHeight = Math.min(Math.max(contentLines * 22, 60), 200);

  return (
    <View style={[styles.container, style]}>
      {/* Platform Badge */}
      <View style={styles.platformBadge}>
        <PlatformIcon size={14} color={platformColor} />
        <Text style={[styles.platformText, { color: platformColor }]}>
          {platformLabel}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: author.avatar }}
          style={styles.avatar}
        />
        <View style={styles.authorInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{author.name}</Text>
            {author.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          {(formattedDate || formattedTime) && (
            <View style={styles.scheduleRow}>
              <Clock size={12} color={COLORS.lightTextSecondary} />
              <Text style={styles.scheduleText}>
                {formattedDate}{formattedTime ? ` lúc ${formattedTime}` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Title */}
      {title && (
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      )}

      {/* Content */}
      {content && (
        <View style={[styles.contentContainer, { height: estimatedHeight }]}>
          <WebView
            source={{ html: contentHtml }}
            style={styles.webView}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
          />
        </View>
      )}

      {/* Media */}
      {mediaUrls.length > 0 && (
        <View style={styles.mediaContainer}>
          {mediaUrls.length === 1 ? (
            <Image
              source={{ uri: mediaUrls[0] }}
              style={styles.singleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mediaGrid}>
              {mediaUrls.slice(0, 4).map((url, index) => (
                <View key={index} style={styles.mediaGridItem}>
                  <Image
                    source={{ uri: url }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                  {index === 3 && mediaUrls.length > 4 && (
                    <View style={styles.moreOverlay}>
                      <Text style={styles.moreText}>+{mediaUrls.length - 4}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Video indicator */}
      {videoUrl && (
        <View style={styles.videoContainer}>
          <Film size={24} color={COLORS.lightTextSecondary} />
          <Text style={styles.videoText}>Video sẽ được đính kèm</Text>
        </View>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <View style={styles.hashtagsContainer}>
          {hashtags.slice(0, 5).map((tag, index) => (
            <View key={index} style={styles.hashtag}>
              <Hash size={12} color={COLORS.info} />
              <Text style={styles.hashtagText}>{tag}</Text>
            </View>
          ))}
          {hashtags.length > 5 && (
            <Text style={styles.moreHashtags}>+{hashtags.length - 5}</Text>
          )}
        </View>
      )}

      {/* Pillar badge */}
      {pillar && (
        <View style={styles.pillarBadge}>
          <Text style={styles.pillarText}>{pillar}</Text>
        </View>
      )}

      {/* Mock engagement bar */}
      <View style={styles.engagementBar}>
        <View style={styles.engagementItem}>
          <Heart size={18} color={COLORS.lightTextSecondary} />
          <Text style={styles.engagementText}>0</Text>
        </View>
        <View style={styles.engagementItem}>
          <MessageCircle size={18} color={COLORS.lightTextSecondary} />
          <Text style={styles.engagementText}>0</Text>
        </View>
        <View style={styles.engagementItem}>
          <Share2 size={18} color={COLORS.lightTextSecondary} />
        </View>
        <View style={styles.engagementItem}>
          <Bookmark size={18} color={COLORS.lightTextSecondary} />
        </View>
      </View>

      {/* Preview label */}
      <View style={styles.previewLabel}>
        <Text style={styles.previewLabelText}>XEM TRƯỚC</Text>
      </View>
    </View>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightCard,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    ...SHADOWS.md,
    position: 'relative',
    overflow: 'hidden',
  },
  platformBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: SPACING.sm,
  },
  platformText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingRight: 80, // Space for platform badge
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: SPACING.md,
    backgroundColor: COLORS.lightBorder,
  },
  authorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  authorName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.lightText,
  },
  verifiedBadge: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: 2,
  },
  scheduleText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.lightTextSecondary,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.lightText,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  contentContainer: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mediaContainer: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  singleImage: {
    width: '100%',
    height: 200,
    borderRadius: SPACING.md,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  mediaGridItem: {
    width: '48.5%',
    aspectRatio: 1,
    borderRadius: SPACING.sm,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  videoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: COLORS.lightBg,
    borderRadius: SPACING.md,
    marginBottom: SPACING.md,
  },
  videoText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.lightTextSecondary,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  hashtag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(59,130,246,0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: SPACING.sm,
  },
  hashtagText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.info,
  },
  moreHashtags: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.lightTextSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  pillarBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: SPACING.xs,
    marginBottom: SPACING.md,
  },
  pillarText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
    textTransform: 'uppercase',
  },
  engagementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightBorder,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  engagementText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.lightTextSecondary,
  },
  previewLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderBottomRightRadius: SPACING.sm,
  },
  previewLabelText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
  },
});

export default ContentPreview;
