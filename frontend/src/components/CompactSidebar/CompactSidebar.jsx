/**
 * Compact Collapsible Sidebar
 * YouTube-style navigation that expands on hover
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Handshake,
  Settings,
  LogOut,
  Gem,
  Users,
  MessageSquare,
  Sparkles,
  Trophy,
  Calendar,
  GraduationCap,
  Target,
  Moon
} from 'lucide-react';
import './CompactSidebar.css';

const CompactSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  // State for hover and locked expanded state
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Default collapsed

  // Load locked state from localStorage
  // One-time fix: Clear the forced 'true' value from previous buggy version
  useEffect(() => {
    const version = localStorage.getItem('sidebar-version');
    if (version !== 'v2') {
      // Reset sidebar state for users affected by previous bug
      localStorage.removeItem('sidebar-locked');
      localStorage.setItem('sidebar-version', 'v2');
      setIsLocked(false);
    } else {
      const savedState = localStorage.getItem('sidebar-locked');
      if (savedState === 'true') {
        setIsLocked(true);
      }
    }
  }, []);

  // Save locked state to localStorage
  const toggleLock = () => {
    const newState = !isLocked;
    setIsLocked(newState);
    localStorage.setItem('sidebar-locked', newState.toString());
  };

  // Main navigation items (NEW ORDER - 8 items, removed Portfolio)
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
      label: 'Gemral',
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
      id: 'vision-board',
      label: 'Vision Board',
      icon: Target,
      path: '/vision-board',
      description: 'Goals & habits'
    },
    {
      id: 'rituals',
      label: 'Rituals',
      icon: Moon,
      path: '/rituals',
      description: 'Trader mindfulness'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      description: 'Your profile & achievements'
    },
    {
      id: 'affiliate',
      label: 'Đối Tác',
      icon: Handshake,
      path: '/affiliate',
      description: 'Referral program'
    },
    {
      id: 'course-admin',
      label: 'Khóa Học',
      icon: GraduationCap,
      path: '/courses/admin',
      description: 'Quản lý khóa học'
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
      width: 64, // Icon only
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    expanded: {
      width: 130, // Icon + text below (increased from 90 for better subtitle visibility)
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
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
            <Gem size={24} strokeWidth={2.5} className="logo-gem" />
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="compact-sidebar-nav">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.id}
              className={`compact-nav-item ${active ? 'active' : ''} ${isExpanded ? 'expanded-mode' : 'collapsed-mode'}`}
              onClick={() => handleNavigation(item.path)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="nav-item-icon-wrapper">
                <Icon size={20} strokeWidth={2.5} className="nav-item-icon" />
                {active && <div className="nav-item-indicator" />}
              </div>
              {isExpanded && (
                <span className="nav-item-label">{item.label}</span>
              )}
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
          className={`compact-nav-item ${isActive(settingsItem.path) ? 'active' : ''} ${isExpanded ? 'expanded-mode' : 'collapsed-mode'}`}
          onClick={() => handleNavigation(settingsItem.path)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="nav-item-icon-wrapper">
            <Settings size={20} strokeWidth={2.5} className="nav-item-icon" />
            {isActive(settingsItem.path) && <div className="nav-item-indicator" />}
          </div>
          {isExpanded && (
            <span className="nav-item-label">{settingsItem.label}</span>
          )}
        </motion.button>

        {/* Divider */}
        <div className="compact-sidebar-divider compact-sidebar-divider-footer" />

        {/* User Profile Section */}
        <div className={`user-profile-section ${isExpanded ? 'expanded-mode' : 'collapsed-mode'}`}>
          <div className="user-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name || 'User'} />
            ) : (
              <User size={16} strokeWidth={2.5} />
            )}
          </div>
          {isExpanded && (
            <span className="user-name">
              {profile?.display_name || user?.email?.split('@')[0] || 'User'}
            </span>
          )}
        </div>

        {/* Logout Button */}
        <motion.button
          className={`compact-nav-item logout ${isExpanded ? 'expanded-mode' : 'collapsed-mode'}`}
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="nav-item-icon-wrapper">
            <LogOut size={20} strokeWidth={2.5} className="nav-item-icon" />
          </div>
          {isExpanded && (
            <span className="nav-item-label">Logout</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CompactSidebar;
