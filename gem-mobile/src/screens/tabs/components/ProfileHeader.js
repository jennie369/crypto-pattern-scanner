/**
 * Gemral - Profile Header Component
 * Instagram/TikTok style cover photo + avatar + edit button
 * With working image upload functionality
 *
 * Uses DESIGN_TOKENS v3.0
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Edit3, Settings, ImagePlus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, TOUCH, GLASS } from '../../../utils/tokens';
import { UserBadges } from '../../../components/UserBadge';
import { forumService } from '../../../services/forumService';
import { supabase } from '../../../services/supabase';
import alertService from '../../../services/alertService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_HEIGHT = 180;
const AVATAR_SIZE = 100;

const ProfileHeader = ({
  profile,
  isOwnProfile = true,
  onEditProfile,
  onSettings,
  onProfileUpdate,
}) => {
  const navigation = useNavigation();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Người dùng';
  const username = profile?.username || profile?.email?.split('@')[0] || 'user';
  const bio = profile?.bio || '';
  const avatarUrl = profile?.avatar_url;
  // Support both column and metadata fallback for cover_url
  const coverUrl = profile?.cover_url || profile?.metadata?.cover_url;

  // ==========================================
  // IMAGE PICKER & UPLOAD HANDLERS
  // ==========================================

  /**
   * Pick image from library or camera
   */
  const pickImage = async (type = 'avatar') => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alertService.warning(
          'Cần quyền truy cập',
          'Vui lòng cho phép truy cập thư viện ảnh để chọn ảnh.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'cover' ? [16, 9] : [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error('[ProfileHeader] Pick image error:', error);
      alertService.error('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
      return null;
    }
  };

  /**
   * Upload image to Supabase Storage
   */
  const uploadImage = async (uri, type = 'avatar') => {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) throw new Error('Chưa đăng nhập');

      const timestamp = Date.now();
      const folder = type === 'cover' ? 'covers' : 'avatars';
      const filename = `${folder}/${user.id}/${timestamp}.jpg`;

      // Fetch image and convert to Uint8Array
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(filename, uint8Array, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        // Try fallback bucket
        const { data: fallbackData, error: fallbackError } = await supabase.storage
          .from('avatars')
          .upload(`forum/${filename}`, uint8Array, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (fallbackError) throw fallbackError;

        const { data: fallbackUrl } = supabase.storage
          .from('avatars')
          .getPublicUrl(`forum/${filename}`);

        return fallbackUrl.publicUrl;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filename);

      return urlData.publicUrl;
    } catch (error) {
      console.error('[ProfileHeader] Upload error:', error);
      throw error;
    }
  };

  /**
   * Handle cover photo change
   */
  const handleChangeCover = async () => {
    const uri = await pickImage('cover');
    if (!uri) return;

    setUploadingCover(true);
    try {
      const imageUrl = await uploadImage(uri, 'cover');

      // Update profile with new cover URL
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      // Try to update cover_url, if column doesn't exist, store in metadata
      const { error } = await supabase
        .from('profiles')
        .update({ cover_url: imageUrl })
        .eq('id', user.id);

      if (error) {
        // If cover_url column doesn't exist or any error, try updating metadata as fallback
        console.log('[ProfileHeader] cover_url update error:', error.message);
        console.log('[ProfileHeader] Trying metadata fallback...');

        const { error: metaError } = await supabase
          .from('profiles')
          .update({
            metadata: {
              ...profile?.metadata,
              cover_url: imageUrl
            }
          })
          .eq('id', user.id);

        if (metaError) {
          console.error('[ProfileHeader] Metadata update also failed:', metaError);
          throw metaError;
        }
        console.log('[ProfileHeader] Successfully saved cover_url in metadata');
      }

      // Notify parent to refresh profile
      if (onProfileUpdate) {
        onProfileUpdate({ cover_url: imageUrl });
      }

      alertService.success('Thành công', 'Đã cập nhật ảnh bìa!');
    } catch (error) {
      console.error('[ProfileHeader] Change cover error:', error);
      alertService.error('Lỗi', 'Không thể cập nhật ảnh bìa. Vui lòng thử lại.');
    } finally {
      setUploadingCover(false);
    }
  };

  /**
   * Handle avatar change
   */
  const handleChangeAvatar = async () => {
    const uri = await pickImage('avatar');
    if (!uri) return;

    setUploadingAvatar(true);
    try {
      const imageUrl = await uploadImage(uri, 'avatar');

      // Update profile with new avatar URL
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: imageUrl })
        .eq('id', user.id);

      if (error) throw error;

      // Notify parent to refresh profile
      if (onProfileUpdate) {
        onProfileUpdate({ avatar_url: imageUrl });
      }

      alertService.success('Thành công', 'Đã cập nhật ảnh đại diện!');
    } catch (error) {
      console.error('[ProfileHeader] Change avatar error:', error);
      alertService.error('Lỗi', 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  /**
   * Handle Edit Profile button
   */
  const handleEditProfile = () => {
    console.log('[ProfileHeader] Edit button pressed');
    if (onEditProfile) {
      onEditProfile();
    } else {
      // Navigate to ProfileSettings - try multiple approaches for different navigation contexts
      try {
        // First try: direct navigation (works if ProfileSettings is in current stack)
        navigation.navigate('ProfileSettings');
      } catch (e) {
        console.log('[ProfileHeader] Direct navigation failed, trying nested:', e);
        try {
          // Second try: navigate through Account tab
          navigation.navigate('Account', {
            screen: 'ProfileSettings',
          });
        } catch (e2) {
          console.log('[ProfileHeader] Account navigation failed:', e2);
        }
      }
    }
  };

  /**
   * Handle Settings button
   */
  const handleSettings = () => {
    console.log('[ProfileHeader] Settings button pressed');
    if (onSettings) {
      onSettings();
    } else {
      // Navigate to ProfileSettings - try multiple approaches
      try {
        navigation.navigate('ProfileSettings');
      } catch (e) {
        console.log('[ProfileHeader] Direct navigation failed:', e);
        try {
          navigation.navigate('Account', {
            screen: 'ProfileSettings',
          });
        } catch (e2) {
          console.log('[ProfileHeader] Account navigation failed:', e2);
        }
      }
    }
  };

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
            onPress={handleChangeCover}
            disabled={uploadingCover}
          >
            {uploadingCover ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <>
                <ImagePlus size={16} color={COLORS.textPrimary} />
                <Text style={styles.changeCoverText}>Đổi ảnh bìa</Text>
              </>
            )}
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

            {/* Avatar loading overlay */}
            {uploadingAvatar && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              </View>
            )}
          </View>

          {/* Change Avatar Button (only for own profile) */}
          {isOwnProfile && (
            <TouchableOpacity
              style={styles.changeAvatarBtn}
              onPress={handleChangeAvatar}
              disabled={uploadingAvatar}
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
        ) : isOwnProfile ? (
          <TouchableOpacity onPress={handleEditProfile}>
            <Text style={styles.bioPlaceholder}>Thêm tiểu sử...</Text>
          </TouchableOpacity>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <Edit3 size={16} color={COLORS.textPrimary} />
                <Text style={styles.editButtonText}>Chỉnh sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsButton}
                onPress={handleSettings}
              >
                <Settings size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </>
          ) : (
            // For other users' profiles - will be replaced with FollowButton component
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: GLASS.borderRadius / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: SPACING.xs,
  },
  changeCoverText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
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
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.bgDarkest,
  },

  // Name & Username
  nameContainer: {
    marginTop: SPACING.md,
  },
  displayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  displayName: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },

  // Bio
  bio: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    lineHeight: 20,
  },
  bioPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontStyle: 'italic',
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
    borderRadius: 12,
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
    width: TOUCH.minimum,
    height: TOUCH.minimum,
    borderRadius: 12,
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
    borderRadius: 12,
  },
  followButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default ProfileHeader;
