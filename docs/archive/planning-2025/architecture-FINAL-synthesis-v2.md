# Architecture Plan v2 – Living Entity Database with Question Revisions

**Document Owner:** Platform Architecture (AGENT‑1 & AGENT‑2)  
**Last Updated:** 2025‑10‑16  
**Audience:** Engineers, architects, product owners, and new contributors onboarding to the Tech Triage Platform project.

---

## 1. Purpose

This document replaces the previous “FINAL synthesis” plan and captures the consensus architecture for protecting question→answer integrity in the Tech Triage Platform while keeping the user experience “living document” friendly. It provides enough context for a newcomer to understand the business problem, the design, and how to begin implementation and validation.

---

## 2. Problem Summary

When questions in a dynamic form change over time, earlier answers can become ambiguous (e.g., an answer of “$50M” might refer to an older wording “What is the market size?” while the current question reads “What is the addressable market size?”). We must:

1. Preserve the exact wording (and metadata) a user answered.  
2. Let users keep editing without managing versions manually.  
3. Provide immutable point‑in‑time snapshots for decisions/audits.  
4. Respect stated requirements: no per‑edit change logs, no author tracking per answer.

---

## 3. Goals & Non‑Goals

| Scope | Details |
|-------|---------|
| ✅ Goal | Maintain a provable 1:1 link between each stored answer and the exact question wording/version that generated it. |
| ✅ Goal | Allow continuous editing with lightweight stale answer detection. |
| ✅ Goal | Produce immutable snapshots for committee reviews and compliance. |
| ✅ Goal | Measure and confirm performance targets before rollout. |
| ❌ Non‑Goal | Introduce full event sourcing or per‑edit audit trails (explicitly rejected by requirement #14). |
| ❌ Non‑Goal | Redesign the entire form builder UX; changes focus on data layer & admin workflows. |

---

## 4. Requirements Recap

* **User workflow:** Edit forms like living documents; no manual version selection.  
* **Admins:** Control when a question revision is published; must follow a policy for “meaning change” decisions.  
* **Snapshots:** Needed at milestones; must include the exact question definitions and answers from that moment.  
* **Restrictions:**  
  * No per‑field change logging between snapshots.  
  * No author tracking on individual answers.  
  * Performance expectations (form load <~1s, snapshot creation <~2s) are targets to validate, not assumptions.

---

## 5. High‑Level Architecture Overview

```
┌──────────────────────────┐
│ QuestionDictionary       │  latest revision pointer (mutable)
│ └── currentRevisionId ───┼──► QuestionRevision (immutable rows)
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│ Entity Answer Storage    │  (TriageStage.extendedData etc.)
│ value + questionRevision ├──► references immutable revision id
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│ TechnologySnapshot       │ captures entity state + question revisions
└──────────────────────────┘
```

Key ideas:

1. **Immutable `QuestionRevision`** rows store every version of a question (label, help text, options, validation, etc.).  
2. **`QuestionDictionary`** keeps the latest revision pointer for rendering live forms.  
3. **Answers** in `extendedData` reference the `question_revision_id`, not just a version number, guaranteeing historical wording can always be retrieved.  
4. **Stale detection** compares the stored revision id to the current revision id.  
5. **Snapshots** capture entity data plus the revision definitions to lock the review context.  
6. **No `AnswerRevision` table**; audit needs are met via snapshots and the current answer record, satisfying the “no per‑edit log” requirement.

---

## 6. Data Model Changes

### 6.1 QuestionDictionary (mutable)

| Field | Type | Notes |
|-------|------|-------|
| `id` | cuid | Existing PK |
| `key` | string (unique) | Logical question key (`market_size`) |
| `currentRevisionId` | string FK | Points to latest `QuestionRevision.id` |
| `currentVersion` | int | Convenience version number |
| `changeLog` | jsonb (deprecated) | Backfilled for read‑only history; not authoritative |
| other metadata | existing | (bindingPath, dataSource, timestamps, etc.) |

### 6.2 QuestionRevision (new, immutable)

| Field | Type | Notes |
|-------|------|-------|
| `id` | cuid | Primary key |
| `questionKey` | string | Matches `QuestionDictionary.key` |
| `versionNumber` | int | Starts at 1, increments per published revision |
| `label`, `helpText`, `options`, `validation` | text/json | Full definition |
| `createdAt`, `createdBy` | timestamp/string | Who published the revision |
| `changeReason`, `significantChange` | text/bool | Explain why revision happened |
| `dictionaryId` | FK | Ensures referential integrity |
| Unique Index | (`questionKey`, `versionNumber`) |

Revision rows are append‑only. Updates occur by inserting a new row and updating the dictionary’s `currentRevisionId`.

### 6.3 Entity Answers (e.g., `TriageStage.extendedData`)

Stored as JSON with structure:

```jsonc
{
  "market_size_detail": {
    "value": "$50M annually",
    "questionRevisionId": "qr_abc123",
    "answeredAt": "2025-01-15T10:30:00Z"
  }
}
```

* `questionRevisionId` is mandatory.  
* When a question revision is published, stale detection compares `questionRevisionId` with `QuestionDictionary.currentRevisionId`.  
* `answeredAt` is informational (helps UI show freshness) but not a trigger for audit storage.

### 6.4 Snapshots

`TechnologySnapshot.dataSnapshot` now contains:

* `questionRevisions`: map of `questionKey` → revision payload (copied from `QuestionRevision`)  
* `answers`: map of `questionKey` → `{ value, questionRevisionId, answeredAt }`  
* `formTemplate`: structure with sections/questions exactly as presented (including label overrides) referencing the captured revisions.

---

## 7. Application Flow

### 7.1 Live Editing
1. Render form by loading `QuestionDictionary` (current revisions) and the entity’s `extendedData`.  
2. For each question, compare stored `questionRevisionId` with `currentRevisionId`.  
3. If mismatched, show a “Stale answer” warning with the old vs new wording.  
4. When saving an answer, write `questionRevisionId = currentRevisionId`.

### 7.2 Question Updates (Admin)
1. Admin edits wording/options in the question management UI.  
2. System creates a new `QuestionRevision` row.  
3. `QuestionDictionary.currentRevisionId` is updated atomically.  
4. `changeLog` is backfilled from revisions (read‑only).  
5. Editors see staleness warnings the next time they load the form.

### 7.3 Snapshot Creation
1. Resolve all sections/questions for the active template.  
2. Pull corresponding `QuestionRevision` rows.  
3. Capture entity answers with their `questionRevisionId`.  
4. Insert immutable `TechnologySnapshot`.  
5. Snapshot viewer renders directly from captured data.

---

## 8. Operational Policies (Admin-Facing)

- **Version Decision Matrix:** Documented in `docs/question-version-policy.md` (to be published). Admins must choose whether a change is “meaningful” enough to create a new revision. Typos/help text tweaks do not create a new revision, but the change is still logged as metadata.  
- **Publish Workflow:** Admins preview new wording, provide `changeReason`, and publish. System handles revision insertion & pointer update in one transaction.  
- **Monitoring:** Dashboards track revision publish activity, stale answer counts, and snapshot timings.  
- **Rollback:** If a revision proves problematic, admins can publish a new revision reverting to the prior wording (history is append‑only).

---

## 9. Implementation Roadmap

### Phase 0 – Architecture Hardening & Validation (2 weeks)

| Stage | Description | Owner(s) | Key Artifacts |
|-------|-------------|----------|---------------|
| 0a. Shadow schema | Create `QuestionRevision` table, add FKs/indices, backfill data in parallel tables (feature flag OFF). | AGENT‑1 | SQL migration scripts, Prisma schema update |
| 0b. Validation | Automated parity checks comparing legacy `changeLog`/labels against new revisions; generate diff report; prepare rollback scripts. | AGENT‑1 guided by AGENT‑2 | Validation report, rollback instructions |
| 0c. Soak | Enable feature flag in dev → staging with monitoring; verify performance workloads. | Both | Soak logs, performance metrics, issue tracker |

#### Phase 0 Deliverables
* **Architecture Document Update (this file) –** AGENT‑2  
* **Question Version Policy –** AGENT‑2 (decision matrix, workflow)  
* **Phase 0 Validation Plan –** AGENT‑2 (detailed runbook & exit criteria)  
* **Prisma Schema + Migrations –** AGENT‑1  
* **Performance Harness –** AGENT‑1 (Workloads A/B/C)  
* **Executive Summary & Approval Packet –** Both (submitted to stakeholders before enabling in production)

#### Performance Workloads
| Workload | Goal | Target (95th percentile) | Notes |
|----------|------|--------------------------|-------|
| A | Render live form (50 questions) with stale checks | < 1.5 s | Measure end‑to‑end API + UI |
| B | Create snapshot capturing full form | < 3.0 s | Includes question definition serialization |
| C | Scan 100 technologies for stale answers | < 5.0 s total | Supports admin dashboards |

#### Exit Criteria
All of the following must be true to proceed to Phase 1:
1. Validation diff report shows zero mismatches.  
2. Stale detection logic never returns “Unknown”.  
3. Performance workloads meet targets and show no regression vs baseline.  
4. Feature flag toggles are proven reversible.  
5. Monitoring dashboards & runbooks are in place.  
6. Stakeholders approve the question version policy, validation results, and Phase 1 go‑forward plan.

### Phase 1 – Implementation & Rollout (Post-Phase 0)

* Switch production writes/reads to use `QuestionRevision`.  
* Update backend services and resolvers to supply revision metadata to front end.  
* Update front-end components to surface stale warnings using the new data shape.  
* Extend snapshot API & UI to render captured revision data.  
* Remove legacy code paths relying on mutable `changeLog`.  
* Review analytics/reporting pipelines for new fields if needed.  
* Plan incremental rollout (feature flag per environment).

### Phase 2 – Enhancements (Future)

* Snapshot diff tooling (comparing two snapshots).  
* Admin dashboards for stale answer counts & revision history.  
* Automated reminders when stale answers persist beyond threshold.  
* Optional scheduled snapshots (quarterly, stage transitions).

---

## 10. Getting Started for Engineers

1. **Local Setup:**  
   - Ensure Prisma CLI is installed.  
   - Run `yarn prisma generate`.  
   - Verify `.env` points to local Postgres instance.

2. **Check Out Branch:**  
   - Create feature branch `feature/question-revision-phase0`.

3. **Apply Shadow Schema (Phase 0a):**  
   - Run new migration script (provided in repository).  
   - Execute backfill script; confirm `question_revisions` populated.

4. **Run Validation (Phase 0b):**  
   - Execute validation harness (`yarn test:revision-parity`).  
   - Inspect generated report in `/reports/revision-parity/`.

5. **Run Performance Harness:**  
   - `yarn perf:forms` (Workload A).  
   - `yarn perf:snapshot` (Workload B).  
   - `yarn perf:stale-scan` (Workload C).  
   - Capture metrics; compare against baseline.

6. **Feature Flag Testing (Phase 0c):**  
   - Toggle `USE_QUESTION_REVISIONS=true` in `.env.local`.  
   - Run end-to-end smoke tests.  
   - Monitor logs using `yarn dev --inspect`.

7. **Document Findings:**  
   - Add results to Phase 0 validation report.  
   - Flag issues in the shared tracker for triage.

---

## 11. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Migration errors corrupt `extendedData` | High | Medium | Run parity diff before toggling flag; have rollback script; take DB snapshot. |
| Admins forget to publish revisions | Medium | Medium | Provide clear policy & UI cues; add monitoring for questions edited without publish. |
| Performance regressions | Medium | Medium | Performance harness compares baseline; gate release on metrics. |
| Stakeholder confusion about manual vs automated versioning | Medium | Low | Communicate policy upfront; adjust success metrics to reflect admin responsibility. |
| Future requirement for per-answer audit | Potential scope creep | Unknown | Document requirement #14 in policy; if business needs change, revisit architecture. |

---

## 12. Open Questions & Follow-Ups

1. **Question policy sign-off:** Which stakeholder (product or compliance) signs the version policy?  
2. **Monitoring tooling:** Decide on dashboards (e.g., Grafana vs. custom).  
3. **Front-end UX updates:** Confirm copy/design for stale warnings with UX team.  
4. **Legacy data cleanup:** Determine if historical `changeLog` JSON should be kept indefinitely or pruned after Phase 1.  
5. **Post-Phase 0 timeline:** Schedule go/no-go review meeting with stakeholders.

---

## 13. Next Immediate Steps (Action Checklist)

1. **AGENT‑2** – Draft `docs/question-version-policy.md` (Due: 2025‑10‑18).  
2. **AGENT‑2** – Publish Phase 0 validation plan template (Due: 2025‑10‑18).  
3. **AGENT‑1** – Implement Prisma schema & migration scripts (Due: 2025‑10‑20).  
4. **AGENT‑1** – Create performance harness scripts (Due: 2025‑10‑20).  
5. **Both** – Prepare executive summary for user approval (Due: 2025‑10‑21).  
6. **Stakeholders** – Review & approve Phase 0 scope (Target meeting: week of 2025‑10‑21).  
7. **Engineering** – Execute Phase 0 stages during week of approval.

---

## 14. Conclusion

By introducing immutable question revisions, aligning success metrics with reality, and validating performance before rollout, this plan preserves user simplicity while guaranteeing data integrity. Phase 0 gives us a controlled environment to prove the architecture before full implementation. Once Phase 0 exit criteria are met, we can confidently plan Phase 1 coding work knowing we have stakeholder buy-in, verified migrations, and measured performance.

This document is the authoritative reference for the architecture moving forward. Update it as implementation details evolve, and link related artifacts (policy, validation plan, migration scripts) here for traceability.

---
