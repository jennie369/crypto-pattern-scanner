/**
 * GEM Mobile - Goal Tracking Card Widget
 * Day 17-19: AI Chat → Dashboard Integration
 *
 * Displays goal progress with update functionality.
 * Uses design tokens for consistent styling.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { TrendingUp, Edit3, MoreVertical, Calendar, Bell } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import widgetManagementService from '../../services/widgetManagementService';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

const GoalTrackingCard = ({ widget, onUpdate, isHighlighted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { alert, AlertComponent } = useCustomAlert();

  const { targetAmount, currentAmount, timeline, targetDate } = widget.data;
  const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  // Calculate days left
  const daysLeft = Math.ceil(
    (new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const handleUpdateProgress = async () => {
    if (!editAmount || isNaN(editAmount)) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập số hợp lệ' });
      return;
    }

    try {
      const newAmount = parseFloat(editAmount);
      const result = await widgetManagementService.updateGoalProgress(
        widget.id,
        newAmount
      );

      if (result.newMilestone) {
        alert({
          type: 'success',
          title: 'Milestone!',
          message: `Chúc mừng! Bạn đã đạt ${result.newMilestone}% mục tiêu!`,
        });
      }

      setIsEditing(false);
      setEditAmount('');

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('[GoalTrackingCard] Error updating progress:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể cập nhật progress' });
    }
  };

  // Handle 3 dots menu
  const handleMenuPress = () => {
    alert({
      type: 'info',
      title: widget.title,
      message: 'Chọn hành động',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: '📝 Chỉnh sửa mục tiêu',
          onPress: () => setIsEditing(true)
        },
        {
          text: '🗑️ Xóa mục tiêu',
          style: 'destructive',
          onPress: handleDeleteWidget
        }
      ],
    });
  };

  // Handle delete widget
  const handleDeleteWidget = () => {
    alert({
      type: 'warning',
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa mục tiêu này?',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await widgetManagementService.deleteWidget(widget.id);
              if (onUpdate) onUpdate();
            } catch (error) {
              alert({ type: 'error', title: 'Lỗi', message: 'Không thể xóa mục tiêu' });
            }
          }
        }
      ],
    });
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString('vi-VN');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TrendingUp size={SPACING.xl} color={COLORS.gold} />
          <Text style={styles.title} numberOfLines={1}>
            {widget.title}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <MoreVertical size={SPACING.xl} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <View style={styles.timelineRow}>
        <Calendar size={TYPOGRAPHY.fontSize.lg} color={COLORS.textMuted} />
        <Text style={styles.timeline}>
          Target: {formatDate(targetDate)} ({daysLeft > 0 ? `${daysLeft} days left` : 'Expired'})
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]}>
            {percentage > 10 && (
              <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
            )}
          </View>
        </View>
        <Text style={styles.progressAmount}>
          {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)} VND
        </Text>
      </View>

      {/* Update Progress */}
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editAmount}
            onChangeText={setEditAmount}
            placeholder="Nhập số tiền hiện tại..."
            placeholderTextColor={COLORS.textSubtle}
            keyboardType="numeric"
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProgress}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                setEditAmount('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setIsEditing(true)}
          >
            <Edit3 size={TYPOGRAPHY.fontSize.lg} color={COLORS.bgMid} />
            <Text style={styles.updateButtonText}>Update Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.detailsButtonText}>
              {showDetails ? 'Ẩn' : 'Chi tiết'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Details Section (expandable) */}
      {showDetails && (
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mục tiêu:</Text>
            <Text style={styles.detailValue}>{formatCurrency(targetAmount)} VND</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hiện tại:</Text>
            <Text style={styles.detailValue}>{formatCurrency(currentAmount)} VND</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Còn lại:</Text>
            <Text style={styles.detailValue}>{formatCurrency(targetAmount - currentAmount)} VND</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timeline:</Text>
            <Text style={styles.detailValue}>{timeline}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày tạo:</Text>
            <Text style={styles.detailValue}>{formatDate(widget.created_at)}</Text>
          </View>
          {widget.data.affirmations?.length > 0 && (
            <View style={styles.affirmationsPreview}>
              <Text style={styles.detailLabel}>Affirmations:</Text>
              {widget.data.affirmations.slice(0, 2).map((aff, idx) => (
                <Text key={idx} style={styles.affirmationItem}>• {aff}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Reminders */}
      <View style={styles.reminderInfo}>
        <View style={styles.reminderRow}>
          <Bell size={TYPOGRAPHY.fontSize.md} color={COLORS.textMuted} />
          <Text style={styles.reminderText}>
            Daily reminders: <Text style={styles.reminderStatus}>ON</Text>
          </Text>
        </View>
        <Text style={styles.reminderNext}>Next: 8:00 AM</Text>
      </View>
      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  menuButton: {
    padding: SPACING.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  timeline: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    borderRadius: SPACING.lg,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgMid,
  },
  progressAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  editContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.gold,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgMid,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.md,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    borderRadius: SPACING.md,
    padding: SPACING.md,
  },
  updateButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgMid,
  },
  detailsButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  detailsButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  reminderInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  reminderText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  reminderStatus: {
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  reminderNext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  // Details section styles
  detailsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  affirmationsPreview: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  affirmationItem: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    paddingLeft: SPACING.sm,
  },
});

export default GoalTrackingCard;
