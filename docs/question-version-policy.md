# Question Version Policy

**Project**: Tech Triage Platform - Form Versioning System
**Date**: 2025-10-17
**Status**: Draft for Stakeholder Review
**Owner**: Form Administration Team

---

## Purpose

This policy defines when and how to increment question version numbers in the Tech Triage Platform. Question versioning is critical for maintaining question-answer integrity—ensuring that historical answers can always be matched to the exact question that was asked.

**Key Principle**: Version increments should reflect **meaningful changes** that would affect how users interpret or answer the question. Cosmetic or clarifying changes that don't alter the question's intent should NOT trigger version increments.

---

## Decision Matrix

### When to INCREMENT Version

| Change Type | Example | Increment? | Rationale |
|-------------|---------|------------|-----------|
| **Meaning Change** | "market size" → "addressable market size" | ✅ YES | Changes what user should answer |
| **Scope Change** | "competitors" → "US competitors only" | ✅ YES | Narrows/expands expected answer |
| **Question Type Change** | Short text → Multiple choice | ✅ YES | Changes how user answers |
| **Option Addition (significant)** | Add "N/A" to required question | ✅ YES | Changes valid answer set |
| **Option Removal** | Remove previously valid choice | ✅ YES | Invalidates existing answers |
| **Validation Change** | Add "must be >$1M" rule | ✅ YES | Restricts answer format |
| **Required → Optional** | Remove "required" flag | ✅ YES | Changes answer expectations |
| **Optional → Required** | Add "required" flag | ✅ YES | Changes answer expectations |

### When to KEEP Same Version

| Change Type | Example | Increment? | Rationale |
|-------------|---------|------------|-----------|
| **Typo Fix** | "marekt size" → "market size" | ❌ NO | Obvious error, no meaning change |
| **Grammar Fix** | "What the market size?" → "What is the market size?" | ❌ NO | Clarifies without changing meaning |
| **Help Text Update** | Add clarifying example | ❌ NO | Doesn't change core question |
| **Placeholder Text** | Update input hint | ❌ NO | Cosmetic only |
| **Label Formatting** | "market size" → "Market Size" | ❌ NO | Capitalization is cosmetic |
| **Option Reorder** | Move option 3 to option 2 | ❌ NO | Display order doesn't affect meaning |
| **Option Label Clarification** | "Yes" → "Yes, we have competitors" | ⚠️ MAYBE | If meaning unchanged, NO |
| **Help Text for Validation** | Explain existing validation rule | ❌ NO | Rule itself didn't change |

---

## Gray Area Examples (Requires Judgment)

### Example 1: Rewording for Clarity

**Original (v1)**: "What is the market potential?"
**Proposed**: "What is the estimated annual revenue potential?"

**Analysis**:
- Does this change what users should answer? **YES** (more specific)
- Would existing "$50M" answer mean something different? **YES** (annual vs. total)

**Decision**: ✅ **INCREMENT to v2**

---

### Example 2: Adding Context

**Original (v1)**: "List competitors"
**Proposed**: "List competitors (e.g., companies offering similar solutions)"

**Analysis**:
- Does this change what users should answer? **NO** (just clarifies)
- Would existing answers become incorrect? **NO**

**Decision**: ❌ **KEEP v1**

---

### Example 3: Fixing Ambiguity

**Original (v1)**: "What is the market size?"
**Proposed**: "What is the US market size?"

**Analysis**:
- Does this change what users should answer? **YES** (geographic scope)
- Would existing "$50M" answer be ambiguous? **YES** (global vs. US)

**Decision**: ✅ **INCREMENT to v2**

---

### Example 4: Adding Optional Field

**Original (v1)**: Required short-text question
**Proposed**: Same question, now optional

**Analysis**:
- Does this change answer expectations? **YES** (can now skip)
- Would existing answers become invalid? **NO** (still valid)
- Would lack of answer mean something different? **YES** (previously error, now valid choice)

**Decision**: ✅ **INCREMENT to v2**

---

## Workflow for Making Question Changes

### Step 1: Identify Change Type

Before making ANY change to a question, identify the change type using the decision matrix above.

### Step 2: Determine Version Impact

- If change type is in "INCREMENT" category → **Plan for version increment**
- If change type is in "KEEP" category → **No version increment needed**
- If uncertain → **Consult with product owner or use "When in Doubt" rule below**

### Step 3: Execute Change

**IMPORTANT**: All changes to questions create new immutable `QuestionRevision` rows. The difference between version increments and non-version changes is whether `versionNumber` increments.

**For NON-VERSION changes (e.g., typo fixes, help text updates)**:
1. System creates NEW immutable `QuestionRevision` row (admin UI handles this automatically)
2. Copy all fields from current revision with the updated changes
3. KEEP SAME `versionNumber` (e.g., stays at version 1)
4. Mark `significantChange: false` (important for audit trail)
5. Update `currentRevisionId` in Question Dictionary to point to new revision
6. System automatically updates `changeLog` (backfilled, read-only for admins)

**Technical details (for developers)**:
```typescript
// Admin clicks "Fix typo" in UI
// System automatically:
const newRevision = await prisma.questionRevision.create({
  data: {
    questionKey: dict.key,
    versionNumber: dict.currentVersion,  // ← SAME version number
    label: newLabel,  // Updated label
    helpText: dict.currentRevision.helpText,
    options: dict.currentRevision.options,
    validation: dict.currentRevision.validation,
    createdAt: new Date(),
    createdBy: userId,
    changeReason: "Fixed typo: 'marekt' → 'market'",
    significantChange: false,  // ← Not a version bump
    dictionaryId: dict.id
  }
});

// Update pointer (but NOT version number)
await prisma.questionDictionary.update({
  where: { id: dict.id },
  data: {
    currentRevisionId: newRevision.id  // Point to new revision
    // currentVersion stays the same
  }
});
```

**For VERSION changes (e.g., meaning changes)**:
1. System creates NEW immutable `QuestionRevision` row (admin UI handles this automatically)
2. Copy all fields from current revision with the updated changes
3. INCREMENT `versionNumber` (e.g., version 1 → version 2)
4. Mark `significantChange: true`
5. Update `currentRevisionId` AND `currentVersion` in Question Dictionary
6. System automatically updates `changeLog` (backfilled, read-only for admins)

**Technical details (for developers)**:
```typescript
// Admin clicks "Update question (new version)" in UI
// System automatically:
const newRevision = await prisma.questionRevision.create({
  data: {
    questionKey: dict.key,
    versionNumber: dict.currentVersion + 1,  // ← INCREMENT version
    label: newLabel,  // Updated label
    helpText: dict.currentRevision.helpText,
    options: dict.currentRevision.options,
    validation: dict.currentRevision.validation,
    createdAt: new Date(),
    createdBy: userId,
    changeReason: "Narrowed scope from total market to addressable market",
    significantChange: true,  // ← Version bump
    dictionaryId: dict.id
  }
});

// Update pointer AND increment version
await prisma.questionDictionary.update({
  where: { id: dict.id },
  data: {
    currentVersion: { increment: 1 },  // Bump version
    currentRevisionId: newRevision.id   // Point to new revision
  }
});

// Trigger stale answer detection for all existing answers
// (handled automatically on next form load)
```

**IMPORTANT NOTES FOR ADMINS**:
- ⚠️ **Do NOT manually edit `changeLog` JSON** - It is auto-maintained by the system
- ✅ **Always use admin UI** to make changes - It handles revision creation correctly
- ✅ **System ensures immutability** - No revision can ever be modified after creation
- ✅ **Both types of changes create revisions** - The difference is whether version increments

### Step 4: Communicate Impact

**For VERSION changes**, notify stakeholders:
- Form administrators
- Active users with existing answers (will see stale answer warnings)
- Committee reviewers (if mid-review cycle)

**Communication Template**:
```
Subject: Question Updated - Version Increment

Question Key: market_size_detail
Old Version: v1 - "What is the market size?"
New Version: v2 - "What is the addressable market size?"

Reason: Narrowed scope to addressable market for more accurate assessment

Impact:
- Users with existing answers will see warnings
- Existing answers remain visible but marked as "for older version"
- Users can review and update/keep/delete answers

Timeline: Effective immediately
```

---

## When in Doubt Rule

**If you're unsure whether a change requires a version increment, ask**:

> "If someone reviews this technology 6 months from now, would the old answer be confusing or misleading under the new question?"

- **YES** → Increment version (prevents future confusion)
- **NO** → Keep same version

**Better to over-version than under-version.** Extra versions are harmless; missing versions break question-answer integrity.

---

## Technical Implementation Notes

### Database Schema (For Developers)

```prisma
model QuestionRevision {
  id                String   @id @default(cuid())
  questionKey       String
  versionNumber     Int
  label             String     // The actual question text
  helpText          String?
  options           Json?
  validation        Json?
  createdAt         DateTime @default(now())
  createdBy         String
  changeReason      String?    // ← REQUIRED for version increments
  significantChange Boolean  @default(true)  // ← TRUE for version increments
  dictionaryId      String
  dictionary        QuestionDictionary @relation(...)

  @@unique([questionKey, versionNumber])
  @@map("question_revisions")
}
```

### Creating New Revision (Code Example)

```typescript
async function updateQuestion(
  questionKey: string,
  newLabel: string,
  changeReason: string,
  userId: string,
  isSignificantChange: boolean  // ← Set based on policy
) {
  const dict = await prisma.questionDictionary.findUnique({
    where: { key: questionKey },
    include: { currentRevision: true }
  });

  // ALWAYS create new immutable revision (for both version and non-version changes)
  const newRevision = await prisma.questionRevision.create({
    data: {
      questionKey: questionKey,
      // Version number increments ONLY if significant change
      versionNumber: isSignificantChange
        ? dict.currentVersion + 1
        : dict.currentVersion,  // ← Keep same version for typos
      label: newLabel,
      helpText: dict.currentRevision.helpText,
      options: dict.currentRevision.options,
      validation: dict.currentRevision.validation,
      createdAt: new Date(),
      createdBy: userId,
      changeReason: changeReason,  // ← Document WHY (required)
      significantChange: isSignificantChange,  // ← Tracks type of change
      dictionaryId: dict.id
    }
  });

  // Update dictionary pointer (and version if significant)
  await prisma.questionDictionary.update({
    where: { id: dict.id },
    data: {
      currentRevisionId: newRevision.id,  // Always update pointer
      currentVersion: isSignificantChange
        ? { increment: 1 }  // Bump version for significant changes
        : undefined,        // Keep version for non-significant changes
      updatedAt: new Date()
    }
  });

  // System automatically backfills changeLog from QuestionRevision table
  // Admins do NOT manually edit changeLog (it's read-only)

  // Trigger stale answer detection for all existing answers
  // (handled automatically on next form load if version incremented)
}
```

---

## Monitoring and Audit

### Metrics to Track

1. **Version Increment Rate**: How often do questions get versioned?
   - Target: <5% of all question changes should increment version
   - Alert if >20% (may indicate policy misunderstanding)

2. **Stale Answer Rate**: How many answers become stale after version changes?
   - Track by question key
   - Identify "volatile" questions that change frequently

3. **Answer Resolution Rate**: How quickly do users address stale answer warnings?
   - Target: >80% resolved within 7 days
   - Alert if <50% (users may be ignoring warnings)

### Audit Trail

All version increments are automatically logged in `QuestionRevision` table:
- Who made the change (`createdBy`)
- When it was made (`createdAt`)
- Why it was made (`changeReason`)
- What changed (`label`, `options`, `validation`)

Query example:
```sql
-- Find all version increments in last 30 days
SELECT
  qr.question_key,
  qr.version_number,
  qr.label,
  qr.created_at,
  qr.created_by,
  qr.change_reason
FROM question_revisions qr
WHERE qr.created_at > NOW() - INTERVAL '30 days'
  AND qr.significant_change = true
ORDER BY qr.created_at DESC;
```

---

## Stakeholder Roles and Responsibilities

### Form Administrators
- **Responsibility**: Make question changes according to this policy
- **Authority**: Increment versions for significant changes
- **Accountability**: Document change reasons clearly
- **Training Required**: Review this policy quarterly

### Product Owner
- **Responsibility**: Approve gray-area decisions
- **Authority**: Override policy for exceptional cases (must document)
- **Accountability**: Ensure policy is followed by admin team

### End Users (Technology Liaisons)
- **Responsibility**: Review and resolve stale answer warnings
- **Authority**: Keep, update, or delete answers after version changes
- **Accountability**: None (system-guided workflow)

### Reviewers (Committee Members)
- **Responsibility**: Review technologies using snapshots
- **Authority**: Request clarification on stale answers
- **Accountability**: None (consumers of data, not producers)

---

## FAQ

### Q1: What happens to existing answers when I increment a version?

**A**: Existing answers are NOT deleted or modified. They remain in the database but are marked as "for older version of question." Users will see warnings when they open the form and can choose to:
- Keep the answer (system updates it to new version)
- Update the answer
- Delete the answer

### Q2: Can I undo a version increment?

**A**: No. QuestionRevision rows are immutable by design. However, you can:
- Create a new version reverting to old wording
- Document in `changeReason` that this is a reversion

### Q3: What if I accidentally incremented when I shouldn't have?

**A**: The system will show stale answer warnings to users, but this is harmless. Users will see:
- Old question: "What is the market size?"
- New question: "What is the market size?" (same!)
- They can click "Keep answer" to resolve

This is annoying but not data-corrupting. Document in next change: "v3: No change from v2, v2 was accidental increment"

### Q4: What if I forgot to increment when I should have?

**A**: This is more serious. Existing answers will now be ambiguous. If caught quickly:
1. Create new version with corrected question
2. Manually review technologies with answers
3. Work with users to clarify which version they answered

**Prevention**: Always review decision matrix BEFORE changing questions.

### Q5: Can I batch-update multiple questions?

**A**: Yes, but consider each question independently for versioning. Use this checklist:
```
For each question in batch:
  [ ] Reviewed decision matrix
  [ ] Determined version impact
  [ ] Documented change reason
  [ ] Incremented version if needed
```

### Q6: How do I handle typos in help text?

**A**: Help text changes do NOT require version increments (they don't change the core question). The system will create a new QuestionRevision row with the updated helpText but keep the same `versionNumber`. Mark `significantChange: false`. The admin UI handles this automatically when you select "Edit help text (no version change)".

### Q7: What about option labels in multiple-choice questions?

**A**: Use judgment:
- Clarifying label (e.g., "Other" → "Other (please specify)") → NO increment
- Changing meaning (e.g., "Moderate" → "Moderate (5-10 competitors)") → YES increment
- Adding/removing options → YES increment

---

## Policy Review and Updates

**Review Schedule**: Quarterly (or after 50 version increments)

**Review Checklist**:
- [ ] Are version increments happening at expected rate? (~5% of changes)
- [ ] Are users resolving stale answers promptly? (>80% within 7 days)
- [ ] Have there been any data integrity issues related to versioning?
- [ ] Have any gray-area cases emerged that need policy clarification?
- [ ] Do admins understand and follow the policy?

**Update Process**:
1. Product Owner reviews metrics and feedback
2. Propose policy updates (add examples, clarify gray areas)
3. Stakeholder review (admin team, power users)
4. Update this document
5. Communicate changes to all admins

---

## Appendix A: Change Reason Templates

Use these templates for common change types:

**Meaning Change**:
```
"Narrowed scope from [old] to [new] for more accurate assessment"
"Expanded question to include [new aspect]"
"Changed focus from [old] to [new] based on committee feedback"
```

**Scope Change**:
```
"Added geographic restriction: [region]"
"Limited to [timeframe] instead of [old timeframe]"
"Specified [new constraint] to clarify expectations"
```

**Validation Change**:
```
"Added validation rule: [rule] to prevent [problem]"
"Removed [old rule] as it was too restrictive"
"Changed validation from [old] to [new] based on data quality issues"
```

**Requirement Change**:
```
"Changed to optional based on user feedback"
"Changed to required for [compliance reason]"
```

**Typo Fix (no version change)**:
```
"Fixed typo: '[wrong]' → '[correct]'"
"Corrected grammar"
"Fixed formatting"
```

---

**Document Version**: 1.0 (Draft)
**Date**: 2025-10-17
**Status**: Awaiting Stakeholder Approval
**Next Review**: 2025-01-17 (or after 50 version increments)
**Owner**: Form Administration Team
**Approvers**: Product Owner, Tech Lead, Admin Team Lead
