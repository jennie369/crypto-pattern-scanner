/**
 * Gemral - Pinned Messages Screen
 * View all pinned messages in a conversation
 *
 * Features:
 * - List all pinned messages
 * - Tap to jump to message in chat
 * - Unpin messages
 * - Pin date/time display
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';

// Services
import messagingService from '../../services/messagingService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../utils/tokens';

export default function PinnedMessagesScreen({ route, navigation }) {
  const { conversationId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pinned messages
  useEffect(() => {
    const fetchPinnedMessages = async () => {
      try {
        const data = await messagingService.getPinnedMessages(conversationId);
        setPinnedMessages(data);
      } catch (error) {
        console.error('Error fetching pinned messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPinnedMessages();
  }, [conversationId]);

  // Handle message press - navigate to message in chat
  const handleMessagePress = useCallback((message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Chat', {
      conversationId,
      highlightMessageId: message.id,
    });
  }, [navigation, conversationId]);

  // Handle unpin
  const handleUnpin = useCallback((messageId) => {
    Alert.alert(
      'Unpin Message',
      'Are you sure you want to unpin this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpin',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await messagingService.unpinMessage(messageId);
              setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
            } catch (error) {
              console.error('Error unpinning message:', error);
              Alert.alert('Error', 'Failed to unpin message');
            }
          },
        },
      ]
    );
  }, []);

  // Format date
  const formatPinDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Render pinned message item
  const renderPinnedMessage = ({ item }) => {
    const sender = item.users;
    const isOwn = item.sender_id === user?.id;

    return (
      <TouchableOpacity
        style={styles.messageItem}
        onPress={() => handleMessagePress(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {sender?.avatar_url ? (
            <Image source={{ uri: sender.avatar_url }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={GRADIENTS.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>
                {getInitials(sender?.display_name)}
              </Text>
            </LinearGradient>
          )}
        </View>

        {/* Content */}
        <View style={styles.messageContent}>
          {/* Header */}
          <View style={styles.messageHeader}>
            <Text style={styles.senderName}>
              {isOwn ? 'You' : sender?.display_name || 'Unknown'}
            </Text>
            <View style={styles.pinBadge}>
              <Ionicons name="pin" size={12} color={COLORS.gold} />
            </View>
          </View>

          {/* Message preview */}
          {item.attachment_url && (
            <View style={styles.mediaPreview}>
              {item.message_type === 'image' ? (
                <Image
                  source={{ uri: item.attachment_url }}
                  style={styles.mediaImage}
                />
              ) : (
                <View style={styles.mediaIcon}>
                  <Ionicons
                    name={item.message_type === 'video' ? 'videocam' : 'document'}
                    size={20}
                    color={COLORS.gold}
                  />
                </View>
              )}
            </View>
          )}

          {item.content && (
            <Text style={styles.messageText} numberOfLines={3}>
              {item.content}
            </Text>
          )}

          {/* Pin date */}
          <Text style={styles.pinDate}>
            Pinned {formatPinDate(item.pinned_at)}
          </Text>
        </View>

        {/* Unpin button */}
        <TouchableOpacity
          style={styles.unpinButton}
          onPress={() => handleUnpin(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="pin-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Pinned Messages</Text>
      <Text style={styles.emptySubtitle}>
        Long press on a message and select "Pin" to keep important messages easily accessible
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Pinned Messages</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Pinned count */}
      {pinnedMessages.length > 0 && (
        <View style={styles.countBanner}>
          <Ionicons name="pin" size={16} color={COLORS.gold} />
          <Text style={styles.countText}>
            {pinnedMessages.length} pinned message{pinnedMessages.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Pinned Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : (
        <FlatList
          data={pinnedMessages}
          renderItem={renderPinnedMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            pinnedMessages.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },

  // Count Banner
  countBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    gap: SPACING.xs,
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // List
  listContent: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Message Item
  messageItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: TOUCH.avatarSm,
    height: TOUCH.avatarSm,
    borderRadius: TOUCH.avatarSm / 2,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: TOUCH.avatarSm,
    height: TOUCH.avatarSm,
    borderRadius: TOUCH.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  pinBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediaPreview: {
    marginBottom: SPACING.xs,
  },
  mediaImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.glassBg,
  },
  mediaIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  pinDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  unpinButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
