/**
 * CardFlip Component
 * 3D flip animation for tarot cards using react-native-reanimated
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Image, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { RotateCcw, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_CARD_WIDTH = SCREEN_WIDTH * 0.25;
const DEFAULT_CARD_HEIGHT = DEFAULT_CARD_WIDTH * 1.5;

const CardFlip = ({
  card,
  isFlipped = false,
  onFlip,
  onPress,
  positionLabel,
  positionDescription,
  positionIndex = 0, // Card position number (1, 2, 3...)
  disabled = false,
  cardWidth = DEFAULT_CARD_WIDTH,
  cardHeight = DEFAULT_CARD_HEIGHT,
  reversed = false,
  showPosition = true,
  showPositionHint = true, // Show tooltip with position meaning
  cardBackImage,
  style,
}) => {
  const flipProgress = useSharedValue(isFlipped ? 1 : 0);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (isFlipped) {
      flipProgress.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
        mass: 1,
      });
      // Stop glow animation when flipped
      glowOpacity.value = 0;
    } else {
      flipProgress.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      // Start pulsing glow animation for unflipped cards
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    }
  }, [isFlipped]);

  // ========== HANDLERS ==========
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePress = () => {
    if (disabled) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scale animation
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });

    if (!isFlipped && onFlip) {
      // Trigger flip
      onFlip(card);
    } else if (isFlipped && onPress) {
      // Card already flipped, trigger detail view
      onPress(card);
    }
  };

  // ========== ANIMATED STYLES ==========

  // Card container scale
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Front of card (face down - card back)
  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: 'hidden',
      opacity: flipProgress.value < 0.5 ? 1 : 0,
    };
  });

  // Back of card (face up - card front)
  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    const cardRotation = reversed ? 180 : 0;

    // Trigger haptic when flip completes
    if (flipProgress.value > 0.9 && flipProgress.value < 0.95) {
      runOnJS(triggerHaptic)();
    }

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { rotate: `${cardRotation}deg` },
      ],
      backfaceVisibility: 'hidden',
      opacity: flipProgress.value >= 0.5 ? 1 : 0,
    };
  });

  // Shadow animation
  const shadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(flipProgress.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);

    return {
      shadowOpacity,
    };
  });

  // Pulsing glow effect for unflipped cards
  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  // ========== RENDER ==========
  return (
    <View style={[styles.wrapper, { width: cardWidth, height: cardHeight }, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={disabled}
      >
        {/* Pulsing glow effect for unflipped cards */}
        {!isFlipped && (
          <Animated.View
            style={[
              styles.glowEffect,
              glowStyle,
              { width: cardWidth + 8, height: cardHeight + 8 },
            ]}
          />
        )}

        <Animated.View style={[styles.cardContainer, containerStyle, { width: cardWidth, height: cardHeight }]}>
          {/* Card wrapper with shadow */}
          <Animated.View style={[styles.cardWrapper, shadowStyle]}>
            {/* Front - Card Back (face down) */}
            <Animated.View style={[styles.card, styles.cardFront, frontStyle, { width: cardWidth, height: cardHeight }]}>
              {cardBackImage ? (
                <Image
                  source={cardBackImage}
                  style={[styles.cardImage, { width: cardWidth - 4, height: cardHeight - 4 }]}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['#2D1B4E', '#1A0A2E', '#0D0519']}
                  style={[styles.cardBackDefault, { width: cardWidth - 4, height: cardHeight - 4 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Mystical card back pattern */}
                  <View style={styles.cardBackPattern}>
                    {/* Outer border */}
                    <View style={[styles.patternBorder, { width: cardWidth - 20, height: cardHeight - 20 }]}>
                      {/* Inner decorative frame */}
                      <View style={[styles.patternFrame, { width: cardWidth - 32, height: cardHeight - 32 }]}>
                        {/* Center medallion */}
                        <View style={styles.medallion}>
                          <Svg width={cardWidth * 0.5} height={cardWidth * 0.5} viewBox="0 0 100 100">
                            {/* Outer circle */}
                            <Circle cx="50" cy="50" r="45" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.6" />
                            <Circle cx="50" cy="50" r="38" stroke="#FFD700" strokeWidth="1" fill="none" opacity="0.4" />
                            {/* Star pattern */}
                            <Path
                              d="M50 10 L58 35 L85 35 L63 52 L72 80 L50 62 L28 80 L37 52 L15 35 L42 35 Z"
                              stroke="#FFD700"
                              strokeWidth="1.5"
                              fill="rgba(255, 215, 0, 0.15)"
                            />
                            {/* Inner circle */}
                            <Circle cx="50" cy="50" r="15" stroke="#FFD700" strokeWidth="1" fill="rgba(255, 215, 0, 0.2)" />
                            {/* Center dot */}
                            <Circle cx="50" cy="50" r="5" fill="#FFD700" opacity="0.8" />
                          </Svg>
                        </View>
                        {/* Corner stars */}
                        <View style={styles.cornerTopLeft}>
                          <Sparkles size={12} color="#FFD700" />
                        </View>
                        <View style={styles.cornerTopRight}>
                          <Sparkles size={12} color="#FFD700" />
                        </View>
                        <View style={styles.cornerBottomLeft}>
                          <Sparkles size={12} color="#FFD700" />
                        </View>
                        <View style={styles.cornerBottomRight}>
                          <Sparkles size={12} color="#FFD700" />
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              )}
              {!isFlipped && (
                <View style={styles.tapHint}>
                  <Text style={styles.tapHintText}>Chạm để lật</Text>
                </View>
              )}
            </Animated.View>

            {/* Back - Card Front (face up) */}
            <Animated.View style={[styles.card, styles.cardBack, backStyle, { width: cardWidth, height: cardHeight }]}>
              {card?.image ? (
                <Image
                  source={typeof card.image === 'string' ? { uri: card.image } : card.image}
                  style={[styles.cardImage, { width: cardWidth - 4, height: cardHeight - 4 }]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardPlaceholder, { width: cardWidth - 4, height: cardHeight - 4 }]}>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {card?.vietnameseName || card?.name || 'Unknown'}
                  </Text>
                </View>
              )}
              {reversed && (
                <View style={styles.reversedBadge}>
                  <RotateCcw size={10} color={COLORS.textPrimary} />
                  <Text style={styles.reversedText}>Ngược</Text>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {/* Small position number badge (bottom-left corner) */}
      {showPosition && positionIndex > 0 && (
        <View style={styles.positionBadgeOverlay}>
          <Text style={styles.positionBadgeText}>{positionIndex}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  positionBadgeOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(106, 91, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
    zIndex: 10,
  },
  positionBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 1,
    elevation: 10,
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.bgDarkest,
    overflow: 'hidden',
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  cardImage: {
    borderRadius: 6,
  },
  cardBackDefault: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardBackPattern: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternBorder: {
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternFrame: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  medallion: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
    opacity: 0.7,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    opacity: 0.7,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    opacity: 0.7,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    opacity: 0.7,
  },
  cardPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgMid,
    borderRadius: 6,
    padding: SPACING.xs,
  },
  cardName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tapHint: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reversedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reversedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default CardFlip;
