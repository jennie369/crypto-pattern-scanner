/**
 * Image Gallery Component
 * Full-screen image gallery with pagination
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import React, { useState, useCallback, useRef, memo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  StatusBar,
  Dimensions,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ZoomableImage from './ZoomableImage';
import ImageViewerControls from './ImageViewerControls';
import PaginationDots from './PaginationDots';
import ZoomIndicator from './ZoomIndicator';
import ImageViewerOnboarding from './ImageViewerOnboarding';
import { COLORS } from '../../utils/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * ImageGallery - Full-screen image gallery
 *
 * @param {Object} props
 * @param {boolean} props.visible - Show/hide gallery
 * @param {Array} props.images - Array of { uri, width, height }
 * @param {number} props.initialIndex - Starting image index
 * @param {Function} props.onClose - Close callback
 */
const ImageGallery = ({
  visible,
  images = [],
  initialIndex = 0,
  onClose,
}) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(true);

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

  // Toggle controls
  const handleTap = useCallback(() => {
    setControlsVisible((prev) => !prev);
  }, []);

  // Handle zoom change
  const handleZoomChange = useCallback((scale) => {
    setCurrentZoom(scale);
    // Hide controls when zoomed
    if (scale > 1) {
      setControlsVisible(false);
    }
  }, []);

  // Handle share
  const handleShare = useCallback(async () => {
    const currentImage = images[currentIndex];
    if (!currentImage?.uri) return;

    try {
      await Share.share({
        url: currentImage.uri,
        message: 'Chia sẻ từ Gem',
      });
    } catch (err) {
      console.error('[ImageGallery] Share error:', err);
    }
  }, [currentIndex, images]);

  // Handle download
  const handleDownload = useCallback(async () => {
    const currentImage = images[currentIndex];
    if (!currentImage?.uri) return;

    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng cho phép truy cập thư viện ảnh để tải về.'
        );
        return;
      }

      // Download file
      const filename = `gem_image_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      const { uri } = await FileSystem.downloadAsync(
        currentImage.uri,
        fileUri
      );

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert('Thành công', 'Đã lưu ảnh vào thư viện.');
    } catch (err) {
      console.error('[ImageGallery] Download error:', err);
      Alert.alert('Lỗi', 'Không thể tải ảnh. Vui lòng thử lại.');
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
