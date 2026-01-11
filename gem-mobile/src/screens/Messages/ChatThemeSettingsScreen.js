/**
 * ChatThemeSettingsScreen
 * Screen for selecting chat theme for a conversation
 *
 * Features:
 * - 8 preset themes with preview
 * - Custom background upload
 * - Real-time preview
 * - Persists to database
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

// Components
import ThemePicker from '../../components/Messages/ThemePicker';

// Hooks
import useChatTheme from '../../hooks/useChatTheme';

// Services
import { imageService } from '../../services/imageService';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../utils/tokens';

export default function ChatThemeSettingsScreen({ route, navigation }) {
  const { conversationId } = route.params;
  const insets = useSafeAreaInsets();

  // Theme hook
  const {
    theme,
    themeId,
    customBackground,
    isLoading,
    setTheme,
    setBackground,
    resetTheme,
  } = useChatTheme(conversationId);

  const [isUploadingBackground, setIsUploadingBackground] = useState(false);

  // Handle theme selection
  const handleSelectTheme = useCallback(async (newThemeId) => {
    const result = await setTheme(newThemeId);
    if (!result?.success) {
      Alert.alert('Lỗi', 'Không thể thay đổi chủ đề. Vui lòng thử lại.');
    }
  }, [setTheme]);

  // Handle custom background upload
  const handleUploadBackground = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setIsUploadingBackground(true);

        // Upload image
        const imageUrl = await imageService.uploadImage(
          result.assets[0].uri,
          'chat-backgrounds'
        );

        // Set as background
        const setResult = await setBackground(imageUrl);
        if (!setResult?.success) {
          throw new Error('Failed to set background');
        }
      }
    } catch (error) {
      console.error('Error uploading background:', error);
      Alert.alert('Lỗi', 'Không thể tải lên hình nền. Vui lòng thử lại.');
    } finally {
      setIsUploadingBackground(false);
    }
  }, [setBackground]);

  // Handle remove custom background
  const handleRemoveBackground = useCallback(async () => {
    Alert.alert(
      'Xóa hình nền',
      'Bạn có chắc muốn xóa hình nền tùy chỉnh?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const result = await setBackground(null);
            if (!result?.success) {
              Alert.alert('Lỗi', 'Không thể xóa hình nền.');
            }
          },
        },
      ]
    );
  }, [setBackground]);

  // Handle reset to default
  const handleReset = useCallback(async () => {
    Alert.alert(
      'Đặt lại mặc định',
      'Bạn có chắc muốn đặt lại chủ đề mặc định?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt lại',
          onPress: async () => {
            await resetTheme();
            await setBackground(null);
          },
        },
      ]
    );
  }, [resetTheme, setBackground]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chủ đề cuộc trò chuyện</Text>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Custom Background Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hình nền tùy chỉnh</Text>

        <View style={styles.backgroundActions}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadBackground}
            disabled={isUploadingBackground}
          >
            {isUploadingBackground ? (
              <ActivityIndicator size="small" color={COLORS.purple} />
            ) : (
              <>
                <Ionicons name="image-outline" size={20} color={COLORS.purple} />
                <Text style={styles.uploadButtonText}>
                  {customBackground ? 'Thay đổi' : 'Tải lên'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {customBackground && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveBackground}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={styles.removeButtonText}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Theme Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chọn chủ đề</Text>
      </View>

      <ThemePicker
        selectedTheme={themeId}
        onSelectTheme={handleSelectTheme}
      />

      {/* Safe area bottom */}
      <View style={{ height: insets.bottom }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginRight: 44,
  },
  resetButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },

  // Background Actions
  backgroundActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  uploadButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  removeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
