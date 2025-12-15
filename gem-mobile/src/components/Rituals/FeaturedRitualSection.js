/**
 * Featured Ritual Section Component
 * Vision Board 2.0 - Ritual Hub UI
 *
 * Features:
 * - Featured Daily Ritual Card (large)
 * - Ritual Library với horizontal scroll
 * - Vertical ritual list
 * - Quick Actions
 * - Cosmic theme với animations
 *
 * Created: December 10, 2025
 * Updated: December 10, 2025 - Vietnamese + Lucide icons
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Moon,
  Sparkles,
  Heart,
  Coins,
  HeartHandshake,
  Plus,
  Mail,
  Flame,
  Star,
  Wind,
  Gift,
  Clock,
  ChevronRight,
  ArrowRight,
  Feather,
  Sun,
  Leaf,
  Droplets,
  Zap,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon mapping
const ICONS = {
  Moon,
  Sparkles,
  Heart,
  Coins,
  HeartHandshake,
  Plus,
  Mail,
  Flame,
  Star,
  Wind,
  Gift,
  Clock,
  ChevronRight,
  ArrowRight,
  Feather,
  Sun,
  Leaf,
  Droplets,
  Zap,
};

// Ritual Categories/Tags - Tiếng Việt
const RITUAL_TAGS = [
  { key: 'all', label: 'Tất cả', icon: 'Sparkles' },
  { key: 'healing', label: 'Chữa lành', icon: 'Heart' },
  { key: 'abundance', label: 'Thịnh vượng', icon: 'Coins' },
  { key: 'love', label: 'Tình yêu', icon: 'HeartHandshake' },
  { key: 'custom', label: 'Tùy chỉnh', icon: 'Plus' },
];

// Featured Ritual Data - Tiếng Việt
const FEATURED_RITUAL = {
  id: 'letter-to-universe',
  title: 'Thư Gửi Vũ Trụ',
  subtitle: 'Gửi điều ước đến vũ trụ bao la',
  icon: 'Mail',
  duration: '5-10 phút',
  type: 'intention',
  tags: ['ý định', 'mở rộng'],
  gradient: ['#6A5BFF', '#9D4EDD'],
  description: 'Viết ra những ý định sâu thẳm nhất và gửi chúng đến vũ trụ qua nghi thức thiêng liêng này.',
};

// Ritual Library Data - Tiếng Việt
const RITUAL_LIBRARY = [
  {
    id: 'burn-release',
    title: 'Đốt & Giải Phóng',
    subtitle: 'Buông bỏ và chuyển hóa năng lượng',
    icon: 'Flame',
    duration: '5 phút',
    type: 'healing',
    tags: ['chữa lành', 'giải phóng'],
    gradient: ['#FF6B6B', '#FF8E53'],
  },
  {
    id: 'water-manifest',
    title: 'Nghi Thức Nước',
    subtitle: 'Manifest ước muốn qua năng lượng nước',
    icon: 'Droplets',
    duration: '5 phút',
    type: 'abundance',
    tags: ['thịnh vượng', 'biểu hiện'],
    gradient: ['#4169E1', '#1E90FF'],
  },
  {
    id: 'purify-breathwork',
    title: 'Thở Thanh Lọc',
    subtitle: 'Làm sạch không gian cảm xúc',
    icon: 'Wind',
    duration: '5 phút',
    type: 'healing',
    tags: ['hơi thở', 'thanh lọc'],
    gradient: ['#667EEA', '#764BA2'],
  },
  {
    id: 'heart-opening',
    title: 'Mở Rộng Trái Tim',
    subtitle: 'Nghi thức tần số yêu thương',
    icon: 'Heart',
    duration: '7 phút',
    type: 'love',
    tags: ['tình yêu', 'tần số'],
    gradient: ['#F093FB', '#F5576C'],
  },
  {
    id: 'gratitude-flow',
    title: 'Dòng Chảy Biết Ơn',
    subtitle: 'Thu hút thêm nhiều phước lành',
    icon: 'Gift',
    duration: '4 phút',
    type: 'abundance',
    tags: ['biết ơn', 'thịnh vượng'],
    gradient: ['#FFD700', '#FFA500'],
  },
];

// Animated Sparkle Component
const SparkleEffect = ({ delay = 0, size = 4, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, [delay, opacity, scale]);

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FFD700',
          opacity,
          transform: [{ scale }],
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: size,
        },
        style,
      ]}
    />
  );
};

// Featured Ritual Card (Large)
const FeaturedRitualCard = ({ ritual, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const IconComponent = ICONS[ritual?.icon] || Sparkles;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.featuredCard, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={ritual?.gradient || ['#6A5BFF', '#9D4EDD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredGradient}
        >
          {/* Glow effect */}
          <Animated.View style={[styles.featuredGlow, { opacity: glowOpacity }]} />

          {/* Sparkles */}
          <SparkleEffect delay={0} size={6} style={{ position: 'absolute', top: 30, right: 40 }} />
          <SparkleEffect delay={500} size={4} style={{ position: 'absolute', top: 60, right: 80 }} />
          <SparkleEffect delay={1000} size={5} style={{ position: 'absolute', top: 100, right: 30 }} />
          <SparkleEffect delay={300} size={3} style={{ position: 'absolute', bottom: 60, left: 50 }} />

          {/* Badge */}
          <View style={styles.featuredBadge}>
            <Moon size={12} color="#FFD700" />
            <Text style={styles.featuredBadgeText}>Nghi thức hôm nay</Text>
          </View>

          {/* Content */}
          <View style={styles.featuredContent}>
            <View style={styles.featuredIconContainer}>
              <IconComponent size={32} color="#FFFFFF" />
            </View>

            <View style={styles.featuredTextContainer}>
              <Text style={styles.featuredTitle}>{ritual?.title || 'Nghi thức'}</Text>
              <Text style={styles.featuredSubtitle}>"{ritual?.subtitle || ''}"</Text>

              {/* Tags */}
              <View style={styles.featuredTags}>
                {(ritual?.tags || []).map((tag, index) => (
                  <View key={index} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Duration */}
          <View style={styles.featuredDuration}>
            <Clock size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featuredDurationText}>{ritual?.duration || '5 phút'}</Text>
          </View>

          {/* CTA Button */}
          <TouchableOpacity style={styles.featuredCTA} onPress={onPress}>
            <Text style={styles.featuredCTAText}>Bắt đầu</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Small Ritual Card (for horizontal scroll)
const SmallRitualCard = ({ ritual, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.03,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const IconComponent = ICONS[ritual?.icon] || Sparkles;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.smallCard, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={[`${ritual?.gradient?.[0] || '#6A5BFF'}40`, `${ritual?.gradient?.[1] || '#9D4EDD'}20`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.smallCardGradient}
        >
          {/* Icon */}
          <View style={[styles.smallCardIcon, { backgroundColor: `${ritual?.gradient?.[0] || '#6A5BFF'}30` }]}>
            <IconComponent size={24} color={ritual?.gradient?.[0] || '#6A5BFF'} />
          </View>

          {/* Title */}
          <Text style={styles.smallCardTitle} numberOfLines={2}>{ritual?.title || ''}</Text>

          {/* Duration */}
          <View style={styles.smallCardDuration}>
            <Clock size={10} color={COLORS.textMuted} />
            <Text style={styles.smallCardDurationText}>{ritual?.duration || ''}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Vertical Ritual Item
const RitualListItem = ({ ritual, onPress }) => {
  const IconComponent = ICONS[ritual?.icon] || Sparkles;

  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[`${ritual?.gradient?.[0] || '#6A5BFF'}15`, `${ritual?.gradient?.[1] || '#9D4EDD'}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.listItemGradient}
      >
        {/* Icon */}
        <View style={[styles.listItemIcon, { backgroundColor: `${ritual?.gradient?.[0] || '#6A5BFF'}25` }]}>
          <IconComponent size={22} color={ritual?.gradient?.[0] || '#6A5BFF'} />
        </View>

        {/* Content */}
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle}>{ritual?.title || ''}</Text>
          <Text style={styles.listItemSubtitle}>"{ritual?.subtitle || ''}"</Text>
        </View>

        {/* Duration & Arrow */}
        <View style={styles.listItemRight}>
          <Text style={styles.listItemDuration}>{ritual?.duration || ''}</Text>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Filter Tags Component
const FilterTags = ({ selectedTag, onSelectTag }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterTagsContainer}
    >
      {RITUAL_TAGS.map((tag) => {
        const isSelected = selectedTag === tag.key;
        const IconComponent = ICONS[tag.icon] || Sparkles;

        return (
          <TouchableOpacity
            key={tag.key}
            style={[styles.filterTag, isSelected && styles.filterTagSelected]}
            onPress={() => onSelectTag(tag.key)}
          >
            <IconComponent
              size={14}
              color={isSelected ? COLORS.gold : COLORS.textMuted}
            />
            <Text style={[styles.filterTagText, isSelected && styles.filterTagTextSelected]}>
              {tag.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// Quick Actions Component
const QuickActions = ({ onCreateRitual, onAmbientMode }) => {
  return (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.quickActionBtn} onPress={onCreateRitual}>
        <LinearGradient
          colors={['rgba(106, 91, 255, 0.2)', 'rgba(106, 91, 255, 0.1)']}
          style={styles.quickActionGradient}
        >
          <Plus size={18} color={COLORS.purple} />
          <Text style={styles.quickActionText}>Tạo nghi thức</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickActionBtn} onPress={onAmbientMode}>
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']}
          style={styles.quickActionGradient}
        >
          <Moon size={18} color={COLORS.gold} />
          <Text style={[styles.quickActionText, { color: COLORS.gold }]}>Chế độ thiền</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Main Featured Ritual Section Component
const FeaturedRitualSection = ({
  onRitualPress,
  onCreateRitual,
  onAmbientMode,
  onViewAllRituals,
  style,
}) => {
  const [selectedTag, setSelectedTag] = useState('all');

  // Filter rituals by tag
  const filteredRituals = selectedTag === 'all'
    ? RITUAL_LIBRARY
    : RITUAL_LIBRARY.filter(r => r.type === selectedTag || (r.tags || []).includes(selectedTag));

  // Split rituals for horizontal and vertical display
  const horizontalRituals = filteredRituals.slice(0, 3);
  const verticalRituals = filteredRituals.slice(3);

  return (
    <View style={[styles.container, style]}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Moon size={20} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Nghi Thức Gợi Ý</Text>
        </View>
        {onViewAllRituals && (
          <TouchableOpacity onPress={onViewAllRituals} style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <ChevronRight size={16} color={COLORS.purple} />
          </TouchableOpacity>
        )}
      </View>

      {/* Featured Ritual Card */}
      <FeaturedRitualCard
        ritual={FEATURED_RITUAL}
        onPress={() => onRitualPress?.(FEATURED_RITUAL)}
      />

      {/* Ritual Library Section */}
      <View style={styles.librarySection}>
        <View style={styles.libraryHeader}>
          <Sparkles size={18} color={COLORS.purple} />
          <Text style={styles.libraryTitle}>Thư Viện Nghi Thức</Text>
        </View>

        {/* Filter Tags */}
        <FilterTags selectedTag={selectedTag} onSelectTag={setSelectedTag} />

        {/* Horizontal Scroll Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {horizontalRituals.map((ritual) => (
            <SmallRitualCard
              key={ritual.id}
              ritual={ritual}
              onPress={() => onRitualPress?.(ritual)}
            />
          ))}
        </ScrollView>

        {/* Vertical List */}
        {verticalRituals.length > 0 && (
          <View style={styles.verticalList}>
            <Text style={styles.moreRitualsLabel}>Các nghi thức khác</Text>
            {verticalRituals.map((ritual) => (
              <RitualListItem
                key={ritual.id}
                ritual={ritual}
                onPress={() => onRitualPress?.(ritual)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <QuickActions
        onCreateRitual={onCreateRitual}
        onAmbientMode={onAmbientMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Featured Card
  featuredCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  featuredGradient: {
    padding: SPACING.lg,
    minHeight: 220,
    position: 'relative',
  },
  featuredGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    flex: 1,
  },
  featuredIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredTextContainer: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  featuredTags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  featuredDuration: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredDurationText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  featuredCTA: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featuredCTAText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Library Section
  librarySection: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.md,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  libraryTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Filter Tags
  filterTagsContainer: {
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterTagSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: COLORS.gold,
  },
  filterTagText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterTagTextSelected: {
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Horizontal Scroll
  horizontalScroll: {
    paddingVertical: SPACING.sm,
    gap: 16,
  },

  // Small Card
  smallCard: {
    width: 140,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  smallCardGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  smallCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  smallCardDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  smallCardDurationText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Vertical List
  verticalList: {
    marginTop: SPACING.md,
  },
  moreRitualsLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },

  // List Item
  listItem: {
    marginBottom: SPACING.sm,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  listItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  listItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  listItemDuration: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickActionBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.purple,
  },
});

export default FeaturedRitualSection;
