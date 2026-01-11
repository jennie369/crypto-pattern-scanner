/**
 * SpreadInfoModal Component
 * Modal with spread details and position descriptions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  X,
  Clock,
  Layers,
  Sparkles,
  Heart,
  Briefcase,
  TrendingUp,
  Crown,
  Play,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { getTierColor, getTierDisplayName } from '../../data/tarotSpreads';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORY_ICONS = {
  general: Sparkles,
  love: Heart,
  career: Briefcase,
  trading: TrendingUp,
  advanced: Crown,
};

const SpreadInfoModal = ({
  visible,
  spread,
  isLocked = false,
  onClose,
  onStartReading,
  onUpgrade,
}) => {
  const CategoryIcon = CATEGORY_ICONS[spread?.category] || Sparkles;
  const tierColor = getTierColor(spread?.tier_required);
  const tierName = getTierDisplayName(spread?.tier_required);

  // Parse positions from spread
  const positions = spread?.positions
    ? (typeof spread.positions === 'string' ? JSON.parse(spread.positions) : spread.positions)
    : [];

  const handleStartReading = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose?.();
    onStartReading?.(spread);
  };

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose?.();
    onUpgrade?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
        </BlurView>

        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[COLORS.bgMid, COLORS.bgDarkest]}
            style={styles.background}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.categoryBadge, { backgroundColor: `${tierColor}20` }]}>
              <CategoryIcon size={20} color={tierColor} />
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Title */}
            <Text style={styles.title}>
              {spread?.name_vi || spread?.name_en || 'Trải bài'}
            </Text>

            {/* Meta info */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Layers size={16} color={COLORS.cyan} />
                <Text style={styles.metaText}>{spread?.cards || 0} lá bài</Text>
              </View>

              {spread?.estimated_time && (
                <View style={styles.metaItem}>
                  <Clock size={16} color={COLORS.cyan} />
                  <Text style={styles.metaText}>{spread.estimated_time}</Text>
                </View>
              )}

              {spread?.tier_required && spread.tier_required !== 'FREE' && (
                <View style={[styles.tierBadge, { backgroundColor: `${tierColor}30`, borderColor: tierColor }]}>
                  <Text style={[styles.tierText, { color: tierColor }]}>{tierName}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            {(spread?.description_vi || spread?.description_en) && (
              <View style={styles.section}>
                <Text style={styles.description}>
                  {spread.description_vi || spread.description_en}
                </Text>
              </View>
            )}

            {/* Positions */}
            {positions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vị trí các lá bài</Text>

                {positions.map((position, index) => (
                  <View key={index} style={styles.positionItem}>
                    <View style={styles.positionNumber}>
                      <Text style={styles.positionNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.positionContent}>
                      <Text style={styles.positionName}>
                        {position.name_vi || position.name_en || `Vị trí ${index + 1}`}
                      </Text>
                      {position.description_vi && (
                        <Text style={styles.positionDesc}>
                          {position.description_vi}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {isLocked ? (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[tierColor, tierColor + '80']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <Text style={styles.upgradeButtonText}>
                  Nâng cấp lên {tierName}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartReading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={GRADIENTS.primaryButton}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <Play size={20} color={COLORS.textPrimary} />
                <Text style={styles.startButtonText}>Bắt đầu trải bài</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: COLORS.bgDarkest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  tierBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  positionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.md,
  },
  positionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  positionNumberText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  positionContent: {
    flex: 1,
  },
  positionName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  positionDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    gap: SPACING.sm,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  startButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  upgradeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default SpreadInfoModal;
