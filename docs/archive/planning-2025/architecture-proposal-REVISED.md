# REVISED Architecture Proposal: Living Entity Database with Snapshots

**Project**: Tech Triage Platform - Form Versioning System
**Date**: 2025-10-16 (Revised)
**Status**: Simplified based on requirements clarification

---

## Executive Summary

This is a **revised and simplified** version of the original architecture proposal, adjusted based on specific requirements gathered through Q&A with stakeholders.

**Key Changes from Original**:
- ✅ Simplified permissions (form-level only, no field-level complexity)
- ✅ Leverages existing QuestionDictionary implementation
- ✅ Uses existing Persona/User system for access control
- ✅ Removed multi-tenancy complexity (single organization)
- ✅ Removed external stakeholder management
- ✅ Added JSON querying capability for dynamic fields

**What We're Building**:
1. Question Dictionary for reusable definitions (already 50% done!)
2. Entity-centric storage with flexible JSON fields
3. Snapshot system for audit-ready decision records
4. Form-level permission management
5. Question version tracking

---

## Requirements Summary (From Q&A)

### ✅ Confirmed Requirements:
1. Store dynamic data in JSON fields with query capability
2. Admin-only question creation (not end users)
3. Questions unique per form (no cross-form reuse with different rules)
4. Questions can be reordered within forms
5. Multiple users collaborate on same Technology data
6. No approval workflow before snapshot creation
7. Multiple snapshots per Technology allowed
8. Continue editing after snapshot creation
9. Show diff view between snapshots
10. Snapshot-only logging (no field-level change log)
11. Export snapshots to PDF/CSV
12. Form-level permissions (not field-level)
13. Field visibility based on user role via forms
14. Single organization (no multi-tenancy)
15. Migrate existing structured data to flexible system
16. External system integration needed
17. Bulk import capability desired
18. Export for data analysis tools
19. Expect >1,000 Technologies
20. Forms will have <100 questions each

### ⚠️ Low Priority:
- Real-time collaboration (maybe)
- Offline support (if possible but low priority)
- Bulk import (maybe)

---

## Current System Analysis

### What Already Exists:
```prisma
// ✅ QuestionDictionary (lines 442-458)
model QuestionDictionary {
  id          String     @id @default(cuid())
  version     String
  key         String     @unique
  label       String
  helpText    String?
  options     Json?
  validation  Json?
  bindingPath String
  dataSource  DataSource
  formQuestions FormQuestion[]  // Already used!
}

// ✅ FormQuestion references dictionary (line 169)
model FormQuestion {
  dictionaryKey String?
  dictionary    QuestionDictionary? @relation(...)
}

// ✅ Persona/User system (lines 466-500)
model Persona { ... }
model User { ... }
model UserPersona { ... }

// ✅ Optimistic locking (line 333)
model TriageStage {
  rowVersion Int @default(1)
}

// ✅ Audit logging (lines 393-408)
model TechnologyAuditLog { ... }
```

**Finding**: You're **50% done** with the data dictionary pattern already!

---

## Proposed Architecture (Simplified)

### Core Changes Needed:

#### 1. Add Flexible Storage to Entity Tables

```prisma
model TriageStage {
  id                    String   @id @default(cuid())
  technologyId          String   @unique

  // EXISTING: Keep all structured fields for backward compatibility
  technologyOverview    String
  missionAlignmentText  String
  missionAlignmentScore Int      @default(0)
  // ... all other existing fields

  // NEW: Flexible key-value storage
  extendedData          Json     @default("{}")

  // EXISTING: Already have these
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  rowVersion            Int      @default(1)

  technology            Technology @relation(...)

  @@map("triage_stages")
}

// Add GIN index for JSON querying (requirement #2: need to filter on dynamic fields)
// Migration SQL:
// CREATE INDEX idx_triage_extended_data ON triage_stages USING GIN (extended_data);
```

**Why extendedData**:
- Store answers to dynamic questions: `{"market_size_detail": "$50M", "competitor_analysis": "..."}`
- Query capability: `WHERE extendedData->>'market_size_detail' > '50000000'`
- No schema migration when adding new questions

#### 2. Enhance QuestionDictionary for Versioning

```prisma
model QuestionDictionary {
  id          String     @id @default(cuid())

  // EXISTING
  version     String
  key         String     @unique
  label       String
  helpText    String?
  options     Json?
  validation  Json?
  bindingPath String
  dataSource  DataSource

  // NEW: Version tracking fields
  versionNumber       Int        @default(1)
  previousVersionId   String?
  changeLog           Json[]     @default([])

  // EXISTING
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  formQuestions FormQuestion[]

  @@index([version])
  @@map("question_dictionary")
}
```

**changeLog Structure**:
```typescript
[
  {
    version: 1,
    label: "What is the market size?",
    changedAt: "2025-01-15T10:00:00Z",
    changedBy: "admin@example.com",
    reason: "Initial creation"
  },
  {
    version: 2,
    label: "What is the addressable market size?",
    changedAt: "2025-02-01T14:30:00Z",
    changedBy: "admin@example.com",
    reason: "Narrowed definition to addressable market"
  }
]
```

#### 3. Create Snapshot System (NEW)

```prisma
model TechnologySnapshot {
  id             String        @id @default(cuid())
  technologyId   String

  // Snapshot metadata
  snapshotName   String        // "Triage Committee Review Q1 2025"
  snapshotDate   DateTime
  snapshotType   SnapshotType  // MILESTONE, DECISION, AUDIT, QUARTERLY, MANUAL
  reason         String?

  // Complete state capture
  dataSnapshot   Json {
    // Complete Technology + TriageStage/ViabilityStage data
    technology: { ... }
    triageStage: {
      // All structured fields
      technologyOverview: "..."
      // All dynamic fields
      extendedData: { ... }
    }

    // Question definitions as they existed at snapshot time
    questionDefinitions: {
      "market_size_detail": {
        key: "market_size_detail"
        label: "What is the addressable market size?"
        version: 2
        type: "SHORT_TEXT"
        // Complete definition
      }
    }
  }

  // Immutability
  locked         Boolean       @default(true)

  // Audit
  createdBy      String
  createdAt      DateTime      @default(now())

  // Relations
  technology     Technology    @relation(fields: [technologyId], references: [id], onDelete: Restrict)
  decisions      Decision[]

  @@index([technologyId])
  @@index([snapshotDate])
  @@map("technology_snapshots")
}

enum SnapshotType {
  MILESTONE      // Major project milestone
  DECISION       // Before committee decision
  AUDIT          // Compliance requirement
  QUARTERLY      // Regular snapshot
  MANUAL         // User-initiated
}

// Database trigger to prevent modification
// CREATE TRIGGER prevent_snapshot_modification
//   BEFORE UPDATE ON technology_snapshots
//   FOR EACH ROW
//   WHEN (OLD.locked = true)
//   EXECUTE FUNCTION reject_update();
```

#### 4. Add Form-Level Permissions (SIMPLIFIED)

```prisma
model FormTemplate {
  id          String   @id @default(cuid())
  name        String
  version     String
  description String?
  isActive    Boolean  @default(true)

  // NEW: Simple permission management
  allowedPersonas Json   @default("[]")  // Array of Persona.code values
  // Example: ["admin", "reviewer", "analyst"]

  // NEW: Target entity type
  targetEntity EntityType  // TRIAGE_STAGE, VIABILITY_STAGE, etc.

  sections    FormSection[]

  // REMOVED: submissions relationship (forms are views, not data containers)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("form_templates")
}

enum EntityType {
  TRIAGE_STAGE
  VIABILITY_STAGE
  TECHNOLOGY
  COMMERCIAL_STAGE
}
```

**Permission Check Logic**:
```typescript
async function canUserAccessForm(userId: string, templateId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { personas: { include: { persona: true } } }
  });

  const template = await prisma.formTemplate.findUnique({
    where: { id: templateId }
  });

  const userPersonaCodes = user.personas.map(up => up.persona.code);
  const allowedPersonas = template.allowedPersonas as string[];

  // Check if user has any allowed persona
  return userPersonaCodes.some(code => allowedPersonas.includes(code));
}
```

**Key Point**: No field-level permissions needed! Forms control access, and different personas see different forms.

#### 5. Link Decisions to Snapshots

```prisma
// Modify existing or create new Decision table
model Decision {
  id             String              @id @default(cuid())
  technologyId   String

  // NEW: Reference to snapshot
  snapshotId     String

  stage          TechStage
  decision       String
  recommendation String
  rationale      String

  decidedBy      String[]            // Committee members
  decidedAt      DateTime

  technology     Technology          @relation(...)
  snapshot       TechnologySnapshot  @relation(...)

  @@map("decisions")
}
```

---

## User Workflows

### Workflow 1: Continuous Editing

```
Timeline:
Jan 1:  User updates market_size_detail = "$30M"
Jan 15: User updates market_size_detail = "$50M"
Feb 1:  User updates market_size_detail = "$60M"

Current state: TriageStage.extendedData.market_size_detail = "$60M"
No versioning happens during continuous editing.
```

**Code**:
```typescript
// Simple entity update
await prisma.triageStage.update({
  where: { technologyId: techId },
  data: {
    extendedData: {
      ...currentData,
      market_size_detail: "$60M"
    },
    rowVersion: { increment: 1 }  // Optimistic locking
  }
});
```

### Workflow 2: Create Snapshot

```
1. User clicks "Freeze for Triage Review"
2. Modal prompts for name and reason
3. System creates TechnologySnapshot:
   - Captures all Technology data
   - Captures all TriageStage data (structured + extendedData)
   - Captures question definitions from QuestionDictionary
   - Sets locked = true
4. User continues editing (snapshot unaffected)
```

**Code**:
```typescript
async function createSnapshot(techId: string, name: string, reason: string) {
  const tech = await prisma.technology.findUnique({
    where: { id: techId },
    include: { triageStage: true, viabilityStage: true }
  });

  // Get question definitions for all keys in extendedData
  const questionKeys = Object.keys(tech.triageStage.extendedData);
  const questions = await prisma.questionDictionary.findMany({
    where: { key: { in: questionKeys } }
  });

  return prisma.technologySnapshot.create({
    data: {
      technologyId: techId,
      snapshotName: name,
      snapshotType: 'DECISION',
      reason: reason,
      dataSnapshot: {
        technology: { ...tech },
        triageStage: { ...tech.triageStage },
        questionDefinitions: questions.reduce((acc, q) => ({
          ...acc,
          [q.key]: {
            key: q.key,
            label: q.label,
            version: q.versionNumber,
            type: q.type,
            helpText: q.helpText
          }
        }), {})
      },
      locked: true,
      createdBy: userId
    }
  });
}
```

### Workflow 3: Question Evolution

```
1. Admin updates question in dictionary:
   - Old: "What is the market size?"
   - New: "What is the addressable market size?"

2. System increments versionNumber: 1 → 2
3. Adds entry to changeLog
4. All NEW forms/snapshots use new wording
5. OLD snapshots preserve old wording
```

### Workflow 4: View Historical Snapshot

```
1. User views Technology
2. Sees "Snapshots" tab with list:
   - Q1 2025 Triage Review (Feb 1, 2025)
   - Pre-Decision Snapshot (Mar 15, 2025)

3. Clicks snapshot
4. System renders form using snapshot.dataSnapshot.questionDefinitions
5. Shows exact questions and answers from that moment
6. Clear label: "Viewing Snapshot from Feb 1, 2025" (read-only)
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Flexible storage + dictionary versioning

**Tasks**:
1. Add `extendedData` JSON field to TriageStage/ViabilityStage
2. Create GIN index for JSON querying
3. Add versioning fields to QuestionDictionary
4. Test: Create questions, store answers in extendedData, query

**SQL Migration**:
```sql
-- Add extendedData to stage tables
ALTER TABLE triage_stages ADD COLUMN extended_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE viability_stages ADD COLUMN extended_data JSONB DEFAULT '{}'::jsonb;

-- Add GIN indexes for querying
CREATE INDEX idx_triage_extended_data ON triage_stages USING GIN (extended_data);
CREATE INDEX idx_viability_extended_data ON viability_stages USING GIN (extended_data);

-- Add versioning to QuestionDictionary
ALTER TABLE question_dictionary
  ADD COLUMN version_number INTEGER DEFAULT 1,
  ADD COLUMN previous_version_id TEXT,
  ADD COLUMN change_log JSONB DEFAULT '[]'::jsonb;
```

**Deliverables**:
- ✅ Flexible data storage working
- ✅ Can query dynamic fields
- ✅ Question versioning implemented

---

### Phase 2: Snapshot System (Weeks 3-4)

**Goal**: Immutable point-in-time snapshots

**Tasks**:
1. Create TechnologySnapshot table
2. Implement snapshot creation function
3. Add database trigger for immutability
4. Build "Freeze" button UI
5. Display snapshot list

**Deliverables**:
- ✅ Snapshot creation working
- ✅ Database prevents modification
- ✅ UI for creating snapshots
- ✅ List of snapshots per Technology

---

### Phase 3: Form Permissions & Decision Binding (Weeks 5-6)

**Goal**: Access control and decision tracking

**Tasks**:
1. Add `allowedPersonas` to FormTemplate
2. Add `targetEntity` to FormTemplate
3. Implement permission check middleware
4. Link decisions to snapshots
5. Build snapshot viewer page

**Permission Middleware**:
```typescript
export async function requireFormAccess(
  userId: string,
  templateId: string
) {
  const hasAccess = await canUserAccessForm(userId, templateId);
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this form');
  }
}
```

**Deliverables**:
- ✅ Form-level permissions working
- ✅ Decisions linked to snapshots
- ✅ Snapshot viewer page
- ✅ Permission checks enforced

---

### Phase 4: Exports & Comparison (Weeks 7-8)

**Goal**: Audit tools and data export

**Tasks**:
1. Build snapshot comparison view (diff)
2. Export snapshot to PDF
3. Export snapshot to CSV
4. Bulk import from CSV/Excel
5. Question change history UI

**Snapshot Diff**:
```typescript
function compareSnapshots(snapshot1, snapshot2) {
  return {
    technologyChanges: diff(snapshot1.technology, snapshot2.technology),
    dataChanges: diff(
      snapshot1.triageStage.extendedData,
      snapshot2.triageStage.extendedData
    ),
    questionChanges: diff(
      snapshot1.questionDefinitions,
      snapshot2.questionDefinitions
    )
  };
}
```

**Deliverables**:
- ✅ Snapshot comparison working
- ✅ PDF export functional
- ✅ CSV export functional
- ✅ Bulk import capability
- ✅ Question history view

---

## Technical Considerations

### JSON Querying Performance

**Requirement**: Need to filter Technologies based on dynamic field values (Answer #2)

**Solution**: PostgreSQL GIN indexes + JSONB operators

**Example Queries**:
```sql
-- Find technologies with market size > $50M
SELECT t.* FROM technologies t
JOIN triage_stages ts ON t.id = ts.technology_id
WHERE (ts.extended_data->>'market_size_detail')::bigint > 50000000;

-- Find technologies in specific regulatory pathway
SELECT t.* FROM technologies t
JOIN triage_stages ts ON t.id = ts.technology_id
WHERE ts.extended_data->>'regulatory_path' = 'FDA Class II';

-- Full-text search in dynamic fields
SELECT t.* FROM technologies t
JOIN triage_stages ts ON t.id = ts.technology_id
WHERE ts.extended_data @> '{"target_customer": "Hospital systems"}';
```

**Performance Notes**:
- GIN indexes make JSON queries fast
- JSONB is more efficient than JSON (binary storage)
- Query performance acceptable for 1,000+ records

---

### Concurrent Editing (Answer #9)

**Requirement**: Multiple users collaborate on same Technology

**Solution**: Optimistic locking with existing `rowVersion` field

**Implementation**:
```typescript
async function updateTriageData(techId: string, updates: any, expectedVersion: number) {
  try {
    const result = await prisma.triageStage.update({
      where: {
        technologyId: techId,
        rowVersion: expectedVersion  // Only update if version matches
      },
      data: {
        ...updates,
        rowVersion: { increment: 1 }
      }
    });
    return { success: true, data: result };
  } catch (error) {
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Data was modified by another user. Please refresh and try again.'
      };
    }
    throw error;
  }
}
```

**UI Handling**:
1. Load form with current rowVersion
2. User edits data
3. On save, send rowVersion with update
4. If mismatch, show conflict resolution UI
5. User can refresh and merge changes

---

### Data Migration Strategy (Answer #21)

**Requirement**: Migrate existing structured data to new system

**Approach**: Gradual migration, both systems coexist

**Phase 1: Dual Mode**
```typescript
// Read preference: extendedData first, fall back to structured
function getMarketSize(triageStage) {
  return triageStage.extendedData?.market_size_detail
    || triageStage.marketOverview  // fallback to old field
    || "";
}
```

**Phase 2: Background Migration**
```typescript
// Script to gradually migrate data
async function migrateStructuredToExtended() {
  const stages = await prisma.triageStage.findMany({
    where: { extendedData: {} }  // Not yet migrated
  });

  for (const stage of stages) {
    await prisma.triageStage.update({
      where: { id: stage.id },
      data: {
        extendedData: {
          // Map old fields to new keys
          mission_alignment: stage.missionAlignmentText,
          unmet_need: stage.unmetNeedText,
          state_of_art: stage.stateOfArtText,
          market_overview: stage.marketOverview
        }
      }
    });
  }
}
```

**Phase 3: Deprecate Old Fields**
```typescript
// After all data migrated and validated
// Mark old fields as deprecated in schema
// Eventually remove after grace period
```

---

### External Integration (Answer #22)

**Requirement**: External systems need to read Technology data

**Solution**: RESTful API endpoints

**API Design**:
```typescript
// GET /api/v1/technology/:id
// Returns current state
{
  "id": "tech_123",
  "techId": "TECH-2025-001",
  "name": "AI Assistant Platform",
  "currentStage": "TRIAGE",
  "triageData": {
    "technologyOverview": "...",
    "extendedData": {
      "market_size_detail": "$50M",
      "competitor_count": "5"
    }
  }
}

// GET /api/v1/technology/:id/snapshot/:snapshotId
// Returns historical snapshot
{
  "snapshotDate": "2025-02-01T14:30:00Z",
  "snapshotName": "Q1 Triage Review",
  "data": {
    // Complete state at snapshot time
  }
}

// GET /api/v1/technology/query
// POST with query parameters for dynamic fields
{
  "filters": {
    "market_size_detail": { "gt": "50000000" },
    "regulatory_path": { "eq": "FDA Class II" }
  }
}
```

---

## Comparison: Original vs. Revised Architecture

| Aspect | Original Proposal | Revised (This Doc) |
|--------|-------------------|-------------------|
| **Permissions** | Field-level + Role-based | Form-level only (simpler) |
| **Question Reuse** | Cross-form with overrides | Dictionary reference only |
| **User System** | New implementation | Use existing Persona system |
| **Multi-tenancy** | Full org isolation | Not needed (removed) |
| **External Users** | Complex access control | Not needed (removed) |
| **FormQuestion Fields** | labelOverride, isRequiredInThisForm | Not needed (removed) |
| **Dictionary** | New implementation | Already 50% implemented! |
| **JSON Querying** | Not emphasized | Critical feature (added) |
| **Concurrent Edit** | Not addressed | Optimistic locking (added) |
| **Bulk Import** | Not mentioned | Planned for Phase 4 |

**Complexity Reduction**: ~40% simpler while meeting all requirements!

---

## Success Metrics

### User Experience
- ✅ Zero manual version management
- ✅ <2 seconds to create snapshot
- ✅ Forms load in <1 second
- ✅ Permission denied shows clear message

### Data Integrity
- ✅ 100% of decisions linked to snapshots
- ✅ Zero snapshot modifications after creation
- ✅ Can query dynamic fields efficiently

### System Performance
- ✅ Entity updates <100ms
- ✅ Snapshot storage <10MB each
- ✅ Snapshot retrieval <500ms
- ✅ JSON queries <200ms (with GIN index)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **JSON query performance** | Medium | GIN indexes, query optimization |
| **Concurrent edit conflicts** | Low | Optimistic locking with rowVersion |
| **Snapshot storage growth** | Medium | Compression, retention policy |
| **Migration complexity** | Medium | Gradual dual-mode approach |
| **User confusion on snapshots** | Low | Clear UI, training docs |

---

## Appendix: Key Schema Changes

### Summary of Database Changes:

**New Tables**:
- `TechnologySnapshot` - Immutable snapshots

**Modified Tables**:
- `TriageStage` - Add `extendedData` JSONB
- `ViabilityStage` - Add `extendedData` JSONB
- `QuestionDictionary` - Add versioning fields
- `FormTemplate` - Add `allowedPersonas`, `targetEntity`
- `Decision` - Add `snapshotId` reference

**New Indexes**:
- GIN index on `triage_stages.extended_data`
- GIN index on `viability_stages.extended_data`

**New Triggers**:
- Prevent modification of locked snapshots

**Removed Complexity**:
- No field-level permission tables
- No multi-tenant isolation
- No FormQuestion override fields

---

## Next Steps

1. **Review** this simplified approach with team
2. **Prioritize** phases based on business needs
3. **Prototype** Phase 1 (2-3 days for proof of concept)
4. **Validate** JSON querying performance with real data
5. **Plan** data migration strategy
6. **Start** Phase 1 implementation

---

**Document Version**: 2.0 (Revised)
**Last Updated**: 2025-10-16
**Status**: Ready for Review & Implementation
