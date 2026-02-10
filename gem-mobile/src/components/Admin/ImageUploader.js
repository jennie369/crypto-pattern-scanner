/**
 * Gemral - Image Uploader Component
 * Upload hinh anh cho lesson
 * Supports: library, camera, drag preview
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  FolderOpen,
  AlertCircle,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import courseImageService from '../../services/courseImageService';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

const ImageUploader = ({
  lessonId,
  folderPath = 'lessons',
  onUploadComplete,
  onOpenMediaLibrary,
  onError,
  disabled = false,
}) => {
  const { alert, AlertComponent } = useCustomAlert();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  // ========== PERMISSIONS ==========
  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert({
        type: 'warning',
        title: 'Can quyen truy cap',
        message: 'Vui long cho phep truy cap thu vien anh trong Cai dat',
        buttons: [{ text: 'OK' }],
      });
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert({
        type: 'warning',
        title: 'Can quyen camera',
        message: 'Vui long cho phep truy cap camera trong Cai dat',
        buttons: [{ text: 'OK' }],
      });
      return false;
    }
    return true;
  };

  // ========== PICK FROM LIBRARY ==========
  const pickFromLibrary = useCallback(async () => {
    if (disabled || uploading) return;
    setError(null);

    try {
      const hasPermission = await requestLibraryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];

        // Validate file
        const validation = courseImageService.validateFile({
          fileSize: asset.fileSize,
          mimeType: asset.mimeType || asset.type,
        });

        if (!validation.valid) {
          setError(validation.error);
          alert({
            type: 'error',
            title: 'Loi',
            message: validation.error,
            buttons: [{ text: 'OK' }],
          });
          return;
        }

        setPreview(asset.uri);
        setSelectedFile(asset);
      }
    } catch (err) {
      console.error('[ImageUploader] Pick error:', err);
      setError('Khong the chon hinh anh');
      alert({
        type: 'error',
        title: 'Loi',
        message: 'Khong the chon hinh anh',
        buttons: [{ text: 'OK' }],
      });
    }
  }, [disabled, uploading, alert]);

  // ========== TAKE PHOTO ==========
  const takePhoto = useCallback(async () => {
    if (disabled || uploading) return;
    setError(null);

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setPreview(asset.uri);
        setSelectedFile(asset);
      }
    } catch (err) {
      console.error('[ImageUploader] Camera error:', err);
      setError('Khong the chup anh');
      alert({
        type: 'error',
        title: 'Loi',
        message: 'Khong the chup anh',
        buttons: [{ text: 'OK' }],
      });
    }
  }, [disabled, uploading, alert]);

  // ========== UPLOAD ==========
  const uploadImage = useCallback(async () => {
    if (!selectedFile || !lessonId) {
      alert({
        type: 'error',
        title: 'Loi',
        message: 'Vui long chon hinh anh va dam bao bai hoc da duoc tao',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      // Get file extension
      const uriParts = selectedFile.uri.split('.');
      const fileExt = uriParts[uriParts.length - 1]?.toLowerCase() || 'png';
      const fileName = `${Date.now()}.${fileExt}`;
      const mimeType = selectedFile.mimeType || `image/${fileExt}`;

      setProgress(30);

      // Upload to storage
      const { path, url } = await courseImageService.uploadFile(
        selectedFile.uri,
        fileName,
        mimeType,
        `${folderPath}/${lessonId}`
      );

      setProgress(70);

      // Callback voi thong tin file
      onUploadComplete?.({
        uri: selectedFile.uri,
        url,
        path,
        fileName,
        mimeType,
        width: selectedFile.width,
        height: selectedFile.height,
        fileSize: selectedFile.fileSize,
      });

      setProgress(100);

      // Reset state sau 500ms
      setTimeout(() => {
        setPreview(null);
        setSelectedFile(null);
        setProgress(0);
      }, 500);
    } catch (err) {
      console.error('[ImageUploader] Upload error:', err);
      const errorMsg = err.message || 'Khong the tai len hinh anh';
      setError(errorMsg);
      onError?.(err);
      alert({
        type: 'error',
        title: 'Loi tai len',
        message: errorMsg,
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setUploading(false);
    }
  }, [selectedFile, lessonId, folderPath, onUploadComplete, onError, alert]);

  // ========== CLEAR PREVIEW ==========
  const clearPreview = useCallback(() => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
  }, []);

  // ========== RENDER ==========
  const isDisabled = disabled || !lessonId;

  return (
    <View style={[styles.container, isDisabled && styles.containerDisabled]}>
      {/* Disabled Message */}
      {isDisabled && !lessonId && (
        <View style={styles.disabledMessage}>
          <AlertCircle size={20} color={COLORS.warning} />
          <Text style={styles.disabledText}>
            Vui long luu bai hoc truoc khi upload hinh anh
          </Text>
        </View>
      )}

      {/* Preview Section */}
      {preview ? (
        <View style={styles.previewSection}>
          <View style={styles.previewContainer}>
            <Image source={{ uri: preview }} style={styles.preview} />
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={clearPreview}
              disabled={uploading}
            >
              <X size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* File Info */}
          {selectedFile && (
            <View style={styles.fileInfo}>
              <Text style={styles.fileInfoText}>
                {selectedFile.width}x{selectedFile.height}
                {selectedFile.fileSize &&
                  ` • ${(selectedFile.fileSize / 1024).toFixed(0)}KB`}
              </Text>
            </View>
          )}

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadConfirmBtn, uploading && styles.btnDisabled]}
            onPress={uploadImage}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.uploadConfirmText}>
                  Dang tai... {progress}%
                </Text>
              </>
            ) : (
              <>
                <Upload size={18} color="#000" />
                <Text style={styles.uploadConfirmText}>Tai len</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Progress Bar */}
          {uploading && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          )}
        </View>
      ) : (
        /* Upload Buttons */
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonsRow}>
            {/* Thu vien */}
            <TouchableOpacity
              style={[styles.uploadBtn, isDisabled && styles.uploadBtnDisabled]}
              onPress={pickFromLibrary}
              disabled={isDisabled}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                ]}
              >
                <ImageIcon size={24} color="#3B82F6" />
              </View>
              <Text style={styles.uploadBtnText}>Thu vien</Text>
              <Text style={styles.uploadBtnHint}>Chon tu dien thoai</Text>
            </TouchableOpacity>

            {/* Chup anh */}
            <TouchableOpacity
              style={[styles.uploadBtn, isDisabled && styles.uploadBtnDisabled]}
              onPress={takePhoto}
              disabled={isDisabled}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: 'rgba(106, 91, 255, 0.2)' },
                ]}
              >
                <Camera size={24} color="#6A5BFF" />
              </View>
              <Text style={styles.uploadBtnText}>Chup anh</Text>
              <Text style={styles.uploadBtnHint}>Dung camera</Text>
            </TouchableOpacity>

            {/* Thu vien chung */}
            {onOpenMediaLibrary && (
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  isDisabled && styles.uploadBtnDisabled,
                ]}
                onPress={onOpenMediaLibrary}
                disabled={isDisabled}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: 'rgba(255, 189, 89, 0.2)' },
                  ]}
                >
                  <FolderOpen size={24} color={COLORS.gold} />
                </View>
                <Text style={styles.uploadBtnText}>Thu vien chung</Text>
                <Text style={styles.uploadBtnHint}>Hinh da upload</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Hint */}
          <Text style={styles.hint}>
            Ho tro: PNG, JPG, SVG, WebP, GIF (toi da 5MB)
          </Text>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GLASS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  disabledMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 165, 2, 0.1)',
  },
  disabledText: {
    color: COLORS.warning,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  buttonsContainer: {
    padding: SPACING.lg,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  uploadBtn: {
    alignItems: 'center',
    minWidth: 90,
    maxWidth: 100,
  },
  uploadBtnDisabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  uploadBtnText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
  uploadBtnHint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
  },
  previewSection: {
    padding: SPACING.md,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  clearBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  fileInfoText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  uploadConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    padding: SPACING.md,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  uploadConfirmText: {
    color: '#000',
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  progressBar: {
    height: 4,
    backgroundColor: GLASS.background,
    borderRadius: 2,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    gap: SPACING.xs,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
});

export default ImageUploader;
