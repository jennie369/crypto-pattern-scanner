# 📘 Paper Trading User Guide

Welcome to **GEM Trading's Paper Trading System** - practice trading without risking real money!

---

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Placing Orders](#placing-orders)
4. [Managing Positions](#managing-positions)
5. [Understanding P&L](#understanding-pnl)
6. [Advanced Features](#advanced-features)
7. [FAQ](#faq)

---

## Introduction

### What is Paper Trading?

Paper Trading allows you to practice cryptocurrency trading with **simulated money** using **real market prices**. Perfect for:
- 🎓 **Learning**: Master trading without risk
- 🧪 **Testing Strategies**: Try new approaches safely
- 📈 **Building Confidence**: Practice before going live
- 🎯 **Understanding Markets**: Learn price action and patterns

### Key Features
- ✅ Real-time prices from Binance WebSocket
- ✅ Multiple order types (Market, Limit, Stop-Limit)
- ✅ Take Profit & Stop Loss automation
- ✅ Real-time P&L tracking
- ✅ Trade history and analytics
- ✅ No real money at risk!

---

## Getting Started

### Step 1: Access Paper Trading

**From Scanner:**
1. Navigate to **Dashboard → Scanner**
2. Run a pattern scan
3. Click **"Paper Trade"** button on any result
4. Trading panel opens on the right side

**From Open Positions Widget:**
1. View your open positions in the right sidebar
2. Click **"Manage"** on any position
3. Panel opens for that specific symbol

### Step 2: Your Paper Trading Balance

- Default balance: **$10,000 USDT** (simulated)
- Balance visible at top of trading panel
- Resets on request (contact support)

### Step 3: Choose Your Order Type

Three order types available:
- **Market**: Execute immediately at current price
- **Limit**: Set your target price, execute when reached
- **Stop Limit**: Advanced trigger-based orders

---

## Placing Orders

### 🟢 Market Order (Instant Execution)

**Best for:** Quick entries, urgent trades

**How to place:**
1. Select **"Market"** tab
2. Enter quantity (use % buttons for quick selection: 25%, 50%, 75%, 100%)
3. Review **Cost** and **Fee** (0.1%)
4. Click **BUY** or **SELL**
5. ✅ Order executes immediately!

**Example:**
```
Symbol: BTCUSDT
Current Price: $50,000
Quantity: 0.1 BTC
Cost: $5,000
Fee: $5 (0.1%)
Total: $5,005
```

---

### 🎯 Limit Order (Set Your Price)

**Best for:** Buying dips, selling peaks, precise entries

**How to place:**
1. Select **"Limit"** tab
2. Enter **Limit Price** (your target entry/exit price)
   - Use quick buttons: **-1%**, **Market**, **+1%**
3. Enter quantity
4. Click **BUY** or **SELL**
5. ⏳ Order stays pending until price reaches your limit

**Example:**
```
Symbol: ETHUSDT
Current Price: $3,000
Limit Price: $2,900 (buying the dip)
Quantity: 1 ETH
Status: PENDING → Executes when ETH drops to $2,900
```

---

### ⚡ Stop Limit Order (Trigger-Based)

**Best for:** Breakout entries, protecting profits

**How to place:**
1. Select **"Stop Limit"** tab
2. Enter **Stop Price** (trigger price)
3. Enter **Limit Price** (execution price after trigger)
4. Enter quantity
5. Click **BUY** or **SELL**
6. Order triggers at stop price, executes at limit price

**Example:**
```
Symbol: BTCUSDT
Current Price: $50,000
Stop Price: $51,000 (breakout trigger)
Limit Price: $51,100 (execute slightly above breakout)
Status: PENDING → Triggers at $51k, fills at $51.1k
```

---

## Managing Positions

### View Open Positions

**Open Positions Widget** (Scanner page, right sidebar):
- Shows all your active positions
- Real-time P&L updates
- Current price vs Entry price
- Sort by: P&L, Symbol, Entry Price

### Close a Position

**Method 1: Quick Close**
1. Find position in **Open Positions Widget**
2. Click **"Close Position"** button
3. Confirm in dialog
4. ✅ Position closes at current market price

**Method 2: Manual Sell Order**
1. Click **"Manage"** on position
2. Trading panel opens
3. Place a SELL order for the same quantity
4. Position closes when order fills

---

### ✨ Take Profit & Stop Loss (TP/SL)

**Automate your exits!** Set profit targets and stop losses when placing orders.

#### How to Set TP/SL:

1. **When placing ANY order** (Market/Limit/Stop-Limit):
   - ✅ Check **"Take Profit"** checkbox
   - Enter TP price (or use quick buttons: **+2%**, **+5%**, **+10%**, **+20%**)
   - ✅ Check **"Stop Loss"** checkbox
   - Enter SL price (or use quick buttons: **-2%**, **-5%**, **-10%**, **-20%**)

2. **What happens:**
   - TP and SL orders created automatically
   - Linked to your main position
   - When **TP hits** → Position closes with profit, SL cancels
   - When **SL hits** → Position closes with loss, TP cancels
   - **OCO (One-Cancels-Other)** logic built-in!

#### Example:
```
BUY Order:
Symbol: BTCUSDT
Entry: $50,000
Quantity: 0.1 BTC
Take Profit: $52,000 (+4%)
Stop Loss: $49,000 (-2%)

Scenarios:
✅ Price hits $52,000 → TP executes → Profit: $200
❌ Price drops to $49,000 → SL executes → Loss: -$100
```

> **💎 Note:** TP/SL requires **TIER1+** subscription. FREE tier can use manual orders.

---

## Understanding P&L

### What is P&L?

**P&L (Profit & Loss)** shows how much you've gained or lost on a position.

### P&L Formula

```
P&L = (Current Price - Entry Price) × Quantity
P&L % = ((Current Price / Entry Price) - 1) × 100%
```

### Example Calculation:

```
Position:
Entry Price: $50,000
Current Price: $51,500
Quantity: 0.1 BTC

P&L = ($51,500 - $50,000) × 0.1 = +$150
P&L % = (($51,500 / $50,000) - 1) × 100% = +3%

✅ You're up $150 (+3%)!
```

### P&L Colors:
- 🟢 **Green**: Profit (positive P&L)
- 🔴 **Red**: Loss (negative P&L)

### Where to See P&L:
- **Open Positions Widget**: Real-time P&L for each position
- **Recent Trades Section**: Final P&L for closed trades
- **Portfolio Page**: Detailed analytics and history

---

## Advanced Features

### 🛡️ Reduce-Only Orders

**What it does:** Order can only close existing positions, never open new ones.

**When to use:**
- Taking profits on existing position
- Risk management (prevent accidental position increase)
- Closing positions in stages

**How to enable:**
1. ✅ Check **"Reduce-Only"** checkbox
2. Place order
3. If you have no position, order will be rejected

---

### ⏱️ Time in Force (TIF)

Controls how long your order stays active:

| Option | Description | When to Use |
|--------|-------------|-------------|
| **GTC** | Good Till Cancel - stays active until filled or manually cancelled | Default, normal orders |
| **IOC** | Immediate or Cancel - fill now or cancel unfilled portion | Need instant partial fills |
| **FOK** | Fill or Kill - fill entire order now or cancel completely | All-or-nothing orders |

---

### 📊 Quick Buttons

**Price Buttons:**
- **-1%**: Set price 1% below market
- **Market**: Use current market price
- **+1%**: Set price 1% above market

**Quantity Buttons:**
- **25%**: Use 25% of available balance
- **50%**: Use 50% of available balance
- **75%**: Use 75% of available balance
- **100%**: Use 100% of available balance (max)

**Take Profit % Buttons:**
- **+2%**, **+5%**, **+10%**, **+20%**: Set TP above entry

**Stop Loss % Buttons:**
- **-2%**, **-5%**, **-10%**, **-20%**: Set SL below entry

---

## FAQ

### Q: Is paper trading balance real money?
**A:** No! It's 100% simulated. You cannot withdraw or lose real funds.

### Q: Do I need a subscription for Paper Trading?
**A:** Basic trading is **FREE**. TP/SL features require **TIER1+** ($9.99/month).

### Q: What happens if I close my browser?
**A:** Your positions and pending orders remain active. They're stored in the database and will be there when you return.

### Q: How accurate are the prices?
**A:** Prices are real-time from **Binance WebSocket API** - the same prices you'd see on Binance.

### Q: Why didn't my limit order fill?
**A:** Price must reach your exact limit price. Check:
- Current market price
- Order direction (buy limit should be below market, sell limit above)
- Order status in Orders History

### Q: Can I have multiple positions at once?
**A:** Yes! No limit on number of positions or pending orders.

### Q: What's the fee rate?
**A:** **0.1%** (same as Binance spot trading) - applied to all trades for realism.

### Q: Can I reset my balance?
**A:** Contact support or check Settings page for balance reset option.

### Q: What if I make a mistake?
**A:** For pending orders: cancel them before they fill.
For filled orders: close the position manually.
It's practice money - mistakes are part of learning!

### Q: How do I see my trade history?
**A:** Go to **Dashboard → Portfolio** for complete trade history, analytics, and performance metrics.

### Q: Is there a mobile app?
**A:** Web app is mobile-responsive. Access from any mobile browser!

---

## Need Help?

- 💬 **Live Chat**: Click support icon (bottom right)
- 📧 **Email**: support@gemtrading.com
- 📖 **Documentation**: [Developer Guide](./DEVELOPER_GUIDE_PAPER_TRADING.md)
- 🐛 **Bug Reports**: GitHub Issues

---

## Quick Start Checklist

- [ ] Open Scanner page
- [ ] Click "Paper Trade" on a scan result
- [ ] Select Market order
- [ ] Enter quantity (try 25% button)
- [ ] Click BUY
- [ ] See position in Open Positions Widget
- [ ] Watch real-time P&L update
- [ ] Close position when ready
- [ ] Check Recent Trades section

**Happy Trading! 🚀**

---

*Last updated: 2025-01-20*
*Version: 1.0*
