/**
 * LinkPreviewCard Component
 * Hiển thị preview của URL theo Threads-style
 * Phase 3: UI Component
 */

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ExternalLink,
  X,
  Play,
  Globe,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { IMAGE_DIMENSIONS, UI_TOOLTIPS, PREVIEW_STATUS } from '../../../constants/linkPreview';
import { InAppBrowser } from '../../../components/Common';

// ========== CONSTANTS ==========

const CARD_BORDER_RADIUS = 12;
const IMAGE_ASPECT_RATIO = IMAGE_DIMENSIONS?.CARD_IMAGE_RATIO || 1.91;

// ========== SUBCOMPONENTS ==========

/**
 * Preview Image với loading và error handling
 */
const PreviewImage = memo(({
  imageUrl,
  isVideo,
  onLoadStart,
  onLoadEnd,
  onError
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
    onError?.();
  }, [onError]);

  if (!imageUrl || error) {
    return (
      <View style={styles.imagePlaceholder}>
        <Globe size={32} color={COLORS.textMuted} />
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.previewImage}
        resizeMode="cover"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />

      {/* Loading overlay */}
      {loading && (
        <View style={styles.imageLoadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.gold} />
        </View>
      )}

      {/* Video play button overlay */}
      {isVideo && !loading && (
        <View style={styles.videoOverlay}>
          <View style={styles.playButton}>
            <Play size={24} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          </View>
        </View>
      )}

      {/* Gradient overlay for better text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)']}
        style={styles.imageGradient}
      />
    </View>
  );
});

/**
 * Domain với favicon
 */
const DomainBadge = memo(({ domain, favicon }) => (
  <View style={styles.domainContainer}>
    {favicon ? (
      <Image
        source={{ uri: favicon }}
        style={styles.favicon}
        resizeMode="contain"
      />
    ) : (
      <Globe size={12} color={COLORS.textMuted} />
    )}
    <Text style={styles.domainText} numberOfLines={1}>
      {domain}
    </Text>
  </View>
));

/**
 * Remove button (X)
 */
const RemoveButton = memo(({ onPress }) => (
  <TouchableOpacity
    style={styles.removeButton}
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    accessibilityLabel="Xóa link preview"
    accessibilityHint={UI_TOOLTIPS?.REMOVE_PREVIEW || 'Xóa link preview'}
  >
    <X size={16} color={COLORS.textMuted} />
  </TouchableOpacity>
));

// ========== MAIN COMPONENT ==========

/**
 * LinkPreviewCard - Component hiển thị link preview
 *
 * @param {Object} props
 * @param {Object} props.preview - Dữ liệu preview
 * @param {Function} props.onPress - Callback khi nhấn card
 * @param {Function} props.onRemove - Callback khi nhấn remove (optional)
 * @param {Function} props.onRetry - Callback khi nhấn retry (optional)
 * @param {boolean} props.showRemoveButton - Hiển thị nút xóa
 * @param {boolean} props.compact - Sử dụng compact style
 * @param {boolean} props.disabled - Disable interaction
 * @param {Object} props.style - Custom styles
 */
const LinkPreviewCard = ({
  preview,
  onPress,
  onRemove,
  onRetry,
  showRemoveButton = false,
  compact = false,
  disabled = false,
  useInAppBrowser = true,
  style,
}) => {
  // ========== STATE ==========
  const [pressed, setPressed] = useState(false);
  const [browserVisible, setBrowserVisible] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');

  // ========== COMPUTED ==========
  const {
    url = '',
    domain = '',
    title = '',
    description = null,
    image = null,
    favicon = null,
    siteName = '',
    type = 'website',
    isVideo = false,
    status = PREVIEW_STATUS?.SUCCESS || 'success',
    error: errorMessage = null,
  } = preview || {};

  const hasImage = !!image;
  const isError = status === (PREVIEW_STATUS?.ERROR || 'error');
  const isLoading = status === (PREVIEW_STATUS?.LOADING || 'loading');

  // ========== HANDLERS ==========

  /**
   * Open link in In-App Browser
   */
  const openInAppBrowser = useCallback((linkUrl) => {
    setBrowserUrl(linkUrl);
    setBrowserVisible(true);
  }, []);

  /**
   * Close In-App Browser
   */
  const closeBrowser = useCallback(() => {
    setBrowserVisible(false);
    setBrowserUrl('');
  }, []);

  /**
   * Handle card press - mở link trong browser
   */
  const handlePress = useCallback(async () => {
    if (disabled || isLoading) return;

    // Haptic feedback
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Ignore haptics error
      }
    }

    if (onPress) {
      onPress(url);
      return;
    }

    // Use In-App Browser if enabled (default)
    if (useInAppBrowser && Platform.OS !== 'web') {
      openInAppBrowser(url);
      return;
    }

    // Fallback: Open in external browser
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Không thể mở link',
          'Đường dẫn này không thể mở được.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('[LinkPreviewCard] Open URL error:', err);
      Alert.alert('Lỗi', 'Không thể mở đường dẫn này.');
    }
  }, [url, disabled, isLoading, onPress, useInAppBrowser, openInAppBrowser]);

  /**
   * Handle long press - show options
   */
  const handleLongPress = useCallback(async () => {
    if (disabled) return;

    // Haptic feedback
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        // Ignore haptics error
      }
    }

    Alert.alert(
      siteName || domain,
      url,
      [
        {
          text: 'Mở trong trình duyệt',
          onPress: handlePress,
        },
        {
          text: 'Sao chép đường dẫn',
          onPress: async () => {
            await Clipboard.setStringAsync(url);
            if (Platform.OS !== 'web') {
              try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (e) {
                // Ignore haptics error
              }
            }
          },
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ]
    );
  }, [url, domain, siteName, disabled, handlePress]);

  /**
   * Handle remove
   */
  const handleRemove = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Ignore haptics error
      }
    }
    onRemove?.();
  }, [onRemove]);

  /**
   * Handle retry
   */
  const handleRetry = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Ignore haptics error
      }
    }
    onRetry?.();
  }, [onRetry]);

  // ========== PRESS FEEDBACK ==========
  const handlePressIn = useCallback(() => setPressed(true), []);
  const handlePressOut = useCallback(() => setPressed(false), []);

  // ========== RENDER ERROR STATE ==========
  if (isError) {
    return (
      <View style={[styles.errorContainer, style]}>
        <AlertCircle size={20} color={COLORS.error} />
        <Text style={styles.errorText} numberOfLines={1}>
          {errorMessage || 'Không thể tải preview'}
        </Text>
        {onRetry && (
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <RefreshCw size={16} color={COLORS.gold} />
          </TouchableOpacity>
        )}
        {showRemoveButton && onRemove && (
          <RemoveButton onPress={handleRemove} />
        )}
      </View>
    );
  }

  // ========== RENDER COMPACT STYLE ==========
  if (compact) {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.compactContainer,
            pressed && styles.cardPressed,
            disabled && styles.cardDisabled,
            style,
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityRole="link"
          accessibilityLabel={`Link tới ${siteName || domain}`}
          accessibilityHint={UI_TOOLTIPS?.LINK_PREVIEW_CARD || 'Nhấn để mở link'}
        >
          {/* Thumbnail */}
          {hasImage ? (
            <Image
              source={{ uri: image }}
              style={styles.compactThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.compactThumbnailPlaceholder}>
              {isVideo ? (
                <Play size={20} color={COLORS.textMuted} />
              ) : (
                <Globe size={20} color={COLORS.textMuted} />
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.compactContent}>
            <DomainBadge domain={domain} favicon={favicon} />
            <Text style={styles.compactTitle} numberOfLines={2}>
              {title || domain}
            </Text>
          </View>

          {/* External icon */}
          <ExternalLink size={14} color={COLORS.textMuted} style={styles.externalIcon} />

          {/* Remove button */}
          {showRemoveButton && onRemove && (
            <RemoveButton onPress={handleRemove} />
          )}
        </TouchableOpacity>

        {/* In-App Browser Modal */}
        <InAppBrowser
          visible={browserVisible}
          url={browserUrl}
          title={title || siteName || domain}
          onClose={closeBrowser}
        />
      </>
    );
  }

  // ========== RENDER FULL STYLE (Threads-style) ==========
  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          pressed && styles.cardPressed,
          disabled && styles.cardDisabled,
          style,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        accessibilityRole="link"
        accessibilityLabel={`Link tới ${siteName || domain}: ${title}`}
        accessibilityHint={UI_TOOLTIPS?.LINK_PREVIEW_CARD || 'Nhấn để mở link'}
      >
        {/* Preview Image */}
        {hasImage && (
          <PreviewImage
            imageUrl={image}
            isVideo={isVideo}
          />
        )}

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Domain */}
          <DomainBadge domain={domain} favicon={favicon} />

          {/* Title */}
          <Text
            style={styles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {title || domain}
          </Text>

          {/* Description */}
          {description && (
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
          )}
        </View>

        {/* Remove button (absolute positioned) */}
        {showRemoveButton && onRemove && (
          <View style={styles.removeButtonWrapper}>
            <RemoveButton onPress={handleRemove} />
          </View>
        )}
      </TouchableOpacity>

      {/* In-App Browser Modal */}
      <InAppBrowser
        visible={browserVisible}
        url={browserUrl}
        title={title || siteName || domain}
        onClose={closeBrowser}
      />
    </>
  );
};

// ========== STYLES ==========

const styles = StyleSheet.create({
  // ===== FULL CARD STYLES =====
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  cardDisabled: {
    opacity: 0.5,
  },

  // ===== IMAGE STYLES =====
  imageContainer: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT_RATIO,
    backgroundColor: COLORS.glassBg,
    position: 'relative',
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT_RATIO,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },

  // ===== VIDEO OVERLAY =====
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },

  // ===== CONTENT STYLES =====
  contentContainer: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },

  domainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  favicon: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },

  domainText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textTransform: 'lowercase',
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // ===== COMPACT STYLES =====
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  compactThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: COLORS.glassBg,
  },

  compactThumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  compactContent: {
    flex: 1,
    gap: SPACING.xs / 2,
  },

  compactTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },

  externalIcon: {
    marginLeft: SPACING.xs,
  },

  // ===== REMOVE BUTTON =====
  removeButtonWrapper: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },

  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== ERROR STATE =====
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    borderRadius: 8,
    padding: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(156, 6, 18, 0.2)',
  },

  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    flex: 1,
  },

  retryButton: {
    padding: SPACING.xs,
  },
});

// ========== EXPORTS ==========

export default memo(LinkPreviewCard);

// Named export for specific use cases
export { PreviewImage, DomainBadge, RemoveButton };
