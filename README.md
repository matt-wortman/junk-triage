# Technology Triage Platform

A modern web application to replicate the Cincinnati Children's Hospital Medical Center (CCHMC) technology triage form as a digital form connected to a database.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git

### 1. Start Development Environment

```bash
# Start development server
npm run dev

# Start database server (in another terminal)
npx prisma dev
```

- **Web App**: http://localhost:3000
- **Database**: Running on ports 51213-51215

### 2. Access Current Features
- ✅ **Landing Page**: Modern homepage with design system implementation
- ✅ **Triage Form**: **FULLY FUNCTIONAL** multi-step form (`/form`)

## 📊 Project Status

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Next.js 14+ setup with TypeScript & Tailwind CSS
- [x] Design system implementation (#2563EB blue theme)
- [x] shadcn/ui component library integration
- [x] Landing page with hero section and 3D visuals
- [x] Prisma database setup with PostgreSQL
- [x] Complete database schema for triage forms

### ✅ Phase 2: Complete Form Implementation (COMPLETED)
- [x] **Multi-step triage form** with 9 sections and navigation
- [x] **All form sections** implemented and tested:
  - [x] Header Section (Reviewer, Tech ID, Inventors, Domain)
  - [x] Technology Overview (with character counting)
  - [x] Mission Alignment (text + 0-3 scoring with help)
  - [x] Unmet Need (clinical assessment + scoring)
  - [x] State of the Art (prior art analysis + scoring)
  - [x] Market Analysis (overview + dynamic competitor table + auto-scoring)
  - [x] Digital Considerations (4 yes/no checkboxes)
  - [x] Score & Recommendation (auto-calculated Impact vs Value matrix)
  - [x] Summary (final overview + SME table)
- [x] **Reusable scoring components** with 0-3 scale and help popovers
- [x] **Dynamic tables** for competitors and subject matter experts
- [x] **Auto-calculation engine** matching original Excel scorecard logic
- [x] **Real-time score updates** and recommendation matrix
- [x] **Complete Playwright testing** - all functionality verified

### 🔄 Phase 3: Database Integration (IN PROGRESS)
- [ ] Server Actions for form submission
- [ ] Draft save functionality
- [ ] Form validation with Zod schemas
- [ ] Database persistence and retrieval

### 📋 Phase 4: Production Features (PLANNED)
- [ ] Report generation and export
- [ ] User authentication system
- [ ] Admin dashboard
- [ ] Form version management
- [ ] Audit trail functionality

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: PostgreSQL (via Prisma local server)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Project Structure
```
src/
├── app/
│   ├── page.tsx                    # Landing page (✅ completed)
│   ├── form/
│   │   └── page.tsx               # Multi-step triage form (✅ completed)
│   └── globals.css                # Design system styles
├── components/
│   ├── form/                      # Form section components (✅ all completed)
│   │   ├── HeaderSection.tsx
│   │   ├── TechnologyOverviewSection.tsx
│   │   ├── MissionAlignmentSection.tsx
│   │   ├── UnmetNeedSection.tsx
│   │   ├── StateOfArtSection.tsx
│   │   ├── MarketAnalysisSection.tsx
│   │   ├── DigitalConsiderationsSection.tsx
│   │   ├── ScoreRecommendationSection.tsx
│   │   ├── SummarySection.tsx
│   │   └── ScoringComponent.tsx   # Reusable 0-3 scoring component
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── prisma.ts                  # Database client (✅ completed)
│   ├── scoring.ts                 # Auto-calculation engine (✅ completed)
│   └── utils.ts                   # Utility functions
prisma/
├── schema.prisma                  # Database schema (✅ completed)
└── migrations/                    # Database migrations
```

## 🗄️ Database Schema

### Core Models
- **TriageForm**: Main form with header, sections, and calculated scores
- **Competitor**: Company competitor analysis data
- **SubjectMatterExpert**: Expert recommendation records

### Scoring System
- Individual scores (0-3): Mission Alignment, Unmet Need, State of Art
- Calculated scores: Impact Score, Value Score, Market Score
- Final recommendation: "Proceed" or "Alternative Pathway"

## 🎨 Design System

### Colors
- **Primary**: #2563EB (blue-600)
- **Secondary**: #3B82F6, #6366F1, #1F2937
- **Neutral**: #4B5563, #E5E7EB, #FFFFFF

### Typography
- **Headings**: Poppins/Inter (modern sans-serif)
- **Body**: Open Sans (clean sans-serif)

## 🛠️ Development Commands

### Essential Commands
```bash
# Development
npm run dev              # Start development server
npm run build           # Production build
npm run lint            # ESLint check
npm run type-check      # TypeScript validation

# Database
npx prisma dev          # Start local database server
npx prisma studio       # Open database browser
npx prisma migrate dev  # Apply database migrations
npx prisma generate     # Generate Prisma client
```

### Database Management
```bash
# Reset database (if needed)
npx prisma migrate reset

# View current migrations
npx prisma migrate status

# Deploy to production database
npx prisma migrate deploy
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

## 🚀 Next Development Steps

### Immediate Tasks (Next Session)
1. **Implement Server Actions** - Connect form to Prisma database
2. **Add form submission logic** - Save/update triage forms in database
3. **Create draft save functionality** - Allow users to save progress
4. **Add Zod validation schemas** - Robust form validation
5. **Implement form loading** - Retrieve and populate saved forms

### Database Integration Priority
1. **Server Actions setup** for form persistence
2. **Draft save/load functionality** for user convenience
3. **Form validation** with comprehensive error handling
4. **Data retrieval and display** for completed forms
5. **Production deployment** preparation

## 🔧 Environment Setup

### Required Environment Variables
```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."  # Auto-generated
```

### Development Workflow
1. Ensure both `npm run dev` and `npx prisma dev` are running
2. Use Prisma Studio for database inspection: `npx prisma studio`
3. Test form sections incrementally with database integration
4. Follow design system guidelines for consistent UI

## 📝 Notes

- The original form includes an Excel scorecard with auto-calculations that need to be replicated
- Form generates confidential documents requiring future access controls
- Scoring uses weighted calculations: Impact (Mission 50% + Need 50%), Value (Art 50% + Market 50%)
- Final recommendations based on Impact vs Value matrix positioning
