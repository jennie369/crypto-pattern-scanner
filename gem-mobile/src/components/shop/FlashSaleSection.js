/**
 * FlashSaleSection.js - Flash Sale Section Component
 * Container for flash sale products with countdown timer
 * Fetches active flash sale config from Supabase
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Zap, ChevronRight } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { fetchProductsByIds } from '../../services/shopifyService';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import CountdownTimer from './CountdownTimer';
import FlashSaleCard from './FlashSaleCard';
import { prefetchImages } from '../Common/OptimizedImage';

// =========== GLOBAL CACHE for instant display ===========
const flashSaleCache = {
  sale: null,
  products: null,
  lastFetch: 0,
  CACHE_DURATION: 2 * 60 * 1000, // 2 minutes (shorter for flash sales)
};

const FlashSaleSection = ({ style }) => {
  const navigation = useNavigation();
  const { addToCart } = useCart();

  // Initialize from cache for instant display
  const [flashSale, setFlashSale] = useState(() => flashSaleCache.sale);
  const [products, setProducts] = useState(() => flashSaleCache.products || []);
  const [loading, setLoading] = useState(() => !flashSaleCache.products || flashSaleCache.products.length === 0);
  const [isExpired, setIsExpired] = useState(false);

  // Use ref to track if already fetched - prevents re-fetch on every render
  const hasFetched = useRef(false);

  // Fetch active flash sale config - only once on mount
  useEffect(() => {
    // Skip if already fetched
    if (hasFetched.current) return;
    hasFetched.current = true;

    const now = Date.now();
    const cacheExpired = now - flashSaleCache.lastFetch > flashSaleCache.CACHE_DURATION;

    // Use cache if valid
    if (flashSaleCache.sale && flashSaleCache.products && flashSaleCache.products.length > 0 && !cacheExpired) {
      // Check if the flash sale is still active
      const endTime = new Date(flashSaleCache.sale.end_time).getTime();
      if (endTime > now) {
        setLoading(false);
        return;
      }
    }

    const fetchFlashSale = async () => {
      try {
        const nowISO = new Date().toISOString();

        const { data, error } = await supabase
          .from('flash_sale_config')
          .select('*')
          .eq('is_active', true)
          .lte('start_time', nowISO)
          .gte('end_time', nowISO)
          .order('start_time', { ascending: true })
          .limit(1)
          .single();

        if (error || !data) {
          setFlashSale(null);
          flashSaleCache.sale = null;
          flashSaleCache.products = null;
          setLoading(false);
          return;
        }

        setFlashSale(data);
        flashSaleCache.sale = data;

        // Fetch products for flash sale
        if (data.product_ids && data.product_ids.length > 0) {
          const fetchedProducts = await fetchProductsByIds(data.product_ids);
          setProducts(fetchedProducts || []);

          // Update cache
          flashSaleCache.products = fetchedProducts || [];
          flashSaleCache.lastFetch = Date.now();

          // Prefetch product images for faster rendering
          const imageUrls = (fetchedProducts || [])
            .map(p => p?.images?.[0]?.src || p?.image?.src)
            .filter(Boolean);
          if (imageUrls.length > 0) {
            prefetchImages(imageUrls);
          }
        }
      } catch (err) {
        console.error('[FlashSaleSection] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSale();
  }, []); // Empty deps - only run once on mount

  const handleExpire = () => {
    setIsExpired(true);
  };

  const handleSeeAll = () => {
    navigation.navigate('ProductList', {
      collection: 'flash-sale',
      title: flashSale?.title || 'Flash Sale',
    });
  };

  const handleAddToCart = async (product) => {
    try {
      const variant = product?.variants?.[0];
      if (variant) {
        await addToCart({
          variantId: variant.id,
          quantity: 1,
          product,
        });
      }
    } catch (err) {
      console.error('[FlashSaleSection] Add to cart error:', err);
    }
  };

  const renderProduct = ({ item, index }) => (
    <FlashSaleCard
      product={item}
      discountPercentage={flashSale?.discount_percentage || 0}
      soldCount={Math.floor(Math.random() * 50) + 10} // Mock sold count
      totalStock={100}
      onAddToCart={handleAddToCart}
    />
  );

  // Don't show loading spinner - section will appear when data is ready
  // This prevents the perpetual loading spinner when no flash sale exists
  if (loading || !flashSale || isExpired || products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Zap size={20} color={COLORS.burgundy} fill={COLORS.burgundy} />
            <Text style={styles.title}>{flashSale.title || 'Flash Sale'}</Text>
          </View>
          <CountdownTimer
            endTime={flashSale.end_time}
            onExpire={handleExpire}
            size="small"
            showLabels={false}
          />
        </View>

        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={handleSeeAll}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <ChevronRight size={16} color={COLORS.burgundy} />
        </TouchableOpacity>
      </View>

      {/* Products */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id?.toString()}
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
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: COLORS.burgundy,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  productList: {
    paddingHorizontal: SPACING.md,
  },
});

export default FlashSaleSection;
