# GEM Trading Academy Telegram Bot

Simple Telegram bot để handle /start command và return Chat ID cho users.

## Bot Info

- **Username:** @gem_trading_academy_bot
- **Token:** `8523437241:AAGKbRXrOLs6gWuODEBwHqbzvHi7QyG4peQ`

## Installation

```bash
npm install
```

## Run Bot

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

## Features

- ✅ Respond to `/start` command với Chat ID
- ✅ Respond to `/help` với hướng dẫn
- ✅ Respond to `/chatid` để xem Chat ID
- ✅ Auto-respond to any message với Chat ID
- ✅ Graceful shutdown (Ctrl+C)
- ✅ Error handling

## Usage

1. Start bot: `npm start`
2. Mở Telegram, search `@gem_trading_academy_bot`
3. Send `/start`
4. Bot sẽ trả về Chat ID
5. Copy Chat ID
6. Paste vào website Settings để connect

## Commands

- `/start` - Bắt đầu và lấy Chat ID
- `/help` - Xem hướng dẫn
- `/chatid` - Xem Chat ID hiện tại

## Deployment

### Option 1: VPS (Recommended)
```bash
# SSH vào VPS
ssh user@your-vps-ip

# Clone repository
git clone <repo-url>
cd crypto-pattern-scanner/telegram-bot

# Install dependencies
npm install

# Run with PM2 (process manager)
npm install -g pm2
pm2 start bot.js --name gem-trading-bot
pm2 save
pm2 startup

# View logs
pm2 logs gem-trading-bot
```

### Option 2: Heroku
```bash
# Create Procfile
echo "worker: node bot.js" > Procfile

# Deploy
heroku create gem-trading-bot
git push heroku main
heroku ps:scale worker=1
```

### Option 3: Local (Development only)
```bash
npm start
# Keep terminal open
```

## Environment Variables (Optional)

Nếu muốn hide token, tạo `.env` file:

```env
TELEGRAM_BOT_TOKEN=8523437241:AAGKbRXrOLs6gWuODEBwHqbzvHi7QyG4peQ
```

Cập nhật `bot.js`:
```javascript
require('dotenv').config();
const token = process.env.TELEGRAM_BOT_TOKEN;
```

## Monitoring

```bash
# View logs
pm2 logs gem-trading-bot

# Restart bot
pm2 restart gem-trading-bot

# Stop bot
pm2 stop gem-trading-bot

# Delete from PM2
pm2 delete gem-trading-bot
```

## Troubleshooting

### Bot không phản hồi
1. Check bot đang chạy: `pm2 status`
2. Check logs: `pm2 logs gem-trading-bot`
3. Restart: `pm2 restart gem-trading-bot`

### Polling error
- Chỉ 1 instance bot có thể chạy cùng lúc
- Nếu deploy nhiều nơi, dừng các instance khác

## Security

- ⚠️ **KHÔNG** commit token vào Git
- ✅ Sử dụng environment variables
- ✅ Giới hạn bot commands
- ✅ Validate Chat ID format

## Support

Email: support@gemtrading.com
Website: https://gemtrading.com
