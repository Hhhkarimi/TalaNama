"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  Download,
  Gauge,
  Globe2,
  LineChart,
  Menu,
  Moon,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Sun,
  WalletCards,
  X
} from "lucide-react";
import MarketChart from "@/components/MarketChart";
import DriversChart from "@/components/DriversChart";
import AdvancedAnalysis from "@/components/AdvancedAnalysis";
import PriceAlert from "@/components/PriceAlert";
import { applyMarketSnapshot, calculateStats, formatFa, generateMarketData, MARKET_META } from "@/lib/goldData";
import { buildMarketAnalysis } from "@/lib/analytics";

const baseData = generateMarketData();
const HOUR_MS = 60 * 60 * 1000;
const periodDays = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365 };
const periodLabels = { "1M": "۱ ماه", "3M": "۳ ماه", "6M": "۶ ماه", "1Y": "۱ سال" };

function cn(...names) {
  return names.filter(Boolean).join(" ");
}

function percent(value, digits = 2) {
  return `${value >= 0 ? "+" : ""}${formatFa(value, digits)}٪`;
}

function formatUpdateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: "Asia/Tehran",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function isValidSnapshot(snapshot) {
  const data = snapshot?.data;
  return [data?.global, data?.iran, data?.usd].every(Number.isFinite);
}

function Change({ value, compact = false }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpLeft : ArrowDownLeft;
  return (
    <span className={cn("change", positive ? "positive" : "negative", compact && "compact")}>
      <Icon size={compact ? 13 : 15} /> {percent(value)}
    </span>
  );
}

function NavItem({ icon: Icon, children, href, active, onClick }) {
  return (
    <a className={cn("nav-item", active && "active")} href={href} onClick={onClick}>
      <Icon size={19} strokeWidth={1.8} />
      <span>{children}</span>
    </a>
  );
}

function SummaryCard({ label, symbol, value, unit, change, icon: Icon, tone, note }) {
  return (
    <article className="summary-card">
      <div className="summary-head">
        <div className={cn("summary-icon", tone)}><Icon size={19} /></div>
        <span className="symbol">{symbol}</span>
      </div>
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value} <small>{unit}</small></div>
      <div className="summary-foot"><Change value={change} compact /><span>{note}</span></div>
    </article>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function IndicatorToggle({ id, label, checked, onChange, color }) {
  return (
    <label className={cn("indicator-chip", checked && "checked")}>
      <input type="checkbox" checked={checked} onChange={() => onChange(id)} />
      <i style={{ background: color }} />
      {label}
      {checked && <Check size={13} />}
    </label>
  );
}

export default function GoldDashboard() {
  const [market, setMarket] = useState("iran");
  const [period, setPeriod] = useState("6M");
  const [chartMode, setChartMode] = useState("area");
  const [indicators, setIndicators] = useState(["sma20"]);
  const [scenarioGold, setScenarioGold] = useState(5);
  const [scenarioUsd, setScenarioUsd] = useState(10);
  const [scenarioPremium, setScenarioPremium] = useState(0);
  const [investment, setInvestment] = useState(100000000);
  const [investPeriod, setInvestPeriod] = useState("6M");
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [marketSnapshot, setMarketSnapshot] = useState(null);
  const [syncState, setSyncState] = useState({ status: "loading", updatedAt: null });
  const [refreshing, setRefreshing] = useState(false);

  const refreshMarket = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/market", { cache: "no-store" });
      if (!response.ok) throw new Error("market request failed");
      const snapshot = await response.json();
      if (!isValidSnapshot(snapshot)) throw new Error("invalid market response");
      if (snapshot.status !== "fallback") setMarketSnapshot(snapshot);
      setSyncState({ status: snapshot.status, updatedAt: snapshot.updatedAt || null });
    } catch {
      setSyncState((currentState) => ({ ...currentState, status: "error" }));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refreshMarket(), 0);
    const interval = window.setInterval(() => void refreshMarket(), HOUR_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [refreshMarket]);

  const marketData = useMemo(
    () => applyMarketSnapshot(baseData, marketSnapshot),
    [marketSnapshot]
  );

  const current = marketData[marketData.length - 1];
  const yesterday = marketData[marketData.length - 2];
  const globalDaily = ((current.global / yesterday.global) - 1) * 100;
  const iranDaily = ((current.iran / yesterday.iran) - 1) * 100;
  const usdDaily = ((current.usd / yesterday.usd) - 1) * 100;

  const filtered = useMemo(() => {
    const slice = marketData.slice(-(periodDays[period] + 1));
    const start = slice[0];
    const key = market === "compare" ? "iran" : market;
    return slice.map((row, index) => {
      const previous = index ? slice[index - 1][key] : row[key];
      return {
        ...row,
        value: row[key],
        open: row[`${key}Open`] ?? previous,
        high: row[`${key}High`] ?? Math.max(previous, row[key]),
        low: row[`${key}Low`] ?? Math.min(previous, row[key]),
        close: row[key],
        sma20: row[`${key}Sma20`],
        sma50: row[`${key}Sma50`],
        upper: row[`${key}Upper`],
        lower: row[`${key}Lower`],
        dailyReturn: ((row[key] / previous) - 1) * 100,
        globalIndex: (row.global / start.global) * 100,
        iranIndex: (row.iran / start.iran) * 100,
        usdIndex: (row.usd / start.usd) * 100
      };
    });
  }, [market, marketData, period]);

  const key = market === "compare" ? "iran" : market;
  const stats = calculateStats(filtered, key);
  const globalStats = calculateStats(filtered, "global");
  const iranStats = calculateStats(filtered, "iran");
  const usdStats = calculateStats(filtered, "usd");
  const analysis = useMemo(() => buildMarketAnalysis(filtered, key), [filtered, key]);
  const drivers = analysis.driverItems;

  const projectedGlobal = current.global * (1 + scenarioGold / 100);
  const projectedUsd = current.usd * (1 + scenarioUsd / 100);
  const projectedIran = ((projectedGlobal * projectedUsd * 0.75) / 31.1035) * (1 + scenarioPremium / 100);
  const projectedChange = ((projectedIran / current.iran) - 1) * 100;

  const investSlice = marketData.slice(-(periodDays[investPeriod] + 1));
  const investReturn = ((investSlice.at(-1).iran / investSlice[0].iran) - 1) * 100;
  const investResult = investment * (1 + investReturn / 100);

  const updateTime = formatUpdateTime(syncState.updatedAt || marketSnapshot?.updatedAt);
  const updateText = syncState.status === "live"
    ? `آخرین داده: ${updateTime}`
    : syncState.status === "partial"
      ? `به‌روزرسانی بخشی: ${updateTime}`
      : syncState.status === "loading"
        ? "در حال دریافت داده..."
        : updateTime
          ? `آخرین داده ذخیره‌شده: ${updateTime}`
          : "نمایش داده پشتیبان";
  const sourceIsHealthy = syncState.status === "live" || syncState.status === "partial";

  const toggleIndicator = (id) => {
    setIndicators((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  const exportCsv = () => {
    const header = "date,global_usd_oz,iran_18k_toman,usd_toman,premium_percent,selected_market,open,high,low,close,history_quality,source_status";
    const rows = [header, ...filtered.map((row) => [
      row.date,
      row.global.toFixed(2),
      Math.round(row.iran),
      Math.round(row.usd),
      row.premium.toFixed(2),
      key,
      Number(row.open).toFixed(MARKET_META[key].decimals),
      Number(row.high).toFixed(MARKET_META[key].decimals),
      Number(row.low).toFixed(MARKET_META[key].decimals),
      Number(row.close).toFixed(MARKET_META[key].decimals),
      row.historyQuality || "reconstructed",
      syncState.status
    ].join(","))];
    const blob = new Blob(["\uFEFF", rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `talanama-${period}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const scrollTo = (id) => (event) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  };

  return (
    <main className={cn("app-shell", dark && "dark")}>
      {sidebarOpen && <button className="scrim" aria-label="بستن منو" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn("sidebar", sidebarOpen && "open")}>
        <div className="brand">
          <div className="brand-mark"><span /></div>
          <div><b>طلانما</b><small>دید روشن به بازار</small></div>
          <button className="icon-btn sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="بستن منو"><X size={20} /></button>
        </div>
        <nav className="main-nav" aria-label="ناوبری اصلی">
          <span className="nav-title">داشبورد</span>
          <NavItem icon={BarChart3} href="#overview" active onClick={scrollTo("overview")}>نمای کلی بازار</NavItem>
          <NavItem icon={Activity} href="#chart" onClick={scrollTo("chart")}>نمودار و روند</NavItem>
          <NavItem icon={Sparkles} href="#analysis" onClick={scrollTo("analysis")}>تحلیل انتخابی</NavItem>
          <span className="nav-title">ابزارها</span>
          <NavItem icon={SlidersHorizontal} href="#scenario" onClick={scrollTo("scenario")}>سناریوساز قیمت</NavItem>
          <NavItem icon={Calculator} href="#calculator" onClick={scrollTo("calculator")}>محاسبه‌گر بازده</NavItem>
          <NavItem icon={BookOpen} href="#sources" onClick={scrollTo("sources")}>منابع و روش</NavItem>
        </nav>
        <PriceAlert
          currentPrice={current.iran}
          updatedAt={syncState.updatedAt || marketSnapshot?.updatedAt}
          sourceStatus={syncState.status}
        />
        <div className="sidebar-foot">
          <div className={cn("status-dot", !sourceIsHealthy && "stale")} />
          <div><b>داده‌های بازار</b><small>{sourceIsHealthy ? "به‌روزرسانی ساعتی فعال" : "حالت پشتیبان فعال"}</small></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="topbar-right">
            <button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="باز کردن منو"><Menu size={21} /></button>
            <div>
              <h1>نبض بازار طلا</h1>
              <p>رصد هم‌زمان بازار جهانی و ایران</p>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className={cn("update-pill", syncState.status)}
              onClick={refreshMarket}
              disabled={refreshing}
              title="بررسی دوباره داده‌های ساعتی"
              aria-label="به‌روزرسانی قیمت‌های بازار"
            >
              <span className="live-dot" />
              <span aria-live="polite">{updateText}</span>
              <RefreshCw className={refreshing ? "spinning" : ""} size={13} />
            </button>
            <button className="icon-btn" onClick={() => setDark((value) => !value)} aria-label="تغییر پوسته">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="export-btn" onClick={exportCsv}><Download size={16} /> خروجی داده</button>
          </div>
        </header>

        <div className="content">
          <section id="overview" className="section-block">
            <div className="section-heading">
              <div><span className="eyebrow">نمای لحظه‌ای</span><h2>بازار در یک نگاه</h2></div>
              <div className="market-open"><span /> به‌روزرسانی خودکار هر ساعت</div>
            </div>
            <div className="summary-grid">
              <SummaryCard label="اونس جهانی طلا" symbol="XAU" value={`$${formatFa(current.global, 2)}`} unit="/ اونس" change={globalDaily} icon={Globe2} tone="blue" note="نسبت به دیروز" />
              <SummaryCard label="طلای ۱۸ عیار" symbol="IR18" value={formatFa(current.iran)} unit="تومان" change={iranDaily} icon={CircleDollarSign} tone="gold" note="هر گرم" />
              <SummaryCard label="دلار بازار آزاد" symbol="USD" value={formatFa(current.usd)} unit="تومان" change={usdDaily} icon={WalletCards} tone="violet" note="نسبت به دیروز" />
              <SummaryCard label="حباب قیمت داخلی" symbol="PRM" value={formatFa(current.premium, 2)} unit="درصد" change={current.premium - yesterday.premium} icon={Gauge} tone="teal" note="نسبت به ارزش ذاتی" />
            </div>
          </section>

          <section id="chart" className="panel chart-panel">
            <div className="panel-head chart-head">
              <div>
                <div className="panel-kicker"><LineChart size={16} /> تحلیل روند</div>
                <h2>{MARKET_META[market].label}</h2>
                <div className="price-line">
                  {market === "compare" ? <strong>{formatFa((filtered.at(-1).iranIndex - 100), 1)}٪ بازده ایران</strong> : <strong>{formatFa(stats.current, MARKET_META[market].decimals)} <small>{MARKET_META[market].unit}</small></strong>}
                  <Change value={stats.change} />
                  <span>در {periodLabels[period]} اخیر</span>
                </div>
              </div>
              <div className="chart-head-actions">
                <div className="select-wrap">
                  <select
                    value={market}
                    onChange={(event) => {
                      const nextMarket = event.target.value;
                      setMarket(nextMarket);
                      if (nextMarket === "compare" && chartMode === "candles") setChartMode("compare");
                    }}
                    aria-label="انتخاب بازار"
                  >
                    <option value="iran">طلای ۱۸ عیار</option>
                    <option value="global">اونس جهانی</option>
                    <option value="usd">دلار آزاد</option>
                    <option value="compare">مقایسه بازده</option>
                  </select>
                  <ChevronDown size={15} />
                </div>
                <button className={cn("settings-btn", settingsOpen && "active")} onClick={() => setSettingsOpen((value) => !value)}><Settings2 size={16} /> اندیکاتورها</button>
              </div>
            </div>

            <div className="chart-toolbar">
              <div className="segmented chart-types" aria-label="نوع نمودار">
                {[{ id: "area", label: "ناحیه‌ای" }, { id: "line", label: "خطی" }, { id: "candles", label: "کندل" }, { id: "returns", label: "بازده روزانه" }, { id: "compare", label: "مقایسه" }].map((item) => (
                  <button
                    key={item.id}
                    className={chartMode === item.id ? "active" : ""}
                    onClick={() => setChartMode(item.id)}
                    disabled={item.id === "candles" && market === "compare"}
                    title={item.id === "candles" && market === "compare" ? "کندل برای حالت مقایسه در دسترس نیست" : undefined}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="segmented periods" aria-label="بازه زمانی">
                {Object.keys(periodDays).map((item) => <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{periodLabels[item]}</button>)}
              </div>
            </div>

            {settingsOpen && (
              <div className="indicator-bar">
                <span>نمایش روی نمودار:</span>
                <IndicatorToggle id="sma20" label="میانگین ۲۰ روزه" color="#277d73" checked={indicators.includes("sma20")} onChange={toggleIndicator} />
                <IndicatorToggle id="sma50" label="میانگین ۵۰ روزه" color="#6d62a8" checked={indicators.includes("sma50")} onChange={toggleIndicator} />
                <IndicatorToggle id="bands" label="باند بولینگر" color="#8f8a7f" checked={indicators.includes("bands")} onChange={toggleIndicator} />
              </div>
            )}

            <MarketChart data={filtered} market={market} chartMode={chartMode} indicators={indicators} />
            {(market === "compare" || chartMode === "compare") && (
              <div className="chart-legend">
                <span><i className="legend-gold" />طلای ایران</span><span><i className="legend-teal" />اونس جهانی</span><span><i className="legend-violet" />دلار آزاد</span>
              </div>
            )}
            <div className="stats-row">
              <Stat label="بیشترین قیمت" value={formatFa(stats.high, MARKET_META[key].decimals)} />
              <Stat label="کمترین قیمت" value={formatFa(stats.low, MARKET_META[key].decimals)} />
              <Stat label="میانگین دوره" value={formatFa(stats.average, MARKET_META[key].decimals)} />
              <Stat label="نوسان سالانه" value={`${formatFa(stats.volatility, 1)}٪`} hint={stats.volatility > 35 ? "ریسک بالا" : "ریسک متعادل"} />
            </div>
          </section>

          <div className="two-column" id="analysis">
            <AdvancedAnalysis
              analysis={analysis}
              marketKey={key}
              marketLabel={MARKET_META[key].label}
              periodLabel={periodLabels[period]}
              sourceStatus={syncState.status}
            />

            <section className="panel drivers-panel">
              <div className="panel-head compact-head">
                <div><div className="panel-kicker"><Activity size={16} /> تفکیک بازده</div><h2>چه چیزی طلا را حرکت داد؟</h2></div>
                <span className="period-badge">{periodLabels[period]} اخیر</span>
              </div>
              <DriversChart items={drivers} />
              <div className="driver-summary">
                <div><span>بازده طلای ایران</span><strong className={iranStats.change >= 0 ? "positive" : "negative"}>{percent(iranStats.change, 1)}</strong></div>
                <ArrowLeft size={18} />
                <p>{Math.abs(analysis.correlations.usd) > Math.abs(analysis.correlations.global) ? "هم‌حرکتی روزانه با نرخ ارز در این دوره بیشتر از اونس بوده است." : "هم‌حرکتی روزانه با اونس در این دوره بیشتر یا هم‌اندازه نرخ ارز بوده است."}</p>
              </div>
            </section>
          </div>

          <section id="scenario" className="panel scenario-panel">
            <div className="panel-head">
              <div><div className="panel-kicker"><SlidersHorizontal size={16} /> سناریوساز تعاملی</div><h2>اگر شرایط بازار تغییر کند...</h2><p>اثر هم‌زمان اونس، دلار و حباب داخلی را روی طلای ۱۸ عیار بسنجید.</p></div>
              <div className="scenario-result">
                <span>قیمت برآوردی هر گرم</span>
                <strong>{formatFa(projectedIran)} <small>تومان</small></strong>
                <Change value={projectedChange} />
              </div>
            </div>
            <div className="scenario-grid">
              <label className="range-field">
                <div><span>تغییر اونس جهانی</span><output className={scenarioGold >= 0 ? "positive" : "negative"}>{percent(scenarioGold, 0)}</output></div>
                <input type="range" min="-20" max="25" step="1" value={scenarioGold} onChange={(event) => setScenarioGold(Number(event.target.value))} />
                <small><span>۲۰٪-</span><span>۲۵٪+</span></small>
              </label>
              <label className="range-field">
                <div><span>تغییر نرخ دلار</span><output className={scenarioUsd >= 0 ? "positive" : "negative"}>{percent(scenarioUsd, 0)}</output></div>
                <input type="range" min="-20" max="40" step="1" value={scenarioUsd} onChange={(event) => setScenarioUsd(Number(event.target.value))} />
                <small><span>۲۰٪-</span><span>۴۰٪+</span></small>
              </label>
              <label className="range-field">
                <div><span>حباب بازار داخلی</span><output className={scenarioPremium >= 0 ? "positive" : "negative"}>{percent(scenarioPremium, 0)}</output></div>
                <input type="range" min="-8" max="12" step="1" value={scenarioPremium} onChange={(event) => setScenarioPremium(Number(event.target.value))} />
                <small><span>۸٪-</span><span>۱۲٪+</span></small>
              </label>
            </div>
            <div className="formula-strip">
              <div><span>اونس سناریو</span><b>${formatFa(projectedGlobal, 0)}</b></div>
              <span className="formula-sign">×</span>
              <div><span>دلار سناریو</span><b>{formatFa(projectedUsd, 0)}</b></div>
              <span className="formula-sign">÷</span>
              <div><span>تبدیل عیار و وزن</span><b>۰٫۷۵ / ۳۱٫۱</b></div>
              <span className="formula-sign">=</span>
              <div className="formula-total"><span>برآورد نهایی</span><b>{formatFa(projectedIran / 1000000, 2)} میلیون</b></div>
            </div>
          </section>

          <section id="calculator" className="panel calculator-panel">
            <div className="calculator-intro">
              <div className="calculator-icon"><Calculator size={24} /></div>
              <div><h2>محاسبه‌گر بازده سرمایه</h2><p>ببینید سرمایه شما در طلای ۱۸ عیار طی بازه انتخابی چه تغییری می‌کرد.</p></div>
            </div>
            <div className="calculator-fields">
              <label><span>مبلغ سرمایه‌گذاری (تومان)</span><input type="number" min="1000000" step="1000000" value={investment} onChange={(event) => setInvestment(Math.max(0, Number(event.target.value)))} /></label>
              <label><span>بازه سرمایه‌گذاری</span><select value={investPeriod} onChange={(event) => setInvestPeriod(event.target.value)}>{Object.keys(periodDays).map((item) => <option key={item} value={item}>{periodLabels[item]} اخیر</option>)}</select></label>
            </div>
            <div className="calculator-result">
              <div><span>ارزش امروز سرمایه</span><strong>{formatFa(investResult)} <small>تومان</small></strong></div>
              <div><span>سود / زیان دوره</span><strong className={investReturn >= 0 ? "positive" : "negative"}>{percent(investReturn, 1)}</strong></div>
              <div><span>تغییر ریالی</span><strong className={investReturn >= 0 ? "positive" : "negative"}>{formatFa(investResult - investment)} <small>تومان</small></strong></div>
            </div>
          </section>

          <footer id="sources" className="footer">
            <div className="source-note">
              <RefreshCw size={17} />
              <p><b>روش داده:</b> قیمت جاری هر ساعت در سمت سرور فقط از صفحات عمومی شبکه طلا و ارز ایران خوانده و روی سری تاریخی نمایشی اعمال می‌شود؛ در قطع موقت منبع، آخرین داده قابل‌استفاده باقی می‌ماند.</p>
            </div>
            <div className="source-links">
              <a href="https://www.tgju.org/profile/ons" target="_blank" rel="noreferrer">اونس جهانی در TGJU <ArrowUpLeft size={14} /></a>
              <a href="https://www.tgju.org/profile/geram18" target="_blank" rel="noreferrer">طلای ۱۸ عیار در TGJU <ArrowUpLeft size={14} /></a>
              <a href="https://www.tgju.org/profile/price_dollar_rl" target="_blank" rel="noreferrer">دلار آزاد در TGJU <ArrowUpLeft size={14} /></a>
            </div>
            <p className="disclaimer">این داشبورد ابزار تحلیلی است و توصیه خرید یا فروش محسوب نمی‌شود.</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
