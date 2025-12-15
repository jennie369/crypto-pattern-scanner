// src/components/Trading/PaperTradeModal.js
import React, { useState, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  ShieldAlert,
  Calculator,
  Check,
} from 'lucide-react-native';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

// ERROR BOUNDARY WRAPPER
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <ShieldAlert size={48} color="#EF4444" />
          <Text style={errorStyles.title}>Đã xảy ra lỗi</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || 'Không thể hiển thị Paper Trade'}
          </Text>
          <TouchableOpacity
            style={errorStyles.button}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={errorStyles.buttonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 16 },
  message: { fontSize: 14, color: '#A0AEC0', marginTop: 8, textAlign: 'center' },
  button: { marginTop: 24, backgroundColor: '#FFBD59', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#0A0F1C', fontWeight: '700' },
});

// Main component
const PaperTradeModal = ({
  visible = false,
  onClose,
  pattern,
  onSubmit,
}) => {
  // CRITICAL: Null checks
  const safePattern = pattern || {};

  const [tradeType, setTradeType] = useState('long');
  const [positionSize, setPositionSize] = useState('100');
  const [leverage, setLeverage] = useState('10');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [loading, setLoading] = useState(false);
  const { alert, AlertComponent } = useCustomAlert();

  // Initialize với safe values
  useEffect(() => {
    if (visible && safePattern) {
      setEntryPrice(formatSafePrice(safePattern.entry));
      setStopLoss(formatSafePrice(safePattern.stopLoss));
      setTakeProfit(formatSafePrice(safePattern.takeProfit1 || safePattern.takeProfit));

      // Detect trade type từ pattern
      if (safePattern.direction) {
        setTradeType(safePattern.direction === 'bullish' ? 'long' : 'short');
      }
    }
  }, [visible, safePattern]);

  // Safe price formatter
  const formatSafePrice = (price) => {
    if (!price || isNaN(price)) return '';
    return parseFloat(price).toString();
  };

  // Calculate PnL
  const calculatePnL = useCallback(() => {
    try {
      const entry = parseFloat(entryPrice) || 0;
      const tp = parseFloat(takeProfit) || 0;
      const sl = parseFloat(stopLoss) || 0;
      const size = parseFloat(positionSize) || 0;
      const lev = parseFloat(leverage) || 1;

      if (!entry || !size) return { profit: 0, loss: 0, rr: 0 };

      const direction = tradeType === 'long' ? 1 : -1;

      const profitPercent = tp ? ((tp - entry) / entry) * direction * 100 : 0;
      const lossPercent = sl ? ((entry - sl) / entry) * direction * 100 : 0;

      const profit = (size * lev * profitPercent) / 100;
      const loss = (size * lev * Math.abs(lossPercent)) / 100;
      const rr = loss > 0 ? Math.abs(profit / loss) : 0;

      return {
        profit: profit.toFixed(2),
        loss: loss.toFixed(2),
        rr: rr.toFixed(2),
      };
    } catch (error) {
      console.error('[PaperTrade] Calculate error:', error);
      return { profit: '0', loss: '0', rr: '0' };
    }
  }, [entryPrice, takeProfit, stopLoss, positionSize, leverage, tradeType]);

  const pnl = calculatePnL();

  // Submit handler
  const handleSubmit = async () => {
    try {
      // Validation
      if (!entryPrice || parseFloat(entryPrice) <= 0) {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: 'Vui lòng nhập giá Entry hợp lệ',
        });
        return;
      }

      setLoading(true);

      const tradeData = {
        symbol: safePattern.symbol || 'UNKNOWN',
        patternId: safePattern.id || null,
        patternType: safePattern.patternType || safePattern.type || '',
        type: tradeType,
        entryPrice: parseFloat(entryPrice),
        stopLoss: parseFloat(stopLoss) || null,
        takeProfit: parseFloat(takeProfit) || null,
        positionSize: parseFloat(positionSize),
        leverage: parseFloat(leverage),
        expectedProfit: parseFloat(pnl.profit),
        expectedLoss: parseFloat(pnl.loss),
        riskReward: parseFloat(pnl.rr),
        timestamp: new Date().toISOString(),
        status: 'open',
      };

      console.log('[PaperTrade] Submitting:', tradeData);

      if (onSubmit) {
        await onSubmit(tradeData);
      }

      alert({
        type: 'success',
        title: 'Thành công!',
        message: `Đã mở lệnh ${tradeType.toUpperCase()} ${safePattern.symbol || ''}`,
        buttons: [{ text: 'OK', onPress: onClose }],
      });
    } catch (error) {
      console.error('[PaperTrade] Submit error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể tạo lệnh. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Close handler
  const handleClose = useCallback(() => {
    if (loading) return;
    onClose?.();
  }, [loading, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <ErrorBoundary>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <SafeAreaView style={styles.container} edges={['bottom']}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Paper Trade</Text>
                  <Text style={styles.subtitle}>
                    {safePattern.symbol || 'N/A'} • {safePattern.patternType || safePattern.type || 'Pattern'}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClose} disabled={loading}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {/* Trade Type Selector */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Loại lệnh</Text>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        tradeType === 'long' && styles.longActive,
                      ]}
                      onPress={() => setTradeType('long')}
                    >
                      <TrendingUp size={18} color={tradeType === 'long' ? '#10B981' : '#A0AEC0'} />
                      <Text style={[
                        styles.typeText,
                        tradeType === 'long' && styles.longText,
                      ]}>
                        LONG
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        tradeType === 'short' && styles.shortActive,
                      ]}
                      onPress={() => setTradeType('short')}
                    >
                      <TrendingDown size={18} color={tradeType === 'short' ? '#EF4444' : '#A0AEC0'} />
                      <Text style={[
                        styles.typeText,
                        tradeType === 'short' && styles.shortText,
                      ]}>
                        SHORT
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Position Size & Leverage */}
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Số tiền ($)</Text>
                    <View style={styles.inputWrapper}>
                      <DollarSign size={16} color="#718096" />
                      <TextInput
                        style={styles.input}
                        value={positionSize}
                        onChangeText={setPositionSize}
                        keyboardType="numeric"
                        placeholder="100"
                        placeholderTextColor="#4A5568"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Đòn bẩy</Text>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputPrefix}>x</Text>
                      <TextInput
                        style={styles.input}
                        value={leverage}
                        onChangeText={setLeverage}
                        keyboardType="numeric"
                        placeholder="10"
                        placeholderTextColor="#4A5568"
                      />
                    </View>
                  </View>
                </View>

                {/* Entry Price */}
                <View style={styles.section}>
                  <Text style={styles.inputLabel}>Giá Entry</Text>
                  <View style={styles.inputWrapper}>
                    <Target size={16} color="#FFBD59" />
                    <TextInput
                      style={styles.input}
                      value={entryPrice}
                      onChangeText={setEntryPrice}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="#4A5568"
                    />
                  </View>
                </View>

                {/* SL & TP */}
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Stop Loss</Text>
                    <View style={[styles.inputWrapper, styles.slInput]}>
                      <ShieldAlert size={16} color="#EF4444" />
                      <TextInput
                        style={styles.input}
                        value={stopLoss}
                        onChangeText={setStopLoss}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor="#4A5568"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Take Profit</Text>
                    <View style={[styles.inputWrapper, styles.tpInput]}>
                      <Target size={16} color="#10B981" />
                      <TextInput
                        style={styles.input}
                        value={takeProfit}
                        onChangeText={setTakeProfit}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor="#4A5568"
                      />
                    </View>
                  </View>
                </View>

                {/* PnL Preview */}
                <View style={styles.pnlCard}>
                  <View style={styles.pnlHeader}>
                    <Calculator size={18} color="#FFBD59" />
                    <Text style={styles.pnlTitle}>Dự kiến</Text>
                  </View>

                  <View style={styles.pnlRow}>
                    <View style={styles.pnlItem}>
                      <Text style={styles.pnlLabel}>Lãi tiềm năng</Text>
                      <Text style={styles.pnlProfit}>+${pnl.profit}</Text>
                    </View>
                    <View style={styles.pnlItem}>
                      <Text style={styles.pnlLabel}>Lỗ tối đa</Text>
                      <Text style={styles.pnlLoss}>-${pnl.loss}</Text>
                    </View>
                    <View style={styles.pnlItem}>
                      <Text style={styles.pnlLabel}>R:R</Text>
                      <Text style={styles.pnlRR}>{pnl.rr}:1</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Submit Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    tradeType === 'long' ? styles.submitLong : styles.submitShort,
                    loading && styles.submitDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#0A0F1C" />
                  ) : (
                    <>
                      <Check size={20} color="#0A0F1C" />
                      <Text style={styles.submitText}>
                        Mở lệnh {tradeType.toUpperCase()}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Bottom spacer for Android */}
              <View style={styles.bottomSpacer} />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
        {AlertComponent}
      </ErrorBoundary>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1A202C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#A0AEC0',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  longActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  shortActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A0AEC0',
  },
  longText: {
    color: '#10B981',
  },
  shortText: {
    color: '#EF4444',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    color: '#A0AEC0',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  slInput: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  tpInput: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  inputPrefix: {
    fontSize: 14,
    color: '#718096',
  },
  input: {
    flex: 1,
    height: 44,
    color: '#FFFFFF',
    fontSize: 15,
  },
  pnlCard: {
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  pnlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pnlTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFBD59',
  },
  pnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pnlItem: {
    alignItems: 'center',
  },
  pnlLabel: {
    fontSize: 11,
    color: '#718096',
    marginBottom: 4,
  },
  pnlProfit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  pnlLoss: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  pnlRR: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFBD59',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitLong: {
    backgroundColor: '#10B981',
  },
  submitShort: {
    backgroundColor: '#EF4444',
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0F1C',
  },
  bottomSpacer: {
    height: Platform.OS === 'android' ? 20 : 0,
  },
});

export default memo(PaperTradeModal);
