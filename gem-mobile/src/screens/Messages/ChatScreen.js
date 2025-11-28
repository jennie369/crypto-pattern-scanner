/**
 * Gemral - Chat Screen
 * TikTok-style individual chat with real-time messaging
 *
 * Features:
 * - Real-time message sync with web app
 * - Typing indicators (2000ms timeout - matches web)
 * - Double-tap to react with heart
 * - Swipe to reply/forward
 * - Media attachments
 * - Voice messages
 * - Glass-morphism UI
 *
 * CRITICAL: Channel names and patterns MUST match web for sync:
 * - Message channel: `messages:${conversationId}`
 * - Presence channel: `presence:${conversationId}`
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import messagingService from '../../services/messagingService';
import presenceService from '../../services/presenceService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Components
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import MessageActionSheet from './components/MessageActionSheet';
import PinnedMessagesBar from './components/PinnedMessagesBar';
import EditMessageSheet from './components/EditMessageSheet';
import ScheduleMessageSheet from './components/ScheduleMessageSheet';
import TranslateMessageSheet from './components/TranslateMessageSheet';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  ANIMATION,
} from '../../utils/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Typing timeout - MUST match web (2000ms)
const TYPING_TIMEOUT = 2000;

export default function ChatScreen({ route, navigation }) {
  const { conversationId, conversation: initialConversation } = route.params;
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  // State
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [currentPinIndex, setCurrentPinIndex] = useState(0);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [starredMessageIds, setStarredMessageIds] = useState([]);
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);
  const [showTranslateSheet, setShowTranslateSheet] = useState(false);
  const [translatingMessage, setTranslatingMessage] = useState(null);
  const [pendingScheduleMessage, setPendingScheduleMessage] = useState(null);

  // Refs
  const flatListRef = useRef(null);
  const messageSubscription = useRef(null);
  const typingSubscription = useRef(null);
  const typingTimeoutRef = useRef(null);
  const nextCursor = useRef(null);

  // Get other participant info
  const otherParticipant = useMemo(() => {
    if (conversation?.is_group) return null;
    return conversation?.other_participant ||
      conversation?.conversation_participants?.find(p => p.user_id !== user?.id)?.users;
  }, [conversation, user?.id]);

  const displayName = conversation?.is_group
    ? conversation.name
    : otherParticipant?.display_name || 'Chat';

  const isOnline = presenceService.isOnline(otherParticipant?.online_status);

  // =====================================================
  // FETCH MESSAGES
  // =====================================================

  const fetchMessages = useCallback(async (cursor = null) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      }

      const result = await messagingService.getMessages(conversationId, cursor, 50);

      if (cursor) {
        // Prepend older messages
        setMessages(prev => [...result.messages, ...prev]);
      } else {
        setMessages(result.messages);
      }

      setHasMore(result.hasMore);
      nextCursor.current = result.nextCursor;

      // Mark as read
      await messagingService.markAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [conversationId]);

  // Fetch pinned messages
  const fetchPinnedMessages = useCallback(async () => {
    try {
      const pinned = await messagingService.getPinnedMessages(conversationId);
      setPinnedMessages(pinned);
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
    }
  }, [conversationId]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (!hasMore || loadingMore || !nextCursor.current) return;
    fetchMessages(nextCursor.current);
  }, [hasMore, loadingMore, fetchMessages]);

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  useEffect(() => {
    // Fetch initial messages
    fetchMessages();

    // Fetch pinned messages
    fetchPinnedMessages();

    // Subscribe to new messages
    // CRITICAL: Channel name `messages:${conversationId}` matches web
    messageSubscription.current = messagingService.subscribeToMessages(
      conversationId,
      (newMessage, eventType) => {
        if (eventType === 'update') {
          // Handle message updates (reactions, soft deletes)
          setMessages(prev => prev.map(msg =>
            msg.id === newMessage.id ? { ...msg, ...newMessage } : msg
          ));
        } else {
          // New message - deduplicate by ID
          setMessages(prev => {
            const exists = prev.some(m => m.id === newMessage.id);
            if (exists) return prev;

            // Also check for temp messages
            const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'));
            return [...withoutTemp, newMessage];
          });

          // Mark as read
          messagingService.markAsRead(conversationId);

          // Scroll to bottom for new messages
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    );

    // Subscribe to typing indicators
    // CRITICAL: Channel name `presence:${conversationId}` matches web
    if (user?.id) {
      const typingSub = messagingService.subscribeToTyping(
        conversationId,
        user.id,
        (typing) => {
          setTypingUsers(typing);
        }
      );
      typingSubscription.current = typingSub;
    }

    return () => {
      // Cleanup subscriptions
      if (messageSubscription.current) {
        messagingService.unsubscribe(messageSubscription.current);
      }
      if (typingSubscription.current?.channel) {
        messagingService.unsubscribe(typingSubscription.current.channel);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, user?.id, fetchMessages, fetchPinnedMessages]);

  // =====================================================
  // TYPING INDICATOR
  // =====================================================

  const handleTyping = useCallback(() => {
    if (!typingSubscription.current?.broadcastTyping) return;

    // Broadcast typing status
    typingSubscription.current.broadcastTyping(true, profile?.display_name || 'User');

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    // CRITICAL: Timeout MUST be 2000ms to match web
    typingTimeoutRef.current = setTimeout(() => {
      typingSubscription.current?.broadcastTyping(false);
    }, TYPING_TIMEOUT);
  }, [profile?.display_name]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = useCallback(async (content, attachment = null) => {
    if ((!content.trim() && !attachment) || sending) return;

    try {
      setSending(true);

      // Stop typing indicator
      if (typingSubscription.current?.broadcastTyping) {
        typingSubscription.current.broadcastTyping(false);
      }

      // Create optimistic message (same pattern as web: `temp-${Date.now()}`)
      const tempMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user?.id,
        content: content.trim(),
        message_type: attachment ? 'image' : 'text',
        attachment_url: attachment?.url,
        attachment_name: attachment?.name,
        attachment_type: attachment?.type,
        created_at: new Date().toISOString(),
        users: {
          id: user?.id,
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
        },
        message_reactions: [],
        _isOptimistic: true,
      };

      // Add optimistic message
      setMessages(prev => [...prev, tempMessage]);

      // Clear reply
      setReplyTo(null);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);

      // Send to server
      const result = await messagingService.sendMessage(
        conversationId,
        content.trim(),
        attachment
      );

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? { ...result, users: tempMessage.users } : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed optimistic message
      setMessages(prev => prev.filter(msg => !msg._isOptimistic));
    } finally {
      setSending(false);
    }
  }, [conversationId, user?.id, profile, sending]);

  // =====================================================
  // MESSAGE ACTIONS
  // =====================================================

  const handleReaction = useCallback(async (messageId, emoji = '❤️') => {
    try {
      const added = await messagingService.toggleReaction(messageId, emoji);

      // Optimistically update UI
      setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId) return msg;

        const reactions = msg.message_reactions || [];
        if (added) {
          return {
            ...msg,
            message_reactions: [...reactions, {
              id: `temp-${Date.now()}`,
              emoji,
              user_id: user?.id,
            }],
          };
        } else {
          return {
            ...msg,
            message_reactions: reactions.filter(r =>
              !(r.emoji === emoji && r.user_id === user?.id)
            ),
          };
        }
      }));
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  }, [user?.id]);

  const handleReply = useCallback((message) => {
    setReplyTo(message);
  }, []);

  const handleDelete = useCallback(async (messageId) => {
    try {
      await messagingService.deleteMessage(messageId);

      // Optimistically remove from UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, []);

  const handleLongPress = useCallback((message) => {
    setSelectedMessage(message);
    setShowActionSheet(true);
  }, []);

  const handleCloseActionSheet = useCallback(() => {
    setShowActionSheet(false);
    setSelectedMessage(null);
  }, []);

  const handleSearch = useCallback(() => {
    navigation.navigate('MessageSearch', {
      conversationId,
      conversationName: displayName,
    });
  }, [navigation, conversationId, displayName]);

  const handleForward = useCallback((message) => {
    navigation.navigate('ForwardMessage', { message });
  }, [navigation]);

  const handlePin = useCallback(async (message) => {
    try {
      const isPinned = pinnedMessages.some(p => p.id === message.id);
      if (isPinned) {
        await messagingService.unpinMessage(message.id);
        setPinnedMessages(prev => prev.filter(p => p.id !== message.id));
      } else {
        await messagingService.pinMessage(message.id);
        setPinnedMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Error pinning/unpinning message:', error);
    }
  }, [pinnedMessages]);

  const handleUnpinFromBar = useCallback(async (messageId) => {
    try {
      await messagingService.unpinMessage(messageId);
      setPinnedMessages(prev => prev.filter(p => p.id !== messageId));
      setCurrentPinIndex(0);
    } catch (error) {
      console.error('Error unpinning message:', error);
    }
  }, []);

  const handlePinnedPress = useCallback((message) => {
    // Find the message in the list and scroll to it
    const index = messages.findIndex(m => m.id === message.id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [messages]);

  const handleViewAllPinned = useCallback(() => {
    navigation.navigate('PinnedMessages', { conversationId });
  }, [navigation, conversationId]);

  const handleEdit = useCallback((message) => {
    setEditingMessage(message);
    setShowEditSheet(true);
  }, []);

  const handleSaveEdit = useCallback(async (messageId, newContent) => {
    try {
      await messagingService.editMessage(messageId, newContent);

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, content: newContent, edited_at: new Date().toISOString() }
          : msg
      ));
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }, []);

  const handleCloseEditSheet = useCallback(() => {
    setShowEditSheet(false);
    setEditingMessage(null);
  }, []);

  // Star/Unstar message
  const handleStar = useCallback(async (message) => {
    try {
      const isStarred = starredMessageIds.includes(message.id);
      if (isStarred) {
        await messagingService.unstarMessage(message.id);
        setStarredMessageIds(prev => prev.filter(id => id !== message.id));
      } else {
        await messagingService.starMessage(message.id);
        setStarredMessageIds(prev => [...prev, message.id]);
      }
    } catch (error) {
      console.error('Error starring/unstarring message:', error);
    }
  }, [starredMessageIds]);

  // Translate message
  const handleTranslate = useCallback((message) => {
    setTranslatingMessage(message);
    setShowTranslateSheet(true);
  }, []);

  const handleCloseTranslateSheet = useCallback(() => {
    setShowTranslateSheet(false);
    setTranslatingMessage(null);
  }, []);

  // Schedule message
  const handleOpenSchedule = useCallback((content, attachment) => {
    setPendingScheduleMessage({ content, attachment });
    setShowScheduleSheet(true);
  }, []);

  const handleScheduleMessage = useCallback(async (scheduledDate) => {
    if (!pendingScheduleMessage) return;

    try {
      await messagingService.scheduleMessage(
        conversationId,
        pendingScheduleMessage.content,
        scheduledDate,
        pendingScheduleMessage.attachment
      );
      setPendingScheduleMessage(null);
    } catch (error) {
      console.error('Error scheduling message:', error);
      throw error;
    }
  }, [conversationId, pendingScheduleMessage]);

  const handleCloseScheduleSheet = useCallback(() => {
    setShowScheduleSheet(false);
    setPendingScheduleMessage(null);
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  // Group chat info
  const isGroupChat = conversation?.is_group || false;
  const totalParticipants = conversation?.conversation_participants?.length || 2;

  const renderMessage = ({ item, index }) => {
    const isOwn = item.sender_id === user?.id;
    const showAvatar = !isOwn && (
      index === messages.length - 1 ||
      messages[index + 1]?.sender_id !== item.sender_id
    );

    return (
      <MessageBubble
        message={item}
        isOwn={isOwn}
        showAvatar={showAvatar}
        onDoubleTap={() => handleReaction(item.id)}
        onLongPress={() => handleLongPress(item)}
        onReply={() => handleReply(item)}
        onDelete={isOwn ? () => handleDelete(item.id) : null}
        onReaction={(emoji) => handleReaction(item.id, emoji)}
        currentUserId={user?.id}
        isGroupChat={isGroupChat}
        totalParticipants={totalParticipants}
      />
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      {/* User Info */}
      <TouchableOpacity
        style={styles.headerInfo}
        onPress={() => navigation.navigate('ConversationInfo', { conversationId, conversation })}
      >
        <Text style={styles.headerName} numberOfLines={1}>
          {displayName}
        </Text>
        {!conversation?.is_group && (
          <View style={styles.headerStatus}>
            {isOnline && <View style={styles.onlineDot} />}
            <Text style={styles.headerStatusText}>
              {isOnline ? 'Online' : presenceService.formatLastSeen(otherParticipant?.last_seen)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Header Actions */}
      <View style={styles.headerActions}>
        {/* Search */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* More Options */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('ConversationInfo', { conversationId, conversation })}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      {renderHeader()}

      {/* Pinned Messages Bar */}
      {pinnedMessages.length > 0 && (
        <PinnedMessagesBar
          pinnedMessages={pinnedMessages}
          currentIndex={currentPinIndex}
          onPress={handlePinnedPress}
          onViewAll={handleViewAllPinned}
          onUnpin={handleUnpinFromBar}
        />
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.3}
          // Performance
          windowSize={10}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={20}
          ListFooterComponent={
            typingUsers.length > 0 ? (
              <TypingIndicator users={typingUsers} />
            ) : null
          }
        />

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          replyTo={replyTo}
          onClearReply={() => setReplyTo(null)}
          disabled={sending}
          conversationId={conversationId}
          onOpenSchedule={() => setShowScheduleSheet(true)}
          currentUserId={user?.id}
        />

        {/* Safe area bottom */}
        <View style={{ height: insets.bottom }} />
      </KeyboardAvoidingView>

      {/* Message Action Sheet */}
      <MessageActionSheet
        visible={showActionSheet}
        message={selectedMessage}
        isOwn={selectedMessage?.sender_id === user?.id}
        isPinned={pinnedMessages.some(p => p.id === selectedMessage?.id)}
        isStarred={starredMessageIds.includes(selectedMessage?.id)}
        onClose={handleCloseActionSheet}
        onReply={() => handleReply(selectedMessage)}
        onCopy={() => {}}
        onForward={() => selectedMessage && handleForward(selectedMessage)}
        onDelete={() => selectedMessage && handleDelete(selectedMessage.id)}
        onReact={() => selectedMessage && handleReaction(selectedMessage.id)}
        onReport={() => {}}
        onPin={() => selectedMessage && handlePin(selectedMessage)}
        onEdit={() => selectedMessage && handleEdit(selectedMessage)}
        onStar={() => selectedMessage && handleStar(selectedMessage)}
        onTranslate={() => selectedMessage && handleTranslate(selectedMessage)}
      />

      {/* Edit Message Sheet */}
      <EditMessageSheet
        visible={showEditSheet}
        message={editingMessage}
        onClose={handleCloseEditSheet}
        onSave={handleSaveEdit}
      />

      {/* Schedule Message Sheet */}
      <ScheduleMessageSheet
        visible={showScheduleSheet}
        onClose={handleCloseScheduleSheet}
        onSchedule={handleScheduleMessage}
      />

      {/* Translate Message Sheet */}
      <TranslateMessageSheet
        visible={showTranslateSheet}
        message={translatingMessage}
        onClose={handleCloseTranslateSheet}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxs,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.xs,
  },
  headerStatusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
});
