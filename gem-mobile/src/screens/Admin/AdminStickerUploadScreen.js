/**
 * GEM Mobile - Admin Sticker Upload Screen
 * Create/edit sticker packs and upload stickers
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Plus,
  Upload,
  X,
  Save,
  Package,
  Image as ImageIcon,
} from 'lucide-react-native';
import alertService from '../../services/alertService';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import stickerService from '../../services/stickerService';

const CATEGORIES = [
  { id: 'trending', label: 'Trending' },
  { id: 'love', label: 'Tinh yeu' },
  { id: 'funny', label: 'Hai huoc' },
  { id: 'animals', label: 'Dong vat' },
  { id: 'cute', label: 'Dang yeu' },
  { id: 'memes', label: 'Meme' },
  { id: 'holidays', label: 'Le hoi' },
  { id: 'custom', label: 'Tu tao' },
];

const AdminStickerUploadScreen = ({ navigation, route }) => {
  const { mode = 'create', pack } = route.params || {};
  const isEditMode = mode === 'edit';

  // Pack form state
  const [name, setName] = useState(pack?.name || '');
  const [nameVi, setNameVi] = useState(pack?.name_vi || '');
  const [description, setDescription] = useState(pack?.description || '');
  const [category, setCategory] = useState(pack?.category || 'custom');
  const [isAnimated, setIsAnimated] = useState(pack?.is_animated || false);
  const [thumbnailUri, setThumbnailUri] = useState(pack?.thumbnail_url || null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Stickers state
  const [stickers, setStickers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pick thumbnail
  const handlePickThumbnail = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alertService.warning('Can cap quyen', 'Vui long cho phep truy cap thu vien anh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setThumbnailUri(result.assets[0].uri);
        setThumbnailFile(result.assets[0]);
      }
    } catch (error) {
      alertService.error('Loi', 'Khong the chon anh');
    }
  };

  // Pick stickers
  const handlePickStickers = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alertService.warning('Can cap quyen', 'Vui long cho phep truy cap thu vien anh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 20,
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const newStickers = result.assets.map((asset, index) => ({
          id: `new-${Date.now()}-${index}`,
          uri: asset.uri,
          file: asset,
          name: `sticker-${stickers.length + index + 1}`,
          keywords: [],
        }));
        setStickers(prev => [...prev, ...newStickers]);
      }
    } catch (error) {
      alertService.error('Loi', 'Khong the chon anh');
    }
  };

  // Remove sticker from list
  const handleRemoveSticker = (stickerId) => {
    setStickers(prev => prev.filter(s => s.id !== stickerId));
  };

  // Save pack
  const handleSave = async () => {
    if (!name.trim()) {
      alertService.warning('Thieu thong tin', 'Vui long nhap ten pack');
      return;
    }

    setSaving(true);
    try {
      let packId = pack?.id;

      // Create or update pack
      if (isEditMode) {
        await stickerService.updatePack(packId, {
          name,
          name_vi: nameVi,
          description,
          category,
          is_animated: isAnimated,
        });

        // Upload new thumbnail if changed
        if (thumbnailFile) {
          const thumbnailUrl = await stickerService.uploadPackThumbnail(packId, thumbnailFile);
          await stickerService.updatePack(packId, { thumbnail_url: thumbnailUrl });
        }
      } else {
        // Create new pack
        const newPack = await stickerService.createPack({
          name,
          name_vi: nameVi,
          description,
          category,
          is_animated: isAnimated,
        });
        packId = newPack.id;

        // Upload thumbnail
        if (thumbnailFile) {
          const thumbnailUrl = await stickerService.uploadPackThumbnail(packId, thumbnailFile);
          await stickerService.updatePack(packId, { thumbnail_url: thumbnailUrl });
        }
      }

      // Upload stickers
      if (stickers.length > 0) {
        setUploading(true);
        for (const sticker of stickers) {
          if (sticker.file) {
            await stickerService.uploadSticker(packId, sticker.file, {
              name: sticker.name,
              keywords: sticker.keywords,
            });
          }
        }
      }

      alertService.success('Thanh cong', isEditMode ? 'Da cap nhat pack' : 'Da tao pack moi');
      navigation.goBack();
    } catch (error) {
      console.error('[AdminStickerUpload] save error:', error);
      alertService.error('Loi', 'Khong the luu pack');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.dark} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Sua Pack' : 'Tao Pack Moi'}
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.gold} size="small" />
            ) : (
              <Save size={24} color={COLORS.gold} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Thumbnail */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thumbnail</Text>
            <TouchableOpacity
              style={styles.thumbnailPicker}
              onPress={handlePickThumbnail}
            >
              {thumbnailUri ? (
                <Image
                  source={{ uri: thumbnailUri }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <ImageIcon size={32} color={COLORS.textMuted} />
                  <Text style={styles.thumbnailPlaceholderText}>Chon anh</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Pack Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ten Pack (English)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Cute Cat"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ten Pack (Tieng Viet)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Meo De Thuong"
              placeholderTextColor={COLORS.textMuted}
              value={nameVi}
              onChangeText={setNameVi}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mo ta</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Mo ta pack sticker..."
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danh muc</Text>
            <FlatList
              data={CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    category === item.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(item.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === item.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>

          {/* Animated Toggle */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsAnimated(!isAnimated)}
            >
              <Text style={styles.toggleLabel}>Sticker dong (Lottie/GIF)</Text>
              <View style={[styles.toggle, isAnimated && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isAnimated && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Stickers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Stickers ({stickers.length})
              </Text>
              <TouchableOpacity
                style={styles.addStickerButton}
                onPress={handlePickStickers}
              >
                <Plus size={18} color={COLORS.gold} />
                <Text style={styles.addStickerText}>Them</Text>
              </TouchableOpacity>
            </View>

            {stickers.length > 0 ? (
              <View style={styles.stickerGrid}>
                {stickers.map((sticker) => (
                  <View key={sticker.id} style={styles.stickerItem}>
                    <Image
                      source={{ uri: sticker.uri }}
                      style={styles.stickerImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveSticker(sticker.id)}
                    >
                      <X size={14} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStickers}>
                <Package size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyStickersText}>
                  Chua co sticker nao
                </Text>
              </View>
            )}
          </View>

          {/* Upload Progress */}
          {uploading && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color={COLORS.gold} size="small" />
              <Text style={styles.uploadingText}>Dang upload stickers...</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  thumbnailPicker: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderStyle: 'dashed',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  thumbnailPlaceholderText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.purple,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  categoryChipTextActive: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.purple,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textMuted,
  },
  toggleThumbActive: {
    backgroundColor: COLORS.textPrimary,
    marginLeft: 'auto',
  },
  addStickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  addStickerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  stickerItem: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStickers: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  emptyStickersText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 12,
    gap: SPACING.sm,
  },
  uploadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
});

export default AdminStickerUploadScreen;
