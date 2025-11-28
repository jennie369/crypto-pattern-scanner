import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  Search,
  UserPlus,
  Users,
  BarChart3,
  Settings,
  Lock,
  Shield,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
  Infinity,
  Crown,
  User,
  Gem,
  CircleDollarSign,
  TrendingUp,
  Activity,
  FileText,
  Wallet,
  CheckCircle,
  AlertCircle,
  Eye,
  UserCheck,
  Ban,
  DollarSign,
  Building,
  CreditCard,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import './Admin.css';

/**
 * Admin Page - REAL DATABASE INTEGRATION
 * User management and system analytics
 * PROTECTED: Requires admin role
 */
function Admin() {
  const { t } = useTranslation();
  const { user, profile, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // users, applications, withdrawals, analytics, system
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Real data from Supabase
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    adminUsers: 0,
    totalScans: 0,
    // Partnership stats
    totalAffiliates: 0,
    totalCtvs: 0,
    pendingApplications: 0,
    pendingWithdrawals: 0,
    totalCommissions: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null); // Add error state
  const [searchQuery, setSearchQuery] = useState('');

  // Partnership data
  const [applications, setApplications] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState('pending'); // all, pending, approved, rejected
  const [withdrawalFilter, setWithdrawalFilter] = useState('pending'); // all, pending, approved, processing, completed, rejected
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  // Load users and analytics on mount
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadUsers();
      loadAnalytics();
      loadApplications();
      loadWithdrawals();
    }
  }, [user, profile?.role]);

  // Reload applications when filter changes
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadApplications();
    }
  }, [applicationFilter]);

  // Reload withdrawals when filter changes
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadWithdrawals();
    }
  }, [withdrawalFilter]);

  const loadUsers = async () => {
    try {
      setDataLoading(true);
      setDataError(null); // Clear any previous errors

      console.log('Loading users from Supabase...');

      // ✅ Add timeout protection (10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout - Supabase took too long to respond')), 10000)
      );

      const queryPromise = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setUsers(data || []);
      console.log('Loaded', data?.length, 'users from database');
    } catch (error) {
      console.error('Error loading users:', error);
      setDataError(error.message || 'Failed to load users from database');
    } finally {
      setDataLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // ✅ Add timeout protection (10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Analytics request timeout')), 10000)
      );

      // Count users by scanner_tier
      const usersQuery = supabase
        .from('users')
        .select('scanner_tier, role');

      const { data: usersData, error: usersError } = await Promise.race([usersQuery, timeoutPromise]);

      if (usersError) throw usersError;

      const tierCounts = usersData.reduce((acc, user) => {
        if (user.role === 'admin') {
          acc.adminUsers++;
        } else if (!user.scanner_tier || user.scanner_tier === 'FREE') {
          acc.freeUsers++;
        } else {
          acc.premiumUsers++;
        }
        acc.totalUsers++;
        return acc;
      }, { totalUsers: 0, freeUsers: 0, premiumUsers: 0, adminUsers: 0 });

      // Count total scans from scan_history
      const scansQuery = supabase
        .from('scan_history')
        .select('id', { count: 'exact', head: true });

      const { data: scansData, error: scansError } = await Promise.race([scansQuery, timeoutPromise]);

      setAnalytics({
        ...tierCounts,
        totalScans: scansData || 0,
      });

      // Partnership stats
      const { data: partnerStats, error: partnerError } = await supabase
        .from('users')
        .select('partner_role, partner_tier')
        .not('partner_role', 'is', null);

      let affiliateCount = 0;
      let ctvCount = 0;
      if (partnerStats) {
        partnerStats.forEach(p => {
          if (p.partner_role === 'affiliate') affiliateCount++;
          if (p.partner_role === 'ctv') ctvCount++;
        });
      }

      // Pending applications count
      const { count: pendingApps } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Pending withdrawals count
      const { count: pendingWithdrs } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'approved', 'processing']);

      // Total commissions
      const { data: commissionsData } = await supabase
        .from('affiliate_commissions')
        .select('commission_amount');

      const totalCommissions = commissionsData?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

      setAnalytics({
        ...tierCounts,
        totalScans: scansData || 0,
        totalAffiliates: affiliateCount,
        totalCtvs: ctvCount,
        pendingApplications: pendingApps || 0,
        pendingWithdrawals: pendingWithdrs || 0,
        totalCommissions,
      });

      console.log('Analytics loaded:', tierCounts);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Don't block the page if analytics fail - just log the error
    }
  };

  // Load partnership applications
  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);

      let query = supabase
        .from('partnership_applications')
        .select(`
          *,
          users:user_id (
            id,
            email,
            full_name,
            partner_role,
            partner_tier
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

  // Load withdrawal requests
  const loadWithdrawals = async () => {
    try {
      setWithdrawalsLoading(true);

      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          users:user_id (
            id,
            email,
            full_name,
            partner_role,
            partner_tier,
            affiliate_code
          )
        `)
        .order('created_at', { ascending: false });

      if (withdrawalFilter !== 'all') {
        query = query.eq('status', withdrawalFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWithdrawals(data || []);
      console.log('Loaded', data?.length, 'withdrawals');
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  // Send partnership notification via Edge Function
  const sendPartnershipNotification = async (eventType, userId, data) => {
    try {
      const { error } = await supabase.functions.invoke('partnership-notifications', {
        body: {
          event_type: eventType,
          user_id: userId,
          data: data
        }
      });
      if (error) {
        console.error('Failed to send notification:', error);
      }
    } catch (err) {
      console.error('Notification error:', err);
    }
  };

  // Approve partnership application
  const handleApproveApplication = async (application) => {
    if (!confirm(`Duyệt đơn đăng ký ${application.application_type?.toUpperCase()} cho ${application.users?.email}?`)) {
      return;
    }

    try {
      // Call the approve function
      const { data, error } = await supabase.rpc('approve_partnership_application', {
        application_id_param: application.id,
        admin_id_param: user.id,
        admin_notes_param: `Approved by ${profile?.email}`
      });

      if (error) throw error;

      // Send push notification
      await sendPartnershipNotification('partnership_approved', application.user_id, {
        partner_role: application.application_type,
        affiliate_code: data.affiliate_code
      });

      alert(`✅ Đã duyệt đơn! Mã affiliate: ${data.affiliate_code}`);
      await loadApplications();
      await loadAnalytics();
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  // Reject partnership application
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

      // Send push notification
      await sendPartnershipNotification('partnership_rejected', application.user_id, {
        reason: reason
      });

      alert('✅ Đã từ chối đơn đăng ký!');
      await loadApplications();
      await loadAnalytics();
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  // Approve withdrawal request
  const handleApproveWithdrawal = async (withdrawal) => {
    if (!confirm(`Duyệt yêu cầu rút ${formatCurrency(withdrawal.amount)} cho ${withdrawal.users?.email}?`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('approve_withdrawal_request', {
        request_id_param: withdrawal.id,
        admin_id_param: user.id,
        admin_notes_param: `Approved by ${profile?.email}`
      });

      if (error) throw error;

      // Send push notification
      await sendPartnershipNotification('withdrawal_approved', withdrawal.user_id, {
        amount: withdrawal.amount
      });

      alert('✅ Đã duyệt yêu cầu rút tiền!');
      await loadWithdrawals();
      await loadAnalytics();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  // Process withdrawal (mark as processing)
  const handleProcessWithdrawal = async (withdrawal) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'processing',
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);

      if (error) throw error;

      alert('✅ Đang xử lý chuyển khoản!');
      await loadWithdrawals();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  // Complete withdrawal
  const handleCompleteWithdrawal = async (withdrawal) => {
    const txId = prompt('Nhập mã giao dịch ngân hàng (Transaction ID):');
    if (!txId) return;

    try {
      const { error } = await supabase.rpc('complete_withdrawal_request', {
        request_id_param: withdrawal.id,
        admin_id_param: user.id,
        transaction_id_param: txId
      });

      if (error) throw error;

      // Send push notification
      await sendPartnershipNotification('withdrawal_completed', withdrawal.user_id, {
        amount: withdrawal.amount,
        transaction_id: txId
      });

      alert('✅ Đã hoàn tất chuyển khoản!');
      await loadWithdrawals();
      await loadAnalytics();
    } catch (error) {
      console.error('Error completing withdrawal:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  // Reject withdrawal
  const handleRejectWithdrawal = async (withdrawal) => {
    const reason = prompt('Lý do từ chối yêu cầu rút tiền:');
    if (!reason) return;

    try {
      const { error } = await supabase.rpc('reject_withdrawal_request', {
        request_id_param: withdrawal.id,
        admin_id_param: user.id,
        rejection_reason_param: reason
      });

      if (error) throw error;

      // Send push notification
      await sendPartnershipNotification('withdrawal_rejected', withdrawal.user_id, {
        amount: withdrawal.amount,
        reason: reason
      });

      alert('✅ Đã từ chối yêu cầu rút tiền!');
      await loadWithdrawals();
      await loadAnalytics();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handler functions
  const handleAddUser = () => {
    console.log('Opening modal to add new user');
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    console.log('Editing user:', user.email);
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Bạn có chắc muốn xóa user "${userEmail}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
      return;
    }

    try {
      // Delete user (CASCADE will handle related records)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      console.log('User deleted:', userEmail);
      alert(`Đã xóa user: ${userEmail}`);

      // Reload users list
      await loadUsers();
      await loadAnalytics();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (userData) => {
    console.log('Saving user:', userData);

    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            full_name: userData.full_name,
            scanner_tier: userData.scanner_tier,
            role: userData.role,
            scanner_tier_expires_at: userData.scanner_tier_expires_at || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        console.log('User updated successfully');
        alert(`Đã cập nhật user: ${userData.email}`);
      } else {
        alert('Chức năng tạo user mới chưa được implement.\n\nVui lòng tạo user qua trang Settings.');
        return;
      }

      // Reload users list
      await loadUsers();
      await loadAnalytics();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user: ' + error.message);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <div className="auth-icon"><Clock size={48} /></div>
          <h2>{t('loading') || 'Loading...'}</h2>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!user) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <div className="auth-icon"><Lock size={48} /></div>
          <h2>Yêu Cầu Đăng Nhập</h2>
          <p>Bạn cần đăng nhập để truy cập Bảng Quản Trị.</p>
          <p>Vui lòng vào <strong><Settings size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Cài Đặt</strong> để đăng nhập hoặc tạo tài khoản.</p>
        </div>
      </div>
    );
  }

  // Check admin role
  if (!isAdmin()) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <div className="auth-icon"><XCircle size={48} /></div>
          <h2>Không Có Quyền Truy Cập</h2>
          <p>Bạn cần quyền ADMIN để truy cập trang này.</p>
          <p>Hiện tại bạn là: <strong>{profile?.role || 'user'}</strong></p>
        </div>
      </div>
    );
  }

  // Filter users based on search query
  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.scanner_tier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1><Shield size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />{t('adminDashboard')}</h1>
        <p className="subtitle">Welcome, Admin {profile?.email}!</p>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Users ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <FileText size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Đơn Đăng Ký
          {analytics.pendingApplications > 0 && (
            <span className="tab-badge">{analytics.pendingApplications}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdrawals')}
        >
          <Wallet size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Yêu Cầu Rút Tiền
          {analytics.pendingWithdrawals > 0 && (
            <span className="tab-badge">{analytics.pendingWithdrawals}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <Settings size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />System
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>User Management</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 189, 89, 0.5)' }} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '10px 16px 10px 36px',
                    background: 'rgba(17, 34, 80, 0.6)',
                    border: '1px solid rgba(255, 189, 89, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    width: '100%',
                  }}
                />
              </div>
              <button className="add-user-btn" onClick={handleAddUser}>
                <UserPlus size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Add User
              </button>
            </div>
          </div>

          {/* LOADING STATE */}
          {dataLoading && (
            <div className="admin-loading-state">
              <div className="spinner-large"></div>
              <p>Loading users from database...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!dataLoading && dataError && (
            <div className="admin-error-state">
              <div className="error-icon"><XCircle size={48} /></div>
              <h3>Failed to Load Users</h3>
              <p className="error-message">{dataError}</p>
              <button className="btn-retry" onClick={loadUsers}>
                <RefreshCw size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Try Again
              </button>
            </div>
          )}

          {/* DATA STATE */}
          {!dataLoading && !dataError && (
            <>
              {users.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="empty-icon"><Users size={48} /></div>
                  <h3>No Users Yet</h3>
                  <p>No users found in the database.</p>
                  <p className="empty-hint">Users will appear here once they create accounts.</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="empty-icon"><Search size={48} /></div>
                  <h3>No Results Found</h3>
                  <p>No users match your search: "{searchQuery}"</p>
                  <button className="btn-clear-search" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Tier</th>
                        <th>Role</th>
                        <th>Expires</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td className="email-cell">{user.email}</td>
                          <td className="name-cell">{user.full_name || '-'}</td>
                          <td>
                            <span className={`tier-badge ${user.scanner_tier?.toLowerCase() || 'free'}`}>
                              {user.scanner_tier?.toUpperCase() || 'FREE'}
                            </span>
                          </td>
                          <td>
                            <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                              {user.role === 'admin' ? <><Crown size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />ADMIN</> : <><User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />USER</>}
                            </span>
                          </td>
                          <td className="date-cell">
                            {user.scanner_tier_expires_at
                              ? new Date(user.scanner_tier_expires_at).toLocaleDateString('vi-VN')
                              : <><Infinity size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Never</>}
                          </td>
                          <td className="date-cell">
                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-btn edit"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={user.id === profile?.id}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
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
                      {app.users?.full_name?.charAt(0) || app.users?.email?.charAt(0) || '?'}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{app.users?.full_name || 'Chưa có tên'}</div>
                      <div className="user-email">{app.users?.email}</div>
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

                  {app.status === 'approved' && app.users?.partner_role && (
                    <div className="app-result">
                      <CheckCircle size={14} />
                      <span>Đã trở thành {app.users.partner_role?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Quản Lý Yêu Cầu Rút Tiền</h2>
            <div className="filter-buttons">
              {['all', 'pending', 'approved', 'processing', 'completed', 'rejected'].map(filter => (
                <button
                  key={filter}
                  className={`filter-btn ${withdrawalFilter === filter ? 'active' : ''}`}
                  onClick={() => setWithdrawalFilter(filter)}
                >
                  {filter === 'all' && 'Tất cả'}
                  {filter === 'pending' && 'Chờ duyệt'}
                  {filter === 'approved' && 'Đã duyệt'}
                  {filter === 'processing' && 'Đang xử lý'}
                  {filter === 'completed' && 'Hoàn tất'}
                  {filter === 'rejected' && 'Từ chối'}
                </button>
              ))}
            </div>
          </div>

          {withdrawalsLoading && (
            <div className="admin-loading-state">
              <div className="spinner-large"></div>
              <p>Đang tải danh sách yêu cầu...</p>
            </div>
          )}

          {!withdrawalsLoading && withdrawals.length === 0 && (
            <div className="admin-empty-state">
              <div className="empty-icon"><Wallet size={48} /></div>
              <h3>Không có yêu cầu rút tiền nào</h3>
              <p>Chưa có yêu cầu rút tiền nào {withdrawalFilter !== 'all' ? `ở trạng thái "${withdrawalFilter}"` : ''}</p>
            </div>
          )}

          {!withdrawalsLoading && withdrawals.length > 0 && (
            <div className="withdrawals-list">
              {withdrawals.map(wd => (
                <div key={wd.id} className={`withdrawal-card ${wd.status}`}>
                  <div className="wd-header">
                    <div className="wd-amount">
                      <DollarSign size={20} />
                      <span className="amount">{formatCurrency(wd.amount)}</span>
                    </div>
                    <span className={`status-badge ${wd.status}`}>
                      {wd.status === 'pending' && <><Clock size={12} /> Chờ duyệt</>}
                      {wd.status === 'approved' && <><CheckCircle size={12} /> Đã duyệt</>}
                      {wd.status === 'processing' && <><RefreshCw size={12} /> Đang xử lý</>}
                      {wd.status === 'completed' && <><CheckCircle size={12} /> Hoàn tất</>}
                      {wd.status === 'rejected' && <><XCircle size={12} /> Từ chối</>}
                    </span>
                  </div>

                  <div className="wd-user-info">
                    <div className="user-avatar">
                      {wd.users?.full_name?.charAt(0) || wd.users?.email?.charAt(0) || '?'}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{wd.users?.full_name || 'Chưa có tên'}</div>
                      <div className="user-email">{wd.users?.email}</div>
                      <div className="user-role">
                        <span className={`role-badge ${wd.users?.partner_role}`}>
                          {wd.users?.partner_role?.toUpperCase()} {wd.users?.partner_tier && `- Tier ${wd.users.partner_tier}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="wd-bank-info">
                    <div className="bank-item">
                      <Building size={14} />
                      <span className="label">Ngân hàng:</span>
                      <span className="value">{wd.bank_name}</span>
                    </div>
                    <div className="bank-item">
                      <CreditCard size={14} />
                      <span className="label">STK:</span>
                      <span className="value">{wd.bank_account_number}</span>
                      <button className="copy-btn" onClick={() => {
                        navigator.clipboard.writeText(wd.bank_account_number);
                        alert('Đã copy STK!');
                      }}>
                        <Copy size={12} />
                      </button>
                    </div>
                    <div className="bank-item">
                      <User size={14} />
                      <span className="label">Chủ TK:</span>
                      <span className="value">{wd.bank_account_name}</span>
                    </div>
                  </div>

                  <div className="wd-dates">
                    <div className="date-item">
                      <span className="label">Ngày tạo:</span>
                      <span className="value">{formatDate(wd.created_at)}</span>
                    </div>
                    {wd.approved_at && (
                      <div className="date-item">
                        <span className="label">Ngày duyệt:</span>
                        <span className="value">{formatDate(wd.approved_at)}</span>
                      </div>
                    )}
                    {wd.processed_at && (
                      <div className="date-item">
                        <span className="label">Ngày xử lý:</span>
                        <span className="value">{formatDate(wd.processed_at)}</span>
                      </div>
                    )}
                    {wd.completed_at && (
                      <div className="date-item">
                        <span className="label">Ngày hoàn tất:</span>
                        <span className="value">{formatDate(wd.completed_at)}</span>
                      </div>
                    )}
                  </div>

                  {wd.transaction_id && (
                    <div className="wd-transaction">
                      <CheckCircle size={14} />
                      <span>Mã GD: {wd.transaction_id}</span>
                    </div>
                  )}

                  {wd.rejection_reason && (
                    <div className="wd-rejection">
                      <AlertCircle size={14} />
                      <span>Lý do từ chối: {wd.rejection_reason}</span>
                    </div>
                  )}

                  {/* Action buttons based on status */}
                  <div className="wd-actions">
                    {wd.status === 'pending' && (
                      <>
                        <button
                          className="action-btn approve"
                          onClick={() => handleApproveWithdrawal(wd)}
                        >
                          <CheckCircle size={14} /> Duyệt
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleRejectWithdrawal(wd)}
                        >
                          <Ban size={14} /> Từ chối
                        </button>
                      </>
                    )}
                    {wd.status === 'approved' && (
                      <button
                        className="action-btn process"
                        onClick={() => handleProcessWithdrawal(wd)}
                      >
                        <RefreshCw size={14} /> Bắt đầu xử lý
                      </button>
                    )}
                    {wd.status === 'processing' && (
                      <button
                        className="action-btn complete"
                        onClick={() => handleCompleteWithdrawal(wd)}
                      >
                        <CheckCircle size={14} /> Hoàn tất chuyển khoản
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="tab-content">
          <h2>System Analytics</h2>

          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="card-icon"><Users size={32} /></div>
              <div className="card-content">
                <div className="card-label">Total Users</div>
                <div className="card-value">{analytics.totalUsers.toLocaleString()}</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon"><CircleDollarSign size={32} /></div>
              <div className="card-content">
                <div className="card-label">Free Tier</div>
                <div className="card-value">{analytics.freeUsers.toLocaleString()}</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon"><Gem size={32} /></div>
              <div className="card-content">
                <div className="card-label">Premium Users</div>
                <div className="card-value">{analytics.premiumUsers.toLocaleString()}</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon"><Crown size={32} /></div>
              <div className="card-content">
                <div className="card-label">Admin Users</div>
                <div className="card-value">{analytics.adminUsers.toLocaleString()}</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon"><Search size={32} /></div>
              <div className="card-content">
                <div className="card-label">Total Scans</div>
                <div className="card-value">{analytics.totalScans.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Partnership Analytics */}
          <h3 style={{ color: '#FFBD59', margin: '32px 0 16px', fontSize: '18px' }}>
            Partnership Stats
          </h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="card-icon" style={{ color: '#0ECB81' }}><User size={32} /></div>
              <div className="card-content">
                <div className="card-label">Affiliates</div>
                <div className="card-value">{analytics.totalAffiliates}</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon" style={{ color: '#F0B90B' }}><Award size={32} /></div>
              <div className="card-content">
                <div className="card-label">CTVs</div>
                <div className="card-value">{analytics.totalCtvs}</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon" style={{ color: '#F6465D' }}><FileText size={32} /></div>
              <div className="card-content">
                <div className="card-label">Đơn chờ duyệt</div>
                <div className="card-value">{analytics.pendingApplications}</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon" style={{ color: '#F6465D' }}><Wallet size={32} /></div>
              <div className="card-content">
                <div className="card-label">Rút tiền chờ xử lý</div>
                <div className="card-value">{analytics.pendingWithdrawals}</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon" style={{ color: '#0ECB81' }}><DollarSign size={32} /></div>
              <div className="card-content">
                <div className="card-label">Tổng Commission</div>
                <div className="card-value" style={{ fontSize: '20px' }}>{formatCurrency(analytics.totalCommissions)}</div>
              </div>
            </div>
          </div>

          <div className="chart-placeholder">
            <div className="placeholder-icon"><BarChart3 size={64} /></div>
            <div className="placeholder-text">Real-time Analytics Dashboard</div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="tab-content">
          <h2>System Information</h2>

          <div className="system-info">
            <div className="info-row">
              <span className="info-label">Supabase Status:</span>
              <span className="info-value status-online"><Activity size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#0ECB81' }} />Connected</span>
            </div>
            <div className="info-row">
              <span className="info-label">Database:</span>
              <span className="info-value status-online"><Activity size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#0ECB81' }} />PostgreSQL</span>
            </div>
            <div className="info-row">
              <span className="info-label">Environment:</span>
              <span className="info-value">{import.meta.env.MODE}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Version:</span>
              <span className="info-value">v2.0.0 (with Admin Panel)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Update:</span>
              <span className="info-value">{new Date().toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}

// User Modal Component - WITH REAL TIER/ROLE SELECTION
function UserModal({ user, onClose, onSave }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    scanner_tier: user?.scanner_tier || 'FREE',
    role: user?.role || 'user',
    scanner_tier_expires_at: user?.scanner_tier_expires_at
      ? new Date(user.scanner_tier_expires_at).toISOString().split('T')[0]
      : '',
  });

  console.log('UserModal RENDERING - user:', user?.email, 'formData:', formData);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    // Convert empty expiration to null
    const dataToSave = {
      ...formData,
      scanner_tier_expires_at: formData.scanner_tier_expires_at || null,
    };

    onSave(dataToSave);
  };

  return (
    <div
      className="user-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
      }}
    >
      <div
        className="user-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(42, 27, 82, 0.95) 0%, rgba(17, 34, 80, 0.95) 100%)',
          border: '2px solid #FFBD59',
          borderRadius: '12px',
          padding: '32px',
          minWidth: '500px',
          maxWidth: '600px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255, 189, 89, 0.2)', paddingBottom: '16px' }}>
          <h2 style={{ color: '#FFBD59', margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user ? <><User size={24} />Edit User: {user.email}</> : <><UserPlus size={24} />Add New User</>}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#DEBC81', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled={!!user} // Cannot change email
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(17, 34, 80, 0.6)',
                border: '1px solid rgba(255, 189, 89, 0.3)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                cursor: user ? 'not-allowed' : 'text',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#DEBC81', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(17, 34, 80, 0.6)',
                border: '1px solid rgba(255, 189, 89, 0.3)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#DEBC81', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Tier
            </label>
            <select
              value={formData.scanner_tier}
              onChange={(e) => setFormData({ ...formData, scanner_tier: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(17, 34, 80, 0.9)',
                border: '1px solid rgba(255, 189, 89, 0.3)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="FREE" style={{ background: '#112250', color: '#FFFFFF', padding: '8px' }}>FREE</option>
              <option value="TIER1" style={{ background: '#112250', color: '#FFFFFF', padding: '8px' }}>TIER 1</option>
              <option value="TIER2" style={{ background: '#112250', color: '#FFFFFF', padding: '8px' }}>TIER 2</option>
              <option value="TIER3" style={{ background: '#112250', color: '#FFFFFF', padding: '8px' }}>TIER 3</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#DEBC81', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(17, 34, 80, 0.9)',
                border: '1px solid rgba(255, 189, 89, 0.3)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="user" style={{ background: '#112250', color: '#FFFFFF', padding: '8px' }}>USER</option>
              <option value="admin" style={{ background: '#112250', color: '#FFFFFF', padding: '8px' }}>ADMIN</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#DEBC81', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Tier Expiration Date (leave empty for no expiration)
            </label>
            <input
              type="date"
              value={formData.scanner_tier_expires_at}
              onChange={(e) => setFormData({ ...formData, scanner_tier_expires_at: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(17, 34, 80, 0.9)',
                border: '1px solid rgba(255, 189, 89, 0.3)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                colorScheme: 'dark',
              }}
            />
            <small style={{ color: 'rgba(255, 189, 89, 0.6)', fontSize: '12px' }}>
              Empty = Never expires (recommended for admin tier)
            </small>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#DEBC81',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #0ECB81 0%, #0ba368 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              {user ? <><TrendingUp size={16} />Save Changes</> : <><UserPlus size={16} />Create User</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admin;
