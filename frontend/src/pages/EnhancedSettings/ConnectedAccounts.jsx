/**
 * Connected Accounts Component
 * - Telegram integration
 * - Social media connections (placeholders)
 */

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import TelegramConnect from '../../components/TelegramConnect/TelegramConnect';
import { Smartphone, Link, Unlock, Lock, MessageCircle, Facebook, Twitter, Bell, Construction, Rocket } from 'lucide-react';

const ConnectedAccounts = ({ user, profile, showToast }) => {
  const { t } = useTranslation();

  const socialPlatforms = [
    { name: 'Twitter', icon: <Twitter size={20} />, connected: false, comingSoon: true },
    { name: 'Discord', icon: <MessageCircle size={20} />, connected: false, comingSoon: true },
    { name: 'Facebook', icon: <Facebook size={20} />, connected: false, comingSoon: true },
  ];

  return (
    <div className="connected-accounts-page">
      {/* Telegram Integration */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={20} /> Telegram
        </h2>
        <p className="section-desc">Connect your Telegram account for instant alerts</p>

        <div style={{ marginTop: '24px' }}>
          {profile?.tier !== 'free' ? (
            <TelegramConnect />
          ) : (
            <div
              style={{
                padding: '24px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '2px dashed rgba(139, 92, 246, 0.4)',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: '16px' }}><Lock size={48} /></div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#8B5CF6' }}>
                Premium Feature
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '16px' }}>
                Upgrade to Tier 1+ to connect your Telegram account
              </p>
              <button
                className="btn-premium"
                onClick={() => (window.location.href = '/pricing')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Rocket size={16} /> Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Social Media Connections */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Link size={20} /> Social Media
        </h2>
        <p className="section-desc">Connect your social media accounts</p>

        <div style={{ marginTop: '24px' }}>
          {socialPlatforms.map((platform) => (
            <div
              key={platform.name}
              className="notification-item"
              style={{
                opacity: platform.comingSoon ? 0.5 : 1,
                marginBottom: '16px',
              }}
            >
              <div className="notification-info">
                <div className="notification-icon">{platform.icon}</div>
                <div className="notification-text">
                  <div className="notification-title">
                    {platform.name}
                    {platform.comingSoon && (
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '11px',
                          padding: '2px 8px',
                          background: 'rgba(255, 189, 89, 0.2)',
                          border: '1px solid rgba(255, 189, 89, 0.4)',
                          borderRadius: '4px',
                          color: '#FFBD59',
                        }}
                      >
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div className="notification-desc">
                    {platform.connected ? 'Connected' : 'Not connected'}
                  </div>
                </div>
              </div>
              <button
                className="btn-secondary"
                disabled={platform.comingSoon}
                style={{
                  cursor: platform.comingSoon ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {platform.connected ? (
                  <>
                    <Unlock size={16} /> Disconnect
                  </>
                ) : (
                  <>
                    <Link size={16} /> Connect
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Webhooks (Placeholder) */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px', opacity: 0.6 }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} /> Webhooks
        </h2>
        <p className="section-desc">Configure webhooks for external integrations (Coming soon)</p>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}><Construction size={48} /></div>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Webhook integrations will be available in a future update
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectedAccounts;
