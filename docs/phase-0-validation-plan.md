# Phase 0 Validation Plan

**Project**: Tech Triage Platform - Form Versioning System
**Date**: 2025-10-17
**Status**: Ready for Execution
**Owner**: Engineering Team (AGENT-1 & AGENT-2)

---

## Purpose

Phase 0 is a **validation gate** before Phase 1 implementation. Its purpose is to:

1. **Prove the architecture** - Validate QuestionRevision approach with real data
2. **Measure performance** - Test actual performance against targets (not assumptions)
3. **Reduce risk** - Identify issues before production implementation
4. **Build confidence** - Provide evidence-based approval for Phase 1

**Key Principle**: Do NOT proceed to Phase 1 until ALL exit criteria pass.

---

## Timeline

**Total Duration**: 2 weeks

### Week 1: Architecture Alignment & Performance Testing
- **Days 1-2**: Document finalization and schema design
- **Days 3-5**: Performance harness and baseline measurements

### Week 2: Migration Staging & Validation
- **Days 6-7**: Phase 0a (Shadow schema)
- **Days 8-9**: Phase 0b (Validation)
- **Days 10-12**: Phase 0c (Soak test - 48 hours)

---

## Phase 0 Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Week 1: Architecture Alignment (Days 1-2)                    │
│ - Finalize architecture document (AGENT-2)                   │
│ - Finalize Prisma schema (AGENT-1)                           │
│ - Cross-review and align                                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Week 1: Performance Validation (Days 3-5)                    │
│ - Build test harness (AGENT-1)                               │
│ - Run Workloads A/B/C (AGENT-1)                              │
│ - Create validation report template (AGENT-2)                │
│ - Analyze results (Both)                                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Week 2: Phase 0a - Shadow Schema (Days 6-7)                  │
│ - Create QuestionRevision table in dev                       │
│ - Backfill from existing QuestionDictionary                  │
│ - Feature flag OFF (app still uses old schema)               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Week 2: Phase 0b - Validation (Days 8-9)                     │
│ - Run automated parity checks                                │
│ - Compare legacy JSON vs new revisions                       │
│ - Generate diff report                                       │
│ - Fix any discrepancies                                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Week 2: Phase 0c - Soak Test (Days 10-12)                    │
│ - Feature flag ON in dev (24 hours)                          │
│ - Feature flag ON in staging (48 hours)                      │
│ - Monitor errors, performance, data integrity                │
│ - Go/no-go decision                                          │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Exit Gate: All Criteria Must Pass                            │
│ - Data integrity ✅                                          │
│ - Performance targets met ✅                                 │
│ - Operational readiness ✅                                   │
│ - Stakeholder approval ✅                                    │
└──────────────────────────────────────────────────────────────┘
                            ↓
                   Phase 1 Implementation
```

---

## Phase 0 Deliverables

### 1. Architecture Documents (AGENT-2)
- ✅ `docs/claude-architecture-FINAL-synthesis-v2.md` (updated architecture)
- ✅ `docs/question-version-policy.md` (admin guidelines)
- ✅ `docs/phase-0-validation-plan.md` (this document)

### 2. Schema & Migrations (AGENT-1)
- ✅ Complete Prisma schema with QuestionRevision model
- ✅ SQL migration scripts (shadow schema creation)
- ✅ Data backfill queries (QuestionDictionary → QuestionRevision)
- ✅ Validation queries (parity checks)
- ✅ Rollback procedures

### 3. Performance Harness (AGENT-1)
- ✅ Workload A test script (form rendering)
- ✅ Workload B test script (snapshot creation)
- ✅ Workload C test script (stale detection at scale)
- ✅ Baseline measurement tools
- ✅ Metrics collection and reporting

### 4. Validation Report (Both)
- ✅ Performance validation results
- ✅ Data integrity verification
- ✅ Migration success/failure analysis
- ✅ Risk assessment
- ✅ Go/no-go recommendation

### 5. Executive Summary (Both)
- ✅ Phase 0 results summary
- ✅ Architecture decision rationale
- ✅ Performance targets vs actuals
- ✅ Phase 1 readiness assessment
- ✅ User approval request

---

## Week 1: Architecture Alignment (Days 1-2)

### AGENT-2 Deliverables

**1. Architecture Document v2**
- File: `docs/claude-architecture-FINAL-synthesis-v2.md`
- Status: ✅ COMPLETE
- Contents:
  - QuestionRevision schema with immutability guarantees
  - Revised success metrics (honest about admin role)
  - Performance targets (not promises)
  - Updated answer storage (revisionId vs version number)
  - Stale detection with 100% guarantee

**2. Question Version Policy**
- File: `docs/question-version-policy.md`
- Status: ✅ COMPLETE (CORRECTED - see note below)
- Contents:
  - Decision matrix (version bump vs no bump)
  - Examples: typo fix, scope change, meaning change
  - Admin workflow documentation
  - Stakeholder communication templates
- **IMPORTANT CORRECTION**: Policy updated to reflect immutable QuestionRevision approach
  - ALL changes create new QuestionRevision rows (both version and non-version changes)
  - Difference: Version number increments only for significant changes
  - `changeLog` is read-only/auto-maintained (admins do NOT manually edit)

**3. Phase 0 Validation Plan**
- File: `docs/phase-0-validation-plan.md`
- Status: ✅ COMPLETE (this document)

### AGENT-1 Deliverables

**1. Prisma Schema with QuestionRevision**
- File: `prisma/schema.prisma` (updated)
- Contents:
  ```prisma
  model QuestionRevision {
    id                String   @id @default(cuid())
    questionKey       String
    versionNumber     Int
    label             String
    helpText          String?
    options           Json?
    validation        Json?
    createdAt         DateTime @default(now())
    createdBy         String
    changeReason      String?
    significantChange Boolean  @default(true)
    dictionaryId      String
    dictionary        QuestionDictionary @relation(fields: [dictionaryId], references: [id])

    @@unique([questionKey, versionNumber])
    @@index([questionKey])
    @@index([dictionaryId])
    @@map("question_revisions")
  }

  model QuestionDictionary {
    id                String   @id @default(cuid())
    key               String   @unique
    currentVersion    Int      @default(1)
    currentRevisionId String
    currentRevision   QuestionRevision @relation("CurrentRevision", fields: [currentRevisionId], references: [id])
    revisions         QuestionRevision[]
    changeLog         Json     @default("[]")  // DEPRECATED
    // ... other fields
  }
  ```

**2. Migration Scripts Outline**
- Phase 0a: Shadow schema creation
- Phase 0a: Backfill scripts
- Phase 0b: Validation queries
- Phase 0c: Feature flag logic

### Cross-Review Checklist

**Both agents review**:
- [ ] Schema matches architecture document
- [ ] All FK constraints defined
- [ ] Indexes appropriate for query patterns
- [ ] Migration scripts are reversible
- [ ] Documentation is consistent
- [ ] No contradictions between docs

---

## Week 1: Performance Validation (Days 3-5)

### Workload Definitions

#### Workload A: Form Rendering (Read Path)

**Purpose**: Measure time to load form with stale answer detection

**Test Scenario**:
```typescript
// Setup
- 1 technology with triageStage data
- 50 questions in form template
- 40 answers in extendedData
- 5 answers are stale (old questionRevisionId)

// Execute
1. Load form template with all questions
2. Load technology with answers
3. For each question, detect answer status (CURRENT/STALE/MISSING)
4. Render form with warnings

// Measure
- Total execution time (server-side)
- Database query count
- Database query time
- Memory usage
```

**Target**: <1 second (server-side rendering)
**Acceptance Criteria**: 95th percentile <1.5s

**Test Code Outline**:
```typescript
async function workloadA_FormRendering() {
  const iterations = 100;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    // Load form with stale detection
    const form = await renderFormForTechnology(techId, templateId);

    const end = performance.now();
    times.push(end - start);
  }

  return {
    mean: average(times),
    p50: percentile(times, 50),
    p95: percentile(times, 95),
    p99: percentile(times, 99),
    max: Math.max(...times)
  };
}
```

---

#### Workload B: Snapshot Creation (Write Path)

**Purpose**: Measure time to create snapshot with full form structure

**Test Scenario**:
```typescript
// Setup
- 1 technology with complete data
- Form template with 50 questions (3 sections)
- 40 answered questions
- 10 unanswered questions

// Execute
1. Serialize technology data
2. Serialize triageStage with extendedData
3. Serialize complete form template (all questions)
4. Load current revisions for all questions
5. Write snapshot to database

// Measure
- Total execution time
- Snapshot JSON size
- Database write time
- Memory usage
```

**Target**: <2 seconds for typical technology (50Q, 40A)
**Acceptance Criteria**: 95th percentile <3s

**Test Code Outline**:
```typescript
async function workloadB_SnapshotCreation() {
  const iterations = 100;
  const times: number[] = [];
  const sizes: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    // Create snapshot
    const snapshot = await createSnapshot(techId, templateId, "Test Snapshot", "Performance test", userId);

    const end = performance.now();
    times.push(end - start);

    // Measure snapshot size
    const snapshotJson = JSON.stringify(snapshot.dataSnapshot);
    sizes.push(Buffer.byteLength(snapshotJson, 'utf8'));
  }

  return {
    timing: {
      mean: average(times),
      p95: percentile(times, 95),
      max: Math.max(...times)
    },
    size: {
      mean: average(sizes),
      max: Math.max(...sizes)
    }
  };
}
```

---

#### Workload C: Stale Detection at Scale (Batch Operations)

**Purpose**: Measure time to scan all technologies for stale answers

**Test Scenario**:
```typescript
// Setup
- 100 technologies in database
- Each technology has 40 answers
- 5 answers per technology are stale (500 total stale answers)

// Execute
1. Load all technologies
2. Load all form templates
3. For each technology:
   - Load triageStage.extendedData
   - Load current revisions for all questions
   - Detect stale answers
4. Aggregate results (tech ID, question key, stale count)

// Measure
- Total execution time
- Per-technology time
- Database query count
- Memory usage
```

**Target**: <5 seconds to scan all technologies
**Use Case**: Admin dashboard showing all stale answers

**Test Code Outline**:
```typescript
async function workloadC_StaleDetectionAtScale() {
  const techCount = 100;
  const start = performance.now();

  // Load all technologies (simulate admin dashboard)
  const technologies = await prisma.technology.findMany({
    take: techCount,
    include: { triageStage: true }
  });

  // Load all question dictionaries with current revisions
  const questions = await prisma.questionDictionary.findMany({
    include: { currentRevision: true }
  });

  const staleAnswers: Array<{
    techId: string;
    questionKey: string;
    oldVersion: number;
    currentVersion: number;
  }> = [];

  // Scan each technology for stale answers
  for (const tech of technologies) {
    const answers = tech.triageStage.extendedData as ExtendedData;

    for (const question of questions) {
      const answer = answers[question.key];
      if (answer && answer.questionRevisionId !== question.currentRevision.id) {
        // Stale answer found
        const oldRevision = await prisma.questionRevision.findUnique({
          where: { id: answer.questionRevisionId }
        });

        staleAnswers.push({
          techId: tech.id,
          questionKey: question.key,
          oldVersion: oldRevision.versionNumber,
          currentVersion: question.currentRevision.versionNumber
        });
      }
    }
  }

  const end = performance.now();

  return {
    totalTime: end - start,
    techCount: techCount,
    staleCount: staleAnswers.length,
    avgTimePerTech: (end - start) / techCount
  };
}
```

---

### Performance Report Template

**File**: `docs/phase-0-performance-report.md`

**Structure**:
```markdown
# Phase 0 Performance Validation Report

## Test Environment
- Database: PostgreSQL 14.x
- Node.js: v20.x
- Hardware: [Specs]
- Dataset: [Size description]

## Workload A: Form Rendering
| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Mean   | <1s    | [X]ms  | ✅/❌     |
| P95    | <1.5s  | [X]ms  | ✅/❌     |
| P99    | <2s    | [X]ms  | ✅/❌     |

**Analysis**: [Commentary on results]

## Workload B: Snapshot Creation
| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Mean   | <2s    | [X]ms  | ✅/❌     |
| P95    | <3s    | [X]ms  | ✅/❌     |
| Size   | ~10KB  | [X]KB  | ✅/❌     |

**Analysis**: [Commentary on results]

## Workload C: Stale Detection at Scale
| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Total  | <5s    | [X]ms  | ✅/❌     |
| Per Tech | N/A  | [X]ms  | Info only |

**Analysis**: [Commentary on results]

## Overall Assessment
- All targets met: ✅/❌
- Bottlenecks identified: [List]
- Recommended optimizations: [List]
- Go/no-go for Phase 1: ✅/❌
```

---

## Week 2: Phase 0a - Shadow Schema (Days 6-7)

### Objective

Create QuestionRevision table in dev environment, backfill from existing data, but do NOT use it yet (feature flag OFF).

### Migration Script: Create Shadow Schema

**File**: `prisma/migrations/YYYYMMDD_phase0a_shadow_schema.sql`

```sql
-- Phase 0a: Create QuestionRevision table
-- Feature flag: OFF (app still uses old schema)

BEGIN;

-- Step 1: Create QuestionRevision table
CREATE TABLE question_revisions (
  id TEXT PRIMARY KEY,
  question_key TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  label TEXT NOT NULL,
  help_text TEXT,
  options JSONB,
  validation JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL,
  change_reason TEXT,
  significant_change BOOLEAN NOT NULL DEFAULT true,
  dictionary_id TEXT NOT NULL REFERENCES question_dictionary(id),

  UNIQUE(question_key, version_number)
);

-- Step 2: Create indexes
CREATE INDEX idx_qr_question_key ON question_revisions(question_key);
CREATE INDEX idx_qr_dictionary_id ON question_revisions(dictionary_id);
CREATE INDEX idx_qr_created_at ON question_revisions(created_at);

COMMIT;
```

### Backfill Script: Migrate Existing Data

**File**: `scripts/phase0a-backfill-revisions.ts`

```typescript
/**
 * Backfills QuestionRevision table from existing QuestionDictionary changeLog
 *
 * Strategy:
 * 1. For each QuestionDictionary
 * 2. Parse changeLog JSON array
 * 3. Create QuestionRevision row for each version
 * 4. Link to dictionary via dictionary_id FK
 */

async function backfillQuestionRevisions() {
  const dictionaries = await prisma.questionDictionary.findMany();

  let totalRevisions = 0;

  for (const dict of dictionaries) {
    const changeLog = dict.changeLog as Array<{
      version: number;
      label: string;
      changedAt: string;
      changedBy: string;
      reason?: string;
      significantChange: boolean;
    }>;

    // If changeLog is empty, create initial revision from current state
    if (changeLog.length === 0) {
      await prisma.questionRevision.create({
        data: {
          id: generateCuid(),
          questionKey: dict.key,
          versionNumber: 1,
          label: dict.label,
          helpText: dict.helpText,
          options: dict.options,
          validation: dict.validation,
          createdAt: dict.createdAt,
          createdBy: 'system',
          changeReason: 'Initial migration from legacy schema',
          significantChange: true,
          dictionaryId: dict.id
        }
      });

      totalRevisions++;
      continue;
    }

    // Create revision for each entry in changeLog
    for (const entry of changeLog) {
      await prisma.questionRevision.create({
        data: {
          id: generateCuid(),
          questionKey: dict.key,
          versionNumber: entry.version,
          label: entry.label,
          helpText: dict.helpText,  // ChangeLog may not have helpText, use current
          options: dict.options,    // Same for options
          validation: dict.validation,
          createdAt: new Date(entry.changedAt),
          createdBy: entry.changedBy || 'system',
          changeReason: entry.reason || 'Migrated from changeLog',
          significantChange: entry.significantChange ?? true,
          dictionaryId: dict.id
        }
      });

      totalRevisions++;
    }

    console.log(`✅ Backfilled ${changeLog.length || 1} revisions for ${dict.key}`);
  }

  console.log(`\n✅ Total revisions created: ${totalRevisions}`);
  return totalRevisions;
}
```

### Verification: Shadow Schema Populated

```sql
-- Verify backfill success
SELECT
  COUNT(*) as total_revisions,
  COUNT(DISTINCT question_key) as unique_questions,
  MIN(version_number) as min_version,
  MAX(version_number) as max_version
FROM question_revisions;

-- Expected:
-- - total_revisions > 0
-- - unique_questions = number of questions in QuestionDictionary
-- - min_version = 1
-- - max_version > 1 (if any questions have history)
```

---

## Week 2: Phase 0b - Validation (Days 8-9)

### Objective

Compare legacy data (QuestionDictionary changeLog) with new data (QuestionRevision table) to ensure parity.

### Validation Script: Parity Check

**File**: `scripts/phase0b-validation.ts`

```typescript
/**
 * Validates that QuestionRevision data matches QuestionDictionary changeLog
 */

type ValidationResult = {
  question: string;
  version: number;
  match: boolean;
  legacyLabel: string;
  revisionLabel: string;
  diff?: string;
};

async function validateRevisionParity(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  const dictionaries = await prisma.questionDictionary.findMany({
    include: {
      revisions: {
        orderBy: { versionNumber: 'asc' }
      }
    }
  });

  for (const dict of dictionaries) {
    const changeLog = dict.changeLog as Array<{
      version: number;
      label: string;
    }>;

    // If changeLog empty, check that exactly 1 revision exists
    if (changeLog.length === 0) {
      const revisionCount = dict.revisions.length;
      results.push({
        question: dict.key,
        version: 1,
        match: revisionCount === 1,
        legacyLabel: dict.label,
        revisionLabel: dict.revisions[0]?.label || 'MISSING',
        diff: revisionCount !== 1 ? `Expected 1 revision, found ${revisionCount}` : undefined
      });
      continue;
    }

    // Compare each version
    for (const entry of changeLog) {
      const revision = dict.revisions.find(r => r.versionNumber === entry.version);

      if (!revision) {
        results.push({
          question: dict.key,
          version: entry.version,
          match: false,
          legacyLabel: entry.label,
          revisionLabel: 'MISSING',
          diff: 'Revision not found in QuestionRevision table'
        });
        continue;
      }

      const match = entry.label === revision.label;
      results.push({
        question: dict.key,
        version: entry.version,
        match: match,
        legacyLabel: entry.label,
        revisionLabel: revision.label,
        diff: match ? undefined : `Labels differ: "${entry.label}" vs "${revision.label}"`
      });
    }
  }

  return results;
}

async function generateValidationReport() {
  const results = await validateRevisionParity();

  const failures = results.filter(r => !r.match);
  const total = results.length;
  const failureCount = failures.length;

  console.log(`\n=== Phase 0b Validation Report ===\n`);
  console.log(`Total checks: ${total}`);
  console.log(`Passed: ${total - failureCount} ✅`);
  console.log(`Failed: ${failureCount} ❌\n`);

  if (failureCount > 0) {
    console.log(`Failures:\n`);
    failures.forEach(f => {
      console.log(`❌ ${f.question} v${f.version}`);
      console.log(`   Legacy: "${f.legacyLabel}"`);
      console.log(`   Revision: "${f.revisionLabel}"`);
      console.log(`   Diff: ${f.diff}\n`);
    });
  }

  // Exit criteria: ZERO failures
  const passed = failureCount === 0;
  console.log(`\n✅ Validation ${passed ? 'PASSED' : 'FAILED'}`);

  return { passed, results };
}
```

### Exit Criteria for Phase 0b

**Must pass ALL**:
- ✅ Zero parity check failures
- ✅ All questions have at least 1 revision
- ✅ All versions in changeLog exist in QuestionRevision
- ✅ All labels match exactly
- ✅ FK constraints valid (all dictionary_id references exist)

**If ANY fail**: Fix backfill script, re-run Phase 0a, re-run validation.

---

## Week 2: Phase 0c - Soak Test (Days 10-12)

### Objective

Enable feature flag to use QuestionRevision in non-production environments, monitor for 48 hours, validate stability.

### Feature Flag Setup

**File**: `lib/feature-flags.ts`

```typescript
export const FEATURE_FLAGS = {
  USE_QUESTION_REVISIONS: process.env.FEATURE_USE_QUESTION_REVISIONS === 'true'
} as const;

// Usage in code:
async function getCurrentQuestionRevision(questionKey: string) {
  if (FEATURE_FLAGS.USE_QUESTION_REVISIONS) {
    // NEW: Use QuestionRevision table
    const dict = await prisma.questionDictionary.findUnique({
      where: { key: questionKey },
      include: { currentRevision: true }
    });
    return dict.currentRevision;
  } else {
    // OLD: Use changeLog (legacy)
    const dict = await prisma.questionDictionary.findUnique({
      where: { key: questionKey }
    });
    const latestEntry = dict.changeLog[dict.changeLog.length - 1];
    return {
      label: latestEntry?.label || dict.label,
      versionNumber: dict.currentVersion,
      // ... construct from changeLog
    };
  }
}
```

### Soak Test Schedule

**Day 10-11 (24 hours): Dev Environment**
```bash
# Enable feature flag in dev
export FEATURE_USE_QUESTION_REVISIONS=true

# Restart application
npm run dev

# Monitor:
- Application logs (errors related to QuestionRevision)
- Database query performance
- User-reported issues (if dev is used by team)
```

**Day 11-12 (48 hours): Staging Environment**
```bash
# Enable feature flag in staging
# (via environment variable in deployment config)

# Monitor:
- Application uptime
- Error rate (Sentry, CloudWatch, etc.)
- Performance metrics (response times)
- Database CPU/memory usage
- Stale answer detection accuracy
```

### Monitoring Checklist

**During 48-hour soak test, track**:
- [ ] Zero errors related to QuestionRevision queries
- [ ] Zero null pointer exceptions (missing revisions)
- [ ] Zero FK constraint violations
- [ ] Form rendering time < 1.5s (P95)
- [ ] Snapshot creation time < 3s (P95)
- [ ] No increase in database CPU usage (>10%)
- [ ] No increase in memory usage (>10%)
- [ ] Stale answer detection shows correct warnings

### Rollback Plan

**If ANY critical issue occurs**:
```bash
# Immediate rollback (< 5 minutes)
export FEATURE_USE_QUESTION_REVISIONS=false
# Restart application
# Application falls back to changeLog

# Diagnose issue
# Fix code or schema
# Re-run Phase 0c
```

---

## Exit Criteria (Go/No-Go Gate)

Phase 1 implementation can ONLY proceed if ALL criteria pass:

### 1. Data Integrity ✅

- [ ] All existing questions migrated to QuestionRevision
- [ ] Zero parity check failures in validation
- [ ] FK constraints enforced (cannot delete revisions with answers)
- [ ] Stale detection returns 0 "Unknown" results
- [ ] All historical question text preserved

**Verification Method**:
```sql
-- Check 1: All questions have revisions
SELECT COUNT(*) FROM question_dictionary qd
WHERE NOT EXISTS (
  SELECT 1 FROM question_revisions qr
  WHERE qr.dictionary_id = qd.id
);
-- Expected: 0

-- Check 2: All answers reference valid revisions
-- (Checked via application logic during soak test)

-- Check 3: Stale detection accuracy
-- (Verified via Workload A/C test results)
```

---

### 2. Performance ✅

- [ ] Workload A: 95th percentile <1.5s
- [ ] Workload B: 95th percentile <3s
- [ ] Workload C: Total scan <5s
- [ ] No regression vs baseline (if baseline exists)

**Verification Method**:
- Run performance harness (see Week 1 workloads)
- Compare results to targets
- If targets not met: optimize queries, add indexes, re-test

---

### 3. Operational Readiness ✅

- [ ] Migration scripts tested with rollback
- [ ] Feature flag toggle tested (on/off/on)
- [ ] Monitoring dashboards deployed (if applicable)
- [ ] Runbook documentation complete

**Runbook Contents**:
- How to enable/disable feature flag
- How to check migration status
- How to manually create revision (if needed)
- How to rollback (step-by-step)
- Common errors and fixes

---

### 4. Stakeholder Approval ✅

- [ ] User approves question version policy
- [ ] User approves Phase 0 plan
- [ ] User signs off on performance targets
- [ ] User reviews Phase 0 validation report
- [ ] User authorizes Phase 1 implementation

**Approval Process**:
1. AGENT-1 & AGENT-2 create executive summary
2. Present to user with validation results
3. User reviews and provides feedback
4. Address any concerns
5. User signs off (written approval)

---

## Risk Assessment

### High Risk Items

| Risk | Impact | Mitigation | Contingency |
|------|--------|------------|-------------|
| Performance regression | High | Phase 0c soak test | Optimize queries, add caching |
| Data loss during migration | Critical | Phase 0b parity checks | Rollback, restore from backup |
| FK constraint violations | High | Phase 0b validation | Fix backfill script, re-migrate |
| Feature flag not working | Medium | Test toggle in Phase 0c | Manual code deployment |

### Medium Risk Items

| Risk | Impact | Mitigation | Contingency |
|------|--------|------------|-------------|
| Incomplete backfill | Medium | Automated validation | Manual data correction |
| Stale detection false positives | Low | Test with real data | Adjust detection logic |
| Admin confusion on policy | Low | Training + documentation | 1-on-1 support |

### Low Risk Items

| Risk | Impact | Mitigation | Contingency |
|------|--------|------------|-------------|
| changeLog deprecation missed | Low | Code review | Update during Phase 1 |
| Documentation out of sync | Low | Cross-review | Update docs |

---

## Success Metrics for Phase 0

At end of Phase 0, we should have:

✅ **Confidence**: Architecture validated with real data
✅ **Evidence**: Performance measurements (not assumptions)
✅ **Safety**: Rollback plan tested
✅ **Alignment**: Stakeholder approval obtained
✅ **Readiness**: All Phase 1 blockers resolved

**Go/No-Go Decision Criteria**:
- **GO**: All exit criteria pass, user approves, no critical risks
- **NO-GO**: ANY exit criteria fail, unresolved critical risks, or user rejects plan

If NO-GO:
1. Document specific failures
2. Create remediation plan
3. Re-run failed phase (0a, 0b, or 0c)
4. Re-evaluate go/no-go

**DO NOT proceed to Phase 1 until GO decision.**

---

## Next Steps After Phase 0

**If Phase 0 passes all exit criteria**:

1. **Executive Summary** - Create 2-page summary for user approval
2. **User Review** - Present findings, request sign-off
3. **Phase 1 Planning** - Create detailed implementation tasks
4. **Kickoff Phase 1** - Begin immutable QuestionRevision implementation

**If Phase 0 fails any exit criteria**:

1. **Root Cause Analysis** - Why did it fail?
2. **Remediation Plan** - How to fix?
3. **Re-run Phase 0** - Validate fixes
4. **Decision Point** - Go/no-go/pivot

---

## Appendix A: Tools and Scripts

### Required Tools

- **PostgreSQL 14+**: Database
- **Node.js v20+**: Runtime
- **Prisma CLI**: Schema management
- **TypeScript**: Type safety
- **Jest**: Testing framework (for harness)
- **Artillery** (optional): Load testing

### Script Locations

```
scripts/
├── phase0a-backfill-revisions.ts    # Backfill QuestionRevision
├── phase0b-validation.ts            # Parity checks
├── phase0c-soak-test.sh             # Enable feature flag + monitor
├── workload-a-form-rendering.ts     # Performance test
├── workload-b-snapshot-creation.ts  # Performance test
├── workload-c-stale-detection.ts    # Performance test
└── rollback-phase0.sh               # Emergency rollback
```

---

## Appendix B: Communication Templates

### Phase 0 Kickoff Email

```
Subject: Phase 0 Validation - Form Versioning Architecture

Hi [Stakeholders],

We're beginning Phase 0 validation for the form versioning architecture. This 2-week validation gate will:

1. Validate QuestionRevision approach with real data
2. Measure performance against targets
3. Ensure migration safety before Phase 1

Timeline:
- Week 1: Architecture finalization + performance testing
- Week 2: Shadow schema + soak test

We'll present results and request go/no-go approval before Phase 1.

Questions? Reply to this email.

Thanks,
[Agent Team]
```

### Phase 0 Completion Report

```
Subject: Phase 0 Results - Ready for Phase 1 Approval

Hi [User],

Phase 0 validation is complete. Summary:

✅ Data Integrity: All checks passed, zero failures
✅ Performance: All targets met (see detailed report)
✅ Soak Test: 48 hours stable, no errors
✅ Stakeholder Review: Question version policy approved

Detailed Report: [link to phase-0-validation-report.md]

Recommendation: PROCEED to Phase 1

Please review and provide approval to begin Phase 1 implementation.

Thanks,
[Agent Team]
```

---

**Document Version**: 1.0
**Date**: 2025-10-17
**Status**: Ready for Execution
**Next Review**: After Phase 0 completion (end of Week 2)
**Approval Required**: User sign-off before Phase 1
