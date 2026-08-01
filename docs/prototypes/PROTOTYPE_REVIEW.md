# TalaNama Prototype Decision

Status: selected  
Selected variant: **A — Expanded Existing Dashboard**  
Decision date: 2026-08-01

## Decision

Variant A is the approved product direction for the next implementation specification.

It preserves the existing sidebar, top bar, card language, primary chart position, scenario builder, return calculator, source section, dark-mode logic, responsive behavior, Persian RTL layout, and Vazirmatn typography.

New functionality is introduced through the existing visual language:

- provenance and quality badges on market cards
- secondary market cards
- a prominent reconstructed-history warning
- disabled states for analyses requiring adequate observed data
- accessible chart summaries and tables
- compact source-health reporting
- expanded scenario and calculator disclosures
- progressive detail without changing the navigation model

## Why A was selected

- The additional market and quality information remains visible without a new interaction model.
- Existing users can recognize the dashboard immediately.
- Source transparency is available at the point of use.
- It provides the clearest path for adding markets incrementally.
- It avoids hiding essential provenance in a drawer.

## Typography decision

Vazirmatn is the only project font. No Tahoma, Arial, generic sans-serif, Persian display font, or external web font may be introduced.

The existing self-hosted package remains:

```js
import "@fontsource-variable/vazirmatn";
```

The root CSS font stack is normalized to:

```css
font-family: "Vazirmatn Variable", Vazirmatn;
```

## Prototype route

```text
/prototypes
```

The route is temporary and disposable. It does not replace `/` and must not become the public landing page.
