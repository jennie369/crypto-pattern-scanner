/**
 * Gemral - Image Preview Component
 * Show selected image with info before upload
 */

import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { calculateAspectRatio, getClosestFormat, formatFileSize } from '../../utils/imageUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ImagePreview = ({
  uri,
  width,
  height,
  fileSize,
  onRemove,
  showInfo = true
}) => {
  const ratio = calculateAspectRatio(width, height);
  const format = getClosestFormat(ratio);

  // Calculate display height to maintain aspect ratio
  const displayWidth = SCREEN_WIDTH - (SPACING.lg * 2);
  const displayHeight = height && width ? (displayWidth * height) / width : displayWidth;

  // Limit max height to prevent oversized preview
  const maxHeight = SCREEN_WIDTH * 1.5;
  const finalHeight = Math.min(displayHeight, maxHeight);

  return (
    <View style={styles.container}>
      {/* Image */}
      <View style={[styles.imageContainer, { height: finalHeight }]}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Remove button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Info bar */}
      {showInfo && (width || height || fileSize) && (
        <View style={styles.info}>
          {width && height && (
            <Text style={styles.infoText}>
              {width} x {height} • {format.name}
            </Text>
          )}
          {fileSize && (
            <Text style={styles.infoText}>
              {formatFileSize(fileSize)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md
  },
  imageContainer: {
    width: '100%',
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.sm
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted
  }
});

export default ImagePreview;
