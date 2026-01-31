/**
 * Call System Constants
 * Gem Mobile - Audio/Video Call Feature
 */

// ========== CALL STATES ==========
export const CALL_STATUS = {
  INITIATING: 'initiating',
  RINGING: 'ringing',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ENDED: 'ended',
  MISSED: 'missed',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  BUSY: 'busy',
};

export const PARTICIPANT_STATUS = {
  INVITED: 'invited',
  RINGING: 'ringing',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  LEFT: 'left',
  DECLINED: 'declined',
  MISSED: 'missed',
  BUSY: 'busy',
  CANCELLED: 'cancelled', // Call was cancelled before being answered
};

export const PARTICIPANT_ROLE = {
  CALLER: 'caller',
  CALLEE: 'callee',
  PARTICIPANT: 'participant',
};

// ========== CALL TYPES ==========
export const CALL_TYPE = {
  AUDIO: 'audio',
  VIDEO: 'video',
};

// ========== TIMEOUTS (milliseconds) ==========
export const CALL_TIMEOUTS = {
  RING_TIMEOUT: 60000,         // 60s - Timeout khi đổ chuông
  CONNECTION_TIMEOUT: 30000,   // 30s - Timeout khi kết nối
  RECONNECT_TIMEOUT: 15000,    // 15s - Timeout khi reconnect
  ICE_GATHERING_TIMEOUT: 10000, // 10s - ICE gathering timeout
  CALL_ENDED_DISPLAY: 3000,    // 3s - Hiển thị màn hình kết thúc
};

// ========== ICE SERVERS ==========
export const ICE_SERVERS = {
  iceServers: [
    // Google STUN servers (miễn phí)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },

    // TODO: Thêm TURN server cho production
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password',
    // },
  ],
  iceCandidatePoolSize: 10,
};

// ========== MEDIA CONSTRAINTS ==========
export const MEDIA_CONSTRAINTS = {
  AUDIO_ONLY: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  },
  AUDIO_VIDEO: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: {
      facingMode: 'user',
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 30 },
    },
  },
};

// ========== CONNECTION QUALITY ==========
export const CONNECTION_QUALITY = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  BAD: 'bad',
};

export const CONNECTION_QUALITY_THRESHOLDS = {
  // Based on RTT (Round Trip Time) in ms
  EXCELLENT: 100,
  GOOD: 200,
  FAIR: 400,
  POOR: 800,
  // Above 800ms = BAD
};

export const CONNECTION_QUALITY_BARS = {
  [CONNECTION_QUALITY.EXCELLENT]: 5,
  [CONNECTION_QUALITY.GOOD]: 4,
  [CONNECTION_QUALITY.FAIR]: 3,
  [CONNECTION_QUALITY.POOR]: 2,
  [CONNECTION_QUALITY.BAD]: 1,
};

// ========== SIGNAL TYPES ==========
export const SIGNAL_TYPE = {
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice-candidate',
  END: 'end',
  MUTE: 'mute',
  UNMUTE: 'unmute',
  VIDEO_ON: 'video-on',
  VIDEO_OFF: 'video-off',
  RECONNECT: 'reconnect',
  BUSY: 'busy',
  READY: 'ready', // Callee sends this when ready to receive offer
};

// ========== END REASONS ==========
export const END_REASON = {
  CALLER_ENDED: 'caller_ended',
  CALLEE_ENDED: 'callee_ended',
  CONNECTION_FAILED: 'connection_failed',
  NO_ANSWER: 'no_answer',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
  BUSY: 'busy',
  NETWORK_ERROR: 'network_error',
  NORMAL: 'normal',
};

// ========== EVENT TYPES ==========
export const CALL_EVENT_TYPE = {
  // Call lifecycle
  CALL_INITIATED: 'call_initiated',
  CALL_RINGING: 'call_ringing',
  CALL_ANSWERED: 'call_answered',
  CALL_DECLINED: 'call_declined',
  CALL_MISSED: 'call_missed',
  CALL_CANCELLED: 'call_cancelled',
  CALL_CONNECTED: 'call_connected',
  CALL_ENDED: 'call_ended',
  CALL_FAILED: 'call_failed',

  // Participant events
  PARTICIPANT_JOINED: 'participant_joined',
  PARTICIPANT_LEFT: 'participant_left',
  PARTICIPANT_INVITED: 'participant_invited',

  // Media events
  MUTE_TOGGLED: 'mute_toggled',
  VIDEO_TOGGLED: 'video_toggled',
  SPEAKER_TOGGLED: 'speaker_toggled',
  SCREEN_SHARE_STARTED: 'screen_share_started',
  SCREEN_SHARE_STOPPED: 'screen_share_stopped',
  CAMERA_SWITCHED: 'camera_switched',

  // Connection events
  CONNECTION_QUALITY_CHANGED: 'connection_quality_changed',
  NETWORK_TYPE_CHANGED: 'network_type_changed',
  RECONNECTING: 'reconnecting',
  RECONNECTED: 'reconnected',
  ICE_CANDIDATE_ADDED: 'ice_candidate_added',
  ICE_CONNECTION_FAILED: 'ice_connection_failed',

  // Error events
  PERMISSION_DENIED: 'permission_denied',
  MEDIA_ERROR: 'media_error',
  SIGNALING_ERROR: 'signaling_error',
};

// ========== VIBRATION PATTERNS ==========
export const VIBRATION_PATTERNS = {
  INCOMING_CALL: [0, 1000, 500, 1000, 500, 1000, 500], // Loop: vibrate 1s, pause 0.5s
  CALL_CONNECTED: [0, 100],
  CALL_ENDED: [0, 200, 100, 200],
};

// ========== UI CONSTANTS ==========
export const CALL_UI = {
  AVATAR_SIZE_LARGE: 140,
  AVATAR_SIZE_MEDIUM: 100,
  AVATAR_SIZE_SMALL: 60,
  CONTROL_BUTTON_SIZE: 60,
  END_BUTTON_SIZE: 70,
  PULSE_ANIMATION_DURATION: 1500,
  RING_ANIMATION_DURATION: 800,
  // Video call specific
  LOCAL_VIDEO_WIDTH: 120,
  LOCAL_VIDEO_HEIGHT: 160,
  MINIMIZED_BUBBLE_WIDTH: 100,
  MINIMIZED_BUBBLE_HEIGHT: 140,
  CONTROLS_HIDE_DELAY: 4000, // Auto-hide controls after 4 seconds
};

// ========== VIDEO QUALITY ==========
export const VIDEO_QUALITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  AUTO: 'auto',
};

export const VIDEO_QUALITY_SETTINGS = {
  [VIDEO_QUALITY.HIGH]: {
    maxBitrate: 2500000, // 2.5 Mbps
    maxFrameRate: 30,
    width: 1280,
    height: 720,
  },
  [VIDEO_QUALITY.MEDIUM]: {
    maxBitrate: 1000000, // 1 Mbps
    maxFrameRate: 24,
    width: 854,
    height: 480,
  },
  [VIDEO_QUALITY.LOW]: {
    maxBitrate: 500000, // 500 Kbps
    maxFrameRate: 15,
    width: 640,
    height: 360,
  },
};

// ========== TOOLTIPS ==========
export const CALL_TOOLTIPS = {
  MUTE: 'Nhấn để tắt/bật micro',
  SPEAKER: 'Nhấn để chuyển loa ngoài/trong',
  VIDEO: 'Nhấn để bật camera (chuyển sang video call)',
  END: 'Nhấn để kết thúc cuộc gọi',
  ACCEPT: 'Nhấn để trả lời',
  DECLINE: 'Nhấn để từ chối',
  SWITCH_CAMERA: 'Nhấn để chuyển camera trước/sau',
  CONNECTION_QUALITY: {
    [CONNECTION_QUALITY.EXCELLENT]: 'Kết nối rất tốt',
    [CONNECTION_QUALITY.GOOD]: 'Kết nối tốt',
    [CONNECTION_QUALITY.FAIR]: 'Kết nối trung bình',
    [CONNECTION_QUALITY.POOR]: 'Kết nối yếu',
    [CONNECTION_QUALITY.BAD]: 'Kết nối rất yếu',
  },
};

// ========== STATUS DISPLAY TEXT ==========
export const CALL_STATUS_TEXT = {
  [CALL_STATUS.INITIATING]: 'Đang khởi tạo...',
  [CALL_STATUS.RINGING]: 'Đang gọi...',
  [CALL_STATUS.CONNECTING]: 'Đang kết nối...',
  [CALL_STATUS.CONNECTED]: 'Đang trong cuộc gọi',
  [CALL_STATUS.RECONNECTING]: 'Đang kết nối lại...',
  [CALL_STATUS.ENDED]: 'Cuộc gọi đã kết thúc',
  [CALL_STATUS.MISSED]: 'Cuộc gọi nhỡ',
  [CALL_STATUS.DECLINED]: 'Cuộc gọi bị từ chối',
  [CALL_STATUS.CANCELLED]: 'Cuộc gọi đã hủy',
  [CALL_STATUS.FAILED]: 'Không thể kết nối',
  [CALL_STATUS.BUSY]: 'Đang bận',
};

// ========== NOTIFICATION CHANNELS ==========
export const NOTIFICATION_CHANNEL = {
  INCOMING_CALL: 'incoming_call',
  MISSED_CALL: 'missed_call',
};

// ========== REALTIME CHANNEL NAMES ==========
export const getSignalingChannelName = (callId) => `call-signal:${callId}`;
export const getIncomingCallChannelName = (userId) => `incoming-calls:${userId}`;

export default {
  CALL_STATUS,
  PARTICIPANT_STATUS,
  PARTICIPANT_ROLE,
  CALL_TYPE,
  CALL_TIMEOUTS,
  ICE_SERVERS,
  MEDIA_CONSTRAINTS,
  CONNECTION_QUALITY,
  CONNECTION_QUALITY_THRESHOLDS,
  CONNECTION_QUALITY_BARS,
  SIGNAL_TYPE,
  END_REASON,
  CALL_EVENT_TYPE,
  VIBRATION_PATTERNS,
  CALL_UI,
  VIDEO_QUALITY,
  VIDEO_QUALITY_SETTINGS,
  CALL_TOOLTIPS,
  CALL_STATUS_TEXT,
  NOTIFICATION_CHANNEL,
  getSignalingChannelName,
  getIncomingCallChannelName,
};
