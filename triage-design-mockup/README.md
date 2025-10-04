# Tech Triage Form - Design Mockup

This is a **separate, lightweight environment** for experimenting with visual design for the Tech Triage Platform dynamic form.

## Purpose

- Visual design experimentation
- Quick UI/UX prototyping
- Color, spacing, and layout testing
- Component styling iteration
- **NOT** connected to any database or backend

## Tech Stack

- **Vite** - Fast dev server with HMR
- **React 19** - Same as main project
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Components copied from main project

## Getting Started

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The mockup will be available at **http://localhost:5173**

## Project Structure

```
triage-design-mockup/
├── src/
│   ├── App.tsx              # Main mockup component
│   ├── components/ui/       # shadcn/ui components (copied from main)
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   └── index.css           # Tailwind imports
└── package.json
```

## Usage

1. **Edit `src/App.tsx`** to experiment with form layouts
2. **Modify Tailwind classes** to test colors, spacing, etc.
3. **Copy successful designs** back to the main project
4. **No database needed** - this is pure frontend mockup

## Copying Components

All shadcn/ui components have been copied from the main project:
- Button
- Input
- Textarea
- Card
- Label
- And more...

You can freely modify these for experimentation without affecting the main project.

## Important Notes

⚠️ **This project is separate from tech-triage-platform**
- Changes here don't affect the main project
- Added to main project's `.gitignore`
- No database, no backend, no auth
- Pure visual design experimentation

## Design Workflow

### When You're Happy with a Design

1. **Test it here first** - Experiment freely in the mockup
2. **Document it** - Take screenshots or notes on what changed
3. **Copy to production** - Transfer approved components/styles
4. **Test with real data** - Verify it works with production backend
5. **Commit to production** - Only commit to tech-triage-platform repo

### File Mapping (Mockup → Production)

| Mockup File | Production File |
|-------------|-----------------|
| `src/components/ui/*` | `../tech-triage-platform/src/components/ui/*` |
| `src/components/FieldCard.tsx` | `../tech-triage-platform/src/components/form-builder/FieldCard.tsx` |
| Custom styling | Copy Tailwind classes to production components |

### Design System Sync

✅ **Already synchronized:**
- Tailwind config matches production exactly
- CSS variables match production theme
- Color palette: CCHMC brand blue (#2563eb)
- Typography: Inter, Poppins, Open Sans
- Component styling: shadcn/ui

### What to Experiment With

**Safe to try:**
- ✅ Layout changes (spacing, positioning)
- ✅ Color variations (within brand palette)
- ✅ Typography adjustments
- ✅ Component compositions
- ✅ Animation/transition effects

**Need production testing:**
- ⚠️ Form validation logic
- ⚠️ Data table interactions
- ⚠️ Scoring calculations
- ⚠️ API integrations

---

## Component Development Tips

### Adding New Field Types
1. Add field type to `FormField` interface
2. Create render case in `FieldCard.tsx`
3. Test with mock data
4. Copy to production field adapters

### Testing Responsive Design
```bash
# Dev server supports mobile testing
npm run dev
# Then use browser DevTools to test different screen sizes
```

### Using Production Components
Copy any component from production's `src/components/` to mockup for experimentation:
```bash
# Example: Copy a component for testing
cp ../tech-triage-platform/src/components/ui/badge.tsx src/components/ui/
```

---

**Quick Commands:**
- `npm run dev` - Start dev server (http://localhost:5173)
- `npm run build` - Build for production (rarely needed)
- `npm run lint` - Run ESLint
