/**
 * Gemral - Repost Sheet Component
 * Feature #10: Repost to Feed
 * Bottom sheet for reposting with optional quote
 */

import React, { useState, useCallback, useMemo } from 'react';
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
import { useSettings } from '../contexts/SettingsContext';
import QuotedPost from './QuotedPost';
import repostService from '../services/repostService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RepostSheet = ({
  visible,
  onClose,
  post,
  onSuccess,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const [mode, setMode] = useState('instant'); // 'instant' or 'quote'
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    sheet: {
      borderTopLeftRadius: glass.borderRadius,
      borderTopRightRadius: glass.borderRadius,
      overflow: 'hidden',
      maxHeight: SCREEN_HEIGHT * 0.85,
    },
    blurContainer: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
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
      color: colors.textPrimary,
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
      borderColor: colors.purple,
      backgroundColor: 'rgba(106, 91, 255, 0.1)',
    },
    modeText: {
      flex: 1,
      marginLeft: SPACING.md,
    },
    modeLabel: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: colors.textSecondary,
    },
    modeLabelActive: {
      color: colors.textPrimary,
    },
    modeSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      marginTop: 2,
    },
    quoteContainer: {
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.lg,
      position: 'relative',
    },
    quoteInput: {
      backgroundColor: colors.inputBackground || 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder || 'rgba(255, 255, 255, 0.1)',
      padding: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textPrimary,
      minHeight: 100,
      maxHeight: 150,
    },
    charCount: {
      position: 'absolute',
      bottom: SPACING.sm,
      right: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    previewContainer: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
    },
    previewLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
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
      backgroundColor: colors.purple,
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
      color: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
              <Text style={styles.title}>Dang lai</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={colors.textMuted} />
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
                  color={mode === 'instant' ? colors.purple : colors.textMuted}
                />
                <View style={styles.modeText}>
                  <Text
                    style={[
                      styles.modeLabel,
                      mode === 'instant' && styles.modeLabelActive,
                    ]}
                  >
                    Dang lai ngay
                  </Text>
                  <Text style={styles.modeSubtitle}>
                    Chia se bai viet len bang tin cua ban
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
                  color={mode === 'quote' ? colors.purple : colors.textMuted}
                />
                <View style={styles.modeText}>
                  <Text
                    style={[
                      styles.modeLabel,
                      mode === 'quote' && styles.modeLabelActive,
                    ]}
                  >
                    Dang lai kem binh luan
                  </Text>
                  <Text style={styles.modeSubtitle}>
                    Them binh luan cua ban khi dang lai
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Quote Input (when in quote mode) */}
            {mode === 'quote' && (
              <View style={styles.quoteContainer}>
                <TextInput
                  style={styles.quoteInput}
                  placeholder="Viet binh luan cua ban..."
                  placeholderTextColor={colors.textMuted}
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
                <Text style={styles.previewLabel}>Bai viet goc</Text>
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
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <>
                    <Send size={18} color={colors.textPrimary} />
                    <Text style={styles.actionButtonText}>
                      {mode === 'instant' ? 'Dang lai ngay' : 'Dang voi binh luan'}
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

export default RepostSheet;
