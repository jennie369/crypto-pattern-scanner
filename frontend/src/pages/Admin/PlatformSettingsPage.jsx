import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link2 } from 'lucide-react';

export default function PlatformSettingsPage() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDisconnect = async (id) => {
    if (!confirm('Ngat ket noi nen tang nay?')) return;

    try {
      const { error } = await supabase
        .from('platform_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPlatforms();
    } catch (err) {
      alert('Loi: ' + err.message);
    }
  };

  const platformConfigs = [
    { name: 'Facebook', icon: '\uD83D\uDCD8', color: '#1877F2' },
    { name: 'TikTok', icon: '\uD83C\uDFB5', color: '#000000' },
    { name: 'YouTube', icon: '\uD83D\uDCFA', color: '#FF0000' },
    { name: 'Instagram', icon: '\uD83D\uDCF7', color: '#E4405F' },
    { name: 'Twitter/X', icon: '\uD83D\uDC26', color: '#1DA1F2' },
  ];

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Ket Noi Nen Tang</h2>
      </div>

      {loading ? (
        <div className="admin-loading-state">
          <div className="spinner-large"></div>
          <p>Dang tai...</p>
        </div>
      ) : (
        <div className="admin-platforms-grid">
          {platformConfigs.map((platform) => {
            const connected = platforms.find(p => p.platform_name?.toLowerCase() === platform.name.toLowerCase());
            return (
              <div key={platform.name} className={`admin-platform-card ${connected ? 'connected' : 'disconnected'}`}>
                <div className="admin-platform-icon" style={{ background: platform.color + '20' }}>
                  <span style={{ fontSize: '32px' }}>{platform.icon}</span>
                </div>
                <div className="admin-platform-info">
                  <h4>{platform.name}</h4>
                  {connected ? (
                    <>
                      <p className="connected-text">Da ket noi</p>
                      <small>Ket noi: {new Date(connected.created_at).toLocaleDateString('vi-VN')}</small>
                    </>
                  ) : (
                    <p className="disconnected-text">Chua ket noi</p>
                  )}
                </div>
                <div className="admin-platform-actions">
                  {connected ? (
                    <button className="action-btn delete" onClick={() => handleDisconnect(connected.id)}>
                      Ngat ket noi
                    </button>
                  ) : (
                    <button className="action-btn edit">
                      <Link2 size={14} /> Ket noi
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
