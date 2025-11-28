/**
 * Gemral - Gemral Screen
 * AI Chat Interface with I Ching & Tarot
 *
 * Day 7 Integration:
 * - TierService integration
 * - QuotaService integration
 * - QuickActionBar component
 * - ClearChatButton component
 * - UpgradeModal component
 * - TierBadge & QuotaIndicator
 *
 * Day 11-12 Integration:
 * - Voice Input with quota management
 * - VoiceQuotaDisplay component
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Settings, Plus, Clock, ChevronDown } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { useTabBar } from '../../contexts/TabBarContext';
import { useFocusEffect } from '@react-navigation/native';

// Components
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';

// GemMaster Components
import {
  TierBadge,
  QuotaIndicator,
  QuotaIndicatorCompact
} from '../../components/GemMaster';
import QuickActionBar from '../../components/GemMaster/QuickActionBar';
import ClearChatButton from '../../components/GemMaster/ClearChatButton';
import UpgradeModal from '../../components/GemMaster/UpgradeModal';
import VoiceQuotaDisplay, { VoiceQuotaWarning } from '../../components/GemMaster/VoiceQuotaDisplay';
import WidgetSuggestionCard from '../../components/GemMaster/WidgetSuggestionCard';

// Services
import TierService from '../../services/tierService';
import QuotaService from '../../services/quotaService';
import voiceService from '../../services/voiceService';
import responseDetector from '../../services/responseDetector';
import widgetFactoryService from '../../services/widgetFactoryService';
import RecommendationEngine from '../../services/recommendationEngine';
import chatHistoryService from '../../services/chatHistoryService';
import { supabase } from '../../services/supabase';

// Welcome message
const WELCOME_MESSAGE = {
  id: 'welcome',
  type: 'assistant',
  text: 'Xin chào! Tôi là Gemral - trợ lý AI của bạn. Tôi có thể giúp bạn:\n\n• Trả lời câu hỏi về crypto & trading\n• Xem quẻ Kinh Dịch (I Ching)\n• Đọc bài Tarot\n• Tư vấn phong thủy & tâm linh\n\nBạn muốn khám phá điều gì hôm nay?',
  timestamp: new Date().toISOString(),
};

const GemMasterScreen = ({ navigation }) => {
  // Chat state
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const {
    hideTabBar,
    showTabBar,
    handleChatScroll,
    bottomPadding,
    isVisible: isTabBarVisible,
  } = useTabBar();

  // User & Tier state
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('FREE');
  const [quota, setQuota] = useState(null);
  const [isLoadingTier, setIsLoadingTier] = useState(true);

  // Voice quota state (Day 11-12)
  const [voiceQuota, setVoiceQuota] = useState({
    isUnlimited: false,
    used: 0,
    limit: 3,
    remaining: 3,
    canUse: true,
    displayText: '3/3 còn lại'
  });

  // Modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showVoiceQuotaWarning, setShowVoiceQuotaWarning] = useState(false);

  // Widget suggestion state (Day 17-19)
  const [suggestedWidgets, setSuggestedWidgets] = useState(null);
  const [lastUserQuery, setLastUserQuery] = useState('');

  // Chat history state
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Keyboard state for bottom padding
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Scroll state for scroll-to-bottom button
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Fetch user and tier on mount
  useEffect(() => {
    const fetchUserAndTier = async () => {
      try {
        setIsLoadingTier(true);

        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          // Get user tier
          const tier = await TierService.getUserTier(currentUser.id);
          setUserTier(tier);

          // Get quota
          const quotaData = await QuotaService.checkQuota(currentUser.id, tier);
          setQuota(quotaData);

          // Get voice quota (Day 11-12)
          const voiceQuotaData = await voiceService.getVoiceQuotaInfo(currentUser.id, tier);
          setVoiceQuota(voiceQuotaData);

          console.log('[GemMaster] User tier:', tier, 'Quota:', quotaData, 'Voice:', voiceQuotaData);
        } else {
          // Not logged in - use default
          setUserTier('FREE');
          setQuota(QuotaService.getDefaultQuota());
          setVoiceQuota(TierService.getVoiceQuotaInfo('FREE', 0));
        }
      } catch (error) {
        console.error('[GemMaster] Error fetching user/tier:', error);
        setQuota(QuotaService.getDefaultQuota());
      } finally {
        setIsLoadingTier(false);
      }
    };

    fetchUserAndTier();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const tier = await TierService.getUserTier(session.user.id);
        setUserTier(tier);
        const quotaData = await QuotaService.checkQuota(session.user.id, tier);
        setQuota(quotaData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserTier('FREE');
        setQuota(QuotaService.getDefaultQuota());
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Hide tab bar when keyboard shows (QuickActionBar stays visible)
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      hideTabBar();
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      showTabBar();
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, [hideTabBar, showTabBar]);

  // Reset tab bar visibility when screen gains focus
  useFocusEffect(
    useCallback(() => {
      // Show tab bar when entering screen
      showTabBar();

      return () => {
        // Optional: could show tab bar when leaving, but other screens will handle it
      };
    }, [showTabBar])
  );

  // Load most recent conversation on mount
  useEffect(() => {
    const loadRecentConversation = async () => {
      if (!user) return;

      try {
        const recent = await chatHistoryService.getRecentConversation(user.id);
        if (recent && recent.messages && recent.messages.length > 0) {
          setCurrentConversationId(recent.id);
          setMessages([WELCOME_MESSAGE, ...recent.messages]);
          console.log('[GemMaster] Loaded recent conversation:', recent.id);
        }
      } catch (error) {
        console.error('[GemMaster] Error loading recent conversation:', error);
      }
    };

    loadRecentConversation();
  }, [user]);

  // Check if user can query (has remaining quota)
  const canQuery = useCallback(() => {
    if (!quota) return false;
    return quota.unlimited || quota.remaining > 0;
  }, [quota]);

  // Refresh quota
  const refreshQuota = useCallback(async () => {
    if (!user) return;

    try {
      const quotaData = await QuotaService.checkQuota(user.id, userTier);
      setQuota(quotaData);
    } catch (error) {
      console.error('[GemMaster] Error refreshing quota:', error);
    }
  }, [user, userTier]);

  // Refresh voice quota (Day 11-12)
  const refreshVoiceQuota = useCallback(async () => {
    if (!user) return;

    try {
      const voiceQuotaData = await voiceService.getVoiceQuotaInfo(user.id, userTier);
      setVoiceQuota(voiceQuotaData);
    } catch (error) {
      console.error('[GemMaster] Error refreshing voice quota:', error);
    }
  }, [user, userTier]);

  // Handle voice recording start
  const handleVoiceRecordingStart = useCallback(() => {
    console.log('[GemMaster] Voice recording started');
  }, []);

  // Handle voice recording stop
  const handleVoiceRecordingStop = useCallback(async (audioUri, duration) => {
    console.log('[GemMaster] Voice recording stopped, duration:', duration);

    // Increment voice usage count
    if (user) {
      await voiceService.incrementVoiceCount(user.id);
      await refreshVoiceQuota();
    }
  }, [user, refreshVoiceQuota]);

  // Handle voice error
  const handleVoiceError = useCallback((error) => {
    console.error('[GemMaster] Voice error:', error);

    if (error.code === 'quota_exceeded') {
      setShowVoiceQuotaWarning(true);
    } else if (error.code === 'permission_denied') {
      Alert.alert(
        'Cần quyền truy cập',
        'Vui lòng cấp quyền microphone trong Cài đặt để sử dụng voice input.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Lỗi ghi âm',
        error.message || 'Không thể ghi âm. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Handle voice quota press
  const handleVoiceQuotaPress = useCallback(() => {
    if (!voiceQuota.canUse) {
      setShowVoiceQuotaWarning(true);
    }
  }, [voiceQuota]);

  // Build conversation history for Gemini API
  const buildHistory = useCallback(() => {
    return messages
      .filter(msg => msg.id !== 'welcome')
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        content: msg.text,
      }));
  }, [messages]);

  // Generate AI response using ResponseDetector (Local + Gemini)
  const generateResponse = useCallback(async (userMessage) => {
    setIsTyping(true);

    // Scroll to show typing indicator
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Use ResponseDetector - tries local first, then Gemini API
      const response = await responseDetector.getResponse(userMessage);

      console.log('[GemMaster] Response:', response.source, response.duration + 'ms',
        response.source === 'local' ? '(FREE)' : '(API)');

      // Get product recommendations from response or fetch separately
      let products = response.recommendedProducts || [];

      // If no products from response, try RecommendationEngine
      if (products.length === 0) {
        try {
          const recommendations = await RecommendationEngine.getRecommendations(
            user?.id,
            userTier,
            userMessage
          );
          if (recommendations.hasCrystals) {
            products = recommendations.crystals.slice(0, 2);
          }
        } catch (recError) {
          console.warn('[GemMaster] Recommendation error:', recError);
        }
      }

      setIsTyping(false);

      return {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        text: response.text,
        timestamp: new Date().toISOString(),
        source: response.source,
        confidence: response.confidence,
        products: products,
        quickActions: response.quickActions,
      };
    } catch (error) {
      console.error('[GemMaster] Generate response error:', error);
      setIsTyping(false);

      return {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        text: '😔 Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        timestamp: new Date().toISOString(),
        source: 'error',
        confidence: 0,
      };
    }
  }, [user, userTier]);

  // Handle send message
  const handleSend = useCallback(
    async (text) => {
      // Check quota first
      if (!canQuery()) {
        setShowUpgradeModal(true);
        return;
      }

      // Clear previous widget suggestions
      setSuggestedWidgets(null);
      setLastUserQuery(text);

      // Add user message
      const userMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Scroll to bottom immediately
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);

      // Scroll again after typing indicator appears
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);

      // Decrement quota
      if (user) {
        await QuotaService.decrementQuota(user.id);
        await refreshQuota();
      }

      // Get AI response
      const response = await generateResponse(text);
      setMessages((prev) => [...prev, response]);

      // Day 17-19: Detect if response is widget-worthy
      try {
        if (user) {
          const result = await widgetFactoryService.createWidgetsFromResponse(
            response.text,
            text,
            user.id
          );

          if (result && result.widgets && result.widgets.length > 0) {
            console.log('[GemMaster] Widget suggestion:', result.detection?.type, result.widgets.length, 'widgets');
            setSuggestedWidgets({
              widgets: result.widgets,
              message: result.suggestionMessage || `Tôi có thể thêm ${result.widgets.length} widget vào Dashboard để giúp bạn theo dõi.`,
            });
          }
        }
      } catch (widgetError) {
        console.warn('[GemMaster] Widget detection error:', widgetError);
      }

      // Scroll to bottom again
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Auto-save conversation after getting response
      if (user) {
        try {
          const allMessages = [...messages.filter(m => m.id !== 'welcome'), userMessage, response];
          if (currentConversationId) {
            await chatHistoryService.saveConversation(currentConversationId, allMessages, user.id);
          } else {
            const newConv = await chatHistoryService.createConversation(user.id, allMessages);
            setCurrentConversationId(newConv.id);
          }
        } catch (saveError) {
          console.warn('[GemMaster] Auto-save error:', saveError);
        }
      }
    },
    [generateResponse, canQuery, user, refreshQuota, messages, currentConversationId]
  );

  // Handle quick action (from QuickActionBar)
  const handleQuickAction = useCallback((prompt) => {
    handleSend(prompt);
  }, [handleSend]);

  // Handle sending I Ching/Tarot result to chat
  const handleSendResultToChat = useCallback((resultData) => {
    // Handle both string (legacy) and object (new visual) format
    const isObject = typeof resultData === 'object' && resultData !== null;

    // Add result as assistant message with divination visual data
    const resultMessage = {
      id: `result_${Date.now()}`,
      type: 'assistant',
      text: isObject ? resultData.text : resultData,
      timestamp: new Date().toISOString(),
      source: 'divination',
      // Visual data for DivinationResultCard
      divinationType: isObject ? resultData.type : null, // 'iching' or 'tarot'
      hexagram: isObject ? resultData.hexagram : null,   // I Ching hexagram data
      cards: isObject ? resultData.cards : null,         // Tarot cards data
      interpretation: isObject ? resultData.interpretation : null,
    };
    setMessages((prev) => [...prev, resultMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Handle navigation from QuickActionBar
  const handleQuickNavigate = useCallback((screen) => {
    navigation.navigate(screen, {
      onSendToChat: handleSendResultToChat,
    });
  }, [navigation, handleSendResultToChat]);

  // Navigate to I Ching
  const handleIChing = useCallback(() => {
    navigation.navigate('IChing', {
      onSendToChat: handleSendResultToChat,
    });
  }, [navigation, handleSendResultToChat]);

  // Navigate to Tarot
  const handleTarot = useCallback(() => {
    navigation.navigate('Tarot', {
      onSendToChat: handleSendResultToChat,
    });
  }, [navigation, handleSendResultToChat]);

  // Clear chat history
  const handleClearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    // Also clear responseDetector conversation history
    responseDetector.clearHistory();
  }, []);

  // Save current conversation to database
  const saveCurrentConversation = useCallback(async () => {
    if (!user) return null;

    // Filter out welcome message for storage
    const messagesToSave = messages.filter(m => m.id !== 'welcome');
    if (messagesToSave.length === 0) return null;

    setIsSaving(true);
    try {
      if (currentConversationId) {
        // Update existing conversation
        await chatHistoryService.saveConversation(
          currentConversationId,
          messagesToSave,
          user.id
        );
        return currentConversationId;
      } else {
        // Create new conversation
        const newConversation = await chatHistoryService.createConversation(
          user.id,
          messagesToSave
        );
        setCurrentConversationId(newConversation.id);
        return newConversation.id;
      }
    } catch (error) {
      console.error('[GemMaster] Error saving conversation:', error);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, messages, currentConversationId]);

  // Handle New Chat - auto-save current and start fresh
  const handleNewChat = useCallback(async () => {
    // Save current chat if has messages (> welcome message)
    if (messages.length > 1 && user) {
      await saveCurrentConversation();
    }

    // Create new conversation record
    if (user) {
      try {
        const newConversation = await chatHistoryService.createConversation(user.id, []);
        setCurrentConversationId(newConversation.id);
      } catch (error) {
        console.error('[GemMaster] Error creating new conversation:', error);
        setCurrentConversationId(null);
      }
    } else {
      setCurrentConversationId(null);
    }

    // Reset UI
    setMessages([WELCOME_MESSAGE]);
    responseDetector.clearHistory();
    setSuggestedWidgets(null);
  }, [messages, user, saveCurrentConversation]);

  // Handle Open History
  const handleOpenHistory = useCallback(() => {
    // Save current before navigating
    if (messages.length > 1 && user) {
      saveCurrentConversation();
    }
    navigation.navigate('ChatHistory', {
      onLoadConversation: handleLoadConversation,
    });
  }, [navigation, messages, user, saveCurrentConversation]);

  // Handle loading a conversation from history
  const handleLoadConversation = useCallback(async (conversationId) => {
    try {
      const conversation = await chatHistoryService.loadConversation(conversationId);
      if (conversation && conversation.messages) {
        setCurrentConversationId(conversation.id);
        setMessages([WELCOME_MESSAGE, ...conversation.messages]);
        responseDetector.clearHistory();
        // Rebuild conversation history for AI
        conversation.messages.forEach(msg => {
          if (msg.type === 'user' || msg.type === 'assistant') {
            responseDetector.addToHistory(msg.text, msg.type === 'user' ? 'user' : 'model');
          }
        });
      }
    } catch (error) {
      console.error('[GemMaster] Error loading conversation:', error);
      Alert.alert('Lỗi', 'Không thể tải cuộc trò chuyện. Vui lòng thử lại.');
    }
  }, []);

  // Render message item
  const renderMessage = useCallback(({ item }) => <MessageBubble message={item} />, []);

  // Key extractor
  const keyExtractor = useCallback((item) => item.id, []);

  // Header component with tier badge and quota (inside FlatList)
  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.listHeader}>
        {/* Tier and Quota Row */}
        <View style={styles.statusRow}>
          <TierBadge tier={userTier} size="sm" />
          <QuotaIndicator quota={quota} size="sm" showResetTime />
        </View>

        {/* Logo and Title */}
        <LinearGradient
          colors={GRADIENTS.gold}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Sparkles size={28} color="#0F1030" />
        </LinearGradient>
        <Text style={styles.headerTitle}>Gem Master</Text>
        <Text style={styles.headerSubtitle}>AI Assistant & Spiritual Guide</Text>

        {/* Clear Chat Button */}
        {messages.length > 1 && (
          <View style={styles.clearButtonContainer}>
            <ClearChatButton onClear={handleClearChat} variant="text" />
          </View>
        )}
      </View>
    ),
    [userTier, quota, messages.length, handleClearChat]
  );

  // Handle scroll event for showing scroll-to-bottom button AND auto-hide tab bar
  const handleScroll = useCallback((event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    // Show button if scrolled up more than 200px from bottom
    setShowScrollButton(distanceFromBottom > 200);

    // Auto-hide tab bar on scroll (only when keyboard is not visible)
    if (!keyboardVisible) {
      handleChatScroll(event);
    }
  }, [keyboardVisible, handleChatScroll]);

  // Scroll to bottom handler
  const handleScrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  // Handle widget creation success
  const handleWidgetsCreated = useCallback((createdWidgets) => {
    console.log('[GemMaster] Widgets created:', createdWidgets?.length);
    setSuggestedWidgets(null);
    // Could show a success toast here
  }, []);

  // Footer with typing indicator and widget suggestions
  const ListFooterComponent = useCallback(
    () => (
      <View>
        {isTyping && <TypingIndicator />}
        {/* Widget Suggestion Card - Day 17-19 */}
        {suggestedWidgets && suggestedWidgets.widgets?.length > 0 && user && (
          <WidgetSuggestionCard
            widgets={suggestedWidgets.widgets}
            suggestionMessage={suggestedWidgets.message}
            userId={user.id}
            onWidgetsCreated={handleWidgetsCreated}
            onDismiss={() => setSuggestedWidgets(null)}
          />
        )}
      </View>
    ),
    [isTyping, suggestedWidgets, user, handleWidgetsCreated]
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Fixed Top Header - Always visible */}
        <View style={styles.fixedHeader}>
          {/* History Button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleOpenHistory}
            activeOpacity={0.7}
          >
            <Clock size={18} color={COLORS.gold} />
          </TouchableOpacity>

          {/* Title in center */}
          <Text style={styles.fixedHeaderTitle}>Gem Master</Text>

          {/* New Chat Button */}
          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.newChatButton,
              messages.length <= 1 && styles.headerButtonDisabled,
            ]}
            onPress={handleNewChat}
            disabled={messages.length <= 1 || isSaving}
            activeOpacity={0.7}
          >
            <Plus size={18} color={messages.length > 1 ? COLORS.gold : COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />

          {/* Scroll to Bottom Button - Animated with tab bar */}
          {showScrollButton && (
            <Animated.View
              style={[
                styles.scrollToBottomButton,
                !keyboardVisible && {
                  bottom: Animated.add(bottomPadding, 100),
                }
              ]}
            >
              <TouchableOpacity
                style={styles.scrollToBottomButtonInner}
                onPress={handleScrollToBottom}
                activeOpacity={0.8}
              >
                <ChevronDown size={24} color={COLORS.gold} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Bottom Input Area - QuickActionBar + ChatInput stacked */}
          {/* Animated container that moves with tab bar */}
          <Animated.View style={[
            styles.bottomInputArea,
            // When keyboard is visible, no extra padding needed
            // When keyboard is hidden, use animated padding from tab bar context
            !keyboardVisible && {
              paddingBottom: bottomPadding,
            }
          ]}>
            {/* Quick Action Bar (Always visible above input) */}
            <QuickActionBar
              onAction={handleQuickAction}
              onNavigate={handleQuickNavigate}
              disabled={!canQuery()}
            />

            {/* Chat Input with Voice (Day 11-12) */}
            <ChatInput
              onSend={handleSend}
              disabled={isTyping || !canQuery()}
              placeholder={
                !canQuery()
                  ? 'Hết lượt hỏi hôm nay...'
                  : 'Nhập tin nhắn...'
              }
              // Voice props
              voiceEnabled={true}
              voiceQuota={voiceQuota}
              onVoiceRecordingStart={handleVoiceRecordingStart}
              onVoiceRecordingStop={handleVoiceRecordingStop}
              onVoiceQuotaPress={handleVoiceQuotaPress}
              onVoiceError={handleVoiceError}
            />

            {/* Quota Status Compact (Bottom) */}
            {!canQuery() && (
              <TouchableOpacity
                style={styles.quotaExhaustedBanner}
                onPress={() => setShowUpgradeModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.quotaExhaustedText}>
                  Hết lượt hỏi hôm nay • Nhấn để nâng cấp
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </KeyboardAvoidingView>

        {/* Upgrade Modal */}
        <UpgradeModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          quota={quota}
          currentTier={userTier}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  // Fixed header at top - always visible
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  fixedHeaderTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  // List header (inside FlatList)
  listHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatButton: {
    borderColor: COLORS.gold,
  },
  headerButtonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  clearButtonContainer: {
    marginTop: SPACING.md,
  },
  messagesContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  bottomInputArea: {
    // Stacks QuickActionBar + ChatInput vertically
    backgroundColor: 'transparent',
    // paddingBottom is now animated via bottomPadding from TabBarContext
  },
  quotaExhaustedBanner: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  quotaExhaustedText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  // Scroll to bottom button container (animated)
  scrollToBottomButton: {
    position: 'absolute',
    right: SPACING.md,
    bottom: 100, // Base position, will be animated
  },
  // Scroll to bottom button inner (touchable)
  scrollToBottomButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bgMid,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default GemMasterScreen;
