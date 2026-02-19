/**
 * Gemral - Global Search Screen
 *
 * Multi-source search across coins, posts, products, and help articles
 * Features: Recent searches, trending, categorized results
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  StatusBar,
  DeviceEventEmitter,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Search,
  X,
  TrendingUp,
  Clock,
  ChevronRight,
  Bitcoin,
  FileText,
  ShoppingBag,
  HelpCircle,
  Trash2,
  ArrowLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import searchService from '../../services/searchService';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

const RESULT_TYPES = {
  coins: { icon: Bitcoin, color: '#F7931A', label: 'Coins' },
  posts: { icon: FileText, color: COLORS.gold, label: 'Bài viết' },
  products: { icon: ShoppingBag, color: '#00D9FF', label: 'Sản phẩm' },
  help: { icon: HelpCircle, color: '#8B5CF6', label: 'Trợ giúp' },
};

const GlobalSearchScreen = () => {
  const navigation = useNavigation();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trending, setTrending] = useState([]);

  // Load recent searches and trending on mount
  useEffect(() => {
    loadInitialData();
    // Auto focus input
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[GlobalSearch] Force refresh received');
      setLoading(false);
      setTimeout(() => loadInitialData(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadInitialData = async () => {
    const [recent, trendingData] = await Promise.all([
      searchService.getRecentSearches(),
      Promise.resolve(searchService.getTrendingGlobal()),
    ]);
    setRecentSearches(recent);
    setTrending(trendingData);
  };

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const data = await searchService.globalSearch(searchQuery);
      setResults(data);
      // Refresh recent searches
      const recent = await searchService.getRecentSearches();
      setRecentSearches(recent);
    } catch (error) {
      console.error('[GlobalSearch] Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearQuery = () => {
    setQuery('');
    setResults(null);
    inputRef.current?.focus();
  };

  const handleRecentSearch = (term) => {
    setQuery(term);
    performSearch(term);
  };

  const handleRemoveRecent = async (term) => {
    await searchService.removeRecentSearch(term);
    const recent = await searchService.getRecentSearches();
    setRecentSearches(recent);
  };

  const handleClearAllRecent = async () => {
    await searchService.clearRecentSearches();
    setRecentSearches([]);
  };

  const handleResultPress = (type, item) => {
    Keyboard.dismiss();

    switch (type) {
      case 'coins':
        navigation.navigate('Scanner', { symbol: item.symbol });
        break;
      case 'posts':
        navigation.navigate('PostDetail', { postId: item.id });
        break;
      case 'products':
        navigation.navigate('ProductDetail', {
          productId: item.shopify_id || item.id,
          product: item
        });
        break;
      case 'help':
        if (item.screen) {
          navigation.navigate(item.screen);
        }
        break;
    }
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return results.coins.length + results.posts.length +
           results.products.length + results.help.length;
  };

  const renderSearchInput = () => (
    <View style={styles.searchContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowLeft size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Search size={20} color={COLORS.textMuted} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Tìm coins, bài viết, sản phẩm..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClearQuery} style={styles.clearButton}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
            <Trash2 size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {recentSearches.slice(0, 5).map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentItem}
            onPress={() => handleRecentSearch(item.term)}
          >
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.recentText}>{item.term}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveRecent(item.term)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTrending = () => {
    if (trending.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <TrendingUp size={16} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Xu hướng</Text>
          </View>
        </View>

        <View style={styles.trendingContainer}>
          {trending.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.trendingChip}
              onPress={() => handleRecentSearch(item.term)}
            >
              <Text style={styles.trendingText}>{item.term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderResultSection = (type, items) => {
    if (!items || items.length === 0) return null;

    const { icon: Icon, color, label } = RESULT_TYPES[type];

    return (
      <View style={styles.resultSection}>
        <View style={styles.resultHeader}>
          <Icon size={18} color={color} />
          <Text style={[styles.resultLabel, { color }]}>{label}</Text>
          <Text style={styles.resultCount}>({items.length})</Text>
        </View>

        {items.slice(0, 5).map((item, index) => (
          <TouchableOpacity
            key={item.id || item.symbol || index}
            style={styles.resultItem}
            onPress={() => handleResultPress(type, item)}
          >
            <View style={styles.resultContent}>
              {type === 'coins' && (
                <>
                  <Text style={styles.resultTitle}>{item.name}</Text>
                  <Text style={styles.resultSubtitle}>{item.symbol}</Text>
                </>
              )}
              {type === 'posts' && (
                <>
                  <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.title || 'Bài viết'}
                  </Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {item.author?.full_name || 'Ẩn danh'}
                  </Text>
                </>
              )}
              {type === 'products' && (
                <>
                  <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.resultSubtitle}>
                    {item.price ? `${item.price.toLocaleString()}đ` : item.product_type}
                  </Text>
                </>
              )}
              {type === 'help' && (
                <>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultSubtitle}>{item.description}</Text>
                </>
              )}
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      );
    }

    if (results && getTotalResults() === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Search size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
          <Text style={styles.emptySubtitle}>
            Thử tìm kiếm với từ khóa khác
          </Text>
        </View>
      );
    }

    if (results) {
      return (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            Tìm thấy {getTotalResults()} kết quả
          </Text>
          {renderResultSection('coins', results.coins)}
          {renderResultSection('posts', results.posts)}
          {renderResultSection('products', results.products)}
          {renderResultSection('help', results.help)}
        </View>
      );
    }

    return (
      <View>
        {renderRecentSearches()}
        {renderTrending()}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

      {renderSearchInput()}

      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => renderResults()}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: SPACING.sm,
    ...GLASS,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  section: {
    marginBottom: SPACING.xl,
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
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  recentText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  trendingChip: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  trendingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  resultsContainer: {
    gap: SPACING.lg,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  resultSection: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 16,
    padding: SPACING.md,
    ...GLASS,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  resultCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

export default GlobalSearchScreen;
