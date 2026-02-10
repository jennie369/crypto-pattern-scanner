/**
 * GEM Mobile - Emoji Grid Component
 * Enhanced emoji picker with categories and search
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Clock,
  Smile,
  Heart,
  ThumbsUp,
  Zap,
  Coffee,
  Flag,
  Hash,
  Car,
  Lightbulb,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { EMOJI_DATA, EMOJI_CATEGORIES } from '../../data/emojis';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 8;

// Category icons mapping
const CATEGORY_ICONS = {
  recent: Clock,
  smileys: Smile,
  people: ThumbsUp,
  animals: Zap,
  food: Coffee,
  travel: Car,
  activities: Lightbulb,
  objects: Lightbulb,
  symbols: Hash,
  flags: Flag,
  hearts: Heart,
};

const EmojiGrid = memo(({
  recentEmojis = [],
  searchQuery,
  onSelect,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const GRID_PADDING = SPACING.md;
  const EMOJI_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2) / NUM_COLUMNS;

  const [selectedCategory, setSelectedCategory] = useState('smileys');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    categoriesScroll: {
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
    },
    categoriesContainer: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      gap: SPACING.xs,
    },
    categoryTab: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
    },
    categoryTabActive: {
      backgroundColor: 'rgba(255, 189, 89, 0.2)',
    },
    categoryTabDisabled: {
      opacity: 0.4,
    },
    categoryLabelContainer: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    categoryLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    gridContent: {
      paddingHorizontal: GRID_PADDING,
      paddingBottom: SPACING.xl,
      flexGrow: 1,
    },
    emojiItem: {
      width: EMOJI_SIZE,
      height: EMOJI_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emojiText: {
      fontSize: 28,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SPACING.xxl,
      gap: SPACING.md,
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
      textAlign: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY, GRID_PADDING, EMOJI_SIZE]);

  // Filter emojis based on search
  const filteredEmojis = useMemo(() => {
    if (searchQuery && searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      const results = [];

      // Search through all categories
      Object.entries(EMOJI_DATA).forEach(([category, emojis]) => {
        emojis.forEach(emoji => {
          if (
            emoji.name?.toLowerCase().includes(query) ||
            emoji.keywords?.some(k => k.toLowerCase().includes(query))
          ) {
            results.push(emoji);
          }
        });
      });

      return results.slice(0, 50); // Limit results
    }

    return null; // Return null to show normal categories
  }, [searchQuery]);

  // Get emojis for current category
  const categoryEmojis = useMemo(() => {
    if (filteredEmojis) return filteredEmojis;

    if (selectedCategory === 'recent') {
      return recentEmojis.map(e => ({ char: e, name: e }));
    }

    return EMOJI_DATA[selectedCategory] || [];
  }, [selectedCategory, filteredEmojis, recentEmojis]);

  const handleEmojiPress = useCallback((emoji) => {
    onSelect?.(typeof emoji === 'string' ? emoji : emoji.char);
  }, [onSelect]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const renderEmoji = ({ item }) => {
    const emojiChar = typeof item === 'string' ? item : item.char;

    return (
      <TouchableOpacity
        style={styles.emojiItem}
        onPress={() => handleEmojiPress(emojiChar)}
        activeOpacity={0.6}
      >
        <Text style={styles.emojiText}>{emojiChar}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryTab = (category) => {
    const IconComponent = CATEGORY_ICONS[category.id] || Smile;
    const isActive = selectedCategory === category.id;
    const isDisabled = category.id === 'recent' && recentEmojis.length === 0;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryTab,
          isActive && styles.categoryTabActive,
          isDisabled && styles.categoryTabDisabled,
        ]}
        onPress={() => !isDisabled && handleCategoryChange(category.id)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <IconComponent
          size={20}
          color={isActive ? colors.gold : isDisabled ? colors.textMuted : colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Smile size={48} color={colors.textMuted} />
      <Text style={styles.emptyText}>
        {searchQuery ? 'Khong tim thay emoji' : 'Chua co emoji'}
      </Text>
    </View>
  );

  // Show search results
  if (filteredEmojis) {
    return (
      <View style={styles.container}>
        <FlatList
          data={filteredEmojis}
          renderItem={renderEmoji}
          keyExtractor={(item, index) => `search-${index}-${item.char || item}`}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {EMOJI_CATEGORIES.map(renderCategoryTab)}
      </ScrollView>

      {/* Category Label */}
      <View style={styles.categoryLabelContainer}>
        <Text style={styles.categoryLabel}>
          {EMOJI_CATEGORIES.find(c => c.id === selectedCategory)?.name || ''}
        </Text>
      </View>

      {/* Emoji Grid */}
      <FlatList
        data={categoryEmojis}
        renderItem={renderEmoji}
        keyExtractor={(item, index) => `${selectedCategory}-${index}-${item.char || item}`}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        initialNumToRender={40}
        maxToRenderPerBatch={40}
        removeClippedSubviews={true}
      />
    </View>
  );
});

export default EmojiGrid;
