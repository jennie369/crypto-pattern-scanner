/**
 * AffiliateSection Component
 * Dynamic affiliate display with 4 states:
 * - no-affiliate: register CTA
 * - pending: pending review message
 * - rejected: rejection notice
 * - active: referral code, copy, stats, dashboard link
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Copy,
  Check,
  ChevronRight,
  Clock,
  XCircle,
  UserPlus,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import './AffiliateSection.css';

export function AffiliateSection({ userId }) {
  const navigate = useNavigate();
  const [affiliateData, setAffiliateData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | no-affiliate | pending | rejected | active
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadAffiliate = async () => {
      try {
        const { data, error } = await supabase
          .from('affiliate_profiles')
          .select('status, referral_code, total_commission, total_referrals, pending_commission')
          .eq('user_id', userId)
          .single();

        if (error && error.code === 'PGRST116') {
          // No affiliate profile found
          setStatus('no-affiliate');
          return;
        }
        if (error) {
          console.warn('[AffiliateSection] Load error:', error.message);
          setStatus('no-affiliate');
          return;
        }

        setAffiliateData(data);
        setStatus(data.status === 'active' ? 'active' : data.status === 'rejected' ? 'rejected' : 'pending');
      } catch (err) {
        console.error('[AffiliateSection] Error:', err);
        setStatus('no-affiliate');
      }
    };

    loadAffiliate();
  }, [userId]);

  const handleCopyCode = async () => {
    if (!affiliateData?.referral_code) return;
    try {
      await navigator.clipboard.writeText(affiliateData.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = affiliateData.referral_code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('vi-VN');
  };

  if (status === 'loading') return null;

  return (
    <div className="affiliate-section">
      <h3 className="affiliate-section-title">
        <Users size={20} />
        <span>Affiliate</span>
      </h3>

      {/* No affiliate - Register CTA */}
      {status === 'no-affiliate' && (
        <div
          className="affiliate-cta-card"
          onClick={() => navigate('/partnership/register')}
          role="button"
          tabIndex={0}
          title="Đăng ký chương trình Affiliate"
        >
          <div className="affiliate-cta-icon">
            <UserPlus size={28} />
          </div>
          <div className="affiliate-cta-content">
            <span className="affiliate-cta-title">Trở thành Affiliate</span>
            <span className="affiliate-cta-desc">
              Giới thiệu bạn bè & nhận hoa hồng lên đến 30%
            </span>
          </div>
          <ChevronRight size={20} className="affiliate-cta-arrow" />
        </div>
      )}

      {/* Pending review */}
      {status === 'pending' && (
        <div className="affiliate-status-card pending">
          <Clock size={24} className="affiliate-status-icon" />
          <div className="affiliate-status-content">
            <span className="affiliate-status-title">Đang chờ duyệt</span>
            <span className="affiliate-status-desc">
              Đơn đăng ký affiliate của bạn đang được xem xét. Chúng tôi sẽ thông báo khi có kết quả.
            </span>
          </div>
        </div>
      )}

      {/* Rejected */}
      {status === 'rejected' && (
        <div className="affiliate-status-card rejected">
          <XCircle size={24} className="affiliate-status-icon" />
          <div className="affiliate-status-content">
            <span className="affiliate-status-title">Đơn không được duyệt</span>
            <span className="affiliate-status-desc">
              Rất tiếc, đơn đăng ký chưa được chấp nhận. Bạn có thể đăng ký lại sau.
            </span>
          </div>
          <button
            className="affiliate-retry-btn"
            onClick={() => navigate('/partnership/register')}
          >
            Đăng ký lại
          </button>
        </div>
      )}

      {/* Active affiliate */}
      {status === 'active' && affiliateData && (
        <div className="affiliate-active-card">
          {/* Referral code + copy */}
          <div className="affiliate-code-row">
            <span className="affiliate-code-label">Mã giới thiệu:</span>
            <div className="affiliate-code-box">
              <code className="affiliate-code">{affiliateData.referral_code}</code>
              <button
                className="affiliate-copy-btn"
                onClick={handleCopyCode}
                title="Sao chép mã giới thiệu"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="affiliate-stats-row">
            <div className="affiliate-stat">
              <span className="affiliate-stat-value">{formatNumber(affiliateData.total_referrals)}</span>
              <span className="affiliate-stat-label">Giới thiệu</span>
            </div>
            <div className="affiliate-stat-divider" />
            <div className="affiliate-stat">
              <span className="affiliate-stat-value">{formatNumber(affiliateData.total_commission)}</span>
              <span className="affiliate-stat-label">Tổng HH</span>
            </div>
            <div className="affiliate-stat-divider" />
            <div className="affiliate-stat">
              <span className="affiliate-stat-value">{formatNumber(affiliateData.pending_commission)}</span>
              <span className="affiliate-stat-label">Chờ TT</span>
            </div>
          </div>

          {/* Dashboard link */}
          <button
            className="affiliate-dashboard-btn"
            onClick={() => navigate('/affiliate')}
          >
            <TrendingUp size={16} />
            <span>Xem Dashboard Affiliate</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default AffiliateSection;
