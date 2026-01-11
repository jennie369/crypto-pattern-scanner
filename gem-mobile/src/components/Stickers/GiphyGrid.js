/**
 * GEM Mobile - GIPHY Grid Component
 * Search and browse GIFs from GIPHY/Tenor API
 */

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { TrendingUp, Search, ImageOff } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import giphyService from '../../services/giphyService';
import stickerService from '../../services/stickerService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const GRID_PADDING = SPACING.md;
const GIF_GAP = SPACING.xs;
const GIF_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GIF_GAP) / NUM_COLUMNS;

const GiphyGrid = memo(({
  searchQuery,
  onSelect,
}) => {
  const [gifs, setGifs] = useState([]);
  const [recentGifs, setRecentGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeoutRef = useRef(null);

  const LIMIT = 20;

  useEffect(() => {
    // Load recent GIFs on mount
    loadRecentGifs();
  }, []);

  useEffect(() => {
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setGifs([]);
      setOffset(0);
      setHasMore(true);
      loadGifs(0, true);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const loadRecentGifs = async () => {
    try {
      const recent = await stickerService.getRecentItems('gif', 10);
      setRecentGifs(recent || []);
    } catch (err) {
      console.error('[GiphyGrid] loadRecentGifs error:', err);
    }
  };

  const loadGifs = async (newOffset = 0, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      let result;

      if (searchQuery && searchQuery.length >= 2) {
        // Search mode
        result = await giphyService.search(searchQuery, LIMIT, newOffset);
      } else {
        // Trending mode
        result = await giphyService.getTrending(LIMIT, newOffset);
      }

      const newGifs = result?.data || [];

      if (reset) {
        setGifs(newGifs);
      } else {
        setGifs(prev => [...prev, ...newGifs]);
      }

      setOffset(newOffset + LIMIT);
      setHasMore(newGifs.length === LIMIT);
    } catch (err) {
      console.error('[GiphyGrid] loadGifs error:', err);
      setError('Khong the tai GIF');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadGifs(offset, false);
    }
  };

  const handleGifPress = useCallback((gif) => {
    onSelect?.({
      type: 'gif',
      giphyId: gif.id,
      url: gif.chat || gif.full || gif.preview,
      previewUrl: gif.preview || gif.still,
      source: gif.source,
    });
  }, [onSelect]);

  const handleRecentGifPress = useCallback((item) => {
    onSelect?.({
      type: 'gif',
      giphyId: item.giphy_id,
      url: item.giphy_url,
    });
  }, [onSelect]);

  const renderGif = ({ item, index }) => {
    // Calculate aspect ratio for staggered effect
    const aspectRatio = item.aspectRatio || 1;
    const height = GIF_WIDTH / aspectRatio;

    return (
      <TouchableOpacity
        style={[styles.gifItem, { height: Math.min(height, 200) }]}
        onPress={() => handleGifPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.preview || item.still }}
          style={styles.gifImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderRecentSection = () => {
    if (recentGifs.length === 0 || searchQuery) return null;

    return (
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gan day</Text>
        </View>
        <FlatList
          data={recentGifs}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recentItem}
              onPress={() => handleRecentGifPress(item)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.giphy_url }}
                style={styles.recentImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => `recent-${item.id}`}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {renderRecentSection()}
      <View style={styles.sectionHeader}>
        {searchQuery ? (
          <>
            <Search size={14} color={COLORS.textMuted} />
            <Text style={styles.sectionTitle}>Ket qua</Text>
          </>
        ) : (
          <>
            <TrendingUp size={14} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Trending</Text>
          </>
        )}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={COLORS.gold} size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <ImageOff size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Khong tim thay GIF' : 'Khong co GIF trending'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.gold} size="large" />
        <Text style={styles.loadingText}>Dang tai GIF...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadGifs(0, true)}
        >
          <Text style={styles.retryText}>Thu lai</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={gifs}
      renderItem={renderGif}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.gridContent}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
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
  headerContainer: {
    marginBottom: SPACING.sm,
  },
  recentSection: {
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  recentContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  recentItem: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SPACING.xs,
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  columnWrapper: {
    gap: GIF_GAP,
    marginBottom: GIF_GAP,
  },
  gifItem: {
    width: GIF_WIDTH,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
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

export default GiphyGrid;
