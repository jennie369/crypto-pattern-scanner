/**
 * Gemral - Upload Sound Screen
 * Feature #5: Upload Sound
 * Screen for uploading new audio to library
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Music,
  Play,
  Pause,
  Image as ImageIcon,
  Upload,
  Check,
  User,
  Tag,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, INPUT } from '../../utils/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import soundService from '../../services/soundService';

const UploadSoundScreen = ({ navigation, route }) => {
  const { alert, AlertComponent } = useCustomAlert();
  const { audioUri, audioName, audioSize } = route.params || {};

  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [coverUri, setCoverUri] = useState(null);
  const [category, setCategory] = useState('other');
  const [isOriginal, setIsOriginal] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const soundRef = useRef(null);
  const categories = soundService.getCategories();

  useEffect(() => {
    if (audioUri) {
      loadAudioInfo();
      // Extract title from filename
      if (audioName) {
        const cleanName = audioName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setTitle(cleanName);
      }
    }

    return () => {
      stopSound();
    };
  }, [audioUri]);

  const loadAudioInfo = async () => {
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false }
      );

      if (status.durationMillis) {
        setDuration(Math.floor(status.durationMillis / 1000));
      }

      soundRef.current = sound;
    } catch (error) {
      console.error('[UploadSound] Load audio error:', error);
    }
  };

  const playPreview = async () => {
    try {
      if (isPlaying) {
        await soundRef.current?.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current?.playAsync();
        setIsPlaying(true);

        soundRef.current?.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('[UploadSound] Play error:', error);
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
  };

  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[UploadSound] Pick image error:', error);
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      alert({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập tên âm thanh',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    if (!audioUri) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không tìm thấy file audio',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    setUploading(true);
    await stopSound();

    const result = await soundService.uploadSound({
      title: title.trim(),
      artistName: artistName.trim() || null,
      audioUri,
      coverUri,
      duration,
      category,
      isOriginal,
    });

    setUploading(false);

    if (result.success) {
      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Âm thanh đã được tải lên',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } else {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: result.error || 'Không thể tải lên âm thanh',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tải lên âm thanh</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Audio Preview Card */}
          <View style={styles.previewCard}>
            <TouchableOpacity style={styles.coverSection} onPress={pickCoverImage}>
              {coverUri ? (
                <Image source={{ uri: coverUri }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <ImageIcon size={32} color={COLORS.textMuted} />
                  <Text style={styles.coverText}>Thêm ảnh bìa</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.audioInfo}>
              <View style={styles.audioMeta}>
                <Music size={16} color={COLORS.cyan} />
                <Text style={styles.audioName} numberOfLines={1}>
                  {audioName || 'Audio file'}
                </Text>
              </View>
              <Text style={styles.audioDetails}>
                {soundService.formatDuration(duration)} • {formatFileSize(audioSize)}
              </Text>

              <TouchableOpacity
                style={styles.playButton}
                onPress={playPreview}
              >
                {isPlaying ? (
                  <Pause size={20} color={COLORS.textPrimary} />
                ) : (
                  <Play size={20} color={COLORS.textPrimary} />
                )}
                <Text style={styles.playButtonText}>
                  {isPlaying ? 'Dừng' : 'Nghe thử'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên âm thanh *</Text>
              <View style={styles.inputWrapper}>
                <Music size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập tên âm thanh"
                  placeholderTextColor={COLORS.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </View>
            </View>

            {/* Artist Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên nghệ sĩ</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập tên nghệ sĩ (tùy chọn)"
                  placeholderTextColor={COLORS.textMuted}
                  value={artistName}
                  onChangeText={setArtistName}
                  maxLength={100}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thể loại</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      category === cat.id && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat.id && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Original Toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsOriginal(!isOriginal)}
            >
              <View style={styles.toggleInfo}>
                <Sparkles size={20} color={isOriginal ? COLORS.cyan : COLORS.textMuted} />
                <View>
                  <Text style={styles.toggleTitle}>Nội dung gốc (Original)</Text>
                  <Text style={styles.toggleDesc}>
                    Đánh dấu nếu đây là sáng tạo của bạn
                  </Text>
                </View>
              </View>
              <View style={[styles.checkbox, isOriginal && styles.checkboxActive]}>
                {isOriginal && <Check size={14} color={COLORS.textPrimary} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <LinearGradient
              colors={uploading ? ['#444', '#333'] : GRADIENTS.primaryButton}
              style={styles.uploadButtonGradient}
            >
              {uploading ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <>
                  <Upload size={20} color={COLORS.textPrimary} />
                  <Text style={styles.uploadButtonText}>Tải lên</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.termsText}>
            Bằng cách tải lên, bạn xác nhận rằng bạn sở hữu quyền sử dụng nội dung này
            và đồng ý với điều khoản sử dụng của Gemral.
          </Text>
        </ScrollView>
        {AlertComponent}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coverSection: {
    marginRight: SPACING.md,
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  coverPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderStyle: 'dashed',
  },
  coverText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  audioInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  audioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  audioName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  audioDetails: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  playButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  formSection: {
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.sm,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
  },
  textInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
  },
  categoryList: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  categoryChipTextActive: {
    color: COLORS.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  toggleTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  toggleDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.cyan,
    borderColor: COLORS.cyan,
  },
  uploadButton: {
    marginTop: SPACING.xl,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  uploadButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
});

export default UploadSoundScreen;
