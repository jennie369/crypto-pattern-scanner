import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import UpgradePrompt from '../UpgradePrompt/UpgradePrompt'
import './TierGuard.css'

/**
 * TierGuard Component
 *
 * Access control for TIER 2 features
 * Checks user's scanner_tier and course_tier, takes MAX of both
 *
 * Tier Levels:
 * - free: 0
 * - pro (tier1): 1
 * - premium (tier2): 2
 * - vip (tier3): 3
 *
 * Usage:
 * <TierGuard requiredTier="premium" featureName="Portfolio Tracker">
 *   <PortfolioTracker />
 * </TierGuard>
 *
 * @param {React.ReactNode} children - Component to render if user has access
 * @param {string} requiredTier - Required tier ('free', 'pro', 'premium', 'vip')
 * @param {string} featureName - Name of the feature being protected
 */
export default function TierGuard({
  children,
  requiredTier = 'premium',
  featureName = 'Advanced Tools'
}) {
  const { profile, loading } = useAuth()

  // Tier level mapping (case-insensitive support)
  const tierLevels = {
    // Standard tier values (case-insensitive)
    'FREE': 0,
    'TIER1': 1,
    'TIER2': 2,
    'TIER3': 3,

    // Lowercase variants
    'free': 0,
    'tier1': 1,
    'tier2': 2,
    'tier3': 3,

    // Legacy support (old system)
    'pro': 1,
    'premium': 2,
    'vip': 3,

    // Default
    'undefined': 0,
    'null': 0
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="tier-guard-loading">
        <div className="loading-spinner"></div>
        <p>Checking access...</p>
      </div>
    )
  }

  // ✅ CHECK: If no profile after loading completes
  if (!profile) {
    return (
      <div className="tier-guard-error">
        <div className="error-icon"><AlertTriangle size={48} /></div>
        <p className="error-message">Cannot load account information. Please try logging in again.</p>
        <button
          className="btn-retry"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={18} /> Reload Page
        </button>
      </div>
    )
  }

  // Normalize tier values (handle case-sensitivity and whitespace)
  const normalizeTier = (tier) => {
    if (!tier) return 'FREE'
    return String(tier).trim().toUpperCase()
  }

  // ✅ NEW LOGIC: Check MAX(course_tier, scanner_tier)
  // Scanner tools unlock by:
  // - Buying course bundle (course_tier), OR
  // - Buying scanner only (scanner_tier)
  // → Take the HIGHER tier
  const courseTier = normalizeTier(profile?.course_tier)
  const scannerTier = normalizeTier(profile?.scanner_tier)
  const requiredTierNormalized = normalizeTier(requiredTier)

  const courseTierLevel = tierLevels[courseTier] || 0
  const scannerTierLevel = tierLevels[scannerTier] || 0
  const userTierLevel = Math.max(courseTierLevel, scannerTierLevel)
  const requiredTierLevel = tierLevels[requiredTierNormalized] || 2

  // Enhanced debug logging
  console.log('═══ TIER GUARD DEBUG (FIXED) ═══')
  console.log('Page:', window.location.pathname)
  console.log('Feature:', featureName)
  console.log('Raw Course Tier:', profile?.course_tier)
  console.log('Normalized Course Tier:', courseTier, '→', courseTierLevel)
  console.log('Raw Scanner Tier:', profile?.scanner_tier)
  console.log('Normalized Scanner Tier:', scannerTier, '→', scannerTierLevel)
  console.log('User Level (MAX):', userTierLevel)
  console.log('Required Tier:', requiredTier, '→', requiredTierNormalized, '→', requiredTierLevel)
  console.log('Has Access:', userTierLevel >= requiredTierLevel ? '✅ YES' : '❌ NO')
  console.log('═════════════════════════════════')

  // Check if user has access
  const hasAccess = userTierLevel >= requiredTierLevel

  if (hasAccess) {
    // User has access - render the protected content
    return <>{children}</>
  }

  // User doesn't have access - show upgrade prompt
  // Determine current tier for display (use the higher tier)
  const currentTierDisplay = courseTierLevel >= scannerTierLevel
    ? profile?.course_tier || 'free'
    : profile?.scanner_tier || 'free'

  return (
    <UpgradePrompt
      currentTier={currentTierDisplay}
      requiredTier={requiredTier}
      featureName={featureName}
    />
  )
}
