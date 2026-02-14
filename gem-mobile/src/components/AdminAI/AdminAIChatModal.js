/**
 * GEM AI Trading Brain - Chat Modal Component
 * Full chat interface for admin AI assistant
 * Features: text input, voice-to-text (Whisper API), quick actions
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import { Brain, X, Send, Shield, Mic, Square, Loader } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { LinearGradient } from 'expo-linear-gradient';

import AdminAIContextBar from './AdminAIContextBar';
import AdminAIQuickActions from './AdminAIQuickActions';
import AdminAIMessageBubble from './AdminAIMessageBubble';
import TypingIndicator from '../../screens/GemMaster/components/TypingIndicator';

import { adminAIChatService, adminAIContextService } from '../../services/adminAI';
import { getSession, SUPABASE_URL } from '../../services/supabase';

const TRANSCRIBE_URL = `${SUPABASE_URL}/functions/v1/transcribe-audio`;

const AdminAIChatModal = ({
  visible,
  onClose,
  // Context props
  symbol = 'BTCUSDT',
  timeframe = '4h',
  currentPrice,
  priceChange,
  patterns = [],
  zones = [],
  scanResults = [],
  userId,
}) => {
  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [trend, setTrend] = useState(null);
  const [positions, setPositions] = useState([]);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState(-1); // -1 = all positions

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Refs
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const recordingRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // ═══════════════════════════════════════════════════════════
  // CONTEXT BUILDING
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (visible) {
      buildContext();
    }
  }, [visible, symbol, timeframe, currentPrice, patterns, zones]);

  // Cleanup recording on unmount or modal close
  useEffect(() => {
    if (!visible) {
      stopRecordingCleanup();
    }
    return () => stopRecordingCleanup();
  }, [visible]);

  const stopRecordingCleanup = async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        // Already stopped
      }
      recordingRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const buildContext = async () => {
    try {
      console.log('[AdminAIChatModal] buildContext with:', {
        symbol, timeframe, currentPrice,
        patternsCount: patterns?.length, zonesCount: zones?.length,
      });

      const ctx = await adminAIContextService.buildContext({
        symbol,
        timeframe,
        currentPrice,
        patterns,
        zones,
        scanResults,
        userId,
        types: ['market', 'pattern', 'zone', 'position'],
      });

      setContext(ctx);
      setTrend(ctx.market?.trend);

      // Store positions for the selector
      if (ctx.position?.positions?.length > 0) {
        setPositions(ctx.position.positions);
        console.log('[AdminAIChatModal] Positions loaded:', ctx.position.positions.length);
      }
    } catch (error) {
      console.error('[AdminAIChatModal] buildContext error:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // POSITION SELECTION HELPER
  // ═══════════════════════════════════════════════════════════

  /**
   * Apply position selection filter to context
   * When a specific position is selected, highlight it in the context
   */
  const applyPositionFilter = useCallback((ctx) => {
    if (!ctx?.position?.positions || selectedPositionIndex < 0) return ctx;

    const selectedPos = ctx.position.positions[selectedPositionIndex];
    if (!selectedPos) return ctx;

    // Add focused position info to context
    return {
      ...ctx,
      position: {
        ...ctx.position,
        focusedPosition: selectedPos,
        focusedPositionIndex: selectedPositionIndex,
      },
    };
  }, [selectedPositionIndex]);

  // ═══════════════════════════════════════════════════════════
  // MESSAGE HANDLING
  // ═══════════════════════════════════════════════════════════

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Build fresh context
      let freshContext = await adminAIContextService.buildContext({
        symbol,
        timeframe,
        currentPrice,
        patterns,
        zones,
        scanResults,
        userId,
        types: ['market', 'pattern', 'zone', 'position'],
      });

      // Update positions list
      if (freshContext.position?.positions?.length > 0) {
        setPositions(freshContext.position.positions);
      }

      // Apply position selection filter
      freshContext = applyPositionFilter(freshContext);

      // Send to AI
      const response = await adminAIChatService.sendMessage(text.trim(), freshContext);

      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        actions: response.actions,
        source: response.source,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('[AdminAIChatModal] sendMessage error:', error);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${error.message}\n\nVui lòng thử lại.`,
        source: 'error',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [loading, symbol, timeframe, currentPrice, patterns, zones, scanResults, userId, applyPositionFilter]);

  // ═══════════════════════════════════════════════════════════
  // VOICE RECORDING
  // ═══════════════════════════════════════════════════════════

  const startRecording = useCallback(async () => {
    try {
      // Request permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('[AdminAIChat] Microphone permission denied');
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
      });
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      console.log('[AdminAIChat] Recording started');
    } catch (error) {
      console.error('[AdminAIChat] startRecording error:', error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Stop timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      setIsRecording(false);
      setIsTranscribing(true);

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      if (!uri) {
        console.error('[AdminAIChat] No recording URI');
        setIsTranscribing(false);
        return;
      }

      console.log('[AdminAIChat] Recording stopped, URI:', uri);

      // Transcribe the audio
      await transcribeAudio(uri);
    } catch (error) {
      console.error('[AdminAIChat] stopRecording error:', error);
      setIsRecording(false);
      setIsTranscribing(false);
    }
  }, []);

  const transcribeAudio = async (audioUri) => {
    try {
      const { session } = await getSession();
      if (!session?.access_token) {
        console.error('[AdminAIChat] Not authenticated for transcription');
        setIsTranscribing(false);
        return;
      }

      // Read the audio file and create FormData
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        console.error('[AdminAIChat] Audio file not found');
        setIsTranscribing(false);
        return;
      }

      // Create FormData with the audio file
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });
      formData.append('language', 'vi');
      formData.append('prompt', 'Đây là câu hỏi về trading, crypto, pattern, zone, entry, stop loss, take profit.');

      console.log('[AdminAIChat] Sending audio to Whisper API...');

      const response = await fetch(TRANSCRIBE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.transcription) {
        console.log('[AdminAIChat] Transcription:', data.transcription);
        // Put transcribed text in input field for user to review/edit
        setInputText((prev) => prev ? `${prev} ${data.transcription}` : data.transcription);
        // Focus the input so user can see and edit
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        console.error('[AdminAIChat] Transcription failed:', data.error);
      }
    } catch (error) {
      console.error('[AdminAIChat] transcribeAudio error:', error);
    } finally {
      setIsTranscribing(false);
      setRecordingDuration(0);
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ═══════════════════════════════════════════════════════════
  // QUICK ACTIONS
  // ═══════════════════════════════════════════════════════════

  const handleQuickAction = useCallback(async (actionId) => {
    if (loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      // Build context with positions
      let freshContext = await adminAIContextService.buildContext({
        symbol,
        timeframe,
        currentPrice,
        patterns,
        zones,
        scanResults,
        userId,
        types: ['market', 'pattern', 'zone', 'position'],
      });

      // Update positions list
      if (freshContext.position?.positions?.length > 0) {
        setPositions(freshContext.position.positions);
      }

      // Apply position selection filter
      freshContext = applyPositionFilter(freshContext);

      // Add quick action indicator
      const quickActionLabels = {
        analyze_pattern: '📊 Phân tích Pattern',
        check_zone: '🎯 Zone Analysis',
        entry_suggestion: '📈 Gợi ý Entry',
        position_review: '💼 Review Positions',
        risk_check: '⚠️ Kiểm tra Risk',
        predict_candle: '🕯️ Dự đoán Nến',
      };

      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: quickActionLabels[actionId] || actionId,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send quick action
      const response = await adminAIChatService.sendQuickAction(actionId, freshContext);

      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        actions: response.actions,
        source: response.source,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('[AdminAIChatModal] handleQuickAction error:', error);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${error.message}`,
        source: 'error',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [loading, symbol, timeframe, currentPrice, patterns, zones, scanResults, userId, applyPositionFilter]);

  // ═══════════════════════════════════════════════════════════
  // ACTION BUTTON HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleActionPress = useCallback((action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('[AdminAIChatModal] Action pressed:', action);

    switch (action.id) {
      case 'open_trade':
        break;
      case 'close_position':
        break;
      case 'partial_close':
        break;
      case 'move_sl':
        break;
      default:
        console.log('[AdminAIChatModal] Unknown action:', action.id);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  const renderMessage = ({ item }) => (
    <AdminAIMessageBubble
      message={item}
      onActionPress={handleActionPress}
    />
  );

  const keyExtractor = (item) => item.id;

  // Scroll to end when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Scroll to end when loading starts (typing indicator appears)
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [loading]);

  // Determine which button to show on the right
  const showSendButton = inputText.trim().length > 0;
  const canSend = inputText.trim().length > 0 && !loading;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <BlurView intensity={50} style={styles.overlay}>
          <View style={styles.container}>
            {/* Header */}
            <LinearGradient
              colors={['rgba(15, 16, 48, 0.95)', 'rgba(15, 16, 48, 0.9)']}
              style={styles.header}
            >
              <View style={styles.headerLeft}>
                <View style={styles.brainIcon}>
                  <Brain size={24} color={COLORS.gold} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>GEM AI Brain</Text>
                  <View style={styles.adminBadge}>
                    <Shield size={10} color={COLORS.gold} />
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Context Bar with Position Selector */}
            <AdminAIContextBar
              symbol={symbol}
              timeframe={timeframe}
              currentPrice={currentPrice}
              priceChange={priceChange}
              patternCount={patterns?.length || 0}
              zoneCount={zones?.length || 0}
              trend={trend}
              positions={positions}
              selectedPositionIndex={selectedPositionIndex}
              onSelectPosition={setSelectedPositionIndex}
            />

            {/* Messages List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
              ListFooterComponent={loading ? <TypingIndicator /> : null}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Brain size={48} color={COLORS.gold} style={{ opacity: 0.5 }} />
                  <Text style={styles.emptyTitle}>GEM AI Trading Brain</Text>
                  <Text style={styles.emptyText}>
                    Hỏi bất cứ điều gì về trading, pattern, zone, hoặc position của bạn.
                  </Text>
                </View>
              }
            />

            {/* Quick Actions */}
            <AdminAIQuickActions
              onActionPress={handleQuickAction}
              disabled={loading}
            />

            {/* Recording Indicator */}
            {(isRecording || isTranscribing) && (
              <View style={styles.recordingBar}>
                {isRecording ? (
                  <>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>
                      Đang ghi âm... {formatDuration(recordingDuration)}
                    </Text>
                  </>
                ) : (
                  <>
                    <ActivityIndicator size="small" color={COLORS.gold} />
                    <Text style={styles.recordingText}>Đang chuyển giọng nói thành văn bản...</Text>
                  </>
                )}
              </View>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder={isRecording ? 'Đang ghi âm...' : 'Hỏi về pattern, zone, entry...'}
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={2000}
                editable={!isRecording && !isTranscribing}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  if (canSend) {
                    sendMessage(inputText);
                  }
                }}
              />

              {/* Mic / Stop button */}
              {isRecording ? (
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopRecording}
                >
                  <Square size={18} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
                </TouchableOpacity>
              ) : isTranscribing ? (
                <View style={styles.micButtonTranscribing}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                </View>
              ) : !showSendButton ? (
                <TouchableOpacity
                  style={styles.micButton}
                  onPress={startRecording}
                  disabled={isTranscribing}
                >
                  <Mic size={20} color={COLORS.gold} />
                </TouchableOpacity>
              ) : null}

              {/* Send button - always visible when there's text */}
              {showSendButton && !isRecording && !isTranscribing && (
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !canSend && styles.sendButtonDisabled,
                  ]}
                  onPress={() => sendMessage(inputText)}
                  disabled={!canSend}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.gold} />
                  ) : (
                    <Send size={20} color={COLORS.gold} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '95%',
    backgroundColor: 'rgba(15, 16, 48, 0.97)',
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 189, 89, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  brainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 107, 0.2)',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
  },
  recordingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : 42,
    backgroundColor: 'rgba(15, 16, 48, 0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
    gap: SPACING.xs,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: COLORS.inputBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonTranscribing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 107, 107, 0.25)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderColor: COLORS.textMuted,
  },
});

export default AdminAIChatModal;
