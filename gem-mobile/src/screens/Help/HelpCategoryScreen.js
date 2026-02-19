/**
 * Gemral - Help Category Screen
 * Hiển thị danh sách articles trong một category
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
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
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import helpService from '../../services/helpService';

// Icon mapping
const ICON_MAP = {
  Diamond: Diamond,
  DollarSign: DollarSign,
  Rocket: Rocket,
  Link: Link,
  LayoutDashboard: LayoutDashboard,
};

const HelpCategoryScreen = ({ navigation, route }) => {
  const { categoryId } = route.params;
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[HelpCategoryScreen] Force refresh received');
      setLoading(false);
      setTimeout(() => loadCategoryData(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const [categoryData, articlesData] = await Promise.all([
        helpService.getCategoryById(categoryId),
        helpService.getArticlesByCategory(categoryId),
      ]);
      setCategory(categoryData);
      setArticles(articlesData);
    } catch (error) {
      console.error('[HelpCategory] Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToArticle = (article) => {
    navigation.navigate('HelpArticle', { slug: article.slug });
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'cơ bản':
      case 'beginner':
        return COLORS.success;
      case 'trung bình':
      case 'intermediate':
        return COLORS.gold;
      case 'nâng cao':
      case 'advanced':
        return COLORS.error;
      default:
        return COLORS.purple;
    }
  };

  // Render article item
  const renderArticleItem = ({ item, index }) => {
    const difficultyColor = getDifficultyColor(item.metadata?.difficulty);

    return (
      <TouchableOpacity
        style={[
          styles.articleCard,
          index === articles.length - 1 && styles.lastArticleCard,
        ]}
        onPress={() => navigateToArticle(item)}
        activeOpacity={0.7}
      >
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.articleExcerpt} numberOfLines={3}>
            {item.excerpt}
          </Text>
          <View style={styles.articleMeta}>
            <View style={styles.metaItem}>
              <Clock size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{item.metadata?.readTime || '5 phút'}</Text>
            </View>
            {item.metadata?.difficulty && (
              <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20` }]}>
                <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                  {item.metadata.difficulty}
                </Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

  // Render header with category info
  const renderHeader = () => {
    if (!category) return null;

    const IconComponent = ICON_MAP[category.icon] || BookOpen;

    return (
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}20` }]}>
          <IconComponent size={32} color={category.color} />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryDescription}>
          {articles.length} bài viết trong danh mục này
        </Text>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <BookOpen size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chưa có bài viết</Text>
      <Text style={styles.emptyText}>
        Danh mục này đang được cập nhật nội dung
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đang tải...</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {category?.name || 'Danh mục'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <FlatList
          data={articles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  categoryHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  categoryIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  categoryDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  articleCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  lastArticleCard: {
    marginBottom: 0,
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
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: SPACING.giant,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default HelpCategoryScreen;
