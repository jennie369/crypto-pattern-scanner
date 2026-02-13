/**
 * GEM Mobile - Affiliate Dashboard Screen
 * Track orders, commissions, and KPI performance
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  Users,
  Award,
  ChevronRight,
  Copy,
  Share2,
  Link2,
  ExternalLink,
  MousePointer,
  ShoppingBag,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import { orderTrackingService } from '../../services/orderTrackingService';
import affiliateService from '../../services/affiliateService';
import { supabase } from '../../services/supabase';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AffiliateScreen = ({ navigation }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [commissionStats, setCommissionStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [copied, setCopied] = useState(false);
  const [productLinks, setProductLinks] = useState([]);
  const [productLinkStats, setProductLinkStats] = useState(null);
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setPartnerId(user.id);

      // Get partner profile
      const { data: profile } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setPartnerProfile(profile);

      // Get commission stats
      const stats = await orderTrackingService.getCommissionStats(user.id);
      setCommissionStats(stats);

      // Get recent orders
      const orders = await orderTrackingService.getRecentOrdersWithCommission(user.id, 10);
      setRecentOrders(orders);

      // Get monthly data
      const monthly = await orderTrackingService.getMonthlyCommissions(user.id, 6);
      setMonthlyData(monthly);

      // Get product affiliate links
      const links = await affiliateService.getProductLinks(10);
      setProductLinks(links || []);

      // Get product link stats
      const linkStats = await affiliateService.getProductLinkStats();
      setProductLinkStats(linkStats);

    } catch (error) {
      console.error('[AffiliateScreen] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Copy referral link
  const copyReferralLink = async () => {
    if (!partnerProfile?.referral_code) return;

    const link = `https://gemral.com/?ref=${partnerProfile.referral_code}`;
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy product link
  const copyProductLink = async (link) => {
    try {
      const result = await affiliateService.copyProductLink(link);
      if (result.success) {
        setCopiedLinkId(link.id);
        setTimeout(() => setCopiedLinkId(null), 2000);
      }
    } catch (err) {
      console.error('[AffiliateScreen] Copy product link error:', err);
    }
  };

  // Share product link
  const shareProductLink = async (link) => {
    try {
      await affiliateService.shareProductLink(link);
    } catch (err) {
      console.error('[AffiliateScreen] Share product link error:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get tier badge color
  const getTierColor = (tier) => {
    const colors = {
      beginner: COLORS.textMuted,
      growing: COLORS.info,
      master: COLORS.gold,
      grand: COLORS.burgundy,
    };
    return colors[tier] || COLORS.textMuted;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: COLORS.warning,
      paid: COLORS.success,
      completed: COLORS.success,
      cancelled: COLORS.error,
    };
    return colors[status] || COLORS.textMuted;
  };

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Affiliate Dashboard</Text>
            {partnerProfile && (
              <View style={[styles.tierBadge, { backgroundColor: getTierColor(partnerProfile.ctv_tier) }]}>
                <Text style={styles.tierText}>
                  {partnerProfile.role?.toUpperCase()} - {partnerProfile.ctv_tier?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Referral Link Card */}
          {partnerProfile?.referral_code && (
            <View style={styles.referralCard}>
              <View style={styles.referralHeader}>
                <Share2 size={20} color={COLORS.gold} />
                <Text style={styles.referralTitle}>Your Referral Link</Text>
              </View>
              <View style={styles.referralLinkRow}>
                <Text style={styles.referralLink} numberOfLines={1}>
                  gemral.com/?ref={partnerProfile.referral_code}
                </Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyReferralLink}
                  activeOpacity={0.8}
                >
                  <Copy size={18} color={copied ? COLORS.success : COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              {copied && (
                <Text style={styles.copiedText}>Copied!</Text>
              )}
            </View>
          )}

          {/* Product Links Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Link2 size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>My Product Links</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('Shop')}
              >
                <Text style={styles.seeAllText}>Browse Products</Text>
                <ChevronRight size={16} color={COLORS.gold} />
              </TouchableOpacity>
            </View>

            {/* Product Link Stats */}
            {productLinkStats && productLinkStats.totalLinks > 0 && (
              <View style={styles.productLinkStatsRow}>
                <View style={styles.productLinkStat}>
                  <Link2 size={16} color={COLORS.purple} />
                  <Text style={styles.productLinkStatValue}>{productLinkStats.totalLinks}</Text>
                  <Text style={styles.productLinkStatLabel}>Links</Text>
                </View>
                <View style={styles.productLinkStat}>
                  <MousePointer size={16} color={COLORS.cyan} />
                  <Text style={styles.productLinkStatValue}>{productLinkStats.totalClicks}</Text>
                  <Text style={styles.productLinkStatLabel}>Clicks</Text>
                </View>
                <View style={styles.productLinkStat}>
                  <ShoppingBag size={16} color={COLORS.gold} />
                  <Text style={styles.productLinkStatValue}>{productLinkStats.totalSales}</Text>
                  <Text style={styles.productLinkStatLabel}>Sales</Text>
                </View>
                <View style={styles.productLinkStat}>
                  <DollarSign size={16} color={COLORS.success} />
                  <Text style={styles.productLinkStatValue}>{formatCurrency(productLinkStats.totalEarnings)}</Text>
                  <Text style={styles.productLinkStatLabel}>Earned</Text>
                </View>
              </View>
            )}

            {/* Product Links List */}
            {productLinks.length > 0 ? (
              productLinks.map((link) => (
                <View key={link.id} style={styles.productLinkCard}>
                  <View style={styles.productLinkInfo}>
                    {link.image_url ? (
                      <View style={styles.productLinkImageContainer}>
                        <ImageIcon size={24} color={COLORS.textMuted} />
                      </View>
                    ) : (
                      <View style={styles.productLinkImageContainer}>
                        <Package size={24} color={COLORS.textMuted} />
                      </View>
                    )}
                    <View style={styles.productLinkDetails}>
                      <Text style={styles.productLinkName} numberOfLines={1}>
                        {link.product_name}
                      </Text>
                      <Text style={styles.productLinkPrice}>
                        {formatCurrency(link.product_price)} VND
                      </Text>
                      <View style={styles.productLinkMeta}>
                        <Text style={styles.productLinkMetaText}>
                          {link.clicks || 0} clicks
                        </Text>
                        <Text style={styles.productLinkMetaDot}></Text>
                        <Text style={styles.productLinkMetaText}>
                          {link.sales_count || 0} sales
                        </Text>
                        {link.commission_earned > 0 && (
                          <>
                            <Text style={styles.productLinkMetaDot}></Text>
                            <Text style={[styles.productLinkMetaText, { color: COLORS.success }]}>
                              +{formatCurrency(link.commission_earned)}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.productLinkActions}>
                    <TouchableOpacity
                      style={styles.productLinkActionBtn}
                      onPress={() => copyProductLink(link)}
                    >
                      <Copy
                        size={18}
                        color={copiedLinkId === link.id ? COLORS.success : COLORS.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.productLinkActionBtn}
                      onPress={() => shareProductLink(link)}
                    >
                      <Share2 size={18} color={COLORS.gold} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyProductLinks}>
                <Link2 size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyProductLinksTitle}>No product links yet</Text>
                <Text style={styles.emptyProductLinksSubtext}>
                  Go to any product and tap the link icon to get your affiliate link
                </Text>
                <TouchableOpacity
                  style={styles.browseProductsBtn}
                  onPress={() => navigation.navigate('Shop')}
                >
                  <Text style={styles.browseProductsText}>Browse Products</Text>
                  <ExternalLink size={16} color={COLORS.gold} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            {/* Total Commission */}
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <DollarSign size={24} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>
                {formatCurrency(commissionStats?.totalCommission)}
              </Text>
              <Text style={styles.statLabel}>Total Commission</Text>
            </View>

            {/* Pending Commission */}
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Clock size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>
                {formatCurrency(commissionStats?.pendingCommission)}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Paid Commission */}
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <CheckCircle size={24} color={COLORS.cyan} />
              </View>
              <Text style={styles.statValue}>
                {formatCurrency(commissionStats?.paidCommission)}
              </Text>
              <Text style={styles.statLabel}>Paid Out</Text>
            </View>

            {/* Total Orders */}
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Package size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.statValue}>
                {commissionStats?.totalOrders || 0}
              </Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
          </View>

          {/* Total Sales */}
          {partnerProfile?.total_sales > 0 && (
            <View style={styles.totalSalesCard}>
              <View style={styles.totalSalesHeader}>
                <TrendingUp size={24} color={COLORS.gold} />
                <Text style={styles.totalSalesTitle}>Total Sales</Text>
              </View>
              <Text style={styles.totalSalesValue}>
                {formatCurrency(partnerProfile.total_sales)} VND
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min((partnerProfile.total_sales / 600000000) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round((partnerProfile.total_sales / 600000000) * 100)}% to Grand
                </Text>
              </View>
            </View>
          )}

          {/* Recent Orders Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('OrderHistory')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={COLORS.gold} />
              </TouchableOpacity>
            </View>

            {recentOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Package size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No orders yet</Text>
                <Text style={styles.emptySubtext}>
                  Share your referral link to start earning
                </Text>
              </View>
            ) : (
              recentOrders.map((order, index) => (
                <View key={order.id || index} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderNumber}>
                        #{order.shopify_order_id || order.order_number}
                      </Text>
                      <Text style={styles.orderDate}>
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(order.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(order.status) },
                        ]}
                      >
                        {order.status?.toUpperCase() || 'PENDING'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    <View style={styles.orderRow}>
                      <Text style={styles.orderLabel}>Order Total</Text>
                      <Text style={styles.orderValue}>
                        {formatCurrency(order.order_total || order.total_price)} VND
                      </Text>
                    </View>
                    <View style={styles.orderRow}>
                      <Text style={styles.orderLabel}>Commission</Text>
                      <Text style={[styles.orderValue, styles.commissionValue]}>
                        +{formatCurrency(order.commission_amount)} VND
                      </Text>
                    </View>
                    <View style={styles.orderRow}>
                      <Text style={styles.orderLabel}>Product Type</Text>
                      <View
                        style={[
                          styles.productTypeBadge,
                          {
                            backgroundColor:
                              order.product_type === 'digital'
                                ? `${COLORS.purple}30`
                                : `${COLORS.gold}30`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.productTypeText,
                            {
                              color:
                                order.product_type === 'digital'
                                  ? COLORS.purple
                                  : COLORS.gold,
                            },
                          ]}
                        >
                          {order.product_type?.toUpperCase() || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Monthly Performance */}
          {monthlyData.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Monthly Performance</Text>
              {monthlyData.map((month, index) => (
                <View key={month.month || index} style={styles.monthCard}>
                  <Text style={styles.monthLabel}>{month.month}</Text>
                  <View style={styles.monthStats}>
                    <View style={styles.monthStat}>
                      <Text style={styles.monthStatLabel}>Sales</Text>
                      <Text style={styles.monthStatValue}>
                        {formatCurrency(month.totalSales)}
                      </Text>
                    </View>
                    <View style={styles.monthStat}>
                      <Text style={styles.monthStatLabel}>Commission</Text>
                      <Text style={[styles.monthStatValue, { color: COLORS.success }]}>
                        {formatCurrency(month.totalCommission)}
                      </Text>
                    </View>
                    <View style={styles.monthStat}>
                      <Text style={styles.monthStatLabel}>Orders</Text>
                      <Text style={styles.monthStatValue}>{month.orderCount}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Bottom spacing */}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.textMuted,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Referral Card
  referralCard: {
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  referralTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },
  referralLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  referralLink: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  copiedText: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 8,
    textAlign: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    padding: SPACING.lg,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Total Sales Card
  totalSalesCard: {
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  totalSalesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.sm,
  },
  totalSalesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },
  totalSalesValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  progressBarContainer: {
    marginTop: SPACING.sm,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },

  // Section
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
  },

  // Product Links Stats Row
  productLinkStatsRow: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  productLinkStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  productLinkStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  productLinkStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // Product Link Card
  productLinkCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productLinkInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  productLinkImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productLinkDetails: {
    flex: 1,
  },
  productLinkName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  productLinkPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.cyan,
    marginBottom: 4,
  },
  productLinkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  productLinkMetaText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  productLinkMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 6,
  },
  productLinkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  productLinkActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty Product Links
  emptyProductLinks: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  emptyProductLinksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptyProductLinksSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  browseProductsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  browseProductsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.gold,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Order Card
  orderCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  orderDetails: {
    padding: SPACING.md,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  orderValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  commissionValue: {
    color: COLORS.success,
  },
  productTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  productTypeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Monthly Card
  monthCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthStat: {
    alignItems: 'center',
  },
  monthStatLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  monthStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default AffiliateScreen;
