# TalaNama Major Analytics Upgrade

Status: Implemented in delivery package

## Objective

Expand the existing Persian RTL dashboard without redesigning its shell, navigation, summary cards, chart panel, scenario builder, calculator, dark mode, or responsive behavior.

## User-facing additions

- Candlestick mode inside the existing chart-type segmented control.
- Transparent warning that historical OHLC values are reconstructed, not official market candles.
- Five-layer descriptive analysis: trend, momentum, drivers, risk, and data quality.
- RSI(14), MACD(12,26,9), positive-day ratio, streaks, rolling reference range, correlations, drawdowns, downside deviation, and historical fifth percentile.
- Exact driver reconciliation with a separate interaction term.
- Working local browser price alert with direction and target controls.
- Browser notifications when permission is granted; in-app state remains functional without permission.

## Integrity constraints

- No output is labeled as guaranteed advice, a buy signal, or a sell signal.
- Historical analytics remain visibly labeled as reconstructed.
- The alert is local-first, requires no account, database, paid API, or background service.
- Alert evaluation occurs when the page receives a new market snapshot; it is not a guaranteed always-on notification service.
- Existing API, routes, deployment model, and external dependencies remain unchanged.

## Formula summary

- RSI: 14-period average gain/loss ratio.
- MACD: EMA(12) minus EMA(26), with EMA(9) signal.
- Annualized volatility: standard deviation of daily percentage returns multiplied by square root of 252.
- Maximum drawdown: worst peak-to-subsequent-value decline in the selected period.
- Downside deviation: annualized standard deviation of negative daily returns.
- Historical fifth percentile: empirical 5th percentile of daily returns.
- Driver interaction: Iran total return minus standalone global, USD, and premium-factor returns.
- Status score: five documented binary conditions, each worth 20 points.

## Acceptance criteria

1. `npm run check` executes parser tests, analytics tests, lint, and production build.
2. Candlestick mode works for Iran gold, global gold, and USD; compare mode disables the candle control.
3. Candle aggregation preserves first open, highest high, lowest low, and last close.
4. Price alert preferences survive reload through local storage.
5. A threshold crossing updates the in-app alert and sends a browser notification when allowed.
6. All new controls are keyboard operable and have accessible labels.
7. Vazirmatn remains the only declared application font family.
