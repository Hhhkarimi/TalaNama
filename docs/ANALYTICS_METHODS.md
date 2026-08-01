# Analytics Methods

TalaNama analyses are descriptive calculations over the exact rows displayed in the selected period. They are educational summaries, not individualized investment advice or guaranteed forecasts.

## Data-quality boundary

The current market snapshot may be observed from the configured public source, partially observed, or served from fallback data. The daily historical path and OHLC values are reconstructed from reference anchors. Therefore:

- candlesticks are visual reconstructions, not official exchange candles;
- volatility, RSI, MACD, drawdown, and correlations are approximate descriptors;
- no reconstructed statistic should be treated as a trading-grade measurement.

## Trend status score

The score is intentionally simple and auditable. Each true condition contributes 20 points:

1. current price is at or above SMA20;
2. SMA20 is at or above SMA50;
3. MACD histogram is non-negative;
4. RSI is between 50 and 75;
5. at least half of daily returns are positive.

The score reports a descriptive tendency only. It is not a signal.

## Driver decomposition

For the selected period, TalaNama calculates standalone changes in:

- international gold;
- free-market USD/IRT;
- the domestic premium factor.

Because the theoretical domestic value is multiplicative, the standalone percentage changes do not sum exactly to the observed Iranian gold return. The remaining reconciled amount is reported as the interaction effect.

## Risk metrics

- Annualized volatility uses daily percentage-return dispersion and `sqrt(252)`.
- Downside deviation uses negative daily returns only.
- Maximum drawdown measures the worst decline from an earlier peak.
- Current drawdown compares the final value with the period high.
- Historical fifth percentile is the empirical 5th percentile of daily returns, not a guaranteed loss boundary.

## Correlation

Pearson correlation is calculated between aligned daily returns. Correlation describes historical co-movement and does not prove causation.

## Price alerts

Price-alert preferences are stored in browser local storage. The condition is evaluated when the dashboard receives a new snapshot while the page is active. Browser notifications are optional and depend on browser permission. TalaNama does not provide a server-side always-on alert service.
