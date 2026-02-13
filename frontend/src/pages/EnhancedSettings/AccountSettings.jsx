/**
 * Account Settings Component
 * - Profile information display
 * - Password change
 * - Account deletion (danger zone)
 */

import React, { useState } from 'react';
import { Lock, AlertTriangle, Trash2, Edit, Save, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { changePassword, requestAccountDeletion, updateProfile } from '../../services/settingsService';

const AccountSettings = ({ user, profile, onRefresh, showToast }) => {
  const { t } = useTranslation();

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
  });

  // Account deletion state
  const [deletionForm, setDeletionForm] = useState({
    password: '',
    confirmation: '',
  });
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);

      if (result.success) {
        showToast('Password changed successfully!', 'success');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        showToast(result.error?.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!profileForm.full_name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    try {
      const result = await updateProfile(user.id, {
        full_name: profileForm.full_name.trim(),
      });

      if (result.success) {
        showToast('Profile updated successfully!', 'success');
        setEditingProfile(false);
        await onRefresh();
      } else {
        showToast(result.error?.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  // Handle account deletion
  const handleAccountDeletion = async (e) => {
    e.preventDefault();

    // Validation
    if (!deletionForm.password) {
      showToast('Please enter your password', 'error');
      return;
    }

    if (deletionForm.confirmation !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone after 30 days.')) {
      return;
    }

    setDeletingAccount(true);
    try {
      const result = await requestAccountDeletion(user.id, deletionForm.password);

      if (result.success) {
        showToast('Account deletion scheduled. You have 30 days to cancel.', 'success');
        setDeletionForm({ password: '', confirmation: '' });
      } else {
        showToast(result.error?.message || 'Failed to delete account', 'error');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('Failed to delete account', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="account-settings">
      {/* Profile Information */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title">👤 Profile Information</h2>
        <p className="section-desc">View and edit your profile details</p>

        <div className="profile-details" style={{ marginTop: '24px' }}>
          {!editingProfile ? (
            <>
              <div className="profile-item">
                <span className="profile-label">{t('email')}:</span>
                <span className="profile-value">{user.email}</span>
              </div>

              <div className="profile-item">
                <span className="profile-label">{t('fullName')}:</span>
                <span className="profile-value">{profile?.full_name || 'N/A'}</span>
              </div>

              <div className="profile-item">
                <span className="profile-label">{t('accountTier')}:</span>
                <span className={`profile-tier ${profile?.scanner_tier?.toLowerCase() || 'free'}`}>
                  {!profile?.scanner_tier || profile?.scanner_tier === 'FREE' ? '🆓' : '💎'} {profile?.scanner_tier?.toUpperCase() || 'FREE'}
                </span>
              </div>

              <div className="profile-item">
                <span className="profile-label">{t('role') || 'Role'}:</span>
                <span className={`profile-role ${profile?.role || 'user'}`}>
                  {profile?.role === 'admin' ? '👑' : '👤'} {profile?.role?.toUpperCase() || 'USER'}
                </span>
              </div>

              {profile?.scanner_tier && profile?.scanner_tier !== 'FREE' && profile?.scanner_tier_expires_at && (
                <div className="profile-item">
                  <span className="profile-label">{t('tierExpires')}:</span>
                  <span className="profile-value">
                    {new Date(profile.scanner_tier_expires_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              <button
                className="btn-secondary"
                style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  setEditingProfile(true);
                  setProfileForm({ full_name: profile?.full_name || '' });
                }}
              >
                <Edit size={16} /> Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>{t('fullName')}</label>
                <input
                  type="text"
                  className="auth-input"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> Save Changes
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => setEditingProfile(false)}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Password Change */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title">🔒 Change Password</h2>
        <p className="section-desc">Update your account password</p>

        <form onSubmit={handlePasswordChange} style={{ marginTop: '24px' }}>
          <div className="form-group">
            <label>{t('currentPassword') || 'Current Password'}</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              disabled={changingPassword}
            />
          </div>

          <div className="form-group">
            <label>{t('newPassword') || 'New Password'}</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              disabled={changingPassword}
            />
          </div>

          <div className="form-group">
            <label>{t('confirmPassword') || 'Confirm New Password'}</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              disabled={changingPassword}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={changingPassword} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} />
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div
        className="card-glass danger-zone"
        style={{
          marginBottom: '24px',
          padding: '32px',
          borderColor: 'rgba(239, 68, 68, 0.4)',
        }}
      >
        <h2 className="section-title" style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={24} /> Danger Zone
        </h2>
        <p className="section-desc">Irreversible account actions</p>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#EF4444', marginBottom: '8px' }}>
            Delete Account
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '16px' }}>
            Once you delete your account, there is no going back. You will have 30 days to cancel
            the deletion.
          </p>

          <form onSubmit={handleAccountDeletion}>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Enter your password"
                value={deletionForm.password}
                onChange={(e) => setDeletionForm({ ...deletionForm, password: e.target.value })}
                disabled={deletingAccount}
              />
            </div>

            <div className="form-group">
              <label>Type DELETE to confirm</label>
              <input
                type="text"
                className="auth-input"
                placeholder="DELETE"
                value={deletionForm.confirmation}
                onChange={(e) => setDeletionForm({ ...deletionForm, confirmation: e.target.value })}
                disabled={deletingAccount}
              />
            </div>

            <button
              type="submit"
              className="btn-danger"
              disabled={deletingAccount}
              style={{
                padding: '12px 24px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid #EF4444',
                borderRadius: '12px',
                color: '#EF4444',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <Trash2 size={16} style={{ marginRight: '8px' }} />
              {deletingAccount ? 'Deleting...' : 'Delete My Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
