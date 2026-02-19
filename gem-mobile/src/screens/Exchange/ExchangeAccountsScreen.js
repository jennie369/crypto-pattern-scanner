/**
 * =====================================================
 * ExchangeAccountsScreen
 * =====================================================
 *
 * Quản lý tài khoản sàn giao dịch:
 * - List linked exchanges với status
 * - Balance display (nếu API connected)
 * - Add new exchange button
 * - Connect/Disconnect API actions
 *
 * Access: All tiers
 *
 * =====================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Settings,
  ChevronRight,
  Wallet,
  Shield,
  ExternalLink,
  Unlink,
} from 'lucide-react-native';

// Theme
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme';

// Components
import { ExchangeCard, BalanceWidget } from '../../components/Exchange';

// Services
import { exchangeAffiliateService } from '../../services/exchangeAffiliateService';
import { getExchangeBalance } from '../../services/exchangeAPIService';

// Constants
import { getStatusDisplay } from '../../constants/exchangeConfig';

// Context
import { useAuth } from '../../contexts/AuthContext';

/**
 * Account Item Component
 */
const AccountItem = ({
  account,
  onPress,
  onConnectAPI,
  onViewBalance,
  canConnectAPI,
}) => {
  const statusDisplay = getStatusDisplay(account.status);
  const hasAPI = !!account.api_key_encrypted;
  const exchangeName = account.exchange_config?.display_name || account.exchange;

  return (
    <TouchableOpacity
      style={styles.accountItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Logo */}
      <View style={[
        styles.accountLogo,
        { backgroundColor: account.exchange_config?.color ? `${account.exchange_config.color}20` : 'rgba(255,255,255,0.1)' }
      ]}>
        <Text style={[
          styles.accountLogoText,
          { color: account.exchange_config?.color || COLORS.primary }
        ]}>
          {exchangeName?.charAt(0) || 'E'}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{exchangeName}</Text>

        <View style={styles.accountMeta}>
          {/* Status */}
          <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusDisplay.color }]}>
              {statusDisplay.label}
            </Text>
          </View>

          {/* API badge */}
          {hasAPI && (
            <View style={styles.apiBadge}>
              <Shield size={10} color={COLORS.success} />
              <Text style={styles.apiText}>API</Text>
            </View>
          )}
        </View>

        {/* Balance preview */}
        {hasAPI && account.cached_balance && (
          <Text style={styles.balancePreview}>
            {parseFloat(account.cached_balance.total || 0).toFixed(2)} USDT
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.accountActions}>
        {!hasAPI && canConnectAPI && (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={onConnectAPI}
          >
            <Shield size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <ChevronRight size={20} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

/**
 * Empty State Component
 */
const EmptyState = ({ onAddExchange }) => (
  <View style={styles.emptyState}>
    <Wallet size={48} color={COLORS.textMuted} />
    <Text style={styles.emptyTitle}>Chưa có tài khoản sàn</Text>
    <Text style={styles.emptyDescription}>
      Đăng ký sàn giao dịch qua GEM để nhận ưu đãi giảm phí và theo dõi số dư trên app.
    </Text>
    <TouchableOpacity
      style={styles.addButton}
      onPress={onAddExchange}
      activeOpacity={0.8}
    >
      <Plus size={18} color={COLORS.textPrimary} />
      <Text style={styles.addButtonText}>Đăng ký sàn mới</Text>
    </TouchableOpacity>
  </View>
);

/**
 * Main ExchangeAccountsScreen
 */
const ExchangeAccountsScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canConnectAPI = (profile?.scanner_tier || 0) >= 2;

  // Load accounts
  useEffect(() => {
    loadAccounts();
  }, []);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[ExchangeAccounts] Force refresh received');
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => loadAccounts(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const [accountsData, summaryData] = await Promise.all([
        exchangeAffiliateService.getUserExchangeAccounts(),
        exchangeAffiliateService.getUserExchangeSummary(),
      ]);
      setAccounts(accountsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('[ExchangeAccounts] Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  }, []);

  const handleAddExchange = useCallback(() => {
    navigation.navigate('ExchangeOnboarding', { source: 'accounts' });
  }, [navigation]);

  const handleAccountPress = useCallback((account) => {
    if (account.api_key_encrypted) {
      // Has API - show details/balance
      navigation.navigate('APIConnection', {
        exchangeId: account.exchange,
        mode: 'view',
      });
    } else {
      // No API - open exchange link
      const link = account.exchange_config?.affiliate_link;
      if (link) {
        // Could open link or show options
      }
    }
  }, [navigation]);

  const handleConnectAPI = useCallback((account) => {
    navigation.navigate('APIConnection', {
      exchangeId: account.exchange,
      mode: 'connect',
    });
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản sàn</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {}}
        >
          <Settings size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      {summary && summary.totalAccounts > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalAccounts}</Text>
            <Text style={styles.summaryLabel}>Sàn</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.withDeposit}</Text>
            <Text style={styles.summaryLabel}>Đã nạp</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.withAPI}</Text>
            <Text style={styles.summaryLabel}>API</Text>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {accounts.length === 0 ? (
          <EmptyState onAddExchange={handleAddExchange} />
        ) : (
          <>
            {/* Account List */}
            <View style={styles.accountsList}>
              {accounts.map((account) => (
                <AccountItem
                  key={account.id}
                  account={account}
                  onPress={() => handleAccountPress(account)}
                  onConnectAPI={() => handleConnectAPI(account)}
                  canConnectAPI={canConnectAPI}
                />
              ))}
            </View>

            {/* Add More Button */}
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={handleAddExchange}
              activeOpacity={0.7}
            >
              <Plus size={18} color={COLORS.primary} />
              <Text style={styles.addMoreText}>Thêm sàn khác</Text>
            </TouchableOpacity>

            {/* API Upgrade Prompt */}
            {!canConnectAPI && accounts.some(a => !a.api_key_encrypted) && (
              <View style={styles.upgradePrompt}>
                <Shield size={20} color={COLORS.gold} />
                <View style={styles.upgradeContent}>
                  <Text style={styles.upgradeTitle}>Kết nối API để xem số dư</Text>
                  <Text style={styles.upgradeDescription}>
                    Nâng cấp lên TIER 2 để kết nối API và xem số dư trực tiếp trên GEM.
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  settingsButton: {
    padding: SPACING.xs,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  accountsList: {
    gap: SPACING.sm,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  accountLogo: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  accountLogoText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  apiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  apiText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },
  balancePreview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.primary,
    marginTop: 4,
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  connectButton: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    padding: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  addMoreText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default ExchangeAccountsScreen;
