/**
 * Gemral - Share Sheet Component
 * Feature #9: Share to External Apps
 * Bottom sheet with share options using dark glass theme
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Share2,
  Copy,
  MessageCircle,
  Send,
  Link2,
  Facebook,
  Twitter,
  Instagram,
  MoreHorizontal,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import shareService from '../services/shareService';
import CustomAlert, { useCustomAlert } from './CustomAlert';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ShareSheet = ({
  visible,
  onClose,
  post,
  onRepost, // Callback to trigger repost flow
}) => {
  const [copied, setCopied] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const { alert, AlertComponent } = useCustomAlert();

  React.useEffect(() => {
    if (visible) {
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

  // Handle native share
  const handleNativeShare = useCallback(async () => {
    if (!post) return;
    const result = await shareService.sharePost(post);
    if (result.success) {
      onClose?.();
    }
  }, [post, onClose]);

  // Handle copy link
  const handleCopyLink = useCallback(async () => {
    if (!post) return;
    const success = await shareService.copyPostLink(post.id);
    if (success) {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose?.();
      }, 1500);
    }
  }, [post, onClose]);

  // Handle share to WhatsApp (with text + image)
  const handleWhatsApp = useCallback(async () => {
    if (!post) return;
    try {
      const result = await shareService.shareToWhatsApp(post);
      if (result.success) {
        onClose?.();
      } else if (result.error) {
        alert({
          type: 'warning',
          title: 'WhatsApp không khả dụng',
          message: result.error,
          buttons: [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Chia sẻ khác', onPress: handleNativeShare },
          ],
        });
      }
    } catch (error) {
      console.error('[ShareSheet] WhatsApp error:', error);
      handleNativeShare();
    }
  }, [post, onClose, handleNativeShare, alert]);

  // Handle share to Telegram (with text + image)
  const handleTelegram = useCallback(async () => {
    if (!post) return;
    try {
      const result = await shareService.shareToTelegram(post);
      if (result.success) {
        onClose?.();
      } else if (result.error) {
        alert({
          type: 'warning',
          title: 'Telegram không khả dụng',
          message: result.error,
          buttons: [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Chia sẻ khác', onPress: handleNativeShare },
          ],
        });
      }
    } catch (error) {
      console.error('[ShareSheet] Telegram error:', error);
      handleNativeShare();
    }
  }, [post, onClose, handleNativeShare, alert]);

  // Handle share to Messenger (with text + image)
  const handleMessenger = useCallback(async () => {
    if (!post) return;
    try {
      const result = await shareService.shareToMessenger(post);
      if (result.success) {
        onClose?.();
      } else if (result.error) {
        alert({
          type: 'warning',
          title: 'Messenger không khả dụng',
          message: result.error,
          buttons: [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Chia sẻ khác', onPress: handleNativeShare },
          ],
        });
      }
    } catch (error) {
      console.error('[ShareSheet] Messenger error:', error);
      handleNativeShare();
    }
  }, [post, onClose, handleNativeShare, alert]);

  // Handle repost
  const handleRepost = useCallback(() => {
    onClose?.();
    onRepost?.();
  }, [onClose, onRepost]);

  // Share options with icons
  const shareOptions = [
    {
      id: 'repost',
      icon: Share2,
      label: 'Đăng lại',
      subtitle: 'Chia sẻ lên bảng tin của bạn',
      onPress: handleRepost,
      color: COLORS.purple,
    },
    {
      id: 'copy',
      icon: copied ? CheckCircle : Copy,
      label: copied ? 'Đã sao chép!' : 'Sao chép liên kết',
      subtitle: 'Copy link vào clipboard',
      onPress: handleCopyLink,
      color: copied ? COLORS.success : COLORS.textSecondary,
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      subtitle: 'Gửi qua WhatsApp',
      onPress: handleWhatsApp,
      color: '#25D366',
    },
    {
      id: 'telegram',
      icon: Send,
      label: 'Telegram',
      subtitle: 'Gửi qua Telegram',
      onPress: handleTelegram,
      color: '#0088CC',
    },
    {
      id: 'messenger',
      icon: Facebook,
      label: 'Messenger',
      subtitle: 'Gửi qua Messenger',
      onPress: handleMessenger,
      color: '#0084FF',
    },
    {
      id: 'more',
      icon: MoreHorizontal,
      label: 'Khác...',
      subtitle: 'Xem thêm tùy chọn',
      onPress: handleNativeShare,
      color: COLORS.textSecondary,
    },
  ];

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
              <Text style={styles.title}>Chia sẻ</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Post Preview (optional) */}
            {post && (
              <View style={styles.postPreview}>
                <Text style={styles.previewText} numberOfLines={2}>
                  {post.content || 'Bài viết'}
                </Text>
                {post.author && (
                  <Text style={styles.previewAuthor}>
                    bởi {post.author.full_name}
                  </Text>
                )}
              </View>
            )}

            {/* Share Options */}
            <View style={styles.optionsContainer}>
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.optionItem}
                    onPress={option.onPress}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        { backgroundColor: `${option.color}20` },
                      ]}
                    >
                      <Icon size={22} color={option.color} />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Share Row */}
            <View style={styles.quickShareRow}>
              <Text style={styles.quickShareLabel}>Chia sẻ nhanh</Text>
              <View style={styles.quickShareIcons}>
                <TouchableOpacity
                  style={styles.quickShareIcon}
                  onPress={handleCopyLink}
                >
                  <Link2 size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickShareIcon}
                  onPress={handleWhatsApp}
                >
                  <MessageCircle size={20} color="#25D366" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickShareIcon}
                  onPress={handleTelegram}
                >
                  <Send size={20} color="#0088CC" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickShareIcon}
                  onPress={handleNativeShare}
                >
                  <MoreHorizontal size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Animated.View>
        {AlertComponent}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
    overflow: 'hidden',
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
  postPreview: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: 12,
  },
  previewText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  previewAuthor: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  optionsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  optionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  quickShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: SPACING.md,
  },
  quickShareLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  quickShareIcons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickShareIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShareSheet;
