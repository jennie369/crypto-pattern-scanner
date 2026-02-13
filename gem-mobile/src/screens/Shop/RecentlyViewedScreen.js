/**
 * RecentlyViewedScreen.js - Recently Viewed Products Screen
 * Full list of recently viewed products with clear option
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react-native';
import {
  getRecentlyViewed,
  clearRecentlyViewed,
  removeFromRecentlyViewed,
} from '../../services/recentlyViewedService';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';

const RecentlyViewedScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recently viewed
  const fetchItems = useCallback(async () => {
    try {
      const data = await getRecentlyViewed(50); // Get more for full list
      setItems(data);
    } catch (err) {
      console.error('[RecentlyViewedScreen] Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Refresh on pull
  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  // Handle clear all
  const handleClearAll = () => {
    Alert.alert(
      'Xóa lịch sử xem?',
      'Bạn có chắc muốn xóa toàn bộ lịch sử xem sản phẩm?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            const result = await clearRecentlyViewed();
            if (result.success) {
              setItems([]);
            }
          },
        },
      ]
    );
  };

  // Handle remove single item
  const handleRemoveItem = async (item) => {
    const result = await removeFromRecentlyViewed(item.product_id);
    if (result.success) {
      setItems(prev => prev.filter(i => i.product_id !== item.product_id));
    }
  };

  // Handle product press
  const handleProductPress = (item) => {
    navigation.navigate('ProductDetail', {
      productId: item.product_id,
      handle: item.product_handle,
    });
  };

  // Format price
  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xem';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.9}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {item.product_image ? (
          <Image
            source={{ uri: item.product_image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Clock size={24} color={COLORS.textMuted} />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.product_title || 'Sản phẩm'}
        </Text>

        <Text style={styles.productPrice}>
          {formatPrice(item.product_price)}
        </Text>

        <Text style={styles.viewedAt}>
          {formatTimeAgo(item.viewed_at)}
        </Text>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveItem(item)}
        activeOpacity={0.7}
      >
        <Trash2 size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Clock size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chưa có lịch sử xem</Text>
      <Text style={styles.emptyText}>
        Các sản phẩm bạn đã xem sẽ hiển thị ở đây
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đã xem gần đây</Text>
        {items.length > 0 ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.burgundy} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || item.product_id}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.burgundy}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  headerRight: {
    width: 80,
  },
  clearButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  clearText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    width: 80,
    height: 80,
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
  infoContainer: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  productTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: 2,
  },
  productPrice: {
    color: COLORS.cyan,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 2,
  },
  viewedAt: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  removeBtn: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
  },
});

export default RecentlyViewedScreen;
