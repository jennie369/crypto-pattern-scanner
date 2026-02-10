/**
 * InAppBrowser Component
 * Modal WebView để mở links trong app
 * Thay vì dùng external browser
 */

import React, { useState, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  Share,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Share2,
  ExternalLink,
  Globe,
  Lock,
  Copy,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * InAppBrowser - Modal WebView để mở links
 *
 * @param {boolean} visible - Hiển thị modal
 * @param {string} url - URL cần mở
 * @param {string} title - Title hiển thị (optional)
 * @param {Function} onClose - Callback khi đóng
 */
const InAppBrowser = ({
  visible,
  url,
  title,
  onClose,
}) => {
  // ========== STATE ==========
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [currentTitle, setCurrentTitle] = useState(title || '');
  const [isSecure, setIsSecure] = useState(false);
  const [progress, setProgress] = useState(0);

  const webViewRef = useRef(null);

  // ========== HANDLERS ==========

  /**
   * Handle navigation state change
   */
  const handleNavigationStateChange = useCallback((navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setCurrentTitle(navState.title || '');
    setIsSecure(navState.url?.startsWith('https://'));
    setLoading(navState.loading);
  }, []);

  /**
   * Handle load progress
   */
  const handleLoadProgress = useCallback(({ nativeEvent }) => {
    setProgress(nativeEvent.progress);
  }, []);

  /**
   * Go back
   */
  const handleGoBack = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    webViewRef.current?.goBack();
  }, []);

  /**
   * Go forward
   */
  const handleGoForward = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    webViewRef.current?.goForward();
  }, []);

  /**
   * Reload page
   */
  const handleReload = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    webViewRef.current?.reload();
  }, []);

  /**
   * Share URL
   */
  const handleShare = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }

    try {
      await Share.share({
        message: currentUrl,
        url: currentUrl,
        title: currentTitle || 'Chia sẻ link',
      });
    } catch (error) {
      console.error('[InAppBrowser] Share error:', error);
    }
  }, [currentUrl, currentTitle]);

  /**
   * Copy URL to clipboard
   */
  const handleCopyUrl = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }

    await Clipboard.setStringAsync(currentUrl);
  }, [currentUrl]);

  /**
   * Open in external browser
   */
  const handleOpenExternal = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }

    try {
      await Linking.openURL(currentUrl);
      onClose?.();
    } catch (error) {
      console.error('[InAppBrowser] Open external error:', error);
    }
  }, [currentUrl, onClose]);

  /**
   * Handle close
   */
  const handleClose = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    onClose?.();
  }, [onClose]);

  /**
   * Extract domain from URL
   */
  const getDomain = useCallback((urlStr) => {
    try {
      const urlObj = new URL(urlStr);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return urlStr;
    }
  }, []);

  // ========== RENDER ==========
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* URL Bar */}
          <TouchableOpacity
            style={styles.urlBar}
            onPress={handleCopyUrl}
            activeOpacity={0.7}
          >
            {isSecure ? (
              <Lock size={12} color={COLORS.success} />
            ) : (
              <Globe size={12} color={COLORS.textMuted} />
            )}
            <Text style={styles.urlText} numberOfLines={1}>
              {getDomain(currentUrl)}
            </Text>
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Share2 size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleOpenExternal}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ExternalLink size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        {loading && progress < 1 && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadProgress={handleLoadProgress}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          allowsBackForwardNavigationGestures
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          )}
          {...(Platform.OS === 'ios' && {
            contentInsetAdjustmentBehavior: 'automatic',
            bounces: true,
          })}
          {...(Platform.OS === 'android' && {
            mixedContentMode: 'always',
            thirdPartyCookiesEnabled: true,
          })}
        />

        {/* Bottom Toolbar */}
        <SafeAreaView edges={['bottom']} style={styles.bottomToolbar}>
          <View style={styles.toolbarContent}>
            <TouchableOpacity
              style={[styles.toolbarButton, !canGoBack && styles.toolbarButtonDisabled]}
              onPress={handleGoBack}
              disabled={!canGoBack}
            >
              <ChevronLeft size={24} color={canGoBack ? COLORS.textPrimary : COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolbarButton, !canGoForward && styles.toolbarButtonDisabled]}
              onPress={handleGoForward}
              disabled={!canGoForward}
            >
              <ChevronRight size={24} color={canGoForward ? COLORS.textPrimary : COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleReload}
            >
              <RefreshCw size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleCopyUrl}
            >
              <Copy size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </Modal>
  );
};

// ========== STYLES ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(17, 34, 80, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.sm,
  },

  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  urlBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },

  urlText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },

  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Progress Bar
  progressBarContainer: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },

  // WebView
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
  },

  // Bottom Toolbar
  bottomToolbar: {
    backgroundColor: 'rgba(17, 34, 80, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  toolbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },

  toolbarButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },

  toolbarButtonDisabled: {
    opacity: 0.4,
  },
});

// ========== EXPORTS ==========

export default memo(InAppBrowser);
