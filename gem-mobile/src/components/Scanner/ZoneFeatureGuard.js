/**
 * GEM Mobile - Zone Feature Guard Component
 * Checks tier access for zone visualization features
 *
 * Props:
 * - feature: Feature to check access for
 * - userTier: User's current tier
 * - children: Content to show if access granted
 * - showUpgradePrompt: Whether to show upgrade message if no access
 * - fallback: Component to render if no access
 * - onUpgradePress: Callback when upgrade is pressed
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Lock, ChevronRight, Sparkles } from 'lucide-react-native';

import tierAccessService from '../../services/tierAccessService';
import { TIER_FEATURES, FEATURE_COMPARISON } from '../../constants/tierFeatures';
import { COLORS, SPACING } from '../../theme/darkTheme';

/**
 * Feature access mapping
 */
const FEATURE_ACCESS_CHECK = {
  zoneRectangles: () => tierAccessService.canUseZoneRectangles(),
  zoneLabels: () => tierAccessService.canUseZoneLabels(),
  zoneLifecycle: () => tierAccessService.canUseZoneLifecycle(),
  historicalZones: () => tierAccessService.canViewHistoricalZones(),
  mtfAlignment: () => tierAccessService.canUseMTFAlignment(),
  zoneAlerts: () => tierAccessService.canUseZoneAlerts(),
  zoneCustomization: () => tierAccessService.canCustomizeZones(),
  zoneExport: () => tierAccessService.canExportZones(),
  multipleZones: () => tierAccessService.canScanMultiplePatterns(),
  zoneVisualization: () => tierAccessService.isZoneVisualizationEnabled(),
};

/**
 * Feature info for upgrade prompts
 */
const FEATURE_INFO = {
  zoneRectangles: {
    title: 'Zone Rectangles',
    titleVi: 'Vùng Zone',
    description: 'Hiển thị vùng zone đầy màu trên chart',
    icon: 'Square',
    requiredTier: 'TIER1',
  },
  zoneLabels: {
    title: 'Zone Labels',
    titleVi: 'Nhãn Zone',
    description: 'Hiển thị nhãn Buy/Sell với % độ mạnh',
    icon: 'Tag',
    requiredTier: 'TIER1',
  },
  zoneLifecycle: {
    title: 'Zone Lifecycle',
    titleVi: 'Vòng đời Zone',
    description: 'Theo dõi trạng thái Fresh/Tested/Broken',
    icon: 'RefreshCw',
    requiredTier: 'TIER2',
  },
  historicalZones: {
    title: 'Historical Zones',
    titleVi: 'Zone Lịch sử',
    description: 'Xem các zone quá khứ',
    icon: 'History',
    requiredTier: 'TIER2',
  },
  mtfAlignment: {
    title: 'MTF Alignment',
    titleVi: 'Đồng thuận MTF',
    description: 'Phân tích đồng thuận đa khung thời gian',
    icon: 'Layers',
    requiredTier: 'TIER2',
  },
  zoneAlerts: {
    title: 'Zone Alerts',
    titleVi: 'Cảnh báo Zone',
    description: 'Nhận thông báo khi giá test zone',
    icon: 'Bell',
    requiredTier: 'TIER1',
  },
  zoneCustomization: {
    title: 'Zone Customization',
    titleVi: 'Tùy chỉnh Zone',
    description: 'Tùy chỉnh màu sắc zone',
    icon: 'Palette',
    requiredTier: 'TIER2',
  },
  zoneExport: {
    title: 'Zone Export',
    titleVi: 'Xuất Zone',
    description: 'Xuất zone ra CSV/JSON',
    icon: 'Download',
    requiredTier: 'TIER3',
  },
  multipleZones: {
    title: 'Multiple Zones',
    titleVi: 'Nhiều Zone',
    description: 'Hiển thị nhiều zone cùng lúc',
    icon: 'Grid',
    requiredTier: 'TIER1',
  },
  zoneVisualization: {
    title: 'Zone Visualization',
    titleVi: 'Zone Visualization',
    description: 'Bật tính năng zone visualization',
    icon: 'Eye',
    requiredTier: 'TIER1',
  },
};

const ZoneFeatureGuard = ({
  feature,
  userTier = 'FREE',
  children,
  showUpgradePrompt = true,
  fallback = null,
  onUpgradePress,
  compact = false,
  style,
}) => {
  // Check access
  const checkAccess = FEATURE_ACCESS_CHECK[feature];
  const hasAccess = checkAccess ? checkAccess() : false;

  // If has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If fallback provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // If no upgrade prompt, render nothing
  if (!showUpgradePrompt) {
    return null;
  }

  // Get feature info
  const featureInfo = FEATURE_INFO[feature] || {
    title: feature,
    titleVi: feature,
    description: 'Tính năng cao cấp',
    requiredTier: 'TIER2',
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onUpgradePress}
        activeOpacity={0.7}
      >
        <Lock size={12} color={COLORS.warning} />
        <Text style={styles.compactText}>
          {featureInfo.requiredTier}+
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.lockContainer}>
        <View style={styles.lockIcon}>
          <Lock size={20} color={COLORS.warning} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {featureInfo.titleVi || featureInfo.title}
        </Text>
        <Text style={styles.description}>
          {featureInfo.description}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={onUpgradePress}
        activeOpacity={0.7}
      >
        <Sparkles size={14} color="#FFFFFF" />
        <Text style={styles.upgradeText}>
          Upgrade to {featureInfo.requiredTier}
        </Text>
        <ChevronRight size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Hook to check zone feature access
 * @param {string} feature - Feature to check
 * @returns {boolean} Whether user has access
 */
export const useZoneFeatureAccess = (feature) => {
  const checkAccess = FEATURE_ACCESS_CHECK[feature];
  return checkAccess ? checkAccess() : false;
};

/**
 * Get required tier for a feature
 * @param {string} feature - Feature name
 * @returns {string} Required tier
 */
export const getRequiredTierForFeature = (feature) => {
  const featureInfo = FEATURE_INFO[feature];
  return featureInfo?.requiredTier || 'TIER2';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    borderStyle: 'dashed',
  },
  lockContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  lockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  upgradeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
  },
  compactText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.warning,
  },
});

export default ZoneFeatureGuard;
