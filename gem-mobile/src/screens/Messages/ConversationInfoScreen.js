/**
 * Gemral - Conversation Info Screen
 * View conversation details, participants, and settings
 *
 * Features:
 * - Profile/group info display
 * - Media gallery access
 * - Pinned/starred messages
 * - Notification settings
 * - Disappearing messages
 * - Chat themes
 * - Group settings (for groups)
 * - Block/report options
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';

// Services
import messagingService from '../../services/messagingService';
import presenceService from '../../services/presenceService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Custom Alert
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

// Components
import DisappearingMessagesSheet from './components/DisappearingMessagesSheet';
import ChatThemesSheet from './components/ChatThemesSheet';
import MuteConversationSheet from './components/MuteConversationSheet';
import GroupSettingsSheet from './components/GroupSettingsSheet';
import AddParticipantsSheet from './components/AddParticipantsSheet';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../utils/tokens';

export default function ConversationInfoScreen({ route, navigation }) {
  const { conversationId, conversation } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // Sheet states
  const [showDisappearing, setShowDisappearing] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showMute, setShowMute] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showAddParticipants, setShowAddParticipants] = useState(false);

  // Conversation state
  const [disappearingDuration, setDisappearingDuration] = useState(conversation?.disappearing_messages || 0);
  const [chatTheme, setChatTheme] = useState(conversation?.theme || 'default');
  const [muteUntil, setMuteUntil] = useState(conversation?.muted_until || null);

  // Get other participant info
  const otherParticipant = conversation?.other_participant ||
    conversation?.conversation_participants?.find(p => p.user_id !== user?.id)?.users;

  const isGroup = conversation?.is_group;
  const displayName = isGroup
    ? conversation.name
    : otherParticipant?.display_name || 'Unknown User';
  const isOnline = presenceService.isOnline(otherParticipant?.online_status);

  // Group participants
  const participants = conversation?.conversation_participants || [];
  const participantIds = participants.map(p => p.user_id);
  const isAdmin = conversation?.admin_ids?.includes(user?.id) || conversation?.created_by === user?.id;

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleBlock = () => {
    alert({
      type: 'warning',
      title: 'Block User',
      message: `Are you sure you want to block ${displayName}?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await messagingService.blockUser(otherParticipant?.id);
              alert({
                type: 'success',
                title: 'Blocked',
                message: `${displayName} has been blocked`,
              });
              // Safely navigate back - use goBack if popToTop fails
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error blocking user:', error);
              alert({
                type: 'error',
                title: 'Error',
                message: 'Failed to block user',
              });
            }
          },
        },
      ],
    });
  };

  const handleReport = () => {
    alert({
      type: 'warning',
      title: 'Report User',
      message: 'What would you like to report?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Spam',
          onPress: () => submitReport('spam'),
        },
        {
          text: 'Harassment',
          onPress: () => submitReport('harassment'),
        },
        {
          text: 'Inappropriate Content',
          onPress: () => submitReport('inappropriate_content'),
        },
      ],
    });
  };

  const submitReport = async (reportType) => {
    try {
      await messagingService.reportUser({
        reportedUserId: otherParticipant?.id,
        reportType,
        description: `Reported from conversation ${conversationId}`,
      });
      alert({
        type: 'success',
        title: 'Reported',
        message: 'Your report has been submitted',
      });
    } catch (error) {
      console.error('Error reporting user:', error);
      alert({
        type: 'error',
        title: 'Error',
        message: 'Failed to submit report',
      });
    }
  };

  const handleViewMedia = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('MediaGallery', { conversationId });
  };

  const handleViewPinned = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PinnedMessages', { conversationId });
  };

  const handleViewStarred = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('StarredMessages');
  };

  const handleSearchConversation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('MessageSearch', { conversationId, conversationName: displayName });
  };

  const handleScheduledMessages = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ScheduledMessages', { conversationId });
  };

  // Disappearing messages handlers
  const handleSaveDisappearing = useCallback(async (duration) => {
    try {
      await messagingService.updateConversationSettings(conversationId, {
        disappearing_messages: duration,
      });
      setDisappearingDuration(duration);
    } catch (error) {
      console.error('Error saving disappearing messages:', error);
      alert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update settings',
      });
    }
  }, [conversationId, alert]);

  // Theme handlers
  const handleSaveTheme = useCallback(async (theme) => {
    try {
      await messagingService.updateConversationSettings(conversationId, {
        theme,
      });
      setChatTheme(theme);
    } catch (error) {
      console.error('Error saving theme:', error);
      alert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update theme',
      });
    }
  }, [conversationId, alert]);

  // Mute handlers
  const handleMute = useCallback(async (hours) => {
    try {
      let muteUntilValue;
      if (hours === -1) {
        muteUntilValue = -1; // Forever
      } else {
        muteUntilValue = new Date(Date.now() + hours * 3600000).toISOString();
      }
      await messagingService.muteConversation(conversationId, muteUntilValue);
      setMuteUntil(muteUntilValue);
    } catch (error) {
      console.error('Error muting conversation:', error);
      alert({
        type: 'error',
        title: 'Error',
        message: 'Failed to mute conversation',
      });
    }
  }, [conversationId, alert]);

  const handleUnmute = useCallback(async () => {
    try {
      await messagingService.unmuteConversation(conversationId);
      setMuteUntil(null);
    } catch (error) {
      console.error('Error unmuting conversation:', error);
      alert({
        type: 'error',
        title: 'Error',
        message: 'Failed to unmute conversation',
      });
    }
  }, [conversationId, alert]);

  // Group handlers
  const handleUpdateGroupName = useCallback(async (name) => {
    try {
      await messagingService.updateGroup(conversationId, { name });
    } catch (error) {
      console.error('Error updating group name:', error);
      throw error;
    }
  }, [conversationId]);

  const handleUpdateGroupDescription = useCallback(async (description) => {
    try {
      await messagingService.updateGroup(conversationId, { description });
    } catch (error) {
      console.error('Error updating group description:', error);
      throw error;
    }
  }, [conversationId]);

  const handleLeaveGroup = useCallback(async () => {
    try {
      await messagingService.leaveGroup(conversationId);
      // Safely navigate back - use goBack if popToTop not available
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert({
        type: 'error',
        title: 'Error',
        message: 'Failed to leave group',
      });
    }
  }, [conversationId, navigation, alert]);

  const handleDeleteGroup = useCallback(async () => {
    try {
      await messagingService.deleteGroup(conversationId);
      // Safely navigate back - use goBack if popToTop not available
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete group',
      });
    }
  }, [conversationId, navigation, alert]);

  const handleAddParticipants = useCallback(async (userIds) => {
    try {
      await messagingService.addParticipants(conversationId, userIds);
    } catch (error) {
      console.error('Error adding participants:', error);
      throw error;
    }
  }, [conversationId]);

  const handleRemoveParticipant = useCallback((participant) => {
    alert({
      type: 'warning',
      title: 'Remove Participant',
      message: `Remove ${participant.users?.display_name || 'this member'} from the group?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await messagingService.removeParticipant(conversationId, participant.user_id);
            } catch (error) {
              console.error('Error removing participant:', error);
              alert({
                type: 'error',
                title: 'Error',
                message: 'Failed to remove participant',
              });
            }
          },
        },
      ],
    });
  }, [conversationId, alert]);

  // Get disappearing messages label
  const getDisappearingLabel = () => {
    if (disappearingDuration === 0) return 'Off';
    if (disappearingDuration === 24) return '24 hours';
    if (disappearingDuration === 168) return '7 days';
    if (disappearingDuration === 2160) return '90 days';
    return 'Custom';
  };

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
        <Text style={styles.headerTitle}>Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {otherParticipant?.avatar_url ? (
            <Image source={{ uri: otherParticipant.avatar_url }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={isGroup ? [COLORS.purple, COLORS.cyan] : GRADIENTS.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              {isGroup ? (
                <Ionicons name="people" size={40} color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
              )}
            </LinearGradient>
          )}

          <Text style={styles.name}>{displayName}</Text>

          {!isGroup && (
            <View style={styles.statusRow}>
              {isOnline && <View style={styles.onlineDot} />}
              <Text style={styles.statusText}>
                {isOnline ? 'Online' : presenceService.formatLastSeen(otherParticipant?.last_seen)}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleSearchConversation}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(0, 221, 235, 0.2)' }]}>
              <Ionicons name="search" size={22} color={COLORS.cyan} />
            </View>
            <Text style={styles.quickActionLabel}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={() => setShowMute(true)}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 189, 89, 0.2)' }]}>
              <Ionicons name={muteUntil ? 'notifications-off' : 'notifications'} size={22} color={COLORS.gold} />
            </View>
            <Text style={styles.quickActionLabel}>{muteUntil ? 'Muted' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={() => setShowThemes(true)}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
              <Ionicons name="color-palette" size={22} color={COLORS.purple} />
            </View>
            <Text style={styles.quickActionLabel}>Theme</Text>
          </TouchableOpacity>

          {isGroup && isAdmin && (
            <TouchableOpacity style={styles.quickAction} onPress={() => setShowGroupSettings(true)}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                <Ionicons name="settings" size={22} color={COLORS.success} />
              </View>
              <Text style={styles.quickActionLabel}>Settings</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Chat Options</Text>

          <TouchableOpacity style={styles.actionItem} onPress={handleViewMedia}>
            <View style={styles.actionIcon}>
              <Ionicons name="images-outline" size={22} color={COLORS.purple} />
            </View>
            <Text style={styles.actionText}>Media & Files</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleViewPinned}>
            <View style={styles.actionIcon}>
              <Ionicons name="pin-outline" size={22} color={COLORS.gold} />
            </View>
            <Text style={styles.actionText}>Pinned Messages</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleViewStarred}>
            <View style={styles.actionIcon}>
              <Ionicons name="star-outline" size={22} color={COLORS.gold} />
            </View>
            <Text style={styles.actionText}>Starred Messages</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleScheduledMessages}>
            <View style={styles.actionIcon}>
              <Ionicons name="calendar-outline" size={22} color={COLORS.cyan} />
            </View>
            <Text style={styles.actionText}>Scheduled Messages</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Privacy Settings */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <TouchableOpacity style={styles.actionItem} onPress={() => setShowDisappearing(true)}>
            <View style={styles.actionIcon}>
              <Ionicons name="timer-outline" size={22} color={COLORS.warning} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>Disappearing Messages</Text>
              <Text style={styles.actionSubtext}>{getDisappearingLabel()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('BlockedUsers')}>
            <View style={styles.actionIcon}>
              <Ionicons name="ban-outline" size={22} color={COLORS.textMuted} />
            </View>
            <Text style={styles.actionText}>Blocked Users</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Group Participants */}
        {isGroup && participants.length > 0 && (
          <View style={styles.actionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {participants.length} Participant{participants.length !== 1 ? 's' : ''}
              </Text>
              {isAdmin && (
                <TouchableOpacity onPress={() => setShowAddParticipants(true)}>
                  <Ionicons name="person-add" size={22} color={COLORS.cyan} />
                </TouchableOpacity>
              )}
            </View>

            {participants.slice(0, 5).map((participant) => (
              <TouchableOpacity
                key={participant.user_id}
                style={styles.participantItem}
                onLongPress={isAdmin && participant.user_id !== user?.id ? () => handleRemoveParticipant(participant) : undefined}
                activeOpacity={0.7}
              >
                {participant.users?.avatar_url ? (
                  <Image source={{ uri: participant.users.avatar_url }} style={styles.participantAvatar} />
                ) : (
                  <LinearGradient
                    colors={GRADIENTS.avatar}
                    style={styles.participantAvatarFallback}
                  >
                    <Text style={styles.participantInitials}>
                      {getInitials(participant.users?.display_name)}
                    </Text>
                  </LinearGradient>
                )}
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>
                    {participant.user_id === user?.id ? 'You' : participant.users?.display_name || 'Unknown'}
                  </Text>
                  {conversation?.admin_ids?.includes(participant.user_id) && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminText}>Admin</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {participants.length > 5 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View all {participants.length} participants</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Danger Zone */}
        {!isGroup && (
          <View style={styles.dangerSection}>
            <TouchableOpacity style={styles.dangerItem} onPress={handleBlock}>
              <Ionicons name="ban-outline" size={22} color={COLORS.error} />
              <Text style={styles.dangerText}>Block {displayName}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dangerItem} onPress={handleReport}>
              <Ionicons name="flag-outline" size={22} color={COLORS.error} />
              <Text style={styles.dangerText}>Report</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sheets */}
      <DisappearingMessagesSheet
        visible={showDisappearing}
        currentDuration={disappearingDuration}
        onClose={() => setShowDisappearing(false)}
        onSave={handleSaveDisappearing}
      />

      <ChatThemesSheet
        visible={showThemes}
        currentTheme={chatTheme}
        onClose={() => setShowThemes(false)}
        onSave={handleSaveTheme}
      />

      <MuteConversationSheet
        visible={showMute}
        currentMuteUntil={muteUntil}
        conversationName={displayName}
        onClose={() => setShowMute(false)}
        onMute={handleMute}
        onUnmute={handleUnmute}
      />

      {isGroup && (
        <>
          <GroupSettingsSheet
            visible={showGroupSettings}
            conversation={conversation}
            currentUserId={user?.id}
            onClose={() => setShowGroupSettings(false)}
            onUpdateName={handleUpdateGroupName}
            onUpdateDescription={handleUpdateGroupDescription}
            onLeaveGroup={handleLeaveGroup}
            onDeleteGroup={handleDeleteGroup}
          />

          <AddParticipantsSheet
            visible={showAddParticipants}
            conversationId={conversationId}
            existingParticipantIds={participantIds}
            onClose={() => setShowAddParticipants(false)}
            onAdd={handleAddParticipants}
          />
        </>
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
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 44,
  },

  // Content
  content: {
    paddingBottom: SPACING.huge,
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
    gap: SPACING.lg,
  },
  quickAction: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Actions Section
  actionsSection: {
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  actionSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Participants
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
  },
  participantAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantInitials: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
    gap: SPACING.sm,
  },
  participantName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  adminBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  viewAllButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Danger Section
  dangerSection: {
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  dangerText: {
    marginLeft: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error,
  },
});
