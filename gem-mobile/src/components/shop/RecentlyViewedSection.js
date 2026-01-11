/**
 * RecentlyViewedSection.js - Recently Viewed Products Section
 * Horizontal scroll of recently viewed products
 * Shown at bottom of ShopScreen
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Clock, ChevronRight } from 'lucide-react-native';
import { getRecentlyViewed } from '../../services/recentlyViewedService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

const RecentlyViewedSection = ({ style, limit = 10 }) => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  // Fetch recently viewed products
  const fetchRecentlyViewed = useCallback(async () => {
    try {
      const data = await getRecentlyViewed(limit);
      setProducts(data);
    } catch (err) {
      console.error('[RecentlyViewedSection] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Initial fetch - only once on mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchRecentlyViewed();
  }, []);

  // Refresh when screen comes into focus (but skip the initial focus)
  useFocusEffect(
    useCallback(() => {
      // Skip first focus since initial fetch already happened
      if (!hasFetched.current) return;
      // Refresh data on subsequent focus
      fetchRecentlyViewed();
    }, [fetchRecentlyViewed])
  );

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', {
      productId: product.product_id,
      handle: product.product_handle,
    });
  };

  const handleSeeAll = () => {
    navigation.navigate('RecentlyViewedScreen');
  };

  // Format price in Vietnamese format
  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {item.product_image ? (
          <Image
            source={{ uri: item.product_image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Clock size={20} color={COLORS.textMuted} />
          </View>
        )}
      </View>
      <Text style={styles.productTitle} numberOfLines={2}>
        {item.product_title || 'Sản phẩm'}
      </Text>
      <Text style={styles.productPrice}>
        {formatPrice(item.product_price)}
      </Text>
    </TouchableOpacity>
  );

  // Don't render if no products or loading
  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={COLORS.burgundy} />
      </View>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Clock size={18} color={COLORS.textSecondary} />
          <Text style={styles.title}>Đã xem gần đây</Text>
        </View>

        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={handleSeeAll}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <ChevronRight size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Products */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id || item.product_id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  productList: {
    paddingHorizontal: SPACING.lg,
  },
  productCard: {
    width: 100,
    marginRight: SPACING.md,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.glassBg,
    marginBottom: SPACING.xs,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.glassBgHeavy,
  },
  productTitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    lineHeight: 14,
    marginBottom: 2,
  },
  productPrice: {
    color: COLORS.cyan,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default RecentlyViewedSection;
