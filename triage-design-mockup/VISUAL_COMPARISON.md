# Visual Comparison Checklist

## How to Compare:

1. **Open Production:** http://localhost:3000/dynamic-form
2. **Open Mockup:** http://localhost:5173
3. **Compare side-by-side**

---

## Layout Structure ✓

### Top Navigation Bar
- [ ] White background (bg-white)
- [ ] Border bottom
- [ ] ✚ symbol + "Technology Triage" title
- [ ] Buttons: My Drafts, Builder, Home
- [ ] Icons: FileText, Hammer, Home

### Page Background
- [ ] Gray background (bg-gray-50)
- [ ] Full height (min-h-screen)

### Container
- [ ] Centered (mx-auto)
- [ ] Max width 4xl (max-w-4xl)
- [ ] Padding: px-4 py-8

### Form Header
- [ ] Large title (text-2xl font-bold)
- [ ] Description text (text-gray-600)
- [ ] Version text (text-sm text-gray-500)
- [ ] Margin bottom mb-8

---

## Section Rendering ✓

### Section Card
- [ ] White Card component
- [ ] CardHeader with section title (text-xl)
- [ ] Section description (text-sm text-muted-foreground)
- [ ] CardContent with space-y-6

### Key Behavior
- [ ] **ONLY ONE section visible at a time**
- [ ] Section changes when clicking Next/Previous
- [ ] Questions inside section are space-y-6

---

## Question Cards ✓

### Each Question
- [ ] Wrapped in Card component
- [ ] CardContent with pt-6
- [ ] Label with question text
- [ ] Required asterisk (*) if required
- [ ] Help text below label (if present)
- [ ] Field component below help text
- [ ] Proper spacing (space-y-4 wrapper, space-y-2 label area)

### Field Types
- [ ] Text inputs render correctly
- [ ] Textareas render correctly
- [ ] Select dropdowns render correctly
- [ ] Scoring buttons render correctly
- [ ] Radio buttons render correctly
- [ ] Tables render with "Add row" button

---

## Navigation Component ✓

### Progress Section
- [ ] "Section X of Y" text (left)
- [ ] "XX% Complete" text (right)
- [ ] Progress bar component
- [ ] Text is text-sm text-muted-foreground

### Button Layout
- [ ] Previous button (left side)
  - [ ] Outline variant
  - [ ] ChevronLeft icon
  - [ ] Disabled on first section
- [ ] Right side buttons:
  - [ ] Export PDF (outline)
  - [ ] Save Draft (outline) + Next button on middle sections
  - [ ] Save Draft (outline) + Submit button on last section

### Icons
- [ ] ChevronLeft on Previous
- [ ] Download on Export PDF
- [ ] Save on Save Draft
- [ ] ChevronRight on Next
- [ ] Send on Submit

---

## Colors & Styling ✓

### Production Colors (OKLCH)
- [ ] Primary blue matches (#2563eb)
- [ ] Gray background matches (bg-gray-50)
- [ ] White cards match
- [ ] Text colors match (muted-foreground, gray-600, etc.)
- [ ] Border colors match

### Spacing
- [ ] space-y-8 between section and navigation
- [ ] space-y-6 between questions
- [ ] space-y-4 within question cards
- [ ] space-y-2 between label and help text

---

## Functionality (Mock Behavior)

- [ ] Clicking Next advances to next section
- [ ] Clicking Previous goes to previous section
- [ ] Previous disabled on first section
- [ ] Navigation shows "Submit Form" on last section instead of Next
- [ ] Progress bar updates as you navigate
- [ ] Percentage updates correctly

---

## Final Verification

**Does the mockup look identical to production?**
- [ ] Layout structure matches
- [ ] Spacing matches
- [ ] Colors match
- [ ] Typography matches
- [ ] Navigation matches
- [ ] One section at a time (not all sections)
- [ ] Icons are identical

---

## Known Differences (Acceptable)

✅ Title says "(Mockup)" instead of "(Dynamic)"
✅ No backend functionality (buttons just log to console)
✅ No actual form validation
✅ No data persistence
✅ Mock data instead of database data

These are expected - the mockup is for **visual design only**.

---

## If Something Doesn't Match:

1. Note which specific element looks different
2. Take a screenshot if possible
3. Check browser console for errors
4. Verify the mockup dev server reloaded (check terminal)
5. Hard refresh the page (Ctrl+Shift+R)
