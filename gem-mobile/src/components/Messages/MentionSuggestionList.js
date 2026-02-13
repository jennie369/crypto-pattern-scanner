/**
 * MentionSuggestionList Component
 * Dropdown list of users when typing @mention
 */

import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

/**
 * MentionSuggestionList - List of users to mention
 *
 * @param {Object} props
 * @param {Array} props.suggestions - Array of user objects to suggest
 * @param {Function} props.onSelect - Callback when user is selected
 * @param {Function} props.onDismiss - Callback to dismiss suggestions
 */
const MentionSuggestionList = memo(({
  suggestions = [],
  onSelect,
  onDismiss,
}) => {
  // ========== RENDER ==========
  const renderItem = useCallback(
    ({ item }) => {
      // PRIVACY: Use display_name, full_name, or username only - NEVER email
      const displayName = item.display_name || item.full_name || item.username;
      const username = item.username;

      // PRIVACY: Skip rendering users without proper name data
      if (!displayName) {
        console.error('[MentionSuggestionList] User has no display name - skipping render', item.id);
        return null;
      }

      return (
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => onSelect?.(item)}
          activeOpacity={0.7}
        >
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={GRADIENTS.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.displayName} numberOfLines={1}>
              {displayName}
            </Text>
            {username && (
              <Text style={styles.username} numberOfLines={1}>
                @{username}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [onSelect]
  );

  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={suggestions.slice(0, 5)} // Max 5 suggestions
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

MentionSuggestionList.displayName = 'MentionSuggestionList';

export default MentionSuggestionList;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderRadius: 12,
    marginBottom: SPACING.xs,
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    zIndex: 100,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  displayName: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  username: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
