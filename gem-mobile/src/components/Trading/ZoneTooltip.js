/**
 * Zone Tooltip Component
 * Shows detailed zone info when user taps a zone on the chart
 * Follows Swift Algo style: HFZ (Sell) = #9C0612, LFZ (Buy) = #00C853
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING } from '../../theme/darkTheme';

/**
 * Get strength display based on test count and status
 * @param {number} testCount - Number of times zone was tested
 * @param {string} status - Zone status
 * @returns {Object} { stars, label }
 */
const getStrengthDisplay = (testCount, status) => {
  if (status === 'BROKEN') {
    return { stars: 1, label: 'Broken', color: COLORS.textMuted };
  }
  if (testCount === 0) {
    return { stars: 5, label: 'Fresh - Best', color: COLORS.success };
  }
  if (testCount === 1) {
    return { stars: 4, label: 'Tested 1x', color: COLORS.success };
  }
  if (testCount === 2) {
    return { stars: 3, label: 'Tested 2x', color: COLORS.warning };
  }
  return { stars: 2, label: 'Weak (3+ tests)', color: COLORS.error };
};

/**
 * Render star rating
 * @param {number} count - Number of filled stars (1-5)
 * @param {string} color - Star color
 */
const StarRating = ({ count, color }) => {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[styles.star, { opacity: i <= count ? 1 : 0.3 }]}
        >
          {i <= count ? '\u2605' : '\u2606'}
        </Text>
      ))}
    </View>
  );
};

/**
 * Info row component for displaying key-value pairs
 */
const InfoRow = ({ label, value, valueColor, accent }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    {accent ? (
      <View style={[styles.badge, { backgroundColor: accent }]}>
        <Text style={styles.badgeText}>{value}</Text>
      </View>
    ) : (
      <Text style={[styles.value, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    )}
  </View>
);

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
const formatPrice = (price) => {
  if (!price || isNaN(price)) return 'N/A';
  if (price < 1) return price.toFixed(6);
  if (price < 100) return price.toFixed(4);
  return price.toFixed(2);
};

/**
 * Zone Tooltip Modal Component
 * @param {boolean} visible - Whether tooltip is visible
 * @param {Object} zone - Zone data object
 * @param {Object} position - Position { x, y } for tooltip placement
 * @param {Function} onClose - Close handler
 * @param {Function} onViewDetails - Optional handler to view full zone details
 */
const ZoneTooltip = ({
  visible,
  zone,
  position = { x: 0, y: 0 },
  onClose,
  onViewDetails,
}) => {
  if (!visible || !zone) return null;

  const isHFZ = zone.zone_type === 'HFZ' || zone.type === 'HFZ';
  const accentColor = isHFZ ? '#9C0612' : '#00C853'; // Swift Algo colors
  const zoneLabel = isHFZ ? 'SELL ZONE' : 'BUY ZONE';

  const testCount = zone.test_count || 0;
  const status = zone.status || 'FRESH';
  const strength = getStrengthDisplay(testCount, status);

  const patternName = zone.pattern_type || zone.patternType || zone.name || 'Pattern';
  const grade = zone.pattern_grade || zone.grade || 'N/A';
  const confidence = zone.pattern_confidence || zone.confidence || zone.odds_score || 'N/A';

  const entryPrice = zone.entry_price || zone.entry;
  const stopPrice = zone.stop_price || zone.stopLoss;
  const zoneHigh = zone.zone_high || zone.zoneHigh;
  const zoneLow = zone.zone_low || zone.zoneLow;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.container,
            {
              top: Math.min(position.y, 400),
              left: Math.min(Math.max(position.x - 100, 10), 200),
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: accentColor }]}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>
                {isHFZ ? '\u2193' : '\u2191'}
              </Text>
              <Text style={styles.headerTitle}>{zoneLabel}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeIcon}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <InfoRow label="Pattern" value={patternName} />
            <InfoRow label="Grade" value={grade} accent={accentColor} />

            <View style={styles.strengthRow}>
              <Text style={styles.label}>Strength:</Text>
              <StarRating count={strength.stars} color={strength.color} />
            </View>

            <InfoRow
              label="Status"
              value={status}
              valueColor={status === 'FRESH' ? COLORS.success : COLORS.warning}
            />

            <View style={styles.divider} />

            <InfoRow
              label="Entry"
              value={`$${formatPrice(entryPrice)}`}
              valueColor={COLORS.cyan}
            />
            <InfoRow
              label="Stop Loss"
              value={`$${formatPrice(stopPrice)}`}
              valueColor={COLORS.error}
            />
            <InfoRow
              label="Zone"
              value={`$${formatPrice(zoneLow)} - $${formatPrice(zoneHigh)}`}
            />

            {confidence !== 'N/A' && (
              <InfoRow
                label="Confidence"
                value={`${confidence}%`}
                valueColor={COLORS.cyan}
              />
            )}
          </View>

          {/* Action Button */}
          {onViewDetails && (
            <TouchableOpacity
              style={[styles.detailButton, { backgroundColor: accentColor }]}
              onPress={() => {
                onClose?.();
                onViewDetails?.(zone);
              }}
            >
              <Text style={styles.detailButtonText}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    width: 220,
    backgroundColor: COLORS.glassBg || 'rgba(20, 20, 40, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm || 8,
    paddingHorizontal: SPACING.md || 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  closeIcon: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: SPACING.md || 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 14,
    color: COLORS.gold || '#FFBD59',
  },
  label: {
    fontSize: 11,
    color: COLORS.textMuted || 'rgba(255, 255, 255, 0.6)',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary || '#FFF',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  detailButton: {
    marginHorizontal: SPACING.md || 12,
    marginBottom: SPACING.md || 12,
    paddingVertical: SPACING.sm || 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default ZoneTooltip;
