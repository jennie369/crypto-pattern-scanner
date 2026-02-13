/**
 * ModeTabSelector - Tab toggle for Pattern/Custom mode
 * Used in PaperTradeModal for dual mode trading
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Lock, Pencil, Info, X, Gem, Brain, Infinity } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

/**
 * @param {Object} props
 * @param {'pattern' | 'custom'} props.activeMode - Current active mode
 * @param {Function} props.onModeChange - Callback when mode changes
 * @param {Object|null} props.customModeLimit - Limit info for FREE users (null = unlimited)
 * @param {boolean} props.customModeLimit.allowed - Can use custom mode
 * @param {number} props.customModeLimit.remaining - Remaining uses today
 * @param {number} props.customModeLimit.dailyLimit - Max daily uses
 * @param {boolean} props.disabled - Disable all tabs
 */
const ModeTabSelector = ({
  activeMode = 'pattern',
  onModeChange,
  customModeLimit = null,
  disabled = false,
}) => {
  // Animation ref for indicator
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  // Tooltip modal state
  const [showTooltip, setShowTooltip] = useState(false);

  // Animate indicator when mode changes
  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeMode === 'pattern' ? 0 : 1,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, [activeMode, indicatorAnim]);

  // Handle tab press
  const handleTabPress = (mode) => {
    if (disabled) return;

    // Check limit for Custom Mode
    if (mode === 'custom' && customModeLimit && !customModeLimit.allowed) {
      // Limit exceeded - parent should handle showing upgrade modal
      onModeChange?.('custom_limit_exceeded');
      return;
    }

    onModeChange?.(mode);
  };

  // Interpolate indicator position
  const indicatorLeft = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  // Check if Custom Mode is disabled
  const isCustomDisabled = disabled || (customModeLimit && !customModeLimit.allowed);

  // Format remaining text
  const getRemainingText = () => {
    if (!customModeLimit) {
      return 'Không giới hạn';
    }
    if (!customModeLimit.allowed) {
      return 'Hết lượt - Nâng cấp';
    }
    return `${customModeLimit.remaining}/${customModeLimit.dailyLimit} lượt còn lại hôm nay`;
  };

  return (
    <View style={styles.container}>
      {/* Info Button */}
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => setShowTooltip(true)}
        activeOpacity={0.7}
      >
        <Info size={16} color={COLORS.info} />
        <Text style={styles.infoText}>Tìm hiểu về 2 chế độ</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            { left: indicatorLeft },
          ]}
        />

        {/* Pattern Mode Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress('pattern')}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <View style={styles.tabContent}>
            <Lock
              size={16}
              color={activeMode === 'pattern' ? COLORS.gold : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabTitle,
                activeMode === 'pattern' && styles.tabTitleActive,
              ]}
            >
              GEM Pattern
            </Text>
          </View>
          <Text
            style={[
              styles.tabSubtitle,
              activeMode === 'pattern' && styles.tabSubtitleActive,
            ]}
          >
            (Khuyên dùng)
          </Text>
        </TouchableOpacity>

        {/* Custom Mode Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress('custom')}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <View style={styles.tabContent}>
            <Pencil
              size={16}
              color={
                isCustomDisabled
                  ? COLORS.textDisabled
                  : activeMode === 'custom'
                  ? COLORS.gold
                  : COLORS.textMuted
              }
            />
            <Text
              style={[
                styles.tabTitle,
                activeMode === 'custom' && styles.tabTitleActive,
                isCustomDisabled && styles.tabTitleDisabled,
              ]}
            >
              Custom Mode
            </Text>
          </View>
          {/* Show infinity icon for unlimited (admin/tier1+), or text count for FREE users */}
          {!customModeLimit ? (
            <View style={styles.unlimitedBadge}>
              <Infinity
                size={16}
                color={activeMode === 'custom' ? COLORS.success : COLORS.textMuted}
              />
            </View>
          ) : (
            <Text
              style={[
                styles.tabSubtitle,
                activeMode === 'custom' && styles.tabSubtitleActive,
                isCustomDisabled && styles.tabSubtitleDisabled,
              ]}
            >
              ({customModeLimit.remaining}/{customModeLimit.dailyLimit} lượt còn lại)
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tooltip Modal */}
      <Modal
        visible={showTooltip}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTooltip(false)}
      >
        <TouchableOpacity
          style={styles.tooltipOverlay}
          activeOpacity={1}
          onPress={() => setShowTooltip(false)}
        >
          <View style={styles.tooltipContent}>
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>Chế Độ Giao Dịch</Text>
              <TouchableOpacity onPress={() => setShowTooltip(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* GEM Pattern Mode */}
              <View style={styles.tooltipSection}>
                <View style={styles.tooltipSectionHeader}>
                  <View style={[styles.tooltipIcon, { backgroundColor: COLORS.gold + '20' }]}>
                    <Gem size={20} color={COLORS.gold} />
                  </View>
                  <View style={styles.tooltipSectionTitle}>
                    <Text style={styles.tooltipModeTitle}>GEM Pattern Mode</Text>
                    <Text style={styles.tooltipModeRecommend}>Khuyên dùng</Text>
                  </View>
                </View>
                <Text style={styles.tooltipDescription}>
                  • Entry, Stop Loss, Take Profit được cố định từ pattern scan{'\n'}
                  • Đã được tối ưu bởi công thức GEM Frequency độc quyền với Win Rate 68%{'\n'}
                  • Phù hợp cho người mới và trader muốn theo tín hiệu chuẩn{'\n'}
                  • Không giới hạn số lần sử dụng
                </Text>
              </View>

              {/* Custom Mode */}
              <View style={styles.tooltipSection}>
                <View style={styles.tooltipSectionHeader}>
                  <View style={[styles.tooltipIcon, { backgroundColor: COLORS.warning + '20' }]}>
                    <Brain size={20} color={COLORS.warning} />
                  </View>
                  <View style={styles.tooltipSectionTitle}>
                    <Text style={styles.tooltipModeTitle}>Custom Mode</Text>
                    <Text style={styles.tooltipModeAdvanced}>Nâng cao</Text>
                  </View>
                </View>
                <Text style={styles.tooltipDescription}>
                  • Tự chỉnh Entry, Stop Loss, Take Profit theo ý bạn{'\n'}
                  • GEM Sư Phụ sẽ đánh giá và cho điểm setup của bạn{'\n'}
                  • Hiển thị cảnh báo nếu trade có rủi ro cao{'\n'}
                  • FREE: 3-10 lượt/ngày (tùy Karma Level){'\n'}
                  • TIER1+: Không giới hạn
                </Text>
              </View>

              {/* Daily Limits */}
              <View style={styles.tooltipLimitSection}>
                <Text style={styles.tooltipLimitTitle}>Giới Hạn Custom Mode</Text>
                <View style={styles.tooltipLimitTable}>
                  <View style={styles.tooltipLimitRow}>
                    <Text style={styles.tooltipLimitLabel}>FREE + Novice Karma</Text>
                    <Text style={styles.tooltipLimitValue}>3 lượt/ngày</Text>
                  </View>
                  <View style={styles.tooltipLimitRow}>
                    <Text style={styles.tooltipLimitLabel}>FREE + Student Karma</Text>
                    <Text style={styles.tooltipLimitValue}>10 lượt/ngày</Text>
                  </View>
                  <View style={styles.tooltipLimitRow}>
                    <Text style={styles.tooltipLimitLabel}>TIER1/2/3</Text>
                    <Text style={[styles.tooltipLimitValue, { color: COLORS.success }]}>Không giới hạn</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.tooltipCloseButton}
              onPress={() => setShowTooltip(false)}
            >
              <Text style={styles.tooltipCloseText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginBottom: 2,
    paddingVertical: 2,
  },
  infoText: {
    fontSize: 10,
    color: COLORS.info,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: 10,
    padding: 3,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '50%',
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  tabTitleActive: {
    color: COLORS.gold,
  },
  tabTitleDisabled: {
    color: COLORS.textDisabled,
  },
  tabSubtitle: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },
  tabSubtitleActive: {
    color: COLORS.textSecondary,
  },
  tabSubtitleDisabled: {
    color: COLORS.textDisabled,
  },
  unlimitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  // Tooltip Modal Styles
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  tooltipContent: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.lg,
    maxWidth: 360,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tooltipTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  tooltipSection: {
    marginBottom: SPACING.lg,
  },
  tooltipSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.sm,
  },
  tooltipIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipSectionTitle: {
    flex: 1,
  },
  tooltipModeTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  tooltipModeRecommend: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
  },
  tooltipModeAdvanced: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
  },
  tooltipDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  tooltipLimitSection: {
    backgroundColor: GLASS.background,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  tooltipLimitTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tooltipLimitTable: {
    gap: 8,
  },
  tooltipLimitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipLimitLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  tooltipLimitValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  tooltipCloseButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  tooltipCloseText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
});

export default ModeTabSelector;
