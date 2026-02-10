/**
 * LocalVideoView Component
 * Displays local camera preview (draggable)
 */

import React, { memo, useState, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

// Try to import RTCView - may not be available
let RTCView = null;
try {
  RTCView = require('react-native-webrtc').RTCView;
} catch (e) {
  console.log('[LocalVideoView] react-native-webrtc not installed');
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const INITIAL_POSITION = { x: SCREEN_WIDTH - 136, y: 100 };
const VIEW_SIZE = { width: 120, height: 160 };

/**
 * LocalVideoView Component
 * Hien thi camera local (draggable)
 * @param {Object} props
 * @param {MediaStream} props.stream - Local media stream
 * @param {boolean} props.isMirrored - Whether to mirror the video
 * @param {Function} props.onSwitchCamera - Camera switch handler
 * @param {Object} props.style - Additional styles
 */
const LocalVideoView = memo(({
  stream,
  isMirrored = true,
  onSwitchCamera,
  style,
}) => {
  const { colors, glass, settings, SPACING, TYPOGRAPHY } = useSettings();
  const [position] = useState(new Animated.ValueXY(INITIAL_POSITION));
  const isDragging = useRef(false);

  const styles = useMemo(() => {
    // Get BORDER_RADIUS from settings or use defaults
    const BORDER_RADIUS = { lg: 16 };

    return StyleSheet.create({
      container: {
        position: 'absolute',
        width: VIEW_SIZE.width,
        height: VIEW_SIZE.height,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        backgroundColor: colors.bgCard,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        borderWidth: 2,
        borderColor: colors.glassBorder,
      },
      video: {
        width: '100%',
        height: '100%',
      },
      switchButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
    });
  }, [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start drag if moved more than 5px
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
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
      onPanResponderRelease: (_, gestureState) => {
        position.flattenOffset();
        isDragging.current = false;

        // Snap to edges
        const finalX = gestureState.moveX < SCREEN_WIDTH / 2
          ? 16
          : SCREEN_WIDTH - VIEW_SIZE.width - 16;

        // Constrain Y within safe area
        let finalY = position.y._value;
        finalY = Math.max(60, Math.min(finalY, SCREEN_HEIGHT - VIEW_SIZE.height - 120));

        Animated.spring(position, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          friction: 6,
          tension: 100,
        }).start();
      },
    })
  ).current;

  if (!stream || !RTCView) {
    return null;
  }

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
        style,
      ]}
      {...panResponder.panHandlers}
    >
      <RTCView
        streamURL={stream.toURL()}
        style={styles.video}
        objectFit="cover"
        mirror={isMirrored}
        zOrder={1}
      />

      {/* Switch Camera Button */}
      {onSwitchCamera && (
        <TouchableOpacity
          style={styles.switchButton}
          onPress={onSwitchCamera}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <RotateCcw size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

LocalVideoView.displayName = 'LocalVideoView';

export default LocalVideoView;
