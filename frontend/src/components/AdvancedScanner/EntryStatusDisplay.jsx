import React from 'react'
import { ENTRY_WORKFLOW } from '../../utils/entryWorkflow'
import './EntryStatusDisplay.css'

/**
 * EntryStatusDisplay Component
 *
 * Displays 6-step entry workflow progress for a pattern
 * Shows which step user is currently at and prevents breakout trading
 *
 * Props:
 * @param {Object} pattern - Pattern with zone info
 * @param {number} currentPrice - Current market price
 * @param {Object} currentStatus - Status from determineEntryStatus()
 * @param {Function} onSetAlert - Callback to create price alert
 */
export default function EntryStatusDisplay({
  pattern,
  currentPrice,
  currentStatus,
  onSetAlert
}) {

  const workflowSteps = Object.values(ENTRY_WORKFLOW)
  const currentStepNumber = currentStatus?.step || 1

  return (
    <div className="entry-status-display">

      {/* Header */}
      <div className="status-header">
        <h3 className="status-title">ENTRY WORKFLOW</h3>
        <div className="status-subtitle">
          {pattern.pattern} Pattern - {pattern.zone?.type} Zone
        </div>
      </div>

      {/* 6-Step Progress Indicator */}
      <div className="workflow-steps">
        {workflowSteps.map((step, index) => {
          const stepNumber = step.step
          const isCompleted = stepNumber < currentStepNumber
          const isCurrent = stepNumber === currentStepNumber
          const isPending = stepNumber > currentStepNumber

          return (
            <div
              key={step.status}
              className={`workflow-step ${
                isCompleted ? 'completed' :
                isCurrent ? 'current' :
                'pending'
              }`}
            >
              <div className="step-indicator">
                {isCompleted ? (
                  <span className="step-check"></span>
                ) : isCurrent ? (
                  <span className="step-icon" style={{ color: step.color }}>
                    {step.icon}
                  </span>
                ) : (
                  <span className="step-number"></span>
                )}
              </div>

              <div className="step-content">
                <div className="step-label">
                  {stepNumber}. {step.message}
                </div>

                {isCurrent && (
                  <div className="step-action" style={{ color: step.color }}>
                    {step.userAction}
                  </div>
                )}
              </div>

              {/* Current Step Marker */}
              {isCurrent && (
                <div className="current-marker" style={{ color: step.color }}>
                  � B�N � �Y
                </div>
              )}
            </div>
          )
        })}

        {/* Zone Broken Status */}
        {currentStatus?.status === 'ZONE_BROKEN' && (
          <div className="workflow-step broken">
            <div className="step-indicator">
              <span className="step-icon" style={{ color: '#EF4444' }}>L</span>
            </div>
            <div className="step-content">
              <div className="step-label">6. Zone b� ph� v� - B� QUA setup n�y</div>
              <div className="step-action" style={{ color: '#EF4444' }}>
                =� Kh�ng v�o l�nh
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Status Details */}
      <div className="status-details" style={{
        background: currentStatus?.bgColor || 'rgba(59, 130, 246, 0.1)',
        borderColor: currentStatus?.color || '#3B82F6'
      }}>
        <div className="detail-row">
          <span className="detail-label">=� CURRENT STATUS:</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Current Price:</span>
          <span className="detail-value">
            ${currentPrice?.toLocaleString() || 'N/A'}
          </span>
        </div>

        {currentStatus?.distance && (
          <div className="detail-row">
            <span className="detail-label">Distance to Zone:</span>
            <span className="detail-value">
              ${currentStatus.distance.toFixed(2)} ({currentStatus.distancePercent?.toFixed(2)}%)
            </span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">
            {currentStatus?.icon} Status:
          </span>
          <span className="detail-value" style={{ color: currentStatus?.color }}>
            {currentStatus?.status?.replace('_', ' ')}
          </span>
        </div>

        <div className="detail-message" style={{ color: currentStatus?.color }}>
          =� "{currentStatus?.message}"
        </div>

        {/* Zone Details */}
        {pattern.zone && (
          <div className="zone-details">
            <div className="zone-label">
              =� {pattern.zone.type} Zone: ${pattern.zone.bottom?.toFixed(2)} - ${pattern.zone.top?.toFixed(2)}
            </div>
            <div className="zone-mid">
              Mid: ${pattern.zone.mid?.toFixed(2)}
            </div>
          </div>
        )}

        {/* Confirmation Details */}
        {currentStatus?.confirmationType && (
          <div className="confirmation-details">
            <div className="confirmation-type">
               Confirmation: {currentStatus.confirmationType}
            </div>
            <div className="confirmation-strength">
              Strength: {currentStatus.confirmationStrength}
            </div>
          </div>
        )}
      </div>

      {/* WARNING BANNER - �I RETEST */}
      {currentStatus?.status !== 'CONFIRMATION' && currentStatus?.status !== 'ZONE_BROKEN' && (
        <div className="warning-banner">
          <div className="warning-icon">�</div>
          <div className="warning-content">
            <div className="warning-title">�I RETEST - �NG ENTRY NGAY!</div>
            <div className="warning-message">
               Ch� gi� v�o zone + n�n x�c nh�n (Pin Bar, Engulfing, Hammer)
            </div>
          </div>
        </div>
      )}

      {/* ENTRY ALLOWED - Show when confirmation detected */}
      {currentStatus?.status === 'CONFIRMATION' && (
        <div className="entry-allowed-banner">
          <div className="entry-icon"></div>
          <div className="entry-content">
            <div className="entry-title">S�N S�NG ENTRY!</div>
            <div className="entry-details">
              <div>Entry: ${currentStatus.entryPrice?.toFixed(2)}</div>
              <div>Stop Loss: ${currentStatus.stopLoss?.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="status-actions">
        {currentStatus?.status === 'ZONE_CREATED' && onSetAlert && (
          <button
            className="btn-set-alert"
            onClick={() => onSetAlert(pattern)}
          >
            = Set Alert
          </button>
        )}

        <button
          className="btn-trading-rules"
          onClick={() => window.open('/trading-rules', '_blank')}
        >
          =� Trading Rules
        </button>
      </div>

    </div>
  )
}
