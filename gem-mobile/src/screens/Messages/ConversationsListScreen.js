/**
 * Gemral - Conversations List Screen
 * TikTok-style messaging with glass-morphism UI
 *
 * Features:
 * - Real-time conversation updates
 * - Unread count badges
 * - Online status indicators
 * - Search conversations
 * - Swipe actions (archive, delete)
 * - Pull-to-refresh
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import messagingService from '../../services/messagingService';
import presenceService from '../../services/presenceService';
import { messageRequestService } from '../../services/messageRequestService';
import cacheService from '../../services/cacheService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Components
import SwipeableConversationItem from './components/SwipeableConversationItem';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../utils/tokens';

export default function ConversationsListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [archivedIds, setArchivedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messageRequestsCount, setMessageRequestsCount] = useState(0);

  // Animation refs
  const headerOpacity = useRef(new Animated.Value(1)).current;

  // Subscription refs
  const unreadSubscription = useRef(null);

  // =====================================================
  // FETCH & REAL-TIME
  // =====================================================

  // Load cached data immediately (synchronous-like behavior)
  const loadCachedData = useCallback(async () => {
    if (!user?.id) return false;

    try {
      const [cachedConvos, cachedPinned, cachedArchived] = await Promise.all([
        cacheService.getForUser('CONVERSATIONS', user.id),
        cacheService.getForUser('PINNED_CONVERSATIONS', user.id),
        cacheService.getForUser('ARCHIVED_CONVERSATIONS', user.id),
      ]);

      if (cachedConvos && cachedConvos.length > 0) {
        console.log('[ConversationsList] Loaded from cache:', cachedConvos.length);
        setConversations(cachedConvos);
        setPinnedIds(cachedPinned || []);
        setArchivedIds(cachedArchived || []);
        setLoading(false); // Show cached data immediately
        return true;
      }
      return false;
    } catch (error) {
      console.error('[ConversationsList] Cache load error:', error);
      return false;
    }
  }, [user?.id]);

  const fetchConversations = useCallback(async (isBackgroundRefresh = false) => {
    try {
      // Fetch conversations, pinned IDs, archived IDs, and message requests count in parallel
      const [data, pinnedData, archivedData, requestsCount] = await Promise.all([
        messagingService.getConversations(),
        messagingService.getPinnedConversationIds(),
        messagingService.getArchivedConversationIds(),
        messageRequestService.getMessageRequestsCount(),
      ]);

      // Update state
      setConversations(data);
      const pinnedArray = pinnedData?.data || pinnedData || [];
      setPinnedIds(pinnedArray);
      setArchivedIds(archivedData || []);
      setMessageRequestsCount(requestsCount || 0);

      // Save to cache for instant load next time
      if (user?.id) {
        await Promise.all([
          cacheService.setForUser('CONVERSATIONS', user.id, data),
          cacheService.setForUser('PINNED_CONVERSATIONS', user.id, pinnedArray),
          cacheService.setForUser('ARCHIVED_CONVERSATIONS', user.id, archivedData || []),
        ]);
        console.log('[ConversationsList] Saved to cache');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, [user?.id]);

  // Initial load - cache first, then fetch fresh data
  useEffect(() => {
    const initializeConversations = async () => {
      // Step 1: Load cached data immediately (shows instantly)
      const hasCache = await loadCachedData();

      // Step 2: Fetch fresh data (background if cache exists, foreground if not)
      fetchConversations(hasCache);
    };

    initializeConversations();

    // Subscribe to unread count changes for badge updates
    if (user?.id) {
      unreadSubscription.current = messagingService.subscribeToUnreadCount(
        user.id,
        () => {
          // Refresh conversations when unread count changes
          fetchConversations(true); // Background refresh
        }
      );
    }

    return () => {
      if (unreadSubscription.current) {
        messagingService.unsubscribe(unreadSubscription.current);
      }
    };
  }, [user?.id, fetchConversations, loadCachedData]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations(false); // Show refresh indicator
  }, [fetchConversations]);

  const handleConversationPress = useCallback((conversation) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      conversation,
    });
  }, [navigation]);

  const handleNewConversation = useCallback(() => {
    navigation.navigate('NewConversation');
  }, [navigation]);

  const handleCreateGroup = useCallback(() => {
    navigation.navigate('CreateGroup');
  }, [navigation]);

  const handleSearch = useCallback(() => {
    navigation.navigate('MessageSearch');
  }, [navigation]);

  // Swipe actions
  const handleArchive = useCallback(async (conversationId) => {
    try {
      await messagingService.archiveConversation(conversationId);
      // Update local state to remove from list and add to archived
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      setArchivedIds(prev => [...prev, conversationId]);
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  }, []);

  // Navigate to archived chats
  const handleOpenArchived = useCallback(() => {
    navigation.navigate('ArchivedChats');
  }, [navigation]);

  const handleDelete = useCallback(async (conversationId) => {
    try {
      await messagingService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, []);

  const handleMute = useCallback(async (conversationId) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        await messagingService.toggleMute(conversationId, !conversation.is_muted);
        setConversations(prev => prev.map(c =>
          c.id === conversationId ? { ...c, is_muted: !c.is_muted } : c
        ));
      }
    } catch (error) {
      console.error('Error muting conversation:', error);
    }
  }, [conversations]);

  const handlePin = useCallback(async (conversationId) => {
    try {
      const isPinned = pinnedIds.includes(conversationId);
      if (isPinned) {
        await messagingService.unpinConversation(conversationId);
        setPinnedIds(prev => prev.filter(id => id !== conversationId));
      } else {
        // Check max 5 pinned
        if (pinnedIds.length >= 5) {
          // Could show alert here
          console.warn('Maximum 5 pinned conversations allowed');
          return;
        }
        await messagingService.pinConversation(conversationId);
        setPinnedIds(prev => [...prev, conversationId]);
      }
    } catch (error) {
      console.error('Error pinning/unpinning conversation:', error);
    }
  }, [pinnedIds]);

  // =====================================================
  // FILTERED DATA
  // =====================================================

  // Filter and sort conversations (exclude archived, pinned first)
  const filteredConversations = conversations
    .filter((conv) => !archivedIds.includes(conv.id))
    .sort((a, b) => {
      // Pinned conversations first
      const aIsPinned = pinnedIds.includes(a.id);
      const bIsPinned = pinnedIds.includes(b.id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0; // Keep original order otherwise
    });

  // Count archived conversations
  const archivedCount = archivedIds.length;

  // =====================================================
  // RENDER
  // =====================================================

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
      {/* Search Bar - Full width like Facebook */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={handleSearch}
        activeOpacity={0.7}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm</Text>
        </View>
      </TouchableOpacity>

      {/* Message Requests Row */}
      {messageRequestsCount > 0 && (
        <TouchableOpacity
          style={styles.archivedRow}
          onPress={() => navigation.navigate('MessageRequests')}
          activeOpacity={0.7}
        >
          <View style={[styles.archivedIcon, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
            <Ionicons name="mail-unread" size={20} color={COLORS.gold} />
          </View>
          <Text style={styles.archivedText}>Yêu cầu tin nhắn</Text>
          <View style={[styles.archivedBadge, { backgroundColor: COLORS.gold }]}>
            <Text style={[styles.archivedBadgeText, { color: COLORS.background }]}>{messageRequestsCount}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}

      {/* Quick Actions Row - Archive badge only if has archived */}
      {archivedCount > 0 && (
        <TouchableOpacity
          style={styles.archivedRow}
          onPress={handleOpenArchived}
          activeOpacity={0.7}
        >
          <View style={styles.archivedIcon}>
            <Ionicons name="archive" size={20} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.archivedText}>Đã lưu trữ</Text>
          <View style={styles.archivedBadge}>
            <Text style={styles.archivedBadgeText}>{archivedCount}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={GRADIENTS.glassBorder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textPrimary} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
      <Text style={styles.emptySubtitle}>
        Bắt đầu trò chuyện với ai đó từ cộng đồng
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleNewConversation}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={GRADIENTS.primaryButton}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>Bắt đầu trò chuyện</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderConversation = ({ item, index }) => (
    <SwipeableConversationItem
      conversation={item}
      currentUserId={user?.id}
      onPress={() => handleConversationPress(item)}
      onArchive={handleArchive}
      onDelete={handleDelete}
      onMute={handleMute}
      onPin={handlePin}
      isPinned={pinnedIds.includes(item.id)}
      index={index}
    />
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.titleRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Tin nhắn</Text>
          <View style={styles.headerActions}>
            {/* Call History */}
            <TouchableOpacity
              onPress={() => navigation.navigate('CallHistory')}
              style={styles.headerAction}
            >
              <Ionicons name="call-outline" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            {/* Privacy Settings */}
            <TouchableOpacity
              onPress={() => navigation.navigate('PrivacySettings')}
              style={styles.headerAction}
            >
              <Ionicons name="shield-outline" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            {/* Create Group */}
            <TouchableOpacity
              onPress={handleCreateGroup}
              style={styles.headerAction}
            >
              <Ionicons name="people-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
        {renderHeader()}
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredConversations.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        windowSize={10}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={15}
        getItemLayout={(data, index) => ({
          length: 72,
          offset: 72 * index,
          index,
        })}
      />

      {/* Floating Action Button - New Message */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={handleNewConversation}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[COLORS.purple, COLORS.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="create-outline" size={26} color={COLORS.textPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  headerContainer: {
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },

  // Facebook-style Search Bar
  searchContainer: {
    marginBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },

  // Archived Row
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    gap: SPACING.sm,
  },
  archivedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivedText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  archivedBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  archivedBadgeText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // FAB - Floating Action Button
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listContent: {
    paddingBottom: SPACING.huge,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.xl,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});
