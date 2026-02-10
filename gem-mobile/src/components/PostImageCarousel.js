/**
 * Gemral - Post Image Grid/Carousel
 * Facebook-style image grid for multiple photos
 * Features:
 * - 1 image: Full width display
 * - 2 images: Side by side (50/50)
 * - 3 images: 1 large left + 2 stacked right
 * - 4 images: 2x2 grid
 * - 5+ images: 2x2 grid with "+N" overlay on last image
 */

import React, { useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_GAP = 2; // Small gap between images like Facebook

const PostImageCarousel = ({
  images = [],
  height = 300,
  onImagePress,
  containerWidth,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const width = containerWidth || SCREEN_WIDTH;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      overflow: 'hidden',
      backgroundColor: colors.glassBg,
    },
    gridContainer: {
      flexDirection: 'row',
      gap: IMAGE_GAP,
    },
    gridRow: {
      flexDirection: 'row',
      gap: IMAGE_GAP,
    },
    rightColumn: {
      gap: IMAGE_GAP,
    },
    singleImage: {
      // Full width single image
    },
    gridImage: {
      backgroundColor: colors.glassBg,
    },
    // "+N" overlay for 5+ images
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlayText: {
      color: '#FFFFFF',
      fontSize: 32,
      fontWeight: '600',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!images || images.length === 0) {
    return null;
  }

  // Single image - full width
  if (images.length === 1) {
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => onImagePress?.(0)}
        style={[styles.container, { width }]}
      >
        <Image
          source={{ uri: images[0] }}
          style={[styles.singleImage, { width, height }]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  // 2 images - side by side
  if (images.length === 2) {
    const itemWidth = (width - IMAGE_GAP) / 2;
    return (
      <View style={[styles.container, styles.gridContainer, { width }]}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => onImagePress?.(0)}
        >
          <Image
            source={{ uri: images[0] }}
            style={[styles.gridImage, { width: itemWidth, height }]}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => onImagePress?.(1)}
        >
          <Image
            source={{ uri: images[1] }}
            style={[styles.gridImage, { width: itemWidth, height }]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  }

  // 3 images - 1 large left + 2 stacked right (like Facebook)
  if (images.length === 3) {
    const leftWidth = width * 0.55;
    const rightWidth = width * 0.45 - IMAGE_GAP;
    const rightHeight = (height - IMAGE_GAP) / 2;

    return (
      <View style={[styles.container, styles.gridContainer, { width, height }]}>
        {/* Left large image */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => onImagePress?.(0)}
        >
          <Image
            source={{ uri: images[0] }}
            style={[styles.gridImage, { width: leftWidth, height }]}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Right column with 2 stacked images */}
        <View style={styles.rightColumn}>
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => onImagePress?.(1)}
          >
            <Image
              source={{ uri: images[1] }}
              style={[styles.gridImage, { width: rightWidth, height: rightHeight }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => onImagePress?.(2)}
          >
            <Image
              source={{ uri: images[2] }}
              style={[styles.gridImage, { width: rightWidth, height: rightHeight }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 4+ images - 2x2 grid (with +N overlay for 5+ images)
  const itemWidth = (width - IMAGE_GAP) / 2;
  const itemHeight = (height - IMAGE_GAP) / 2;
  const remainingCount = images.length - 4;

  return (
    <View style={[styles.container, { width }]}>
      {/* Top row */}
      <View style={styles.gridRow}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => onImagePress?.(0)}
        >
          <Image
            source={{ uri: images[0] }}
            style={[styles.gridImage, { width: itemWidth, height: itemHeight }]}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => onImagePress?.(1)}
        >
          <Image
            source={{ uri: images[1] }}
            style={[styles.gridImage, { width: itemWidth, height: itemHeight }]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom row */}
      <View style={[styles.gridRow, { marginTop: IMAGE_GAP }]}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => onImagePress?.(2)}
        >
          <Image
            source={{ uri: images[2] }}
            style={[styles.gridImage, { width: itemWidth, height: itemHeight }]}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Last image with +N overlay if more than 4 */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => onImagePress?.(3)}
          style={{ position: 'relative' }}
        >
          <Image
            source={{ uri: images[3] }}
            style={[styles.gridImage, { width: itemWidth, height: itemHeight }]}
            resizeMode="cover"
          />
          {remainingCount > 0 && (
            <View style={[styles.overlay, { width: itemWidth, height: itemHeight }]}>
              <Text style={styles.overlayText}>+{remainingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostImageCarousel;
