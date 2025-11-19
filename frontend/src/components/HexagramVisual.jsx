import React from 'react';
import './HexagramVisual.css';

export default function HexagramVisual({ hexagram }) {
  if (!hexagram) return null;

  const lines = hexagram.lines || [1, 1, 1, 1, 1, 1];

  return (
    <div className="hexagram-visual">
      <div className="hexagram-lines">
        {lines.map((line, i) => (
          <div key={i} className={`hex-line ${line === 1 ? 'solid' : 'broken'}`}>
            {line === 0 && (
              <>
                <span className="seg-left"></span>
                <span className="seg-right"></span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="hexagram-info">
        <h4>#{hexagram.number} - {hexagram.name}</h4>
        <p>{hexagram.vietnamese}</p>
        {hexagram.chinese && <p className="chinese">{hexagram.chinese}</p>}
      </div>
    </div>
  );
}
