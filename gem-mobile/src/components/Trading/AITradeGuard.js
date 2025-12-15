/**
 * AITradeGuard - Modal showing AI Sư Phụ warnings and blocking UI
 * Displays when AI detects FOMO, revenge trading, or other violations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Lock, AlertTriangle, Clock } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';

// Import AI components
import { AIAvatarOrb, AIMessageBubble, UnlockOptionsCard, TradeBlockBanner } from '../AITrader';

const AITradeGuard = ({
  visible = false,
  aiState = {},
  analyzing = false,
  onClose,
  onUnlock,
  onDismiss,
}) => {
  const {
    mood = 'calm',
    message = '',
    isBlocked = false,
    blockInfo = {},
    requireUnlock = false,
    unlockOptions = [],
    scenario = null,
  } = aiState;

  const [selectedUnlock, setSelectedUnlock] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  // Reset selection when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedUnlock(null);
      setUnlocking(false);
    }
  }, [visible]);

  // Handle unlock selection
  const handleUnlockSelect = async (option) => {
    if (!option || unlocking) return;

    setSelectedUnlock(option.id);
    setUnlocking(true);

    try {
      await onUnlock?.(option.id, option.karmaBonus);
    } catch (error) {
      console.error('[AITradeGuard] Unlock error:', error);
    } finally {
      setUnlocking(false);
    }
  };

  // Handle dismiss (only for warnings, not blocks)
  const handleDismiss = () => {
    if (isBlocked) return; // Cannot dismiss if blocked
    onDismiss?.();
    onClose?.();
  };

  // Get scenario title
  const getScenarioTitle = () => {
    const titles = {
      'fomo_buy_overbought': 'Cảnh báo FOMO',
      'fomo_retry_penalty': 'Vi phạm FOMO',
      'revenge_trade_block': 'Cảnh báo Revenge Trade',
      'no_stoploss': 'Thiếu Stoploss',
      'sl_moved_wider': 'Dời Stoploss',
      'overtrade_warning': 'Quá nhiều lệnh',
      'account_frozen': 'Tài khoản đóng băng',
    };
    return titles[scenario] || 'AI Sư Phụ';
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isBlocked ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#1A1B4B', '#0F1030']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{getScenarioTitle()}</Text>
              {!isBlocked && (
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <X size={24} color={COLORS.textMuted} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* AI Avatar */}
              <View style={styles.avatarSection}>
                <AIAvatarOrb
                  mood={mood}
                  size="large"
                  isAnimating={true}
                  showGlow={true}
                />
              </View>

              {/* AI Message */}
              {message && (
                <View style={styles.messageSection}>
                  <AIMessageBubble
                    message={message}
                    mood={mood}
                    isTyping={analyzing}
                    typingSpeed={30}
                  />
                </View>
              )}

              {/* Block Banner */}
              {isBlocked && (
                <TradeBlockBanner
                  blockInfo={blockInfo}
                  showCountdown={true}
                  style={styles.blockBanner}
                />
              )}

              {/* Unlock Options */}
              {requireUnlock && unlockOptions.length > 0 && (
                <View style={styles.unlockSection}>
                  <Text style={styles.unlockTitle}>Chọn cách mở khóa</Text>
                  <Text style={styles.unlockSubtitle}>
                    Hoàn thành một trong các hoạt động sau để tiếp tục giao dịch
                  </Text>

                  <UnlockOptionsCard
                    options={unlockOptions}
                    selectedId={selectedUnlock}
                    onSelect={handleUnlockSelect}
                    disabled={unlocking}
                    style={styles.unlockOptions}
                  />

                  {unlocking && (
                    <View style={styles.unlockingContainer}>
                      <ActivityIndicator size="small" color={COLORS.cyan} />
                      <Text style={styles.unlockingText}>Đang xử lý...</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Warning Only - Can Proceed */}
              {!isBlocked && (
                <View style={styles.actionsSection}>
                  <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={handleDismiss}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[COLORS.warning, '#D97706']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.proceedBtnGradient}
                    >
                      <AlertTriangle size={18} color="#000" strokeWidth={2} />
                      <Text style={styles.proceedBtnText}>Tôi hiểu, tiếp tục</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelBtnText}>Hủy lệnh</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Blocked - Wait or Unlock */}
              {isBlocked && !requireUnlock && (
                <View style={styles.waitSection}>
                  <Clock size={24} color={COLORS.textMuted} strokeWidth={2} />
                  <Text style={styles.waitText}>
                    Vui lòng chờ đợi hoặc thực hiện hoạt động thiền định
                  </Text>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  messageSection: {
    marginBottom: SPACING.xl,
  },
  blockBanner: {
    marginBottom: SPACING.xl,
  },
  unlockSection: {
    marginBottom: SPACING.xl,
  },
  unlockTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  unlockSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.lg,
  },
  unlockOptions: {
    marginBottom: SPACING.md,
  },
  unlockingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  unlockingText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  actionsSection: {
    gap: SPACING.md,
  },
  proceedBtn: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  proceedBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  proceedBtnText: {
    color: '#000',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  waitSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
  },
  waitText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
});

export default AITradeGuard;
