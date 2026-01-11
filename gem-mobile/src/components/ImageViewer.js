/**
 * Gemral - Image Viewer Component
 * Full screen image viewer with zoom, pan, and swipe gestures
 * Supports single image and multi-image gallery
 * FIXED: Using Gesture Handler for better swipe detection
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
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { X, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';
import CustomAlert, { useCustomAlert } from './CustomAlert';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Swipe threshold for dismissing
const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 500;

// Safe bottom padding for Android navigation bar
const SAFE_BOTTOM_PADDING = 50;

// Post Overlay Component - uses safe area insets
const PostOverlay = ({ authorName, postContent, overlayExpanded, toggleOverlay }) => {
  // Get safe area insets for bottom padding
  let bottomInset = SAFE_BOTTOM_PADDING;
  try {
    const insets = useSafeAreaInsets();
    bottomInset = Math.max(insets.bottom, SAFE_BOTTOM_PADDING);
  } catch (e) {
    // Hook not available, use default
  }

  return (
    <View style={[styles.postOverlay, { paddingBottom: overlayExpanded ? 0 : bottomInset }]}>
      {/* Author header with tap to toggle */}
      <TouchableOpacity
        style={styles.postOverlayHeader}
        activeOpacity={0.8}
        onPress={toggleOverlay}
      >
        {authorName && (
          <Text style={styles.postOverlayAuthor}>{authorName}</Text>
        )}
        <Text style={styles.postOverlayHint}>
          {overlayExpanded ? '▼ Thu gọn' : '▲ Mở rộng'}
        </Text>
      </TouchableOpacity>

      {/* Scrollable content area - always scrollable when expanded */}
      {overlayExpanded && (
        <ScrollView
          style={styles.postOverlayScroll}
          contentContainerStyle={[
            styles.postOverlayScrollContent,
            { paddingBottom: SPACING.xxl + bottomInset }
          ]}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          bounces={true}
        >
          <Text style={styles.postOverlayContent}>
            {postContent.replace(/<[^>]*>/g, '')}
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

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
  // NEW: Post overlay props (Facebook-style)
  postContent = null,
  authorName = null,
  showOverlay = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [overlayExpanded, setOverlayExpanded] = useState(true); // true = text visible, false = hidden
  const [optionsVisible, setOptionsVisible] = useState(false); // Long press options modal
  const [saving, setSaving] = useState(false);
  const flatListRef = useRef(null);
  const { alert, AlertComponent } = useCustomAlert();

  // Animation for overlay slide
  const overlayTranslateY = useSharedValue(0);

  // Reanimated shared values
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  // Close handler (needs to be wrapped for runOnJS)
  const handleClose = useCallback(() => {
    onClose?.();
    // Reset values after close
    translateY.value = 0;
    opacity.value = 1;
    scale.value = 1;
  }, [onClose]);

  // Pan gesture for vertical swipe to dismiss
  const panGesture = Gesture.Pan()
    .activeOffsetY([-20, 20]) // Only activate for vertical movement
    .failOffsetX([-30, 30]) // Fail if horizontal (let FlatList handle)
    .onUpdate((event) => {
      translateY.value = event.translationY;
      // Calculate opacity based on swipe distance
      const progress = Math.min(Math.abs(event.translationY) / SWIPE_THRESHOLD, 1);
      opacity.value = 1 - progress * 0.5;
      scale.value = 1 - progress * 0.1;
    })
    .onEnd((event) => {
      const shouldDismiss =
        Math.abs(event.translationY) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityY) > VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        // Animate out and close
        const direction = event.translationY > 0 ? 1 : -1;
        translateY.value = withTiming(direction * SCREEN_HEIGHT, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleClose)();
        });
      } else {
        // Spring back to original position
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
        opacity.value = withTiming(1, { duration: 150 });
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      }
    });

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

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
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  }, [currentIndex]);

  // Navigate to next image
  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setLoading(true);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
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

  // Toggle overlay visibility with animation
  const toggleOverlay = useCallback(() => {
    if (overlayExpanded) {
      // Collapse overlay - slide down to show only header peek
      overlayTranslateY.value = withTiming(SCREEN_HEIGHT * 0.35, { duration: 300 });
      setOverlayExpanded(false);
    } else {
      // Expand overlay - slide up to show full content
      overlayTranslateY.value = withTiming(0, { duration: 300 });
      setOverlayExpanded(true);
    }
  }, [overlayExpanded, overlayTranslateY]);

  // Animated style for overlay
  const animatedOverlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: overlayTranslateY.value }],
  }));

  // Handle long press on image - show options
  const handleLongPress = useCallback(() => {
    setOptionsVisible(true);
  }, []);

  // Save image to device
  const handleSaveImage = useCallback(async () => {
    setOptionsVisible(false);
    const currentImage = images[currentIndex];
    const imageUri = typeof currentImage === 'string' ? currentImage : currentImage.uri;

    try {
      setSaving(true);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: 'Cần quyền truy cập thư viện ảnh để lưu hình',
        });
        return;
      }

      // Download image to local file
      const filename = `gemral_${Date.now()}.jpg`;
      const fileUri = FileSystem.documentDirectory + filename;

      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);

      if (downloadResult.status === 200) {
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        alert({
          type: 'success',
          title: 'Thành công',
          message: 'Đã lưu hình ảnh vào thư viện',
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('[ImageViewer] Save error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu hình ảnh',
      });
    } finally {
      setSaving(false);
    }
  }, [currentIndex, images, alert]);

  // Share image
  const handleShareImage = useCallback(async () => {
    setOptionsVisible(false);
    const currentImage = images[currentIndex];
    const imageUri = typeof currentImage === 'string' ? currentImage : currentImage.uri;

    try {
      await Share.share({
        url: imageUri,
        message: authorName ? `Ảnh từ ${authorName} trên Gemral` : 'Chia sẻ từ Gemral',
      });
    } catch (error) {
      console.error('[ImageViewer] Share error:', error);
    }
  }, [currentIndex, images, authorName]);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setLoading(true);
      translateY.value = 0;
      opacity.value = 1;
      scale.value = 1;
      overlayTranslateY.value = 0;
      setOverlayExpanded(true);
      // Scroll to initial index
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

        <Animated.View
          style={[
            styles.container,
            { backgroundColor },
            animatedContainerStyle,
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

          {/* Images with Gesture Handler */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
              <FlatList
                ref={flatListRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                bounces={false}
                decelerationRate="fast"
                initialScrollIndex={initialIndex}
                getItemLayout={(data, index) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * index,
                  index,
                })}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item: imageUri, index }) => (
                  <TouchableOpacity
                    style={styles.imageWrapper}
                    activeOpacity={1}
                    onPress={toggleOverlay}
                    onLongPress={handleLongPress}
                    delayLongPress={500}
                  >
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
                  </TouchableOpacity>
                )}
              />
            </Animated.View>
          </GestureDetector>

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

          {/* Facebook-style Post Content Overlay - Scrollable text area */}
          {/* Wrapped in Animated.View to sync with dismiss gesture */}
          {showOverlay && postContent && (
            <Animated.View style={animatedImageStyle}>
              <PostOverlay
                authorName={authorName}
                postContent={postContent}
                overlayExpanded={overlayExpanded}
                toggleOverlay={toggleOverlay}
              />
            </Animated.View>
          )}

          {/* Swipe hint */}
          {!postContent && (
            <View style={styles.swipeHint}>
              <Text style={styles.swipeHintText}>Vuốt lên/xuống để đóng</Text>
            </View>
          )}

          {/* Saving indicator */}
          {saving && (
            <View style={styles.savingOverlay}>
              <ActivityIndicator size="large" color={COLORS.gold} />
              <Text style={styles.savingText}>Đang lưu...</Text>
            </View>
          )}
        </Animated.View>
        {AlertComponent}

        {/* Long Press Options Modal */}
        <Modal
          visible={optionsVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setOptionsVisible(false)}
        >
          <TouchableOpacity
            style={styles.optionsOverlay}
            activeOpacity={1}
            onPress={() => setOptionsVisible(false)}
          >
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsTitle}>Tùy chọn</Text>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleSaveImage}
              >
                <Download size={24} color={COLORS.textPrimary} />
                <Text style={styles.optionText}>Lưu hình ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleShareImage}
              >
                <Share2 size={24} color={COLORS.textPrimary} />
                <Text style={styles.optionText}>Chia sẻ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionItem, styles.optionCancel]}
                onPress={() => setOptionsVisible(false)}
              >
                <X size={24} color={COLORS.textMuted} />
                <Text style={[styles.optionText, styles.optionCancelText]}>Huỷ</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </GestureHandlerRootView>
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
  // Facebook-style Post Content Overlay - Scrollable text area (60%+ of screen)
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.65,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  postOverlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  postOverlayScroll: {
    maxHeight: SCREEN_HEIGHT * 0.50,
    flex: 1,
  },
  postOverlayScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl + 40,
    flexGrow: 1,
  },
  postOverlayAuthor: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
  postOverlayContent: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#FFFFFF',
    lineHeight: 24,
    opacity: 0.95,
  },
  postOverlayHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  // Saving overlay
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.sm,
  },
  // Long press options modal
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl + 20,
    paddingHorizontal: SPACING.lg,
  },
  optionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  optionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  optionCancel: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionCancelText: {
    color: COLORS.textMuted,
  },
});

// Named export for compatibility (PostDetailScreen uses this)
export { ImageViewer as ImageGallery };

export default ImageViewer;
