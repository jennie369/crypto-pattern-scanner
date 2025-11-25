/**
 * GEM Platform - Side Menu Component
 * Burger menu with feed filters, quick actions, and custom feeds (Threads-style)
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
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
  Target
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
  customFeeds = []
}) => {
  const slideAnim = useRef(new Animated.Value(-280)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 0 : -280,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [isOpen]);

  // System feeds (cannot be edited)
  // Note: "Khám phá" is the main personalized feed (shown in CategoryTabs)
  const systemFeeds = [
    {
      section: 'NGUỒN TIN',
      items: [
        { id: 'following', title: 'Đang Theo Dõi', subtitle: 'Người bạn follow', Icon: Users },
      ],
    },
  ];

  // Category feeds - GEM Platform Philosophy: Trading / Tinh Thần / Integration
  const categoryFeeds = [
    {
      section: '🎯 GIAO DỊCH',
      items: [
        { id: 'trading', title: 'Phân Tích Thị Trường', subtitle: 'Crypto & futures', Icon: TrendingUp },
        { id: 'patterns', title: 'Chia Sẻ Tips Hay', subtitle: 'GEM Method', Icon: Target },
        { id: 'results', title: 'Kết Quả Giao Dịch', subtitle: 'Chia sẻ P/L', Icon: DollarSign },
      ],
    },
    {
      section: '☯️ TINH THẦN',
      items: [
        { id: 'wellness', title: 'Review Đá Crystal', subtitle: 'Crystal healing', Icon: Gem },
        { id: 'meditation', title: 'Luật Hấp Dẫn', subtitle: 'Mindset & năng lượng', Icon: Sparkles },
        { id: 'growth', title: 'Tips Chữa Lành', subtitle: 'Phát triển bản thân', Icon: Users },
      ],
    },
    {
      section: '🌟 CÂN BẰNG',
      items: [
        { id: 'mindful-trading', title: 'Giao Dịch Chánh Niệm', subtitle: 'Kết hợp cả hai', Icon: Target },
        { id: 'sieu-giau', title: 'Tips Trader Thành Công', subtitle: 'Tư duy thịnh vượng', Icon: Rocket },
      ],
    },
    {
      section: '💰 KIẾM TIỀN',
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
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Side Panel */}
        <Animated.View
          style={[
            styles.sidePanel,
            { transform: [{ translateX: slideAnim }] },
          ]}
          onStartShouldSetResponder={() => true}
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
            />
            {/* Top Sheen for Liquid Effect */}
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.topSheen}
            />

            <View style={styles.menuHeaderContent}>
              <View style={styles.menuHeaderTop}>
                <Text style={styles.menuTitle}>💎 GEM</Text>

                {/* Action Buttons (Tạo, Sửa, Close) */}
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.headerActionBtn}
                    onPress={() => {
                      onClose();
                      onCreateFeed?.();
                    }}
                  >
                    <Plus size={20} color={COLORS.gold} strokeWidth={2.5} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerActionBtn}
                    onPress={() => {
                      onClose();
                      onEditFeeds?.();
                    }}
                  >
                    <Edit3 size={20} color={COLORS.gold} strokeWidth={2.5} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerActionBtn}
                    onPress={onClose}
                  >
                    <X size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

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

          {/* Feed List */}
          <ScrollView
            style={styles.feedList}
            showsVerticalScrollIndicator={false}
          >
            {/* System Feeds */}
            {systemFeeds.map((section, sectionIndex) => (
              <View key={`system-${sectionIndex}`} style={styles.feedSection}>
                <Text style={styles.sectionTitle}>{section.section}</Text>

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
            ))}

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

            {/* Category Feeds */}
            {categoryFeeds.map((section, sectionIndex) => (
              <View key={`category-${sectionIndex}`} style={styles.feedSection}>
                <Text style={styles.sectionTitle}>{section.section}</Text>

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
            ))}

            {/* Bottom padding */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
  },

  sidePanel: {
    width: 280,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.bgMid,
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

  // Feed List
  feedList: {
    flex: 1,
  },

  feedSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },

  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
    paddingLeft: 4,
  },

  // Feed Item
  feedItem: {
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  feedItemActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderColor: COLORS.gold,
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
});

export default SideMenu;
