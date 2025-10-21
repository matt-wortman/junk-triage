# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📊 Current Project Status

**For complete project status, roadmap, and metrics:** See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)

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

### Core Requirements (MUST FOLLOW)
1. **ALL form structure comes from the database** - questions, sections, text, labels, help text, options, etc.
2. **ALL responses are stored in the database** - every answer, score, and user input
3. **Professional UI/UX** - Uses shadcn/ui components for consistent design
4. **NO hardcoding of form questions** - Forms are 100% database-driven
5. **Forms are flexible** - Add/remove/reorder questions by updating database only

### Implementation Architecture
- **Database stores**: Form templates, sections, questions, field types, options, validation rules, conditional logic, scoring configs
- **Database stores**: All user responses, form submissions, calculated scores
- **UI Components**: shadcn/ui components (Input, Textarea, Select, etc.)
- **Flexibility**: Adding a question = database insert, NOT code change

### Current System Status
- ✅ **Dynamic form engine (`/dynamic-form`)** - Fully implemented and deployed
- ✅ **Form builder (`/dynamic-form/builder`)** - Template authoring with conditional logic
- ✅ **PDF export** - Report generation from submissions
- ✅ **Azure deployment** - Live at tech-triage-app.azurewebsites.net

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

## Environment Modes

This project supports **three distinct database/runtime modes**. Choose the right one for your workflow:

### 1. Prisma Dev Server Mode (Default - Fast Local Iteration)
**Best for**: Quick UI/API iteration without Docker overhead

**Start commands (in separate terminals):**
```bash
# Terminal 1: Start Prisma Dev Server
npx dotenv-cli -e .env.prisma-dev -- npx prisma dev

# Terminal 2: Start Next.js dev server
npm run dev  # Uses .env.prisma-dev, Turbopack enabled
```

**Relevant files**: `.env.prisma-dev`
**Database location**: Prisma-managed local service (`prisma+postgres://localhost:51213/...`)
**Ports**: Prisma runs on 51213-51215, Next.js on 3000

**Optional tools:**
```bash
npm run studio          # Prisma Studio (uses .env.prisma-dev)
npm run db:seed:dev     # Seed dev database
```

**Teardown:**
- `Ctrl+C` both terminals
- Prisma leaves data in `.prisma-server` directory (no cleanup needed)

---

### 2. Local Docker Postgres Mode (Integration Testing)
**Best for**: Testing against containerized Postgres, parity with deployment

**Start commands:**
```bash
# Start Postgres container
docker-compose up -d database

# Start Next.js with .env (not .env.prisma-dev)
npx dotenv-cli -e .env -- next dev

# OR for production build testing:
npm run build
npx next start -p 3001
```

**Relevant files**: `.env`
**Database location**: Docker container (`localhost:5432`)
**Ports**: Postgres on 5432, Next.js on 3000 (or custom)

**Teardown:**
```bash
docker-compose down
```

---

### 3. Azure Production Mode (Live Deployment)
**Best for**: Production runtime, debugging Azure-specific issues

**Database location**: Azure Database for PostgreSQL Flex (remote)
**Configuration**: App Service environment variables
**Entry script**: `scripts/start.sh` runs migrations + optional seed
**Control seeding**: Set `RUN_PRISMA_SEED=true/false` in App Service config

**Manual operations:**
```bash
# SSH into container
az webapp ssh -g <resource-group> -n <app-name>

# Tail logs
az webapp log tail -g <resource-group> -n <app-name>
```

---

### Switching Between Modes

**Important**: Only one mode should be active at a time. Before switching:
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs -r kill -9
```

| From → To | Steps |
|-----------|-------|
| **Prisma Dev → Docker** | Stop both dev terminals (`Ctrl+C`), run `docker-compose up -d database`, start Next with `.env` |
| **Prisma Dev → Azure** | Stop dev servers, `npm run build`, deploy container to Azure |
| **Docker → Prisma Dev** | Run `docker-compose down`, start Prisma dev + Next.js dev servers |

**See also**: `ENVIRONMENT_MODES.md` for detailed troubleshooting and pitfalls

---

## Commands

### Development Server
- `npm run dev` - Start Next.js dev server (uses `.env.prisma-dev`, Turbopack enabled)
- `npm run dev:classic` - Start Next.js dev server (uses `.env`, classic mode)
- `npm run build` - Production build with Turbopack
- `npm run start` - Production server
- `npm run lint` - ESLint
- `npm run type-check` or `npx tsc --noEmit` - TypeScript checking

### Database Commands
- `npx dotenv-cli -e .env.prisma-dev -- npx prisma dev` - Start Prisma Dev Server
- `npx prisma migrate dev` - Create and apply database migrations
- `npx prisma generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio (uses `.env.prisma-dev`)
- `npm run db:seed:dev` - Seed dev database

## Current Project Status

**See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) for complete current status, roadmap, and metrics.**

### Production System (Deployed)
- ✅ **Dynamic form runtime** - Database-driven forms at `/dynamic-form`
- ✅ **Form builder** - Template authoring at `/dynamic-form/builder`
- ✅ **PDF export** - Report generation via `/api/form-exports`
- ✅ **Azure deployment** - Live at https://tech-triage-app.azurewebsites.net
- ✅ **PostgreSQL database** - Azure PostgreSQL Flexible Server
- ✅ **Automated exports** - Windows task every 48 hours

### Key Features Implemented
- Database-driven form structure (FormTemplate, FormSection, FormQuestion)
- Form builder with conditional logic and data tables
- Submission tracking and draft management
- PDF export with scoring graphics
- Auto-calculation engine (Impact/Value scoring)
- Repeatable groups and dynamic tables

### 📁 Key Files Structure

```
src/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── dynamic-form/                     # Dynamic form system
│   │   ├── page.tsx                      # Form runtime
│   │   ├── builder/[templateId]/page.tsx # Form builder
│   │   ├── submissions/page.tsx          # Submissions list
│   │   └── actions.ts                    # Server actions
│   ├── api/
│   │   ├── form-templates/route.ts       # Template API
│   │   ├── form-exports/route.tsx        # PDF export
│   │   └── health/route.ts               # Health check
│   └── globals.css                       # Global styles
├── components/
│   ├── form-builder/                     # Builder UI components
│   │   ├── SectionCard.tsx
│   │   ├── FieldCard.tsx
│   │   └── FieldConfigModal.tsx
│   └── ui/                               # shadcn/ui components
├── lib/
│   ├── form-engine/                      # Dynamic form engine
│   │   ├── types.ts
│   │   ├── renderer.tsx
│   │   ├── fields/FieldAdapters.tsx
│   │   └── pdf/FormPdfDocument.tsx
│   ├── prisma.ts                         # Database client
│   ├── scoring/calculations.ts           # Auto-calculation engine
│   └── utils.ts                          # Utility functions
prisma/
├── schema.prisma                         # Database schema
├── migrations/                           # Database migrations
└── seed/                                 # Seed data
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

**Key Models:**
- `FormTemplate` - Form structure definitions
- `FormSection` - Sections within templates
- `FormQuestion` - Individual questions with field types
- `FormSubmission` - User submissions
- `Technology` - Technology entities (binding target)
- `QuestionDictionary` - Canonical question registry

**See:** [docs/architecture/data-model.md](docs/architecture/data-model.md) for complete schema documentation

### 📋 Reference Files

- `Triage.pdf` - Original CCHMC form for reference
- `Tech Triage Design System.jpg` - UI/UX design specifications
- `Tech Triage Landing Page.jpg` - Landing page mockup
- `Tech Triage Landing Page Head-on View.jpg` - Clean layout reference

## Development Notes

- The original PDF (`Triage.pdf`) specifies scoring criteria and form structure
- Auto-calculation engine implements Impact/Value scoring matrix
- Draft/save functionality implemented with autosave
- Forms generate confidential documents - Basic Auth currently in place, NextAuth planned

## Environment Variables Required

**Local Development:**
```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."  # Auto-generated by Prisma Dev
```

**Production (Azure):**
```env
DATABASE_URL="postgresql://triageadmin:<password>@techtriage-pgflex.postgres.database.azure.com:5432/triage_db?sslmode=require"
AZURE_STORAGE_CONNECTION_STRING="<connection-string>"
NEXT_PUBLIC_TEST_USER_ID="test-user-1"  # For draft identity
```

**See:** [docs/guides/deployment-guide.md](docs/guides/deployment-guide.md) for complete environment setup

# Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.