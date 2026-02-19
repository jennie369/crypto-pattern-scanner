/**
 * GEM Master AI Service (Web)
 * Ported from gem-mobile/src/services/gemMasterService.js
 *
 * Core AI brain: questionnaire flow, karma detection, real-time analysis,
 * Gemini API proxy, rich response types, premium content gating.
 *
 * Adaptations:
 * - Uses web supabaseClient instead of mobile supabase
 * - Uses web fetch API with AbortController timeout
 * - Uses GEM_KNOWLEDGE from web data instead of gemKnowledge.json
 * - Inline simplified NLP (no vietnameseNLP dependency)
 * - No binanceService (real-time market analysis returns stub)
 * - No ragService (uses direct Gemini proxy)
 * - No karmaService (karma point saving skipped)
 * - No chatbotAnalyticsService (analytics tracking stubbed)
 * - Imports intentDetectionService for intent detection
 * - Does NOT duplicate I Ching/Tarot from chatbot.js
 */

import { supabase } from '../lib/supabaseClient';
import { GEM_KNOWLEDGE } from '../data/gemKnowledge';
import { detectIntent } from './intentDetectionService';

// ========== API CONFIG ==========
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const GEMINI_PROXY_URL = `${SUPABASE_URL}/functions/v1/gemini-proxy`;
const API_TIMEOUT = 60000;

// ========== KARMA TYPES ==========
export const KARMA_TYPES = {
  money: { name: 'Nghiệp Tiền Bạc', icon: '💰', description: 'Những block về tài chính, thịnh vượng' },
  love: { name: 'Nghiệp Tình Duyên', icon: '💕', description: 'Những block về tình yêu, mối quan hệ' },
  health: { name: 'Nghiệp Sức Khỏe', icon: '🏥', description: 'Những block về thể chất, tinh thần' },
  career: { name: 'Nghiệp Sự Nghiệp', icon: '💼', description: 'Những block về công việc, thành công' },
  family: { name: 'Nghiệp Gia Đình', icon: '👨‍👩‍👧‍👦', description: 'Những block từ gia đình, tổ tiên' },
  frequency: { name: 'Tần Số Năng Lượng', icon: '🔮', description: 'Tần số rung động chung của bạn' },
};

// ========== FREQUENCY LEVELS ==========
const FREQUENCY_LEVELS = {
  shame: { range: [20, 30], name: 'Xấu hổ/Tội lỗi' },
  guilt: { range: [30, 50], name: 'Tội lỗi/Đổ lỗi' },
  apathy: { range: [50, 75], name: 'Thờ ơ/Tuyệt vọng' },
  grief: { range: [75, 100], name: 'Đau buồn/Mất mát' },
  fear: { range: [100, 125], name: 'Sợ hãi/Lo âu' },
  desire: { range: [125, 150], name: 'Khao khát/Mong cầu' },
  anger: { range: [150, 175], name: 'Tức giận/Oán hận' },
  pride: { range: [175, 200], name: 'Kiêu ngạo/Tự mãn' },
  courage: { range: [200, 250], name: 'Can đảm/Chấp nhận' },
  neutrality: { range: [250, 310], name: 'Trung lập/Tin tưởng' },
  willingness: { range: [310, 350], name: 'Sẵn sàng/Lạc quan' },
  acceptance: { range: [350, 400], name: 'Chấp nhận/Tha thứ' },
  reason: { range: [400, 500], name: 'Lý trí/Hiểu biết' },
  love: { range: [500, 540], name: 'Tình yêu vô điều kiện' },
  joy: { range: [540, 600], name: 'Hạnh phúc/Bình an' },
  peace: { range: [600, 700], name: 'An lạc/Giác ngộ' },
  enlightenment: { range: [700, 1000], name: 'Giác ngộ hoàn toàn' },
};

// ========== QUESTIONNAIRE DATA (inline from gemMasterKnowledge) ==========
const MONEY_QUESTIONS = [
  {
    id: 'money_q1',
    question: 'Khi nghĩ đến tiền, cảm xúc đầu tiên xuất hiện là gì?',
    options: [
      { id: 'a', text: 'Lo lắng, sợ không đủ', score: { fear: 3, desire: 1 } },
      { id: 'b', text: 'Tức giận, bực bội vì thiếu thốn', score: { anger: 3, grief: 1 } },
      { id: 'c', text: 'Tội lỗi, xấu hổ khi có tiền', score: { guilt: 3, shame: 2 } },
      { id: 'd', text: 'Bình thường, không đặc biệt', score: { neutrality: 2 } },
      { id: 'e', text: 'Hào hứng, lạc quan', score: { willingness: 2, joy: 1 } },
    ],
  },
  {
    id: 'money_q2',
    question: 'Gia đình bạn thường nói gì về tiền khi bạn còn nhỏ?',
    options: [
      { id: 'a', text: '"Tiền là gốc rễ của mọi tội lỗi"', score: { guilt: 3, shame: 2 } },
      { id: 'b', text: '"Nhà mình nghèo lắm, đừng mơ"', score: { apathy: 3, grief: 2 } },
      { id: 'c', text: '"Tiền khó kiếm lắm, phải tiết kiệm"', score: { fear: 2, desire: 1 } },
      { id: 'd', text: '"Người giàu toàn xấu xa"', score: { anger: 2, pride: 1 } },
      { id: 'e', text: 'Không nói gì đặc biệt về tiền', score: { neutrality: 2 } },
      { id: 'f', text: '"Tiền là công cụ tốt nếu biết dùng"', score: { reason: 2, acceptance: 1 } },
    ],
  },
  {
    id: 'money_q3',
    question: 'Khi có cơ hội kiếm tiền lớn, bạn thường:',
    options: [
      { id: 'a', text: 'Từ chối vì sợ rủi ro', score: { fear: 3 } },
      { id: 'b', text: 'Muốn nhưng không dám hành động', score: { desire: 2, fear: 2 } },
      { id: 'c', text: 'Nghi ngờ, nghĩ chắc có bẫy', score: { anger: 1, fear: 2 } },
      { id: 'd', text: 'Cân nhắc kỹ rồi quyết định', score: { reason: 2, courage: 1 } },
      { id: 'e', text: 'Hào hứng và hành động ngay', score: { courage: 2, willingness: 2 } },
    ],
  },
  {
    id: 'money_q4',
    question: 'Bạn có từng manifest/cầu nguyện về tiền không? Kết quả thế nào?',
    options: [
      { id: 'a', text: 'Có, nhưng chưa bao giờ thành', score: { apathy: 2, grief: 2 } },
      { id: 'b', text: 'Có, đôi khi được đôi khi không', score: { desire: 2, fear: 1 } },
      { id: 'c', text: 'Chưa bao giờ thử', score: { apathy: 1, fear: 1 } },
      { id: 'd', text: 'Có, khá thành công', score: { willingness: 2, acceptance: 1 } },
    ],
  },
  {
    id: 'money_q5',
    question: 'Khi chi tiêu cho bản thân, bạn cảm thấy:',
    options: [
      { id: 'a', text: 'Tội lỗi, lãng phí', score: { guilt: 3, shame: 1 } },
      { id: 'b', text: 'Lo lắng sẽ hết tiền', score: { fear: 3 } },
      { id: 'c', text: 'Xứng đáng và vui vẻ', score: { acceptance: 2, joy: 1 } },
      { id: 'd', text: 'Bình thường', score: { neutrality: 2 } },
    ],
  },
];

const LOVE_QUESTIONS = [
  {
    id: 'love_q1',
    question: 'Khi nghĩ về tình yêu, cảm xúc đầu tiên là gì?',
    options: [
      { id: 'a', text: 'Sợ bị tổn thương lại', score: { fear: 3, grief: 1 } },
      { id: 'b', text: 'Cô đơn, khao khát', score: { desire: 3, grief: 2 } },
      { id: 'c', text: 'Tức giận vì bị phản bội', score: { anger: 3, pride: 1 } },
      { id: 'd', text: 'Hy vọng, mong chờ', score: { willingness: 2, desire: 1 } },
      { id: 'e', text: 'Bình an, tự tin', score: { acceptance: 2, love: 1 } },
    ],
  },
  {
    id: 'love_q2',
    question: 'Pattern tình yêu lặp lại của bạn là gì?',
    options: [
      { id: 'a', text: 'Luôn chọn sai người', score: { desire: 2, fear: 2 } },
      { id: 'b', text: 'Bị ghosted/bỏ rơi', score: { grief: 3, shame: 1 } },
      { id: 'c', text: 'Không dám mở lòng', score: { fear: 3 } },
      { id: 'd', text: 'Quá hy sinh cho người khác', score: { guilt: 2, desire: 2 } },
      { id: 'e', text: 'Không có pattern rõ ràng', score: { neutrality: 2 } },
    ],
  },
  {
    id: 'love_q3',
    question: 'Mối quan hệ của bố mẹ bạn như thế nào?',
    options: [
      { id: 'a', text: 'Hay cãi nhau, mâu thuẫn', score: { anger: 2, fear: 2 } },
      { id: 'b', text: 'Lạnh nhạt, ít giao tiếp', score: { apathy: 2, grief: 2 } },
      { id: 'c', text: 'Ly hôn/ly thân', score: { grief: 3, fear: 1 } },
      { id: 'd', text: 'Hạnh phúc, yêu thương', score: { acceptance: 2, love: 1 } },
      { id: 'e', text: 'Bình thường', score: { neutrality: 2 } },
    ],
  },
  {
    id: 'love_q4',
    question: 'Bạn có tin mình xứng đáng được yêu thương không?',
    options: [
      { id: 'a', text: 'Không, tôi không đủ tốt', score: { shame: 3, guilt: 2 } },
      { id: 'b', text: 'Đôi khi nghi ngờ', score: { fear: 2, desire: 1 } },
      { id: 'c', text: 'Có, nhưng chưa tìm được người phù hợp', score: { courage: 1, desire: 2 } },
      { id: 'd', text: 'Có, tôi xứng đáng', score: { acceptance: 2, love: 1 } },
    ],
  },
  {
    id: 'love_q5',
    question: 'Điều bạn sợ nhất trong tình yêu là gì?',
    options: [
      { id: 'a', text: 'Bị bỏ rơi', score: { fear: 3, grief: 2 } },
      { id: 'b', text: 'Bị lừa dối', score: { anger: 2, fear: 2 } },
      { id: 'c', text: 'Mất tự do', score: { desire: 2, pride: 1 } },
      { id: 'd', text: 'Không có gì đáng sợ', score: { courage: 2, acceptance: 1 } },
    ],
  },
];

const HEALTH_QUESTIONS = [
  {
    id: 'health_q1',
    question: 'Cơ thể bạn thường gửi tín hiệu gì?',
    options: [
      { id: 'a', text: 'Đau đầu, mất ngủ thường xuyên', score: { fear: 2, anger: 2 } },
      { id: 'b', text: 'Mệt mỏi, kiệt sức liên tục', score: { apathy: 3, grief: 1 } },
      { id: 'c', text: 'Đau dạ dày, tiêu hóa kém', score: { anger: 2, fear: 2 } },
      { id: 'd', text: 'Cơ thể khá ổn', score: { neutrality: 2, acceptance: 1 } },
    ],
  },
  {
    id: 'health_q2',
    question: 'Bạn có chăm sóc bản thân đều đặn không?',
    options: [
      { id: 'a', text: 'Không, tôi quá bận', score: { guilt: 2, apathy: 1 } },
      { id: 'b', text: 'Thỉnh thoảng, nhưng không kiên trì', score: { desire: 2, fear: 1 } },
      { id: 'c', text: 'Có, tôi ưu tiên sức khỏe', score: { acceptance: 2, willingness: 1 } },
    ],
  },
  {
    id: 'health_q3',
    question: 'Khi bị bệnh, suy nghĩ đầu tiên là gì?',
    options: [
      { id: 'a', text: '"Tại sao lại là tôi?"', score: { anger: 2, grief: 2 } },
      { id: 'b', text: '"Mình yếu đuối quá"', score: { shame: 2, guilt: 1 } },
      { id: 'c', text: '"Cơ thể đang gửi thông điệp gì?"', score: { reason: 2, acceptance: 1 } },
      { id: 'd', text: '"Cần nghỉ ngơi và hồi phục"', score: { acceptance: 2, willingness: 1 } },
    ],
  },
];

const CAREER_QUESTIONS = [
  {
    id: 'career_q1',
    question: 'Cảm xúc chủ đạo khi nghĩ về công việc?',
    options: [
      { id: 'a', text: 'Stress, áp lực', score: { fear: 2, anger: 2 } },
      { id: 'b', text: 'Chán nản, không có động lực', score: { apathy: 3, grief: 1 } },
      { id: 'c', text: 'Imposter syndrome - không đủ giỏi', score: { shame: 2, fear: 2 } },
      { id: 'd', text: 'Hào hứng, có mục tiêu', score: { willingness: 2, courage: 1 } },
    ],
  },
  {
    id: 'career_q2',
    question: 'Bạn có đang làm đúng passion không?',
    options: [
      { id: 'a', text: 'Không, làm vì tiền', score: { desire: 2, apathy: 1 } },
      { id: 'b', text: 'Không biết passion là gì', score: { apathy: 2, grief: 1 } },
      { id: 'c', text: 'Gần đúng, nhưng chưa hoàn toàn', score: { courage: 1, desire: 1 } },
      { id: 'd', text: 'Đúng, tôi yêu công việc', score: { acceptance: 2, joy: 1 } },
    ],
  },
  {
    id: 'career_q3',
    question: 'Khi thất bại trong công việc, bạn thường:',
    options: [
      { id: 'a', text: 'Đổ lỗi cho bản thân', score: { guilt: 3, shame: 1 } },
      { id: 'b', text: 'Đổ lỗi cho hoàn cảnh', score: { anger: 2, pride: 1 } },
      { id: 'c', text: 'Rút kinh nghiệm và tiếp tục', score: { courage: 2, reason: 1 } },
      { id: 'd', text: 'Muốn bỏ cuộc', score: { apathy: 2, grief: 2 } },
    ],
  },
];

const FAMILY_QUESTIONS = [
  {
    id: 'family_q1',
    question: 'Mối quan hệ với gia đình hiện tại thế nào?',
    options: [
      { id: 'a', text: 'Xung đột, mâu thuẫn', score: { anger: 3, grief: 1 } },
      { id: 'b', text: 'Xa cách, ít liên lạc', score: { apathy: 2, grief: 2 } },
      { id: 'c', text: 'Tốt nhưng có áp lực', score: { fear: 2, desire: 1 } },
      { id: 'd', text: 'Hài hòa, yêu thương', score: { acceptance: 2, love: 1 } },
    ],
  },
  {
    id: 'family_q2',
    question: 'Bạn có cảm thấy phải gánh trách nhiệm gia đình?',
    options: [
      { id: 'a', text: 'Có, rất nặng nề', score: { guilt: 2, anger: 2 } },
      { id: 'b', text: 'Có, nhưng tự nguyện', score: { courage: 1, acceptance: 1 } },
      { id: 'c', text: 'Không, mỗi người tự lo', score: { neutrality: 2 } },
    ],
  },
  {
    id: 'family_q3',
    question: 'Gia đình có ảnh hưởng đến quyết định của bạn không?',
    options: [
      { id: 'a', text: 'Rất nhiều, tôi luôn nghe theo', score: { fear: 2, guilt: 2 } },
      { id: 'b', text: 'Đôi khi, nhưng tôi cố gắng tự quyết', score: { courage: 1, desire: 1 } },
      { id: 'c', text: 'Không, tôi tự quyết', score: { courage: 2, acceptance: 1 } },
      { id: 'd', text: 'Gia đình hỗ trợ quyết định của tôi', score: { acceptance: 2, love: 1 } },
    ],
  },
];

// ========== SCENARIO MATCHING ==========
const matchScenario = (answers, karmaType) => {
  const emotionScores = {};
  for (const answer of answers) {
    if (answer?.score) {
      for (const [emotion, score] of Object.entries(answer.score)) {
        emotionScores[emotion] = (emotionScores[emotion] || 0) + score;
      }
    }
  }

  // Find dominant emotion
  let dominantEmotion = 'neutrality';
  let maxScore = 0;
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion;
    }
  }

  // Calculate frequency from dominant emotion
  const freqLevel = FREQUENCY_LEVELS[dominantEmotion] || FREQUENCY_LEVELS.neutrality;
  const frequency = Math.floor((freqLevel.range[0] + freqLevel.range[1]) / 2);
  const frequencyName = freqLevel.name;

  // Build scenario based on karma type and dominant emotion
  const scenarios = getScenariosByKarma(karmaType);
  const matchedScenario = scenarios[dominantEmotion] || scenarios.default || {
    title: `Phân tích ${KARMA_TYPES[karmaType]?.name || 'nghiệp'}`,
    description: 'Kết quả phân tích cho thấy bạn đang ở trạng thái cân bằng.',
    rootCause: 'Không phát hiện block rõ ràng.',
    healing: ['Tiếp tục duy trì thói quen lành mạnh', 'Thực hành mindfulness hàng ngày'],
    crystal: 'Clear Quartz',
    affirmations: ['Tôi đang trên đúng con đường của mình'],
    actionSteps: ['Thiền 5 phút mỗi ngày', 'Viết gratitude journal'],
    rituals: [],
    course: `course_${karmaType}`,
  };

  return {
    scenario: { ...matchedScenario, type: karmaType, frequencyName },
    frequency,
    dominantEmotions: emotionScores,
    answers,
  };
};

const getScenariosByKarma = (karmaType) => {
  const base = {
    money: {
      fear: {
        title: 'Block Sợ Thiếu Thốn', description: 'Bạn đang sống trong nỗi sợ không đủ tiền.',
        rootCause: 'Niềm tin "tiền khó kiếm" từ gia đình truyền lại.',
        healing: ['Viết thư tha thứ cho niềm tin cũ', 'Thực hành chi tiền trong hạnh phúc 7 ngày'],
        crystal: 'Citrine (Thạch Anh Vàng)', affirmations: ['Tiền đến với tôi dễ dàng và dồi dào', 'Tôi xứng đáng với sự thịnh vượng'],
        actionSteps: ['Liệt kê 10 niềm tin cũ về tiền', 'Viết lại thành niềm tin mới', 'Đọc affirmation mỗi sáng 21 ngày'],
        rituals: ['Thiền Abundance Meditation 10 phút/ngày'], course: 'course_money',
      },
      guilt: {
        title: 'Block Tội Lỗi Tiền Bạc', description: 'Bạn cảm thấy tội lỗi khi có tiền hoặc muốn nhiều tiền.',
        rootCause: 'Niềm tin "người giàu là xấu xa" hoặc "tôi không xứng đáng".',
        healing: ['Viết thư tha thứ cho bản thân', 'Thực hành mirror work - nhìn gương và nói "Tôi xứng đáng giàu có"'],
        crystal: 'Green Aventurine', affirmations: ['Tôi xứng đáng với mọi điều tốt đẹp', 'Tiền là công cụ tốt trong tay tôi'],
        actionSteps: ['Mirror work mỗi sáng 5 phút', 'Viết gratitude list về tiền', 'Cho đi 10% thu nhập'],
        rituals: ['Nghi thức tha thứ bản thân mỗi tối'], course: 'course_money',
      },
      anger: {
        title: 'Block Oán Hận Tài Chính', description: 'Bạn đang tức giận với hoàn cảnh tài chính.',
        rootCause: 'So sánh với người khác và cảm thấy bất công.',
        healing: ['Viết thư tha thứ cho hoàn cảnh', 'Chuyển đổi từ "tại sao tôi?" sang "tôi học được gì?"'],
        crystal: 'Tiger Eye', affirmations: ['Tôi tạo ra thực tế tài chính của mình', 'Sự tức giận biến thành động lực'],
        actionSteps: ['Viết ra 5 điều biết ơn về tài chính', 'Lập kế hoạch tài chính 90 ngày', 'Tìm mentor tài chính'],
        rituals: ['Thiền buông bỏ oán hận 10 phút/ngày'], course: 'course_money',
      },
      default: {
        title: 'Phân Tích Nghiệp Tiền Bạc', description: 'Bạn có tiềm năng tài chính tốt nhưng cần chuyển hóa một số niềm tin.',
        rootCause: 'Một số niềm tin vô thức đang giới hạn sự thịnh vượng.',
        healing: ['Nhận diện niềm tin giới hạn', 'Thực hành affirmation mỗi ngày'],
        crystal: 'Citrine (Thạch Anh Vàng)', affirmations: ['Tôi là nam châm thu hút tài lộc'],
        actionSteps: ['Thiền 5 phút mỗi sáng', 'Viết gratitude journal'], rituals: [], course: 'course_money',
      },
    },
    love: {
      fear: {
        title: 'Block Sợ Bị Tổn Thương', description: 'Bạn đang khép mình vì sợ bị tổn thương trong tình yêu.',
        rootCause: 'Trauma từ mối quan hệ trước hoặc tuổi thơ.',
        healing: ['Viết thư cho inner child', 'Thực hành self-love meditation'],
        crystal: 'Rose Quartz (Thạch Anh Hồng)', affirmations: ['Tim tôi an toàn để yêu và được yêu', 'Tôi xứng đáng với tình yêu đích thực'],
        actionSteps: ['Viết thư cho bản thân tuổi nhỏ', 'Thiền Heart Chakra mỗi tối', 'Liệt kê 10 điều yêu bản thân'],
        rituals: ['Nghi thức mở Heart Chakra mỗi sáng'], course: 'course_love',
      },
      grief: {
        title: 'Block Đau Buồn Tình Cảm', description: 'Bạn vẫn đang mang nỗi đau từ mất mát trong tình yêu.',
        rootCause: 'Chưa hoàn thành quá trình chia tay/mất mát.',
        healing: ['Viết thư chia tay hoàn chỉnh', 'Nghi thức cắt dây oan nghiệt'],
        crystal: 'Rhodonite', affirmations: ['Tôi buông bỏ quá khứ với lòng biết ơn', 'Trái tim tôi đang lành lại mỗi ngày'],
        actionSteps: ['Viết thư chia tay (không gửi)', 'Đốt/xé thư sau 7 ngày', 'Bắt đầu journal mới'],
        rituals: ['Nghi thức cắt dây năng lượng cũ'], course: 'course_love',
      },
      default: {
        title: 'Phân Tích Nghiệp Tình Duyên', description: 'Năng lượng tình yêu của bạn đang cần được chuyển hóa.',
        rootCause: 'Pattern tình yêu lặp lại cần nhận diện.',
        healing: ['Thực hành yêu bản thân trước', 'Nhận diện pattern cũ'],
        crystal: 'Rose Quartz', affirmations: ['Tôi yêu thương và chấp nhận bản thân hoàn toàn'],
        actionSteps: ['Self-love meditation 10 phút/ngày', 'Viết journal về pattern tình yêu'], rituals: [], course: 'course_love',
      },
    },
    health: {
      default: {
        title: 'Phân Tích Nghiệp Sức Khỏe', description: 'Cơ thể đang gửi tín hiệu cần chú ý.',
        rootCause: 'Stress tích lũy hoặc thiếu kết nối với cơ thể.',
        healing: ['Lắng nghe cơ thể mỗi ngày', 'Thiền body scan'],
        crystal: 'Amethyst', affirmations: ['Cơ thể tôi là đền thờ linh thiêng', 'Mỗi ngày tôi càng khỏe mạnh hơn'],
        actionSteps: ['Body scan meditation 10 phút/ngày', 'Uống đủ nước', 'Ngủ đủ 7-8 tiếng'], rituals: [], course: 'course_frequency',
      },
    },
    career: {
      default: {
        title: 'Phân Tích Nghiệp Sự Nghiệp', description: 'Bạn cần tìm lại purpose trong công việc.',
        rootCause: 'Chưa kết nối công việc với giá trị cốt lõi.',
        healing: ['Tìm ikigai cá nhân', 'Viết vision cho 5 năm tới'],
        crystal: 'Lapis Lazuli', affirmations: ['Tôi xứng đáng với mọi thành công', 'Công việc mang lại niềm vui'],
        actionSteps: ['Viết ikigai map', 'Lập kế hoạch 90 ngày', 'Tìm mentor'], rituals: [], course: 'course_frequency',
      },
    },
    family: {
      default: {
        title: 'Phân Tích Nghiệp Gia Đình', description: 'Pattern gia đình cần được nhận diện và chuyển hóa.',
        rootCause: 'Niềm tin và pattern thừa kế từ thế hệ trước.',
        healing: ['Nhận diện pattern gia đình', 'Đặt boundaries lành mạnh'],
        crystal: 'Black Tourmaline', affirmations: ['Tôi yêu gia đình VÀ yêu bản thân', 'Tôi tự hào là người tôi đang trở thành'],
        actionSteps: ['Viết family tree cảm xúc', 'Xác định boundaries', 'Thực hành tha thứ'], rituals: [], course: 'course_frequency',
      },
    },
  };

  return base[karmaType] || base.money;
};

// ========== FETCH WITH TIMEOUT ==========
const fetchWithTimeout = async (url, options, timeout = API_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - vui lòng thử lại');
    }
    throw error;
  }
};

// ========== CALL GEMINI API ==========
const callGeminiAPI = async (prompt, config = {}) => {
  const {
    temperature = 0.7,
    maxOutputTokens = 8192,
    retries = 2,
    feature = 'gem_master',
    systemPrompt = null,
  } = config;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Vui lòng đăng nhập để sử dụng AI');
      }

      const requestBody = {
        feature,
        messages: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens },
      };
      if (systemPrompt) requestBody.systemPrompt = systemPrompt;

      const res = await fetchWithTimeout(GEMINI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'x-request-feature': feature,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errorMsg = errData.error || `API ${res.status}`;
        if (res.status === 429) {
          const resetAt = errData.rateLimit?.resetAt;
          errorMsg = resetAt
            ? `Đã đạt giới hạn. Thử lại lúc ${new Date(resetAt).toLocaleTimeString('vi-VN')}`
            : 'Đã đạt giới hạn request. Vui lòng thử lại sau.';
        } else if (res.status === 401) {
          errorMsg = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        }
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          throw new Error(errorMsg);
        }
        lastError = new Error(errorMsg);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
        continue;
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Không nhận được phản hồi từ AI');
      const text = data.data?.text;
      if (!text) throw new Error('Không nhận được phản hồi từ AI');

      return { text, usage: data.data?.usage, rateLimit: data.rateLimit };
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('API call failed after retries');
};

// ========== TEST API ==========
export const testAPIConnection = async () => {
  try {
    const result = await callGeminiAPI('Hello, respond with just "OK"', {
      temperature: 0.1, maxOutputTokens: 100, retries: 0, feature: 'gem_master',
    });
    return { success: true, response: result.text, rateLimit: result.rateLimit };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== RICH RESPONSE TYPES ==========
const RICH_RESPONSE_TYPES = {
  TEXT: 'text', CHECKLIST: 'checklist', COMPARISON: 'comparison',
  CHART_HINT: 'chart_hint', QUIZ: 'quiz', AFFIRMATION: 'affirmation',
};

const enrichWithRichResponse = (response, userMessage = '') => {
  const lowerMsg = userMessage.toLowerCase();

  // CHECKLIST
  if ((response.actionSteps?.length > 0) || (response.rituals?.length > 0)) {
    const items = [];
    if (response.actionSteps?.length > 0) {
      response.actionSteps.forEach((step, idx) => {
        items.push({ step: idx + 1, text: typeof step === 'string' ? step : step.text || step.title, done: false });
      });
    }
    if (items.length === 0 && response.rituals) {
      response.rituals.forEach((ritual, idx) => {
        items.push({ step: idx + 1, text: typeof ritual === 'string' ? ritual : ritual.name || ritual.title, done: false });
      });
    }
    if (items.length > 0) {
      return {
        ...response, responseType: RICH_RESPONSE_TYPES.CHECKLIST,
        richData: {
          title: response.scenario?.title || 'Bài tập chữa lành',
          summary: response.scenario?.description || null,
          rootCause: response.scenario?.rootCause || null,
          crystal: response.scenario?.crystal || null,
          items, duration: '21 ngày',
        },
      };
    }
  }

  // AFFIRMATION
  if (response.affirmations?.length > 0) {
    const mainAff = response.affirmations[0];
    return {
      ...response, responseType: RICH_RESPONSE_TYPES.AFFIRMATION,
      richData: {
        text: typeof mainAff === 'string' ? mainAff : mainAff.text,
        frequency: response.frequency || 528,
        backgroundColor: '#6A5BFF',
        allAffirmations: response.affirmations,
      },
    };
  }

  // COMPARISON
  if (lowerMsg.includes('so sánh') && (lowerMsg.includes('tier') || lowerMsg.includes('gói'))) {
    return {
      ...response, responseType: RICH_RESPONSE_TYPES.COMPARISON,
      richData: {
        title: 'So sánh các TIER',
        items: [
          { name: 'STARTER', price: '299K', features: ['Scanner cơ bản', '5 cặp coin', 'Hỗ trợ community'], highlight: false },
          { name: 'TIER 1', price: '11tr', features: ['50-55% win rate', '15 patterns', 'AI Signals cơ bản'], highlight: false },
          { name: 'TIER 2', price: '21tr', features: ['70-75% win rate', 'AI Prediction', 'Whale Tracker'], highlight: true },
          { name: 'TIER 3', price: '68tr', features: ['80-90% win rate', 'Private mentoring', 'VIP signals'], highlight: false },
        ],
        highlightIndex: 2,
      },
    };
  }

  // CHART_HINT
  const symbolMatch = response.text?.match(/\b(BTC|ETH|BNB|SOL|XRP|DOGE|ADA)(?:USDT)?\b/i);
  if (symbolMatch && (lowerMsg.includes('chart') || lowerMsg.includes('phân tích') ||
      response.source === 'realtime_analysis' || response.marketData)) {
    const symbol = symbolMatch[1].toUpperCase() + 'USDT';
    const patternMatch = response.text?.match(/(DPD|UPU|UPD|DPU|HFZ|LFZ|Zone Retest|Breakout)/i);
    return {
      ...response, responseType: RICH_RESPONSE_TYPES.CHART_HINT,
      richData: { symbol, pattern: patternMatch ? patternMatch[1].toUpperCase() : null, message: response.text || '' },
    };
  }

  return response;
};

// ========== WIDGET SUGGESTIONS ==========
export const WIDGET_SUGGESTIONS = {
  money: { type: 'affirmation', title: 'Widget Affirmation Tiền Bạc', icon: '💰', affirmations: ['Tiền đến với tôi dễ dàng và dồi dào', 'Tôi là nam châm thu hút tài lộc', 'Mọi việc tôi làm đều sinh ra tiền'], explanation: 'Widget nhắc đọc affirmation tiền bạc mỗi ngày.' },
  love: { type: 'affirmation', title: 'Widget Chữa Lành Tình Yêu', icon: '💕', affirmations: ['Tôi yêu thương và chấp nhận bản thân', 'Tôi xứng đáng có tình yêu đích thực', 'Tim tôi rộng mở để yêu và được yêu'], explanation: 'Widget giúp yêu thương bản thân mỗi ngày.' },
  health: { type: 'affirmation', title: 'Widget Sức Khỏe', icon: '🏥', affirmations: ['Cơ thể tôi là đền thờ linh thiêng', 'Tôi lắng nghe và yêu thương cơ thể mình', 'Mỗi ngày tôi càng khỏe mạnh hơn'], explanation: 'Widget nhắc chăm sóc sức khỏe mỗi ngày.' },
  career: { type: 'affirmation', title: 'Widget Sự Nghiệp', icon: '💼', affirmations: ['Tôi xứng đáng với mọi thành công', 'Tôi đang sống đúng purpose của mình', 'Công việc mang lại niềm vui và ý nghĩa'], explanation: 'Widget nhắc về sự nghiệp mỗi ngày.' },
  family: { type: 'affirmation', title: 'Widget Gia Đình', icon: '👨‍👩‍👧‍👦', affirmations: ['Tôi yêu gia đình VÀ yêu bản thân', 'Tôi đặt boundaries lành mạnh với gia đình', 'Tôi tự hào là người tôi đang trở thành'], explanation: 'Widget về mối quan hệ gia đình.' },
  frequency: { type: 'exercise', title: 'Widget Nâng Tần Số', icon: '🔮', exercises: ['Thiền 5 phút mỗi sáng', 'Viết gratitude journal'], explanation: 'Widget nhắc nâng tần số mỗi ngày.' },
  karma: { type: 'exercise', title: 'Widget Chuyển Hóa Nghiệp', icon: '🔄', exercises: ['Viết 10 niềm tin tiêu cực', 'Viết thư tha thứ'], explanation: 'Widget nhắc làm bài tập chuyển hóa.' },
};

// ========== COURSE RECOMMENDATIONS ==========
export const COURSE_RECOMMENDATIONS = {
  money: { id: 'course_money', title: 'Manifest Tiền Bạc - Tư Duy Triệu Phú', subtitle: '30 ngày thay đổi Money Mindset', price: '499K', icon: '💰', benefits: ['Công thức hiện hóa tài chính', 'Phá vỡ block tiền bạc'], url: 'courses' },
  love: { id: 'course_love', title: 'Kích Hoạt Tần Số Tình Yêu', subtitle: '21 ngày thu hút tình yêu', price: '399K', icon: '💖', benefits: ['Chữa lành trauma tình cảm', 'Mở khóa Heart Chakra'], url: 'courses' },
  frequency: { id: 'course_frequency', title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc', subtitle: 'Chuyển hóa năng lượng cốt lõi', price: '1.997K', icon: '🌟', benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'], url: 'courses' },
  health: { id: 'course_frequency', title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc', subtitle: 'Chuyển hóa năng lượng cốt lõi', price: '1.997K', icon: '🌟', benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'], url: 'courses' },
  career: { id: 'course_frequency', title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc', subtitle: 'Chuyển hóa năng lượng cốt lõi', price: '1.997K', icon: '🌟', benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'], url: 'courses' },
  family: { id: 'course_frequency', title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc', subtitle: 'Chuyển hóa năng lượng cốt lõi', price: '1.997K', icon: '🌟', benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'], url: 'courses' },
  general: { id: 'course_frequency', title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc', subtitle: 'Chuyển hóa năng lượng cốt lõi', price: '1.997K', icon: '🌟', benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'], url: 'courses' },
  trading: { id: 'course_frequency', title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc', subtitle: 'Chuyển hóa năng lượng cốt lõi', price: '1.997K', icon: '🌟', benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'], url: 'courses' },
};

// ========== AFFILIATE PROMO ==========
export const AFFILIATE_PROMO = {
  title: 'Cơ hội Cộng tác viên Gemral',
  description: 'Kiếm thu nhập thụ động với hoa hồng lên đến 30%!',
  tiers: [
    { name: 'Affiliate', commission: '3%' },
    { name: 'CTV Bronze', commission: '10%' },
    { name: 'CTV Silver', commission: '20%' },
    { name: 'CTV Gold', commission: '30%' },
  ],
  cta: 'Đăng ký làm CTV ngay',
  url: 'https://gemral.com/affiliate',
};

// ========== TOPIC DETECTION ==========
const TOPIC_KEYWORDS = {
  money: ['tiền', 'nghiệp tiền', 'tài chính', 'giàu', 'nghèo', 'nợ', 'thu nhập', 'kiếm tiền', 'manifest', 'tài lộc'],
  love: ['tình yêu', 'nghiệp tình', 'người yêu', 'sai người', 'chia tay', 'cô đơn', 'hẹn hò', 'crush'],
  health: ['sức khỏe', 'stress', 'kiệt sức', 'bệnh', 'mệt mỏi', 'ngủ'],
  career: ['công việc', 'sự nghiệp', 'burnout', 'imposter', 'thành công'],
  family: ['gia đình', 'bố mẹ', 'cha mẹ', 'con cái'],
  frequency: ['tần số', 'năng lượng', 'hawkins', 'hz'],
  karma: ['nghiệp', 'karma', 'tiền kiếp'],
  crystal: ['đá', 'crystal', 'thạch anh'],
  trading: ['trading', 'crypto', 'bitcoin', 'scanner'],
  affiliate: ['kiếm thêm', 'thu nhập thụ động', 'cộng tác', 'affiliate', 'ctv', 'hoa hồng'],
};

const detectTopics = (msg) => {
  const m = msg.toLowerCase();
  const topics = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => m.includes(kw))) topics.push(topic);
  }
  return topics.length > 0 ? topics : ['general'];
};

// ========== KARMA INTENT DETECTION ==========
const detectKarmaIntent = (message) => {
  const m = message.toLowerCase();

  const skipKeywords = ['manifest', 'hướng dẫn', 'giới thiệu', 'dạy', 'học', 'cách', 'làm sao', 'làm thế nào', 'khóa học', 'course'];
  if (skipKeywords.some(kw => m.includes(kw))) return null;

  // Implicit love questions
  const implicitLoveQuestions = [
    'người yêu cũ', 'tình cũ', 'ex quay lại', 'quay lại với',
    'có nên gặp lại', 'có nên nhắn', 'liên lạc lại',
    'còn yêu', 'hết yêu', 'quên người cũ', 'nhớ người cũ',
    'bị ghosted', 'bị block', 'tại sao chia tay',
    'tại sao bị bỏ', 'không có người yêu', 'mãi không có ai',
    'luôn bị phản bội', 'luôn bị bỏ rơi', 'pattern tình yêu',
  ];
  if (implicitLoveQuestions.some(kw => m.includes(kw))) return 'love';

  // Explicit requests
  const analysisKeywords = ['phân tích', 'khám phá', 'xem', 'đo', 'kiểm tra', 'tìm hiểu', 'của tôi', 'của mình', 'giúp tôi'];
  const hasAnalysisRequest = analysisKeywords.some(kw => m.includes(kw));
  const deepAnalysisIndicators = ['tại sao tôi', 'vì sao tôi', 'tại sao mình', 'vì sao mình', 'gốc vấn đề', 'nguyên nhân', 'pattern', 'lặp lại'];
  const needsDeepAnalysis = deepAnalysisIndicators.some(kw => m.includes(kw));

  if (!hasAnalysisRequest && !needsDeepAnalysis) return null;

  if (m.includes('nghiệp tiền') || m.includes('nghiệp tài chính') || (m.includes('nghiệp') && (m.includes('tiền') || m.includes('tài')))) return 'money';
  if (m.includes('nghiệp tình') || m.includes('nghiệp duyên') || (m.includes('nghiệp') && (m.includes('tình') || m.includes('yêu')))) return 'love';
  if (needsDeepAnalysis && (m.includes('tình') || m.includes('yêu') || m.includes('quan hệ') || m.includes('bỏ rơi'))) return 'love';
  if (m.includes('nghiệp sức khỏe') || m.includes('nghiệp bệnh') || (m.includes('nghiệp') && m.includes('khỏe'))) return 'health';
  if (m.includes('nghiệp sự nghiệp') || m.includes('nghiệp công việc') || (m.includes('nghiệp') && (m.includes('nghiệp') || m.includes('việc')))) return 'career';
  if (m.includes('nghiệp gia đình') || (m.includes('nghiệp') && m.includes('gia đình'))) return 'family';
  if ((m.includes('phân tích') || m.includes('đo')) && (m.includes('tần số') || m.includes('năng lượng') || m.includes('hawkins'))) return 'frequency';

  return null;
};

// ========== QUESTIONNAIRE HELPERS ==========
const getQuestions = (karmaType) => {
  switch (karmaType) {
    case 'money': return MONEY_QUESTIONS;
    case 'love': return LOVE_QUESTIONS;
    case 'health': return HEALTH_QUESTIONS;
    case 'career': return CAREER_QUESTIONS;
    case 'family': return FAMILY_QUESTIONS;
    default: return [];
  }
};

const formatQuestion = (question, index, total) => {
  let text = `**Câu hỏi ${index + 1}/${total}**\n\n${question.question}`;
  const formattedOptions = question.options.map((opt, i) => ({
    id: opt.id || String.fromCharCode(97 + i),
    label: String.fromCharCode(65 + i),
    text: opt.text,
    score: opt.score,
  }));
  return { text, options: formattedOptions, questionId: question.id, questionIndex: index, totalQuestions: total };
};

const parseAnswer = (message, question) => {
  const m = message.trim().toUpperCase();
  const letterMatch = m.match(/^[A-Z]$/);
  if (letterMatch) {
    const index = letterMatch[0].charCodeAt(0) - 65;
    if (index >= 0 && index < question.options.length) return question.options[index];
  }
  for (const opt of question.options) {
    if (message.toLowerCase().includes(opt.text.toLowerCase().slice(0, 20))) return opt;
  }
  return null;
};

const formatAnalysisResult = (result) => {
  const { scenario, frequency } = result;
  if (!scenario) return 'Tôi chưa thể phân tích chính xác. Bạn có thể chia sẻ thêm?';

  let text = `**KẾT QUẢ PHÂN TÍCH**\n\n`;
  text += `**Tần số hiện tại:** ${frequency} Hz\n${scenario.frequencyName}\n\n`;
  text += `**${scenario.title}**\n${scenario.description}\n\n`;
  text += `**Nguyên nhân gốc:**\n${scenario.rootCause}\n\n`;
  text += `**Bài tập chữa lành:**\n`;
  scenario.healing.forEach((step, i) => { text += `${i + 1}. ${step}\n`; });
  if (scenario.affirmations?.length > 0) {
    text += `\n**Câu khẳng định:**\n`;
    scenario.affirmations.forEach(aff => { text += `• "${aff}"\n`; });
  }
  if (scenario.actionSteps?.length > 0) {
    text += `\n**Kế hoạch hành động:**\n`;
    scenario.actionSteps.forEach((step, i) => { text += `${i + 1}. ${step}\n`; });
  }
  if (scenario.rituals?.length > 0) {
    text += `\n**Nghi thức chuyển hóa:**\n`;
    scenario.rituals.forEach(r => { text += `• ${r}\n`; });
  }
  text += `\n**Đá phù hợp:** ${scenario.crystal}\n`;
  text += `\nBạn có muốn tôi hướng dẫn chi tiết về bài tập nào không?`;
  return text;
};

// ========== PREMIUM CONTENT GATING ==========
const PREMIUM_DETAIL_INDICATORS = [
  'chi tiết', 'cụ thể', 'giải thích', 'hướng dẫn', 'cách dùng', 'cách sử dụng',
  'làm sao', 'làm thế nào', 'như thế nào', 'step by step', 'từng bước',
  'ví dụ', 'case study', 'thực hành', 'áp dụng', 'setup', 'entry', 'exit',
  'backtest', 'kết quả', 'win rate', 'công thức', 'formula', 'bí quyết',
  'dạy tôi', 'teach me', 'show me', 'chỉ cho tôi',
];

const PREMIUM_CONTENT_MAP = {
  tier1: {
    keywords: ['tier 1', 'tier1', '7 pattern', 'harmonic pattern', 'elliott wave', 'wyckoff', 'volume profile', 'khóa 11 triệu', 'khóa 11tr'],
    features: ['7 Patterns cốt lõi', 'Win rate 50-55%', 'GEM Scanner 1 tháng'],
    price: '11.000.000đ', discount: '27%',
  },
  tier2: {
    keywords: ['tier 2', 'tier2', '15 pattern', '6 công thức', 'dpd', 'upu', 'upd', 'dpu', 'hfz', 'lfz', 'frequency formula', 'smart money', 'khóa 21 triệu', 'khóa 21tr'],
    features: ['6 Công thức Frequency', 'Smart Money Concepts', 'Win rate 70-75%'],
    price: '21.000.000đ', discount: '40%',
  },
  tier3: {
    keywords: ['tier 3', 'tier3', '11 công thức', 'ai prediction', 'whale tracker', 'order flow', 'khóa 68 triệu', 'khóa 68tr', 'elite'],
    features: ['AI Prediction System', 'Whale Tracker', 'Win rate 80-90%'],
    price: '68.000.000đ', discount: '43%',
  },
  formulas: {
    keywords: ['công thức frequency', 'dpd là gì', 'upu là gì', 'upd là gì', 'dpu là gì', 'hfz là gì', 'lfz là gì', 'cách dùng dpd', 'setup dpd', 'entry dpd'],
    requiredTier: 'tier2',
  },
};

const FOMO_TEASERS = {
  tier1: [`**NỘI DUNG TIER 1 - PREMIUM**\n\nBạn đang hỏi về nội dung thuộc **Khóa Trading TIER 1** (11 triệu).\n\n**Những gì bạn sẽ được học:**\n• 7 Patterns cốt lõi được backtest trên 686 trades\n• Win rate thực tế: 50-55%\n• Harmonic, Elliott Wave, Wyckoff, Volume Profile...\n\n**Tại sao ta không thể chia sẻ chi tiết?**\nĐây là kiến thức độc quyền mà team GEM đã nghiên cứu 10+ năm.\n\n**Ưu đãi hiện tại:** Giảm 27% còn **11 triệu** (gốc 15 triệu)\n\nBạn có muốn xem chi tiết khóa học không?`],
  tier2: [`**NỘI DUNG TIER 2 - ADVANCED**\n\nBạn đang hỏi về **6 Công thức Frequency** - kiến thức độc quyền chỉ có ở TIER 2.\n\n**Đây là gì?**\n• DPD, UPU, UPD, DPU, HFZ, LFZ\n• Công thức dự đoán xu hướng với độ chính xác 70-75%\n• Được nghiên cứu 10+ năm bởi Founder Jennie Chu\n\n**Kết quả học viên TIER 2:**\n• Win rate trung bình: 72%\n• 94% hài lòng với khóa học\n\n**Giá trị:** 21 triệu cho kiến thức đáng giá 100 triệu+\n\nBạn đã sẵn sàng nâng cấp lên TIER 2 chưa?`],
  tier3: [`**TIER 3 ELITE - KIẾN THỨC TỐI THƯỢNG**\n\nBạn đang hỏi về nội dung **TIER 3 Elite** - cấp độ cao nhất.\n\n**Đây là những gì chỉ TIER 3 mới có:**\n• 11 Công thức Frequency hoàn chỉnh\n• **AI Prediction System** - dự đoán bằng machine learning\n• **Whale Tracker** - theo dõi giao dịch cá mập real-time\n• Win rate: 80-90%\n\n**Giá trị thực:**\n• 68 triệu cho kiến thức đáng giá 100 triệu+\n• ROI trung bình: 500% trong năm đầu\n• 4 sessions 1-on-1 với Founder Jennie Chu\n\nĐây là investment, không phải expense. Bạn sẵn sàng chưa?`],
  formulas: [`**CÔNG THỨC ĐỘC QUYỀN - PROTECTED**\n\nBạn đang hỏi chi tiết về công thức Frequency - đây là **intellectual property** của GEM.\n\n**Ta có thể nói:**\n• Có 6 công thức core (TIER 2) và 5 công thức advanced (TIER 3)\n• Win rate từ 68-90% tùy công thức\n• Được backtest trên 686+ trades trong 3 năm\n\n**Ta KHÔNG thể nói:**\n• Cách setup cụ thể\n• Entry/Exit rules\n\nHọc viên TIER 2+ được quyền truy cập đầy đủ.\nBạn muốn upgrade không?`],
  generic: [`**NỘI DUNG PREMIUM**\n\nCâu hỏi của bạn liên quan đến kiến thức trong các khóa học TIER cao hơn.\n\n**Hệ thống GEM Trading có 4 cấp độ:**\n• **FREE** - Kiến thức cơ bản\n• **TIER 1** (11tr) - 7 Patterns, win rate 50-55%\n• **TIER 2** (21tr) - 6 Công thức Frequency, win rate 70-75%\n• **TIER 3** (68tr) - AI Prediction + Whale Tracker, win rate 80-90%\n\nBạn đang ở tier nào? Ta sẽ tư vấn lộ trình phù hợp.`],
};

const detectPremiumContentRequest = (message) => {
  const m = message.toLowerCase();
  if (!PREMIUM_DETAIL_INDICATORS.some(ind => m.includes(ind))) return { isPremium: false };
  for (const [tierKey, tierData] of Object.entries(PREMIUM_CONTENT_MAP)) {
    if (tierData.keywords.some(kw => m.includes(kw))) {
      return { isPremium: true, tier: tierKey, requiredTier: tierData.requiredTier || tierKey, features: tierData.features, price: tierData.price };
    }
  }
  return { isPremium: false };
};

const generateFOMOTeaser = (tierKey, userTier = 'FREE') => {
  const teasers = FOMO_TEASERS[tierKey] || FOMO_TEASERS.generic;
  return {
    text: teasers[Math.floor(Math.random() * teasers.length)],
    isPremiumGated: true, requiredTier: tierKey, userTier, showUpgradeButton: true,
  };
};

const getUserTier = async (userId) => {
  if (!userId) return 'FREE';
  try {
    const { data: profile, error } = await supabase.from('profiles')
      .select('subscription_tier, purchased_tiers').eq('id', userId).single();
    if (error || !profile) return 'FREE';
    const purchasedTiers = profile.purchased_tiers || [];
    const subTier = profile.subscription_tier || 'FREE';
    if (purchasedTiers.includes('TIER3') || subTier === 'TIER3') return 'TIER3';
    if (purchasedTiers.includes('TIER2') || subTier === 'TIER2') return 'TIER2';
    if (purchasedTiers.includes('TIER1') || subTier === 'TIER1') return 'TIER1';
    return 'FREE';
  } catch { return 'FREE'; }
};

const hasAccessToTier = (userTier, requiredTier) => {
  const hierarchy = ['FREE', 'STARTER', 'TIER1', 'TIER2', 'TIER3'];
  return hierarchy.indexOf(userTier.toUpperCase()) >= hierarchy.indexOf(requiredTier.toUpperCase().replace('tier', 'TIER'));
};

// ========== LOCAL KNOWLEDGE MATCHING ==========
const MATCH_THRESHOLD = 0.5;

const matchLocalKnowledge = (message) => {
  if (!GEM_KNOWLEDGE) return { matched: false };

  // Use GEM_KNOWLEDGE as simple keyword matching against philosophy/frequency/tradingMethod
  const m = message.toLowerCase().trim();
  const sections = {
    philosophy: { keywords: ['triết lý', 'philosophy', 'luật hấp dẫn', 'manifestation', 'yinyang', 'jennie'], content: GEM_KNOWLEDGE.philosophy },
    frequency: { keywords: ['tần số', 'frequency', 'hz', 'chakra', 'năng lượng', 'hawkins'], content: GEM_KNOWLEDGE.frequency },
    tradingMethod: { keywords: ['frequency trading', 'gem method', 'zone retest', 'dpd', 'upu', 'phương pháp'], content: GEM_KNOWLEDGE.tradingMethod },
  };

  for (const [key, data] of Object.entries(sections)) {
    const matchCount = data.keywords.filter(kw => m.includes(kw)).length;
    if (matchCount >= 2) {
      return { matched: true, faqKey: key, answer: data.content, confidence: 0.8, matchCount, searchTags: [], quickActions: [] };
    }
  }

  return { matched: false };
};

// ========== CONVERSATION STATE ==========
let conversationState = {
  mode: 'chat', karmaType: null, currentQuestionIndex: 0, answers: [], analysisComplete: false,
};
let messageCount = 0;

// ========== MAIN PROCESS MESSAGE ==========
export const processMessage = async (userMessage, history = [], options = {}) => {
  messageCount++;
  const intentResult = detectIntent(userMessage);

  try {
    // ===== MODE: QUESTIONNAIRE =====
    if (conversationState.mode === 'questionnaire') {
      const lowerMsg = userMessage.toLowerCase();
      const newQuestionIndicators = [
        'tại sao', 'vì sao', 'là gì', 'như thế nào', 'cho hỏi', 'muốn hỏi',
        'giải thích', 'hướng dẫn', 'giúp tôi', 'làm sao', 'block tiền',
        'manifest', 'khóa học', 'course', 'mua đá',
        'phân tích nghiệp', 'nghiệp tình', 'nghiệp tiền',
      ];
      const isNewQuestion = newQuestionIndicators.some(ind => lowerMsg.includes(ind));
      const isSimpleAnswer = /^[A-Ea-e]\.?$/.test(userMessage.trim());
      const isLongNonAnswer = userMessage.trim().length > 20 && !isSimpleAnswer;

      if (isNewQuestion || isLongNonAnswer) {
        conversationState = { mode: 'chat', karmaType: null, currentQuestionIndex: 0, answers: [], analysisComplete: false };
      } else {
        const questions = getQuestions(conversationState.karmaType);
        const currentQ = questions[conversationState.currentQuestionIndex];
        const answer = parseAnswer(userMessage, currentQ);

        if (!answer) {
          const fQ = formatQuestion(currentQ, conversationState.currentQuestionIndex, questions.length);
          return { text: 'Vui lòng chọn một trong các đáp án:', mode: 'questionnaire', options: fQ.options, questionId: fQ.questionId, questionIndex: fQ.questionIndex, totalQuestions: fQ.totalQuestions, isQuestionMessage: true };
        }

        conversationState.answers.push(answer);
        conversationState.currentQuestionIndex++;

        if (conversationState.currentQuestionIndex < questions.length) {
          const nextQ = questions[conversationState.currentQuestionIndex];
          const fQ = formatQuestion(nextQ, conversationState.currentQuestionIndex, questions.length);
          return { text: `Cảm ơn bạn!\n\n${fQ.text}`, mode: 'questionnaire', options: fQ.options, questionId: fQ.questionId, questionIndex: fQ.questionIndex, totalQuestions: fQ.totalQuestions, isQuestionMessage: true };
        }

        // Analysis complete
        const result = matchScenario(conversationState.answers, conversationState.karmaType);
        const karmaType = conversationState.karmaType;
        conversationState = { mode: 'chat', karmaType: null, currentQuestionIndex: 0, answers: [], analysisComplete: true };

        return {
          text: formatAnalysisResult(result),
          scenario: result.scenario, frequency: result.frequency, topics: [karmaType],
          affirmations: result.scenario?.affirmations || [],
          actionSteps: result.scenario?.actionSteps || result.scenario?.healing || [],
          rituals: result.scenario?.rituals || [],
          widgetSuggestion: WIDGET_SUGGESTIONS[karmaType],
          courseRecommendation: COURSE_RECOMMENDATIONS[karmaType],
          showCrystals: true,
          crystalTags: [result.scenario?.crystal?.toLowerCase().replace(/\s+/g, '-') || 'crystal'],
        };
      }
    }

    // ===== MODE: CHAT =====
    const isFirst = history.length === 0;
    const topics = detectTopics(userMessage);

    // STEP 1: Karma questionnaire check
    const karmaIntent = detectKarmaIntent(userMessage);
    if (karmaIntent && karmaIntent !== 'frequency') {
      conversationState = { mode: 'questionnaire', karmaType: karmaIntent, currentQuestionIndex: 0, answers: [], analysisComplete: false };
      const questions = getQuestions(karmaIntent);
      const firstQ = questions[0];
      const karmaName = KARMA_TYPES[karmaIntent]?.name || 'Nghiệp';
      const fQ = formatQuestion(firstQ, 0, questions.length);

      const m = userMessage.toLowerCase();
      const implicitLovePatterns = ['người yêu cũ', 'tình cũ', 'ex quay lại', 'quay lại', 'có nên gặp', 'có nên nhắn', 'còn yêu', 'quên người', 'bị ghosted', 'bị block', 'tại sao chia tay', 'bị bỏ'];
      const isImplicitLove = karmaIntent === 'love' && implicitLovePatterns.some(p => m.includes(p)) && !m.includes('nghiệp');

      const introText = isImplicitLove
        ? `Tôi hiểu bạn đang muốn biết câu trả lời...\n\nNhưng **câu trả lời có/không** sẽ không giúp bạn hiểu rõ vấn đề.\n\nĐiều quan trọng hơn là hiểu **tại sao pattern này lặp lại**.\n\nHãy để Sư Phụ đánh giá **năng lượng tình duyên** qua ${questions.length} câu hỏi ngắn:\n\n${fQ.text}`
        : `Tôi sẽ giúp bạn khám phá ${karmaName}!\n\nĐể phân tích chính xác, cần hỏi ${questions.length} câu hỏi ngắn.\n\n${fQ.text}`;

      return { text: introText, mode: 'questionnaire', options: fQ.options, questionId: fQ.questionId, questionIndex: fQ.questionIndex, totalQuestions: fQ.totalQuestions, isQuestionMessage: true };
    }

    // STEP 1.5: Premium content gating
    const premiumCheck = detectPremiumContentRequest(userMessage);
    if (premiumCheck.isPremium) {
      const { data: { session } } = await supabase.auth.getSession();
      const userTier = await getUserTier(session?.user?.id);
      if (!hasAccessToTier(userTier, premiumCheck.requiredTier)) {
        const fomoResponse = generateFOMOTeaser(premiumCheck.tier, userTier);
        return {
          text: fomoResponse.text, topics: ['trading'], mode: 'chat', source: 'premium_gated',
          isPremiumGated: true, requiredTier: premiumCheck.requiredTier, userTier, showUpgradeButton: true,
          courseRecommendation: COURSE_RECOMMENDATIONS.trading,
          quickActions: [{ label: 'Xem chi tiết khóa học', action: 'view_courses' }, { label: 'So sánh các TIER', action: 'compare_tiers' }],
        };
      }
    }

    // STEP 2: Local knowledge matching
    const localMatch = matchLocalKnowledge(userMessage);
    const isContinuation = history.length > 0;

    if (localMatch.matched && !(localMatch.faqKey === 'greeting' && isContinuation)) {
      const mainTopic = topics[0] || 'general';
      const showCrystals = localMatch.answer.includes('thạch anh') || localMatch.answer.includes('đá');
      return {
        text: localMatch.answer, topics: [mainTopic, ...topics.filter(t => t !== mainTopic)],
        mode: 'chat', source: 'local', knowledgeKey: localMatch.faqKey,
        widgetSuggestion: WIDGET_SUGGESTIONS[mainTopic] || null,
        courseRecommendation: COURSE_RECOMMENDATIONS[mainTopic] || null,
        showCrystals, crystalTags: showCrystals ? ['crystal'] : [],
        quickActions: localMatch.quickActions,
      };
    }

    // STEP 3: Call Gemini via edge function proxy
    const historyCount = Math.min(history.length, 8);
    let prompt = '';

    if (isContinuation) {
      prompt = `Bạn là GEM MASTER - AI trading mentor đanh thép. Xưng "Ta - Bạn".

**QUY TẮC BẮT BUỘC:**
1. TUYỆT ĐỐI KHÔNG giới thiệu bản thân
2. TUYỆT ĐỐI KHÔNG chào hỏi - Đã trong cuộc hội thoại!
3. CẤM gọi user là "Gemral" - CHỈ gọi "bạn"
4. BẮT ĐẦU bằng 1 CÂU DẪN TỰ NHIÊN
5. KHÔNG emoji. Tối đa 250 từ

**BẢO VỆ NỘI DUNG PREMIUM:**
Nếu user hỏi CHI TIẾT về công thức Frequency, khóa học TIER → KHÔNG tiết lộ.

**KIẾN THỨC:**
- GEM Frequency Method: Zone Retest > Breakout (68% win rate)
- Patterns: DPD, UPU, UPD, DPU, HFZ, LFZ
- TIER: STARTER 299k, TIER 1 11tr (50-55%), TIER 2 21tr (70-75%), TIER 3 68tr (80-90%)
- Stop Loss: 2-3% max

**LỊCH SỬ HỘI THOẠI:**
---
`;
      history.slice(-historyCount).forEach((m, idx) => {
        const role = m.isUser ? 'User' : 'GEM Master';
        const msgText = m.text?.length > 400 ? m.text.substring(0, 400) + '...' : m.text;
        prompt += `[${idx + 1}] ${role}: ${msgText}\n`;
      });
      prompt += `---

**CÂU HỎI MỚI TỪ USER:** ${userMessage}
${options.userContext ? `\n**THÔNG TIN USER:**\n${options.userContext}\n` : ''}
**TRẢ LỜI (bắt đầu bằng 1 câu dẫn tự nhiên):**`;
    } else {
      prompt = `Ta là GEM MASTER - Người Bảo Hộ Tỉnh Thức. Trader lão luyện + Thiền sư bình thản.

**TÍNH CÁCH:** Lạnh lùng, thẳng thắn, bí ẩn.
**GIỌNG VĂN:** NGẮN GỌN - ĐANH THÉP. Xưng "Ta - Bạn".
**TUYỆT ĐỐI KHÔNG:** Emoji, ngôn ngữ lùa gà, gọi user "Gemral"
**BẢO VỆ NỘI DUNG PREMIUM:** Không tiết lộ chi tiết công thức/khóa học.

**KIẾN THỨC:**
- GEM Frequency: DPD, UPU, UPD, DPU, HFZ, LFZ (68% win rate)
- TIER: STARTER 299k, TIER 1 11tr (50-55%), TIER 2 21tr (70-75%), TIER 3 68tr (80-90%)
- Hawkins: 20-100Hz (thấp), 200Hz+ (can đảm), 500Hz+ (tình yêu)

**TIN NHẮN TỪ USER:** ${userMessage}
${options.userContext ? `\n**THÔNG TIN USER:**\n${options.userContext}\n` : ''}
**TRẢ LỜI (ngắn gọn, tối đa 150-200 từ):**`;
    }

    const result = await callGeminiAPI(prompt, { temperature: 0.7 });
    const text = result.text;
    const showCrystals = text.includes('thạch anh') || text.includes('đá') || topics.includes('crystal');
    const showAffiliate = topics.includes('affiliate') || userMessage.toLowerCase().includes('kiếm thêm');

    return {
      text, topics, mode: 'chat', source: 'direct_api',
      widgetSuggestion: WIDGET_SUGGESTIONS[topics[0]] || null,
      courseRecommendation: COURSE_RECOMMENDATIONS[topics[0]] || null,
      showCrystals, crystalTags: showCrystals ? ['crystal'] : [],
      showAffiliate, affiliatePromo: showAffiliate ? AFFILIATE_PROMO : null,
    };

  } catch (err) {
    console.error('[GemMasterService] ERROR:', err.message);
    return { text: `Lỗi: ${err.message}. Thử lại sau.`, error: err.message };
  }
};

// ========== SAVE WIDGET ==========
export const saveWidgetToVisionBoard = async (widget, userId) => {
  if (!userId || !widget) return { success: false, error: 'Missing data' };

  try {
    const widgetData = widget.data || widget;
    let content = [];

    if (widget.type === 'affirmation') {
      content = { affirmations: widgetData.affirmations || widget.affirmations || [], lifeArea: widgetData.lifeArea || '' };
    } else if (widget.type === 'action_plan') {
      content = { steps: widgetData.steps || [], lifeArea: widgetData.lifeArea || '' };
    } else if (widget.type === 'tarot') {
      content = { cards: widgetData.cards || [], spread: widgetData.spread || 'three-card', interpretation: widgetData.interpretation || '', crystals: widgetData.crystals || [], affirmations: widgetData.affirmations || [] };
    } else if (widget.type === 'iching') {
      content = { hexagramNumber: widgetData.hexagramNumber, hexagramName: widgetData.hexagramName, interpretation: widgetData.interpretation || '', crystals: widgetData.crystals || [], affirmations: widgetData.affirmations || [] };
    } else {
      content = widgetData.exercises || widget.exercises || widgetData.affirmations || widget.affirmations || [];
    }

    const { data, error } = await supabase
      .from('vision_board_widgets')
      .insert({
        user_id: userId,
        type: widget.type || 'affirmation',
        title: widget.title || 'Widget',
        icon: widget.icon || '',
        content,
        explanation: widget.explanation || '',
        is_active: true,
        streak: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, widget: data };
  } catch (err) {
    console.error('[GemMasterService] Save error:', err);
    return { success: false, error: err.message };
  }
};

// ========== RESET STATE ==========
export const resetConversation = () => {
  conversationState = { mode: 'chat', karmaType: null, currentQuestionIndex: 0, answers: [], analysisComplete: false };
  messageCount = 0;
};

export const clearHistory = resetConversation;

// ========== ENHANCED FUNCTIONS ==========
export const sendMessageEnhanced = async (userId, message, options = {}) => {
  if (!message || typeof message !== 'string') throw new Error('Message is required');
  const response = await processMessage(message, options.history || [], { userTier: options.userTier || 'FREE' });
  return enrichWithRichResponse(response, message);
};

// Stubs for services not yet ported to web
export const getSmartTriggersForUser = async () => [];
export const logTriggerShown = async () => true;
export const submitFeedback = async () => true;
export const getUserChatStats = async () => ({ recentQueries: [], feedbackStats: {} });
export const refreshUserContext = async () => {};

export default {
  processMessage,
  saveWidgetToVisionBoard,
  resetConversation,
  clearHistory,
  testAPIConnection,
  WIDGET_SUGGESTIONS,
  COURSE_RECOMMENDATIONS,
  AFFILIATE_PROMO,
  KARMA_TYPES,
  sendMessageEnhanced,
  getSmartTriggersForUser,
  logTriggerShown,
  submitFeedback,
  getUserChatStats,
  refreshUserContext,
};
