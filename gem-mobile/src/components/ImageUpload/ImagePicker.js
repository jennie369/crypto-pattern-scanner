/**
 * Gemral - Image Picker Component
 * Select images from library or camera
 */

import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { Image, Camera, Upload } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

const ImagePickerComponent = ({
  onImageSelected,
  maxImages = 1,
  disabled = false,
  compact = false
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: SPACING.md,
      padding: SPACING.md
    },
    compactContainer: {
      flexDirection: 'row',
      gap: SPACING.sm
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      padding: SPACING.lg,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    compactButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    disabledButton: {
      opacity: 0.5
    },
    buttonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary
    },
    disabledText: {
      color: colors.textMuted
    }
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const [loading, setLoading] = useState(false);
  const { alert, AlertComponent } = useCustomAlert();

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert({
        type: 'warning',
        title: 'Cần quyền truy cập',
        message: 'Vui lòng cho phép truy cập thư viện ảnh để tải ảnh lên.',
      });
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert({
        type: 'warning',
        title: 'Cần quyền truy cập',
        message: 'Vui lòng cho phép sử dụng camera.',
      });
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (disabled || loading) return;

    try {
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) return;

      setLoading(true);

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: maxImages > 1,
        selectionLimit: maxImages,
        quality: 1,
        allowsEditing: false,
        exif: true
      });

      if (!result.canceled && result.assets?.length > 0) {
        onImageSelected(result.assets);
      }

    } catch (error) {
      console.error('Image picker error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể chọn ảnh. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (disabled || loading) return;

    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) return;

      setLoading(true);

      const result = await ExpoImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: false,
        exif: true
      });

      if (!result.canceled && result.assets?.length > 0) {
        onImageSelected(result.assets);
      }

    } catch (error) {
      console.error('Camera error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể mở camera. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <>
        <View style={styles.compactContainer}>
          <TouchableOpacity
            style={[styles.compactButton, disabled && styles.disabledButton]}
            onPress={pickImage}
            disabled={disabled || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.purple} />
            ) : (
              <Image size={22} color={disabled ? colors.textMuted : colors.purple} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.compactButton, disabled && styles.disabledButton]}
            onPress={takePhoto}
            disabled={disabled || loading}
          >
            <Camera size={22} color={disabled ? colors.textMuted : colors.purple} />
          </TouchableOpacity>
        </View>
        {AlertComponent}
      </>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.disabledButton]}
          onPress={pickImage}
          disabled={disabled || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.purple} />
          ) : (
            <>
              <Image size={24} color={disabled ? colors.textMuted : colors.purple} />
              <Text style={[styles.buttonText, disabled && styles.disabledText]}>
                Thư viện
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, disabled && styles.disabledButton]}
          onPress={takePhoto}
          disabled={disabled || loading}
        >
          <Camera size={24} color={disabled ? colors.textMuted : colors.purple} />
          <Text style={[styles.buttonText, disabled && styles.disabledText]}>
            Camera
          </Text>
        </TouchableOpacity>
      </View>
      {AlertComponent}
    </>
  );
};

export default ImagePickerComponent;
