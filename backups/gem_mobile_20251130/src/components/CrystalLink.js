/**
 * CRYSTAL LINK COMPONENT
 * Component hiển thị crystal recommendation với link tới Shop
 *
 * Features:
 * - Hiển thị crystal info (name, reason)
 * - Deep link tới Shop product page
 * - Add to wishlist button
 * - Expandable description
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Gem,
  ChevronRight,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../utils/tokens';

// Crystal icon mapping based on type
const CRYSTAL_COLORS = {
  // Clear/White
  'clear-quartz': { primary: '#FFFFFF', secondary: '#E8E8E8' },
  'selenite': { primary: '#F5F5F5', secondary: '#E0E0E0' },
  'moonstone': { primary: '#F0F0F0', secondary: '#D0D0D0' },

  // Purple/Violet
  'amethyst': { primary: '#9B59B6', secondary: '#8E44AD' },
  'lepidolite': { primary: '#B39DDB', secondary: '#9575CD' },
  'fluorite': { primary: '#7E57C2', secondary: '#5E35B1' },

  // Pink
  'rose-quartz': { primary: '#FFB6C1', secondary: '#FF69B4' },
  'rhodonite': { primary: '#E91E63', secondary: '#C2185B' },

  // Blue
  'lapis-lazuli': { primary: '#1E40AF', secondary: '#1E3A8A' },
  'sodalite': { primary: '#3B82F6', secondary: '#2563EB' },
  'blue-lace-agate': { primary: '#93C5FD', secondary: '#60A5FA' },
  'aquamarine': { primary: '#22D3EE', secondary: '#06B6D4' },

  // Green
  'green-aventurine': { primary: '#22C55E', secondary: '#16A34A' },
  'jade': { primary: '#10B981', secondary: '#059669' },
  'malachite': { primary: '#065F46', secondary: '#064E3B' },

  // Yellow/Gold
  'citrine': { primary: '#FFBD59', secondary: '#F59E0B' },
  'pyrite': { primary: '#D4AF37', secondary: '#B8860B' },
  'sunstone': { primary: '#FF8C00', secondary: '#FF6600' },

  // Orange/Red
  'carnelian': { primary: '#EA580C', secondary: '#C2410C' },
  'garnet': { primary: '#991B1B', secondary: '#7F1D1D' },
  'red-jasper': { primary: '#B91C1C', secondary: '#991B1B' },

  // Black/Dark
  'black-tourmaline': { primary: '#1F2937', secondary: '#111827' },
  'smoky-quartz': { primary: '#57534E', secondary: '#44403C' },
  'obsidian': { primary: '#18181B', secondary: '#09090B' },
  'onyx': { primary: '#27272A', secondary: '#18181B' },

  // Brown
  'tiger-eye': { primary: '#92400E', secondary: '#78350F' },

  // Multi-color
  'labradorite': { primary: '#6366F1', secondary: '#4F46E5' },
  'opal': { primary: '#FEF3C7', secondary: '#F9A8D4' },

  // Default
  default: { primary: COLORS.purple, secondary: COLORS.purpleGlow },
};

const getCrystalColors = (shopHandle) => {
  return CRYSTAL_COLORS[shopHandle] || CRYSTAL_COLORS.default;
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const CrystalLink = ({
  crystal,
  onPress,
  onAddToWishlist,
  onAddToCart,
  showAddButtons = true,
  compact = false,
  style,
}) => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);

  const {
    name,
    vietnameseName,
    reason,
    shopHandle,
    imageUrl,
    price,
    element,
    chakra,
    properties = [],
  } = crystal || {};

  const colors = getCrystalColors(shopHandle);

  const handlePress = () => {
    if (onPress) {
      onPress(crystal);
    } else {
      // Navigate to Shop product
      navigation.navigate('ShopStack', {
        screen: 'ProductDetail',
        params: { handle: shopHandle },
      });
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    onAddToWishlist?.(crystal);
  };

  const handleAddToCart = () => {
    onAddToCart?.(crystal);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={[styles.compactIcon, { backgroundColor: colors.primary + '20' }]}>
          <Gem size={16} color={colors.primary} />
        </View>
        <View style={styles.compactText}>
          <Text style={styles.compactName} numberOfLines={1}>
            {vietnameseName || name}
          </Text>
          {reason && (
            <Text style={styles.compactReason} numberOfLines={1}>
              {reason}
            </Text>
          )}
        </View>
        <ChevronRight size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['rgba(15, 16, 48, 0.8)', 'rgba(15, 16, 48, 0.6)']}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Crystal Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.iconGradient}
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.crystalImage} />
              ) : (
                <Gem size={24} color={COLORS.textPrimary} />
              )}
            </LinearGradient>
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name}>{vietnameseName || name}</Text>
            {name !== vietnameseName && (
              <Text style={styles.englishName}>{name}</Text>
            )}
            {element && (
              <View style={styles.elementBadge}>
                <Text style={styles.elementText}>{element}</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          {showAddButtons && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, liked && styles.actionButtonActive]}
                onPress={handleLike}
              >
                <Heart
                  size={18}
                  color={liked ? COLORS.error : COLORS.textMuted}
                  fill={liked ? COLORS.error : 'none'}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Reason */}
        {reason && (
          <View style={styles.reasonContainer}>
            <Sparkles size={14} color={COLORS.gold} />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        )}

        {/* Expandable Properties */}
        {properties.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.expandHeader}
              onPress={() => setExpanded(!expanded)}
            >
              <Text style={styles.expandLabel}>Công dụng & Đặc tính</Text>
              {expanded ? (
                <ChevronUp size={16} color={COLORS.textMuted} />
              ) : (
                <ChevronDown size={16} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>

            {expanded && (
              <View style={styles.propertiesContainer}>
                {properties.map((prop, index) => (
                  <View key={index} style={styles.propertyItem}>
                    <View style={styles.propertyDot} />
                    <Text style={styles.propertyText}>{prop}</Text>
                  </View>
                ))}
                {chakra && (
                  <View style={styles.chakraRow}>
                    <Text style={styles.chakraLabel}>Chakra:</Text>
                    <Text style={styles.chakraValue}>{chakra}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* Footer with Shop Link */}
        <View style={styles.footer}>
          {price && (
            <Text style={styles.price}>
              {typeof price === 'number' ? `${price.toLocaleString('vi-VN')}đ` : price}
            </Text>
          )}

          <View style={styles.footerActions}>
            {showAddButtons && onAddToCart && (
              <TouchableOpacity
                style={styles.cartButton}
                onPress={handleAddToCart}
              >
                <ShoppingCart size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.shopLink}
              onPress={handlePress}
            >
              <Text style={styles.shopLinkText}>Xem trong Shop</Text>
              <ExternalLink size={14} color={COLORS.gold} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// CRYSTAL LIST COMPONENT
// ═══════════════════════════════════════════════════════════

export const CrystalList = ({
  crystals = [],
  title,
  onCrystalPress,
  onAddToWishlist,
  onAddToCart,
  compact = false,
  maxItems,
  style,
}) => {
  const displayCrystals = maxItems ? crystals.slice(0, maxItems) : crystals;

  if (crystals.length === 0) return null;

  return (
    <View style={[styles.listContainer, style]}>
      {title && (
        <View style={styles.listHeader}>
          <Gem size={18} color={COLORS.purple} />
          <Text style={styles.listTitle}>{title}</Text>
        </View>
      )}

      {displayCrystals.map((crystal, index) => (
        <CrystalLink
          key={crystal.shopHandle || index}
          crystal={crystal}
          onPress={onCrystalPress}
          onAddToWishlist={onAddToWishlist}
          onAddToCart={onAddToCart}
          compact={compact}
          style={index < displayCrystals.length - 1 && styles.listItem}
        />
      ))}

      {maxItems && crystals.length > maxItems && (
        <TouchableOpacity style={styles.showMoreButton}>
          <Text style={styles.showMoreText}>
            +{crystals.length - maxItems} crystals khác
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// CRYSTAL CHIP (for inline display)
// ═══════════════════════════════════════════════════════════

export const CrystalChip = ({
  crystal,
  onPress,
  size = 'medium',
  showIcon = true,
}) => {
  const navigation = useNavigation();
  const colors = getCrystalColors(crystal?.shopHandle);

  const handlePress = () => {
    if (onPress) {
      onPress(crystal);
    } else if (crystal?.shopHandle) {
      navigation.navigate('ShopStack', {
        screen: 'ProductDetail',
        params: { handle: crystal.shopHandle },
      });
    }
  };

  const sizeStyles = {
    small: { paddingVertical: 4, paddingHorizontal: 8, fontSize: 11 },
    medium: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12 },
    large: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderColor: colors.primary + '50',
          backgroundColor: colors.primary + '15',
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {showIcon && (
        <Gem
          size={currentSize.fontSize}
          color={colors.primary}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.chipText,
          { fontSize: currentSize.fontSize, color: colors.primary },
        ]}
      >
        {crystal?.vietnameseName || crystal?.name}
      </Text>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },

  card: {
    borderRadius: GLASS.borderRadius - 4,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    marginRight: SPACING.md,
  },

  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  crystalImage: {
    width: 48,
    height: 48,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  englishName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  elementBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
  },

  elementText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  actions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },

  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.sm,
  },

  reasonText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  expandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
  },

  expandLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  propertiesContainer: {
    marginTop: SPACING.sm,
    paddingLeft: SPACING.sm,
  },

  propertyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },

  propertyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.cyan,
    marginTop: 6,
    marginRight: SPACING.sm,
  },

  propertyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  chakraRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },

  chakraLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.xs,
  },

  chakraValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  shopLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  shopLinkText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 10,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },

  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },

  compactText: {
    flex: 1,
  },

  compactName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  compactReason: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // List styles
  listContainer: {
    marginVertical: SPACING.sm,
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },

  listTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  listItem: {
    marginBottom: SPACING.sm,
  },

  showMoreButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },

  showMoreText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Chip styles
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
  },

  chipText: {
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default CrystalLink;
