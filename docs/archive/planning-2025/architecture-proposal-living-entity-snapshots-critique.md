# Architecture Proposal Critique and Plan Update

## Critique

1. **Mutable question dictionary undermines auditability** – `QuestionDictionary` stores all revisions in a mutable row with an append-only `changeLog`. Any later edit rewrites the live row, so prior wording can disappear or drift, and nothing enforces referential integrity between answers/snapshots and the exact prompt that was shown (docs/architecture-proposal-living-entity-snapshots.md:75-120,633-664).  
2. **Answers lose provenance the moment a prompt changes** – live data is overwritten in `TriageStage.extendedData` without capturing the question revision, editor, or timestamp. When the wording changes, you can no longer prove which wording the saved answer corresponds to, breaking the stated one-to-one requirement (docs/architecture-proposal-living-entity-snapshots.md:166-178,438-451).  
3. **Snapshots omit unanswered questions and contextual layout** – snapshot creation only serializes dictionary keys that already have answers, so empty-but-asked fields vanish. The replay path just dumps key/value pairs with no section metadata, making it impossible to reconstruct the exact form reviewers saw (docs/architecture-proposal-living-entity-snapshots.md:494-519,355-404,574-583).  
4. **Form-level overrides can rewrite history silently** – `FormQuestion.labelOverride` and other display tweaks mutate in place with no versioning, so two committees could see different prompts tied to the same dictionary key with no trace (docs/architecture-proposal-living-entity-snapshots.md:355-366).  
5. **Operational promises lack sizing evidence** – success metrics assume sub-2-second freezes and small JSON payloads, yet the snapshot design duplicates complete entities and question definitions each time. There is no sizing model, retention budget, or compression plan that would substantiate the targets (docs/architecture-proposal-living-entity-snapshots.md:502-533,940-953).  
6. **Audit history between freezes is absent** – outside of snapshots, the system offers no per-answer change log, author tracking, or intermediate timestamps, so explaining “who changed what when” between freezes will be impossible (docs/architecture-proposal-living-entity-snapshots.md:166-178,438-451).

## Updated Implementation Plan

### Phase 0 – Data Model Hardening (Weeks 1-2)
- Introduce immutable `QuestionRevision` and `AnswerRevision` tables that carry stable UUIDs, timestamps, and author ids.  
- Migrate `FormQuestion` to reference a specific `QuestionRevision` (with a convenience pointer to the latest revision for live forms).  
- Populate revision tables by splitting the current dictionary entries into historical rows; backfill `AnswerRevision` records from existing submissions where possible.

### Phase 1 – Provenance-Preserving Write Path (Weeks 3-4)
- Refactor form save logic to emit a new `AnswerRevision` whenever an answer changes, capturing the active `QuestionRevision`, editor, timestamp, prior revision link, and change reason flag (manual vs auto-migrated).  
- Replace `extendedData` overwrites with a materialized `CurrentAnswer` view/table keyed by (`entityId`, `questionId`) that points at the latest `AnswerRevision`, ensuring history is retained without slowing live reads.

### Phase 2 – Snapshot Fidelity Improvements (Weeks 4-6)
- Capture unanswered-but-visible questions by snapshotting the full template structure (sections, ordering, overrides) alongside the bound `QuestionRevision` ids.  
- Store a `FormTemplateRevision` entity and reference it from snapshots so reviewers can replay the exact layout and copy.  
- Adjust snapshot replay endpoints to render from `FormTemplateRevision` + `AnswerRevision` data instead of raw JSON blobs.

### Phase 3 – Form Override Governance (Weeks 6-7)
- Version `FormQuestion` overrides (`labelOverride`, help text, validation tweaks) via `FormQuestionRevision` records to stop silent mutations.  
- Add approval or review tooling for override changes, logging editor, timestamp, and rationale.

### Phase 4 – Storage & Observability Guardrails (Weeks 7-8)
- Build a sizing model for snapshots (average entity size × snapshot frequency) and enforce retention/archival policies aligned with compliance goals.  
- Implement monitoring around snapshot latency, payload size, and auto-migration counts; trigger alerts when thresholds are exceeded.  
- Document audit data retrieval stories (e.g., “show me all revisions between two freezes”) to validate coverage before declaring MVP complete.
