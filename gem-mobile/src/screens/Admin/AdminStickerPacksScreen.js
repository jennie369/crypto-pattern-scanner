/**
 * GEM Mobile - Admin Sticker Packs Management Screen
 * List, create, and manage sticker packs
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import alertService from '../../services/alertService';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import stickerService from '../../services/stickerService';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'trending', label: 'Trending' },
  { id: 'love', label: 'Tình yêu' },
  { id: 'funny', label: 'Hài hước' },
  { id: 'animals', label: 'Động vật' },
  { id: 'cute', label: 'Đáng yêu' },
  { id: 'animated', label: 'Động' },
  { id: 'custom', label: 'Tự tạo' },
];

const AdminStickerPacksScreen = ({ navigation }) => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const data = await stickerService.getPacks(true); // Include inactive
      setPacks(data || []);
    } catch (error) {
      console.error('[AdminStickerPacks] loadPacks error:', error);
      alertService.error('Lỗi', 'Không thể tải danh sách pack');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPacks();
    setRefreshing(false);
  };

  const handleCreatePack = () => {
    navigation.navigate('AdminStickerUpload', { mode: 'create' });
  };

  const handleEditPack = (pack) => {
    navigation.navigate('AdminStickerUpload', { mode: 'edit', pack });
  };

  const handleToggleActive = async (pack) => {
    try {
      await stickerService.updatePack(pack.id, { is_active: !pack.is_active });
      setPacks(prev => prev.map(p =>
        p.id === pack.id ? { ...p, is_active: !p.is_active } : p
      ));
      alertService.success('Thành công', pack.is_active ? 'Đã ẩn pack' : 'Đã hiện pack');
    } catch (error) {
      alertService.error('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleToggleFeatured = async (pack) => {
    try {
      await stickerService.updatePack(pack.id, { is_featured: !pack.is_featured });
      setPacks(prev => prev.map(p =>
        p.id === pack.id ? { ...p, is_featured: !p.is_featured } : p
      ));
    } catch (error) {
      alertService.error('Lỗi', 'Không thể cập nhật');
    }
  };

  const handleDeletePack = (pack) => {
    alertService.confirm(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa pack "${pack.name}"?`,
      async () => {
        try {
          await stickerService.deletePack(pack.id);
          setPacks(prev => prev.filter(p => p.id !== pack.id));
          alertService.success('Thành công', 'Đã xóa pack');
        } catch (error) {
          alertService.error('Lỗi', 'Không thể xóa pack');
        }
      }
    );
  };

  // Filter packs
  const filteredPacks = packs.filter(pack => {
    const matchesSearch = !searchQuery ||
      pack.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.name_vi?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
      pack.category === selectedCategory ||
      (selectedCategory === 'animated' && pack.is_animated);

    return matchesSearch && matchesCategory;
  });

  const renderPackItem = ({ item }) => (
    <View style={styles.packCard}>
      <View style={styles.packHeader}>
        {/* Thumbnail */}
        {item.thumbnail_url ? (
          <Image
            source={{ uri: item.thumbnail_url }}
            style={styles.packThumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.packThumbnail, styles.packThumbnailPlaceholder]}>
            <Package size={24} color={COLORS.textMuted} />
          </View>
        )}

        {/* Info */}
        <View style={styles.packInfo}>
          <Text style={styles.packName}>{item.name}</Text>
          {item.name_vi && (
            <Text style={styles.packNameVi}>{item.name_vi}</Text>
          )}
          <View style={styles.packMeta}>
            <Text style={styles.packCount}>{item.sticker_count || 0} stickers</Text>
            {item.is_animated && (
              <View style={styles.animatedBadge}>
                <Text style={styles.animatedBadgeText}>Dong</Text>
              </View>
            )}
            {!item.is_active && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>An</Text>
              </View>
            )}
          </View>
        </View>

        {/* Featured Star */}
        <TouchableOpacity
          style={styles.featuredButton}
          onPress={() => handleToggleFeatured(item)}
        >
          <Star
            size={20}
            color={item.is_featured ? COLORS.gold : COLORS.textMuted}
            fill={item.is_featured ? COLORS.gold : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.packActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleActive(item)}
        >
          {item.is_active ? (
            <EyeOff size={18} color={COLORS.textMuted} />
          ) : (
            <Eye size={18} color={COLORS.success} />
          )}
          <Text style={styles.actionText}>
            {item.is_active ? 'An' : 'Hien'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditPack(item)}
        >
          <Edit2 size={18} color={COLORS.cyan} />
          <Text style={styles.actionText}>Sua</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeletePack(item)}
        >
          <Trash2 size={18} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Xoa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Quan ly Sticker</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreatePack}
          >
            <Plus size={24} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tim pack..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Category Tabs */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === item.id && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === item.id && styles.categoryTabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />

        {/* Pack List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.gold} size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredPacks}
            renderItem={renderPackItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.gold}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Package size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chưa có sticker pack nào</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreatePack}
                >
                  <Plus size={18} color={COLORS.textPrimary} />
                  <Text style={styles.createButtonText}>Tạo pack mới</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
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
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  categoryTabs: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SPACING.xs,
  },
  categoryTabActive: {
    backgroundColor: COLORS.purple,
  },
  categoryTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  categoryTabTextActive: {
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  packCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: GLASS.background,
  },
  packThumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  packInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  packName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  packNameVi: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  packMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  packCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  animatedBadge: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  animatedBadgeText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  inactiveBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  featuredButton: {
    padding: SPACING.sm,
  },
  packActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  createButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default AdminStickerPacksScreen;
