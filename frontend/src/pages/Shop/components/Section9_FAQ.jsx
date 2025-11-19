import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import './Section9_FAQ.css';

// Fixed JSX syntax error with numeric content
export default function Section9_FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Tinh thể có thật sự hoạt động không?",
      answer: "Câu hỏi hay! Sự thật là: cả hai đều đúng. Về mặt khoa học, tinh thể có cấu trúc tinh thể hoàn hảo giúp phát ra tần số ổn định. Về mặt tâm linh, hàng nghìn năm qua, người ta đã sử dụng chúng trong healing và meditation. Điều quan trọng: 15,000+ khách hàng của chúng tôi đã trải nghiệm sự thay đổi rõ ràng trong cuộc sống."
    },
    {
      question: "Làm sao biết đá của tôi là đá thật, không phải giả?",
      answer: "Mỗi viên đá đều đi kèm Certificate of Authenticity từ nhà cung cấp. Chúng tôi chỉ làm việc với những supplier đã được verify từ Brazil, Madagascar, và India. Bạn có thể request lab test (miễn phí cho đơn > 10M). Ngoài ra, 30-day money-back guarantee - nếu bạn nghi ngờ, hoàn tiền 100%."
    },
    {
      question: "Tôi nên bắt đầu với viên đá nào?",
      answer: "Tùy vào mục tiêu của bạn:\n\n• Giảm stress, cải thiện giấc ngủ → Amethyst\n• Thu hút thịnh vượng, may mắn → Citrine\n• Tình yêu, cân bằng cảm xúc → Rose Quartz\n• Năng lượng, động lực → Carnelian\n\nNhưng cách tốt nhất? Làm quiz của chúng tôi (2 phút) để nhận recommendation phù hợp nhất!"
    },
    {
      question: "Cách cleanse và charge đá như thế nào?",
      answer: "Có 3 cách phổ biến:\n\n1. Ánh trăng: Đặt đá dưới trăng tròn qua đêm (mạnh nhất)\n2. Nước muối: Ngâm trong nước muối biển 4-6 giờ (không dùng cho đá mềm như Selenite)\n3. Khói sage: Xông khói từ sage/palo santo\n\nCharge: Đặt dưới ánh nắng sáng sớm (15-30 phút) hoặc trên cụm thạch anh trong (Clear Quartz cluster). Guidebook chi tiết sẽ đi kèm mỗi đơn hàng!"
    },
    {
      question: "Đặt hàng bao lâu thì nhận được?",
      answer: "• Nội thành HCM/HN: 1-2 ngày\n• Tỉnh thành khác: 2-4 ngày\n• International: 5-10 ngày\n\nExpress shipping: +50K → nhận trong 24h (HCM/HN). Tất cả đơn hàng được bảo hiểm và track realtime qua app."
    },
    {
      question: "Chính sách hoàn trả như thế nào?",
      answer: "30-day money-back guarantee, không hỏi lý do.\n\nNếu bạn không hài lòng (vì bất kỳ lý do gì), chỉ cần:\n1. Liên hệ support (chat/email)\n2. Ship đá về (miễn phí ship)\n3. Nhận hoàn tiền 100% trong 48h\n\nChúng tôi muốn bạn yêu những viên đá của mình. Nếu không match → đổi hoặc hoàn tiền, đơn giản vậy thôi."
    },
    {
      question: "Tôi có thể mua làm quà tặng không?",
      answer: "Tất nhiên! Tinh thể là món quà tuyệt vời cho sinh nhật, anniversary, hoặc bất kỳ dịp nào.\n\nGift Options:\n• Gift wrapping cao cấp (miễn phí)\n• Thiệp handwritten với message của bạn\n• Gift box sang trọng (+200K)\n• Anonymous shipping (người nhận không biết giá)\n\nGợi ý: Amethyst cho mẹ, Citrine cho sếp, Rose Quartz cho người yêu 💖"
    },
    {
      question: "VIP Program là gì? Làm sao để join?",
      answer: "VIP Program dành cho khách hàng loyal:\n\n• Tự động: Mua từ 5M trở lên\n• Quyền lợi: Early access sản phẩm mới, private workshops, 1-on-1 consulting, community riêng với 3,000+ members\n• Lifetime: Một khi là VIP, mãi mãi là VIP\n\nBonus: VIP members được ưu tiên support 24/7 và exclusive discounts (10-20% các đợt sale)."
    }
  ];

  return (
    <section className="faq-section">
      <div className="faq-container">

        {/* Section Header */}
        <div className="faq-header">
          <p className="faq-eyebrow">❓ CÂU HỎI THƯỜNG GẶP</p>
          <h2 className="faq-title">
            Những Câu Hỏi Bạn<br />
            Có Thể <span className="gradient-text">Đang Nghĩ...</span>
          </h2>
          <p className="faq-subtitle">
            Tất cả những gì bạn cần biết trước khi quyết định
          </p>
        </div>

        {/* FAQ List */}
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isActive={activeIndex === index}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div className="faq-cta">
          <div className="cta-icon">💬</div>
          <h3 className="cta-title">Vẫn Còn Thắc Mắc?</h3>
          <p className="cta-description">
            Team của chúng tôi luôn sẵn sàng giải đáp mọi câu hỏi của bạn.
            Chat trực tiếp hoặc email - phản hồi trong vòng 1 giờ.
          </p>
          <div className="cta-buttons">
            <button className="btn-chat">
              <MessageCircle size={20} />
              <span>Chat Với Chuyên Gia</span>
            </button>
            <button className="btn-email">
              <span>Gửi Email</span>
            </button>
          </div>

          <div className="support-stats">
            <div className="support-stat">
              <div className="stat-number">{'< 1h'}</div>
              <div className="stat-label">Thời gian phản hồi</div>
            </div>
            <div className="stat-divider">•</div>
            <div className="support-stat">
              <div className="stat-number">{'24/7'}</div>
              <div className="stat-label">Hỗ trợ liên tục</div>
            </div>
            <div className="stat-divider">•</div>
            <div className="support-stat">
              <div className="stat-number">{'98%'}</div>
              <div className="stat-label">Khách hài lòng</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// Sub-component
function FAQItem({ faq, isActive, onClick }) {
  return (
    <div className={`faq-item ${isActive ? 'active' : ''}`}>
      <button className="faq-question" onClick={onClick}>
        <span className="question-text">{faq.question}</span>
        <ChevronDown
          className={`chevron ${isActive ? 'rotated' : ''}`}
          size={24}
        />
      </button>

      <div className={`faq-answer ${isActive ? 'expanded' : ''}`}>
        <div className="answer-content">
          {faq.answer.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
