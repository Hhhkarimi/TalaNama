# Issue tracker configuration

## Backend

GitHub Issues in `Hhhkarimi/TalaNama`.

## Publishing rules

- Create implementation tickets only after the related specification is approved.
- Use vertical slices with explicit acceptance criteria and blocking relationships.
- Link every ticket to the originating specification and prototype decision.
- Separate source/legal research from implementation tickets.
- Do not create duplicate issues for unresolved product decisions.
- Security-sensitive findings must not include exploit-ready details in public issues.

## Current connector limitation

The connected GitHub integration can read the repository but returned HTTP 403 for branch creation on 2026-08-01. Until write access is restored, issue and branch changes must be applied by a maintainer or from a local authenticated Git client.
