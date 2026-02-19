import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import forumService from '../../services/forum';
import { supabase } from '../../lib/supabaseClient';
import {
  ArrowLeft, UserPlus, UserMinus, MessageCircle, MoreVertical,
  Flag, UserX, FileText, Heart, Bookmark, Loader2, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import PostCard from './components/PostCard';
import './UserProfile.css';

/**
 * UserProfile Page — View a forum user's profile
 * Route: /forum/user/:userId
 */
export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('posts');
  const [tabPosts, setTabPosts] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Menu
  const [showMenu, setShowMenu] = useState(false);

  const isOwnProfile = user?.id === userId;

  // Load profile
  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  // Load tab data when tab changes
  useEffect(() => {
    if (profile) loadTabData();
  }, [activeTab, profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, bio, avatar_url, scanner_tier, role, created_at')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profileData) {
        setError('Người dùng không tồn tại');
        return;
      }
      setProfile(profileData);

      // Fetch stats in parallel
      const [postsRes, followersRes, followingRes, followCheckRes] = await Promise.all([
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'published'),
        supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
        user ? supabase.from('user_follows').select('id').eq('follower_id', user.id).eq('following_id', userId).maybeSingle() : Promise.resolve({ data: null })
      ]);

      setPostsCount(postsRes.count || 0);
      setFollowersCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
      setIsFollowing(!!followCheckRes.data);

    } catch (err) {
      console.error('[UserProfile] Load error:', err);
      setError('Không thể tải hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      setTabLoading(true);
      let posts = [];

      if (activeTab === 'posts') {
        const { data } = await supabase
          .from('forum_posts')
          .select(`*, author:profiles(id, full_name, avatar_url, scanner_tier, role)`)
          .eq('user_id', userId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(30);
        posts = (data || []).map(p => ({
          ...p,
          users: p.author ? { display_name: p.author.full_name, avatar_url: p.author.avatar_url } : null,
          like_count: p.likes_count || 0,
          reply_count: p.comments_count || 0
        }));
      } else if (activeTab === 'liked') {
        const { data } = await supabase
          .from('forum_likes')
          .select(`post:forum_posts(*, author:profiles(id, full_name, avatar_url, scanner_tier, role))`)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(30);
        posts = (data || [])
          .filter(d => d.post)
          .map(d => ({
            ...d.post,
            users: d.post.author ? { display_name: d.post.author.full_name, avatar_url: d.post.author.avatar_url } : null,
            like_count: d.post.likes_count || 0,
            reply_count: d.post.comments_count || 0
          }));
      } else if (activeTab === 'saved') {
        const { data } = await supabase
          .from('forum_saved')
          .select(`post:forum_posts(*, author:profiles(id, full_name, avatar_url, scanner_tier, role))`)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(30);
        posts = (data || [])
          .filter(d => d.post)
          .map(d => ({
            ...d.post,
            users: d.post.author ? { display_name: d.post.author.full_name, avatar_url: d.post.author.avatar_url } : null,
            like_count: d.post.likes_count || 0,
            reply_count: d.post.comments_count || 0
          }));
      }

      setTabPosts(posts);
    } catch (err) {
      console.error('[UserProfile] Tab load error:', err);
    } finally {
      setTabLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, following_id: userId });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('[UserProfile] Follow error:', err);
    }
  };

  const getTierLabel = (tier) => {
    const tiers = { free: 'Free', tier1: 'Starter', tier2: 'Premium', tier3: 'VIP' };
    return tiers[tier] || 'Free';
  };

  const getTierClass = (tier) => {
    return `tier-badge tier-${tier || 'free'}`;
  };

  // Loading
  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-loading">
          <Loader2 size={40} className="spinner-icon" />
          <p>Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-error">
          <AlertCircle size={48} />
          <p>{error}</p>
          <button className="btn-back" onClick={() => navigate('/forum')}>
            <ArrowLeft size={18} />
            Quay lại Forum
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.display_name || profile.full_name || 'Ẩn danh';

  return (
    <div className="user-profile-page">
      {/* Back */}
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Quay lại</span>
      </button>

      {/* Cover + Avatar */}
      <div className="profile-cover">
        <div className="cover-gradient" />
      </div>

      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} className="profile-avatar" />
          ) : (
            <div className="profile-avatar placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-name-row">
            <h1 className="profile-name">{displayName}</h1>
            <span className={getTierClass(profile.scanner_tier)}>
              {getTierLabel(profile.scanner_tier)}
            </span>
          </div>

          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{postsCount}</span>
              <span className="stat-label">Bài viết</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{followersCount}</span>
              <span className="stat-label">Người theo dõi</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{followingCount}</span>
              <span className="stat-label">Đang theo dõi</span>
            </div>
          </div>

          {/* Action buttons */}
          {!isOwnProfile && (
            <div className="profile-actions">
              <button
                className={`btn-follow ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? (
                  <><UserMinus size={16} /><span>Bỏ theo dõi</span></>
                ) : (
                  <><UserPlus size={16} /><span>Theo dõi</span></>
                )}
              </button>

              <button className="btn-message" onClick={() => navigate('/messages')}>
                <MessageCircle size={16} />
                <span>Nhắn tin</span>
              </button>

              <div className="profile-menu-wrapper">
                <button className="btn-more" onClick={() => setShowMenu(!showMenu)}>
                  <MoreVertical size={18} />
                </button>
                {showMenu && (
                  <div className="profile-menu-dropdown">
                    <button onClick={() => { setShowMenu(false); alert('Đã báo cáo người dùng'); }}>
                      <Flag size={14} /> Báo cáo
                    </button>
                    <button onClick={() => { setShowMenu(false); alert('Đã chặn người dùng'); }}>
                      <UserX size={14} /> Chặn
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FileText size={16} />
          <span>Bài viết</span>
        </button>
        <button
          className={`profile-tab ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          <Heart size={16} />
          <span>Đã thích</span>
        </button>
        {isOwnProfile && (
          <button
            className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <Bookmark size={16} />
            <span>Đã lưu</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="profile-feed">
        {tabLoading ? (
          <div className="tab-loading">
            <Loader2 size={32} className="spinner-icon" />
            <p>Đang tải...</p>
          </div>
        ) : tabPosts.length === 0 ? (
          <div className="tab-empty">
            {activeTab === 'posts' && <p>Chưa có bài viết nào</p>}
            {activeTab === 'liked' && <p>Chưa thích bài viết nào</p>}
            {activeTab === 'saved' && <p>Chưa lưu bài viết nào</p>}
          </div>
        ) : (
          <div className="tab-posts">
            {tabPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
