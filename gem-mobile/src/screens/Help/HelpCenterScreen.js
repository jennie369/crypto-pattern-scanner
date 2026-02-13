/**
 * Gemral - Help Center Screen
 * Main screen cho Help Center với categories và search
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search,
  X,
  Diamond,
  DollarSign,
  Rocket,
  Link,
  LayoutDashboard,
  ChevronRight,
  Clock,
  BookOpen,
} from 'lucide-react-native';

import { COLORS, SPACING, GRADIENTS, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import helpService from '../../services/helpService';

// Icon mapping
const ICON_MAP = {
  Diamond: Diamond,
  DollarSign: DollarSign,
  Rocket: Rocket,
  Link: Link,
  LayoutDashboard: LayoutDashboard,
};

const HelpCenterScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, popular] = await Promise.all([
        helpService.getCategories(),
        helpService.getPopularArticles(3),
      ]);
      setCategories(cats);
      setPopularArticles(popular);
    } catch (error) {
      console.error('[HelpCenter] Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    try {
      setIsSearching(true);
      const results = await helpService.searchArticles(query);
      setSearchResults(results);
    } catch (error) {
      console.error('[HelpCenter] Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const navigateToCategory = (category) => {
    navigation.navigate('HelpCategory', { categoryId: category.id });
  };

  const navigateToArticle = (article) => {
    navigation.navigate('HelpArticle', { slug: article.slug });
  };

  // Render category card
  const renderCategoryCard = ({ item }) => {
    const IconComponent = ICON_MAP[item.icon] || BookOpen;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigateToCategory(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryIconContainer, { backgroundColor: `${item.color}20` }]}>
          <IconComponent size={24} color={item.color} />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>{item.articleCount} bài viết</Text>
        <ChevronRight size={16} color={COLORS.textMuted} style={styles.categoryArrow} />
      </TouchableOpacity>
    );
  };

  // Render article card (for popular/search results)
  const renderArticleCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.articleCard}
        onPress={() => navigateToArticle(item)}
        activeOpacity={0.7}
      >
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.articleExcerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>
          <View style={styles.articleMeta}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.articleMetaText}>{item.metadata.readTime}</Text>
            <View style={styles.articleDifficulty}>
              <Text style={styles.articleDifficultyText}>{item.metadata.difficulty}</Text>
            </View>
          </View>
        </View>
        <ChevronRight size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

  // Render search results
  const renderSearchResults = () => {
    if (searchQuery.length < 2) return null;

    if (isSearching) {
      return (
        <View style={styles.searchResultsContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.searchingText}>Đang tìm kiếm...</Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.searchResultsContainer}>
          <Text style={styles.noResultsText}>
            Không tìm thấy kết quả cho "{searchQuery}"
          </Text>
          <Text style={styles.noResultsHint}>
            Thử tìm kiếm với từ khóa khác
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.searchResultsContainer}>
        <Text style={styles.searchResultsTitle}>
          Tìm thấy {searchResults.length} kết quả
        </Text>
        <FlatList
          data={searchResults}
          renderItem={renderArticleCard}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          scrollEnabled={false}
        />
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trung Tâm Trợ Giúp</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài viết..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Results (if searching) */}
          {searchQuery.length >= 2 ? (
            renderSearchResults()
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          ) : (
            <>
              {/* Categories Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danh Mục</Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((category) => (
                    <View key={category.id} style={styles.categoryCardWrapper}>
                      {renderCategoryCard({ item: category })}
                    </View>
                  ))}
                </View>
              </View>

              {/* Popular Articles Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bài Viết Phổ Biến</Text>
                <FlatList
                  data={popularArticles}
                  renderItem={renderArticleCard}
                  keyExtractor={(item) => item.id}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                  initialNumToRender={10}
                  scrollEnabled={false}
                />
              </View>

              {/* Quick Links Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Liên Kết Nhanh</Text>
                <View style={styles.quickLinksContainer}>
                  <TouchableOpacity
                    style={styles.quickLink}
                    onPress={() => navigation.navigate('HelpSupport')}
                  >
                    <Text style={styles.quickLinkText}>Liên hệ hỗ trợ</Text>
                    <ChevronRight size={16} color={COLORS.gold} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickLink}
                    onPress={() => navigation.navigate('Terms')}
                  >
                    <Text style={styles.quickLinkText}>Điều khoản sử dụng</Text>
                    <ChevronRight size={16} color={COLORS.gold} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickLink}
                    onPress={() => navigation.navigate('PrivacySettings')}
                  >
                    <Text style={styles.quickLinkText}>Chính sách bảo mật</Text>
                    <ChevronRight size={16} color={COLORS.gold} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  categoryCardWrapper: {
    width: '50%',
    padding: SPACING.xs,
  },
  categoryCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  categoryCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  categoryArrow: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  articleCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  articleContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  articleTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  articleExcerpt: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  articleMetaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  articleDifficulty: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: SPACING.sm,
  },
  articleDifficultyText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  searchResultsContainer: {
    paddingTop: SPACING.md,
  },
  searchResultsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  searchingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  noResultsText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  noResultsHint: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  quickLinksContainer: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  quickLinkText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default HelpCenterScreen;
