import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from './adminUtils';
import { Link2, X, Save } from 'lucide-react';

const EMPTY_CONNECT_FORM = {
  display_name: '',
  access_token: '',
  page_id: '',
};

export default function PlatformSettingsPage() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [connectForm, setConnectForm] = useState(EMPTY_CONNECT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setPlatforms(data || []);
      }
    } catch (err) {
      console.error('Error loading platforms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConnect = (platformConfig) => {
    const existing = platforms.find(p => p.platform?.toLowerCase() === platformConfig.name.toLowerCase());
    setConnectingPlatform(platformConfig);
    setConnectForm({
      display_name: existing?.display_name || '',
      access_token: '',
      page_id: existing?.page_id || '',
    });
  };

  const handleCancelConnect = () => {
    setConnectingPlatform(null);
    setConnectForm({ ...EMPTY_CONNECT_FORM });
  };

  const handleConnectChange = (field, value) => {
    setConnectForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    if (!connectingPlatform) return;

    setSaving(true);
    try {
      const existing = platforms.find(p => p.platform?.toLowerCase() === connectingPlatform.name.toLowerCase());

      if (existing) {
        // UPDATE existing row
        const updatePayload = {
          is_connected: true,
          connected_at: new Date().toISOString(),
          display_name: connectForm.display_name.trim() || null,
          page_id: connectForm.page_id.trim() || null,
        };
        if (connectForm.access_token.trim()) {
          updatePayload.access_token = connectForm.access_token.trim();
        }

        const { error } = await supabase
          .from('platform_connections')
          .update(updatePayload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // INSERT new row if no seed data exists
        const { error } = await supabase
          .from('platform_connections')
          .insert({
            platform: connectingPlatform.name,
            is_connected: true,
            connected_at: new Date().toISOString(),
            display_name: connectForm.display_name.trim() || null,
            access_token: connectForm.access_token.trim() || null,
            page_id: connectForm.page_id.trim() || null,
            created_by: user?.id || null,
          });
        if (error) throw error;
      }

      handleCancelConnect();
      loadPlatforms();
    } catch (err) {
      alert('Lỗi khi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (platformRecord) => {
    if (!confirm(`Ngắt kết nối ${platformRecord.platform}?`)) return;

    try {
      const { error } = await supabase
        .from('platform_connections')
        .update({
          is_connected: false,
          access_token: null,
          page_id: null,
        })
        .eq('id', platformRecord.id);

      if (error) throw error;
      loadPlatforms();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const platformConfigs = [
    { name: 'Facebook', icon: '📘', color: '#1877F2' },
    { name: 'TikTok', icon: '🎵', color: '#000000' },
    { name: 'YouTube', icon: '📺', color: '#FF0000' },
    { name: 'Instagram', icon: '📷', color: '#E4405F' },
    { name: 'Threads', icon: '🧵', color: '#000000' },
  ];

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Kết Nối Nền Tảng</h2>
      </div>

      {/* Connect Form */}
      {connectingPlatform && (
        <div className="admin-inline-form" style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, color: '#fff' }}>
            Kết nối {connectingPlatform.name}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Tên hiển thị */}
            <div>
              <label style={labelStyle}>Tên hiển thị</label>
              <input
                type="text"
                value={connectForm.display_name}
                onChange={(e) => handleConnectChange('display_name', e.target.value)}
                placeholder="VD: GemRal Official"
                style={inputStyle}
              />
            </div>

            {/* Page/Channel ID */}
            <div>
              <label style={labelStyle}>Page/Channel ID</label>
              <input
                type="text"
                value={connectForm.page_id}
                onChange={(e) => handleConnectChange('page_id', e.target.value)}
                placeholder="ID trang hoặc kênh"
                style={inputStyle}
              />
            </div>

            {/* Access Token */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Access Token (API)</label>
              <input
                type="text"
                value={connectForm.access_token}
                onChange={(e) => handleConnectChange('access_token', e.target.value)}
                placeholder="Nhập API token..."
                style={inputStyle}
              />
              <small style={{ color: '#666', fontSize: 11 }}>Token sẽ được lưu an toàn. Để trống nếu không muốn thay đổi.</small>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancelConnect}
              style={{ padding: '8px 20px', background: '#333', color: '#ccc', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <X size={14} /> Hủy
            </button>
            <button
              onClick={handleConnect}
              disabled={saving}
              style={{ padding: '8px 20px', background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.6 : 1 }}
            >
              <Save size={14} /> {saving ? 'Đang kết nối...' : 'Kết nối'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-loading-state">
          <div className="spinner-large"></div>
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="admin-platforms-grid">
          {platformConfigs.map((platformConfig) => {
            const connected = platforms.find(p => p.platform?.toLowerCase() === platformConfig.name.toLowerCase());
            const isConnected = connected?.is_connected === true;
            return (
              <div key={platformConfig.name} className={`admin-platform-card ${isConnected ? 'connected' : 'disconnected'}`}>
                <div className="admin-platform-icon" style={{ background: platformConfig.color + '20' }}>
                  <span style={{ fontSize: '32px' }}>{platformConfig.icon}</span>
                </div>
                <div className="admin-platform-info">
                  <h4>{platformConfig.name}</h4>
                  {isConnected ? (
                    <>
                      <p className="connected-text">Đã kết nối</p>
                      {connected.display_name && (
                        <small style={{ color: '#aaa' }}>{connected.display_name}</small>
                      )}
                      <br />
                      <small>Kết nối lúc: {formatDate(connected.connected_at)}</small>
                    </>
                  ) : (
                    <p className="disconnected-text">Chưa kết nối</p>
                  )}
                </div>
                <div className="admin-platform-actions">
                  {isConnected ? (
                    <>
                      <button className="action-btn edit" onClick={() => handleOpenConnect(platformConfig)}>
                        Cập nhật
                      </button>
                      <button className="action-btn delete" onClick={() => handleDisconnect(connected)}>
                        Ngắt kết nối
                      </button>
                    </>
                  ) : (
                    <button className="action-btn edit" onClick={() => handleOpenConnect(platformConfig)}>
                      <Link2 size={14} /> Kết nối
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
