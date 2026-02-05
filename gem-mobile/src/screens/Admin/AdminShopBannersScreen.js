/**
 * GEM Mobile - Admin Shop Banners Screen
 * Manage carousel banners displayed in Shop tab
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Plus,
  X,
  Image as ImageIcon,
  Search,
  ChevronDown,
  Upload,
  Eye,
  EyeOff,
  BarChart3,
  MousePointer2,
  Info,
  Megaphone,
  Layers,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Star,
  Sparkles,
  Tag,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import CustomAlert from '../../components/CustomAlert';
import DeepLinkPicker from '../../components/Admin/DeepLinkPicker';
import ShopBannerCard from '../../components/Admin/ShopBannerCard';
import { TooltipSequence, SHOP_BANNER_TOOLTIPS } from '../../components/Admin/AdminTooltip';
import shopBannerService from '../../services/shopBannerService';
import { supabase } from '../../services/supabase';
import ColorPicker from '../../components/Admin/ColorPicker';

// Link type options
const LINK_TYPE_OPTIONS = [
  { label: 'Không có liên kết', value: 'none' },
  { label: 'Sản phẩm', value: 'product' },
  { label: 'Bộ sưu tập', value: 'collection' },
  { label: 'Màn hình trong app', value: 'screen' },
  { label: 'URL bên ngoài', value: 'url' },
];

// Initial banner form state
const INITIAL_FORM = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  link_type: 'none',
  link_value: '',
  display_order: 0,
  is_active: true,
  start_date: null,
  end_date: null,
  background_color: '#1a0b2e',
  text_color: '#FFFFFF',
};

// Initial promo bar form state
const INITIAL_PROMO_FORM = {
  message: '',
  voucher_code: '',
  link_text: '',
  link_url: '',
  background_color: '#FF4757',
  text_color: '#FFFFFF',
  is_active: true,
  start_date: null,
  end_date: null,
  display_order: 0,
};

// Tab options
const TAB_OPTIONS = [
  { key: 'banners', label: 'Carousel', icon: Layers },
  { key: 'promos', label: 'Promo Bar', icon: Megaphone },
  { key: 'featured', label: 'Nổi Bật', icon: Star },
  { key: 'sections', label: 'Sections', icon: Tag },
];

// Initial featured product form state
const INITIAL_FEATURED_FORM = {
  title: '',
  subtitle: '',
  description: '',
  price: '',
  original_price: '',
  currency: 'VND',
  image_url: '',
  badge_text: '',
  badge_color: '#FF4757',
  background_gradient_start: '#1a0b2e',
  background_gradient_end: '#2d1b4e',
  accent_color: '#FFD700',
  text_color: '#FFFFFF',
  link_type: 'collection',
  link_value: '',
  cta_text: 'Xem ngay',
  layout_style: 'card',
  show_price: true,
  show_badge: true,
  show_description: true,
  is_active: true,
  start_date: null,
  end_date: null,
  display_order: 0,
};

// Tooltip keys for onboarding
const TOOLTIP_KEYS = {
  INTRO: 'shop_banner_intro',
  ADD: 'shop_banner_add',
  DEEPLINK: 'shop_banner_deeplink',
  ORDER: 'shop_banner_order',
  SCHEDULE: 'shop_banner_schedule',
};

export default function AdminShopBannersScreen({ navigation }) {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('banners');
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deeplinkPickerVisible, setDeeplinkPickerVisible] = useState(false);
  const [linkTypePickerVisible, setLinkTypePickerVisible] = useState(false);
  const [seenTooltips, setSeenTooltips] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // Promo Bar State
  const [promoBars, setPromoBars] = useState([]);
  const [promoStats, setPromoStats] = useState(null);
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState(INITIAL_PROMO_FORM);

  // Featured Product State
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredStats, setFeaturedStats] = useState(null);
  const [featuredModalVisible, setFeaturedModalVisible] = useState(false);
  const [editingFeatured, setEditingFeatured] = useState(null);
  const [featuredForm, setFeaturedForm] = useState(INITIAL_FEATURED_FORM);
  const [featuredLinkTypePickerVisible, setFeaturedLinkTypePickerVisible] = useState(false);
  const [featuredDeeplinkPickerVisible, setFeaturedDeeplinkPickerVisible] = useState(false);
  const [featuredUploading, setFeaturedUploading] = useState(false);

  // Section Banner State
  const [sectionBanners, setSectionBanners] = useState([]);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionUploading, setSectionUploading] = useState(false);

  // Form state
  const [form, setForm] = useState(INITIAL_FORM);

  // Alert state
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

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [
        bannersResult,
        statsResult,
        promoBarsResult,
        promoStatsResult,
        featuredResult,
        featuredStatsResult,
        sectionBannersResult,
      ] = await Promise.all([
        shopBannerService.getAllShopBanners(),
        shopBannerService.getBannerStats(),
        shopBannerService.getAllPromoBars(),
        shopBannerService.getPromoBarStats(),
        shopBannerService.getAllFeaturedProducts(),
        shopBannerService.getFeaturedProductStats(),
        shopBannerService.getAllSectionBanners(),
      ]);

      if (bannersResult.success) {
        setBanners(bannersResult.data);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (promoBarsResult.success) {
        setPromoBars(promoBarsResult.data);
      }

      if (promoStatsResult.success) {
        setPromoStats(promoStatsResult.data);
      }

      if (featuredResult.success) {
        setFeaturedProducts(featuredResult.data);
      }

      if (featuredStatsResult.success) {
        setFeaturedStats(featuredStatsResult.data);
      }

      if (sectionBannersResult.success) {
        setSectionBanners(sectionBannersResult.data);
      }

      // Load seen tooltips - onboarding disabled for now
      /*
      if (user?.id) {
        const tooltipsResult = await shopBannerService.getSeenTooltips(user.id);
        if (tooltipsResult.success) {
          setSeenTooltips(tooltipsResult.data);
        }
      }
      */
    } catch (error) {
      console.error('[AdminShopBanners] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Track screen focus to only show onboarding when on this screen
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        setShowOnboarding(false); // Hide onboarding when leaving screen
      };
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter banners by search
  const filteredBanners = banners.filter((banner) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      banner.title?.toLowerCase().includes(query) ||
      banner.subtitle?.toLowerCase().includes(query) ||
      banner.link_value?.toLowerCase().includes(query)
    );
  });

  // Reset form
  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingBanner(null);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  // Open edit modal
  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      link_type: banner.link_type || 'none',
      link_value: banner.link_value || '',
      display_order: banner.display_order || 0,
      is_active: banner.is_active ?? true,
      start_date: banner.start_date || null,
      end_date: banner.end_date || null,
      background_color: banner.background_color || '#1a0b2e',
      text_color: banner.text_color || '#FFFFFF',
    });
    setModalVisible(true);
  };

  // Handle image pick
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert('Lỗi', 'Cần quyền truy cập thư viện ảnh', [{ text: 'OK' }], 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        // Disable editing on Android due to CropImageContract bug
        allowsEditing: Platform.OS === 'ios',
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[AdminShopBanners] Pick image error:', error);
      showAlert('Lỗi', 'Không thể chọn hình ảnh', [{ text: 'OK' }], 'error');
    }
  };

  // Helper function to convert base64 to ArrayBuffer (React Native compatible)
  const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Upload image to Supabase storage
  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      // Read file as base64 (React Native compatible method)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to ArrayBuffer
      const arrayBuffer = base64ToArrayBuffer(base64);

      // Generate unique filename
      const filename = `shop-banner-${Date.now()}.jpg`;
      const filePath = `shop-banners/${filename}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (error) {
      console.error('[AdminShopBanners] Upload error:', error);
      showAlert('Lỗi', 'Không thể tải lên hình ảnh', [{ text: 'OK' }], 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    // Validation
    if (!form.title.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập tiêu đề banner', [{ text: 'OK' }], 'error');
      return;
    }

    if (!form.image_url.trim()) {
      showAlert('Lỗi', 'Vui lòng chọn hình ảnh banner', [{ text: 'OK' }], 'error');
      return;
    }

    setSaving(true);
    try {
      let result;
      if (editingBanner) {
        result = await shopBannerService.updateShopBanner(editingBanner.id, form);
      } else {
        result = await shopBannerService.createShopBanner(form, user?.id);
      }

      if (result.success) {
        showAlert(
          'Thành công',
          `${editingBanner ? 'Đã cập nhật' : 'Đã tạo'} banner thành công!`,
          [{ text: 'OK' }],
          'success'
        );
        setModalVisible(false);
        resetForm();
        await loadData();
      } else {
        showAlert('Lỗi', result.error || 'Không thể lưu banner', [{ text: 'OK' }], 'error');
      }
    } catch (error) {
      console.error('[AdminShopBanners] Save error:', error);
      showAlert('Lỗi', 'Đã xảy ra lỗi khi lưu', [{ text: 'OK' }], 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = (banner) => {
    showAlert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa banner "${banner.title}"?\n\nHành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const result = await shopBannerService.deleteShopBanner(banner.id);
            if (result.success) {
              await loadData();
            } else {
              showAlert('Lỗi', result.error || 'Không thể xóa banner', [{ text: 'OK' }], 'error');
            }
          },
        },
      ],
      'warning'
    );
  };

  // Handle toggle active
  const handleToggleActive = async (banner) => {
    const result = await shopBannerService.toggleBannerActive(banner.id, !banner.is_active);
    if (result.success) {
      await loadData();
    } else {
      showAlert('Lỗi', result.error || 'Không thể thay đổi trạng thái', [{ text: 'OK' }], 'error');
    }
  };

  // Format number
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get link type label
  const getLinkTypeLabel = (value) => {
    const option = LINK_TYPE_OPTIONS.find((o) => o.value === value);
    return option?.label || 'Không có liên kết';
  };

  // ========================================
  // PROMO BAR HANDLERS
  // ========================================

  // Reset promo form
  const resetPromoForm = () => {
    setPromoForm(INITIAL_PROMO_FORM);
    setEditingPromo(null);
  };

  // Open create promo modal
  const openCreatePromoModal = () => {
    resetPromoForm();
    setPromoModalVisible(true);
  };

  // Open edit promo modal
  const openEditPromoModal = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      message: promo.message || '',
      voucher_code: promo.voucher_code || '',
      link_text: promo.link_text || '',
      link_url: promo.link_url || '',
      background_color: promo.background_color || '#FF4757',
      text_color: promo.text_color || '#FFFFFF',
      is_active: promo.is_active ?? true,
      start_date: promo.start_date || null,
      end_date: promo.end_date || null,
      display_order: promo.display_order || 0,
    });
    setPromoModalVisible(true);
  };

  // Handle save promo
  const handleSavePromo = async () => {
    // Validation
    if (!promoForm.message.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập nội dung thông báo', [{ text: 'OK' }], 'error');
      return;
    }

    setSaving(true);
    try {
      let result;
      if (editingPromo) {
        result = await shopBannerService.updatePromoBar(editingPromo.id, promoForm);
      } else {
        result = await shopBannerService.createPromoBar(promoForm);
      }

      if (result.success) {
        showAlert(
          'Thành công',
          `${editingPromo ? 'Đã cập nhật' : 'Đã tạo'} promo bar thành công!`,
          [{ text: 'OK' }],
          'success'
        );
        setPromoModalVisible(false);
        resetPromoForm();
        await loadData();
      } else {
        showAlert('Lỗi', result.error || 'Không thể lưu promo bar', [{ text: 'OK' }], 'error');
      }
    } catch (error) {
      console.error('[AdminShopBanners] Save promo error:', error);
      showAlert('Lỗi', 'Đã xảy ra lỗi khi lưu', [{ text: 'OK' }], 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete promo
  const handleDeletePromo = (promo) => {
    showAlert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa promo bar này?\n\nHành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const result = await shopBannerService.deletePromoBar(promo.id);
            if (result.success) {
              await loadData();
            } else {
              showAlert('Lỗi', result.error || 'Không thể xóa promo bar', [{ text: 'OK' }], 'error');
            }
          },
        },
      ],
      'warning'
    );
  };

  // Handle toggle promo active
  const handleTogglePromoActive = async (promo) => {
    const result = await shopBannerService.togglePromoBarActive(promo.id, !promo.is_active);
    if (result.success) {
      await loadData();
    } else {
      showAlert('Lỗi', result.error || 'Không thể thay đổi trạng thái', [{ text: 'OK' }], 'error');
    }
  };

  // Filter promo bars by search
  const filteredPromoBars = promoBars.filter((promo) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      promo.message?.toLowerCase().includes(query) ||
      promo.voucher_code?.toLowerCase().includes(query) ||
      promo.link_text?.toLowerCase().includes(query)
    );
  });

  // ========================================
  // FEATURED PRODUCT HANDLERS
  // ========================================

  // Reset featured form
  const resetFeaturedForm = () => {
    setFeaturedForm(INITIAL_FEATURED_FORM);
    setEditingFeatured(null);
  };

  // Open create featured modal
  const openCreateFeaturedModal = () => {
    resetFeaturedForm();
    setFeaturedModalVisible(true);
  };

  // Open edit featured modal
  const openEditFeaturedModal = (featured) => {
    setEditingFeatured(featured);
    setFeaturedForm({
      title: featured.title || '',
      subtitle: featured.subtitle || '',
      description: featured.description || '',
      price: featured.price?.toString() || '',
      original_price: featured.original_price?.toString() || '',
      currency: featured.currency || 'VND',
      image_url: featured.image_url || '',
      badge_text: featured.badge_text || '',
      badge_color: featured.badge_color || '#FF4757',
      background_gradient_start: featured.background_gradient_start || '#1a0b2e',
      background_gradient_end: featured.background_gradient_end || '#2d1b4e',
      accent_color: featured.accent_color || '#FFD700',
      text_color: featured.text_color || '#FFFFFF',
      link_type: featured.link_type || 'collection',
      link_value: featured.link_value || '',
      cta_text: featured.cta_text || 'Xem ngay',
      layout_style: featured.layout_style || 'card',
      show_price: featured.show_price ?? true,
      show_badge: featured.show_badge ?? true,
      show_description: featured.show_description ?? true,
      is_active: featured.is_active ?? true,
      start_date: featured.start_date || null,
      end_date: featured.end_date || null,
      display_order: featured.display_order || 0,
    });
    setFeaturedModalVisible(true);
  };

  // Handle save featured
  const handleSaveFeatured = async () => {
    // Validation
    if (!featuredForm.title.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập tiêu đề sản phẩm', [{ text: 'OK' }], 'error');
      return;
    }

    if (!featuredForm.image_url.trim()) {
      showAlert('Lỗi', 'Vui lòng chọn hình ảnh sản phẩm', [{ text: 'OK' }], 'error');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...featuredForm,
        price: featuredForm.price ? parseFloat(featuredForm.price) : null,
        original_price: featuredForm.original_price ? parseFloat(featuredForm.original_price) : null,
      };

      let result;
      if (editingFeatured) {
        result = await shopBannerService.updateFeaturedProduct(editingFeatured.id, dataToSave);
      } else {
        result = await shopBannerService.createFeaturedProduct(dataToSave);
      }

      if (result.success) {
        showAlert(
          'Thành công',
          `${editingFeatured ? 'Đã cập nhật' : 'Đã tạo'} sản phẩm nổi bật thành công!`,
          [{ text: 'OK' }],
          'success'
        );
        setFeaturedModalVisible(false);
        resetFeaturedForm();
        await loadData();
      } else {
        showAlert('Lỗi', result.error || 'Không thể lưu sản phẩm', [{ text: 'OK' }], 'error');
      }
    } catch (error) {
      console.error('[AdminShopBanners] Save featured error:', error);
      showAlert('Lỗi', 'Đã xảy ra lỗi khi lưu', [{ text: 'OK' }], 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete featured
  const handleDeleteFeatured = (featured) => {
    showAlert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${featured.title}"?\n\nHành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const result = await shopBannerService.deleteFeaturedProduct(featured.id);
            if (result.success) {
              await loadData();
            } else {
              showAlert('Lỗi', result.error || 'Không thể xóa sản phẩm', [{ text: 'OK' }], 'error');
            }
          },
        },
      ],
      'warning'
    );
  };

  // Handle toggle featured active
  const handleToggleFeaturedActive = async (featured) => {
    const result = await shopBannerService.toggleFeaturedProductActive(featured.id, !featured.is_active);
    if (result.success) {
      await loadData();
    } else {
      showAlert('Lỗi', result.error || 'Không thể thay đổi trạng thái', [{ text: 'OK' }], 'error');
    }
  };

  // Handle featured image pick
  const handlePickFeaturedImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert('Lỗi', 'Cần quyền truy cập thư viện ảnh', [{ text: 'OK' }], 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        // Disable editing on Android due to CropImageContract bug
        allowsEditing: Platform.OS === 'ios',
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFeaturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[AdminShopBanners] Pick featured image error:', error);
      showAlert('Lỗi', 'Không thể chọn hình ảnh', [{ text: 'OK' }], 'error');
    }
  };

  // Upload featured image to Supabase storage
  const uploadFeaturedImage = async (uri) => {
    setFeaturedUploading(true);
    try {
      // Read file as base64 (React Native compatible method)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to ArrayBuffer
      const arrayBuffer = base64ToArrayBuffer(base64);

      const filename = `featured-product-${Date.now()}.jpg`;
      const filePath = `shop-banners/${filename}`;

      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filePath);

      setFeaturedForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (error) {
      console.error('[AdminShopBanners] Upload featured image error:', error);
      showAlert('Lỗi', 'Không thể tải lên hình ảnh', [{ text: 'OK' }], 'error');
    } finally {
      setFeaturedUploading(false);
    }
  };

  // Filter featured by search
  const filteredFeatured = featuredProducts.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.subtitle?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  // ========================================
  // SECTION BANNER HANDLERS
  // ========================================

  // Section banner form state
  const [sectionForm, setSectionForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '', // URL để mở WebView khi nhấn vào banner
    is_active: true,
  });

  // Open edit section banner modal
  const openEditSectionModal = (section) => {
    setEditingSection(section);
    setSectionForm({
      title: section.title || '',
      subtitle: section.subtitle || '',
      image_url: section.image_url || '',
      link_url: section.link_url || '',
      is_active: section.is_active ?? true,
    });
    setSectionModalVisible(true);
  };

  // Handle save section banner
  const handleSaveSectionBanner = async () => {
    if (!sectionForm.image_url.trim()) {
      showAlert('Lỗi', 'Vui lòng chọn hình ảnh banner', [{ text: 'OK' }], 'error');
      return;
    }

    setSaving(true);
    try {
      const result = await shopBannerService.upsertSectionBanner(editingSection.section_id, sectionForm);

      if (result.success) {
        showAlert('Thành công', 'Đã cập nhật section banner!', [{ text: 'OK' }], 'success');
        setSectionModalVisible(false);
        setEditingSection(null);
        await loadData();
      } else {
        showAlert('Lỗi', result.error || 'Không thể lưu banner', [{ text: 'OK' }], 'error');
      }
    } catch (error) {
      console.error('[AdminShopBanners] Save section banner error:', error);
      showAlert('Lỗi', 'Đã xảy ra lỗi khi lưu', [{ text: 'OK' }], 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle toggle section banner active
  const handleToggleSectionActive = async (section) => {
    const result = await shopBannerService.toggleSectionBannerActive(section.section_id, !section.is_active);
    if (result.success) {
      await loadData();
    } else {
      showAlert('Lỗi', result.error || 'Không thể thay đổi trạng thái', [{ text: 'OK' }], 'error');
    }
  };

  // Handle section image pick
  const handlePickSectionImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert('Lỗi', 'Cần quyền truy cập thư viện ảnh', [{ text: 'OK' }], 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        // Disable editing on Android due to CropImageContract bug
        allowsEditing: Platform.OS === 'ios',
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadSectionImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[AdminShopBanners] Pick section image error:', error);
      showAlert('Lỗi', 'Không thể chọn hình ảnh', [{ text: 'OK' }], 'error');
    }
  };

  // Upload section banner image
  const uploadSectionImage = async (uri) => {
    setSectionUploading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = base64ToArrayBuffer(base64);
      const filename = `section-banner-${Date.now()}.jpg`;
      const filePath = `shop-banners/${filename}`;

      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filePath);

      setSectionForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (error) {
      console.error('[AdminShopBanners] Upload section image error:', error);
      showAlert('Lỗi', 'Không thể tải lên hình ảnh', [{ text: 'OK' }], 'error');
    } finally {
      setSectionUploading(false);
    }
  };

  // Filter section banners by search
  const filteredSectionBanners = sectionBanners.filter((section) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.section_id?.toLowerCase().includes(query) ||
      section.title?.toLowerCase().includes(query) ||
      section.subtitle?.toLowerCase().includes(query)
    );
  });

  // Get section label from section_id
  const getSectionLabel = (sectionId) => {
    const labels = {
      'manifest-money': '💰 Manifest Tiền Bạc',
      'manifest-love': '❤️ Manifest Tình Yêu',
      'manifest-abundance': '✨ Manifest Thịnh Vượng',
      'courses': '📚 Khóa Học',
      'for-you': '🎯 Dành Cho Bạn',
      'trending': '🔥 Xu Hướng',
    };
    return labels[sectionId] || sectionId;
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Quản lý Shop</Text>
            <Text style={styles.headerSubtitle}>Banner & Promo Bar</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (activeTab === 'banners') openCreateModal();
              else if (activeTab === 'promos') openCreatePromoModal();
              else if (activeTab === 'featured') openCreateFeaturedModal();
            }}
            style={styles.addButton}
          >
            <Plus size={24} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          {TAB_OPTIONS.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <IconComponent size={16} color={isActive ? COLORS.gold : COLORS.textMuted} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          {activeTab === 'banners' && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <BarChart3 size={16} color={COLORS.gold} />
                <Text style={styles.statValue}>{stats?.total || 0}</Text>
                <Text style={styles.statLabel}>Tổng banner</Text>
              </View>
              <View style={styles.statCard}>
                <Eye size={16} color={COLORS.success} />
                <Text style={styles.statValue}>{stats?.active || 0}</Text>
                <Text style={styles.statLabel}>Đang hiển thị</Text>
              </View>
              <View style={styles.statCard}>
                <MousePointer2 size={16} color={COLORS.purple} />
                <Text style={styles.statValue}>{formatNumber(stats?.totalViews)}</Text>
                <Text style={styles.statLabel}>Lượt xem</Text>
              </View>
            </View>
          )}

          {activeTab === 'promos' && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <BarChart3 size={16} color={COLORS.gold} />
                <Text style={styles.statValue}>{promoStats?.total || 0}</Text>
                <Text style={styles.statLabel}>Tổng promo</Text>
              </View>
              <View style={styles.statCard}>
                <Eye size={16} color={COLORS.success} />
                <Text style={styles.statValue}>{promoStats?.active || 0}</Text>
                <Text style={styles.statLabel}>Đang hiển thị</Text>
              </View>
              <View style={styles.statCard}>
                <EyeOff size={16} color={COLORS.textMuted} />
                <Text style={styles.statValue}>{promoStats?.inactive || 0}</Text>
                <Text style={styles.statLabel}>Đã ẩn</Text>
              </View>
            </View>
          )}

          {activeTab === 'featured' && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Sparkles size={16} color={COLORS.gold} />
                <Text style={styles.statValue}>{featuredStats?.total || 0}</Text>
                <Text style={styles.statLabel}>Tổng SP</Text>
              </View>
              <View style={styles.statCard}>
                <Eye size={16} color={COLORS.success} />
                <Text style={styles.statValue}>{featuredStats?.active || 0}</Text>
                <Text style={styles.statLabel}>Đang hiển thị</Text>
              </View>
              <View style={styles.statCard}>
                <MousePointer2 size={16} color={COLORS.purple} />
                <Text style={styles.statValue}>{formatNumber(featuredStats?.totalClicks)}</Text>
                <Text style={styles.statLabel}>Lượt click</Text>
              </View>
            </View>
          )}

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={
                activeTab === 'banners'
                  ? 'Tìm kiếm banner...'
                  : activeTab === 'promos'
                  ? 'Tìm kiếm promo...'
                  : 'Tìm kiếm sản phẩm...'
              }
              placeholderTextColor={COLORS.textMuted}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content - Banners Tab */}
          {activeTab === 'banners' && (
            <>
              {filteredBanners.length === 0 ? (
                <View style={styles.emptyState}>
                  <ImageIcon size={60} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'Không tìm thấy banner' : 'Chưa có banner nào'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? 'Thử tìm kiếm với từ khóa khác'
                      : 'Tạo banner mới để hiển thị trong Shop'}
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
                      <Plus size={20} color={COLORS.textPrimary} />
                      <Text style={styles.createButtonText}>Tạo banner</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.bannerList}>
                  {filteredBanners.map((banner) => (
                    <ShopBannerCard
                      key={banner.id}
                      banner={banner}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          {/* Content - Promo Bar Tab */}
          {activeTab === 'promos' && (
            <>
              {filteredPromoBars.length === 0 ? (
                <View style={styles.emptyState}>
                  <Megaphone size={60} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'Không tìm thấy promo' : 'Chưa có promo bar nào'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? 'Thử tìm kiếm với từ khóa khác'
                      : 'Tạo promo bar mới để hiển thị thông báo'}
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity style={styles.createButton} onPress={openCreatePromoModal}>
                      <Plus size={20} color={COLORS.textPrimary} />
                      <Text style={styles.createButtonText}>Tạo promo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.bannerList}>
                  {filteredPromoBars.map((promo) => (
                    <View key={promo.id} style={styles.promoCard}>
                      {/* Promo Preview */}
                      <View
                        style={[
                          styles.promoPreview,
                          { backgroundColor: promo.background_color || '#FF4757' },
                        ]}
                      >
                        <Text
                          style={[styles.promoMessage, { color: promo.text_color || '#FFFFFF' }]}
                          numberOfLines={1}
                        >
                          {promo.message || 'Chưa có nội dung'}
                        </Text>
                        {promo.voucher_code && (
                          <View style={styles.voucherBadge}>
                            <Copy size={10} color={COLORS.textPrimary} />
                            <Text style={styles.voucherCode}>{promo.voucher_code}</Text>
                          </View>
                        )}
                      </View>

                      {/* Promo Info */}
                      <View style={styles.promoInfo}>
                        <View style={styles.promoHeader}>
                          <Text style={styles.promoLabel} numberOfLines={1}>
                            {promo.message?.substring(0, 40)}...
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: promo.is_active
                                  ? `${COLORS.success}20`
                                  : `${COLORS.error}20`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: promo.is_active ? COLORS.success : COLORS.error },
                              ]}
                            >
                              {promo.is_active ? 'Hiển thị' : 'Ẩn'}
                            </Text>
                          </View>
                        </View>

                        {/* Link Info */}
                        {promo.link_url && (
                          <View style={styles.promoLinkRow}>
                            <ExternalLink size={12} color={COLORS.textMuted} />
                            <Text style={styles.promoLinkText} numberOfLines={1}>
                              {promo.link_text || promo.link_url}
                            </Text>
                          </View>
                        )}

                        {/* Schedule Info */}
                        {(promo.start_date || promo.end_date) && (
                          <Text style={styles.promoSchedule}>
                            {promo.start_date
                              ? new Date(promo.start_date).toLocaleDateString('vi-VN')
                              : 'Không giới hạn'}
                            {' - '}
                            {promo.end_date
                              ? new Date(promo.end_date).toLocaleDateString('vi-VN')
                              : 'Không giới hạn'}
                          </Text>
                        )}

                        {/* Order */}
                        <Text style={styles.promoOrder}>
                          Thứ tự: {promo.display_order ?? 0}
                        </Text>

                        {/* Actions */}
                        <View style={styles.promoActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleTogglePromoActive(promo)}
                          >
                            {promo.is_active ? (
                              <EyeOff size={18} color={COLORS.textMuted} />
                            ) : (
                              <Eye size={18} color={COLORS.success} />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openEditPromoModal(promo)}
                          >
                            <Edit2 size={18} color={COLORS.purple} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDeletePromo(promo)}
                          >
                            <Trash2 size={18} color={COLORS.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Content - Featured Product Tab */}
          {activeTab === 'featured' && (
            <>
              {filteredFeatured.length === 0 ? (
                <View style={styles.emptyState}>
                  <Star size={60} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nổi bật'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? 'Thử tìm kiếm với từ khóa khác'
                      : 'Tạo sản phẩm nổi bật để hiển thị trong Shop'}
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity style={styles.createButton} onPress={openCreateFeaturedModal}>
                      <Plus size={20} color={COLORS.textPrimary} />
                      <Text style={styles.createButtonText}>Tạo sản phẩm</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.bannerList}>
                  {filteredFeatured.map((item) => (
                    <View key={item.id} style={styles.featuredCard}>
                      {/* Featured Preview */}
                      <View style={styles.featuredPreviewContainer}>
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.featuredImage}
                          resizeMode="cover"
                        />
                        {item.badge_text && (
                          <View
                            style={[
                              styles.featuredBadge,
                              { backgroundColor: item.badge_color || '#FF4757' },
                            ]}
                          >
                            <Text style={styles.featuredBadgeText}>{item.badge_text}</Text>
                          </View>
                        )}
                      </View>

                      {/* Featured Info */}
                      <View style={styles.featuredInfo}>
                        <View style={styles.featuredHeader}>
                          <Text style={styles.featuredTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: item.is_active
                                  ? `${COLORS.success}20`
                                  : `${COLORS.error}20`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: item.is_active ? COLORS.success : COLORS.error },
                              ]}
                            >
                              {item.is_active ? 'Hiển thị' : 'Ẩn'}
                            </Text>
                          </View>
                        </View>

                        {item.subtitle && (
                          <Text style={styles.featuredSubtitle} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        )}

                        {/* Price */}
                        {item.price && (
                          <View style={styles.featuredPriceRow}>
                            <Text style={styles.featuredPrice}>
                              {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                            </Text>
                            {item.original_price && item.original_price > item.price && (
                              <Text style={styles.featuredOriginalPrice}>
                                {new Intl.NumberFormat('vi-VN').format(item.original_price)}đ
                              </Text>
                            )}
                          </View>
                        )}

                        {/* Link */}
                        <View style={styles.featuredLinkRow}>
                          <ExternalLink size={12} color={COLORS.textMuted} />
                          <Text style={styles.featuredLinkText}>
                            {item.link_type}: {item.link_value || 'Chưa cấu hình'}
                          </Text>
                        </View>

                        {/* Stats */}
                        <View style={styles.featuredStatsRow}>
                          <View style={styles.featuredStat}>
                            <Eye size={12} color={COLORS.textMuted} />
                            <Text style={styles.featuredStatText}>{item.view_count || 0}</Text>
                          </View>
                          <View style={styles.featuredStat}>
                            <MousePointer2 size={12} color={COLORS.textMuted} />
                            <Text style={styles.featuredStatText}>{item.click_count || 0}</Text>
                          </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.featuredActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleToggleFeaturedActive(item)}
                          >
                            {item.is_active ? (
                              <EyeOff size={18} color={COLORS.textMuted} />
                            ) : (
                              <Eye size={18} color={COLORS.success} />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openEditFeaturedModal(item)}
                          >
                            <Edit2 size={18} color={COLORS.purple} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDeleteFeatured(item)}
                          >
                            <Trash2 size={18} color={COLORS.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Content - Sections Tab */}
          {activeTab === 'sections' && (
            <>
              {/* Section Banners Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Tag size={16} color={COLORS.gold} />
                  <Text style={styles.statValue}>{sectionBanners.length}</Text>
                  <Text style={styles.statLabel}>Tổng sections</Text>
                </View>
                <View style={styles.statCard}>
                  <Eye size={16} color={COLORS.success} />
                  <Text style={styles.statValue}>{sectionBanners.filter(s => s.is_active).length}</Text>
                  <Text style={styles.statLabel}>Đang hiển thị</Text>
                </View>
                <View style={styles.statCard}>
                  <EyeOff size={16} color={COLORS.textMuted} />
                  <Text style={styles.statValue}>{sectionBanners.filter(s => !s.is_active).length}</Text>
                  <Text style={styles.statLabel}>Đã ẩn</Text>
                </View>
              </View>

              {filteredSectionBanners.length === 0 ? (
                <View style={styles.emptyState}>
                  <Tag size={60} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'Không tìm thấy section' : 'Chưa có section banner nào'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? 'Thử tìm kiếm với từ khóa khác'
                      : 'Chạy migration để tạo section banners mặc định'}
                  </Text>
                </View>
              ) : (
                <View style={styles.bannerList}>
                  {filteredSectionBanners.map((section) => (
                    <View key={section.section_id} style={styles.sectionCard}>
                      {/* Section Preview */}
                      <View style={styles.sectionPreviewContainer}>
                        {section.image_url ? (
                          <Image
                            source={{ uri: section.image_url }}
                            style={styles.sectionImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.sectionImagePlaceholder}>
                            <ImageIcon size={32} color={COLORS.textMuted} />
                            <Text style={styles.placeholderText}>Chưa có ảnh</Text>
                          </View>
                        )}
                        {/* Section ID Badge */}
                        <View style={styles.sectionIdBadge}>
                          <Text style={styles.sectionIdText}>{section.section_id}</Text>
                        </View>
                      </View>

                      {/* Section Info */}
                      <View style={styles.sectionInfo}>
                        <View style={styles.sectionHeader}>
                          <Text style={styles.sectionTitle}>
                            {getSectionLabel(section.section_id)}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: section.is_active
                                  ? `${COLORS.success}20`
                                  : `${COLORS.error}20`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: section.is_active ? COLORS.success : COLORS.error },
                              ]}
                            >
                              {section.is_active ? 'Hiển thị' : 'Ẩn'}
                            </Text>
                          </View>
                        </View>

                        {section.title && (
                          <Text style={styles.sectionSubtitle} numberOfLines={1}>
                            {section.title}
                          </Text>
                        )}

                        {section.subtitle && (
                          <Text style={styles.sectionDescription} numberOfLines={1}>
                            {section.subtitle}
                          </Text>
                        )}

                        {/* Link Info */}
                        {section.link_value && (
                          <View style={styles.sectionLinkRow}>
                            <ExternalLink size={12} color={COLORS.textMuted} />
                            <Text style={styles.sectionLinkText} numberOfLines={1}>
                              {section.link_type}: {section.link_value}
                            </Text>
                          </View>
                        )}

                        {/* Actions */}
                        <View style={styles.sectionActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleToggleSectionActive(section)}
                          >
                            {section.is_active ? (
                              <EyeOff size={18} color={COLORS.textMuted} />
                            ) : (
                              <Eye size={18} color={COLORS.success} />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openEditSectionModal(section)}
                          >
                            <Edit2 size={18} color={COLORS.purple} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Section Banner Edit Modal */}
        <Modal
          visible={sectionModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setSectionModalVisible(false)}
        >
          <LinearGradient colors={GRADIENTS.background} style={styles.modalGradient}>
            <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setSectionModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  Sửa Section Banner
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Form */}
              <KeyboardAvoidingView
                style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
              >
                <ScrollView
                  style={styles.formScroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 300 }}
                >
                  {/* Section ID (Read-only) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Section</Text>
                    <View style={styles.readOnlyInput}>
                      <Text style={styles.readOnlyText}>
                        {getSectionLabel(editingSection?.section_id)}
                      </Text>
                    </View>
                  </View>

                  {/* Image Picker */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Hình ảnh Banner *</Text>
                    <TouchableOpacity
                      style={styles.imagePicker}
                      onPress={handlePickSectionImage}
                      disabled={sectionUploading}
                    >
                      {sectionForm.image_url ? (
                        <Image
                          source={{ uri: sectionForm.image_url }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.imagePickerPlaceholder}>
                          {sectionUploading ? (
                            <ActivityIndicator color={COLORS.gold} />
                          ) : (
                            <>
                              <Upload size={32} color={COLORS.textMuted} />
                              <Text style={styles.imagePickerText}>Chọn hình ảnh (16:9)</Text>
                            </>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Title */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tiêu đề</Text>
                    <TextInput
                      style={styles.input}
                      value={sectionForm.title}
                      onChangeText={(text) => setSectionForm((prev) => ({ ...prev, title: text }))}
                      placeholder="Nhập tiêu đề banner"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Subtitle */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phụ đề</Text>
                    <TextInput
                      style={styles.input}
                      value={sectionForm.subtitle}
                      onChangeText={(text) => setSectionForm((prev) => ({ ...prev, subtitle: text }))}
                      placeholder="Nhập phụ đề"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Link URL - WebView navigation */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Link URL (WebView)</Text>
                    <Text style={styles.inputHint}>
                      Khi người dùng nhấn vào banner sẽ mở trang web này
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={sectionForm.link_url}
                      onChangeText={(text) => setSectionForm((prev) => ({ ...prev, link_url: text }))}
                      placeholder="https://example.com/page"
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                    />
                  </View>

                  {/* Active Toggle */}
                  <View style={styles.switchRow}>
                    <Text style={styles.inputLabel}>Hiển thị banner</Text>
                    <Switch
                      value={sectionForm.is_active}
                      onValueChange={(value) =>
                        setSectionForm((prev) => ({ ...prev, is_active: value }))
                      }
                      trackColor={{ false: COLORS.bgGray, true: COLORS.success }}
                      thumbColor={COLORS.textPrimary}
                    />
                  </View>

                  <View style={{ height: 100 }} />
                </ScrollView>

                {/* Save Button */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSaveSectionBanner}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color={COLORS.textPrimary} />
                    ) : (
                      <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Create/Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setModalVisible(false)}
        >
          <LinearGradient colors={GRADIENTS.background} style={styles.modalGradient}>
            <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {editingBanner ? 'Sửa banner' : 'Tạo banner mới'}
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Form */}
              <KeyboardAvoidingView
                style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
              >
                <ScrollView
                  style={styles.formScroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Image Picker */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Hình ảnh banner *</Text>
                    <TouchableOpacity
                      style={styles.imagePicker}
                      onPress={handlePickImage}
                      disabled={uploading}
                      activeOpacity={0.7}
                    >
                      {form.image_url ? (
                        <View style={styles.imagePreviewContainer}>
                          <Image
                            source={{ uri: form.image_url }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                          />
                          {/* Edit Overlay */}
                          <View style={styles.imageEditOverlay}>
                            <View style={styles.imageEditBadge}>
                              <Edit2 size={16} color="#FFFFFF" />
                              <Text style={styles.imageEditText}>Nhấn để đổi</Text>
                            </View>
                          </View>
                          {uploading && (
                            <View style={styles.imageUploadingOverlay}>
                              <ActivityIndicator size="large" color={COLORS.gold} />
                              <Text style={styles.uploadingText}>Đang tải lên...</Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View style={styles.imagePickerPlaceholder}>
                          {uploading ? (
                            <ActivityIndicator size="small" color={COLORS.gold} />
                          ) : (
                            <>
                              <Upload size={32} color={COLORS.textMuted} />
                              <Text style={styles.imagePickerText}>Chọn hình ảnh</Text>
                              <Text style={styles.imagePickerHint}>Tỉ lệ 16:9 để hiển thị tốt nhất</Text>
                            </>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                    {form.image_url && (
                      <TouchableOpacity
                        style={styles.changeImageBtnLarge}
                        onPress={handlePickImage}
                        disabled={uploading}
                      >
                        <Upload size={16} color={COLORS.gold} />
                        <Text style={styles.changeImageTextLarge}>Đổi hình khác</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.orText}>- hoặc -</Text>
                    <TextInput
                      style={styles.input}
                      value={form.image_url}
                      onChangeText={(text) => setForm((prev) => ({ ...prev, image_url: text }))}
                      placeholder="Dán link hình ảnh trực tiếp (https://...)"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Title */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tiêu đề *</Text>
                    <TextInput
                      style={styles.input}
                      value={form.title}
                      onChangeText={(text) => setForm((prev) => ({ ...prev, title: text }))}
                      placeholder="VD: Flash Sale Cuối Năm"
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={100}
                    />
                  </View>

                  {/* Subtitle */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phụ đề</Text>
                    <TextInput
                      style={styles.input}
                      value={form.subtitle}
                      onChangeText={(text) => setForm((prev) => ({ ...prev, subtitle: text }))}
                      placeholder="VD: Giảm đến 50%"
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={200}
                    />
                  </View>

                  {/* Description */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mô tả</Text>
                    <TextInput
                      style={[styles.input, styles.inputMultiline]}
                      value={form.description}
                      onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
                      placeholder="Mô tả chi tiết về banner..."
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Link Type */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Loại liên kết</Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => setLinkTypePickerVisible(true)}
                    >
                      <Text style={styles.dropdownText}>{getLinkTypeLabel(form.link_type)}</Text>
                      <ChevronDown size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Link Value */}
                  {form.link_type !== 'none' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {form.link_type === 'screen' ? 'Chọn màn hình' : 'Giá trị liên kết'}
                      </Text>
                      {form.link_type === 'screen' ? (
                        <TouchableOpacity
                          style={styles.dropdown}
                          onPress={() => setDeeplinkPickerVisible(true)}
                        >
                          <Text
                            style={[
                              styles.dropdownText,
                              !form.link_value && styles.dropdownPlaceholder,
                            ]}
                          >
                            {form.link_value || 'Chọn màn hình...'}
                          </Text>
                          <ChevronDown size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      ) : (
                        <TextInput
                          style={styles.input}
                          value={form.link_value}
                          onChangeText={(text) => setForm((prev) => ({ ...prev, link_value: text }))}
                          placeholder={
                            form.link_type === 'url'
                              ? 'https://example.com'
                              : form.link_type === 'product'
                              ? 'ID sản phẩm'
                              : 'Tên bộ sưu tập'
                          }
                          placeholderTextColor={COLORS.textMuted}
                        />
                      )}
                    </View>
                  )}

                  {/* Display Order */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Thứ tự hiển thị</Text>
                      <View style={styles.infoTooltip}>
                        <Info size={12} color={COLORS.textMuted} />
                        <Text style={styles.infoText}>Số nhỏ hơn hiển thị trước</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={form.display_order.toString()}
                      onChangeText={(text) =>
                        setForm((prev) => ({ ...prev, display_order: parseInt(text) || 0 }))
                      }
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>

                  {/* Colors - với Color Picker */}
                  <View style={styles.colorRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ColorPicker
                        label="Màu nền"
                        value={form.background_color || '#1a0b2e'}
                        onChange={(color) =>
                          setForm((prev) => ({ ...prev, background_color: color }))
                        }
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ColorPicker
                        label="Màu chữ"
                        value={form.text_color || '#FFFFFF'}
                        onChange={(color) => setForm((prev) => ({ ...prev, text_color: color }))}
                      />
                    </View>
                  </View>

                  {/* Schedule - Start Date */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Ngày bắt đầu (để trống = hiển thị ngay)</Text>
                    <TextInput
                      style={styles.input}
                      value={form.start_date ? new Date(form.start_date).toLocaleDateString('vi-VN') : ''}
                      onChangeText={(text) => {
                        // Parse Vietnamese date format DD/MM/YYYY
                        const parts = text.split('/');
                        if (parts.length === 3) {
                          const date = new Date(parts[2], parts[1] - 1, parts[0]);
                          if (!isNaN(date.getTime())) {
                            setForm((prev) => ({ ...prev, start_date: date.toISOString() }));
                          }
                        } else if (!text) {
                          setForm((prev) => ({ ...prev, start_date: null }));
                        }
                      }}
                      placeholder="DD/MM/YYYY (để trống = hiển thị ngay)"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Schedule - End Date */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Ngày kết thúc (để trống = không giới hạn)</Text>
                    <TextInput
                      style={styles.input}
                      value={form.end_date ? new Date(form.end_date).toLocaleDateString('vi-VN') : ''}
                      onChangeText={(text) => {
                        // Parse Vietnamese date format DD/MM/YYYY
                        const parts = text.split('/');
                        if (parts.length === 3) {
                          const date = new Date(parts[2], parts[1] - 1, parts[0]);
                          if (!isNaN(date.getTime())) {
                            setForm((prev) => ({ ...prev, end_date: date.toISOString() }));
                          }
                        } else if (!text) {
                          setForm((prev) => ({ ...prev, end_date: null }));
                        }
                      }}
                      placeholder="DD/MM/YYYY (để trống = không giới hạn)"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Active Switch */}
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Kích hoạt ngay</Text>
                    <Switch
                      value={form.is_active}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, is_active: value }))}
                      trackColor={{ false: COLORS.textMuted, true: COLORS.success }}
                      thumbColor={COLORS.textPrimary}
                    />
                  </View>

                  <View style={{ height: 30 }} />
                </ScrollView>
              </KeyboardAvoidingView>

              {/* Bottom Buttons */}
              <View style={styles.bottomButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
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

        {/* Link Type Picker Modal */}
        <Modal
          visible={linkTypePickerVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setLinkTypePickerVisible(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Chọn loại liên kết</Text>
                <TouchableOpacity onPress={() => setLinkTypePickerVisible(false)}>
                  <X size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList}>
                {LINK_TYPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerItem,
                      form.link_type === option.value && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setForm((prev) => ({
                        ...prev,
                        link_type: option.value,
                        link_value: option.value === 'none' ? '' : prev.link_value,
                      }));
                      setLinkTypePickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        form.link_type === option.value && styles.pickerItemTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Deep Link Picker */}
        <DeepLinkPicker
          visible={deeplinkPickerVisible}
          onClose={() => setDeeplinkPickerVisible(false)}
          onSelect={(value) => setForm((prev) => ({ ...prev, link_value: value }))}
          selectedValue={form.link_value}
          title="Chọn màn hình"
        />

        {/* Promo Bar Create/Edit Modal */}
        <Modal
          visible={promoModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setPromoModalVisible(false)}
        >
          <LinearGradient colors={GRADIENTS.background} style={styles.modalGradient}>
            <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setPromoModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {editingPromo ? 'Sửa promo bar' : 'Tạo promo bar mới'}
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Promo Form */}
              <KeyboardAvoidingView
                style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
              >
                <ScrollView
                  style={styles.formScroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Message */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nội dung thông báo *</Text>
                    <TextInput
                      style={[styles.input, styles.inputMultiline]}
                      value={promoForm.message}
                      onChangeText={(text) => setPromoForm((prev) => ({ ...prev, message: text }))}
                      placeholder="VD: Giảm 20% cho đơn hàng đầu tiên!"
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                      numberOfLines={2}
                      maxLength={200}
                    />
                  </View>

                  {/* Voucher Code */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mã voucher (tùy chọn)</Text>
                    <TextInput
                      style={styles.input}
                      value={promoForm.voucher_code}
                      onChangeText={(text) => setPromoForm((prev) => ({ ...prev, voucher_code: text.toUpperCase() }))}
                      placeholder="VD: WELCOME20"
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="characters"
                      maxLength={20}
                    />
                  </View>

                  {/* Link Text */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Văn bản liên kết (tùy chọn)</Text>
                    <TextInput
                      style={styles.input}
                      value={promoForm.link_text}
                      onChangeText={(text) => setPromoForm((prev) => ({ ...prev, link_text: text }))}
                      placeholder="VD: Xem ngay"
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={50}
                    />
                  </View>

                  {/* Link URL */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>URL liên kết (tùy chọn)</Text>
                    <TextInput
                      style={styles.input}
                      value={promoForm.link_url}
                      onChangeText={(text) => setPromoForm((prev) => ({ ...prev, link_url: text }))}
                      placeholder="https://... hoặc gem://ScreenName"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Colors - với Color Picker */}
                  <View style={styles.colorRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ColorPicker
                        label="Màu nền"
                        value={promoForm.background_color || '#FF4757'}
                        onChange={(color) =>
                          setPromoForm((prev) => ({ ...prev, background_color: color }))
                        }
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ColorPicker
                        label="Màu chữ"
                        value={promoForm.text_color || '#FFFFFF'}
                        onChange={(color) => setPromoForm((prev) => ({ ...prev, text_color: color }))}
                      />
                    </View>
                  </View>

                  {/* Preview */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Xem trước</Text>
                    <View
                      style={[
                        styles.promoPreviewLarge,
                        { backgroundColor: promoForm.background_color || '#FF4757' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.promoPreviewText,
                          { color: promoForm.text_color || '#FFFFFF' },
                        ]}
                        numberOfLines={2}
                      >
                        {promoForm.message || 'Nội dung thông báo sẽ hiển thị ở đây'}
                      </Text>
                      {promoForm.voucher_code && (
                        <View style={styles.previewVoucher}>
                          <Copy size={12} color={promoForm.text_color || '#FFFFFF'} />
                          <Text style={[styles.previewVoucherText, { color: promoForm.text_color || '#FFFFFF' }]}>
                            {promoForm.voucher_code}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Display Order */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Thứ tự hiển thị</Text>
                      <View style={styles.infoTooltip}>
                        <Info size={12} color={COLORS.textMuted} />
                        <Text style={styles.infoText}>Số nhỏ hơn hiển thị trước</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={promoForm.display_order.toString()}
                      onChangeText={(text) =>
                        setPromoForm((prev) => ({ ...prev, display_order: parseInt(text) || 0 }))
                      }
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>

                  {/* Schedule - Start Date */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Ngày bắt đầu (để trống = hiển thị ngay)</Text>
                    <TextInput
                      style={styles.input}
                      value={promoForm.start_date ? new Date(promoForm.start_date).toLocaleDateString('vi-VN') : ''}
                      onChangeText={(text) => {
                        const parts = text.split('/');
                        if (parts.length === 3) {
                          const date = new Date(parts[2], parts[1] - 1, parts[0]);
                          if (!isNaN(date.getTime())) {
                            setPromoForm((prev) => ({ ...prev, start_date: date.toISOString() }));
                          }
                        } else if (!text) {
                          setPromoForm((prev) => ({ ...prev, start_date: null }));
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Schedule - End Date */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Ngày kết thúc (để trống = không giới hạn)</Text>
                    <TextInput
                      style={styles.input}
                      value={promoForm.end_date ? new Date(promoForm.end_date).toLocaleDateString('vi-VN') : ''}
                      onChangeText={(text) => {
                        const parts = text.split('/');
                        if (parts.length === 3) {
                          const date = new Date(parts[2], parts[1] - 1, parts[0]);
                          if (!isNaN(date.getTime())) {
                            setPromoForm((prev) => ({ ...prev, end_date: date.toISOString() }));
                          }
                        } else if (!text) {
                          setPromoForm((prev) => ({ ...prev, end_date: null }));
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Active Switch */}
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Kích hoạt ngay</Text>
                    <Switch
                      value={promoForm.is_active}
                      onValueChange={(value) => setPromoForm((prev) => ({ ...prev, is_active: value }))}
                      trackColor={{ false: COLORS.textMuted, true: COLORS.success }}
                      thumbColor={COLORS.textPrimary}
                    />
                  </View>

                  <View style={{ height: 30 }} />
                </ScrollView>
              </KeyboardAvoidingView>

              {/* Bottom Buttons */}
              <View style={styles.bottomButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setPromoModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSavePromo}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                  ) : (
                    <Text style={styles.saveButtonText}>Lưu promo</Text>
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Featured Product Create/Edit Modal */}
        <Modal
          visible={featuredModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setFeaturedModalVisible(false)}
        >
          <LinearGradient colors={GRADIENTS.background} style={styles.modalGradient}>
            <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setFeaturedModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {editingFeatured ? 'Sửa sản phẩm nổi bật' : 'Tạo sản phẩm nổi bật'}
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Featured Form */}
              <KeyboardAvoidingView
                style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
              >
                <ScrollView
                  style={styles.formScroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Image Picker */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Hình ảnh sản phẩm *</Text>
                    <TouchableOpacity
                      style={styles.featuredImagePicker}
                      onPress={handlePickFeaturedImage}
                      disabled={featuredUploading}
                    >
                      {featuredForm.image_url ? (
                        <Image
                          source={{ uri: featuredForm.image_url }}
                          style={styles.featuredImagePreview}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.imagePickerPlaceholder}>
                          {featuredUploading ? (
                            <ActivityIndicator size="small" color={COLORS.gold} />
                          ) : (
                            <>
                              <Upload size={32} color={COLORS.textMuted} />
                              <Text style={styles.imagePickerText}>Chọn hình ảnh</Text>
                              <Text style={styles.imagePickerHint}>Tỉ lệ 1:1 hoặc 4:3</Text>
                            </>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                    {featuredForm.image_url && (
                      <TouchableOpacity
                        style={styles.changeImageBtn}
                        onPress={handlePickFeaturedImage}
                      >
                        <Text style={styles.changeImageText}>Đổi hình khác</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.orText}>- hoặc -</Text>
                    <TextInput
                      style={styles.input}
                      value={featuredForm.image_url}
                      onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, image_url: text }))}
                      placeholder="Dán link hình ảnh trực tiếp (https://...)"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Title */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tiêu đề sản phẩm *</Text>
                    <TextInput
                      style={styles.input}
                      value={featuredForm.title}
                      onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, title: text }))}
                      placeholder="VD: Bộ Đá Thạch Anh Tím Premium"
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={100}
                    />
                  </View>

                  {/* Subtitle */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phụ đề (slogan)</Text>
                    <TextInput
                      style={styles.input}
                      value={featuredForm.subtitle}
                      onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, subtitle: text }))}
                      placeholder="VD: Năng lượng tâm linh mạnh mẽ"
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={100}
                    />
                  </View>

                  {/* Description */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mô tả</Text>
                    <TextInput
                      style={[styles.input, styles.inputMultiline]}
                      value={featuredForm.description}
                      onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, description: text }))}
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Price Row */}
                  <View style={styles.colorRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Giá bán</Text>
                      <TextInput
                        style={styles.input}
                        value={featuredForm.price}
                        onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, price: text }))}
                        placeholder="2890000"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Giá gốc (nếu có)</Text>
                      <TextInput
                        style={styles.input}
                        value={featuredForm.original_price}
                        onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, original_price: text }))}
                        placeholder="3500000"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  {/* Badge */}
                  <View style={styles.colorRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Badge (nhãn)</Text>
                      <TextInput
                        style={styles.input}
                        value={featuredForm.badge_text}
                        onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, badge_text: text }))}
                        placeholder="HOT, SALE, MỚI..."
                        placeholderTextColor={COLORS.textMuted}
                        maxLength={20}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Màu badge</Text>
                      <TextInput
                        style={styles.input}
                        value={featuredForm.badge_color}
                        onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, badge_color: text }))}
                        placeholder="#FF4757"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>

                  {/* CTA Text */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nút kêu gọi hành động (CTA)</Text>
                    <TextInput
                      style={styles.input}
                      value={featuredForm.cta_text}
                      onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, cta_text: text }))}
                      placeholder="Xem ngay, Mua ngay, Khám phá..."
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={30}
                    />
                  </View>

                  {/* Link Type */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Loại liên kết</Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => setFeaturedLinkTypePickerVisible(true)}
                    >
                      <Text style={styles.dropdownText}>{getLinkTypeLabel(featuredForm.link_type)}</Text>
                      <ChevronDown size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Link Value */}
                  {featuredForm.link_type !== 'none' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {featuredForm.link_type === 'screen' ? 'Chọn màn hình' : 'Giá trị liên kết'}
                      </Text>
                      {featuredForm.link_type === 'screen' ? (
                        <TouchableOpacity
                          style={styles.dropdown}
                          onPress={() => setFeaturedDeeplinkPickerVisible(true)}
                        >
                          <Text
                            style={[
                              styles.dropdownText,
                              !featuredForm.link_value && styles.dropdownPlaceholder,
                            ]}
                          >
                            {featuredForm.link_value || 'Chọn màn hình...'}
                          </Text>
                          <ChevronDown size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      ) : (
                        <TextInput
                          style={styles.input}
                          value={featuredForm.link_value}
                          onChangeText={(text) => setFeaturedForm((prev) => ({ ...prev, link_value: text }))}
                          placeholder={
                            featuredForm.link_type === 'url'
                              ? 'https://example.com'
                              : featuredForm.link_type === 'product'
                              ? 'ID sản phẩm'
                              : 'Tên bộ sưu tập (VD: crystals)'
                          }
                          placeholderTextColor={COLORS.textMuted}
                        />
                      )}
                    </View>
                  )}

                  {/* Gradient Colors - với Color Picker */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Màu gradient nền</Text>
                    <View style={styles.colorRow}>
                      <View style={{ flex: 1 }}>
                        <ColorPicker
                          label="Bắt đầu"
                          value={featuredForm.background_gradient_start || '#1a0b2e'}
                          onChange={(color) => setFeaturedForm((prev) => ({ ...prev, background_gradient_start: color }))}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ColorPicker
                          label="Kết thúc"
                          value={featuredForm.background_gradient_end || '#2d1b4e'}
                          onChange={(color) => setFeaturedForm((prev) => ({ ...prev, background_gradient_end: color }))}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Accent & Text Colors - với Color Picker */}
                  <View style={styles.colorRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ColorPicker
                        label="Màu nhấn"
                        value={featuredForm.accent_color || '#FFD700'}
                        onChange={(color) => setFeaturedForm((prev) => ({ ...prev, accent_color: color }))}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ColorPicker
                        label="Màu chữ"
                        value={featuredForm.text_color || '#FFFFFF'}
                        onChange={(color) => setFeaturedForm((prev) => ({ ...prev, text_color: color }))}
                      />
                    </View>
                  </View>

                  {/* Display Toggles */}
                  <View style={styles.toggleSection}>
                    <Text style={styles.sectionLabel}>Hiển thị</Text>
                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Hiển thị giá</Text>
                      <Switch
                        value={featuredForm.show_price}
                        onValueChange={(value) => setFeaturedForm((prev) => ({ ...prev, show_price: value }))}
                        trackColor={{ false: COLORS.textMuted, true: COLORS.success }}
                        thumbColor={COLORS.textPrimary}
                      />
                    </View>
                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Hiển thị badge</Text>
                      <Switch
                        value={featuredForm.show_badge}
                        onValueChange={(value) => setFeaturedForm((prev) => ({ ...prev, show_badge: value }))}
                        trackColor={{ false: COLORS.textMuted, true: COLORS.success }}
                        thumbColor={COLORS.textPrimary}
                      />
                    </View>
                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Hiển thị mô tả</Text>
                      <Switch
                        value={featuredForm.show_description}
                        onValueChange={(value) => setFeaturedForm((prev) => ({ ...prev, show_description: value }))}
                        trackColor={{ false: COLORS.textMuted, true: COLORS.success }}
                        thumbColor={COLORS.textPrimary}
                      />
                    </View>
                  </View>

                  {/* Display Order */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Thứ tự hiển thị</Text>
                      <View style={styles.infoTooltip}>
                        <Info size={12} color={COLORS.textMuted} />
                        <Text style={styles.infoText}>Số nhỏ hơn hiển thị trước</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={featuredForm.display_order.toString()}
                      onChangeText={(text) =>
                        setFeaturedForm((prev) => ({ ...prev, display_order: parseInt(text) || 0 }))
                      }
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>

                  {/* Schedule */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Ngày bắt đầu (để trống = hiển thị ngay)</Text>
                    <TextInput
                      style={styles.input}
                      value={featuredForm.start_date ? new Date(featuredForm.start_date).toLocaleDateString('vi-VN') : ''}
                      onChangeText={(text) => {
                        const parts = text.split('/');
                        if (parts.length === 3) {
                          const date = new Date(parts[2], parts[1] - 1, parts[0]);
                          if (!isNaN(date.getTime())) {
                            setFeaturedForm((prev) => ({ ...prev, start_date: date.toISOString() }));
                          }
                        } else if (!text) {
                          setFeaturedForm((prev) => ({ ...prev, start_date: null }));
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Ngày kết thúc (để trống = không giới hạn)</Text>
                    <TextInput
                      style={styles.input}
                      value={featuredForm.end_date ? new Date(featuredForm.end_date).toLocaleDateString('vi-VN') : ''}
                      onChangeText={(text) => {
                        const parts = text.split('/');
                        if (parts.length === 3) {
                          const date = new Date(parts[2], parts[1] - 1, parts[0]);
                          if (!isNaN(date.getTime())) {
                            setFeaturedForm((prev) => ({ ...prev, end_date: date.toISOString() }));
                          }
                        } else if (!text) {
                          setFeaturedForm((prev) => ({ ...prev, end_date: null }));
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  {/* Active Switch */}
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Kích hoạt ngay</Text>
                    <Switch
                      value={featuredForm.is_active}
                      onValueChange={(value) => setFeaturedForm((prev) => ({ ...prev, is_active: value }))}
                      trackColor={{ false: COLORS.textMuted, true: COLORS.success }}
                      thumbColor={COLORS.textPrimary}
                    />
                  </View>

                  {/* Preview Section */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.sectionLabel}>Xem trước</Text>
                    <View style={styles.featuredPreviewCard}>
                      <LinearGradient
                        colors={[
                          featuredForm.background_gradient_start || '#1a0b2e',
                          featuredForm.background_gradient_end || '#2d1b4e',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.featuredPreviewGradient}
                      >
                        {featuredForm.show_badge && featuredForm.badge_text && (
                          <View
                            style={[
                              styles.previewBadge,
                              { backgroundColor: featuredForm.badge_color || '#FF4757' },
                            ]}
                          >
                            <Text style={styles.previewBadgeText}>{featuredForm.badge_text}</Text>
                          </View>
                        )}
                        <View style={styles.featuredPreviewContent}>
                          <View style={styles.featuredPreviewInfo}>
                            <Text
                              style={[styles.previewTitle, { color: featuredForm.text_color || '#FFFFFF' }]}
                              numberOfLines={2}
                            >
                              {featuredForm.title || 'Tiêu đề sản phẩm'}
                            </Text>
                            {featuredForm.subtitle && (
                              <Text
                                style={[styles.previewSubtitle, { color: featuredForm.accent_color || COLORS.gold }]}
                                numberOfLines={1}
                              >
                                {featuredForm.subtitle}
                              </Text>
                            )}
                            {featuredForm.show_description && featuredForm.description && (
                              <Text
                                style={[styles.previewDescription, { color: `${featuredForm.text_color || '#FFFFFF'}99` }]}
                                numberOfLines={2}
                              >
                                {featuredForm.description}
                              </Text>
                            )}
                            {featuredForm.show_price && featuredForm.price && (
                              <View style={styles.previewPriceRow}>
                                <Text style={[styles.previewPrice, { color: featuredForm.accent_color || COLORS.gold }]}>
                                  {new Intl.NumberFormat('vi-VN').format(parseFloat(featuredForm.price) || 0)}đ
                                </Text>
                                {featuredForm.original_price && parseFloat(featuredForm.original_price) > parseFloat(featuredForm.price) && (
                                  <Text style={styles.previewOriginalPrice}>
                                    {new Intl.NumberFormat('vi-VN').format(parseFloat(featuredForm.original_price))}đ
                                  </Text>
                                )}
                              </View>
                            )}
                            <View
                              style={[
                                styles.previewCTA,
                                { backgroundColor: featuredForm.accent_color || COLORS.gold },
                              ]}
                            >
                              <Text style={styles.previewCTAText}>{featuredForm.cta_text || 'Xem ngay'}</Text>
                            </View>
                          </View>
                          <View style={styles.featuredPreviewImageContainer}>
                            {featuredForm.image_url ? (
                              <Image
                                source={{ uri: featuredForm.image_url }}
                                style={styles.featuredPreviewImg}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.featuredPreviewImgPlaceholder}>
                                <ImageIcon size={24} color={COLORS.textMuted} />
                              </View>
                            )}
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={{ height: 30 }} />
                </ScrollView>
              </KeyboardAvoidingView>

              {/* Bottom Buttons */}
              <View style={styles.bottomButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setFeaturedModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSaveFeatured}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                  ) : (
                    <Text style={styles.saveButtonText}>Lưu sản phẩm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Featured Link Type Picker Modal */}
        <Modal
          visible={featuredLinkTypePickerVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFeaturedLinkTypePickerVisible(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Chọn loại liên kết</Text>
                <TouchableOpacity onPress={() => setFeaturedLinkTypePickerVisible(false)}>
                  <X size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList}>
                {LINK_TYPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerItem,
                      featuredForm.link_type === option.value && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setFeaturedForm((prev) => ({
                        ...prev,
                        link_type: option.value,
                        link_value: option.value === 'none' ? '' : prev.link_value,
                      }));
                      setFeaturedLinkTypePickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        featuredForm.link_type === option.value && styles.pickerItemTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Featured Deep Link Picker */}
        <DeepLinkPicker
          visible={featuredDeeplinkPickerVisible}
          onClose={() => setFeaturedDeeplinkPickerVisible(false)}
          onSelect={(value) => setFeaturedForm((prev) => ({ ...prev, link_value: value }))}
          selectedValue={featuredForm.link_value}
          title="Chọn màn hình"
        />

        {/* Custom Alert */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onClose={closeAlert}
        />

        {/* Onboarding Tooltips - DISABLED for now
        {showOnboarding && user?.id && isFocused && (
          <TooltipSequence
            tooltips={SHOP_BANNER_TOOLTIPS}
            userId={user.id}
            onComplete={() => setShowOnboarding(false)}
          />
        )}
        */}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: COLORS.textMuted, marginTop: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: SPACING.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  addButton: { padding: 8 },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderColor: COLORS.gold,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },

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
    gap: 6,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.gold },
  statLabel: { fontSize: 10, color: COLORS.textMuted },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: SPACING.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    marginLeft: 10,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
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

  // Modal
  modalGradient: { flex: 1 },
  modalContainer: { flex: 1 },
  modalHeader: {
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
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  formContainer: { flex: 1 },
  formScroll: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },

  // Form
  inputGroup: { marginBottom: SPACING.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  inputLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  infoTooltip: { flexDirection: 'row', alignItems: 'center', marginLeft: 8, gap: 4 },
  infoText: { fontSize: 10, color: COLORS.textSubtle },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },

  // Image Picker
  imagePicker: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: { width: '100%', height: '100%' },
  imageEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
  },
  imageEditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  imageEditText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadingText: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '500',
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePickerText: { fontSize: 14, color: COLORS.textMuted },
  imagePickerHint: { fontSize: 11, color: COLORS.textSubtle },
  changeImageBtn: { alignSelf: 'center', marginTop: 8 },
  changeImageText: { fontSize: 12, color: COLORS.purple },
  changeImageBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignSelf: 'center',
  },
  changeImageTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },
  orText: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginVertical: 8 },

  // Dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: { fontSize: 15, color: COLORS.textPrimary, flex: 1 },
  dropdownPlaceholder: { color: COLORS.textMuted },

  // Color Row
  colorRow: { flexDirection: 'row', gap: SPACING.md },

  // Switch
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  switchLabel: { fontSize: 14, color: COLORS.textSecondary },

  // Bottom Buttons
  bottomButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: COLORS.bgMid,
  },
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
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },

  // Link Type Picker
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  pickerList: { padding: SPACING.lg },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  pickerItemSelected: { backgroundColor: 'rgba(106, 91, 255, 0.15)' },
  pickerItemText: { fontSize: 15, color: COLORS.textPrimary },
  pickerItemTextSelected: { color: COLORS.gold, fontWeight: '600' },

  // Promo Bar Card
  promoCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  promoPreview: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoMessage: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  voucherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    marginLeft: 8,
  },
  voucherCode: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  promoInfo: {
    padding: SPACING.md,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  promoLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  promoLinkText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  promoSchedule: {
    fontSize: 11,
    color: COLORS.textSubtle,
    marginBottom: 4,
  },
  promoOrder: {
    fontSize: 10,
    color: COLORS.textSubtle,
    marginBottom: 8,
  },
  promoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: SPACING.sm,
  },
  actionButton: {
    padding: 8,
  },

  // Promo Preview in Modal
  promoPreviewLarge: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  promoPreviewText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewVoucher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  previewVoucherText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Featured Product Card
  featuredCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    flexDirection: 'row',
  },
  featuredPreviewContainer: {
    width: 100,
    height: 120,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  featuredInfo: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.xs,
  },
  featuredSubtitle: {
    fontSize: 11,
    color: COLORS.gold,
    marginTop: 2,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
  },
  featuredOriginalPrice: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  featuredLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  featuredLinkText: {
    fontSize: 10,
    color: COLORS.textSubtle,
  },
  featuredStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredStatText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  featuredActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },

  // Featured Product Form Styles
  featuredImagePicker: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  featuredImagePreview: {
    width: '100%',
    height: '100%',
  },
  inputHint: {
    fontSize: 10,
    color: COLORS.textSubtle,
    marginBottom: 4,
  },
  toggleSection: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  // Featured Preview Card Styles
  featuredPreviewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  featuredPreviewGradient: {
    padding: SPACING.md,
    minHeight: 160,
    position: 'relative',
  },
  previewBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  featuredPreviewContent: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  featuredPreviewInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  previewDescription: {
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 8,
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  previewOriginalPrice: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
  },
  previewCTA: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  previewCTAText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a0b2e',
  },
  featuredPreviewImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredPreviewImg: {
    width: '100%',
    height: '100%',
  },
  featuredPreviewImgPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section Banner Card Styles
  sectionCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    flexDirection: 'row',
  },
  sectionPreviewContainer: {
    width: 120,
    height: 90,
    position: 'relative',
  },
  sectionImage: {
    width: '100%',
    height: '100%',
  },
  sectionImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  sectionIdBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectionIdText: {
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionInfo: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.gold,
    marginTop: 2,
  },
  sectionDescription: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sectionLinkText: {
    fontSize: 10,
    color: COLORS.textSubtle,
    flex: 1,
  },
  sectionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },

  // Read-only input for section ID
  readOnlyInput: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  readOnlyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
