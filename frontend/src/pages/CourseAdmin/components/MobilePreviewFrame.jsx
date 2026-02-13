/**
 * MobilePreviewFrame - Phone mockup frame for previewing lesson content
 * Shows content exactly as it will appear on mobile devices
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
} from 'lucide-react';

import './MobilePreviewFrame.css';

// Device presets with accurate dimensions
const DEVICE_PRESETS = {
  'iphone-14': {
    name: 'iPhone 14',
    width: 390,
    height: 844,
    notch: true,
    borderRadius: 47,
    safeAreaTop: 59,
    safeAreaBottom: 34,
  },
  'iphone-14-pro-max': {
    name: 'iPhone 14 Pro Max',
    width: 430,
    height: 932,
    notch: true,
    dynamicIsland: true,
    borderRadius: 55,
    safeAreaTop: 59,
    safeAreaBottom: 34,
  },
  'iphone-se': {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    notch: false,
    borderRadius: 30,
    safeAreaTop: 20,
    safeAreaBottom: 0,
  },
  'android-pixel': {
    name: 'Android (Pixel)',
    width: 393,
    height: 851,
    notch: false,
    punchHole: true,
    borderRadius: 24,
    safeAreaTop: 24,
    safeAreaBottom: 0,
  },
  'android-samsung': {
    name: 'Samsung Galaxy',
    width: 412,
    height: 915,
    notch: false,
    punchHole: true,
    borderRadius: 30,
    safeAreaTop: 28,
    safeAreaBottom: 0,
  },
  'tablet-ipad': {
    name: 'iPad',
    width: 820,
    height: 1180,
    notch: false,
    borderRadius: 20,
    safeAreaTop: 24,
    safeAreaBottom: 20,
  },
};

const MobilePreviewFrame = ({
  children,
  htmlContent,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
  defaultDevice = 'iphone-14-pro-max',
}) => {
  const [selectedDevice, setSelectedDevice] = useState(defaultDevice);
  // Scale 0.7 = comfortable viewing size, slightly smaller than 1:1 CSS pixels
  // Good balance between seeing detail and fitting in panel
  const [scale, setScale] = useState(0.7);
  const [isLandscape, setIsLandscape] = useState(false);
  const contentRef = useRef(null);

  // Force iframe re-render using counter that increments on every content change
  const [renderKey, setRenderKey] = useState(0);
  const prevContentRef = useRef(htmlContent);
  const iframeRef = useRef(null);

  const device = DEVICE_PRESETS[selectedDevice];
  const frameWidth = isLandscape ? device.height : device.width;
  const frameHeight = isLandscape ? device.width : device.height;

  // Generate CSS for mobile-like rendering - MUST be defined before useEffect
  // MINIMAL PADDING - Content should fill screen width
  const getMobileStyles = () => `
    <style>
      /* DISABLE ALL ANIMATIONS in preview mode for easier editing */
      *, *::before, *::after {
        animation: none !important;
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        animation-iteration-count: 1 !important;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
        background: linear-gradient(180deg, #0a0f1c 0%, #111827 50%, #0a0f1c 100%);
        padding: 0;
        min-height: 100%;
        -webkit-font-smoothing: antialiased;
      }

      /* Typography - minimal margins */
      h1, h2, h3, h4, h5, h6 {
        color: #fff;
        margin: 0.75rem 0 0.5rem 0;
        padding: 0 0.5rem;
        font-weight: 700;
        line-height: 1.3;
      }
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      h3 { font-size: 18px; }
      h4 { font-size: 16px; }

      p {
        margin: 0 0 0.5rem 0;
        padding: 0 0.5rem;
        color: rgba(255,255,255,0.85);
      }

      /* Lists - minimal padding */
      ul, ol {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
        padding-right: 0.5rem;
        color: rgba(255,255,255,0.85);
      }
      li { margin-bottom: 0.25rem; }

      /* Images - FULL WIDTH, NO MARGIN */
      img {
        width: 100%;
        max-width: 100%;
        height: auto;
        border-radius: 0;
        margin: 0;
        padding: 0;
        display: block;
      }

      /* Image with small margin when inside content */
      .content-image, .lesson-image {
        width: 100%;
        margin: 0.5rem 0;
        border-radius: 0;
      }

      /* Links */
      a {
        color: #00D9FF;
        text-decoration: none;
      }
      a:active { opacity: 0.7; }

      /* Text formatting */
      strong, b { color: #fff; font-weight: 600; }
      em, i { font-style: italic; }

      /* Code - minimal padding */
      code {
        background: rgba(255,255,255,0.1);
        padding: 1px 4px;
        border-radius: 4px;
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 14px;
      }
      pre {
        background: rgba(0,0,0,0.4);
        padding: 0.5rem;
        border-radius: 0;
        overflow-x: auto;
        margin: 0.5rem 0;
        font-size: 14px;
      }

      /* Blockquote - minimal padding */
      blockquote {
        border-left: 3px solid #FFBD59;
        margin: 0.5rem 0;
        color: rgba(255,255,255,0.75);
        font-style: italic;
        background: rgba(255, 189, 89, 0.1);
        padding: 0.5rem;
        border-radius: 0;
      }

      /* Tables - full width */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 0.5rem 0;
        background: rgba(255,255,255,0.05);
        border-radius: 0;
        overflow: hidden;
      }
      th, td {
        border: 1px solid rgba(255,255,255,0.15);
        padding: 0.5rem;
        text-align: left;
        font-size: 14px;
      }
      th {
        background: rgba(106, 91, 255, 0.3);
        color: #fff;
        font-weight: 600;
      }
      tr:nth-child(even) {
        background: rgba(255,255,255,0.03);
      }

      /* Horizontal rule */
      hr {
        border: none;
        border-top: 1px solid rgba(255,255,255,0.15);
        margin: 0.75rem 0;
      }

      /* Cards/Boxes - MINIMAL PADDING */
      .card, .box, .info-box, .warning-box, .tip-box, .info-card, .warning-card, .success-card, .tip-card {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 0.5rem;
        margin: 0.5rem 0;
      }

      .info-box, .info-card {
        border-left: 3px solid #00D9FF;
        background: rgba(0, 217, 255, 0.1);
      }

      .warning-box, .warning-card {
        border-left: 3px solid #FFBD59;
        background: rgba(255, 189, 89, 0.1);
      }

      .tip-box, .tip-card, .success-card {
        border-left: 3px solid #10B981;
        background: rgba(16, 185, 129, 0.1);
      }

      /* Section cards - full width */
      .section-card, .content-section, .lesson-section {
        background: rgba(255,255,255,0.03);
        border-radius: 8px;
        padding: 0.5rem;
        margin: 0.5rem 0;
      }

      /* Lesson Header Styles - minimal */
      .lesson-badge {
        display: inline-block;
        background: linear-gradient(135deg, #6A5BFF, #8B5CF6);
        color: #fff;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0.5rem;
      }

      .lesson-title {
        font-size: 22px;
        font-weight: 700;
        color: #FFBD59;
        text-align: center;
        margin: 0.5rem 0;
        padding: 0 0.5rem;
      }

      .lesson-subtitle {
        font-size: 14px;
        color: rgba(255,255,255,0.7);
        text-align: center;
        margin-bottom: 0.75rem;
        padding: 0 0.5rem;
      }

      .lesson-meta {
        display: flex;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
        padding: 0 0.5rem;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(255,255,255,0.08);
        padding: 4px 10px;
        border-radius: 16px;
        font-size: 12px;
        color: rgba(255,255,255,0.8);
      }

      /* Section Headers - minimal */
      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0.75rem 0 0.5rem 0;
        padding: 0 0.5rem;
      }

      .section-header h2,
      .section-header h3 {
        margin: 0;
        padding: 0;
        color: #00D9FF;
      }

      /* Checklist - minimal */
      .checklist {
        list-style: none;
        padding: 0 0.5rem;
      }

      .checklist li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }

      .checklist li:last-child {
        border-bottom: none;
      }

      .check-icon {
        color: #10B981;
        flex-shrink: 0;
        margin-top: 2px;
      }

      /* Highlight text */
      mark, .highlight {
        background: linear-gradient(135deg, rgba(255, 189, 89, 0.3), rgba(255, 189, 89, 0.1));
        color: #FFBD59;
        padding: 1px 4px;
        border-radius: 3px;
      }

      /* Infographic cards - minimal */
      .infographic-card {
        background: linear-gradient(135deg, #1a0b2e, #2d1b4e);
        border-radius: 8px;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border: 1px solid rgba(106, 91, 255, 0.3);
      }

      .infographic-card img {
        border-radius: 8px;
        margin: 0 0 0.5rem 0;
        width: 100%;
      }

      /* Full-width elements */
      .full-width, .banner, .hero-image {
        width: 100%;
        margin: 0;
        padding: 0;
        border-radius: 0;
      }

      /* Numbered steps - compact */
      .numbered-step {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.5rem;
        margin: 0.5rem 0;
        background: rgba(106, 91, 255, 0.1);
        border-radius: 8px;
      }

      .step-number {
        width: 24px;
        height: 24px;
        min-width: 24px;
        background: linear-gradient(135deg, #6A5BFF, #8B5CF6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        color: #fff;
      }

      /* Responsive - even smaller on very small screens */
      @media (max-width: 380px) {
        h1 { font-size: 20px; }
        h2 { font-size: 18px; }
        h3 { font-size: 16px; }
        .lesson-title { font-size: 20px; }
        body { font-size: 15px; }
      }
    </style>
  `;

  // Update iframe when content changes - more aggressive approach
  useEffect(() => {
    const hasWidthStyle = htmlContent?.includes('width:');
    console.log('[MobilePreview] useEffect triggered. hasWidthStyle:', hasWidthStyle, 'contentLength:', htmlContent?.length);

    if (htmlContent !== prevContentRef.current) {
      console.log('[MobilePreview] Content CHANGED, updating iframe. renderKey:', renderKey + 1);
      // Log a snippet to see the width style
      const widthMatch = htmlContent?.match(/width:\s*\d+%/);
      console.log('[MobilePreview] Width style found:', widthMatch?.[0] || 'none');

      prevContentRef.current = htmlContent;
      // Increment key to force re-mount
      setRenderKey(k => k + 1);
    } else {
      console.log('[MobilePreview] Content SAME, no update');
    }
  }, [htmlContent]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.05, 1.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.05, 0.4));
  const handleComfortSize = () => setScale(0.7); // Comfortable viewing size
  const handlePixelSize = () => setScale(1.0); // 1:1 CSS pixel size

  return (
    <div className={`mobile-preview-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Toolbar */}
      <div className="mobile-preview-toolbar">
        <div className="toolbar-left">
          <span className="toolbar-label">Device:</span>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="device-selector"
          >
            <optgroup label="iPhone">
              <option value="iphone-14">iPhone 14</option>
              <option value="iphone-14-pro-max">iPhone 14 Pro Max</option>
              <option value="iphone-se">iPhone SE</option>
            </optgroup>
            <optgroup label="Android">
              <option value="android-pixel">Pixel</option>
              <option value="android-samsung">Samsung Galaxy</option>
            </optgroup>
            <optgroup label="Tablet">
              <option value="tablet-ipad">iPad</option>
            </optgroup>
          </select>

          <button
            className={`toolbar-btn ${isLandscape ? 'active' : ''}`}
            onClick={() => setIsLandscape(!isLandscape)}
            title="Xoay màn hình"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="toolbar-center">
          <span className="device-info">
            {device.name} • {frameWidth}×{frameHeight}pt
          </span>
        </div>

        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={handleZoomOut} title="Thu nhỏ">
            <ZoomOut size={16} />
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button className="toolbar-btn" onClick={handleZoomIn} title="Phóng to">
            <ZoomIn size={16} />
          </button>
          <button
            className={`toolbar-btn ${Math.abs(scale - 0.7) < 0.02 ? 'active' : ''}`}
            onClick={handleComfortSize}
            title="Kích thước thoải mái (70%)"
          >
            📱
          </button>
          <button
            className={`toolbar-btn ${scale === 1.0 ? 'active' : ''}`}
            onClick={handlePixelSize}
            title="1:1 CSS pixels"
          >
            1:1
          </button>

          {onToggleFullscreen && (
            <button className="toolbar-btn" onClick={onToggleFullscreen} title="Fullscreen">
              <Maximize2 size={16} />
            </button>
          )}

          {onClose && (
            <button className="toolbar-btn close-btn" onClick={onClose} title="Đóng">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Phone Frame */}
      <div className="phone-frame-wrapper" style={{ transform: `scale(${scale})` }}>
        <div
          className={`phone-frame ${device.notch ? 'has-notch' : ''} ${device.dynamicIsland ? 'has-dynamic-island' : ''} ${device.punchHole ? 'has-punch-hole' : ''}`}
          style={{
            width: frameWidth,
            height: frameHeight,
            borderRadius: device.borderRadius,
          }}
        >
          {/* Status Bar */}
          <div className="phone-status-bar" style={{ height: device.safeAreaTop }}>
            {device.notch && !device.dynamicIsland && <div className="phone-notch" />}
            {device.dynamicIsland && <div className="phone-dynamic-island" />}
            {device.punchHole && <div className="phone-punch-hole" />}
            <div className="status-bar-content">
              <span className="status-time">9:41</span>
              <div className="status-icons">
                <span className="status-signal">●●●●○</span>
                <span className="status-wifi">📶</span>
                <span className="status-battery">🔋</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div
            className="phone-content"
            ref={contentRef}
            style={{
              height: frameHeight - device.safeAreaTop - device.safeAreaBottom,
            }}
          >
            {htmlContent ? (
              <iframe
                key={`preview-${renderKey}`}
                ref={iframeRef}
                title="Mobile Preview"
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    ${getMobileStyles()}
                  </head>
                  <body>
                    ${htmlContent}
                  </body>
                  </html>
                `}
                className="preview-iframe"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              children
            )}
          </div>

          {/* Home Indicator */}
          {device.safeAreaBottom > 0 && (
            <div className="phone-home-indicator" style={{ height: device.safeAreaBottom }}>
              <div className="home-bar" />
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="preview-tips">
        <span>💡 Kéo để scroll • Dùng nút zoom để phóng to/thu nhỏ</span>
      </div>
    </div>
  );
};

export default MobilePreviewFrame;
