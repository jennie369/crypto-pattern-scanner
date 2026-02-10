/**
 * Gemral - Progressive Image Component
 * Blur-up loading effect for images
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Image as RNImage, Animated, StyleSheet } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

const ProgressiveImage = ({
  source,
  thumbnailSource,
  placeholderSource,
  blurhash,
  style,
  resizeMode = 'cover',
  onLoad,
  onError,
  ...props
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.glassBg,
      overflow: 'hidden'
    },
    loadingBg: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)')
    }
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const [placeholderLoaded, setPlaceholderLoaded] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  const placeholderOpacity = useRef(new Animated.Value(1)).current;
  const thumbnailOpacity = useRef(new Animated.Value(0)).current;
  const fullOpacity = useRef(new Animated.Value(0)).current;

  // Fade in thumbnail when loaded
  useEffect(() => {
    if (thumbnailLoaded) {
      Animated.timing(thumbnailOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();

      // Fade out placeholder
      Animated.timing(placeholderOpacity, {
        toValue: 0,
        duration: 200,
        delay: 100,
        useNativeDriver: true
      }).start();
    }
  }, [thumbnailLoaded]);

  // Fade in full image when loaded
  useEffect(() => {
    if (fullLoaded) {
      Animated.timing(fullOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();

      // Fade out thumbnail
      Animated.timing(thumbnailOpacity, {
        toValue: 0,
        duration: 200,
        delay: 100,
        useNativeDriver: true
      }).start();

      onLoad?.();
    }
  }, [fullLoaded]);

  const handleError = (error) => {
    console.warn('ProgressiveImage error:', error);
    onError?.(error);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Placeholder (tiny blurred image) */}
      {placeholderSource?.uri && !fullLoaded && (
        <Animated.Image
          source={placeholderSource}
          style={[
            StyleSheet.absoluteFill,
            { opacity: placeholderOpacity }
          ]}
          blurRadius={10}
          resizeMode={resizeMode}
          onLoad={() => setPlaceholderLoaded(true)}
        />
      )}

      {/* Thumbnail (medium quality) */}
      {thumbnailSource?.uri && !fullLoaded && (
        <Animated.Image
          source={thumbnailSource}
          style={[
            StyleSheet.absoluteFill,
            { opacity: thumbnailOpacity }
          ]}
          resizeMode={resizeMode}
          onLoad={() => setThumbnailLoaded(true)}
        />
      )}

      {/* Full resolution */}
      {source?.uri && (
        <Animated.Image
          source={source}
          style={[
            StyleSheet.absoluteFill,
            { opacity: fullOpacity }
          ]}
          resizeMode={resizeMode}
          onLoad={() => setFullLoaded(true)}
          onError={handleError}
          {...props}
        />
      )}

      {/* Fallback: If no placeholder, show loading background */}
      {!placeholderSource?.uri && !thumbnailSource?.uri && !fullLoaded && (
        <View style={[StyleSheet.absoluteFill, styles.loadingBg]} />
      )}
    </View>
  );
};

export default ProgressiveImage;
