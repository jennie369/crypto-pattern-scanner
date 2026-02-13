/**
 * RitualHistoryScreen - Lịch sử nghi thức đã thực hiện
 * Vision Board 2.0
 *
 * Features:
 * - Hiển thị danh sách nghi thức đã hoàn thành
 * - Cosmic map visualization
 * - Filter theo loại nghi thức
 * - Chi tiết từng nghi thức
 *
 * Created: December 10, 2025
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
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Flame,
  Star,
  Wind,
  Heart,
  Gift,
  Sparkles,
  Moon,
  Filter,
  ChevronRight,
  MapPin,
  BarChart3,
  TrendingUp,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon mapping
const RITUAL_ICONS = {
  Mail,
  Flame,
  Star,
  Wind,
  Heart,
  Gift,
  Sparkles,
  Moon,
};

// Sample ritual history data
const SAMPLE_HISTORY = [
  {
    id: '1',
    ritualId: 'letter-to-universe',
    title: 'Thư Gửi Vũ Trụ',
    icon: 'Mail',
    content: 'Tôi ước muốn có một công việc tốt hơn và được phát triển bản thân...',
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    gradient: ['#6A5BFF', '#9D4EDD'],
    transformType: 'star',
  },
  {
    id: '2',
    ritualId: 'burn-release',
    title: 'Đốt & Giải Phóng',
    icon: 'Flame',
    content: 'Tôi buông bỏ nỗi sợ thất bại và sự lo lắng về tương lai...',
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    gradient: ['#FF6B6B', '#FF8E53'],
    transformType: 'ash',
  },
  {
    id: '3',
    ritualId: 'gratitude-flow',
    title: 'Dòng Chảy Biết Ơn',
    icon: 'Gift',
    content: 'Tôi biết ơn gia đình, sức khỏe và những người bạn tốt quanh mình...',
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    gradient: ['#FFD700', '#FFA500'],
    transformType: 'blessing',
  },
  {
    id: '4',
    ritualId: 'heart-opening',
    title: 'Mở Rộng Trái Tim',
    icon: 'Heart',
    content: 'Gửi tình yêu đến mẹ và những người thân yêu trong gia đình...',
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    gradient: ['#F093FB', '#F5576C'],
    transformType: 'love',
  },
  {
    id: '5',
    ritualId: 'star-wish',
    title: 'Nghi Thức Ước Sao',
    icon: 'Star',
    content: 'Ước nguyện được bình an và hạnh phúc trong cuộc sống...',
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    gradient: ['#4ECDC4', '#44A08D'],
    transformType: 'sparkle',
  },
];

// Filter tags
const FILTER_TAGS = [
  { key: 'all', label: 'Tất cả', icon: 'Sparkles' },
  { key: 'letter-to-universe', label: 'Thư vũ trụ', icon: 'Mail' },
  { key: 'burn-release', label: 'Đốt & giải phóng', icon: 'Flame' },
  { key: 'gratitude-flow', label: 'Biết ơn', icon: 'Gift' },
  { key: 'heart-opening', label: 'Trái tim', icon: 'Heart' },
];

// Cosmic Star Component
const CosmicStar = ({ ritual, index, onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [index, pulseAnim, opacityAnim]);

  const IconComponent = RITUAL_ICONS[ritual?.icon] || Star;

  // Position stars in a cosmic pattern
  const positions = [
    { left: '15%', top: '20%' },
    { left: '70%', top: '15%' },
    { left: '40%', top: '35%' },
    { left: '80%', top: '45%' },
    { left: '25%', top: '55%' },
  ];

  const pos = positions[index % positions.length];

  return (
    <TouchableOpacity
      style={[styles.cosmicStar, { left: pos.left, top: pos.top }]}
      onPress={() => onPress?.(ritual)}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.cosmicStarInner,
          {
            opacity: opacityAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={ritual?.gradient || ['#6A5BFF', '#9D4EDD']}
          style={styles.cosmicStarGradient}
        >
          <IconComponent size={16} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// History Item Component
const HistoryItem = ({ ritual, onPress }) => {
  const IconComponent = RITUAL_ICONS[ritual?.icon] || Sparkles;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Vừa xong';
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => onPress?.(ritual)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[`${ritual?.gradient?.[0] || '#6A5BFF'}15`, `${ritual?.gradient?.[1] || '#9D4EDD'}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.historyItemGradient}
      >
        {/* Icon */}
        <View
          style={[
            styles.historyItemIcon,
            { backgroundColor: `${ritual?.gradient?.[0] || '#6A5BFF'}25` },
          ]}
        >
          <IconComponent size={22} color={ritual?.gradient?.[0] || '#6A5BFF'} />
        </View>

        {/* Content */}
        <View style={styles.historyItemContent}>
          <Text style={styles.historyItemTitle}>{ritual?.title || ''}</Text>
          <Text style={styles.historyItemText} numberOfLines={2}>
            "{ritual?.content || ''}"
          </Text>
          <View style={styles.historyItemMeta}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.historyItemDate}>
              {formatDate(ritual?.completedAt)}
            </Text>
          </View>
        </View>

        {/* Arrow */}
        <ChevronRight size={20} color={COLORS.textMuted} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Stats Card Component
const StatsCard = ({ totalRituals, streakDays, mostUsed }) => {
  return (
    <View style={styles.statsCard}>
      <LinearGradient
        colors={['rgba(106, 91, 255, 0.15)', 'rgba(157, 78, 221, 0.08)']}
        style={styles.statsCardGradient}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
              <BarChart3 size={18} color="#6A5BFF" />
            </View>
            <Text style={styles.statValue}>{totalRituals}</Text>
            <Text style={styles.statLabel}>Nghi thức</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
              <TrendingUp size={18} color="#FF6B6B" />
            </View>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Ngày liên tiếp</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
              <Star size={18} color="#FFD700" />
            </View>
            <Text style={styles.statValue}>{mostUsed}</Text>
            <Text style={styles.statLabel}>Yêu thích</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Main Screen Component
const RitualHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list or cosmic

  // Filter history
  const filteredHistory =
    selectedFilter === 'all'
      ? SAMPLE_HISTORY
      : SAMPLE_HISTORY.filter((r) => r.ritualId === selectedFilter);

  // Handle ritual press
  const handleRitualPress = (ritual) => {
    // Could navigate to detail view
    console.log('[RitualHistory] Ritual pressed:', ritual?.id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <LinearGradient
        colors={['#0D0221', '#1A0533', '#2D1B4E']}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Clock size={20} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Lịch Sử Nghi Thức</Text>
        </View>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setViewMode(viewMode === 'list' ? 'cosmic' : 'list')}
        >
          <MapPin
            size={22}
            color={viewMode === 'cosmic' ? COLORS.gold : '#FFFFFF'}
          />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Card */}
        <StatsCard
          totalRituals={SAMPLE_HISTORY.length}
          streakDays={5}
          mostUsed="Thư vũ trụ"
        />

        {/* Cosmic Map View */}
        {viewMode === 'cosmic' && (
          <View style={styles.cosmicMapSection}>
            <View style={styles.sectionHeader}>
              <Moon size={18} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Bản Đồ Vũ Trụ</Text>
            </View>

            <View style={styles.cosmicMap}>
              <LinearGradient
                colors={['rgba(13, 2, 33, 0.9)', 'rgba(26, 5, 51, 0.8)']}
                style={styles.cosmicMapGradient}
              >
                {/* Background stars */}
                {[...Array(20)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.mapStar,
                      {
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: 1 + Math.random() * 2,
                        height: 1 + Math.random() * 2,
                      },
                    ]}
                  />
                ))}

                {/* Ritual stars */}
                {filteredHistory.slice(0, 5).map((ritual, index) => (
                  <CosmicStar
                    key={ritual.id}
                    ritual={ritual}
                    index={index}
                    onPress={handleRitualPress}
                  />
                ))}

                {/* Center moon */}
                <View style={styles.centerMoon}>
                  <Moon size={30} color="rgba(255, 215, 0, 0.6)" />
                </View>
              </LinearGradient>
            </View>

            <Text style={styles.cosmicMapHint}>
              Mỗi ngôi sao là một nghi thức bạn đã hoàn thành
            </Text>
          </View>
        )}

        {/* Filter Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTER_TAGS.map((tag) => {
            const isSelected = selectedFilter === tag.key;
            const IconComponent = RITUAL_ICONS[tag.icon] || Sparkles;

            return (
              <TouchableOpacity
                key={tag.key}
                style={[
                  styles.filterTag,
                  isSelected && styles.filterTagSelected,
                ]}
                onPress={() => setSelectedFilter(tag.key)}
              >
                <IconComponent
                  size={14}
                  color={isSelected ? COLORS.gold : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.filterTagText,
                    isSelected && styles.filterTagTextSelected,
                  ]}
                >
                  {tag.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* History List */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={COLORS.purple} />
            <Text style={styles.sectionTitle}>Nghi Thức Gần Đây</Text>
            <Text style={styles.sectionCount}>{filteredHistory.length}</Text>
          </View>

          {filteredHistory.length > 0 ? (
            filteredHistory.map((ritual) => (
              <HistoryItem
                key={ritual.id}
                ritual={ritual}
                onPress={handleRitualPress}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Sparkles size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyStateText}>
                Chưa có nghi thức nào được ghi lại
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Bắt đầu thực hiện nghi thức đầu tiên của bạn
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0221',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Stats Card
  statsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  statsCardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Cosmic Map
  cosmicMapSection: {
    marginBottom: SPACING.lg,
  },
  cosmicMap: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  cosmicMapGradient: {
    flex: 1,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderRadius: 20,
  },
  mapStar: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    opacity: 0.5,
  },
  cosmicStar: {
    position: 'absolute',
  },
  cosmicStarInner: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cosmicStarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMoon: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -15,
    marginTop: -15,
    opacity: 0.5,
  },
  cosmicMapHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },

  // Filter
  filterContainer: {
    paddingVertical: SPACING.sm,
    gap: 8,
    marginBottom: SPACING.md,
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

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // History
  historySection: {
    marginTop: SPACING.sm,
  },
  historyItem: {
    marginBottom: SPACING.sm,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  historyItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  historyItemText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 6,
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyItemDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});

export default RitualHistoryScreen;
