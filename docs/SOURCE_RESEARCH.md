# TalaNama — Market Data Source Research

> Status: review draft  
> Date: 2026-08-01  
> Scope: source suitability, free-tier constraints, provenance, licensing, and deployment compatibility.  
> This document does not constitute legal advice. Ambiguous rights require provider confirmation.

## 1. Decision summary

No newly researched source is approved yet as a complete replacement for TalaNama's daily observed market history.

Recommended interim strategy:

1. Keep TGJU only as a transitional current-price adapter.
2. Make its legal/redistribution status explicitly unresolved.
3. Capture no new historical series until permission and timestamp semantics are documented.
4. Label the existing generated history as reconstructed and limit analytics.
5. Use official monthly macro datasets only for contextual analysis, not daily price charts.
6. Evaluate one optional international-gold API behind a server-side adapter, but never make it mandatory for the core experience.
7. Prefer a source-independent adapter/provenance architecture so a provider can be replaced without changing UI or formulas.

## 2. Evaluation criteria

Each source is assessed for:

- data provided
- frequency and historical depth
- market timestamp semantics and timezone
- units
- access method
- key/account requirement
- free-tier restrictions
- caching and redistribution permissions
- attribution
- scraping/robots restrictions
- reliability and parser fragility
- failure modes
- Vercel Hobby compatibility
- ChatGPT Sites compatibility
- long-term sustainability

## 3. Current TGJU pages

### Data

- international ounce
- Iranian 18-karat gold
- free-market USD
- public HTML pages parsed server-side

### Technical characteristics

- fixed source pages, not a generic proxy
- current parser searches page text for `نرخ فعلی`
- hourly Next.js cache
- 12-second timeout
- rial-to-toman conversion in the adapter
- no source market timestamp
- no documented historical API in the repository

### Legal status

A public webpage and the existence of `robots.txt` do not establish redistribution permission. No clear, authoritative TGJU terms or data license was located during this research. The repository itself already warns that terms and licensing should be checked before scraping or redistribution.

### Recommendation

**Transitional only; not approved as the sole long-term source.**

Required before expansion:

- provider permission or clearly applicable terms
- permitted cache duration
- permitted public redistribution
- attribution requirements
- automated-access restrictions
- timestamp semantics
- stable source contract or approved API

Until then:

- conservative server-side refresh
- explicit attribution
- no “official,” “real-time,” or guaranteed-feed claim
- prominent source health and stale/fallback states
- no broad archival redistribution

## 4. LBMA / IBA gold benchmark

### Confirmed

LBMA states that use of real-time or historical LBMA Gold Price data requires a licence from ICE Benchmark Administration for relevant usage and redistribution. World Gold Council also reports removal of historical LBMA prices at IBA's request.

### Suitability

- benchmark quality: high
- daily historical depth: potentially excellent
- free/public redistribution: not suitable without licence
- mandatory paid dependency risk: high

### Recommendation

**Rejected for the free core product.**

Do not scrape or redistribute LBMA benchmark history.

Sources:

- https://www.lbma.org.uk/prices-and-data/lbma-gold-price
- https://www.lbma.org.uk/prices-and-data
- https://www.gold.org/goldhub/data/gold-prices

## 5. World Bank Pink Sheet

### Data

The World Bank publishes commodity price data including precious-metals context. The Pink Sheet is primarily monthly and is available as downloadable files.

### Licensing

World Bank's general data terms state that datasets are generally available under CC BY 4.0 unless dataset/indicator metadata specifies otherwise. Third-party restrictions can still apply and must be checked in the dataset metadata.

### Suitability

- update frequency: monthly
- daily/current dashboard price: unsuitable
- macro/long-horizon context: suitable
- attribution: required
- licensing sustainability: comparatively strong when metadata confirms CC BY 4.0

### Recommendation

**Candidate for monthly contextual gold/macroeconomic analysis, not the primary daily chart.**

Before implementation, record the exact dataset metadata, series definition, unit, release lag, and attribution string.

Sources:

- https://www.worldbank.org/en/research/commodity-markets
- https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/world-bank-commodities-price-data-the-pink-sheet
- https://data.worldbank.org/summary-terms-of-use

## 6. IMF Primary Commodity Price System

### Data

IMF PCPS provides commodity indices and actual market prices. IMF documentation notes that some releases lag one or two months and may temporarily contain estimates that are later replaced.

### Suitability

- update frequency: monthly
- observed-vs-estimated distinction: must be retained
- daily/current gold price: unsuitable
- macro context and long-term comparison: potentially suitable
- license/redistribution: requires exact dataset terms confirmation

### Recommendation

**Research candidate for monthly context only.**

If used, estimated months must remain explicitly `estimated`; later replacements must be traceable.

Sources:

- https://data.imf.org/en/datasets/IMF.RES%3APCPS
- https://www.imf.org/external/np/res/commod/index.htm

## 7. FRED API

### Confirmed constraints

- API key is required.
- individual series can have third-party copyright restrictions.
- attribution and a non-endorsement notice are required.
- the current API terms contain restrictions around storing, caching, or archiving FRED content and redistributing cached content.
- export-control obligations apply.
- FRED availability does not override the original provider's rights.

### Suitability

These restrictions conflict with TalaNama's planned public cache, downloadable history, and provenance-preserving export model. They are particularly problematic for a public Iran-focused application.

### Recommendation

**Not approved for the core application.**

Use only after legal review of the exact series, data owner, geography/export constraints, caching, and redistribution.

Sources:

- https://fred.stlouisfed.org/legal/terms/
- https://fred.stlouisfed.org/docs/api/terms_of_use.html
- https://fred.stlouisfed.org/docs/api/fred/overview.html

## 8. Gold API (`gold-api.com`)

### Confirmed

- current-price endpoint is advertised as free and without authentication.
- real-time endpoint is advertised without rate limits.
- free historical/OHLC access is limited to 10 requests per hour.
- terms provide the service as-is and prohibit abuse.
- provider describes multiple upstream fallbacks but does not identify all upstream data licences in the reviewed pages.

### Suitability

- technically easy and Vercel-compatible
- no mandatory user key for current price
- useful as an independent cross-check
- source-chain and redistribution provenance remain insufficiently transparent
- long-term free-tier sustainability is not guaranteed

### Recommendation

**Optional research adapter/cross-check only; not yet an approved source of record.**

Before approval, obtain or confirm:

- upstream source names
- market timestamp and timezone
- definition of “real time”
- redistribution and caching permission
- historical retention limits
- attribution requirements
- acceptable public-production use

Sources:

- https://gold-api.com/docs
- https://gold-api.com/pricing
- https://gold-api.com/terms

## 9. Twelve Data

### Confirmed

- commodities and gold spot are supported.
- a free Basic plan exists with limited credits.
- current individual-plan messaging describes personal/internal/non-commercial use.
- deeper or higher-volume access requires paid tiers.

### Suitability

A public dashboard may not fit personal/internal use. It also introduces an optional server-side key and external quota dependency.

### Recommendation

**Not approved until public redistribution and caching are confirmed in writing for the intended deployment.**

Sources:

- https://twelvedata.com/pricing
- https://twelvedata.com/commodities
- https://twelvedata.com/news/march-2026-updates

## 10. Alpha Vantage

### Confirmed

- free API key available.
- standard free limit is 25 API requests per day.
- gold/silver endpoints exist.
- premium is needed for higher volume and some functions.

### Suitability

25 calls/day can support a low-frequency optional fallback but not an uncached per-user flow. A key would be mandatory for that adapter and must remain server-side. Exact gold endpoint rights, data provenance, redistribution, and history depth require a terms review.

### Recommendation

**Optional fallback candidate only; never required for the core experience.**

Sources:

- https://www.alphavantage.co/documentation/
- https://www.alphavantage.co/premium/
- https://www.alphavantage.co/terms_of_service/

## 11. MetalpriceAPI

### Confirmed

- free plan exists.
- free data is daily/limited.
- free-plan terms restrict use to personal exploration/evaluation and prohibit commercial activity.
- attribution is required for free usage according to provider FAQ.

### Recommendation

**Rejected for the public core product unless the provider grants written permission matching the deployment.**

Sources:

- https://metalpriceapi.com/pricing
- https://metalpriceapi.com/faq
- https://metalpriceapi.com/terms
- https://metalpriceapi.com/documentation

## 12. Official Iranian reference data

### Central Bank of Iran

The official exchange-rate page can potentially provide official/reference currency rates. It must be presented separately from free-market USD.

Open questions:

- stable machine-readable interface
- automated access permission
- historical depth
- rate definition and effective date
- unit and publication timezone
- redistribution terms
- reachability from Vercel/ChatGPT Sites

Recommendation: **candidate only for an official/reference-rate card after direct verification**, not a substitute for the free-market rate.

Candidate page identified in public references:

- https://www.cbi.ir/ExRates/rates_en.aspx

### Statistical Center of Iran

The Statistical Center of Iran is the expected official source for CPI releases, but a stable official machine-readable endpoint and reusable licence were not verified in this environment.

Recommendation:

- use only official release files
- archive the original file hash and publication date
- ingest monthly, not inferred daily
- retain base-year/version metadata
- verify reuse terms before redistribution
- do not backfill values from secondary media

Candidate domain:

- https://www.amar.org.ir/

## 13. Free persistence and scheduling

### Vercel Hobby

Current official limits:

- cron jobs are available, but Hobby schedules can run only once per day.
- execution time within the selected hour can vary by up to 59 minutes.
- an hourly cron expression fails deployment.
- Vercel Blob Hobby includes 1 GB storage, 10,000 simple operations, 2,000 advanced operations, and 10 GB transfer per month.
- if Hobby Blob limits are exceeded, access stops rather than charging automatically.

Recommendation:

- acceptable for a daily official macro snapshot or compact daily close
- not sufficient for guaranteed hourly server-side capture
- current browser-driven hourly refresh remains opportunistic
- Blob use is possible but should not become a paid requirement

Sources:

- https://vercel.com/docs/cron-jobs/usage-and-pricing
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://vercel.com/docs/vercel-blob/usage-and-pricing

### GitHub Actions in a public repository

Current official behavior:

- standard GitHub-hosted Actions usage is free for public repositories.
- scheduled workflows run from the default branch.
- minimum interval is five minutes.
- scheduled workflows in public repositories are automatically disabled after 60 days without repository activity.
- schedule execution is not a guaranteed market-grade scheduler.

Recommendation:

- viable for a daily or hourly best-effort snapshot workflow when source terms permit archival redistribution
- commit compact, append-only normalized data or publish a versioned release artifact
- use concurrency control, schema validation, provenance, source error logs, and no secrets in output
- document that schedule timing is best-effort
- do not use it to bypass provider rate limits or terms

Sources:

- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows

## 14. ChatGPT Sites compatibility

OpenAI's current public documentation states that Sites is in public beta and that some frameworks, databases, background services, and hosting patterns may not be supported. Availability also varies by plan and region.

Therefore:

- a successful local Vinext build is not the same as verified Sites deployment compatibility.
- background snapshot services should remain external to the Sites runtime.
- a static/public-data fallback is needed.
- live deployment verification must be performed from an eligible Sites account.

Sources:

- https://help.openai.com/en/articles/20001339-creating-and-managing-chatgpt-sites
- https://help.openai.com/en/articles/20001337-understanding-responsibilities-for-your-chatgpt-sites

## 15. Proposed source architecture

```text
SourceAdapter
  -> SourceObservation
  -> Normalization
  -> ProvenanceEnvelope
  -> Freshness/Quality Evaluation
  -> Series Alignment
  -> Formula Registry
  -> Analytics Eligibility Policy
  -> API DTO
  -> UI / Export
```

Each adapter should expose:

```text
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
```

Analytics should declare accepted provenance:

```text
maximumDrawdown: observed only
realizedVolatility: observed only
RSI/MACD/Bollinger: observed only
base100Comparison: observed or reconstructed, but separately labeled
scenario: observed/fallback current inputs allowed with visible quality
theoreticalPremium: derived, with parent provenance retained
```

## 16. Recommended source decision sequence

1. Obtain explicit TGJU terms/permission or identify an approved Iranian provider.
2. Define required current-price latency (recommended default: up to one hour, explicitly delayed).
3. Define minimum observed history (recommended default: three years daily for advanced analytics).
4. Approve an international current-price primary and fallback.
5. Approve official Iranian reference-rate and CPI sources separately.
6. Implement adapters and provenance before adding markets.
7. Begin best-effort observed snapshot collection only after rights are confirmed.
8. Keep reconstructed history as a labeled transition layer until adequate observed coverage exists.
9. Never merge reconstructed and observed points without point-level provenance.
10. Review provider terms on a scheduled cadence because free tiers and permissions can change.

## 17. Approval status table

| Source | Proposed role | Status |
|---|---|---|
| TGJU public pages | transitional Iranian current prices | unresolved legal/automation permission |
| LBMA/IBA | official benchmark history | rejected for free core due licence requirement |
| World Bank Pink Sheet | monthly macro/commodity context | candidate, metadata licence check required |
| IMF PCPS | monthly macro/commodity context | candidate, exact terms check required |
| FRED | macro API | not approved due caching/rights/export constraints |
| Gold API | current international cross-check | research-only candidate |
| Twelve Data | international current/history | not approved; usage rights unclear for public app |
| Alpha Vantage | optional low-frequency fallback | research-only candidate |
| MetalpriceAPI | current/history | rejected under free-plan restrictions |
| CBI official rates | official/reference FX card | candidate after direct verification |
| Statistical Center of Iran | CPI/inflation | candidate after official file and licence verification |
