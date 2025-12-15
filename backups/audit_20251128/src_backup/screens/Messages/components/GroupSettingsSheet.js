/**
 * Gemral - Group Settings Sheet Component
 * Bottom sheet for group chat settings and management
 *
 * Features:
 * - Edit group name
 * - Edit group description
 * - Group admin controls
 * - Leave group option
 * - Delete group (admin only)
 */

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  ScrollView,
  Alert,
  PanResponder,
  Switch,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const SHEET_HEIGHT = 520;

const GroupSettingsSheet = memo(({
  visible,
  conversation,
  currentUserId,
  onClose,
  onUpdateName,
  onUpdateDescription,
  onLeaveGroup,
  onDeleteGroup,
  onToggleAdminOnly,
}) => {
  // Local state
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [adminOnlyMessages, setAdminOnlyMessages] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Animation refs
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Check if current user is admin
  const isAdmin = conversation?.admin_ids?.includes(currentUserId) ||
    conversation?.created_by === currentUserId;

  // Pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Initialize values when conversation changes
  useEffect(() => {
    if (conversation) {
      setGroupName(conversation.name || '');
      setDescription(conversation.description || '');
      setAdminOnlyMessages(conversation.admin_only_messages || false);
    }
  }, [conversation]);

  // Track changes
  useEffect(() => {
    const nameChanged = groupName !== (conversation?.name || '');
    const descChanged = description !== (conversation?.description || '');
    setHasChanges(nameChanged || descChanged);
  }, [groupName, description, conversation]);

  // Open animation
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  // Close animation
  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!hasChanges || saving) return;

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (groupName !== conversation?.name) {
        await onUpdateName?.(groupName);
      }
      if (description !== conversation?.description) {
        await onUpdateDescription?.(description);
      }

      handleClose();
    } catch (error) {
      console.error('Error saving group settings:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }, [hasChanges, saving, groupName, description, conversation, onUpdateName, onUpdateDescription, handleClose]);

  // Handle admin only toggle
  const handleAdminOnlyToggle = useCallback(async (value) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setAdminOnlyMessages(value);
      await onToggleAdminOnly?.(value);
    } catch (error) {
      console.error('Error toggling admin only:', error);
      setAdminOnlyMessages(!value);
    }
  }, [onToggleAdminOnly]);

  // Leave group
  const handleLeaveGroup = useCallback(() => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will no longer receive messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            handleClose();
            onLeaveGroup?.();
          },
        },
      ]
    );
  }, [handleClose, onLeaveGroup]);

  // Delete group (admin only)
  const handleDeleteGroup = useCallback(() => {
    Alert.alert(
      'Delete Group',
      'This will permanently delete the group and all messages for everyone. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            handleClose();
            onDeleteGroup?.();
          },
        },
      ]
    );
  }, [handleClose, onDeleteGroup]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          { transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <BlurView intensity={40} style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Group Settings</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.headerButton}
              disabled={!hasChanges || saving}
            >
              <Text style={[styles.saveText, !hasChanges && styles.saveTextDisabled]}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Group Name */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Group Name</Text>
              <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor={COLORS.textMuted}
                maxLength={50}
                editable={isAdmin}
              />
              <Text style={styles.charCount}>{groupName.length}/50</Text>
            </View>

            {/* Description */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a group description"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                maxLength={200}
                editable={isAdmin}
              />
              <Text style={styles.charCount}>{description.length}/200</Text>
            </View>

            {/* Admin Settings */}
            {isAdmin && (
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Admin Settings</Text>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="shield-checkmark" size={22} color={COLORS.purple} />
                    <View style={styles.settingText}>
                      <Text style={styles.settingLabel}>Admin Only Messages</Text>
                      <Text style={styles.settingDescription}>
                        Only admins can send messages
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={adminOnlyMessages}
                    onValueChange={handleAdminOnlyToggle}
                    trackColor={{ false: 'rgba(255,255,255,0.2)', true: COLORS.purple }}
                    thumbColor={COLORS.textPrimary}
                  />
                </View>
              </View>
            )}

            {/* Danger Zone */}
            <View style={styles.dangerSection}>
              <TouchableOpacity
                style={styles.dangerItem}
                onPress={handleLeaveGroup}
                activeOpacity={0.7}
              >
                <Ionicons name="exit-outline" size={22} color={COLORS.warning} />
                <Text style={styles.dangerTextWarning}>Leave Group</Text>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity
                  style={styles.dangerItem}
                  onPress={handleDeleteGroup}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={22} color={COLORS.error} />
                  <Text style={styles.dangerText}>Delete Group</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </BlurView>
      </Animated.View>
    </Modal>
  );
});

GroupSettingsSheet.displayName = 'GroupSettingsSheet';

export default GroupSettingsSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },

  // Sheet
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
  },
  sheet: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // Handle
  handleContainer: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  headerButton: {
    minWidth: 60,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  saveText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
    textAlign: 'right',
  },
  saveTextDisabled: {
    color: COLORS.textMuted,
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.md,
  },

  // Input Section
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },

  // Settings Section
  settingsSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Danger Section
  dangerSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  dangerText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error,
  },
  dangerTextWarning: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.warning,
  },
});
