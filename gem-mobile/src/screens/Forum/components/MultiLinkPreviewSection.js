/**
 * MultiLinkPreviewSection Component
 * Displays multiple link previews for posts with multiple URLs
 * Phase: Multiple Link Previews Support
 */

import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Link2 } from 'lucide-react-native';
import { useTextLinkPreviews } from '../../../hooks/useLinkPreview';
import LinkPreviewCard from './LinkPreviewCard';
import LinkPreviewSkeleton from './LinkPreviewSkeleton';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

/**
 * MultiLinkPreviewSection - Render multiple link previews from post content
 *
 * @param {Object} props
 * @param {string} props.content - Post text content
 * @param {Object} props.existingPreview - Existing link_preview from database (first URL)
 * @param {number} props.maxPreviews - Maximum number of previews to show (default: 3)
 * @param {boolean} props.showHeader - Show "Links" header (default: false)
 */
const MultiLinkPreviewSection = ({
  content,
  existingPreview,
  maxPreviews = 3,
  showHeader = false,
}) => {
  // Fetch previews for all URLs in content
  const {
    urls,
    allPreviews,
    loading,
    hasMultiple,
  } = useTextLinkPreviews(content, {
    enabled: true,
    maxUrls: maxPreviews,
    multipleUrls: true,
  });

  // Combine existing preview (from DB) with fetched previews
  const combinedPreviews = useMemo(() => {
    // If we have an existing preview from DB, use it for the first URL
    if (existingPreview && existingPreview.url) {
      const existingUrl = existingPreview.url;

      // Filter out the existing URL from fetched previews
      const otherPreviews = allPreviews.filter(
        item => item.url !== existingUrl && item.preview
      );

      // Build combined preview with existing first
      const result = [{
        url: existingUrl,
        preview: {
          url: existingPreview.url,
          domain: existingPreview.domain,
          title: existingPreview.title,
          description: existingPreview.description,
          image: existingPreview.image_url || existingPreview.image,
          favicon: existingPreview.favicon_url || existingPreview.favicon,
          siteName: existingPreview.site_name || existingPreview.siteName,
          type: existingPreview.og_type || existingPreview.type || 'website',
          isVideo: existingPreview.is_video || existingPreview.isVideo || false,
          status: 'success',
        },
        loading: false,
      }];

      // Add other previews
      return [...result, ...otherPreviews].slice(0, maxPreviews);
    }

    // No existing preview, use all fetched previews
    return allPreviews.filter(item => item.preview).slice(0, maxPreviews);
  }, [existingPreview, allPreviews, maxPreviews]);

  // Don't render if no URLs or no previews
  if (urls.length === 0 && !existingPreview) {
    return null;
  }

  // Only loading, show skeleton for first URL
  if (loading && combinedPreviews.length === 0 && !existingPreview) {
    return (
      <View style={styles.container}>
        <LinkPreviewSkeleton />
      </View>
    );
  }

  // No valid previews to show
  if (combinedPreviews.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Optional Header */}
      {showHeader && combinedPreviews.length > 1 && (
        <View style={styles.header}>
          <Link2 size={14} color={COLORS.textMuted} />
          <Text style={styles.headerText}>
            {combinedPreviews.length} Links
          </Text>
        </View>
      )}

      {/* Preview Cards */}
      <View style={styles.previewsContainer}>
        {combinedPreviews.map((item, index) => (
          <View key={item.url || index} style={styles.previewWrapper}>
            {item.loading ? (
              <LinkPreviewSkeleton compact={index > 0} />
            ) : item.preview ? (
              <LinkPreviewCard
                preview={item.preview}
                compact={index > 0} // First preview is full, rest are compact
                showRemoveButton={false}
              />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  headerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  previewsContainer: {
    gap: SPACING.sm,
  },

  previewWrapper: {
    // Individual preview spacing handled by gap
  },
});

export default memo(MultiLinkPreviewSection);
