/**
 * Gemral - UserLink Component
 * Clickable username that navigates to user profile
 * Used in posts, comments, mentions, etc.
 * Theme-aware with i18n support
 *
 * Instagram/TikTok style - tap username → go to profile
 */

import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../../contexts/SettingsContext';

/**
 * UserLink - Clickable username component
 *
 * @param {Object} props
 * @param {Object} props.user - User object with id, full_name, username, avatar_url
 * @param {boolean} props.showAvatar - Show avatar (default: false)
 * @param {number} props.avatarSize - Avatar size in pixels (default: 24)
 * @param {Object} props.textStyle - Custom text style
 * @param {Object} props.containerStyle - Custom container style
 * @param {boolean} props.bold - Use bold text (default: false)
 * @param {string} props.color - Text color (uses theme default if not provided)
 * @param {Function} props.onPress - Override default navigation
 * @param {boolean} props.disabled - Disable tap (default: false)
 */
const UserLink = ({
  user,
  showAvatar = false,
  avatarSize = 24,
  textStyle,
  containerStyle,
  bold = false,
  color, // Will use theme default
  onPress,
  disabled = false,
}) => {
  const { colors, gradients, SPACING, TYPOGRAPHY, t } = useSettings();
  const navigation = useNavigation();

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      backgroundColor: colors.glassBg,
    },
    avatarPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitial: {
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    text: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    textBold: {
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    textWithAvatar: {
      marginLeft: SPACING.sm,
    },
  }), [colors, SPACING, TYPOGRAPHY]);

  if (!user || !user.id) {
    return null;
  }

  const displayName = user.full_name || user.username || t('common.user', 'Người dùng');
  const textColor = color || colors.textPrimary;
  const avatarGradient = gradients?.avatar || [colors.gold, colors.goldBright || '#FFD700'];

  const handlePress = () => {
    if (disabled) return;

    if (onPress) {
      onPress(user);
      return;
    }

    // Navigate to user profile
    navigation.navigate('UserProfile', { userId: user.id });
  };

  const renderAvatar = () => {
    if (!showAvatar) return null;

    if (user.avatar_url) {
      return (
        <Image
          source={{ uri: user.avatar_url }}
          style={[
            styles.avatar,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        />
      );
    }

    // Default avatar with gradient
    return (
      <LinearGradient
        colors={avatarGradient}
        style={[
          styles.avatarPlaceholder,
          { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        ]}
      >
        <Text style={[styles.avatarInitial, { fontSize: avatarSize * 0.45 }]}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </LinearGradient>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, containerStyle]}
    >
      {renderAvatar()}
      <Text
        style={[
          styles.text,
          { color: textColor },
          bold && styles.textBold,
          showAvatar && styles.textWithAvatar,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {displayName}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * UserMention - For @mentions in text
 * Highlights the username with special styling
 */
export const UserMention = ({
  user,
  onPress,
  textStyle,
}) => {
  const { colors, TYPOGRAPHY, t } = useSettings();
  const navigation = useNavigation();

  const styles = useMemo(() => StyleSheet.create({
    mention: {
      color: colors.purple,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      fontSize: TYPOGRAPHY.fontSize.base,
    },
  }), [colors, TYPOGRAPHY]);

  if (!user || !user.id) {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress(user);
      return;
    }
    navigation.navigate('UserProfile', { userId: user.id });
  };

  const displayName = user.full_name || user.username || t('common.user', 'Người dùng');

  return (
    <Text
      onPress={handlePress}
      style={[styles.mention, textStyle]}
    >
      @{displayName}
    </Text>
  );
};

/**
 * UserLinkCompact - Minimal version for lists
 */
export const UserLinkCompact = ({
  user,
  onPress,
}) => {
  const { colors, gradients, SPACING, TYPOGRAPHY, t } = useSettings();
  const navigation = useNavigation();

  const styles = useMemo(() => StyleSheet.create({
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
    },
    compactAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.glassBg,
    },
    compactAvatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    compactInitial: {
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      fontSize: TYPOGRAPHY.fontSize.lg,
    },
    compactInfo: {
      marginLeft: SPACING.md,
      flex: 1,
    },
    compactName: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },
    compactUsername: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
      marginTop: SPACING.xxs,
    },
  }), [colors, SPACING, TYPOGRAPHY]);

  if (!user || !user.id) {
    return null;
  }

  const avatarGradient = gradients?.avatar || [colors.gold, colors.goldBright || '#FFD700'];

  const handlePress = () => {
    if (onPress) {
      onPress(user);
      return;
    }
    navigation.navigate('UserProfile', { userId: user.id });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.compactContainer}
    >
      {user.avatar_url ? (
        <Image
          source={{ uri: user.avatar_url }}
          style={styles.compactAvatar}
        />
      ) : (
        <LinearGradient
          colors={avatarGradient}
          style={styles.compactAvatarPlaceholder}
        >
          <Text style={styles.compactInitial}>
            {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
      )}
      <View style={styles.compactInfo}>
        <Text style={styles.compactName} numberOfLines={1}>
          {user.full_name || user.username || t('common.user', 'Người dùng')}
        </Text>
        {user.username && (
          <Text style={styles.compactUsername} numberOfLines={1}>
            @{user.username}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default UserLink;
