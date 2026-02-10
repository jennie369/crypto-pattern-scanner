/**
 * Gemral - Stories Row Component
 * Feature #21: Horizontal scrolling stories list
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import { storyService } from '../services/storyService';
import { useAuth } from '../contexts/AuthContext';

const StoriesRow = ({ onStoryPress, onCreatePress, onRefresh }) => {
  const { user, isAuthenticated } = useAuth();
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const [followingData, myData] = await Promise.all([
        storyService.getFollowingStories(),
        isAuthenticated ? storyService.getMyStories() : [],
      ]);

      setStories(followingData);
      setMyStories(myData);
    } catch (error) {
      console.error('[StoriesRow] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (userData) => {
    if (userData?.avatar_url) return userData.avatar_url;
    const name = userData?.full_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6A5BFF&color=fff`;
  };

  const handleStoryPress = (storyGroup, index) => {
    onStoryPress?.(storyGroup, index);
  };

  const handleMyStoryPress = () => {
    if (myStories.length > 0) {
      // View own stories
      onStoryPress?.({ user, stories: myStories, isOwn: true }, 0);
    } else {
      // Create new story
      onCreatePress?.();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.purple} />
      </View>
    );
  }

  if (stories.length === 0 && myStories.length === 0 && !isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* My Story / Add Story */}
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.storyItem}
            onPress={handleMyStoryPress}
            activeOpacity={0.8}
          >
            <View style={styles.storyAvatarContainer}>
              {myStories.length > 0 ? (
                <LinearGradient
                  colors={[COLORS.purple, COLORS.cyan]}
                  style={styles.storyRing}
                >
                  <Image
                    source={{ uri: getAvatarUrl(user) }}
                    style={styles.storyAvatar}
                  />
                </LinearGradient>
              ) : (
                <View style={styles.addStoryContainer}>
                  <Image
                    source={{ uri: getAvatarUrl(user) }}
                    style={styles.storyAvatarDimmed}
                  />
                  <View style={styles.addBadge}>
                    <Plus size={12} color={COLORS.textPrimary} />
                  </View>
                </View>
              )}
            </View>
            <Text style={styles.storyName} numberOfLines={1}>
              {myStories.length > 0 ? 'Tin cua ban' : 'Them tin'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Following Stories */}
        {stories.map((storyGroup, index) => {
          const hasUnviewed = storyGroup.hasUnviewed;

          return (
            <TouchableOpacity
              key={storyGroup.user.id}
              style={styles.storyItem}
              onPress={() => handleStoryPress(storyGroup, index)}
              activeOpacity={0.8}
            >
              <View style={styles.storyAvatarContainer}>
                {hasUnviewed ? (
                  <LinearGradient
                    colors={[COLORS.purple, COLORS.cyan]}
                    style={styles.storyRing}
                  >
                    <Image
                      source={{ uri: getAvatarUrl(storyGroup.user) }}
                      style={styles.storyAvatar}
                    />
                  </LinearGradient>
                ) : (
                  <View style={styles.storyRingViewed}>
                    <Image
                      source={{ uri: getAvatarUrl(storyGroup.user) }}
                      style={styles.storyAvatar}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {storyGroup.user.full_name?.split(' ')[0] || 'User'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

/**
 * Story Avatar Component - For individual story indicators
 */
export const StoryAvatar = ({
  user,
  hasStory = false,
  hasUnviewed = false,
  size = 'medium',
  onPress,
}) => {
  const avatarSize = size === 'small' ? 40 : size === 'large' ? 64 : 52;
  const ringSize = avatarSize + 6;

  const getAvatarUrl = () => {
    if (user?.avatar_url) return user.avatar_url;
    const name = user?.full_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6A5BFF&color=fff`;
  };

  if (!hasStory) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <Image
          source={{ uri: getAvatarUrl() }}
          style={[avatarStyles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      {hasUnviewed ? (
        <LinearGradient
          colors={[COLORS.purple, COLORS.cyan]}
          style={[
            avatarStyles.ring,
            { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
          ]}
        >
          <Image
            source={{ uri: getAvatarUrl() }}
            style={[avatarStyles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
          />
        </LinearGradient>
      ) : (
        <View
          style={[
            avatarStyles.ringViewed,
            { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
          ]}
        >
          <Image
            source={{ uri: getAvatarUrl() }}
            style={[avatarStyles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingContainer: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  // Story Item
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  storyAvatarContainer: {
    marginBottom: SPACING.xs,
  },
  storyRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRingViewed: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.textMuted,
  },
  storyAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: GLASS.background,
    backgroundColor: COLORS.glassBg,
  },
  storyAvatarDimmed: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: GLASS.background,
    backgroundColor: COLORS.glassBg,
    opacity: 0.7,
  },
  storyName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 65,
  },
  // Add Story
  addStoryContainer: {
    position: 'relative',
  },
  addBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GLASS.background,
  },
});

const avatarStyles = StyleSheet.create({
  ring: {
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringViewed: {
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.textMuted,
  },
  avatar: {
    borderWidth: 2,
    borderColor: GLASS.background,
    backgroundColor: COLORS.glassBg,
  },
});

export default StoriesRow;
