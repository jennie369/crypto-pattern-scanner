/**
 * Profile Page - Account Section
 * User's personal profile with sidebar navigation
 */

import React, { useState, useEffect } from 'react';
import { User, Trophy, Award, TrendingUp, MessageSquare, Edit, Twitter, Send } from 'lucide-react';
import userProfileService from '../../services/userProfile';
import leaderboardService from '../../services/leaderboard';
import { useAuth } from '../../contexts/AuthContext';
import UserBadges from '../../components/UserBadge/UserBadges';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import './ProfilePage.css';
import './UserProfile_ModalStyles.css';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    twitterHandle: '',
    telegramHandle: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, achievementsData, activityData] = await Promise.all([
        userProfileService.getPublicProfile(user.id),
        leaderboardService.getUserAchievements(user.id),
        userProfileService.getRecentActivity(user.id, 10)
      ]);

      setUserProfile(profileData);
      setAchievements(achievementsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'trade':
        return <TrendingUp size={16} color="#00D9FF" />;
      case 'achievement':
        return <Award size={16} color="#FFBD59" />;
      case 'forum':
        return <MessageSquare size={16} color="#8B5CF6" />;
      default:
        return <User size={16} />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'trade':
        const profit = activity.data.profit_loss;
        return `${profit >= 0 ? 'Thắng' : 'Thua'} $${Math.abs(profit).toFixed(2)} trên ${activity.data.symbol}`;
      case 'achievement':
        return `Mở khóa achievement: ${activity.data.achievements?.name}`;
      case 'forum':
        return `Tạo thread: ${activity.data.title}`;
      default:
        return 'Activity';
    }
  };

  const handleEditProfile = () => {
    // Pre-fill form with current profile data
    setEditForm({
      displayName: profile?.display_name || '',
      bio: userProfile?.bio || '',
      avatarUrl: profile?.avatar_url || '',
      twitterHandle: userProfile?.twitter_handle || '',
      telegramHandle: userProfile?.telegram_handle || ''
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      await userProfileService.updateProfile(user.id, {
        displayName: editForm.displayName,
        bio: editForm.bio,
        avatarUrl: editForm.avatarUrl,
        twitterHandle: editForm.twitterHandle,
        telegramHandle: editForm.telegramHandle
      });

      // Reload profile (local state)
      await loadProfile();

      // Refresh AuthContext profile (global state)
      await refreshProfile();

      setShowEditModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div className="profile-page-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="profile-page-content">
        <div className="error-container">
          <p>Failed to load profile</p>
        </div>
      </div>
    );
  }

  const stats = userProfile.user_stats?.[0] || {};

  return (
    <div className="profile-page-wrapper">
      {/* Profile Content */}
      <div className="profile-page-content">
        <div className="user-profile-container">
          {/* Profile Header */}
          <div className="profile-header card-glass">
            <div className="profile-banner">
              <div className="profile-avatar-section">
                <img
                  src={profile?.avatar_url || '/default-avatar.png'}
                  alt={profile?.display_name}
                  className="profile-avatar"
                />
                {userProfile.rank && (
                  <div className="profile-rank-badge">
                    #{userProfile.rank}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <div className="profile-name-badges">
                  <h1 className="profile-name">{profile?.display_name || 'Anonymous'}</h1>
                  <UserBadges
                    user={profile}
                    size="medium"
                    showLabels={true}
                    maxBadges={5}
                  />
                </div>
                <p className="profile-tier">
                  {profile?.scanner_tier?.toUpperCase() || 'FREE'} •
                  Tham gia {formatDate(profile?.created_at)}
                </p>
                {userProfile.bio && (
                  <p className="profile-bio">{userProfile.bio}</p>
                )}
                {(profile?.twitter_handle || profile?.telegram_handle) && (
                  <div className="social-links">
                    {profile?.twitter_handle && (
                      <a
                        href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                      >
                        <Twitter size={16} />
                        {profile.twitter_handle}
                      </a>
                    )}
                    {profile?.telegram_handle && (
                      <a
                        href={`https://t.me/${profile.telegram_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                      >
                        <Send size={16} />
                        {profile.telegram_handle}
                      </a>
                    )}
                  </div>
                )}
              </div>
              <button className="btn-edit-profile" onClick={handleEditProfile}>
                <Edit size={16} />
                Edit Profile
              </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(0, 217, 255, 0.2)' }}>
                  <TrendingUp size={20} color="#00D9FF" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Trades</p>
                  <h3 className="stat-value">{stats.total_trades || 0}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(0, 255, 136, 0.2)' }}>
                  <Trophy size={20} color="#00FF88" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Win Rate</p>
                  <h3 className="stat-value">{stats.win_rate?.toFixed(2) || 0}%</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(255, 189, 89, 0.2)' }}>
                  <Award size={20} color="#FFBD59" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Profit</p>
                  <h3 className="stat-value">${stats.total_profit?.toFixed(2) || 0}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(255, 107, 157, 0.2)' }}>
                  <Trophy size={20} color="#FF6B9D" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Best Streak</p>
                  <h3 className="stat-value">{stats.best_streak || 0}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                  <User size={20} color="#8B5CF6" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Followers</p>
                  <h3 className="stat-value">{userProfile.followers_count || 0}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                  <MessageSquare size={20} color="#8B5CF6" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Following</p>
                  <h3 className="stat-value">{userProfile.following_count || 0}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-content">
            {/* Achievements */}
            <div className="profile-section card-glass">
              <h2 className="section-title">
                <Award size={24} />
                Achievements ({achievements.length})
              </h2>
              {achievements.length === 0 ? (
                <div className="empty-section">
                  <Award size={48} color="rgba(255, 255, 255, 0.3)" />
                  <p>No achievements yet. Start trading to unlock achievements!</p>
                </div>
              ) : (
                <div className="achievements-grid">
                  {achievements.map((userAch) => (
                    <div key={userAch.id} className={`achievement-card rarity-${userAch.achievements.rarity}`}>
                      <div className="achievement-icon">{userAch.achievements.badge_icon}</div>
                      <h4 className="achievement-name">{userAch.achievements.name}</h4>
                      <p className="achievement-desc">{userAch.achievements.description}</p>
                      <div className="achievement-footer">
                        <span className="achievement-rarity">{userAch.achievements.rarity}</span>
                        <span className="achievement-points">+{userAch.achievements.points} pts</span>
                      </div>
                      <span className="achievement-date">
                        {formatDate(userAch.unlocked_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="profile-section card-glass">
              <h2 className="section-title">
                <TrendingUp size={24} />
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <div className="empty-section">
                  <TrendingUp size={48} color="rgba(255, 255, 255, 0.3)" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{getActivityText(activity)}</p>
                        <span className="activity-time">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Modal */}
          {showEditModal && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Edit Profile</h2>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      placeholder="Your display name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>Avatar Image</label>
                    <ImageUpload
                      currentImageUrl={editForm.avatarUrl}
                      onUploadComplete={(url) => setEditForm({ ...editForm, avatarUrl: url })}
                      onRemove={() => setEditForm({ ...editForm, avatarUrl: '' })}
                      bucket="avatars"
                      folder="user-avatars"
                    />
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                      Upload your profile picture (PNG, JPG, GIF or WebP, max 5MB)
                    </p>
                  </div>

                  <div className="form-group">
                    <label>Twitter Handle</label>
                    <input
                      type="text"
                      value={editForm.twitterHandle}
                      onChange={(e) => setEditForm({ ...editForm, twitterHandle: e.target.value })}
                      placeholder="@username"
                    />
                  </div>

                  <div className="form-group">
                    <label>Telegram Handle</label>
                    <input
                      type="text"
                      value={editForm.telegramHandle}
                      onChange={(e) => setEditForm({ ...editForm, telegramHandle: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
