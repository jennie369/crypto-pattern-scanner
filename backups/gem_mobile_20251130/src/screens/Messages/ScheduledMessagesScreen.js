/**
 * Gemral - Scheduled Messages Screen
 * View and manage scheduled messages for a conversation
 *
 * Features:
 * - List all scheduled messages
 * - Edit scheduled message content/time
 * - Cancel scheduled messages
 * - Send now option
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
} from '../../utils/tokens';

export default function ScheduledMessagesScreen({ route, navigation }) {
  const { conversationId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch scheduled messages
  useEffect(() => {
    const fetchScheduledMessages = async () => {
      try {
        const data = await messagingService.getScheduledMessages(conversationId);
        setScheduledMessages(data);
      } catch (error) {
        console.error('Error fetching scheduled messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledMessages();
  }, [conversationId]);

  // Format scheduled time
  const formatScheduledTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 0) {
      return 'Sending soon...';
    } else if (diffMins < 60) {
      return `In ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get full date/time
  const getFullDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle send now
  const handleSendNow = useCallback(async (message) => {
    Alert.alert(
      'Send Now',
      'Send this message immediately?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await messagingService.sendScheduledNow(message.id);
              setScheduledMessages(prev => prev.filter(m => m.id !== message.id));
            } catch (error) {
              console.error('Error sending message:', error);
              Alert.alert('Error', 'Failed to send message');
            }
          },
        },
      ]
    );
  }, []);

  // Handle cancel
  const handleCancel = useCallback((message) => {
    Alert.alert(
      'Cancel Scheduled Message',
      'Are you sure you want to cancel this scheduled message?',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Message',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await messagingService.cancelScheduledMessage(message.id);
              setScheduledMessages(prev => prev.filter(m => m.id !== message.id));
            } catch (error) {
              console.error('Error cancelling message:', error);
              Alert.alert('Error', 'Failed to cancel message');
            }
          },
        },
      ]
    );
  }, []);

  // Handle edit
  const handleEdit = useCallback((message) => {
    // Could navigate to edit screen or show edit sheet
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Edit', 'Edit functionality coming soon');
  }, []);

  // Render scheduled message item
  const renderScheduledMessage = ({ item }) => {
    return (
      <View style={styles.messageItem}>
        {/* Time Badge */}
        <View style={styles.timeBadge}>
          <Ionicons name="time" size={16} color={COLORS.cyan} />
          <Text style={styles.timeText}>
            {formatScheduledTime(item.scheduled_for)}
          </Text>
        </View>

        {/* Message Content */}
        <View style={styles.messageContent}>
          {/* Media preview */}
          {item.attachment_url && (
            <View style={styles.mediaIndicator}>
              <Ionicons
                name={
                  item.message_type === 'image' ? 'image' :
                  item.message_type === 'video' ? 'videocam' :
                  item.message_type === 'voice' ? 'mic' : 'document'
                }
                size={16}
                color={COLORS.textMuted}
              />
              <Text style={styles.mediaText}>
                {item.message_type === 'image' ? 'Photo' :
                 item.message_type === 'video' ? 'Video' :
                 item.message_type === 'voice' ? 'Voice message' : 'File'}
              </Text>
            </View>
          )}

          {/* Text content */}
          {item.content && (
            <Text style={styles.contentText} numberOfLines={3}>
              {item.content}
            </Text>
          )}

          {/* Full scheduled time */}
          <Text style={styles.fullTime}>
            Scheduled for {getFullDateTime(item.scheduled_for)}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSendNow(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={18} color={COLORS.cyan} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCancel(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="calendar-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Scheduled Messages</Text>
      <Text style={styles.emptySubtitle}>
        When you schedule a message to be sent later, it will appear here
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

        <Text style={styles.title}>Scheduled Messages</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Count Banner */}
      {scheduledMessages.length > 0 && (
        <View style={styles.countBanner}>
          <Ionicons name="calendar" size={16} color={COLORS.cyan} />
          <Text style={styles.countText}>
            {scheduledMessages.length} scheduled message{scheduledMessages.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Scheduled Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.cyan} />
        </View>
      ) : (
        <FlatList
          data={scheduledMessages}
          renderItem={renderScheduledMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            scheduledMessages.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Info Banner */}
      <View style={[styles.infoBanner, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Ionicons name="information-circle" size={18} color={COLORS.textMuted} />
        <Text style={styles.infoText}>
          Scheduled messages will be sent automatically at the scheduled time
        </Text>
      </View>
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
    backgroundColor: 'rgba(0, 221, 235, 0.1)',
    gap: SPACING.xs,
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.cyan,
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
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 221, 235, 0.2)',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },
  messageContent: {
    marginBottom: SPACING.md,
  },
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  mediaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  contentText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  fullTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});
