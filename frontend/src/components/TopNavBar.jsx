import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import './TopNavBar.css';

/**
 * Top Navigation Bar
 * Modern navigation menu inspired by Whale Alert design
 */
function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { id: 'home', path: '/', label: t('home'), icon: '🏠' },
    { id: 'pricing', path: '/pricing', label: 'Pricing', icon: '💎' },
    { id: 'risk-calculator', path: '/risk-calculator', label: 'Risk Calc', icon: '📊' },
    { id: 'analytics', path: '/analytics', label: t('analytics'), icon: '📈', badge: 'SOON' },
    { id: 'history', path: '/history', label: t('history'), icon: '📜' },

    // TIER 3 Elite Tools
    { id: 'backtesting', path: '/tier3/backtesting', label: 'Backtesting', icon: '⚡', badge: 'VIP' },
    { id: 'ai-prediction', path: '/tier3/ai-prediction', label: 'AI Predict', icon: '🤖', badge: 'VIP' },
    { id: 'whale-tracker', path: '/tier3/whale-tracker', label: 'Whales', icon: '🐋', badge: 'VIP' },
  ];

  // Right menu items - Admin item only shown for admin users
  const rightMenuItems = [
    { id: 'settings', path: '/settings', label: t('settings'), icon: '⚙️' },
    ...(isAdmin() ? [{ id: 'admin', path: '/admin', label: t('admin'), icon: '🔒' }] : []),
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="top-nav-bar">
      <div className="nav-container">

        {/* Logo */}
        <div className="nav-logo" onClick={() => handleNavigation('/')}>
          <div className="logo-icon">💎</div>
          <div className="logo-text">
            <div
              className="logo-title heading-lg"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFBD59 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(255, 189, 89, 0.3)'
              }}
            >
              GEM PATTERN
            </div>
            <div className="logo-subtitle">SCANNER</div>
          </div>
        </div>

        {/* Main Menu */}
        <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </div>

        {/* Right Menu */}
        <div className="nav-right">
          {rightMenuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label-desktop">{item.label}</span>
            </button>
          ))}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

      </div>
    </nav>
  );
}

export default TopNavBar;
