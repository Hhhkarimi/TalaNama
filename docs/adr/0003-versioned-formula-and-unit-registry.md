# ADR 0003: Use versioned formula and unit registries

- Status: Accepted
- Date: 2026-08-01

## Context

The current code repeats constants and formulas in UI logic, including troy-ounce conversion, 18-karat purity, rial-to-toman conversion, annualization, scenario pricing, and driver decomposition.

## Decision

Units, conversion constants, formula definitions, assumptions, rounding policies, eligible provenance states, and version identifiers are stored in testable domain registries. UI components may format results but must not redefine financial formulas.

## Consequences

- Exports can include formula versions.
- Formula changes are reviewable and testable.
- Rial/toman conversions become explicit.
- Existing calculations can be migrated incrementally without redesigning components.
