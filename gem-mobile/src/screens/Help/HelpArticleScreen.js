/**
 * Gemral - Help Article Screen
 * Hiển thị chi tiết article với ArticleRenderer
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  DeviceEventEmitter,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Share2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
} from 'lucide-react-native';

import { COLORS, SPACING, GRADIENTS, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import helpService from '../../services/helpService';
import ArticleRenderer from '../../components/Help/ArticleRenderer';

const HelpArticleScreen = ({ navigation, route }) => {
  const { slug } = route.params;
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[HelpArticleScreen] Force refresh received');
      setLoading(false);
      setTimeout(() => loadArticle(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setFeedbackSubmitted(false);
      setFeedbackType(null);

      const [articleData, related] = await Promise.all([
        helpService.getArticleBySlug(slug),
        helpService.getRelatedArticles(slug, 3),
      ]);

      setArticle(articleData);
      setRelatedArticles(related);
    } catch (error) {
      console.error('[HelpArticle] Load article error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!article) return;

    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.excerpt}\n\nXem thêm tại Gemral App`,
      });
    } catch (error) {
      console.error('[HelpArticle] Share error:', error);
    }
  };

  const handleFeedback = async (wasHelpful) => {
    if (feedbackSubmitted) return;

    try {
      const result = await helpService.submitFeedback(slug, wasHelpful);
      if (result.success) {
        setFeedbackSubmitted(true);
        setFeedbackType(wasHelpful ? 'helpful' : 'not-helpful');
      }
    } catch (error) {
      console.error('[HelpArticle] Feedback error:', error);
    }
  };

  const handleRelatedArticlePress = (relatedArticle) => {
    navigation.push('HelpArticle', { slug: relatedArticle.slug });
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

  // Render feedback widget
  const renderFeedbackWidget = () => {
    if (feedbackSubmitted) {
      return (
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackSubmitted}>
            <CheckCircle size={24} color={COLORS.success} />
            <Text style={styles.feedbackSubmittedText}>
              {feedbackType === 'helpful'
                ? 'Cảm ơn bạn! Rất vui vì bài viết hữu ích.'
                : 'Cảm ơn góp ý! Chúng tôi sẽ cải thiện.'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Bài viết này có hữu ích không?</Text>
        <View style={styles.feedbackButtons}>
          <TouchableOpacity
            style={[styles.feedbackButton, styles.feedbackButtonPositive]}
            onPress={() => handleFeedback(true)}
            activeOpacity={0.7}
          >
            <ThumbsUp size={20} color={COLORS.success} />
            <Text style={[styles.feedbackButtonText, { color: COLORS.success }]}>
              Có, hữu ích
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.feedbackButton, styles.feedbackButtonNegative]}
            onPress={() => handleFeedback(false)}
            activeOpacity={0.7}
          >
            <ThumbsDown size={20} color={COLORS.error} />
            <Text style={[styles.feedbackButtonText, { color: COLORS.error }]}>
              Chưa hữu ích
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
            <View style={styles.headerSpacer} />
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải bài viết...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!article) {
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
            <View style={styles.headerSpacer} />
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Không tìm thấy bài viết</Text>
            <Text style={styles.errorText}>
              Bài viết này có thể đã bị xóa hoặc không tồn tại.
            </Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.errorButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const difficultyColor = getDifficultyColor(article.metadata?.difficulty);

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
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareButton}
          >
            <Share2 size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Article Header */}
          <View style={styles.articleHeader}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <View style={styles.articleMeta}>
              <View style={styles.metaItem}>
                <Clock size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>
                  {article.metadata?.readTime || '5 phút đọc'}
                </Text>
              </View>
              {article.metadata?.difficulty && (
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: `${difficultyColor}20` },
                  ]}
                >
                  <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                    {article.metadata.difficulty}
                  </Text>
                </View>
              )}
            </View>
            {article.excerpt && (
              <Text style={styles.articleExcerpt}>{article.excerpt}</Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Article Content */}
          <View style={styles.articleContent}>
            <ArticleRenderer
              blocks={article.content?.blocks || []}
              onArticlePress={handleRelatedArticlePress}
            />
          </View>

          {/* Related Articles (from service) */}
          {relatedArticles.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Bài Viết Liên Quan</Text>
              {relatedArticles.map((related) => (
                <TouchableOpacity
                  key={related.id}
                  style={styles.relatedCard}
                  onPress={() => handleRelatedArticlePress(related)}
                  activeOpacity={0.7}
                >
                  <View style={styles.relatedContent}>
                    <Text style={styles.relatedArticleTitle} numberOfLines={2}>
                      {related.title}
                    </Text>
                    <View style={styles.relatedMeta}>
                      <Clock size={12} color={COLORS.textMuted} />
                      <Text style={styles.relatedMetaText}>
                        {related.metadata?.readTime || '5 phút'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Feedback Widget */}
          {renderFeedbackWidget()}
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
  headerSpacer: {
    width: 40,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  errorButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  articleHeader: {
    marginBottom: SPACING.lg,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
  articleExcerpt: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.lg,
  },
  articleContent: {
    marginBottom: SPACING.xl,
  },
  relatedSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  relatedTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },
  relatedCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  relatedContent: {
    flex: 1,
  },
  relatedArticleTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  relatedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  relatedMetaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  feedbackContainer: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  feedbackTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  feedbackButtonPositive: {
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.3)',
  },
  feedbackButtonNegative: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  feedbackButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  feedbackSubmitted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  feedbackSubmittedText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
});

export default HelpArticleScreen;
