/**
 * Gemral - Tier Guard Component
 * Controls access to features based on user tier
 *
 * ADMIN BYPASS: Admin users have unlimited access to ALL features
 * MANAGER BYPASS: Manager users have unlimited access to Scanner, Chatbot, Vision Board
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock, Crown } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';

const TierGuard = ({
  requiredTier,
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const { profile, tier } = useAuth();

  // ⚡ ADMIN BYPASS - CRITICAL
  // Admin has unlimited access to ALL features
  const isAdmin = profile?.role === 'admin' ||
                  profile?.role === 'ADMIN' ||
                  profile?.is_admin === true ||
                  profile?.scanner_tier === 'ADMIN' ||
                  profile?.chatbot_tier === 'ADMIN';

  // ⚡ MANAGER BYPASS - Manager has unlimited access to Scanner, Chatbot, Vision Board
  const isManager = profile?.role === 'manager' || profile?.role === 'MANAGER';

  if (isAdmin || isManager) {
    console.log(`✅ [TierGuard] ${isAdmin ? 'Admin' : 'Manager'} bypass - Full access granted`);
    return children;
  }

  // Tier hierarchy for comparison
  const tierLevels = {
    FREE: 0,
    TIER1: 1,
    PRO: 1,
    TIER_1: 1,
    TIER2: 2,
    PREMIUM: 2,
    TIER_2: 2,
    TIER3: 3,
    VIP: 3,
    TIER_3: 3,
    ADMIN: 99
  };

  // Normalize tier names
  const normalizeUserTier = (t) => {
    if (!t) return 'FREE';
    return t.toUpperCase().replace('_', '');
  };

  const userTierNormalized = normalizeUserTier(tier || profile?.scanner_tier || profile?.chatbot_tier);
  const requiredTierNormalized = normalizeUserTier(requiredTier);

  // Check access
  const hasAccess = () => {
    const userLevel = tierLevels[userTierNormalized] || 0;
    const requiredLevel = tierLevels[requiredTierNormalized] || 0;
    return userLevel >= requiredLevel;
  };

  if (hasAccess()) {
    return children;
  }

  // Show custom fallback if provided
  if (fallback) {
    return fallback;
  }

  // Show upgrade prompt for users without access
  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <View style={styles.upgradePrompt}>
      <View style={styles.lockIconContainer}>
        <Lock size={32} color={COLORS.gold} />
      </View>
      <Text style={styles.upgradeTitle}>Tính Năng Premium</Text>
      <Text style={styles.upgradeText}>
        Cần nâng cấp lên {requiredTier} để sử dụng tính năng này
      </Text>
      <TouchableOpacity style={styles.upgradeButton}>
        <Crown size={18} color="#FFF" />
        <Text style={styles.buttonText}>Nâng Cấp Ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  upgradePrompt: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  lockIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C0612',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TierGuard;
