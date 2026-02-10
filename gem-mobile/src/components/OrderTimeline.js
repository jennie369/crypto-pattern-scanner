/**
 * Gemral - Order Timeline Component
 * Visual timeline for order status tracking
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
  MapPin,
} from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';

const OrderTimeline = ({ order, currentStatus }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Define timeline steps based on order status
  const getTimelineSteps = () => {
    const baseSteps = [
      {
        key: 'placed',
        label: 'Đơn hàng đã đặt',
        description: 'Đơn hàng của bạn đã được ghi nhận',
        icon: CreditCard,
        date: order?.createdAt,
        completed: true,
      },
      {
        key: 'confirmed',
        label: 'Xác nhận đơn hàng',
        description: 'Đang xác nhận thanh toán',
        icon: CheckCircle,
        date: order?.confirmedAt,
        completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(currentStatus),
      },
      {
        key: 'processing',
        label: 'Đang chuẩn bị',
        description: 'Đang đóng gói sản phẩm',
        icon: Package,
        date: order?.processingAt,
        completed: ['processing', 'shipped', 'delivered'].includes(currentStatus),
      },
      {
        key: 'shipped',
        label: 'Đang vận chuyển',
        description: order?.trackingNumber
          ? `Mã vận đơn: ${order.trackingNumber}`
          : 'Đơn hàng đang trên đường giao',
        icon: Truck,
        date: order?.shippedAt,
        completed: ['shipped', 'delivered'].includes(currentStatus),
      },
      {
        key: 'delivered',
        label: 'Đã giao hàng',
        description: 'Giao hàng thành công',
        icon: MapPin,
        date: order?.deliveredAt,
        completed: currentStatus === 'delivered',
      },
    ];

    // If order is cancelled, replace with cancelled step
    if (currentStatus === 'cancelled') {
      const cancelledStepIndex = baseSteps.findIndex(s => !s.completed);
      if (cancelledStepIndex !== -1) {
        baseSteps.splice(cancelledStepIndex, baseSteps.length - cancelledStepIndex, {
          key: 'cancelled',
          label: 'Đã hủy',
          description: order?.cancelReason || 'Đơn hàng đã bị hủy',
          icon: XCircle,
          date: order?.cancelledAt,
          completed: true,
          isCancelled: true,
        });
      }
    }

    return baseSteps;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const steps = getTimelineSteps();
  const currentStepIndex = steps.findIndex(s => !s.completed);
  const activeIndex = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex - 1;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      paddingVertical: SPACING.sm,
    },
    stepContainer: {
      position: 'relative',
      marginBottom: SPACING.md,
    },
    lineContainer: {
      position: 'absolute',
      left: 17,
      top: 40,
      bottom: -SPACING.md,
      width: 2,
    },
    line: {
      flex: 1,
      width: 2,
      borderRadius: 1,
    },
    stepContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      marginRight: SPACING.md,
    },
    textContent: {
      flex: 1,
      paddingTop: 2,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textMuted,
    },
    labelCompleted: {
      color: colors.textPrimary,
    },
    labelCancelled: {
      color: colors.error,
    },
    labelActive: {
      color: colors.gold,
    },
    date: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSubtle,
      lineHeight: 18,
    },
    descriptionCompleted: {
      color: colors.textMuted,
    },
    descriptionCancelled: {
      color: colors.error,
      opacity: 0.8,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = step.completed;
        const isActive = index === activeIndex + 1 && !step.completed;
        const isCancelled = step.isCancelled;
        const isLast = index === steps.length - 1;

        // Determine colors
        let iconColor = colors.textMuted;
        let lineColor = 'rgba(255, 255, 255, 0.1)';
        let dotColor = 'rgba(255, 255, 255, 0.2)';

        if (isCompleted) {
          iconColor = isCancelled ? colors.error : colors.success;
          lineColor = isCancelled ? colors.error : colors.success;
          dotColor = isCancelled ? colors.error : colors.success;
        } else if (isActive) {
          iconColor = colors.gold;
          dotColor = colors.gold;
        }

        return (
          <View key={step.key} style={styles.stepContainer}>
            {/* Timeline Line */}
            {!isLast && (
              <View style={styles.lineContainer}>
                <View
                  style={[
                    styles.line,
                    { backgroundColor: isCompleted ? lineColor : 'rgba(255, 255, 255, 0.1)' },
                  ]}
                />
              </View>
            )}

            {/* Step Content */}
            <View style={styles.stepContent}>
              {/* Icon Circle */}
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isCompleted || isActive
                      ? `${dotColor}20`
                      : 'rgba(255, 255, 255, 0.05)',
                    borderColor: dotColor,
                  },
                ]}
              >
                <Icon size={18} color={iconColor} />
              </View>

              {/* Text Content */}
              <View style={styles.textContent}>
                <View style={styles.labelRow}>
                  <Text
                    style={[
                      styles.label,
                      isCompleted && styles.labelCompleted,
                      isCancelled && styles.labelCancelled,
                      isActive && styles.labelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {step.date && (
                    <Text style={styles.date}>{formatDate(step.date)}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.description,
                    isCompleted && styles.descriptionCompleted,
                    isCancelled && styles.descriptionCancelled,
                  ]}
                >
                  {step.description}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default OrderTimeline;
