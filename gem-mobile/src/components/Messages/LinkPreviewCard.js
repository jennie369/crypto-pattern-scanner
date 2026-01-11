/**
 * LinkPreviewCard Component
 * Enhanced link preview with rich OG metadata display
 *
 * Features:
 * - Large image preview
 * - Platform detection (YouTube, Twitter, etc.)
 * - Compact and full modes
 * - Loading skeleton
 * - Error fallback
 * - Tap to open in browser
 */

import React, { memo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Services
import linkPreviewService from '../../services/linkPreviewService';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  GLASS,
} from '../../utils/tokens';

/**
 * LinkPreviewCard - Enhanced link preview card
 *
 * @param {string} url - URL to preview
 * @param {object} previewData - Pre-fetched preview data (optional)
 * @param {boolean} compact - Use compact layout
 * @param {function} onPress - Custom press handler
 */
const LinkPreviewCard = memo(({
  url,
  previewData = null,
  compact = false,
  onPress,
}) => {
  const [preview, setPreview] = useState(previewData);
  const [loading, setLoading] = useState(!previewData);
  const [error, setError] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch preview if not provided
  useEffect(() => {
    if (previewData) {
      setPreview(previewData);
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await linkPreviewService.fetchPreview(url);
        setPreview(data);
      } catch (err) {
        console.error('[LinkPreviewCard] Fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchPreview();
    }
  }, [url, previewData]);

  // Handle press
  const handlePress = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (onPress) {
        onPress(url, preview);
        return;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.error('[LinkPreviewCard] Open error:', err);
    }
  }, [url, preview, onPress]);

  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Get platform icon
  const getPlatformDisplay = () => {
    if (!preview?.platform) return null;

    const icon = preview.platformIcon;
    if (!icon) return null;

    return (
      <View style={[styles.platformBadge, { backgroundColor: icon.color }]}>
        <Ionicons name={icon.name} size={12} color="#fff" />
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.skeleton}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonDomain} />
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonDesc} />
          </View>
        </View>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.purple} />
        </View>
      </View>
    );
  }

  // Error state
  if (error || !preview) {
    return (
      <TouchableOpacity
        style={[styles.errorContainer]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons name="globe-outline" size={16} color={COLORS.cyan} />
        <Text style={styles.errorUrl} numberOfLines={1}>
          {url}
        </Text>
        <Ionicons name="open-outline" size={14} color={COLORS.cyan} />
      </TouchableOpacity>
    );
  }

  // Compact layout
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.containerCompact}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Thumbnail */}
        {preview.image && !imageError ? (
          <Image
            source={{ uri: preview.image }}
            style={styles.imageCompact}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={styles.imagePlaceholderCompact}>
            <Ionicons name="link-outline" size={20} color={COLORS.textMuted} />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentCompact}>
          <View style={styles.domainRowCompact}>
            {preview.favicon && (
              <Image
                source={{ uri: preview.favicon }}
                style={styles.favicon}
              />
            )}
            <Text style={styles.domainCompact}>{preview.domain}</Text>
            {getPlatformDisplay()}
          </View>
          {preview.title && (
            <Text style={styles.titleCompact} numberOfLines={2}>
              {preview.title}
            </Text>
          )}
        </View>

        {/* Open icon */}
        <View style={styles.openIconContainer}>
          <Ionicons name="open-outline" size={14} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>
    );
  }

  // Full layout
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image */}
      {preview.image && !imageError ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: preview.image }}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
          />
          {getPlatformDisplay()}

          {/* Play icon for video content */}
          {preview.type === 'video' && (
            <View style={styles.playIcon}>
              <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="link-outline" size={32} color={COLORS.textMuted} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Domain row */}
        <View style={styles.domainRow}>
          {preview.favicon && !imageError && (
            <Image
              source={{ uri: preview.favicon }}
              style={styles.favicon}
            />
          )}
          <Text style={styles.domain}>{preview.siteName || preview.domain}</Text>
          <Ionicons name="open-outline" size={12} color={COLORS.textMuted} />
        </View>

        {/* Title */}
        {preview.title && (
          <Text style={styles.title} numberOfLines={2}>
            {preview.title}
          </Text>
        )}

        {/* Description */}
        {preview.description && (
          <Text style={styles.description} numberOfLines={2}>
            {preview.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

LinkPreviewCard.displayName = 'LinkPreviewCard';

export default LinkPreviewCard;

const styles = StyleSheet.create({
  // Container
  container: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    marginVertical: SPACING.xs,
  },
  containerCompact: {
    backgroundColor: GLASS.background,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },

  // Image
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.glassBg,
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCompact: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.glassBg,
  },
  imagePlaceholderCompact: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Platform badge
  platformBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Play icon
  playIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  // Content
  content: {
    padding: SPACING.md,
  },
  contentCompact: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },

  // Domain
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: 6,
  },
  domainRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  domain: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  domainCompact: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },

  // Favicon
  favicon: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },

  // Title
  title: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  titleCompact: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },

  // Description
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Open icon (compact)
  openIconContainer: {
    paddingHorizontal: SPACING.sm,
  },

  // Error state
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  errorUrl: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.cyan,
  },

  // Skeleton loading
  skeleton: {
    flexDirection: 'row',
    opacity: 0.5,
  },
  skeletonImage: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.glassBg,
  },
  skeletonContent: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  skeletonDomain: {
    width: 60,
    height: 10,
    backgroundColor: COLORS.glassBg,
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonTitle: {
    width: '80%',
    height: 14,
    backgroundColor: COLORS.glassBg,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonDesc: {
    width: '60%',
    height: 10,
    backgroundColor: COLORS.glassBg,
    borderRadius: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
