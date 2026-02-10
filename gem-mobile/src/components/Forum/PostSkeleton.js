/**
 * Gemral - Post Skeleton Loading Component
 * Hiển thị placeholder với shimmer animation khi đang load posts
 *
 * @version 1.0.0
 * @author GEM Team
 */

import React, { memo, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../../contexts/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPONENT_NAME = '[PostSkeleton]';

// ============================================================
// SHIMMER EFFECT COMPONENT
// ============================================================

/**
 * ShimmerEffect - Animated shimmer overlay
 */
const ShimmerEffect = memo(({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const shimmerStyles = useMemo(() => StyleSheet.create({
    shimmerContainer: {
      overflow: 'hidden',
      borderRadius: 8,
    },
    shimmer: {
      width: '100%',
      height: '100%',
    },
  }), []);

  return (
    <View style={[shimmerStyles.shimmerContainer, style]}>
      <Animated.View
        style={[
          shimmerStyles.shimmer,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.08)',
            'rgba(255,255,255,0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});

ShimmerEffect.displayName = 'ShimmerEffect';

// ============================================================
// SKELETON ITEM COMPONENT
// ============================================================

/**
 * SkeletonItem - Single skeleton placeholder element
 */
const SkeletonItem = memo(({ width = '100%', height = 16, style, borderRadius = 8 }) => {
  const skeletonStyles = useMemo(() => StyleSheet.create({
    skeletonItem: {
      backgroundColor: 'rgba(255,255,255,0.06)',
      overflow: 'hidden',
    },
  }), []);

  return (
    <View style={[skeletonStyles.skeletonItem, { width, height, borderRadius }, style]}>
      <ShimmerEffect style={{ width: '100%', height: '100%' }} />
    </View>
  );
});

SkeletonItem.displayName = 'SkeletonItem';

// ============================================================
// POST SKELETON COMPONENT
// ============================================================

/**
 * PostSkeleton - Skeleton loading cho 1 post
 * Mimics the PostCard layout for seamless loading experience
 */
const PostSkeleton = memo(() => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Memoized styles
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.55)'),
      borderRadius: 16,
      padding: SPACING.md,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.15)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    avatar: {
      // borderRadius set via prop
    },
    headerText: {
      flex: 1,
      marginLeft: SPACING.sm,
    },
    timeText: {
      marginTop: SPACING.xs,
    },
    moreButton: {
      // borderRadius set via prop
    },
    content: {
      marginBottom: SPACING.md,
    },
    textLine: {
      marginTop: SPACING.xs,
    },
    imagePlaceholder: {
      marginBottom: SPACING.md,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.05)',
    },
    actionButton: {
      // borderRadius set via prop
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.container}>
      {/* Header: Avatar + Name + Time */}
      <View style={styles.header}>
        <SkeletonItem width={44} height={44} style={styles.avatar} borderRadius={22} />
        <View style={styles.headerText}>
          <SkeletonItem width="55%" height={14} />
          <SkeletonItem width="30%" height={10} style={styles.timeText} />
        </View>
        <SkeletonItem width={24} height={24} style={styles.moreButton} borderRadius={12} />
      </View>

      {/* Content: Text lines */}
      <View style={styles.content}>
        <SkeletonItem width="95%" height={14} />
        <SkeletonItem width="85%" height={14} style={styles.textLine} />
        <SkeletonItem width="70%" height={14} style={styles.textLine} />
      </View>

      {/* Image placeholder */}
      <SkeletonItem
        width="100%"
        height={200}
        style={styles.imagePlaceholder}
        borderRadius={12}
      />

      {/* Actions: Like, Comment, Share */}
      <View style={styles.actions}>
        <SkeletonItem width={65} height={28} style={styles.actionButton} borderRadius={14} />
        <SkeletonItem width={65} height={28} style={styles.actionButton} borderRadius={14} />
        <SkeletonItem width={65} height={28} style={styles.actionButton} borderRadius={14} />
      </View>
    </View>
  );
});

PostSkeleton.displayName = 'PostSkeleton';

// ============================================================
// POST SKELETON LIST COMPONENT
// ============================================================

/**
 * PostSkeletonList - Danh sách nhiều skeletons
 * @param {number} count - Số lượng skeletons hiển thị
 */
const PostSkeletonList = memo(({ count = 3 }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Memoized styles
  const styles = useMemo(() => StyleSheet.create({
    listContainer: {
      paddingTop: SPACING.md,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={`skeleton-${index}`} />
      ))}
    </View>
  );
});

PostSkeletonList.displayName = 'PostSkeletonList';

// ============================================================
// COMPACT SKELETON (for inline loading)
// ============================================================

/**
 * CompactSkeleton - Smaller skeleton for inline use
 */
const CompactSkeleton = memo(() => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Memoized styles
  const styles = useMemo(() => StyleSheet.create({
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.sm,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.55)'),
      borderRadius: 12,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
    },
    compactContent: {
      flex: 1,
      marginLeft: SPACING.sm,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.compactContainer}>
      <SkeletonItem width={36} height={36} borderRadius={18} />
      <View style={styles.compactContent}>
        <SkeletonItem width="60%" height={12} />
        <SkeletonItem width="40%" height={10} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
});

CompactSkeleton.displayName = 'CompactSkeleton';

// ============================================================
// EXPORTS
// ============================================================

export { PostSkeleton, PostSkeletonList, CompactSkeleton, SkeletonItem, ShimmerEffect };
export default PostSkeleton;
