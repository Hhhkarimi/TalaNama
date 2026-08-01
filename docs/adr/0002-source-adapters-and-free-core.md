# ADR 0002: Source adapters must preserve a provider-independent free core

- Status: Accepted
- Date: 2026-08-01

## Context

Market providers can change free tiers, terms, endpoints, licences, and rate limits. TalaNama must remain useful without a mandatory paid API or user-supplied key.

## Decision

External providers are isolated behind narrow server-side source adapters. The domain model and UI consume normalized observations rather than provider-specific fields. Optional free-key adapters must degrade gracefully and cannot be required for core navigation, current dashboard rendering, methodology, scenario calculations, or access to previously retained lawful data.

## Consequences

- Provider replacement does not require a UI redesign.
- Source-specific parsing and terms are documented per adapter.
- A source can be disabled without removing the dashboard shell.
- Some markets may remain unavailable rather than being filled with invented data.
