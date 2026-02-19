/**
 * EditProfileModal Component
 * Modal for editing user profile: avatar, name, username, bio
 * Uploads avatar to Supabase Storage 'avatars' bucket
 */

import React, { useState, useRef } from 'react';
import { X, Camera, User, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import './EditProfileModal.css';

export function EditProfileModal({ isOpen, onClose, user, profile, onProfileUpdate }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Kích thước file tối đa 2MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    setError(null);

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Update profile in profiles table
      const updates = {
        full_name: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        updated_at: new Date().toISOString()
      };

      if (avatarUrl !== profile?.avatar_url) {
        updates.avatar_url = avatarUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (onProfileUpdate) {
        onProfileUpdate(updates);
      }
      onClose();
    } catch (err) {
      console.error('[EditProfileModal] Save error:', err);
      setError(err.message || 'Lỗi khi lưu hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-profile-header">
          <h3>Chỉnh sửa hồ sơ</h3>
          <button className="edit-profile-close" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="edit-profile-body">
          {/* Avatar upload */}
          <div className="edit-avatar-section">
            <div
              className="edit-avatar-wrapper"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              title="Nhấn để đổi ảnh đại diện"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="edit-avatar-img" />
              ) : (
                <div className="edit-avatar-placeholder">
                  <User size={32} />
                </div>
              )}
              <div className="edit-avatar-overlay">
                <Camera size={20} />
                <span>Đổi ảnh</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              hidden
            />
          </div>

          {/* Full name */}
          <div className="edit-profile-field">
            <label htmlFor="edit-fullname">Tên hiển thị</label>
            <input
              id="edit-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tên của bạn"
              maxLength={50}
            />
          </div>

          {/* Username */}
          <div className="edit-profile-field">
            <label htmlFor="edit-username">Username</label>
            <input
              id="edit-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              maxLength={30}
            />
          </div>

          {/* Bio */}
          <div className="edit-profile-field">
            <label htmlFor="edit-bio">Giới thiệu</label>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Viết gì đó về bản thân..."
              maxLength={200}
              rows={3}
            />
            <span className="edit-profile-charcount">{bio.length}/200</span>
          </div>

          {error && <div className="edit-profile-error">{error}</div>}
        </div>

        <div className="edit-profile-footer">
          <button
            className="edit-profile-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            className="edit-profile-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={16} className="edit-profile-spinner" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
