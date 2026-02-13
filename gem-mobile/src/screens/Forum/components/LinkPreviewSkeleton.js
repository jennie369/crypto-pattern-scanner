/**
 * LinkPreviewSkeleton Component
 * Loading state với shimmer effect
 * Phase 3: UI Component
 */

import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING } from '../../../utils/tokens';
import { IMAGE_DIMENSIONS } from '../../../constants/linkPreview';

const CARD_BORDER_RADIUS = 12;
const IMAGE_ASPECT_RATIO = IMAGE_DIMENSIONS?.CARD_IMAGE_RATIO || 1.91;

/**
 * Animated Shimmer Effect
 */
const ShimmerEffect = memo(({ style, children }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View style={[style, { opacity }]}>
      {children}
    </Animated.View>
  );
});

/**
 * LinkPreviewSkeleton - Loading skeleton cho link preview
 *
 * @param {Object} props
 * @param {boolean} props.compact - Sử dụng compact style
 * @param {boolean} props.showImage - Hiển thị image skeleton
 * @param {Object} props.style - Custom styles
 */
const LinkPreviewSkeleton = ({
  compact = false,
  showImage = true,
  style,
}) => {
  // ========== RENDER COMPACT SKELETON ==========
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <ShimmerEffect style={styles.compactThumbnail} />
        <View style={styles.compactContent}>
          <ShimmerEffect style={styles.domainSkeleton} />
          <ShimmerEffect style={styles.titleSkeleton} />
          <ShimmerEffect style={[styles.titleSkeleton, { width: '60%' }]} />
        </View>
      </View>
    );
  }

  // ========== RENDER FULL SKELETON ==========
  return (
    <View style={[styles.container, style]}>
      {/* Image Skeleton */}
      {showImage && (
        <ShimmerEffect style={styles.imageSkeleton} />
      )}

      {/* Content Skeleton */}
      <View style={styles.contentContainer}>
        {/* Domain */}
        <View style={styles.domainRow}>
          <ShimmerEffect style={styles.faviconSkeleton} />
          <ShimmerEffect style={styles.domainTextSkeleton} />
        </View>

        {/* Title */}
        <ShimmerEffect style={styles.titleSkeleton} />
        <ShimmerEffect style={[styles.titleSkeleton, { width: '70%' }]} />

        {/* Description */}
        <ShimmerEffect style={styles.descriptionSkeleton} />
        <ShimmerEffect style={[styles.descriptionSkeleton, { width: '50%' }]} />
      </View>
    </View>
  );
};

// ========== STYLES ==========

const styles = StyleSheet.create({
  // ===== FULL SKELETON =====
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  imageSkeleton: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT_RATIO,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  contentContainer: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },

  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  faviconSkeleton: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  domainTextSkeleton: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  titleSkeleton: {
    width: '100%',
    height: 16,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 4,
  },

  descriptionSkeleton: {
    width: '100%',
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 2,
  },

  // ===== COMPACT SKELETON =====
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  compactThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  compactContent: {
    flex: 1,
    gap: SPACING.xs,
  },

  domainSkeleton: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

// ========== EXPORTS ==========

export default memo(LinkPreviewSkeleton);
