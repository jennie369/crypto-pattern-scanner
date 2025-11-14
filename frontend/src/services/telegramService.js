/**
 * Telegram Service
 * Handles sending notifications to users via Telegram Bot
 */

class TelegramService {
  constructor() {
    // Bot token for gem_trading_academy_bot
    this.botToken = '8523437241:AAHRj4H-PerFn67NQAfL39D2TGkrDDokpRg'
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`
  }

  /**
   * Send message to user via Telegram
   * @param {string} chatId - User's Telegram Chat ID
   * @param {string} text - Message text (HTML supported)
   * @param {object} options - Additional options
   */
  async sendMessage(chatId, text, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          ...options
        })
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.description || 'Telegram API error')
      }

      console.log('✅ Telegram message sent successfully')
      return data.result
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error)
      throw error
    }
  }

  /**
   * Send pattern detection alert
   * @param {string} chatId - User's Chat ID
   * @param {object} patternData - Pattern information
   */
  async sendPatternAlert(chatId, patternData) {
    const { symbol, pattern, confidence, signal, entry, stopLoss, takeProfit, description } = patternData

    const signalEmoji = signal.includes('BUY') ? '🟢' : '🔴'
    const tpValue = Array.isArray(takeProfit) ? takeProfit[0] : takeProfit

    const message = `
${signalEmoji} <b>PATTERN DETECTED</b> ${signalEmoji}

<b>Symbol:</b> ${symbol.replace('USDT', '/USDT')}
<b>Pattern:</b> ${pattern}
${description ? `<b>Description:</b> ${description}` : ''}

<b>Signal:</b> ${signal}
<b>Confidence:</b> ${Math.round(confidence)}%

<b>📊 Trading Levels:</b>
Entry: $${entry.toFixed(4)}
Stop Loss: $${stopLoss.toFixed(4)}
Take Profit: $${tpValue.toFixed(4)}

⏰ ${new Date().toLocaleString('vi-VN')}

<i>⚠️ This is not financial advice. Trade at your own risk.</i>
    `.trim()

    return await this.sendMessage(chatId, message)
  }

  /**
   * Send price alert (Entry/SL/TP hit)
   * @param {string} chatId - User's Chat ID
   * @param {object} alertData - Alert information
   */
  async sendPriceAlert(chatId, alertData) {
    const { symbol, alertType, targetPrice, currentPrice } = alertData

    const emoji = alertType === 'TAKE_PROFIT' ? '🎉' :
                  alertType === 'STOP_LOSS' ? '🛑' : '📍'

    const message = `
${emoji} <b>PRICE ALERT</b> ${emoji}

<b>Symbol:</b> ${symbol.replace('USDT', '/USDT')}
<b>Alert Type:</b> ${alertType.replace('_', ' ')}

<b>Target:</b> $${targetPrice.toFixed(4)}
<b>Current:</b> $${currentPrice.toFixed(4)}

⏰ ${new Date().toLocaleString('vi-VN')}
    `.trim()

    return await this.sendMessage(chatId, message)
  }

  /**
   * Get bot information (for testing)
   */
  async getMe() {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`)
      const data = await response.json()

      if (data.ok) {
        console.log('✅ Bot info:', data.result)
        return data.result
      } else {
        throw new Error(data.description || 'Failed to get bot info')
      }
    } catch (error) {
      console.error('❌ Error getting bot info:', error)
      throw error
    }
  }

  /**
   * Test if chat ID is valid by sending a test message
   * @param {string} chatId - Chat ID to test
   */
  async testConnection(chatId) {
    try {
      const message = `
✅ <b>Connection Successful!</b>

Your Telegram is now connected to GEM Trading Bot.

You will receive alerts when:
📊 New patterns are detected
💰 Price hits your entry levels
🛑 Stop Loss levels are reached
🎯 Take Profit targets are hit

Happy trading! 🚀
      `.trim()

      await this.sendMessage(chatId, message)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Export singleton instance
export const telegramService = new TelegramService()
