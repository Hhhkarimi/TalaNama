"use client";

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
          {market !== "usd" && <div className="tooltip-row subtle"><span>میانگین ۲۰ روزه</span><b>{row.sma20 ? formatFa(row.sma20, MARKET_META[market].decimals) : "—"}</b></div>}
        </>
      )}
    </div>
  );
}

export default function MarketChart({ data, market, chartMode, indicators }) {
  const meta = MARKET_META[market];
  const isCompare = market === "compare" || chartMode === "compare";
  const values = isCompare
    ? data.flatMap((item) => [item.globalIndex, item.iranIndex, item.usdIndex])
    : chartMode === "returns"
      ? data.map((item) => item.dailyReturn)
      : data.map((item) => item.value);
  const min = Math.min(...values.filter(Number.isFinite));
  const max = Math.max(...values.filter(Number.isFinite));
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
