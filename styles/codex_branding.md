# Dynamic Form Branding Alignment Plan

## Objective
Align the dynamic-form Next.js route with the Cincinnati Children's Hospital style guide by enforcing the specified color palette, typography, and button treatments without altering unrelated product areas.

## Scope
- Pages: `src/app/dynamic-form/page.tsx` and related child routes (e.g., drafts), including loading and error states rendered from the same layout.
- Shared styling artifacts: `src/app/globals.css`, layout font configuration (`src/app/layout.tsx`), and reusable UI components used by the dynamic form (`src/components/ui/*`, key form adapters in `src/lib/form-engine/fields`).
- Deliverables: Updated design tokens, font stacks, button variants, and a brief verification checklist documenting WCAG AA contrast confirmation and state coverage.

### Explicitly Out of Scope
- Rebuilding layout grid, imagery, or additional healthcare-specific modules from the style guide.
- Applying branding to other application routes or marketing assets.
- Introducing new form functionality beyond styling changes.

## Assumptions & Dependencies
- Source Sans Pro and Georgia are available via Google Fonts; no self-hosting required initially.
- Existing Tailwind configuration supports custom CSS variables and provides a central location for theme tokens.
- QA resources can validate contrasts, button behavior, and regression states after implementation.
- No conflicting dark-mode requirements for the dynamic form; dark theme can inherit updated tokens if needed.

## Implementation Plan

### Phase 1 – Preparation & Audit
1. Capture current screenshots of the dynamic form (happy path, validation errors, loading/error states) for comparison.
2. Inventory components and utility classes within the dynamic form that hard-code colors (`bg-gray-50`, `text-gray-600`, etc.) to target during token swap.
3. Note any custom button usages (variants, sizes) to ensure new specs cover them.

### Phase 2 – Typography Alignment
1. Update `src/app/layout.tsx` to load Source Sans Pro (primary) and Georgia (secondary) via `next/font/google`.
2. Replace the Geist font variables with new CSS variables (`--font-source-sans`, `--font-georgia`).
3. In `globals.css`, set `body` to Source Sans Pro and create utility classes or Tailwind theme extensions for the specified heading sizes/line-heights.
4. Adjust component-level typography (section headers, labels, helper text) to use guide-consistent sizes, ensuring the renderer dynamically inherits them.
5. Run page-level pass to verify line length, spacing, and sentence case for headings.

### Phase 3 – Color Token Enforcement
1. Redefine CSS custom properties in `:root` (and `.dark` if active) to match the style guide palette: primary blue `#0055B8`, light blue `#00A9E0`, warm gray `#696969`, light gray `#F5F5F5`, white, and accent colors.
2. Map tokens to Tailwind theme variables so components consume the new palette automatically (`--color-primary`, `--color-muted`, etc.).
3. Replace any residual hard-coded utility classes in dynamic-form templates with semantic classes referencing the updated tokens.
4. Confirm contrast ratios for primary text on background, button text, alerts, and form inputs meet WCAG 2.1 AA.

### Phase 4 – Button Specification Compliance
1. Update `src/components/ui/button.tsx` variant definitions to reflect padding (`12px x 24px` primary, `10px x 22px` secondary), 4px radius, and hover/active darkening of 10–15%.
2. Implement a consistent 3px focus outline with offset using the brand blue and ensure disabled state is 50% opacity.
3. Revise secondary/outline button to match the transparent background with `#0055B8` border and text.
4. Audit all dynamic-form usages (navigation, draft controls) to verify spacing and icon alignment remain correct after padding changes.

### Phase 5 – Form Control Touchpoints
1. Update shared inputs, selects, textareas, checkboxes to use the guide’s neutral borders (`#D0D0D0`), padding, and focus outline rules.
2. Ensure error states leverage the accent red while maintaining accessible contrast and consistent messaging placement.
3. Confirm progress indicators and badges pull from the new palette as needed.

### Phase 6 – Verification & Handoff
1. Run lint/test suites to catch any accidental JSX or Tailwind errors.
2. Perform manual visual QA using the earlier screenshots as baseline; verify states (loading, draft loaded, validation error, submission success).
3. Validate focus states with keyboard-only navigation.
4. Record findings and checklist results in project documentation (append to `Matt's Todo's.txt` or create a new QA note for stakeholders).
5. Prepare follow-up tasks for broader styling (if required) and note any deviations from the style guide.

## Timeline Estimate
- Preparation & Audit: 0.5 day
- Typography update: 0.5 day
- Color token enforcement: 0.5 day
- Button & form control adjustments: 0.5 day
- Verification & documentation: 0.5 day

Total: ~2.5 focused engineering days (single developer) plus QA sign-off time.

## Acceptance Criteria
- Dynamic form renders with Source Sans Pro body text and guide-compliant heading levels across all sections.
- Brand palette fully replaces prior gray/purple scheme, with documented contrast checks for key UI elements.
- Primary and secondary buttons meet padding, radius, hover/active/focus specs and remain functional across all states.
- Inputs, selects, and validation messages align with the guide’s borders, spacing, and focus outlines.
- QA checklist completed with screenshots demonstrating each state post-update.

## Risks & Mitigations
- **Risk:** Hidden components outside the dynamic form share the same UI primitives and inherit the new branding unexpectedly.
  - *Mitigation:* Communicate changes ahead of merge; run smoke tests on other routes; consider feature flag or scoped CSS variables if necessary.
- **Risk:** Font swap increases page load.
  - *Mitigation:* Use `display: swap`, limit subsets to Latin, and monitor Lighthouse performance.
- **Risk:** Contrast regressions due to light blue usage.
  - *Mitigation:* Run automated contrast checks (e.g., axe DevTools) and adjust accent usage if thresholds fail.

## Follow-Up Opportunities
- Extend branding to navigation layout, breadcrumbs, and additional healthcare-specific components once core theming stabilizes.
- Implement automated visual regression tests to guard future styling changes.
- Evaluate dark-mode alignment if the product requires it in later phases.
