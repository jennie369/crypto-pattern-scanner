/**
 * ModeBanner - Banner showing current trading mode description
 * Used in PaperTradeModal for dual mode trading
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gem, Zap } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * @param {Object} props
 * @param {'pattern' | 'custom'} props.mode - Current mode
 */
const ModeBanner = ({ mode = 'pattern' }) => {
  if (mode === 'pattern') {
    return (
      <View style={[styles.banner, styles.bannerPattern]}>
        <Gem size={16} color={COLORS.gold} />
        <Text style={styles.bannerText}>
          Trade theo GEM Frequency Pattern - Entry/SL/TP đã được tối ưu
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.bannerCustom]}>
      <Zap size={16} color={COLORS.warning} />
      <Text style={styles.bannerText}>
        Chế độ Tùy Chỉnh - AI Sư Phụ sẽ đánh giá trade của bạn
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: 6,
    gap: 6,
  },
  bannerPattern: {
    backgroundColor: COLORS.gold + '15',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  bannerCustom: {
    backgroundColor: COLORS.warning + '15',
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  bannerText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
});

export default ModeBanner;
