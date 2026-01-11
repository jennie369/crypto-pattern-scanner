/**
 * GEM Mobile - Portfolio Screen
 * Redesigned to match reference UI with:
 * - Home-style header with settings icons
 * - Total balance card
 * - Quick action buttons (Send, Receive, Buy, P2P, Swap)
 * - Earn Money sponsor banner section
 * - Coin list with logos and real-time prices
 * - Full screen modal for add/edit coin
 * - Custom dark themed alerts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Edit2,
  Trash2,
  X,
  Search,
  Settings,
  Bell,
  QrCode,
  Send,
  ArrowDownToLine,
  ShoppingCart,
  Users,
  ArrowLeftRight,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { portfolioService } from '../../services/portfolioService';
import { sponsorBannerService } from '../../services/sponsorBannerService';
import binanceService from '../../services/binanceService';
import CustomAlert from '../../components/CustomAlert';
import deepLinkHandler from '../../services/deepLinkHandler';
import { navigateToScreen } from '../../utils/navigationHelper';

// Coin logo URLs mapping - direct CoinGecko image IDs
const COIN_LOGO_IDS = {
  'BTC': '1',        // Bitcoin
  'ETH': '279',      // Ethereum
  'BNB': '825',      // BNB
  'SOL': '4128',     // Solana
  'XRP': '44',       // Ripple
  'ADA': '975',      // Cardano
  'DOGE': '5',       // Dogecoin
  'DOT': '6636',     // Polkadot
  'MATIC': '4713',   // Polygon
  'SHIB': '11939',   // Shiba Inu
  'AVAX': '5805',    // Avalanche
  'LINK': '877',     // Chainlink
  'LTC': '2',        // Litecoin
  'UNI': '7083',     // Uniswap
  'ATOM': '1481',    // Cosmos
  'XLM': '512',      // Stellar
  'ETC': '1321',     // Ethereum Classic
  'NEAR': '6535',    // NEAR
  'ALGO': '4030',    // Algorand
  'TRX': '1958',     // Tron
  'APT': '10688',    // Aptos
  'ARB': '11841',    // Arbitrum
  'OP': '11840',     // Optimism
  'SUI': '14101',    // Sui
  'PEPE': '24478',   // Pepe
  'WIF': '28752',    // dogwifhat
  'USDT': '325',     // Tether
  'USDC': '3408',    // USD Coin
};

// Get coin logo URL
const getCoinLogoUrl = (symbol) => {
  const baseSymbol = symbol?.replace(/USDT$/i, '').toUpperCase() || 'BTC';
  const coinId = COIN_LOGO_IDS[baseSymbol];

  if (coinId) {
    return `https://s2.coinmarketcap.com/static/img/coins/64x64/${coinId}.png`;
  }

  // Fallback to symbol-based URL
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${baseSymbol.toLowerCase()}.png`;
};

const FALLBACK_LOGO = 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png'; // BTC

export default function PortfolioScreen({ navigation }) {
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [sponsorBanners, setSponsorBanners] = useState([]);
  const [coinPrices, setCoinPrices] = useState({});

  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
    type: 'default',
  });

  // Form state
  const [formSymbol, setFormSymbol] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Custom alert function
  const showAlert = (title, message, buttons = [{ text: 'OK' }], type = 'default') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons,
      type,
    });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const portfolioData = await portfolioService.getUserPortfolio(user.id);
      setPortfolio(portfolioData);

      const summaryData = await portfolioService.getPortfolioSummary(user.id);
      setSummary(summaryData);

      // Use scanner_tier or tier field (depending on profile structure)
      const userTier = profile?.scanner_tier || profile?.tier || 'FREE';
      const banners = await sponsorBannerService.getActiveBanners(
        'portfolio',
        userTier,
        user.id
      );
      setSponsorBanners(banners);

      if (portfolioData.length > 0) {
        const tickers = await binanceService.getAllFuturesTickers();
        setCoinPrices(tickers);
      }
    } catch (error) {
      console.error('[Portfolio] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile?.scanner_tier, profile?.tier]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async (query) => {
    setFormSymbol(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const results = await portfolioService.searchCoin(query);
    setSearchResults(results);
    setSearching(false);
  };

  const selectCoin = (coin) => {
    setFormSymbol(coin.symbol);
    setSearchResults([]);
  };

  const openAddModal = () => {
    setFormSymbol('');
    setFormQuantity('');
    setFormPrice('');
    setFormNotes('');
    setEditItem(null);
    setAddModalVisible(true);
  };

  const openEditModal = (item) => {
    setFormSymbol(item.symbol);
    setFormQuantity(item.quantity.toString());
    setFormPrice(item.avg_buy_price.toString());
    setFormNotes(item.notes || '');
    setEditItem(item);
    setAddModalVisible(true);
  };

  const handleSave = async () => {
    if (!formSymbol || !formQuantity || !formPrice) {
      showAlert('Lỗi', 'Vui lòng điền đầy đủ thông tin', [{ text: 'OK' }], 'error');
      return;
    }

    const quantity = parseFloat(formQuantity);
    const price = parseFloat(formPrice);

    if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
      showAlert('Lỗi', 'Số lượng và giá phải là số dương', [{ text: 'OK' }], 'error');
      return;
    }

    try {
      if (editItem) {
        const result = await portfolioService.updateCoin(editItem.id, {
          symbol: formSymbol.toUpperCase(),
          quantity,
          avg_buy_price: price,
          notes: formNotes,
        });

        if (result.success) {
          setAddModalVisible(false);
          showAlert('Thành công', 'Đã cập nhật coin', [{ text: 'OK' }], 'success');
          await loadData();
        } else {
          showAlert('Lỗi', result.error, [{ text: 'OK' }], 'error');
        }
      } else {
        const result = await portfolioService.addCoin(
          user.id,
          formSymbol,
          quantity,
          price,
          formNotes
        );

        if (result.success) {
          setAddModalVisible(false);
          showAlert('Thành công', 'Đã thêm coin vào portfolio', [{ text: 'OK' }], 'success');
          await loadData();
        } else {
          showAlert('Lỗi', result.error, [{ text: 'OK' }], 'error');
        }
      }
    } catch (error) {
      showAlert('Lỗi', 'Không thể lưu', [{ text: 'OK' }], 'error');
    }
  };

  const handleDelete = (item) => {
    showAlert(
      'Xác nhận',
      `Bạn có chắc muốn xóa ${item.symbol} khỏi portfolio?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const result = await portfolioService.deleteCoin(item.id);
            if (result.success) {
              await loadData();
            } else {
              showAlert('Lỗi', result.error, [{ text: 'OK' }], 'error');
            }
          },
        },
      ],
      'warning'
    );
  };

  const handleBannerClick = async (banner) => {
    await sponsorBannerService.recordClick(banner.id);
    if (banner.action_type === 'screen' && banner.action_value) {
      // Use navigateToScreen helper for proper nested navigation
      navigateToScreen(navigation, banner.action_value);
    } else if (banner.action_type === 'url' && banner.action_value) {
      Linking.openURL(banner.action_value);
    } else if (banner.action_type === 'deeplink' && banner.action_value) {
      // Parse deeplink value - can be JSON object or gem:// URL
      try {
        let deepLink;
        if (banner.action_value.startsWith('{')) {
          // JSON format: { "screen": "Shop", "params": { "tab": "vip" } }
          deepLink = JSON.parse(banner.action_value);
        } else if (banner.action_value.startsWith('gem://')) {
          // URL format: gem://Shop?tab=vip
          const url = banner.action_value.replace('gem://', '');
          const [screen, queryString] = url.split('?');
          const params = {};
          if (queryString) {
            queryString.split('&').forEach(param => {
              const [key, value] = param.split('=');
              params[key] = decodeURIComponent(value);
            });
          }
          deepLink = { screen, params };
        } else {
          // Simple screen name
          deepLink = { screen: banner.action_value };
        }
        deepLinkHandler.processDeepLink(deepLink);
      } catch (error) {
        console.error('[Banner] Deep link parse error:', error);
        // Fallback to navigateToScreen helper
        navigateToScreen(navigation, banner.action_value);
      }
    }
  };

  const handleDismissBanner = async (bannerId) => {
    if (user?.id) {
      await sponsorBannerService.dismissBanner(user.id, bannerId);
      setSponsorBanners(prev => prev.filter(b => b.id !== bannerId));
    }
  };

  const formatCurrency = (value, decimals = 2) => {
    if (!value && value !== 0) return '--';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Format quantity with appropriate decimals based on value
  const formatQuantity = (value) => {
    if (!value && value !== 0) return '--';
    // For whole numbers or large quantities, show fewer decimals
    if (value >= 1000) return formatCurrency(value, 2);
    if (value >= 1) return formatCurrency(value, 4);
    // For small quantities (fractions), show more decimals
    if (value >= 0.0001) return formatCurrency(value, 6);
    return formatCurrency(value, 8);
  };

  // Format price with appropriate decimals
  const formatPriceValue = (value) => {
    if (!value && value !== 0) return '--';
    // High value coins - show 2 decimals
    if (value >= 1000) return formatCurrency(value, 2);
    // Medium value - show 4 decimals
    if (value >= 1) return formatCurrency(value, 4);
    // Low value coins - show more decimals
    if (value >= 0.0001) return formatCurrency(value, 6);
    return formatCurrency(value, 8);
  };

  // formatPrice is now imported from utils/formatters

  const getRealTimePrice = (symbol) => {
    const ticker = coinPrices[`${symbol}USDT`];
    return ticker?.price || null;
  };

  const getRealTimePriceChange = (symbol) => {
    const ticker = coinPrices[`${symbol}USDT`];
    return ticker?.priceChangePercent || 0;
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Portfolio</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Bell size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Tổng tài sản</Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                {showBalance ? (
                  <Eye size={20} color={COLORS.textMuted} />
                ) : (
                  <EyeOff size={20} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceValue}>
              {showBalance ? `$${formatCurrency(summary?.totalValue || 0)}` : '******'}
            </Text>
            {summary && (
              <View style={styles.balancePnl}>
                {summary.totalPnl >= 0 ? (
                  <TrendingUp size={16} color={COLORS.success} />
                ) : (
                  <TrendingDown size={16} color={COLORS.error} />
                )}
                <Text style={[
                  styles.balancePnlText,
                  { color: summary.totalPnl >= 0 ? COLORS.success : COLORS.error }
                ]}>
                  {showBalance
                    ? `${summary.totalPnl >= 0 ? '+' : ''}$${formatCurrency(Math.abs(summary.totalPnl))} (${summary.totalPnlPercent >= 0 ? '+' : ''}${formatCurrency(summary.totalPnlPercent)}%)`
                    : '****'
                  }
                </Text>
              </View>
            )}
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButtonItem}>
              <View style={styles.actionButtonIcon}>
                <Send size={20} color={COLORS.gold} />
              </View>
              <Text style={styles.actionButtonLabel}>Gửi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonItem}>
              <View style={styles.actionButtonIcon}>
                <ArrowDownToLine size={20} color={COLORS.gold} />
              </View>
              <Text style={styles.actionButtonLabel}>Nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonItem}>
              <View style={styles.actionButtonIcon}>
                <ShoppingCart size={20} color={COLORS.gold} />
              </View>
              <Text style={styles.actionButtonLabel}>Mua</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonItem}>
              <View style={styles.actionButtonIcon}>
                <Users size={20} color={COLORS.gold} />
              </View>
              <Text style={styles.actionButtonLabel}>P2P</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonItem}>
              <View style={styles.actionButtonIcon}>
                <ArrowLeftRight size={20} color={COLORS.gold} />
              </View>
              <Text style={styles.actionButtonLabel}>Swap</Text>
            </TouchableOpacity>
          </View>

          {/* Sponsor Banners */}
          {sponsorBanners.length > 0 && (
            <View style={styles.sponsorSection}>
              {sponsorBanners.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  style={[styles.sponsorBanner, { backgroundColor: banner.background_color || '#1a0b2e' }]}
                  onPress={() => handleBannerClick(banner)}
                  activeOpacity={0.9}
                >
                  {banner.is_dismissible && (
                    <TouchableOpacity
                      style={styles.bannerDismiss}
                      onPress={() => handleDismissBanner(banner.id)}
                    >
                      <X size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  )}
                  <View style={styles.bannerContent}>
                    <View style={styles.bannerTextContent}>
                      <View style={styles.bannerTitleRow}>
                        <Sparkles size={18} color={banner.accent_color || COLORS.gold} />
                        <Text style={[styles.bannerTitle, { color: banner.text_color || '#FFFFFF' }]}>
                          {banner.title}
                        </Text>
                      </View>
                      {banner.subtitle && (
                        <Text style={[styles.bannerSubtitle, { color: banner.text_color || '#FFFFFF' }]} numberOfLines={2}>
                          {banner.subtitle}
                        </Text>
                      )}
                      {banner.action_label && (
                        <View style={[styles.bannerButton, { backgroundColor: banner.accent_color || COLORS.gold }]}>
                          <Text style={styles.bannerButtonText}>{banner.action_label}</Text>
                          <ChevronRight size={14} color="#000" />
                        </View>
                      )}
                    </View>
                    {banner.image_url && (
                      <Image source={{ uri: banner.image_url }} style={styles.bannerImage} resizeMode="cover" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Coin List */}
          <View style={styles.coinListSection}>
            <View style={styles.coinListHeader}>
              <Text style={styles.coinListTitle}>Danh mục coin</Text>
              <TouchableOpacity onPress={openAddModal} style={styles.addCoinButton}>
                <Plus size={18} color={COLORS.gold} />
                <Text style={styles.addCoinText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {portfolio.length === 0 ? (
              <View style={styles.emptyState}>
                <Wallet size={50} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>Portfolio trống</Text>
                <Text style={styles.emptyText}>Thêm coin để theo dõi tài sản của bạn</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                  <Plus size={18} color={COLORS.textPrimary} />
                  <Text style={styles.emptyButtonText}>Thêm coin</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.coinList}>
                {portfolio.map((item) => {
                  const realTimePrice = getRealTimePrice(item.symbol);
                  const priceChange = getRealTimePriceChange(item.symbol);
                  const displayPrice = realTimePrice || item.currentPrice || item.avg_buy_price || 0;
                  const isPositive = priceChange >= 0;

                  // Calculate values correctly
                  const totalValue = item.quantity * displayPrice;
                  const costBasis = item.quantity * (item.avg_buy_price || 0);
                  const pnl = totalValue - costBasis;
                  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.coinCard}
                      onPress={() => openEditModal(item)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: getCoinLogoUrl(item.symbol) }}
                        style={styles.coinLogo}
                        defaultSource={{ uri: FALLBACK_LOGO }}
                        onError={() => console.log(`[Portfolio] Logo failed for ${item.symbol}`)}
                      />
                      <View style={styles.coinInfo}>
                        <Text style={styles.coinSymbol}>{item.symbol}</Text>
                        <Text style={styles.coinQuantity}>{formatQuantity(item.quantity)} coins</Text>
                      </View>
                      <View style={styles.coinPriceSection}>
                        <Text style={styles.coinPrice}>${formatPriceValue(displayPrice)}</Text>
                        <View style={[
                          styles.coinChangeBadge,
                          { backgroundColor: isPositive ? `${COLORS.success}15` : `${COLORS.error}15` }
                        ]}>
                          <Text style={[styles.coinChangeText, { color: isPositive ? COLORS.success : COLORS.error }]}>
                            {isPositive ? '+' : ''}{parseFloat(priceChange || 0).toFixed(2)}%
                          </Text>
                        </View>
                      </View>
                      <View style={styles.coinValue}>
                        <Text style={styles.coinTotalValue}>${formatCurrency(totalValue)}</Text>
                        <Text style={[styles.coinPnl, { color: pnl >= 0 ? COLORS.success : COLORS.error }]}>
                          {pnlPercent >= 0 ? '+' : ''}{formatCurrency(pnlPercent)}%
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.coinDeleteButton}
                        onPress={() => handleDelete(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Full Screen Add/Edit Modal */}
        <Modal
          visible={addModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setAddModalVisible(false)}
        >
          <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
            <SafeAreaView style={styles.modalFullScreen} edges={['top', 'bottom']}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.modalCloseButton}>
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {editItem ? 'Sửa coin' : 'Thêm coin'}
                </Text>
                <View style={{ width: 40 }} />
              </View>

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
              >
                <ScrollView
                  style={styles.modalScrollContent}
                  contentContainerStyle={styles.modalScrollInner}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Symbol Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Symbol</Text>
                    <View style={styles.searchInput}>
                      <Search size={18} color={COLORS.textMuted} />
                      <TextInput
                        style={styles.input}
                        value={formSymbol}
                        onChangeText={handleSearch}
                        placeholder="VD: BTC, ETH..."
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="characters"
                      />
                    </View>
                    {searchResults.length > 0 && (
                      <View style={styles.searchResults}>
                        {searchResults.slice(0, 5).map((coin) => (
                          <TouchableOpacity
                            key={coin.symbol}
                            style={styles.searchResultItem}
                            onPress={() => selectCoin(coin)}
                          >
                            <Text style={styles.searchResultText}>{coin.symbol}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Quantity Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Số lượng</Text>
                    <TextInput
                      style={styles.inputFull}
                      value={formQuantity}
                      onChangeText={setFormQuantity}
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  {/* Price Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Giá mua trung bình (USD)</Text>
                    <TextInput
                      style={styles.inputFull}
                      value={formPrice}
                      onChangeText={setFormPrice}
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  {/* Notes Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
                    <TextInput
                      style={[styles.inputFull, styles.inputMultiline]}
                      value={formNotes}
                      onChangeText={setFormNotes}
                      placeholder="Ghi chú..."
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </ScrollView>

                {/* Modal Buttons - Fixed at bottom */}
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setAddModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Custom Alert */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onClose={closeAlert}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  headerRight: { flexDirection: 'row', gap: 4 },

  // Balance Card
  balanceCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  balanceLabel: { fontSize: 14, color: COLORS.textMuted },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  balancePnl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balancePnlText: { fontSize: 14, fontWeight: '600' },

  // Quick Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  actionButtonItem: { alignItems: 'center', gap: 8 },
  actionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  actionButtonLabel: { fontSize: 12, color: COLORS.textSecondary },

  // Sponsor Banner
  sponsorSection: { marginBottom: SPACING.lg, gap: SPACING.md },
  sponsorBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: SPACING.lg,
    position: 'relative',
  },
  bannerDismiss: { position: 'absolute', top: 8, right: 8, padding: 4, zIndex: 10 },
  bannerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerTextContent: { flex: 1, paddingRight: SPACING.md },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  bannerTitle: { fontSize: 18, fontWeight: '700' },
  bannerSubtitle: { fontSize: 13, opacity: 0.9, marginBottom: SPACING.sm },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  bannerButtonText: { fontSize: 12, fontWeight: '600', color: '#000' },
  bannerImage: { width: 80, height: 80, borderRadius: 12 },

  // Coin List
  coinListSection: {},
  coinListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  coinListTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  addCoinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  addCoinText: { fontSize: 13, color: COLORS.gold, fontWeight: '600' },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginTop: SPACING.lg },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: SPACING.lg,
  },
  emptyButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },

  // Coin List Items
  coinList: { gap: SPACING.sm },
  coinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  coinLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  coinInfo: { flex: 1, marginLeft: SPACING.md },
  coinSymbol: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  coinQuantity: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  coinPriceSection: { alignItems: 'flex-end', marginRight: SPACING.md },
  coinPrice: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  coinChangeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  coinChangeText: { fontSize: 11, fontWeight: '600' },
  coinValue: { alignItems: 'flex-end', marginRight: SPACING.sm },
  coinTotalValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  coinPnl: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  coinDeleteButton: { padding: 6 },

  // Full Screen Modal
  modalFullScreen: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  modalCloseButton: { padding: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalScrollContent: { flex: 1 },
  modalScrollInner: { padding: SPACING.lg },

  // Form
  inputGroup: { marginBottom: SPACING.lg },
  inputLabel: { fontSize: 14, color: COLORS.textMuted, marginBottom: 10 },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 16,
    marginLeft: 12,
  },
  inputFull: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  searchResults: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  searchResultItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchResultText: { fontSize: 15, color: COLORS.textPrimary },

  // Modal Buttons
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
});
