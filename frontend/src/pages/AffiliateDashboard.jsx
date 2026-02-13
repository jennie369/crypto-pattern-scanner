import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  CreditCard,
  Copy,
  ExternalLink,
  Check,
  Clock,
  Award,
  Target,
  RefreshCw,
  UserCheck,
  Star,
  GraduationCap,
  Link2,
  BarChart3,
  Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import affiliateService from '../services/affiliate';
import { affiliateLinks } from '../utils/linkUtils';
import './AffiliateDashboard.css';

const AffiliateDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // State
  const [stats, setStats] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  // Load data
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Ensure profile exists
      await affiliateService.getOrCreateAffiliateProfile(user.id);

      // Load all data
      const [statsData, codeData, referralsData, commissionsData, bonusesData, withdrawalsData] = await Promise.all([
        affiliateService.getDashboardStats(user.id),
        affiliateService.getReferralCode(user.id),
        affiliateService.getReferrals(user.id),
        affiliateService.getCommissions(user.id),
        affiliateService.getKPIBonuses(user.id),
        affiliateService.getWithdrawals(user.id),
      ]);

      setStats(statsData);
      setReferralCode(codeData);
      setReferrals(referralsData);
      setCommissions(commissionsData);
      setBonuses(bonusesData);
      setWithdrawals(withdrawalsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (referralCode) {
      const link = affiliateLinks.referral(referralCode.code);
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Tổng Quan', icon: TrendingUp },
    { id: 'referrals', label: 'Giới Thiệu', icon: Users },
    { id: 'commissions', label: 'Hoa Hồng', icon: DollarSign },
    { id: 'bonuses', label: 'KPI Thưởng', icon: Gift },
    { id: 'withdrawals', label: 'Rút Tiền', icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="page-container affiliate-dashboard">
        <div className="loading-container">
          <RefreshCw className="spin" size={48} />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-container affiliate-dashboard">
        <div className="error-container">
          <p>Không thể tải dữ liệu. Vui lòng thử lại.</p>
          <button onClick={loadDashboardData} className="btn-retry">
            Thử Lại
          </button>
        </div>
      </div>
    );
  }

  const { profile, referrals: refStats, commissions: commStats, monthly, tierUpgrade } = stats;

  return (
    <div className="page-container affiliate-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Đối Tác GEM</h1>
          <p className="subtitle">Quản lý hệ thống đối tác & hoa hồng của bạn</p>
        </div>
        <div className={`role-badge role-${profile.role} tier-${profile.ctv_tier}`}>
          {profile.role === 'affiliate' && <><UserCheck size={18} style={{ marginRight: '8px' }} /> AFFILIATE</>}
          {profile.role === 'ctv' && <><Star size={18} style={{ marginRight: '8px' }} /> CTV {profile.ctv_tier.toUpperCase()}</>}
          {profile.role === 'instructor' && <><GraduationCap size={18} style={{ marginRight: '8px' }} /> GIẢNG VIÊN</>}
        </div>
      </div>

      {/* Tabs */}
      <div className="affiliate-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Tổng Hoa Hồng</p>
                  <p className="stat-value">{commStats.total.toLocaleString('vi-VN')}₫</p>
                  <p className="stat-sub">
                    Chờ: {commStats.pending.toLocaleString('vi-VN')}₫ |
                    Đã duyệt: {commStats.approved.toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Người Giới Thiệu</p>
                  <p className="stat-value">{refStats.total}</p>
                  <p className="stat-sub">
                    Đã mua: {refStats.converted} ({refStats.conversionRate}%)
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Tháng Này</p>
                  <p className="stat-value">{monthly.sales} đơn</p>
                  <p className="stat-sub">
                    Doanh số: {monthly.revenue.toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Tổng Doanh Số</p>
                  <p className="stat-value">{(profile.total_sales / 1000000).toFixed(1)}M</p>
                  <p className="stat-sub">
                    Tích lũy từ trước đến nay
                  </p>
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="referral-link-card">
              <h3><Link2 size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Link Giới Thiệu Của Bạn</h3>
              <p className="help-text">Chia sẻ link này để nhận hoa hồng khi có người đăng ký & mua hàng</p>
              <div className="link-box">
                <input
                  type="text"
                  value={referralCode ? affiliateLinks.referral(referralCode.code) : ''}
                  readOnly
                />
                <button onClick={copyReferralLink} className="btn-copy">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Đã copy!' : 'Copy'}
                </button>
              </div>
              <div className="referral-stats">
                <span>Mã giới thiệu: <strong>{referralCode?.code}</strong></span>
                <span>Lượt click: <strong>{referralCode?.clicks || 0}</strong></span>
              </div>
            </div>

            {/* CTV Tier Progress (only for CTV role) */}
            {profile.role === 'ctv' && tierUpgrade.nextTier && (
              <div className="tier-progress-card">
                <div className="tier-header">
                  <h3><BarChart3 size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Tiến Độ Thăng Hạng</h3>
                  <p className="current-tier">Hạng hiện tại: <strong>{profile.ctv_tier.toUpperCase()}</strong></p>
                </div>
                <div className="tier-info">
                  <p>Hạng tiếp theo: <strong>{tierUpgrade.nextTier.toUpperCase()}</strong></p>
                  <p className="tier-target">
                    Cần thêm: <strong>{tierUpgrade.remaining.toLocaleString('vi-VN')}₫</strong>
                  </p>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(profile.total_sales / tierUpgrade.threshold) * 100}%`,
                    }}
                  />
                </div>
                <div className="progress-labels">
                  <span>{(profile.total_sales / 1000000).toFixed(1)}M</span>
                  <span>{(tierUpgrade.threshold / 1000000).toFixed(0)}M</span>
                </div>
              </div>
            )}

            {/* Commission Rate Info */}
            <div className="commission-info-card">
              <h3><Wallet size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Tỷ Lệ Hoa Hồng Của Bạn</h3>
              <div className="commission-rate">
                {profile.role === 'affiliate' && (
                  <div className="rate-display">
                    <span className="rate-value">3%</span>
                    <span className="rate-label">Tỷ lệ cố định cho AFFILIATE</span>
                  </div>
                )}
                {profile.role === 'ctv' && (
                  <div className="rate-display">
                    <span className="rate-value">
                      {affiliateService.getCommissionRate(profile.role, profile.ctv_tier) * 100}%
                    </span>
                    <span className="rate-label">CTV {profile.ctv_tier.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="rate-tiers">
                <p className="info-label">Bảng tỷ lệ CTV:</p>
                <ul>
                  <li className={profile.ctv_tier === 'beginner' ? 'active' : ''}>
                    Beginner: <strong>10%</strong> (0 - 100M)
                  </li>
                  <li className={profile.ctv_tier === 'growing' ? 'active' : ''}>
                    Growing: <strong>15%</strong> (100M - 300M)
                  </li>
                  <li className={profile.ctv_tier === 'master' ? 'active' : ''}>
                    Master: <strong>20%</strong> (300M - 600M)
                  </li>
                  <li className={profile.ctv_tier === 'grand' ? 'active' : ''}>
                    Grand: <strong>30%</strong> (600M+)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* REFERRALS TAB */}
        {activeTab === 'referrals' && (
          <div className="referrals-tab">
            <div className="tab-header">
              <h2><Users size={24} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Người Giới Thiệu ({referrals.length})</h2>
              <p>Danh sách người dùng bạn đã giới thiệu</p>
            </div>

            {referrals.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <p>Chưa có người giới thiệu nào</p>
                <p className="help-text">Chia sẻ link của bạn để bắt đầu kiếm hoa hồng!</p>
              </div>
            ) : (
              <div className="referrals-list">
                {referrals.map((ref) => (
                  <div key={ref.id} className="referral-item">
                    <div className="referral-avatar">
                      <Users size={24} />
                    </div>
                    <div className="referral-info">
                      <p className="referral-name">{ref.referred_user?.full_name || 'Người dùng'}</p>
                      <p className="referral-email">{ref.referred_user?.email}</p>
                      <p className="referral-date">
                        Tham gia: {new Date(ref.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className={`referral-status status-${ref.status}`}>
                      {ref.status === 'converted' && (
                        <>
                          <Check size={16} />
                          <span>Đã mua</span>
                        </>
                      )}
                      {ref.status === 'pending' && (
                        <>
                          <Clock size={16} />
                          <span>Chờ mua</span>
                        </>
                      )}
                      {ref.status === 'inactive' && (
                        <span>Không hoạt động</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMMISSIONS TAB */}
        {activeTab === 'commissions' && (
          <div className="commissions-tab">
            <div className="tab-header">
              <h2><DollarSign size={24} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Hoa Hồng ({commissions.length})</h2>
              <p>Lịch sử hoa hồng từ các đơn hàng</p>
            </div>

            <div className="commission-summary">
              <div className="summary-item">
                <span className="summary-label">Chờ duyệt:</span>
                <span className="summary-value pending">{commStats.pending.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Đã duyệt:</span>
                <span className="summary-value approved">{commStats.approved.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Đã thanh toán:</span>
                <span className="summary-value paid">{commStats.paid.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {commissions.length === 0 ? (
              <div className="empty-state">
                <DollarSign size={48} />
                <p>Chưa có hoa hồng nào</p>
                <p className="help-text">Hoa hồng sẽ xuất hiện khi có người mua qua link của bạn</p>
              </div>
            ) : (
              <div className="commissions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Sản phẩm</th>
                      <th>Doanh số</th>
                      <th>Tỷ lệ</th>
                      <th>Hoa hồng</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((comm) => (
                      <tr key={comm.id}>
                        <td>{new Date(comm.created_at).toLocaleDateString('vi-VN')}</td>
                        <td>{comm.sale?.product_name || 'N/A'}</td>
                        <td>{parseFloat(comm.sale?.sale_amount || 0).toLocaleString('vi-VN')}₫</td>
                        <td>{(parseFloat(comm.commission_rate) * 100).toFixed(0)}%</td>
                        <td className="commission-amount">
                          {parseFloat(comm.commission_amount).toLocaleString('vi-VN')}₫
                        </td>
                        <td>
                          <span className={`status-badge status-${comm.status}`}>
                            {comm.status === 'pending' && 'Chờ duyệt'}
                            {comm.status === 'approved' && 'Đã duyệt'}
                            {comm.status === 'paid' && 'Đã trả'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BONUSES TAB */}
        {activeTab === 'bonuses' && (
          <div className="bonuses-tab">
            <div className="tab-header">
              <h2><Gift size={24} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Thưởng KPI ({bonuses.length})</h2>
              <p>Tiền thưởng khi đạt chỉ tiêu hàng tháng</p>
            </div>

            {profile.role === 'ctv' && (
              <div className="kpi-info-card">
                <h3><BarChart3 size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Chỉ Tiêu KPI Tháng Này</h3>
                <p className="help-text">
                  Đạt chỉ tiêu bán hàng theo từng sản phẩm để nhận thưởng KPI
                </p>
                <div className="kpi-examples">
                  <div className="kpi-example">
                    <p className="product-name">Tình Yêu (399K)</p>
                    <p className="kpi-target">
                      <Target size={16} />
                      {affiliateService.getKPITarget('course-love', profile.ctv_tier)} học viên
                    </p>
                    <p className="kpi-bonus">
                      Thưởng: <strong>{affiliateService.getBonusAmount('course-love', profile.ctv_tier)?.toLocaleString('vi-VN')}₫</strong>
                    </p>
                  </div>
                  <div className="kpi-example">
                    <p className="product-name">Trading T1 (11M)</p>
                    <p className="kpi-target">
                      <Target size={16} />
                      {affiliateService.getKPITarget('course-trading-t1', profile.ctv_tier)} học viên
                    </p>
                    <p className="kpi-bonus">
                      Thưởng: <strong>{affiliateService.getBonusAmount('course-trading-t1', profile.ctv_tier)?.toLocaleString('vi-VN')}₫</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {bonuses.length === 0 ? (
              <div className="empty-state">
                <Gift size={48} />
                <p>Chưa có thưởng KPI nào</p>
                <p className="help-text">Đạt chỉ tiêu bán hàng hàng tháng để nhận thưởng!</p>
              </div>
            ) : (
              <div className="bonuses-list">
                {bonuses.map((bonus) => (
                  <div key={bonus.id} className="bonus-item">
                    <div className="bonus-header">
                      <h4>{bonus.product_type}</h4>
                      <span className={`status-badge status-${bonus.status}`}>
                        {bonus.status === 'pending' && 'Chờ duyệt'}
                        {bonus.status === 'approved' && 'Đã duyệt'}
                        {bonus.status === 'paid' && 'Đã trả'}
                      </span>
                    </div>
                    <div className="bonus-details">
                      <p>
                        Tháng: <strong>{new Date(bonus.month).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</strong>
                      </p>
                      <p>
                        Đã bán: <strong>{bonus.students_count}</strong> / {bonus.target_count} học viên
                      </p>
                      <p className="bonus-amount">
                        Thưởng: <strong>{parseFloat(bonus.bonus_amount).toLocaleString('vi-VN')}₫</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {activeTab === 'withdrawals' && (
          <div className="withdrawals-tab">
            <div className="tab-header">
              <h2><CreditCard size={24} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} /> Rút Tiền ({withdrawals.length})</h2>
              <p>Yêu cầu rút tiền & lịch sử giao dịch</p>
            </div>

            <div className="withdrawal-balance">
              <div className="balance-card">
                <p className="balance-label">Số dư có thể rút</p>
                <p className="balance-value">{commStats.approved.toLocaleString('vi-VN')}₫</p>
                <button className="btn-withdraw" disabled={commStats.approved === 0}>
                  <CreditCard size={18} />
                  Yêu cầu rút tiền
                </button>
              </div>
            </div>

            {withdrawals.length === 0 ? (
              <div className="empty-state">
                <CreditCard size={48} />
                <p>Chưa có yêu cầu rút tiền nào</p>
                <p className="help-text">Khi có hoa hồng được duyệt, bạn có thể yêu cầu rút tiền</p>
              </div>
            ) : (
              <div className="withdrawals-list">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="withdrawal-item">
                    <div className="withdrawal-info">
                      <p className="withdrawal-amount">{parseFloat(withdrawal.amount).toLocaleString('vi-VN')}₫</p>
                      <p className="withdrawal-method">
                        Phương thức: <strong>{withdrawal.method}</strong>
                      </p>
                      <p className="withdrawal-date">
                        Yêu cầu: {new Date(withdrawal.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className={`withdrawal-status status-${withdrawal.status}`}>
                      {withdrawal.status === 'pending' && (
                        <>
                          <Clock size={18} />
                          <span>Đang xử lý</span>
                        </>
                      )}
                      {withdrawal.status === 'processing' && (
                        <>
                          <RefreshCw size={18} />
                          <span>Đang chuyển</span>
                        </>
                      )}
                      {withdrawal.status === 'completed' && (
                        <>
                          <Check size={18} />
                          <span>Hoàn tất</span>
                        </>
                      )}
                      {withdrawal.status === 'rejected' && (
                        <span>Từ chối</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateDashboard;
