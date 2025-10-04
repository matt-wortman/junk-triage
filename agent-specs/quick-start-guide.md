# Quick Start Guide: Using the Three-Agent System

## Overview

Instead of one `code-quality-engineer` agent that tries to do everything, you now have three specialized agents:

1. **code-reviewer** - Best practices and patterns
2. **test-generator** - Creates and validates tests
3. **security-scanner** - Security, performance, bugs

You can run them individually, in sequence, or in parallel.

---

## Common Use Cases (Copy & Paste)

### 1. "I just finished a feature, check everything before I commit"
**Recommended: Sequential mode (security → review → tests)**

```
Run a complete code quality gate on my recent changes:

1. Run security-scanner on files from git diff
   - Scan depth: thorough
   - Block on critical or high severity issues

2. Then run code-reviewer on same files
   - Review depth: standard
   - Find 3 similar examples for context
   - Check best practices and patterns

3. Then run test-generator on same files
   - Coverage target: 80%
   - Must execute tests and prove they pass
   - Include edge cases from security findings

Mode: sequential (each agent sees previous results)
Scope: git diff
Block merge if: critical issues OR high security issues OR tests fail

Return aggregated report with merge decision.
```

---

### 2. "Quick security check before I push this auth code"
**Recommended: Selective mode (security only)**

```
Run security-scanner ONLY on my authentication changes:

Files: src/auth/login.ts, src/auth/middleware.ts
Scan depth: thorough
Focus: authentication, authorization, sensitive data

Check for:
- SQL injection
- Auth bypass
- Session management issues
- Missing authorization
- Password handling

Block merge if ANY critical or high severity issues found.
Return security findings only.
```

---

### 3. "I need to add tests to boost coverage"
**Recommended: Selective mode (tests only)**

```
Run test-generator ONLY on files with low coverage:

Files: src/services/payment.ts, src/services/notification.ts
Coverage target: 85%

Generate functional tests covering:
- Happy path scenarios
- Edge cases (empty inputs, nulls, boundary values)
- Error scenarios
- Integration points

MUST execute tests and show passing output.
MUST achieve coverage target.

Return test files created and coverage report.
```

---

### 4. "Fast feedback - I want all checks but quickly"
**Recommended: Parallel mode (all agents at once)**

```
Run ALL agents in parallel on my changes for fast feedback:

Agents: security-scanner, code-reviewer, test-generator
Mode: parallel (all run simultaneously)
Scope: git diff
Depth: quick (for all agents)
Coverage target: 75%

Run all three agents at the same time, then aggregate results.
This will be ~3x faster than sequential.

Return combined report when all agents complete.
```

---

### 5. "Code review - am I following project patterns?"
**Recommended: Selective mode (review only)**

```
Run code-reviewer ONLY on my new service implementation:

Files: src/services/newfeature.ts
Review depth: thorough

Focus on:
- Finding 3 similar implementations for comparison
- Checking if I'm following project patterns
- Verifying naming conventions
- Checking function complexity
- Ensuring proper error handling patterns

Return review findings with references to existing examples.
```

---

### 6. "Pre-merge checklist (thorough but patient)"
**Recommended: Sequential mode with high standards**

```
Run complete quality gate with strict requirements:

Mode: sequential
Scope: git diff
Agents: security-scanner → code-reviewer → test-generator

Options:
- Security scan depth: thorough
- Review depth: thorough
- Coverage target: 90%
- Block on critical: true
- Block on high: true

Requirements to pass:
- 0 critical issues
- 0 high security issues
- All tests passing
- 90%+ coverage
- Code quality score >= 85

This will take longer but ensures highest quality.
Return detailed report with merge decision.
```

---

### 7. "CI/CD integration - fast automated checks"
**Recommended: Parallel mode for speed**

```
Run automated quality checks for CI/CD pipeline:

Mode: parallel
Scope: git diff (files in this PR)
Depth: standard (balance speed and thoroughness)

Agents: all three (security, review, tests)
Coverage target: 80%
Block on critical: true
Block on high: false (warning only)

Fast execution for CI - parallel agents reduce wall-clock time.
Return JSON output for parsing by CI system.
```

---

## Simple Decision Tree

```
Start: "What do I need?"

├─ "Everything checked thoroughly"
│  └─ Sequential mode (security → review → tests)
│     ├─ Before merge: YES
│     └─ Time available: 5-10 minutes
│
├─ "Everything checked quickly"
│  └─ Parallel mode (all agents at once)
│     ├─ CI/CD: YES
│     └─ Time available: 2-3 minutes
│
├─ "Just security" (auth, payments, user input)
│  └─ Selective mode: security-scanner only
│     └─ Time: 1-2 minutes
│
├─ "Just need tests" (coverage dropped)
│  └─ Selective mode: test-generator only
│     └─ Time: 2-3 minutes
│
└─ "Just patterns/review" (learning, refactoring)
   └─ Selective mode: code-reviewer only
      └─ Time: 1-2 minutes
```

---

## Integration with Your Evidence-Based Protocol

Your CLAUDE.md requires:
1. **CONTEXTUAL EVIDENCE** - Find 3 similar implementations
2. **TYPE EVIDENCE** - Type-check every 20 lines
3. **EXECUTION EVIDENCE** - Prove code works with tests

### How the agents help:

**During coding (your manual process):**
```bash
# Write 20 lines
npm run type-check   # TYPE EVIDENCE

# Write another 20 lines
npm run type-check   # TYPE EVIDENCE

# Feature complete → ready for agents
```

**After feature complete (agents automate this):**
```
Run sequential mode agents:

1. security-scanner
   - Finds critical issues early

2. code-reviewer
   - ENFORCES contextual evidence (must find 3 examples)
   - Verifies you followed patterns

3. test-generator
   - ENFORCES execution evidence (must run tests)
   - Proves code works
   - Achieves coverage target

Result: All three evidence types validated automatically!
```

**Your new workflow:**
```bash
# 1. Research (CONTEXTUAL - manual or agent-assisted)
# Look at 3 similar implementations

# 2. Code with type-checking (TYPE - manual)
# Write 20 lines → npm run type-check → repeat

# 3. Agent validation (EXECUTION - automated)
run-agents --mode=sequential --scope=git_diff

# 4. Fix issues found
# Address critical/high

# 5. Verify passing
# Rerun agents until APPROVED

# 6. Commit
git commit -m "feat: ..."
```

---

## Cheat Sheet

| Goal | Mode | Agents | Time | Command |
|------|------|--------|------|---------|
| Pre-merge thorough | Sequential | All | 5-10min | `sequential --scope=git_diff --depth=standard` |
| Pre-merge fast | Parallel | All | 2-3min | `parallel --scope=git_diff --depth=quick` |
| Security check | Selective | security | 1-2min | `selective --agents=security --depth=thorough` |
| Need tests | Selective | tests | 2-3min | `selective --agents=tests --coverage=80` |
| Learn patterns | Selective | review | 1-2min | `selective --agents=review --depth=thorough` |
| CI/CD automated | Parallel | All | 2-3min | `parallel --scope=git_diff --output=json` |

---

## Expected Outputs

### Sequential Mode Output
```
🔍 Running quality gate in sequential mode...

[1/3] security-scanner (thorough scan)...
✅ Complete (1.2s)
  - 0 critical issues
  - 2 high severity issues found
  - Security score: 75/100

[2/3] code-reviewer (standard review)...
✅ Complete (2.1s)
  - Found 3 similar implementations
  - 1 critical code issue
  - 4 important improvements
  - Quality score: 82/100

[3/3] test-generator (target: 80% coverage)...
✅ Complete (3.4s)
  - Created 15 tests
  - All tests passing ✅
  - Coverage: 87.5% (target: 80%)

📊 Aggregated Results:
Status: NEEDS_WORK
Blocking issues: 3 (2 high security + 1 critical code)

Must fix before merge:
1. Missing authorization check (src/api/user.ts:23)
2. SQL injection vulnerability (src/services/payment.ts:45)
3. Function exceeds complexity limit (src/utils/process.ts:156)

Merge decision: BLOCKED
Estimated fix time: 30-45 minutes
```

### Selective Mode Output (just security)
```
🔒 Running security-scanner (thorough)...

✅ Complete (1.5s)

Critical Issues: 1
- SQL injection at src/payment.ts:45

High Severity: 2
- Missing authorization at src/user.ts:23
- Exposed API key in logs at src/config.ts:12

Medium Severity: 5
- (see full report)

Status: BLOCKED
Reason: Critical security vulnerability
Next: Fix SQL injection immediately
```

---

## Tips

1. **Start with sequential mode** for your first run (most thorough)
2. **Use selective mode** when you know what you need
3. **Parallel mode** is great for CI/CD or quick iterations
4. **Always fix critical and high** severity issues before merging
5. **Let test-generator run last** in sequential (it benefits from other findings)
6. **Security-scanner first** in sequential (find blockers early)
7. **Rerun affected agents** after fixes (don't need to rerun all three)

---

## Next Steps

After you get familiar with these patterns, you can:
- Create shell aliases for common commands
- Add to git hooks (pre-commit, pre-push)
- Integrate into CI/CD pipeline
- Customize scoring thresholds
- Add project-specific rules

But for now, just copy one of the use cases above and adapt the file paths/options to your needs!
