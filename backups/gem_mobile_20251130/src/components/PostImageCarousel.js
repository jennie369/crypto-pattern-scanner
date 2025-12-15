/**
 * Gemral - Post Image Carousel
 * Instagram-style image carousel for multiple photos
 * Features:
 * - Horizontal swipe with paging
 * - Photo counter (1/5) top right
 * - Dot indicators bottom center
 * - Double-tap like support
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native';
import { COLORS, SPACING } from '../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PostImageCarousel = ({
  images = [],
  height = 200,
  showCounter = true,
  showDots = true,
  onDoubleTap,
  onImagePress,
  containerWidth,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // Use provided width or default to screen width minus padding
  const imageWidth = containerWidth || (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.lg * 2);

  // Handle scroll end to update current index
  const handleScroll = useCallback((event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / imageWidth);
    setCurrentIndex(index);
  }, [imageWidth]);

  // If no images or single image, render simple image
  if (!images || images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => onImagePress?.(0)}
        style={[styles.container, { height }]}
      >
        <Image
          source={{ uri: images[0] }}
          style={[styles.singleImage, { height }]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {/* Scrollable Images */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={imageWidth}
        snapToAlignment="center"
        contentContainerStyle={{ width: imageWidth * images.length }}
      >
        {images.map((uri, index) => (
          <TouchableOpacity
            key={`carousel-image-${index}`}
            activeOpacity={0.95}
            onPress={() => onImagePress?.(index)}
          >
            <Image
              source={{ uri }}
              style={[styles.carouselImage, { width: imageWidth, height }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Photo Counter (top right) */}
      {showCounter && images.length > 1 && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{images.length}
          </Text>
        </View>
      )}

      {/* Dot Indicators (bottom center) */}
      {showDots && images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.glassBg,
  },
  singleImage: {
    width: '100%',
    borderRadius: 12,
  },
  carouselImage: {
    borderRadius: 0, // No radius for carousel items (container has it)
  },
  // Counter badge (top right)
  counterContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  // Dots (bottom center)
  dotsContainer: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
});

export default PostImageCarousel;
