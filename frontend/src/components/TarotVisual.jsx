import React from 'react';
import './TarotVisual.css';

export default function TarotVisual({ card }) {
  if (!card) return null;

  return (
    <div className="tarot-visual">
      <div className="tarot-card">
        <div className="card-back">
          <div className="symbol">🔮</div>
        </div>
        <div className="card-overlay">
          <h4>{card.name}</h4>
          {card.vietnamese && <p>{card.vietnamese}</p>}
        </div>
      </div>

      <div className="tarot-info">
        {card.type && <span className="badge">{card.type}</span>}
        {card.suit && <span className="badge">{card.suit}</span>}
      </div>
    </div>
  );
}
