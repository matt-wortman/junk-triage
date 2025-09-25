# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 PROJECT-SPECIFIC EVIDENCE REQUIREMENTS

**This project inherits the global Evidence-Based Coding Protocol. Use these commands:**

### Research Phase (CONTEXTUAL EVIDENCE)
```bash
# Find similar implementations in this codebase:
grep -r "FormSubmission" --include="*.ts" src/
grep -r "questionResponse" --include="*.ts" prisma/
grep -r "SubmissionStatus" --include="*.ts" src/
cat src/app/dynamic-form/actions.ts  # See how data is stored
```

### Verification Phase (TYPE EVIDENCE)
```bash
# This project's type checking:
npm run type-check     # Run after every 20 lines
npm run lint          # Additional code quality checks
```

### Execution Phase (EXECUTION EVIDENCE)
```bash
# This project's testing/verification:
npm test              # Run tests
npm run db:seed       # Test database operations
npx prisma studio     # Verify database data
tsx scripts/test-feature.ts  # Custom verification scripts
```

### Project-Specific Data Contract Rules
- Form field values use snake_case: `"medical_device"` not `"Medical Device"`
- Store data as proper types using `Prisma.InputJsonValue`, not `String(value)`
- Question responses expect exact option values from database
- All submissions must have valid templateId from existing FormTemplate

---

## Project Overview

This is a web application project to replicate the Cincinnati Children's Hospital Medical Center (CCHMC) technology triage form as a modern web form connected to a database. The original form is available as `Triage.pdf` in the project root.

## 🎯 PRIMARY GOAL - DYNAMIC DATABASE-DRIVEN FORMS

## ⚠️ IMPORTANT: DEVELOPMENT FOCUS

### Static Form is DESIGN REFERENCE ONLY
- The `/form` route (static hardcoded form) is **FROZEN** - no further development or analysis
- Use it ONLY as a visual design reference for UI/UX consistency
- All development, planning, and analysis must focus on `/dynamic-form` route
- When creating new features, copy the visual design from `/form` but implement in dynamic system

### Active Development Target
- **ONLY `/dynamic-form`** route is for active development
- All planning, analysis, and next steps should focus on dynamic forms
- No time should be spent on static form improvements or fixes

### Core Requirements (MUST FOLLOW)
1. **ALL form structure must come from the database** - questions, sections, text, labels, help text, options, etc.
2. **ALL responses must be stored in the database** - every answer, score, and user input
3. **The visual design MUST match the hardcoded form exactly** - use the SAME shadcn/ui components and styling
4. **NO hardcoding of form questions** - the form must be 100% database-driven
5. **Forms must be flexible** - easy to add/remove/reorder questions by updating database only

### What This Means
- **Database stores**: Form templates, sections, questions, field types, options, validation rules, conditional logic, scoring configs
- **Database stores**: All user responses, form submissions, calculated scores
- **Visual appearance**: Exactly like the current hardcoded form - same components, same styling, same layout
- **Implementation**: Use the EXISTING shadcn/ui components (Input, Textarea, Select, etc.) that were used in hardcoded form
- **Flexibility**: Adding a new question = database insert, NOT code change

### Current Status
- ✅ **Static form (`/form`)** - DESIGN REFERENCE ONLY - Frozen, no further development
- ✅ **Dynamic form engine (`/dynamic-form`)** - Foundation built (types, schema, context, validation)
- 🔧 **Missing connection** - Need to wire dynamic engine to use same UI components as static reference

### The Plan
1. **Extract visual design** - Copy shadcn/ui components and styling from static form as reference
2. **Make it dynamic** - Components render based on database data, not hardcoded JSX
3. **Maintain quality** - Same professional look, same user experience, but database-driven
4. **Static form remains untouched** - Only used as visual reference, no modifications

## Form Structure

The triage form consists of several key sections that must be implemented:

### Header Section
- Reviewer (text input)
- Technology ID # (text input)
- Inventor(s)/Title(s)/Dept (textarea)
- Domain/Asset Class (text input)

### Content Sections
1. **Technology Overview** - Large textarea for technology description
2. **Mission Alignment** - Textarea + score (0-3) based on child health impact and POPT goals
3. **Unmet Need** - Textarea + score (0-3) based on clinical need assessment
4. **State of the Art** - Textarea + score (0-3) based on prior art research
5. **Market Analysis** - Complex section with:
   - Market overview textarea
   - Company competitor table (Company, Product Description, Product Revenue, Point of Contact)
   - Automatic scoring based on market size, patient population, and competitor count
6. **Digital/Software Considerations** - 4 yes/no questions for tech-specific considerations
7. **Score & Recommendation** - Auto-calculated scoring matrix and summary section
8. **Subject Matter Experts** - Optional table for expert recommendations

### Scoring System
- Uses 0-3 scale for all criteria
- Weighted scoring for Impact (Mission Alignment 50%, Unmet Need 50%)
- Weighted scoring for Value (State of Art 50%, Market 50%)
- Market score auto-calculated from sub-criteria
- Final recommendation based on Impact vs Value matrix

## Technology Stack

### Frontend
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components (configured via .mcp.json)

### Key Components Needed
- `@shadcn/form` - Form handling with react-hook-form + Zod validation
- `@shadcn/input`, `@shadcn/textarea` - Form inputs
- `@shadcn/select`, `@shadcn/radio-group` - Selection inputs
- `@shadcn/table` - For competitor and SME tables
- `@shadcn/card` - Form section containers
- `@shadcn/button` - Form actions
- `@shadcn/badge` - Score indicators
- `@shadcn/sonner` - Toast notifications

### Backend
- Next.js Server Actions (recommended) or API routes
- Database ORM (Prisma recommended)
- PostgreSQL or similar relational database

## Database Schema Requirements

The database needs to store:
- Form submissions with all text fields
- Numerical scores for each section
- Dynamic tables (competitors, SMEs)
- Calculated scores and recommendations
- Audit trail (created/updated timestamps, reviewer info)

## MCP Configuration

The project includes shadcn MCP server configuration in `.mcp.json` for easy component management.

## Commands

### Development Server
- `npm run dev` - Start development server (currently running on http://localhost:3000)
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint
- `npm run type-check` or `npx tsc --noEmit` - TypeScript checking

### Database Commands
- `npx prisma dev` - Start local Prisma PostgreSQL server (currently running on ports 51213-51215)
- `npx prisma migrate dev` - Create and apply database migrations
- `npx prisma generate` - Generate Prisma client
- `npx prisma studio` - Open Prisma Studio database browser

## Current Project Status (Updated: 2025-09-23)

### ✅ COMPLETED PHASE 1: Project Foundation

1. **Project Setup**
   - ✅ Next.js 14+ project initialized with TypeScript, Tailwind CSS, App Router
   - ✅ Design system configured with brand colors (#2563EB primary blue)
   - ✅ Dependencies installed: Prisma, React Hook Form, Zod, Lucide React
   - ✅ shadcn/ui components installed and configured

2. **Landing Page**
   - ✅ Navigation bar with Company branding
   - ✅ Hero section with dark gradient background and 3D technology visuals
   - ✅ Web form preview section with placeholder cards
   - ✅ Strategic alignment scoring visualization
   - ✅ Responsive design following design mockups

3. **Database Setup**
   - ✅ Prisma configured with PostgreSQL
   - ✅ Database schema created (`TriageForm`, `Competitor`, `SubjectMatterExpert` models)
   - ✅ Initial migration completed
   - ✅ Local Prisma database server running
   - ✅ Prisma client utility created (`src/lib/prisma.ts`)

### ✅ COMPLETED PHASE 2: Static Form Implementation (DESIGN REFERENCE ONLY)

**NOTE: This phase is FROZEN - no further development. Use only as visual design reference for dynamic forms.**

1. **Multi-Step Form Architecture**
   - ✅ 9-step form navigation with progress tracking
   - ✅ Centralized FormData type with comprehensive TypeScript definitions
   - ✅ State management across all form sections
   - ✅ Navigation between steps with data persistence

2. **All Form Sections Implemented & Tested**
   - ✅ **Header Section** - Basic information collection (Reviewer, Tech ID, Inventors, Domain)
   - ✅ **Technology Overview** - Large textarea with character counting and guidance
   - ✅ **Mission Alignment** - Text analysis + 0-3 scoring with help criteria
   - ✅ **Unmet Need** - Clinical need assessment + 0-3 scoring
   - ✅ **State of the Art** - Prior art analysis + 0-3 scoring
   - ✅ **Market Analysis** - Complex section with:
     - Market overview textarea
     - Dynamic competitor table (add/remove/edit functionality)
     - Auto-calculating market scores (Market Size, Patient Population, Competitors)
     - Real-time overall market score calculation
   - ✅ **Digital Considerations** - 4 yes/no checkboxes with legal disclaimer
   - ✅ **Score & Recommendation** - **🏆 STAR FEATURE:**
     - Auto-calculated Impact Score (Mission Alignment 50% + Unmet Need 50%)
     - Auto-calculated Value Score (State of Art 50% + Market 50%)
     - Impact vs Value matrix visualization with quadrant recommendations
     - Real-time score updates and recommendation logic
   - ✅ **Summary Section** - Final summary with SME table and assessment overview

3. **Reusable Components**
   - ✅ **ScoringComponent** - 0-3 scale with visual indicators and help popovers
   - ✅ Dynamic tables for competitors and subject matter experts
   - ✅ Progress tracking and step navigation
   - ✅ Responsive card layouts following design system

4. **Auto-Calculation Engine**
   - ✅ **Perfect scoring logic** matching original Excel scorecard from PDF
   - ✅ **Real-time calculations** for Impact, Value, and Market scores
   - ✅ **Recommendation matrix** (Proceed/Alternative Pathway/Close/N/A)
   - ✅ **Weighted scoring formulas** exactly as specified in original form
   - ✅ **Market sub-criteria averaging** (TAM + Population + Competitors)/3

5. **Complete Testing Validation**
   - ✅ **Playwright end-to-end testing** completed successfully
   - ✅ **All form sections tested** with realistic data entry
   - ✅ **Auto-calculations verified** (Impact: 3.00, Value: 2.33, Recommendation: Proceed)
   - ✅ **Navigation flow tested** through all 9 steps
   - ✅ **Scoring components tested** with help popover functionality
   - ✅ **Dynamic tables tested** (add/remove competitors functionality)

### 🔄 CURRENT PHASE: Database Integration & Production Ready

**Next Immediate Tasks:**
1. **Server Actions Implementation** - Connect form to Prisma database
2. **Form Submission Logic** - Save/update triage forms in database
3. **Draft Save Functionality** - Allow users to save progress and return later
4. **Form Validation** - Add Zod schemas for robust validation
5. **Production Deployment** - Deploy to hosting platform

### 🎯 READY FOR PRODUCTION FEATURES

The form is now **fully functional** with all core features implemented:
- ✅ Complete 9-section form matching original PDF requirements
- ✅ Auto-calculating scores with Excel-equivalent logic
- ✅ Enhanced Impact vs Value recommendation matrix with proper IMPACT/VALUE hierarchy
- ✅ Dynamic tables for competitive analysis and SME recommendations
- ✅ Professional UI/UX following design mockups with accessibility support
- ✅ Production-ready code quality with memoization and error handling
- ✅ Comprehensive testing validation

### 📁 Key Files Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page (✅ completed)
│   ├── form/                       # 🚫 DESIGN REFERENCE ONLY - NO CHANGES
│   │   └── page.tsx               # Static form - FROZEN for visual reference
│   ├── dynamic-form/              # 🎯 ACTIVE DEVELOPMENT TARGET
│   │   └── page.tsx               # Dynamic form implementation
│   └── globals.css                # Global styles with design tokens
├── components/
│   ├── form/                      # 🚫 DESIGN REFERENCE ONLY - Form components (FROZEN)
│   │   ├── HeaderSection.tsx      # Use as visual reference for dynamic version
│   │   ├── TechnologyOverviewSection.tsx
│   │   ├── MissionAlignmentSection.tsx
│   │   ├── UnmetNeedSection.tsx
│   │   ├── StateOfArtSection.tsx
│   │   ├── MarketAnalysisSection.tsx
│   │   ├── DigitalConsiderationsSection.tsx
│   │   ├── ScoreRecommendationSection.tsx
│   │   ├── SummarySection.tsx
│   │   └── ScoringComponent.tsx   # Extract design for dynamic implementation
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── form-engine/               # 🎯 ACTIVE DEVELOPMENT - Dynamic form system
│   ├── prisma.ts                  # Database client (✅ completed)
│   ├── scoring.ts                 # Auto-calculation engine (✅ completed)
│   └── utils.ts                   # Utility functions
prisma/
├── schema.prisma                  # Database schema (✅ completed)
└── migrations/                    # Database migrations
```

### 🎨 Design System

**Color Palette (Implemented):**
- Primary: #2563EB (blue-600)
- Secondary variations: #3B82F6, #6366F1, #1F2937
- Neutral: #4B5563, #E5E7EB, #FFFFFF

**Typography:**
- Headings: Poppins/Inter
- Body: Open Sans
- Components follow shadcn/ui design patterns

### 🗄️ Database Schema

**Models Created:**
- `TriageForm` - Main form data with all sections and scores
- `Competitor` - Company competitor information
- `SubjectMatterExpert` - Expert recommendations

**Scoring Fields:**
- Individual scores (0-3): missionAlignmentScore, unmetNeedScore, stateOfArtScore
- Calculated scores: impactScore, valueScore, marketScore
- Final recommendation: "Proceed" or "Alternative Pathway"

### 🎯 CURRENT PHASE: Production Ready & Docker Deployment

**Phase Status: ✅ DOCKER DEPLOYMENT FULLY FUNCTIONAL**

### ✅ COMPLETED PHASE 3: Docker Production Deployment

1. **TypeScript Error Resolution**
   - ✅ Systematically fixed all 32+ TypeScript compilation errors
   - ✅ Fixed FieldAdapters.tsx onChange type mismatch
   - ✅ Added missing SCORING_MATRIX validation schema
   - ✅ Fixed renderer.tsx useRef and validation type handling
   - ✅ Fixed useSearchParams Suspense boundary issues

2. **Docker Containerization**
   - ✅ **Multi-stage Docker build successful**
   - ✅ **Next.js production build completed** (✓ Compiled successfully in 18.4s)
   - ✅ **Static page generation working** (11/11 pages generated)
   - ✅ **PostgreSQL database container healthy** (port 5432)
   - ✅ **Application container running** (port 3000)

3. **Production Deployment Status**
   - ✅ Docker containers built and running successfully
   - ✅ **Database migration conflict FIXED** (updated scripts/start.sh to use db push instead of migrate)
   - ✅ **API health check PASSING**: `{"status":"healthy","database":"connected"}`
   - ✅ Full TypeScript strict checking passed
   - ✅ Established proper development workflow (`npx tsc --noEmit` before builds)
   - ✅ **Docker environment READY FOR TESTING** at http://localhost:3000

### 🚀 Next Development Priorities

1. **Feature Enhancement:**
   - **Export Reports Functionality** - Generate PDF/Excel reports from form submissions
   - **Form Builder Interface** - Admin interface to create/modify form templates
   - **User Authentication** - Replace anonymous users with proper auth system
   - **Dashboard Analytics** - Submission statistics and trend analysis

2. **Production Readiness:**
   - Deploy to cloud platform (AWS/Vercel/Railway)
   - Set up CI/CD pipeline
   - Configure production database
   - Implement monitoring and logging

### 🚀 How to Continue Development

**CURRENT STATUS (2025-09-23 6:20 PM):**
- ✅ **Docker containers RUNNING** and healthy
- ✅ **Database schema synced** via fixed startup script
- ✅ **API responding** at http://localhost:3000/api/health
- ✅ **Ready for form testing** and feature development

1. **Docker Environment (Production-like) - CURRENTLY ACTIVE:**
   ```bash
   docker-compose up -d     # ✅ RUNNING on ports 3000/5432
   docker-compose logs app  # Monitor application logs
   curl localhost:3000/api/health  # Test health endpoint
   ```

2. **Local Development (alternative):**
   ```bash
   npm run dev              # Development server
   npx prisma dev          # Database server
   npx tsc --noEmit        # Always check TypeScript before Docker builds
   ```

3. **Critical Fix Applied:**
   - **Problem**: P3005 database migration conflict causing restart loops
   - **Solution**: Updated `scripts/start.sh` to use `prisma db push` instead of `migrate deploy`
   - **Result**: Containers start successfully, API healthy, ready for testing

### 📋 Reference Files

- `Triage.pdf` - Original CCHMC form for reference
- `Tech Triage Design System.jpg` - UI/UX design specifications
- `Tech Triage Landing Page.jpg` - Landing page mockup
- `Tech Triage Landing Page Head-on View.jpg` - Clean layout reference

## Development Notes

- The original PDF includes an embedded Excel scorecard that auto-calculates scores - this logic needs to be implemented in the web form
- Form validation should match the scoring criteria detailed in Exhibit A of the PDF
- The form supports both "Proceed" and "Alternative Pathway" recommendations based on scoring thresholds
- Consider implementing draft/save functionality for long forms
- The form generates confidential documents, so implement appropriate access controls

## Recent Improvements (2025-09-22)

### Score & Recommendation Layout Enhancement
- **IMPACT/VALUE Section Headers**: Added dedicated header rows with clear visual hierarchy
- **Market Sub-criteria Integration**: Nested market details under Market row matching PDF structure
- **Professional Styling**: Visual indicators, proper spacing, and tabular number formatting
- **Accessibility**: Enhanced with ARIA labels, semantic markup, and screen reader support

### Code Quality Improvements
- **Performance Optimization**: Implemented `useMemo` for expensive calculations
- **Input Validation**: Added robust `validateScore()` and `formatScore()` helpers
- **Configuration Management**: Centralized constants in `SCORING_CONFIG`
- **Error Handling**: Comprehensive validation for edge cases and invalid inputs

### Test Coverage Added
- Component structure validation tests
- Score calculation accuracy tests
- Integration with auto-calculation engine tests
- Real-world usage scenario tests
- Accessibility compliance verification

### Environment Variables Required

```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."  # Auto-generated by Prisma
```

## Important Implementation Notes

### Dynamic Form System Phase 1 Complete
- ✅ Database schema for dynamic forms (FormTemplate, FormSection, FormQuestion, etc.)
- ✅ TypeScript types and interfaces for form engine
- ✅ Form state management with reducer pattern
- ✅ Conditional logic engine for field visibility
- ✅ Validation framework
- ✅ Seed data structure defined

### Next Steps for Dynamic Forms (ACTIVE DEVELOPMENT)
1. **Extract UI components** - Copy Input, Textarea, Select, ScoringComponent designs from static form
2. **Wire the dynamic renderer** - Connect database fields to dynamic field adapters
3. **Maintain visual consistency** - Must look exactly like static reference form
4. **Database-driven everything** - Structure, text, options all from database
5. **FOCUS ONLY ON DYNAMIC FORMS** - No time on static form analysis or improvements

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.