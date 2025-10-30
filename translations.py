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
    return PATTERN_TRANSLATIONS.get(pattern_name, pattern_name)

def get_signal_name_vi(signal):
    return SIGNAL_TRANSLATIONS.get(signal, signal)

def get_action_text(signal):
    return ACTION_TEXT.get(signal, signal)