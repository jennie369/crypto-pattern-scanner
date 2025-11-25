/**
 * GEM Platform - Edit Profile Modal Component
 * Modal for editing user profile information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Camera, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS, INPUT } from '../../../utils/tokens';
import { forumService } from '../../../services/forumService';

const EditProfileModal = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile && isOpen) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || profile.email?.split('@')[0] || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile, isOpen]);

  // Handle avatar change
  const handleChangeAvatar = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Cần quyền truy cập thư viện ảnh!');
        return;
      }

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const uploadResult = await forumService.uploadAvatar(result.assets[0].uri);

        if (uploadResult.success) {
          setAvatarUrl(uploadResult.url);
        } else {
          alert('Không thể tải ảnh lên. Vui lòng thử lại.');
        }
        setUploading(false);
      }
    } catch (error) {
      console.error('[EditProfile] Avatar change error:', error);
      setUploading(false);
      alert('Có lỗi xảy ra khi chọn ảnh.');
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!fullName.trim()) {
      alert('Vui lòng nhập tên hiển thị');
      return;
    }

    setSaving(true);
    console.log('[EditProfile] Saving profile...');

    try {
      const updateData = {
        full_name: fullName.trim(),
        username: username.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
      };

      console.log('[EditProfile] Update data:', updateData);

      const result = await forumService.updateProfile(updateData);
      console.log('[EditProfile] Result:', result);

      if (result.success) {
        console.log('[EditProfile] Profile updated successfully');
        // Pass updated data back
        onSave?.({
          ...profile,
          ...updateData,
          ...result.data,
        });
        alert('Đã cập nhật hồ sơ thành công!');
        onClose();
      } else {
        console.error('[EditProfile] Update failed:', result.error);
        alert('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('[EditProfile] Save error:', error);
      alert('Có lỗi xảy ra khi lưu: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={COLORS.textPrimary} />
                ) : (
                  <Check size={24} color={COLORS.gold} />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Avatar */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={handleChangeAvatar}
                  disabled={uploading}
                >
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                  ) : (
                    <LinearGradient
                      colors={GRADIENTS.avatar}
                      style={styles.avatarGradient}
                    >
                      <Text style={styles.avatarText}>
                        {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                      </Text>
                    </LinearGradient>
                  )}

                  {/* Camera overlay */}
                  <View style={styles.cameraOverlay}>
                    {uploading ? (
                      <ActivityIndicator size="small" color={COLORS.textPrimary} />
                    ) : (
                      <Camera size={20} color={COLORS.textPrimary} />
                    )}
                  </View>
                </TouchableOpacity>

                <Text style={styles.changePhotoText}>Đổi ảnh đại diện</Text>
              </View>

              {/* Form Fields */}
              <View style={styles.formSection}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tên hiển thị</Text>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Nhập tên của bạn"
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={50}
                  />
                </View>

                {/* Username */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <View style={styles.usernameInput}>
                    <Text style={styles.usernamePrefix}>@</Text>
                    <TextInput
                      style={[styles.input, styles.inputWithPrefix]}
                      value={username}
                      onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="username"
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={30}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Bio */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Giới thiệu</Text>
                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Viết vài dòng về bản thân..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                  <Text style={styles.charCount}>{bio.length}/200</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderBottomWidth: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  saveButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },

  // Content
  content: {
    padding: SPACING.lg,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    overflow: 'hidden',
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
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginTop: SPACING.sm,
  },

  // Form Section
  formSection: {
    gap: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    padding: INPUT.padding,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
  },
  usernameInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
  },
  usernamePrefix: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    paddingLeft: INPUT.padding,
  },
  inputWithPrefix: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 4,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
});

export default EditProfileModal;
