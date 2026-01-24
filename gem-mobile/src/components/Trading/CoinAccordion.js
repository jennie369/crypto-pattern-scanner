/**
 * GEM Mobile - Coin Accordion Component
 * Issue #16 & #17: Merge Scan Results + Detected Patterns
 * Groups patterns by coin with expandable accordion
 */

import React, { useState, useCallback, createContext, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Wallet,
  Target,
  Shield,
  ArrowUpDown,
  Clock,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice, formatConfidence, calculateRR } from '../../utils/formatters';
import { PATTERN_STATES } from '../../constants/patternSignals';
import { isPremiumTier } from '../../constants/tierFeatures';
// V2 Badge Components
import { VolumeBadge, LockedBadge } from '../Scanner';
import { getTierKey } from '../../constants/scannerAccess';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Tooltip definitions - comprehensive for all elements
 */
const TOOLTIPS = {
  // Stats tooltips
  entry: 'Giá khuyến nghị để mở vị thế. Đợi giá chạm mức này trước khi vào lệnh.',
  takeProfit: 'Mức giá mục tiêu để chốt lời. Khi giá đạt mức này, nên đóng vị thế để bảo toàn lợi nhuận.',
  stopLoss: 'Mức giá cắt lỗ bảo vệ. Nếu giá chạm mức này, đóng vị thế để hạn chế thua lỗ.',
  rr: 'Tỷ lệ lợi nhuận/rủi ro. R:R 1:2 = tiềm năng lời gấp 2 lần mức lỗ.',

  // Pattern types
  UPD: 'Unmitigated Proximal Demand - Vùng cầu chưa được test lại. Giá có thể quay về vùng này.',
  UPS: 'Unmitigated Proximal Supply - Vùng cung chưa được test lại. Giá có thể quay về vùng này.',
  QM: 'Quasimodo - Pattern đảo chiều mạnh với shoulder-head-shoulder không cân đối.',
  FTR: 'Fail To Return - Giá không thể quay lại vùng trước đó, xác nhận xu hướng mới.',
  DP: 'Decision Point - Điểm quyết định nơi giá chọn hướng đi tiếp theo.',
  FL: 'Flag Limit - Giới hạn của pattern cờ, thường báo hiệu tiếp diễn xu hướng.',
  'Double Bottom': 'Hai đáy bằng nhau - Pattern đảo chiều tăng sau downtrend.',
  'Double Top': 'Hai đỉnh bằng nhau - Pattern đảo chiều giảm sau uptrend.',
  Engulfing: 'Nến nuốt - Nến hiện tại bao trùm hoàn toàn nến trước, báo hiệu đảo chiều.',
  'Pin Bar': 'Nến búa/sao băng - Bấc dài, thân nhỏ. Báo hiệu từ chối giá.',

  // Timeframe tooltips
  '1m': 'Khung 1 phút - Scalping, biến động cao, nhiều nhiễu.',
  '5m': 'Khung 5 phút - Scalping/Day trading ngắn hạn.',
  '15m': 'Khung 15 phút - Day trading phổ biến.',
  '30m': 'Khung 30 phút - Day trading, ít nhiễu hơn 15m.',
  '1h': 'Khung 1 giờ - Day/Swing trading. Cân bằng độ tin cậy và tần suất.',
  '4h': 'Khung 4 giờ - Swing trading. Tín hiệu mạnh, ít nhiễu.',
  '1d': 'Khung ngày - Position trading. Tín hiệu rất mạnh.',
  '1w': 'Khung tuần - Position/Investment. Xu hướng dài hạn.',

  // State badges
  FRESH: 'Tín hiệu mới - Chưa được test, còn nguyên sức mạnh.',
  ACTIVE: 'Đang hoạt động - Giá đang trong vùng pattern.',
  TESTED: 'Đã test - Vùng đã được retest ít nhất 1 lần.',
  INVALIDATED: 'Đã vô hiệu - Pattern bị phá vỡ, không còn hiệu lực.',

  // Grade tooltips
  'A+': 'Chất lượng xuất sắc - Tất cả yếu tố xác nhận. Win rate cao nhất.',
  'A': 'Chất lượng rất tốt - Đa số yếu tố xác nhận.',
  'B+': 'Chất lượng tốt - Nhiều yếu tố tích cực.',
  'B': 'Chất lượng khá - Đủ điều kiện giao dịch.',
  'C': 'Chất lượng trung bình - Cần cẩn trọng, có thể bỏ qua.',
  'D': 'Chất lượng yếu - Không khuyến nghị giao dịch.',

  // Direction tooltips
  LONG: 'Mua/Long - Kỳ vọng giá tăng. Mở vị thế mua.',
  SHORT: 'Bán/Short - Kỳ vọng giá giảm. Mở vị thế bán.',
  MIXED: 'Hỗn hợp - Có cả tín hiệu Long và Short. Chờ xác nhận rõ hơn.',

  // Volume tooltips
  volume: 'Khối lượng xác nhận mức độ quan tâm của thị trường với vùng giá này.',
  volumeStrong: 'Khối lượng mạnh (>2x) - Xác nhận cao, vùng rất quan trọng.',
  volumeGood: 'Khối lượng tốt (1.5-2x) - Xác nhận đủ tin cậy.',
  volumeAcceptable: 'Khối lượng chấp nhận được (1-1.5x) - Có thể trade với size nhỏ.',
  volumeWeak: 'Khối lượng yếu (<1x) - Thiếu xác nhận, cần cẩn trọng.',
};

/**
 * Helper to map volume grade to tooltip key
 */
const getVolumeTooltipKey = (grade) => {
  const gradeMap = {
    'STRONG': 'volumeStrong',
    'GOOD': 'volumeGood',
    'ACCEPTABLE': 'volumeAcceptable',
    'WEAK': 'volumeWeak',
    'INSUFFICIENT': 'volumeWeak',
  };
  return gradeMap[grade] || 'volume';
};

/**
 * Tooltip Context - Only one tooltip open at a time
 */
const TooltipContext = createContext({
  activeTooltip: null,
  showTooltip: () => {},
  hideTooltip: () => {},
});

const TooltipProvider = ({ children }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const showTooltip = useCallback((key, position) => {
    setActiveTooltip(key);
    if (position) {
      setTooltipPosition(position);
    }
  }, []);

  const hideTooltip = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  const tooltipText = activeTooltip ? TOOLTIPS[activeTooltip] : null;

  // Calculate tooltip position - compact, positioned near tap location
  const getTooltipStyle = () => {
    // Position tooltip below tap point, centered horizontally with smart edge detection
    const tooltipMaxWidth = 280;
    let left = tooltipPosition.x - tooltipMaxWidth / 2;

    // Prevent going off left edge
    if (left < 16) left = 16;
    // Prevent going off right edge
    if (left + tooltipMaxWidth > SCREEN_WIDTH - 16) {
      left = SCREEN_WIDTH - tooltipMaxWidth - 16;
    }

    return {
      position: 'absolute',
      top: tooltipPosition.y + 8,
      left: left,
      maxWidth: tooltipMaxWidth,
    };
  };

  return (
    <TooltipContext.Provider value={{ activeTooltip, showTooltip, hideTooltip }}>
      {children}
      {/* Global tooltip - compact popup */}
      <Modal
        visible={!!activeTooltip && !!tooltipText}
        transparent
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <TouchableWithoutFeedback onPress={hideTooltip}>
          <View style={tooltipStyles.modalOverlay}>
            <View style={[tooltipStyles.popup, getTooltipStyle()]}>
              <Text style={tooltipStyles.popupText}>{tooltipText}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TooltipContext.Provider>
  );
};

/**
 * Tooltip Label Component - Underlined label that shows tooltip on tap
 */
const TooltipLabel = ({ label, tooltipKey, style }) => {
  const { activeTooltip, showTooltip, hideTooltip } = useContext(TooltipContext);
  const tooltip = TOOLTIPS[tooltipKey];

  if (!tooltip) {
    return <Text style={[tooltipStyles.label, style]}>{label}</Text>;
  }

  const handlePress = (event) => {
    if (activeTooltip === tooltipKey) {
      hideTooltip();
    } else {
      const { pageX, pageY } = event.nativeEvent;
      showTooltip(tooltipKey, { x: pageX, y: pageY });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Text style={[tooltipStyles.label, tooltipStyles.underline, style]}>{label}</Text>
    </TouchableOpacity>
  );
};

/**
 * Tooltip Badge Component - For badges that need tooltips
 */
const TooltipBadge = ({ children, tooltipKey, style }) => {
  const { activeTooltip, showTooltip, hideTooltip } = useContext(TooltipContext);
  const tooltip = TOOLTIPS[tooltipKey];

  if (!tooltip) {
    return <View style={style}>{children}</View>;
  }

  const handlePress = (event) => {
    if (activeTooltip === tooltipKey) {
      hideTooltip();
    } else {
      const { pageX, pageY } = event.nativeEvent;
      showTooltip(tooltipKey, { x: pageX, y: pageY });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={style}>
      {children}
    </TouchableOpacity>
  );
};

const tooltipStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  underline: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  popup: {
    backgroundColor: '#1E2140', // Navy blue matching app theme
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  popupText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
});

/**
 * Get main direction from patterns - show MIXED if both LONG and SHORT exist
 */
const getMainDirection = (patterns) => {
  if (!patterns || patterns.length === 0) return 'NEUTRAL';
  const longs = patterns.filter(p => p.direction === 'LONG').length;
  const shorts = patterns.filter(p => p.direction === 'SHORT').length;

  // If has both LONG and SHORT patterns, show MIXED
  if (longs > 0 && shorts > 0) return 'MIXED';

  return longs > 0 ? 'LONG' : 'SHORT';
};

/**
 * Get average confidence from patterns
 */
const getAvgConfidence = (patterns) => {
  if (!patterns || patterns.length === 0) return 0;
  return patterns.reduce((sum, p) => sum + (p.confidence || 0), 0) / patterns.length;
};

/**
 * Pattern State Badge - Shows lifecycle state (FRESH, ACTIVE, etc.)
 */
const PatternStateBadge = ({ state }) => {
  const stateInfo = PATTERN_STATES?.[state] || PATTERN_STATES?.FRESH || {
    label: state || 'FRESH',
    color: '#00CFFF',
    bgColor: 'rgba(0, 207, 255, 0.15)',
    emoji: '🆕'
  };

  // Get tooltip key (e.g., FRESH, ACTIVE, etc.)
  const tooltipKey = state || 'FRESH';

  return (
    <TooltipBadge tooltipKey={tooltipKey}>
      <View style={[styles.stateBadge, { backgroundColor: stateInfo.bgColor }]}>
        <Text style={styles.stateEmoji}>{stateInfo.emoji}</Text>
        <Text style={[styles.stateLabel, { color: stateInfo.color }]}>
          {stateInfo.label}
        </Text>
      </View>
    </TooltipBadge>
  );
};

/**
 * Quality Grade Badge - Shows A+, A, B+, B, C, D
 */
const QualityGradeBadge = ({ grade, hasPremium }) => {
  if (!hasPremium || !grade) return null;

  const gradeConfig = {
    'A+': { color: '#00FF88', bg: 'rgba(0, 255, 136, 0.15)' },
    'A': { color: '#00FF88', bg: 'rgba(0, 255, 136, 0.12)' },
    'B+': { color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.15)' },
    'B': { color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.12)' },
    'C': { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' },
    'D': { color: '#FF4757', bg: 'rgba(255, 71, 87, 0.15)' },
  };

  const config = gradeConfig[grade] || gradeConfig['C'];

  return (
    <TooltipBadge tooltipKey={grade}>
      <View style={[styles.gradeBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.gradeText, { color: config.color }]}>{grade}</Text>
      </View>
    </TooltipBadge>
  );
};

/**
 * Single Pattern Item inside accordion
 */
const PatternItem = ({
  pattern,
  isSelected,
  onSelect,
  onPaperTrade,
  userTier = 'FREE',
}) => {
  const rr = calculateRR(pattern);
  const hasPremium = isPremiumTier(userTier);
  const patternState = pattern.state || 'FRESH';
  // V2 Enhancement: Use V2 confidence grade if available
  const qualityGrade = pattern.confidenceGrade || pattern.qualityGrade || null;
  // V2 shows for TIER1+ (not just TIER2+ premium)
  const tierKey = getTierKey(userTier);
  const hasV2 = pattern.hasV2Enhancements || tierKey !== 'FREE';

  return (
    <TouchableOpacity
      style={[styles.patternItem, isSelected && styles.patternItemSelected]}
      onPress={() => onSelect(pattern)}
      activeOpacity={0.7}
    >
      {/* Pattern Header with State & Quality Badges */}
      <View style={styles.patternHeader}>
        <View style={styles.patternNameRow}>
          {/* Pattern Name with tooltip */}
          <TooltipBadge tooltipKey={pattern.patternType || pattern.name}>
            <Text style={styles.patternName}>
              {pattern.patternType || pattern.name || 'Pattern'}
            </Text>
          </TooltipBadge>
          {/* Timeframe Badge with tooltip */}
          {pattern.timeframe && (
            <TooltipBadge tooltipKey={pattern.timeframe}>
              <View style={styles.timeframeBadge}>
                <Clock size={10} color={COLORS.cyan} />
                <Text style={styles.timeframeText}>{pattern.timeframe}</Text>
              </View>
            </TooltipBadge>
          )}
        </View>
        <View style={styles.badgesRow}>
          {/* Pattern State Badge - already has tooltip */}
          <PatternStateBadge state={patternState} />

          {/* Quality Grade Badge (Premium only) - already has tooltip */}
          <QualityGradeBadge grade={qualityGrade} hasPremium={hasPremium} />

          {/* Direction Badge with tooltip */}
          <TooltipBadge tooltipKey={pattern.direction}>
            <View style={[
              styles.miniDirectionBadge,
              pattern.direction === 'LONG' ? styles.longBadge : styles.shortBadge,
            ]}>
              {pattern.direction === 'LONG' ? (
                <TrendingUp size={12} color="#22C55E" />
              ) : (
                <TrendingDown size={12} color="#EF4444" />
              )}
              <Text style={[
                styles.miniDirectionText,
                pattern.direction === 'LONG' ? styles.longText : styles.shortText,
              ]}>
                {pattern.direction}
              </Text>
            </View>
          </TooltipBadge>
        </View>
      </View>

      {/* V2 Validation Badges Row - TIER 1+ (Volume only, grade shown above) */}
      {hasV2 && (pattern.volumeGrade || pattern.v2?.validations?.volume?.grade) && (
        <View style={styles.v2BadgesRow}>
          {/* Volume Badge with tooltip - Show volume confirmation status */}
          <TooltipBadge tooltipKey={getVolumeTooltipKey(pattern.volumeGrade || pattern.v2?.validations?.volume?.grade)}>
            <VolumeBadge
              grade={pattern.volumeGrade || pattern.v2?.validations?.volume?.grade}
              ratio={pattern.volumeRatio || pattern.v2?.validations?.volume?.volumeRatio}
              size="sm"
            />
          </TooltipBadge>
        </View>
      )}

      {/* Pattern Stats - Entry, TP, SL only (Confidence shown as badge above) */}
      <View style={styles.patternStats}>
        {/* Entry - White/neutral color */}
        <View style={styles.statItem}>
          <Target size={12} color={COLORS.textMuted} />
          <TooltipLabel label="Điểm Vào" tooltipKey="entry" />
          <Text style={styles.statValue}>
            ${formatPrice(pattern.entry)}
          </Text>
        </View>

        {/* Take Profit - Green */}
        <View style={styles.statItem}>
          <TrendingUp size={12} color="#22C55E" />
          <TooltipLabel label="Chốt Lời" tooltipKey="takeProfit" />
          <Text style={[styles.statValue, styles.greenText]}>
            ${formatPrice(pattern.target || pattern.takeProfit1 || pattern.takeProfit || pattern.targets?.[0])}
          </Text>
        </View>

        {/* Stop Loss - Red */}
        <View style={styles.statItem}>
          <Shield size={12} color="#EF4444" />
          <TooltipLabel label="Cắt Lỗ" tooltipKey="stopLoss" />
          <Text style={[styles.statValue, styles.redText]}>
            ${formatPrice(pattern.stopLoss)}
          </Text>
        </View>
      </View>

      {/* R:R Row - with tooltip, inline label and value */}
      <View style={styles.rrRow}>
        <View style={styles.rrInline}>
          <TooltipLabel label="Tỷ Lệ R:R" tooltipKey="rr" style={styles.rrLabel} />
          <Text style={styles.rrValue}>1:{rr.toFixed(1)}</Text>
        </View>
      </View>

      {/* Paper Trade Button */}
      {onPaperTrade && (
        <TouchableOpacity
          style={styles.paperTradeBtn}
          onPress={() => onPaperTrade(pattern)}
          activeOpacity={0.8}
        >
          <Wallet size={14} color="#FFFFFF" />
          <Text style={styles.paperTradeText}>Paper Trade</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

/**
 * Main CoinAccordion Component
 */
const CoinAccordion = ({
  coin,
  patterns = [],
  isExpanded = false,
  onToggle,
  onSelectPattern,
  onPaperTrade,
  selectedPatternId,
  userTier = 'FREE',
}) => {
  const totalPatterns = patterns.length;
  const mainDirection = getMainDirection(patterns);
  const avgConfidence = getAvgConfidence(patterns);

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle?.();
  }, [onToggle]);

  if (totalPatterns === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header - Tap to toggle */}
      <TouchableOpacity
        style={[styles.header, isExpanded && styles.headerExpanded]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.coinInfo}>
          <View style={styles.checkIcon}>
            <CheckCircle size={20} color="#22C55E" />
          </View>
          <View>
            <Text style={styles.coinName}>
              {coin?.symbol?.replace('USDT', '/USDT') || coin?.symbol || 'Unknown'}
            </Text>
            <Text style={styles.patternCount}>
              {totalPatterns} pattern{totalPatterns > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.rightInfo}>
          {/* Direction Badge */}
          <View style={[
            styles.directionBadge,
            mainDirection === 'LONG' ? styles.longBadge :
            mainDirection === 'SHORT' ? styles.shortBadge : styles.mixedBadge,
          ]}>
            {mainDirection === 'LONG' ? (
              <TrendingUp size={14} color="#22C55E" />
            ) : mainDirection === 'SHORT' ? (
              <TrendingDown size={14} color="#EF4444" />
            ) : (
              <ArrowUpDown size={14} color="#FFBD59" />
            )}
            <Text style={[
              styles.directionText,
              mainDirection === 'LONG' ? styles.longText :
              mainDirection === 'SHORT' ? styles.shortText : styles.mixedText,
            ]}>
              {mainDirection}
            </Text>
          </View>

          {/* Confidence */}
          <Text style={styles.confidence}>
            {formatConfidence(avgConfidence, 0)}
          </Text>

          {/* Chevron */}
          {isExpanded ? (
            <ChevronUp size={20} color={COLORS.textMuted} />
          ) : (
            <ChevronDown size={20} color={COLORS.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Patterns List - Only show when expanded */}
      {isExpanded && (
        <View style={styles.patternsContainer}>
          {patterns.map((pattern, index) => (
            <PatternItem
              key={pattern.pattern_id || pattern.id || `${pattern.symbol}-${pattern.name}-${index}`}
              pattern={pattern}
              isSelected={selectedPatternId === pattern.pattern_id || selectedPatternId === pattern.id}
              onSelect={onSelectPattern}
              userTier={userTier}
              onPaperTrade={onPaperTrade}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },

  headerExpanded: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },

  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  coinName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  patternCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#22C55E', // Explicit green color
  },

  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },

  longBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },

  shortBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },

  mixedBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },

  directionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  longText: {
    color: '#22C55E',
  },

  shortText: {
    color: '#EF4444',
  },

  mixedText: {
    color: '#FFBD59',
  },

  confidence: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  patternsContainer: {
    padding: SPACING.sm,
  },

  patternItem: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },

  patternItemSelected: {
    borderWidth: 2,
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },

  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },

  patternNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },

  patternName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  timeframeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  timeframeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.cyan,
  },

  miniDirectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  miniDirectionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  patternStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  statItem: {
    alignItems: 'center',
    gap: 2,
  },

  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  statValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },

  greenText: {
    color: '#22C55E',
  },

  redText: {
    color: '#EF4444',
  },

  mutedText: {
    color: COLORS.textMuted || '#888888',
  },

  rrRow: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  rrInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  rrLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  rrValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary, // White color
  },

  paperTradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.purple,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },

  paperTradeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },

  // Badges Row for State + Quality + Direction
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },

  // State Badge styles
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  stateEmoji: {
    fontSize: 10,
  },
  stateLabel: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Quality Grade Badge styles
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // V2 Validation Badges Row
  v2BadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
});

/**
 * CoinAccordion wrapped with TooltipProvider for global tooltip management
 */
const CoinAccordionWithTooltips = (props) => (
  <TooltipProvider>
    <CoinAccordion {...props} />
  </TooltipProvider>
);

export default CoinAccordionWithTooltips;
export { TooltipProvider, TooltipBadge, TooltipLabel };
