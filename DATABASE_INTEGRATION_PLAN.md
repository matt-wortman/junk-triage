# Database Integration Plan for Tech Triage Platform

## Current State Analysis (2025-09-22)
The form UI is fully implemented with all 9 sections, auto-calculating scores, and the Impact vs Value matrix. **Recent improvements include enhanced Score & Recommendation layout with proper IMPACT/VALUE hierarchy and production-ready code quality.** However, the form currently lacks database connectivity - the save/submit functions only log to console.

## Implementation Plan

### Phase 1: Database Connection & Server Actions
1. **Create Server Actions** for form operations:
   - `createTriageForm` - Save new form submission
   - `updateTriageForm` - Update existing draft
   - `getTriageForm` - Retrieve form by ID
   - `listTriageForms` - List all forms with filtering

2. **Update Prisma Schema** to include missing fields:
   - Add market sub-scores (marketSizeScore, patientPopulationScore, competitorsScore)
   - Add summaryText field
   - Ensure all relationships are properly configured

3. **Generate Prisma Client** and run migrations

### Phase 2: Form Submission Logic
1. **Implement handleSubmit** in form page:
   - Validate all required fields
   - Calculate final scores before submission
   - Save form data with related competitors and SMEs
   - Handle success/error states with toast notifications

2. **Implement handleSaveDraft**:
   - Allow partial form saves
   - Update status to "draft"
   - Return form ID for future editing

### Phase 3: Form Validation
1. **Create Zod schemas** for each form section
2. **Add validation to form submission**
3. **Display validation errors** in UI

### Phase 4: Additional Features
1. **Create form list page** (`/app/forms/page.tsx`)
2. **Add edit functionality** - Load existing forms
3. **Implement status workflow** (draft → submitted → reviewed)
4. **Add authentication context** (if needed)

### Phase 5: Testing & Polish
1. **Test complete flow**: Create, save draft, edit, submit
2. **Verify score calculations** persist correctly
3. **Test error handling** and edge cases
4. **Add loading states** during API calls

## Files to Create/Modify

### New Files to Create:
- `/app/actions/triage-forms.ts` - Server actions for database operations
- `/lib/validations.ts` - Zod schemas for form validation
- `/app/forms/page.tsx` - Form list view
- `/app/form/[id]/page.tsx` - Edit existing forms

### Files to Modify:
- `/prisma/schema.prisma` - Update schema with missing fields
- `/app/form/page.tsx` - Connect handleSubmit and handleSaveDraft to server actions

## Detailed Implementation Steps

### Step 1: Update Prisma Schema
```prisma
// Add to TriageForm model:
marketSizeScore         Int    @default(0)
patientPopulationScore  Int    @default(0)
competitorsScore        Int    @default(0)
summaryText            String @default("")
```

### Step 2: Run Database Migration
```bash
npx prisma migrate dev --name add-market-subscores
npx prisma generate
```

### Step 3: Create Server Actions (`/app/actions/triage-forms.ts`)
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { FormData } from "@/app/form/page";
import { calculateAllScores } from "@/lib/scoring";

export async function createTriageForm(data: FormData) {
  const scores = calculateAllScores(data);

  const form = await prisma.triageForm.create({
    data: {
      // All form fields
      reviewer: data.reviewer,
      technologyId: data.technologyId,
      // ... etc

      // Calculated scores
      impactScore: scores.impactScore,
      valueScore: scores.valueScore,
      recommendation: scores.recommendation,

      // Related data
      competitors: {
        create: data.competitors
      },
      experts: {
        create: data.subjectMatterExperts
      }
    }
  });

  return { success: true, id: form.id };
}

export async function updateTriageForm(id: string, data: Partial<FormData>) {
  // Update logic
}

export async function getTriageForm(id: string) {
  // Retrieve logic with includes for related data
}

export async function listTriageForms(status?: string) {
  // List logic with optional filtering
}
```

### Step 4: Update Form Page (`/app/form/page.tsx`)
```typescript
import { createTriageForm, updateTriageForm } from "@/app/actions/triage-forms";
import { toast } from "sonner";

const handleSubmit = async () => {
  try {
    const result = await createTriageForm(formData);
    if (result.success) {
      toast.success("Form submitted successfully!");
      // Redirect to success page or form list
    }
  } catch (error) {
    toast.error("Failed to submit form");
  }
};

const handleSaveDraft = async () => {
  try {
    const draftData = { ...formData, status: "draft" };
    const result = await updateTriageForm(formId, draftData);
    if (result.success) {
      toast.success("Draft saved!");
    }
  } catch (error) {
    toast.error("Failed to save draft");
  }
};
```

## Success Criteria
✅ Forms save to database successfully
✅ Draft functionality works
✅ Scores calculate and persist correctly
✅ Related data (competitors, SMEs) saves properly
✅ Form list and editing features work
✅ Proper error handling and user feedback

## Commands to Run When Resuming

1. **Start development server:**
   ```bash
   cd /home/matt/code_projects/Junk/tech-triage-platform
   npm run dev
   ```

2. **Start Prisma database (if not running):**
   ```bash
   npx prisma dev
   ```

3. **Check database status:**
   ```bash
   npx prisma studio
   ```

## Notes for Resuming
- The form UI is complete and tested with enhanced layout improvements
- All scoring calculations work correctly and have been thoroughly validated
- Score & Recommendation section now has professional layout with IMPACT/VALUE hierarchy
- Production-ready code quality with memoization, validation, and accessibility
- The database schema exists but needs the market sub-scores added
- No API routes or server actions exist yet
- Prisma is configured and ready to use
- Comprehensive test suites have been created for component validation

## Context Files
- Main form: `/app/form/page.tsx`
- Enhanced score section: `/components/form/ScoreRecommendationSection.tsx` (recently improved)
- Database schema: `/prisma/schema.prisma`
- Scoring logic: `/lib/scoring.ts`
- Form sections: `/components/form/*`
- Test files: `/tests/score-recommendation-section/*` (created for validation)

When you return, start with Phase 1: updating the Prisma schema and creating the server actions.