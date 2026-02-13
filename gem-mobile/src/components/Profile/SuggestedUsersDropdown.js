/**
 * Gemral - Suggested Users Dropdown
 * Instagram-style "Suggested for you" dropdown
 * Shows after following a user
 *
 * Uses DESIGN_TOKENS v3.0
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Users, ChevronRight, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { suggestionService } from '../../services/suggestionService';
import { FollowButtonMini } from './FollowButton';

/**
 * SuggestedUsersDropdown - Dropdown showing suggested users after follow
 *
 * @param {Object} props
 * @param {boolean} props.visible - Show/hide dropdown
 * @param {string} props.followedUserId - User that was just followed (for similar suggestions)
 * @param {Function} props.onClose - Close dropdown callback
 * @param {Function} props.onFollowChange - Callback when follow status changes
 */
const SuggestedUsersDropdown = ({
  visible = false,
  followedUserId,
  onClose,
  onFollowChange,
}) => {
  const navigation = useNavigation();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      loadSuggestions();
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, followedUserId]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      let data;
      if (followedUserId) {
        // Get suggestions based on who was just followed
        data = await suggestionService.getDropdownSuggestions(followedUserId, 5);
      } else {
        // Get general suggestions
        data = await suggestionService.getSuggestedUsers(5);
      }
      setSuggestions(data || []);
    } catch (error) {
      console.error('[SuggestedDropdown] Load error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user) => {
    navigation.navigate('UserProfile', { userId: user.id });
    if (onClose) onClose();
  };

  const handleFollowChange = (isFollowing, userId) => {
    // Remove from suggestions if followed
    if (isFollowing) {
      setSuggestions(prev => prev.filter(u => u.id !== userId));
    }
    if (onFollowChange) {
      onFollowChange(isFollowing, userId);
    }
  };

  const handleViewAll = () => {
    // A4: SuggestedUsers screen doesn't exist — no-op until implemented
    console.warn('[SuggestedUsersDropdown] SuggestedUsers screen not yet implemented');
    if (onClose) onClose();
  };

  if (!visible) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={16} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Gợi ý cho bạn</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.purple} />
          <Text style={styles.loadingText}>Đang tải gợi ý...</Text>
        </View>
      ) : suggestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Không có gợi ý</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {suggestions.map((user) => (
            <SuggestionCard
              key={user.id}
              user={user}
              onPress={() => handleUserPress(user)}
              onFollowChange={handleFollowChange}
            />
          ))}
        </ScrollView>
      )}

      {/* Footer - View all */}
      {suggestions.length > 0 && (
        <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewAll}>
          <Text style={styles.viewAllText}>Xem tất cả gợi ý</Text>
          <ChevronRight size={16} color={COLORS.gold} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/**
 * SuggestionCard - Individual suggestion card
 */
const SuggestionCard = ({ user, onPress, onFollowChange }) => {
  const displayName = user.full_name || user.username || 'Người dùng';

  return (
    <View style={styles.cardContainer}>
      {/* Avatar */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.cardAvatar} />
        ) : (
          <LinearGradient colors={GRADIENTS.avatar} style={styles.cardAvatarPlaceholder}>
            <Text style={styles.cardAvatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* Name */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.cardName} numberOfLines={1}>
          {displayName}
        </Text>
        {user.username && (
          <Text style={styles.cardUsername} numberOfLines={1}>
            @{user.username}
          </Text>
        )}
      </TouchableOpacity>

      {/* Reason indicator */}
      {user.mutualCount > 0 && (
        <Text style={styles.cardMutual} numberOfLines={1}>
          {user.mutualCount} bạn chung
        </Text>
      )}
      {user.reason === 'popular' && (
        <Text style={styles.cardReason} numberOfLines={1}>
          Phổ biến
        </Text>
      )}

      {/* Follow button */}
      <FollowButtonMini
        userId={user.id}
        initialIsFollowing={user.isFollowedByMe}
        onFollowChange={onFollowChange}
      />

      {/* Remove button */}
      <TouchableOpacity style={styles.cardRemove}>
        <X size={12} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

/**
 * SuggestedUsersList - Full page list of suggestions
 */
export const SuggestedUsersList = ({
  suggestions = [],
  loading = false,
  onUserPress,
  onFollowChange,
  onLoadMore,
  hasMore = false,
}) => {
  const navigation = useNavigation();

  const handleUserPress = (user) => {
    if (onUserPress) {
      onUserPress(user);
    } else {
      navigation.navigate('UserProfile', { userId: user.id });
    }
  };

  if (loading && suggestions.length === 0) {
    return (
      <View style={styles.listLoadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.listLoadingText}>Đang tìm gợi ý...</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {suggestions.map((user) => (
        <SuggestionListItem
          key={user.id}
          user={user}
          onPress={() => handleUserPress(user)}
          onFollowChange={onFollowChange}
        />
      ))}

      {hasMore && (
        <TouchableOpacity style={styles.loadMoreBtn} onPress={onLoadMore}>
          <Text style={styles.loadMoreText}>Tải thêm gợi ý</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * SuggestionListItem - List item for full page
 */
const SuggestionListItem = ({ user, onPress, onFollowChange }) => {
  const displayName = user.full_name || user.username || 'Người dùng';

  return (
    <View style={styles.listItem}>
      {/* Avatar */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.listAvatar} />
        ) : (
          <LinearGradient colors={GRADIENTS.avatar} style={styles.listAvatarPlaceholder}>
            <Text style={styles.listAvatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* Info */}
      <TouchableOpacity style={styles.listInfo} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.listName} numberOfLines={1}>
          {displayName}
        </Text>
        {user.username && (
          <Text style={styles.listUsername} numberOfLines={1}>
            @{user.username}
          </Text>
        )}
        {user.mutualCount > 0 && (
          <View style={styles.listMutualRow}>
            <Users size={12} color={COLORS.textMuted} />
            <Text style={styles.listMutual}>
              {user.mutualCount} người quen chung
            </Text>
          </View>
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
  // Dropdown container
  container: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.inputBorder,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: SPACING.xs,
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },

  // Card
  cardContainer: {
    width: 130,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    position: 'relative',
  },
  cardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.bgMid,
  },
  cardAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarText: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  cardName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    maxWidth: 100,
  },
  cardUsername: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 100,
  },
  cardMutual: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  cardReason: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    marginTop: SPACING.xs,
  },
  cardRemove: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    padding: SPACING.xs,
  },

  // View all
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xs,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
  },

  // List styles
  listContainer: {
    paddingHorizontal: SPACING.lg,
  },
  listLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
  },
  listLoadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  listAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.bgMid,
  },
  listAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listAvatarText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  listInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.md,
  },
  listName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  listUsername: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  listMutualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xxs,
  },
  listMutual: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  loadMoreText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.purple,
  },
});

export default SuggestedUsersDropdown;
