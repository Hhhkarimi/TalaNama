# TalaNama domain context

## Product

TalaNama (`طلانما`) is a Persian RTL analytical dashboard for understanding the relationship among international gold, Iranian gold, the Iranian free-market exchange rate, and domestic market premiums. It is an upgrade of the existing application, not a replacement.

The product serves ordinary users who need plain-language explanations and more analytical users who need traceable formulas and source metadata. Complexity should be progressively disclosed rather than placed into the initial overview.

## Stable invariants

- The existing dashboard shell, sidebar, top bar, navigation model, primary chart, scenario builder, return calculator, CSV export, dark mode, responsive behavior, Persian RTL layout, and Vazirmatn typography remain recognizable.
- The core experience remains usable without payment, a user account, or a user-supplied API key.
- Market analysis is descriptive and educational, not individualized investment advice.
- Every analytical claim must be traceable to input data, provenance, formula version, assumptions, and limitations.
- Reconstructed, estimated, stale, fallback, unavailable, and demo data must never be visually or semantically presented as observed data.
- Rial and toman must never be mixed silently.
- A successful source request is not automatically “real-time.”
- Correlation and residual decomposition do not establish causation.

## Provenance model

### Provenance type

- `observed`: copied from a source observation without inventing an intermediate market value.
- `derived`: calculated from one or more parent observations; parent provenance is retained.
- `reconstructed`: generated between reference observations through interpolation, smoothing, synthetic noise, or another reconstruction method.
- `estimated`: supplied or calculated as an explicit estimate where the true observation is not yet available.
- `fallback`: substituted because a preferred source could not provide a usable value.
- `demo`: intentionally fictional data used only for a prototype or demonstration.

### Operational quality state

- `fresh`: within the documented expected update interval.
- `delayed`: usable but not expected to represent the current market moment.
- `stale`: older than the accepted freshness threshold.
- `partial`: some required source fields are missing or substituted.
- `unavailable`: no usable value is available.

Provenance type and operational quality are separate dimensions. An observed value can be stale; a derived value can be fresh; a fallback value can also be stale.

## Market terminology

- **Spot price / قیمت نقدی:** a source-defined price intended to represent a current tradable or reference market level. The provider definition must be recorded.
- **Reference price / قیمت مرجع:** an official, benchmark, or institutional rate that may differ from the free market.
- **Market price / قیمت بازار:** the price quoted by the approved market source for the relevant instrument.
- **Closing price / قیمت پایانی:** the final observation for a defined session or day; it must not be inferred from an arbitrary last fetch.
- **Current price / قیمت جاری:** the latest available value, with captured time, market time when known, and freshness state.
- **Delayed price / قیمت با تأخیر:** a current-looking value whose source or cache delay exceeds the real-time definition.
- **Troy ounce / اونس تروا:** exactly 31.1034768 grams; displayed formula versions may use a documented rounded constant.
- **Karat / عیار:** gold purity on a 24-part scale. 18-karat nominal purity is 0.75.
- **Premium / صرف:** a precisely defined relative difference between market price and a documented theoretical/reference value.
- **Coin premium / صرف سکه:** coin market price minus calculated fine-gold intrinsic value, expressed in currency or percent; it excludes seller spread, fees, and taxes unless explicitly included.
- **Theoretical value / ارزش نظری:** formula-derived value from documented weights, purity, global price, and currency inputs.
- **Domestic residual / مؤلفه توضیح‌داده‌نشده داخلی:** the part of a decomposition not explained by selected global-gold and currency terms. It is not a directly observed cause.

## Analytical terminology

- **Return / بازده:** percentage change between two valid observations.
- **Nominal return / بازده اسمی:** return without inflation adjustment.
- **Real return / بازده واقعی:** inflation-adjusted return based on an approved inflation series and matched period.
- **Volatility / نوسان:** dispersion of observed returns under a documented frequency and annualization rule.
- **Drawdown / افت از اوج:** decline from a previous observed running maximum.
- **Correlation / همبستگی:** statistical co-movement over a defined aligned period; it does not imply causation.
- **Technical indicator / شاخص فنی:** deterministic calculation over a suitable observed series and lookback window.
- **Scenario / سناریو:** deterministic hypothetical output from user-selected inputs.
- **Forecast / پیش‌بینی:** an estimate of an unknown future outcome. TalaNama does not label deterministic scenarios as forecasts.

## Analytics eligibility

- Daily realized volatility, observed daily high/low, maximum drawdown, rolling correlation, RSI, MACD, ATR, Bollinger Bands, and return distributions require adequate observed history.
- Reconstructed series may support visual continuity and base-100 demonstrations only when prominently labeled and excluded from observed-data claims.
- Scenario calculations may use fallback or delayed current inputs only when the quality state is visible in the result.
- Historical return calculations must reveal whether the selected boundary values are observed, reconstructed, estimated, or fallback.

## Source approval

A source is approved only when its access method, terms, attribution, cache rules, redistribution rights, timestamp semantics, units, failure modes, and free-tier sustainability are documented. Optional adapters may use a server-side free key, but the core experience must remain functional without it.
