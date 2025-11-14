import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useIpQuota } from '../hooks/useIpQuota';
import SignupModal from '../components/SignupModal';
import { binanceApi } from '../services/binanceApi';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ipQuota, useIPQuotaSlot, refreshIPQuota } = useIpQuota();

  const [showSignupModal, setShowSignupModal] = useState(false);
  const [scanningBTC, setScanningBTC] = useState(false);
  const [btcResult, setBtcResult] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);

  // Fetch BTC price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const ticker = await binanceApi.get24hrTicker('BTCUSDT');
        if (ticker) {
          setBtcPrice({
            price: parseFloat(ticker.lastPrice),
            priceChangePercent: parseFloat(ticker.priceChangePercent)
          });
        }
      } catch (error) {
        console.error('Error fetching BTC price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, []);

  // Handle Bitcoin scan (public, IP-based)
  const handleBitcoinScan = async () => {
    // If already logged in, redirect to scanner
    if (user) {
      navigate('/scanner');
      return;
    }

    // Check IP quota
    if (!ipQuota.canScan) {
      setShowSignupModal(true);
      return;
    }

    try {
      setScanningBTC(true);
      setBtcResult(null);

      // Use IP quota slot
      const quotaResult = await useIPQuotaSlot();

      if (!quotaResult.success) {
        if (quotaResult.needsSignup) {
          setShowSignupModal(true);
        } else {
          alert(`❌ ${quotaResult.error}`);
        }
        return;
      }

      // Simulate Bitcoin scan (mock pattern for now)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPattern = {
        signal: 'LONG',
        pattern: 'DPD',
        description: 'Down-Pause-Down Pattern',
        confidence: 78,
        entry: btcPrice?.price || 110000,
        stopLoss: (btcPrice?.price || 110000) * 0.98,
        takeProfit: (btcPrice?.price || 110000) * 1.05
      };

      setBtcResult(mockPattern);
      alert(`✅ Tìm thấy pattern! Còn ${quotaResult.remaining} lượt scan BTC miễn phí.`);

      await refreshIPQuota();

    } catch (error) {
      console.error('Bitcoin scan error:', error);
      alert('❌ Lỗi khi scan: ' + error.message);
    } finally {
      setScanningBTC(false);
    }
  };

  // Handle full scan (requires signup)
  const handleFullScan = () => {
    if (user) {
      navigate('/scanner');
    } else {
      setShowSignupModal(true);
    }
  };

  return (
    <div className="landing-page">
      {/* ⚡ NÚT VỀ TRANG CHỦ */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-ghost back-to-home-btn"
      >
        🏠 Về Trang Chủ
      </button>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gem-icon">💎</span>
            GEM Trading Academy
          </h1>
          <p className="hero-subtitle">
            Phát Hiện Pattern Trading Tự Động với AI
          </p>
          <p className="hero-description">
            Quét thị trường crypto 24/7 để tìm cơ hội giao dịch tốt nhất
          </p>
        </div>

        {/* BTC Price Card (Blurred if not logged in) */}
        <div className={`btc-card ${!user ? 'blurred' : ''}`}>
          <div className="btc-header">
            <span className="btc-symbol">₿ Bitcoin</span>
            {btcPrice && (
              <span className={`btc-change ${btcPrice.priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                {btcPrice.priceChangePercent >= 0 ? '▲' : '▼'} {Math.abs(btcPrice.priceChangePercent).toFixed(2)}%
              </span>
            )}
          </div>

          {btcPrice && (
            <div className="btc-price">${btcPrice.price.toLocaleString()}</div>
          )}

          {!user && (
            <div className="blur-overlay">
              <div className="blur-message">
                <span className="lock-icon">🔒</span>
                <p>Đăng ký để xem giá chi tiết</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowSignupModal(true)}
                >
                  Mở Khóa Ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Scan Options */}
      <section className="scan-options">
        <h2>Chọn Loại Scan</h2>

        <div className="scan-cards">

          {/* Bitcoin Public Scan */}
          <div className="scan-card bitcoin">
            <div className="scan-card-header">
              <span className="scan-icon">₿</span>
              <h3>Bitcoin Scan</h3>
              <span className="scan-badge free">MIỄN PHÍ</span>
            </div>

            <div className="scan-card-body">
              <p className="scan-description">
                Quét Bitcoin pattern miễn phí mỗi ngày
              </p>

              <div className="scan-features">
                <div className="feature">✅ 3 basic patterns</div>
                <div className="feature">✅ 1 hour timeframe</div>
                <div className="feature">✅ Entry/SL/TP levels</div>
              </div>

              {!user && (
                <div className="scan-quota-info">
                  {ipQuota.loading ? (
                    <span>Đang tải...</span>
                  ) : (
                    <>
                      <span className="quota-badge">
                        {ipQuota.remaining}/{ipQuota.maxScans} lượt còn lại
                      </span>
                      {ipQuota.resetAt && (
                        <span className="quota-reset">
                          Reset: {new Date(ipQuota.resetAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleBitcoinScan}
              disabled={scanningBTC || (!user && !ipQuota.canScan)}
              className="btn btn-secondary btn-lg"
            >
              {scanningBTC ? (
                <>
                  <span className="spinner"></span>
                  Đang quét...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  {user ? 'Quét Bitcoin' : 'Quét BTC Miễn Phí'}
                </>
              )}
            </button>

            {!user && !ipQuota.canScan && (
              <p className="scan-limit-text">
                ⚠️ Đã hết lượt scan. <a href="#" onClick={(e) => { e.preventDefault(); setShowSignupModal(true); }}>Đăng ký</a> để có thêm quota!
              </p>
            )}
          </div>

          {/* Full Scan (Requires Signup) */}
          <div className="scan-card full">
            <div className="scan-card-header">
              <span className="scan-icon">🎯</span>
              <h3>Full Scan</h3>
              <span className="scan-badge premium">ĐĂNG KÝ</span>
            </div>

            <div className="scan-card-body">
              <p className="scan-description">
                Quét toàn bộ 10+ coins với nhiều patterns hơn
              </p>

              <div className="scan-features">
                <div className="feature">✅ 20+ coins (BTC, ETH, BNB...)</div>
                <div className="feature">✅ 6 patterns (FREE)</div>
                <div className="feature">✅ Real-time alerts</div>
                <div className="feature">⭐ 5 scans/day (FREE account)</div>
              </div>

              {user && (
                <div className="scan-quota-info authenticated">
                  <span className="user-badge">
                    ✅ Đã đăng nhập
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleFullScan}
              className="btn btn-primary btn-lg"
            >
              {user ? (
                <>
                  <span>🚀</span>
                  Vào Scanner
                </>
              ) : (
                <>
                  <span>📝</span>
                  Đăng Ký Miễn Phí
                </>
              )}
            </button>

            {!user && (
              <p className="scan-benefit-text">
                💎 Đăng ký FREE → 5 scans/day + Trading Journal
              </p>
            )}
          </div>

        </div>
      </section>

      {/* Bitcoin Scan Result */}
      {btcResult && (
        <section className="btc-result">
          <h3>📊 Kết Quả Scan Bitcoin</h3>

          <div className="result-card">
            <div className="result-header">
              <span className="result-symbol">BTC</span>
              <span className={`result-signal ${btcResult.signal.toLowerCase()}`}>
                {btcResult.signal}
              </span>
            </div>

            <div className="result-pattern">
              <span className="pattern-badge">{btcResult.pattern}</span>
              <span className="pattern-description">{btcResult.description}</span>
            </div>

            <div className="result-confidence">
              <div className="confidence-label">
                Độ tin cậy: {btcResult.confidence}%
              </div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${btcResult.confidence}%` }}
                />
              </div>
            </div>

            <div className="result-levels">
              <div className="level-item">
                <span className="level-label">Entry:</span>
                <span className="level-value">${btcResult.entry.toFixed(2)}</span>
              </div>
              <div className="level-item">
                <span className="level-label">Stop Loss:</span>
                <span className="level-value stop">${btcResult.stopLoss.toFixed(2)}</span>
              </div>
              <div className="level-item">
                <span className="level-label">Take Profit:</span>
                <span className="level-value profit">${btcResult.takeProfit.toFixed(2)}</span>
              </div>
            </div>

            <div className="result-cta">
              <p>🎉 Muốn scan thêm 20+ coins nữa?</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowSignupModal(true)}
              >
                Đăng Ký FREE → 5 Scans/Day
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features">
        <h2>Tại Sao Chọn GEM Trading?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🤖</span>
            <h4>AI Pattern Detection</h4>
            <p>Tự động phát hiện 6+ patterns kinh điển</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h4>Real-time Alerts</h4>
            <p>Nhận thông báo ngay khi có cơ hội</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h4>Trading Journal</h4>
            <p>Theo dõi và phân tích giao dịch</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🎓</span>
            <h4>Educational Content</h4>
            <p>Học GEM Frequency Method</p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pricing">
        <h2>Chọn Gói Phù Hợp</h2>

        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>FREE</h3>
            <div className="price">0đ</div>
            <ul>
              <li>✅ 5 scans/day</li>
              <li>✅ 3 basic patterns</li>
              <li>✅ 20+ coins</li>
              <li>✅ Trading journal (50 trades)</li>
            </ul>
            <button
              className="btn btn-outline"
              onClick={() => setShowSignupModal(true)}
            >
              Đăng Ký Miễn Phí
            </button>
          </div>

          <div className="pricing-card featured">
            <div className="popular-badge">PHỔ BIẾN</div>
            <h3>TIER 1</h3>
            <div className="price">10M VND</div>
            <ul>
              <li>✅ Unlimited scans</li>
              <li>✅ 6 patterns</li>
              <li>✅ 20+ coins</li>
              <li>✅ Telegram alerts</li>
              <li>✅ Unlimited journal</li>
            </ul>
            <button
              className="btn btn-primary"
              onClick={() => setShowSignupModal(true)}
            >
              Nâng Cấp Ngay
            </button>
          </div>

          <div className="pricing-card">
            <h3>TIER 2</h3>
            <div className="price">38M VND</div>
            <ul>
              <li>✅ All Tier 1 features</li>
              <li>✅ 6+ patterns</li>
              <li>✅ 50+ coins</li>
              <li>✅ Multi-timeframe</li>
              <li>✅ Portfolio tracker</li>
            </ul>
            <button
              className="btn btn-outline"
              onClick={() => setShowSignupModal(true)}
            >
              Tìm Hiểu Thêm
            </button>
          </div>
        </div>
      </section>

      {/* Signup Modal */}
      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          quotaRemaining={ipQuota.remaining}
        />
      )}

    </div>
  );
}
