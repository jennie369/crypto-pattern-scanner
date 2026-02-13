/**
 * Gemral - Forward Message Screen
 * Select conversations to forward a message to
 *
 * Features:
 * - Search conversations
 * - Multi-select conversations
 * - Message preview
 * - Forward to multiple recipients
 * - Glass-morphism UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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

export default function ForwardMessageScreen({ route, navigation }) {
  const { message } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [forwarding, setForwarding] = useState(false);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await messagingService.getConversations();
        // Filter out the current conversation
        const filtered = data.filter(c => c.id !== message?.conversation_id);
        setConversations(filtered);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [message?.conversation_id]);

  // Toggle selection
  const handleToggleSelect = useCallback((conversationId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIds(prev => {
      if (prev.includes(conversationId)) {
        return prev.filter(id => id !== conversationId);
      }
      return [...prev, conversationId];
    });
  }, []);

  // Forward message
  const handleForward = useCallback(async () => {
    if (selectedIds.length === 0 || forwarding) return;

    try {
      setForwarding(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Forward to all selected conversations
      await Promise.all(
        selectedIds.map(conversationId =>
          messagingService.forwardMessage(message.id, conversationId)
        )
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success and go back
      Alert.alert(
        'Message Forwarded',
        `Message sent to ${selectedIds.length} conversation${selectedIds.length > 1 ? 's' : ''}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error forwarding message:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to forward message');
    } finally {
      setForwarding(false);
    }
  }, [selectedIds, message?.id, navigation, forwarding]);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = conv.is_group
      ? conv.name
      : conv.other_participant?.display_name;
    return name?.toLowerCase().includes(query);
  });

  // Get display name
  const getDisplayName = (conv) => {
    if (conv.is_group) return conv.name || 'Group';
    return conv.other_participant?.display_name || 'Unknown';
  };

  // Get avatar
  const getAvatarUrl = (conv) => {
    if (conv.is_group) return null;
    return conv.other_participant?.avatar_url;
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

  // Render conversation item
  const renderConversationItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    const displayName = getDisplayName(item);
    const avatarUrl = getAvatarUrl(item);

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
            <LinearGradient
              colors={item.is_group ? [COLORS.purple, COLORS.cyan] : GRADIENTS.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              {item.is_group ? (
                <Ionicons name="people" size={18} color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
              )}
            </LinearGradient>
          )}
        </View>

        {/* Info */}
        <View style={styles.conversationInfo}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {displayName}
          </Text>
          {item.is_group && (
            <Text style={styles.participantCount}>
              {item.conversation_participants?.length || 0} members
            </Text>
          )}
        </View>

        {/* Selection indicator */}
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color={COLORS.textPrimary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render message preview
  const renderMessagePreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.previewLabel}>Forwarding message:</Text>
      <View style={styles.previewContent}>
        {message?.attachment_url && (
          <View style={styles.previewMedia}>
            {message.message_type === 'image' ? (
              <Image
                source={{ uri: message.attachment_url }}
                style={styles.previewImage}
              />
            ) : (
              <Ionicons
                name={message.message_type === 'video' ? 'videocam' : 'document'}
                size={24}
                color={COLORS.gold}
              />
            )}
          </View>
        )}
        {message?.content && (
          <Text style={styles.previewText} numberOfLines={2}>
            {message.content}
          </Text>
        )}
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
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Forward To</Text>

        <TouchableOpacity
          style={[styles.forwardButton, selectedIds.length === 0 && styles.forwardButtonDisabled]}
          onPress={handleForward}
          disabled={selectedIds.length === 0 || forwarding}
        >
          {forwarding ? (
            <ActivityIndicator size="small" color={COLORS.textPrimary} />
          ) : (
            <Text style={[
              styles.forwardText,
              selectedIds.length === 0 && styles.forwardTextDisabled
            ]}>
              Send{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Message Preview */}
      {renderMessagePreview()}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <BlurView intensity={20} style={styles.searchBlur}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </BlurView>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No conversations found</Text>
            </View>
          }
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
  },
  closeButton: {
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
  forwardButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  forwardButtonDisabled: {
    opacity: 0.5,
  },
  forwardText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  forwardTextDisabled: {
    color: COLORS.textMuted,
  },

  // Message Preview
  previewContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purple,
  },
  previewMedia: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: 40,
    height: 40,
  },
  previewText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Search
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  // List
  listContent: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.huge,
  },

  // Conversation Item
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  conversationItemSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  participantCount: {
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
    borderColor: COLORS.purple,
    backgroundColor: COLORS.purple,
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
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
});
