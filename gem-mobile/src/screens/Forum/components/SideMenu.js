/**
 * Gemral - Side Menu Component
 * Burger menu with feed filters, quick actions, and custom feeds (Threads-style)
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  Bookmark,
  X,
  Plus,
  Edit3,
  Sparkles,
  Users,
  DollarSign,
  Rocket,
  TrendingUp,
  Gem,
  Target,
  Hash,
  // Section icons
  Crosshair,
  Compass,
  Star,
  Coins,
  Rss
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SideMenu = ({
  isOpen,
  onClose,
  selectedFeed,
  onFeedSelect,
  onQuickAction,
  onCreateFeed,
  onEditFeeds,
  customFeeds = [],
  trendingHashtags = [],
}) => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-280)).current;

  // Tooltip state
  const [tooltipText, setTooltipText] = useState('');
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipTimer = useRef(null);

  const showTooltip = (text) => {
    // Clear any existing timer
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltipText(text);
    tooltipOpacity.setValue(0);
    Animated.timing(tooltipOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    tooltipTimer.current = setTimeout(() => {
      Animated.timing(tooltipOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setTooltipText(''));
    }, 2500);
  };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 0 : -280,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [isOpen]);

  // Cleanup tooltip timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    };
  }, []);

  const handleHashtagPress = (hashtag) => {
    onClose();
    navigation.navigate('HashtagFeed', { hashtag });
  };

  // System feeds (cannot be edited)
  // Note: "Khám phá" is the main personalized feed (shown in CategoryTabs)
  const systemFeeds = [
    {
      section: 'NGUỒN TIN',
      sectionIcon: Rss,
      items: [
        { id: 'following', title: 'Đang Theo Dõi', subtitle: 'Người bạn follow', Icon: Users },
      ],
    },
  ];

  // Category feeds - Gemral Philosophy: Trading / Tinh Thần / Integration
  const categoryFeeds = [
    {
      section: 'GIAO DỊCH',
      sectionIcon: Crosshair,
      items: [
        { id: 'trading', title: 'Phân Tích Thị Trường', subtitle: 'Crypto & futures', Icon: TrendingUp },
        { id: 'patterns', title: 'Chia Sẻ Tips Hay', subtitle: 'GEM Method', Icon: Target },
        { id: 'results', title: 'Kết Quả Giao Dịch', subtitle: 'Chia sẻ P/L', Icon: DollarSign },
      ],
    },
    {
      section: 'TINH THẦN',
      sectionIcon: Compass,
      items: [
        { id: 'wellness', title: 'Review Đá Crystal', subtitle: 'Crystal healing', Icon: Gem },
        { id: 'meditation', title: 'Luật Hấp Dẫn', subtitle: 'Mindset & năng lượng', Icon: Sparkles },
        { id: 'growth', title: 'Tips Chữa Lành', subtitle: 'Phát triển bản thân', Icon: Users },
      ],
    },
    {
      section: 'THỊNH VƯỢNG',
      sectionIcon: Star,
      items: [
        { id: 'mindful-trading', title: 'Giao Dịch Chánh Niệm', subtitle: 'Kết hợp cả hai', Icon: Target },
        { id: 'sieu-giau', title: 'Tips Trader Thành Công', subtitle: 'Tư duy thịnh vượng', Icon: Rocket },
      ],
    },
    {
      section: 'KIẾM TIỀN',
      sectionIcon: Coins,
      items: [
        { id: 'earn', title: 'Affiliate & CTV', subtitle: 'Cơ hội hợp tác', Icon: DollarSign },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Container: backdrop and panel as SIBLINGS, not parent-child.
          This prevents the backdrop's touch handler from intercepting
          scroll gestures inside the panel. */}
      <View style={styles.container}>
        {/* Backdrop - only catches taps OUTSIDE the panel to dismiss */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Side Panel - NOT nested inside any touchable */}
        <Animated.View
          style={[
            styles.sidePanel,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Menu Header - Glass Morphism Liquid Effect */}
          <BlurView
            intensity={80}
            tint="dark"
            style={styles.menuHeader}
          >
            {/* Liquid Glass Gradient Overlay */}
            <LinearGradient
              colors={[
                'rgba(15, 16, 48, 0.75)',
                'rgba(106, 91, 255, 0.15)',
                'rgba(15, 16, 48, 0.85)',
              ]}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            {/* Top Sheen for Liquid Effect */}
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.topSheen}
              pointerEvents="none"
            />

            <View style={styles.menuHeaderContent}>
              <View style={styles.menuHeaderTop}>
                <Text style={styles.menuTitle}>Gemral</Text>

                {/* Action Buttons (Tạo, Sửa, Close) */}
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.headerActionBtn}
                    onPress={() => {
                      onClose();
                      onCreateFeed?.();
                    }}
                    onLongPress={() => showTooltip('Tạo feed mới – Tùy chỉnh nguồn tin theo chủ đề bạn quan tâm')}
                  >
                    <Plus size={20} color={COLORS.gold} strokeWidth={2.5} />
                    <Text style={styles.iconLabel}>Tạo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerActionBtn}
                    onPress={() => {
                      onClose();
                      onEditFeeds?.();
                    }}
                    onLongPress={() => showTooltip('Chỉnh sửa feed – Sắp xếp, đổi tên hoặc xóa feed')}
                  >
                    <Edit3 size={20} color={COLORS.gold} strokeWidth={2.5} />
                    <Text style={styles.iconLabel}>Sửa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerActionBtn}
                    onPress={onClose}
                  >
                    <X size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tooltip bubble */}
              {tooltipText !== '' && (
                <Animated.View style={[styles.tooltipBubble, { opacity: tooltipOpacity }]}>
                  <Text style={styles.tooltipText}>{tooltipText}</Text>
                </Animated.View>
              )}

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => {
                    onQuickAction?.('liked');
                    onClose();
                  }}
                >
                  <Heart size={16} color={COLORS.error} />
                  <Text style={styles.quickActionText}>Đã Thích</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => {
                    onQuickAction?.('saved');
                    onClose();
                  }}
                >
                  <Bookmark size={16} color={COLORS.gold} />
                  <Text style={styles.quickActionText}>Đã Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>

          {/* Feed List - Glass Morphism Liquid Effect */}
          <BlurView
            intensity={80}
            tint="dark"
            style={styles.feedListBlur}
          >
            {/* Decorative gradients — pointerEvents="none" so they never steal touches */}
            <LinearGradient
              colors={[
                'rgba(15, 16, 48, 0.85)',
                'rgba(106, 91, 255, 0.12)',
                'rgba(138, 123, 255, 0.08)',
                'rgba(106, 91, 255, 0.06)',
                'rgba(15, 16, 48, 0.92)',
              ]}
              locations={[0, 0.2, 0.45, 0.7, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.2, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.3 }}
              style={styles.topHighlight}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(106, 91, 255, 0.1)', 'rgba(106, 91, 255, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.leftSheen}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(138, 123, 255, 0.05)', 'transparent', 'rgba(138, 123, 255, 0.03)']}
              locations={[0, 0.5, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.innerGlow}
              pointerEvents="none"
            />

            <ScrollView
              style={styles.feedList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              contentContainerStyle={styles.feedListContent}
            >
              {/* System Feeds */}
              {systemFeeds.map((section, sectionIndex) => {
                const SectionIcon = section.sectionIcon;
                return (
              <View key={`system-${sectionIndex}`} style={styles.feedSection}>
                <View style={styles.sectionHeader}>
                  {SectionIcon && (
                    <SectionIcon size={12} color={COLORS.textMuted} strokeWidth={2} />
                  )}
                  <Text style={styles.sectionTitle}>{section.section}</Text>
                </View>

                {section.items.map((item) => {
                  const IconComponent = item.Icon;
                  const isActive = selectedFeed === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.feedItem,
                        isActive && styles.feedItemActive,
                      ]}
                      onPress={() => onFeedSelect(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.feedItemRow}>
                        {IconComponent && (
                          <IconComponent
                            size={18}
                            color={COLORS.gold}
                            style={styles.feedIcon}
                          />
                        )}
                        <View style={styles.feedItemText}>
                          <Text style={[styles.feedItemTitle, isActive && styles.feedItemTitleActive]}>
                            {item.title}
                          </Text>
                          {item.subtitle && (
                            <Text style={styles.feedItemSubtitle}>
                              {item.subtitle}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
                );
              })}

            {/* Custom Feeds (User-created) */}
            {customFeeds.length > 0 && (
              <View style={styles.feedSection}>
                <Text style={styles.sectionTitle}>FEED TÙY CHỈNH</Text>

                {customFeeds.map((feed) => {
                  const isActive = selectedFeed === feed.id;
                  return (
                    <TouchableOpacity
                      key={feed.id}
                      style={[
                        styles.feedItem,
                        isActive && styles.feedItemActive,
                      ]}
                      onPress={() => onFeedSelect(feed.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.feedItemRow}>
                        <Sparkles size={18} color={COLORS.gold} style={styles.feedIcon} />
                        <View style={styles.feedItemText}>
                          <Text style={[styles.feedItemTitle, isActive && styles.feedItemTitleActive]}>
                            {feed.name}
                          </Text>
                          <Text style={styles.feedItemSubtitle}>
                            {feed.topics?.length || 0} chủ đề
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Trending Hashtags Section */}
            {trendingHashtags.length > 0 && (
              <View style={styles.feedSection}>
                <View style={styles.sectionHeader}>
                  <Hash size={12} color={COLORS.textMuted} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>XU HUONG</Text>
                </View>

                {trendingHashtags.map((item, index) => (
                  <TouchableOpacity
                    key={`trending-${index}`}
                    style={styles.trendingItem}
                    onPress={() => handleHashtagPress(item.hashtag)}
                    activeOpacity={0.7}
                  >
                    <Hash size={16} color={COLORS.cyan} style={styles.feedIcon} />
                    <View style={styles.feedItemText}>
                      <Text style={styles.hashtagText}>#{item.hashtag}</Text>
                      <Text style={styles.feedItemSubtitle}>{item.count} bai viet</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Category Feeds */}
            {categoryFeeds.map((section, sectionIndex) => {
              const SectionIcon = section.sectionIcon;
              return (
              <View key={`category-${sectionIndex}`} style={styles.feedSection}>
                <View style={styles.sectionHeader}>
                  {SectionIcon && (
                    <SectionIcon size={12} color={COLORS.textMuted} strokeWidth={2} />
                  )}
                  <Text style={styles.sectionTitle}>{section.section}</Text>
                </View>

                {section.items.map((item) => {
                  const IconComponent = item.Icon;
                  const isActive = selectedFeed === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.feedItem,
                        isActive && styles.feedItemActive,
                      ]}
                      onPress={() => onFeedSelect(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.feedItemRow}>
                        {IconComponent && (
                          <IconComponent
                            size={18}
                            color={COLORS.gold}
                            style={styles.feedIcon}
                          />
                        )}
                        <View style={styles.feedItemText}>
                          <Text style={[styles.feedItemTitle, isActive && styles.feedItemTitleActive]}>
                            {item.title}
                          </Text>
                          {item.subtitle && (
                            <Text style={styles.feedItemSubtitle}>
                              {item.subtitle}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              );
            })}

              {/* Bottom padding */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Full-screen container — backdrop and panel are siblings
  container: {
    flex: 1,
  },

  // Backdrop — absolute fill behind the panel, catches dismiss taps
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  sidePanel: {
    width: 280,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent', // Let glass effect show through
    overflow: 'hidden',
  },

  // Menu Header - Glass Morphism
  menuHeader: {
    overflow: 'hidden',
    borderBottomWidth: 1.2,
    borderBottomColor: 'rgba(106, 91, 255, 0.3)',  // Purple border
  },

  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },

  menuHeaderContent: {
    padding: SPACING.xl,
    paddingTop: 60, // Safe area
  },

  menuHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  menuTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Header Actions (Tạo, Sửa, Close)
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },

  headerActionBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderRadius: 20,
  },

  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Feed List - Glass Morphism Container
  feedListBlur: {
    flex: 1,
    overflow: 'hidden',
  },

  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  leftSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 80,
  },

  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  feedList: {
    flex: 1,
  },

  feedListContent: {
    flexGrow: 1,
  },

  feedSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
    paddingLeft: 4,
  },

  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // Feed Item - Glass effect
  feedItem: {
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(106, 91, 255, 0.08)', // Subtle purple glass
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
    // Subtle inner shadow for depth
    shadowColor: '#6A5BFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  feedItemActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: 'rgba(255, 189, 89, 0.5)',
    shadowColor: '#FFBD59',
    shadowOpacity: 0.2,
  },

  feedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  feedIcon: {
    marginRight: SPACING.md,
  },

  feedItemText: {
    flex: 1,
  },

  feedItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },

  feedItemTitleActive: {
    color: COLORS.gold,
  },

  feedItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Icon labels under action buttons
  iconLabel: {
    fontSize: 9,
    color: COLORS.gold,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Tooltip bubble
  tooltipBubble: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  tooltipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    lineHeight: 18,
  },

  // Trending Hashtags styles
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
  },
  hashtagText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
    marginBottom: 2,
  },
});

export default SideMenu;
