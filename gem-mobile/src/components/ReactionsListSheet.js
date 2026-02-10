/**
 * Gemral - Reactions List Sheet Component
 * Feature #12: See Who Reacted
 * Shows all users who reacted to a post with filtering
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Heart, ThumbsUp, Star, Flame, Laugh, Frown } from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../services/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ReactionsListSheet = ({
  visible,
  onClose,
  postId,
  onUserPress,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Reaction types with icons
  const REACTION_TYPES = useMemo(() => [
    { id: 'all', label: 'Tat ca', icon: null },
    { id: 'like', label: 'Thich', icon: ThumbsUp, color: colors.cyan },
    { id: 'love', label: 'Yeu', icon: Heart, color: '#FF6B6B' },
    { id: 'star', label: 'Tuyet', icon: Star, color: '#FFD700' },
    { id: 'fire', label: 'Hot', icon: Flame, color: '#FF6B35' },
    { id: 'laugh', label: 'Haha', icon: Laugh, color: '#FFB800' },
    { id: 'sad', label: 'Buon', icon: Frown, color: '#7B8794' },
  ], [colors]);

  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState([]);
  const [filteredReactions, setFilteredReactions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [reactionCounts, setReactionCounts] = useState({});
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    sheet: {
      borderTopLeftRadius: glass.borderRadius,
      borderTopRightRadius: glass.borderRadius,
      overflow: 'hidden',
      height: SCREEN_HEIGHT * 0.6,
    },
    blurContainer: {
      flex: 1,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    header: {
      alignItems: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      marginBottom: SPACING.sm,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },
    closeButton: {
      position: 'absolute',
      right: SPACING.lg,
      top: SPACING.lg,
      padding: SPACING.xs,
    },
    filterContainer: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    filterContent: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      gap: SPACING.sm,
    },
    filterTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      marginRight: SPACING.sm,
      gap: SPACING.xs,
    },
    filterTabActive: {
      backgroundColor: 'rgba(106, 91, 255, 0.2)',
    },
    filterLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    filterLabelActive: {
      color: colors.textPrimary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      paddingBottom: 50, // Safe area
    },
    reactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: SPACING.md,
    },
    avatarPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.purple,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    avatarText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    userName: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: colors.textPrimary,
    },
    reactionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      padding: SPACING.xxl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      loadReactions();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Reset state
      setReactions([]);
      setFilteredReactions([]);
      setSelectedFilter('all');
    }
  }, [visible, postId]);

  // Filter reactions when filter changes
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredReactions(reactions);
    } else {
      setFilteredReactions(reactions.filter(r => r.reaction_type === selectedFilter));
    }
  }, [selectedFilter, reactions]);

  /**
   * Fetch user data from both profiles and seed_users tables
   * Returns map of userId -> { id, full_name, avatar_url }
   */
  const fetchUserDataBatch = async (userIds) => {
    const userMap = new Map();

    if (!userIds || userIds.length === 0) return userMap;

    // Remove duplicates
    const uniqueIds = [...new Set(userIds)];

    try {
      // Query profiles table first (real users)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', uniqueIds);

      if (profilesData) {
        profilesData.forEach(user => {
          userMap.set(user.id, user);
        });
      }

      // Find which users were not found in profiles
      const missingIds = uniqueIds.filter(id => !userMap.has(id));

      // Query seed_users table for missing users
      if (missingIds.length > 0) {
        const { data: seedUsersData } = await supabase
          .from('seed_users')
          .select('id, full_name, avatar_url')
          .in('id', missingIds);

        if (seedUsersData) {
          seedUsersData.forEach(user => {
            userMap.set(user.id, user);
          });
        }
      }

      console.log(`[ReactionsListSheet] Fetched ${userMap.size} users from ${uniqueIds.length} IDs`);
    } catch (error) {
      console.error('[ReactionsListSheet] fetchUserDataBatch error:', error);
    }

    return userMap;
  };

  const loadReactions = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      // First try post_reactions table (for reactions with different types)
      // Query WITHOUT join - we'll fetch user data separately
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('post_reactions')
        .select('id, reaction_type, created_at, user_id')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      // Get likes from forum_likes table - try both post_id and seed_post_id
      // because likes can be stored with either column depending on post type
      const { data: likesDataByPostId } = await supabase
        .from('forum_likes')
        .select('id, created_at, user_id')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(100);

      const { data: likesDataBySeedPostId } = await supabase
        .from('forum_likes')
        .select('id, created_at, user_id')
        .eq('seed_post_id', postId)
        .order('created_at', { ascending: false })
        .limit(100);

      // Combine likes from both columns
      const likesData = [...(likesDataByPostId || []), ...(likesDataBySeedPostId || [])];

      // Combine both sources
      let allReactions = [];

      // Add reactions with types
      if (reactionsData && !reactionsError) {
        allReactions = [...reactionsData];
      }

      // Add likes (as 'like' reaction type)
      if (likesData && likesData.length > 0) {
        const likesAsReactions = likesData.map(like => ({
          ...like,
          reaction_type: 'like',
        }));
        allReactions = [...allReactions, ...likesAsReactions];
      }

      // Remove duplicates (same user might be in both tables)
      const uniqueUsers = new Map();
      allReactions.forEach(reaction => {
        const userId = reaction.user_id;
        if (userId && !uniqueUsers.has(userId)) {
          uniqueUsers.set(userId, reaction);
        }
      });

      const uniqueReactions = Array.from(uniqueUsers.values());

      // Collect all user IDs to fetch
      const userIds = uniqueReactions.map(r => r.user_id).filter(Boolean);

      // Batch fetch user data from both profiles and seed_users
      const userDataMap = await fetchUserDataBatch(userIds);

      // Merge user data into reactions
      const reactionsWithUsers = uniqueReactions.map(reaction => ({
        ...reaction,
        user: userDataMap.get(reaction.user_id) || {
          id: reaction.user_id,
          full_name: 'Nguoi dung',
          avatar_url: null,
        },
      }));

      // Sort by created_at
      reactionsWithUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setReactions(reactionsWithUsers);
      setFilteredReactions(reactionsWithUsers);

      // Calculate counts per reaction type
      const counts = reactionsWithUsers.reduce((acc, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
        return acc;
      }, {});
      counts.all = reactionsWithUsers.length;
      setReactionCounts(counts);

      console.log(`[ReactionsListSheet] Loaded ${reactionsWithUsers.length} reactions for post ${postId}`);
    } catch (error) {
      console.error('[ReactionsListSheet] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = useCallback((user) => {
    onClose?.();
    onUserPress?.(user);
  }, [onClose, onUserPress]);

  const renderFilterTab = ({ item }) => {
    const Icon = item.icon;
    const count = reactionCounts[item.id] || 0;
    const isActive = selectedFilter === item.id;

    if (item.id !== 'all' && count === 0) return null;

    return (
      <TouchableOpacity
        style={[styles.filterTab, isActive && styles.filterTabActive]}
        onPress={() => setSelectedFilter(item.id)}
        activeOpacity={0.7}
      >
        {Icon ? (
          <Icon
            size={16}
            color={isActive ? item.color : colors.textMuted}
          />
        ) : null}
        <Text
          style={[
            styles.filterLabel,
            isActive && styles.filterLabelActive,
          ]}
        >
          {count}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderReaction = ({ item }) => {
    const user = item.user;
    const reactionType = REACTION_TYPES.find(r => r.id === item.reaction_type);
    const Icon = reactionType?.icon || ThumbsUp;
    const color = reactionType?.color || colors.cyan;

    return (
      <TouchableOpacity
        style={styles.reactionItem}
        onPress={() => handleUserPress(user)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        {user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.full_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}

        {/* Name */}
        <Text style={styles.userName} numberOfLines={1}>
          {user?.full_name || 'Anonymous'}
        </Text>

        {/* Reaction Icon */}
        <View style={[styles.reactionIcon, { backgroundColor: `${color}20` }]}>
          <Icon size={16} color={color} />
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading ? 'Dang tai...' : 'Chua co ai tuong tac'}
      </Text>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />
              <Text style={styles.title}>Tuong tac</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
              <FlatList
                horizontal
                data={REACTION_TYPES}
                renderItem={renderFilterTab}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContent}
              />
            </View>

            {/* Reactions List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.purple} />
              </View>
            ) : (
              <FlatList
                data={filteredReactions}
                renderItem={renderReaction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={ListEmptyComponent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ReactionsListSheet;
