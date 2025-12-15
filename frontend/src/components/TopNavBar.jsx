import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { NAV_ITEMS, isPathActive } from '../config/navigation';
import * as Icons from 'lucide-react';
import {
  Home, Search, Wrench, Users, GraduationCap, User, Gem,
  ChevronDown, Lock, LogOut, Settings, DollarSign,
  BookOpen, Calculator, Percent, TrendingUp, BarChart,
  Heart, Calendar, Filter, BarChart2, Activity,
  Brain, Waves, Bell, Key, MessageSquare, Mail,
  Trophy, Bot, ShoppingCart, CreditCard, UserCircle,
  Handshake, Briefcase, Menu, X
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

  // Auto-hide navbar on scroll
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (path) => location.pathname === path;

  // Get icon component by name
  const getIcon = (iconName, size = 18) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={size} /> : null;
  };

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

  // Auto-hide navbar on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top (within 10px)
      if (currentScrollY < 10) {
        setIsNavbarHidden(false);
      }
      // Hide navbar when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down & past threshold
        setIsNavbarHidden(true);
        setActiveDropdown(null); // Close any open dropdowns
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsNavbarHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    <nav className={`top-nav-bar ${isNavbarHidden ? 'nav-hidden' : ''}`}>
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

        {/* Main Navigation - Synced with Mobile 5 Tabs */}
        <div className={`nav-main ${isMenuOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map((navItem) => {
            // Skip account nav item if requires auth and user not logged in
            if (navItem.requiresAuth && !user) return null;

            return (
              <div
                key={navItem.id}
                className="nav-dropdown"
                onMouseEnter={() => setActiveDropdown(navItem.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={navItem.path}
                  className={`nav-item dropdown-trigger ${
                    isPathActive(location.pathname, navItem.path) ? 'active' : ''
                  } ${activeDropdown === navItem.id ? 'active' : ''}`}
                  onClick={(e) => {
                    // On mobile, toggle dropdown instead of navigating
                    if (window.innerWidth <= 968 && navItem.children?.length > 0) {
                      e.preventDefault();
                      toggleDropdown(navItem.id);
                    } else {
                      setActiveDropdown(null);
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  {getIcon(navItem.icon, 20)}
                  <span>{navItem.label}</span>
                  {navItem.children && navItem.children.length > 0 && (
                    <ChevronDown
                      size={16}
                      className={activeDropdown === navItem.id ? 'rotated' : ''}
                    />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {activeDropdown === navItem.id && navItem.children && navItem.children.length > 0 && (
                  <div className="dropdown-menu">
                    {navItem.children.map((child) => {
                      const isChildLocked = child.requiresAuth && !user;
                      return (
                        <Link
                          key={child.path}
                          to={isChildLocked ? '#' : child.path}
                          className={`dropdown-item ${isChildLocked ? 'locked' : ''} ${
                            isPathActive(location.pathname, child.path) ? 'active' : ''
                          }`}
                          onClick={(e) => {
                            if (isChildLocked) {
                              e.preventDefault();
                              navigate('/login', { state: { from: child.path } });
                            }
                            setActiveDropdown(null);
                            setIsMenuOpen(false);
                          }}
                        >
                          {getIcon(child.icon, 18)}
                          <span>{child.label}</span>
                          {isChildLocked && <Lock size={14} className="lock-icon" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Navigation - User Account & Admin */}
        <div className="nav-right">

          {/* ACCOUNT DROPDOWN - User menu with avatar */}
          {user && (
            <div className="nav-dropdown account-dropdown">
              <button
                className={`nav-item dropdown-trigger user-menu ${activeDropdown === 'user-account' ? 'active' : ''}`}
                onClick={() => toggleDropdown('user-account')}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="user-avatar" />
                ) : (
                  <User size={20} />
                )}
                <span className="user-name">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</span>
                <ChevronDown size={16} className={activeDropdown === 'user-account' ? 'rotated' : ''} />
              </button>

              {activeDropdown === 'user-account' && (
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
