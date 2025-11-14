/**
 * Support/Resistance Detection Algorithm
 * Automatically detects S/R levels from historical price data
 * Uses swing highs/lows and volume confirmation
 */

/**
 * Main function to detect support and resistance levels
 * @param {Array} candles - Array of OHLCV candle data
 * @param {Object} options - Configuration options
 * @returns {Object} { supports, resistances, keyLevels }
 */
export function detectSupportResistance(candles, options = {}) {
  const {
    lookback = 100,
    minTouches = 2,
    touchThreshold = 0.002, // 0.2% price difference to cluster
    volumeWeight = 0.3
  } = options

  if (!candles || candles.length < 20) {
    return {
      supports: [],
      resistances: [],
      keyLevels: []
    }
  }

  const recentCandles = candles.slice(-lookback)
  const swingHighs = findSwingHighs(recentCandles)
  const swingLows = findSwingLows(recentCandles)

  const supportClusters = clusterLevels(swingLows, touchThreshold)
  const resistanceClusters = clusterLevels(swingHighs, touchThreshold)

  const supports = supportClusters.map(cluster =>
    calculateLevelStrength(cluster, recentCandles, 'support', volumeWeight)
  ).filter(level => level.touches >= minTouches)

  const resistances = resistanceClusters.map(cluster =>
    calculateLevelStrength(cluster, recentCandles, 'resistance', volumeWeight)
  ).filter(level => level.touches >= minTouches)

  // Sort by strength
  supports.sort((a, b) => b.strength - a.strength)
  resistances.sort((a, b) => b.strength - a.strength)

  const keyLevels = identifyKeyLevels(supports, resistances, recentCandles)

  return {
    supports: supports.slice(0, 10),
    resistances: resistances.slice(0, 10),
    keyLevels
  }
}

/**
 * Find swing highs in price data
 * @param {Array} candles - Candle data
 * @param {Number} period - Lookback period for swing detection
 * @returns {Array} Array of swing high points
 */
function findSwingHighs(candles, period = 5) {
  const swingHighs = []

  for (let i = period; i < candles.length - period; i++) {
    const current = candles[i].high
    let isSwingHigh = true

    // Check if current high is greater than surrounding highs
    for (let j = 1; j <= period; j++) {
      if (candles[i - j].high >= current || candles[i + j].high >= current) {
        isSwingHigh = false
        break
      }
    }

    if (isSwingHigh) {
      swingHighs.push({
        price: current,
        index: i,
        time: candles[i].time,
        volume: candles[i].volume || 0
      })
    }
  }

  return swingHighs
}

/**
 * Find swing lows in price data
 * @param {Array} candles - Candle data
 * @param {Number} period - Lookback period for swing detection
 * @returns {Array} Array of swing low points
 */
function findSwingLows(candles, period = 5) {
  const swingLows = []

  for (let i = period; i < candles.length - period; i++) {
    const current = candles[i].low
    let isSwingLow = true

    // Check if current low is less than surrounding lows
    for (let j = 1; j <= period; j++) {
      if (candles[i - j].low <= current || candles[i + j].low <= current) {
        isSwingLow = false
        break
      }
    }

    if (isSwingLow) {
      swingLows.push({
        price: current,
        index: i,
        time: candles[i].time,
        volume: candles[i].volume || 0
      })
    }
  }

  return swingLows
}

/**
 * Cluster nearby price levels together
 * @param {Array} levels - Array of price levels
 * @param {Number} threshold - Price difference threshold for clustering
 * @returns {Array} Array of clustered levels
 */
function clusterLevels(levels, threshold) {
  if (levels.length === 0) return []

  const clusters = []
  const sorted = [...levels].sort((a, b) => a.price - b.price)

  let currentCluster = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const priceDiff = Math.abs(sorted[i].price - currentCluster[0].price) / currentCluster[0].price

    if (priceDiff <= threshold) {
      currentCluster.push(sorted[i])
    } else {
      clusters.push(currentCluster)
      currentCluster = [sorted[i]]
    }
  }

  if (currentCluster.length > 0) {
    clusters.push(currentCluster)
  }

  return clusters
}

/**
 * Calculate strength of a support/resistance level
 * @param {Array} cluster - Cluster of price points
 * @param {Array} candles - All candle data
 * @param {String} type - 'support' or 'resistance'
 * @param {Number} volumeWeight - Weight for volume in strength calculation
 * @returns {Object} Level with strength score
 */
function calculateLevelStrength(cluster, candles, type, volumeWeight) {
  const avgPrice = cluster.reduce((sum, p) => sum + p.price, 0) / cluster.length
  const touches = cluster.length
  const avgVolume = cluster.reduce((sum, p) => sum + (p.volume || 0), 0) / cluster.length
  const maxVolume = Math.max(...candles.map(c => c.volume || 0))
  const volumeScore = maxVolume > 0 ? avgVolume / maxVolume : 0

  // Recency score - more recent touches are more important
  const latestTouch = Math.max(...cluster.map(p => p.index))
  const recencyScore = latestTouch / candles.length

  // Touch score - more touches = stronger level
  const touchScore = Math.min(touches / 5, 1)

  // Combined strength score (0-100)
  const strength = (
    touchScore * 0.5 +
    volumeScore * volumeWeight +
    recencyScore * (1 - 0.5 - volumeWeight)
  ) * 100

  const recentTouch = cluster.reduce((latest, p) =>
    p.index > latest.index ? p : latest
  )

  return {
    price: avgPrice,
    touches,
    strength: Math.round(strength),
    type,
    lastTested: recentTouch.time,
    volume: avgVolume,
    cluster: cluster.map(p => ({ price: p.price, time: p.time }))
  }
}

/**
 * Identify key levels closest to current price
 * @param {Array} supports - All support levels
 * @param {Array} resistances - All resistance levels
 * @param {Array} candles - Candle data
 * @returns {Array} Key levels near current price
 */
function identifyKeyLevels(supports, resistances, candles) {
  const currentPrice = candles[candles.length - 1].close
  const keyLevels = []

  // Find nearest support below current price
  const nearestSupport = supports
    .filter(s => s.price < currentPrice)
    .sort((a, b) => (currentPrice - b.price) - (currentPrice - a.price))[0]

  // Find nearest resistance above current price
  const nearestResistance = resistances
    .filter(r => r.price > currentPrice)
    .sort((a, b) => (a.price - currentPrice) - (b.price - currentPrice))[0]

  if (nearestSupport) {
    keyLevels.push({
      ...nearestSupport,
      importance: 'high',
      distance: ((currentPrice - nearestSupport.price) / currentPrice * 100).toFixed(2) + '%'
    })
  }

  if (nearestResistance) {
    keyLevels.push({
      ...nearestResistance,
      importance: 'high',
      distance: ((nearestResistance.price - currentPrice) / currentPrice * 100).toFixed(2) + '%'
    })
  }

  return keyLevels
}

/**
 * Format S/R data for chart display
 * @param {Object} srData - S/R detection results
 * @param {Number} currentPrice - Current price
 * @returns {Array} Array of line objects for chart
 */
export function formatSRForChart(srData, currentPrice) {
  const lines = []

  // Add support lines
  srData.supports.forEach((support, index) => {
    lines.push({
      price: support.price,
      color: getColorByStrength(support.strength, 'support'),
      lineWidth: index === 0 ? 3 : 2,
      lineStyle: 'solid',
      axisLabelVisible: true,
      title: `S ${support.strength}% (${support.touches}x)`,
      type: 'support'
    })
  })

  // Add resistance lines
  srData.resistances.forEach((resistance, index) => {
    lines.push({
      price: resistance.price,
      color: getColorByStrength(resistance.strength, 'resistance'),
      lineWidth: index === 0 ? 3 : 2,
      lineStyle: 'solid',
      axisLabelVisible: true,
      title: `R ${resistance.strength}% (${resistance.touches}x)`,
      type: 'resistance'
    })
  })

  return lines
}

/**
 * Get color based on level strength
 * @param {Number} strength - Strength score (0-100)
 * @param {String} type - 'support' or 'resistance'
 * @returns {String} Color string
 */
function getColorByStrength(strength, type) {
  const baseColor = type === 'support' ? '#4CAF50' : '#F44336'

  if (strength >= 80) return baseColor
  if (strength >= 60) return type === 'support' ? '#66BB6A' : '#EF5350'
  if (strength >= 40) return type === 'support' ? '#81C784' : '#E57373'
  return type === 'support' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.4)'
}

/**
 * Filter S/R levels based on user tier
 * @param {Object} srData - S/R detection results
 * @param {String} userTier - User's subscription tier
 * @returns {Object} Filtered S/R data
 */
export function filterSRByTier(srData, userTier) {
  if (userTier === 'free') {
    // FREE tier: Only show 3 nearest levels total
    const allLevels = [
      ...srData.supports.map(s => ({ ...s, distance: Math.abs(s.price) })),
      ...srData.resistances.map(r => ({ ...r, distance: Math.abs(r.price) }))
    ].sort((a, b) => a.distance - b.distance).slice(0, 3)

    return {
      supports: allLevels.filter(l => l.type === 'support'),
      resistances: allLevels.filter(l => l.type === 'resistance'),
      keyLevels: srData.keyLevels.slice(0, 2)
    }
  }

  // TIER 1+: Full access
  return srData
}
