import React, { useState } from 'react';
import {
  ArrowRight, Check, TrendingUp, Calendar, Frown, MessageCircle,
  Wind, TrendingDown, HeartCrack, Smile, Sparkles, Home,
  Zap, Heart, Sprout, Droplets, Flame, Gem, Rocket
} from 'lucide-react';
import './Section7_BeforeAfter.css';

export default function Section7_BeforeAfter() {
  const [activePhase, setActivePhase] = useState(0);

  const beforePoints = [
    { icon: <Frown size={24} />, text: "Stress mãn tính, mất ngủ thường xuyên" },
    { icon: <MessageCircle size={24} />, text: "Suy nghĩ tiêu cực, lo âu không rõ lý do" },
    { icon: <Wind size={24} />, text: "Không gian lộn xộn, thiếu năng lượng" },
    { icon: <TrendingDown size={24} />, text: "Năng suất thấp, thiếu động lực" },
    { icon: <HeartCrack size={24} />, text: "Mối quan hệ căng thẳng, xung đột" }
  ];

  const afterPoints = [
    { icon: <Smile size={24} />, text: "Ngủ ngon hơn 85%, tâm trạng ổn định" },
    { icon: <Sparkles size={24} />, text: "Tư duy tích cực, tràn đầy hi vọng" },
    { icon: <Home size={24} />, text: "Không gian hài hòa, đẹp như mơ" },
    { icon: <TrendingUp size={24} />, text: "Năng suất tăng 2-3x, focus tốt hơn" },
    { icon: <Heart size={24} />, text: "Quan hệ cải thiện, yêu thương nhiều hơn" }
  ];

  const phases = [
    {
      icon: <Sprout size={32} />,
      days: "Ngày 1-7",
      title: "Thiết Lập Không Gian",
      description: "Tuần đầu tiên là nền móng. Bạn bắt đầu cleanse đá, đặt altar, và tạo thói quen mới.",
      milestones: [
        "Cleanse tinh thể lần đầu (dưới trăng/nước muối)",
        "Đặt đá vào vị trí phù hợp (theo feng shui)",
        "Thiết lập meditation corner riêng"
      ],
      progress: 10,
      color: "#10B981"
    },
    {
      icon: <Droplets size={32} />,
      days: "Ngày 8-30",
      title: "Cảm Nhận Đầu Tiên",
      description: "Tuần 2-4, bạn bắt đầu nhận ra những thay đổi nhỏ nhưng rõ ràng.",
      milestones: [
        "Ngủ sâu hơn, giấc mơ rõ nét hơn",
        "Tâm trạng bắt đầu ổn định, bớt lo âu",
        "Người xung quanh nhận xét 'khác lạ'"
      ],
      progress: 35,
      color: "#3B82F6"
    },
    {
      icon: <Flame size={32} />,
      days: "Ngày 31-60",
      title: "Momentum Building",
      description: "Tháng 2, năng lượng bắt đầu dâng cao. Bạn không thể phủ nhận sự khác biệt.",
      milestones: [
        "Năng suất làm việc tăng vượt bậc",
        "Thu hút cơ hội mới (job/project/người)",
        "Bắt đầu mua thêm đá để nâng cấp"
      ],
      progress: 65,
      color: "#F59E0B"
    },
    {
      icon: <Gem size={32} />,
      days: "Ngày 61-90",
      title: "Transformation Hoàn Tất",
      description: "Tháng 3, bạn đã không còn là người cũ. Cuộc sống thay đổi toàn diện.",
      milestones: [
        "Đạt được mục tiêu lớn (tài chính/sự nghiệp)",
        "Trở thành 'người khác' - bạn bè cũng thấy",
        "Bắt đầu chia sẻ kinh nghiệm cho người khác"
      ],
      progress: 100,
      color: "#EC4899"
    }
  ];

  return (
    <section className="before-after-section">
      <div className="before-after-container">

        {/* Section Header */}
        <div className="section-header">
          <p className="section-eyebrow">
            <Zap size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
            TRANSFORMATION STORY
          </p>
          <h2 className="section-title">
            Sự Khác Biệt <span className="gradient-text">Rõ Ràng</span>
          </h2>
          <p className="section-subtitle">
            Trước và sau khi bắt đầu hành trình với tinh thể
          </p>
        </div>

        {/* Comparison Grid */}
        <ComparisonGrid before={beforePoints} after={afterPoints} />

        {/* CTA Divider */}
        <CTADivider />

        {/* 90 Days Journey */}
        <div className="journey-section">
          <h3 className="journey-title">
            <Calendar size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
            Hành Trình 90 Ngày
          </h3>
          <p className="journey-subtitle">
            Những gì bạn có thể mong đợi trong 3 tháng đầu tiên
          </p>

          {/* Phase Selector */}
          <div className="phase-selector">
            {phases.map((phase, index) => (
              <button
                key={index}
                className={`phase-tab ${activePhase === index ? 'active' : ''}`}
                onClick={() => setActivePhase(index)}
                style={{
                  borderColor: activePhase === index ? phase.color : 'transparent'
                }}
              >
                <div className="phase-emoji">{phase.icon}</div>
                <div className="phase-days">{phase.days}</div>
              </button>
            ))}
          </div>

          {/* Active Phase Content */}
          <JourneyPhase phase={phases[activePhase]} />

          {/* Overall Progress */}
          <div className="overall-progress">
            <h4 className="progress-title">Tổng Quan Tiến Trình</h4>
            <div className="progress-timeline">
              {phases.map((phase, index) => (
                <div
                  key={index}
                  className={`timeline-item ${index <= activePhase ? 'completed' : ''}`}
                  style={{
                    borderColor: index <= activePhase ? phase.color : '#374151'
                  }}
                >
                  <div className="timeline-marker">
                    {index <= activePhase ? <Check size={20} /> : <span>{index + 1}</span>}
                  </div>
                  <div className="timeline-label">{phase.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <FinalCTA />

      </div>
    </section>
  );
}

// Sub-components
function ComparisonGrid({ before, after }) {
  return (
    <div className="comparison-grid">
      {/* Before Column */}
      <div className="comparison-column before">
        <div className="column-header">
          <div className="column-icon"><Frown size={32} /></div>
          <h3 className="column-title">Trước Khi Bắt Đầu</h3>
        </div>
        <div className="points-list">
          {before.map((point, index) => (
            <div key={index} className="comparison-point">
              <div className="point-icon">{point.icon}</div>
              <div className="point-text">{point.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="transformation-arrow">
        <div className="arrow-circle">
          <ArrowRight size={32} />
        </div>
        <div className="arrow-label">90 NGÀY</div>
      </div>

      {/* After Column */}
      <div className="comparison-column after">
        <div className="column-header">
          <div className="column-icon"><Sparkles size={32} /></div>
          <h3 className="column-title">Sau 90 Ngày</h3>
        </div>
        <div className="points-list">
          {after.map((point, index) => (
            <div key={index} className="comparison-point">
              <div className="point-icon">{point.icon}</div>
              <div className="point-text">{point.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CTADivider() {
  return (
    <div className="cta-divider">
      <div className="divider-content">
        <p className="divider-text">
          <strong>15,234 người</strong> đã bắt đầu hành trình này
        </p>
        <div className="divider-stats">
          <div className="stat-badge">
            <TrendingUp size={16} />
            <span>89% hoàn thành đủ 90 ngày</span>
          </div>
          <div className="stat-badge">
            <Check size={16} />
            <span>4.9/5 độ hài lòng</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function JourneyPhase({ phase }) {
  return (
    <div className="journey-phase">
      <div className="phase-header">
        <div className="phase-emoji-large">{phase.icon}</div>
        <div className="phase-info">
          <div className="phase-days-large">{phase.days}</div>
          <h3 className="phase-title">{phase.title}</h3>
        </div>
      </div>

      <p className="phase-description">{phase.description}</p>

      <div className="milestones-list">
        <h4 className="milestones-title">Milestones:</h4>
        {phase.milestones.map((milestone, index) => (
          <div key={index} className="milestone-item">
            <div className="milestone-check">
              <Check size={16} />
            </div>
            <div className="milestone-text">{milestone}</div>
          </div>
        ))}
      </div>

      <div className="phase-progress">
        <div className="progress-header">
          <span className="progress-label">Hoàn thành journey</span>
          <span className="progress-percentage">{phase.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${phase.progress}%`,
              background: phase.color
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function FinalCTA() {
  return (
    <div className="final-cta">
      <div className="cta-icon"><Rocket size={48} /></div>
      <h3 className="cta-title">Bắt Đầu Hành Trình 90 Ngày Của Bạn</h3>
      <p className="cta-description">
        Tham gia cùng 15,000+ người đã chuyển hóa cuộc sống trong 3 tháng.
        Nhận guidebook miễn phí và support 24/7 từ community.
      </p>

      <div className="cta-features">
        <div className="feature-badge">
          <Calendar size={18} />
          <span>90-Day Roadmap</span>
        </div>
        <div className="feature-badge">
          <Check size={18} />
          <span>Community Support</span>
        </div>
        <div className="feature-badge">
          <TrendingUp size={18} />
          <span>Progress Tracking</span>
        </div>
      </div>

      <button className="btn-final-cta">
        <span>Bắt Đầu Ngay Hôm Nay</span>
        <ArrowRight size={20} />
      </button>

      <p className="cta-guarantee">
        <Check size={16} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
        Đảm bảo hoàn tiền 100% trong 30 ngày đầu tiên
      </p>
    </div>
  );
}
