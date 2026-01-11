/**
 * DeckSelector Component
 * CLOUD SYNC: Deck preference synced to Supabase
 * Updated: 2024-12-25
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Check,
  Lock,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

const DECK_STORAGE_KEY = 'selected_tarot_deck';

// Available deck styles
const DECK_OPTIONS = [
  {
    id: 'rider-waite',
    name: 'Rider-Waite',
    nameVi: 'Rider-Waite Cổ Điển',
    description: 'Bộ bài Tarot kinh điển nhất, được sử dụng rộng rãi từ năm 1909.',
    tier: 'FREE',
    preview: null, // Will use default card images
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    nameVi: 'Hiện Đại Tối Giản',
    description: 'Thiết kế tối giản với đường nét hiện đại, dễ đọc.',
    tier: 'TIER1',
    preview: null,
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    nameVi: 'Vũ Trụ',
    description: 'Bộ bài lấy cảm hứng từ không gian với màu sắc galaxy.',
    tier: 'TIER2',
    preview: null,
  },
  {
    id: 'gold-luxury',
    name: 'Gold Luxury',
    nameVi: 'Vàng Sang Trọng',
    description: 'Thiết kế cao cấp với viền vàng và chi tiết hoàng gia.',
    tier: 'TIER3',
    preview: null,
  },
];

const DeckSelector = ({
  userTier = 'FREE',
  onSelectDeck,
  selectedDeckId: controlledDeckId,
  showLocked = true,
  style,
}) => {
  const { user } = useAuth();
  const [selectedDeck, setSelectedDeck] = useState('rider-waite');

  // Load saved deck preference with CLOUD SYNC
  useEffect(() => {
    const loadSavedDeck = async () => {
      try {
        // Try cloud first if logged in
        if (user?.id) {
          const { data, error } = await supabase
            .from('user_tarot_preferences')
            .select('selected_deck')
            .eq('user_id', user.id)
            .single();

          if (data && !error && data.selected_deck) {
            setSelectedDeck(data.selected_deck);
            await AsyncStorage.setItem(DECK_STORAGE_KEY, data.selected_deck);
            return;
          }
        }

        // Fallback to local
        const saved = await AsyncStorage.getItem(DECK_STORAGE_KEY);
        if (saved) {
          setSelectedDeck(saved);
        }
      } catch (err) {
        console.error('[DeckSelector] Error loading saved deck:', err);
      }
    };

    loadSavedDeck();
  }, [user?.id]);

  // Use controlled value if provided
  useEffect(() => {
    if (controlledDeckId) {
      setSelectedDeck(controlledDeckId);
    }
  }, [controlledDeckId]);

  // Check if user can access a deck based on tier
  const canAccessDeck = (deckTier) => {
    const tierLevels = { FREE: 0, TIER1: 1, TIER2: 2, TIER3: 3, ADMIN: 4 };
    const userLevel = tierLevels[userTier] || 0;
    const requiredLevel = tierLevels[deckTier] || 0;
    return userLevel >= requiredLevel;
  };

  // Get tier display name
  const getTierDisplayName = (tier) => {
    const names = {
      FREE: 'Miễn phí',
      TIER1: 'Cơ bản',
      TIER2: 'Pro',
      TIER3: 'Premium',
    };
    return names[tier] || tier;
  };

  // Get tier color
  const getTierColor = (tier) => {
    const colors = {
      FREE: COLORS.success,
      TIER1: COLORS.cyan,
      TIER2: COLORS.purple,
      TIER3: COLORS.gold,
    };
    return colors[tier] || COLORS.textMuted;
  };

  const handleSelectDeck = async (deck) => {
    if (!canAccessDeck(deck.tier)) {
      // Show upgrade prompt or haptic feedback for locked
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDeck(deck.id);

    // Save preference locally and to cloud
    try {
      await AsyncStorage.setItem(DECK_STORAGE_KEY, deck.id);

      // Sync to cloud if logged in
      if (user?.id) {
        await supabase
          .from('user_tarot_preferences')
          .upsert({
            user_id: user.id,
            selected_deck: deck.id,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });
      }
    } catch (err) {
      console.error('[DeckSelector] Error saving deck:', err);
    }

    onSelectDeck?.(deck);
  };

  const renderDeckOption = (deck) => {
    const isSelected = selectedDeck === deck.id;
    const isLocked = !canAccessDeck(deck.tier);
    const tierColor = getTierColor(deck.tier);

    if (isLocked && !showLocked) {
      return null;
    }

    return (
      <TouchableOpacity
        key={deck.id}
        style={[
          styles.deckCard,
          isSelected && styles.deckCardSelected,
          isLocked && styles.deckCardLocked,
        ]}
        onPress={() => handleSelectDeck(deck)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.glassBg, COLORS.bgDarkest]}
          style={styles.deckBackground}
        />

        {/* Preview */}
        <View style={styles.previewContainer}>
          {deck.preview ? (
            <Image source={deck.preview} style={styles.previewImage} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Sparkles size={32} color={tierColor} />
            </View>
          )}

          {/* Lock overlay */}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Lock size={24} color={COLORS.textMuted} />
            </View>
          )}

          {/* Selected indicator */}
          {isSelected && !isLocked && (
            <View style={styles.selectedIndicator}>
              <Check size={16} color={COLORS.bgDarkest} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.deckInfo}>
          <Text style={styles.deckName} numberOfLines={1}>
            {deck.nameVi}
          </Text>
          <Text style={styles.deckDescription} numberOfLines={2}>
            {deck.description}
          </Text>

          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: `${tierColor}20`, borderColor: tierColor }]}>
            <Text style={[styles.tierText, { color: tierColor }]}>
              {getTierDisplayName(deck.tier)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Chọn bộ bài</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DECK_OPTIONS.map(renderDeckOption)}
      </ScrollView>
    </View>
  );
};

// Static method to get current deck
DeckSelector.getCurrentDeck = async () => {
  try {
    const saved = await AsyncStorage.getItem(DECK_STORAGE_KEY);
    return saved || 'rider-waite';
  } catch (err) {
    return 'rider-waite';
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginLeft: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  deckCard: {
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  deckCardSelected: {
    borderColor: COLORS.gold,
  },
  deckCardLocked: {
    opacity: 0.7,
  },
  deckBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  previewContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  previewImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckInfo: {
    padding: SPACING.sm,
  },
  deckName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  deckDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    lineHeight: 14,
    marginBottom: SPACING.xs,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default DeckSelector;
