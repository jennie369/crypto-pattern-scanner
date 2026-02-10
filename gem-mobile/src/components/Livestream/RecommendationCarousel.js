/**
 * RecommendationCarousel Component
 * Phase 4: Intelligence Layer
 *
 * Horizontal carousel for displaying product recommendations during livestream
 * Features:
 * - 4 strategy labels (personalized, contextual, trending, complementary)
 * - Animated fade-in
 * - Quick add to cart
 * - Navigation arrows
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Plus,
} from 'lucide-react-native';
import { livestreamRecommendationService } from '../../services/livestreamRecommendationService';
import { useSettings } from '../../contexts/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 140;
const CARD_MARGIN = 8;

const RecommendationCarousel = ({
  userId,
  sessionId,
  context = {},
  onProductPress,
  onAddToCart,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // ========== STATE ==========
  const [recommendations, setRecommendations] = useState([]);
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== REFS ==========
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      paddingVertical: SPACING?.md || 12,
      marginVertical: SPACING?.sm || 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.2)',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING?.md || 12,
      marginBottom: SPACING?.sm || 8,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING?.xs || 4,
    },
    title: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textLight || '#FFFFFF',
      marginLeft: 6,
    },
    navButtons: {
      flexDirection: 'row',
      gap: SPACING?.xs || 4,
    },
    navButton: {
      padding: SPACING?.xs || 4,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 6,
    },
    listContent: {
      paddingHorizontal: SPACING?.md || 12,
    },
    cardContainer: {
      width: CARD_WIDTH,
      marginHorizontal: CARD_MARGIN,
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    imageContainer: {
      width: '100%',
      height: 120,
      position: 'relative',
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickAddButton: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.gold || '#FFBD59',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    matchBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
      gap: 3,
    },
    matchText: {
      fontSize: 9,
      color: colors.gold || '#FFBD59',
      fontWeight: '600',
    },
    infoContainer: {
      padding: 10,
    },
    productTitle: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textLight || '#FFFFFF',
      lineHeight: 16,
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.gold || '#FFBD59',
    },
    loadingContainer: {
      flexDirection: 'row',
      paddingHorizontal: SPACING?.md || 12,
    },
    loadingCard: {
      width: CARD_WIDTH,
      height: 180,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 10,
      marginHorizontal: CARD_MARGIN,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorContainer: {
      alignItems: 'center',
      padding: SPACING?.lg || 16,
    },
    errorText: {
      fontSize: 12,
      color: colors.error || '#FF6B6B',
      marginBottom: SPACING?.xs || 4,
    },
    retryText: {
      fontSize: 11,
      color: colors.textMuted || '#888888',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // ========== EFFECTS ==========
  useEffect(() => {
    loadRecommendations();
  }, [userId, context.currentProduct?.id]);

  // ========== DATA FETCHING ==========
  const loadRecommendations = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await livestreamRecommendationService.getRecommendations(
        userId,
        context,
        { limit: 8 }
      );

      setRecommendations(result.products || []);
      setStrategy(result.strategy);

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('[RecommendationCarousel] Error:', err);
      setError('Khong the tai goi y');
    } finally {
      setLoading(false);
    }
  }, [userId, context, fadeAnim]);

  // ========== HANDLERS ==========
  const handleProductPress = useCallback(
    (product) => {
      onProductPress?.(product);
    },
    [onProductPress]
  );

  const handleAddToCart = useCallback(
    (product) => {
      onAddToCart?.(product);
    },
    [onAddToCart]
  );

  const scrollToStart = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const scrollToNext = useCallback(() => {
    flatListRef.current?.scrollToOffset({
      offset: (CARD_WIDTH + CARD_MARGIN * 2) * 2,
      animated: true,
    });
  }, []);

  // ========== RENDER HELPERS ==========
  const getStrategyLabel = () => {
    const labels = {
      personalized: 'Danh rieng cho ban',
      contextual: 'San pham lien quan',
      trending: 'Dang hot',
      complementary: 'Mua kem giam gia',
    };
    return labels[strategy] || 'Goi y cho ban';
  };

  const formatPrice = (price) => {
    if (!price) return '';
    const numPrice = parseFloat(price);
    if (numPrice >= 1000000) {
      return `${(numPrice / 1000000).toFixed(1)}tr`;
    }
    if (numPrice >= 1000) {
      return `${(numPrice / 1000).toFixed(0)}k`;
    }
    return numPrice.toLocaleString('vi-VN');
  };

  const renderItem = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleProductPress(item)}
          activeOpacity={0.8}
        >
          {/* Product Image */}
          <View style={styles.imageContainer}>
            {item.images?.[0]?.src || item.image ? (
              <Image
                source={{ uri: item.images?.[0]?.src || item.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <ShoppingBag size={24} color={colors.textMuted} />
              </View>
            )}

            {/* Quick Add Button */}
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => handleAddToCart(item)}
            >
              <Plus size={14} color={colors.bgDarkest} />
            </TouchableOpacity>

            {/* Relevance Badge */}
            {item.relevanceScore > 50 && (
              <View style={styles.matchBadge}>
                <Star size={10} color={colors.gold} fill={colors.gold} />
                <Text style={styles.matchText}>Phu hop</Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.productPrice}>
              {formatPrice(item.variants?.[0]?.price || item.price)}d
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    ),
    [fadeAnim, handleProductPress, handleAddToCart, styles, colors]
  );

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Sparkles size={16} color={colors.gold} />
          <Text style={styles.title}>Dang tai goi y...</Text>
        </View>
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((_, i) => (
            <View key={i} style={styles.loadingCard}>
              <ActivityIndicator size="small" color={colors.gold} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity style={styles.errorContainer} onPress={loadRecommendations}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText}>Nhan de thu lai</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ========== EMPTY STATE ==========
  if (recommendations.length === 0) {
    return null;
  }

  // ========== MAIN RENDER ==========
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Sparkles size={16} color={colors.gold} />
          <Text style={styles.title}>{getStrategyLabel()}</Text>
        </View>

        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton} onPress={scrollToStart}>
            <ChevronLeft size={14} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={scrollToNext}>
            <ChevronRight size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Carousel */}
      <FlatList
        ref={flatListRef}
        data={recommendations}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
      />
    </View>
  );
};

export default RecommendationCarousel;
