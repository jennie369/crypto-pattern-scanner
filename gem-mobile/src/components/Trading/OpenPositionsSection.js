/**
 * GEM Mobile - Open Positions Section
 * Compact display of open positions for Trading tab
 * Full features: Edit, Stats, Navigate to detail, Drag to reorder
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  UIManager,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
// Note: Using simple map instead of DraggableFlatList to avoid nested VirtualizedList error
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  ExternalLink,
  Edit2,
  Check,
  Wallet,
  BarChart2,
  Award,
  Percent,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice, formatCurrency } from '../../utils/formatters';
import { binanceService } from '../../services/binanceService';
import paperTradeService from '../../services/paperTradeService';

/**
 * Single Position Card - Full Featured with Drag Handle
 */
const PositionCard = ({
  position,
  onClose,
  onEdit,
  onViewChart,      // Tap card → show on chart
  onViewDetail,     // Tap "xem chi tiết" → navigate to detail
  closing,
  editing,
  editingTP,
  editingSL,
  onSaveEdit,
  onCancelEdit,
  setEditingTP,
  setEditingSL,
}) => {
  const isLong = position.direction === 'LONG';
  const pnl = position.unrealizedPnL || 0;
  const pnlPercent = position.unrealizedPnLPercent || 0;
  const isProfitable = pnl >= 0;

  // Only custom mode positions can be edited
  const isCustomMode = position.tradeMode === 'custom' || position.trade_mode === 'custom';

  const isEditingThis = editing === position.id;

  return (
    <View
      style={[
        styles.positionCard,
        isLong ? styles.positionCardLong : styles.positionCardShort,
      ]}
    >
      {/* Header Row */}
      <View style={styles.positionHeader}>
        {/* Main Content - Tap to show on chart */}
        <TouchableOpacity
          style={styles.leftColumn}
          onPress={() => onViewChart?.(position.symbol)}
          activeOpacity={0.8}
        >
          <View style={styles.symbolRow}>
            <Text style={styles.positionSymbol}>{position.symbol?.replace('USDT', '')}</Text>
            <View style={[styles.directionBadge, { backgroundColor: isLong ? COLORS.success : COLORS.error }]}>
              {isLong ? <TrendingUp size={10} color="#000" /> : <TrendingDown size={10} color="#FFF" />}
              <Text style={[styles.directionText, { color: isLong ? '#000' : '#FFF' }]}>
                {position.direction}
              </Text>
            </View>
            <Text style={styles.leverageText}>{position.leverage || 10}x</Text>
            {/* Mode indicator */}
            <View style={[styles.modeBadge, isCustomMode ? styles.modeBadgeCustom : styles.modeBadgePattern]}>
              <Text style={styles.modeBadgeText}>{isCustomMode ? 'Custom' : 'Pattern'}</Text>
            </View>
          </View>
          {/* PnL under symbol */}
          <View style={styles.pnlRow}>
            <Text style={[styles.pnlValue, { color: isProfitable ? COLORS.success : COLORS.error }]}>
              {isProfitable ? '+' : ''}{formatCurrency(pnl)} USDT
            </Text>
            <Text style={[styles.pnlPercent, { color: isProfitable ? COLORS.success : COLORS.error }]}>
              ({isProfitable ? '+' : ''}{pnlPercent.toFixed(2).replace('.', ',')}% ROI)
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right side - Edit + Close buttons */}
        <View style={styles.rightActions}>
          {/* Edit button - only for custom mode */}
          {isCustomMode && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit?.(position)}
            >
              <Edit2 size={14} color={COLORS.purple} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onClose?.(position)}
            disabled={closing}
            activeOpacity={0.7}
          >
            {closing ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Text style={styles.closeButtonText}>Đóng lệnh</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Price Details Row */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Giá vào</Text>
          <Text style={styles.detailValue}>${formatPrice(position.entryPrice)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Giá hiện tại</Text>
          <Text style={[styles.detailValue, { color: isProfitable ? COLORS.success : COLORS.error }]}>
            ${formatPrice(position.currentPrice)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Margin</Text>
          <Text style={styles.detailValue}>${formatCurrency(position.margin || position.positionSize)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Size</Text>
          <Text style={styles.detailValue}>${formatCurrency((position.margin || position.positionSize) * (position.leverage || 10))}</Text>
        </View>
      </View>

      {/* TP/SL Row - Editable */}
      {isEditingThis ? (
        <View style={styles.editRow}>
          <View style={styles.editInputGroup}>
            <Text style={[styles.editLabel, { color: COLORS.success }]}>TP:</Text>
            <TextInput
              style={styles.editInput}
              value={editingTP}
              onChangeText={setEditingTP}
              keyboardType="decimal-pad"
              placeholder="Take Profit"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <View style={styles.editInputGroup}>
            <Text style={[styles.editLabel, { color: COLORS.error }]}>SL:</Text>
            <TextInput
              style={styles.editInput}
              value={editingSL}
              onChangeText={setEditingSL}
              keyboardType="decimal-pad"
              placeholder="Stop Loss"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={() => onSaveEdit?.(position)}>
            <Check size={16} color={COLORS.success} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancelEdit}>
            <X size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tpslRow}>
          {position.takeProfit ? (
            <View style={styles.tpslItem}>
              <Target size={10} color={COLORS.success} />
              <Text style={[styles.tpslText, { color: COLORS.success }]}>
                TP: ${formatPrice(position.takeProfit)}
              </Text>
            </View>
          ) : (
            <View style={styles.tpslItem}>
              <Target size={10} color={COLORS.textMuted} />
              <Text style={[styles.tpslText, { color: COLORS.textMuted }]}>TP: --</Text>
            </View>
          )}
          {position.stopLoss ? (
            <View style={styles.tpslItem}>
              <Target size={10} color={COLORS.error} />
              <Text style={[styles.tpslText, { color: COLORS.error }]}>
                SL: ${formatPrice(position.stopLoss)}
              </Text>
            </View>
          ) : (
            <View style={styles.tpslItem}>
              <Target size={10} color={COLORS.textMuted} />
              <Text style={[styles.tpslText, { color: COLORS.textMuted }]}>SL: --</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.tpslItem}
            onPress={() => onViewDetail?.(position)}
            activeOpacity={0.7}
          >
            <Text style={styles.tapHint}>Xem chi tiết →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/**
 * Open Positions Section Component
 */
const OpenPositionsSection = ({
  userId,
  navigation,
  onViewAllPress,
  onViewChart,
  onPositionClose,
  refreshTrigger = 0,
}) => {
  const [positions, setPositions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [closingId, setClosingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingTP, setEditingTP] = useState('');
  const [editingSL, setEditingSL] = useState('');
  const pricesRef = useRef({});
  const wsUnsubscribesRef = useRef([]);

  // Load positions with CLOUD SYNC
  const loadPositions = useCallback(async () => {
    try {
      console.log('[OpenPositionsSection] Loading positions for userId:', userId);

      // Always ensure currentUserId is synced with component's userId
      // This fixes stats not updating after close when init returns early
      if (userId && paperTradeService.currentUserId !== userId) {
        paperTradeService.currentUserId = userId;
      }

      await paperTradeService.init(userId);

      // Get open positions - use getOpenPositions for proper filtering
      const allPositions = paperTradeService.getOpenPositions(userId);
      console.log('[OpenPositionsSection] Positions loaded:', allPositions.length);

      // Get stats - this now filters by the correct userId
      const tradeStats = paperTradeService.getStats(userId);
      console.log('[OpenPositionsSection] Stats loaded:', tradeStats);

      setPositions(allPositions);
      setStats(tradeStats);

      // Setup WebSocket subscriptions
      setupPriceSubscriptions(allPositions);
    } catch (error) {
      console.error('[OpenPositionsSection] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Setup WebSocket for real-time prices
  const setupPriceSubscriptions = useCallback((currentPositions) => {
    // Cleanup existing
    wsUnsubscribesRef.current.forEach(unsub => {
      if (typeof unsub === 'function') unsub();
    });
    wsUnsubscribesRef.current = [];

    const symbols = [...new Set(currentPositions.map(p => p.symbol))];
    if (symbols.length === 0) return;

    symbols.forEach(symbol => {
      const unsubscribe = binanceService.subscribe(symbol, (priceData) => {
        if (priceData?.price) {
          pricesRef.current[symbol] = priceData.price;
          updatePositionsWithPrice(symbol, priceData.price);
        }
      });
      wsUnsubscribesRef.current.push(unsubscribe);
    });
  }, []);

  // Update positions with new price
  const updatePositionsWithPrice = useCallback((symbol, price) => {
    setPositions(prev => {
      return prev.map(p => {
        if (p.symbol !== symbol) return p;
        const currentPrice = price;
        const priceDiff = p.direction === 'LONG'
          ? currentPrice - p.entryPrice
          : p.entryPrice - currentPrice;
        const quantity = (p.margin * p.leverage) / p.entryPrice;
        const unrealizedPnL = priceDiff * quantity;
        const unrealizedPnLPercent = (unrealizedPnL / p.margin) * 100;
        return { ...p, currentPrice, unrealizedPnL, unrealizedPnLPercent };
      });
    });
  }, []);

  // Load on mount and when refresh trigger changes
  useEffect(() => {
    loadPositions();
    return () => {
      wsUnsubscribesRef.current.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [loadPositions, refreshTrigger]);

  // CRITICAL: Reload positions when screen comes back into focus
  // This ensures positions update after closing from PatternDetailScreen
  useFocusEffect(
    useCallback(() => {
      console.log('[OpenPositionsSection] Screen focused - reloading positions');
      loadPositions();
      // Cleanup on blur (optional)
      return () => {
        // Could cleanup subscriptions here if needed
      };
    }, [loadPositions])
  );

  // Handle close position
  const handleClosePosition = async (position) => {
    try {
      setClosingId(position.id);

      // CRITICAL: Ensure currentUserId is set before closing
      // This ensures the closed trade syncs to Supabase correctly
      if (userId && paperTradeService.currentUserId !== userId) {
        paperTradeService.currentUserId = userId;
      }

      // Get current price from ref or position
      const currentPrice = pricesRef.current[position.symbol] || position.currentPrice;

      // closePosition takes (positionId, exitPrice, exitReason) - NOT userId
      const closedTrade = await paperTradeService.closePosition(
        position.id,
        currentPrice,
        'MANUAL'
      );

      if (closedTrade) {
        // Reload positions
        await loadPositions();
        onPositionClose?.(position, closedTrade);
      }
    } catch (error) {
      console.error('[OpenPositionsSection] Close error:', error);
      alert('Lỗi đóng lệnh: ' + (error.message || 'Không xác định'));
    } finally {
      setClosingId(null);
    }
  };

  // Format price for edit input - rounds to proper decimals, Vietnamese format
  const formatPriceForEdit = (price) => {
    if (!price || isNaN(price)) return '';
    let rounded;
    if (price >= 1000) {
      rounded = Math.round(price * 100) / 100;
    } else if (price >= 100) {
      rounded = Math.round(price * 1000) / 1000;
    } else if (price >= 1) {
      rounded = Math.round(price * 10000) / 10000;
    } else {
      rounded = Math.round(price * 100000000) / 100000000;
    }
    return rounded.toString().replace('.', ',');
  };

  // Handle edit position
  const handleEditPosition = (position) => {
    setEditingId(position.id);
    setEditingTP(formatPriceForEdit(position.takeProfit));
    setEditingSL(formatPriceForEdit(position.stopLoss));
  };

  // Save edited TP/SL
  const handleSaveEdit = async (position) => {
    try {
      const updates = {};
      // Parse Vietnamese format (comma as decimal) back to number
      if (editingTP) updates.takeProfit = parseFloat(editingTP.replace(',', '.'));
      if (editingSL) updates.stopLoss = parseFloat(editingSL.replace(',', '.'));

      // Use the correct method name
      await paperTradeService.updatePosition(position.id, updates);
      setEditingId(null);
      await loadPositions();
    } catch (error) {
      console.error('[OpenPositionsSection] Save edit error:', error);
      // Show error if it's a pattern mode position
      if (error.message?.includes('Cannot modify') || error.message?.includes('Pattern Mode')) {
        alert('Không thể chỉnh sửa lệnh Pattern Mode');
      }
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTP('');
    setEditingSL('');
  };

  // Navigate to position detail
  const handlePositionPress = (position) => {
    if (navigation) {
      // Build pattern object from position data for PatternDetail screen
      // CRITICAL: Include ALL financial data for accurate PnL calculation
      const pattern = {
        // Spread existing patternData if available
        ...(position.patternData || {}),
        // Core trade info
        symbol: position.symbol,
        type: position.patternType,
        patternType: position.patternType,
        timeframe: position.timeframe,
        direction: position.direction,
        // Price levels
        entry: position.entryPrice,
        entryPrice: position.entryPrice,
        stopLoss: position.stopLoss,
        takeProfit: position.takeProfit,
        target: position.takeProfit,
        currentPrice: position.currentPrice,
        // CRITICAL: Financial data for accurate PnL calculation
        margin: position.margin || position.positionSize,
        positionSize: position.positionSize || position.margin,
        leverage: position.leverage || 10,
        positionValue: position.positionValue || ((position.margin || position.positionSize || 0) * (position.leverage || 10)),
        quantity: position.quantity,
        // Metadata
        confidence: position.confidence || 85,
        riskReward: position.riskReward,
        openedAt: position.openedAt || position.createdAt,
        tradeMode: position.tradeMode || position.trade_mode,
        trade_mode: position.trade_mode || position.tradeMode,
      };
      // Navigate to PatternDetail with position context
      navigation.navigate('PatternDetail', {
        pattern,
        fromPosition: true,
        positionId: position.id,
      });
    } else if (onViewAllPress) {
      onViewAllPress();
    }
  };

  // Toggle collapse - removed LayoutAnimation to prevent Android crashes
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Calculate totals
  const totalPnL = positions.reduce((sum, p) => sum + (p.unrealizedPnL || 0), 0);
  const totalMargin = positions.reduce((sum, p) => sum + (p.margin || 0), 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải vị thế...</Text>
        </View>
      </View>
    );
  }

  // Always show section - display empty state if no positions
  // This helps debugging and shows the section is working

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggleCollapse} activeOpacity={0.8}>
        <View style={styles.headerLeft}>
          <Briefcase size={20} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Lệnh Đang Mở</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{positions.length}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Total PnL */}
          <Text style={[styles.totalPnL, { color: totalPnL >= 0 ? COLORS.success : COLORS.error }]}>
            {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
          </Text>
          {collapsed ? (
            <ChevronUp size={18} color={COLORS.textMuted} />
          ) : (
            <ChevronDown size={18} color={COLORS.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Stats Row - Like OpenPositionsScreen */}
      {!collapsed && stats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Wallet size={12} color={COLORS.textMuted} />
            <Text style={styles.statLabel}>Margin</Text>
            <Text style={styles.statValue}>${formatCurrency(totalMargin)}</Text>
          </View>
          <View style={styles.statItem}>
            <BarChart2 size={12} color={COLORS.textMuted} />
            <Text style={styles.statLabel}>Đã đóng</Text>
            <Text style={styles.statValue}>{stats.totalTrades || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Award size={12} color={COLORS.success} />
            <Text style={styles.statLabel}>Thắng</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.wins || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Percent size={12} color={COLORS.gold} />
            <Text style={styles.statLabel}>Win Rate</Text>
            <Text style={[styles.statValue, { color: COLORS.gold }]}>{(stats.winRate || 0).toFixed(1).replace('.', ',')}%</Text>
          </View>
        </View>
      )}

      {/* Positions List */}
      {!collapsed && (
        <View style={styles.positionsList}>
          {/* Empty State */}
          {positions.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có lệnh đang mở</Text>
              <Text style={styles.emptySubtext}>Mở lệnh Paper Trade để bắt đầu</Text>
            </View>
          )}
          <View style={styles.positionsContent}>
            {positions.map((item) => (
              <PositionCard
                key={item.id}
                position={item}
                onClose={handleClosePosition}
                onEdit={handleEditPosition}
                onViewChart={onViewChart}
                onViewDetail={handlePositionPress}
                closing={closingId === item.id}
                editing={editingId}
                editingTP={editingTP}
                editingSL={editingSL}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                setEditingTP={setEditingTP}
                setEditingSL={setEditingSL}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllPress}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <ExternalLink size={14} color={COLORS.purple} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    marginTop: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.25)',
    overflow: 'hidden',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },

  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.15)',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  countBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },

  countText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.purple,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  totalPnL: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },

  statItem: {
    alignItems: 'center',
    gap: 2,
  },

  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },

  statValue: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  positionsList: {
    // No maxHeight - let parent ScrollView handle scrolling
  },

  positionsContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.lg,
  },

  // Position Card
  positionCard: {
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
  },

  positionCardLong: {
    borderColor: 'rgba(58, 247, 166, 0.25)',
  },

  positionCardShort: {
    borderColor: 'rgba(255, 107, 107, 0.25)',
  },

  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },

  leftColumn: {
    flex: 1,
  },

  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  positionSymbol: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },

  directionText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  leverageText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  modeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 2,
  },

  modeBadgePattern: {
    backgroundColor: 'rgba(106, 91, 255, 0.25)',
  },

  modeBadgeCustom: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
  },

  modeBadgeText: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  pnlValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  pnlPercent: {
    fontSize: 11,
  },

  rightActions: {
    flexDirection: 'row',
    gap: 6,
  },

  editButton: {
    padding: 6,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },

  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.25)',
  },

  closeButtonText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.error,
  },

  detailsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  detailItem: {
    flex: 1,
    backgroundColor: 'rgba(106, 91, 255, 0.08)',
    padding: 4,
    borderRadius: 4,
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
  },

  detailValue: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Edit Row
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },

  editInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  editLabel: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginRight: 2,
  },

  editInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 80,
  },

  saveButton: {
    padding: 6,
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    borderRadius: 4,
  },

  cancelButton: {
    padding: 6,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 4,
  },

  // TP/SL Row
  tpslRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },

  tpslItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tpslText: {
    fontSize: 10,
  },

  tapHint: {
    fontSize: 10,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: 'auto',
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 8,
  },

  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },

  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    opacity: 0.7,
  },
});

export default OpenPositionsSection;
