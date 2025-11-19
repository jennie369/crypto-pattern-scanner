import React, { useState } from 'react';
import { Mail, Send, Check, Lock, BookOpen, Gift, Lightbulb } from 'lucide-react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // TODO: Integrate with email service
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-content">
          <Mail className="newsletter-icon" size={48} />

          <h2 className="newsletter-title">
            Nhận Ưu Đãi & Kiến Thức Trading
          </h2>

          <p className="newsletter-description">
            Đăng ký để nhận thông tin về sản phẩm mới, khóa học, và ưu đãi đặc biệt.
            Tặng kèm eBook Trading miễn phí!
          </p>

          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="newsletter-input-wrapper">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
                required
              />
              <button
                type="submit"
                className="newsletter-button"
                disabled={subscribed}
              >
                {subscribed ? (
                  <>
                    <Check size={20} />
                    <span>Đã Đăng Ký!</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Đăng Ký</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="newsletter-privacy">
            <Lock size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Chúng tôi tôn trọng quyền riêng tư của bạn. Không spam!
          </p>
        </div>

        <div className="newsletter-benefits">
          <div className="benefit-item">
            <BookOpen className="benefit-icon" size={20} strokeWidth={1.5} />
            <span className="benefit-text">eBook Trading miễn phí</span>
          </div>
          <div className="benefit-item">
            <Gift className="benefit-icon" size={20} strokeWidth={1.5} />
            <span className="benefit-text">Ưu đãi độc quyền</span>
          </div>
          <div className="benefit-item">
            <Lightbulb className="benefit-icon" size={20} strokeWidth={1.5} />
            <span className="benefit-text">Tips & Tricks hàng tuần</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignup;
