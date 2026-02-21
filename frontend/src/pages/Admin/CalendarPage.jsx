import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from './adminUtils';
import { Calendar, X, Save } from 'lucide-react';

const PLATFORM_OPTIONS = [
  { value: 'gemral', label: 'GemRal' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'threads', label: 'Threads' },
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'post', label: 'Bài đăng' },
  { value: 'video', label: 'Video' },
  { value: 'short', label: 'Short' },
  { value: 'reel', label: 'Reel' },
  { value: 'story', label: 'Story' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'scheduled', label: 'Đã lên lịch' },
];

const EMPTY_FORM = {
  title: '',
  content: '',
  platform: 'gemral',
  content_type: 'post',
  scheduled_date: '',
  scheduled_time: '09:00',
  status: 'draft',
  media_urls: '',
  hashtags: '',
  link_url: '',
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_calendar')
        .select('*')
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (!error) {
        setScheduledPosts(data || []);
      }
    } catch (err) {
      console.error('Error loading scheduled posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || '',
      content: post.content || '',
      platform: post.platform || 'gemral',
      content_type: post.content_type || 'post',
      scheduled_date: post.scheduled_date || '',
      scheduled_time: post.scheduled_time ? post.scheduled_time.slice(0, 5) : '09:00',
      status: post.status || 'draft',
      media_urls: (post.media_urls || []).join(', '),
      hashtags: (post.hashtags || []).join(', '),
      link_url: post.link_url || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }
    if (!form.content.trim()) {
      alert('Vui lòng nhập nội dung');
      return;
    }
    if (!form.scheduled_date) {
      alert('Vui lòng chọn ngày đăng');
      return;
    }
    if (!form.scheduled_time) {
      alert('Vui lòng chọn giờ đăng');
      return;
    }

    setSaving(true);
    try {
      const mediaUrls = form.media_urls
        ? form.media_urls.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const hashtags = form.hashtags
        ? form.hashtags.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        platform: form.platform,
        content_type: form.content_type,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time + ':00',
        status: form.status,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        hashtags: hashtags.length > 0 ? hashtags : null,
        link_url: form.link_url.trim() || null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('content_calendar')
          .update(payload)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        payload.created_by = user?.id || null;
        const { error } = await supabase
          .from('content_calendar')
          .insert(payload);
        if (error) throw error;
      }

      handleCancel();
      loadScheduledPosts();
    } catch (err) {
      alert('Lỗi khi lưu: ' + err.message);
    } finally {
      setSaving(false);
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

  const getStatusLabel = (status) => {
    const found = STATUS_OPTIONS.find(s => s.value === status);
    return found ? found.label : status;
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Lịch Nội Dung</h2>
        <button className="add-user-btn" onClick={handleOpenCreate}>
          <Calendar size={16} /> Tạo Bài Đăng Mới
        </button>
      </div>

      {/* Inline Create/Edit Form */}
      {showForm && (
        <div className="admin-inline-form" style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, color: '#fff' }}>
            {editingPost ? 'Chỉnh Sửa Bài Đăng' : 'Tạo Bài Đăng Mới'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Tiêu đề */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Tiêu đề *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Nhập tiêu đề bài đăng"
                style={inputStyle}
              />
            </div>

            {/* Nội dung */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nội dung *</label>
              <textarea
                value={form.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Nhập nội dung bài đăng..."
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Nền tảng */}
            <div>
              <label style={labelStyle}>Nền tảng</label>
              <select
                value={form.platform}
                onChange={(e) => handleChange('platform', e.target.value)}
                style={inputStyle}
              >
                {PLATFORM_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Loại nội dung */}
            <div>
              <label style={labelStyle}>Loại nội dung</label>
              <select
                value={form.content_type}
                onChange={(e) => handleChange('content_type', e.target.value)}
                style={inputStyle}
              >
                {CONTENT_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Ngày đăng */}
            <div>
              <label style={labelStyle}>Ngày đăng *</label>
              <input
                type="date"
                value={form.scheduled_date}
                onChange={(e) => handleChange('scheduled_date', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Giờ đăng */}
            <div>
              <label style={labelStyle}>Giờ đăng *</label>
              <input
                type="time"
                value={form.scheduled_time}
                onChange={(e) => handleChange('scheduled_time', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label style={labelStyle}>Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                style={inputStyle}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Link URL */}
            <div>
              <label style={labelStyle}>Link URL</label>
              <input
                type="text"
                value={form.link_url}
                onChange={(e) => handleChange('link_url', e.target.value)}
                placeholder="https://example.com"
                style={inputStyle}
              />
            </div>

            {/* Media URLs */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>URL hình ảnh/video (phân cách bằng dấu phẩy)</label>
              <input
                type="text"
                value={form.media_urls}
                onChange={(e) => handleChange('media_urls', e.target.value)}
                placeholder="https://img1.jpg, https://img2.jpg"
                style={inputStyle}
              />
            </div>

            {/* Hashtags */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Hashtags (phân cách bằng dấu phẩy)</label>
              <input
                type="text"
                value={form.hashtags}
                onChange={(e) => handleChange('hashtags', e.target.value)}
                placeholder="#crypto, #trading, #gemral"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancel}
              style={{ padding: '8px 20px', background: '#333', color: '#ccc', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <X size={14} /> Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '8px 20px', background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.6 : 1 }}
            >
              <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

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
                <span className="date">{post.scheduled_date ? new Date(post.scheduled_date + 'T00:00:00').toLocaleDateString('vi-VN') : '-'}</span>
                <span className="time">{post.scheduled_time ? post.scheduled_time.slice(0, 5) : '-'}</span>
              </div>
              <div className="admin-calendar-content">
                <h4>{post.title || 'Chưa có tiêu đề'}</h4>
                <p>{post.content?.substring(0, 100)}{post.content?.length > 100 ? '...' : ''}</p>
                <div className="admin-calendar-meta">
                  <span className={`status-badge ${post.status}`}>{getStatusLabel(post.status)}</span>
                  <span>Nền tảng: {post.platform || 'Tất cả'}</span>
                  <span>Loại: {post.content_type || '-'}</span>
                </div>
              </div>
              <div className="admin-calendar-actions">
                <button className="action-btn edit" onClick={() => handleOpenEdit(post)}>Sửa</button>
                <button className="action-btn delete" onClick={() => handleDeletePost(post.id)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle = { color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 };

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#0d0d1a',
  border: '1px solid #444',
  borderRadius: 8,
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};
