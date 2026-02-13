import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Sparkles, Eye, CreditCard, Lock, Unlock, ScrollText, Send, Lightbulb, Trash2, Volume2, VolumeX, Download, Share2, Printer, FileText, BarChart3, Settings as SettingsIcon, Moon, Sun, Globe, Plus, X } from 'lucide-react';
import { chatbotService } from '../services/chatbot';
import { soundService } from '../services/soundService';
import { exportService } from '../services/exportService';
import { pdfExportService } from '../services/pdfExport';
import { analyticsService } from '../services/analyticsService';
import { preferencesService } from '../services/preferencesService';
import { themeService } from '../services/themeService';
import { i18nService } from '../services/i18nService';
import { productService } from '../services/products';
import { widgetDetector } from '../services/widgetDetector';
import { ResponseDetector, ResponseTypes } from '../services/responseDetector';
import { WidgetFactory, WIDGET_LIMITS } from '../services/widgetFactory';
import { useAuth } from '../contexts/AuthContext';
import { chatStorage } from '../services/chatStorage';
import { supabase } from '../lib/supabaseClient';
import HexagramVisual from '../components/HexagramVisual';
import TarotVisual from '../components/TarotVisual';
import QuickSelectButtons from '../components/QuickSelectButtons';
import CSKHButtons from '../components/CSKHButtons';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import PreferencesPanel from '../components/PreferencesPanel';
import { ProductCard } from '../components/Chatbot/ProductCard';
import { VoiceInputButton } from '../components/Chatbot/VoiceInputButton';
import { WidgetPreviewModal } from '../components/Widgets/WidgetPreviewModal';
import MagicCardExport from '../components/MagicCardExport';
import { TypingIndicator } from '../components/Chatbot/TypingIndicator';
import { SuggestedPrompts } from '../components/Chatbot/SuggestedPrompts';
import { ErrorMessage } from '../components/Chatbot/ErrorMessage';
import { ImageUpload } from '../components/Chatbot/ImageUpload';
import './Chatbot.css';
import '../styles/widgetPrompt.css';

// ✅ FIXED ALL 5 CHATBOT ISSUES: Product cards, Padding, Magic card, Hexagram, Tarot
export default function Chatbot() {
  const { user, profile, getScannerTier } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('chat'); // chat, iching, tarot
  const [spreadType, setSpreadType] = useState('single');
  const [usageInfo, setUsageInfo] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themeService.getTheme());
  const [currentLang, setCurrentLang] = useState(i18nService.getLanguage());
  const [detectedWidgets, setDetectedWidgets] = useState([]);
  const [showWidgetPreview, setShowWidgetPreview] = useState(null);
  const [widgetCount, setWidgetCount] = useState(0);
  const [pendingWidget, setPendingWidget] = useState(null);
  const [showWidgetPrompt, setShowWidgetPrompt] = useState(false);
  const [isCreatingWidget, setIsCreatingWidget] = useState(false);
  const [showMagicCardExport, setShowMagicCardExport] = useState(false);
  const [exportCardData, setExportCardData] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [lastInput, setLastInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const messagesEndRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Initialize response detector
  const responseDetector = new ResponseDetector();

  const handleToggleTheme = () => {
    const newTheme = themeService.toggle();
    setCurrentTheme(newTheme);
  };

  const handleToggleLanguage = () => {
    const newLang = i18nService.toggle();
    setCurrentLang(newLang);
  };

  const handleToggleSound = () => {
    const newState = soundService.toggle();
    setSoundEnabled(newState);
  };

  const handleExportText = () => {
    exportService.exportToText(messages);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    exportService.exportToJSON(messages, conversationHistory);
    setShowExportMenu(false);
  };

  const handleExportMarkdown = () => {
    exportService.exportToMarkdown(messages);
    setShowExportMenu(false);
  };

  const handleExportPDF = async () => {
    if (profile?.scanner_tier !== 'TIER3') {
      alert('Tính năng xuất PDF chỉ dành cho TIER3 ⭐');
      setShowExportMenu(false);
      return;
    }

    const result = await pdfExportService.exportChatSession(messages, {
      userName: user?.name || user?.email,
      tier: profile?.scanner_tier,
      sessionDate: new Date().toISOString()
    });

    if (result.success) {
      alert('✅ Đã xuất PDF thành công!');
    } else {
      alert('❌ Lỗi khi xuất PDF: ' + result.error);
    }

    setShowExportMenu(false);
  };

  const handlePrint = () => {
    exportService.printChat(messages);
    setShowExportMenu(false);
  };

  const handleShare = async () => {
    await exportService.shareChat(messages);
    setShowExportMenu(false);
  };

  const handleExportMagicCard = (message) => {
    // Extract title from message
    const extractTitle = (text) => {
      if (!text) return 'Gemral Card';
      const lines = text.split('\n');
      const firstLine = lines[0];
      if (firstLine.length > 50) {
        return firstLine.substring(0, 50) + '...';
      }
      return firstLine || 'Gemral Card';
    };

    // Determine card type based on active mode or message metadata
    let cardType = 'general';
    if (activeMode === 'iching') cardType = 'iching';
    else if (activeMode === 'tarot') cardType = 'tarot';
    else if (message.metadata?.hexagram) cardType = 'iching';
    else if (message.metadata?.cards || message.metadata?.card) cardType = 'tarot';
    else if (message.content.toLowerCase().includes('goal')) cardType = 'goal';
    else if (message.content.toLowerCase().includes('affirmation')) cardType = 'affirmation';
    else if (message.content.toLowerCase().includes('crystal')) cardType = 'crystal';

    setExportCardData({
      title: extractTitle(message.content),
      text: message.content,
      type: cardType
    });
    setShowMagicCardExport(true);
  };

  useEffect(() => {
    // Start analytics session
    analyticsService.startSession();

    if (user && user.id) {
      // Set user info in chatbot service
      const userTier = getScannerTier()?.toUpperCase() || 'FREE';
      chatbotService.setUserInfo(user.id, userTier);

      loadUsageInfo();
      loadHistory();
      loadWidgetCount();
      loadConversationHistory();
    }

    // Load chat from localStorage
    const savedChat = chatStorage.load();
    if (savedChat.length > 0) {
      setMessages(savedChat);
    } else {
      // Welcome message
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: 'Chào mừng đến với Gemral Chatbot! Tôi có thể giúp bạn với:\n\n**I Ching** - Nhận lời khuyên từ Kinh Dịch\n**Tarot** - Đọc bài Tarot về trading và cuộc sống\n**Chat** - Tư vấn về trading, năng lượng, và phương pháp\n\nBạn muốn bắt đầu với điều gì?',
        timestamp: new Date().toISOString()
      }]);
    }

    // End session on unmount
    return () => {
      analyticsService.endSession();
    };
  }, [user]);

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      chatStorage.save(messages);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  };

  const loadUsageInfo = async () => {
    try {
      const userTier = getScannerTier()?.toUpperCase() || 'FREE';
      console.log('🔍 DEBUG - User object:', user);
      console.log('🔍 DEBUG - Profile object:', profile);
      console.log('🔍 DEBUG - scanner_tier from profile:', profile?.scanner_tier);
      console.log('🔍 DEBUG - getScannerTier():', getScannerTier());
      console.log('🔍 DEBUG - userTier being passed:', userTier);
      const info = await chatbotService.checkUsageLimit(user.id, userTier);
      console.log('🔍 DEBUG - Usage info returned:', info);
      setUsageInfo(info);
    } catch (error) {
      console.error('Error loading usage info:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await chatbotService.getChatHistory(user.id, 20);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      const { data, error} = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setSessionId(data.session_id);
        setConversationHistory(data.messages || []);
        console.log('📚 Loaded conversation history:', data.messages?.length || 0, 'messages');
      }
    } catch (error) {
      console.log('No existing conversation found, starting fresh');
    }
  };

  const handleQuickSelect = async (action) => {
    // Set input and auto-send
    setInput(action);

    // Check usage limit
    if (!usageInfo?.allowed) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `Bạn đã hết lượt hỏi hôm nay (${usageInfo.limit} câu hỏi/ngày cho gói ${getScannerTier()?.toUpperCase()}).\n\nNâng cấp tài khoản để có thêm lượt hỏi:\n• PRO: 15 câu/ngày (39.000đ/tháng)\n• PREMIUM: 50 câu/ngày (59.000đ/tháng)\n• VIP: Không giới hạn (99.000đ/tháng)`,
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: action,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Play send sound
    soundService.play('send');

    try {
      let response;

      // LAYER 1: Try local data first (no API call)
      const localResponse = chatbotService.getLocalResponse(action);

      if (localResponse) {
        // Use local data - instant response, no API call
        console.log('✅ Using LOCAL data - no API call');
        response = localResponse;
      } else {
        // LAYER 2: Use AI API for complex questions
        console.log('🔄 Using AI API for complex question');
        if (activeMode === 'iching') {
          response = await chatbotService.getIChingReading(action);
        } else if (activeMode === 'tarot') {
          response = await chatbotService.getTarotReading(action, spreadType);
        } else {
          // Pass conversation history to chatWithMaster
          response = await chatbotService.chatWithMaster(action, conversationHistory);
        }
      }

      // Save to history only if not local
      if (!localResponse && user?.id) {
        await chatbotService.saveChatHistory(user.id, response);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.reading || response.response,
        metadata: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);

      // Track bot message in analytics
      analyticsService.trackMessage(botMessage, activeMode);

      // Detect products in bot response
      const detectedProducts = productService.detectProducts(botMessage.content);
      if (detectedProducts.length > 0) {
        const productsMessage = {
          id: Date.now() + 2,
          type: 'products',
          products: detectedProducts,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, productsMessage]);
      }

      // ✨ NEW: Detect if response can create widgets using ResponseDetector
      const detection = responseDetector.detect(botMessage.content);

      console.log('🎯 Widget Detection Result:', detection);

      // If widget-worthy response (confidence >= 0.85), show prompt
      if (detection.type !== ResponseTypes.GENERAL_CHAT && detection.confidence >= 0.85) {
        setPendingWidget({
          detection: detection,
          aiResponse: botMessage.content,
          userInput: action
        });
        setShowWidgetPrompt(true);
      }

      // Keep old widget detector for backwards compatibility
      const widgets = widgetDetector.detectWidgets(botMessage.content, {
        coin: extractCoin(action),
        userInput: action
      });
      if (widgets.length > 0) {
        console.log('🎯 Old detector - Detected widgets:', widgets);
        setDetectedWidgets(widgets);
      }

      // Play receive sound
      soundService.play('receive');

      // Update conversation history for Gemini (only for chat mode, not local responses)
      if (!localResponse && activeMode === 'chat') {
        setConversationHistory(prev => [
          ...prev.slice(-9), // Keep last 9
          { role: 'user', content: action },
          { role: 'assistant', content: response.response }
        ]);
        console.log('📝 Updated conversation history, now:', conversationHistory.length + 2, 'messages');
      }

      // Update usage info only if used API
      if (!localResponse) {
        await loadUsageInfo();
        await loadHistory();
      }
    } catch (error) {
      console.error('Error:', error);
      soundService.play('error');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'system',
        content: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      chatStorage.clear();
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: 'Chào mừng đến với Gemral Chatbot! Tôi có thể giúp bạn với:\n\n**I Ching** - Nhận lời khuyên từ Kinh Dịch\n**Tarot** - Đọc bài Tarot về trading và cuộc sống\n**Chat** - Tư vấn về trading, năng lượng, và phương pháp\n\nBạn muốn bắt đầu với điều gì?',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Extract coin symbol from user input
  const extractCoin = (text) => {
    const coinMatch = text.match(/(BTC|ETH|BNB|SOL|ADA|XRP|DOGE|Bitcoin|Ethereum|Binance|Solana|Cardano|Ripple|Dogecoin)/i);
    if (coinMatch) {
      const coin = coinMatch[1].toUpperCase();
      const coinMap = {
        'BITCOIN': 'BTC',
        'ETHEREUM': 'ETH',
        'BINANCE': 'BNB',
        'SOLANA': 'SOL',
        'CARDANO': 'ADA',
        'RIPPLE': 'XRP',
        'DOGECOIN': 'DOGE'
      };
      return coinMap[coin] || coin;
    }
    return 'BTC'; // Default
  };

  // Load user's widget count
  const loadWidgetCount = async () => {
    if (!user?.id) return;
    try {
      const { count, error } = await supabase
        .from('user_widgets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!error) {
        setWidgetCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading widget count:', error);
    }
  };

  // Save widget to database
  const saveWidget = async (widget) => {
    if (!user?.id) {
      alert('❌ Vui lòng đăng nhập để lưu widget');
      setShowWidgetPreview(null);
      return;
    }

    const userTier = getScannerTier()?.toUpperCase() || 'FREE';

    // Check if user can create more widgets
    if (!widgetDetector.canCreateWidget(userTier, widgetCount)) {
      const limit = widgetDetector.getWidgetLimit(userTier);
      alert(`❌ Bạn đã đạt giới hạn ${limit} widgets cho ${userTier}.\n\nNâng cấp tài khoản để lưu thêm widgets!`);
      setShowWidgetPreview(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .insert({
          user_id: user.id,
          widget_type: widget.type,
          widget_name: widget.name,
          widget_data: widget.data,
          size: widget.size || 'medium'
        })
        .select();

      if (error) throw error;

      if (data) {
        alert('✅ Widget đã được lưu vào Dashboard!');
        setShowWidgetPreview(null);
        setDetectedWidgets([]);
        loadWidgetCount(); // Reload count
        soundService.play('success');
      }
    } catch (error) {
      console.error('Error saving widget:', error);
      alert('❌ Lỗi khi lưu widget: ' + error.message);
    }
  };

  // New Widget System Helper Functions
  const canCreateWidget = () => {
    const userTier = profile?.scanner_tier?.toUpperCase() || 'FREE';
    const limits = WIDGET_LIMITS[userTier] || WIDGET_LIMITS.FREE;

    if (limits.maxWidgets === -1) return true; // Unlimited

    return widgetCount < limits.maxWidgets;
  };

  const getCurrentLimit = () => {
    const userTier = profile?.scanner_tier?.toUpperCase() || 'FREE';
    const limits = WIDGET_LIMITS[userTier] || WIDGET_LIMITS.FREE;
    return limits.maxWidgets;
  };

  const handleAddToDashboard = async () => {
    if (!pendingWidget || !canCreateWidget()) return;

    setIsCreatingWidget(true);

    try {
      const result = await WidgetFactory.createFromAIResponse(
        user.id,
        pendingWidget.aiResponse,
        pendingWidget.detection
      );

      if (result && result.success) {
        // Success toast
        alert('✨ ' + (result.message || 'Widget đã được tạo!'));

        // Hide prompt
        setShowWidgetPrompt(false);
        setPendingWidget(null);

        // Reload widget count
        await loadWidgetCount();

        // Add system message with link to dashboard
        setMessages(prev => [...prev, {
          id: Date.now() + 100,
          type: 'system',
          content: `${result.message}\n\n👉 Xem widgets tại Dashboard`,
          timestamp: new Date().toISOString()
        }]);

        // Play success sound
        soundService.play('success');

      } else {
        alert('❌ ' + (result?.error || 'Có lỗi khi tạo widget. Vui lòng thử lại!'));
      }

    } catch (error) {
      console.error('Error creating widget:', error);
      alert('❌ Có lỗi khi tạo widget. Vui lòng thử lại!');
    } finally {
      setIsCreatingWidget(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check usage limit
    if (!usageInfo?.allowed) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `Bạn đã hết lượt hỏi hôm nay (${usageInfo.limit} câu hỏi/ngày cho gói ${getScannerTier()?.toUpperCase()}).\n\nNâng cấp tài khoản để có thêm lượt hỏi:\n• PRO: 15 câu/ngày (39.000đ/tháng)\n• PREMIUM: 50 câu/ngày (59.000đ/tháng)\n• VIP: Không giới hạn (99.000đ/tháng)`,
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Track user message in analytics
    analyticsService.trackMessage(userMessage, activeMode);

    const currentInput = input;
    setInput('');
    setLastInput(currentInput); // Save for retry
    setChatError(null); // Clear previous error
    setLoading(true);

    // Play send sound
    soundService.play('send');

    try {
      let response;

      // LAYER 1: Try local data first (no API call)
      const localResponse = chatbotService.getLocalResponse(currentInput);

      if (localResponse) {
        // Use local data - instant response, no API call
        console.log('✅ Using LOCAL data - no API call');
        response = localResponse;
      } else {
        // LAYER 2: Use AI API for complex questions
        console.log('🔄 Using AI API for complex question');
        if (activeMode === 'iching') {
          response = await chatbotService.getIChingReading(currentInput);
        } else if (activeMode === 'tarot') {
          response = await chatbotService.getTarotReading(currentInput, spreadType);
        } else {
          // Pass conversation history to chatWithMaster
          response = await chatbotService.chatWithMaster(currentInput, conversationHistory);
        }
      }

      // Save to history only if not local
      if (!localResponse && user?.id) {
        await chatbotService.saveChatHistory(user.id, response);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.reading || response.response,
        metadata: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);

      // Track bot message in analytics
      analyticsService.trackMessage(botMessage, activeMode);

      // Detect products in bot response
      const detectedProducts = productService.detectProducts(botMessage.content);
      if (detectedProducts.length > 0) {
        const productsMessage = {
          id: Date.now() + 2,
          type: 'products',
          products: detectedProducts,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, productsMessage]);
      }

      // ✨ NEW: Detect if response can create widgets using ResponseDetector
      const detection = responseDetector.detect(botMessage.content);

      console.log('🎯 Widget Detection Result:', detection);

      // If widget-worthy response (confidence >= 0.85), show prompt
      if (detection.type !== ResponseTypes.GENERAL_CHAT && detection.confidence >= 0.85) {
        setPendingWidget({
          detection: detection,
          aiResponse: botMessage.content,
          userInput: currentInput
        });
        setShowWidgetPrompt(true);
      }

      // Keep old widget detector for backwards compatibility
      const widgets = widgetDetector.detectWidgets(botMessage.content, {
        coin: extractCoin(currentInput),
        userInput: currentInput
      });
      if (widgets.length > 0) {
        console.log('🎯 Old detector - Detected widgets:', widgets);
        setDetectedWidgets(widgets);
      }

      // Play receive sound
      soundService.play('receive');

      // Update conversation history for Gemini (only for chat mode, not local responses)
      if (!localResponse && activeMode === 'chat') {
        setConversationHistory(prev => [
          ...prev.slice(-9), // Keep last 9
          { role: 'user', content: currentInput },
          { role: 'assistant', content: response.response }
        ]);
        console.log('📝 Updated conversation history, now:', conversationHistory.length + 2, 'messages');
      }

      // Update usage info only if used API
      if (!localResponse) {
        await loadUsageInfo();
        await loadHistory();
      }
    } catch (error) {
      console.error('Error:', error);
      soundService.play('error');
      // Set error state for ErrorMessage component instead of adding message
      setChatError(error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Retry last failed message
  const handleRetry = () => {
    if (lastInput) {
      setInput(lastInput);
      setChatError(null);
      // Auto-trigger send after setting input
      setTimeout(() => {
        const sendBtn = document.querySelector('.chatbot-send-button');
        if (sendBtn) sendBtn.click();
      }, 100);
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        {/* Sidebar */}
        <div className="chatbot-sidebar">
          {/* Quick Select Buttons */}
          <div className="mode-card card-glass">
            <h3 className="mode-title">Quick Select</h3>
            <QuickSelectButtons onSelect={handleQuickSelect} />
          </div>

          {/* Usage Info */}
          <div className={`usage-card card-glass ${usageInfo?.remaining === 0 ? 'limit-reached' : ''}`}>
            <div className="usage-header">
              <span className="usage-icon">{usageInfo?.remaining === 0 ? <Lock size={20} /> : <Sparkles size={20} />}</span>
              <span className="usage-title">Lượt Hỏi Hôm Nay</span>
            </div>

            {usageInfo && (
              <>
                <div className="usage-count">
                  {usageInfo.remaining === Infinity ? '∞' : usageInfo.remaining}
                  <span className="usage-total">
                    / {usageInfo.limit === Infinity ? '∞' : usageInfo.limit}
                  </span>
                </div>

                {usageInfo.remaining === 0 && (
                  <button
                    className="btn-warning"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    <Unlock size={18} />
                    <span>Nâng Cấp</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* CSKH Support Buttons */}
          <div className="card-glass" style={{ padding: '16px', marginTop: '16px' }}>
            <CSKHButtons placement="sidebar" />
          </div>

          {/* Analytics Button */}
          <button
            onClick={() => setShowAnalytics(true)}
            className="btn-secondary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(0, 217, 255, 0.05))',
              border: '1px solid rgba(0, 217, 255, 0.3)'
            }}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>

          {/* History Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary history-btn"
          >
            <ScrollText size={18} />
            <span>Lịch Sử ({history.length})</span>
          </button>
        </div>

        {/* Chat Area */}
        <div className="chat-area card-glass">
          {/* Header */}
          <div className="chat-header">
            <div>
              <h2 className="chat-title"><Eye size={24} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Gemral Chatbot</h2>
              <p className="chat-subtitle">
                {activeMode === 'chat' && 'Tư vấn trading và năng lượng'}
                {activeMode === 'iching' && 'Nhận lời khuyên từ Kinh Dịch'}
                {activeMode === 'tarot' && `Đọc bài Tarot (${spreadType === 'single' ? '1 lá' : '3 lá'})`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', position: 'relative', flexWrap: 'wrap' }}>
              {/* Theme Toggle */}
              <button
                onClick={handleToggleTheme}
                className="btn-ghost"
                title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Language Toggle */}
              <button
                onClick={handleToggleLanguage}
                className="btn-ghost"
                title={currentLang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              >
                <Globe size={18} />
              </button>

              {/* New Conversation */}
              <button
                onClick={() => {
                  // Reset to fresh state
                  setMessages([{
                    id: 'welcome',
                    type: 'bot',
                    content: 'Chào mừng đến với Gemral Chatbot! Tôi có thể giúp bạn với:\n\n**I Ching** - Nhận lời khuyên từ Kinh Dịch\n**Tarot** - Đọc bài Tarot về trading và cuộc sống\n**Chat** - Tư vấn về trading, năng lượng, và phương pháp\n\nBạn muốn bắt đầu với điều gì?',
                    timestamp: new Date().toISOString()
                  }]);
                  setConversationHistory([]);
                  setSessionId(null);
                  setInput('');
                  setDetectedWidgets([]);
                  chatStorage.clear();
                }}
                className="btn-ghost"
                title="Cuộc trò chuyện mới"
              >
                <Plus size={18} />
              </button>

              {/* Clear Chat */}
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa toàn bộ tin nhắn?')) {
                    setMessages([]);
                    setConversationHistory([]);
                    setDetectedWidgets([]);
                    chatStorage.clear();
                  }
                }}
                className="btn-ghost"
                title="Xóa toàn bộ chat"
                disabled={messages.length === 0}
              >
                <Trash2 size={18} />
              </button>

              {/* Export Menu */}
              <div ref={exportMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="btn-ghost"
                  title="Export & Share"
                  disabled={messages.length === 0}
                >
                  <Download size={18} />
                </button>

                {showExportMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'linear-gradient(135deg, rgba(30, 42, 94, 0.95), rgba(45, 60, 120, 0.95))',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '8px',
                    minWidth: '200px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    zIndex: 1000
                  }}>
                    <button
                      onClick={handleExportText}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 189, 89, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <FileText size={16} />
                      <span>Export as Text</span>
                    </button>

                    <button
                      onClick={handleExportMarkdown}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 189, 89, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <FileText size={16} />
                      <span>Export as Markdown</span>
                    </button>

                    <button
                      onClick={handleExportJSON}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 189, 89, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Download size={16} />
                      <span>Export as JSON</span>
                    </button>

                    {/* PDF Export (TIER3 Only) */}
                    <button
                      onClick={handleExportPDF}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: profile?.scanner_tier === 'TIER3'
                          ? 'transparent'
                          : 'rgba(255, 189, 89, 0.05)',
                        border: 'none',
                        borderRadius: '8px',
                        color: profile?.scanner_tier === 'TIER3' ? '#FFFFFF' : 'rgba(255, 189, 89, 0.6)',
                        fontSize: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 189, 89, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = profile?.scanner_tier === 'TIER3'
                          ? 'transparent'
                          : 'rgba(255, 189, 89, 0.05)';
                      }}
                    >
                      <FileText size={16} />
                      <span>Export as PDF {profile?.scanner_tier !== 'TIER3' && '⭐'}</span>
                    </button>

                    <div style={{
                      height: '1px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      margin: '8px 0'
                    }} />

                    <button
                      onClick={handlePrint}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 189, 89, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Printer size={16} />
                      <span>Print</span>
                    </button>

                    <button
                      onClick={handleShare}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 189, 89, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleToggleSound}
                className="btn-ghost"
                title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="btn-ghost"
                title="Settings"
              >
                <SettingsIcon size={18} />
              </button>
              <button
                onClick={handleClearChat}
                className="btn-ghost clear-btn"
                title="Xóa lịch sử chat"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '16px',
            overflowY: 'auto',
            overflowX: 'visible', /* FIX: Không cắt product cards! */
            width: '100%'
          }}>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} onExport={handleExportMagicCard} />
            ))}

            {/* Suggested Prompts - Show when only welcome message or empty */}
            {messages.length <= 1 && !loading && (
              <SuggestedPrompts
                activeMode={activeMode}
                onSelectPrompt={(text) => {
                  setInput(text);
                  // Auto send the prompt
                  setTimeout(() => {
                    const sendBtn = document.querySelector('.chatbot-send-button');
                    if (sendBtn) sendBtn.click();
                  }, 100);
                }}
                disabled={!usageInfo?.allowed}
              />
            )}

            {/* Widget Suggestions */}
            {detectedWidgets.length > 0 && (
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(0, 217, 255, 0.1))',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                marginTop: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <Lightbulb size={20} color="#8B5CF6" />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#8B5CF6' }}>
                    Widget Suggestions
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {detectedWidgets.map((widget, idx) => (
                    <button
                      key={idx}
                      onClick={() => setShowWidgetPreview(widget)}
                      style={{
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(0, 217, 255, 0.2))',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {widget.suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && <TypingIndicator show={loading} />}

            {/* Error Message with retry */}
            {chatError && !loading && (
              <ErrorMessage
                error={chatError}
                onRetry={handleRetry}
                onUpgrade={() => window.location.href = '/settings/subscription'}
                showRetry={true}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 20px',
            background: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            zIndex: 10
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              width: '100%'
            }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  activeMode === 'chat'
                    ? 'Nhập câu hỏi của bạn...'
                    : activeMode === 'iching'
                    ? 'Hỏi về tình hình hiện tại hoặc quyết định bạn cần đưa ra...'
                    : 'Đặt câu hỏi về trading hoặc cuộc sống...'
                }
                disabled={loading || !usageInfo?.allowed}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  background: 'rgba(30, 42, 94, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  outline: 'none',
                  minWidth: 0,
                  minHeight: '50px',
                  maxHeight: '150px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              {/* Image Upload for Chart Analysis (TIER2+) */}
              <ImageUpload
                onImageSelect={(image) => setSelectedImage(image)}
                onImageRemove={() => setSelectedImage(null)}
                selectedImage={selectedImage}
                userTier={getScannerTier()?.toUpperCase()}
                disabled={loading || !usageInfo?.allowed}
              />

              {/* Voice Input (TIER3 Only) */}
              {profile?.scanner_tier === 'TIER3' && (
                <VoiceInputButton
                  onTranscript={(text) => {
                    setInput(text);
                    // Auto-send after voice input
                    setTimeout(() => {
                      const currentInput = text;
                      if (currentInput.trim()) {
                        handleSend();
                      }
                    }, 500);
                  }}
                  disabled={loading || !usageInfo?.allowed}
                />
              )}
              <button
                className="chatbot-send-button"
                onClick={handleSend}
                disabled={!input.trim() || loading || !usageInfo?.allowed}
                style={{
                  padding: '14px 24px',
                  background: (!input.trim() || loading || !usageInfo?.allowed)
                    ? 'rgba(255, 189, 89, 0.3)'
                    : 'linear-gradient(135deg, #FFBD59, #FFD700)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000',
                  fontWeight: '600',
                  cursor: (!input.trim() || loading || !usageInfo?.allowed) ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  opacity: (!input.trim() || loading || !usageInfo?.allowed) ? 0.5 : 1
                }}
              >
                <Send size={20} />
              </button>
            </div>

            <p style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: '8px 0 0 0',
              textAlign: 'center'
            }}>
              <Lightbulb size={16} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }} /> Tip: Shift + Enter để xuống dòng
            </p>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="history-panel card-glass">
            <h3 className="history-title"><ScrollText size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Lịch Sử</h3>

            {history.length === 0 ? (
              <p className="empty-history">Chưa có lịch sử</p>
            ) : (
              <div className="history-list">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="history-item"
                    onClick={() => {
                      // Load this reading into chat
                      setMessages(prev => [...prev, {
                        id: Date.now(),
                        type: 'bot',
                        content: item.response,
                        timestamp: item.created_at
                      }]);
                      setShowHistory(false);
                    }}
                  >
                    <div className="history-type">
                      {item.type === 'iching' ? <><Eye size={16} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> I Ching</> :
                       item.type === 'tarot' ? <><CreditCard size={16} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Tarot</> :
                       <><MessageCircle size={16} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Chat</>}
                    </div>
                    <p className="history-question">{item.question}</p>
                    <span className="history-date">
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analytics Dashboard Modal */}
      {showAnalytics && (
        <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
      )}

      {/* Preferences Panel Modal */}
      {showPreferences && (
        <PreferencesPanel onClose={() => setShowPreferences(false)} />
      )}

      {/* Widget Preview Modal */}
      {showWidgetPreview && (
        <WidgetPreviewModal
          widget={showWidgetPreview}
          onSave={saveWidget}
          onClose={() => setShowWidgetPreview(null)}
          userTier={getScannerTier()?.toUpperCase() || 'FREE'}
        />
      )}

      {/* Widget Creation Prompt */}
      {showWidgetPrompt && pendingWidget && (
        <div className="widget-prompt">
          <div className="widget-prompt-content">
            <div className="widget-prompt-icon">
              <Lightbulb size={32} color="#FFD700" />
            </div>

            <div className="widget-prompt-text">
              <h4>✨ Gemral có thể tạo dashboard cho bạn!</h4>
              <p>
                {pendingWidget.detection.type === ResponseTypes.MANIFESTATION_GOAL &&
                  'Tự động track progress, nhắc nhở hàng ngày, và nhiều hơn nữa.'}
                {pendingWidget.detection.type === ResponseTypes.CRYSTAL_RECOMMENDATION &&
                  'Lưu crystal recommendations và usage guide.'}
                {pendingWidget.detection.type === ResponseTypes.AFFIRMATIONS_ONLY &&
                  'Tạo affirmation widget với daily reminders.'}
                {pendingWidget.detection.type === ResponseTypes.TRADING_ANALYSIS &&
                  'Lưu trading analysis và spiritual insights.'}
              </p>

              {/* Show tier limit warning if needed */}
              {!canCreateWidget() && (
                <p className="tier-warning">
                  ⚠️ Bạn đã đạt giới hạn {getCurrentLimit()} widgets.
                  <a href="/pricing"> Upgrade để tạo thêm</a>
                </p>
              )}
            </div>

            <div className="widget-prompt-actions">
              <button
                className="btn-primary"
                onClick={handleAddToDashboard}
                disabled={!canCreateWidget() || isCreatingWidget}
              >
                {isCreatingWidget ? '⏳ Đang tạo...' : '✅ Thêm vào Dashboard'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowWidgetPrompt(false);
                  setPendingWidget(null);
                }}
              >
                Không, cảm ơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Magic Card Export Modal */}
      <MagicCardExport
        response={exportCardData}
        cardType={exportCardData?.type}
        isOpen={showMagicCardExport}
        onClose={() => {
          setShowMagicCardExport(false);
          setExportCardData(null);
        }}
      />
    </div>
  );
}

// Message Bubble Component - FIXED: Product cards, Padding, Magic Card centering ✅
function MessageBubble({ message, onExport }) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const isProducts = message.type === 'products';
  const isAI = !isUser && !isSystem && !isProducts;

  // Render product cards
  if (isProducts && message.products) {
    return (
      <div className="chatbot-products-container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '8px',
        width: 'fit-content', /* FIX: Not constrained by parent 65% max-width */
        maxWidth: 'none', /* FIX: Allow cards to show fully */
        alignItems: 'flex-start',
        overflow: 'visible' /* FIX: Không cắt cards */
      }}>
        {message.products.map((product, idx) => (
          <ProductCard key={idx} product={product} source="chatbot" />
        ))}
      </div>
    );
  }

  // Extract visual data from metadata
  const hexagram = message.metadata?.hexagram;
  const tarotCards = message.metadata?.cards;
  const singleCard = message.metadata?.card;

  // Clean text function - Remove markdown symbols
  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '')  // Remove **
      .replace(/\*/g, '')    // Remove *
      .replace(/##/g, '')    // Remove ##
      .replace(/###/g, '')   // Remove ###
      .trim();
  };

  // Base style for all bubbles
  const baseStyle = {
    padding: '12px 16px', /* ISSUE #3: Reduced from 16px 20px for compact spacing */
    color: '#FFFFFF',
    fontSize: '15px',
    lineHeight: '1.6',
    wordWrap: 'break-word',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    marginBottom: '8px',
    display: 'block',
    width: 'fit-content'
  };

  // User-specific styles (RIGHT SIDE)
  const userStyle = {
    ...baseStyle,
    maxWidth: '65%',
    background: 'rgba(30, 42, 94, 0.4)',
    border: '1px solid rgba(255, 189, 89, 0.3)',
    borderRadius: '20px 20px 4px 20px',
    marginLeft: 'auto',
    marginRight: '0',
    alignSelf: 'flex-end'
  };

  // AI-specific styles (LEFT SIDE)
  const aiStyle = {
    ...baseStyle,
    maxWidth: '75%',
    background: 'rgba(30, 42, 94, 0.6)',
    border: '1px solid rgba(0, 217, 255, 0.3)',
    borderRadius: '20px 20px 20px 4px',
    marginRight: 'auto',
    marginLeft: '0',
    alignSelf: 'flex-start'
  };

  // System message style
  const systemStyle = {
    ...baseStyle,
    maxWidth: '80%',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '12px',
    textAlign: 'center',
    margin: '0 auto 16px',
    alignSelf: 'center'
  };

  const timeStyle = {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '8px',
    textAlign: isUser ? 'right' : 'left'
  };

  const tarotSpreadStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    margin: '8px 0'
  };

  return (
    <div style={isSystem ? systemStyle : (isUser ? userStyle : aiStyle)}>
      {/* Render I Ching Hexagram if present */}
      {hexagram && <HexagramVisual hexagram={hexagram} />}

      {/* Render Tarot Cards if present */}
      {tarotCards && tarotCards.length > 0 && (
        <div style={tarotSpreadStyle}>
          {tarotCards.map((card, idx) => (
            <TarotVisual key={idx} card={card} />
          ))}
        </div>
      )}

      {/* Render single Tarot Card if present */}
      {singleCard && <TarotVisual card={singleCard} />}

      {/* Message text content - CLEANED */}
      <div style={{ marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
        {cleanText(message.content)}
      </div>

      {/* Export Magic Card Button - Only for AI messages */}
      {isAI && onExport && (
        <button
          onClick={() => onExport(message)}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
            border: '1px solid rgba(192, 132, 252, 0.3)',
            borderRadius: '10px',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
          }}
        >
          <span>🎴</span>
          <span>Export Magic Card</span>
        </button>
      )}

      <div style={timeStyle}>
        {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
}
