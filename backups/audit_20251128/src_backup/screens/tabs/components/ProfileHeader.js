/**
 * Gemral - Profile Header Component
 * Facebook-style cover photo + avatar + edit button
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Edit3, Settings } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, TOUCH } from '../../../utils/tokens';
import { UserBadges } from '../../../components/UserBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_HEIGHT = 160;
const AVATAR_SIZE = 100;

const ProfileHeader = ({
  profile,
  isOwnProfile = true,
  onEditProfile,
  onSettings,
  onChangeCover,
  onChangeAvatar,
}) => {
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const username = profile?.username || profile?.email?.split('@')[0] || 'user';
  const bio = profile?.bio || '';
  const avatarUrl = profile?.avatar_url;
  const coverUrl = profile?.cover_url;

  return (
    <View style={styles.container}>
      {/* Cover Photo */}
      <View style={styles.coverContainer}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.coverImage} />
        ) : (
          <LinearGradient
            colors={['#1a0b2e', '#0F1030', '#05040B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverGradient}
          />
        )}

        {/* Cover overlay gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(5, 4, 11, 0.8)']}
          style={styles.coverOverlay}
        />

        {/* Change Cover Button (only for own profile) */}
        {isOwnProfile && (
          <TouchableOpacity
            style={styles.changeCoverBtn}
            onPress={onChangeCover}
          >
            <Camera size={16} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar + Info */}
      <View style={styles.profileInfo}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={GRADIENTS.avatar}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
          </View>

          {/* Change Avatar Button (only for own profile) */}
          {isOwnProfile && (
            <TouchableOpacity
              style={styles.changeAvatarBtn}
              onPress={onChangeAvatar}
            >
              <Camera size={14} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Name & Username */}
        <View style={styles.nameContainer}>
          <View style={styles.displayNameRow}>
            <Text style={styles.displayName}>{displayName}</Text>
            <UserBadges user={profile} size="medium" maxBadges={3} />
          </View>
          <Text style={styles.username}>@{username}</Text>
        </View>

        {/* Bio */}
        {bio ? (
          <Text style={styles.bio} numberOfLines={3}>{bio}</Text>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity
                style={styles.editButton}
                onPress={onEditProfile}
              >
                <Edit3 size={16} color={COLORS.textPrimary} />
                <Text style={styles.editButtonText}>Chỉnh sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsButton}
                onPress={onSettings}
              >
                <Settings size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </>
          ) : (
            // Follow button for other users' profiles
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Theo dõi</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },

  // Cover Photo
  coverContainer: {
    height: COVER_HEIGHT,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  changeCoverBtn: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Profile Info
  profileInfo: {
    paddingHorizontal: SPACING.lg,
    marginTop: -(AVATAR_SIZE / 2),
  },

  // Avatar
  avatarWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: COLORS.bgDarkest,
    overflow: 'hidden',
    backgroundColor: COLORS.bgMid,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  changeAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgDarkest,
  },

  // Name & Username
  nameContainer: {
    marginTop: SPACING.md,
  },
  displayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Bio
  bio: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    lineHeight: 20,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.purple,
    gap: SPACING.sm,
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  followButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    borderRadius: 10,
  },
  followButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default ProfileHeader;
