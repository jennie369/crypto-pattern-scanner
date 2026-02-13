/**
 * CommentLinkPreview Component
 * Displays link preview for URLs found in comment content
 * Compact style, integrated into comment cards
 */

import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLinkPreview } from '../../../hooks/useLinkPreview';
import { detectPrimaryUrl } from '../../../utils/urlDetector';
import LinkPreviewCard from './LinkPreviewCard';
import LinkPreviewSkeleton from './LinkPreviewSkeleton';
import { SPACING } from '../../../utils/tokens';

/**
 * CommentLinkPreview - Auto-detect and show link preview in comments
 *
 * @param {Object} props
 * @param {string} props.content - Comment text content
 * @param {boolean} props.compact - Use compact style (default: true)
 */
const CommentLinkPreview = ({ content, compact = true }) => {
  // Extract URL from content
  const url = useMemo(() => {
    if (!content) return null;
    return detectPrimaryUrl(content);
  }, [content]);

  // Fetch preview for detected URL
  const { preview, loading, error } = useLinkPreview(url, {
    enabled: !!url,
    autoFetch: true,
  });

  // Don't render if no URL or error
  if (!url) return null;

  // Show skeleton while loading
  if (loading && !preview) {
    return (
      <View style={styles.container}>
        <LinkPreviewSkeleton compact />
      </View>
    );
  }

  // Don't show anything if error
  if (error && !preview) return null;

  // Show preview card
  if (preview) {
    return (
      <View style={styles.container}>
        <LinkPreviewCard
          preview={preview}
          compact={compact}
          showRemoveButton={false}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
  },
});

export default memo(CommentLinkPreview);
