# Three-Agent Code Quality System

## Overview

A specialized agent system that replaces the single `code-quality-engineer` agent with three focused experts that can work independently or together.

### The Problem with the Old System
The original `code-quality-engineer` agent tried to do three different things at once:
- ❌ Vague scope ("recently written code", "logical chunk")
- ❌ Three broad responsibilities (review + security + tests)
- ❌ No clear success criteria
- ❌ No standardized output format
- ❌ Couldn't run parts independently

### The New System
Three specialized agents, each with a clear purpose:

**🔍 [code-reviewer](./code-reviewer-agent.md)**
- **Purpose:** Best practices, patterns, architectural review
- **Enforces:** CONTEXTUAL EVIDENCE (3 similar examples)
- **Output:** Ranked improvements (critical/important/optional)
- **Success:** 0 critical issues, 80%+ quality score

**🧪 [test-generator](./test-generator-agent.md)**
- **Purpose:** Create and validate functional tests
- **Enforces:** EXECUTION EVIDENCE (runs tests, proves they work)
- **Output:** Test files + passing execution + coverage metrics
- **Success:** All tests pass, coverage >= target

**🔒 [security-scanner](./security-scanner-agent.md)**
- **Purpose:** Security vulnerabilities, performance, bugs
- **Enforces:** Runtime safety, OWASP Top 10, best practices
- **Output:** Categorized issues by severity with fixes
- **Success:** 0 critical, 0 high security issues

---

## Quick Start

### 1. Just finished a feature? Run everything:
```
Run a complete quality gate in sequential mode:
- security-scanner (find critical issues first)
- code-reviewer (check patterns and practices)
- test-generator (create tests with 80% coverage)

Scope: git diff
Block on: critical or high severity issues

Return aggregated report with merge decision.
```

### 2. Need just security check?
```
Run security-scanner only on authentication files:
- Files: src/auth/*.ts
- Depth: thorough
- Block on: critical or high

Return security findings only.
```

### 3. Need tests for coverage?
```
Run test-generator only:
- Files: src/services/payment.ts
- Coverage target: 85%
- Must execute and show passing tests

Return test files and coverage report.
```

**See [Quick Start Guide](./quick-start-guide.md) for more copy-paste examples.**

---

## Documentation

### 📚 Agent Specifications
- **[code-reviewer-agent.md](./code-reviewer-agent.md)** - Best practices and pattern review
- **[test-generator-agent.md](./test-generator-agent.md)** - Functional test creation
- **[security-scanner-agent.md](./security-scanner-agent.md)** - Security and bug detection

### 🎯 Orchestration
- **[orchestration-system.md](./orchestration-system.md)** - How agents work together
  - Sequential mode (thorough, context-aware)
  - Parallel mode (fast, independent)
  - Selective mode (targeted, flexible)

### 🚀 Usage
- **[quick-start-guide.md](./quick-start-guide.md)** - Common use cases with copy-paste prompts
  - Pre-merge checks
  - Security scans
  - Test generation
  - CI/CD integration

---

## Architecture

### Three-Agent Design

```
┌─────────────────────────────────────────────────────┐
│                  Orchestrator                        │
│  (Coordinates agents based on mode and options)      │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ security-      │ │ code-          │ │ test-          │
│ scanner        │ │ reviewer       │ │ generator      │
│                │ │                │ │                │
│ • OWASP Top 10 │ │ • Patterns     │ │ • Functional   │
│ • Performance  │ │ • Conventions  │ │   tests        │
│ • Bugs         │ │ • Best         │ │ • Coverage     │
│ • Edge cases   │ │   practices    │ │ • Execution    │
└────────────────┘ └────────────────┘ └────────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
               ┌──────────────────┐
               │ Result Aggregator │
               │ (Merge + Decide)  │
               └──────────────────┘
```

### Execution Modes

**Sequential** (Thorough, context flows between agents)
```
security → review → tests → aggregate
```
- Best for: Pre-merge quality gates
- Time: Sum of all agent times (~5-10min)
- Context: Each agent sees previous results

**Parallel** (Fast, agents run independently)
```
    ┌─ security
    ├─ review    → aggregate
    └─ tests
```
- Best for: CI/CD, fast feedback
- Time: Max of agent times (~2-3min)
- Context: No cross-agent context

**Selective** (Targeted, run what you need)
```
security → done
  OR
review → done
  OR
tests → done
  OR
security + review → aggregate
```
- Best for: Specific needs (just security, just tests)
- Time: Only selected agents (~1-3min)
- Context: Optional

---

## Integration with Evidence-Based Protocol

Your CLAUDE.md requires three types of evidence:

### 1. CONTEXTUAL EVIDENCE ✅
**Enforced by:** `code-reviewer`
- Must find 3 similar implementations
- Must reference existing patterns
- Fails if no context found

### 2. TYPE EVIDENCE ✅
**Your responsibility during coding:**
```bash
# Write 20 lines
npm run type-check

# Write 20 lines
npm run type-check
```

### 3. EXECUTION EVIDENCE ✅
**Enforced by:** `test-generator`
- Must run tests and show output
- Must achieve coverage target
- Fails if tests don't pass

### Complete Workflow
```bash
# 1. Research (CONTEXTUAL)
# Find 3 similar implementations

# 2. Code with type-checking (TYPE)
while coding:
  write 20 lines
  npm run type-check

# 3. Run agents (EXECUTION)
run-agents --mode=sequential --scope=git_diff

# 4. Fix issues
# Address critical/high

# 5. Verify
# Rerun until APPROVED

# 6. Commit
git commit -m "feat: ..."
```

---

## Comparison: Old vs New

| Aspect | Old (code-quality-engineer) | New (Three Agents) |
|--------|----------------------------|-------------------|
| **Scope** | "Recently written code" (vague) | git diff / file paths / last commit (explicit) |
| **Responsibilities** | 3 broad tasks in one agent | 3 focused agents, each with 1 responsibility |
| **Output** | Unstructured | Standardized JSON format |
| **Success Criteria** | None | Clear metrics per agent |
| **Flexibility** | All or nothing | Run individually or together |
| **Speed** | Always full analysis | Can run quick/standard/thorough |
| **Context** | No inter-task awareness | Agents share context in sequential mode |
| **Evidence** | No enforcement | Enforces contextual + execution evidence |

---

## Benefits

### ✅ For Developers

**Faster feedback:**
- Run just security (1-2min) vs everything (5-10min)
- Parallel mode cuts time by ~66%

**Clearer guidance:**
- Standardized output with file:line references
- Specific fix examples, not vague suggestions
- Ranked by severity (critical → low)

**Flexible usage:**
- Need just tests? Run test-generator
- Need everything? Run sequential mode
- In a hurry? Run parallel mode

### ✅ For Code Quality

**Better analysis:**
- Each agent is expert in its domain
- Security patterns not diluted by general review
- Test generation informed by security + review findings

**Measurable success:**
- Security score, quality score, coverage %
- Clear pass/fail criteria
- Track improvements over time

**Enforced standards:**
- Must find contextual examples (no cowboy coding)
- Must prove tests work (no untested code)
- Must fix critical issues (no merging broken code)

### ✅ For CI/CD

**Automated quality gates:**
- Run in parallel for speed
- JSON output for parsing
- Clear merge decision (APPROVED/BLOCKED)

**Selective execution:**
- Run just security on auth changes
- Run just tests when coverage drops
- Full suite for release branches

---

## Output Examples

### Sequential Mode (Full Quality Gate)

```json
{
  "orchestration": {
    "mode": "sequential",
    "agents_run": ["security-scanner", "code-reviewer", "test-generator"],
    "total_duration_ms": 6234
  },
  "overall_status": "APPROVED",
  "summary": {
    "files_analyzed": ["src/services/payment.ts"],
    "total_issues": 8,
    "critical": 0,
    "high": 0,
    "medium": 5,
    "low": 3,
    "tests_created": 12,
    "tests_passing": true,
    "coverage_achieved": 87.5,
    "security_score": 85,
    "code_quality_score": 88
  },
  "merge_decision": {
    "approved": true,
    "reason": "All requirements met",
    "next_steps": ["Optional: Address 5 medium improvements"]
  }
}
```

### Selective Mode (Security Only)

```json
{
  "agent": "security-scanner",
  "status": "BLOCKED",
  "security_findings": {
    "critical": [
      {
        "category": "SQL Injection",
        "file": "src/services/payment.ts",
        "line": 45,
        "fix_example": "Use parameterized queries"
      }
    ]
  },
  "merge_decision": {
    "approved": false,
    "reason": "Critical security vulnerability"
  }
}
```

---

## Success Metrics

### Per Agent

**code-reviewer:**
- ✅ Found 3+ similar implementations (contextual evidence)
- ✅ 0 critical code issues
- ✅ Code quality score >= 80%

**test-generator:**
- ✅ All generated tests pass (execution evidence)
- ✅ Coverage >= target (default 80%)
- ✅ Tests cover happy path + edge cases + errors

**security-scanner:**
- ✅ 0 critical security issues
- ✅ 0 high severity issues (configurable)
- ✅ Security score >= 80%

### Overall (Aggregated)

**APPROVED:** Ready to merge
- 0 critical issues (security + code)
- 0 high security issues
- All tests passing
- Coverage >= target

**REVIEW_RECOMMENDED:** Can merge but improvements suggested
- No critical/high issues
- Some medium issues present
- Tests passing, coverage met

**NEEDS_WORK:** Must address issues
- High severity issues present
- OR critical code issues
- OR tests failing
- OR coverage below target

**BLOCKED:** Cannot merge
- Critical security issues present
- Must fix immediately

---

## Future Enhancements

### Phase 2 (After initial adoption)
- [ ] CLI tool for easy execution
- [ ] Git hooks integration (pre-commit, pre-push)
- [ ] VS Code extension
- [ ] Custom rule definitions per project
- [ ] Historical tracking (score trends over time)

### Phase 3 (Advanced features)
- [ ] Auto-fix mode (LLM fixes issues automatically)
- [ ] Learning mode (agents learn from your codebase)
- [ ] Team dashboards (quality metrics)
- [ ] Slack/Discord notifications
- [ ] Custom agent creation

---

## FAQ

**Q: Do I need to run all three agents every time?**
A: No! Use selective mode for targeted needs. Full suite is recommended for pre-merge checks.

**Q: How long does it take?**
A: Sequential: 5-10min, Parallel: 2-3min, Selective: 1-3min (depends on code size and depth)

**Q: Can agents fix issues automatically?**
A: Currently no (future enhancement). They provide specific fix examples you can apply.

**Q: What if agents disagree?**
A: The aggregator resolves conflicts using severity hierarchy (critical > high > medium > low).

**Q: Can I customize the rules?**
A: Yes! Each agent can be configured with project-specific patterns and thresholds.

**Q: Do agents replace human code review?**
A: No! They automate mechanical checks so humans can focus on architecture, business logic, and design.

---

## Getting Started

1. **Read** [Quick Start Guide](./quick-start-guide.md) - Copy-paste examples for common use cases
2. **Try** selective mode first - Pick one agent and run it on a small change
3. **Experiment** with sequential mode - See how agents work together
4. **Integrate** into your workflow - Add to pre-commit or CI/CD
5. **Customize** as needed - Adjust thresholds and rules for your project

---

## Files in This Spec

```
agent-specs/
├── README.md                    # This file - overview and getting started
├── quick-start-guide.md         # Copy-paste examples for common use cases
├── orchestration-system.md      # How agents coordinate and aggregate results
├── code-reviewer-agent.md       # Best practices and pattern review spec
├── test-generator-agent.md      # Functional test creation spec
└── security-scanner-agent.md    # Security and bug detection spec
```

---

## Support

This is a specification for implementing a three-agent system to replace the monolithic `code-quality-engineer` agent.

The design addresses the key weaknesses identified:
- ✅ Clear scope definition (git diff, file paths, last commit)
- ✅ Focused responsibilities (one per agent)
- ✅ Standardized outputs (JSON format)
- ✅ Success criteria (measurable metrics)
- ✅ Flexible execution (sequential/parallel/selective)
- ✅ Evidence enforcement (contextual + execution)

Ready to improve code quality with specialized, focused agents! 🚀
