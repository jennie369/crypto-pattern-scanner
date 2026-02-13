/**
 * GEM Scanner - Order Calculations Display Component
 * Shows margin, fee, liquidation price, max position, etc.
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  DollarSign,
  Percent,
  AlertTriangle,
  Calculator,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import {
  calculateOrderDetails,
  formatUSDT,
  formatPrice,
  formatPercent,
} from '../../services/tradingCalculations';

const OrderCalculations = ({
  entryPrice = 0,
  quantity = 0,
  leverage = 1,
  direction = 'LONG',
  marginMode = 'isolated',
  orderType = 'limit',
  tpPercent = null,
  slPercent = null,
  expanded = false,
  onToggleExpand,
  showLiquidationWarning = true,
}) => {
  // Calculate all order details
  const calculations = useMemo(() => {
    if (!entryPrice || !quantity) return null;

    const isMaker = orderType === 'limit' || orderType === 'stop_limit';

    return calculateOrderDetails({
      entryPrice,
      quantity,
      leverage,
      direction,
      marginMode,
      isMaker,
      tpPercent,
      slPercent,
    });
  }, [entryPrice, quantity, leverage, direction, marginMode, orderType, tpPercent, slPercent]);

  // Check if liquidation price is dangerously close
  const liquidationWarning = useMemo(() => {
    if (!calculations?.liquidationPrice || !entryPrice) return null;

    const distance = Math.abs(
      ((entryPrice - calculations.liquidationPrice) / entryPrice) * 100
    );

    if (distance < 5) {
      return 'danger';  // Less than 5% away
    }
    if (distance < 10) {
      return 'warning';  // Less than 10% away
    }
    return null;
  }, [calculations, entryPrice]);

  if (!calculations) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Nhập số lượng để xem chi tiết</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Row - Always visible */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Calculator size={16} color={COLORS.textSecondary} />
          <Text style={styles.headerTitle}>Chi tiết lệnh</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.marginSummary}>
            Margin: {formatUSDT(calculations.initialMargin)}
          </Text>
          {expanded ? (
            <ChevronUp size={18} color={COLORS.textMuted} />
          ) : (
            <ChevronDown size={18} color={COLORS.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Collapsed Summary - Key metrics only */}
      {!expanded && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Vị thế</Text>
            <Text style={styles.summaryValue}>
              {formatUSDT(calculations.positionValue)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Phí</Text>
            <Text style={styles.summaryValue}>
              {formatUSDT(calculations.tradingFee)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Thanh lý</Text>
            <Text
              style={[
                styles.summaryValue,
                liquidationWarning === 'danger' && styles.valueDanger,
                liquidationWarning === 'warning' && styles.valueWarning,
              ]}
            >
              {formatPrice(calculations.liquidationPrice)}
            </Text>
          </View>
        </View>
      )}

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.detailsContainer}>
          {/* Position Value */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <DollarSign size={14} color={COLORS.textMuted} />
              <Text style={styles.detailLabelText}>Giá trị vị thế</Text>
            </View>
            <Text style={styles.detailValue}>
              {formatUSDT(calculations.positionValue)}
            </Text>
          </View>

          {/* Initial Margin */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Percent size={14} color={COLORS.textMuted} />
              <Text style={styles.detailLabelText}>Margin ban đầu</Text>
              <TouchableOpacity style={styles.helpIcon}>
                <HelpCircle size={12} color={COLORS.textDisabled} />
              </TouchableOpacity>
            </View>
            <Text style={styles.detailValue}>
              {formatUSDT(calculations.initialMargin)}
            </Text>
          </View>

          {/* Maintenance Margin */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Text style={styles.detailLabelText}>Margin duy trì</Text>
            </View>
            <Text style={styles.detailValueSmall}>
              {formatUSDT(calculations.maintenanceMargin)}
            </Text>
          </View>

          {/* Trading Fee */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Text style={styles.detailLabelText}>Phí giao dịch</Text>
              <View style={styles.feeTypeBadge}>
                <Text style={styles.feeTypeText}>
                  {orderType === 'market' || orderType === 'stop_market' ? 'Taker' : 'Maker'}
                </Text>
              </View>
            </View>
            <Text style={styles.detailValue}>
              {formatUSDT(calculations.tradingFee)}
            </Text>
          </View>

          {/* Round Trip Fee */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Text style={styles.detailLabelText}>Phí đóng mở</Text>
            </View>
            <Text style={styles.detailValueSmall}>
              ~{formatUSDT(calculations.roundTripFee)}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Liquidation Price */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <AlertTriangle
                size={14}
                color={
                  liquidationWarning === 'danger'
                    ? COLORS.error
                    : liquidationWarning === 'warning'
                    ? COLORS.warning
                    : COLORS.textMuted
                }
              />
              <Text style={styles.detailLabelText}>Giá thanh lý</Text>
              <TouchableOpacity style={styles.helpIcon}>
                <HelpCircle size={12} color={COLORS.textDisabled} />
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.detailValueHighlight,
                liquidationWarning === 'danger' && styles.valueDanger,
                liquidationWarning === 'warning' && styles.valueWarning,
              ]}
            >
              {formatPrice(calculations.liquidationPrice)}
            </Text>
          </View>

          {/* Liquidation Warning */}
          {showLiquidationWarning && liquidationWarning && (
            <View
              style={[
                styles.warningBox,
                liquidationWarning === 'danger'
                  ? styles.warningBoxDanger
                  : styles.warningBoxWarning,
              ]}
            >
              <AlertTriangle
                size={14}
                color={liquidationWarning === 'danger' ? COLORS.error : COLORS.warning}
              />
              <Text
                style={[
                  styles.warningText,
                  liquidationWarning === 'danger'
                    ? styles.warningTextDanger
                    : styles.warningTextWarning,
                ]}
              >
                {liquidationWarning === 'danger'
                  ? 'Giá thanh lý rất gần giá vào lệnh! Rủi ro cao.'
                  : 'Cảnh báo: Giá thanh lý gần giá vào lệnh.'}
              </Text>
            </View>
          )}

          {/* TP/SL Summary if available */}
          {(calculations.takeProfit.price || calculations.stopLoss.price) && (
            <>
              <View style={styles.divider} />

              {calculations.takeProfit.price && (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Text style={[styles.detailLabelText, { color: COLORS.success }]}>
                      TP P&L
                    </Text>
                  </View>
                  <View style={styles.detailValueColumn}>
                    <Text style={[styles.detailValue, styles.valueSuccess]}>
                      +{formatUSDT(calculations.takeProfit.pnl)}
                    </Text>
                    <Text style={styles.detailValueSmall}>
                      ({formatPercent(calculations.takeProfit.roe, true)} ROI)
                    </Text>
                  </View>
                </View>
              )}

              {calculations.stopLoss.price && (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Text style={[styles.detailLabelText, { color: COLORS.error }]}>
                      SL P&L
                    </Text>
                  </View>
                  <View style={styles.detailValueColumn}>
                    <Text style={[styles.detailValue, styles.valueDanger]}>
                      {formatUSDT(calculations.stopLoss.pnl)}
                    </Text>
                    <Text style={styles.detailValueSmall}>
                      ({formatPercent(calculations.stopLoss.roe, false)} ROI)
                    </Text>
                  </View>
                </View>
              )}

              {/* Risk:Reward */}
              {calculations.riskReward && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabelText}>Risk:Reward</Text>
                  <View style={styles.riskRewardContainer}>
                    <Text style={styles.riskRewardValue}>
                      {calculations.riskReward.ratioString}
                    </Text>
                    {calculations.riskReward.ratio >= 2 && (
                      <View style={styles.goodBadge}>
                        <Text style={styles.goodBadgeText}>Tốt</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  emptyText: {
    padding: SPACING.md,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  marginSummary: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
  },
  // Summary Row (Collapsed)
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Details Container (Expanded)
  detailsContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailLabelText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  helpIcon: {
    padding: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detailValueSmall: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detailValueHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detailValueColumn: {
    alignItems: 'flex-end',
  },
  // Value colors
  valueSuccess: {
    color: COLORS.success,
  },
  valueWarning: {
    color: COLORS.warning,
  },
  valueDanger: {
    color: COLORS.error,
  },
  // Fee Type Badge
  feeTypeBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  feeTypeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gold,
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: SPACING.sm,
  },
  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.xs,
  },
  warningBoxDanger: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  warningBoxWarning: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  warningTextDanger: {
    color: COLORS.error,
  },
  warningTextWarning: {
    color: COLORS.warning,
  },
  // Risk:Reward
  riskRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  riskRewardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
  },
  goodBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  goodBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
  },
});

export default memo(OrderCalculations);
