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
      alert('Vui long nhap tieu de va noi dung thong bao');
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

      alert(`Da gui thong bao den ${data?.sent_count || 0} users!`);
      setTitle('');
      setBody('');
      loadNotificationHistory();
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Loi: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Gui Thong Bao He Thong</h2>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-group">
          <label>Tieu de thong bao</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhap tieu de..."
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label>Noi dung thong bao</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Nhap noi dung thong bao..."
            className="admin-textarea"
            rows={4}
          />
        </div>

        <div className="admin-form-group">
          <label>Doi tuong nhan</label>
          <select
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
            className="admin-select"
          >
            <option value="all">Tat ca users</option>
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
            <><RefreshCw size={16} className="spin" /> Dang gui...</>
          ) : (
            <><Bell size={16} /> Gui Thong Bao</>
          )}
        </button>
      </div>

      <h3 style={{ color: '#FFBD59', marginTop: '32px', marginBottom: '16px' }}>
        Lich Su Thong Bao
      </h3>
      {loadingHistory ? (
        <div className="admin-loading-state">
          <div className="spinner-large"></div>
          <p>Dang tai...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="admin-empty-state">
          <Bell size={48} />
          <h3>Chua co thong bao nao</h3>
          <p>Gui thong bao dau tien cho users</p>
        </div>
      ) : (
        <div className="admin-history-list">
          {history.map((item) => (
            <div key={item.id} className="admin-history-item">
              <div className="admin-history-content">
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <small>
                  Gui den: {item.target_group} | {new Date(item.created_at).toLocaleString('vi-VN')}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
