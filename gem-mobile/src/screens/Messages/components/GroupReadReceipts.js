/**
 * Gemral - Group Read Receipts Component
 * Shows who has read a message in a group chat
 *
 * Features:
 * - Avatar stack of readers
 * - Tap to see full list
 * - Delivery vs read status
 * - Animated appearance
 */

import React, { useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const MAX_AVATARS = 3;

const GroupReadReceipts = memo(({
  readBy = [],
  deliveredTo = [],
  totalParticipants,
  isOwn,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Get initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Handle press to show details
  const handlePress = useCallback(() => {
    if (readBy.length === 0 && deliveredTo.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetails(true);
  }, [readBy.length, deliveredTo.length]);

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Only show for own messages
  if (!isOwn) return null;

  // Calculate counts
  const readCount = readBy.length;
  const deliveredCount = deliveredTo.length;
  const remainingReaders = Math.max(0, readCount - MAX_AVATARS);

  // If no one has read/received yet
  if (readCount === 0 && deliveredCount === 0) {
    return (
      <View style={styles.container}>
        <Ionicons name="checkmark" size={12} color={COLORS.textMuted} />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Read status indicator */}
        {readCount > 0 ? (
          <>
            {/* Avatar stack */}
            <View style={styles.avatarStack}>
              {readBy.slice(0, MAX_AVATARS).map((reader, index) => (
                <View
                  key={reader.user_id}
                  style={[
                    styles.avatarWrapper,
                    { marginLeft: index > 0 ? -8 : 0, zIndex: MAX_AVATARS - index },
                  ]}
                >
                  {reader.avatar_url ? (
                    <Image source={{ uri: reader.avatar_url }} style={styles.avatar} />
                  ) : (
                    <LinearGradient
                      colors={GRADIENTS.avatar}
                      style={styles.avatarFallback}
                    >
                      <Text style={styles.avatarInitials}>
                        {getInitials(reader.display_name)?.[0]}
                      </Text>
                    </LinearGradient>
                  )}
                </View>
              ))}
            </View>

            {/* Count badge */}
            {remainingReaders > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>+{remainingReaders}</Text>
              </View>
            )}

            {/* Read icon */}
            <Ionicons name="checkmark-done" size={12} color={COLORS.cyan} />
          </>
        ) : deliveredCount > 0 ? (
          <>
            <Ionicons name="checkmark-done" size={12} color={COLORS.textMuted} />
            <Text style={styles.deliveredText}>Delivered</Text>
          </>
        ) : null}
      </TouchableOpacity>

      {/* Details Modal */}
      <Modal
        visible={showDetails}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetails(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowDetails(false)}
        >
          <BlurView intensity={40} style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message Info</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Read By Section */}
            {readBy.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-done" size={18} color={COLORS.cyan} />
                  <Text style={styles.sectionTitle}>
                    Read by {readBy.length} of {totalParticipants}
                  </Text>
                </View>
                <FlatList
                  data={readBy}
                  keyExtractor={(item) => item.user_id}
                  renderItem={({ item }) => (
                    <View style={styles.readerItem}>
                      {item.avatar_url ? (
                        <Image source={{ uri: item.avatar_url }} style={styles.readerAvatar} />
                      ) : (
                        <LinearGradient
                          colors={GRADIENTS.avatar}
                          style={styles.readerAvatarFallback}
                        >
                          <Text style={styles.readerInitials}>
                            {getInitials(item.display_name)}
                          </Text>
                        </LinearGradient>
                      )}
                      <View style={styles.readerInfo}>
                        <Text style={styles.readerName}>{item.display_name}</Text>
                        <Text style={styles.readTime}>{formatTime(item.read_at)}</Text>
                      </View>
                    </View>
                  )}
                  style={styles.readersList}
                />
              </View>
            )}

            {/* Delivered To Section */}
            {deliveredTo.length > 0 && deliveredTo.length !== readBy.length && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-done" size={18} color={COLORS.textMuted} />
                  <Text style={styles.sectionTitle}>
                    Delivered to {deliveredTo.length}
                  </Text>
                </View>
                <FlatList
                  data={deliveredTo.filter(d => !readBy.find(r => r.user_id === d.user_id))}
                  keyExtractor={(item) => item.user_id}
                  renderItem={({ item }) => (
                    <View style={styles.readerItem}>
                      {item.avatar_url ? (
                        <Image source={{ uri: item.avatar_url }} style={styles.readerAvatar} />
                      ) : (
                        <LinearGradient
                          colors={GRADIENTS.avatar}
                          style={styles.readerAvatarFallback}
                        >
                          <Text style={styles.readerInitials}>
                            {getInitials(item.display_name)}
                          </Text>
                        </LinearGradient>
                      )}
                      <View style={styles.readerInfo}>
                        <Text style={styles.readerName}>{item.display_name}</Text>
                        <Text style={styles.readTime}>Not yet read</Text>
                      </View>
                    </View>
                  )}
                  style={styles.readersList}
                />
              </View>
            )}
          </BlurView>
        </TouchableOpacity>
      </Modal>
    </>
  );
});

GroupReadReceipts.displayName = 'GroupReadReceipts';

export default GroupReadReceipts;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },

  // Avatar Stack
  avatarStack: {
    flexDirection: 'row',
  },
  avatarWrapper: {
    borderWidth: 1,
    borderColor: 'rgba(5, 4, 11, 0.95)',
    borderRadius: 8,
  },
  avatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  avatarFallback: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 6,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Count Badge
  countBadge: {
    backgroundColor: 'rgba(0, 221, 235, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  countText: {
    fontSize: 8,
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Delivered text
  deliveredText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginLeft: 2,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Sections
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  readersList: {
    maxHeight: 200,
  },
  readerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  readerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.glassBg,
  },
  readerAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readerInitials: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  readerInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  readerName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  readTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
