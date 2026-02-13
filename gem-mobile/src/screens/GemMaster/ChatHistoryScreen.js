/**
 * Gemral - Chat History Screen
 *
 * Full-featured chat history page with:
 * - Search bar
 * - Filter tabs (All | Archived)
 * - Paginated list with pull-to-refresh
 * - Swipe-to-delete
 * - Delete confirmation modal
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import alertService from '../../services/alertService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Search,
  X,
} from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import chatHistoryService from '../../services/chatHistoryService';
import ConversationCard from './components/ConversationCard';
import EmptyHistoryState from './components/EmptyHistoryState';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'archived', label: 'Đã lưu trữ' },
];

const ChatHistoryScreen = ({ navigation, route }) => {
  const { onLoadConversation } = route.params || {};

  // State
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [hasCachedData, setHasCachedData] = useState(false);

  // Filter & Search state
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const searchTimeoutRef = useRef(null);

  // Get current user AND load cached data immediately
  useEffect(() => {
    const initializeScreen = async () => {
      // Get user first
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // Try to load cached data immediately (no search, first page)
        const cached = await chatHistoryService.getCachedConversations(currentUser.id, false);
        if (cached?.data?.conversations?.length > 0) {
          setConversations(cached.data.conversations);
          setHasMore(cached.data.hasMore);
          setHasCachedData(true);
          setIsLoading(false); // Hide loading immediately since we have cached data
          console.log('[ChatHistory] Loaded from cache:', cached.data.conversations.length);
        }
      }
    };
    initializeScreen();
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch conversations - supports background refresh without clearing existing data
  const fetchConversations = useCallback(async (reset = false, silent = false) => {
    if (!user) return;

    const currentPage = reset ? 0 : page;
    if (reset && !silent) {
      // Only show loading if we don't have cached data
      if (!hasCachedData) {
        setIsLoading(true);
        setConversations([]);
      }
      setPage(0);
    }

    try {
      let result;
      if (activeTab === 'archived') {
        result = await chatHistoryService.getArchivedConversations(user.id, {
          page: currentPage,
          searchQuery: debouncedSearch,
        });
      } else {
        result = await chatHistoryService.getConversations(user.id, {
          page: currentPage,
          searchQuery: debouncedSearch,
          includeArchived: false,
        });
      }

      if (reset) {
        setConversations(result.conversations);
      } else {
        setConversations(prev => [...prev, ...result.conversations]);
      }
      setHasMore(result.hasMore);
      setHasCachedData(false); // Fresh data loaded
    } catch (error) {
      console.error('[ChatHistory] Fetch error:', error);
      // Only show error if we don't have any data to display
      if (conversations.length === 0) {
        alertService.error('Lỗi', 'Không thể tải lịch sử chat. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [user, page, activeTab, debouncedSearch, hasCachedData, conversations.length]);

  // Load cached data when switching tabs (before fetch)
  useEffect(() => {
    const loadCachedForTab = async () => {
      if (!user || debouncedSearch) return;

      const isArchived = activeTab === 'archived';
      const cached = await chatHistoryService.getCachedConversations(user.id, isArchived);
      if (cached?.data?.conversations?.length > 0) {
        setConversations(cached.data.conversations);
        setHasMore(cached.data.hasMore);
        setHasCachedData(true);
        setIsLoading(false);
      }
    };
    loadCachedForTab();
  }, [user, activeTab]);

  // Fetch fresh data (after cached data is shown)
  useEffect(() => {
    if (user) {
      // If we have cached data, do silent refresh in background
      const shouldBeSilent = hasCachedData && !debouncedSearch;
      fetchConversations(true, shouldBeSilent);
    }
  }, [user, activeTab, debouncedSearch]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(0);
    fetchConversations(true);
  }, [fetchConversations]);

  // Load more (pagination)
  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;

    setIsLoadingMore(true);
    setPage(prev => prev + 1);
  }, [hasMore, isLoadingMore, isLoading]);

  // Effect to fetch when page changes (for pagination)
  useEffect(() => {
    if (page > 0) {
      fetchConversations(false);
    }
  }, [page]);

  // Handle conversation press - navigate back and load
  const handleConversationPress = useCallback((conversationId) => {
    if (onLoadConversation) {
      onLoadConversation(conversationId);
    }
    navigation.goBack();
  }, [navigation, onLoadConversation]);

  // Handle delete press - delete directly without confirmation
  const handleDeletePress = useCallback(async (conversationId) => {
    if (!user) return;

    try {
      await chatHistoryService.deleteConversation(conversationId, user.id);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      // Clear cache so next open gets fresh data
      chatHistoryService.clearCache(user.id);
    } catch (error) {
      console.error('[ChatHistory] Delete error:', error);
      alertService.error('Lỗi', 'Không thể xóa cuộc trò chuyện. Vui lòng thử lại.');
    }
  }, [user]);

  // Handle archive/unarchive
  const handleArchive = useCallback(async (conversationId) => {
    if (!user) return;

    try {
      if (activeTab === 'archived') {
        await chatHistoryService.unarchiveConversation(conversationId, user.id);
      } else {
        await chatHistoryService.archiveConversation(conversationId, user.id);
      }
      // Remove from current list
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      // Clear cache so next open gets fresh data
      chatHistoryService.clearCache(user.id);
    } catch (error) {
      console.error('[ChatHistory] Archive error:', error);
      alertService.error('Lỗi', 'Không thể thực hiện. Vui lòng thử lại.');
    }
  }, [user, activeTab]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Go back and start new chat
  const handleStartChat = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Render conversation item
  const renderItem = useCallback(({ item }) => (
    <ConversationCard
      conversation={item}
      onPress={handleConversationPress}
      onDelete={handleDeletePress}
      onArchive={handleArchive}
      isArchived={activeTab === 'archived'}
    />
  ), [handleConversationPress, handleDeletePress, handleArchive, activeTab]);

  // Key extractor
  const keyExtractor = useCallback((item) => item.id, []);

  // Render footer (loading more indicator)
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  }, [isLoadingMore]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <EmptyHistoryState
        onStartChat={handleStartChat}
        isArchived={activeTab === 'archived'}
      />
    );
  }, [isLoading, handleStartChat, activeTab]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Lịch sử chat</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Search size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm cuộc trò chuyện..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={styles.tabsContainer}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.tabActive,
                ]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Conversations List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.gold}
                  colors={[COLORS.gold]}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
            />
          )}

        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },

  // Search
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.bgMid,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  loadingMore: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default ChatHistoryScreen;
