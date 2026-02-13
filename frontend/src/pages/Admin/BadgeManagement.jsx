import React, { useState, useEffect } from 'react';
import { Shield, Award, Search, Filter, Check, X, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import UserBadges from '../../components/UserBadge/UserBadges';
import './BadgeManagement.css';

export default function BadgeManagement() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    verified_seller: false,
    verified_trader: false,
    level_badge: 'bronze',
    role_badge: '',
    achievement_badges: []
  });

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, searchQuery, filterTier]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          avatar_url,
          scanner_tier,
          verified_seller,
          verified_trader,
          level_badge,
          role_badge,
          achievement_badges,
          created_at
        `)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`display_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      // Apply tier filter
      if (filterTier) {
        query = query.eq('scanner_tier', filterTier);
      }

      const { data, error } = await query;

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBadges = (user) => {
    setSelectedUser(user);
    setEditForm({
      verified_seller: user.verified_seller || false,
      verified_trader: user.verified_trader || false,
      level_badge: user.level_badge || 'bronze',
      role_badge: user.role_badge || '',
      achievement_badges: user.achievement_badges || []
    });
    setShowEditModal(true);
  };

  const handleSaveBadges = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          verified_seller: editForm.verified_seller,
          verified_trader: editForm.verified_trader,
          level_badge: editForm.level_badge,
          role_badge: editForm.role_badge || null,
          achievement_badges: editForm.achievement_badges
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      alert('Badges updated successfully!');
      setShowEditModal(false);
      loadUsers(); // Reload to show updated data
    } catch (error) {
      console.error('Error updating badges:', error);
      alert('Failed to update badges');
    }
  };

  const toggleAchievementBadge = (badgeId) => {
    setEditForm(prev => ({
      ...prev,
      achievement_badges: prev.achievement_badges.includes(badgeId)
        ? prev.achievement_badges.filter(id => id !== badgeId)
        : [...prev.achievement_badges, badgeId]
    }));
  };

  const achievementBadgeOptions = [
    'top_trader',
    'high_roller',
    'consistent',
    'perfect_week',
    'comeback_king',
    'risk_taker'
  ];

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <Shield size={64} />
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page badge-management-page">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1><Award size={32} /> Badge Management</h1>
          <p>Manage user badges and verification status</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters card-glass">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
            <option value="">All Tiers</option>
            <option value="FREE">FREE</option>
            <option value="TIER1">TIER 1</option>
            <option value="TIER2">TIER 2</option>
            <option value="TIER3">TIER 3</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table card-glass">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Shield size={48} />
            <p>No users found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Tier</th>
                <th>Badges</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <img
                        src={u.avatar_url || '/default-avatar.png'}
                        alt={u.display_name}
                        className="user-avatar-small"
                      />
                      <span>{u.display_name || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`tier-badge tier-${(u.scanner_tier || 'FREE').toLowerCase()}`}>
                      {u.scanner_tier || 'FREE'}
                    </span>
                  </td>
                  <td>
                    <UserBadges user={u} size="small" maxBadges={3} />
                  </td>
                  <td>
                    <div className="verification-status">
                      {u.verified_seller && (
                        <span className="verified-badge seller">
                          <Check size={14} /> Seller
                        </span>
                      )}
                      {u.verified_trader && (
                        <span className="verified-badge trader">
                          <Check size={14} /> Trader
                        </span>
                      )}
                      {!u.verified_seller && !u.verified_trader && (
                        <span className="not-verified">Not verified</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-action"
                      onClick={() => handleEditBadges(u)}
                      title="Edit badges"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Badges Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content badge-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Badges - {selectedUser.display_name}</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Verification Badges */}
              <div className="form-section">
                <h3><Shield size={20} /> Verification Badges</h3>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.verified_seller}
                    onChange={(e) => setEditForm({ ...editForm, verified_seller: e.target.checked })}
                  />
                  <span>Verified Seller</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.verified_trader}
                    onChange={(e) => setEditForm({ ...editForm, verified_trader: e.target.checked })}
                  />
                  <span>Verified Trader</span>
                </label>
              </div>

              {/* Level Badge */}
              <div className="form-section">
                <h3><Award size={20} /> Level Badge</h3>
                <select
                  value={editForm.level_badge}
                  onChange={(e) => setEditForm({ ...editForm, level_badge: e.target.value })}
                  className="form-select"
                >
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>

              {/* Role Badge */}
              <div className="form-section">
                <h3><Shield size={20} /> Role Badge</h3>
                <select
                  value={editForm.role_badge}
                  onChange={(e) => setEditForm({ ...editForm, role_badge: e.target.value })}
                  className="form-select"
                >
                  <option value="">None</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="mentor">Mentor</option>
                  <option value="partner">Partner</option>
                </select>
              </div>

              {/* Achievement Badges */}
              <div className="form-section">
                <h3><Award size={20} /> Achievement Badges</h3>
                <div className="achievement-badges-grid">
                  {achievementBadgeOptions.map((badge) => (
                    <label key={badge} className="checkbox-label achievement">
                      <input
                        type="checkbox"
                        checked={editForm.achievement_badges.includes(badge)}
                        onChange={() => toggleAchievementBadge(badge)}
                      />
                      <span>{badge.replace(/_/g, ' ').toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="form-section">
                <h3>Preview</h3>
                <div className="badge-preview">
                  <UserBadges
                    user={{
                      ...selectedUser,
                      ...editForm
                    }}
                    size="medium"
                    showLabels={true}
                    maxBadges={10}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveBadges}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
