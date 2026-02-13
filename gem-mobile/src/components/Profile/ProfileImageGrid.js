/**
 * Gemral - Profile Image Grid
 * 3-column grid layout for photos/videos with overlay stats
 * Instagram/TikTok style media grid
 *
 * Uses DESIGN_TOKENS v3.0
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  MessageCircle,
  Play,
  ImageIcon,
  Grid3X3,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * 2) / 3;

/**
 * ProfileImageGrid - Instagram-style 3-column grid
 *
 * @param {Object} props
 * @param {Array} props.items - Array of posts/photos/videos
 * @param {boolean} props.loading - Loading state
 * @param {string} props.type - 'photos' | 'videos' | 'all'
 * @param {Function} props.onItemPress - Override default navigation
 * @param {Function} props.onLoadMore - Load more callback
 * @param {boolean} props.hasMore - Has more items to load
 * @param {Object} props.emptyConfig - Empty state config {icon, title, subtitle}
 */
const ProfileImageGrid = ({
  items = [],
  loading = false,
  type = 'all',
  onItemPress,
  onLoadMore,
  hasMore = false,
  emptyConfig,
}) => {
  const navigation = useNavigation();
  const [pressedId, setPressedId] = useState(null);

  const handlePress = (item) => {
    if (onItemPress) {
      onItemPress(item);
    } else {
      navigation.navigate('PostDetail', { postId: item.id });
    }
  };

  const handlePressIn = (id) => {
    setPressedId(id);
  };

  const handlePressOut = () => {
    setPressedId(null);
  };

  const renderItem = ({ item, index }) => {
    const isVideo = item.video_url || item.type === 'video';
    const imageUrl = item.image_url || item.thumbnail_url;
    const isPressed = pressedId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          index % 3 === 0 && styles.gridItemLeft,
          index % 3 === 2 && styles.gridItemRight,
        ]}
        onPress={() => handlePress(item)}
        onPressIn={() => handlePressIn(item.id)}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Image/Thumbnail */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.gridPlaceholder}>
            <ImageIcon size={24} color={COLORS.textMuted} />
          </View>
        )}

        {/* Video badge */}
        {isVideo && (
          <View style={styles.videoBadge}>
            <Play size={12} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          </View>
        )}

        {/* Stats overlay on press/hover */}
        {isPressed && (
          <View style={styles.statsOverlay}>
            <View style={styles.statsRow}>
              <Heart size={18} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
              <Text style={styles.statsText}>{item.likes_count || 0}</Text>
            </View>
            <View style={styles.statsRow}>
              <MessageCircle size={18} color={COLORS.textPrimary} />
              <Text style={styles.statsText}>{item.comments_count || 0}</Text>
            </View>
          </View>
        )}

        {/* Multiple images indicator */}
        {item.images?.length > 1 && (
          <View style={styles.multipleIndicator}>
            <Grid3X3 size={14} color={COLORS.textPrimary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    const config = emptyConfig || {
      icon: ImageIcon,
      title: 'Chưa có hình ảnh',
      subtitle: 'Các hình ảnh sẽ xuất hiện ở đây',
    };

    const IconComponent = config.icon || ImageIcon;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <IconComponent size={48} color={COLORS.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>{config.title}</Text>
        <Text style={styles.emptySubtitle}>{config.subtitle}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || items.length === 0) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={COLORS.purple} />
        <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
      </View>
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString()}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={hasMore && onLoadMore ? onLoadMore : null}
        onEndReachedThreshold={0.3}
        scrollEnabled={false} // Let parent ScrollView handle scrolling
      />
    </View>
  );
};

/**
 * ProfileImageGridItem - Single grid item (can be used standalone)
 */
export const ProfileImageGridItem = ({
  item,
  onPress,
  showStats = false,
  size = ITEM_SIZE,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const navigation = useNavigation();

  const isVideo = item?.video_url || item?.type === 'video';
  const imageUrl = item?.image_url || item?.thumbnail_url;

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    } else if (item?.id) {
      navigation.navigate('PostDetail', { postId: item.id });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.singleItem, { width: size, height: size }]}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={1}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.singleItemImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.singleItemPlaceholder}>
          <ImageIcon size={20} color={COLORS.textMuted} />
        </View>
      )}

      {isVideo && (
        <View style={styles.videoBadge}>
          <Play size={12} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
        </View>
      )}

      {(showStats || isPressed) && (
        <View style={styles.statsOverlay}>
          <View style={styles.statsRow}>
            <Heart size={14} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            <Text style={styles.statsTextSmall}>{item?.likes_count || 0}</Text>
          </View>
          <View style={styles.statsRow}>
            <MessageCircle size={14} color={COLORS.textPrimary} />
            <Text style={styles.statsTextSmall}>{item?.comments_count || 0}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContent: {
    minHeight: 200,
  },

  // Grid Item
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: COLORS.bgMid,
    position: 'relative',
  },
  gridItemLeft: {
    marginRight: GRID_GAP / 2,
  },
  gridItemRight: {
    marginLeft: GRID_GAP / 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
  },

  // Video badge
  videoBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: SPACING.xs,
    borderRadius: 4,
  },

  // Multiple images indicator
  multipleIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: SPACING.xs,
    borderRadius: 4,
  },

  // Stats overlay
  statsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statsText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statsTextSmall: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Single Item
  singleItem: {
    backgroundColor: COLORS.bgMid,
    position: 'relative',
    margin: 1,
  },
  singleItemImage: {
    width: '100%',
    height: '100%',
  },
  singleItemPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },

  // Load more
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  loadMoreText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
});

export default ProfileImageGrid;
