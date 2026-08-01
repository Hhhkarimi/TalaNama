# ADR 0001: Separate provenance type from operational quality

- Status: Accepted
- Date: 2026-08-01

## Context

The existing application mixes current observations, hard-coded fallback values, and reconstructed historical rows. A single status such as `live` or `fallback` cannot express both how a value was produced and whether it is fresh or available.

## Decision

Every market point and series will expose two independent classifications:

1. provenance type: `observed`, `derived`, `reconstructed`, `estimated`, `fallback`, or `demo`;
2. operational quality: `fresh`, `delayed`, `stale`, `partial`, or `unavailable`.

Derived values retain parent provenance. UI, API responses, and exports preserve both classifications.

## Consequences

- A successful fetch may still be delayed.
- An observed value may be stale.
- A fallback value cannot be upgraded to observed after normalization.
- Analytics can declare eligibility using provenance and quality independently.
- The API payload becomes more verbose but significantly more auditable.
