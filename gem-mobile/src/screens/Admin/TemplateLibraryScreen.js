/**
 * Gemral - Template Library Screen
 * Quản lý templates cho push và post
 * @description Admin UI cho template management
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import {
  Copy,
  Plus,
  Search,
  Filter,
  Bell,
  FileText,
  X,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  Inbox,
} from 'lucide-react-native';

// Services
import notificationService from '../../services/notificationService';

// Components
import { TemplateCard } from '../../components/Admin';

// Theme
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, INPUT } from '../../utils/tokens';

// ========== FILTER OPTIONS ==========
const TYPE_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'push', label: 'Push' },
  { id: 'post', label: 'Post' },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'spiritual', label: 'Tâm linh' },
  { id: 'trading', label: 'Trading' },
  { id: 'promo', label: 'Khuyến mãi' },
  { id: 'engagement', label: 'Tương tác' },
  { id: 'education', label: 'Giáo dục' },
];

// ========== FILTER CHIP ==========
const FilterChip = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, isActive && styles.filterChipActive]}
    onPress={onPress}
  >
    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ========== MAIN COMPONENT ==========
const TemplateLibraryScreen = () => {
  const navigation = useNavigation();
  const { alert, AlertComponent } = useCustomAlert();

  // State
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  useFocusEffect(
    useCallback(() => {
      fetchTemplates();
    }, [typeFilter, categoryFilter])
  );

  const fetchTemplates = async () => {
    setError(null);
    try {
      const type = typeFilter === 'all' ? null : typeFilter;
      const category = categoryFilter === 'all' ? null : categoryFilter;

      const result = await notificationService.getTemplates(category, type);

      if (!result.success) {
        throw new Error(result.error);
      }

      setTemplates(result.data || []);
    } catch (err) {
      console.error('[TemplateLibrary] Fetch error:', err);
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTemplates();
  };

  // Filter templates by search
  const filteredTemplates = templates.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.name?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.title_template?.toLowerCase().includes(query) ||
      t.body_template?.toLowerCase().includes(query)
    );
  });

  // Handlers
  const handleUseTemplate = (template) => {
    if (template.type === 'push') {
      navigation.navigate('PushEditor', { mode: 'create', templateId: template.id });
    } else {
      navigation.navigate('ContentEditor', { mode: 'add', templateId: template.id });
    }
  };

  const handleEditTemplate = (template) => {
    // Navigate to edit screen (could be a modal or separate screen)
    alert({
      type: 'info',
      title: 'Chỉnh sửa Template',
      message: 'Tính năng đang phát triển',
    });
  };

  const handleDeleteTemplate = async (template) => {
    if (template.is_system) {
      alert({
        type: 'warning',
        title: 'Không thể xóa',
        message: 'Không thể xóa template mặc định',
      });
      return;
    }

    alert({
      type: 'warning',
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa template "${template.name}"?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const result = await notificationService.deleteTemplate(template.id);
            if (result.success) {
              alert({ type: 'success', title: 'Thành công', message: 'Đã xóa template' });
              fetchTemplates();
            } else {
              alert({ type: 'error', title: 'Lỗi', message: result.error || 'Không thể xóa' });
            }
          },
        },
      ],
    });
  };

  const handleDuplicateTemplate = async (template) => {
    const result = await notificationService.createTemplate({
      ...template,
      id: undefined,
      name: `${template.name} (Copy)`,
      is_system: false,
      usage_count: 0,
    });

    if (result.success) {
      alert({ type: 'success', title: 'Thành công', message: 'Đã nhân bản template' });
      fetchTemplates();
    } else {
      alert({ type: 'error', title: 'Lỗi', message: result.error || 'Không thể nhân bản' });
    }
  };

  const handleCreateNew = () => {
    // Navigate to create template screen
    alert({
      type: 'info',
      title: 'Tạo Template mới',
      message: 'Sử dụng Push Editor hoặc Content Editor và chọn "Lưu làm Template"',
    });
  };

  // Render template item
  const renderTemplate = ({ item }) => (
    <TemplateCard
      template={item}
      type={item.type || 'push'}
      onUse={handleUseTemplate}
      onEdit={handleEditTemplate}
      onDelete={handleDeleteTemplate}
      onDuplicate={handleDuplicateTemplate}
      showActions
      showStats
      style={styles.templateCard}
    />
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTemplates}>
            <RefreshCw size={18} color={COLORS.gold} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thư viện Template</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
            <Filter size={20} color={showFilters ? COLORS.gold : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm template..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Loại</Text>
              <View style={styles.filterRow}>
                {TYPE_FILTERS.map((filter) => (
                  <FilterChip
                    key={filter.id}
                    label={filter.label}
                    isActive={typeFilter === filter.id}
                    onPress={() => setTypeFilter(filter.id)}
                  />
                ))}
              </View>
            </View>

            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Danh mục</Text>
              <View style={styles.filterRow}>
                {CATEGORY_FILTERS.map((filter) => (
                  <FilterChip
                    key={filter.id}
                    label={filter.label}
                    isActive={categoryFilter === filter.id}
                    onPress={() => setCategoryFilter(filter.id)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.statsIcons}>
            <View style={styles.statItem}>
              <Bell size={14} color={COLORS.gold} />
              <Text style={styles.statCount}>
                {templates.filter((t) => t.type === 'push').length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <FileText size={14} color={COLORS.cyan} />
              <Text style={styles.statCount}>
                {templates.filter((t) => t.type === 'post').length}
              </Text>
            </View>
          </View>
        </View>

        {/* Template List */}
        {filteredTemplates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Inbox size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Không có template</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Tạo template mới để bắt đầu'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTemplates}
            keyExtractor={(item) => item.id}
            renderItem={renderTemplate}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleCreateNew}>
          <Plus size={24} color={COLORS.bgDarkest} />
        </TouchableOpacity>

        {/* Alert Component */}
        {AlertComponent}
      </SafeAreaView>
    </LinearGradient>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: { padding: SPACING.xs },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  filterButton: { padding: SPACING.xs },

  searchContainer: { padding: SPACING.lg, paddingBottom: 0 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
  },

  filtersContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  filterSection: { marginBottom: SPACING.md },
  filterLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: { backgroundColor: COLORS.gold },
  filterChipText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.bgDarkest, fontWeight: TYPOGRAPHY.fontWeight.semibold },

  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  statsText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textMuted },
  statsIcons: { flexDirection: 'row', gap: SPACING.lg },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxs },
  statCount: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textSecondary },

  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  templateCard: { marginBottom: SPACING.md },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  loadingText: { color: COLORS.textMuted, marginTop: SPACING.md, fontSize: TYPOGRAPHY.fontSize.lg },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,189,89,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  retryText: { color: COLORS.gold, fontWeight: TYPOGRAPHY.fontWeight.semibold, fontSize: TYPOGRAPHY.fontSize.lg },
});

export default TemplateLibraryScreen;
