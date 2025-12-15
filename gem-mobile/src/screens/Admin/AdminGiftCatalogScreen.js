/**
 * Gemral - Admin Gift Catalog Screen
 * Manage gift catalog - add, edit, delete gifts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Plus,
  Edit3,
  Trash2,
  Gift,
  Gem,
  Save,
  X,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { supabase } from '../../services/supabase';
import { useTabBar } from '../../contexts/TabBarContext';
import alertService from '../../services/alertService';

const CATEGORIES = [
  { id: 'standard', name: 'Cơ bản', color: '#4CAF50' },
  { id: 'premium', name: 'Cao cấp', color: '#2196F3' },
  { id: 'luxury', name: 'Sang trọng', color: '#9C27B0' },
  { id: 'animated', name: 'Có hiệu ứng', color: '#FF9800' },
  { id: 'limited', name: 'Giới hạn', color: '#F44336' },
];

const AdminGiftCatalogScreen = ({ navigation }) => {
  const { alert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gifts, setGifts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    gem_cost: '',
    category: 'standard',
    is_animated: false,
    is_active: true,
    display_order: 0,
  });

  const { hideTabBar, showTabBar } = useTabBar();

  useEffect(() => {
    hideTabBar();
    return () => showTabBar();
  }, []);

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_catalog')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setGifts(data || []);
    } catch (error) {
      console.error('[AdminGift] Load error:', error);
      alertService.error('Lỗi', 'Không thể tải danh sách quà');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGifts();
    setRefreshing(false);
  }, []);

  const openAddModal = () => {
    setEditingGift(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      gem_cost: '',
      category: 'standard',
      is_animated: false,
      is_active: true,
      display_order: gifts.length + 1,
    });
    setModalVisible(true);
  };

  const openEditModal = (gift) => {
    setEditingGift(gift);
    setFormData({
      name: gift.name,
      description: gift.description || '',
      image_url: gift.image_url,
      gem_cost: gift.gem_cost.toString(),
      category: gift.category,
      is_animated: gift.is_animated,
      is_active: gift.is_active,
      display_order: gift.display_order,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Validate
    if (!formData.name.trim()) {
      alertService.warning('Thiếu thông tin', 'Vui lòng nhập tên quà');
      return;
    }
    if (!formData.image_url.trim()) {
      alertService.warning('Thiếu thông tin', 'Vui lòng nhập URL hình ảnh');
      return;
    }
    if (!formData.gem_cost || parseInt(formData.gem_cost) <= 0) {
      alertService.warning('Thiếu thông tin', 'Vui lòng nhập giá gems hợp lệ');
      return;
    }

    setSaving(true);
    try {
      const giftData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim(),
        gem_cost: parseInt(formData.gem_cost),
        category: formData.category,
        is_animated: formData.is_animated,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order) || 0,
      };

      if (editingGift) {
        // Update existing
        const { error } = await supabase
          .from('gift_catalog')
          .update(giftData)
          .eq('id', editingGift.id);

        if (error) throw error;
        alertService.success('Thành công', 'Đã cập nhật quà');
      } else {
        // Insert new
        const { error } = await supabase
          .from('gift_catalog')
          .insert(giftData);

        if (error) throw error;
        alertService.success('Thành công', 'Đã thêm quà mới');
      }

      setModalVisible(false);
      loadGifts();
    } catch (error) {
      console.error('[AdminGift] Save error:', error);
      alertService.error('Lỗi', 'Không thể lưu quà: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (gift) => {
    alert({
      type: 'warning',
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa "${gift.name}"?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('gift_catalog')
                .delete()
                .eq('id', gift.id);

              if (error) throw error;
              alertService.success('Đã xóa', `Đã xóa "${gift.name}"`);
              loadGifts();
            } catch (error) {
              console.error('[AdminGift] Delete error:', error);
              alertService.error('Lỗi', 'Không thể xóa quà');
            }
          },
        },
      ],
    });
  };

  const toggleActive = async (gift) => {
    try {
      const { error } = await supabase
        .from('gift_catalog')
        .update({ is_active: !gift.is_active })
        .eq('id', gift.id);

      if (error) throw error;
      loadGifts();
    } catch (error) {
      console.error('[AdminGift] Toggle error:', error);
    }
  };

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  };

  const renderGiftItem = ({ item }) => {
    const category = getCategoryInfo(item.category);

    return (
      <View style={[styles.giftCard, !item.is_active && styles.giftCardInactive]}>
        {/* Gift Image */}
        <View style={styles.giftImageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.giftImage} />
          ) : (
            <Gift size={32} color={COLORS.gold} />
          )}
          {item.is_animated && (
            <View style={styles.animatedBadge}>
              <Sparkles size={10} color={COLORS.gold} />
            </View>
          )}
        </View>

        {/* Gift Info */}
        <View style={styles.giftInfo}>
          <View style={styles.giftHeader}>
            <Text style={styles.giftName}>{item.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: `${category.color}30` }]}>
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text style={styles.giftDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}

          <View style={styles.giftFooter}>
            <View style={styles.gemPrice}>
              <Gem size={14} color={COLORS.purple} />
              <Text style={styles.gemText}>{item.gem_cost}</Text>
            </View>

            <View style={styles.giftActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleActive(item)}
              >
                {item.is_active ? (
                  <Eye size={18} color={COLORS.green} />
                ) : (
                  <EyeOff size={18} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(item)}
              >
                <Edit3 size={18} color={COLORS.cyan} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item)}
              >
                <Trash2 size={18} color={COLORS.red} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <View style={styles.loadingContainer}>
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Quà tặng</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Plus size={24} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{gifts.length}</Text>
            <Text style={styles.statLabel}>Tổng quà</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{gifts.filter(g => g.is_active).length}</Text>
            <Text style={styles.statLabel}>Đang hoạt động</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{gifts.filter(g => g.is_animated).length}</Text>
            <Text style={styles.statLabel}>Có hiệu ứng</Text>
          </View>
        </View>

        {/* Gift List */}
        <FlatList
          data={gifts}
          renderItem={renderGiftItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: CONTENT_BOTTOM_PADDING },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.purple}
            />
          }
        />

        {/* Add/Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingGift ? 'Chỉnh sửa quà' : 'Thêm quà mới'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Name */}
                <Text style={styles.inputLabel}>Tên quà *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="VD: Trái Tim"
                  placeholderTextColor={COLORS.textMuted}
                />

                {/* Description */}
                <Text style={styles.inputLabel}>Mô tả</Text>
                <TextInput
                  style={styles.input}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="VD: Gửi tình yêu"
                  placeholderTextColor={COLORS.textMuted}
                />

                {/* Image URL */}
                <Text style={styles.inputLabel}>URL hình ảnh *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.image_url}
                  onChangeText={(text) => setFormData({ ...formData, image_url: text })}
                  placeholder="https://..."
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                />

                {/* Image Preview */}
                {formData.image_url ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: formData.image_url }} style={styles.previewImage} />
                  </View>
                ) : null}

                {/* Gem Cost */}
                <Text style={styles.inputLabel}>Giá (gems) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.gem_cost}
                  onChangeText={(text) => setFormData({ ...formData, gem_cost: text })}
                  placeholder="VD: 100"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />

                {/* Category */}
                <Text style={styles.inputLabel}>Danh mục</Text>
                <View style={styles.categoryPicker}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        formData.category === cat.id && styles.categoryOptionActive,
                        { borderColor: cat.color },
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat.id })}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.category === cat.id && { color: cat.color },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Toggles */}
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggle, formData.is_animated && styles.toggleActive]}
                    onPress={() => setFormData({ ...formData, is_animated: !formData.is_animated })}
                  >
                    <Sparkles size={16} color={formData.is_animated ? COLORS.gold : COLORS.textMuted} />
                    <Text style={[styles.toggleText, formData.is_animated && styles.toggleTextActive]}>
                      Có hiệu ứng
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggle, formData.is_active && styles.toggleActive]}
                    onPress={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  >
                    <Eye size={16} color={formData.is_active ? COLORS.green : COLORS.textMuted} />
                    <Text style={[styles.toggleText, formData.is_active && styles.toggleTextActive]}>
                      Hoạt động
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Display Order */}
                <Text style={styles.inputLabel}>Thứ tự hiển thị</Text>
                <TextInput
                  style={styles.input}
                  value={formData.display_order.toString()}
                  onChangeText={(text) => setFormData({ ...formData, display_order: parseInt(text) || 0 })}
                  placeholder="VD: 1"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </ScrollView>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <>
                    <Save size={20} color={COLORS.textPrimary} />
                    <Text style={styles.saveButtonText}>
                      {editingGift ? 'Cập nhật' : 'Thêm mới'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {AlertComponent}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.md,
  },
  giftCard: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  giftCardInactive: {
    opacity: 0.5,
  },
  giftImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  giftImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  animatedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.bgDarkest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftInfo: {
    flex: 1,
  },
  giftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  giftName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  giftDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  giftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.purple,
  },
  giftActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgDarkest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalBody: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imagePreview: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  categoryOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryOptionText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  toggleText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  toggleTextActive: {
    color: COLORS.textPrimary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purple,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default AdminGiftCatalogScreen;
