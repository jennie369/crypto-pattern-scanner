/**
 * Gemral - Checkout Screen
 * Shopify WebView Checkout - Dark Theme
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ArrowLeft, X, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';

const CheckoutScreen = ({ navigation, route }) => {
  const { checkoutUrl } = route.params;
  const { completeCheckout } = useCart();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Extract order ID from Shopify thank you URL
  const extractOrderInfo = (url) => {
    // Pattern: /thank_you or /orders/12345 or /checkouts/.../thank_you
    const orderMatch = url.match(/\/orders\/(\d+)/i);
    const confirmMatch = url.match(/order[_-]?number[=:]?\s*(\w+)/i);

    return {
      orderId: orderMatch ? orderMatch[1] : null,
      orderNumber: confirmMatch ? confirmMatch[1] : null,
    };
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);

    // Check for order confirmation URL patterns
    const url = navState.url.toLowerCase();
    if (
      !orderCompleted &&
      (url.includes('/thank_you') ||
       url.includes('thank-you') ||
       url.includes('/orders/') ||
       url.includes('order-confirmation'))
    ) {
      const orderInfo = extractOrderInfo(navState.url);
      handleOrderComplete(orderInfo.orderId, orderInfo.orderNumber);
    }
  };

  const handleOrderComplete = async (orderId, orderNumber) => {
    // Prevent multiple triggers
    if (orderCompleted) return;
    setOrderCompleted(true);

    console.log('[Checkout] Order completed:', { orderId, orderNumber });

    // Complete checkout and clear cart
    await completeCheckout(orderId, orderNumber);

    Alert.alert(
      'Đặt Hàng Thành Công!',
      'Cảm ơn bạn đã mua hàng tại Gemral.\nĐơn hàng của bạn đang được xử lý.',
      [
        {
          text: 'Xem Đơn Hàng',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [
                { name: 'ShopMain' },
                { name: 'Orders', params: { highlightOrder: orderId } },
              ],
            });
          },
        },
        {
          text: 'Tiếp Tục Mua Sắm',
          style: 'cancel',
          onPress: () => {
            navigation.navigate('ShopMain');
          },
        },
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      'Hủy thanh toán?',
      'Bạn có chắc muốn hủy thanh toán? Giỏ hàng sẽ được giữ nguyên.',
      [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        {
          text: 'Hủy',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleRefresh = () => {
    webViewRef.current?.reload();
  };

  const handleGoBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      handleClose();
    }
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleGoBack}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleRefresh}>
              <RefreshCw size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={handleClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}
        <View style={styles.webViewContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: checkoutUrl }}
            style={styles.webView}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              Alert.alert(
                'Lỗi',
                'Không thể tải trang thanh toán. Vui lòng thử lại.',
                [
                  { text: 'Thử lại', onPress: handleRefresh },
                  { text: 'Đóng', onPress: () => navigation.goBack() },
                ]
              );
            }}
          />
        </View>
        <View style={styles.securityNotice}>
          <Text style={styles.securityText}>Thanh toán an toàn qua Shopify</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.3)',
    minHeight: 56,
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  webViewContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.deepNavy,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  securityNotice: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: GLASS.background,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },
  securityText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
});

export default CheckoutScreen;
