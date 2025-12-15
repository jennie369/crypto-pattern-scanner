/**
 * Gemral - Gift Catalog Sheet Component
 * Feature #15: Gift Catalog
 * Bottom sheet to browse and send gifts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import alertService from '../services/alertService';
import { BlurView } from 'expo-blur';
import {
  X,
  Gem,
  Send,
  EyeOff,
  Check,
  Sparkles,
  Heart,
  Star,
  Gift,
  Crown,
  Flame,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, INPUT } from '../utils/tokens';
import giftService from '../services/giftService';
import walletService from '../services/walletService';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_FULL_HEIGHT = Dimensions.get('screen').height;

// Gift icons mapping (fallback when no image)
const GIFT_ICONS = {
  heart: Heart,
  star: Star,
  crown: Crown,
  fire: Flame,
  default: Gift,
};

const GiftCatalogSheet = ({
  visible,
  onClose,
  recipientId,
  recipientName,
  postId = null,
  streamId = null,
  onGiftSent,
}) => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [gifts, setGifts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGift, setSelectedGift] = useState(null);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [balance, setBalance] = useState(0);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      loadData();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Reset state
      setSelectedGift(null);
      setMessage('');
      setIsAnonymous(false);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      loadGifts();
    }
  }, [selectedCategory]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(keyboardShowEvent, (e) => {
      const screenY = e.endCoordinates.screenY;
      const actualHeight = Platform.OS === 'android'
        ? (SCREEN_FULL_HEIGHT - screenY)
        : e.endCoordinates.height;
      setKeyboardHeight(actualHeight);
    });

    const hideListener = Keyboard.addListener(keyboardHideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [categoriesData, balanceResult] = await Promise.all([
      giftService.getCategories(),
      walletService.getBalance(),
    ]);

    setCategories(categoriesData);
    if (balanceResult.success) {
      setBalance(balanceResult.data.gems);
    }

    await loadGifts();
    setLoading(false);
  };

  const loadGifts = async () => {
    const giftsData = await giftService.getGiftCatalog(selectedCategory);
    setGifts(giftsData);
  };

  const handleSendGift = useCallback(async () => {
    if (!selectedGift || sending) return;

    if (balance < selectedGift.gem_cost) {
      alertService.error('Không đủ gems', 'Vui lòng nạp thêm gems để gửi quà');
      return;
    }

    setSending(true);

    const result = await giftService.sendGift({
      giftId: selectedGift.id,
      recipientId,
      postId,
      streamId,
      message: message.trim() || null,
      isAnonymous,
    });

    setSending(false);

    if (result.success) {
      onGiftSent?.(result.data);
      onClose?.();
      alertService.success('Thành công', `Đã gửi "${selectedGift.name}" đến ${recipientName}!`);
    } else {
      alertService.error('Lỗi', result.error);
    }
  }, [selectedGift, recipientId, postId, streamId, message, isAnonymous, balance, sending, recipientName]);

  const renderCategory = ({ item }) => {
    const isActive = selectedCategory === item.id;

    return (
      <TouchableOpacity
        style={[styles.categoryTab, isActive && styles.categoryTabActive]}
        onPress={() => setSelectedCategory(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
          {item.name}
        </Text>
        <Text style={[styles.categoryCount, isActive && styles.categoryCountActive]}>
          {item.count}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderGift = ({ item }) => {
    const isSelected = selectedGift?.id === item.id;
    const canAfford = balance >= item.gem_cost;
    const Icon = GIFT_ICONS[item.name?.toLowerCase()] || GIFT_ICONS.default;

    // Check if image_url is a valid external URL (not a relative path)
    const hasValidImageUrl = item.image_url && item.image_url.startsWith('http');

    return (
      <TouchableOpacity
        style={[
          styles.giftCard,
          isSelected && styles.giftCardSelected,
          !canAfford && styles.giftCardDisabled,
        ]}
        onPress={() => setSelectedGift(item)}
        activeOpacity={0.7}
        disabled={!canAfford}
      >
        {item.is_animated && (
          <View style={styles.animatedBadge}>
            <Sparkles size={10} color={COLORS.gold} />
          </View>
        )}

        {hasValidImageUrl ? (
          <Image source={{ uri: item.image_url }} style={styles.giftImage} />
        ) : (
          <View style={styles.giftIconContainer}>
            <Icon size={32} color={isSelected ? COLORS.purple : COLORS.textMuted} />
          </View>
        )}

        <Text style={[styles.giftName, !canAfford && styles.giftNameDisabled]}>
          {item.name}
        </Text>

        <View style={styles.giftPrice}>
          <Gem size={12} color={canAfford ? COLORS.purple : COLORS.textMuted} />
          <Text style={[styles.giftPriceText, !canAfford && styles.giftPriceDisabled]}>
            {item.gem_cost}
          </Text>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Check size={14} color={COLORS.textPrimary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />
              <View style={styles.headerContent}>
                <Text style={styles.title}>Gửi quà cho {recipientName}</Text>
                <View style={styles.balanceContainer}>
                  <Gem size={14} color={COLORS.purple} />
                  <Text style={styles.balanceText}>{walletService.formatGems(balance)}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.purple} />
              </View>
            ) : (
              <>
                {/* Categories */}
                <View style={styles.categoriesContainer}>
                  <FlatList
                    horizontal
                    data={categories}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContent}
                  />
                </View>

                {/* Gifts Grid */}
                <FlatList
                  data={gifts}
                  renderItem={renderGift}
                  keyExtractor={(item) => item.id}
                  numColumns={4}
                  contentContainerStyle={styles.giftsContent}
                  showsVerticalScrollIndicator={false}
                  style={styles.giftsList}
                />

                {/* Message Input & Options */}
                {selectedGift && (
                  <View style={[
                    styles.sendSection,
                    { paddingBottom: keyboardHeight > 0 ? keyboardHeight + SPACING.md : 44 }
                  ]}>
                    <TextInput
                      style={styles.messageInput}
                      placeholder="Thêm lời nhắn (tùy chọn)..."
                      placeholderTextColor={COLORS.textMuted}
                      value={message}
                      onChangeText={setMessage}
                      maxLength={150}
                    />

                    <View style={styles.optionsRow}>
                      <TouchableOpacity
                        style={[styles.anonymousToggle, isAnonymous && styles.anonymousToggleActive]}
                        onPress={() => setIsAnonymous(!isAnonymous)}
                        activeOpacity={0.7}
                      >
                        <EyeOff size={16} color={isAnonymous ? COLORS.purple : COLORS.textMuted} />
                        <Text style={[styles.anonymousText, isAnonymous && styles.anonymousTextActive]}>
                          Ẩn danh
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                        onPress={handleSendGift}
                        disabled={sending}
                        activeOpacity={0.8}
                      >
                        {sending ? (
                          <ActivityIndicator size="small" color={COLORS.textPrimary} />
                        ) : (
                          <>
                            <Send size={18} color={COLORS.textPrimary} />
                            <Text style={styles.sendButtonText}>
                              Gửi {selectedGift.gem_cost}
                            </Text>
                            <Gem size={14} color={COLORS.textPrimary} />
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Less dim backdrop
  },
  sheet: {
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.92, // Taller - almost full screen
    minHeight: SCREEN_HEIGHT * 0.85, // Much taller minimum
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 48, 0.95)', // Solid dark background, more opaque
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: SPACING.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 30, // Space for close button
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  balanceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.lg,
    padding: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  categoryCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  categoryCountActive: {
    color: COLORS.purple,
  },
  giftsList: {
    flex: 1,
  },
  giftsContent: {
    padding: SPACING.md,
  },
  giftCard: {
    width: (SCREEN_WIDTH - SPACING.md * 5) / 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // Brighter background
    borderRadius: 12,
    padding: SPACING.sm,
    margin: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Visible border
    position: 'relative',
  },
  giftCardSelected: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.3)', // More visible selection
    borderWidth: 2,
  },
  giftCardDisabled: {
    opacity: 0.4,
  },
  animatedBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  giftImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  giftIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.15)', // Subtle purple glow behind icon
    borderRadius: 22,
  },
  giftName: {
    fontSize: TYPOGRAPHY.fontSize.sm, // Larger font
    color: COLORS.textPrimary, // Brighter text
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  giftNameDisabled: {
    color: COLORS.textMuted,
  },
  giftPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: SPACING.xs,
  },
  giftPriceText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  giftPriceDisabled: {
    color: COLORS.textMuted,
  },
  selectedIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendSection: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageInput: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  anonymousToggleActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
  },
  anonymousText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  anonymousTextActive: {
    color: COLORS.purple,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default GiftCatalogSheet;
