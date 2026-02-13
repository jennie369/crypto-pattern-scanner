/**
 * Gemral - Repost Sheet Component
 * Feature #10: Repost to Feed
 * Bottom sheet for reposting with optional quote
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Repeat,
  MessageSquare,
  Send,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, INPUT } from '../utils/tokens';
import QuotedPost from './QuotedPost';
import repostService from '../services/repostService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RepostSheet = ({
  visible,
  onClose,
  post,
  onSuccess,
}) => {
  const [mode, setMode] = useState('instant'); // 'instant' or 'quote'
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  React.useEffect(() => {
    if (visible) {
      // Reset state
      setMode('instant');
      setQuote('');
      setLoading(false);

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Handle instant repost
  const handleInstantRepost = useCallback(async () => {
    if (!post || loading) return;

    setLoading(true);
    const result = await repostService.createRepost(post.id);
    setLoading(false);

    if (result.success) {
      onSuccess?.(result.data);
      onClose?.();
    } else {
      // Show error - you might want to use a toast here
      console.error('[RepostSheet] Error:', result.error);
    }
  }, [post, loading, onSuccess, onClose]);

  // Handle quote repost
  const handleQuoteRepost = useCallback(async () => {
    if (!post || loading) return;

    setLoading(true);
    const result = await repostService.createRepost(post.id, quote);
    setLoading(false);

    if (result.success) {
      onSuccess?.(result.data);
      onClose?.();
    } else {
      console.error('[RepostSheet] Error:', result.error);
    }
  }, [post, quote, loading, onSuccess, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
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
              <Text style={styles.title}>Đăng lại</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Mode Selection */}
            <View style={styles.modeContainer}>
              <TouchableOpacity
                style={[
                  styles.modeOption,
                  mode === 'instant' && styles.modeOptionActive,
                ]}
                onPress={() => setMode('instant')}
                activeOpacity={0.7}
              >
                <Repeat
                  size={22}
                  color={mode === 'instant' ? COLORS.purple : COLORS.textMuted}
                />
                <View style={styles.modeText}>
                  <Text
                    style={[
                      styles.modeLabel,
                      mode === 'instant' && styles.modeLabelActive,
                    ]}
                  >
                    Đăng lại ngay
                  </Text>
                  <Text style={styles.modeSubtitle}>
                    Chia sẻ bài viết lên bảng tin của bạn
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeOption,
                  mode === 'quote' && styles.modeOptionActive,
                ]}
                onPress={() => setMode('quote')}
                activeOpacity={0.7}
              >
                <MessageSquare
                  size={22}
                  color={mode === 'quote' ? COLORS.purple : COLORS.textMuted}
                />
                <View style={styles.modeText}>
                  <Text
                    style={[
                      styles.modeLabel,
                      mode === 'quote' && styles.modeLabelActive,
                    ]}
                  >
                    Đăng lại kèm bình luận
                  </Text>
                  <Text style={styles.modeSubtitle}>
                    Thêm bình luận của bạn khi đăng lại
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Quote Input (when in quote mode) */}
            {mode === 'quote' && (
              <View style={styles.quoteContainer}>
                <TextInput
                  style={styles.quoteInput}
                  placeholder="Viết bình luận của bạn..."
                  placeholderTextColor={COLORS.textMuted}
                  value={quote}
                  onChangeText={setQuote}
                  multiline
                  maxLength={280}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{quote.length}/280</Text>
              </View>
            )}

            {/* Post Preview */}
            {post && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Bài viết gốc</Text>
                <QuotedPost post={post} />
              </View>
            )}

            {/* Action Button */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  loading && styles.actionButtonDisabled,
                ]}
                onPress={mode === 'instant' ? handleInstantRepost : handleQuoteRepost}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.textPrimary} />
                ) : (
                  <>
                    <Send size={18} color={COLORS.textPrimary} />
                    <Text style={styles.actionButtonText}>
                      {mode === 'instant' ? 'Đăng lại ngay' : 'Đăng với bình luận'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  blurContainer: {
    backgroundColor: GLASS.background,
    paddingBottom: 34, // Safe area
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
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.lg,
    padding: SPACING.xs,
  },
  modeContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modeOptionActive: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  modeText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  modeLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  modeLabelActive: {
    color: COLORS.textPrimary,
  },
  modeSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  quoteContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    position: 'relative',
  },
  quoteInput: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    minHeight: 100,
    maxHeight: 150,
  },
  charCount: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  previewContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  actionContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default RepostSheet;
