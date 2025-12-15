/**
 * Gemral - Image Viewer Component
 * Fullscreen image viewer with zoom and gestures
 *
 * Features:
 * - Pinch to zoom
 * - Double-tap to zoom
 * - Pan when zoomed
 * - Swipe down to close
 * - Share/Save options
 */

import React, { useRef, useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 150;

const ImageViewer = memo(({
  visible,
  imageUrl,
  onClose,
  senderName,
  timestamp,
}) => {
  // State
  const [loading, setLoading] = useState(true);

  // Animation refs
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Gesture refs
  const lastScale = useRef(1);
  const lastTap = useRef(0);
  const isZoomed = useRef(false);

  // Reset on close
  const resetTransform = useCallback(() => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    opacity.setValue(1);
    lastScale.current = 1;
    isZoomed.current = false;
  }, [scale, translateX, translateY, opacity]);

  // Handle close
  const handleClose = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      resetTransform();
      onClose();
    });
  }, [opacity, resetTransform, onClose]);

  // Double tap to zoom
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap detected
      if (isZoomed.current) {
        // Zoom out
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }),
          Animated.spring(translateX, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }),
        ]).start();
        lastScale.current = 1;
        isZoomed.current = false;
      } else {
        // Zoom in
        Animated.spring(scale, {
          toValue: 2,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start();
        lastScale.current = 2;
        isZoomed.current = true;
      }
    }
    lastTap.current = now;
  }, [scale, translateX, translateY]);

  // Pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5 || Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        // Store current values
        translateX.setOffset(translateX._value);
        translateY.setOffset(translateY._value);
        translateX.setValue(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isZoomed.current) {
          // Pan when zoomed
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        } else {
          // Swipe down to dismiss
          translateY.setValue(gestureState.dy);
          // Fade out as user swipes down
          const progress = Math.min(Math.abs(gestureState.dy) / DISMISS_THRESHOLD, 1);
          opacity.setValue(1 - progress * 0.5);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        translateY.flattenOffset();

        if (!isZoomed.current && Math.abs(gestureState.dy) > DISMISS_THRESHOLD) {
          // Dismiss
          handleClose();
        } else {
          // Snap back
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              tension: 65,
              friction: 11,
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              tension: 65,
              friction: 11,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Save image
  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images');
        return;
      }

      // Download image
      const fileUri = FileSystem.documentDirectory + `image-${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

      // Save to library
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      Alert.alert('Saved', 'Image saved to your library');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  // Share image
  const handleShare = async () => {
    try {
      await Share.share({
        url: imageUrl,
        message: 'Check out this image!',
      });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  // Format time
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleString();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" />

      <Animated.View style={[styles.container, { opacity }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            {senderName && (
              <Text style={styles.senderName}>{senderName}</Text>
            )}
            {timestamp && (
              <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Ionicons name="download-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [
                { scale },
                { translateX },
                { translateY },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleDoubleTap}
            style={styles.imageTouchable}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Hint */}
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Double-tap to zoom • Swipe down to close
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Image
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTouchable: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Loading
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },

  // Hint
  hint: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});
