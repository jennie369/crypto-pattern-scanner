import React from 'react';
import { Check, CreditCard, ShieldCheck } from 'lucide-react';
import './PricingTable.css';

export const PricingTable = () => {
  const tiers = [
    {
      name: 'FREE',
      price: '0đ',
      period: '/tháng',
      popular: false,
      features: [
        '5 scans/ngày',
        '6 basic patterns',
        '20+ coins',
        'Trading journal (50 trades)',
        'Email support'
      ],
      cta: 'Bắt Đầu Miễn Phí'
    },
    {
      name: 'TIER 1',
      price: '11M VND',
      period: '/năm',
      popular: false,
      features: [
        'Unlimited scans',
        '6 patterns',
        '20+ coins',
        'Telegram alerts',
        'Unlimited journal',
        'Priority support'
      ],
      cta: 'Nâng Cấp Ngay'
    },
    {
      name: 'TIER 2',
      price: '21M VND',
      period: '/năm',
      popular: true,
      features: [
        'All Tier 1 features',
        '15 advanced patterns',
        '50+ coins',
        'Multi-timeframe analysis',
        'Portfolio tracker',
        'Backtesting engine',
        'VIP support'
      ],
      cta: 'Phổ Biến Nhất'
    },
    {
      name: 'TIER 3',
      price: '68M VND',
      period: '/năm',
      popular: false,
      features: [
        'All Tier 2 features',
        'AI predictions (73% accuracy)',
        'Whale tracker',
        'Professional signals',
        'Mastermind group',
        'Lifetime community',
        '24/7 support'
      ],
      cta: 'Trở Thành Pro'
    }
  ];

  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="section-header">
          <h2>Chọn Gói Phù Hợp</h2>
          <p>Bắt đầu miễn phí, nâng cấp khi sẵn sàng</p>
        </div>

        <div className="pricing-grid">
          {tiers.map((tier, index) => (
            <div key={index} className={`pricing-card ${tier.popular ? 'popular' : ''}`}>
              {tier.popular && (
                <div className="popular-badge">PHỔ BIẾN NHẤT</div>
              )}

              <div className="pricing-header">
                <h3>{tier.name}</h3>
                <div className="pricing-price">
                  <span className="price">{tier.price}</span>
                  <span className="period">{tier.period}</span>
                </div>
              </div>

              <ul className="pricing-features">
                {tier.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={tier.popular ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%' }}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <p><CreditCard size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Chấp nhận thanh toán: Chuyển khoản, Momo, ZaloPay</p>
          <p><ShieldCheck size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Hoàn tiền 100% trong 30 ngày nếu không hài lòng</p>
        </div>
      </div>
    </section>
  );
};

export default PricingTable;
