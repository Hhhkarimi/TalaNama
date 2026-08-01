# Repository instructions

TalaNama is an incremental upgrade project. Preserve the existing Persian RTL dashboard, routes, visual identity, sidebar, top bar, charts, tools, dark mode, responsive behavior, Vazirmatn typography, and free deployment model.

Before changing production behavior:

1. Read `CONTEXT.md`.
2. Read relevant ADRs under `docs/adr/`.
3. Read the approved specification under `docs/specs/` when it exists.
4. Preserve point-level data provenance and never mark generated data as observed.
5. Do not introduce a paid mandatory dependency.
6. Do not describe analytics as guaranteed investment advice.
7. Prefer small, testable domain modules over broad UI rewrites.

## Agent skills

### Issue tracker

Work is tracked in GitHub Issues for `Hhhkarimi/TalaNama`. Read `docs/agents/issue-tracker.md` before publishing or updating work items.

### Triage labels

The proposed canonical label mapping is recorded in `docs/agents/triage-labels.md`. The labels have not been provisioned because the current GitHub integration is read-only for repository writes.

### Domain docs

Stable product terminology and invariants live in `CONTEXT.md`. Durable architecture, data, formula, source, deployment, and privacy decisions live under `docs/adr/`. Read `docs/agents/domain.md` for update rules.
