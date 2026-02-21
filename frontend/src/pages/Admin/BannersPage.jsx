import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from './adminUtils';
import {
  Image as ImageIcon,
  X,
  Save,
} from 'lucide-react';

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  action_value: '',
  action_label: 'Tìm hiểu thêm',
  layout_type: 'compact',
  is_active: true,
  priority: 0,
  target_screens: ['portfolio'],
  sponsor_name: '',
  sponsor_avatar: '',
};

export default function BannersPage() {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sponsor_banners')
        .select('*')
        .order('priority', { ascending: false });

      if (!error) {
        setBanners(data || []);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      action_value: banner.action_value || '',
      action_label: banner.action_label || 'Tìm hiểu thêm',
      layout_type: banner.layout_type || 'compact',
      is_active: banner.is_active ?? true,
      priority: banner.priority ?? 0,
      target_screens: banner.target_screens || ['portfolio'],
      sponsor_name: banner.sponsor_name || '',
      sponsor_avatar: banner.sponsor_avatar || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBanner(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Vui lòng nhập tiêu đề banner');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        action_value: form.action_value.trim() || null,
        action_label: form.action_label.trim() || 'Tìm hiểu thêm',
        layout_type: form.layout_type,
        is_active: form.is_active,
        priority: parseInt(form.priority, 10) || 0,
        target_screens: form.target_screens,
        sponsor_name: form.sponsor_name.trim() || null,
        sponsor_avatar: form.sponsor_avatar.trim() || null,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from('sponsor_banners')
          .update(payload)
          .eq('id', editingBanner.id);
        if (error) throw error;
      } else {
        payload.created_by = user?.id || null;
        const { error } = await supabase
          .from('sponsor_banners')
          .insert(payload);
        if (error) throw error;
      }

      handleCancel();
      loadBanners();
    } catch (err) {
      alert('Lỗi khi lưu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const { error } = await supabase
        .from('sponsor_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;
      loadBanners();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;

    try {
      const { error } = await supabase
        .from('sponsor_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadBanners();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Quản Lý Banner Quảng Cáo</h2>
        <button className="add-user-btn" onClick={handleOpenCreate}>
          <ImageIcon size={16} /> Thêm Banner
        </button>
      </div>

      {/* Inline Create/Edit Form */}
      {showForm && (
        <div className="admin-inline-form" style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, color: '#fff' }}>
            {editingBanner ? 'Chỉnh Sửa Banner' : 'Thêm Banner Mới'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Tiêu đề */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Tiêu đề *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Nhập tiêu đề banner"
                style={inputStyle}
              />
            </div>

            {/* Phụ đề */}
            <div>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Phụ đề</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="Phụ đề banner"
                style={inputStyle}
              />
            </div>

            {/* Tên nhà tài trợ */}
            <div>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Tên nhà tài trợ</label>
              <input
                type="text"
                value={form.sponsor_name}
                onChange={(e) => handleChange('sponsor_name', e.target.value)}
                placeholder="Tên nhà tài trợ"
                style={inputStyle}
              />
            </div>

            {/* Mô tả */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả banner"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* URL hình ảnh */}
            <div>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>URL hình ảnh</label>
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={inputStyle}
              />
            </div>

            {/* Avatar nhà tài trợ */}
            <div>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Avatar nhà tài trợ (URL)</label>
              <input
                type="text"
                value={form.sponsor_avatar}
                onChange={(e) => handleChange('sponsor_avatar', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                style={inputStyle}
              />
            </div>

            {/* Link hành động */}
            <div>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Link hành động</label>
              <input
                type="text"
                value={form.action_value}
                onChange={(e) => handleChange('action_value', e.target.value)}
                placeholder="https://example.com/landing"
                style={inputStyle}
              />
            </div>

            {/* Nhãn nút */}
            <div>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Nhãn nút hành động</label>
              <input
                type="text"
                value={form.action_label}
                onChange={(e) => handleChange('action_label', e.target.value)}
                placeholder="Tìm hiểu thêm"
                style={inputStyle}
              />
            </div>

            {/* Layout type */}
            <div>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Kiểu bố cục</label>
              <select
                value={form.layout_type}
                onChange={(e) => handleChange('layout_type', e.target.value)}
                style={inputStyle}
              >
                <option value="compact">Compact</option>
                <option value="post">Post</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Độ ưu tiên</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            {/* Target screens */}
            <div>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 4 }}>Màn hình hiển thị</label>
              <input
                type="text"
                value={(form.target_screens || []).join(', ')}
                onChange={(e) => handleChange('target_screens', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="portfolio, scanner"
                style={inputStyle}
              />
            </div>

            {/* Is active */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                id="banner-active"
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="banner-active" style={{ color: '#ccc', fontSize: 14, cursor: 'pointer' }}>Kích hoạt</label>
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
          <p>Đang tải banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="admin-empty-state">
          <ImageIcon size={48} />
          <h3>Chưa có banner nào</h3>
          <p>Thêm banner quảng cáo cho Portfolio</p>
        </div>
      ) : (
        <div className="admin-banners-grid">
          {banners.map((banner) => (
            <div key={banner.id} className={`admin-banner-card ${banner.is_active ? 'active' : 'inactive'}`}>
              {banner.image_url && (
                <img src={banner.image_url} alt={banner.title} className="admin-banner-image" />
              )}
              <div className="admin-banner-info">
                <h4>{banner.title || 'Chưa có tiêu đề'}</h4>
                <p>{banner.description || 'Chưa có mô tả'}</p>
                <div className="admin-banner-meta">
                  <span className={`status-badge ${banner.is_active ? 'active' : 'inactive'}`}>
                    {banner.is_active ? 'Đang hoạt động' : 'Đã tắt'}
                  </span>
                  <span>Bố cục: {banner.layout_type || '-'}</span>
                  <span>Ưu tiên: {banner.priority ?? 0}</span>
                </div>
              </div>
              <div className="admin-banner-actions">
                <button onClick={() => handleOpenEdit(banner)} className="action-btn edit">
                  Sửa
                </button>
                <button onClick={() => handleToggleActive(banner)} className="action-btn edit">
                  {banner.is_active ? 'Tắt' : 'Bật'}
                </button>
                <button onClick={() => handleDeleteBanner(banner.id)} className="action-btn delete">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
