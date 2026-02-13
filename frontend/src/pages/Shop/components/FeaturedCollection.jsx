import React from 'react';
import { Sparkles, TrendingUp, Gem, GraduationCap, Bot } from 'lucide-react';

const FeaturedCollection = () => {
  const featuredItems = [
    {
      id: 1,
      title: 'Bộ Đá Quý Năng Lượng',
      description: 'Tăng cường năng lượng tích cực và may mắn',
      price: 1990000,
      image: Gem,
      tag: 'Phổ Biến'
    },
    {
      id: 2,
      title: 'Khóa Học Trading Pro',
      description: 'Chiến lược đầu tư chuyên nghiệp từ A-Z',
      price: 4990000,
      image: GraduationCap,
      tag: 'Hot'
    },
    {
      id: 3,
      title: 'Scanner AI Premium',
      description: 'Phân tích thị trường tự động với AI',
      price: 2990000,
      image: Bot,
      tag: 'Mới'
    }
  ];

  return (
    <div className="featured-collection-section">
      <div className="section-header">
        <div className="section-title-with-icon">
          <Sparkles size={24} className="section-icon" />
          <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
        </div>
        <p className="section-subtitle">Lựa chọn hàng đầu được yêu thích nhất</p>
      </div>

      <div className="featured-grid">
        {featuredItems.map((item) => {
          const IconComponent = item.image;
          return (
            <div key={item.id} className="featured-card">
              <div className="featured-tag">{item.tag}</div>

              <div className="featured-image">
                <IconComponent className="featured-emoji" size={48} strokeWidth={1.5} />
              </div>

              <h3 className="featured-title">{item.title}</h3>
              <p className="featured-description">{item.description}</p>

              <div className="featured-footer">
                <div className="featured-price">
                  {item.price.toLocaleString('vi-VN')}₫
                </div>
                <button className="btn-featured">
                  <TrendingUp size={16} />
                  Xem Ngay
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedCollection;
