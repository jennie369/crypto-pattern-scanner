/**
 * AIMessageBubble - AI message display with typing effect
 * Used for AI Sư Phụ messages in trade flow
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';
import { AI_MOODS } from '../../services/gemMasterAIService';

const AIMessageBubble = ({
  message = '',
  mood = 'calm',
  isTyping = false,
  typingSpeed = 20, // ms per character
  onTypingComplete,
  showMoodIndicator = true,
  style,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingActive, setIsTypingActive] = useState(false);
  const typingRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  const moodConfig = AI_MOODS[mood] || AI_MOODS.calm;

  // Get border color based on mood
  const getBorderColor = () => {
    switch (mood) {
      case 'calm':
        return 'rgba(0, 217, 255, 0.4)';
      case 'warning':
        return 'rgba(255, 107, 107, 0.5)';
      case 'angry':
        return 'rgba(220, 38, 38, 0.6)';
      case 'proud':
        return 'rgba(255, 215, 0, 0.5)';
      case 'silent':
        return 'rgba(74, 74, 74, 0.4)';
      default:
        return 'rgba(106, 91, 255, 0.3)';
    }
  };

  // Typing animation
  useEffect(() => {
    if (!message) {
      setDisplayedText('');
      return;
    }

    if (isTyping) {
      setIsTypingActive(true);
      setDisplayedText('');
      let index = 0;

      typingRef.current = setInterval(() => {
        if (index < message.length) {
          setDisplayedText(prev => prev + message[index]);
          index++;
        } else {
          clearInterval(typingRef.current);
          setIsTypingActive(false);
          onTypingComplete?.();
        }
      }, typingSpeed);

      return () => {
        if (typingRef.current) {
          clearInterval(typingRef.current);
        }
      };
    } else {
      setDisplayedText(message);
      setIsTypingActive(false);
    }
  }, [message, isTyping, typingSpeed]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  // Typing dots animation
  useEffect(() => {
    if (!isTypingActive) return;

    const animateDots = () => {
      Animated.loop(
        Animated.stagger(200, [
          Animated.sequence([
            Animated.timing(dotAnim1, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim1, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dotAnim2, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim2, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dotAnim3, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim3, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animateDots();

    return () => {
      dotAnim1.setValue(0);
      dotAnim2.setValue(0);
      dotAnim3.setValue(0);
    };
  }, [isTypingActive]);

  // Get mood label
  const getMoodLabel = () => {
    switch (mood) {
      case 'calm':
        return 'Bình tĩnh';
      case 'warning':
        return 'Cảnh báo';
      case 'angry':
        return 'Nghiêm khắc';
      case 'proud':
        return 'Tự hào';
      case 'silent':
        return 'Im lặng';
      default:
        return '';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
        style,
      ]}
    >
      {/* Mood indicator */}
      {showMoodIndicator && (
        <View style={styles.moodIndicator}>
          <View
            style={[
              styles.moodDot,
              { backgroundColor: moodConfig.color },
            ]}
          />
          <Text style={[styles.moodLabel, { color: moodConfig.color }]}>
            {getMoodLabel()}
          </Text>
        </View>
      )}

      {/* Message bubble */}
      <View
        style={[
          styles.bubble,
          { borderColor: getBorderColor() },
        ]}
      >
        <LinearGradient
          colors={['rgba(15, 16, 48, 0.8)', 'rgba(15, 16, 48, 0.9)']}
          style={styles.bubbleGradient}
        >
          {/* Message text */}
          <Text style={styles.messageText}>
            {displayedText}
            {isTypingActive && (
              <Text style={styles.cursor}>|</Text>
            )}
          </Text>

          {/* Typing indicator */}
          {isTypingActive && displayedText.length === 0 && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Sư Phụ đang trả lời</Text>
              <View style={styles.dotsContainer}>
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      opacity: dotAnim1,
                      transform: [{
                        translateY: dotAnim1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -4],
                        }),
                      }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      opacity: dotAnim2,
                      transform: [{
                        translateY: dotAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -4],
                        }),
                      }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      opacity: dotAnim3,
                      transform: [{
                        translateY: dotAnim3.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -4],
                        }),
                      }],
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  moodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  moodLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bubble: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  bubbleGradient: {
    padding: SPACING.lg,
  },
  messageText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  cursor: {
    color: COLORS.cyan,
    fontWeight: 'bold',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  typingText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.cyan,
    marginHorizontal: 2,
  },
});

export default AIMessageBubble;
