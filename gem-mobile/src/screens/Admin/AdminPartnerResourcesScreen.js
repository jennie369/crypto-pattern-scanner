/**
 * AdminPartnerResourcesScreen
 * Admin screen to manage partner resources (banners, creatives, documents, etc.)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  FileText,
  Video,
  Package,
  Calendar,
  Star,
  Edit3,
  Trash2,
  Download,
  Eye,
  X,
  Upload,
  Check,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { supabase } from '../../services/supabase';
import RESOURCE_SERVICE, { RESOURCE_TYPES, RESOURCE_ACCESS_LEVELS } from '../../services/resourceService';

// Type config
const TYPE_CONFIG = {
  banner: { icon: ImageIcon, color: '#FF9800', label: 'Banner' },
  creative: { icon: ImageIcon, color: '#E91E63', label: 'Creative' },
  video: { icon: Video, color: '#F44336', label: 'Video' },
  document: { icon: FileText, color: '#2196F3', label: 'Tài liệu' },
  template: { icon: Package, color: '#9C27B0', label: 'Template' },
  tool: { icon: Package, color: '#00BCD4', label: 'Công cụ' },
  event: { icon: Calendar, color: '#4CAF50', label: 'Sự kiện' },
};

const ACCESS_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'ctv_only', label: 'CTV' },
  { key: 'kol_only', label: 'KOL' },
  { key: 'gold_plus', label: 'Gold+' },
  { key: 'platinum_plus', label: 'Platinum+' },
  { key: 'diamond_only', label: 'Diamond' },
];

// Resource Card Component
const ResourceCard = ({ resource, onEdit, onDelete, onToggleFeatured }) => {
  const typeConfig = TYPE_CONFIG[resource.resource_type] || TYPE_CONFIG.document;
  const TypeIcon = typeConfig.icon;

  return (
    <View style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <View style={[styles.typeIcon, { backgroundColor: typeConfig.color + '20' }]}>
          <TypeIcon size={20} color={typeConfig.color} />
        </View>
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceTitle} numberOfLines={1}>{resource.title}</Text>
          <Text style={styles.resourceType}>{typeConfig.label}</Text>
        </View>
        {resource.is_featured && (
          <View style={styles.featuredBadge}>
            <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
          </View>
        )}
      </View>

      {resource.thumbnail_url && (
        <Image source={{ uri: resource.thumbnail_url }} style={styles.resourceThumbnail} />
      )}

      <Text style={styles.resourceDescription} numberOfLines={2}>
        {resource.description || 'Không có mô tả'}
      </Text>

      <View style={styles.resourceMeta}>
        <View style={styles.metaItem}>
          <Eye size={12} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{resource.download_count || 0} lượt tải</Text>
        </View>
        <View style={[styles.accessBadge, { backgroundColor: COLORS.info + '20' }]}>
          <Text style={[styles.accessBadgeText, { color: COLORS.info }]}>
            {RESOURCE_SERVICE.getAccessLevelName(resource.access_level)}
          </Text>
        </View>
      </View>

      <View style={styles.resourceActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onToggleFeatured(resource)}
        >
          <Star
            size={16}
            color={resource.is_featured ? COLORS.gold : COLORS.textMuted}
            fill={resource.is_featured ? COLORS.gold : 'transparent'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(resource)}>
          <Edit3 size={16} color={COLORS.gold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(resource)}>
          <Trash2 size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main Component
const AdminPartnerResourcesScreen = () => {
  const navigation = useNavigation();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedType, setSelectedType] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'banner',
    access_level: 'all',
    file_url: '',
    thumbnail_url: '',
    is_featured: false,
  });

  // Load resources
  const loadResources = useCallback(async () => {
    try {
      let query = supabase
        .from('partnership_resources')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedType !== 'all') {
        query = query.eq('resource_type', selectedType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error('[AdminPartnerResources] Load error:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách tài nguyên');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadResources();
    }, [selectedType])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadResources();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resource_type: 'banner',
      access_level: 'all',
      file_url: '',
      thumbnail_url: '',
      is_featured: false,
    });
    setEditingResource(null);
  };

  // Open create modal
  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title || '',
      description: resource.description || '',
      resource_type: resource.resource_type || 'banner',
      access_level: resource.access_level || 'all',
      file_url: resource.file_url || '',
      thumbnail_url: resource.thumbnail_url || '',
      is_featured: resource.is_featured || false,
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (resource) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa tài nguyên "${resource.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('partnership_resources')
                .delete()
                .eq('id', resource.id);

              if (error) throw error;
              Alert.alert('Thành công', 'Đã xóa tài nguyên');
              loadResources();
            } catch (err) {
              Alert.alert('Lỗi', err.message);
            }
          },
        },
      ]
    );
  };

  // Toggle featured
  const handleToggleFeatured = async (resource) => {
    try {
      const { error } = await supabase
        .from('partnership_resources')
        .update({ is_featured: !resource.is_featured })
        .eq('id', resource.id);

      if (error) throw error;
      loadResources();
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    }
  };

  // Pick image
  const pickImage = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Upload to Supabase storage
      try {
        const uri = result.assets[0].uri;
        const fileName = `resource_${Date.now()}.jpg`;
        const filePath = `partnership-resources/${fileName}`;

        const formDataUpload = new FormData();
        formDataUpload.append('file', {
          uri,
          name: fileName,
          type: 'image/jpeg',
        });

        const { data, error } = await supabase.storage
          .from('public')
          .upload(filePath, formDataUpload, {
            contentType: 'image/jpeg',
          });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('public')
          .getPublicUrl(filePath);

        setFormData(prev => ({ ...prev, [field]: publicUrl.publicUrl }));
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể upload hình ảnh');
      }
    }
  };

  // Save resource
  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        resource_type: formData.resource_type,
        access_level: formData.access_level,
        file_url: formData.file_url,
        thumbnail_url: formData.thumbnail_url,
        is_featured: formData.is_featured,
        is_active: true,
      };

      if (editingResource) {
        const { error } = await supabase
          .from('partnership_resources')
          .update(payload)
          .eq('id', editingResource.id);

        if (error) throw error;
        Alert.alert('Thành công', 'Đã cập nhật tài nguyên');
      } else {
        const { error } = await supabase
          .from('partnership_resources')
          .insert(payload);

        if (error) throw error;
        Alert.alert('Thành công', 'Đã tạo tài nguyên mới');
      }

      setShowModal(false);
      resetForm();
      loadResources();
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Render resource
  const renderResource = ({ item }) => (
    <ResourceCard
      resource={item}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onToggleFeatured={handleToggleFeatured}
    />
  );

  // Render empty
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Package size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>Chưa có tài nguyên nào</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleCreate}>
          <Plus size={18} color={COLORS.bgDarkest} />
          <Text style={styles.emptyButtonText}>Tạo mới</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý tài nguyên</Text>
          <TouchableOpacity onPress={handleCreate} style={styles.addButton}>
            <Plus size={24} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Type Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedType('all')}
          >
            <Text style={[styles.filterChipText, selectedType === 'all' && styles.filterChipTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, selectedType === key && styles.filterChipActive]}
              onPress={() => setSelectedType(key)}
            >
              <config.icon size={14} color={selectedType === key ? COLORS.gold : COLORS.textMuted} />
              <Text style={[styles.filterChipText, selectedType === key && styles.filterChipTextActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Resources List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <FlatList
            data={resources}
            keyExtractor={item => item.id}
            renderItem={renderResource}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
            }
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={<View style={{ height: CONTENT_BOTTOM_PADDING }} />}
          />
        )}

        {/* Create/Edit Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingResource ? 'Chỉnh sửa tài nguyên' : 'Tạo tài nguyên mới'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <X size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Title */}
                <Text style={styles.inputLabel}>Tiêu đề *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tiêu đề..."
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.title}
                  onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
                />

                {/* Description */}
                <Text style={styles.inputLabel}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Nhập mô tả..."
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.description}
                  onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
                  multiline
                />

                {/* Type */}
                <Text style={styles.inputLabel}>Loại tài nguyên</Text>
                <View style={styles.optionsRow}>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.optionChip,
                        formData.resource_type === key && { borderColor: config.color, backgroundColor: config.color + '15' }
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, resource_type: key }))}
                    >
                      <config.icon size={14} color={formData.resource_type === key ? config.color : COLORS.textMuted} />
                      <Text style={[
                        styles.optionChipText,
                        formData.resource_type === key && { color: config.color }
                      ]}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Access Level */}
                <Text style={styles.inputLabel}>Quyền truy cập</Text>
                <View style={styles.optionsRow}>
                  {ACCESS_OPTIONS.map(option => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.optionChip,
                        formData.access_level === option.key && styles.optionChipActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, access_level: option.key }))}
                    >
                      <Text style={[
                        styles.optionChipText,
                        formData.access_level === option.key && styles.optionChipTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* File URL */}
                <Text style={styles.inputLabel}>Link tải</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.file_url}
                  onChangeText={text => setFormData(prev => ({ ...prev, file_url: text }))}
                />

                {/* Thumbnail */}
                <Text style={styles.inputLabel}>Hình ảnh xem trước</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('thumbnail_url')}>
                  {formData.thumbnail_url ? (
                    <Image source={{ uri: formData.thumbnail_url }} style={styles.thumbnailPreview} />
                  ) : (
                    <>
                      <Upload size={24} color={COLORS.textMuted} />
                      <Text style={styles.uploadText}>Chọn hình ảnh</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Featured */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                >
                  <View style={[styles.checkbox, formData.is_featured && styles.checkboxChecked]}>
                    {formData.is_featured && <Check size={14} color={COLORS.bgDarkest} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Đánh dấu nổi bật</Text>
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color={COLORS.bgDarkest} size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {editingResource ? 'Cập nhật' : 'Tạo mới'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Styles
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  addButton: {
    padding: SPACING.xs,
  },

  // Filter
  filterScroll: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: SPACING.xs,
  },
  filterChipActive: {
    backgroundColor: 'rgba(255,189,89,0.15)',
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.gold,
  },

  // List
  listContent: {
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Resource Card
  resourceCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  resourceTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  resourceType: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  featuredBadge: {
    padding: 4,
  },
  resourceThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  resourceDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  accessBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accessBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionBtn: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Form
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  optionChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255,189,89,0.1)',
  },
  optionChipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  optionChipTextActive: {
    color: COLORS.gold,
  },
  uploadButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    minHeight: 100,
  },
  uploadText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  thumbnailPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  submitButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default AdminPartnerResourcesScreen;
