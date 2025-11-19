/**
 * GEM Trading Academy Telegram Bot
 * Simple bot server to handle /start command and return Chat ID to users
 *
 * Installation:
 * npm install node-telegram-bot-api
 *
 * Run:
 * node bot.js
 */

const TelegramBot = require('node-telegram-bot-api');

// Bot token from @BotFather
const token = '8523437241:AAHRj4H-PerFn67NQAfL39D2TGkrDDokpRg';

// Create bot instance with polling
const bot = new TelegramBot(token, { polling: true });

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ GEM Trading Academy Bot is running...');
console.log('Bot username: @gem_trading_academy_bot');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';
  const username = msg.from.username ? `@${msg.from.username}` : '';

  console.log(`📱 New /start from ${firstName} ${username} (Chat ID: ${chatId})`);

  const message = `
👋 Xin chào <b>${firstName}</b>!

Đây là <b>GEM Trading Academy Bot</b> 💎

<b>Chat ID của bạn là:</b>
<code>${chatId}</code>

<b>📋 Hướng dẫn kết nối:</b>
1️⃣ Copy Chat ID ở trên (click vào số để copy)
2️⃣ Vào trang Settings trên website
3️⃣ Paste Chat ID vào ô "Telegram Connect"
4️⃣ Click "Kết Nối"

Sau khi kết nối, bạn sẽ nhận alerts khi:
✅ Phát hiện pattern mới
✅ Giá chạm Entry/SL/TP levels

<i>⚠️ Lưu ý: Bot này chỉ gửi thông báo, không thực hiện giao dịch.</i>

<b>Cần trợ giúp?</b> Liên hệ support@gemtrading.com

Happy trading! 🚀
  `.trim();

  bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Handle any other message (not /start)
bot.on('message', (msg) => {
  // Skip if it's a /start command (already handled above)
  if (msg.text?.startsWith('/start')) {
    return;
  }

  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';

  console.log(`💬 Message from ${firstName} (Chat ID: ${chatId}): ${msg.text}`);

  // Send Chat ID as response
  const message = `
📱 <b>Chat ID của bạn:</b> <code>${chatId}</code>

Sử dụng Chat ID này để kết nối với website GEM Trading Academy.

Gửi /start để xem hướng dẫn chi tiết.
  `.trim();

  bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `
📚 <b>GEM Trading Academy Bot - Trợ Giúp</b>

<b>Các lệnh:</b>
/start - Bắt đầu và lấy Chat ID
/help - Hiển thị trợ giúp này
/chatid - Xem Chat ID của bạn

<b>Tính năng:</b>
🔔 Nhận thông báo pattern detection
📊 Alerts khi giá chạm Entry/SL/TP
💎 Dành cho Tier 1+ users

<b>Cần hỗ trợ?</b>
Email: support@gemtrading.com
Website: https://gemtrading.com

<i>Bot được phát triển bởi GEM Trading Academy</i>
  `.trim();

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
});

// Handle /chatid command
bot.onText(/\/chatid/, (msg) => {
  const chatId = msg.chat.id;

  const message = `
📱 <b>Chat ID của bạn:</b>
<code>${chatId}</code>

Copy ID này và paste vào trang Settings để kết nối alerts!
  `.trim();

  bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.code, error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏸️  Shutting down bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏸️  Shutting down bot...');
  bot.stopPolling();
  process.exit(0);
});
