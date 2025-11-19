import React from 'react';
import {
  Star, Users, Award, Shield, TrendingUp, Check, User,
  Crown, GraduationCap, Gift, Gem
} from 'lucide-react';
import './Section8_SocialProof.css';

export default function Section8_SocialProof() {
  const testimonials = [
    {
      name: "Nguyễn Minh Tuấn",
      role: "CEO Tech Startup",
      avatar: <User size={32} />,
      quote: "Set tinh thể của tôi được trưng bày ngay góc làm việc. Mỗi meeting quan trọng, tôi đều cầm viên Citrine trong tay. Công ty tăng trưởng 300% trong năm qua - không phải ngẫu nhiên.",
      verified: true,
      rating: 5,
      product: "Elite Crystal Set"
    },
    {
      name: "Lê Thanh Hương",
      role: "Wellness Coach",
      avatar: <User size={32} />,
      quote: "Là người làm nghề healing, tôi rất kỹ tính về năng lượng. Quality của tinh thể ở đây là top-tier, cleanse chuẩn chỉ, packaging sang trọng. Đã recommend cho 50+ clients.",
      verified: true,
      rating: 5,
      product: "Meditation Starter Kit"
    },
    {
      name: "Trần Hoàng Anh",
      role: "Investment Director",
      avatar: <User size={32} />,
      quote: "Ban đầu tôi hoài nghi. Nhưng sau 3 tháng, portfolio tăng 180%, career breakthrough ngoài mong đợi. Giờ tôi có cả collection và không ngừng mua thêm.",
      verified: true,
      rating: 5,
      product: "Prosperity Collection"
    }
  ];

  const stats = [
    {
      number: "15,234",
      label: "Khách Hàng Hài Lòng",
      icon: <Users size={32} />
    },
    {
      number: "4.9/5",
      label: "Đánh Giá Trung Bình",
      icon: <Star size={32} />
    },
    {
      number: "89%",
      label: "Khách Quay Lại Mua",
      icon: <TrendingUp size={32} />
    },
    {
      number: "1,247",
      label: "Reviews Đã Verify",
      icon: <Award size={32} />
    }
  ];

  const vipBenefits = [
    {
      icon: <Crown size={32} />,
      title: "VIP Community",
      description: "Private group với 3,000+ members cao cấp"
    },
    {
      icon: <GraduationCap size={32} />,
      title: "Exclusive Workshops",
      description: "Monthly sessions với expert về crystal healing"
    },
    {
      icon: <Gift size={32} />,
      title: "Early Access",
      description: "Ưu tiên mua sản phẩm limited edition trước 48h"
    },
    {
      icon: <Gem size={32} />,
      title: "Lifetime Support",
      description: "1-on-1 consulting về crystal setup và feng shui"
    }
  ];

  const trustBadges = [
    { icon: <Shield size={24} />, text: "Đá thiên nhiên 100%" },
    { icon: <Check size={24} />, text: "Hoàn tiền trong 30 ngày" },
    { icon: <Award size={24} />, text: "Chứng nhận nguồn gốc" },
    { icon: <Users size={24} />, text: "15K+ khách tin tưởng" }
  ];

  return (
    <section className="social-proof-section">
      <div className="social-proof-container">

        {/* Section Header */}
        <div className="social-proof-header">
          <p className="social-proof-eyebrow">
            <Award size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
            SOCIAL PROOF
          </p>
          <h2 className="social-proof-title">
            Tin Cậy Bởi <span className="gradient-text">15,000+</span><br />
            Khách Hàng Cao Cấp
          </h2>
          <p className="social-proof-subtitle">
            CEO, Doanh nhân, Nghệ sĩ, Chuyên gia từ khắp VN & Thế giới
          </p>
        </div>

        {/* Star Rating */}
        <StarRating rating={4.9} count={1247} />

        {/* Testimonials Grid */}
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h3 className="stats-title">
            <TrendingUp size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
            Những Con Số Ấn Tượng
          </h3>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Community */}
        <div className="vip-community">
          <div className="vip-header">
            <h3 className="vip-title">
              <Crown size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
              Tham Gia VIP Community
            </h3>
            <p className="vip-subtitle">
              Mua sắm từ 5M trở lên → Tự động trở thành VIP Member
            </p>
          </div>

          <div className="vip-benefits-grid">
            {vipBenefits.map((benefit, index) => (
              <div key={index} className="vip-benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h4 className="benefit-title">{benefit.title}</h4>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="vip-cta">
            <p className="vip-cta-text">
              <strong>Hơn 3,000 VIP members</strong> đang tận hưởng đặc quyền
            </p>
            <button className="btn-vip">Xem Chi Tiết VIP Program</button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="trust-badges">
          {trustBadges.map((badge, index) => (
            <div key={index} className="trust-badge">
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-text">{badge.text}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// Sub-components
function StarRating({ rating, count }) {
  return (
    <div className="star-rating">
      <div className="stars">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={32}
            fill={index < Math.floor(rating) ? "#FFBD59" : "none"}
            color="#FFBD59"
          />
        ))}
      </div>
      <div className="rating-text">
        <span className="rating-number">{rating}</span>
        <span className="rating-count">dựa trên {count.toLocaleString()} đánh giá</span>
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="testimonial-card">
      {/* Header */}
      <div className="testimonial-header">
        <div className="testimonial-avatar">{testimonial.avatar}</div>
        <div className="testimonial-info">
          <div className="testimonial-name">
            {testimonial.name}
            {testimonial.verified && (
              <span className="verified-badge">
                <Check size={14} />
              </span>
            )}
          </div>
          <div className="testimonial-role">{testimonial.role}</div>
        </div>
        <div className="testimonial-rating">
          {[...Array(testimonial.rating)].map((_, index) => (
            <Star key={index} size={16} fill="#FFBD59" color="#FFBD59" />
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="testimonial-quote">
        <p className="quote-text">"{testimonial.quote}"</p>
      </div>

      {/* Footer */}
      <div className="testimonial-footer">
        <div className="product-tag">
          <Award size={14} />
          <span>{testimonial.product}</span>
        </div>
        <div className="verified-tag">
          <Check size={14} />
          <span>Verified Purchase</span>
        </div>
      </div>
    </div>
  );
}
