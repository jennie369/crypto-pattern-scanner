/**
 * ForwardModal Component
 * Modal for forwarding messages to multiple conversations
 *
 * Features:
 * - Select up to 5 conversations
 * - Search conversations
 * - Recent conversations prioritized
 * - Message preview
 * - Batch send with progress
 */

import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// Services
import messagingService from '../../services/messagingService';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  GLASS,
} from '../../utils/tokens';

const MAX_SELECTIONS = 5;

/**
 * ForwardModal - Modal chuyển tiếp tin nhắn
 *
 * @param {boolean} visible - Modal visibility
 * @param {object} message - Message to forward
 * @param {function} onClose - Close handler
 * @param {function} onForward - Forward success handler
 */
const ForwardModal = memo(({
  visible,
  message,
  onClose,
  onForward,
}) => {
  const insets = useSafeAreaInsets();

  // State
  const [conversations, setConversations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [forwarding, setForwarding] = useState(false);
  const [forwardProgress, setForwardProgress] = useState({ current: 0, total: 0 });

  // Fetch conversations
  useEffect(() => {
    if (!visible) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await messagingService.getConversations();
        setConversations(data);
      } catch (error) {
        console.error('[ForwardModal] Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    setSelectedIds([]);
    setSearchQuery('');
  }, [visible]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      // Search by name
      if (conv.name?.toLowerCase().includes(query)) return true;
      // Search by participant name
      if (conv.other_participant?.display_name?.toLowerCase().includes(query)) return true;
      return false;
    });
  }, [conversations, searchQuery]);

  // Handle selection
  const handleToggleSelect = useCallback((conversationId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedIds(prev => {
      if (prev.includes(conversationId)) {
        return prev.filter(id => id !== conversationId);
      }
      if (prev.length >= MAX_SELECTIONS) {
        // Show alert or toast
        return prev;
      }
      return [...prev, conversationId];
    });
  }, []);

  // Handle forward
  const handleForward = useCallback(async () => {
    if (selectedIds.length === 0 || !message) return;

    setForwarding(true);
    setForwardProgress({ current: 0, total: selectedIds.length });

    try {
      // Forward to each conversation
      for (let i = 0; i < selectedIds.length; i++) {
        const conversationId = selectedIds[i];
        setForwardProgress({ current: i + 1, total: selectedIds.length });

        // Build forward message
        let content = message.content || '';
        let attachment = null;

        // Handle different message types
        if (message.attachment_url) {
          attachment = {
            url: message.attachment_url,
            type: message.attachment_type || message.message_type,
            name: message.attachment_name,
            size: message.attachment_size,
          };
        }

        // Add "Forwarded" indicator
        const forwardedContent = content ? `[Chuyển tiếp] ${content}` : '[Chuyển tiếp]';

        await messagingService.sendMessage(conversationId, forwardedContent, attachment);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onForward?.(selectedIds.length);
      onClose?.();
    } catch (error) {
      console.error('[ForwardModal] Forward error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setForwarding(false);
      setForwardProgress({ current: 0, total: 0 });
    }
  }, [selectedIds, message, onForward, onClose]);

  // Get display name
  const getDisplayName = (conversation) => {
    if (conversation.is_group) {
      return conversation.name || 'Nhóm chat';
    }
    return conversation.other_participant?.display_name || 'Người dùng';
  };

  // Get avatar
  const getAvatar = (conversation) => {
    if (conversation.is_group) {
      return conversation.group_avatar_url;
    }
    return conversation.other_participant?.avatar_url;
  };

  // Render conversation item
  const renderConversationItem = useCallback(({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    const displayName = getDisplayName(item);
    const avatarUrl = getAvatar(item);

    return (
      <TouchableOpacity
        style={[styles.conversationItem, isSelected && styles.conversationItemSelected]}
        onPress={() => handleToggleSelect(item.id)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons
                name={item.is_group ? 'people' : 'person'}
                size={20}
                color={COLORS.textMuted}
              />
            </View>
          )}
        </View>

        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName}
          </Text>
          {item.is_group && (
            <Text style={styles.memberCount}>
              {item.participant_ids?.length || 0} thành viên
            </Text>
          )}
        </View>

        {/* Selection checkbox */}
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={14} color={COLORS.bgDarkest} />
          )}
        </View>
      </TouchableOpacity>
    );
  }, [selectedIds, handleToggleSelect]);

  // Render message preview
  const renderMessagePreview = () => {
    if (!message) return null;

    let previewText = message.content || '';
    let icon = 'chatbubble-outline';

    switch (message.message_type) {
      case 'image':
        icon = 'image-outline';
        previewText = previewText || 'Hình ảnh';
        break;
      case 'video':
        icon = 'videocam-outline';
        previewText = previewText || 'Video';
        break;
      case 'audio':
        icon = 'mic-outline';
        previewText = previewText || 'Tin nhắn thoại';
        break;
      case 'file':
        icon = 'document-outline';
        previewText = message.attachment_name || 'Tệp tin';
        break;
      case 'sticker':
        icon = 'happy-outline';
        previewText = 'Sticker';
        break;
      case 'gif':
        icon = 'film-outline';
        previewText = 'GIF';
        break;
    }

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Chuyển tiếp tin nhắn:</Text>
        <View style={styles.previewContent}>
          <Ionicons name={icon} size={16} color={COLORS.cyan} />
          <Text style={styles.previewText} numberOfLines={2}>
            {previewText}
          </Text>
        </View>
      </View>
    );
  };

  // Render selected count
  const renderSelectedCount = () => {
    if (selectedIds.length === 0) return null;

    return (
      <View style={styles.selectedInfo}>
        <Text style={styles.selectedCount}>
          Đã chọn {selectedIds.length}/{MAX_SELECTIONS}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <BlurView intensity={80} style={styles.blurContainer}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={forwarding}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Chuyển tiếp</Text>

            <TouchableOpacity
              style={[
                styles.forwardButton,
                selectedIds.length === 0 && styles.forwardButtonDisabled,
              ]}
              onPress={handleForward}
              disabled={selectedIds.length === 0 || forwarding}
            >
              {forwarding ? (
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              ) : (
                <Text style={[
                  styles.forwardButtonText,
                  selectedIds.length === 0 && styles.forwardButtonTextDisabled,
                ]}>
                  Gửi
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Message preview */}
          {renderMessagePreview()}

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm cuộc trò chuyện..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={!forwarding}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Selected count */}
          {renderSelectedCount()}

          {/* Conversations list */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          ) : (
            <FlatList
              data={filteredConversations}
              renderItem={renderConversationItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
                  </Text>
                </View>
              }
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* Forward progress */}
          {forwarding && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(forwardProgress.current / forwardProgress.total) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Đang gửi {forwardProgress.current}/{forwardProgress.total}...
              </Text>
            </View>
          )}

          {/* Bottom safe area */}
          <View style={{ height: insets.bottom }} />
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
});

ForwardModal.displayName = 'ForwardModal';

export default ForwardModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  forwardButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.gold,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  forwardButtonDisabled: {
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
  },
  forwardButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  forwardButtonTextDisabled: {
    color: COLORS.textMuted,
  },

  // Message preview
  previewContainer: {
    padding: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  previewText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },

  // Selected info
  selectedInfo: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  selectedCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Conversation item
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  conversationItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  displayName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  memberCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },

  // Progress
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: 'rgba(5, 4, 11, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
