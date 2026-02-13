/**
 * GEM Mobile - Ad Link Preview Component
 * Facebook-style link preview section with domain, title, description, and CTA
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Globe } from 'lucide-react-native';
import { COLORS, SPACING } from '../utils/tokens';

/**
 * Extract domain from URL
 */
const extractDomain = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

/**
 * AdLinkPreview - Link preview section
 * @param {object} ad - Ad/Banner data object
 * @param {function} onPress - Callback when CTA is pressed
 */
export default function AdLinkPreview({ ad, onPress }) {
  // Use new fields if available, fallback to existing fields
  const domain = ad?.link_domain || extractDomain(ad?.action_value);
  const title = ad?.link_title || ad?.title;
  const description = ad?.link_description || ad?.subtitle;
  const ctaLabel = ad?.action_label || 'Tìm hiểu thêm';

  // Don't render if no actionable content
  if (!domain && !title && !ad?.action_value) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {/* Domain */}
        {domain && (
          <View style={styles.domainRow}>
            <Globe size={12} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.domainText}>{domain}</Text>
          </View>
        )}

        {/* Title */}
        {title && (
          <Text style={styles.titleText} numberOfLines={2}>
            {title}
          </Text>
        )}

        {/* Description */}
        {description && (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  domainText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
});
