/**
 * GEM Mobile - Lottie Sticker Renderer
 * Wrapper for lottie-react-native with fallback support
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { COLORS } from '../../utils/tokens';

// Try to import Lottie, but handle if not installed
let LottieView = null;
try {
  LottieView = require('lottie-react-native').default;
} catch (e) {
  console.warn('[LottieSticker] lottie-react-native not installed, using fallback');
}

const LottieSticker = ({
  source,
  style,
  autoPlay = true,
  loop = true,
  speed = 1,
  onAnimationFinish,
  fallbackImage,
  onLoad,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lottieData, setLottieData] = useState(null);
  const animationRef = useRef(null);

  // Fetch Lottie JSON if source is a URI
  useEffect(() => {
    const loadLottieData = async () => {
      if (!source?.uri) {
        setError(true);
        return;
      }

      try {
        setLoading(true);

        // Check if URL is JSON (Lottie file)
        const response = await fetch(source.uri);
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json') || source.uri.endsWith('.json')) {
          const json = await response.json();
          setLottieData(json);
          setError(false);
          onLoad?.();
        } else {
          // Not a Lottie file, use fallback
          setError(true);
        }
      } catch (err) {
        console.error('[LottieSticker] Load error:', err);
        setError(true);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    loadLottieData();
  }, [source?.uri]);

  // Play/Pause controls
  const play = () => {
    if (animationRef.current?.play) {
      animationRef.current.play();
    }
  };

  const pause = () => {
    if (animationRef.current?.pause) {
      animationRef.current.pause();
    }
  };

  const reset = () => {
    if (animationRef.current?.reset) {
      animationRef.current.reset();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, style, styles.loadingContainer]}>
        <ActivityIndicator color={COLORS.gold} size="small" />
      </View>
    );
  }

  // If LottieView is not available or there's an error, show fallback
  if (!LottieView || error) {
    if (fallbackImage) {
      return (
        <Image
          source={{ uri: fallbackImage }}
          style={[styles.fallbackImage, style]}
          resizeMode="contain"
        />
      );
    }

    // If source is an image URL (not Lottie), try to display it
    if (source?.uri && !source.uri.endsWith('.json')) {
      return (
        <Image
          source={{ uri: source.uri }}
          style={[styles.fallbackImage, style]}
          resizeMode="contain"
        />
      );
    }

    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <View style={styles.errorPlaceholder} />
      </View>
    );
  }

  // Render Lottie animation
  return (
    <View style={[styles.container, style]}>
      <LottieView
        ref={animationRef}
        source={lottieData}
        style={styles.lottie}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        resizeMode="contain"
        onAnimationFinish={(isCancelled) => {
          if (!isCancelled) {
            onAnimationFinish?.();
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  errorPlaceholder: {
    width: '50%',
    height: '50%',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
  },
});

export default LottieSticker;
