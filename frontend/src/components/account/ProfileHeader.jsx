/**
 * ProfileHeader Component
 * Avatar, name, bio, edit button
 * Uses design tokens for consistent styling
 */

import React, { useState } from 'react';
import { Camera, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import './ProfileHeader.css';

export function ProfileHeader({ user, profile, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.full_name || '');
  const [editedBio, setEditedBio] = useState(profile?.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editedName,
          bio: editedBio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Call parent update handler
      if (onProfileUpdate) {
        onProfileUpdate({ full_name: editedName, bio: editedBio });
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Lỗi khi cập nhật hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước file tối đa 2MB');
      return;
    }

    setIsLoading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (onProfileUpdate) {
        onProfileUpdate({ avatar_url: publicUrl });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Lỗi khi tải ảnh đại diện');
    } finally {
      setIsLoading(false);
    }
  };

  const getTierBadge = (tier) => {
    const tiers = {
      FREE: { color: '#7B68EE', label: 'Free' },
      TIER1: { color: '#00D9FF', label: 'Pro' },
      TIER2: { color: '#FFBD59', label: 'Premium' },
      TIER3: { color: '#FFFFFF', label: 'VIP' }
    };
    return tiers[tier] || tiers.FREE;
  };

  const tierInfo = getTierBadge(profile?.scanner_tier || 'FREE');

  return (
    <div className="profile-header-container">
      {/* Avatar Section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'User'}
              className="profile-avatar-img"
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <label className="avatar-upload-btn">
            <Camera size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              hidden
            />
          </label>
        </div>

        {/* Tier Badge */}
        <div className="profile-tier-badge" style={{ borderColor: tierInfo.color }}>
          <span style={{ color: tierInfo.color }}>{tierInfo.label}</span>
        </div>
      </div>

      {/* Info Section */}
      <div className="profile-info-section">
        {isEditing ? (
          <div className="profile-edit-form">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Tên của bạn"
              className="profile-edit-input"
              maxLength={50}
            />
            <textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              placeholder="Giới thiệu ngắn về bản thân..."
              className="profile-edit-textarea"
              maxLength={200}
              rows={2}
            />
            <div className="profile-edit-actions">
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={isLoading}
              >
                <Check size={16} />
                {isLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(profile?.full_name || '');
                  setEditedBio(profile?.bio || '');
                }}
                disabled={isLoading}
              >
                <X size={16} />
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-name-row">
              <h2 className="profile-name">
                {profile?.full_name || user?.email?.split('@')[0] || 'Người dùng'}
              </h2>
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <Edit2 size={14} />
              </button>
            </div>
            <p className="profile-email">{user?.email}</p>
            {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;
