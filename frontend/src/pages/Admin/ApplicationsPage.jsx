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
} from 'lucide-react';

export default function ApplicationsPage() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState('pending');

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
            partnership_role,
            ctv_tier,
            affiliate_code
          )
        `)
        .order('created_at', { ascending: false });

      if (applicationFilter !== 'all') {
        query = query.eq('status', applicationFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
      console.log('Loaded', data?.length, 'applications');
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleApproveApplication = async (application) => {
    if (!confirm(`Duyệt đơn đăng ký ${application.application_type?.toUpperCase()} cho ${application.profiles?.email}?`)) {
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
          {applications.map(app => (
            <div key={app.id} className={`application-card ${app.status}`}>
              <div className="app-header">
                <div className="app-type">
                  <span className={`type-badge ${app.application_type}`}>
                    {app.application_type === 'affiliate' ? (
                      <><User size={14} /> Affiliate</>
                    ) : (
                      <><Award size={14} /> CTV</>
                    )}
                  </span>
                  <span className={`status-badge ${app.status}`}>
                    {app.status === 'pending' && <><Clock size={12} /> Chờ duyệt</>}
                    {app.status === 'approved' && <><CheckCircle size={12} /> Đã duyệt</>}
                    {app.status === 'rejected' && <><XCircle size={12} /> Từ chối</>}
                  </span>
                </div>
                <div className="app-date">{formatDate(app.created_at)}</div>
              </div>

              <div className="app-user-info">
                <div className="user-avatar">
                  {app.profiles?.full_name?.charAt(0) || app.profiles?.email?.charAt(0) || '?'}
                </div>
                <div className="user-details">
                  <div className="user-name">{app.profiles?.full_name || 'Chưa có tên'}</div>
                  <div className="user-email">{app.profiles?.email}</div>
                </div>
              </div>

              {app.application_type === 'ctv' && (
                <div className="app-extra-info">
                  <div className="info-item">
                    <span className="label">Khóa học đã mua:</span>
                    <span className="value">{app.courses_owned || 'Chưa rõ'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Kênh marketing:</span>
                    <span className="value">{app.marketing_channels || 'Chưa rõ'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Doanh số dự kiến/tháng:</span>
                    <span className="value">{app.estimated_monthly_sales || 'Chưa rõ'}</span>
                  </div>
                </div>
              )}

              {app.reason && (
                <div className="app-reason">
                  <span className="label">Lý do đăng ký:</span>
                  <p>{app.reason}</p>
                </div>
              )}

              {app.rejection_reason && (
                <div className="app-rejection">
                  <AlertCircle size={14} />
                  <span>Lý do từ chối: {app.rejection_reason}</span>
                </div>
              )}

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
          ))}
        </div>
      )}
    </div>
  );
}
