/**
 * GEM Mobile - Sticker Message Component
 * Displays sticker or GIF in chat messages
 */

import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import LottieSticker from './LottieSticker';

const STICKER_SIZE = 150;
const GIF_MAX_WIDTH = 200;
const GIF_MAX_HEIGHT = 200;

const StickerMessage = memo(({
  stickerId,
  giphyId,
  url,
  format,
  lottieUrl,
  width,
  height,
  onPress,
  onLongPress,
}) => {
  const isLottie = format === 'lottie' && lottieUrl;
  const isGif = giphyId || format === 'gif';

  // Calculate aspect ratio for GIFs
  const aspectRatio = width && height ? width / height : 1;
  const gifWidth = Math.min(GIF_MAX_WIDTH, (width || GIF_MAX_WIDTH));
  const gifHeight = Math.min(GIF_MAX_HEIGHT, gifWidth / aspectRatio);

  if (isLottie) {
    return (
      <TouchableOpacity
        style={styles.stickerContainer}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.9}
      >
        <LottieSticker
          source={{ uri: lottieUrl }}
          style={styles.lottieSticker}
          autoPlay
          loop
          fallbackImage={url}
        />
      </TouchableOpacity>
    );
  }

  if (isGif) {
    return (
      <TouchableOpacity
        style={[styles.gifContainer, { width: gifWidth, height: gifHeight }]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: url }}
          style={styles.gifImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  // Regular sticker (PNG/WebP)
  return (
    <TouchableOpacity
      style={styles.stickerContainer}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: url }}
        style={styles.stickerImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  stickerContainer: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    marginVertical: SPACING.xs,
  },
  lottieSticker: {
    width: '100%',
    height: '100%',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  gifContainer: {
    marginVertical: SPACING.xs,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
});

export default StickerMessage;
