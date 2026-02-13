/**
 * MuteOptionsModal Component
 * Modal for selecting mute duration for a conversation
 *
 * Features:
 * - Multiple time options (1h, 8h, 24h, 7d, forever)
 * - Current mute status display
 * - Unmute button when muted
 * - Vietnamese UI text
 */

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const MUTE_OPTIONS = [
  { id: '1h', label: '1 giờ', hours: 1, icon: 'time-outline' },
  { id: '8h', label: '8 giờ', hours: 8, icon: 'time-outline' },
  { id: '24h', label: '24 giờ', hours: 24, icon: 'today-outline' },
  { id: '7d', label: '7 ngày', hours: 168, icon: 'calendar-outline' },
  { id: 'forever', label: 'Cho đến khi bật lại', hours: null, icon: 'notifications-off-outline' },
];

/**
 * MuteOptionsModal - Modal chọn thời gian tắt thông báo
 *
 * @param {boolean} visible - Modal visibility
 * @param {string} currentMuteUntil - Current mute end time (ISO string)
 * @param {function} onSelect - (muteUntil: Date) => void
 * @param {function} onUnmute - () => void
 * @param {function} onClose - () => void
 */
const MuteOptionsModal = memo(({
  visible,
  currentMuteUntil,
  onSelect,
  onUnmute,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Check if currently muted
  const isMuted = currentMuteUntil && new Date(currentMuteUntil) > new Date();

  // Format remaining mute time
  const formatMuteRemaining = () => {
    if (!currentMuteUntil) return null;

    const endDate = new Date(currentMuteUntil);
    const now = new Date();

    if (endDate <= now) return null;

    const diffMs = endDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 365) {
      return 'vô thời hạn';
    }
    if (diffDays > 0) {
      return `còn ${diffDays} ngày`;
    }
    if (diffHours > 0) {
      return `còn ${diffHours} giờ`;
    }
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `còn ${diffMinutes} phút`;
  };

  const handleSelect = useCallback(async (option) => {
    setIsLoading(true);
    setSelectedOption(option.id);

    try {
      let muteUntil = null;
      if (option.hours) {
        muteUntil = new Date(Date.now() + option.hours * 60 * 60 * 1000);
      } else {
        // Forever - set to far future (100 years)
        muteUntil = new Date('2099-12-31T23:59:59.999Z');
      }

      await onSelect?.(muteUntil);
      onClose?.();
    } catch (err) {
      console.error('[MuteOptions] Error:', err);
    } finally {
      setIsLoading(false);
      setSelectedOption(null);
    }
  }, [onSelect, onClose]);

  const handleUnmute = useCallback(async () => {
    setIsLoading(true);
    try {
      await onUnmute?.();
      onClose?.();
    } catch (err) {
      console.error('[Unmute] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onUnmute, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="notifications-off" size={24} color={COLORS.textPrimary} />
            <Text style={styles.headerTitle}>Tắt thông báo</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Current status if muted */}
          {isMuted && (
            <View style={styles.statusContainer}>
              <Ionicons name="information-circle" size={18} color={COLORS.gold} />
              <Text style={styles.statusText}>
                Đang tắt thông báo ({formatMuteRemaining()})
              </Text>
            </View>
          )}

          {/* Options */}
          <View style={styles.optionsList}>
            {MUTE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => handleSelect(option)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Ionicons name={option.icon} size={20} color={COLORS.textMuted} />
                <Text style={styles.optionLabel}>{option.label}</Text>
                {selectedOption === option.id && isLoading && (
                  <ActivityIndicator size="small" color={COLORS.gold} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Unmute button if muted */}
          {isMuted && (
            <TouchableOpacity
              style={styles.unmuteButton}
              onPress={handleUnmute}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications" size={18} color={COLORS.textPrimary} />
              <Text style={styles.unmuteButtonText}>Bật thông báo</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

MuteOptionsModal.displayName = 'MuteOptionsModal';

export default MuteOptionsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    flex: 1,
  },
  optionsList: {
    padding: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderRadius: 12,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    flex: 1,
  },
  unmuteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purple,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  unmuteButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});
