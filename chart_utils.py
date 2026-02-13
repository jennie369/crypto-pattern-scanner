import plotly.graph_objects as go
import pandas as pd
import numpy as np
from typing import Dict

class ChartGenerator:
    def __init__(self):
        self.colors = {
            'bullish': '#26a69a',
            'bearish': '#ef5350',
            'entry': '#2196F3',
            'stop': '#f44336',
            'target': '#4caf50'
        }
    
    def create_pattern_chart(self, df: pd.DataFrame, pattern: Dict, coin: str):
        # Candlestick
        fig = go.Figure(data=[go.Candlestick(
            x=df['timestamp'],
            open=df['open'],
            high=df['high'],
            low=df['low'],
            close=df['close'],
            increasing_line_color=self.colors['bullish'],
            decreasing_line_color=self.colors['bearish'],
            name='Price'
        )])
        
        # Volume
        fig.add_trace(go.Bar(
            x=df['timestamp'],
            y=df['volume'],
            name='Volume',
            marker_color='rgba(128,128,128,0.3)',
            yaxis='y2'
        ))
        
        # MA20
        if 'sma_20' in df.columns:
            fig.add_trace(go.Scatter(
                x=df['timestamp'],
                y=df['sma_20'],
                name='MA20',
                line=dict(color='orange', width=1)
            ))
        
        # Signals
        signals = self._calculate_signals(df, pattern)
        
        # Entry point
        if signals['entry']:
            symbol = 'triangle-up' if pattern['type'] == 'Bullish' else 'triangle-down'
            text = 'BUY' if pattern['type'] == 'Bullish' else 'SELL'
            
            fig.add_trace(go.Scatter(
                x=[signals['entry']['time']],
                y=[signals['entry']['price']],
                mode='markers+text',
                marker=dict(size=20, color=self.colors['entry'], symbol=symbol),
                text=[text],
                textposition='top center',
                name='Entry'
            ))
        
        # Stop Loss
        if signals['stop_loss']:
            fig.add_hline(
                y=signals['stop_loss'],
                line_dash="dash",
                line_color=self.colors['stop'],
                annotation_text=f"SL: ${signals['stop_loss']:,.2f}",
                annotation_position="right"
            )
        
        # Take Profits
        if signals['take_profit']:
            for i, tp in enumerate(signals['take_profit'][:3], 1):
                fig.add_hline(
                    y=tp,
                    line_dash="dot",
                    line_color=self.colors['target'],
                    annotation_text=f"TP{i}: ${tp:,.2f}",
                    annotation_position="right"
                )
        
        # Pattern info box
        pattern_text = f"🎯 {pattern['pattern']}<br>Type: {pattern['type']}<br>Confidence: {pattern['confidence']}%"
        fig.add_annotation(
            x=0.02, y=0.98,
            xref='paper', yref='paper',
            text=pattern_text,
            showarrow=False,
            bgcolor='rgba(255,255,255,0.8)',
            bordercolor='black',
            borderwidth=1,
            font=dict(size=11),
            align='left',
            xanchor='left',
            yanchor='top'
        )
        
        # Layout
        fig.update_layout(
            title=f"{coin} - {pattern['pattern']}",
            xaxis_title="Time",
            yaxis_title="Price (USDT)",
            yaxis2=dict(title="Volume", overlaying='y', side='right'),
            height=500,
            hovermode='x unified',
            template='plotly_white',
            showlegend=True
        )
        
        return fig, signals
    
    def _calculate_signals(self, df: pd.DataFrame, pattern: Dict) -> Dict:
        current_price = df['close'].iloc[-1]
        atr = self._calculate_atr(df)
        
        if pattern.get('type', pattern.get('signal', '')) == 'Bullish':
            entry = current_price
            stop_loss = entry - (2 * atr)
            take_profit = [entry + (2*atr), entry + (4*atr), entry + (6*atr)]
        else:
            entry = current_price
            stop_loss = entry + (2 * atr)
            take_profit = [entry - (2*atr), entry - (4*atr), entry - (6*atr)]
        
        return {
            'entry': {'price': entry, 'time': df['timestamp'].iloc[-1]},
            'stop_loss': stop_loss,
            'take_profit': take_profit,
            'atr': atr
        }
    
    def _calculate_atr(self, df: pd.DataFrame, period: int = 14) -> float:
        high_low = df['high'] - df['low']
        high_close = abs(df['high'] - df['close'].shift())
        low_close = abs(df['low'] - df['close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = ranges.max(axis=1)
        atr = true_range.rolling(period).mean().iloc[-1]
        return atr if not pd.isna(atr) else (df['high'].iloc[-1] - df['low'].iloc[-1])
    
    def create_trading_card(self, signals: Dict, pattern: Dict) -> str:
        entry = signals['entry']['price']
        stop = signals['stop_loss']
        tp1, tp2, tp3 = signals['take_profit']
        risk = abs(entry - stop)
        reward = abs(tp1 - entry)
        rr = reward / risk if risk > 0 else 0
        
        return f"""
### 📋 TRADING PLAN

**Pattern:** {pattern['pattern']}  
**Type:** {pattern['type']}  
**Confidence:** {pattern['confidence']}%

---

**Entry:** `${entry:,.2f}`  
**Stop Loss:** `${stop:,.2f}` ❌  
**Risk:** ${risk:,.2f} ({risk/entry*100:.2f}%)

**TP1:** `${tp1:,.2f}` ✅  
**TP2:** `${tp2:,.2f}` ✅  
**TP3:** `${tp3:,.2f}` ✅

**R/R:** 1:{rr:.1f}

---

### 🎬 ACTION

**{'🟢 BUY' if pattern['type'] == 'Bullish' else '🔴 SELL'}**

1. Entry at ${entry:,.2f}
2. Set SL at ${stop:,.2f}
3. Close 50% at TP1
4. Trail remaining
"""
