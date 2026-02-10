/**
 * RemoteVideoView Component
 * Displays remote video stream (full screen)
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { VideoOff, User } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

// Try to import RTCView - may not be available
let RTCView = null;
try {
  RTCView = require('react-native-webrtc').RTCView;
} catch (e) {
  console.log('[RemoteVideoView] react-native-webrtc not installed');
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * RemoteVideoView Component
 * Hiển thị video từ remote user (full screen)
 * @param {Object} props
 * @param {MediaStream} props.stream - Remote media stream
 * @param {boolean} props.isVideoEnabled - Whether remote video is enabled
 * @param {string} props.userName - Remote user name
 * @param {string} props.userAvatar - Remote user avatar URL
 */
const RemoteVideoView = memo(({
  stream,
  isVideoEnabled = true,
  userName,
  userAvatar,
}) => {
  const { colors, glass, settings, SPACING, TYPOGRAPHY } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    video: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
    placeholder: {
      flex: 1,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarContainer: {
      marginBottom: SPACING.lg,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.glassBorder,
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.bgCard,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.glassBorder,
    },
    videoOffBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
      marginBottom: SPACING.md,
    },
    videoOffText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      marginLeft: SPACING.xs,
    },
    userName: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // No stream or video disabled - show placeholder
  if (!stream || !isVideoEnabled || !RTCView) {
    return (
      <View style={styles.placeholder}>
        <View style={styles.avatarContainer}>
          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={60} color={colors.textMuted} />
            </View>
          )}
        </View>

        {!isVideoEnabled && (
          <View style={styles.videoOffBadge}>
            <VideoOff size={16} color={colors.textSecondary} />
            <Text style={styles.videoOffText}>
              Camera đã tắt
            </Text>
          </View>
        )}

        {userName && (
          <Text style={styles.userName}>{userName}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RTCView
        streamURL={stream.toURL()}
        style={styles.video}
        objectFit="cover"
        zOrder={0}
      />
    </View>
  );
});

RemoteVideoView.displayName = 'RemoteVideoView';

export default RemoteVideoView;
