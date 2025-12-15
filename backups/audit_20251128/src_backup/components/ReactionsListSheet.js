/**
 * Gemral - Reactions List Sheet Component
 * Feature #12: See Who Reacted
 * Shows all users who reacted to a post with filtering
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import { supabase } from '../services/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reaction types with icons
const REACTION_TYPES = [
  { id: 'all', label: 'Tất cả', icon: null },
  { id: 'like', label: 'Thích', icon: ThumbsUp, color: COLORS.cyan },
  { id: 'love', label: 'Yêu', icon: Heart, color: '#FF6B6B' },
  { id: 'star', label: 'Tuyệt', icon: Star, color: '#FFD700' },
  { id: 'fire', label: 'Hot', icon: Flame, color: '#FF6B35' },
  { id: 'laugh', label: 'Haha', icon: Laugh, color: '#FFB800' },
  { id: 'sad', label: 'Buồn', icon: Frown, color: '#7B8794' },
];

const ReactionsListSheet = ({
  visible,
  onClose,
  postId,
  onUserPress,
}) => {
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState([]);
  const [filteredReactions, setFilteredReactions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [reactionCounts, setReactionCounts] = useState({});
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

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

  const loadReactions = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select(`
          id,
          reaction_type,
          created_at,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReactions(data || []);
      setFilteredReactions(data || []);

      // Calculate counts per reaction type
      const counts = (data || []).reduce((acc, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
        return acc;
      }, {});
      counts.all = data?.length || 0;
      setReactionCounts(counts);
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
            color={isActive ? item.color : COLORS.textMuted}
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
    const color = reactionType?.color || COLORS.cyan;

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
        {loading ? 'Đang tải...' : 'Chưa có ai tương tác'}
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
              <Text style={styles.title}>Tương tác</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={COLORS.textMuted} />
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
                <ActivityIndicator color={COLORS.purple} />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
    overflow: 'hidden',
    height: SCREEN_HEIGHT * 0.6,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: GLASS.background,
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
    color: COLORS.textPrimary,
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
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  filterLabelActive: {
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  userName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
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
    color: COLORS.textMuted,
  },
});

export default ReactionsListSheet;
