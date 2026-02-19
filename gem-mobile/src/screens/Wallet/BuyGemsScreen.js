/**
 * Gemral - Buy Gems Screen
 * Feature #14: Virtual Currency
 * Purchase gem packs via Shopify checkout
 *
 * Flow:
 * 1. User selects a gem package from gem_packs table
 * 2. App creates Shopify checkout URL with variant ID
 * 3. Navigate to CheckoutWebView for payment
 * 4. Shopify webhook processes order and adds gems
 * 5. User redirected to success screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ChevronLeft,
  Gem,
  Sparkles,
  Check,
  ShoppingCart,
  Shield,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import gemEconomyService from '../../services/gemEconomyService';
import { useTabBar } from '../../contexts/TabBarContext';
import { useAuth } from '../../contexts/AuthContext';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

const BuyGemsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Hide tab bar on this screen
  const { hideTabBar, showTabBar } = useTabBar();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  useFocusEffect(
    React.useCallback(() => {
      hideTabBar();
      return () => showTabBar();
    }, [hideTabBar, showTabBar])
  );

  useEffect(() => {
    loadData();
  }, []);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[BuyGemsScreen] Force refresh received');
      setLoading(false);
      setTimeout(() => loadData(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      // Use gemEconomyService to get gem packs from gem_packs table
      const [packagesData, balance] = await Promise.all([
        gemEconomyService.getGemPacks(),
        user?.id ? gemEconomyService.getGemBalance(user.id) : Promise.resolve(0),
      ]);

      setPackages(packagesData);
      setCurrentBalance(balance);

      // Auto-select featured package
      const featured = packagesData.find(p => p.is_featured);
      if (featured) {
        setSelectedPackage(featured.id);
      } else if (packagesData.length > 0) {
        setSelectedPackage(packagesData[0].id);
      }
    } catch (error) {
      console.error('[BuyGems] loadData error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải dữ liệu. Vui lòng thử lại.',
      });
    }

    setLoading(false);
  };

  /**
   * Create Shopify checkout for gem package
   * Uses buildCheckoutUrl from gemEconomyService
   */
  const createGemCheckout = async (pkg) => {
    try {
      // Check for shopify_variant_id
      if (!pkg.shopify_variant_id) {
        console.warn('[BuyGems] No shopify_variant_id for package:', pkg.name);
        alert({
          type: 'warning',
          title: 'Chưa sẵn sàng',
          message: 'Gói này chưa được kết nối với cửa hàng. Vui lòng thử lại sau.',
        });
        return null;
      }

      // Build checkout URL using gemEconomyService
      const checkoutUrl = gemEconomyService.buildCheckoutUrl(pkg, user?.id, user?.email);
      return checkoutUrl;
    } catch (error) {
      console.error('[BuyGems] Create checkout error:', error);
      return null;
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage || purchasing) return;

    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    setPurchasing(true);

    try {
      // Create Shopify checkout URL
      const checkoutUrl = await createGemCheckout(pkg);

      if (checkoutUrl) {
        // Use total_gems (gems_quantity + bonus_gems) from gem_packs table
        const totalGems = pkg.total_gems || (pkg.gems_quantity + (pkg.bonus_gems || 0));

        // Navigate to WebView checkout (same as Shop products)
        navigation.navigate('Shop', {
          screen: 'CheckoutWebView',
          params: {
            checkoutUrl,
            returnScreen: 'BuyGems',
            returnTab: 'Account', // Return to Account tab (Tài Sản)
            productType: 'gems',
            gemAmount: totalGems,
            packageName: pkg.name,
          },
        });
      } else {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        });
      }
    } catch (error) {
      console.error('[BuyGems] Purchase error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Có lỗi xảy ra. Vui lòng thử lại.',
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const selectedPkg = packages.find(p => p.id === selectedPackage);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nạp Gems</Text>
          <View style={styles.headerRight}>
            <Gem size={16} color={COLORS.purple} />
            <Text style={styles.balanceText}>
              {gemEconomyService.formatGemAmount(currentBalance)}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Packages */}
          <Text style={styles.sectionTitle}>Chọn gói</Text>

          <View style={styles.packagesGrid}>
            {packages.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              // gem_packs table uses: gems_quantity, bonus_gems, total_gems, price
              const gemsQty = pkg.gems_quantity || pkg.gem_amount || 0;
              const totalGems = pkg.total_gems || (gemsQty + (pkg.bonus_gems || 0));
              const priceVnd = pkg.price || pkg.price_vnd || 0;

              return (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    isSelected && styles.packageCardSelected,
                    pkg.is_featured && styles.packageCardFeatured,
                  ]}
                  onPress={() => setSelectedPackage(pkg.id)}
                  activeOpacity={0.8}
                >
                  {pkg.is_featured && (
                    <View style={styles.featuredBadge}>
                      <Sparkles size={10} color={COLORS.textPrimary} />
                      <Text style={styles.featuredText}>Phổ biến</Text>
                    </View>
                  )}

                  <View style={styles.packageContent}>
                    <Gem
                      size={28}
                      color={isSelected ? COLORS.purple : COLORS.textMuted}
                    />
                    <Text style={[styles.packageGems, isSelected && styles.packageGemsSelected]}>
                      {gemEconomyService.formatGemAmount(gemsQty)}
                    </Text>
                    {pkg.bonus_gems > 0 && (
                      <View style={styles.bonusBadge}>
                        <Text style={styles.bonusText}>+{pkg.bonus_gems} bonus</Text>
                      </View>
                    )}
                    <Text style={styles.packagePrice}>
                      {gemEconomyService.formatVND(priceVnd)}
                    </Text>
                    <Text style={styles.packagePerGem}>
                      {totalGems > 0 ? Math.round(priceVnd / totalGems) : 0}đ/gem
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.selectedCheck}>
                      <Check size={16} color={COLORS.textPrimary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Shopify Payment Info */}
          <View style={styles.paymentInfo}>
            <View style={styles.paymentInfoRow}>
              <Shield size={20} color={COLORS.success} />
              <Text style={styles.paymentInfoText}>
                Thanh toán an toàn qua Shopify
              </Text>
            </View>
            <Text style={styles.paymentInfoNote}>
              Hỗ trợ MoMo, VNPay, Thẻ ngân hàng, và nhiều phương thức khác
            </Text>
          </View>

          {/* Summary */}
          {selectedPkg && (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gói</Text>
                <Text style={styles.summaryValue}>{selectedPkg.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gems nhận được</Text>
                <Text style={styles.summaryValue}>
                  {selectedPkg.gems_quantity || selectedPkg.gem_amount}
                  {selectedPkg.bonus_gems > 0 && ` + ${selectedPkg.bonus_gems}`}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Tổng</Text>
                <Text style={styles.summaryTotalValue}>
                  {gemEconomyService.formatVND(selectedPkg.price || selectedPkg.price_vnd)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Purchase Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.purchaseButton, (!selectedPackage || purchasing) && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={!selectedPackage || purchasing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.primaryButton}
              style={styles.purchaseButtonGradient}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              ) : (
                <>
                  <ShoppingCart size={18} color={COLORS.textPrimary} />
                  <Text style={styles.purchaseButtonText}>
                    Thanh toán {selectedPkg ? gemEconomyService.formatVND(selectedPkg.price || selectedPkg.price_vnd) : ''}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {AlertComponent}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  balanceText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  packageCard: {
    width: '48%',
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  packageCardFeatured: {
    borderColor: COLORS.gold,
  },
  featuredBadge: {
    position: 'absolute',
    top: -8,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  featuredText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#000',
  },
  packageContent: {
    alignItems: 'center',
  },
  packageGems: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  packageGemsSelected: {
    color: COLORS.textPrimary,
  },
  bonusBadge: {
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: SPACING.xs,
  },
  bonusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  packagePrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  packagePerGem: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectedCheck: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.2)',
    marginTop: SPACING.md,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  paymentInfoText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.success,
  },
  paymentInfoNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginLeft: 28,
  },
  summary: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  summaryTotalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.purple,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: 34,
    backgroundColor: GLASS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  purchaseButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  purchaseButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default BuyGemsScreen;
