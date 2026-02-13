import React from 'react';
import { Heart, Sparkles, DollarSign, ShoppingCart, Zap, Star, Clock } from 'lucide-react';
import './SpiritualCoursesSection.css';

const SpiritualCoursesSection = () => {
  const spiritualCourses = [
    {
      id: 'frequency-7days',
      title: '7 Ngày Khai Mở Tần Số',
      titleIcon: <Star size={20} />,
      description: 'Khóa học biến đổi tần số năng lượng trong 7 ngày. Chuyển hóa thân tâm linh - Nâng tần số độc lập - Hiểu hành các ngũ đại.',
      duration: '7 days intensive',
      price: 1990000,
      shopifyUrl: 'https://yinyangmasters.myshopify.com/products/7-ngay-khai-mo-tan-so',
      thumbnail: '/images/courses/spiritual-frequency.png',
      hasImage: true,
      features: [
        'Hệ Thống Học Ngay',
        '8 Giai Thức Chuyển Hóa',
        '24 Hours To Enlighten',
        'Hệ Thống Nhà Đại An Ninh',
      ],
    },
    {
      id: 'love-activation',
      title: 'Kích Hoạt Tình Yêu',
      titleIcon: <Heart size={20} />,
      description: 'Mở khóa năng lượng tình yêu và thu hút mối quan hệ hạnh phúc',
      duration: '7 days',
      price: 399000,
      shopifyUrl: 'https://yinyangmasters.myshopify.com/products/kich-hoat-tinh-yeu',
      thumbnail: null,
      hasImage: false,
      icon: Heart,
      features: [
        'Heart chakra activation',
        'Self-love practices',
        'Relationship manifestation',
        'Energetic alignment',
      ],
    },
    {
      id: 'millionaire-mindset',
      title: 'Tư Duy Triệu Phú',
      titleIcon: <DollarSign size={20} />,
      description: 'Xây dựng tư duy và tần số của người giàu có',
      duration: '14 days',
      price: 499000,
      shopifyUrl: 'https://yinyangmasters.myshopify.com/products/tu-duy-trieu-phu',
      thumbnail: null,
      hasImage: false,
      icon: DollarSign,
      features: [
        'Abundance mindset shift',
        'Money frequency activation',
        'Wealth manifestation',
        'Financial goal setting',
      ],
    },
  ];

  const handleBuyNow = (course) => {
    window.open(course.shopifyUrl, '_blank');
  };

  return (
    <div className="spiritual-courses-section">
      {/* Header */}
      <div className="section-header">
        <h2><Sparkles size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> GEM Academy - Spiritual Transformation</h2>
        <p>
          Khóa học tâm linh và phát triển bản thân từ YinYang Masters.
          Riêng biệt với các gói đăng ký trading.
        </p>
      </div>

      {/* Note Banner */}
      <div className="info-banner">
        <Heart size={20} />
        <span>
          Các khóa học này được mua riêng lẻ, độc lập với gói đăng ký GEM Trading
        </span>
      </div>

      {/* Courses Grid */}
      <div className="spiritual-courses-grid">
        {spiritualCourses.map((course) => {
          const Icon = course.icon;
          return (
            <div key={course.id} className="spiritual-course-card">
              {/* Thumbnail */}
              <div className="course-thumbnail">
                {course.hasImage ? (
                  <img src={course.thumbnail} alt={course.title} />
                ) : (
                  <div className="thumbnail-placeholder">
                    {Icon && <Icon size={48} />}
                    {!Icon && <Sparkles size={48} />}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="course-content">
                <h3>{course.titleIcon} {course.title}</h3>
                <p className="course-description">{course.description}</p>

                {/* Features */}
                <ul className="course-features">
                  {course.features.map((feature, index) => (
                    <li key={index}><Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {feature}</li>
                  ))}
                </ul>

                {/* Duration */}
                <div className="course-meta">
                  <span className="duration">
                    <Clock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {course.duration}
                  </span>
                </div>

                {/* Price & CTA */}
                <div className="course-footer">
                  <div className="price">
                    {course.price.toLocaleString('vi-VN')} ₫
                  </div>
                  <button
                    className="btn-buy-now"
                    onClick={() => handleBuyNow(course)}
                  >
                    <ShoppingCart size={18} />
                    Mua Ngay
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="section-footer">
        <a
          href="https://yinyangmasters.myshopify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-view-all"
        >
          Xem Tất Cả Khóa Học Tâm Linh →
        </a>
      </div>
    </div>
  );
};

export default SpiritualCoursesSection;
