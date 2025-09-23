# Technology Triage Platform - Implementation Plan

## Current State Analysis

### ✅ What's Working
- **Dynamic form engine foundation** is complete with database-driven architecture
- **9 sections** already defined in seed data matching the original PDF structure
- **Field adapters** exist for all major field types (text, select, scoring, checkbox)
- **Form state management** with React Context and reducer pattern
- **API endpoint** successfully loads form templates from database
- **UI components** use existing shadcn/ui components (Input, Textarea, Select, etc.)
- **Database schema** supports dynamic forms with FormTemplate, FormSection, FormQuestion models

### 🔧 Critical Gaps Identified

#### 1. **Limited Question Granularity**
- **Current**: 9 sections with ~18 basic questions
- **Target**: 60+ granular questions from questions_broken_out.txt
- **Missing**:
  - F0.1-F0.7 (Header details)
  - F1.1.a-d, F1.2.a-e (Technology overview & readiness)
  - F2.1-F2.2 (Strategic alignment)
  - F3.1-F3.2 (State of art & IP)
  - F4.1-F4.4 (Market analysis)
  - F5.1-F5.2 (Inventor assessment)
  - F6.1-F6.4 (Final scorecard)

#### 2. **Incomplete Repeatable Groups**
- RepeatableGroupField adapter exists but is just a placeholder
- Need functional competitor table (F4.2.a) with add/remove/edit rows
- Need SME table (F6.4) with dynamic row management
- No data persistence for repeatable groups

#### 3. **No Form Persistence**
- Form submissions not saved to database (TODO comments in code)
- No draft saving despite UI buttons existing
- No form resume/continue capability
- FormSubmission model exists but not used

## Phase 4 Implementation Plan

### Task 1: Enhanced Question Structure (Priority 1)
**Timeline: 1-2 days**

**Objectives:**
1. Update seed data with all 60+ questions from questions_broken_out.txt
2. Implement proper question numbering system (F0.1, F1.1.a, etc.)
3. Add conditional logic for context-dependent questions
4. Test navigation with expanded question set

**Implementation Steps:**
- [ ] Rewrite `prisma/seed/form-structure.ts` with complete question set
- [ ] Map each question from questions_broken_out.txt to proper field types
- [ ] Add validation rules and help text for each question
- [ ] Implement conditional display logic (e.g., F2.2.b only for diagnostics)
- [ ] Update scoring configurations with proper weights
- [ ] Run database reseed and test form loading

**Files to Modify:**
- `prisma/seed/form-structure.ts` - Complete rewrite with 60+ questions
- `src/lib/form-engine/conditional-logic.ts` - Add new conditional rules

### Task 2: Repeatable Group Components (Priority 2)
**Timeline: 2-3 days**

**Objectives:**
1. Create functional RepeatableGroupField adapter
2. Implement competitor table with full CRUD operations
3. Add SME table with dynamic management
4. Wire up to form state management

**Implementation Steps:**
- [ ] Replace placeholder RepeatableGroupField with functional component
- [ ] Create table UI with add/remove row buttons
- [ ] Implement row editing with inline forms
- [ ] Add validation for table data
- [ ] Connect to form state using setRepeatGroupData
- [ ] Test data persistence across form navigation

**Files to Modify:**
- `src/lib/form-engine/fields/FieldAdapters.tsx` - Implement RepeatableGroupField
- `src/components/ui/table.tsx` - Ensure table component is available
- `src/lib/form-engine/types.ts` - Update RepeatableGroupData type if needed

**Competitor Table Fields (F4.2.a):**
- Company (short text)
- Product or Solution (short text)
- Description and Key Features (long text)
- Revenue or Market Share estimate (short text)

**SME Table Fields (F6.4):**
- Name (short text)
- Expertise (short text)
- Contact information (short text)

### Task 3: Form Persistence (Priority 3)
**Timeline: 2-3 days**

**Objectives:**
1. Create submission API endpoints
2. Implement draft saving with auto-save
3. Add form resume capability
4. Create submission history tracking

**Implementation Steps:**
- [ ] Create POST `/api/form-submissions` endpoint
- [ ] Create GET `/api/form-submissions/[id]` endpoint
- [ ] Implement auto-save timer (every 30 seconds)
- [ ] Add draft status management
- [ ] Create submission list page
- [ ] Add resume draft functionality
- [ ] Implement submission finalization

**Files to Create/Modify:**
- `src/app/api/form-submissions/route.ts` - New submission endpoints
- `src/app/api/form-submissions/[id]/route.ts` - Individual submission management
- `src/app/dynamic-form/page.tsx` - Add auto-save and persistence logic
- `src/lib/form-engine/renderer.tsx` - Update to handle saved data

### Task 4: Validation Framework (Priority 4)
**Timeline: 1-2 days**

**Objectives:**
1. Create comprehensive validation schemas
2. Add real-time validation feedback
3. Implement required field indicators
4. Test validation across all field types

**Implementation Steps:**
- [ ] Create Zod schemas for each field type
- [ ] Add validation to form submission
- [ ] Implement real-time field validation
- [ ] Add visual indicators for validation errors
- [ ] Create validation summary component
- [ ] Test edge cases and error handling

**Files to Modify:**
- `src/lib/form-engine/validation.ts` - Expand validation logic
- `src/lib/form-engine/fields/FieldAdapters.tsx` - Add validation display
- `src/lib/form-engine/renderer.tsx` - Integrate validation checks

## Success Metrics

### Phase 4 Completion Criteria
- [ ] All 60+ questions from questions_broken_out.txt implemented
- [ ] Competitor table fully functional with add/remove/edit
- [ ] SME table fully functional with dynamic management
- [ ] Form submissions saved to database
- [ ] Draft auto-save working every 30 seconds
- [ ] Form resume from draft functional
- [ ] Validation working for all field types
- [ ] Navigation smooth with expanded question set

### Quality Checks
- [ ] Form loads without errors
- [ ] All field types render correctly
- [ ] Data persists across section navigation
- [ ] Validation prevents invalid submissions
- [ ] Auto-calculations still work correctly
- [ ] UI matches original hardcoded form appearance

## Technical Considerations

### Database Impact
- Seed data will grow from ~18 to 60+ questions
- More complex conditional logic rules
- Increased data storage for responses
- Need indexes on frequently queried fields

### Performance Considerations
- Lazy load sections to improve initial load
- Optimize API queries with selective includes
- Consider pagination for large repeatable groups
- Implement debounced auto-save

### Testing Requirements
- Unit tests for new validation logic
- Integration tests for form submission
- E2E tests for complete form flow
- Performance testing with full question set

## Risk Mitigation

### Potential Issues & Solutions

1. **Database migration conflicts**
   - Solution: Clean database before reseeding
   - Command: `npx prisma migrate reset`

2. **Form state management complexity**
   - Solution: Keep existing reducer pattern
   - Add logging for debugging state changes

3. **Performance with 60+ questions**
   - Solution: Implement section-based lazy loading
   - Only render current section questions

4. **Validation complexity**
   - Solution: Start with basic validation
   - Incrementally add complex rules

## Next Steps After Phase 4

Once Phase 4 is complete, the platform will be ready for:

1. **Authentication & User Management** (Phase 5)
   - User roles and permissions
   - Form ownership
   - Access control

2. **Advanced Reporting** (Phase 5)
   - PDF generation
   - Analytics dashboard
   - Export functionality

3. **Enterprise Features** (Phase 6)
   - CCHMC SSO integration
   - Workflow automation
   - API development

## Recommended Development Order

1. **Day 1-2**: Task 1 - Enhanced Question Structure
   - Morning: Update seed data
   - Afternoon: Test and debug

2. **Day 3-5**: Task 2 - Repeatable Groups
   - Day 3: Implement component
   - Day 4: Wire to state
   - Day 5: Test and refine

3. **Day 6-8**: Task 3 - Form Persistence
   - Day 6: Create APIs
   - Day 7: Add auto-save
   - Day 8: Test flow

4. **Day 9-10**: Task 4 - Validation
   - Day 9: Create schemas
   - Day 10: Integration testing

Total estimated timeline: **10 working days** for complete Phase 4 implementation.