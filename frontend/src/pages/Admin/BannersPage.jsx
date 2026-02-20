import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Image as ImageIcon,
} from 'lucide-react';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sponsor_banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error) {
        setBanners(data || []);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
    } finally {
      setLoading(false);
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
        <button className="add-user-btn" onClick={() => setEditingBanner({})}>
          <ImageIcon size={16} /> Thêm Banner
        </button>
      </div>

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
                <h4>{banner.title || 'Untitled'}</h4>
                <p>{banner.description || 'No description'}</p>
                <div className="admin-banner-meta">
                  <span className={`status-badge ${banner.is_active ? 'active' : 'inactive'}`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span>Order: {banner.display_order}</span>
                </div>
              </div>
              <div className="admin-banner-actions">
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
