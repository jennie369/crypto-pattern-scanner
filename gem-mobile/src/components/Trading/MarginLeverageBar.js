/**
 * GEM Scanner - Margin Mode & Leverage Bar Component
 * Cross/Isolated toggle + Leverage slider with quick presets
 */

import React, { memo, useCallback, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { AlertTriangle, HelpCircle, X } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import {
  LEVERAGE_CONFIG,
  getLeverageColor,
  getLeverageWarningLevel,
} from '../../constants/tradingConstants';

const MarginLeverageBar = ({
  leverage = 20,
  onLeverageChange,
  liquidationPrice = null,
  disabled = false,
}) => {
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [tempLeverage, setTempLeverage] = useState(leverage);

  // Sync tempLeverage when parent leverage prop changes (e.g., from preset buttons)
  useEffect(() => {
    setTempLeverage(leverage);
  }, [leverage]);

  // Use tempLeverage for visual display during dragging (smooth feedback)
  const displayLeverage = tempLeverage;
  const leverageColor = getLeverageColor(displayLeverage);
  const warningLevel = getLeverageWarningLevel(displayLeverage);

  // Handle leverage change from slider - only update local state for smooth dragging
  // DO NOT call onLeverageChange here to avoid parent re-renders causing jitter
  const handleSliderChange = useCallback((value) => {
    const roundedValue = Math.round(value);
    setTempLeverage(roundedValue);
  }, []);

  // Apply leverage on slider complete - sync with parent
  const handleSliderComplete = useCallback((value) => {
    const roundedValue = Math.round(value);
    setTempLeverage(roundedValue);
    if (onLeverageChange) {
      onLeverageChange(roundedValue);
    }
  }, [onLeverageChange]);

  // Quick leverage preset
  const handleQuickLeverage = useCallback((value) => {
    setTempLeverage(value);
    if (onLeverageChange) {
      onLeverageChange(value);
    }
  }, [onLeverageChange]);

  // Open leverage modal for precise input
  const openLeverageModal = useCallback(() => {
    setTempLeverage(leverage);
    setShowLeverageModal(true);
  }, [leverage]);

  // Confirm leverage from modal
  const confirmLeverage = useCallback(() => {
    if (onLeverageChange) {
      onLeverageChange(tempLeverage);
    }
    setShowLeverageModal(false);
  }, [tempLeverage, onLeverageChange]);

  return (
    <View style={styles.container}>
      {/* Top Row: Leverage Display Only (Cross/Isolated removed - not implemented in Paper Trading) */}
      <View style={styles.topRow}>
        {/* Current Leverage Display */}
        <TouchableOpacity
          style={[styles.leverageDisplay, { borderColor: leverageColor }]}
          onPress={openLeverageModal}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.leverageValue, { color: leverageColor }]}>
            {displayLeverage}x
          </Text>
          {warningLevel !== 'safe' && (
            <AlertTriangle size={14} color={leverageColor} />
          )}
        </TouchableOpacity>
      </View>

      {/* Leverage Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.sliderLabel}>Đòn bẩy</Text>
          {liquidationPrice && (
            <Text style={styles.liquidationText}>
              Giá thanh lý: <Text style={styles.liquidationPrice}>${liquidationPrice.toLocaleString('vi-VN')}</Text>
            </Text>
          )}
        </View>

        <Slider
          style={styles.slider}
          minimumValue={LEVERAGE_CONFIG.min}
          maximumValue={LEVERAGE_CONFIG.max}
          value={tempLeverage}
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSliderComplete}
          step={1}
          minimumTrackTintColor={leverageColor}
          maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
          thumbTintColor={leverageColor}
          disabled={disabled}
        />

        {/* Slider tick marks */}
        <View style={styles.tickMarks}>
          {LEVERAGE_CONFIG.tickMarks.map((tick) => (
            <TouchableOpacity
              key={tick}
              style={styles.tickMark}
              onPress={() => handleQuickLeverage(tick)}
              disabled={disabled}
            >
              <View
                style={[
                  styles.tickDot,
                  displayLeverage >= tick && { backgroundColor: leverageColor },
                ]}
              />
              <Text
                style={[
                  styles.tickLabel,
                  displayLeverage === tick && { color: leverageColor, fontWeight: '700' },
                ]}
              >
                {tick}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>


      {/* Warning Message */}
      {warningLevel !== 'safe' && (
        <View
          style={[
            styles.warningContainer,
            { backgroundColor: `${leverageColor}15`, borderColor: `${leverageColor}40` },
          ]}
        >
          <AlertTriangle size={14} color={leverageColor} />
          <Text style={[styles.warningText, { color: leverageColor }]}>
            {warningLevel === 'extreme'
              ? LEVERAGE_CONFIG.extremeMessage
              : warningLevel === 'danger'
              ? LEVERAGE_CONFIG.dangerMessage
              : LEVERAGE_CONFIG.warningMessage}
          </Text>
        </View>
      )}

      {/* Leverage Input Modal */}
      <Modal
        visible={showLeverageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeverageModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLeverageModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn đòn bẩy</Text>
              <TouchableOpacity
                onPress={() => setShowLeverageModal(false)}
                style={styles.modalClose}
              >
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                value={String(tempLeverage)}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setTempLeverage(Math.min(Math.max(num, 1), 125));
                }}
                keyboardType="number-pad"
                maxLength={3}
                selectTextOnFocus
              />
              <Text style={styles.modalInputSuffix}>x</Text>
            </View>

            <View style={styles.modalQuickButtons}>
              {LEVERAGE_CONFIG.quickOptions.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.modalQuickButton,
                    tempLeverage === value && styles.modalQuickButtonActive,
                  ]}
                  onPress={() => setTempLeverage(value)}
                >
                  <Text
                    style={[
                      styles.modalQuickButtonText,
                      tempLeverage === value && styles.modalQuickButtonTextActive,
                    ]}
                  >
                    {value}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmLeverage}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  // Top Row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  // Leverage Display
  leverageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },
  leverageValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Slider
  sliderContainer: {
    marginBottom: SPACING.sm,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  liquidationText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  liquidationPrice: {
    color: COLORS.error,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  tickMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -8,
  },
  tickMark: {
    alignItems: 'center',
  },
  tickDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 2,
  },
  tickLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  // Warning
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 6,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalClose: {
    padding: SPACING.xs,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  modalInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.gold,
    textAlign: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  modalInputSuffix: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gold,
    marginLeft: SPACING.sm,
  },
  modalQuickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  modalQuickButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 50,
    alignItems: 'center',
  },
  modalQuickButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },
  modalQuickButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  modalQuickButtonTextActive: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});

export default memo(MarginLeverageBar);
