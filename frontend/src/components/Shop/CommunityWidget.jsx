import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, X, Send, Facebook, Instagram, Hash, Sparkles, Gift, Handshake, Gem } from 'lucide-react';
import './CommunityWidget.css';

const CommunityWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const communityLinks = [
    {
      name: 'Telegram',
      icon: Send,
      url: 'https://t.me/yinyangmasters',
      color: '#0088cc',
      members: '8.2K',
    },
    {
      name: 'Discord',
      icon: Hash,
      url: 'https://discord.gg/yinyangmasters',
      color: '#5865F2',
      members: '3.5K',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com/yinyangmasters',
      color: '#1877F2',
      members: '12.5K',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://chat.whatsapp.com/yinyangmasters',
      color: '#25D366',
      members: '2.1K',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/yinyangmasters',
      color: '#E4405F',
      members: '15.8K',
    },
  ];

  const totalMembers = communityLinks.reduce((sum, link) => {
    const count = parseFloat(link.members.replace('K', '')) * 1000;
    return sum + count;
  }, 0);

  return (
    <>
      {/* Collapsed Button */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            className="community-widget-collapsed"
            onClick={() => setIsExpanded(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulse Ring Animation */}
            <div className="pulse-ring" />
            <div className="pulse-ring pulse-ring-delay" />

            {/* Icon */}
            <div className="widget-icon">
              <Users size={24} />
            </div>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="widget-tooltip"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  Join Community
                </motion.div>
              )}
            </AnimatePresence>

            {/* Member Count Badge */}
            <div className="member-badge">
              {(totalMembers / 1000).toFixed(1)}K+
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Widget */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="community-widget-expanded"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="widget-header">
              <div className="header-content">
                <div className="gem-icon">
                  <Gem size={24} />
                </div>
                <div className="header-text">
                  <h3>Join Our Community</h3>
                  <p className="subtitle">Connect with spiritual seekers</p>
                </div>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsExpanded(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats */}
            <div className="community-stats">
              <div className="stat">
                <Users size={20} />
                <div>
                  <strong>{(totalMembers / 1000).toFixed(1)}K+</strong>
                  <span>Members</span>
                </div>
              </div>
              <div className="stat">
                <MessageCircle size={20} />
                <div>
                  <strong>24/7</strong>
                  <span>Active</span>
                </div>
              </div>
            </div>

            <div className="widget-divider" />

            {/* Social Links */}
            <div className="social-links">
              {communityLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      '--link-color': link.color,
                    }}
                  >
                    <div className="social-icon">
                      <Icon />
                    </div>
                    <div className="social-info">
                      <span className="social-name">{link.name}</span>
                      <span className="social-members">{link.members} members</span>
                    </div>
                    <div className="social-arrow">→</div>
                  </motion.a>
                );
              })}
            </div>

            <div className="widget-divider" />

            {/* Benefits */}
            <div className="community-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">
                  <Sparkles size={18} />
                </span>
                <span>Daily spiritual guidance</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">
                  <Gift size={18} />
                </span>
                <span>Exclusive member discounts</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">
                  <Handshake size={18} />
                </span>
                <span>Connect with like-minded souls</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommunityWidget;
