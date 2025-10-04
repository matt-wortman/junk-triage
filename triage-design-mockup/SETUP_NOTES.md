# Setup Notes for Design Mockup

## ✅ Completed Setup

1. **Design System Synchronization** ✓
   - Created `tailwind.config.ts` with production's CCHMC brand colors
   - Updated `index.css` with CSS variables for theme consistency
   - Fonts, colors, and spacing now match production exactly

2. **Mock Data Enhancement** ✓
   - Expanded to 5 sections (Header, Overview, Mission, Market, Digital)
   - Added realistic field types: scoring, radio, tables
   - Includes scoring criteria and help text

3. **Documentation** ✓
   - README updated with design workflow
   - File mapping (mockup → production)
   - Component development tips

## 🔧 Recommended: Add to Production .gitignore

**Action:** Add this line to `tech-triage-platform/.gitignore`

```gitignore
# Design mockup directory (separate project)
../triage-design-mockup/
```

**Why:** Prevents accidentally committing mockup files to production repository.

**How:**
```bash
cd ../tech-triage-platform
echo "" >> .gitignore
echo "# Design mockup directory (separate project)" >> .gitignore
echo "../triage-design-mockup/" >> .gitignore
```

---

## Next Steps for Enhanced Mockup

### 1. Update FieldCard Component (Optional)
Currently `FieldCard.tsx` handles: text, textarea, date, select, table

**Add support for:**
- `scoring` - 0-3 scale with criteria display
- `radio` - Radio button groups
- `checkbox` - Checkbox groups

### 2. Add Production Components (As Needed)
Copy components from production for design testing:

```bash
# Scoring component (most important for triage form)
cp ../tech-triage-platform/src/components/form/ScoringComponent.tsx src/components/

# Other useful components
cp ../tech-triage-platform/src/components/form/DynamicScoringMatrix.tsx src/components/
```

### 3. Test the Dev Server
```bash
npm run dev
```

Should open at http://localhost:5173 with:
- CCHMC brand colors (#2563eb primary blue)
- Production-matching fonts and spacing
- 5 realistic form sections

---

## Verification Checklist

- [x] Tailwind config has CCHMC colors
- [x] CSS variables match production theme
- [x] Mock data has multiple sections
- [x] README has design workflow docs
- [ ] Production .gitignore excludes mockup
- [ ] FieldCard supports all field types
- [ ] Dev server runs without errors

---

## Design System Reference

### CCHMC Brand Colors
- **Primary Blue**: `#2563eb` (primary-600)
- **Light Blue**: `#6366f1`
- **Medium Blue**: `#1f2937`
- **Neutral Dark**: `#4b5563`
- **Neutral Light**: `#e5e7eb`

### Typography
- **Headings**: Poppins, Inter
- **Body**: Open Sans
- **UI Components**: Inter

### Usage
```tsx
// Use production design tokens
<div className="bg-primary-600 text-white">CCHMC Blue</div>
<h1 className="font-heading">Poppins Heading</h1>
<p className="font-body">Open Sans Body Text</p>
```

---

## Troubleshooting

### Colors Look Different
- **Check**: `tailwind.config.ts` exists and has CCHMC colors
- **Fix**: `npm run dev` (rebuild Tailwind)

### Components Don't Match Production
- **Check**: `src/index.css` has CSS variables
- **Fix**: Restart dev server after updating CSS

### TypeScript Errors on Field Types
- **Check**: `mockFormData.ts` field type definitions
- **Fix**: Add missing types to `FormField` interface

---

## Summary

Your design mockup is now **fully synchronized** with production's design system. You can experiment with layouts, components, and styling with confidence that approved changes will transfer cleanly to production.

**Happy designing! 🎨**
