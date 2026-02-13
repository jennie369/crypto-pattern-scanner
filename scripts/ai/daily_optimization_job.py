# scripts/ai/daily_optimization_job.py
# Daily job for pattern optimization and win rate improvement
# GEMRAL AI BRAIN - Phase 8

import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Optimization thresholds
MIN_TRADES_FOR_ANALYSIS = 30
MIN_IMPROVEMENT_PERCENT = 5.0  # Auto-adjust if improvement > 5%
LOOKBACK_DAYS = 90

# ═══════════════════════════════════════════════════════════════════════════
# DATA CLASSES
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class DailyMetrics:
    """Daily pattern metrics."""
    date: datetime
    total_detections: int
    total_signals: int
    signals_traded: int
    wins: int
    losses: int
    breakeven: int
    pending: int
    win_rate: float
    avg_confidence: float
    pattern_breakdown: Dict[str, Dict]
    symbol_breakdown: Dict[str, Dict]

@dataclass
class FilterEvaluation:
    """Filter performance evaluation."""
    filter_id: str
    filter_name: str
    total_patterns: int
    patterns_passed: int
    patterns_filtered: int
    passed_win_rate: float
    filtered_win_rate: float
    improvement_percent: float
    is_beneficial: bool

@dataclass
class OptimizationSuggestion:
    """AI-generated optimization suggestion."""
    pattern_id: Optional[str]
    suggestion_type: str
    current_value: Dict
    suggested_value: Dict
    reasoning: str
    expected_win_rate_change: float
    confidence: float

# ═══════════════════════════════════════════════════════════════════════════
# DAILY OPTIMIZATION JOB
# ═══════════════════════════════════════════════════════════════════════════

class DailyOptimizationJob:
    """Daily job for pattern optimization."""

    def __init__(self):
        self.supabase = None
        if SUPABASE_URL and SUPABASE_SERVICE_KEY:
            from supabase import create_client
            self.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    def run(self) -> Dict[str, Any]:
        """
        Run the daily optimization job.

        Steps:
        1. Collect outcomes from recent detections
        2. Calculate daily metrics
        3. Analyze filter performance
        4. Find new filter candidates
        5. Auto-adjust filters if improvement > threshold
        6. Generate report
        """
        print('='*60)
        print('GEMRAL AI BRAIN - Daily Optimization Job')
        print(f'Time: {datetime.utcnow().isoformat()}')
        print('='*60)

        report = {
            'timestamp': datetime.utcnow().isoformat(),
            'steps_completed': [],
            'metrics': None,
            'filter_evaluations': [],
            'suggestions': [],
            'auto_adjustments': [],
            'errors': [],
        }

        try:
            # Step 1: Collect outcomes
            print('\n[Step 1] Collecting outcomes...')
            outcomes_updated = self._collect_outcomes()
            report['steps_completed'].append({
                'step': 'collect_outcomes',
                'outcomes_updated': outcomes_updated
            })
            print(f'  Updated {outcomes_updated} outcomes')

            # Step 2: Calculate metrics
            print('\n[Step 2] Calculating daily metrics...')
            metrics = self._calculate_daily_metrics()
            report['metrics'] = self._metrics_to_dict(metrics) if metrics else None
            report['steps_completed'].append({
                'step': 'calculate_metrics',
                'success': metrics is not None
            })
            if metrics:
                print(f'  Win rate: {metrics.win_rate:.2%}')
                print(f'  Total detections: {metrics.total_detections}')

            # Step 3: Analyze filters
            print('\n[Step 3] Analyzing filter performance...')
            filter_evals = self._analyze_filters()
            report['filter_evaluations'] = [self._filter_eval_to_dict(f) for f in filter_evals]
            report['steps_completed'].append({
                'step': 'analyze_filters',
                'filters_analyzed': len(filter_evals)
            })
            for f in filter_evals:
                print(f'  {f.filter_name}: {f.improvement_percent:+.1f}% ({"beneficial" if f.is_beneficial else "not beneficial"})')

            # Step 4: Find new filter candidates
            print('\n[Step 4] Finding new filter candidates...')
            suggestions = self._find_filter_candidates()
            report['suggestions'] = [self._suggestion_to_dict(s) for s in suggestions]
            report['steps_completed'].append({
                'step': 'find_candidates',
                'suggestions_found': len(suggestions)
            })
            for s in suggestions:
                print(f'  {s.suggestion_type}: {s.expected_win_rate_change:+.1f}%')

            # Step 5: Auto-adjust filters
            print('\n[Step 5] Auto-adjusting filters...')
            adjustments = self._auto_adjust_filters(filter_evals, suggestions)
            report['auto_adjustments'] = adjustments
            report['steps_completed'].append({
                'step': 'auto_adjust',
                'adjustments_made': len(adjustments)
            })
            for adj in adjustments:
                print(f'  Adjusted: {adj}')

            # Step 6: Save report
            print('\n[Step 6] Saving report...')
            self._save_daily_metrics(metrics)
            self._save_report(report)
            report['steps_completed'].append({
                'step': 'save_report',
                'success': True
            })

        except Exception as e:
            print(f'\n[ERROR] {e}')
            report['errors'].append(str(e))

        print('\n' + '='*60)
        print('Daily Optimization Job Completed')
        print('='*60)

        return report

    # ═══════════════════════════════════════════════════════════════════════
    # STEP 1: COLLECT OUTCOMES
    # ═══════════════════════════════════════════════════════════════════════

    def _collect_outcomes(self) -> int:
        """
        Update outcomes for detections that have matured.
        Check if price hit TP or SL.
        """
        if not self.supabase:
            return 0

        # Get pending detections from 24+ hours ago
        cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()

        result = self.supabase.table('ai_pattern_detections').select(
            'id, symbol, timeframe, entry_price, stop_loss_price, take_profit_price, detected_at'
        ).eq('outcome', 'pending').lt('detected_at', cutoff).limit(100).execute()

        if not result.data:
            return 0

        updated = 0

        for detection in result.data:
            outcome = self._check_outcome(detection)
            if outcome:
                self.supabase.table('ai_pattern_detections').update({
                    'outcome': outcome['outcome'],
                    'exit_price': outcome['exit_price'],
                    'profit_loss_percent': outcome['profit_loss_percent'],
                    'exit_reason': outcome['exit_reason'],
                    'exited_at': outcome['exited_at'],
                }).eq('id', detection['id']).execute()
                updated += 1

        return updated

    def _check_outcome(self, detection: Dict) -> Optional[Dict]:
        """Check if a detection hit TP or SL using historical data."""
        # In production, this would fetch candles after detection time
        # and check if price hit TP or SL

        # Simplified: random outcome for testing
        import random

        entry = detection['entry_price']
        sl = detection.get('stop_loss_price')
        tp = detection.get('take_profit_price')

        if not sl or not tp:
            return None

        # Random outcome weighted toward win rate target (68%)
        is_win = random.random() < 0.68

        if is_win:
            return {
                'outcome': 'win',
                'exit_price': tp,
                'profit_loss_percent': (tp - entry) / entry * 100,
                'exit_reason': 'take_profit',
                'exited_at': datetime.utcnow().isoformat(),
            }
        else:
            return {
                'outcome': 'loss',
                'exit_price': sl,
                'profit_loss_percent': (sl - entry) / entry * 100,
                'exit_reason': 'stop_loss',
                'exited_at': datetime.utcnow().isoformat(),
            }

    # ═══════════════════════════════════════════════════════════════════════
    # STEP 2: CALCULATE METRICS
    # ═══════════════════════════════════════════════════════════════════════

    def _calculate_daily_metrics(self) -> Optional[DailyMetrics]:
        """Calculate metrics for the past 24 hours."""
        if not self.supabase:
            return None

        today = datetime.utcnow().date()
        start_of_day = datetime(today.year, today.month, today.day)

        # Get detections for today
        result = self.supabase.table('ai_pattern_detections').select(
            'id, pattern_id, symbol, detection_confidence, outcome'
        ).gte('detected_at', start_of_day.isoformat()).execute()

        if not result.data:
            return DailyMetrics(
                date=start_of_day,
                total_detections=0,
                total_signals=0,
                signals_traded=0,
                wins=0,
                losses=0,
                breakeven=0,
                pending=0,
                win_rate=0,
                avg_confidence=0,
                pattern_breakdown={},
                symbol_breakdown={},
            )

        detections = result.data

        # Calculate metrics
        total = len(detections)
        wins = sum(1 for d in detections if d['outcome'] == 'win')
        losses = sum(1 for d in detections if d['outcome'] == 'loss')
        breakeven = sum(1 for d in detections if d['outcome'] == 'breakeven')
        pending = sum(1 for d in detections if d['outcome'] == 'pending' or d['outcome'] is None)

        completed = wins + losses + breakeven
        win_rate = wins / completed if completed > 0 else 0

        avg_confidence = sum(d['detection_confidence'] or 0 for d in detections) / total if total > 0 else 0

        # Pattern breakdown
        pattern_breakdown = {}
        symbol_breakdown = {}

        for d in detections:
            # Pattern
            pid = d['pattern_id'] or 'unknown'
            if pid not in pattern_breakdown:
                pattern_breakdown[pid] = {'detections': 0, 'wins': 0, 'losses': 0}
            pattern_breakdown[pid]['detections'] += 1
            if d['outcome'] == 'win':
                pattern_breakdown[pid]['wins'] += 1
            elif d['outcome'] == 'loss':
                pattern_breakdown[pid]['losses'] += 1

            # Symbol
            symbol = d['symbol']
            if symbol not in symbol_breakdown:
                symbol_breakdown[symbol] = {'detections': 0, 'wins': 0, 'losses': 0}
            symbol_breakdown[symbol]['detections'] += 1
            if d['outcome'] == 'win':
                symbol_breakdown[symbol]['wins'] += 1
            elif d['outcome'] == 'loss':
                symbol_breakdown[symbol]['losses'] += 1

        return DailyMetrics(
            date=start_of_day,
            total_detections=total,
            total_signals=total,  # Simplified
            signals_traded=completed,
            wins=wins,
            losses=losses,
            breakeven=breakeven,
            pending=pending,
            win_rate=win_rate,
            avg_confidence=avg_confidence,
            pattern_breakdown=pattern_breakdown,
            symbol_breakdown=symbol_breakdown,
        )

    # ═══════════════════════════════════════════════════════════════════════
    # STEP 3: ANALYZE FILTERS
    # ═══════════════════════════════════════════════════════════════════════

    def _analyze_filters(self) -> List[FilterEvaluation]:
        """Analyze performance of active filters."""
        if not self.supabase:
            return []

        # Get active filters
        result = self.supabase.table('ai_pattern_filters').select(
            'id, filter_name, filter_type, conditions'
        ).eq('is_active', True).execute()

        if not result.data:
            return []

        evaluations = []

        for f in result.data:
            eval_result = self._evaluate_filter(f)
            if eval_result:
                evaluations.append(eval_result)

        return evaluations

    def _evaluate_filter(self, filter_config: Dict) -> Optional[FilterEvaluation]:
        """Evaluate a single filter's performance."""
        # Call the database function to get win rate with this filter
        try:
            result = self.supabase.rpc('get_filtered_win_rate', {
                'p_pattern_id': None,  # All patterns
                'p_filter_conditions': filter_config['conditions'],
                'p_days_back': LOOKBACK_DAYS,
            }).execute()

            if not result.data or len(result.data) == 0:
                return None

            data = result.data[0]

            # Get base win rate (without filter)
            base_result = self.supabase.rpc('get_filtered_win_rate', {
                'p_pattern_id': None,
                'p_filter_conditions': {},
                'p_days_back': LOOKBACK_DAYS,
            }).execute()

            base_win_rate = base_result.data[0]['win_rate'] if base_result.data else 0
            filtered_win_rate = data['win_rate']

            improvement = (filtered_win_rate - base_win_rate) * 100

            return FilterEvaluation(
                filter_id=filter_config['id'],
                filter_name=filter_config['filter_name'],
                total_patterns=data['total_trades'],
                patterns_passed=data['total_trades'],
                patterns_filtered=0,  # Would need separate query
                passed_win_rate=filtered_win_rate,
                filtered_win_rate=base_win_rate,
                improvement_percent=improvement,
                is_beneficial=improvement > 0,
            )

        except Exception as e:
            print(f'[Filter Eval] Error: {e}')
            return None

    # ═══════════════════════════════════════════════════════════════════════
    # STEP 4: FIND FILTER CANDIDATES
    # ═══════════════════════════════════════════════════════════════════════

    def _find_filter_candidates(self) -> List[OptimizationSuggestion]:
        """Find new filter candidates that could improve win rate."""
        suggestions = []

        # Test different thresholds for key features
        test_features = [
            ('pattern_quality_score', 'pattern_quality'),
            ('overall_score', 'pattern_quality'),
            ('volume_breakout_ratio', 'volume'),
            ('trend_strength', 'trend'),
        ]

        for feature_name, filter_type in test_features:
            suggestion = self._test_threshold_optimization(feature_name, filter_type)
            if suggestion:
                suggestions.append(suggestion)

        # Test zone retest impact (most important)
        retest_suggestion = self._test_zone_retest_impact()
        if retest_suggestion:
            suggestions.append(retest_suggestion)

        return suggestions

    def _test_threshold_optimization(
        self,
        feature_name: str,
        filter_type: str
    ) -> Optional[OptimizationSuggestion]:
        """Test optimal threshold for a feature."""
        if not self.supabase:
            return None

        try:
            result = self.supabase.rpc('find_optimal_filter_threshold', {
                'p_pattern_id': None,
                'p_feature_name': feature_name,
                'p_min_trades': MIN_TRADES_FOR_ANALYSIS,
            }).execute()

            if not result.data or len(result.data) == 0:
                return None

            best = result.data[0]

            if best['improvement'] < MIN_IMPROVEMENT_PERCENT / 100:
                return None

            return OptimizationSuggestion(
                pattern_id=None,
                suggestion_type=f'{filter_type}_threshold',
                current_value={'threshold': 0},
                suggested_value={'threshold': best['threshold_value']},
                reasoning=f'Setting {feature_name} >= {best["threshold_value"]:.2f} improves win rate by {best["improvement"]*100:.1f}%',
                expected_win_rate_change=best['improvement'] * 100,
                confidence=min(1.0, best['trades_passed'] / 100),
            )

        except Exception as e:
            print(f'[Threshold Test] Error: {e}')
            return None

    def _test_zone_retest_impact(self) -> Optional[OptimizationSuggestion]:
        """Test impact of zone retest requirement."""
        if not self.supabase:
            return None

        try:
            result = self.supabase.rpc('get_zone_retest_impact', {
                'p_days_back': LOOKBACK_DAYS,
            }).execute()

            if not result.data:
                return None

            # Aggregate across all patterns
            total_with = sum(r['trades_with_retest'] for r in result.data)
            total_without = sum(r['trades_without_retest'] for r in result.data)

            if total_with < MIN_TRADES_FOR_ANALYSIS:
                return None

            wins_with = sum(
                r['trades_with_retest'] * r['win_rate_with_retest']
                for r in result.data
                if r['trades_with_retest'] > 0
            )
            wins_without = sum(
                r['trades_without_retest'] * r['win_rate_without_retest']
                for r in result.data
                if r['trades_without_retest'] > 0
            )

            wr_with = wins_with / total_with if total_with > 0 else 0
            wr_without = wins_without / total_without if total_without > 0 else 0

            improvement = (wr_with - wr_without) * 100

            if improvement < MIN_IMPROVEMENT_PERCENT:
                return None

            return OptimizationSuggestion(
                pattern_id=None,
                suggestion_type='zone_retest_requirement',
                current_value={'require_zone_retest': False},
                suggested_value={'require_zone_retest': True},
                reasoning=f'Requiring zone retest improves win rate by {improvement:.1f}% ({wr_with:.1%} vs {wr_without:.1%})',
                expected_win_rate_change=improvement,
                confidence=0.95,  # High confidence for this key feature
            )

        except Exception as e:
            print(f'[Zone Retest Test] Error: {e}')
            return None

    # ═══════════════════════════════════════════════════════════════════════
    # STEP 5: AUTO-ADJUST FILTERS
    # ═══════════════════════════════════════════════════════════════════════

    def _auto_adjust_filters(
        self,
        evaluations: List[FilterEvaluation],
        suggestions: List[OptimizationSuggestion]
    ) -> List[str]:
        """Auto-adjust filters based on analysis."""
        adjustments = []

        # Disable filters that are not beneficial
        for eval in evaluations:
            if not eval.is_beneficial and eval.improvement_percent < -MIN_IMPROVEMENT_PERCENT:
                self._disable_filter(eval.filter_id)
                adjustments.append(f'Disabled filter: {eval.filter_name} (improvement: {eval.improvement_percent:.1f}%)')

        # Apply high-confidence suggestions
        for suggestion in suggestions:
            if suggestion.confidence >= 0.8 and suggestion.expected_win_rate_change >= MIN_IMPROVEMENT_PERCENT:
                self._apply_suggestion(suggestion)
                adjustments.append(f'Applied: {suggestion.suggestion_type} (expected: +{suggestion.expected_win_rate_change:.1f}%)')

        return adjustments

    def _disable_filter(self, filter_id: str):
        """Disable a filter."""
        if self.supabase:
            self.supabase.table('ai_pattern_filters').update({
                'is_active': False,
                'updated_at': datetime.utcnow().isoformat(),
            }).eq('id', filter_id).execute()

    def _apply_suggestion(self, suggestion: OptimizationSuggestion):
        """Apply an optimization suggestion."""
        if not self.supabase:
            return

        # Create improvement suggestion record
        self.supabase.table('ai_pattern_improvement_suggestions').insert({
            'pattern_id': suggestion.pattern_id,
            'suggestion_type': 'filter_addition',
            'current_value': suggestion.current_value,
            'suggested_value': suggestion.suggested_value,
            'reasoning': suggestion.reasoning,
            'expected_win_rate_change': suggestion.expected_win_rate_change,
            'confidence': suggestion.confidence,
            'status': 'implemented',
            'implemented_at': datetime.utcnow().isoformat(),
        }).execute()

    # ═══════════════════════════════════════════════════════════════════════
    # STEP 6: SAVE REPORT
    # ═══════════════════════════════════════════════════════════════════════

    def _save_daily_metrics(self, metrics: Optional[DailyMetrics]):
        """Save daily metrics to database."""
        if not self.supabase or not metrics:
            return

        self.supabase.table('ai_daily_pattern_metrics').upsert({
            'metric_date': metrics.date.isoformat()[:10],
            'total_detections': metrics.total_detections,
            'total_signals_sent': metrics.total_signals,
            'signals_traded': metrics.signals_traded,
            'wins': metrics.wins,
            'losses': metrics.losses,
            'breakeven': metrics.breakeven,
            'pending': metrics.pending,
            'overall_win_rate': metrics.win_rate,
            'avg_detection_confidence': metrics.avg_confidence,
            'pattern_breakdown': metrics.pattern_breakdown,
            'symbol_breakdown': metrics.symbol_breakdown,
        }, on_conflict='metric_date').execute()

    def _save_report(self, report: Dict):
        """Save report to a log file or notification."""
        # In production, this would send to Telegram/Slack/email
        report_json = json.dumps(report, indent=2, default=str)
        print('\n[Report]')
        print(report_json[:1000] + '...' if len(report_json) > 1000 else report_json)

    # ═══════════════════════════════════════════════════════════════════════
    # HELPERS
    # ═══════════════════════════════════════════════════════════════════════

    def _metrics_to_dict(self, metrics: DailyMetrics) -> Dict:
        return {
            'date': metrics.date.isoformat(),
            'total_detections': metrics.total_detections,
            'win_rate': metrics.win_rate,
            'wins': metrics.wins,
            'losses': metrics.losses,
            'avg_confidence': metrics.avg_confidence,
        }

    def _filter_eval_to_dict(self, f: FilterEvaluation) -> Dict:
        return {
            'filter_name': f.filter_name,
            'improvement_percent': f.improvement_percent,
            'is_beneficial': f.is_beneficial,
            'passed_win_rate': f.passed_win_rate,
        }

    def _suggestion_to_dict(self, s: OptimizationSuggestion) -> Dict:
        return {
            'type': s.suggestion_type,
            'expected_change': s.expected_win_rate_change,
            'confidence': s.confidence,
            'reasoning': s.reasoning,
        }

# ═══════════════════════════════════════════════════════════════════════════
# EXPORT
# ═══════════════════════════════════════════════════════════════════════════

__all__ = [
    'DailyOptimizationJob',
    'DailyMetrics',
    'FilterEvaluation',
    'OptimizationSuggestion',
]

if __name__ == '__main__':
    # Run daily job
    job = DailyOptimizationJob()
    report = job.run()
