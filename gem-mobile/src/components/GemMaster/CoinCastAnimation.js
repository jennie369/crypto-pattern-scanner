/**
 * CoinCastAnimation Component
 * Fast animated 3-coin toss for I-Ching line generation
 * Optimized for speed - total animation ~400ms
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Circle, CircleDot, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const COIN_SIZE = 56;

/**
 * I-Ching coin toss logic:
 * - 3 coins, each has heads (3) or tails (2)
 * - Sum = 6, 7, 8, or 9
 * - 6 = Old Yin (changing)
 * - 7 = Young Yang (stable)
 * - 8 = Young Yin (stable)
 * - 9 = Old Yang (changing)
 */
const tossCoin = () => Math.random() > 0.5 ? 3 : 2;

const CoinCastAnimation = ({
  onLineComplete,
  lineNumber = 1,
  disabled = false,
}) => {
  const [coins, setCoins] = useState([null, null, null]);
  const [isTossing, setIsTossing] = useState(false);
  const [result, setResult] = useState(null);

  // Simple scale animation for coins
  const coinScale = useSharedValue(1);

  const startToss = useCallback(() => {
    if (isTossing || disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTossing(true);
    setResult(null);

    // Quick scale animation
    coinScale.value = withSequence(
      withTiming(0.8, { duration: 80, easing: Easing.out(Easing.quad) }),
      withTiming(1.1, { duration: 100, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 80, easing: Easing.out(Easing.quad) })
    );

    // Generate all coin values immediately
    const coin1Value = tossCoin();
    const coin2Value = tossCoin();
    const coin3Value = tossCoin();
    const coinResults = [coin1Value, coin2Value, coin3Value];

    // Show results quickly
    setTimeout(() => {
      setCoins(coinResults);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Calculate result
      const sum = coinResults.reduce((a, b) => a + b, 0);
      let lineType;
      let isChanging = false;

      switch (sum) {
        case 6:
          lineType = 'yin';
          isChanging = true;
          break;
        case 7:
          lineType = 'yang';
          isChanging = false;
          break;
        case 8:
          lineType = 'yin';
          isChanging = false;
          break;
        case 9:
          lineType = 'yang';
          isChanging = true;
          break;
        default:
          lineType = 'yang';
      }

      setResult({ sum, lineType, isChanging });
      setIsTossing(false);

      // Notify parent immediately after showing result
      setTimeout(() => {
        onLineComplete?.({
          position: lineNumber,
          sum,
          lineType,
          isChanging,
          coins: coinResults,
        });
      }, 150); // Very short delay to see result

    }, 150); // Show coins after 150ms

  }, [isTossing, disabled, lineNumber, onLineComplete, coinScale]);

  const coinAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coinScale.value }],
  }));

  // Render single coin
  const renderCoin = (value, index) => {
    const isHeads = value === 3;
    const showValue = value !== null;

    return (
      <Animated.View key={index} style={[styles.coinWrapper, coinAnimStyle]}>
        <View style={[styles.coin, showValue && (isHeads ? styles.coinHeads : styles.coinTails)]}>
          {showValue ? (
            isHeads ? (
              <CircleDot size={28} color={COLORS.gold} />
            ) : (
              <Circle size={28} color={COLORS.textMuted} />
            )
          ) : (
            <View style={styles.coinEmpty} />
          )}
        </View>
        {showValue && (
          <Text style={[styles.coinLabel, isHeads && styles.coinLabelHeads]}>
            {isHeads ? 'Dương (3)' : 'Âm (2)'}
          </Text>
        )}
      </Animated.View>
    );
  };

  // Get result text
  const getResultText = () => {
    if (!result) return null;
    const { sum, lineType, isChanging } = result;
    const lineTypeVi = lineType === 'yang' ? 'Dương' : 'Âm';
    const changingText = isChanging ? ' (Động)' : ' (Tĩnh)';
    return `Tổng: ${sum} → Hào ${lineTypeVi}${changingText}`;
  };

  return (
    <View style={styles.container}>
      {/* Line number indicator */}
      <View style={styles.lineIndicator}>
        <Text style={styles.lineNumber}>HÀO {lineNumber}</Text>
      </View>

      {/* Coins */}
      <View style={styles.coinsRow}>
        {renderCoin(coins[0], 0)}
        {renderCoin(coins[1], 1)}
        {renderCoin(coins[2], 2)}
      </View>

      {/* Result line preview */}
      {result && (
        <View style={styles.resultContainer}>
          <View style={[
            styles.resultLine,
            result.lineType === 'yang' ? styles.yangLine : styles.yinLine,
            result.isChanging && styles.changingLine,
          ]}>
            {result.lineType === 'yin' && <View style={styles.yinGap} />}
          </View>
          <Text style={styles.resultText}>{getResultText()}</Text>
        </View>
      )}

      {/* Toss button */}
      {!result && (
        <TouchableOpacity
          style={[styles.tossButton, (isTossing || disabled) && styles.tossButtonDisabled]}
          onPress={startToss}
          disabled={isTossing || disabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255, 189, 89, 0.9)', 'rgba(212, 175, 55, 0.8)']}
            style={styles.tossButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Sparkles size={18} color="#0F1030" />
            <Text style={styles.tossButtonText}>
              {isTossing ? 'Đang tung...' : 'Tung xu'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  lineIndicator: {
    marginBottom: SPACING.sm,
  },
  lineNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
    letterSpacing: 2,
  },
  coinsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginVertical: SPACING.md,
  },
  coinWrapper: {
    alignItems: 'center',
  },
  coin: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    borderRadius: COIN_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  coinHeads: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: 'rgba(255, 189, 89, 0.5)',
  },
  coinTails: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  coinEmpty: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  coinLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  coinLabelHeads: {
    color: COLORS.gold,
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  resultLine: {
    width: 100,
    height: 10,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 5,
    marginBottom: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yangLine: {
    backgroundColor: COLORS.gold,
  },
  yinLine: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  changingLine: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  yinGap: {
    width: 16,
    height: 10,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 5,
  },
  resultText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tossButton: {
    marginTop: SPACING.md,
    borderRadius: 22,
    overflow: 'hidden',
  },
  tossButtonDisabled: {
    opacity: 0.6,
  },
  tossButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  tossButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0F1030',
  },
});

export default CoinCastAnimation;
