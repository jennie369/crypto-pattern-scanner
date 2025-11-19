import React from 'react';
import {
  Heart, MessageCircle, Share2, Instagram, TrendingUp, Briefcase,
  User, Moon, Image, Star, Flame, Check, Camera, Sparkles
} from 'lucide-react';
import './Section4_Lifestyle.css';

export default function Section4_Lifestyle() {
  const lifestyleCards = [
    {
      icon: <Briefcase size={32} />,
      title: "WFH Vibes",
      badge: "Trending",
      description: "Góc làm việc tại nhà đẹp lung linh với tinh thể trên bàn, ánh sáng vàng ấm, và năng lượng dồi dào mỗi ngày.",
      image: <Image size={48} />, // Placeholder - replace with actual image
      features: [
        "Desk setup sang chảnh",
        "Ánh sáng tự nhiên đẹp",
        "Background zoom meeting xịn"
      ],
      engagement: { likes: "2.3K", comments: "187", shares: "234" },
      hashtags: ["#WFHGoals", "#CrystalDesk", "#ProductiveVibes"]
    },
    {
      icon: <Heart size={32} />,
      title: "Meditation Corner",
      badge: "Most Saved",
      description: "Góc thiền riêng với altar đầy tinh thể, nến thơm, và không gian yên tĩnh để kết nối bản thân.",
      image: <Image size={48} />,
      features: [
        "Altar setup đẹp như spa",
        "Peaceful morning rituals",
        "Instagram-worthy corner"
      ],
      engagement: { likes: "3.1K", comments: "245", shares: "412" },
      hashtags: ["#MeditationSpace", "#SelfCare", "#ZenVibes"]
    },
    {
      icon: <Moon size={32} />,
      title: "Bedside Aesthetic",
      badge: "Viral",
      description: "Góc đầu giường với tinh thể Amethyst giúp ngủ ngon, sách hay, và không gian thư giãn tối đa.",
      image: <Image size={48} />,
      features: [
        "Better sleep quality",
        "Aesthetic nightstand",
        "Calming energy"
      ],
      engagement: { likes: "4.5K", comments: "312", shares: "589" },
      hashtags: ["#BedroomVibes", "#SleepBetter", "#NightRoutine"]
    }
  ];

  const influencers = [
    {
      name: "Minh Khuê",
      handle: "@minhkhue.lifestyle",
      avatar: <User size={32} />,
      followers: "125K",
      quote: "Từ khi bắt đầu sử dụng tinh thể trong không gian sống, tôi cảm nhận được sự thay đổi rõ rệt về năng lượng và tâm trạng. Setup của tôi được follower yêu thích nhất!",
      verified: true
    },
    {
      name: "Tuấn Anh",
      handle: "@tuananh.minimal",
      avatar: <User size={32} />,
      followers: "89K",
      quote: "Minimalist không có nghĩa là thiếu thốn. Mỗi viên crystal tôi chọn đều có ý nghĩa riêng, vừa đẹp vừa mang năng lượng tích cực cho workspace.",
      verified: true
    },
    {
      name: "Linh Chi",
      handle: "@linhchi.wellness",
      avatar: <User size={32} />,
      followers: "203K",
      quote: "Meditation corner của tôi đã viral 2.3M views! Bí quyết? Chọn đúng tinh thể, sắp xếp đúng cách, và để năng lượng tự nhiên tỏa sáng.",
      verified: true
    }
  ];

  return (
    <section className="lifestyle-section">
      <div className="lifestyle-container">

        {/* Section Header */}
        <div className="lifestyle-header">
          <p className="lifestyle-eyebrow">
            <Camera size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
            INSTAGRAM AESTHETIC
          </p>
          <h2 className="lifestyle-title">
            Biến Nhà Bạn Thành<br />
            <span className="gradient-text">Pinterest Aesthetic</span>
          </h2>
          <p className="lifestyle-subtitle">
            Không gian sống đẹp = Tâm trạng đẹp = Cuộc đời đẹp
          </p>
        </div>

        {/* Social Proof Badges */}
        <SocialProofBadges />

        {/* Lifestyle Cards Grid */}
        <div className="lifestyle-grid">
          {lifestyleCards.map((card, index) => (
            <LifestyleCard key={index} card={card} />
          ))}
        </div>

        {/* UGC Stats */}
        <UGCStats />

        {/* Influencer Testimonials */}
        <div className="influencer-section">
          <h3 className="influencer-title">
            <MessageCircle size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
            Influencers Yêu Thích
          </h3>
          <div className="influencer-grid">
            {influencers.map((influencer, index) => (
              <InfluencerCard key={index} influencer={influencer} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="lifestyle-cta">
          <h3 className="cta-title">Sẵn Sàng Tạo Không Gian Đẹp Của Riêng Bạn?</h3>
          <button className="btn-lifestyle-cta">
            <Instagram size={20} />
            <span>Khám Phá Bộ Sưu Tập</span>
          </button>
        </div>

      </div>
    </section>
  );
}

// Sub-components
function SocialProofBadges() {
  const badges = [
    { icon: <Camera size={24} />, count: "15K+", label: "Photos từ khách hàng" },
    { icon: <Star size={24} />, count: "4.9/5", label: "Đánh giá trung bình" },
    { icon: <Flame size={24} />, count: "2.3M", label: "Lượt xem trên social" },
    { icon: <Heart size={24} />, count: "89%", label: "Khách quay lại mua" }
  ];

  return (
    <div className="social-proof-badges">
      {badges.map((badge, index) => (
        <div key={index} className="badge-item">
          <div className="badge-icon">{badge.icon}</div>
          <div className="badge-content">
            <div className="badge-count">{badge.count}</div>
            <div className="badge-label">{badge.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LifestyleCard({ card }) {
  return (
    <div className="lifestyle-card">
      {/* Badge */}
      {card.badge && (
        <div className="lifestyle-badge">
          <TrendingUp size={14} />
          <span>{card.badge}</span>
        </div>
      )}

      {/* Image Placeholder */}
      <div className="lifestyle-image">
        <div className="image-placeholder">{card.image}</div>
        <div className="image-overlay">
          <div className="lifestyle-icon">{card.icon}</div>
        </div>
      </div>

      {/* Content */}
      <div className="lifestyle-content">
        <h3 className="lifestyle-card-title">{card.title}</h3>
        <p className="lifestyle-description">{card.description}</p>

        {/* Features */}
        <div className="lifestyle-features">
          {card.features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-check"><Check size={16} /></span>
              <span className="feature-text">{feature}</span>
            </div>
          ))}
        </div>

        {/* Hashtags */}
        <div className="lifestyle-hashtags">
          {card.hashtags.map((tag, index) => (
            <span key={index} className="hashtag">{tag}</span>
          ))}
        </div>

        {/* Engagement Stats */}
        <div className="engagement-stats">
          <div className="stat">
            <Heart size={16} />
            <span>{card.engagement.likes}</span>
          </div>
          <div className="stat">
            <MessageCircle size={16} />
            <span>{card.engagement.comments}</span>
          </div>
          <div className="stat">
            <Share2 size={16} />
            <span>{card.engagement.shares}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UGCStats() {
  return (
    <div className="ugc-stats">
      <div className="ugc-header">
        <h3 className="ugc-title">
          <Sparkles size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
          Cộng Đồng Đang Yêu Thích
        </h3>
        <p className="ugc-subtitle">Hàng nghìn khách hàng đã chia sẻ không gian của họ</p>
      </div>

      <div className="ugc-grid">
        <div className="ugc-stat-card">
          <div className="ugc-number">15,234</div>
          <div className="ugc-label">Photos được tag</div>
          <div className="ugc-growth">↑ 234% tháng này</div>
        </div>
        <div className="ugc-stat-card">
          <div className="ugc-number">2.3M</div>
          <div className="ugc-label">Lượt tiếp cận</div>
          <div className="ugc-growth">↑ Viral trên TikTok</div>
        </div>
        <div className="ugc-stat-card">
          <div className="ugc-number">
            4.9<Star size={16} style={{display: 'inline', verticalAlign: 'middle', marginLeft: '4px'}} fill="#FFBD59" color="#FFBD59" />
          </div>
          <div className="ugc-label">Đánh giá setup</div>
          <div className="ugc-growth">1,247 reviews</div>
        </div>
      </div>

      <div className="ugc-gallery">
        <p className="ugc-gallery-text">
          <Camera size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
          <strong>#GEMCrystalSetup</strong> để được featured trên Instagram của chúng tôi!
        </p>
      </div>
    </div>
  );
}

function InfluencerCard({ influencer }) {
  return (
    <div className="influencer-card">
      <div className="influencer-header">
        <div className="influencer-avatar">{influencer.avatar}</div>
        <div className="influencer-info">
          <div className="influencer-name">
            {influencer.name}
            {influencer.verified && (
              <span className="verified-badge">
                <Check size={14} />
              </span>
            )}
          </div>
          <div className="influencer-handle">{influencer.handle}</div>
          <div className="influencer-followers">
            <Instagram size={14} />
            <span>{influencer.followers} followers</span>
          </div>
        </div>
      </div>

      <div className="influencer-quote">
        <p className="quote-text">"{influencer.quote}"</p>
      </div>

      <button className="btn-follow">
        <Instagram size={16} />
        <span>Follow</span>
      </button>
    </div>
  );
}
