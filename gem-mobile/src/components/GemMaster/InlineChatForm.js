/**
 * GEM Mobile - Inline Chat Form
 * Beautiful inline form for Goal/Affirmation setting inside chat
 * Replaces full-page modal with chat-style multi-step form
 *
 * Design: Purple gradient cards with glass morphism
 * Similar to Tarot app reference image
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Target,
  Heart,
  Briefcase,
  DollarSign,
  Users,
  Brain,
  Sparkles,
  ChevronRight,
  Check,
  Plus,
  CheckCircle,
  X,
  Clock,
  Flame,
  Zap,
  TrendingUp,
  Gift,
  Mail,
  Wind,
  Droplets,
  Star,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import gemMasterService from '../../services/gemMasterService';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Life areas for goal categorization - Tiếng Việt có dấu
const LIFE_AREAS = [
  { id: 'finance', label: 'Tài chính', icon: DollarSign, color: '#10B981', gradient: ['#10B981', '#059669'] },
  { id: 'crypto', label: 'Crypto', icon: Zap, color: '#F7931A', gradient: ['#F7931A', '#FFD700'] },
  { id: 'career', label: 'Sự nghiệp', icon: Briefcase, color: '#6366F1', gradient: ['#6366F1', '#4F46E5'] },
  { id: 'health', label: 'Sức khỏe', icon: Heart, color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
  { id: 'relationships', label: 'Mối quan hệ', icon: Users, color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
  { id: 'personal', label: 'Phát triển', icon: Brain, color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
  { id: 'spiritual', label: 'Tâm thức', icon: Sparkles, color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
];

// Goal suggestions by life area - quick select options
const GOAL_SUGGESTIONS = {
  finance: [
    'Tiết kiệm 100 triệu trong 6 tháng',
    'Xây dựng quỹ khẩn cấp 6 tháng chi tiêu',
    'Tăng thu nhập thụ động lên 10tr/tháng',
    'Thanh toán hết nợ trong năm nay',
    'Đầu tư sinh lời ổn định 15%/năm',
  ],
  crypto: [
    'Đạt lợi nhuận 50% từ trading crypto',
    'Xây dựng portfolio crypto cân bằng',
    'Học phân tích kỹ thuật thành thạo',
    'Quản lý rủi ro, không mất quá 2%/lệnh',
    'Tìm 3 altcoin tiềm năng mùa bull run',
  ],
  career: [
    'Thăng tiến lên vị trí quản lý',
    'Tăng lương 30% trong năm nay',
    'Học thêm kỹ năng mới (AI, Data)',
    'Chuyển đổi ngành nghề thành công',
    'Xây dựng thương hiệu cá nhân',
  ],
  health: [
    'Giảm 10kg và duy trì cân nặng',
    'Tập gym đều đặn 4 buổi/tuần',
    'Ngủ đủ 7-8 tiếng mỗi đêm',
    'Ăn uống lành mạnh, ít đường',
    'Thiền định 15 phút mỗi ngày',
  ],
  relationships: [
    'Cải thiện mối quan hệ với gia đình',
    'Tìm được người bạn đời phù hợp',
    'Dành thời gian chất lượng với con',
    'Mở rộng mạng lưới quan hệ',
    'Học cách giao tiếp hiệu quả hơn',
  ],
  personal: [
    'Học ngoại ngữ mới (Anh/Trung)',
    'Đọc 24 cuốn sách trong năm',
    'Phát triển tư duy tích cực',
    'Vượt qua nỗi sợ và lo âu',
    'Xây dựng thói quen tốt mỗi ngày',
  ],
  spiritual: [
    'Thiền định sâu 30 phút mỗi ngày',
    'Kết nối với bản ngã cao hơn',
    'Sống mindful và hiện tại',
    'Phát triển trực giác và năng lượng',
    'Thực hành biết ơn mỗi ngày',
  ],
};

// Timeframes - Tiếng Việt có dấu
const TIMEFRAMES = [
  { id: '1week', label: '1 tuần', icon: Clock },
  { id: '1month', label: '1 tháng', icon: Clock },
  { id: '3months', label: '3 tháng', icon: Clock },
  { id: '6months', label: '6 tháng', icon: Clock },
  { id: '1year', label: '1 năm', icon: Clock },
];

// Motivation levels - Tiếng Việt có dấu
const MOTIVATION_LEVELS = [
  { id: 'very_high', label: 'Rất cao', percent: '100%', color: '#10B981' },
  { id: 'high', label: 'Cao', percent: '80%', color: '#3B82F6' },
  { id: 'medium', label: 'Trung bình', percent: '50%', color: '#F59E0B' },
  { id: 'need_help', label: 'Cần hỗ trợ', percent: '30%', color: '#EF4444' },
];

// Emotion options when achieving goal - Cảm xúc khi đạt được mục tiêu
const EMOTION_OPTIONS = [
  { id: 'proud', label: 'Tự hào', emoji: '🏆' },
  { id: 'free', label: 'Tự do', emoji: '🦋' },
  { id: 'peaceful', label: 'Bình an', emoji: '☮️' },
  { id: 'confident', label: 'Tự tin', emoji: '💪' },
  { id: 'happy', label: 'Hạnh phúc', emoji: '😊' },
  { id: 'grateful', label: 'Biết ơn', emoji: '🙏' },
  { id: 'powerful', label: 'Mạnh mẽ', emoji: '⚡' },
  { id: 'fulfilled', label: 'Thỏa mãn', emoji: '✨' },
];

// Challenge options - Thử thách lớn nhất
const CHALLENGE_OPTIONS = [
  { id: 'time', label: 'Thiếu thời gian', emoji: '⏰' },
  { id: 'money', label: 'Hạn chế tài chính', emoji: '💰' },
  { id: 'knowledge', label: 'Thiếu kiến thức', emoji: '📚' },
  { id: 'motivation', label: 'Thiếu động lực', emoji: '🔥' },
  { id: 'fear', label: 'Sợ thất bại', emoji: '😰' },
  { id: 'support', label: 'Thiếu hỗ trợ', emoji: '🤝' },
  { id: 'habits', label: 'Thói quen xấu', emoji: '🔄' },
  { id: 'focus', label: 'Khó tập trung', emoji: '🎯' },
];

// Affirmation templates - Tiếng Việt có dấu
const AFFIRMATION_TEMPLATES = {
  finance: [
    'Tôi thu hút tiền bạc và sự thịnh vượng mỗi ngày',
    'Tôi xứng đáng được giàu có và sung túc',
    'Tiền bạc đến với tôi dễ dàng và liên tục',
  ],
  crypto: [
    'Tôi giao dịch với sự bình tĩnh và kỷ luật',
    'Mỗi quyết định trading của tôi đều sáng suốt',
    'Tôi kiên nhẫn chờ đợi cơ hội hoàn hảo',
    'Tôi quản lý rủi ro một cách khôn ngoan',
    'Thị trường crypto mang lại cơ hội tuyệt vời cho tôi',
  ],
  career: [
    'Tôi là chuyên gia trong lĩnh vực của mình',
    'Cơ hội tốt luôn đến với tôi',
    'Tôi tự tin trong mọi quyết định công việc',
  ],
  health: [
    'Cơ thể tôi khỏe mạnh và tràn đầy năng lượng',
    'Tôi yêu thương và chăm sóc bản thân mỗi ngày',
    'Tôi ngủ ngon và thức dậy đầy sức sống',
  ],
  relationships: [
    'Tôi thu hút những mối quan hệ tích cực',
    'Tôi được yêu thương và tôn trọng',
    'Tình yêu tràn ngập trong cuộc sống của tôi',
  ],
  personal: [
    'Tôi tin tưởng vào khả năng của bản thân',
    'Mỗi ngày tôi trở nên tốt đẹp hơn',
    'Tôi dũng cảm theo đuổi ước mơ',
  ],
  spiritual: [
    'Tôi kết nối sâu sắc với vũ trụ',
    'Năng lượng tích cực bao quanh tôi',
    'Tôi sống trong sự biết ơn mỗi ngày',
  ],
};

// Action Plan templates - Kế hoạch hành động chi tiết cho từng lĩnh vực
// PERSONALIZED templates based on user's deeper responses
// Used to generate personalized affirmations based on emotion + challenge
const PERSONALIZED_AFFIRMATION_TEMPLATES = {
  // By emotion type
  emotion: {
    proud: [
      'Tôi tự hào về mỗi bước tiến của mình',
      'Thành công của tôi là minh chứng cho sự nỗ lực',
      'Tôi xứng đáng được công nhận',
    ],
    free: [
      'Tôi tự do theo đuổi ước mơ của mình',
      'Không gì có thể giới hạn tôi',
      'Tôi là chủ nhân cuộc đời mình',
    ],
    peaceful: [
      'Tôi sống trong sự bình an mỗi ngày',
      'Tâm trí tôi luôn thanh thản và sáng suốt',
      'Sự an yên bên trong là nguồn sức mạnh của tôi',
    ],
    confident: [
      'Tôi tin tưởng vào bản thân mình',
      'Mỗi thử thách là cơ hội để tôi chứng minh năng lực',
      'Tôi có đầy đủ khả năng để thành công',
    ],
    happy: [
      'Tôi chọn hạnh phúc mỗi ngày',
      'Niềm vui lan tỏa trong mọi điều tôi làm',
      'Tôi thu hút những điều tốt đẹp vào cuộc sống',
    ],
    grateful: [
      'Tôi biết ơn mọi điều trong cuộc sống',
      'Lòng biết ơn là chìa khóa mở cánh cửa thịnh vượng',
      'Tôi trân trọng từng khoảnh khắc trên hành trình này',
    ],
    powerful: [
      'Sức mạnh bên trong tôi vô hạn',
      'Tôi có khả năng vượt qua mọi thử thách',
      'Năng lượng của tôi thu hút thành công',
    ],
    fulfilled: [
      'Tôi thỏa mãn với hành trình phát triển của mình',
      'Mỗi ngày tôi tiến gần hơn đến cuộc sống lý tưởng',
      'Tôi sống trọn vẹn và ý nghĩa',
    ],
  },
  // By challenge type
  challenge: {
    time: [
      'Tôi quản lý thời gian một cách khôn ngoan',
      'Tôi luôn có đủ thời gian cho những gì quan trọng',
      'Mỗi phút tôi sử dụng đều mang lại giá trị',
    ],
    money: [
      'Tiền bạc đến với tôi dễ dàng và liên tục',
      'Tôi có trí tuệ để tạo ra sự thịnh vượng',
      'Nguồn lực tài chính dồi dào đang đến với tôi',
    ],
    knowledge: [
      'Tôi học hỏi nhanh chóng và hiệu quả',
      'Mỗi ngày tôi trở nên giỏi hơn',
      'Kiến thức là sức mạnh và tôi không ngừng tiếp thu',
    ],
    motivation: [
      'Động lực bên trong tôi mãnh liệt và bền bỉ',
      'Tôi hào hứng với hành trình phát triển mỗi ngày',
      'Mục tiêu của tôi truyền cảm hứng cho mọi hành động',
    ],
    fear: [
      'Tôi dũng cảm đối mặt với mọi thử thách',
      'Nỗi sợ không điều khiển được tôi',
      'Tôi biến nỗi sợ thành động lực để tiến lên',
    ],
    support: [
      'Tôi thu hút những người hỗ trợ và đồng hành',
      'Mạng lưới hỗ trợ của tôi ngày càng mạnh mẽ',
      'Tôi xứng đáng nhận được sự giúp đỡ từ người khác',
    ],
    habits: [
      'Tôi có sức mạnh để thay đổi thói quen của mình',
      'Mỗi ngày tôi xây dựng thói quen tích cực mới',
      'Tôi là chủ nhân của những thói quen của mình',
    ],
    focus: [
      'Tôi tập trung mạnh mẽ vào mục tiêu',
      'Sự tập trung của tôi như tia laser, không gì có thể làm sao lãng',
      'Tôi hoàn toàn hiện diện trong mọi việc tôi làm',
    ],
  },
};

// Personalized actions based on challenge type WITH FREQUENCY
// Each action now has a frequency type: daily, weekly, monthly
const PERSONALIZED_ACTION_TEMPLATES = {
  challenge: {
    time: [
      { title: 'Dành 15 phút lên kế hoạch mỗi sáng', frequency: 'daily' },
      { title: 'Sử dụng kỹ thuật Pomodoro (25 phút tập trung)', frequency: 'daily' },
      { title: 'Loại bỏ 1 hoạt động lãng phí thời gian', frequency: 'weekly' },
      { title: 'Đặt deadline cụ thể cho từng nhiệm vụ', frequency: 'daily' },
    ],
    money: [
      { title: 'Theo dõi chi tiêu hàng ngày', frequency: 'daily' },
      { title: 'Tìm 1 cách tiết kiệm mới mỗi tuần', frequency: 'weekly' },
      { title: 'Nghiên cứu cơ hội tăng thu nhập', frequency: 'weekly' },
      { title: 'Lập ngân sách chi tiết hàng tháng', frequency: 'monthly' },
    ],
    knowledge: [
      { title: 'Học 30 phút mỗi ngày về chủ đề liên quan', frequency: 'daily' },
      { title: 'Tham gia 1 khóa học online/offline', frequency: 'monthly' },
      { title: 'Đọc sách hoặc bài viết chuyên ngành mỗi ngày', frequency: 'daily' },
      { title: 'Tìm mentor hoặc chuyên gia trong lĩnh vực', frequency: 'monthly' },
    ],
    motivation: [
      { title: 'Viết ra 3 lý do tại sao mục tiêu này quan trọng', frequency: 'weekly' },
      { title: 'Tưởng tượng hình ảnh thành công mỗi sáng', frequency: 'daily' },
      { title: 'Theo dõi tiến trình và celebrate small wins', frequency: 'weekly' },
      { title: 'Kết nối với người có cùng mục tiêu', frequency: 'weekly' },
    ],
    fear: [
      { title: 'Viết ra điều tệ nhất có thể xảy ra và giải pháp', frequency: 'weekly' },
      { title: 'Chia nhỏ mục tiêu thành bước dễ thực hiện', frequency: 'weekly' },
      { title: 'Thực hành 1 điều nhỏ ra ngoài vùng an toàn mỗi ngày', frequency: 'daily' },
      { title: 'Tập trung vào quá trình thay vì kết quả', frequency: 'daily' },
    ],
    support: [
      { title: 'Chia sẻ mục tiêu với 1 người tin tưởng', frequency: 'monthly' },
      { title: 'Tham gia nhóm cộng đồng có cùng mục tiêu', frequency: 'monthly' },
      { title: 'Chủ động nhờ sự giúp đỡ khi cần', frequency: 'weekly' },
      { title: 'Tìm accountability partner để đồng hành', frequency: 'monthly' },
    ],
    habits: [
      { title: 'Thay thế 1 thói quen xấu bằng thói quen tốt', frequency: 'weekly' },
      { title: 'Sử dụng habit tracker theo dõi mỗi ngày', frequency: 'daily' },
      { title: 'Bắt đầu với thói quen nhỏ (2 phút/ngày)', frequency: 'daily' },
      { title: 'Gắn thói quen mới với thói quen cũ (habit stacking)', frequency: 'weekly' },
    ],
    focus: [
      { title: 'Tắt thông báo điện thoại khi làm việc', frequency: 'daily' },
      { title: 'Dọn dẹp không gian làm việc sạch sẽ', frequency: 'weekly' },
      { title: 'Thực hành thiền định 5-10 phút mỗi ngày', frequency: 'daily' },
      { title: 'Làm việc theo block time (1-2 tiếng liên tục)', frequency: 'daily' },
    ],
  },
};

// Frequency labels
const FREQUENCY_LABELS = {
  daily: { label: 'Mỗi ngày', short: 'Ngày', color: '#10B981', icon: '📅' },
  weekly: { label: 'Mỗi tuần', short: 'Tuần', color: '#6366F1', icon: '📆' },
  monthly: { label: 'Mỗi tháng', short: 'Tháng', color: '#F59E0B', icon: '🗓️' },
};

const ACTION_PLAN_TEMPLATES = {
  finance: [
    'Ghi chép chi tiêu hàng ngày vào app',
    'Tiết kiệm 20% thu nhập mỗi tháng',
    'Nghiên cứu 1 cơ hội đầu tư mới mỗi tuần',
    'Đọc sách tài chính 30 phút mỗi ngày',
    'Thiết lập quỹ khẩn cấp 6 tháng chi phí',
    'Học trading/phân tích kỹ thuật 1h/ngày',
    'Review và cắt giảm chi phí không cần thiết',
    'Tạo nguồn thu nhập thụ động',
    'Đặt mục tiêu tài chính cụ thể theo tháng',
    'Tham gia cộng đồng đầu tư để học hỏi',
  ],
  crypto: [
    'Học trading/phân tích kỹ thuật 1h/ngày',
    'Review và cập nhật kế hoạch trading mỗi tuần',
    'Ghi chép trading journal sau mỗi lệnh',
    'Quản lý rủi ro: không vào quá 2% vốn/lệnh',
    'Nghiên cứu fundamental coin mỗi tuần',
    'Theo dõi on-chain data và whale movements',
    'Backtest chiến lược trading mỗi tháng',
    'Đa dạng hóa portfolio 5-7 coin chất lượng',
    'Thực hành 1 điều nhỏ ra ngoài vùng an toàn mỗi ngày',
    'Tập trung vào quá trình thay vì kết quả',
  ],
  career: [
    'Học 1 kỹ năng mới mỗi tháng',
    'Networking với 2 người mới mỗi tuần',
    'Cập nhật CV và portfolio định kỳ',
    'Hoàn thành 1 khóa học online mỗi quý',
    'Đặt mục tiêu công việc hàng tuần',
    'Xin feedback từ sếp/đồng nghiệp mỗi tháng',
    'Tham gia hội thảo/workshop trong ngành',
    'Viết blog chia sẻ kiến thức chuyên môn',
    'Mentoring hoặc tìm mentor cho bản thân',
    'Chuẩn bị kế hoạch thăng tiến 1-3 năm',
  ],
  health: [
    'Tập thể dục 30 phút mỗi ngày',
    'Uống đủ 2 lít nước mỗi ngày',
    'Ngủ đủ 7-8 tiếng mỗi đêm',
    'Ăn rau xanh trong mỗi bữa ăn',
    'Thiền 10 phút mỗi sáng',
    'Đi bộ 10.000 bước mỗi ngày',
    'Giảm đường và thực phẩm chế biến',
    'Khám sức khỏe định kỳ 6 tháng/lần',
    'Tập yoga hoặc stretching mỗi tối',
    'Hạn chế sử dụng điện thoại trước khi ngủ',
  ],
  relationships: [
    'Gọi điện cho người thân 1 lần/tuần',
    'Dành thời gian chất lượng với gia đình',
    'Lắng nghe và thấu hiểu hơn',
    'Thể hiện sự biết ơn mỗi ngày',
    'Tham gia hoạt động xã hội mỗi tháng',
    'Viết thư/tin nhắn yêu thương cho người quan trọng',
    'Học cách giải quyết xung đột hiệu quả',
    'Dành 1 date night mỗi tuần với người yêu',
    'Tham gia hoạt động tình nguyện cùng bạn bè',
    'Hạn chế điện thoại khi ở cạnh người thân',
  ],
  personal: [
    'Đọc sách 20 phút mỗi ngày',
    'Viết nhật ký mỗi tối',
    'Học ngoại ngữ 15 phút/ngày',
    'Thử một điều mới mỗi tuần',
    'Đặt ra 3 mục tiêu nhỏ mỗi ngày',
    'Tham gia khóa học phát triển bản thân',
    'Review mục tiêu cuộc sống mỗi tháng',
    'Thoát khỏi vùng an toàn 1 lần/tuần',
    'Học kỹ năng quản lý thời gian',
    'Xây dựng thói quen tích cực mới',
  ],
  spiritual: [
    'Thiền định 15 phút mỗi sáng',
    'Viết 3 điều biết ơn mỗi ngày',
    'Thực hành mindfulness khi ăn',
    'Đeo crystal hoặc đá phong thủy',
    'Dành 10 phút tĩnh lặng mỗi tối',
    'Đọc sách tâm thức/triết học mỗi tuần',
    'Thực hành yoga hoặc khí công',
    'Kết nối với thiên nhiên mỗi tuần',
    'Tham gia nhóm thiền định hoặc tâm thức',
    'Thực hành từ bi và tha thứ hàng ngày',
  ],
};

// Ritual suggestions by life area - mapped to existing rituals from ritualService
// IDs match RITUAL_TYPES in ritualService.js
const RITUAL_SUGGESTIONS = {
  finance: [
    { id: 'gratitude-flow', title: 'Dòng Chảy Biết Ơn', subtitle: 'Thu hút thịnh vượng', icon: Gift, color: '#FFD700' },
    { id: 'letter-to-universe', title: 'Thư Gửi Vũ Trụ', subtitle: 'Gửi ý định tài chính', icon: Mail, color: '#9D4EDD' },
    { id: 'water-manifest', title: 'Nghi Thức Nước', subtitle: 'Manifest tài chính', icon: Droplets, color: '#4ECDC4' },
  ],
  crypto: [
    { id: 'cleansing-breath', title: 'Thở Thanh Lọc', subtitle: 'Giữ bình tĩnh khi trading', icon: Wind, color: '#667EEA' },
    { id: 'burn-release', title: 'Đốt & Giải Phóng', subtitle: 'Buông bỏ FOMO/FUD', icon: Flame, color: '#FF6B6B' },
    { id: 'letter-to-universe', title: 'Thư Gửi Vũ Trụ', subtitle: 'Gửi mục tiêu trading', icon: Mail, color: '#9D4EDD' },
  ],
  career: [
    { id: 'letter-to-universe', title: 'Thư Gửi Vũ Trụ', subtitle: 'Gửi ước nguyện sự nghiệp', icon: Mail, color: '#9D4EDD' },
    { id: 'cleansing-breath', title: 'Thở Thanh Lọc', subtitle: 'Giải tỏa áp lực công việc', icon: Wind, color: '#667EEA' },
    { id: 'star-wish', title: 'Nghi Thức Ước Sao', subtitle: 'Ước nguyện thành công', icon: Star, color: '#4ECDC4' },
  ],
  health: [
    { id: 'cleansing-breath', title: 'Thở Thanh Lọc', subtitle: 'Thải độc cơ thể', icon: Wind, color: '#667EEA' },
    { id: 'water-manifest', title: 'Nghi Thức Nước', subtitle: 'Nạp năng lượng khỏe mạnh', icon: Droplets, color: '#4ECDC4' },
    { id: 'heart-expansion', title: 'Mở Rộng Trái Tim', subtitle: 'Yêu thương bản thân', icon: Heart, color: '#F093FB' },
  ],
  relationships: [
    { id: 'heart-expansion', title: 'Mở Rộng Trái Tim', subtitle: 'Tăng tần số yêu thương', icon: Heart, color: '#F093FB' },
    { id: 'gratitude-flow', title: 'Dòng Chảy Biết Ơn', subtitle: 'Biết ơn người thân', icon: Gift, color: '#FFD700' },
    { id: 'burn-release', title: 'Đốt & Giải Phóng', subtitle: 'Buông bỏ tổn thương', icon: Flame, color: '#FF6B6B' },
  ],
  personal: [
    { id: 'letter-to-universe', title: 'Thư Gửi Vũ Trụ', subtitle: 'Gửi ước mơ phát triển', icon: Mail, color: '#9D4EDD' },
    { id: 'burn-release', title: 'Đốt & Giải Phóng', subtitle: 'Buông bỏ giới hạn', icon: Flame, color: '#FF6B6B' },
    { id: 'star-wish', title: 'Nghi Thức Ước Sao', subtitle: 'Ước nguyện tương lai', icon: Star, color: '#4ECDC4' },
  ],
  spiritual: [
    { id: 'heart-expansion', title: 'Mở Rộng Trái Tim', subtitle: 'Kết nối yêu thương', icon: Heart, color: '#F093FB' },
    { id: 'gratitude-flow', title: 'Dòng Chảy Biết Ơn', subtitle: 'Thực hành biết ơn', icon: Gift, color: '#FFD700' },
    { id: 'letter-to-universe', title: 'Thư Gửi Vũ Trụ', subtitle: 'Gửi điều ước thiêng liêng', icon: Mail, color: '#9D4EDD' },
    { id: 'water-manifest', title: 'Nghi Thức Nước', subtitle: 'Nạp ý định vào nước', icon: Droplets, color: '#4ECDC4' },
  ],
};

/**
 * InlineChatForm - Multi-step inline form in chat
 * Renders as a chat bubble with step-by-step form
 */
const InlineChatForm = ({
  visible,
  formType = 'goal',
  preSelectedArea = null,
  userInput = null,
  onClose,
  onResult,
}) => {
  const navigation = useNavigation();

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Form state
  const [step, setStep] = useState(preSelectedArea ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data
  const [selectedArea, setSelectedArea] = useState(preSelectedArea);
  const [goalText, setGoalText] = useState(userInput || '');
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);
  const [selectedMotivation, setSelectedMotivation] = useState(null);
  const [selectedAffirmations, setSelectedAffirmations] = useState([]);
  const [selectedActionSteps, setSelectedActionSteps] = useState([]);

  // NEW: Deeper questioning state
  const [whyReason, setWhyReason] = useState(''); // Vì sao bạn muốn điều này?
  const [selectedEmotions, setSelectedEmotions] = useState([]); // Cảm xúc khi đạt được
  const [selectedChallenges, setSelectedChallenges] = useState([]); // Thử thách lớn nhất

  // NEW: Generated personalized content
  const [personalizedAffirmations, setPersonalizedAffirmations] = useState([]);
  const [personalizedActions, setPersonalizedActions] = useState([]);

  // NEW: Ritual selection state
  const [selectedRituals, setSelectedRituals] = useState([]);

  // Animate in
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Update when props change
  useEffect(() => {
    if (visible) {
      if (preSelectedArea) {
        setSelectedArea(preSelectedArea);
        setStep(2);
      } else {
        setStep(1);
      }
      if (userInput) {
        setGoalText(userInput);
      }
    }
  }, [visible, preSelectedArea, userInput]);

  // Reset form
  const resetForm = useCallback(() => {
    setStep(preSelectedArea ? 2 : 1);
    setSelectedArea(preSelectedArea || null);
    setGoalText(userInput || '');
    setSelectedTimeframe(null);
    setSelectedMotivation(null);
    setSelectedAffirmations([]);
    setSelectedActionSteps([]);
    setShowSuccess(false);
    // Reset deeper questioning state
    setWhyReason('');
    setSelectedEmotions([]);
    setSelectedChallenges([]);
    setPersonalizedAffirmations([]);
    setPersonalizedActions([]);
    setSelectedRituals([]);
  }, [preSelectedArea, userInput]);

  // Handle close
  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetForm();
      onClose?.();
    });
  }, [resetForm, onClose]);

  // Get area info
  const getAreaInfo = useCallback(() => {
    return LIFE_AREAS.find(a => a.id === selectedArea) || LIFE_AREAS[0];
  }, [selectedArea]);

  // Toggle affirmation
  const toggleAffirmation = useCallback((aff) => {
    setSelectedAffirmations(prev => {
      if (prev.includes(aff)) {
        return prev.filter(a => a !== aff);
      }
      return [...prev, aff];
    });
  }, []);

  // Toggle action step
  const toggleActionStep = useCallback((step) => {
    setSelectedActionSteps(prev => {
      if (prev.includes(step)) {
        return prev.filter(s => s !== step);
      }
      return [...prev, step];
    });
  }, []);

  // Toggle ritual selection (multi-select)
  const toggleRitual = useCallback((ritualId) => {
    setSelectedRituals(prev => {
      if (prev.includes(ritualId)) {
        return prev.filter(r => r !== ritualId);
      }
      return [...prev, ritualId];
    });
  }, []);

  // Toggle emotion selection (multi-select)
  const toggleEmotion = useCallback((emotionId) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emotionId)) {
        return prev.filter(e => e !== emotionId);
      }
      return [...prev, emotionId];
    });
  }, []);

  // Toggle challenge selection (multi-select)
  const toggleChallenge = useCallback((challengeId) => {
    setSelectedChallenges(prev => {
      if (prev.includes(challengeId)) {
        return prev.filter(c => c !== challengeId);
      }
      return [...prev, challengeId];
    });
  }, []);

  // Generate personalized affirmations based on user's deeper responses
  const generatePersonalizedAffirmations = useCallback(() => {
    const affirmations = [];

    // Add affirmations based on selected emotions
    selectedEmotions.forEach(emotionId => {
      const emotionAffirmations = PERSONALIZED_AFFIRMATION_TEMPLATES.emotion[emotionId] || [];
      // Pick 1-2 random affirmations from each emotion
      const shuffled = [...emotionAffirmations].sort(() => Math.random() - 0.5);
      affirmations.push(...shuffled.slice(0, 2));
    });

    // Add affirmations based on selected challenges
    selectedChallenges.forEach(challengeId => {
      const challengeAffirmations = PERSONALIZED_AFFIRMATION_TEMPLATES.challenge[challengeId] || [];
      const shuffled = [...challengeAffirmations].sort(() => Math.random() - 0.5);
      affirmations.push(...shuffled.slice(0, 2));
    });

    // Add area-based affirmations
    const areaAffirmations = AFFIRMATION_TEMPLATES[selectedArea] || AFFIRMATION_TEMPLATES.personal;
    const shuffledArea = [...areaAffirmations].sort(() => Math.random() - 0.5);
    affirmations.push(...shuffledArea.slice(0, 2));

    // Remove duplicates and limit to 6
    const unique = [...new Set(affirmations)];
    setPersonalizedAffirmations(unique.slice(0, 6));
    // Auto-select first 3
    setSelectedAffirmations(unique.slice(0, 3));
  }, [selectedEmotions, selectedChallenges, selectedArea]);

  // Generate personalized actions based on user's responses
  // Now with frequency (daily, weekly, monthly)
  const generatePersonalizedActions = useCallback(() => {
    const actions = [];

    // Add actions based on selected challenges (with frequency)
    selectedChallenges.forEach(challengeId => {
      const challengeActions = PERSONALIZED_ACTION_TEMPLATES.challenge[challengeId] || [];
      challengeActions.forEach(action => {
        // Handle both old string format and new object format
        if (typeof action === 'string') {
          actions.push({ title: action, frequency: 'daily' });
        } else {
          actions.push({ title: action.title, frequency: action.frequency || 'daily' });
        }
      });
    });

    // Add area-based actions (convert to object format with default daily frequency)
    const areaActions = ACTION_PLAN_TEMPLATES[selectedArea] || ACTION_PLAN_TEMPLATES.personal;
    const shuffledArea = [...areaActions].sort(() => Math.random() - 0.5);
    shuffledArea.slice(0, 4).forEach(actionTitle => {
      // Infer frequency from keywords
      let frequency = 'daily';
      if (actionTitle.includes('mỗi tuần') || actionTitle.includes('hàng tuần')) {
        frequency = 'weekly';
      } else if (actionTitle.includes('mỗi tháng') || actionTitle.includes('hàng tháng') || actionTitle.includes('định kỳ')) {
        frequency = 'monthly';
      } else if (actionTitle.includes('mỗi quý')) {
        frequency = 'monthly'; // Treat quarterly as monthly
      }
      actions.push({ title: actionTitle, frequency });
    });

    // Remove duplicates by title and limit to 10
    const seen = new Set();
    const uniqueActions = actions.filter(action => {
      if (seen.has(action.title)) return false;
      seen.add(action.title);
      return true;
    }).slice(0, 10);

    setPersonalizedActions(uniqueActions);
    // Auto-select first 4 (mix of frequencies)
    const dailyActions = uniqueActions.filter(a => a.frequency === 'daily').slice(0, 2);
    const weeklyActions = uniqueActions.filter(a => a.frequency === 'weekly').slice(0, 1);
    const monthlyActions = uniqueActions.filter(a => a.frequency === 'monthly').slice(0, 1);
    const autoSelected = [...dailyActions, ...weeklyActions, ...monthlyActions].map(a => a.title);
    setSelectedActionSteps(autoSelected.length > 0 ? autoSelected : uniqueActions.slice(0, 3).map(a => a.title));
  }, [selectedChallenges, selectedArea]);

  // Next step - now 7 steps total (with deeper questioning + rituals)
  // Step 1: Area, Step 2: Goal, Step 3: Why+Emotions, Step 4: Timeframe+Challenges, Step 5: Affirmations, Step 6: Actions, Step 7: Rituals
  const nextStep = useCallback(() => {
    const maxSteps = 7;
    if (step < maxSteps) {
      // When moving to step 5 (affirmations), generate personalized content
      if (step === 4) {
        generatePersonalizedAffirmations();
      }
      // When moving to step 6 (actions), generate personalized actions
      if (step === 5) {
        generatePersonalizedActions();
      }
      setStep(step + 1);
    }
  }, [step, generatePersonalizedAffirmations, generatePersonalizedActions]);

  // Previous step
  const prevStep = useCallback(() => {
    const minStep = preSelectedArea ? 2 : 1;
    if (step > minStep) {
      setStep(step - 1);
    }
  }, [step, preSelectedArea]);

  // Check if step is complete - now 7 steps
  // Step 3: Why reason is OPTIONAL now - only emotions required
  // Step 7: Rituals are OPTIONAL - can skip
  const isStepComplete = useCallback(() => {
    switch (step) {
      case 1: return selectedArea !== null;
      case 2: return goalText.trim().length >= 5;
      case 3: return selectedEmotions.length > 0; // Only emotions required, why is optional
      case 4: return selectedTimeframe !== null && selectedChallenges.length > 0; // Timeframe + Challenges
      case 5: return selectedAffirmations.length > 0;
      case 6: return selectedActionSteps.length > 0;
      case 7: return true; // Rituals are optional - always allow submission
      default: return false;
    }
  }, [step, selectedArea, goalText, selectedEmotions, selectedTimeframe, selectedChallenges, selectedAffirmations, selectedActionSteps]);

  // Submit form - Creates 3 widgets: goal, affirmation, action_plan (linked together)
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Vui lòng đăng nhập để sử dụng');
      }

      const areaLabel = getAreaInfo().label;
      const timeframeLabel = TIMEFRAMES.find(t => t.id === selectedTimeframe)?.label || '';

      // Get emotion and challenge labels for content
      const emotionLabels = selectedEmotions.map(id =>
        EMOTION_OPTIONS.find(e => e.id === id)?.label || ''
      );
      const challengeLabels = selectedChallenges.map(id =>
        CHALLENGE_OPTIONS.find(c => c.id === id)?.label || ''
      );

      // Generate a unique goal ID for linking
      const goalId = `goal_${Date.now()}`;

      // Get ritual details for selected rituals
      // Auto-select first ritual if none selected (so goals always have at least 1 ritual)
      const ritualSuggestions = RITUAL_SUGGESTIONS[selectedArea] || RITUAL_SUGGESTIONS.spiritual;
      const ritualsToUse = selectedRituals.length > 0
        ? selectedRituals
        : ritualSuggestions.length > 0 ? [ritualSuggestions[0].id] : [];

      const selectedRitualDetails = ritualsToUse.map(ritualId => {
        const ritual = ritualSuggestions.find(r => r.id === ritualId);
        return ritual ? { id: ritual.id, title: ritual.title, subtitle: ritual.subtitle, color: ritual.color } : null;
      }).filter(Boolean);

      // Debug: Log what rituals are being saved
      // CRITICAL: Check if any rituals were lost during lookup
      const ritualLookupResults = ritualsToUse.map(ritualId => {
        const ritual = ritualSuggestions.find(r => r.id === ritualId);
        return { id: ritualId, found: !!ritual, title: ritual?.title || 'NOT FOUND' };
      });

      console.log('[InlineChatForm] Saving goal with rituals:', {
        selectedArea,
        selectedRituals,
        ritualsToUse,
        autoSelected: selectedRituals.length === 0,
        ritualSuggestionsCount: ritualSuggestions.length,
        ritualSuggestionsIds: ritualSuggestions.map(r => r.id),
        ritualLookupResults,
        selectedRitualDetails,
        selectedRitualDetailsCount: selectedRitualDetails.length,
        // This should match ritualsToUse.length if all rituals were found
        allRitualsFound: ritualsToUse.length === selectedRitualDetails.length,
      });

      // Build 3 widgets - all linked to the same goal
      // Enhanced with deeper questioning data + rituals
      const goalWidget = {
        user_id: user.id,
        type: 'goal',
        title: goalText,
        icon: '🎯',
        content: {
          goals: [{
            id: goalId,
            title: goalText,
            completed: false,
            timeline: timeframeLabel,
            lifeArea: selectedArea,
            // NEW: Deeper context
            whyReason: whyReason,
            emotions: selectedEmotions,
            emotionLabels: emotionLabels,
            challenges: selectedChallenges,
            challengeLabels: challengeLabels,
            // NEW: Selected rituals
            rituals: selectedRitualDetails,
          }],
          lifeArea: selectedArea,
          // Store deeper context for future reference
          deeperContext: {
            whyReason,
            emotions: selectedEmotions,
            challenges: selectedChallenges,
          },
          // Store rituals at content level too for easy access
          rituals: selectedRitualDetails,
        },
        is_active: true,
      };

      // Insert goal first to get its ID
      const { data: createdGoal, error: goalError } = await supabase
        .from('vision_board_widgets')
        .insert(goalWidget)
        .select()
        .single();

      if (goalError) throw goalError;

      // DEBUG: Verify that ALL rituals were saved correctly
      console.log('[InlineChatForm] Goal widget created - VERIFY RITUALS:', {
        goalId: createdGoal.id,
        contentRitualsCount: createdGoal.content?.rituals?.length || 0,
        contentRituals: createdGoal.content?.rituals?.map(r => r.id),
        goals0RitualsCount: createdGoal.content?.goals?.[0]?.rituals?.length || 0,
        goals0Rituals: createdGoal.content?.goals?.[0]?.rituals?.map(r => r.id),
        originalSelectedRituals: selectedRituals,
        originalSelectedRitualDetails: selectedRitualDetails.map(r => r.id),
      });

      const linkedGoalId = createdGoal.id;

      // Create affirmation widget linked to goal
      const affirmationWidget = {
        user_id: user.id,
        type: 'affirmation',
        title: `Khẳng định: ${areaLabel}`,
        icon: '✨',
        content: {
          affirmations: selectedAffirmations,
          lifeArea: selectedArea,
          linked_goal_id: linkedGoalId, // Stored in content for GoalDetailScreen query
        },
        is_active: true,
      };

      // Create action plan widget linked to goal - NOW WITH FREQUENCY
      // Find the frequency for each selected action
      const getActionFrequency = (actionTitle) => {
        const actionItem = personalizedActions.find(a => a.title === actionTitle);
        return actionItem?.frequency || 'daily';
      };

      const actionPlanWidget = {
        user_id: user.id,
        type: 'action_plan', // Changed from 'habit' to 'action_plan' for clearer typing
        title: `Kế hoạch: ${areaLabel}`,
        icon: '📋',
        content: {
          // Group steps by frequency for better organization
          // IMPORTANT: Use simple index-based IDs so VisionBoard can parse them
          // Format: step_0, step_1, etc. - VisionBoard will prefix with widgetId
          steps: selectedActionSteps.map((step, index) => ({
            id: index, // Simple index - VisionBoard will create full ID
            title: step,
            completed: false,
            frequency: getActionFrequency(step), // NEW: Add frequency
          })),
          // Also store by frequency for grouped display
          dailySteps: selectedActionSteps
            .filter(s => getActionFrequency(s) === 'daily')
            .map((step, idx) => ({
              id: idx,
              title: step,
              completed: false,
              frequency: 'daily',
            })),
          weeklySteps: selectedActionSteps
            .filter(s => getActionFrequency(s) === 'weekly')
            .map((step, idx) => ({
              id: idx,
              title: step,
              completed: false,
              frequency: 'weekly',
            })),
          monthlySteps: selectedActionSteps
            .filter(s => getActionFrequency(s) === 'monthly')
            .map((step, idx) => ({
              id: idx,
              title: step,
              completed: false,
              frequency: 'monthly',
            })),
          lifeArea: selectedArea,
          linked_goal_id: linkedGoalId, // Stored in content for GoalDetailScreen query
        },
        is_active: true,
      };

      // Insert affirmation and action plan
      console.log('[InlineChatForm] Inserting affirmation widget with linked_goal_id:', linkedGoalId);
      console.log('[InlineChatForm] Affirmation content:', JSON.stringify(affirmationWidget.content));

      const { data: affData, error: affError } = await supabase
        .from('vision_board_widgets')
        .insert(affirmationWidget)
        .select()
        .single();

      if (affError) {
        console.error('[InlineChatForm] Affirmation insert error:', affError);
      } else {
        console.log('[InlineChatForm] Affirmation created with id:', affData?.id, 'linked_goal_id in content:', affData?.content?.linked_goal_id);
      }

      console.log('[InlineChatForm] Inserting action_plan widget with linked_goal_id:', linkedGoalId);
      console.log('[InlineChatForm] Action plan content:', JSON.stringify(actionPlanWidget.content));

      const { data: actionData, error: actionError } = await supabase
        .from('vision_board_widgets')
        .insert(actionPlanWidget)
        .select()
        .single();

      if (actionError) {
        console.error('[InlineChatForm] Action plan insert error:', actionError);
      } else {
        console.log('[InlineChatForm] Action plan created with id:', actionData?.id, 'linked_goal_id in content:', actionData?.content?.linked_goal_id);
      }

      // VERIFY: Query database to confirm widgets were created with correct linked_goal_id
      const { data: verifyWidgets } = await supabase
        .from('vision_board_widgets')
        .select('id, type, content')
        .eq('user_id', user.id)
        .in('type', ['affirmation', 'action_plan'])
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('[InlineChatForm] VERIFICATION - Recent affirmation/action_plan widgets:');
      (verifyWidgets || []).forEach(w => {
        const content = typeof w.content === 'string' ? JSON.parse(w.content) : w.content;
        console.log(`  - Widget ${w.id}: type=${w.type}, linked_goal_id=${content?.linked_goal_id}, goalId=${content?.goalId}`);
      });
      console.log('[InlineChatForm] Expected linkedGoalId:', linkedGoalId);

      setShowSuccess(true);

      // Store widgets for later callback when user dismisses
      // DO NOT auto-dismiss - wait for user to tap button

    } catch (error) {
      console.error('[InlineChatForm] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedArea, goalText, selectedTimeframe, selectedAffirmations, selectedActionSteps, selectedRituals, whyReason, selectedEmotions, selectedChallenges, getAreaInfo, onResult]);

  // Navigate to Vision Board - scroll to Goals section
  const goToVisionBoard = useCallback(() => {
    handleClose();
    navigation.navigate('Account', {
      screen: 'VisionBoard',
      params: { scrollToSection: 'goals' }
    });
  }, [navigation, handleClose]);

  if (!visible) return null;

  const areaInfo = getAreaInfo();
  const totalSteps = preSelectedArea ? 6 : 7; // Now 7 steps: area, goal, why+emotions, time+challenges, affirmation, action, ritual
  const adjustedStep = preSelectedArea ? step - 1 : step;

  // Success view - Dark theme with gold accents
  if (showSuccess) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.successCard}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={48} color={COLORS.success || '#10B981'} />
          </View>
          <Text style={styles.successTitle}>Đã thêm thành công!</Text>
          <Text style={styles.successMessage}>
            Mục tiêu đã được thêm vào Vision Board của bạn.
          </Text>
          <View style={styles.successButtons}>
            <TouchableOpacity style={styles.successBtn} onPress={handleClose}>
              <Text style={styles.successBtnText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.successBtnPrimary} onPress={goToVisionBoard}>
              <Text style={styles.successBtnPrimaryText}>Xem Vision Board</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Main Card */}
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.2)', 'rgba(106, 91, 255, 0.1)']}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: `${areaInfo.color}30` }]}>
              <Target size={18} color={areaInfo.color} />
            </View>
            <Text style={styles.headerTitle}>
              Manifest {areaInfo.label}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                s === adjustedStep && styles.stepDotActive,
                s < adjustedStep && styles.stepDotComplete,
              ]}
            />
          ))}
        </View>

        {/* Step Content - ScrollView with fixed height */}
        <ScrollView
          style={styles.stepContent}
          contentContainerStyle={styles.stepContentInner}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          scrollEnabled={true}
          overScrollMode="never"
        >
          {step === 1 && (
            <>
              <Text style={styles.stepQuestion}>Bạn muốn đặt mục tiêu ở lĩnh vực nào?</Text>
              <View style={styles.areaGrid}>
                {LIFE_AREAS.map((area) => {
                  const Icon = area.icon;
                  const isSelected = selectedArea === area.id;
                  return (
                    <TouchableOpacity
                      key={area.id}
                      style={[styles.areaBtn, isSelected && { borderColor: area.color, backgroundColor: `${area.color}20` }]}
                      onPress={() => setSelectedArea(area.id)}
                    >
                      <Icon size={20} color={isSelected ? area.color : COLORS.textMuted} />
                      <Text style={[styles.areaBtnText, isSelected && { color: area.color }]}>
                        {area.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.stepQuestion}>Mô tả mục tiêu của bạn</Text>
              <Text style={styles.stepHint}>
                Trong lĩnh vực <Text style={{ color: areaInfo.color }}>{areaInfo.label}</Text>, bạn muốn đạt được gì?
              </Text>
              <TextInput
                style={styles.goalInput}
                placeholder="Nhập mục tiêu hoặc chọn gợi ý bên dưới..."
                placeholderTextColor={COLORS.textMuted}
                value={goalText}
                onChangeText={setGoalText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{goalText.length} ký tự (tối thiểu 5)</Text>

              {/* Goal suggestions */}
              {GOAL_SUGGESTIONS[selectedArea] && (
                <View style={styles.suggestionsSection}>
                  <Text style={styles.suggestionsLabel}>Gợi ý nhanh:</Text>
                  <View style={styles.suggestionsList}>
                    {GOAL_SUGGESTIONS[selectedArea].map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.suggestionChip,
                          goalText === suggestion && styles.suggestionChipSelected,
                        ]}
                        onPress={() => setGoalText(suggestion)}
                      >
                        <Text style={[
                          styles.suggestionChipText,
                          goalText === suggestion && styles.suggestionChipTextSelected,
                        ]}>
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {/* Step 3: WHY + EMOTIONS - Deeper questioning */}
          {step === 3 && (
            <>
              <Text style={styles.stepQuestion}>Hiểu sâu hơn về mục tiêu</Text>

              <Text style={styles.sectionLabel}>Vì sao bạn muốn đạt được điều này?</Text>
              <TextInput
                style={[styles.goalInput, { minHeight: 60 }]}
                placeholder="Điều gì thúc đẩy bạn? Mục tiêu này có ý nghĩa gì với bạn?"
                placeholderTextColor={COLORS.textMuted}
                value={whyReason}
                onChangeText={setWhyReason}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />

              <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>
                Khi đạt được mục tiêu, bạn sẽ cảm thấy thế nào?
              </Text>
              <View style={styles.emotionGrid}>
                {EMOTION_OPTIONS.map((emotion) => {
                  const isSelected = selectedEmotions.includes(emotion.id);
                  return (
                    <TouchableOpacity
                      key={emotion.id}
                      style={[
                        styles.emotionBtn,
                        isSelected && styles.emotionBtnSelected,
                      ]}
                      onPress={() => toggleEmotion(emotion.id)}
                    >
                      <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                      <Text style={[styles.emotionLabel, isSelected && styles.emotionLabelSelected]}>
                        {emotion.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.selectedCount}>
                Đã chọn: {selectedEmotions.length} cảm xúc
              </Text>
            </>
          )}

          {/* Step 4: TIMEFRAME + CHALLENGES */}
          {step === 4 && (
            <>
              <Text style={styles.stepQuestion}>Thời gian & Thử thách</Text>

              <Text style={styles.sectionLabel}>Thời gian hoàn thành:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeframeScroll}>
                {TIMEFRAMES.map((tf) => (
                  <TouchableOpacity
                    key={tf.id}
                    style={[styles.timeframeBtn, selectedTimeframe === tf.id && styles.timeframeBtnActive]}
                    onPress={() => setSelectedTimeframe(tf.id)}
                  >
                    <Text style={[styles.timeframeBtnText, selectedTimeframe === tf.id && styles.timeframeBtnTextActive]}>
                      {tf.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>
                Thử thách lớn nhất của bạn là gì?
              </Text>
              <View style={styles.challengeGrid}>
                {CHALLENGE_OPTIONS.map((challenge) => {
                  const isSelected = selectedChallenges.includes(challenge.id);
                  return (
                    <TouchableOpacity
                      key={challenge.id}
                      style={[
                        styles.challengeBtn,
                        isSelected && styles.challengeBtnSelected,
                      ]}
                      onPress={() => toggleChallenge(challenge.id)}
                    >
                      <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                      <Text style={[styles.challengeLabel, isSelected && styles.challengeLabelSelected]}>
                        {challenge.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.selectedCount}>
                Đã chọn: {selectedChallenges.length} thử thách
              </Text>
            </>
          )}

          {/* Step 5: PERSONALIZED AFFIRMATIONS */}
          {step === 5 && (
            <>
              <Text style={styles.stepQuestion}>Affirmation dành riêng cho bạn</Text>
              <Text style={styles.stepHint}>
                Dựa trên câu trả lời của bạn, đây là những khẳng định phù hợp nhất
              </Text>
              <ScrollView style={styles.scrollableList} nestedScrollEnabled>
                {personalizedAffirmations.map((aff, index) => {
                  const isSelected = selectedAffirmations.includes(aff);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.affirmationItem, isSelected && styles.affirmationItemSelected]}
                      onPress={() => toggleAffirmation(aff)}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Check size={12} color="#0A0F1C" />}
                      </View>
                      <Text style={[styles.affirmationText, isSelected && styles.affirmationTextSelected]}>
                        "{aff}"
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <Text style={styles.selectedCount}>
                Đã chọn: {selectedAffirmations.length} affirmation
              </Text>
            </>
          )}

          {/* Step 6: PERSONALIZED ACTIONS - Grouped by Frequency */}
          {step === 6 && (
            <>
              <Text style={styles.stepQuestion}>Kế hoạch hành động cá nhân</Text>
              <Text style={styles.stepHint}>
                Dựa trên thử thách của bạn, đây là các bước phù hợp nhất
              </Text>

              {/* Frequency Legend */}
              <View style={styles.frequencyLegend}>
                {Object.entries(FREQUENCY_LABELS).map(([key, info]) => (
                  <View key={key} style={styles.frequencyLegendItem}>
                    <View style={[styles.frequencyDot, { backgroundColor: info.color }]} />
                    <Text style={styles.frequencyLegendText}>{info.short}</Text>
                  </View>
                ))}
              </View>

              <ScrollView style={styles.scrollableList} nestedScrollEnabled>
                {/* Group actions by frequency */}
                {['daily', 'weekly', 'monthly'].map(freq => {
                  const freqActions = personalizedActions.filter(a => a.frequency === freq);
                  if (freqActions.length === 0) return null;
                  const freqInfo = FREQUENCY_LABELS[freq];

                  return (
                    <View key={freq} style={styles.frequencyGroup}>
                      <View style={[styles.frequencyHeader, { borderLeftColor: freqInfo.color }]}>
                        <Text style={styles.frequencyIcon}>{freqInfo.icon}</Text>
                        <Text style={[styles.frequencyTitle, { color: freqInfo.color }]}>
                          {freqInfo.label}
                        </Text>
                        <Text style={styles.frequencyCount}>
                          {freqActions.filter(a => selectedActionSteps.includes(a.title)).length}/{freqActions.length}
                        </Text>
                      </View>

                      {freqActions.map((actionItem, index) => {
                        const isSelected = selectedActionSteps.includes(actionItem.title);
                        return (
                          <TouchableOpacity
                            key={`${freq}_${index}`}
                            style={[
                              styles.affirmationItem,
                              isSelected && styles.affirmationItemSelected,
                              { borderLeftWidth: 3, borderLeftColor: isSelected ? freqInfo.color : 'transparent' },
                            ]}
                            onPress={() => toggleActionStep(actionItem.title)}
                          >
                            <View style={[
                              styles.checkbox,
                              isSelected && styles.checkboxSelected,
                              isSelected && { backgroundColor: freqInfo.color, borderColor: freqInfo.color },
                            ]}>
                              {isSelected && <Check size={12} color="#0A0F1C" />}
                            </View>
                            <Text style={[styles.affirmationText, isSelected && styles.affirmationTextSelected]}>
                              {actionItem.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
              </ScrollView>
              <Text style={styles.selectedCount}>
                Đã chọn: {selectedActionSteps.length} bước hành động
              </Text>
            </>
          )}

          {/* Step 7: RITUAL SELECTION - Based on life area */}
          {step === 7 && (
            <>
              <Text style={styles.stepQuestion}>Nghi thức tâm thức hỗ trợ</Text>
              <Text style={styles.stepHint}>
                Chọn nghi thức để tăng cường năng lượng cho mục tiêu (không bắt buộc)
              </Text>

              <View style={styles.ritualGrid}>
                {(RITUAL_SUGGESTIONS[selectedArea] || RITUAL_SUGGESTIONS.spiritual).map((ritual) => {
                  const IconComponent = ritual.icon;
                  const isSelected = selectedRituals.includes(ritual.id);
                  return (
                    <TouchableOpacity
                      key={ritual.id}
                      style={[
                        styles.ritualCard,
                        isSelected && styles.ritualCardSelected,
                        { borderColor: isSelected ? ritual.color : 'rgba(255,255,255,0.1)' },
                      ]}
                      onPress={() => toggleRitual(ritual.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.ritualIconWrapper, { backgroundColor: `${ritual.color}20` }]}>
                        <IconComponent size={24} color={ritual.color} />
                      </View>
                      <Text style={[styles.ritualTitle, isSelected && { color: ritual.color }]}>
                        {ritual.title}
                      </Text>
                      <Text style={styles.ritualSubtitle}>{ritual.subtitle}</Text>
                      {isSelected && (
                        <View style={[styles.ritualCheck, { backgroundColor: ritual.color }]}>
                          <Check size={12} color="#0A0F1C" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.selectedCount}>
                {selectedRituals.length > 0
                  ? `Đã chọn: ${selectedRituals.length} nghi thức`
                  : 'Bỏ qua nếu không muốn chọn'}
              </Text>

              {/* Navigate to ritual button */}
              {selectedRituals.length > 0 && (
                <TouchableOpacity
                  style={styles.viewRitualBtn}
                  onPress={() => {
                    // Navigate to first selected ritual - RitualPlayground is in AccountStack
                    const ritualSuggestions = RITUAL_SUGGESTIONS[selectedArea] || RITUAL_SUGGESTIONS.spiritual;
                    const firstRitualId = selectedRituals[0];
                    const firstRitual = ritualSuggestions.find(r => r.id === firstRitualId);
                    handleClose();
                    navigation.navigate('Account', {
                      screen: 'RitualPlayground',
                      params: { ritual: firstRitual || { id: firstRitualId } },
                    });
                  }}
                >
                  <Sparkles size={16} color={COLORS.gold} />
                  <Text style={styles.viewRitualBtnText}>Thực hiện nghi thức ngay</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          {step > (preSelectedArea ? 2 : 1) && (
            <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
              <Text style={styles.backBtnText}>Quay lại</Text>
            </TouchableOpacity>
          )}

          {step < 7 ? (
            <TouchableOpacity
              style={[styles.nextBtn, !isStepComplete() && styles.nextBtnDisabled]}
              onPress={nextStep}
              disabled={!isStepComplete()}
            >
              <Text style={[styles.nextBtnText, !isStepComplete() && styles.nextBtnTextDisabled]}>Tiếp theo</Text>
              <ChevronRight size={18} color={isStepComplete() ? '#0A0F1C' : COLORS.textMuted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, (!isStepComplete() || isSubmitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isStepComplete() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#0A0F1C" />
              ) : (
                <>
                  <Sparkles size={18} color="#0A0F1C" />
                  <Text style={styles.submitBtnText}>Tạo Mục Tiêu</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  card: {
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepDotActive: {
    backgroundColor: COLORS.gold,
    width: 24,
  },
  stepDotComplete: {
    backgroundColor: COLORS.gold,
  },
  stepContent: {
    maxHeight: 400, // Increased from 280 to reduce scroll leak
    flexGrow: 0,
  },
  stepContentInner: {
    paddingBottom: SPACING.xl, // More padding at bottom for overscroll buffer
  },
  scrollableList: {
    maxHeight: 360, // Expanded from 280 for better scroll experience
  },
  stepQuestion: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  stepHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  // Area Grid
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  areaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  areaBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  // Goal Input
  goalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  // Goal Suggestions
  suggestionsSection: {
    marginTop: SPACING.md,
  },
  suggestionsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  suggestionChipSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.25)',
    borderColor: COLORS.gold,
  },
  suggestionChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  suggestionChipTextSelected: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  // Timeframe
  timeframeScroll: {
    flexGrow: 0,
  },
  timeframeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeframeBtnActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  timeframeBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  timeframeBtnTextActive: {
    color: '#0A0F1C',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Motivation
  motivationGrid: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  motivationBtn: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  motivationPercent: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  motivationLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Emotion Grid (NEW)
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  emotionBtn: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emotionBtnSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: COLORS.gold,
  },
  emotionEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  emotionLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emotionLabelSelected: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Challenge Grid (NEW)
  challengeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  challengeBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xs,
  },
  challengeBtnSelected: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  challengeEmoji: {
    fontSize: 16,
  },
  challengeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    flex: 1,
  },
  challengeLabelSelected: {
    color: '#EF4444',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Affirmations
  affirmationList: {
    gap: SPACING.xs,
  },
  affirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  affirmationItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderColor: COLORS.gold,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  affirmationText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  affirmationTextSelected: {
    color: COLORS.textPrimary,
  },
  selectedCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  backBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A0F1C',
  },
  nextBtnTextDisabled: {
    color: COLORS.textMuted,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
  },
  submitBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A0F1C',
  },
  // Success - Dark theme with gold accents
  successCard: {
    borderRadius: SPACING.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    backgroundColor: COLORS.glassBg || '#1a1a2e',
  },
  successIconContainer: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  successMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  successButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  successBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  successBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  successBtnPrimary: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  successBtnPrimaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A0F1C',
  },
  // Frequency Legend styles
  frequencyLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: SPACING.sm,
  },
  frequencyLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  frequencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  frequencyLegendText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  // Frequency Group styles
  frequencyGroup: {
    marginBottom: SPACING.md,
  },
  frequencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderLeftWidth: 3,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 4,
  },
  frequencyIcon: {
    fontSize: 14,
  },
  frequencyTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
  },
  frequencyCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  // Ritual Grid styles
  ritualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  ritualCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    position: 'relative',
  },
  ritualCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  ritualIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  ritualTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  ritualSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  ritualCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewRitualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold,
    marginTop: SPACING.sm,
  },
  viewRitualBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default InlineChatForm;
