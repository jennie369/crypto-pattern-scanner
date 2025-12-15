/**
 * Gemral - Empty History State Component
 *
 * Shown when user has no chat history
 * Features: illustration, message, action button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageSquare, Sparkles, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../../utils/tokens';

const EmptyHistoryState = ({ onStartChat, isArchived = false }) => {
  return (
    <View style={styles.container}>
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        {/* Background stars */}
        <Star
          size={14}
          color="rgba(255, 189, 89, 0.3)"
          style={styles.star1}
        />
        <Star
          size={10}
          color="rgba(255, 189, 89, 0.2)"
          style={styles.star2}
        />
        <Star
          size={12}
          color="rgba(255, 189, 89, 0.25)"
          style={styles.star3}
        />

        {/* Main icon */}
        <LinearGradient
          colors={GRADIENTS.gold}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MessageSquare size={48} color={COLORS.bgMid} />
        </LinearGradient>
      </View>

      {/* Text Content */}
      <Text style={styles.title}>
        {isArchived ? 'Chưa có chat đã lưu trữ' : 'Chưa có cuộc trò chuyện nào'}
      </Text>
      <Text style={styles.description}>
        {isArchived
          ? 'Các cuộc trò chuyện bạn lưu trữ sẽ xuất hiện ở đây.'
          : 'Bắt đầu trò chuyện với Gemral để nhận tư vấn và hướng dẫn!'}
      </Text>

      {/* Action Button - Only show for non-archived view */}
      {!isArchived && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onStartChat}
          activeOpacity={0.8}
        >
          <Sparkles size={18} color={COLORS.gold} />
          <Text style={styles.actionButtonText}>Bắt đầu trò chuyện</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.huge,
  },
  illustrationContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  star1: {
    position: 'absolute',
    top: 10,
    left: 20,
  },
  star2: {
    position: 'absolute',
    top: 25,
    right: 15,
  },
  star3: {
    position: 'absolute',
    bottom: 20,
    left: 10,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default EmptyHistoryState;
