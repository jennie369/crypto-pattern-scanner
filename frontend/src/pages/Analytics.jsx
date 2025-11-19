import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, TrendingUp, Target, DollarSign, Star, Home } from 'lucide-react';
import './Analytics.css';

/**
 * Analytics Page - Coming Soon Placeholder
 * Future features:
 * - Scan history and performance tracking
 * - Pattern success rate analysis
 * - Portfolio performance metrics
 * - Win/loss ratio tracking
 */
function Analytics() {
  const { user, profile } = useAuth();
  const isPremium = profile && profile.tier !== 'free';

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        {/* Coming Soon Section */}
        <div className="coming-soon-card">
          <div className="coming-soon-icon"><BarChart3 size={64} /></div>
          <h1 className="coming-soon-title">Analytics Dashboard</h1>
          <p className="coming-soon-subtitle">Coming Soon</p>

          <p className="coming-soon-description">
            We're building a comprehensive analytics dashboard to help you track your trading performance.
          </p>

          {/* Feature Preview */}
          <div className="feature-preview">
            <h3>Upcoming Features:</h3>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon"><TrendingUp size={32} /></span>
                <div className="feature-content">
                  <h4>Scan History</h4>
                  <p>Review all your past scans and detected patterns</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon"><Target size={32} /></span>
                <div className="feature-content">
                  <h4>Pattern Success Rate</h4>
                  <p>Analyze which patterns perform best for your strategy</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon"><DollarSign size={32} /></span>
                <div className="feature-content">
                  <h4>Performance Metrics</h4>
                  <p>Track win/loss ratio, average profit, and more</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon"><BarChart3 size={32} /></span>
                <div className="feature-content">
                  <h4>Custom Reports</h4>
                  <p>Generate detailed reports for your trading activity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Info */}
          {user && (
            <div className="tier-info-card">
              <div className="tier-badge-large">
                {isPremium ? <><Star size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />TIER 1+</> : 'FREE'}
              </div>
              <p className="tier-message">
                {isPremium
                  ? 'As a premium user, you\'ll get advanced analytics features when they launch!'
                  : 'Upgrade to a premium tier to unlock advanced analytics features when they launch!'}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="coming-soon-cta">
            <p>Want to be notified when Analytics launches?</p>
            <a href="/" className="btn-back-home">
              <Home size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Back to Scanner
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
