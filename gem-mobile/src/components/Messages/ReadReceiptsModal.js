/**
 * ReadReceiptsModal Component
 * Shows who has read a message in group chats
 *
 * Features:
 * - List of users who read the message
 * - Read timestamp for each user
 * - Avatar display
 * - Delivered vs Read status
 */

import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import { supabase } from '../../services/supabase';

// Utils
import { formatRelativeTime } from '../../utils/formatters';

// Context
import { useSettings } from '../../contexts/SettingsContext';

/**
 * ReadReceiptsModal - Modal hiển thị ai đã đọc tin nhắn
 *
 * @param {boolean} visible - Modal visibility
 * @param {object} message - Message object
 * @param {array} participants - Conversation participants
 * @param {string} currentUserId - Current user ID
 * @param {function} onClose - Close handler
 */
const ReadReceiptsModal = memo(({
  visible,
  message,
  participants = [],
  currentUserId,
  onClose,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const insets = useSafeAreaInsets();

  // State
  const [readReceipts, setReadReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========== STYLES ==========
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    blurContainer: {
      flex: 1,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(5, 4, 11, 0.95)'),
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Message preview
    previewContainer: {
      padding: SPACING.md,
      backgroundColor: 'rgba(106, 91, 255, 0.1)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    },
    previewText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    previewTime: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },

    // Stats
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    },
    statItem: {
      alignItems: 'center',
      paddingHorizontal: SPACING.xxl,
    },
    statValue: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginTop: SPACING.xs,
    },
    statLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },

    // List
    listContent: {
      paddingBottom: SPACING.xl,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      padding: SPACING.xxl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textMuted,
    },

    // User item
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: SPACING.md,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    avatarPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(106, 91, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusDot: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: colors.bgDarkest,
    },
    statusDotRead: {
      backgroundColor: colors.cyan,
    },
    statusDotDelivered: {
      backgroundColor: colors.textMuted,
    },
    userInfo: {
      flex: 1,
      marginRight: SPACING.sm,
    },
    userName: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    userStatus: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
    statusIconContainer: {
      width: 32,
      alignItems: 'center',
    },
    readBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(0, 240, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Fetch read receipts
  useEffect(() => {
    if (!visible || !message?.id) return;

    const fetchReceipts = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('message_read_receipts')
          .select('id, user_id, read_at')
          .eq('message_id', message.id)
          .order('read_at', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          setReadReceipts([]);
          return;
        }

        // Fetch profiles for all users
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url')
          .in('id', userIds);

        const profilesMap = {};
        profiles?.forEach(p => {
          p.display_name = p.full_name || p.display_name || p.username || 'User';
          profilesMap[p.id] = p;
        });

        // Attach profiles to receipts
        setReadReceipts(data.map(receipt => ({
          ...receipt,
          profiles: profilesMap[receipt.user_id] || null
        })));
      } catch (err) {
        console.error('[ReadReceiptsModal] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [visible, message?.id]);

  // Get participant status
  const getParticipantsWithStatus = useCallback(() => {
    if (!participants || participants.length === 0) return [];

    // Filter out sender
    const otherParticipants = participants.filter(p => {
      const userId = p.user_id || p.id;
      return userId !== message?.sender_id;
    });

    return otherParticipants.map(participant => {
      const userId = participant.user_id || participant.id;
      const receipt = readReceipts.find(r => r.user_id === userId);

      return {
        userId,
        displayName: participant.profiles?.display_name || participant.display_name || 'Người dùng',
        avatarUrl: participant.profiles?.avatar_url || participant.avatar_url,
        hasRead: !!receipt,
        readAt: receipt?.read_at,
      };
    });
  }, [participants, message?.sender_id, readReceipts]);

  // Render user item
  const renderUserItem = useCallback(({ item }) => {
    return (
      <View style={styles.userItem}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color={colors.textMuted} />
            </View>
          )}

          {/* Status indicator */}
          <View style={[
            styles.statusDot,
            item.hasRead ? styles.statusDotRead : styles.statusDotDelivered,
          ]} />
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={styles.userStatus}>
            {item.hasRead ? (
              <>
                <Ionicons name="checkmark-done" size={12} color={colors.cyan} />
                {' Đã xem • ' + formatRelativeTime(item.readAt)}
              </>
            ) : (
              <>
                <Ionicons name="checkmark" size={12} color={colors.textMuted} />
                {' Đã gửi'}
              </>
            )}
          </Text>
        </View>

        {/* Status icon */}
        <View style={styles.statusIconContainer}>
          {item.hasRead ? (
            <View style={styles.readBadge}>
              <Ionicons name="eye" size={14} color={colors.cyan} />
            </View>
          ) : (
            <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          )}
        </View>
      </View>
    );
  }, [styles, colors]);

  // Get stats
  const participantsWithStatus = getParticipantsWithStatus();
  const readCount = participantsWithStatus.filter(p => p.hasRead).length;
  const totalCount = participantsWithStatus.length;

  // Render header
  const renderHeader = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Ionicons name="checkmark-done" size={20} color={colors.cyan} />
        <Text style={styles.statValue}>{readCount}</Text>
        <Text style={styles.statLabel}>Đã xem</Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Ionicons name="checkmark" size={20} color={colors.textMuted} />
        <Text style={styles.statValue}>{totalCount - readCount}</Text>
        <Text style={styles.statLabel}>Chưa xem</Text>
      </View>
    </View>
  );

  // Render message preview
  const renderMessagePreview = () => {
    if (!message) return null;

    let previewText = message.content || '';
    if (message.message_type !== 'text') {
      const typeLabels = {
        image: 'Hình ảnh',
        video: 'Video',
        audio: 'Tin nhắn thoại',
        file: message.attachment_name || 'Tệp tin',
        sticker: 'Sticker',
        gif: 'GIF',
      };
      previewText = typeLabels[message.message_type] || previewText;
    }

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewText} numberOfLines={2}>
          {previewText}
        </Text>
        <Text style={styles.previewTime}>
          {formatRelativeTime(message.created_at)}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <BlurView intensity={80} style={styles.blurContainer}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
            <Text style={styles.headerTitle}>Trạng thái tin nhắn</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Message preview */}
          {renderMessagePreview()}

          {/* Stats */}
          {renderHeader()}

          {/* Users list */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.gold} />
            </View>
          ) : (
            <FlatList
              data={participantsWithStatus}
              renderItem={renderUserItem}
              keyExtractor={item => item.userId}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không có thông tin</Text>
                </View>
              }
            />
          )}

          {/* Bottom safe area */}
          <View style={{ height: insets.bottom }} />
        </BlurView>
      </View>
    </Modal>
  );
});

ReadReceiptsModal.displayName = 'ReadReceiptsModal';

export default ReadReceiptsModal;
