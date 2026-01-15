/**
 * ReactionSummary Component
 * Shows stacked reaction icons with total count for forum posts
 *
 * Features:
 * - Displays top 3 reaction types as stacked icons
 * - Shows total count next to icons
 * - Tap to open reactions list modal
 * - Animated entrance effect
 * - Handles empty state gracefully
 */

import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import ReactionIcon from './ReactionIcon';
import { REACTION_ORDER, REACTION_CONFIG } from '../../constants/reactions';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import reactionService from '../../services/reactionService';

/**
 * ReactionSummary - Stacked reaction icons with count
 *
 * @param {Object} props
 * @param {Object} props.reactionCounts - Object with counts per reaction type
 * @param {Array} props.topReactions - Pre-calculated top reactions [{type, count}]
 * @param {number} props.totalCount - Total reaction count
 * @param {Function} props.onPress - Callback when summary is pressed
 * @param {boolean} props.disabled - Disable press interaction
 * @param {string} props.size - Size variant: 'small' | 'medium' | 'large'
 */
const ReactionSummary = ({
  reactionCounts = {},
  topReactions: propTopReactions = null,
  totalCount: propTotalCount = 0,
  onPress,
  disabled = false,
  size = 'medium',
}) => {
  // Animation values
  const scale = useSharedValue(1);

  // Size-based dimensions
  const dimensions = {
    small: { icon: 16, font: 11, overlap: 6, padding: 4 },
    medium: { icon: 20, font: 13, overlap: 8, padding: 6 },
    large: { icon: 24, font: 15, overlap: 10, padding: 8 },
  }[size] || { icon: 20, font: 13, overlap: 8, padding: 6 };

  /**
   * Calculate top reactions from counts if not provided
   */
  const topReactions = useMemo(() => {
    if (propTopReactions && propTopReactions.length > 0) {
      return propTopReactions;
    }

    if (!reactionCounts || typeof reactionCounts !== 'object') {
      return [];
    }

    return REACTION_ORDER
      .filter((type) => (reactionCounts[type] || 0) > 0)
      .sort((a, b) => (reactionCounts[b] || 0) - (reactionCounts[a] || 0))
      .slice(0, 3)
      .map((type) => ({
        type,
        count: reactionCounts[type] || 0,
      }));
  }, [propTopReactions, reactionCounts]);

  /**
   * Calculate total count
   */
  const totalCount = useMemo(() => {
    if (propTotalCount > 0) {
      return propTotalCount;
    }
    return reactionCounts?.total || 0;
  }, [propTotalCount, reactionCounts]);

  /**
   * Handle press with animation
   */
  const handlePress = () => {
    if (disabled || !onPress) return;

    // Bounce animation
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1, { damping: 15 })
    );

    onPress();
  };

  /**
   * Animated styles
   */
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Don't render if no reactions
  if (totalCount === 0 || topReactions.length === 0) {
    return null;
  }

  // Format count
  const formattedCount = reactionService.formatCount(totalCount);

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.container,
          { paddingVertical: dimensions.padding, paddingHorizontal: dimensions.padding + 2 },
          disabled && styles.disabled,
        ]}
        disabled={disabled || !onPress}
      >
        {/* Stacked Reaction Icons */}
        <View style={styles.iconsContainer}>
          {topReactions.map((reaction, index) => {
            const config = REACTION_CONFIG[reaction.type];
            if (!config) return null;

            return (
              <View
                key={reaction.type}
                style={[
                  styles.iconWrapper,
                  {
                    // Small container for stacked reaction icons
                    width: dimensions.icon + 4,
                    height: dimensions.icon + 4,
                    marginLeft: index === 0 ? 0 : -dimensions.overlap,
                    zIndex: topReactions.length - index,
                    borderColor: COLORS.bgDark,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <ReactionIcon
                  type={reaction.type}
                  size={dimensions.icon}
                />
              </View>
            );
          })}
        </View>

        {/* Count Text */}
        <Text
          style={[
            styles.countText,
            { fontSize: dimensions.font },
          ]}
        >
          {formattedCount}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    borderRadius: 100,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  countText: {
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
});

export default memo(ReactionSummary);
