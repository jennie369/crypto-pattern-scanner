import React from 'react';
import {
  Package, Heart, Sparkles, Gift, Gem, BookOpen,
  Home, Video, Check
} from 'lucide-react';
import './Section5_Unboxing.css';

export default function Section5_Unboxing() {
  const steps = [
    {
      number: "1",
      title: "Nhận Hộp Sang Trọng",
      description: "Hộp đặc biệt với packaging cao cấp, mở ra như một món quà từ vũ trụ.",
      icon: <Package size={48} />,
      features: [
        "Hộp cứng cao cấp, in logo vàng kim",
        "Ruy băng lụa thật (không phải giả)",
        "Đóng gói chắc chắn, không lo vỡ/móp"
      ],
      highlight: "First impression matters!",
      color: "#3B82F6"
    },
    {
      number: "2",
      title: "Mở Hộp Như Ritual",
      description: "Cảm giác mở hộp từ từ, như đang chuẩn bị đón nhận một năng lượng mới.",
      icon: <Gift size={48} />,
      features: [
        "Lớp giấy gói hoa (tissue paper) màu pastel",
        "Tinh thể được bọc riêng từng viên",
        "Thiệp giới thiệu đá handwritten (viết tay)"
      ],
      highlight: "Unboxing = Mini celebration",
      color: "#1E3A8A"
    },
    {
      number: "3",
      title: "Ngắm Nhìn & Cảm Nhận",
      description: "Lần đầu tiên cầm trên tay viên đá của mình. Màu sắc, vân đá, năng lượng...",
      icon: <Gem size={48} />,
      features: [
        "Mỗi viên đá là unique, không trùng lặp",
        "Đẹp xuất sắc, worthy để chụp hình",
        "Cảm nhận năng lượng ngay lập tức"
      ],
      highlight: "Your crystal chose you",
      color: "#EC4899"
    },
    {
      number: "4",
      title: "Đọc Hướng Dẫn Sử Dụng",
      description: "Guidebook chi tiết: cách cleanse, charge, và kết nối với viên đá của bạn.",
      icon: <BookOpen size={48} />,
      features: [
        "Mini-book bỏ túi, in màu, thiết kế đẹp",
        "Hướng dẫn meditation với đá",
        "Lịch charge đá theo chu kỳ trăng"
      ],
      highlight: "Knowledge = Power",
      color: "#F59E0B"
    },
    {
      number: "5",
      title: "Thiết Lập Không Gian",
      description: "Đặt viên đá vào vị trí hoàn hảo. Từ giờ, không gian của bạn đã khác.",
      icon: <Home size={48} />,
      features: [
        "Feng shui guide để đặt đá đúng chỗ",
        "Setup ideas từ community",
        "Checklist 7 ngày đầu tiên"
      ],
      highlight: "Your transformation begins",
      color: "#10B981"
    }
  ];

  return (
    <section className="unboxing-section">
      <div className="unboxing-container">

        {/* Section Header */}
        <div className="unboxing-header">
          <p className="unboxing-eyebrow">
            <Gift size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
            DOPAMINE EXPERIENCE
          </p>
          <h2 className="unboxing-title">
            Unboxing Experience<br />
            <span className="gradient-text">Đỉnh Cao</span>
          </h2>
          <p className="unboxing-subtitle">
            5 bước đến thiên đường dopamine. Tại sao khách hàng gọi đây là "best unboxing ever"?
          </p>
        </div>

        {/* Unboxing Steps */}
        <div className="unboxing-steps">
          {steps.map((step, index) => (
            <UnboxingStep
              key={step.number}
              step={step}
              reverse={index % 2 === 1}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="unboxing-cta">
          <h3 className="cta-title">Sẵn Sàng Trải Nghiệm?</h3>
          <p className="cta-description">
            Hơn 15,000 khách hàng đã có trải nghiệm unboxing đáng nhớ. Đến lượt bạn.
          </p>
          <button className="btn-unboxing-cta">
            <Gift size={20} />
            <span>Chọn Món Quà Cho Mình</span>
            <Sparkles size={18} />
          </button>
        </div>

      </div>
    </section>
  );
}

// Sub-components
function UnboxingStep({ step, reverse }) {
  return (
    <div className={`unboxing-step ${reverse ? 'reverse' : ''}`}>
      <div className="step-visual">
        <div className="step-number-circle" style={{ borderColor: step.color }}>
          <span className="step-number">{step.number}</span>
        </div>
        <div className="step-emoji">{step.icon}</div>
        <div className="step-glow" style={{ background: `${step.color}33` }}></div>
      </div>

      <div className="step-content">
        <div className="step-highlight" style={{ color: step.color }}>
          {step.highlight}
        </div>
        <h3 className="step-title">{step.title}</h3>
        <p className="step-description">{step.description}</p>

        <div className="step-features">
          {step.features.map((feature, index) => (
            <div key={index} className="feature-item">
              <Check size={16} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

