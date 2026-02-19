import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './OrdersPage.css';

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'failed', label: 'Thất bại' },
  { key: 'refunded', label: 'Hoàn tiền' },
];

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  paid: 'Đã thanh toán',
  completed: 'Hoàn thành',
  failed: 'Thất bại',
  refunded: 'Hoàn tiền',
  expired: 'Hết hạn',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(amount, currency) {
  if (amount == null) return '—';
  if (currency === 'gems') return `${Number(amount).toLocaleString()} Gems`;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch subscription invoices
      let query = supabase
        .from('subscription_invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: invoices, error: invErr } = await query;
      if (invErr) throw invErr;

      // Also fetch pending_payments
      let payQuery = supabase
        .from('pending_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        payQuery = payQuery.eq('status', filter);
      }

      const { data: payments, error: payErr } = await payQuery;
      if (payErr) throw payErr;

      // Merge and sort
      const merged = [
        ...(invoices || []).map(inv => ({
          id: inv.id,
          type: 'invoice',
          status: inv.status,
          amount: inv.amount,
          currency: inv.currency || 'VND',
          description: inv.description || inv.plan_name || 'Đăng ký gói',
          payment_method: inv.payment_method,
          created_at: inv.created_at,
          paid_at: inv.paid_at,
          expires_at: inv.expires_at,
        })),
        ...(payments || []).map(pay => ({
          id: pay.id,
          type: 'payment',
          status: pay.status,
          amount: pay.amount,
          currency: pay.currency || 'VND',
          description: pay.description || pay.item_name || 'Thanh toán',
          payment_method: pay.payment_method,
          created_at: pay.created_at,
          paid_at: pay.completed_at,
          expires_at: pay.expires_at,
        })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setOrders(merged);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchOrders]);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Auth wall
  if (!authLoading && !user) {
    return (
      <div className="orders-page">
        <div className="orders-page__auth">
          <div className="orders-page__auth-icon">🔒</div>
          <p className="orders-page__auth-text">Đăng nhập để xem đơn hàng</p>
          <button className="orders-page__auth-btn" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-page__loading">
          <div className="orders-page__loading-spinner" />
          <span className="orders-page__loading-text">Đang tải đơn hàng...</span>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-page__error">
          <div className="orders-page__error-icon">⚠️</div>
          <p className="orders-page__error-text">{error}</p>
          <button className="orders-page__retry-btn" onClick={fetchOrders}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="orders-page__header">
        <h1 className="orders-page__title">Đơn hàng</h1>
        <p className="orders-page__subtitle">Lịch sử đơn hàng &amp; thanh toán</p>
      </header>

      {/* Filters */}
      <div className="orders-filters">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            className={`orders-filter-btn ${filter === f.key ? 'orders-filter-btn--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List or Empty */}
      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty__icon">📦</div>
          <p className="orders-empty__text">
            {filter === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng "${STATUS_LABELS[filter] || filter}"`}
          </p>
          <p className="orders-empty__hint">Nâng cấp gói để trải nghiệm đầy đủ tính năng</p>
          <button className="orders-empty__cta" onClick={() => navigate('/shop')}>
            Khám phá Shop
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="order-card">
                <div className="order-card__header" onClick={() => toggleExpand(order.id)}>
                  <div className="order-card__left">
                    <span className="order-card__id">#{order.id?.slice(0, 8)}</span>
                    <span className="order-card__date">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-card__right">
                    <span className="order-card__amount">
                      {formatAmount(order.amount, order.currency)}
                    </span>
                    <span className={`order-status order-status--${order.status}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className={`order-card__arrow ${isExpanded ? 'order-card__arrow--open' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-card__details">
                    <div className="order-detail-row">
                      <span className="order-detail-row__label">Mô tả</span>
                      <span className="order-detail-row__value">{order.description}</span>
                    </div>
                    <div className="order-detail-row">
                      <span className="order-detail-row__label">Loại</span>
                      <span className="order-detail-row__value">
                        {order.type === 'invoice' ? 'Hóa đơn' : 'Thanh toán'}
                      </span>
                    </div>
                    {order.payment_method && (
                      <div className="order-detail-row">
                        <span className="order-detail-row__label">Phương thức</span>
                        <span className="order-detail-row__value">{order.payment_method}</span>
                      </div>
                    )}
                    {order.paid_at && (
                      <div className="order-detail-row">
                        <span className="order-detail-row__label">Thanh toán lúc</span>
                        <span className="order-detail-row__value">{formatDate(order.paid_at)}</span>
                      </div>
                    )}
                    {order.expires_at && (
                      <div className="order-detail-row">
                        <span className="order-detail-row__label">Hết hạn</span>
                        <span className="order-detail-row__value">{formatDate(order.expires_at)}</span>
                      </div>
                    )}
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

export default OrdersPage;
