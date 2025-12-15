/**
 * Gemral - Ticket Detail Screen (Admin)
 *
 * Detailed view of a support ticket with messaging
 * Features: Message thread, status management, admin actions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  Send,
  User,
  Clock,
  CheckCircle,
  Circle,
  Loader,
  MoreVertical,
  UserPlus,
  AlertTriangle,
  Lock,
  X,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import supportTicketService, {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
} from '../../services/supportTicketService';
import { showAlert } from '../../components/CustomAlert';
import { useAuth } from '../../contexts/AuthContext';

const TicketDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ticketId } = route.params;
  const { user } = useAuth();

  const scrollRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const data = await supportTicketService.getTicketById(ticketId);
      if (data.error) {
        showAlert('Lỗi', data.error);
        return;
      }
      setTicket(data);

      // Mark messages as read
      await supportTicketService.markMessagesRead(ticketId);
    } catch (error) {
      console.error('[TicketDetail] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const result = await supportTicketService.sendMessage(
        ticketId,
        message.trim(),
        'admin',
        isInternal
      );

      if (result.success) {
        setMessage('');
        setIsInternal(false);
        loadTicket();

        // Scroll to bottom
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        showAlert('Lỗi', result.error);
      }
    } finally {
      setSending(false);
    }
  };

  const handleAssignToMe = async () => {
    const result = await supportTicketService.assignTicket(ticketId);
    if (result.success) {
      showAlert('Thành công', 'Ticket đã được gán cho bạn');
      loadTicket();
    } else {
      showAlert('Lỗi', result.error);
    }
    setShowActions(false);
  };

  const handleResolve = async () => {
    const result = await supportTicketService.resolveTicket(ticketId);
    if (result.success) {
      showAlert('Thành công', 'Ticket đã được giải quyết');
      loadTicket();
    } else {
      showAlert('Lỗi', result.error);
    }
    setShowActions(false);
  };

  const handleClose = async () => {
    const result = await supportTicketService.closeTicket(ticketId);
    if (result.success) {
      showAlert('Thành công', 'Ticket đã được đóng');
      loadTicket();
    } else {
      showAlert('Lỗi', result.error);
    }
    setShowActions(false);
  };

  const handleChangeStatus = async (status) => {
    const result = await supportTicketService.updateStatus(ticketId, status);
    if (result.success) {
      loadTicket();
    }
    setShowActions(false);
  };

  const handleChangePriority = async (priority) => {
    const result = await supportTicketService.updatePriority(ticketId, priority);
    if (result.success) {
      loadTicket();
    }
    setShowActions(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHeader = () => {
    const statusConfig = ticket ? supportTicketService.getStatusConfig(ticket.status) : null;

    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.ticketNumber}>{ticket?.ticket_number}</Text>
          {statusConfig && (
            <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => setShowActions(!showActions)} style={styles.moreButton}>
          <MoreVertical size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderActionsMenu = () => {
    if (!showActions) return null;

    return (
      <View style={styles.actionsMenu}>
        <TouchableOpacity style={styles.actionItem} onPress={handleAssignToMe}>
          <UserPlus size={18} color={COLORS.gold} />
          <Text style={styles.actionText}>Gán cho tôi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleResolve}>
          <CheckCircle size={18} color={COLORS.success} />
          <Text style={styles.actionText}>Đánh dấu giải quyết</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleClose}>
          <Lock size={18} color={COLORS.textMuted} />
          <Text style={styles.actionText}>Đóng ticket</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <Text style={styles.actionGroupLabel}>Đổi trạng thái:</Text>
        <View style={styles.statusOptions}>
          {TICKET_STATUSES.slice(0, 3).map((status) => (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.statusOption,
                ticket?.status === status.key && styles.statusOptionActive,
              ]}
              onPress={() => handleChangeStatus(status.key)}
            >
              <Circle size={8} color={status.color} fill={status.color} />
              <Text style={styles.statusOptionText}>{status.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.actionGroupLabel}>Đổi ưu tiên:</Text>
        <View style={styles.statusOptions}>
          {TICKET_PRIORITIES.map((priority) => (
            <TouchableOpacity
              key={priority.key}
              style={[
                styles.statusOption,
                ticket?.priority === priority.key && styles.statusOptionActive,
              ]}
              onPress={() => handleChangePriority(priority.key)}
            >
              <Circle size={8} color={priority.color} fill={priority.color} />
              <Text style={styles.statusOptionText}>{priority.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.closeActionsButton}
          onPress={() => setShowActions(false)}
        >
          <X size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTicketInfo = () => {
    if (!ticket) return null;

    const priorityConfig = supportTicketService.getPriorityConfig(ticket.priority);
    const categoryConfig = supportTicketService.getCategoryConfig(ticket.category);

    return (
      <View style={styles.ticketInfo}>
        <Text style={styles.ticketSubject}>{ticket.subject}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <User size={14} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              {ticket.user?.full_name || ticket.user?.email || 'Ẩn danh'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={14} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{formatDate(ticket.created_at)}</Text>
          </View>
        </View>

        <View style={styles.badgesRow}>
          <View style={[styles.infoBadge, { backgroundColor: `${categoryConfig.color}15` }]}>
            <Text style={[styles.badgeText, { color: categoryConfig.color }]}>
              {categoryConfig.label}
            </Text>
          </View>
          <View style={[styles.infoBadge, { backgroundColor: `${priorityConfig.color}15` }]}>
            <Text style={[styles.badgeText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>
          {ticket.assigned && (
            <View style={styles.assignedInfo}>
              <Image
                source={{
                  uri: ticket.assigned.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.assigned.full_name || 'A')}&background=random`,
                }}
                style={styles.assignedAvatar}
              />
              <Text style={styles.assignedName}>{ticket.assigned.full_name}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderMessages = () => {
    if (!ticket?.messages) return null;

    return (
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {ticket.messages.map((msg) => {
          const isAdmin = msg.sender_type === 'admin';
          const isSystem = msg.sender_type === 'system';

          if (isSystem) {
            return (
              <View key={msg.id} style={styles.systemMessage}>
                <Text style={styles.systemText}>{msg.message}</Text>
              </View>
            );
          }

          return (
            <View
              key={msg.id}
              style={[styles.messageItem, isAdmin && styles.messageItemAdmin]}
            >
              {!isAdmin && (
                <Image
                  source={{
                    uri: msg.sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.full_name || 'U')}&background=random`,
                  }}
                  style={styles.messageAvatar}
                />
              )}

              <View
                style={[
                  styles.messageBubble,
                  isAdmin && styles.messageBubbleAdmin,
                  msg.is_internal && styles.messageBubbleInternal,
                ]}
              >
                {msg.is_internal && (
                  <View style={styles.internalBadge}>
                    <Lock size={10} color={COLORS.warning} />
                    <Text style={styles.internalText}>Ghi chú nội bộ</Text>
                  </View>
                )}
                <Text style={styles.messageText}>{msg.message}</Text>
                <Text style={styles.messageTime}>{formatDate(msg.created_at)}</Text>
              </View>

              {isAdmin && (
                <Image
                  source={{
                    uri: msg.sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.full_name || 'A')}&background=random`,
                  }}
                  style={styles.messageAvatar}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderInputArea = () => {
    if (ticket?.status === 'closed') {
      return (
        <View style={styles.closedBanner}>
          <Lock size={16} color={COLORS.textMuted} />
          <Text style={styles.closedText}>Ticket đã đóng</Text>
        </View>
      );
    }

    return (
      <View style={styles.inputArea}>
        {/* Internal note toggle */}
        <TouchableOpacity
          style={[styles.internalToggle, isInternal && styles.internalToggleActive]}
          onPress={() => setIsInternal(!isInternal)}
        >
          <Lock size={16} color={isInternal ? COLORS.warning : COLORS.textMuted} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={isInternal ? 'Ghi chú nội bộ...' : 'Nhập tin nhắn...'}
            placeholderTextColor={COLORS.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={2000}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!message.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={COLORS.bgDark} />
          ) : (
            <Send size={20} color={COLORS.bgDark} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {renderHeader()}
        {renderActionsMenu()}
        {renderTicketInfo()}
        {renderMessages()}
        {renderInputArea()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 4,
  },
  ticketNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsMenu: {
    position: 'absolute',
    top: 60,
    right: SPACING.md,
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    zIndex: 100,
    minWidth: 200,
    ...GLASS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  actionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.sm,
  },
  actionGroupLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusOptionActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  statusOptionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  closeActionsButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  ticketInfo: {
    backgroundColor: COLORS.bgMid,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...GLASS,
  },
  ticketSubject: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  assignedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  assignedName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  messagesContainer: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  messagesContent: {
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  systemText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  messageItemAdmin: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    padding: SPACING.sm,
  },
  messageBubbleAdmin: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 4,
  },
  messageBubbleInternal: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderStyle: 'dashed',
  },
  internalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  internalText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  closedText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  internalToggle: {
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  internalToggleActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 120,
  },
  input: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default TicketDetailScreen;
