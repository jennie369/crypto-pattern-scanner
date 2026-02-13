import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Rocket } from 'lucide-react'
import './FeatureGate.css'

export default function FeatureGate({
  requiredTier,
  userTier,
  featureName,
  children,
  profile // Add profile prop for role check
}) {
  const navigate = useNavigate()

  // ⚡ ADMIN BYPASS - Admin has unlimited access to ALL features
  const isAdmin = profile?.role === 'admin' ||
                  profile?.role === 'ADMIN' ||
                  profile?.is_admin === true ||
                  userTier === 'admin' ||
                  userTier === 'ADMIN'

  // ⚡ MANAGER BYPASS - Manager has unlimited access to ALL features
  const isManager = profile?.role === 'manager' ||
                    profile?.role === 'MANAGER' ||
                    userTier === 'manager' ||
                    userTier === 'MANAGER'

  if (isAdmin || isManager) {
    console.log(`✅ [FeatureGate] ${isAdmin ? 'Admin' : 'Manager'} bypass - Full access granted for ${featureName}`)
    return <>{children}</>
  }

  const tierLevels = {
    free: 0,
    tier1: 1,
    tier2: 2,
    tier3: 3
  }

  const normalizedUserTier = (userTier || 'free').toLowerCase()
  const normalizedRequiredTier = (requiredTier || 'free').toLowerCase()
  const hasAccess = (tierLevels[normalizedUserTier] || 0) >= (tierLevels[normalizedRequiredTier] || 0)

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="feature-gate">
      <div className="gate-overlay">
        <div className="gate-content">
          <span className="gate-icon"><Lock size={48} /></span>
          <h3>Premium Feature</h3>
          <p>
            <strong>{featureName}</strong> requires{' '}
            <span className="required-tier">{requiredTier.toUpperCase()}</span> or higher
          </p>
          <button
            className="btn-upgrade-gate"
            onClick={() => navigate('/pricing')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Rocket size={16} /> Upgrade Now
          </button>
        </div>
      </div>
      <div className="gate-blur">
        {children}
      </div>
    </div>
  )
}
