# Domain documentation configuration

## Canonical files

- Stable product context and glossary: `/CONTEXT.md`
- Durable decisions: `/docs/adr/`
- Data-source research: `/docs/SOURCE_RESEARCH.md`
- Existing data audit: `/docs/INITIAL_DATA_AUDIT.md`
- Approved feature specification: `/docs/specs/` when created

## Consumer rules

- Read `CONTEXT.md` before changing user-facing terminology, units, quality labels, formulas, or analytics eligibility.
- Add only stable, cross-feature knowledge to `CONTEXT.md`; do not turn it into a changelog or implementation plan.
- Create an ADR only for a durable, difficult-to-reverse architecture, data, formula, source, deployment, or privacy decision.
- Do not create ADRs for normal component choices or reversible UI details.
- A source is not “approved” merely because its webpage is public or its API has a free tier.
- The specification remains the acceptance source for implementation; the glossary defines terms, not feature scope.
