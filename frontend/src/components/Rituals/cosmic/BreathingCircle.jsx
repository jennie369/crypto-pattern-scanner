/**
 * BreathingCircle Component
 * Animated circle for breath synchronization
 *
 * @fileoverview Guided breathing animation (4-4-4-4 pattern)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BreathingCircle.css';

/**
 * Breathing phases
 */
const BREATH_PHASES = {
  INHALE: { label: 'Breathe In', duration: 4000 },
  HOLD_IN: { label: 'Hold', duration: 4000 },
  EXHALE: { label: 'Breathe Out', duration: 4000 },
  HOLD_OUT: { label: 'Hold', duration: 4000 },
};

const PHASE_ORDER = ['INHALE', 'HOLD_IN', 'EXHALE', 'HOLD_OUT'];

/**
 * BreathingCircle - Animated breathing guide
 *
 * @param {number} cycles - Number of breath cycles
 * @param {string} color - Circle color
 * @param {Function} onComplete - Callback when all cycles done
 * @param {boolean} autoStart - Start automatically
 */
const BreathingCircle = ({
  cycles = 4,
  color = '#00F0FF',
  onComplete,
  autoStart = true,
  size = 200,
  className = '',
}) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const currentPhase = PHASE_ORDER[phaseIndex];
  const phaseConfig = BREATH_PHASES[currentPhase];

  const advancePhase = useCallback(() => {
    const nextPhaseIndex = (phaseIndex + 1) % PHASE_ORDER.length;

    if (nextPhaseIndex === 0) {
      // Completed a full cycle
      const nextCycle = currentCycle + 1;
      if (nextCycle >= cycles) {
        // All cycles done
        setIsActive(false);
        onComplete?.();
        return;
      }
      setCurrentCycle(nextCycle);
    }

    setPhaseIndex(nextPhaseIndex);
    setCountdown(4);
  }, [phaseIndex, currentCycle, cycles, onComplete]);

  // Phase timer
  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setTimeout(() => {
      advancePhase();
    }, phaseConfig.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, phaseIndex, currentCycle, advancePhase, phaseConfig.duration]);

  // Countdown timer
  useEffect(() => {
    if (!isActive) return;

    setCountdown(4);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 4));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isActive, phaseIndex]);

  // Calculate scale based on phase
  const getScale = () => {
    switch (currentPhase) {
      case 'INHALE':
        return 1.3;
      case 'HOLD_IN':
        return 1.3;
      case 'EXHALE':
        return 1;
      case 'HOLD_OUT':
        return 1;
      default:
        return 1;
    }
  };

  const handleStart = () => {
    setIsActive(true);
    setCurrentCycle(0);
    setPhaseIndex(0);
    setCountdown(4);
  };

  return (
    <div
      className={`breathing-circle-container ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring */}
      <motion.div
        className="breathing-circle-glow"
        style={{ borderColor: color, boxShadow: `0 0 60px ${color}40` }}
        animate={{
          scale: getScale(),
          opacity: isActive ? 1 : 0.5,
        }}
        transition={{
          duration: phaseConfig.duration / 1000,
          ease: 'easeInOut',
        }}
      />

      {/* Main circle */}
      <motion.div
        className="breathing-circle-main"
        style={{ backgroundColor: `${color}20`, borderColor: `${color}60` }}
        animate={{
          scale: getScale(),
        }}
        transition={{
          duration: phaseConfig.duration / 1000,
          ease: 'easeInOut',
        }}
      >
        {/* Content */}
        <div className="breathing-circle-content">
          {isActive ? (
            <>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPhase}
                  className="breathing-circle-label"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {phaseConfig.label}
                </motion.span>
              </AnimatePresence>

              <span className="breathing-circle-countdown" style={{ color }}>
                {countdown}
              </span>

              <span className="breathing-circle-cycle">
                Cycle {currentCycle + 1} of {cycles}
              </span>
            </>
          ) : (
            <button
              className="breathing-circle-start"
              onClick={handleStart}
              style={{ color }}
            >
              Start Breathing
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BreathingCircle;
