/**
 * GEM Scanner - Order Type Selector Component
 * 4 tabs: Limit, Market, Stop Limit, Stop Market
 * Binance Futures style with English names
 */

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { HelpCircle, X, Lock } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import { ORDER_TYPE_LIST } from '../../constants/tradingConstants';

const OrderTypeSelector = ({
  selectedType = 'limit',
  onSelectType,
  disabled = false,
  locked = false,  // For GEM Pattern mode - locks to Limit
  showDescriptions = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSelect = useCallback((typeId) => {
    if (!disabled && !locked && onSelectType) {
      onSelectType(typeId);
    }
  }, [disabled, locked, onSelectType]);

  const isDisabled = disabled || locked;

  return (
    <View style={styles.container}>
      {/* Label Row */}
      <View style={styles.labelRow}>
        <View style={styles.labelLeft}>
          <Text style={styles.label}>Loại lệnh</Text>
          {locked && (
            <View style={styles.lockedBadge}>
              <Lock size={10} color={COLORS.gold} />
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setShowTooltip(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <HelpCircle size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ORDER_TYPE_LIST.map((orderType) => {
          const isSelected = selectedType === orderType.id;
          const IconComponent = orderType.icon;

          return (
            <TouchableOpacity
              key={orderType.id}
              style={[
                styles.tab,
                isSelected && styles.tabSelected,
                isSelected && { borderColor: orderType.color },
                isDisabled && styles.tabDisabled,
              ]}
              onPress={() => handleSelect(orderType.id)}
              activeOpacity={0.7}
              disabled={isDisabled}
            >
              <View style={styles.tabContent}>
                <IconComponent
                  size={16}
                  color={isSelected ? orderType.color : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    isSelected && styles.tabLabelSelected,
                    isSelected && { color: orderType.color },
                  ]}
                  numberOfLines={1}
                >
                  {orderType.name}
                </Text>
              </View>

              {/* Selection indicator */}
              {isSelected && (
                <View
                  style={[
                    styles.selectionIndicator,
                    { backgroundColor: orderType.color },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Description for selected type */}
      {showDescriptions && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {ORDER_TYPE_LIST.find(t => t.id === selectedType)?.description || ''}
          </Text>
        </View>
      )}

      {/* Tooltip Modal */}
      <Modal
        visible={showTooltip}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTooltip(false)}
      >
        <Pressable
          style={styles.tooltipOverlay}
          onPress={() => setShowTooltip(false)}
        >
          <Pressable style={styles.tooltipContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>Các loại lệnh</Text>
              <TouchableOpacity onPress={() => setShowTooltip(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {ORDER_TYPE_LIST.map((orderType) => {
              const IconComponent = orderType.icon;
              return (
                <View key={orderType.id} style={styles.tooltipItem}>
                  <View style={[styles.tooltipIcon, { backgroundColor: orderType.color + '20' }]}>
                    <IconComponent size={16} color={orderType.color} />
                  </View>
                  <View style={styles.tooltipText}>
                    <Text style={[styles.tooltipItemTitle, { color: orderType.color }]}>
                      {orderType.name}
                    </Text>
                    <Text style={styles.tooltipItemDesc}>
                      {orderType.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  // Label Row
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  lockedBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    padding: 3,
    borderRadius: 4,
  },
  helpButton: {
    padding: 4,
  },
  // Tabs
  scrollContent: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: 2,
  },
  tab: {
    flex: 1,
    minWidth: 75,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  tabSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  tabDisabled: {
    opacity: 0.5,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabLabelSelected: {
    fontWeight: '700',
  },
  selectionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  descriptionContainer: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  descriptionText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Tooltip Modal
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  tooltipContent: {
    backgroundColor: COLORS.glassBg || '#1A1A2E',
    borderRadius: 12,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tooltipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tooltipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipText: {
    flex: 1,
  },
  tooltipItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  tooltipItemDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});

export default memo(OrderTypeSelector);
