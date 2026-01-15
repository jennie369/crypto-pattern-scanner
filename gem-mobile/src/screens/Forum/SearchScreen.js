/**
 * Gemral - Search Screen
 * Full-text search with filters, suggestions, and recent searches
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Clock,
  TrendingUp,
  X,
  Hash,
  Filter,
  Calendar,
  Image as ImageIcon,
  User,
  Trash2,
} from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { searchService } from '../../services/searchService';
import SearchBar from '../../components/SearchBar';
import PostCard from './components/PostCard';

// Filter options
const DATE_FILTERS = [
  { id: null, label: 'Tất cả' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' },
];

const MEDIA_FILTERS = [
  { id: null, label: 'Tất cả' },
  { id: true, label: 'Có hình' },
  { id: false, label: 'Chỉ chữ' },
];

const SearchScreen = ({ navigation }) => {
  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [userResults, setUserResults] = useState([]); // NEW: Users matching search
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);

  // Filter state
  const [dateFilter, setDateFilter] = useState(null);
  const [mediaFilter, setMediaFilter] = useState(null);

  // Debounce timer
  const debounceTimer = useRef(null);

  // Load initial data
  useEffect(() => {
    loadRecentSearches();
    loadTrendingSearches();
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length >= 2) {
      debounceTimer.current = setTimeout(async () => {
        const sug = await searchService.getSuggestions(query);
        setSuggestions(sug);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const loadRecentSearches = async () => {
    const recent = await searchService.getRecentSearches();
    setRecentSearches(recent);
  };

  const loadTrendingSearches = async () => {
    const trending = await searchService.getTrendingSearches();
    setTrendingSearches(trending);
  };

  const performSearch = async (searchQuery, resetResults = true) => {
    if (!searchQuery || searchQuery.trim().length < 2) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const currentPage = resetResults ? 1 : page;
      const filters = {
        dateRange: dateFilter,
        hasMedia: mediaFilter,
      };

      // Check if searching by hashtag
      let result;
      if (searchQuery.startsWith('#')) {
        result = await searchService.searchByHashtag(
          searchQuery.slice(1),
          currentPage,
          20
        );
        // Hashtag search doesn't return users
        if (resetResults) {
          setUserResults([]);
        }
      } else {
        result = await searchService.searchPosts(
          searchQuery,
          filters,
          currentPage,
          20
        );
        // Update user results (only on reset/new search)
        if (resetResults && result.users) {
          setUserResults(result.users);
        }
      }

      // Save to recent searches
      await searchService.addRecentSearch(searchQuery);
      loadRecentSearches();

      if (resetResults) {
        setResults(result.data);
        setPage(1);
      } else {
        setResults(prev => [...prev, ...result.data]);
      }

      setTotalCount(result.count);
      setHasMore(result.data.length === 20);
      setPage(prev => prev + 1);
      setSuggestions([]);
    } catch (error) {
      console.error('[SearchScreen] Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (searchQuery) => {
    setQuery(searchQuery);
    performSearch(searchQuery, true);
  };

  const handleSuggestionPress = (suggestion) => {
    setQuery(suggestion.term);
    performSearch(suggestion.term, true);
  };

  const handleRecentPress = (recent) => {
    setQuery(recent.term);
    performSearch(recent.term, true);
  };

  const handleRemoveRecent = async (term) => {
    await searchService.removeRecentSearch(term);
    loadRecentSearches();
  };

  const handleClearAllRecent = async () => {
    await searchService.clearRecentSearches();
    setRecentSearches([]);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && query) {
      performSearch(query, false);
    }
  };

  const handleFilterChange = () => {
    if (query) {
      performSearch(query, true);
    }
  };

  // Render search suggestions
  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={`${suggestion.term}-${index}`}
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(suggestion)}
          >
            {suggestion.type === 'hashtag' ? (
              <Hash size={16} color={COLORS.cyan} />
            ) : (
              <Search size={16} color={COLORS.textMuted} />
            )}
            <Text style={[
              styles.suggestionText,
              suggestion.type === 'hashtag' && styles.suggestionHashtag
            ]}>
              {suggestion.term}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render recent searches
  const renderRecentSearches = () => {
    if (recentSearches.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
          </View>
          <TouchableOpacity onPress={handleClearAllRecent}>
            <Text style={styles.clearAllText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>
        {recentSearches.map((recent, index) => (
          <TouchableOpacity
            key={`${recent.term}-${index}`}
            style={styles.recentItem}
            onPress={() => handleRecentPress(recent)}
          >
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.recentText}>{recent.term}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveRecent(recent.term)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render trending searches
  const renderTrendingSearches = () => {
    if (trendingSearches.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <TrendingUp size={16} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Xu hướng</Text>
        </View>
        {trendingSearches.map((trend, index) => (
          <TouchableOpacity
            key={`${trend.term}-${index}`}
            style={styles.trendItem}
            onPress={() => handleSuggestionPress(trend)}
          >
            <Hash size={16} color={COLORS.cyan} />
            <Text style={styles.trendText}>{trend.term}</Text>
            <Text style={styles.trendCount}>{trend.count} bài viết</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render filters
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        {/* Date filter */}
        <View style={styles.filterGroup}>
          <View style={styles.filterLabel}>
            <Calendar size={14} color={COLORS.textMuted} />
            <Text style={styles.filterLabelText}>Thời gian</Text>
          </View>
          <View style={styles.filterOptions}>
            {DATE_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.label}
                style={[
                  styles.filterChip,
                  dateFilter === filter.id && styles.filterChipActive
                ]}
                onPress={() => {
                  setDateFilter(filter.id);
                  handleFilterChange();
                }}
              >
                <Text style={[
                  styles.filterChipText,
                  dateFilter === filter.id && styles.filterChipTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Media filter */}
        <View style={styles.filterGroup}>
          <View style={styles.filterLabel}>
            <ImageIcon size={14} color={COLORS.textMuted} />
            <Text style={styles.filterLabelText}>Loại bài viết</Text>
          </View>
          <View style={styles.filterOptions}>
            {MEDIA_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.label}
                style={[
                  styles.filterChip,
                  mediaFilter === filter.id && styles.filterChipActive
                ]}
                onPress={() => {
                  setMediaFilter(filter.id);
                  handleFilterChange();
                }}
              >
                <Text style={[
                  styles.filterChipText,
                  mediaFilter === filter.id && styles.filterChipTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Render empty state (before search)
  const renderEmptyState = () => {
    if (query.length > 0 && results.length === 0 && !loading) {
      return (
        <View style={styles.noResultsContainer}>
          <Search size={48} color={COLORS.textMuted} />
          <Text style={styles.noResultsTitle}>Không tìm thấy kết quả</Text>
          <Text style={styles.noResultsSubtitle}>
            Thử tìm kiếm với từ khóa khác
          </Text>
        </View>
      );
    }

    if (query.length === 0) {
      return (
        <View style={styles.initialState}>
          {renderRecentSearches()}
          {renderTrendingSearches()}
        </View>
      );
    }

    return null;
  };

  // Render post item
  const renderPost = useCallback(({ item }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    />
  ), [navigation]);

  // Render footer
  const renderFooter = () => {
    if (!hasMore || !loading) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  };

  // Render user card for user results
  const renderUserCard = (user) => {
    const displayName = user.full_name || user.email?.split('@')[0] || 'User';
    const username = user.email?.split('@')[0] || '';

    return (
      <TouchableOpacity
        key={user.id}
        style={styles.userCard}
        onPress={() => navigation.navigate('UserProfile', { userId: user.id })}
      >
        <Image
          source={{ uri: user.avatar_url || 'https://via.placeholder.com/50' }}
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.userHandle} numberOfLines={1}>@{username}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewProfileButton}
          onPress={() => navigation.navigate('UserProfile', { userId: user.id })}
        >
          <Text style={styles.viewProfileText}>Xem</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render user results section
  const renderUserResults = () => {
    if (userResults.length === 0) return null;

    return (
      <View style={styles.userResultsSection}>
        <View style={styles.sectionTitleRow}>
          <User size={16} color={COLORS.cyan} />
          <Text style={styles.sectionTitle}>Người dùng ({userResults.length})</Text>
        </View>
        {userResults.slice(0, 3).map(renderUserCard)}
        {userResults.length > 3 && (
          <TouchableOpacity
            style={styles.showMoreUsers}
            onPress={() => {
              // Could navigate to a full user search screen
              // For now, just show all inline
            }}
          >
            <Text style={styles.showMoreText}>+{userResults.length - 3} người dùng khác</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render header with result count
  const renderListHeader = () => {
    return (
      <View>
        {/* User results (if any) */}
        {renderUserResults()}

        {/* Post results header */}
        {results.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {totalCount} bài viết cho "{query}"
            </Text>
            <TouchableOpacity
              style={[styles.filterButton, showFilters && styles.filterButtonActive]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} color={showFilters ? COLORS.gold : COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Search Bar */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSubmit}
          onBack={() => navigation.goBack()}
          showBackButton
          autoFocus
          placeholder="Tìm kiếm bài viết, hashtag..."
        />

        {/* Suggestions (while typing) */}
        {query.length >= 2 && suggestions.length > 0 && results.length === 0 && (
          renderSuggestions()
        )}

        {/* Filters */}
        {renderFilters()}

        {/* Results or Empty State */}
        {loading && results.length === 0 && userResults.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        ) : (results.length > 0 || userResults.length > 0) ? (
          <FlatList
            data={results}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              userResults.length > 0 ? (
                <View style={styles.noPostsHint}>
                  <Text style={styles.noPostsText}>Không có bài viết nào từ người dùng này</Text>
                </View>
              ) : null
            }
          />
        ) : (
          renderEmptyState()
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  // Suggestions
  suggestionsContainer: {
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.md,
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  suggestionHashtag: {
    color: COLORS.cyan,
  },
  // Sections
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  clearAllText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
  },
  // Recent searches
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  recentText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  // Trending
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  trendText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  trendCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  // Filters
  filtersContainer: {
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: GLASS.borderRadius,
  },
  filterGroup: {
    marginBottom: SPACING.md,
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  filterLabelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderColor: COLORS.gold,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  // Results
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  filterButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  footerLoading: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  // No results
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  noResultsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  noResultsSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  // Initial state
  initialState: {
    flex: 1,
  },
  // User results section
  userResultsSection: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  userHandle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewProfileButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(0, 200, 255, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cyan,
  },
  viewProfileText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  showMoreUsers: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  showMoreText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.cyan,
  },
  noPostsHint: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default SearchScreen;
