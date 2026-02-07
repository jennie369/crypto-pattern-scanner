import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, Clock, Gift, Users, Eye, ChevronUp, Send, Lock, Shield, CheckCircle,
  TrendingDown, Brain, Heart, Search, Zap, Target, DollarSign, AlertTriangle,
  BookOpen, Star, Sparkles, CreditCard, Phone, Mail, MapPin, ExternalLink,
  BarChart3, Layers, Activity, Timer, Bell, History, FileText, Gamepad2,
  Compass, Quote, Play, UserPlus, Mic, GraduationCap, Facebook, Youtube,
  Instagram, MessageCircle, ChevronRight, X, User, ArrowUp
} from 'lucide-react';
import './Landing.css';

// Supabase image URLs
const IMAGES = {
  hero: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767797226483_tq4kc1_gemral-landing-11.webp',
  painFinance: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767797396519_mkzpi0_gemral-landing-05.webp',
  painLife: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767797402692_ietkp7_gemral-landing-12.webp',
  gemMaster: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768132189654_7j0vh6_gemral-landing-07.webp',
  tarot: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768132275766_haheqd_gemral-landing-06.webp',
  kinhDich: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768132608964_4cgufu_gemral_20260111_185544_02.webp',
  marketAnalysis: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk857d2c-qftm5a/1768046652309_yyocqq_sec04-02.jpg.webp',
  visionBoard: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768132606257_kqq69q_gemral_20260111_185544_03.webp',
  scanner: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768146551404_ka1emz_1767797543898_k4efcq_gemral-landing-03.webp',
};

// Vietnamese names for toast notifications
const vietnameseNames = [
  'Nguyễn Văn A.', 'Trần Thị B.', 'Lê Văn C.', 'Phạm Thị D.', 'Hoàng Văn T.',
  'Nguyễn Thị P.', 'Trần Văn G.', 'Lê Thị H.', 'Phạm Văn T.', 'Hoàng Thị K.',
  'Vũ Văn L.', 'Đặng Thị M.', 'Bùi Văn N.', 'Đỗ Thị O.', 'Hồ Văn P.',
  'Thanh V.', 'Minh B.', 'Hải X.', 'Long D.', 'Hùng T.',
  'An từ HN', 'Bình từ SG', 'Châu từ ĐN', 'Dũng từ HP', 'Linh từ HCM'
];

const notificationActions = [
  { text: 'vừa đăng ký khóa học Trading Mastery', badge: 'Mới' },
  { text: 'vừa đăng ký vào Danh sách chờ', badge: 'Hot' },
  { text: 'vừa nhận ưu đãi Early Bird 10%', badge: 'Ưu đãi' },
  { text: 'vừa mua combo Scanner + Course', badge: 'VIP' },
  { text: 'vừa đăng ký dùng thử AI Scanner', badge: 'Free' },
  { text: 'vừa tham gia cộng đồng GEMRAL', badge: 'Mới' },
];

const timeAgoTexts = ['Vừa xong', '1 phút trước', '2 phút trước', '3 phút trước', '5 phút trước'];

export default function Landing() {
  // === STATE ===
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [spotsRemaining, setSpotsRemaining] = useState(47);
  const [liveViewers, setLiveViewers] = useState(47);
  const [todaySignups, setTodaySignups] = useState(23);
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

  // === COUNTDOWN TIMER - Fixed end date: Feb 17, 2026 ===
  useEffect(() => {
    const endTime = new Date(Date.UTC(2026, 1, 16, 17, 0, 0)).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = endTime - now;

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
        const change = Math.floor(Math.random() * 11) - 5;
        return Math.max(30, Math.min(80, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // === FOMO: SPOTS REMAINING ===
  useEffect(() => {
    const scheduleDecrease = () => {
      const delay = Math.floor(Math.random() * 60000) + 30000;
      return setTimeout(() => {
        setSpotsRemaining(prev => Math.max(12, prev - 1));
        scheduleDecrease();
      }, delay);
    };
    const timeout = scheduleDecrease();
    return () => clearTimeout(timeout);
  }, []);

  // === FOMO: TODAY SIGNUPS ===
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.4) {
        setTodaySignups(prev => prev + 1);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // === LIVE TOAST NOTIFICATIONS ===
  useEffect(() => {
    const showRandomToast = () => {
      const name = vietnameseNames[Math.floor(Math.random() * vietnameseNames.length)];
      const action = notificationActions[Math.floor(Math.random() * notificationActions.length)];
      const time = timeAgoTexts[Math.floor(Math.random() * timeAgoTexts.length)];

      setCurrentToast({ name, action: action.text, badge: action.badge, time });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    };

    const scheduleNotification = () => {
      const delay = Math.floor(Math.random() * 30000) + 15000;
      return setTimeout(() => {
        showRandomToast();
        scheduleNotification();
      }, delay);
    };

    const firstTimeout = setTimeout(showRandomToast, 3000);
    const recurringTimeout = scheduleNotification();

    return () => {
      clearTimeout(firstTimeout);
      clearTimeout(recurringTimeout);
    };
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

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
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
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm.');
    }, 2000);
  };

  // === RENDER ===
  return (
    <div className="landing-page">
      {/* ========== STICKY TOP BAR ========== */}
      <div className="sticky-top-bar">
        <span className="urgency-text">Ưu đãi Founder kết thúc:</span>
        <div className="countdown-mini">
          <div className="countdown-box">
            <span className="number">{String(countdown.days).padStart(2, '0')}</span>
            <span className="label">Ngày</span>
          </div>
          <div className="countdown-box">
            <span className="number">{String(countdown.hours).padStart(2, '0')}</span>
            <span className="label">Giờ</span>
          </div>
          <div className="countdown-box">
            <span className="number">{String(countdown.minutes).padStart(2, '0')}</span>
            <span className="label">Phút</span>
          </div>
          <div className="countdown-box">
            <span className="number">{String(countdown.seconds).padStart(2, '0')}</span>
            <span className="label">Giây</span>
          </div>
        </div>
        <button className="btn-cta-small" onClick={scrollToWaitlist}>Đăng ký</button>
      </div>

      {/* ========== TET ANNOUNCEMENT BAR ========== */}
      <div className="fomo-tet-announcement">
        <div className="fomo-tet-content">
          <Gift size={16} className="fomo-tet-icon" />
          <span className="fomo-tet-text">Đăng ký trước Tết Nguyên Đán giảm 99k với mã:</span>
          <span className="fomo-tet-code">TET99K</span>
          <span className="fomo-tet-text">→ Giảm ngay</span>
          <span className="fomo-tet-discount">99.000đ</span>
          <Sparkles size={16} className="fomo-tet-icon" />
        </div>
      </div>

      {/* ========== FOMO WIDGET STICKY ========== */}
      <div className="fomo-widget">
        <div className="fomo-icon">
          <Users size={40} strokeWidth={1.5} />
        </div>
        <p className="fomo-label">Còn lại</p>
        <p className="fomo-count"><span className="highlight">{spotsRemaining}</span> / 100</p>
        <div className="fomo-progress">
          <div className="fomo-progress-bar" style={{ width: `${(spotsRemaining / 100) * 100}%` }} />
        </div>
        <p className="fomo-warning">
          {spotsRemaining <= 15 ? <><Flame size={12} /> Gần hết chỗ!</> :
           spotsRemaining <= 30 ? <><Zap size={12} /> Đang giảm nhanh!</> :
           <><Sparkles size={12} /> Ưu đãi có hạn</>}
        </p>
        <button className="btn-fomo" onClick={scrollToWaitlist}>Giữ chỗ</button>
      </div>

      {/* ========== LIVE NOTIFICATION TOAST ========== */}
      {showToast && currentToast && (
        <div className="live-notification show">
          <button className="live-notification-close" onClick={() => setShowToast(false)}>
            <X size={12} />
          </button>
          <div className="live-notification-avatar">
            <User size={18} />
          </div>
          <div className="live-notification-content">
            <p className="live-notification-text">
              <strong>{currentToast.name}</strong> {currentToast.action}
            </p>
            <span className="live-notification-time">{currentToast.time}</span>
          </div>
          <span className="live-notification-badge">{currentToast.badge}</span>
        </div>
      )}

      {/* ========== SECTION 1: HERO ========== */}
      <section className="section-hero">
        <div className="container">
          <div className="hero-content">
            <span className="badge badge-burgundy pulse-glow">
              <MapPin size={14} /> Lần đầu tiên tại Việt Nam
            </span>

            <h1 className="hero-headline">
              TỰ DO TÀI CHÍNH<br />
              BẮT ĐẦU TỪ<br />
              <span className="gradient-text">TẦN SỐ ĐÚNG</span>
            </h1>

            <p className="hero-subheadline">
              <strong>Nền tảng khóa học trading & phát triển bản thân đầu tiên tại Việt Nam.</strong><br /><br />
              Tính năng nổi bật: <span className="text-cyan">AI Scanner</span> phát hiện pattern,
              <span className="text-gold"> GEM Master</span> chatbot thông minh,
              <span className="text-pink"> Tarot & Kinh Dịch</span>, Vision Board, và Khóa học trực tuyến.
            </p>

            <div className="live-viewers">
              <span className="live-dot" />
              <span><strong>{liveViewers}</strong> người đang xem trang này</span>
            </div>

            <div className="hook-box">
              <p className="hook-question">
                "Bạn đã bao giờ tự hỏi... tại sao một số người dường như luôn may mắn trong cả tình yêu lẫn tiền bạc, trong khi bạn cứ mãi chật vật dù đã cố gắng rất nhiều?"
              </p>
              <p className="hook-answer">
                Sự thật là... <strong>thành công không đến từ may mắn</strong>.
                Nó đến từ việc bạn có <span className="text-gold">ĐÚNG CÔNG CỤ</span> để đưa ra quyết định chính xác,
                và <span className="text-cyan">ĐÚNG TẦN SỐ</span> để thu hút những điều tốt đẹp vào cuộc sống.
                Và đó chính xác là lý do <strong>GEMRAL</strong> ra đời — để trao cho bạn cả hai thứ đó
                trong một nền tảng duy nhất.
              </p>
              <img src={IMAGES.hero} alt="GEMRAL Hero" className="hook-image" />
            </div>

            <div className="hero-stats-row">
              <div className="stat-item">
                <span className="stat-number text-gold">10,000+</span>
                <span className="stat-label">Người quan tâm</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number text-cyan">68-85%</span>
                <span className="stat-label">Win Rate Backtest</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number text-pink">5+ năm</span>
                <span className="stat-label">Data đã kiểm chứng</span>
              </div>
            </div>

            <div className="urgency-badge">
              <Flame size={16} /> <span>{todaySignups}</span> người đã đăng ký hôm nay
            </div>

            <div className="hero-cta-group">
              <button className="btn-primary pulse-glow" onClick={scrollToWaitlist}>
                <Send size={18} /> Đăng ký nhận ưu đãi Founder
              </button>
            </div>

            <div className="section-footer">gemral.com</div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: PAIN POINTS ========== */}
      <section className="section-pain">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              BẠN CÓ THẤY MÌNH<br />
              <span className="text-gold">TRONG NHỮNG DÒNG NÀY?</span>
            </h2>
            <p className="section-intro">
              "Bạn thu hút những gì bạn rung động, không phải những gì bạn muốn."
            </p>
          </div>

          <div className="pain-grid">
            {/* Column 1: Trading/Finance Pain */}
            <div className="pain-column">
              <h3 className="pain-category-title">
                <DollarSign size={24} />
                Trong tài chính & đầu tư
              </h3>

              <div className="pain-card">
                <div className="pain-icon"><AlertTriangle size={36} /></div>
                <h4>Tần số sợ hãi chi phối quyết định</h4>
                <p>
                  Bạn thấy Bitcoin tăng 20% trong một đêm, vội vàng mua vào ở đỉnh vì sợ bỏ lỡ.
                  Đó không phải quyết định từ lý trí — đó là Hình Tư Tưởng sợ hãi đang điều khiển bạn.
                </p>
                <div className="quote-box">
                  <p>"Trong thế nào, ngoài thế ấy" — Khi tâm bạn hoảng loạn, quyết định sẽ hoảng loạn.</p>
                </div>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><TrendingDown size={36} /></div>
                <h4>Vòng lặp "mua đỉnh bán đáy"</h4>
                <p>
                  Dù đã nghiên cứu kỹ lưỡng, bạn vẫn cứ mua là giảm, bán là tăng.
                  Đây không phải xui xẻo — đây là Hình Tư Tưởng "tôi không đủ giỏi" đang hoạt động như nam châm.
                </p>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><Clock size={36} /></div>
                <h4>Quá tải thông tin — Không có hệ thống</h4>
                <p>
                  Người này nói Long, người kia nói Short. Bạn bị nhấn chìm trong biển thông tin mâu thuẫn,
                  không biết đâu là sự thật. Vấn đề là bạn chưa có HỆ THỐNG rõ ràng.
                </p>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><DollarSign size={36} /></div>
                <h4>Tần số thiếu thốn tạo thiếu thốn</h4>
                <p>
                  Mỗi lần lo lắng về tiền, bạn đang phát ra tần số thiếu thốn và tạo thêm một Hình Tư Tưởng thu hút thiếu thốn.
                </p>
                <img src={IMAGES.painFinance} alt="Pain Finance" className="pain-image" />
              </div>
            </div>

            {/* Column 2: Life/Personal Pain */}
            <div className="pain-column">
              <h3 className="pain-category-title">
                <Heart size={24} />
                Trong cuộc sống & tinh thần
              </h3>

              <div className="pain-card">
                <div className="pain-icon"><Heart size={36} /></div>
                <h4>Thành công bên ngoài, trống rỗng bên trong</h4>
                <p>
                  Bạn có công việc ổn định, thu nhập khá, mọi thứ bên ngoài đều ổn...
                  nhưng sâu trong lòng có một khoảng trống. Đó là dấu hiệu bạn đang sống ở tầng tâm thức chỉ tập trung vào vật chất.
                </p>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><Search size={36} /></div>
                <h4>Mất phương hướng — Không biết mình muốn gì</h4>
                <p>
                  Bạn thức dậy mỗi sáng mà không có động lực, làm việc như một cỗ máy.
                  Đây là trạng thái "ngủ mê" — sống theo quán tính, không có ý thức.
                </p>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><Zap size={36} /></div>
                <h4>Cảm giác chưa đạt được tiềm năng thật sự</h4>
                <p>
                  Sâu trong thâm tâm, bạn biết mình có thể làm được nhiều hơn.
                  Nhưng có thứ gì đó kìm hãm — đó là những Hình Tư Tưởng giới hạn từ quá khứ.
                </p>
                <div className="quote-box">
                  <p>"Kiến thức không thay đổi cuộc đời. Hành động mới thay đổi."</p>
                </div>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><Compass size={36} /></div>
                <h4>Thiếu hệ thống hướng dẫn đáng tin cậy</h4>
                <p>
                  Bạn muốn hiểu bản thân sâu hơn, muốn có công cụ để đưa ra quyết định tốt hơn.
                  Bạn cần một lộ trình rõ ràng — không phải để ai đó nói cho bạn "tương lai",
                  mà để bạn tự HIỂU mình và CHỌN tương lai của chính mình.
                </p>
                <img src={IMAGES.painLife} alt="Pain Life" className="pain-image" />
              </div>
            </div>
          </div>

          <div className="transition-box">
            <p className="transition-text">
              Nếu bạn gật đầu với bất kỳ điều nào ở trên...
            </p>
            <p className="transition-highlight text-gold">
              GEMRAL là hành trình chuyển hóa dành cho bạn.
            </p>
            <p className="transition-subtext">
              Không phải để "sửa" bạn — vì bạn không hỏng. Mà để giúp bạn nhận diện tần số,
              phá vỡ Hình Tư Tưởng cũ, và tạo Hình Tư Tưởng mới phù hợp với cuộc đời bạn muốn sống.
            </p>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 3: GEM MASTER ========== */}
      <section className="section-master">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple">
              <Sparkles size={14} /> Công cụ Giải Mã Tần Số
            </span>
            <h2 className="section-title">
              <span className="text-gold">GEM MASTER</span>
            </h2>
            <p className="section-subtitle">Người bạn đồng hành trên hành trình Chuyển Hóa Nội Tâm</p>
            <p className="section-intro">
              GEM Master không nói cho bạn "tương lai" — vì tương lai là thứ bạn KIẾN TẠO.
              Đây là công cụ giúp bạn giải mã tần số hiện tại, nhận diện Hình Tư Tưởng đang chi phối,
              và có ý thức tạo ra Hình Tư Tưởng mới phù hợp với cuộc đời bạn muốn sống.
            </p>
          </div>

          <img src={IMAGES.gemMaster} alt="GEM Master" className="section-hero-image" />

          <div className="features-grid">
            <div className="feature-card">
              <div className="card-icon">
                <Layers size={36} />
              </div>
              <img src={IMAGES.tarot} alt="Tarot" className="feature-image" />
              <h3>Rút Tarot 3 Lá</h3>
              <p>
                Công cụ giải mã tần số giúp bạn nhìn thấy những pattern năng lượng đang diễn ra
                trong cuộc sống — không phải để "đoán" tương lai, mà để HIỂU hiện tại.
              </p>
              <ul className="feature-list">
                <li>Nhận diện tần số đang phát ra</li>
                <li>Phân tích Quá khứ - Hiện tại - Tương lai</li>
                <li>Hướng dẫn hành động từ tần số cao</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <Activity size={36} />
              </div>
              <img src={IMAGES.kinhDich} alt="Kinh Dịch" className="feature-image" />
              <h3>Gieo Quẻ Kinh Dịch</h3>
              <p>
                Tiếp cận trí tuệ cổ nhân hàng nghìn năm để hiểu quy luật vận hành của năng lượng,
                vị trí của bạn trong dòng chảy đó, và hành động phù hợp với tần số hiện tại.
              </p>
              <ul className="feature-list">
                <li>64 quẻ dịch với giải thích sâu</li>
                <li>Hiểu quy luật Âm - Dương - Ngũ Hành</li>
                <li>Lời khuyên theo triết lý phương Đông</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <BarChart3 size={36} />
              </div>
              <img src={IMAGES.marketAnalysis} alt="Market Analysis" className="feature-image" />
              <h3>Phân Tích Thị Trường Mới Nhất</h3>
              <p>
                Phân tích nhanh các tin tức thị trường mới nhất, giúp bạn nắm bắt xu hướng và ra quyết định kịp thời.
              </p>
              <ul className="feature-list">
                <li>Biến thông tin thành lợi thế giao dịch</li>
                <li>Lọc nhiễu thông tin để chỉ giữ lại tín hiệu có giá trị</li>
                <li>Súc tích và đúng trọng tâm</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <Target size={36} />
              </div>
              <img src={IMAGES.visionBoard} alt="Vision Board" className="feature-image" />
              <h3>Vision Board</h3>
              <p>
                Công cụ tạo Hình Tư Tưởng có ý thức. Bạn không chỉ "ước mơ" — bạn đang chủ động
                kiến tạo trường năng lượng cho những gì bạn muốn thu hút vào cuộc sống.
              </p>
              <ul className="feature-list">
                <li>Tạo Hình Tư Tưởng mới có ý thức</li>
                <li>Chia nhỏ mục tiêu thành bước cụ thể</li>
                <li>Theo dõi tiến độ chuyển hóa</li>
              </ul>
            </div>
          </div>

          <div className="free-banner">
            <span className="badge badge-green">
              <Gift size={14} /> Trải Nghiệm Miễn Phí
            </span>
            <h3 className="text-gold">Bắt đầu hành trình chuyển hóa ngay hôm nay</h3>
            <p>
              GEM Master không thay thế sự thực hành của bạn — nó là CÔNG CỤ hỗ trợ trên hành trình.
              Đăng ký waitlist để nhận <span className="text-cyan">5 lượt trải nghiệm miễn phí mỗi ngày</span>
              khi app ra mắt. Trải nghiệm trước, quyết định sau.
            </p>
            <p className="banner-quote">
              "Thế giới không thiếu kiến thức. Thế giới thiếu người SỐNG kiến thức." — Học Thuyết Chuyển Hóa Nội Tâm
            </p>
            <button className="btn-primary" onClick={scrollToWaitlist}>
              <Send size={18} /> Đăng ký trải nghiệm GEM Master
            </button>

            <div className="testimonial-mini">
              <blockquote>
                "GEM Master giúp tôi nhận ra những Hình Tư Tưởng đang chi phối mình.
                Từ đó tôi có ý thức hơn trong mỗi quyết định, không còn hành động từ sợ hãi nữa."
              </blockquote>
              <cite>— Thu Hương, Chủ shop online TPHCM</cite>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 4: GEM SCANNER ========== */}
      <section className="section-scanner">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-green">
              <BarChart3 size={14} /> Công Cụ Phân Tích Tần Số Thị Trường
            </span>
            <div className="exclusive-tag">
              <MapPin size={12} /> ĐỘC QUYỀN TẠI VIỆT NAM
            </div>
            <h2 className="section-title">
              <span className="text-gold">GEM SCANNER</span>
            </h2>
            <p className="section-subtitle">
              Scanner tự động phát hiện <strong>6 công thức tần số độc quyền của Gem Trading</strong> —
              duy nhất tại Việt Nam. Giúp bạn đưa ra quyết định từ dữ liệu thay vì cảm xúc.
            </p>
          </div>

          <div className="scanner-preview">
            <div className="preview-header">
              <div className="preview-title">
                <BarChart3 size={24} />
                GEM Pattern Scanner Interface
              </div>
              <div className="confidence-badge">Confidence: 89.7%</div>
            </div>
            <img src={IMAGES.scanner} alt="GEM Scanner" className="scanner-image" />
          </div>

          <div className="scanner-features-grid">
            <div className="scanner-feature-card">
              <div className="card-icon">
                <Search size={36} />
              </div>
              <h3>Quét Tự Động 24/7</h3>
              <p>
                Scanner hoạt động không ngừng nghỉ, phân tích hàng trăm cặp coin mỗi giờ
                để tìm ra những setup có xác suất cao nhất.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <Target size={36} />
              </div>
              <h3>6 Pattern Độc Quyền</h3>
              <p>
                Phát hiện tự động <strong>6 công thức Frequency độc quyền của Gem Trading</strong>,
                duy nhất tại Việt Nam. Đã được backtest qua 5 năm dữ liệu.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <BarChart3 size={36} />
              </div>
              <h3>Entry / Stop / Target</h3>
              <p>
                Không còn phải đoán mò. Mỗi signal đều đi kèm điểm Entry chính xác,
                Stop Loss để bảo vệ vốn, và Take Profit targets theo từng mức.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <Gamepad2 size={36} />
              </div>
              <h3>Paper Trading</h3>
              <p>
                Thực hành giao dịch với tiền ảo trước khi dùng tiền thật.
                Luyện tập không giới hạn, hoàn toàn miễn phí, không rủi ro.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <Bell size={36} />
              </div>
              <h3>Thông Báo Real-time</h3>
              <p>
                Nhận alert ngay lập tức khi có pattern mới xuất hiện qua Telegram hoặc app.
                Bạn có thể đang làm việc khác mà vẫn không bỏ lỡ cơ hội.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <History size={36} />
              </div>
              <h3>Backtest 5+ Năm Data</h3>
              <p>
                Tất cả công thức đều được kiểm chứng qua hơn 5 năm dữ liệu lịch sử
                với hàng nghìn giao dịch. Đây là kết quả thực tế đã được chứng minh.
              </p>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-number text-cyan">68-85%</span>
              <span className="stat-label">Win Rate Backtest</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-gold">6</span>
              <span className="stat-label">Pattern Độc Quyền</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-pink">500+</span>
              <span className="stat-label">Cặp Coin Theo Dõi</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-cyan">24/7</span>
              <span className="stat-label">Hoạt Động Liên Tục</span>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 13: WAITLIST ========== */}
      <section className="section-waitlist" id="waitlist">
        <div className="particles">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="particle" />
          ))}
        </div>

        <div className="container">
          <div className="waitlist-grid">
            {/* Left Column */}
            <div className="waitlist-content">
              <span className="badge badge-urgency">
                <Clock size={14} /> Ưu Đãi Có Hạn
              </span>

              <h2 className="waitlist-title">
                ĐĂNG KÝ NGAY<br />
                <span className="text-gold">NHẬN ƯU ĐÃI ĐẶC BIỆT</span>
              </h2>

              <p className="waitlist-subtitle">
                Gia nhập danh sách chờ để nhận quyền truy cập sớm vào hệ sinh thái GEMRAL
                cùng những ưu đãi độc quyền chỉ dành cho thành viên đăng ký trước ngày ra mắt.
              </p>

              <ul className="benefits-list">
                <li>
                  <div className="benefit-icon">
                    <BookOpen size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>Giảm 5% Khóa Học Premium</strong>
                    <span>Áp dụng cho tất cả khóa học khi ra mắt chính thức trong 7 ngày đầu.</span>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">
                    <Lock size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>Truy Cập Scanner Sớm 14 Ngày</strong>
                    <span>Sử dụng GEM Scanner miễn phí trong 14 ngày trước khi tính phí.</span>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">
                    <Users size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>Tham Gia Nhóm Riêng VIP</strong>
                    <span>Kết nối trực tiếp với cộng đồng Early Birds và nhận hỗ trợ ưu tiên.</span>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">
                    <Star size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>Tặng Crystal Năng Lượng</strong>
                    <span>Nhận miễn phí 1 viên Crystal trị giá 200K cho 100 người đầu tiên.</span>
                  </div>
                </li>
              </ul>

              <div className="urgency-box">
                <div className="urgency-icon">
                  <AlertTriangle size={26} />
                </div>
                <div className="urgency-text">
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
                  <div className="input-wrapper">
                    <User size={20} />
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
                </div>

                <div className="form-group">
                  <label>Số điện thoại <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <Phone size={20} />
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
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <Mail size={20} />
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Bạn quan tâm đến</label>
                  <div className="interest-checkbox-group">
                    {[
                      { value: 'trading', label: 'GEM Trading & Tín Hiệu Crypto', icon: BarChart3 },
                      { value: 'spiritual', label: 'GEM Master Sư Phụ AI', icon: Sparkles },
                      { value: 'courses', label: 'Khóa học chuyển hóa', icon: BookOpen },
                      { value: 'affiliate', label: 'Cơ hội làm CTV/KOL', icon: Users },
                    ].map(interest => (
                      <div
                        key={interest.value}
                        className={`interest-checkbox ${formData.interests.includes(interest.value) ? 'selected' : ''}`}
                        onClick={() => toggleInterest(interest.value)}
                      >
                        <span className="checkbox-custom">
                          {formData.interests.includes(interest.value) && <CheckCircle size={14} />}
                        </span>
                        <interest.icon size={16} />
                        <span className="checkbox-text">{interest.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Clock size={18} className="spin" /> Đang xử lý...</>
                  ) : (
                    <><Send size={18} /> Đăng Ký Nhận Ưu Đãi</>
                  )}
                </button>
              </form>

              <div className="form-footer">
                <p><Lock size={14} /> Thông tin của bạn được bảo mật 100%</p>
                <div className="trust-badges">
                  <span className="trust-badge"><Shield size={14} /> SSL Secured</span>
                  <span className="trust-badge"><CheckCircle size={14} /> GDPR Compliant</span>
                  <span className="trust-badge"><Lock size={14} /> Không Spam</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
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
                <div className="logo-icon">
                  <Sparkles size={28} />
                </div>
                <span className="logo-text">GEMRAL</span>
              </div>
              <p className="footer-tagline">
                Hệ sinh thái kết hợp công nghệ hiện đại và trí tuệ phương Đông,
                giúp bạn nâng cao tần số cuộc sống.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="social-link" aria-label="YouTube">
                  <Youtube size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Zalo">
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>

            {/* Products */}
            <div className="footer-column">
              <h4>Sản Phẩm</h4>
              <ul className="footer-links">
                <li><a href="#">GEM Scanner <ChevronRight size={14} /></a></li>
                <li><a href="#">GEM Master AI <ChevronRight size={14} /></a></li>
                <li><a href="#">Khóa Học Trading <ChevronRight size={14} /></a></li>
                <li><a href="#">Khóa Học Tư Duy <ChevronRight size={14} /></a></li>
                <li><a href="#">Crystal & Đá Năng Lượng <ChevronRight size={14} /></a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="footer-column">
              <h4>Về GEMRAL</h4>
              <ul className="footer-links">
                <li><a href="#">Giới Thiệu <ChevronRight size={14} /></a></li>
                <li><a href="#">Đội Ngũ <ChevronRight size={14} /></a></li>
                <li><a href="#">Blog & Tin Tức <ChevronRight size={14} /></a></li>
                <li><a href="#">Partnership <ChevronRight size={14} /></a></li>
                <li><a href="#">Tuyển Dụng <ChevronRight size={14} /></a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-column">
              <h4>Hỗ Trợ</h4>
              <ul className="footer-links">
                <li><a href="#">Trung Tâm Trợ Giúp <ChevronRight size={14} /></a></li>
                <li><a href="#">Hướng Dẫn Sử Dụng <ChevronRight size={14} /></a></li>
                <li><a href="#">FAQ <ChevronRight size={14} /></a></li>
                <li><a href="#">Liên Hệ <ChevronRight size={14} /></a></li>
                <li><a href="#">Báo Lỗi <ChevronRight size={14} /></a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-column">
              <h4>Liên Hệ</h4>
              <div className="footer-contact-item">
                <div className="contact-icon"><Mail size={18} /></div>
                <div className="contact-text">
                  <strong>Email</strong>
                  <a href="mailto:info@gemral.com">info@gemral.com</a>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="contact-icon"><Phone size={18} /></div>
                <div className="contact-text">
                  <strong>Hotline</strong>
                  <span>0787 238 002</span>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="contact-icon"><MapPin size={18} /></div>
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
                  <button type="submit" className="newsletter-btn">
                    <Send size={18} />
                  </button>
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

      {/* ========== BACK TO TOP ========== */}
      <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Về đầu trang"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}
