/**
 * Compact Collapsible Sidebar
 * YouTube-style navigation that expands on hover
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Handshake,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Gem,
  Users,
  MessageSquare,
  Sparkles,
  Trophy,
  Calendar
} from 'lucide-react';
import './CompactSidebar.css';

const CompactSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  // State for hover and locked expanded state
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Load locked state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-locked');
    if (savedState === 'true') {
      setIsLocked(true);
    }
  }, []);

  // Save locked state to localStorage
  const toggleLock = () => {
    const newState = !isLocked;
    setIsLocked(newState);
    localStorage.setItem('sidebar-locked', newState.toString());
  };

  // Main navigation items (NEW ORDER - 9 items)
  const navItems = [
    {
      id: 'forum',
      label: 'News Feed',
      icon: Users,
      path: '/forum',
      description: 'Community discussions'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      path: '/messages',
      description: 'Your conversations'
    },
    {
      id: 'chatbot',
      label: 'Gem Master',
      icon: Sparkles,
      path: '/chatbot',
      description: 'AI trading assistant'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/account',
      description: 'Account overview'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      path: '/leaderboard',
      description: 'Top traders ranking'
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      path: '/events',
      description: 'Community events'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      description: 'Your profile & achievements'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: Briefcase,
      path: '/portfolio',
      description: 'Track your investments'
    },
    {
      id: 'affiliate',
      label: 'Đối Tác',
      icon: Handshake,
      path: '/affiliate',
      description: 'Referral program'
    }
  ];

  // Settings item (separate, in footer)
  const settingsItem = {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    description: 'Preferences & configuration'
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      signOut();
    }
  };

  // Determine if sidebar should be expanded
  const isExpanded = isLocked || isHovered;

  // Animation variants
  const sidebarVariants = {
    collapsed: {
      width: 80,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    expanded: {
      width: 280,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    }
  };

  const labelVariants = {
    collapsed: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.15
      }
    },
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.25,
        delay: 0.1
      }
    }
  };

  const arrowVariants = {
    collapsed: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.15 }
    },
    expanded: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, delay: 0.1 }
    }
  };

  return (
    <motion.div
      className="compact-sidebar"
      variants={sidebarVariants}
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Logo */}
      <div className="compact-sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon-wrapper">
            <Gem size={28} className="logo-gem" />
          </div>
          <motion.div
            className="logo-text"
            variants={labelVariants}
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            <span className="logo-title">GEM</span>
            <span className="logo-subtitle">Platform</span>
          </motion.div>
        </div>

        {/* Toggle Lock Button */}
        <motion.button
          className="sidebar-lock-toggle"
          onClick={toggleLock}
          variants={arrowVariants}
          animate={isExpanded ? 'expanded' : 'collapsed'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isLocked ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </motion.button>
      </div>

      {/* Navigation Items */}
      <nav className="compact-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.id}
              className={`compact-nav-item ${active ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="nav-item-icon-wrapper">
                <Icon size={22} className="nav-item-icon" />
                {active && <div className="nav-item-indicator" />}
              </div>

              <motion.div
                className="nav-item-content"
                variants={labelVariants}
                animate={isExpanded ? 'expanded' : 'collapsed'}
              >
                <span className="nav-item-label">{item.label}</span>
                <span className="nav-item-description">{item.description}</span>
              </motion.div>

              <motion.div
                className="nav-item-arrow"
                variants={arrowVariants}
                animate={isExpanded ? 'expanded' : 'collapsed'}
              >
                <ChevronRight size={16} />
              </motion.div>
            </motion.button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="compact-sidebar-divider" />

      {/* Footer Section */}
      <div className="compact-sidebar-user">
        {/* Settings Button */}
        <motion.button
          className={`compact-nav-item ${isActive(settingsItem.path) ? 'active' : ''}`}
          onClick={() => handleNavigation(settingsItem.path)}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="nav-item-icon-wrapper">
            <Settings size={22} className="nav-item-icon" />
            {isActive(settingsItem.path) && <div className="nav-item-indicator" />}
          </div>

          <motion.div
            className="nav-item-content"
            variants={labelVariants}
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            <span className="nav-item-label">{settingsItem.label}</span>
            <span className="nav-item-description">{settingsItem.description}</span>
          </motion.div>

          <motion.div
            className="nav-item-arrow"
            variants={arrowVariants}
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            <ChevronRight size={16} />
          </motion.div>
        </motion.button>

        {/* Divider */}
        <div className="compact-sidebar-divider compact-sidebar-divider-footer" />

        {/* User Profile Section */}
        <div className="user-profile-section">
          <div className="user-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name || 'User'} />
            ) : (
              <User size={24} />
            )}
          </div>

          <motion.div
            className="user-info"
            variants={labelVariants}
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            <span className="user-name">
              {profile?.display_name || user?.email?.split('@')[0] || 'User'}
            </span>
            <span className="user-tier">
              {profile?.scanner_tier || 'FREE'} Member
            </span>
          </motion.div>
        </div>

        {/* Logout Button */}
        <motion.button
          className="compact-nav-item logout"
          onClick={handleLogout}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="nav-item-icon-wrapper">
            <LogOut size={22} className="nav-item-icon" />
          </div>

          <motion.div
            className="nav-item-content"
            variants={labelVariants}
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            <span className="nav-item-label">Logout</span>
          </motion.div>
        </motion.button>
      </div>

      {/* Tooltip for collapsed state */}
      {!isExpanded && (
        <AnimatePresence>
          {navItems.map((item) => {
            const active = isActive(item.path);
            if (active) {
              return (
                <motion.div
                  key={`tooltip-${item.id}`}
                  className="sidebar-tooltip"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {item.label}
                </motion.div>
              );
            }
            return null;
          })}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default CompactSidebar;
