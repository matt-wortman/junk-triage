# Tech Triage Platform Rebuild - Project Notes

**Date Started:** 2025-10-10
**Goal:** Rebuild the Tech Triage Platform using the correct architecture (Form.io/SurveyJS + simple domain model)
**Comparison Target:** Current 15K+ line custom solution

---

## Current System Analysis

### What Exists Now
- **Location:** `/home/matt/code_projects/Junk/tech-triage-platform/`
- **Code Size:** 15,513 lines of TypeScript
- **Documentation:** 58 files, 17,786 lines
- **Architecture:** Custom dynamic form engine with complex domain model

### Current System Strengths
1. ✅ **Good TypeScript usage** - Proper type safety
2. ✅ **Well-structured Prisma schema** - Clean relational model
3. ✅ **Proper git practices** - `.env*` files are gitignored (secrets are safe)
4. ✅ **Cascade deletes** - Referential integrity handled correctly
5. ✅ **Works** - The system does function (when it doesn't lose data)

### Current System Problems
1. ❌ **Reinvented form engine** - Custom 15K line solution vs using Form.io/SurveyJS
2. ❌ **Complexity overload** - Dual form systems, triple deployment modes, question dictionaries
3. ❌ **YAGNI violations** - Built for hypothetical future needs (5 stages, personas, calculated metrics DSL)
4. ❌ **No authentication** - Still not implemented after 6+ months
5. ❌ **High maintenance burden** - Bus factor of 1-2 developers
6. ❌ **Data loss incident** - Production data was lost and required recovery
7. ❌ **Over-engineered** - 58 documentation files trying to explain the complexity

### Correction: Security Assessment
**Status: PARTIAL** - Not as bad as initial assessment suggested:
- ✅ Secrets ARE properly gitignored (`.gitignore` line 35: `.env*`)
- ✅ Not committing credentials to version control
- ❌ Still no authentication system implemented
- ❌ No Azure Key Vault (using plain env vars)
- ⚠️ Custom authorization system (untested for security)

---

## Rebuild Project Specifications

### Project Location
**New Directory:** `/home/matt/code_projects/Junk/tech-triage-rebuild/`
- Fresh start, clean architecture
- Can reference old system for requirements/UI
- Side-by-side comparison possible

### Technology Stack (Simplified)

#### Option A: Form.io (Commercial/Open Source)
```
Frontend:  Next.js 15 + TypeScript
Forms:     Form.io (self-hosted open source OR cloud)
Database:  PostgreSQL + Prisma
Auth:      Simple email/password (NextAuth later when Azure AD available)
Hosting:   Azure (same as current)
```

**Form.io Pros:**
- ✅ Enterprise-grade, 10+ years production use
- ✅ Visual form designer (no code changes for form updates)
- ✅ Built-in conditional logic, calculations, validation
- ✅ PDF export built-in
- ✅ Repeatable groups native support
- ✅ Self-hostable (open source core)
- ✅ Can upgrade to enterprise if needed

**Form.io Cons:**
- ⚠️ Learning curve for Form.io API
- ⚠️ Less flexibility than custom (constrained by platform)
- ⚠️ Enterprise features require license (~$20K/year)

#### Option B: SurveyJS (Open Source)
```
Frontend:  Next.js 15 + TypeScript
Forms:     SurveyJS (MIT licensed)
Database:  PostgreSQL + Prisma
Auth:      Simple email/password (NextAuth later)
Hosting:   Azure
```

**SurveyJS Pros:**
- ✅ Completely free (MIT license)
- ✅ TypeScript-first
- ✅ Great React integration
- ✅ All features needed (conditional logic, calculations, etc.)
- ✅ Visual designer (SurveyJS Creator)
- ✅ No vendor lock-in

**SurveyJS Cons:**
- ⚠️ Smaller ecosystem than Form.io
- ⚠️ Community support only (no commercial backing)
- ⚠️ May need more custom integration work

### Decision: Start with SurveyJS
**Rationale:**
- Free and open source
- No license costs
- Great TypeScript support
- Can always migrate to Form.io if needed
- Sufficient for current requirements

---

## Simplified Architecture

### The Correct Way
```
┌─────────────────────────────────────────┐
│  Next.js Frontend                       │
│  - Simple auth (email/pass for now)    │
│  - SurveyJS form renderer               │
│  - Basic UI (landing page, dashboard)  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Domain Service (TypeScript)            │
│  - Technology CRUD operations           │
│  - Stage progression logic              │
│  - Simple calculations                  │
│  - Basic audit logging                  │
│  Target: ~1,000-2,000 lines total       │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  PostgreSQL (via Prisma)                │
│  - Technology (core table)              │
│  - TriageSubmission (JSON data)         │
│  - ViabilitySubmission (JSON data)      │
│  - AuditLog (simple history)            │
└─────────────────────────────────────────┘
```

### Database Schema (Simplified)

```prisma
// Core domain model
model Technology {
  id          String   @id @default(cuid())
  techId      String   @unique          // "D25-0001"
  name        String                     // "Smart Insulin Pump"
  shortDesc   String?
  inventor    String
  reviewer    String
  domain      String                     // "Medical Device"
  stage       TechStage                  // Current stage
  status      TechStatus @default(ACTIVE)

  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  triage      TriageSubmission?
  viability   ViabilitySubmission?
  audit       AuditLog[]
}

// Triage form data (SurveyJS JSON)
model TriageSubmission {
  id           String   @id @default(cuid())
  technologyId String   @unique
  formData     Json     // Raw SurveyJS submission
  scores       Json?    // Calculated scores

  submittedBy  String
  submittedAt  DateTime @default(now())
  updatedAt    DateTime @updatedAt

  technology Technology @relation(fields: [technologyId], references: [id])
}

// Viability form data (SurveyJS JSON)
model ViabilitySubmission {
  id           String   @id @default(cuid())
  technologyId String   @unique
  formData     Json     // Raw SurveyJS submission
  scores       Json?    // Calculated scores

  submittedBy  String
  submittedAt  DateTime @default(now())
  updatedAt    DateTime @updatedAt

  technology Technology @relation(fields: [technologyId], references: [id])
}

// Simple audit trail
model AuditLog {
  id           String   @id @default(cuid())
  technologyId String
  action       String   // "CREATED", "UPDATED", "STAGE_CHANGED"
  changes      Json?    // What changed
  userId       String
  timestamp    DateTime @default(now())

  technology Technology @relation(fields: [technologyId], references: [id])

  @@index([technologyId, timestamp])
}

// Enums
enum TechStage {
  TRIAGE
  VIABILITY
  COMMERCIAL
  ARCHIVED
}

enum TechStatus {
  ACTIVE
  ON_HOLD
  ABANDONED
  COMPLETED
}
```

**Total Schema Size:** ~100 lines (vs 400+ in current system)

**Key Differences from Current:**
- ❌ No Question Dictionary
- ❌ No Binding Paths
- ❌ No Persona tables
- ❌ No FormTemplate/FormSection/FormQuestion
- ❌ No separate StageHistory + TechnologyAuditLog
- ✅ Just Technology + Stage Submissions + Simple Audit
- ✅ Form definitions stored in SurveyJS JSON (in code or DB)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Basic app with one working form

**Tasks:**
1. Create new Next.js 15 project
2. Install SurveyJS libraries
3. Set up Prisma + PostgreSQL
4. Create simplified schema (Technology + TriageSubmission)
5. Basic auth (simple email/password, no Azure AD yet)
6. Single triage form working

**Deliverables:**
- Can create a Technology
- Can fill out triage form (SurveyJS)
- Form data saves to database
- Can view submitted forms

**Success Metric:** End-to-end flow working

### Phase 2: Multi-Stage (Week 2)
**Goal:** Add viability stage + stage progression

**Tasks:**
1. Add ViabilitySubmission model
2. Create viability form (SurveyJS)
3. Stage progression logic
4. Dashboard to see all technologies + stages

**Deliverables:**
- Triage → Viability flow
- Stage status tracking
- Basic list/detail views

**Success Metric:** Can progress technology through stages

### Phase 3: Polish & Features (Week 3-4)
**Goal:** Reporting, calculations, UI polish

**Tasks:**
1. PDF export (SurveyJS built-in OR simple custom)
2. Calculated scores (simple functions, no DSL)
3. Audit logging
4. UI improvements
5. Responsive design

**Deliverables:**
- Professional-looking UI
- PDF reports
- Audit trail
- Ready for production

**Success Metric:** Feature parity with essential current features

### Phase 4: Comparison & Evaluation (Week 5)
**Goal:** Side-by-side comparison with current system

**Tasks:**
1. Import sample data from current system
2. Performance testing
3. User acceptance testing
4. Documentation
5. Comparison metrics

**Deliverables:**
- Comparison report
- Recommendation document
- Migration plan (if proceeding)

---

## Success Metrics

### Code Metrics (Target vs Current)

| Metric | Current System | Target Rebuild | Improvement |
|--------|---------------|----------------|-------------|
| Lines of code | 15,513 | ~2,000 | 87% reduction |
| Documentation lines | 17,786 | ~500 | 97% reduction |
| TypeScript files | 84 | ~20 | 76% reduction |
| Database models | 20+ | 7 | 65% reduction |
| Deployment modes | 3 | 1 | 67% simpler |

### Feature Parity

| Feature | Current | Rebuild | Notes |
|---------|---------|---------|-------|
| Multi-stage forms | ✅ | ✅ | Triage + Viability |
| Conditional logic | ✅ | ✅ | SurveyJS native |
| Auto-calculations | ✅ | ✅ | Simple functions |
| Repeatable groups | ✅ | ✅ | SurveyJS native |
| PDF export | ✅ | ✅ | SurveyJS or custom |
| Audit logging | ✅ | ✅ | Simplified |
| Authentication | ❌ | ✅ | Simple email/pass |
| Role-based access | ❌ | Later | Not phase 1 |
| Form builder UI | ✅ | ✅ | SurveyJS Creator |

### Non-Functional Metrics

| Metric | Current | Target | Notes |
|--------|---------|--------|-------|
| Onboarding time | 2-4 weeks | 2-3 days | 90% faster |
| Bus factor | 1-2 devs | 5+ devs | Lower risk |
| Security posture | Weak | Standard | Battle-tested libs |
| Maintenance burden | High | Low | Mature libraries |
| Development time | 6+ months | 4-6 weeks | 75% faster |

---

## Key Principles for Rebuild

### DO:
1. ✅ **Use existing libraries** - SurveyJS for forms, don't build custom
2. ✅ **Keep it simple** - Solve today's problems, not tomorrow's hypotheticals
3. ✅ **YAGNI** - You Aren't Gonna Need It (no personas, no metrics DSL, no question dictionary)
4. ✅ **Direct mapping** - Form fields → JSON → database, no indirection
5. ✅ **One deployment mode** - Prisma Dev Server locally, PostgreSQL in Azure
6. ✅ **Minimal abstractions** - Only create abstractions when needed 3+ times
7. ✅ **Authentication first** - Even simple auth better than none
8. ✅ **Document decisions** - WHY we made choices, not HOW to use the system

### DON'T:
1. ❌ **Build custom form engine** - That's what we're fixing
2. ❌ **Create metadata layers** - No question dictionaries, no binding paths
3. ❌ **Design for scale** - 100 users, not 1M users
4. ❌ **Premature optimization** - Optimize when measurements show need
5. ❌ **Complex authorization** - Start simple, add roles later if needed
6. ❌ **Multiple form systems** - ONE system, database-driven from day 1
7. ❌ **Over-document** - Code should be self-explanatory
8. ❌ **Gold-plate** - Ship MVP, iterate based on feedback

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SurveyJS limitations | Medium | Medium | Can switch to Form.io if needed |
| Data migration complexity | Low | Medium | Keep JSON simple, straightforward mapping |
| User resistance to change | Medium | High | Side-by-side comparison, show benefits |
| Missing critical feature | Low | High | Reference current system for requirements |

### Schedule Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SurveyJS learning curve | Medium | Low | Good documentation available |
| Scope creep | High | High | Strict phase boundaries, say NO to extras |
| Underestimated complexity | Low | Medium | Have current system as reference |

---

## Constraints & Assumptions

### Constraints
1. **No Azure AD (yet)** - Will use simple email/password auth initially
2. **Must match current UI/UX** - Users expect similar experience
3. **Azure deployment** - Same hosting environment as current
4. **PostgreSQL** - Same database technology

### Assumptions
1. Current system is authoritative for requirements
2. ~100 users, <1000 submissions/year (low scale)
3. Inventor/reviewer personas sufficient initially
4. PDF export sufficient for reporting needs
5. Can reference current static form for visual design

---

## Next Steps

### Immediate (This Session)
1. ✅ Analysis complete
2. ✅ Notes documented
3. ⏭️ Review with Matt
4. ⏭️ Decide on SurveyJS vs Form.io
5. ⏭️ Create project directory

### Week 1 (Starting)
1. Initialize Next.js project
2. Install SurveyJS libraries
3. Set up Prisma + schema
4. Create first form (triage)
5. Basic CRUD operations

---

## Reference Materials

### Current System Docs to Reference
- `/tech-triage-platform/Triage.pdf` - Original form requirements
- `/tech-triage-platform/src/components/form/` - UI reference (visual design)
- `/tech-triage-platform/docs/PROJECT_OVERVIEW.md` - Business requirements
- `/tech-triage-platform/prisma/schema.prisma` - Current data model (for comparison)

### External Resources
- SurveyJS Documentation: https://surveyjs.io/
- SurveyJS Creator: https://surveyjs.io/create-free-survey
- Form.io Documentation: https://form.io/
- Next.js 15 Docs: https://nextjs.org/docs

---

## Comparison Tracking

### Will Track:
- Development time (hours)
- Lines of code written
- Features completed
- Bugs encountered
- Time to first working version
- Onboarding time for new developer
- User feedback (if possible)

### Comparison Report Template
```markdown
# Rebuild vs Original Comparison

## Development Metrics
- Time: X weeks vs Y months
- Code: X lines vs Y lines
- Files: X vs Y

## Feature Comparison
- [Feature matrix]

## Qualitative Assessment
- Maintainability
- Security
- Performance
- User experience

## Recommendation
[Continue with rebuild OR revert to original]
```

---

## Questions to Resolve

1. **SurveyJS vs Form.io?**
   - Lean toward SurveyJS (free, good enough)
   - Can evaluate both in Week 1

2. **Authentication approach?**
   - NextAuth with credentials provider
   - Prepare for Azure AD later

3. **Deployment strategy?**
   - Docker (same as current)
   - Azure App Service (same as current)

4. **Staging environment?**
   - Use current system's staging?
   - Create new staging environment?

5. **Data migration plan?**
   - Export from current → import to rebuild?
   - Start fresh with sample data?

---

**Status:** Ready to begin
**Next Action:** Review with Matt, decide on tech stack, create project directory
**Estimated Timeline:** 4-6 weeks to feature parity MVP
