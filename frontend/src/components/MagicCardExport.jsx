import React, { useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import './MagicCardExport.css';

export default function MagicCardExport({
  response,
  cardType = 'goal',
  isOpen,
  onClose
}) {
  const cardRef = useRef(null);

  // Get random crystal image (1-5)
  const randomCrystalImage = useMemo(() => {
    const randomNum = Math.floor(Math.random() * 5) + 1;
    return `/assets/crystals/crystal-${randomNum}.png`;
  }, []);

  // Map response type to crystal type
  const getCrystalType = (type) => {
    const crystalMap = {
      'goal': 'citrine',
      'affirmation': 'amethyst',
      'iching': 'clear-quartz',
      'tarot': 'rose-quartz',
      'trading': 'tiger-eye',
      'crystal': 'amethyst',
      'general': 'citrine'
    };
    return crystalMap[type] || 'citrine';
  };

  const crystal = getCrystalType(cardType);

  // Get card color based on type
  const getCardColor = (type) => {
    const colorMap = {
      'goal': 'blue',
      'affirmation': 'pink',
      'iching': 'purple',
      'tarot': 'pink',
      'trading': 'blue',
      'crystal': 'purple',
      'general': 'blue'
    };
    return colorMap[type] || 'blue';
  };

  const cardColor = getCardColor(cardType);

  // Clean text - remove markdown symbols
  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '')  // Remove **
      .replace(/\*/g, '')    // Remove *
      .replace(/##/g, '')    // Remove ##
      .replace(/###/g, '')   // Remove ###
      .trim();
  };

  // Extract title from response text (first line or first 50 chars)
  const extractTitle = (text) => {
    if (!text) return 'GEM Master Card';

    const cleanedText = cleanText(text);
    const lines = cleanedText.split('\n');
    const firstLine = lines[0];

    if (firstLine.length > 50) {
      return firstLine.substring(0, 50) + '...';
    }

    return firstLine || 'GEM Master Card';
  };

  // Export as image
  const handleExportImage = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // 2x resolution
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `gem-card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      alert('✅ Card downloaded successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Export failed. Please try again.');
    }
  };

  // Share to social
  const handleShare = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'gem-card.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'GEM Master Card',
            text: 'Check out my manifestation from GEM Platform! 💎',
            files: [file]
          });
        } else {
          // Fallback: download
          handleExportImage();
        }
      });
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to download
      handleExportImage();
    }
  };

  if (!isOpen || !response) return null;

  const title = extractTitle(response.title || response.text);
  const description = cleanText(response.text);
  const collectionType = response.type || 'Manifestation';

  return (
    <div className="magic-card-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Preview */}
        <div className="card-preview">
          <div
            ref={cardRef}
            className={`magic-card magic-card-${cardColor}`}
          >
            {/* Glow circles */}
            <div className="glow-circle glow-top-left"></div>
            <div className="glow-circle glow-bottom-right"></div>

            {/* Card content container */}
            <div className="card-inner">
              {/* Crystal/Hexagram/Tarot image */}
              <div className="crystal-container">
                {response.hexagram ? (
                  // Show hexagram visual if available
                  <div className="card-hexagram-display">
                    <div className="hexagram-lines-card">
                      {response.hexagram.lines.map((line, idx) => (
                        <div key={idx} className={`hex-line-card ${line === 1 ? 'solid' : 'broken'}`}>
                          {line === 0 && (
                            <>
                              <div className="seg-left"></div>
                              <div className="seg-right"></div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : response.tarotCard ? (
                  // Show tarot card info if available
                  <div className="card-tarot-display">
                    <div className="tarot-card-name">{response.tarotCard}</div>
                  </div>
                ) : (
                  // Default: show random crystal image
                  <img
                    src={randomCrystalImage}
                    alt="Crystal"
                    className="crystal-image"
                  />
                )}
              </div>

              {/* Card title */}
              <h2 className="card-title">
                {title}
              </h2>

              <div className="card-divider"></div>

              {/* Card description */}
              <div className="card-description">
                {description}
              </div>

              {/* Footer */}
              <div className="card-footer">
                <div className="collection-tag">
                  {collectionType} Collection
                </div>
                <div className="watermark">
                  💎 GEM Platform
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="export-actions">
          <button onClick={handleExportImage} className="btn-export">
            📥 Download Image
          </button>
          <button onClick={handleShare} className="btn-share">
            📤 Share
          </button>
          <button onClick={onClose} className="btn-cancel">
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}
