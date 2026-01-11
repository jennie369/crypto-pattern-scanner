/**
 * CategoryGrid.js - Category Grid Component
 * 2-row scrollable category grid with icons
 * Navigates to ProductList with tags filter (matching Shopify tags)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Gem,
  BookOpen,
  Star,
  Package,
  Gift,
  Flower2,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 4) / 5;

// Category configuration with icons, colors, and TAGS (matching Shopify)
const SHOP_CATEGORIES = [
  {
    id: 'crystals',
    name: 'Đá Quý',
    icon: Gem,
    color: '#E91E63',
    tags: [
      'Thạch Anh Tím', 'Thạch Anh Hồng', 'Thạch Anh Trắng', 'Thạch Anh Vàng',
      'Thạch Anh Xanh', 'Khói Xám', 'Hematite', 'Aura', 'Aquamarine',
      'Huyền Kim Trụ', 'Cụm', 'Trụ', 'viên', 'Vòng Tay', 'Set', 'Special set',
      'Cây Tài Lộc', 'Hot Product', 'Bestseller', 'Tinh dầu nước hoa Jérie', 'crystals',
    ],
  },
  {
    id: 'courses',
    name: 'Khóa Học',
    icon: BookOpen,
    color: '#9C27B0',
    tags: [
      'Khóa học Trading', 'Khóa học', 'khoa-hoc', 'trading-course', 'tan-so-goc',
      'tier-starter', 'Tier 1', 'Tier 2', 'Tier 3', 'khai-mo', 'gem-academy',
      'Gem Trading', 'Ebook', 'digital', 'course', '7-ngay',
    ],
  },
  {
    id: 'subscriptions',
    name: 'Gói VIP',
    icon: Star,
    color: '#FFBD59',
    tags: [
      'GEM Chatbot', 'Scanner', 'subscription', 'premium', 'vip',
      'GemMaster Pro', 'Scanner VIP', 'Gem Pack', 'virtual-currency', 'in-app', 'gems',
    ],
  },
  {
    id: 'merchandise',
    name: 'Phụ Kiện',
    icon: Package,
    color: '#2196F3',
    tags: ['Vòng Tay', 'Dây Chuyền', 'Nhẫn', 'Phụ Kiện', 'merchandise', 'accessory', 'jewelry'],
  },
  {
    id: 'gems',
    name: 'Gems Token',
    icon: Gift,
    color: '#4CAF50',
    tags: ['Gem Pack', 'virtual-currency', 'in-app', 'gems', 'token'],
  },
  {
    id: 'meditation',
    name: 'Thiền',
    icon: Flower2,
    color: '#00BCD4',
    tags: ['Thiền', 'Yoga', 'Meditation', 'Nến Thơm', 'Tinh Dầu', 'Đệm Thiền', 'Tinh dầu nước hoa Jérie', 'wellness'],
  },
  {
    id: 'trading',
    name: 'Trading',
    icon: TrendingUp,
    color: '#00F0FF',
    tags: ['Scanner', 'Trading', 'Trading Tool', 'GEM Scanner', 'Khóa học Trading'],
  },
  {
    id: 'more',
    name: 'Xem thêm',
    icon: MoreHorizontal,
    screen: 'AllCategories',
    color: '#9E9E9E',
  },
];

const CategoryGrid = ({ style }) => {
  const navigation = useNavigation();

  // Split categories into two rows
  const row1 = SHOP_CATEGORIES.slice(0, 5);
  const row2 = SHOP_CATEGORIES.slice(5, 10);

  const handleCategoryPress = (category) => {
    if (category.screen) {
      // Navigate to a specific screen (like AllCategories)
      navigation.navigate(category.screen);
    } else if (category.tags) {
      // Navigate to ProductList with tags filter (giống ShopScreen)
      navigation.navigate('ProductList', {
        tags: category.tags,
        title: category.name,
      });
    }
  };

  const renderCategoryItem = (category) => {
    const IconComponent = category.icon;

    return (
      <TouchableOpacity
        key={category.id}
        style={styles.categoryItem}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${category.color}20` }]}>
          <IconComponent
            size={24}
            color={category.color}
            strokeWidth={1.5}
          />
        </View>
        <Text style={styles.categoryName} numberOfLines={1}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <View style={styles.row}>
            {row1.map(renderCategoryItem)}
          </View>
          {/* Row 2 */}
          <View style={styles.row}>
            {row2.map(renderCategoryItem)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  gridContainer: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  categoryItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryName: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
  },
});

export default CategoryGrid;
