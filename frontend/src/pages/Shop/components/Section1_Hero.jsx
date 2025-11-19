import React from 'react';
import {
  Sparkles, Target, Frown, Wind, HeartCrack, Sun, Heart,
  Zap, Waves, Flame, Sprout, Gem, Mountain, MessageCircle,
  CheckCircle, Clock
} from 'lucide-react';
import './Section1_Hero.css';

export default function Section1_Hero() {
  return (
    <section className="hero-section">
      {/* Background Effects */}
      <div className="hero-overlay"></div>
      <div className="glow-particle glow-1"></div>
      <div className="glow-particle glow-2"></div>
      <div className="glow-particle glow-3"></div>

      <div className="hero-container">

        {/* 1. OPENING STORY */}
        <div className="opening-story">
          <p className="eyebrow">BẠN ĐÃ BAO GIỜ TỰ HỎI...</p>

          <h1 className="hero-title">
            Tại sao một số người <span className="highlight">luôn thu hút may mắn</span> như có nam châm vô hình?
          </h1>

          <p className="hero-description">
            Trong khi bạn <strong>vất vả từng ngày</strong>, họ dường như được vũ trụ ưu ái.<br />
            Không phải ngẫu nhiên. Đó là <strong>tần số năng lượng.</strong>
          </p>
        </div>

        {/* 2. PAIN POINTS (Before/After) */}
        <div className="pain-points-section">
          <p className="section-intro"><Target size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} /> Có phải bạn đang cảm thấy...</p>

          <div className="before-after-grid">
            {/* Before Column */}
            <div className="pain-column">
              <PainPoint
                icon={<Frown size={32} />}
                title="Làm việc vất vả nhưng không thấy kết quả"
                desc="Cố gắng hết mình mà vẫn cảm giác 'bế tắc', như có rào cản vô hình ngăn cản..."
              />
              <PainPoint
                icon={<Wind size={32} />}
                title="Tâm trạng thất thường, thiếu ổn định"
                desc="Hôm nay hứng khởi, ngày mai lại mệt mỏi. Cảm giác như năng lượng không thuộc về mình."
              />
              <PainPoint
                icon={<HeartCrack size={32} />}
                title="Relationships căng thẳng, thiếu kết nối"
                desc="Mối quan hệ với người thân, đồng nghiệp, bạn bè... dường như luôn có khoảng cách vô hình."
              />
            </div>

            {/* Arrow */}
            <div className="transformation-arrow">→</div>

            {/* After Column */}
            <div className="after-column">
              <AfterPoint
                icon={<Sun size={32} />}
                title="Tỉnh táo, tràn đầy năng lượng"
                desc="Mỗi sáng thức dậy với cảm giác sẵn sàng chinh phục ngày mới, không còn mệt mỏi kéo dài."
              />
              <AfterPoint
                icon={<Target size={32} />}
                title="Quyết định sáng suốt, thu hút cơ hội"
                desc="Những cơ hội bất ngờ xuất hiện, như thể vũ trụ đang mở đường cho bạn."
              />
              <AfterPoint
                icon={<Heart size={32} />}
                title="Mối quan hệ hài hòa, yêu thương"
                desc="Người xung quanh cảm nhận được năng lượng tích cực từ bạn và muốn ở gần hơn."
              />
            </div>
          </div>
        </div>

        {/* 3. SECRET SECTION */}
        <div className="secret-section">
          <div className="secret-icon"><Sparkles size={48} /></div>
          <h2 className="secret-title">Bí Mật: Tần Số Năng Lượng</h2>
          <p className="secret-description">
            Giống như sóng radio, mỗi người phát ra một <strong>tần số năng lượng</strong> riêng.<br />
            Tần số cao → thu hút cơ hội, may mắn, thành công.<br />
            Tần số thấp → vấn đề cứ lặp lại, cảm giác "xui xẻo" kéo dài.
          </p>

          <div className="secret-quote">
            <p className="secret-quote-text">
              "Bạn không cần thay đổi hoàn cảnh. Bạn chỉ cần điều chỉnh tần số."
            </p>
          </div>
        </div>

        {/* 4. ENERGY ELEMENTS (Ngũ Hành) */}
        <div className="energy-section">
          <h3 className="energy-title"><Zap size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} /> 5 Trạng Thái Năng Lượng (Ngũ Hành Hiện Đại)</h3>
          <div className="energy-grid">
            <EnergyElement icon={<Waves size={32} />} name="Thủy" desc="Dòng chảy tự nhiên" />
            <EnergyElement icon={<Flame size={32} />} name="Hỏa" desc="Hành động mạnh mẽ" />
            <EnergyElement icon={<Sprout size={32} />} name="Mộc" desc="Sinh trưởng phát triển" />
            <EnergyElement icon={<Gem size={32} />} name="Kim" desc="Quyết đoán rõ ràng" />
            <EnergyElement icon={<Mountain size={32} />} name="Thổ" desc="Ổn định vững chắc" />
          </div>
        </div>

        {/* 5. FINAL CTA */}
        <div className="cta-section">
          <p className="cta-text">
            Đến lượt bạn. <strong>Điều chỉnh tần số năng lượng.</strong><br />
            Bắt đầu hành trình chuyển hóa ngay hôm nay.
          </p>
          <button className="cta-button">
            Bắt Đầu Ngay <Sparkles size={20} />
          </button>
        </div>

      </div>
    </section>
  );
}

// Sub-components
function PainPoint({ icon, title, desc }) {
  return (
    <div className="pain-point">
      <div className="emoji">{icon}</div>
      <p className="title">{title}</p>
      <p className="desc">{desc}</p>
    </div>
  );
}

function AfterPoint({ icon, title, desc }) {
  return (
    <div className="after-point">
      <div className="emoji">{icon}</div>
      <p className="title">{title}</p>
      <p className="desc">{desc}</p>
    </div>
  );
}

function EnergyElement({ icon, name, desc }) {
  return (
    <div className="energy-item">
      <div className="icon">{icon}</div>
      <div className="name">{name}</div>
      <div className="desc">{desc}</div>
    </div>
  );
}
