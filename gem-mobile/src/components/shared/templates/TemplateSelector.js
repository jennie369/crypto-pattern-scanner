/**
 * TemplateSelector.js
 * Grid of available templates with tier badges + lock icons
 *
 * Created: 2026-02-02
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Lock,
  Target,
  AlertTriangle,
  BookOpen,
  Heart,
  Calendar,
  Sparkles,
  TrendingUp,
  Star,
  Award,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
  COSMIC_SHADOWS,
} from '../../../theme/cosmicTokens';
import { getAllTemplates, canAccessTemplate } from '../../../services/templates/journalTemplates';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon mapping for templates
const TEMPLATE_ICONS = {
  goal_basic: Target,
  fear_setting: AlertTriangle,
  think_day: BookOpen,
  gratitude: Heart,
  daily_wins: Award,
  weekly_planning: Calendar,
  vision_3_5_years: Star,
  free_form: Sparkles,
  trading_journal: TrendingUp,
};

// Color mapping for templates
const TEMPLATE_COLORS = {
  goal_basic: COSMIC_COLORS.glow.gold,
  fear_setting: COSMIC_COLORS.glow.orange,
  think_day: COSMIC_COLORS.glow.purple,
  gratitude: COSMIC_COLORS.glow.pink,
  daily_wins: COSMIC_COLORS.glow.green,
  weekly_planning: COSMIC_COLORS.glow.cyan,
  vision_3_5_years: COSMIC_COLORS.glow.blue,
  free_form: COSMIC_COLORS.glow.white,
  trading_journal: COSMIC_COLORS.glow.gold,
};

// Tier badge colors
const TIER_COLORS = {
  FREE: COSMIC_COLORS.glow.green,
  TIER1: COSMIC_COLORS.glow.cyan,
  TIER2: COSMIC_COLORS.glow.purple,
  TIER3: COSMIC_COLORS.glow.gold,
};

/**
 * TemplateSelector Component
 * @param {function} onSelect - Callback when template is selected
 * @param {string} userTier - User's current tier
 * @param {string} userRole - User's role (admin/manager)
 * @param {string} selectedId - Currently selected template ID
 * @param {Array} excludeTemplates - Template IDs to exclude
 * @param {function} onUpgradePress - Callback when locked template is pressed
 * @param {string} layout - 'grid' or 'list' (default: 'grid')
 * @param {boolean} showDescription - Show template descriptions
 * @param {string} category - Filter by category
 */
const TemplateSelector = ({
  onSelect,
  userTier = 'free',
  userRole = null,
  selectedId,
  excludeTemplates = [],
  onUpgradePress,
  layout = 'grid',
  showDescription = true,
  category = null,
}) => {
  // Get templates with access info
  const templates = useMemo(() => {
    let allTemplates = getAllTemplates();

    // Filter by category
    if (category) {
      allTemplates = allTemplates.filter((t) => t.category === category);
    }

    // Filter excluded
    if (excludeTemplates.length > 0) {
      allTemplates = allTemplates.filter((t) => !excludeTemplates.includes(t.id));
    }

    // Add access info
    return allTemplates.map((template) => {
      const access = canAccessTemplate(template.id, userTier, userRole);
      return {
        ...template,
        isAccessible: access.allowed,
        upgradeRequired: access.upgradeRequired,
        icon: TEMPLATE_ICONS[template.id] || Sparkles,
        color: TEMPLATE_COLORS[template.id] || COSMIC_COLORS.glow.purple,
      };
    });
  }, [userTier, userRole, excludeTemplates, category]);

  // Handle template press
  const handlePress = (template) => {
    if (!template.isAccessible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onUpgradePress?.(template);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect?.(template);
  };

  // Render tier badge
  const renderTierBadge = (template) => {
    if (template.isAccessible) return null;

    const tierName = template.requiredTier || 'TIER1';
    const tierColor = TIER_COLORS[tierName] || COSMIC_COLORS.glow.cyan;

    return (
      <View style={[styles.tierBadge, { backgroundColor: tierColor + '30' }]}>
        <Lock size={10} color={tierColor} />
        <Text style={[styles.tierBadgeText, { color: tierColor }]}>
          {tierName.replace('TIER', 'T')}
        </Text>
      </View>
    );
  };

  // Render grid item
  const renderGridItem = (template) => {
    const isSelected = template.id === selectedId;
    const isLocked = !template.isAccessible;
    const IconComponent = template.icon;

    return (
      <TouchableOpacity
        key={template.id}
        style={[
          styles.gridItem,
          isSelected && [
            styles.gridItemSelected,
            { borderColor: template.color },
          ],
          isLocked && styles.gridItemLocked,
        ]}
        onPress={() => handlePress(template)}
        activeOpacity={0.7}
      >
        {/* Tier Badge */}
        {renderTierBadge(template)}

        {/* Icon */}
        <View
          style={[
            styles.gridIconContainer,
            { backgroundColor: template.color + '20' },
            isLocked && styles.iconContainerLocked,
          ]}
        >
          <IconComponent
            size={24}
            color={isLocked ? COSMIC_COLORS.text.muted : template.color}
          />
        </View>

        {/* Name */}
        <Text
          style={[
            styles.gridName,
            isSelected && { color: template.color },
            isLocked && styles.textLocked,
          ]}
          numberOfLines={2}
        >
          {template.name}
        </Text>

        {/* Description */}
        {showDescription && (
          <Text style={styles.gridDescription} numberOfLines={2}>
            {template.description}
          </Text>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <View style={[styles.selectedDot, { backgroundColor: template.color }]} />
        )}
      </TouchableOpacity>
    );
  };

  // Render list item
  const renderListItem = (template) => {
    const isSelected = template.id === selectedId;
    const isLocked = !template.isAccessible;
    const IconComponent = template.icon;

    return (
      <TouchableOpacity
        key={template.id}
        style={[
          styles.listItem,
          isSelected && [
            styles.listItemSelected,
            { borderColor: template.color },
          ],
          isLocked && styles.listItemLocked,
        ]}
        onPress={() => handlePress(template)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          style={[
            styles.listIconContainer,
            { backgroundColor: template.color + '20' },
            isLocked && styles.iconContainerLocked,
          ]}
        >
          <IconComponent
            size={22}
            color={isLocked ? COSMIC_COLORS.text.muted : template.color}
          />
        </View>

        {/* Content */}
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text
              style={[
                styles.listName,
                isSelected && { color: template.color },
                isLocked && styles.textLocked,
              ]}
            >
              {template.name}
            </Text>
            {renderTierBadge(template)}
          </View>

          {showDescription && (
            <Text style={styles.listDescription} numberOfLines={1}>
              {template.description}
            </Text>
          )}
        </View>

        {/* Lock icon or selected check */}
        {isLocked ? (
          <Lock size={18} color={COSMIC_COLORS.text.muted} />
        ) : isSelected ? (
          <Zap size={18} color={template.color} />
        ) : null}
      </TouchableOpacity>
    );
  };

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups = {};
    templates.forEach((template) => {
      const cat = template.category || 'other';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(template);
    });
    return groups;
  }, [templates]);

  const categoryNames = {
    mindset: 'Tư duy & Mục tiêu',
    reflection: 'Suy ngẫm',
    planning: 'Kế hoạch',
    trading: 'Giao dịch',
    goal_focused: 'Mục tiêu & Kế hoạch',
    journal_focused: 'Nhật ký & Ghi chép',
    hybrid: 'Tổng hợp & Chiêm nghiệm',
    other: 'Khác',
  };

  if (layout === 'list') {
    return (
      <View style={styles.container}>
        {Object.entries(groupedTemplates).map(([cat, items]) => (
          <View key={cat} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{categoryNames[cat] || cat}</Text>
            <View style={styles.list}>
              {items.map(renderListItem)}
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Object.entries(groupedTemplates).map(([cat, items]) => (
        <View key={cat} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{categoryNames[cat] || cat}</Text>
          <View style={styles.grid}>
            {items.map(renderGridItem)}
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Compact Template Selector (horizontal scroll)
 */
export const CompactTemplateSelector = ({
  onSelect,
  userTier = 'free',
  userRole = null,
  selectedId,
  excludeTemplates = [],
  onUpgradePress,
}) => {
  const templates = useMemo(() => {
    let allTemplates = getAllTemplates();

    if (excludeTemplates.length > 0) {
      allTemplates = allTemplates.filter((t) => !excludeTemplates.includes(t.id));
    }

    return allTemplates.map((template) => {
      const access = canAccessTemplate(template.id, userTier, userRole);
      return {
        ...template,
        isAccessible: access.allowed,
        icon: TEMPLATE_ICONS[template.id] || Sparkles,
        color: TEMPLATE_COLORS[template.id] || COSMIC_COLORS.glow.purple,
      };
    });
  }, [userTier, userRole, excludeTemplates]);

  const handlePress = (template) => {
    if (!template.isAccessible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onUpgradePress?.(template);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect?.(template);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.compactContainer}
    >
      {templates.map((template) => {
        const isSelected = template.id === selectedId;
        const isLocked = !template.isAccessible;
        const IconComponent = template.icon;

        return (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.compactItem,
              isSelected && [
                styles.compactItemSelected,
                { borderColor: template.color },
              ],
              isLocked && styles.compactItemLocked,
            ]}
            onPress={() => handlePress(template)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.compactIcon,
                { backgroundColor: template.color + '20' },
              ]}
            >
              {isLocked ? (
                <Lock size={16} color={COSMIC_COLORS.text.muted} />
              ) : (
                <IconComponent size={16} color={template.color} />
              )}
            </View>
            <Text
              style={[
                styles.compactName,
                isSelected && { color: template.color },
                isLocked && styles.textLocked,
              ]}
              numberOfLines={1}
            >
              {template.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: COSMIC_SPACING.lg,
  },
  categorySection: {
    gap: COSMIC_SPACING.sm,
  },
  categoryTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Grid layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COSMIC_SPACING.sm,
  },
  gridItem: {
    width: (SCREEN_WIDTH - COSMIC_SPACING.lg * 2 - COSMIC_SPACING.sm * 2) / 3,
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COSMIC_COLORS.glass.border,
    padding: COSMIC_SPACING.md,
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
    position: 'relative',
  },
  gridItemSelected: {
    borderWidth: 2,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
  },
  gridItemLocked: {
    opacity: 0.7,
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: COSMIC_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerLocked: {
    backgroundColor: COSMIC_COLORS.glass.bgDark,
  },
  gridName: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
    textAlign: 'center',
  },
  gridDescription: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.text.muted,
    textAlign: 'center',
    lineHeight: COSMIC_TYPOGRAPHY.fontSize.xs * 1.4,
  },
  selectedDot: {
    position: 'absolute',
    bottom: COSMIC_SPACING.sm,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // List layout
  list: {
    gap: COSMIC_SPACING.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    padding: COSMIC_SPACING.md,
    gap: COSMIC_SPACING.md,
  },
  listItemSelected: {
    borderWidth: 1.5,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
  },
  listItemLocked: {
    opacity: 0.7,
  },
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: COSMIC_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flex: 1,
    gap: COSMIC_SPACING.xxs,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  listName: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
  },
  listDescription: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.muted,
  },

  // Tier badge
  tierBadge: {
    position: 'absolute',
    top: COSMIC_SPACING.xs,
    right: COSMIC_SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: COSMIC_SPACING.xs,
    paddingVertical: 2,
    borderRadius: COSMIC_RADIUS.xs,
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.bold,
  },

  // Locked state
  textLocked: {
    color: COSMIC_COLORS.text.muted,
  },

  // Compact layout
  compactContainer: {
    paddingHorizontal: COSMIC_SPACING.md,
    gap: COSMIC_SPACING.sm,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.round,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.sm,
    gap: COSMIC_SPACING.sm,
    marginRight: COSMIC_SPACING.sm,
  },
  compactItemSelected: {
    borderWidth: 1.5,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
  },
  compactItemLocked: {
    opacity: 0.6,
  },
  compactIcon: {
    width: 28,
    height: 28,
    borderRadius: COSMIC_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactName: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.text.primary,
    maxWidth: 100,
  },
});

export default TemplateSelector;
