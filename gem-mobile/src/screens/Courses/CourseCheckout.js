/**
 * Gemral - Course Checkout WebView
 * Handles Shopify checkout for paid courses
 *
 * IMPORTANT: This screen does NOT grant course access directly!
 * Access is granted by the Shopify webhook (orders/paid event) when payment is confirmed.
 * This ensures bank transfers and other delayed payment methods work correctly.
 *
 * Flow:
 * 1. User completes checkout on Shopify
 * 2. WebView detects thank_you page (order created, may not be paid yet)
 * 3. Show "Order created, waiting for payment confirmation" message
 * 4. Shopify sends webhook to our server when payment is confirmed
 * 5. Server grants course access via grantCourseAccess()
 * 6. User can check enrollment status by refreshing course data
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  BackHandler,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { useCourse } from '../../contexts/CourseContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

const CourseCheckout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { refresh } = useCourse();
  const { alert, AlertComponent } = useCustomAlert();

  // Use TabBarContext to hide tab bar on this screen
  let hideTabBar, showTabBar;
  try {
    const tabBarContext = useTabBar();
    hideTabBar = tabBarContext.hideTabBar;
    showTabBar = tabBarContext.showTabBar;
  } catch (e) {
    hideTabBar = () => {};
    showTabBar = () => {};
  }

  // Hide tab bar when entering checkout, show when leaving
  useEffect(() => {
    hideTabBar(false);
    return () => {
      showTabBar(true);
    };
  }, []);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[CourseCheckout] Force refresh received');
      setLoading(false);
    });
    return () => listener.remove();
  }, []);

  const { checkoutUrl, courseId, courseTitle, productType, returnScreen } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const webViewRef = useRef(null);

  // Helper function to navigate back safely
  const handleCancelCheckout = () => {
    if (cancelConfirmed) return;
    setCancelConfirmed(true);

    console.log('[CourseCheckout] Cancel checkout, returning to CourseDetail');

    // Go back to course detail
    navigation.goBack();
  };

  // Prevent back button during checkout
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (checkoutCompleted || cancelConfirmed) {
          return false;
        }

        alert({
          type: 'warning',
          title: 'Hủy thanh toán?',
          message: 'Bạn có chắc muốn hủy thanh toán khóa học?',
          buttons: [
            { text: 'Tiếp tục thanh toán', style: 'cancel' },
            {
              text: 'Hủy',
              style: 'destructive',
              onPress: handleCancelCheckout,
            },
          ],
        });
        return true;
      }
    );

    return () => backHandler.remove();
  }, [checkoutCompleted, cancelConfirmed, navigation]);

  // JavaScript to inject into WebView for success detection
  const injectedJavaScript = `
    (function() {
      console.log('[WebView] Course checkout JS injected');

      // Hide Shopify header
      function hideShopifyHeader() {
        const style = document.createElement('style');
        style.id = 'hide-shopify-header';
        style.textContent = \`
          header, nav, .header, .main-header, .checkout-header,
          [role="banner"], .site-header, .page-header,
          .previous-link, .step__footer__previous-link,
          .breadcrumb, .breadcrumbs, .announcement-bar, .top-bar {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          body { padding-top: 0 !important; margin-top: 0 !important; }
          main, .main, .main-content { padding-top: 0 !important; margin-top: 0 !important; }
        \`;
        if (!document.getElementById('hide-shopify-header')) {
          document.head.appendChild(style);
        }
      }

      hideShopifyHeader();

      const headerObserver = new MutationObserver(hideShopifyHeader);
      headerObserver.observe(document.body, { childList: true, subtree: true });

      // Success detection
      let successDetected = false;

      function detectSuccessPage() {
        if (successDetected) return true;

        const url = window.location.href;
        const pathname = window.location.pathname;
        const title = document.title.toLowerCase();

        const isSuccessPage =
          url.includes('/thank_you') ||
          url.includes('/thank-you') ||
          url.includes('/orders/') ||
          pathname.includes('/orders/') ||
          (pathname.includes('/checkouts/') && pathname.includes('/thank_you')) ||
          document.querySelector('.os-order-number') !== null ||
          document.querySelector('[data-order-number]') !== null ||
          document.querySelector('.order-number') !== null ||
          document.querySelector('.thank-you') !== null ||
          document.querySelector('.order-confirmation') !== null ||
          title.includes('thank you') ||
          title.includes('order confirmed') ||
          title.includes('xác nhận đơn hàng') ||
          title.includes('đặt hàng thành công');

        if (isSuccessPage) {
          console.log('[WebView] COURSE CHECKOUT SUCCESS!');
          successDetected = true;

          // Extract order info
          let orderId = null;
          let orderNumber = null;

          const orderNumberSelectors = [
            '.os-order-number', '[data-order-number]', '.order-number',
            '.order-confirmation__order-number',
          ];

          for (const selector of orderNumberSelectors) {
            const el = document.querySelector(selector);
            if (el) {
              orderNumber = el.textContent.trim().replace('#', '');
              break;
            }
          }

          const urlMatch = window.location.href.match(/orders\\/(\\d+)/);
          if (urlMatch) orderId = urlMatch[1];

          // Send message to React Native
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'COURSE_CHECKOUT_SUCCESS',
              orderId: orderId,
              orderNumber: orderNumber,
              url: window.location.href,
              timestamp: Date.now(),
            }));
          }

          return true;
        }

        return false;
      }

      // Multiple detection methods
      detectSuccessPage();

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => detectSuccessPage(), 100);
        });
      } else {
        setTimeout(() => detectSuccessPage(), 100);
      }

      // Interval checking
      let checkCount = 0;
      const maxChecks = 60;

      const intervalId = setInterval(() => {
        checkCount++;
        if (successDetected || checkCount >= maxChecks) {
          clearInterval(intervalId);
          return;
        }
        detectSuccessPage();
      }, 500);

      // URL change detection
      let lastUrl = window.location.href;
      const urlCheckInterval = setInterval(() => {
        if (successDetected) { clearInterval(urlCheckInterval); return; }
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          detectSuccessPage();
        }
      }, 300);

      // DOM mutation observer
      const domObserver = new MutationObserver((mutations) => {
        if (successDetected) {
          domObserver.disconnect();
          return;
        }
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            detectSuccessPage();
            break;
          }
        }
      });

      domObserver.observe(document.body, { childList: true, subtree: true });

      // History state changes
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function(...args) {
        originalPushState.apply(this, args);
        setTimeout(() => detectSuccessPage(), 200);
      };

      history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        setTimeout(() => detectSuccessPage(), 200);
      };

      console.log('[WebView] Course checkout detection initialized');
    })();

    true;
  `;

  // Handle messages from WebView
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'COURSE_CHECKOUT_SUCCESS') {
        console.log('[CourseCheckout] SUCCESS! Order:', data);
        await handleCheckoutSuccess(data);
      }
    } catch (error) {
      console.error('[CourseCheckout] Message parse error:', error);
    }
  };

  // Handle navigation state changes (backup detection)
  const handleNavigationStateChange = (navState) => {
    const { url, loading: navLoading } = navState;

    console.log('[CourseCheckout] Navigation:', { url, loading: navLoading });

    if (!checkoutCompleted && !navLoading) {
      if (url.includes('/thank_you') || url.includes('/orders/')) {
        console.log('[CourseCheckout] Success detected via navigation!');

        const match = url.match(/orders\/(\d+)/);
        const orderId = match ? match[1] : null;

        handleCheckoutSuccess({
          orderId: orderId,
          orderNumber: null,
          url: url,
          source: 'navigation_state',
        });
      }
    }
  };

  // Handle checkout success - ORDER CREATED (may not be paid yet!)
  // IMPORTANT: We do NOT grant access here. Access is granted by webhook when order is PAID.
  const handleCheckoutSuccess = async (orderData) => {
    if (checkoutCompleted) {
      console.log('[CourseCheckout] Already handled, ignoring');
      return;
    }

    try {
      console.log('[CourseCheckout] Order created (waiting for payment confirmation)...');
      console.log('[CourseCheckout] Order data:', orderData);
      setCheckoutCompleted(true);

      // Refresh course data to check if webhook already processed (instant payment)
      await refresh();

      // Show appropriate message based on payment method
      // Note: We cannot determine payment method from WebView, so show generic message
      setTimeout(() => {
        alert({
          type: 'success',
          title: 'Đặt hàng thành công!',
          message: `Đơn hàng khóa học "${courseTitle}" đã được tạo.\n\n` +
            `Nếu bạn thanh toán qua thẻ/ví điện tử, quyền truy cập sẽ được cấp ngay.\n\n` +
            `Nếu bạn chuyển khoản ngân hàng, vui lòng chờ xác nhận thanh toán (thường trong vòng 5-15 phút).\n\n` +
            `Bạn có thể kiểm tra trạng thái khóa học bằng cách kéo xuống để làm mới.`,
          buttons: [
            {
              text: 'Về danh sách khóa học',
              style: 'cancel',
              onPress: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'CourseList' }],
                  })
                );
              },
            },
            {
              text: 'Xem khóa học',
              onPress: () => {
                // Navigate back to course detail
                // If payment was instant, it will show enrolled state
                // If not, user can pull-to-refresh to check
                navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [
                      { name: 'CourseList' },
                      { name: 'CourseDetail', params: { courseId } },
                    ],
                  })
                );
              },
            },
          ],
          cancelable: false,
        });
      }, 300);

    } catch (error) {
      console.error('[CourseCheckout] Error handling order:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Đã xảy ra lỗi. Vui lòng kiểm tra email để xác nhận đơn hàng hoặc liên hệ hỗ trợ.',
        buttons: [
          {
            text: 'Đồng ý',
            onPress: () => navigation.goBack(),
          },
        ],
      });
    }
  };

  // Handle WebView errors
  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('[CourseCheckout] WebView error:', nativeEvent);

    alert({
      type: 'error',
      title: 'Lỗi Tải Trang',
      message: 'Không thể tải trang thanh toán. Vui lòng thử lại.',
      buttons: [
        {
          text: 'Thử lại',
          onPress: () => webViewRef.current?.reload(),
        },
        {
          text: 'Quay lại',
          style: 'cancel',
          onPress: handleCancelCheckout,
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: checkoutUrl }}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={handleError}
        injectedJavaScript={injectedJavaScript}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={false}
        {...(Platform.OS === 'ios' && {
          contentInsetAdjustmentBehavior: 'never',
          bounces: false,
          scrollEnabled: true,
        })}
        {...(Platform.OS === 'android' && {
          mixedContentMode: 'always',
          thirdPartyCookiesEnabled: true,
        })}
      />
      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05040B',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#05040B',
    zIndex: 10,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default CourseCheckout;
