/**
 * PartnerResourceCenter
 * Resource center for CTV and KOL partners
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE3.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  Video,
  Calendar,
  Star,
  Lock,
  Search,
  Sparkles,
  Link,
  QrCode,
  BarChart2,
} from 'lucide-react-native';

import alertService from '../../services/alertService';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import {
  CTV_TIER_CONFIG,
  formatTierDisplay,
} from '../../constants/partnershipConstants';
import resourceService, { RESOURCE_TYPES } from '../../services/resourceService';

// Resource type icons
const RESOURCE_ICONS = {
  banner: ImageIcon,
  creative: Sparkles,
  video: Video,
  document: FileText,
  template: FileText,
  tool: Link,
  event: Calendar,
};

// Filter tabs
const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'banner', label: 'Banners' },
  { key: 'creative', label: 'Creatives' },
  { key: 'video', label: 'Videos' },
  { key: 'document', label: 'Tài liệu' },
  { key: 'event', label: 'Sự kiện' },
];

const PartnerResourceCenter = ({ navigation }) => {
  // ========== STATE ==========
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [userTier, setUserTier] = useState('bronze');
  const [userRole, setUserRole] = useState('ctv');
  const [isKOL, setIsKOL] = useState(false);
  const [featuredResources, setFeaturedResources] = useState([]);

  // ========== EFFECTS ==========
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, activeFilter]);

  // ========== DATA LOADING ==========
  const loadData = async () => {
    try {
      setLoading(true);

      // Load resources
      const result = await resourceService.getResources();
      if (result.success) {
        setResources(result.resources);
        setFeaturedResources(result.resources.filter(r => r.is_featured));
      }

      // Load user profile
      const profile = await resourceService.getPartnerProfile();
      if (profile) {
        setUserTier(profile.ctv_tier || 'bronze');
        setUserRole(profile.role || 'ctv');
        setIsKOL(profile.is_kol || false);
      }
    } catch (err) {
      console.error('Load resources error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterResources = () => {
    if (activeFilter === 'all') {
      setFilteredResources(resources);
    } else {
      setFilteredResources(resources.filter(r => r.resource_type === activeFilter));
    }
  };

  // ========== HANDLERS ==========
  const handleResourcePress = async (resource) => {
    // Check access
    const hasAccess = resourceService.checkAccess(resource, userRole, userTier);

    if (!hasAccess) {
      alertService.alert(
        'Nâng cấp để truy cập',
        `Tài nguyên này yêu cầu ${resourceService.getAccessLevelName(resource.access_level)}. Hãy nâng cấp tier để mở khóa!`,
      );
      return;
    }

    // Track download
    await resourceService.trackDownload(resource.id);

    // Open resource
    if (resource.resource_type === 'event') {
      if (resource.event_link) {
        Linking.openURL(resource.event_link);
      }
    } else if (resource.file_url) {
      Linking.openURL(resource.file_url);
    }
  };

  // ========== RENDER HELPERS ==========
  const renderFeaturedItem = ({ item }) => {
    const Icon = RESOURCE_ICONS[item.resource_type] || FileText;
    const hasAccess = resourceService.checkAccess(item, userRole, userTier);

    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => handleResourcePress(item)}
        activeOpacity={0.8}
      >
        {item.thumbnail_url ? (
          <Image source={{ uri: item.thumbnail_url }} style={styles.featuredImage} />
        ) : (
          <View style={styles.featuredPlaceholder}>
            <Icon size={40} color={COLORS.gold} />
          </View>
        )}

        {!hasAccess && (
          <View style={styles.lockedOverlay}>
            <Lock size={24} color={COLORS.textPrimary} />
          </View>
        )}

        <View style={styles.featuredContent}>
          <View style={styles.featuredBadge}>
            <Star size={12} color={COLORS.gold} />
            <Text style={styles.featuredBadgeText}>Nổi bật</Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderResourceItem = (item) => {
    const Icon = RESOURCE_ICONS[item.resource_type] || FileText;
    const hasAccess = resourceService.checkAccess(item, userRole, userTier);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.resourceCard}
        onPress={() => handleResourcePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.resourceIcon}>
          <Icon size={24} color={hasAccess ? COLORS.gold : COLORS.textMuted} />
        </View>

        <View style={styles.resourceContent}>
          <Text style={styles.resourceTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.resourceDescription} numberOfLines={2}>
            {item.description || resourceService.getResourceTypeLabel(item.resource_type)}
          </Text>

          <View style={styles.resourceMeta}>
            <Text style={styles.resourceType}>
              {resourceService.getResourceTypeLabel(item.resource_type)}
            </Text>
            {item.download_count > 0 && (
              <View style={styles.downloadCount}>
                <Download size={12} color={COLORS.textMuted} />
                <Text style={styles.resourceDownloads}>{item.download_count}</Text>
              </View>
            )}
          </View>
        </View>

        {!hasAccess ? (
          <View style={styles.resourceLock}>
            <Lock size={18} color={COLORS.textMuted} />
          </View>
        ) : (
          <View style={styles.resourceAction}>
            <ExternalLink size={18} color={COLORS.gold} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải tài nguyên...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trung Tâm Tài Nguyên</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* User Tier Banner */}
          <View style={[
            styles.tierBanner,
            { backgroundColor: CTV_TIER_CONFIG[userTier]?.bgColor || 'rgba(205, 127, 50, 0.15)' }
          ]}>
            <Text style={styles.tierBannerText}>
              {formatTierDisplay(userTier)} {isKOL && '• KOL ⭐'}
            </Text>
            <Text style={styles.tierBannerSubtext}>
              Bạn có quyền truy cập {isKOL ? 'KOL Resources' : `tài nguyên ${CTV_TIER_CONFIG[userTier]?.name || 'Đồng'}`}
            </Text>
          </View>

          {/* Featured Resources */}
          {featuredResources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⭐ Nổi bật</Text>
              <FlatList
                data={featuredResources}
                renderItem={renderFeaturedItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
              />
            </View>
          )}

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {FILTER_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  activeFilter === tab.key && styles.filterTabActive
                ]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === tab.key && styles.filterTabTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Resource List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {activeFilter === 'all'
                ? 'Tất cả tài nguyên'
                : FILTER_TABS.find(t => t.key === activeFilter)?.label}
              {' '}({filteredResources.length})
            </Text>

            {filteredResources.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FileText size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chưa có tài nguyên trong danh mục này</Text>
              </View>
            ) : (
              <View style={styles.resourceList}>
                {filteredResources.map(renderResourceItem)}
              </View>
            )}
          </View>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛠️ Công cụ nhanh</Text>
            <View style={styles.quickLinks}>
              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => navigation.navigate('AffiliateDetail')}
              >
                <Link size={24} color={COLORS.gold} />
                <Text style={styles.quickLinkText}>Tạo Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => navigation.navigate('AffiliateDetail')}
              >
                <QrCode size={24} color={COLORS.gold} />
                <Text style={styles.quickLinkText}>Tạo QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLinkCard}
                onPress={() => navigation.navigate('AffiliateDetail')}
              >
                <BarChart2 size={24} color={COLORS.gold} />
                <Text style={styles.quickLinkText}>Thống kê</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Extra padding for tab bar */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  // Header
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Tier Banner
  tierBanner: {
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: 12,
  },
  tierBannerText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  tierBannerSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Sections
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  // Featured
  featuredList: {
    paddingVertical: SPACING.sm,
  },
  featuredCard: {
    width: 200,
    marginRight: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  featuredPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: SPACING.sm,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featuredBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    marginLeft: 4,
  },
  featuredTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Filter
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
  },
  filterTab: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: COLORS.bgDark,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Resource List
  resourceList: {
    gap: SPACING.sm,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  resourceDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  resourceType: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    marginRight: SPACING.sm,
  },
  downloadCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceDownloads: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  resourceLock: {
    padding: SPACING.xs,
  },
  resourceAction: {
    padding: SPACING.xs,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // Quick Links
  quickLinks: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickLinkCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickLinkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
});

export default PartnerResourceCenter;
