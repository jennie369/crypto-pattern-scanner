/**
 * GEM Mobile - Price Alert Modal Component
 * Phase 3C: Create and manage price alerts
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Bell,
  X,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Check,
  AlertTriangle,
  Trash2,
  Plus,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import { alertManager } from '../../services/alertManager';

/**
 * Alert direction options
 */
const ALERT_DIRECTIONS = [
  {
    id: 'above',
    name: 'Crosses Above',
    nameVi: 'Vượt lên trên',
    icon: TrendingUp,
    color: COLORS.success,
    description: 'Alert khi giá vượt lên trên mức này',
  },
  {
    id: 'below',
    name: 'Crosses Below',
    nameVi: 'Xuống dưới',
    icon: TrendingDown,
    color: COLORS.error,
    description: 'Alert khi giá xuống dưới mức này',
  },
  {
    id: 'touches',
    name: 'Touches',
    nameVi: 'Chạm mức',
    icon: Target,
    color: COLORS.primary,
    description: 'Alert khi giá chạm mức này (bất kỳ hướng nào)',
  },
];

/**
 * Main PriceAlertModal component
 */
const PriceAlertModal = memo(({
  visible,
  onClose,
  symbol = 'BTCUSDT',
  currentPrice = 0,
  suggestedPrice = null,
  zone = null,
  userId,
  onAlertCreated,
}) => {
  const [price, setPrice] = useState('');
  const [direction, setDirection] = useState('above');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setPrice(suggestedPrice?.toString() || currentPrice?.toString() || '');
      setDirection(suggestedPrice && suggestedPrice > currentPrice ? 'above' : 'below');
      setNote('');
      setErrors({});
    }
  }, [visible, suggestedPrice, currentPrice]);

  // Validate price input
  const validatePrice = useCallback((value) => {
    const numPrice = parseFloat(value);
    if (isNaN(numPrice) || numPrice <= 0) {
      return 'Giá không hợp lệ';
    }
    if (direction === 'above' && numPrice <= currentPrice) {
      return 'Giá phải cao hơn giá hiện tại';
    }
    if (direction === 'below' && numPrice >= currentPrice) {
      return 'Giá phải thấp hơn giá hiện tại';
    }
    return null;
  }, [direction, currentPrice]);

  // Handle price change
  const handlePriceChange = useCallback((value) => {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    setPrice(cleaned);

    if (cleaned) {
      const error = validatePrice(cleaned);
      setErrors(prev => ({ ...prev, price: error }));
    } else {
      setErrors(prev => ({ ...prev, price: null }));
    }
  }, [validatePrice]);

  // Handle direction change
  const handleDirectionChange = useCallback((newDirection) => {
    setDirection(newDirection);

    // Re-validate price for new direction
    if (price) {
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        if (newDirection === 'above' && numPrice <= currentPrice) {
          setErrors(prev => ({ ...prev, price: 'Giá phải cao hơn giá hiện tại' }));
        } else if (newDirection === 'below' && numPrice >= currentPrice) {
          setErrors(prev => ({ ...prev, price: 'Giá phải thấp hơn giá hiện tại' }));
        } else {
          setErrors(prev => ({ ...prev, price: null }));
        }
      }
    }
  }, [price, currentPrice]);

  // Quick price buttons
  const handleQuickPrice = useCallback((multiplier) => {
    const newPrice = currentPrice * multiplier;
    setPrice(newPrice.toFixed(8).replace(/\.?0+$/, ''));
    setDirection(multiplier > 1 ? 'above' : 'below');
    setErrors({});
  }, [currentPrice]);

  // Set price from zone
  const handleSetFromZone = useCallback((priceType) => {
    if (!zone) return;

    const zonePrice = priceType === 'entry' ? zone.entryPrice : zone.stopPrice;
    setPrice(zonePrice.toFixed(8).replace(/\.?0+$/, ''));
    setDirection(zonePrice > currentPrice ? 'above' : 'below');
    setErrors({});
  }, [zone, currentPrice]);

  // Create alert
  const handleCreate = useCallback(async () => {
    const priceError = validatePrice(price);
    if (priceError) {
      setErrors({ price: priceError });
      return;
    }

    setIsLoading(true);

    try {
      const alertData = {
        symbol,
        type: 'price_level',
        targetPrice: parseFloat(price),
        direction,
        note: note.trim() || null,
        zone: zone || null,
      };

      const result = await alertManager.createAlert(alertData);

      if (result.success) {
        onAlertCreated?.(result.alert);
        onClose();
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể tạo alert');
      }
    } catch (error) {
      console.error('[PriceAlertModal] Create error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  }, [price, direction, note, symbol, zone, validatePrice, onAlertCreated, onClose]);

  // Calculate distance from current price
  const getDistanceText = useCallback(() => {
    if (!price || !currentPrice) return '';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '';

    const distance = ((numPrice - currentPrice) / currentPrice * 100);
    const sign = distance >= 0 ? '+' : '';
    return `${sign}${distance.toFixed(2)}%`;
  }, [price, currentPrice]);

  const distanceText = getDistanceText();
  const isDistancePositive = parseFloat(distanceText) >= 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Bell size={20} color={COLORS.gold} />
              <Text style={styles.headerTitle}>Price Alert</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Symbol Info */}
            <View style={styles.symbolInfo}>
              <Text style={styles.symbol}>{symbol}</Text>
              <View style={styles.currentPriceContainer}>
                <Text style={styles.currentPriceLabel}>Giá hiện tại:</Text>
                <Text style={styles.currentPrice}>
                  ${currentPrice?.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Direction Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Điều kiện</Text>
              <View style={styles.directionsContainer}>
                {ALERT_DIRECTIONS.map((dir) => {
                  const isSelected = direction === dir.id;
                  const IconComponent = dir.icon;

                  return (
                    <TouchableOpacity
                      key={dir.id}
                      style={[
                        styles.directionOption,
                        isSelected && { borderColor: dir.color, backgroundColor: dir.color + '15' },
                      ]}
                      onPress={() => handleDirectionChange(dir.id)}
                      activeOpacity={0.7}
                    >
                      <IconComponent size={20} color={isSelected ? dir.color : COLORS.textMuted} />
                      <Text style={[
                        styles.directionName,
                        isSelected && { color: dir.color },
                      ]}>
                        {dir.nameVi}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Price Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mức giá</Text>
              <View style={styles.priceInputContainer}>
                <DollarSign size={20} color={COLORS.textMuted} />
                <TextInput
                  style={[styles.priceInput, errors.price && styles.inputError]}
                  value={price}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                  placeholder="Nhập mức giá"
                  placeholderTextColor={COLORS.textMuted}
                />
                {distanceText && (
                  <View style={[
                    styles.distanceBadge,
                    { backgroundColor: isDistancePositive ? COLORS.success + '20' : COLORS.error + '20' },
                  ]}>
                    <Text style={[
                      styles.distanceText,
                      { color: isDistancePositive ? COLORS.success : COLORS.error },
                    ]}>
                      {distanceText}
                    </Text>
                  </View>
                )}
              </View>
              {errors.price && (
                <View style={styles.errorContainer}>
                  <AlertTriangle size={12} color={COLORS.error} />
                  <Text style={styles.errorText}>{errors.price}</Text>
                </View>
              )}
            </View>

            {/* Quick Price Buttons */}
            <View style={styles.quickPriceContainer}>
              <TouchableOpacity
                style={styles.quickPriceButton}
                onPress={() => handleQuickPrice(0.99)}
              >
                <Text style={styles.quickPriceText}>-1%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPriceButton}
                onPress={() => handleQuickPrice(0.98)}
              >
                <Text style={styles.quickPriceText}>-2%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPriceButton}
                onPress={() => handleQuickPrice(0.95)}
              >
                <Text style={styles.quickPriceText}>-5%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPriceButton}
                onPress={() => handleQuickPrice(1.01)}
              >
                <Text style={styles.quickPriceText}>+1%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPriceButton}
                onPress={() => handleQuickPrice(1.02)}
              >
                <Text style={styles.quickPriceText}>+2%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPriceButton}
                onPress={() => handleQuickPrice(1.05)}
              >
                <Text style={styles.quickPriceText}>+5%</Text>
              </TouchableOpacity>
            </View>

            {/* Zone Price Buttons */}
            {zone && (
              <View style={styles.zonePriceContainer}>
                <Text style={styles.zonePriceLabel}>Từ Zone:</Text>
                <TouchableOpacity
                  style={styles.zonePriceButton}
                  onPress={() => handleSetFromZone('entry')}
                >
                  <Target size={14} color={COLORS.primary} />
                  <Text style={styles.zonePriceText}>
                    Entry: {zone.entryPrice?.toFixed(4)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.zonePriceButton}
                  onPress={() => handleSetFromZone('stop')}
                >
                  <AlertTriangle size={14} color={COLORS.error} />
                  <Text style={styles.zonePriceText}>
                    Stop: {zone.stopPrice?.toFixed(4)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Note Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ghi chú (tùy chọn)</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="VD: Zone FTB, chờ confirmation..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={2}
                maxLength={200}
              />
            </View>
          </ScrollView>

          {/* Create Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={isLoading || !!errors.price}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <Text style={styles.createButtonText}>Đang tạo...</Text>
              ) : (
                <>
                  <Plus size={18} color={COLORS.bgDarkest} />
                  <Text style={styles.createButtonText}>Tạo Alert</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

/**
 * Quick Alert Button - for creating alerts from zone cards
 */
export const QuickAlertButton = memo(({ zone, symbol, currentPrice, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.quickAlertButton}
      onPress={() => onPress?.({ zone, symbol, currentPrice })}
      activeOpacity={0.7}
    >
      <Bell size={14} color={COLORS.gold} />
      <Text style={styles.quickAlertText}>Alert</Text>
    </TouchableOpacity>
  );
});

/**
 * Alert Created Toast
 */
export const AlertCreatedToast = memo(({ alert, visible, onHide }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible || !alert) return null;

  return (
    <View style={styles.toast}>
      <Check size={18} color={COLORS.success} />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>Alert Created!</Text>
        <Text style={styles.toastMessage}>
          {alert.symbol} @ ${alert.targetPrice?.toLocaleString()}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.glassBg,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },

  // Content
  content: {
    padding: SPACING.lg,
  },

  // Symbol Info
  symbolInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.md,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  currentPriceContainer: {
    alignItems: 'flex-end',
  },
  currentPriceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },

  // Directions
  directionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  directionOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: SPACING.md,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  directionName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Price Input
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontFamily: 'monospace',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  distanceBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
  },

  // Quick Price Buttons
  quickPriceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  quickPriceButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPriceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Zone Price Buttons
  zonePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  zonePriceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  zonePriceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  zonePriceText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },

  // Note Input
  noteInput: {
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // Footer
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Quick Alert Button
  quickAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    backgroundColor: COLORS.gold + '20',
    borderRadius: BORDER_RADIUS.sm,
  },
  quickAlertText: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  toastMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

PriceAlertModal.displayName = 'PriceAlertModal';
QuickAlertButton.displayName = 'QuickAlertButton';
AlertCreatedToast.displayName = 'AlertCreatedToast';

export default PriceAlertModal;
