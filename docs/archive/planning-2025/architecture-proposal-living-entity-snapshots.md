# Architecture Proposal: Living Entity Database with Point-in-Time Snapshots

**Project**: Tech Triage Platform - Form Versioning System
**Date**: 2025-10-16
**Author**: Based on industry research (REDCap, HL7 FHIR, temporal databases, document versioning systems)

---

## Executive Summary

This proposal outlines an architecture for managing evolving project data with audit-ready snapshots. The system allows users to continuously update information without manual versioning, while providing immutable point-in-time snapshots for decision-making and compliance.

**Key Features**:
- ✅ Users edit freely without thinking about versions
- ✅ Questions reusable across multiple forms
- ✅ Snapshots created on-demand via "Freeze" button
- ✅ Complete audit trail for regulatory/decision compliance
- ✅ Question definitions can evolve without corrupting historical data

---

## Current System Analysis

### Existing Architecture
```
Current State:
├─ FormTemplate (contains question definitions)
├─ FormSection (groups questions)
├─ FormQuestion (individual questions)
├─ FormSubmission (contains answers)
└─ QuestionResponse (individual answers)
```

### Current Problem
Your deletion issue revealed a deeper architectural concern:
- **Problem**: Draft template shows submissions (shouldn't happen)
- **Root Cause**: Templates can receive submissions, then be marked as draft
- **Real Issue**: System doesn't distinguish between:
  - Living documents (continuous editing)
  - Audit snapshots (frozen for decisions)

### User Requirements (From Discussion)
1. ✅ Users update answers continuously as they learn more
2. ✅ No manual version management
3. ✅ Questions shared across multiple forms
4. ✅ "Freeze" button for audit milestones
5. ✅ Forms are views of database entities, not data containers
6. ✅ Need to know "what was asked" when decisions were made

---

## Proposed Architecture

### Core Principle: **Entity-Centric with Shared Question Repository**

```
New Architecture:
├─ QuestionDictionary (reusable question definitions)
├─ Technology (entity with living data)
├─ TechnologySnapshot (frozen point-in-time states)
├─ Decision (references specific snapshot)
└─ FormTemplate (view definitions, not data containers)
```

---

## Detailed Design

### 1. Question Dictionary Pattern

**Purpose**: Define questions once, use everywhere

#### Schema: QuestionDictionary (Enhanced)
```typescript
QuestionDictionary {
  id: string (cuid)
  key: string (unique)           // "market_size", "competitor_count"
  label: string                  // "What is the market size?"
  type: FieldType
  helpText: string?
  placeholder: string?
  options: Json?                 // For select/multi-select
  validation: Json?

  // NEW: Version tracking
  version: number                // Increments when meaning changes
  previousVersionId: string?     // Links to prior definition
  changeLog: Json[]              // History of changes

  // Metadata
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string

  // Relations
  formQuestions: FormQuestion[]  // Where this question is used
}
```

#### Change Log Structure
```typescript
changeLog: [
  {
    version: 1,
    label: "What is the market size?",
    type: "SHORT_TEXT",
    changedAt: "2025-01-15T10:00:00Z",
    changedBy: "user@example.com",
    reason: "Initial creation"
  },
  {
    version: 2,
    label: "What is the addressable market size?",
    type: "SHORT_TEXT",
    changedAt: "2025-02-01T14:30:00Z",
    changedBy: "admin@example.com",
    reason: "Narrowed definition to addressable market"
  }
]
```

**Key Benefits**:
- Single source of truth for question definitions
- Questions reusable across unlimited forms
- Update question label/help text in one place → affects all forms
- Version tracking preserves meaning over time

---

### 2. Entity-Centric Storage

**Purpose**: Data belongs to the entity (Technology), not to form submissions

#### Current Technology Schema (Keep)
```typescript
Technology {
  id: string
  techId: string (unique)
  technologyName: string
  shortDescription: string?
  inventorName: string
  reviewerName: string
  domainAssetClass: string
  currentStage: TechStage
  status: TechStatus

  // Existing relations
  triageStage: TriageStage?
  viabilityStage: ViabilityStage?
  // ... other fields
}
```

#### New: Extend TriageStage with Flexible Data Storage
```typescript
TriageStage {
  id: string
  technologyId: string (unique)

  // EXISTING structured fields (keep for backward compatibility)
  technologyOverview: string
  missionAlignmentText: string
  missionAlignmentScore: number
  // ... other existing fields

  // NEW: Flexible key-value storage for dynamic questions
  extendedData: Json {
    // Answers stored by question key
    "market_size_detail": "$50M annually",
    "target_customer": "Hospital systems",
    "regulatory_path": "FDA Class II",
    // ... extensible without schema migration
  }

  createdAt: DateTime
  updatedAt: DateTime
  rowVersion: number

  technology: Technology
}
```

**Migration Strategy**:
- Keep existing structured fields for backward compatibility
- New dynamic questions stored in `extendedData`
- Gradually migrate structured fields to dictionary over time

---

### 3. Snapshot System (NEW)

**Purpose**: Capture immutable point-in-time states for audit/decision-making

#### Schema: TechnologySnapshot (NEW TABLE)
```typescript
TechnologySnapshot {
  id: string (cuid)
  technologyId: string

  // Snapshot metadata
  snapshotName: string           // "Triage Committee Review Q1 2025"
  snapshotDate: DateTime
  snapshotType: SnapshotType     // MILESTONE, DECISION, AUDIT, QUARTERLY
  reason: string?                // Why this snapshot was created

  // Complete state capture
  dataSnapshot: Json {
    // Copy of all entity data at freeze time
    technology: {
      techId: string
      name: string
      // ... all Technology fields
    },

    triageStage: {
      technologyOverview: string
      extendedData: {...}
      // ... all TriageStage fields
    },

    // Question definitions as they existed at snapshot time
    questionDefinitions: {
      "market_size_detail": {
        key: "market_size_detail"
        label: "What is the addressable market size?"
        version: 2
        type: "SHORT_TEXT"
        helpText: "..."
        // Complete question definition
      },
      // ... all questions used in this snapshot
    }
  }

  // Immutability
  locked: boolean (always true)

  // Audit
  createdBy: string
  createdAt: DateTime

  // Relations
  technology: Technology
  decisions: Decision[]
}

enum SnapshotType {
  MILESTONE      // Major project milestone
  DECISION       // Before committee decision
  AUDIT          // Compliance/audit requirement
  QUARTERLY      // Regular periodic snapshot
  MANUAL         // User-initiated
}
```

**Database Constraint**:
```sql
-- Prevent modification of snapshots
CREATE TRIGGER prevent_snapshot_modification
  BEFORE UPDATE ON technology_snapshots
  FOR EACH ROW
  WHEN (OLD.locked = true)
  EXECUTE FUNCTION reject_update();
```

---

### 4. Decision Binding

**Purpose**: Link decisions to specific frozen states

#### Schema: Decision (Modify Existing or Create New)
```typescript
Decision {
  id: string (cuid)
  technologyId: string

  // NEW: Reference to snapshot evaluated
  snapshotId: string             // Which frozen state was reviewed

  // Decision details
  stage: TechStage               // TRIAGE, VIABILITY, etc.
  decision: string               // "APPROVED", "REJECTED", "CONDITIONAL"
  recommendation: string
  rationale: string

  // Committee/reviewer info
  decidedBy: string[]            // Committee members
  decidedAt: DateTime

  // Relations
  technology: Technology
  snapshot: TechnologySnapshot
}
```

**Key Benefit**: Can always reconstruct exactly what was evaluated:
```typescript
// Get decision context
const decision = await prisma.decision.findUnique({
  where: { id: decisionId },
  include: { snapshot: true }
});

// Snapshot contains:
// - All data as it existed at review time
// - All question definitions as they were worded
// - Complete immutable record for audit
```

---

### 5. Form Templates as Views

**Purpose**: Forms become presentation layers, not data containers

#### Schema: FormTemplate (Modified)
```typescript
FormTemplate {
  id: string
  name: string
  version: string
  description: string?
  isActive: boolean

  // NEW: Template type
  targetEntity: EntityType       // TRIAGE_STAGE, VIABILITY_STAGE, etc.

  sections: FormSection[]

  // Remove: submissions relationship (forms don't "own" data)
}

enum EntityType {
  TRIAGE_STAGE
  VIABILITY_STAGE
  TECHNOLOGY
  COMMERCIAL_STAGE
}

FormSection {
  id: string
  templateId: string
  code: string
  title: string
  description: string?
  order: number

  questions: FormQuestion[]

  template: FormTemplate
}

FormQuestion {
  id: string
  sectionId: string

  // NEW: Reference to dictionary
  dictionaryKey: string          // Links to QuestionDictionary.key

  // Display order in this form
  order: number

  // Optional overrides for this form context
  labelOverride: string?         // Custom label for this form only
  isRequiredInThisForm: boolean

  section: FormSection
  dictionary: QuestionDictionary
}
```

**Rendering Logic**:
```typescript
// When loading form for Technology X
async function loadTechnologyForm(technologyId: string, templateId: string) {
  // 1. Get form template
  const template = await prisma.formTemplate.findUnique({
    where: { id: templateId },
    include: {
      sections: {
        include: {
          questions: {
            include: { dictionary: true }
          }
        }
      }
    }
  });

  // 2. Get entity data
  const tech = await prisma.technology.findUnique({
    where: { id: technologyId },
    include: { triageStage: true }
  });

  // 3. Merge: question definitions + current answers
  return template.sections.map(section => ({
    title: section.title,
    questions: section.questions.map(q => ({
      key: q.dictionary.key,
      label: q.labelOverride || q.dictionary.label,
      type: q.dictionary.type,
      helpText: q.dictionary.helpText,
      currentValue: tech.triageStage?.extendedData[q.dictionary.key] || null
    }))
  }));
}
```

---

## User Workflows

### Workflow 1: Continuous Editing (Normal Operation)

```
User Story: "As a reviewer, I update market information as I learn more"

1. User opens Triage Form for Technology "AI Assistant"
2. System displays:
   - Question: "What is the addressable market size?"
   - Current answer: "$50M annually"

3. User updates answer to "$60M annually" (new research)
4. System saves to: TriageStage.extendedData.market_size_detail = "$60M"
5. No versioning happens - just updates entity

Timeline:
Jan 1:  User enters "$30M"
Jan 15: User updates "$50M"
Feb 1:  User updates "$60M"
Feb 15: User updates "$65M"

Current state always shows: "$65M" (latest knowledge)
```

**Code Example**:
```typescript
// Simple entity update - no versioning
await prisma.triageStage.update({
  where: { technologyId: tech.id },
  data: {
    extendedData: {
      ...currentData,
      market_size_detail: "$60M annually"
    },
    updatedAt: new Date()
  }
});
```

---

### Workflow 2: Freeze for Decision (Create Snapshot)

```
User Story: "As a committee chair, I freeze the current state for triage review"

1. User reviews Technology "AI Assistant"
2. Confirms data is ready for committee review
3. Clicks "Freeze for Triage Committee" button
4. System prompts:
   - Snapshot Name: "Triage Committee Review - Q1 2025"
   - Reason: "Monthly triage evaluation"

5. System creates TechnologySnapshot:
   - Captures ALL Technology data
   - Captures ALL TriageStage data (including extendedData)
   - Captures question definitions from QuestionDictionary
   - Sets locked = true

6. User continues editing Technology after snapshot
   - New edits don't affect the frozen snapshot
   - Snapshot remains immutable for audit
```

**Code Example**:
```typescript
async function createSnapshot(
  technologyId: string,
  snapshotName: string,
  reason: string,
  userId: string
) {
  const tech = await prisma.technology.findUnique({
    where: { id: technologyId },
    include: {
      triageStage: true,
      viabilityStage: true
    }
  });

  // Get all question definitions currently in use
  const questions = await prisma.questionDictionary.findMany({
    where: {
      key: { in: Object.keys(tech.triageStage.extendedData) }
    }
  });

  // Create immutable snapshot
  const snapshot = await prisma.technologySnapshot.create({
    data: {
      technologyId: technologyId,
      snapshotName: snapshotName,
      snapshotDate: new Date(),
      snapshotType: 'DECISION',
      reason: reason,
      dataSnapshot: {
        technology: {
          techId: tech.techId,
          name: tech.technologyName,
          // ... all fields
        },
        triageStage: {
          ...tech.triageStage,
        },
        questionDefinitions: questions.reduce((acc, q) => ({
          ...acc,
          [q.key]: {
            key: q.key,
            label: q.label,
            version: q.version,
            type: q.type,
            helpText: q.helpText,
            options: q.options,
            // Complete definition at this moment
          }
        }), {})
      },
      locked: true,
      createdBy: userId
    }
  });

  return snapshot;
}
```

---

### Workflow 3: Committee Decision

```
User Story: "As a committee, we review the frozen snapshot and make a decision"

1. Committee accesses "Triage Review Queue"
2. Sees Technology "AI Assistant" with snapshot "Q1 2025 Review"
3. Clicks to view snapshot
4. System displays form rendered from snapshot:
   - Shows data exactly as it was at freeze time
   - Shows questions with exact wording from that time
   - Clearly labeled: "Reviewing Snapshot from Feb 1, 2025"

5. Committee discusses and decides: "Approved for Viability Stage"
6. System creates Decision record:
   - Links to specific snapshot
   - Records decision, rationale, committee members

7. Later (March 1), someone asks: "Why was this approved?"
   - Can pull up exact snapshot that was reviewed
   - See exact data and questions used in decision
```

**Code Example**:
```typescript
// View snapshot
async function viewSnapshot(snapshotId: string) {
  const snapshot = await prisma.technologySnapshot.findUnique({
    where: { id: snapshotId }
  });

  // Render form using snapshot data
  return {
    technology: snapshot.dataSnapshot.technology,
    sections: Object.entries(snapshot.dataSnapshot.questionDefinitions).map(
      ([key, definition]) => ({
        question: definition.label,
        answer: snapshot.dataSnapshot.triageStage.extendedData[key],
        askedAt: snapshot.snapshotDate
      })
    )
  };
}

// Record decision
async function recordDecision(snapshotId: string, decisionData) {
  return prisma.decision.create({
    data: {
      technologyId: snapshot.technologyId,
      snapshotId: snapshotId,
      decision: decisionData.decision,
      recommendation: decisionData.recommendation,
      rationale: decisionData.rationale,
      decidedBy: decisionData.committeeMembers,
      decidedAt: new Date()
    }
  });
}
```

---

### Workflow 4: Question Evolution

```
User Story: "As an admin, I need to update question wording to be clearer"

1. Admin reviews question: "What is the market size?"
2. Realizes it's ambiguous - needs to specify "addressable market"
3. Opens QuestionDictionary admin panel
4. Updates question:
   - Old: "What is the market size?"
   - New: "What is the addressable market size?"

5. System:
   - Increments version: 1 → 2
   - Adds to changeLog
   - Sets previousVersionId to link to version 1

6. All forms using this question now show new wording
7. Old snapshots still preserve old wording
   - Snapshot from Jan shows: "What is the market size?"
   - New snapshots show: "What is the addressable market size?"

8. When reviewing old decision, system shows:
   "Question answered: 'What is the market size?' (v1)"
   Not: "What is the addressable market size?" (v2)
```

**Code Example**:
```typescript
async function updateQuestionDefinition(
  questionKey: string,
  newLabel: string,
  reason: string,
  userId: string
) {
  const current = await prisma.questionDictionary.findUnique({
    where: { key: questionKey }
  });

  // Create new version
  await prisma.questionDictionary.update({
    where: { key: questionKey },
    data: {
      label: newLabel,
      version: current.version + 1,
      changeLog: [
        ...current.changeLog,
        {
          version: current.version + 1,
          label: newLabel,
          changedAt: new Date().toISOString(),
          changedBy: userId,
          reason: reason
        }
      ],
      updatedAt: new Date()
    }
  });

  // Old snapshots unaffected - they captured previous definition
}
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Set up Question Dictionary and flexible entity storage

#### Tasks:
1. **Enhance QuestionDictionary table**:
   ```sql
   ALTER TABLE question_dictionary
   ADD COLUMN version INTEGER DEFAULT 1,
   ADD COLUMN previous_version_id TEXT,
   ADD COLUMN change_log JSONB DEFAULT '[]'::jsonb;
   ```

2. **Add flexible storage to TriageStage**:
   ```sql
   ALTER TABLE triage_stages
   ADD COLUMN extended_data JSONB DEFAULT '{}'::jsonb;

   -- Index for performance
   CREATE INDEX idx_triage_extended_data ON triage_stages USING GIN (extended_data);
   ```

3. **Migrate existing questions to dictionary**:
   - Audit all questions across forms
   - Create dictionary entries with unique keys
   - Update FormQuestion to reference dictionary.key

4. **Update form rendering**:
   - Modify form loader to fetch from dictionary
   - Merge with entity data for display
   - Test with existing forms

**Deliverables**:
- ✅ QuestionDictionary with versioning
- ✅ Entity storage with flexible data field
- ✅ Forms successfully rendering from dictionary

---

### Phase 2: Snapshot System (Weeks 3-4)

**Goal**: Implement immutable point-in-time snapshots

#### Tasks:
1. **Create TechnologySnapshot table**:
   ```sql
   CREATE TABLE technology_snapshots (
     id TEXT PRIMARY KEY,
     technology_id TEXT NOT NULL REFERENCES technologies(id),
     snapshot_name TEXT NOT NULL,
     snapshot_date TIMESTAMP NOT NULL,
     snapshot_type TEXT NOT NULL,
     reason TEXT,
     data_snapshot JSONB NOT NULL,
     locked BOOLEAN DEFAULT TRUE,
     created_by TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),

     CONSTRAINT fk_technology FOREIGN KEY (technology_id)
       REFERENCES technologies(id) ON DELETE RESTRICT
   );

   CREATE INDEX idx_snapshots_tech ON technology_snapshots(technology_id);
   CREATE INDEX idx_snapshots_date ON technology_snapshots(snapshot_date);
   ```

2. **Add database trigger for immutability**:
   ```sql
   CREATE OR REPLACE FUNCTION prevent_snapshot_update()
   RETURNS TRIGGER AS $$
   BEGIN
     IF OLD.locked = TRUE THEN
       RAISE EXCEPTION 'Cannot modify locked snapshot';
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER snapshot_immutability
     BEFORE UPDATE ON technology_snapshots
     FOR EACH ROW
     EXECUTE FUNCTION prevent_snapshot_update();
   ```

3. **Implement snapshot creation**:
   - Create server action: `createTechnologySnapshot()`
   - Capture complete entity state
   - Capture question definitions
   - Set locked = true

4. **Build UI**:
   - Add "Freeze" button to technology view
   - Modal for snapshot name and reason
   - Show snapshot creation success
   - List existing snapshots with dates

**Deliverables**:
- ✅ Database schema for snapshots
- ✅ Snapshot creation working
- ✅ Immutability enforced at database level
- ✅ UI for creating snapshots

---

### Phase 3: Decision Binding (Weeks 5-6)

**Goal**: Link decisions to specific snapshots

#### Tasks:
1. **Add snapshot relationship to decisions**:
   ```sql
   ALTER TABLE decisions  -- or create new table
   ADD COLUMN snapshot_id TEXT REFERENCES technology_snapshots(id);
   ```

2. **Create snapshot viewer**:
   - New page: `/technology/[id]/snapshot/[snapshotId]`
   - Render form using snapshot data
   - Show clearly: "Viewing Snapshot from [date]"
   - Display read-only (no editing)

3. **Update decision workflow**:
   - Decision UI shows snapshot date/name
   - Link decision to specific snapshot
   - Store snapshot_id when decision recorded

4. **Build audit view**:
   - Timeline of snapshots
   - Which decisions used which snapshots
   - "What was evaluated?" view

**Deliverables**:
- ✅ Decisions linked to snapshots
- ✅ Snapshot viewer working
- ✅ Audit trail visible
- ✅ Can reconstruct any decision context

---

### Phase 4: Question Versioning (Weeks 7-8)

**Goal**: Track question evolution over time

#### Tasks:
1. **Add version management UI**:
   - Admin panel for QuestionDictionary
   - View change history
   - Update question with reason/note
   - Auto-increment version

2. **Build comparison views**:
   - "Compare snapshots" feature
   - Show what changed between two dates
   - Highlight question definition changes

3. **Add migration tools**:
   - Gradually move structured fields to dictionary
   - Maintain backward compatibility
   - Data migration scripts

4. **Documentation**:
   - User guide for snapshot workflow
   - Admin guide for question management
   - Developer docs for architecture

**Deliverables**:
- ✅ Question versioning working
- ✅ Admin UI for question management
- ✅ Comparison tools
- ✅ Complete documentation

---

## Technical Considerations

### Performance

**Snapshot Storage Size**:
- Concern: Each snapshot stores complete entity + question definitions
- Mitigation:
  - Use JSONB compression in PostgreSQL
  - Only snapshot what's needed (not entire database)
  - Set retention policy (e.g., keep 7 years for compliance)

**Query Performance**:
- Use GIN indexes on JSONB columns
- Snapshot queries rare (audit/review only)
- Entity queries remain fast (no joins to snapshots)

### Data Migration

**Backward Compatibility**:
- Keep existing structured fields in TriageStage/ViabilityStage
- New questions go to `extendedData`
- Gradually migrate old fields over time
- No breaking changes to existing forms

**Migration Strategy**:
```typescript
// Phase 1: Both systems work
triageStage {
  missionAlignmentText: string  // OLD: structured field
  extendedData: {
    mission_alignment_detail: string  // NEW: flexible field
  }
}

// Phase 2: Prefer new system
// Read from extendedData first, fall back to structured

// Phase 3: Deprecate old fields
// Move all data to extendedData
```

### Security

**Snapshot Access Control**:
- Only authorized users can create snapshots
- Snapshots visible to decision-makers
- Audit log of who created snapshots
- Cannot delete snapshots (only archive)

**Data Integrity**:
- Database triggers prevent modification
- Checksums optional for tamper-detection
- Backup strategy for compliance

---

## Testing Strategy

### Unit Tests
- Snapshot creation captures all data
- Immutability triggers work
- Question versioning increments correctly
- Form rendering from dictionary

### Integration Tests
- Complete workflow: edit → freeze → decide
- Question evolution doesn't break old snapshots
- Multiple snapshots per technology
- Snapshot viewer displays correctly

### User Acceptance Testing
1. **Continuous Editing**:
   - User updates market size 10 times
   - Current state always shows latest
   - No versioning friction

2. **Snapshot Creation**:
   - User clicks "Freeze"
   - Snapshot created in <2 seconds
   - User continues editing after freeze

3. **Decision Making**:
   - Committee reviews snapshot
   - Sees exact state at freeze time
   - Decision recorded with snapshot reference

4. **Audit Trail**:
   - Can reconstruct any past decision
   - See what questions were asked
   - Understand why decision was made

---

## Success Metrics

### User Experience
- ✅ Zero manual version management
- ✅ <2 seconds to create snapshot
- ✅ Forms load in <1 second
- ✅ Question changes deploy instantly

### Data Integrity
- ✅ 100% of decisions linked to snapshots
- ✅ Zero snapshot modifications after creation
- ✅ Complete audit trail for 7 years

### System Performance
- ✅ Entity updates <100ms
- ✅ Snapshot storage <10MB per snapshot
- ✅ Snapshot retrieval <500ms

---

## Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Snapshot storage grows too large** | High | Medium | • JSONB compression<br>• Retention policy<br>• Archive old snapshots |
| **Users don't understand snapshot workflow** | Medium | Medium | • Clear UI labels<br>• Training documentation<br>• Onboarding flow |
| **Question changes break forms** | High | Low | • Version tracking<br>• Change approval process<br>• Rollback capability |
| **Migration complexity** | High | Medium | • Phased rollout<br>• Backward compatibility<br>• Extensive testing |
| **Performance degradation** | Medium | Low | • Index optimization<br>• Query monitoring<br>• Caching strategy |

---

## Future Enhancements (Post-MVP)

### Advanced Features
1. **Snapshot Comparison**:
   - "What changed since last review?"
   - Diff view between snapshots
   - Timeline visualization

2. **Collaborative Snapshots**:
   - Multi-user approval before freeze
   - Snapshot review workflow
   - Comments/annotations

3. **Automated Snapshots**:
   - Scheduled snapshots (quarterly)
   - Trigger-based (stage change)
   - Pre-decision auto-freeze

4. **Advanced Audit**:
   - Change attribution (who changed what when)
   - Field-level history between snapshots
   - Export audit reports

5. **Question Library**:
   - Import questions from templates
   - Share questions across projects
   - Question analytics (most used, etc.)

---

## Conclusion

This architecture provides:

✅ **User-Friendly**: No manual versioning, continuous editing
✅ **Audit-Ready**: Complete immutable snapshots for compliance
✅ **Flexible**: Questions reusable, extensible without schema changes
✅ **Maintainable**: Clear separation of concerns, well-documented
✅ **Scalable**: Efficient storage, query performance optimized

The system balances ease of use with regulatory requirements, allowing teams to work naturally while maintaining comprehensive audit trails.

---

## Appendix A: Database Schema (Complete)

```prisma
// Question Dictionary (reusable definitions)
model QuestionDictionary {
  id                 String              @id @default(cuid())
  key                String              @unique
  label              String
  type               FieldType
  helpText           String?
  placeholder        String?
  options            Json?
  validation         Json?

  // Version tracking
  version            Int                 @default(1)
  previousVersionId  String?
  changeLog          Json[]              @default([])

  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  createdBy          String

  formQuestions      FormQuestion[]

  @@map("question_dictionary")
}

// Technology (entity - living data)
model Technology {
  id                 String              @id @default(cuid())
  techId             String              @unique
  technologyName     String
  // ... existing fields ...

  triageStage        TriageStage?
  viabilityStage     ViabilityStage?
  snapshots          TechnologySnapshot[]
  decisions          Decision[]

  @@map("technologies")
}

// Triage Stage (enhanced with flexible storage)
model TriageStage {
  id                    String   @id @default(cuid())
  technologyId          String   @unique

  // Existing structured fields (backward compatibility)
  technologyOverview    String
  missionAlignmentText  String
  missionAlignmentScore Int      @default(0)
  // ... other existing fields ...

  // NEW: Flexible key-value storage
  extendedData          Json     @default("{}")

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  rowVersion            Int      @default(1)

  technology            Technology @relation(fields: [technologyId], references: [id], onDelete: Cascade)

  @@map("triage_stages")
}

// Technology Snapshot (NEW - immutable point-in-time states)
model TechnologySnapshot {
  id             String        @id @default(cuid())
  technologyId   String

  snapshotName   String
  snapshotDate   DateTime
  snapshotType   SnapshotType
  reason         String?

  // Complete state capture
  dataSnapshot   Json          // Contains technology, stages, question definitions

  locked         Boolean       @default(true)
  createdBy      String
  createdAt      DateTime      @default(now())

  technology     Technology    @relation(fields: [technologyId], references: [id], onDelete: Restrict)
  decisions      Decision[]

  @@index([technologyId])
  @@index([snapshotDate])
  @@map("technology_snapshots")
}

enum SnapshotType {
  MILESTONE
  DECISION
  AUDIT
  QUARTERLY
  MANUAL
}

// Decision (linked to specific snapshot)
model Decision {
  id             String              @id @default(cuid())
  technologyId   String
  snapshotId     String              // NEW: References frozen state

  stage          TechStage
  decision       String
  recommendation String
  rationale      String

  decidedBy      String[]
  decidedAt      DateTime

  technology     Technology          @relation(fields: [technologyId], references: [id])
  snapshot       TechnologySnapshot  @relation(fields: [snapshotId], references: [id])

  @@map("decisions")
}

// Form Template (view definitions)
model FormTemplate {
  id          String        @id @default(cuid())
  name        String
  version     String
  description String?
  isActive    Boolean       @default(true)

  targetEntity EntityType   // NEW: What entity this form edits

  sections    FormSection[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // REMOVED: submissions relationship

  @@map("form_templates")
}

enum EntityType {
  TRIAGE_STAGE
  VIABILITY_STAGE
  TECHNOLOGY
  COMMERCIAL_STAGE
}

// Form Section
model FormSection {
  id          String         @id @default(cuid())
  templateId  String
  code        String
  title       String
  description String?
  order       Int

  template    FormTemplate   @relation(fields: [templateId], references: [id], onDelete: Cascade)
  questions   FormQuestion[]

  @@map("form_sections")
}

// Form Question (links section to dictionary)
model FormQuestion {
  id                    String              @id @default(cuid())
  sectionId             String

  dictionaryKey         String              // NEW: References QuestionDictionary.key
  order                 Int

  // Optional overrides for this form
  labelOverride         String?
  isRequiredInThisForm  Boolean             @default(false)

  section               FormSection         @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  dictionary            QuestionDictionary  @relation(fields: [dictionaryKey], references: [key])

  @@index([dictionaryKey])
  @@map("form_questions")
}
```

---

## Appendix B: API Examples

### Create Snapshot
```typescript
POST /api/technology/:id/snapshot

Request:
{
  "snapshotName": "Triage Committee Review - Q1 2025",
  "snapshotType": "DECISION",
  "reason": "Monthly triage evaluation"
}

Response:
{
  "id": "snap_abc123",
  "technologyId": "tech_xyz789",
  "snapshotName": "Triage Committee Review - Q1 2025",
  "snapshotDate": "2025-02-01T14:30:00Z",
  "locked": true,
  "url": "/technology/tech_xyz789/snapshot/snap_abc123"
}
```

### View Snapshot
```typescript
GET /api/technology/:id/snapshot/:snapshotId

Response:
{
  "snapshot": {
    "id": "snap_abc123",
    "snapshotDate": "2025-02-01T14:30:00Z",
    "technology": {
      "techId": "TECH-2025-001",
      "name": "AI Assistant Platform"
    },
    "data": {
      "market_size_detail": "$50M annually",
      "competitor_count": "5 major players",
      // ... all answers at snapshot time
    },
    "questions": {
      "market_size_detail": {
        "label": "What is the addressable market size?",
        "version": 2,
        "type": "SHORT_TEXT"
      },
      // ... question definitions at snapshot time
    }
  }
}
```

### Record Decision
```typescript
POST /api/decision

Request:
{
  "technologyId": "tech_xyz789",
  "snapshotId": "snap_abc123",
  "decision": "APPROVED",
  "recommendation": "Proceed to Viability Stage",
  "rationale": "Strong market potential, clear competitive advantage...",
  "decidedBy": ["john@example.com", "jane@example.com"]
}

Response:
{
  "id": "dec_def456",
  "technologyId": "tech_xyz789",
  "snapshotId": "snap_abc123",
  "decision": "APPROVED",
  "decidedAt": "2025-02-05T10:00:00Z",
  "snapshot": {
    "url": "/technology/tech_xyz789/snapshot/snap_abc123"
  }
}
```

---

## Appendix C: Architecture Patterns Explained

### 1. Data Dictionary Pattern
**What it means**: Centralized repository of reusable field definitions.

**Real-world examples**:
- REDCap research platform
- HL7 FHIR healthcare standards
- Salesforce custom fields

**Benefits**:
- Define once, use everywhere
- Update in one place affects all forms
- Consistent definitions across system

---

### 2. Entity-Centric Storage
**What it means**: Data belongs to the entity, not to form submissions.

**Real-world examples**:
- Salesforce objects
- CRM contact records
- Medical patient records

**Benefits**:
- Single source of truth
- Forms are just views
- No duplicate data

---

### 3. Snapshot on Demand
**What it means**: Continuous editing with explicit snapshot creation.

**Real-world examples**:
- Google Docs named versions
- Confluence page snapshots
- Git commits (explicit versioning)

**Benefits**:
- Users edit freely
- Snapshots only when needed
- No version management overhead

---

### 4. Bitemporal History
**What it means**: Track when things happened vs. when we learned about them.

**Real-world examples**:
- Financial audit systems
- Insurance policy history
- Tax filing corrections

**Benefits**:
- Can answer "what did we know when"
- Support retroactive corrections
- Complete audit trail

---

### 5. Slowly Changing Dimensions
**What it means**: Track changes to definitions/categories over time.

**Real-world examples**:
- Product category changes
- Organization structure changes
- Question wording evolution

**Benefits**:
- Historical data remains meaningful
- Can reconstruct original context
- Supports data evolution

---

**Document Version**: 1.0
**Last Updated**: 2025-10-16
**Status**: Proposal - Ready for Review
