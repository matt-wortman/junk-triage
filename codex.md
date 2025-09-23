# Dynamic Form Implementation Notes

## Implementations in Repo
- The legacy, hard-coded flow lives at `src/app/form` with section-specific React components under `src/components/form/*Section.tsx`.
- The database-driven experience you care about is mounted at `src/app/dynamic-form/page.tsx`; it renders a dynamic engine fed by Prisma-backed templates.

## Runtime Flow (Dynamic)
1. `dynamic-form/page.tsx` uses `fetch('/api/form-templates')` and expects a `FormTemplateWithSections` payload.
2. The API handler at `src/app/api/form-templates/route.ts` queries Prisma for the first active template, including sections → questions → options/scoringConfig.
3. Once loaded, `FormEngineProvider` and `DynamicFormRenderer` from `src/lib/form-engine/renderer.tsx` drive the UI, and `DynamicFormNavigation` orchestrates pagination + draft/submit hooks.

## Form Engine Architecture
- State: A reducer in `renderer.tsx` tracks `responses`, `repeatGroups`, `currentSection`, errors, and pending scores. Submission/draft handlers currently just log TODOs.
- Context: `useFormEngine()` exposes state mutators such as `setResponse`, `setRepeatGroupData`, `nextSection`, `previousSection`, and wrappers for `submitForm`/`saveDraft`.
- Rendering: `DynamicFormRenderer` sorts sections by `order`, then `DynamicQuestion` evaluates conditional visibility (`conditional-logic.ts`) and requiredness before delegating to field adapters.
- Validation scaffolding exists in `validation.ts`; nothing wires it into user interactions yet.

## Field Components
- `src/lib/form-engine/fields/FieldAdapters.tsx` maps `FieldType` enums to shadcn-based inputs (text, textarea, select, scoring, etc.).
- `RepeatableGroupField` is still a stub (displays placeholder copy; no add/remove rows yet).
- The scoring adapter reuses `src/components/form/ScoringComponent.tsx` and honors the `criteria` JSON stored with each question.

## Data Layer
- Prisma schema (`prisma/schema.prisma`) defines templates, sections, questions, options, scoring configs, submissions, responses, and calculated score tables.
- `prisma/seed/form-structure.ts` describes the full triage template; `prisma/seed/index.ts` clears prior data and seeds the tree.
- `src/lib/prisma.ts` provides the shared Prisma client with verbose query logging enabled in non-prod.

## Notable Gaps / TODOs
- No persisted submission workflow yet—`handleSubmit`/`handleSaveDraft` in `dynamic-form/page.tsx` and provider callbacks need real API wiring.
- Scoring aggregation (`calculatedScores`) and recommendation outputs are placeholders.
- Validation & conditional requirement logic is present but not enforced during navigation/submission.
- Repeatable group UX is missing; dynamic tables for competitors/experts are still pending.
- Navigation component logs data but does not surface validation blockers between sections.

