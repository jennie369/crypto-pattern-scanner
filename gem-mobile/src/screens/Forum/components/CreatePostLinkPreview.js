/**
 * CreatePostLinkPreview Component
 * Component wrapper cho link preview trong form tạo post
 * Phase 4: CreatePost Integration
 */

import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { X, Link2, AlertCircle, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import LinkPreviewCard from './LinkPreviewCard';
import LinkPreviewSkeleton from './LinkPreviewSkeleton';
import { useLinkPreviewForm } from '../../../hooks/useLinkPreview';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';
import { PREVIEW_STATUS, UI_TOOLTIPS } from '../../../constants/linkPreview';

// ========== MAIN COMPONENT ==========

/**
 * CreatePostLinkPreview - Wrapper cho link preview trong form tạo post
 *
 * @param {Object} props
 * @param {string} props.content - Nội dung text của post
 * @param {Function} props.onPreviewChange - Callback khi preview thay đổi
 * @param {boolean} props.disabled - Disable component
 */
const CreatePostLinkPreview = ({
  content = '',
  onPreviewChange,
  disabled = false,
}) => {
  // ========== HOOK ==========
  const {
    url,
    preview,
    loading,
    error,
    removed,
    detectFromText,
    removePreview,
    refetch,
    getPreviewData,
    hasPreview,
  } = useLinkPreviewForm();

  // ========== ANIMATION ==========
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // ========== EFFECTS ==========

  // Detect URL khi content thay đổi
  useEffect(() => {
    if (!disabled) {
      detectFromText(content);
    }
  }, [content, disabled, detectFromText]);

  // Notify parent khi preview thay đổi
  useEffect(() => {
    const previewData = getPreviewData();
    onPreviewChange?.(previewData);
  }, [preview, removed, getPreviewData, onPreviewChange]);

  // Animate in/out
  useEffect(() => {
    const shouldShow = (url && !removed) || loading;

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: shouldShow ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: shouldShow ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [url, removed, loading, slideAnim, opacityAnim]);

  // ========== HANDLERS ==========

  /**
   * Handle remove preview
   */
  const handleRemove = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Ignore haptics error
      }
    }
    removePreview();
  }, [removePreview]);

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
    refetch();
  }, [refetch]);

  // ========== COMPUTED ==========

  // Không hiển thị gì nếu không có URL hoặc đã remove
  const shouldRender = (url && !removed) || loading;

  if (!shouldRender) {
    return null;
  }

  // Animation styles
  const animatedStyle = {
    opacity: opacityAnim,
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  // ========== RENDER ==========
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Link2 size={14} color={COLORS.textMuted} />
          <Text style={styles.headerText}>Link Preview</Text>
        </View>

        {/* Remove button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemove}
          disabled={disabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Xóa link preview"
          accessibilityHint={UI_TOOLTIPS?.REMOVE_PREVIEW || 'Xóa link preview'}
        >
          <X size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Preview Content */}
      <View style={styles.previewContainer}>
        {loading && !preview ? (
          // Loading skeleton
          <LinkPreviewSkeleton />
        ) : error ? (
          // Error state
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color={COLORS.error} />
            <Text style={styles.errorText} numberOfLines={1}>
              {error || 'Không thể tải preview'}
            </Text>
            <TouchableOpacity
              onPress={handleRetry}
              style={styles.retryButton}
              disabled={disabled}
            >
              <RefreshCw size={16} color={COLORS.gold} />
            </TouchableOpacity>
          </View>
        ) : hasPreview ? (
          // Preview card
          <LinkPreviewCard
            preview={preview}
            showRemoveButton={false}
            disabled={disabled}
          />
        ) : url ? (
          // URL detected but no preview yet - show minimal
          <View style={styles.urlOnlyContainer}>
            <Link2 size={16} color={COLORS.textMuted} />
            <Text style={styles.urlText} numberOfLines={1}>
              {url}
            </Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

// ========== STYLES ==========

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  headerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  removeButton: {
    padding: SPACING.xs,
    borderRadius: 4,
  },

  previewContainer: {
    padding: SPACING.sm,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    borderRadius: 8,
  },

  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    flex: 1,
  },

  retryButton: {
    padding: SPACING.xs,
  },

  urlOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
  },

  urlText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
});

// ========== EXPORTS ==========

export default memo(CreatePostLinkPreview);
