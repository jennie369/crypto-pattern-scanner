import numpy as np
import pandas as pd
from typing import List, Dict

class PatternDetector:
    def __init__(self, sensitivity: float = 0.02):
        self.sensitivity = sensitivity
    
    def detect_all_patterns(self, df: pd.DataFrame) -> List[Dict]:
        patterns = []
        df = self._add_indicators(df)
        
        if self._detect_head_and_shoulders(df):
            patterns.append({'pattern': 'Head and Shoulders', 'type': 'Bearish', 'confidence': 75, 'description': 'Bearish reversal'})
        if self._detect_double_top(df):
            patterns.append({'pattern': 'Double Top', 'type': 'Bearish', 'confidence': 70, 'description': 'Bearish signal'})
        if self._detect_double_bottom(df):
            patterns.append({'pattern': 'Double Bottom', 'type': 'Bullish', 'confidence': 72, 'description': 'Bullish signal'})
        if self._detect_ascending_triangle(df):
            patterns.append({'pattern': 'Ascending Triangle', 'type': 'Bullish', 'confidence': 68, 'description': 'Bullish continuation'})
        if self._detect_bull_flag(df):
            patterns.append({'pattern': 'Bull Flag', 'type': 'Bullish', 'confidence': 65, 'description': 'Continuation pattern'})
        
        return patterns
    
    def _add_indicators(self, df):
        df = df.copy()
        df['sma_20'] = df['close'].rolling(20).mean()
        return df
    
    def _detect_head_and_shoulders(self, df):
        if len(df) < 60:
            return False
        recent = df.tail(60)
        highs = recent['high'].values
        peaks = self._find_peaks(highs)
        return len(peaks) >= 3
    
    def _detect_double_top(self, df):
        if len(df) < 40:
            return False
        highs = df.tail(40)['high'].values
        peaks = self._find_peaks(highs)
        return len(peaks) >= 2
    
    def _detect_double_bottom(self, df):
        if len(df) < 40:
            return False
        lows = df.tail(40)['low'].values
        troughs = self._find_troughs(lows)
        return len(troughs) >= 2
    
    def _detect_ascending_triangle(self, df):
        if len(df) < 30:
            return False
        recent = df.tail(30)
        highs = recent['high'].values
        high_trend = np.polyfit(range(len(highs)), highs, 1)
        return abs(high_trend[0]) < 0.5
    
    def _detect_bull_flag(self, df):
        if len(df) < 40:
            return False
        closes = df.tail(40)['close'].values
        flagpole = closes[-40:-25]
        return (flagpole[-1] - flagpole[0]) / flagpole[0] > 0.05
    
    def _find_peaks(self, data, distance=5):
        peaks = []
        for i in range(distance, len(data) - distance):
            if data[i] == max(data[i-distance:i+distance+1]):
                peaks.append(i)
        return peaks
    
    def _find_troughs(self, data, distance=5):
        troughs = []
        for i in range(distance, len(data) - distance):
            if data[i] == min(data[i-distance:i+distance+1]):
                troughs.append(i)
        return troughs
