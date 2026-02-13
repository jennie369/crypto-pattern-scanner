/**
 * CallAvatar Component
 * Pulsing avatar for call screens
 */

import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import { CALL_UI } from '../../constants/callConstants';

/**
 * CallAvatar - Animated avatar for call screens
 * @param {Object} props
 * @param {string} props.uri - Avatar image URI
 * @param {number} props.size - Avatar size
 * @param {boolean} props.isPulsing - Whether to show pulse animation
 * @param {string} props.pulseColor - Color of pulse rings
 */
const CallAvatar = ({
  uri,
  size = CALL_UI.AVATAR_SIZE_LARGE,
  isPulsing = false,
  pulseColor = COLORS.gold,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isPulsing) {
      const pulseAnimation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: CALL_UI.PULSE_ANIMATION_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: CALL_UI.PULSE_ANIMATION_DURATION,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: CALL_UI.PULSE_ANIMATION_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: CALL_UI.PULSE_ANIMATION_DURATION,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [isPulsing, pulseAnim, opacityAnim]);

  const ringSize = size + 30;

  return (
    <View style={styles.container}>
      {/* Pulse rings */}
      {isPulsing && (
        <>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderColor: pulseColor,
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: ringSize + 20,
                height: ringSize + 20,
                borderRadius: (ringSize + 20) / 2,
                borderColor: pulseColor,
                transform: [
                  {
                    scale: Animated.add(pulseAnim, 0.1),
                  },
                ],
                opacity: Animated.multiply(opacityAnim, 0.5),
              },
            ]}
          />
        </>
      )}

      {/* Avatar container */}
      <View
        style={[
          styles.avatarContainer,
          {
            width: size + 10,
            height: size + 10,
            borderRadius: (size + 10) / 2,
            backgroundColor: pulseColor + '30',
          },
        ]}
      >
        <Image
          source={{ uri: uri || `https://ui-avatars.com/api/?name=User&size=${size}&background=random` }}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    backgroundColor: COLORS.glassBg,
  },
});

export default CallAvatar;
