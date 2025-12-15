/**
 * Gemral - Gem Balance Widget Component
 * Feature #14: Virtual Currency
 * Mini balance display for headers/cards
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Gem, Plus } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';
import walletService from '../services/walletService';

const GemBalanceWidget = ({
  onPress,
  showBuyButton = true,
  size = 'normal', // 'small' | 'normal' | 'large'
}) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    const result = await walletService.getBalance();
    if (result.success) {
      setBalance(result.data.gems);
    }
    setLoading(false);
  };

  const sizes = {
    small: {
      containerPadding: SPACING.xs,
      iconSize: 14,
      fontSize: TYPOGRAPHY.fontSize.sm,
      plusSize: 12,
    },
    normal: {
      containerPadding: SPACING.sm,
      iconSize: 16,
      fontSize: TYPOGRAPHY.fontSize.md,
      plusSize: 14,
    },
    large: {
      containerPadding: SPACING.md,
      iconSize: 20,
      fontSize: TYPOGRAPHY.fontSize.lg,
      plusSize: 16,
    },
  };

  const s = sizes[size];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { paddingHorizontal: s.containerPadding, paddingVertical: s.containerPadding / 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <Gem size={s.iconSize} color={COLORS.purple} />
        <Text style={[styles.balance, { fontSize: s.fontSize }]}>
          {loading ? '...' : walletService.formatGems(balance)}
        </Text>
      </View>

      {showBuyButton && (
        <View style={styles.plusContainer}>
          <Plus size={s.plusSize} color={COLORS.success} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 20,
    gap: SPACING.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  balance: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  plusContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GemBalanceWidget;
