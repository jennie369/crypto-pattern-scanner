/**
 * Gemral - Link Preview Component
 * Shows preview card for URLs in messages
 *
 * Features:
 * - Fetches URL metadata
 * - Shows title, description, image
 * - Tap to open in browser
 * - Loading and error states
 */

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

const LinkPreview = memo(({
  url,
  style,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metadata, setMetadata] = useState(null);

  // Extract domain from URL
  const getDomain = (urlString) => {
    try {
      const domain = new URL(urlString).hostname;
      return domain.replace('www.', '');
    } catch {
      return urlString;
    }
  };

  // Fetch URL metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(false);

        // In production, this would call a backend service to fetch metadata
        // For now, we'll use basic extraction
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 5000);
        let response;
        try {
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; GEM-LinkPreview/1.0)',
            },
            signal: controller.signal,
          });
        } finally {
          clearTimeout(fetchTimeout);
        }

        if (!response.ok) throw new Error('Failed to fetch');

        const html = await response.text();

        // Extract metadata from HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

        setMetadata({
          title: titleMatch?.[1]?.trim() || getDomain(url),
          description: descMatch?.[1]?.trim(),
          image: imageMatch?.[1],
          domain: getDomain(url),
        });
      } catch (err) {
        console.log('Link preview error:', err);
        // Set basic metadata on error
        setMetadata({
          title: getDomain(url),
          domain: getDomain(url),
        });
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchMetadata();
    }
  }, [url]);

  // Handle press
  const handlePress = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loading, style]}>
        <ActivityIndicator size="small" color={COLORS.textMuted} />
        <Text style={styles.loadingText}>Loading preview...</Text>
      </View>
    );
  }

  if (!metadata) return null;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image */}
      {metadata.image && (
        <Image
          source={{ uri: metadata.image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Domain */}
        <View style={styles.domainRow}>
          <Ionicons name="globe-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.domain}>{metadata.domain}</Text>
          <Ionicons name="open-outline" size={12} color={COLORS.textMuted} />
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {metadata.title}
        </Text>

        {/* Description */}
        {metadata.description && (
          <Text style={styles.description} numberOfLines={2}>
            {metadata.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

LinkPreview.displayName = 'LinkPreview';

// Helper function to extract URLs from text
export const extractUrls = (text) => {
  if (!text) return [];
  return text.match(URL_REGEX) || [];
};

export default LinkPreview;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Image
  image: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.glassBg,
  },

  // Content
  content: {
    padding: SPACING.sm,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  domain: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
});
