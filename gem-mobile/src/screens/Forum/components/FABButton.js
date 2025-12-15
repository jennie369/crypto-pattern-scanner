/**
 * Gemral - FAB Button Component
 * Floating action button for creating new posts
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { COLORS, SPACING } from '../../../utils/tokens';

const FABButton = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
    <Plus size={24} color="#FFFFFF" strokeWidth={3} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 140, // Account for floating tab bar + safe area
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B0000', // Dark red like Sign Out button
    borderWidth: 2,
    borderColor: COLORS.gold, // Gold border
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default FABButton;
