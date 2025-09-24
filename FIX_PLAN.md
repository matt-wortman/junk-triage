# 📋 COMPLETE FIX PLAN FOR TECH TRIAGE PLATFORM

## 🔴 CURRENT ISSUES IDENTIFIED

1. **Frontend Error**: `ReferenceError: ShortTextField is not defined`
   - Location: `src/lib/form-engine/fields/FieldAdapters.tsx:376`
   - Cause: I removed `export` keywords from component declarations

2. **Database/API Inconsistency**:
   - Logs show: "Successfully loaded template: CCHMC Technology Triage Form"
   - API returns: `{"error":"No active form template found"}`

3. **Multiple Dev Servers**: Two instances of `npm run dev` running (bash 1b0111 and a3fafb)

4. **Fast Refresh/HMR Corruption**: Module evaluation order broken after my changes

---

## 🛠️ STEP-BY-STEP FIX PLAN

### **STEP 1: Fix Component Exports in FieldAdapters.tsx**
Add back `export` keyword to ALL components:
```typescript
// Line 74 - CHANGE FROM:
const ShortTextField = memo(ShortTextFieldComponent);
// TO:
export const ShortTextField = memo(ShortTextFieldComponent);

// Line 77 - CHANGE FROM:
const LongTextField: React.FC<FieldProps> = ...
// TO:
export const LongTextField: React.FC<FieldProps> = ...

// Line 92 - CHANGE FROM:
const IntegerField: React.FC<FieldProps> = ...
// TO:
export const IntegerField: React.FC<FieldProps> = ...

// Line 106 - CHANGE FROM:
const SingleSelectField: React.FC<FieldProps> = ...
// TO:
export const SingleSelectField: React.FC<FieldProps> = ...

// Line 124 - CHANGE FROM:
const MultiSelectField: React.FC<FieldProps> = ...
// TO:
export const MultiSelectField: React.FC<FieldProps> = ...

// Line 155 - CHANGE FROM:
const CheckboxGroupField: React.FC<FieldProps> = ...
// TO:
export const CheckboxGroupField: React.FC<FieldProps> = ...

// Line 186 - CHANGE FROM:
const DateField: React.FC<FieldProps> = ...
// TO:
export const DateField: React.FC<FieldProps> = ...

// Line 199 - CHANGE FROM:
const ScoringField: React.FC<FieldProps> = ...
// TO:
export const ScoringField: React.FC<FieldProps> = ...

// Line 232 - CHANGE FROM:
const RepeatableGroupField: React.FC<FieldProps> = ...
// TO:
export const RepeatableGroupField: React.FC<FieldProps> = ...

// Line 365 - CHANGE FROM:
const ScoringMatrixField: React.FC<FieldProps> = ...
// TO:
export const ScoringMatrixField: React.FC<FieldProps> = ...
```

### **STEP 2: Kill All Running Processes**
```bash
# Kill all Next.js dev servers
pkill -f "next dev"

# Kill Prisma processes
pkill -f "prisma"
```

### **STEP 3: Clear All Caches**
```bash
# Remove Next.js build cache
rm -rf .next

# Remove node_modules cache
rm -rf node_modules/.cache

# Clear Turbopack cache
rm -rf .turbo
```

### **STEP 4: Check/Fix Database**
```bash
# Check if database has data
npx prisma studio
# OR run seed script
npx prisma db seed
```

### **STEP 5: Restart Services in Correct Order**
```bash
# 1. Start Prisma dev server
npx prisma dev

# 2. Wait for it to show:
# "Your prisma dev server is ready and listening on ports 51213-51215"

# 3. Then start Next.js dev server (only ONE instance)
npm run dev
```

### **STEP 6: Verify Everything Works**
1. Check database connection:
   ```bash
   curl http://localhost:3000/api/form-templates
   ```
   Should return actual form template data, not an error

2. Check dynamic form page:
   - Navigate to http://localhost:3000/dynamic-form
   - Should load without errors
   - Form fields should render properly

3. Check console for errors:
   - No "ShortTextField is not defined" error
   - No database connection errors

---

## 📝 LESSONS LEARNED

1. **Don't remove exports without checking dependencies** - Other files might import them
2. **Check ALL error sources** - Database, API, and frontend can all contribute
3. **Fast Refresh can corrupt state** - Full restart often needed
4. **Multiple dev servers cause conflicts** - Always check for duplicate processes
5. **Verify assumptions** - The error message might not point to the real problem

---

## ✅ EXPECTED OUTCOME

After following these steps:
- Dynamic form will load successfully
- All field components will render properly
- Database will connect and provide form templates
- No JavaScript errors in console
- Single dev server instance running

---

## 🚨 IF ISSUES PERSIST

1. Check for circular dependencies:
   ```bash
   npx madge --circular --extensions ts,tsx src/
   ```

2. Try alternative fix for components:
   ```typescript
   // Direct memo in mapping
   export const FieldComponents = {
     [FieldType.SHORT_TEXT]: memo(ShortTextFieldComponent),
     // ... etc
   }
   ```

3. Full reinstall:
   ```bash
   rm -rf node_modules
   npm install
   npx prisma generate
   ```

---

## 🤖 CLAUDE'S SELF-IMPOSED RULES (To Prevent Future Breaks)

### RULE 1: UNDERSTAND BEFORE ACTING
- **ALWAYS** fully understand the error before attempting any fix
- **NEVER** make speculative changes hoping they'll work
- **ALWAYS** trace the exact error path and understand why it's happening

### RULE 2: VERIFY ASSUMPTIONS
- **ALWAYS** use context7 to check best practices for the specific pattern
- **ALWAYS** use the planning agent to validate approach before editing
- **NEVER** assume I know the solution without verification

### RULE 3: MINIMAL CHANGES FIRST
- **START** with the smallest possible change
- **TEST** each change individually
- **NEVER** make multiple structural changes at once

### RULE 4: PRESERVE WORKING CODE
- **NEVER** remove exports/imports without understanding dependencies
- **ALWAYS** check what other files depend on the code I'm changing
- **BACKUP** mentally what was working before changes

### RULE 5: USE AVAILABLE TOOLS
- **USE** context7 for framework-specific patterns
- **USE** planning agent for complex decisions
- **USE** grep/search to find all usages before changing exports