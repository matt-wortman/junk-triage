# ADR-0001: Question Library with Immutable Revisions and Incremental Migration

- **Status:** Proposed
- **Date:** 2025-10-22
- **Deciders:** Product Owner, Tech Lead, Form Admin Lead (to confirm)

## Context

We want users to reuse the same questions across forms (e.g., Tech ID) and carry forward prior answers when applicable, while preserving an accurate record of what was asked at the time of any decision. Today, form questions can reference a dictionary entry, and the system can prefill values from `Technology` and stage tables. However, answers are not yet bound to the exact version of the question that produced them, and snapshots don’t yet capture the full set of question definitions at freeze time. A full rewrite was considered but would duplicate working pieces and delay near‑term value.

## Decision Drivers

- Preserve question→answer integrity even as questions evolve.
- Keep the day‑to‑day editing experience simple (no manual version juggling).
- Provide immutable, auditable decision snapshots.
- Minimize risk and downtime; deliver value incrementally.
- Reuse the working catalog/binding, prefill, and write‑back already shipped.

## Considered Options

1) Full rewrite on a new stack with a brand‑new form/answer model.
2) Incremental refactor: add immutable `QuestionRevision`, bind answers to revisions, and add proper snapshots; keep existing dictionary/bindings and runtime.
3) “Version number only” approach (no revision rows) with best‑effort labels and manual notes.

## Decision Outcome

We will pursue Option 2 (incremental refactor) and explicitly avoid a rewrite.

Key elements:
- Add immutable `QuestionRevision` rows and make `QuestionDictionary` point to the current revision (`currentRevisionId`, `currentVersion`).
- Store answers with a pointer to the exact `questionRevisionId` (for flexible fields, inside stage `extendedData`).
- Detect “stale” answers by comparing stored revision id with the dictionary’s current revision.
- Create purpose‑built snapshots that capture: (a) Technology + stage data, (b) all answers with their revision ids, and (c) the complete set of question definitions as shown at freeze time.
- Gate rollout behind the existing Phase 0 validation plan (dev → staging → go/no‑go), measuring performance and data integrity before enabling by default.

## Consequences

Positive:
- Reliable reuse across forms; prior answers can be imported knowingly and safely.
- Clear user messaging when answers are out of date (“stale”) due to question changes.
- Auditable decisions with exact wording and data frozen in time.
- Lower risk than a rewrite; we retain working prefill/bindings and exports.

Negative / Trade‑offs:
- Slightly more complexity in the data model (revisions + extended answers).
- Admin workflow needed to publish revisions and follow a version policy.
- Snapshot storage grows over time (mitigated with retention and JSONB compression).

Follow‑ups:
- Build a minimal “import from history” drawer so users opt‑in to bring prior answers.
- Expand snapshot viewer to render from frozen definitions and values.
- Add feature flags and metrics around stale detection and import usage.

## Implementation Notes

- Policy: `docs/question-version-policy.md` defines when to increment versions and how admins publish changes.
- Validation plan: `docs/phase-0-validation-plan.md` (Workloads A/B/C, shadow schema, soak tests).
- Current code using dictionary + bindings:
  - `tech-triage-platform/prisma/schema.prisma` (dictionary + form question FK)
  - `tech-triage-platform/src/lib/technology/service.ts` (hydrate + prefill + write‑back)
  - `tech-triage-platform/scripts/util/attach-dictionary-keys.ts` (attach keys)
- Planned schema deltas (Phase 0): add `QuestionRevision`, add `currentRevisionId/currentVersion` to dictionary, introduce `extendedData` for flexible answers with `questionRevisionId`, and add a proper snapshot table or expand `StageHistory.snapshot` structure.

## References

- Architecture (living entity + snapshots): `docs/archive/planning-2025/architecture-proposal-living-entity-snapshots.md`
- Final synthesis v2 (revisions + binding): `docs/archive/planning-2025/architecture-FINAL-synthesis-v2.md`
- Multi‑Form Master Plan: `tech-triage-platform/docs/TECHNOLOGY_MULTI_FORM_MASTER_PLAN.md`
- Project status and roadmap: `tech-triage-platform/docs/PROJECT_STATUS.md`, `tech-triage-platform/docs/ARCHITECTURE_ROADMAP.md`

