/**
 * Gemral - Image Viewer Component
 * Full screen image viewer with zoom, pan, and swipe gestures
 * Supports single image and multi-image gallery
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { X, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Swipe threshold for dismissing
const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 0.5;

const ImageViewer = ({
  visible,
  images = [],
  initialIndex = 0,
  onClose,
  onShare,
  onDownload,
  showCounter = true,
  showActions = true,
  backgroundColor = 'rgba(0, 0, 0, 0.95)',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Handle vertical swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateY.setValue(gestureState.dy);
        // Fade out as user swipes
        const progress = Math.min(Math.abs(gestureState.dy) / SWIPE_THRESHOLD, 1);
        opacity.setValue(1 - progress * 0.5);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (
          Math.abs(gestureState.dy) > SWIPE_THRESHOLD ||
          Math.abs(gestureState.vy) > VELOCITY_THRESHOLD
        ) {
          // Dismiss
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: gestureState.dy > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onClose?.();
            // Reset values
            translateY.setValue(0);
            opacity.setValue(1);
          });
        } else {
          // Snap back
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Handle horizontal scroll to change image
  const handleScroll = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < images.length) {
      setCurrentIndex(index);
      setLoading(true);
    }
  }, [currentIndex, images.length]);

  // Navigate to previous image
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setLoading(true);
      scrollRef.current?.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: true });
    }
  }, [currentIndex]);

  // Navigate to next image
  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setLoading(true);
      scrollRef.current?.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: true });
    }
  }, [currentIndex, images.length]);

  // Handle share action
  const handleShare = useCallback(() => {
    const currentImage = images[currentIndex];
    onShare?.(currentImage, currentIndex);
  }, [currentIndex, images, onShare]);

  // Handle download action
  const handleDownload = useCallback(() => {
    const currentImage = images[currentIndex];
    onDownload?.(currentImage, currentIndex);
  }, [currentIndex, images, onDownload]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setLoading(false);
  }, []);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setLoading(true);
      translateY.setValue(0);
      opacity.setValue(1);
      // Scroll to initial index
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: initialIndex * SCREEN_WIDTH, animated: false });
      }, 100);
    }
  }, [visible, initialIndex]);

  if (!visible || images.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

      <Animated.View
        style={[
          styles.container,
          { backgroundColor, opacity }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Counter */}
          {showCounter && images.length > 1 && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {currentIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Actions */}
          {showActions && (
            <View style={styles.actions}>
              {onShare && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Share2 size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              )}
              {onDownload && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDownload}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Download size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Images */}
        <Animated.View
          style={[
            styles.imageContainer,
            { transform: [{ translateY }] }
          ]}
          {...panResponder.panHandlers}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            bounces={false}
            decelerationRate="fast"
          >
            {images.map((imageUri, index) => (
              <View key={index} style={styles.imageWrapper}>
                {loading && index === currentIndex && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.gold} />
                  </View>
                )}
                <Image
                  source={{ uri: typeof imageUri === 'string' ? imageUri : imageUri.uri }}
                  style={styles.image}
                  resizeMode="contain"
                  onLoad={index === currentIndex ? handleImageLoad : undefined}
                />
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Navigation Arrows (for multi-image) */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPrevious}
                activeOpacity={0.7}
              >
                <ChevronLeft size={32} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNext}
                activeOpacity={0.7}
              >
                <ChevronRight size={32} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Pagination Dots */}
        {images.length > 1 && images.length <= 10 && (
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive
                ]}
              />
            ))}
          </View>
        )}

        {/* Swipe hint */}
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>Vuốt để đóng</Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  counterText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navButtonLeft: {
    left: SPACING.md,
  },
  navButtonRight: {
    right: SPACING.md,
  },
  pagination: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
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
  swipeHint: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
});

export default ImageViewer;
