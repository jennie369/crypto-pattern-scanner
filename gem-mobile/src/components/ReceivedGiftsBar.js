/**
 * Gemral - Received Gifts Bar Component
 * Feature #15: Gift Catalog
 * Shows gifts received on a post
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Gift, Gem } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';
import giftService from '../services/giftService';
import walletService from '../services/walletService';

const ReceivedGiftsBar = ({
  postId,
  onPress,
  style,
}) => {
  const [summary, setSummary] = useState({ count: 0, totalGems: 0, giftImages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      loadSummary();
    }
  }, [postId]);

  const loadSummary = async () => {
    const data = await giftService.getPostGiftSummary(postId);
    setSummary(data);
    setLoading(false);
  };

  if (loading || summary.count === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Gift Images Stack */}
      <View style={styles.imagesStack}>
        {summary.giftImages.length > 0 ? (
          summary.giftImages.map((imageUrl, index) => (
            <Image
              key={index}
              source={{ uri: imageUrl }}
              style={[
                styles.giftImage,
                { marginLeft: index > 0 ? -8 : 0, zIndex: summary.giftImages.length - index },
              ]}
            />
          ))
        ) : (
          <View style={styles.giftIconContainer}>
            <Gift size={14} color={COLORS.purple} />
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.countText}>{summary.count} qua</Text>
        <View style={styles.gemsContainer}>
          <Gem size={10} color={COLORS.purple} />
          <Text style={styles.gemsText}>{walletService.formatGems(summary.totalGems)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    gap: SPACING.xs,
  },
  imagesStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBg,
  },
  giftIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  gemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gemsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default ReceivedGiftsBar;
