import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TierGuard from '../components/TierGuard/TierGuard';
import * as sentimentApi from '../services/sentimentApi';
// import './Sentiment.css'; // Commented out to use global styles from components.css

/**
 * Sentiment Page - TIER 2
 *
 * Crypto market sentiment analyzer
 *
 * Features:
 * - Fear & Greed Index gauge
 * - Sentiment history chart (30 days)
 * - Trending coins by search volume
 * - Market overview stats
 * - Sentiment-driving news
 * - Trading recommendations based on sentiment
 *
 * Access: scanner_tier >= 'premium'
 */
export default function Sentiment() {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState(null);
  const [history, setHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const [market, setMarket] = useState(null);
  const [news, setNews] = useState([]);

  // Load sentiment data on mount
  useEffect(() => {
    if (user) {
      loadSentimentData();
    }
  }, [user]);

  const loadSentimentData = async () => {
    setLoading(true);

    try {
      const [sentimentRes, historyRes, trendingRes, newsRes] = await Promise.all([
        sentimentApi.getComprehensiveSentiment(),
        sentimentApi.getFearGreedHistory(),
        sentimentApi.getTrendingCoins(),
        sentimentApi.getSentimentNews()
      ]);

      if (sentimentRes.data) setSentiment(sentimentRes.data);
      if (historyRes.data) setHistory(historyRes.data);
      if (trendingRes.data) setTrending(trendingRes.data);
      if (newsRes.data) setNews(newsRes.data);

      if (sentimentRes.data?.marketStats) {
        setMarket(sentimentRes.data.marketStats);
      }

    } catch (error) {
      console.error('Error loading sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get color for sentiment score
  const getSentimentColor = (score) => {
    if (score >= 75) return '#ef4444'; // Extreme Greed - Red
    if (score >= 55) return '#f59e0b'; // Greed - Orange
    if (score >= 45) return '#94a3b8'; // Neutral - Gray
    if (score >= 25) return '#3b82f6'; // Fear - Blue
    return '#10b981'; // Extreme Fear - Green
  };

  // Get sentiment emoji
  const getSentimentEmoji = (classification) => {
    if (classification?.includes('Extreme Greed')) return '🔴';
    if (classification?.includes('Greed')) return '🟠';
    if (classification?.includes('Neutral')) return '⚪';
    if (classification?.includes('Fear')) return '🔵';
    if (classification?.includes('Extreme Fear')) return '🟢';
    return '⚪';
  };

  return (
    <TierGuard requiredTier="premium" featureName="Sentiment Analyzer">
      <div className="sentiment-page">

        {/* Page Header */}
        <div className="sentiment-header">
          <h1>📊 Market Sentiment Analyzer</h1>
          <p className="header-subtitle">Real-time crypto market sentiment and trading signals</p>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading sentiment data...</p>
          </div>
        )}

        {!loading && sentiment && (
          <>

            {/* Main Sentiment Gauge */}
            <div className="sentiment-gauge-section">
              <h2>😱 Fear & Greed Index</h2>

              <div className="gauge-container">
                {/* Circular Gauge */}
                <div className="circular-gauge">
                  <svg viewBox="0 0 200 200" className="gauge-svg">
                    {/* Background arc */}
                    <path
                      d="M 30 100 A 70 70 0 0 1 170 100"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="20"
                    />

                    {/* Value arc */}
                    <path
                      d="M 30 100 A 70 70 0 0 1 170 100"
                      fill="none"
                      stroke={getSentimentColor(sentiment.score)}
                      strokeWidth="20"
                      strokeDasharray={`${(sentiment.score / 100) * 220} 220`}
                      strokeLinecap="round"
                      className="gauge-arc"
                    />

                    {/* Center text */}
                    <text x="100" y="90" textAnchor="middle" className="gauge-value">
                      {sentiment.score}
                    </text>
                    <text x="100" y="110" textAnchor="middle" className="gauge-label">
                      {sentiment.classification}
                    </text>
                  </svg>

                  <div className="gauge-emoji">
                    {getSentimentEmoji(sentiment.classification)}
                  </div>
                </div>

                {/* Sentiment Scale */}
                <div className="sentiment-scale">
                  <div className="scale-marker extreme-fear">
                    <span className="marker-value">0</span>
                    <span className="marker-label">Extreme Fear</span>
                  </div>
                  <div className="scale-marker fear">
                    <span className="marker-value">25</span>
                    <span className="marker-label">Fear</span>
                  </div>
                  <div className="scale-marker neutral">
                    <span className="marker-value">50</span>
                    <span className="marker-label">Neutral</span>
                  </div>
                  <div className="scale-marker greed">
                    <span className="marker-value">75</span>
                    <span className="marker-label">Greed</span>
                  </div>
                  <div className="scale-marker extreme-greed">
                    <span className="marker-value">100</span>
                    <span className="marker-label">Extreme Greed</span>
                  </div>
                </div>

                {/* Trading Recommendation */}
                <div className="trading-recommendation">
                  <div className="rec-icon">💡</div>
                  <div className="rec-content">
                    <div className="rec-title">Trading Signal</div>
                    <div className="rec-message">{sentiment.recommendation}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Overview Stats */}
            {market && (
              <div className="market-overview">
                <h2>📈 Market Overview</h2>

                <div className="market-stats-grid">
                  <div className="market-stat">
                    <div className="stat-label">Total Market Cap</div>
                    <div className="stat-value">
                      ${(market.totalMarketCap / 1000000000000).toFixed(2)}T
                    </div>
                  </div>

                  <div className="market-stat">
                    <div className="stat-label">24h Volume</div>
                    <div className="stat-value">
                      ${(market.totalVolume / 1000000000).toFixed(1)}B
                    </div>
                  </div>

                  <div className="market-stat">
                    <div className="stat-label">BTC Dominance</div>
                    <div className="stat-value">{market.btcDominance.toFixed(1)}%</div>
                  </div>

                  <div className="market-stat">
                    <div className="stat-label">ETH Dominance</div>
                    <div className="stat-value">{market.ethDominance.toFixed(1)}%</div>
                  </div>

                  <div className="market-stat">
                    <div className="stat-label">24h Change</div>
                    <div className={`stat-value ${market.marketCapChange24h >= 0 ? 'positive' : 'negative'}`}>
                      {market.marketCapChange24h >= 0 ? '+' : ''}{market.marketCapChange24h.toFixed(2)}%
                    </div>
                  </div>

                  <div className="market-stat">
                    <div className="stat-label">Active Coins</div>
                    <div className="stat-value">{market.activeCryptocurrencies.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="sentiment-two-column">

              {/* Trending Coins */}
              <div className="trending-coins-section">
                <h2>🔥 Trending Coins</h2>

                <div className="trending-list">
                  {trending.slice(0, 10).map((coin, index) => (
                    <div key={coin.id} className="trending-coin-card">
                      <div className="coin-rank">#{index + 1}</div>
                      <div className="coin-info">
                        <div className="coin-symbol">{coin.symbol}</div>
                        <div className="coin-name">{coin.name}</div>
                      </div>
                      <div className="coin-rank-badge">
                        Rank #{coin.rank || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment History Chart */}
              <div className="sentiment-chart-section">
                <h2>📊 30-Day Sentiment Trend</h2>

                <div className="chart-wrapper">
                  <div className="sentiment-chart">
                    {history.slice(0, 30).map((item, index) => {
                      const maxValue = 100;
                      const height = (item.value / maxValue) * 100;
                      const color = getSentimentColor(item.value);

                      return (
                        <div key={index} className="chart-bar">
                          <div
                            className="bar-fill"
                            style={{
                              height: `${height}%`,
                              backgroundColor: color
                            }}
                            title={`${item.value} - ${item.classification}`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="chart-legend">
                    <span>30 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

            </div>

            {/* News Aggregator */}
            <div className="news-section">
              <h2>📰 Sentiment-Driving News</h2>

              <div className="news-grid">
                {news.map((article) => (
                  <div key={article.id} className={`news-card ${article.sentiment}`}>
                    <div className="news-header">
                      <span className={`sentiment-badge ${article.sentiment}`}>
                        {article.sentiment === 'positive' ? '🟢' : '🔴'} {article.sentiment.toUpperCase()}
                      </span>
                      <span className="impact-badge">{article.impact.toUpperCase()} IMPACT</span>
                    </div>

                    <h3 className="news-title">{article.title}</h3>

                    <p className="news-summary">{article.summary}</p>

                    <div className="news-footer">
                      <span className="news-source">{article.source}</span>
                      <span className="news-time">
                        {new Date(article.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </>
        )}

      </div>
    </TierGuard>
  );
}
