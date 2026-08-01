"use client";

import { useState } from "react";
import {
  Activity,
  BarChart3,
  Database,
  Gauge,
  Info,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { formatFa } from "@/lib/goldData";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function percent(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${formatFa(value, digits)}٪`;
}

function correlation(value) {
  return formatFa(value, 2);
}

function Metric({ label, value, hint, tone }) {
  return (
    <div className={cn("analysis-metric", tone)}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function MethodNote({ children }) {
  return (
    <div className="analysis-method-note">
      <Info size={16} />
      <span>{children}</span>
    </div>
  );
}

function InsightCards({ insights }) {
  return (
    <div className="analysis-insight-cards" aria-label="نکات قابل رصد">
      {insights.slice(0, 4).map((insight, index) => (
        <article key={`${index}-${insight}`}>
          <span>{formatFa(index + 1)}</span>
          <p>{insight}</p>
        </article>
      ))}
    </div>
  );
}

export default function AdvancedAnalysis({ analysis, marketKey, marketLabel, periodLabel, sourceStatus }) {
  const [tab, setTab] = useState("technical");
  const tabs = [
    { id: "technical", label: "روند", icon: TrendingUp },
    { id: "momentum", label: "شتاب", icon: Activity },
    { id: "drivers", label: "محرک‌ها", icon: BarChart3 },
    { id: "risk", label: "ریسک", icon: ShieldCheck },
    { id: "quality", label: "کیفیت داده", icon: Database }
  ];
  const { technical, momentum, risk, drivers, correlations } = analysis;
  const TrendIcon = analysis.score >= 50 ? TrendingUp : TrendingDown;

  return (
    <section className="panel analysis-panel">
      <div className="panel-head compact-head">
        <div>
          <div className="panel-kicker"><Sparkles size={16} /> تحلیل توصیفی چندلایه</div>
          <h2>برداشت داده‌محور از {marketLabel}</h2>
          <p className="analysis-period-copy">بر پایه بازه {periodLabel}؛ بدون توصیه خرید یا فروش</p>
        </div>
        <div className="score-ring" style={{ "--score": `${analysis.score * 3.6}deg` }}>
          <span>{formatFa(analysis.score)}</span>
          <small>امتیاز وضعیت</small>
        </div>
      </div>

      <div className="analysis-summary-strip">
        <div className={cn("descriptive-badge", analysis.score >= 50 ? "positive" : "negative")}>
          <TrendIcon size={15} />
          {analysis.trendLabel}
        </div>
        <span>امتیاز از پنج شرط شفاف محاسبه شده است.</span>
      </div>

      <div className="analysis-tabs" role="tablist" aria-label="لایه‌های تحلیل">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls={`analysis-panel-${id}`}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "technical" && (
        <div className="analysis-body" id="analysis-panel-technical" role="tabpanel">
          <div className="analysis-metric-grid">
            <Metric label="فاصله از میانگین ۲۰ روزه" value={percent(technical.priceDistanceSma20)} hint={technical.priceDistanceSma20 >= 0 ? "بالاتر از میانگین" : "پایین‌تر از میانگین"} />
            <Metric label="فاصله از میانگین ۵۰ روزه" value={percent(technical.priceDistanceSma50)} hint="نمای بلندتر روند" />
            <Metric label="جایگاه در دامنه ۲۰ روزه" value={`${formatFa(technical.rangePosition, 0)}٪`} hint="۰٪ کف و ۱۰۰٪ سقف" />
            <Metric label="کف مرجع ۲۰ روزه" value={formatFa(technical.referenceLow, 0)} hint="سطح مشاهده‌شده، نه پیش‌بینی" />
            <Metric label="سقف مرجع ۲۰ روزه" value={formatFa(technical.referenceHigh, 0)} hint="سطح مشاهده‌شده، نه هدف قیمت" />
          </div>
          <InsightCards insights={analysis.insights} />
          <MethodNote>{analysis.methodology.score}</MethodNote>
        </div>
      )}

      {tab === "momentum" && (
        <div className="analysis-body" id="analysis-panel-momentum" role="tabpanel">
          <div className="analysis-metric-grid">
            <Metric label="RSI چهارده‌روزه" value={formatFa(momentum.rsi, 1)} hint={momentum.rsiLabel} tone={momentum.rsi >= 70 || momentum.rsi <= 30 ? "warn" : ""} />
            <Metric label="MACD" value={formatFa(momentum.macd.macd, 2)} hint={`هیستوگرام: ${formatFa(momentum.macd.histogram, 2)}`} />
            <Metric label="سهم روزهای مثبت" value={`${formatFa(momentum.positiveDays, 0)}٪`} hint="از روزهای قابل محاسبه" />
            <Metric label="بهترین روز دوره" value={percent(momentum.bestDay)} hint="بازده روزانه" tone="positive" />
            <Metric label="ضعیف‌ترین روز دوره" value={percent(momentum.worstDay)} hint="بازده روزانه" tone="negative" />
            <Metric
              label="دنباله فعلی"
              value={momentum.streak.length ? `${formatFa(momentum.streak.length)} روز` : "بدون دنباله"}
              hint={momentum.streak.direction === "up" ? "روزهای مثبت پیاپی" : momentum.streak.direction === "down" ? "روزهای منفی پیاپی" : "خنثی"}
            />
          </div>
          <MethodNote>RSI و MACD فقط شتاب تاریخی همین سری را توصیف می‌کنند و به‌تنهایی مبنای تصمیم نیستند.</MethodNote>
        </div>
      )}

      {tab === "drivers" && (
        <div className="analysis-body" id="analysis-panel-drivers" role="tabpanel">
          {marketKey !== "iran" && (
            <div className="analysis-context-note">
              تفکیک اونس، دلار و صرف داخلی برای بازده طلای ۱۸ عیار ایران محاسبه می‌شود؛ هم‌حرکتی‌ها همچنان بر اساس بازار انتخابی هستند.
            </div>
          )}
          <div className="analysis-metric-grid">
            <Metric label="اثر اونس" value={percent(drivers.global)} hint="تغییر ابتدا تا انتهای دوره" />
            <Metric label="اثر دلار" value={percent(drivers.usd)} hint="تغییر ابتدا تا انتهای دوره" />
            <Metric label="اثر صرف داخلی" value={percent(drivers.premium)} hint="تغییر نسبت قیمت داخلی به ارزش نظری" />
            <Metric label="اثر متقابل" value={percent(drivers.interaction)} hint="باقیمانده تعامل ضربی عوامل" />
            <Metric label="هم‌حرکتی با اونس" value={correlation(correlations.global)} hint={correlations.globalLabel} />
            <Metric label="هم‌حرکتی با دلار" value={correlation(correlations.usd)} hint={correlations.usdLabel} />
          </div>
          <MethodNote>{analysis.methodology.drivers}</MethodNote>
        </div>
      )}

      {tab === "risk" && (
        <div className="analysis-body" id="analysis-panel-risk" role="tabpanel">
          <div className="risk-meter" aria-label={`سطح نوسان ${risk.volatilityLabel}`}>
            <span style={{ width: `${Math.min(risk.annualizedVolatility, 70) / 0.7}%` }} />
          </div>
          <div className="analysis-metric-grid">
            <Metric label="نوسان سالانه‌شده" value={`${formatFa(risk.annualizedVolatility, 1)}٪`} hint={risk.volatilityLabel} />
            <Metric label="نوسان نزولی" value={`${formatFa(risk.downsideDeviation, 1)}٪`} hint="فقط روزهای منفی" />
            <Metric label="بیشترین افت دوره" value={percent(risk.maximumDrawdown)} hint="از قله تا کف بعدی" tone="negative" />
            <Metric label="افت فعلی از سقف دوره" value={percent(risk.currentDrawdown)} hint="نسبت به بیشترین قیمت بازه" />
            <Metric label="صدک پنجم بازده روزانه" value={percent(risk.historicalVaR95)} hint="تقریب تاریخی، نه تضمین زیان" />
            <Metric label="دامنه ۲۰ روزه" value={`${formatFa(risk.dailyRange, 1)}٪`} hint="فاصله کف تا سقف مرجع" />
          </div>
          <MethodNote>{analysis.methodology.risk}</MethodNote>
        </div>
      )}

      {tab === "quality" && (
        <div className="analysis-body" id="analysis-panel-quality" role="tabpanel">
          <div className="quality-grid">
            <article>
              <Database size={18} />
              <div><b>قیمت جاری</b><span>{sourceStatus === "live" ? "خوانده‌شده از منبع عمومی" : sourceStatus === "partial" ? "ترکیبی از داده منبع و پشتیبان" : "حالت پشتیبان یا خطای منبع"}</span></div>
            </article>
            <article>
              <Gauge size={18} />
              <div><b>تاریخچه و کندل‌ها</b><span>بازسازی‌شده از نقاط مرجع؛ OHLC رسمی یا فید معاملاتی نیست.</span></div>
            </article>
            <article>
              <ShieldCheck size={18} />
              <div><b>تحلیل‌ها</b><span>محاسبات توصیفی و قابل بازتولید از داده‌های نمایش‌داده‌شده هستند.</span></div>
            </article>
          </div>
          <MethodNote>برای تفسیر عمومی، کیفیت و منشأ داده باید همراه هر شاخص دیده شود؛ اعداد بازسازی‌شده برای معامله لحظه‌ای مناسب نیستند.</MethodNote>
        </div>
      )}
    </section>
  );
}
