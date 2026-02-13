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
import { Heart, MessageCircle, Send } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Overlay height constants
const OVERLAY_COLLAPSED_HEIGHT = 140; // Name + 2-3 lines, higher from nav bar
const OVERLAY_EXPANDED_HEIGHT = SCREEN_HEIGHT - 60; // Full screen (minus top controls)
const SAFE_BOTTOM_PADDING = 50;

/**
 * Post Overlay Component - Facebook-style text overlay
 * Simple layout: author name + date + content flowing together
 */
const PostOverlay = memo(({
  authorName,
  postContent,
  postDate,
  privacy = 'public',
  reactionCount = 0,
  commentCount = 0,
  shareCount = 0,
  isLiked = false,
  overlayExpanded,
  overlayFaded,
  toggleOverlay,
  onLike,
  onComment,
  onShare,
}) => {
  // Get safe area insets for bottom padding
  let bottomInset = SAFE_BOTTOM_PADDING;
  try {
    const insets = useSafeAreaInsets();
    bottomInset = Math.max(insets.bottom, SAFE_BOTTOM_PADDING);
  } catch (e) {}

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  // Format count
  const formatCount = (count) => {
    if (!count || count === 0) return null;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Clean content
  const cleanContent = postContent ? postContent.replace(/<[^>]*>/g, '') : '';

  // Animated values
  const heightAnim = useSharedValue(overlayExpanded ? OVERLAY_EXPANDED_HEIGHT : OVERLAY_COLLAPSED_HEIGHT);
  const opacityAnim = useSharedValue(overlayFaded ? 0.15 : 1);

  useEffect(() => {
    heightAnim.value = withTiming(
      overlayExpanded ? OVERLAY_EXPANDED_HEIGHT : OVERLAY_COLLAPSED_HEIGHT,
      { duration: 200 }
    );
  }, [overlayExpanded]);

  useEffect(() => {
    opacityAnim.value = withTiming(overlayFaded ? 0.15 : 1, { duration: 200 });
  }, [overlayFaded]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
    opacity: opacityAnim.value,
  }));

  return (
    <Animated.View style={[overlayStyles.postOverlay, animatedContainerStyle]}>
      {/* Grab handle */}
      <TouchableOpacity style={overlayStyles.grabHandleArea} activeOpacity={0.7} onPress={toggleOverlay}>
        <View style={overlayStyles.grabHandle} />
      </TouchableOpacity>

      {/* Collapsed view */}
      {!overlayExpanded ? (
        <TouchableOpacity style={overlayStyles.collapsedContent} activeOpacity={0.9} onPress={toggleOverlay}>
          <View style={overlayStyles.headerRow}>
            <View style={overlayStyles.authorInfo}>
              <Text style={overlayStyles.authorName}>{authorName}</Text>
              {postDate && <Text style={overlayStyles.dateText}>{formatDate(postDate)}</Text>}
            </View>
            <View style={overlayStyles.toggleButton}>
              <Text style={overlayStyles.toggleText}>▲ Mở rộng</Text>
            </View>
          </View>
          {postContent && (
            <Text style={overlayStyles.previewText} numberOfLines={2}>{cleanContent}</Text>
          )}
        </TouchableOpacity>
      ) : (
        /* Expanded view */
        <View style={overlayStyles.expandedContainer}>
          {/* Scrollable area with author + content together */}
          <ScrollView
            style={overlayStyles.contentScroll}
            contentContainerStyle={overlayStyles.contentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            bounces={true}
          >
            <TouchableOpacity activeOpacity={0.95} onPress={toggleOverlay}>
              {/* Author header inside scroll */}
              <View style={overlayStyles.headerRow}>
                <View style={overlayStyles.authorInfo}>
                  <Text style={overlayStyles.authorName}>{authorName}</Text>
                  {postDate && <Text style={overlayStyles.dateText}>{formatDate(postDate)}</Text>}
                </View>
                <View style={overlayStyles.toggleButton}>
                  <Text style={overlayStyles.toggleText}>▼ Thu gọn</Text>
                </View>
              </View>
              {/* Content directly below author */}
              <Text style={overlayStyles.contentText}>{cleanContent}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Counters row */}
          {(reactionCount > 0 || commentCount > 0 || shareCount > 0) && (
            <View style={overlayStyles.countersRow}>
              {reactionCount > 0 && (
                <View style={overlayStyles.counterItem}>
                  <Heart size={14} color={COLORS.gold} fill={COLORS.gold} />
                  <Text style={overlayStyles.counterText}>{formatCount(reactionCount)}</Text>
                </View>
              )}
              <View style={overlayStyles.counterRight}>
                {commentCount > 0 && (
                  <Text style={overlayStyles.counterText}>{formatCount(commentCount)} bình luận</Text>
                )}
                {shareCount > 0 && (
                  <Text style={overlayStyles.counterText}>  ·  {formatCount(shareCount)} chia sẻ</Text>
                )}
              </View>
            </View>
          )}

          {/* Action buttons - same icons as PostCard */}
          <View style={[overlayStyles.actionsRow, { paddingBottom: bottomInset }]}>
            <TouchableOpacity style={overlayStyles.actionButton} onPress={onLike}>
              <Heart size={20} color={isLiked ? COLORS.gold : '#AAA'} fill={isLiked ? COLORS.gold : 'transparent'} />
              <Text style={[overlayStyles.actionText, isLiked && { color: COLORS.gold }]}>Thích</Text>
            </TouchableOpacity>
            <TouchableOpacity style={overlayStyles.actionButton} onPress={onComment}>
              <MessageCircle size={20} color="#AAA" />
              <Text style={overlayStyles.actionText}>Bình luận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={overlayStyles.actionButton} onPress={onShare}>
              <Send size={18} color="#AAA" />
              <Text style={overlayStyles.actionText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
});

const overlayStyles = StyleSheet.create({
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  grabHandleArea: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  grabHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  // Collapsed & Expanded shared
  collapsedContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  expandedContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  previewText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 21,
  },
  // Scroll area
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  contentText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  // Counters row
  countersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  counterRight: {
    flexDirection: 'row',
  },
  // Action buttons
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#AAA',
    fontWeight: '500',
  },
});

/**
 * ImageGallery - Full-screen image gallery with Facebook-style overlay
 *
 * @param {Object} props
 * @param {boolean} props.visible - Show/hide gallery
 * @param {Array} props.images - Array of { uri, width, height }
 * @param {number} props.initialIndex - Starting image index
 * @param {Function} props.onClose - Close callback
 * @param {string} props.postContent - Post text content for overlay
 * @param {string} props.authorName - Author name for overlay
 * @param {string} props.postDate - Post creation date
 * @param {string} props.privacy - Privacy setting (public/friends/private)
 * @param {number} props.reactionCount - Number of reactions
 * @param {number} props.commentCount - Number of comments
 * @param {number} props.shareCount - Number of shares
 * @param {Function} props.onLike - Like button callback
 * @param {Function} props.onComment - Comment button callback
 * @param {Function} props.onSharePost - Share button callback
 * @param {boolean} props.showOverlay - Whether to show text overlay
 */
const ImageGallery = ({
  visible,
  images = [],
  initialIndex = 0,
  onClose,
  postContent = null,
  authorName = null,
  postDate = null,
  privacy = 'public',
  reactionCount = 0,
  commentCount = 0,
  shareCount = 0,
  isLiked = false,
  onLike,
  onComment,
  onSharePost,
  showOverlay = true,
}) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [overlayExpanded, setOverlayExpanded] = useState(false);  // Start collapsed like Facebook
  const [overlayFaded, setOverlayFaded] = useState(false);       // Text overlay faded to see image
  const [showOptionsModal, setShowOptionsModal] = useState(false); // Custom options modal
  const [toastMessage, setToastMessage] = useState(null); // Toast notification

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

  // Single tap on image - collapse overlay if expanded, or toggle fade
  const handleTap = useCallback(() => {
    if (overlayExpanded) {
      // If overlay is expanded, tap anywhere to collapse it
      setOverlayExpanded(false);
      setOverlayFaded(false);
      setControlsVisible(true);
    } else {
      // If collapsed, toggle fade to see image better
      setOverlayFaded((prev) => !prev);
      setControlsVisible((prev) => !prev);
    }
  }, [overlayExpanded]);

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

      // Show toast instead of alert
      setToastMessage('✓ Đã lưu ảnh vào thư viện');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error('[ImageGallery] Download error:', err);
      setToastMessage('✗ Không thể tải ảnh');
      setTimeout(() => setToastMessage(null), 2500);
    }
  }, [currentIndex, images]);

  // Handle more options - show custom modal
  const handleMore = useCallback(() => {
    setShowOptionsModal(true);
  }, []);

  // Handle long press - show options modal
  const handleLongPress = useCallback(() => {
    setShowOptionsModal(true);
  }, []);

  // Handle copy link
  const handleCopyLink = useCallback(async () => {
    const currentImage = images[currentIndex];
    if (currentImage?.uri) {
      setShowOptionsModal(false);
      setToastMessage('✓ Đã sao chép liên kết');
      setTimeout(() => setToastMessage(null), 2500);
    }
  }, [currentIndex, images]);

  // Handle report
  const handleReport = useCallback(() => {
    setShowOptionsModal(false);
    setToastMessage('✓ Cảm ơn bạn đã báo cáo');
    setTimeout(() => setToastMessage(null), 2500);
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

  // Render image item
  const renderItem = useCallback(({ item, index }) => (
    <ZoomableImage
      uri={item.uri}
      width={item.width}
      height={item.height}
      onDismiss={onClose}
      onTap={handleTap}
      onLongPress={handleLongPress}
      onZoomChange={handleZoomChange}
      isActive={index === currentIndex}
    />
  ), [currentIndex, onClose, handleTap, handleLongPress, handleZoomChange]);

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
            postDate={postDate}
            privacy={privacy}
            reactionCount={reactionCount}
            commentCount={commentCount}
            shareCount={shareCount}
            isLiked={isLiked}
            overlayExpanded={overlayExpanded}
            overlayFaded={overlayFaded}
            toggleOverlay={toggleOverlay}
            onLike={onLike}
            onComment={onComment}
            onShare={onSharePost}
          />
        )}

        {/* Custom Options Modal */}
        <Modal
          visible={showOptionsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowOptionsModal(false)}>
            <View style={styles.optionsBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.optionsContainer}>
                  <Text style={styles.optionsTitle}>Tùy chọn</Text>

                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => {
                      setShowOptionsModal(false);
                      handleDownload();
                    }}
                  >
                    <Text style={styles.optionText}>💾  Lưu ảnh</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={handleCopyLink}
                  >
                    <Text style={styles.optionText}>🔗  Sao chép liên kết</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={handleReport}
                  >
                    <Text style={styles.optionText}>⚠️  Báo cáo ảnh</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionItem, styles.cancelOption]}
                    onPress={() => setShowOptionsModal(false)}
                  >
                    <Text style={styles.cancelText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Toast notification */}
        {toastMessage && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.toastContainer}
          >
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
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
    bottom: 160, // Above collapsed overlay (140px)
    left: 0,
    right: 0,
  },
  // Options Modal styles
  optionsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: COLORS?.surface || '#1A1A2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING?.lg || 20,
    paddingBottom: SPACING?.xxl || 40,
    paddingHorizontal: SPACING?.lg || 20,
  },
  optionsTitle: {
    fontSize: TYPOGRAPHY?.fontSize?.lg || 18,
    fontWeight: TYPOGRAPHY?.fontWeight?.bold || '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING?.lg || 20,
  },
  optionItem: {
    paddingVertical: SPACING?.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionText: {
    fontSize: TYPOGRAPHY?.fontSize?.md || 16,
    color: '#FFFFFF',
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: SPACING?.sm || 8,
  },
  cancelText: {
    fontSize: TYPOGRAPHY?.fontSize?.md || 16,
    color: COLORS?.gold || '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
  },
  // Toast styles
  toastContainer: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default memo(ImageGallery);
