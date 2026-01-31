/**
 * CosmicBackground Component
 * Animated starfield background for rituals
 *
 * @fileoverview Full-screen cosmic backdrop with stars and particles
 */

import React, { useEffect, useRef } from 'react';
import './CosmicBackground.css';

/**
 * CosmicBackground - Animated starfield
 *
 * @param {string} color - Primary glow color
 * @param {number} starCount - Number of stars
 */
const CosmicBackground = ({
  color = '#6A5BFF',
  starCount = 100,
  className = '',
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.5 + 0.5,
          speed: Math.random() * 0.02 + 0.01,
          direction: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = '#05040B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, `${color}10`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        // Twinkle effect
        star.alpha += star.speed * star.direction;
        if (star.alpha >= 1 || star.alpha <= 0.3) {
          star.direction *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        // Add glow for larger stars
        if (star.radius > 1) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * 0.2})`;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, starCount]);

  return (
    <div className={`cosmic-background ${className}`}>
      <canvas ref={canvasRef} className="cosmic-background-canvas" />
      <div className="cosmic-background-overlay" style={{ '--glow-color': color }} />
    </div>
  );
};

export default CosmicBackground;
