/**
 * AllCategoriesScreen.js - All Categories Screen
 * Full list of shop categories with search
 * Sử dụng tags mapping giống SHOP_TABS trong shopConfig.js
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Gem,
  BookOpen,
  Star,
  Package,
  Gift,
  Flower2,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';

// All categories with icons and TAGS (matching Shopify tags exactly)
const ALL_CATEGORIES = [
  {
    id: 'crystals',
    name: 'Đá Quý Phong Thủy',
    icon: Gem,
    color: '#E91E63',
    description: 'Thạch anh, Amethyst, Citrine và nhiều loại đá quý khác',
    tags: [
      // Loại đá chính
      'Thạch Anh Tím',
      'Thạch Anh Hồng',
      'Thạch Anh Trắng',
      'Thạch Anh Vàng',
      'Thạch Anh Xanh',
      'Khói Xám',
      'Hematite',
      'Aura',
      'Aquamarine',
      'Huyền Kim Trụ',
      // Hình dạng
      'Cụm',
      'Trụ',
      'viên',
      'Vòng Tay',
      // Set & Collections
      'Set',
      'Special set',
      'Cây Tài Lộc',
      'Hot Product',
      'Bestseller',
      // Tinh dầu
      'Tinh dầu nước hoa Jérie',
      // General
      'crystals',
    ],
  },
  {
    id: 'courses',
    name: 'Khóa Học',
    icon: BookOpen,
    color: '#9C27B0',
    description: 'Trading, Chiêm tinh, Tarot và các khóa học tâm linh',
    tags: [
      'Khóa học Trading',
      'Khóa học',
      'khoa-hoc',
      'trading-course',
      'tan-so-goc',
      'tier-starter',
      'Tier 1',
      'Tier 2',
      'Tier 3',
      'khai-mo',
      'gem-academy',
      'Gem Trading',
      'Ebook',
      'digital',
      'course',
      '7-ngay',
    ],
  },
  {
    id: 'subscriptions',
    name: 'Gói VIP & Premium',
    icon: Star,
    color: '#FFBD59',
    description: 'Nâng cấp tài khoản để truy cập đầy đủ tính năng',
    tags: [
      'GEM Chatbot',
      'Scanner',
      'subscription',
      'premium',
      'vip',
      'GemMaster Pro',
      'Scanner VIP',
      'Gem Pack',
      'virtual-currency',
      'in-app',
      'gems',
    ],
  },
  {
    id: 'merchandise',
    name: 'Phụ Kiện',
    icon: Package,
    color: '#2196F3',
    description: 'Vòng tay, dây chuyền, nhẫn và phụ kiện phong thủy',
    tags: [
      'Vòng Tay',
      'Dây Chuyền',
      'Nhẫn',
      'Phụ Kiện',
      'merchandise',
      'accessory',
      'jewelry',
    ],
  },
  {
    id: 'gems',
    name: 'Gems Token',
    icon: Gift,
    color: '#4CAF50',
    description: 'Mua Gems để sử dụng các tính năng premium',
    tags: [
      'Gem Pack',
      'virtual-currency',
      'in-app',
      'gems',
      'token',
    ],
  },
  {
    id: 'meditation',
    name: 'Thiền & Yoga',
    icon: Flower2,
    color: '#00BCD4',
    description: 'Đệm thiền, nến thơm, tinh dầu và dụng cụ yoga',
    tags: [
      'Thiền',
      'Yoga',
      'Meditation',
      'Nến Thơm',
      'Tinh Dầu',
      'Đệm Thiền',
      'Tinh dầu nước hoa Jérie',
      'wellness',
    ],
  },
  {
    id: 'trading',
    name: 'Trading Tools',
    icon: TrendingUp,
    color: '#00F0FF',
    description: 'Công cụ và khóa học trading chuyên nghiệp',
    tags: [
      'Scanner',
      'Trading',
      'Trading Tool',
      'GEM Scanner',
      'Khóa học Trading',
    ],
  },
];

const AllCategoriesScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleCategoryPress = (category) => {
    // Navigate với tags array thay vì collection (giống ShopScreen)
    navigation.navigate('ProductList', {
      tags: category.tags,
      title: category.name,
    });
  };

  const renderCategory = ({ item }) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <IconComponent
            size={28}
            color={item.color}
            strokeWidth={1.5}
          />
        </View>

        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <ChevronRight size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Danh mục</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Categories List */}
      <FlatList
        data={ALL_CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    width: 40,
  },
  listContent: {
    padding: SPACING.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  categoryName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xxs,
  },
  categoryDescription: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 18,
  },
});

export default AllCategoriesScreen;
