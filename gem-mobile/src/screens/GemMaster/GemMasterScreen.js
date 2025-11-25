/**
 * GEM Platform - GEM Master Screen
 * AI Chat Interface with I Ching & Tarot
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { useTabBar } from '../../contexts/TabBarContext';

// Components
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import QuickActions from './components/QuickActions';

// Welcome message
const WELCOME_MESSAGE = {
  id: 'welcome',
  type: 'assistant',
  text: 'Xin chào! Tôi là GEM Master - trợ lý AI của bạn. Tôi có thể giúp bạn:\n\n• Trả lời câu hỏi về crypto & trading\n• Xem quẻ Kinh Dịch (I Ching)\n• Đọc bài Tarot\n• Tư vấn phong thủy & tâm linh\n\nBạn muốn khám phá điều gì hôm nay?',
  timestamp: new Date().toISOString(),
};

const GemMasterScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const flatListRef = useRef(null);
  const { hideTabBar, showTabBar } = useTabBar();

  // Hide quick actions and tab bar when keyboard shows
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setShowQuickActions(false);
      hideTabBar();
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setShowQuickActions(true);
      showTabBar();
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, [hideTabBar, showTabBar]);

  // Mock AI response (will be replaced with Claude API)
  const generateResponse = useCallback(async (userMessage) => {
    // Simulate thinking
    setIsTyping(true);

    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const responses = [
      'Đó là một câu hỏi hay! Hãy để tôi phân tích...',
      'Theo quan điểm của tôi, bạn nên xem xét kỹ trước khi quyết định.',
      'Tôi hiểu những gì bạn đang hỏi. Có một số điểm cần lưu ý...',
      'Thú vị đấy! Hãy cùng khám phá thêm nhé.',
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    setIsTyping(false);

    return {
      id: `msg_${Date.now()}`,
      type: 'assistant',
      text: randomResponse,
      timestamp: new Date().toISOString(),
    };
  }, []);

  // Handle send message
  const handleSend = useCallback(
    async (text) => {
      // Hide quick actions
      setShowQuickActions(false);

      // Add user message
      const userMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Get AI response
      const response = await generateResponse(text);
      setMessages((prev) => [...prev, response]);

      // Scroll to bottom again
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [generateResponse]
  );

  // Navigate to I Ching
  const handleIChing = useCallback(() => {
    navigation.navigate('IChing');
  }, [navigation]);

  // Navigate to Tarot
  const handleTarot = useCallback(() => {
    navigation.navigate('Tarot');
  }, [navigation]);

  // Render message item
  const renderMessage = useCallback(({ item }) => <MessageBubble message={item} />, []);

  // Key extractor
  const keyExtractor = useCallback((item) => item.id, []);

  // Empty state (header)
  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.header}>
        <LinearGradient
          colors={GRADIENTS.gold}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Sparkles size={28} color="#0F1030" />
        </LinearGradient>
        <Text style={styles.headerTitle}>GEM Master</Text>
        <Text style={styles.headerSubtitle}>AI Assistant & Spiritual Guide</Text>
      </View>
    ),
    []
  );

  // Footer with typing indicator
  const ListFooterComponent = useCallback(
    () => (isTyping ? <TypingIndicator /> : null),
    [isTyping]
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
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
          />

          {/* Quick Actions */}
          {showQuickActions && messages.length <= 1 && (
            <QuickActions onIChing={handleIChing} onTarot={handleTarot} />
          )}

          {/* Chat Input */}
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
  messagesContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
});

export default GemMasterScreen;
