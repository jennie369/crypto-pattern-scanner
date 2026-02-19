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

  const handleApproveWithdrawal = async (withdrawal) => {
    if (!confirm(`Duyet yeu cau rut ${formatCurrency(withdrawal.amount)} cho ${withdrawal.users?.email}?`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('approve_withdrawal_request', {
        request_id_param: withdrawal.id,
        admin_id_param: user.id,
        admin_notes_param: `Approved by ${profile?.email}`
      });

      if (error) throw error;

      await sendPartnershipNotification('withdrawal_approved', withdrawal.user_id, {
        amount: withdrawal.amount
      });

      alert('Da duyet yeu cau rut tien!');
      await loadWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Loi: ' + error.message);
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

      alert('Dang xu ly chuyen khoan!');
      await loadWithdrawals();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Loi: ' + error.message);
    }
  };

  const handleCompleteWithdrawal = async (withdrawal) => {
    const txId = prompt('Nhap ma giao dich ngan hang (Transaction ID):');
    if (!txId) return;

    try {
      const { error } = await supabase.rpc('complete_withdrawal_request', {
        request_id_param: withdrawal.id,
        admin_id_param: user.id,
        transaction_id_param: txId
      });

      if (error) throw error;

      await sendPartnershipNotification('withdrawal_completed', withdrawal.user_id, {
        amount: withdrawal.amount,
        transaction_id: txId
      });

      alert('Da hoan tat chuyen khoan!');
      await loadWithdrawals();
    } catch (error) {
      console.error('Error completing withdrawal:', error);
      alert('Loi: ' + error.message);
    }
  };

  const handleRejectWithdrawal = async (withdrawal) => {
    const reason = prompt('Ly do tu choi yeu cau rut tien:');
    if (!reason) return;

    try {
      const { error } = await supabase.rpc('reject_withdrawal_request', {
        request_id_param: withdrawal.id,
        admin_id_param: user.id,
        rejection_reason_param: reason
      });

      if (error) throw error;

      await sendPartnershipNotification('withdrawal_rejected', withdrawal.user_id, {
        amount: withdrawal.amount,
        reason: reason
      });

      alert('Da tu choi yeu cau rut tien!');
      await loadWithdrawals();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Loi: ' + error.message);
    }
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Quan Ly Yeu Cau Rut Tien</h2>
        <div className="filter-buttons">
          {['all', 'pending', 'approved', 'processing', 'completed', 'rejected'].map(filter => (
            <button
              key={filter}
              className={`filter-btn ${withdrawalFilter === filter ? 'active' : ''}`}
              onClick={() => setWithdrawalFilter(filter)}
            >
              {filter === 'all' && 'Tat ca'}
              {filter === 'pending' && 'Cho duyet'}
              {filter === 'approved' && 'Da duyet'}
              {filter === 'processing' && 'Dang xu ly'}
              {filter === 'completed' && 'Hoan tat'}
              {filter === 'rejected' && 'Tu choi'}
            </button>
          ))}
        </div>
      </div>

      {withdrawalsLoading && (
        <div className="admin-loading-state">
          <div className="spinner-large"></div>
          <p>Dang tai danh sach yeu cau...</p>
        </div>
      )}

      {!withdrawalsLoading && withdrawals.length === 0 && (
        <div className="admin-empty-state">
          <div className="empty-icon"><Wallet size={48} /></div>
          <h3>Khong co yeu cau rut tien nao</h3>
          <p>Chua co yeu cau rut tien nao {withdrawalFilter !== 'all' ? `o trang thai "${withdrawalFilter}"` : ''}</p>
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
                  {wd.status === 'pending' && <><Clock size={12} /> Cho duyet</>}
                  {wd.status === 'approved' && <><CheckCircle size={12} /> Da duyet</>}
                  {wd.status === 'processing' && <><RefreshCw size={12} /> Dang xu ly</>}
                  {wd.status === 'completed' && <><CheckCircle size={12} /> Hoan tat</>}
                  {wd.status === 'rejected' && <><XCircle size={12} /> Tu choi</>}
                </span>
              </div>

              <div className="wd-user-info">
                <div className="user-avatar">
                  {wd.users?.full_name?.charAt(0) || wd.users?.email?.charAt(0) || '?'}
                </div>
                <div className="user-details">
                  <div className="user-name">{wd.users?.full_name || 'Chua co ten'}</div>
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
                  <span className="label">Ngan hang:</span>
                  <span className="value">{wd.bank_name}</span>
                </div>
                <div className="bank-item">
                  <CreditCard size={14} />
                  <span className="label">STK:</span>
                  <span className="value">{wd.bank_account_number}</span>
                  <button className="copy-btn" onClick={() => {
                    navigator.clipboard.writeText(wd.bank_account_number);
                    alert('Da copy STK!');
                  }}>
                    <Copy size={12} />
                  </button>
                </div>
                <div className="bank-item">
                  <User size={14} />
                  <span className="label">Chu TK:</span>
                  <span className="value">{wd.bank_account_name}</span>
                </div>
              </div>

              <div className="wd-dates">
                <div className="date-item">
                  <span className="label">Ngay tao:</span>
                  <span className="value">{formatDate(wd.created_at)}</span>
                </div>
                {wd.approved_at && (
                  <div className="date-item">
                    <span className="label">Ngay duyet:</span>
                    <span className="value">{formatDate(wd.approved_at)}</span>
                  </div>
                )}
                {wd.processed_at && (
                  <div className="date-item">
                    <span className="label">Ngay xu ly:</span>
                    <span className="value">{formatDate(wd.processed_at)}</span>
                  </div>
                )}
                {wd.completed_at && (
                  <div className="date-item">
                    <span className="label">Ngay hoan tat:</span>
                    <span className="value">{formatDate(wd.completed_at)}</span>
                  </div>
                )}
              </div>

              {wd.transaction_id && (
                <div className="wd-transaction">
                  <CheckCircle size={14} />
                  <span>Ma GD: {wd.transaction_id}</span>
                </div>
              )}

              {wd.rejection_reason && (
                <div className="wd-rejection">
                  <AlertCircle size={14} />
                  <span>Ly do tu choi: {wd.rejection_reason}</span>
                </div>
              )}

              <div className="wd-actions">
                {wd.status === 'pending' && (
                  <>
                    <button
                      className="action-btn approve"
                      onClick={() => handleApproveWithdrawal(wd)}
                    >
                      <CheckCircle size={14} /> Duyet
                    </button>
                    <button
                      className="action-btn reject"
                      onClick={() => handleRejectWithdrawal(wd)}
                    >
                      <Ban size={14} /> Tu choi
                    </button>
                  </>
                )}
                {wd.status === 'approved' && (
                  <button
                    className="action-btn process"
                    onClick={() => handleProcessWithdrawal(wd)}
                  >
                    <RefreshCw size={14} /> Bat dau xu ly
                  </button>
                )}
                {wd.status === 'processing' && (
                  <button
                    className="action-btn complete"
                    onClick={() => handleCompleteWithdrawal(wd)}
                  >
                    <CheckCircle size={14} /> Hoan tat chuyen khoan
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
