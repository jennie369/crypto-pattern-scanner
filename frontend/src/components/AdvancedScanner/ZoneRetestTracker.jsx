import React from 'react'
import './ZoneRetestTracker.css'

/**
 * ZoneRetestTracker Component
 *
 * Displays zone quality metrics and retest tracking
 *
 * Zone Lifecycle:
 * - Fresh (0 tests) - Best - 100% strength
 * - Tested 1x - Good - 75% strength
 * - Tested 2x - Okay - 50% strength
 * - Tested 3+ - Weak - 25% strength
 *
 * Props:
 * @param {Object} zone - Zone object from pattern
 *   { type, top, bottom, mid, testCount, createdAt }
 */
export default function ZoneRetestTracker({ zone }) {

  // Default values if zone data is missing
  const zoneType = zone?.type || 'UNKNOWN'
  const zoneTop = zone?.top || 0
  const zoneBottom = zone?.bottom || 0
  const zoneMid = zone?.mid || (zoneTop + zoneBottom) / 2
  const testCount = zone?.testCount || 0
  const createdAt = zone?.createdAt ? new Date(zone.createdAt) : new Date()

  // Calculate Zone Status and Strength
  let zoneStatus = 'FRESH'
  let starRating = '*****'
  let strength = 100
  let statusLabel = 'Fresh (Never tested)'
  let statusColor = '#10B981' // Green

  if (testCount === 0) {
    zoneStatus = 'FRESH'
    starRating = '*****'
    strength = 100
    statusLabel = 'Fresh (Never tested)'
    statusColor = '#10B981' // Green
  } else if (testCount === 1) {
    zoneStatus = 'TESTED_1X'
    starRating = '****'
    strength = 75
    statusLabel = 'Tested 1x (Good)'
    statusColor = '#3B82F6' // Blue
  } else if (testCount === 2) {
    zoneStatus = 'TESTED_2X'
    starRating = '***'
    strength = 50
    statusLabel = 'Tested 2x (Okay)'
    statusColor = '#F59E0B' // Orange
  } else {
    zoneStatus = 'WEAK'
    starRating = '*'
    strength = 25
    statusLabel = `Tested ${testCount}x (Weak)`
    statusColor = '#EF4444' // Red
  }

  // Calculate Zone Age
  const now = new Date()
  const ageMs = now - createdAt
  const ageMinutes = Math.floor(ageMs / 1000 / 60)
  const ageHours = Math.floor(ageMinutes / 60)
  const ageDays = Math.floor(ageHours / 24)

  let ageDisplay = ''
  if (ageDays > 0) {
    ageDisplay = `${ageDays} day${ageDays > 1 ? 's' : ''}`
  } else if (ageHours > 0) {
    ageDisplay = `${ageHours} hour${ageHours > 1 ? 's' : ''}`
  } else if (ageMinutes > 0) {
    ageDisplay = `${ageMinutes} minute${ageMinutes > 1 ? 's' : ''}`
  } else {
    ageDisplay = 'Just created'
  }

  // Zone Icon based on type
  const zoneIcon = zoneType === 'HFZ' ? 'H' : zoneType === 'LFZ' ? 'L' : '?'
  const zoneLabel = zoneType === 'HFZ' ? 'HFZ (Resistance)' : zoneType === 'LFZ' ? 'LFZ (Support)' : 'Unknown Zone'

  return (
    <div className="zone-retest-tracker">

      {/* Zone Header */}
      <div className="zone-header">
        <div className="zone-type">
          <span className="zone-icon">{zoneIcon}</span>
          <span className="zone-label">{zoneLabel}</span>
        </div>
        <div className="zone-price-range">
          ${zoneBottom?.toFixed(2)} - ${zoneTop?.toFixed(2)}
        </div>
      </div>

      {/* Zone Status with Star Rating */}
      <div className="zone-status-section">
        <div className="status-row">
          <span className="status-label">Status:</span>
          <span className="status-value" style={{ color: statusColor }}>
            {statusLabel}
          </span>
        </div>

        <div className="star-rating" style={{ color: statusColor }}>
          {starRating}
        </div>
      </div>

      {/* Zone Metrics */}
      <div className="zone-metrics">

        {/* Test Count */}
        <div className="metric-item">
          <div className="metric-icon">#</div>
          <div className="metric-content">
            <div className="metric-label">Tests</div>
            <div className="metric-value">{testCount}</div>
          </div>
        </div>

        {/* Zone Age */}
        <div className="metric-item">
          <div className="metric-icon">T</div>
          <div className="metric-content">
            <div className="metric-label">Age</div>
            <div className="metric-value">{ageDisplay}</div>
          </div>
        </div>

        {/* Zone Strength */}
        <div className="metric-item">
          <div className="metric-icon">S</div>
          <div className="metric-content">
            <div className="metric-label">Strength</div>
            <div className="metric-value">{strength}%</div>
          </div>
        </div>

      </div>

      {/* Strength Bar */}
      <div className="strength-bar-container">
        <div className="strength-label">Zone Strength:</div>
        <div className="strength-bar">
          <div
            className="strength-fill"
            style={{
              width: `${strength}%`,
              background: statusColor
            }}
          />
        </div>
        <div className="strength-percentage" style={{ color: statusColor }}>
          {strength}%
        </div>
      </div>

      {/* Zone Mid Price */}
      <div className="zone-mid-price">
        <span className="mid-label">Zone Mid:</span>
        <span className="mid-value">${zoneMid?.toFixed(2)}</span>
      </div>

      {/* Recommendation based on test count */}
      {testCount >= 3 && (
        <div className="zone-warning">
          <div className="warning-icon">!</div>
          <div className="warning-text">
            Zone tested {testCount} times - Reliability decreased. Consider skipping this setup.
          </div>
        </div>
      )}

      {testCount === 0 && (
        <div className="zone-tip">
          <div className="tip-icon">i</div>
          <div className="tip-text">
            Zone untested - Best opportunity for entry!
          </div>
        </div>
      )}

    </div>
  )
}
