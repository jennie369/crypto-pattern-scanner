/**
 * GEM Platform - Profile Stats Component
 * Shows posts count, followers count, following count
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const ProfileStats = ({
  postsCount = 0,
  followersCount = 0,
  followingCount = 0,
  onPostsPress,
  onFollowersPress,
  onFollowingPress,
}) => {
  // Format number (1000 -> 1K, 1000000 -> 1M)
  const formatCount = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Posts Count */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={onPostsPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{formatCount(postsCount)}</Text>
        <Text style={styles.statLabel}>Bài viết</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Followers Count */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={onFollowersPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{formatCount(followersCount)}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Following Count */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={onFollowingPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{formatCount(followingCount)}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 16,
    paddingVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
  },
});

export default ProfileStats;
