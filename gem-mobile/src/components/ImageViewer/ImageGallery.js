/**
 * Image Gallery Component
 * Full-screen image gallery with pagination
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import React, { useState, useCallback, useRef, memo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  StatusBar,
  Dimensions,
  FlatList,
  Share,
  Alert,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import ZoomableImage from './ZoomableImage';
import ImageViewerControls from './ImageViewerControls';
import PaginationDots from './PaginationDots';
import ZoomIndicator from './ZoomIndicator';
import ImageViewerOnboarding from './ImageViewerOnboarding';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Overlay height constants
const OVERLAY_COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.33; // 1/3 screen when collapsed
const OVERLAY_EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.7;   // 70% screen when expanded
const SAFE_BOTTOM_PADDING = 50;

/**
 * Post Overlay Component - Facebook-style text overlay
 * - Expanded: Shows full content (70% screen)
 * - Collapsed: Shows 1/3 screen with author name
 * - Faded: Overlay becomes very transparent to see image
 */
const PostOverlay = memo(({
  authorName,
  postContent,
  overlayExpanded,
  overlayFaded,
  toggleOverlay,
  onTapOverlay,
}) => {
  // Get safe area insets for bottom padding
  let bottomInset = SAFE_BOTTOM_PADDING;
  try {
    const insets = useSafeAreaInsets();
    bottomInset = Math.max(insets.bottom, SAFE_BOTTOM_PADDING);
  } catch (e) {
    // Hook not available, use default
  }

  // Animated values
  const heightAnim = useSharedValue(overlayExpanded ? OVERLAY_EXPANDED_HEIGHT : OVERLAY_COLLAPSED_HEIGHT);
  const opacityAnim = useSharedValue(overlayFaded ? 0.15 : 1);

  // Update animations when state changes
  useEffect(() => {
    heightAnim.value = withSpring(
      overlayExpanded ? OVERLAY_EXPANDED_HEIGHT : OVERLAY_COLLAPSED_HEIGHT,
      { damping: 20, stiffness: 150 }
    );
  }, [overlayExpanded]);

  useEffect(() => {
    opacityAnim.value = withTiming(overlayFaded ? 0.15 : 1, { duration: 200 });
  }, [overlayFaded]);

  // Animated style for container
  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
    opacity: opacityAnim.value,
  }));

  return (
    <Animated.View style={[overlayStyles.postOverlay, animatedContainerStyle]}>
      {/* Tap area to unfade when faded */}
      <TouchableWithoutFeedback onPress={onTapOverlay}>
        <View style={overlayStyles.overlayInner}>
          {/* Author header - ALWAYS visible */}
          <TouchableOpacity
            style={overlayStyles.postOverlayHeader}
            activeOpacity={0.8}
            onPress={toggleOverlay}
          >
            <View style={overlayStyles.authorSection}>
              {authorName && (
                <Text style={overlayStyles.postOverlayAuthor} numberOfLines={1}>
                  {authorName}
                </Text>
              )}
              {!overlayExpanded && postContent && (
                <Text style={overlayStyles.previewText} numberOfLines={2}>
                  {postContent.replace(/<[^>]*>/g, '').substring(0, 100)}
                </Text>
              )}
            </View>
            <View style={overlayStyles.toggleButton}>
              <Text style={overlayStyles.postOverlayHint}>
                {overlayExpanded ? '▼ Thu gọn' : '▲ Mở rộng'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Scrollable content area - only when expanded */}
          {overlayExpanded && postContent && (
            <ScrollView
              style={overlayStyles.postOverlayScroll}
              contentContainerStyle={[
                overlayStyles.postOverlayScrollContent,
                { paddingBottom: (SPACING?.xxl || 32) + bottomInset }
              ]}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              bounces={true}
            >
              <Text style={overlayStyles.postOverlayContent}>
                {postContent.replace(/<[^>]*>/g, '')}
              </Text>
            </ScrollView>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
});

const overlayStyles = StyleSheet.create({
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Reduced opacity
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  overlayInner: {
    flex: 1,
  },
  postOverlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING?.lg || 16,
    paddingVertical: SPACING?.md || 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 60,
  },
  authorSection: {
    flex: 1,
    marginRight: SPACING?.md || 12,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  postOverlayScroll: {
    flex: 1,
  },
  postOverlayScrollContent: {
    paddingHorizontal: SPACING?.lg || 16,
    paddingTop: SPACING?.md || 12,
    paddingBottom: (SPACING?.xxl || 32) + 40,
    flexGrow: 1,
  },
  postOverlayAuthor: {
    fontSize: TYPOGRAPHY?.fontSize?.xl || 20,
    fontWeight: TYPOGRAPHY?.fontWeight?.bold || '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  previewText: {
    fontSize: TYPOGRAPHY?.fontSize?.sm || 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginTop: 4,
  },
  postOverlayContent: {
    fontSize: TYPOGRAPHY?.fontSize?.md || 16,
    color: '#FFFFFF',
    lineHeight: 26,
    opacity: 0.95,
  },
  postOverlayHint: {
    fontSize: TYPOGRAPHY?.fontSize?.xs || 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
});

/**
 * ImageGallery - Full-screen image gallery
 *
 * @param {Object} props
 * @param {boolean} props.visible - Show/hide gallery
 * @param {Array} props.images - Array of { uri, width, height }
 * @param {number} props.initialIndex - Starting image index
 * @param {Function} props.onClose - Close callback
 * @param {string} props.postContent - Post text content for overlay
 * @param {string} props.authorName - Author name for overlay
 * @param {boolean} props.showOverlay - Whether to show text overlay
 */
const ImageGallery = ({
  visible,
  images = [],
  initialIndex = 0,
  onClose,
  postContent = null,
  authorName = null,
  showOverlay = true,
}) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [overlayExpanded, setOverlayExpanded] = useState(true);  // Text overlay expanded/collapsed
  const [overlayFaded, setOverlayFaded] = useState(false);       // Text overlay faded to see image

  // Refs
  const flatListRef = useRef(null);

  // Animated values
  const scrollX = useSharedValue(initialIndex * SCREEN_WIDTH);

  // Handle scroll
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // Handle page change
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
      setCurrentZoom(1); // Reset zoom on page change
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Single tap on image - toggle overlay fade (to see image better)
  const handleTap = useCallback(() => {
    // When tapping image, fade overlay to see image clearly
    // If already faded, unfade it
    setOverlayFaded((prev) => !prev);
    // Also toggle controls
    setControlsVisible((prev) => !prev);
  }, []);

  // Handle zoom change
  const handleZoomChange = useCallback((scale) => {
    setCurrentZoom(scale);
    // Hide controls and fade overlay when zoomed (so user can see image clearly)
    if (scale > 1) {
      setControlsVisible(false);
      setOverlayFaded(true);
    } else if (scale === 1) {
      // When zoom resets to 1, unfade overlay
      setOverlayFaded(false);
      setControlsVisible(true);
    }
  }, []);

  // Handle share - with better error handling
  const handleShare = useCallback(async () => {
    const currentImage = images[currentIndex];
    if (!currentImage?.uri) {
      Alert.alert('Lỗi', 'Không tìm thấy ảnh để chia sẻ.');
      return;
    }

    try {
      console.log('[ImageGallery] Sharing image:', currentImage.uri);
      const result = await Share.share({
        url: currentImage.uri,
        message: 'Chia sẻ từ Gemral',
      });
      console.log('[ImageGallery] Share result:', result);
    } catch (err) {
      console.error('[ImageGallery] Share error:', err);
      Alert.alert('Lỗi', 'Không thể chia sẻ ảnh. Vui lòng thử lại.');
    }
  }, [currentIndex, images]);

  // Handle download - with better feedback and error handling
  const handleDownload = useCallback(async () => {
    const currentImage = images[currentIndex];
    if (!currentImage?.uri) {
      Alert.alert('Lỗi', 'Không tìm thấy ảnh để tải về.');
      return;
    }

    try {
      console.log('[ImageGallery] Downloading image:', currentImage.uri);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng vào Cài đặt > Gemral > Ảnh và cho phép truy cập thư viện.'
        );
        return;
      }

      // Show downloading indicator (could add loading state later)
      console.log('[ImageGallery] Permission granted, starting download...');

      // Download file
      const filename = `gemral_image_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(
        currentImage.uri,
        fileUri
      );

      console.log('[ImageGallery] Download result:', downloadResult.status);

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      Alert.alert('Thành công', 'Đã lưu ảnh vào thư viện!');
    } catch (err) {
      console.error('[ImageGallery] Download error:', err);
      Alert.alert(
        'Lỗi tải ảnh',
        'Không thể tải ảnh. Vui lòng kiểm tra kết nối mạng và thử lại.'
      );
    }
  }, [currentIndex, images]);

  // Handle more options
  const handleMore = useCallback(() => {
    // Show action sheet with more options
    Alert.alert(
      'Tùy chọn',
      null,
      [
        { text: 'Báo cáo ảnh', onPress: () => {} },
        { text: 'Sao chép liên kết', onPress: () => {} },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  }, []);

  // Handle onboarding complete
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Toggle overlay expand/collapse
  const toggleOverlay = useCallback(() => {
    setOverlayExpanded(prev => !prev);
    // When expanding/collapsing, make sure overlay is visible (not faded)
    setOverlayFaded(false);
  }, []);

  // Handle tap on overlay (when faded, unfade it)
  const handleOverlayTap = useCallback(() => {
    if (overlayFaded) {
      setOverlayFaded(false);
      setControlsVisible(true);
    }
  }, [overlayFaded]);

  // Render image item
  const renderItem = useCallback(({ item, index }) => (
    <ZoomableImage
      uri={item.uri}
      width={item.width}
      height={item.height}
      onDismiss={onClose}
      onTap={handleTap}
      onZoomChange={handleZoomChange}
      isActive={index === currentIndex}
    />
  ), [currentIndex, onClose, handleTap, handleZoomChange]);

  // Key extractor
  const keyExtractor = useCallback((item, index) =>
    item.uri || index.toString(),
  []);

  // Get item layout for better performance
  const getItemLayout = useCallback((_, index) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  }), []);

  if (!visible || images.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.container}>
        <StatusBar hidden />

        {/* Background */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.background}
        />

        {/* Image List */}
        <AnimatedFlatList
          ref={flatListRef}
          data={images}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          onScroll={scrollHandler}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEnabled={currentZoom === 1} // Disable scroll when zoomed
          bounces={false}
          decelerationRate="fast"
        />

        {/* Controls */}
        <ImageViewerControls
          visible={controlsVisible}
          currentIndex={currentIndex}
          totalCount={images.length}
          onClose={onClose}
          onShare={handleShare}
          onDownload={handleDownload}
          onMore={handleMore}
        />

        {/* Pagination */}
        {controlsVisible && (
          <View style={styles.paginationContainer}>
            <PaginationDots
              total={images.length}
              currentIndex={currentIndex}
              scrollX={scrollX}
              itemWidth={SCREEN_WIDTH}
            />
          </View>
        )}

        {/* Zoom Indicator */}
        <ZoomIndicator
          scale={currentZoom}
          visible={currentZoom > 1}
        />

        {/* First-time Onboarding */}
        {showOnboarding && (
          <ImageViewerOnboarding onComplete={handleOnboardingComplete} />
        )}

        {/* Facebook-style Post Content Overlay */}
        {showOverlay && (postContent || authorName) && (
          <PostOverlay
            authorName={authorName}
            postContent={postContent}
            overlayExpanded={overlayExpanded}
            overlayFaded={overlayFaded}
            toggleOverlay={toggleOverlay}
            onTapOverlay={handleOverlayTap}
          />
        )}
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
});

export default memo(ImageGallery);
