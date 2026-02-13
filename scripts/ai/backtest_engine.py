# scripts/ai/backtest_engine.py
# Core backtesting engine
# GEMRAL AI BRAIN - Phase 7

import os
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from enum import Enum
import json

from feature_extractor import (
    Candle, PatternFeatures, extract_features,
    zone_retest_validation, calculate_atr
)

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

DEFAULT_INITIAL_CAPITAL = 10000
DEFAULT_POSITION_SIZE_PERCENT = 2.0
DEFAULT_MAX_CONCURRENT_TRADES = 5
DEFAULT_RISK_REWARD_TARGET = 2.5

# ═══════════════════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════════════════

class TradeDirection(Enum):
    LONG = 'long'
    SHORT = 'short'

class TradeOutcome(Enum):
    WIN = 'win'
    LOSS = 'loss'
    BREAKEVEN = 'breakeven'
    OPEN = 'open'

class ExitReason(Enum):
    TAKE_PROFIT = 'take_profit'
    STOP_LOSS = 'stop_loss'
    TRAILING_STOP = 'trailing_stop'
    SIGNAL_EXIT = 'signal_exit'
    TIME_EXIT = 'time_exit'

# ═══════════════════════════════════════════════════════════════════════════
# DATA CLASSES
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class BacktestConfig:
    """Configuration for a backtest run."""
    # Time range
    date_from: datetime
    date_to: datetime

    # Scope
    symbols: List[str] = field(default_factory=lambda: ['BTCUSDT', 'ETHUSDT'])
    timeframes: List[str] = field(default_factory=lambda: ['4h'])
    pattern_codes: Optional[List[str]] = None  # None = all patterns

    # Capital
    initial_capital: float = DEFAULT_INITIAL_CAPITAL
    position_size_type: str = 'percent'  # 'percent', 'fixed', 'kelly'
    position_size_value: float = DEFAULT_POSITION_SIZE_PERCENT
    max_concurrent_trades: int = DEFAULT_MAX_CONCURRENT_TRADES

    # Risk management
    use_stop_loss: bool = True
    stop_loss_type: str = 'pattern'  # 'pattern', 'atr', 'percent'
    stop_loss_value: Optional[float] = None

    use_take_profit: bool = True
    take_profit_type: str = 'rr_ratio'  # 'pattern', 'rr_ratio', 'percent'
    take_profit_value: float = DEFAULT_RISK_REWARD_TARGET

    # Filters (CRITICAL for win rate)
    use_filters: bool = True
    min_score_threshold: float = 0.5
    require_zone_retest: bool = True  # KEY for 68%+ win rate

@dataclass
class Position:
    """An open position."""
    id: str
    pattern_code: str
    symbol: str
    timeframe: str
    direction: TradeDirection

    # Entry
    entry_time: datetime
    entry_price: float
    entry_score: float
    entry_candle_index: int

    # Size
    position_size: float  # Units
    position_value: float  # USD value

    # Risk levels
    stop_loss: float
    take_profit: float
    trailing_stop: Optional[float] = None

    # Zone retest
    had_zone_retest: bool = False
    retest_quality: float = 0.0

    # Tracking
    max_favorable_excursion: float = 0.0
    max_adverse_excursion: float = 0.0
    entry_features: Optional[Dict] = None

@dataclass
class Trade:
    """A completed trade."""
    id: str
    trade_number: int
    pattern_code: str
    symbol: str
    timeframe: str
    direction: TradeDirection

    # Entry
    entry_time: datetime
    entry_price: float
    entry_score: float
    entry_reason: str

    # Exit
    exit_time: datetime
    exit_price: float
    exit_reason: ExitReason

    # Position
    position_size: float
    position_value: float

    # Results
    profit_loss: float
    profit_loss_percent: float
    outcome: TradeOutcome

    # Risk metrics
    max_favorable_excursion: float
    max_adverse_excursion: float
    risk_reward_actual: float

    # Duration
    duration_candles: int
    duration_hours: float

    # Zone retest
    had_zone_retest: bool
    retest_quality: float

    # Features
    entry_features: Dict = field(default_factory=dict)

@dataclass
class BacktestState:
    """Current state of a backtest."""
    current_capital: float
    peak_capital: float
    lowest_capital: float
    current_drawdown: float
    max_drawdown: float

    open_positions: List[Position]
    closed_trades: List[Trade]

    equity_curve: List[Dict]  # [{time, equity, drawdown}]

    trade_counter: int = 0

# ═══════════════════════════════════════════════════════════════════════════
# BACKTEST ENGINE
# ═══════════════════════════════════════════════════════════════════════════

class BacktestEngine:
    """Main backtesting engine."""

    def __init__(self, config: BacktestConfig):
        self.config = config
        self.state = BacktestState(
            current_capital=config.initial_capital,
            peak_capital=config.initial_capital,
            lowest_capital=config.initial_capital,
            current_drawdown=0.0,
            max_drawdown=0.0,
            open_positions=[],
            closed_trades=[],
            equity_curve=[],
        )

    def run(self, candles_data: Dict[str, Dict[str, List[Candle]]]) -> Dict:
        """
        Run the backtest.

        Args:
            candles_data: {symbol: {timeframe: [candles]}}

        Returns:
            Backtest results summary
        """
        print(f'[Backtest] Starting backtest from {self.config.date_from} to {self.config.date_to}')
        print(f'[Backtest] Symbols: {self.config.symbols}')
        print(f'[Backtest] Timeframes: {self.config.timeframes}')
        print(f'[Backtest] Require Zone Retest: {self.config.require_zone_retest}')

        # Process each symbol and timeframe
        for symbol in self.config.symbols:
            if symbol not in candles_data:
                print(f'[Backtest] No data for {symbol}')
                continue

            for timeframe in self.config.timeframes:
                if timeframe not in candles_data[symbol]:
                    print(f'[Backtest] No data for {symbol} {timeframe}')
                    continue

                candles = candles_data[symbol][timeframe]
                self._process_candles(symbol, timeframe, candles)

        # Close any remaining open positions at last price
        self._close_all_positions()

        # Calculate summary
        summary = self._calculate_summary()

        print(f'[Backtest] Completed. {len(self.state.closed_trades)} trades.')
        print(f'[Backtest] Win rate: {summary["win_rate"]:.2%}')
        print(f'[Backtest] Profit Factor: {summary["profit_factor"]:.2f}')

        return summary

    def _process_candles(
        self,
        symbol: str,
        timeframe: str,
        candles: List[Candle]
    ):
        """Process candles for a symbol/timeframe."""
        print(f'[Backtest] Processing {symbol} {timeframe}: {len(candles)} candles')

        # Need at least 200 candles for indicators
        if len(candles) < 200:
            print(f'[Backtest] Not enough candles for {symbol} {timeframe}')
            return

        for i in range(200, len(candles)):
            candle = candles[i]

            # Update open positions
            self._update_positions(candle, candles[:i+1])

            # Check for new patterns
            if len(self.state.open_positions) < self.config.max_concurrent_trades:
                self._check_for_patterns(symbol, timeframe, candles[:i+1], i)

            # Record equity
            if i % 24 == 0:  # Sample every ~day for 1h candles
                self._record_equity(candle.timestamp)

    def _check_for_patterns(
        self,
        symbol: str,
        timeframe: str,
        candles: List[Candle],
        current_index: int
    ):
        """Check for pattern signals at current candle."""
        # Simplified pattern detection for backtest
        # In production, this would call the full pattern detection engine

        # Example: Simple double bottom detection
        pattern = self._detect_simple_pattern(candles, current_index)
        if pattern is None:
            return

        pattern_code, direction, zone_price, zone_type = pattern

        # Check filters
        if self.config.use_filters:
            # Extract features
            try:
                features = extract_features(
                    candles,
                    current_index - 20,  # Approximate pattern start
                    current_index,
                    zone_price,
                    zone_type
                )

                # Check score threshold
                if features.overall_score < self.config.min_score_threshold:
                    return

                # Check zone retest requirement (KEY)
                if self.config.require_zone_retest and not features.has_zone_retest:
                    return

            except Exception as e:
                print(f'[Backtest] Feature extraction error: {e}')
                return
        else:
            features = None

        # Calculate position size
        position_size, position_value = self._calculate_position_size(candles[-1].close)

        if position_value <= 0:
            return

        # Calculate stop loss and take profit
        current_price = candles[-1].close
        atr = calculate_atr(candles)[-1]

        if direction == TradeDirection.LONG:
            stop_loss = current_price - (atr * 2)
            take_profit = current_price + (atr * 2 * self.config.take_profit_value)
        else:
            stop_loss = current_price + (atr * 2)
            take_profit = current_price - (atr * 2 * self.config.take_profit_value)

        # Open position
        self.state.trade_counter += 1
        position = Position(
            id=f'{symbol}_{timeframe}_{self.state.trade_counter}',
            pattern_code=pattern_code,
            symbol=symbol,
            timeframe=timeframe,
            direction=direction,
            entry_time=datetime.fromtimestamp(candles[-1].timestamp / 1000),
            entry_price=current_price,
            entry_score=features.overall_score if features else 0.5,
            entry_candle_index=current_index,
            position_size=position_size,
            position_value=position_value,
            stop_loss=stop_loss,
            take_profit=take_profit,
            had_zone_retest=features.has_zone_retest if features else False,
            retest_quality=features.retest_quality_score if features else 0.0,
            entry_features=self._features_to_dict(features) if features else {},
        )

        self.state.open_positions.append(position)
        self.state.current_capital -= position_value

    def _detect_simple_pattern(
        self,
        candles: List[Candle],
        current_index: int
    ) -> Optional[Tuple[str, TradeDirection, float, str]]:
        """
        Simplified pattern detection for backtesting.
        Returns (pattern_code, direction, zone_price, zone_type) or None.
        """
        # This is a simplified version - real implementation would be more complex

        if len(candles) < 50:
            return None

        # Look for simple price patterns
        recent = candles[-30:]
        closes = [c.close for c in recent]
        lows = [c.low for c in recent]
        highs = [c.high for c in recent]

        # Simple double bottom check
        min_idx_1 = lows[:15].index(min(lows[:15]))
        min_idx_2 = lows[15:].index(min(lows[15:])) + 15

        if min_idx_2 > min_idx_1 + 5:  # At least 5 candles apart
            low_1 = lows[min_idx_1]
            low_2 = lows[min_idx_2]

            # Lows should be similar (within 2%)
            if abs(low_1 - low_2) / low_1 < 0.02:
                # Price should have bounced between lows
                high_between = max(highs[min_idx_1:min_idx_2])
                if high_between > low_1 * 1.03:  # At least 3% bounce
                    # Current price should be above the neckline
                    if closes[-1] > high_between:
                        zone_price = (low_1 + low_2) / 2
                        return ('double_bottom', TradeDirection.LONG, zone_price, 'support')

        # Simple double top check
        max_idx_1 = highs[:15].index(max(highs[:15]))
        max_idx_2 = highs[15:].index(max(highs[15:])) + 15

        if max_idx_2 > max_idx_1 + 5:
            high_1 = highs[max_idx_1]
            high_2 = highs[max_idx_2]

            if abs(high_1 - high_2) / high_1 < 0.02:
                low_between = min(lows[max_idx_1:max_idx_2])
                if low_between < high_1 * 0.97:
                    if closes[-1] < low_between:
                        zone_price = (high_1 + high_2) / 2
                        return ('double_top', TradeDirection.SHORT, zone_price, 'resistance')

        return None

    def _update_positions(self, candle: Candle, all_candles: List[Candle]):
        """Update all open positions with current candle."""
        positions_to_close = []

        for position in self.state.open_positions:
            current_price = candle.close
            high_price = candle.high
            low_price = candle.low

            # Track MFE/MAE
            if position.direction == TradeDirection.LONG:
                unrealized_pnl = (current_price - position.entry_price) / position.entry_price
                position.max_favorable_excursion = max(
                    position.max_favorable_excursion,
                    (high_price - position.entry_price) / position.entry_price
                )
                position.max_adverse_excursion = max(
                    position.max_adverse_excursion,
                    (position.entry_price - low_price) / position.entry_price
                )

                # Check stop loss
                if low_price <= position.stop_loss:
                    positions_to_close.append((position, position.stop_loss, ExitReason.STOP_LOSS))
                    continue

                # Check take profit
                if high_price >= position.take_profit:
                    positions_to_close.append((position, position.take_profit, ExitReason.TAKE_PROFIT))
                    continue

            else:  # SHORT
                unrealized_pnl = (position.entry_price - current_price) / position.entry_price
                position.max_favorable_excursion = max(
                    position.max_favorable_excursion,
                    (position.entry_price - low_price) / position.entry_price
                )
                position.max_adverse_excursion = max(
                    position.max_adverse_excursion,
                    (high_price - position.entry_price) / position.entry_price
                )

                # Check stop loss
                if high_price >= position.stop_loss:
                    positions_to_close.append((position, position.stop_loss, ExitReason.STOP_LOSS))
                    continue

                # Check take profit
                if low_price <= position.take_profit:
                    positions_to_close.append((position, position.take_profit, ExitReason.TAKE_PROFIT))
                    continue

        # Close positions
        for position, exit_price, exit_reason in positions_to_close:
            self._close_position(position, candle, exit_price, exit_reason)

    def _close_position(
        self,
        position: Position,
        candle: Candle,
        exit_price: float,
        exit_reason: ExitReason
    ):
        """Close a position and record the trade."""
        self.state.open_positions.remove(position)

        # Calculate P&L
        if position.direction == TradeDirection.LONG:
            profit_loss = (exit_price - position.entry_price) * position.position_size
            profit_loss_percent = (exit_price - position.entry_price) / position.entry_price
        else:
            profit_loss = (position.entry_price - exit_price) * position.position_size
            profit_loss_percent = (position.entry_price - exit_price) / position.entry_price

        # Determine outcome
        if profit_loss > 0:
            outcome = TradeOutcome.WIN
        elif profit_loss < 0:
            outcome = TradeOutcome.LOSS
        else:
            outcome = TradeOutcome.BREAKEVEN

        # Calculate duration
        exit_time = datetime.fromtimestamp(candle.timestamp / 1000)
        duration_hours = (exit_time - position.entry_time).total_seconds() / 3600

        # Calculate actual R:R
        risk = abs(position.entry_price - position.stop_loss)
        reward = abs(exit_price - position.entry_price)
        risk_reward_actual = reward / risk if risk > 0 else 0

        # Create trade record
        trade = Trade(
            id=position.id,
            trade_number=self.state.trade_counter,
            pattern_code=position.pattern_code,
            symbol=position.symbol,
            timeframe=position.timeframe,
            direction=position.direction,
            entry_time=position.entry_time,
            entry_price=position.entry_price,
            entry_score=position.entry_score,
            entry_reason=f'{position.pattern_code} signal',
            exit_time=exit_time,
            exit_price=exit_price,
            exit_reason=exit_reason,
            position_size=position.position_size,
            position_value=position.position_value,
            profit_loss=profit_loss,
            profit_loss_percent=profit_loss_percent,
            outcome=outcome,
            max_favorable_excursion=position.max_favorable_excursion,
            max_adverse_excursion=position.max_adverse_excursion,
            risk_reward_actual=risk_reward_actual,
            duration_candles=0,  # Would need to track
            duration_hours=duration_hours,
            had_zone_retest=position.had_zone_retest,
            retest_quality=position.retest_quality,
            entry_features=position.entry_features or {},
        )

        self.state.closed_trades.append(trade)

        # Update capital
        self.state.current_capital += position.position_value + profit_loss

        # Update peak/lowest capital
        if self.state.current_capital > self.state.peak_capital:
            self.state.peak_capital = self.state.current_capital
        if self.state.current_capital < self.state.lowest_capital:
            self.state.lowest_capital = self.state.current_capital

        # Update drawdown
        self.state.current_drawdown = (
            (self.state.peak_capital - self.state.current_capital) / self.state.peak_capital
        )
        if self.state.current_drawdown > self.state.max_drawdown:
            self.state.max_drawdown = self.state.current_drawdown

    def _close_all_positions(self):
        """Close all remaining open positions at current price."""
        # In a real scenario, we'd use the last available price
        pass

    def _calculate_position_size(self, current_price: float) -> Tuple[float, float]:
        """Calculate position size based on config."""
        if self.config.position_size_type == 'percent':
            position_value = self.state.current_capital * (self.config.position_size_value / 100)
        elif self.config.position_size_type == 'fixed':
            position_value = self.config.position_size_value
        else:
            position_value = self.state.current_capital * 0.02  # Default 2%

        position_size = position_value / current_price
        return position_size, position_value

    def _record_equity(self, timestamp: int):
        """Record equity point for equity curve."""
        # Calculate total equity including open positions
        total_equity = self.state.current_capital
        for position in self.state.open_positions:
            total_equity += position.position_value

        self.state.equity_curve.append({
            'time': datetime.fromtimestamp(timestamp / 1000).isoformat(),
            'equity': total_equity,
            'drawdown': self.state.current_drawdown,
        })

    def _calculate_summary(self) -> Dict:
        """Calculate backtest summary statistics."""
        trades = self.state.closed_trades

        if not trades:
            return {
                'total_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'max_drawdown': 0,
            }

        # Basic counts
        total = len(trades)
        wins = sum(1 for t in trades if t.outcome == TradeOutcome.WIN)
        losses = sum(1 for t in trades if t.outcome == TradeOutcome.LOSS)

        # P&L
        gross_profit = sum(t.profit_loss for t in trades if t.profit_loss > 0)
        gross_loss = abs(sum(t.profit_loss for t in trades if t.profit_loss < 0))

        # Win rates by zone retest (KEY metric)
        trades_with_retest = [t for t in trades if t.had_zone_retest]
        trades_without_retest = [t for t in trades if not t.had_zone_retest]

        win_rate_with_retest = (
            sum(1 for t in trades_with_retest if t.outcome == TradeOutcome.WIN) /
            len(trades_with_retest) if trades_with_retest else 0
        )
        win_rate_without_retest = (
            sum(1 for t in trades_without_retest if t.outcome == TradeOutcome.WIN) /
            len(trades_without_retest) if trades_without_retest else 0
        )

        return {
            'total_trades': total,
            'winning_trades': wins,
            'losing_trades': losses,
            'win_rate': wins / total if total > 0 else 0,
            'win_rate_with_retest': win_rate_with_retest,
            'win_rate_without_retest': win_rate_without_retest,
            'retest_improvement': win_rate_with_retest - win_rate_without_retest,
            'gross_profit': gross_profit,
            'gross_loss': gross_loss,
            'total_profit_loss': gross_profit - gross_loss,
            'profit_factor': gross_profit / gross_loss if gross_loss > 0 else 0,
            'max_drawdown': self.state.max_drawdown,
            'max_drawdown_percent': self.state.max_drawdown * 100,
            'final_capital': self.state.current_capital,
            'total_return_percent': (
                (self.state.current_capital - self.config.initial_capital) /
                self.config.initial_capital * 100
            ),
            'equity_curve': self.state.equity_curve,
            'trades': [self._trade_to_dict(t) for t in trades],
        }

    def _features_to_dict(self, features: PatternFeatures) -> Dict:
        """Convert PatternFeatures to dict."""
        return {
            'overall_score': features.overall_score,
            'pattern_quality_score': features.pattern_quality_score,
            'volume_breakout_ratio': features.volume_breakout_ratio,
            'trend_direction': features.trend_direction,
            'rsi_value': features.rsi_value,
            'has_zone_retest': features.has_zone_retest,
            'retest_quality_score': features.retest_quality_score,
        }

    def _trade_to_dict(self, trade: Trade) -> Dict:
        """Convert Trade to dict for JSON serialization."""
        return {
            'id': trade.id,
            'trade_number': trade.trade_number,
            'pattern_code': trade.pattern_code,
            'symbol': trade.symbol,
            'timeframe': trade.timeframe,
            'direction': trade.direction.value,
            'entry_time': trade.entry_time.isoformat(),
            'entry_price': trade.entry_price,
            'exit_time': trade.exit_time.isoformat(),
            'exit_price': trade.exit_price,
            'exit_reason': trade.exit_reason.value,
            'profit_loss': trade.profit_loss,
            'profit_loss_percent': trade.profit_loss_percent,
            'outcome': trade.outcome.value,
            'had_zone_retest': trade.had_zone_retest,
            'retest_quality': trade.retest_quality,
        }

# ═══════════════════════════════════════════════════════════════════════════
# EXPORT
# ═══════════════════════════════════════════════════════════════════════════

__all__ = [
    'BacktestConfig',
    'BacktestEngine',
    'Position',
    'Trade',
    'TradeDirection',
    'TradeOutcome',
    'ExitReason',
]

if __name__ == '__main__':
    # Test backtest engine
    print('Backtest Engine loaded successfully')

    config = BacktestConfig(
        date_from=datetime(2024, 1, 1),
        date_to=datetime(2024, 12, 1),
        symbols=['BTCUSDT'],
        timeframes=['4h'],
        require_zone_retest=True,
    )

    print(f'Config: {config}')
