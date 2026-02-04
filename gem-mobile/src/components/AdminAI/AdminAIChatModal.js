/**
 * GEM AI Trading Brain - Chat Modal Component
 * Full chat interface for admin AI assistant
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
import * as Haptics from 'expo-haptics';
import { Brain, X, Send, Shield } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { LinearGradient } from 'expo-linear-gradient';

import AdminAIContextBar from './AdminAIContextBar';
import AdminAIQuickActions from './AdminAIQuickActions';
import AdminAIMessageBubble from './AdminAIMessageBubble';

import { adminAIChatService, adminAIContextService } from '../../services/adminAI';

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

  // Refs
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // ═══════════════════════════════════════════════════════════
  // CONTEXT BUILDING
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (visible) {
      buildContext();
    }
  }, [visible, symbol, timeframe, currentPrice, patterns, zones]);

  const buildContext = async () => {
    try {
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
    } catch (error) {
      console.error('[AdminAIChatModal] buildContext error:', error);
    }
  };

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
      const freshContext = await adminAIContextService.buildContext({
        symbol,
        timeframe,
        currentPrice,
        patterns,
        zones,
        scanResults,
        userId,
        types: ['market', 'pattern', 'zone', 'position'],
      });

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

      // Add error message
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
  }, [loading, symbol, timeframe, currentPrice, patterns, zones, scanResults, userId]);

  // ═══════════════════════════════════════════════════════════
  // QUICK ACTIONS
  // ═══════════════════════════════════════════════════════════

  const handleQuickAction = useCallback(async (actionId) => {
    if (loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      // Build context with positions
      const freshContext = await adminAIContextService.buildContext({
        symbol,
        timeframe,
        currentPrice,
        patterns,
        zones,
        scanResults,
        userId,
        types: ['market', 'pattern', 'zone', 'position'],
      });

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
  }, [loading, symbol, timeframe, currentPrice, patterns, zones, scanResults, userId]);

  // ═══════════════════════════════════════════════════════════
  // ACTION BUTTON HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleActionPress = useCallback((action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('[AdminAIChatModal] Action pressed:', action);

    // Handle specific actions
    switch (action.id) {
      case 'open_trade':
        // TODO: Open paper trade modal with suggested values
        break;
      case 'close_position':
        // TODO: Confirm and close position
        break;
      case 'partial_close':
        // TODO: Partial close position
        break;
      case 'move_sl':
        // TODO: Move stop loss
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

            {/* Context Bar */}
            <AdminAIContextBar
              symbol={symbol}
              timeframe={timeframe}
              currentPrice={currentPrice}
              priceChange={priceChange}
              patternCount={patterns?.length || 0}
              zoneCount={zones?.length || 0}
              trend={trend}
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

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Hỏi về pattern, zone, entry..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={2000}
                editable={!loading}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  if (!loading && inputText.trim()) {
                    sendMessage(inputText);
                  }
                }}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || loading) && styles.sendButtonDisabled,
                ]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.gold} />
                ) : (
                  <Send size={20} color={inputText.trim() ? COLORS.gold : COLORS.textMuted} />
                )}
              </TouchableOpacity>
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
    height: '85%',
    backgroundColor: COLORS.glassBg,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
    gap: SPACING.sm,
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
