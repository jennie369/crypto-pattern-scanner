/**
 * TarotReadingScreen
 * Full tarot reading experience with shuffle animation and card flipping
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  RefreshCw,
  Share2,
  Save,
  Check,
  MessageCircle,
  Sparkles,
  HelpCircle,
  Star,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { useTabBar } from '../../contexts/TabBarContext';

// Services
import tarotSpreadService from '../../services/tarotSpreadService';
import tarotInterpretationService from '../../services/tarotInterpretationService';
import readingHistoryService from '../../services/readingHistoryService';
import QuotaService from '../../services/quotaService';
import alertService from '../../services/alertService';

// Data
import { FULL_DECK } from '../../data/tarot';
import { getCardImage, TAROT_BACKGROUND } from '../../assets/tarot';
import { QUESTION_PROMPTS, getPromptsForArea, LIFE_AREAS } from '../../data/tarotSpreads';

// Components
import ShuffleAnimation from '../../components/GemMaster/ShuffleAnimation';
import SpreadLayout from '../../components/GemMaster/SpreadLayout';
import CrystalRecommendationNew from '../../components/GemMaster/CrystalRecommendationNew';
import ProductRecommendations from '../../components/GemMaster/ProductRecommendations';
import SmartFormCardNew from '../../components/GemMaster/SmartFormCardNew';
import { Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reading phases
const PHASE = {
  QUESTION: 'question',
  SHUFFLE: 'shuffle',
  DRAW: 'draw',
  INTERPRET: 'interpret',
  COMPLETE: 'complete',
};

const TarotReadingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, profile } = useAuth();
  const { hideTabBar, showTabBar } = useTabBar();

  // Get spread from route params
  const spread = route.params?.spread;

  // State
  const [phase, setPhase] = useState(PHASE.QUESTION);
  const [question, setQuestion] = useState('');
  const [selectedLifeArea, setSelectedLifeArea] = useState('general');
  const [drawnCards, setDrawnCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [interpretation, setInterpretation] = useState(null);
  const [isGeneratingInterpretation, setIsGeneratingInterpretation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState(null);
  const [showInlineVBForm, setShowInlineVBForm] = useState(false); // Vision Board form
  const [showGuidanceSection, setShowGuidanceSection] = useState(true); // Toggle for guidance sections

  // User tier
  const userTier = profile?.chatbot_tier || profile?.scanner_tier || 'FREE';

  // Question prompts based on spread category or selected life area
  const questionPrompts = useMemo(() => {
    const area = spread?.category === 'trading' ? 'trading'
      : spread?.category === 'love' ? 'love'
      : spread?.category === 'career' ? 'career'
      : selectedLifeArea;
    return getPromptsForArea(area);
  }, [spread?.category, selectedLifeArea]);

  // ========== EFFECTS ==========
  useEffect(() => {
    hideTabBar?.();
    return () => showTabBar?.();
  }, []);

  // ========== CARD DRAWING ==========
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const seed = Date.now() + Math.random() * 1000000;
      const j = Math.floor((seed % (i + 1)));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const drawCards = useCallback(() => {
    const cardCount = spread?.cards || 3;
    const shuffled = shuffleArray([...FULL_DECK]);

    // Draw cards with possible reversal (30% chance)
    const drawn = shuffled.slice(0, cardCount).map((card, index) => {
      const isReversed = Math.random() < 0.3;
      return {
        ...card,
        image: getCardImage(card.id),
        isReversed,
        positionIndex: index,
      };
    });

    setDrawnCards(drawn);
    setFlippedCards([]);
    setReadingStartTime(Date.now());
    setPhase(PHASE.DRAW);
  }, [spread]);

  // ========== HANDLERS ==========
  const handleStartReading = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check quota - uses chatbot quota (canQuery)
    try {
      const canProceed = await QuotaService.canQuery(user?.id);
      if (!canProceed) {
        // Show quota exceeded message
        alertService.warning('Hết lượt', 'Bạn đã hết lượt bói hôm nay. Nâng cấp để bói không giới hạn!');
        return;
      }
    } catch (err) {
      console.error('[TarotReadingScreen] Quota check error:', err);
      // Continue anyway if quota check fails
    }

    setPhase(PHASE.SHUFFLE);
  };

  const handleShuffleComplete = () => {
    drawCards();
  };

  const handleCardFlip = async (card, index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Add to flipped cards if not already flipped
    if (!flippedCards.includes(index)) {
      const newFlipped = [...flippedCards, index];
      setFlippedCards(newFlipped);

      // Check if all cards are flipped
      if (newFlipped.length === drawnCards.length) {
        // Start interpretation after short delay
        setTimeout(() => {
          generateInterpretation();
        }, 500);
      }
    }
  };

  const handleCardPress = (card, index) => {
    // TODO: Show card detail modal
    console.log('[TarotReadingScreen] Card pressed:', card?.vietnameseName || card?.name);
  };

  const generateInterpretation = async () => {
    setPhase(PHASE.INTERPRET);
    setIsGeneratingInterpretation(true);

    try {
      const { data, error } = await tarotInterpretationService.generateInterpretation(
        drawnCards,
        spread,
        question,
        selectedLifeArea
      );

      if (error) {
        console.error('[TarotReadingScreen] Interpretation error:', error);
      }

      setInterpretation(data);
      setPhase(PHASE.COMPLETE);

      // Decrement quota after successful reading
      try {
        await QuotaService.decrementQuota(user?.id);
      } catch (err) {
        console.error('[TarotReadingScreen] Quota decrement error:', err);
      }
    } catch (err) {
      console.error('[TarotReadingScreen] Generate interpretation error:', err);
      setInterpretation({
        overview: 'Đã xảy ra lỗi khi tạo giải đọc. Hãy thử lại sau.',
        advice: [],
        crystals: [],
        affirmation: 'Tôi tin tưởng vào hành trình của mình.',
        isFallback: true,
      });
      setPhase(PHASE.COMPLETE);
    } finally {
      setIsGeneratingInterpretation(false);
    }
  };

  const handleSaveReading = async () => {
    if (isSaving || isSaved) return;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const readingDuration = readingStartTime
        ? Math.floor((Date.now() - readingStartTime) / 1000)
        : null;

      const { data, error } = await readingHistoryService.saveTarotReading(user?.id, {
        spreadType: spread?.name_vi || spread?.name_en || 'Tarot',
        spreadId: spread?.spread_id,
        question,
        lifeArea: selectedLifeArea,
        cards: drawnCards.map((card, index) => ({
          position: index,
          card_id: card.id,
          name: card.vietnameseName || card.name,
          reversed: card.isReversed,
        })),
        overallInterpretation: interpretation?.overview || '',
        aiInterpretation: interpretation?.rawText || '',
        crystalRecommendations: interpretation?.crystals || [],
        affirmation: interpretation?.affirmation || '',
        reversedEnabled: true,
        readingDuration,
      });

      if (error) {
        alertService.error('Không thể lưu kết quả');
      } else {
        setIsSaved(true);
        alertService.success('Đã lưu vào lịch sử');
      }
    } catch (err) {
      console.error('[TarotReadingScreen] Save error:', err);
      alertService.error('Lỗi khi lưu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const cardNames = drawnCards.map(c => c.vietnameseName || c.name).join(', ');
      const shareText = `🔮 Trải bài ${spread?.name_vi || 'Tarot'}\n\n` +
        `Các lá: ${cardNames}\n\n` +
        `${interpretation?.overview || ''}\n\n` +
        `💎 Gemral - Ứng dụng Trading & Manifestation`;

      await Share.share({
        message: shareText,
      });
    } catch (err) {
      console.error('[TarotReadingScreen] Share error:', err);
    }
  };

  const handleNewReading = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase(PHASE.QUESTION);
    setQuestion('');
    setDrawnCards([]);
    setFlippedCards([]);
    setInterpretation(null);
    setIsSaved(false);
  };

  const handlePromptSelect = (prompt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuestion(prompt);
  };

  // ========== RENDER ==========
  const renderQuestionPhase = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Spread info */}
      <View style={styles.spreadInfo}>
        <Text style={styles.spreadName}>{spread?.name_vi || spread?.name_en || 'Trải bài'}</Text>
        <Text style={styles.spreadMeta}>{spread?.cards || 3} lá • {spread?.estimated_time || '5-7 phút'}</Text>
      </View>

      {/* Question input */}
      <View style={styles.questionSection}>
        <Text style={styles.sectionTitle}>Câu hỏi của bạn (tuỳ chọn)</Text>
        <View style={styles.inputContainer}>
          <HelpCircle size={20} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.questionInput}
            value={question}
            onChangeText={setQuestion}
            placeholder="Nhập câu hỏi hoặc chọn gợi ý bên dưới..."
            placeholderTextColor={COLORS.textDisabled}
            multiline
            maxLength={200}
          />
        </View>

        {/* Question prompts */}
        <View style={styles.promptsContainer}>
          {questionPrompts.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.promptChip}
              onPress={() => handlePromptSelect(prompt)}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Start button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartReading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={GRADIENTS.primaryButton}
          style={styles.buttonGradient}
        />
        <Sparkles size={20} color={COLORS.textPrimary} />
        <Text style={styles.startButtonText}>Bắt đầu xáo bài</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderShufflePhase = () => (
    <View style={styles.shuffleContainer}>
      <ShuffleAnimation
        onComplete={handleShuffleComplete}
        duration={3000}
        autoStart={true}
      />
    </View>
  );

  const renderDrawPhase = () => {
    const allFlipped = flippedCards.length === drawnCards.length;

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentDraw}
      >
        {/* Instructions */}
        {!allFlipped && (
          <View style={styles.instructionBanner}>
            <Text style={styles.instructionText}>
              Chạm vào từng lá bài để lật ({flippedCards.length}/{drawnCards.length})
            </Text>
          </View>
        )}

        {/* Spread Layout */}
        <SpreadLayout
          spread={spread}
          cards={drawnCards}
          flippedCards={flippedCards}
          onCardFlip={handleCardFlip}
          onCardPress={handleCardPress}
          containerHeight={
            spread?.cards >= 10 ? 600 :  // Celtic Cross
            spread?.cards >= 5 ? 480 :   // 2 rows (5-6 cards)
            spread?.cards >= 3 ? 320 :   // 3 cards row
            400                          // 1 card - large
          }
        />

        {/* Loading interpretation */}
        {allFlipped && isGeneratingInterpretation && (
          <View style={styles.interpretingContainer}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.interpretingText}>Đang phân tích trải bài...</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderCompletePhase = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContentComplete}
    >
      {/* Spread Layout */}
      <SpreadLayout
        spread={spread}
        cards={drawnCards}
        flippedCards={flippedCards}
        onCardPress={handleCardPress}
        containerHeight={
          spread?.cards >= 10 ? 550 :  // Celtic Cross
          spread?.cards >= 5 ? 420 :   // 2 rows (5-6 cards)
          spread?.cards >= 3 ? 280 :   // 3 cards row
          350                          // 1 card - large
        }
        disabled={true}
      />

      {/* Interpretation */}
      {interpretation && (
        <View style={styles.interpretationContainer}>
          {/* Card Analyses - show individual card meanings FIRST */}
          {interpretation.cardAnalysis?.length > 0 && (
            <View style={styles.interpretationSection}>
              <Text style={styles.interpretationTitle}>Ý nghĩa từng lá</Text>
              {interpretation.cardAnalysis.map((card, index) => (
                <View key={index} style={styles.cardAnalysisItem}>
                  <Text style={styles.cardAnalysisName}>{card.name}</Text>
                  <Text style={styles.cardAnalysisText}>{card.interpretation}</Text>
                  {card.keywords?.length > 0 && (
                    <View style={styles.keywordsRow}>
                      {card.keywords.slice(0, 3).map((kw, kwIdx) => (
                        <View key={kwIdx} style={styles.keywordChip}>
                          <Text style={styles.keywordText}>{kw}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Overview - Combined interpretation AFTER individual cards */}
          {interpretation.overview && (
            <View style={styles.interpretationSection}>
              <Text style={styles.interpretationTitle}>Kết luận tổng hợp</Text>
              <Text style={styles.interpretationText}>{interpretation.overview}</Text>
            </View>
          )}

          {/* Advice */}
          {interpretation.advice?.length > 0 && (
            <View style={styles.interpretationSection}>
              <Text style={styles.interpretationTitle}>Lời khuyên</Text>
              {interpretation.advice.map((item, index) => (
                <View key={index} style={styles.adviceItem}>
                  <View style={styles.adviceBullet} />
                  <Text style={styles.adviceText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Crystals */}
          {interpretation.crystals?.length > 0 && (
            <View style={styles.interpretationSection}>
              <Text style={styles.interpretationTitle}>Tinh thể khuyên dùng</Text>
              <CrystalRecommendationNew
                context={`${interpretation.crystals.map(c => c.name).join(' ')} tarot tâm linh năng lượng phong thủy`}
                limit={4}
              />
            </View>
          )}

          {/* Affirmation with Copy button */}
          {interpretation.affirmation && (
            <View style={styles.affirmationContainer}>
              <View style={styles.affirmationHeader}>
                <Text style={styles.affirmationLabel}>Affirmation</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={async () => {
                    await Clipboard.setStringAsync(interpretation.affirmation);
                    alertService.success('Đã sao chép!');
                  }}
                >
                  <Copy size={16} color={COLORS.gold} />
                </TouchableOpacity>
              </View>
              <Text style={styles.affirmationText}>"{interpretation.affirmation}"</Text>
            </View>
          )}

          {/* Action Steps - Kế Hoạch Hành Động */}
          {interpretation.actionSteps?.length > 0 && (
            <View style={styles.guidanceSection}>
              <Text style={styles.guidanceSectionTitle}>
                <Text style={{ color: COLORS.cyan }}>📋</Text> Kế Hoạch Hành Động
              </Text>
              <View style={styles.actionStepsContainer}>
                {interpretation.actionSteps.map((step, idx) => (
                  <View key={idx} style={styles.actionStepItem}>
                    <View style={styles.actionStepNumber}>
                      <Text style={styles.actionStepNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.actionStepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Rituals - Nghi Thức Tâm Linh */}
          {interpretation.rituals?.length > 0 && (
            <View style={styles.guidanceSection}>
              <Text style={styles.guidanceSectionTitle}>
                <Text style={{ color: COLORS.purple }}>💎</Text> Nghi Thức Tâm Linh
              </Text>
              <View style={styles.ritualsContainer}>
                {interpretation.rituals.map((ritual, idx) => (
                  <View key={idx} style={styles.ritualItem}>
                    <Text style={styles.ritualName}>{ritual.name}</Text>
                    <Text style={styles.ritualDescription}>{ritual.description}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Save to Vision Board Button */}
          {(interpretation.affirmation || interpretation.actionSteps?.length > 0 || interpretation.rituals?.length > 0) && (
            <View style={styles.visionBoardSection}>
              <TouchableOpacity
                style={styles.saveToVBButton}
                onPress={() => setShowInlineVBForm(true)}
                activeOpacity={0.7}
              >
                <Sparkles size={16} color={COLORS.gold} />
                <Text style={styles.saveToVBText}>Lưu vào Vision Board</Text>
              </TouchableOpacity>

              {/* INLINE Vision Board Form */}
              {showInlineVBForm && (
                <SmartFormCardNew
                  widget={{
                    type: 'goal',
                    title: `Mục tiêu từ ${spread?.name_vi || 'Tarot'}`,
                    icon: '🎯',
                    explanation: 'Lưu câu khẳng định, kế hoạch hành động và nghi thức tâm linh vào Vision Board để theo dõi và thực hiện mỗi ngày.',
                    affirmations: interpretation.affirmation ? [interpretation.affirmation] : [],
                    actionSteps: interpretation.actionSteps || [],
                    rituals: interpretation.rituals || [],
                    crystals: interpretation.crystals || [],
                    lifeArea: selectedLifeArea || 'personal',
                    goalText: `Thực hành thông điệp từ ${spread?.name_vi || 'Tarot'}`,
                    source: 'tarot',
                  }}
                  onDismiss={() => setShowInlineVBForm(false)}
                />
              )}
            </View>
          )}

          {/* Product Recommendations (Courses, Scanner, Affiliate) */}
          <ProductRecommendations
            context={`${interpretation.overview || ''} tarot tâm linh năng lượng tần số`}
          />

          {/* Fortune - Độ may mắn */}
          {interpretation.fortune && (
            <View style={styles.fortuneSection}>
              <Text style={styles.fortuneLabel}>Độ may mắn</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text
                    key={star}
                    style={[
                      styles.star,
                      star <= interpretation.fortune && styles.starActive,
                    ]}
                  >
                    ★
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Top Action buttons - Lưu + Chia sẻ */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, isSaved && styles.actionButtonSaved]}
          onPress={handleSaveReading}
          disabled={isSaving || isSaved}
        >
          {isSaved ? (
            <Check size={20} color={COLORS.green} />
          ) : (
            <Save size={20} color={COLORS.textPrimary} />
          )}
          <Text style={[styles.actionButtonText, isSaved && styles.actionButtonTextSaved]}>
            {isSaving ? 'Đang lưu...' : isSaved ? 'Đã lưu' : 'Lưu'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Share2 size={20} color={COLORS.textPrimary} />
          <Text style={styles.actionButtonText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Action buttons - Claim + Bói lại */}
      <View style={styles.bottomActionsRow}>
        {/* Claim Button */}
        <TouchableOpacity
          style={styles.claimButton}
          onPress={() => {
            const cardNames = drawnCards.map(c => c.vietnameseName || c.name).join(', ');
            const chatMessage = `🔮 Trải bài ${spread?.name_vi || 'Tarot'}\n\n` +
              `Các lá: ${cardNames}\n\n` +
              `${interpretation?.overview || ''}\n\n` +
              `💡 ${interpretation?.advice?.join('\n• ') || ''}`;

            navigation.navigate('GemMaster', {
              initialMessage: chatMessage,
              fromReading: true,
            });
          }}
        >
          <LinearGradient
            colors={GRADIENTS.gold || ['#FFBD59', '#D4AF37']}
            style={styles.claimButtonGradient}
          >
            <Text style={styles.claimButtonText}>✨ Claim</Text>
            <Text style={styles.claimButtonSubtext}>Nhận thông điệp</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bói lại Button */}
        <TouchableOpacity
          style={styles.recastButton}
          onPress={handleNewReading}
        >
          <RefreshCw size={20} color={COLORS.textPrimary} />
          <Text style={styles.recastButtonText}>Bói lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <ImageBackground
      source={TAROT_BACKGROUND}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay for readability */}
      <View style={styles.backgroundOverlay} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {spread?.name_vi || spread?.name_en || 'Tarot'}
          </Text>

          <View style={styles.headerRight} />
        </View>

        {/* Content based on phase */}
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {phase === PHASE.QUESTION && renderQuestionPhase()}
          {phase === PHASE.SHUFFLE && renderShufflePhase()}
          {(phase === PHASE.DRAW || phase === PHASE.INTERPRET) && renderDrawPhase()}
          {phase === PHASE.COMPLETE && renderCompletePhase()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 5, 25, 0.5)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  scrollContentDraw: {
    paddingVertical: SPACING.lg,
    paddingBottom: 100,
  },
  scrollContentComplete: {
    paddingVertical: SPACING.md,
    paddingBottom: 120,
  },
  spreadInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  spreadName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  spreadMeta: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  questionSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  questionInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  promptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  promptChip: {
    backgroundColor: COLORS.glassBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  promptText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  startButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  shuffleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionBanner: {
    backgroundColor: COLORS.glassBg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gold,
    textAlign: 'center',
  },
  interpretingContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  interpretingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  interpretationContainer: {
    paddingHorizontal: SPACING.lg,
  },
  interpretationSection: {
    backgroundColor: 'rgba(15, 22, 41, 0.85)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  interpretationTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },
  interpretationText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  cardAnalysisItem: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cardAnalysisName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
    marginBottom: SPACING.xs,
  },
  cardAnalysisText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  keywordChip: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  adviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.purple,
    marginRight: SPACING.sm,
    marginTop: 7,
  },
  adviceText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  affirmationContainer: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.lg,
  },
  affirmationLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  affirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  affirmationText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  copyButton: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  // Action Steps styles
  guidanceSection: {
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  guidanceSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  actionStepsContainer: {
    gap: SPACING.sm,
  },
  actionStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  actionStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionStepNumberText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
  actionStepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Rituals styles
  ritualsContainer: {
    gap: SPACING.md,
  },
  ritualItem: {
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  ritualName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  ritualDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  // Vision Board section styles
  visionBoardSection: {
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  saveToVBButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  saveToVBText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  actionButtonSaved: {
    borderColor: 'rgba(58, 247, 166, 0.5)',
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
  },
  actionButtonTextSaved: {
    color: COLORS.green,
  },
  // Fortune section - Độ may mắn
  fortuneSection: {
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.25)',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  fortuneLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  star: {
    fontSize: 24,
    color: 'rgba(255, 189, 89, 0.3)',
  },
  starActive: {
    color: COLORS.gold,
    textShadowColor: 'rgba(255, 189, 89, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  // Bottom Actions Row - Claim + Bói lại
  bottomActionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  claimButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  claimButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 16,
  },
  claimButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0F1030',
  },
  claimButtonSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(15, 16, 48, 0.7)',
    marginTop: 2,
  },
  recastButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.4)',
    backgroundColor: COLORS.glassBg,
  },
  recastButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default TarotReadingScreen;
