import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Bot,
  FileText,
} from 'lucide-react';

export default function SeedContentPage() {
  const [seedUsers, setSeedUsers] = useState([]);
  const [seedPosts, setSeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('users');

  useEffect(() => {
    loadSeedData();
  }, []);

  const loadSeedData = async () => {
    try {
      setLoading(true);

      const { data: users, error: usersError } = await supabase
        .from('seed_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!usersError) setSeedUsers(users || []);

      const { data: posts, error: postsError } = await supabase
        .from('seed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!postsError) setSeedPosts(posts || []);
    } catch (err) {
      console.error('Error loading seed data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeedUser = async (id) => {
    if (!confirm('Xoa seed user nay?')) return;

    try {
      const { error } = await supabase
        .from('seed_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadSeedData();
    } catch (err) {
      alert('Loi: ' + err.message);
    }
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <h2>Quan Ly Seed Content</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            Seed Users ({seedUsers.length})
          </button>
          <button
            className={`filter-btn ${activeSection === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveSection('posts')}
          >
            Seed Posts ({seedPosts.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-state">
          <div className="spinner-large"></div>
          <p>Dang tai...</p>
        </div>
      ) : activeSection === 'users' ? (
        seedUsers.length === 0 ? (
          <div className="admin-empty-state">
            <Bot size={48} />
            <h3>Chua co seed users</h3>
            <p>Tao seed users cho AI bot</p>
          </div>
        ) : (
          <div className="admin-seed-users-list">
            {seedUsers.map((user) => (
              <div key={user.id} className="admin-seed-user-card">
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.display_name} />
                  ) : (
                    user.display_name?.charAt(0) || '?'
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name">{user.display_name}</div>
                  <div className="user-email">@{user.username}</div>
                  <small>Posts: {user.post_count || 0}</small>
                </div>
                <div className="actions-cell">
                  <button className="action-btn edit">Sua</button>
                  <button className="action-btn delete" onClick={() => handleDeleteSeedUser(user.id)}>Xoa</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        seedPosts.length === 0 ? (
          <div className="admin-empty-state">
            <FileText size={48} />
            <h3>Chua co seed posts</h3>
            <p>Tao seed posts cho forum</p>
          </div>
        ) : (
          <div className="admin-seed-posts-list">
            {seedPosts.map((post) => (
              <div key={post.id} className="admin-seed-post-card">
                <div className="post-content">
                  <p>{post.content?.substring(0, 150)}...</p>
                  <div className="post-meta">
                    <small>
                      Likes: {post.like_count || 0} | Comments: {post.comment_count || 0}
                    </small>
                    <small>{new Date(post.created_at).toLocaleDateString('vi-VN')}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
