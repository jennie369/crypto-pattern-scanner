import React from 'react';
import { Activity } from 'lucide-react';

export default function SystemPage() {
  return (
    <div className="tab-content">
      <h2>System Information</h2>

      <div className="system-info">
        <div className="info-row">
          <span className="info-label">Supabase Status:</span>
          <span className="info-value status-online"><Activity size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#0ECB81' }} />Connected</span>
        </div>
        <div className="info-row">
          <span className="info-label">Database:</span>
          <span className="info-value status-online"><Activity size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#0ECB81' }} />PostgreSQL</span>
        </div>
        <div className="info-row">
          <span className="info-label">Environment:</span>
          <span className="info-value">{import.meta.env.MODE}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Version:</span>
          <span className="info-value">v2.0.0 (with Admin Panel)</span>
        </div>
        <div className="info-row">
          <span className="info-label">Last Update:</span>
          <span className="info-value">{new Date().toLocaleString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
}
