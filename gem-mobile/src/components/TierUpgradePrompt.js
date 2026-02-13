/**
 * TierUpgradePrompt - React Native Component
 * Shows upgrade prompt when user tries to access premium features
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  getUpgradeInfo,
  getTierDisplayInfo,
  getLockedFeatures,
  calculateWinRateBonus,
} from '../constants/tierFeatures';

/**
 * Inline upgrade banner (shows in content)
 */
export function TierUpgradeBanner({ userTier, onUpgrade, style }) {
  const upgradeInfo = getUpgradeInfo(userTier);
  const tierInfo = getTierDisplayInfo(userTier);
  const targetTierInfo = getTierDisplayInfo(upgradeInfo.targetTier);

  if (!upgradeInfo.showPrompt) return null;

  return (
    <TouchableOpacity
      style={[styles.banner, style]}
      onPress={onUpgrade}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#2D1B4E', '#1A0F2E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <View style={styles.bannerContent}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerIcon}>{targetTierInfo.icon}</Text>
            <View>
              <Text style={styles.bannerTitle}>
                Upgrade to {targetTierInfo.label}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {upgradeInfo.benefits[0]}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFC107" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/**
 * Feature lock indicator (shows on locked features)
 */
export function FeatureLockBadge({ requiredTier, size = 'small' }) {
  const tierInfo = getTierDisplayInfo(requiredTier);

  return (
    <View style={[
      styles.lockBadge,
      size === 'large' && styles.lockBadgeLarge
    ]}>
      <Ionicons
        name="lock-closed"
        size={size === 'large' ? 16 : 12}
        color={tierInfo.color}
      />
      <Text style={[
        styles.lockBadgeText,
        { color: tierInfo.color },
        size === 'large' && styles.lockBadgeTextLarge
      ]}>
        {tierInfo.label}
      </Text>
    </View>
  );
}

/**
 * Full upgrade modal
 */
export function TierUpgradeModal({
  visible,
  onClose,
  userTier,
  onUpgrade,
  featureName = null, // Optional - which feature triggered this
}) {
  const upgradeInfo = getUpgradeInfo(userTier);
  const currentTierInfo = getTierDisplayInfo(userTier);
  const targetTierInfo = getTierDisplayInfo(upgradeInfo.targetTier);
  const lockedFeatures = getLockedFeatures(userTier).slice(0, 5);
  const winRateBonus = calculateWinRateBonus(upgradeInfo.targetTier);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient
            colors={[targetTierInfo.color, '#1A0F2E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalIcon}>{targetTierInfo.icon}</Text>
            <Text style={styles.modalTitle}>
              Upgrade to {targetTierInfo.label}
            </Text>
            <Text style={styles.modalSubtitle}>
              Unlock premium pattern detection features
            </Text>
          </LinearGradient>

          {/* Win Rate Bonus */}
          <View style={styles.winRateBox}>
            <Text style={styles.winRateLabel}>Estimated Win Rate Boost</Text>
            <Text style={styles.winRateValue}>{winRateBonus.text}</Text>
            <Text style={styles.winRateDesc}>{winRateBonus.description}</Text>
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            <Text style={styles.benefitsTitle}>You'll get access to:</Text>

            {upgradeInfo.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00FF88" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Locked Features Preview */}
          {lockedFeatures.length > 0 && (
            <View style={styles.lockedSection}>
              <Text style={styles.lockedTitle}>Premium Features:</Text>
              {lockedFeatures.map((feature, index) => (
                <View key={index} style={styles.lockedItem}>
                  <Text style={styles.lockedIcon}>{feature.icon}</Text>
                  <View style={styles.lockedInfo}>
                    <Text style={styles.lockedName}>{feature.name}</Text>
                    <Text style={styles.lockedImpact}>{feature.impact}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                onUpgrade?.(upgradeInfo.targetTier);
                onClose();
              }}
            >
              <LinearGradient
                colors={[targetTierInfo.color, '#FF6B6B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeButtonGradient}
              >
                <Text style={styles.upgradeButtonText}>
                  Upgrade Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterButton} onPress={onClose}>
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Current tier badge display
 */
export function TierBadge({ tier, size = 'medium' }) {
  const tierInfo = getTierDisplayInfo(tier);

  return (
    <View style={[
      styles.tierBadge,
      { backgroundColor: tierInfo.bgColor },
      size === 'large' && styles.tierBadgeLarge,
      size === 'small' && styles.tierBadgeSmall,
    ]}>
      <Text style={styles.tierBadgeIcon}>{tierInfo.icon}</Text>
      <Text style={[styles.tierBadgeText, { color: tierInfo.color }]}>
        {tierInfo.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Banner styles
  banner: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerGradient: {
    padding: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIcon: {
    fontSize: 28,
  },
  bannerTitle: {
    color: '#FFC107',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
  },

  // Lock badge styles
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  lockBadgeLarge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  lockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  lockBadgeTextLarge: {
    fontSize: 12,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: 24,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },

  // Win rate box
  winRateBox: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  winRateLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  winRateValue: {
    color: '#00FF88',
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 4,
  },
  winRateDesc: {
    color: '#00FF88',
    fontSize: 12,
  },

  // Benefits list
  benefitsList: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  benefitsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  benefitText: {
    color: '#fff',
    fontSize: 14,
  },

  // Locked features
  lockedSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  lockedTitle: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  lockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    gap: 10,
  },
  lockedIcon: {
    fontSize: 20,
  },
  lockedInfo: {
    flex: 1,
  },
  lockedName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  lockedImpact: {
    color: '#00FF88',
    fontSize: 11,
  },

  // CTA buttons
  ctaContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  laterButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  laterButtonText: {
    color: '#8E8E93',
    fontSize: 14,
  },

  // Tier badge
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  tierBadgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tierBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  tierBadgeIcon: {
    fontSize: 14,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default {
  TierUpgradeBanner,
  TierUpgradeModal,
  FeatureLockBadge,
  TierBadge,
};
