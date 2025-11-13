import React from 'react';
import './HeroSection.css';

export const HeroSection = () => {
  const handleStartFree = () => {
    window.location.href = '/signup';
  };

  const handleViewDetails = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTryChatbot = () => {
    // TODO: Open chatbot in new tab or modal
    window.open('/chatbot', '_blank');
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* LEFT - Hero Copy */}
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-icon">🔥</span>
              <span className="badge-text">#1 CRYPTO PATTERN SCANNER</span>
            </div>

            <h1 className="hero-headline">
              Trade Smarter With <span className="text-gradient-gold">Frequency Method</span>
            </h1>

            <p className="hero-subheadline">
              <strong>68% Win Rate</strong> Proven By 686 Real Trades
            </p>

            {/* Key Benefits */}
            <ul className="hero-benefits">
              <li>
                <span className="benefit-icon">✅</span>
                <span className="benefit-text">Real-time pattern detection with 24 algorithms</span>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <span className="benefit-text">AI-powered trading signals & risk management</span>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <span className="benefit-text">Backtesting & portfolio tracking tools</span>
              </li>
            </ul>

            {/* CTAs */}
            <div className="hero-ctas">
              <button
                className="btn-primary btn-lg"
                onClick={handleStartFree}
              >
                <span>🚀</span>
                Bắt Đầu Miễn Phí
              </button>

              <button
                className="btn-secondary btn-lg"
                onClick={handleViewDetails}
              >
                Xem Chi Tiết
              </button>
            </div>

            {/* Trust Badges */}
            <div className="hero-trust">
              <div className="trust-item">
                <span className="trust-icon">⭐</span>
                <span className="trust-text">4.8/5 từ 1,234 đánh giá</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span className="trust-text">Bảo mật SSL 256-bit</span>
              </div>
            </div>
          </div>

          {/* RIGHT - Chatbot Demo */}
          <div className="hero-right">
            <div className="chatbot-preview-card">
              <div className="chatbot-header">
                <div className="chatbot-avatar">🔮</div>
                <div>
                  <div className="chatbot-title">Gem Master Chatbot</div>
                  <div className="chatbot-subtitle">
                    <span className="status-dot"></span>
                    Online
                  </div>
                </div>
              </div>

              <div className="chatbot-messages">
                <div className="message message-bot">
                  <div className="message-avatar">🔮</div>
                  <div className="message-bubble">
                    Chào bạn! Tôi có thể giúp bạn:
                    <ul>
                      <li>🎴 Xem vận may I Ching</li>
                      <li>🔮 Đọc bài Tarot</li>
                      <li>📊 Tư vấn trading</li>
                    </ul>
                  </div>
                </div>

                <div className="message message-user">
                  <div className="message-bubble">
                    Vận may hôm nay thế nào?
                  </div>
                </div>

                <div className="message message-bot">
                  <div className="message-avatar">🔮</div>
                  <div className="message-bubble">
                    <div className="hexagram">☰</div>
                    <strong>Quẻ Thiên (Heaven)</strong>
                    <p>Ngày tốt lành! Hãy quyết đoán...</p>
                  </div>
                </div>
              </div>

              <button
                className="btn-secondary"
                style={{ width: '100%' }}
                onClick={handleTryChatbot}
              >
                <span>✨</span>
                Thử Ngay Miễn Phí
              </button>

              <div className="chatbot-counter">
                <div className="counter-icon animate-pulse">👥</div>
                <div className="counter-text">
                  <strong>5,234</strong> traders đang sử dụng
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
