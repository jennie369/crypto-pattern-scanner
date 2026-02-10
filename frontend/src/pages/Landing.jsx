import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, Clock, Gift, Users, Eye, ChevronUp, Send, Lock, Shield, CheckCircle,
  TrendingDown, Brain, Heart, Search, Zap, Target, DollarSign, AlertTriangle,
  BookOpen, Star, Sparkles, CreditCard, Phone, Mail, MapPin, ExternalLink,
  BarChart3, Layers, Activity, Timer, Bell, History, FileText, Gamepad2,
  Compass, Quote, Play, UserPlus, Mic, GraduationCap, Facebook, Youtube,
  Instagram, MessageCircle, ChevronRight, X, User, ArrowUp, TrendingUp,
  CircleX, ShoppingBag, Award, Briefcase, Globe, Info, Smile, LogIn, Menu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
  // New images for additional sections
  frequencyMethod: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767797580694_rbmj5h_gemral-landing-08.webp',
  coursesMindset: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767798515858_kz5dz0_gemral-landing-050.webp',
  coursesTrading1: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767798566073_pwkp5z_gemral-landing-040.webp',
  coursesTrading2: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767798635167_0cdgtd_gemral-landing-13.webp',
  personas: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768147893451_0cuqpi_gemral-landing-01.webp',
  testimonials: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767798880233_rzsx99_gemral-landing-10.webp',
  partnership: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767799236693_odlylc_gemral-landing-02.jpg',
  // Testimonial avatars
  testimonial1: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768156652185_flnht6_gemral_20260112_003909_01.webp',
  testimonial2: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768156549499_fm3fa3_gemral_20260112_003909_03.webp',
  testimonial3: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768156653321_fxov0z_gemral_20260112_003909_04.webp',
  testimonial4: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768156656914_9s92k8_gemral_20260112_003909_02.webp',
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
  const { user } = useAuth();
  // === STATE ===
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [spotsRemaining, setSpotsRemaining] = useState(47);
  const [liveViewers, setLiveViewers] = useState(47);
  const [todaySignups, setTodaySignups] = useState(23);
  const [showToast, setShowToast] = useState(false);
  const [currentToast, setCurrentToast] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

      {/* ========== MAIN NAVIGATION BAR ========== */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-nav-logo">
            <Sparkles size={20} />
            <span>GEMRAL</span>
          </Link>

          <div className={`landing-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <Link to="/courses" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <GraduationCap size={16} /> Khóa Học
            </Link>
            <Link to="/shop" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <ShoppingBag size={16} /> Cửa Hàng
            </Link>
            <Link to="/pricing" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <CreditCard size={16} /> Bảng Giá
            </Link>
            <Link to="/forum" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <MessageCircle size={16} /> Cộng Đồng
            </Link>

            {user ? (
              <>
                <Link to="/scanner-v2" className="landing-nav-link highlight" onClick={() => setMobileMenuOpen(false)}>
                  <BarChart3 size={16} /> Scanner
                </Link>
                <Link to="/chatbot" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <Compass size={16} /> GEM Master
                </Link>
                <Link to="/scanner-v2" className="landing-nav-btn primary" onClick={() => setMobileMenuOpen(false)}>
                  <Activity size={16} /> Vào App
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="landing-nav-btn secondary" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn size={16} /> Đăng Nhập
                </Link>
                <Link to="/signup" className="landing-nav-btn primary" onClick={() => setMobileMenuOpen(false)}>
                  <UserPlus size={16} /> Đăng Ký
                </Link>
              </>
            )}
          </div>

          <button className="landing-nav-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

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

      {/* ========== SECTION 5: FREQUENCY METHOD ========== */}
      <section className="section-patterns">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-cyan">
              <Layers size={14} /> Phương Pháp Độc Quyền
            </span>
            <h2 className="section-title">
              <span className="text-gold">GEM FREQUENCY METHOD</span>
            </h2>
            <p className="section-subtitle">
              6 công thức pattern độc quyền được phát triển và backtest qua 5+ năm data —
              giúp bạn nhận diện cơ hội với xác suất thắng cao.
            </p>
          </div>

          <div className="patterns-grid">
            {/* Pattern Cards */}
            <div className="pattern-card bullish">
              <div className="pattern-header">
                <TrendingUp size={24} />
                <span className="pattern-label">BULLISH</span>
              </div>
              <h3 className="pattern-name">DPD Pattern</h3>
              <p className="pattern-desc">Down-Pivot-Down: Đảo chiều tăng mạnh khi giá retest vùng HFZ</p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Win Rate</span><span className="value text-green">78%</span></div>
                <div className="stat"><span className="label">R:R</span><span className="value text-cyan">1:2.5</span></div>
              </div>
            </div>

            <div className="pattern-card bullish">
              <div className="pattern-header">
                <TrendingUp size={24} />
                <span className="pattern-label">BULLISH</span>
              </div>
              <h3 className="pattern-name">UPU Pattern</h3>
              <p className="pattern-desc">Up-Pivot-Up: Tiếp diễn xu hướng tăng sau pullback về vùng LFZ</p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Win Rate</span><span className="value text-green">72%</span></div>
                <div className="stat"><span className="label">R:R</span><span className="value text-cyan">1:2.0</span></div>
              </div>
            </div>

            <div className="pattern-card bearish">
              <div className="pattern-header">
                <TrendingDown size={24} />
                <span className="pattern-label">BEARISH</span>
              </div>
              <h3 className="pattern-name">UPD Pattern</h3>
              <p className="pattern-desc">Up-Pivot-Down: Đảo chiều giảm mạnh khi giá retest vùng HFZ từ dưới lên</p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Win Rate</span><span className="value text-green">75%</span></div>
                <div className="stat"><span className="label">R:R</span><span className="value text-cyan">1:2.3</span></div>
              </div>
            </div>

            <div className="pattern-card bearish">
              <div className="pattern-header">
                <TrendingDown size={24} />
                <span className="pattern-label">BEARISH</span>
              </div>
              <h3 className="pattern-name">DPU Pattern</h3>
              <p className="pattern-desc">Down-Pivot-Up: Tiếp diễn xu hướng giảm sau pullback lên vùng LFZ</p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Win Rate</span><span className="value text-green">70%</span></div>
                <div className="stat"><span className="label">R:R</span><span className="value text-cyan">1:2.0</span></div>
              </div>
            </div>

            <div className="pattern-card zone">
              <div className="pattern-header">
                <Layers size={24} />
                <span className="pattern-label">ZONE</span>
              </div>
              <h3 className="pattern-name">HFZ - High Frequency Zone</h3>
              <p className="pattern-desc">Vùng kháng cự mạnh - Nơi giá thường đảo chiều hoặc bị chặn lại</p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Accuracy</span><span className="value text-green">85%</span></div>
                <div className="stat"><span className="label">Touch</span><span className="value text-cyan">2-3x</span></div>
              </div>
            </div>

            <div className="pattern-card zone">
              <div className="pattern-header">
                <Layers size={24} />
                <span className="pattern-label">ZONE</span>
              </div>
              <h3 className="pattern-name">LFZ - Low Frequency Zone</h3>
              <p className="pattern-desc">Vùng hỗ trợ mạnh - Nơi giá thường bật lên hoặc tích lũy</p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Accuracy</span><span className="value text-green">82%</span></div>
                <div className="stat"><span className="label">Touch</span><span className="value text-cyan">2-3x</span></div>
              </div>
            </div>
          </div>

          <div className="paper-trading-box">
            <Gamepad2 size={28} />
            <div className="paper-trading-content">
              <h4>Paper Trading - Luyện Tập Không Rủi Ro</h4>
              <p>Thực hành giao dịch với tiền ảo trước khi dùng tiền thật. Luyện tập không giới hạn, hoàn toàn miễn phí.</p>
            </div>
          </div>

          <div className="method-box">
            <h4 className="text-gold">Quy Trình 5 Bước</h4>
            <div className="method-steps">
              <div className="step"><span className="step-num">1</span><span>Xác định xu hướng chính</span></div>
              <div className="step"><span className="step-num">2</span><span>Tìm vùng HFZ/LFZ</span></div>
              <div className="step"><span className="step-num">3</span><span>Chờ pattern hình thành</span></div>
              <div className="step"><span className="step-num">4</span><span>Xác nhận bằng nến</span></div>
              <div className="step"><span className="step-num">5</span><span>Vào lệnh với SL/TP rõ ràng</span></div>
            </div>
          </div>

          <img src={IMAGES.frequencyMethod} alt="Frequency Method" className="section-hero-image" />

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 6: TIER COMPARISON ========== */}
      <section className="section-pricing">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">
              <Star size={14} /> Bảng Giá Khóa Học
            </span>
            <h2 className="section-title">
              CHỌN GÓI PHÙ HỢP<br />
              <span className="text-gold">VỚI BẠN</span>
            </h2>
          </div>

          {/* Trading Courses */}
          <h3 className="pricing-category-title text-cyan">Khóa Học Trading</h3>
          <div className="pricing-grid">
            <div className="pricing-card">
              <span className="card-badge free-badge">Miễn Phí</span>
              <h4>Starter</h4>
              <div className="price"><span className="amount">299K</span></div>
              <p className="price-note">Truy cập cơ bản</p>
              <ul className="pricing-features">
                <li><CheckCircle size={14} /> 5 bài học cơ bản</li>
                <li><CheckCircle size={14} /> Paper Trading</li>
                <li><CircleX size={14} className="text-red" /> Không có Scanner</li>
              </ul>
              <button className="btn-pricing" onClick={scrollToWaitlist}>Đăng Ký</button>
            </div>

            <div className="pricing-card popular">
              <span className="card-badge popular-badge">Phổ Biến</span>
              <h4>Tier 1</h4>
              <div className="price"><span className="amount">11M</span></div>
              <p className="price-note">Trọn bộ cơ bản</p>
              <ul className="pricing-features">
                <li><CheckCircle size={14} /> Toàn bộ video Tier 1</li>
                <li><CheckCircle size={14} /> Scanner 3 tháng</li>
                <li><CheckCircle size={14} /> Nhóm hỗ trợ</li>
              </ul>
              <button className="btn-pricing primary" onClick={scrollToWaitlist}>Đăng Ký</button>
            </div>

            <div className="pricing-card">
              <span className="card-badge best-badge">Tốt Nhất</span>
              <h4>Tier 2</h4>
              <div className="price"><span className="amount">21M</span></div>
              <p className="price-note">Nâng cao chuyên sâu</p>
              <ul className="pricing-features">
                <li><CheckCircle size={14} /> Toàn bộ Tier 1 + 2</li>
                <li><CheckCircle size={14} /> Scanner 6 tháng</li>
                <li><CheckCircle size={14} /> 1:1 Mentoring</li>
              </ul>
              <button className="btn-pricing" onClick={scrollToWaitlist}>Đăng Ký</button>
            </div>

            <div className="pricing-card vip">
              <span className="card-badge vip-badge">VIP</span>
              <h4>Tier 3</h4>
              <div className="price"><span className="amount">68M</span></div>
              <p className="price-note">Full Access Lifetime</p>
              <ul className="pricing-features">
                <li><CheckCircle size={14} /> Tất cả Tier 1, 2, 3</li>
                <li><CheckCircle size={14} /> Scanner Lifetime</li>
                <li><CheckCircle size={14} /> Private 1:1 Jennie</li>
                <li><CheckCircle size={14} /> Crystal Tặng Kèm</li>
              </ul>
              <button className="btn-pricing vip" onClick={scrollToWaitlist}>Liên Hệ</button>
            </div>
          </div>

          {/* Mindset Courses */}
          <h3 className="pricing-category-title text-pink" style={{marginTop: '60px'}}>Khóa Học Mindset</h3>
          <div className="pricing-grid three-cols">
            <div className="pricing-card">
              <h4>7 Ngày Chuyển Hóa</h4>
              <div className="price"><span className="amount">1.99M</span></div>
              <p className="price-note">Hành trình 7 ngày</p>
              <ul className="pricing-features">
                <li><CheckCircle size={14} /> 7 ngày thực hành</li>
                <li><CheckCircle size={14} /> Thiền định + Journaling</li>
                <li><CheckCircle size={14} /> Nhóm đồng hành</li>
              </ul>
              <button className="btn-pricing" onClick={scrollToWaitlist}>Đăng Ký</button>
            </div>

            <div className="pricing-card featured">
              <span className="card-badge popular-badge">Hot</span>
              <h4>Tần Số Tình Yêu</h4>
              <div className="price"><span className="amount">399K</span></div>
              <p className="price-note">Thu hút tình yêu</p>
              <ul className="pricing-features">
                <li><CheckCircle size={14} /> Chữa lành vết thương tình cảm</li>
                <li><CheckCircle size={14} /> Nâng cao tần số tình yêu</li>
                <li><CheckCircle size={14} /> Thiền định chuyên biệt</li>
              </ul>
              <button className="btn-pricing primary" onClick={scrollToWaitlist}>Đăng Ký</button>
            </div>

            <div className="pricing-card">
              <h4>Tư Duy Triệu Phú</h4>
              <div className="price"><span className="amount">499K</span></div>
              <p className="price-note">Tư duy thịnh vượng</p>
              <ul className="pricing-features">
                <li><CheckCircle size={14} /> Phá vỡ niềm tin giới hạn</li>
                <li><CheckCircle size={14} /> Xây dựng mindset thịnh vượng</li>
                <li><CheckCircle size={14} /> Hành động thực tế</li>
              </ul>
              <button className="btn-pricing" onClick={scrollToWaitlist}>Đăng Ký</button>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 7: COURSES MINDSET ========== */}
      <section className="section-courses-mindset">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-pink">
              <Heart size={14} /> Khóa Học Chuyển Hóa
            </span>
            <h2 className="section-title">
              NÂNG CAO TẦN SỐ<br />
              <span className="text-pink">TỪ BÊN TRONG</span>
            </h2>
            <p className="section-subtitle">
              Ba khóa học chuyển hóa nội tâm giúp bạn giải phóng những Hình Tư Tưởng cũ,
              nâng cao tần số và thu hút cuộc sống bạn xứng đáng.
            </p>
          </div>

          <div className="intro-quote-box">
            <Quote size={32} className="quote-icon" />
            <blockquote>
              "Tôi đã trải qua hành trình chuyển hóa từ một người luôn sống trong sợ hãi và thiếu thốn,
              đến việc xây dựng cuộc sống thịnh vượng cả về tài chính lẫn tinh thần.
              Giờ đây tôi muốn chia sẻ những công cụ đã giúp tôi với bạn."
            </blockquote>
            <cite>— Jennie Uyên Chu, Founder GEMRAL</cite>
          </div>

          <div className="mindset-courses-grid">
            <div className="mindset-course-card">
              <h4>7 Ngày Chuyển Hóa Tần Số Gốc</h4>
              <p>Hành trình 7 ngày thực hành để nhận diện và giải phóng những Hình Tư Tưởng đang giới hạn bạn.</p>
              <div className="price-box">
                <span className="original-price">2.990.000đ</span>
                <span className="current-price">1.990.000đ</span>
              </div>
              <ul className="course-features">
                <li><CheckCircle size={14} /> 7 ngày audio hướng dẫn</li>
                <li><CheckCircle size={14} /> Thiền định buổi sáng & tối</li>
                <li><CheckCircle size={14} /> Journaling template</li>
                <li><CheckCircle size={14} /> Nhóm đồng hành</li>
              </ul>
              <button className="btn-course" onClick={scrollToWaitlist}>Tham Gia Ngay</button>
            </div>

            <div className="mindset-course-card featured">
              <span className="featured-tag">Được Yêu Thích</span>
              <h4>Tần Số Tình Yêu</h4>
              <p>Chữa lành những vết thương cũ và mở lòng đón nhận tình yêu xứng đáng.</p>
              <div className="price-box">
                <span className="original-price">599.000đ</span>
                <span className="current-price">399.000đ</span>
              </div>
              <ul className="course-features">
                <li><CheckCircle size={14} /> Nhận diện pattern tình yêu</li>
                <li><CheckCircle size={14} /> Chữa lành inner child</li>
                <li><CheckCircle size={14} /> Thiền nâng tần số</li>
                <li><CheckCircle size={14} /> Bài tập tha thứ & buông bỏ</li>
              </ul>
              <button className="btn-course primary" onClick={scrollToWaitlist}>Tham Gia Ngay</button>
            </div>

            <div className="mindset-course-card">
              <h4>Tư Duy Triệu Phú</h4>
              <p>Phá vỡ niềm tin giới hạn về tiền bạc và xây dựng tư duy thịnh vượng từ gốc rễ.</p>
              <div className="price-box">
                <span className="original-price">799.000đ</span>
                <span className="current-price">499.000đ</span>
              </div>
              <ul className="course-features">
                <li><CheckCircle size={14} /> Audit niềm tin về tiền</li>
                <li><CheckCircle size={14} /> Reprogramming mindset</li>
                <li><CheckCircle size={14} /> Affirmation chuyên biệt</li>
                <li><CheckCircle size={14} /> Action plan 30 ngày</li>
              </ul>
              <button className="btn-course" onClick={scrollToWaitlist}>Tham Gia Ngay</button>
            </div>
          </div>

          <img src={IMAGES.coursesMindset} alt="Courses Mindset" className="section-hero-image" />

          <div className="highlight-box">
            <Sparkles size={24} />
            <p>Tất cả khóa học đều đi kèm <strong className="text-gold">quyền truy cập GEM Master miễn phí 30 ngày</strong> để hỗ trợ hành trình chuyển hóa của bạn.</p>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 8: COURSES TRADING ========== */}
      <section className="section-courses-trading">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-cyan">
              <BarChart3 size={14} /> Khóa Học Trading
            </span>
            <h2 className="section-title">
              LỘ TRÌNH TRỌN VẸN<br />
              <span className="text-cyan">TỪ ZERO ĐẾN HERO</span>
            </h2>
            <p className="section-subtitle">
              4 cấp độ từ cơ bản đến chuyên gia, giúp bạn xây dựng kỹ năng trading có hệ thống.
            </p>
          </div>

          <img src={IMAGES.coursesTrading1} alt="Trading Path" className="section-hero-image" />

          <div className="trading-timeline">
            <div className="timeline-line" />

            <div className="timeline-item">
              <div className="level-indicator">
                <span className="level-num">0</span>
              </div>
              <div className="timeline-card starter">
                <h4>Starter</h4>
                <p className="card-price">299K</p>
                <p>Nền tảng cơ bản cho người mới bắt đầu</p>
                <ul>
                  <li>5 video cơ bản về thị trường crypto</li>
                  <li>Giới thiệu Frequency Method</li>
                  <li>Paper Trading không giới hạn</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="level-indicator">
                <span className="level-num">1</span>
              </div>
              <div className="timeline-card tier1">
                <span className="timeline-badge popular">Phổ Biến</span>
                <h4>Tier 1</h4>
                <p className="card-price">11.000.000đ</p>
                <p>Làm chủ 6 công thức Pattern độc quyền</p>
                <ul>
                  <li>Toàn bộ video Tier 1 (30+ bài)</li>
                  <li>Scanner PRO 3 tháng</li>
                  <li>Nhóm Telegram hỗ trợ</li>
                  <li>Weekly Live Q&A</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="level-indicator">
                <span className="level-num">2</span>
              </div>
              <div className="timeline-card tier2">
                <h4>Tier 2</h4>
                <p className="card-price">21.000.000đ</p>
                <p>Nâng cao kỹ năng với chiến lược chuyên sâu</p>
                <ul>
                  <li>Toàn bộ Tier 1 + Tier 2</li>
                  <li>Scanner PRO 6 tháng</li>
                  <li>1:1 Mentoring (2 sessions)</li>
                  <li>Advanced Risk Management</li>
                </ul>
              </div>
            </div>

            <div className="timeline-item">
              <div className="level-indicator">
                <span className="level-num">3</span>
              </div>
              <div className="timeline-card tier3">
                <span className="timeline-badge vip">VIP</span>
                <h4>Tier 3</h4>
                <p className="card-price">68.000.000đ</p>
                <p>Full Access Lifetime + Private Mentoring</p>
                <ul>
                  <li>Tất cả Tier 1, 2, 3</li>
                  <li>Scanner Lifetime Access</li>
                  <li>Private 1:1 với Jennie (6 sessions)</li>
                  <li>Crystal Năng Lượng tặng kèm</li>
                  <li>Ưu tiên tham gia events</li>
                </ul>
              </div>
            </div>
          </div>

          <img src={IMAGES.coursesTrading2} alt="Trading Results" className="section-hero-image" />

          <div className="stats-row trading-stats">
            <div className="stat-item">
              <span className="stat-number text-green">68-85%</span>
              <span className="stat-label">Win Rate Backtest</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-cyan">686+</span>
              <span className="stat-label">Giao dịch phân tích</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-purple">5+ năm</span>
              <span className="stat-label">Data đã kiểm chứng</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-gold">6</span>
              <span className="stat-label">Công thức độc quyền</span>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 9: PERSONAS ========== */}
      <section className="section-personas">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple">
              <Users size={14} /> Dành Cho Ai?
            </span>
            <h2 className="section-title">
              GEMRAL ĐƯỢC TẠO RA<br />
              <span className="text-purple">DÀNH RIÊNG CHO BẠN</span>
            </h2>
            <p className="section-subtitle">
              Dù bạn là ai, ở đâu trên hành trình cuộc sống — nếu bạn khao khát sự chuyển hóa
              thực sự từ bên trong, GEMRAL có giải pháp phù hợp với bạn.
            </p>
            <img src={IMAGES.personas} alt="GEMRAL Personas" className="section-hero-image" style={{marginTop: '30px'}} />
          </div>

          <div className="personas-grid">
            <div className="persona-card cyan">
              <div className="card-header">
                <div className="card-icon"><Zap size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">18-25 tuổi</span>
                  <h3 className="card-title text-cyan">Gen Z Trader</h3>
                </div>
              </div>
              <p className="card-quote">"Em muốn kiếm tiền từ crypto nhưng không biết bắt đầu từ đâu, sợ mất tiền lắm."</p>
              <p className="card-description">Bạn trẻ năng động muốn tạo thu nhập từ thị trường crypto nhưng chưa có kinh nghiệm, dễ bị cuốn vào FOMO.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> FOMO mua theo đám đông rồi bị kẹt hàng ở đỉnh</li>
                  <li><CircleX size={14} /> Không có hệ thống, giao dịch theo cảm xúc</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> GEM Scanner + Khóa Starter</div>
            </div>

            <div className="persona-card gold">
              <div className="card-header">
                <div className="card-icon"><BarChart3 size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">Đã có kinh nghiệm</span>
                  <h3 className="card-title text-gold">Trader Thua Lỗ</h3>
                </div>
              </div>
              <p className="card-quote">"Tôi đã mất rất nhiều tiền vào crypto. Cần một phương pháp có hệ thống thật sự."</p>
              <p className="card-description">Trader đã có kinh nghiệm nhưng vẫn chưa tìm được phương pháp hiệu quả.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Đã mất tiền vì không có hệ thống rõ ràng</li>
                  <li><CircleX size={14} /> Thiếu kỷ luật, không tuân thủ kế hoạch</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> Khóa Tier 1/2 + Scanner PRO</div>
            </div>

            <div className="persona-card purple">
              <div className="card-header">
                <div className="card-icon"><Globe size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">Quan tâm phát triển bản thân</span>
                  <h3 className="card-title text-purple">Người Tìm Kiếm</h3>
                </div>
              </div>
              <p className="card-quote">"Tôi tin vào năng lượng và luật hấp dẫn, muốn hiểu sâu hơn để áp dụng vào cuộc sống."</p>
              <p className="card-description">Người quan tâm đến phát triển bản thân và các phương pháp nâng cao nhận thức.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Thông tin rời rạc, thiếu hệ thống hóa</li>
                  <li><CircleX size={14} /> Chưa biết cách áp dụng vào thực tế</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> GEM Master + Khóa Tần Số Gốc</div>
            </div>

            <div className="persona-card pink">
              <div className="card-header">
                <div className="card-icon"><Heart size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">25-40 tuổi</span>
                  <h3 className="card-title text-pink">Phụ Nữ Khao Khát Tình Yêu</h3>
                </div>
              </div>
              <p className="card-quote">"Tôi cứ mãi gặp sai người, không biết làm sao để thu hút tình yêu đích thực."</p>
              <p className="card-description">Phụ nữ đã trải qua những mối quan hệ không như ý.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Pattern lặp lại trong các mối quan hệ</li>
                  <li><CircleX size={14} /> Cảm giác không xứng đáng được yêu</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> Khóa Tần Số Tình Yêu + GEM Master</div>
            </div>

            <div className="persona-card green">
              <div className="card-header">
                <div className="card-icon"><DollarSign size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">30-50 tuổi</span>
                  <h3 className="card-title text-green">Doanh Nhân</h3>
                </div>
              </div>
              <p className="card-quote">"Kinh doanh thành công nhưng luôn có cảm giác thiếu thốn, sợ mất những gì đang có."</p>
              <p className="card-description">Người đã có sự nghiệp nhưng vẫn cảm thấy thiếu thốn.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Tư duy thiếu thốn dù đã có tiền</li>
                  <li><CircleX size={14} /> Sợ mất những gì đang có</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> Khóa Tư Duy Triệu Phú + Trading</div>
            </div>

            <div className="persona-card orange">
              <div className="card-header">
                <div className="card-icon"><Info size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">Mọi lứa tuổi</span>
                  <h3 className="card-title text-orange">Người Mất Phương Hướng</h3>
                </div>
              </div>
              <p className="card-quote">"Tôi cảm thấy cuộc sống cứ trôi đi mà không biết mình thực sự muốn gì."</p>
              <p className="card-description">Người đang ở giai đoạn chuyển đổi trong cuộc sống.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Không biết mục đích sống của mình là gì</li>
                  <li><CircleX size={14} /> Cảm thấy trống rỗng và mất kết nối</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> GEM Master + Vision Board</div>
            </div>

            <div className="persona-card burgundy full-width">
              <div className="card-content">
                <div className="card-header">
                  <div className="card-icon"><Star size={24} /></div>
                  <div className="card-title-group">
                    <span className="card-label">Khao Khát Chuyển Hóa Toàn Diện</span>
                    <h3 className="card-title text-gold">Người Muốn Tất Cả</h3>
                  </div>
                </div>
                <p className="card-quote">"Tôi muốn cả tài chính tự do, tình yêu viên mãn và sự bình an trong tâm hồn — tôi tin mình xứng đáng có tất cả."</p>
                <p className="card-description">
                  Bạn không chỉ muốn thành công trong một lĩnh vực mà khao khát sự thịnh vượng toàn diện.
                  GEMRAL được tạo ra chính xác dành cho những người như bạn.
                </p>
                <div className="solution-tag"><CheckCircle size={14} /> Trọn Bộ GEMRAL — Trading + Mindset + GEM Master + Vision Board</div>
              </div>
              <div className="card-cta">
                <button className="btn-primary" onClick={scrollToWaitlist}>
                  <Zap size={18} /> Bắt Đầu Hành Trình
                </button>
              </div>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 10: TESTIMONIALS ========== */}
      <section className="section-testimonials">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">
              <Star size={14} /> Học Viên Chia Sẻ
            </span>
            <h2 className="section-title">
              CÂU CHUYỆN THÀNH CÔNG<br />
              <span className="text-gold">TỪ CỘNG ĐỒNG GEMRAL</span>
            </h2>
            <p className="section-subtitle">
              Những chia sẻ thực tế từ học viên đã trải nghiệm hành trình chuyển hóa cùng GEMRAL.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="quote-icon"><Quote size={40} /></div>
              <div className="testimonial-avatar-wrapper">
                <img src={IMAGES.testimonial1} alt="Minh Tuấn" className="testimonial-image" />
              </div>
              <div className="testimonial-header">
                <div className="testimonial-avatar"><span className="avatar-initials">MT</span></div>
                <div className="testimonial-info">
                  <h4>Minh Tuấn</h4>
                  <p className="role">Nhân viên IT, Hà Nội</p>
                  <div className="star-rating">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />)}</div>
                </div>
              </div>
              <blockquote className="testimonial-quote">
                "Trước khi biết GEMRAL, tôi đã thua gần 50 triệu trong 6 tháng trading theo cảm tính.
                Sau khi học Frequency Method và sử dụng Scanner, 3 tháng đầu tôi đã hòa vốn và tháng thứ 4 bắt đầu có lợi nhuận ổn định."
              </blockquote>
              <div className="result-badge success"><CheckCircle size={16} /> +45% ROI trong 90 ngày</div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon"><Quote size={40} /></div>
              <div className="testimonial-avatar-wrapper">
                <img src={IMAGES.testimonial2} alt="Thu Hương" className="testimonial-image" />
              </div>
              <div className="testimonial-header">
                <div className="testimonial-avatar"><span className="avatar-initials">TH</span></div>
                <div className="testimonial-info">
                  <h4>Thu Hương</h4>
                  <p className="role">Chủ shop online, TP.HCM</p>
                  <div className="star-rating">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />)}</div>
                </div>
              </div>
              <blockquote className="testimonial-quote">
                "GEM Master thực sự thay đổi cách tôi nhìn nhận cuộc sống và công việc kinh doanh.
                Kết hợp với Scanner, tôi có thêm nguồn thu nhập thụ động từ trading mà không mất nhiều thời gian."
              </blockquote>
              <div className="result-badge success"><CheckCircle size={16} /> Thu nhập tăng 80%</div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon"><Quote size={40} /></div>
              <div className="testimonial-avatar-wrapper">
                <img src={IMAGES.testimonial3} alt="Quang Hải" className="testimonial-image" />
              </div>
              <div className="testimonial-header">
                <div className="testimonial-avatar"><span className="avatar-initials">QH</span></div>
                <div className="testimonial-info">
                  <h4>Quang Hải</h4>
                  <p className="role">Trader Full-time, Đà Nẵng</p>
                  <div className="star-rating">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />)}</div>
                </div>
              </div>
              <blockquote className="testimonial-quote">
                "Tôi đã trade được 3 năm và thử qua nhiều phương pháp. Frequency Method cho tôi một góc nhìn hoàn toàn mới
                và quan trọng nhất là có kỷ luật trading rõ ràng."
              </blockquote>
              <div className="result-badge success"><CheckCircle size={16} /> Win rate từ 45% lên 72%</div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon"><Quote size={40} /></div>
              <div className="testimonial-avatar-wrapper">
                <img src={IMAGES.testimonial4} alt="Ngọc Anh" className="testimonial-image" />
              </div>
              <div className="testimonial-header">
                <div className="testimonial-avatar"><span className="avatar-initials">NA</span></div>
                <div className="testimonial-info">
                  <h4>Ngọc Anh</h4>
                  <p className="role">Mẹ bỉm sữa, Bình Dương</p>
                  <div className="star-rating">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />)}</div>
                </div>
              </div>
              <blockquote className="testimonial-quote">
                "Là mẹ của 2 bé nhỏ, tôi không có nhiều thời gian. Scanner cho tôi tín hiệu rõ ràng,
                chỉ cần check app 15 phút buổi sáng và buổi tối là đủ."
              </blockquote>
              <div className="result-badge success"><CheckCircle size={16} /> +18 triệu/tháng part-time</div>
            </div>
          </div>

          <div className="stats-row testimonial-stats">
            <div className="stat-item">
              <span className="stat-number text-gold">500+</span>
              <span className="stat-label">Học viên đã tham gia</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-cyan">4.8/5</span>
              <span className="stat-label">Đánh giá trung bình</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-pink">92%</span>
              <span className="stat-label">Hài lòng với kết quả</span>
            </div>
          </div>

          <div className="video-cta-box">
            <h3><Play size={28} /> Xem Thêm Chia Sẻ Từ Học Viên</h3>
            <p>Hơn 50 câu chuyện thực tế từ học viên đã trải nghiệm hành trình chuyển hóa cùng GEMRAL.</p>
            <img src={IMAGES.testimonials} alt="More Testimonials" className="video-cta-image" />
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 11: PARTNERSHIP ========== */}
      <section className="section-partnership">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple">
              <Users size={14} /> Cơ Hội Hợp Tác
            </span>
            <h2 className="section-title">
              CÙNG PHÁT TRIỂN VỚI<br />
              <span className="text-gold">HỆ SINH THÁI GEMRAL</span>
            </h2>
            <p className="section-subtitle">
              Trở thành đối tác của GEMRAL và tạo thu nhập không giới hạn khi giới thiệu sản phẩm đến cộng đồng của bạn.
            </p>
          </div>

          <div className="partner-types-grid">
            <div className="partner-type-card ctv">
              <div className="partner-icon"><UserPlus size={32} /></div>
              <h3 className="text-cyan">TIER 1: CTV</h3>
              <div className="commission text-cyan">10-30%</div>
              <span className="requirement-badge">Ai cũng đăng ký được</span>
              <p>Chương trình Cộng Tác Viên dành cho tất cả mọi người muốn kiếm thu nhập thụ động.</p>
              <ul className="partner-features">
                <li><CheckCircle size={14} /> 5 cấp bậc thăng tiến: Bronze → Diamond</li>
                <li><CheckCircle size={14} /> Hoa hồng Digital: 10% - 30%</li>
                <li><CheckCircle size={14} /> Hoa hồng Physical: 6% - 15%</li>
              </ul>
            </div>

            <div className="partner-type-card kol">
              <div className="partner-icon"><Star size={32} /></div>
              <h3 className="text-gold">TIER 2: KOL AFFILIATE</h3>
              <div className="commission text-gold">20%</div>
              <span className="requirement-badge warning">Yêu cầu: 20,000+ followers</span>
              <p>Chương trình dành riêng cho Influencers và KOLs có tầm ảnh hưởng lớn.</p>
              <ul className="partner-features">
                <li><CheckCircle size={14} /> Hoa hồng Digital: 20%</li>
                <li><CheckCircle size={14} /> Hoa hồng Physical: 20%</li>
              </ul>
            </div>

            <div className="partner-type-card instructor">
              <div className="partner-icon"><GraduationCap size={32} /></div>
              <h3 className="text-purple">TIER 3: INSTRUCTOR</h3>
              <div className="commission text-purple">40-60%</div>
              <span className="requirement-badge exclusive">Được GEM mời hoặc có chuyên môn</span>
              <p>Chương trình Giảng Viên dành cho chuyên gia có năng lực đặc biệt.</p>
              <ul className="partner-features">
                <li><CheckCircle size={14} /> Revenue Share: 40-60%</li>
                <li><CheckCircle size={14} /> Multiple Income Streams</li>
                <li><CheckCircle size={14} /> Commission + Royalties</li>
                <li><CheckCircle size={14} /> Co-branding & Phát triển khóa học riêng</li>
              </ul>
            </div>
          </div>

          <div className="ctv-table-wrapper">
            <div className="table-header">
              <h3 className="text-cyan">Bảng Hoa Hồng CTV - 5 Cấp Bậc</h3>
              <p>Thăng cấp dựa trên tổng doanh số tích lũy — càng bán nhiều, hoa hồng càng cao</p>
            </div>
            <table className="ctv-table">
              <thead>
                <tr>
                  <th>Cấp Bậc</th>
                  <th>Digital</th>
                  <th>Physical</th>
                </tr>
              </thead>
              <tbody>
                <tr className="tier-bronze">
                  <td><div className="tier-cell"><span className="tier-icon">🥉</span><span className="tier-name">Bronze (Đồng)</span></div></td>
                  <td><span className="commission-value">10%</span></td>
                  <td><span className="commission-value">6%</span></td>
                </tr>
                <tr className="tier-silver">
                  <td><div className="tier-cell"><span className="tier-icon">🥈</span><span className="tier-name">Silver (Bạc)</span></div></td>
                  <td><span className="commission-value">15%</span></td>
                  <td><span className="commission-value">8%</span></td>
                </tr>
                <tr className="tier-gold">
                  <td><div className="tier-cell"><span className="tier-icon">🥇</span><span className="tier-name">Gold (Vàng)</span></div></td>
                  <td><span className="commission-value">20%</span></td>
                  <td><span className="commission-value">10%</span></td>
                </tr>
                <tr className="tier-platinum">
                  <td><div className="tier-cell"><span className="tier-icon">💎</span><span className="tier-name">Platinum (Bạch Kim)</span></div></td>
                  <td><span className="commission-value">25%</span></td>
                  <td><span className="commission-value">12%</span></td>
                </tr>
                <tr className="tier-diamond">
                  <td><div className="tier-cell"><span className="tier-icon">👑</span><span className="tier-name">Diamond (Kim Cương)</span></div></td>
                  <td><span className="commission-value">30%</span></td>
                  <td><span className="commission-value">15%</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <img src={IMAGES.partnership} alt="Partnership" className="section-hero-image" />

          <div className="cta-section">
            <div className="cta-card">
              <h4 className="text-gold">Mua Sản Phẩm</h4>
              <p>Khám phá bộ sưu tập Crystal và các sản phẩm năng lượng giúp nâng cao tần số cuộc sống.</p>
              <button className="btn-primary" onClick={scrollToWaitlist}><ShoppingBag size={16} /> Shop Crystal/Products</button>
            </div>
            <div className="cta-card">
              <h4 className="text-cyan">Trở Thành CTV</h4>
              <p>Đăng ký miễn phí và bắt đầu kiếm hoa hồng từ ngày đầu tiên.</p>
              <button className="btn-secondary" onClick={scrollToWaitlist}><UserPlus size={16} /> Đăng Ký CTV (Miễn Phí)</button>
            </div>
            <div className="cta-card">
              <h4 className="text-purple">Đăng Ký KOL</h4>
              <p>Bạn có 20,000+ followers? Đăng ký chương trình KOL để nhận mức hoa hồng 20%.</p>
              <button className="btn-tertiary" onClick={scrollToWaitlist}><Star size={16} /> Đăng Ký KOL</button>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 12: STATS ========== */}
      <section className="section-stats">
        <div className="grid-bg" />
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">
              <BarChart3 size={14} /> Số Liệu Thực Tế
            </span>
            <h2 className="section-title">
              SỐ LIỆU<br />
              <span className="text-gold">KHÔNG NÓI DỐI</span>
            </h2>
            <p className="section-subtitle">
              Tất cả con số dưới đây đều được kiểm chứng từ dữ liệu backtest thực tế trên thị trường crypto.
            </p>
          </div>

          <div className="stats-grid-main">
            <div className="stat-card">
              <div className="stat-icon"><CheckCircle size={28} /></div>
              <div className="stat-number">68-85%</div>
              <div className="stat-label">Win Rate Backtest</div>
              <div className="stat-desc">Tỷ lệ thắng được kiểm chứng qua hơn 5 năm dữ liệu lịch sử.</div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-icon"><Activity size={28} /></div>
              <div className="stat-number">686+</div>
              <div className="stat-label">Giao Dịch Phân Tích</div>
              <div className="stat-desc">Số lượng giao dịch đã được backtest để xây dựng 6 công thức.</div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon"><Clock size={28} /></div>
              <div className="stat-number">5+ năm</div>
              <div className="stat-label">Dữ Liệu Kiểm Chứng</div>
              <div className="stat-desc">Frequency Method được xây dựng và kiểm chứng qua hơn 5 năm.</div>
            </div>

            <div className="stat-card pink">
              <div className="stat-icon"><Layers size={28} /></div>
              <div className="stat-number">6</div>
              <div className="stat-label">Công Thức Độc Quyền</div>
              <div className="stat-desc">Hệ thống 6 pattern tần số: DPD, UPU, UPD, DPU, HFZ, LFZ.</div>
            </div>
          </div>

          <div className="stats-grid-bottom">
            <div className="stat-card green">
              <div className="stat-icon"><Users size={28} /></div>
              <div className="stat-number">500+</div>
              <div className="stat-label">Học Viên Đã Tham Gia</div>
              <div className="stat-desc">Cộng đồng học viên đã và đang thực hành Frequency Method.</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><UserPlus size={28} /></div>
              <div className="stat-number">100+</div>
              <div className="stat-label">Đối Tác CTV/KOL</div>
              <div className="stat-desc">Mạng lưới đối tác đang cùng phát triển hệ sinh thái GEMRAL.</div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-icon"><Smile size={28} /></div>
              <div className="stat-number">92%</div>
              <div className="stat-label">Hài Lòng Với Kết Quả</div>
              <div className="stat-desc">Tỷ lệ học viên hài lòng sau khi áp dụng hệ thống.</div>
            </div>
          </div>

          <div className="verification-row">
            <div className="verification-item"><CheckCircle size={20} /> Dữ liệu backtest có thể kiểm chứng</div>
            <div className="verification-item"><CheckCircle size={20} /> Kết quả từ học viên thực tế</div>
            <div className="verification-item"><CheckCircle size={20} /> Không hứa hẹn lợi nhuận phi thực tế</div>
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
