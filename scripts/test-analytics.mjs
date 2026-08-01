import assert from "node:assert/strict";
import {
  aggregateCandles,
  buildMarketAnalysis,
  decomposeIranDrivers,
  maximumDrawdown,
  pearsonCorrelation,
  relativeStrengthIndex
} from "../lib/analytics.js";

const rising = Array.from({ length: 30 }, (_, index) => 100 + index);
assert.equal(relativeStrengthIndex(rising), 100, "RSI should reach 100 for a strictly rising series");

const drawdown = maximumDrawdown([100, 120, 90, 96]);
assert.equal(drawdown.maximum, -25, "maximum drawdown should use the previous peak");
assert.ok(Math.abs(drawdown.current + 20) < 1e-9, "current drawdown should use the all-time peak in the selected range");

assert.ok(Math.abs(pearsonCorrelation([1, 2, 3], [2, 4, 6]) - 1) < 1e-12, "identical directions should have correlation 1");

const rows = [
  { date: "2026-01-01", global: 100, usd: 100, iran: 100, premium: 0, open: 99, high: 102, low: 98, close: 100 },
  { date: "2026-01-02", global: 105, usd: 110, iran: 121, premium: 4.7619047619, open: 100, high: 122, low: 99, close: 121 }
];
const decomposition = decomposeIranDrivers(rows);
const recomposed = decomposition.global + decomposition.usd + decomposition.premium + decomposition.interaction;
assert.ok(Math.abs(recomposed - decomposition.total) < 1e-9, "driver decomposition should exactly reconcile total return");

const candles = aggregateCandles(rows, 1);
assert.equal(candles.length, 1, "aggregation should respect maximum candle count");
assert.equal(candles[0].open, 99, "aggregated candle should preserve first open");
assert.equal(candles[0].high, 122, "aggregated candle should preserve highest high");
assert.equal(candles[0].low, 98, "aggregated candle should preserve lowest low");
assert.equal(candles[0].close, 121, "aggregated candle should preserve last close");

const analysisRows = Array.from({ length: 60 }, (_, index) => {
  const global = 2000 + index * 3;
  const usd = 50000 + index * 100;
  const iran = 3000000 + index * 15000;
  return {
    date: `2026-01-${String((index % 28) + 1).padStart(2, "0")}`,
    global,
    usd,
    iran,
    premium: 2 + Math.sin(index / 5),
    open: iran - 5000,
    high: iran + 15000,
    low: iran - 12000,
    close: iran
  };
});
const analysis = buildMarketAnalysis(analysisRows, "iran");
assert.ok(analysis.score >= 0 && analysis.score <= 100, "analysis score should be bounded");
assert.ok(Number.isFinite(analysis.momentum.rsi), "RSI should be finite");
assert.ok(Number.isFinite(analysis.risk.maximumDrawdown), "drawdown should be finite");
assert.equal(analysis.driverItems.length, 4, "driver chart should include interaction");
assert.ok(analysis.insights.length >= 3, "public analysis should include multiple plain-language insights");

console.log("Analytics: 12 checks passed");
