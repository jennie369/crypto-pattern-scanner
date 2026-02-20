import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_calendar')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (!error) {
        setScheduledPosts(data || []);
      }
    } catch (err) {
      console.error('Error loading scheduled posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Xóa bài đăng này?')) return;

    try {
      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadScheduledPosts();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Lịch Nội Dung</h2>
        <button className="add-user-btn">
          <Calendar size={16} /> Tạo Bài Đăng Mới
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-state">
          <div className="spinner-large"></div>
          <p>Đang tải lịch...</p>
        </div>
      ) : scheduledPosts.length === 0 ? (
        <div className="admin-empty-state">
          <Calendar size={48} />
          <h3>Chưa có bài đăng nào được lên lịch</h3>
          <p>Tạo bài đăng và lên lịch đăng tự động</p>
        </div>
      ) : (
        <div className="admin-calendar-list">
          {scheduledPosts.map((post) => (
            <div key={post.id} className={`admin-calendar-item ${post.status}`}>
              <div className="admin-calendar-time">
                <span className="date">{new Date(post.scheduled_at).toLocaleDateString('vi-VN')}</span>
                <span className="time">{new Date(post.scheduled_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="admin-calendar-content">
                <h4>{post.title || 'Untitled'}</h4>
                <p>{post.content?.substring(0, 100)}...</p>
                <div className="admin-calendar-meta">
                  <span className={`status-badge ${post.status}`}>{post.status}</span>
                  <span>Platform: {post.platform || 'All'}</span>
                </div>
              </div>
              <div className="admin-calendar-actions">
                <button className="action-btn edit">Sửa</button>
                <button className="action-btn delete" onClick={() => handleDeletePost(post.id)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
