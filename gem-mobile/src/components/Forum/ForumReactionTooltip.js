/**
 * ForumReactionTooltip Component
 * Bottom sheet modal showing all users who reacted to a post
 *
 * Features:
 * - Filter tabs by reaction type (All, Like, Love, etc.)
 * - User list with avatars and reaction icons
 * - Tap user to navigate to profile
 * - Loading/empty states
 * - Realtime updates
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { X, User as UserIcon } from 'lucide-react-native';
import ReactionIcon from './ReactionIcon';
import {
  REACTION_CONFIG,
  REACTION_ORDER,
} from '../../constants/reactions';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import reactionService from '../../services/reactionService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.65;

/**
 * ForumReactionTooltip - Bottom sheet showing reactors
 *
 * @param {Object} props
 * @param {boolean} props.visible - Show/hide modal
 * @param {string} props.postId - Post ID to fetch reactions for
 * @param {Object} props.reactionCounts - Reaction counts by type
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Function} props.onUserPress - Callback when user is pressed (userId) => void
 */
const ForumReactionTooltip = ({
  visible,
  postId,
  reactionCounts = {},
  onClose,
  onUserPress,
}) => {
  // State
  const [activeFilter, setActiveFilter] = useState('all');
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Animation values
  const backdropOpacity = useSharedValue(0);

  /**
   * Build filter tabs based on reaction counts
   */
  const filterTabs = [
    {
      key: 'all',
      label: 'Tất cả',
      count: reactionCounts?.total || 0,
      emoji: null,
    },
    ...REACTION_ORDER
      .filter((type) => (reactionCounts?.[type] || 0) > 0)
      .map((type) => ({
        key: type,
        label: REACTION_CONFIG[type]?.label,
        count: reactionCounts?.[type] || 0,
        emoji: REACTION_CONFIG[type]?.emoji,
        color: REACTION_CONFIG[type]?.color,
      })),
  ];

  /**
   * Fetch reactions when visible or filter changes
   */
  useEffect(() => {
    if (!visible || !postId) return;

    const fetchReactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const filterType = activeFilter === 'all' ? null : activeFilter;
        const data = await reactionService.getPostReactions(postId, filterType, 100);
        setReactions(data || []);
      } catch (err) {
        console.error('[ForumReactionTooltip] Fetch error:', err);
        setError('Không thể tải danh sách cảm xúc');
        setReactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReactions();
  }, [visible, postId, activeFilter]);

  /**
   * Handle visibility animation
   */
  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 150 });
      // Reset state on close
      setActiveFilter('all');
      setReactions([]);
    }
  }, [visible, backdropOpacity]);

  /**
   * Handle filter tab press
   */
  const handleFilterPress = useCallback((filterKey) => {
    setActiveFilter(filterKey);
  }, []);

  /**
   * Handle user item press
   */
  const handleUserPress = useCallback((userId) => {
    onUserPress?.(userId);
    onClose?.();
  }, [onUserPress, onClose]);

  /**
   * Render filter tab
   */
  const renderFilterTab = ({ item }) => {
    const isActive = activeFilter === item.key;

    return (
      <Pressable
        onPress={() => handleFilterPress(item.key)}
        style={[
          styles.filterTab,
          isActive && styles.filterTabActive,
        ]}
      >
        {item.emoji ? (
          <Text style={styles.filterEmoji}>{item.emoji}</Text>
        ) : null}
        <Text
          style={[
            styles.filterLabel,
            isActive && styles.filterLabelActive,
          ]}
        >
          {item.key === 'all' ? item.label : item.count}
        </Text>
      </Pressable>
    );
  };

  /**
   * Render user item
   */
  const renderUserItem = ({ item }) => {
    const config = REACTION_CONFIG[item.reaction_type];

    return (
      <Pressable
        onPress={() => handleUserPress(item.user_id)}
        style={styles.userItem}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.profile?.avatar_url ? (
            <Image
              source={{ uri: item.profile.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <UserIcon size={20} color={COLORS.textMuted} />
            </View>
          )}

          {/* Reaction badge */}
          <View style={[styles.reactionBadge, { backgroundColor: config?.color || COLORS.textMuted }]}>
            <Text style={styles.reactionBadgeEmoji}>{config?.emoji}</Text>
          </View>
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.profile?.display_name || 'Người dùng'}
          </Text>
          {item.profile?.username && (
            <Text style={styles.userHandle} numberOfLines={1}>
              @{item.profile.username}
            </Text>
          )}
        </View>

        {/* Reaction type label */}
        <Text style={[styles.reactionLabel, { color: config?.color || COLORS.textMuted }]}>
          {config?.label || item.reaction_type}
        </Text>
      </Pressable>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={COLORS.gold} size="large" />
          <Text style={styles.emptyText}>Đang tải...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có cảm xúc nào</Text>
      </View>
    );
  };

  /**
   * Animated backdrop style
   */
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(150)}
          style={styles.modalContainer}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 100}
            tint="dark"
            style={styles.blurView}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handleBar} />
              <Text style={styles.headerTitle}>Cảm xúc</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={24} color={COLORS.textMuted} />
              </Pressable>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
              <FlatList
                data={filterTabs}
                renderItem={renderFilterTab}
                keyExtractor={(item) => item.key}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterList}
              />
            </View>

            {/* Reactions List */}
            <FlatList
              data={reactions}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
            />
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  blurView: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? 'rgba(15, 16, 48, 0.98)' : 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  handleBar: {
    position: 'absolute',
    top: 8,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.md,
    padding: SPACING.sm,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SPACING.sm,
  },
  filterTabActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  filterLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterLabelActive: {
    color: COLORS.gold,
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(15, 16, 48, 0.98)',
  },
  reactionBadgeEmoji: {
    fontSize: 10,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  userHandle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  reactionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
});

export default memo(ForumReactionTooltip);
