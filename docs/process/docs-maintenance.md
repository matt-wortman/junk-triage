# Documentation Maintenance Guide

## 1. Purpose and Scope
- Keep Tech Triage documentation accurate, auditable, and aligned with code as features evolve.
- Define ownership, update triggers, review cadence, and enforcement tooling for all docs in `docs/` plus the root `README.md`.

## 2. Ownership *(confirm names/roles)*
- `docs/overview.md` owner: TODO (e.g., Product/Program lead).
- `docs/technical/architecture.md` owner: TODO (e.g., Tech lead/architect).
- `docs/process/docs-maintenance.md` owner: TODO (e.g., Engineering manager).
- Backup owner(s): TODO.
- Authority: Owners can block merges if documentation requirements are unmet.

## 3. Source of Truth
- `README.md` – Quick start & public-facing status.
- `docs/overview.md` – Stakeholder narrative, roadmap summary.
- `docs/technical/architecture.md` – Detailed design, state, runbook.
- `docs/adrs/NNNN-*.md` – Architecture decision records (one per decision).
- `docs/process/docs-maintenance.md` – This guide.
- `docs/diagrams/` – Mermaid/PlantUML sources for architectural diagrams (add as needed).
- `.github/PULL_REQUEST_TEMPLATE.md` – Evidence + documentation checklist.

## 4. Update Triggers
| Event | Update Required |
| --- | --- |
| User-facing change, new feature, roadmap shift | `docs/overview.md`, `README.md` status snapshot |
| Architecture/design change, new dependency, schema update | `docs/technical/architecture.md` + ADR |
| Decision made/reversed | New ADR or ADR supersession |
| Operational change (deploy flow, environment config) | Runbook section + overview callouts |
| Security/compliance change | Architecture doc security section |
| Release cut | Snapshot current state sections, optionally update changelog |
| Monthly maintenance review | Verify all docs still accurate |

## 5. Update Process
1. **Same-PR updates:** Every code change that impacts behavior or operations updates relevant docs before merge.
2. **Evidence-based documentation:**
   - Contextual evidence – cite files, ADRs, or screenshots in PR.
   - Type evidence – include `npm run type-check` result.
   - Execution evidence – include `npm test`, targeted scripts, or manual validation output.
3. **ADRs:** Use sequential IDs (`0001`, `0002`, …). Do not edit accepted ADRs—create a new one that supersedes and link both directions.
4. **Diagrams as code:** Store Mermaid/PlantUML sources; embed generated diagrams in Markdown.
5. **Review:** Doc owners verify content before approval; changes without owner sign-off require follow-up issue.

## 6. Cadence & Rituals
- **Monthly doc review:** Owners walk through overview + technical doc, run quick-start commands, log issues/tickets for gaps.
- **Quarterly architecture review:** Confirm runbook accuracy, retire or supersede stale ADRs, revalidate assumptions/risks.
- **Release readiness checklist:** Prior to each major release, ensure roadmap, risk table, and runbook reflect deployed reality.

## 7. Quality Bar (Checklist)
Before merging any PR:
- [ ] Contextual evidence included.
- [ ] Type evidence (`npm run type-check`) recorded.
- [ ] Execution evidence (`npm test` / targeted scripts) recorded.
- [ ] `docs/overview.md` updated if user-facing impact.
- [ ] `docs/technical/architecture.md` updated if architecture/ops change.
- [ ] ADR added/updated for decisions.
- [ ] Runbook/operations section adjusted if deploy process changed.
- [ ] Security & compliance implications reviewed.
- [ ] Tests added/updated as needed.

## 8. ADR Template
Create `docs/adrs/0000-template.md` with the following skeleton:
```markdown
# ADR-NNNN: Title

- **Status:** Proposed | Accepted | Superseded by ADR-NNNN | Rejected
- **Date:** YYYY-MM-DD
- **Context:** …
- **Decision Drivers:** …
- **Considered Options:** …
- **Decision Outcome:** …
- **Consequences:** Positive/Negative …
- **Implementation Notes:** …
- **References:** Links to issues/PRs, diagrams, research
```

## 9. Tooling
- `.github/PULL_REQUEST_TEMPLATE.md` for enforcement (see plan).
- Optional (enable when useful): markdownlint or Vale (style consistency), link checker, docs-specific CI job.
- CODEOWNERS entries for `docs/` paths once ownership formalized.

## 10. Outstanding Actions
- Fill in owner names/roles.
- Decide on tooling enablement and document timeline.
- Add ADR template file and first ADRs (e.g., docs-as-code adoption, Azure DB decision) once decisions are made.
- Document data retention/privacy policy in overview + architecture once finalized.
