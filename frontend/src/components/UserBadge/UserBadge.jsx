import React from 'react';
import {
  ShieldCheck,
  BadgeCheck,
  User,
  Zap,
  Crown,
  Sparkles,
  TrendingUp,
  Gem,
  Shield,
  GraduationCap,
  Trophy,
  Target,
  Activity,
  DollarSign,
  Rocket
} from 'lucide-react';
import './UserBadge.css';

const UserBadge = ({
  type,
  value,
  size = 'small',
  showLabel = false,
  className = ''
}) => {

  // Badge configuration mapping
  const badgeConfig = {
    // Verification
    verified_seller: {
      Icon: ShieldCheck,
      label: 'Verified',
      color: '#00FF88',
      bgGradient: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.05) 100%)',
      animation: 'pulse-glow',
      tooltip: 'Người bán đã xác minh'
    },
    verified_trader: {
      Icon: BadgeCheck,
      label: 'Verified',
      color: '#3B82F6',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
      animation: 'pulse-glow',
      tooltip: 'Trader đã xác minh'
    },

    // Tiers
    tier_free: {
      Icon: User,
      label: 'FREE',
      color: '#6B7280',
      bgGradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(156, 163, 175, 0.05) 100%)',
      animation: 'none'
    },
    tier_1: {
      Icon: Zap,
      label: 'PRO',
      color: '#FFFFFF',
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      animation: 'shimmer',
      tooltip: 'TIER 1 - PRO'
    },
    tier_2: {
      Icon: Crown,
      label: 'PREMIUM',
      color: '#FFFFFF',
      bgGradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      animation: 'shimmer-rotate',
      tooltip: 'TIER 2 - PREMIUM'
    },
    tier_3: {
      Icon: Sparkles,
      label: 'VIP',
      color: '#FFFFFF',
      bgGradient: 'linear-gradient(135deg, #FFBD59 0%, #9C0612 100%)',
      animation: 'premium-glow',
      tooltip: 'TIER 3 - VIP'
    },

    // Levels
    bronze: {
      Icon: TrendingUp,
      label: 'Bronze',
      color: '#CD7F32',
      bgGradient: 'linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.1) 100%)',
      animation: 'none',
      tooltip: 'Bronze Trader'
    },
    silver: {
      Icon: TrendingUp,
      label: 'Silver',
      color: '#C0C0C0',
      bgGradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(192, 192, 192, 0.1) 100%)',
      animation: 'subtle-shine',
      tooltip: 'Silver Trader'
    },
    gold: {
      Icon: TrendingUp,
      label: 'Gold',
      color: '#FFD700',
      bgGradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)',
      animation: 'gold-shine',
      tooltip: 'Gold Trader'
    },
    diamond: {
      Icon: Gem,
      label: 'Diamond',
      color: '#B9F2FF',
      bgGradient: 'linear-gradient(135deg, rgba(185, 242, 255, 0.3) 0%, rgba(185, 242, 255, 0.1) 100%)',
      animation: 'diamond-sparkle',
      tooltip: 'Diamond Trader'
    },

    // Roles
    admin: {
      Icon: Shield,
      label: 'ADMIN',
      color: '#EF4444',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
      animation: 'admin-pulse',
      tooltip: 'Administrator'
    },
    moderator: {
      Icon: ShieldCheck,
      label: 'MOD',
      color: '#F59E0B',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
      animation: 'subtle-glow',
      tooltip: 'Moderator'
    },
    instructor: {
      Icon: GraduationCap,
      label: 'INSTRUCTOR',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
      animation: 'none',
      tooltip: 'Instructor'
    },

    // Achievements
    top_trader: {
      Icon: Trophy,
      label: 'Top 10',
      color: '#FFFFFF',
      bgGradient: 'linear-gradient(135deg, #FFBD59 0%, #FFA500 100%)',
      animation: 'trophy-shine',
      tooltip: 'Top 10 Trader'
    },
    pattern_master: {
      Icon: Target,
      label: 'Pattern Master',
      color: '#8B5CF6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
      animation: 'target-pulse',
      tooltip: 'Pattern Master'
    },
    consistent_trader: {
      Icon: Activity,
      label: 'Consistent',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
      animation: 'heartbeat',
      tooltip: 'Consistent Trader'
    },
    high_roller: {
      Icon: DollarSign,
      label: 'High Roller',
      color: '#FFFFFF',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      animation: 'money-rain',
      tooltip: 'High Roller'
    },
    early_adopter: {
      Icon: Rocket,
      label: 'Early Adopter',
      color: '#6366F1',
      bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)',
      animation: 'rocket-launch',
      tooltip: 'Early Adopter'
    }
  };

  const config = badgeConfig[value] || badgeConfig[type];
  if (!config) return null;

  const { Icon, label, color, bgGradient, animation, tooltip } = config;

  // Size mapping
  const sizeMap = {
    tiny: { height: 20, padding: '2px 6px', fontSize: 10, iconSize: 12 },
    small: { height: 24, padding: '4px 8px', fontSize: 11, iconSize: 14 },
    medium: { height: 28, padding: '6px 12px', fontSize: 13, iconSize: 16 },
    large: { height: 36, padding: '8px 16px', fontSize: 14, iconSize: 18 }
  };

  const sizeConfig = sizeMap[size] || sizeMap.small;

  return (
    <span
      className={`user-badge user-badge-${size} badge-${animation} ${className}`}
      style={{
        color: color,
        background: bgGradient,
        height: `${sizeConfig.height}px`,
        padding: sizeConfig.padding,
        fontSize: `${sizeConfig.fontSize}px`
      }}
      title={tooltip || label}
    >
      <Icon
        size={sizeConfig.iconSize}
        strokeWidth={2.5}
        className="badge-icon"
      />
      {showLabel && <span className="badge-label">{label}</span>}
    </span>
  );
};

export default UserBadge;
