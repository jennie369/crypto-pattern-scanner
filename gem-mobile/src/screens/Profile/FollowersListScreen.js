/**
 * Gemral - Followers List Screen
 * Instagram/TikTok style followers list
 *
 * Uses DESIGN_TOKENS v3.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, Search } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { followService } from '../../services/followService';
import { FollowButtonMini } from '../../components/Profile/FollowButton';

const FollowersListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, username } = route.params || {};

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  useEffect(() => {
    loadFollowers(1, true);
  }, [userId]);

  const loadFollowers = async (pageNum = 1, reset = false) => {
    if (!userId) return;

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await followService.getFollowers(userId, pageNum, LIMIT);

      if (reset) {
        setFollowers(data);
      } else {
        setFollowers(prev => [...prev, ...data]);
      }

      setHasMore(data.length === LIMIT);
      setPage(pageNum);
    } catch (error) {
      console.error('[FollowersList] Load error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFollowers(1, true);
  }, [userId]);

  const onLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadFollowers(page + 1, false);
    }
  }, [loadingMore, hasMore, page]);

  const handleUserPress = (user) => {
    navigation.push('UserProfile', { userId: user.id });
  };

  const handleFollowChange = (isFollowing, targetUserId) => {
    setFollowers(prev =>
      prev.map(user =>
        user.id === targetUserId
          ? { ...user, isFollowedByMe: isFollowing }
          : user
      )
    );
  };

  const renderItem = ({ item }) => (
    <FollowerItem
      user={item}
      onPress={() => handleUserPress(item)}
      onFollowChange={handleFollowChange}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Users size={48} color={COLORS.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>Chưa có người theo dõi</Text>
        <Text style={styles.emptySubtitle}>
          Khi có người theo dõi, họ sẽ xuất hiện ở đây
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.purple} />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Người theo dõi</Text>
            {username && (
              <Text style={styles.headerSubtitle}>@{username}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.searchBtn}>
            <Search size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading && followers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={followers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.purple}
                colors={[COLORS.purple]}
              />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

/**
 * FollowerItem - Individual follower row
 */
const FollowerItem = ({ user, onPress, onFollowChange }) => {
  const displayName = user.full_name || user.username || 'Người dùng';

  return (
    <View style={styles.itemContainer}>
      {/* Avatar */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <LinearGradient colors={GRADIENTS.avatar} style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* Info */}
      <TouchableOpacity
        style={styles.itemInfo}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.itemName} numberOfLines={1}>
          {displayName}
        </Text>
        {user.username && (
          <Text style={styles.itemUsername} numberOfLines={1}>
            @{user.username}
          </Text>
        )}
        {user.bio && (
          <Text style={styles.itemBio} numberOfLines={1}>
            {user.bio}
          </Text>
        )}
      </TouchableOpacity>

      {/* Follow button */}
      <FollowButtonMini
        userId={user.id}
        initialIsFollowing={user.isFollowedByMe}
        onFollowChange={onFollowChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
    backgroundColor: GLASS.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  searchBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },

  // List
  listContent: {
    paddingVertical: SPACING.sm,
    flexGrow: 1,
  },

  // Item
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.bgMid,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.md,
  },
  itemName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  itemUsername: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },
  itemBio: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
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

  // Footer
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
});

export default FollowersListScreen;
