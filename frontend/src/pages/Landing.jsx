import React, { useState, useEffect, useCallback } from 'react';
import './Landing.css';

// ============================================
// GEMRAL LANDING PAGE
// Converted from Shopify HTML sections
// ============================================

export default function Landing() {
  // === STATE ===
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [spotsRemaining, setSpotsRemaining] = useState(47);
  const [liveViewers, setLiveViewers] = useState(128);
  const [showToast, setShowToast] = useState(false);
  const [currentToast, setCurrentToast] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    interests: [],
    marketingConsent: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === COUNTDOWN TIMER ===
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7); // 7 days from now

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // === FOMO: LIVE VIEWERS ===
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(100, Math.min(200, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // === FOMO: SPOTS REMAINING ===
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsRemaining(prev => {
        if (prev > 10 && Math.random() > 0.7) {
          return prev - 1;
        }
        return prev;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // === LIVE TOAST NOTIFICATIONS ===
  const toasts = [
    { name: 'Minh T.', action: 'vừa đăng ký GEM Scanner', avatar: '🧑‍💼' },
    { name: 'Hoa N.', action: 'đã mua khóa Tier 1', avatar: '👩' },
    { name: 'Long P.', action: 'vừa tham gia Waitlist', avatar: '👨' },
    { name: 'An D.', action: 'đã mở tài khoản thành công', avatar: '🧑' },
  ];

  useEffect(() => {
    const showRandomToast = () => {
      const toast = toasts[Math.floor(Math.random() * toasts.length)];
      setCurrentToast(toast);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    };

    const interval = setInterval(showRandomToast, 15000);
    setTimeout(showRandomToast, 5000); // First toast after 5s
    return () => clearInterval(interval);
  }, []);

  // === BACK TO TOP ===
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // === FORM HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Submit to API
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Đăng ký thành công!');
    }, 2000);
  };

  // === RENDER ===
  return (
    <div className="landing-page">

      {/* ========== SECTION 1: HERO ========== */}
      <section className="section-hero">
        {/* Countdown Bar */}
        <div className="countdown-bar">
          <div className="countdown-bar-inner">
            <span className="icon">🔥</span>
            <span className="text">Ưu đãi kết thúc trong:</span>
            <div className="countdown-timer">
              <div className="countdown-item">
                <span className="number">{String(countdown.days).padStart(2, '0')}</span>
                <span className="label">Ngày</span>
              </div>
              <div className="countdown-item">
                <span className="number">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="label">Giờ</span>
              </div>
              <div className="countdown-item">
                <span className="number">{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="label">Phút</span>
              </div>
              <div className="countdown-item">
                <span className="number">{String(countdown.seconds).padStart(2, '0')}</span>
                <span className="label">Giây</span>
              </div>
            </div>
          </div>
        </div>

        {/* TET Bar */}
        <div className="tet-bar">
          <div className="tet-bar-content">
            <span className="icon">🧧</span>
            <span className="text">
              <strong>Chào Xuân Ất Tỵ 2025</strong> - Giảm 20% tất cả khóa học đến 15/02
            </span>
            <span className="icon">🧧</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <span>💎</span>
            <span>Hệ Sinh Thái Tài Chính & Tâm Linh</span>
          </div>

          <h1 className="hero-title">
            NÂNG TẦN SỐ CUỘC SỐNG<br/>
            <span className="gold-text">VỚI GEMRAL</span>
          </h1>

          <p className="hero-subtitle">
            Kết hợp công nghệ AI hiện đại và trí tuệ phương Đông để giúp bạn
            giao dịch tài chính có ý thức và phát triển bản thân toàn diện
          </p>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Học viên</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">78%</div>
              <div className="stat-label">Win Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24</div>
              <div className="stat-label">Patterns</div>
            </div>
          </div>

          <div className="cta-buttons">
            <a href="#waitlist" className="btn-primary">
              <span>🚀</span>
              Đăng Ký Waitlist
            </a>
            <a href="#scanner" className="btn-secondary">
              <span>📊</span>
              Xem GEM Scanner
            </a>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: PAIN POINTS ========== */}
      <section className="section-pain-points section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <span>💔</span>
              VẤN ĐỀ THƯỜNG GẶP
            </span>
            <h2 className="section-title">
              Bạn Có Đang <span className="text-red">Gặp Khó Khăn</span> Như Này?
            </h2>
            <p className="section-subtitle">
              Những vấn đề phổ biến mà 90% người giao dịch và người đang tìm kiếm sự thay đổi gặp phải
            </p>
          </div>

          <div className="pain-grid">
            <div className="pain-card">
              <div className="icon">📉</div>
              <h3>Giao Dịch Thua Lỗ Liên Tục</h3>
              <p>Mua đỉnh bán đáy, không có chiến lược rõ ràng. Entry sai timing, cắt lỗ không kịp.</p>
            </div>
            <div className="pain-card">
              <div className="icon">😰</div>
              <h3>FOMO & Quyết Định Cảm Xúc</h3>
              <p>Sợ bỏ lỡ cơ hội, vào lệnh vội vàng. Tham lam khi thắng, hoảng loạn khi thua.</p>
            </div>
            <div className="pain-card">
              <div className="icon">🤯</div>
              <h3>Quá Tải Thông Tin</h3>
              <p>Hàng trăm chỉ báo, hàng nghìn coin. Không biết bắt đầu từ đâu, theo ai.</p>
            </div>
            <div className="pain-card">
              <div className="icon">💭</div>
              <h3>Cuộc Sống Thiếu Định Hướng</h3>
              <p>Lạc lõng giữa cuộc sống hiện đại. Muốn thay đổi nhưng không biết bắt đầu.</p>
            </div>
            <div className="pain-card">
              <div className="icon">💔</div>
              <h3>Mối Quan Hệ Không Như Ý</h3>
              <p>Khó kết nối sâu sắc với người khác. Tình yêu và các mối quan hệ gặp trở ngại.</p>
            </div>
            <div className="pain-card">
              <div className="icon">🔮</div>
              <h3>Tìm Kiếm Sự Hướng Dẫn</h3>
              <p>Muốn hiểu về bản mệnh, vận số. Cần lời khuyên tâm linh nhưng không biết tin ai.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: GEM MASTER ========== */}
      <section className="section-gem-master section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <span>🔮</span>
              GEM MASTER
            </span>
            <h2 className="section-title">
              Sư Phụ AI <span className="text-gold">Đa Năng</span>
            </h2>
            <p className="section-subtitle">
              4 tính năng trong 1 ứng dụng - Từ bói toán đến phân tích thị trường
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="icon">🎴</div>
              <h3>Tarot AI</h3>
              <p>Rút bài Tarot và nhận giải nghĩa chuyên sâu từ AI. Hỏi về tình yêu, sự nghiệp, tài chính.</p>
              <span className="tag">Miễn Phí</span>
            </div>
            <div className="feature-card">
              <div className="icon">☯️</div>
              <h3>Kinh Dịch AI</h3>
              <p>Gieo quẻ Kinh Dịch và nhận phân tích chi tiết. Hiểu về vận mệnh và thời điểm hành động.</p>
              <span className="tag">Miễn Phí</span>
            </div>
            <div className="feature-card">
              <div className="icon">📊</div>
              <h3>Phân Tích Thị Trường</h3>
              <p>AI phân tích chart, patterns và đưa ra nhận định về xu hướng thị trường crypto.</p>
              <span className="tag">Premium</span>
            </div>
            <div className="feature-card">
              <div className="icon">🎯</div>
              <h3>Vision Board</h3>
              <p>Tạo mục tiêu và theo dõi tiến độ. AI giúp bạn lập kế hoạch và giữ động lực.</p>
              <span className="tag">Miễn Phí</span>
            </div>
          </div>

          <div className="free-banner">
            <h3>Trải Nghiệm GEM Master <span className="text-gold">MIỄN PHÍ</span></h3>
            <p>Tải app ngay để bắt đầu hành trình nâng tần số cuộc sống</p>
            <a href="#download" className="btn-primary">
              <span>📱</span>
              Tải App Ngay
            </a>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: GEM SCANNER ========== */}
      <section className="section-scanner section" id="scanner">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <span>📊</span>
              GEM SCANNER
            </span>
            <h2 className="section-title">
              Quét Pattern <span className="text-cyan">Tự Động</span>
            </h2>
            <p className="section-subtitle">
              Phát hiện cơ hội giao dịch 24/7 với độ chính xác cao
            </p>
          </div>

          <div className="scanner-features">
            <div className="scanner-feature">
              <div className="icon">🔍</div>
              <div>
                <h4>Auto Scan 24/7</h4>
                <p>Quét liên tục 100+ coins trên nhiều timeframes. Không bỏ lỡ cơ hội nào.</p>
              </div>
            </div>
            <div className="scanner-feature">
              <div className="icon">🎯</div>
              <div>
                <h4>24 Patterns</h4>
                <p>Nhận diện DPD, UPU, H&S, Double Top/Bottom và nhiều patterns khác.</p>
              </div>
            </div>
            <div className="scanner-feature">
              <div className="icon">💰</div>
              <div>
                <h4>Entry/SL/TP</h4>
                <p>Tự động tính toán điểm vào lệnh, cắt lỗ và chốt lời tối ưu.</p>
              </div>
            </div>
            <div className="scanner-feature">
              <div className="icon">📝</div>
              <div>
                <h4>Paper Trading</h4>
                <p>Luyện tập với tiền ảo, theo dõi performance trước khi trade thật.</p>
              </div>
            </div>
            <div className="scanner-feature">
              <div className="icon">🔔</div>
              <div>
                <h4>Real-time Alerts</h4>
                <p>Nhận thông báo qua Telegram/Push khi phát hiện pattern mới.</p>
              </div>
            </div>
            <div className="scanner-feature">
              <div className="icon">📈</div>
              <div>
                <h4>Backtest Results</h4>
                <p>Xem lịch sử win rate và performance của từng pattern.</p>
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-number text-green">78%</div>
              <div className="stat-label">Win Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number text-cyan">1:2.5</div>
              <div className="stat-label">R:R Ratio</div>
            </div>
            <div className="stat-item">
              <div className="stat-number text-gold">1,000+</div>
              <div className="stat-label">Signals/Month</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 5: FREQUENCY METHOD ========== */}
      <section className="section-frequency section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <span>📚</span>
              GEM FREQUENCY METHOD
            </span>
            <h2 className="section-title">
              Phương Pháp <span className="text-gold">Độc Quyền</span>
            </h2>
            <p className="section-subtitle">
              24 patterns với win rate cao, được kiểm chứng qua hàng nghìn giao dịch
            </p>
          </div>

          <div className="pattern-grid">
            <div className="pattern-card">
              <div className="header">
                <span className="name">DPD</span>
                <span className="winrate">82% Win</span>
              </div>
              <p className="description">Down-Pause-Down. Pattern đảo chiều bullish khi thị trường oversold.</p>
              <div className="stats">
                <div className="stat">
                  <div className="stat-value">1:2.5</div>
                  <div className="stat-label">R:R</div>
                </div>
                <div className="stat">
                  <div className="stat-value">1,247</div>
                  <div className="stat-label">Trades</div>
                </div>
              </div>
            </div>
            <div className="pattern-card">
              <div className="header">
                <span className="name">UPU</span>
                <span className="winrate">79% Win</span>
              </div>
              <p className="description">Up-Pause-Up. Pattern tiếp diễn bullish với momentum mạnh.</p>
              <div className="stats">
                <div className="stat">
                  <div className="stat-value">1:2.2</div>
                  <div className="stat-label">R:R</div>
                </div>
                <div className="stat">
                  <div className="stat-value">1,089</div>
                  <div className="stat-label">Trades</div>
                </div>
              </div>
            </div>
            <div className="pattern-card">
              <div className="header">
                <span className="name">UPD</span>
                <span className="winrate">75% Win</span>
              </div>
              <p className="description">Up-Pause-Down. Pattern đảo chiều bearish từ vùng overbought.</p>
              <div className="stats">
                <div className="stat">
                  <div className="stat-value">1:2.0</div>
                  <div className="stat-label">R:R</div>
                </div>
                <div className="stat">
                  <div className="stat-value">892</div>
                  <div className="stat-label">Trades</div>
                </div>
              </div>
            </div>
            <div className="pattern-card">
              <div className="header">
                <span className="name">DPU</span>
                <span className="winrate">76% Win</span>
              </div>
              <p className="description">Down-Pause-Up. Pattern đảo chiều bullish với xác nhận rõ ràng.</p>
              <div className="stats">
                <div className="stat">
                  <div className="stat-value">1:2.3</div>
                  <div className="stat-label">R:R</div>
                </div>
                <div className="stat">
                  <div className="stat-value">756</div>
                  <div className="stat-label">Trades</div>
                </div>
              </div>
            </div>
            <div className="pattern-card">
              <div className="header">
                <span className="name">HFZ</span>
                <span className="winrate">71% Win</span>
              </div>
              <p className="description">High Frequency Zone. Vùng kháng cự mạnh với nhiều lần test.</p>
              <div className="stats">
                <div className="stat">
                  <div className="stat-value">1:1.8</div>
                  <div className="stat-label">R:R</div>
                </div>
                <div className="stat">
                  <div className="stat-value">623</div>
                  <div className="stat-label">Trades</div>
                </div>
              </div>
            </div>
            <div className="pattern-card">
              <div className="header">
                <span className="name">LFZ</span>
                <span className="winrate">73% Win</span>
              </div>
              <p className="description">Low Frequency Zone. Vùng hỗ trợ mạnh với base vững chắc.</p>
              <div className="stats">
                <div className="stat">
                  <div className="stat-value">1:1.9</div>
                  <div className="stat-label">R:R</div>
                </div>
                <div className="stat">
                  <div className="stat-value">589</div>
                  <div className="stat-label">Trades</div>
                </div>
              </div>
            </div>
          </div>

          <div className="paper-trade-box">
            <h3>🎮 Luyện Tập Với Paper Trading</h3>
            <p>
              Thực hành patterns với tiền ảo trước khi giao dịch thật.
              Theo dõi win rate và cải thiện kỹ năng mỗi ngày.
            </p>
          </div>

          <div className="method-steps">
            <div className="method-step">
              <div className="number">1</div>
              <h4>Xác Định Trend</h4>
              <p>Phân tích xu hướng thị trường trên timeframe lớn</p>
            </div>
            <div className="method-step">
              <div className="number">2</div>
              <h4>Tìm Zone</h4>
              <p>Xác định vùng HFZ/LFZ trên chart</p>
            </div>
            <div className="method-step">
              <div className="number">3</div>
              <h4>Chờ Pattern</h4>
              <p>Đợi pattern hình thành và xác nhận</p>
            </div>
            <div className="method-step">
              <div className="number">4</div>
              <h4>Entry Thông Minh</h4>
              <p>Vào lệnh với SL/TP rõ ràng</p>
            </div>
            <div className="method-step">
              <div className="number">5</div>
              <h4>Quản Lý Vốn</h4>
              <p>Risk 1-2% mỗi trade, không all-in</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 6: TIER COMPARISON ========== */}
      <section className="section-tiers section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <span>💎</span>
              BẢNG GIÁ
            </span>
            <h2 className="section-title">
              Chọn Gói <span className="text-gold">Phù Hợp</span>
            </h2>
          </div>

          <div className="tier-grid">
            <div className="tier-card">
              <div className="icon">🌱</div>
              <h3>Starter</h3>
              <div className="price">Miễn Phí</div>
              <div className="price-note">Mãi mãi</div>
              <ul className="features">
                <li><span className="check">✓</span> 5 scans/ngày</li>
                <li><span className="check">✓</span> 3 basic patterns</li>
                <li><span className="check">✓</span> 20 coins</li>
                <li><span className="check">✓</span> Paper trading</li>
                <li><span className="cross">✗</span> Telegram alerts</li>
              </ul>
              <a href="#waitlist" className="btn-secondary">Đăng Ký Free</a>
            </div>

            <div className="tier-card">
              <div className="icon">⚡</div>
              <h3>Tier 1</h3>
              <div className="price">10M VND</div>
              <div className="price-note">Một lần</div>
              <ul className="features">
                <li><span className="check">✓</span> Unlimited scans</li>
                <li><span className="check">✓</span> 6 patterns</li>
                <li><span className="check">✓</span> 50 coins</li>
                <li><span className="check">✓</span> Telegram alerts</li>
                <li><span className="check">✓</span> Khóa học cơ bản</li>
              </ul>
              <a href="#waitlist" className="btn-primary">Mua Ngay</a>
            </div>

            <div className="tier-card featured">
              <div className="icon">🚀</div>
              <h3>Tier 2</h3>
              <div className="price">38M VND</div>
              <div className="price-note">Một lần</div>
              <ul className="features">
                <li><span className="check">✓</span> All Tier 1</li>
                <li><span className="check">✓</span> 12+ patterns</li>
                <li><span className="check">✓</span> 100+ coins</li>
                <li><span className="check">✓</span> Multi-timeframe</li>
                <li><span className="check">✓</span> Khóa học nâng cao</li>
              </ul>
              <a href="#waitlist" className="btn-primary">Mua Ngay</a>
            </div>

            <div className="tier-card">
              <div className="icon">👑</div>
              <h3>Tier 3</h3>
              <div className="price">88M VND</div>
              <div className="price-note">Một lần</div>
              <ul className="features">
                <li><span className="check">✓</span> All Tier 2</li>
                <li><span className="check">✓</span> 24 patterns</li>
                <li><span className="check">✓</span> Priority support</li>
                <li><span className="check">✓</span> 1-on-1 coaching</li>
                <li><span className="check">✓</span> Lifetime access</li>
              </ul>
              <a href="#waitlist" className="btn-primary">Mua Ngay</a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 7: MINDSET COURSES ========== */}
      <section className="section-courses section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <span>🧠</span>
              KHÓA HỌC TƯ DUY
            </span>
            <h2 className="section-title">
              Chuyển Hóa <span className="text-purple">Từ Bên Trong</span>
            </h2>
            <p className="section-subtitle">
              Nâng cấp tư duy và năng lượng để đạt được mọi mục tiêu trong cuộc sống
            </p>
          </div>

          <div className="courses-grid">
            <div className="course-card">
              <div className="icon">✨</div>
              <h3>7-Day Transformation</h3>
              <p className="description">
                Khởi động hành trình chuyển hóa trong 7 ngày. Thanh lọc năng lượng,
                thiết lập mục tiêu và tạo thói quen mới.
              </p>
              <ul className="features">
                <li>7 bài học video HD</li>
                <li>Workbook & bài tập hàng ngày</li>
                <li>Meditation audio</li>
                <li>Community access</li>
              </ul>
            </div>
            <div className="course-card">
              <div className="icon">💕</div>
              <h3>Love Frequency</h3>
              <p className="description">
                Nâng cao tần số tình yêu và thu hút mối quan hệ lý tưởng.
                Chữa lành vết thương cũ và mở lòng đón nhận.
              </p>
              <ul className="features">
                <li>12 modules chuyên sâu</li>
                <li>Rituals & affirmations</li>
                <li>Healing sessions</li>
                <li>Dating strategies</li>
              </ul>
            </div>
            <div className="course-card">
              <div className="icon">💰</div>
              <h3>Millionaire Mindset</h3>
              <p className="description">
                Xây dựng tư duy triệu phú và quan hệ lành mạnh với tiền bạc.
                Loại bỏ niềm tin giới hạn về tài chính.
              </p>
              <ul className="features">
                <li>20+ video lessons</li>
                <li>Money blocks clearing</li>
                <li>Abundance rituals</li>
                <li>Investment basics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 9: PERSONAS ========== */}
      <section className="section-personas section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <span>👥</span>
              GEMRAL DÀNH CHO AI?
            </span>
            <h2 className="section-title">
              Tìm <span className="text-pink">Đúng Người</span>
            </h2>
          </div>

          <div className="persona-grid">
            <div className="persona-card">
              <div className="icon">📊</div>
              <h3>Gen Z Trader</h3>
              <p>Muốn có thu nhập thụ động từ crypto nhưng không biết bắt đầu từ đâu.</p>
              <span className="highlight">Scanner + Tier 1</span>
            </div>
            <div className="persona-card">
              <div className="icon">📈</div>
              <h3>Experienced Trader</h3>
              <p>Đã trade nhưng chưa có chiến lược rõ ràng, muốn nâng cao win rate.</p>
              <span className="highlight">Tier 2 + Method</span>
            </div>
            <div className="persona-card">
              <div className="icon">🔮</div>
              <h3>Spiritual Seeker</h3>
              <p>Tìm kiếm sự hướng dẫn tâm linh và muốn hiểu về bản mệnh.</p>
              <span className="highlight">GEM Master</span>
            </div>
            <div className="persona-card">
              <div className="icon">💕</div>
              <h3>Woman Seeking Love</h3>
              <p>Muốn thu hút tình yêu đích thực và xây dựng mối quan hệ lành mạnh.</p>
              <span className="highlight">Love Frequency</span>
            </div>
            <div className="persona-card">
              <div className="icon">🚀</div>
              <h3>Entrepreneur</h3>
              <p>Muốn phát triển tư duy làm giàu và tạo nguồn thu nhập mới.</p>
              <span className="highlight">Millionaire Mindset</span>
            </div>
            <div className="persona-card">
              <div className="icon">🧭</div>
              <h3>Lost Person</h3>
              <p>Đang lạc lõng, không biết mục đích sống. Cần sự hướng dẫn và định hướng.</p>
              <span className="highlight">7-Day Transform</span>
            </div>
            <div className="persona-card full-width">
              <div className="icon">💎</div>
              <h3>All-in-One</h3>
              <p>
                Muốn có tất cả - Trading + Tâm linh + Phát triển bản thân.
                Tier 3 là lựa chọn hoàn hảo với full access vĩnh viễn.
              </p>
              <span className="highlight">Tier 3 - Full Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 10: TESTIMONIALS ========== */}
      <section className="section-testimonials section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <span>⭐</span>
              ĐÁNH GIÁ
            </span>
            <h2 className="section-title">
              Học Viên <span className="text-gold">Nói Gì?</span>
            </h2>
          </div>

          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="header">
                <div className="avatar">🧑‍💼</div>
                <div className="info">
                  <h4>Minh Tuấn</h4>
                  <span className="role">Trader, HCM</span>
                </div>
              </div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="quote">
                "GEM Scanner giúp tôi tiết kiệm hàng giờ phân tích mỗi ngày.
                Win rate tăng từ 45% lên 72% sau 2 tháng sử dụng."
              </p>
              <span className="result">+120% Portfolio</span>
            </div>
            <div className="testimonial-card">
              <div className="header">
                <div className="avatar">👩</div>
                <div className="info">
                  <h4>Thảo Nguyên</h4>
                  <span className="role">Marketing Manager</span>
                </div>
              </div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="quote">
                "Love Frequency thay đổi hoàn toàn cách tôi nhìn nhận về tình yêu.
                3 tháng sau khóa học, tôi đã gặp được người ấy."
              </p>
              <span className="result">Found True Love</span>
            </div>
            <div className="testimonial-card">
              <div className="header">
                <div className="avatar">👨</div>
                <div className="info">
                  <h4>Hoàng Long</h4>
                  <span className="role">Entrepreneur</span>
                </div>
              </div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="quote">
                "Millionaire Mindset giúp tôi loại bỏ money blocks và tự tin
                hơn trong việc scale business. Revenue tăng 3x."
              </p>
              <span className="result">3x Revenue</span>
            </div>
            <div className="testimonial-card">
              <div className="header">
                <div className="avatar">👩‍🦰</div>
                <div className="info">
                  <h4>Linh Chi</h4>
                  <span className="role">Designer</span>
                </div>
              </div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="quote">
                "GEM Master Tarot cho tôi sự hướng dẫn mỗi ngày.
                Quyết định sáng suốt hơn và cuộc sống bình an hơn."
              </p>
              <span className="result">Inner Peace</span>
            </div>
          </div>

          <div className="video-cta">
            <h3>Xem Video Chia Sẻ Từ Học Viên</h3>
            <p>Nghe trực tiếp câu chuyện thành công từ cộng đồng GEMRAL</p>
            <a href="#videos" className="btn-primary">
              <span>▶️</span>
              Xem Video
            </a>
          </div>
        </div>
      </section>

      {/* ========== SECTION 11: PARTNERSHIP ========== */}
      <section className="section-partnership section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">
              <span>🤝</span>
              ĐỐI TÁC
            </span>
            <h2 className="section-title">
              Kiếm Tiền Cùng <span className="text-gold">GEMRAL</span>
            </h2>
            <p className="section-subtitle">
              3 cấp độ hợp tác với mức hoa hồng hấp dẫn
            </p>
          </div>

          <div className="partner-grid">
            <div className="partner-card">
              <div className="icon">👤</div>
              <h3>CTV (Affiliate)</h3>
              <p className="description">
                Chia sẻ link giới thiệu và nhận hoa hồng từ mỗi đơn hàng thành công.
              </p>
              <div className="commission">15-25%</div>
              <div className="commission-label">Hoa hồng</div>
            </div>
            <div className="partner-card">
              <div className="icon">🎤</div>
              <h3>KOL Partner</h3>
              <p className="description">
                Hợp tác content với mức commission cao hơn và hỗ trợ marketing.
              </p>
              <div className="commission">25-35%</div>
              <div className="commission-label">Hoa hồng</div>
            </div>
            <div className="partner-card">
              <div className="icon">🎓</div>
              <h3>Instructor</h3>
              <p className="description">
                Trở thành giảng viên, tạo khóa học riêng và chia sẻ doanh thu.
              </p>
              <div className="commission">40-60%</div>
              <div className="commission-label">Revenue Share</div>
            </div>
          </div>

          <div className="commission-table">
            <h3>Bảng Hoa Hồng CTV</h3>
            <table>
              <thead>
                <tr>
                  <th>Cấp Bậc</th>
                  <th>Doanh Số</th>
                  <th>Hoa Hồng</th>
                  <th>Bonus</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="tier-name">Bronze</td>
                  <td>0 - 50M</td>
                  <td className="rate">15%</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td className="tier-name">Silver</td>
                  <td>50M - 200M</td>
                  <td className="rate">18%</td>
                  <td>+2M</td>
                </tr>
                <tr>
                  <td className="tier-name">Gold</td>
                  <td>200M - 500M</td>
                  <td className="rate">20%</td>
                  <td>+5M</td>
                </tr>
                <tr>
                  <td className="tier-name">Platinum</td>
                  <td>500M - 1B</td>
                  <td className="rate">22%</td>
                  <td>+10M</td>
                </tr>
                <tr>
                  <td className="tier-name">Diamond</td>
                  <td>1B+</td>
                  <td className="rate">25%</td>
                  <td>+20M</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== SECTION 13: WAITLIST ========== */}
      <section className="section-waitlist section" id="waitlist">
        <div className="particles">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="particle" />
          ))}
        </div>

        <div className="container">
          <div className="waitlist-grid">
            {/* Left Column */}
            <div className="waitlist-content">
              <span className="section-badge" style={{ animation: 'pulse 2s infinite' }}>
                <span>⏰</span>
                Ưu Đãi Có Hạn
              </span>

              <h2>
                ĐĂNG KÝ NGAY<br/>
                <span className="text-gold">NHẬN ƯU ĐÃI ĐẶC BIỆT</span>
              </h2>

              <p className="subtitle">
                Gia nhập danh sách chờ để nhận quyền truy cập sớm vào hệ sinh thái GEMRAL
                cùng những ưu đãi độc quyền chỉ dành cho thành viên đăng ký trước ngày ra mắt.
              </p>

              <ul className="benefits-list">
                <li>
                  <div className="benefit-icon">📚</div>
                  <div className="benefit-text">
                    <strong>Giảm 5% Khóa Học Premium</strong>
                    <span>Áp dụng cho tất cả khóa học khi ra mắt chính thức trong 7 ngày đầu.</span>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">🔓</div>
                  <div className="benefit-text">
                    <strong>Truy Cập Scanner Sớm 14 Ngày</strong>
                    <span>Sử dụng GEM Scanner miễn phí trong 14 ngày trước khi tính phí.</span>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">👥</div>
                  <div className="benefit-text">
                    <strong>Tham Gia Nhóm Riêng VIP</strong>
                    <span>Kết nối trực tiếp với cộng đồng Early Birds và nhận hỗ trợ ưu tiên.</span>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">💎</div>
                  <div className="benefit-text">
                    <strong>Tặng Crystal Năng Lượng</strong>
                    <span>Nhận miễn phí 1 viên Crystal trị giá 200K cho 100 người đầu tiên.</span>
                  </div>
                </li>
              </ul>

              <div className="urgency-box">
                <div className="icon">⚠️</div>
                <div>
                  <strong>Chỉ còn {spotsRemaining} suất ưu đãi Crystal miễn phí!</strong>
                  <span>Ưu đãi tự động hết hạn khi đủ 100 người hoặc sau 7 ngày.</span>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="waitlist-form-wrapper">
              <div className="form-header">
                <h3>Đăng Ký <span className="text-gold">Waitlist</span></h3>
                <p>Hoàn tất form dưới đây để nhận ưu đãi Early Birds</p>
              </div>

              <form className="waitlist-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Họ và tên <span className="required">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="0912 345 678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Bạn quan tâm đến</label>
                  <div className="interest-checkbox-group">
                    {[
                      { value: 'trading', label: '📊 GEM Trading & Tín Hiệu Crypto' },
                      { value: 'spiritual', label: '🔮 GEM Master Sư Phụ AI' },
                      { value: 'courses', label: '📚 Khóa học chuyển hóa' },
                      { value: 'affiliate', label: '🤝 Cơ hội làm CTV/KOL' },
                    ].map(interest => (
                      <div
                        key={interest.value}
                        className={`interest-checkbox ${formData.interests.includes(interest.value) ? 'selected' : ''}`}
                        onClick={() => toggleInterest(interest.value)}
                      >
                        <span className="checkbox-text">{interest.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>⏳ Đang xử lý...</>
                  ) : (
                    <>✈️ Đăng Ký Nhận Ưu Đãi</>
                  )}
                </button>
              </form>

              <div className="form-footer">
                <p>🔒 Thông tin của bạn được bảo mật 100%</p>
                <div className="trust-badges">
                  <span className="trust-badge">🛡️ SSL Secured</span>
                  <span className="trust-badge">✅ GDPR Compliant</span>
                  <span className="trust-badge">🔒 Không Spam</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 14: FOOTER ========== */}
      <footer className="footer">
        <div className="footer-glow" />

        <div className="container">
          <div className="footer-main">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">💎</div>
                <span className="logo-text">GEMRAL</span>
              </div>
              <p className="footer-tagline">
                Hệ sinh thái kết hợp công nghệ hiện đại và trí tuệ phương Đông,
                giúp bạn nâng cao tần số cuộc sống.
              </p>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📺</a>
                <a href="#" className="social-link">🎵</a>
                <a href="#" className="social-link">📸</a>
                <a href="#" className="social-link">💬</a>
              </div>
            </div>

            {/* Products */}
            <div className="footer-column">
              <h4>Sản Phẩm</h4>
              <ul className="footer-links">
                <li><a href="#">GEM Scanner</a></li>
                <li><a href="#">GEM Master AI</a></li>
                <li><a href="#">Khóa Học Trading</a></li>
                <li><a href="#">Khóa Học Tư Duy</a></li>
                <li><a href="#">Crystal & Đá Năng Lượng</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="footer-column">
              <h4>Về GEMRAL</h4>
              <ul className="footer-links">
                <li><a href="#">Giới Thiệu</a></li>
                <li><a href="#">Đội Ngũ</a></li>
                <li><a href="#">Blog & Tin Tức</a></li>
                <li><a href="#">Partnership</a></li>
                <li><a href="#">Tuyển Dụng</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-column">
              <h4>Hỗ Trợ</h4>
              <ul className="footer-links">
                <li><a href="#">Trung Tâm Trợ Giúp</a></li>
                <li><a href="#">Hướng Dẫn Sử Dụng</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Liên Hệ</a></li>
                <li><a href="#">Báo Lỗi</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-column">
              <h4>Liên Hệ</h4>
              <div className="footer-contact-item">
                <div className="contact-icon">📧</div>
                <div className="contact-text">
                  <strong>Email</strong>
                  <a href="mailto:info@gemral.com">info@gemral.com</a>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-text">
                  <strong>Hotline</strong>
                  <span>0787 238 002</span>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="contact-icon">📍</div>
                <div className="contact-text">
                  <span>Công ty TNHH Gem Capital Holding</span>
                  <span>MST: 0319056208</span>
                </div>
              </div>

              <form className="newsletter-form">
                <div className="newsletter-input-group">
                  <input
                    type="email"
                    className="newsletter-input"
                    placeholder="Email của bạn"
                  />
                  <button type="submit" className="newsletter-btn">✈️</button>
                </div>
              </form>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">
            <div className="copyright">
              © 2025 <a href="https://gemral.com">GEMRAL</a>. Bảo lưu mọi quyền.
            </div>
            <div className="legal-links">
              <a href="#">Điều Khoản Sử Dụng</a>
              <a href="#">Chính Sách Bảo Mật</a>
              <a href="#">Chính Sách Hoàn Tiền</a>
            </div>
            <div className="payment-methods">
              <span className="payment-label">Thanh toán:</span>
              <div className="payment-icons">
                <span className="payment-icon">VISA</span>
                <span className="payment-icon">MC</span>
                <span className="payment-icon">MoMo</span>
                <span className="payment-icon">VNPay</span>
              </div>
            </div>
          </div>
        </div>

        <div className="disclaimer">
          <div className="container">
            <p className="disclaimer-text">
              <strong>Tuyên bố miễn trừ trách nhiệm:</strong>
              Giao dịch tiền điện tử có rủi ro cao và có thể không phù hợp với tất cả nhà đầu tư.
              Hiệu suất trong quá khứ không đảm bảo kết quả tương lai.
              Các thông tin trên website chỉ mang tính chất tham khảo, không phải là lời khuyên đầu tư.
            </p>
          </div>
        </div>
      </footer>

      {/* ========== FOMO WIDGETS ========== */}

      {/* Live Viewers Widget */}
      <div className="fomo-widget">
        <span className="pulse-dot" />
        <span>{liveViewers} người đang xem</span>
      </div>

      {/* Live Toast Notification */}
      {showToast && currentToast && (
        <div className="live-toast">
          <div className="avatar">{currentToast.avatar}</div>
          <div className="content">
            <div className="name">{currentToast.name}</div>
            <div className="action">{currentToast.action}</div>
          </div>
          <div className="time">Vừa xong</div>
        </div>
      )}

      {/* Back to Top */}
      <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Về đầu trang"
      >
        ⬆️
      </button>

    </div>
  );
}
