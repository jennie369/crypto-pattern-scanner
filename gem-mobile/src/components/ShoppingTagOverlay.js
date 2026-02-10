/**
 * Gemral - Shopping Tag Overlay Component
 * Feature #1: Shopping Tags
 * Shows product tags on post images
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Linking,
} from 'react-native';
import { ShoppingBag, ExternalLink, X } from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';
import shoppingTagService from '../services/shoppingTagService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ShoppingTagOverlay = ({
  postId,
  imageIndex = 0,
  imageWidth = SCREEN_WIDTH,
  imageHeight = SCREEN_WIDTH,
  onTagPress,
  showIndicator = true,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    tagDot: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    tagDotActive: {
      backgroundColor: colors.purple,
      transform: [{ scale: 1.2 }],
    },
    tagDotEditable: {
      backgroundColor: colors.purple,
      borderWidth: 2,
      borderColor: colors.textPrimary,
    },
    indicator: {
      position: 'absolute',
      bottom: SPACING.sm,
      left: SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    indicatorText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    tagCard: {
      position: 'absolute',
      bottom: SPACING.lg,
      left: SPACING.md,
      right: SPACING.md,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      padding: SPACING.sm,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    closeCardButton: {
      position: 'absolute',
      top: SPACING.xs,
      right: SPACING.xs,
      padding: SPACING.xs,
      zIndex: 1,
    },
    tagCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    productImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
      backgroundColor: colors.glassBg,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: colors.textPrimary,
      lineHeight: 18,
    },
    productPrice: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.success,
      marginTop: 2,
    },
    sourceBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(106, 91, 255, 0.2)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: 8,
      marginTop: SPACING.xs,
    },
    sourceText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.purple,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    editInstructions: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -60 }, { translateY: -20 }],
      alignItems: 'center',
      gap: SPACING.sm,
    },
    editText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
    },
    tagCountBadge: {
      position: 'absolute',
      bottom: SPACING.sm,
      right: SPACING.sm,
      backgroundColor: colors.purple,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: 12,
    },
    tagCountText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  useEffect(() => {
    if (postId) {
      loadTags();
    }
  }, [postId, imageIndex]);

  const loadTags = async () => {
    setLoading(true);
    const allTags = await shoppingTagService.getPostTags(postId);
    // Filter tags for current image
    const imageTags = allTags.filter(t => t.image_index === imageIndex);
    setTags(imageTags);
    setLoading(false);
  };

  const handleTagPress = (tag) => {
    if (selectedTag?.id === tag.id) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      onTagPress?.(tag);
    }
  };

  const handleProductPress = () => {
    if (selectedTag?.product_url) {
      Linking.openURL(selectedTag.product_url);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading || tags.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { width: imageWidth, height: imageHeight }]}>
      {/* Tag Dots */}
      {tags.map((tag) => (
        <TouchableOpacity
          key={tag.id}
          style={[
            styles.tagDot,
            {
              left: tag.x_position * imageWidth - 12,
              top: tag.y_position * imageHeight - 12,
            },
            selectedTag?.id === tag.id && styles.tagDotActive,
          ]}
          onPress={() => handleTagPress(tag)}
          activeOpacity={0.8}
        >
          <ShoppingBag
            size={14}
            color={selectedTag?.id === tag.id ? colors.textPrimary : colors.purple}
          />
        </TouchableOpacity>
      ))}

      {/* Shopping Indicator */}
      {showIndicator && (
        <View style={styles.indicator}>
          <ShoppingBag size={12} color={colors.textPrimary} />
          <Text style={styles.indicatorText}>{tags.length}</Text>
        </View>
      )}

      {/* Selected Tag Info Card */}
      {selectedTag && (
        <Animated.View style={styles.tagCard}>
          <TouchableOpacity
            style={styles.closeCardButton}
            onPress={() => setSelectedTag(null)}
          >
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tagCardContent}
            onPress={handleProductPress}
            activeOpacity={0.8}
          >
            {selectedTag.product_image && (
              <Image
                source={{ uri: selectedTag.product_image }}
                style={styles.productImage}
              />
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {selectedTag.product_name}
              </Text>
              {selectedTag.product_price && (
                <Text style={styles.productPrice}>
                  {formatPrice(selectedTag.product_price)}
                </Text>
              )}
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceText}>
                  {selectedTag.source === 'shopee' ? 'Shopee' :
                   selectedTag.source === 'shopify' ? 'Shop' : 'San pham'}
                </Text>
              </View>
            </View>
            <ExternalLink size={16} color={colors.cyan} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

/**
 * Tag Editor Overlay - For adding/editing tags
 */
export const ShoppingTagEditor = ({
  imageWidth = SCREEN_WIDTH,
  imageHeight = SCREEN_WIDTH,
  tags = [],
  onAddTag,
  onRemoveTag,
  onUpdatePosition,
  editable = true,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [draggingTag, setDraggingTag] = useState(null);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    tagDot: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    tagDotEditable: {
      backgroundColor: colors.purple,
      borderWidth: 2,
      borderColor: colors.textPrimary,
    },
    editInstructions: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -60 }, { translateY: -20 }],
      alignItems: 'center',
      gap: SPACING.sm,
    },
    editText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
    },
    tagCountBadge: {
      position: 'absolute',
      bottom: SPACING.sm,
      right: SPACING.sm,
      backgroundColor: colors.purple,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: 12,
    },
    tagCountText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const handleImagePress = (event) => {
    if (!editable) return;

    const { locationX, locationY } = event.nativeEvent;
    const xPosition = locationX / imageWidth;
    const yPosition = locationY / imageHeight;

    onAddTag?.({ xPosition, yPosition });
  };

  const handleTagLongPress = (tag) => {
    if (!editable) return;
    onRemoveTag?.(tag.id);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: imageWidth, height: imageHeight }]}
      onPress={handleImagePress}
      activeOpacity={1}
    >
      {/* Edit Mode Instructions */}
      {editable && tags.length === 0 && (
        <View style={styles.editInstructions}>
          <ShoppingBag size={24} color={colors.textMuted} />
          <Text style={styles.editText}>Cham de them san pham</Text>
        </View>
      )}

      {/* Tag Dots (Editable) */}
      {tags.map((tag) => (
        <TouchableOpacity
          key={tag.id}
          style={[
            styles.tagDot,
            styles.tagDotEditable,
            {
              left: tag.x_position * imageWidth - 12,
              top: tag.y_position * imageHeight - 12,
            },
          ]}
          onLongPress={() => handleTagLongPress(tag)}
          activeOpacity={0.7}
        >
          <ShoppingBag size={14} color={colors.textPrimary} />
        </TouchableOpacity>
      ))}

      {/* Tag Count */}
      {tags.length > 0 && (
        <View style={styles.tagCountBadge}>
          <Text style={styles.tagCountText}>{tags.length} san pham</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ShoppingTagOverlay;
