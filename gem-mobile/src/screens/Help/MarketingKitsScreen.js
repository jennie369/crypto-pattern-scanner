/**
 * Gemral - Marketing Kits Screen
 * Shows marketing materials for Affiliates/CTVs
 * Tier-based access: FREE locked, Affiliate basic, CTV premium
 * Dark glass theme
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import {
  ArrowLeft,
  Download,
  Share2,
  Lock,
  Image as ImageIcon,
  FileText,
  Video,
  Crown,
  Star,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;
const BANNER_HEIGHT = BANNER_WIDTH * 0.5;

// Marketing materials data
const MARKETING_MATERIALS = {
  basic: [
    {
      id: 'banner_1',
      title: 'Banner Quảng Cáo 1200x628',
      type: 'image',
      preview: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=600',
      downloadUrl: 'https://gemral.com/assets/marketing/banner-1200x628.png',
      size: '1200x628',
      tier: 'affiliate',
    },
    {
      id: 'banner_2',
      title: 'Banner Story 1080x1920',
      type: 'image',
      preview: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600',
      downloadUrl: 'https://gemral.com/assets/marketing/banner-story.png',
      size: '1080x1920',
      tier: 'affiliate',
    },
    {
      id: 'banner_3',
      title: 'Banner Square 1080x1080',
      type: 'image',
      preview: 'https://images.unsplash.com/photo-1642104704074-907c0698b98d?w=600',
      downloadUrl: 'https://gemral.com/assets/marketing/banner-square.png',
      size: '1080x1080',
      tier: 'affiliate',
    },
    {
      id: 'post_1',
      title: 'Bài Viết Mẫu - Giới Thiệu',
      type: 'text',
      content: 'Bạn muốn kiếm thêm thu nhập từ đầu tư crypto? Gemral là nền tảng...',
      downloadUrl: 'https://gemral.com/assets/marketing/sample-post-1.txt',
      tier: 'affiliate',
    },
  ],
  premium: [
    {
      id: 'video_1',
      title: 'Video Promo 30s',
      type: 'video',
      preview: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
      downloadUrl: 'https://gemral.com/assets/marketing/promo-30s.mp4',
      duration: '30s',
      tier: 'ctv',
    },
    {
      id: 'video_2',
      title: 'Video Hướng Dẫn 2 phút',
      type: 'video',
      preview: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
      downloadUrl: 'https://gemral.com/assets/marketing/tutorial-2min.mp4',
      duration: '2:00',
      tier: 'ctv',
    },
    {
      id: 'banner_premium_1',
      title: 'Banner Premium Animation',
      type: 'image',
      preview: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600',
      downloadUrl: 'https://gemral.com/assets/marketing/banner-premium-anim.gif',
      size: '1200x628',
      tier: 'ctv',
    },
    {
      id: 'kit_full',
      title: 'Full Marketing Kit (ZIP)',
      type: 'zip',
      description: 'Bao gồm tất cả banner, video, bài mẫu',
      downloadUrl: 'https://gemral.com/assets/marketing/full-kit.zip',
      tier: 'ctv',
    },
  ],
};

export default function MarketingKitsScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const [downloading, setDownloading] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Determine user tier
  const partnerType = profile?.partner_type;
  const isAffiliate = partnerType === 'affiliate' || partnerType === 'ctv';
  const isCtv = partnerType === 'ctv';
  const ctvTier = profile?.ctv_tier;

  // Check if user has access to a material
  const hasAccess = (material) => {
    if (material.tier === 'affiliate') {
      return isAffiliate || isCtv;
    }
    if (material.tier === 'ctv') {
      return isCtv;
    }
    return false;
  };

  // Handle download
  const handleDownload = async (material) => {
    if (!hasAccess(material)) {
      alert({
        type: 'warning',
        title: 'Cần nâng cấp',
        message: material.tier === 'ctv'
          ? 'Bạn cần trở thành CTV để tải nội dung này'
          : 'Bạn cần đăng ký làm Affiliate để tải nội dung này',
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng ký ngay',
            onPress: () => navigation.navigate('PartnershipRegistration'),
          },
        ],
      });
      return;
    }

    try {
      setDownloading(material.id);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert({ type: 'warning', title: 'Cần quyền truy cập', message: 'Vui lòng cấp quyền truy cập thư viện ảnh' });
        setDownloading(null);
        return;
      }

      // Download file
      const filename = material.downloadUrl.split('/').pop();
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(
        material.downloadUrl,
        fileUri
      );

      if (downloadResult.status === 200) {
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        alert({ type: 'success', title: 'Thành công', message: 'Đã tải xuống và lưu vào thư viện' });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('[MarketingKits] Download error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể tải xuống. Vui lòng thử lại sau.' });
    } finally {
      setDownloading(null);
    }
  };

  // Handle share
  const handleShare = async (material) => {
    if (!hasAccess(material)) {
      alert({
        type: 'warning',
        title: 'Cần nâng cấp',
        message: 'Bạn cần đăng ký làm Affiliate/CTV để chia sẻ nội dung này'
      });
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        // Fallback to opening URL
        await Linking.openURL(material.downloadUrl);
        return;
      }

      // Download and share
      const filename = material.downloadUrl.split('/').pop();
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(
        material.downloadUrl,
        fileUri
      );

      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri);
      }
    } catch (error) {
      console.error('[MarketingKits] Share error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể chia sẻ. Vui lòng thử lại sau.' });
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'text':
      case 'zip':
        return FileText;
      default:
        return ImageIcon;
    }
  };

  // Render material card
  const renderMaterialCard = (material, index) => {
    const canAccess = hasAccess(material);
    const isDownloading = downloading === material.id;
    const TypeIcon = getTypeIcon(material.type);

    return (
      <View key={material.id} style={styles.materialCard}>
        {/* Preview */}
        <View style={styles.previewContainer}>
          {material.preview ? (
            <Image
              source={{ uri: material.preview }}
              style={[styles.previewImage, !canAccess && styles.previewLocked]}
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <TypeIcon size={32} color={COLORS.textMuted} />
            </View>
          )}

          {/* Lock overlay */}
          {!canAccess && (
            <View style={styles.lockOverlay}>
              <Lock size={24} color={COLORS.gold} />
              <Text style={styles.lockText}>
                {material.tier === 'ctv' ? 'CTV Only' : 'Affiliate Only'}
              </Text>
            </View>
          )}

          {/* Type badge */}
          <View style={styles.typeBadge}>
            <TypeIcon size={12} color="#FFFFFF" />
            <Text style={styles.typeBadgeText}>{material.type.toUpperCase()}</Text>
          </View>

          {/* Premium badge */}
          {material.tier === 'ctv' && (
            <View style={styles.premiumBadge}>
              <Crown size={12} color={COLORS.gold} />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.materialInfo}>
          <Text style={styles.materialTitle}>{material.title}</Text>
          {material.size && (
            <Text style={styles.materialMeta}>{material.size}</Text>
          )}
          {material.duration && (
            <Text style={styles.materialMeta}>{material.duration}</Text>
          )}
          {material.description && (
            <Text style={styles.materialDesc}>{material.description}</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.materialActions}>
          <TouchableOpacity
            style={[styles.actionBtn, !canAccess && styles.actionBtnDisabled]}
            onPress={() => handleDownload(material)}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <>
                {canAccess ? (
                  <Download size={18} color={COLORS.gold} />
                ) : (
                  <Lock size={18} color={COLORS.textMuted} />
                )}
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, !canAccess && styles.actionBtnDisabled]}
            onPress={() => handleShare(material)}
          >
            <Share2 size={18} color={canAccess ? COLORS.cyan : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render tab buttons
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'basic' && styles.tabActive]}
        onPress={() => setActiveTab('basic')}
      >
        <Star size={18} color={activeTab === 'basic' ? COLORS.gold : COLORS.textMuted} />
        <Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>
          Basic
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'premium' && styles.tabActive]}
        onPress={() => setActiveTab('premium')}
      >
        <Crown size={18} color={activeTab === 'premium' ? COLORS.gold : COLORS.textMuted} />
        <Text style={[styles.tabText, activeTab === 'premium' && styles.tabTextActive]}>
          Premium
        </Text>
        {!isCtv && (
          <Lock size={14} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
        )}
      </TouchableOpacity>
    </View>
  );

  // Render access info card
  const renderAccessCard = () => {
    if (!isAffiliate) {
      return (
        <View style={styles.accessCard}>
          <AlertCircle size={24} color={COLORS.warning} />
          <View style={styles.accessInfo}>
            <Text style={styles.accessTitle}>Đăng ký để truy cập</Text>
            <Text style={styles.accessDesc}>
              Bạn cần đăng ký làm Affiliate hoặc CTV để tải Marketing Kits
            </Text>
          </View>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('PartnershipRegistration')}
          >
            <Text style={styles.registerBtnText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isAffiliate && !isCtv) {
      return (
        <View style={styles.accessCard}>
          <CheckCircle size={24} color={COLORS.success} />
          <View style={styles.accessInfo}>
            <Text style={styles.accessTitle}>Affiliate Access</Text>
            <Text style={styles.accessDesc}>
              Bạn có quyền truy cập Basic Kits. Nâng cấp CTV để mở Premium.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => navigation.navigate('PartnershipRegistration', { upgrade: true })}
          >
            <Sparkles size={14} color="#112250" />
            <Text style={styles.upgradeBtnText}>Nâng cấp</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.accessCard}>
        <Crown size={24} color={COLORS.gold} />
        <View style={styles.accessInfo}>
          <Text style={styles.accessTitle}>CTV Premium Access</Text>
          <Text style={styles.accessDesc}>
            Bạn có quyền truy cập tất cả Marketing Kits
          </Text>
        </View>
      </View>
    );
  };

  const materials = activeTab === 'basic' ? MARKETING_MATERIALS.basic : MARKETING_MATERIALS.premium;

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Marketing Kits</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Access Card */}
          {renderAccessCard()}

          {/* Tabs */}
          {renderTabs()}

          {/* Materials List */}
          <View style={styles.materialsGrid}>
            {materials.map((material, index) => renderMaterialCard(material, index))}
          </View>

          {/* Help Note */}
          <View style={styles.helpNote}>
            <Text style={styles.helpNoteText}>
              Cần hỗ trợ? Liên hệ support@gemral.com hoặc chat với admin trong app.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      {AlertComponent}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backBtn: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },

  // Access Card
  accessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    gap: SPACING.md,
  },
  accessInfo: {
    flex: 1,
  },
  accessTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  accessDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  registerBtn: {
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  registerBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: 4,
  },
  upgradeBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#112250',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 10,
    gap: SPACING.sm,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Materials Grid
  materialsGrid: {
    gap: SPACING.md,
  },
  materialCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  previewContainer: {
    width: '100%',
    height: BANNER_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewLocked: {
    opacity: 0.4,
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lockText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  typeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
  premiumBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  materialInfo: {
    padding: SPACING.md,
  },
  materialTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  materialMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  materialDesc: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  materialActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },

  // Help Note
  helpNote: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  helpNoteText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
