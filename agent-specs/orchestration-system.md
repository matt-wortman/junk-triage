# Agent Orchestration System

## Overview
The orchestration system coordinates the three specialized agents (code-reviewer, test-generator, security-scanner) to provide comprehensive code quality analysis.

## Execution Modes

### 1. Sequential Mode (Thorough)
**Use when:** You want comprehensive analysis with context flowing between agents

**Workflow:**
```
1. security-scanner (find critical issues first)
   ↓
2. code-reviewer (review practices and patterns)
   ↓
3. test-generator (create tests for reviewed code)
   ↓
4. Aggregate results
```

**Logic:**
- If security-scanner finds CRITICAL issues → STOP, block merge
- If security-scanner finds HIGH issues → Continue but flag for review
- code-reviewer uses security findings to inform review
- test-generator creates tests including security edge cases
- Each agent sees results from previous agents

**Pros:**
- Most thorough analysis
- Context-aware (later agents know about earlier findings)
- Can short-circuit on critical issues (save time)

**Cons:**
- Slower (agents run one at a time)
- Total time = sum of all agent times

**Implementation:**
```typescript
async function runSequential(files: string[], options: OrchestrationOptions) {
  const results = {
    security: null,
    review: null,
    tests: null,
    aggregated: null
  };

  // Step 1: Security scan (run first, most critical)
  results.security = await runSecurityScanner(files, options);

  // Check for blockers
  if (results.security.metrics.critical_security > 0) {
    return {
      status: 'BLOCKED',
      reason: 'Critical security issues found',
      results: results.security,
      next_steps: ['Fix critical security issues before proceeding']
    };
  }

  // Step 2: Code review (with security context)
  results.review = await runCodeReviewer(files, {
    ...options,
    context: { security_findings: results.security }
  });

  // Step 3: Test generation (with both contexts)
  results.tests = await runTestGenerator(files, {
    ...options,
    context: {
      security_findings: results.security,
      review_findings: results.review
    }
  });

  // Step 4: Aggregate
  results.aggregated = aggregateResults(results);

  return results;
}
```

### 2. Parallel Mode (Fast)
**Use when:** You want quick feedback and agents don't need each other's context

**Workflow:**
```
Start all three agents simultaneously:
┌─ security-scanner
├─ code-reviewer
└─ test-generator
       ↓
Wait for all to complete
       ↓
Aggregate results
```

**Logic:**
- All agents start at the same time
- Each runs independently
- Wait for all to finish
- Merge results and resolve conflicts

**Pros:**
- Fastest option (parallelization)
- Total time ≈ max(agent times), not sum

**Cons:**
- Agents can't use each other's context
- May duplicate effort
- Could waste time if early blocker found

**Implementation:**
```typescript
async function runParallel(files: string[], options: OrchestrationOptions) {
  // Launch all agents simultaneously
  const [security, review, tests] = await Promise.all([
    runSecurityScanner(files, options),
    runCodeReviewer(files, options),
    runTestGenerator(files, options)
  ]);

  // Check for critical blockers from any agent
  if (security.metrics.critical_security > 0) {
    return {
      status: 'BLOCKED',
      reason: 'Critical security issues found',
      results: { security, review, tests },
      note: 'Other agents completed but security blocks merge'
    };
  }

  // Aggregate all results
  const aggregated = aggregateResults({ security, review, tests });

  return {
    status: aggregated.status,
    results: { security, review, tests, aggregated }
  };
}
```

### 3. Selective Mode (Targeted)
**Use when:** You only need specific analysis (e.g., just tests, just security)

**Workflow:**
```
User specifies which agents to run:
- "security-only": Just security-scanner
- "review-only": Just code-reviewer
- "tests-only": Just test-generator
- "security+review": Security then review
- etc.
```

**Logic:**
- User provides agent selection
- Run only selected agents
- Optionally run in sequence or parallel (if multiple)

**Pros:**
- Fastest for targeted needs
- No wasted effort
- Flexible based on context

**Cons:**
- Might miss cross-cutting concerns
- User must know what they need

**Implementation:**
```typescript
async function runSelective(
  files: string[],
  agents: ('security' | 'review' | 'tests')[],
  options: OrchestrationOptions
) {
  const results: Record<string, any> = {};

  // Run only selected agents
  if (agents.includes('security')) {
    results.security = await runSecurityScanner(files, options);
  }

  if (agents.includes('review')) {
    results.review = await runCodeReviewer(files, options);
  }

  if (agents.includes('tests')) {
    results.tests = await runTestGenerator(files, options);
  }

  return {
    status: determineOverallStatus(results),
    results,
    agents_run: agents
  };
}
```

## Common Workflows

### Workflow 1: "Pre-Merge Quality Gate" (Recommended)
**When:** Before creating PR or merging to main

**Mode:** Sequential
**Agents:** All three (security → review → tests)
**Options:**
```typescript
{
  scope: 'git_diff',
  review_depth: 'standard',
  test_coverage_target: 80,
  block_on_critical: true,
  auto_fix: false
}
```

**Expected output:** Pass/fail decision + detailed report

---

### Workflow 2: "Quick Security Check"
**When:** Working with sensitive data or external inputs

**Mode:** Selective
**Agents:** security-scanner only
**Options:**
```typescript
{
  scope: 'git_diff',
  scan_depth: 'thorough',
  block_on_critical: true,
  block_on_high: true
}
```

**Expected output:** Security findings only

---

### Workflow 3: "Test Coverage Boost"
**When:** Coverage dropped, need more tests

**Mode:** Selective
**Agents:** test-generator only
**Options:**
```typescript
{
  scope: 'file_paths',
  files: ['src/uncovered-file.ts'],
  test_coverage_target: 90
}
```

**Expected output:** New test files + coverage report

---

### Workflow 4: "Fast Feedback Loop"
**When:** Iterating quickly, want all checks but fast

**Mode:** Parallel
**Agents:** All three (simultaneously)
**Options:**
```typescript
{
  scope: 'git_diff',
  review_depth: 'quick',
  test_coverage_target: 75,
  scan_depth: 'standard'
}
```

**Expected output:** All results in ~1x time instead of 3x

---

### Workflow 5: "Learning Mode" (New codebase)
**When:** Understanding existing patterns and conventions

**Mode:** Selective
**Agents:** code-reviewer only
**Options:**
```typescript
{
  scope: 'file_paths',
  files: ['src/example-feature.ts'],
  review_depth: 'thorough',
  focus: 'patterns_and_conventions'
}
```

**Expected output:** Patterns found, conventions used

---

## Data Flow Between Agents

### Security → Review Context
```typescript
interface SecurityToReviewContext {
  critical_issues_found: boolean;
  high_severity_areas: {file: string, line: number, category: string}[];
  vulnerable_patterns: string[];
}
```

**Usage:** code-reviewer can mention security findings in its review
- "Line 45 already flagged for SQL injection by security-scanner"
- Skip duplicate security pattern checks

### Security + Review → Test Context
```typescript
interface SecurityReviewToTestContext {
  security_edge_cases: {
    file: string;
    scenario: string;
    test_needed: string;
  }[];
  complex_functions: {
    file: string;
    function: string;
    cyclomatic_complexity: number;
  }[];
  error_handling_patterns: string[];
}
```

**Usage:** test-generator knows to create tests for:
- Security edge cases found by security-scanner
- Complex functions flagged by code-reviewer
- Error scenarios identified by both

---

## Result Aggregation

### Aggregated Output Format
```json
{
  "orchestration": {
    "mode": "sequential",
    "agents_run": ["security-scanner", "code-reviewer", "test-generator"],
    "total_duration_ms": 4567,
    "timestamp": "ISO8601"
  },
  "overall_status": "NEEDS_WORK",
  "blocking_issues": [
    {
      "agent": "security-scanner",
      "severity": "CRITICAL",
      "issue": "SQL injection at src/payment.ts:45",
      "must_fix": true
    }
  ],
  "summary": {
    "files_analyzed": ["src/payment.ts", "src/user.ts"],
    "total_issues": 24,
    "critical": 1,
    "high": 4,
    "medium": 12,
    "low": 7,
    "tests_created": 15,
    "tests_passing": true,
    "coverage_achieved": 87.5,
    "security_score": 62,
    "code_quality_score": 85
  },
  "by_agent": {
    "security": { /* full security-scanner output */ },
    "review": { /* full code-reviewer output */ },
    "tests": { /* full test-generator output */ }
  },
  "recommendations": {
    "must_fix_before_merge": [
      "Fix SQL injection vulnerability (security:critical)",
      "Add authorization check (security:high)"
    ],
    "should_fix_soon": [
      "Refactor 78-line function (review:important)",
      "Update axios dependency (security:high)"
    ],
    "optional_improvements": [
      "Use project utility function (review:optional)",
      "Add logging for debugging (review:optional)"
    ]
  },
  "next_steps": [
    "Fix critical SQL injection at src/payment.ts:45",
    "Add authorization checks at src/user.ts:23",
    "Review and run generated tests in src/__tests__/payment.test.ts",
    "Address 4 high-severity issues before merging"
  ],
  "merge_decision": {
    "approved": false,
    "reason": "Critical security vulnerability blocks merge",
    "requirements_to_pass": [
      "critical_issues === 0",
      "high_security_issues === 0",
      "all_tests_passing === true"
    ]
  }
}
```

### Status Determination Logic
```typescript
function determineOverallStatus(results: AgentResults): Status {
  // Critical security issues = immediate block
  if (results.security?.metrics.critical_security > 0) {
    return 'BLOCKED';
  }

  // High security + critical code issues = needs work
  if (
    results.security?.metrics.high_security > 0 ||
    results.review?.metrics.critical_issues > 0
  ) {
    return 'NEEDS_WORK';
  }

  // Tests failing = needs work
  if (results.tests?.execution_results.tests_failed > 0) {
    return 'NEEDS_WORK';
  }

  // Coverage below target = needs work
  if (results.tests?.coverage_results.target_met === false) {
    return 'NEEDS_WORK';
  }

  // Some medium issues but nothing critical = review recommended
  if (
    results.security?.metrics.medium_security > 0 ||
    results.review?.metrics.important_issues > 0
  ) {
    return 'REVIEW_RECOMMENDED';
  }

  // All good!
  return 'APPROVED';
}
```

---

## Integration with Evidence-Based Protocol

Your CLAUDE.md requires three evidence types. Here's how the orchestration integrates:

### 1. CONTEXTUAL EVIDENCE (Before writing code)
- **code-reviewer** enforces this
- Must find 3 similar implementations
- Fails if no context found

### 2. TYPE EVIDENCE (Every 20 lines while writing)
- Run outside the orchestration (during coding)
- Command: `npm run type-check` or `tsc --noEmit`
- Agents assume code already passes type-check

### 3. EXECUTION EVIDENCE (After writing code)
- **test-generator** enforces this
- Must run tests and show passing output
- Must achieve coverage target
- Fails if tests don't pass

### Complete Development Workflow with Agents
```bash
# 1. Research phase (CONTEXTUAL EVIDENCE)
# - Find 3 similar implementations manually
# - Or let code-reviewer agent verify you did this

# 2. Writing phase (TYPE EVIDENCE)
# - Write 20 lines
npm run type-check
# - Write another 20 lines
npm run type-check
# - etc.

# 3. Feature complete → Run orchestration (EXECUTION EVIDENCE)
# Sequential mode recommended for first run:
run-agents --mode=sequential --scope=git_diff

# 4. Fix issues found
# - Address critical and high severity
# - Rerun affected agents:
run-agents --mode=selective --agents=security,tests

# 5. Verify all passing
# - Should get "APPROVED" status
# - All tests passing
# - Coverage met
# - No critical/high issues

# 6. Commit and merge
git commit -m "feat: implement X with full test coverage"
```

---

## Configuration Options

```typescript
interface OrchestrationOptions {
  // Scope
  scope: 'git_diff' | 'last_commit' | 'file_paths';
  files?: string[]; // Required if scope === 'file_paths'

  // Depth/thoroughness
  review_depth?: 'quick' | 'standard' | 'thorough';
  scan_depth?: 'quick' | 'standard' | 'thorough';

  // Targets
  test_coverage_target?: number; // 0-100, default 80
  security_score_target?: number; // 0-100, default 80
  code_quality_target?: number; // 0-100, default 80

  // Behavior
  block_on_critical?: boolean; // default true
  block_on_high?: boolean; // default false
  auto_fix?: boolean; // default false (let LLM fix issues)
  fail_fast?: boolean; // Stop on first critical (sequential only)

  // Output
  output_format?: 'json' | 'markdown' | 'html';
  verbose?: boolean;

  // Context passing
  pass_context_between_agents?: boolean; // default true for sequential
}
```

---

## Example Usage

### From Command Line (future CLI tool)
```bash
# Run all agents in sequential mode
run-agents --mode=sequential --scope=git_diff

# Fast parallel check
run-agents --mode=parallel --scope=last_commit --depth=quick

# Just security
run-agents --mode=selective --agents=security --scope=git_diff

# Specific files with high coverage target
run-agents --mode=sequential --scope=file_paths \
  --files=src/payment.ts,src/auth.ts \
  --coverage-target=90
```

### From Claude Code (Task tool)
```typescript
// Full quality gate
Task({
  subagent_type: "orchestrator",
  description: "Run full quality gate",
  prompt: `Run the complete quality gate in sequential mode on all files changed in the last commit.

Mode: sequential
Scope: git diff (last commit)
Options:
- review_depth: standard
- scan_depth: thorough
- test_coverage_target: 85
- block_on_critical: true
- block_on_high: true

Execute security-scanner → code-reviewer → test-generator in order.
Block merge if any critical or high severity issues found.

Return aggregated results with merge decision.`
})
```

---

## Notes

- **Sequential mode** is recommended for pre-merge checks (most thorough)
- **Parallel mode** is best for CI/CD or fast feedback loops
- **Selective mode** is ideal for targeted improvements
- Always run **security-scanner first** in sequential mode (find blockers early)
- **test-generator runs last** (tests should cover fixes from other agents)
- Context passing between agents improves quality but requires sequential mode
- The orchestrator can itself be an agent that coordinates the three specialists
