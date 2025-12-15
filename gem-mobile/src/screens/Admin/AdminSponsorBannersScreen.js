/**
 * GEM Mobile - Admin Sponsor Banners Screen
 * Manage promotional banners displayed in Portfolio and other screens
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CustomAlert from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Image as ImageIcon,
  BarChart3,
  MousePointer2,
  Settings,
  Code,
  Smartphone,
  ChevronDown,
  Check,
  Search,
} from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

import { COLORS, GRADIENTS, SPACING, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { sponsorBannerService } from '../../services/sponsorBannerService';

const TIER_OPTIONS = ['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'];
const SCREEN_OPTIONS = ['home', 'scanner', 'shop', 'account', 'visionboard', 'wallet', 'portfolio'];

// Danh sách các DeepLink có sẵn trong app
const DEEPLINK_OPTIONS = [
  // Main Tabs
  { category: 'Tabs chính', items: [
    { label: 'Trang chủ', value: 'Home', description: 'Tab Home' },
    { label: 'Scanner', value: 'Scanner', description: 'Tab Scanner' },
    { label: 'Shop', value: 'Shop', description: 'Tab Shop' },
    { label: 'Cộng đồng', value: 'Forum', description: 'Tab Forum' },
    { label: 'Tài khoản', value: 'Account', description: 'Tab Account' },
  ]},
  // Account Stack
  { category: 'Tài khoản', items: [
    { label: 'Portfolio', value: 'Portfolio', description: 'Quản lý portfolio' },
    { label: 'VisionBoard', value: 'VisionBoard', description: 'Bảng mục tiêu' },
    { label: 'VisionBoard - Goals', value: 'gem://VisionBoard?tab=goals', description: 'Tab mục tiêu' },
    { label: 'VisionBoard - Affirmation', value: 'gem://VisionBoard?tab=affirmation', description: 'Tab khẳng định' },
    { label: 'VisionBoard - I Ching', value: 'gem://VisionBoard?tab=iching', description: 'Tab Kinh Dịch' },
    { label: 'VisionBoard - Tarot', value: 'gem://VisionBoard?tab=tarot', description: 'Tab Tarot' },
    { label: 'Cài đặt', value: 'Settings', description: 'Cài đặt app' },
    { label: 'Thông báo', value: 'Notifications', description: 'Danh sách thông báo' },
  ]},
  // Monetization
  { category: 'Kiếm tiền', items: [
    { label: 'Affiliate Program', value: 'AffiliateProgram', description: 'Chương trình affiliate' },
    { label: 'Affiliate Dashboard', value: 'AffiliateDashboard', description: 'Bảng điều khiển affiliate' },
    { label: 'Ví Gem', value: 'Wallet', description: 'Ví tiền Gem' },
    { label: 'Mua Gem', value: 'BuyGems', description: 'Mua Gem coins' },
    { label: 'Rút tiền', value: 'Withdraw', description: 'Rút tiền' },
    { label: 'Lịch sử giao dịch', value: 'TransactionHistory', description: 'Lịch sử' },
  ]},
  // Courses
  { category: 'Khóa học', items: [
    { label: 'Danh sách khóa học', value: 'Courses', description: 'Tất cả khóa học' },
    { label: 'Khóa học của tôi', value: 'MyCourses', description: 'Khóa học đã đăng ký' },
  ]},
  // Shop
  { category: 'Shop', items: [
    { label: 'Shop - Tất cả', value: 'gem://Shop', description: 'Trang shop chính' },
    { label: 'Giỏ hàng', value: 'Cart', description: 'Giỏ hàng' },
    { label: 'Đơn hàng', value: 'Orders', description: 'Lịch sử đơn hàng' },
    { label: 'Quà tặng', value: 'GiftCatalog', description: 'Danh mục quà tặng' },
  ]},
  // Help & Support
  { category: 'Hỗ trợ', items: [
    { label: 'Trợ giúp', value: 'Help', description: 'Trung tâm trợ giúp' },
    { label: 'FAQ', value: 'FAQ', description: 'Câu hỏi thường gặp' },
    { label: 'Liên hệ', value: 'Contact', description: 'Liên hệ hỗ trợ' },
  ]},
];

export default function AdminSponsorBannersScreen({ navigation }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalTab, setModalTab] = useState('basic'); // 'basic' | 'html' | 'preview'
  const [deeplinkPickerVisible, setDeeplinkPickerVisible] = useState(false);
  const [deeplinkSearch, setDeeplinkSearch] = useState('');

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
    type: 'default',
  });

  const showAlert = (title, message, buttons = [{ text: 'OK' }], type = 'default') => {
    setAlertConfig({ visible: true, title, message, buttons, type });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // Form state
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    html_content: '',
    action_type: 'screen',
    action_value: '',
    action_label: 'Tìm hiểu thêm',
    background_color: '#1a0b2e',
    text_color: '#FFFFFF',
    accent_color: '#FFBD59',
    target_tiers: ['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'],
    target_screens: ['portfolio'],
    priority: 0,
    is_active: true,
    is_dismissible: true,
    start_date: new Date().toISOString(), // Default to now so banner shows immediately
    end_date: null, // No end date by default
  });

  // Default HTML template for banner
  const getDefaultHtmlTemplate = () => `
<div style="
  background: linear-gradient(135deg, ${form.background_color} 0%, #2d1b4e 100%);
  padding: 20px;
  border-radius: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
">
  <h2 style="color: ${form.accent_color}; margin: 0 0 8px 0; font-size: 20px;">
    ${form.title || 'Tiêu đề Banner'}
  </h2>
  <p style="color: ${form.text_color}; margin: 0 0 12px 0; font-size: 14px; opacity: 0.9;">
    ${form.subtitle || 'Phụ đề mô tả ngắn gọn về banner'}
  </p>
  <button style="
    background: ${form.accent_color};
    color: #1a0b2e;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
  ">
    ${form.action_label || 'Tìm hiểu thêm'}
  </button>
</div>`;

  // Generate preview HTML
  const getPreviewHtml = () => {
    const htmlContent = form.html_content?.trim() || getDefaultHtmlTemplate();
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f1030;
      padding: 16px;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  };

  const loadBanners = useCallback(async () => {
    try {
      const data = await sponsorBannerService.getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error('[AdminBanners] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBanners();
    setRefreshing(false);
  };

  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      html_content: '',
      action_type: 'screen',
      action_value: '',
      action_label: 'Tìm hiểu thêm',
      background_color: '#1a0b2e',
      text_color: '#FFFFFF',
      accent_color: '#FFBD59',
      target_tiers: ['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'],
      target_screens: ['portfolio'],
      priority: 0,
      is_active: true,
      is_dismissible: true,
      start_date: new Date().toISOString(), // Default to now
      end_date: null,
    });
    setEditingBanner(null);
    setModalTab('basic');
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (banner) => {
    console.log('[AdminBanners] Opening edit modal with banner:', JSON.stringify(banner, null, 2));
    console.log('[AdminBanners] action_value from DB:', banner.action_value);
    console.log('[AdminBanners] action_type from DB:', banner.action_type);
    setEditingBanner(banner);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      html_content: banner.html_content || '',
      action_type: banner.action_type || 'screen',
      action_value: banner.action_value || '',
      action_label: banner.action_label || 'Tìm hiểu thêm',
      background_color: banner.background_color || '#1a0b2e',
      text_color: banner.text_color || '#FFFFFF',
      accent_color: banner.accent_color || '#FFBD59',
      target_tiers: banner.target_tiers || ['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'],
      target_screens: banner.target_screens || ['portfolio'],
      priority: banner.priority || 0,
      is_active: banner.is_active ?? true,
      is_dismissible: banner.is_dismissible ?? true,
      start_date: banner.start_date || new Date().toISOString(),
      end_date: banner.end_date || null,
    });
    setModalTab('basic');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập tiêu đề banner', [{ text: 'OK' }], 'error');
      return;
    }

    console.log('[AdminBanners] ========== SAVING ==========');
    console.log('[AdminBanners] form.action_value:', form.action_value);
    console.log('[AdminBanners] form.action_type:', form.action_type);
    console.log('[AdminBanners] form.target_screens:', form.target_screens);
    console.log('[AdminBanners] Saving banner with form data:', JSON.stringify(form, null, 2));

    setSaving(true);
    try {
      let result;
      if (editingBanner) {
        result = await sponsorBannerService.updateBanner(editingBanner.id, form);
      } else {
        result = await sponsorBannerService.createBanner(form, user?.id);
      }
      console.log('[AdminBanners] Save result:', JSON.stringify(result, null, 2));

      if (result.success) {
        const savedActionValue = result.data?.action_value || 'N/A';
        showAlert(
          'Thành công',
          `${editingBanner ? 'Đã cập nhật' : 'Đã tạo'} banner!\n\naction_value đã lưu: ${savedActionValue}`,
          [{ text: 'OK' }],
          'success'
        );
        setModalVisible(false);
        resetForm();
        await loadBanners();
      } else {
        showAlert('Lỗi', result.error || 'Không thể lưu banner', [{ text: 'OK' }], 'error');
      }
    } catch (error) {
      showAlert('Lỗi', 'Đã xảy ra lỗi khi lưu', [{ text: 'OK' }], 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (banner) => {
    showAlert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa banner "${banner.title}"?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const result = await sponsorBannerService.deleteBanner(banner.id);
            if (result.success) {
              await loadBanners();
            } else {
              showAlert('Lỗi', result.error || 'Không thể xóa banner', [{ text: 'OK' }], 'error');
            }
          },
        },
      ],
      'warning'
    );
  };

  const handleToggleActive = async (banner) => {
    const result = await sponsorBannerService.toggleActive(banner.id, !banner.is_active);
    if (result.success) {
      await loadBanners();
    } else {
      showAlert('Lỗi', result.error || 'Không thể thay đổi trạng thái', [{ text: 'OK' }], 'error');
    }
  };

  const toggleTier = (tier) => {
    setForm(prev => {
      const tiers = prev.target_tiers.includes(tier)
        ? prev.target_tiers.filter(t => t !== tier)
        : [...prev.target_tiers, tier];
      return { ...prev, target_tiers: tiers };
    });
  };

  const toggleScreen = (screen) => {
    setForm(prev => {
      const screens = prev.target_screens.includes(screen)
        ? prev.target_screens.filter(s => s !== screen)
        : [...prev.target_screens, screen];
      return { ...prev, target_screens: screens };
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Banner</Text>
          <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
            <Plus size={24} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Overview */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{banners.length}</Text>
              <Text style={styles.statLabel}>Tổng banner</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{banners.filter(b => b.is_active).length}</Text>
              <Text style={styles.statLabel}>Đang hiển thị</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {formatNumber(banners.reduce((sum, b) => sum + (b.view_count || 0), 0))}
              </Text>
              <Text style={styles.statLabel}>Lượt xem</Text>
            </View>
          </View>

          {/* Banner List */}
          {banners.length === 0 ? (
            <View style={styles.emptyState}>
              <ImageIcon size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Chưa có banner nào</Text>
              <Text style={styles.emptyText}>Tạo banner quảng cáo mới để hiển thị</Text>
              <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
                <Plus size={20} color={COLORS.textPrimary} />
                <Text style={styles.createButtonText}>Tạo banner</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bannerList}>
              {banners.map((banner) => (
                <View key={banner.id} style={styles.bannerCard}>
                  {/* Preview */}
                  {banner.image_url ? (
                    <Image source={{ uri: banner.image_url }} style={styles.bannerImage} />
                  ) : (
                    <View style={[styles.bannerPreview, { backgroundColor: banner.background_color }]}>
                      <Text style={[styles.bannerPreviewTitle, { color: banner.text_color }]}>
                        {banner.title}
                      </Text>
                    </View>
                  )}

                  {/* Info */}
                  <View style={styles.bannerInfo}>
                    <View style={styles.bannerHeader}>
                      <Text style={styles.bannerTitle} numberOfLines={1}>{banner.title}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: banner.is_active ? `${COLORS.success}20` : `${COLORS.error}20` }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: banner.is_active ? COLORS.success : COLORS.error }
                        ]}>
                          {banner.is_active ? 'Hiển thị' : 'Ẩn'}
                        </Text>
                      </View>
                    </View>

                    {banner.subtitle && (
                      <Text style={styles.bannerSubtitle} numberOfLines={1}>{banner.subtitle}</Text>
                    )}

                    {/* Stats */}
                    <View style={styles.bannerStats}>
                      <View style={styles.bannerStat}>
                        <Eye size={14} color={COLORS.textMuted} />
                        <Text style={styles.bannerStatText}>{formatNumber(banner.view_count || 0)}</Text>
                      </View>
                      <View style={styles.bannerStat}>
                        <MousePointer2 size={14} color={COLORS.textMuted} />
                        <Text style={styles.bannerStatText}>{formatNumber(banner.click_count || 0)}</Text>
                      </View>
                      <Text style={styles.bannerCTR}>
                        CTR: {banner.view_count > 0
                          ? ((banner.click_count / banner.view_count) * 100).toFixed(1)
                          : 0}%
                      </Text>
                    </View>

                    {/* Target Info */}
                    <View style={styles.targetInfo}>
                      <Text style={styles.targetLabel}>
                        Màn hình: {banner.target_screens?.join(', ') || 'portfolio'}
                      </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.bannerActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleToggleActive(banner)}
                      >
                        {banner.is_active ? (
                          <EyeOff size={18} color={COLORS.textMuted} />
                        ) : (
                          <Eye size={18} color={COLORS.success} />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openEditModal(banner)}
                      >
                        <Edit2 size={18} color={COLORS.purple} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(banner)}
                      >
                        <Trash2 size={18} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Create/Edit Modal - Full Screen */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setModalVisible(false)}
        >
          <LinearGradient colors={GRADIENTS.background} style={styles.fullScreenModal}>
            <SafeAreaView style={styles.fullScreenContainer} edges={['top', 'bottom']}>
              {/* Modal Header */}
              <View style={styles.fullModalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.fullModalTitle}>
                  {editingBanner ? 'Sửa banner' : 'Tạo banner mới'}
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Tab Navigation */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tab, modalTab === 'basic' && styles.tabActive]}
                  onPress={() => setModalTab('basic')}
                >
                  <Settings size={18} color={modalTab === 'basic' ? COLORS.gold : COLORS.textMuted} />
                  <Text style={[styles.tabText, modalTab === 'basic' && styles.tabTextActive]}>
                    Cơ bản
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, modalTab === 'html' && styles.tabActive]}
                  onPress={() => setModalTab('html')}
                >
                  <Code size={18} color={modalTab === 'html' ? COLORS.gold : COLORS.textMuted} />
                  <Text style={[styles.tabText, modalTab === 'html' && styles.tabTextActive]}>
                    HTML
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, modalTab === 'preview' && styles.tabActive]}
                  onPress={() => setModalTab('preview')}
                >
                  <Smartphone size={18} color={modalTab === 'preview' ? COLORS.gold : COLORS.textMuted} />
                  <Text style={[styles.tabText, modalTab === 'preview' && styles.tabTextActive]}>
                    Xem trước
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              <KeyboardAvoidingView
                style={styles.tabContent}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
              >
                {/* Basic Tab */}
                {modalTab === 'basic' && (
                  <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                    {/* Title */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Tiêu đề *</Text>
                      <TextInput
                        style={styles.input}
                        value={form.title}
                        onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
                        placeholder="VD: Earn Money"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>

                    {/* Subtitle */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Phụ đề</Text>
                      <TextInput
                        style={styles.input}
                        value={form.subtitle}
                        onChangeText={(text) => setForm(prev => ({ ...prev, subtitle: text }))}
                        placeholder="VD: Become a joker and win..."
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Mô tả</Text>
                      <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        value={form.description}
                        onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
                        placeholder="Mô tả chi tiết..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    {/* Image URL */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>URL hình ảnh</Text>
                      <TextInput
                        style={styles.input}
                        value={form.image_url}
                        onChangeText={(text) => setForm(prev => ({ ...prev, image_url: text }))}
                        placeholder="https://..."
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>

                    {/* Action Type */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Loại hành động</Text>
                      <View style={styles.actionTypeRow}>
                        {['screen', 'url', 'deeplink'].map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.actionTypeButton,
                              form.action_type === type && styles.actionTypeActive
                            ]}
                            onPress={() => setForm(prev => ({ ...prev, action_type: type }))}
                          >
                            <Text style={[
                              styles.actionTypeText,
                              form.action_type === type && styles.actionTypeTextActive
                            ]}>
                              {type === 'screen' ? 'Màn hình' : type === 'url' ? 'URL' : 'DeepLink'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Action Value */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {form.action_type === 'screen' ? 'Khi click -> Mở màn hình' : form.action_type === 'deeplink' ? 'Khi click -> DeepLink' : 'Khi click -> Mở URL'}
                      </Text>
                      <Text style={styles.inputHint}>
                        {form.action_type === 'screen' || form.action_type === 'deeplink'
                          ? 'Chọn màn hình sẽ mở ra khi user bấm vào banner'
                          : 'Nhập URL sẽ mở ra khi user bấm vào banner'}
                      </Text>
                      {(form.action_type === 'screen' || form.action_type === 'deeplink') ? (
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => setDeeplinkPickerVisible(true)}
                        >
                          <Text style={[
                            styles.dropdownButtonText,
                            !form.action_value && styles.dropdownPlaceholder
                          ]}>
                            {form.action_value || 'Chọn màn hình...'}
                          </Text>
                          <ChevronDown size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      ) : (
                        <TextInput
                          style={styles.input}
                          value={form.action_value}
                          onChangeText={(text) => setForm(prev => ({ ...prev, action_value: text }))}
                          placeholder="https://..."
                          placeholderTextColor={COLORS.textMuted}
                        />
                      )}
                    </View>

                    {/* Action Label */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Nhãn nút</Text>
                      <TextInput
                        style={styles.input}
                        value={form.action_label}
                        onChangeText={(text) => setForm(prev => ({ ...prev, action_label: text }))}
                        placeholder="Tìm hiểu thêm"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>

                    {/* Priority */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Độ ưu tiên (số lớn hiển thị trước)</Text>
                      <TextInput
                        style={styles.input}
                        value={form.priority.toString()}
                        onChangeText={(text) => setForm(prev => ({ ...prev, priority: parseInt(text) || 0 }))}
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="number-pad"
                      />
                    </View>

                    {/* Target Tiers */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Hiển thị cho tier</Text>
                      <View style={styles.chipRow}>
                        {TIER_OPTIONS.map((tier) => (
                          <TouchableOpacity
                            key={tier}
                            style={[
                              styles.chip,
                              form.target_tiers.includes(tier) && styles.chipActive
                            ]}
                            onPress={() => toggleTier(tier)}
                          >
                            <Text style={[
                              styles.chipText,
                              form.target_tiers.includes(tier) && styles.chipTextActive
                            ]}>
                              {tier}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Target Screens */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Banner xuất hiện tại trang</Text>
                      <Text style={styles.inputHint}>
                        Chọn nơi banner sẽ hiển thị (có thể chọn nhiều)
                      </Text>
                      <View style={styles.chipRow}>
                        {SCREEN_OPTIONS.map((screen) => (
                          <TouchableOpacity
                            key={screen}
                            style={[
                              styles.chip,
                              form.target_screens.includes(screen) && styles.chipActive
                            ]}
                            onPress={() => toggleScreen(screen)}
                          >
                            <Text style={[
                              styles.chipText,
                              form.target_screens.includes(screen) && styles.chipTextActive
                            ]}>
                              {screen}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Switches */}
                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Kích hoạt ngay</Text>
                      <Switch
                        value={form.is_active}
                        onValueChange={(value) => setForm(prev => ({ ...prev, is_active: value }))}
                        trackColor={{ false: COLORS.textMuted, true: COLORS.success }}
                        thumbColor={COLORS.textPrimary}
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Cho phép ẩn banner</Text>
                      <Switch
                        value={form.is_dismissible}
                        onValueChange={(value) => setForm(prev => ({ ...prev, is_dismissible: value }))}
                        trackColor={{ false: COLORS.textMuted, true: COLORS.success }}
                        thumbColor={COLORS.textPrimary}
                      />
                    </View>

                    <View style={{ height: 20 }} />
                  </ScrollView>
                )}

                {/* HTML Tab */}
                {modalTab === 'html' && (
                  <View style={styles.htmlTabContainer}>
                    <View style={styles.htmlHelpBox}>
                      <Text style={styles.htmlHelpText}>
                        Nhập mã HTML tùy chỉnh cho banner. Để trống để sử dụng template mặc định từ thông tin cơ bản.
                      </Text>
                      <TouchableOpacity
                        style={styles.insertTemplateBtn}
                        onPress={() => setForm(prev => ({ ...prev, html_content: getDefaultHtmlTemplate() }))}
                      >
                        <Code size={14} color={COLORS.gold} />
                        <Text style={styles.insertTemplateBtnText}>Chèn template mẫu</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.htmlEditor}
                      value={form.html_content}
                      onChangeText={(text) => setForm(prev => ({ ...prev, html_content: text }))}
                      placeholder="<div style='...'>\n  <h2>Tiêu đề</h2>\n  <p>Nội dung...</p>\n</div>"
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                      textAlignVertical="top"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                )}

                {/* Preview Tab */}
                {modalTab === 'preview' && (
                  <View style={styles.previewContainer}>
                    <Text style={styles.previewLabel}>Xem trước banner trên màn hình</Text>
                    <View style={styles.previewPhone}>
                      <View style={styles.previewPhoneHeader}>
                        <View style={styles.previewNotch} />
                      </View>
                      <WebView
                        source={{ html: getPreviewHtml() }}
                        style={styles.previewWebView}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        originWhitelist={['*']}
                      />
                    </View>
                  </View>
                )}
              </KeyboardAvoidingView>

              {/* Fixed Bottom Buttons */}
              <View style={styles.fixedBottomButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                  ) : (
                    <Text style={styles.saveButtonText}>Lưu banner</Text>
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* DeepLink Picker Modal */}
        <Modal
          visible={deeplinkPickerVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDeeplinkPickerVisible(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              {/* Picker Header */}
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Chọn màn hình</Text>
                <TouchableOpacity onPress={() => setDeeplinkPickerVisible(false)}>
                  <X size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={styles.pickerSearch}>
                <Search size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.pickerSearchInput}
                  value={deeplinkSearch}
                  onChangeText={setDeeplinkSearch}
                  placeholder="Tìm kiếm..."
                  placeholderTextColor={COLORS.textMuted}
                />
                {deeplinkSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setDeeplinkSearch('')}>
                    <X size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Options List */}
              <ScrollView
                style={styles.pickerList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {DEEPLINK_OPTIONS.map((category) => {
                  const filteredItems = category.items.filter(item =>
                    deeplinkSearch.length === 0 ||
                    item.label.toLowerCase().includes(deeplinkSearch.toLowerCase()) ||
                    item.value.toLowerCase().includes(deeplinkSearch.toLowerCase()) ||
                    item.description.toLowerCase().includes(deeplinkSearch.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <View key={category.category} style={styles.pickerCategory}>
                      <Text style={styles.pickerCategoryTitle}>{category.category}</Text>
                      {filteredItems.map((item) => {
                        const isSelected = form.action_value === item.value;
                        return (
                          <Pressable
                            key={item.value}
                            style={({ pressed }) => [
                              styles.pickerItem,
                              isSelected && styles.pickerItemSelected,
                              pressed && { opacity: 0.7 }
                            ]}
                            onPress={() => {
                              console.log('[AdminBanners] ====== PICKER ITEM PRESSED ======');
                              console.log('[AdminBanners] Selected action_value:', item.value);
                              setForm(prev => {
                                console.log('[AdminBanners] Previous form action_value:', prev.action_value);
                                console.log('[AdminBanners] New form action_value:', item.value);
                                return { ...prev, action_value: item.value };
                              });
                              setDeeplinkPickerVisible(false);
                              setDeeplinkSearch('');
                            }}
                          >
                            <View style={styles.pickerItemContent}>
                              <Text style={[styles.pickerItemLabel, isSelected && styles.pickerItemLabelSelected]}>
                                {item.label}
                              </Text>
                              <Text style={styles.pickerItemDescription}>{item.description}</Text>
                              <Text style={styles.pickerItemValue}>{item.value}</Text>
                            </View>
                            {isSelected && (
                              <Check size={20} color={COLORS.gold} />
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  );
                })}
                <View style={{ height: 40 }} />
              </ScrollView>

              {/* Custom Input Option */}
              <View style={styles.pickerCustomSection}>
                <Text style={styles.pickerCustomLabel}>Hoặc nhập thủ công:</Text>
                <View style={styles.pickerCustomRow}>
                  <TextInput
                    style={styles.pickerCustomInput}
                    value={form.action_value}
                    onChangeText={(text) => setForm(prev => ({ ...prev, action_value: text }))}
                    placeholder="gem://ScreenName?param=value"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <TouchableOpacity
                    style={styles.pickerCustomDone}
                    onPress={() => {
                      setDeeplinkPickerVisible(false);
                      setDeeplinkSearch('');
                    }}
                  >
                    <Text style={styles.pickerCustomDoneText}>Xong</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Custom Alert */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onClose={closeAlert}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  addButton: { padding: 8 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.gold },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginTop: SPACING.lg },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: SPACING.lg,
  },
  createButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },

  // Banner List
  bannerList: {},
  bannerCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  bannerImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  bannerPreview: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPreviewTitle: { fontSize: 16, fontWeight: '700' },
  bannerInfo: { padding: SPACING.md },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' },
  bannerSubtitle: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  bannerStats: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  bannerStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bannerStatText: { fontSize: 12, color: COLORS.textMuted },
  bannerCTR: { fontSize: 12, color: COLORS.purple, fontWeight: '600' },
  targetInfo: { marginBottom: 8 },
  targetLabel: { fontSize: 11, color: COLORS.textSubtle },
  bannerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  actionButton: { padding: 8 },

  // Full Screen Modal
  fullScreenModal: {
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
  },
  fullModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },

  // Tab Content
  tabContent: {
    flex: 1,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // HTML Tab
  htmlTabContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  htmlHelpBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  htmlHelpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    minWidth: 180,
  },
  insertTemplateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  insertTemplateBtnText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '600',
  },
  htmlEditor: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.textPrimary,
  },

  // Preview Tab
  previewContainer: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  previewPhone: {
    flex: 1,
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#0f1030',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewPhoneHeader: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0b20',
  },
  previewNotch: {
    width: 80,
    height: 24,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  previewWebView: {
    flex: 1,
    backgroundColor: '#0f1030',
  },

  // Fixed Bottom Buttons
  fixedBottomButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: COLORS.bgMid,
  },

  // Form
  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  inputHint: { fontSize: 11, color: COLORS.textSubtle, marginBottom: 8, fontStyle: 'italic' },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },

  actionTypeRow: { flexDirection: 'row', gap: 8 },
  actionTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionTypeActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  actionTypeText: { fontSize: 13, color: COLORS.textMuted },
  actionTypeTextActive: { color: COLORS.gold, fontWeight: '600' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  chipText: { fontSize: 12, color: COLORS.textMuted },
  chipTextActive: { color: COLORS.gold, fontWeight: '600' },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  switchLabel: { fontSize: 14, color: COLORS.textSecondary },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },

  // Dropdown Button
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: COLORS.textMuted,
  },

  // DeepLink Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    marginLeft: 10,
  },
  pickerList: {
    paddingHorizontal: SPACING.lg,
  },
  pickerCategory: {
    marginBottom: SPACING.md,
  },
  pickerCategoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
  },
  pickerItemContent: {
    flex: 1,
  },
  pickerItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  pickerItemLabelSelected: {
    color: COLORS.gold,
  },
  pickerItemDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  pickerItemValue: {
    fontSize: 11,
    color: COLORS.purple,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pickerCustomSection: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  pickerCustomLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  pickerCustomRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pickerCustomInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  pickerCustomDone: {
    backgroundColor: COLORS.burgundy,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  pickerCustomDoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
