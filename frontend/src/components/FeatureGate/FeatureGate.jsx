import React from 'react'
import { useNavigate } from 'react-router-dom'
import './FeatureGate.css'

export default function FeatureGate({
  requiredTier,
  userTier,
  featureName,
  children
}) {
  const navigate = useNavigate()

  const tierLevels = {
    free: 0,
    tier1: 1,
    tier2: 2,
    tier3: 3
  }

  const hasAccess = tierLevels[userTier] >= tierLevels[requiredTier]

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="feature-gate">
      <div className="gate-overlay">
        <div className="gate-content">
          <span className="gate-icon">🔒</span>
          <h3>Premium Feature</h3>
          <p>
            <strong>{featureName}</strong> requires{' '}
            <span className="required-tier">{requiredTier.toUpperCase()}</span> or higher
          </p>
          <button
            className="btn-upgrade-gate"
            onClick={() => navigate('/pricing')}
          >
            🚀 Upgrade Now
          </button>
        </div>
      </div>
      <div className="gate-blur">
        {children}
      </div>
    </div>
  )
}
