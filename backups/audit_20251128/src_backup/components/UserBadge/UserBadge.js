/**
 * Gemral - UserBadge Component
 * Single badge display with icon, color and sparkle animation
 * Admin & Tier3 badges have special golden sparkle effect
 */

import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import {
  ShieldCheck,
  BadgeCheck,
  User,
  Star,
  Sparkles,
  Crown,
  TrendingUp,
  Gem,
  Shield,
  ShieldAlert,
  GraduationCap,
  Trophy,
  Target,
  Rocket,
  Waves,
  Flame,
  Circle,
} from 'lucide-react-native';

import {
  getBadgeConfig,
  getBadgeSizeConfig,
} from '../../services/badgeService';

// Icon mapping
const ICON_COMPONENTS = {
  ShieldCheck,
  BadgeCheck,
  User,
  Star,
  Sparkles,
  Crown,
  TrendingUp,
  Gem,
  Shield,
  ShieldAlert,
  GraduationCap,
  Trophy,
  Target,
  Rocket,
  Waves,
  Flame,
  Circle,
};

// Badge types that should have sparkle animation
const SPARKLE_BADGES = ['admin', 'tier_3', 'diamond', 'verified_seller', 'verified_trader'];

// Golden colors for premium badges
const GOLD_PRIMARY = '#FFD700';
const GOLD_BRIGHT = '#FFEA00';
const GOLD_LIGHT = '#FFF8DC';
const SPARKLE_WHITE = '#FFFFFF';

/**
 * UserBadge Component with Sparkle Animation
 * @param {string} type - Badge type (e.g., 'verified_seller', 'tier_1', 'admin')
 * @param {string} size - Badge size ('tiny', 'small', 'medium', 'large')
 * @param {boolean} showLabel - Whether to show badge label
 * @param {Object} style - Additional styles
 */
const UserBadge = ({ type, size = 'small', showLabel = false, style }) => {
  const config = getBadgeConfig(type);
  const sizeConfig = getBadgeSizeConfig(size);

  // Check if this badge should have sparkle animation
  const hasSparkle = SPARKLE_BADGES.includes(type);
  const isAdmin = type === 'admin';
  const isTier3 = type === 'tier_3';
  const isGoldenBadge = isAdmin || isTier3;

  // Override admin and tier_3 color to gold
  const badgeColor = isGoldenBadge ? GOLD_PRIMARY : config.color;

  // Animation values
  const sparkleOpacity1 = useRef(new Animated.Value(0)).current;
  const sparkleOpacity2 = useRef(new Animated.Value(0)).current;
  const sparkleOpacity3 = useRef(new Animated.Value(0)).current;
  const sparkleOpacity4 = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(1)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  // Sparkle animation
  useEffect(() => {
    if (!hasSparkle) return;

    // Sparkle 1 animation - bright flash
    const sparkle1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleOpacity1, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity1, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(1200),
      ])
    );

    // Sparkle 2 animation (delayed)
    const sparkle2Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(sparkleOpacity2, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity2, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );

    // Sparkle 3 animation (more delayed)
    const sparkle3Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(sparkleOpacity3, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity3, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(1100),
      ])
    );

    // Sparkle 4 - extra bright flash
    const sparkle4Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(sparkleOpacity4, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity4, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(900),
      ])
    );

    // Subtle scale pulse for golden badges
    const scaleAnimation = isGoldenBadge ? Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleScale, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleScale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ) : null;

    // Glow ring scale animation for golden badges
    const glowAnimation = isGoldenBadge ? Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ) : null;

    sparkle1Animation.start();
    sparkle2Animation.start();
    sparkle3Animation.start();
    sparkle4Animation.start();
    scaleAnimation?.start();
    glowAnimation?.start();

    return () => {
      sparkle1Animation.stop();
      sparkle2Animation.stop();
      sparkle3Animation.stop();
      sparkle4Animation.stop();
      scaleAnimation?.stop();
      glowAnimation?.stop();
    };
  }, [hasSparkle, isGoldenBadge]);

  const IconComponent = ICON_COMPONENTS[config.icon] || Circle;

  // Calculate sparkle positions based on container size
  const sparkleSize = Math.max(3, sizeConfig.containerSize * 0.18);

  return (
    <View style={[styles.wrapper, style]}>
      {/* Expanding glow ring for golden badges */}
      {isGoldenBadge && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: sizeConfig.containerSize,
              height: sizeConfig.containerSize,
              borderRadius: sizeConfig.containerSize / 2,
              borderColor: GOLD_BRIGHT,
              transform: [{ scale: glowScale }],
              opacity: Animated.subtract(1.3, glowScale), // Fade out as it expands
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.container,
          {
            width: sizeConfig.containerSize,
            height: sizeConfig.containerSize,
            borderRadius: sizeConfig.borderRadius,
            backgroundColor: isGoldenBadge
              ? `${GOLD_PRIMARY}50`
              : `${badgeColor}25`,
            borderWidth: isGoldenBadge ? 1.5 : 0,
            borderColor: isGoldenBadge ? GOLD_PRIMARY : 'transparent',
            transform: isGoldenBadge ? [{ scale: sparkleScale }] : [],
            // Shadow glow for golden badges
            shadowColor: isGoldenBadge ? GOLD_BRIGHT : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: isGoldenBadge ? 8 : 0,
            shadowOpacity: isGoldenBadge ? 1 : 0,
            elevation: isGoldenBadge ? 6 : 0,
          },
        ]}
      >
        <IconComponent
          size={sizeConfig.iconSize}
          color={badgeColor}
          strokeWidth={2.5}
        />

        {/* Sparkle effects - bright white dots */}
        {hasSparkle && (
          <>
            {/* Sparkle 1 - Top right - BRIGHT WHITE */}
            <Animated.View
              style={[
                styles.sparkle,
                {
                  top: -3,
                  right: -3,
                  width: sparkleSize + 1,
                  height: sparkleSize + 1,
                  backgroundColor: SPARKLE_WHITE,
                  opacity: sparkleOpacity1,
                  shadowColor: isGoldenBadge ? GOLD_BRIGHT : badgeColor,
                  shadowRadius: 6,
                  shadowOpacity: 1,
                },
              ]}
            />

            {/* Sparkle 2 - Bottom right */}
            <Animated.View
              style={[
                styles.sparkle,
                {
                  bottom: -2,
                  right: 0,
                  width: sparkleSize * 0.8,
                  height: sparkleSize * 0.8,
                  backgroundColor: isGoldenBadge ? GOLD_LIGHT : SPARKLE_WHITE,
                  opacity: sparkleOpacity2,
                  shadowColor: isGoldenBadge ? GOLD_BRIGHT : badgeColor,
                  shadowRadius: 4,
                  shadowOpacity: 1,
                },
              ]}
            />

            {/* Sparkle 3 - Top left */}
            <Animated.View
              style={[
                styles.sparkle,
                {
                  top: 0,
                  left: -3,
                  width: sparkleSize * 0.7,
                  height: sparkleSize * 0.7,
                  backgroundColor: SPARKLE_WHITE,
                  opacity: sparkleOpacity3,
                  shadowColor: isGoldenBadge ? GOLD_BRIGHT : badgeColor,
                  shadowRadius: 4,
                  shadowOpacity: 1,
                },
              ]}
            />

            {/* Sparkle 4 - Bottom left - extra bright */}
            <Animated.View
              style={[
                styles.sparkle,
                {
                  bottom: 1,
                  left: -2,
                  width: sparkleSize * 0.6,
                  height: sparkleSize * 0.6,
                  backgroundColor: SPARKLE_WHITE,
                  opacity: sparkleOpacity4,
                  shadowColor: isGoldenBadge ? GOLD_BRIGHT : badgeColor,
                  shadowRadius: 5,
                  shadowOpacity: 1,
                },
              ]}
            />
          </>
        )}
      </Animated.View>

      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              fontSize: sizeConfig.fontSize,
              color: badgeColor,
            },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    borderRadius: 100,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default memo(UserBadge);
