/**
 * Vision Board Explanations - Giải thích Vision Board cho user
 * Dùng khi AI gợi ý widget hoặc user hỏi về Vision Board
 */

export const VISION_BOARD_EXPLANATIONS = {
  // Giải thích ngắn (dùng khi gợi ý widget)
  short: {
    whatIs: 'Vision Board là "bảng ước mơ số" của bạn trong app - nơi bạn đặt các mục tiêu và affirmation.',
    benefit: 'Mỗi sáng thức dậy, bạn sẽ thấy ngay những lời khẳng định này để não bộ được "lập trình lại".',
  },

  // Giải thích đầy đủ (dùng khi user hỏi về Vision Board)
  full: {
    whatIs: `**Vision Board trong Gemral là gì?**

Đây là "bảng ước mơ số" cá nhân của bạn - khác với vision board giấy truyền thống:

✅ **Ưu điểm so với vision board truyền thống:**
• Nhắc nhở bạn MỖI NGÀY (không bị quên như treo tường)
• Theo dõi TIẾN TRÌNH (biết mình đang ở đâu)
• Có AI HỖ TRỢ (tôi sẽ điều chỉnh theo tiến độ của bạn)
• Mang theo KHẮP NƠI (trong điện thoại)`,

    howItWorks: `**Vision Board hoạt động thế nào?**

1. **Buổi sáng:** App nhắc bạn đọc affirmation + nhìn vào mục tiêu
2. **Trong ngày:** Widget hiện trên màn hình nhắc nhở liên tục
3. **Buổi tối:** Check-in tiến trình, ghi nhận thành tựu nhỏ
4. **Hàng tuần:** Tôi sẽ hỏi thăm và điều chỉnh nếu cần

Sau 21 ngày, não bộ của bạn sẽ được "lập trình lại" với tần số mới!`,

    howToCreate: `**3 bước tạo Vision Board:**

1️⃣ **Chọn mục tiêu chính**
   - Tiền bạc / Tình yêu / Sức khỏe / Sự nghiệp

2️⃣ **Đặt con số & thời hạn cụ thể**
   - Ví dụ: "Kiếm 100 triệu/tháng trước 30/6/2025"

3️⃣ **Thêm affirmation phù hợp**
   - Tôi sẽ gợi ý dựa trên mục tiêu của bạn`,
  },

  // Mục tiêu descriptions
  widgets: {
    affirmation: {
      title: 'Mục tiêu Affirmation',
      description: 'Nhắc nhở đọc affirmation mỗi ngày, theo dõi streak liên tục',
      benefits: [
        'Nhắc nhở đọc affirmation mỗi ngày',
        'Theo dõi streak (chuỗi ngày liên tục)',
        'Nâng tần số từ từ qua thời gian',
      ],
    },
    goal: {
      title: 'Mục tiêu Tài chính',
      description: 'Đặt mục tiêu cụ thể và theo dõi tiến trình',
      benefits: [
        'Nhìn thấy mục tiêu mỗi ngày',
        'Theo dõi % hoàn thành',
        'Chia nhỏ thành các bước',
      ],
    },
    habit: {
      title: 'Mục tiêu Thói Quen',
      description: 'Xây dựng thói quen tốt với checklist hàng ngày',
      benefits: [
        'Checklist thói quen mỗi ngày',
        'Theo dõi streak',
        'Nhắc nhở đúng giờ',
      ],
    },
    crystal: {
      title: 'Mục tiêu Đá Năng Lượng',
      description: 'Nhắc nhở sử dụng và sạc đá đúng cách',
      benefits: [
        'Nhắc thiền với đá',
        'Nhắc sạc đá đúng thời điểm',
        'Hướng dẫn sử dụng đá',
      ],
    },
  },

  // Topic-specific explanations
  byTopic: {
    money: {
      title: 'Mục tiêu Affirmation Tiền Bạc',
      shortExplanation: 'Đây là "bảng ước mơ số" của bạn - nơi bạn đặt mục tiêu và affirmation. Mỗi sáng thức dậy, bạn sẽ thấy ngay những lời khẳng định này để não bộ được "lập trình lại" với tần số thịnh vượng.',
      benefits: [
        'Nhắc nhở đọc affirmation mỗi ngày',
        'Theo dõi streak (chuỗi ngày liên tục)',
        'Nâng tần số tiền bạc từ từ',
      ],
      cta: 'Bấm nút [Thêm Mục Tiêu] bên dưới để bắt đầu hành trình nâng tần số!',
    },
    love: {
      title: 'Mục tiêu Chữa Lành Tình Yêu',
      shortExplanation: 'Đây là "bảng ước mơ số" trong app - nơi bạn đặt mục tiêu và affirmation về tình yêu. Mỗi ngày nhìn vào, tiềm thức của bạn sẽ dần chuyển sang tần số thu hút người phù hợp.',
      benefits: [
        'Nhắc nhở yêu thương bản thân mỗi ngày',
        'Theo dõi hành trình chữa lành',
        'Chuẩn bị năng lượng đón nhận tình yêu mới',
      ],
      cta: 'Bấm nút [Thêm Mục Tiêu] bên dưới để bắt đầu chữa lành!',
    },
    karma: {
      title: 'Mục tiêu Chuyển Hóa Nghiệp',
      shortExplanation: 'Mỗi ngày, mục tiêu này sẽ nhắc bạn làm 1 bài tập nhỏ (chỉ 5-10 phút) để dần dần release nghiệp cũ. Sau 21 ngày liên tục, bạn sẽ thấy sự thay đổi rõ rệt.',
      benefits: [
        'Bài tập viết mỗi ngày',
        'Affirmation chuyển hóa',
        'Theo dõi streak 21 ngày',
      ],
      cta: 'Bấm nút [Thêm Mục Tiêu] bên dưới để bắt đầu chuyển hóa nghiệp!',
    },
    crystal: {
      title: 'Mục tiêu Nhắc Nhở Đá Năng Lượng',
      shortExplanation: 'Nhiều người mua đá nhưng quên dùng hoặc dùng sai cách. Mục tiêu này sẽ nhắc bạn sạc đá đúng cách, thời điểm tốt nhất để thiền, và cách kết hợp đá với affirmation.',
      benefits: [
        'Nhắc thiền với đá mỗi ngày',
        'Nhắc sạc đá đúng thời điểm',
        'Hướng dẫn sử dụng đá hiệu quả',
      ],
      cta: 'Bấm nút [Thêm Mục Tiêu] bên dưới để không quên dùng đá mỗi ngày!',
    },
    frequency: {
      title: 'Mục tiêu Theo Dõi Tần Số',
      shortExplanation: 'Mục tiêu này giúp bạn ghi lại cảm xúc hàng ngày và theo dõi tần số năng lượng theo thời gian. Bạn sẽ nhận ra pattern và biết cách điều chỉnh.',
      benefits: [
        'Ghi lại cảm xúc mỗi ngày',
        'Phân tích tần số theo tuần/tháng',
        'Nhận gợi ý cải thiện từ AI',
      ],
      cta: 'Bấm nút [Thêm Mục Tiêu] để bắt đầu theo dõi tần số!',
    },
  },
};

/**
 * Get Vision Board explanation by topic
 * @param {string} topic - Topic category
 * @returns {object} - Explanation object
 */
export const getVisionBoardExplanation = (topic) => {
  return VISION_BOARD_EXPLANATIONS.byTopic[topic] || VISION_BOARD_EXPLANATIONS.byTopic.money;
};

/**
 * Get full Vision Board explanation
 * @returns {string} - Full explanation text
 */
export const getFullVisionBoardExplanation = () => {
  const { full } = VISION_BOARD_EXPLANATIONS;
  return `${full.whatIs}\n\n${full.howItWorks}\n\n${full.howToCreate}`;
};

/**
 * Get widget benefits formatted as text
 * @param {string} topic - Topic category
 * @returns {string} - Formatted benefits
 */
export const getWidgetBenefitsText = (topic) => {
  const explanation = getVisionBoardExplanation(topic);
  if (!explanation?.benefits) return '';

  return explanation.benefits.map(b => `• ${b}`).join('\n');
};

/**
 * Build complete mục tiêu suggestion message
 * @param {string} topic - Topic category
 * @returns {string} - Complete suggestion message
 */
export const buildWidgetSuggestionMessage = (topic) => {
  const explanation = getVisionBoardExplanation(topic);

  return `💡 **GỢI Ý DÀNH CHO BẠN:**

Tôi có thể tạo cho bạn một **${explanation.title}** để thêm vào Vision Board.

📌 **Vision Board là gì?**
${explanation.shortExplanation}

✅ **Mục tiêu này sẽ giúp bạn:**
${getWidgetBenefitsText(topic)}

👉 **${explanation.cta}**`;
};

export default {
  VISION_BOARD_EXPLANATIONS,
  getVisionBoardExplanation,
  getFullVisionBoardExplanation,
  getWidgetBenefitsText,
  buildWidgetSuggestionMessage,
};
