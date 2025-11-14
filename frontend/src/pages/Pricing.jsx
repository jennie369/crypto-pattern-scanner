import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
// import './Pricing.css' // Commented out to use global styles from components.css

export default function Pricing() {
  const navigate = useNavigate()
  const { user, profile, getCourseTier, getScannerTier, getChatbotTier } = useAuth()

  const [courseTier, setCourseTier] = useState('free')
  const [scannerTier, setScannerTier] = useState('free')
  const [chatbotTier, setChatbotTier] = useState('free')

  useEffect(() => {
    if (profile) {
      setCourseTier(profile.course_tier || 'free')
      setScannerTier(profile.scanner_tier || 'free')
      setChatbotTier(profile.chatbot_tier || 'free')
    }
  }, [profile])

  // ==========================================
  // SECTION 1: FREQUENCY TRADING COURSE
  // ==========================================
  const courseTiers = [
    {
      id: 'free',
      name: 'FREE TRIAL',
      price: '0đ',
      period: '',
      color: '#4CAF50',
      features: [
        { text: 'Truy cập 3 chương đầu', included: true },
        { text: 'Video giới thiệu', included: true },
        { text: 'Tài liệu cơ bản', included: true },
        { text: 'Chat cộng đồng (chỉ đọc)', included: true },
        { text: 'Truy cập đầy đủ 17 chương', included: false },
        { text: 'Bài tập thực hành', included: false },
        { text: 'Chứng chỉ hoàn thành', included: false },
      ],
      shopifyHandle: null
    },
    {
      id: 'tier1',
      name: 'GÓI 1',
      price: '11.000.000đ',
      period: '/ tháng',
      color: '#FFBD59',
      popular: true,
      features: [
        { text: 'Truy cập đầy đủ 17 chương', included: true },
        { text: 'Video HD chất lượng cao', included: true },
        { text: 'Tài liệu PDF đầy đủ', included: true },
        { text: 'Bài tập thực hành', included: true },
        { text: 'Hỗ trợ qua chat cộng đồng', included: true },
        { text: 'Cập nhật nội dung mới', included: true },
        { text: 'Chứng chỉ hoàn thành', included: false },
      ],
      shopifyHandle: 'gem-course-tier1'
    },
    {
      id: 'tier2',
      name: 'GÓI 2',
      price: '21.000.000đ',
      period: '/ tháng',
      color: '#9C27B0',
      features: [
        { text: 'Tất cả tính năng Gói 1', included: true, bold: true },
        { text: 'Bài tập nâng cao với feedback', included: true },
        { text: 'Weekly Q&A session', included: true },
        { text: 'Chiến lược trading độc quyền', included: true },
        { text: 'Phân tích case study thực tế', included: true },
        { text: 'Chứng chỉ hoàn thành', included: true },
      ],
      shopifyHandle: 'gem-course-tier2'
    },
    {
      id: 'tier3',
      name: 'GÓI 3 - VIP',
      price: '68.000.000đ',
      period: '/ tháng',
      color: '#F44336',
      features: [
        { text: 'Tất cả tính năng Gói 1 + 2', included: true, bold: true },
        { text: 'Coaching 1-1 với mentor (2h/tháng)', included: true },
        { text: 'Portfolio review hàng tuần', included: true },
        { text: 'Truy cập VIP lounge', included: true },
        { text: 'Priority support 24/7', included: true },
        { text: 'Lifetime access (sau 12 tháng)', included: true },
        { text: 'Chứng chỉ VIP', included: true },
      ],
      shopifyHandle: 'gem-course-tier3'
    }
  ]

  // ==========================================
  // SECTION 2: SCANNER DASHBOARD
  // ==========================================
  const scannerTiers = [
    {
      id: 'free',
      name: 'FREE',
      price: '0đ',
      period: '',
      color: '#4CAF50',
      features: [
        { text: '5 lượt quét/ngày', included: true },
        { text: '3 patterns cơ bản (DPD, UPU, H&S)', included: true },
        { text: '10 đồng coin', included: true },
        { text: 'Lịch sử 7 ngày', included: true },
        { text: 'Cảnh báo Telegram', included: false },
        { text: 'Quét không giới hạn', included: false },
      ],
      shopifyHandle: null
    },
    {
      id: 'pro',
      name: 'PRO',
      price: '997.000đ',
      period: '/ tháng',
      color: '#2196F3',
      popular: true,
      features: [
        { text: 'Quét KHÔNG GIỚI HẠN', included: true, bold: true },
        { text: '7 patterns (+ UPD, DPU, Double Top/Bottom)', included: true },
        { text: '20 đồng coin', included: true },
        { text: 'Cảnh báo Telegram', included: true },
        { text: 'Lịch sử 30 ngày', included: true },
        { text: 'Giá real-time (no delay)', included: true },
      ],
      shopifyHandle: 'gem-scanner-pro'
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      price: '1.997.000đ',
      period: '/ tháng',
      color: '#9C27B0',
      features: [
        { text: 'Tất cả tính năng PRO', included: true, bold: true },
        { text: '15 patterns (+ 8 nâng cao)', included: true },
        { text: '50+ đồng coin', included: true },
        { text: 'Multi-timeframe (15m, 1h, 4h, 1d)', included: true },
        { text: 'Phát hiện vùng HFZ/LFZ', included: true },
        { text: 'Lịch sử không giới hạn', included: true },
        { text: 'API access (100 req/day)', included: true },
      ],
      shopifyHandle: 'gem-scanner-premium'
    },
    {
      id: 'vip',
      name: 'VIP',
      price: '5.997.000đ',
      period: '/ tháng',
      color: '#F44336',
      features: [
        { text: 'Tất cả tính năng PREMIUM', included: true, bold: true },
        { text: '24 patterns (+ AI detection)', included: true },
        { text: 'Theo dõi cá voi & on-chain', included: true },
        { text: 'Backtesting (5 năm data)', included: true },
        { text: 'Auto-trading integration', included: true },
        { text: 'API không giới hạn', included: true },
        { text: 'White-label option', included: true },
      ],
      shopifyHandle: 'gem-scanner-vip'
    }
  ]

  // ==========================================
  // SECTION 3: YINYANG CHATBOT AI
  // ==========================================
  const chatbotTiers = [
    {
      id: 'free',
      name: 'FREE',
      price: '0đ',
      period: '',
      color: '#4CAF50',
      features: [
        { text: '5 câu hỏi/ngày', included: true },
        { text: 'Auto reset mỗi 24h', included: true },
        { text: 'Câu trả lời cơ bản', included: true },
        { text: 'Response time ~10s', included: true },
        { text: 'Không giới hạn câu hỏi', included: false },
        { text: 'Priority response', included: false },
      ],
      shopifyHandle: null
    },
    {
      id: 'pro',
      name: 'PRO',
      price: '39.000đ',
      period: '/ tháng',
      color: '#2196F3',
      popular: true,
      features: [
        { text: '15 câu hỏi/ngày', included: true },
        { text: 'Auto reset mỗi 24h', included: true },
        { text: 'Phân tích chuyên sâu', included: true },
        { text: 'Response time ~5s', included: true },
        { text: 'Memory context (10 câu)', included: true },
      ],
      shopifyHandle: 'gem-chatbot-pro'
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      price: '99.000đ',
      period: '/ tháng',
      color: '#9C27B0',
      features: [
        { text: 'UNLIMITED câu hỏi', included: true, bold: true },
        { text: 'Không giới hạn', included: true },
        { text: 'Phân tích expert-level', included: true },
        { text: 'Priority response ~2s', included: true },
        { text: 'Memory context (50 câu)', included: true },
        { text: 'Custom prompts', included: true },
      ],
      shopifyHandle: 'gem-chatbot-premium'
    }
  ]

  const handleUpgrade = (productType, tier) => {
    if (!user) {
      navigate('/signup')
      return
    }

    if (tier.id === 'free' || !tier.shopifyHandle) {
      return
    }

    // Redirect to Shopify product page
    const shopifyDomain = 'yinyangmasters.com'
    const productUrl = `https://${shopifyDomain}/products/${tier.shopifyHandle}`
    window.location.href = productUrl
  }

  const isCurrentTier = (productType, tierId) => {
    if (productType === 'course') return courseTier === tierId
    if (productType === 'scanner') return scannerTier === tierId
    if (productType === 'chatbot') return chatbotTier === tierId
    return false
  }

  const renderTierCard = (productType, tier) => {
    const isCurrent = isCurrentTier(productType, tier.id)

    // Bundle info for course tiers
    const getBundleInfo = () => {
      if (productType !== 'course' || tier.id === 'free') return null

      const bundles = {
        'tier1': { scanner: 'Scanner PRO', chatbot: 'Chatbot PRO', duration: '12 tháng' },
        'tier2': { scanner: 'Scanner PREMIUM', chatbot: 'Chatbot PREMIUM', duration: '12 tháng' },
        'tier3': { scanner: 'Scanner VIP', chatbot: 'Chatbot PREMIUM', duration: '24 tháng' }
      }

      return bundles[tier.id]
    }

    const bundleInfo = getBundleInfo()

    // ===============================================
    // NEW GLASSMORPHISM DESIGN FOR COURSE TIERS
    // ===============================================
    if (productType === 'course') {
      const pricingCardBase = {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        transition: 'all 0.4s ease',
        position: 'relative',
        overflow: 'hidden'
      }

      // FREE TRIAL CARD
      if (tier.id === 'free') {
        return (
          <div key={tier.id} className="card-pricing card-pricing-free">
            {/* Top Badge */}
            <div className="badge badge-free mb-16">
              📚 Khóa học FREQUENCY TRADING
            </div>

            {/* Title */}
            <h3 className="text-green fw-900" style={{ fontSize: '32px', marginBottom: '16px' }}>
              FREE TRIAL
            </h3>

            {/* Price */}
            <div className="fw-900 text-white" style={{ fontSize: '56px', lineHeight: 1, marginBottom: '8px' }}>
              0đ
            </div>

            {/* Divider */}
            <div className="divider-green"></div>

            {/* Features List */}
            <div className="mb-24">
              {tier.features.filter(f => f.included).map((feature, idx) => (
                <div key={idx} className="feature-box feature-box-green">
                  <span>✅</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button className="btn-success btn-full">
              Bắt Đầu Ngay
            </button>
          </div>
        )
      }

      // GÓI 1 CARD
      if (tier.id === 'tier1') {
        return (
          <div key={tier.id} className="card-pricing card-pricing-pro">
            {/* Top Badge */}
            <div className="badge badge-pro mb-16">
              📚 Khóa học FREQUENCY TRADING - GÓI 1
            </div>

            {/* Title */}
            <h3 className="text-gold fw-900" style={{ fontSize: '32px', marginBottom: '16px' }}>
              GÓI 1
            </h3>

            {/* Price */}
            <div className="fw-900 text-white" style={{ fontSize: '48px', lineHeight: 1, marginBottom: '4px' }}>
              11.000.000đ
            </div>
            <div className="text-muted mb-24">/ tháng</div>

            {/* Combo Badge */}
            {bundleInfo && (
              <div className="combo-badge combo-badge-gold">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⭐</span>
                  <span className="fw-600 text-gold">Combo: Khóa học + Scanner + Chatbot</span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mb-24">
              {bundleInfo && (
                <>
                  <div className="feature-box feature-box-gold">
                    <span>✓</span>
                    <span>Khóa học GÓI 1</span>
                  </div>
                  <div className="feature-box feature-box-gold">
                    <span>✓</span>
                    <span>{bundleInfo.scanner}</span>
                  </div>
                  <div className="feature-box feature-box-gold">
                    <span>✓</span>
                    <span>{bundleInfo.chatbot}</span>
                  </div>
                  <div className="feature-box feature-box-gold">
                    <span>⏱️</span>
                    <span>{bundleInfo.duration}</span>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Feature */}
            <div className="combo-badge combo-badge-green mb-24">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span className="fw-600 text-green">Truy cập đầy đủ 17 chương</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              className={`btn-warning btn-full ${isCurrent ? 'disabled' : ''}`}
              onClick={() => handleUpgrade(productType, tier)}
              disabled={isCurrent}
              style={{ opacity: isCurrent ? 0.6 : 1 }}
            >
              {isCurrent ? '✓ Đang Dùng' : 'Mua Ngay'}
            </button>
          </div>
        )
      }

      // GÓI 2 CARD - POPULAR
      if (tier.id === 'tier2') {
        return (
          <div key={tier.id} className="card-pricing card-pricing-premium">
            {/* POPULAR Badge */}
            <div className="badge badge-popular">
              🔥 POPULAR
            </div>

            {/* Top Badge */}
            <div className="badge badge-premium mb-16" style={{ marginTop: '8px' }}>
              📚 Khóa học FREQUENCY TRADING
            </div>

            {/* Title */}
            <h3 className="text-purple fw-900" style={{ fontSize: '36px', marginBottom: '16px' }}>
              GÓI 2
            </h3>

            {/* Price */}
            <div className="fw-900 text-white" style={{ fontSize: '48px', lineHeight: 1, marginBottom: '4px' }}>
              21.000.000đ
            </div>
            <div className="text-muted mb-24">/ tháng</div>

            {/* Combo Badge */}
            {bundleInfo && (
              <div className="combo-badge combo-badge-purple">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⭐</span>
                  <span className="fw-600 text-purple">Combo: Khóa học + Scanner + Chatbot</span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mb-24">
              {bundleInfo && (
                <>
                  <div className="feature-box feature-box-purple">
                    <span>✓</span>
                    <span>Khóa học GÓI 2</span>
                  </div>
                  <div className="feature-box feature-box-purple">
                    <span>✓</span>
                    <span>{bundleInfo.scanner}</span>
                  </div>
                  <div className="feature-box feature-box-purple">
                    <span>✓</span>
                    <span>{bundleInfo.chatbot}</span>
                  </div>
                  <div className="feature-box feature-box-purple">
                    <span>⏱️</span>
                    <span>{bundleInfo.duration}</span>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Feature */}
            <div className="combo-badge combo-badge-green mb-24">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span className="fw-600 text-green">Tất cả tính năng Gói 1</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              className={`btn-premium btn-full ${isCurrent ? 'disabled' : ''}`}
              onClick={() => handleUpgrade(productType, tier)}
              disabled={isCurrent}
              style={{ opacity: isCurrent ? 0.6 : 1 }}
            >
              {isCurrent ? '✓ Đang Dùng' : 'Mua Ngay'}
            </button>
          </div>
        )
      }

      // GÓI 3 VIP CARD
      if (tier.id === 'tier3') {
        return (
          <div key={tier.id} className="card-pricing card-pricing-vip">
            {/* Top Badge */}
            <div className="badge badge-vip mb-16">
              📚 Khóa học FREQUENCY TRADING
            </div>

            {/* Title with VIP styling */}
            <h2 className="heading-vip" style={{ marginBottom: '16px' }}>
              GÓI 3 - VIP
            </h2>

            {/* Price */}
            <div className="fw-900 text-gold" style={{ fontSize: '48px', lineHeight: 1, marginBottom: '4px' }}>
              68.000.000đ
            </div>
            <div className="text-muted mb-24">/ tháng</div>

            {/* Combo Badge */}
            {bundleInfo && (
              <div className="combo-badge combo-badge-gold">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⭐</span>
                  <span className="fw-600 text-gold">Combo: Khóa học + Scanner + Chatbot</span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mb-24">
              {bundleInfo && (
                <>
                  <div className="feature-box feature-box-gold">
                    <span>✓</span>
                    <span>Khóa học GÓI 3 - VIP</span>
                  </div>
                  <div className="feature-box feature-box-gold">
                    <span>✓</span>
                    <span>{bundleInfo.scanner}</span>
                  </div>
                  <div className="feature-box feature-box-gold">
                    <span>✓</span>
                    <span>{bundleInfo.chatbot}</span>
                  </div>
                  <div className="feature-box feature-box-gold">
                    <span>⏱️</span>
                    <span>{bundleInfo.duration}</span>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Feature */}
            <div className="combo-badge combo-badge-green mb-24">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span className="fw-600 text-green">Tất cả tính năng Gói 1 + 2</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              className={`btn-vip btn-full ${isCurrent ? 'disabled' : ''}`}
              onClick={() => handleUpgrade(productType, tier)}
              disabled={isCurrent}
              style={{ opacity: isCurrent ? 0.6 : 1 }}
            >
              {isCurrent ? '✓ Đang Dùng' : 'Mua Ngay - VIP'}
            </button>
          </div>
        )
      }
    }

    // ===============================================
    // SCANNER & CHATBOT TIERS - USING GLOBAL CLASSES
    // ===============================================

    // Map tier IDs to global class names
    const tierClassMap = {
      'free': { card: 'card-pricing-free', badge: 'badge-free', text: 'text-green', featureBox: 'feature-box-green', btn: 'btn-success' },
      'pro': { card: 'card-pricing-pro', badge: 'badge-pro', text: 'text-gold', featureBox: 'feature-box-gold', btn: 'btn-warning' },
      'premium': { card: 'card-pricing-premium', badge: 'badge-premium', text: 'text-purple', featureBox: 'feature-box-purple', btn: 'btn-premium' },
      'vip': { card: 'card-pricing-vip', badge: 'badge-vip', text: 'text-gold', featureBox: 'feature-box-gold', btn: 'btn-vip' }
    }

    const tierClasses = tierClassMap[tier.id] || tierClassMap['free']
    const productIcon = productType === 'scanner' ? '🔍' : '🤖'
    const productName = productType === 'scanner' ? 'Scanner Dashboard' : 'YinYang Chatbot AI'

    return (
      <div key={tier.id} className={`card-pricing ${tierClasses.card}`}>
        {/* POPULAR Badge */}
        {tier.popular && (
          <div className="badge badge-popular">
            🔥 POPULAR
          </div>
        )}

        {/* Current Tier Badge */}
        {isCurrent && (
          <div className="badge badge-current">
            ✓ Đang Dùng
          </div>
        )}

        {/* Product Badge */}
        <div className={`badge ${tierClasses.badge} mb-16`} style={tier.popular ? { marginTop: '8px' } : {}}>
          {productIcon} {productName} - {tier.name}
        </div>

        {/* Title */}
        <h3 className={`${tierClasses.text} fw-900`} style={{ fontSize: '32px', marginBottom: '16px' }}>
          {tier.name}
        </h3>

        {/* Price */}
        <div className="fw-900 text-white" style={{ fontSize: '48px', lineHeight: 1, marginBottom: '4px' }}>
          {tier.price}
        </div>
        {tier.period && <div className="text-muted mb-24">{tier.period}</div>}

        {/* Features List */}
        <div className="mb-24">
          {tier.features.map((feature, index) => {
            if (!feature.included) return null
            return (
              <div key={index} className={`feature-box ${tierClasses.featureBox}`}>
                <span>{feature.bold ? '✅' : '✓'}</span>
                <span style={feature.bold ? { fontWeight: 700 } : {}}>{feature.text}</span>
              </div>
            )
          })}
        </div>

        {/* CTA Button */}
        <button
          className={`${tierClasses.btn} btn-full ${isCurrent || tier.id === 'free' ? 'disabled' : ''}`}
          onClick={() => handleUpgrade(productType, tier)}
          disabled={isCurrent || tier.id === 'free'}
          style={{ opacity: isCurrent || tier.id === 'free' ? 0.6 : 1 }}
        >
          {isCurrent ? '✓ Đang Dùng' : (tier.id === 'free' ? 'Miễn Phí' : 'Mua Ngay')}
        </button>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-content">
      {/* Back to Home button - fixed top-right */}
      <button
        className="btn-primary"
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000
        }}
      >
        🏠 Về Trang Chủ
      </button>

      <div className="pricing-header">
        <h1 className="heading-gold heading-gold-lg">
          💎 Bảng Giá - GEM Trading Academy
        </h1>
        <p className="text-muted" style={{ fontSize: '18px' }}>Chọn gói phù hợp với nhu cầu của bạn - Mua riêng lẻ hoặc combo</p>
      </div>

      {/* ========================================
          SECTION 1: FREQUENCY TRADING COURSE
      ======================================== */}
      <div className="pricing-section">
        <div className="section-header">
          <h2>🎓 Khóa Học FREQUENCY TRADING</h2>
          <p>Học cách trading chuyên nghiệp với 17 chương chi tiết</p>
          {user && (
            <div className="current-tier-badge">
              Gói hiện tại: <span style={{ color: courseTiers.find(t => t.id === courseTier)?.color }}>
                {courseTiers.find(t => t.id === courseTier)?.name}
              </span>
            </div>
          )}
        </div>

        <div className="pricing-grid">
          {courseTiers.map(tier => renderTierCard('course', tier))}
        </div>
      </div>

      {/* ========================================
          SECTION 2: SCANNER DASHBOARD
      ======================================== */}
      <div className="pricing-section">
        <div className="section-header">
          <h2>🔍 Scanner Dashboard</h2>
          <p>Công cụ quét pattern tự động cho crypto trading</p>
          {user && (
            <div className="current-tier-badge">
              Gói hiện tại: <span style={{ color: scannerTiers.find(t => t.id === scannerTier)?.color }}>
                {scannerTiers.find(t => t.id === scannerTier)?.name}
              </span>
            </div>
          )}
        </div>

        <div className="pricing-grid">
          {scannerTiers.map(tier => renderTierCard('scanner', tier))}
        </div>
      </div>

      {/* ========================================
          SECTION 3: YINYANG CHATBOT AI
      ======================================== */}
      <div className="pricing-section">
        <div className="section-header">
          <h2>🤖 YinYang Chatbot AI</h2>
          <p>Trợ lý AI giúp phân tích thị trường và giải đáp thắc mắc</p>
          {user && (
            <div className="current-tier-badge">
              Gói hiện tại: <span style={{ color: chatbotTiers.find(t => t.id === chatbotTier)?.color }}>
                {chatbotTiers.find(t => t.id === chatbotTier)?.name}
              </span>
            </div>
          )}
        </div>

        <div className="pricing-grid chatbot-grid">
          {chatbotTiers.map(tier => renderTierCard('chatbot', tier))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="pricing-faq">
        <h2 className="heading-gold mb-24">❓ Câu Hỏi Thường Gặp</h2>

        <div className="faq-grid">
          <div className="card-faq">
            <h4>📦 Tôi có thể mua riêng lẻ không?</h4>
            <p>Có! Bạn có thể mua từng sản phẩm riêng biệt hoặc mua combo để được giảm giá.</p>
          </div>

          <div className="card-faq">
            <h4>📅 Có phải thanh toán hàng tháng?</h4>
            <p>Đúng rồi! Tất cả các gói đều thanh toán theo tháng. Hủy bất cứ lúc nào.</p>
          </div>

          <div className="card-faq">
            <h4>🔄 Tôi có thể nâng cấp sau không?</h4>
            <p>Có! Nâng cấp bất cứ lúc nào. Bạn chỉ trả phần chênh lệch.</p>
          </div>

          <div className="card-faq">
            <h4>💰 Có chính sách hoàn tiền không?</h4>
            <p>Bảo đảm hoàn tiền trong 30 ngày nếu bạn không hài lòng.</p>
          </div>

          <div className="card-faq">
            <h4>🎁 Có combo ưu đãi không?</h4>
            <p>Có! Mua combo Course + Scanner + Chatbot để được giảm giá đến 20%.</p>
          </div>

          <div className="card-faq">
            <h4>📱 Có ứng dụng di động không?</h4>
            <p>Scanner Dashboard đã có responsive mobile web. App iOS đang phát triển.</p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="pricing-cta-bottom">
        <h3 className="text-white fw-700" style={{ fontSize: '32px', marginBottom: '16px' }}>Vẫn còn thắc mắc?</h3>
        <p className="text-muted mb-24" style={{ fontSize: '18px' }}>Liên hệ với chúng tôi để được tư vấn chi tiết</p>
        <button
          className="btn-primary"
          onClick={() => window.location.href = 'mailto:support@gemtrading.academy'}
        >
          📧 Liên Hệ Hỗ Trợ
        </button>
      </div>
    </div>
    </div>
  )
}
