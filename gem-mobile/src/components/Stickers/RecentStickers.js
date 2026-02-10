/**
 * GEM Mobile - Recent Stickers Component
 * Displays recently used stickers/GIFs in a horizontal scroll
 */

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Clock, Sticker } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import stickerService from '../../services/stickerService';
import LottieSticker from './LottieSticker';

const RECENT_ITEM_SIZE = 60;

const RecentStickers = memo(({
  type = 'sticker', // 'sticker' | 'gif' | 'all'
  onSelect,
  limit = 20,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
      paddingBottom: SPACING.sm,
    },
    loadingContainer: {
      height: RECENT_ITEM_SIZE + SPACING.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.xs,
    },
    headerText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textTransform: 'uppercase',
    },
    scrollContent: {
      paddingHorizontal: SPACING.md,
      gap: SPACING.xs,
    },
    itemContainer: {
      width: RECENT_ITEM_SIZE,
      height: RECENT_ITEM_SIZE,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
    },
    itemImage: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  useEffect(() => {
    loadRecentItems();
  }, [type]);

  const loadRecentItems = async () => {
    setLoading(true);
    try {
      const items = await stickerService.getRecentItems(type, limit);
      setRecentItems(items || []);
    } catch (err) {
      console.error('[RecentStickers] loadRecentItems error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = useCallback((item) => {
    onSelect?.({
      type: item.type,
      stickerId: item.sticker_id,
      giphyId: item.giphy_id,
      url: item.giphy_url || item.sticker?.image_url || item.sticker?.lottie_url,
      format: item.sticker?.format,
    });
  }, [onSelect]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.gold} size="small" />
      </View>
    );
  }

  if (recentItems.length === 0) {
    return null; // Don't show section if no recent items
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={14} color={colors.textMuted} />
        <Text style={styles.headerText}>Gan day</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentItems.map((item, index) => {
          const isLottie = item.sticker?.format === 'lottie';
          const imageUrl = item.giphy_url || item.sticker?.image_url || item.sticker?.gif_url;
          const lottieUrl = item.sticker?.lottie_url;

          return (
            <TouchableOpacity
              key={`recent-${item.id || index}`}
              style={styles.itemContainer}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              {isLottie && lottieUrl ? (
                <LottieSticker
                  source={{ uri: lottieUrl }}
                  style={styles.itemImage}
                  autoPlay
                  loop
                />
              ) : imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.itemImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.placeholder}>
                  <Sticker size={24} color={colors.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

export default RecentStickers;
