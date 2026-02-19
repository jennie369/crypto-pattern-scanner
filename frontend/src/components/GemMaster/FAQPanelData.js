/**
 * FAQ Panel Data - Quick Select Topics & Questions
 * Ported from gem-mobile/src/components/GemMaster/FAQPanelData.js
 * Uses lucide-react (web) instead of lucide-react-native
 */

import {
  Sparkles,
  Wand2,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Heart,
  GraduationCap,
  Gem,
  Users,
  Compass,
} from 'lucide-react';

export const FAQ_TOPICS = [
  { id: 'iching', label: 'Kinh Dich', subtitle: 'I Ching Reading', Icon: Sparkles, color: '#FFBD59', action: 'navigate_screen', screen: 'IChing' },
  { id: 'tarot', label: 'Tarot', subtitle: 'Card Reading', Icon: Wand2, color: '#00D9FF', action: 'navigate_screen', screen: 'Tarot' },
  { id: 'analyze', label: 'Phan tich', subtitle: 'Analysis', Icon: TrendingUp, color: '#00FF88', action: 'show_faq' },
  { id: 'suggest', label: 'Goi y', subtitle: 'Tips', Icon: Lightbulb, color: '#FF6B9D', action: 'show_faq' },
  { id: 'wealth', label: 'Tai loc', subtitle: 'Wealth', Icon: DollarSign, color: '#FFD700', action: 'show_faq' },
  { id: 'love', label: 'Tinh yeu', subtitle: 'Love', Icon: Heart, color: '#FF69B4', action: 'show_faq' },
  { id: 'courses', label: 'Khoa hoc', subtitle: 'Courses', Icon: GraduationCap, color: '#3498DB', action: 'show_faq' },
  { id: 'crystals', label: 'Thach anh', subtitle: 'Crystals', Icon: Gem, color: '#9B59B6', action: 'show_faq' },
  { id: 'affiliate', label: 'Kiem tien', subtitle: 'Affiliate', Icon: Users, color: '#F59E0B', action: 'show_faq' },
  { id: 'spiritual', label: 'Tam linh', subtitle: 'Spiritual', Icon: Compass, color: '#A855F7', action: 'show_faq' },
];

export const FAQ_QUESTIONS = {
  analyze: [
    { id: 'analyze_fomo_btc', text: 'BTC tang 5% roi, muon mua ngay!', action: 'message', prompt: 'Muon mua BTC ngay, tang 5% roi! Khong muon bo lo co hoi!', isFOMO: true, tag: 'FOMO TEST' },
    { id: 'analyze_btc', text: 'Phan tich gia Bitcoin hien tai', action: 'message', prompt: 'Phan tich gia Bitcoin hien tai' },
    { id: 'analyze_eth', text: 'Phan tich gia Ethereum', action: 'message', prompt: 'Phan tich gia Ethereum hien tai' },
    { id: 'analyze_bnb', text: 'Phan tich coin BNB', action: 'message', prompt: 'Phan tich coin BNB hien tai' },
    { id: 'analyze_market', text: 'Phan tich xu huong thi truong crypto', action: 'message', prompt: 'Phan tich xu huong thi truong crypto hien tai' },
    { id: 'analyze_frequency', text: 'Phan tich tan so nang luong cua toi', action: 'inline_form', formType: 'frequency_analysis' },
    { id: 'analyze_longshort', text: 'Thi truong hom nay nen Long hay Short?', action: 'message', prompt: 'Thi truong crypto hom nay nen Long hay Short? Phan tich xu huong va dua ra khuyen nghi.' },
  ],
  suggest: [
    { id: 'suggest_career', text: 'Toi nen doi viec hay o lai?', action: 'message', prompt: 'Toi nen doi viec hay o lai cong ty hien tai? Hay phan tich va dua ra framework giup toi dua ra quyet dinh.', isDeep: true, tag: 'CAREER' },
    { id: 'suggest_newbie', text: 'Goi y chien luoc dau tu crypto cho nguoi moi', action: 'message', prompt: 'Goi y chien luoc dau tu crypto cho nguoi moi bat dau' },
    { id: 'suggest_coins', text: 'Goi y coin tiem nang tuan nay', action: 'message', prompt: 'Goi y cac coin tiem nang tuan nay dua tren phan tich ky thuat' },
    { id: 'suggest_visionboard', text: 'Goi y cach dat muc tieu trong Visionboard', action: 'inline_form', formType: 'goal_setting' },
    { id: 'suggest_fomo', text: 'Goi y cach tranh FOMO khi trade', action: 'message', prompt: 'Goi y cach tranh FOMO khi trading crypto' },
    { id: 'suggest_tier', text: 'Toi nen hoc TIER nao phu hop?', action: 'message', prompt: 'Tu van toi nen hoc TIER trading nao phu hop voi trinh do cua toi' },
    { id: 'suggest_winrate', text: 'So sanh win rate cac TIER', action: 'message', prompt: 'So sanh win rate giua cac TIER trading cua Gemral' },
  ],
  wealth: [
    { id: 'wealth_leak', text: 'Tai sao tien cu tuot khoi tay toi?', action: 'message', prompt: 'Tai sao tien cu tuot khoi tay toi? Phan tich goc re van de tu goc nhin nang luong va tam ly, dua ra bai tap chua lanh.', isDeep: true, tag: 'DEEP QUESTION' },
    { id: 'wealth_manifest', text: 'Huong dan manifest tien bac', action: 'inline_form', formType: 'manifest_wealth' },
    { id: 'wealth_karma', text: 'Nghiep tien bac cua toi la gi?', action: 'questionnaire', karmaType: 'money' },
    { id: 'wealth_block', text: 'Tai sao toi bi block tien?', action: 'message', prompt: 'Tai sao toi bi block tien? Phan tich va huong dan cach thao go.' },
    { id: 'wealth_exercise', text: 'Bai tap "Chi tien trong hanh phuc"', action: 'message', prompt: 'Huong dan chi tiet bai tap "Chi tien trong hanh phuc"' },
    { id: 'wealth_crystal', text: 'Da nao ho tro tai chinh?', action: 'message_crystal', prompt: 'Da thach anh nao ho tro tai chinh tot nhat?', crystalTags: ['Citrine', 'money', 'abundance'] },
    { id: 'wealth_scarcity', text: 'Lam sao de thoat tu duy thieu hut?', action: 'message', prompt: 'Lam sao de thoat tu duy thieu hut (scarcity mindset)?' },
  ],
  love: [
    { id: 'love_destiny', text: 'Nguoi ay co phai dinh menh cua toi khong?', action: 'message', prompt: 'Nguoi ay co phai dinh menh cua toi khong? Hay phan tich tu goc nhin nang luong va tam linh.', isDeep: true, tag: 'DEEP QUESTION' },
    { id: 'love_manifest', text: 'Huong dan manifest tinh yeu', action: 'inline_form', formType: 'manifest_love' },
    { id: 'love_wrong', text: 'Tai sao toi luon gap sai nguoi?', action: 'message', prompt: 'Tai sao toi luon gap sai nguoi trong tinh yeu? Phan tich va huong dan.' },
    { id: 'love_karma', text: 'Nghiep tinh yeu cua toi la gi?', action: 'questionnaire', karmaType: 'love' },
    { id: 'love_self', text: 'Lam sao de yeu ban than hon?', action: 'message', prompt: 'Lam sao de yeu ban than hon? Huong dan chi tiet.' },
    { id: 'love_crystal', text: 'Da nao ho tro tinh duyen?', action: 'message_crystal', prompt: 'Da thach anh nao ho tro tinh duyen tot nhat?', crystalTags: ['Rose Quartz', 'love', 'relationship'] },
  ],
  courses: [
    { id: 'courses_intro', text: 'Gioi thieu cac khoa hoc cua Gemral', action: 'courses_overview', prompt: 'Gioi thieu cac khoa hoc cua Gemral' },
    { id: 'courses_tier', text: 'So sanh cac TIER khoa hoc trading', action: 'message', prompt: 'So sanh chi tiet cac TIER khoa hoc trading cua Gemral' },
    { id: 'courses_frequency', text: 'Khoa 7 Ngay Khai Mo Tan So Goc', action: 'course_detail', prompt: 'Gioi thieu Khoa 7 Ngay Khai Mo Tan So Goc', courseTags: ['Tan So Goc', 'Khai Mo', '7 Ngay'] },
    { id: 'courses_love', text: 'Khoa Kich Hoat Tan So Tinh Yeu', action: 'course_detail', prompt: 'Gioi thieu Khoa Kich Hoat Tan So Tinh Yeu', courseTags: ['Tinh Yeu', 'Tan So', 'Kich Hoat'] },
    { id: 'courses_millionaire', text: 'Khoa Tu Duy Trieu Phu', action: 'course_detail', prompt: 'Gioi thieu Khoa Tu Duy Trieu Phu - Manifest Tien Bac', courseTags: ['Trieu Phu', 'Manifest'] },
    { id: 'courses_tier2', text: 'Khoa Trading TIER 2 co gi khac TIER 1?', action: 'message', prompt: 'Khoa Trading TIER 2 co gi khac TIER 1? So sanh chi tiet.' },
  ],
  crystals: [
    { id: 'crystals_intro', text: 'Gioi thieu cac loai da thach anh', action: 'message_crystal', prompt: 'Gioi thieu cac loai da thach anh va cong dung', crystalTags: ['crystal'] },
    { id: 'crystals_match', text: 'Da nao phu hop voi toi?', action: 'inline_form', formType: 'crystal_match' },
    { id: 'crystals_charge', text: 'Huong dan sac va kich hoat da', action: 'message', prompt: 'Huong dan cach sac va kich hoat da thach anh dung cach' },
    { id: 'crystals_chakra', text: 'Da chua lanh theo Chakra', action: 'message', prompt: 'Huong dan chon da chua lanh theo tung Chakra' },
    { id: 'crystals_citrine', text: 'Thach Anh Vang - Money Magnet', action: 'message_crystal', prompt: 'Gioi thieu Thach Anh Vang (Citrine) - Money Magnet', crystalTags: ['Citrine'] },
    { id: 'crystals_rose', text: 'Thach Anh Hong - Tinh yeu', action: 'message_crystal', prompt: 'Gioi thieu Thach Anh Hong (Rose Quartz)', crystalTags: ['Rose Quartz'] },
    { id: 'crystals_amethyst', text: 'Thach Anh Tim - Tam linh', action: 'message_crystal', prompt: 'Gioi thieu Thach Anh Tim (Amethyst)', crystalTags: ['Amethyst'] },
  ],
  affiliate: [
    { id: 'affiliate_how', text: 'Lam sao de tro thanh affiliate, KOL/KOC?', action: 'affiliate_info', prompt: 'Huong dan cach tro thanh affiliate, KOL/KOC cua Gemral' },
    { id: 'affiliate_register', text: 'Muon dang ky tro thanh Partner cua Gemral', action: 'navigate_partnership', screen: 'PartnershipRegistration' },
  ],
  spiritual: [
    { id: 'spiritual_potential', text: 'Dieu gi dang ngan can toi song dung tiem nang?', action: 'message', prompt: 'Dieu gi dang ngan can toi song dung tiem nang? Hay dao sau vao goc re van de va dua ra insight giup toi chuyen hoa.', isDeep: true, tag: 'LIFE-CHANGING' },
    { id: 'spiritual_frequency', text: 'Toi dang o muc tan so nao?', action: 'inline_form', formType: 'frequency_analysis' },
    { id: 'spiritual_meditation', text: 'Huong dan thien ket noi Higher Self', action: 'message', prompt: 'Huong dan chi tiet thien ket noi Higher Self' },
    { id: 'spiritual_exercise', text: 'Bai tap nang cao tan so nang luong', action: 'message', prompt: 'Cac bai tap nang cao tan so nang luong hieu qua' },
    { id: 'spiritual_karma', text: 'Day co phai la nghiep tai chinh khong?', action: 'message', prompt: 'Day co phai la nghiep tai chinh khong? Giai thich ve nghiep tai chinh va cach nhan biet.' },
    { id: 'spiritual_philosophy', text: 'Tim hieu ve Hoc Thuyet Chuyen Hoa Noi Tam', action: 'message', prompt: 'Gioi thieu ve Hoc Thuyet Chuyen Hoa Noi Tam cua YinYang Masters' },
    { id: 'spiritual_tired', text: 'Tai sao toi luon cam thay thieu nang luong?', action: 'message', prompt: 'Tai sao toi luon cam thay thieu nang luong? Phan tich nguyen nhan va giai phap.' },
  ],
};

export const getTopicById = (topicId) => {
  return FAQ_TOPICS.find((topic) => topic.id === topicId);
};

export const getQuestionsForTopic = (topicId) => {
  return FAQ_QUESTIONS[topicId] || [];
};

export default { FAQ_TOPICS, FAQ_QUESTIONS, getTopicById, getQuestionsForTopic };
