/**
 * GEM Mobile - Sticker Grid Component
 * Displays stickers in a 4-column grid
 */

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  Image,
} from 'react-native';
import { Sticker } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import LottieSticker from './LottieSticker';
import stickerService from '../../services/stickerService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 4;
const GRID_PADDING = SPACING.md;
const STICKER_GAP = SPACING.xs;
const STICKER_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - STICKER_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const StickerGrid = memo(({
  packId,
  searchQuery,
  onSelect,
}) => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStickers();
  }, [packId, searchQuery]);

  const loadStickers = async () => {
    setLoading(true);
    setError(null);

    try {
      let data = [];

      if (searchQuery && searchQuery.length >= 2) {
        // Search mode
        data = await stickerService.searchStickers(searchQuery);
      } else if (packId) {
        // Pack mode
        data = await stickerService.getStickersForPack(packId);
      } else {
        // Popular stickers fallback
        data = await stickerService.getPopularStickers(20);
      }

      setStickers(data || []);
    } catch (err) {
      console.error('[StickerGrid] loadStickers error:', err);
      setError('Khong the tai stickers');
    } finally {
      setLoading(false);
    }
  };

  const handleStickerPress = useCallback((sticker) => {
    onSelect?.({
      stickerId: sticker.id,
      url: sticker.image_url || sticker.gif_url || sticker.lottie_url,
      format: sticker.format,
      name: sticker.name,
      packId: sticker.pack_id,
    });
  }, [onSelect]);

  const renderSticker = ({ item }) => {
    const isAnimated = item.format === 'lottie';
    const isGif = item.format === 'gif';
    const imageUrl = item.image_url || item.gif_url;

    return (
      <TouchableOpacity
        style={styles.stickerItem}
        onPress={() => handleStickerPress(item)}
        activeOpacity={0.7}
      >
        {isAnimated && item.lottie_url ? (
          <LottieSticker
            source={{ uri: item.lottie_url }}
            style={styles.stickerImage}
            autoPlay
            loop
          />
        ) : imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.stickerImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.stickerPlaceholder}>
            <Sticker size={24} color={COLORS.textMuted} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Sticker size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'Khong tim thay sticker'
            : 'Chua co sticker nao'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStickers}>
          <Text style={styles.retryText}>Thu lai</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={stickers}
      renderItem={renderSticker}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.gridContent}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmpty}
      initialNumToRender={16}
      maxToRenderPerBatch={16}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
});

// Need to import useCallback
import { useCallback } from 'react';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.purple,
    borderRadius: 8,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  gridContent: {
    padding: GRID_PADDING,
    flexGrow: 1,
  },
  columnWrapper: {
    gap: STICKER_GAP,
    marginBottom: STICKER_GAP,
  },
  stickerItem: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  stickerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default StickerGrid;
