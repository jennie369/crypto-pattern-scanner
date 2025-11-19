import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import {
  Home, Search, Tool, Users, GraduationCap, User, Gem,
  ChevronDown, Lock, LogOut, Settings, DollarSign,
  BookOpen, Calculator, Percent, TrendingUp, BarChart,
  Heart, Calendar, Filter, BarChart2, Activity,
  Brain, Waves, Bell, Key, MessageSquare, Mail,
  Trophy, Bot, ShoppingCart, CreditCard, UserCircle,
  Handshake
} from 'lucide-react';
import './TopNavBar.css';

/**
 * Top Navigation Bar - Tier-Based Organization
 * Phase 3: Navigation & Layout Refinement
 */
function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, profile, isAdmin, signOut } = useAuth();

  // Dropdown state management
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Get user tier (PRESERVE existing logic)
  const userTier = user?.scanner_tier || profile?.scanner_tier || 'FREE';

  // Tier checking function (PRESERVE existing logic)
  const hasAccess = (requiredTier) => {
    const tierHierarchy = {
      FREE: 0,
      TIER1: 1,
      TIER2: 2,
      TIER3: 3
    };
    const currentLevel = tierHierarchy[userTier] || 0;
    const requiredLevel = tierHierarchy[requiredTier] || 0;
    return currentLevel >= requiredLevel;
  };

  // Toggle dropdown (only one open at a time)
  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.nav-dropdown')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle logout (PRESERVE existing logic)
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setActiveDropdown(null);
    setIsMenuOpen(false);
  };

  return (
    <nav className="top-nav-bar">
      <div className="nav-container">

        {/* Logo - PRESERVE */}
        <div className="nav-logo" onClick={() => handleNavigation('/scanner-v2')}>
          <div className="logo-icon"><Gem size={32} /></div>
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

        {/* Main Navigation */}
        <div className={`nav-main ${isMenuOpen ? 'open' : ''}`}>

          {/* Dashboard - Always visible */}
          <Link to="/scanner-v2" className={`nav-item ${isActive('/scanner-v2') ? 'active' : ''}`}>
            <Home size={20} />
            <span>Dashboard</span>
          </Link>

          {/* Scanner - Always visible */}
          <Link to="/scanner" className={`nav-item ${isActive('/scanner') ? 'active' : ''}`}>
            <Search size={20} />
            <span>Scanner</span>
          </Link>

          {/* TOOLS DROPDOWN */}
          <div className="nav-dropdown">
            <button
              className={`nav-item dropdown-trigger ${activeDropdown === 'tools' ? 'active' : ''}`}
              onClick={() => toggleDropdown('tools')}
            >
              <Tool size={20} />
              <span>Tools</span>
              <ChevronDown size={16} className={activeDropdown === 'tools' ? 'rotated' : ''} />
            </button>

            {activeDropdown === 'tools' && (
              <div className="dropdown-menu tools-menu">

                {/* TIER 1 Section */}
                <div className="dropdown-section">
                  <div className="section-header">
                    <span className="section-title">TIER 1 TOOLS</span>
                    <span className="tier-badge tier-1">🔹 PRO</span>
                  </div>

                  <Link
                    to="/journal"
                    className={`dropdown-item ${!hasAccess('TIER1') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <BookOpen size={18} />
                    <span>Trading Journal</span>
                    {!hasAccess('TIER1') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/risk-calculator"
                    className={`dropdown-item ${!hasAccess('TIER1') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Calculator size={18} />
                    <span>Risk Calculator</span>
                    {!hasAccess('TIER1') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/position-size"
                    className={`dropdown-item ${!hasAccess('TIER1') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Percent size={18} />
                    <span>Position Size</span>
                    {!hasAccess('TIER1') && <Lock size={14} className="lock-icon" />}
                  </Link>
                </div>

                {/* TIER 2 Section */}
                <div className="dropdown-section">
                  <div className="section-header">
                    <span className="section-title">TIER 2 TOOLS</span>
                    <span className="tier-badge tier-2">💎 PREMIUM</span>
                  </div>

                  <Link
                    to="/portfolio"
                    className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <TrendingUp size={18} />
                    <span>Portfolio Tracker</span>
                    {!hasAccess('TIER2') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/mtf-analysis"
                    className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <BarChart size={18} />
                    <span>Multi-Timeframe</span>
                    {!hasAccess('TIER2') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/sentiment"
                    className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Heart size={18} />
                    <span>Sentiment Analyzer</span>
                    {!hasAccess('TIER2') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/news-calendar"
                    className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Calendar size={18} />
                    <span>News Calendar</span>
                    {!hasAccess('TIER2') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/screener"
                    className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Filter size={18} />
                    <span>Market Screener</span>
                    {!hasAccess('TIER2') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/sr-levels"
                    className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <TrendingUp size={18} />
                    <span>S/R Levels</span>
                    {!hasAccess('TIER2') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/volume"
                    className={`dropdown-item ${!hasAccess('TIER2') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <BarChart2 size={18} />
                    <span>Volume Analysis</span>
                    {!hasAccess('TIER2') && <Lock size={14} className="lock-icon" />}
                  </Link>
                </div>

                {/* TIER 3 Section */}
                <div className="dropdown-section">
                  <div className="section-header">
                    <span className="section-title">TIER 3 ELITE</span>
                    <span className="tier-badge tier-3">👑 VIP</span>
                  </div>

                  <Link
                    to="/tier3/backtesting"
                    className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Activity size={18} />
                    <span>Backtesting</span>
                    {!hasAccess('TIER3') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/tier3/ai-prediction"
                    className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Brain size={18} />
                    <span>AI Prediction</span>
                    {!hasAccess('TIER3') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/tier3/whale-tracker"
                    className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Waves size={18} />
                    <span>Whale Tracker</span>
                    {!hasAccess('TIER3') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/alerts"
                    className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Bell size={18} />
                    <span>Alerts Manager</span>
                    {!hasAccess('TIER3') && <Lock size={14} className="lock-icon" />}
                  </Link>

                  <Link
                    to="/api-keys"
                    className={`dropdown-item ${!hasAccess('TIER3') ? 'locked' : ''}`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Key size={18} />
                    <span>API Keys</span>
                    {!hasAccess('TIER3') && <Lock size={14} className="lock-icon" />}
                  </Link>
                </div>

              </div>
            )}
          </div>

          {/* COMMUNITY DROPDOWN */}
          <div className="nav-dropdown">
            <button
              className={`nav-item dropdown-trigger ${activeDropdown === 'community' ? 'active' : ''}`}
              onClick={() => toggleDropdown('community')}
            >
              <Users size={20} />
              <span>Cộng Đồng</span>
              <ChevronDown size={16} className={activeDropdown === 'community' ? 'rotated' : ''} />
            </button>

            {activeDropdown === 'community' && (
              <div className="dropdown-menu">
                <Link to="/forum" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <MessageSquare size={18} />
                  <span>Forum</span>
                </Link>

                <Link to="/messages" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <Mail size={18} />
                  <span>Messages</span>
                  {unreadMessages > 0 && (
                    <span className="badge">{unreadMessages}</span>
                  )}
                </Link>

                <Link to="/events" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <Calendar size={18} />
                  <span>Events</span>
                </Link>

                <Link to="/leaderboard" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <Trophy size={18} />
                  <span>Leaderboard</span>
                </Link>

                <Link to="/chatbot" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <Bot size={18} />
                  <span>GEM Chatbot</span>
                </Link>
              </div>
            )}
          </div>

          {/* LEARNING DROPDOWN */}
          <div className="nav-dropdown">
            <button
              className={`nav-item dropdown-trigger ${activeDropdown === 'learning' ? 'active' : ''}`}
              onClick={() => toggleDropdown('learning')}
            >
              <GraduationCap size={20} />
              <span>Học Tập</span>
              <ChevronDown size={16} className={activeDropdown === 'learning' ? 'rotated' : ''} />
            </button>

            {activeDropdown === 'learning' && (
              <div className="dropdown-menu">
                <Link to="/courses" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <BookOpen size={18} />
                  <span>Courses</span>
                </Link>

                <Link to="/shop" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                  <ShoppingCart size={18} />
                  <span>Shop</span>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Navigation - Account & Settings */}
        <div className="nav-right">

          {/* Settings - Desktop only */}
          <Link
            to="/settings"
            className={`nav-item nav-item-desktop ${isActive('/settings') ? 'active' : ''}`}
            title={t('settings')}
          >
            <Settings size={20} />
            <span className="nav-label-desktop">{t('settings')}</span>
          </Link>

          {/* Admin - Desktop only (if admin) */}
          {isAdmin() && (
            <Link
              to="/admin"
              className={`nav-item nav-item-desktop ${isActive('/admin') ? 'active' : ''}`}
              title={t('admin')}
            >
              <Lock size={20} />
              <span className="nav-label-desktop">{t('admin')}</span>
            </Link>
          )}

          {/* ACCOUNT DROPDOWN */}
          {user && (
            <div className="nav-dropdown account-dropdown">
              <button
                className={`nav-item dropdown-trigger user-menu ${activeDropdown === 'account' ? 'active' : ''}`}
                onClick={() => toggleDropdown('account')}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="user-avatar" />
                ) : (
                  <User size={20} />
                )}
                <span className="user-name">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</span>
                <ChevronDown size={16} className={activeDropdown === 'account' ? 'rotated' : ''} />
              </button>

              {activeDropdown === 'account' && (
                <div className="dropdown-menu account-menu">
                  <div className="account-info">
                    <p className="user-email">{user?.email}</p>
                    <span className={`tier-badge tier-${userTier.toLowerCase()}`}>
                      {userTier}
                    </span>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link to="/account" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                    <User size={18} />
                    <span>Account Dashboard</span>
                  </Link>

                  <Link to="/profile" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                    <UserCircle size={18} />
                    <span>Profile</span>
                  </Link>

                  <Link to="/settings" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>

                  <Link to="/affiliate" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                    <Handshake size={18} />
                    <span>Affiliate</span>
                  </Link>

                  <Link to="/pricing" className="dropdown-item" onClick={() => setActiveDropdown(null)}>
                    <CreditCard size={18} />
                    <span>Pricing</span>
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}

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
