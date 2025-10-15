# Form Builder Redirect Bug - Diagnosis

**Date:** 2025-10-15
**Issue:** Form creation succeeds but redirects to error page
**URL:** `http://localhost:3000/dynamic-form/builder?error=create-failed`
**Status:** Root cause identified, fix pending

## Symptoms

1. User creates a new form via the form builder
2. Form IS successfully created in the database
3. User is redirected to `?error=create-failed` instead of `?status=created`
4. Server logs show: `GET /dynamic-form/builder?error=create-failed 200 in 307ms`

## Root Cause

**Next.js 15 redirect handling issue in server actions**

Location: `tech-triage-platform/src/app/dynamic-form/builder/actions.ts`

The `redirect()` function in Next.js works by throwing a special `NEXT_REDIRECT` error that the framework intercepts. When `redirect()` is called inside a try-catch block, the catch block captures this error before Next.js can handle it, treating a successful redirect as a failure.

### Problematic Code Pattern

```typescript
// Lines 828-856 (createTemplateAction)
export async function createTemplateAction(formData: FormData) {
  // ... validation ...

  try {
    await prisma.formTemplate.create({ ... })  // ✅ SUCCEEDS

    await revalidatePath('/dynamic-form/builder')  // ⚠️ Shouldn't be awaited
    redirect('/dynamic-form/builder?status=created')  // 💥 Throws NEXT_REDIRECT
  } catch (error) {
    // ❌ Catches the NEXT_REDIRECT error!
    console.error('Failed to create form template:', error)
    redirect('/dynamic-form/builder?error=create-failed')  // Wrong redirect executed
  }
}
```

### Execution Flow

1. Database create succeeds (line 841-848)
2. `revalidatePath()` is called with incorrect `await` (line 850)
3. `redirect()` throws `NEXT_REDIRECT` error (line 851)
4. Catch block intercepts the redirect error (line 852)
5. Error handler redirects to error page (line 854)

## Affected Functions

Three server action functions have this bug:

1. **`createTemplateAction`** (line 828-856) - Current issue
2. **`deleteTemplateAction`** (line 858-877) - Same pattern
3. **`cloneTemplateAction`** (line 879-976) - Same pattern

## Solution

### Best Practice Pattern for Next.js 15

Move `redirect()` calls outside of try-catch blocks using a success flag:

```typescript
export async function createTemplateAction(formData: FormData) {
  const parsed = createTemplateSchema.safeParse({
    name: (formData.get('name') as string | null)?.trim(),
    description: (formData.get('description') as string | null)?.trim() || undefined,
  })

  if (!parsed.success) {
    redirect('/dynamic-form/builder?error=invalid-template-data')
  }

  const { name, description } = parsed.data
  let createdSuccessfully = false

  try {
    await prisma.formTemplate.create({
      data: {
        name,
        description,
        version: '1.0',
        isActive: false,
      },
    })
    revalidatePath('/dynamic-form/builder')  // ✅ Remove await
    createdSuccessfully = true
  } catch (error) {
    console.error('Failed to create form template:', error)
  }

  // ✅ Redirect OUTSIDE try-catch
  if (createdSuccessfully) {
    redirect('/dynamic-form/builder?status=created')
  } else {
    redirect('/dynamic-form/builder?error=create-failed')
  }
}
```

### Changes Required

1. ✅ Remove `await` from `revalidatePath()` calls (it's synchronous)
2. ✅ Introduce success flag variable
3. ✅ Set flag to `true` only after successful operation
4. ✅ Move both `redirect()` calls outside try-catch block
5. ✅ Use conditional to determine which redirect to call

### Apply to All Three Functions

- `createTemplateAction` (line 828)
- `deleteTemplateAction` (line 858)
- `cloneTemplateAction` (line 879)

## Additional Notes

- `revalidatePath()` is synchronous in Next.js and should NOT be awaited
- Other functions in the same file correctly don't await `revalidatePath()` (lines 744, 791, 817)
- This is a known Next.js issue with redirect handling in server actions
- The 200 status code in logs confirms the page loads successfully after the wrong redirect

## References

- Next.js 15 Documentation: Server Actions and Mutations
- Next.js redirect() behavior: Throws NEXT_REDIRECT error
- Project version: Next.js 15.5.3

## Testing After Fix

1. Create a new form template
2. Verify redirect to `?status=created` with success banner
3. Test delete template action
4. Test clone template action
5. Verify error cases still redirect to appropriate error pages
