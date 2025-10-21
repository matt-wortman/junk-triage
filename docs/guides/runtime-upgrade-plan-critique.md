# Runtime Upgrade Plan Assessment

**Date:** 2025-10-15
**Assessment of:** [runtime-upgrade-plan.md](runtime-upgrade-plan.md)

## 🟡 VERDICT: Good Foundation, But Needs Critical Updates

The plan's **methodology is sound**, but it has **two critical flaws** that need correction before execution.

---

## ✅ What the Plan Gets RIGHT

### Strong Methodology
1. **Isolation Strategy** - Separate directory + dedicated branch prevents contaminating production
2. **Incremental Approach** - One dependency group at a time reduces blast radius
3. **Continuous Validation** - Lint/type-check/test after each upgrade catches issues early
4. **Staging Verification** - Pre-production Azure deployment before cutover
5. **Small Commits** - Easy rollback if things go wrong
6. **Regular Rebasing** - Keeps upgrade branch synchronized with production changes

These practices align with industry best practices for runtime migrations.

---

## ❌ CRITICAL FLAW #1: Outdated Target Version

**The plan proposes Node 20, which is already obsolete.**

### Current State (October 2025):
- **Your Dockerfile**: Node 18.20.4 (EOL approaching)
- **Your package.json**: `@types/node: ^20` (inconsistent with Docker)

### Node.js LTS Status (October 2025):
- **Node 24**: Just entered LTS (October 2025) - Supported until April 2028
- **Node 22 "Jod"**: Active LTS - Supported until April 2027
- **Node 20 "Iron"**: ⚠️ **Maintenance LTS** (security fixes only) - EOL April 2026

### The Problem:
**Upgrading to Node 20 means you'll be on a maintenance-only version immediately.** You'll need another upgrade in 6-12 months when security support ends.

### Recommendation:
**Target Node 22 (Active LTS)** as the primary goal, or **Node 24** if you want maximum longevity.

```dockerfile
# Instead of:
ARG NODE_VERSION=20.x.x

# Use:
ARG NODE_VERSION=22.x.x  # Active LTS, supported until April 2027
# OR
ARG NODE_VERSION=24.x.x  # Just entered LTS, supported until April 2028
```

---

## ❌ CRITICAL FLAW #2: Insufficient Project-Specific Validation

The plan mentions generic validation (`npm run lint`, `npm test`) but **doesn't account for your project's specific complexity and risk factors.**

### Your Project's Unique Risks:
Based on the codebase analysis:
1. **15,000+ lines of custom form engine** - Complex conditional logic, binding paths
2. **Three deployment modes** - Prisma Dev, Docker Postgres, Azure Production
3. **History of data loss incident** - Production data was lost and had to be recovered
4. **Custom PDF exports** (@react-pdf/renderer) - May have Node version dependencies
5. **Azure-specific integrations** - Blob storage, App Service configurations
6. **Prisma 6.x** - Database client generation may have Node version requirements

### Missing Validation Steps:

The plan should explicitly include:

```bash
# 4a. Test ALL deployment modes (not just one)
npm run prisma:dev       # Prisma Dev mode
docker-compose up        # Docker Postgres mode
# Test Azure connection  # Production mode

# 4b. Functional regression tests for critical paths
- Dynamic form builder UI (create/edit/delete forms)
- Form submission flow (all question types)
- PDF export generation (@react-pdf/renderer compatibility)
- Excel export (exceljs compatibility)
- Prisma migrations (run test migrations)
- Azure Blob storage operations
- Form conditional logic rendering
- Calculated metrics evaluation

# 4c. Database safety validation
- Test Prisma client generation with new Node version
- Verify seed scripts don't trigger purges (SEED_ALLOW_PURGE checks)
- Confirm migration rollback procedures work
- Backup production data before ANY deployment
```

---

## 📊 Current Dependency Status

Dependencies are **mostly current** with only **minor version updates** available:

| Package | Current | Latest | Breaking? |
|---------|---------|--------|-----------|
| Next.js | 15.5.3 | 15.5.5 | ❌ No |
| React | 19.1.0 | 19.2.0 | ❌ No |
| Prisma | 6.16.2 | 6.17.1 | ❌ No |
| TypeScript | 5.9.2 | 5.9.3 | ❌ No |

**Good news:** These are all minor/patch updates, so breaking changes should be minimal.

---

## ✅ What Should Be ADDED to the Plan

### 1. Update Target Version Section (Step 2)
```markdown
## 2. Environment Baseline
- Pin Node 22 LTS (or Node 24) via `.nvmrc`/Volta/CI configs
- Update Dockerfile: ARG NODE_VERSION=22.x.x (Active LTS)
- Document why Node 22 was chosen (Active LTS until April 2027)
- Note: Skip Node 20 (already in Maintenance LTS as of Oct 2025)
```

### 2. Add Project-Specific Validation (Step 5)
```markdown
## 5. Functional Regression Testing
After dependency upgrades, test these critical paths:
- [ ] Form Builder UI (create/edit/delete forms in /admin/form-builder)
- [ ] Dynamic form rendering (all question types: text, radio, checkbox, etc.)
- [ ] Form submission end-to-end (save to DB, verify audit logs)
- [ ] PDF export generation (verify @react-pdf/renderer works)
- [ ] Excel export (verify exceljs compatibility)
- [ ] Calculated metrics (scoring logic still evaluates correctly)
- [ ] Prisma client regeneration (`npx prisma generate`)
- [ ] Database migrations (`npx prisma migrate dev`)
- [ ] Azure Blob storage operations (if using in form attachments)

Test ALL THREE deployment modes:
- [ ] Prisma Dev Server (local, npm run prisma:dev)
- [ ] Docker Postgres (docker-compose up)
- [ ] Azure Production (staging slot deployment)
```

### 3. Add Safety Checklist (Step 7)
```markdown
## 7. Pre-Production Safety Verification
- [ ] Full database backup of production (Azure SQL backup or pg_dump)
- [ ] Verify SEED_ALLOW_PURGE=false in all envs (prevent data loss)
- [ ] Test migration rollback procedure in staging
- [ ] Document rollback plan (how to revert if deployment fails)
- [ ] Smoke test: Submit a test form in staging, verify it persists
- [ ] Load test: Verify form builder performance (custom engine may be sensitive)
```

---

## 🎯 Recommended Modifications

### Option A: Node 22 (Recommended)
- **Target**: Node 22.x (Active LTS)
- **Support**: Until April 2027 (~2.5 years)
- **Risk**: Low (mature, widely adopted)
- **Effort**: Same as Node 20 upgrade

### Option B: Node 24 (Future-Proof)
- **Target**: Node 24.x (Just entered LTS October 2025)
- **Support**: Until April 2028 (~3.5 years)
- **Risk**: Slightly higher (newer, less battle-tested)
- **Effort**: May encounter more edge cases

**Recommendation: Start with Node 22** (proven Active LTS), then evaluate Node 24 in 6-12 months when it's more mature.

---

## Final Assessment

### Is the Plan Safe?
**✅ The methodology is safe**
**❌ The target version is outdated**
**⚠️ The validation strategy is too generic for this project's complexity**

### What You Should Do:
1. **Update the plan** to target Node 22 (not Node 20)
2. **Add project-specific validation steps** (form builder, PDF exports, three deployment modes)
3. **Add explicit safety checks** (database backups, rollback procedures, SEED_ALLOW_PURGE verification)
4. **Then execute the plan** - the methodology itself is solid

### Risk Level After Corrections:
🟢 **LOW RISK** - Incremental approach + comprehensive validation = safe upgrade path
