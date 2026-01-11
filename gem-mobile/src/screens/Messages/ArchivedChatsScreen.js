/**
 * ArchivedChatsScreen
 * Screen for viewing and managing archived conversations
 *
 * Features:
 * - List archived conversations
 * - Unarchive single conversation
 * - Bulk unarchive with selection mode
 * - Navigate to chat on tap
 * - Pull to refresh
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import messagingService from '../../services/messagingService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../utils/tokens';

// Utils
import { formatRelativeTime } from '../../utils/formatters';

export default function ArchivedChatsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchArchivedConversations = useCallback(async () => {
    try {
      const data = await messagingService.getArchivedConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching archived conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedConversations();
  }, [fetchArchivedConversations]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchArchivedConversations();
  }, [fetchArchivedConversations]);

  const handleConversationPress = useCallback((conversation) => {
    if (selectionMode) {
      // Toggle selection
      setSelectedIds(prev => {
        if (prev.includes(conversation.id)) {
          return prev.filter(id => id !== conversation.id);
        } else {
          return [...prev, conversation.id];
        }
      });
    } else {
      // Navigate to chat
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        conversation,
      });
    }
  }, [selectionMode, navigation]);

  const handleLongPress = useCallback((conversation) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds([conversation.id]);
    }
  }, [selectionMode]);

  const handleUnarchiveSingle = useCallback(async (conversationId) => {
    try {
      await messagingService.unarchiveConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
    }
  }, []);

  const handleBulkUnarchive = useCallback(async () => {
    if (selectedIds.length === 0) return;

    setIsUnarchiving(true);
    try {
      await messagingService.bulkUnarchive(selectedIds);
      setConversations(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Error bulk unarchiving:', error);
    } finally {
      setIsUnarchiving(false);
    }
  }, [selectedIds]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === conversations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(conversations.map(c => c.id));
    }
  }, [selectedIds.length, conversations]);

  // =====================================================
  // RENDER
  // =====================================================

  const getDisplayName = (conversation) => {
    if (conversation.is_group) {
      return conversation.name || 'Nhóm chat';
    }
    return conversation.other_participant?.display_name || 'Người dùng';
  };

  const getAvatar = (conversation) => {
    if (conversation.is_group) {
      return conversation.group_avatar_url;
    }
    return conversation.other_participant?.avatar_url;
  };

  const renderConversationItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    const displayName = getDisplayName(item);
    const avatarUrl = getAvatar(item);
    const lastMessage = item.latest_message?.content || 'Không có tin nhắn';
    const archivedAt = item.archived_at ? formatRelativeTime(item.archived_at) : '';

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          isSelected && styles.conversationItemSelected,
        ]}
        onPress={() => handleConversationPress(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
        delayLongPress={300}
      >
        {/* Selection checkbox */}
        {selectionMode && (
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected,
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={14} color={COLORS.bgDarkest} />
              )}
            </View>
          </View>
        )}

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons
                name={item.is_group ? 'people' : 'person'}
                size={24}
                color={COLORS.textMuted}
              />
            </View>
          )}
          {item.is_group && (
            <View style={styles.groupBadge}>
              <Ionicons name="people" size={10} color={COLORS.textPrimary} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.archivedTime}>{archivedAt}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>

        {/* Unarchive button (when not in selection mode) */}
        {!selectionMode && (
          <TouchableOpacity
            style={styles.unarchiveButton}
            onPress={() => handleUnarchiveSingle(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-undo-outline" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="archive-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Chưa có tin nhắn lưu trữ</Text>
      <Text style={styles.emptySubtitle}>
        Vuốt để lưu trữ các cuộc trò chuyện từ danh sách tin nhắn
      </Text>
    </View>
  );

  const renderHeader = () => {
    if (selectionMode) {
      return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.selectionHeader}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCancelSelection}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <Text style={styles.selectionCount}>
              Đã chọn {selectedIds.length}
            </Text>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSelectAll}
            >
              <Text style={styles.selectAllText}>
                {selectedIds.length === conversations.length ? 'Bỏ chọn' : 'Chọn tất cả'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.titleRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Tin nhắn lưu trữ</Text>
          <View style={styles.placeholder} />
        </View>

        {conversations.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              Nhấn giữ để chọn nhiều cuộc trò chuyện
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!selectionMode || selectedIds.length === 0) return null;

    return (
      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity
          style={styles.bulkUnarchiveButton}
          onPress={handleBulkUnarchive}
          disabled={isUnarchiving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.primaryButton}
            style={styles.bulkUnarchiveGradient}
          >
            {isUnarchiving ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <>
                <Ionicons name="arrow-undo" size={20} color={COLORS.textPrimary} />
                <Text style={styles.bulkUnarchiveText}>
                  Bỏ lưu trữ ({selectedIds.length})
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.titleRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Tin nhắn lưu trữ</Text>
            <View style={styles.placeholder} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {renderHeader()}

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {renderFooter()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Selection header
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  headerButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  selectAllText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gold,
  },
  selectionCount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // List
  listContent: {
    paddingBottom: SPACING.huge,
  },
  listContentEmpty: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Conversation item
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  conversationItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },

  // Checkbox
  checkboxContainer: {
    marginRight: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgDarkest,
  },

  // Content
  contentContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  displayName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  archivedTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  lastMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Unarchive button
  unarchiveButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },
  bulkUnarchiveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bulkUnarchiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  bulkUnarchiveText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});
