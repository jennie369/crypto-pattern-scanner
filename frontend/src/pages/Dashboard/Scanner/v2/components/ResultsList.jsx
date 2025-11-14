import React from 'react';
import { Circle } from 'lucide-react';
import './ResultsList.css';

export const ResultsList = ({ results, onSelect, selectedPattern }) => {
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'confidence-high';
    if (confidence >= 60) return 'confidence-medium';
    return 'confidence-low';
  };

  const getConfidenceIcon = (confidence) => {
    const color = confidence >= 80 ? '#0ECB81' : confidence >= 60 ? '#FFBD59' : '#F6465D';
    return <Circle size={10} fill={color} color={color} />;
  };

  return (
    <div className="results-list">
      <div className="results-header">
        <h3 className="heading-xs">{results.length} Patterns Found</h3>
      </div>

      <div className="results-items">
        {results.map(result => (
          <div
            key={result.id}
            className={`result-card ${selectedPattern?.id === result.id ? 'selected' : ''}`}
            onClick={() => onSelect(result)}
          >
            <div className="result-header">
              <span className="result-coin">{result.coin}</span>
              <span className={`result-confidence ${getConfidenceColor(result.confidence)}`}>
                {getConfidenceIcon(result.confidence)} {result.confidence}%
              </span>
            </div>

            <div className="result-pattern">
              <span className="pattern-code">{result.pattern}</span>
              <span className="result-timeframe">{result.timeframe}</span>
            </div>

            <div className="result-details">
              <div className="result-detail-item">
                <span className="detail-label">Entry</span>
                <span className="detail-value">${result.entry.toLocaleString()}</span>
              </div>
              <div className="result-detail-item">
                <span className="detail-label">R:R</span>
                <span className="detail-value">{result.riskReward.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsList;
