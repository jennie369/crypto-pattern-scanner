import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { formatDate, sendPartnershipNotification } from './adminUtils';
import {
  FileText,
  User,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  Mail,
  Phone,
  Calendar,
  Star,
  Shield,
  CreditCard,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  Gem,
} from 'lucide-react';

const SOCIAL_ICONS = {
  tiktok: { label: 'TikTok', color: '#FF0050' },
  youtube: { label: 'YouTube', color: '#FF0000' },
  facebook: { label: 'Facebook', color: '#1877F2' },
  instagram: { label: 'Instagram', color: '#E4405F' },
  twitter: { label: 'Twitter', color: '#1DA1F2' },
  discord: { label: 'Discord', color: '#5865F2' },
  telegram: { label: 'Telegram', color: '#0088CC' },
};

export default function ApplicationsPage() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadApplications();
    }
  }, [user, profile?.role, applicationFilter]);

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);

      let query = supabase
        .from('partnership_applications')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            phone,
            partnership_role,
            ctv_tier,
            affiliate_code,
            gems,
            scanner_tier,
            course_tier,
            chatbot_tier,
            avatar_url,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (applicationFilter !== 'all') {
        query = query.eq('status', applicationFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch kol_verification data for each application
      const appIds = (data || []).map(a => a.id);
      let verificationMap = {};
      if (appIds.length > 0) {
        const { data: verifications } = await supabase
          .from('kol_verification')
          .select('*')
          .in('application_id', appIds);
        if (verifications) {
          verifications.forEach(v => {
            verificationMap[v.application_id] = v;
          });
        }
      }

      const enriched = (data || []).map(app => ({
        ...app,
        verification: verificationMap[app.id] || null,
      }));

      setApplications(enriched);
      console.log('Loaded', enriched.length, 'applications with verification data');
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleApproveApplication = async (application) => {
    if (!confirm(`Duyệt đơn đăng ký ${application.application_type?.toUpperCase()} cho ${application.profiles?.email || application.email}?`)) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('approve_partnership_application', {
        application_id_param: application.id,
        admin_id_param: user.id,
        admin_notes_param: `Approved by ${profile?.email}`
      });

      if (error) throw error;

      await sendPartnershipNotification('partnership_approved', application.user_id, {
        partner_role: application.application_type,
        affiliate_code: data.affiliate_code
      });

      alert(`Đã duyệt đơn! Mã affiliate: ${data.affiliate_code}`);
      await loadApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const handleRejectApplication = async (application) => {
    const reason = prompt('Lý do từ chối đơn đăng ký:');
    if (!reason) return;

    try {
      const { error } = await supabase.rpc('reject_partnership_application', {
        application_id_param: application.id,
        admin_id_param: user.id,
        rejection_reason_param: reason
      });

      if (error) throw error;

      await sendPartnershipNotification('partnership_rejected', application.user_id, {
        reason: reason
      });

      alert('Đã từ chối đơn đăng ký!');
      await loadApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('vi-VN');
  };

  const isExpanded = (id) => expandedId === id;
  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const getKolType = (app) => {
    if (app.application_type === 'affiliate' && app.total_followers >= 20000) return 'KOL Affiliate';
    if (app.application_type === 'affiliate') return 'Affiliate';
    return 'CTV';
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Quản Lý Đơn Đăng Ký Affiliate/CTV</h2>
        <div className="filter-buttons">
          {['all', 'pending', 'approved', 'rejected'].map(filter => (
            <button
              key={filter}
              className={`filter-btn ${applicationFilter === filter ? 'active' : ''}`}
              onClick={() => setApplicationFilter(filter)}
            >
              {filter === 'all' && 'Tất cả'}
              {filter === 'pending' && 'Chờ duyệt'}
              {filter === 'approved' && 'Đã duyệt'}
              {filter === 'rejected' && 'Từ chối'}
            </button>
          ))}
        </div>
      </div>

      {applicationsLoading && (
        <div className="admin-loading-state">
          <div className="spinner-large"></div>
          <p>Đang tải danh sách đơn...</p>
        </div>
      )}

      {!applicationsLoading && applications.length === 0 && (
        <div className="admin-empty-state">
          <div className="empty-icon"><FileText size={48} /></div>
          <h3>Không có đơn đăng ký nào</h3>
          <p>Chưa có đơn đăng ký Affiliate/CTV nào {applicationFilter !== 'all' ? `ở trạng thái "${applicationFilter}"` : ''}</p>
        </div>
      )}

      {!applicationsLoading && applications.length > 0 && (
        <div className="applications-list">
          {applications.map(app => {
            const v = app.verification;
            const p = app.profiles;
            const socialPlatforms = app.social_platforms || {};
            const expanded = isExpanded(app.id);

            return (
              <div key={app.id} className={`application-card ${app.status}`}>
                {/* Header row */}
                <div className="app-header" onClick={() => toggleExpand(app.id)} style={{ cursor: 'pointer' }}>
                  <div className="app-type">
                    <span className={`type-badge ${app.application_type}`}>
                      {app.total_followers >= 20000 && <Star size={14} />}
                      {' '}{getKolType(app)}
                    </span>
                    <span className={`status-badge ${app.status}`}>
                      {app.status === 'pending' && <><Clock size={12} /> Chờ duyệt</>}
                      {app.status === 'approved' && <><CheckCircle size={12} /> Đã duyệt</>}
                      {app.status === 'rejected' && <><XCircle size={12} /> Từ chối</>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="app-date">{formatDate(app.created_at)}</span>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Total followers highlight */}
                {app.total_followers > 0 && (
                  <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '8px', padding: '8px 12px', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="#00FF88" />
                    <span style={{ color: '#00FF88', fontWeight: 600 }}>
                      Tổng followers: {formatNumber(app.total_followers)} / 20,000 yêu cầu
                    </span>
                  </div>
                )}

                {/* User basic info - always visible */}
                <div className="app-user-info">
                  <div className="user-avatar" style={{ background: p?.avatar_url ? 'none' : undefined }}>
                    {p?.avatar_url ? (
                      <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      app.full_name?.charAt(0) || p?.full_name?.charAt(0) || '?'
                    )}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{app.full_name || p?.full_name || 'Chưa có tên'}</div>
                    <div className="user-email">{app.email || p?.email}</div>
                  </div>
                </div>

                {/* Expanded detail section */}
                {expanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '8px' }}>
                    {/* Personal Info */}
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Thông tin cá nhân</h4>
                      <div style={{ display: 'grid', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                          <User size={14} /> <span style={{ minWidth: '100px' }}>Họ tên:</span> <span style={{ color: '#fff' }}>{app.full_name || p?.full_name || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                          <Mail size={14} /> <span style={{ minWidth: '100px' }}>Email:</span> <span style={{ color: '#fff' }}>{app.email || p?.email || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                          <Phone size={14} /> <span style={{ minWidth: '100px' }}>Điện thoại:</span> <span style={{ color: '#fff' }}>{app.phone || p?.phone || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                          <Calendar size={14} /> <span style={{ minWidth: '100px' }}>Ngày đăng ký:</span> <span style={{ color: '#fff' }}>{formatDate(app.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Info */}
                    {p && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Thông tin tài khoản</h4>
                        <div style={{ display: 'grid', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                            <Calendar size={14} /> <span style={{ minWidth: '100px' }}>Tạo TK:</span> <span style={{ color: '#fff' }}>{formatDate(p.created_at)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                            <Gem size={14} /> <span style={{ minWidth: '100px' }}>Gems:</span> <span style={{ color: '#00FF88', fontWeight: 600 }}>{formatNumber(p.gems || 0)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                            <Shield size={14} /> <span style={{ minWidth: '100px' }}>Scanner:</span> <span style={{ color: '#fff' }}>{p.scanner_tier || 'FREE'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                            <Shield size={14} /> <span style={{ minWidth: '100px' }}>Course:</span> <span style={{ color: '#fff' }}>{p.course_tier || 'FREE'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                            <Shield size={14} /> <span style={{ minWidth: '100px' }}>Chatbot:</span> <span style={{ color: '#fff' }}>{p.chatbot_tier || 'FREE'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Identity Verification (from kol_verification) */}
                    {v && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Xác minh danh tính</h4>
                        <div style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                            <CreditCard size={14} /> <span style={{ minWidth: '100px' }}>Số {(v.id_type || 'CCCD').toUpperCase()}:</span> <span style={{ color: '#fff' }}>{v.id_number || '-'}</span>
                          </div>
                        </div>

                        {/* ID Images */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Ảnh CCCD mặt trước:</p>
                            {v.id_front_image_url ? (
                              <img src={v.id_front_image_url} alt="CCCD Front" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                            ) : (
                              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Chưa có ảnh</div>
                            )}
                          </div>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Ảnh CCCD mặt sau:</p>
                            {v.id_back_image_url ? (
                              <img src={v.id_back_image_url} alt="CCCD Back" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                            ) : (
                              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Chưa có ảnh</div>
                            )}
                          </div>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Ảnh chân dung:</p>
                            {v.portrait_image_url ? (
                              <img src={v.portrait_image_url} alt="Portrait" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                            ) : (
                              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Chưa có ảnh</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Media - from social_platforms JSONB or kol_verification */}
                    {(Object.keys(socialPlatforms).length > 0 || v) && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>
                          Mạng xã hội {app.total_followers > 0 && `(${formatNumber(app.total_followers)} followers)`}
                        </h4>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {/* From social_platforms JSONB */}
                          {Object.entries(socialPlatforms).map(([platform, followers]) => (
                            <div key={platform} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 12px' }}>
                              <span style={{ color: SOCIAL_ICONS[platform]?.color || '#fff', fontWeight: 500 }}>
                                {SOCIAL_ICONS[platform]?.label || platform}
                              </span>
                              <span style={{ color: '#fff' }}>{formatNumber(followers)} followers</span>
                            </div>
                          ))}

                          {/* From kol_verification individual fields */}
                          {v && !Object.keys(socialPlatforms).length && (
                            <>
                              {v.youtube_followers > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 12px' }}>
                                  <span style={{ color: '#FF0000', fontWeight: 500 }}>YouTube</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#fff' }}>{formatNumber(v.youtube_followers)}</span>
                                    {v.youtube_url && <a href={v.youtube_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} color="#4D9DE0" /></a>}
                                  </div>
                                </div>
                              )}
                              {v.facebook_followers > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 12px' }}>
                                  <span style={{ color: '#1877F2', fontWeight: 500 }}>Facebook</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#fff' }}>{formatNumber(v.facebook_followers)}</span>
                                    {v.facebook_url && <a href={v.facebook_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} color="#4D9DE0" /></a>}
                                  </div>
                                </div>
                              )}
                              {v.tiktok_followers > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 12px' }}>
                                  <span style={{ color: '#FF0050', fontWeight: 500 }}>TikTok</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#fff' }}>{formatNumber(v.tiktok_followers)}</span>
                                    {v.tiktok_url && <a href={v.tiktok_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} color="#4D9DE0" /></a>}
                                  </div>
                                </div>
                              )}
                              {v.instagram_followers > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 12px' }}>
                                  <span style={{ color: '#E4405F', fontWeight: 500 }}>Instagram</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#fff' }}>{formatNumber(v.instagram_followers)}</span>
                                    {v.instagram_url && <a href={v.instagram_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} color="#4D9DE0" /></a>}
                                  </div>
                                </div>
                              )}
                              {v.twitter_followers > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 12px' }}>
                                  <span style={{ color: '#1DA1F2', fontWeight: 500 }}>Twitter</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#fff' }}>{formatNumber(v.twitter_followers)}</span>
                                    {v.twitter_url && <a href={v.twitter_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} color="#4D9DE0" /></a>}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social proof URLs */}
                    {app.social_proof_urls?.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>
                          Link social ({app.social_proof_urls.length}):
                        </h4>
                        <div style={{ display: 'grid', gap: '4px' }}>
                          {app.social_proof_urls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#4D9DE0', fontSize: '13px', textDecoration: 'underline', wordBreak: 'break-all' }}>
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTV-specific fields */}
                    {app.application_type === 'ctv' && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Thông tin CTV</h4>
                        <div className="app-extra-info">
                          {app.courses_owned && (
                            <div className="info-item">
                              <span className="label">Khóa học đã mua:</span>
                              <span className="value">{Array.isArray(app.courses_owned) ? app.courses_owned.join(', ') : app.courses_owned}</span>
                            </div>
                          )}
                          {app.marketing_channels && (
                            <div className="info-item">
                              <span className="label">Kênh marketing:</span>
                              <span className="value">{app.marketing_channels}</span>
                            </div>
                          )}
                          {app.estimated_monthly_sales && (
                            <div className="info-item">
                              <span className="label">Doanh số dự kiến/tháng:</span>
                              <span className="value">{app.estimated_monthly_sales}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reason for joining */}
                    {app.reason_for_joining && (
                      <div className="app-reason" style={{ marginBottom: '16px' }}>
                        <span className="label">Lý do đăng ký:</span>
                        <p>{app.reason_for_joining}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Rejection reason */}
                {app.rejection_reason && (
                  <div className="app-rejection">
                    <AlertCircle size={14} />
                    <span>Lý do từ chối: {app.rejection_reason}</span>
                  </div>
                )}

                {/* Action buttons */}
                {app.status === 'pending' && (
                  <div className="app-actions">
                    <button
                      className="action-btn approve"
                      onClick={() => handleApproveApplication(app)}
                    >
                      <CheckCircle size={14} /> Duyệt
                    </button>
                    <button
                      className="action-btn reject"
                      onClick={() => handleRejectApplication(app)}
                    >
                      <Ban size={14} /> Từ chối
                    </button>
                  </div>
                )}

                {app.status === 'approved' && app.profiles?.partnership_role && (
                  <div className="app-result">
                    <CheckCircle size={14} />
                    <span>Đã trở thành {app.profiles.partnership_role?.toUpperCase()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
