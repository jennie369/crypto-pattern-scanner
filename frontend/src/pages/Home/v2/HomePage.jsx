import React from 'react';
import HeroSection from './components/HeroSection';
import StatsBar from './components/StatsBar';
import MethodSection from './components/MethodSection';
import PricingTable from './components/PricingTable';
import TestimonialsCarousel from './components/TestimonialsCarousel';
import FinalCTA from './components/FinalCTA';
import './HomePage.css';

/**
 * Home Page v2 - GEM Platform
 * Complete redesign with AIDA conversion funnel
 *
 * Structure:
 * 1. HeroSection - Attention (Hero + Chatbot)
 * 2. StatsBar - Social Proof
 * 3. MethodSection - Interest (GEM Method)
 * 4. PricingTable - Desire (4 Tiers)
 * 5. TestimonialsCarousel - Trust
 * 6. FinalCTA - Action
 */
export const HomePage = () => {
  return (
    <div className="home-page-v2">
      {/* HERO SECTION - Attention */}
      <HeroSection />

      {/* STATS BAR - Social Proof */}
      <StatsBar />

      {/* METHOD SECTION - Interest */}
      <MethodSection />

      {/* PRICING TABLE - Desire */}
      <PricingTable />

      {/* TESTIMONIALS - Trust */}
      <TestimonialsCarousel />

      {/* FINAL CTA - Action */}
      <FinalCTA />
    </div>
  );
};

export default HomePage;
