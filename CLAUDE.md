# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web application project to replicate the Cincinnati Children's Hospital Medical Center (CCHMC) technology triage form as a modern web form connected to a database. The original form is available as `Triage.pdf` in the project root.

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
The scoring matrix uses simple arithmetic calculations:

**Basic Row Calculation:**
- Score × Weight (%) = Row Total

**Group Totals:**
- Impact Score = Sum of all Impact row totals
- Value Score = Sum of all Value row totals

**Market Score Exception:**
- Market Score = Average of (Market Size + Patient Population + # of Competitors)

**Final Recommendation:**
- Based on Impact vs Value matrix positioning
- Uses 0-3 scale for all criteria input

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

Since this is a new project, standard Next.js commands will apply:
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint
- `npm run type-check` or `npx tsc --noEmit` - TypeScript checking

## Development Notes

- The original PDF includes an embedded Excel scorecard that auto-calculates scores - this logic needs to be implemented in the web form
- Form validation should match the scoring criteria detailed in Exhibit A of the PDF
- The form supports both "Proceed" and "Alternative Pathway" recommendations based on scoring thresholds
- Consider implementing draft/save functionality for long forms
- The form generates confidential documents, so implement appropriate access controls