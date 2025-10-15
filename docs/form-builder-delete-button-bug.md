# Form Builder Delete Button Bug

**Date:** 2025-10-15
**Issue:** Delete template button in AlertDialog doesn't submit form
**Status:** ✅ FIXED AND VERIFIED

## Symptoms

1. User creates a test form template successfully (✅ working after redirect fix)
2. User attempts to delete the test template
3. Clicks the red "Delete" button
4. AlertDialog confirmation popup appears
5. User clicks "Delete" in the confirmation dialog
6. **Dialog closes but template is NOT deleted**
7. No error messages, no redirect, nothing happens

## Root Cause

**Missing `type="submit"` attribute on AlertDialogAction button**

Location: `tech-triage-platform/src/app/dynamic-form/builder/page.tsx` (lines 338-346)

### Current Code

```tsx
<AlertDialogFooter>
  <AlertDialogCancel>Cancel</AlertDialogCancel>
  <form action={deleteTemplateAction}>
    <input type="hidden" name="templateId" value={template.id} />
    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
      Delete
    </AlertDialogAction>
  </form>
</AlertDialogFooter>
```

### The Problem

The `AlertDialogAction` component renders as a `<button>` element, but without an explicit `type="submit"` attribute:
- Default button type in HTML is `type="button"` (does nothing)
- When clicked, it triggers the AlertDialog's close behavior
- It does NOT submit the form because it's not marked as a submit button
- Result: Dialog closes, form never submits, server action never executes

### Why This Wasn't Caught Earlier

1. **Visual feedback looks correct** - Dialog opens/closes smoothly
2. **No JavaScript errors** - Everything is working as coded
3. **Clone button works** - But it uses a different pattern (direct form without dialog)
4. **FieldCard delete works** - But it uses onClick handler pattern, not form submission

### Comparison: Clone Button (Working)

Lines 317-323 show the clone button pattern:
```tsx
<form action={cloneTemplateAction} className="inline">
  <input type="hidden" name="templateId" value={template.id} />
  <Button type="submit" variant="outline" size="sm" className="shadow-sm">
    <Copy className="h-4 w-4" />
    Clone
  </Button>
</form>
```

This works because `Button` component defaults to `type="submit"` when inside a form, or it's explicitly set.

### Comparison: FieldCard Delete (Working)

Lines 155-161 in `FieldCard.tsx` show a different working pattern:
```tsx
<AlertDialogAction
  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
  onClick={() => !disabled && handleDelete()}
  disabled={disabled}
>
  Delete field
</AlertDialogAction>
```

This works because it uses an `onClick` handler that directly calls a server action, bypassing form submission entirely.

## Solution

Add `type="submit"` attribute to the `AlertDialogAction` button.

### Fixed Code

```tsx
<AlertDialogFooter>
  <AlertDialogCancel>Cancel</AlertDialogCancel>
  <form action={deleteTemplateAction}>
    <input type="hidden" name="templateId" value={template.id} />
    <AlertDialogAction
      type="submit"
      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
    >
      Delete
    </AlertDialogAction>
  </form>
</AlertDialogFooter>
```

### Why This Works

1. `AlertDialogAction` component spreads `{...props}` (see `alert-dialog.tsx` line 111)
2. This means it accepts any valid button props including `type="submit"`
3. When `type="submit"` is set, clicking the button will:
   - Submit the form (executing `deleteTemplateAction`)
   - Close the dialog (built-in AlertDialog behavior)
4. Result: Both actions happen correctly

## Implementation Notes

- **File to modify:** `tech-triage-platform/src/app/dynamic-form/builder/page.tsx`
- **Line:** 342
- **Change:** Add `type="submit"` prop
- **Testing:** Delete a template and verify it redirects to `?status=deleted`

## Related Issues

This is separate from the redirect bug fixed earlier:
- **Redirect bug:** Forms were created but redirected to error pages (FIXED)
- **Delete button bug:** Form submission never happens (FIXING NOW)

## Testing After Fix

1. Create a test template
2. Click the red "Delete" button on the template card
3. Confirmation dialog should appear
4. Click "Delete" in the dialog
5. Should redirect to `?status=deleted` with success banner
6. Template should be removed from the list

### Test Results

**Tested:** 2025-10-15
**Result:** ✅ PASSED

- Delete button now properly submits form
- Redirects to `?status=deleted` with success banner
- Template successfully removed from database and UI
- No errors in console
