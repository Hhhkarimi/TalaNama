const DAY = 24 * 60 * 60 * 1000;

// نقاط تاریخی از صفحات عمومی وب‌سایت ایرانی TGJU گرفته شده‌اند.
// آخرین قیمت ساعتی در زمان اجرا روی این سری مرجع قرار می‌گیرد.

const anchors = {
  global: [
    ["2025-07-16", 3346.58],
    ["2025-09-15", 3662],
    ["2025-11-15", 4218],
    ["2026-01-19", 4671.02],
    ["2026-01-28", 5400.25],
    ["2026-03-01", 5108],
    ["2026-04-17", 4846.66],
    ["2026-06-17", 4261.55],
    ["2026-07-16", 4029.42]
  ],
  iran: [
    ["2025-07-16", 7081800],
    ["2025-09-15", 8690000],
    ["2025-11-15", 11350000],
    ["2026-01-17", 15858100],
    ["2026-01-29", 20614100],
    ["2026-03-01", 19080000],
    ["2026-04-18", 17164500],
    ["2026-06-17", 16181900],
    ["2026-07-16", 18360300]
  ],
  usd: [
    ["2025-07-16", 88300],
    ["2025-09-15", 99200],
    ["2025-11-15", 116500],
    ["2026-01-19", 138700],
    ["2026-01-29", 158400],
    ["2026-03-01", 151600],
    ["2026-04-18", 146900],
    ["2026-06-17", 159500],
    ["2026-07-16", 188200]
  ]
};

function interpolate(list, time) {
  for (let i = 0; i < list.length - 1; i += 1) {
    const t0 = new Date(list[i][0]).getTime();
    const t1 = new Date(list[i + 1][0]).getTime();
    if (time >= t0 && time <= t1) {
      const p = (time - t0) / (t1 - t0);
      const eased = p * p * (3 - 2 * p);
      return list[i][1] + (list[i + 1][1] - list[i][1]) * eased;
    }
  }
  return list[list.length - 1][1];
}

function noise(index, scale) {
  const wave = Math.sin(index * 0.49) * 0.48 + Math.sin(index * 0.113 + 1.6) * 0.34 + Math.sin(index * 1.27) * 0.18;
  return wave * scale;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rollingAverage(rows, key, window, index) {
  if (index < window - 1) return null;
  return average(rows.slice(index - window + 1, index + 1).map((row) => row[key]));
}

function rollingStd(rows, key, window, index) {
  if (index < window - 1) return null;
  const values = rows.slice(index - window + 1, index + 1).map((row) => row[key]);
  const mean = average(values);
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
}

export function generateMarketData() {
  const start = new Date("2025-07-16T00:00:00Z").getTime();
  const end = new Date("2026-07-16T00:00:00Z").getTime();
  const rows = [];

  for (let time = start, i = 0; time <= end; time += DAY, i += 1) {
    const globalBase = interpolate(anchors.global, time);
    const iranBase = interpolate(anchors.iran, time);
    const usdBase = interpolate(anchors.usd, time);
    const isLast = time === end;
    const global = isLast ? 4029.42 : globalBase * (1 + noise(i, 0.009));
    const iran = isLast ? 18360300 : iranBase * (1 + noise(i + 11, 0.012));
    const usd = isLast ? 188200 : usdBase * (1 + noise(i + 29, 0.0045));
    const theoretical = (global * usd * 0.75) / 31.1035;
    const premium = ((iran / theoretical) - 1) * 100;
    const dailyWave = Math.abs(noise(i + 7, 0.014)) + 0.006;

    rows.push({
      date: new Date(time).toISOString().slice(0, 10),
      timestamp: time,
      global,
      iran,
      usd,
      premium,
      globalOpen: global * (1 - noise(i + 3, 0.004)),
      globalHigh: global * (1 + dailyWave),
      globalLow: global * (1 - dailyWave * 0.88),
      iranOpen: iran * (1 - noise(i + 5, 0.005)),
      iranHigh: iran * (1 + dailyWave * 0.76),
      iranLow: iran * (1 - dailyWave * 0.62)
    });
  }

  return addIndicators(rows);
}

function addIndicators(rows) {
  return rows.map((row, index) => {
    const globalSma20 = rollingAverage(rows, "global", 20, index);
    const globalSma50 = rollingAverage(rows, "global", 50, index);
    const iranSma20 = rollingAverage(rows, "iran", 20, index);
    const iranSma50 = rollingAverage(rows, "iran", 50, index);
    const usdSma20 = rollingAverage(rows, "usd", 20, index);
    const usdSma50 = rollingAverage(rows, "usd", 50, index);
    const globalStd = rollingStd(rows, "global", 20, index);
    const iranStd = rollingStd(rows, "iran", 20, index);
    const usdStd = rollingStd(rows, "usd", 20, index);
    return {
      ...row,
      globalSma20,
      globalSma50,
      iranSma20,
      iranSma50,
      usdSma20,
      usdSma50,
      globalUpper: globalSma20 && globalStd ? globalSma20 + 2 * globalStd : null,
      globalLower: globalSma20 && globalStd ? globalSma20 - 2 * globalStd : null,
      iranUpper: iranSma20 && iranStd ? iranSma20 + 2 * iranStd : null,
      iranLower: iranSma20 && iranStd ? iranSma20 - 2 * iranStd : null,
      usdUpper: usdSma20 && usdStd ? usdSma20 + 2 * usdStd : null,
      usdLower: usdSma20 && usdStd ? usdSma20 - 2 * usdStd : null
    };
  });
}

function tehranDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function applyMarketSnapshot(data, snapshot) {
  const values = snapshot?.data;
  const required = [values?.global, values?.iran, values?.usd];
  if (!Array.isArray(data) || data.length === 0 || !required.every(Number.isFinite)) return data;

  const targetDate = tehranDate(snapshot.updatedAt) || data.at(-1).date;
  const existingIndex = data.findIndex((row) => row.date === targetDate);
  const preserved = existingIndex >= 0
    ? data.slice(0, existingIndex)
    : data.filter((row) => row.date < targetDate);
  const existing = existingIndex >= 0 ? data[existingIndex] : data.at(-1);
  const previous = preserved.at(-1) || existing;
  const timestamp = new Date(snapshot.updatedAt).getTime();
  const theoretical = (values.global * values.usd * 0.75) / 31.1035;
  const premium = Number.isFinite(values.premium)
    ? values.premium
    : ((values.iran / theoretical) - 1) * 100;
  const globalOpen = existingIndex >= 0 ? existing.globalOpen : previous.global;
  const iranOpen = existingIndex >= 0 ? existing.iranOpen : previous.iran;

  const liveRow = {
    ...existing,
    date: targetDate,
    timestamp: Number.isFinite(timestamp) ? timestamp : existing.timestamp,
    global: values.global,
    iran: values.iran,
    usd: values.usd,
    premium,
    globalOpen,
    globalHigh: Math.max(globalOpen, values.global, existingIndex >= 0 ? existing.globalHigh : values.global),
    globalLow: Math.min(globalOpen, values.global, existingIndex >= 0 ? existing.globalLow : values.global),
    iranOpen,
    iranHigh: Math.max(iranOpen, values.iran, existingIndex >= 0 ? existing.iranHigh : values.iran),
    iranLow: Math.min(iranOpen, values.iran, existingIndex >= 0 ? existing.iranLow : values.iran)
  };

  return addIndicators([...preserved, liveRow]);
}

export const MARKET_META = {
  global: { label: "اونس جهانی", short: "XAU / USD", unit: "دلار", decimals: 2 },
  iran: { label: "طلای ۱۸ عیار", short: "گرم / تومان", unit: "تومان", decimals: 0 },
  usd: { label: "دلار آزاد", short: "USD / IRT", unit: "تومان", decimals: 0 },
  compare: { label: "مقایسه بازده", short: "پایه ۱۰۰", unit: "شاخص", decimals: 1 }
};

export function formatFa(value, decimals = 0) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(value);
}

export function formatDate(date, mode = "short") {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    month: mode === "short" ? "short" : "long",
    day: "numeric",
    ...(mode === "long" ? { year: "numeric" } : {})
  }).format(new Date(`${date}T00:00:00`));
}

export function calculateStats(data, key) {
  const values = data.map((item) => item[key]).filter(Number.isFinite);
  const start = values[0];
  const end = values[values.length - 1];
  const returns = values.slice(1).map((value, index) => ((value / values[index]) - 1) * 100);
  const mean = returns.length ? average(returns) : 0;
  const variance = returns.length ? average(returns.map((value) => (value - mean) ** 2)) : 0;
  const volatility = Math.sqrt(variance) * Math.sqrt(252);
  return {
    current: end,
    change: ((end / start) - 1) * 100,
    high: Math.max(...values),
    low: Math.min(...values),
    average: average(values),
    volatility
  };
}
