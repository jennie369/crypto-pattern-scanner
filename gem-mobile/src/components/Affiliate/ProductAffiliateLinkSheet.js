/**
 * Gemral - Product Affiliate Link Sheet
 * Bottom sheet for generating and sharing product affiliate links
 * Uses design tokens from tokens.js
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator,
  Share,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
// BlurView and LinearGradient removed - using solid backgrounds
import {
  X,
  Copy,
  Share2,
  Link,
  Lightbulb,
  Check,
  ExternalLink,
} from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';
import affiliateService from '../../services/affiliateService';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

/**
 * ProductAffiliateLinkSheet Component
 * @param {boolean} visible - Sheet visibility
 * @param {function} onClose - Close callback
 * @param {object} product - Product data (Shopify format: { id, handle, title, variants, image })
 * @param {string} productType - 'crystal', 'course', 'subscription', 'bundle'
 */
export default function ProductAffiliateLinkSheet({
  visible,
  onClose,
  product,
  productType = 'crystal',
  onNavigateToPartnership, // Optional callback to navigate to partnership registration
}) {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [loading, setLoading] = useState(false);
  const [linkData, setLinkData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const { alert, AlertComponent } = useCustomAlert();

  // Extract product ID - Shopify products may use id or handle
  const getProductId = () => {
    return product?.id || product?.handle || null;
  };

  // Extract product name - Shopify uses title
  const getProductName = () => {
    return product?.title || product?.name || product?.title_vi || product?.name_vi || 'Sản phẩm';
  };

  // Extract product price - Shopify uses variants[0].price
  const getProductPrice = () => {
    if (product?.variants?.[0]?.price) {
      return parseFloat(product.variants[0].price);
    }
    return product?.price || product?.rawPrice || 0;
  };

  // Extract product image
  const getProductImage = () => {
    return product?.image || product?.images?.[0]?.src || product?.image_url || product?.thumbnail_url || null;
  };

  // Extract product handle for URL generation
  const getProductHandle = () => {
    return product?.handle || product?.slug || null;
  };

  // Animate sheet on visibility change
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 9,
      }).start();
      generateLink();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Generate affiliate link
  const generateLink = async () => {
    const productId = getProductId();

    console.log('[AffiliateLinkSheet] Generating link for product:', {
      productId,
      name: getProductName(),
      price: getProductPrice(),
      image: getProductImage(),
      productType, // <-- THIS IS THE KEY - what productType is passed?
    });

    if (!productId) {
      setError('Không tìm thấy ID sản phẩm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await affiliateService.generateProductAffiliateLink(
        productId,
        productType,
        {
          name: getProductName(),
          price: getProductPrice(),
          image_url: getProductImage(),
          handle: getProductHandle(), // Include handle to skip product query
        }
      );

      console.log('[AffiliateLinkSheet] generateProductAffiliateLink result:', result);

      if (result.success) {
        setLinkData(result);
      } else {
        setError(result.error || 'Không thể tạo link');
      }
    } catch (err) {
      console.error('[AffiliateLinkSheet] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy link to clipboard
  const handleCopy = async () => {
    if (!linkData?.url) return;

    try {
      // Copy the URL directly using Clipboard
      await Clipboard.setStringAsync(linkData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể sao chép link',
      });
    }
  };

  // Share link
  const handleShare = async () => {
    if (!linkData?.url) return;

    try {
      const message = `Xem sản phẩm này đi bạn!\n\n${getProductName()}\nGiá: ${formatPrice(getProductPrice())} VND\n\n${linkData.url}`;

      await Share.share({
        title: getProductName(),
        message: message,
        url: Platform.OS === 'ios' ? linkData.url : undefined,
      });
    } catch (err) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể chia sẻ link',
      });
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  // Close sheet
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setLinkData(null);
      setError(null);
      onClose?.();
    });
  };

  const styles = useMemo(() => StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    backdropInner: {
      flex: 1,
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: SHEET_HEIGHT,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    sheetContainer: {
      flex: 1,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    borderGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: 'rgba(255, 189, 89, 0.3)',
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: SPACING.md,
    },
    handleContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.md,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: 'rgba(255, 255, 255, 0.9)',
    },

    // Loading
    loadingContainer: {
      paddingVertical: SPACING.huge,
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.md,
    },
    loadingText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textSecondary,
    },

    // Error
    errorContainer: {
      paddingVertical: SPACING.huge,
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.md,
    },
    errorText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.error,
      textAlign: 'center',
    },
    retryButton: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      backgroundColor: colors.glassBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    retryText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.gold,
    },

    // Product Card
    productCard: {
      backgroundColor: 'rgba(15, 16, 48, 0.8)',
      padding: SPACING.lg,
      borderRadius: 12,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.2)',
    },
    productName: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: SPACING.xs,
    },
    productPrice: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#FFBD59', // App gold color
    },

    // Commission Card
    commissionCard: {
      backgroundColor: 'rgba(15, 16, 48, 0.6)',
      padding: SPACING.lg,
      borderRadius: 12,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    commissionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    commissionLabel: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: 'rgba(255, 255, 255, 0.6)',
    },
    commissionRate: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#FFBD59', // App gold color
    },
    commissionAmount: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#22C55E',
    },

    // Link Section
    linkSection: {
      marginBottom: SPACING.lg,
    },
    linkLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: 'rgba(255, 255, 255, 0.5)',
      marginBottom: SPACING.sm,
    },
    linkBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(15, 16, 48, 0.8)',
      padding: SPACING.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    linkText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: 'rgba(255, 255, 255, 0.8)',
      marginRight: SPACING.md,
    },

    // Actions
    actions: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    actionButton: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 16, 48, 0.8)',
      padding: SPACING.md,
      gap: SPACING.sm,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 10,
    },
    shareButton: {
      overflow: 'hidden',
    },
    shareGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.md,
      gap: SPACING.sm,
      borderRadius: 10,
      backgroundColor: '#9C0612',
    },
    actionText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: '#FFFFFF',
    },

    // Tip
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: 'rgba(255, 189, 89, 0.08)',
      padding: SPACING.md,
      borderRadius: 8,
      gap: SPACING.sm,
    },
    tipText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: 'rgba(255, 255, 255, 0.5)',
      lineHeight: TYPOGRAPHY.fontSize.sm * TYPOGRAPHY.lineHeight.relaxed,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.backdropInner} />
      </TouchableOpacity>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.sheetContainer}>
          {/* Subtle top border */}
          <View style={styles.borderGradient} />

          {/* Content */}
          <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + SPACING.lg }]}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Link size={20} color={colors.gold} />
                <Text style={styles.headerTitle}>Link Affiliate</Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content Area */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Loading State */}
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.gold} />
                  <Text style={styles.loadingText}>Đang tạo link...</Text>
                </View>
              )}

              {/* Error State */}
              {error && !loading && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  {error.includes('affiliate') || error.includes('đối tác') ? (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => {
                        handleClose();
                        onNavigateToPartnership?.();
                      }}
                    >
                      <Text style={styles.retryText}>Đăng ký Partnership</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.retryButton} onPress={generateLink}>
                      <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Link Content */}
              {linkData && !loading && !error && (
                <>
                  {/* Product Card */}
                  <View style={styles.productCard}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {linkData.link?.product_name || getProductName()}
                    </Text>
                    <Text style={styles.productPrice}>
                      {formatPrice(linkData.link?.product_price || getProductPrice())} VND
                    </Text>
                  </View>

                  {/* Commission Card */}
                  <View style={styles.commissionCard}>
                    <View style={styles.commissionRow}>
                      <Text style={styles.commissionLabel}>Hoa hồng của bạn:</Text>
                      <Text style={styles.commissionRate}>{linkData.commissionRate}%</Text>
                    </View>
                    <View style={styles.commissionRow}>
                      <Text style={styles.commissionLabel}>Thu nhập ước tính:</Text>
                      <Text style={styles.commissionAmount}>
                        {formatPrice(linkData.estimatedCommission)} VND
                      </Text>
                    </View>
                  </View>

                  {/* Link Box */}
                  <View style={styles.linkSection}>
                    <Text style={styles.linkLabel}>Link giới thiệu:</Text>
                    <View style={styles.linkBox}>
                      <Text style={styles.linkText} numberOfLines={1}>
                        {linkData.url}
                      </Text>
                      <TouchableOpacity
                        onPress={handleCopy}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {copied ? (
                          <Check size={20} color={colors.success} />
                        ) : (
                          <Copy size={20} color={colors.gold} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.copyButton]}
                      onPress={handleCopy}
                      activeOpacity={0.8}
                    >
                      <Copy size={18} color={colors.textPrimary} />
                      <Text style={styles.actionText}>
                        {copied ? 'Đã sao chép!' : 'Sao chép'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.shareButton]}
                      onPress={handleShare}
                      activeOpacity={0.8}
                    >
                      <View style={styles.shareGradient}>
                        <Share2 size={16} color="#FFFFFF" />
                        <Text style={styles.actionText}>Chia sẻ</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Tip */}
                  <View style={styles.tipContainer}>
                    <Lightbulb size={16} color={colors.gold} />
                    <Text style={styles.tipText}>
                      Chia sẻ link trên mạng xã hội để tăng thu nhập!
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Animated.View>
      {AlertComponent}
    </Modal>
  );
}
