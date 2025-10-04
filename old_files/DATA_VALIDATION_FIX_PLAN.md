# Data Validation and Storage Issues - Fix Plan

## Date: 2025-09-23

## Issues Identified During Testing

### 1. Double JSON.stringify Issue
**Problem**: All string values in the database are being stored with triple-escaped quotes
- Example: `"\"\\\"TECH-2025-001\\\"\"` instead of `"TECH-2025-001"`
- Root Cause: The API endpoint is calling `JSON.stringify()` on values that are already strings
- Location: `/src/app/api/form-submissions/route.ts` lines 36 and 260

### 2. Data Type Inconsistencies
**Problem**: Different field types are all being stored as strings
- Dates stored as strings instead of Date objects
- Numbers stored as strings instead of integers/floats
- Arrays properly stored but could be optimized

### 3. Missing Form Validation
**Problem**: No validation for required fields before submission
- Users can submit forms with missing required data
- No error messages for incomplete forms
- No client-side validation feedback

### 4. Repeatable Group Storage Issue
**Problem**: Repeatable group data is also being double-stringified
- Location: `/src/app/api/form-submissions/route.ts` line 62

## Detailed Fix Plan

### Step 1: Fix JSON.stringify Issues in API Route

**File**: `/src/app/api/form-submissions/route.ts`

**Changes Required**:
```typescript
// Line 36 - BEFORE:
value: JSON.stringify(value),

// Line 36 - AFTER:
value: value,  // Prisma handles JSON serialization automatically

// Line 260 - BEFORE (in update operation):
value: JSON.stringify(value),

// Line 260 - AFTER:
value: value,

// Line 62 - BEFORE (repeatable groups):
data: JSON.stringify(rowData),

// Line 62 - AFTER:
data: rowData,
```

**Reasoning**: The database field is already of type `Json` in Prisma, which automatically handles serialization/deserialization.

### Step 2: Add Proper Data Type Handling

**Create New File**: `/src/lib/form-engine/utils/data-preparation.ts`

```typescript
import { FieldType } from '@prisma/client';

export function prepareValueForStorage(
  value: any,
  fieldType?: FieldType
): any {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }

  // Handle different field types
  switch (fieldType) {
    case FieldType.INTEGER:
      return typeof value === 'string' ? parseInt(value, 10) : value;

    case FieldType.SCORING_0_3:
      return typeof value === 'string' ? parseInt(value, 10) : value;

    case FieldType.DATE:
      // Keep as ISO string for consistency
      return value;

    case FieldType.MULTI_SELECT:
    case FieldType.CHECKBOX_GROUP:
      // Ensure arrays stay as arrays
      return Array.isArray(value) ? value : [value];

    case FieldType.REPEATABLE_GROUP:
      // Keep as is - already an array of objects
      return value;

    default:
      // For text fields and others, keep as is
      return value;
  }
}
```

### Step 3: Add Form Validation

**File**: `/src/lib/form-engine/utils/validation.ts`

```typescript
export function validateRequiredFields(
  responses: Record<string, any>,
  questions: FormQuestion[]
): ValidationResult {
  const errors: Record<string, string> = {};
  const missingRequired: string[] = [];

  questions.forEach(question => {
    if (question.isRequired) {
      const value = responses[question.fieldCode];

      if (value === undefined || value === null || value === '') {
        errors[question.fieldCode] = 'This field is required';
        missingRequired.push(question.label);
      }

      // Special handling for arrays
      if (Array.isArray(value) && value.length === 0) {
        errors[question.fieldCode] = 'Please select at least one option';
        missingRequired.push(question.label);
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    missingRequired
  };
}
```

### Step 4: Update Form Submission Handler

**File**: `/src/app/dynamic-form/page.tsx`

Add validation before submission:
```typescript
const handleSubmit = async (data: FormEngineState) => {
  // Validate required fields
  const validation = validateRequiredFields(
    data.responses,
    getAllQuestions(template)
  );

  if (!validation.isValid) {
    toast.error(`Please complete all required fields: ${validation.missingRequired.join(', ')}`);
    return;
  }

  // Continue with submission...
}
```

### Step 5: Data Migration for Existing Records

**Create Migration Script**: `/prisma/migrations/fix_json_data.ts`

```typescript
// Script to fix existing malformed data
async function fixExistingData() {
  const responses = await prisma.questionResponse.findMany();

  for (const response of responses) {
    try {
      // Parse triple-escaped strings
      let fixedValue = response.value;

      // If it's a string that looks like it was double-stringified
      if (typeof fixedValue === 'string' && fixedValue.startsWith('"')) {
        fixedValue = JSON.parse(fixedValue);
        if (typeof fixedValue === 'string' && fixedValue.startsWith('"')) {
          fixedValue = JSON.parse(fixedValue);
        }
      }

      // Update the record
      await prisma.questionResponse.update({
        where: { id: response.id },
        data: { value: fixedValue }
      });
    } catch (error) {
      console.error(`Failed to fix response ${response.id}:`, error);
    }
  }
}
```

## Testing Plan

### After Implementation:
1. **Test New Submissions**:
   - Submit form with all field types
   - Verify data appears correctly in Prisma Studio
   - Check that scoring calculations still work

2. **Test Validation**:
   - Try submitting with missing required fields
   - Verify error messages appear
   - Check that form prevents submission

3. **Test Data Types**:
   - Submit integers and verify they're stored as numbers
   - Submit dates and verify format
   - Submit multi-select and verify array storage

4. **Test Existing Data**:
   - Run migration script on test data
   - Verify existing submissions display correctly
   - Check that editing works properly

## Additional Improvements to Consider

1. **Add Loading States**: Show loading spinners during submission
2. **Add Success Feedback**: Better success messages after submission
3. **Add Draft Auto-save**: Periodically save drafts to prevent data loss
4. **Add Field-level Validation**: Real-time validation as user types
5. **Add Confirmation Dialog**: Confirm before submitting final form

## Error Handling Improvements

1. Add try-catch blocks in API routes
2. Return meaningful error messages
3. Log errors to monitoring service
4. Add retry logic for network failures
5. Show user-friendly error messages

## Summary

The main issue is that the API is unnecessarily stringifying values that are already in the correct format. Since Prisma's `Json` field type handles serialization automatically, we just need to pass the values directly. This will fix the triple-escaping issue and ensure data is stored correctly in the database.

The validation improvements will prevent bad data from being submitted in the first place, improving data quality and user experience.