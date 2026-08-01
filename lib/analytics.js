const TRADING_DAYS = 252;
const EPSILON = 1e-12;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function mean(values) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return 0;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

export function standardDeviation(values) {
  const finite = values.filter(Number.isFinite);
  if (finite.length < 2) return 0;
  const average = mean(finite);
  return Math.sqrt(mean(finite.map((value) => (value - average) ** 2)));
}

export function percentageReturns(values) {
  const finite = values.filter(Number.isFinite);
  return finite.slice(1).map((value, index) => ((value / finite[index]) - 1) * 100);
}

export function simpleMovingAverage(values, window) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return null;
  const slice = finite.slice(-Math.min(window, finite.length));
  return mean(slice);
}

export function exponentialMovingAverageSeries(values, period) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return [];
  const multiplier = 2 / (period + 1);
  const result = [finite[0]];
  for (let index = 1; index < finite.length; index += 1) {
    result.push((finite[index] * multiplier) + (result[index - 1] * (1 - multiplier)));
  }
  return result;
}

export function relativeStrengthIndex(values, period = 14) {
  const finite = values.filter(Number.isFinite);
  if (finite.length < 2) return 50;
  const changes = finite.slice(1).map((value, index) => value - finite[index]);
  const recent = changes.slice(-Math.min(period, changes.length));
  const averageGain = mean(recent.map((value) => Math.max(value, 0)));
  const averageLoss = mean(recent.map((value) => Math.max(-value, 0)));
  if (averageLoss < EPSILON) return averageGain > 0 ? 100 : 50;
  const relativeStrength = averageGain / averageLoss;
  return 100 - (100 / (1 + relativeStrength));
}

export function movingAverageConvergenceDivergence(values) {
  const ema12 = exponentialMovingAverageSeries(values, 12);
  const ema26 = exponentialMovingAverageSeries(values, 26);
  if (!ema12.length || !ema26.length) return { macd: 0, signal: 0, histogram: 0 };
  const macdSeries = ema12.map((value, index) => value - ema26[index]);
  const signalSeries = exponentialMovingAverageSeries(macdSeries, 9);
  const macd = macdSeries.at(-1) ?? 0;
  const signal = signalSeries.at(-1) ?? 0;
  return { macd, signal, histogram: macd - signal };
}

export function pearsonCorrelation(first, second) {
  const pairs = first
    .map((value, index) => [value, second[index]])
    .filter(([left, right]) => Number.isFinite(left) && Number.isFinite(right));
  if (pairs.length < 2) return 0;
  const leftMean = mean(pairs.map(([left]) => left));
  const rightMean = mean(pairs.map(([, right]) => right));
  const numerator = pairs.reduce((sum, [left, right]) => sum + ((left - leftMean) * (right - rightMean)), 0);
  const leftVariance = pairs.reduce((sum, [left]) => sum + ((left - leftMean) ** 2), 0);
  const rightVariance = pairs.reduce((sum, [, right]) => sum + ((right - rightMean) ** 2), 0);
  const denominator = Math.sqrt(leftVariance * rightVariance);
  return denominator < EPSILON ? 0 : numerator / denominator;
}

export function percentile(values, quantile) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const position = clamp(quantile, 0, 1) * (sorted.length - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  const weight = position - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function maximumDrawdown(values) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return { maximum: 0, current: 0 };
  let peak = finite[0];
  let maximum = 0;
  for (const value of finite) {
    peak = Math.max(peak, value);
    const drawdown = ((value / peak) - 1) * 100;
    maximum = Math.min(maximum, drawdown);
  }
  const currentPeak = Math.max(...finite);
  return {
    maximum,
    current: ((finite.at(-1) / currentPeak) - 1) * 100
  };
}

export function currentStreak(returns) {
  const finite = returns.filter(Number.isFinite);
  if (!finite.length || finite.at(-1) === 0) return { direction: "flat", length: 0 };
  const direction = finite.at(-1) > 0 ? "up" : "down";
  let length = 0;
  for (let index = finite.length - 1; index >= 0; index -= 1) {
    if ((direction === "up" && finite[index] > 0) || (direction === "down" && finite[index] < 0)) {
      length += 1;
    } else {
      break;
    }
  }
  return { direction, length };
}

export function aggregateCandles(rows, maxCandles = 90) {
  const valid = rows.filter((row) => [row.open, row.high, row.low, row.close].every(Number.isFinite));
  if (!valid.length) return [];
  const groupSize = Math.max(1, Math.ceil(valid.length / maxCandles));
  const candles = [];
  for (let index = 0; index < valid.length; index += groupSize) {
    const group = valid.slice(index, index + groupSize);
    candles.push({
      date: group.at(-1).date,
      startDate: group[0].date,
      endDate: group.at(-1).date,
      open: group[0].open,
      high: Math.max(...group.map((row) => row.high)),
      low: Math.min(...group.map((row) => row.low)),
      close: group.at(-1).close,
      count: group.length
    });
  }
  return candles;
}

export function decomposeIranDrivers(rows) {
  if (!rows.length) {
    return { total: 0, global: 0, usd: 0, premium: 0, interaction: 0, items: [] };
  }
  const start = rows[0];
  const end = rows.at(-1);
  const global = ((end.global / start.global) - 1) * 100;
  const usd = ((end.usd / start.usd) - 1) * 100;
  const startPremiumFactor = 1 + ((start.premium || 0) / 100);
  const endPremiumFactor = 1 + ((end.premium || 0) / 100);
  const premium = ((endPremiumFactor / startPremiumFactor) - 1) * 100;
  const total = ((end.iran / start.iran) - 1) * 100;
  const interaction = total - global - usd - premium;
  return {
    total,
    global,
    usd,
    premium,
    interaction,
    items: [
      { name: "اونس جهانی", value: global },
      { name: "نرخ دلار", value: usd },
      { name: "صرف داخلی", value: premium },
      { name: "اثر متقابل", value: interaction }
    ]
  };
}

function correlationLabel(value) {
  const absolute = Math.abs(value);
  if (absolute >= 0.7) return "قوی";
  if (absolute >= 0.4) return "متوسط";
  if (absolute >= 0.2) return "ضعیف";
  return "ناچیز";
}

function rsiLabel(value) {
  if (value >= 70) return "شتاب بالا و کشیده";
  if (value >= 55) return "شتاب مثبت";
  if (value <= 30) return "فشار نزولی کشیده";
  if (value <= 45) return "شتاب منفی";
  return "متعادل";
}

function volatilityLabel(value) {
  if (value >= 45) return "بسیار بالا";
  if (value >= 30) return "بالا";
  if (value >= 18) return "متوسط";
  return "پایین";
}

function trendLabel(score) {
  if (score >= 75) return "تمایل صعودی پررنگ";
  if (score >= 55) return "تمایل صعودی ملایم";
  if (score <= 25) return "تمایل نزولی پررنگ";
  if (score <= 45) return "تمایل نزولی ملایم";
  return "وضعیت متعادل";
}

export function buildMarketAnalysis(rows, key) {
  const values = rows.map((row) => row[key]).filter(Number.isFinite);
  const returns = percentageReturns(values);
  const current = values.at(-1) ?? 0;
  const sma20 = simpleMovingAverage(values, 20) ?? current;
  const sma50 = simpleMovingAverage(values, 50) ?? current;
  const rsi = relativeStrengthIndex(values, 14);
  const macd = movingAverageConvergenceDivergence(values);
  const drawdown = maximumDrawdown(values);
  const positiveDays = returns.length ? (returns.filter((value) => value > 0).length / returns.length) * 100 : 0;
  const annualizedVolatility = standardDeviation(returns) * Math.sqrt(TRADING_DAYS);
  const negativeReturns = returns.filter((value) => value < 0);
  const downsideDeviation = standardDeviation(negativeReturns) * Math.sqrt(TRADING_DAYS);
  const recent20 = values.slice(-Math.min(20, values.length));
  const referenceLow = recent20.length ? Math.min(...recent20) : current;
  const referenceHigh = recent20.length ? Math.max(...recent20) : current;
  const range = Math.max(referenceHigh - referenceLow, EPSILON);
  const rangePosition = clamp(((current - referenceLow) / range) * 100, 0, 100);
  const priceDistanceSma20 = sma20 ? ((current / sma20) - 1) * 100 : 0;
  const priceDistanceSma50 = sma50 ? ((current / sma50) - 1) * 100 : 0;
  const globalReturns = percentageReturns(rows.map((row) => row.global));
  const usdReturns = percentageReturns(rows.map((row) => row.usd));
  const correlationGlobal = pearsonCorrelation(returns, globalReturns);
  const correlationUsd = pearsonCorrelation(returns, usdReturns);
  const streak = currentStreak(returns);
  const drivers = decomposeIranDrivers(rows);

  const scoreParts = [
    current >= sma20,
    sma20 >= sma50,
    macd.histogram >= 0,
    rsi >= 50 && rsi <= 75,
    positiveDays >= 50
  ];
  const score = scoreParts.filter(Boolean).length * 20;

  const insights = [];
  if (Math.abs(correlationUsd) > Math.abs(correlationGlobal) + 0.1) {
    insights.push(`در این بازه، هم‌حرکتی روزانه با دلار (${correlationLabel(correlationUsd)}) از اونس بیشتر بوده است.`);
  } else if (Math.abs(correlationGlobal) > Math.abs(correlationUsd) + 0.1) {
    insights.push(`در این بازه، هم‌حرکتی روزانه با اونس (${correlationLabel(correlationGlobal)}) از دلار بیشتر بوده است.`);
  } else {
    insights.push("هم‌حرکتی روزانه با دلار و اونس نزدیک به هم است؛ هیچ محرک واحدی غالب نیست.");
  }
  if (rangePosition >= 85) {
    insights.push("قیمت نزدیک سقف ۲۰ روزه قرار دارد؛ فاصله تا سقف مرجع کوچک است.");
  } else if (rangePosition <= 15) {
    insights.push("قیمت نزدیک کف ۲۰ روزه قرار دارد؛ فشار دوره اخیر هنوز قابل مشاهده است.");
  } else {
    insights.push("قیمت در میانه دامنه ۲۰ روزه است و از نظر موقعیت دامنه حالت افراطی ندارد.");
  }
  if (annualizedVolatility >= 35) {
    insights.push("نوسان سالانه‌شده بالاست؛ سناریوها را با دامنه خطای بزرگ‌تری تفسیر کنید.");
  } else {
    insights.push("نوسان دوره در محدوده پایین تا متوسط است، اما تاریخچه بازسازی‌شده دقت ریسک را محدود می‌کند.");
  }
  if (Math.abs(drivers.interaction) >= 2) {
    insights.push("اثر متقابل اونس، دلار و صرف داخلی معنادار است و جمع ساده محرک‌ها کل بازده را توضیح نمی‌دهد.");
  }

  return {
    score,
    trendLabel: trendLabel(score),
    technical: {
      current,
      sma20,
      sma50,
      priceDistanceSma20,
      priceDistanceSma50,
      referenceLow,
      referenceHigh,
      rangePosition
    },
    momentum: {
      rsi,
      rsiLabel: rsiLabel(rsi),
      macd,
      positiveDays,
      streak,
      bestDay: returns.length ? Math.max(...returns) : 0,
      worstDay: returns.length ? Math.min(...returns) : 0
    },
    risk: {
      annualizedVolatility,
      volatilityLabel: volatilityLabel(annualizedVolatility),
      downsideDeviation,
      maximumDrawdown: drawdown.maximum,
      currentDrawdown: drawdown.current,
      historicalVaR95: percentile(returns, 0.05),
      dailyRange: recent20.length ? ((referenceHigh / referenceLow) - 1) * 100 : 0
    },
    correlations: {
      global: correlationGlobal,
      usd: correlationUsd,
      globalLabel: correlationLabel(correlationGlobal),
      usdLabel: correlationLabel(correlationUsd)
    },
    drivers,
    driverItems: drivers.items,
    insights,
    methodology: {
      score: "هر یک از پنج شرط قیمت بالای SMA20، SMA20 بالای SMA50، MACD مثبت، RSI بین ۵۰ تا ۷۵ و سهم روزهای مثبت حداقل ۵۰٪، بیست امتیاز دارد.",
      risk: "نوسان و افت سرمایه از بازده‌های روزانه همین بازه محاسبه می‌شوند و به دلیل بازسازی تاریخچه، صرفاً توصیفی هستند.",
      drivers: "اثر اونس، دلار و صرف داخلی از تغییر عوامل ابتدا تا انتهای دوره محاسبه می‌شود؛ باقیمانده به‌عنوان اثر متقابل گزارش می‌شود."
    }
  };
}
