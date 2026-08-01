# TalaNama Data-Integrity and Analytics Upgrade Specification

Status: approved direction  
Selected UX: Variant A — Expanded Existing Dashboard  
Version: 1.0.0  
Date: 2026-08-01

## Problem statement

TalaNama must be upgraded incrementally into a transparent, data-rich gold-market dashboard without replacing its existing product identity. The current history is reconstructed and several analytical outputs are calculated from reconstructed values. Production must distinguish observed, derived, reconstructed, estimated, fallback, stale, unavailable, and demo data and gate analyses by input quality.

## Existing behavior to preserve

Preserve `/`, `/api/market`, the dashboard shell, sidebar, top bar, four primary cards, primary chart, chart modes, period controls, scenario builder, return calculator, CSV export, source section, dark mode, Persian RTL behavior, responsive layouts, Vazirmatn typography, Vercel deployment, Vinext/ChatGPT Sites build path, and existing valid tests.

**No major UI redesign is permitted.**

## Selected solution

Variant A extends the existing dashboard in place:

- the first row remains four primary cards
- secondary markets use a compact secondary strip
- provenance and quality badges appear where values are shown
- reconstructed-history warnings appear inside chart context
- unsuitable indicators are disabled with explanations
- accessible chart summaries and equivalent tables are added
- source health uses a compact existing-card treatment
- scenario and return tools stay in familiar positions

## Audiences

- ordinary Persian-speaking users
- users comparing domestic and international drivers
- analysts requiring traceable formulas and exports
- maintainers requiring stable source and calculation test seams

## User stories

1. A user can identify the provenance and quality of every value.
2. A user can inspect source, capture time, market time, timezone, unit, transformation, freshness, coverage, gaps, and restrictions.
3. A user is warned whenever history is reconstructed.
4. A user cannot enable an analysis whose input data is unsuitable.
5. A user can compare approved assets on aligned base-100 series.
6. A user can inspect the exact definition of gold and coin premiums.
7. A user sees source outages, staleness, and fallback behavior.
8. A user can export provenance-rich, formula-safe data.
9. A keyboard or screen-reader user can access all critical chart information.
10. A user can use deterministic scenarios without forecast claims.
11. A maintainer can test adapters, provenance, formulas, units, time alignment, and exports independently of React.

## Provenance model

Provenance types:

- `observed`
- `derived`
- `reconstructed`
- `estimated`
- `fallback`
- `demo`

Quality states:

- `fresh`
- `delayed`
- `stale`
- `partial`
- `unavailable`

Required observation fields:

```text
id
marketId
sourceId
sourceName
sourceUrl
sourceType
capturedAt
marketTime
timezone
originalValue
originalUnit
normalizedValue
normalizedUnit
transformationId
provenanceType
qualityState
freshnessSeconds
coverageStart
coverageEnd
knownGaps
usageRestrictions
parentObservationIds
formulaId
formulaVersion
```

No synthetic value may be marked `observed`.

## Source requirements

Before implementation, every source must document data, depth, frequency, timestamp semantics, timezone, units, access method, keys, free-tier limits, cache rules, redistribution rights, attribution, automated-access restrictions, reliability, failures, parser fragility, fallback, Vercel Hobby compatibility, Sites compatibility, and sustainability.

TGJU remains transitional until automated access, caching, and redistribution terms are confirmed. LBMA/IBA benchmark history is excluded from the free core without a compatible licence.

## Source health

Show source name, last success, expected frequency, status, freshness age, response type, coverage, latest error category, and fallback state.

Hourly cached data must use labels such as:

- به‌روزرسانی ساعتی
- آخرین دریافت موفق
- داده با تأخیر احتمالی
- داده پشتیبان
- تاریخچه بازسازی‌شده

## Unit registry

Version:

- troy ounce
- gram
- kilogram
- rial
- toman
- karat
- purity
- coin weight
- fine-gold weight
- ounce-to-gram conversion
- currency conversion

Rial and toman must never be mixed silently.

## Formula registry

Version:

- ounce-to-gram conversion
- purity conversion
- theoretical gold value
- coin intrinsic value
- domestic and coin premium
- return and annualized return
- realized volatility
- maximum drawdown
- correlation
- moving averages
- Bollinger Bands
- optional RSI and MACD
- scenario decomposition
- transaction costs
- optional inflation adjustment

Each formula records inputs, outputs, source, assumptions, rounding, limitations, accepted provenance, minimum coverage, and tests.

## Historical data

Preferred: replace reconstructed history with legally reusable observations.

Transitional requirements:

- label chart, tooltip, table, and export
- identify observed anchors
- explain reconstruction method
- expose coverage limitations
- exclude unsuitable analytics

Disable for predominantly reconstructed history:

- realized daily volatility
- observed daily high/low claims
- maximum drawdown
- rolling correlation
- RSI
- MACD
- ATR
- Bollinger Bands
- daily-return distributions
- value-at-risk

## Market coverage

Keep global ounce, Iranian 18-karat gold, free-market USD, and a precisely defined theoretical domestic premium.

Only after source approval evaluate 24-karat gold, mithqal, melted gold, coins, intrinsic values, coin premiums, official/reference FX, EUR, AED, and approved inflation context.

## Analytics

When adequate observed history exists, support daily/weekly/monthly/QTD/YTD/period returns, valid annualization, high, low, average, median, positive/negative-day ratios, best/worst observed day, maximum drawdown, recovery, rolling volatility, base-100 comparisons, relative returns, rolling correlation, divergence, premium analysis, and approved technical indicators.

Correlation must not imply causation.

Driver decomposition must expose global-ounce, exchange-rate, interaction, and estimated residual components. The residual is not an observed cause.

## Scenario builder

Preserve the tool and add current inputs, optional transaction assumptions, theoretical and market values, total change, contribution by input, formula version, assumptions, sensitivity table, and uncertainty disclaimer.

The output is a deterministic hypothetical scenario, not a forecast.

## Return calculator

Preserve the tool and add explicit dates, selected asset, transaction cost, buy/sell spread, nominal return, profit/loss, valid annualization, comparison asset, and optional approved inflation adjustment.

Historical return must not imply future performance.

## Alerts

The current non-functional control must be labeled planned/unavailable until a documented browser-local implementation exists. No background alert claim or paid notification provider is permitted.

## Export

Keep CSV and evaluate JSON. Include generation time, market, period, unit, source, source timestamp, provenance, quality, reconstruction flag, formula version, and disclaimer. Escape cells beginning with `=`, `+`, `-`, or `@`.

## Accessibility

Require keyboard operation, visible focus, semantic headings, accessible tabs/dialogs, screen-reader update status, reduced motion, sufficient contrast, RTL reading order, touch targets, accessible tooltips, chart explanations, period summaries, units, quality, and equivalent tables/downloads. Color cannot be the only cue.

## Responsive and visual preservation

Retain the sidebar, top bar, current tokens, four primary cards, primary chart position, responsive behavior, and familiar control order. Collapse secondary information before primary information.

## Typography

Vazirmatn is the only font:

```js
import "@fontsource-variable/vazirmatn";
```

```css
font-family: "Vazirmatn Variable", Vazirmatn;
```

Do not add Tahoma, Arial, generic sans-serif, a display font, or a remote font.

## Security

Cover SSRF, redirects to private networks, DNS rebinding, oversized/decompressed/slow responses, parser denial of service, cache poisoning, malicious upstream content, XSS, unsafe links, leaked secrets, request amplification, refresh abuse, CSV injection, misleading stale/fallback data, dependency compromise, notification abuse, and local-storage poisoning.

Use HTTPS host allowlists, redirect validation, timeouts, response-size limits, content-type checks, defensive parsing, rate limiting, server-only secrets, CSP/security headers, and safe links. Do not create a generic proxy.

## Privacy and free product

No mandatory account, user-supplied API key, paid API, paid database, paid cron, paid analytics, paid authentication, paid notification provider, subscription, or payment information is permitted for the core.

## Caching and fallback

Use source-specific cache policies. Keep current and historical policies separate. Show freshness despite stale-while-revalidate. Retain per-field provenance in partial results. Prefer last successful approved observation. Date static fallback data visibly. Fallback never becomes observed.

## Performance

No new component library. Lazy-load secondary analysis. Target less than 60 KB gzip additional initial JavaScript. Memoize aligned series and analytics. Avoid duplicate formatting. Make downsampling transparent. Correctness has priority.

## SEO/GEO

Add accurate Persian crawlable explanations, canonical and Open Graph metadata, sitemap, robots, methodology, limitations, WebApplication structured data, and creator metadata. Dataset structured data requires adequate licence and coverage.

## Creator

Keep:

```text
کاری از حسین کریمی
```

linked to:

```text
https://www.linkedin.com/in/hossein-karimi-8a452153/
```

## Architecture

Preferred seams:

```text
lib/domain/provenance
lib/domain/units
lib/domain/formulas
lib/domain/analytics
lib/domain/time
lib/sources/adapters
lib/sources/health
lib/export
```

React components consume normalized DTOs and do not duplicate formulas.

## Tests

Test source parsing/failures, Persian digits, units, timeouts, response limits, redirects, partial/total failure, stale cache, attribution, provenance propagation, formula registry, conversions, theoretical value, premium, return, annualization, drawdown, correlation, indicator eligibility, Tehran timezone, alignment, existing UI regression, dark mode, responsiveness, keyboard/focus, chart summaries, safe exports, host allowlists, and safe redirects.

Required release checks:

```bash
npm ci
npm run test:data-parser
npm run lint
npm run build
npm run build:sites
npm audit
```

Disclose every check that cannot be completed.

## Migration

1. Integrity foundation: provenance, quality, registries, labels, eligibility, source health, honest alerts, safe exports.
2. Observed acquisition: approve sources, ingest observations, preserve source records, expose gaps.
3. Market expansion: approved secondary markets, premium analysis, comparisons, enhanced tools.
4. Advanced analytics: only after adequate observed history.

## Out of scope

Major redesign, paid mandatory infrastructure, portfolio accounts, guaranteed predictions, buy/sell signals, automated trading, copyrighted news ingestion, unlicensed benchmark redistribution, generic proxy, and AI market advice.

## Acceptance criteria

1. Existing users recognize the product.
2. `/` and existing tools remain functional.
3. Every value has provenance and quality.
4. Reconstruction is visible in chart, tooltip, table, and export.
5. No synthetic value is observed.
6. Unsuitable analyses are disabled.
7. Units and formulas have one versioned source.
8. Source failures and stale states are visible.
9. Export is safe and provenance-rich.
10. Critical information is keyboard and screen-reader accessible.
11. Vazirmatn is the only font.
12. Core use remains free.
13. Security controls cover fetching and export.
14. tests and supported builds pass.
15. incomplete checks are disclosed.
