/**
 * Gemral - Boost Post Sheet Component
 * Feature #7: Boost Post
 * Bottom sheet for selecting boost packages
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Zap,
  TrendingUp,
  Star,
  Crown,
  Check,
  Clock,
  Eye,
  Gem,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../utils/tokens';
import boostService from '../services/boostService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PACKAGE_ICONS = {
  basic: Zap,
  standard: TrendingUp,
  premium: Star,
  ultra: Crown,
};

const PACKAGE_COLORS = {
  basic: COLORS.cyan,
  standard: COLORS.purple,
  premium: COLORS.gold,
  ultra: COLORS.burgundy,
};

const BoostPostSheet = ({
  visible,
  onClose,
  postId,
  gemBalance = 0,
  onSuccess,
  onBuyGems,
}) => {
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [boosting, setBoosting] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const packages = boostService.getBoostPackages();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleBoost = async () => {
    const pkg = packages.find(p => p.id === selectedPackage);

    if (gemBalance < pkg.price_gems) {
      Alert.alert(
        'Không đủ Gems',
        `Bạn cần ${pkg.price_gems} Gems để boost. Số dư: ${gemBalance} Gems`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Mua Gems', onPress: onBuyGems },
        ]
      );
      return;
    }

    setBoosting(true);
    const result = await boostService.boostPost(postId, selectedPackage);
    setBoosting(false);

    if (result.success) {
      Alert.alert(
        'Thành công!',
        `Bài viết đã được boost với gói ${pkg.name}`,
        [{ text: 'OK', onPress: () => {
          onSuccess?.(result);
          onClose?.();
        }}]
      );
    } else if (result.needGems) {
      Alert.alert(
        'Không đủ Gems',
        result.error,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Mua Gems', onPress: onBuyGems },
        ]
      );
    } else {
      Alert.alert('Lỗi', result.error || 'Không thể boost bài viết');
    }
  };

  const renderPackage = (pkg) => {
    const IconComponent = PACKAGE_ICONS[pkg.id] || Zap;
    const color = PACKAGE_COLORS[pkg.id] || COLORS.purple;
    const isSelected = selectedPackage === pkg.id;
    const canAfford = gemBalance >= pkg.price_gems;

    return (
      <TouchableOpacity
        key={pkg.id}
        style={[
          styles.packageCard,
          isSelected && styles.packageCardSelected,
          isSelected && { borderColor: color },
        ]}
        onPress={() => setSelectedPackage(pkg.id)}
        activeOpacity={0.7}
      >
        {pkg.popular && (
          <View style={[styles.popularBadge, { backgroundColor: color }]}>
            <Text style={styles.popularText}>Phổ biến</Text>
          </View>
        )}

        <View style={styles.packageHeader}>
          <View style={[styles.packageIcon, { backgroundColor: `${color}30` }]}>
            <IconComponent size={24} color={color} />
          </View>
          <View style={styles.packageInfo}>
            <Text style={styles.packageName}>{pkg.name}</Text>
            <Text style={styles.packageDesc}>{pkg.description}</Text>
          </View>
          {isSelected && (
            <View style={[styles.selectedCheck, { backgroundColor: color }]}>
              <Check size={14} color={COLORS.textPrimary} />
            </View>
          )}
        </View>

        <View style={styles.packageMeta}>
          <View style={styles.metaItem}>
            <Clock size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>
              {pkg.duration_hours >= 24
                ? `${Math.floor(pkg.duration_hours / 24)} ngày`
                : `${pkg.duration_hours} giờ`}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Eye size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{pkg.reach_multiplier}x tiếp cận</Text>
          </View>
        </View>

        <View style={styles.featuresList}>
          {pkg.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Check size={12} color={COLORS.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.packagePrice}>
          <Gem size={16} color={canAfford ? COLORS.cyan : COLORS.error} />
          <Text style={[styles.priceText, !canAfford && styles.priceTextInsufficient]}>
            {pkg.price_gems} Gems
          </Text>
          {!canAfford && (
            <Text style={styles.insufficientText}>Không đủ</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  const selectedPkg = packages.find(p => p.id === selectedPackage);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Boost bài viết</Text>
              <Text style={styles.headerSubtitle}>Tăng độ tiếp cận của bài viết</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Balance */}
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Số dư của bạn:</Text>
            <View style={styles.balanceValue}>
              <Gem size={16} color={COLORS.cyan} />
              <Text style={styles.balanceText}>{gemBalance.toLocaleString()} Gems</Text>
            </View>
          </View>

          {/* Packages */}
          <ScrollView
            style={styles.packagesScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.packagesContent}
          >
            {packages.map(renderPackage)}
          </ScrollView>

          {/* Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.boostButton, boosting && styles.boostButtonDisabled]}
              onPress={handleBoost}
              disabled={boosting}
            >
              <LinearGradient
                colors={boosting ? ['#444', '#333'] : GRADIENTS.primaryButton}
                style={styles.boostButtonGradient}
              >
                {boosting ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <>
                    <Zap size={20} color={COLORS.textPrimary} />
                    <Text style={styles.boostButtonText}>
                      Boost với {selectedPkg?.price_gems} Gems
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: GLASS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  balanceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  balanceText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  packagesScroll: {
    flex: 1,
  },
  packagesContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  packageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  packageCardSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  packageName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  packageDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageMeta: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  featuresList: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  packagePrice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  priceText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  priceTextInsufficient: {
    color: COLORS.error,
  },
  insufficientText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  boostButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  boostButtonDisabled: {
    opacity: 0.7,
  },
  boostButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  boostButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default BoostPostSheet;
