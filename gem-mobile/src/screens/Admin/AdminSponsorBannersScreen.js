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
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
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
  Upload,
  Camera,
} from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { STORAGE_BUCKET, MAX_IMAGES_PER_POST } from '../../constants/imageConstants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Aspect ratio options for image upload
const ASPECT_RATIO_OPTIONS = [
  { value: '16:9', ratio: [16, 9], label: '16:9 (Ngang)' },
  { value: '1:1', ratio: [1, 1], label: '1:1 (Vuông)' },
  { value: '9:16', ratio: [9, 16], label: '9:16 (Dọc)' },
  { value: '4:3', ratio: [4, 3], label: '4:3' },
  { value: 'free', ratio: null, label: 'Tự do' },
];

import { COLORS, GRADIENTS, SPACING, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { sponsorBannerService } from '../../services/sponsorBannerService';
import { BANNER_LAYOUT_OPTIONS } from '../../components/SponsorBanner';

const TIER_OPTIONS = ['FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'];
const SCREEN_OPTIONS = ['home', 'forum', 'scanner', 'shop', 'courses', 'account', 'visionboard', 'wallet', 'portfolio'];

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9'); // Default aspect ratio

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
    image_url: '', // Single image for Compact/Featured
    images: [], // Multiple images for Post Style
    html_content: '',
    layout_type: 'compact', // 'compact' | 'post' | 'featured'
    sponsor_name: '', // For post-style layout
    sponsor_avatar: '', // For post-style layout
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
      images: [], // Reset images array
      html_content: '',
      layout_type: 'compact',
      sponsor_name: '',
      sponsor_avatar: '',
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
    setSelectedAspectRatio('16:9'); // Reset aspect ratio
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

    // Parse images from banner - could be stored as JSON string or array
    let images = [];
    if (banner.images) {
      images = Array.isArray(banner.images) ? banner.images : JSON.parse(banner.images || '[]');
    } else if (banner.image_url && banner.layout_type === 'post') {
      // Fallback: if only image_url exists for post style, use it as single image
      images = [banner.image_url];
    }

    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      images: images,
      html_content: banner.html_content || '',
      layout_type: banner.layout_type || 'compact',
      sponsor_name: banner.sponsor_name || '',
      sponsor_avatar: banner.sponsor_avatar || '',
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

  // Get aspect ratio for current layout and selection
  const getAspectRatioForUpload = () => {
    // For Compact and Featured, use fixed 16:9
    if (form.layout_type === 'compact' || form.layout_type === 'featured') {
      return [16, 9];
    }
    // For Post Style, use selected aspect ratio
    const selected = ASPECT_RATIO_OPTIONS.find(opt => opt.value === selectedAspectRatio);
    return selected?.ratio || null; // null = free aspect ratio
  };

  // Check if current layout supports multiple images
  const supportsMultipleImages = () => form.layout_type === 'post';

  // Pick and upload image from device
  const pickAndUploadImage = async (source = 'library') => {
    try {
      // Check max images limit for Post Style
      if (supportsMultipleImages() && form.images.length >= MAX_IMAGES_PER_POST) {
        showAlert('Lỗi', `Tối đa ${MAX_IMAGES_PER_POST} hình ảnh`, [{ text: 'OK' }], 'error');
        return;
      }

      const aspectRatio = getAspectRatioForUpload();
      const allowsEditing = aspectRatio !== null; // Free ratio = no forced crop

      let result;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Lỗi', 'Cần quyền truy cập camera', [{ text: 'OK' }], 'error');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing,
          aspect: aspectRatio,
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Lỗi', 'Cần quyền truy cập thư viện ảnh', [{ text: 'OK' }], 'error');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing,
          aspect: aspectRatio,
          quality: 0.8,
          allowsMultipleSelection: supportsMultipleImages(), // Allow multiple for Post Style
          selectionLimit: supportsMultipleImages() ? MAX_IMAGES_PER_POST - form.images.length : 1,
        });
      }

      if (result.canceled || !result.assets?.length) return;

      setUploadingImage(true);

      const uploadedUrls = [];

      for (const asset of result.assets) {
        const imageUri = asset.uri;

        // Resize image to max 1080px width
        const resized = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 1080 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Read as base64
        const base64 = await FileSystem.readAsStringAsync(resized.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert to ArrayBuffer
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Upload to Supabase storage with correct bucket
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const path = `banners/sponsor_${timestamp}_${randomId}.jpg`;

        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, bytes.buffer, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
        uploadedUrls.push(urlData.publicUrl);
      }

      // Update form based on layout type
      if (supportsMultipleImages()) {
        // Post Style - add to images array
        setForm(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
          image_url: prev.images.length === 0 ? uploadedUrls[0] : prev.image_url // Keep first as main
        }));
      } else {
        // Compact/Featured - single image
        setForm(prev => ({ ...prev, image_url: uploadedUrls[0] }));
      }

      showAlert('Thành công', `Đã tải lên ${uploadedUrls.length} hình ảnh!`, [{ text: 'OK' }], 'success');

    } catch (error) {
      console.error('[AdminBanners] Image upload error:', error);
      showAlert('Lỗi', 'Không thể tải lên hình ảnh: ' + error.message, [{ text: 'OK' }], 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image from array (for Post Style)
  const removeImage = (index) => {
    setForm(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image_url: newImages[0] || '', // Update main image_url
      };
    });
  };

  // State for avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Pick and upload sponsor avatar (square 1:1 image)
  const pickAndUploadAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Lỗi', 'Cần quyền truy cập thư viện ảnh', [{ text: 'OK' }], 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for avatar
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      setUploadingAvatar(true);

      const imageUri = result.assets[0].uri;

      // Resize avatar to 200px (small file size for avatars)
      const resized = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Read as base64
      const base64 = await FileSystem.readAsStringAsync(resized.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to ArrayBuffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload to Supabase storage
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const path = `banners/avatar_${timestamp}_${randomId}.jpg`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, bytes.buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

      setForm(prev => ({ ...prev, sponsor_avatar: urlData.publicUrl }));
      showAlert('Thành công', 'Đã tải lên avatar nhà tài trợ!', [{ text: 'OK' }], 'success');

    } catch (error) {
      console.error('[AdminBanners] Avatar upload error:', error);
      showAlert('Lỗi', 'Không thể tải lên avatar: ' + error.message, [{ text: 'OK' }], 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Remove sponsor avatar
  const removeAvatar = () => {
    setForm(prev => ({ ...prev, sponsor_avatar: '' }));
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
                      <View style={styles.targetInfoRow}>
                        <Text style={styles.targetLabel}>
                          Màn hình: {banner.target_screens?.join(', ') || 'portfolio'}
                        </Text>
                        {/* Layout Type Badge */}
                        <View style={[
                          styles.layoutBadge,
                          {
                            backgroundColor: banner.layout_type === 'featured'
                              ? `${COLORS.gold}20`
                              : banner.layout_type === 'post'
                              ? `${COLORS.purple}20`
                              : `${COLORS.textMuted}20`
                          }
                        ]}>
                          <Text style={[
                            styles.layoutBadgeText,
                            {
                              color: banner.layout_type === 'featured'
                                ? COLORS.gold
                                : banner.layout_type === 'post'
                                ? COLORS.purple
                                : COLORS.textMuted
                            }
                          ]}>
                            {banner.layout_type === 'featured' ? 'Featured' :
                             banner.layout_type === 'post' ? 'Post' : 'Compact'}
                          </Text>
                        </View>
                      </View>
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

                    {/* Image Section */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Hình ảnh</Text>
                      <Text style={styles.inputHint}>
                        {form.layout_type === 'post'
                          ? `Tải nhiều ảnh (tối đa ${MAX_IMAGES_PER_POST}), chọn tỷ lệ phù hợp`
                          : 'Tải ảnh lên từ thiết bị hoặc dán URL (tỷ lệ 16:9)'}
                      </Text>

                      {/* Aspect Ratio Selector - Only for Post Style */}
                      {form.layout_type === 'post' && (
                        <View style={styles.aspectRatioSection}>
                          <Text style={styles.aspectRatioLabel}>Tỷ lệ ảnh:</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.aspectRatioRow}>
                              {ASPECT_RATIO_OPTIONS.map((option) => (
                                <TouchableOpacity
                                  key={option.value}
                                  style={[
                                    styles.aspectRatioButton,
                                    selectedAspectRatio === option.value && styles.aspectRatioButtonActive,
                                  ]}
                                  onPress={() => setSelectedAspectRatio(option.value)}
                                >
                                  <Text
                                    style={[
                                      styles.aspectRatioButtonText,
                                      selectedAspectRatio === option.value && styles.aspectRatioButtonTextActive,
                                    ]}
                                  >
                                    {option.label}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      )}

                      {/* Image Upload Buttons */}
                      <View style={styles.imageUploadRow}>
                        <TouchableOpacity
                          style={styles.uploadButton}
                          onPress={() => pickAndUploadImage('library')}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <ActivityIndicator size="small" color={COLORS.gold} />
                          ) : (
                            <>
                              <Upload size={18} color={COLORS.gold} />
                              <Text style={styles.uploadButtonText}>
                                {form.layout_type === 'post' ? 'Chọn ảnh' : 'Chọn ảnh'}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.uploadButton}
                          onPress={() => pickAndUploadImage('camera')}
                          disabled={uploadingImage}
                        >
                          <Camera size={18} color={COLORS.gold} />
                          <Text style={styles.uploadButtonText}>Chụp ảnh</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Image Grid Preview - For Post Style (multiple images) */}
                      {form.layout_type === 'post' && form.images.length > 0 && (
                        <View style={styles.imageGridContainer}>
                          <Text style={styles.imageCountLabel}>
                            {form.images.length} / {MAX_IMAGES_PER_POST} ảnh
                          </Text>
                          <View style={styles.imageGrid}>
                            {form.images.map((url, index) => (
                              <View key={index} style={styles.imageGridItem}>
                                <Image
                                  source={{ uri: url }}
                                  style={styles.imageGridImage}
                                  resizeMode="cover"
                                />
                                <TouchableOpacity
                                  style={styles.removeImageButton}
                                  onPress={() => removeImage(index)}
                                >
                                  <X size={14} color={COLORS.textPrimary} />
                                </TouchableOpacity>
                                {index === 0 && (
                                  <View style={styles.mainImageBadge}>
                                    <Text style={styles.mainImageBadgeText}>Chính</Text>
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Single Image Preview - For Compact/Featured */}
                      {form.layout_type !== 'post' && form.image_url ? (
                        <View style={styles.imagePreviewContainer}>
                          <Image
                            source={{ uri: form.image_url }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => setForm(prev => ({ ...prev, image_url: '' }))}
                          >
                            <X size={16} color={COLORS.textPrimary} />
                          </TouchableOpacity>
                        </View>
                      ) : null}

                      {/* URL Input - For Compact/Featured only */}
                      {form.layout_type !== 'post' && (
                        <>
                          <Text style={[styles.inputLabel, { marginTop: SPACING.sm }]}>Hoặc dán URL</Text>
                          <TextInput
                            style={styles.input}
                            value={form.image_url}
                            onChangeText={(text) => setForm(prev => ({ ...prev, image_url: text }))}
                            placeholder="https://..."
                            placeholderTextColor={COLORS.textMuted}
                          />
                        </>
                      )}
                    </View>

                    {/* Layout Type */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Kiểu hiển thị</Text>
                      <Text style={styles.inputHint}>
                        Chọn layout banner sẽ hiển thị cho người dùng
                      </Text>
                      <View style={styles.layoutTypeRow}>
                        {BANNER_LAYOUT_OPTIONS.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.layoutTypeButton,
                              form.layout_type === option.value && styles.layoutTypeActive
                            ]}
                            onPress={() => setForm(prev => ({ ...prev, layout_type: option.value }))}
                          >
                            <Text style={[
                              styles.layoutTypeLabel,
                              form.layout_type === option.value && styles.layoutTypeLabelActive
                            ]}>
                              {option.label}
                            </Text>
                            <Text style={styles.layoutTypeDesc} numberOfLines={1}>
                              {option.description}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Sponsor Info - Only for Post-style layout */}
                    {form.layout_type === 'post' && (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Tên nhà tài trợ</Text>
                          <Text style={styles.inputHint}>
                            Hiển thị như tên tác giả trong bài post
                          </Text>
                          <TextInput
                            style={styles.input}
                            value={form.sponsor_name}
                            onChangeText={(text) => setForm(prev => ({ ...prev, sponsor_name: text }))}
                            placeholder="VD: GEM Official"
                            placeholderTextColor={COLORS.textMuted}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Avatar nhà tài trợ</Text>
                          <Text style={styles.inputHint}>
                            Hình vuông (1:1), để trống sẽ dùng image_url
                          </Text>

                          {/* Avatar Preview or Upload Button */}
                          {form.sponsor_avatar ? (
                            <View style={styles.avatarPreviewContainer}>
                              <Image
                                source={{ uri: form.sponsor_avatar }}
                                style={styles.avatarPreview}
                              />
                              <TouchableOpacity
                                style={styles.avatarRemoveButton}
                                onPress={removeAvatar}
                              >
                                <X size={16} color={COLORS.white} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.avatarChangeButton}
                                onPress={pickAndUploadAvatar}
                                disabled={uploadingAvatar}
                              >
                                <Text style={styles.avatarChangeText}>
                                  {uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.avatarUploadButton}
                              onPress={pickAndUploadAvatar}
                              disabled={uploadingAvatar}
                            >
                              {uploadingAvatar ? (
                                <ActivityIndicator size="small" color={COLORS.gold} />
                              ) : (
                                <>
                                  <Upload size={24} color={COLORS.gold} />
                                  <Text style={styles.avatarUploadText}>Tải lên avatar</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </>
                    )}

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
  targetInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetLabel: { fontSize: 11, color: COLORS.textSubtle, flex: 1 },
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

  // Image Upload Styles
  imageUploadRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gold,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: COLORS.bgMid,
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Aspect Ratio Selector Styles
  aspectRatioSection: {
    marginBottom: SPACING.sm,
  },
  aspectRatioLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  aspectRatioRow: {
    flexDirection: 'row',
    gap: 8,
  },
  aspectRatioButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  aspectRatioButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: COLORS.gold,
  },
  aspectRatioButtonText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  aspectRatioButtonTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Image Grid Styles (for Post Style multiple images)
  imageGridContainer: {
    marginTop: SPACING.sm,
  },
  imageCountLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageGridItem: {
    position: 'relative',
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageGridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.bgMid,
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(255, 189, 89, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainImageBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },

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

  // Layout Type Selection
  layoutTypeRow: { gap: 8 },
  layoutTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  layoutTypeActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  layoutTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  layoutTypeLabelActive: {
    color: COLORS.gold,
  },
  layoutTypeDesc: {
    fontSize: 11,
    color: COLORS.textSubtle,
  },
  layoutBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  layoutBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

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

  // Avatar Upload Styles
  avatarPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.bgMid,
  },
  avatarRemoveButton: {
    position: 'absolute',
    top: -4,
    left: 52,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgDarkest,
  },
  avatarChangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  avatarChangeText: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '500',
  },
  avatarUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  avatarUploadText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '500',
  },
});
