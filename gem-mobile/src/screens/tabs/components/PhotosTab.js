/**
 * Gemral - Photos Tab Component
 * Instagram-style grid display with stats overlay
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageOff, Heart, MessageCircle, Eye } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const PHOTO_GAP = 2;
const PHOTO_SIZE = (SCREEN_WIDTH - SPACING.lg * 2 - PHOTO_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const PhotosTab = ({
  photos,
  loading,
  onPhotoPress,
  onEndReached,
  hasMore,
}) => {
  // Format number to compact form
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderPhoto = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.photoItem,
        {
          marginRight: (index + 1) % NUM_COLUMNS !== 0 ? PHOTO_GAP : 0,
        },
      ]}
      onPress={() => onPhotoPress?.(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.photo}
        resizeMode="cover"
      />

      {/* Stats Overlay - Instagram Style */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
        style={styles.statsOverlay}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Heart size={12} color="#fff" fill="#fff" />
            <Text style={styles.statText}>{formatNumber(item.likes_count)}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={12} color="#fff" />
            <Text style={styles.statText}>{formatNumber(item.comments_count)}</Text>
          </View>
          {item.views_count > 0 && (
            <View style={styles.statItem}>
              <Eye size={12} color="#fff" />
              <Text style={styles.statText}>{formatNumber(item.views_count)}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ImageOff size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chưa có hình ảnh</Text>
      <Text style={styles.emptySubtitle}>
        Hình ảnh từ bài viết sẽ xuất hiện ở đây
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore || !loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  };

  if (loading && photos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {photos.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id?.toString()}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          scrollEnabled={false} // Parent ScrollView handles scrolling
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: SPACING.huge,
    alignItems: 'center',
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginBottom: PHOTO_GAP,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: COLORS.bgMid,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#fff',
  },
  emptyContainer: {
    paddingVertical: SPACING.huge,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    width: SCREEN_WIDTH - SPACING.lg * 2,
  },
});

export default PhotosTab;
