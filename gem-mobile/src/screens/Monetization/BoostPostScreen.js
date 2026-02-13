/**
 * Gemral - Boost Post Screen
 * Create a boost campaign for a post
 * Dark glass theme
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Zap, Clock, Eye, Target, Check, Gem } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { CONTENT_BOTTOM_PADDING, ACTION_BUTTON_BOTTOM_PADDING } from '../../constants/layout';
import gemEconomyService from '../../services/gemEconomyService';
import boostService from '../../services/boostService';

// Package colors for display
const PACKAGE_COLORS = {
  basic: COLORS.textSecondary,
  standard: COLORS.gold,
  premium: COLORS.purple,
  ultra: COLORS.burgundy,
};

// Get display info for each package
const getPackageDisplayInfo = (pkg) => {
  const durationText = pkg.duration_hours >= 24
    ? `${Math.floor(pkg.duration_hours / 24)} ngày`
    : `${pkg.duration_hours} giờ`;
  const reachText = `~${pkg.reach_multiplier * 500} lượt`;

  return {
    ...pkg,
    duration: durationText,
    reach: reachText,
    gems: pkg.price_gems,
    color: PACKAGE_COLORS[pkg.id] || COLORS.textSecondary,
  };
};

export default function BoostPostScreen({ navigation, route }) {
  const { postId } = route.params || {};
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [userGems, setUserGems] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Get packages from boostService (source of truth)
  const rawPackages = boostService.getBoostPackages();
  // Only show first 3 packages (basic, standard, premium) - skip ultra for simpler UI
  const BOOST_PACKAGES = rawPackages.slice(0, 3).map(getPackageDisplayInfo);

  // Load gems balance from profiles.gems (single source of truth)
  const loadGemBalance = useCallback(async () => {
    if (!user?.id) {
      setLoadingBalance(false);
      return;
    }

    try {
      const balance = await gemEconomyService.getGemBalance(user.id);
      setUserGems(balance || 0);
    } catch (error) {
      console.error('[BoostPost] Load balance error:', error);
      setUserGems(0);
    } finally {
      setLoadingBalance(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGemBalance();
  }, [loadGemBalance]);

  const handleBoost = async () => {
    console.log('[BoostPost] handleBoost called, postId:', postId, 'package:', selectedPackage);

    // Validate postId
    if (!postId) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không tìm thấy bài viết để boost. Vui lòng thử lại.',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
      return;
    }

    const pkg = BOOST_PACKAGES.find(p => p.id === selectedPackage);
    if (!pkg) {
      console.error('[BoostPost] Package not found:', selectedPackage);
      return;
    }

    // Check gems balance
    if (userGems < pkg.gems) {
      alert({
        type: 'warning',
        title: 'Không đủ Gems',
        message: `Bạn cần ${pkg.gems} Gems để boost. Hiện tại bạn có ${userGems} Gems.`,
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nạp Gems', onPress: () => navigation.navigate('Wallet') },
        ],
      });
      return;
    }

    setLoading(true);
    try {
      // Call actual boostService
      const result = await boostService.boostPost(postId, selectedPackage);
      console.log('[BoostPost] Boost result:', result);

      if (result.success) {
        // Refresh balance after successful boost
        await loadGemBalance();

        alert({
          type: 'success',
          title: 'Thành công!',
          message: `Bài viết của bạn đã được boost với gói ${pkg.name}. Bạn đã sử dụng ${pkg.gems} Gems.`,
          buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
        });
      } else if (result.needGems) {
        alert({
          type: 'warning',
          title: 'Không đủ Gems',
          message: `Bạn cần thêm Gems để boost bài viết này.`,
          buttons: [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Nạp Gems', onPress: () => navigation.navigate('Wallet') },
          ],
        });
      } else if (result.existingBoost) {
        alert({
          type: 'info',
          title: 'Đang được boost',
          message: 'Bài viết này đang được boost. Vui lòng đợi hết hạn trước khi boost lại.',
          buttons: [{ text: 'OK' }],
        });
      } else {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: result.error || 'Không thể tạo chiến dịch boost. Vui lòng thử lại.',
          buttons: [{ text: 'OK' }],
        });
      }
    } catch (error) {
      console.error('[BoostPost] Error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tạo chiến dịch boost. Vui lòng thử lại sau.',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Boost Bài Viết</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Zap size={24} color={COLORS.gold} />
            <Text style={styles.infoText}>
              Boost bài viết để tăng lượt xem và tiếp cận nhiều người hơn
            </Text>
          </View>

          {/* Gems Balance */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Số dư Gems</Text>
              <View style={styles.balanceRow}>
                <Gem size={20} color={COLORS.gold} />
                {loadingBalance ? (
                  <ActivityIndicator size="small" color={COLORS.gold} />
                ) : (
                  <Text style={styles.balanceValue}>{userGems.toLocaleString()}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.topUpBtn}
              onPress={() => navigation.navigate('Wallet')}
            >
              <Text style={styles.topUpText}>Nạp thêm</Text>
            </TouchableOpacity>
          </View>

          {/* Package Selection */}
          <Text style={styles.sectionTitle}>Chọn gói Boost</Text>

          {BOOST_PACKAGES.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                selectedPackage === pkg.id && styles.packageCardActive,
                selectedPackage === pkg.id && { borderColor: pkg.color },
              ]}
              onPress={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Phổ biến</Text>
                </View>
              )}

              <View style={styles.packageHeader}>
                <Text style={[styles.packageName, { color: pkg.color }]}>{pkg.name}</Text>
                {selectedPackage === pkg.id && (
                  <View style={[styles.checkCircle, { backgroundColor: pkg.color }]}>
                    <Check size={14} color="#112250" />
                  </View>
                )}
              </View>

              <View style={styles.packageDetails}>
                <View style={styles.packageDetail}>
                  <Clock size={16} color={COLORS.textMuted} />
                  <Text style={styles.packageDetailText}>{pkg.duration}</Text>
                </View>
                <View style={styles.packageDetail}>
                  <Eye size={16} color={COLORS.textMuted} />
                  <Text style={styles.packageDetailText}>{pkg.reach}</Text>
                </View>
              </View>

              <View style={styles.packagePrice}>
                <Gem size={18} color={COLORS.gold} />
                <Text style={styles.packagePriceText}>{pkg.gems}</Text>
                <Text style={styles.packagePriceLabel}>Gems</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: CONTENT_BOTTOM_PADDING + 60 }} />
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.boostButton, loading && styles.boostButtonDisabled]}
            onPress={handleBoost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#112250" />
            ) : (
              <>
                <Zap size={20} color="#112250" />
                <Text style={styles.boostButtonText}>Boost Ngay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    padding: SPACING.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  balanceInfo: {},
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  balanceValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  topUpBtn: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  topUpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  packageCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    position: 'relative',
  },
  packageCardActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  packageName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageDetails: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  packageDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  packageDetailText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  packagePrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  packagePriceText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  packagePriceLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  bottomContainer: {
    padding: SPACING.lg,
    paddingBottom: ACTION_BUTTON_BOTTOM_PADDING,
    backgroundColor: GLASS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
  },
  boostButtonDisabled: {
    opacity: 0.7,
  },
  boostButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
});
