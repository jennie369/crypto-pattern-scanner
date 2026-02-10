/**
 * Gemral - Image Gallery Component
 * Feature #24: Multiple images gallery with zoom/swipe
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  FlatList,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  Share2,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Image Gallery Grid - Shows images in a grid layout
 */
export const ImageGalleryGrid = ({
  images,
  onImagePress,
  maxVisible = 4,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    // Single Image
    singleImage: {
      borderRadius: 12,
      overflow: 'hidden',
      aspectRatio: 16 / 9,
    },
    singleImageContent: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.glassBg,
    },
    // Grid
    gridContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      aspectRatio: 1,
    },
    gridRow: {
      flex: 1,
      flexDirection: 'row',
      gap: 2,
    },
    gridColumn: {
      flexDirection: 'column',
      gap: 2,
    },
    gridItem: {
      overflow: 'hidden',
    },
    gridItemSmall: {
      flex: 1,
      overflow: 'hidden',
    },
    gridImage: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.glassBg,
    },
    remainingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    remainingText: {
      fontSize: TYPOGRAPHY.fontSize['2xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!images || images.length === 0) return null;

  const visibleImages = images.slice(0, maxVisible);
  const remainingCount = images.length - maxVisible;

  const getGridLayout = (count) => {
    switch (count) {
      case 1:
        return [{ flex: 1 }];
      case 2:
        return [{ flex: 1 }, { flex: 1 }];
      case 3:
        return [{ flex: 2 }, { flex: 1 }, { flex: 1 }];
      default:
        return [{ flex: 1 }, { flex: 1 }, { flex: 1 }, { flex: 1 }];
    }
  };

  const layout = getGridLayout(visibleImages.length);

  if (visibleImages.length === 1) {
    return (
      <TouchableOpacity
        style={styles.singleImage}
        onPress={() => onImagePress?.(0)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: images[0] }} style={styles.singleImageContent} />
      </TouchableOpacity>
    );
  }

  if (visibleImages.length === 2) {
    return (
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          {visibleImages.map((uri, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.gridItem, { flex: 1 }]}
              onPress={() => onImagePress?.(index)}
              activeOpacity={0.9}
            >
              <Image source={{ uri }} style={styles.gridImage} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  if (visibleImages.length === 3) {
    return (
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={[styles.gridItem, { flex: 2 }]}
            onPress={() => onImagePress?.(0)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: visibleImages[0] }} style={styles.gridImage} />
          </TouchableOpacity>
          <View style={[styles.gridColumn, { flex: 1 }]}>
            {visibleImages.slice(1).map((uri, index) => (
              <TouchableOpacity
                key={index}
                style={styles.gridItemSmall}
                onPress={() => onImagePress?.(index + 1)}
                activeOpacity={0.9}
              >
                <Image source={{ uri }} style={styles.gridImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // 4+ images
  return (
    <View style={styles.gridContainer}>
      <View style={styles.gridRow}>
        <TouchableOpacity
          style={[styles.gridItem, { flex: 1 }]}
          onPress={() => onImagePress?.(0)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: visibleImages[0] }} style={styles.gridImage} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.gridItem, { flex: 1 }]}
          onPress={() => onImagePress?.(1)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: visibleImages[1] }} style={styles.gridImage} />
        </TouchableOpacity>
      </View>
      <View style={styles.gridRow}>
        <TouchableOpacity
          style={[styles.gridItem, { flex: 1 }]}
          onPress={() => onImagePress?.(2)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: visibleImages[2] }} style={styles.gridImage} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.gridItem, { flex: 1 }]}
          onPress={() => onImagePress?.(3)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: visibleImages[3] }} style={styles.gridImage} />
          {remainingCount > 0 && (
            <View style={styles.remainingOverlay}>
              <Text style={styles.remainingText}>+{remainingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Full Screen Image Viewer
 */
const ImageGalleryViewer = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
  onShare,
  onDownload,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef(null);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Pan responder for pinch zoom and pan
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Reset position
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        ]).start();

        // Close on swipe down
        if (gestureState.dy > 100) {
          onClose?.();
        }
      },
    })
  ).current;

  const viewerStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    closeButton: {
      padding: SPACING.sm,
    },
    counter: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textPrimary,
    },
    headerActions: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    actionButton: {
      padding: SPACING.sm,
    },
    imageContainer: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT * 0.8,
    },
    navArrow: {
      position: 'absolute',
      top: '50%',
      transform: [{ translateY: -20 }],
      padding: SPACING.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
    },
    navArrowLeft: {
      left: SPACING.sm,
    },
    navArrowRight: {
      right: SPACING.sm,
    },
    dotsContainer: {
      position: 'absolute',
      bottom: 50,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: SPACING.xs,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    dotActive: {
      backgroundColor: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const handleScrollEnd = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(newIndex);
  };

  const renderImage = ({ item, index }) => (
    <Animated.View
      style={[
        viewerStyles.imageContainer,
        {
          transform: [
            { scale },
            { translateX: index === currentIndex ? translateX : 0 },
            { translateY: index === currentIndex ? translateY : 0 },
          ],
        },
      ]}
      {...(index === currentIndex ? panResponder.panHandlers : {})}
    >
      <Image
        source={{ uri: item }}
        style={viewerStyles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={viewerStyles.container}>
        {/* Header */}
        <SafeAreaView style={viewerStyles.header}>
          <TouchableOpacity style={viewerStyles.closeButton} onPress={onClose}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={viewerStyles.counter}>
            {currentIndex + 1} / {images.length}
          </Text>

          <View style={viewerStyles.headerActions}>
            {onShare && (
              <TouchableOpacity
                style={viewerStyles.actionButton}
                onPress={() => onShare?.(images[currentIndex])}
              >
                <Share2 size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
            {onDownload && (
              <TouchableOpacity
                style={viewerStyles.actionButton}
                onPress={() => onDownload?.(images[currentIndex])}
              >
                <Download size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>

        {/* Images */}
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImage}
          keyExtractor={(item, index) => `${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          initialScrollIndex={initialIndex}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <TouchableOpacity
            style={[viewerStyles.navArrow, viewerStyles.navArrowLeft]}
            onPress={goToPrevious}
          >
            <ChevronLeft size={32} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        {currentIndex < images.length - 1 && (
          <TouchableOpacity
            style={[viewerStyles.navArrow, viewerStyles.navArrowRight]}
            onPress={goToNext}
          >
            <ChevronRight size={32} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        {/* Dots Indicator */}
        {images.length <= 10 && (
          <View style={viewerStyles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  viewerStyles.dot,
                  index === currentIndex && viewerStyles.dotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

/**
 * Image Picker Grid - For selecting multiple images
 */
export const ImagePickerGrid = ({
  images,
  selectedImages = [],
  onSelect,
  maxSelection = 10,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const pickerStyles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 2,
    },
    item: {
      width: '32.5%',
      aspectRatio: 1,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.glassBg,
    },
    checkbox: {
      position: 'absolute',
      top: SPACING.xs,
      right: SPACING.xs,
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textPrimary,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.purple,
      borderColor: colors.purple,
    },
    checkboxText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const isSelected = (uri) => selectedImages.includes(uri);
  const selectionIndex = (uri) => selectedImages.indexOf(uri) + 1;

  const handleSelect = (uri) => {
    if (isSelected(uri)) {
      onSelect?.(selectedImages.filter(img => img !== uri));
    } else if (selectedImages.length < maxSelection) {
      onSelect?.([...selectedImages, uri]);
    }
  };

  return (
    <View style={pickerStyles.container}>
      {images.map((uri, index) => (
        <TouchableOpacity
          key={index}
          style={pickerStyles.item}
          onPress={() => handleSelect(uri)}
          activeOpacity={0.8}
        >
          <Image source={{ uri }} style={pickerStyles.image} />
          <View
            style={[
              pickerStyles.checkbox,
              isSelected(uri) && pickerStyles.checkboxSelected,
            ]}
          >
            {isSelected(uri) && (
              <Text style={pickerStyles.checkboxText}>
                {selectionIndex(uri)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Empty Gallery State
 */
export const EmptyGallery = ({ onAddPress }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const emptyStyles = useMemo(() => StyleSheet.create({
    container: {
      aspectRatio: 16 / 9,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    text: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <TouchableOpacity style={emptyStyles.container} onPress={onAddPress}>
      <ImageIcon size={32} color={colors.textMuted} />
      <Text style={emptyStyles.text}>Them hinh anh</Text>
    </TouchableOpacity>
  );
};

export { ImageGalleryViewer };
export default ImageGalleryGrid;
