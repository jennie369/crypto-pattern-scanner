import { useTranslation } from '../hooks/useTranslation';
import { Gem, Smartphone, Youtube, Users, Twitter, AlertTriangle } from 'lucide-react';
import './Footer.css';

/**
 * Footer Component
 * Professional footer with brand, links, and social media
 */
function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">

        {/* Brand Section */}
        <div className="footer-section brand">
          <div className="footer-logo">
            <span className="footer-icon"><Gem size={32} /></span>
            <div className="footer-brand-text">
              <div className="footer-brand-name">GEM TRADING ACADEMY</div>
              <div className="footer-tagline">{t('footerTagline')}</div>
            </div>
          </div>
          <p className="footer-description">
            {t('footerDescription')}
          </p>
        </div>

        {/* Links Section */}
        <div className="footer-section links">
          <h4>{t('quickLinks')}</h4>
          <ul>
            <li><a href="#about">{t('aboutUs')}</a></li>
            <li><a href="#courses">{t('courses')}</a></li>
            <li><a href="#faq">{t('faq')}</a></li>
            <li><a href="#contact">{t('contact')}</a></li>
          </ul>
        </div>

        {/* Resources Section */}
        <div className="footer-section links">
          <h4>{t('resources')}</h4>
          <ul>
            <li><a href="#docs">{t('documentation')}</a></li>
            <li><a href="#tutorials">{t('tutorials')}</a></li>
            <li><a href="#blog">{t('blog')}</a></li>
            <li><a href="#support">{t('support')}</a></li>
          </ul>
        </div>

        {/* Social Section */}
        <div className="footer-section social">
          <h4>{t('followUs')}</h4>
          <div className="social-links">
            <a href="https://t.me/gemtrading" className="social-btn telegram" target="_blank" rel="noopener noreferrer">
              <span><Smartphone size={18} /></span> Telegram
            </a>
            <a href="https://youtube.com/@gemtrading" className="social-btn youtube" target="_blank" rel="noopener noreferrer">
              <span><Youtube size={18} /></span> YouTube
            </a>
            <a href="https://facebook.com/gemtrading" className="social-btn facebook" target="_blank" rel="noopener noreferrer">
              <span><Users size={18} /></span> Facebook
            </a>
            <a href="https://twitter.com/gemtrading" className="social-btn twitter" target="_blank" rel="noopener noreferrer">
              <span><Twitter size={18} /></span> Twitter
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">
            © {currentYear} GEM Trading Academy. {t('allRightsReserved')}
          </p>
          <div className="footer-legal">
            <a href="#privacy">{t('privacyPolicy')}</a>
            <span className="separator">•</span>
            <a href="#terms">{t('termsOfService')}</a>
            <span className="separator">•</span>
            <a href="#disclaimer">{t('riskDisclaimer')}</a>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="footer-notice">
        <span className="notice-icon"><AlertTriangle size={18} /></span>
        <span>{t('tradingWarning')}</span>
      </div>

    </footer>
  );
}

export default Footer;
