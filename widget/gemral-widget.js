/**
 * Gemral Chat Widget
 * PHASE 5: NANG CAO
 *
 * Embed: <script src="https://cdn.gemral.com/widget.js"></script>
 *
 * Configuration:
 * window.gemralConfig = {
 *   position: 'bottom-right',
 *   primaryColor: '#FFBD59',
 *   headerTitle: 'Gemral',
 *   welcomeMessage: 'Xin chao! Gemral co the giup gi cho ban?',
 *   wsUrl: 'wss://api.gemral.com/ws/chat'
 * };
 */
(function() {
  'use strict';

  const CONFIG = window.gemralConfig || {};
  const WS_URL = CONFIG.wsUrl || 'wss://api.gemral.com/ws/chat';
  const POSITION = CONFIG.position || 'bottom-right';
  const PRIMARY_COLOR = CONFIG.primaryColor || '#FFBD59';
  const HEADER_TITLE = CONFIG.headerTitle || 'Gemral';
  const WELCOME_MSG = CONFIG.welcomeMessage || 'Xin chao! Gemral co the giup gi cho ban? 💎';
  const QUICK_REPLIES = CONFIG.quickReplies || [
    { label: '🔮 Gieo que', action: 'iching' },
    { label: '🎴 Tarot', action: 'tarot' },
    { label: '💎 Xem da', action: 'crystal' }
  ];

  class GemralWidget {
    constructor() {
      this.isOpen = false;
      this.isConnected = false;
      this.ws = null;
      this.messages = [];
      this.userId = this.generateUserId();
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectDelay = 3000;

      this.init();
    }

    generateUserId() {
      let id = localStorage.getItem('gemral_user_id');
      if (!id) {
        id = 'web_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('gemral_user_id', id);
      }
      return id;
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.bindEvents();
      this.connect();

      // Add welcome message
      this.addMessage('assistant', WELCOME_MSG);

      // Load saved messages
      this.loadMessages();
    }

    injectStyles() {
      const style = document.createElement('style');
      style.id = 'gemral-widget-styles';
      style.textContent = `
        .gemral-widget-container {
          position: fixed;
          ${POSITION.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          ${POSITION.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
          z-index: 999999;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .gemral-toggle-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #FF8C00 100%);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(255, 189, 89, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .gemral-toggle-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(255, 189, 89, 0.5);
        }

        .gemral-toggle-btn svg {
          width: 28px;
          height: 28px;
          fill: white;
        }

        .gemral-toggle-btn .gemral-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #FF4444;
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          font-size: 12px;
          font-weight: bold;
          display: none;
          align-items: center;
          justify-content: center;
        }

        .gemral-toggle-btn .gemral-badge.show {
          display: flex;
        }

        .gemral-chat-window {
          display: none;
          position: absolute;
          ${POSITION.includes('right') ? 'right: 0;' : 'left: 0;'}
          bottom: 70px;
          width: 380px;
          height: 520px;
          background: #0D1B2A;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          flex-direction: column;
        }

        .gemral-chat-window.open {
          display: flex;
          animation: gemral-slideUp 0.3s ease;
        }

        @keyframes gemral-slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gemral-header {
          background: linear-gradient(135deg, #1B2838 0%, #0D1B2A 100%);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 189, 89, 0.2);
        }

        .gemral-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #FF8C00 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }

        .gemral-avatar span {
          font-size: 20px;
        }

        .gemral-header-info h3 {
          color: white;
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .gemral-header-info p {
          margin: 2px 0 0;
          font-size: 12px;
        }

        .gemral-header-info p.online {
          color: #4CAF50;
        }

        .gemral-header-info p.offline {
          color: #FF6B6B;
        }

        .gemral-close-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 24px;
          padding: 0;
          line-height: 1;
          transition: color 0.2s;
        }

        .gemral-close-btn:hover {
          color: white;
        }

        .gemral-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gemral-messages::-webkit-scrollbar {
          width: 6px;
        }

        .gemral-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .gemral-messages::-webkit-scrollbar-thumb {
          background: rgba(255, 189, 89, 0.3);
          border-radius: 3px;
        }

        .gemral-message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          animation: gemral-fadeIn 0.3s ease;
          word-wrap: break-word;
        }

        @keyframes gemral-fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gemral-message.user {
          align-self: flex-end;
          background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #FF8C00 100%);
          color: #0D1B2A;
          border-bottom-right-radius: 4px;
        }

        .gemral-message.assistant {
          align-self: flex-start;
          background: #1B2838;
          color: #E0E0E0;
          border-bottom-left-radius: 4px;
        }

        .gemral-message.system {
          align-self: center;
          background: rgba(255, 189, 89, 0.1);
          color: #888;
          font-size: 12px;
          padding: 8px 16px;
        }

        .gemral-message .time {
          display: block;
          font-size: 10px;
          opacity: 0.7;
          margin-top: 4px;
        }

        .gemral-typing {
          display: none;
          align-self: flex-start;
          padding: 12px 16px;
          background: #1B2838;
          border-radius: 16px;
          border-bottom-left-radius: 4px;
        }

        .gemral-typing.show {
          display: flex;
          gap: 4px;
        }

        .gemral-typing span {
          width: 8px;
          height: 8px;
          background: ${PRIMARY_COLOR};
          border-radius: 50%;
          animation: gemral-bounce 1.4s infinite ease-in-out;
        }

        .gemral-typing span:nth-child(1) { animation-delay: 0s; }
        .gemral-typing span:nth-child(2) { animation-delay: 0.2s; }
        .gemral-typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes gemral-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }

        .gemral-quick-replies {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 16px 12px;
        }

        .gemral-quick-reply {
          background: transparent;
          border: 1px solid ${PRIMARY_COLOR};
          color: ${PRIMARY_COLOR};
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gemral-quick-reply:hover {
          background: ${PRIMARY_COLOR};
          color: #0D1B2A;
        }

        .gemral-input-area {
          padding: 16px;
          background: #1B2838;
          border-top: 1px solid rgba(255, 189, 89, 0.2);
          display: flex;
          gap: 12px;
        }

        .gemral-input {
          flex: 1;
          background: #0D1B2A;
          border: 1px solid rgba(255, 189, 89, 0.3);
          border-radius: 24px;
          padding: 12px 20px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
        }

        .gemral-input:focus {
          border-color: ${PRIMARY_COLOR};
        }

        .gemral-input::placeholder {
          color: #666;
        }

        .gemral-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gemral-send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #FF8C00 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, opacity 0.2s;
        }

        .gemral-send-btn:hover {
          transform: scale(1.1);
        }

        .gemral-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .gemral-send-btn svg {
          width: 20px;
          height: 20px;
          fill: #0D1B2A;
        }

        .gemral-powered {
          text-align: center;
          padding: 8px;
          font-size: 10px;
          color: #666;
          background: #0D1B2A;
        }

        .gemral-powered a {
          color: ${PRIMARY_COLOR};
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .gemral-chat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
            bottom: 70px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    createWidget() {
      const container = document.createElement('div');
      container.className = 'gemral-widget-container';

      // Build quick replies HTML
      const quickRepliesHtml = QUICK_REPLIES.map(qr =>
        `<button class="gemral-quick-reply" data-action="${qr.action}">${qr.label}</button>`
      ).join('');

      container.innerHTML = `
        <div class="gemral-chat-window">
          <div class="gemral-header">
            <div class="gemral-avatar"><span>💎</span></div>
            <div class="gemral-header-info">
              <h3>${HEADER_TITLE}</h3>
              <p class="gemral-status offline">● Dang ket noi...</p>
            </div>
            <button class="gemral-close-btn" aria-label="Close">×</button>
          </div>
          <div class="gemral-messages"></div>
          <div class="gemral-quick-replies">${quickRepliesHtml}</div>
          <div class="gemral-input-area">
            <input type="text" class="gemral-input" placeholder="Nhap tin nhan..." autocomplete="off">
            <button class="gemral-send-btn" aria-label="Send">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div class="gemral-powered">Powered by <a href="https://gemral.com" target="_blank">Gemral AI</a></div>
        </div>
        <button class="gemral-toggle-btn" aria-label="Open chat">
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
          <span class="gemral-badge">0</span>
        </button>
      `;
      document.body.appendChild(container);

      this.container = container;
      this.chatWindow = container.querySelector('.gemral-chat-window');
      this.messagesContainer = container.querySelector('.gemral-messages');
      this.input = container.querySelector('.gemral-input');
      this.toggleBtn = container.querySelector('.gemral-toggle-btn');
      this.closeBtn = container.querySelector('.gemral-close-btn');
      this.sendBtn = container.querySelector('.gemral-send-btn');
      this.statusEl = container.querySelector('.gemral-status');
      this.badgeEl = container.querySelector('.gemral-badge');
    }

    bindEvents() {
      this.toggleBtn.addEventListener('click', () => this.toggle());
      this.closeBtn.addEventListener('click', () => this.close());
      this.sendBtn.addEventListener('click', () => this.send());

      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.send();
        }
      });

      this.container.querySelectorAll('.gemral-quick-reply').forEach(btn => {
        btn.addEventListener('click', () => {
          this.sendMessage(btn.textContent);
        });
      });

      // Handle visibility change for reconnect
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !this.isConnected) {
          this.connect();
        }
      });
    }

    toggle() {
      this.isOpen = !this.isOpen;
      this.chatWindow.classList.toggle('open', this.isOpen);

      if (this.isOpen) {
        this.input.focus();
        this.clearBadge();
        this.scrollToBottom();
      }
    }

    close() {
      this.isOpen = false;
      this.chatWindow.classList.remove('open');
    }

    connect() {
      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        return; // Already connecting
      }

      try {
        this.ws = new WebSocket(WS_URL);
        this.updateStatus('connecting');

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.updateStatus('online');

          // Authenticate
          this.ws.send(JSON.stringify({
            type: 'auth',
            user_id: this.userId,
            platform: 'web_widget',
            metadata: {
              url: window.location.href,
              referrer: document.referrer,
              userAgent: navigator.userAgent
            }
          }));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (e) {
            console.error('Gemral Widget: Failed to parse message', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Gemral Widget: WebSocket error', error);
          this.updateStatus('offline');
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.updateStatus('offline');
          this.scheduleReconnect();
        };
      } catch (error) {
        console.error('Gemral Widget: Failed to connect', error);
        this.updateStatus('offline');
        this.scheduleReconnect();
      }
    }

    scheduleReconnect() {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Gemral Widget: Max reconnect attempts reached');
        return;
      }

      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);

      setTimeout(() => {
        if (!this.isConnected) {
          this.connect();
        }
      }, delay);
    }

    handleMessage(data) {
      switch (data.type) {
        case 'message':
          this.addMessage('assistant', data.content);
          this.hideTyping();

          if (!this.isOpen) {
            this.incrementBadge();
          }
          break;

        case 'typing':
          data.typing ? this.showTyping() : this.hideTyping();
          break;

        case 'quick_replies':
          this.showQuickReplies(data.replies);
          break;

        case 'game_result':
          this.handleGameResult(data);
          break;

        case 'system':
          this.addMessage('system', data.content);
          break;

        case 'error':
          this.addMessage('system', 'Co loi xay ra. Vui long thu lai.');
          break;
      }
    }

    updateStatus(status) {
      if (!this.statusEl) return;

      switch (status) {
        case 'online':
          this.statusEl.textContent = '● Online';
          this.statusEl.className = 'gemral-status online';
          this.input.disabled = false;
          this.sendBtn.disabled = false;
          break;
        case 'offline':
          this.statusEl.textContent = '● Offline';
          this.statusEl.className = 'gemral-status offline';
          this.input.disabled = true;
          this.sendBtn.disabled = true;
          break;
        case 'connecting':
          this.statusEl.textContent = '● Dang ket noi...';
          this.statusEl.className = 'gemral-status offline';
          break;
      }
    }

    send() {
      const text = this.input.value.trim();
      if (!text || !this.isConnected) return;

      this.sendMessage(text);
      this.input.value = '';
    }

    sendMessage(text) {
      this.addMessage('user', text);
      this.showTyping();

      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'message',
          content: text,
          timestamp: Date.now()
        }));
      }

      // Save messages
      this.saveMessages();
    }

    addMessage(role, content) {
      const msg = document.createElement('div');
      msg.className = `gemral-message ${role}`;

      const time = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });

      msg.innerHTML = `
        ${this.escapeHtml(content)}
        <span class="time">${time}</span>
      `;

      this.messagesContainer.appendChild(msg);
      this.scrollToBottom();

      // Store message
      this.messages.push({ role, content, time: Date.now() });

      // Limit stored messages
      if (this.messages.length > 50) {
        this.messages = this.messages.slice(-50);
      }
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showTyping() {
      let typing = this.messagesContainer.querySelector('.gemral-typing');
      if (!typing) {
        typing = document.createElement('div');
        typing.className = 'gemral-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        this.messagesContainer.appendChild(typing);
      }
      typing.classList.add('show');
      this.scrollToBottom();
    }

    hideTyping() {
      const typing = this.messagesContainer.querySelector('.gemral-typing');
      if (typing) typing.classList.remove('show');
    }

    showQuickReplies(replies) {
      const container = this.container.querySelector('.gemral-quick-replies');
      container.innerHTML = replies.map(reply =>
        `<button class="gemral-quick-reply" data-action="${reply.action || ''}">${reply.label}</button>`
      ).join('');

      container.querySelectorAll('.gemral-quick-reply').forEach(btn => {
        btn.addEventListener('click', () => {
          this.sendMessage(btn.textContent);
        });
      });
    }

    handleGameResult(data) {
      // Handle game results (Lucky Wheel, etc.)
      if (data.game === 'lucky_wheel') {
        this.addMessage('assistant', data.message || 'Vong quay hoan thanh!');
      }
    }

    incrementBadge() {
      const current = parseInt(this.badgeEl.textContent) || 0;
      this.badgeEl.textContent = current + 1;
      this.badgeEl.classList.add('show');
    }

    clearBadge() {
      this.badgeEl.textContent = '0';
      this.badgeEl.classList.remove('show');
    }

    saveMessages() {
      try {
        const toSave = this.messages.slice(-20); // Keep last 20
        localStorage.setItem('gemral_messages', JSON.stringify(toSave));
      } catch (e) {
        // Storage full or disabled
      }
    }

    loadMessages() {
      try {
        const saved = localStorage.getItem('gemral_messages');
        if (saved) {
          const messages = JSON.parse(saved);
          // Only load if recent (last 24 hours)
          const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
          const recentMessages = messages.filter(m => m.time > dayAgo);

          if (recentMessages.length > 0) {
            this.messages = recentMessages;
            // Don't render old messages to avoid confusion
          }
        }
      } catch (e) {
        // Invalid storage
      }
    }

    // Public API
    open() {
      this.isOpen = true;
      this.chatWindow.classList.add('open');
      this.input.focus();
    }

    destroy() {
      if (this.ws) {
        this.ws.close();
      }
      this.container.remove();
      const style = document.getElementById('gemral-widget-styles');
      if (style) style.remove();
    }
  }

  // Initialize
  let widget = null;

  const initWidget = () => {
    if (!widget) {
      widget = new GemralWidget();
      window.GemralWidget = widget; // Expose for API access
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
