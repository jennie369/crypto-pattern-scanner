/**
 * Subscription Settings Component
 * - Current subscription display
 * - Upgrade/downgrade options
 * - Invoice history
 * - Cancellation flow
 */

import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { cancelSubscription } from '../../services/settingsService';
import { Gem, BookOpen, BarChart3, Bot, Rocket, ShoppingCart, FileText, CheckCircle, Loader, Download, AlertTriangle } from 'lucide-react';

const SubscriptionSettings = ({ subscriptionInfo, profile, showToast }) => {
  const { t } = useTranslation();
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancelSubscription = async (productType) => {
    if (!cancelReason.trim()) {
      showToast('Please provide a cancellation reason', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel your ${productType} subscription?`)) {
      return;
    }

    setCancelling(true);
    try {
      const result = await cancelSubscription(profile.id, productType, cancelReason);

      if (result.success) {
        showToast('Subscription cancellation requested', 'success');
        setCancelReason('');
      } else {
        showToast('Failed to cancel subscription', 'error');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showToast('Failed to cancel subscription', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'tier1':
        return '#8B5CF6'; // Purple
      case 'tier2':
        return '#00D9FF'; // Cyan
      case 'tier3':
        return '#FFBD59'; // Gold
      default:
        return '#FFFFFF';
    }
  };

  return (
    <div className="subscription-settings">
      {/* Current Subscriptions */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Gem size={20} /> Current Subscriptions
        </h2>
        <p className="section-desc">Your active subscription plans</p>

        <div className="subscription-grid" style={{ marginTop: '24px' }}>
          {/* Course Tier */}
          <div className="subscription-card">
            <div className="subscription-header">
              <span className="subscription-icon"><BookOpen size={24} /></span>
              <h3>Course Access</h3>
            </div>
            <div
              className="subscription-tier"
              style={{
                color: getTierBadgeColor(profile?.course_tier),
                fontWeight: 700,
                fontSize: '20px',
                marginTop: '12px',
              }}
            >
              {profile?.course_tier?.toUpperCase() || 'FREE'}
            </div>
            {profile?.course_tier !== 'free' && profile?.course_tier_expires_at && (
              <div className="subscription-expires">
                Expires: {new Date(profile.course_tier_expires_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Scanner Tier */}
          <div className="subscription-card">
            <div className="subscription-header">
              <span className="subscription-icon"><BarChart3 size={24} /></span>
              <h3>Scanner Access</h3>
            </div>
            <div
              className="subscription-tier"
              style={{
                color: getTierBadgeColor(profile?.scanner_tier),
                fontWeight: 700,
                fontSize: '20px',
                marginTop: '12px',
              }}
            >
              {profile?.scanner_tier?.toUpperCase() || 'FREE'}
            </div>
            {profile?.scanner_tier !== 'free' && profile?.scanner_tier_expires_at && (
              <div className="subscription-expires">
                Expires: {new Date(profile.scanner_tier_expires_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Chatbot Tier */}
          <div className="subscription-card">
            <div className="subscription-header">
              <span className="subscription-icon"><Bot size={24} /></span>
              <h3>Chatbot Access</h3>
            </div>
            <div
              className="subscription-tier"
              style={{
                color: getTierBadgeColor(profile?.chatbot_tier),
                fontWeight: 700,
                fontSize: '20px',
                marginTop: '12px',
              }}
            >
              {profile?.chatbot_tier?.toUpperCase() || 'FREE'}
            </div>
            {profile?.chatbot_tier !== 'free' && profile?.chatbot_tier_expires_at && (
              <div className="subscription-expires">
                Expires: {new Date(profile.chatbot_tier_expires_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            className="btn-primary"
            onClick={() => (window.location.href = '/pricing')}
            style={{ marginRight: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Rocket size={16} /> Upgrade Plan
          </button>
          <button
            className="btn-secondary"
            onClick={() => (window.location.href = '/shop')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ShoppingCart size={16} /> View Shop
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} /> Invoice History
        </h2>
        <p className="section-desc">View and download your past invoices</p>

        <div style={{ marginTop: '24px' }}>
          {subscriptionInfo?.invoices && subscriptionInfo.invoices.length > 0 ? (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionInfo.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoice_number}</td>
                    <td>
                      {invoice.product_type.charAt(0).toUpperCase() +
                        invoice.product_type.slice(1)}{' '}
                      - {invoice.tier.toUpperCase()}
                    </td>
                    <td>
                      {invoice.currency} {invoice.amount}
                    </td>
                    <td>
                      <span className={`status-badge ${invoice.status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {invoice.status === 'paid' ? <CheckCircle size={14} /> : <Loader size={14} className="spin" />} {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(invoice.issued_at).toLocaleDateString()}</td>
                    <td>
                      {invoice.invoice_url && (
                        <a
                          href={invoice.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Download size={14} /> Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No invoices yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Subscription */}
      {(profile?.course_tier !== 'free' ||
        profile?.scanner_tier !== 'free' ||
        profile?.chatbot_tier !== 'free') && (
        <div
          className="card-glass danger-zone"
          style={{
            marginBottom: '24px',
            padding: '32px',
            borderColor: 'rgba(239, 68, 68, 0.4)',
          }}
        >
          <h2 className="section-title" style={{ color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} /> Cancel Subscription
          </h2>
          <p className="section-desc">We're sorry to see you go</p>

          <div style={{ marginTop: '24px' }}>
            <div className="form-group">
              <label>Why are you cancelling?</label>
              <select
                className="auth-input"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={cancelling}
              >
                <option value="">Select a reason...</option>
                <option value="too_expensive">Too expensive</option>
                <option value="not_using">Not using enough</option>
                <option value="missing_features">Missing features</option>
                <option value="found_alternative">Found an alternative</option>
                <option value="technical_issues">Technical issues</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {profile?.course_tier !== 'free' && (
                <button
                  className="btn-danger"
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid #EF4444',
                    borderRadius: '12px',
                    color: '#EF4444',
                    fontWeight: 700,
                  }}
                  onClick={() => handleCancelSubscription('course')}
                  disabled={cancelling}
                >
                  Cancel Course
                </button>
              )}

              {profile?.scanner_tier !== 'free' && (
                <button
                  className="btn-danger"
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid #EF4444',
                    borderRadius: '12px',
                    color: '#EF4444',
                    fontWeight: 700,
                  }}
                  onClick={() => handleCancelSubscription('scanner')}
                  disabled={cancelling}
                >
                  Cancel Scanner
                </button>
              )}

              {profile?.chatbot_tier !== 'free' && (
                <button
                  className="btn-danger"
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid #EF4444',
                    borderRadius: '12px',
                    color: '#EF4444',
                    fontWeight: 700,
                  }}
                  onClick={() => handleCancelSubscription('chatbot')}
                  disabled={cancelling}
                >
                  Cancel Chatbot
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSettings;
