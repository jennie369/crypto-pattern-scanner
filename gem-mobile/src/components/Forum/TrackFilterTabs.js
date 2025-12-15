/**
 * Gemral - Track Filter Tabs Component
 *
 * Allows users to select their preferred content track
 * Wealth (trading focus) | Wellness (spiritual) | Mastery (balanced)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  TrendingUp,
  Sparkles,
  Crown,
  X,
  Check,
  Settings,
  ChevronRight,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { USER_TRACKS } from '../../services/personalizedFeedService';
import personalizedFeedService from '../../services/personalizedFeedService';
import { useAuth } from '../../contexts/AuthContext';
import { showAlert } from '../../components/CustomAlert';

const TRACK_ICONS = {
  wealth: TrendingUp,
  wellness: Sparkles,
  mastery: Crown,
};

// Compact track selector for header
export const TrackSelectorCompact = ({ currentTrack, onOpenModal }) => {
  const trackInfo = USER_TRACKS[currentTrack] || USER_TRACKS.mastery;
  const Icon = TRACK_ICONS[currentTrack] || Crown;

  return (
    <TouchableOpacity
      style={styles.compactSelector}
      onPress={onOpenModal}
      activeOpacity={0.7}
    >
      <Icon size={18} color={trackInfo.color} />
      <Text style={[styles.compactLabel, { color: trackInfo.color }]}>
        {trackInfo.labelVi}
      </Text>
      <ChevronRight size={14} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
};

// Full track selector modal
const TrackFilterTabs = ({ visible, onClose, onTrackChange }) => {
  const { user } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState('mastery');
  const [loading, setLoading] = useState(false);
  const [initialTrack, setInitialTrack] = useState('mastery');

  useEffect(() => {
    if (visible && user?.id) {
      loadUserTrack();
    }
  }, [visible, user?.id]);

  const loadUserTrack = async () => {
    const result = await personalizedFeedService.getUserTrack(user.id);
    if (result.success) {
      setSelectedTrack(result.track);
      setInitialTrack(result.track);
    }
  };

  const handleSave = async () => {
    if (selectedTrack === initialTrack) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const result = await personalizedFeedService.updateUserTrack(user.id, selectedTrack);

      if (result.success) {
        showAlert('Thành công', `Đã chuyển sang track ${result.trackInfo.labelVi}`);
        onTrackChange?.(selectedTrack);
        onClose();
      } else {
        showAlert('Lỗi', result.error || 'Không thể cập nhật track');
      }
    } catch (error) {
      showAlert('Lỗi', 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const renderTrackOption = (trackKey) => {
    const track = USER_TRACKS[trackKey];
    const Icon = TRACK_ICONS[trackKey];
    const isSelected = selectedTrack === trackKey;

    return (
      <TouchableOpacity
        key={trackKey}
        style={[
          styles.trackOption,
          isSelected && {
            backgroundColor: `${track.color}20`,
            borderColor: track.color,
          },
        ]}
        onPress={() => setSelectedTrack(trackKey)}
        activeOpacity={0.7}
      >
        <View style={[styles.trackIconContainer, { backgroundColor: `${track.color}30` }]}>
          <Icon size={24} color={track.color} />
        </View>

        <View style={styles.trackContent}>
          <Text style={[styles.trackLabel, isSelected && { color: track.color }]}>
            {track.labelVi}
          </Text>
          <Text style={styles.trackDescription}>{track.description}</Text>

          {/* Weight bars */}
          <View style={styles.weightContainer}>
            <View style={styles.weightRow}>
              <TrendingUp size={12} color={COLORS.cyan} />
              <View style={styles.weightBar}>
                <View
                  style={[
                    styles.weightFill,
                    {
                      width: `${track.tradingWeight * 100}%`,
                      backgroundColor: COLORS.cyan,
                    },
                  ]}
                />
              </View>
              <Text style={styles.weightPercent}>
                {Math.round(track.tradingWeight * 100)}%
              </Text>
            </View>
            <View style={styles.weightRow}>
              <Sparkles size={12} color={COLORS.gold} />
              <View style={styles.weightBar}>
                <View
                  style={[
                    styles.weightFill,
                    {
                      width: `${track.wellnessWeight * 100}%`,
                      backgroundColor: COLORS.gold,
                    },
                  ]}
                />
              </View>
              <Text style={styles.weightPercent}>
                {Math.round(track.wellnessWeight * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {isSelected && (
          <View style={[styles.checkCircle, { borderColor: track.color }]}>
            <Check size={16} color={track.color} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chọn Track của bạn</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Settings size={20} color={COLORS.gold} />
            <Text style={styles.descriptionText}>
              Track quyết định tỷ lệ nội dung bạn thấy trong feed. Bạn có thể thay đổi bất cứ lúc
              nào.
            </Text>
          </View>

          {/* Track options */}
          <ScrollView
            style={styles.optionsList}
            showsVerticalScrollIndicator={false}
          >
            {Object.keys(USER_TRACKS).map(renderTrackOption)}
          </ScrollView>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.bgDark} />
            ) : (
              <Text style={styles.saveButtonText}>
                {selectedTrack === initialTrack ? 'Đóng' : 'Lưu thay đổi'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Track badge for display
export const TrackBadge = ({ track, size = 'small' }) => {
  const trackInfo = USER_TRACKS[track] || USER_TRACKS.mastery;
  const Icon = TRACK_ICONS[track] || Crown;
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${trackInfo.color}20`,
          paddingVertical: isSmall ? 4 : 6,
          paddingHorizontal: isSmall ? 8 : 10,
        },
      ]}
    >
      <Icon size={isSmall ? 12 : 14} color={trackInfo.color} />
      <Text
        style={[
          styles.badgeText,
          {
            color: trackInfo.color,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {trackInfo.labelVi}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact selector
  compactSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  compactLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    ...GLASS,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Description
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 12,
  },
  descriptionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Options list
  optionsList: {
    padding: SPACING.md,
  },
  trackOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  trackIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  trackContent: {
    flex: 1,
  },
  trackLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  trackDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },

  // Weight bars
  weightContainer: {
    gap: 6,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  weightFill: {
    height: '100%',
    borderRadius: 2,
  },
  weightPercent: {
    fontSize: 10,
    color: COLORS.textMuted,
    width: 30,
    textAlign: 'right',
  },

  // Check circle
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

  // Save button
  saveButton: {
    backgroundColor: COLORS.gold,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDark,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default TrackFilterTabs;
