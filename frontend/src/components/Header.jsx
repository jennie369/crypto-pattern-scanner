import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { Gem, Search, BarChart3, Settings, Sun, Moon, User, DoorOpen } from 'lucide-react';
import './Header.css';

/**
 * Header Component
 * Navigation bar with logo, actions, and theme toggle
 * Now uses React Router for navigation
 *
 * Props:
 * - onThemeToggle: Callback for theme toggle
 * - theme: Current theme ('light' or 'dark')
 */
export default function Header({ onThemeToggle, theme = 'dark' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useTranslation();

  console.log('🌐 Header rendering with language:', language);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo" onClick={() => navigate('/scanner-v2')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon"><Gem size={28} /></span>
          <span
            className="logo-text heading-xl"
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
            GEM PATTERN SCANNER
          </span>
        </div>
        <span className="subtitle">Binance Futures Edition</span>
      </div>

      <div className="header-center">
        <nav className="nav-buttons">
          <button
            className={`nav-btn ${isActive('/scanner-v2') ? 'active' : ''}`}
            onClick={() => navigate('/scanner-v2')}
          >
            <span className="btn-icon"><Search size={18} /></span>
            <span>{t('scanPatterns')}</span>
          </button>
          <button
            className={`nav-btn ${isActive('/history') ? 'active' : ''}`}
            onClick={() => navigate('/history')}
          >
            <span className="btn-icon"><BarChart3 size={18} /></span>
            <span>{t('history')}</span>
          </button>
          <button
            className={`nav-btn ${isActive('/settings') ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            <span className="btn-icon"><Settings size={18} /></span>
            <span>{t('settings')}</span>
          </button>
        </nav>
      </div>

      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className="theme-icon">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </span>
          <span className="theme-text">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        <button
          className={`header-btn admin ${isActive('/admin') ? 'active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          <span><User size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t('admin')}</span>
        </button>

        <button
          className="header-btn exit"
          onClick={() => {
            if (confirm('Are you sure you want to exit?')) {
              window.close();
            }
          }}
        >
          <span><DoorOpen size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t('exit')}</span>
        </button>
      </div>
    </header>
  );
}
