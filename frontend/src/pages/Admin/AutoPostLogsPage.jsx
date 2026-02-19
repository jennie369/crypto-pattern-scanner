import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Send,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

export default function AutoPostLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auto_post_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error) {
        setLogs(data || []);
      }
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Nhat Ky Auto-Post</h2>
        <button className="add-user-btn" onClick={loadLogs}>
          <RefreshCw size={16} /> Lam Moi
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-state">
          <div className="spinner-large"></div>
          <p>Dang tai logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="admin-empty-state">
          <Send size={48} />
          <h3>Chua co log nao</h3>
          <p>Lich su dang bai tu dong se hien thi o day</p>
        </div>
      ) : (
        <div className="admin-logs-list">
          {logs.map((log) => (
            <div key={log.id} className={`admin-log-item ${log.status}`}>
              <div className="admin-log-icon">
                {log.status === 'success' ? (
                  <CheckCircle size={20} color="#0ECB81" />
                ) : log.status === 'failed' ? (
                  <XCircle size={20} color="#F6465D" />
                ) : (
                  <Clock size={20} color="#F0B90B" />
                )}
              </div>
              <div className="admin-log-content">
                <strong>{log.platform || 'Unknown'}</strong>
                <p>{log.message || log.error_message || 'No message'}</p>
                <small>{new Date(log.created_at).toLocaleString('vi-VN')}</small>
              </div>
              <span className={`status-badge ${log.status}`}>{log.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
