/**
 * TarotReadingPage - Multi-phase interactive tarot reading experience
 * Web Sync of gem-mobile TarotReadingScreen.js
 *
 * 5 Phases: QUESTION -> SHUFFLE -> DRAW -> INTERPRET -> COMPLETE
 *
 * Features:
 * - Spread selection from URL params
 * - Life area selector with quick question suggestions
 * - Full-screen shuffle animation
 * - Interactive card flip with 3D animations
 * - AI interpretation via gem-master-chat edge function
 * - Structured results with card-by-card analysis
 * - Auto-save to reading history
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  RefreshCw,
  MessageCircle,
  Sparkles,
  HelpCircle,
  Star,
  Copy,
  Check,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
  Gem,
  Wand2,
} from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, TIER_STYLES, BREAKPOINTS } from '../../../../web design-tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import ShuffleAnimation from '../../components/GemMaster/ShuffleAnimation';
import SpreadLayout from '../../components/GemMaster/SpreadLayout';

// ============================================================
// TAROT CARD DATA - Major Arcana (22 cards)
// ============================================================
const MAJOR_ARCANA = [
  { id: 0, name: 'The Fool', nameVi: 'Ke Kho', vietnameseName: 'Ke Kho', keywords: ['new beginnings', 'adventure', 'potential'], keywordsVi: ['khoi dau moi', 'phieu luu', 'tiem nang'] },
  { id: 1, name: 'The Magician', nameVi: 'Phap Su', vietnameseName: 'Phap Su', keywords: ['manifestation', 'power', 'action'], keywordsVi: ['hien thuc hoa', 'suc manh', 'hanh dong'] },
  { id: 2, name: 'The High Priestess', nameVi: 'Nu Tu Te', vietnameseName: 'Nu Tu Te', keywords: ['intuition', 'mystery', 'inner voice'], keywordsVi: ['truc giac', 'bi an', 'tieng noi noi tam'] },
  { id: 3, name: 'The Empress', nameVi: 'Hoang Hau', vietnameseName: 'Hoang Hau', keywords: ['abundance', 'nurturing', 'fertility'], keywordsVi: ['sung tuc', 'che cho', 'mau mo'] },
  { id: 4, name: 'The Emperor', nameVi: 'Hoang De', vietnameseName: 'Hoang De', keywords: ['authority', 'structure', 'control'], keywordsVi: ['quyen luc', 'ky luat', 'kiem soat'] },
  { id: 5, name: 'The Hierophant', nameVi: 'Giao Hoang', vietnameseName: 'Giao Hoang', keywords: ['tradition', 'wisdom', 'spiritual guidance'], keywordsVi: ['truyen thong', 'tri tue', 'huong dan tam linh'] },
  { id: 6, name: 'The Lovers', nameVi: 'Doi Tinh Nhan', vietnameseName: 'Doi Tinh Nhan', keywords: ['love', 'harmony', 'choices'], keywordsVi: ['tinh yeu', 'hoa hop', 'lua chon'] },
  { id: 7, name: 'The Chariot', nameVi: 'Co Xe', vietnameseName: 'Co Xe', keywords: ['willpower', 'victory', 'determination'], keywordsVi: ['y chi', 'chien thang', 'quyet tam'] },
  { id: 8, name: 'Strength', nameVi: 'Suc Manh', vietnameseName: 'Suc Manh', keywords: ['courage', 'patience', 'inner strength'], keywordsVi: ['dung cam', 'kien nhan', 'suc manh noi tai'] },
  { id: 9, name: 'The Hermit', nameVi: 'An Si', vietnameseName: 'An Si', keywords: ['solitude', 'soul-searching', 'guidance'], keywordsVi: ['co don', 'tim kiem ban than', 'dan duong'] },
  { id: 10, name: 'Wheel of Fortune', nameVi: 'Vong Quay Van Menh', vietnameseName: 'Vong Quay Van Menh', keywords: ['destiny', 'cycles', 'turning point'], keywordsVi: ['dinh menh', 'chu ky', 'buoc ngoat'] },
  { id: 11, name: 'Justice', nameVi: 'Cong Ly', vietnameseName: 'Cong Ly', keywords: ['fairness', 'truth', 'karma'], keywordsVi: ['cong bang', 'su that', 'nhan qua'] },
  { id: 12, name: 'The Hanged Man', nameVi: 'Nguoi Bi Treo', vietnameseName: 'Nguoi Bi Treo', keywords: ['surrender', 'new perspective', 'letting go'], keywordsVi: ['buong bo', 'goc nhin moi', 'tha thu'] },
  { id: 13, name: 'Death', nameVi: 'Than Chet', vietnameseName: 'Than Chet', keywords: ['transformation', 'endings', 'rebirth'], keywordsVi: ['chuyen doi', 'ket thuc', 'tai sinh'] },
  { id: 14, name: 'Temperance', nameVi: 'Dieu Do', vietnameseName: 'Dieu Do', keywords: ['balance', 'moderation', 'patience'], keywordsVi: ['can bang', 'dieu do', 'kien nhan'] },
  { id: 15, name: 'The Devil', nameVi: 'Ac Quy', vietnameseName: 'Ac Quy', keywords: ['bondage', 'addiction', 'shadow self'], keywordsVi: ['rang buoc', 'nghien', 'bong toi ban than'] },
  { id: 16, name: 'The Tower', nameVi: 'Ngon Thap', vietnameseName: 'Ngon Thap', keywords: ['upheaval', 'revelation', 'sudden change'], keywordsVi: ['bien dong', 'khai sang', 'thay doi dot ngot'] },
  { id: 17, name: 'The Star', nameVi: 'Ngoi Sao', vietnameseName: 'Ngoi Sao', keywords: ['hope', 'inspiration', 'serenity'], keywordsVi: ['hy vong', 'cam hung', 'thanh than'] },
  { id: 18, name: 'The Moon', nameVi: 'Mat Trang', vietnameseName: 'Mat Trang', keywords: ['illusion', 'fear', 'subconscious'], keywordsVi: ['ao anh', 'noi so', 'tiem thuc'] },
  { id: 19, name: 'The Sun', nameVi: 'Mat Troi', vietnameseName: 'Mat Troi', keywords: ['joy', 'success', 'vitality'], keywordsVi: ['niem vui', 'thanh cong', 'suc song'] },
  { id: 20, name: 'Judgement', nameVi: 'Phan Xet', vietnameseName: 'Phan Xet', keywords: ['reflection', 'reckoning', 'awakening'], keywordsVi: ['nhin lai', 'phan xet', 'thuc tinh'] },
  { id: 21, name: 'The World', nameVi: 'The Gioi', vietnameseName: 'The Gioi', keywords: ['completion', 'fulfillment', 'wholeness'], keywordsVi: ['hoan thanh', 'vien man', 'tron ven'] },
];

// Minor Arcana suits
const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const SUITS_VI = { Wands: 'Gay', Cups: 'Coc', Swords: 'Kiem', Pentacles: 'Dong Xu' };
const COURT_CARDS = ['Page', 'Knight', 'Queen', 'King'];
const COURT_CARDS_VI = { Page: 'Hau', Knight: 'Ky Si', Queen: 'Hoang Hau', King: 'Vua' };

// Generate Minor Arcana (56 cards)
const MINOR_ARCANA = [];
let minorId = 22;
for (const suit of SUITS) {
  // Numbered cards (Ace-10)
  for (let num = 1; num <= 10; num++) {
    const numName = num === 1 ? 'Ace' : String(num);
    MINOR_ARCANA.push({
      id: minorId++,
      name: `${numName} of ${suit}`,
      nameVi: `${numName} ${SUITS_VI[suit]}`,
      vietnameseName: `${numName} ${SUITS_VI[suit]}`,
      suit,
      number: num,
      keywords: [],
      keywordsVi: [],
    });
  }
  // Court cards
  for (const court of COURT_CARDS) {
    MINOR_ARCANA.push({
      id: minorId++,
      name: `${court} of ${suit}`,
      nameVi: `${COURT_CARDS_VI[court]} ${SUITS_VI[suit]}`,
      vietnameseName: `${COURT_CARDS_VI[court]} ${SUITS_VI[suit]}`,
      suit,
      court,
      keywords: [],
      keywordsVi: [],
    });
  }
}

const FULL_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// ============================================================
// SPREAD CONFIGURATIONS
// ============================================================
const SPREAD_CONFIGS = {
  single: {
    name: 'Mot la',
    nameEn: 'Single Card',
    cards: 1,
    estimatedTime: '2-3 phut',
    description: 'Rut mot la bai de nhan thong diep nhanh cho ngay hom nay.',
    layout_type: 'horizontal',
    positions: [{ name: 'Thong diep', x: 50, y: 50 }],
  },
  'past-present-future': {
    name: 'Qua khu - Hien tai - Tuong lai',
    nameEn: 'Past Present Future',
    cards: 3,
    estimatedTime: '5-7 phut',
    description: 'Ba la bai the hien dong chay thoi gian va su phat trien cua van de.',
    layout_type: 'horizontal',
    positions: [
      { name: 'Qua khu', x: 20, y: 50 },
      { name: 'Hien tai', x: 50, y: 50 },
      { name: 'Tuong lai', x: 80, y: 50 },
    ],
  },
  'love-spread': {
    name: 'Trai bai Tinh Yeu',
    nameEn: 'Love Spread',
    cards: 5,
    estimatedTime: '8-10 phut',
    description: 'Kham pha nang luong tinh yeu va moi quan he cua ban.',
    layout_type: 'horizontal',
    category: 'love',
    positions: [
      { name: 'Ban', x: 20, y: 50 },
      { name: 'Doi phuong', x: 40, y: 50 },
      { name: 'Moi quan he', x: 60, y: 50 },
      { name: 'Thu thach', x: 30, y: 80 },
      { name: 'Ket qua', x: 50, y: 80 },
    ],
  },
  'career-spread': {
    name: 'Trai bai Su Nghiep',
    nameEn: 'Career Spread',
    cards: 5,
    estimatedTime: '8-10 phut',
    description: 'Xem xet con duong su nghiep va co hoi phat trien.',
    layout_type: 'horizontal',
    category: 'career',
    positions: [
      { name: 'Hien tai', x: 50, y: 20 },
      { name: 'Thu thach', x: 20, y: 50 },
      { name: 'The manh', x: 50, y: 50 },
      { name: 'Loi khuyen', x: 80, y: 50 },
      { name: 'Ket qua', x: 50, y: 80 },
    ],
  },
  'celtic-cross': {
    name: 'Celtic Cross',
    nameEn: 'Celtic Cross',
    cards: 10,
    estimatedTime: '15-20 phut',
    description: 'Trai bai kinh dien va chi tiet nhat voi 10 la, phan tich moi khia canh cua van de.',
    layout_type: 'cross',
    positions: [
      { name: 'Hien tai', x: 30, y: 50 },
      { name: 'Thu thach', x: 30, y: 50, rotation: 90 },
      { name: 'Nen tang', x: 30, y: 80 },
      { name: 'Qua khu', x: 10, y: 50 },
      { name: 'Kha nang', x: 30, y: 20 },
      { name: 'Tuong lai gan', x: 50, y: 50 },
      { name: 'Ban than', x: 70, y: 80 },
      { name: 'Moi truong', x: 70, y: 60 },
      { name: 'Hy vong', x: 70, y: 40 },
      { name: 'Ket qua', x: 70, y: 20 },
    ],
  },
};

// ============================================================
// QUESTION SUGGESTIONS BY LIFE AREA
// ============================================================
const QUESTION_SUGGESTIONS = {
  general: ['Hom nay the nao?', 'Toi can biet dieu gi?', 'Nang luong hien tai?'],
  love: ['Moi quan he se ra sao?', 'Tinh yeu dang o dau?', 'Nguoi ay nghi gi?'],
  career: ['Su nghiep phat trien the nao?', 'Nen chuyen viec khong?', 'Co hoi nao dang den?'],
  trading: ['Thi truong se the nao?', 'Nen entry hay doi?', 'Tam ly trading hien tai?'],
};

const LIFE_AREAS = [
  { key: 'general', label: 'Tong quat', icon: Sparkles },
  { key: 'love', label: 'Tinh yeu', icon: Gem },
  { key: 'career', label: 'Su nghiep', icon: BookOpen },
  { key: 'trading', label: 'Trading', icon: Layers },
];

// ============================================================
// PHASE CONSTANTS
// ============================================================
const PHASE = {
  QUESTION: 'question',
  SHUFFLE: 'shuffle',
  DRAW: 'draw',
  INTERPRET: 'interpret',
  COMPLETE: 'complete',
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const TarotReadingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const abortControllerRef = useRef(null);

  // Get spread from URL params
  const spreadKey = searchParams.get('spread') || 'past-present-future';
  const spread = SPREAD_CONFIGS[spreadKey] || SPREAD_CONFIGS['past-present-future'];

  // Phase state
  const [phase, setPhase] = useState(PHASE.QUESTION);
  const [question, setQuestion] = useState('');
  const [lifeArea, setLifeArea] = useState('general');
  const [drawnCards, setDrawnCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [interpretation, setInterpretation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [copiedAffirmation, setCopiedAffirmation] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState(null);

  // Derived state
  const userTier = profile?.chatbot_tier || profile?.scanner_tier || 'FREE';
  const allFlipped = flippedCards.size === drawnCards.length && drawnCards.length > 0;

  // Life area from spread category
  useEffect(() => {
    if (spread.category) {
      setLifeArea(spread.category);
    }
  }, [spread.category]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Question prompts based on selected life area
  const questionPrompts = useMemo(() => {
    return QUESTION_SUGGESTIONS[lifeArea] || QUESTION_SUGGESTIONS.general;
  }, [lifeArea]);

  // ========== CARD DRAWING ==========
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const seed = Date.now() + Math.random() * 1000000;
      const j = Math.floor(seed % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const drawCards = useCallback(() => {
    const cardCount = spread.cards || 3;
    const shuffled = shuffleArray([...FULL_DECK]);

    const drawn = shuffled.slice(0, cardCount).map((card, index) => {
      const isReversed = Math.random() < 0.5;
      return {
        ...card,
        isReversed,
        positionIndex: index,
        positionName: spread.positions?.[index]?.name || `Vi tri ${index + 1}`,
      };
    });

    setDrawnCards(drawn);
    setFlippedCards(new Set());
    setReadingStartTime(Date.now());
    setPhase(PHASE.DRAW);
  }, [spread]);

  // ========== HANDLERS ==========
  const handleStartReading = () => {
    setError(null);
    setPhase(PHASE.SHUFFLE);
  };

  const handleShuffleComplete = useCallback(() => {
    drawCards();
  }, [drawCards]);

  const handleCardFlip = useCallback((card, index) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (!next.has(index)) {
        next.add(index);

        // Check if all cards are flipped after this one
        if (next.size === drawnCards.length) {
          setTimeout(() => {
            generateInterpretation();
          }, 600);
        }
      }
      return next;
    });
  }, [drawnCards.length]);

  const generateInterpretation = async () => {
    setPhase(PHASE.INTERPRET);
    setIsGenerating(true);
    setError(null);

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 30s timeout for AI interpretation
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const cardsPayload = drawnCards.map((card, idx) => ({
        position: idx,
        positionName: card.positionName,
        name: card.name,
        nameVi: card.vietnameseName || card.nameVi,
        reversed: card.isReversed,
        keywords: card.keywords,
      }));

      const { data, error: fnError } = await supabase.functions.invoke('gem-master-chat', {
        body: {
          message: `Interpret this tarot reading: Spread: ${spread.name}, Question: ${question || 'Thong diep chung'}, Life Area: ${lifeArea}, Cards: ${JSON.stringify(cardsPayload)}`,
          mode: 'tarot',
          userId: user?.id,
          spreadName: spread.name,
          question: question || 'Thong diep chung',
          lifeArea,
          cards: cardsPayload,
        },
      });

      clearTimeout(timeoutId);

      if (controller.signal.aborted) return;

      if (fnError) {
        console.error('[TarotReadingPage] AI interpretation error:', fnError);
        throw new Error(fnError.message || 'AI interpretation failed');
      }

      // Parse AI response — the edge function may return structured data or raw text
      const parsed = parseInterpretation(data);
      setInterpretation(parsed);
      setPhase(PHASE.COMPLETE);

      // Auto-save reading
      saveReading(parsed);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn('[TarotReadingPage] AI request timed out');
        setError('Het thoi gian cho. Vui long thu lai.');
      } else {
        console.error('[TarotReadingPage] Generate interpretation error:', err);
        setError(err.message || 'Khong the tao giai doc. Vui long thu lai.');
      }
      // Set fallback interpretation so user can still see results
      const fallback = {
        overview: 'Da xay ra loi khi tao giai doc. Hay thu lai sau.',
        cardAnalysis: drawnCards.map((card) => ({
          name: card.vietnameseName || card.name,
          positionName: card.positionName,
          reversed: card.isReversed,
          interpretation: card.isReversed
            ? `${card.name} nguoc - hay xem xet mat trai cua nang luong nay.`
            : `${card.name} - nang luong dang hien dien trong cuoc song ban.`,
          keywords: card.keywords || [],
        })),
        advice: ['Hay tin tuong vao truc giac cua ban.', 'Danh thoi gian suy ngam ve cac la bai.'],
        actionSteps: [],
        crystals: [],
        rituals: [],
        affirmation: 'Toi tin tuong vao hanh trinh cua minh.',
        fortune: 3,
        isFallback: true,
      };
      setInterpretation(fallback);
      setPhase(PHASE.COMPLETE);
    } finally {
      setIsGenerating(false);
    }
  };

  const parseInterpretation = (data) => {
    // If the response is already structured
    if (data?.overview || data?.interpretation) {
      return {
        overview: data.overview || data.interpretation || '',
        cardAnalysis: data.cardAnalysis || data.cards || drawnCards.map((card) => ({
          name: card.vietnameseName || card.name,
          positionName: card.positionName,
          reversed: card.isReversed,
          interpretation: '',
          keywords: card.keywords || [],
        })),
        advice: data.advice || [],
        actionSteps: data.actionSteps || [],
        crystals: data.crystals || [],
        rituals: data.rituals || [],
        affirmation: data.affirmation || '',
        fortune: data.fortune || Math.floor(Math.random() * 3) + 3,
        rawText: data.rawText || data.text || '',
      };
    }

    // If the response is raw text, build a structured object
    const text = typeof data === 'string' ? data : (data?.text || data?.message || '');
    return {
      overview: text,
      cardAnalysis: drawnCards.map((card) => ({
        name: card.vietnameseName || card.name,
        positionName: card.positionName,
        reversed: card.isReversed,
        interpretation: '',
        keywords: card.keywords || [],
      })),
      advice: [],
      actionSteps: [],
      crystals: [],
      rituals: [],
      affirmation: '',
      fortune: Math.floor(Math.random() * 3) + 3,
      rawText: text,
    };
  };

  const saveReading = async (interp) => {
    if (!user?.id) return;
    setIsSaving(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const readingDuration = readingStartTime
        ? Math.floor((Date.now() - readingStartTime) / 1000)
        : null;

      const { error: saveError } = await supabase
        .from('tarot_readings')
        .insert({
          user_id: user.id,
          spread_type: spread.name,
          spread_key: spreadKey,
          question: question || null,
          life_area: lifeArea,
          cards: drawnCards.map((card, index) => ({
            position: index,
            positionName: card.positionName,
            card_id: card.id,
            name: card.vietnameseName || card.name,
            reversed: card.isReversed,
          })),
          interpretation: interp?.overview || '',
          ai_interpretation: interp?.rawText || JSON.stringify(interp),
          affirmation: interp?.affirmation || '',
          fortune_rating: interp?.fortune || null,
          reading_duration: readingDuration,
        });

      clearTimeout(timeoutId);

      if (saveError) {
        console.error('[TarotReadingPage] Save error:', saveError);
      } else {
        setIsSaved(true);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[TarotReadingPage] Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetryInterpretation = () => {
    setError(null);
    setInterpretation(null);
    generateInterpretation();
  };

  const handleNewReading = () => {
    setPhase(PHASE.QUESTION);
    setQuestion('');
    setDrawnCards([]);
    setFlippedCards(new Set());
    setInterpretation(null);
    setError(null);
    setIsSaved(false);
    setExpandedCards(new Set());
    setCopiedAffirmation(false);
  };

  const handleCopyAffirmation = async () => {
    if (!interpretation?.affirmation) return;
    try {
      await navigator.clipboard.writeText(interpretation.affirmation);
      setCopiedAffirmation(true);
      setTimeout(() => setCopiedAffirmation(false), 2000);
    } catch (err) {
      console.error('[TarotReadingPage] Copy failed:', err);
    }
  };

  const toggleCardExpanded = (index) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleAskGemMaster = () => {
    const cardNames = drawnCards.map((c) => c.vietnameseName || c.name).join(', ');
    const prompt = `Toi vua trai bai ${spread.name}. Cau hoi: ${question || 'Thong diep chung'}. Cac la: ${cardNames}. ${interpretation?.overview || ''} Hay giai thich them ve ket qua nay.`;
    navigate(`/chatbot?initialPrompt=${encodeURIComponent(prompt)}&fromReading=true`);
  };

  // ============================================================
  // RENDER PHASES
  // ============================================================

  // ----- PHASE 1: QUESTION -----
  const renderQuestionPhase = () => (
    <motion.div
      key="question-phase"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={styles.phaseContainer}
    >
      {/* Spread Info Card */}
      <div style={styles.spreadInfoCard}>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <h2 style={styles.spreadName}>{spread.name}</h2>
          <div style={styles.spreadMetaRow}>
            <span style={styles.spreadMetaItem}>
              <Layers size={14} color={COLORS.gold} />
              {spread.cards} la
            </span>
            <span style={styles.spreadMetaDot} />
            <span style={styles.spreadMetaItem}>
              <Clock size={14} color={COLORS.gold} />
              {spread.estimatedTime}
            </span>
          </div>
          <p style={styles.spreadDescription}>{spread.description}</p>
        </motion.div>
      </div>

      {/* Life Area Selector */}
      <div style={styles.sectionBlock}>
        <label style={styles.sectionLabel}>Linh vuc</label>
        <div style={styles.lifeAreaRow}>
          {LIFE_AREAS.map((area) => {
            const isActive = lifeArea === area.key;
            const Icon = area.icon;
            return (
              <motion.button
                key={area.key}
                onClick={() => setLifeArea(area.key)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  ...styles.lifeAreaPill,
                  ...(isActive ? styles.lifeAreaPillActive : {}),
                }}
              >
                <Icon size={14} color={isActive ? COLORS.bgPrimary : COLORS.textMuted} />
                <span style={{
                  ...styles.lifeAreaPillText,
                  ...(isActive ? styles.lifeAreaPillTextActive : {}),
                }}>
                  {area.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Question Input */}
      <div style={styles.sectionBlock}>
        <label style={styles.sectionLabel}>Cau hoi cua ban (tuy chon)</label>
        <div style={styles.textareaContainer}>
          <HelpCircle size={18} color={COLORS.textMuted} style={{ flexShrink: 0, marginTop: 2 }} />
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
            placeholder="Ban muon hoi gi?..."
            maxLength={200}
            rows={3}
            style={styles.textarea}
          />
        </div>
        <div style={styles.charCount}>{question.length}/200</div>
      </div>

      {/* Quick Question Suggestions */}
      <div style={styles.suggestionsRow}>
        {questionPrompts.map((prompt, idx) => (
          <motion.button
            key={idx}
            onClick={() => setQuestion(prompt)}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            style={styles.suggestionChip}
          >
            <span style={styles.suggestionText}>{prompt}</span>
          </motion.button>
        ))}
      </div>

      {/* Start Button */}
      <motion.button
        onClick={handleStartReading}
        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255, 189, 89, 0.4)' }}
        whileTap={{ scale: 0.98 }}
        style={styles.startButton}
      >
        <Wand2 size={20} color={COLORS.bgPrimary} />
        <span style={styles.startButtonText}>Bat dau rut bai</span>
      </motion.button>
    </motion.div>
  );

  // ----- PHASE 2: SHUFFLE -----
  const renderShufflePhase = () => (
    <motion.div
      key="shuffle-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.shuffleFullscreen}
    >
      <ShuffleAnimation
        isShuffling={true}
        onShuffleComplete={handleShuffleComplete}
        cardCount={Math.min(spread.cards, 7)}
        duration={3000}
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={styles.shuffleText}
      >
        Dang xao bai...
      </motion.p>
    </motion.div>
  );

  // ----- PHASE 3: DRAW -----
  const renderDrawPhase = () => {
    const flippedCount = flippedCards.size;
    const totalCards = drawnCards.length;

    return (
      <motion.div
        key="draw-phase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.phaseContainer}
      >
        {/* Instruction Banner */}
        {!allFlipped && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.instructionBanner}
          >
            <span style={styles.instructionText}>
              Cham vao tung la bai de lat
            </span>
            <span style={styles.progressText}>{flippedCount}/{totalCards}</span>
          </motion.div>
        )}

        {/* Progress Dots */}
        <div style={styles.progressDotsRow}>
          {drawnCards.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                backgroundColor: flippedCards.has(idx) ? COLORS.gold : 'rgba(255, 255, 255, 0.2)',
                scale: flippedCards.has(idx) ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              style={styles.progressDot}
            />
          ))}
        </div>

        {/* Spread Layout */}
        <SpreadLayout
          spread={spread}
          cards={drawnCards}
          flippedCards={[...flippedCards]}
          onCardFlip={handleCardFlip}
          containerHeight={
            spread.cards >= 10 ? 600 :
            spread.cards >= 5 ? 480 :
            spread.cards >= 3 ? 340 :
            400
          }
          disabled={false}
        />

        {/* All flipped - transition indicator */}
        {allFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.allFlippedBanner}
          >
            <Sparkles size={16} color={COLORS.gold} />
            <span style={styles.allFlippedText}>Tat ca la bai da lat! Dang phan tich...</span>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // ----- PHASE 4: INTERPRET -----
  const renderInterpretPhase = () => (
    <motion.div
      key="interpret-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.interpretContainer}
    >
      {/* Cosmic spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={styles.cosmicSpinner}
      >
        <svg width="80" height="80" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="url(#spinnerGrad)" strokeWidth="2" fill="none" strokeDasharray="80 200" />
          <circle cx="50" cy="50" r="35" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="25" stroke="rgba(255, 189, 89, 0.3)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="8" fill="rgba(255, 189, 89, 0.6)" />
          <defs>
            <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFBD59" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#FFBD59" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={styles.interpretingText}
      >
        Dang phan tich thong diep...
      </motion.p>

      <p style={styles.interpretingSubtext}>
        Gem Master dang doc cac la bai va tao giai doc cho ban
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.errorCard}
        >
          <AlertCircle size={20} color={COLORS.error} />
          <span style={styles.errorText}>{error}</span>
          <button onClick={handleRetryInterpretation} style={styles.retryButton}>
            <RefreshCw size={16} color={COLORS.textPrimary} />
            <span>Thu lai</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );

  // ----- PHASE 5: COMPLETE -----
  const renderCompletePhase = () => {
    if (!interpretation) return null;

    return (
      <motion.div
        key="complete-phase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.completeContainer}
      >
        {/* Header: Spread name + date + fortune rating */}
        <div style={styles.resultHeader}>
          <div>
            <h2 style={styles.resultTitle}>{spread.name}</h2>
            <p style={styles.resultDate}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {interpretation.fortune && (
            <div style={styles.fortuneRating}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  color={s <= interpretation.fortune ? COLORS.gold : 'rgba(255, 255, 255, 0.15)'}
                  fill={s <= interpretation.fortune ? COLORS.gold : 'none'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Save status */}
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.savedBadge}
          >
            <Check size={14} color={COLORS.success} />
            <span style={styles.savedBadgeText}>Da luu</span>
          </motion.div>
        )}

        {/* Cards Overview: Horizontal scroll */}
        <div style={styles.cardsOverviewSection}>
          <h3 style={styles.sectionTitle}>Cac la bai</h3>
          <div style={styles.cardsOverviewScroll}>
            {drawnCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                style={styles.miniCard}
              >
                <div style={{
                  ...styles.miniCardInner,
                  transform: card.isReversed ? 'rotate(180deg)' : 'none',
                }}>
                  <span style={styles.miniCardNumber}>{card.id <= 21 ? card.id : ''}</span>
                </div>
                <span style={styles.miniCardName}>
                  {card.vietnameseName || card.name}
                </span>
                <span style={styles.miniCardPosition}>{card.positionName}</span>
                {card.isReversed && (
                  <span style={styles.miniReversedBadge}>Nguoc</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Card-by-Card Analysis */}
        {interpretation.cardAnalysis?.length > 0 && (
          <div style={styles.analysisSection}>
            <h3 style={styles.sectionTitle}>Y nghia tung la</h3>
            {interpretation.cardAnalysis.map((cardResult, idx) => {
              const isExpanded = expandedCards.has(idx);
              const originalCard = drawnCards[idx];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  style={styles.analysisCard}
                >
                  <button
                    onClick={() => toggleCardExpanded(idx)}
                    style={styles.analysisCardHeader}
                  >
                    <div style={styles.analysisCardLeft}>
                      <div style={styles.analysisCardIcon}>
                        <span style={styles.analysisCardIconText}>{idx + 1}</span>
                      </div>
                      <div>
                        <span style={styles.analysisCardName}>
                          {cardResult.name}
                          {cardResult.reversed ? ' (Nguoc)' : ''}
                        </span>
                        <span style={styles.analysisCardPosition}>{cardResult.positionName}</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={18} color={COLORS.textMuted} />
                    ) : (
                      <ChevronDown size={18} color={COLORS.textMuted} />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={styles.analysisCardBody}>
                          {/* Keywords */}
                          {(cardResult.keywords?.length > 0 || originalCard?.keywords?.length > 0) && (
                            <div style={styles.keywordsRow}>
                              {(cardResult.keywords || originalCard?.keywords || []).slice(0, 4).map((kw, kwIdx) => (
                                <span key={kwIdx} style={styles.keywordPill}>{kw}</span>
                              ))}
                            </div>
                          )}
                          {/* Interpretation text */}
                          <p style={styles.analysisText}>
                            {cardResult.interpretation || 'Hay cam nhan nang luong cua la bai nay trong boi canh cua ban.'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Overall Interpretation - Glass card with cosmic background */}
        {interpretation.overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.overviewCard}
          >
            <div style={styles.overviewCardBg} />
            <h3 style={styles.overviewTitle}>Ket luan tong hop</h3>
            <p style={styles.overviewText}>{interpretation.overview}</p>
          </motion.div>
        )}

        {/* Advice - numbered list with gradient bullets */}
        {interpretation.advice?.length > 0 && (
          <div style={styles.adviceSection}>
            <h3 style={styles.sectionTitle}>Loi khuyen</h3>
            {interpretation.advice.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={styles.adviceItem}
              >
                <div style={styles.adviceBullet}>
                  <span style={styles.adviceBulletText}>{idx + 1}</span>
                </div>
                <span style={styles.adviceText}>{item}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Action Steps - Checklist */}
        {interpretation.actionSteps?.length > 0 && (
          <div style={styles.actionStepsSection}>
            <h3 style={styles.sectionTitle}>Ke Hoach Hanh Dong</h3>
            <div style={styles.actionStepsList}>
              {interpretation.actionSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  style={styles.actionStepItem}
                >
                  <div style={styles.actionStepCheck}>
                    <Check size={12} color={COLORS.bgPrimary} />
                  </div>
                  <span style={styles.actionStepText}>{step}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Affirmation - Gold highlighted box with copy button */}
        {interpretation.affirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={styles.affirmationCard}
          >
            <div style={styles.affirmationHeader}>
              <Sparkles size={16} color={COLORS.gold} />
              <span style={styles.affirmationLabel}>Affirmation</span>
              <button
                onClick={handleCopyAffirmation}
                style={styles.copyButton}
                title="Sao chep"
              >
                {copiedAffirmation ? (
                  <Check size={14} color={COLORS.success} />
                ) : (
                  <Copy size={14} color={COLORS.gold} />
                )}
              </button>
            </div>
            <p style={styles.affirmationText}>"{interpretation.affirmation}"</p>
          </motion.div>
        )}

        {/* Crystal Recommendations */}
        {interpretation.crystals?.length > 0 && (
          <div style={styles.crystalSection}>
            <h3 style={styles.sectionTitle}>Tinh the khuyen dung</h3>
            <div style={styles.crystalGrid}>
              {interpretation.crystals.map((crystal, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -2 }}
                  style={styles.crystalCard}
                >
                  <Gem size={20} color={COLORS.purple} />
                  <span style={styles.crystalName}>{crystal.name || crystal}</span>
                  {crystal.description && (
                    <span style={styles.crystalDesc}>{crystal.description}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Rituals */}
        {interpretation.rituals?.length > 0 && (
          <div style={styles.ritualsSection}>
            <h3 style={styles.sectionTitle}>Nghi Thuc Tam Linh</h3>
            {interpretation.rituals.map((ritual, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={styles.ritualCard}
              >
                <span style={styles.ritualName}>{ritual.name || ritual}</span>
                {ritual.description && (
                  <p style={styles.ritualDescription}>{ritual.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Error retry (in case fallback was used) */}
        {interpretation.isFallback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.fallbackBanner}
          >
            <AlertCircle size={16} color={COLORS.warning} />
            <span style={styles.fallbackText}>Ket qua tam thoi. Nhan "Thu lai" de nhan giai doc day du tu AI.</span>
            <button onClick={handleRetryInterpretation} style={styles.retryButtonSmall}>
              <RefreshCw size={14} />
              <span>Thu lai</span>
            </button>
          </motion.div>
        )}

        {/* Bottom spacer for sticky bar */}
        <div style={{ height: 100 }} />
      </motion.div>
    );
  };

  // ============================================================
  // BOTTOM ACTION BAR (sticky, only in COMPLETE phase)
  // ============================================================
  const renderBottomBar = () => {
    if (phase !== PHASE.COMPLETE) return null;

    return (
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        style={styles.bottomBar}
      >
        <motion.button
          onClick={handleAskGemMaster}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={styles.bottomButtonGold}
        >
          <MessageCircle size={18} color={COLORS.bgPrimary} />
          <span style={styles.bottomButtonGoldText}>Hoi Gem Master</span>
        </motion.button>

        <motion.button
          onClick={handleNewReading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={styles.bottomButtonOutline}
        >
          <RefreshCw size={16} color={COLORS.textPrimary} />
          <span style={styles.bottomButtonOutlineText}>Rut lai</span>
        </motion.button>

        <motion.button
          onClick={() => navigate('/gemmaster/readings')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={styles.bottomButtonText}
        >
          <BookOpen size={16} color={COLORS.textMuted} />
          <span style={styles.bottomButtonTextLabel}>Lich su</span>
        </motion.button>
      </motion.div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div style={styles.pageWrapper}>
      {/* Cosmic background effects */}
      <div style={styles.bgGradient} />
      <div style={styles.bgStars} />

      {/* Header */}
      <div style={styles.header}>
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </motion.button>

        <h1 style={styles.headerTitle}>{spread.name}</h1>

        {/* Phase indicator */}
        <div style={styles.phaseIndicator}>
          {Object.values(PHASE).map((p, idx) => (
            <div
              key={p}
              style={{
                ...styles.phaseStep,
                backgroundColor: Object.values(PHASE).indexOf(phase) >= idx
                  ? COLORS.gold
                  : 'rgba(255, 255, 255, 0.15)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <AnimatePresence mode="wait">
          {phase === PHASE.QUESTION && renderQuestionPhase()}
          {phase === PHASE.SHUFFLE && renderShufflePhase()}
          {phase === PHASE.DRAW && renderDrawPhase()}
          {phase === PHASE.INTERPRET && renderInterpretPhase()}
          {phase === PHASE.COMPLETE && renderCompletePhase()}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      {renderBottomBar()}
    </div>
  );
};

// ============================================================
// STYLES (inline, design tokens, mobile-first)
// ============================================================
const styles = {
  // ---- Page Layout ----
  pageWrapper: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: COLORS.bgPrimary,
    color: COLORS.textPrimary,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  bgGradient: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255, 189, 89, 0.08) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgStars: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 40% 60%, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,0.25), transparent), radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.15), transparent), radial-gradient(1px 1px at 25% 90%, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 55% 10%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.15), transparent)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  // ---- Header ----
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    background: 'rgba(10, 14, 39, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: COLORS.bgGlass,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.textLg,
    fontWeight: TYPOGRAPHY.fontSemibold,
    color: COLORS.textPrimary,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  phaseIndicator: {
    display: 'flex',
    gap: 4,
    flexShrink: 0,
  },
  phaseStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    transition: 'background-color 0.3s ease',
  },

  // ---- Content ----
  content: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 720,
    margin: '0 auto',
    padding: `0 ${SPACING.sm}px`,
    paddingBottom: SPACING.xl,
  },

  // ---- Phase Container ----
  phaseContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.md,
    paddingTop: SPACING.md,
  },

  // ---- QUESTION PHASE ----
  spreadInfoCard: {
    background: COLORS.bgGlass,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    textAlign: 'center',
  },
  spreadName: {
    fontSize: TYPOGRAPHY.textXl,
    fontWeight: TYPOGRAPHY.fontBold,
    color: COLORS.textPrimary,
    margin: 0,
    marginBottom: SPACING.xs,
  },
  spreadMetaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  spreadMetaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.textMuted,
  },
  spreadMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255, 255, 255, 0.2)',
  },
  spreadDescription: {
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },

  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.textSm,
    fontWeight: TYPOGRAPHY.fontMedium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Life Area Pills
  lifeAreaRow: {
    display: 'flex',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  lifeAreaPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: `8px ${SPACING.sm}px`,
    minHeight: 44,
    borderRadius: 24,
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: COLORS.bgGlass,
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.textSm,
    fontWeight: TYPOGRAPHY.fontMedium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  lifeAreaPillActive: {
    background: `linear-gradient(135deg, ${COLORS.gold}, #E6A64D)`,
    border: '1px solid transparent',
    color: COLORS.bgPrimary,
  },
  lifeAreaPillText: {
    color: 'inherit',
  },
  lifeAreaPillTextActive: {
    fontWeight: TYPOGRAPHY.fontSemibold,
  },

  // Textarea
  textareaContainer: {
    display: 'flex',
    gap: SPACING.xs,
    padding: SPACING.sm,
    background: COLORS.bgGlass,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.lg,
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: COLORS.textPrimary,
    fontSize: 16, // Must be >= 16px to prevent iOS zoom on focus
    fontFamily: 'inherit',
    resize: 'none',
    lineHeight: 1.5,
  },
  charCount: {
    textAlign: 'right',
    fontSize: TYPOGRAPHY.textXs,
    color: COLORS.textDisabled,
  },

  // Quick Suggestions
  suggestionsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  suggestionChip: {
    padding: `10px ${SPACING.sm}px`,
    minHeight: 44,
    borderRadius: 20,
    border: '1px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(139, 92, 246, 0.1)',
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.textSm,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  suggestionText: {
    color: 'inherit',
  },

  // Start Button
  startButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    width: '100%',
    minHeight: 48,
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    borderRadius: 28,
    border: 'none',
    background: `linear-gradient(135deg, ${COLORS.gold}, #E6A64D)`,
    color: COLORS.bgPrimary,
    fontSize: TYPOGRAPHY.textLg,
    fontWeight: TYPOGRAPHY.fontSemibold,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(255, 189, 89, 0.3)',
    marginTop: SPACING.sm,
  },
  startButtonText: {
    color: 'inherit',
  },

  // ---- SHUFFLE PHASE ----
  shuffleFullscreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: SPACING.md,
  },
  shuffleText: {
    fontSize: TYPOGRAPHY.textLg,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontMedium,
    margin: 0,
  },

  // ---- DRAW PHASE ----
  instructionBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: `${SPACING.xs}px ${SPACING.md}px`,
    background: COLORS.bgGlass,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderRadius: 24,
    alignSelf: 'center',
  },
  instructionText: {
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontMedium,
  },
  progressText: {
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontBold,
  },
  progressDotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    padding: `${SPACING.xs}px 0`,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    transition: 'background-color 0.3s',
  },
  allFlippedBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: `${SPACING.xs}px ${SPACING.md}px`,
    marginTop: SPACING.sm,
  },
  allFlippedText: {
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontMedium,
  },

  // ---- INTERPRET PHASE ----
  interpretContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: SPACING.md,
    textAlign: 'center',
  },
  cosmicSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interpretingText: {
    fontSize: TYPOGRAPHY.textLg,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontSemibold,
    margin: 0,
  },
  interpretingSubtext: {
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.textMuted,
    margin: 0,
    maxWidth: 300,
  },
  errorCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    background: 'rgba(255, 71, 87, 0.1)',
    border: '1px solid rgba(255, 71, 87, 0.3)',
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.error,
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: `${SPACING.xs}px ${SPACING.sm}px`,
    minHeight: 44,
    borderRadius: 20,
    border: `1px solid ${COLORS.error}`,
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.textSm,
    cursor: 'pointer',
  },

  // ---- COMPLETE PHASE ----
  completeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.md,
    paddingTop: SPACING.md,
  },

  // Result Header
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: `0 ${SPACING.xs}px`,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.textXl,
    fontWeight: TYPOGRAPHY.fontBold,
    color: COLORS.textPrimary,
    margin: 0,
  },
  resultDate: {
    fontSize: TYPOGRAPHY.textXs,
    color: COLORS.textMuted,
    margin: 0,
    marginTop: 4,
  },
  fortuneRating: {
    display: 'flex',
    gap: 2,
    flexShrink: 0,
  },

  // Saved badge
  savedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    padding: `4px ${SPACING.xs}px`,
    background: 'rgba(0, 255, 136, 0.1)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    borderRadius: 12,
  },
  savedBadgeText: {
    fontSize: TYPOGRAPHY.textXs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontMedium,
  },

  // Cards Overview
  cardsOverviewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.textBase,
    fontWeight: TYPOGRAPHY.fontSemibold,
    color: COLORS.gold,
    margin: 0,
    padding: `0 ${SPACING.xs}px`,
  },
  cardsOverviewScroll: {
    display: 'flex',
    gap: SPACING.xs,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    paddingBottom: SPACING.xs,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  miniCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
    flexShrink: 0,
  },
  miniCardInner: {
    width: 56,
    height: 84,
    borderRadius: 6,
    background: 'linear-gradient(135deg, #2D1B4E, #1A0A2E)',
    border: `1.5px solid ${COLORS.purple}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCardNumber: {
    fontSize: TYPOGRAPHY.textSm,
    fontWeight: TYPOGRAPHY.fontBold,
    color: COLORS.gold,
  },
  miniCardName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 80,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  miniCardPosition: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  miniReversedBadge: {
    fontSize: 9,
    color: COLORS.error,
    background: 'rgba(255, 71, 87, 0.15)',
    padding: '1px 6px',
    borderRadius: 8,
    fontWeight: TYPOGRAPHY.fontBold,
  },

  // Card-by-Card Analysis
  analysisSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  analysisCard: {
    background: 'rgba(15, 22, 41, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  analysisCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: `${SPACING.sm}px`,
    minHeight: 48,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: COLORS.textPrimary,
  },
  analysisCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  analysisCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    background: 'rgba(139, 92, 246, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  analysisCardIconText: {
    fontSize: TYPOGRAPHY.textXs,
    fontWeight: TYPOGRAPHY.fontBold,
    color: COLORS.textPrimary,
  },
  analysisCardName: {
    display: 'block',
    fontSize: TYPOGRAPHY.textSm,
    fontWeight: TYPOGRAPHY.fontSemibold,
    color: COLORS.cyan,
  },
  analysisCardPosition: {
    display: 'block',
    fontSize: TYPOGRAPHY.textXs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  analysisCardBody: {
    padding: `0 ${SPACING.sm}px ${SPACING.sm}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  keywordsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  keywordPill: {
    fontSize: TYPOGRAPHY.textXs,
    color: COLORS.purple,
    background: 'rgba(139, 92, 246, 0.15)',
    padding: '3px 10px',
    borderRadius: 12,
    fontWeight: TYPOGRAPHY.fontMedium,
  },
  analysisText: {
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },

  // Overall Interpretation
  overviewCard: {
    position: 'relative',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    border: '1px solid rgba(139, 92, 246, 0.25)',
  },
  overviewCardBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(255, 189, 89, 0.05))',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: -1,
  },
  overviewTitle: {
    fontSize: TYPOGRAPHY.textBase,
    fontWeight: TYPOGRAPHY.fontSemibold,
    color: COLORS.gold,
    margin: 0,
    marginBottom: SPACING.xs,
  },
  overviewText: {
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.textSecondary,
    lineHeight: 1.7,
    margin: 0,
  },

  // Advice
  adviceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
    padding: SPACING.md,
    background: 'rgba(15, 22, 41, 0.85)',
    borderRadius: RADIUS.lg,
    border: '1px solid rgba(139, 92, 246, 0.15)',
  },
  adviceItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  adviceBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    background: `linear-gradient(135deg, ${COLORS.purple}, #A78BFA)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  adviceBulletText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontBold,
    color: COLORS.textPrimary,
  },
  adviceText: {
    flex: 1,
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.textSecondary,
    lineHeight: 1.6,
  },

  // Action Steps
  actionStepsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
    padding: SPACING.md,
    background: 'rgba(10, 5, 25, 0.85)',
    borderRadius: RADIUS.lg,
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  actionStepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  actionStepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  actionStepCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    background: COLORS.cyan,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  actionStepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.textSecondary,
    lineHeight: 1.5,
  },

  // Affirmation
  affirmationCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    background: 'rgba(25, 15, 5, 0.85)',
    border: '1px solid rgba(255, 189, 89, 0.3)',
    boxShadow: '0 0 20px rgba(255, 189, 89, 0.08)',
  },
  affirmationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  affirmationLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.textSm,
    fontWeight: TYPOGRAPHY.fontSemibold,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    background: 'rgba(255, 189, 89, 0.15)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  affirmationText: {
    fontSize: TYPOGRAPHY.textBase,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
  },

  // Crystals
  crystalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  crystalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: SPACING.xs,
  },
  crystalCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: SPACING.sm,
    background: 'rgba(139, 92, 246, 0.08)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: RADIUS.md,
    textAlign: 'center',
  },
  crystalName: {
    fontSize: TYPOGRAPHY.textSm,
    fontWeight: TYPOGRAPHY.fontSemibold,
    color: COLORS.textPrimary,
  },
  crystalDesc: {
    fontSize: TYPOGRAPHY.textXs,
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },

  // Rituals
  ritualsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
    padding: SPACING.md,
    background: 'rgba(10, 5, 25, 0.85)',
    borderRadius: RADIUS.lg,
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  ritualCard: {
    paddingBottom: SPACING.xs,
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  ritualName: {
    fontSize: TYPOGRAPHY.textSm,
    fontWeight: TYPOGRAPHY.fontSemibold,
    color: COLORS.gold,
    display: 'block',
    marginBottom: 4,
  },
  ritualDescription: {
    fontSize: TYPOGRAPHY.textXs,
    color: COLORS.textMuted,
    lineHeight: 1.5,
    margin: 0,
  },

  // Fallback Banner
  fallbackBanner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    background: 'rgba(255, 159, 67, 0.1)',
    border: '1px solid rgba(255, 159, 67, 0.3)',
    borderRadius: RADIUS.md,
  },
  fallbackText: {
    flex: 1,
    fontSize: TYPOGRAPHY.textXs,
    color: COLORS.warning,
    minWidth: 200,
  },
  retryButtonSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    minHeight: 44,
    borderRadius: 12,
    border: '1px solid rgba(255, 159, 67, 0.5)',
    background: 'transparent',
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.textXs,
    cursor: 'pointer',
  },

  // ---- BOTTOM ACTION BAR ----
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    paddingBottom: `calc(${SPACING.sm}px + env(safe-area-inset-bottom, 0px))`,
    background: 'rgba(10, 14, 39, 0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    zIndex: 100,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 720,
    boxSizing: 'border-box',
  },
  bottomButtonGold: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: `12px ${SPACING.sm}px`,
    borderRadius: 24,
    border: 'none',
    background: `linear-gradient(135deg, ${COLORS.gold}, #E6A64D)`,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  bottomButtonGoldText: {
    fontSize: TYPOGRAPHY.textSm,
    fontWeight: TYPOGRAPHY.fontSemibold,
    color: COLORS.bgPrimary,
  },
  bottomButtonOutline: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: `12px ${SPACING.sm}px`,
    borderRadius: 24,
    border: '1px solid rgba(139, 92, 246, 0.4)',
    background: COLORS.bgGlass,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  bottomButtonOutlineText: {
    fontSize: TYPOGRAPHY.textSm,
    fontWeight: TYPOGRAPHY.fontMedium,
    color: COLORS.textPrimary,
  },
  bottomButtonText: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: `12px ${SPACING.xs}px`,
    borderRadius: 24,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  bottomButtonTextLabel: {
    fontSize: TYPOGRAPHY.textSm,
    color: COLORS.textMuted,
  },
};

export default TarotReadingPage;
