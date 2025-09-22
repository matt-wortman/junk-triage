# Dynamic Form System Implementation Plan

## Executive Summary
This plan outlines the transformation of the current hardcoded triage form into a database-driven dynamic form system while preserving all visual design elements and user experience. The new system will enable better data granularity, conditional logic, and form versioning while maintaining the professional appearance users expect.

## Current State Analysis

### What We Have
- **Fully functional hardcoded form** with 9 sections
- **Beautiful UI components** (ScoringComponent, dynamic tables, cards)
- **Working auto-calculation engine** for scores
- **Professional visual design** with CCHMC branding
- **Prisma + PostgreSQL** database setup

### What We Need
- **Database-driven form structure** based on questions_broken_out.txt
- **Dynamic rendering** that preserves visual design
- **Conditional logic** for show/hide fields
- **Granular data collection** for better analytics
- **Form versioning** and management capabilities

## Phase 1: Database Schema Design & Implementation

### 1.1 Form Definition Models

```prisma
model FormTemplate {
  id          String   @id @default(cuid())
  name        String
  version     String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sections    FormSection[]
  submissions FormSubmission[]
}

model FormSection {
  id           String   @id @default(cuid())
  templateId   String
  code         String   // e.g., "F0", "F1"
  title        String   // e.g., "Header and identifiers"
  description  String?
  order        Int
  isRequired   Boolean  @default(true)

  template     FormTemplate @relation(fields: [templateId], references: [id])
  questions    FormQuestion[]
}

model FormQuestion {
  id             String   @id @default(cuid())
  sectionId      String
  fieldCode      String   // e.g., "F0.1", "F1.2.a"
  label          String
  type           FieldType
  helpText       String?
  placeholder    String?
  validation     Json?    // Validation rules
  conditional    Json?    // Show/hide conditions
  order          Int
  isRequired     Boolean  @default(false)

  section        FormSection @relation(fields: [sectionId], references: [id])
  options        QuestionOption[]
  scoringConfig  ScoringConfig?
}

enum FieldType {
  SHORT_TEXT
  LONG_TEXT
  INTEGER
  SINGLE_SELECT
  MULTI_SELECT
  CHECKBOX_GROUP
  DATE
  REPEATABLE_GROUP
  SCORING_0_3
}

model QuestionOption {
  id         String @id @default(cuid())
  questionId String
  value      String
  label      String
  order      Int

  question   FormQuestion @relation(fields: [questionId], references: [id])
}

model ScoringConfig {
  id         String @id @default(cuid())
  questionId String @unique
  minScore   Int    @default(0)
  maxScore   Int    @default(3)
  weight     Float  @default(1.0)
  criteria   Json   // Scoring criteria for each value

  question   FormQuestion @relation(fields: [questionId], references: [id])
}
```

### 1.2 Response Storage Models

```prisma
model FormSubmission {
  id           String   @id @default(cuid())
  templateId   String
  status       SubmissionStatus @default(DRAFT)
  submittedBy  String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  submittedAt  DateTime?

  template     FormTemplate @relation(fields: [templateId], references: [id])
  responses    QuestionResponse[]
  repeatGroups RepeatableGroupResponse[]
  scores       CalculatedScore[]
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  REVIEWED
  ARCHIVED
}

model QuestionResponse {
  id           String @id @default(cuid())
  submissionId String
  questionCode String
  value        Json   // Flexible storage for any response type

  submission   FormSubmission @relation(fields: [submissionId], references: [id])
}

model RepeatableGroupResponse {
  id           String @id @default(cuid())
  submissionId String
  questionCode String
  rowIndex     Int
  data         Json   // Store row data as JSON

  submission   FormSubmission @relation(fields: [submissionId], references: [id])
}

model CalculatedScore {
  id           String @id @default(cuid())
  submissionId String
  scoreType    String // e.g., "impact", "value", "market"
  value        Float
  calculatedAt DateTime @default(now())

  submission   FormSubmission @relation(fields: [submissionId], references: [id])
}
```

## Phase 2: Dynamic Form Renderer Development

### 2.1 Core Rendering Engine

#### Component Architecture
```
DynamicFormRenderer
├── FormProgressBar (existing design)
├── DynamicSection[]
│   ├── Card (existing shadcn component)
│   ├── CardHeader
│   ├── CardContent
│   └── DynamicQuestion[]
│       ├── FieldRenderer (maps to UI components)
│       ├── ValidationDisplay
│       └── ConditionalWrapper
```

#### Field Type Mapping
```typescript
const fieldTypeComponents = {
  SHORT_TEXT: Input,
  LONG_TEXT: Textarea,
  INTEGER: Input,
  SINGLE_SELECT: Select,
  MULTI_SELECT: MultiSelect,
  CHECKBOX_GROUP: CheckboxGroup,
  DATE: DatePicker,
  REPEATABLE_GROUP: DynamicTable,
  SCORING_0_3: ScoringComponent, // Existing beautiful component
};
```

### 2.2 Conditional Logic Engine

```typescript
interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than';
  value: any;
  action: 'show' | 'hide' | 'require';
}

// Example usage in questions_broken_out.txt:
// F2.2.b shows only if Domain includes "Diagnostic"
// F6.3 shows only if F6.2 != "Proceed"
```

### 2.3 Validation Framework

```typescript
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Real-time validation with Zod schemas generated from database
```

## Phase 3: Form Builder & Management

### 3.1 Seed Data Structure

Convert questions_broken_out.txt into seed data:

```typescript
// Example seed for Section 0
const section0 = {
  code: "F0",
  title: "Header and identifiers",
  order: 0,
  questions: [
    {
      fieldCode: "F0.1",
      label: "Technology ID",
      type: "SHORT_TEXT",
      isRequired: true,
      order: 1
    },
    {
      fieldCode: "F0.7",
      label: "Domain or Asset Class",
      type: "SINGLE_SELECT",
      isRequired: true,
      order: 7,
      options: [
        "Medical Device",
        "Therapeutic",
        "Diagnostic",
        "Digital Health",
        "Research Tool",
        "Other"
      ]
    }
  ]
};
```

### 3.2 Form Version Management

- Each FormTemplate has a version field
- Submissions linked to specific template version
- Can have multiple active versions for A/B testing
- Archive old versions but keep for historical data

## Phase 4: Integration & Migration

### 4.1 Server Actions Implementation

```typescript
// /app/actions/form-definitions.ts
export async function getActiveFormTemplate() {
  // Fetch active form template with all sections and questions
}

export async function saveFormResponse(data: FormResponse) {
  // Save or update form submission
  // Handle draft vs final submission
  // Calculate scores if applicable
}

// /app/actions/form-submissions.ts
export async function getFormSubmission(id: string) {
  // Retrieve saved form for editing
}

export async function listFormSubmissions(filters?: FilterOptions) {
  // List user's submissions with status
}
```

### 4.2 Migration Path

1. **Parallel Development**: Build new system alongside existing
2. **Data Migration Script**: Convert existing TriageForm data to new structure
3. **Testing Period**: Run both systems in parallel
4. **Gradual Rollout**: Switch sections one at a time if needed
5. **Full Migration**: Complete switch to dynamic system
6. **Cleanup**: Remove hardcoded components after validation

## Phase 5: Testing & Optimization

### 5.1 Testing Strategy

#### Unit Tests
- Dynamic component rendering
- Conditional logic evaluation
- Validation rule processing
- Score calculations

#### Integration Tests
- Form submission flow
- Data persistence
- Version management
- Migration scripts

#### E2E Tests
- Visual regression testing (ensure UI unchanged)
- Complete form workflow
- Performance under load

### 5.2 Performance Optimization

- **Lazy Loading**: Load sections as needed
- **Caching**: Cache form definitions in memory
- **Query Optimization**: Use Prisma includes efficiently
- **Virtual Scrolling**: For large repeatable groups
- **Debouncing**: For auto-save functionality

## File Structure

```
/tech-triage-platform
├── /prisma
│   ├── schema.prisma (extended with new models)
│   └── /seed
│       ├── form-structure.ts
│       └── initial-data.ts
├── /src
│   ├── /lib
│   │   └── /form-engine
│   │       ├── renderer.tsx
│   │       ├── conditional-logic.ts
│   │       ├── validation.ts
│   │       └── field-mappings.ts
│   ├── /components
│   │   ├── /form (existing components preserved)
│   │   └── /dynamic
│   │       ├── DynamicFormRenderer.tsx
│   │       ├── DynamicSection.tsx
│   │       ├── DynamicQuestion.tsx
│   │       └── FieldRenderer.tsx
│   └── /app
│       ├── /form-dynamic
│       │   └── page.tsx (new dynamic form page)
│       └── /actions
│           ├── form-definitions.ts
│           └── form-submissions.ts
```

## Visual Design Preservation

### Elements to Maintain
- **Card-based layout** with consistent shadows and borders
- **Progress bar** with step indicators at top
- **Color scheme**: CCHMC blue (#2563EB) as primary
- **Typography**: Current font sizes and weights
- **Spacing**: Consistent padding and margins
- **Interactive elements**: Hover states, transitions
- **Scoring visualization**: 0-3 colored buttons with help popovers
- **Matrix visualization**: Impact vs Value quadrant display

### Enhanced Capabilities (While Preserving Design)
- **Conditional fields** with smooth animations
- **Real-time validation** with inline error messages
- **Auto-save indicators** in non-intrusive location
- **Version selector** if multiple forms active
- **Progress persistence** across sessions

## Risk Mitigation

### Technical Risks
- **Data Loss**: Comprehensive backup before migration
- **Performance**: Load testing before production
- **Browser Compatibility**: Test across all target browsers
- **Database Schema**: Careful migration planning

### Business Risks
- **User Confusion**: Maintain exact visual appearance
- **Feature Parity**: Ensure all current features work
- **Rollback Plan**: Keep branch strategy for quick revert
- **Training**: Document any new admin features

## Success Criteria

### Must Have
- ✅ All current form functionality preserved
- ✅ Exact visual appearance maintained
- ✅ No performance degradation
- ✅ Data migration without loss
- ✅ Backward compatibility during transition

### Should Have
- ✅ Conditional logic for fields
- ✅ Better data granularity
- ✅ Form versioning capability
- ✅ Export-friendly data structure
- ✅ Admin management interface

### Nice to Have
- ✅ A/B testing capability
- ✅ Advanced analytics
- ✅ Custom validation rules
- ✅ Multi-language support
- ✅ API for external integration

## Timeline

### Week 1
- **Days 1-2**: Database schema implementation
- **Days 3-5**: Core renderer development

### Week 2
- **Days 6-7**: Seed data and migration scripts
- **Days 8-9**: Integration and server actions
- **Day 10**: Testing and bug fixes

### Week 3 (Buffer)
- **Days 11-12**: Performance optimization
- **Days 13-14**: Documentation and deployment prep

## Conclusion

This plan provides a comprehensive roadmap for transforming the current hardcoded form into a flexible, database-driven system while preserving all visual and functional excellence. The phased approach ensures minimal risk with the ability to rollback at any point. The new system will provide better data analytics capabilities while maintaining the professional user experience that stakeholders expect.