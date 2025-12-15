/**
 * Gemral - Starred Messages Screen
 * View all starred/favorite messages across conversations
 *
 * Features:
 * - List all starred messages
 * - Group by conversation
 * - Tap to jump to message
 * - Unstar messages
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';

// Services
import messagingService from '../../services/messagingService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Custom Alert
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../utils/tokens';

export default function StarredMessagesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // State
  const [starredMessages, setStarredMessages] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch starred messages
  useEffect(() => {
    const fetchStarredMessages = async () => {
      try {
        const data = await messagingService.getStarredMessages();
        setStarredMessages(data);

        // Group by conversation
        const grouped = data.reduce((acc, message) => {
          const convId = message.conversation_id;
          const convName = message.conversations?.name ||
            message.conversations?.other_participant_name ||
            'Unknown Chat';

          if (!acc[convId]) {
            acc[convId] = {
              conversationId: convId,
              conversationName: convName,
              data: [],
            };
          }
          acc[convId].data.push(message);
          return acc;
        }, {});

        setSections(Object.values(grouped));
      } catch (error) {
        console.error('Error fetching starred messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStarredMessages();
  }, []);

  // Handle message press - navigate to message in chat
  const handleMessagePress = useCallback((message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Chat', {
      conversationId: message.conversation_id,
      highlightMessageId: message.id,
    });
  }, [navigation]);

  // Handle unstar
  const handleUnstar = useCallback((messageId) => {
    alert({
      type: 'warning',
      title: 'Remove from Starred',
      message: 'Remove this message from your starred messages?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await messagingService.unstarMessage(messageId);
              setStarredMessages(prev => prev.filter(m => m.id !== messageId));

              // Update sections
              setSections(prev => prev.map(section => ({
                ...section,
                data: section.data.filter(m => m.id !== messageId),
              })).filter(section => section.data.length > 0));
            } catch (error) {
              console.error('Error unstarring message:', error);
              alert({
                type: 'error',
                title: 'Error',
                message: 'Failed to unstar message',
              });
            }
          },
        },
      ],
    });
  }, [alert]);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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

  // Render section header
  const renderSectionHeader = ({ section }) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => navigation.navigate('Chat', { conversationId: section.conversationId })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[COLORS.purple, COLORS.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sectionAvatar}
      >
        <Text style={styles.sectionAvatarText}>
          {getInitials(section.conversationName)}
        </Text>
      </LinearGradient>
      <Text style={styles.sectionTitle}>{section.conversationName}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  // Render starred message item
  const renderStarredMessage = ({ item }) => {
    const sender = item.users;
    const isOwn = item.sender_id === user?.id;

    return (
      <TouchableOpacity
        style={styles.messageItem}
        onPress={() => handleMessagePress(item)}
        activeOpacity={0.7}
      >
        {/* Sender info */}
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>
            {isOwn ? 'You' : sender?.display_name || 'Unknown'}
          </Text>
          <View style={styles.headerRight}>
            <Ionicons name="star" size={14} color={COLORS.gold} />
            <Text style={styles.messageDate}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>

        {/* Message content */}
        <View style={styles.messageContent}>
          {item.attachment_url && (
            <View style={styles.mediaIndicator}>
              <Ionicons
                name={
                  item.message_type === 'image' ? 'image' :
                  item.message_type === 'video' ? 'videocam' :
                  item.message_type === 'voice' ? 'mic' : 'document'
                }
                size={14}
                color={COLORS.textMuted}
              />
            </View>
          )}
          {item.content && (
            <Text style={styles.messageText} numberOfLines={2}>
              {item.content}
            </Text>
          )}
        </View>

        {/* Unstar button */}
        <TouchableOpacity
          style={styles.unstarButton}
          onPress={() => handleUnstar(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="star-outline" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="star-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Starred Messages</Text>
      <Text style={styles.emptySubtitle}>
        Long press on a message and select "Star" to save important messages for quick access
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

        <Text style={styles.title}>Starred Messages</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Count Banner */}
      {starredMessages.length > 0 && (
        <View style={styles.countBanner}>
          <Ionicons name="star" size={16} color={COLORS.gold} />
          <Text style={styles.countText}>
            {starredMessages.length} starred message{starredMessages.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Starred Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : sections.length === 0 ? (
        renderEmptyState()
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderStarredMessage}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}

      {AlertComponent}
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
    paddingBottom: SPACING.huge,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    marginTop: SPACING.md,
  },
  sectionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  sectionAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Message Item
  messageItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  messageDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: SPACING.xl,
  },
  mediaIndicator: {
    marginRight: SPACING.xs,
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  unstarButton: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.md,
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
