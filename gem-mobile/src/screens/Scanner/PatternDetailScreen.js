/**
 * GEM Mobile - Pattern Detail Screen
 * Detailed view of detected pattern with chart
 */

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';
import { binanceService } from '../../services/binanceService';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice } from '../../utils/formatters';
import EnhancementStatsCard from '../../components/Trading/EnhancementStatsCard';
import { TierUpgradeModal } from '../../components/TierUpgradePrompt';
import { AuthContext } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PatternDetailScreen = ({ navigation, route }) => {
  const { pattern } = route.params;
  const [currentPrice, setCurrentPrice] = useState(pattern.currentPrice || 0);
  const [priceChange, setPriceChange] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get user tier from AuthContext (uses scanner_tier from profile)
  const { userTier: contextUserTier } = useContext(AuthContext) || {};
  const userTier = contextUserTier || 'FREE';

  const isLong = pattern.direction === 'LONG';
  const directionColor = isLong ? COLORS.success : COLORS.error;

  // Subscribe to price updates
  useEffect(() => {
    const unsubscribe = binanceService.subscribe(pattern.symbol, (data) => {
      setCurrentPrice(data.price);
      setPriceChange(data.priceChangePercent);
    });

    return () => unsubscribe();
  }, [pattern.symbol]);

  // formatPrice is now imported from utils/formatters

  const formatTime = (timestamp) => {
    if (!timestamp) return '--';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate profit/loss potential
  const potentialProfit = isLong
    ? ((pattern.target - pattern.entry) / pattern.entry) * 100
    : ((pattern.entry - pattern.target) / pattern.entry) * 100;

  const potentialLoss = isLong
    ? ((pattern.entry - pattern.stopLoss) / pattern.entry) * 100
    : ((pattern.stopLoss - pattern.entry) / pattern.entry) * 100;

  // TradingView chart HTML
  const chartHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; background: #05040B; }
          #chart { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="chart"></div>
        <script src="https://s3.tradingview.com/tv.js"></script>
        <script>
          new TradingView.widget({
            "autosize": true,
            "symbol": "BINANCE:${pattern.symbol}",
            "interval": "${pattern.timeframe === '1d' ? 'D' : pattern.timeframe === '1w' ? 'W' : pattern.timeframe?.replace('h', '').replace('m', '')}",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#0F1030",
            "enable_publishing": false,
            "hide_side_toolbar": true,
            "allow_symbol_change": false,
            "container_id": "chart",
            "hide_top_toolbar": true,
            "backgroundColor": "#05040B",
            "gridColor": "rgba(106, 91, 255, 0.1)"
          });
        </script>
      </body>
    </html>
  `;

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
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{pattern.patternType}</Text>
            <Text style={styles.headerSubtitle}>
              {pattern.symbol?.replace('USDT', '')}/USDT
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${directionColor}20` }]}>
            {isLong ? (
              <TrendingUp size={16} color={directionColor} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={16} color={directionColor} strokeWidth={2.5} />
            )}
            <Text style={[styles.badgeText, { color: directionColor }]}>
              {pattern.direction}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Chart */}
          <View style={styles.chartContainer}>
            <WebView
              source={{ html: chartHTML }}
              style={styles.chart}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>

          {/* Current Price */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Current Price</Text>
            <Text style={styles.priceValue}>${formatPrice(currentPrice)}</Text>
            {priceChange !== null && (
              <Text
                style={[
                  styles.priceChange,
                  { color: priceChange >= 0 ? COLORS.success : COLORS.error },
                ]}
              >
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
              </Text>
            )}
          </View>

          {/* Trade Levels */}
          <View style={styles.levelsCard}>
            <Text style={styles.sectionTitle}>Trade Levels</Text>

            <View style={styles.levelItem}>
              <View style={styles.levelLeft}>
                <Target size={18} color={COLORS.cyan} />
                <Text style={styles.levelLabel}>Entry</Text>
              </View>
              <Text style={styles.levelValue}>${formatPrice(pattern.entry)}</Text>
            </View>

            <View style={styles.levelItem}>
              <View style={styles.levelLeft}>
                <TrendingUp size={18} color={COLORS.success} />
                <Text style={styles.levelLabel}>Take Profit</Text>
              </View>
              <View style={styles.levelRight}>
                <Text style={[styles.levelValue, { color: COLORS.success }]}>
                  ${formatPrice(pattern.target)}
                </Text>
                <Text style={styles.profitText}>+{potentialProfit.toFixed(2)}%</Text>
              </View>
            </View>

            <View style={styles.levelItem}>
              <View style={styles.levelLeft}>
                <Shield size={18} color={COLORS.error} />
                <Text style={styles.levelLabel}>Stop Loss</Text>
              </View>
              <View style={styles.levelRight}>
                <Text style={[styles.levelValue, { color: COLORS.error }]}>
                  ${formatPrice(pattern.stopLoss)}
                </Text>
                <Text style={styles.lossText}>-{potentialLoss.toFixed(2)}%</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Confidence</Text>
              <Text style={styles.statValue}>{pattern.confidence}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Risk/Reward</Text>
              <Text style={styles.statValue}>
                {typeof pattern.riskReward === 'number'
                  ? pattern.riskReward.toFixed(2)
                  : pattern.riskReward || '2.0'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Win Rate</Text>
              <Text style={styles.statValue}>{pattern.winRate || 65}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Timeframe</Text>
              <Text style={styles.statValue}>{pattern.timeframe?.toUpperCase()}</Text>
            </View>
          </View>

          {/* Enhancement Stats Card - TIER2/3 Features */}
          <View style={styles.enhancementSection}>
            <EnhancementStatsCard
              pattern={pattern}
              userTier={userTier}
              onUpgradePress={() => setShowUpgradeModal(true)}
              expanded={true}
            />
          </View>

          {/* Description */}
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Pattern Description</Text>
            <Text style={styles.descriptionText}>
              {pattern.description || 'Pattern detected based on technical analysis.'}
            </Text>
          </View>

          {/* Warning */}
          <View style={styles.warningCard}>
            <AlertTriangle size={20} color={COLORS.gold} />
            <Text style={styles.warningText}>
              This is not financial advice. Always do your own research and manage your risk appropriately.
            </Text>
          </View>

          {/* Detection Time */}
          <View style={styles.timeInfo}>
            <Clock size={14} color={COLORS.textMuted} />
            <Text style={styles.timeText}>
              Detected: {formatTime(pattern.detectedAt)}
            </Text>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Tier Upgrade Modal */}
        <TierUpgradeModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          userTier={userTier}
          onUpgrade={(targetTier) => {
            setShowUpgradeModal(false);
            navigation.navigate('Shop');
          }}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scroll: {
    flex: 1,
  },
  chartContainer: {
    height: 300,
    margin: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  chart: {
    flex: 1,
    backgroundColor: '#05040B',
  },
  priceCard: {
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
    marginTop: SPACING.xs,
  },
  priceChange: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginTop: SPACING.xs,
  },
  levelsCard: {
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },
  levelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  levelLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  levelRight: {
    alignItems: 'flex-end',
  },
  levelValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  profitText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    marginTop: 2,
  },
  lossText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    width: (SCREEN_WIDTH - SPACING.md * 3 - SPACING.sm) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  descriptionCard: {
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    lineHeight: 18,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  enhancementSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
});

export default PatternDetailScreen;
