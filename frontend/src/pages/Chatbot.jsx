import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Sparkles, Eye, CreditCard, Lock, Unlock, ScrollText, Send, Lightbulb, Trash2, Volume2, VolumeX, Download, Share2, Printer, FileText, BarChart3, Settings as SettingsIcon, Moon, Sun, Globe, Plus, X, Clock, ChevronDown } from 'lucide-react';
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
import QuickActionBar from '../components/GemMaster/QuickActionBar';
import SmartSuggestionBanner from '../components/GemMaster/SmartSuggestionBanner';
import { detectIntent, INTENT_CATEGORIES } from '../services/intentDetectionService';
import { proactiveAIService } from '../services/proactiveAIService';
import ChatbotPricingModal from '../components/GemMaster/ChatbotPricingModal';
import FAQPanel from '../components/GemMaster/FAQPanel';
import QuickBuyModal from '../components/GemMaster/QuickBuyModal';
import UpsellModal from '../components/GemMaster/UpsellModal';
import CrystalRecommendation from '../components/GemMaster/CrystalRecommendation';
import ProductRecommendations from '../components/GemMaster/ProductRecommendations';
import CrisisAlertModal from '../components/GemMaster/CrisisAlertModal';
import SmartFormCard from '../components/GemMaster/SmartFormCard';
import GoalSettingForm from '../components/GemMaster/GoalSettingForm';
import InlineChatForm from '../components/GemMaster/InlineChatForm';
import WidgetSuggestionCard from '../components/GemMaster/WidgetSuggestionCard';
import ExportButton from '../components/GemMaster/ExportButton';
import ExportTemplateSelector from '../components/GemMaster/ExportTemplateSelector';
import ExportPreview from '../components/GemMaster/ExportPreview';
import RecordingIndicator from '../components/GemMaster/RecordingIndicator';
import VoiceQuotaDisplay from '../components/GemMaster/VoiceQuotaDisplay';
import './Chatbot.css';
import '../styles/widgetPrompt.css';

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
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Stream E: Modal & feature states
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showFAQPanel, setShowFAQPanel] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(null);
  const [showUpsell, setShowUpsell] = useState(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(null);
  const [showExportSelector, setShowExportSelector] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [smartSuggestions, setSmartSuggestions] = useState([]);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Initialize response detector
  const responseDetector = new ResponseDetector();

  // Tier access control
  const currentTier = (profile?.scanner_tier || 'FREE').toUpperCase();
  const TIER_FEATURES = {
    FREE:  { questions: 5,  pdfExport: false, voice: false, widgets: 3 },
    TIER1: { questions: 20, pdfExport: false, voice: false, widgets: 5 },
    TIER2: { questions: 50, pdfExport: false, voice: false, widgets: 10 },
    TIER3: { questions: -1, pdfExport: true,  voice: true,  widgets: -1 },
    ADMIN: { questions: -1, pdfExport: true,  voice: true,  widgets: -1 },
  };
  const tierFeatures = TIER_FEATURES[currentTier] || TIER_FEATURES.FREE;

  // Crisis keyword detection for emotional support
  const CRISIS_KEYWORDS = ['tu tu', 'suicide', 'muon chet', 'khong muon song', 'ket thuc', 'tu hai', 'self harm'];
  const checkCrisis = (text) => {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return CRISIS_KEYWORDS.some(kw => normalized.includes(kw));
  };

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

  // Export flow: selector -> preview -> download
  const handleExportSelect = (formatId) => {
    setShowExportSelector(false);
    setShowExportPreview({ format: formatId, content: '' });
  };

  const handleExportConfirm = (content) => {
    const format = showExportPreview?.format || 'text';
    const ext = { text: 'txt', markdown: 'md', json: 'json', pdf: 'pdf' }[format] || 'txt';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gem-master-chat.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportPreview(null);
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
      alert('Tinh nang xuat PDF chi danh cho TIER3');
      setShowExportMenu(false);
      return;
    }

    const result = await pdfExportService.exportChatSession(messages, {
      userName: user?.name || user?.email,
      tier: profile?.scanner_tier,
      sessionDate: new Date().toISOString()
    });

    if (result.success) {
      alert('Da xuat PDF thanh cong!');
    } else {
      alert('Loi khi xuat PDF: ' + result.error);
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
    const extractTitle = (text) => {
      if (!text) return 'Gemral Card';
      const lines = text.split('\n');
      const firstLine = lines[0];
      if (firstLine.length > 50) {
        return firstLine.substring(0, 50) + '...';
      }
      return firstLine || 'Gemral Card';
    };

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
    analyticsService.startSession();

    if (user && user.id) {
      const userTier = getScannerTier()?.toUpperCase() || 'FREE';
      chatbotService.setUserInfo(user.id, userTier);
      loadUsageInfo();
      loadHistory();
      loadWidgetCount();
      loadConversationHistory();

      // Load proactive suggestions
      proactiveAIService.getPendingMessages(user.id).then(pending => {
        if (pending?.length > 0) {
          setSmartSuggestions(pending.slice(0, 3).map(m => ({
            id: m.id,
            text: m.message || m.title || '',
            action: m.cta_action || 'chat',
          })));
        }
      }).catch(() => {});
    }

    const savedChat = chatStorage.load();
    if (savedChat.length > 0) {
      setMessages(savedChat);
    } else {
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: 'Chao mung den voi Gem Master! Toi co the giup ban voi:\n\n**I Ching** - Nhan loi khuyen tu Kinh Dich\n**Tarot** - Doc bai Tarot ve trading va cuoc song\n**Chat** - Tu van ve trading, nang luong, va phuong phap\n\nBan muon bat dau voi dieu gi?',
        timestamp: new Date().toISOString()
      }]);
    }

    return () => {
      analyticsService.endSession();
    };
  }, [user]);

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

  // Track scroll position for scroll-to-bottom button
  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distanceFromBottom > 200);
  }, []);

  const loadUsageInfo = async () => {
    try {
      const userTier = getScannerTier()?.toUpperCase() || 'FREE';
      const info = await chatbotService.checkUsageLimit(user.id, userTier);
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
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setSessionId(data.session_id);
        setConversationHistory(data.messages || []);
      }
    } catch (error) {
      console.log('No existing conversation found, starting fresh');
    }
  };

  const handleQuickSelect = async (action) => {
    setInput(action);

    if (!usageInfo?.allowed) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `Ban da het luot hoi hom nay (${usageInfo.limit} cau hoi/ngay cho goi ${getScannerTier()?.toUpperCase()}).\n\nNang cap tai khoan de co them luot hoi:\n- PRO: 15 cau/ngay\n- PREMIUM: 50 cau/ngay\n- VIP: Khong gioi han`,
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
    soundService.play('send');

    try {
      let response;
      const localResponse = chatbotService.getLocalResponse(action);

      if (localResponse) {
        response = localResponse;
      } else {
        if (activeMode === 'iching') {
          response = await chatbotService.getIChingReading(action);
        } else if (activeMode === 'tarot') {
          response = await chatbotService.getTarotReading(action, spreadType);
        } else {
          response = await chatbotService.chatWithMaster(action, conversationHistory);
        }
      }

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
      analyticsService.trackMessage(botMessage, activeMode);

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

      const detection = responseDetector.detect(botMessage.content);
      if (detection.type !== ResponseTypes.GENERAL_CHAT && detection.confidence >= 0.85) {
        setPendingWidget({
          detection: detection,
          aiResponse: botMessage.content,
          userInput: action
        });
        setShowWidgetPrompt(true);
      }

      const widgets = widgetDetector.detectWidgets(botMessage.content, {
        coin: extractCoin(action),
        userInput: action
      });
      if (widgets.length > 0) {
        setDetectedWidgets(widgets);
      }

      soundService.play('receive');

      if (!localResponse && activeMode === 'chat') {
        setConversationHistory(prev => [
          ...prev.slice(-9),
          { role: 'user', content: action },
          { role: 'assistant', content: response.response }
        ]);
      }

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
        content: 'Da co loi xay ra. Vui long thu lai.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([{
      id: 'welcome',
      type: 'bot',
      content: 'Chao mung den voi Gem Master! Toi co the giup ban voi:\n\n**I Ching** - Nhan loi khuyen tu Kinh Dich\n**Tarot** - Doc bai Tarot ve trading va cuoc song\n**Chat** - Tu van ve trading, nang luong, va phuong phap\n\nBan muon bat dau voi dieu gi?',
      timestamp: new Date().toISOString()
    }]);
    setConversationHistory([]);
    setSessionId(null);
    setInput('');
    setDetectedWidgets([]);
    chatStorage.clear();
  };

  const handleClearChat = () => {
    if (window.confirm('Ban co chac muon xoa toan bo lich su chat?')) {
      chatStorage.clear();
      handleNewChat();
    }
  };

  const extractCoin = (text) => {
    const coinMatch = text.match(/(BTC|ETH|BNB|SOL|ADA|XRP|DOGE|Bitcoin|Ethereum|Binance|Solana|Cardano|Ripple|Dogecoin)/i);
    if (coinMatch) {
      const coin = coinMatch[1].toUpperCase();
      const coinMap = {
        'BITCOIN': 'BTC', 'ETHEREUM': 'ETH', 'BINANCE': 'BNB',
        'SOLANA': 'SOL', 'CARDANO': 'ADA', 'RIPPLE': 'XRP', 'DOGECOIN': 'DOGE'
      };
      return coinMap[coin] || coin;
    }
    return 'BTC';
  };

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

  const saveWidget = async (widget) => {
    if (!user?.id) {
      alert('Vui long dang nhap de luu widget');
      setShowWidgetPreview(null);
      return;
    }

    const userTier = getScannerTier()?.toUpperCase() || 'FREE';
    if (!widgetDetector.canCreateWidget(userTier, widgetCount)) {
      const limit = widgetDetector.getWidgetLimit(userTier);
      alert(`Ban da dat gioi han ${limit} widgets cho ${userTier}.\n\nNang cap tai khoan de luu them widgets!`);
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
        alert('Widget da duoc luu vao Dashboard!');
        setShowWidgetPreview(null);
        setDetectedWidgets([]);
        loadWidgetCount();
        soundService.play('success');
      }
    } catch (error) {
      console.error('Error saving widget:', error);
      alert('Loi khi luu widget: ' + error.message);
    }
  };

  const canCreateWidget = () => {
    const userTier = profile?.scanner_tier?.toUpperCase() || 'FREE';
    const limits = WIDGET_LIMITS[userTier] || WIDGET_LIMITS.FREE;
    if (limits.maxWidgets === -1) return true;
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
        alert(result.message || 'Widget da duoc tao!');
        setShowWidgetPrompt(false);
        setPendingWidget(null);
        await loadWidgetCount();
        setMessages(prev => [...prev, {
          id: Date.now() + 100,
          type: 'system',
          content: `${result.message}\n\nXem widgets tai Dashboard`,
          timestamp: new Date().toISOString()
        }]);
        soundService.play('success');
      } else {
        alert(result?.error || 'Co loi khi tao widget. Vui long thu lai!');
      }
    } catch (error) {
      console.error('Error creating widget:', error);
      alert('Co loi khi tao widget. Vui long thu lai!');
    } finally {
      setIsCreatingWidget(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!usageInfo?.allowed) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `Ban da het luot hoi hom nay (${usageInfo.limit} cau hoi/ngay cho goi ${getScannerTier()?.toUpperCase()}).\n\nNang cap tai khoan de co them luot hoi:\n- PRO: 15 cau/ngay\n- PREMIUM: 50 cau/ngay\n- VIP: Khong gioi han`,
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
    analyticsService.trackMessage(userMessage, activeMode);

    const currentInput = input;
    setInput('');
    setLastInput(currentInput);
    setChatError(null);
    setLoading(true);
    soundService.play('send');

    try {
      let response;
      const localResponse = chatbotService.getLocalResponse(currentInput);

      if (localResponse) {
        response = localResponse;
      } else {
        if (activeMode === 'iching') {
          response = await chatbotService.getIChingReading(currentInput);
        } else if (activeMode === 'tarot') {
          response = await chatbotService.getTarotReading(currentInput, spreadType);
        } else {
          response = await chatbotService.chatWithMaster(currentInput, conversationHistory);
        }
      }

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
      analyticsService.trackMessage(botMessage, activeMode);

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

      const detection = responseDetector.detect(botMessage.content);
      if (detection.type !== ResponseTypes.GENERAL_CHAT && detection.confidence >= 0.85) {
        setPendingWidget({
          detection: detection,
          aiResponse: botMessage.content,
          userInput: currentInput
        });
        setShowWidgetPrompt(true);
      }

      const widgets = widgetDetector.detectWidgets(botMessage.content, {
        coin: extractCoin(currentInput),
        userInput: currentInput
      });
      if (widgets.length > 0) {
        setDetectedWidgets(widgets);
      }

      soundService.play('receive');

      // Crisis detection on user input
      if (checkCrisis(currentInput)) {
        setShowCrisisAlert(true);
      }

      // Intent-based triggers
      const intentResult = detectIntent(currentInput);
      if (intentResult?.primaryIntent?.name === 'EMOTIONAL' && intentResult.sentiment === 'negative') {
        // Emotional support - could trigger goal form or inline form
      }

      if (!localResponse && activeMode === 'chat') {
        setConversationHistory(prev => [
          ...prev.slice(-9),
          { role: 'user', content: currentInput },
          { role: 'assistant', content: response.response }
        ]);
      }

      if (!localResponse) {
        await loadUsageInfo();
        await loadHistory();
      }
    } catch (error) {
      console.error('Error:', error);
      soundService.play('error');
      setChatError(error.message || 'Da co loi xay ra. Vui long thu lai.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      setInput(lastInput);
      setChatError(null);
      setTimeout(() => {
        const sendBtn = document.querySelector('.chat-send-btn');
        if (sendBtn) sendBtn.click();
      }, 100);
    }
  };

  // ==========================================
  // RENDER - Single Column Layout
  // ==========================================

  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        {/* ===== FIXED HEADER: History | Title | New Chat ===== */}
        <div className="chat-header">
          <div className="chat-header__left">
            <button
              className="chat-header__btn"
              onClick={() => setShowHistory(true)}
              title="Lich su"
            >
              <Clock size={18} />
            </button>
          </div>

          <div className="chat-header__center">
            <h2 className="chat-header__title">
              <Eye size={20} /> Gem Master
            </h2>
            <p className="chat-header__subtitle">
              {activeMode === 'chat' && 'Tu van trading va nang luong'}
              {activeMode === 'iching' && 'Nhan loi khuyen tu Kinh Dich'}
              {activeMode === 'tarot' && `Doc bai Tarot (${spreadType === 'single' ? '1 la' : '3 la'})`}
            </p>
          </div>

          <div className="chat-header__right">
            {/* Export Menu */}
            <div ref={exportMenuRef} style={{ position: 'relative' }}>
              <button
                className="chat-header__btn chat-header__btn--ghost"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={messages.length === 0}
                title="Export & Share"
              >
                <Download size={16} />
              </button>

              {showExportMenu && (
                <div className="export-dropdown">
                  <button className="export-dropdown__item" onClick={handleExportText}>
                    <FileText size={14} /> Export Text
                  </button>
                  <button className="export-dropdown__item" onClick={handleExportMarkdown}>
                    <FileText size={14} /> Export Markdown
                  </button>
                  <button className="export-dropdown__item" onClick={handleExportJSON}>
                    <Download size={14} /> Export JSON
                  </button>
                  <button
                    className={`export-dropdown__item ${profile?.scanner_tier !== 'TIER3' ? 'export-dropdown__item--locked' : ''}`}
                    onClick={handleExportPDF}
                  >
                    <FileText size={14} /> Export PDF {profile?.scanner_tier !== 'TIER3' && '(TIER3)'}
                  </button>
                  <div className="export-dropdown__divider" />
                  <button className="export-dropdown__item" onClick={handlePrint}>
                    <Printer size={14} /> Print
                  </button>
                  <button className="export-dropdown__item" onClick={handleShare}>
                    <Share2 size={14} /> Share
                  </button>
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              className="chat-header__btn chat-header__btn--ghost"
              onClick={handleToggleSound}
              title={soundEnabled ? 'Tat am thanh' : 'Bat am thanh'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Settings */}
            <button
              className="chat-header__btn chat-header__btn--ghost"
              onClick={() => setShowPreferences(true)}
              title="Cai dat"
            >
              <SettingsIcon size={16} />
            </button>

            {/* New Chat */}
            <button
              className="chat-header__btn"
              onClick={handleNewChat}
              disabled={messages.length <= 1}
              title="Cuoc tro chuyen moi"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* ===== SMART SUGGESTION BANNER (placeholder) ===== */}
        <SmartSuggestionBanner
          suggestions={smartSuggestions}
          onAction={(suggestion) => {
            handleQuickSelect(suggestion.text || suggestion);
            setSmartSuggestions([]);
          }}
          onDismiss={() => setSmartSuggestions([])}
          visible={smartSuggestions.length > 0}
        />

        {/* ===== CHAT MESSAGES ===== */}
        <div
          className="chat-messages"
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
        >
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} onExport={handleExportMagicCard} />
          ))}

          {/* Suggested Prompts */}
          {messages.length <= 1 && !loading && (
            <SuggestedPrompts
              activeMode={activeMode}
              onSelectPrompt={(text) => {
                setInput(text);
                setTimeout(() => {
                  const sendBtn = document.querySelector('.chat-send-btn');
                  if (sendBtn) sendBtn.click();
                }, 100);
              }}
              disabled={!usageInfo?.allowed}
            />
          )}

          {/* Widget Suggestions */}
          {detectedWidgets.length > 0 && (
            <div className="widget-suggestions">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Lightbulb size={18} color="#8B5CF6" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#8B5CF6' }}>
                  Widget Suggestions
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {detectedWidgets.map((widget, idx) => (
                  <button
                    key={idx}
                    onClick={() => setShowWidgetPreview(widget)}
                    style={{
                      padding: '8px 14px',
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(0, 217, 255, 0.2))',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {widget.suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && <TypingIndicator show={loading} />}

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

        {/* Scroll to Bottom Button */}
        {showScrollBtn && (
          <button className="scroll-to-bottom" onClick={scrollToBottom}>
            <ChevronDown size={18} />
          </button>
        )}

        {/* ===== QUICK ACTION BAR ===== */}
        <QuickActionBar
          onTarot={() => {
            setActiveMode('tarot');
            handleQuickSelect('Doc bai Tarot cho toi');
          }}
          onIChing={() => {
            setActiveMode('iching');
            handleQuickSelect('Gieo que Kinh Dich cho toi');
          }}
          onFAQ={() => setShowFAQPanel(true)}
          onHistory={() => setShowHistory(true)}
          disabled={loading || !usageInfo?.allowed}
        />

        {/* ===== CHAT INPUT AREA ===== */}
        <div className="chat-input-area">
          <div className="chat-input-row">
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
                  ? 'Nhap cau hoi cua ban...'
                  : activeMode === 'iching'
                  ? 'Hoi ve tinh hinh hien tai...'
                  : 'Dat cau hoi ve trading hoac cuoc song...'
              }
              disabled={loading || !usageInfo?.allowed}
              rows={1}
            />

            <ImageUpload
              onImageSelect={(image) => setSelectedImage(image)}
              onImageRemove={() => setSelectedImage(null)}
              selectedImage={selectedImage}
              userTier={getScannerTier()?.toUpperCase()}
              disabled={loading || !usageInfo?.allowed}
            />

            {profile?.scanner_tier === 'TIER3' && (
              <VoiceInputButton
                onTranscript={(text) => {
                  setInput(text);
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
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading || !usageInfo?.allowed}
            >
              <Send size={18} />
            </button>
          </div>

          <p className="chat-input-hint">
            <Lightbulb size={12} /> Shift + Enter de xuong dong
          </p>
        </div>

        {/* ===== RECORDING INDICATOR ===== */}
        <RecordingIndicator isRecording={isRecording} duration={recordingDuration} />

        {/* ===== UPGRADE BANNER (when quota exhausted) ===== */}
        {usageInfo && !usageInfo.allowed && (
          <div className="upgrade-banner">
            <span className="upgrade-banner__text">
              Het luot hoi hom nay ({usageInfo.limit}/{usageInfo.limit})
            </span>
            <button
              className="upgrade-banner__btn"
              onClick={() => setShowPricingModal(true)}
            >
              <Unlock size={14} />
              Nang Cap
            </button>
          </div>
        )}

        {/* ===== HISTORY PANEL (slide overlay) ===== */}
        {showHistory && (
          <div className="history-overlay">
            <div className="history-overlay__backdrop" onClick={() => setShowHistory(false)} />
            <div className="history-panel">
              <div className="history-panel__header">
                <h3 className="history-panel__title">
                  <ScrollText size={16} /> Lich Su
                </h3>
                <button className="history-panel__close" onClick={() => setShowHistory(false)}>
                  <X size={18} />
                </button>
              </div>

              {history.length === 0 ? (
                <p className="history-panel__empty">Chua co lich su</p>
              ) : (
                <div className="history-panel__list">
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="history-panel__item"
                      onClick={() => {
                        setMessages(prev => [...prev, {
                          id: Date.now(),
                          type: 'bot',
                          content: item.response,
                          timestamp: item.created_at
                        }]);
                        setShowHistory(false);
                      }}
                    >
                      <div className="history-panel__item-type">
                        {item.type === 'iching' ? <><Eye size={12} /> I Ching</> :
                         item.type === 'tarot' ? <><CreditCard size={12} /> Tarot</> :
                         <><MessageCircle size={12} /> Chat</>}
                      </div>
                      <p className="history-panel__item-question">{item.question}</p>
                      <span className="history-panel__item-date">
                        {new Date(item.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== MODALS (outside container) ===== */}

      {showAnalytics && (
        <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
      )}

      {showPreferences && (
        <PreferencesPanel onClose={() => setShowPreferences(false)} />
      )}

      {showWidgetPreview && (
        <WidgetPreviewModal
          widget={showWidgetPreview}
          onSave={saveWidget}
          onClose={() => setShowWidgetPreview(null)}
          userTier={getScannerTier()?.toUpperCase() || 'FREE'}
        />
      )}

      {showWidgetPrompt && pendingWidget && (
        <div className="widget-prompt">
          <div className="widget-prompt-content">
            <div className="widget-prompt-icon">
              <Lightbulb size={28} color="#FFD700" />
            </div>
            <div className="widget-prompt-text">
              <h4>Gemral co the tao dashboard cho ban!</h4>
              <p>
                {pendingWidget.detection.type === ResponseTypes.MANIFESTATION_GOAL &&
                  'Tu dong track progress, nhac nho hang ngay.'}
                {pendingWidget.detection.type === ResponseTypes.CRYSTAL_RECOMMENDATION &&
                  'Luu crystal recommendations va usage guide.'}
                {pendingWidget.detection.type === ResponseTypes.AFFIRMATIONS_ONLY &&
                  'Tao affirmation widget voi daily reminders.'}
                {pendingWidget.detection.type === ResponseTypes.TRADING_ANALYSIS &&
                  'Luu trading analysis va spiritual insights.'}
              </p>
              {!canCreateWidget() && (
                <p className="tier-warning">
                  Ban da dat gioi han {getCurrentLimit()} widgets.
                  <a href="/pricing"> Upgrade de tao them</a>
                </p>
              )}
            </div>
            <div className="widget-prompt-actions">
              <button
                className="btn-primary"
                onClick={handleAddToDashboard}
                disabled={!canCreateWidget() || isCreatingWidget}
              >
                {isCreatingWidget ? 'Dang tao...' : 'Them vao Dashboard'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowWidgetPrompt(false);
                  setPendingWidget(null);
                }}
              >
                Khong, cam on
              </button>
            </div>
          </div>
        </div>
      )}

      <MagicCardExport
        response={exportCardData}
        cardType={exportCardData?.type}
        isOpen={showMagicCardExport}
        onClose={() => {
          setShowMagicCardExport(false);
          setExportCardData(null);
        }}
      />

      {/* ===== STREAM E MODALS ===== */}

      {showPricingModal && (
        <ChatbotPricingModal
          isOpen
          onClose={() => setShowPricingModal(false)}
          currentTier={currentTier}
          onUpgrade={(tier) => {
            setShowPricingModal(false);
            window.location.href = '/pricing';
          }}
        />
      )}

      {showFAQPanel && (
        <FAQPanel
          isOpen
          onClose={() => setShowFAQPanel(false)}
          onSelectQuestion={(question) => {
            setShowFAQPanel(false);
            handleQuickSelect(question);
          }}
        />
      )}

      {showQuickBuy && (
        <QuickBuyModal
          isOpen
          onClose={() => setShowQuickBuy(null)}
          product={showQuickBuy}
          userTier={currentTier}
        />
      )}

      {showUpsell && (
        <UpsellModal
          isOpen
          onClose={() => setShowUpsell(null)}
          products={showUpsell}
          currentTier={currentTier}
        />
      )}

      {showCrisisAlert && (
        <CrisisAlertModal
          isOpen
          onClose={() => setShowCrisisAlert(false)}
        />
      )}

      {showGoalForm && (
        <GoalSettingForm
          isOpen
          onClose={() => setShowGoalForm(false)}
          onSubmit={(goal) => {
            setShowGoalForm(false);
            handleQuickSelect(`Toi muon dat muc tieu: ${goal.title || goal}`);
          }}
        />
      )}

      {showExportSelector && (
        <ExportTemplateSelector
          isOpen
          onClose={() => setShowExportSelector(false)}
          onSelect={handleExportSelect}
          currentTier={currentTier}
          messages={messages}
        />
      )}

      {showExportPreview && (
        <ExportPreview
          isOpen
          onClose={() => setShowExportPreview(null)}
          onConfirm={handleExportConfirm}
          format={showExportPreview.format}
          content={showExportPreview.content}
          messages={messages}
        />
      )}
    </div>
  );
}

// ==========================================
// Message Bubble Component (preserved)
// ==========================================
function MessageBubble({ message, onExport }) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const isProducts = message.type === 'products';
  const isAI = !isUser && !isSystem && !isProducts;

  if (isProducts && message.products) {
    return (
      <div className="chatbot-products-container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '8px',
        width: 'fit-content',
        maxWidth: 'none',
        alignItems: 'flex-start',
        overflow: 'visible'
      }}>
        {message.products.map((product, idx) => (
          <ProductCard key={idx} product={product} source="chatbot" />
        ))}
      </div>
    );
  }

  const hexagram = message.metadata?.hexagram;
  const tarotCards = message.metadata?.cards;
  const singleCard = message.metadata?.card;

  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/##/g, '')
      .replace(/###/g, '')
      .trim();
  };

  const baseStyle = {
    padding: '10px 14px',
    color: '#FFFFFF',
    fontSize: '14px',
    lineHeight: '1.6',
    wordWrap: 'break-word',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    marginBottom: '6px',
    display: 'block',
    width: 'fit-content'
  };

  const userStyle = {
    ...baseStyle,
    maxWidth: '75%',
    background: 'rgba(30, 42, 94, 0.4)',
    border: '1px solid rgba(255, 189, 89, 0.3)',
    borderRadius: '18px 18px 4px 18px',
    marginLeft: 'auto',
    marginRight: '0',
    alignSelf: 'flex-end'
  };

  const aiStyle = {
    ...baseStyle,
    maxWidth: '80%',
    background: 'rgba(30, 42, 94, 0.6)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '18px 18px 18px 4px',
    marginRight: 'auto',
    marginLeft: '0',
    alignSelf: 'flex-start'
  };

  const systemStyle = {
    ...baseStyle,
    maxWidth: '85%',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '12px',
    textAlign: 'center',
    margin: '0 auto 12px',
    alignSelf: 'center'
  };

  const timeStyle = {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: '6px',
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
      {hexagram && <HexagramVisual hexagram={hexagram} />}

      {tarotCards && tarotCards.length > 0 && (
        <div style={tarotSpreadStyle}>
          {tarotCards.map((card, idx) => (
            <TarotVisual key={idx} card={card} />
          ))}
        </div>
      )}

      {singleCard && <TarotVisual card={singleCard} />}

      <div style={{ marginBottom: '6px', whiteSpace: 'pre-wrap' }}>
        {cleanText(message.content)}
      </div>

      {isAI && onExport && (
        <button
          onClick={() => onExport(message)}
          style={{
            marginTop: '10px',
            padding: '6px 14px',
            background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
            border: '1px solid rgba(192, 132, 252, 0.3)',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
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
