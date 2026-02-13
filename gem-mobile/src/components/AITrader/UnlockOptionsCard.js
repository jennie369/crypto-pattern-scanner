/**
 * UnlockOptionsCard - Options to unlock blocked trading
 * Shows meditation, journal, rest, wait options with karma bonuses
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, BookOpen, Coffee, Clock, Plus } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';
import { UNLOCK_OPTIONS } from '../../services/gemMasterAIService';

const UnlockOptionsCard = ({
  options = UNLOCK_OPTIONS,
  onSelect,
  selectedOption = null,
  loading = false,
  disabled = false,
  remainingTime = null, // For 'wait' option
  style,
}) => {
  // Get icon component
  const getIcon = (iconName, color) => {
    const iconProps = { size: 24, color, strokeWidth: 2 };
    switch (iconName) {
      case 'Brain':
        return <Brain {...iconProps} />;
      case 'BookOpen':
        return <BookOpen {...iconProps} />;
      case 'Coffee':
        return <Coffee {...iconProps} />;
      case 'Clock':
        return <Clock {...iconProps} />;
      default:
        return <Brain {...iconProps} />;
    }
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} phút`;
    return `${Math.floor(minutes / 60)} giờ`;
  };

  // Format remaining time
  const formatRemainingTime = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (option) => {
    if (disabled || loading) return;
    onSelect?.(option);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Bài tập mở khóa</Text>
      <Text style={styles.subtitle}>
        Hoàn thành một trong các bài tập sau để tiếp tục
      </Text>

      <View style={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isWaitOption = option.id === 'wait';

          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.7}
              disabled={disabled || loading}
              onPress={() => handleSelect(option)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                disabled && styles.optionCardDisabled,
              ]}
            >
              <LinearGradient
                colors={
                  isSelected
                    ? ['rgba(0, 217, 255, 0.2)', 'rgba(106, 91, 255, 0.2)']
                    : ['rgba(15, 16, 48, 0.6)', 'rgba(15, 16, 48, 0.8)']
                }
                style={styles.optionGradient}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    isSelected && styles.iconContainerSelected,
                  ]}
                >
                  {getIcon(
                    option.icon,
                    isSelected ? COLORS.cyan : COLORS.textMuted
                  )}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>

                {/* Duration or remaining time */}
                {isWaitOption && remainingTime ? (
                  <Text style={styles.remainingTime}>
                    {formatRemainingTime(remainingTime)}
                  </Text>
                ) : option.duration ? (
                  <Text style={styles.duration}>
                    {formatDuration(option.duration)}
                  </Text>
                ) : null}

                {/* Karma bonus */}
                {option.karmaBonus > 0 && (
                  <View style={styles.karmaBonus}>
                    <Plus size={12} color={COLORS.success} strokeWidth={2} />
                    <Text style={styles.karmaBonusText}>
                      {option.karmaBonus} Karma
                    </Text>
                  </View>
                )}

                {/* Loading indicator */}
                {loading && isSelected && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator color={COLORS.cyan} size="small" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Info text */}
      <Text style={styles.infoText}>
        Thiền định và nhật ký giao dịch tăng Karma
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  optionCard: {
    width: '47%',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
  },
  optionCardSelected: {
    borderColor: COLORS.cyan,
    borderWidth: 2,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
  },
  optionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  optionLabelSelected: {
    color: COLORS.textPrimary,
  },
  duration: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.xs,
  },
  remainingTime: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  karmaBonus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 2,
  },
  karmaBonusText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontStyle: 'italic',
  },
});

export default UnlockOptionsCard;
