import React, { useState, useEffect } from 'react'
import { Smartphone, CheckCircle, XCircle, RotateCw, Clock, Lightbulb, MessageSquare, CheckSquare, Mail, AlertTriangle, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { telegramService } from '../../services/telegramService'
import './TelegramConnect.css'

/**
 * TelegramConnect Component
 * Allows Tier 1+ users to connect their Telegram account
 * for receiving pattern detection alerts
 */
export default function TelegramConnect() {
  const { user } = useAuth()
  const [telegramId, setTelegramId] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [inputChatId, setInputChatId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [testingConnection, setTestingConnection] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Load user's Telegram ID on mount
  useEffect(() => {
    if (user) {
      fetchTelegramId()
    }
  }, [user])

  const fetchTelegramId = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data.telegram_id) {
        setTelegramId(data.telegram_id)
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error fetching telegram ID:', error)
    }
  }

  const handleConnect = async () => {
    if (!inputChatId.trim()) {
      setError('Vui lòng nhập Chat ID')
      return
    }

    // Validate Chat ID format (should be numbers)
    if (!/^\d+$/.test(inputChatId.trim())) {
      setError('Chat ID phải là số (VD: 123456789)')
      return
    }

    try {
      setError('')
      setLoading(true)
      setTestingConnection(true)

      // Test connection first by sending a welcome message
      const testResult = await telegramService.testConnection(inputChatId.trim())

      if (!testResult.success) {
        throw new Error(`Không thể kết nối với Chat ID này. Vui lòng kiểm tra lại!\n\nLỗi: ${testResult.error}`)
      }

      setTestingConnection(false)

      // Update user's telegram_id in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ telegram_id: inputChatId.trim() })
        .eq('id', user.id)

      if (updateError) throw updateError

      setTelegramId(inputChatId.trim())
      setIsConnected(true)
      setInputChatId('')

      // Show success modal instead of alert
      setSuccessMessage('Kết nối Telegram thành công! Bạn đã nhận được tin nhắn test từ bot.')
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Error connecting Telegram:', error)
      setError(error.message || 'Kết nối thất bại. Vui lòng thử lại!')
      setTestingConnection(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    // Show confirmation modal instead of confirm()
    setShowDisconnectModal(true)
  }

  const confirmDisconnect = async () => {
    setShowDisconnectModal(false)

    try {
      setLoading(true)

      const { error } = await supabase
        .from('users')
        .update({ telegram_id: null })
        .eq('id', user.id)

      if (error) throw error

      setTelegramId('')
      setIsConnected(false)

      // Show success modal instead of alert
      setSuccessMessage('Đã ngắt kết nối Telegram!')
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Error disconnecting:', error)
      setError('Ngắt kết nối thất bại: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="telegram-connect">
      <div className="telegram-header">
        <span className="telegram-icon"><Smartphone className="w-6 h-6" /></span>
        <div>
          <h3>Telegram Alerts</h3>
          <p>Nhận thông báo pattern detection qua Telegram</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="telegram-setup">
          <div className="setup-steps">
            <h4><MessageSquare className="w-4 h-4 inline mr-1" /> Cách kết nối:</h4>
            <ol>
              <li>Mở Telegram, search "<b>@gem_trading_academy_bot</b>"</li>
              <li>Nhấn <b>Start</b> để bắt đầu chat với bot</li>
              <li>Bot sẽ gửi cho bạn <b>Chat ID</b> (dãy số)</li>
              <li>Copy Chat ID và paste vào ô dưới đây</li>
              <li>Click "Kết Nối" để hoàn tất</li>
            </ol>
          </div>

          {error && (
            <div className="telegram-error">
              <XCircle className="w-4 h-4 inline mr-1" /> {error}
            </div>
          )}

          {testingConnection && (
            <div className="telegram-testing">
              <RotateCw className="w-4 h-4 inline mr-1 animate-spin" /> Đang test kết nối... Vui lòng kiểm tra Telegram để nhận tin nhắn test!
            </div>
          )}

          <div className="telegram-input-group">
            <input
              type="text"
              value={inputChatId}
              onChange={(e) => setInputChatId(e.target.value)}
              placeholder="Nhập Chat ID (VD: 123456789)"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleConnect()
                }
              }}
            />
            <button
              onClick={handleConnect}
              disabled={loading}
              className="btn-telegram-connect"
            >
              {loading ? (testingConnection ? <><RotateCw className="w-4 h-4 inline mr-1 animate-spin" /> Đang test...</> : <><Clock className="w-4 h-4 inline mr-1" /> Đang kết nối...</>) : <><CheckCircle className="w-4 h-4 inline mr-1" /> Kết Nối</>}
            </button>
          </div>

          <div className="telegram-help">
            <p>
              <Lightbulb className="w-4 h-4 inline mr-1" /> <b>Tip:</b> Nếu không thấy Chat ID, gửi bất kỳ tin nhắn nào cho bot
              (<b>@gem_trading_academy_bot</b>), bot sẽ trả lời kèm Chat ID của bạn.
            </p>
          </div>

          <div className="telegram-bot-link">
            <a
              href="https://t.me/gem_trading_academy_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open-bot"
            >
              <Smartphone className="w-4 h-4 inline mr-1" /> Mở Bot trong Telegram
            </a>
          </div>
        </div>
      ) : (
        <div className="telegram-connected">
          <div className="connected-status">
            <span className="status-icon"><CheckCircle className="w-6 h-6 text-green-500" /></span>
            <div>
              <p className="status-text">Đã kết nối</p>
              <p className="chat-id">Chat ID: {telegramId}</p>
            </div>
          </div>

          <div className="connected-features">
            <h4><Mail className="w-4 h-4 inline mr-1" /> Bạn sẽ nhận alerts khi:</h4>
            <ul>
              <li><CheckSquare className="w-4 h-4 inline mr-1" /> Phát hiện pattern mới trong scan</li>
              <li><CheckSquare className="w-4 h-4 inline mr-1" /> Giá chạm Entry level</li>
              <li><CheckSquare className="w-4 h-4 inline mr-1" /> Giá chạm Stop Loss</li>
              <li><CheckSquare className="w-4 h-4 inline mr-1" /> Giá chạm Take Profit</li>
            </ul>
          </div>

          <div className="alert-example">
            <h4><MessageSquare className="w-4 h-4 inline mr-1" /> Ví dụ alert message:</h4>
            <div className="example-message">
              <CheckCircle className="w-4 h-4 inline text-green-500" /> <b>PATTERN DETECTED</b> <CheckCircle className="w-4 h-4 inline text-green-500" /><br/><br/>
              <b>Symbol:</b> BTC/USDT<br/>
              <b>Pattern:</b> UPU<br/>
              <b>Signal:</b> STRONG_BUY<br/>
              <b>Confidence:</b> 85%<br/><br/>
              <b>Trading Levels:</b><br/>
              Entry: $45,230<br/>
              Stop Loss: $44,100<br/>
              Take Profit: $48,500
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="btn-telegram-disconnect"
          >
            {loading ? <><Clock className="w-4 h-4 inline mr-1" /> Đang ngắt kết nối...</> : <><X className="w-4 h-4 inline mr-1" /> Ngắt Kết Nối</>}
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="telegram-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="telegram-modal success" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowSuccessModal(false)}><X className="w-4 h-4" /></button>
            <div className="modal-icon success-icon"><CheckCircle className="w-12 h-12 text-green-500" /></div>
            <h3 className="modal-title">Thành Công!</h3>
            <p className="modal-message">{successMessage}</p>
            <button className="modal-action-btn" onClick={() => setShowSuccessModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="telegram-modal-overlay" onClick={() => setShowDisconnectModal(false)}>
          <div className="telegram-modal warning" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowDisconnectModal(false)}><X className="w-4 h-4" /></button>
            <div className="modal-icon warning-icon"><AlertTriangle className="w-12 h-12 text-yellow-500" /></div>
            <h3 className="modal-title">Xác Nhận Ngắt Kết Nối</h3>
            <p className="modal-message">
              Bạn có chắc muốn ngắt kết nối Telegram?<br/>
              <span className="warning-text">Bạn sẽ không nhận được alerts nữa.</span>
            </p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowDisconnectModal(false)}>
                Hủy
              </button>
              <button className="modal-confirm-btn" onClick={confirmDisconnect}>
                Ngắt Kết Nối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
