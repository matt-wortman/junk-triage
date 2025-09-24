# Phase 0 Investigation Findings - Data Persistence Issue

## Executive Summary

The data clearing behavior in `renderer.tsx` was **NOT intentional** and represents a design flaw in the initial implementation. This is confirmed by examining the git history, code structure, and original design intent.

## Root Cause Analysis

### The Issue
**Location:** `src/lib/form-engine/renderer.tsx` lines 24-33
**Problem:** The `SET_TEMPLATE` action in the reducer unconditionally clears all form data:

```typescript
case 'SET_TEMPLATE':
  return {
    ...state,
    template: action.payload,
    responses: {},           // ❌ CLEARS ALL USER DATA
    repeatGroups: {},        // ❌ CLEARS ALL USER DATA
    currentSection: 0,
    errors: {},
    calculatedScores: null
  };
```

### Original Design Intent
**Evidence from code analysis:**

1. **FormEngineProvider accepts `initialData` prop** (lines 144-153)
   ```typescript
   const initialState: FormState = {
     template: null,
     responses: initialData?.responses || {},      // ✅ Intended to preserve data
     repeatGroups: initialData?.repeatGroups || {},// ✅ Intended to preserve data
     currentSection: 0,
     // ...
   };
   ```

2. **TypeScript interfaces support draft loading**
   - `FormSubmissionData` type includes `status: 'DRAFT' | 'SUBMITTED'`
   - `initialData` parameter in FormEngineProvider interface
   - Actions like `saveDraftResponse` in the page component

3. **Commit message claims testing passed**
   - Original commit (627cb4c) states "All tests passing: Form loads, navigation works, fields interactive, data captured correctly"
   - However, no actual test files were committed

## Why This Was Not Intentional

### 1. **Contradictory Implementation**
The code has two conflicting behaviors:
- **Provider initialization**: Properly loads `initialData` into state
- **Template loading**: Immediately wipes that data when template loads

### 2. **Missing Use Case Coverage**
The original implementation only tested "new form" scenarios, not "resume draft" scenarios:
- No tests for draft loading
- No tests for data persistence across page refreshes
- No integration tests for the complete draft workflow

### 3. **Architectural Inconsistency**
The pattern doesn't make sense for a production form system:
- Why accept `initialData` if you're going to ignore it?
- Why have draft saving if loading always starts fresh?
- Why clear validation errors when loading saved data?

### 4. **Timeline Pressure Evidence**
Based on commit history, the entire dynamic form engine was implemented in a single commit with extensive scope:
- 27 files changed, 3956+ lines added
- Complex feature set implemented all at once
- No iterative development visible in git history

## Impact Assessment

### Production Blocking Issues
1. **Complete data loss** when users refresh page or return to form
2. **Broken draft functionality** - saved drafts can't be resumed
3. **User experience failure** - no persistence in long multi-section forms
4. **Testing gaps** - core functionality never actually tested

### Secondary Issues
1. **State management confusion** - unclear when data persists vs clears
2. **Validation state inconsistency** - errors cleared inappropriately
3. **Performance impact** - unnecessary re-initialization on every template load

## Proposed Fix Strategy

### Conservative Approach (Recommended)
1. **Modify SET_TEMPLATE action** to preserve existing data:
   ```typescript
   case 'SET_TEMPLATE':
     return {
       ...state,
       template: action.payload,
       // Only reset if no existing data
       responses: Object.keys(state.responses).length > 0 ? state.responses : {},
       repeatGroups: Object.keys(state.repeatGroups).length > 0 ? state.repeatGroups : {},
       currentSection: state.currentSection, // Don't reset section
       // Keep existing errors unless template structure changed
       errors: state.errors,
       calculatedScores: state.calculatedScores
     };
   ```

2. **Add initialization flag** to distinguish first load vs template change
3. **Implement proper data migration** for template version changes

### Validation Requirements
Before implementing fix:
1. **Create test cases** that reproduce the data loss issue
2. **Test draft loading scenarios** end-to-end
3. **Verify no regressions** in new form creation
4. **Test template switching** behavior

## Risk Assessment

### High Risk
- **Modifying core state management** could introduce new bugs
- **Template loading logic** is central to form functionality

### Medium Risk
- **Validation state management** needs careful consideration
- **Section navigation** might be affected

### Low Risk
- Fix is localized to single reducer action
- Behavior change aligns with documented interfaces

## Conclusion

The data clearing behavior was an oversight in rapid development, not an intentional design choice. The fix is straightforward but requires careful testing to ensure no regressions. The original design clearly intended to support data persistence, as evidenced by the TypeScript interfaces and provider structure.

## Next Steps

1. **Create comprehensive test suite** reproducing the bug
2. **Implement conservative fix** with proper data preservation
3. **Add backup mechanisms** (localStorage) as additional safety layer
4. **Validate fix** with extensive testing before proceeding to other features

This investigation confirms that fixing the data persistence issue is the correct approach and aligns with the original system design intent.