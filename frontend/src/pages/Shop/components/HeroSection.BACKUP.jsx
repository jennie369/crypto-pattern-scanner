import React from 'react';
import { Sparkles, TrendingUp, ShoppingBag, ArrowRight } from 'lucide-react';

const HeroSection = ({ totalProducts = 500, totalCustomers = 10000, averageRating = 4.9 }) => {
  return (
    <div className="hero-section">
      {/* Background Glow Layers */}
      <div className="hero-glow-container">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
      </div>

      {/* Glowing Crystal Center */}
      <div className="crystal-container">
        <div className="crystal-glow"></div>
        <div className="crystal-core">
          <svg viewBox="0 0 200 200" className="crystal-svg">
            {/* Diamond Shape */}
            <polygon
              points="100,20 180,100 100,180 20,100"
              fill="url(#crystalGradient)"
              className="crystal-facet"
            />
            <defs>
              <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="50%" stopColor="#FFBD59" />
                <stop offset="100%" stopColor="#FF8C42" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>Spiritual & Trading Tools</span>
        </div>

        <h1 className="hero-title">
          Nâng Tầm <span className="gradient-text">Tâm Linh</span>
          <br />& Giao Dịch Của Bạn
        </h1>

        <p className="hero-description">
          Khám phá bộ sưu tập đá quý, công cụ tâm linh, và khóa học trading chuyên nghiệp.
          Kết hợp năng lượng vũ trụ với chiến lược đầu tư thông minh.
        </p>

        <div className="hero-cta">
          <button className="btn-hero-primary">
            <ShoppingBag size={20} />
            <span>Khám Phá Ngay</span>
            <ArrowRight size={18} className="btn-arrow" />
          </button>
          <button className="btn-hero-secondary">
            <TrendingUp size={20} />
            <span>Xem Khóa Học</span>
          </button>
        </div>

        {/* Stats Row with Glassmorphism */}
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">{totalProducts}+</div>
            <div className="stat-label">Sản Phẩm</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">{totalCustomers >= 1000 ? `${(totalCustomers / 1000).toFixed(0)}K+` : `${totalCustomers}+`}</div>
            <div className="stat-label">Khách Hàng</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">{averageRating}</div>
            <div className="stat-label">Đánh Giá</div>
            <div className="stat-stars">⭐⭐⭐⭐⭐</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
