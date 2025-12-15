# scripts/ai/historical_data_fetcher.py
# Fetch historical OHLCV data from Binance
# GEMRAL AI BRAIN - Phase 7

import os
import time
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from feature_extractor import Candle

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

BINANCE_API_URL = 'https://api.binance.com/api/v3'
BINANCE_FUTURES_URL = 'https://fapi.binance.com/fapi/v1'

# Rate limiting
MAX_CANDLES_PER_REQUEST = 1000
REQUEST_DELAY = 0.1  # seconds between requests
MAX_RETRIES = 3
RETRY_DELAY = 1

# Timeframe mappings
TIMEFRAME_MINUTES = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '2h': 120,
    '4h': 240,
    '6h': 360,
    '8h': 480,
    '12h': 720,
    '1d': 1440,
    '1w': 10080,
}

# Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# ═══════════════════════════════════════════════════════════════════════════
# BINANCE API
# ═══════════════════════════════════════════════════════════════════════════

def fetch_binance_klines(
    symbol: str,
    timeframe: str,
    start_time: Optional[int] = None,
    end_time: Optional[int] = None,
    limit: int = 1000,
    futures: bool = False
) -> List[List]:
    """
    Fetch klines from Binance API.

    Args:
        symbol: Trading pair (e.g., 'BTCUSDT')
        timeframe: Candle interval (e.g., '1h', '4h', '1d')
        start_time: Start timestamp in milliseconds
        end_time: End timestamp in milliseconds
        limit: Number of candles (max 1000)
        futures: Use futures API instead of spot

    Returns:
        List of kline data
    """
    base_url = BINANCE_FUTURES_URL if futures else BINANCE_API_URL
    endpoint = f'{base_url}/klines'

    params = {
        'symbol': symbol,
        'interval': timeframe,
        'limit': min(limit, MAX_CANDLES_PER_REQUEST),
    }

    if start_time:
        params['startTime'] = start_time
    if end_time:
        params['endTime'] = end_time

    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f'[DataFetcher] Attempt {attempt + 1} failed: {e}')
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                raise

    return []

def parse_kline(kline: List) -> Candle:
    """Parse Binance kline to Candle object."""
    return Candle(
        timestamp=int(kline[0]),
        open=float(kline[1]),
        high=float(kline[2]),
        low=float(kline[3]),
        close=float(kline[4]),
        volume=float(kline[5]),
    )

# ═══════════════════════════════════════════════════════════════════════════
# HISTORICAL DATA FETCHER
# ═══════════════════════════════════════════════════════════════════════════

class HistoricalDataFetcher:
    """Fetch and manage historical candle data."""

    def __init__(self, use_cache: bool = True):
        self.use_cache = use_cache
        self.cache: Dict[str, List[Candle]] = {}
        self.supabase = None

        if use_cache and SUPABASE_URL and SUPABASE_SERVICE_KEY:
            from supabase import create_client
            self.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    def fetch_historical(
        self,
        symbol: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime,
        futures: bool = False,
        save_to_db: bool = True
    ) -> List[Candle]:
        """
        Fetch historical candles for a date range.

        Args:
            symbol: Trading pair
            timeframe: Candle interval
            start_date: Start datetime
            end_date: End datetime
            futures: Use futures API
            save_to_db: Save to database cache

        Returns:
            List of Candle objects
        """
        print(f'[DataFetcher] Fetching {symbol} {timeframe} from {start_date} to {end_date}')

        # Check cache first
        cache_key = f'{symbol}_{timeframe}'
        if cache_key in self.cache:
            cached = self.cache[cache_key]
            # Filter to date range
            start_ts = int(start_date.timestamp() * 1000)
            end_ts = int(end_date.timestamp() * 1000)
            filtered = [c for c in cached if start_ts <= c.timestamp <= end_ts]
            if len(filtered) > 0:
                print(f'[DataFetcher] Using cache: {len(filtered)} candles')
                return filtered

        # Check database cache
        if self.use_cache and self.supabase:
            db_candles = self._load_from_db(symbol, timeframe, start_date, end_date)
            if db_candles:
                print(f'[DataFetcher] Loaded from DB: {len(db_candles)} candles')
                return db_candles

        # Fetch from Binance
        all_candles = []
        current_start = int(start_date.timestamp() * 1000)
        end_ts = int(end_date.timestamp() * 1000)

        timeframe_ms = TIMEFRAME_MINUTES.get(timeframe, 60) * 60 * 1000

        while current_start < end_ts:
            try:
                klines = fetch_binance_klines(
                    symbol=symbol,
                    timeframe=timeframe,
                    start_time=current_start,
                    end_time=end_ts,
                    limit=MAX_CANDLES_PER_REQUEST,
                    futures=futures
                )

                if not klines:
                    break

                candles = [parse_kline(k) for k in klines]
                all_candles.extend(candles)

                # Move to next batch
                current_start = klines[-1][0] + timeframe_ms

                # Rate limiting
                time.sleep(REQUEST_DELAY)

                print(f'[DataFetcher] Fetched {len(all_candles)} candles so far...')

            except Exception as e:
                print(f'[DataFetcher] Error fetching: {e}')
                break

        # Remove duplicates and sort
        seen_timestamps = set()
        unique_candles = []
        for c in all_candles:
            if c.timestamp not in seen_timestamps:
                seen_timestamps.add(c.timestamp)
                unique_candles.append(c)

        unique_candles.sort(key=lambda x: x.timestamp)

        print(f'[DataFetcher] Total: {len(unique_candles)} unique candles')

        # Save to cache
        self.cache[cache_key] = unique_candles

        # Save to database
        if save_to_db and self.supabase and unique_candles:
            self._save_to_db(symbol, timeframe, unique_candles)

        return unique_candles

    def _load_from_db(
        self,
        symbol: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Candle]:
        """Load candles from database cache."""
        try:
            result = self.supabase.rpc('get_candles_for_backtest', {
                'p_symbol': symbol,
                'p_timeframe': timeframe,
                'p_from': start_date.isoformat(),
                'p_to': end_date.isoformat(),
            }).execute()

            if not result.data:
                return []

            candles = []
            for row in result.data:
                candles.append(Candle(
                    timestamp=int(datetime.fromisoformat(row['open_time'].replace('Z', '+00:00')).timestamp() * 1000),
                    open=row['open'],
                    high=row['high'],
                    low=row['low'],
                    close=row['close'],
                    volume=row['volume'],
                ))

            return candles

        except Exception as e:
            print(f'[DataFetcher] DB load error: {e}')
            return []

    def _save_to_db(
        self,
        symbol: str,
        timeframe: str,
        candles: List[Candle],
        batch_size: int = 500
    ):
        """Save candles to database cache."""
        try:
            records = []
            for c in candles:
                records.append({
                    'symbol': symbol,
                    'timeframe': timeframe,
                    'exchange': 'binance',
                    'open_time': datetime.fromtimestamp(c.timestamp / 1000).isoformat(),
                    'open': c.open,
                    'high': c.high,
                    'low': c.low,
                    'close': c.close,
                    'volume': c.volume,
                })

            # Insert in batches
            for i in range(0, len(records), batch_size):
                batch = records[i:i + batch_size]
                self.supabase.table('ai_historical_candles').upsert(
                    batch,
                    on_conflict='symbol,timeframe,exchange,open_time'
                ).execute()
                print(f'[DataFetcher] Saved batch {i // batch_size + 1}')

            print(f'[DataFetcher] Saved {len(records)} candles to DB')

        except Exception as e:
            print(f'[DataFetcher] DB save error: {e}')

    def detect_gaps(
        self,
        candles: List[Candle],
        timeframe: str
    ) -> List[Tuple[datetime, datetime]]:
        """
        Detect gaps in candle data.

        Returns:
            List of (gap_start, gap_end) tuples
        """
        if len(candles) < 2:
            return []

        expected_interval_ms = TIMEFRAME_MINUTES.get(timeframe, 60) * 60 * 1000
        gaps = []

        for i in range(1, len(candles)):
            actual_interval = candles[i].timestamp - candles[i-1].timestamp

            # Allow 10% tolerance
            if actual_interval > expected_interval_ms * 1.1:
                gap_start = datetime.fromtimestamp(candles[i-1].timestamp / 1000)
                gap_end = datetime.fromtimestamp(candles[i].timestamp / 1000)
                gaps.append((gap_start, gap_end))

        return gaps

    def fill_gaps(
        self,
        symbol: str,
        timeframe: str,
        gaps: List[Tuple[datetime, datetime]],
        futures: bool = False
    ) -> int:
        """
        Fill gaps in candle data.

        Returns:
            Number of candles added
        """
        total_added = 0

        for gap_start, gap_end in gaps:
            print(f'[DataFetcher] Filling gap: {gap_start} to {gap_end}')

            candles = self.fetch_historical(
                symbol=symbol,
                timeframe=timeframe,
                start_date=gap_start,
                end_date=gap_end,
                futures=futures,
                save_to_db=True
            )

            total_added += len(candles)

        return total_added

# ═══════════════════════════════════════════════════════════════════════════
# BATCH FETCHER
# ═══════════════════════════════════════════════════════════════════════════

def fetch_all_symbols(
    symbols: List[str],
    timeframes: List[str],
    start_date: datetime,
    end_date: datetime,
    futures: bool = False
) -> Dict[str, Dict[str, List[Candle]]]:
    """
    Fetch historical data for multiple symbols and timeframes.

    Returns:
        {symbol: {timeframe: [candles]}}
    """
    fetcher = HistoricalDataFetcher(use_cache=True)
    result = {}

    for symbol in symbols:
        result[symbol] = {}

        for timeframe in timeframes:
            print(f'\n[BatchFetch] {symbol} {timeframe}')

            try:
                candles = fetcher.fetch_historical(
                    symbol=symbol,
                    timeframe=timeframe,
                    start_date=start_date,
                    end_date=end_date,
                    futures=futures
                )

                result[symbol][timeframe] = candles

            except Exception as e:
                print(f'[BatchFetch] Error: {e}')
                result[symbol][timeframe] = []

    return result

# ═══════════════════════════════════════════════════════════════════════════
# EXPORT
# ═══════════════════════════════════════════════════════════════════════════

__all__ = [
    'HistoricalDataFetcher',
    'fetch_binance_klines',
    'parse_kline',
    'fetch_all_symbols',
    'TIMEFRAME_MINUTES',
]

if __name__ == '__main__':
    # Test fetcher
    print('Testing Historical Data Fetcher...')

    fetcher = HistoricalDataFetcher(use_cache=False)

    # Fetch 30 days of BTC 4h data
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)

    candles = fetcher.fetch_historical(
        symbol='BTCUSDT',
        timeframe='4h',
        start_date=start_date,
        end_date=end_date,
        futures=False,
        save_to_db=False
    )

    print(f'\nFetched {len(candles)} candles')
    if candles:
        print(f'First: {datetime.fromtimestamp(candles[0].timestamp / 1000)}')
        print(f'Last: {datetime.fromtimestamp(candles[-1].timestamp / 1000)}')
        print(f'Price range: {min(c.low for c in candles):.2f} - {max(c.high for c in candles):.2f}')
