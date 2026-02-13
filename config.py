"""Configuration file"""
TOP_COINS = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
    'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT',
    'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'ATOM/USDT', 'ETC/USDT',
    'XLM/USDT', 'NEAR/USDT', 'ALGO/USDT', 'APT/USDT', 'ARB/USDT',
    'OP/USDT', 'INJ/USDT', 'TIA/USDT', 'SUI/USDT', 'SEI/USDT'
]
TIMEFRAMES = {'15 phút': '15m', '1 giờ': '1h', '4 giờ': '4h', '1 ngày': '1d'}
SENSITIVITY = 0.02
CANDLE_LIMIT = 200
USERS = {
    "admin": {"password": "admin123", "role": "admin"},
    "demo": {"password": "demo123", "role": "user"},
    "customer1": {"password": "pass123", "role": "user"}
}
APP_TITLE = "🎯 Crypto Pattern Scanner"
APP_ICON = "🚀"
PAGE_CONFIG = {'page_title': 'Pattern Scanner', 'page_icon': '🚀', 'layout': 'wide', 'initial_sidebar_state': 'expanded'}
# ============================================
# NÂNG CẤP PHIÊN BẢN CHUYÊN NGHIỆP
# ============================================

# Branding
COMPANY_NAME = "Gem Holding"
COMPANY_LOGO = "💎"
WATERMARK_TEXT = f"{COMPANY_NAME} © 2025 - Crypto Pattern Scanner"

# Icons
SIGNAL_ICONS = {
    'Bullish': '🟢',
    'Bearish': '🔴',
    'Neutral': '⚪'
}

ACTION_LABELS = {
    'Bullish': '🟢 MUA (BUY)',
    'Bearish': '🔴 BÁN (SELL)',
    'Neutral': '⚪ GIỮ (HOLD)'
}

# Chart colors
CHART_COLORS = {
    'bullish_candle': '#26a69a',
    'bearish_candle': '#ef5350',
    'pattern_highlight': 'rgba(255, 165, 0, 0.2)',
    'entry_line': '#00FF00',
    'sl_line': '#FF0000',
    'tp_line': '#FFD700',
    'volume_up': 'rgba(38, 166, 154, 0.5)',
    'volume_down': 'rgba(239, 83, 80, 0.5)'
}