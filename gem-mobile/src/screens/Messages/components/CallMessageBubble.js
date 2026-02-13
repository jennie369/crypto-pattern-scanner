/**
 * Gemral - Call Message Bubble Component
 * Renders call events inline in chat timeline (like Facebook/Messenger)
 *
 * Features:
 * - Call type icon (audio/video)
 * - Call status display (ended, missed, declined, cancelled)
 * - Duration for completed calls
 * - Different text for caller vs callee
 * - Tap to return call
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const CallMessageBubble = memo(({
  message,
  isOwn, // true if current user sent this message (was the caller)
  currentUserId,
  onCallBack, // optional callback to initiate a return call
}) => {
  // Parse call data from message content
  let callData = {};
  try {
    callData = message.content ? JSON.parse(message.content) : {};
  } catch (e) {
    // Content might be plain text for older messages
    callData = {};
  }

  const {
    call_type = 'audio', // 'audio' or 'video'
    call_status = 'ended', // 'ended', 'missed', 'declined', 'cancelled'
    duration = 0, // in seconds
    end_reason = null,
  } = callData;

  // Determine if current user was the caller
  const wasCaller = message.sender_id === currentUserId;

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds || seconds < 1) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Get icon name based on call type and status
  const getIconName = () => {
    if (call_status === 'missed' && !wasCaller) {
      return call_type === 'video' ? 'videocam-off' : 'call';
    }
    if (call_status === 'declined') {
      return 'call';
    }
    return call_type === 'video' ? 'videocam' : 'call';
  };

  // Get icon color based on status
  const getIconColor = () => {
    if (call_status === 'missed' || call_status === 'declined' || call_status === 'cancelled') {
      return COLORS.error || '#FF5252';
    }
    return COLORS.success || '#4CAF50';
  };

  // Get call status text
  const getStatusText = () => {
    const callTypeLabel = call_type === 'video' ? 'Video call' : 'Voice call';

    switch (call_status) {
      case 'missed':
        if (wasCaller) {
          return `${callTypeLabel} - No answer`;
        }
        return `Missed ${callTypeLabel.toLowerCase()}`;

      case 'declined':
        if (wasCaller) {
          return `${callTypeLabel} - Declined`;
        }
        return `${callTypeLabel} - You declined`;

      case 'cancelled':
        if (wasCaller) {
          return `${callTypeLabel} - Cancelled`;
        }
        return `Missed ${callTypeLabel.toLowerCase()}`;

      case 'ended':
      default:
        const durationStr = formatDuration(duration);
        if (durationStr) {
          return `${callTypeLabel} - ${durationStr}`;
        }
        return callTypeLabel;
    }
  };

  // Get secondary text (who initiated)
  const getSecondaryText = () => {
    if (wasCaller) {
      return call_status === 'ended' && duration > 0 ? 'Outgoing' : '';
    }
    return call_status === 'ended' && duration > 0 ? 'Incoming' : '';
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle tap to call back
  const handlePress = useCallback(() => {
    if (onCallBack && (call_status === 'missed' || call_status === 'declined' || call_status === 'cancelled')) {
      onCallBack(call_type);
    }
  }, [onCallBack, call_status, call_type]);

  const isMissedOrDeclined = call_status === 'missed' || call_status === 'declined' || call_status === 'cancelled';
  const showCallBack = isMissedOrDeclined && !wasCaller && onCallBack;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.callBubble,
          isMissedOrDeclined && styles.callBubbleMissed,
        ]}
        onPress={handlePress}
        activeOpacity={showCallBack ? 0.7 : 1}
        disabled={!showCallBack}
      >
        {/* Call Icon */}
        <View style={[
          styles.iconContainer,
          isMissedOrDeclined && styles.iconContainerMissed,
        ]}>
          <Ionicons
            name={getIconName()}
            size={20}
            color={getIconColor()}
          />
          {isMissedOrDeclined && !wasCaller && (
            <View style={styles.missedIndicator}>
              <Ionicons name="arrow-down" size={10} color={COLORS.error || '#FF5252'} />
            </View>
          )}
        </View>

        {/* Call Info */}
        <View style={styles.callInfo}>
          <Text style={[
            styles.statusText,
            isMissedOrDeclined && styles.statusTextMissed,
          ]}>
            {getStatusText()}
          </Text>
          {getSecondaryText() ? (
            <Text style={styles.secondaryText}>{getSecondaryText()}</Text>
          ) : null}
        </View>

        {/* Time */}
        <Text style={styles.timeText}>
          {formatTime(message.created_at)}
        </Text>

        {/* Call back button for missed calls */}
        {showCallBack && (
          <View style={styles.callBackButton}>
            <Ionicons
              name={call_type === 'video' ? 'videocam' : 'call'}
              size={16}
              color={COLORS.cyan}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});

CallMessageBubble.displayName = 'CallMessageBubble';

export default CallMessageBubble;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  callBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.7)',
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    maxWidth: '85%',
    gap: SPACING.sm,
  },

  callBubbleMissed: {
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  iconContainerMissed: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },

  missedIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(15, 16, 48, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  callInfo: {
    flex: 1,
    marginRight: SPACING.xs,
  },

  statusText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },

  statusTextMissed: {
    color: COLORS.error || '#FF5252',
  },

  secondaryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  timeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  callBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
});
