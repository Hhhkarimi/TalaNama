const DIGITS = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9"
};

export const TGJU_SOURCES = Object.freeze({
  global: Object.freeze({
    id: "global",
    label: "اونس جهانی",
    url: "https://www.tgju.org/profile/ons",
    divisor: 1,
    min: 300,
    max: 15000
  }),
  iran: Object.freeze({
    id: "iran",
    label: "طلای ۱۸ عیار",
    url: "https://www.tgju.org/profile/geram18",
    divisor: 10,
    min: 500000,
    max: 100000000
  }),
  usd: Object.freeze({
    id: "usd",
    label: "دلار آزاد",
    url: "https://www.tgju.org/profile/price_dollar_rl",
    divisor: 10,
    min: 10000,
    max: 2000000
  })
});

export const FALLBACK_MARKET_SNAPSHOT = Object.freeze({
  updatedAt: "2026-07-16T00:00:00.000Z",
  data: Object.freeze({
    global: 4029.42,
    iran: 18360300,
    usd: 188200,
    premium: 0.40737535363639665
  })
});

export function normalizeDigits(value) {
  return String(value).replace(/[۰-۹٠-٩]/g, (digit) => DIGITS[digit]);
}

export function parseLocalizedNumber(value) {
  const normalized = normalizeDigits(value)
    .replace(/[٬,\s]/g, "")
    .replace(/٫/g, ".");
  const number = Number(normalized);
  if (!Number.isFinite(number)) throw new Error("عدد قیمت قابل تشخیص نیست.");
  return number;
}

function decodeNumericEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&(nbsp|zwnj);/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&colon;/gi, ":");
}

export function htmlToText(html) {
  return decodeNumericEntities(String(html))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseCurrentRate(html) {
  const text = htmlToText(html);
  const match = text.match(/نرخ\s*فعلی\s*:{0,2}\s*([0-9۰-۹٠-٩][0-9۰-۹٠-٩,٬٫.]*)/u);
  if (!match) throw new Error("نرخ فعلی در صفحه TGJU پیدا نشد.");
  return parseLocalizedNumber(match[1]);
}

function isSanePrice(source, value) {
  return Number.isFinite(value) && value >= source.min && value <= source.max;
}

async function fetchSource(source) {
  const response = await fetch(source.url, {
    cache: "no-store",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "fa-IR,fa;q=0.9",
      "user-agent": "Mozilla/5.0 (compatible; Talanama/1.1; hourly-market-reader)"
    },
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) throw new Error(`TGJU ${source.id}: HTTP ${response.status}`);
  const rawValue = parseCurrentRate(await response.text());
  const value = rawValue / source.divisor;
  if (!isSanePrice(source, value)) throw new Error(`TGJU ${source.id}: unexpected value`);
  return value;
}

export async function fetchTgjuSnapshot() {
  const sources = Object.values(TGJU_SOURCES);
  const results = await Promise.allSettled(sources.map((source) => fetchSource(source)));
  const data = { ...FALLBACK_MARKET_SNAPSHOT.data };
  const sourceState = {};
  let liveCount = 0;

  results.forEach((result, index) => {
    const source = sources[index];
    const available = result.status === "fulfilled";
    sourceState[source.id] = { url: source.url, available };
    if (available) {
      data[source.id] = result.value;
      liveCount += 1;
    }
  });

  if (liveCount === 0) throw new Error("هیچ‌یک از صفحات TGJU در دسترس نبود.");

  const theoretical = (data.global * data.usd * 0.75) / 31.1035;
  data.premium = ((data.iran / theoretical) - 1) * 100;

  return {
    status: liveCount === sources.length ? "live" : "partial",
    updatedAt: new Date().toISOString(),
    cacheSeconds: 3600,
    data,
    sources: sourceState
  };
}
