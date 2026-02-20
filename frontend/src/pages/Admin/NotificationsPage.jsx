import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Bell,
  RefreshCw,
} from 'lucide-react';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetGroup, setTargetGroup] = useState('all');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadNotificationHistory();
  }, []);

  const loadNotificationHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setHistory(data);
      }
    } catch (err) {
      console.log('No notification history table yet');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung thông báo');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('broadcast-notification', {
        body: {
          title: title.trim(),
          body: body.trim(),
          target_group: targetGroup,
        }
      });

      if (error) throw error;

      alert(`Đã gửi thông báo đến ${data?.sent_count || 0} users!`);
      setTitle('');
      setBody('');
      loadNotificationHistory();
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Lỗi: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Gửi Thông Báo Hệ Thống</h2>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-group">
          <label>Tiêu đề thông báo</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề..."
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label>Nội dung thông báo</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Nhập nội dung thông báo..."
            className="admin-textarea"
            rows={4}
          />
        </div>

        <div className="admin-form-group">
          <label>Đối tượng nhận</label>
          <select
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
            className="admin-select"
          >
            <option value="all">Tất cả users</option>
            <option value="premium">Premium users</option>
            <option value="free">Free users</option>
            <option value="partners">Affiliates & CTVs</option>
          </select>
        </div>

        <button
          className="admin-btn-primary"
          onClick={handleSendNotification}
          disabled={sending}
        >
          {sending ? (
            <><RefreshCw size={16} className="spin" /> Đang gửi...</>
          ) : (
            <><Bell size={16} /> Gửi Thông Báo</>
          )}
        </button>
      </div>

      <h3 style={{ color: '#FFBD59', marginTop: '32px', marginBottom: '16px' }}>
        Lịch Sử Thông Báo
      </h3>
      {loadingHistory ? (
        <div className="admin-loading-state">
          <div className="spinner-large"></div>
          <p>Đang tải...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="admin-empty-state">
          <Bell size={48} />
          <h3>Chưa có thông báo nào</h3>
          <p>Gửi thông báo đầu tiên cho users</p>
        </div>
      ) : (
        <div className="admin-history-list">
          {history.map((item) => (
            <div key={item.id} className="admin-history-item">
              <div className="admin-history-content">
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <small>
                  Gửi đến: {item.target_group} | {new Date(item.created_at).toLocaleString('vi-VN')}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
