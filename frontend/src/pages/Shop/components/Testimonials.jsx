import React from 'react';
import { Star, Quote, User, UserCircle, Users } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Nguyễn Minh Anh',
      role: 'Trader',
      rating: 5,
      text: 'Khóa học trading rất chi tiết và dễ hiểu. Tôi đã có lãi 30% sau 2 tháng áp dụng!',
      avatar: User
    },
    {
      id: 2,
      name: 'Trần Thu Hà',
      role: 'Nhà Đầu Tư',
      rating: 5,
      text: 'Đá quý năng lượng giúp tôi tập trung hơn. Công cụ Scanner AI cũng rất chính xác.',
      avatar: UserCircle
    },
    {
      id: 3,
      name: 'Lê Hoàng Nam',
      role: 'CEO Startup',
      rating: 5,
      text: 'Sản phẩm chất lượng, giao hàng nhanh. Team hỗ trợ rất nhiệt tình!',
      avatar: Users
    }
  ];

  return (
    <div className="testimonials-section">
      <div className="section-header">
        <h2 className="section-title">Khách Hàng Nói Gì?</h2>
        <p className="section-subtitle">Trải nghiệm thực tế từ người dùng</p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((testimonial) => {
          const AvatarIcon = testimonial.avatar;
          return (
            <div key={testimonial.id} className="testimonial-card">
              <Quote className="quote-icon" size={32} />

              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#FFBD59" color="#FFBD59" />
                ))}
              </div>

              <p className="testimonial-text">{testimonial.text}</p>

              <div className="testimonial-author">
                <AvatarIcon className="author-avatar" size={40} strokeWidth={1.5} />
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Testimonials;
