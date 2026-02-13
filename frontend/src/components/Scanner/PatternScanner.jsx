import React, { useState, useEffect } from 'react'
import { useQuota } from '../../hooks/useQuota'
import { usePrice } from '../../contexts/PriceContext'
import { useAuth } from '../../contexts/AuthContext'
import { useScanHistory } from '../../hooks/useScanHistory'
import { supabase } from '../../lib/supabaseClient'
import { patternDetectionService } from '../../services/patternDetection'
import { telegramService } from '../../services/telegramService'
import {
  BellOff, XCircle, Smartphone, Send, CheckCheck, AlertCircle, X,
  PartyPopper, Info, Unlock, Star, Gem, Trophy, Check, Rocket, Sparkles
} from 'lucide-react'
import './PatternScanner.css'

export default function PatternScanner({ filters, onFilterChange, onScanStateChange, onScanComplete, onResultClick, triggerScan }) {
  const { quota, useQuotaSlot, refreshQuota } = useQuota()
  const { symbols: allSymbols } = usePrice()
  const { user, profile } = useAuth()
  const { saveScan } = useScanHistory()

  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [showResultsModal, setShowResultsModal] = useState(false)

  // Auto-hide results modal after 8 seconds
  useEffect(() => {
    if (showResultsModal && !isScanning) {
      const timer = setTimeout(() => {
        setShowResultsModal(false)
      }, 8000) // 8 seconds

      return () => clearTimeout(timer)
    }
  }, [showResultsModal, isScanning])

  // Notify parent about scanning state changes
  const updateScanningState = (scanning) => {
    setIsScanning(scanning)
    if (onScanStateChange) {
      onScanStateChange(scanning)
    }
  }

  // Watch for triggerScan changes from parent component
  useEffect(() => {
    if (triggerScan > 0) {
      handleScan()
    }
  }, [triggerScan])

  // Send Telegram alerts for found patterns (Scanner PRO+ only)
  const sendTelegramAlerts = async (patterns) => {
    // Only send for premium scanner users
    const isPremium = profile && profile.scanner_tier && profile.scanner_tier !== 'free'
    if (!isPremium) {
      console.log('[BellOff] Telegram alerts only for Scanner PRO+ users')
      return
    }

    try {
      // Get user's telegram ID
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        console.error('[XCircle] Error fetching telegram ID:', fetchError)
        return
      }

      if (!userData?.telegram_id) {
        console.log('[Smartphone] User has no Telegram connected - skipping alerts')
        return
      }

      console.log(`[Send] Sending ${patterns.length} Telegram alerts to Chat ID: ${userData.telegram_id}`)

      // Send alert for each pattern found
      let successCount = 0
      for (const pattern of patterns) {
        try {
          await telegramService.sendPatternAlert(userData.telegram_id, pattern)
          successCount++

          // Small delay between messages to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (alertError) {
          console.error(`[XCircle] Failed to send alert for ${pattern.symbol}:`, alertError)
          // Continue with other alerts even if one fails
        }
      }

      console.log(`[CheckCheck] Successfully sent ${successCount}/${patterns.length} Telegram alerts`)

    } catch (error) {
      console.error('[XCircle] Error sending Telegram alerts:', error)
      // Don't block scan if Telegram fails - just log the error
    }
  }

  const handleScan = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 STARTING SCAN')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Check if filters are set
    console.log('📋 Checking filters...')
    console.log('   Filters:', filters)
    console.log('   Coins to scan:', filters?.coins?.length || 0)
    console.log('   Selected coins:', filters?.coins || [])

    if (!filters || !filters.coins || filters.coins.length === 0) {
      console.warn('[AlertCircle] No filters or coins selected')
      alert('[AlertCircle] Vui lòng chọn coin để quét! Click "Scan Filters" để chọn.')
      if (onFilterChange) onFilterChange()
      return
    }

    // Check authentication
    console.log('👤 Checking authentication...')
    console.log('   User:', user ? `✅ Logged in (${user.id})` : '❌ Not logged in')
    console.log('   Email:', user?.email || 'N/A')

    if (!user) {
      console.error('[XCircle] User not authenticated')
      alert('[AlertCircle] Vui lòng đăng nhập để sử dụng Pattern Scanner!')
      return
    }

    // Log profile information
    console.log('📊 Profile Information:')
    console.log('   Profile:', profile)
    console.log('   Scanner Tier:', profile?.scanner_tier || 'unknown')
    console.log('   Course Tier:', profile?.course_tier || 'unknown')
    console.log('   Chatbot Tier:', profile?.chatbot_tier || 'unknown')

    // Check quota (skip for scanner premium users)
    const isPremium = profile && profile.scanner_tier && profile.scanner_tier !== 'free'
    console.log('🎟️ Quota Check:')
    console.log('   Is Premium:', isPremium ? '✅ YES (unlimited scans)' : '❌ NO (limited scans)')
    console.log('   Quota:', quota)
    console.log('   Can Scan:', quota.canScan ? '✅ YES' : '❌ NO')
    console.log('   Scans Used:', quota.used || 0)
    console.log('   Max Scans:', quota.max || 0)
    console.log('   Remaining:', quota.remaining || 0)

    if (!isPremium && !quota.canScan) {
      console.error('[XCircle] Quota exceeded')
      alert('[AlertCircle] Đã hết lượt scan hôm nay! Vui lòng nâng cấp Scanner PRO hoặc chờ reset.')
      return
    }

    let progressInterval = null // Define outside try block for cleanup

    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🚀 INITIATING SCAN PROCESS')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      setError(null)
      updateScanningState(true)
      setResults([])
      setScanProgress(0)

      // Use quota slot (only for free tier)
      if (!isPremium) {
        console.log('🎟️ Using quota slot (free tier)...')
        const quotaResult = await useQuotaSlot()

        if (!quotaResult.success) {
          console.error('❌ Quota slot usage failed:', quotaResult.error)
          alert(`[XCircle] ${quotaResult.error}`)
          updateScanningState(false)
          return
        }

        console.log(`✅ Quota slot used! Remaining: ${quotaResult.remaining}`)
      } else {
        console.log('⭐ Premium user - skipping quota check')
      }

      // Get user scanner tier for pattern filtering
      const userTier = profile?.scanner_tier || 'free'
      console.log(`🔍 User Scanner Tier: ${userTier.toUpperCase()}`)
      console.log(`🔍 Scanning ${filters.coins.length} coins...`)
      console.log(`🔍 Filters:`, filters)

      // Use filtered symbols
      const symbolsToScan = filters.coins

      // ⚡ NEW: Use runScan for parallel scanning + auto-save to database
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 CALLING runScan WITH AUTO-SAVE')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Simulate progress for UI (runScan runs parallel so it's fast)
      progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      try {
        // ⚡ Call runScan - it will scan all symbols in parallel and auto-save to DB
        const foundPatterns = await patternDetectionService.runScan(
          symbolsToScan,
          filters,
          user.id,        // User ID for saving history
          userTier        // User tier
        )

        // Clear progress interval
        clearInterval(progressInterval)
        setScanProgress(100)

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('✅ SCAN COMPLETE')
        console.log(`📊 Total patterns found: ${foundPatterns.length}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        if (foundPatterns.length > 0) {
          console.log('📋 Pattern Details:')
          foundPatterns.forEach((p, idx) => {
            console.log(`   ${idx + 1}. ${p.symbol}: ${p.pattern} (${p.signal})`)
          })
        }

        // Update results for UI
        setResults(foundPatterns)

        // Refresh quota display
        if (!isPremium) {
          console.log('🔄 Refreshing quota display...')
          await refreshQuota()
          console.log('✅ Quota refreshed')
        }

        // ⚡ REMOVED: Save scan to history (now handled by runScan automatically)
        // The runScan function already saves scan history to database
        console.log('ℹ️ Scan history already saved by runScan() - skipping duplicate save')

        // Show results modal
        console.log('🎉 Showing results modal')
        setShowResultsModal(true)

        // Notify parent component with scan results
        if (onScanComplete && foundPatterns.length > 0) {
          console.log('📤 Notifying parent component with scan results')
          onScanComplete(foundPatterns)
        }

        // ✅ Send Telegram alerts (Tier 1+ only)
        if (foundPatterns.length > 0) {
          console.log('📨 Initiating Telegram alerts...')
          await sendTelegramAlerts(foundPatterns)
        } else {
          console.log('ℹ️ No patterns found - skipping Telegram alerts')
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('🎉 SCAN PROCESS COMPLETED SUCCESSFULLY')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      } catch (scanError) {
        // Clear progress interval on error
        clearInterval(progressInterval)
        console.error('❌ runScan error:', scanError)
        throw scanError // Re-throw to be caught by parent catch
      }

    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ SCAN ERROR')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Error object:', error)

      // Clear progress interval if still running
      if (progressInterval) {
        clearInterval(progressInterval)
      }

      setError(error.message)
      alert('[XCircle] Lỗi khi scan: ' + error.message)
    } finally {
      console.log('🔚 Cleaning up scan state...')
      updateScanningState(false)
      setScanProgress(0)
      console.log('✅ Scan state cleaned up')
    }
  }

  const scannerTier = profile?.scanner_tier || 'free'
  const isPremium = scannerTier !== 'free'

  const patternCount =
    scannerTier === 'vip' ? 24 :
    scannerTier === 'premium' ? 15 :
    scannerTier === 'pro' ? 7 :
    3 // free

  const tierLabel =
    scannerTier === 'vip' ? <><Trophy className="tier-icon" size={16} /> VIP</> :
    scannerTier === 'premium' ? <><Gem className="tier-icon" size={16} /> PREMIUM</> :
    scannerTier === 'pro' ? <><Star className="tier-icon" size={16} /> PRO</> :
    <>FREE</>

  return (
    <div className="pattern-scanner-container">
      {/* Only show progress bar when scanning */}
      {isScanning && (
        <div className="scan-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <span className="progress-text">{scanProgress}% - Scanning {filters?.coins?.length || 0} coins</span>
        </div>
      )}

      {/* Show error if any */}
      {error && !isScanning && (
        <div className="scan-error">
          <XCircle size={16} className="error-icon" /> {error}
        </div>
      )}

      {/* No header, no minimal info - user requested to remove them completely */}

      {/* Tier Information Display */}
      <div className="tier-info-section">
        <div className={`tier-badge ${isPremium ? 'premium' : 'free'}`}>
          {tierLabel}
        </div>
        <div className="pattern-access-info">
          <span className="access-label">Pattern Access:</span>
          <span className="access-count">{patternCount} patterns available</span>
        </div>
      </div>

      {/* Beautiful Scan Results Modal */}
      {showResultsModal && (
        <div className="scan-results-modal-overlay" onClick={() => setShowResultsModal(false)}>
          <div className="scan-results-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowResultsModal(false)}><X size={20} /></button>

            {results.length > 0 ? (
              <>
                <div className="modal-icon success"><PartyPopper size={48} /></div>
                <h2 className="modal-title">Scan Hoàn Tất!</h2>
                <p className="modal-message">
                  Tìm thấy <strong>{results.length}</strong> pattern{results.length > 1 ? 's' : ''} trong {filters?.coins?.length || 0} coins
                </p>

                <div className="modal-stats">
                  <div className="stat-item">
                    <span className="stat-label">Coins Scanned</span>
                    <span className="stat-value">{filters?.coins?.length || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Patterns Found</span>
                    <span className="stat-value success">{results.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Remaining Scans</span>
                    <span className="stat-value">{isPremium ? '∞' : quota.remaining}</span>
                  </div>
                </div>

                <div className="modal-results-list">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="modal-result-item"
                      onClick={() => {
                        onResultClick && onResultClick(result)
                        setShowResultsModal(false)
                      }}
                    >
                      <span className="modal-result-symbol">{result.symbol.replace('USDT', '')}</span>
                      <span className="modal-result-pattern">{result.pattern}</span>
                      <span className={`modal-result-signal ${result.signal.toLowerCase().replace('_', '-')}`}>
                        {result.signal.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="modal-action-btn" onClick={() => setShowResultsModal(false)}>
                  <Sparkles size={16} className="btn-icon" /> View Results Below
                </button>
              </>
            ) : (
              <>
                <div className="modal-icon info"><Info size={48} /></div>
                <h2 className="modal-title">Không Tìm Thấy Pattern</h2>
                <p className="modal-message">
                  Không tìm thấy pattern nào trong {filters?.coins?.length || 0} coins được quét.
                </p>
                <p className="modal-hint">
                  Thử thay đổi filters hoặc quét coins khác
                </p>
                <button className="modal-action-btn" onClick={() => setShowResultsModal(false)}>
                  OK
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Prompt for FREE tier users who have results */}
      {!isPremium && results.length > 0 && (
        <div className="upgrade-prompt">
          <div className="upgrade-icon"><Unlock size={32} /></div>
          <h3 className="upgrade-title">Mở Khóa Thêm Patterns!</h3>
          <p className="upgrade-description">
            Bạn đang dùng {patternCount} patterns. Nâng cấp để mở khóa nhiều hơn!
          </p>
          <div className="upgrade-features">
            <div className="upgrade-feature">
              <Star size={16} className="feature-icon" />
              <span className="feature-text">PRO: 7 patterns - 997.000đ/tháng</span>
            </div>
            <div className="upgrade-feature">
              <Gem size={16} className="feature-icon" />
              <span className="feature-text">PREMIUM: 15 patterns - 1.997.000đ/tháng</span>
            </div>
            <div className="upgrade-feature">
              <Trophy size={16} className="feature-icon" />
              <span className="feature-text">VIP: 24 patterns + AI - 5.997.000đ/tháng</span>
            </div>
            <div className="upgrade-feature">
              <Check size={16} className="feature-icon" />
              <span className="feature-text">Unlimited scans + Telegram alerts</span>
            </div>
          </div>
          <button className="btn-upgrade-prompt" onClick={() => window.location.href = '/pricing'}>
            <Rocket size={16} className="btn-icon" /> Xem Bảng Giá Scanner
          </button>
        </div>
      )}
    </div>
  )
}
