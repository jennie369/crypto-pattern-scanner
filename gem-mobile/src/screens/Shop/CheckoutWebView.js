/**
 * Gemral - Checkout WebView
 * Handles Shopify checkout with instant success detection
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  BackHandler,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { ArrowLeft, X, CheckCircle, QrCode } from 'lucide-react-native';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING } from '../../utils/tokens';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import deepLinkHandler from '../../services/deepLinkHandler';

const CheckoutWebView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { completeCheckout } = useCart();
  const { user, profile } = useAuth();
  const { checkoutUrl } = route.params;
  const { alert, AlertComponent } = useCustomAlert();

  const [loading, setLoading] = useState(true);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState(null);
  const webViewRef = useRef(null);

  // Bank transfer payment states
  const [showBankTransferOverlay, setShowBankTransferOverlay] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  // Get user_id for tracking (enables webhook to match user directly)
  const userId = user?.id || null;

  // Get affiliate code from deep link handler on mount
  useEffect(() => {
    const loadAffiliateCode = async () => {
      try {
        const code = await deepLinkHandler.getCheckoutAffiliate();
        if (code) {
          console.log('[CheckoutWebView] Found affiliate code:', code);
          setAffiliateCode(code);
        }
      } catch (error) {
        console.log('[CheckoutWebView] Error loading affiliate code:', error);
      }
    };
    loadAffiliateCode();
  }, []);

  // Helper function to navigate back safely
  const handleCancelCheckout = () => {
    if (cancelConfirmed) return; // Prevent multiple calls
    setCancelConfirmed(true);

    const { returnScreen, returnTab } = route.params || {};
    console.log('[CheckoutWebView] Cancel checkout, returnScreen:', returnScreen, 'returnTab:', returnTab);

    // If opened from Account tab (UpgradeScreen), just go back
    // This avoids the complex reset that causes navigation loops
    if (returnTab === 'Account') {
      navigation.goBack();
      return;
    }

    // If we have a specific return screen (from Shop), navigate there
    if (returnScreen) {
      // Reset Shop stack to ShopMain to clear WebView from history
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Shop',
              state: {
                routes: [{ name: 'ShopMain' }],
              },
            },
          ],
        })
      );

      // Then navigate to the return screen
      setTimeout(() => {
        if (returnTab) {
          // Navigate to specific tab first, then screen
          navigation.navigate(returnTab, {
            screen: returnScreen,
          });
        } else {
          navigation.navigate(returnScreen);
        }
      }, 100);
    } else {
      // No return screen specified, just go back
      navigation.goBack();
    }
  };

  // Get isLandingPage flag from params
  const { isLandingPage } = route.params || {};

  // Prevent back button during checkout (not for landing pages)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (checkoutCompleted || cancelConfirmed) {
          return false; // Allow back after success or cancel confirmed
        }

        // Landing pages don't need confirmation - just go back
        if (isLandingPage) {
          handleCancelCheckout();
          return true;
        }

        alert({
          type: 'warning',
          title: 'Hủy thanh toán?',
          message: 'Bạn có chắc muốn hủy thanh toán?',
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

  // Get user email for auto-fill
  const userEmail = profile?.email || user?.email || '';

  // JavaScript to inject into WebView
  // Pass affiliate code, user_id, and email via string interpolation
  const injectedJavaScript = `
    (function() {
      console.log('[WebView] JavaScript injected successfully');

      // ============================================
      // PART 0: USER & AFFILIATE TRACKING
      // ============================================
      const affiliateCode = '${affiliateCode || ''}';
      const userId = '${userId || ''}';
      const userEmail = '${userEmail || ''}';

      console.log('[WebView] Tracking data:', { affiliateCode, userId, userEmail });

      // ============================================
      // PART 0.5: AUTO-COLLAPSE ORDER SUMMARY & AUTO-FILL EMAIL
      // ============================================
      function autoCollapseAndFillEmail() {
        // Auto-collapse order summary (click the toggle to close it)
        const orderSummaryToggle = document.querySelector('[data-order-summary-toggle]') ||
                                   document.querySelector('.order-summary-toggle') ||
                                   document.querySelector('.order-summary__toggle') ||
                                   document.querySelector('[aria-controls*="order-summary"]') ||
                                   document.querySelector('.order-summary-toggle-text');

        if (orderSummaryToggle) {
          // Check if it's currently expanded
          const isExpanded = orderSummaryToggle.getAttribute('aria-expanded') === 'true' ||
                            document.querySelector('.order-summary--is-expanded') ||
                            document.querySelector('[data-order-summary-section]:not([hidden])');

          if (isExpanded) {
            console.log('[WebView] Collapsing order summary...');
            orderSummaryToggle.click();
          }
        }

        // Also try to collapse via CSS (backup method)
        const collapseStyle = document.createElement('style');
        collapseStyle.id = 'auto-collapse-summary';
        collapseStyle.textContent = \`
          /* Force collapse order summary on mobile */
          .order-summary--is-expanded .order-summary__section,
          .order-summary--is-expanded .order-summary__sections,
          [data-order-summary-section] {
            max-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important;
            opacity: 0 !important;
          }

          /* Show collapsed state */
          .order-summary-toggle[aria-expanded="true"] {
            aria-expanded: false !important;
          }
        \`;

        if (!document.getElementById('auto-collapse-summary')) {
          document.head.appendChild(collapseStyle);
        }

        // Auto-fill email
        if (userEmail) {
          const emailInputs = document.querySelectorAll(
            'input[type="email"], ' +
            'input[name="checkout[email]"], ' +
            'input[name="email"], ' +
            'input[autocomplete="email"], ' +
            '#checkout_email, ' +
            '#email, ' +
            'input[placeholder*="Email"], ' +
            'input[placeholder*="email"]'
          );

          emailInputs.forEach(input => {
            if (!input.value || input.value.trim() === '') {
              input.value = userEmail;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              input.dispatchEvent(new Event('blur', { bubbles: true }));
              console.log('[WebView] ✅ Auto-filled email:', userEmail);
            }
          });
        }
      }

      // Run immediately and after short delays
      autoCollapseAndFillEmail();
      setTimeout(autoCollapseAndFillEmail, 500);
      setTimeout(autoCollapseAndFillEmail, 1000);
      setTimeout(autoCollapseAndFillEmail, 2000);

      // Also run on DOM changes
      const emailObserver = new MutationObserver(() => {
        autoCollapseAndFillEmail();
      });
      emailObserver.observe(document.body, { childList: true, subtree: true });

      // Try to inject tracking data into checkout attributes
      function injectTrackingData() {
        const form = document.querySelector('form[action*="checkout"]');
        if (!form) return;

        // ========================================
        // INJECT USER_ID (for direct user matching in webhook)
        // ========================================
        if (userId && !document.querySelector('input[name="checkout[attributes][user_id]"]')) {
          const userIdField = document.createElement('input');
          userIdField.type = 'hidden';
          userIdField.name = 'checkout[attributes][user_id]';
          userIdField.value = userId;
          form.appendChild(userIdField);
          console.log('[WebView] ✅ Injected user_id:', userId);
        }

        // ========================================
        // INJECT SOURCE (always mark as mobile_app)
        // ========================================
        if (!document.querySelector('input[name="checkout[attributes][source]"]')) {
          const sourceField = document.createElement('input');
          sourceField.type = 'hidden';
          sourceField.name = 'checkout[attributes][source]';
          sourceField.value = 'mobile_app';
          form.appendChild(sourceField);
          console.log('[WebView] ✅ Injected source: mobile_app');
        }

        // ========================================
        // INJECT AFFILIATE CODE (if present)
        // ========================================
        if (affiliateCode) {
          // Method 1: Look for note textarea and append
          const noteTextarea = document.querySelector('textarea[name="checkout[note]"]');
          if (noteTextarea) {
            const existingNote = noteTextarea.value;
            if (!existingNote.includes('partner_id:')) {
              noteTextarea.value = existingNote + (existingNote ? '\\n' : '') + 'partner_id:' + affiliateCode;
              console.log('[WebView] ✅ Injected partner_id into note');
            }
          }

          // Method 2: Hidden attribute field
          if (!document.querySelector('input[name="checkout[attributes][partner_id]"]')) {
            const partnerIdField = document.createElement('input');
            partnerIdField.type = 'hidden';
            partnerIdField.name = 'checkout[attributes][partner_id]';
            partnerIdField.value = affiliateCode;
            form.appendChild(partnerIdField);
            console.log('[WebView] ✅ Injected partner_id hidden field:', affiliateCode);
          }
        }
      }

      // Run immediately and on DOM changes
      injectTrackingData();
      const trackingObserver = new MutationObserver(injectTrackingData);
      trackingObserver.observe(document.body, { childList: true, subtree: true });

      // ============================================
      // PART 1: HIDE SHOPIFY HEADER/NAVIGATION
      // ============================================
      function hideShopifyHeader() {
        const style = document.createElement('style');
        style.id = 'hide-shopify-header';
        style.textContent = \`
          /* Hide all headers and navigation */
          header,
          nav,
          .header,
          .main-header,
          .checkout-header,
          [role="banner"],
          .site-header,
          .page-header,

          /* Hide back button */
          .previous-link,
          .step__footer__previous-link,

          /* Hide breadcrumbs */
          .breadcrumb,
          .breadcrumbs,

          /* Hide any top bars */
          .announcement-bar,
          .top-bar {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          /* Ensure full screen */
          body {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }

          /* Make checkout content full height */
          main,
          .main,
          .main-content {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
        \`;

        if (!document.getElementById('hide-shopify-header')) {
          document.head.appendChild(style);
          console.log('[WebView] Header hidden');
        }
      }

      // Apply immediately
      hideShopifyHeader();

      // Re-apply on DOM changes
      const headerObserver = new MutationObserver(hideShopifyHeader);
      headerObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      // ============================================
      // PART 2: DETECT SUCCESS PAGE & PAYMENT METHOD
      // ============================================

      let successDetected = false;
      let paymentMethodDetected = null;

      // Detect if the page has bank transfer / QR code payment info
      function detectBankTransferPayment() {
        // Check for QR code images
        const hasQRCode =
          document.querySelector('img[src*="qr"]') !== null ||
          document.querySelector('img[alt*="QR"]') !== null ||
          document.querySelector('img[alt*="qr"]') !== null ||
          document.querySelector('[class*="qr"]') !== null ||
          document.querySelector('[class*="QR"]') !== null ||
          document.querySelector('canvas') !== null; // QR codes often rendered as canvas

        // Check for bank transfer related text
        const pageText = document.body?.innerText?.toLowerCase() || '';
        const hasBankTransferText =
          pageText.includes('chuyển khoản') ||
          pageText.includes('transfer') ||
          pageText.includes('bank') ||
          pageText.includes('ngân hàng') ||
          pageText.includes('quét mã') ||
          pageText.includes('scan') ||
          pageText.includes('vietqr') ||
          pageText.includes('napas') ||
          pageText.includes('vnpay');

        // Check for COD (Cash on Delivery)
        const isCOD =
          pageText.includes('thanh toán khi nhận hàng') ||
          pageText.includes('cod') ||
          pageText.includes('cash on delivery') ||
          pageText.includes('trả tiền mặt');

        console.log('[WebView] Payment detection:', { hasQRCode, hasBankTransferText, isCOD });

        if (hasQRCode || hasBankTransferText) {
          return 'bank_transfer';
        }
        if (isCOD) {
          return 'cod';
        }
        return 'card'; // Default to card/instant payment
      }

      function detectSuccessPage() {
        if (successDetected) return true;

        const url = window.location.href;
        const pathname = window.location.pathname;
        const title = document.title.toLowerCase();

        // Multiple detection methods
        const isSuccessPage =
          // URL contains thank_you
          url.includes('/thank_you') ||
          url.includes('/thank-you') ||

          // URL contains orders
          url.includes('/orders/') ||
          pathname.includes('/orders/') ||

          // Checkouts with thank_you
          (pathname.includes('/checkouts/') && pathname.includes('/thank_you')) ||

          // DOM elements that indicate success
          document.querySelector('.os-order-number') !== null ||
          document.querySelector('[data-order-number]') !== null ||
          document.querySelector('.order-number') !== null ||
          document.querySelector('.thank-you') !== null ||
          document.querySelector('.order-confirmation') !== null ||

          // Page title
          title.includes('thank you') ||
          title.includes('order confirmed') ||
          title.includes('xác nhận đơn hàng') ||
          title.includes('đặt hàng thành công');

        if (isSuccessPage) {
          console.log('[WebView] SUCCESS PAGE DETECTED!');
          successDetected = true;

          // Wait a moment for page to fully load, then detect payment method
          setTimeout(() => {
            paymentMethodDetected = detectBankTransferPayment();
            console.log('[WebView] Payment method:', paymentMethodDetected);

            // Extract order information
            const orderInfo = extractOrderInfo();
            orderInfo.paymentMethod = paymentMethodDetected;

            // Send message to React Native
            sendSuccessMessage(orderInfo);
          }, 500);

          return true;
        }

        return false;
      }

      function extractOrderInfo() {
        let orderId = null;
        let orderNumber = null;

        // Try to get order number from DOM
        const orderNumberSelectors = [
          '.os-order-number',
          '[data-order-number]',
          '.order-number',
          '.order-confirmation__order-number',
        ];

        for (const selector of orderNumberSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            orderNumber = el.textContent.trim().replace('#', '');
            console.log('[WebView] Order number from DOM:', orderNumber);
            break;
          }
        }

        // Try to get order ID from URL
        const urlMatch = window.location.href.match(/orders\\/(\\d+)/);
        if (urlMatch) {
          orderId = urlMatch[1];
          console.log('[WebView] Order ID from URL:', orderId);
        }

        // Try to get from checkout ID
        const checkoutMatch = window.location.href.match(/checkouts\\/([a-zA-Z0-9]+)/);
        if (checkoutMatch) {
          console.log('[WebView] Checkout token:', checkoutMatch[1]);
        }

        return {
          orderId: orderId,
          orderNumber: orderNumber,
          url: window.location.href,
          timestamp: Date.now(),
          affiliateCode: affiliateCode || null,
        };
      }

      function sendSuccessMessage(orderInfo) {
        const message = {
          type: 'CHECKOUT_SUCCESS',
          ...orderInfo,
        };

        console.log('[WebView] Sending success message:', message);

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        } else {
          console.error('[WebView] ReactNativeWebView not available!');
        }
      }

      // ============================================
      // PART 3: MULTIPLE DETECTION METHODS
      // ============================================

      // Method 1: Check immediately
      console.log('[WebView] Running immediate check...');
      detectSuccessPage();

      // Method 2: Check on page load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          console.log('[WebView] DOMContentLoaded check...');
          setTimeout(() => detectSuccessPage(), 100);
        });
      } else {
        console.log('[WebView] Document already loaded, checking...');
        setTimeout(() => detectSuccessPage(), 100);
      }

      // Method 3: Interval checking (every 500ms)
      let checkCount = 0;
      const maxChecks = 60; // 30 seconds max

      const intervalId = setInterval(() => {
        checkCount++;

        if (successDetected || checkCount >= maxChecks) {
          console.log('[WebView] Stopping interval checks');
          clearInterval(intervalId);
          return;
        }

        detectSuccessPage();
      }, 500);

      // Method 4: URL change detection (for SPA navigation)
      let lastUrl = window.location.href;
      setInterval(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
          console.log('[WebView] URL changed:', currentUrl);
          lastUrl = currentUrl;
          detectSuccessPage();
        }
      }, 300);

      // Method 5: DOM mutation observer
      const domObserver = new MutationObserver((mutations) => {
        if (successDetected) {
          domObserver.disconnect();
          return;
        }

        // Check if any mutation added success-related elements
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            detectSuccessPage();
            break;
          }
        }
      });

      domObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Method 6: Listen for pushState/replaceState (SPA routing)
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function(...args) {
        originalPushState.apply(this, args);
        console.log('[WebView] pushState detected');
        setTimeout(() => detectSuccessPage(), 200);
      };

      history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        console.log('[WebView] replaceState detected');
        setTimeout(() => detectSuccessPage(), 200);
      };

      // ============================================
      // PART 4: KEEP-ALIVE PING
      // ============================================

      setInterval(() => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PING',
            url: window.location.href,
            timestamp: Date.now(),
          }));
        }
      }, 5000);

      console.log('[WebView] All detection methods initialized');
    })();

    true; // Required for iOS
  `;

  // Handle messages from WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'CHECKOUT_SUCCESS') {
        console.log('[CheckoutWebView] SUCCESS MESSAGE RECEIVED!');
        console.log('[CheckoutWebView] Order data:', data);

        handleCheckoutSuccess(data);
      } else if (data.type === 'PING') {
        console.log('[CheckoutWebView] Ping:', data.url);
      }

    } catch (error) {
      console.error('[CheckoutWebView] Message parse error:', error);
      console.error('[CheckoutWebView] Raw message:', event.nativeEvent.data);
    }
  };

  // Handle navigation state changes (backup detection)
  const handleNavigationStateChange = (navState) => {
    const { url, loading: navLoading } = navState;

    console.log('[CheckoutWebView] Navigation:', {
      url: url,
      loading: navLoading,
    });

    // Backup detection via navigation state
    if (!checkoutCompleted && !navLoading) {
      if (url.includes('/thank_you') || url.includes('/orders/')) {
        console.log('[CheckoutWebView] Success detected via navigation state!');

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

  // Navigate to success screen (called after bank transfer user taps "Done" or for card payments)
  const navigateToSuccessScreen = async (orderData) => {
    try {
      // Clear affiliate code after successful checkout
      try {
        await deepLinkHandler.clearCheckoutAffiliate();
        console.log('[CheckoutWebView] Cleared affiliate code');
      } catch (err) {
        console.log('[CheckoutWebView] Error clearing affiliate code:', err);
      }

      // Get params from route to determine product type
      const { productType, gemAmount, packageName } = route.params || {};

      console.log('[CheckoutWebView] Navigating to success screen...');

      // Check if this is a GEM purchase
      if (productType === 'gems') {
        console.log('[CheckoutWebView] GEM purchase detected!');
        navigation.replace('GemPurchasePending', {
          orderId: orderData?.orderId,
          orderNumber: orderData?.orderNumber,
          orderUrl: orderData?.url,
          gemAmount: gemAmount,
          packageName: packageName,
        });
      } else {
        // Regular shop order - navigate to OrderSuccess
        navigation.replace('OrderSuccess', {
          orderId: orderData?.orderId,
          orderNumber: orderData?.orderNumber,
          orderUrl: orderData?.url,
        });

        // Clear cart for regular shop orders
        completeCheckout(orderData?.orderId, orderData?.orderNumber);
      }
    } catch (error) {
      console.error('[CheckoutWebView] Error navigating:', error);
      navigation.replace('OrderSuccess', { orderId: null, orderNumber: null });
    }
  };

  // Handle "Done" button press for bank transfer payments
  const handleBankTransferDone = () => {
    console.log('[CheckoutWebView] Bank transfer user tapped Done');
    setShowBankTransferOverlay(false);
    navigateToSuccessScreen(pendingOrderData);
  };

  // Handle checkout success
  const handleCheckoutSuccess = async (orderData) => {
    if (checkoutCompleted) {
      console.log('[CheckoutWebView] Already handled success, ignoring');
      return;
    }

    try {
      console.log('[CheckoutWebView] Processing checkout success...');
      console.log('[CheckoutWebView] Affiliate code:', affiliateCode || orderData.affiliateCode || 'none');
      console.log('[CheckoutWebView] Payment method:', orderData.paymentMethod);

      setCheckoutCompleted(true);

      // Check if this is a bank transfer payment
      const isBankTransfer = orderData.paymentMethod === 'bank_transfer';

      if (isBankTransfer) {
        // For bank transfer: Show overlay, let user scan QR code
        console.log('[CheckoutWebView] Bank transfer detected - showing overlay');
        setPendingOrderData(orderData);
        setShowBankTransferOverlay(true);
        // Don't auto-navigate - user will tap "Done" when ready
        return;
      }

      // For card/COD payments: Navigate immediately
      setTimeout(() => {
        navigateToSuccessScreen(orderData);
      }, 300);

    } catch (error) {
      console.error('[CheckoutWebView] Error handling success:', error);

      // Fallback: just close and show pending/success
      const { productType, gemAmount, packageName } = route.params || {};

      if (productType === 'gems') {
        navigation.replace('GemPurchasePending', {
          orderId: null,
          orderNumber: null,
          gemAmount: gemAmount,
          packageName: packageName,
        });
      } else {
        navigation.replace('OrderSuccess', {
          orderId: null,
          orderNumber: null,
        });
      }
    }
  };

  // Handle WebView errors
  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('[CheckoutWebView] WebView error:', nativeEvent);

    alert({
      type: 'error',
      title: 'Lỗi Tải Trang',
      message: 'Không thể tải trang thanh toán. Vui lòng thử lại.',
      buttons: [
        {
          text: 'Thử lại',
          onPress: () => {
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          },
        },
        {
          text: 'Quay lại',
          style: 'cancel',
          onPress: handleCancelCheckout,
        },
      ],
    });
  };

  // Handle back button press with confirmation (not for landing pages)
  const handleBackPress = () => {
    if (checkoutCompleted || cancelConfirmed) {
      handleCancelCheckout();
      return;
    }

    // Landing pages don't need confirmation - just go back
    if (isLandingPage) {
      handleCancelCheckout();
      return;
    }

    alert({
      type: 'warning',
      title: 'Hủy thanh toán?',
      message: 'Bạn có chắc muốn hủy thanh toán?',
      buttons: [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        {
          text: 'Hủy',
          style: 'destructive',
          onPress: handleCancelCheckout,
        },
      ],
    });
  };

  // Get title from route params
  const headerTitle = route.params?.title || 'Thanh toán';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: checkoutUrl }}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => {
          console.log('[CheckoutWebView] Load started');
          setLoading(true);
        }}
        onLoadEnd={() => {
          console.log('[CheckoutWebView] Load ended');
          setLoading(false);
        }}
        onError={handleError}
        injectedJavaScript={injectedJavaScript}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        style={styles.webview}

        // WebView configuration
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={false}

        // iOS specific
        {...(Platform.OS === 'ios' && {
          contentInsetAdjustmentBehavior: 'automatic',
          bounces: false,
          scrollEnabled: true,
        })}

        // Android specific
        {...(Platform.OS === 'android' && {
          mixedContentMode: 'always',
          thirdPartyCookiesEnabled: true,
        })}
      />

      {/* Bank Transfer Overlay - Shows after detecting QR code payment */}
      {showBankTransferOverlay && (
        <View style={styles.bankTransferOverlay}>
          <View style={styles.bankTransferCard}>
            <View style={styles.qrIconContainer}>
              <QrCode size={32} color={COLORS.gold} />
            </View>

            <Text style={styles.bankTransferTitle}>
              Quét mã QR để thanh toán
            </Text>

            <Text style={styles.bankTransferDescription}>
              Vui lòng quét mã QR ở trên để hoàn tất thanh toán.{'\n'}
              Nhấn "Hoàn tất" khi bạn đã thanh toán xong.
            </Text>

            <TouchableOpacity
              style={styles.bankTransferDoneButton}
              onPress={handleBankTransferDone}
              activeOpacity={0.8}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.bankTransferDoneText}>Hoàn tất</Text>
            </TouchableOpacity>

            <Text style={styles.bankTransferNote}>
              Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán
            </Text>
          </View>
        </View>
      )}

      {AlertComponent}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for Shopify checkout
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },

  backButton: {
    padding: SPACING.xs,
  },

  closeButton: {
    padding: SPACING.xs,
  },

  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },

  loadingContainer: {
    position: 'absolute',
    top: 60, // Account for header height
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },

  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Bank Transfer Overlay Styles
  bankTransferOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  bankTransferCard: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'android' ? 100 : 40, // Extra padding for Android tab bar
    alignItems: 'center',
  },

  qrIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },

  bankTransferTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },

  bankTransferDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },

  bankTransferDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3AF7A6',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
    shadowColor: '#3AF7A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  bankTransferDoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },

  bankTransferNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CheckoutWebView;
