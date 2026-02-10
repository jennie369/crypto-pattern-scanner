/**
 * GEM Mobile - Sticker Pack Selector
 * Bottom navigation bar for switching between sticker packs (Zalo-style)
 */

import React, { memo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Clock, Star, Plus } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

const PACK_ICON_SIZE = 36;

const StickerPackSelector = memo(({
  packs = [],
  selectedPackId,
  onSelect,
  showRecent = true,
  showFavorites = false,
  showAdd = false,
  onAddPress,
}) => {
  const handleRecentPress = () => {
    onSelect?.('recent');
  };

  const handleFavoritesPress = () => {
    onSelect?.('favorites');
  };

  const handlePackPress = (packId) => {
    onSelect?.(packId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recent Button */}
        {showRecent && (
          <TouchableOpacity
            style={[
              styles.packButton,
              selectedPackId === 'recent' && styles.packButtonActive,
              !selectedPackId && styles.packButtonActive, // Default to recent when no pack selected
            ]}
            onPress={handleRecentPress}
            activeOpacity={0.7}
          >
            <Clock
              size={22}
              color={(!selectedPackId || selectedPackId === 'recent') ? COLORS.gold : COLORS.textMuted}
            />
          </TouchableOpacity>
        )}

        {/* Favorites Button */}
        {showFavorites && (
          <TouchableOpacity
            style={[
              styles.packButton,
              selectedPackId === 'favorites' && styles.packButtonActive,
            ]}
            onPress={handleFavoritesPress}
            activeOpacity={0.7}
          >
            <Star
              size={22}
              color={selectedPackId === 'favorites' ? COLORS.gold : COLORS.textMuted}
              fill={selectedPackId === 'favorites' ? COLORS.gold : 'transparent'}
            />
          </TouchableOpacity>
        )}

        {/* Divider */}
        {(showRecent || showFavorites) && packs.length > 0 && (
          <View style={styles.divider} />
        )}

        {/* Pack Icons */}
        {packs.map((pack) => {
          const isSelected = selectedPackId === pack.id;

          return (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.packButton,
                isSelected && styles.packButtonActive,
              ]}
              onPress={() => handlePackPress(pack.id)}
              activeOpacity={0.7}
            >
              {pack.thumbnail_url ? (
                <Image
                  source={{ uri: pack.thumbnail_url }}
                  style={[
                    styles.packIcon,
                    isSelected && styles.packIconActive,
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.packPlaceholder, isSelected && styles.packIconActive]}>
                  <Star size={18} color={isSelected ? COLORS.gold : COLORS.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Add Button (for Admin) */}
        {showAdd && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddPress}
            activeOpacity={0.7}
          >
            <Plus size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingBottom: 34, // Safe area for bottom
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  packButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  packButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  packIcon: {
    width: PACK_ICON_SIZE,
    height: PACK_ICON_SIZE,
    borderRadius: 8,
  },
  packIconActive: {
    // Active state styling handled by parent
  },
  packPlaceholder: {
    width: PACK_ICON_SIZE,
    height: PACK_ICON_SIZE,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SPACING.xs,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
});

export default StickerPackSelector;
