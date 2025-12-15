/**
 * Gemral - Videos Tab Component
 * Grid display of user's videos
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
import { Video, Play } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const VIDEO_GAP = 8;
const VIDEO_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - VIDEO_GAP) / NUM_COLUMNS;
const VIDEO_HEIGHT = VIDEO_WIDTH * 1.5; // 2:3 aspect ratio for video thumbnails

const VideosTab = ({
  videos,
  loading,
  onVideoPress,
  onEndReached,
  hasMore,
}) => {
  const renderVideo = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.videoItem,
        {
          marginRight: (index + 1) % NUM_COLUMNS !== 0 ? VIDEO_GAP : 0,
        },
      ]}
      onPress={() => onVideoPress?.(item)}
      activeOpacity={0.8}
    >
      {/* Video Thumbnail */}
      {item.thumbnail_url ? (
        <Image
          source={{ uri: item.thumbnail_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderThumbnail}>
          <Video size={32} color={COLORS.textMuted} />
        </View>
      )}

      {/* Play Button Overlay */}
      <View style={styles.playOverlay}>
        <View style={styles.playButton}>
          <Play size={20} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
        </View>
      </View>

      {/* Duration Badge */}
      {item.duration && (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Video size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chưa có video</Text>
      <Text style={styles.emptySubtitle}>
        Video sẽ xuất hiện ở đây khi được đăng
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

  if (loading && videos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {videos.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideo}
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
  videoItem: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    marginBottom: VIDEO_GAP,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.bgMid,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3, // Offset for play icon
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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

export default VideosTab;
