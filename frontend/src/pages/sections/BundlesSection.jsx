import React, { useState, useEffect } from 'react';
import { Gift, Clock, Check, Zap, Flame, Star, Gem } from 'lucide-react';
import './BundlesSection.css';

const BundlesSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate time remaining until midnight
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight

      const diff = midnight - now;

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const bundles = [
    {
      id: 'tier1-bundle',
      name: 'TIER 1 PACKAGE',
      badge: 'FOUNDER BUNDLE',
      badgeIcon: <Gift size={16} />,
      discount: 70,
      originalPrice: 36400000,
      salePrice: 11000000,
      savings: 25400000,
      tier: 'tier1',
      color: '#4A9EFF',
      features: [
        '18 trading modules',
        'Scanner PRO (worth 11.964M)',
        'Chatbot PRO (worth 468K)',
        'Community access',
        'Email support',
      ],
      cta: 'Get TIER 1 Bundle',
      url: '/pricing?tier=tier1',
    },
    {
      id: 'tier2-bundle',
      name: 'TIER 2 PACKAGE',
      badge: 'MOST POPULAR',
      badgeIcon: <Star size={16} />,
      discount: 71,
      originalPrice: 73200000,
      salePrice: 21000000,
      savings: 52200000,
      tier: 'tier2',
      color: '#FFBD59',
      recommended: true,
      features: [
        'All TIER 1 features',
        '30 advanced chapters',
        '6 Frequency Formulas (Exclusive)',
        '15 patterns detection',
        '8 advanced tools',
        'Scanner PREMIUM (worth 23.964M)',
        'Chatbot Unlimited (worth 1.188M)',
        'Priority support',
      ],
      cta: 'Get TIER 2 Bundle',
      url: '/pricing?tier=tier2',
    },
    {
      id: 'tier3-bundle',
      name: 'TIER 3 ELITE',
      badge: 'VIP ACCESS',
      badgeIcon: <Gem size={16} />,
      discount: 65,
      originalPrice: 194000000,
      salePrice: 68000000,
      savings: 126000000,
      tier: 'tier3',
      color: '#B794F4',
      features: [
        'All TIER 2 features',
        'Complete 65 lessons',
        '24 pattern algorithms',
        'AI prediction strategies',
        'Whale tracking',
        'Portfolio optimization',
        'Personal trading coach',
        '24/7 VIP support',
      ],
      cta: 'Get TIER 3 Elite',
      url: '/pricing?tier=tier3',
    },
  ];

  return (
    <div className="bundles-section">
      {/* Header */}
      <div className="section-header">
        <h2><Flame size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Limited Time Bundles & Special Offers</h2>
        <p>
          Save up to 71% with our exclusive package deals.
          All bundles include lifetime access!
        </p>
      </div>

      {/* Countdown Banner */}
      <div className="countdown-banner">
        <div className="countdown-content">
          <Clock size={24} />
          <span className="countdown-label">Offer resets in:</span>
          <div className="countdown-timer">
            <div className="time-unit">
              <span className="time-value">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="time-label">hours</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-unit">
              <span className="time-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="time-label">min</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-unit">
              <span className="time-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="time-label">sec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="bundles-grid">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className={`bundle-card ${bundle.recommended ? 'recommended' : ''}`}
            style={{ '--bundle-color': bundle.color }}
          >
            {/* Recommended Badge */}
            {bundle.recommended && (
              <div className="recommended-badge">
                <Zap size={16} />
                RECOMMENDED
              </div>
            )}

            {/* Header */}
            <div className="bundle-header">
              <div className="bundle-badge">{bundle.badgeIcon} {bundle.badge}</div>
              <h3>{bundle.name}</h3>
              <div className="bundle-discount">Save {bundle.discount}%</div>
            </div>

            {/* Pricing */}
            <div className="bundle-pricing">
              <div className="original-price">
                {bundle.originalPrice.toLocaleString('vi-VN')}₫
              </div>
              <div className="sale-price">
                {bundle.salePrice.toLocaleString('vi-VN')}₫
              </div>
              <div className="savings">
                Save {bundle.savings.toLocaleString('vi-VN')}₫
              </div>
            </div>

            {/* Features */}
            <ul className="bundle-features">
              {bundle.features.map((feature, index) => (
                <li key={index}>
                  <Check size={16} />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a href={bundle.url} className="bundle-cta">
              {bundle.cta} →
            </a>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="section-footer">
        <div className="guarantee-banner">
          <Gift size={24} />
          <div>
            <h4>30-Day Money-Back Guarantee</h4>
            <p>Not satisfied? Get a full refund within 30 days, no questions asked.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundlesSection;
