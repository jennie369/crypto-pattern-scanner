/**
 * Gemral - Link Preview Component
 * Displays OG metadata preview for URLs
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { ExternalLink, Globe, AlertCircle } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

/**
 * Extract first URL from text
 */
export const extractUrl = (text) => {
  if (!text) return null;
  const matches = text.match(URL_REGEX);
  return matches ? matches[0] : null;
};

/**
 * Get domain from URL
 */
const getDomain = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

const LinkPreview = ({
  url,
  previewData = null, // Pre-fetched preview data
  onPress,
  compact = false,
  loading = false,
}) => {
  const [preview, setPreview] = useState(previewData);
  const [isLoading, setIsLoading] = useState(loading);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (previewData) {
      setPreview(previewData);
      setIsLoading(false);
    }
  }, [previewData]);

  const handlePress = async () => {
    if (onPress) {
      onPress(url);
    } else {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (err) {
        console.error('[LinkPreview] Error opening URL:', err);
      }
    }
  };

  const domain = getDomain(url);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.purple} />
          <Text style={styles.loadingText}>Dang tai lien ket...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <TouchableOpacity
        style={[styles.container, compact && styles.containerCompact]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color={COLORS.textMuted} />
          <Text style={styles.errorText} numberOfLines={1}>{domain}</Text>
          <ExternalLink size={14} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>
    );
  }

  // No preview data - show simple link
  if (!preview) {
    return (
      <TouchableOpacity
        style={[styles.simpleLink]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Globe size={14} color={COLORS.cyan} />
        <Text style={styles.simpleLinkText} numberOfLines={1}>{url}</Text>
        <ExternalLink size={14} color={COLORS.cyan} />
      </TouchableOpacity>
    );
  }

  // Compact preview (small card)
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.containerCompact}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {preview.image && (
          <Image
            source={{ uri: preview.image }}
            style={styles.imageCompact}
            resizeMode="cover"
          />
        )}
        <View style={styles.contentCompact}>
          <Text style={styles.domainCompact}>{domain}</Text>
          {preview.title && (
            <Text style={styles.titleCompact} numberOfLines={2}>
              {preview.title}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Full preview card
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Preview Image */}
      {preview.image && (
        <Image
          source={{ uri: preview.image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Domain */}
        <View style={styles.domainRow}>
          <Globe size={12} color={COLORS.textMuted} />
          <Text style={styles.domain}>{domain}</Text>
          <ExternalLink size={12} color={COLORS.textMuted} />
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
};

/**
 * Service to fetch link preview data
 * Note: This requires a backend API or proxy due to CORS
 */
export const linkPreviewService = {
  /**
   * Fetch preview data for a URL
   * In production, this should call your backend API
   */
  async fetchPreview(url) {
    try {
      // For now, return basic info
      // In production, use a service like microlink.io or your own API
      const domain = getDomain(url);

      return {
        url,
        domain,
        title: null,
        description: null,
        image: null,
      };
    } catch (error) {
      console.error('[LinkPreview] Fetch error:', error);
      return null;
    }
  },

  /**
   * Check if text contains a URL
   */
  containsUrl(text) {
    return URL_REGEX.test(text);
  },

  /**
   * Extract all URLs from text
   */
  extractUrls(text) {
    if (!text) return [];
    return text.match(URL_REGEX) || [];
  },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    marginVertical: SPACING.sm,
  },
  containerCompact: {
    backgroundColor: GLASS.background,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    flexDirection: 'row',
    marginVertical: SPACING.xs,
  },
  // Image
  image: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.glassBg,
  },
  imageCompact: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.glassBg,
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
    marginBottom: 2,
  },
  // Title
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  titleCompact: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  // Description
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  // Simple link
  simpleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  simpleLinkText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.cyan,
  },
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
});

export default LinkPreview;
