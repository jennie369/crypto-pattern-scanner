/**
 * CourseCategoryGrid.js - Course Category Grid Component
 * Beautiful 2-card layout for Trading and Mindset courses
 * Consistent with dark theme
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  TrendingUp,
  Brain,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

// Only 2 course categories - filter by Shopify tags
const COURSE_CATEGORIES = [
  {
    id: 'trading',
    name: 'Khóa học Trading',
    description: 'Phân tích & giao dịch',
    icon: TrendingUp,
    gradient: ['rgba(106, 91, 255, 0.15)', 'rgba(106, 91, 255, 0.05)'],
    iconColor: COLORS.purple,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    // Shopify tags to match
    filterTags: ['Khóa học Trading', 'trading-course', 'trading', 'Gem Trading'],
  },
  {
    id: 'mindset',
    name: 'Khóa học Tư duy',
    description: 'Tâm lý & chiến lược',
    icon: Brain,
    gradient: ['rgba(255, 189, 89, 0.15)', 'rgba(255, 189, 89, 0.05)'],
    iconColor: COLORS.gold,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    // Shopify tags to match
    filterTags: ['Khóa học tư duy', 'mindset', 'spiritual', 'healing', 'tan-so-goc'],
  },
];

const CourseCategoryGrid = ({ style, onCategoryPress }) => {
  const navigation = useNavigation();

  const handleCategoryPress = (category) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    } else {
      // Navigate with filterTags for tag-based filtering
      navigation.navigate('Courses', {
        filterTags: category.filterTags,
        title: category.name,
        categoryId: category.id,
      });
    }
  };

  const renderCategoryCard = (category) => {
    const IconComponent = category.icon;

    return (
      <TouchableOpacity
        key={category.id}
        style={styles.cardWrapper}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={category.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor: category.borderColor }]}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${category.iconColor}15` }]}>
            <IconComponent
              size={28}
              color={category.iconColor}
              strokeWidth={1.8}
            />
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {category.name}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={1}>
              {category.description}
            </Text>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <ChevronRight
              size={18}
              color={COLORS.textMuted}
              strokeWidth={2}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Cards - title is rendered by parent */}
      <View style={styles.cardsRow}>
        {COURSE_CATEGORIES.map(renderCategoryCard)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    minHeight: 120,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  arrowContainer: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
});

export default CourseCategoryGrid;
