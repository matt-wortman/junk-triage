# Scoring Matrix Implementation Plan for Dynamic Form

## Problem Statement
The dynamic form (at `/dynamic-form`) is missing the scoring matrix visualization that exists in the hardcoded form (page 8 at `/form`). Currently, the dynamic form only has a basic "Scorecard and Recommendation" section with text fields but lacks the comprehensive scoring matrix with calculations and visualizations.

## Solution Overview
Create a dynamic scoring matrix component that:
1. Automatically calculates scores based on form responses
2. Displays the same visual elements as the hardcoded form (scoring table + Impact vs Value matrix)
3. Works with the database-driven form structure
4. Updates in real-time as users fill out the form

## Confirmed Scoring Logic
Based on CLAUDE.md and existing code:
- **Impact Score**: (Mission Alignment × 0.5) + (Unmet Need × 0.5)
- **Value Score**: (State of Art × 0.5) + (Market Score × 0.5)
- **Market Score**: (Market Size + Patient Population + Competitors) / 3
- **Recommendation Matrix**: 2×2 quadrant with thresholds at 1.5 for Proceed/Alternative/Close

## Implementation Steps

### Step 1: Create Dynamic Scoring Matrix Component
**File**: `src/components/form/DynamicScoringMatrix.tsx`
- Create a new component that can be rendered as a special field type
- Reuse the visual design from `ScoreRecommendationSection.tsx`
- Connect to the form context to access all scoring-related responses
- Display:
  - Scoring table with Impact/Value calculations
  - Market sub-criteria breakdown
  - Impact vs Value matrix visualization
  - Auto-calculated recommendation

### Step 2: Add SCORING_MATRIX Field Type
**File**: `prisma/schema.prisma`
- Update `FieldType` enum to include `SCORING_MATRIX`
- Run migration to update database schema

### Step 3: Create Field Adapter
**File**: `src/lib/form-engine/fields/FieldAdapters.tsx`
- Add new field adapter for `SCORING_MATRIX` type
- Map it to the new `DynamicScoringMatrix` component
- Ensure it integrates with existing field rendering system

### Step 4: Update Database Seed Data
**File**: `prisma/seed/form-structure.ts`
- Add a new question to section 7 ("Scorecard and Recommendation"):
  ```
  Field type: SCORING_MATRIX
  Field code: F6.scoring_matrix
  Label: "Scoring Matrix and Recommendation"
  Order: Place before the summary field
  ```

### Step 5: Connect Scoring Calculations
- Use existing `calculateAllScores` from `lib/scoring/calculations.ts`
- Extract scoring inputs from form responses:
  - `F2.1.score` → Mission Alignment
  - `F2.2.score` → Unmet Need
  - `F3.2.score` → IP Strength/State of Art
  - `F4.4.a` → Market Size
  - `F4.4.b` → Patient Population
  - `F4.4.c` → Competitors

### Step 6: Database Migration & Seeding
1. Run Prisma migration: `npx prisma migrate dev`
2. Re-seed database: `npm run seed`
3. Verify new field type in database

## Files to Modify/Create

### New Files
1. `src/components/form/DynamicScoringMatrix.tsx` - Main scoring matrix component

### Modified Files
1. `src/lib/form-engine/fields/FieldAdapters.tsx` - Add SCORING_MATRIX adapter
2. `prisma/schema.prisma` - Add SCORING_MATRIX to FieldType enum
3. `prisma/seed/form-structure.ts` - Add scoring matrix question to form

## Visual Requirements
- Use same shadcn/ui components as hardcoded form:
  - `Table` for scoring matrix
  - `Card` for containers
  - `Badge` for recommendation display
- Maintain identical color scheme:
  - Blue for Impact rows (#2563EB)
  - Green for Value rows
  - Matrix quadrants: Gray (N/A), Blue (Proceed), Yellow (Alternative), Red (Close)
- Include position marker on Impact vs Value matrix

## Testing Checklist
- [ ] Scoring matrix appears in Section 7 of dynamic form
- [ ] Calculations match hardcoded form exactly
- [ ] Real-time updates when changing score fields
- [ ] Impact vs Value matrix shows correct position
- [ ] Recommendation logic matches (Proceed/Alternative/Close/N/A)
- [ ] Market sub-criteria display correctly
- [ ] Visual styling matches hardcoded form

## Benefits
- **Non-destructive**: Adds functionality without breaking existing form
- **Database-driven**: Scoring matrix becomes configurable via database
- **Reusable**: Can be placed in any form section by updating database
- **Consistent**: Uses same calculations and UI as hardcoded form
- **Real-time**: Updates automatically as users fill out the form

## Success Criteria
The dynamic form will have feature parity with the hardcoded form, displaying the same comprehensive scoring matrix with real-time calculations while maintaining its database-driven flexibility.