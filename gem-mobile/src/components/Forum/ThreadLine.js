/**
 * ThreadLine Component
 * Visual connector for comment threads
 * Phase 3: Comment Threading (30/12/2024)
 */

import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SPACING } from '../../utils/tokens';

const LINE_WIDTH = 2;
const LINE_COLOR = 'rgba(255, 255, 255, 0.1)';

/**
 * ThreadLine - Visual connector between parent and replies
 *
 * @param {Object} props
 * @param {number} props.depth - Thread depth (1 or 2)
 * @param {boolean} props.isLast - Is this the last reply
 * @param {boolean} props.animated - Animate line drawing
 */
const ThreadLine = ({
  depth = 1,
  isLast = false,
  animated = false,
}) => {
  // Calculate left position based on depth
  // Depth 1: Under root avatar (20px from left)
  // Depth 2: Under first reply avatar (68px from left)
  const leftPosition = depth === 1 ? 20 : 68;

  // Animated style for line drawing effect
  const lineStyle = useAnimatedStyle(() => {
    if (!animated) {
      return { height: '100%' };
    }

    return {
      height: withTiming('100%', { duration: 150 }),
    };
  }, [animated]);

  return (
    <View style={[styles.container, { left: leftPosition }]}>
      {/* Vertical line */}
      <Animated.View style={[styles.verticalLine, lineStyle]} />

      {/* Horizontal connector to avatar */}
      <View
        style={[
          styles.horizontalLine,
          { bottom: isLast ? 20 : undefined },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 20,
  },
  verticalLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: LINE_WIDTH,
    backgroundColor: LINE_COLOR,
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    width: 20,
    height: LINE_WIDTH,
    backgroundColor: LINE_COLOR,
  },
});

export default memo(ThreadLine);
