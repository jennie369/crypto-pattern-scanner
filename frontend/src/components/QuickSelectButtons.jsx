import React from 'react';
import { BarChart3, Sparkles, Gem, TrendingUp, Stars, Star } from 'lucide-react';

export default function QuickSelectButtons({ onSelect }) {
  const buttons = [
    { Icon: BarChart3, text: "I Ching", action: "Xem quẻ I Ching cho tôi" },
    { Icon: Sparkles, text: "Tarot", action: "Đọc bài Tarot" },
    { Icon: Gem, text: "Crystal", action: "Đá nào phù hợp?" },
    { Icon: TrendingUp, text: "Trading", action: "Tôi bị loss streak" },
    { Icon: Stars, text: "Manifest", action: "Manifest giàu có" },
    { Icon: Star, text: "TIER", action: "Xem gói TIER" }
  ];

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginTop: '12px'
  };

  const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 8px',
    background: 'rgba(30, 42, 94, 0.4)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center'
  };

  const iconStyle = {
    fontSize: '24px'
  };

  const textStyle = {
    fontSize: '11px',
    lineHeight: '1.2',
    fontWeight: '500'
  };

  return (
    <div style={gridStyle}>
      {buttons.map((btn, i) => {
        const IconComponent = btn.Icon;
        return (
          <button
            key={i}
            style={buttonStyle}
            onClick={() => onSelect(btn.action)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 189, 89, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 42, 94, 0.4)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <IconComponent size={24} strokeWidth={2} />
            <span style={textStyle}>{btn.text}</span>
          </button>
        );
      })}
    </div>
  );
}
