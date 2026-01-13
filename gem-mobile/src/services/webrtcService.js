/**
 * WebRTC Service
 * Manages peer connection and media streams for audio/video calls
 */

// Conditional import - WebRTC is optional and requires native module
let RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices;
let WEBRTC_AVAILABLE = false;

try {
  const webrtc = require('react-native-webrtc');
  RTCPeerConnection = webrtc.RTCPeerConnection;
  RTCIceCandidate = webrtc.RTCIceCandidate;
  RTCSessionDescription = webrtc.RTCSessionDescription;
  mediaDevices = webrtc.mediaDevices;
  WEBRTC_AVAILABLE = true;
  console.log('[WebRTC] Module loaded successfully');
} catch (error) {
  console.log('[WebRTC] Module not available - calls disabled:', error.message);
  // Mock classes for type safety
  RTCPeerConnection = class { close() {} };
  RTCIceCandidate = class {};
  RTCSessionDescription = class {};
  mediaDevices = { getUserMedia: () => Promise.reject(new Error('WebRTC not available')) };
}

import { Audio } from 'expo-av';
import {
  ICE_SERVERS,
  MEDIA_CONSTRAINTS,
  CONNECTION_QUALITY,
  CONNECTION_QUALITY_THRESHOLDS,
} from '../constants/callConstants';

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;

    // Callbacks
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.onIceCandidate = null;
    this.onConnectionQualityChange = null;
    this.onError = null;

    // State
    this.isInitialized = false;
    this.isMuted = false;
    this.isVideoEnabled = false;
    this.isSpeakerOn = false;
    this.isFrontCamera = true;

    // Quality monitoring
    this.statsInterval = null;
    this.lastStats = null;

    // Check if WebRTC native module is available
    this.isAvailable = WEBRTC_AVAILABLE;
  }

  /**
   * Check if WebRTC is available
   * @returns {boolean}
   */
  checkAvailable() {
    if (!WEBRTC_AVAILABLE) {
      console.warn('[WebRTC] Service not available - need to build with expo-dev-client');
      return false;
    }
    return true;
  }

  // ========== INITIALIZATION ==========

  /**
   * Khởi tạo local media stream
   * @param {boolean} withVideo - Có bật video không
   * @returns {Promise<MediaStream>}
   */
  async initLocalStream(withVideo = false) {
    if (!this.checkAvailable()) {
      throw new Error('WebRTC không khả dụng. Vui lòng build app với expo-dev-client.');
    }

    try {
      console.log('[WebRTC] Initializing local stream, video:', withVideo);

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true,
      });

      const constraints = withVideo
        ? MEDIA_CONSTRAINTS.AUDIO_VIDEO
        : MEDIA_CONSTRAINTS.AUDIO_ONLY;

      this.localStream = await mediaDevices.getUserMedia(constraints);
      this.isVideoEnabled = withVideo;

      console.log('[WebRTC] Local stream initialized, tracks:',
        this.localStream.getTracks().map(t => t.kind));

      return this.localStream;
    } catch (error) {
      console.error('[WebRTC] Failed to get local stream:', error);
      this.onError?.('permission_denied', error.message);
      throw error;
    }
  }

  /**
   * Tạo peer connection
   * @returns {RTCPeerConnection}
   */
  createPeerConnection() {
    try {
      console.log('[WebRTC] Creating peer connection');

      this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          console.log('[WebRTC] Adding local track:', track.kind);
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      // Setup event handlers
      this._setupPeerConnectionHandlers();

      this.isInitialized = true;
      return this.peerConnection;

    } catch (error) {
      console.error('[WebRTC] Failed to create peer connection:', error);
      this.onError?.('connection_error', error.message);
      throw error;
    }
  }

  /**
   * Setup peer connection event handlers
   * @private
   */
  _setupPeerConnectionHandlers() {
    // Handle remote tracks
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind);

      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStream?.(this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] New ICE candidate');
        this.onIceCandidate?.(event.candidate.toJSON());
      }
    };

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection.iceConnectionState;
      console.log('[WebRTC] ICE connection state:', state);

      switch (state) {
        case 'connected':
        case 'completed':
          this._startQualityMonitoring();
          this.onConnectionStateChange?.('connected');
          break;
        case 'disconnected':
          this.onConnectionStateChange?.('reconnecting');
          break;
        case 'failed':
          this.onConnectionStateChange?.('failed');
          this.onError?.('ice_connection_failed', 'ICE connection failed');
          break;
        case 'closed':
          this._stopQualityMonitoring();
          break;
      }
    };

    // Handle connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log('[WebRTC] Connection state:', state);
      this.onConnectionStateChange?.(state);
    };

    // Handle negotiation needed
    this.peerConnection.onnegotiationneeded = () => {
      console.log('[WebRTC] Negotiation needed');
    };

    // Handle ICE gathering state
    this.peerConnection.onicegatheringstatechange = () => {
      console.log('[WebRTC] ICE gathering state:',
        this.peerConnection.iceGatheringState);
    };
  }

  // ========== CALL INITIATION (CALLER) ==========

  /**
   * Tạo offer (Caller)
   * @returns {Promise<{type: string, sdp: string}>}
   */
  async createOffer() {
    try {
      console.log('[WebRTC] Creating offer');

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.isVideoEnabled,
      });

      await this.peerConnection.setLocalDescription(offer);

      console.log('[WebRTC] Offer created and set as local description');

      return {
        type: offer.type,
        sdp: offer.sdp,
      };
    } catch (error) {
      console.error('[WebRTC] Failed to create offer:', error);
      throw error;
    }
  }

  // ========== CALL ANSWERING (CALLEE) ==========

  /**
   * Set remote offer và tạo answer (Callee)
   * @param {Object} offer - SDP offer từ caller
   * @returns {Promise<{type: string, sdp: string}>}
   */
  async handleOffer(offer) {
    try {
      console.log('[WebRTC] Handling offer');

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({
          type: 'offer',
          sdp: offer.sdp,
        })
      );

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      console.log('[WebRTC] Answer created and set as local description');

      return {
        type: answer.type,
        sdp: answer.sdp,
      };
    } catch (error) {
      console.error('[WebRTC] Failed to handle offer:', error);
      throw error;
    }
  }

  /**
   * Set remote answer (Caller receives answer)
   * @param {Object} answer - SDP answer từ callee
   */
  async handleAnswer(answer) {
    try {
      console.log('[WebRTC] Handling answer');

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({
          type: 'answer',
          sdp: answer.sdp,
        })
      );

      console.log('[WebRTC] Remote description set');
    } catch (error) {
      console.error('[WebRTC] Failed to handle answer:', error);
      throw error;
    }
  }

  // ========== ICE CANDIDATES ==========

  /**
   * Thêm ICE candidate
   * @param {Object} candidate - ICE candidate
   */
  async addIceCandidate(candidate) {
    try {
      if (this.peerConnection && candidate) {
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
        console.log('[WebRTC] ICE candidate added');
      }
    } catch (error) {
      console.error('[WebRTC] Failed to add ICE candidate:', error);
      // Non-fatal error, continue
    }
  }

  // ========== MEDIA CONTROLS ==========

  /**
   * Toggle mute
   * @param {boolean} mute - true = mute, false = unmute
   */
  toggleMute(mute) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !mute;
      });
      this.isMuted = mute;
      console.log('[WebRTC] Mute toggled:', mute);
    }
  }

  /**
   * Toggle video
   * @param {boolean} enable - true = enable, false = disable
   */
  toggleVideo(enable) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enable;
      });
      this.isVideoEnabled = enable;
      console.log('[WebRTC] Video toggled:', enable);
    }
  }

  /**
   * Toggle speaker/earpiece
   * @param {boolean} useSpeaker - true = speaker, false = earpiece
   */
  async toggleSpeaker(useSpeaker) {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !useSpeaker,
      });
      this.isSpeakerOn = useSpeaker;
      console.log('[WebRTC] Speaker toggled:', useSpeaker);
    } catch (error) {
      console.error('[WebRTC] Failed to toggle speaker:', error);
    }
  }

  /**
   * Switch camera (front/back)
   * @returns {Promise<boolean|null>} - Returns isFrontCamera or null on failure
   */
  async switchCamera() {
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack._switchCamera === 'function') {
          await videoTrack._switchCamera();
          this.isFrontCamera = !this.isFrontCamera;
          console.log('[WebRTC] Camera switched, front:', this.isFrontCamera);
          return this.isFrontCamera;
        }
      }
      return null;
    } catch (error) {
      console.error('[WebRTC] Failed to switch camera:', error);
      return null;
    }
  }

  // ========== VIDEO SPECIFIC METHODS ==========

  /**
   * Bật/tắt video stream
   * @param {boolean} enable - true = bật video
   * @returns {Promise<boolean>}
   */
  async enableVideo(enable) {
    try {
      if (enable) {
        // Check if video track exists
        const videoTracks = this.localStream?.getVideoTracks() || [];

        if (videoTracks.length > 0) {
          // Enable existing track
          videoTracks.forEach(track => {
            track.enabled = true;
          });
        } else {
          // Add new video track
          const videoStream = await mediaDevices.getUserMedia({
            video: MEDIA_CONSTRAINTS.AUDIO_VIDEO.video,
          });

          const videoTrack = videoStream.getVideoTracks()[0];

          // Add to local stream
          this.localStream?.addTrack(videoTrack);

          // Add to peer connection
          const sender = this.peerConnection?.getSenders().find(
            s => s.track?.kind === 'video'
          );

          if (sender) {
            await sender.replaceTrack(videoTrack);
          } else {
            this.peerConnection?.addTrack(videoTrack, this.localStream);
          }
        }

        this.isVideoEnabled = true;
      } else {
        // Disable video tracks
        this.localStream?.getVideoTracks().forEach(track => {
          track.enabled = false;
        });

        this.isVideoEnabled = false;
      }

      console.log('[WebRTC] Video enabled:', enable);
      return true;

    } catch (error) {
      console.error('[WebRTC] enableVideo error:', error);
      return false;
    }
  }

  /**
   * Get video stats
   * @returns {Promise<Object|null>}
   */
  async getVideoStats() {
    try {
      if (!this.peerConnection) return null;

      const stats = await this.peerConnection.getStats();
      let videoStats = null;

      stats.forEach(report => {
        if (report.type === 'outbound-rtp' && report.kind === 'video') {
          videoStats = {
            frameWidth: report.frameWidth,
            frameHeight: report.frameHeight,
            framesPerSecond: report.framesPerSecond,
            bytesSent: report.bytesSent,
            packetsSent: report.packetsSent,
          };
        }
      });

      return videoStats;
    } catch (error) {
      console.error('[WebRTC] getVideoStats error:', error);
      return null;
    }
  }

  /**
   * Set video quality based on network
   * @param {string} quality - 'high' | 'medium' | 'low'
   */
  async setVideoQuality(quality) {
    try {
      const videoSender = this.peerConnection?.getSenders().find(
        s => s.track?.kind === 'video'
      );

      if (!videoSender) return;

      const params = videoSender.getParameters();

      if (!params.encodings || params.encodings.length === 0) {
        params.encodings = [{}];
      }

      switch (quality) {
        case 'high':
          params.encodings[0].maxBitrate = 2500000; // 2.5 Mbps
          params.encodings[0].maxFramerate = 30;
          break;
        case 'medium':
          params.encodings[0].maxBitrate = 1000000; // 1 Mbps
          params.encodings[0].maxFramerate = 24;
          break;
        case 'low':
          params.encodings[0].maxBitrate = 500000; // 500 Kbps
          params.encodings[0].maxFramerate = 15;
          break;
      }

      await videoSender.setParameters(params);
      console.log('[WebRTC] Video quality set:', quality);

    } catch (error) {
      console.error('[WebRTC] setVideoQuality error:', error);
    }
  }

  /**
   * Get local stream
   * @returns {MediaStream|null}
   */
  getLocalStream() {
    return this.localStream;
  }

  /**
   * Get remote stream
   * @returns {MediaStream|null}
   */
  getRemoteStream() {
    return this.remoteStream;
  }

  // ========== QUALITY MONITORING ==========

  /**
   * Start monitoring connection quality
   * @private
   */
  _startQualityMonitoring() {
    if (this.statsInterval) return;

    this.statsInterval = setInterval(async () => {
      try {
        if (!this.peerConnection) return;

        const stats = await this.peerConnection.getStats();
        let rtt = null;

        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            rtt = report.currentRoundTripTime * 1000; // Convert to ms
          }
        });

        if (rtt !== null) {
          const quality = this._getQualityFromRTT(rtt);
          if (quality !== this.lastStats?.quality) {
            this.lastStats = { rtt, quality };
            this.onConnectionQualityChange?.(quality);
          }
        }
      } catch (error) {
        console.error('[WebRTC] Stats error:', error);
      }
    }, 3000); // Check every 3 seconds
  }

  /**
   * Stop monitoring connection quality
   * @private
   */
  _stopQualityMonitoring() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  /**
   * Get quality level from RTT
   * @param {number} rtt - Round trip time in ms
   * @returns {string} Quality level
   * @private
   */
  _getQualityFromRTT(rtt) {
    if (rtt <= CONNECTION_QUALITY_THRESHOLDS.EXCELLENT) {
      return CONNECTION_QUALITY.EXCELLENT;
    } else if (rtt <= CONNECTION_QUALITY_THRESHOLDS.GOOD) {
      return CONNECTION_QUALITY.GOOD;
    } else if (rtt <= CONNECTION_QUALITY_THRESHOLDS.FAIR) {
      return CONNECTION_QUALITY.FAIR;
    } else if (rtt <= CONNECTION_QUALITY_THRESHOLDS.POOR) {
      return CONNECTION_QUALITY.POOR;
    }
    return CONNECTION_QUALITY.BAD;
  }

  // ========== CLEANUP ==========

  /**
   * Cleanup resources
   */
  cleanup() {
    console.log('[WebRTC] Cleaning up...');

    // Stop quality monitoring
    this._stopQualityMonitoring();

    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Reset state
    this.remoteStream = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.isVideoEnabled = false;
    this.isSpeakerOn = false;
    this.lastStats = null;

    // Reset callbacks
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.onIceCandidate = null;
    this.onConnectionQualityChange = null;
    this.onError = null;

    console.log('[WebRTC] Cleanup complete');
  }

  // ========== GETTERS ==========

  /**
   * Get current mute state
   * @returns {boolean}
   */
  getMuteState() {
    return this.isMuted;
  }

  /**
   * Get current video state
   * @returns {boolean}
   */
  getVideoState() {
    return this.isVideoEnabled;
  }

  /**
   * Get current speaker state
   * @returns {boolean}
   */
  getSpeakerState() {
    return this.isSpeakerOn;
  }

  /**
   * Check if initialized
   * @returns {boolean}
   */
  getInitializedState() {
    return this.isInitialized;
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
export default webrtcService;
