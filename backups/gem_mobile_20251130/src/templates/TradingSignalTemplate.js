/**
 * Gemral - Trading Signal Template
 *
 * Professional trading analysis card
 * Size: 1080x1920 (Instagram story format)
 * Theme: Dark with accent colors for signals
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Zap,
  BarChart3,
  AlertTriangle,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = CARD_WIDTH * (1920 / 1080);

const TradingSignalTemplate = forwardRef(({ data, showWatermark = true }, ref) => {
  const {
    patternName = 'Pattern Analysis',
    signal = 'LONG',
    confidence = 75,
    winRate = 68,
    insights = [],
    text = '',
    date = new Date(),
  } = data || {};

  const isLong = signal.toUpperCase() === 'LONG';
  const signalColor = isLong ? COLORS.success : COLORS.error;

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Extract insights from text if not provided
  const displayInsights = insights.length > 0 ? insights : extractInsights(text);

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      <LinearGradient
        colors={['#0F1030', '#05040B']}
        locations={[0, 1]}
        style={styles.gradient}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <LinearGradient
            colors={['#112250', '#0F1030']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <BarChart3 size={24} color={COLORS.gold} />
            <Text style={styles.headerTitle}>GEM TRADING SIGNAL</Text>
          </LinearGradient>
        </View>

        {/* Pattern Name */}
        <View style={styles.patternContainer}>
          <Text style={styles.patternLabel}>Pattern Detected</Text>
          <Text style={styles.patternName}>{patternName}</Text>
        </View>

        {/* Signal Badge */}
        <View style={styles.signalContainer}>
          <View style={[styles.signalBadge, { backgroundColor: `${signalColor}20` }]}>
            {isLong ? (
              <TrendingUp size={40} color={signalColor} />
            ) : (
              <TrendingDown size={40} color={signalColor} />
            )}
            <Text style={[styles.signalText, { color: signalColor }]}>
              {signal.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Confidence */}
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Target size={16} color={COLORS.gold} />
              <Text style={styles.statLabel}>Confidence</Text>
            </View>
            <Text style={styles.statValue}>{confidence}%</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${confidence}%`,
                    backgroundColor: confidence >= 70 ? COLORS.success : COLORS.warning,
                  },
                ]}
              />
            </View>
          </View>

          {/* Win Rate */}
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Shield size={16} color={COLORS.purple} />
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <Text style={styles.statValue}>{winRate}%</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${winRate}%`,
                    backgroundColor: COLORS.purple,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Key Insights */}
        {displayInsights.length > 0 && (
          <View style={styles.insightsContainer}>
            <View style={styles.insightsHeader}>
              <Zap size={18} color={COLORS.gold} />
              <Text style={styles.insightsTitle}>Key Insights</Text>
            </View>

            {displayInsights.slice(0, 4).map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <View style={styles.insightBullet} />
                <Text style={styles.insightText} numberOfLines={2}>
                  {insight}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <AlertTriangle size={14} color={COLORS.warning} />
          <Text style={styles.disclaimerText}>
            Not Financial Advice - DYOR (Do Your Own Research)
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.timestamp}>{formatDate(date)}</Text>

          {showWatermark && (
            <View style={styles.watermark}>
              <Text style={styles.watermarkText}>GEM Scanner Platform</Text>
            </View>
          )}

          <Text style={styles.website}>gemcapitalholding.com</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

// Helper to extract insights from text
function extractInsights(text) {
  if (!text) return [];

  const insights = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('•') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('*') ||
      /^\d+\./.test(trimmed)
    ) {
      const cleaned = trimmed.replace(/^[•\-*\d.]+\s*/, '');
      if (cleaned.length > 10 && cleaned.length < 100) {
        insights.push(cleaned);
      }
    }
  }

  return insights.slice(0, 4);
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#0F1030',
  },
  gradient: {
    flex: 1,
  },

  // Header
  headerBar: {
    marginBottom: SPACING.xxl,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 2,
  },

  // Pattern
  patternContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  patternLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  patternName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Signal
  signalContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  signalText: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Insights
  insightsContainer: {
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  insightsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.gold,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.purple,
    marginTop: 7,
  },
  insightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Disclaimer
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    padding: SPACING.md,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  watermark: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  watermarkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: 'rgba(255, 189, 89, 0.6)',
    fontWeight: '600',
  },
  website: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default TradingSignalTemplate;
