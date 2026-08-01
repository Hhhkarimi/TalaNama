"use client";

import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { aggregateCandles, clamp } from "@/lib/analytics";
import { formatDate, formatFa, MARKET_META } from "@/lib/goldData";

const colors = {
  primary: "#b78a32",
  secondary: "#277d73",
  tertiary: "#6d62a8",
  grid: "rgba(76, 69, 54, 0.10)",
  muted: "#8f8a7f",
  negative: "#c85c55"
};

function AxisTick({ x, y, payload }) {
  return (
    <text x={x} y={y + 13} textAnchor="middle" fill={colors.muted} fontSize="11">
      {formatDate(payload.value)}
    </text>
  );
}

function CustomTooltip({ active, payload, label, market, chartMode }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="chart-tooltip">
      <div className="tooltip-date">{formatDate(label, "long")}</div>
      {market === "compare" || chartMode === "compare" ? (
        <>
          <div className="tooltip-row"><span><i style={{ background: colors.primary }} />طلای ایران</span><b>{formatFa(row.iranIndex, 1)}</b></div>
          <div className="tooltip-row"><span><i style={{ background: colors.secondary }} />اونس جهانی</span><b>{formatFa(row.globalIndex, 1)}</b></div>
          <div className="tooltip-row"><span><i style={{ background: colors.tertiary }} />دلار آزاد</span><b>{formatFa(row.usdIndex, 1)}</b></div>
        </>
      ) : chartMode === "returns" ? (
        <div className="tooltip-row"><span>بازده روزانه</span><b className={row.dailyReturn >= 0 ? "positive" : "negative"}>{row.dailyReturn >= 0 ? "+" : ""}{formatFa(row.dailyReturn, 2)}٪</b></div>
      ) : (
        <>
          <div className="tooltip-row"><span><i style={{ background: colors.primary }} />قیمت پایانی</span><b>{formatFa(row.value, MARKET_META[market].decimals)} {MARKET_META[market].unit}</b></div>
          <div className="tooltip-row subtle"><span>میانگین ۲۰ روزه</span><b>{row.sma20 ? formatFa(row.sma20, MARKET_META[market].decimals) : "—"}</b></div>
        </>
      )}
    </div>
  );
}

function CandleTooltip({ candle, market, left }) {
  if (!candle) return null;
  const decimals = MARKET_META[market].decimals;
  const unit = MARKET_META[market].unit;
  return (
    <div className="candle-tooltip" style={{ left: `${clamp(left, 12, 82)}%` }}>
      <div className="tooltip-date">
        {candle.count > 1 ? `${formatDate(candle.startDate)} تا ${formatDate(candle.endDate)}` : formatDate(candle.date, "long")}
      </div>
      <div className="tooltip-row"><span>باز</span><b>{formatFa(candle.open, decimals)} {unit}</b></div>
      <div className="tooltip-row"><span>بیشترین</span><b>{formatFa(candle.high, decimals)} {unit}</b></div>
      <div className="tooltip-row"><span>کمترین</span><b>{formatFa(candle.low, decimals)} {unit}</b></div>
      <div className="tooltip-row"><span>بسته</span><b>{formatFa(candle.close, decimals)} {unit}</b></div>
    </div>
  );
}

function CandlestickChart({ data, market }) {
  const candles = useMemo(() => aggregateCandles(data, 90), [data]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const width = 1000;
  const height = 350;
  const padding = { top: 18, right: 82, bottom: 38, left: 14 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const values = candles.flatMap((candle) => [candle.high, candle.low]);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const valuePadding = Math.max((rawMax - rawMin) * 0.08, Math.abs(rawMax) * 0.004);
  const min = rawMin - valuePadding;
  const max = rawMax + valuePadding;
  const scaleY = (value) => padding.top + ((max - value) / Math.max(max - min, 1)) * plotHeight;
  const candleStep = plotWidth / Math.max(candles.length, 1);
  const candleWidth = clamp(candleStep * 0.58, 2, 11);
  const gridValues = Array.from({ length: 5 }, (_, index) => max - ((max - min) * index) / 4);
  const labelIndexes = [...new Set([0, Math.floor((candles.length - 1) / 3), Math.floor(((candles.length - 1) * 2) / 3), candles.length - 1])];
  const hovered = hoveredIndex == null ? null : candles[hoveredIndex];
  const hoveredLeft = hoveredIndex == null ? 50 : ((hoveredIndex + 0.5) / Math.max(candles.length, 1)) * 100;

  if (!candles.length) {
    return <div className="chart-empty">داده کافی برای نمایش کندل وجود ندارد.</div>;
  }

  const yFormatter = (value) => {
    if (market === "iran") return `${formatFa(value / 1000000, 1)} م`;
    if (market === "usd") return `${formatFa(value / 1000, 0)} ه`;
    return formatFa(value, 0);
  };

  return (
    <div className="candlestick-wrap" role="img" aria-label={`نمودار کندل بازسازی‌شده ${MARKET_META[market].label}`}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {gridValues.map((value) => {
          const y = scaleY(value);
          return (
            <g key={value}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke={colors.grid} strokeDasharray="3 5" />
              <text x={width - padding.right + 8} y={y + 4} fill={colors.muted} fontSize="11">{yFormatter(value)}</text>
            </g>
          );
        })}

        {candles.map((candle, index) => {
          const x = padding.left + (index + 0.5) * candleStep;
          const openY = scaleY(candle.open);
          const closeY = scaleY(candle.close);
          const highY = scaleY(candle.high);
          const lowY = scaleY(candle.low);
          const positive = candle.close >= candle.open;
          const bodyY = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(openY - closeY), 1.5);
          const color = positive ? colors.secondary : colors.negative;
          return (
            <g
              key={`${candle.startDate}-${candle.endDate}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              tabIndex="0"
            >
              <title>{`${formatDate(candle.date, "long")}: باز ${formatFa(candle.open)}, بیشترین ${formatFa(candle.high)}, کمترین ${formatFa(candle.low)}, بسته ${formatFa(candle.close)}`}</title>
              <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth="1.4" />
              <rect x={x - candleWidth / 2} y={bodyY} width={candleWidth} height={bodyHeight} rx="1.2" fill={positive ? "var(--surface)" : color} stroke={color} strokeWidth="1.4" />
              <rect x={x - candleStep / 2} y={padding.top} width={candleStep} height={plotHeight} fill="transparent" />
            </g>
          );
        })}

        {labelIndexes.map((index) => {
          const candle = candles[index];
          if (!candle) return null;
          const x = padding.left + (index + 0.5) * candleStep;
          return <text key={index} x={x} y={height - 10} textAnchor="middle" fill={colors.muted} fontSize="11">{formatDate(candle.date)}</text>;
        })}
      </svg>
      <CandleTooltip candle={hovered} market={market} left={hoveredLeft} />
    </div>
  );
}

export default function MarketChart({ data, market, chartMode, indicators }) {
  const meta = MARKET_META[market];
  const isCompare = market === "compare" || chartMode === "compare";

  if (chartMode === "candles" && market !== "compare") {
    return (
      <>
        <CandlestickChart data={data} market={market} />
        <div className="chart-integrity-note" role="note">
          کندل‌ها از سری تاریخی بازسازی‌شده تولید شده‌اند؛ باز، بیشترین، کمترین و بسته‌شدن رسمی بازار نیستند.
        </div>
      </>
    );
  }

  const values = isCompare
    ? data.flatMap((item) => [item.globalIndex, item.iranIndex, item.usdIndex])
    : chartMode === "returns"
      ? data.map((item) => item.dailyReturn)
      : data.map((item) => item.value);
  const finiteValues = values.filter(Number.isFinite);
  const min = Math.min(...finiteValues);
  const max = Math.max(...finiteValues);
  const padding = Math.max((max - min) * 0.12, Math.abs(max) * 0.015);
  const domain = chartMode === "returns" ? [Math.min(min - padding, -1), Math.max(max + padding, 1)] : [min - padding, max + padding];

  const yFormatter = (value) => {
    if (isCompare || chartMode === "returns") return formatFa(value, 0);
    if (market === "iran") return `${formatFa(value / 1000000, 1)} م`;
    if (market === "usd") return `${formatFa(value / 1000, 0)} ه`;
    return formatFa(value, 0);
  };

  return (
    <div className="chart-wrap" role="img" aria-label={`نمودار ${meta.label}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 2, left: 2, bottom: 4 }}>
          <defs>
            <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.primary} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colors.primary} stopOpacity={0.015} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="3 5" />
          <XAxis dataKey="date" tick={<AxisTick />} axisLine={false} tickLine={false} minTickGap={36} />
          <YAxis orientation="right" tickFormatter={yFormatter} domain={domain} axisLine={false} tickLine={false} width={58} tick={{ fill: colors.muted, fontSize: 11 }} />
          <Tooltip content={<CustomTooltip market={market} chartMode={chartMode} />} cursor={{ stroke: "rgba(93, 82, 58, .24)", strokeWidth: 1 }} />

          {isCompare ? (
            <>
              <ReferenceLine y={100} stroke={colors.grid} />
              <Line dataKey="iranIndex" name="طلای ایران" type="monotone" stroke={colors.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              <Line dataKey="globalIndex" name="اونس جهانی" type="monotone" stroke={colors.secondary} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line dataKey="usdIndex" name="دلار آزاد" type="monotone" stroke={colors.tertiary} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </>
          ) : chartMode === "returns" ? (
            <>
              <ReferenceLine y={0} stroke={colors.grid} />
              <Bar dataKey="dailyReturn" radius={[3, 3, 0, 0]} maxBarSize={10}>
                {data.map((item, index) => <Cell key={index} fill={item.dailyReturn >= 0 ? colors.secondary : colors.negative} fillOpacity={0.8} />)}
              </Bar>
            </>
          ) : (
            <>
              {chartMode === "area" && <Area dataKey="value" type="monotone" stroke={colors.primary} strokeWidth={2.5} fill="url(#goldFill)" activeDot={{ r: 4 }} />}
              {chartMode === "line" && <Line dataKey="value" type="monotone" stroke={colors.primary} strokeWidth={2.6} dot={false} activeDot={{ r: 4 }} />}
              {indicators.includes("sma20") && <Line dataKey="sma20" type="monotone" stroke={colors.secondary} strokeWidth={1.7} dot={false} connectNulls />}
              {indicators.includes("sma50") && <Line dataKey="sma50" type="monotone" stroke={colors.tertiary} strokeWidth={1.6} strokeDasharray="5 4" dot={false} connectNulls />}
              {indicators.includes("bands") && <Line dataKey="upper" type="monotone" stroke={colors.muted} strokeWidth={1} strokeDasharray="2 4" dot={false} connectNulls />}
              {indicators.includes("bands") && <Line dataKey="lower" type="monotone" stroke={colors.muted} strokeWidth={1} strokeDasharray="2 4" dot={false} connectNulls />}
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
