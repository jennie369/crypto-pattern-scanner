/**
 * Gemral - Gift Catalog Screen
 * Browse and send virtual gifts to other users
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import alertService from '../../services/alertService';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Gift,
  Heart,
  Star,
  Sparkles,
  Crown,
  Gem,
  Send,
} from 'lucide-react-native';
import { COLORS, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import walletService from '../../services/walletService';
import { useTabBar } from '../../contexts/TabBarContext';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

// Gift categories with items
const GIFT_CATEGORIES = [
  {
    id: 'popular',
    name: 'Phổ biến',
    gifts: [
      { id: 'heart', name: 'Trái Tim', icon: Heart, price: 10, color: '#FF6B6B' },
      { id: 'star', name: 'Ngôi Sao', icon: Star, price: 20, color: '#FFD93D' },
      { id: 'sparkle', name: 'Lấp Lánh', icon: Sparkles, price: 50, color: '#6A5BFF' },
    ],
  },
  {
    id: 'premium',
    name: 'Cao cấp',
    gifts: [
      { id: 'crown', name: 'Vương Miện', icon: Crown, price: 100, color: '#FFD700' },
      { id: 'gem', name: 'Kim Cương', icon: Gem, price: 200, color: '#00F0FF' },
      { id: 'gift_box', name: 'Hộp Quà VIP', icon: Gift, price: 500, color: '#FF00FF' },
    ],
  },
];

const GiftCatalogScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [selectedGift, setSelectedGift] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const insets = useSafeAreaInsets();
  const { hideTabBar, showTabBar } = useTabBar();

  // Optional: recipient and pre-selected gift passed from another screen
  const recipient = route?.params?.recipient;
  const preSelectedGift = route?.params?.preSelectedGift;
  const preSelectedQuantity = route?.params?.preSelectedQuantity;

  // Hide tab bar when entering, show when leaving
  useEffect(() => {
    hideTabBar();
    return () => showTabBar();
  }, []);

  useEffect(() => {
    loadBalance();
  }, []);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[GiftCatalogScreen] Force refresh received');
      setLoading(false);
      setTimeout(() => loadBalance(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  // Handle pre-selected gift from navigation
  useEffect(() => {
    if (preSelectedGift) {
      // Find the gift in categories
      for (const category of GIFT_CATEGORIES) {
        const gift = category.gifts.find(g => g.id === preSelectedGift.id);
        if (gift) {
          setSelectedGift(gift);
          break;
        }
      }
    }
    if (preSelectedQuantity) {
      setQuantity(preSelectedQuantity);
    }
  }, [preSelectedGift, preSelectedQuantity]);

  const loadBalance = async () => {
    setLoading(true);
    try {
      const result = await walletService.getBalance();
      if (result.success) {
        setBalance(result.data.gems || 0);
      }
    } catch (error) {
      console.error('[GiftCatalogScreen] loadBalance error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGift = (gift) => {
    setSelectedGift(gift);
    setQuantity(1);
  };

  const handleSendGift = async () => {
    if (!selectedGift) {
      alertService.info('Thông báo', 'Vui lòng chọn một món quà');
      return;
    }

    const totalCost = selectedGift.price * quantity;

    if (balance < totalCost) {
      alertService.warning(
        'Không đủ Gems',
        `Bạn cần ${totalCost} gems để gửi quà này. Số dư hiện tại: ${balance} gems`,
        [
          { text: 'Hủy' },
          { text: 'Nạp Gems', onPress: () => navigation.navigate('BuyGems') },
        ]
      );
      return;
    }

    if (recipient) {
      alertService.info(
        'Xác nhận',
        `Gửi ${quantity}x ${selectedGift.name} (${totalCost} gems) cho ${recipient.name || recipient.full_name}?`,
        [
          { text: 'Hủy' },
          {
            text: 'Gửi',
            onPress: async () => {
              const result = await walletService.spendGems(
                totalCost,
                `Gửi ${quantity}x ${selectedGift.name} cho ${recipient.name || recipient.full_name}`,
                selectedGift.id,
                'gift'
              );
              if (result.success) {
                alertService.success('Thành công', 'Đã gửi quà!');
                navigation.goBack();
              } else {
                alertService.error('Lỗi', result.error || 'Không thể gửi quà');
              }
            },
          },
        ]
      );
    } else {
      // Show info about how to send gifts
      alertService.info(
        'Cách gửi quà',
        'Để gửi quà cho ai đó:\n\n' +
        '1. Vào trang cá nhân của họ\n' +
        '2. Nhấn nút "Tặng quà" 🎁\n' +
        '3. Chọn quà và số lượng\n\n' +
        'Hoặc gửi quà trong bình luận/tin nhắn!',
        [
          { text: 'Đã hiểu' },
          {
            text: 'Tìm bạn bè',
            // Navigate to Forum (Home) where users can browse posts and find profiles
            onPress: () => navigation.navigate('Home', { screen: 'Forum' })
          },
        ]
      );
    }
  };

  const renderGiftItem = (gift) => {
    const Icon = gift.icon;
    const isSelected = selectedGift?.id === gift.id;

    return (
      <TouchableOpacity
        key={gift.id}
        style={[styles.giftItem, isSelected && styles.giftItemSelected]}
        onPress={() => handleSelectGift(gift)}
        activeOpacity={0.7}
      >
        <View style={[styles.giftIconContainer, { backgroundColor: `${gift.color}20` }]}>
          <Icon size={32} color={gift.color} />
        </View>
        <Text style={styles.giftName}>{gift.name}</Text>
        <View style={styles.giftPriceRow}>
          <Gem size={14} color={COLORS.purple} />
          <Text style={styles.giftPrice}>{gift.price}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>Đã chọn</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gửi Quà</Text>
          <View style={styles.balanceChip}>
            <Gem size={16} color={COLORS.purple} />
            <Text style={styles.balanceText}>{walletService.formatGems(balance)}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recipient Info (if passed) */}
          {recipient && (
            <View style={styles.recipientCard}>
              <Text style={styles.recipientLabel}>Gửi đến:</Text>
              <Text style={styles.recipientName}>{recipient.name}</Text>
            </View>
          )}

          {/* Gift Categories */}
          {GIFT_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <View style={styles.giftsGrid}>
                {category.gifts.map(renderGiftItem)}
              </View>
            </View>
          ))}

          {/* Quantity Selector (if gift selected) */}
          {selectedGift && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Số lượng:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng:</Text>
                <View style={styles.totalValue}>
                  <Gem size={18} color={COLORS.purple} />
                  <Text style={styles.totalAmount}>
                    {selectedGift.price * quantity}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Extra padding for footer */}
          <View style={{ height: selectedGift ? 120 : 20 }} />
        </ScrollView>

        {/* Send Button */}
        {selectedGift && (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendGift}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendButtonGradient}
              >
                <Send size={20} color={COLORS.textPrimary} />
                <Text style={styles.sendButtonText}>
                  Gửi {selectedGift.name} ({selectedGift.price * quantity} gems)
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GLASS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  balanceText: {
    fontSize: 13,
    color: COLORS.purple,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  recipientCard: {
    backgroundColor: GLASS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recipientLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  recipientName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  giftItem: {
    width: '31%',
    backgroundColor: GLASS.background,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  giftItemSelected: {
    borderColor: COLORS.purple,
  },
  giftIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  giftName: {
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  giftPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  giftPrice: {
    fontSize: 11,
    color: COLORS.purple,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.purple,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectedBadgeText: {
    fontSize: 9,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  quantitySection: {
    backgroundColor: GLASS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  quantityLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  totalValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.purple,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.bgDarkest,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  sendButtonText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});

export default GiftCatalogScreen;
