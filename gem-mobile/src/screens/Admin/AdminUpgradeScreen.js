/**
 * GEM Mobile - Admin Upgrade Management Screen
 * Manage upgrade tiers, banners, and view analytics
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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Plus,
  X,
  Search,
  ChevronDown,
  Eye,
  EyeOff,
  BarChart3,
  MousePointer2,
  TrendingUp,
  Edit2,
  Trash2,
  Crown,
  Sparkles,
  Zap,
  DollarSign,
  Users,
  ShoppingCart,
  Target,
  Settings,
  Check,
  Package,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, GLASS, TYPOGRAPHY } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import CustomAlert from '../../components/CustomAlert';
import {
  getTiersByType,
  getAllBanners,
  getUpgradeAnalytics,
  createTier,
  updateTier,
  deleteTier,
  createBanner,
  updateBanner,
  deleteBanner,
  TIER_TYPES,
  TRIGGER_TYPES,
  formatPrice,
} from '../../services/upgradeService';
import { supabase } from '../../services/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tab options
const TAB_OPTIONS = [
  { key: 'tiers', label: 'Goi dich vu', icon: Package },
  { key: 'banners', label: 'Banners', icon: Sparkles },
  { key: 'analytics', label: 'Phan tich', icon: BarChart3 },
];

// Tier type tabs
const TIER_TYPE_TABS = [
  { key: 'scanner', label: 'Scanner', icon: Zap },
  { key: 'chatbot', label: 'Chatbot', icon: Crown },
  { key: 'course', label: 'Course', icon: Package },
];

const AdminUpgradeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tiers');
  const [activeTierType, setActiveTierType] = useState('scanner');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data
  const [tiers, setTiers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState('tier'); // 'tier' or 'banner'
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Delete confirmation state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteType, setDeleteType] = useState('tier');

  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [activeTab, activeTierType])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'tiers') {
        const tiersData = await getTiersByType(activeTierType);
        setTiers(tiersData);
      } else if (activeTab === 'banners') {
        const bannersData = await getAllBanners();
        setBanners(bannersData);
      } else if (activeTab === 'analytics') {
        const analyticsData = await getUpgradeAnalytics();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('[AdminUpgrade] Error loading data:', error);
      showAlert('Loi', 'Khong the tai du lieu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
  };

  const handleEditTier = (tier) => {
    setEditingItem(tier);
    setEditType('tier');
    setIsCreateMode(false);
    setEditModalVisible(true);
  };

  const handleEditBanner = (banner) => {
    setEditingItem(banner);
    setEditType('banner');
    setIsCreateMode(false);
    setEditModalVisible(true);
  };

  // Create handlers
  const handleCreateTier = () => {
    setEditingItem({
      tier_type: activeTierType,
      tier_level: tiers.length + 1,
      tier_name: '',
      short_description: '',
      price_vnd: 0,
      original_price_vnd: 0,
      features_json: [],
      is_active: true,
      is_featured: false,
    });
    setEditType('tier');
    setIsCreateMode(true);
    setEditModalVisible(true);
  };

  const handleCreateBanner = () => {
    setEditingItem({
      banner_key: `banner_${Date.now()}`,
      trigger_type: 'promotion',
      tier_type: 'scanner',
      tier_level: 1,
      title: '',
      subtitle: '',
      cta_text: 'Nâng cấp ngay',
      is_active: true,
    });
    setEditType('banner');
    setIsCreateMode(true);
    setEditModalVisible(true);
  };

  // Delete handlers
  const handleDeleteTier = (tier) => {
    setDeletingItem(tier);
    setDeleteType('tier');
    setDeleteModalVisible(true);
  };

  const handleDeleteBanner = (banner) => {
    setDeletingItem(banner);
    setDeleteType('banner');
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === 'tier') {
        await deleteTier(deletingItem.id);
        showAlert('Thanh cong', 'Da xoa tier', 'success');
      } else {
        await deleteBanner(deletingItem.id);
        showAlert('Thanh cong', 'Da xoa banner', 'success');
      }
      setDeleteModalVisible(false);
      setDeletingItem(null);
      await loadData();
    } catch (error) {
      console.error('[AdminUpgrade] Error deleting:', error);
      showAlert('Loi', 'Khong the xoa', 'error');
    }
  };

  const handleToggleTierActive = async (tier) => {
    try {
      await updateTier(tier.id, { is_active: !tier.is_active });
      await loadData();
      showAlert('Thanh cong', `Da ${tier.is_active ? 'tat' : 'bat'} goi dich vu`, 'success');
    } catch (error) {
      console.error('[AdminUpgrade] Error toggling tier:', error);
      showAlert('Loi', 'Khong the cap nhat', 'error');
    }
  };

  const handleToggleBannerActive = async (banner) => {
    try {
      await updateBanner(banner.id, { is_active: !banner.is_active });
      await loadData();
      showAlert('Thanh cong', `Da ${banner.is_active ? 'tat' : 'bat'} banner`, 'success');
    } catch (error) {
      console.error('[AdminUpgrade] Error toggling banner:', error);
      showAlert('Loi', 'Khong the cap nhat', 'error');
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (isCreateMode) {
        // Create new item
        if (editType === 'tier') {
          await createTier(editingItem);
          showAlert('Thanh cong', 'Da tao tier moi', 'success');
        } else {
          await createBanner(editingItem);
          showAlert('Thanh cong', 'Da tao banner moi', 'success');
        }
      } else {
        // Update existing item
        if (editType === 'tier') {
          await updateTier(editingItem.id, editingItem);
        } else {
          await updateBanner(editingItem.id, editingItem);
        }
        showAlert('Thanh cong', 'Da luu thay doi', 'success');
      }
      setEditModalVisible(false);
      setEditingItem(null);
      setIsCreateMode(false);
      await loadData();
    } catch (error) {
      console.error('[AdminUpgrade] Error saving:', error);
      showAlert('Loi', 'Khong the luu', 'error');
    }
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Quan ly Upgrade</Text>
      <View style={styles.headerRight} />
    </View>
  );

  // Render tab bar
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {TAB_OPTIONS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              size={18}
              color={isActive ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[styles.tabText, isActive && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Render tier type tabs
  const renderTierTypeTabs = () => (
    <View style={styles.tierTypeTabs}>
      {TIER_TYPE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTierType === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tierTypeTab, isActive && styles.tierTypeTabActive]}
            onPress={() => setActiveTierType(tab.key)}
          >
            <Icon
              size={16}
              color={isActive ? COLORS.bgDarkest : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tierTypeTabText,
                isActive && styles.tierTypeTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Render tier card
  const renderTierCard = (tier) => (
    <View key={tier.id} style={styles.tierCard}>
      <View style={styles.tierHeader}>
        <View style={styles.tierInfo}>
          <View style={[styles.tierBadge, { backgroundColor: tier.is_featured ? COLORS.gold : COLORS.glassBg }]}>
            {tier.is_featured && <Crown size={14} color={COLORS.bgDarkest} />}
            <Text style={[styles.tierLevel, tier.is_featured && styles.tierLevelFeatured]}>
              Tier {tier.tier_level}
            </Text>
          </View>
          <Text style={styles.tierName}>{tier.tier_name}</Text>
        </View>
        <View style={styles.tierActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleTierActive(tier)}
          >
            {tier.is_active ? (
              <Eye size={18} color={COLORS.success} />
            ) : (
              <EyeOff size={18} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditTier(tier)}
          >
            <Edit2 size={18} color={COLORS.gold} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteTier(tier)}
          >
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tierDetails}>
        <View style={styles.tierPrice}>
          <DollarSign size={16} color={COLORS.gold} />
          <Text style={styles.tierPriceText}>
            {formatPrice(tier.price_vnd)} VND
          </Text>
          {tier.original_price_vnd > tier.price_vnd && (
            <Text style={styles.tierOriginalPrice}>
              {formatPrice(tier.original_price_vnd)}
            </Text>
          )}
        </View>

        <View style={styles.tierFeatures}>
          {(tier.features_json || []).slice(0, 3).map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Check size={12} color={COLORS.success} />
              <Text style={styles.featureText} numberOfLines={1}>
                {feature}
              </Text>
            </View>
          ))}
          {(tier.features_json || []).length > 3 && (
            <Text style={styles.moreFeatures}>
              +{(tier.features_json || []).length - 3} tinh nang khac
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  // Render banner card
  const renderBannerCard = (banner) => (
    <View key={banner.id} style={styles.bannerCard}>
      <View style={styles.bannerHeader}>
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerKey}>{banner.banner_key}</Text>
          <Text style={styles.bannerTrigger}>{banner.trigger_type}</Text>
        </View>
        <View style={styles.bannerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleBannerActive(banner)}
          >
            {banner.is_active ? (
              <Eye size={18} color={COLORS.success} />
            ) : (
              <EyeOff size={18} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditBanner(banner)}
          >
            <Edit2 size={18} color={COLORS.gold} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteBanner(banner)}
          >
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.bannerTitle}>{banner.title}</Text>
      <Text style={styles.bannerSubtitle} numberOfLines={2}>
        {banner.subtitle}
      </Text>

      <View style={styles.bannerStats}>
        <View style={styles.statItem}>
          <Eye size={14} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{banner.impressions || 0} views</Text>
        </View>
        <View style={styles.statItem}>
          <MousePointer2 size={14} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{banner.clicks || 0} clicks</Text>
        </View>
        <View style={styles.statItem}>
          <TrendingUp size={14} color={COLORS.success} />
          <Text style={styles.statText}>
            {banner.impressions > 0
              ? ((banner.clicks || 0) / banner.impressions * 100).toFixed(1)
              : 0}% CTR
          </Text>
        </View>
      </View>
    </View>
  );

  // Render analytics tab
  const renderAnalytics = () => {
    if (!analytics) {
      return (
        <View style={styles.emptyState}>
          <BarChart3 size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Chua co du lieu phan tich</Text>
        </View>
      );
    }

    return (
      <View style={styles.analyticsContainer}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Eye size={24} color={COLORS.primary} />
            <Text style={styles.summaryValue}>
              {analytics.totalImpressions || 0}
            </Text>
            <Text style={styles.summaryLabel}>Impressions</Text>
          </View>
          <View style={styles.summaryCard}>
            <MousePointer2 size={24} color={COLORS.gold} />
            <Text style={styles.summaryValue}>
              {analytics.totalClicks || 0}
            </Text>
            <Text style={styles.summaryLabel}>Clicks</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <TrendingUp size={24} color={COLORS.success} />
            <Text style={styles.summaryValue}>
              {analytics.averageCTR?.toFixed(1) || 0}%
            </Text>
            <Text style={styles.summaryLabel}>Avg CTR</Text>
          </View>
          <View style={styles.summaryCard}>
            <ShoppingCart size={24} color={COLORS.accent} />
            <Text style={styles.summaryValue}>
              {analytics.totalConversions || 0}
            </Text>
            <Text style={styles.summaryLabel}>Conversions</Text>
          </View>
        </View>

        {/* Top Performing Banners */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Performing Banners</Text>
        </View>
        {(analytics.topBanners || []).map((banner, idx) => (
          <View key={idx} style={styles.topBannerItem}>
            <Text style={styles.topBannerRank}>#{idx + 1}</Text>
            <View style={styles.topBannerInfo}>
              <Text style={styles.topBannerKey}>{banner.banner_key}</Text>
              <Text style={styles.topBannerStats}>
                {banner.clicks} clicks ({banner.ctr?.toFixed(1)}% CTR)
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render edit modal
  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isCreateMode
                ? (editType === 'tier' ? 'Tao Tier Moi' : 'Tao Banner Moi')
                : (editType === 'tier' ? 'Chinh sua Tier' : 'Chinh sua Banner')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditModalVisible(false);
                setIsCreateMode(false);
              }}
            >
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {editType === 'tier' && editingItem && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ten tier</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editingItem.tier_name}
                    onChangeText={(text) =>
                      setEditingItem({ ...editingItem, tier_name: text })
                    }
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Gia (VND)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={String(editingItem.price_vnd || 0)}
                    onChangeText={(text) =>
                      setEditingItem({
                        ...editingItem,
                        price_vnd: parseInt(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mo ta ngan</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    value={editingItem.short_description || ''}
                    onChangeText={(text) =>
                      setEditingItem({ ...editingItem, short_description: text })
                    }
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Featured</Text>
                  <Switch
                    value={editingItem.is_featured}
                    onValueChange={(value) =>
                      setEditingItem({ ...editingItem, is_featured: value })
                    }
                    trackColor={{ false: COLORS.glassBg, true: COLORS.gold }}
                    thumbColor={COLORS.textPrimary}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Active</Text>
                  <Switch
                    value={editingItem.is_active}
                    onValueChange={(value) =>
                      setEditingItem({ ...editingItem, is_active: value })
                    }
                    trackColor={{ false: COLORS.glassBg, true: COLORS.success }}
                    thumbColor={COLORS.textPrimary}
                  />
                </View>
              </>
            )}

            {editType === 'banner' && editingItem && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Title</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editingItem.title}
                    onChangeText={(text) =>
                      setEditingItem({ ...editingItem, title: text })
                    }
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Subtitle</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    value={editingItem.subtitle || ''}
                    onChangeText={(text) =>
                      setEditingItem({ ...editingItem, subtitle: text })
                    }
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>CTA Text</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editingItem.cta_text || ''}
                    onChangeText={(text) =>
                      setEditingItem({ ...editingItem, cta_text: text })
                    }
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Active</Text>
                  <Switch
                    value={editingItem.is_active}
                    onValueChange={(value) =>
                      setEditingItem({ ...editingItem, is_active: value })
                    }
                    trackColor={{ false: COLORS.glassBg, true: COLORS.success }}
                    thumbColor={COLORS.textPrimary}
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Huy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEdit}
            >
              <Text style={styles.saveButtonText}>Luu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Main render
  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {renderHeader()}
        {renderTabBar()}

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          ) : (
            <>
              {activeTab === 'tiers' && (
                <>
                  {renderTierTypeTabs()}
                  {tiers.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Package size={48} color={COLORS.textSecondary} />
                      <Text style={styles.emptyText}>Chua co tier nao</Text>
                    </View>
                  ) : (
                    tiers.map(renderTierCard)
                  )}
                </>
              )}

              {activeTab === 'banners' && (
                <>
                  {banners.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Sparkles size={48} color={COLORS.textSecondary} />
                      <Text style={styles.emptyText}>Chua co banner nao</Text>
                    </View>
                  ) : (
                    banners.map(renderBannerCard)
                  )}
                </>
              )}

              {activeTab === 'analytics' && renderAnalytics()}
            </>
          )}
        </ScrollView>

        {renderEditModal()}

        {/* Delete Confirmation Modal */}
        <Modal
          visible={deleteModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.deleteModalOverlay}>
            <View style={styles.deleteModalContent}>
              <Trash2 size={48} color={COLORS.error} style={{ marginBottom: SPACING.md }} />
              <Text style={styles.deleteModalTitle}>Xac nhan xoa</Text>
              <Text style={styles.deleteModalText}>
                Ban co chac chan muon xoa {deleteType === 'tier' ? 'tier' : 'banner'} nay?
                {'\n'}Hanh dong nay khong the hoan tac.
              </Text>
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={styles.deleteModalCancelBtn}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.deleteModalCancelText}>Huy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteModalConfirmBtn}
                  onPress={confirmDelete}
                >
                  <Text style={styles.deleteModalConfirmText}>Xoa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* FAB for creating new tier/banner */}
        {(activeTab === 'tiers' || activeTab === 'banners') && (
          <TouchableOpacity
            style={styles.fab}
            onPress={activeTab === 'tiers' ? handleCreateTier : handleCreateBanner}
          >
            <Plus size={28} color={COLORS.bgDarkest} />
          </TouchableOpacity>
        )}

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: 6,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.bgDarkest,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Tier Type Tabs
  tierTypeTabs: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tierTypeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    gap: 6,
  },
  tierTypeTabActive: {
    backgroundColor: COLORS.gold,
  },
  tierTypeTabText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tierTypeTabTextActive: {
    color: COLORS.bgDarkest,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  // Tier Card
  tierCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...GLASS,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tierLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tierLevelFeatured: {
    color: COLORS.bgDarkest,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tierActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  tierDetails: {
    marginTop: SPACING.sm,
  },
  tierPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  tierPriceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
  },
  tierOriginalPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  tierFeatures: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  moreFeatures: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Banner Card
  bannerCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...GLASS,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bannerInfo: {
    gap: 4,
  },
  bannerKey: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    textTransform: 'uppercase',
  },
  bannerTrigger: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bannerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  bannerStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Analytics
  analyticsContainer: {
    gap: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    ...GLASS,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  topBannerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  topBannerRank: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
    width: 30,
  },
  topBannerInfo: {
    flex: 1,
  },
  topBannerKey: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  topBannerStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgDarkest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.bgDarkest,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Delete Modal
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  deleteModalContent: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  deleteModalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  deleteModalCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deleteModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deleteModalConfirmBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: 12,
  },
  deleteModalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default AdminUpgradeScreen;
