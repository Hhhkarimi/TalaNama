"use client";

import { useState } from "react";
import styles from "./prototypes.module.css";

const markets = [
  {
    name: "اونس جهانی",
    symbol: "XAU",
    value: "$۲٬۴۳۶٫۸۰",
    change: "+۰٫۸٪",
    provenance: "observed",
    quality: "delayed",
    note: "آخرین دریافت موفق: ۴۲ دقیقه پیش"
  },
  {
    name: "طلای ۱۸ عیار",
    symbol: "IR18",
    value: "۷٬۸۴۰٬۰۰۰ تومان",
    change: "+۱٫۳٪",
    provenance: "observed",
    quality: "fresh",
    note: "به‌روزرسانی ساعتی"
  },
  {
    name: "دلار آزاد",
    symbol: "USD",
    value: "۹۸٬۴۰۰ تومان",
    change: "+۰٫۶٪",
    provenance: "fallback",
    quality: "stale",
    note: "آخرین داده ذخیره‌شده"
  },
  {
    name: "صرف نظری طلا",
    symbol: "PRM",
    value: "۲٫۴٪",
    change: "−۰٫۲ واحد",
    provenance: "derived",
    quality: "partial",
    note: "محاسبه‌شده از سه ورودی"
  }
];

const secondaryMarkets = [
  { name: "طلای ۲۴ عیار", value: "۱۰٬۴۵۳٬۰۰۰", unit: "تومان", provenance: "derived" },
  { name: "مثقال طلا", value: "۳۳٬۹۶۰٬۰۰۰", unit: "تومان", provenance: "observed" },
  { name: "سکه امامی", value: "۸۶٬۲۰۰٬۰۰۰", unit: "تومان", provenance: "observed" },
  { name: "صرف سکه امامی", value: "۱۲٫۸", unit: "درصد", provenance: "derived" }
];

const stateLabels = {
  observed: "داده مشاهده‌شده",
  derived: "محاسبه‌شده",
  reconstructed: "تاریخچه بازسازی‌شده",
  fallback: "داده پشتیبان",
  stale: "قدیمی",
  partial: "پوشش بخشی",
  unavailable: "در دسترس نیست",
  delayed: "با تأخیر",
  fresh: "به‌روز"
};

function StateBadge({ state }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${state}`] || ""}`}>
      {stateLabels[state] || state}
    </span>
  );
}

function MiniLine() {
  return (
    <svg
      className={styles.miniLine}
      viewBox="0 0 300 84"
      role="img"
      aria-label="نمونه نمودار روند بازسازی‌شده طلای ۱۸ عیار"
    >
      <title>نمونه نمودار روند بازسازی‌شده طلای ۱۸ عیار</title>
      <path className={styles.chartGrid} d="M0 20H300 M0 42H300 M0 64H300" />
      <path
        className={styles.pathGold}
        d="M0 76 C36 61 48 75 77 58 C101 44 121 59 143 38 C168 14 189 31 224 16 C247 5 270 18 300 4"
      />
    </svg>
  );
}

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>◆</span>
        <div>
          <b>طلانما</b>
          <small>دید روشن به بازار</small>
        </div>
      </div>

      <nav aria-label="ناوبری نمونه">
        <span>داشبورد</span>
        <a className={styles.active} href="#overview">▦ نمای کلی بازار</a>
        <a href="#chart">⌁ نمودار و روند</a>
        <a href="#analysis">✦ تحلیل انتخابی</a>
        <span>ابزارها</span>
        <a href="#scenario">☷ سناریوساز قیمت</a>
        <a href="#calculator">▣ محاسبه‌گر بازده</a>
        <a href="#sources">◉ منابع و روش</a>
      </nav>

      <div className={styles.alertCard}>
        <b>هشدار قیمت</b>
        <small>نسخه مرورگری — فقط هنگام باز بودن برنامه</small>
        <button type="button" disabled>فعلاً در دست طراحی</button>
      </div>

      <div className={styles.sidebarHealth}>
        <span aria-hidden="true" />
        <div>
          <b>وضعیت منابع</b>
          <small>۲ به‌روز، ۱ قدیمی، ۱ مشتق‌شده</small>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onToggleTheme }) {
  return (
    <header className={styles.topbar}>
      <div>
        <h1>نبض بازار طلا</h1>
        <p>Prototype A انتخاب‌شده — داده‌ها صرفاً نمایشی‌اند</p>
      </div>

      <div className={styles.topActions}>
        <button type="button" className={styles.qualityButton}>
          <span aria-hidden="true" /> آخرین دریافت موفق: ۴۲ دقیقه پیش
        </button>
        <button type="button" aria-label="تغییر پوسته نمونه" onClick={onToggleTheme}>◐</button>
        <button type="button">⇩ خروجی داده</button>
      </div>
    </header>
  );
}

function OverviewCards() {
  return (
    <section id="overview">
      <div className={styles.sectionTitle}>
        <div>
          <small>نمای لحظه‌ای</small>
          <h2>بازار در یک نگاه</h2>
        </div>
        <span>به‌روزرسانی ساعتی، نه فید لحظه‌ای</span>
      </div>

      <div className={styles.cardGrid}>
        {markets.map((market) => (
          <article className={styles.marketCard} key={market.symbol}>
            <div className={styles.cardHead}>
              <span>{market.symbol}</span>
              <StateBadge state={market.provenance} />
            </div>
            <h3>{market.name}</h3>
            <strong>{market.value}</strong>
            <div className={styles.cardFoot}>
              <b>{market.change}</b>
              <span>{market.note}</span>
            </div>
            <div className={styles.metaLine}>
              <span>کیفیت</span>
              <StateBadge state={market.quality} />
              <span>پوشش: ۲۸ تیر ۱۴۰۵ تا امروز</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReconstructionWarning() {
  return (
    <div className={styles.warning} role="status">
      <strong>تاریخچه این نمونه بازسازی‌شده است.</strong>
      <span>
        اندیکاتورهای نیازمند داده روزانه مشاهده‌شده غیرفعال‌اند؛ نقاط مرجع و روش
        بازسازی در جزئیات منبع نمایش داده می‌شوند.
      </span>
      <StateBadge state="reconstructed" />
    </div>
  );
}

function ChartPanel() {
  return (
    <section id="chart" className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <small>تحلیل روند</small>
          <h2>طلای ۱۸ عیار</h2>
          <p><strong>۷٬۸۴۰٬۰۰۰ تومان</strong> <b>+۷٫۲٪</b> در شش ماه اخیر</p>
        </div>
        <div className={styles.inlineControls}>
          <button type="button">طلای ۱۸ عیار⌄</button>
          <button type="button">شش ماه⌄</button>
        </div>
      </div>

      <ReconstructionWarning />

      <div className={styles.chartToolbar} role="group" aria-label="حالت نمودار">
        <button type="button" className={styles.selected}>ناحیه‌ای</button>
        <button type="button">خطی</button>
        <button type="button" disabled title="به داده مشاهده‌شده نیاز دارد">بازده روزانه</button>
        <button type="button">مقایسه</button>
      </div>

      <div className={styles.indicatorControls}>
        <span>شاخص‌ها:</span>
        <button type="button" disabled>SMA 20 — نیازمند داده مشاهده‌شده</button>
        <button type="button" disabled>باند بولینگر — نیازمند داده مشاهده‌شده</button>
        <button type="button">خط نقاط مرجع</button>
      </div>

      <MiniLine />

      <div className={styles.statGrid}>
        <div><span>بازده بازسازی‌شده</span><b>+۷٫۲٪</b></div>
        <div><span>بیشینه نقطه مرجع</span><b>۸٬۰۴۰٬۰۰۰</b></div>
        <div><span>کمینه نقطه مرجع</span><b>۷٬۱۰۵٬۰۰۰</b></div>
        <div><span>پوشش مشاهده‌شده</span><b>۱۴ روز</b></div>
      </div>

      <details className={styles.accessibleTable}>
        <summary>نمایش خلاصه و جدول قابل دسترس نمودار</summary>
        <p>واحد: تومان برای هر گرم طلای ۱۸ عیار. کیفیت: تاریخچه بازسازی‌شده با ۱۴ روز مشاهده‌شده.</p>
        <table>
          <thead>
            <tr><th>تاریخ نمونه</th><th>مقدار</th><th>وضعیت</th></tr>
          </thead>
          <tbody>
            <tr><td>۲۸ تیر ۱۴۰۵</td><td>۷٬۱۰۵٬۰۰۰</td><td>نقطه مرجع</td></tr>
            <tr><td>۱۵ مرداد ۱۴۰۵</td><td>۷٬۴۹۰٬۰۰۰</td><td>بازسازی‌شده</td></tr>
            <tr><td>امروز</td><td>۷٬۸۴۰٬۰۰۰</td><td>مشاهده‌شده</td></tr>
          </tbody>
        </table>
      </details>
    </section>
  );
}

function SecondaryMarkets() {
  return (
    <section className={styles.secondaryStrip} aria-label="بازارهای تکمیلی">
      {secondaryMarkets.map((item) => (
        <article key={item.name}>
          <span>{item.name}</span>
          <b>{item.value} <small>{item.unit}</small></b>
          <StateBadge state={item.provenance} />
        </article>
      ))}
    </section>
  );
}

function CoinComparison() {
  return (
    <section id="analysis" className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <small>بازارهای تکمیلی</small>
          <h2>مقایسه سکه و طلا</h2>
        </div>
        <button type="button">نمایش همه بازارها</button>
      </div>

      <div className={styles.coinGrid}>
        {secondaryMarkets.map((item) => (
          <article key={item.name}>
            <div>
              <b>{item.name}</b>
              <StateBadge state={item.provenance} />
            </div>
            <strong>{item.value} <small>{item.unit}</small></strong>
            <span>تغییر روزانه نمایشی: +۰٫۴٪</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function SourceHealth() {
  const rows = [
    ["TGJU — طلای ۱۸ عیار", "به‌روز", "۴۲ دقیقه", "observed"],
    ["TGJU — دلار آزاد", "قدیمی", "۱۹ ساعت", "fallback"],
    ["منبع اونس", "با تأخیر", "۲ ساعت", "delayed"],
    ["تاریخچه روزانه", "پوشش ناقص", "۱۴ روز مشاهده‌شده", "partial"]
  ];

  return (
    <section id="sources" className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <small>شفافیت منبع</small>
          <h2>سلامت و تازگی منابع</h2>
        </div>
        <button type="button">روش و محدودیت‌ها</button>
      </div>

      <div className={styles.sourceTable} role="table" aria-label="وضعیت منابع">
        {rows.map(([name, status, age, state]) => (
          <div role="row" key={name}>
            <b role="cell">{name}</b>
            <span role="cell">{status}</span>
            <span role="cell">{age}</span>
            <StateBadge state={state} />
          </div>
        ))}
      </div>

      <p className={styles.sourceError}>
        نمونه قطعی منبع: پاسخ دلار نامعتبر بود؛ آخرین داده ذخیره‌شده با برچسب
        پشتیبان نمایش داده شد.
      </p>
    </section>
  );
}

function ScenarioAndCalculator() {
  return (
    <div className={styles.toolGrid}>
      <section id="scenario" className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <small>سناریوی فرضی</small>
            <h2>اثر ورودی‌ها بر قیمت نظری</h2>
          </div>
          <StateBadge state="derived" />
        </div>

        <div className={styles.sliderRows}>
          <label>تغییر اونس <output>+۵٪</output><input type="range" defaultValue="55" /></label>
          <label>تغییر دلار <output>+۱۰٪</output><input type="range" defaultValue="62" /></label>
          <label>تغییر صرف داخلی <output>۰٪</output><input type="range" defaultValue="50" /></label>
        </div>

        <div className={styles.scenarioResult}>
          <span>قیمت نظری سناریو</span>
          <strong>۸٬۷۶۵٬۰۰۰ تومان</strong>
          <small>سناریو قطعی و فرضی است؛ پیش‌بینی نیست.</small>
        </div>

        <table className={styles.sensitivity}>
          <caption>نمونه جدول حساسیت</caption>
          <tbody>
            <tr><th>دلار \\ اونس</th><th>۰٪</th><th>+۵٪</th></tr>
            <tr><th>+۵٪</th><td>+۵٫۰٪</td><td>+۱۰٫۳٪</td></tr>
            <tr><th>+۱۰٪</th><td>+۱۰٫۰٪</td><td>+۱۵٫۵٪</td></tr>
          </tbody>
        </table>
      </section>

      <section id="calculator" className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <small>بازده تاریخی</small>
            <h2>محاسبه‌گر با کیفیت داده</h2>
          </div>
          <StateBadge state="partial" />
        </div>

        <div className={styles.formRows}>
          <label>سرمایه اولیه<input defaultValue="100000000" inputMode="numeric" /></label>
          <label>
            دارایی
            <select defaultValue="gold">
              <option value="gold">طلای ۱۸ عیار</option>
              <option value="ounce">اونس جهانی</option>
            </select>
          </label>
          <label>هزینه معامله<input defaultValue="1.5٪" /></label>
        </div>

        <div className={styles.calcResult}>
          <div><span>نتیجه اسمی</span><b>۱۰۷٬۲۰۰٬۰۰۰ تومان</b></div>
          <div><span>وضعیت داده</span><b>مرز شروع بازسازی‌شده</b></div>
        </div>

        <p className={styles.muted}>
          بازده تاریخی پیش‌بینی عملکرد آینده نیست. محاسبه سالانه تا تکمیل پوشش
          مشاهده‌شده نمایش داده نمی‌شود.
        </p>
      </section>
    </div>
  );
}

export default function PrototypePage() {
  const [dark, setDark] = useState(false);

  return (
    <main className={`${styles.shell} ${dark ? styles.dark : ""}`}>
      <Sidebar />
      <section className={styles.workspace}>
        <Topbar onToggleTheme={() => setDark((value) => !value)} />

        <div className={styles.prototypeBanner} role="note">
          <b>Variant A انتخاب شده است.</b>
          <span>نمونه دورریختنی؛ مسیر اصلی و داده‌های production را تغییر نمی‌دهد.</span>
        </div>

        <div className={styles.content}>
          <OverviewCards />
          <SecondaryMarkets />
          <ChartPanel />
          <CoinComparison />
          <ScenarioAndCalculator />
          <SourceHealth />

          <footer className={styles.creator}>
            کاری از{" "}
            <a
              href="https://www.linkedin.com/in/hossein-karimi-8a452153/"
              target="_blank"
              rel="noreferrer"
            >
              حسین کریمی
            </a>
          </footer>
        </div>
      </section>
    </main>
  );
}
