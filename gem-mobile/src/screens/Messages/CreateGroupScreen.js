/**
 * Gemral - Create Group Screen
 * Create a new group conversation
 *
 * Features:
 * - Search and select multiple users
 * - Group name and avatar
 * - Selected members preview
 * - Glass-morphism UI
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import messagingService from '../../services/messagingService';
import presenceService from '../../services/presenceService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Alert
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../utils/tokens';

export default function CreateGroupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // State
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await messagingService.searchUsers(query);
      // Filter out already selected users
      const filtered = results.filter(
        u => !selectedUsers.some(s => s.id === u.id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  }, [selectedUsers]);

  // =====================================================
  // USER SELECTION
  // =====================================================

  const handleSelectUser = useCallback((selectedUser) => {
    setSelectedUsers(prev => [...prev, selectedUser]);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleRemoveUser = useCallback((userId) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  // =====================================================
  // CREATE GROUP
  // =====================================================

  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim()) {
      alert({ type: 'error', title: 'Group Name Required', message: 'Please enter a name for the group' });
      return;
    }

    if (selectedUsers.length < 2) {
      alert({ type: 'error', title: 'More Members Needed', message: 'Please select at least 2 other members' });
      return;
    }

    if (creating) return;

    try {
      setCreating(true);

      const participantIds = [user.id, ...selectedUsers.map(u => u.id)];

      const conversation = await messagingService.createConversation(
        participantIds,
        true, // Is group
        groupName.trim()
      );

      // Navigate to chat
      navigation.replace('Chat', {
        conversationId: conversation.id,
        conversation,
      });
    } catch (error) {
      console.error('Error creating group:', error);
      alert({ type: 'error', title: 'Error', message: 'Failed to create group' });
    } finally {
      setCreating(false);
    }
  }, [groupName, selectedUsers, user?.id, navigation, creating, alert]);

  // =====================================================
  // RENDER
  // =====================================================

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const renderSelectedUser = ({ item }) => (
    <View style={styles.selectedUser}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.selectedAvatar} />
      ) : (
        <LinearGradient
          colors={GRADIENTS.avatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.selectedAvatarFallback}
        >
          <Text style={styles.selectedInitials}>{getInitials(item.display_name)}</Text>
        </LinearGradient>
      )}
      <Text style={styles.selectedName} numberOfLines={1}>
        {item.display_name?.split(' ')[0] || 'User'}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveUser(item.id)}
      >
        <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );

  const renderUserItem = ({ item }) => {
    const isOnline = presenceService.isOnline(item.online_status);

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleSelectUser(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={GRADIENTS.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>{getInitials(item.display_name)}</Text>
            </LinearGradient>
          )}

          {isOnline && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.display_name || 'Unknown'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>

        {/* Add icon */}
        <View style={styles.addIcon}>
          <Ionicons name="add-circle" size={24} color={COLORS.purple} />
        </View>
      </TouchableOpacity>
    );
  };

  const canCreate = groupName.trim() && selectedUsers.length >= 2;

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

        <Text style={styles.title}>New Group</Text>

        <TouchableOpacity
          style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
          onPress={handleCreateGroup}
          disabled={!canCreate || creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color={COLORS.textPrimary} />
          ) : (
            <Text style={[styles.createText, !canCreate && styles.createTextDisabled]}>
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="people" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.nameInput}
              placeholder="Enter group name..."
              placeholderTextColor={COLORS.textMuted}
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
            />
          </View>
        </View>

        {/* Selected Members */}
        {selectedUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Members ({selectedUsers.length + 1})
            </Text>
            <FlatList
              data={selectedUsers}
              renderItem={renderSelectedUser}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedList}
            />
          </View>
        )}

        {/* Search Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Members</Text>
          <View style={styles.searchContainer}>
            <BlurView intensity={20} style={styles.searchBlur}>
              <Ionicons name="search" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searching && (
                <ActivityIndicator size="small" color={COLORS.gold} />
              )}
            </BlurView>
          </View>
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            {searchResults.map((item) => (
              <View key={item.id}>
                {renderUserItem({ item })}
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        )}

        {/* Instructions */}
        {selectedUsers.length === 0 && (
          <View style={styles.instructions}>
            <Ionicons name="information-circle" size={24} color={COLORS.textMuted} />
            <Text style={styles.instructionsText}>
              Search and add at least 2 members to create a group
            </Text>
          </View>
        )}
      </ScrollView>
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
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  createButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  createTextDisabled: {
    color: COLORS.textMuted,
  },

  // Content
  content: {
    flex: 1,
  },

  // Sections
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },

  // Name Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  nameInput: {
    flex: 1,
    height: 48,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  // Selected Users
  selectedList: {
    paddingVertical: SPACING.sm,
  },
  selectedUser: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 70,
  },
  selectedAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.glassBg,
  },
  selectedAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedInitials: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  selectedName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: 4,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 10,
  },

  // Search
  searchContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  // Results
  resultsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // User Item
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.bgDarkest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addIcon: {
    marginLeft: SPACING.sm,
  },

  // Empty & Instructions
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    gap: SPACING.sm,
  },
  instructionsText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
