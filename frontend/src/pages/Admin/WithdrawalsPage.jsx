import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency, formatDate, sendPartnershipNotification } from './adminUtils';
import {
  Wallet,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Ban,
  Building,
  CreditCard,
  Copy,
} from 'lucide-react';

export default function WithdrawalsPage() {
  const { user, profile } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawalFilter, setWithdrawalFilter] = useState('pending');

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadWithdrawals();
    }
  }, [user, profile?.role, withdrawalFilter]);

  const loadWithdrawals = async () => {
    try {
      setWithdrawalsLoading(true);

      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles:partner_id (
            id,
            email,
            full_name,
            partnership_role,
            ctv_tier,
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

  const handleApproveWithdrawal = async (withdrawal) => {
    if (!confirm(`Duyệt yêu cầu rút ${formatCurrency(withdrawal.amount)} cho ${withdrawal.profiles?.email}?`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('approve_withdrawal_request', {
        request_id_param: withdrawal.id,
        admin_id_param: user.id,
        admin_notes_param: `Approved by ${profile?.email}`
      });

      if (error) throw error;

      await sendPartnershipNotification('withdrawal_approved', withdrawal.partner_id, {
        amount: withdrawal.amount
      });

      alert('Đã duyệt yêu cầu rút tiền!');
      await loadWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Lỗi: ' + error.message);
    }
  };

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

      alert('Đang xử lý chuyển khoản!');
      await loadWithdrawals();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Lỗi: ' + error.message);
    }
  };

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

      await sendPartnershipNotification('withdrawal_completed', withdrawal.partner_id, {
        amount: withdrawal.amount,
        transaction_id: txId
      });

      alert('Đã hoàn tất chuyển khoản!');
      await loadWithdrawals();
    } catch (error) {
      console.error('Error completing withdrawal:', error);
      alert('Lỗi: ' + error.message);
    }
  };

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

      await sendPartnershipNotification('withdrawal_rejected', withdrawal.partner_id, {
        amount: withdrawal.amount,
        reason: reason
      });

      alert('Đã từ chối yêu cầu rút tiền!');
      await loadWithdrawals();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  return (
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
                  {wd.profiles?.full_name?.charAt(0) || wd.profiles?.email?.charAt(0) || '?'}
                </div>
                <div className="user-details">
                  <div className="user-name">{wd.profiles?.full_name || 'Chưa có tên'}</div>
                  <div className="user-email">{wd.profiles?.email}</div>
                  <div className="user-role">
                    <span className={`role-badge ${wd.profiles?.partnership_role}`}>
                      {wd.profiles?.partnership_role?.toUpperCase()} {wd.profiles?.ctv_tier && `- Tier ${wd.users.ctv_tier}`}
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
  );
}
