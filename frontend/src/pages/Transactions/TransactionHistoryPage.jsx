import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './TransactionHistoryPage.css';

const PAGE_SIZE = 20;

const TYPE_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'credit', label: 'Nhận' },
  { key: 'debit', label: 'Trừ' },
  { key: 'purchase', label: 'Mua' },
  { key: 'gift', label: 'Quà tặng' },
  { key: 'bonus', label: 'Thưởng' },
];

const TYPE_LABELS = {
  credit: 'Nhận',
  debit: 'Trừ',
  purchase: 'Mua hàng',
  gift: 'Quà tặng',
  bonus: 'Thưởng',
  checkin: 'Điểm danh',
  referral: 'Giới thiệu',
  refund: 'Hoàn tiền',
};

const TYPE_ICONS = {
  credit: '💰',
  debit: '💸',
  purchase: '🛒',
  gift: '🎁',
  bonus: '🎯',
  checkin: '📅',
  referral: '🤝',
  refund: '↩️',
};

function getTypeCategory(type) {
  if (['credit', 'bonus', 'checkin', 'referral', 'refund'].includes(type)) return 'credit';
  if (['debit', 'purchase'].includes(type)) return 'debit';
  if (type === 'gift') return 'gift';
  return 'credit'; // default
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TransactionHistoryPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const currentBalance = profile?.gems ?? 0;

  const fetchTransactions = useCallback(async (reset = true) => {
    if (!user) return;

    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const currentOffset = reset ? 0 : offset;

    try {
      let query = supabase
        .from('gems_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + PAGE_SIZE - 1);

      if (typeFilter !== 'all') {
        // Map filter to potential transaction_type values
        if (typeFilter === 'credit') {
          query = query.in('transaction_type', ['credit', 'bonus', 'checkin', 'referral', 'refund']);
        } else if (typeFilter === 'debit') {
          query = query.in('transaction_type', ['debit', 'purchase']);
        } else {
          query = query.eq('transaction_type', typeFilter);
        }
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      const rows = data || [];
      setHasMore(rows.length === PAGE_SIZE);

      if (reset) {
        setTransactions(rows);
        setOffset(PAGE_SIZE);
      } else {
        setTransactions(prev => [...prev, ...rows]);
        setOffset(prev => prev + PAGE_SIZE);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, typeFilter, offset]);

  useEffect(() => {
    if (user) {
      fetchTransactions(true);
    } else if (!authLoading) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, typeFilter]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTransactions(false);
    }
  };

  // Auth wall
  if (!authLoading && !user) {
    return (
      <div className="txn-page">
        <div className="txn-page__auth">
          <div className="txn-page__auth-icon">🔒</div>
          <p className="txn-page__auth-text">Đăng nhập để xem lịch sử giao dịch</p>
          <button className="txn-page__auth-btn" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="txn-page">
        <div className="txn-page__loading">
          <div className="txn-page__loading-spinner" />
          <span className="txn-page__loading-text">Đang tải giao dịch...</span>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="txn-page">
        <div className="txn-page__error">
          <div className="txn-page__error-icon">⚠️</div>
          <p className="txn-page__error-text">{error}</p>
          <button className="txn-page__retry-btn" onClick={() => fetchTransactions(true)}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="txn-page">
      <header className="txn-page__header">
        <h1 className="txn-page__title">Lịch sử giao dịch</h1>
        <p className="txn-page__subtitle">Toàn bộ giao dịch Gems của bạn</p>
      </header>

      {/* Balance */}
      <div className="txn-balance">
        <span className="txn-balance__label">Số dư hiện tại</span>
        <span className="txn-balance__amount">{currentBalance.toLocaleString()} Gems</span>
      </div>

      {/* Type Filters */}
      <div className="txn-filters">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.key}
            className={`txn-filter-btn ${typeFilter === f.key ? 'txn-filter-btn--active' : ''}`}
            onClick={() => setTypeFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions or Empty */}
      {transactions.length === 0 ? (
        <div className="txn-empty">
          <div className="txn-empty__icon">📋</div>
          <p className="txn-empty__text">
            {typeFilter === 'all' ? 'Chưa có giao dịch nào' : 'Không có giao dịch phù hợp'}
          </p>
          <p className="txn-empty__hint">Giao dịch Gems sẽ hiển thị ở đây</p>
        </div>
      ) : (
        <>
          <div className="txn-list">
            {transactions.map(txn => {
              const cat = getTypeCategory(txn.transaction_type);
              const isCredit = ['credit', 'bonus', 'gift'].includes(cat) || txn.amount > 0;
              const icon = TYPE_ICONS[txn.transaction_type] || (isCredit ? '💰' : '💸');
              const iconClass = `txn-item__icon txn-item__icon--${cat}`;

              return (
                <div key={txn.id} className="txn-item">
                  <div className={iconClass}>{icon}</div>
                  <div className="txn-item__info">
                    <p className="txn-item__desc">
                      {txn.description || TYPE_LABELS[txn.transaction_type] || txn.transaction_type}
                    </p>
                    <p className="txn-item__date">{formatDate(txn.created_at)}</p>
                    <span className={`txn-type-badge txn-type-badge--${cat}`}>
                      {TYPE_LABELS[txn.transaction_type] || txn.transaction_type}
                    </span>
                  </div>
                  <span className={`txn-item__amount ${isCredit ? 'txn-item__amount--credit' : 'txn-item__amount--debit'}`}>
                    {isCredit ? '+' : ''}{txn.amount?.toLocaleString()} Gems
                  </span>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="txn-load-more">
              <button
                className={`txn-load-more__btn ${loadingMore ? 'txn-load-more__btn--loading' : ''}`}
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Đang tải...' : 'Tải thêm'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TransactionHistoryPage;
