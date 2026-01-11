/**
 * GEM Scanner - Order Lines Toggle
 * Toggle button for enabling/disabling order lines on chart (Binance-style)
 */

import React, { memo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {
  TrendingUp,
  Settings2,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const OrderLinesToggle = ({
  enabled = false,
  onToggle,
  onSettingsPress,
  lineCount = 0,
  positionCount = 0,
  pendingCount = 0,
}) => {
  return (
    <View style={styles.container}>
      {/* Main Toggle Button - Combined Orders + Eye icon */}
      <TouchableOpacity
        style={[styles.toggleButton, enabled && styles.toggleButtonActive]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <TrendingUp size={16} color={enabled ? '#FFFFFF' : '#A0AEC0'} />
        <Text style={[styles.toggleText, enabled && styles.toggleTextActive]}>
          Orders
        </Text>
        {lineCount > 0 && (
          <View style={[styles.countBadge, !enabled && styles.countBadgeInactive]}>
            <Text style={[styles.countText, !enabled && styles.countTextInactive]}>
              {lineCount}
            </Text>
          </View>
        )}
        {/* Eye icon inside the button to show visibility state */}
        {enabled ? (
          <Eye size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
        ) : (
          <EyeOff size={14} color="#A0AEC0" style={{ marginLeft: 4 }} />
        )}
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
      >
        <Settings2 size={16} color="#A0AEC0" />
      </TouchableOpacity>

      {/* Position/Pending Info */}
      {enabled && (positionCount > 0 || pendingCount > 0) && (
        <View style={styles.infoContainer}>
          {positionCount > 0 && (
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>{positionCount} vị thế</Text>
            </View>
          )}
          {pendingCount > 0 && (
            <View style={[styles.infoBadge, styles.pendingBadge]}>
              <Text style={[styles.infoText, styles.pendingText]}>{pendingCount} chờ</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  countBadgeInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A202C',
  },
  countTextInactive: {
    color: '#A0AEC0',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  infoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  infoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
  },
  pendingText: {
    color: '#00F0FF',
  },
});

export default memo(OrderLinesToggle);
