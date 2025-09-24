# Test Reproduction Guide - Phase 0 Day 2 Results

## Overview

This document provides comprehensive steps to reproduce all identified bugs in the dynamic form platform. These tests serve as both bug verification and success criteria for the fixes outlined in `revised-plan.md`.

## Testing Framework Setup ✅

### Infrastructure Installed
- **Jest** v30.1.3 - JavaScript testing framework
- **React Testing Library** v16.3.0 - React component testing utilities
- **Jest DOM** v6.8.0 - Custom DOM matchers
- **User Event** v14.6.1 - Realistic user interaction simulation

### Configuration Files
- `jest.config.js` - Jest configuration with Next.js integration
- `jest.setup.js` - Global test environment setup and mocks
- Updated `package.json` with test scripts:
  - `npm test` - Run all tests
  - `npm run test:watch` - Watch mode for development
  - `npm run test:coverage` - Coverage reports

## Bug Reproduction Tests

### 1. Data Persistence Bug ❌ FAILING (Expected)

**File:** `src/__tests__/data-persistence.test.tsx`

**Root Cause:** Reducer clears all responses when template loads (`renderer.tsx:24-33`)

**How to Reproduce:**
```bash
npm test data-persistence.test.tsx
```

**Expected Failure:**
```
Expected: "John Doe"
Received: undefined
```

**Test Coverage:**
- ✅ Form data cleared when template loads with `initialData`
- ✅ RepeatGroups cleared when template loads
- ✅ Section navigation reset to 0 inappropriately
- ✅ Edge cases: empty data, undefined data

**Success Criteria:** All tests pass after reducer fix preserves existing state

### 2. Validation Enforcement Bug ❌ FAILING (Expected)

**File:** `src/__tests__/validation-enforcement.test.tsx`

**Root Cause:** Navigation bypasses validation (`DynamicFormNavigation.tsx:31-35`)

**How to Reproduce:**
```bash
npm test validation-enforcement.test.tsx
```

**Expected Failure:**
```
Unable to find an element with the text: Required Fields Section
```
*(Form skips to Section 2 without validation)*

**Test Coverage:**
- ✅ Navigation allowed with empty required fields (should block)
- ✅ Navigation allowed with invalid field data (should block)
- ✅ Validation messages not preventing navigation
- ✅ Form starts on wrong section due to state clearing

**Success Criteria:** Navigation blocked until validation passes

### 3. Performance Baseline Tests 📊 BASELINE

**File:** `src/__tests__/performance-baseline.test.tsx`

**Purpose:** Establish current performance metrics before optimization

**How to Run:**
```bash
npm test performance-baseline.test.tsx
```

**Metrics Captured:**
- Template loading time (small/medium/large forms)
- Field interaction responsiveness
- Section navigation speed
- Memory usage during extended interaction
- Validation call frequency (debouncing effectiveness)

**Current Baselines:** *(Run tests to establish)*
- Small form (10 questions): < 1000ms
- Medium form (50 questions): < 2000ms
- Large form (100 questions): < 5000ms
- Field input: < 500ms
- Navigation: < 300ms

## Manual Reproduction Steps

### Data Persistence Bug
1. Open dynamic form with pre-filled data
2. Observe data loads correctly initially
3. Template loading process triggers
4. **BUG:** All form data disappears
5. User loses work, must restart

### Validation Enforcement Bug
1. Navigate to dynamic form
2. Leave required fields empty
3. Click "Next" button
4. **BUG:** Navigation proceeds without validation
5. User can submit incomplete/invalid forms

## Root Cause Documentation

### Bug 1: Data Clearing in SET_TEMPLATE Action
```typescript
// CURRENT (BROKEN) - renderer.tsx:24-33
case 'SET_TEMPLATE':
  return {
    ...state,
    template: action.payload,
    responses: {},           // ❌ CLEARS ALL USER DATA
    repeatGroups: {},        // ❌ CLEARS ALL USER DATA
    currentSection: 0,       // ❌ RESETS NAVIGATION
    errors: {},
    calculatedScores: null
  };

// EXPECTED FIX
case 'SET_TEMPLATE':
  return {
    ...state,
    template: action.payload,
    responses: state.responses,        // ✅ PRESERVE DATA
    repeatGroups: state.repeatGroups, // ✅ PRESERVE DATA
    currentSection: state.currentSection, // ✅ PRESERVE NAVIGATION
    errors: state.errors,              // ✅ PRESERVE VALIDATION STATE
    calculatedScores: state.calculatedScores
  };
```

### Bug 2: Missing Validation in Navigation
```typescript
// CURRENT (BROKEN) - DynamicFormNavigation.tsx:31-35
const handleNext = () => {
  if (!isLastSection) {
    nextSection();        // ❌ NO VALIDATION CHECK
  }
};

// EXPECTED FIX
const handleNext = () => {
  if (!isLastSection) {
    const validationResult = validateCurrentSection();
    if (validationResult.hasErrors) {
      // Show errors, don't advance           // ✅ BLOCK NAVIGATION
      return;
    }
    nextSection();                           // ✅ ONLY ADVANCE IF VALID
  }
};
```

## Test Execution Results

### All Tests Status
```bash
# Run all reproduction tests
npm test

# Expected Results (Phase 0 Day 2):
# ❌ Data persistence: 2 failing, 3 passing (documents edge cases)
# ❌ Validation enforcement: 5 failing, 2 passing (documents expected behavior)
# 📊 Performance baseline: All passing (establishes metrics)
```

### Individual Test Commands
```bash
# Data persistence tests
npm test data-persistence.test.tsx

# Validation enforcement tests
npm test validation-enforcement.test.tsx

# Performance baseline tests
npm test performance-baseline.test.tsx
```

## Success Criteria for Phase 1

### After Data Persistence Fix
```bash
npm test data-persistence.test.tsx
# Expected: ✅ All tests passing
# - Form data preserved across template loads
# - RepeatGroups maintained correctly
# - Navigation state preserved appropriately
```

### After Validation Enforcement Fix
```bash
npm test validation-enforcement.test.tsx
# Expected: ✅ All tests passing
# - Navigation blocked on validation errors
# - Required fields enforced before progression
# - Validation messages prevent form advancement
```

### After Performance Optimization
```bash
npm test performance-baseline.test.tsx
# Expected: ✅ All tests passing with improved metrics
# - Faster loading times
# - Reduced memory usage
# - Fewer unnecessary re-renders
# - Effective debouncing implemented
```

## Integration with Development Plan

### Phase 1: Direct Bug Fixes (Days 3-5)
1. **Day 3:** Fix data persistence using tests as validation
2. **Day 4:** Fix validation enforcement using tests as validation
3. **Day 5:** All reproduction tests should pass

### Continuous Validation
- Run tests before any code changes
- Run tests after implementing fixes
- Use tests to prevent regression
- Performance tests track optimization progress

## Test Maintenance

### When to Update Tests
- ✅ When business requirements change
- ✅ When adding new validation rules
- ✅ When performance targets change
- ❌ Never modify tests to make them pass without fixing the underlying bug

### Adding New Tests
- Follow same pattern as existing tests
- Include both positive and negative test cases
- Document expected behavior clearly
- Measure performance impact of new features

## Conclusion

These reproduction tests provide:
1. **Concrete proof** of the identified bugs
2. **Clear success criteria** for fixes
3. **Regression prevention** for future development
4. **Performance baselines** for optimization tracking

The failing tests confirm our investigation findings and provide the foundation for the direct bug fix approach outlined in `revised-plan.md`. Once the reducer and navigation fixes are implemented, these tests should pass, proving the bugs are resolved.

**Next Step:** Proceed with Phase 1 implementation using these tests as validation criteria.