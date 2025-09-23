# Technology Triage Platform

A sophisticated web application that digitalizes the Cincinnati Children's Hospital Medical Center (CCHMC) technology triage evaluation process. Built with a modern, database-driven architecture supporting both hardcoded and dynamic form implementations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git
- Terminal access

### 1. Start Development Environment

```bash
# Clone and setup (if first time)
cd tech-triage-platform
npm install

# Start both servers (required for full functionality)
npm run dev              # Terminal 1: Web server
npx prisma dev          # Terminal 2: Database server
```

**Access Points:**
- **Web App**: http://localhost:3000
- **Database**: Running on ports 51213-51215
- **Prisma Studio** (optional): `npx prisma studio`

### 2. Available Form Implementations

**Two Completely Separate Form Systems:**

- ✅ **Hardcoded Form**: `/form` - 100% hardcoded, production-ready, NO database usage
- ✅ **Dynamic Form**: `/dynamic-form` - 100% database-driven prototype (needs enhancement)
- ✅ **Landing Page**: `/` - Marketing homepage with design system

## 📊 Current Project Status

### ✅ Phase 1: Foundation (COMPLETED - Production Ready)
- [x] Next.js 14+ with App Router, TypeScript, Tailwind CSS
- [x] Complete design system (#2563EB blue theme, shadcn/ui)
- [x] Prisma ORM with PostgreSQL database
- [x] Landing page with 3D visuals and branding
- [x] Comprehensive database schema (hardcoded + dynamic models)

### ✅ Phase 2: Hardcoded Form System (COMPLETED - Production Ready)
**Location**: `/form` route - **ZERO database usage**
- [x] **Static React components** - all questions hardcoded in TSX files
- [x] **Complete 9-section form** with pixel-perfect UI
- [x] **Auto-calculation engine** replicating Excel scorecard logic
- [x] **All sections implemented**:
  - HeaderSection.tsx, TechnologyOverviewSection.tsx, MissionAlignmentSection.tsx
  - UnmetNeedSection.tsx, StateOfArtSection.tsx, MarketAnalysisSection.tsx
  - DigitalConsiderationsSection.tsx, ScoreRecommendationSection.tsx, SummarySection.tsx
- [x] **Reusable components**: ScoringComponent, dynamic tables, navigation
- [x] **Complete E2E testing** with Playwright validation
- [x] **Production ready** but requires code changes to modify questions

### ✅ Phase 3: Database-Driven Form Engine (COMPLETED - Basic Implementation)
**Location**: `/dynamic-form` route - **100% database-driven**
- [x] **Database schema** with FormTemplate/Section/Question models
- [x] **Dynamic form renderer** with field adapters for all types
- [x] **Form state management** using React Context and reducer
- [x] **API integration** loading form structure from `/api/form-templates`
- [x] **Field adapters**: text, select, scoring, checkbox, repeatable groups
- [x] **Conditional logic engine** for field visibility
- [x] **Seed data** with 9 sections and 18 basic questions (prototype)

### 🔧 Phase 4: Enhanced Dynamic Forms (CURRENT PHASE)
**Status**: Ready for implementation based on NEXT_STEPS.md
- [ ] **Enhanced question structure** - 60+ granular questions (vs current 18)
- [ ] **Functional repeatable groups** - Competitor/SME tables with CRUD
- [ ] **Form persistence** - Draft saving, resume, submission storage
- [ ] **Validation framework** - Comprehensive Zod schema validation

### 📋 Phase 5+: Production Features (PLANNED)
- [ ] Authentication & user management (NextAuth.js)
- [ ] PDF report generation and export
- [ ] Admin dashboard for form management
- [ ] Analytics and submission tracking
- [ ] CCHMC SSO integration

## 🏗️ Software Architecture & Design

### Technology Stack
- **Frontend Framework**: Next.js 14 with App Router
- **Languages**: TypeScript, JavaScript, CSS
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context + useReducer pattern
- **Database ORM**: Prisma with PostgreSQL
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Testing**: Playwright for E2E testing

### Architecture Overview

The platform contains **two completely separate form systems** - one hardcoded and one database-driven:

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
├─────────────────────────────────────────────────────────────┤
│  React Components │  Form State   │  UI Components         │
│  (form sections)  │  Management   │  (shadcn/ui)           │
├─────────────────────────────────────────────────────────────┤
│                  Next.js App Router                         │
├─────────────────────────────────────────────────────────────┤
│     API Routes    │  Server Actions │   Dynamic Renderer   │
│   (form-templates)│   (coming)      │   (Form Engine)      │
├─────────────────────────────────────────────────────────────┤
│                    Prisma ORM                               │
├─────────────────────────────────────────────────────────────┤
│               PostgreSQL Database                           │
│  • TriageForm (hardcoded)  • FormTemplate (dynamic)        │
│  • Competitor data         • FormSection/Question          │
│  • SME data               • FormSubmission                 │
└─────────────────────────────────────────────────────────────┘
```

### Two Separate Form Systems

#### **System 1: Hardcoded Form** (`/form`)
- **React components with hardcoded questions** - all text/labels in TSX files
- **No database interaction** - pure client-side React state
- **Production-ready** with complete 9-section form
- **Requires code changes** to modify any question or text
- **Files**: HeaderSection.tsx, MissionAlignmentSection.tsx, etc.

#### **System 2: Database-Driven Form** (`/dynamic-form`)
- **100% database-driven** - questions loaded from API
- **Field adapters** render UI based on database field types
- **Form engine** with React Context state management
- **Admin configurable** - change questions via database updates
- **Files**: FormEngineProvider, DynamicFormRenderer, FieldAdapters

### Project Structure
```
tech-triage-platform/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── page.tsx                   # Landing page (✅)
│   │   ├── form/page.tsx              # ✅ HARDCODED FORM (no DB)
│   │   ├── dynamic-form/page.tsx      # ✅ DATABASE FORM (100% DB)
│   │   ├── api/form-templates/        # API for dynamic form only
│   │   └── globals.css                # Design system styles
│   ├── components/
│   │   ├── form/                      # HARDCODED form components
│   │   │   ├── HeaderSection.tsx      # ✅ Hardcoded questions
│   │   │   ├── TechnologyOverviewSection.tsx
│   │   │   ├── MissionAlignmentSection.tsx
│   │   │   ├── UnmetNeedSection.tsx
│   │   │   ├── StateOfArtSection.tsx
│   │   │   ├── MarketAnalysisSection.tsx
│   │   │   ├── DigitalConsiderationsSection.tsx
│   │   │   ├── ScoreRecommendationSection.tsx
│   │   │   ├── SummarySection.tsx
│   │   │   ├── ScoringComponent.tsx   # ✅ Shared by both systems
│   │   │   └── DynamicFormNavigation.tsx # For dynamic form only
│   │   └── ui/                        # shadcn/ui components (shared)
│   └── lib/
│       ├── prisma.ts                  # ✅ Database client
│       ├── scoring.ts                 # ✅ Hardcoded form calculations
│       ├── utils.ts                   # Utility functions
│       └── form-engine/               # DATABASE-DRIVEN form system
│           ├── types.ts               # TypeScript definitions
│           ├── renderer.tsx           # ✅ Dynamic form renderer
│           ├── conditional-logic.ts   # Field visibility rules
│           ├── validation.ts          # Validation framework
│           ├── field-mappings-simple.ts
│           └── fields/
│               └── FieldAdapters.tsx  # ✅ Maps DB fields to UI
├── prisma/
│   ├── schema.prisma                  # ✅ Database schema
│   ├── migrations/                    # Database version control
│   └── seed/
│       └── form-structure.ts          # ✅ Dynamic form seed data
├── NEXT_STEPS.md                      # Development roadmap
├── IMPLEMENTATION_PLAN.md             # Detailed Phase 4 plan
├── CLAUDE.md                          # Project context & history
└── package.json                       # Dependencies
```

### Form State Management

#### **Hardcoded Form State**
```typescript
// Uses React state with form navigation
const [currentStep, setCurrentStep] = useState(0);
const [formData, setFormData] = useState<FormData>({...});
```

#### **Dynamic Form State**
```typescript
// Uses React Context + useReducer pattern
interface FormState {
  template: FormTemplateWithSections;
  responses: Record<string, unknown>;
  repeatGroups: Record<string, unknown>;
  currentSection: number;
  isLoading: boolean;
  errors: Record<string, string>;
}
```

### Data Flow

#### **Form Loading**
1. Client requests `/dynamic-form`
2. `useEffect` calls `/api/form-templates`
3. API queries database via Prisma
4. Returns FormTemplate with nested sections/questions
5. FormEngineProvider initializes state
6. DynamicFormRenderer renders current section

#### **User Interaction**
1. User interacts with field component
2. FieldAdapter calls `onChange` handler
3. FormContext `setResponse` updates state
4. Conditional logic re-evaluates field visibility
5. Auto-calculations trigger for scoring fields
6. UI re-renders with updated state

## 🗄️ Database Schema

### **Hardcoded Form Models** (Production Data)
```prisma
model TriageForm {
  id                    String   @id @default(cuid())
  reviewer              String   # Form header
  technologyId          String
  inventorsTitle        String
  domainAssetClass      String

  # Content sections
  technologyOverview    String
  missionAlignmentText  String
  missionAlignmentScore Int      # 0-3 scale
  unmetNeedText         String
  unmetNeedScore        Int      # 0-3 scale
  stateOfArtText        String
  stateOfArtScore       Int      # 0-3 scale
  marketOverview        String
  marketScore           Int      # Auto-calculated

  # Auto-calculated final scores
  impactScore           Float    # (Mission + Need) / 2
  valueScore            Float    # (Art + Market) / 2
  recommendation        String   # "Proceed" | "Alternative"

  # Related data
  competitors           Competitor[]
  experts               SubjectMatterExpert[]
}
```

### **Dynamic Form Models** (Form Engine)
```prisma
model FormTemplate {
  id          String        @id @default(cuid())
  name        String        # "CCHMC Technology Triage Form"
  version     String        # "1.0.0"
  isActive    Boolean       # Multiple versions support
  sections    FormSection[] # Ordered sections
}

model FormSection {
  id          String         @id @default(cuid())
  code        String         # "F0", "F1", "F2"
  title       String         # "Header and Identifiers"
  order       Int            # Display order
  questions   FormQuestion[] # Section questions
}

model FormQuestion {
  id           String          @id @default(cuid())
  fieldCode    String          # "F0.1", "F1.1.a"
  label        String          # "Technology ID"
  type         FieldType       # Enum: SHORT_TEXT, SCORING_0_3, etc.
  helpText     String?         # Help tooltip content
  conditional  Json?           # Show/hide logic
  order        Int             # Question order
  options      QuestionOption[] # For select fields
  scoringConfig ScoringConfig? # For scoring fields
}
```

### **Form Submission Storage**
```prisma
model FormSubmission {
  id           String            @id @default(cuid())
  templateId   String            # Which form version
  status       SubmissionStatus  # DRAFT | SUBMITTED | REVIEWED
  submittedBy  String            # User identifier
  responses    QuestionResponse[] # All answers
  scores       CalculatedScore[]  # Auto-calculated values
}
```

### **Field Types & Adapters**
```typescript
enum FieldType {
  SHORT_TEXT      // Input component
  LONG_TEXT       // Textarea component
  INTEGER         // Number input
  SINGLE_SELECT   // Select dropdown
  MULTI_SELECT    // Checkbox group
  SCORING_0_3     // ScoringComponent (0-3 scale)
  REPEATABLE_GROUP // Dynamic table (competitors, SME)
  CHECKBOX_GROUP  // Multiple checkboxes
  DATE            // Date picker
}
```

### **Scoring & Calculation Logic**
```typescript
// Auto-calculation formulas (matching original Excel)
Impact Score = (Mission Alignment × 50%) + (Unmet Need × 50%)
Value Score = (State of Art × 50%) + (Market Score × 50%)
Market Score = (Market Size + Patient Population + Competitors) ÷ 3

// Recommendation matrix based on Impact vs Value positioning
if (impact >= 2 && value >= 2) → "Proceed"
else → "Alternative Pathway"
```

## 🎨 Design System

### Colors
- **Primary**: #2563EB (blue-600)
- **Secondary**: #3B82F6, #6366F1, #1F2937
- **Neutral**: #4B5563, #E5E7EB, #FFFFFF

### Typography
- **Headings**: Poppins/Inter (modern sans-serif)
- **Body**: Open Sans (clean sans-serif)

## 🛠️ Development Setup & Commands

### **Server Startup** (Required for Development)
```bash
# Terminal 1: Web server
npm run dev                 # → http://localhost:3000

# Terminal 2: Database server
npx prisma dev             # → ports 51213-51215

# Optional: Database browser
npx prisma studio          # → http://localhost:5555
```

### **Essential Commands**
```bash
# Development workflow
npm run dev              # Start Next.js development server
npm run build           # Production build
npm run lint            # ESLint code quality check
npm run type-check      # TypeScript validation
npx playwright test     # Run E2E tests

# Database operations
npx prisma generate     # Generate TypeScript client
npx prisma migrate dev  # Create and apply migrations
npm run seed            # Reset database with fresh data
npx prisma studio       # Visual database browser
```

### **Database Management**
```bash
# Fresh database setup
npx prisma migrate reset    # ⚠️ Destroys all data
npm run seed               # Populates with test data

# Production deployment
npx prisma migrate deploy  # Apply migrations to production
npx prisma generate        # Update client for production

# Debugging
npx prisma db push         # Push schema without migration
npx prisma migrate status  # Check migration state
```

### **Development Workflow**
1. **Start servers**: `npm run dev` + `npx prisma dev`
2. **Make changes**: Edit components or schema
3. **Database changes**: Run `npx prisma migrate dev`
4. **Test changes**: Use both form implementations
5. **Commit**: Standard git workflow

### **Component Development**
```bash
# Add new shadcn/ui component
npx shadcn@latest add button    # Installs to src/components/ui/

# Run type checking during development
npm run type-check -- --watch

# Run tests in watch mode
npx playwright test --ui        # Interactive test runner
```

## 📚 Documentation & References

### Project Files
- `CLAUDE.md` - Detailed development guide and progress tracking
- `Triage.pdf` - Original CCHMC form reference
- `Tech Triage Design System.jpg` - UI/UX specifications
- `Tech Triage Landing Page.jpg` - Design mockups

### Form Requirements
Based on the original CCHMC triage form:
1. **Header Section**: Reviewer, Technology ID, Inventors, Domain
2. **Technology Overview**: Detailed description
3. **Scoring Sections**: Mission Alignment, Unmet Need, State of Art (0-3 scale)
4. **Market Analysis**: Overview + competitor table with auto-scoring
5. **Digital Considerations**: 4 yes/no questions
6. **Results**: Auto-calculated Impact vs Value matrix with recommendations

## 🚀 Next Development Steps (Phase 4)

### **Immediate Priority Tasks**
Based on NEXT_STEPS.md roadmap:

1. **Enhanced Question Structure** (1-2 days)
   - Update seed data with 60+ questions from questions_broken_out.txt
   - Implement proper field codes (F0.1, F1.1.a, etc.)
   - Add conditional logic for context-dependent questions

2. **Functional Repeatable Groups** (2-3 days)
   - Replace RepeatableGroupField placeholder with functional component
   - Implement competitor table with add/remove/edit capabilities
   - Create SME table with dynamic row management

3. **Form Persistence** (2-3 days)
   - Create form submission API endpoints
   - Implement auto-save draft functionality (every 30 seconds)
   - Add form resume capability from saved drafts

4. **Validation Framework** (1-2 days)
   - Create comprehensive Zod validation schemas
   - Add real-time validation feedback
   - Implement required field indicators

### **Development Priorities**
- **Phase 4 Focus**: Transform dynamic form from prototype to production-ready
- **Timeline**: ~8-10 working days for complete implementation
- **Success Metric**: Full feature parity with hardcoded form + database persistence

## 🔧 Environment & Configuration

### **Required Environment Variables**
```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."  # Auto-generated by Prisma
```

### **Local Development Setup**
1. **Install dependencies**: `npm install`
2. **Start database**: `npx prisma dev` (background process)
3. **Start web server**: `npm run dev`
4. **Seed database**: `npm run seed` (if first time)
5. **Open browser**: http://localhost:3000

### **Troubleshooting**
```bash
# Database connection issues
npx prisma db push          # Force schema sync
npx prisma generate         # Regenerate client

# Port conflicts
lsof -ti:3000 | xargs kill  # Kill Next.js server
lsof -ti:51213 | xargs kill # Kill Prisma server

# Clean restart
npm run build               # Verify build works
rm -rf .next prisma/dev.db  # Clean cache
```

## 📚 Key Resources

### **Project Documentation**
- `IMPLEMENTATION_PLAN.md` - Detailed Phase 4 implementation guide
- `NEXT_STEPS.md` - Complete project roadmap through Phase 6
- `CLAUDE.md` - Development context and project history
- `questions_broken_out.txt` - Complete question requirements (60+ questions)

### **Reference Materials**
- `Triage.pdf` - Original CCHMC form specification
- `Tech Triage Design System.jpg` - UI/UX design requirements
- Design system implementation at `/` (landing page)

### **Form Requirements Summary**
1. **60+ granular questions** across 7 main sections
2. **Auto-calculation engine** replicating Excel scorecard logic
3. **Dynamic tables** for competitor analysis and SME recommendations
4. **Conditional logic** for field visibility based on user inputs
5. **Draft persistence** with auto-save and resume capabilities
6. **Comprehensive validation** with real-time feedback

### **Architecture Decisions**
- **Two separate systems**: Hardcoded (immediate use) + Database-driven (flexible future)
- **No code sharing**: Each system is completely independent
- **Shared UI components**: Both use same shadcn/ui components for visual consistency
- **Different state management**: Hardcoded uses useState, Dynamic uses Context+reducer
- **TypeScript first**: Comprehensive type safety throughout both systems
