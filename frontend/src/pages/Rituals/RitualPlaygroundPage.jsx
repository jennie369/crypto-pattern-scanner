/**
 * RitualPlaygroundPage
 * Full-screen ritual execution with 4-phase flow
 *
 * @fileoverview Immersive ritual experience
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { X, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getRitualById,
  completeRitual,
  canAccessRitual,
} from '../../services/ritualService';
import { getEffectiveTier } from '../../services/visionBoard/tierService';
import {
  CosmicBackground,
  BreathingCircle,
  GlassCard,
  GlowButton,
} from '../../components/Rituals/cosmic';
import { COLORS } from '../../../../web design-tokens';
import './RitualPlaygroundPage.css';

/**
 * Phase Components
 */
const IntroPhase = ({ ritual, onStart }) => {
  const Icon = Icons[ritual.icon] || Icons.Sparkles;

  return (
    <motion.div
      className="ritual-phase ritual-phase-intro"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div
        className="ritual-intro-icon"
        style={{
          backgroundColor: `${ritual.color}20`,
          boxShadow: `0 0 60px ${ritual.color}40`,
        }}
      >
        <Icon size={64} style={{ color: ritual.color }} />
      </div>

      <h1 className="ritual-intro-title">{ritual.name}</h1>
      <p className="ritual-intro-desc">{ritual.description}</p>

      <div className="ritual-intro-meta">
        <span>~{Math.floor(ritual.duration / 60)} minutes</span>
        <span>•</span>
        <span>{ritual.xp} XP</span>
      </div>

      <GlowButton
        color={ritual.color}
        size="lg"
        onClick={onStart}
      >
        Begin Ritual
        <ChevronRight size={20} />
      </GlowButton>
    </motion.div>
  );
};

const BreathPhase = ({ ritual, onComplete }) => {
  return (
    <motion.div
      className="ritual-phase ritual-phase-breath"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="ritual-phase-title">Center Yourself</h2>
      <p className="ritual-phase-subtitle">
        Take 4 deep breaths to prepare your mind
      </p>

      <BreathingCircle
        cycles={4}
        color={ritual.color}
        size={220}
        onComplete={onComplete}
      />
    </motion.div>
  );
};

const InteractionPhase = ({ ritual, onComplete }) => {
  const [input, setInput] = useState('');
  const Icon = Icons[ritual.icon] || Icons.Sparkles;

  const handleSubmit = () => {
    if (input.trim() || ritual.id === 'heart_expansion' || ritual.id === 'star_wish') {
      onComplete({ text: input });
    }
  };

  // Different interactions based on ritual type
  const renderInteraction = () => {
    switch (ritual.id) {
      case 'heart_expansion':
        return (
          <div className="ritual-interaction-visualize">
            <motion.div
              className="ritual-heart-container"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon size={120} style={{ color: ritual.color }} />
            </motion.div>
            <p>Feel your heart expanding with love and abundance</p>
            <p className="ritual-interaction-hint">Tap when you feel ready</p>
            <GlowButton color={ritual.color} onClick={handleSubmit}>
              I'm Ready
            </GlowButton>
          </div>
        );

      case 'gratitude_flow':
      case 'letter_universe':
      case 'burn_release':
        return (
          <div className="ritual-interaction-write">
            <label>
              {ritual.id === 'gratitude_flow'
                ? 'What are you grateful for today?'
                : ritual.id === 'letter_universe'
                  ? 'Write your letter to the universe...'
                  : 'What do you want to release?'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                ritual.id === 'gratitude_flow'
                  ? 'I am grateful for...'
                  : ritual.id === 'letter_universe'
                    ? 'Dear Universe, I wish to...'
                    : 'I release...'
              }
              rows={6}
              autoFocus
            />
            <GlowButton
              color={ritual.color}
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              Continue
            </GlowButton>
          </div>
        );

      case 'water_manifest':
        return (
          <div className="ritual-interaction-intention">
            <motion.div
              className="ritual-water-container"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon size={80} style={{ color: ritual.color }} />
            </motion.div>
            <label>Set your intention for the water</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="My intention is..."
              autoFocus
            />
            <GlowButton
              color={ritual.color}
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              Program Water
            </GlowButton>
          </div>
        );

      case 'star_wish':
        return (
          <div className="ritual-interaction-wish">
            <motion.div
              className="ritual-star-container"
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <Icon size={100} style={{ color: ritual.color }} />
            </motion.div>
            <p>Close your eyes and make a wish</p>
            <p className="ritual-interaction-hint">
              Hold your wish in your heart, then tap when ready
            </p>
            <GlowButton color={ritual.color} onClick={handleSubmit}>
              Wish Made
            </GlowButton>
          </div>
        );

      default:
        return (
          <div className="ritual-interaction-default">
            <Icon size={80} style={{ color: ritual.color }} />
            <p>Focus on the energy</p>
            <GlowButton color={ritual.color} onClick={handleSubmit}>
              Continue
            </GlowButton>
          </div>
        );
    }
  };

  return (
    <motion.div
      className="ritual-phase ritual-phase-interaction"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {renderInteraction()}
    </motion.div>
  );
};

const CompletePhase = ({ ritual, xpAwarded, onFinish }) => {
  return (
    <motion.div
      className="ritual-phase ritual-phase-complete"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="ritual-complete-icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        style={{
          backgroundColor: `${COLORS.success}20`,
          boxShadow: `0 0 60px ${COLORS.success}40`,
        }}
      >
        <Sparkles size={64} style={{ color: COLORS.success }} />
      </motion.div>

      <motion.h1
        className="ritual-complete-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Ritual Complete!
      </motion.h1>

      <motion.p
        className="ritual-complete-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        You've completed {ritual.name}
      </motion.p>

      {xpAwarded > 0 && (
        <motion.div
          className="ritual-complete-xp"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
        >
          <Zap size={24} style={{ color: COLORS.primary }} />
          <span>+{xpAwarded} XP</span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <GlowButton color={COLORS.success} size="lg" onClick={onFinish}>
          Continue
        </GlowButton>
      </motion.div>
    </motion.div>
  );
};

/**
 * Main Component
 */
const RitualPlaygroundPage = () => {
  const { ritualId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const tier = getEffectiveTier(profile);

  const [ritual, setRitual] = useState(null);
  const [phase, setPhase] = useState('intro'); // intro, breath, interaction, complete
  const [xpAwarded, setXpAwarded] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ritualData = getRitualById(ritualId);

    if (!ritualData) {
      setError('Ritual not found');
      return;
    }

    if (!canAccessRitual(ritualId, tier)) {
      setError('Access denied');
      return;
    }

    setRitual(ritualData);
  }, [ritualId, tier]);

  const handleStart = () => {
    setPhase('breath');
  };

  const handleBreathComplete = () => {
    setPhase('interaction');
  };

  const handleInteractionComplete = useCallback(async (data) => {
    // Complete the ritual and award XP
    if (user?.id) {
      const result = await completeRitual(user.id, ritualId, {
        reflection: data?.text,
      });

      if (result.success) {
        setXpAwarded(result.xpAwarded || 0);
      }
    }

    setPhase('complete');
  }, [user?.id, ritualId]);

  const handleFinish = () => {
    navigate('/rituals');
  };

  const handleExit = () => {
    if (phase !== 'intro' && phase !== 'complete') {
      if (!window.confirm('Are you sure you want to exit? Progress will be lost.')) {
        return;
      }
    }
    navigate('/rituals');
  };

  if (error) {
    return (
      <div className="ritual-playground-error">
        <p>{error}</p>
        <button onClick={() => navigate('/rituals')}>Go Back</button>
      </div>
    );
  }

  if (!ritual) {
    return null;
  }

  return (
    <div className="ritual-playground">
      <CosmicBackground color={ritual.color} starCount={120} />

      {/* Exit Button */}
      <button className="ritual-playground-exit" onClick={handleExit}>
        <X size={24} />
      </button>

      {/* Phase Content */}
      <div className="ritual-playground-content">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <IntroPhase key="intro" ritual={ritual} onStart={handleStart} />
          )}

          {phase === 'breath' && (
            <BreathPhase key="breath" ritual={ritual} onComplete={handleBreathComplete} />
          )}

          {phase === 'interaction' && (
            <InteractionPhase
              key="interaction"
              ritual={ritual}
              onComplete={handleInteractionComplete}
            />
          )}

          {phase === 'complete' && (
            <CompletePhase
              key="complete"
              ritual={ritual}
              xpAwarded={xpAwarded}
              onFinish={handleFinish}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RitualPlaygroundPage;
