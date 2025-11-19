import React, { useState } from 'react';
import { User, Star } from 'lucide-react';
import './TestimonialsCarousel.css';

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      tier: 'TIER 2',
      avatar: <User size={32} />,
      rating: 5,
      text: 'GEM Platform đã giúp tôi tăng win rate từ 45% lên 68% chỉ sau 3 tháng. DPD và UPU patterns cực kỳ chính xác!',
      date: '2025-10-15'
    },
    {
      name: 'Trần Thị B',
      tier: 'TIER 3',
      avatar: <User size={32} />,
      rating: 5,
      text: 'Backtesting engine và AI prediction tool rất mạnh. Tôi đã kiếm được 150% ROI trong 6 tháng qua.',
      date: '2025-09-20'
    },
    {
      name: 'Lê Minh C',
      tier: 'TIER 1',
      avatar: <User size={32} />,
      rating: 5,
      text: 'Support team cực kỳ nhiệt tình. Telegram alerts giúp tôi không bỏ lỡ cơ hội nào!',
      date: '2025-11-05'
    }
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2>Khách Hàng Nói Gì</h2>
          <p>Hơn 5,000 traders đang tin tưởng sử dụng GEM Platform</p>
        </div>

        <div className="testimonial-carousel">
          <button className="carousel-btn prev" onClick={handlePrev}>
            ←
          </button>

          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">{currentTestimonial.avatar}</div>
              <div className="testimonial-info">
                <div className="testimonial-name">{currentTestimonial.name}</div>
                <div className="testimonial-tier-badge">{currentTestimonial.tier}</div>
              </div>
            </div>

            <div className="testimonial-rating">
              {Array.from({ length: currentTestimonial.rating }).map((_, idx) => (
                <span key={idx} className="star"><Star size={20} fill="currentColor" /></span>
              ))}
            </div>

            <p className="testimonial-text">"{currentTestimonial.text}"</p>

            <div className="testimonial-date">
              {new Date(currentTestimonial.date).toLocaleDateString('vi-VN')}
            </div>
          </div>

          <button className="carousel-btn next" onClick={handleNext}>
            →
          </button>
        </div>

        <div className="carousel-dots">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
