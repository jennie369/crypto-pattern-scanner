import React from 'react';
import { Rocket, Zap, CreditCard, Check, Shield, Flame, Target } from 'lucide-react';
import './FinalCTA.css';

export const FinalCTA = () => {
  const handleGetStarted = () => {
    window.location.href = '/signup';
  };

  return (
    <section className="final-cta-section">
      <div className="container">
        <div className="final-cta-content">
          <div className="cta-icon"><Rocket size={48} /></div>

          <h2 className="cta-headline">
            Sẵn Sàng Nâng Tầm Trading Game?
          </h2>

          <p className="cta-subheadline">
            Tham gia cùng <strong>5,000+ traders</strong> đang sử dụng Gemral
          </p>

          <div className="cta-benefits">
            <div className="cta-benefit">
              <span className="benefit-icon"><Zap size={20} /></span>
              <span>Bắt đầu ngay trong 2 phút</span>
            </div>
            <div className="cta-benefit">
              <span className="benefit-icon"><CreditCard size={20} /></span>
              <span>Không cần thẻ tín dụng</span>
            </div>
            <div className="cta-benefit">
              <span className="benefit-icon"><Check size={20} /></span>
              <span>Hủy bất cứ lúc nào</span>
            </div>
          </div>

          <button className="btn-primary btn-lg cta-button" onClick={handleGetStarted}>
            <span><Target size={20} /></span>
            Bắt Đầu Ngay - Hoàn Toàn Miễn Phí
          </button>

          <div className="cta-guarantee">
            <span className="guarantee-icon"><Shield size={20} /></span>
            <span className="guarantee-text">
              <strong>Cam kết hoàn tiền 100%</strong> trong 30 ngày nếu không hài lòng
            </span>
          </div>

          <div className="cta-urgency">
            <span className="urgency-icon"><Flame size={20} /></span>
            <span className="urgency-text">
              Ưu đãi đặc biệt: <strong>Giảm 20%</strong> cho 50 người đăng ký đầu tiên tháng này!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
