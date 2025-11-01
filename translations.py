"""
Translations - Đa ngôn ngữ cho Crypto Pattern Scanner
Gem Holding © 2025
"""

PATTERN_TRANSLATIONS = {
    'Head and Shoulders': 'Đầu Vai (Head and Shoulders)',
    'Inverse Head and Shoulders': 'Đầu Vai Đảo (Inverse H&S)',
    'Double Top': 'Đỉnh Đôi (Double Top)',
    'Double Bottom': 'Đáy Đôi (Double Bottom)',
    'Triple Top': 'Đỉnh Ba (Triple Top)',
    'Triple Bottom': 'Đáy Ba (Triple Bottom)',
    'Ascending Triangle': 'Tam Giác Tăng (Ascending Triangle)',
    'Descending Triangle': 'Tam Giác Giảm (Descending Triangle)',
    'Symmetrical Triangle': 'Tam Giác Cân (Symmetrical Triangle)',
    'Bull Flag': 'Cờ Tăng (Bull Flag)',
    'Bear Flag': 'Cờ Giảm (Bear Flag)',
    'Pennant': 'Hình Cờ (Pennant)',
    'Wedge': 'Hình Nêm (Wedge)',
    'Price Trend': 'Xu Hướng Giá (Price Trend)',
    'Unknown': 'Không Xác Định (Unknown)',
}

SIGNAL_TRANSLATIONS = {
    'Bullish': 'Tăng',
    'Bearish': 'Giảm',
    'Neutral': 'Trung Lập'
}

ACTION_TEXT = {
    'Bullish': '🟢 MUA (BUY)',
    'Bearish': '🔴 BÁN (SELL)',
    'Neutral': '⚪ GIỮ (HOLD)'
}

def get_pattern_name_vi(pattern_name):
    """Get Vietnamese pattern name with safety check"""
    if pattern_name is None:
        return "Unknown Pattern"
    return PATTERN_TRANSLATIONS.get(pattern_name, pattern_name)

def get_signal_name_vi(signal):
    """Get Vietnamese signal name with safety check"""
    if signal is None:
        return "Neutral"
    return SIGNAL_TRANSLATIONS.get(signal, signal)

def get_action_text(signal):
    """Get action text with safety check"""
    if signal is None:
        return "⚪ GIỮ (HOLD)"
    return ACTION_TEXT.get(signal, f"⚪ {signal}")