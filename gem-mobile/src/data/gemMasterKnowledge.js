// src/data/gemMasterKnowledge.js
// GEM Master AI Knowledge Base - 50 Scenarios

// ========== FREQUENCY LEVELS ==========
export const FREQUENCY_LEVELS = {
  shame: { range: [20, 30], name: 'Xấu hổ/Tội lỗi', color: '#4A0404' },
  guilt: { range: [30, 50], name: 'Tội lỗi/Đổ lỗi', color: '#6B0F0F' },
  apathy: { range: [50, 75], name: 'Thờ ơ/Tuyệt vọng', color: '#8B2525' },
  grief: { range: [75, 100], name: 'Đau buồn/Mất mát', color: '#A04040' },
  fear: { range: [100, 125], name: 'Sợ hãi/Lo âu', color: '#B85555' },
  desire: { range: [125, 150], name: 'Khao khát/Mong cầu', color: '#C97070' },
  anger: { range: [150, 175], name: 'Tức giận/Oán hận', color: '#DA8585' },
  pride: { range: [175, 200], name: 'Kiêu ngạo/Tự mãn', color: '#EBA0A0' },
  courage: { range: [200, 250], name: 'Can đảm/Chấp nhận', color: '#10B981' },
  neutrality: { range: [250, 310], name: 'Trung lập/Tin tưởng', color: '#34D399' },
  willingness: { range: [310, 350], name: 'Sẵn sàng/Lạc quan', color: '#6EE7B7' },
  acceptance: { range: [350, 400], name: 'Chấp nhận/Tha thứ', color: '#A7F3D0' },
  reason: { range: [400, 500], name: 'Lý trí/Hiểu biết', color: '#3B82F6' },
  love: { range: [500, 540], name: 'Tình yêu vô điều kiện', color: '#8B5CF6' },
  joy: { range: [540, 600], name: 'Hạnh phúc/Bình an', color: '#A855F7' },
  peace: { range: [600, 700], name: 'An lạc/Giác ngộ', color: '#C084FC' },
  enlightenment: { range: [700, 1000], name: 'Giác ngộ hoàn toàn', color: '#E9D5FF' },
};

// ========== KARMA TYPES ==========
export const KARMA_TYPES = {
  money: {
    name: 'Nghiệp Tiền Bạc',
    icon: '💰',
    description: 'Những block về tài chính, thịnh vượng',
  },
  love: {
    name: 'Nghiệp Tình Duyên',
    icon: '💕',
    description: 'Những block về tình yêu, mối quan hệ',
  },
  health: {
    name: 'Nghiệp Sức Khỏe',
    icon: '🏥',
    description: 'Những block về thể chất, tinh thần',
  },
  career: {
    name: 'Nghiệp Sự Nghiệp',
    icon: '💼',
    description: 'Những block về công việc, thành công',
  },
  family: {
    name: 'Nghiệp Gia Đình',
    icon: '👨‍👩‍👧‍👦',
    description: 'Những block từ gia đình, tổ tiên',
  },
  frequency: {
    name: 'Tần Số Năng Lượng',
    icon: '🔮',
    description: 'Tần số rung động chung của bạn',
  },
};

// ========== QUESTIONNAIRE - MONEY ==========
export const MONEY_QUESTIONS = [
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
      { id: 'c', text: 'Không dám vì sợ tham lam', score: { guilt: 3, shame: 1 } },
      { id: 'd', text: 'Có và thường thành công', score: { willingness: 2, acceptance: 2 } },
      { id: 'e', text: 'Không tin vào manifest', score: { reason: 1, pride: 1 } },
    ],
  },
  {
    id: 'money_q5',
    question: 'Hiện tại bạn đang gặp vấn đề gì về tài chính?',
    options: [
      { id: 'a', text: 'Nợ nần, không trả nổi', score: { fear: 3, grief: 2 } },
      { id: 'b', text: 'Thu nhập thấp, không đủ sống', score: { apathy: 2, desire: 2 } },
      { id: 'c', text: 'Kiếm được nhưng giữ không được', score: { desire: 3, anger: 1 } },
      { id: 'd', text: 'Sợ mất tiền, không dám đầu tư', score: { fear: 3 } },
      { id: 'e', text: 'Có tiền nhưng không hạnh phúc', score: { grief: 2, guilt: 2 } },
      { id: 'f', text: 'Không có vấn đề đặc biệt', score: { neutrality: 2, acceptance: 1 } },
    ],
  },
];

// ========== QUESTIONNAIRE - LOVE ==========
export const LOVE_QUESTIONS = [
  {
    id: 'love_q1',
    question: 'Mô tả mối quan hệ gần nhất của bạn:',
    options: [
      { id: 'a', text: 'Bị phản bội, tổn thương sâu', score: { grief: 3, anger: 2 } },
      { id: 'b', text: 'Yêu đơn phương, không được đáp lại', score: { desire: 3, grief: 1 } },
      { id: 'c', text: 'Độc hại, bị kiểm soát', score: { fear: 3, anger: 2 } },
      { id: 'd', text: 'Bình thường nhưng không hạnh phúc', score: { apathy: 2, neutrality: 1 } },
      { id: 'e', text: 'Tốt đẹp nhưng đã kết thúc', score: { grief: 2, acceptance: 1 } },
      { id: 'f', text: 'Chưa từng có mối quan hệ nghiêm túc', score: { fear: 2, shame: 1 } },
    ],
  },
  {
    id: 'love_q2',
    question: 'Bạn có nhận ra pattern lặp lại trong các mối quan hệ không?',
    options: [
      { id: 'a', text: 'Luôn gặp người không chung thủy', score: { grief: 2, anger: 2 } },
      { id: 'b', text: 'Luôn là người cho đi nhiều hơn', score: { guilt: 2, desire: 2 } },
      { id: 'c', text: 'Luôn bị bỏ rơi hoặc ghosted', score: { fear: 3, shame: 2 } },
      { id: 'd', text: 'Luôn thu hút người không sẵn sàng', score: { desire: 3, grief: 1 } },
      { id: 'e', text: 'Không có pattern rõ ràng', score: { neutrality: 2 } },
      { id: 'f', text: 'Các mối quan hệ đều khá tốt', score: { acceptance: 2, love: 1 } },
    ],
  },
  {
    id: 'love_q3',
    question: 'Khi nghĩ về tình yêu, bạn cảm thấy:',
    options: [
      { id: 'a', text: 'Sợ bị tổn thương lần nữa', score: { fear: 3 } },
      { id: 'b', text: 'Khao khát nhưng không tin sẽ có', score: { desire: 2, apathy: 2 } },
      { id: 'c', text: 'Tức giận vì những trải nghiệm cũ', score: { anger: 3 } },
      { id: 'd', text: 'Hy vọng và sẵn sàng mở lòng', score: { willingness: 2, courage: 2 } },
      { id: 'e', text: 'Bình thường, không mong chờ gì', score: { neutrality: 2, apathy: 1 } },
    ],
  },
  {
    id: 'love_q4',
    question: 'Mối quan hệ của bố mẹ bạn như thế nào?',
    options: [
      { id: 'a', text: 'Hay cãi nhau, bạo lực', score: { fear: 3, anger: 2 } },
      { id: 'b', text: 'Lạnh nhạt, ít giao tiếp', score: { apathy: 3, grief: 1 } },
      { id: 'c', text: 'Ly hôn/ly thân', score: { grief: 2, fear: 2 } },
      { id: 'd', text: 'Có lúc tốt lúc xấu', score: { neutrality: 2, desire: 1 } },
      { id: 'e', text: 'Hạnh phúc, yêu thương', score: { love: 2, acceptance: 2 } },
    ],
  },
  {
    id: 'love_q5',
    question: 'Bạn cảm thấy thế nào về bản thân trong tình yêu?',
    options: [
      { id: 'a', text: 'Không xứng đáng được yêu', score: { shame: 3, guilt: 2 } },
      { id: 'b', text: 'Sợ bị bỏ rơi', score: { fear: 3 } },
      { id: 'c', text: 'Cần người khác để hoàn thiện', score: { desire: 2, apathy: 1 } },
      { id: 'd', text: 'Độc lập nhưng muốn có bạn đồng hành', score: { courage: 2, willingness: 1 } },
      { id: 'e', text: 'Yêu bản thân và sẵn sàng cho đi', score: { love: 2, acceptance: 2 } },
    ],
  },
];

// ========== QUESTIONNAIRE - HEALTH ==========
export const HEALTH_QUESTIONS = [
  {
    id: 'health_q1',
    question: 'Bạn cảm nhận về cơ thể mình như thế nào?',
    options: [
      { id: 'a', text: 'Ghét cơ thể mình', score: { shame: 3, anger: 1 } },
      { id: 'b', text: 'Không quan tâm lắm đến cơ thể', score: { apathy: 3 } },
      { id: 'c', text: 'Lo lắng về sức khỏe', score: { fear: 3 } },
      { id: 'd', text: 'Bình thường, chấp nhận được', score: { neutrality: 2, acceptance: 1 } },
      { id: 'e', text: 'Yêu thương và chăm sóc cơ thể', score: { love: 2, acceptance: 2 } },
    ],
  },
  {
    id: 'health_q2',
    question: 'Mức độ stress hiện tại của bạn:',
    options: [
      { id: 'a', text: 'Stress cực độ, kiệt sức', score: { grief: 3, fear: 2 } },
      { id: 'b', text: 'Stress cao, khó thư giãn', score: { fear: 2, anger: 2 } },
      { id: 'c', text: 'Stress trung bình', score: { desire: 2, fear: 1 } },
      { id: 'd', text: 'Ít stress, khá thoải mái', score: { neutrality: 2, acceptance: 1 } },
      { id: 'e', text: 'Không stress, bình an', score: { peace: 2, joy: 1 } },
    ],
  },
  {
    id: 'health_q3',
    question: 'Giấc ngủ và năng lượng của bạn:',
    options: [
      { id: 'a', text: 'Mất ngủ, kiệt sức hoàn toàn', score: { grief: 3, apathy: 2 } },
      { id: 'b', text: 'Ngủ không sâu, mệt mỏi', score: { fear: 2, grief: 1 } },
      { id: 'c', text: 'Tạm ổn nhưng không đủ', score: { desire: 2 } },
      { id: 'd', text: 'Khá tốt, đủ năng lượng', score: { neutrality: 2, courage: 1 } },
      { id: 'e', text: 'Rất tốt, tràn đầy năng lượng', score: { joy: 2, willingness: 2 } },
    ],
  },
  {
    id: 'health_q4',
    question: 'Bạn có bệnh mãn tính hoặc đau đớn kéo dài không?',
    options: [
      { id: 'a', text: 'Có, và rất khổ sở vì nó', score: { grief: 3, anger: 2 } },
      { id: 'b', text: 'Có, nhưng đang học cách sống chung', score: { acceptance: 2, grief: 1 } },
      { id: 'c', text: 'Thỉnh thoảng có triệu chứng', score: { fear: 2 } },
      { id: 'd', text: 'Không có vấn đề sức khỏe lớn', score: { neutrality: 2, acceptance: 1 } },
    ],
  },
  {
    id: 'health_q5',
    question: 'Bạn đối xử với cơ thể như thế nào?',
    options: [
      { id: 'a', text: 'Phớt lờ tín hiệu cơ thể, làm việc quá sức', score: { anger: 2, pride: 2 } },
      { id: 'b', text: 'Ăn uống thiếu lành mạnh, ít vận động', score: { apathy: 2, desire: 1 } },
      { id: 'c', text: 'Cố gắng nhưng không nhất quán', score: { desire: 2, guilt: 1 } },
      { id: 'd', text: 'Chăm sóc khá tốt', score: { willingness: 2, courage: 1 } },
      { id: 'e', text: 'Chăm sóc như đền thờ linh thiêng', score: { love: 2, acceptance: 2 } },
    ],
  },
];

// ========== QUESTIONNAIRE - CAREER ==========
export const CAREER_QUESTIONS = [
  {
    id: 'career_q1',
    question: 'Bạn cảm thấy thế nào về công việc hiện tại?',
    options: [
      { id: 'a', text: 'Ghét công việc, muốn nghỉ ngay', score: { anger: 3, grief: 1 } },
      { id: 'b', text: 'Kiệt sức, không còn động lực', score: { apathy: 3, grief: 2 } },
      { id: 'c', text: 'Lo lắng về tương lai sự nghiệp', score: { fear: 3 } },
      { id: 'd', text: 'Tạm ổn, không yêu không ghét', score: { neutrality: 2, apathy: 1 } },
      { id: 'e', text: 'Đam mê và có động lực', score: { joy: 2, willingness: 2 } },
    ],
  },
  {
    id: 'career_q2',
    question: 'Khi nghĩ về thành công, bạn cảm thấy:',
    options: [
      { id: 'a', text: 'Không tin mình có thể thành công', score: { shame: 3, fear: 1 } },
      { id: 'b', text: 'Sợ mình không xứng đáng (imposter)', score: { shame: 2, fear: 2 } },
      { id: 'c', text: 'Muốn nhưng sợ thất bại', score: { desire: 2, fear: 2 } },
      { id: 'd', text: 'Tự tin có thể đạt được', score: { courage: 2, willingness: 2 } },
      { id: 'e', text: 'Đang trên đường thành công', score: { acceptance: 2, joy: 1 } },
    ],
  },
  {
    id: 'career_q3',
    question: 'Mức độ hài lòng với thu nhập:',
    options: [
      { id: 'a', text: 'Thu nhập quá thấp, bất công', score: { anger: 2, grief: 2 } },
      { id: 'b', text: 'Đủ sống nhưng không phát triển', score: { apathy: 2, desire: 1 } },
      { id: 'c', text: 'Muốn nhiều hơn nhưng không dám đòi', score: { fear: 2, shame: 1 } },
      { id: 'd', text: 'Khá hài lòng với mức hiện tại', score: { neutrality: 2, acceptance: 1 } },
      { id: 'e', text: 'Thu nhập phản ánh đúng giá trị', score: { acceptance: 2, joy: 1 } },
    ],
  },
  {
    id: 'career_q4',
    question: 'Bạn có đang làm đúng đam mê/purpose không?',
    options: [
      { id: 'a', text: 'Không biết đam mê của mình là gì', score: { apathy: 3, grief: 1 } },
      { id: 'b', text: 'Biết nhưng không dám theo đuổi', score: { fear: 3, desire: 1 } },
      { id: 'c', text: 'Đang cố gắng tìm kiếm', score: { desire: 2, courage: 1 } },
      { id: 'd', text: 'Gần đúng với đam mê', score: { willingness: 2, acceptance: 1 } },
      { id: 'e', text: 'Đang sống đúng purpose', score: { joy: 2, love: 1 } },
    ],
  },
  {
    id: 'career_q5',
    question: 'Mối quan hệ với đồng nghiệp/sếp:',
    options: [
      { id: 'a', text: 'Độc hại, bị bắt nạt hoặc kỳ thị', score: { fear: 3, anger: 2 } },
      { id: 'b', text: 'Căng thẳng, nhiều xung đột', score: { anger: 2, grief: 1 } },
      { id: 'c', text: 'Bình thường, không thân không ghét', score: { neutrality: 2, apathy: 1 } },
      { id: 'd', text: 'Khá tốt, hỗ trợ nhau', score: { acceptance: 2, willingness: 1 } },
      { id: 'e', text: 'Rất tốt, như gia đình', score: { love: 2, joy: 1 } },
    ],
  },
];

// ========== QUESTIONNAIRE - FAMILY ==========
export const FAMILY_QUESTIONS = [
  {
    id: 'family_q1',
    question: 'Mối quan hệ với cha mẹ hiện tại:',
    options: [
      { id: 'a', text: 'Đã cắt đứt liên lạc', score: { anger: 3, grief: 2 } },
      { id: 'b', text: 'Căng thẳng, nhiều mâu thuẫn', score: { anger: 2, fear: 2 } },
      { id: 'c', text: 'Xa cách, ít giao tiếp', score: { apathy: 2, grief: 2 } },
      { id: 'd', text: 'Bình thường, tạm ổn', score: { neutrality: 2, acceptance: 1 } },
      { id: 'e', text: 'Gần gũi, yêu thương', score: { love: 2, acceptance: 2 } },
    ],
  },
  {
    id: 'family_q2',
    question: 'Bạn có mang vác trách nhiệm gia đình quá mức không?',
    options: [
      { id: 'a', text: 'Có, cảm thấy như gánh nặng không lối thoát', score: { grief: 3, guilt: 2 } },
      { id: 'b', text: 'Có, nhưng cố gắng chịu đựng', score: { guilt: 2, shame: 1 } },
      { id: 'c', text: 'Đôi khi bị áp lực', score: { fear: 2, guilt: 1 } },
      { id: 'd', text: 'Cân bằng được', score: { neutrality: 2, courage: 1 } },
      { id: 'e', text: 'Không có vấn đề', score: { acceptance: 2 } },
    ],
  },
  {
    id: 'family_q3',
    question: 'Bạn cảm thấy thế nào về vị trí trong gia đình?',
    options: [
      { id: 'a', text: 'Là con cừu đen, bị cô lập', score: { shame: 3, anger: 2 } },
      { id: 'b', text: 'Luôn bị so sánh, không đủ tốt', score: { shame: 2, grief: 2 } },
      { id: 'c', text: 'Phải gánh vác cho mọi người', score: { guilt: 3, pride: 1 } },
      { id: 'd', text: 'Được chấp nhận nhưng không hiểu', score: { neutrality: 2, apathy: 1 } },
      { id: 'e', text: 'Được yêu thương và chấp nhận', score: { love: 2, acceptance: 2 } },
    ],
  },
  {
    id: 'family_q4',
    question: 'Gia đình bạn có trauma hoặc pattern tiêu cực qua nhiều thế hệ không?',
    options: [
      { id: 'a', text: 'Có, rất nặng nề (nghiện, bạo lực...)', score: { grief: 3, fear: 2 } },
      { id: 'b', text: 'Có một số vấn đề lặp lại', score: { guilt: 2, grief: 1 } },
      { id: 'c', text: 'Không rõ ràng lắm', score: { apathy: 2 } },
      { id: 'd', text: 'Ít hoặc không có', score: { neutrality: 2, acceptance: 1 } },
    ],
  },
  {
    id: 'family_q5',
    question: 'Bạn có cảm thấy tự do sống theo cách của mình không?',
    options: [
      { id: 'a', text: 'Không, bị kiểm soát hoàn toàn', score: { fear: 3, anger: 2 } },
      { id: 'b', text: 'Phải giấu con người thật', score: { shame: 3, fear: 1 } },
      { id: 'c', text: 'Cố gắng cân bằng giữa gia đình và bản thân', score: { guilt: 2, desire: 1 } },
      { id: 'd', text: 'Khá tự do nhưng vẫn quan tâm ý kiến', score: { neutrality: 2, willingness: 1 } },
      { id: 'e', text: 'Hoàn toàn tự do và được ủng hộ', score: { acceptance: 2, love: 1 } },
    ],
  },
];

// ========== 50 SCENARIOS ==========
export const SCENARIOS = {
  // ===== MONEY SCENARIOS =====
  money_shame_deep: {
    id: 'money_shame_deep',
    type: 'money',
    frequency: { min: 20, max: 50 },
    frequencyName: 'Xấu hổ/Tội lỗi sâu',
    triggers: ['guilt', 'shame'],
    minScore: 8,
    title: 'Nghiệp Tiền: Tội Lỗi Về Sự Giàu Có',
    description: 'Bạn mang trong mình niềm tin sâu xa rằng giàu có là xấu xa, có tiền là tội lỗi.',
    rootCause: 'Thường xuất phát từ giáo dục gia đình hoặc tôn giáo cho rằng tiền là nguồn gốc của tội lỗi.',
    healing: [
      'Viết danh sách 10 điều tốt đẹp tiền có thể mang lại',
      'Tha thứ cho bản thân vì đã phán xét người giàu',
    ],
    affirmations: [
      'Tiền là công cụ trung lập, tôi dùng nó cho điều tốt đẹp',
      'Tôi xứng đáng có sự thịnh vượng và dồi dào',
      'Giàu có giúp tôi giúp đỡ nhiều người hơn',
    ],
    actionSteps: [
      'Viết 10 điều tốt đẹp tiền có thể mang lại cho cuộc sống',
      'Liệt kê 5 người giàu có mà bạn ngưỡng mộ và tìm hiểu câu chuyện của họ',
      'Donate một khoản nhỏ cho từ thiện để cảm nhận niềm vui khi cho đi',
      'Viết thư tha thứ cho bản thân về những suy nghĩ tiêu cực về tiền',
    ],
    rituals: [
      'Sáng: Đọc 3 affirmation tiền bạc trước gương 5 phút',
      'Tối: Viết gratitude journal về 3 điều liên quan đến tiền bạn biết ơn',
      'Tuần: Tẩy tịnh ví/thẻ ATM bằng nước muối và đặt ý định mới',
    ],
    crystal: 'Thạch Anh Vàng',
    course: 'course_money',
  },

  money_fear_scarcity: {
    id: 'money_fear_scarcity',
    type: 'money',
    frequency: { min: 100, max: 125 },
    frequencyName: 'Sợ hãi thiếu thốn',
    triggers: ['fear'],
    minScore: 6,
    title: 'Nghiệp Tiền: Sợ Hãi Thiếu Thốn',
    description: 'Bạn sống trong nỗi sợ thường trực về việc không đủ tiền, dù thực tế có thể không như vậy.',
    rootCause: 'Có thể do trải nghiệm nghèo khó thời thơ ấu hoặc chứng kiến gia đình khó khăn tài chính.',
    healing: [
      'Ghi chép gratitude về những gì bạn ĐANG có',
      'Tập cho đi dù là số nhỏ để phá vỡ tư duy khan hiếm',
    ],
    affirmations: [
      'Vũ trụ luôn cung cấp đủ cho tôi',
      'Tôi có đủ và hơn thế nữa',
      'Sự dồi dào là quyền tự nhiên của tôi',
    ],
    actionSteps: [
      'Viết gratitude journal về 5 điều bạn ĐANG có mỗi tối',
      'Cho đi 10% thu nhập để phá vỡ tư duy khan hiếm',
      'Tính toán chi tiết tài chính để thấy thực tế không đáng sợ như tưởng tượng',
      'Ngừng check tài khoản ngân hàng liên tục - đặt lịch 1 lần/tuần',
    ],
    rituals: [
      'Sáng: Thiền 5 phút hình dung mình đang sống trong dồi dào',
      'Tối: Viết 3 điều biết ơn về tiền bạc hôm nay',
      'Tuần: Donate một khoản nhỏ và cảm nhận niềm vui khi cho đi',
    ],
    crystal: 'Thạch Anh Vàng',
    course: 'course_money',
  },

  money_desire_chasing: {
    id: 'money_desire_chasing',
    type: 'money',
    frequency: { min: 125, max: 150 },
    frequencyName: 'Khao khát/Mong cầu',
    triggers: ['desire'],
    minScore: 6,
    title: 'Nghiệp Tiền: Chạy Theo Tiền Mà Không Bắt Được',
    description: 'Bạn luôn muốn có nhiều tiền hơn, manifest liên tục nhưng tiền như chạy trốn khỏi bạn.',
    rootCause: 'Năng lượng của bạn ở trạng thái "muốn" chứ không phải "có", nên vũ trụ phản chiếu lại sự "muốn" đó.',
    healing: [
      'Thực hành cảm giác "đã có" thay vì "muốn có"',
      'Ngừng kiểm tra tài khoản liên tục',
    ],
    affirmations: [
      'Tôi ĐÃ giàu có trong tâm thức',
      'Tiền tự động chảy về phía tôi một cách nhẹ nhàng',
      'Tôi cảm nhận sự dồi dào ngay bây giờ, không cần chờ đợi',
    ],
    actionSteps: [
      'Viết journal như thể bạn ĐÃ đạt được mục tiêu tài chính',
      'Chỉ check tài khoản 1 lần/tuần vào ngày cố định',
      'Thực hành "acting as if" - sống như đã giàu (mindset, không phải chi tiêu)',
      'Tạo vision board về cuộc sống thịnh vượng ĐÃ có',
    ],
    rituals: [
      'Sáng: Thiền 5 phút với cảm giác "đã có" - feel abundance NOW',
      'Tối: Cảm ơn cho những gì đã có như thể đó là tất cả bạn cần',
      'Tuần: Tặng quà/donate để phá vỡ năng lượng "muốn" và "thiếu"',
    ],
    crystal: 'Thạch Anh Vàng',
    course: 'course_money',
  },

  money_anger_resentment: {
    id: 'money_anger_resentment',
    type: 'money',
    frequency: { min: 150, max: 175 },
    frequencyName: 'Tức giận/Oán hận',
    triggers: ['anger'],
    minScore: 5,
    title: 'Nghiệp Tiền: Oán Hận Người Giàu',
    description: 'Bạn có sự tức giận ngầm với người giàu, cho rằng họ xấu xa hoặc lừa đảo.',
    rootCause: 'Có thể do từng bị người có tiền đối xử tệ, hoặc gia đình dạy rằng người giàu không đáng tin.',
    healing: [
      'Liệt kê 5 người giàu mà bạn ngưỡng mộ',
      'Tha thứ cho người đã làm tổn thương bạn vì tiền',
    ],
    affirmations: [
      'Sự giàu có của người khác không lấy đi của tôi',
      'Có đủ thịnh vượng cho tất cả mọi người',
      'Tôi chúc phúc cho sự thành công của người khác và thu hút sự thành công cho mình',
    ],
    actionSteps: [
      'Liệt kê 5 người giàu mà bạn ngưỡng mộ - tìm hiểu câu chuyện của họ',
      'Viết thư tha thứ (không gửi) cho người đã làm tổn thương bạn vì tiền',
      'Mỗi lần thấy người thành công, nói "Chúc mừng bạn" trong tâm',
      'Thay thế phán xét bằng tò mò: "Họ làm thế nào để thành công?"',
    ],
    rituals: [
      'Sáng: Blessing meditation - gửi năng lượng tốt đẹp cho 3 người giàu',
      'Tối: Viết 3 điều bạn học được từ người thành công hôm nay',
      'Tuần: Đọc sách/podcast về người giàu có tấm lòng thiện',
    ],
    crystal: 'Thạch Anh Vàng',
    course: 'course_money',
  },

  money_apathy_hopeless: {
    id: 'money_apathy_hopeless',
    type: 'money',
    frequency: { min: 50, max: 75 },
    frequencyName: 'Thờ ơ/Tuyệt vọng',
    triggers: ['apathy'],
    minScore: 5,
    title: 'Nghiệp Tiền: Tuyệt Vọng Về Tài Chính',
    description: 'Bạn đã từ bỏ hy vọng về việc cải thiện tài chính, cho rằng số phận đã định.',
    rootCause: 'Có thể do thất bại liên tiếp, nợ nần chồng chất, hoặc chấn thương tài chính lớn.',
    healing: [
      'Bắt đầu từ bước nhỏ nhất - tiết kiệm 10k/ngày',
      'Tìm 1 tấm gương vượt khó về tài chính',
    ],
    affirmations: [
      'Mỗi ngày tôi đang tiến gần hơn đến tự do tài chính',
      'Tôi có khả năng thay đổi tình hình tài chính của mình',
      'Mỗi bước nhỏ đều đưa tôi đến thành công lớn',
    ],
    actionSteps: [
      'Tiết kiệm 10,000đ mỗi ngày vào một chỗ riêng',
      'Tìm và đọc câu chuyện của 3 người đã vượt khó tài chính',
      'Viết ra 1 mục tiêu tài chính nhỏ và khả thi trong 30 ngày',
      'Unfollow các trang gây cảm giác tiêu cực về tiền',
    ],
    rituals: [
      'Sáng: Đọc 1 affirmation về tiền bạc 5 lần trước gương',
      'Tối: Viết 1 điều biết ơn về tiền bạc dù nhỏ nhất',
      'Tuần: Đánh giá tiến bộ và celebrate 1 thành tựu nhỏ',
    ],
    crystal: 'Cây Tài Lộc',
    course: 'course_money',
  },

  money_grief_loss: {
    id: 'money_grief_loss',
    type: 'money',
    frequency: { min: 75, max: 100 },
    frequencyName: 'Đau buồn/Mất mát',
    triggers: ['grief'],
    minScore: 5,
    title: 'Nghiệp Tiền: Đau Buồn Vì Mất Mát',
    description: 'Bạn đã từng mất một số tiền lớn hoặc cơ hội quan trọng, và vẫn chưa vượt qua.',
    rootCause: 'Chấn thương từ phá sản, lừa đảo, mất việc, hoặc đầu tư thất bại.',
    healing: [
      'Viết thư tha thứ cho bản thân về quyết định tài chính cũ',
      'Nhìn nhận bài học thay vì mất mát',
    ],
    affirmations: [
      'Mỗi mất mát dạy tôi cách giữ gìn tốt hơn',
      'Tôi tha thứ cho bản thân và những người liên quan',
      'Tôi đủ khả năng tạo lại sự thịnh vượng',
    ],
    actionSteps: [
      'Viết thư tha thứ cho bản thân về quyết định cũ (không gửi)',
      'Liệt kê 5 bài học quý giá từ trải nghiệm mất mát',
      'Tạo kế hoạch tài chính mới với các bài học đã rút ra',
      'Tìm 1 mentor hoặc coach về tài chính',
    ],
    rituals: [
      'Sáng: Thiền tha thứ 5 phút - gửi yêu thương cho bản thân',
      'Tối: Viết 3 điều biết ơn từ những gì bạn VẪN CÒN',
      'Tuần: Đốt thư tha thứ như nghi thức buông bỏ quá khứ',
    ],
    crystal: 'Thạch Anh Hồng',
    course: 'course_money',
  },

  money_pride_block: {
    id: 'money_pride_block',
    type: 'money',
    frequency: { min: 175, max: 200 },
    frequencyName: 'Kiêu ngạo/Tự mãn',
    triggers: ['pride'],
    minScore: 4,
    title: 'Nghiệp Tiền: Kiêu Ngạo Chặn Dòng Tiền',
    description: 'Bạn quá tự hào để nhận giúp đỡ hoặc thừa nhận mình cần tiền.',
    rootCause: 'Có thể do định nghĩa tự trọng = không nhờ vả, hoặc sợ bị đánh giá.',
    healing: [
      'Tập nhận quà/giúp đỡ từ người khác với lòng biết ơn',
      'Phân biệt tự trọng và kiêu ngạo',
      'Khẳng định: "Nhận là một phần của cho đi"',
    ],
    crystal: 'Thạch Anh Tím',
    course: 'course_money',
  },

  money_balanced: {
    id: 'money_balanced',
    type: 'money',
    frequency: { min: 200, max: 400 },
    frequencyName: 'Cân bằng/Chấp nhận',
    triggers: ['neutrality', 'acceptance', 'willingness', 'courage', 'reason'],
    minScore: 4,
    title: 'Tần Số Tiền Bạc Khá Tốt',
    description: 'Bạn có mối quan hệ khá lành mạnh với tiền bạc. Có thể có một số block nhỏ cần điều chỉnh.',
    rootCause: 'Bạn đã có nền tảng tư duy tài chính tích cực.',
    healing: [
      'Tiếp tục duy trì thái độ tích cực',
      'Chia sẻ kiến thức tài chính với người khác',
      'Nâng cấp lên tư duy thịnh vượng 500Hz+',
    ],
    crystal: 'Thạch Anh Trắng',
    course: 'course_frequency',
  },

  money_abundant: {
    id: 'money_abundant',
    type: 'money',
    frequency: { min: 500, max: 700 },
    frequencyName: 'Tình yêu/Thịnh vượng',
    triggers: ['love', 'joy', 'peace'],
    minScore: 3,
    title: 'Tần Số Thịnh Vượng Cao',
    description: 'Bạn có tần số thịnh vượng rất tốt! Tiền đến với bạn dễ dàng.',
    rootCause: 'Bạn đã chuyển hóa phần lớn các block về tiền bạc.',
    healing: [
      'Tiếp tục cho đi và đón nhận',
      'Giúp đỡ người khác nâng tần số',
      'Sống trong gratitude mỗi ngày',
    ],
    crystal: 'Special Set',
    course: null,
  },

  money_debt_cycle: {
    id: 'money_debt_cycle',
    type: 'money',
    frequency: { min: 75, max: 100 },
    frequencyName: 'Vòng xoáy nợ nần',
    triggers: ['fear', 'grief', 'apathy'],
    minScore: 7,
    title: 'Nghiệp Tiền: Vòng Xoáy Nợ Nần',
    description: 'Bạn cứ trả hết nợ này lại vướng nợ khác, như một vòng lặp không lối thoát.',
    rootCause: 'Có thể có niềm tin vô thức rằng bạn "phải" gánh nợ, hoặc spending habit chưa lành mạnh.',
    healing: [
      'Viết ra TẤT CẢ các khoản nợ - đối mặt thay vì trốn tránh',
      'Tạo kế hoạch trả nợ cụ thể (snowball hoặc avalanche method)',
    ],
    affirmations: [
      'Mỗi ngày tôi đang tiến gần hơn đến tự do tài chính',
      'Tôi đủ sức phá vỡ vòng xoáy nợ nần',
      'Tôi xứng đáng sống không nợ nần',
    ],
    actionSteps: [
      'Liệt kê TẤT CẢ khoản nợ với số tiền cụ thể',
      'Chọn snowball (trả nợ nhỏ trước) hoặc avalanche (trả lãi cao trước)',
      'Cắt thẻ tín dụng hoặc đóng băng chúng trong thời gian trả nợ',
      'Tìm thêm 1 nguồn thu nhập phụ để tăng tốc trả nợ',
    ],
    rituals: [
      'Sáng: Đọc kế hoạch trả nợ và visualize mình debt-free',
      'Tối: Đánh dấu số tiền đã trả hôm nay (dù nhỏ)',
      'Tuần: Celebrate mỗi khi trả xong 1 khoản nợ',
    ],
    crystal: 'Hematite',
    course: 'course_money',
  },

  money_cant_hold: {
    id: 'money_cant_hold',
    type: 'money',
    frequency: { min: 125, max: 150 },
    frequencyName: 'Tiền đến rồi đi',
    triggers: ['desire', 'fear'],
    minScore: 6,
    title: 'Nghiệp Tiền: Kiếm Được Nhưng Giữ Không Được',
    description: 'Tiền vào tay bạn nhưng nhanh chóng biến mất qua các khoản chi không kiểm soát.',
    rootCause: 'Có thể do thiếu kỹ năng quản lý tài chính hoặc chi tiêu để lấp đầy trống vắng cảm xúc.',
    healing: [
      'Theo dõi CHI TIẾT mọi khoản chi trong 30 ngày',
      'Phân biệt "muốn" và "cần" trước mỗi lần chi',
      'Khẳng định: "Tôi là người quản lý tài chính khôn ngoan"',
    ],
    crystal: 'Aquamarine',
    course: 'course_money',
  },

  money_underearning: {
    id: 'money_underearning',
    type: 'money',
    frequency: { min: 100, max: 125 },
    frequencyName: 'Tự hạ giá trị',
    triggers: ['shame', 'fear'],
    minScore: 5,
    title: 'Nghiệp Tiền: Tự Hạ Giá Trị Bản Thân',
    description: 'Bạn luôn nhận mức lương thấp hơn giá trị thực hoặc sợ đòi tăng lương.',
    rootCause: 'Niềm tin rằng mình không xứng đáng nhận nhiều hơn, thường từ childhood programming.',
    healing: [
      'Liệt kê 20 thành tựu và kỹ năng của bạn',
      'Tập nói "Không" với công việc không xứng đáng',
      'Khẳng định: "Tôi xứng đáng được trả công xứng đáng"',
    ],
    crystal: 'Thạch Anh Tím',
    course: 'course_money',
  },

  money_fear_success: {
    id: 'money_fear_success',
    type: 'money',
    frequency: { min: 100, max: 150 },
    frequencyName: 'Sợ thành công',
    triggers: ['fear', 'guilt'],
    minScore: 6,
    title: 'Nghiệp Tiền: Sợ Hãi Thành Công',
    description: 'Bạn tự sabotage khi gần đạt mục tiêu tài chính vì sợ sự thay đổi.',
    rootCause: 'Có thể sợ mất bạn bè, bị ghen tị, hoặc trách nhiệm đi kèm với thành công.',
    healing: [
      'Viết ra 10 điều TỐT sẽ xảy ra khi bạn giàu',
      'Hình dung cuộc sống giàu có MỖI NGÀY',
      'Khẳng định: "Tôi an toàn và được yêu thương khi thành công"',
    ],
    crystal: 'Thạch Anh Vàng',
    course: 'course_money',
  },

  money_inheritance_block: {
    id: 'money_inheritance_block',
    type: 'money',
    frequency: { min: 50, max: 100 },
    frequencyName: 'Nghiệp từ tổ tiên',
    triggers: ['grief', 'guilt', 'shame'],
    minScore: 7,
    title: 'Nghiệp Tiền: Block Từ Dòng Họ',
    description: 'Gia đình bạn có lịch sử nghèo khó qua nhiều thế hệ.',
    rootCause: 'Niềm tin về tiền được truyền từ đời này qua đời khác như một "lời nguyền".',
    healing: [
      'Nghiên cứu lịch sử tài chính gia đình',
      'Viết thư tha thứ cho tổ tiên và giải phóng họ',
      'Khẳng định: "Tôi là người phá vỡ vòng lặp nghèo khó của dòng họ"',
    ],
    crystal: 'Hematite',
    course: 'course_money',
  },

  money_spiritual_conflict: {
    id: 'money_spiritual_conflict',
    type: 'money',
    frequency: { min: 50, max: 75 },
    frequencyName: 'Xung đột tâm thức-vật chất',
    triggers: ['guilt', 'shame', 'pride'],
    minScore: 6,
    title: 'Nghiệp Tiền: Xung Đột Tu Hành vs Giàu Có',
    description: 'Bạn tin rằng người tu hành hoặc tâm thức không nên giàu.',
    rootCause: 'Hiểu sai về spirituality, cho rằng từ bỏ vật chất = giác ngộ.',
    healing: [
      'Tìm hiểu về các spiritual teachers GIÀU CÓ',
      'Nhận ra: tiền là công cụ để làm việc thiện',
      'Khẳng định: "Tôi càng giàu, tôi càng giúp được nhiều người"',
    ],
    crystal: 'Thạch Anh Trắng',
    course: 'course_frequency',
  },

  money_jealousy_block: {
    id: 'money_jealousy_block',
    type: 'money',
    frequency: { min: 125, max: 175 },
    frequencyName: 'Ghen tị chặn dòng tiền',
    triggers: ['anger', 'desire'],
    minScore: 5,
    title: 'Nghiệp Tiền: Ghen Tị Với Người Giàu',
    description: 'Bạn cảm thấy ghen tị hoặc bực bội khi thấy người khác thành công.',
    rootCause: 'Tư duy khan hiếm - cho rằng thành công của người khác lấy đi cơ hội của mình.',
    healing: [
      'Mỗi khi ghen tị -> Chúc mừng người đó trong tâm',
      'Nhận ra: thành công của họ CHỨNG MINH điều đó có thể với bạn',
      'Khẳng định: "Sự thịnh vượng của người khác mở đường cho tôi"',
    ],
    crystal: 'Thạch Anh Vàng',
    course: 'course_money',
  },

  money_self_sabotage: {
    id: 'money_self_sabotage',
    type: 'money',
    frequency: { min: 100, max: 150 },
    frequencyName: 'Tự phá hoại',
    triggers: ['fear', 'shame', 'guilt'],
    minScore: 7,
    title: 'Nghiệp Tiền: Tự Phá Hoại Cơ Hội',
    description: 'Bạn có pattern phá hỏng cơ hội kiếm tiền ngay khi chúng xuất hiện.',
    rootCause: 'Inner saboteur hoạt động vì sợ thay đổi hoặc không tin mình xứng đáng.',
    healing: [
      'Nhận diện inner saboteur - đặt tên cho nó',
      'Đối thoại với nó: "Cảm ơn đã bảo vệ mình, giờ mình an toàn rồi"',
      'Khẳng định: "Tôi chào đón và nắm bắt mọi cơ hội tốt đẹp"',
    ],
    crystal: 'Thạch Anh Khói',
    course: 'course_money',
  },

  // ===== LOVE SCENARIOS =====
  love_shame_unworthy: {
    id: 'love_shame_unworthy',
    type: 'love',
    frequency: { min: 20, max: 50 },
    frequencyName: 'Xấu hổ/Không xứng đáng',
    triggers: ['shame', 'guilt'],
    minScore: 8,
    title: 'Nghiệp Tình: Không Xứng Đáng Được Yêu',
    description: 'Sâu thẳm bạn tin rằng mình không xứng đáng có tình yêu đích thực.',
    rootCause: 'Có thể do bị bỏ rơi thời thơ ấu, bị so sánh, hoặc từng bị từ chối đau đớn.',
    healing: [
      'Viết 20 điều bạn yêu về bản thân',
      'Thực hành self-love mỗi ngày',
    ],
    affirmations: [
      'Tôi xứng đáng có tình yêu đích thực',
      'Tôi đáng được yêu thương vô điều kiện',
      'Tôi là món quà quý giá cho người đúng',
    ],
    actionSteps: [
      'Viết 20 điều bạn yêu về bản thân - đọc mỗi sáng',
      'Mỗi ngày làm 1 việc tử tế cho bản thân',
      'Viết thư gửi inner child - nói rằng bạn xứng đáng được yêu',
      'Liệt kê 5 người yêu thương bạn và cách họ thể hiện',
    ],
    rituals: [
      'Sáng: Mirror work - nhìn vào mắt mình và nói "Tôi yêu bạn, bạn xứng đáng"',
      'Tối: Tự ôm mình và nói lời yêu thương với bản thân',
      'Tuần: Tắm thảo mộc hoặc spa tại nhà để nuôi dưỡng bản thân',
    ],
    crystal: 'Thạch Anh Hồng',
    course: 'course_love',
  },

  love_fear_abandonment: {
    id: 'love_fear_abandonment',
    type: 'love',
    frequency: { min: 100, max: 125 },
    frequencyName: 'Sợ bị bỏ rơi',
    triggers: ['fear'],
    minScore: 6,
    title: 'Nghiệp Tình: Sợ Hãi Bị Bỏ Rơi',
    description: 'Bạn sống trong nỗi sợ thường trực rằng người yêu sẽ rời bỏ bạn.',
    rootCause: 'Có thể do trải nghiệm bị bỏ rơi từ nhỏ hoặc trong các mối quan hệ trước.',
    healing: [
      'Chữa lành inner child bị bỏ rơi',
      'Xây dựng sự an toàn từ bên trong',
    ],
    affirmations: [
      'Tôi an toàn trong tình yêu',
      'Người đúng sẽ ở lại với tôi',
      'Tôi là đủ, dù có hay không có ai bên cạnh',
    ],
    actionSteps: [
      'Viết thư gửi inner child về trải nghiệm bị bỏ rơi',
      'Xây dựng hệ thống support ngoài mối quan hệ',
      'Luyện tập "Tôi ổn khi ở một mình" - time alone có chủ đích',
      'Nói với đối tác về nỗi sợ của bạn một cách chân thành',
    ],
    rituals: [
      'Sáng: Self-soothing meditation - ôm gối và tự trấn an',
      'Tối: Journaling về "Điều tốt đẹp nào đã xảy ra hôm nay?"',
      'Tuần: Hẹn hò với bản thân - đi xem phim/cafe một mình',
    ],
    crystal: 'Thạch Anh Hồng',
    course: 'course_love',
  },

  love_desire_unavailable: {
    id: 'love_desire_unavailable',
    type: 'love',
    frequency: { min: 125, max: 150 },
    frequencyName: 'Khao khát người không sẵn sàng',
    triggers: ['desire'],
    minScore: 6,
    title: 'Nghiệp Tình: Luôn Yêu Người Không Sẵn Sàng',
    description: 'Bạn có khuôn mẫu thu hút những người đã có gia đình, không muốn cam kết, hoặc xa cách cảm xúc.',
    rootCause: 'Có thể vô thức bạn cũng không sẵn sàng cho tình yêu thật sự.',
    healing: [
      'Hỏi bản thân: "Mình có thực sự sẵn sàng cho cam kết?"',
      'Liệt kê những gì bạn thực sự muốn ở một đối tác',
      'Khẳng định: "Tôi sẵn sàng cho tình yêu đích thực"',
    ],
    crystal: 'Thạch Anh Hồng',
    course: 'course_love',
  },

  love_anger_betrayal: {
    id: 'love_anger_betrayal',
    type: 'love',
    frequency: { min: 150, max: 175 },
    frequencyName: 'Tức giận vì bị phản bội',
    triggers: ['anger'],
    minScore: 5,
    title: 'Nghiệp Tình: Oán Hận Vì Bị Phản Bội',
    description: 'Bạn vẫn mang theo sự tức giận từ lần bị phản bội, khiến tim đóng cửa.',
    rootCause: 'Chấn thương từ sự phản bội chưa được chữa lành.',
    healing: [
      'Viết thư (không gửi) cho người đã phản bội',
      'Thực hành tha thứ - cho họ và cho mình',
      'Khẳng định: "Tôi giải phóng quá khứ để đón nhận hiện tại"',
    ],
    crystal: 'Thạch Anh Hồng',
    course: 'course_love',
  },

  love_grief_heartbreak: {
    id: 'love_grief_heartbreak',
    type: 'love',
    frequency: { min: 75, max: 100 },
    frequencyName: 'Đau buồn vì tan vỡ',
    triggers: ['grief'],
    minScore: 5,
    title: 'Nghiệp Tình: Đau Buồn Chưa Nguôi',
    description: 'Bạn vẫn chưa vượt qua được nỗi đau từ mối quan hệ đã kết thúc.',
    rootCause: 'Quá trình grieving chưa hoàn thành, có thể bạn vẫn hy vọng quay lại.',
    healing: [
      'Cho phép bản thân buồn - đừng cố tỏ ra mạnh mẽ',
      'Viết thư chia tay thật sự (dù đã chia tay)',
      'Khẳng định: "Tôi cho đi với tình yêu và đón nhận điều tốt đẹp hơn"',
    ],
    crystal: 'Thạch Anh Tím',
    course: 'course_love',
  },

  love_apathy_given_up: {
    id: 'love_apathy_given_up',
    type: 'love',
    frequency: { min: 50, max: 75 },
    frequencyName: 'Thờ ơ/Đã từ bỏ',
    triggers: ['apathy'],
    minScore: 5,
    title: 'Nghiệp Tình: Đã Từ Bỏ Tình Yêu',
    description: 'Bạn đã mất niềm tin vào tình yêu và không còn mong chờ gì nữa.',
    rootCause: 'Quá nhiều thất vọng đã khiến bạn đóng cửa trái tim.',
    healing: [
      'Nhìn nhận: bạn vẫn còn sống = vẫn còn hy vọng',
      'Bắt đầu từ tình yêu bản thân',
      'Khẳng định: "Mỗi ngày mới là cơ hội mới cho tình yêu"',
    ],
    crystal: 'Thạch Anh Vàng',
    course: 'course_love',
  },

  love_balanced: {
    id: 'love_balanced',
    type: 'love',
    frequency: { min: 200, max: 400 },
    frequencyName: 'Cân bằng/Sẵn sàng',
    triggers: ['neutrality', 'acceptance', 'willingness', 'courage'],
    minScore: 4,
    title: 'Tần Số Tình Yêu Khá Tốt',
    description: 'Bạn có nền tảng cảm xúc khá lành mạnh và sẵn sàng cho tình yêu.',
    rootCause: 'Bạn đã làm việc với bản thân và chữa lành các vết thương.',
    healing: [
      'Tiếp tục self-love practice',
      'Mở lòng nhưng không vội vàng',
      'Nâng cấp lên tần số yêu thương 500Hz+',
    ],
    crystal: 'Thạch Anh Vàng',
    course: 'course_frequency',
  },

  love_high_frequency: {
    id: 'love_high_frequency',
    type: 'love',
    frequency: { min: 500, max: 700 },
    frequencyName: 'Tình yêu vô điều kiện',
    triggers: ['love', 'joy', 'peace', 'acceptance'],
    minScore: 3,
    title: 'Tần Số Tình Yêu Cao',
    description: 'Bạn yêu thương bản thân và người khác một cách vô điều kiện.',
    rootCause: 'Bạn đã chuyển hóa được phần lớn các nghiệp tình.',
    healing: [
      'Tiếp tục lan tỏa tình yêu',
      'Giúp đỡ người khác chữa lành',
      'Sống trong sự biết ơn',
    ],
    crystal: 'Thạch Anh Hồng',
    course: null,
  },

  love_codependency: {
    id: 'love_codependency',
    type: 'love',
    frequency: { min: 100, max: 150 },
    frequencyName: 'Phụ thuộc cảm xúc',
    triggers: ['fear', 'desire'],
    minScore: 6,
    title: 'Nghiệp Tình: Phụ Thuộc Cảm Xúc',
    description: 'Bạn cần đối tác để cảm thấy hoàn chỉnh, hạnh phúc phụ thuộc vào họ.',
    rootCause: 'Thiếu kết nối với bản thân, tìm kiếm sự công nhận từ bên ngoài.',
    healing: [
      'Dành thời gian MỘT MÌNH mỗi ngày - làm quen với sự cô đơn',
      'Liệt kê những gì làm bạn hạnh phúc MÀ KHÔNG CẦN ai',
      'Khẳng định: "Tôi hoàn chỉnh trong chính mình"',
    ],
    crystal: 'Aquamarine',
    course: 'course_love',
  },

  love_toxic_pattern: {
    id: 'love_toxic_pattern',
    type: 'love',
    frequency: { min: 75, max: 125 },
    frequencyName: 'Khuôn mẫu độc hại',
    triggers: ['fear', 'grief', 'anger'],
    minScore: 7,
    title: 'Nghiệp Tình: Lặp Lại Mối Quan Hệ Độc Hại',
    description: 'Bạn liên tục thu hút hoặc bị thu hút bởi người độc hại, người ái kỷ.',
    rootCause: 'Gắn kết tổn thương từ thời thơ ấu - quen với hỗn loạn và kịch tính.',
    healing: [
      'Học về các dấu hiệu lạm dụng tâm lý ái kỷ',
      'Thiết lập và giữ vững ranh giới lành mạnh',
      'Khẳng định: "Tôi chỉ cho phép tình yêu lành mạnh vào đời mình"',
    ],
    crystal: 'Hematite',
    course: 'course_love',
  },

  love_commitment_fear: {
    id: 'love_commitment_fear',
    type: 'love',
    frequency: { min: 125, max: 175 },
    frequencyName: 'Sợ cam kết',
    triggers: ['fear', 'pride'],
    minScore: 5,
    title: 'Nghiệp Tình: Sợ Hãi Cam Kết',
    description: 'Bạn chạy trốn khi mọi thứ trở nên nghiêm túc hoặc tìm lỗi để rời đi.',
    rootCause: 'Có thể sợ mất tự do, bị kiểm soát, hoặc lặp lại đau khổ của cha mẹ.',
    healing: [
      'Phân biệt cam kết LÀNH MẠNH vs kiểm soát',
      'Chữa lành chấn thương về việc bị "nhốt"',
      'Khẳng định: "Cam kết mang lại sự an toàn và tình yêu sâu sắc hơn"',
    ],
    crystal: 'Thạch Anh Trắng',
    course: 'course_love',
  },

  love_jealousy_possessive: {
    id: 'love_jealousy_possessive',
    type: 'love',
    frequency: { min: 100, max: 150 },
    frequencyName: 'Ghen tuông/chiếm hữu',
    triggers: ['fear', 'anger'],
    minScore: 6,
    title: 'Nghiệp Tình: Ghen Tuông Quá Mức',
    description: 'Bạn thường xuyên lo lắng đối tác sẽ phản bội hoặc bỏ đi.',
    rootCause: 'Bất an từ bên trong, thiếu lòng tự trọng, hoặc chấn thương bị phản bội.',
    healing: [
      'Nhận ra: ghen tuông đẩy người ta đi, không giữ họ lại',
      'Xây dựng lòng tự trọng độc lập với mối quan hệ',
      'Khẳng định: "Tôi tin tưởng bản thân và người tôi yêu"',
    ],
    crystal: 'Aquamarine',
    course: 'course_love',
  },

  love_savior_complex: {
    id: 'love_savior_complex',
    type: 'love',
    frequency: { min: 150, max: 200 },
    frequencyName: 'Hội chứng cứu rỗi',
    triggers: ['pride', 'desire', 'guilt'],
    minScore: 5,
    title: 'Nghiệp Tình: Luôn Muốn Cứu Người Khác',
    description: 'Bạn bị thu hút bởi những người "cần được cứu" và cố gắng thay đổi họ.',
    rootCause: 'Có thể là cách để tránh nhìn vào vấn đề của bản thân.',
    healing: [
      'Nhận ra: bạn không có trách nhiệm cứu ai',
      'Tập trung vào việc cải thiện BẢN THÂN',
      'Khẳng định: "Tôi yêu người đã hoàn thiện, không phải project để sửa"',
    ],
    crystal: 'Aquamarine',
    course: 'course_love',
  },

  love_walls_up: {
    id: 'love_walls_up',
    type: 'love',
    frequency: { min: 100, max: 175 },
    frequencyName: 'Đóng cửa trái tim',
    triggers: ['fear', 'anger', 'pride'],
    minScore: 6,
    title: 'Nghiệp Tình: Xây Tường Bảo Vệ Quá Cao',
    description: 'Bạn không cho ai đến gần vì sợ bị tổn thương.',
    rootCause: 'Đau quá nhiều lần nên quyết định không cho ai cơ hội nữa.',
    healing: [
      'Phân biệt: ranh giới LÀNH MẠNH vs bức tường',
      'Mở lòng từ từ, không cần mở hết ngay',
      'Khẳng định: "Tôi an toàn khi mở lòng với người xứng đáng"',
    ],
    crystal: 'Thạch Anh Hồng',
    course: 'course_love',
  },

  love_chasing_unavailable: {
    id: 'love_chasing_unavailable',
    type: 'love',
    frequency: { min: 125, max: 150 },
    frequencyName: 'Đuổi theo người xa cách',
    triggers: ['desire', 'grief'],
    minScore: 6,
    title: 'Nghiệp Tình: Thích Người Xa Cách Cảm Xúc',
    description: 'Bạn chỉ có cảm xúc mạnh với người lạnh nhạt, không sẵn sàng.',
    rootCause: 'Có thể tái hiện mối quan hệ với cha/mẹ xa cách cảm xúc.',
    healing: [
      'Nhận ra khuôn mẫu này và có ý thức dừng lại',
      'Cho người "nhàm chán" (ổn định) một cơ hội',
      'Khẳng định: "Tình yêu an toàn và ổn định cũng thú vị"',
    ],
    crystal: 'Thạch Anh Hồng',
    course: 'course_love',
  },

  love_perfectionism: {
    id: 'love_perfectionism',
    type: 'love',
    frequency: { min: 175, max: 200 },
    frequencyName: 'Cầu toàn trong tình yêu',
    triggers: ['pride', 'fear'],
    minScore: 4,
    title: 'Nghiệp Tình: Cầu Toàn Quá Mức',
    description: 'Không ai đủ tốt cho bạn vì luôn tìm ra lỗi ở đối tác.',
    rootCause: 'Có thể dùng sự cầu toàn để tránh sự gần gũi.',
    healing: [
      'Liệt kê 5 điều THỰC SỰ quan trọng vs "có thì tốt"',
      'Chấp nhận không ai hoàn hảo - kể cả bạn',
      'Khẳng định: "Tôi yêu con người thật, không phải lý tưởng"',
    ],
    crystal: 'Thạch Anh Trắng',
    course: 'course_love',
  },

  love_parent_projection: {
    id: 'love_parent_projection',
    type: 'love',
    frequency: { min: 75, max: 125 },
    frequencyName: 'Phóng chiếu từ cha mẹ',
    triggers: ['grief', 'anger', 'fear'],
    minScore: 7,
    title: 'Nghiệp Tình: Tìm Kiếm Cha/Mẹ Ở Đối Tác',
    description: 'Bạn vô thức tìm đối tác giống cha/mẹ để chữa lành vết thương cũ.',
    rootCause: 'Đứa trẻ bên trong vẫn đang tìm kiếm tình yêu/sự công nhận từ cha mẹ.',
    healing: [
      'Làm công việc chữa lành đứa trẻ bên trong với chuyên gia',
      'Tha thứ cho cha mẹ (cho chính bạn, không phải họ)',
      'Khẳng định: "Tôi tìm đối tác, không phải cha mẹ thay thế"',
    ],
    crystal: 'Thạch Anh Hồng',
    course: 'course_love',
  },

  // ===== FREQUENCY SCENARIOS =====
  frequency_stuck: {
    id: 'frequency_stuck',
    type: 'frequency',
    frequency: { min: 100, max: 175 },
    frequencyName: 'Kẹt ở tần số thấp',
    triggers: ['fear', 'anger', 'desire'],
    minScore: 5,
    title: 'Năng Lượng Đang Bị Kẹt',
    description: 'Bạn cảm thấy stuck, không tiến lên được dù đã cố gắng.',
    rootCause: 'Có block ở một hoặc nhiều lĩnh vực đang kéo tần số xuống.',
    healing: [
      'Identify: lĩnh vực nào đang block nhất (tiền/tình/sức khỏe)?',
      'Focus chữa lành 1 lĩnh vực trước',
      'Khẳng định: "Mỗi ngày tôi đang nhẹ nhàng nâng tần số lên"',
    ],
    crystal: 'Thạch Anh Tím',
    course: 'course_frequency',
  },

  frequency_spiritual_bypass: {
    id: 'frequency_spiritual_bypass',
    type: 'frequency',
    frequency: { min: 175, max: 200 },
    frequencyName: 'Né tránh qua tâm thức',
    triggers: ['pride', 'apathy'],
    minScore: 4,
    title: 'Cảnh Báo: Né Tránh Qua Tâm Linh',
    description: 'Bạn dùng tâm thức để tránh đối mặt với vấn đề thực tế.',
    rootCause: 'Nghĩ rằng "nghĩ tích cực" là đủ mà không hành động.',
    healing: [
      'Tâm linh = công cụ, không phải nơi trốn tránh',
      'Đối mặt với vấn đề thực tế + áp dụng công cụ tâm thức',
      'Khẳng định: "Tôi cân bằng giữa tâm thức và thực tế"',
    ],
    crystal: 'Hematite',
    course: 'course_frequency',
  },

  frequency_transition: {
    id: 'frequency_transition',
    type: 'frequency',
    frequency: { min: 175, max: 250 },
    frequencyName: 'Đang chuyển đổi',
    triggers: ['courage', 'neutrality'],
    minScore: 4,
    title: 'Giai Đoạn Chuyển Đổi Tần Số',
    description: 'Bạn đang ở ngưỡng từ tần số thấp lên cao - điểm chuyển hóa quan trọng.',
    rootCause: 'Đã làm được nhiều việc chữa lành, đang ở giai đoạn breakthrough.',
    healing: [
      'Tiếp tục momentum - đừng dừng lại',
      'Có thể có resistance từ ego - đó là bình thường',
      'Khẳng định: "Tôi can đảm bước qua cánh cửa mới"',
    ],
    crystal: 'Special Set',
    course: 'course_frequency',
  },

  frequency_dark_night: {
    id: 'frequency_dark_night',
    type: 'frequency',
    frequency: { min: 50, max: 100 },
    frequencyName: 'Đêm tối của linh hồn',
    triggers: ['apathy', 'grief', 'guilt'],
    minScore: 8,
    title: 'Đêm Tối Của Linh Hồn',
    description: 'Bạn đang trải qua giai đoạn tối tăm nhất - nhưng đây cũng là cơ hội chuyển hóa lớn nhất.',
    rootCause: 'Soul đang purge những gì không còn phục vụ - đau nhưng cần thiết.',
    healing: [
      'Đây là giai đoạn BÌNH THƯỜNG trong spiritual journey',
      'Đừng cố tỏ ra vui - cho phép bản thân buồn',
      'Khẳng định: "Đêm tối nhất là trước bình minh"',
    ],
    crystal: 'Thạch Anh Khói',
    course: 'course_frequency',
  },

  frequency_awakening: {
    id: 'frequency_awakening',
    type: 'frequency',
    frequency: { min: 400, max: 540 },
    frequencyName: 'Awakening',
    triggers: ['love', 'joy', 'reason', 'acceptance'],
    minScore: 3,
    title: 'Giai Đoạn Thức Tỉnh Tâm Linh',
    description: 'Bạn đang ở tần số rất cao - có thể đang trải qua awakening.',
    rootCause: 'Đã chữa lành phần lớn các block và đang kết nối với higher self.',
    healing: [
      'Ground yourself - đừng bay quá cao',
      'Chia sẻ ánh sáng với người xung quanh',
      'Tiếp tục thiền định và gratitude',
    ],
    crystal: 'Thạch Anh Trắng',
    course: null,
  },

  // ===== CAREER SCENARIOS =====
  career_imposter: {
    id: 'career_imposter',
    type: 'career',
    frequency: { min: 100, max: 150 },
    frequencyName: 'Hội chứng kẻ mạo danh',
    triggers: ['shame', 'fear'],
    minScore: 6,
    title: 'Nghiệp Sự Nghiệp: Hội Chứng Kẻ Mạo Danh',
    description: 'Bạn không tin mình xứng đáng với thành công và sợ bị "lật tẩy".',
    rootCause: 'Có thể từ việc so sánh với người khác hoặc bị phê bình nhiều khi nhỏ.',
    healing: [
      'Viết bằng chứng về năng lực của bạn',
      'Nhận ra: người thực sự kém không có hội chứng kẻ mạo danh',
      'Khẳng định: "Tôi xứng đáng với mọi thành công của mình"',
    ],
    crystal: 'Thạch Anh Vàng',
    course: 'course_money',
  },

  career_burnout: {
    id: 'career_burnout',
    type: 'career',
    frequency: { min: 75, max: 100 },
    frequencyName: 'Kiệt sức',
    triggers: ['grief', 'apathy'],
    minScore: 6,
    title: 'Nghiệp Sự Nghiệp: Kiệt Sức Hoàn Toàn',
    description: 'Bạn đã cháy hết năng lượng và mất hứng thú với công việc.',
    rootCause: 'Cho đi quá nhiều mà không nạp lại, hoặc làm việc không đúng mục đích.',
    healing: [
      'NGHỈ NGƠI - đây không phải tùy chọn',
      'Hỏi bản thân: "Mình thực sự muốn làm gì?"',
      'Khẳng định: "Tôi cho phép bản thân nghỉ ngơi để phục hồi"',
    ],
    crystal: 'Thạch Anh Tím',
    course: 'course_frequency',
  },

  // ===== HEALTH SCENARIOS =====
  health_stress: {
    id: 'health_stress',
    type: 'health',
    frequency: { min: 100, max: 150 },
    frequencyName: 'Stress mãn tính',
    triggers: ['fear', 'anger'],
    minScore: 5,
    title: 'Nghiệp Sức Khỏe: Stress Mãn Tính',
    description: 'Cơ thể bạn đang gánh chịu stress quá mức trong thời gian dài.',
    rootCause: 'Tâm trí không yên dẫn đến cơ thể phản ứng.',
    healing: [
      'Breathing exercises 5 phút mỗi ngày',
      'Giảm caffeine và screen time',
      'Khẳng định: "Tôi thư giãn và tin tưởng vào dòng chảy cuộc sống"',
    ],
    crystal: 'Thạch Anh Tím',
    course: 'course_frequency',
  },

  health_body_disconnect: {
    id: 'health_body_disconnect',
    type: 'health',
    frequency: { min: 50, max: 100 },
    frequencyName: 'Mất kết nối cơ thể',
    triggers: ['apathy', 'shame'],
    minScore: 6,
    title: 'Nghiệp Sức Khỏe: Mất Kết Nối Với Cơ Thể',
    description: 'Bạn không lắng nghe tín hiệu cơ thể và có thể ghét cơ thể mình.',
    rootCause: 'Chấn thương lưu giữ trong cơ thể hoặc bị chê bai ngoại hình từ thời thơ ấu.',
    healing: [
      'Thiền quét cơ thể mỗi ngày',
      'Nói "Cảm ơn" với từng bộ phận cơ thể',
      'Khẳng định: "Cơ thể tôi là đền thờ linh thiêng"',
    ],
    crystal: 'Hematite',
    course: 'course_frequency',
  },

  // ===== FAMILY SCENARIOS =====
  family_guilt: {
    id: 'family_guilt',
    type: 'family',
    frequency: { min: 50, max: 100 },
    frequencyName: 'Tội lỗi với gia đình',
    triggers: ['guilt', 'shame'],
    minScore: 6,
    title: 'Nghiệp Gia Đình: Mang Vác Tội Lỗi',
    description: 'Bạn cảm thấy có lỗi với gia đình hoặc gánh vác trách nhiệm quá mức.',
    rootCause: 'Có thể là người "chăm sóc" trong gia đình từ nhỏ.',
    healing: [
      'Nhận ra: bạn không có trách nhiệm cứu cả gia đình',
      'Học cách đặt boundaries với gia đình',
      'Khẳng định: "Tôi yêu gia đình VÀ yêu bản thân"',
    ],
    crystal: 'Thạch Anh Trắng',
    course: 'course_frequency',
  },

  family_black_sheep: {
    id: 'family_black_sheep',
    type: 'family',
    frequency: { min: 100, max: 175 },
    frequencyName: 'Con cừu đen',
    triggers: ['anger', 'shame', 'pride'],
    minScore: 6,
    title: 'Nghiệp Gia Đình: Con Cừu Đen',
    description: 'Bạn cảm thấy mình khác biệt, không được chấp nhận trong gia đình.',
    rootCause: 'Có thể bạn là người đang phá vỡ cycles của gia đình - đó là tốt!',
    healing: [
      'Nhận ra: "black sheep" thường là người can đảm nhất',
      'Tìm "family of choice" ngoài family of origin',
      'Khẳng định: "Tôi tự hào là người tôi đang trở thành"',
    ],
    crystal: 'Thạch Anh Tím',
    course: 'course_frequency',
  },
};

// ========== SCENARIO MATCHING FUNCTION ==========
export const matchScenario = (answers, karmaType) => {
  // Calculate scores from answers
  const scores = {};

  answers.forEach(answer => {
    if (answer.score) {
      Object.entries(answer.score).forEach(([emotion, points]) => {
        scores[emotion] = (scores[emotion] || 0) + points;
      });
    }
  });

  console.log('[GEM Knowledge] Calculated scores:', scores);

  // Find dominant emotions
  const sortedEmotions = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const dominantEmotions = sortedEmotions.map(([emotion]) => emotion);
  const totalScore = sortedEmotions.reduce((sum, [, score]) => sum + score, 0);

  console.log('[GEM Knowledge] Dominant emotions:', dominantEmotions);

  // Find matching scenarios
  const relevantScenarios = Object.values(SCENARIOS)
    .filter(s => s.type === karmaType);

  let bestMatch = null;
  let bestMatchScore = 0;

  for (const scenario of relevantScenarios) {
    const matchScore = scenario.triggers.reduce((score, trigger) => {
      if (dominantEmotions.includes(trigger)) {
        return score + (scores[trigger] || 0);
      }
      return score;
    }, 0);

    if (matchScore >= scenario.minScore && matchScore > bestMatchScore) {
      bestMatch = scenario;
      bestMatchScore = matchScore;
    }
  }

  // Calculate frequency based on scores
  let frequency;
  if (bestMatch) {
    const range = bestMatch.frequency;
    frequency = Math.round((range.min + range.max) / 2);
  } else {
    // Default to middle frequency if no strong match
    frequency = 175;
  }

  return {
    scenario: bestMatch || relevantScenarios.find(s => s.id.includes('balanced')),
    frequency,
    dominantEmotions,
    scores,
  };
};

// ========== GET QUESTIONS FOR KARMA TYPE ==========
export const getQuestionsForKarma = (karmaType) => {
  switch (karmaType) {
    case 'money':
      return MONEY_QUESTIONS;
    case 'love':
      return LOVE_QUESTIONS;
    case 'health':
      return HEALTH_QUESTIONS;
    case 'career':
      return CAREER_QUESTIONS;
    case 'family':
      return FAMILY_QUESTIONS;
    default:
      return [];
  }
};

export default {
  FREQUENCY_LEVELS,
  KARMA_TYPES,
  MONEY_QUESTIONS,
  LOVE_QUESTIONS,
  HEALTH_QUESTIONS,
  CAREER_QUESTIONS,
  FAMILY_QUESTIONS,
  SCENARIOS,
  matchScenario,
  getQuestionsForKarma,
};
