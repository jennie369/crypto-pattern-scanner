/**
 * EMOTION INDICATOR COMPONENT
 * Displays detected emotion with frequency visualization
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Smile,
  Frown,
  Meh,
  Heart,
  Cloud,
  Zap,
  AlertTriangle,
  AlertCircle,
  Target,
  HelpCircle,
  Sun,
  Shield,
  Star,
  Activity,
} from 'lucide-react-native';

// Emotion to icon mapping
const EMOTION_ICONS = {
  joy: Smile,
  love: Heart,
  peace: Cloud,
  hope: Sun,
  gratitude: Heart,
  excitement: Zap,
  confidence: Shield,
  curiosity: HelpCircle,
  acceptance: Target,
  neutral: Meh,
  sadness: Frown,
  anxiety: AlertTriangle,
  anger: Zap,
  fear: AlertCircle,
  guilt: Frown,
  frustration: Frown,
  overwhelm: AlertCircle,
  loneliness: Frown,
  confusion: HelpCircle,
  crisis: AlertCircle,
};

// Emotion colors
const EMOTION_COLORS = {
  joy: '#FFD700',
  love: '#FF69B4',
  peace: '#87CEEB',
  hope: '#FFA500',
  gratitude: '#9370DB',
  excitement: '#FF4500',
  confidence: '#4169E1',
  curiosity: '#20B2AA',
  acceptance: '#3CB371',
  neutral: '#808080',
  sadness: '#4682B4',
  anxiety: '#DDA0DD',
  anger: '#DC143C',
  fear: '#8B0000',
  guilt: '#696969',
  frustration: '#CD853F',
  overwhelm: '#9932CC',
  loneliness: '#483D8B',
  confusion: '#708090',
  crisis: '#FF0000',
};

const EmotionIndicator = ({
  emotion,
  frequency,
  level,
  intensity,
  showFrequency = false,
  showLabel = true,
  size = 'medium',
  onPress,
  style,
}) => {
  const emotionName = emotion?.emotion || emotion || 'neutral';
  const IconComponent = EMOTION_ICONS[emotionName] || Meh;
  const color = EMOTION_COLORS[emotionName] || '#808080';

  const iconSize = size === 'small' ? 16 : size === 'large' ? 28 : 20;
  const containerPadding = size === 'small' ? 6 : size === 'large' ? 12 : 8;

  const getLevelText = () => {
    if (!level) return null;
    switch (level) {
      case 'elevated':
        return 'Cao';
      case 'medium':
        return 'TB';
      case 'low':
        return 'Thấp';
      case 'crisis':
        return 'Khẩn cấp';
      default:
        return null;
    }
  };

  const getLevelColor = () => {
    switch (level) {
      case 'elevated':
        return '#4CAF50';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#FF9800';
      case 'crisis':
        return '#F44336';
      default:
        return '#808080';
    }
  };

  const getEmotionLabel = () => {
    const labels = {
      joy: 'Vui vẻ',
      love: 'Yêu thương',
      peace: 'Bình an',
      hope: 'Hy vọng',
      gratitude: 'Biết ơn',
      excitement: 'Hào hứng',
      confidence: 'Tự tin',
      curiosity: 'Tò mò',
      acceptance: 'Chấp nhận',
      neutral: 'Bình thường',
      sadness: 'Buồn',
      anxiety: 'Lo lắng',
      anger: 'Tức giận',
      fear: 'Sợ hãi',
      guilt: 'Tội lỗi',
      frustration: 'Bực bội',
      overwhelm: 'Quá tải',
      loneliness: 'Cô đơn',
      confusion: 'Bối rối',
      crisis: 'Cần hỗ trợ',
    };
    return labels[emotionName] || emotionName;
  };

  const content = (
    <View style={[styles.container, { padding: containerPadding }, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: `${color}20` }]}>
        <IconComponent size={iconSize} color={color} />
      </View>

      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.emotionLabel, { color }]} numberOfLines={1}>
            {getEmotionLabel()}
          </Text>

          {showFrequency && frequency && (
            <View style={styles.frequencyContainer}>
              <Activity size={12} color={getLevelColor()} />
              <Text style={[styles.frequencyText, { color: getLevelColor() }]}>
                {frequency}Hz
              </Text>
              {getLevelText() && (
                <View style={[styles.levelBadge, { backgroundColor: `${getLevelColor()}20` }]}>
                  <Text style={[styles.levelText, { color: getLevelColor() }]}>
                    {getLevelText()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {intensity && intensity > 7 && (
        <View style={styles.intensityDot} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// Compact version for message bubbles
export const EmotionBadge = ({ emotion, style }) => {
  const emotionName = emotion?.emotion || emotion || 'neutral';
  const IconComponent = EMOTION_ICONS[emotionName] || Meh;
  const color = EMOTION_COLORS[emotionName] || '#808080';

  return (
    <View style={[styles.badge, { backgroundColor: `${color}20` }, style]}>
      <IconComponent size={12} color={color} />
    </View>
  );
};

// Frequency bar visualization
export const FrequencyBar = ({ frequency, maxFrequency = 700, style }) => {
  const percentage = Math.min(100, (frequency / maxFrequency) * 100);

  const getBarColor = () => {
    if (frequency >= 300) return '#4CAF50';
    if (frequency >= 175) return '#FFC107';
    return '#FF9800';
  };

  return (
    <View style={[styles.frequencyBar, style]}>
      <View
        style={[
          styles.frequencyFill,
          {
            width: `${percentage}%`,
            backgroundColor: getBarColor(),
          },
        ]}
      />
      <Text style={styles.frequencyBarText}>{frequency}Hz</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  iconWrapper: {
    borderRadius: 20,
    padding: 6,
  },
  labelContainer: {
    marginLeft: 8,
    flex: 1,
  },
  emotionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  frequencyText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  levelBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4500',
    marginLeft: 4,
  },

  // Badge styles
  badge: {
    borderRadius: 12,
    padding: 4,
  },

  // Frequency bar styles
  frequencyBar: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  frequencyFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 10,
  },
  frequencyBarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EmotionIndicator;
