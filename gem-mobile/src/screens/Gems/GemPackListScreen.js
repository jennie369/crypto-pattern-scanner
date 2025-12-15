// =====================================================
// GEM PACK LIST SCREEN
// Hiển thị danh sách 4 Gem Packs
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Gem,
  Gift,
  Sparkles,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Star,
  Wallet,
  ArrowLeft,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import gemEconomyService from '../../services/gemEconomyService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const GemPackListScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // ========== STATE ==========
  const [gemPacks, setGemPacks] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ========== EFFECTS ==========
  useEffect(() => {
    loadData();
  }, []);

  // ========== DATA LOADING ==========
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [packs, currentBalance] = await Promise.all([
        gemEconomyService.getGemPacks(),
        gemEconomyService.getGemBalance(user?.id),
      ]);

      setGemPacks(packs || []);
      setBalance(currentBalance || 0);
    } catch (err) {
      console.error('[GemPackList] Load error:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ========== HANDLERS ==========
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePackPress = useCallback(async (pack) => {
    if (!pack?.id) {
      alert({ type: 'error', title: 'Lỗi', message: 'Không tìm thấy thông tin gói' });
      return;
    }

    if (!user?.id) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng đăng nhập để mua Gems' });
      return;
    }

    try {
      // Build checkout URL
      const checkoutUrl = gemEconomyService.buildCheckoutUrl(
        pack,
        user.id,
        user.email
      );

      // Create purchase order
      const order = await gemEconomyService.createPurchaseOrder(user.id, pack);

      // Update order with checkout URL
      await gemEconomyService.updatePurchaseOrderCheckout(order.id, checkoutUrl);

      // Open checkout
      const opened = await gemEconomyService.openCheckout(checkoutUrl);

      if (!opened) {
        alert({ type: 'error', title: 'Lỗi', message: 'Không thể mở trang thanh toán' });
      }
    } catch (err) {
      console.error('[GemPackList] Purchase error:', err);
      alert({ type: 'error', title: 'Lỗi', message: err.message || 'Không thể thực hiện mua hàng' });
    }
  }, [user, navigation, alert]);

  const handleViewWallet = useCallback(() => {
    navigation.navigate('Wallet');
  }, [navigation]);

  // ========== RENDER: Balance Card ==========
  const renderBalanceCard = () => (
    <TouchableOpacity onPress={handleViewWallet} activeOpacity={0.8}>
      <LinearGradient
        colors={[COLORS.burgundy, '#6B0F1A']}
        style={styles.balanceCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.balanceContent}>
          <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
          <View style={styles.balanceRow}>
            <Gem size={28} color={COLORS.gold} />
            <Text style={styles.balanceAmount}>
              {gemEconomyService.formatGemAmount(balance)}
            </Text>
          </View>
          <Text style={styles.balanceVnd}>
            ~ {gemEconomyService.formatVND(gemEconomyService.calculateVndValue(balance))}
          </Text>
        </View>
        <View style={styles.walletIcon}>
          <Wallet size={20} color={COLORS.textSecondary} />
          <Text style={styles.walletText}>Xem ví</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // ========== RENDER: Pack Card ==========
  const renderPackCard = useCallback(({ item: pack }) => (
    <TouchableOpacity
      style={[
        styles.packCard,
        pack.is_featured && styles.packCardFeatured,
      ]}
      onPress={() => handlePackPress(pack)}
      activeOpacity={0.7}
    >
      {/* Badge */}
      {pack.badge_text && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{pack.badge_text}</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.packContent}>
        {/* Left: Icon + Info */}
        <View style={styles.packLeft}>
          <View style={[
            styles.packIcon,
            pack.is_featured && styles.packIconFeatured,
          ]}>
            {pack.is_featured ? (
              <Star size={24} color={COLORS.gold} fill={COLORS.gold} />
            ) : (
              <Gem size={24} color={COLORS.gold} />
            )}
          </View>

          <View style={styles.packInfo}>
            <Text style={styles.packName}>{pack.name || 'Gem Pack'}</Text>
            <View style={styles.gemsRow}>
              <Text style={styles.gemsMain}>
                {(pack.gems_quantity || 0).toLocaleString()} Gems
              </Text>
              {(pack.bonus_gems || 0) > 0 && (
                <View style={styles.bonusBadge}>
                  <Gift size={12} color={COLORS.success} />
                  <Text style={styles.bonusText}>
                    +{pack.bonus_gems}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Right: Price + Arrow */}
        <View style={styles.packRight}>
          <Text style={styles.packPrice}>
            {gemEconomyService.formatVND(pack.price || 0)}
          </Text>
          <Text style={styles.pricePerGem}>
            ~{gemEconomyService.formatVND(pack.vnd_per_gem || 0)}/gem
          </Text>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </View>
      </View>

      {/* Savings indicator */}
      {(pack.savings_percent || 0) > 0 && (
        <View style={styles.savingsBar}>
          <Sparkles size={14} color={COLORS.success} />
          <Text style={styles.savingsText}>
            Tiết kiệm {pack.savings_percent}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  ), [handlePackPress]);

  // ========== LOADING STATE ==========
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mua Gems</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải danh sách gói Gems...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mua Gems</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <RefreshCw size={18} color={COLORS.gold} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========== EMPTY STATE ==========
  if (gemPacks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mua Gems</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Gem size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Chưa có gói Gems</Text>
          <Text style={styles.emptyMessage}>
            Vui lòng thử lại sau
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <RefreshCw size={18} color={COLORS.gold} />
            <Text style={styles.retryText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mua Gems</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={gemPacks}
        keyExtractor={(item) => item.id || item.slug || Math.random().toString()}
        renderItem={renderPackCard}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {renderBalanceCard()}
            <Text style={styles.sectionTitle}>Chọn gói Gems</Text>
            <Text style={styles.sectionSubtitle}>
              Mua càng nhiều, tiết kiệm càng lớn
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {AlertComponent}
    </SafeAreaView>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.giant,
  },

  // Header
  listHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  // Balance Card
  balanceCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  balanceVnd: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginTop: SPACING.xs,
  },
  walletIcon: {
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  walletText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },

  // Pack Card
  packCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  packCardFeatured: {
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  packContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  packIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,189,89,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  packIconFeatured: {
    backgroundColor: 'rgba(255,189,89,0.2)',
  },
  packInfo: {
    flex: 1,
  },
  packName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  gemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gemsMain: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,136,0.1)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  bonusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },
  packRight: {
    alignItems: 'flex-end',
  },
  packPrice: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  pricePerGem: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.xs,
  },

  // Badge
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },

  // Savings Bar
  savingsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
  },
  savingsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },

  // Loading
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },

  // Error
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Empty
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});

export default GemPackListScreen;
