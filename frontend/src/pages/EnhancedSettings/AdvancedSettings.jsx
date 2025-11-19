/**
 * Advanced Settings Component
 * - API key management
 * - Beta features toggle
 * - Debug mode (Tier 3 only)
 */

import React, { useState } from 'react';
import { Save, Sparkles, CheckCircle, AlertTriangle, Key, Copy, Ban, Trash2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { generateApiKey, revokeApiKey, deleteApiKey } from '../../services/settingsService';

const AdvancedSettings = ({ user, profile, settings, apiKeys, onUpdate, onRefreshApiKeys, saving, showToast }) => {
  const { t } = useTranslation();
  const [advanced, setAdvanced] = useState({
    betaFeatures: settings?.advanced?.betaFeatures || false,
    debugMode: settings?.advanced?.debugMode || false,
  });

  // API Key generation state
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleToggle = (key) => {
    setAdvanced((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    const result = await onUpdate({
      advanced,
    });

    if (result.success) {
      showToast('Advanced settings saved!', 'success');
    }
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      showToast('Please enter a name for the API key', 'error');
      return;
    }

    setGenerating(true);
    try {
      const result = await generateApiKey(user.id, newKeyName.trim());

      if (result.success) {
        setGeneratedKey(result.data);
        setNewKeyName('');
        showToast('API key generated successfully!', 'success');
        await onRefreshApiKeys();
      } else {
        showToast('Failed to generate API key', 'error');
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      showToast('Failed to generate API key', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    showToast('API key copied to clipboard!', 'success');
  };

  const handleRevokeKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to revoke this API key?')) {
      return;
    }

    try {
      const result = await revokeApiKey(keyId);

      if (result.success) {
        showToast('API key revoked successfully!', 'success');
        await onRefreshApiKeys();
      } else {
        showToast('Failed to revoke API key', 'error');
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      showToast('Failed to revoke API key', 'error');
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to permanently delete this API key?')) {
      return;
    }

    try {
      const result = await deleteApiKey(keyId);

      if (result.success) {
        showToast('API key deleted successfully!', 'success');
        await onRefreshApiKeys();
      } else {
        showToast('Failed to delete API key', 'error');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      showToast('Failed to delete API key', 'error');
    }
  };

  return (
    <div className="advanced-settings-page">
      {/* Beta Features */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title">⚗️ Experimental Features</h2>
        <p className="section-desc">Enable early access to beta features</p>

        <div className="notification-settings" style={{ marginTop: '24px' }}>
          <div className="notification-item">
            <div className="notification-info">
              <div className="notification-icon">🧪</div>
              <div className="notification-text">
                <div className="notification-title">Beta Features</div>
                <div className="notification-desc">Try new features before official release</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={advanced.betaFeatures}
                onChange={() => handleToggle('betaFeatures')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Debug Mode - Tier 3 Only */}
          <div className="notification-item" style={{ opacity: profile?.tier === 'tier3' ? 1 : 0.5 }}>
            <div className="notification-info">
              <div className="notification-icon">🐛</div>
              <div className="notification-text">
                <div className="notification-title">
                  Debug Mode
                  {profile?.tier !== 'tier3' && (
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '11px',
                        padding: '2px 8px',
                        background: 'rgba(255, 189, 89, 0.2)',
                        border: '1px solid rgba(255, 189, 89, 0.4)',
                        borderRadius: '4px',
                        color: '#FFBD59',
                      }}
                    >
                      Tier 3 Only
                    </span>
                  )}
                </div>
                <div className="notification-desc">Show detailed debug information</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={advanced.debugMode}
                onChange={() => handleToggle('debugMode')}
                disabled={profile?.tier !== 'tier3'}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Advanced Settings'}
          </button>
        </div>
      </div>

      {/* API Keys Management */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={24} /> API Keys
            </h2>
            <p className="section-desc">Manage your API keys for external integrations</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowCreateKeyModal(true)}
            style={{ padding: '10px 20px' }}
          >
            ➕ Generate New Key
          </button>
        </div>

        {/* API Keys List */}
        <div style={{ marginTop: '24px' }}>
          {apiKeys && apiKeys.length > 0 ? (
            <div className="api-keys-list">
              {apiKeys.map((key) => (
                <div key={key.id} className="api-key-card" style={{
                  padding: '20px',
                  background: 'rgba(17, 34, 80, 0.4)',
                  border: key.is_active
                    ? '1px solid rgba(0, 255, 136, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'rgba(255, 255, 255, 0.9)' }}>
                        {key.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          padding: '8px 12px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '6px',
                          display: 'inline-block',
                          marginBottom: '12px',
                          color: '#FFBD59',
                        }}
                      >
                        {key.key_preview}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                        Created: {new Date(key.created_at).toLocaleDateString()} •
                        Status:{' '}
                        <span style={{ color: key.is_active ? '#00FF88' : '#EF4444' }}>
                          {key.is_active ? '🟢 Active' : '🔴 Revoked'}
                        </span>
                        {key.last_used_at && (
                          <> • Last used: {new Date(key.last_used_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {key.is_active && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleRevokeKey(key.id)}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          🚫 Revoke
                        </button>
                      )}
                      <button
                        className="btn-danger-small"
                        onClick={() => handleDeleteKey(key.id)}
                        style={{
                          fontSize: '12px',
                          padding: '6px 12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid #EF4444',
                          borderRadius: '6px',
                          color: '#EF4444',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                <Key size={48} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No API keys yet. Generate one to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateKeyModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => !generatedKey && setShowCreateKeyModal(false)}
        >
          <div
            className="card-glass"
            style={{
              maxWidth: '500px',
              width: '90%',
              padding: '32px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={24} />
              {generatedKey ? 'API Key Generated' : 'Generate New API Key'}
            </h2>

            {!generatedKey ? (
              <>
                <p className="section-desc" style={{ marginBottom: '24px' }}>
                  Enter a name to identify this API key
                </p>

                <div className="form-group">
                  <label>Key Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g., Production API, Mobile App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    disabled={generating}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    className="btn-primary"
                    onClick={handleGenerateKey}
                    disabled={generating || !newKeyName.trim()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Sparkles size={16} />
                    {generating ? 'Generating...' : 'Generate Key'}
                  </button>
                  <button className="btn-secondary" onClick={() => setShowCreateKeyModal(false)} disabled={generating}>
                    ✖️ Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(255, 189, 89, 0.1)',
                    border: '2px solid rgba(255, 189, 89, 0.4)',
                    borderRadius: '12px',
                    marginTop: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#FFBD59', marginBottom: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} />
                    Save this key now! You won&apos;t be able to see it again.
                  </p>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '6px',
                      wordBreak: 'break-all',
                      color: '#00FF88',
                      marginBottom: '12px',
                    }}
                  >
                    {generatedKey.key}
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => handleCopyKey(generatedKey.key)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Copy size={16} /> Copy Key
                  </button>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setGeneratedKey(null);
                    setShowCreateKeyModal(false);
                  }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <CheckCircle size={16} /> Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;
