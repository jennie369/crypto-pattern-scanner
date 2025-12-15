/**
 * Gemral - Image Grid Component
 * Instagram-style 3-column grid for profile view
 */

import React from 'react';
import { View, Image, TouchableOpacity, Dimensions, StyleSheet, Text } from 'react-native';
import { Play, ImageIcon } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ImageGrid = ({
  posts = [],
  columns = 3,
  spacing = 2,
  onPostPress,
  showEmpty = true,
  emptyMessage = 'Chưa có bài viết nào'
}) => {
  // Calculate item dimensions
  const itemWidth = (SCREEN_WIDTH - (spacing * (columns - 1))) / columns;
  const itemHeight = itemWidth * (4 / 3); // 3:4 aspect ratio

  // Filter posts that have images
  const imagePosts = posts.filter(post => post.image_url || post.thumbnail_url);

  if (imagePosts.length === 0 && showEmpty) {
    return (
      <View style={styles.emptyContainer}>
        <ImageIcon size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {imagePosts.map((post, index) => {
        const isLastInRow = (index + 1) % columns === 0;
        const imageUrl = post.thumbnail_url || post.image_url;

        return (
          <TouchableOpacity
            key={post.id}
            style={[
              styles.gridItem,
              {
                width: itemWidth,
                height: itemHeight,
                marginRight: isLastInRow ? 0 : spacing,
                marginBottom: spacing
              }
            ]}
            onPress={() => onPostPress?.(post)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.gridImage}
              resizeMode="cover"
            />

            {/* Multi-image indicator */}
            {post.media_urls && post.media_urls.length > 1 && (
              <View style={styles.multiIndicator}>
                <Text style={styles.multiText}>
                  {post.media_urls.length}
                </Text>
              </View>
            )}

            {/* Video indicator (for future use) */}
            {post.video_url && (
              <View style={styles.videoIndicator}>
                <Play size={16} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  gridItem: {
    backgroundColor: COLORS.glassBg,
    overflow: 'hidden',
    position: 'relative'
  },
  gridImage: {
    width: '100%',
    height: '100%'
  },
  multiIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4
  },
  multiText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  videoIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.lg
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center'
  }
});

export default ImageGrid;
