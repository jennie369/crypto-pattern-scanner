import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, MessageCircle, Sparkles, Shield, TrendingUp, Users,
  Gem, Target, Package, Rocket, Clock, Star
} from 'lucide-react';
import './Section10_FinalCTA.css';

export default function Section10_FinalCTA() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function calculateTimeLeft() {
    // Calculate time until end of day
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const difference = endOfDay.getTime() - now.getTime();

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  const journeySteps = [
    {
      number: "1",
      icon: <Target size={32} />,
      title: "Chọn Tinh Thể",
      description: "Làm quiz hoặc browse collection"
    },
    {
      number: "2",
      icon: <Package size={32} />,
      title: "Nhận Hộp Sang",
      description: "Unboxing experience đỉnh cao"
    },
    {
      number: "3",
      icon: <Sparkles size={32} />,
      title: "Thiết Lập",
      description: "Follow guidebook, đặt đá đúng chỗ"
    },
    {
      number: "4",
      icon: <Rocket size={32} />,
      title: "Chuyển Hóa",
      description: "Thấy kết quả trong 90 ngày"
    }
  ];

  const stats = [
    { icon: <Users size={24} />, number: "15,234", label: "Đã Bắt Đầu" },
    { icon: <TrendingUp size={24} />, number: "89%", label: "Thành Công" },
    { icon: <Shield size={24} />, number: "4.9/5", label: "Đánh Giá" }
  ];

  return (
    <section className="final-cta-section">
      <div className="final-cta-container">

        {/* Quote Section */}
        <div className="quote-section">
          <div className="quote-icon"><Gem size={48} /></div>
          <p className="quote-text">
            "Bạn không tìm thấy tinh thể. Tinh thể tìm thấy bạn.<br />
            Khi bạn sẵn sàng - năng lượng sẽ đến."
          </p>
          <p className="quote-author">— Nguyên lý cổ xưa</p>
        </div>

        {/* Main CTA Header */}
        <div className="main-cta-header">
          <h2 className="main-cta-title">
            <Sparkles size={32} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} /> Sẵn Sàng <span className="gradient-text">Bắt Đầu Hành Trình</span>?
          </h2>
          <p className="main-cta-subtitle">
            15,234 người đã chuyển hóa cuộc sống. Đến lượt bạn.
          </p>
        </div>

        {/* Journey Recap */}
        <div className="journey-recap">
          <h3 className="recap-title">4 Bước Đơn Giản</h3>
          <div className="journey-steps">
            {journeySteps.map((step, index) => (
              <div key={index} className="journey-step">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="countdown-section">
          <p className="countdown-label"><Clock size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} /> Ưu đãi đặc biệt kết thúc trong:</p>
          <CountdownTimer timeLeft={timeLeft} />
          <p className="countdown-note">
            Free shipping + Gift wrapping cho 50 đơn đầu tiên hôm nay
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="cta-buttons">
          <button className="btn-primary-cta">
            <ShoppingCart size={24} />
            <span>BẮT ĐẦU HÀNH TRÌNH NGAY</span>
            <Sparkles size={20} />
          </button>
          <button className="btn-secondary-cta">
            <MessageCircle size={20} />
            <span>TƯ VẤN MIỄN PHÍ</span>
          </button>
        </div>

        {/* Guarantee */}
        <div className="guarantee-section">
          <div className="guarantee-badge">
            <Shield size={32} />
            <div className="guarantee-text">
              <h4 className="guarantee-title">Đảm Bảo 100%</h4>
              <p className="guarantee-description">
                30 ngày hoàn tiền không hỏi lý do. Nếu không hài lòng → hoàn tiền toàn bộ.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Final Message */}
        <div className="final-message">
          <p className="final-text">
            <Star size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} /> Hành trình 1,000 dặm bắt đầu từ bước đi đầu tiên.<br />
            Bước đầu tiên của bạn? <strong>Một viên tinh thể.</strong>
          </p>
        </div>

      </div>
    </section>
  );
}

// Sub-component
function CountdownTimer({ timeLeft }) {
  return (
    <div className="countdown-timer">
      <div className="time-block">
        <div className="time-number">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="time-label">Giờ</div>
      </div>
      <div className="time-separator">:</div>
      <div className="time-block">
        <div className="time-number">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="time-label">Phút</div>
      </div>
      <div className="time-separator">:</div>
      <div className="time-block">
        <div className="time-number">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="time-label">Giây</div>
      </div>
    </div>
  );
}
