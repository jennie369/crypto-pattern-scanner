/**
 * ReactionUsersModal Component
 * Bottom sheet modal showing who reacted with which emoji
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ReactionUsersModal - Shows list of users who reacted
 *
 * @param {Object} props
 * @param {boolean} props.visible - Modal visibility
 * @param {Array} props.reactions - All reactions for the message
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onUserPress - Callback when user avatar/name is pressed
 */
const ReactionUsersModal = memo(({
  visible,
  reactions = [],
  onClose,
  onUserPress,
}) => {
  // ========== STATE ==========
  const [selectedTab, setSelectedTab] = useState('all');

  // ========== COMPUTED ==========
  const tabs = useMemo(() => {
    if (!reactions || reactions.length === 0) return [];

    // Get unique emojis and their counts
    const emojiCounts = {};
    reactions.forEach((r) => {
      emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1;
    });

    const tabList = [
      { key: 'all', label: 'Tất cả', count: reactions.length },
    ];

    Object.entries(emojiCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([emoji, count]) => {
        tabList.push({ key: emoji, label: emoji, count });
      });

    return tabList;
  }, [reactions]);

  const filteredReactions = useMemo(() => {
    if (selectedTab === 'all') return reactions;
    return reactions.filter((r) => r.emoji === selectedTab);
  }, [reactions, selectedTab]);

  // ========== HANDLERS ==========
  const handleUserPress = useCallback((userId) => {
    onUserPress?.(userId);
  }, [onUserPress]);

  // ========== RENDER ==========
  const renderTabItem = useCallback(({ item }) => {
    const isSelected = selectedTab === item.key;
    return (
      <TouchableOpacity
        style={[styles.tab, isSelected && styles.tabSelected]}
        onPress={() => setSelectedTab(item.key)}
        activeOpacity={0.7}
      >
        <Text style={styles.tabLabel}>{item.label}</Text>
        <Text style={[styles.tabCount, isSelected && styles.tabCountSelected]}>
          {item.count}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedTab]);

  const renderUserItem = useCallback(({ item }) => {
    const user = item.user;
    const displayName = user?.display_name || 'User';
    const avatarUrl = user?.avatar_url;

    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => handleUserPress(item.user_id)}
        activeOpacity={0.7}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <LinearGradient
            colors={GRADIENTS.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarFallback}
          >
            <Text style={styles.avatarInitials}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        )}
        <Text style={styles.userName} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.userEmoji}>{item.emoji}</Text>
      </TouchableOpacity>
    );
  }, [handleUserPress]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <BlurView intensity={60} style={styles.blurContainer}>
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Reactions</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <FlatList
                data={tabs}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                renderItem={renderTabItem}
                contentContainerStyle={styles.tabsList}
              />
            </View>

            {/* User List */}
            <FlatList
              data={filteredReactions}
              keyExtractor={(item) => `${item.user_id}-${item.emoji}-${item.id}`}
              renderItem={renderUserItem}
              contentContainerStyle={styles.usersList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Khong co reaction nao</Text>
                </View>
              }
            />
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

ReactionUsersModal.displayName = 'ReactionUsersModal';

export default ReactionUsersModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: SCREEN_HEIGHT * 0.6,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  blurContainer: {
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    paddingBottom: SPACING.huge,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  tabsList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    marginRight: SPACING.sm,
  },
  tabSelected: {
    backgroundColor: COLORS.gold + '30',
  },
  tabLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  tabCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  tabCountSelected: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  usersList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  userName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  userEmoji: {
    fontSize: 22,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
});
