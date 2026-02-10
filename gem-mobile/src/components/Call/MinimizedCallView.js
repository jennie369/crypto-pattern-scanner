/**
 * MinimizedCallView Component
 * Floating bubble when video call is minimized
 */

import React, { memo, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from 'react-native';
import { Maximize2, PhoneOff, User } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

// Try to import RTCView - may not be available
let RTCView = null;
try {
  RTCView = require('react-native-webrtc').RTCView;
} catch (e) {
  console.log('[MinimizedCallView] react-native-webrtc not installed');
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_SIZE = { width: 100, height: 140 };
const INITIAL_POSITION = { x: SCREEN_WIDTH - BUBBLE_SIZE.width - 16, y: 100 };

/**
 * MinimizedCallView Component
 * Floating bubble khi minimize video call
 * @param {Object} props
 * @param {MediaStream} props.stream - Video stream to display
 * @param {string} props.callDuration - Formatted call duration
 * @param {string} props.userName - Other user's name
 * @param {string} props.userAvatar - Other user's avatar
 * @param {Function} props.onMaximize - Maximize handler
 * @param {Function} props.onEndCall - End call handler
 */
const MinimizedCallView = memo(({
  stream,
  callDuration,
  userName,
  userAvatar,
  onMaximize,
  onEndCall,
}) => {
  const [position] = useState(new Animated.ValueXY(INITIAL_POSITION));

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Allow drag only if moved more than 5px
        return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
      },
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        position.flattenOffset();

        // Snap to edges
        const finalX = gesture.moveX < SCREEN_WIDTH / 2
          ? 16
          : SCREEN_WIDTH - BUBBLE_SIZE.width - 16;

        // Constrain Y
        let finalY = position.y._value;
        finalY = Math.max(100, Math.min(finalY, SCREEN_HEIGHT - BUBBLE_SIZE.height - 100));

        Animated.spring(position, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          friction: 5,
        }).start();
      },
    })
  ).current;

  const renderContent = () => {
    if (stream && RTCView) {
      return (
        <RTCView
          streamURL={stream.toURL()}
          style={styles.video}
          objectFit="cover"
          zOrder={2}
        />
      );
    }

    // Fallback to avatar
    return (
      <View style={styles.placeholder}>
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={40} color={COLORS.textMuted} />
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Video or Avatar */}
      {renderContent()}

      {/* Duration Badge */}
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{callDuration}</Text>
      </View>

      {/* Actions Overlay */}
      <View style={styles.actionsOverlay}>
        {/* Maximize */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMaximize}
          activeOpacity={0.7}
        >
          <Maximize2 size={16} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* End Call */}
        <TouchableOpacity
          style={[styles.actionButton, styles.endButton]}
          onPress={onEndCall}
          activeOpacity={0.7}
        >
          <PhoneOff size={16} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: BUBBLE_SIZE.width,
    height: BUBBLE_SIZE.height,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.bgDarkest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  actionsOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: COLORS.error,
  },
});

MinimizedCallView.displayName = 'MinimizedCallView';

export default MinimizedCallView;
