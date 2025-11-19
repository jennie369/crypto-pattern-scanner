import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './PatternCard.css';

/**
 * PatternCard Component - Full Gem Holding Brand Animations
 * 
 * Features:
 * - Particles bay lên (6-10 hạt vàng)
 * - Glow effects (orbs phát sáng)
 * - Float animations
 * - Smooth hover interactions
 * - Copy functionality với visual feedback
 */

const PatternCard = ({ pattern }) => {
  const [copiedField, setCopiedField] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const controls = useAnimation();

  // Pattern data structure
  const {
    symbol = 'BTCUSDT Perp',
    patternType = 'Head and Shoulders',
    patternImage = null,
    entry = 110598.33,
    stopLoss = 110999.07,
    takeProfit = [110197.59, 109796.84, 109396.10],
    confidence = 0.90,
    timestamp = new Date().toISOString(),
    direction = 'bearish', // 'bullish' or 'bearish'
    chartCoordinates = { startIdx: 100, endIdx: 150 }
  } = pattern;

  // Copy to clipboard functionality
  const handleCopy = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value.toString());
      setCopiedField(field);
      
      // Trigger success animation
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.3 }
      });

      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format timestamp
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Direction styling
  const directionStyles = {
    bullish: {
      color: '#0ECB81',
      icon: '🟢',
      label: 'BULLISH'
    },
    bearish: {
      color: '#F6465D',
      icon: '🔴',
      label: 'BEARISH'
    }
  };

  const currentDirection = directionStyles[direction] || directionStyles.bearish;

  return (
    <motion.div
      ref={cardRef}
      className="pattern-card"
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Background Glow Orbs - Animated */}
      <div className="glow-orbs">
        <motion.div
          className="glow-orb glow-orb-1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="glow-orb glow-orb-2"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>

      {/* Particles - Bay lên khi hover */}
      {isHovered && (
        <div className="particles-container">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`particle particle-${i % 3}`}
              initial={{ 
                opacity: 0, 
                y: 0,
                x: Math.random() * 100 - 50,
                scale: 0.5
              }}
              animate={{ 
                opacity: [0, 1, 0], 
                y: -100,
                x: Math.random() * 100 - 50,
                scale: [0.5, 1, 0.5],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Card Header */}
      <motion.div 
        className="pattern-header"
        animate={{
          y: [0, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="pattern-title">
          <span className="pattern-icon">📐</span>
          <h3 className="pattern-name">
            {symbol} - {patternType}
          </h3>
        </div>
        <div 
          className="pattern-direction"
          style={{ color: currentDirection.color }}
        >
          <span className="direction-icon">{currentDirection.icon}</span>
          <span className="direction-label">{currentDirection.label}</span>
        </div>
      </motion.div>

      {/* Price Information - Compact with Copy Buttons */}
      <div className="pattern-prices">
        <PriceRow 
          label="Entry" 
          value={entry} 
          field="entry"
          copiedField={copiedField}
          onCopy={handleCopy}
          accentColor={currentDirection.color}
        />
        <PriceRow 
          label="Stop Loss" 
          value={stopLoss} 
          field="stopLoss"
          copiedField={copiedField}
          onCopy={handleCopy}
          accentColor="#F6465D"
        />
        {takeProfit.map((tp, index) => (
          <PriceRow 
            key={`tp${index + 1}`}
            label={`TP${index + 1}`} 
            value={tp} 
            field={`tp${index + 1}`}
            copiedField={copiedField}
            onCopy={handleCopy}
            accentColor="#0ECB81"
          />
        ))}
      </div>

      {/* Pattern Chart Thumbnail - 1:1 with Highlighted Area */}
      <motion.div 
        className="pattern-chart-container"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {patternImage ? (
          <img 
            src={patternImage} 
            alt={`${patternType} pattern`}
            className="pattern-chart-image"
          />
        ) : (
          <div className="pattern-chart-placeholder">
            <motion.div
              className="chart-highlight-box"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="highlight-label">{patternType}</span>
            </motion.div>
            <span className="placeholder-text">Pattern Visualization</span>
          </div>
        )}
        
        {/* Overlay shine effect on hover */}
        {isHovered && (
          <motion.div
            className="chart-shine-overlay"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </motion.div>

      {/* Pattern Metadata */}
      <div className="pattern-meta">
        <div className="meta-item">
          <span className="meta-icon">📅</span>
          <span className="meta-text">{formatTime(timestamp)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-icon">🎯</span>
          <span className="meta-text">Confidence: {(confidence * 100).toFixed(0)}%</span>
        </div>
        <motion.div 
          className="confidence-bar"
          initial={{ width: 0 }}
          whileInView={{ width: `${confidence * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.div 
            className="confidence-fill"
            animate={{
              boxShadow: [
                '0 0 10px rgba(255, 189, 89, 0.5)',
                '0 0 20px rgba(255, 189, 89, 0.8)',
                '0 0 10px rgba(255, 189, 89, 0.5)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Action Button */}
      <motion.button
        className="view-chart-btn"
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 0 20px rgba(255, 189, 89, 0.4)'
        }}
        whileTap={{ scale: 0.95 }}
      >
        <span>View on Main Chart</span>
        <span className="btn-arrow">→</span>
      </motion.button>

      {/* Border glow effect on hover */}
      <motion.div
        className="card-border-glow"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.95
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

/**
 * PriceRow Component - Individual price line with copy button
 */
const PriceRow = ({ label, value, field, copiedField, onCopy, accentColor }) => {
  const isCopied = copiedField === field;

  return (
    <motion.div 
      className="price-row"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <span className="price-label" style={{ color: accentColor }}>
        {label}:
      </span>
      <span className="price-value">${value.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}</span>
      <motion.button
        className={`copy-btn ${isCopied ? 'copied' : ''}`}
        onClick={() => onCopy(field, value)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isCopied ? {
          backgroundColor: ['#0ECB81', '#0ECB81', 'rgba(42, 27, 82, 0.6)'],
        } : {}}
        transition={{ duration: 0.5 }}
      >
        {isCopied ? (
          <>
            <span className="check-icon">✓</span>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <span className="copy-icon">📋</span>
            <span>Copy</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default PatternCard;
