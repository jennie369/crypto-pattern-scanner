/**
 * RitualAnimation - Lottie animation component for ritual screens
 *
 * Features:
 * - Lottie animations for ritual elements
 * - Configurable autoPlay, loop, speed
 * - Imperative control via ref (play, pause, reset)
 * - Cleanup on unmount
 */

import React, { memo, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========== LOTTIE SOURCES ==========
const LOTTIE_SOURCES = {
  'heart-glow': require('../../../../assets/lottie/rituals/heart-glow.json'),
  'golden-orbs': require('../../../../assets/lottie/rituals/golden-orbs.json'),
  'breath-circle': require('../../../../assets/lottie/rituals/breath-circle.json'),
  'water-energy': require('../../../../assets/lottie/rituals/water-energy.json'),
  'letter-fly': require('../../../../assets/lottie/rituals/letter-fly.json'),
  'paper-burn': require('../../../../assets/lottie/rituals/paper-burn.json'),
  'crystal-glow': require('../../../../assets/lottie/rituals/crystal-glow.json'),
  'shooting-star': require('../../../../assets/lottie/rituals/shooting-star.json'),
  'fire-ball': require('../../../../assets/lottie/rituals/Fire Ball.json'),
  'paper': require('../../../../assets/lottie/rituals/Paper.json'),
  'reward-light': require('../../../../assets/lottie/rituals/Reward light effect.json'),
};

// ========== ANIMATION CONFIGS ==========
const ANIMATION_CONFIGS = {
  'heart-glow': {
    size: { width: 250, height: 250 },
    loop: true,
    speed: 1,
  },
  'golden-orbs': {
    size: { width: SCREEN_WIDTH, height: 400 },
    loop: true,
    speed: 0.8,
  },
  'breath-circle': {
    size: { width: 280, height: 280 },
    loop: true,
    speed: 1,
  },
  'water-energy': {
    size: { width: 300, height: 300 },
    loop: true,
    speed: 1,
  },
  'letter-fly': {
    size: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.6 },
    loop: false,
    speed: 1,
  },
  'paper-burn': {
    size: { width: 280, height: 370 },
    loop: false,
    speed: 0.6,
  },
  'crystal-glow': {
    size: { width: 250, height: 250 },
    loop: true,
    speed: 0.8,
  },
  'shooting-star': {
    size: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.5 },
    loop: false,
    speed: 1,
  },
  'fire-ball': {
    size: { width: 200, height: 200 },
    loop: true,
    speed: 1,
  },
  'paper': {
    size: { width: 280, height: 350 },
    loop: false,
    speed: 1,
  },
  'reward-light': {
    size: { width: 350, height: 350 },
    loop: true,
    speed: 1,
  },
};

/**
 * RitualAnimation Component
 * Hiển thị Lottie animations cho các elements tương tác trong rituals
 *
 * @param {string} animationId - ID của animation
 * @param {boolean} autoPlay - Tự động play khi mount
 * @param {boolean} loop - Loop animation
 * @param {number} speed - Tốc độ animation (1 = normal)
 * @param {object} style - Custom styles
 * @param {function} onAnimationFinish - Callback khi animation kết thúc
 */
const RitualAnimation = forwardRef(({
  animationId,
  autoPlay = true,
  loop = null,
  speed = null,
  style,
  onAnimationFinish,
}, ref) => {
  const lottieRef = useRef(null);

  const source = LOTTIE_SOURCES[animationId];
  const config = ANIMATION_CONFIGS[animationId] || {
    size: { width: 200, height: 200 },
    loop: true,
    speed: 1,
  };

  // Use props if provided, otherwise use config defaults
  const shouldLoop = loop !== null ? loop : config.loop;
  const animationSpeed = speed !== null ? speed : config.speed;

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    play: () => lottieRef.current?.play(),
    pause: () => lottieRef.current?.pause(),
    reset: () => lottieRef.current?.reset(),
    resume: () => lottieRef.current?.resume(),
  }));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      lottieRef.current?.reset();
    };
  }, []);

  // Debug logging
  console.log('[RitualAnimation] Loading:', { animationId, hasSource: !!source });

  if (!source) {
    console.warn('[RitualAnimation] Animation not found:', animationId);
    return null;
  }

  return (
    <View style={[styles.container, config.size, style]}>
      <LottieView
        ref={lottieRef}
        source={source}
        style={styles.lottie}
        autoPlay={autoPlay}
        loop={shouldLoop}
        speed={animationSpeed}
        onAnimationFinish={onAnimationFinish}
        resizeMode="contain"
        cacheComposition={true}
        renderMode="AUTOMATIC"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

RitualAnimation.displayName = 'RitualAnimation';

export default memo(RitualAnimation);
