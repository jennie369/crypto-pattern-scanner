/**
 * Zoomable Image Component
 * Single zoomable image with all gestures
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useImageGestures } from '../../hooks/useImageGestures';
import { calculateImageFit } from '../../utils/imageViewerUtils';
import { useSettings } from '../../contexts/SettingsContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ZoomableImage - Single image with full gesture support
 *
 * @param {Object} props
 * @param {string} props.uri - Image URI
 * @param {number} props.width - Original image width
 * @param {number} props.height - Original image height
 * @param {Function} props.onDismiss - Callback to close viewer
 * @param {Function} props.onTap - Callback for single tap
 * @param {Function} props.onLongPress - Callback for long press (save image)
 * @param {Function} props.onZoomChange - Callback when zoom changes
 * @param {boolean} props.isActive - Whether this image is currently visible
 */
const ZoomableImage = ({
  uri,
  width: originalWidth,
  height: originalHeight,
  onDismiss,
  onTap,
  onLongPress,
  onZoomChange,
  isActive = true,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Calculate display dimensions
  const { width: displayWidth, height: displayHeight } = calculateImageFit(
    originalWidth,
    originalHeight
  );

  // Gesture hook
  const {
    gesture,
    animatedStyle,
    backgroundStyle,
    resetZoom,
  } = useImageGestures({
    imageWidth: displayWidth,
    imageHeight: displayHeight,
    onDismiss,
    onTap,
    onLongPress,
    onZoomChange,
  });

  // Handle image load
  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  // Handle image error
  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  // Reset zoom when image becomes inactive
  useEffect(() => {
    if (!isActive) {
      resetZoom();
    }
  }, [isActive, resetZoom]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      backgroundColor: 'transparent',
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: colors.error || '#FF5252',
      fontSize: 14,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, backgroundStyle]}>
        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.gold} />
          </View>
        )}

        {/* Image */}
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={{ uri }}
            style={[
              styles.image,
              {
                width: displayWidth,
                height: displayHeight,
              },
            ]}
            contentFit="contain"
            onLoad={handleLoad}
            onError={handleError}
            transition={200}
          />
        </Animated.View>

        {/* Error state */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Không thể tải ảnh</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

export default memo(ZoomableImage);
