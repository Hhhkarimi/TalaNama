# TalaNama — Initial Repository Investigation and Data Audit

> Status: review draft  
> Date: 2026-08-01  
> Repository: `Hhhkarimi/TalaNama`  
> Scope: investigation only; no production code, branch, commit, deployment, or configuration was changed.

## 1. Executive finding

The current user interface is compact, recognizable, Persian RTL-first, responsive, and suitable for incremental extension. The primary integrity problem is not the interface: it is the analytical use of a reconstructed daily history.

`lib/goldData.js` creates daily values between a small number of hard-coded anchors using interpolation plus deterministic synthetic noise. It also generates synthetic open, high, and low values. SMA 20, SMA 50, Bollinger Bands, daily returns, highs, lows, averages, annualized volatility, comparison indices, driver decomposition, a trend score, and the return calculator are then calculated on this reconstructed series.

Therefore, the current dashboard visually presents several reconstructed or synthetic outputs in the same manner as observed market data. Until real observations are available, those outputs must be explicitly labeled and analyses requiring observed daily data must be disabled or limited.

## 2. Repository baseline

### Framework and dependencies

| Item | Current value |
|---|---|
| Application framework | Next.js `16.2.10` |
| UI runtime | React / React DOM `19.2.7` |
| Charts | Recharts `3.9.2` |
| Icons | Lucide React `1.24.0` |
| Font | Vazirmatn variable `5.2.8` |
| Node requirement | `>=22` |
| Package manager | npm, with `package-lock.json` |
| Alternate Sites build | Vinext `1.0.0-beta.1`, Vite `8.1.4` |
| Primary route | `/` |
| Market API route | `/api/market` |
| Server runtime | Node.js route handler |
| Current automated test | one parser script with six assertions |

### Repository governance and quality files

The repository currently contains one commit and no open issues. The following requested governance artifacts are absent:

- `AGENTS.md`
- `CLAUDE.md`
- `CONTEXT.md`
- ADR directory or ADR files
- Matt Pocock skill setup output such as `docs/agents/issue-tracker.md`
- GitHub Actions workflow
- Dependabot configuration
- CodeQL workflow
- accessibility test setup
- browser/end-to-end test setup

The README states that `.github/workflows/ci.yml` runs lint and build, but that file is not present.

### Component boundaries

`app/page.jsx` is a single, large client component. It owns:

- source refresh state
- market and period selection
- chart mode and indicator state
- all derived market calculations
- trend score
- driver decomposition
- scenario calculations
- return calculations
- CSV generation
- theme state
- sidebar state
- source-status messaging

This boundary is functional but couples data generation, financial formulas, source status, and presentation. The safest future architecture is to extract deep, testable domain modules while preserving the existing UI components and route structure.

## 3. Current user journey

1. User opens `/`.
2. Four summary cards show global ounce, Iranian 18-karat gold, free-market USD, and a domestic premium.
3. User selects a market and one of four trailing periods.
4. User switches among area, line, daily-return, and comparison modes.
5. User toggles SMA 20, SMA 50, and Bollinger Bands.
6. User reads technical, driver, and risk tabs.
7. User adjusts the scenario builder.
8. User enters capital and selects a trailing period in the return calculator.
9. User inspects three TGJU links and a short methodology note.
10. User exports the visible period as CSV.

This journey should remain recognizable.

## 4. Data flow

### Current price path

1. `/api/market` calls `fetchTgjuSnapshot()`.
2. Three fixed TGJU pages are fetched server-side.
3. HTML is converted to text and the text adjacent to `نرخ فعلی` is parsed.
4. Iranian gold and USD values are divided by 10 to convert rial to toman.
5. Successful results are cached for one hour.
6. If one source fails, its hard-coded fallback value is used and status becomes `partial`.
7. If all fail, the route returns a complete hard-coded fallback snapshot.
8. The browser requests the route on load and every hour.
9. A successful current snapshot replaces or appends the last daily row of the reconstructed series.

### Historical path

1. Nine hard-coded anchors exist for each of global gold, Iranian 18-karat gold, and USD.
2. Values are interpolated using smoothstep easing.
3. Deterministic sine-wave noise is added.
4. Synthetic open, high, and low values are generated.
5. Technical indicators are calculated over the result.

## 5. Field-by-field audit

| User-facing field | Internal value | Present source/provenance | Unit/transformation | Audit result |
|---|---|---|---|---|
| اونس جهانی طلا | `global` | Current TGJU parse; historical reconstructed anchors | USD per troy ounce | Current value can be treated as source-observed only with captured time and unknown market time. History is reconstructed. |
| طلای ۱۸ عیار | `iran` | Current TGJU parse; historical reconstructed anchors | TGJU rial divided by 10, displayed toman per gram | Current value needs explicit original value/unit. History is reconstructed. |
| دلار بازار آزاد | `usd` | Current TGJU parse; historical reconstructed anchors | TGJU rial divided by 10, displayed toman per USD | Current value needs explicit timestamp semantics. History is reconstructed. |
| حباب قیمت داخلی | `premium` | Derived | `(iran / theoretical - 1) * 100` | Rename to a precisely defined theoretical premium/residual; it is not directly observed “intrinsic value.” |
| تغییر روزانه | `globalDaily`, `iranDaily`, `usdDaily` | Derived from current row and previous generated row | percent | Not a reliable observed daily change when the prior row is reconstructed. |
| بازده دوره | `stats.change` | Derived on reconstructed series | percent | Must be labeled reconstructed or disabled for historical-performance claims. |
| بیشترین/کمترین قیمت | `stats.high`, `stats.low` | Derived on reconstructed closing values | market unit | Not observed market highs/lows. Current UI wording is misleading. |
| میانگین دوره | `stats.average` | Derived on reconstructed values | market unit | May be shown only with reconstruction labeling. |
| نوسان سالانه | `stats.volatility` | Derived from reconstructed daily returns, annualized by `sqrt(252)` | percent | Methodologically inappropriate as an observed risk measure; disable until adequate observed history exists. |
| SMA 20 / SMA 50 | generated fields | Derived on reconstructed values | market unit | Disable or clearly mark demonstration-only until observed history exists. |
| Bollinger Bands | generated fields | Derived on reconstructed values | market unit | Disable or clearly mark demonstration-only until observed history exists. |
| بازده روزانه chart | `dailyReturn` | Derived on reconstructed values | percent | Should not be offered as historical observed returns. |
| مقایسه پایه ۱۰۰ | index fields | Derived on reconstructed series | index | Can remain only as reconstructed comparison with prominent labels. |
| تفکیک محرک‌ها | `iranReturn - globalReturn - usdReturn` | Derived approximation | percentage points | Naive additive residual ignores interaction effects and should not be described as an observed cause. |
| قدرت روند | `trendScore` | Unversioned heuristic | score 18–88 | Arbitrary and not traceable to a documented financial methodology. Remove or relabel as a descriptive internal score with formula/limitations. |
| سناریوساز | `projectedIran` | Deterministic derived formula | toman per gram | Useful, but must expose formula version, inputs, assumptions, current premium treatment, and “hypothetical scenario” wording. |
| محاسبه‌گر بازده | `investReturn`, `investResult` | Derived on reconstructed series | percent/toman | Historical result is not reliable until observed dates and values are used. |
| CSV | browser-generated | Exports mixed reconstructed/current rows | CSV | Lacks provenance, timestamps, quality states, formula versions, disclaimer, safe cell escaping, and explicit reconstruction labels. |

## 6. Provenance gaps

The API and UI currently do not provide the required provenance fields:

- source name and type per point
- captured time versus market time
- source timezone
- original value and original unit
- normalized value and normalized unit
- transformation identifier
- freshness age
- quality state
- coverage start/end
- known gaps
- usage restrictions
- parent provenance for derived values
- formula version

Recommended minimum domain states:

`observed`, `derived`, `reconstructed`, `estimated`, `fallback`, `stale`, `unavailable`, `demo`.

A value may need both a provenance type and an operational quality state. For example, a value can be `observed` and simultaneously `stale`. Avoid encoding all meanings into one enum.

## 7. Formula and unit findings

### Constants duplicated or unregistered

- `31.1035` troy-ounce-to-gram conversion
- `0.75` 18-karat purity factor
- rial-to-toman divisor `10`
- annualization factor `252`
- trend-score coefficients and clamps

These must move into a versioned unit/formula registry.

### Theoretical 18-karat formula

Current formula:

```text
(global_usd_per_troy_ounce × usd_toman_per_usd × 0.75) ÷ 31.1035
```

The dimensional result is toman per gram of 18-karat fine-equivalent gold. It does not include retail spread, making charge, tax, dealer fees, or local market microstructure.

### Driver decomposition

Current formula:

```text
iran_return - global_return - usd_return
```

This is not an exact decomposition because gold and USD effects are multiplicative. A safer exact/log-return approach must document the interaction term and call the residual an unexplained or estimated domestic component.

## 8. Source-health findings

Current states are `live`, `partial`, `fallback`, and client-side `error`. Problems:

- `updatedAt` is the server fetch time, not the source market timestamp.
- Source details contain only URL and availability.
- Per-source failure category is discarded.
- There is no persisted last-successful snapshot; partial results use the static fallback for failed fields.
- A fallback dated 2026-07-16 can be displayed indefinitely without a computed freshness age.
- “Live” describes a successful HTML fetch, not real-time market data.
- Hourly cache plus stale-while-revalidate means values can be older than one hour under failures.
- No content-type or response-size checks are implemented.
- Redirect targets are not explicitly revalidated against the fixed host allowlist.

Recommended UI language:

- `به‌روزرسانی ساعتی`
- `آخرین دریافت موفق`
- `داده با تأخیر احتمالی`
- `داده پشتیبان`
- `تاریخچه بازسازی‌شده`
- `منبع موقتاً در دسترس نیست`

## 9. Security findings

### Existing strengths

- Source URLs are hard-coded rather than user-controlled.
- Fetches are server-side.
- A 12-second timeout exists.
- Parsed numbers have sanity ranges.
- No application secrets are currently required.
- `poweredByHeader` is disabled.

### Gaps

- No explicit allowlist enforcement after redirects.
- No private-network/DNS-rebinding validation.
- No response-size limit or streaming abort.
- No response content-type validation.
- No rate limit or refresh abuse protection.
- Errors are swallowed, eliminating diagnostic categories.
- No CSP or other explicit security headers.
- No CSV formula-injection protection.
- No CodeQL workflow.
- No visible verification of dependency alerts.
- No local-storage schema or validation exists because preferences/alerts are not yet implemented.

The current route is not a generic proxy, so SSRF exposure is narrower than a user-supplied URL design. It still needs defensive redirect and response handling.

## 10. Accessibility findings

### Existing strengths

- Persian language and RTL document direction.
- Semantic main sections and labels in many controls.
- mobile sidebar close/open labels.
- `aria-live` on update text.
- Responsive layout at several breakpoints.
- Text plus arrows accompany positive/negative changes in many locations.

### Gaps

- Charts expose only `role="img"` and a short label; no text summary or equivalent table.
- Tabs do not use tab semantics (`role=tablist`, `aria-selected`, keyboard arrow behavior).
- No visible `:focus-visible` system was found.
- Indicator checkboxes are visually hidden and set to `pointer-events: none`; keyboard operation must be verified and likely improved.
- No reduced-motion media query.
- Several chart meanings rely substantially on color.
- Source freshness is hidden on smaller mobile layouts because the update pill is removed.
- No accessible dialog/drawer primitives exist yet.

## 11. SEO/GEO findings

Current metadata includes only title and description. Missing:

- canonical URL
- Open Graph metadata and social preview
- creator metadata
- robots and sitemap
- visible methodology pages
- visible formula definitions
- structured data
- crawlable answers to product/source/limitation questions
- accurate creator attribution
- source-code link in public content

`Vazirmatn` is correctly reused and should remain the only font.

## 12. Non-functional alert control

The sidebar alert switch has no state, handler, permission flow, persistence, threshold configuration, notification test, pause, or delete behavior. It appears interactive but is not functional. It must either be honestly labeled unavailable/planned or implemented as a documented browser-only local alert.

## 13. UI preservation baseline

Preserve without major redesign:

- 248px desktop sidebar and mobile drawer behavior
- sticky top bar
- four-card overview visual style
- chart panel hierarchy
- market/period/chart selectors
- analysis tabs
- scenario section
- calculator section
- source footer
- dark-mode tokens
- existing gold/teal/violet/blue/red palette
- responsive breakpoints
- Vazirmatn typography
- `/` and `/api/market`

New functionality should be layered through badges, secondary tabs, expandable sections, and optional drawers.

## 14. Priority blockers before implementation

### P0 — integrity

1. Introduce a shared provenance model.
2. Mark all historical generated rows as `reconstructed`.
3. Stop presenting synthetic high/low/open values as observed.
4. Disable observed-data-only analytics on reconstructed inputs.
5. Correct “live,” “daily,” “intrinsic,” “signal,” and “cause” claims.
6. Make fallback age and mixed-source state visible.
7. Add formula/unit registries and tests.

### P1 — engineering foundation

1. Configure repository agent/skill docs.
2. Add issue tracker conventions.
3. Add CI for parser tests, unit tests, lint, and build.
4. Extract source adapters, provenance, formulas, units, and analytics from `app/page.jsx`.
5. Add safe export utilities.
6. Add threat model and source policy.
7. Add accessible chart summaries/tables.

### P2 — product expansion

Only after source approval and observed coverage:

- 24-karat gold, mithqal, melted gold
- coins and premium analysis
- normalized comparisons
- drawdown and rolling metrics
- enhanced scenario and return calculator
- browser-local alerts
- macro context

## 15. Verification status

### Completed from repository inspection

- repository file inventory
- framework/dependency inventory
- route and component inspection
- TGJU parser and fallback inspection
- reconstructed-data inspection
- formula and unit inspection
- UI journey inspection
- responsive CSS inspection
- accessibility static review
- metadata/SEO static review
- issue tracker check

### Not completed

The following were not executable in the current environment because the repository was available through the GitHub connector but could not be cloned into the local sandbox, and no GitHub write/CI run was authorized:

```bash
npm ci
npm run test:data-parser
npm run lint
npm run build
npm run build:sites
npm audit
```

Also not completed:

- live production DOM and behavior comparison
- production response/security-header inspection
- live `/api/market` response verification
- browser accessibility testing
- Lighthouse/performance measurements
- bundle-size analysis
- Vercel deployment verification
- ChatGPT Sites deployment verification

The production URL could not be independently fetched by the available browser/network tools, so source-defined behavior was audited but live-production parity was not claimed.

## 16. Repository references

- `package.json`: https://github.com/Hhhkarimi/TalaNama/blob/main/package.json
- `app/page.jsx`: https://github.com/Hhhkarimi/TalaNama/blob/main/app/page.jsx
- `app/api/market/route.js`: https://github.com/Hhhkarimi/TalaNama/blob/main/app/api/market/route.js
- `lib/goldData.js`: https://github.com/Hhhkarimi/TalaNama/blob/main/lib/goldData.js
- `lib/tgju.js`: https://github.com/Hhhkarimi/TalaNama/blob/main/lib/tgju.js
- `components/MarketChart.jsx`: https://github.com/Hhhkarimi/TalaNama/blob/main/components/MarketChart.jsx
- `components/DriversChart.jsx`: https://github.com/Hhhkarimi/TalaNama/blob/main/components/DriversChart.jsx
- `docs/DATA_SOURCES.md`: https://github.com/Hhhkarimi/TalaNama/blob/main/docs/DATA_SOURCES.md
