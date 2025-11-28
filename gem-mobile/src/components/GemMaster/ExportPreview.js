/**
 * Gemral - Export Preview Component
 *
 * Shows preview of export image before saving/sharing
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Download, Share2, Check } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/tokens';
import exportService from '../../services/exportService';
import { getTemplateComponent } from '../../templates';
import * as Haptics from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ExportPreview = ({
  visible,
  onClose,
  templateId,
  messageData,
  userTier = 'FREE',
}) => {
  const templateRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUri, setExportedUri] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const showWatermark = exportService.shouldHaveWatermark(userTier);
  const TemplateComponent = getTemplateComponent(templateId);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setExportedUri(null);
      setSaveSuccess(false);
    }
  }, [visible]);

  const handleCapture = async () => {
    if (!templateRef.current) return null;

    try {
      const uri = await exportService.captureComponent(templateRef.current, {
        width: 1080,
        height: 1920,
      });
      setExportedUri(uri);
      return uri;
    } catch (error) {
      console.error('Capture error:', error);
      throw error;
    }
  };

  const handleSaveToGallery = async () => {
    setIsExporting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let uri = exportedUri;
      if (!uri) {
        uri = await handleCapture();
      }

      await exportService.saveToGallery(uri);

      setSaveSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Saved!',
        'Image saved to your gallery in "Gemral" album.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Save error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (error.message.includes('permission')) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to save images.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to save image. Please try again.', [
          { text: 'OK' },
        ]);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let uri = exportedUri;
      if (!uri) {
        uri = await handleCapture();
      }

      await exportService.shareImage(uri, {
        dialogTitle: 'Share GEM Reading',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Share error:', error);

      if (!error.message.includes('dismiss')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to share image. Please try again.', [
          { text: 'OK' },
        ]);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Scale factor for preview - fit in available space
  const availableHeight = SCREEN_HEIGHT - 250; // Header + buttons + padding
  const availableWidth = SCREEN_WIDTH - 40;

  // Calculate scale to fit the template (1080x1920) into available space
  const scaleWidth = availableWidth / 1080;
  const scaleHeight = availableHeight / 1920;
  const previewScale = Math.min(scaleWidth, scaleHeight);

  // Calculate scaled dimensions for container
  const scaledWidth = 1080 * previewScale;
  const scaledHeight = 1920 * previewScale;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(5, 4, 11, 0.98)', 'rgba(15, 16, 48, 0.98)']}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Preview</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              disabled={isExporting}
            >
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Preview Area - Centered */}
          <View style={styles.previewWrapper}>
            <View
              style={[
                styles.previewContainer,
                {
                  width: scaledWidth,
                  height: scaledHeight,
                },
              ]}
            >
              {/* Scaled template container */}
              <View
                style={{
                  width: 1080,
                  height: 1920,
                  transform: [{ scale: previewScale }],
                  transformOrigin: 'top left',
                }}
              >
                <TemplateComponent
                  ref={templateRef}
                  data={messageData}
                  showWatermark={showWatermark}
                />
              </View>
            </View>
          </View>

          {/* Watermark Info */}
          {showWatermark && (
            <View style={styles.watermarkInfo}>
              <Text style={styles.watermarkInfoText}>
                Upgrade to remove watermark
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Save Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSaveToGallery}
              disabled={isExporting}
              activeOpacity={0.8}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color={COLORS.bgMid} />
              ) : saveSuccess ? (
                <>
                  <Check size={20} color={COLORS.bgMid} />
                  <Text style={styles.saveButtonText}>Saved!</Text>
                </>
              ) : (
                <>
                  <Download size={20} color={COLORS.bgMid} />
                  <Text style={styles.saveButtonText}>Save to Gallery</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
              disabled={isExporting}
              activeOpacity={0.8}
            >
              <Share2 size={20} color={COLORS.textPrimary} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 50, // Safe area
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Preview
  previewWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: '#05040B',
  },

  // Watermark Info
  watermarkInfo: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  watermarkInfoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: '500',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingBottom: 34, // Safe area
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: COLORS.gold,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.bgMid,
  },
  shareButton: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default ExportPreview;
