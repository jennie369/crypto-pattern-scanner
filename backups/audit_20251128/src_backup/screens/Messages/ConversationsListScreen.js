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
  TextInput,
  RefreshControl,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import messagingService from '../../services/messagingService';
import presenceService from '../../services/presenceService';

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
  GLASS,
  ANIMATION,
  LAYOUT,
} from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ConversationsListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Animation refs
  const searchWidthAnim = useRef(new Animated.Value(SCREEN_WIDTH - 32 - 50)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  // Subscription refs
  const unreadSubscription = useRef(null);

  // =====================================================
  // FETCH & REAL-TIME
  // =====================================================

  const fetchConversations = useCallback(async () => {
    try {
      const data = await messagingService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConversations();

    // Subscribe to unread count changes for badge updates
    if (user?.id) {
      unreadSubscription.current = messagingService.subscribeToUnreadCount(
        user.id,
        () => {
          // Refresh conversations when unread count changes
          fetchConversations();
        }
      );
    }

    return () => {
      if (unreadSubscription.current) {
        messagingService.unsubscribe(unreadSubscription.current);
      }
    };
  }, [user?.id, fetchConversations]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
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
      // TODO: Implement archive functionality
      console.log('Archive conversation:', conversationId);
      // Update local state to remove from list
      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  }, []);

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

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
    Animated.spring(searchWidthAnim, {
      toValue: SCREEN_WIDTH - 32,
      tension: 65,
      friction: 11,
      useNativeDriver: false,
    }).start();
  }, [searchWidthAnim]);

  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
    if (!searchQuery) {
      Animated.spring(searchWidthAnim, {
        toValue: SCREEN_WIDTH - 32 - 50,
        tension: 65,
        friction: 11,
        useNativeDriver: false,
      }).start();
    }
  }, [searchWidthAnim, searchQuery]);

  // =====================================================
  // FILTERED DATA
  // =====================================================

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    // Search by other participant name
    const otherParticipant = conv.other_participant;
    if (otherParticipant?.display_name?.toLowerCase().includes(query)) {
      return true;
    }

    // Search by group name
    if (conv.name?.toLowerCase().includes(query)) {
      return true;
    }

    // Search by last message content
    if (conv.latest_message?.content?.toLowerCase().includes(query)) {
      return true;
    }

    return false;
  });

  // =====================================================
  // RENDER
  // =====================================================

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <Animated.View style={[styles.searchContainer, { width: searchWidthAnim }]}>
          <BlurView intensity={20} style={styles.searchBlur}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search messages..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </BlurView>
        </Animated.View>

        {/* Action Buttons */}
        {!searchFocused && (
          <View style={styles.actionButtons}>
            {/* Search Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSearch}
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Create Group Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreateGroup}
              activeOpacity={0.7}
            >
              <Ionicons name="people-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* New Message Button */}
            <TouchableOpacity
              style={styles.newMessageButton}
              onPress={handleNewConversation}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.purple, COLORS.cyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.newMessageGradient}
              >
                <Ionicons name="create-outline" size={20} color={COLORS.textPrimary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a conversation with someone from the community
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
          <Text style={styles.emptyButtonText}>Start Chatting</Text>
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
          <Text style={styles.title}>Messages</Text>
          <View style={styles.placeholder} />
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
          length: 76,
          offset: 76 * index,
          index,
        })}
      />
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
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchContainer: {
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
  },

  // New Message Button
  newMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newMessageGradient: {
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
